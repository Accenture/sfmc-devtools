export default MobilePushApp;
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
 */
/**
 * MobilePushApp MetadataType
 *
 * @augments MetadataType
 */
declare class MobilePushApp extends MetadataType {
    /**
     * Retrieves Metadata of Mobile Keywords
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static retrieve(retrieveDir: string, _?: void | string[], __?: void | string[], key?: string): Promise<MetadataTypeMapObj>;
    /**
     * Retrieves event definition metadata for caching
     *
     * @param {void | string[]} [_] parameter not used
     * @param {void | string[]} [__] parameter not used
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static retrieveForCache(_?: void | string[], __?: void | string[], key?: string): Promise<MetadataTypeMapObj>;
    /**
     * helper for {@link MetadataType.createREST}
     *
     * @param {MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {object} apiResponse varies depending on the API call
     * @returns {Promise.<object>} apiResponse
     */
    static postCreateTasks(metadataEntry: MetadataTypeItem, apiResponse: object): Promise<object>;
    /**
     * helper for {@link MetadataType.updateREST}
     *
     * @param {MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {object} apiResponse varies depending on the API call
     * @returns {Promise.<object>} apiResponse, potentially modified
     */
    static postUpdateTasks(metadataEntry: MetadataTypeItem, apiResponse: object): Promise<object>;
}
declare namespace MobilePushApp {
    let definition: {
        bodyIteratorField: any;
        dependencies: any[];
        dependencyGraph: {};
        hasExtended: boolean;
        idField: string;
        keepId: boolean;
        keyIsFixed: boolean;
        keyField: string;
        nameField: string;
        createdDateField: string;
        createdNameField: any;
        lastmodDateField: string;
        lastmodNameField: any;
        restPagination: boolean;
        restPageSize: any;
        type: string;
        typeDescription: string;
        typeRetrieveByDefault: boolean;
        typeCdpByDefault: boolean;
        typeName: string;
        fields: {
            id: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            key: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            name: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            keys: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            description: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            createdDate: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            modifiedDate: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            apnsEnabled: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            apnsTopic: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            gcmEnabled: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'configuration.customSound': {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'configuration.openDirect': {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'configuration.customKeys': {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'configuration.payloadEditor': {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'configuration.messageCategories': {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            deviceEndpoint: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
        };
    };
}
import MetadataType from './MetadataType.js';
//# sourceMappingURL=MobilePushApp.d.ts.map