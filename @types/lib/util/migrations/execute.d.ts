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
export function executeAssetMigration(approvedPlan: Awaited<ReturnType<typeof import("./v10/assetPlan.js").planAssetMigration>>, operations?: {
    link?: typeof fs.link;
    unlink?: typeof fs.unlink;
}): Promise<{
    movedFiles: number;
    removedDirectories: string[];
    cleanupErrors: string[];
}>;
import fs from 'node:fs/promises';
//# sourceMappingURL=execute.d.ts.map