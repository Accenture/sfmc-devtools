export default Asset;
export type BuObject = import("../../types/mcdev.d.js").BuObject;
export type CodeExtract = import("../../types/mcdev.d.js").CodeExtract;
export type CodeExtractItem = import("../../types/mcdev.d.js").CodeExtractItem;
export type MetadataTypeItem = import("../../types/mcdev.d.js").MetadataTypeItem;
export type MetadataTypeItemDiff = import("../../types/mcdev.d.js").MetadataTypeItemDiff;
export type MetadataTypeMap = import("../../types/mcdev.d.js").MetadataTypeMap;
export type SoapRequestParams = import("../../types/mcdev.d.js").SoapRequestParams;
export type TemplateMap = import("../../types/mcdev.d.js").TemplateMap;
export type TypeKeyCombo = import("../../types/mcdev.d.js").TypeKeyCombo;
export type AssetSubType = import("../../types/mcdev.d.js").AssetSubType;
export type AssetMap = import("../../types/mcdev.d.js").AssetMap;
export type AssetItem = import("../../types/mcdev.d.js").AssetItem;
export type AssetRequestParams = import("../../types/mcdev.d.js").AssetRequestParams;
/**
 * @typedef {import('../../types/mcdev.d.js').BuObject} BuObject
 * @typedef {import('../../types/mcdev.d.js').CodeExtract} CodeExtract
 * @typedef {import('../../types/mcdev.d.js').CodeExtractItem} CodeExtractItem
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItem} MetadataTypeItem
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItemDiff} MetadataTypeItemDiff
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMap} MetadataTypeMap
 * @typedef {import('../../types/mcdev.d.js').SoapRequestParams} SoapRequestParams
 * @typedef {import('../../types/mcdev.d.js').TemplateMap} TemplateMap
 * @typedef {import('../../types/mcdev.d.js').TypeKeyCombo} TypeKeyCombo
 */
/**
 * @typedef {import('../../types/mcdev.d.js').AssetSubType} AssetSubType
 * @typedef {import('../../types/mcdev.d.js').AssetMap} AssetMap
 * @typedef {import('../../types/mcdev.d.js').AssetItem} AssetItem
 * @typedef {import('../../types/mcdev.d.js').AssetRequestParams} AssetRequestParams
 */
/**
 * FileTransfer MetadataType
 *
 * @augments MetadataType
 */
declare class Asset extends MetadataType {
    /**
     * Retrieves Metadata of Asset
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void | string[]} _ unused parameter
     * @param {string[]} [subTypeArr] optionally limit to a single AssetSubType
     * @param {string} [key] customer key
     * @param {boolean} [loadShared] optionally retrieve assets from other BUs that were shared with the current
     * @returns {Promise.<{metadata: AssetMap, type: string}>} Promise
     */
    static retrieve(retrieveDir: string, _: void | string[], subTypeArr?: string[], key?: string, loadShared?: boolean): Promise<{
        metadata: AssetMap;
        type: string;
    }>;
    /**
     * Retrieves asset metadata for caching
     *
     * @param {void | string[]} [_] parameter not used
     * @param {string[]} [subTypeArr] optionally limit to a single subtype
     * @param {void | string} [__] parameter not used
     * @param {boolean} [loadShared] optionally retrieve assets from other BUs that were shared with the current
     * @returns {Promise.<{metadata: AssetMap, type: string}>} Promise
     */
    static retrieveForCache(_?: void | string[], subTypeArr?: string[], __?: void | string, loadShared?: boolean): Promise<{
        metadata: AssetMap;
        type: string;
    }>;
    /**
     * Retrieves asset metadata for templating
     *
     * @param {string} templateDir Directory where retrieved metadata directory will be saved
     * @param {string} name name of the metadata file
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @param {AssetSubType} [selectedSubType] optionally limit to a single subtype
     * @returns {Promise.<{metadata: AssetItem, type: string}>} Promise
     */
    static retrieveAsTemplate(templateDir: string, name: string, templateVariables: TemplateMap, selectedSubType?: AssetSubType): Promise<{
        metadata: AssetItem;
        type: string;
    }>;
    /**
     * helper for {@link Asset.retrieve} + {@link Asset.retrieveAsTemplate}
     *
     * @private
     * @returns {string[]} AssetSubType array
     */
    private static _getSubTypes;
    /**
     * Creates a single asset
     *
     * @param {AssetItem} metadata a single asset
     * @returns {Promise} Promise
     */
    static create(metadata: AssetItem): Promise<any>;
    /**
     * Updates a single asset
     *
     * @param {AssetItem} metadata a single asset
     * @returns {Promise} Promise
     */
    static update(metadata: AssetItem): Promise<any>;
    /**
     * Retrieves Metadata of a specific asset type
     *
     * @param {string|string[]} subType group of similar assets to put in a folder (ie. images)
     * @param {string} [retrieveDir] target directory for saving assets
     * @param {string} [key] key/id/name to filter by
     * @param {TemplateMap} [templateVariables] variables to be replaced in the metadata
     * @param {boolean} [loadShared] optionally retrieve assets from other BUs that were shared with the current
     * @returns {Promise.<object[]>} Promise
     */
    static requestSubType(subType: string | string[], retrieveDir?: string, key?: string, templateVariables?: TemplateMap, loadShared?: boolean): Promise<object[]>;
    /**
     * Retrieves extended metadata (files or extended content) of asset
     *
     * @param {Array} items array of items to retrieve
     * @param {string} subType group of similar assets to put in a folder (ie. images)
     * @param {string} retrieveDir target directory for saving assets
     * @param {TemplateMap} [templateVariables] variables to be replaced in the metadata
     * @returns {Promise.<MetadataTypeMap>} Promise
     */
    static requestAndSaveExtended(items: any[], subType: string, retrieveDir: string, templateVariables?: TemplateMap): Promise<MetadataTypeMap>;
    /**
     * helper that reset the log level and prints errors
     *
     * @private
     * @param {'info'|'verbose'|'debug'|'error'} loggerLevelBak original logger level
     * @param {object[]} failed array of failed items
     */
    private static _resetLogLevel;
    /**
     * Some metadata types store their actual content as a separate file, e.g. images
     * This method retrieves these and saves them alongside the metadata json
     *
     * @param {AssetItem} metadata a single asset
     * @param {string} subType group of similar assets to put in a folder (ie. images)
     * @param {string} retrieveDir target directory for saving assets
     * @returns {Promise.<void>} -
     */
    static _retrieveExtendedFile(metadata: AssetItem, subType: string, retrieveDir: string): Promise<void>;
    /**
     * helper for {@link Asset.preDeployTasks}
     * Some metadata types store their actual content as a separate file, e.g. images
     * This method reads these from the local FS stores them in the metadata object allowing to deploy it
     *
     * @param {AssetItem} metadata a single asset
     * @param {string} subType group of similar assets to put in a folder (ie. images)
     * @param {string} deployDir directory of deploy files
     * @param {boolean} [pathOnly] used by getFilesToCommit which does not need the binary file to be actually read
     * @returns {Promise.<string>} if found will return the path of the binary file
     */
    static _readExtendedFileFromFS(metadata: AssetItem, subType: string, deployDir: string, pathOnly?: boolean): Promise<string>;
    /**
     * manages post retrieve steps
     *
     * @param {AssetItem} metadata a single asset
     * @returns {CodeExtractItem} metadata
     */
    static postRetrieveTasks(metadata: AssetItem): CodeExtractItem;
    /**
     * helper for {@link Asset.postDeployTasks}. triggers a refresh of active triggerredSendDefinitions associated with the updated asset-message items. Gets executed if refresh option has been set.
     *
     * @private
     * @param {MetadataTypeMap} metadata metadata mapped by their keyField
     * @returns {Promise.<void>} -
     */
    private static _refreshTriggeredSend;
    /**
     * prepares an asset definition for deployment
     *
     * @param {AssetItem} metadata a single asset
     * @param {string} deployDir directory of deploy files
     * @returns {Promise.<AssetItem>} Promise
     */
    static preDeployTasks(metadata: AssetItem, deployDir: string): Promise<AssetItem>;
    /**
     * find the subType matching the extendedSubType
     *
     * @param {string} extendedSubType webpage, htmlblock, etc
     * @returns {string} subType: block, message, other, etc
     */
    static "__#3@#getMainSubtype"(extendedSubType: string): string;
    /**
     * helper to find a new unique name during asset creation
     *
     * @private
     * @param {string} key key of the asset
     * @param {string} name name of the asset
     * @param {string} type assetType-name
     * @param {{ type: string; key: string; name: any; }[]} namesInFolder names of the assets in the same folder
     * @returns {string} new name
     */
    private static _findUniqueName;
    /**
     * determines the subtype of the current asset
     *
     * @private
     * @param {AssetItem} metadata a single asset
     * @returns {string} subtype
     */
    private static _getSubtype;
    /**
     * helper for {@link MetadataType.buildDefinition}
     * handles extracted code if any are found for complex types
     *
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string} targetDir Directory where built definitions will be saved
     * @param {AssetItem} metadata main JSON file that was read from file system
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @param {string} templateName name of the template to be built
     * @returns {Promise.<string[][]>} list of extracted files with path-parts provided as an array
     */
    static buildDefinitionForNested(templateDir: string, targetDir: string, metadata: AssetItem, templateVariables: TemplateMap, templateName: string): Promise<string[][]>;
    /**
     * helper for {@link MetadataType.buildTemplate}
     * handles extracted code if any are found for complex types
     *
     * @example assets of type codesnippetblock will result in 1 json and 1 amp/html file. both files need to be run through templating
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string|string[]} targetDir (List of) Directory where built definitions will be saved
     * @param {AssetItem} metadata main JSON file that was read from file system
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @param {string} templateName name of the template to be built
     * @returns {Promise.<string[][]>} list of extracted files with path-parts provided as an array
     */
    static buildTemplateForNested(templateDir: string, targetDir: string | string[], metadata: AssetItem, templateVariables: TemplateMap, templateName: string): Promise<string[][]>;
    /**
     * helper for {@link MetadataType.buildDefinition}
     * handles extracted code if any are found for complex types
     *
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string|string[]} targetDir (List of) Directory where built definitions will be saved
     * @param {AssetItem} metadata main JSON file that was read from file system
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @param {string} templateName name of the template to be built
     * @param {'definition'|'template'} mode defines what we use this helper for
     * @returns {Promise.<string[][]>} list of extracted files with path-parts provided as an array
     */
    static _buildForNested(templateDir: string, targetDir: string | string[], metadata: AssetItem, templateVariables: TemplateMap, templateName: string, mode: "definition" | "template"): Promise<string[][]>;
    /**
     * helper for {@link Asset.preDeployTasks} that loads extracted code content back into JSON
     *
     * @param {AssetItem} metadata a single asset definition
     * @param {string} deployDir directory of deploy files
     * @param {string} subType asset-subtype name; full list in AssetSubType
     * @param {string} [templateName] name of the template used to built defintion (prior applying templating)
     * @param {boolean} [fileListOnly] does not read file contents nor update metadata if true
     * @returns {Promise.<CodeExtract[]>} fileList for templating (disregarded during deployment)
     */
    static _mergeCode(metadata: AssetItem, deployDir: string, subType: string, templateName?: string, fileListOnly?: boolean): Promise<CodeExtract[]>;
    /**
     * helper for {@link Asset.preDeployTasks} that loads extracted code content back into JSON
     *
     * @param {string} prefix usually the customerkey
     * @param {object} metadataSlots metadata.views.html.slots or deeper slots.<>.blocks.<>.slots
     * @param {string[]} readDirArr directory of deploy files
     * @param {string} subtypeExtension asset-subtype name ending on -meta
     * @param {string[]} subDirArr directory of files w/o leading deploy dir
     * @param {object[]} fileList directory of files w/o leading deploy dir
     * @param {string} customerKey external key of template (could have been changed if used during templating)
     * @param {string} [templateName] name of the template used to built defintion (prior applying templating)
     * @param {boolean} [fileListOnly] does not read file contents nor update metadata if true
     * @returns {Promise.<void>} -
     */
    static _mergeCode_slots(prefix: string, metadataSlots: object, readDirArr: string[], subtypeExtension: string, subDirArr: string[], fileList: object[], customerKey: string, templateName?: string, fileListOnly?: boolean): Promise<void>;
    /**
     * helper for {@link Asset.postRetrieveTasks} that finds code content in JSON and extracts it
     * to allow saving that separately and formatted
     *
     * @param {AssetItem} metadata a single asset definition
     * @returns {CodeExtractItem} { json: metadata, codeArr: object[], subFolder: string[] }
     */
    static _extractCode(metadata: AssetItem): CodeExtractItem;
    /**
     * helper for {@link Asset.postRetrieveTasks} via {@link Asset._extractCode}
     *
     * @param {string} prefix usually the customerkey
     * @param {object} metadataSlots metadata.views.html.slots or deeper slots.<>.blocks.<>.slots
     * @param {object[]} codeArr to be extended array for extracted code
     * @returns {void}
     */
    static _extractCode_slots(prefix: string, metadataSlots: object, codeArr: object[]): void;
    /**
     * Returns file contents mapped to their fileName without '.json' ending
     *
     * @param {string} dir directory that contains '.json' files to be read
     * @param {boolean} _ unused parameter
     * @param {string[]} selectedSubType asset, message, ...
     * @returns {Promise.<MetadataTypeMap>} fileName => fileContent map
     */
    static getJsonFromFS(dir: string, _: boolean, selectedSubType: string[]): Promise<MetadataTypeMap>;
    /**
     * optional method used for some types to try a different folder structure
     *
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string[]} typeDirArr current subdir for this type
     * @param {string} templateName name of the metadata template
     * @param {string} fileName name of the metadata template file w/o extension
     * @returns {Promise.<string>} metadata in string form
     */
    static readSecondaryFolder(templateDir: string, typeDirArr: string[], templateName: string, fileName: string): Promise<string>;
    /**
     * helper to allow us to select single metadata entries via REST
     *
     * @private
     * @param {string} key customer key
     * @returns {Promise.<string>} id value or null
     */
    private static _getIdForSingleRetrieve;
    /**
     * helper to allow us to select single metadata entries via REST
     *
     * @private
     * @param {string} id id field
     * @returns {Promise.<string>} key value or null
     */
    private static _getKeyForSingleRetrieve;
    /**
     * clean up after deleting a metadata item
     * cannot use the generic method due to the complexity of how assets are saved to disk
     *
     * @param {string} key Identifier of metadata item
     * @returns {Promise.<void>} -
     */
    static postDeleteTasks(key: string): Promise<void>;
    /**
     * get name & key for provided id
     *
     * @param {string} id Identifier of metadata
     * @returns {Promise.<{key:string, name:string, path:string, folder:string, mid:number, error:string, isShared:boolean}>} key, name and path of metadata; null if not found
     */
    static resolveId(id: string): Promise<{
        key: string;
        name: string;
        path: string;
        folder: string;
        mid: number;
        error: string;
        isShared: boolean;
    }>;
    /**
     * helper for {@link Asset.resolveId} that finds the path to the asset's code
     *
     * @param {string} subType asset subtype
     * @param {object} item api response for metadata
     * @param {string} buName owner business unit name
     * @returns {Promise.<string>} path to the asset's code
     */
    static "__#3@#getPath"(subType: string, item: object, buName: string): Promise<string>;
    /**
     * helper for {@link Asset.resolveId} that loads the JSON file for the asset
     *
     * @param {string} subType asset subtype
     * @param {object} item api response for metadata
     * @returns {Promise.<object>} JS object of the asset we loaded from disk
     */
    static "__#3@#getJson"(subType: string, item: object): Promise<object>;
    /**
     *
     * @param {MetadataTypeItem} item single metadata item
     * @param {string} retrieveDir directory where metadata is saved
     * @returns {Promise.<MetadataTypeItem>} key of the item that was updated
     */
    static replaceCbReference(item: MetadataTypeItem, retrieveDir: string): Promise<MetadataTypeItem>;
    /**
     * @param {object} slots metadata.views.html.slots or deeper slots.<>.blocks.<>.slots
     * @param {string[]} dependentKeyArr list of found keys
     */
    static _getDependentFilesExtra(slots: object, dependentKeyArr: string[]): void;
}
declare namespace Asset {
    let definition: {
        bodyIteratorField: string;
        dependencies: string[];
        dependencyGraph: {
            asset: string[];
        };
        folderType: string;
        hasExtended: boolean;
        idField: string;
        keyIsFixed: boolean;
        keyField: string;
        nameField: string;
        createdDateField: string;
        createdNameField: string;
        lastmodDateField: string;
        lastmodNameField: string;
        restPagination: boolean;
        maxKeyLength: number;
        type: string;
        typeDescription: string;
        typeRetrieveByDefault: string[];
        typeName: string;
        fields: {
            activeDate: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            allowedBlocks: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            assetType: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'assetType.displayName': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'assetType.id': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'assetType.name': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            availableViews: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            modelVersion: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            blocks: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            businessUnitAvailability: {
                skipValidation: boolean;
            };
            category: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'category.id': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'category.name': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'category.parentId': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            channels: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            content: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            contentType: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'createdBy.email': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'createdBy.id': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'createdBy.name': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'createdBy.userId': {
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
            customerKey: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            customFields: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'data.campaigns': {
                skipValidation: boolean;
            };
            'data.approvals': {
                skipValidation: boolean;
            };
            'data.email.attributes': {
                skipValidation: boolean;
            };
            'data.email.legacy': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'data.email.options': {
                skipValidation: boolean;
            };
            'data.portfolio': {
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
            design: {
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
            file: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'fileProperties.fileName': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'fileProperties.extension': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'fileProperties.externalUrl': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'fileProperties.fileSize': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'fileProperties.fileCreatedDate': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'fileProperties.width': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'fileProperties.height': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'fileProperties.publishedURL': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            id: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            legacyData: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            locked: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            maxBlocks: {
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
            meta: {
                skipValidation: boolean;
            };
            minBlocks: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'modifiedBy.email': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'modifiedBy.id': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'modifiedBy.name': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'modifiedBy.userId': {
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
            objectID: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            owner: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'owner.email': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'owner.id': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'owner.name': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'owner.userId': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            sharingProperties: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'sharingProperties.localAssets': {
                skipValidation: boolean;
            };
            'sharingProperties.sharedWith': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'sharingProperties.sharingType': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            slots: {
                skipValidation: boolean;
            };
            'status.id': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'status.name': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            superContent: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            tags: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            template: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            thumbnail: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            version: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            views: {
                skipValidation: boolean;
            };
            r__folder_Path: {
                skipValidation: boolean;
            };
        };
        subTypes: string[];
        crosslinkedSubTypes: string[];
        selflinkedSubTypes: string[];
        binarySubtypes: string[];
        extendedSubTypes: {
            asset: string[];
            image: string[];
            rawimage: string[];
            video: string[];
            document: string[];
            audio: string[];
            archive: string[];
            code: string[];
            textfile: string[];
            block: string[];
            template: string[];
            message: string[];
            other: string[];
        };
        typeMapping: {
            asset: number;
            file: number;
            block: number;
            template: number;
            message: number;
            custom: number;
            default: number;
            image: number;
            rawimage: number;
            video: number;
            document: number;
            audio: number;
            archive: number;
            code: number;
            textfile: number;
            ai: number;
            psd: number;
            pdd: number;
            eps: number;
            gif: number;
            jpe: number;
            jpeg: number;
            jpg: number;
            jp2: number;
            jpx: number;
            pict: number;
            pct: number;
            png: number;
            tif: number;
            tiff: number;
            tga: number;
            bmp: number;
            wmf: number;
            vsd: number;
            pnm: number;
            pgm: number;
            pbm: number;
            ppm: number;
            svg: number;
            '3fr': number;
            ari: number;
            arw: number;
            bay: number;
            cap: number;
            crw: number;
            cr2: number;
            dcr: number;
            dcs: number;
            dng: number;
            drf: number;
            eip: number;
            erf: number;
            fff: number;
            iiq: number;
            k25: number;
            kdc: number;
            mef: number;
            mos: number;
            mrw: number;
            nef: number;
            nrw: number;
            orf: number;
            pef: number;
            ptx: number;
            pxn: number;
            raf: number;
            raw: number;
            rw2: number;
            rwl: number;
            rwz: number;
            srf: number;
            sr2: number;
            srw: number;
            x3f: number;
            '3gp': number;
            '3gpp': number;
            '3g2': number;
            '3gp2': number;
            asf: number;
            avi: number;
            m2ts: number;
            mts: number;
            dif: number;
            dv: number;
            mkv: number;
            mpg: number;
            f4v: number;
            flv: number;
            mjpg: number;
            mjpeg: number;
            mxf: number;
            mpeg: number;
            mp4: number;
            m4v: number;
            mp4v: number;
            mov: number;
            swf: number;
            wmv: number;
            rm: number;
            ogv: number;
            indd: number;
            indt: number;
            incx: number;
            wwcx: number;
            doc: number;
            docx: number;
            dot: number;
            dotx: number;
            mdb: number;
            mpp: number;
            ics: number;
            xls: number;
            xlsx: number;
            xlk: number;
            xlsm: number;
            xlt: number;
            xltm: number;
            csv: number;
            tsv: number;
            tab: number;
            pps: number;
            ppsx: number;
            ppt: number;
            pptx: number;
            pot: number;
            thmx: number;
            pdf: number;
            ps: number;
            qxd: number;
            rtf: number;
            sxc: number;
            sxi: number;
            sxw: number;
            odt: number;
            ods: number;
            ots: number;
            odp: number;
            otp: number;
            epub: number;
            dvi: number;
            key: number;
            keynote: number;
            pez: number;
            aac: number;
            m4a: number;
            au: number;
            aif: number;
            aiff: number;
            aifc: number;
            mp3: number;
            wav: number;
            wma: number;
            midi: number;
            oga: number;
            ogg: number;
            ra: number;
            vox: number;
            voc: number;
            '7z': number;
            arj: number;
            bz2: number;
            cab: number;
            gz: number;
            gzip: number;
            iso: number;
            lha: number;
            sit: number;
            tgz: number;
            jar: number;
            rar: number;
            tar: number;
            zip: number;
            gpg: number;
            htm: number;
            html: number;
            xhtml: number;
            xht: number;
            css: number;
            less: number;
            sass: number;
            js: number;
            json: number;
            atom: number;
            rss: number;
            xml: number;
            xsl: number;
            xslt: number;
            md: number;
            markdown: number;
            as: number;
            fla: number;
            eml: number;
            text: number;
            txt: number;
            freeformblock: number;
            textblock: number;
            htmlblock: number;
            textplusimageblock: number;
            imageblock: number;
            abtestblock: number;
            dynamicblock: number;
            stylingblock: number;
            einsteincontentblock: number;
            webpage: number;
            webtemplate: number;
            templatebasedemail: number;
            htmlemail: number;
            textonlyemail: number;
            socialshareblock: number;
            socialfollowblock: number;
            buttonblock: number;
            layoutblock: number;
            defaulttemplate: number;
            smartcaptureblock: number;
            smartcaptureformfieldblock: number;
            smartcapturesubmitoptionsblock: number;
            slotpropertiesblock: number;
            externalcontentblock: number;
            codesnippetblock: number;
            rssfeedblock: number;
            formstylingblock: number;
            referenceblock: number;
            imagecarouselblock: number;
            customblock: number;
            liveimageblock: number;
            livesettingblock: number;
            contentmap: number;
            jsonmessage: number;
            icemailformblock: number;
        };
    };
}
import MetadataType from './MetadataType.js';
//# sourceMappingURL=Asset.d.ts.map