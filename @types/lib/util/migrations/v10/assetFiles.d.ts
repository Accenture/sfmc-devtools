/**
 * Resolve one observed asset owner through Asset's existing companion resolver, without writes.
 * Unknown API names return null. Unsupported/ambiguous layouts throw and must block migration.
 * Caller must additionally check cross-owner identity/manifest collisions and Git cleanliness.
 *
 * @param {string} assetRoot absolute selected BU asset directory
 * @param {string} ownerPath observed POSIX metadata path relative to assetRoot
 * @param {boolean} [includeUnchanged] also resolve known canonical non-migrating owners
 * @returns {Promise.<{customerKey: string, assetTypeName: string, ownerPath: string, files: {source: string, destination: string}[]} | null>} owner and relative move candidates
 */
export function resolveAssetMigrationFiles(assetRoot: string, ownerPath: string, includeUnchanged?: boolean): Promise<{
    customerKey: string;
    assetTypeName: string;
    ownerPath: string;
    files: {
        source: string;
        destination: string;
    }[];
} | null>;
//# sourceMappingURL=assetFiles.d.ts.map