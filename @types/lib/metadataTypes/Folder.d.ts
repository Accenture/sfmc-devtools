export default Folder;
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
export type ListItem = import("../../types/mcdev.d.js").ListItem;
export type ListMap = import("../../types/mcdev.d.js").ListMap;
export type ListIdMap = import("../../types/mcdev.d.js").ListIdMap;
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
 *
 * @typedef {import('../../types/mcdev.d.js').ListItem} ListItem
 * @typedef {import('../../types/mcdev.d.js').ListMap} ListMap
 * @typedef {import('../../types/mcdev.d.js').ListIdMap} ListIdMap
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
     * @returns {Promise.<{metadata: ListMap, type: string}>} Promise
     */
    static retrieve(retrieveDir: string, additionalFields?: string[], subTypeArr?: string[], key?: string): Promise<{
        metadata: ListMap;
        type: string;
    }>;
    /**
     * Retrieves folder metadata for caching
     *
     * @param {void | string[]} [_] parameter not used
     * @param {string[]} [subTypeArr] content type of folder
     * @returns {Promise.<{metadata: ListMap, type: string}>} Promise
     */
    static retrieveForCache(_?: void | string[], subTypeArr?: string[]): Promise<{
        metadata: ListMap;
        type: string;
    }>;
    /**
     * Folder upsert (copied from Metadata Upsert), after retrieving from target
     * and comparing to check if create or update operation is needed.
     * Copied due to having a dependency on itself, meaning the created need to be serial
     *
     * @param {ListMap} metadata metadata mapped by their keyField
     * @returns {Promise.<ListMap>} Promise of saved metadata
     */
    static upsert(metadata: ListMap): Promise<ListMap>;
    /**
     * creates a folder based on metatadata
     *
     * @param {ListItem} metadataEntry metadata of the folder
     * @returns {Promise.<any>} Promise of api response
     */
    static create(metadataEntry: ListItem): Promise<any>;
    /**
     * Updates a single Folder.
     *
     * @param {MetadataTypeItem} metadataEntry single metadata entry
     * @returns {Promise.<any>} Promise of api response
     */
    static update(metadataEntry: MetadataTypeItem): Promise<any>;
    /**
     * prepares a folder for deployment
     *
     * @param {ListItem} metadata a single folder definition
     * @returns {Promise.<ListItem>} Promise of parsed folder metadata
     */
    static preDeployTasks(metadata: ListItem): Promise<ListItem>;
    /**
     * Returns file contents mapped to their filename without '.json' ending
     *
     * @param {string} dir directory with json files, e.g. /retrieve/cred/bu/folder, /deploy/cred/bu/folder, /template/folder
     * @param {boolean} [listBadKeys] do not print errors, used for badKeys()
     * @returns {Promise.<ListMap>} fileName => fileContent map
     */
    static getJsonFromFS(dir: string, listBadKeys?: boolean): Promise<ListMap>;
    /**
     * Helper to retrieve the folders as promise
     *
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @param {boolean} [queryAllAccounts] which queryAllAccounts setting to use
     * @param {string[]} [contentTypeList] content type of folder
     * @returns {Promise.<ListItem[]>} soap object
     */
    static retrieveHelper(additionalFields?: string[], queryAllAccounts?: boolean, contentTypeList?: string[]): Promise<ListItem[]>;
    /**
     * Gets executed after retreive of metadata type
     *
     * @param {ListItem} metadata metadata mapped by their keyField
     * @returns {ListItem} cloned metadata
     */
    static postRetrieveTasks(metadata: ListItem): ListItem;
    /**
     * Helper for writing Metadata to disk, used for Retrieve and deploy
     *
     * @param {ListMap} results metadata results from deploy
     * @param {string} retrieveDir directory where metadata should be stored after deploy/retrieve
     * @returns {Promise.<ListMap>} Promise of saved metadata
     */
    static saveResults(results: ListMap, retrieveDir: string): Promise<ListMap>;
}
declare namespace Folder {
    let definition: {
        bodyIteratorField: string;
        dependencies: any[];
        dependencyGraph: any;
        subTypes: string[];
        deployFolderTypes: string[];
        deployFolderTypesEmailRest: string[];
        deployFolderTypesAssetRest: string[];
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
        typeCdpByDefault: boolean;
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
            description: {
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
            categoryType: {
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
            editable: {
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
            extendable: {
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
            objectId: {
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
            name: {
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
            parentCatId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            parentId: {
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
        };
    };
}
import MetadataType from './MetadataType.js';
//# sourceMappingURL=Folder.d.ts.map