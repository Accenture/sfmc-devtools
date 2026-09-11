import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { simpleGit } from 'simple-git';
import { createGitAssetTree } from '../lib/util/gitAssetTree.js';

const assetRoot = 'nested/retrieve [literal]/cred/BU/asset';
const ownerPath = `${assetRoot}/email/encoded%25.dot ü/nested/observed.asset-email-meta.json`;
const metadata = { customerKey: 'logical%key/NOT-the-filename', assetType: { name: 'htmlemail' } };

describe('committed asset endpoint evidence', function () {
    // Real Git subprocesses need a bounded integration budget on Windows and CI.
    this.timeout(30_000);
    let root;
    let git;

    beforeEach(async () => {
        root = await fs.mkdtemp(path.join(os.tmpdir(), 'mcdev-asset-tree-'));
        git = simpleGit({
            baseDir: root,
            config: ['core.autocrlf=false', 'commit.gpgsign=false'],
            unsafe: { allowUnsafeHooksPath: true },
        });
        await git.init();
        await git.addConfig('user.name', 'Jörn Berkefeld', false, 'local');
        await git.addConfig('user.email', 'joern.berkefeld@gmail.com', false, 'local');
        await git.addConfig('core.hooksPath', path.join(root, 'no-hooks'), false, 'local');
    });

    afterEach(async () => {
        await fs.rm(root, { recursive: true, force: true });
    });

    /**
     * Write one isolated fixture.
     *
     * @param {string} name Git-relative file
     * @param {string|Buffer} contents fixture bytes
     * @returns {Promise.<void>} completion
     */
    async function write(name, contents) {
        await fs.mkdir(path.dirname(path.join(root, name)), { recursive: true });
        await fs.writeFile(path.join(root, name), contents);
    }

    /**
     * Commit in the temporary repo only.
     *
     * @returns {Promise.<string>} immutable commit
     */
    async function commit() {
        await git.add(['--all']);
        await git.commit('fixture');
        return (await git.revparse(['HEAD'])).trim();
    }

    it('indexes JSON identity and literal nested paths, not filenames or worktree contents', async () => {
        await write(ownerPath, JSON.stringify(metadata));
        const base = await commit();
        await write(ownerPath, JSON.stringify({ ...metadata, customerKey: 'next' }));
        const target = await commit();
        await write(ownerPath, 'dirty invalid JSON');
        await git.add(['--all']);
        const access = createGitAssetTree(git);
        const first = await access.inventory(base, assetRoot);
        assert.equal(first.owners[0].customerKey, metadata.customerKey);
        assert.equal(first.owners[0].assetTypeName, 'htmlemail');
        assert.equal(first.owners[0].path, ownerPath);
        assert.equal(first.owners[0].observedSubtype, 'email');
        assert.equal(first.owners[0].metadataSuffixSubtype, 'email');
        assert.equal(first.owners[0].mode, '100644');
        assert.equal(first.owners[0].type, 'blob');
        assert.match(first.owners[0].oid, /^[\da-f]{40}$/);
        assert.equal((await access.inventory(target, assetRoot)).owners[0].customerKey, 'next');
        assert.equal(
            (await access.findOwners(base, assetRoot, metadata.customerKey)).status,
            'resolved'
        );
        assert.equal((await access.associate(base, assetRoot, ownerPath)).status, 'resolved');
        assert.equal((await access.findOwners(base, assetRoot, 'observed')).status, 'unresolved');
    });

    it('surfaces duplicates and malformed candidates while distinguishing extracted JSON', async () => {
        await write(ownerPath, JSON.stringify(metadata));
        await write(
            `${assetRoot}/arbitrary/other.asset-any-observed-meta.json`,
            JSON.stringify(metadata)
        );
        await write(`${assetRoot}/email/bad.asset-email-meta.json`, '{');
        await write(
            `${assetRoot}/email/partial.asset-email-meta.json`,
            '{"customerKey":"partial"}'
        );
        const extracted = `${assetRoot}/email/child.asset-email-meta.json`;
        await write(extracted, '{"content":"extracted"}');
        await write(`${assetRoot}/email/not-owner.asset-email-meta.json.extra`, '{');
        const sha = await commit();
        const access = createGitAssetTree(git);
        const inventory = await access.inventory(sha, assetRoot);
        assert.equal(inventory.owners.length, 2);
        assert.deepEqual(inventory.extractedJson, [extracted]);
        assert.deepEqual(inventory.diagnostics.map((item) => item.code).toSorted(), [
            'duplicate-owner',
            'invalid-owner-identity',
            'unreadable-metadata',
        ]);
        assert.equal(
            (await access.findOwners(sha, assetRoot, metadata.customerKey)).status,
            'ambiguous'
        );
        assert.equal((await access.associate(sha, assetRoot, ownerPath)).status, 'ambiguous');
        const child = await access.associate(sha, assetRoot, extracted);
        assert.equal(child.status, 'unresolved');
        assert.equal(child.reason, 'companion-classification-required');
    });

    it('associates removed nested children from immutable endpoints, not payload identities', async () => {
        const directory = `${assetRoot}/email/encoded%25.dot ü`;
        const owner = `${directory}/encoded%25.dot ü.asset-email-meta.json`;
        const child = `${directory}/blocks/views.html.slots.[main-1].asset-email-meta.html`;
        const payload = `${directory}/content.asset-email-meta.json`;
        await write(owner, JSON.stringify(metadata));
        await write(child, '<p>old content</p>');
        await write(
            payload,
            JSON.stringify({ customerKey: 'not-an-owner', assetType: { name: 'htmlblock' } })
        );
        const old = await commit();
        await fs.unlink(path.join(root, child));
        const next = await commit();
        const access = createGitAssetTree(git);
        const result = await access.associate(old, assetRoot, child);
        assert.equal(result.status, 'resolved');
        assert.equal(result.owner.path, owner);
        assert.equal(
            result.relativeComponent,
            'blocks/views.html.slots.[main-1].asset-email-meta.html'
        );
        assert.equal((await access.associate(next, assetRoot, child)).status, 'unresolved');
        assert.equal(
            (await access.findOwners(next, assetRoot, metadata.customerKey)).status,
            'resolved'
        );
        assert.equal((await access.associate(old, assetRoot, payload)).owner.path, owner);
        const inventory = await access.inventory(old, assetRoot);
        assert.equal(inventory.owners.length, 1);
        assert.deepEqual(inventory.extractedJson, [payload]);
        result.owner.customerKey = 'changed';
        assert.equal(
            (await access.associate(old, assetRoot, child)).owner.customerKey,
            metadata.customerKey
        );
    });

    it('uses exact flat stems and binary metadata, leaving unsupported webpage layouts unresolved', async () => {
        const prefix = `${assetRoot}/webstudio/a%25`;
        const codeOwner = `${prefix}.asset-webstudio-meta.json`;
        await write(
            codeOwner,
            JSON.stringify({ customerKey: 'a%', assetType: { name: 'jscoderesource' } })
        );
        await write(`${prefix}.asset-webstudio-meta.js`, 'code');
        await write(
            `${prefix}2.asset-webstudio-meta.json`,
            JSON.stringify({ customerKey: 'a%2', assetType: { name: 'jscoderesource' } })
        );
        await write(`${prefix}2.asset-webstudio-meta.js`, 'other code');
        await write(`${prefix}.extra.asset-webstudio-meta.js`, 'orphan');
        const binaryOwner = `${assetRoot}/images/picture.asset-images-meta.json`;
        await write(
            binaryOwner,
            JSON.stringify({
                customerKey: 'binary/key',
                assetType: { name: 'png' },
                fileProperties: { extension: 'png (4) ' },
            })
        );
        await write(`${assetRoot}/images/picture.png`, Buffer.from([0, 255]));
        await write(
            `${assetRoot}/webstudio/page.asset-webstudio-meta.json`,
            JSON.stringify({ customerKey: 'page', assetType: { name: 'webpage' } })
        );
        const unsupported = `${assetRoot}/webstudio/page.asset-webstudio-meta.html`;
        await write(unsupported, 'flat webpage is not an Asset._mergeCode layout');
        const sha = await commit();
        const access = createGitAssetTree(git);
        const code = await access.associate(sha, assetRoot, `${prefix}.asset-webstudio-meta.js`);
        assert.equal(code.owner.path, codeOwner);
        assert.equal(code.relativeComponent, '.asset-webstudio-meta.js');
        assert.equal(
            (await access.associate(sha, assetRoot, `${prefix}2.asset-webstudio-meta.js`)).owner
                .customerKey,
            'a%2'
        );
        assert.equal(
            (await access.associate(sha, assetRoot, `${prefix}.extra.asset-webstudio-meta.js`))
                .status,
            'unresolved'
        );
        const binary = await access.associate(sha, assetRoot, `${assetRoot}/images/picture.png`);
        assert.equal(binary.owner.path, binaryOwner);
        assert.equal(binary.relativeComponent, '.png');
        const unresolved = await access.associate(sha, assetRoot, unsupported);
        assert.equal(unresolved.status, 'unresolved');
        assert.equal(unresolved.diagnostics.at(-1).code, 'companion-classification-required');
        assert.equal(
            (await access.associate(sha, assetRoot, `${assetRoot}2/images/picture.png`)).status,
            'unresolved'
        );
    });

    it('does not associate binary companions with invalid cleaned extension tokens', async () => {
        for (const [index, extension] of [' png', 'png.evil (4)'].entries()) {
            const stem = `${assetRoot}/images/invalid${index}`;
            await write(
                `${stem}.asset-images-meta.json`,
                JSON.stringify({
                    customerKey: `invalid${index}`,
                    assetType: { name: 'png' },
                    fileProperties: { extension },
                })
            );
            await write(`${stem}.${extension.split(' ', 1)[0] || 'png'}`, 'not safely owned');
        }
        const sha = await commit();
        const inventory = await createGitAssetTree(git).inventory(sha, assetRoot);
        for (const entry of inventory.entries.filter(
            (item) => item.type === 'blob' && !item.path.endsWith('-meta.json')
        )) {
            assert.equal(inventory.associations[entry.path].status, 'unresolved');
        }
    });

    it('blocks duplicate and overlapping ownership and malformed dedicated metadata', async () => {
        const directory = `${assetRoot}/email/outer`;
        const owner = `${directory}/outer.asset-email-meta.json`;
        await write(owner, JSON.stringify(metadata));
        const inner = `${directory}/inner/inner.asset-email-meta.json`;
        await write(inner, JSON.stringify({ ...metadata, customerKey: 'inner' }));
        const child = `${directory}/inner/content.asset-email-meta.html`;
        await write(child, 'overlap');
        const bad = `${assetRoot}/email/bad/bad.asset-email-meta.json`;
        await write(bad, '{');
        const payload = `${assetRoot}/email/bad/content.asset-email-meta.json`;
        await write(payload, JSON.stringify(metadata));
        const sha = await commit();
        const access = createGitAssetTree(git);
        assert.equal((await access.associate(sha, assetRoot, child)).status, 'ambiguous');
        assert.equal((await access.associate(sha, assetRoot, inner)).status, 'ambiguous');
        const badResult = await access.associate(sha, assetRoot, payload);
        assert.equal(badResult.status, 'unresolved');
        assert.ok(badResult.diagnostics.some((item) => item.code === 'unreadable-metadata'));
        assert.equal((await access.inventory(sha, assetRoot)).owners.length, 2);
        await write(`${assetRoot}/email/copy.asset-email-meta.json`, JSON.stringify(metadata));
        const duplicate = await commit();
        assert.equal((await access.associate(duplicate, assetRoot, owner)).status, 'ambiguous');
    });

    it('reports symbolic-link metadata without following it', async () => {
        await write(ownerPath, JSON.stringify(metadata));
        await commit();
        const oid = (await git.revparse([`HEAD:${ownerPath}`])).trim();
        await git.raw(['update-index', '--add', '--cacheinfo', `120000,${oid},${ownerPath}`]);
        await git.commit('link fixture');
        const sha = (await git.revparse(['HEAD'])).trim();
        const inventory = await createGitAssetTree(git).inventory(sha, assetRoot);
        assert.equal(inventory.owners.length, 0);
        assert.equal(inventory.diagnostics[0].code, 'unsafe-metadata-mode');
        assert.equal(inventory.entries.find((entry) => entry.path === ownerPath).mode, '120000');
    });

    it('caches concurrent scoped reads and bytes, isolates BUs, and preserves modes', async () => {
        await write(ownerPath, JSON.stringify(metadata));
        const binaryPath = `${assetRoot}/email/raw.bin`;
        const binary = Buffer.from([0, 255, 128, 13, 10]);
        await write(binaryPath, binary);
        const otherRoot = 'nested/retrieve [literal]/cred/BU2/asset';
        await write(`${otherRoot}/email/other.asset-email-meta.json`, '{');
        await write(`${assetRoot}-outside/email/other.asset-email-meta.json`, '{');
        await commit();
        await git.raw(['update-index', '--chmod=+x', binaryPath]);
        await git.commit('executable fixture');
        const sha = (await git.revparse(['HEAD'])).trim();
        const calls = [];
        const access = createGitAssetTree({
            raw: async (args) => {
                calls.push(args);
                return git.raw(args);
            },
            binaryCatFile: async (args) => {
                calls.push(args);
                return git.binaryCatFile(args);
            },
        });
        const [one, two] = await Promise.all([
            access.inventory(sha, assetRoot),
            access.inventory(sha, assetRoot),
        ]);
        assert.deepEqual(one, two);
        assert.equal(calls.filter((args) => args[0] === 'ls-tree').length, 1);
        assert.equal(one.diagnostics.length, 0);
        assert.equal(one.entries.find((entry) => entry.path === binaryPath).mode, '100755');
        assert.ok(one.entries.some((entry) => entry.type === 'tree'));
        one.owners[0].customerKey = 'mutated';
        assert.equal(
            (await access.inventory(sha, assetRoot)).owners[0].customerKey,
            metadata.customerKey
        );
        const bytes = await access.readBlob(sha, assetRoot, binaryPath);
        assert.deepEqual(bytes, binary);
        bytes.fill(0);
        assert.deepEqual(await access.readBlob(sha, assetRoot, binaryPath), binary);
        assert.equal(calls.filter((args) => args[0] === 'blob').length, 2);
        assert.equal((await access.inventory(sha, otherRoot)).diagnostics.length, 1);
        assert.equal(calls.filter((args) => args[0] === 'ls-tree').length, 2);
        assert.ok(
            calls
                .filter((args) => args[0] === 'ls-tree')
                .every((args) => args.at(-1).startsWith(':(literal)'))
        );
        await assert.rejects(
            access.readBlob(sha, assetRoot, `${otherRoot}/email/other.asset-email-meta.json`)
        );
        assert.equal((await access.inventory(sha, 'absent/cred/BU/asset')).entries.length, 0);
        for (const invalid of [
            '/asset',
            '../asset',
            'retrieve//asset',
            'retrieve/./asset',
            String.raw`retrieve\asset`,
        ]) {
            await assert.rejects(access.inventory(sha, invalid));
        }
        await assert.rejects(access.inventory('HEAD', assetRoot));
    });
});
