export default Init;
export type AuthObject = import("../../types/mcdev.d.js").AuthObject;
export type BuObject = import("../../types/mcdev.d.js").BuObject;
export type Cache = import("../../types/mcdev.d.js").Cache;
export type CodeExtract = import("../../types/mcdev.d.js").CodeExtract;
export type CodeExtractItem = import("../../types/mcdev.d.js").CodeExtractItem;
export type DeltaPkgItem = import("../../types/mcdev.d.js").DeltaPkgItem;
export type Mcdevrc = import("../../types/mcdev.d.js").Mcdevrc;
export type MetadataTypeItem = import("../../types/mcdev.d.js").MetadataTypeItem;
export type MetadataTypeItemDiff = import("../../types/mcdev.d.js").MetadataTypeItemDiff;
export type MetadataTypeItemObj = import("../../types/mcdev.d.js").MetadataTypeItemObj;
export type MetadataTypeMap = import("../../types/mcdev.d.js").MetadataTypeMap;
export type MetadataTypeMapObj = import("../../types/mcdev.d.js").MetadataTypeMapObj;
export type MultiMetadataTypeList = import("../../types/mcdev.d.js").MultiMetadataTypeList;
export type MultiMetadataTypeMap = import("../../types/mcdev.d.js").MultiMetadataTypeMap;
export type SoapRequestParams = import("../../types/mcdev.d.js").SoapRequestParams;
export type TemplateMap = import("../../types/mcdev.d.js").TemplateMap;
export type TypeKeyCombo = import("../../types/mcdev.d.js").TypeKeyCombo;
declare namespace Init {
    /**
     * Creates template file for properties.json
     *
     * @param {Mcdevrc} properties config file's json
     * @param {string} [credentialName] identifying name of the installed package / project; if set, will update this credential
     * @param {boolean} [refreshBUs] if this was triggered by mcdev join, do not refresh BUs
     * @returns {Promise.<void>} -
     */
    function initProject(properties: Mcdevrc, credentialName?: string, refreshBUs?: boolean): Promise<void>;
    /**
     * Creates template file for properties.json
     *
     * @returns {Promise.<void>} -
     */
    function joinProject(): Promise<void>;
    /**
     * helper for @initProject that optionally creates markets and market lists for all BUs
     */
    function _initMarkets(): Promise<void>;
    /**
     * helper for {@link Init.initProject}
     *
     * @param {string} bu cred/bu or cred/* or *
     * @param {string} gitStatus signals what state the git repo is in
     * @returns {Promise.<void>} -
     */
    function _downloadAllBUs(bu: string, gitStatus: string): Promise<void>;
    /**
     * wrapper around npm dependency & configuration file setup
     *
     * @param {Mcdevrc} properties config file's json
     * @param {boolean} [initial] print message if not part of initial setup
     * @param {string} [repoName] if git URL was provided earlier, the repo name was extracted to use it for npm init
     * @returns {Promise.<boolean>} success flag
     */
    function upgradeProject(properties: Mcdevrc, initial?: boolean, repoName?: string): Promise<boolean>;
    /**
     * check if git repo is being saved on a cloud service and warn the user
     *
     * @private
     * @returns {Promise.<boolean>} true if path is good; false if project seems to be in a cloud service folder
     */
    function _checkPathForCloud(): Promise<boolean>;
    /**
     * finds credentials that are set up in config but not in auth file
     *
     * @private
     * @param {Mcdevrc} properties javascript object in .mcdevrc.json
     * @returns {string[]} list of credential names
     */
    function _getMissingCredentials(properties: Mcdevrc): string[];
}
//# sourceMappingURL=init.d.ts.map