import cliProgress from 'cli-progress';
import fs from 'fs-extra';
import path from 'node:path';

/**
 * @type {Object.<string, {currentGroup?: string, oldGroups: string[], assetTypes: string[]}>}
 */
const GROUP_MAPPINGS = {
    email: {
        oldGroups: ['message'],
        assetTypes: ['templatebasedemail', 'htmlemail', 'textonlyemail', 'message'],
    },
    mobile: {
        oldGroups: ['message', 'asset'],
        assetTypes: ['jsonmessage'],
    },
    webstudio: {
        oldGroups: ['asset'],
        assetTypes: ['webpage', 'webtemplate'],
    },
    webstudioCloudPage: {
        currentGroup: 'webstudio',
        oldGroups: ['cloudpage'],
        assetTypes: ['cloudpages', 'landingpage', 'microsite', 'interactivecontent'],
    },
    webstudioCodeResource: {
        currentGroup: 'webstudio',
        oldGroups: ['coderesource'],
        assetTypes: [
            'jscoderesource',
            'csscoderesource',
            'jsoncoderesource',
            'rsscoderesource',
            'textcoderesource',
            'xmlcoderesource',
        ],
    },
};

/**
 * Finds the current group for an asset in a historical group.
 *
 * @param {string} assetTypeName owner JSON assetType.name
 * @param {string} oldGroup historical asset group
 * @returns {string | null} current group or null when no migration applies
 */
export function getCurrentAssetGroup(assetTypeName, oldGroup) {
    for (const [mappingName, mapping] of Object.entries(GROUP_MAPPINGS)) {
        if (mapping.oldGroups.includes(oldGroup) && mapping.assetTypes.includes(assetTypeName)) {
            return mapping.currentGroup || mappingName;
        }
    }
    return null;
}

/**
 * Converts one historical asset path to its current-group path.
 *
 * @param {string} filePath normalized repository path
 * @param {string} oldGroup historical asset group
 * @param {string} currentGroup current asset group
 * @returns {string | null} mapped path or null when the path is outside that group
 */
export function mapAssetPath(filePath, oldGroup, currentGroup) {
    const normalized = filePath.replaceAll('\\', '/');
    const marker = `/asset/${oldGroup}/`;
    if (!normalized.includes(marker)) {
        return null;
    }
    return normalized
        .replace(marker, `/asset/${currentGroup}/`)
        .replaceAll(`.asset-${oldGroup}-meta.`, `.asset-${currentGroup}-meta.`);
}

/**
 * Checks whether two asset paths form an allowlisted historical-to-current grouping pair.
 *
 * @param {string} oldPath historical path
 * @param {string} newPath current path
 * @returns {boolean} whether the paths are a structural regrouping pair
 */
export function isAssetRegroupingPair(oldPath, newPath) {
    const normalizedNewPath = newPath.replaceAll('\\', '/');
    for (const [mappingName, mapping] of Object.entries(GROUP_MAPPINGS)) {
        const currentGroup = mapping.currentGroup || mappingName;
        for (const oldGroup of mapping.oldGroups) {
            if (mapAssetPath(oldPath, oldGroup, currentGroup) === normalizedNewPath) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Tests whether a path remains within a migration root.
 *
 * @param {string} root selected BU asset root
 * @param {string} candidate path to validate
 * @returns {boolean} whether candidate is inside root
 */
function isWithin(root, candidate) {
    const relative = path.relative(root, candidate);
    return (
        relative !== '' &&
        !relative.startsWith('..' + path.sep) &&
        relative !== '..' &&
        !path.isAbsolute(relative)
    );
}

/**
 * Builds the full owner and companion-file move set for one asset JSON.
 *
 * @param {string} assetRoot selected BU asset root
 * @param {string} ownerPath owner JSON path
 * @param {string} oldGroup historical asset group
 * @param {string} currentGroup current asset group
 * @returns {Promise.<{from: string, to: string}[]>} complete move set
 */
async function getOwnerMoveSet(assetRoot, ownerPath, oldGroup, currentGroup) {
    const oldGroupRoot = path.join(assetRoot, oldGroup);
    const ownerSuffix = `.asset-${oldGroup}-meta.json`;
    const ownerName = path.basename(ownerPath).slice(0, -ownerSuffix.length);
    const relativeOwner = path.relative(oldGroupRoot, ownerPath);
    const firstSegment = relativeOwner.split(path.sep)[0];
    const ownerIsNested = firstSegment === ownerName && relativeOwner.includes(path.sep);
    let sourcePaths;

    if (ownerIsNested) {
        const ownerRoot = path.join(oldGroupRoot, ownerName);
        sourcePaths = (await fs.readdir(ownerRoot, { recursive: true }))
            .map((entry) => path.join(ownerRoot, entry))
            .filter((source) => fs.statSync(source).isFile());
    } else {
        sourcePaths = (await fs.readdir(path.dirname(ownerPath)))
            .filter(
                (entry) =>
                    entry === `${ownerName}.asset-${oldGroup}-meta.json` ||
                    entry.startsWith(`${ownerName}.asset-${oldGroup}-meta.`)
            )
            .map((entry) => path.join(path.dirname(ownerPath), entry));
    }

    return sourcePaths.map((source) => ({
        from: source,
        to: /** @type {string} */ (mapAssetPath(source, oldGroup, currentGroup)),
    }));
}

/**
 * Removes one directory without ever throwing and records directories that survived.
 * Missing directories are ignored; EPERM/EBUSY are retried once without an artificial delay.
 *
 * @param {string} dir directory to remove
 * @param {Set.<string>} unremoved collects directories that could not be removed
 * @returns {Promise.<void>} -
 */
async function removeDirectorySafely(dir, unremoved) {
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            await fs.rmdir(dir);
            return;
        } catch (ex) {
            const code = ex?.code;
            if (code === 'ENOENT') {
                // already gone; nothing left to do
                return;
            }
            if (code !== 'EPERM' && code !== 'EBUSY') {
                // ENOTEMPTY or any other failure: record it instead of throwing
                unremoved.add(dir);
                return;
            }
        }
    }
    // the single EPERM/EBUSY retry did not help either
    unremoved.add(dir);
}

/**
 * Collects every directory below a root, ordered deepest first.
 *
 * @param {string} root directory to walk
 * @returns {Promise.<string[]>} collected directories, deepest first
 */
async function collectDirectoriesDeepestFirst(root) {
    const directories = [];
    /**
     * Lists one directory, skipping symlinks and branches that cannot be read.
     *
     * @param {string} dir directory to list
     * @returns {Promise.<void>} -
     */
    const walk = async (dir) => {
        let entries;
        try {
            entries = await fs.readdir(dir, { withFileTypes: true });
        } catch {
            // unreadable or vanished branch: skip it instead of aborting the whole sweep
            return;
        }
        for (const entry of entries) {
            if (!entry.isDirectory()) {
                // files, symlinks and other special entries are never swept
                continue;
            }
            const candidate = path.join(dir, entry.name);
            directories.push(candidate);
            await walk(candidate);
        }
    };
    await walk(root);
    // deepest first so child folders collapse before their parents are checked
    return directories.toSorted((a, b) => b.split(path.sep).length - a.split(path.sep).length);
}

/**
 * Removes a retired group tree bottom-up so that folders which were already empty before the
 * migration ran are pruned as well. Never removes anything outside the given group root.
 *
 * @param {string} oldGroupRoot historical asset group root to clear
 * @param {Set.<string>} unremoved collects directories that could not be removed
 * @returns {Promise.<void>} -
 */
async function sweepRetiredGroupRoot(oldGroupRoot, unremoved) {
    for (const dir of await collectDirectoriesDeepestFirst(oldGroupRoot)) {
        if (isWithin(oldGroupRoot, dir)) {
            await removeDirectorySafely(dir, unremoved);
        }
    }
}

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
export async function migrateAssetV10Tree(assetRoot) {
    const root = path.resolve(assetRoot);
    /** @type {AssetV10MigrationReport} */
    const report = {
        moved: [],
        conflicts: [],
        skipped: [],
        unmapped: {},
        unremovedEmptyDirs: [],
        unremovedNonEmptyDirs: [],
    };
    /** @type {Set.<string>} */
    const unremoved = new Set();

    if (!(await fs.pathExists(root))) {
        return report;
    }

    const oldGroups = [
        ...new Set(Object.values(GROUP_MAPPINGS).flatMap((mapping) => mapping.oldGroups)),
    ];
    for (const oldGroup of oldGroups) {
        const oldGroupRoot = path.join(root, oldGroup);
        if (!(await fs.pathExists(oldGroupRoot))) {
            continue;
        }
        const entries = await fs.readdir(oldGroupRoot, { recursive: true });
        const owners = entries
            .map((entry) => path.join(oldGroupRoot, entry))
            .filter((entry) => entry.endsWith(`.asset-${oldGroup}-meta.json`));

        // one progress bar per historical group, total is known up front from the recursive listing
        const groupBar = new cliProgress.SingleBar(
            {
                format:
                    '                 Migrating asset-' +
                    oldGroup +
                    ' [{bar}] {percentage}% | {value}/{total}',
            },
            cliProgress.Presets.shades_classic
        );
        if (owners.length) {
            groupBar.start(owners.length, 0);
        }

        try {
            for (const ownerPath of owners) {
                let owner;
                try {
                    owner = await fs.readJson(ownerPath);
                } catch {
                    report.skipped.push(ownerPath);
                    groupBar.increment();
                    continue;
                }
                const assetTypeName = owner?.assetType?.name ?? 'unknown';
                const currentGroup = getCurrentAssetGroup(assetTypeName, oldGroup);
                if (!currentGroup) {
                    // no mapping for this asset type: leave it in place but report it
                    (report.unmapped[assetTypeName] ??= []).push(ownerPath);
                    groupBar.increment();
                    continue;
                }
                const moves = await getOwnerMoveSet(root, ownerPath, oldGroup, currentGroup);
                const invalid = moves.find(
                    (move) =>
                        !move.to ||
                        !isWithin(root, move.from) ||
                        !isWithin(root, move.to) ||
                        !fs.existsSync(move.from) ||
                        fs.existsSync(move.to)
                );
                if (invalid) {
                    report.conflicts.push(ownerPath);
                    groupBar.increment();
                    continue;
                }
                for (const move of moves) {
                    await fs.ensureDir(path.dirname(move.to));
                    await fs.move(move.from, move.to, { overwrite: false });
                    report.moved.push(move.to);
                }
                groupBar.increment();
            }
        } finally {
            // stop the bar even when the group processing throws so a failed run does not leave a
            // stale bar interleaving with the next business unit's console output
            if (owners.length) {
                groupBar.stop();
            }
        }
        // clear the whole retired tree bottom-up, including folders that were already empty
        await sweepRetiredGroupRoot(oldGroupRoot, unremoved);
        // only succeeds once every asset of this historical group was moved out
        await removeDirectorySafely(oldGroupRoot, unremoved);
    }

    // a directory may survive because it is empty but blocked, or still holds non-directory entries
    for (const dir of unremoved) {
        let entries;
        try {
            // recursive so a folder that only holds subfolders is classified by its contents
            entries = await fs.readdir(dir, { recursive: true, withFileTypes: true });
        } catch (ex) {
            if (ex?.code === 'ENOENT') {
                // the directory disappeared after it was first recorded
                continue;
            }
            // unreadable for any other reason: keep the path so it cannot disappear unexplained
            report.unremovedNonEmptyDirs.push(dir);
            continue;
        }
        if (entries.some((entry) => !entry.isDirectory())) {
            report.unremovedNonEmptyDirs.push(dir);
        } else {
            report.unremovedEmptyDirs.push(dir);
        }
    }

    return report;
}
