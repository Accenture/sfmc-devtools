export default Query;
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
export type QueryItem = import('../../types/mcdev.d.js').QueryItem;
export type QueryMap = import('../../types/mcdev.d.js').QueryMap;
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
 * @typedef {import('../../types/mcdev.d.js').QueryItem} QueryItem
 * @typedef {import('../../types/mcdev.d.js').QueryMap} QueryMap
 */
/**
 * Query MetadataType
 *
 * @augments MetadataType
 */
declare class Query extends MetadataType {
    /**
     * Retrieves Metadata of queries
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<{metadata: QueryMap, type: string}>} Promise of metadata
     */
    static retrieve(retrieveDir: string, _?: void | string[], __?: void | string[], key?: string): Promise<{
        metadata: QueryMap;
        type: string;
    }>;
    /**
     * helper to allow us to select single metadata entries via REST
     *
     * @private
     * @param {string} key customer key
     * @returns {Promise.<string>} objectId or enpty string
     */
    private static _getObjectIdForSingleRetrieve;
    /**
     * Retrieves query metadata for caching
     *
     * @returns {Promise.<{metadata: QueryMap, type: string}>} Promise of metadata
     */
    static retrieveForCache(): Promise<{
        metadata: QueryMap;
        type: string;
    }>;
    /**
     * Retrieve a specific Query by Name
     *
     * @param {string} templateDir Directory where retrieved metadata directory will be saved
     * @param {string} name name of the metadata file
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {Promise.<{metadata: Query, type: string}>} Promise of metadata
     */
    static retrieveAsTemplate(templateDir: string, name: string, templateVariables: TemplateMap): Promise<{
        metadata: Query;
        type: string;
    }>;
    /**
     * manages post retrieve steps
     *
     * @param {QueryItem} metadata a single query
     * @returns {CodeExtractItem} Array with one metadata object and one query string
     */
    static postRetrieveTasks(metadata: QueryItem): CodeExtractItem;
    /**
     * Creates a single query
     *
     * @param {QueryItem} query a single query
     * @returns {Promise} Promise
     */
    static create(query: QueryItem): Promise<any>;
    /**
     * Updates a single query
     *
     * @param {QueryItem} query a single query
     * @returns {Promise} Promise
     */
    static update(query: QueryItem): Promise<any>;
    /**
     * prepares a Query for deployment
     *
     * @param {QueryItem} metadata a single query activity
     * @param {string} deployDir directory of deploy files
     * @returns {Promise.<QueryItem>} Promise
     */
    static preDeployTasks(metadata: QueryItem, deployDir: string): Promise<QueryItem>;
    /**
     * helper for {@link MetadataType.buildDefinition}
     * handles extracted code if any are found for complex types
     *
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string|string[]} targetDir (List of) Directory where built definitions will be saved
     * @param {QueryItem} metadata main JSON file that was read from file system
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @param {string} templateName name of the template to be built
     * @returns {Promise.<string[][]>} list of extracted files with path-parts provided as an array
     */
    static buildDefinitionForNested(templateDir: string, targetDir: string | string[], metadata: QueryItem, templateVariables: TemplateMap, templateName: string): Promise<string[][]>;
    /**
     * helper for {@link MetadataType.buildTemplate}
     * handles extracted code if any are found for complex types
     *
     * @example queries are saved as 1 json and 1 sql file. both files need to be run through templating
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string|string[]} targetDir (List of) Directory where built definitions will be saved
     * @param {QueryItem} metadata main JSON file that was read from file system
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @param {string} templateName name of the template to be built
     * @returns {Promise.<string[][]>} list of extracted files with path-parts provided as an array
     */
    static buildTemplateForNested(templateDir: string, targetDir: string | string[], metadata: QueryItem, templateVariables: TemplateMap, templateName: string): Promise<string[][]>;
    /**
     * helper for {@link Query.buildTemplateForNested} / {@link Query.buildDefinitionForNested}
     * handles extracted code if any are found for complex types
     *
     * @private
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string|string[]} targetDir (List of) Directory where built definitions will be saved
     * @param {QueryItem} metadata main JSON file that was read from file system
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @param {string} templateName name of the template to be built
     * @param {'definition'|'template'} mode defines what we use this helper for
     * @returns {Promise.<string[][]>} list of extracted files with path-parts provided as an array
     */
    private static _buildForNested;
    /**
     * clean up after deleting a metadata item
     *
     * @param {string} customerKey Identifier of metadata item
     * @returns {Promise.<void>} -
     */
    static postDeleteTasks(customerKey: string): Promise<void>;
    /**
     * Gets executed after deployment of metadata type
     *
     * @param {MetadataTypeMap} upsertResults metadata mapped by their keyField as returned by update/create
     */
    static postDeployTasks(upsertResults: MetadataTypeMap): Promise<void>;
}
declare namespace Query {
    let definition: {
        bodyIteratorField: string;
        dependencies: string[];
        folderType: string;
        filter: {
            description: string[];
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
        targetUpdateTypeMapping: {
            Append: number;
            Overwrite: number;
            Update: number;
        };
        maxKeyLength: number;
        type: string;
        typeDescription: string;
        typeRetrieveByDefault: boolean;
        typeName: string;
        fields: {
            categoryId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            createdDate: {
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
            isFrozen: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            key: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            modifiedDate: {
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
            queryDefinitionId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            queryText: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            targetDescription: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            targetId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            targetKey: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            targetName: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            targetUpdateTypeId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            targetUpdateTypeName: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            validatedQueryText: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            r__dataExtension_key: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            r__folder_Path: {
                skipValidation: boolean;
            };
        };
    };
}
import MetadataType from './MetadataType.js';
//# sourceMappingURL=Query.d.ts.map