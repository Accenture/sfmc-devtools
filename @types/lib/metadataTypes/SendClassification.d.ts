export default SendClassification;
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
 * SendClassification MetadataType
 *
 * @augments MetadataType
 */
declare class SendClassification extends MetadataType {
    /**
     * Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata
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
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static retrieveForCache(): Promise<MetadataTypeMapObj>;
    /**
     * Updates a single item
     *
     * @param {MetadataTypeItem} metadataItem a single item
     * @returns {Promise} Promise
     */
    static update(metadataItem: MetadataTypeItem): Promise<any>;
    /**
     * Creates a single item
     *
     * @param {MetadataTypeItem} metadataItem a single item
     * @returns {Promise} Promise
     */
    static create(metadataItem: MetadataTypeItem): Promise<any>;
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
    /**
     * this is the only known way to get the object ID for a deliveryProfile
     *
     * @param {MetadataTypeItem} metadata a single sendClassification item
     */
    static updateDeliveryProfileIdInCache(metadata: MetadataTypeItem): void;
}
declare namespace SendClassification {
    let definition: {
        bodyIteratorField: string;
        dependencies: string[];
        dependencyGraph: {
            senderProfile: string[];
        };
        filter: {};
        hasExtended: boolean;
        idField: string;
        keyField: string;
        keyIsFixed: boolean;
        maxKeyLength: number;
        nameField: string;
        createdDateField: string;
        createdNameField: any;
        lastmodDateField: string;
        lastmodNameField: any;
        restPagination: boolean;
        type: string;
        typeDescription: string;
        typeRetrieveByDefault: boolean;
        typeName: string;
        sendClassificationTypeMapping: {
            Commercial: string;
            Transactional: string;
        };
        fields: {
            'Client.ID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            CreatedDate: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            ModifiedDate: {
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
            ObjectID: {
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
            Description: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            PartnerKey: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            PartnerProperties: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            ArchiveEmail: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'DeliveryProfile.CustomerKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'DeliveryProfile.PartnerKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'DeliveryProfile.ObjectID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            HonorPublicationListOptOutsForTransactionalSends: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            SendClassificationType: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'SenderProfile.CustomerKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'SenderProfile.PartnerKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'SenderProfile.ObjectID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            SendPriority: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            c__classification: {
                skipValidation: boolean;
            };
            r__deliveryProfile_key: {
                skipValidation: boolean;
            };
            r__senderProfile_key: {
                skipValidation: boolean;
            };
        };
    };
}
import MetadataType from './MetadataType.js';
//# sourceMappingURL=SendClassification.d.ts.map