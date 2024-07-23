export default Campaign;
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
 * Campaign MetadataType
 *
 * @augments MetadataType
 */
declare class Campaign extends MetadataType {
    /**
     * Retrieves Metadata of campaigns. Afterwards, starts metadata retrieval for their campaign assets
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise
     */
    static retrieve(retrieveDir: string, _?: void | string[], __?: void | string[], key?: string): Promise<MetadataTypeMapObj>;
    /**
     * Retrieves event definition metadata for caching
     *
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static retrieveForCache(): Promise<MetadataTypeMapObj>;
    /**
     * Parses campaign asset response body and returns metadata entries mapped to their id
     *
     * @param {string} retrieveDir folder where to save
     * @param {string} campaignId of camapaign to retrieve
     * @param {string} name of camapaign for saving
     * @returns {Promise.<MetadataTypeMapObj>} Campaign Asset Object
     */
    static getAssetTags(retrieveDir: string, campaignId: string, name: string): Promise<MetadataTypeMapObj>;
}
declare namespace Campaign {
    let definition: {
        bodyIteratorField: string;
        dependencies: any[];
        dependencyGraph: any;
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
        restPageSize: number;
        type: string;
        typeDescription: string;
        typeRetrieveByDefault: boolean;
        typeName: string;
        fields: {
            id: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            campaignId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            type: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            createdDate: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            createdBy: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            ownerId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            lastUpdated: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            name: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            description: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            externalKey: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            campaignCode: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'display.name': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'display.value': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            isFavorite: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            campaignOwnerName: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            campaignOwner: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            campaignStatus: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
        };
    };
}
import MetadataType from './MetadataType.js';
//# sourceMappingURL=Campaign.d.ts.map