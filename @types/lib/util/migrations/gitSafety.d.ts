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
export function establishGitSafety({ projectRoot, buPath, git }: {
    projectRoot: string;
    buPath: string;
    git?: import("simple-git").SimpleGit;
}): Promise<{
    projectRoot: string;
    repoRoot: string;
    buPath: string;
    branch: string;
    head: string;
}>;
/**
 * Recheck repository identity, branch, HEAD, operations, paths and whole-tree cleanliness.
 *
 * @param {Awaited<ReturnType<typeof establishGitSafety>>} snapshot preview snapshot
 * @param {import('simple-git').SimpleGit} [git] scoped Git client
 * @returns {Promise.<void>} completion or safety error
 */
export function recheckGitSafety(snapshot: Awaited<ReturnType<typeof establishGitSafety>>, git?: import("simple-git").SimpleGit): Promise<void>;
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
export function assertCommittedSources(snapshot: Awaited<ReturnType<typeof establishGitSafety>>, sources: string[], git?: import("simple-git").SimpleGit): Promise<void>;
//# sourceMappingURL=gitSafety.d.ts.map