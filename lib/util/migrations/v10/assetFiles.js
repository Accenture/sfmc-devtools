import path from 'node:path';
import fs from 'node:fs/promises';
import MetadataTypeInfo from '../../../MetadataTypeInfo.js';
const Asset = MetadataTypeInfo.asset;
import File from '../../file.js';
import { getAssetSubtypeMigration, transformAssetSubtypePath } from './assetSubtypes.js';

/**
 * Read an existing regular file/directory without following symlinks, including its ancestors.
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
    if (stat.isSymbolicLink() || (!stat.isFile() && !stat.isDirectory())) {
        throw new Error(`Unsafe migration path: ${filename}`);
    }
    return stat;
}

/**
 * Inventory a directory solely for completeness checks, not companion discovery.
 *
 * @param {string} directory absolute directory
 * @returns {Promise.<string[]>} regular files
 */
async function inventory(directory) {
    const files = [];
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
        const filename = path.join(directory, entry.name);
        const stat = await safeStat(filename);
        files.push(...(stat.isDirectory() ? await inventory(filename) : [filename]));
    }
    return files;
}

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
export async function resolveAssetMigrationFiles(assetRoot, ownerPath, includeUnchanged = false) {
    if (
        !path.isAbsolute(assetRoot) ||
        path.basename(assetRoot) !== 'asset' ||
        ownerPath.includes('\\')
    ) {
        throw new Error('Expected an absolute asset root and a POSIX owner path');
    }
    const parts = ownerPath.split('/');
    if (parts.some((part) => !part || part === '.' || part === '..')) {
        throw new Error(`Unsafe owner path: ${ownerPath}`);
    }
    const owner = path.resolve(assetRoot, ...parts);
    const relativeOwner = path.relative(assetRoot, owner);
    if (
        path.isAbsolute(relativeOwner) ||
        relativeOwner.startsWith('..') ||
        parts.some((part) => part.includes(':'))
    ) {
        throw new Error(`Unsafe owner path: ${ownerPath}`);
    }
    await safeStat(owner);
    const metadata = JSON.parse(await fs.readFile(owner, 'utf8'));
    const assetTypeName = metadata.assetType?.name;
    const migration = getAssetSubtypeMigration(assetTypeName);
    const subtype = parts[0];
    if (
        !migration &&
        (!includeUnchanged || !Asset.definition.extendedSubTypes[subtype]?.includes(assetTypeName))
    ) {
        return null;
    }
    const suffix = `.asset-${subtype}-meta.json`;
    const token = parts.at(-1).slice(0, -suffix.length);
    const customerKey = metadata.customerKey;
    if (
        (migration && ![...migration.oldSubtypes, migration.newSubtype].includes(subtype)) ||
        !parts.at(-1).endsWith(suffix) ||
        !token ||
        ![2, 3].includes(parts.length) ||
        (parts.length === 3 && parts[1] !== token) ||
        typeof customerKey !== 'string' ||
        !customerKey.trim() ||
        ![
            customerKey,
            File.filterIllegalFilenames(customerKey),
            File.filterIllegalFilenames(customerKey.trim()),
        ].includes(token)
    ) {
        throw new Error(`Ambiguous owner encoding or unsupported layout: ${ownerPath}`);
    }
    const subtypeRoot = path.join(assetRoot, subtype);
    const observed = await inventory(subtypeRoot);
    const ownerTokens = observed.flatMap((filename) => {
        const relative = path.relative(subtypeRoot, filename).split(path.sep);
        const stem = relative.at(-1).slice(0, -suffix.length);
        return relative.at(-1).endsWith(suffix) &&
            (relative.length === 1 || (relative.length === 2 && relative[0] === stem))
            ? [stem]
            : [];
    });
    /**
     * Keep dotted sibling owners outside this boundary, without hiding real orphans.
     *
     * @param {string} filename observed absolute filename
     * @param {string} candidate selected spelling
     * @returns {boolean} whether this spelling claims the path
     */
    function claims(filename, candidate) {
        const [first, ...nested] = path.relative(subtypeRoot, filename).split(path.sep);
        if (first === candidate) {
            return true;
        }
        if (!first.startsWith(`${candidate}.`)) {
            return false;
        }
        // Exact supported flat companions remain collisions even if another key resembles them.
        if (
            !nested.length &&
            (/^\.asset-[^.]+-meta\.[^.]+$/.test(first.slice(candidate.length)) ||
                first === `${candidate}.${metadata.fileProperties?.extension}`)
        ) {
            return true;
        }
        return ownerTokens.every(
            (other) =>
                !(
                    other !== candidate &&
                    other.startsWith(`${candidate}.`) &&
                    (first === other || first.startsWith(`${other}.`))
                )
        );
    }
    const owned = observed.filter((filename) => claims(filename, token));
    // Flat and nested copies are ambiguous even when the JSON is byte-identical.
    if (owned.filter((filename) => path.basename(filename) === `${token}${suffix}`).length !== 1) {
        throw new Error(`Multiple owner candidates: ${ownerPath}`);
    }
    const alternateTokens = new Set([
        customerKey,
        File.filterIllegalFilenames(customerKey),
        File.filterIllegalFilenames(customerKey.trim()),
    ]);
    for (const alternate of alternateTokens) {
        if (alternate !== token && observed.some((filename) => claims(filename, alternate))) {
            throw new Error(`Ambiguous companion encoding: ${ownerPath}`);
        }
    }
    /** Migration-only binding; inherited enumeration remains the source of truth. */
    class ScopedAsset extends Asset {
        /**
         * Use the observed lookup token without re-encoding or reading text bodies.
         *
         * @param {object} item asset metadata
         * @param {string} directory BU directory
         * @param {string} sourceSubtype observed subtype
         * @returns {Promise.<object[]>} inherited companion records
         */
        static async _mergeCode(item, directory, sourceSubtype) {
            return super._mergeCode(item, directory, sourceSubtype, token, true);
        }

        /**
         * Probe the observed binary token without reading or modifying its content.
         *
         * @param {object} item asset metadata
         * @param {string} sourceSubtype observed subtype
         * @param {string} directory BU directory
         * @returns {Promise.<string>} inherited binary path
         */
        static async _readExtendedFileFromFS(item, sourceSubtype, directory) {
            return super._readExtendedFileFromFS(
                { ...item, customerKey: token },
                sourceSubtype,
                directory,
                true
            );
        }
    }
    ScopedAsset.definition = structuredClone(Asset.definition);
    ScopedAsset.definition.subTypes = [subtype];
    // Empty BU segments bind the inherited basePath directly to this owner's BU.
    // This isolated resolver reads only the retrieve directory from configuration.
    ScopedAsset.properties = /** @type {typeof Asset.properties} */ ({
        directories: { retrieve: path.dirname(assetRoot) },
    });
    ScopedAsset.buObject = { credential: '', businessUnit: '' };
    const resolved = new Set();
    for (const candidate of await ScopedAsset.getFilesToCommit([token])) {
        const absolute = path.resolve(candidate);
        if (!owned.includes(absolute)) {
            try {
                await fs.lstat(absolute);
            } catch (ex) {
                if (ex.code === 'ENOENT') {
                    continue; // The inherited method deliberately proposes alternative extensions.
                }
                throw ex;
            }
            throw new Error(`Resolver selected a foreign companion: ${candidate}`);
        }
        resolved.add(absolute);
    }
    if (!resolved.has(owner) || owned.some((filename) => !resolved.has(filename))) {
        throw new Error(`Unresolved owner or orphan companions: ${ownerPath}`);
    }
    const destinations = new Set();
    const files = [];
    for (const filename of [...resolved].toSorted()) {
        const source = path.relative(assetRoot, filename).split(path.sep).join('/');
        const destination = transformAssetSubtypePath(assetTypeName, source);
        const collisionKey = destination.toLowerCase();
        if (destinations.has(collisionKey)) {
            throw new Error(`Case-insensitive destination collision: ${destination}`);
        }
        destinations.add(collisionKey);
        if (source !== destination) {
            let current = assetRoot;
            for (const part of destination.split('/')) {
                const names = await fs.readdir(current);
                const matches = names.filter((name) => name.toLowerCase() === part.toLowerCase());
                if (!matches.length) {
                    break;
                }
                current = path.join(current, matches[0]);
                await safeStat(current);
                if (matches.length > 1 || part === destination.split('/').at(-1)) {
                    throw new Error(`Existing migration destination: ${destination}`);
                }
            }
        }
        files.push({ source, destination });
    }
    return { customerKey, assetTypeName, ownerPath, files };
}
