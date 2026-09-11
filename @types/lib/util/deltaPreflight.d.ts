/**
 * Verify ALL selected surviving assets against the immutable destination snapshot.
 * Read-only: no staging, normalization, output, purge, or historical migration logic.
 * Callers must finish analysis and preflight for ALL mappings before reports/purge/build,
 * then use these exact files for copy/template inputs (and avoid intervening edits).
 * Deleted owners are intentionally not packaged. Non-asset inputs remain caller-owned.
 * Bytes are literal Git blob bytes: checkout CRLF/smudge transformations are rejected.
 * On Windows executable committed files are rejected because executable mode cannot be
 * verified from the worktree. Other platforms compare the executable bit directly.
 *
 * @param {object} input request
 * @param {import('simple-git').SimpleGit} input.git repository client
 * @param {string} input.repositoryRoot absolute worktree root
 * @param {object} input.analysis analyzeDelta result (comparison.target, selectedOwners)
 * @param {object} [input.access] committed asset accessor
 * @returns {Promise.<Map<string, string[]>>} owning Git metadata path -> verified absolute files
 */
export function preflightDelta({ git, repositoryRoot, analysis, access, }: {
    git: import("simple-git").SimpleGit;
    repositoryRoot: string;
    analysis: object;
    access?: object;
}): Promise<Map<string, string[]>>;
//# sourceMappingURL=deltaPreflight.d.ts.map