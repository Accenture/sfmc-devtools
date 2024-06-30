export default Init;
export type AuthObject = import('../../types/mcdev.d.js').AuthObject;
export type BuObject = import('../../types/mcdev.d.js').BuObject;
export type Cache = import('../../types/mcdev.d.js').Cache;
export type CodeExtract = import('../../types/mcdev.d.js').CodeExtract;
export type CodeExtractItem = import('../../types/mcdev.d.js').CodeExtractItem;
export type DeltaPkgItem = import('../../types/mcdev.d.js').DeltaPkgItem;
export type Mcdevrc = import('../../types/mcdev.d.js').Mcdevrc;
export type MetadataTypeItem = import('../../types/mcdev.d.js').MetadataTypeItem;
export type MetadataTypeItemDiff = import('../../types/mcdev.d.js').MetadataTypeItemDiff;
export type MetadataTypeItemObj = import('../../types/mcdev.d.js').MetadataTypeItemObj;
export type MetadataTypeMap = import('../../types/mcdev.d.js').MetadataTypeMap;
export type MetadataTypeMapObj = import('../../types/mcdev.d.js').MetadataTypeMapObj;
export type MultiMetadataTypeList = import('../../types/mcdev.d.js').MultiMetadataTypeList;
export type MultiMetadataTypeMap = import('../../types/mcdev.d.js').MultiMetadataTypeMap;
export type SoapRequestParams = import('../../types/mcdev.d.js').SoapRequestParams;
export type TemplateMap = import('../../types/mcdev.d.js').TemplateMap;
export type TypeKeyCombo = import('../../types/mcdev.d.js').TypeKeyCombo;
declare namespace Init {
    /**
     * helper method for this.upgradeProject that upgrades project config if needed
     *
     * @param {Mcdevrc} properties config file's json
     * @returns {Promise.<boolean>} returns true if worked without errors
     */
    function fixMcdevConfig(properties: import("../../types/mcdev.d.js").Mcdevrc): Promise<boolean>;
    /**
     * handles creation/update of all config file from the boilerplate
     *
     * @param {string} versionBeforeUpgrade 'x.y.z'
     * @returns {Promise.<boolean>} status of config file creation
     */
    function createIdeConfigFiles(versionBeforeUpgrade: string): Promise<boolean>;
    /**
     * recursive helper for {@link Init.fixMcdevConfig} that adds missing settings
     *
     * @param {object} propertiersCur current sub-object of project settings
     * @param {object} defaultPropsCur current sub-object of default settings
     * @param {string} fieldName dot-concatenated object-path that needs adding
     * @returns {void}
     */
    function _updateLeaf(propertiersCur: any, defaultPropsCur: any, fieldName: string): void;
    /**
     * returns list of files that need to be updated
     *
     * @param {string} projectVersion version found in config file of the current project
     * @returns {Promise.<{updates:string[],deletes:string[]}>} relevant files with path that need to be updated
     */
    function _getForcedUpdateList(projectVersion: string): Promise<{
        updates: string[];
        deletes: string[];
    }>;
    /**
     * handles creation/update of one config file from the boilerplate at a time
     *
     * @param {string[]} fileNameArr 0: path, 1: filename, 2: extension with dot
     * @param {{updates:string[],deletes:string[]}} relevantForced if fileNameArr is in this list we require an override
     * @param {string} [boilerplateFileContent] in case we cannot copy files 1:1 this can be used to pass in content
     * @returns {Promise.<boolean>} install successful or error occured
     */
    function _createIdeConfigFile(fileNameArr: string[], relevantForced: {
        updates: string[];
        deletes: string[];
    }, boilerplateFileContent?: string): Promise<boolean>;
    /**
     * handles creation/update of one config file from the boilerplate at a time
     *
     * @param {{updates:string[],deletes:string[]}} relevantForced if fileNameArr is in this list we require an override
     * @returns {Promise.<boolean>} install successful or error occured
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