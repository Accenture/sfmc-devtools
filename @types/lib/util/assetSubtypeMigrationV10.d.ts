/**
 * Normalize allowlisted committed layout transitions before actionable delta output.
 * Roots are exact Git-relative credential/BU asset directories, never repository roots.
 * Consumers MUST abort actionable output when diagnostics is nonempty. Associations are
 * generic endpoint evidence: base/target map component paths to accessor associations;
 * survivingOwners maps base owner paths to their verified target owner (even if suppressed).
 * No evidence is attached as public migration flags to ordinary change records.
 * Synthesized edited pairs use destination-only M records. Their statistics conservatively
 * sum source deletions and destination insertions, not a newly computed line diff.
 * Unrelated input records are returned unchanged, including their object identity.
 *
 * @param {object} input adapter request
 * @param {object[]} input.changes structured readGitDelta records
 * @param {{base: string, target: string}} input.comparison immutable endpoints
 * @param {string[]} input.assetRoots exact scoped asset roots
 * @param {object} input.access createGitAssetTree read-only accessor
 * @returns {Promise.<object>} {changes, skipped, diagnostics, associations}
 */
export function normalizeAssetSubtypeMigrationV10({ changes, comparison, assetRoots, access, }: {
    changes: object[];
    comparison: {
        base: string;
        target: string;
    };
    assetRoots: string[];
    access: object;
}): Promise<object>;
//# sourceMappingURL=assetSubtypeMigrationV10.d.ts.map