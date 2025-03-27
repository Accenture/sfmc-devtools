export default Init;
declare namespace Init {
    /**
     * check if git repo exists and otherwise create one
     *
     * @returns {Promise.<{status: string, repoName: string}>} success flag
     */
    function initGitRepo(): Promise<{
        status: string;
        repoName: string;
    }>;
    /**
     * offer to push the new repo straight to the server
     *
     * @returns {Promise.<void>} -
     */
    function gitPush(): Promise<void>;
    /**
     * offers to add the git remote origin
     *
     * @returns {Promise.<string>} repo name (optionally)
     */
    function _addGitRemote(): Promise<string>;
    /**
     * checks global config and ask to config the user info and then store it locally
     *
     * @returns {Promise.<void>} -
     */
    function _updateGitConfigUser(): Promise<void>;
    /**
     * retrieves the global user.name and user.email values
     *
     * @returns {Promise.<{'user.name': string, 'user.email': string}>} user.name and user.email
     */
    function _getGitConfigUser(): Promise<{
        "user.name": string;
        "user.email": string;
    }>;
}
//# sourceMappingURL=init.git.d.ts.map