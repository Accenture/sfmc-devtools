/**
 * Migrate one exact configured retrieve BU using only local, explicitly confirmed moves.
 * Dependencies are injectable for isolated command integration tests.
 *
 * @param {string} businessUnit exact credential/BU selector
 * @param {object} [options] local execution dependencies
 * @returns {Promise.<object>} cancelled, noop or migrated result
 */
export function migrate(businessUnit: string, options?: object): Promise<object>;
//# sourceMappingURL=migrate.d.ts.map