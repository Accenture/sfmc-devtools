// eslint-disable-next-line spaced-comment -- TypeScript requires triple-slash syntax for the Node 22 iterator library.
/// <reference lib="esnext.iterator" />
import {
    getAssetSubtypeMigration,
    transformAssetSubtypePath,
} from './migrations/v10/assetSubtypes.js';

/**
 * Normalize allowlisted committed layout transitions before actionable delta output.
 * Roots are exact Git-relative credential/BU asset directories, never repository roots.
 * Consumers MUST abort actionable output when diagnostics is nonempty. Associations are
 * generic endpoint evidence: base/target map component paths to accessor associations;
 * survivingOwners maps base owner paths to their verified target owner (even if suppressed).
 * No evidence is attached as public migration flags to ordinary change records.
 * Synthesized edited pairs use destination-only M records. Their statistics conservatively
 * sum source deletions and destination insertions, not a newly computed line diff.
 * Unrelated input records are returned unchanged, including their object identity.
 *
 * @param {object} input adapter request
 * @param {object[]} input.changes structured readGitDelta records
 * @param {{base: string, target: string}} input.comparison immutable endpoints
 * @param {string[]} input.assetRoots exact scoped asset roots
 * @param {object} input.access createGitAssetTree read-only accessor
 * @returns {Promise.<object>} {changes, skipped, diagnostics, associations}
 */
export async function normalizeAssetSubtypeMigrationV10({
    changes,
    comparison,
    assetRoots,
    access,
}) {
    const diagnostics = [];
    const skipped = [];
    const associations = { base: {}, target: {}, survivingOwners: {} };
    const pairs = [];
    const oldSides = new Map();
    const newSides = new Map();
    for (const change of changes) {
        // Copies do not remove their source, so are never consumed as migration moves.
        if (change.oldPath && ['D', 'R'].includes(change.status)) {
            oldSides.set(change.oldPath, change);
        }
        if (change.newPath && ['A', 'R'].includes(change.status)) {
            newSides.set(change.newPath, change);
        }
    }
    for (const root of new Set(assetRoots)) {
        if (
            changes.every((change) =>
                [change.oldPath, change.newPath].every((p) => !p?.startsWith(root + '/'))
            )
        ) {
            continue;
        }
        const [base, target] = await Promise.all([
            access.inventory(comparison.base, root),
            access.inventory(comparison.target, root),
        ]);
        Object.assign(associations.base, base.associations);
        Object.assign(associations.target, target.associations);
        const localPairs = [];
        for (const owner of base.owners) {
            const migration = getAssetSubtypeMigration(owner.assetTypeName);
            if (!migration) {
                continue;
            }
            const expectedOwner =
                root + '/' + transformAssetSubtypePath(owner.assetTypeName, owner.relativePath);
            if (expectedOwner === owner.path) {
                continue;
            }
            const sourceOwners = base.owners.filter(
                (item) => item.customerKey === owner.customerKey
            );
            const targetOwners = target.owners.filter(
                (item) => item.customerKey === owner.customerKey
            );
            const affected = oldSides
                .keys()
                .some((path) =>
                    base.associations[path]?.candidates?.some(
                        (item) => item.customerKey === owner.customerKey
                    )
                );
            if (!affected) {
                continue;
            }
            if (sourceOwners.length !== 1 || targetOwners.length > 1) {
                diagnostics.push({
                    code: 'ambiguous-migration-owner',
                    assetRoot: root,
                    path: owner.path,
                });
                continue;
            }
            const next = targetOwners[0];
            if (!next) {
                // A true owner deletion is ordinary, unless a destination exists without identity.
                const orphanDestination = base.entries.some((entry) => {
                    if (base.associations[entry.path]?.owner?.path !== owner.path) {
                        return false;
                    }
                    const destination =
                        root +
                        '/' +
                        transformAssetSubtypePath(owner.assetTypeName, entry.relativePath);
                    return (
                        newSides.has(destination) &&
                        target.associations[destination]?.status !== 'resolved'
                    );
                });
                if (
                    orphanDestination ||
                    target.entries.some((item) => item.path === expectedOwner)
                ) {
                    diagnostics.push({
                        code: 'unresolved-migration-owner',
                        assetRoot: root,
                        path: expectedOwner,
                    });
                }
                continue;
            }
            if (next.path !== expectedOwner || next.assetTypeName !== owner.assetTypeName) {
                continue;
            }
            if (
                next.observedSubtype !== migration.newSubtype ||
                next.metadataSuffixSubtype !== migration.newSubtype
            ) {
                diagnostics.push({
                    code: 'incomplete-migration-owner',
                    assetRoot: root,
                    path: next.path,
                });
                continue;
            }
            associations.survivingOwners[owner.path] = next;
            for (const entry of base.entries) {
                if (!oldSides.has(entry.path)) {
                    continue;
                }
                const before = base.associations[entry.path];
                if (before?.owner?.path !== owner.path || before.status !== 'resolved') {
                    continue;
                }
                const destination =
                    root + '/' + transformAssetSubtypePath(owner.assetTypeName, entry.relativePath);
                if (entry.path === destination || !newSides.has(destination)) {
                    continue;
                }
                const after = target.associations[destination];
                if (after?.status !== 'resolved' || after.owner.path !== next.path) {
                    diagnostics.push({
                        code: 'unresolved-migration-component',
                        assetRoot: root,
                        path: destination,
                    });
                    continue;
                }
                const end = target.entries.find((item) => item.path === destination);
                localPairs.push({ before: entry, after: end, owner: next, assetRoot: root });
            }
        }
        // An unowned old-layout change cannot safely become an asset deletion during a move.
        // These directory names only identify uncertainty, never authorize suppression.
        for (const path of oldSides.keys()) {
            if (!path.startsWith(root + '/')) {
                continue;
            }
            const relative = path.slice(root.length + 1);
            if (
                /^(?:message|asset|cloudpage|coderesource)\//.test(relative) &&
                base.associations[path]?.status !== 'resolved'
            ) {
                diagnostics.push({ code: 'unresolved-migration-source', assetRoot: root, path });
            }
        }
        pairs.push(...localPairs);
    }
    const consumedOld = new Set();
    const consumedNew = new Set();
    const normalized = [];
    for (const pair of pairs) {
        const { before, after, owner, assetRoot } = pair;
        if (consumedOld.has(before.path) || consumedNew.has(after.path)) {
            diagnostics.push({ code: 'duplicate-migration-pair', path: before.path });
            continue;
        }
        consumedOld.add(before.path);
        consumedNew.add(after.path);
        if (before.oid === after.oid && before.mode === after.mode && before.type === after.type) {
            skipped.push({
                oldPath: before.path,
                newPath: after.path,
                customerKey: owner.customerKey,
                assetRoot,
            });
        } else {
            normalized.push({
                status: 'M',
                oldPath: after.path,
                newPath: after.path,
                oldOid: before.oid,
                newOid: after.oid,
                oldMode: before.mode,
                newMode: after.mode,
                stats: pairStats(oldSides.get(before.path), newSides.get(after.path)),
            });
        }
    }
    for (const change of changes) {
        const oldConsumed = consumedOld.has(change.oldPath);
        const newConsumed = consumedNew.has(change.newPath);
        if (!oldConsumed && !newConsumed) {
            normalized.push(change);
        } else if (change.status === 'R' && oldConsumed !== newConsumed) {
            // Git can pair identical blobs belonging to different logical owners. Retain
            // its unconsumed side rather than losing a genuine addition or deletion.
            const addition = oldConsumed;
            normalized.push({
                ...change,
                status: addition ? 'A' : 'D',
                similarity: undefined,
                oldPath: addition ? null : change.oldPath,
                newPath: addition ? change.newPath : null,
                oldOid: addition ? '0'.repeat(change.oldOid.length) : change.oldOid,
                newOid: addition ? change.newOid : '0'.repeat(change.newOid.length),
                oldMode: addition ? '000000' : change.oldMode,
                newMode: addition ? change.newMode : '000000',
            });
        }
    }
    // Never hand back partially suppressed actionable changes on uncertain evidence.
    return {
        changes: diagnostics.length ? changes : normalized,
        skipped: diagnostics.length ? [] : skipped,
        diagnostics,
        associations,
    };
}

/**
 * Preserve exact stats for a genuine Git pair; otherwise report conservative churn.
 *
 * @param {object} before source change
 * @param {object} after destination change
 * @returns {object} ordinary text/binary statistics
 */
function pairStats(before, after) {
    if (before === after) {
        return before.stats;
    }
    if (before.stats?.binary || after.stats?.binary) {
        return { binary: true, before: before.stats?.before, after: after.stats?.after };
    }
    const deletions = before.stats?.deletions ?? 0;
    const insertions = after.stats?.insertions ?? 0;
    return { binary: false, deletions, insertions, changes: deletions + insertions };
}
