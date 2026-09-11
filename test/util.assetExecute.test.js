import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { planAssetMigration } from '../lib/util/migrations/v10/assetPlan.js';
import { executeAssetMigration } from '../lib/util/migrations/execute.js';

describe('local asset migration executor', () => {
    let root;
    let assetRoot;

    beforeEach(async () => {
        root = await fs.mkdtemp(path.join(os.tmpdir(), 'mcdev-execute-'));
        assetRoot = path.join(root, 'asset');
        await fs.mkdir(assetRoot);
    });

    afterEach(async () => {
        await fs.rm(root, { recursive: true, force: true });
    });

    /**
     * Write an isolated asset file.
     *
     * @param {string} relative asset-relative path
     * @param {string|Buffer} bytes file content
     * @returns {Promise.<void>} completion
     */
    async function write(relative, bytes) {
        const filename = path.join(assetRoot, relative);
        await fs.mkdir(path.dirname(filename), { recursive: true });
        await fs.writeFile(filename, bytes);
    }

    /**
     * Create a simple movable owner.
     *
     * @param {string} [key] asset key
     * @param {string} [group] asset group
     * @returns {Promise.<void>} completion
     */
    async function owner(key = 'key', group = 'message') {
        await write(
            `${group}/${key}.asset-${group}-meta.json`,
            JSON.stringify({ customerKey: key, assetType: { name: 'message' } })
        );
    }

    it('preserves nested email and binary bytes/modes, removes empty source ancestors, and reruns', async () => {
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
            '<html>\r\nraw</html>'
        );
        await write(
            'message/binary.asset-message-meta.json',
            JSON.stringify({
                customerKey: 'binary',
                assetType: { name: 'message' },
                fileProperties: { extension: 'png' },
            })
        );
        await write('message/binary.png', Buffer.from([0, 255, 128, 13, 10]));
        await fs.mkdir(path.join(assetRoot, 'unrelated/empty'), { recursive: true });
        const plan = await planAssetMigration(assetRoot);
        const bytes = await Promise.all(
            plan.moves.map((move) => fs.readFile(path.join(assetRoot, move.source)))
        );
        const result = await executeAssetMigration(plan);
        assert.equal(result.movedFiles, 4);
        assert.deepEqual(result.cleanupErrors, []);
        for (const [index, move] of plan.moves.entries()) {
            assert.deepEqual(
                await fs.readFile(path.join(assetRoot, move.destination)),
                bytes[index]
            );
            assert.equal(
                (await fs.stat(path.join(assetRoot, move.destination))).mode,
                move.fingerprint.mode
            );
            await assert.rejects(fs.stat(path.join(assetRoot, move.source)), { code: 'ENOENT' });
        }
        await assert.rejects(fs.stat(path.join(assetRoot, 'message')), { code: 'ENOENT' });
        assert.ok((await fs.stat(path.join(assetRoot, 'unrelated/empty'))).isDirectory());
        assert.equal(
            (await executeAssetMigration(await planAssetMigration(assetRoot))).movedFiles,
            0
        );
    });

    it('leaves empty, missing, and already-current asset roots untouched', async () => {
        assert.equal(
            (await executeAssetMigration(await planAssetMigration(assetRoot))).movedFiles,
            0
        );
        await fs.rmdir(assetRoot);
        assert.equal(
            (await executeAssetMigration(await planAssetMigration(assetRoot))).movedFiles,
            0
        );
        await assert.rejects(fs.stat(assetRoot), { code: 'ENOENT' });
        await fs.mkdir(assetRoot);
        await owner('current', 'email');
        assert.equal(
            (await executeAssetMigration(await planAssetMigration(assetRoot))).movedFiles,
            0
        );
    });

    it('rejects stale inventories and tampered paths before any writes', async () => {
        await owner();
        const plan = await planAssetMigration(assetRoot);
        const altered = structuredClone(plan);
        altered.moves[0].destination = '../escaped.json';
        await assert.rejects(executeAssetMigration(altered), /plan changed/);
        await write('other/new.txt', 'new');
        await assert.rejects(executeAssetMigration(plan), /plan changed/);
        await assert.rejects(fs.stat(path.join(assetRoot, 'email')), { code: 'ENOENT' });
    });

    it('rejects an existing identical destination without removing either copy', async () => {
        await owner();
        const plan = await planAssetMigration(assetRoot);
        const move = plan.moves[0];
        const bytes = await fs.readFile(path.join(assetRoot, move.source));
        await write(move.destination, bytes);
        await assert.rejects(executeAssetMigration(plan), /collision|Duplicate/);
        assert.deepEqual(await fs.readFile(path.join(assetRoot, move.source)), bytes);
        assert.deepEqual(await fs.readFile(path.join(assetRoot, move.destination)), bytes);
    });

    it('rolls back completed operations in reverse after a mid-move failure', async () => {
        await owner('a');
        await owner('b');
        const plan = await planAssetMigration(assetRoot);
        let calls = 0;
        await assert.rejects(
            executeAssetMigration(plan, {
                link: async (source, destination) => {
                    if (++calls === 2) {
                        throw new Error('injected link failure');
                    }
                    await fs.link(source, destination);
                },
            }),
            /rollback completed.*injected link failure/
        );
        for (const move of plan.moves) {
            assert.ok((await fs.stat(path.join(assetRoot, move.source))).isFile());
            await assert.rejects(fs.stat(path.join(assetRoot, move.destination)), {
                code: 'ENOENT',
            });
        }
        await assert.rejects(fs.stat(path.join(assetRoot, 'email')), { code: 'ENOENT' });
    });

    it('rolls back the new link when source unlink fails', async () => {
        await owner();
        const plan = await planAssetMigration(assetRoot);
        await assert.rejects(
            executeAssetMigration(plan, {
                unlink: async () => {
                    throw new Error('injected unlink failure');
                },
            }),
            /rollback completed.*injected unlink failure/
        );
        assert.ok((await fs.stat(path.join(assetRoot, plan.moves[0].source))).isFile());
        await assert.rejects(fs.stat(path.join(assetRoot, plan.moves[0].destination)), {
            code: 'ENOENT',
        });
    });

    it('never overwrites an intervening destination created at exclusive link time', async () => {
        await owner();
        const plan = await planAssetMigration(assetRoot);
        await assert.rejects(
            executeAssetMigration(plan, {
                link: async (source, destination) => {
                    await fs.writeFile(destination, 'intervening');
                    await fs.link(source, destination);
                },
            }),
            /rollback completed.*EEXIST/
        );
        assert.equal(
            await fs.readFile(path.join(assetRoot, plan.moves[0].destination), 'utf8'),
            'intervening'
        );
        assert.ok((await fs.stat(path.join(assetRoot, plan.moves[0].source))).isFile());
    });

    for (const changed of ['source', 'destination']) {
        // Both sides must remain protected during reverse execution.

        it(`reports incomplete rollback and preserves an intervening ${changed}`, async () => {
            await owner('a');
            await owner('b');
            const plan = await planAssetMigration(assetRoot);
            let calls = 0;
            await assert.rejects(
                executeAssetMigration(plan, {
                    link: async (source, destination) => {
                        if (++calls === 2) {
                            await write(plan.moves[0][changed], 'intervening');
                            throw new Error('injected later failure');
                        }
                        await fs.link(source, destination);
                    },
                }),
                /Rollback incomplete; manual recovery required/
            );
            assert.equal(
                await fs.readFile(path.join(assetRoot, plan.moves[0][changed]), 'utf8'),
                'intervening'
            );
            assert.ok((await fs.stat(path.join(assetRoot, plan.moves[0].destination))).isFile());
        });
    }

    it('rejects a symlink destination parent without writing outside the asset root', async () => {
        await owner();
        const plan = await planAssetMigration(assetRoot);
        const outside = path.join(root, 'outside');
        await fs.mkdir(outside);
        await fs.symlink(outside, path.join(assetRoot, 'email'), 'junction');
        await assert.rejects(executeAssetMigration(plan), /Unsafe migration path/);
        assert.deepEqual(await fs.readdir(outside), []);
    });

    it('detects changed destination bytes and preserves them for explicit manual recovery', async () => {
        await owner();
        const plan = await planAssetMigration(assetRoot);
        await assert.rejects(
            executeAssetMigration(plan, {
                link: async (source, destination) => {
                    await fs.link(source, destination);
                    await fs.writeFile(destination, 'changed bytes');
                },
            }),
            /Rollback incomplete; manual recovery required/
        );
        assert.equal(
            await fs.readFile(path.join(assetRoot, plan.moves[0].destination), 'utf8'),
            'changed bytes'
        );
        assert.ok((await fs.stat(path.join(assetRoot, plan.moves[0].source))).isFile());
    });

    it('verifies source changes between operations and retains untouched owners', async () => {
        await owner('a');
        await owner('b');
        await write(
            'asset/live.asset-asset-meta.json',
            JSON.stringify({ customerKey: 'live', assetType: { name: 'asset' } })
        );
        const plan = await planAssetMigration(assetRoot);
        assert.ok(plan.owners.length > plan.moves.length);
        await assert.rejects(
            executeAssetMigration(plan, {
                unlink: async (source) => {
                    await fs.unlink(source);
                    await write(plan.moves[1].source, 'intervening');
                },
            }),
            /rollback completed.*file changed/
        );
        assert.equal(
            await fs.readFile(path.join(assetRoot, plan.moves[1].source), 'utf8'),
            'intervening'
        );
        assert.ok(
            (await fs.stat(path.join(assetRoot, 'asset/live.asset-asset-meta.json'))).isFile()
        );
    });
});
