import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import {
    planAssetMigration,
    assertAssetMigrationPlanCurrent,
} from '../lib/util/migrations/v10/assetPlan.js';

describe('v10 selected BU asset planner', () => {
    let root;
    let assetRoot;

    beforeEach(async () => {
        root = await fs.mkdtemp(path.join(os.tmpdir(), 'mcdev-plan-'));
        assetRoot = path.join(root, 'asset');
        await fs.mkdir(assetRoot);
    });

    afterEach(async () => {
        await fs.rm(root, { recursive: true, force: true });
    });

    /**
     * Write one isolated fixture file.
     *
     * @param {string} relative relative filename
     * @param {string|Buffer} bytes fixture bytes
     * @returns {Promise.<void>} completion
     */
    async function write(relative, bytes) {
        const filename = path.join(assetRoot, relative);
        await fs.mkdir(path.dirname(filename), { recursive: true });
        await fs.writeFile(filename, bytes);
    }

    /**
     * Create a name-only owner without changing shared fixtures or Asset state.
     *
     * @param {string} subtype observed directory and suffix
     * @param {string} key customer key
     * @param {string} name API type
     * @returns {Promise.<string>} owner path
     */
    async function owner(subtype = 'message', key = 'key', name = 'message') {
        const relative = `${subtype}/${key}.asset-${subtype}-meta.json`;
        await write(relative, JSON.stringify({ customerKey: key, assetType: { name } }));
        return relative;
    }

    it('produces deterministic complete mixed-family moves and preserves every byte on disk', async () => {
        await owner();
        await owner('asset', 'mobile', 'jsonmessage');
        await owner('cloudpage', 'page', 'landingpage');
        await owner('coderesource', 'script', 'jscoderesource');
        const binaryOwner = 'message/binary.asset-message-meta.json';
        await write(
            binaryOwner,
            JSON.stringify({
                customerKey: 'binary',
                assetType: { name: 'message' },
                fileProperties: { extension: 'png' },
            })
        );
        const bytes = Buffer.from([0, 255, 128, 13, 10]);
        await write('message/binary.png', bytes);
        const plan = await planAssetMigration(assetRoot);
        assert.equal(plan.owners.length, 5);
        assert.equal(plan.moves.length, 6);
        assert.deepEqual(plan, await planAssetMigration(assetRoot));
        await assertAssetMigrationPlanCurrent(plan);
        const binary = plan.moves.find((move) => move.source.endsWith('.png'));
        assert.equal(binary.destination, 'email/binary.png');
        assert.equal(binary.fingerprint.sha256, createHash('sha256').update(bytes).digest('hex'));
        assert.equal(
            binary.fingerprint.mode,
            (await fs.stat(path.join(assetRoot, binary.source))).mode
        );
        assert.deepEqual(await fs.readFile(path.join(assetRoot, binary.source)), bytes);
        await assert.rejects(fs.stat(path.join(assetRoot, binary.destination)), { code: 'ENOENT' });
    });

    it('is a no-op for empty and already-current layouts', async () => {
        assert.deepEqual((await planAssetMigration(assetRoot)).moves, []);
        await owner('email');
        await owner('block', 'other', 'htmlblock');
        assert.deepEqual((await planAssetMigration(assetRoot)).moves, []);
    });

    it('plans a realistic mixed BU without moving or modifying legitimate live companions', async () => {
        await write(
            'image/logo.asset-image-meta.json',
            JSON.stringify({
                customerKey: 'logo',
                assetType: { name: 'png' },
                fileProperties: { extension: 'png' },
            })
        );
        await write('image/logo.png', Buffer.from([0, 255, 128]));
        await owner('template', 'layout', 'template');
        await write('template/layout.asset-template-meta.html', '<html>template</html>');
        await write(
            'asset/live.asset-asset-meta.json',
            JSON.stringify({
                customerKey: 'live',
                assetType: { name: 'asset' },
                fileProperties: { extension: 'bin' },
            })
        );
        await write('asset/live.bin', Buffer.from([255, 1, 2]));
        await write(
            'message/mail/mail.asset-message-meta.json',
            JSON.stringify({
                customerKey: 'mail',
                assetType: { name: 'htmlemail' },
                views: { html: {} },
            })
        );
        await write(
            'message/mail/views.html.content.asset-message-meta.html',
            '<html>email</html>'
        );
        await write(
            'asset/page/page.asset-asset-meta.json',
            JSON.stringify({
                customerKey: 'page',
                assetType: { name: 'webpage' },
                views: { html: {} },
            })
        );
        await write('asset/page/content.asset-asset-meta.html', '<html>page</html>');
        const plan = await planAssetMigration(assetRoot);
        assert.equal(plan.moves.length, 4);
        assert.ok(
            plan.moves.every(({ destination }) => /^(?:email|webstudio)\//.test(destination))
        );
        assert.equal(plan.owners.find(({ customerKey }) => customerKey === 'live').files.length, 2);
        for (const file of plan.inventory.filter(({ directory }) => !directory)) {
            assert.equal(
                createHash('sha256')
                    .update(await fs.readFile(path.join(assetRoot, file.source)))
                    .digest('hex'),
                file.sha256
            );
        }
        await assertAssetMigrationPlanCurrent(plan);
        // Simulate only the approved moves; rerunning is an idempotent no-op.
        for (const { source, destination } of plan.moves) {
            await fs.mkdir(path.dirname(path.join(assetRoot, destination)), { recursive: true });
            await fs.rename(path.join(assetRoot, source), path.join(assetRoot, destination));
        }
        const current = await planAssetMigration(assetRoot);
        assert.deepEqual(current.moves, []);
        await assertAssetMigrationPlanCurrent(current);
        await write('asset/live.bin', Buffer.from([255, 1, 3]));
        await assert.rejects(assertAssetMigrationPlanCurrent(current), /plan changed/);
    });

    it('returns a stable explicit no-assets result only for an existing BU', async () => {
        await fs.rmdir(assetRoot);
        const missing = await planAssetMigration(assetRoot);
        assert.equal(missing.assetRootExists, false);
        assert.deepEqual(missing.moves, []);
        await assertAssetMigrationPlanCurrent(missing);
        await fs.mkdir(assetRoot);
        await assert.rejects(assertAssetMigrationPlanCurrent(missing), /plan changed/);
        const empty = await planAssetMigration(assetRoot);
        assert.equal(empty.assetRootExists, true);
        await fs.rmdir(assetRoot);
        await assert.rejects(assertAssetMigrationPlanCurrent(empty), /plan changed/);
        await assert.rejects(planAssetMigration(path.join(root, 'missingBU', 'asset')), {
            code: 'ENOENT',
        });
        await fs.writeFile(assetRoot, 'not a directory');
        await assert.rejects(planAssetMigration(assetRoot), /asset directory/);
    });

    it('leaves unknown unrelated groups untouched but blocks unknown legacy candidates', async () => {
        await owner();
        await write(
            'future/unknown.asset-future-meta.json',
            JSON.stringify({ assetType: { name: 'futuretype' } })
        );
        await write('future/unknown.bin', 'untouched');
        const plan = await planAssetMigration(assetRoot);
        assert.equal(plan.moves.length, 1);
        await assertAssetMigrationPlanCurrent(plan);
        await owner('message', 'unknown', 'futuretype');
        await assert.rejects(planAssetMigration(assetRoot), /Unclassified.*message\/unknown/);
    });

    it('still blocks real broad legacy orphans alongside live and migrating owners', async () => {
        await owner('asset', 'live', 'asset');
        await owner('asset', 'page', 'webpage');
        await write('asset/orphan.asset-asset-meta.html', 'orphan');
        await assert.rejects(planAssetMigration(assetRoot), /Unaccounted historical/);
    });

    it('rejects identical destinations instead of treating them as already migrated', async () => {
        const source = await owner();
        await write(
            'email/key.asset-email-meta.json',
            await fs.readFile(path.join(assetRoot, source))
        );
        await assert.rejects(planAssetMigration(assetRoot), /destination|Duplicate customerKey/i);
    });

    it('rejects duplicate logical keys across distinct historical groups', async () => {
        await owner('asset', 'same', 'jsonmessage');
        await owner('message', 'same', 'jsonmessage');
        await assert.rejects(planAssetMigration(assetRoot), /Duplicate customerKey/);
    });

    it('rejects cross-owner case-folded future destination collisions', async () => {
        await owner('asset', 'Key', 'jsonmessage');
        await owner('message', 'key', 'jsonmessage');
        await assert.rejects(planAssetMigration(assetRoot), /destination collision/);
    });

    it('rejects file-as-directory destinations including ignored-looking local files', async () => {
        await owner();
        await write('email', 'not a directory');
        await assert.rejects(planAssetMigration(assetRoot), /ENOTDIR|collision/);
    });

    it('rejects unknown, malformed and partial-layout owners rather than silently omitting them', async () => {
        const filename = await owner('asset', 'unknown', 'futuretype');
        await assert.rejects(planAssetMigration(assetRoot), /Unclassified/);
        await write(filename, JSON.stringify({ assetType: { name: 'webpage' } }));
        await assert.rejects(planAssetMigration(assetRoot), /malformed/);
        await fs.rm(path.join(assetRoot, filename));
        await write(
            'email/key.asset-message-meta.json',
            JSON.stringify({ customerKey: 'key', assetType: { name: 'message' } })
        );
        await assert.rejects(planAssetMigration(assetRoot), /unsupported layout/);
    });

    it('rejects orphan historical files', async () => {
        await write('message/orphan.asset-message-meta.html', 'orphan');
        await assert.rejects(planAssetMigration(assetRoot), /Unaccounted/);
    });

    it('plans independent dotted owners without overlapping ownership', async () => {
        await owner('message', 'key');
        await owner('message', 'key.child');
        const plan = await planAssetMigration(assetRoot);
        assert.equal(plan.owners.length, 2);
        assert.deepEqual(
            plan.moves.map(({ source, destination, ownerPath }) => ({
                source,
                destination,
                ownerPath,
            })),
            ['key', 'key.child'].map((key) => ({
                source: `message/${key}.asset-message-meta.json`,
                destination: `email/${key}.asset-email-meta.json`,
                ownerPath: `message/${key}.asset-message-meta.json`,
            }))
        );
    });

    it('rechecks new destinations and meaningful file mode changes', async () => {
        const source = await owner();
        const plan = await planAssetMigration(assetRoot);
        await write('email/key.asset-email-meta.json', 'collision');
        await assert.rejects(
            assertAssetMigrationPlanCurrent(plan),
            /JSON|Unexpected|destination|malformed/
        );
        await fs.rm(path.join(assetRoot, 'email'), { recursive: true });
        await fs.chmod(path.join(assetRoot, source), 0o444);
        try {
            await assert.rejects(assertAssetMigrationPlanCurrent(plan), /plan changed/);
        } finally {
            await fs.chmod(path.join(assetRoot, source), 0o666);
        }
    });

    it('blocks unaccounted broad asset files without guessing their owner', async () => {
        await owner('asset', 'live', 'asset');
        await write('asset/unowned.bin', Buffer.from([255]));
        await assert.rejects(planAssetMigration(assetRoot), /Unaccounted/);
    });

    it('detects source edits, new companions and removed sources after planning', async () => {
        const source = await owner();
        const plan = await planAssetMigration(assetRoot);
        await write(source, (await fs.readFile(path.join(assetRoot, source), 'utf8')) + ' ');
        await assert.rejects(assertAssetMigrationPlanCurrent(plan), /plan changed/);
        const next = await planAssetMigration(assetRoot);
        await write('message/orphan.txt', 'new');
        await assert.rejects(assertAssetMigrationPlanCurrent(next), /Unaccounted/);
        await fs.rm(path.join(assetRoot, 'message/orphan.txt'));
        await fs.rm(path.join(assetRoot, source));
        await assert.rejects(assertAssetMigrationPlanCurrent(next), /plan changed/);
    });
});
