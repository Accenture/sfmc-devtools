/**
 * Analyze immutable source-BU changes, without worktree reads, reports, or writes.
 * Callers must finish analysis AND selected-input preflight for ALL mappings before
 * purge/build/report. This is not a packaging manifest or a worktree validator.
 * Removing the optional normalizer leaves ordinary ownership classification intact.
 * Ordinary records preserve acquired component statistics; synthesized and split
 * records recompute exact statistics from committed blobs before publication.
 *
 * @param {object} input request
 * @param {import('simple-git').SimpleGit} input.git repository client
 * @param {string} input.range comparison range
 * @param {string} input.retrieveRoot Git-relative configured retrieve root
 * @param {string[]} input.sourceBUs exact credential/BU pairs (not target BUs)
 * @param {object} [input.access] committed asset accessor
 * @param {(input: object) => Promise.<object>} [input.normalize] optional identity normalizer for retirement tests
 * @returns {Promise.<object>} comparison, changes (evidence/record/action), records,
 * selectedOwners, deletions, skipped, reportingNotes; throws with diagnostics on uncertainty
 */
export function analyzeDelta({ git, range, retrieveRoot, sourceBUs, access, normalize, }: {
    git: import("simple-git").SimpleGit;
    range: string;
    retrieveRoot: string;
    sourceBUs: string[];
    access?: object;
    normalize?: (input: object) => Promise<object>;
}): Promise<object>;
//# sourceMappingURL=deltaAnalysis.d.ts.map