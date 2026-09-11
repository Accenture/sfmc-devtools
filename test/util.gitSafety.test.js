import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { simpleGit } from 'simple-git';
import {
    establishGitSafety,
    recheckGitSafety,
    assertCommittedSources,
} from '../lib/util/migrations/gitSafety.js';

describe('migration Git safety', function () {
    // Real Git subprocesses need a bounded integration budget on Windows and CI.
    this.timeout(30_000);
    let root;
    let git;
    let options;

    /**
     * Create fixture objects and update only the temporary repository ref.
     *
     * @param {string} [parent] parent commit
     * @returns {Promise.<string>} fixture commit ID
     */
    async function baseline(parent) {
        await git.add(['--all']);
        const tree = (await git.raw(['write-tree'])).trim();
        const head = (
            await git.raw(['commit-tree', tree, ...(parent ? ['-p', parent] : []), '-m', 'fixture'])
        ).trim();
        await git.raw(['update-ref', 'HEAD', head]);
        return head;
    }

    beforeEach(async () => {
        root = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'mcdev-git-safety-')));
        git = simpleGit({ baseDir: root, config: ['core.autocrlf=false', 'commit.gpgsign=false'] });
        await git.init();
        await git.addConfig('user.name', 'Jörn Berkefeld', false, 'local');
        await git.addConfig('user.email', 'joern.berkefeld@gmail.com', false, 'local');
        await git.raw(['symbolic-ref', 'HEAD', 'refs/heads/fixture']);
        await fs.mkdir(path.join(root, 'retrieve/cred/bu'), { recursive: true });
        await fs.writeFile(path.join(root, 'retrieve/cred/bu/source.json'), '{}');
        await fs.writeFile(path.join(root, 'outside'), 'baseline');
        await fs.writeFile(path.join(root, '.gitignore'), '*.ignored\n');
        await baseline();
        options = { projectRoot: root, buPath: 'retrieve/cred/bu', git };
    });

    afterEach(async () => {
        await fs.rm(root, { recursive: true, force: true });
    });

    it('returns a named clean snapshot and verifies committed sources', async () => {
        const snapshot = await establishGitSafety(options);
        assert.equal(snapshot.branch, 'fixture');
        assert.equal(snapshot.repoRoot, root);
        assert.equal(snapshot.head, (await git.revparse(['HEAD'])).trim());
        await recheckGitSafety(snapshot, git);
        await assertCommittedSources(snapshot, ['source.json'], git);
    });

    for (const state of ['unstaged', 'staged', 'untracked']) {
        // Each state must independently block migration.
        it(`rejects ${state} files outside the selected BU`, async () => {
            await fs.writeFile(
                path.join(root, state === 'untracked' ? 'new-file' : 'outside'),
                'dirty'
            );
            if (state === 'staged') {
                await git.add(['outside']);
            }
            await assert.rejects(
                establishGitSafety(options),
                /Commit your work before running mcdev migrate\./
            );
        });
    }

    it('rejects conflicted index entries without an operation marker', async () => {
        const base = (await git.revparse(['HEAD'])).trim();
        await fs.writeFile(path.join(root, 'outside'), 'ours');
        const ours = await baseline(base);
        await fs.writeFile(path.join(root, 'outside'), 'theirs');
        const theirs = await baseline(base);
        await git.raw(['read-tree', '--reset', ours]);
        await git.raw(['read-tree', '-i', '-m', base, ours, theirs]);
        assert.match(await git.raw(['status', '--porcelain']), /UU outside/);
        await assert.rejects(establishGitSafety(options), /Commit your work/);
    });

    it('rejects submodule dirtiness despite ignore configuration', async () => {
        const parent = (await git.revparse(['HEAD'])).trim();
        await git.clone(root, path.join(root, 'child'));
        await fs.writeFile(
            path.join(root, '.gitmodules'),
            '[submodule "child"]\n\tpath = child\n\turl = ./child\n'
        );
        await baseline(parent);
        await git.addConfig('submodule.child.ignore', 'all', false, 'local');
        await establishGitSafety(options);
        await fs.writeFile(path.join(root, 'child', 'untracked'), 'dirty');
        await assert.rejects(establishGitSafety(options), /Commit your work/);
    });

    it('rejects dirty state appearing after the snapshot', async () => {
        const snapshot = await establishGitSafety(options);
        await fs.writeFile(path.join(root, 'outside'), 'dirty');
        await assert.rejects(recheckGitSafety(snapshot, git), /Commit your work/);
    });

    it('rejects a changed HEAD even when the tree remains clean', async () => {
        const snapshot = await establishGitSafety(options);
        await baseline(snapshot.head);
        await assert.rejects(recheckGitSafety(snapshot, git), /branch or HEAD changed/);
    });

    it('rejects a changed branch with the same HEAD', async () => {
        const snapshot = await establishGitSafety(options);
        await git.checkoutBranch('other', snapshot.head);
        await assert.rejects(recheckGitSafety(snapshot, git), /branch or HEAD changed/);
    });

    it('rejects detached HEAD', async () => {
        await git.checkout(['--detach']);
        await assert.rejects(establishGitSafety(options), /named, committed branch/);
    });

    it('rejects unborn branches and nonrepositories', async () => {
        await git.raw(['symbolic-ref', 'HEAD', 'refs/heads/unborn']);
        await assert.rejects(establishGitSafety(options), /named, committed branch/);
        await fs.rm(path.join(root, '.git'), { recursive: true });
        await assert.rejects(establishGitSafety(options), /Git repository/);
    });

    it('rejects paths outside the repository and nested repositories', async () => {
        await assert.rejects(
            establishGitSafety({ ...options, buPath: '../outside' }),
            /inside the repository/
        );
        await assert.rejects(
            establishGitSafety({ ...options, buPath: '.' }),
            /inside the repository/
        );
        await simpleGit(path.join(root, options.buPath)).init();
        await assert.rejects(establishGitSafety(options), /different Git repository/);
    });

    it('rejects symlink ancestors even if they point within the repository', async () => {
        await fs.symlink(path.join(root, 'retrieve'), path.join(root, 'alias'), 'junction');
        await assert.rejects(
            establishGitSafety({ ...options, buPath: 'alias/cred/bu' }),
            /Unsafe migration path/
        );
    });

    for (const marker of [
        'MERGE_HEAD',
        'rebase-merge',
        'rebase-apply',
        'CHERRY_PICK_HEAD',
        'REVERT_HEAD',
        'sequencer',
        'BISECT_START',
    ]) {
        // Each state must independently block migration.
        it(`rejects pending ${marker}`, async () => {
            await fs.writeFile(path.join(root, '.git', marker), 'pending');
            await assert.rejects(establishGitSafety(options), /pending Git operation/);
        });
    }

    it('rejects ignored sources lacking a committed baseline', async () => {
        await fs.writeFile(path.join(root, options.buPath, 'hidden.ignored'), 'ignored');
        const snapshot = await establishGitSafety(options);
        await assert.rejects(
            assertCommittedSources(snapshot, ['hidden.ignored'], git),
            /no committed regular-file baseline/
        );
        await assert.rejects(
            assertCommittedSources(snapshot, ['../outside'], git),
            /inside the repository/
        );
    });
});
