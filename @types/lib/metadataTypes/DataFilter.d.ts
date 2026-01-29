export default DataFilter;
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
export type DataFilterItem = import("../../types/mcdev.d.js").DataFilterItem;
export type DataFilterMap = import("../../types/mcdev.d.js").DataFilterMap;
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
 * @typedef {import('../../types/mcdev.d.js').DataFilterItem} DataFilterItem
 * @typedef {import('../../types/mcdev.d.js').DataFilterMap} DataFilterMap
 * @typedef {import('../../types/mcdev.d.js').MultiMetadataTypeMap} MultiMetadataTypeMap
 * @typedef {import('../../types/mcdev.d.js').FilterConditionSet} FilterConditionSet
 * @typedef {import('../../types/mcdev.d.js').FilterCondition} FilterCondition
 */
/**
 * DataFilter (FilterDefinition) MetadataType
 *
 * @augments MetadataType
 */
declare class DataFilter extends MetadataType {
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
     * @returns {Promise.<{metadata: DataFilterMap, type: string}>} Promise of items
     */
    static retrieve(retrieveDir: string, _?: string[], __?: string[], key?: string): Promise<{
        metadata: DataFilterMap;
        type: string;
    }>;
    /**
     * helper for {@link DataFilter.retrieve}
     *
     * @param {boolean} [recached] indicates if this is a recursive call after cache refresh
     * @returns {Promise.<number[]>} Array of folder IDs
     */
    static _getFilterFolderIds(recached?: boolean): Promise<number[]>;
    /**
     * helper for {@link DataFilter._cacheMeasures}
     *
     * @returns {Promise.<number[]>} Array of folder IDs
     */
    static _getMeasureFolderIds(): Promise<number[]>;
    /**
     * helper for {@link DataFilter.retrieve}. uses cached dataExtensions to resolve dataExtensionFields
     *
     * @param {DataFilterMap} metadataTypeMap -
     * @param {'retrieve'|'deploy'} [mode] -
     */
    static _cacheDeFields(metadataTypeMap: DataFilterMap, mode?: "retrieve" | "deploy"): Promise<void>;
    /**
     * helper for {@link DataFilter.retrieve}
     *
     * @param {DataFilterMap} metadataTypeMap -
     */
    static _cacheContactAttributes(metadataTypeMap: DataFilterMap): Promise<void>;
    /**
     * helper for {@link DataFilter.retrieve}
     *
     * @param {DataFilterMap} metadataTypeMap -
     */
    static _cacheMeasures(metadataTypeMap: DataFilterMap): Promise<void>;
    /**
     * Retrieves all records for caching
     *
     * @returns {Promise.<{metadata: DataFilterMap, type: string}>} Promise of items
     */
    static retrieveForCache(): Promise<{
        metadata: DataFilterMap;
        type: string;
    }>;
    /**
     * parses retrieved Metadata before saving
     *
     * @param {DataFilterItem} metadata a single record
     * @returns {Promise.<DataFilterItem>} parsed metadata definition
     */
    static postRetrieveTasks(metadata: DataFilterItem): Promise<DataFilterItem>;
    /**
     * helper for {@link postRetrieveTasks}
     *
     * @param {DataFilterItem} metadata -
     * @param {'postRetrieve'|'preDeploy'} mode -
     * @param {object[]} [fieldCache] -
     * @param {FilterConditionSet} [filter] -
     * @returns {void}
     */
    static _resolveFields(metadata: DataFilterItem, mode: "postRetrieve" | "preDeploy", fieldCache?: object[], filter?: FilterConditionSet): void;
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
     * @param {DataFilterItem} metadata -
     * @param {object} [filter] -
     * @returns {void}
     */
    static _postRetrieve_resolveAttributeIds(metadata: DataFilterItem, filter?: object): void;
    /**
     * prepares a item for deployment
     *
     * @param {DataFilterItem} metadata a single record
     * @returns {Promise.<DataFilterItem>} Promise of updated single item
     */
    static preDeployTasks(metadata: DataFilterItem): Promise<DataFilterItem>;
    /**
     * Creates a single item
     *
     * @param {DataFilterItem} metadata a single item
     * @returns {Promise.<DataFilterItem>} Promise
     */
    static create(metadata: DataFilterItem): Promise<DataFilterItem>;
    /**
     * Updates a single item
     *
     * @param {DataFilterItem} metadata a single item
     * @returns {Promise.<DataFilterItem>} Promise
     */
    static update(metadata: DataFilterItem): Promise<DataFilterItem>;
    /**
     * helper to allow us to select single metadata entries via REST
     *
     * @private
     * @param {string} key customer key
     * @returns {Promise.<string>} objectId or enpty string
     */
    private static _getObjectIdForSingleRetrieve;
}
declare namespace DataFilter {
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
//# sourceMappingURL=DataFilter.d.ts.map