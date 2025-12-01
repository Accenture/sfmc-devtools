export default Init;
declare namespace Init {
    /**
     * initiates npm project and then
     * takes care of loading the pre-configured dependency list
     * from the boilerplate directory to them as dev-dependencies
     *
     * @param {string} [repoName] if git URL was provided earlier, the repo name was extracted to use it for npm init
     * @returns {Promise.<boolean>} install successful or error occured
     */
    function installDependencies(repoName?: string): Promise<boolean>;
    /**
     * ensure we have certain default values in our config
     *
     * @param {object} [currentContent] what was read from existing package.json file
     * @returns {Promise.<{script: object, author: string, license: string}>} extended currentContent
     */
    function _getDefaultPackageJson(currentContent?: object): Promise<{
        script: object;
        author: string;
        license: string;
    }>;
}
//# sourceMappingURL=init.npm.d.ts.map