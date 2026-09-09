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
     * helper method for this.upgradeProject that upgrades project config if needed
     *
     * @param {Mcdevrc} properties config file's json
     * @param {string} [versionToPersist] version to store while saving config migrations
     * @returns {Promise.<boolean>} returns true if worked without errors
     */
    function fixMcdevConfig(properties: Mcdevrc, versionToPersist?: string): Promise<boolean>;
    /**
     * handles creation/update of all config file from the boilerplate
     *
     * @param {string} versionBeforeUpgrade 'x.y.z'
     * @param {object} [prepared] approved preflight result
     * @returns {Promise.<boolean>} status of config file creation
     */
    function createIdeConfigFiles(versionBeforeUpgrade: string, prepared?: object): Promise<boolean>;
    /**
     * Require real interactive consent; automation flags never approve tooling overrides.
     *
     * @param {string} message description of the required changes
     * @returns {Promise.<boolean>} explicit approval, or false when declined/unattended
     */
    function confirmToolingReplacement(message: string): Promise<boolean>;
    /**
     * Prompt for a configuration selection independently of automation options.
     *
     * @param {string} message selection to present
     * @param {boolean} [defaultValue] initial selection
     * @returns {Promise.<boolean>} user's selection
     */
    function promptConfirmation(message: string, defaultValue?: boolean): Promise<boolean>;
    /**
     * Inspect all destinations and backups before any coupled tooling mutation.
     *
     * @param {string} versionBeforeUpgrade prior project version
     * @returns {Promise.<object | false>} approved writes and retirements, or false
     */
    function preflightIdeConfigFiles(versionBeforeUpgrade: string): Promise<object | false>;
    /**
     * Check entry occupancy without following links or hiding access errors.
     *
     * @param {string} fileName destination or backup path
     * @returns {Promise.<boolean>} whether the directory entry exists
     */
    function _hasDirectoryEntry(fileName: string): Promise<boolean>;
    /**
     * recursive helper for {@link Init.fixMcdevConfig} that adds missing settings
     *
     * @param {object} propertiersCur current sub-object of project settings
     * @param {object} defaultPropsCur current sub-object of default settings
     * @param {string} fieldName dot-concatenated object-path that needs adding
     * @returns {boolean} was something updated or not
     */
    function _updateLeaf(propertiersCur: object, defaultPropsCur: object, fieldName: string): boolean;
    /**
     * returns list of files that need to be updated
     *
     * @param {string} projectVersion version found in config file of the current project
     * @param {object[]} [migrations] metadata already loaded by the coupled preflight
     * @returns {Promise.<{updates:string[],deletes:string[]}>} relevant files with path that need to be updated
     */
    function _getForcedUpdateList(projectVersion: string, migrations?: object[]): Promise<{
        updates: string[];
        deletes: string[];
    }>;
    /**
     * handles deletion of no longer needed config files
     *
     * @param {{updates:string[],deletes:string[]}} relevantForced if file is in .deletes, we require deleting/renaming it
     * @returns {Promise.<boolean>} deletion successful or error occured
     */
    function _removeIdeConfigFiles(relevantForced: {
        updates: string[];
        deletes: string[];
    }): Promise<boolean>;
    /**
     * helper method for this.upgradeProject that upgrades project config if needed
     *
     * @returns {Promise.<boolean>} returns true if worked without errors
     */
    function upgradeAuthFile(): Promise<boolean>;
}
//# sourceMappingURL=init.config.d.ts.map