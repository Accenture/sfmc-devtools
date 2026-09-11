/**
 * Ordered local migrations. Applicability comes from the asset layout, not config version.
 * Keep v10 independent of the temporary delta compatibility adapter.
 */
export const migrationRegistry = [
    {
        version: 'v10',
        /**
         * Load the asset planner only after local command preflight.
         *
         * @param {string} assetRoot selected BU asset directory
         * @returns {Promise.<object>} complete read-only manifest
         */
        async plan(assetRoot) {
            const { planAssetMigration } = await import('./v10/assetPlan.js');
            return planAssetMigration(assetRoot);
        },
        /**
         * Execute a confirmed manifest without Git mutations.
         *
         * @param {object} plan complete manifest
         * @returns {Promise.<object>} move and cleanup result
         */
        async execute(plan) {
            const { executeAssetMigration } = await import('./execute.js');
            return executeAssetMigration(plan);
        },
    },
];
