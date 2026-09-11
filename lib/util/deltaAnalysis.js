import MetadataType from '../MetadataTypeInfo.js';
import { readGitDelta } from './gitDelta.js';
import { createGitAssetTree } from './gitAssetTree.js';
import { normalizeAssetSubtypeMigrationV10 } from './assetSubtypeMigrationV10.js';

/**
 * Analyze immutable source-BU changes, without worktree reads, reports, or writes.
 * Callers must finish analysis AND selected-input preflight for ALL mappings before
 * purge/build/report. This is not a packaging manifest or a worktree validator.
 * Removing the optional normalizer leaves ordinary ownership classification intact.
 * Ordinary records preserve acquired component statistics; synthesized and split
 * records recompute exact statistics from committed blobs before publication.
 *
 * @param {object} input request
 * @param {import('simple-git').SimpleGit} input.git repository client
 * @param {string} input.range comparison range
 * @param {string} input.retrieveRoot Git-relative configured retrieve root
 * @param {string[]} input.sourceBUs exact credential/BU pairs (not target BUs)
 * @param {object} [input.access] committed asset accessor
 * @param {(input: object) => Promise.<object>} [input.normalize] optional identity normalizer for retirement tests
 * @returns {Promise.<object>} comparison, changes (evidence/record/action), records,
 * selectedOwners, deletions, skipped, reportingNotes; throws with diagnostics on uncertainty
 */
export async function analyzeDelta({
    git,
    range,
    retrieveRoot,
    sourceBUs,
    access = createGitAssetTree(git),
    normalize = normalizeAssetSubtypeMigrationV10,
}) {
    const root = cleanRoot(retrieveRoot);
    if (!Array.isArray(sourceBUs) || !sourceBUs.length) {
        throw new Error('Delta analysis requires explicit source credential/BU pairs.');
    }
    const roots = [
        ...new Set(
            sourceBUs.map((bu) => {
                if (cleanRoot(bu).split('/').length !== 2) {
                    throw new Error('Expected an exact source credential/BU pair.');
                }
                return `${root}/${bu}`;
            })
        ),
    ];
    const acquired = await readGitDelta(git, range);
    const scoped = acquired.changes.filter((change) =>
        [change.oldPath, change.newPath].some((file) => scope(file, roots))
    );
    const normalized = await normalize({
        changes: scoped,
        comparison: acquired.comparison,
        assetRoots: roots.map((bu) => bu + '/asset'),
        access,
    });
    abort(normalized.diagnostics || []);
    const associations = normalized.associations || {};
    const diagnostics = [];
    const selected = new Map();
    const deleted = new Map();
    const changes = [];
    const reportingNotes = [];
    const blobs = new Map();
    const sizes = new Map();
    const names = new Map();
    const { base, target } = acquired.comparison;

    // Validate whole touched asset inventories even when the adapter suppressed every move.
    for (const bu of roots) {
        const assetRoot = bu + '/asset';
        if (
            scoped.every((change) =>
                [change.oldPath, change.newPath].every((p) => !p?.startsWith(assetRoot + '/'))
            )
        ) {
            continue;
        }
        const before = await access.inventory(base, assetRoot);
        const after = await access.inventory(target, assetRoot);
        diagnostics.push(...before.diagnostics, ...after.diagnostics);
        const nextOwners = new Map(after.owners.map((owner) => [owner.path, owner]));
        for (const owner of before.owners) {
            const next = nextOwners.get(owner.path);
            if (next && next.customerKey !== owner.customerKey) {
                diagnostics.push({
                    code: 'same-path-owner-rekey',
                    path: owner.path,
                    message:
                        'Changing an owning customerKey at the same path requires manual handling.',
                });
            }
        }
        const survivingPaths = new Set(after.entries.map((entry) => entry.path));
        for (const entry of before.entries) {
            // Only actual former-owner components matter, never unrelated unowned files.
            if (
                before.associations[entry.path]?.status === 'resolved' &&
                survivingPaths.has(entry.path) &&
                after.associations[entry.path]?.status !== 'resolved'
            ) {
                diagnostics.push({ code: 'orphaned-delta-component', path: entry.path });
            }
        }
    }
    abort(diagnostics);
    for (const change of normalized.changes) {
        // Re-scope both sides after normalization: Git may pair identical blobs across BUs.
        const oldScope = scope(change.oldPath, roots);
        const newScope = scope(change.newPath, roots);
        const sides =
            change.status === 'R' &&
            (oldScope !== newScope ||
                change.oldPath?.startsWith(oldScope + '/asset/') ||
                change.newPath?.startsWith(newScope + '/asset/'))
                ? [
                      oldScope && {
                          ...change,
                          status: 'D',
                          newPath: null,
                          newOid: '0'.repeat(change.newOid.length),
                          newMode: '000000',
                      },
                      newScope && {
                          ...change,
                          status: 'A',
                          oldPath: null,
                          oldOid: '0'.repeat(change.oldOid.length),
                          oldMode: '000000',
                      },
                  ].filter(Boolean)
                : [change];
        for (const side of sides) {
            const file = side.newPath || side.oldPath;
            const bu = scope(file, roots);
            if (!bu || /\.(?:md|error\.log)$/.test(file)) {
                continue;
            }
            const relative = file.slice(bu.length + 1);
            const type = relative.split('/', 1)[0];
            if (!relative.includes('/') || !Object.hasOwn(MetadataType, type)) {
                continue;
            }
            const stats = scoped.includes(side)
                ? side.stats
                : await componentStatistics(git, side, blobs, sizes);
            const record = {
                ...stats,
                file,
                fromPath: side.status === 'R' ? side.oldPath : '-',
                moved: side.status === 'R',
                type,
                _credential: bu.slice(root.length + 1).split('/', 1)[0],
                _businessUnit: bu.slice(root.length + 1).split('/', 2)[1],
                externalKey:
                    type === 'folder'
                        ? null
                        : relative.split('/', 2)[1].split('.').slice(0, -2).join('.'),
                name: type === 'folder' ? relative.split('/').at(-1).split('.', 1)[0] : null,
                gitAction:
                    side.status === 'D' ? 'delete' : side.status === 'R' ? 'move' : 'add/update',
            };
            const evidence = {
                change: stats === side.stats ? side : { ...side, stats },
                oldPaths: side.oldPath ? [side.oldPath] : [],
            };
            if (type === 'asset') {
                const assetRoot = bu + '/asset';
                const endpoint = side.status === 'D' ? 'base' : 'target';
                const association =
                    associations[endpoint]?.[file] ||
                    (await access.associate(acquired.comparison[endpoint], assetRoot, file));
                diagnostics.push(...(association.diagnostics || []));
                if (association.status !== 'resolved' || !association.owner) {
                    diagnostics.push({ code: 'unresolved-delta-owner', path: file });
                    continue;
                }
                const owner = association.owner;
                let destination = owner;
                if (side.status === 'D') {
                    const found = await access.findOwners(target, assetRoot, owner.customerKey);
                    diagnostics.push(...found.diagnostics);
                    destination =
                        associations.survivingOwners?.[owner.path] ||
                        (found.candidates.length === 1 ? found.candidates[0] : null);
                    if (
                        found.candidates.length > 1 ||
                        (destination &&
                            found.candidates.every((item) => item.path !== destination.path))
                    ) {
                        diagnostics.push({ code: 'ambiguous-delta-destination', path: file });
                        continue;
                    }
                }
                // Synthetic M paths need not exist at base. Preserve adapter endpoint
                // associations rather than trying to read that destination path at base.
                const previousOwners = Object.entries(associations.survivingOwners || {})
                    .filter(([, next]) => next.path === destination?.path)
                    .map(([oldPath]) => oldPath);
                if (previousOwners.length && side.oldPath && !associations.base?.[side.oldPath]) {
                    const inventory = await access.inventory(base, assetRoot);
                    evidence.oldPaths = inventory.entries
                        .filter(
                            (entry) =>
                                entry.oid === side.oldOid &&
                                associations.base?.[entry.path]?.relativeComponent?.replace(
                                    /\.asset-[^/]+-meta(?=\.)/,
                                    '.asset-meta'
                                ) ===
                                    association.relativeComponent?.replace(
                                        /\.asset-[^/]+-meta(?=\.)/,
                                        '.asset-meta'
                                    ) &&
                                previousOwners.includes(
                                    associations.base?.[entry.path]?.owner?.path
                                )
                        )
                        .map((entry) => entry.path);
                    evidence.previousOwnerPaths = previousOwners;
                }
                record.externalKey = owner.customerKey;
                record.gitAction = destination
                    ? side.status === 'R'
                        ? 'move'
                        : 'add/update'
                    : 'delete';
                evidence.owner = owner;
                evidence.destinationOwner = destination;
                const selection = {
                    assetRoot,
                    owner: destination || owner,
                    credential: record._credential,
                    businessUnit: record._businessUnit,
                };
                const key = JSON.stringify([assetRoot, owner.customerKey]);
                (destination ? selected : deleted).set(key, selection);
                if (access.readBlob) {
                    const metadata = JSON.parse(
                        (
                            await access.readBlob(
                                destination ? target : base,
                                assetRoot,
                                (destination || owner).path
                            )
                        ).toString('utf8')
                    );
                    record.name = metadata.name ?? null;
                }
            } else if (type !== 'folder') {
                record.name = await committedName(
                    git,
                    side.status === 'D' ? base : target,
                    bu,
                    relative,
                    type,
                    names
                );
            }
            changes.push({ ...evidence, record, action: record.gitAction });
        }
    }
    for (const key of deleted.keys()) {
        if (selected.has(key)) {
            diagnostics.push({ code: 'contradictory-delta-actions', key });
        }
    }
    abort(diagnostics);
    return {
        comparison: acquired.comparison,
        changes,
        records: changes.map((change) => change.record),
        selectedOwners: [...selected.values()],
        deletions: [...deleted.values()],
        skipped: normalized.skipped || [],
        reportingNotes,
    };
}

/**
 * Enrich flat non-asset records from exact committed metadata, never companion contents.
 * Only the existing extracted-code layouts are supported; unknown layouts stay unnamed.
 * Missing, malformed, non-regular metadata or non-string names are display-only omissions.
 * Git transport/object failures still propagate rather than hiding repository errors.
 *
 * @param {import('simple-git').SimpleGit} git repository client
 * @param {string} commit immutable endpoint
 * @param {string} bu scoped Git-relative BU root
 * @param {string} relative BU-relative changed path
 * @param {string} type registry type
 * @param {Map.<string, Promise.<string|null>>} names invocation-local name cache
 * @returns {Promise.<string|null>} display name, if safely available
 */
async function committedName(git, commit, bu, relative, type, names) {
    const [, filename, extra] = relative.split('/', 3);
    const suffix = `.${type}-meta.`;
    const suffixIndex = filename.lastIndexOf(suffix);
    if (extra !== undefined || suffixIndex <= 0) {
        return null;
    }
    const extension = filename.slice(suffixIndex + suffix.length);
    const companions = {
        query: ['sql'],
        script: ['ssjs', 'html'],
        email: ['html'],
        contentArea: ['html'],
    };
    if (extension !== 'json' && !companions[type]?.includes(extension)) {
        return null;
    }
    const file = `${bu}/${type}/${filename.slice(0, suffixIndex)}${suffix}json`;
    const key = JSON.stringify([commit, file]);
    if (!names.has(key)) {
        names.set(key, loadName());
    }
    return names.get(key);

    /**
     * Read a literal regular-file tree entry and traverse the registry's name field.
     *
     * @returns {Promise.<string|null>} committed display name
     */
    async function loadName() {
        const tree = await git.raw([
            'ls-tree',
            '-z',
            '--full-tree',
            commit,
            '--',
            `:(literal)${file}`,
        ]);
        const entries = tree.split('\0').filter(Boolean);
        if (entries.length !== 1) {
            return null;
        }
        const entry = /^(100644|100755) blob ([\da-f]+)\t([\s\S]+)$/.exec(entries[0]);
        if (!entry || entry[3] !== file) {
            return null;
        }
        const bytes = await git.binaryCatFile(['blob', entry[2]]);
        let value;
        try {
            value = JSON.parse(bytes.toString('utf8'));
        } catch {
            return null;
        }
        for (const field of MetadataType[type].definition.nameField.split('.')) {
            if (!value || typeof value !== 'object' || !Object.hasOwn(value, field)) {
                return null;
            }
            value = value[field];
        }
        return typeof value === 'string' ? value : null;
    }
}

/**
 * Compute exact synthesized statistics without worktree files or new Git objects.
 * Blob-to-blob numstat compares contents directly, independent of renamed paths.
 * An absent side is a whole-blob addition/deletion: Git counts LF plus a final
 * unterminated line, and detects binary content by NUL in the first 8000 bytes.
 *
 * @param {import('simple-git').SimpleGit} git repository client
 * @param {object} change endpoint blob IDs
 * @param {Map.<string, Buffer>} blobs invocation-local blob cache
 * @param {Map.<string, number>} sizes invocation-local binary size cache
 * @returns {Promise.<object>} exact public statistics
 */
async function componentStatistics(git, change, blobs, sizes) {
    const absentOld = /^0+$/.test(change.oldOid);
    const absentNew = /^0+$/.test(change.newOid);
    let insertions = 0;
    let deletions = 0;
    let binary = false;
    if (absentOld || absentNew) {
        const oid = absentOld ? change.newOid : change.oldOid;
        if (!blobs.has(oid)) {
            blobs.set(oid, await git.binaryCatFile(['blob', oid]));
        }
        const bytes = blobs.get(oid);
        sizes.set(oid, bytes.length);
        binary = bytes.subarray(0, 8000).includes(0);
        if (!binary) {
            let lines = bytes.length && bytes.at(-1) !== 10 ? 1 : 0;
            for (const byte of bytes) {
                if (byte === 10) {
                    lines++;
                }
            }
            insertions = absentOld ? lines : 0;
            deletions = absentNew ? lines : 0;
        }
    } else if (change.oldOid !== change.newOid) {
        const output = await git.raw([
            'diff',
            '--numstat',
            '-z',
            '--no-ext-diff',
            '--no-textconv',
            change.oldOid,
            change.newOid,
            '--',
        ]);
        const counts = /^(\d+|-)\t(\d+|-)\t\0[\da-f]+\0[\da-f]+\0$/.exec(output);
        if (!counts || (counts[1] === '-') !== (counts[2] === '-')) {
            throw new Error('Invalid synthesized Git blob numstat.');
        }
        binary = counts[1] === '-';
        if (!binary) {
            insertions = Number(counts[1]);
            deletions = Number(counts[2]);
        }
    }
    if (!binary) {
        return { binary: false, insertions, deletions, changes: insertions + deletions };
    }
    const lengths = [];
    for (const oid of [change.oldOid, change.newOid]) {
        if (/^0+$/.test(oid)) {
            lengths.push(0);
            continue;
        }
        if (!sizes.has(oid)) {
            const size = Number((await git.raw(['cat-file', '-s', oid])).trim());
            if (!Number.isSafeInteger(size) || size < 0) {
                throw new Error('Invalid committed Git blob size.');
            }
            sizes.set(oid, size);
        }
        lengths.push(sizes.get(oid));
    }
    return { binary: true, before: lengths[0], after: lengths[1] };
}

/**
 * Reject unsafe or ambiguous source-root spellings rather than guessing.
 *
 * @param {string} value Git-relative directory
 * @returns {string} validated path
 */
function cleanRoot(value) {
    if (
        typeof value !== 'string' ||
        !value ||
        value.includes('\\') ||
        value.includes('\0') ||
        value.includes(':') ||
        value.split('/').some((part) => !part || part === '.' || part === '..')
    ) {
        throw new Error('Expected a safe Git-relative directory.');
    }
    return value;
}

/**
 * Find an exact source BU boundary.
 *
 * @param {string} file Git path
 * @param {string[]} roots selected roots
 * @returns {string|undefined} selected BU root
 */
function scope(file, roots) {
    return file && roots.find((root) => file.startsWith(root + '/'));
}

/**
 * Fail closed before returning any actionable results.
 *
 * @param {object[]} diagnostics blocking evidence
 * @returns {void} nothing
 */
function abort(diagnostics) {
    if (diagnostics.length) {
        /** @type {Error & {diagnostics?: object[]}} */
        const error = new Error(
            'Delta analysis blocked by uncertain committed asset ownership.' +
                (diagnostics.some((item) => item.code === 'same-path-owner-rekey')
                    ? ' Changing an owning customerKey at the same path requires manual handling.'
                    : '')
        );
        error.diagnostics = diagnostics;
        throw error;
    }
}
