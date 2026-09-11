import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { assertAssetMigrationPlanCurrent } from './v10/assetPlan.js';

/**
 * Check every ancestor, rejecting symlinks and case-insensitive aliases.
 *
 * @param {string} filename absolute path
 * @param {boolean} [missing] allow the final component to be absent
 * @returns {Promise.<import('node:fs').Stats|null>} current stat
 */
async function safeStat(filename, missing = false) {
    const parent = path.dirname(filename);
    if (parent !== filename) {
        const parentStat = await safeStat(parent);
        if (!parentStat.isDirectory()) {
            throw new Error(`Unsafe migration parent: ${parent}`);
        }
        const name = path.basename(filename);
        const aliases = (await fs.readdir(parent)).filter(
            (entry) => entry.toLowerCase() === name.toLowerCase() && entry !== name
        );
        if (aliases.length) {
            throw new Error(`Case-insensitive migration collision: ${filename}`);
        }
    }
    try {
        const stat = await fs.lstat(filename);
        if (stat.isSymbolicLink() || (!stat.isDirectory() && !stat.isFile())) {
            throw new Error(`Unsafe migration path: ${filename}`);
        }
        return stat;
    } catch (ex) {
        if (missing && ex.code === 'ENOENT' && ex.path === filename) {
            return null;
        }
        throw ex;
    }
}

/**
 * Verify identity, bytes and mode; link/unlink legitimately changes ctime.
 *
 * @param {string} filename absolute filename
 * @param {object} fingerprint planned file fingerprint
 * @param {boolean} [strict] also compare original timestamps
 * @returns {Promise.<void>} completion
 */
async function verify(filename, fingerprint, strict = false) {
    const before = await safeStat(filename);
    const sha256 = createHash('sha256')
        .update(await fs.readFile(filename))
        .digest('hex');
    const after = await safeStat(filename);
    if (
        !before.isFile() ||
        sha256 !== fingerprint.sha256 ||
        ['size', 'mode', 'dev', 'ino'].some(
            (field) => before[field] !== fingerprint[field] || after[field] !== fingerprint[field]
        ) ||
        before.mtimeMs !== after.mtimeMs ||
        before.ctimeMs !== after.ctimeMs ||
        (strict &&
            (before.mtimeMs !== fingerprint.mtimeMs || before.ctimeMs !== fingerprint.ctimeMs))
    ) {
        throw new Error(`Migration file changed: ${filename}`);
    }
}

/**
 * Create checked parents one at a time and journal only directories we created.
 *
 * @param {string} directory absolute directory
 * @param {string[]} created created-directory journal
 * @returns {Promise.<void>} completion
 */
async function ensureDirectory(directory, created) {
    const parent = path.dirname(directory);
    if (parent !== directory) {
        await ensureDirectory(parent, created);
    }
    if (!(await safeStat(directory, true))) {
        await fs.mkdir(directory);
        created.push(directory);
    }
    if (!(await safeStat(directory)).isDirectory()) {
        throw new Error(`Migration destination parent is not a directory: ${directory}`);
    }
}

/**
 * Remove only empty checked directories; retain and report unexpected cleanup failures.
 *
 * @param {string[]} directories deepest directories first
 * @returns {Promise.<{removedDirectories: string[], cleanupErrors: string[]}>} cleanup outcome
 */
async function cleanDirectories(directories) {
    const removedDirectories = [];
    const cleanupErrors = [];
    for (const directory of directories) {
        try {
            const stat = await safeStat(directory, true);
            if (stat?.isDirectory()) {
                await fs.rmdir(directory);
                removedDirectories.push(directory);
            }
        } catch (ex) {
            if (ex.code !== 'ENOTEMPTY' && ex.code !== 'EEXIST') {
                cleanupErrors.push(`${directory}: ${ex.message}`);
            }
        }
    }
    return { removedDirectories, cleanupErrors };
}

/**
 * Execute only approved moves locally, with exclusive creation and an in-memory rollback journal.
 * Hard links preserve bytes and modes without overwriting an existing destination. Unsupported
 * hard links fail safely. This handles ordinary errors, not crashes or adversarial filesystem races.
 * Callers must display cleanupErrors and perform their own Git/confirmation checks beforehand.
 *
 * @param {Awaited<ReturnType<import('./v10/assetPlan.js').planAssetMigration>>} approvedPlan approved manifest
 * @param {{link?: typeof fs.link, unlink?: typeof fs.unlink}} [operations] scoped fault-injection seam
 * @returns {Promise.<{movedFiles: number, removedDirectories: string[], cleanupErrors: string[]}>} result
 */
export async function executeAssetMigration(approvedPlan, operations = {}) {
    // Freeze the caller's proposal across awaits; full replanning also rejects tampered paths/moves.
    const plan = structuredClone(approvedPlan);
    await assertAssetMigrationPlanCurrent(plan);
    const link = operations.link || fs.link;
    const unlink = operations.unlink || fs.unlink;
    const journal = [];
    const created = [];
    try {
        for (const move of plan.moves) {
            const source = path.join(plan.assetRoot, move.source);
            const destination = path.join(plan.assetRoot, move.destination);
            await verify(source, move.fingerprint, true);
            await ensureDirectory(path.dirname(destination), created);
            if (await safeStat(destination, true)) {
                throw new Error(`Migration destination collision: ${destination}`);
            }
            await verify(source, move.fingerprint, true);
            // link is exclusive even if a destination appears after the preceding check.
            await link(source, destination);
            const entry = { source, destination, fingerprint: move.fingerprint, removed: false };
            journal.push(entry);
            await verify(destination, move.fingerprint);
            await verify(source, move.fingerprint);
            await unlink(source);
            entry.removed = true;
        }
        for (const entry of journal) {
            await verify(entry.destination, entry.fingerprint);
            if (await safeStat(entry.source, true)) {
                throw new Error(`Migration source reappeared: ${entry.source}`);
            }
        }
    } catch (ex) {
        const rollbackErrors = [];
        for (const entry of journal.toReversed()) {
            try {
                await verify(entry.destination, entry.fingerprint);
                if (entry.removed) {
                    if (await safeStat(entry.source, true)) {
                        throw new Error(`Rollback source collision: ${entry.source}`, {
                            cause: ex,
                        });
                    }
                    await fs.link(entry.destination, entry.source);
                }
                await verify(entry.source, entry.fingerprint);
                await verify(entry.destination, entry.fingerprint);
                await fs.unlink(entry.destination);
            } catch (ex) {
                rollbackErrors.push(`${entry.source} <- ${entry.destination}: ${ex.message}`);
            }
        }
        const cleanup = await cleanDirectories(created.toReversed());
        rollbackErrors.push(...cleanup.cleanupErrors);
        if (rollbackErrors.length) {
            /** @type {Error & {rollbackErrors?: string[]}} */
            const error = new Error(
                `Migration failed: ${ex.message}. Rollback incomplete; manual recovery required:\n${rollbackErrors.join('\n')}`,
                { cause: ex }
            );
            error.rollbackErrors = rollbackErrors;
            throw error;
        }
        throw new Error(`Migration failed; rollback completed: ${ex.message}`, { cause: ex });
    }
    // Only original source ancestors are eligible; unrelated empty directories are left alone.
    const sourceDirectories = new Set();
    for (const { source } of journal) {
        let directory = path.dirname(source);
        while (directory !== plan.assetRoot) {
            sourceDirectories.add(directory);
            directory = path.dirname(directory);
        }
    }
    const cleanup = await cleanDirectories(
        [...sourceDirectories].toSorted((a, b) => b.length - a.length)
    );
    return { movedFiles: journal.length, ...cleanup };
}
