export default ImportFile;
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
export type SDKError = import("../../types/mcdev.d.js").SDKError;
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
 * @typedef {import('../../types/mcdev.d.js').SDKError} SDKError
 */
/**
 * ImportFile MetadataType
 *
 * @augments MetadataType
 */
declare class ImportFile extends MetadataType {
    /**
     * Retrieves Metadata of Import File.
     * Endpoint /automation/v1/imports/ return all Import Files with all details.
     * Currently it is not needed to loop over Imports with endpoint /automation/v1/imports/{id}
     *
     * @param {string} [retrieveDir] Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise
     */
    static retrieve(retrieveDir?: string, _?: void | string[], __?: void | string[], key?: string): Promise<MetadataTypeMapObj>;
    /**
     * helper for {@link MetadataType.retrieveRESTcollection}
     *
     * @param {SDKError} ex exception
     * @param {string} key id or key of item
     * @param {string} url url to call for retry
     * @returns {Promise.<any>} can return retry-result
     */
    static handleRESTErrors(ex: SDKError, key: string, url: string): Promise<any>;
    /**
     * Retrieves import definition metadata for caching
     *
     * @param {void | string[]} [_] parameter not used
     * @param {void | string[]} [__] parameter not used
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise
     */
    static retrieveForCache(_?: void | string[], __?: void | string[], key?: string): Promise<MetadataTypeMapObj>;
    /**
     * Retrieve a specific Import Definition by Name
     *
     * @param {string} templateDir Directory where retrieved metadata directory will be saved
     * @param {string} name name of the metadata file
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {Promise.<MetadataTypeItemObj>} Promise
     */
    static retrieveAsTemplate(templateDir: string, name: string, templateVariables: TemplateMap): Promise<MetadataTypeItemObj>;
    /**
     * helper to allow us to select single metadata entries via REST
     *
     * @private
     * @param {string} key customer key
     * @returns {Promise.<string>} objectId or enpty string
     */
    private static _getObjectIdForSingleRetrieve;
    /**
     * Creates a single Import File
     *
     * @param {MetadataTypeItem} importFile a single Import File
     * @returns {Promise} Promise
     */
    static create(importFile: MetadataTypeItem): Promise<any>;
    /**
     * Updates a single Import File
     *
     * @param {MetadataTypeItem} importFile a single Import File
     * @returns {Promise} Promise
     */
    static update(importFile: MetadataTypeItem): Promise<any>;
    /**
     * prepares a import definition for deployment
     *
     * @param {MetadataTypeItem} metadata a single importDef
     * @returns {Promise.<MetadataTypeItem>} Promise
     */
    static preDeployTasks(metadata: MetadataTypeItem): Promise<MetadataTypeItem>;
    /**
     * manages post retrieve steps
     *
     * @param {MetadataTypeItem} metadata a single item
     * @returns {MetadataTypeItem} parsed metadata
     */
    static postRetrieveTasks(metadata: MetadataTypeItem): MetadataTypeItem;
}
declare namespace ImportFile {
    let smsImports: {};
    let dataExtensionsLegacy: {};
    let definition: {
        bodyIteratorField: string;
        dependencies: string[];
        dependencyGraph: {
            dataExtension: string[];
            list: string[];
            mobileKeyword: string[];
        };
        destinationObjectTypeMapping: {
            unknown: number;
            DataExtension: number;
            List: number;
            SMS: number;
            Push: number;
            WhatsApp: number;
        };
        hasExtended: boolean;
        idField: string;
        keyIsFixed: boolean;
        keyField: string;
        nameField: string;
        createdDateField: string;
        createdNameField: any;
        lastmodDateField: string;
        lastmodNameField: any;
        restPagination: boolean;
        restPageSize: number;
        restConcurrentLimit: number;
        subscriberImportTypeMapping: {
            DataExtension: number;
            Email: number;
        };
        maxKeyLength: number;
        type: string;
        typeDescription: string;
        typeRetrieveByDefault: boolean;
        typeCdpByDefault: boolean;
        typeName: string;
        updateTypeMapping: {
            Add: number;
            AddUpdate: number;
            Overwrite: number;
            Update: number;
        };
        blankFileProcessingTypeMapping: {
            Fail: number;
            Process: number;
            Skip: number;
        };
        fields: {
            allowErrors: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            blankFileProcessingType: {
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
            dateFormatLocale: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            deleteFile: {
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
            destinationId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            destinationName: {
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
            destinationObjectTypeId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            encodingName: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            fieldMappingType: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            fieldMappings: {
                skipValidation: boolean;
            };
            fileNamingPattern: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            fileSpec: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            fileTransferLocationId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            fileTransferLocationName: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            fileTransferLocationTypeId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            fileType: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            filter: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            hasColumnHeader: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            importDefinitionId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            isOrderedImport: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            isSequential: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            maxFileAgeHours: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            maxFileAgeScheduleOffsetHours: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            maxImportFrequencyHours: {
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
            };
            notificationEmailAddress: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            otherDelimiter: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            sendEmailNotification: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            standardQuotedStrings: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            subscriberImportTypeId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            updateTypeId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            sourceCustomObjectId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            sourceDataExtensionName: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            c__dataAction: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'destination.r__mobileKeyword_key': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'source.r__dataExtension_key': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'destination.r__dataExtension_key': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'source.c__type': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'destination.c__type': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'destination.r__list_PathName': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'source.r__fileLocation_name': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            c__subscriberImportType: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            c__blankFileProcessing: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
        };
    };
}
import MetadataType from './MetadataType.js';
//# sourceMappingURL=ImportFile.d.ts.map