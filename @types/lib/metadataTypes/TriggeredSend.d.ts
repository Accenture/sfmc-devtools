export default TriggeredSend;
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
export type ContentBlockConversionTypes = import('../../types/mcdev.d.js').ContentBlockConversionTypes;
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
 * @typedef {import('../../types/mcdev.d.js').ContentBlockConversionTypes} ContentBlockConversionTypes
 */
/**
 * MessageSendActivity MetadataType
 *
 * @augments MetadataType
 */
declare class TriggeredSend extends MetadataType {
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
     * Create a single TSD.
     *
     * @param {MetadataTypeItem} metadata single metadata entry
     * @returns {Promise} Promise
     */
    static create(metadata: MetadataTypeItem): Promise<any>;
    /**
     * Updates a single TSD.
     *
     * @param {MetadataTypeItem} metadata single metadata entry
     * @returns {Promise} Promise
     */
    static update(metadata: MetadataTypeItem): Promise<any>;
    /**
     * parses retrieved Metadata before saving
     *
     * @param {MetadataTypeItem} metadata a single item
     * @returns {MetadataTypeItem | void} Array with one metadata object and one sql string
     */
    static postRetrieveTasks(metadata: MetadataTypeItem): MetadataTypeItem | void;
    /**
     * prepares a TSD for deployment
     *
     * @param {MetadataTypeItem} metadata of a single TSD
     * @returns {Promise.<MetadataTypeItem>} metadata object
     */
    static preDeployTasks(metadata: MetadataTypeItem): Promise<MetadataTypeItem>;
    /**
     * TSD-specific refresh method that finds active TSDs and refreshes them
     *
     * @param {string[]} [keyArr] metadata keys
     * @param {boolean} [checkKey] whether to check if the key is valid
     * @returns {Promise.<void>} -
     */
    static refresh(keyArr?: string[], checkKey?: boolean): Promise<void>;
    /**
     * helper for {@link TriggeredSend.refresh} that extracts the keys from the TSD item map and eli
     *
     * @param {MetadataTypeMap} metadata TSD item map
     * @returns {Promise.<string[]>} keyArr
     */
    static getKeysForValidTSDs(metadata: MetadataTypeMap): Promise<string[]>;
    /**
     * helper for {@link TriggeredSend.refresh} that finds active TSDs on the server and filters it by the same rules that {@link TriggeredSend.retrieve} is using to avoid refreshing TSDs with broken dependencies
     *
     * @param {boolean} [assetLoaded] if run after Asset.deploy via --refresh option this will skip caching assets
     * @returns {Promise.<MetadataTypeMapObj>} Promise of TSD item map
     */
    static findRefreshableItems(assetLoaded?: boolean): Promise<MetadataTypeMapObj>;
    /**
     * helper for {@link TriggeredSend.refresh} that pauses, publishes and starts a triggered send
     *
     * @param {string} key external key of triggered send item
     * @param {boolean} checkKey whether to check if key exists on the server
     * @returns {Promise.<boolean>} true if refresh was successful
     */
    static _refreshItem(key: string, checkKey: boolean): Promise<boolean>;
    /**
     *
     * @param {MetadataTypeItem} item single metadata item
     * @returns {Promise.<MetadataTypeItem>} key of the item that was updated
     */
    static replaceCbReference(item: MetadataTypeItem): Promise<MetadataTypeItem>;
}
declare namespace TriggeredSend {
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
        priorityMapping: {
            High: number;
            Medium: number;
            Low: number;
        };
        fields: {
            AllowedSlots: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            AutoAddSubscribers: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean; /**
                 * Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata
                 *
                 * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
                 * @param {void | string[]} [_] unused parameter
                 * @param {void | string[]} [__] unused parameter
                 * @param {string} [key] customer key of single item to retrieve
                 * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
                 */
            };
            AutoUpdateSubscribers: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            BatchInterval: {
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
            'Client.PartnerClientKey': {
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
            DataSchemas: {
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
            'DeliveryProfile.ObjectID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean; /**
                 * Delete a metadata item from the specified business unit
                 *
                 * @param {string} customerKey Identifier of data extension
                 * @returns {Promise.<boolean>} deletion success status
                 */
                templating: boolean;
            };
            Description: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            DisableOnEmailBuildError: {
                isCreateable: boolean;
                isUpdateable: boolean; /**
                 * parses retrieved Metadata before saving
                 *
                 * @param {MetadataTypeItem} metadata a single item
                 * @returns {MetadataTypeItem | void} Array with one metadata object and one sql string
                 */
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
            'Email.PartnerKey': {
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
            ExclusionListCollection: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'FooterContentArea.ID': {
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
            'HeaderContentArea.ID': {
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
            InteractionObjectID: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            IsAlwaysOn: {
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
            KeepExistingEmailSubject: {
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
            'List.ID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'List.PartnerKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'List.ObjectID': {
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
            NewSlotTrigger: {
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
            OptionFlags: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            OptionFlagsUpdateMask: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            OptionVersion: {
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
            Priority: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'PrivateDomain.ObjectID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'PrivateDomain.PartnerKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'PrivateIP.ID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            'PrivateIP.PartnerKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            RefreshContent: {
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
            RequestExpirationSeconds: {
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
            'SenderProfile.CustomerKey': {
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
            SendSourceCustomerKey: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            SendSourceDataExtension: {
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
            TriggeredSendClass: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            TriggeredSendStatus: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            TriggeredSendSubClass: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            TriggeredSendType: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                templating: boolean;
            };
            TriggeredSendVersionID: {
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
            r__list_PathName: {
                skipValidation: boolean;
            };
            c__priority: {
                skipValidation: boolean;
            };
            r__sendClassification_key: {
                skipValidation: boolean;
            };
            r__senderProfile_key: {
                skipValidation: boolean;
            };
        };
    };
}
import MetadataType from './MetadataType.js';
//# sourceMappingURL=TriggeredSend.d.ts.map