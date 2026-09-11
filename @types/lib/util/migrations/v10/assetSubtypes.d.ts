/**
 * Resolve a documented v10 migration by the exact JSON assetType.name (IDs are not needed).
 *
 * @param {string} assetTypeName API asset type name, not a selector or customer key
 * @returns {{ oldSubtypes: string[], newSubtype: string } | null} migration or null for other types
 */
export function getAssetSubtypeMigration(assetTypeName: string): {
    oldSubtypes: string[];
    newSubtype: string;
} | null;
/**
 * Transform a caller-verified owner's component path relative to its BU's asset directory.
 * Paths use '/' separators, e.g. message/observed%2fkey/index.asset-message-meta.html.
 * Only the first (subtype) segment and an exact terminal metadata suffix can change.
 * Directory-only and suffix-only transitions are supported; current/nonmatching paths are identity.
 * No decoding, encoding, customerKey comparison, ownership discovery, or filesystem access occurs.
 * Callers must establish ownership and separately validate logical JSON customerKey identity,
 * encoding ambiguity, path containment, completeness, and collisions before using the result.
 *
 * @param {string} assetTypeName Owning JSON assetType.name
 * @param {string} assetRelativePath Observed POSIX path relative to the BU asset directory
 * @returns {string} transformed path, or the original string when not applicable
 */
export function transformAssetSubtypePath(assetTypeName: string, assetRelativePath: string): string;
//# sourceMappingURL=assetSubtypes.d.ts.map