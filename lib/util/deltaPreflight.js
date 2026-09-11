import path from 'node:path';
import fs from 'node:fs/promises';
import MetadataTypeInfo from '../MetadataTypeInfo.js';
import File from './file.js';
import { cleanAssetExtension, createGitAssetTree } from './gitAssetTree.js';

const Asset = MetadataTypeInfo.asset;

/**
 * Verify ALL selected surviving assets against the immutable destination snapshot.
 * Read-only: no staging, normalization, output, purge, or historical migration logic.
 * Callers must finish analysis and preflight for ALL mappings before reports/purge/build,
 * then use these exact files for copy/template inputs (and avoid intervening edits).
 * Deleted owners are intentionally not packaged. Non-asset inputs remain caller-owned.
 * Bytes are literal Git blob bytes: checkout CRLF/smudge transformations are rejected.
 * On Windows executable committed files are rejected because executable mode cannot be
 * verified from the worktree. Other platforms compare the executable bit directly.
 *
 * @param {object} input request
 * @param {import('simple-git').SimpleGit} input.git repository client
 * @param {string} input.repositoryRoot absolute worktree root
 * @param {object} input.analysis analyzeDelta result (comparison.target, selectedOwners)
 * @param {object} [input.access] committed asset accessor
 * @returns {Promise.<Map<string, string[]>>} owning Git metadata path -> verified absolute files
 */
export async function preflightDelta({
    git,
    repositoryRoot,
    analysis,
    access = createGitAssetTree(git),
}) {
    if (!path.isAbsolute(repositoryRoot)) {
        throw new Error('Expected an absolute repository root.');
    }
    const manifest = new Map();
    for (const selection of analysis.selectedOwners) {
        try {
            const files = await verifyOwner(
                repositoryRoot,
                analysis.comparison.target,
                selection,
                access
            );
            manifest.set(selection.owner.path, files);
        } catch (ex) {
            throw new Error(
                `Selected asset preflight failed for ${selection.owner.path}: ${ex.message}. Check out/restore the comparison destination and complete its current asset layout before packaging.`,
                { cause: ex }
            );
        }
    }
    return manifest;
}

/**
 * Resolve a safe Git-relative path, rejecting traversal and alternate spellings.
 *
 * @param {string} root absolute repository directory
 * @param {string} relative Git-relative path
 * @returns {string} absolute path
 */
function absolutePath(root, relative) {
    if (
        typeof relative !== 'string' ||
        relative.includes('\\') ||
        relative.includes(':') ||
        relative.includes('\0') ||
        relative.split('/').some((part) => !part || part === '.' || part === '..')
    ) {
        throw new Error('Unsafe selected path');
    }
    return path.join(root, ...relative.split('/'));
}

/**
 * Check exact path spelling and reject symlinks in every ancestor before reads.
 *
 * @param {string} filename absolute path
 * @returns {Promise.<import('node:fs').Stats>} regular file or directory stat
 */
async function safeStat(filename) {
    const parent = path.dirname(filename);
    if (parent !== filename) {
        await safeStat(parent);
        const names = await fs.readdir(parent);
        const matches = names.filter(
            (name) => name.toLowerCase() === path.basename(filename).toLowerCase()
        );
        if (matches.length !== 1 || matches[0] !== path.basename(filename)) {
            throw new Error(`Missing path or case collision: ${filename}`);
        }
    }
    const stat = await fs.lstat(filename);
    if (stat.isSymbolicLink() || (!stat.isDirectory() && !stat.isFile())) {
        throw new Error(`Unsafe file type: ${filename}`);
    }
    return stat;
}

/**
 * Inventory only a selected ownership boundary, including ignored and untracked files.
 *
 * @param {string} filename selected path
 * @returns {Promise.<string[]>} regular descendant files
 */
async function walk(filename) {
    const stat = await safeStat(filename);
    if (stat.isFile()) {
        return [filename];
    }
    const files = [];
    for (const name of await fs.readdir(filename)) {
        files.push(...(await walk(path.join(filename, name))));
    }
    return files;
}

/**
 * Validate committed associations, exact disk inventory, bytes, and inherited resolver coverage.
 *
 * @param {string} root absolute worktree root
 * @param {string} target immutable commit
 * @param {object} selection analyzeDelta selected owner
 * @param {object} access committed accessor
 * @returns {Promise.<string[]>} verified absolute inputs
 */
async function verifyOwner(root, target, selection, access) {
    const { assetRoot, owner } = selection;
    const directory = absolutePath(root, assetRoot);
    const ownerAbsolute = absolutePath(root, owner.path);
    if (!owner.path.startsWith(assetRoot + '/') || path.basename(directory) !== 'asset') {
        throw new Error('Out-of-scope selected owner');
    }
    const snapshot = await access.inventory(target, assetRoot);
    const owners = snapshot.owners.filter((item) => item.customerKey === owner.customerKey);
    if (owners.length !== 1 || owners[0].path !== owner.path) {
        throw new Error('Missing or ambiguous destination owner');
    }
    const committedOwner = owners[0];
    const subtype = committedOwner.observedSubtype;
    if (
        !Asset.definition.extendedSubTypes[subtype]?.includes(committedOwner.assetTypeName) ||
        subtype !== committedOwner.metadataSuffixSubtype
    ) {
        throw new Error('Destination is not a current asset layout');
    }
    const metadata = JSON.parse(
        (await access.readBlob(target, assetRoot, owner.path)).toString('utf8')
    );
    const extension = cleanAssetExtension(metadata.fileProperties?.extension);
    if (metadata.fileProperties?.extension !== undefined && !extension) {
        throw new Error('Unsafe binary extension');
    }
    const parts = owner.path.slice(assetRoot.length + 1).split('/');
    const suffix = `.asset-${subtype}-meta.json`;
    const token = parts.at(-1).slice(0, -suffix.length);
    const tokens = new Set([
        metadata.customerKey,
        File.filterIllegalFilenames(metadata.customerKey),
        File.filterIllegalFilenames(metadata.customerKey.trim()),
    ]);
    if (
        !parts.at(-1).endsWith(suffix) ||
        !token ||
        ![2, 3].includes(parts.length) ||
        (parts.length === 3 && parts[1] !== token) ||
        !tokens.has(token)
    ) {
        throw new Error('Ambiguous owner encoding or unsupported current layout');
    }
    const expected = snapshot.entries.filter(
        (entry) => snapshot.associations[entry.path]?.owner?.path === owner.path
    );
    if (expected.every((entry) => entry.path !== owner.path)) {
        throw new Error('Unresolved destination metadata');
    }
    const committedTokens = snapshot.owners.map((item) => ({
        subtype: item.observedSubtype,
        token: path.posix
            .basename(item.path)
            .replace(/\.asset-[^.]+-meta\.json$/, '')
            .toLowerCase(),
    }));
    /**
     * Distinguish a dotted owner stem from a selected spelling's actual companions.
     *
     * @param {string} name first path segment in a subtype
     * @param {string[]} knownTokens exact independently observed owner stems
     * @param {boolean} nested path belongs to a dedicated directory
     * @returns {boolean} selected owner boundary match
     */
    function claims(name, knownTokens, nested) {
        const first = name.toLowerCase();
        return [...tokens].some((value) => {
            const candidate = value.toLowerCase();
            if (first === candidate) {
                return true;
            }
            if (!first.startsWith(candidate + '.')) {
                return false;
            }
            if (
                (extension && first === `${candidate}.${extension.toLowerCase()}`) ||
                (!nested && /^\.asset-[^.]+-meta\.[^.]+$/.test(first.slice(candidate.length)))
            ) {
                return true;
            }
            return knownTokens.every(
                (other) =>
                    !(
                        other !== candidate &&
                        other.startsWith(candidate + '.') &&
                        (first === other || first.startsWith(other + '.'))
                    )
            );
        });
    }
    for (const entry of snapshot.entries) {
        const segments = entry.path.slice(assetRoot.length + 1).split('/');
        if (
            entry.type !== 'tree' &&
            claims(
                segments[1],
                committedTokens
                    .filter((item) => item.subtype === segments[0])
                    .map((item) => item.token),
                segments.length > 2
            ) &&
            !expected.includes(entry)
        ) {
            throw new Error(`Unresolved or colliding committed companion: ${entry.path}`);
        }
    }
    // Selected key spellings in any subtype can shadow ordinary Asset first-match lookup.
    // Do not traverse unrelated owners, so unrelated dirty files and symlinks do not block.
    await safeStat(directory);
    const observed = new Set();
    for (const group of await fs.readdir(directory)) {
        const groupPath = path.join(directory, group);
        const groupStat = await fs.lstat(groupPath);
        if (!groupStat.isDirectory()) {
            if (group.toLowerCase() === subtype.toLowerCase()) {
                throw new Error('Unsafe selected subtype directory');
            }
            continue;
        }
        const entries = await fs.readdir(groupPath, { withFileTypes: true });
        const knownTokens = entries.flatMap((entry) =>
            entry.name.endsWith(`.asset-${group}-meta.json`)
                ? [entry.name.slice(0, -`.asset-${group}-meta.json`.length).toLowerCase()]
                : []
        );
        for (const entry of entries) {
            if (
                entry.isDirectory() &&
                [...tokens].some((candidate) =>
                    entry.name.toLowerCase().startsWith(candidate.toLowerCase() + '.')
                ) &&
                (await fs.readdir(path.join(groupPath, entry.name))).includes(
                    `${entry.name}.asset-${group}-meta.json`
                )
            ) {
                knownTokens.push(entry.name.toLowerCase());
            }
        }
        for (const entry of entries) {
            const name = entry.name;
            if (claims(name, knownTokens, entry.isDirectory())) {
                for (const filename of await walk(path.join(groupPath, name))) {
                    observed.add(filename);
                }
            }
        }
    }
    const expectedPaths = new Set(expected.map((entry) => absolutePath(root, entry.path)));
    if (
        observed.size !== expectedPaths.size ||
        [...observed].some((filename) => !expectedPaths.has(filename))
    ) {
        throw new Error('Extra, missing, or colliding selected companion');
    }
    for (const entry of expected) {
        const filename = absolutePath(root, entry.path);
        const stat = await safeStat(filename);
        if (entry.type !== 'blob' || !['100644', '100755'].includes(entry.mode) || !stat.isFile()) {
            throw new Error(`Unsafe committed or working file type: ${entry.path}`);
        }
        const executable = (stat.mode & 0o111) !== 0;
        if (
            (process.platform === 'win32' && entry.mode === '100755') ||
            (process.platform !== 'win32' && executable !== (entry.mode === '100755'))
        ) {
            throw new Error(`Executable mode mismatch or unverifiable mode: ${entry.path}`);
        }
        if (
            !(await fs.readFile(filename)).equals(
                await access.readBlob(target, assetRoot, entry.path)
            )
        ) {
            throw new Error(`Selected bytes differ from destination: ${entry.path}`);
        }
    }
    const files = await resolveFiles(directory, subtype, token);
    if (
        !files.has(ownerAbsolute) ||
        files.size !== expectedPaths.size ||
        [...files].some((filename) => !expectedPaths.has(filename))
    ) {
        throw new Error('Current Asset resolver cannot read the complete committed packaging set');
    }
    return [...files].toSorted();
}

/**
 * Reuse current Asset companion discovery in an isolated subtype/BU binding.
 * Observed filesystem tokens are never re-encoded; JSON logical identity stays intact.
 *
 * @param {string} directory absolute asset root
 * @param {string} subtype current subtype
 * @param {string} token validated observed owner token
 * @returns {Promise.<Set.<string>>} existing resolver files
 */
async function resolveFiles(directory, subtype, token) {
    /**
     *
     */
    class ScopedAsset extends Asset {
        /**
         * Enumerate extracted code using the validated observed token.
         *
         * @param {object} metadata owner JSON
         * @param {string} base BU root
         * @param {string} group current subtype
         * @returns {Promise.<object[]>} inherited companion records
         */
        static async _mergeCode(metadata, base, group) {
            return super._mergeCode(metadata, base, group, token, true);
        }

        /**
         * Resolve binary filename without reading or mutating shared metadata.
         *
         * @param {object} metadata owner JSON
         * @param {string} group current subtype
         * @param {string} base BU root
         * @returns {Promise.<string>} inherited binary filename
         */
        static async _readExtendedFileFromFS(metadata, group, base) {
            return super._readExtendedFileFromFS(
                { ...metadata, customerKey: token },
                group,
                base,
                true
            );
        }
    }
    ScopedAsset.definition = structuredClone(Asset.definition);
    ScopedAsset.definition.subTypes = [subtype];
    // This isolated resolver reads only the retrieve directory from configuration.
    ScopedAsset.properties = /** @type {typeof Asset.properties} */ ({
        directories: { retrieve: path.dirname(directory) },
    });
    ScopedAsset.buObject = { credential: '', businessUnit: '' };
    const files = new Set();
    for (const candidate of await ScopedAsset.getFilesToCommit([token])) {
        const filename = path.resolve(candidate);
        // Alternative html/amp/ssjs extensions are deliberately speculative.
        try {
            await fs.lstat(filename);
        } catch (ex) {
            if (ex.code === 'ENOENT') {
                continue;
            }
            throw ex;
        }
        await safeStat(filename);
        files.add(filename);
    }
    return files;
}
