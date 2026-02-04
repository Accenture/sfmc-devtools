export default Filter;
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
export type FilterItem = import("../../types/mcdev.d.js").FilterItem;
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
 * @typedef {import('../../types/mcdev.d.js').FilterItem} FilterItem
 */
/**
 * Filter MetadataType
 *
 * @augments MetadataType
 */
declare class Filter extends MetadataType {
    /**
     * Retrieves Metadata of Filter.
     * Endpoint /automation/v1/filters/ returns all Filters,
     * but only with some of the fields. So it is needed to loop over
     * Filters with the endpoint /automation/v1/filters/{id}
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise
     */
    static retrieve(retrieveDir: string, _?: void | string[], __?: void | string[], key?: string): Promise<MetadataTypeMapObj>;
    /**
     * parses retrieved Metadata before saving
     *
     * @param {FilterItem} metadata a single record
     * @returns {FilterItem} parsed metadata definition
     */
    static postRetrieveTasks(metadata: FilterItem): FilterItem;
    /**
     * helper for postRetrieveTasks to map data types
     *
     * @param {'source'|'destination'} target we are processing source and destinations
     * @param {FilterItem} metadata single record
     */
    static _postRetrieve_dataTypeMapping(target: "source" | "destination", metadata: FilterItem): void;
    /**
     * helper for preDeployTasks to map data types
     *
     * @param {'source'|'destination'} target we are processing source and destinations
     * @param {FilterItem} metadata single record
     * @param {FilterItem} cachedVersion cached version of the metadata
     */
    static _preDeploy_dataTypeMapping(target: "source" | "destination", metadata: FilterItem, cachedVersion: FilterItem): void;
    /**
     * Creates a single item
     * this uses soap API because the rest api does not allow hotlinking to an existing target DE
     *
     * @param {FilterItem} item a single item
     * @returns {Promise} Promise
     */
    static create(item: FilterItem): Promise<any>;
    /**
     * helper that converts the rest item into a soap item
     *
     * @param {FilterItem} item a single item
     * @returns {object} SOAP formatted filter item
     */
    static preCreateSOAPItem(item: FilterItem): object;
    /**
     * helper that runs update on all create calls to ensure all fields are set
     *
     * @param {FilterItem} restItem original rest item
     * @param {object} response SOAP response
     * @returns {Promise.<FilterItem>} created item
     */
    static postCreateTasks(restItem: FilterItem, response: object): Promise<FilterItem>;
    /**
     * Updates a single item
     *
     * @param {MetadataTypeItem} item a single item
     * @returns {Promise} Promise
     */
    static update(item: MetadataTypeItem): Promise<any>;
    /**
     * prepares a record for deployment
     *
     * @param {FilterItem} metadata a single record
     * @returns {Promise.<FilterItem>} Promise of updated single record
     */
    static preDeployTasks(metadata: FilterItem): Promise<FilterItem>;
    /**
     * helper to allow us to select single metadata entries via REST
     *
     * @private
     * @param {string} key customer key
     * @returns {Promise.<string>} objectId or empty string
     */
    private static _getObjectIdForSingleRetrieve;
}
declare namespace Filter {
    let definition: {
        bodyIteratorField: string;
        dependencies: string[];
        dependencyGraph: {
            filterDefinition: string[];
            dataExtension: string[];
        };
        hasExtended: boolean;
        idField: string;
        keyIsFixed: boolean;
        keyField: string;
        nameField: string;
        folderType: string;
        folderIdField: string;
        filter: {
            statusId: number;
        };
        createdDateField: string;
        createdNameField: any;
        lastmodDateField: string;
        lastmodNameField: any;
        restPagination: boolean;
        maxKeyLength: number;
        type: string;
        soapType: string;
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
            createdDate: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            customerKey: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            CustomerKey: {
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
            Description: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            destinationObjectId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            DestinationObjectID: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            destinationTypeId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            DestinationTypeID: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            filterActivityId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            filterDefinitionId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            FilterDefinitionID: {
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
            Name: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            sourceObjectId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            SourceObjectID: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            sourceTypeId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            SourceTypeID: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            filterDefinitionSourceTypeId: {
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
            resultDEName: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            resultDEKey: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            resultDEDescription: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            r__folder_Path: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            r__dataFilter_key: {
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
            r__destination_dataExtension_key: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
        };
    };
}
import MetadataType from './MetadataType.js';
//# sourceMappingURL=Filter.d.ts.map