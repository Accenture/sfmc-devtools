export default Folder;
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
 * Folder MetadataType
 *
 * @augments MetadataType
 */
declare class Folder extends MetadataType {
    /**
     * Retrieves metadata of metadata type into local filesystem. executes callback with retrieved metadata
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @param {string[]} [subTypeArr] content type of folder
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise} Promise
     */
    static retrieve(retrieveDir: string, additionalFields?: string[], subTypeArr?: string[], key?: string): Promise<any>;
    /**
     * Retrieves folder metadata for caching
     *
     * @param {void | string[]} [_] parameter not used
     * @param {string[]} [subTypeArr] content type of folder
     * @returns {Promise} Promise
     */
    static retrieveForCache(_?: void | string[], subTypeArr?: string[]): Promise<any>;
    /**
     * Folder upsert (copied from Metadata Upsert), after retrieving from target
     * and comparing to check if create or update operation is needed.
     * Copied due to having a dependency on itself, meaning the created need to be serial
     *
     * @param {MetadataTypeMap} metadata metadata mapped by their keyField
     * @returns {Promise.<object>} Promise of saved metadata
     */
    static upsert(metadata: MetadataTypeMap): Promise<object>;
    /**
     * creates a folder based on metatadata
     *
     * @param {MetadataTypeItem} metadataEntry metadata of the folder
     * @returns {Promise} Promise
     */
    static create(metadataEntry: MetadataTypeItem): Promise<any>;
    /**
     * Updates a single Folder.
     *
     * @param {MetadataTypeItem} metadataEntry single metadata entry
     * @returns {Promise} Promise
     */
    static update(metadataEntry: MetadataTypeItem): Promise<any>;
    /**
     * prepares a folder for deployment
     *
     * @param {MetadataTypeItem} metadata a single folder definition
     * @returns {Promise.<MetadataTypeItem>} Promise of parsed folder metadata
     */
    static preDeployTasks(metadata: MetadataTypeItem): Promise<MetadataTypeItem>;
    /**
     * Returns file contents mapped to their filename without '.json' ending
     *
     * @param {string} dir directory that contains '.json' files to be read
     * @param {boolean} [listBadKeys] do not print errors, used for badKeys()
     * @returns {MetadataTypeMap} fileName => fileContent map
     */
    static getJsonFromFS(dir: string, listBadKeys?: boolean): MetadataTypeMap;
    /**
     * Helper to retrieve the folders as promise
     *
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @param {boolean} [queryAllAccounts] which queryAllAccounts setting to use
     * @param {string[]} [contentTypeList] content type of folder
     * @returns {Promise.<object>} soap object
     */
    static retrieveHelper(additionalFields?: string[], queryAllAccounts?: boolean, contentTypeList?: string[]): Promise<object>;
    /**
     * Gets executed after retreive of metadata type
     *
     * @param {MetadataTypeItem} metadata metadata mapped by their keyField
     * @returns {MetadataTypeItem} cloned metadata
     */
    static postRetrieveTasks(metadata: MetadataTypeItem): MetadataTypeItem;
    /**
     * Helper for writing Metadata to disk, used for Retrieve and deploy
     *
     * @param {MetadataTypeMap} results metadata results from deploy
     * @param {string} retrieveDir directory where metadata should be stored after deploy/retrieve
     * @param {number | string} mid unused parameter
     * @returns {Promise.<object>} Promise of saved metadata
     */
    static saveResults(results: MetadataTypeMap, retrieveDir: string, mid: number | string): Promise<object>;
}
declare namespace Folder {
    let definition: {
        bodyIteratorField: string;
        dependencies: any[];
        subTypes: string[];
        deployFolderTypes: string[];
        deployFolderBlacklist: string[];
        folderTypesFromParent: string[];
        hasExtended: boolean;
        idField: string;
        keepId: boolean;
        keyIsFixed: boolean;
        keyField: string;
        nameField: string;
        restPagination: boolean;
        type: string;
        soapType: string;
        typeDescription: string;
        typeRetrieveByDefault: boolean;
        typeName: string;
        fields: {
            $: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            '@_xsi:type': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            ID: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'Client.ID': {
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
            Description: {
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
            ContentType: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            IsActive: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            IsEditable: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            AllowChildren: {
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
            'ParentFolder.CustomerKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'ParentFolder.ID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'ParentFolder.PartnerKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'ParentFolder.ObjectID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'ParentFolder.Path': {
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
            Path: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            _generated: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            catType: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            name: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            parentCatId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
        };
    };
}
import MetadataType from './MetadataType.js';
//# sourceMappingURL=Folder.d.ts.map