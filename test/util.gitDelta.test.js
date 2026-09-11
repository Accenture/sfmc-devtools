import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { simpleGit } from 'simple-git';
import { readGitDelta } from '../lib/util/gitDelta.js';

describe('committed Git delta acquisition', function () {
    // Real Git subprocesses need a bounded integration budget on Windows and CI.
    this.timeout(30_000);
    let root;
    let git;

    beforeEach(async () => {
        root = await fs.mkdtemp(path.join(os.tmpdir(), 'mcdev-git-delta-'));
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
     * Write a fixture without changing process cwd or shared mocks.
     *
     * @param {string} name literal relative path
     * @param {string|Buffer} content fixture contents
     * @returns {Promise.<void>} completion
     */
    async function write(name, content) {
        const filename = path.join(root, name);
        await fs.mkdir(path.dirname(filename), { recursive: true });
        await fs.writeFile(filename, content);
    }

    /**
     * Commit only the isolated temporary repository, never project code.
     *
     * @returns {Promise.<string>} commit ID
     */
    async function commit() {
        await git.add(['--all']);
        await git.commit('fixture');
        return (await git.revparse(['HEAD'])).trim();
    }

    it('reads generic query/script A/M/D changes and ignores dirty and staged contents', async () => {
        await write('query/example.query-meta.sql', 'SELECT 1\n');
        await write('script/deleted.script-meta.ssjs', 'old\n');
        const base = await commit();
        await git.branch(['prod']);
        await write('query/example.query-meta.sql', 'SELECT 2\nSELECT 3\n');
        await fs.rm(path.join(root, 'script/deleted.script-meta.ssjs'));
        await write('script/new.script-meta.ssjs', 'new\n');
        const target = await commit();
        const clean = await readGitDelta(git, 'prod');
        assert.deepEqual(clean.comparison, { base, target });
        assert.deepEqual(clean, await readGitDelta(git, `${base}..${target}`));
        assert.deepEqual(clean, await readGitDelta(git, 'prod..'));
        assert.deepEqual((await readGitDelta(git, '..prod')).comparison, {
            base: target,
            target: base,
        });
        const query = clean.changes.find((change) => change.status === 'M');
        assert.equal(query.oldPath, 'query/example.query-meta.sql');
        assert.equal(query.newPath, query.oldPath);
        assert.deepEqual(query.stats, { binary: false, insertions: 2, deletions: 1, changes: 3 });
        assert.match(query.oldOid, /^[\da-f]{40}$/);
        assert.equal(query.oldMode, '100644');
        const added = clean.changes.find((change) => change.status === 'A');
        const deleted = clean.changes.find((change) => change.status === 'D');
        assert.equal(added.oldPath, null);
        assert.equal(added.oldMode, '000000');
        assert.match(added.oldOid, /^0+$/);
        assert.equal(deleted.newPath, null);
        assert.equal(deleted.newMode, '000000');
        assert.deepEqual(added.stats, { binary: false, insertions: 1, deletions: 0, changes: 1 });
        assert.deepEqual(deleted.stats, { binary: false, insertions: 0, deletions: 1, changes: 1 });
        await write(query.newPath, 'dirty\n');
        await git.add(['--all']);
        await write('untracked', 'not committed');
        assert.deepEqual(await readGitDelta(git, 'prod'), clean);
        assert.deepEqual((await readGitDelta(git, 'HEAD..HEAD')).changes, []);
    });

    it('preserves detected renames and configured delete/add representations', async () => {
        const oldPath = 'query/old {literal = text} ü.sql';
        const newPath = 'query/new {literal = text} ü.sql';
        await write(oldPath, 'SELECT 1\n');
        const base = await commit();
        await fs.rename(path.join(root, oldPath), path.join(root, newPath));
        await commit();
        const renamed = (await readGitDelta(git, base)).changes;
        assert.equal(renamed.length, 1);
        assert.equal(renamed[0].status, 'R');
        assert.equal(renamed[0].similarity, 100);
        assert.equal(renamed[0].oldPath, oldPath);
        assert.equal(renamed[0].newPath, newPath);
        assert.deepEqual(renamed[0].stats, {
            binary: false,
            insertions: 0,
            deletions: 0,
            changes: 0,
        });
        await git.addConfig('diff.renames', 'false', false, 'local');
        const separate = (await readGitDelta(git, base)).changes;
        assert.deepEqual(separate.map((change) => change.status).toSorted(), ['A', 'D']);
    });

    it('preserves real copy records when the injected client enables copy detection', async () => {
        await write('source.sql', 'SELECT 1\n');
        const base = await commit();
        await write('copy.sql', 'SELECT 1\n');
        await commit();
        const client = {
            raw: (args) =>
                git.raw(
                    args[0] === 'diff'
                        ? ['diff', '-C', '--find-copies-harder', ...args.slice(1)]
                        : args
                ),
        };
        const { changes } = await readGitDelta(client, base);
        assert.equal(changes.length, 1);
        assert.equal(changes[0].status, 'C');
        assert.equal(changes[0].similarity, 100);
        assert.equal(changes[0].oldPath, 'source.sql');
        assert.equal(changes[0].newPath, 'copy.sql');
    });

    it('keeps meaningful mode-only changes with unchanged committed blobs', async () => {
        await write('script/job.sh', 'run\n');
        const base = await commit();
        await git.raw(['update-index', '--chmod=+x', '--', 'script/job.sh']);
        await git.commit('fixture executable mode');
        const { changes } = await readGitDelta(git, base);
        assert.equal(changes.length, 1);
        assert.equal(changes[0].status, 'M');
        assert.equal(changes[0].oldMode, '100644');
        assert.equal(changes[0].newMode, '100755');
        assert.equal(changes[0].oldOid, changes[0].newOid);
        assert.deepEqual(changes[0].stats, {
            binary: false,
            insertions: 0,
            deletions: 0,
            changes: 0,
        });
    });

    it('reads binary before/after sizes from cached committed OIDs and handles absent sides', async () => {
        await git.addConfig('diff.renames', 'false', false, 'local');
        await write('modified.bin', Buffer.from([0, 1, 2]));
        await write('deleted.bin', Buffer.from([0, 1, 2]));
        const base = await commit();
        await write('modified.bin', Buffer.from([0, 3, 4, 5]));
        await write('added.bin', Buffer.from([0, 3, 4, 5]));
        await fs.rm(path.join(root, 'deleted.bin'));
        await commit();
        await write('modified.bin', 'dirty text');
        const sizeCalls = [];
        const client = {
            raw: async (args) => {
                if (args[0] === 'cat-file') {
                    sizeCalls.push(args[2]);
                }
                return git.raw(args);
            },
        };
        const { changes } = await readGitDelta(client, base);
        assert.equal(sizeCalls.length, 2);
        assert.equal(new Set(sizeCalls).size, 2);
        assert.deepEqual(changes.find((change) => change.status === 'M').stats, {
            binary: true,
            before: 3,
            after: 4,
        });
        assert.deepEqual(changes.find((change) => change.status === 'A').stats, {
            binary: true,
            before: 0,
            after: 4,
        });
        assert.deepEqual(changes.find((change) => change.status === 'D').stats, {
            binary: true,
            before: 3,
            after: 0,
        });
    });

    it('uses the real merge base for divergent triple-dot comparisons and omitted endpoints', async () => {
        await write('common.sql', 'common\n');
        const ancestor = await commit();
        await git.checkoutLocalBranch('left');
        await write('left.sql', 'left\n');
        const left = await commit();
        await git.checkout(['-b', 'right', ancestor]);
        await write('right.sql', 'right\n');
        const right = await commit();
        const delta = await readGitDelta(git, 'left...right');
        assert.deepEqual(delta.comparison, { base: ancestor, target: right });
        assert.deepEqual(
            delta.changes.map((change) => change.newPath),
            ['right.sql']
        );
        assert.deepEqual(await readGitDelta(git, 'left...'), delta);
        assert.deepEqual((await readGitDelta(git, '...left')).comparison, {
            base: ancestor,
            target: left,
        });
        assert.deepEqual((await readGitDelta(git, 'left..right')).comparison, {
            base: left,
            target: right,
        });
        assert.equal((await readGitDelta(git, 'left..right')).changes.length, 2);
    });

    it('retains literal supported whitespace, Unicode, braces and backslash filenames', async () => {
        const names = ['leading space ü {a = b}.sql'];
        if (process.platform !== 'win32') {
            names.push('tab\tline\nquote"slash\\ trailing ');
        }
        await write('baseline', 'base\n');
        const base = await commit();
        for (const name of names) {
            await write(name, 'line\n');
        }
        await commit();
        assert.deepEqual(
            (await readGitDelta(git, base)).changes.map((change) => change.newPath).toSorted(),
            names.toSorted()
        );
    });

    it('joins reordered statistics by tuples and preserves copies separately from renames', async () => {
        const oid = 'a'.repeat(40);
        const header = `:100644 100644 ${oid} ${oid}`;
        const client = {
            raw: async (args) => {
                if (args[0] === 'rev-parse') {
                    return oid;
                }
                return args.includes('--raw')
                    ? `${header} R100\0old\t\n\\\0new\t\n\\\0${header} C075\0source\0copy\0`
                    : '3\t1\t\u{0}source\u{0}copy\u{0}0\t0\t\u{0}old\t\n\\\u{0}new\t\n\\\u{0}';
            },
        };
        const { changes } = await readGitDelta(client, 'base');
        assert.deepEqual(
            changes.map((change) => change.status),
            ['R', 'C']
        );
        assert.equal(changes[0].newPath, 'new\t\n\\');
        assert.equal(changes[0].stats.changes, 0);
        assert.equal(changes[1].similarity, 75);
        assert.deepEqual(changes[1].stats, {
            binary: false,
            insertions: 3,
            deletions: 1,
            changes: 4,
        });
    });
});
