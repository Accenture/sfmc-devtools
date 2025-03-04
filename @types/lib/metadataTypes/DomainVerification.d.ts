export default DomainVerification;
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
export type DomainVerificationItem = import("../../types/mcdev.d.js").DomainVerificationItem;
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
 * @typedef {import('../../types/mcdev.d.js').DomainVerificationItem} DomainVerificationItem
 */
/**
 * DomainVerification MetadataType
 *
 * @augments MetadataType
 */
declare class DomainVerification extends MetadataType {
    /**
     * Retrieves Metadata ofDomainVerification.
     * Endpoint /automation/v1/dataextracts/ returns all items
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static retrieve(retrieveDir: string, _?: void | string[], __?: void | string[], key?: string): Promise<MetadataTypeMapObj>;
    /**
     * Retrieves Metadata of DomainVerification for caching
     *
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static retrieveForCache(): Promise<MetadataTypeMapObj>;
    /**
     * Creates a single item
     *
     * @param {DomainVerificationItem} metadataItem a single item
     * @returns {Promise} Promise
     */
    static create(metadataItem: DomainVerificationItem): Promise<any>;
    /**
     * helper for {@link MetadataType.createREST}
     *
     * @param {DomainVerificationItem} metadataEntry a single metadata Entry
     * @param {object} apiResponse varies depending on the API call
     * @returns {Promise.<DomainVerificationItem>} apiResponse
     */
    static postCreateTasks(metadataEntry: DomainVerificationItem, apiResponse: object): Promise<DomainVerificationItem>;
    /**
     * helper for {@link update}
     *
     * @param {DomainVerificationItem} metadataEntry a single metadata Entry
     * @param {object} apiResponse varies depending on the API call
     * @returns {Promise.<DomainVerificationItem>} apiResponse, potentially modified
     */
    static postUpdateTasks(metadataEntry: DomainVerificationItem, apiResponse: object): Promise<DomainVerificationItem>;
    /**
     * Updates a single item; replaces super.updateREST because we need to send metadataItem as an array for some reason and also get an array back
     *
     * @param {DomainVerificationItem} metadataItem a single item
     * @returns {Promise.<DomainVerificationItem>} Promise
     */
    static update(metadataItem: DomainVerificationItem): Promise<DomainVerificationItem>;
    /**
     * manages post retrieve steps
     *
     * @param {DomainVerificationItem} metadataItem a single item
     * @returns {DomainVerificationItem} metadata
     */
    static postRetrieveTasks(metadataItem: DomainVerificationItem): DomainVerificationItem;
    /**
     * Gets executed after deployment of metadata type
     *
     * @param {MetadataTypeMap} upsertResults metadata mapped by their keyField as returned by update/create
     * @returns {Promise.<void>} -
     */
    static postDeployTasks(upsertResults: MetadataTypeMap): Promise<void>;
    /**
     * prepares a single item for deployment
     *
     * @param {DomainVerificationItem} metadata a single item
     * @returns {Promise.<DomainVerificationItem>} Promise
     */
    static preDeployTasks(metadata: DomainVerificationItem): Promise<DomainVerificationItem>;
    /**
     * Gets executed before deleting a list of keys for the current type
     *
     * @returns {Promise.<void>} -
     */
    static preDeleteTasks(): Promise<void>;
}
declare namespace DomainVerification {
    let definition: {
        bodyIteratorField: string;
        dependencies: any[];
        dependencyGraph: any;
        hasExtended: boolean;
        idField: string;
        keyIsFixed: boolean;
        keyField: string;
        createdDateField: any;
        createdNameField: any;
        lastmodDateField: any;
        lastmodNameField: any;
        nameField: string;
        restPagination: boolean;
        maxKeyLength: number;
        type: string;
        typeDescription: string;
        typeRetrieveByDefault: boolean;
        typeCdpByDefault: boolean;
        typeName: string;
        fields: {
            domain: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            emailAddress: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            enterpriseId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            memberId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            domainType: {
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
            status: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            emailSendTime: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
        };
    };
}
import MetadataType from './MetadataType.js';
//# sourceMappingURL=DomainVerification.d.ts.map