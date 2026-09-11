import fs from 'node:fs/promises';
import path from 'node:path';
import { simpleGit } from 'simple-git';

const dirtyMessage = 'Commit your work before running mcdev migrate.';

/**
 * Require lexical containment, excluding the repository root itself.
 *
 * @param {string} root repository root
 * @param {string} filename selected absolute path
 * @returns {string} relative path
 */
function contained(root, filename) {
    const relative = path.relative(root, filename);
    if (
        !relative ||
        relative === '..' ||
        relative.startsWith(`..${path.sep}`) ||
        path.isAbsolute(relative)
    ) {
        throw new Error(`Migration path must be inside the repository: ${filename}`);
    }
    return relative;
}

/**
 * Reject symlink ancestors, returning the nearest existing directory.
 *
 * @param {string} filename absolute directory or file
 * @returns {Promise.<string>} existing directory
 */
async function safeAncestors(filename) {
    const parent = path.dirname(filename);
    const ancestor = parent === filename ? filename : await safeAncestors(parent);
    try {
        const stat = await fs.lstat(filename);
        if (stat.isSymbolicLink() || (!stat.isDirectory() && !stat.isFile())) {
            throw new Error(`Unsafe migration path: ${filename}`);
        }
        return stat.isDirectory() ? filename : ancestor;
    } catch (ex) {
        if (ex.code === 'ENOENT') {
            return ancestor;
        }
        throw ex;
    }
}

/**
 * Establish a read-only, whole-repository safety snapshot. Relative BU paths use projectRoot.
 * Ignored files are intentionally left to planner collision checks and assertCommittedSources.
 *
 * @param {object} options scoped inputs
 * @param {string} options.projectRoot project directory
 * @param {string} options.buPath configured selected BU directory
 * @param {import('simple-git').SimpleGit} [options.git] Git client scoped to projectRoot
 * @returns {Promise.<{projectRoot: string, repoRoot: string, buPath: string, branch: string, head: string}>} display and confirmation snapshot
 */
export async function establishGitSafety({ projectRoot, buPath, git = simpleGit(projectRoot) }) {
    projectRoot = path.resolve(projectRoot);
    await safeAncestors(projectRoot);
    projectRoot = await fs.realpath(projectRoot);
    let repoRoot;
    let branch;
    let head;
    try {
        repoRoot = path.resolve((await git.raw(['rev-parse', '--show-toplevel'])).trim());
        branch = (await git.raw(['symbolic-ref', '--quiet', '--short', 'HEAD'])).trim();
        head = (await git.raw(['rev-parse', '--verify', 'HEAD^{commit}'])).trim();
        if (!branch || !/^[\da-f]+$/.test(head)) {
            throw new Error('Missing named branch or committed HEAD.');
        }
    } catch (ex) {
        throw new Error('mcdev migrate requires a Git repository with a named, committed branch.', {
            cause: ex,
        });
    }
    buPath = path.resolve(projectRoot, buPath);
    const existingDirectory = await safeAncestors(buPath);
    const directory = await fs.realpath(existingDirectory);
    buPath = path.resolve(directory, path.relative(existingDirectory, buPath));
    contained(repoRoot, buPath);
    const selectedRoot = path.resolve(
        (await git.raw(['-C', directory, 'rev-parse', '--show-toplevel'])).trim()
    );
    if (selectedRoot !== repoRoot) {
        throw new Error('Selected BU belongs to a different Git repository.');
    }
    const gitDirectory = (await git.raw(['rev-parse', '--absolute-git-dir'])).trim();
    for (const marker of [
        'MERGE_HEAD',
        'rebase-merge',
        'rebase-apply',
        'CHERRY_PICK_HEAD',
        'REVERT_HEAD',
        'sequencer',
        'BISECT_START',
    ]) {
        const markerPath = path.join(gitDirectory, marker);
        try {
            await fs.lstat(markerPath);
        } catch (ex) {
            if (ex.code === 'ENOENT') {
                continue;
            }
            throw ex;
        }
        throw new Error(
            `Finish the pending Git operation (${marker}) before running mcdev migrate. ${dirtyMessage}`
        );
    }
    const status = await git.raw([
        '--no-optional-locks',
        'status',
        '--porcelain=v1',
        '-z',
        '--untracked-files=all',
        '--ignore-submodules=none',
    ]);
    if (status.length) {
        throw new Error(dirtyMessage);
    }
    return Object.freeze({ projectRoot, repoRoot, buPath, branch, head });
}

/**
 * Recheck repository identity, branch, HEAD, operations, paths and whole-tree cleanliness.
 *
 * @param {Awaited<ReturnType<typeof establishGitSafety>>} snapshot preview snapshot
 * @param {import('simple-git').SimpleGit} [git] scoped Git client
 * @returns {Promise.<void>} completion or safety error
 */
export async function recheckGitSafety(snapshot, git = simpleGit(snapshot.projectRoot)) {
    const current = await establishGitSafety({ ...snapshot, git });
    if (
        current.repoRoot !== snapshot.repoRoot ||
        current.branch !== snapshot.branch ||
        current.head !== snapshot.head
    ) {
        throw new Error(
            'Git branch or HEAD changed after migration preview. Run mcdev migrate again.'
        );
    }
}

/**
 * Require each manifest source to be a regular committed blob inside the selected BU.
 * Invoke for every source before mutation; paths are absolute or relative to snapshot.buPath.
 * Planner remains responsible for bytes, modes, source fingerprints and ignored collisions.
 *
 * @param {Awaited<ReturnType<typeof establishGitSafety>>} snapshot preview snapshot
 * @param {string[]} sources complete manifest source files
 * @param {import('simple-git').SimpleGit} [git] scoped Git client
 * @returns {Promise.<void>} completion or uncommitted-source error
 */
export async function assertCommittedSources(
    snapshot,
    sources,
    git = simpleGit(snapshot.projectRoot)
) {
    for (const source of sources) {
        const absolute = path.resolve(snapshot.buPath, source);
        contained(snapshot.buPath, absolute);
        await safeAncestors(absolute);
        const relative = contained(snapshot.repoRoot, absolute).split(path.sep).join('/');
        const entry = await git.raw([
            '-C',
            snapshot.repoRoot,
            '--literal-pathspecs',
            'ls-tree',
            '-z',
            snapshot.head,
            '--',
            relative,
        ]);
        const header = entry.slice(0, entry.indexOf('\t'));
        if (
            !/^100(?:644|755) blob [\da-f]+$/.test(header) ||
            entry.slice(entry.indexOf('\t') + 1) !== `${relative}\0`
        ) {
            throw new Error(
                `Migration source has no committed regular-file baseline: ${source}. ${dirtyMessage}`
            );
        }
    }
}
