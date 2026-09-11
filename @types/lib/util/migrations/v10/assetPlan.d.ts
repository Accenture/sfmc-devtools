/**
 * Build a complete read-only v10 manifest for one selected BU asset root.
 * Owners are inventoried by exact metadata suffix; only the existing wrapper resolves companions.
 * Unknown historical owners and unaccounted historical files block rather than being skipped.
 *
 * @param {string} assetRoot absolute selected BU asset directory (BU parent must exist)
 * @returns {Promise.<{assetRoot: string, assetRootExists: boolean, version: string, owners: object[], moves: object[], inventory: object[]}>} deterministic manifest with POSIX paths and source fingerprints
 */
export function planAssetMigration(assetRoot: string): Promise<{
    assetRoot: string;
    assetRootExists: boolean;
    version: string;
    owners: object[];
    moves: object[];
    inventory: object[];
}>;
/**
 * Recheck the full selected tree, identities, destinations, bytes and modes before execution.
 * This does not check Git state and never updates or mutates the supplied manifest.
 *
 * @param {Awaited<ReturnType<typeof planAssetMigration>>} plan previously approved manifest
 * @returns {Promise.<void>} completion or a blocking error
 */
export function assertAssetMigrationPlanCurrent(plan: Awaited<ReturnType<typeof planAssetMigration>>): Promise<void>;
//# sourceMappingURL=assetPlan.d.ts.map