export default ContentArea;
export type BuObject = import('../../types/mcdev.d.js').BuObject;
export type CodeExtract = import('../../types/mcdev.d.js').CodeExtract;
export type CodeExtractItem = import('../../types/mcdev.d.js').CodeExtractItem;
export type MetadataTypeItem = import('../../types/mcdev.d.js').MetadataTypeItem;
export type MetadataTypeItemDiff = import('../../types/mcdev.d.js').MetadataTypeItemDiff;
export type MetadataTypeItemObj = import('../../types/mcdev.d.js').MetadataTypeItemObj;
export type MetadataTypeMap = import('../../types/mcdev.d.js').MetadataTypeMap;
export type MetadataTypeMapObj = import('../../types/mcdev.d.js').MetadataTypeMapObj;
export type SoapRequestParams = import('../../types/mcdev.d.js').SoapRequestParams;
export type TemplateMap = import('../../types/mcdev.d.js').TemplateMap;
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
 * ContentArea MetadataType
 *
 * @augments MetadataType
 */
declare class ContentArea extends MetadataType {
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
     * parses retrieved Metadata before saving
     *
     * @param {MetadataTypeItem} metadata a single item
     * @returns {MetadataTypeItem} parsed item
     */
    static postRetrieveTasks(metadata: MetadataTypeItem): MetadataTypeItem;
}
declare namespace ContentArea {
    let definition: {
        bodyIteratorField: string;
        dependencies: string[];
        hasExtended: boolean;
        idField: string;
        keepId: boolean; /**
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
        keyIsFixed: boolean;
        keyField: string;
        nameField: string;
        folderIdField: string;
        restPagination: any;
        type: string;
        typeDescription: string;
        typeRetrieveByDefault: boolean;
        typeName: string;
        fields: {
            BackgroundColor: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            BorderColor: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            BorderWidth: {
                isCreateable: boolean;
                isUpdateable: boolean; /**
                 * Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata
                 *
                 * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
                 * @param {void | string[]} [_] unused parameter
                 * @param {void | string[]} [__] unused parameter
                 * @param {string} [key] customer key of single item to retrieve
                 * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
                 */
                retrieving: boolean;
                templating: boolean;
            };
            CategoryID: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            Cellpadding: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            Cellspacing: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'Client.ID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            Content: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            CorrelationID: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            CreatedDate: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            CustomerKey: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            FontFamily: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            HasFontSize: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            ID: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            IsBlank: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            IsDynamicContent: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            IsLocked: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            IsSurvey: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            Key: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            Layout: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            ModifiedDate: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            Name: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            ObjectID: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            Owner: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            PartnerKey: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            PartnerProperties: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            Width: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
        };
    };
}
import MetadataType from './MetadataType.js';
//# sourceMappingURL=ContentArea.d.ts.map