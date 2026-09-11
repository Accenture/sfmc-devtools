/**
 * Match Asset's space-delimited extension cleanup and validate the resulting token.
 * Invalid or absent extensions never establish a binary ownership boundary.
 *
 * @param {unknown} extension raw fileProperties.extension
 * @returns {string|undefined} safe cleaned extension
 */
export function cleanAssetExtension(extension: unknown): string | undefined;
/**
 * Create invocation-local, read-only committed asset evidence access.
 * All methods require a full immutable commit ID and an exact Git-relative BU asset root.
 * No subtype mapping, key decoding, or worktree reads occur here.
 * Inventory returns {commit, assetRoot, entries, owners, extractedJson, diagnostics,
 * associations}; associations[path] contains status, candidates, owner, relativeComponent,
 * reason. A resolved metadata component is null; nested children retain their relative
 * path; flat children retain the exact suffix after the observed owner stem (including
 * its leading dot). No suffix is normalized here. Non-resolved components are undefined.
 * Dedicated directories require matching observed directory/metadata stems. Other nested
 * layouts and unsupported flat formats remain unresolved; this is not a packaging manifest.
 * Extracted JSON inside a dedicated directory is not indexed by embedded payload identity;
 * a second dedicated metadata boundary instead produces explicit ownership ambiguity.
 * Entries are {path, relativePath, mode, type, oid}; owners add {customerKey,
 * assetTypeName, observedSubtype, metadataSuffixSubtype}. Identity comes only from JSON.
 * diagnostics are {code, path, message}, or duplicate-owner {code, customerKey, paths}.
 * Callers must handle diagnostics before interpreting missing/unique owners as safe actions.
 * Promise caches deduplicate concurrent reads by [commit, root] and blob OID within this
 * accessor only. Rejections remain cached. Returned snapshots/buffers are defensive copies.
 *
 * @param {{raw: (commands: string[]) => PromiseLike<string>, binaryCatFile: (commands: string[]) => PromiseLike<Buffer>}} git repository-scoped client
 * @returns {object} inventory(commit, assetRoot), readBlob(commit, assetRoot, path),
 * findOwners(commit, assetRoot, customerKey), associate(commit, assetRoot, path)
 */
export function createGitAssetTree(git: {
    raw: (commands: string[]) => PromiseLike<string>;
    binaryCatFile: (commands: string[]) => PromiseLike<Buffer>;
}): object;
//# sourceMappingURL=gitAssetTree.d.ts.map