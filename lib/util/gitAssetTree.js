const objectId = /^(?:[\da-f]{40}|[\da-f]{64})$/;

/**
 * Match Asset's space-delimited extension cleanup and validate the resulting token.
 * Invalid or absent extensions never establish a binary ownership boundary.
 *
 * @param {unknown} extension raw fileProperties.extension
 * @returns {string|undefined} safe cleaned extension
 */
export function cleanAssetExtension(extension) {
    if (typeof extension !== 'string') {
        return;
    }
    const clean = extension.split(' ', 1)[0];
    return /^[\da-z]+$/i.test(clean) ? clean : undefined;
}

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
export function createGitAssetTree(git) {
    const inventories = new Map();
    const blobs = new Map();

    /**
     * Load exact blob bytes once, without text conversion or filters.
     *
     * @param {string} oid object ID from the committed tree
     * @returns {Promise.<Buffer>} cached bytes (internal only)
     */
    function blob(oid) {
        if (!blobs.has(oid)) {
            blobs.set(oid, git.binaryCatFile(['blob', oid]));
        }
        return blobs.get(oid);
    }

    /**
     * Read and index only the requested committed subtree.
     *
     * @param {string} commit immutable commit ID
     * @param {string} assetRoot exact Git-relative asset root
     * @returns {Promise.<object>} internal cached inventory
     */
    async function load(commit, assetRoot) {
        if (!objectId.test(commit)) {
            throw new Error('Expected a full immutable Git commit ID.');
        }
        validateRoot(assetRoot);
        const key = JSON.stringify([commit, assetRoot]);
        if (!inventories.has(key)) {
            inventories.set(key, build(commit, assetRoot));
        }
        return inventories.get(key);
    }

    /**
     * Build a metadata index with explicit unsafe/unreadable candidate evidence.
     *
     * @param {string} commit immutable commit ID
     * @param {string} assetRoot scoped root
     * @returns {Promise.<object>} inventory
     */
    async function build(commit, assetRoot) {
        const output = await git.raw([
            'ls-tree',
            '-r',
            '-t',
            '-z',
            '--full-tree',
            commit,
            '--',
            `:(literal)${assetRoot}/`,
        ]);
        const entries = output
            .split('\0')
            .filter(Boolean)
            .map((record) => {
                const match = /^(\d{6}) (blob|tree|commit) ([\da-f]+)\t([\s\S]+)$/.exec(record);
                if (!match) {
                    throw new Error('Invalid Git tree entry.');
                }
                const [, mode, type, oid, path] = match;
                // ls-tree -t includes ancestor trees of the literal pathspec.
                if (type === 'tree' && (path === assetRoot || assetRoot.startsWith(path + '/'))) {
                    return null;
                }
                if (!path.startsWith(assetRoot + '/')) {
                    throw new Error('Out-of-scope Git tree entry.');
                }
                return { path, relativePath: path.slice(assetRoot.length + 1), mode, type, oid };
            })
            .filter(Boolean);
        const owners = [];
        const metadataByPath = new Map();
        const extractedJson = [];
        const diagnostics = [];
        // Dedicated directories are evidenced by an owner stem matching its parent directory.
        // Reserve even malformed owners' directories, so payload JSON cannot become an owner.
        const reserved = entries.filter((entry) => nestedDirectory(entry));
        for (const entry of entries) {
            if (
                /\.asset-[^/]+-meta\.json$/.test(entry.path) &&
                !nestedDirectory(entry) &&
                reserved.some((item) => entry.path.startsWith(nestedDirectory(item) + '/'))
            ) {
                extractedJson.push(entry.path);
                continue;
            }
            const suffix = /\.asset-([^/]+)-meta\.json$/.exec(entry.relativePath);
            if (!suffix || entry.type === 'tree') {
                continue;
            }
            if (entry.type !== 'blob' || !['100644', '100755'].includes(entry.mode)) {
                diagnostics.push({
                    code: 'unsafe-metadata-mode',
                    path: entry.path,
                    message: entry.mode,
                });
                continue;
            }
            let metadata;
            try {
                metadata = JSON.parse((await blob(entry.oid)).toString('utf8'));
            } catch (ex) {
                diagnostics.push({
                    code: 'unreadable-metadata',
                    path: entry.path,
                    message: ex.message,
                });
                continue;
            }
            const hasKey = metadata && Object.hasOwn(metadata, 'customerKey');
            const hasType = metadata && Object.hasOwn(metadata, 'assetType');
            if (!hasKey && !hasType) {
                extractedJson.push(entry.path);
            } else if (
                typeof metadata.customerKey !== 'string' ||
                !metadata.customerKey.length ||
                typeof metadata.assetType?.name !== 'string' ||
                !metadata.assetType.name.length
            ) {
                diagnostics.push({
                    code: 'invalid-owner-identity',
                    path: entry.path,
                    message:
                        'Owning metadata requires nonempty customerKey and assetType.name strings.',
                });
            } else {
                metadataByPath.set(entry.path, metadata);
                owners.push({
                    ...entry,
                    customerKey: metadata.customerKey,
                    assetTypeName: metadata.assetType.name,
                    observedSubtype: entry.relativePath.includes('/')
                        ? entry.relativePath.split('/', 1)[0]
                        : null,
                    metadataSuffixSubtype: suffix[1],
                });
            }
        }
        const identities = new Map();
        for (const owner of owners) {
            const paths = identities.get(owner.customerKey) || [];
            paths.push(owner.path);
            identities.set(owner.customerKey, paths);
        }
        for (const [customerKey, paths] of identities) {
            if (paths.length > 1) {
                diagnostics.push({ code: 'duplicate-owner', customerKey, paths });
            }
        }
        const associations = {};
        for (const entry of entries.filter((item) => item.type !== 'tree')) {
            const matches = owners.filter((owner) =>
                owns(owner, metadataByPath.get(owner.path), entry.path)
            );
            // A nested owner never silently wins over another containing owner.
            const candidates = owners.filter((owner) =>
                matches.some((match) => match.customerKey === owner.customerKey)
            );
            if (matches.length > 1) {
                diagnostics.push({
                    code: 'overlapping-owners',
                    path: entry.path,
                    paths: matches.map((owner) => owner.path),
                });
            }
            const owner = candidates.length === 1 ? candidates[0] : undefined;
            const blocked = reserved.some(
                (item) =>
                    entry.path.startsWith(nestedDirectory(item) + '/') &&
                    owners.every((candidate) => candidate.path !== item.path)
            );
            const resolved = owner && !blocked && ['100644', '100755'].includes(entry.mode);
            const reason = resolved
                ? entry.path === owner.path
                    ? 'owning-metadata'
                    : 'committed-companion'
                : candidates.length > 1
                  ? 'ambiguous-ownership'
                  : 'companion-classification-required';
            associations[entry.path] = {
                status: candidates.length > 1 ? 'ambiguous' : resolved ? 'resolved' : 'unresolved',
                candidates,
                owner: resolved ? owner : undefined,
                relativeComponent: resolved
                    ? entry.path === owner.path
                        ? null
                        : component(owner, entry.path)
                    : undefined,
                reason,
            };
        }
        return { commit, assetRoot, entries, owners, extractedJson, diagnostics, associations };
    }

    return {
        /**
         * Return a defensive copy of committed evidence.
         *
         * @returns {Promise.<object>} snapshot or blob bytes for readBlob
         * @param {string} commit immutable commit ID
         * @param {string} assetRoot scoped Git-relative BU asset root
         */
        async inventory(commit, assetRoot) {
            return structuredClone(await load(commit, assetRoot));
        },
        // Full Git-relative path, not an OID supplied by the caller; scope is checked first.
        /**
         * Return a defensive copy of committed evidence.
         *
         * @returns {Promise.<object>} snapshot or blob bytes for readBlob
         * @param {string} commit immutable commit ID
         * @param {string} assetRoot scoped Git-relative BU asset root
         * @param {string} path exact Git-relative file path
         */
        async readBlob(commit, assetRoot, path) {
            const inventory = await load(commit, assetRoot);
            const entry = inventory.entries.find((item) => item.path === path);
            if (!entry || entry.type !== 'blob') {
                throw new Error('Requested path is not a blob in the scoped committed tree.');
            }
            return Buffer.from(await blob(entry.oid));
        },
        // status is resolved | ambiguous | unresolved; diagnostics are never hidden.
        /**
         * Return a defensive copy of committed evidence.
         *
         * @returns {Promise.<object>} snapshot or blob bytes for readBlob
         * @param {string} commit immutable commit ID
         * @param {string} assetRoot scoped Git-relative BU asset root
         * @param {string} customerKey logical identity read from JSON
         */
        async findOwners(commit, assetRoot, customerKey) {
            const inventory = await load(commit, assetRoot);
            const candidates = inventory.owners.filter(
                (owner) => owner.customerKey === customerKey
            );
            return structuredClone({
                status:
                    candidates.length === 1
                        ? 'resolved'
                        : candidates.length > 1
                          ? 'ambiguous'
                          : 'unresolved',
                candidates,
                diagnostics: inventory.diagnostics,
            });
        },
        // Component spellings retain observed suffixes; adapters alone transform those suffixes.
        /**
         * Return a defensive copy of committed evidence.
         *
         * @returns {Promise.<object>} snapshot or blob bytes for readBlob
         * @param {string} commit immutable commit ID
         * @param {string} assetRoot scoped Git-relative BU asset root
         * @param {string} path exact Git-relative file path
         */
        async associate(commit, assetRoot, path) {
            const inventory = await load(commit, assetRoot);
            const result = Object.hasOwn(inventory.associations, path)
                ? inventory.associations[path]
                : { status: 'unresolved', candidates: [], reason: 'path-not-in-inventory' };
            return structuredClone({
                ...result,
                diagnostics: [
                    ...inventory.diagnostics,
                    ...(result.status === 'resolved'
                        ? []
                        : [
                              {
                                  code: result.reason,
                                  path,
                                  message: 'No unique safe committed owner.',
                              },
                          ]),
                ],
            });
        },
    };
}

/**
 * Recognize an observed dedicated directory without decoding its key spelling.
 *
 * @param {object} entry committed metadata candidate
 * @returns {string|undefined} directory boundary
 */
function nestedDirectory(entry) {
    const match = /^(.*)\/([^/]+)\.asset-[^/]+-meta\.json$/.exec(entry.path);
    return match &&
        entry.relativePath.split('/').length >= 3 &&
        match[1].split('/').at(-1) === match[2]
        ? match[1]
        : undefined;
}

/**
 * Test exact observed ownership. Mirrors Asset._mergeCode's supported flat formats and
 * _readExtendedFileFromFS's extension cleanup, without calling their filesystem methods.
 * Dedicated directories include extracted payloads, but competing owners remain ambiguous.
 *
 * @param {object} owner indexed JSON identity
 * @param {object} metadata committed owning JSON
 * @param {string} path candidate path
 * @returns {boolean} evidence of ownership
 */
function owns(owner, metadata, path) {
    if (path === owner.path) {
        return true;
    }
    const directory = nestedDirectory(owner);
    if (
        directory &&
        ['htmlemail', 'templatebasedemail', 'template', 'webpage'].includes(owner.assetTypeName)
    ) {
        return path.startsWith(directory + '/');
    }
    const stem = owner.path.replace(/\.asset-[^/]+-meta\.json$/, '');
    const extension = cleanAssetExtension(metadata.fileProperties?.extension);
    if (extension && path === `${stem}.${extension}`) {
        return true;
    }
    const flatTypes = [
        'jscoderesource',
        'csscoderesource',
        'jsoncoderesource',
        'rsscoderesource',
        'textcoderesource',
        'xmlcoderesource',
        'buttonblock',
        'freeformblock',
        'htmlblock',
        'icemailformblock',
        'imageblock',
        'textblock',
        'smartcaptureblock',
        'codesnippetblock',
    ];
    const extensions =
        owner.assetTypeName === 'textonlyemail'
            ? ['amp']
            : flatTypes.includes(owner.assetTypeName)
              ? ['html', 'ssjs', 'amp', 'js', 'css', 'rss', 'txt', 'xml', 'jsonc']
              : [];
    const base = owner.path.slice(0, -'json'.length);
    return extensions.some((ext) => path === base + ext);
}

/**
 * Preserve exact component suffixes, removing only the observed owner location/stem.
 *
 * @param {object} owner committed owner
 * @param {string} path companion path
 * @returns {string} stable component within observed layout
 */
function component(owner, path) {
    const directory = nestedDirectory(owner);
    return directory && path.startsWith(directory + '/')
        ? path.slice(directory.length + 1)
        : path.slice(owner.path.replace(/\.asset-[^/]+-meta\.json$/, '').length);
}

/**
 * Reject ambiguous root spellings while retaining all literal encoded characters.
 * The caller supplies the configured retrieve/credential/BU/asset boundary.
 *
 * @param {string} root Git-relative asset root
 * @returns {void} validation only
 */
function validateRoot(root) {
    if (
        typeof root !== 'string' ||
        root.includes('\\') ||
        root.includes('\0') ||
        root.split('/').some((part) => !part || part === '.' || part === '..') ||
        root.split('/').at(-1) !== 'asset'
    ) {
        throw new Error('Expected an exact Git-relative BU asset root without traversal.');
    }
}
