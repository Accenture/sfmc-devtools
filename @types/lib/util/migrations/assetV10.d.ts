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
 * @typedef {object} AssetV10MigrationReport
 * @property {string[]} moved destination paths of the asset files that were relocated
 * @property {string[]} conflicts owner paths left in place because their move set collided
 * @property {string[]} skipped owner paths whose metadata JSON could not be read
 * @property {Object.<string, string[]>} unmapped owner paths without a current group, keyed by assetType.name
 * @property {string[]} unremovedEmptyDirs directories that hold only empty subdirectories or no entries but the OS did not allow removing
 * @property {string[]} unremovedNonEmptyDirs directories that still hold non-directory entries (including links and special entries) and must not be deleted
 */
/**
 * Migrates historical asset groupings inside one selected BU retrieve tree.
 *
 * @param {string} assetRoot selected BU retrieve asset directory
 * @returns {Promise.<AssetV10MigrationReport>} migration report
 */
export function migrateAssetV10Tree(assetRoot: string): Promise<AssetV10MigrationReport>;
export type AssetV10MigrationReport = {
    /**
     * destination paths of the asset files that were relocated
     */
    moved: string[];
    /**
     * owner paths left in place because their move set collided
     */
    conflicts: string[];
    /**
     * owner paths whose metadata JSON could not be read
     */
    skipped: string[];
    /**
     * owner paths without a current group, keyed by assetType.name
     */
    unmapped: {
        [x: string]: string[];
    };
    /**
     * directories that hold only empty subdirectories or no entries but the OS did not allow removing
     */
    unremovedEmptyDirs: string[];
    /**
     * directories that still hold non-directory entries (including links and special entries) and must not be deleted
     */
    unremovedNonEmptyDirs: string[];
};
//# sourceMappingURL=assetV10.d.ts.map