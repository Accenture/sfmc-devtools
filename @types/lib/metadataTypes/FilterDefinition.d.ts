export default FilterDefinition;
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
export type FilterDefinitionItem = import("../../types/mcdev.d.js").FilterDefinitionItem;
export type FilterDefinitionMap = import("../../types/mcdev.d.js").FilterDefinitionMap;
export type MultiMetadataTypeMap = import("../../types/mcdev.d.js").MultiMetadataTypeMap;
export type FilterConditionSet = import("../../types/mcdev.d.js").FilterConditionSet;
export type FilterCondition = import("../../types/mcdev.d.js").FilterCondition;
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
 * @typedef {import('../../types/mcdev.d.js').FilterDefinitionItem} FilterDefinitionItem
 * @typedef {import('../../types/mcdev.d.js').FilterDefinitionMap} FilterDefinitionMap
 * @typedef {import('../../types/mcdev.d.js').MultiMetadataTypeMap} MultiMetadataTypeMap
 * @typedef {import('../../types/mcdev.d.js').FilterConditionSet} FilterConditionSet
 * @typedef {import('../../types/mcdev.d.js').FilterCondition} FilterCondition
 */
/**
 * FilterDefinition MetadataType
 *
 * @augments MetadataType
 */
declare class FilterDefinition extends MetadataType {
    static cache: {};
    static deIdKeyMap: any;
    static hidden: boolean;
    /**
     * Retrieves all records and saves it to disk
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {string[]} [_] unused parameter
     * @param {string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<{metadata: FilterDefinitionMap, type: string}>} Promise of items
     */
    static retrieve(retrieveDir: string, _?: string[], __?: string[], key?: string): Promise<{
        metadata: FilterDefinitionMap;
        type: string;
    }>;
    /**
     * helper for {@link FilterDefinition.retrieve}
     *
     * @param {boolean} [recached] indicates if this is a recursive call after cache refresh
     * @returns {Promise.<number[]>} Array of folder IDs
     */
    static _getFilterFolderIds(recached?: boolean): Promise<number[]>;
    /**
     * helper for {@link FilterDefinition._cacheMeasures}
     *
     * @returns {Promise.<number[]>} Array of folder IDs
     */
    static _getMeasureFolderIds(): Promise<number[]>;
    /**
     * helper for {@link FilterDefinition.retrieve}. uses cached dataExtensions to resolve dataExtensionFields
     *
     * @param {FilterDefinitionMap} metadataTypeMap -
     * @param {'retrieve'|'deploy'} [mode] -
     */
    static _cacheDeFields(metadataTypeMap: FilterDefinitionMap, mode?: "retrieve" | "deploy"): Promise<void>;
    /**
     * helper for {@link FilterDefinition.retrieve}
     *
     * @param {FilterDefinitionMap} metadataTypeMap -
     */
    static _cacheContactAttributes(metadataTypeMap: FilterDefinitionMap): Promise<void>;
    /**
     * helper for {@link FilterDefinition.retrieve}
     *
     * @param {FilterDefinitionMap} metadataTypeMap -
     */
    static _cacheMeasures(metadataTypeMap: FilterDefinitionMap): Promise<void>;
    /**
     * Retrieves all records for caching
     *
     * @returns {Promise.<{metadata: FilterDefinitionMap, type: string}>} Promise of items
     */
    static retrieveForCache(): Promise<{
        metadata: FilterDefinitionMap;
        type: string;
    }>;
    /**
     * parses retrieved Metadata before saving
     *
     * @param {FilterDefinitionItem} metadata a single record
     * @returns {Promise.<FilterDefinitionItem>} parsed metadata definition
     */
    static postRetrieveTasks(metadata: FilterDefinitionItem): Promise<FilterDefinitionItem>;
    /**
     * helper for {@link postRetrieveTasks}
     *
     * @param {FilterDefinitionItem} metadata -
     * @param {'postRetrieve'|'preDeploy'} mode -
     * @param {object[]} [fieldCache] -
     * @param {FilterConditionSet} [filter] -
     * @returns {void}
     */
    static _resolveFields(metadata: FilterDefinitionItem, mode: "postRetrieve" | "preDeploy", fieldCache?: object[], filter?: FilterConditionSet): void;
    /**
     * helper for {@link _resolveFields}
     *
     * @param {FilterCondition} condition -
     * @param {object[]} fieldCache -
     * @returns {void}
     */
    static _postRetrieve_resolveFieldIdsCondition(condition: FilterCondition, fieldCache: object[]): void;
    /**
     * helper for {@link _resolveFields}
     *
     * @param {FilterCondition} condition -
     * @param {object[]} fieldCache -
     * @returns {void}
     */
    static _preDeploy_resolveFieldNamesCondition(condition: FilterCondition, fieldCache: object[]): void;
    /**
     * helper for {@link postRetrieveTasks}
     *
     * @param {FilterDefinitionItem} metadata -
     * @param {object} [filter] -
     * @returns {void}
     */
    static _postRetrieve_resolveAttributeIds(metadata: FilterDefinitionItem, filter?: object): void;
    /**
     * prepares a item for deployment
     *
     * @param {FilterDefinitionItem} metadata a single record
     * @returns {Promise.<FilterDefinitionItem>} Promise of updated single item
     */
    static preDeployTasks(metadata: FilterDefinitionItem): Promise<FilterDefinitionItem>;
    /**
     * Creates a single item
     *
     * @param {FilterDefinitionItem} metadata a single item
     * @returns {Promise.<FilterDefinitionItem>} Promise
     */
    static create(metadata: FilterDefinitionItem): Promise<FilterDefinitionItem>;
    /**
     * Updates a single item
     *
     * @param {FilterDefinitionItem} metadata a single item
     * @returns {Promise.<FilterDefinitionItem>} Promise
     */
    static update(metadata: FilterDefinitionItem): Promise<FilterDefinitionItem>;
    /**
     * helper to allow us to select single metadata entries via REST
     *
     * @private
     * @param {string} key customer key
     * @returns {Promise.<string>} objectId or enpty string
     */
    private static _getObjectIdForSingleRetrieve;
}
declare namespace FilterDefinition {
    let dataExtensionFieldCache: {
        [x: string]: import("../../types/mcdev.d.js").DataExtensionFieldItem;
    };
    let definition: {
        bodyIteratorField: string;
        dependencies: string[];
        dependencyGraph: {
            dataExtension: string[];
        };
        filter: {};
        hasExtended: boolean;
        idField: string;
        keyField: string;
        nameField: string;
        folderType: string;
        folderIdField: string;
        createdDateField: string;
        createdNameField: string;
        lastmodDateField: string;
        lastmodNameField: string;
        restPagination: boolean;
        restPageSize: number;
        type: string;
        soapType: string;
        typeDescription: string;
        typeRetrieveByDefault: boolean;
        typeName: string;
        fields: {
            id: {
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
            createdDate: {
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
            createdByName: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            lastUpdated: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            lastUpdatedBy: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            lastUpdatedByName: {
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
            categoryId: {
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
            filterDefinitionXml: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            derivedFromType: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            derivedFromObjectId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            derivedFromObjectTypeName: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            derivedFromObjectName: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            isSendable: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            r__source_dataExtension_key: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            c__filterDefinition: {
                skipValidation: boolean;
            };
            r__folder_Path: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
        };
    };
}
import MetadataType from './MetadataType.js';
//# sourceMappingURL=FilterDefinition.d.ts.map