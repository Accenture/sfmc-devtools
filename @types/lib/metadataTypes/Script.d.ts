export default Script;
export type BuObject = import("../../types/mcdev.d.js").BuObject;
export type CodeExtract = import("../../types/mcdev.d.js").CodeExtract;
export type CodeExtractItem = import("../../types/mcdev.d.js").CodeExtractItem;
export type MetadataTypeItem = import("../../types/mcdev.d.js").MetadataTypeItem;
export type MetadataTypeItemDiff = import("../../types/mcdev.d.js").MetadataTypeItemDiff;
export type MetadataTypeItemObj = import("../../types/mcdev.d.js").MetadataTypeItemObj;
export type MetadataTypeMap = import("../../types/mcdev.d.js").MetadataTypeMap;
export type MetadataTypeMapObj = import("../../types/mcdev.d.js").MetadataTypeMapObj;
export type SoapRequestParams = import("../../types/mcdev.d.js").SoapRequestParams;
export type TemplateMap = import("../../types/mcdev.d.js").TemplateMap;
export type ContentBlockConversionTypes = import("../../types/mcdev.d.js").ContentBlockConversionTypes;
export type ScriptItem = import("../../types/mcdev.d.js").ScriptItem;
export type ScriptMap = import("../../types/mcdev.d.js").ScriptMap;
/**
 * @typedef {import('../../types/mcdev.d.js').BuObject} BuObject
 * @typedef {import('../../types/mcdev.d.js').CodeExtract} CodeExtract
 * @typedef {import('../../types/mcdev.d.js').CodeExtractItem} CodeExtractItem
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItem} MetadataTypeItem
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItemDiff} MetadataTypeItemDiff
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItemObj} MetadataTypeItemObj
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMap} MetadataTypeMap
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMapObj} MetadataTypeMapObj
 * @typedef {import('../../types/mcdev.d.js').SoapRequestParams} SoapRequestParams
 * @typedef {import('../../types/mcdev.d.js').TemplateMap} TemplateMap
 * @typedef {import('../../types/mcdev.d.js').ContentBlockConversionTypes} ContentBlockConversionTypes
 */
/**
 * @typedef {import('../../types/mcdev.d.js').ScriptItem} ScriptItem
 * @typedef {import('../../types/mcdev.d.js').ScriptMap} ScriptMap
 */
/**
 * Script MetadataType
 *
 * @augments MetadataType
 */
declare class Script extends MetadataType {
    /**
     * Retrieves Metadata of Script
     * Endpoint /automation/v1/scripts/ return all Scripts with all details.
     *
     * @param {string} [retrieveDir] Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<{metadata: ScriptMap, type: string}>} Promise
     */
    static retrieve(retrieveDir?: string, _?: void | string[], __?: void | string[], key?: string): Promise<{
        metadata: ScriptMap;
        type: string;
    }>;
    /**
     * Retrieves script metadata for caching
     *
     * @returns {Promise.<{metadata: ScriptMap, type: string}>} Promise
     */
    static retrieveForCache(): Promise<{
        metadata: ScriptMap;
        type: string;
    }>;
    /**
     * Retrieve a specific Script by Name
     *
     * @deprecated Use `retrieve` followed by `build` instead. `retrieveAsTemplate` will be removed in a future version.
     * @param {string} templateDir Directory where retrieved metadata directory will be saved
     * @param {string} name name of the metadata file
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {Promise.<{metadata: ScriptItem, type: string}>} Promise
     */
    static retrieveAsTemplate(templateDir: string, name: string, templateVariables: TemplateMap): Promise<{
        metadata: ScriptItem;
        type: string;
    }>;
    /**
     * Updates a single Script
     *
     * @param {MetadataTypeItem} script a single Script
     * @returns {Promise} Promise
     */
    static update(script: MetadataTypeItem): Promise<any>;
    /**
     * Creates a single Script
     *
     * @param {MetadataTypeItem} script a single Script
     * @returns {Promise} Promise
     */
    static create(script: MetadataTypeItem): Promise<any>;
    /**
     * helper for {@link Script.preDeployTasks} that loads extracted code content back into JSON
     *
     * @param {ScriptItem} metadata a single asset definition
     * @param {string} deployDir directory of deploy files
     * @param {string} [templateName] name of the template used to built defintion (prior applying templating)
     * @returns {Promise.<string>} content for metadata.script
     */
    static _mergeCode(metadata: ScriptItem, deployDir: string, templateName?: string): Promise<string>;
    /**
     * prepares a Script for deployment
     *
     * @param {ScriptItem} metadata a single script activity definition
     * @param {string} dir directory of deploy files
     * @returns {Promise.<ScriptItem>} Promise
     */
    static preDeployTasks(metadata: ScriptItem, dir: string): Promise<ScriptItem>;
    /**
     * helper for {@link MetadataType.buildDefinition}
     * handles extracted code if any are found for complex types
     *
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string|string[]} targetDir (List of) Directory where built definitions will be saved
     * @param {ScriptItem} metadata main JSON file that was read from file system
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @param {string} templateName name of the template to be built
     * @returns {Promise.<string[][]>} list of extracted files with path-parts provided as an array
     */
    static buildDefinitionForNested(templateDir: string, targetDir: string | string[], metadata: ScriptItem, templateVariables: TemplateMap, templateName: string): Promise<string[][]>;
    /**
     * helper for {@link MetadataType.buildTemplate}
     * handles extracted code if any are found for complex types
     *
     * @example scripts are saved as 1 json and 1 ssjs file. both files need to be run through templating
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string|string[]} targetDir (List of) Directory where built definitions will be saved
     * @param {ScriptItem} metadata main JSON file that was read from file system
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @param {string} templateName name of the template to be built
     * @returns {Promise.<string[][]>} list of extracted files with path-parts provided as an array
     */
    static buildTemplateForNested(templateDir: string, targetDir: string | string[], metadata: ScriptItem, templateVariables: TemplateMap, templateName: string): Promise<string[][]>;
    /**
     * helper for {@link Script.buildTemplateForNested} / {@link Script.buildDefinitionForNested}
     * handles extracted code if any are found for complex types
     *
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string|string[]} targetDir (List of) Directory where built definitions will be saved
     * @param {ScriptItem} metadata main JSON file that was read from file system
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @param {string} templateName name of the template to be built
     * @param {'definition'|'template'} mode defines what we use this helper for
     * @returns {Promise.<string[][]>} list of extracted files with path-parts provided as an array
     */
    static _buildForNested(templateDir: string, targetDir: string | string[], metadata: ScriptItem, templateVariables: TemplateMap, templateName: string, mode: "definition" | "template"): Promise<string[][]>;
    /**
     * manages post retrieve steps
     *
     * @param {ScriptItem} metadata a single item
     * @returns {CodeExtractItem} a single item with code parts extracted
     */
    static postRetrieveTasks(metadata: ScriptItem): CodeExtractItem;
    /**
     * manages post retrieve steps
     *
     * @param {ScriptItem} metadata a single item
     * @returns {CodeExtractItem} a single item with code parts extracted
     */
    static getCodeExtractItem(metadata: ScriptItem): CodeExtractItem;
    /**
     * helper for {@link Script.postRetrieveTasks} and {@link Script._buildForNested}
     *
     * @param {string} metadataScript the code of the file
     * @param {string} metadataName the name of the metadata
     * @returns {{fileExt:string,code:string}} returns found extension and file content
     */
    static prepExtractedCode(metadataScript: string, metadataName: string): {
        fileExt: string;
        code: string;
    };
    /**
     * helper to allow us to select single metadata entries via REST
     *
     * @private
     * @param {string} key customer key
     * @returns {Promise.<string>} objectId or enpty string
     */
    private static _getObjectIdForSingleRetrieve;
    /**
     * clean up after deleting a metadata item
     *
     * @param {string} customerKey Identifier of metadata item
     * @returns {Promise.<void>} -
     */
    static postDeleteTasks(customerKey: string): Promise<void>;
    /**
     *
     * @param {MetadataTypeItem} item single metadata item
     * @param {string} retrieveDir directory where metadata is saved
     * @param {Set.<string>} [findAssetKeys] list of keys that were found referenced via ContentBlockByX; if set, method only gets keys and runs no updates
     * @returns {Promise.<CodeExtractItem>} key of the item that was updated
     */
    static replaceCbReference(item: MetadataTypeItem, retrieveDir: string, findAssetKeys?: Set<string>): Promise<CodeExtractItem>;
}
declare namespace Script {
    let definition: {
        bodyIteratorField: string;
        dependencies: string[];
        dependencyGraph: any;
        folderType: string;
        hasExtended: boolean;
        idField: string;
        keyIsFixed: boolean;
        keyField: string;
        nameField: string;
        folderIdField: string;
        createdDateField: string;
        createdNameField: any;
        lastmodDateField: string;
        lastmodNameField: any;
        restPagination: boolean;
        type: string;
        typeDescription: string;
        typeRetrieveByDefault: boolean;
        typeCdpByDefault: boolean;
        typeName: string;
        fields: {
            categoryId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            createdBy: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            createdDate: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            description: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            folderLocationText: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            key: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            modifiedBy: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            modifiedDate: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            name: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            script: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            ssjsActivityId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            status: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            statusId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            r__folder_Path: {
                skipValidation: boolean;
            };
        };
    };
}
import MetadataType from './MetadataType.js';
//# sourceMappingURL=Script.d.ts.map