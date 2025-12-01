export default Email;
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
 * Email MetadataType
 *
 * @augments MetadataType
 */
declare class Email extends MetadataType {
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
     * manages post retrieve steps
     *
     * @param {MetadataTypeItem} metadata a single query
     * @returns {MetadataTypeItem} Array with one metadata object and one query string
     */
    static postRetrieveTasks(metadata: MetadataTypeItem): MetadataTypeItem;
}
declare namespace Email {
    let definition: {
        bodyIteratorField: string;
        dependencies: string[];
        dependencyGraph: any;
        hasExtended: boolean;
        idField: string;
        keepId: boolean;
        keyIsFixed: boolean;
        keyField: string;
        nameField: string;
        folderIdField: string;
        restPagination: any;
        type: string;
        typeDescription: string;
        typeRetrieveByDefault: boolean;
        typeCdpByDefault: boolean;
        typeName: string;
        fields: {
            CategoryID: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            CharacterSet: {
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
            'Client.PartnerClientKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            ClonedFromID: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            ContentAreas: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'ContentAreas.CategoryID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'ContentAreas.Content': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'ContentAreas.CustomerKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'ContentAreas.ID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'ContentAreas.IsBlank': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'ContentAreas.IsDynamicContent': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'ContentAreas.IsLocked': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'ContentAreas.IsSurvey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'ContentAreas.Key': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'ContentAreas.Name': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'ContentAreas.ObjectID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'ContentAreas.PartnerKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'ContentAreas[].CategoryID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'ContentAreas[].Content': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'ContentAreas[].CustomerKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'ContentAreas[].ID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'ContentAreas[].IsBlank': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'ContentAreas[].IsDynamicContent': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'ContentAreas[].IsLocked': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'ContentAreas[].IsSurvey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'ContentAreas[].Key': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'ContentAreas[].Name': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'ContentAreas[].ObjectID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'ContentAreas[].PartnerKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            ContentCheckStatus: {
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
            EmailType: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            Folder: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            HasDynamicSubjectLine: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            HTMLBody: {
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
            IsActive: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            IsHTMLPaste: {
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
            PartnerKey: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            PreHeader: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            Status: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            Subject: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            SyncTextWithHTML: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            TextBody: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
        };
    };
}
import MetadataType from './MetadataType.js';
//# sourceMappingURL=Email.d.ts.map