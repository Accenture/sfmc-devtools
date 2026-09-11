import path from 'node:path';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import AssetDefinition from '../../../metadataTypes/definitions/Asset.definition.js';
import { getAssetSubtypeMigration } from './assetSubtypes.js';
import { resolveAssetMigrationFiles } from './assetFiles.js';

/**
 * Reject symlinks and special files, including ancestor directories.
 *
 * @param {string} filename absolute path
 * @returns {Promise.<import('node:fs').Stats>} filesystem information
 */
async function safeStat(filename) {
    const parent = path.dirname(filename);
    if (parent !== filename) {
        await safeStat(parent);
    }
    const stat = await fs.lstat(filename);
    if (stat.isSymbolicLink() || (!stat.isDirectory() && !stat.isFile())) {
        throw new Error(`Unsafe migration path: ${filename}`);
    }
    return stat;
}

/**
 * Snapshot observed files and directories; this does not discover asset companions.
 *
 * @param {string} root absolute asset directory
 * @param {string} relative POSIX relative directory
 * @param {Map<string, object>} entries inventory keyed by observed spelling
 * @returns {Promise.<void>} completion
 */
async function inventory(root, relative, entries) {
    const directory = path.join(root, relative);
    const names = (await fs.readdir(directory)).toSorted();
    const folded = new Set();
    for (const name of names) {
        if (name.includes('\\') || name.includes(':') || folded.has(name.toLowerCase())) {
            throw new Error(`Unsafe or case-insensitive migration path: ${relative}/${name}`);
        }
        folded.add(name.toLowerCase());
        const source = relative ? `${relative}/${name}` : name;
        const absolute = path.join(root, source);
        const stat = await safeStat(absolute);
        if (stat.isDirectory()) {
            entries.set(source, { directory: true });
            await inventory(root, source, entries);
        } else {
            const bytes = await fs.readFile(absolute);
            const after = await safeStat(absolute);
            if (
                stat.ino !== after.ino ||
                stat.size !== after.size ||
                stat.mtimeMs !== after.mtimeMs ||
                stat.ctimeMs !== after.ctimeMs
            ) {
                throw new Error(`Source changed while planning: ${source}`);
            }
            entries.set(source, {
                directory: false,
                sha256: createHash('sha256').update(bytes).digest('hex'),
                size: stat.size,
                mode: stat.mode,
                dev: stat.dev,
                ino: stat.ino,
                mtimeMs: stat.mtimeMs,
                ctimeMs: stat.ctimeMs,
            });
        }
    }
}

/**
 * Build a complete read-only v10 manifest for one selected BU asset root.
 * Owners are inventoried by exact metadata suffix; only the existing wrapper resolves companions.
 * Unknown historical owners and unaccounted historical files block rather than being skipped.
 *
 * @param {string} assetRoot absolute selected BU asset directory (BU parent must exist)
 * @returns {Promise.<{assetRoot: string, assetRootExists: boolean, version: string, owners: object[], moves: object[], inventory: object[]}>} deterministic manifest with POSIX paths and source fingerprints
 */
export async function planAssetMigration(assetRoot) {
    if (!path.isAbsolute(assetRoot) || path.basename(assetRoot) !== 'asset') {
        throw new Error('Expected an absolute selected BU asset root');
    }
    assetRoot = path.resolve(assetRoot);
    if (!(await safeStat(path.dirname(assetRoot))).isDirectory()) {
        throw new Error('Expected an existing BU directory');
    }
    let rootStat;
    try {
        rootStat = await safeStat(assetRoot);
    } catch (ex) {
        if (ex.code !== 'ENOENT' || ex.path !== assetRoot) {
            throw ex;
        }
        return {
            assetRoot,
            assetRootExists: false,
            version: 'v10',
            owners: [],
            moves: [],
            inventory: [],
        };
    }
    if (!rootStat.isDirectory()) {
        throw new Error('Expected an asset directory');
    }
    const entries = new Map();
    await inventory(assetRoot, '', entries);
    const identities = new Map();
    const ownership = new Map();
    const owners = [];
    const moves = [];
    for (const [source, snapshot] of entries) {
        if (snapshot.directory || !/\.asset-[a-z]+-meta\.json$/.test(source)) {
            continue;
        }
        const metadata = JSON.parse(await fs.readFile(path.join(assetRoot, source), 'utf8'));
        const name = metadata.assetType?.name;
        const key = metadata.customerKey;
        const historicalGroup = /^(?:asset|message|cloudpage|coderesource)\//.test(source);
        const knownType =
            typeof name === 'string' && Object.hasOwn(AssetDefinition.typeMapping, name);
        if (!knownType && !historicalGroup) {
            continue; // Unknown unrelated groups are inventoried, never claimed or moved.
        }
        if (
            typeof name !== 'string' ||
            !Object.hasOwn(AssetDefinition.typeMapping, name) ||
            typeof key !== 'string' ||
            !key.trim()
        ) {
            throw new Error(`Unclassified or malformed asset owner: ${source}`);
        }
        if (identities.has(key)) {
            throw new Error(`Duplicate customerKey ${key}: ${identities.get(key)} and ${source}`);
        }
        identities.set(key, source);
        if (!getAssetSubtypeMigration(name) && !historicalGroup) {
            continue;
        }
        // Broad asset/ retains live types: only inherited resolution can account for their files.
        const owner = await resolveAssetMigrationFiles(assetRoot, source, true);
        if (!owner) {
            throw new Error(`Unaccounted migration owner: ${source}`);
        }
        owners.push(owner);
        for (const file of owner.files) {
            if (ownership.has(file.source)) {
                throw new Error(`Duplicate file ownership: ${file.source}`);
            }
            ownership.set(file.source, source);
            if (file.source !== file.destination) {
                moves.push({ ...file, ownerPath: source, fingerprint: entries.get(file.source) });
            }
        }
    }
    // Broad asset/ can contain live owners, but unexplained files might be orphaned migrations.
    for (const [source, snapshot] of entries) {
        if (
            !snapshot.directory &&
            /^(?:asset|message|cloudpage|coderesource)\//.test(source) &&
            !ownership.has(source)
        ) {
            throw new Error(`Unaccounted historical asset file: ${source}`);
        }
    }
    const projected = new Map([...entries].map(([name, value]) => [name.toLowerCase(), value]));
    for (const move of moves) {
        const segments = move.destination.split('/');
        for (let index = 1; index <= segments.length; index++) {
            const destination = segments.slice(0, index).join('/').toLowerCase();
            const existing = projected.get(destination);
            if (existing && (index === segments.length || !existing.directory)) {
                throw new Error(`Migration destination collision: ${move.destination}`);
            }
            projected.set(destination, { directory: index < segments.length });
        }
    }
    const result = {
        assetRoot,
        assetRootExists: true,
        version: 'v10',
        owners,
        moves,
        inventory: [...entries].map(([source, fingerprint]) => ({ source, ...fingerprint })),
    };
    // Detect edits during wrapper resolution as well as during the initial snapshot.
    const after = new Map();
    await inventory(assetRoot, '', after);
    if (!isDeepStrictEqual(entries, after)) {
        throw new Error('Asset sources changed while planning');
    }
    return result;
}

/**
 * Recheck the full selected tree, identities, destinations, bytes and modes before execution.
 * This does not check Git state and never updates or mutates the supplied manifest.
 *
 * @param {Awaited<ReturnType<typeof planAssetMigration>>} plan previously approved manifest
 * @returns {Promise.<void>} completion or a blocking error
 */
export async function assertAssetMigrationPlanCurrent(plan) {
    const current = await planAssetMigration(plan.assetRoot);
    if (!isDeepStrictEqual(plan, current)) {
        throw new Error('Asset migration plan changed; create and confirm a new plan');
    }
}
