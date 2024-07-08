export default DataExtension;
export type BuObject = import("../../types/mcdev.d.js").BuObject;
export type MetadataTypeItem = import("../../types/mcdev.d.js").MetadataTypeItem;
export type MetadataTypeItemDiff = import("../../types/mcdev.d.js").MetadataTypeItemDiff;
export type MetadataTypeMap = import("../../types/mcdev.d.js").MetadataTypeMap;
export type SoapRequestParams = import("../../types/mcdev.d.js").SoapRequestParams;
export type TemplateMap = import("../../types/mcdev.d.js").TemplateMap;
export type DataExtensionFieldItem = import("../../types/mcdev.d.js").DataExtensionFieldItem;
export type DataExtensionFieldMap = import("../../types/mcdev.d.js").DataExtensionFieldMap;
export type DataExtensionItem = import("../../types/mcdev.d.js").DataExtensionItem;
export type DataExtensionMap = import("../../types/mcdev.d.js").DataExtensionMap;
/**
 * @typedef {import('../../types/mcdev.d.js').BuObject} BuObject
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItem} MetadataTypeItem
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItemDiff} MetadataTypeItemDiff
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMap} MetadataTypeMap
 * @typedef {import('../../types/mcdev.d.js').SoapRequestParams} SoapRequestParams
 * @typedef {import('../../types/mcdev.d.js').TemplateMap} TemplateMap
 */
/**
 * @typedef {import('../../types/mcdev.d.js').DataExtensionFieldItem} DataExtensionFieldItem
 * @typedef {import('../../types/mcdev.d.js').DataExtensionFieldMap} DataExtensionFieldMap
 * @typedef {import('../../types/mcdev.d.js').DataExtensionItem} DataExtensionItem
 * @typedef {import('../../types/mcdev.d.js').DataExtensionMap} DataExtensionMap
 */
/**
 * DataExtension MetadataType
 *
 * @augments MetadataType
 */
declare class DataExtension extends MetadataType {
    /** @type {DataExtensionFieldMap} */
    static oldFields: DataExtensionFieldMap;
    /**
     * Upserts dataExtensions after retrieving them from source and target to compare
     * if create or update operation is needed.
     *
     * @param {DataExtensionMap} metadataMap dataExtensions mapped by their customerKey
     * @returns {Promise} Promise
     */
    static upsert(metadataMap: DataExtensionMap): Promise<any>;
    /**
     * helper for {@link DataExtension.upsert}
     *
     * @param {object} res -
     * @returns {boolean} true: keep, false: discard
     */
    static "__#5@#filterUpsertResults"(res: object): boolean;
    /**
     * Create a single dataExtension. Also creates their columns in 'dataExtension.columns'
     *
     * @param {DataExtensionItem} metadata single metadata entry
     * @returns {Promise} Promise
     */
    static create(metadata: DataExtensionItem): Promise<any>;
    /**
     * SFMC saves a date in "RetainUntil" under certain circumstances even
     * if that field duplicates whats in the period fields
     * during deployment, that extra value is not accepted by the APIs which is why it needs to be removed
     *
     * @param {DataExtensionItem} metadata single metadata entry
     * @returns {void}
     */
    static "__#5@#cleanupRetentionPolicyFields"(metadata: DataExtensionItem): void;
    /**
     * Updates a single dataExtension. Also updates their columns in 'dataExtension.columns'
     *
     * @param {DataExtensionItem} metadata single metadata entry
     * @param {boolean} [handleOutside] if the API reponse is irregular this allows you to handle it outside of this generic method
     * @returns {Promise} Promise
     */
    static update(metadata: DataExtensionItem, handleOutside?: boolean): Promise<any>;
    /**
     * Gets executed after deployment of metadata type
     *
     * @param {DataExtensionMap} upsertedMetadata metadata mapped by their keyField
     * @param {DataExtensionMap} originalMetadata metadata to be updated (contains additioanl fields)
     * @param {{created: number, updated: number}} createdUpdated counter representing successful creates/updates
     * @returns {Promise.<void>} -
     */
    static postDeployTasks(upsertedMetadata: DataExtensionMap, originalMetadata: DataExtensionMap, createdUpdated: {
        created: number;
        updated: number;
    }): Promise<void>;
    /**
     * takes care of updating attribute groups on child BUs after an update to Shared DataExtensions
     * helper for {@link DataExtension.postDeployTasks}
     * fixes an issue where shared data extensions are not visible in data designer on child BU; SF known issue: https://issues.salesforce.com/#q=W-11031095
     *
     * @param {DataExtensionMap} upsertedMetadata metadata mapped by their keyField
     * @param {DataExtensionMap} originalMetadata metadata to be updated (contains additioanl fields)
     * @param {{created: number, updated: number}} createdUpdated counter representing successful creates/updates
     * @returns {Promise.<void>} -
     */
    static "__#5@#fixShared"(upsertedMetadata: DataExtensionMap, originalMetadata: DataExtensionMap, createdUpdated: {
        created: number;
        updated: number;
    }): Promise<void>;
    /**
     * helper for {@link DataExtension.#fixShared}
     *
     * @returns {Promise.<string[]>} list of selected BU names
     */
    static "__#5@#fixShared_getBUs"(): Promise<string[]>;
    /**
     * helper for {@link DataExtension.#fixShared}
     *
     * @param {string} childBuName name of child BU to fix
     * @param {BuObject} buObjectParent bu object for parent BU
     * @param {object} clientParent SDK for parent BU
     * @param {Object.<string, string>} sharedDataExtensionMap ID-Key relationship of shared data extensions
     * @returns {Promise.<string[]>} updated shared DE keys on BU
     */
    static "__#5@#fixShared_onBU"(childBuName: string, buObjectParent: BuObject, clientParent: object, sharedDataExtensionMap: {
        [x: string]: string;
    }): Promise<string[]>;
    /**
     * method that actually takes care of triggering the update for a particular BU-sharedDe combo
     * helper for {@link DataExtension.#fixShared_onBU}
     *
     * @param {string} deId data extension ObjectID
     * @param {string} deKey dataExtension key
     * @param {BuObject} buObjectChildBu BU object for Child BU
     * @param {object} clientChildBu SDK for child BU
     * @param {BuObject} buObjectParent BU object for Parent BU
     * @param {object} clientParent SDK for parent BU
     * @returns {Promise.<boolean>} flag that signals if the fix was successful
     */
    static "__#5@#fixShared_item"(deId: string, deKey: string, buObjectChildBu: BuObject, clientChildBu: object, buObjectParent: BuObject, clientParent: object): Promise<boolean>;
    /**
     * add a new field to the shared DE to trigger an update to the data model
     * helper for {@link DataExtension.#fixShared_item}
     *
     * @param {BuObject} buObjectChildBu BU object for Child BU
     * @param {object} clientChildBu SDK for child BU
     * @param {string} deKey dataExtension key
     * @param {string} deId dataExtension ObjectID
     * @returns {Promise.<string>} randomSuffix
     */
    static "__#5@#fixShared_item_addField"(buObjectChildBu: BuObject, clientChildBu: object, deKey: string, deId: string): Promise<string>;
    /**
     * get ID of the field added by {@link DataExtension.#fixShared_item_addField} on the shared DE via parent BU
     * helper for {@link DataExtension.#fixShared_item}
     *
     * @param {string} randomSuffix -
     * @param {BuObject} buObjectParent BU object for Parent BU
     * @param {object} clientParent SDK for parent BU
     * @param {string} deKey dataExtension key
     * @returns {Promise.<string>} fieldObjectID
     */
    static "__#5@#fixShared_item_getFieldId"(randomSuffix: string, buObjectParent: BuObject, clientParent: object, deKey: string): Promise<string>;
    /**
     * delete the field added by {@link DataExtension.#fixShared_item_addField}
     * helper for {@link DataExtension.#fixShared_item}
     *
     * @param {string} randomSuffix -
     * @param {BuObject} buObjectChildBu BU object for Child BU
     * @param {object} clientChildBu SDK for child BU
     * @param {string} deKey dataExtension key
     * @param {string} fieldObjectID field ObjectID
     * @returns {Promise} -
     */
    static "__#5@#fixShared_item_deleteField"(randomSuffix: string, buObjectChildBu: BuObject, clientChildBu: object, deKey: string, fieldObjectID: string): Promise<any>;
    /**
     * Retrieves dataExtension metadata. Afterwards starts retrieval of dataExtensionColumn metadata retrieval
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @param {void | string[]} [_] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<{metadata: DataExtensionMap, type: string}>} Promise of item map
     */
    static retrieve(retrieveDir: string, additionalFields?: string[], _?: void | string[], key?: string): Promise<{
        metadata: DataExtensionMap;
        type: string;
    }>;
    /**
     * get shared dataExtensions from parent BU and merge them into the cache
     * helper for {@link DataExtension.retrieve} and for AttributeSet.fixShared_retrieve
     *
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @returns {Promise.<DataExtensionMap>} keyField => metadata map
     */
    static retrieveSharedForCache(additionalFields?: string[]): Promise<DataExtensionMap>;
    /**
     * helper to retrieve all dataExtension fields and attach them to the dataExtension metadata
     *
     * @param {DataExtensionMap} metadata already cached dataExtension metadata
     * @param {SoapRequestParams} [fieldOptions] optionally filter results
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @returns {Promise.<void>} -
     */
    static "__#5@#attachFields"(metadata: DataExtensionMap, fieldOptions?: SoapRequestParams, additionalFields?: string[]): Promise<void>;
    /**
     * Retrieves dataExtension metadata. Afterwards starts retrieval of dataExtensionColumn metadata retrieval
     *
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @returns {Promise.<{metadata: DataExtensionMap, type: string}>} Promise of item map
     */
    static retrieveChangelog(additionalFields?: string[]): Promise<{
        metadata: DataExtensionMap;
        type: string;
    }>;
    /**
     * manages post retrieve steps
     *
     * @param {DataExtensionItem} metadata a single dataExtension
     * @returns {Promise.<DataExtensionItem>} metadata
     */
    static postRetrieveTasks(metadata: DataExtensionItem): Promise<DataExtensionItem>;
    /**
     * Helper to retrieve Data Extension Fields
     *
     * @private
     * @param {SoapRequestParams} [options] options (e.g. continueRequest)
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @returns {Promise.<DataExtensionFieldMap>} Promise of items
     */
    private static _retrieveFields;
    /**
     * helps retrieving fields during templating and deploy where we dont want the full list
     *
     * @private
     * @param {DataExtensionMap} metadata list of DEs
     * @param {string} customerKey external key of single DE
     * @returns {Promise.<void>} -
     */
    private static _retrieveFieldsForSingleDe;
    /**
     * helper for {@link MetadataType.updateREST} and {@link MetadataType.updateSOAP} that removes old files after the key was changed
     *
     * @param {MetadataTypeItem} metadataEntry a single metadata Entry
     * @returns {Promise.<void>} -
     */
    static _postChangeKeyTasks(metadataEntry: MetadataTypeItem): Promise<void>;
    /**
     * prepares a DataExtension for deployment
     *
     * @param {DataExtensionItem} metadata a single data Extension
     * @returns {Promise.<DataExtensionItem>} Promise of updated single DE
     */
    static preDeployTasks(metadata: DataExtensionItem): Promise<DataExtensionItem>;
    /**
     * Saves json content to a html table in the local file system. Will create the parent directory if it does not exist.
     * The json's first level of keys must represent the rows and the secend level the columns
     *
     * @private
     * @param {DataExtensionItem} json single dataextension
     * @param {object[][]} tabled prepped array for output in tabular format
     * @returns {string} file content
     */
    private static _generateDocHtml;
    /**
     * Experimental: Only working for DataExtensions:
     * Saves json content to a html table in the local file system. Will create the parent directory if it does not exist.
     * The json's first level of keys must represent the rows and the secend level the columns
     *
     * @private
     * @param {DataExtensionItem} json dataextension
     * @param {object[][]} tabled prepped array for output in tabular format
     * @returns {string} file content
     */
    private static _generateDocMd;
    /**
     * Saves json content to a html table in the local file system. Will create the parent directory if it does not exist.
     * The json's first level of keys must represent the rows and the secend level the columns
     *
     * @private
     * @param {string} directory directory the file will be written to
     * @param {string} filename name of the file without '.json' ending
     * @param {DataExtensionItem} json dataextension.columns
     * @param {'html'|'md'} mode html or md
     * @param {string[]} [fieldsToKeep] list of keys(columns) to show. This will also specify
     * @returns {Promise.<void>} Promise of success of saving the file
     */
    private static _writeDoc;
    /**
     * Parses metadata into a readable Markdown/HTML format then saves it
     *
     * @param {DataExtensionMap} [metadataMap] a list of dataExtension definitions
     * @returns {Promise.<any>} -
     */
    static document(metadataMap?: DataExtensionMap): Promise<any>;
    /**
     * clean up after deleting a metadata item
     *
     * @param {string} customerKey Identifier of metadata item
     * @returns {Promise.<void>} - promise
     */
    static postDeleteTasks(customerKey: string): Promise<void>;
    /**
     * Retrieves folder metadata into local filesystem. Also creates a uniquePath attribute for each folder.
     *
     * @param {string[]} [_] unused parameter
     * @param {string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<{metadata: DataExtensionMap, type: string}>} Promise
     */
    static retrieveForCache(_?: string[], __?: string[], key?: string): Promise<{
        metadata: DataExtensionMap;
        type: string;
    }>;
    /**
     * Retrieves dataExtension metadata in template format.
     *
     * @param {string} templateDir Directory where retrieved metadata directory will be saved
     * @param {string} name name of the metadata item
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {Promise.<{metadata: DataExtensionItem, type: string}>} Promise of items
     */
    static retrieveAsTemplate(templateDir: string, name: string, templateVariables: TemplateMap): Promise<{
        metadata: DataExtensionItem;
        type: string;
    }>;
    /**
     * Retrieves dataExtension metadata and cleans it
     *
     * @private
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @param {SoapRequestParams} [options] e.g. filter
     * @returns {Promise.<DataExtensionMap>} keyField => metadata map
     */
    private static _retrieveAll;
}
declare namespace DataExtension {
    let deployedSharedKeys: any;
    let buObject: import("../../types/mcdev.d.js").BuObject;
    let client: any;
    let definition: {
        bodyIteratorField: string;
        dependencies: string[];
        folderType: string;
        filter: {
            CustomerKey: string[];
            Name: string[];
        };
        templateFields: {
            AudienceBuilderResult: string[];
            CONTEXTUAL_SUPPRESSION_LISTS: string[];
            DomainExclusion: string[];
            'Event DE Template': string[];
            PushSendLog: string[];
            SendLog: string[];
            'SmartCapture - Contacts Template Extension': string[];
            SmsSendLog: string[];
            SMSMessageTracking: any;
            SMSSubscriptionLog: any;
            TriggeredSendDataExtension: string[];
        };
        dataRetentionPeriodUnitOfMeasureMapping: {
            Days: number;
            Weeks: number;
            Months: number;
            Years: number;
        };
        hasExtended: boolean;
        idField: string;
        keyIsFixed: boolean;
        keyField: string;
        nameField: string;
        folderIdField: string;
        createdDateField: string;
        createdNameField: any;
        lastmodDateField: string;
        lastmodNameField: any;
        restPagination: boolean;
        maxKeyLength: number;
        type: string;
        typeDescription: string;
        typeRetrieveByDefault: boolean;
        typeName: string;
        fields: {
            CategoryID: {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: boolean;
            };
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
            CustomerKey: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            DataRetentionPeriod: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            DataRetentionPeriodLength: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            DataRetentionPeriodUnitOfMeasure: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            DeleteAtEndOfRetentionPeriod: {
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
            Fields: {
                skipValidation: boolean;
            };
            folderContentType: {
                skipValidation: boolean;
            };
            IsPlatformObject: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            IsSendable: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            IsTestable: {
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
            Name: {
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
            PartnerKey: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            ResetRetentionPeriodOnImport: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            RetainUntil: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            RowBasedRetention: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'SendableDataExtensionField.Name': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'SendableDataExtensionField.ObjectID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'SendableDataExtensionField.PartnerKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            SendableSubscriberField: {
                skipValidation: boolean;
            };
            'SendableSubscriberField.Name': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            Status: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'Template.CustomerKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'Template.ObjectID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'Template.PartnerKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            r__folder_ContentType: {
                skipValidation: boolean;
            };
            r__folder_Path: {
                skipValidation: boolean;
            };
            r__dataExtensionTemplate_name: {
                skipValidation: boolean;
            };
            c__retentionPolicy: {
                skipValidation: boolean;
            };
            c__retainUntil: {
                skipValidation: boolean;
            };
            c__dataRetentionPeriodUnitOfMeasure: {
                skipValidation: boolean;
            };
        };
    };
}
import MetadataType from './MetadataType.js';
//# sourceMappingURL=DataExtension.d.ts.map