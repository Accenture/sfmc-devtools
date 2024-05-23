export default EmailSend;
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
 * MessageSendActivity MetadataType
 *
 * @augments MetadataType
 */
declare class EmailSend extends MetadataType {
    /**
     * Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     *
     * @param {string} [retrieveDir] Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static retrieve(retrieveDir?: string, _?: void | string[], __?: void | string[], key?: string): Promise<MetadataTypeMapObj>;
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
     * prepares a single item for deployment
     *
     * @param {MetadataTypeItem} metadata a single script activity definition
     * @returns {Promise.<MetadataTypeItem>} Promise
     */
    static preDeployTasks(metadata: MetadataTypeItem): Promise<MetadataTypeItem>;
    /**
     * manages post retrieve steps
     *
     * @param {MetadataTypeItem} metadata a single query
     * @returns {MetadataTypeItem} Array with one metadata object and one query string
     */
    static postRetrieveTasks(metadata: MetadataTypeItem): MetadataTypeItem;
}
declare namespace EmailSend {
    let definition: {
        bodyIteratorField: string;
        dependencies: string[];
        folderType: string;
        hasExtended: boolean;
        idField: string;
        keepId: boolean;
        keyIsFixed: boolean;
        keyField: string;
        nameField: string;
        folderIdField: string;
        createdDateField: string;
        createdNameField: any;
        lastmodDateField: string;
        lastmodNameField: any;
        restPagination: any;
        maxKeyLength: number;
        type: string;
        soapType: string;
        typeDescription: string;
        typeRetrieveByDefault: boolean;
        typeName: string;
        fields: {
            Additional: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            AutoBccEmail: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            BccEmail: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            CategoryID: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            CCEmail: {
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
            DeduplicateByEmail: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'DeliveryProfile.CustomerKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'DeliveryProfile.DomainType': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'DeliveryProfile.FooterContentArea.ID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'DeliveryProfile.FooterSalutationSource': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'DeliveryProfile.HeaderContentArea.ID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'DeliveryProfile.HeaderSalutationSource': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'DeliveryProfile.ObjectID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'DeliveryProfile.PartnerKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'DeliveryProfile.PrivateDomain': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'DeliveryProfile.PrivateIP': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'DeliveryProfile.SourceAddressType': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            DeliveryScheduledTime: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            Description: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            DomainType: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            DynamicEmailSubject: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'Email.ID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'Email.ObjectID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'Email.PartnerKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'Email.Name': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'Email.Subject': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'Email.Status': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            EmailSubject: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            ExclusionFilter: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            FooterContentArea: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            FooterSalutationSource: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            FromAddress: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            FromName: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            HeaderContentArea: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            HeaderSalutationSource: {
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
            IntegratedTracking: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            InteractionObjectID: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            IsMultipart: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            IsPlatformObject: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            IsSeedListSend: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            IsSendLogging: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            IsWrapped: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            Keyword: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            MessageDeliveryType: {
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
            ObjectState: {
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
            PreHeader: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            PrivateDomain: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            PrivateIP: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            ReplyToAddress: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            ReplyToDisplayName: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            SeedListOccurance: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'SendClassification.CustomerKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'SendClassification.ObjectID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'SendClassification.PartnerKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'SendDefinitionList.CustomObjectID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            SendDefinitionList: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'SendDefinitionList[].ObjectID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'SendDefinitionList[].PartnerKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'SendDefinitionList[].CustomObjectID': {
                skipValidation: boolean;
            };
            'SendDefinitionList[].SendDefinitionListType': {
                skipValidation: boolean;
            };
            'SendDefinitionList[].DataSourceTypeID': {
                skipValidation: boolean;
            };
            'SendDefinitionList[].IsTestObject': {
                skipValidation: boolean;
            };
            'SendDefinitionList[].SalesForceObjectID': {
                skipValidation: boolean;
            };
            'SendDefinitionList[].Name': {
                skipValidation: boolean;
            };
            'SendDefinitionList[].r__dataExtension_Key': {
                skipValidation: boolean;
            };
            'SendDefinitionList[].List.ObjectID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'SendDefinitionList[].List.PartnerKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'SendDefinitionList[].r__list_PathName': {
                skipValidation: boolean;
            };
            'SenderProfile.CustomerKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'SenderProfile.FromAddress': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'SenderProfile.FromName': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'SenderProfile.ObjectID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'SenderProfile.PartnerKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            SendLimit: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            SendWindowClose: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            SendWindowDelete: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            SendWindowOpen: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            SourceAddressType: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            SuppressTracking: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            TestEmailAddr: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            TimeZone: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            TrackingUsers: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            r__asset_name_readOnly: {
                skipValidation: boolean;
            };
            r__asset_key: {
                skipValidation: boolean;
            };
            r__email_name: {
                skipValidation: boolean;
            };
            r__folder_Path: {
                skipValidation: boolean;
            };
            r__senderProfile_key: {
                skipValidation: boolean;
            };
            r__sendClassification_key: {
                skipValidation: boolean;
            };
            r__deliveryProfile_key: {
                skipValidation: boolean;
            };
        };
    };
}
import MetadataType from './MetadataType.js';
//# sourceMappingURL=EmailSend.d.ts.map