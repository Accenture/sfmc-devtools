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
 * Removes directories that became empty after one owner's move set was relocated.
 * Walks the moved files' parent directories deepest-first and never removes the asset root.
 *
 * @param {string} assetRoot selected BU asset root that must be preserved
 * @param {string[]} fromPaths source paths of the moves just performed
 * @returns {Promise.<void>} -
 */
async function pruneEmptyDirectories(assetRoot, fromPaths) {
    const candidates = new Set();
    for (const fromPath of fromPaths) {
        for (let dir = path.dirname(fromPath); isWithin(assetRoot, dir); dir = path.dirname(dir)) {
            candidates.add(dir);
        }
    }
    // deepest first so nested empty folders collapse before their parents are checked
    const ordered = [...candidates].toSorted(
        (a, b) => b.split(path.sep).length - a.split(path.sep).length
    );
    for (const dir of ordered) {
        try {
            await fs.rmdir(dir);
        } catch (ex) {
            // keep folders that still hold assets (skipped/conflicted/unmatched) or were already gone
            if (ex?.code !== 'ENOTEMPTY' && ex?.code !== 'ENOENT') {
                throw ex;
            }
        }
    }
}

/**
 * Migrates historical asset groupings inside one selected BU retrieve tree.
 *
 * @param {string} assetRoot selected BU retrieve asset directory
 * @returns {Promise.<{moved: string[], conflicts: string[], skipped: string[]}>} migration report
 */
export async function migrateAssetV10Tree(assetRoot) {
    const root = path.resolve(assetRoot);
    /** @type {{moved: string[], conflicts: string[], skipped: string[]}} */
    const report = { moved: [], conflicts: [], skipped: [] };

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

        for (const ownerPath of owners) {
            let owner;
            try {
                owner = await fs.readJson(ownerPath);
            } catch {
                report.skipped.push(ownerPath);
                continue;
            }
            const currentGroup = getCurrentAssetGroup(owner?.assetType?.name, oldGroup);
            if (!currentGroup) {
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
                continue;
            }
            for (const move of moves) {
                await fs.ensureDir(path.dirname(move.to));
                await fs.move(move.from, move.to, { overwrite: false });
                report.moved.push(move.to);
            }
            await pruneEmptyDirectories(
                root,
                moves.map((move) => move.from)
            );
        }
        try {
            // only succeeds once every asset of this historical group was moved out
            await fs.rmdir(oldGroupRoot);
        } catch (ex) {
            // keep the folder when a conflicting or skipped asset was left in place
            if (ex?.code !== 'ENOTEMPTY' && ex?.code !== 'ENOENT') {
                throw ex;
            }
        }
    }
    return report;
}
