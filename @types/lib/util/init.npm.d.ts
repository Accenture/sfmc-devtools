export default Init;
declare namespace Init {
    /**
     * Prepare package changes without writing or invoking npm.
     *
     * @param {string} [repoName] optional initial project name
     * @param {string} [versionBeforeUpgrade] original project version for retirement gating
     * @returns {Promise.<object | false>} approved package and dependency installation plan
     */
    function preflightDependencies(repoName?: string, versionBeforeUpgrade?: string): Promise<object | false>;
    /**
     * Apply an approved package migration and install package-derived defaults.
     *
     * @param {string} [repoName] initial project name
     * @param {string} [versionBeforeUpgrade] original pre-v10 project version, retained for migration retries
     * @param {object} [prepared] preflight result from the orchestrator
     * @returns {Promise.<boolean>} whether installation succeeded
     */
    function installDependencies(repoName?: string, versionBeforeUpgrade?: string, prepared?: object): Promise<boolean>;
    /**
     * Apply owned defaults while retaining unrelated project settings.
     *
     * @param {object} currentContent existing package contents
     * @returns {object} updated package contents
     */
    function _getDefaultPackageJson(currentContent: object): object;
}
//# sourceMappingURL=init.npm.d.ts.map