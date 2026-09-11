import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { simpleGit } from 'simple-git';
import { analyzeDelta } from '../lib/util/deltaAnalysis.js';

const retrieveRoot = 'nested/retrieve';
const bu = `${retrieveRoot}/cred/uat`;
const ownerPath = (subtype) =>
    `${bu}/asset/${subtype}/disk.token/disk.token.asset-${subtype}-meta.json`;
const childPath = (subtype) =>
    `${bu}/asset/${subtype}/disk.token/views.html.content.asset-${subtype}-meta.html`;
const metadata = JSON.stringify({
    customerKey: 'logical.key',
    name: 'Example',
    assetType: { name: 'htmlemail' },
});
const identity = async ({ changes }) => ({ changes, diagnostics: [], skipped: [] });

describe('read-only delta analysis', function () {
    // Real Git subprocesses need a bounded integration budget on Windows and CI.
    this.timeout(30_000);
    let root;
    let git;

    beforeEach(async () => {
        root = await fs.mkdtemp(path.join(os.tmpdir(), 'mcdev-delta-analysis-'));
        git = simpleGit({
            baseDir: root,
            config: ['core.autocrlf=false', 'commit.gpgsign=false'],
            unsafe: { allowUnsafeHooksPath: true },
        });
        await git.init();
        await git.addConfig('user.name', 'Jörn Berkefeld', false, 'local');
        await git.addConfig('user.email', 'joern.berkefeld@gmail.com', false, 'local');
        await git.addConfig('core.hooksPath', path.join(root, 'no-hooks'), false, 'local');
        await git.addConfig('diff.renames', 'true', false, 'local');
    });

    afterEach(async () => {
        await fs.rm(root, { recursive: true, force: true });
    });

    /**
     * Write an isolated fixture.
     *
     * @param {string} file relative path
     * @param {string|Buffer} content bytes
     * @returns {Promise.<void>} completion
     */
    async function write(file, content) {
        const destination = path.join(root, file);
        await fs.mkdir(path.dirname(destination), { recursive: true });
        await fs.writeFile(destination, content);
    }

    /**
     * Create only a temporary test-repository commit.
     *
     * @returns {Promise.<string>} immutable commit
     */
    async function commit() {
        await git.add(['--all']);
        await git.commit('fixture');
        return (await git.revparse(['HEAD'])).trim();
    }

    /**
     * Set up a legacy email then migrate its own committed contents.
     *
     * @param {string|Buffer} [content] destination body
     * @param {string|Buffer} [original] original committed body
     * @returns {Promise.<string>} base
     */
    async function migrate(content = 'original\n', original = 'original\n') {
        await write(ownerPath('message'), metadata);
        await write(childPath('message'), original);
        const base = await commit();
        await write(ownerPath('email'), metadata);
        await write(childPath('email'), content);
        await fs.rm(path.join(root, bu, 'asset/message'), { recursive: true });
        await commit();
        return base;
    }

    /**
     * Analyze only the same source BU across endpoints.
     *
     * @param {string} range range
     * @param {object} [options] overrides
     * @returns {Promise.<object>} analysis
     */
    function analyze(range, options = {}) {
        return analyzeDelta({ git, range, retrieveRoot, sourceBUs: ['cred/uat'], ...options });
    }

    for (const rename of ['true', 'false']) {
        // Both Git representations must produce the same logical classification.
        it(`suppresses migration-only changes with rename detection ${rename}`, async () => {
            const base = await migrate();
            await git.addConfig('diff.renames', rename, false, 'local');
            let calls = 0;
            const { normalizeAssetSubtypeMigrationV10 } =
                await import('../lib/util/assetSubtypeMigrationV10.js');
            const result = await analyze(base, {
                normalize: async (input) => {
                    calls++;
                    return normalizeAssetSubtypeMigrationV10(input);
                },
            });
            assert.equal(calls, 1);
            assert.equal(result.skipped.length, 2);
            assert.deepEqual(result.changes, []);
            assert.deepEqual(result.selectedOwners, []);
            assert.deepEqual(result.deletions, []);
            await write(childPath('email'), 'dirty\n');
            assert.deepEqual(await analyze(base), result);
        });

        it(`selects one logical update for edited migration with rename detection ${rename}`, async () => {
            const base = await migrate(
                'same\nmodified\nstill same\n',
                'same\noriginal\nstill same\n'
            );
            await git.addConfig('diff.renames', rename, false, 'local');
            const result = await analyze(base);
            assert.equal(result.selectedOwners.length, 1);
            assert.equal(result.selectedOwners[0].owner.path, ownerPath('email'));
            assert.deepEqual(result.deletions, []);
            assert.equal(result.records.length, 1);
            assert.equal(result.records[0].externalKey, 'logical.key');
            assert.equal(result.records[0].name, 'Example');
            assert.equal(result.records[0].gitAction, 'add/update');
            assert.deepEqual(result.changes[0].oldPaths, [childPath('message')]);
            assert.equal(result.records[0].insertions, 1);
            assert.equal(result.records[0].deletions, 1);
            assert.equal(result.records[0].changes, 2);
            assert.deepEqual(result.reportingNotes, []);
            await write(childPath('email'), 'dirty worktree must not affect counts\n');
            assert.deepEqual(await analyze(base), result);
        });
    }

    it('uses surviving migration owner for child-only removal', async () => {
        await write(ownerPath('message'), metadata);
        await write(childPath('message'), 'body\n');
        const base = await commit();
        await fs.rm(path.join(root, bu, 'asset/message'), { recursive: true });
        await write(ownerPath('email'), metadata);
        await commit();
        const result = await analyze(base);
        assert.equal(result.records.length, 1);
        assert.equal(result.records[0].gitAction, 'add/update');
        assert.equal(result.selectedOwners[0].owner.path, ownerPath('email'));
        assert.deepEqual(result.deletions, []);
    });

    it('keeps generic child deletion and true owner deletion after adapter retirement', async () => {
        await write(ownerPath('email'), metadata);
        await write(childPath('email'), 'body\n');
        const base = await commit();
        await fs.rm(path.join(root, childPath('email')));
        const middle = await commit();
        const child = await analyze(base, { normalize: identity });
        assert.equal(child.selectedOwners.length, 1);
        assert.equal(child.records[0].gitAction, 'add/update');
        assert.deepEqual(child.deletions, []);
        await fs.rm(path.join(root, ownerPath('email')));
        await commit();
        const deleted = await analyze(middle, { normalize: identity });
        assert.deepEqual(deleted.selectedOwners, []);
        assert.equal(deleted.deletions[0].owner.customerKey, 'logical.key');
        assert.equal(deleted.records[0].gitAction, 'delete');
    });

    it('rejects metadata-only deletion leaving unchanged former-owner HTML', async () => {
        await write(ownerPath('email'), metadata);
        await write(childPath('email'), 'unchanged body\n');
        const base = await commit();
        await fs.rm(path.join(root, ownerPath('email')));
        await commit();
        for (const options of [{}, { normalize: identity }]) {
            await assert.rejects(analyze(base, options), (error) =>
                /** @type {Error & {diagnostics?: object[]}} */ (error).diagnostics?.some(
                    (item) =>
                        item.code === 'orphaned-delta-component' && item.path === childPath('email')
                )
            );
        }
    });

    it('allows full owner deletion alongside unchanged unrelated unowned files', async () => {
        await write(ownerPath('email'), metadata);
        await write(childPath('email'), 'body\n');
        await write(`${bu}/asset/email/unowned.html`, 'unrelated\n');
        const base = await commit();
        await fs.rm(path.dirname(path.join(root, ownerPath('email'))), { recursive: true });
        await commit();
        const result = await analyze(base);
        assert.equal(result.deletions.length, 1);
        assert.equal(result.selectedOwners.length, 0);
        assert.equal(result.records.length, 2);
    });

    it('rejects exact same-path key trimming but permits unchanged keys and extracted JSON edits', async () => {
        const file = ownerPath('email').replaceAll('disk.token', 'key');
        const payload = childPath('email').replaceAll('disk.token', 'key').replace(/html$/, 'json');
        const data = { customerKey: ' key ', assetType: { name: 'htmlemail' } };
        await write(file, JSON.stringify(data));
        await write(payload, JSON.stringify({ ...data, customerKey: 'payload-before' }));
        const base = await commit();
        await write(file, JSON.stringify({ ...data, name: 'Updated' }));
        await write(payload, JSON.stringify({ ...data, customerKey: 'payload-after' }));
        const middle = await commit();
        const unchanged = await analyze(`${base}..${middle}`);
        assert.equal(unchanged.selectedOwners[0].owner.customerKey, ' key ');
        await write(file, JSON.stringify({ ...data, customerKey: 'key' }));
        await commit();
        for (const options of [{}, { normalize: identity }]) {
            await assert.rejects(analyze(middle, options), /customerKey.*manual handling/i);
        }
    });

    it('does not suppress unrelated asset renames or key changes', async () => {
        await write(ownerPath('email'), metadata);
        await write(childPath('email'), 'unchanged body\n');
        const base = await commit();
        const nextOwner = ownerPath('email').replaceAll('disk.token', 'renamed');
        const nextChild = childPath('email').replaceAll('disk.token', 'renamed');
        await write(
            nextOwner,
            JSON.stringify({
                customerKey: 'different-key',
                name: 'Example',
                assetType: { name: 'htmlemail' },
            })
        );
        await write(nextChild, 'unchanged body\n');
        await fs.rm(path.join(root, bu, 'asset/email/disk.token'), { recursive: true });
        await commit();
        const result = await analyze(base, { normalize: identity });
        assert.equal(result.deletions[0].owner.customerKey, 'logical.key');
        assert.equal(result.selectedOwners[0].owner.customerKey, 'different-key');
        const removal = result.records.find((record) => record.file === childPath('email'));
        const addition = result.records.find((record) => record.file === nextChild);
        assert.equal(removal.insertions, 0);
        assert.equal(removal.deletions, 1);
        assert.equal(addition.insertions, 1);
        assert.equal(addition.deletions, 0);
        assert.deepEqual(result.reportingNotes, []);
    });

    it('computes binary lengths for edited migration and split rename endpoints', async () => {
        const base = await migrate(Buffer.from([0, 2, 3]), Buffer.from([0, 1]));
        const migrated = await analyze(base);
        assert.equal(migrated.records[0].binary, true);
        assert.equal(migrated.records[0].before, 2);
        assert.equal(migrated.records[0].after, 3);
        const split = await analyze(base, { normalize: identity });
        const removed = split.records.find((record) => record.file === childPath('message'));
        const added = split.records.find((record) => record.file === childPath('email'));
        assert.equal(removed.before, 2);
        assert.equal(removed.after, 0);
        assert.equal(added.before, 0);
        assert.equal(added.after, 3);
    });

    it('reports zero content counts for a mode-only migrated component', async () => {
        await write(ownerPath('message'), metadata);
        await write(childPath('message'), 'same\n');
        const base = await commit();
        await write(ownerPath('email'), metadata);
        await write(childPath('email'), 'same\n');
        await fs.rm(path.join(root, bu, 'asset/message'), { recursive: true });
        await git.add(['--all']);
        await git.raw(['update-index', '--chmod=+x', childPath('email')]);
        await git.commit('fixture mode');
        const result = await analyze(base);
        assert.equal(result.records.length, 1);
        assert.equal(result.records[0].changes, 0);
        assert.equal(result.records[0].insertions, 0);
        assert.equal(result.records[0].deletions, 0);
        assert.deepEqual(result.reportingNotes, []);
    });

    it('preserves generic query counts and filters unsupported and ignored paths', async () => {
        const file = `${bu}/query/key.with.dots.query-meta.sql`;
        await write(file, 'same\nold\n');
        const base = await commit();
        await write(file, 'same\nnew\n');
        await write(`${bu}/unsupported/key.unsupported-meta.json`, '{}');
        await write(`${bu}/query/readme.md`, 'ignore');
        await write(`${bu}/query/key.error.log`, 'ignore');
        await commit();
        const result = await analyze(base);
        assert.equal(result.records.length, 1);
        assert.equal(result.records[0].externalKey, 'key.with.dots');
        assert.equal(result.records[0].insertions, 1);
        assert.equal(result.records[0].deletions, 1);
        assert.deepEqual(result.reportingNotes, []);
    });

    it('enriches metadata and known companions from committed registry name fields', async () => {
        await write('baseline.txt', 'baseline');
        const base = await commit();
        /** @type {[string, string, object, string[], string][]} */
        const fixtures = [
            ['query', 'dot.%25 ü', { name: 'Committed query' }, ['sql'], 'Committed query'],
            [
                'script',
                'script',
                { name: 'Committed script' },
                ['ssjs', 'html'],
                'Committed script',
            ],
            ['email', 'email', { Name: 'Classic email' }, ['html'], 'Classic email'],
            ['contentArea', 'area', { Name: 'Content area' }, ['html'], 'Content area'],
            [
                'dataExtension',
                'de',
                { Name: 'Uppercase field', name: 'Wrong' },
                [],
                'Uppercase field',
            ],
            ['list', 'list', { ListName: 'List label' }, [], 'List label'],
            [
                'attributeGroup',
                'group',
                { definitionName: { value: 'Nested label' } },
                [],
                'Nested label',
            ],
        ];
        const expected = new Map();
        for (const [type, key, data, extensions, name] of fixtures) {
            const stem = `${bu}/${type}/${key}.${type}-meta`;
            await write(stem + '.json', JSON.stringify(data));
            expected.set(stem + '.json', name);
            for (const extension of extensions) {
                await write(stem + '.' + extension, 'not metadata');
                expected.set(stem + '.' + extension, name);
            }
        }
        const target = await commit();
        for (const file of expected.keys()) {
            await write(file, '{"name":"Dirty worktree","Name":"Dirty worktree"}');
        }
        const result = await analyze(`${base}..${target}`, { normalize: identity });
        assert.equal(result.records.length, expected.size);
        for (const record of result.records) {
            assert.equal(record.name, expected.get(record.file));
            assert.equal(record.gitAction, 'add/update');
        }
    });

    it('enriches a companion-only edit without selecting unchanged metadata', async () => {
        const stem = `${bu}/query/only-child.query-meta`;
        await write(stem + '.json', '{"name":"Unchanged committed metadata"}');
        await write(stem + '.sql', 'old body\n');
        const base = await commit();
        await write(stem + '.sql', 'new body\n');
        await commit();
        await fs.rm(path.join(root, stem + '.json'));
        const result = await analyze(base, { normalize: identity });
        assert.equal(result.records.length, 1);
        assert.equal(result.records[0].file, stem + '.sql');
        assert.equal(result.records[0].name, 'Unchanged committed metadata');
    });

    it('does not parse symlink metadata blobs as display metadata', async () => {
        const file = `${bu}/query/link.query-meta.json`;
        await write('baseline.txt', 'baseline');
        const base = await commit();
        await write(file, '{"name":"Not regular metadata"}');
        await git.add(['--all']);
        const oid = (await git.raw(['rev-parse', `:${file}`])).trim();
        await git.raw(['update-index', '--cacheinfo', `120000,${oid},${file}`]);
        await git.commit('symlink fixture');
        const result = await analyze(base, { normalize: identity });
        assert.equal(result.records.length, 1);
        assert.equal(result.records[0].name, null);
    });

    it('uses endpoint names for changed companions and base names for deletions', async () => {
        const stem = `${bu}/query/key.query-meta`;
        await write(stem + '.json', '{"name":"Original committed name"}');
        await write(stem + '.sql', 'old body\n');
        const base = await commit();
        await write(stem + '.json', '{"name":"Target committed name"}');
        await write(stem + '.sql', 'new body\n');
        const target = await commit();
        await fs.rm(path.join(root, stem + '.sql'));
        const childDeleted = await commit();
        const removedChild = await analyze(`${target}..${childDeleted}`);
        assert.equal(removedChild.records[0].name, 'Target committed name');
        assert.equal(removedChild.records[0].gitAction, 'delete');
        await fs.rm(path.join(root, stem + '.json'));
        const deleted = await commit();
        await write(stem + '.json', '{"name":"Untracked impostor"}');
        const updated = await analyze(`${base}..${target}`);
        assert.equal(updated.records.length, 2);
        assert.ok(updated.records.every((record) => record.name === 'Target committed name'));
        const removed = await analyze(`${base}..${deleted}`);
        assert.equal(removed.records.length, 2);
        assert.ok(removed.records.every((record) => record.name === 'Original committed name'));
        assert.ok(removed.records.every((record) => record.gitAction === 'delete'));
    });

    it('leaves absent or unusable metadata unnamed without companion or worktree fallback', async () => {
        await write('baseline.txt', 'baseline');
        const base = await commit();
        for (const [key, content] of [
            ['missingName', '{}'],
            ['invalid', '{invalid'],
            ['null', 'null'],
            ['objectName', '{"name":{"value":"Not a string"}}'],
        ]) {
            await write(`${bu}/query/${key}.query-meta.json`, content);
            await write(`${bu}/query/${key}.query-meta.sql`, '{"name":"Companion impostor"}');
        }
        await write(`${bu}/query/absent.query-meta.sql`, '{"name":"Companion impostor"}');
        await write(`${bu}/query/nested/key.query-meta.json`, '{"name":"Unsupported nested"}');
        await write(`${bu}/query/missingName.query-meta.txt`, '{"name":"Unknown companion"}');
        await write(`${bu}/folder/nested/Folder.with.dots.folder-meta.json`, '{"Name":"Ignored"}');
        const target = await commit();
        await write(`${bu}/query/absent.query-meta.json`, '{"name":"Untracked impostor"}');
        const result = await analyze(`${base}..${target}`, { normalize: identity });
        assert.equal(result.records.length, 12);
        assert.ok(
            result.records
                .filter((record) => record.type !== 'folder')
                .every((record) => record.name === null)
        );
        const folder = result.records.find((record) => record.type === 'folder');
        assert.equal(folder.name, 'Folder');
        assert.equal(folder.externalKey, null);
    });

    it('preserves ordinary binary statistics from committed blobs', async () => {
        const file = `${bu}/query/binary.query-meta.sql`;
        await write(file, Buffer.from([0, 1]));
        const base = await commit();
        await write(file, Buffer.from([0, 2, 3]));
        await commit();
        const result = await analyze(base, { normalize: identity });
        assert.equal(result.records[0].binary, true);
        assert.equal(result.records[0].before, 2);
        assert.equal(result.records[0].after, 3);
        assert.deepEqual(result.reportingNotes, []);
        const middle = (await git.revparse(['HEAD'])).trim();
        const outside = file.replace('/cred/uat/', '/cred/prod/');
        await write(outside, Buffer.from([0, 2, 3]));
        await fs.rm(path.join(root, file));
        await commit();
        const removed = await analyze(middle, { normalize: identity });
        assert.equal(removed.records[0].before, 3);
        assert.equal(removed.records[0].after, 0);
        const added = await analyze(middle, { normalize: identity, sourceBUs: ['cred/prod'] });
        assert.equal(added.records[0].before, 0);
        assert.equal(added.records[0].after, 3);
        assert.deepEqual(added.reportingNotes, []);
    });

    it('blocks duplicate destination owners and missing owning metadata', async () => {
        const base = await migrate('edit\n');
        await write(`${bu}/asset/email/duplicate.asset-email-meta.json`, metadata);
        await commit();
        await assert.rejects(
            analyze(base),
            (error) =>
                error instanceof Error &&
                'diagnostics' in error &&
                Array.isArray(error.diagnostics) &&
                error.diagnostics.length > 0
        );
        await fs.rm(path.join(root, ownerPath('email')));
        await fs.rm(path.join(root, `${bu}/asset/email/duplicate.asset-email-meta.json`));
        await commit();
        await assert.rejects(
            analyze(base),
            (error) =>
                error instanceof Error &&
                'diagnostics' in error &&
                Array.isArray(error.diagnostics) &&
                error.diagnostics.length > 0
        );
    });

    it('compares the same source BU across environment branches, not target BU', async () => {
        await write(ownerPath('email'), metadata);
        await write(childPath('email'), 'prod source baseline\n');
        await write(`${retrieveRoot}/cred/prod/query/irrelevant.query-meta.sql`, 'old\n');
        await commit();
        await git.branch(['prod']);
        await git.checkoutLocalBranch('uat');
        await write(childPath('email'), 'uat pending\n');
        await write(`${retrieveRoot}/cred/prod/query/irrelevant.query-meta.sql`, 'new\n');
        await commit();
        const result = await analyze('prod', { normalize: identity });
        assert.equal(result.records.length, 1);
        assert.equal(result.records[0]._businessUnit, 'uat');
        assert.equal(result.selectedOwners[0].owner.customerKey, 'logical.key');
    });

    it('preserves generic query statistics and cross-BU rename boundary actions', async () => {
        const query = `${bu}/query/key.with.dots.query-meta.sql`;
        await write(query, 'SELECT 1\n');
        const base = await commit();
        await write(query, 'SELECT 2\nSELECT 3\n');
        const middle = await commit();
        const result = await analyze(base, { normalize: identity });
        assert.deepEqual(result.records[0], {
            binary: false,
            insertions: 2,
            deletions: 1,
            changes: 3,
            file: query,
            fromPath: '-',
            moved: false,
            type: 'query',
            _credential: 'cred',
            _businessUnit: 'uat',
            externalKey: 'key.with.dots',
            name: null,
            gitAction: 'add/update',
        });
        const outside = `${retrieveRoot}/cred/prod/query/key.with.dots.query-meta.sql`;
        await write(outside, 'SELECT 2\nSELECT 3\n');
        await fs.rm(path.join(root, query));
        await commit();
        const moved = await analyze(middle, { normalize: identity });
        assert.equal(moved.records.length, 1);
        assert.equal(moved.records[0].file, query);
        assert.equal(moved.records[0].gitAction, 'delete');
        assert.deepEqual(moved.reportingNotes, []);
        assert.equal(moved.records[0].insertions, 0);
        assert.equal(moved.records[0].deletions, 2);
        const arrival = await analyze(middle, { normalize: identity, sourceBUs: ['cred/prod'] });
        assert.equal(arrival.records[0].file, outside);
        assert.equal(arrival.records[0].gitAction, 'add/update');
    });
});
