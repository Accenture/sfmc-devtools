export default MetadataType;
export type BuObject = import("../../types/mcdev.d.js").BuObject;
export type CodeExtract = import("../../types/mcdev.d.js").CodeExtract;
export type CodeExtractItem = import("../../types/mcdev.d.js").CodeExtractItem;
export type Mcdevrc = import("../../types/mcdev.d.js").Mcdevrc;
export type MetadataTypeItem = import("../../types/mcdev.d.js").MetadataTypeItem;
export type MetadataTypeItemDiff = import("../../types/mcdev.d.js").MetadataTypeItemDiff;
export type MetadataTypeItemObj = import("../../types/mcdev.d.js").MetadataTypeItemObj;
export type MetadataTypeMap = import("../../types/mcdev.d.js").MetadataTypeMap;
export type MetadataTypeMapObj = import("../../types/mcdev.d.js").MetadataTypeMapObj;
export type MultiMetadataTypeList = import("../../types/mcdev.d.js").MultiMetadataTypeList;
export type SoapRequestParams = import("../../types/mcdev.d.js").SoapRequestParams;
export type TemplateMap = import("../../types/mcdev.d.js").TemplateMap;
export type TypeKeyCombo = import("../../types/mcdev.d.js").TypeKeyCombo;
export type SDK = import("sfmc-sdk").default;
export type SDKError = import("../../types/mcdev.d.js").SDKError;
export type SOAPError = import("../../types/mcdev.d.js").SOAPError;
export type RestError = import("../../types/mcdev.d.js").RestError;
export type ContentBlockConversionTypes = import("../../types/mcdev.d.js").ContentBlockConversionTypes;
/**
 * MetadataType class that gets extended by their specific metadata type class.
 * Provides default functionality that can be overwritten by child metadata type classes
 *
 */
declare class MetadataType {
    /**
     * Returns file contents mapped to their filename without '.json' ending
     *
     * @param {string} dir directory with json files, e.g. /retrieve/cred/bu/event, /deploy/cred/bu/event, /template/event
     * @param {boolean} [listBadKeys] do not print errors, used for badKeys()
     * @param {string[]} [selectedSubType] asset, message, ...
     * @returns {Promise.<MetadataTypeMap>} fileName => fileContent map
     */
    static getJsonFromFS(dir: string, listBadKeys?: boolean, selectedSubType?: string[]): Promise<MetadataTypeMap>;
    /**
     * Returns fieldnames of Metadata Type. 'this.definition.fields' variable only set in child classes.
     *
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @param {boolean} [isCaching] if true, then check if field should be skipped for caching
     * @returns {string[]} Fieldnames
     */
    static getFieldNamesToRetrieve(additionalFields?: string[], isCaching?: boolean): string[];
    /**
     * Deploys metadata
     *
     * @param {MetadataTypeMap} metadataMap metadata mapped by their keyField
     * @param {string} deployDir directory where deploy metadata are saved
     * @param {string} retrieveDir directory where metadata after deploy should be saved
     * @returns {Promise.<MetadataTypeMap>} Promise of keyField => metadata map
     */
    static deploy(metadataMap: MetadataTypeMap, deployDir: string, retrieveDir: string): Promise<MetadataTypeMap>;
    /**
     * Gets executed after deployment of metadata type
     *
     * @param {MetadataTypeMap} upsertResults metadata mapped by their keyField as returned by update/create
     * @param {MetadataTypeMap} originalMetadata metadata to be updated (contains additioanl fields)
     * @param {{created: number, updated: number}} createdUpdated counter representing successful creates/updates
     * @returns {Promise.<void>} -
     */
    static postDeployTasks(upsertResults: MetadataTypeMap, originalMetadata: MetadataTypeMap, createdUpdated: {
        created: number;
        updated: number;
    }): Promise<void>;
    /**
     * helper for {@link MetadataType.createREST}
     *
     * @param {MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {object} apiResponse varies depending on the API call
     * @param {MetadataTypeItem} metadataEntryWithAllFields like metadataEntry but before non-creatable fields were stripped
     * @returns {void}
     */
    static postCreateTasks(metadataEntry: MetadataTypeItem, apiResponse: object, metadataEntryWithAllFields: MetadataTypeItem): void;
    /**
     * helper for {@link MetadataType.updateREST}
     *
     * @param {MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {object} apiResponse varies depending on the API call
     * @returns {void}
     */
    static postUpdateTasks(metadataEntry: MetadataTypeItem, apiResponse: object): void;
    /**
     * helper for {@link MetadataType.createREST} when legacy API endpoints as these do not return the created item but only their new id
     *
     * @param {MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {object} apiResponse varies depending on the API call
     * @returns {Promise.<void>} -
     */
    static postDeployTasks_legacyApi(metadataEntry: MetadataTypeItem, apiResponse: object): Promise<void>;
    /**
     * Gets executed after retreive of metadata type
     *
     * @param {MetadataTypeItem} metadata a single item
     * @param {string} targetDir folder where retrieves should be saved
     * @param {boolean} [isTemplating] signals that we are retrieving templates
     * @returns {MetadataTypeItem} cloned metadata
     */
    static postRetrieveTasks(metadata: MetadataTypeItem, targetDir: string, isTemplating?: boolean): MetadataTypeItem;
    /**
     * generic script that retrieves the folder path from cache and updates the given metadata with it after retrieve
     *
     * @param {MetadataTypeItem} metadata a single item
     */
    static setFolderPath(metadata: MetadataTypeItem): void;
    /**
     * generic script that retrieves the folder ID from cache and updates the given metadata with it before deploy
     *
     * @param {MetadataTypeItem} metadata a single item
     */
    static setFolderId(metadata: MetadataTypeItem): void;
    /**
     * Gets metadata from Marketing Cloud
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @param {string[]} [subTypeArr] optionally limit to a single subtype
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} metadata
     */
    static retrieve(retrieveDir: string, additionalFields?: string[], subTypeArr?: string[], key?: string): Promise<MetadataTypeMapObj>;
    /**
     * Gets metadata from Marketing Cloud
     *
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @param {string[]} [subTypeArr] optionally limit to a single subtype
     * @returns {Promise.<MetadataTypeMapObj>} metadata
     */
    static retrieveChangelog(additionalFields?: string[], subTypeArr?: string[]): Promise<MetadataTypeMapObj>;
    /**
     * Gets metadata cache with limited fields and does not store value to disk
     *
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @param {string[]} [subTypeArr] optionally limit to a single subtype
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} metadata
     */
    static retrieveForCache(additionalFields?: string[], subTypeArr?: string[], key?: string): Promise<MetadataTypeMapObj>;
    /**
     * Gets metadata cache with limited fields and does not store value to disk
     *
     * @param {string} templateDir Directory where retrieved metadata directory will be saved
     * @param {string} name name of the metadata file
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @param {string} [subType] optionally limit to a single subtype
     * @returns {Promise.<MetadataTypeItemObj>} metadata
     */
    static retrieveAsTemplate(templateDir: string, name: string, templateVariables: TemplateMap, subType?: string): Promise<MetadataTypeItemObj>;
    /**
     * Retrieve a specific Script by Name
     *
     * @param {string} templateDir Directory where retrieved metadata directory will be saved
     * @param {string} uri rest endpoint for GET
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @param {string} name name (not key) of the metadata item
     * @returns {Promise.<{metadata: MetadataTypeItem, type: string}>} Promise
     */
    static retrieveTemplateREST(templateDir: string, uri: string, templateVariables: TemplateMap, name: string): Promise<{
        metadata: MetadataTypeItem;
        type: string;
    }>;
    /**
     * Gets metadata cache with limited fields and does not store value to disk
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {string} templateDir (List of) Directory where built definitions will be saved
     * @param {string} key name of the metadata file
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {Promise.<MetadataTypeItemObj>} single metadata
     */
    static buildTemplate(retrieveDir: string, templateDir: string, key: string, templateVariables: TemplateMap): Promise<MetadataTypeItemObj>;
    /**
     * Gets executed before deploying metadata
     *
     * @param {MetadataTypeItem} metadata a single metadata item
     * @param {string} deployDir folder where files for deployment are stored
     * @returns {Promise.<MetadataTypeItem>} Promise of a single metadata item
     */
    static preDeployTasks(metadata: MetadataTypeItem, deployDir: string): Promise<MetadataTypeItem>;
    /**
     * Abstract create method that needs to be implemented in child metadata type
     *
     * @param {MetadataTypeItem} metadata single metadata entry
     * @param {string} deployDir directory where deploy metadata are saved
     * @returns {Promise.<object> | null} Promise of API response or null in case of an error
     */
    static create(metadata: MetadataTypeItem, deployDir: string): Promise<object> | null;
    /**
     * Abstract update method that needs to be implemented in child metadata type
     *
     * @param {MetadataTypeItem} metadata single metadata entry
     * @param {MetadataTypeItem} [metadataBefore] metadata mapped by their keyField
     * @returns {Promise.<object> | null} Promise of API response or null in case of an error
     */
    static update(metadata: MetadataTypeItem, metadataBefore?: MetadataTypeItem): Promise<object> | null;
    /**
     * Abstract refresh method that needs to be implemented in child metadata type
     *
     * @returns {void}
     */
    static refresh(): void;
    /**
     *
     * @param {string[]} keyArr limit retrieval to given metadata type
     * @param {string} retrieveDir retrieve dir including cred and bu
     * @param {Set.<string>} [findAssetKeys] list of keys that were found referenced via ContentBlockByX; if set, method only gets keys and runs no updates
     * @returns {Promise.<Set.<string>>} found asset keys
     */
    static getCbReferenceKeys(keyArr: string[], retrieveDir: string, findAssetKeys?: Set<string>): Promise<Set<string>>;
    /**
     * this iterates over all items found in the retrieve folder and executes the type-specific method for replacing references
     *
     * @param {MetadataTypeMap} metadataMap list of metadata (keyField => metadata)
     * @param {string} retrieveDir retrieve dir including cred and bu
     * @param {Set.<string>} [findAssetKeys] list of keys that were found referenced via ContentBlockByX; if set, method only gets keys and runs no updates
     * @returns {Promise.<string[]>} Returns list of keys for which references were replaced
     */
    static replaceCbReferenceLoop(metadataMap: MetadataTypeMap, retrieveDir: string, findAssetKeys?: Set<string>): Promise<string[]>;
    /**
     * Abstract execute method that needs to be implemented in child metadata type
     *
     * @param {MetadataTypeItem} item single metadata item
     * @param {string} [retrieveDir] directory where metadata is saved
     * @param {Set.<string>} [findAssetKeys] list of keys that were found referenced via ContentBlockByX; if set, method only gets keys and runs no updates
     * @returns {Promise.<MetadataTypeItem | CodeExtractItem>} key of the item that was updated
     */
    static replaceCbReference(item: MetadataTypeItem, retrieveDir?: string, findAssetKeys?: Set<string>): Promise<MetadataTypeItem | CodeExtractItem>;
    /**
     * Abstract execute method that needs to be implemented in child metadata type
     *
     * @param {string[]} keyArr customerkey of the metadata
     * @returns {Promise.<string[]>} Returns list of keys that were executed
     */
    static execute(keyArr: string[]): Promise<string[]>;
    /**
     * Abstract pause method that needs to be implemented in child metadata type
     *
     * @param {string[]} keyArr customerkey of the metadata
     * @returns {Promise.<string[]>} Returns list of keys that were paused
     */
    static pause(keyArr: string[]): Promise<string[]>;
    /**
     * Abstract stop method that needs to be implemented in child metadata type
     *
     * @param {string[]} keyArr customerkey of the metadata
     * @returns {Promise.<string[]>} Returns list of keys that were stopped
     */
    static stop(keyArr: string[]): Promise<string[]>;
    /**
     * test if metadata was actually changed or not to potentially skip it during deployment
     *
     * @param {MetadataTypeItem} cachedVersion cached version from the server
     * @param {MetadataTypeItem} metadata item to upload
     * @param {string} [fieldName] optional field name to use for identifying the record in logs
     * @returns {boolean} true if metadata was changed
     */
    static hasChanged(cachedVersion: MetadataTypeItem, metadata: MetadataTypeItem, fieldName?: string): boolean;
    /**
     * test if metadata was actually changed or not to potentially skip it during deployment
     *
     * @param {MetadataTypeItem} cachedVersion cached version from the server
     * @param {MetadataTypeItem} metadataItem item to upload
     * @param {string} [fieldName] optional field name to use for identifying the record in logs
     * @param {boolean} [silent] optionally suppress logging
     * @returns {boolean} true on first identified deviation or false if none are found
     */
    static hasChangedGeneric(cachedVersion: MetadataTypeItem, metadataItem: MetadataTypeItem, fieldName?: string, silent?: boolean): boolean;
    /**
     * MetadataType upsert, after retrieving from target and comparing to check if create or update operation is needed.
     *
     * @param {MetadataTypeMap} metadataMap metadata mapped by their keyField
     * @param {string} deployDir directory where deploy metadata are saved
     * @param {boolean} [runCreatesSequentially] when a type has self-dependencies creates need to run one at a time and created keys need to be cached to ensure following creates/updates have thoses keys available
     * @returns {Promise.<MetadataTypeMap>} keyField => metadata map
     */
    static upsert(metadataMap: MetadataTypeMap, deployDir: string, runCreatesSequentially?: boolean): Promise<MetadataTypeMap>;
    /**
     * helper for {@link MetadataType.upsert}
     *
     * @param {MetadataTypeMap} metadataMap list of metadata
     * @param {string} metadataKey key of item we are looking at
     * @param {boolean} hasError error flag from previous code
     * @param {MetadataTypeItemDiff[]} metadataToUpdate list of items to update
     * @param {MetadataTypeItem[]} metadataToCreate list of items to create
     * @returns {Promise.<'create' | 'update' | 'skip'>} action to take
     */
    static createOrUpdate(metadataMap: MetadataTypeMap, metadataKey: string, hasError: boolean, metadataToUpdate: MetadataTypeItemDiff[], metadataToCreate: MetadataTypeItem[]): Promise<"create" | "update" | "skip">;
    /**
     * helper for {@link MetadataType.createOrUpdate}
     *
     * @param {MetadataTypeItem} metadataItem to be deployed item
     * @returns {MetadataTypeItem} cached item or undefined
     */
    static getCacheMatchedByName(metadataItem: MetadataTypeItem): MetadataTypeItem;
    /**
     * Creates a single metadata entry via REST
     *
     * @param {MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {string} uri rest endpoint for POST
     * @param {boolean} [handleOutside] if the API reponse is irregular this allows you to handle it outside of this generic method
     * @returns {Promise.<object> | null} Promise of API response or null in case of an error
     */
    static createREST(metadataEntry: MetadataTypeItem, uri: string, handleOutside?: boolean): Promise<object> | null;
    /**
     * Creates a single metadata entry via fuel-soap (generic lib not wrapper)
     *
     * @param {MetadataTypeItem} metadataEntry single metadata entry
     * @param {boolean} [handleOutside] if the API reponse is irregular this allows you to handle it outside of this generic method
     * @returns {Promise.<object> | null} Promise of API response or null in case of an error
     */
    static createSOAP(metadataEntry: MetadataTypeItem, handleOutside?: boolean): Promise<object> | null;
    /**
     * Updates a single metadata entry via REST
     *
     * @param {MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {string} uri rest endpoint for PATCH
     * @param {'patch'|'post'|'put'} [httpMethod] defaults to 'patch'; some update requests require PUT instead of PATCH
     * @returns {Promise.<object> | null} Promise of API response or null in case of an error
     */
    static updateREST(metadataEntry: MetadataTypeItem, uri: string, httpMethod?: "patch" | "post" | "put"): Promise<object> | null;
    /**
     * helper for {@link MetadataType.updateREST} and {@link MetadataType.updateSOAP} that removes old files after the key was changed
     *
     * @param {MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {boolean} [keepMap] some types require to check the old-key new-key relationship in their postDeployTasks; currently used by dataExtension only
     * @returns {Promise.<void>} -
     */
    static _postChangeKeyTasks(metadataEntry: MetadataTypeItem, keepMap?: boolean): Promise<void>;
    /**
     * Updates a single metadata entry via fuel-soap (generic lib not wrapper)
     *
     * @param {MetadataTypeItem} metadataEntry single metadata entry
     * @param {boolean} [handleOutside] if the API reponse is irregular this allows you to handle it outside of this generic method
     * @returns {Promise.<object> | null} Promise of API response or null in case of an error
     */
    static updateSOAP(metadataEntry: MetadataTypeItem, handleOutside?: boolean): Promise<object> | null;
    /**
     *
     * @param {SOAPError} ex error that occured
     * @param {'creating'|'updating'|'retrieving'|'executing'|'pausing'} msg what to print in the log
     * @param {MetadataTypeItem} [metadataEntry] single metadata entry
     * @param {boolean} [handleOutside] if the API reponse is irregular this allows you to handle it outside of this generic method
     */
    static _handleSOAPErrors(ex: SOAPError, msg: "creating" | "updating" | "retrieving" | "executing" | "pausing", metadataEntry?: MetadataTypeItem, handleOutside?: boolean): void;
    /**
     * helper for {@link MetadataType._handleSOAPErrors}
     *
     * @param {SOAPError} ex error that occured
     * @returns {string} error message
     */
    static getSOAPErrorMsg(ex: SOAPError): string;
    /**
     * Retrieves SOAP via generic fuel-soap wrapper based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     *
     * @param {string} [retrieveDir] Directory where retrieved metadata directory will be saved
     * @param {SoapRequestParams} [requestParams] required for the specific request (filter for example)
     * @param {string} [singleRetrieve] key of single item to filter by
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @returns {Promise.<MetadataTypeMapObj>} Promise of item map
     */
    static retrieveSOAP(retrieveDir?: string, requestParams?: SoapRequestParams, singleRetrieve?: string, additionalFields?: string[]): Promise<MetadataTypeMapObj>;
    /**
     * Retrieves Metadata for Rest Types
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {string} uri rest endpoint for GET
     * @param {TemplateMap} [templateVariables] variables to be replaced in the metadata
     * @param {string} [singleRetrieve] key of single item to filter by
     * @returns {Promise.<{metadata: (MetadataTypeMap | MetadataTypeItem), type: string}>} Promise of item map (single item for templated result)
     */
    static retrieveREST(retrieveDir: string, uri: string, templateVariables?: TemplateMap, singleRetrieve?: string): Promise<{
        metadata: (MetadataTypeMap | MetadataTypeItem);
        type: string;
    }>;
    /**
     *
     * @param {object[]} urlArray {uri: string, id: string} combo of URL and ID/key of metadata
     * @param {number} [concurrentRequests] optionally set a different amount of concurrent requests
     * @param {boolean} [logAmountOfUrls] if true, prints an info message about to-be loaded amount of metadata
     * @returns {Promise.<{metadata: (MetadataTypeMap | MetadataTypeItem), type: string}>} Promise of item map (single item for templated result)
     */
    static retrieveRESTcollection(urlArray: object[], concurrentRequests?: number, logAmountOfUrls?: boolean): Promise<{
        metadata: (MetadataTypeMap | MetadataTypeItem);
        type: string;
    }>;
    /**
     * helper for {@link this.retrieveRESTcollection}
     *
     * @param {RestError} ex exception
     * @param {string} id id or key of item
     * @returns {Promise.<any>} -
     */
    static handleRESTErrors(ex: RestError, id: string): Promise<any>;
    /**
     * Used to execute a query/automation etc.
     *
     * @param {string} uri REST endpoint where the POST request should be sent
     * @param {string} key item key
     * @returns {Promise.<{key:string, response:string}>} metadata key and API response (OK or error)
     */
    static executeREST(uri: string, key: string): Promise<{
        key: string;
        response: string;
    }>;
    /**
     * Used to execute a query/automation etc.
     *
     * @param {MetadataTypeItem} [metadataEntry] single metadata entry
     * @returns {Promise.<{key:string, response:object}>} metadata key and API response
     */
    static executeSOAP(metadataEntry?: MetadataTypeItem): Promise<{
        key: string;
        response: object;
    }>;
    /**
     * helper for {@link MetadataType.retrieveREST} and {@link MetadataType.retrieveSOAP}
     *
     * @param {string|number} singleRetrieve key of single item to filter by
     * @param {MetadataTypeMap} metadataMap saved metadata
     * @returns {Promise.<void>} -
     */
    static runDocumentOnRetrieve(singleRetrieve: string | number, metadataMap: MetadataTypeMap): Promise<void>;
    /**
     * Builds map of metadata entries mapped to their keyfields
     *
     * @param {object} body json of response body
     * @param {string} [singleRetrieve] key of single item to filter by
     * @returns {MetadataTypeMap} keyField => metadata map
     */
    static parseResponseBody(body: object, singleRetrieve?: string): MetadataTypeMap;
    /**
     * Deletes a field in a metadata entry if the selected definition property equals false.
     *
     * @example
     * Removes field (or nested fields childs) that are not updateable
     * deleteFieldByDefinition(metadataEntry, 'CustomerKey', 'isUpdateable');
     * @param {MetadataTypeItem} metadataEntry One entry of a metadataType
     * @param {string} fieldPath field path to be checked if it conforms to the definition (dot seperated if nested): 'fuu.bar'
     * @param {'isCreateable'|'isUpdateable'|'retrieving'|'template'} definitionProperty delete field if definitionProperty equals false for specified field. Options: [isCreateable | isUpdateable]
     * @param {string} origin string of parent object, required when using arrays as these are parsed slightly differently.
     * @returns {void}
     */
    static deleteFieldByDefinition(metadataEntry: MetadataTypeItem, fieldPath: string, definitionProperty: "isCreateable" | "isUpdateable" | "retrieving" | "template", origin: string): void;
    /**
     * Remove fields from metadata entry that are not createable
     *
     * @param {MetadataTypeItem} metadataEntry metadata entry
     * @returns {void}
     */
    static removeNotCreateableFields(metadataEntry: MetadataTypeItem): void;
    /**
     * Remove fields from metadata entry that are not updateable
     *
     * @param {MetadataTypeItem} metadataEntry metadata entry
     * @returns {void}
     */
    static removeNotUpdateableFields(metadataEntry: MetadataTypeItem): void;
    /**
     * Remove fields from metadata entry that are not needed in the template
     *
     * @param {MetadataTypeItem} metadataEntry metadata entry
     * @returns {void}
     */
    static keepTemplateFields(metadataEntry: MetadataTypeItem): void;
    /**
     * Remove fields from metadata entry that are not needed in the stored metadata
     *
     * @param {MetadataTypeItem} metadataEntry metadata entry
     * @returns {void}
     */
    static keepRetrieveFields(metadataEntry: MetadataTypeItem): void;
    /**
     * checks if the current metadata entry should be saved on retrieve or not
     *
     * @static
     * @param {MetadataTypeItem} metadataEntry metadata entry
     * @param {boolean} [include] true: use definition.include / options.include; false=exclude: use definition.filter / options.exclude
     * @returns {boolean} true: skip saving == filtered; false: continue with saving
     * @memberof MetadataType
     */
    static isFiltered(metadataEntry: MetadataTypeItem, include?: boolean): boolean;
    /**
     * optionally filter by what folder something is in
     *
     * @static
     * @param {object} metadataEntry metadata entry
     * @param {boolean} [include] true: use definition.include / options.include; false=exclude: use definition.filter / options.exclude
     * @returns {boolean} true: filtered == do NOT save; false: not filtered == do save
     * @memberof MetadataType
     */
    static isFilteredFolder(metadataEntry: object, include?: boolean): boolean;
    /**
     * internal helper
     *
     * @private
     * @param {object} myFilter include/exclude filter object
     * @param {string} r__folder_Path already determined folder path
     * @returns {?boolean} true: filter value found; false: filter value not found; null: no filter defined
     */
    private static _filterFolder;
    /**
     * internal helper
     *
     * @private
     * @param {object} myFilter include/exclude filter object
     * @param {object} metadataEntry metadata entry
     * @returns {?boolean} true: filter value found; false: filter value not found; null: no filter defined
     */
    private static _filterOther;
    /**
     * Helper for writing Metadata to disk, used for Retrieve and deploy
     *
     * @param {MetadataTypeMap} results metadata results from deploy
     * @param {string} retrieveDir directory where metadata should be stored after deploy/retrieve
     * @param {string} [overrideType] for use when there is a subtype (such as folder-queries)
     * @param {TemplateMap} [templateVariables] variables to be replaced in the metadata
     * @returns {Promise.<MetadataTypeMap>} Promise of saved metadata
     */
    static saveResults(results: MetadataTypeMap, retrieveDir: string, overrideType?: string, templateVariables?: TemplateMap): Promise<MetadataTypeMap>;
    /**
     *
     * @param {MetadataTypeMap} results metadata results from deploy
     * @param {string} originalKey key of metadata
     * @param {string[]} baseDir [retrieveDir, ...overrideType.split('-')]
     * @param {string} [subtypeExtension] e.g. ".asset-meta" or ".query-meta"
     * @param {TemplateMap} [templateVariables] variables to be replaced in the metadata
     * @returns {Promise.<MetadataTypeItem>} saved metadata
     */
    static saveToDisk(results: MetadataTypeMap, originalKey: string, baseDir: string[], subtypeExtension?: string, templateVariables?: TemplateMap): Promise<MetadataTypeItem>;
    /**
     * helper for {@link MetadataType.buildDefinitionForNested}
     * searches extracted file for template variable names and applies the market values
     *
     * @param {string} code code from extracted code
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {string} code with markets applied
     */
    static applyTemplateValues(code: string, templateVariables: TemplateMap): string;
    /**
     * helper for {@link MetadataType.buildTemplateForNested}
     * searches extracted file for template variable values and applies the market variable names
     *
     * @param {string} code code from extracted code
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {string} code with markets applied
     */
    static applyTemplateNames(code: string, templateVariables: TemplateMap): string;
    /**
     * helper for {@link MetadataType.buildDefinition}
     * handles extracted code if any are found for complex types (e.g script, asset, query)
     *
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string | string[]} targetDir Directory where built definitions will be saved
     * @param {MetadataTypeItem} metadata main JSON file that was read from file system
     * @param {TemplateMap} variables variables to be replaced in the metadata
     * @param {string} templateName name of the template to be built
     * @returns {Promise.<string[][]>} list of extracted files with path-parts provided as an array
     */
    static buildDefinitionForNested(templateDir: string, targetDir: string | string[], metadata: MetadataTypeItem, variables: TemplateMap, templateName: string): Promise<string[][]>;
    /**
     * helper for {@link MetadataType.buildTemplate}
     * handles extracted code if any are found for complex types
     *
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string|string[]} targetDir (List of) Directory where built definitions will be saved
     * @param {MetadataTypeItem} metadata main JSON file that was read from file system
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @param {string} templateName name of the template to be built
     * @returns {Promise.<string[][]>} list of extracted files with path-parts provided as an array
     */
    static buildTemplateForNested(templateDir: string, targetDir: string | string[], metadata: MetadataTypeItem, templateVariables: TemplateMap, templateName: string): Promise<string[][]>;
    /**
     * check template directory for complex types that open subfolders for their subtypes
     *
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string} templateName name of the metadata file
     * @returns {Promise.<string>} subtype name
     */
    static findSubType(templateDir: string, templateName: string): Promise<string>;
    /**
     * optional method used for some types to try a different folder structure
     *
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string[]} typeDirArr current subdir for this type
     * @param {string} templateName name of the metadata template
     * @param {string} fileName name of the metadata template file w/o extension
     * @param {Error} ex error from first attempt
     * @returns {Promise.<string>} metadata in string form
     */
    static readSecondaryFolder(templateDir: string, typeDirArr: string[], templateName: string, fileName: string, ex: Error): Promise<string>;
    /**
     * Builds definition based on template
     * NOTE: Most metadata files should use this generic method, unless custom
     * parsing is required (for example scripts & queries)
     *
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string | string[]} targetDir (List of) Directory where built definitions will be saved
     * @param {string} templateName name of the metadata file
     * @param {TemplateMap} variables variables to be replaced in the metadata
     * @returns {Promise.<MetadataTypeMapObj>} Promise of item map
     */
    static buildDefinition(templateDir: string, targetDir: string | string[], templateName: string, variables: TemplateMap): Promise<MetadataTypeMapObj>;
    /**
     *  Standardizes a check for multiple messages
     *
     * @param {object} ex response payload from REST API
     * @returns {string[]} formatted Error Message
     */
    static getErrorsREST(ex: object): string[];
    /**
     * Gets metadata cache with limited fields and does not store value to disk
     *
     * @param {MetadataTypeMap} [metadata] a list of type definitions
     * @param {boolean} [isDeploy] used to skip non-supported message during deploy
     * @returns {void}
     */
    static document(metadata?: MetadataTypeMap, isDeploy?: boolean): void;
    /**
     * get name & key for provided id
     *
     * @param {string} id Identifier of metadata
     * @returns {Promise.<{key:string, name:string}>} key, name and path of metadata; null if not found
     */
    static resolveId(id: string): Promise<{
        key: string;
        name: string;
    }>;
    /**
     * Delete a metadata item from the specified business unit
     *
     * @param {string} customerKey Identifier of data extension
     * @returns {Promise.<boolean>} deletion success status
     */
    static deleteByKey(customerKey: string): Promise<boolean>;
    /**
     * clean up after deleting a metadata item
     *
     * @param {string} customerKey Identifier of metadata item
     * @param {string[]} [additionalExtensions] additional file extensions to delete on top of `${this.definition.type}-meta.json`
     * @returns {Promise.<void>} - Promise
     */
    static postDeleteTasks(customerKey: string, additionalExtensions?: string[]): Promise<void>;
    /**
     * Delete a data extension from the specified business unit
     *
     * @param {string} customerKey Identifier of metadata
     * @param {string} [overrideKeyField] optionally change the name of the key field if the api uses a different name
     * @param {boolean} [handleOutside] if the API reponse is irregular this allows you to handle it outside of this generic method
     * @returns {Promise.<boolean>} deletion success flag
     */
    static deleteByKeySOAP(customerKey: string, overrideKeyField?: string, handleOutside?: boolean): Promise<boolean>;
    /**
     * Delete a data extension from the specified business unit
     *
     * @param {string} url endpoint
     * @param {string} key Identifier of metadata
     * @param {boolean} [handleOutside] if the API reponse is irregular this allows you to handle it outside of this generic method
     * @returns {Promise.<boolean>} deletion success flag
     */
    static deleteByKeyREST(url: string, key: string, handleOutside?: boolean): Promise<boolean>;
    /**
     * Returns metadata of a business unit that is saved locally
     *
     * @param {string} readDir root directory of metadata.
     * @param {boolean} [listBadKeys] do not print errors, used for badKeys()
     * @param {object} [buMetadata] Metadata of BU in local directory
     * @returns {Promise.<object>} Metadata of BU in local directory
     */
    static readBUMetadataForType(readDir: string, listBadKeys?: boolean, buMetadata?: object): Promise<object>;
    /**
     * should return only the json for all but asset, query and script that are saved as multiple files
     * additionally, the documentation for dataExtension and automation should be returned
     *
     * @param {string[]} keyArr customerkey of the metadata
     * @returns {Promise.<string[]>} list of all files that need to be committed in a flat array ['path/file1.ext', 'path/file2.ext']
     */
    static getFilesToCommit(keyArr: string[]): Promise<string[]>;
    /**
     *
     * @param {string[]} keyArr customerkey of the metadata
     * @param {TypeKeyCombo} multiTypeKeyList list of all keys that need to be deployed
     * @param {TypeKeyCombo} notFoundList list of all keys that were not found
     * @param {boolean} isFirstCall will not gray out the log message for type/keys that you initially selected but only for their dependencies
     * @returns {Promise.<TypeKeyCombo>} list of all keys that need to be deployed
     */
    static getDependentFiles(keyArr: string[], multiTypeKeyList?: TypeKeyCombo, notFoundList?: TypeKeyCombo, isFirstCall?: boolean): Promise<TypeKeyCombo>;
    /**
     * optional helper for {@link this.getDependentTypes}
     *
     * @param {object} metadataItem metadata json read from filesystem
     * @param {TypeKeyCombo} dependentTypeKeyCombo list started in this.getDependentTypes
     */
    static getDependentFilesExtra(metadataItem: object, dependentTypeKeyCombo: TypeKeyCombo): void;
    /**
     * helper for {@link MetadataType.getDependentFiles}
     *
     * @param {MetadataTypeItem} obj the metadataItem to search in
     * @param {string} nestedKey e.g "my.field.here"
     * @param {string} dependentType used for types that need custom handling
     * @returns {(string)[]} result array or null if nothing was found
     */
    static getNestedValue(obj: MetadataTypeItem, nestedKey: string, dependentType: string): (string)[];
    /**
     * helper for {@link MetadataType.getNestedValue}
     *
     * @param {any} obj the metadataItem to search in (or the result)
     * @param {string[]} nestedKeyParts key in dot-notation split into parts
     * @param {string} dependentType used for types that need custom handling
     * @returns {(string) | (string)[]} result
     */
    static getNestedValueHelper(obj: any, nestedKeyParts: string[], dependentType: string): (string) | (string)[];
    /**
     *
     * @param {MetadataTypeMap} metadataMap metadata mapped by their keyField
     * @returns {string[]} list of keys
     */
    static getKeysForFixing(metadataMap: MetadataTypeMap): string[];
    /**
     * helper for getKeysForFixing and createOrUpdate
     *
     * @param {string} baseField name of the field to start the new key with
     * @param {MetadataTypeItem} metadataItem -
     * @param {number} maxKeyLength -
     * @returns {string} newKey
     */
    static getNewKey(baseField: string, metadataItem: MetadataTypeItem, maxKeyLength: number): string;
    /**
     * @typedef {'off'|'warn'|'error'} ValidationLevel
     */
    /**
     * @typedef {object} ValidationRules
     * @property {ValidationLevel} [noGuidKeys] flags metadata that did not get a proper key
     * @property {ValidationLevel} [noRootFolder] flags metadata that did not get a proper key
     * @property {{type:string[], options: ValidationRules}[]} [overrides] flags metadata that did not get a proper key
     */
    /**
     * Gets executed before deploying metadata
     *
     * @param {'retrieve'|'buildDefinition'|'deploy'} method used to select the right config
     * @param {MetadataTypeItem} item a single metadata item
     * @param {string} targetDir folder where files for deployment are stored
     * @returns {Promise.<MetadataTypeItem>} Promise of a single metadata item
     */
    static validation(method: "retrieve" | "buildDefinition" | "deploy", item: MetadataTypeItem, targetDir: string): Promise<MetadataTypeItem>;
}
declare namespace MetadataType {
    namespace definition {
        let bodyIteratorField: string;
        let dependencies: any[];
        let fields: any;
        let hasExtended: any;
        let idField: string;
        let keyField: string;
        let nameField: string;
        let type: string;
    }
    let client: SDK;
    let properties: Mcdevrc;
    let subType: string;
    let buObject: BuObject;
}
//# sourceMappingURL=MetadataType.d.ts.map