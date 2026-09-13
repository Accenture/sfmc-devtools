/**
 * Finds the current group for an asset in a historical group.
 *
 * @param {string} assetTypeName owner JSON assetType.name
 * @param {string} oldGroup historical asset group
 * @returns {string | null} current group or null when no migration applies
 */
export function getCurrentAssetGroup(assetTypeName: string, oldGroup: string): string | null;
/**
 * Converts one historical asset path to its current-group path.
 *
 * @param {string} filePath normalized repository path
 * @param {string} oldGroup historical asset group
 * @param {string} currentGroup current asset group
 * @returns {string | null} mapped path or null when the path is outside that group
 */
export function mapAssetPath(filePath: string, oldGroup: string, currentGroup: string): string | null;
/**
 * Checks whether two asset paths form an allowlisted historical-to-current grouping pair.
 *
 * @param {string} oldPath historical path
 * @param {string} newPath current path
 * @returns {boolean} whether the paths are a structural regrouping pair
 */
export function isAssetRegroupingPair(oldPath: string, newPath: string): boolean;
/**
 * Migrates historical asset groupings inside one selected BU retrieve tree.
 *
 * @param {string} assetRoot selected BU retrieve asset directory
 * @returns {Promise.<{moved: string[], conflicts: string[], skipped: string[]}>} migration report
 */
export function migrateAssetV10Tree(assetRoot: string): Promise<{
    moved: string[];
    conflicts: string[];
    skipped: string[];
}>;
//# sourceMappingURL=assetV10.d.ts.map