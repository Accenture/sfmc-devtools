export default Init;
declare namespace Init {
    /**
     * Update project tooling defaults and install dependencies.
     *
     * @param {string} [repoName] optional initial project name
     * @param {string} [versionBeforeUpgrade] original project version for retirement gating
     * @returns {Promise.<boolean>} whether installation succeeded
     */
    function installDependencies(repoName?: string, versionBeforeUpgrade?: string): Promise<boolean>;
    /**
     * Apply owned defaults while retaining unrelated project settings.
     *
     * @param {object} currentContent existing package contents
     * @returns {object} updated package contents
     */
    function _getDefaultPackageJson(currentContent: object): object;
}
//# sourceMappingURL=init.npm.d.ts.map