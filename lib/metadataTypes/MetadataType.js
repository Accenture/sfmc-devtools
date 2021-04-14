'use strict';

/* eslint no-unused-vars:off */
/*
 * README no-unused-vars is reduced to WARNING here as this file is a template
 * for all metadata types and methods often define params that are not used
 * in the generic version of the method
 */

/**
 * @typedef {Object.<string, any>} MetadataTypeItem
 *
 * @typedef {Object} CodeExtractItem
 * @property {MetadataTypeItem} json metadata of one item w/o code
 * @property {CodeExtract[]} codeArr list of code snippets in this item
 * @property {string[]} subFolder mostly set to null, otherwise list of subfolders
 *
* @typedef {Object} CodeExtract
 * @property {string[]} subFolder mostly set to null, otherwise subfolders path split into elements
 * @property {string} fileName name of file w/o extension
 * @property {string} fileExt file extension
 * @property {string} content file content
 * @property {'base64'} [encoding] optional for binary files

 *
 * @typedef {Object.<string, MetadataTypeItem>} MetadataTypeMap
 *
 * @typedef {Object.<string, MetadataTypeMap>} MultiMetadataTypeMap
 */

const Util = require('../util/util');
const File = require('../util/file');

// @ts-ignore
const Promise = require('bluebird');
const Mustache = require('mustache');

/**
 * MetadataType class that gets extended by their specific metadata type class.
 * Provides default functionality that can be overwritten by child metadata type classes
 *
 */
class MetadataType {
    /**
     * Instantiates a metadata constructor to avoid passing variables.
     *
     * @param {Util.ET_Client} client client for sfmc fuelsdk
     * @param {string} businessUnit Name of business unit (corresponding to their keys in 'properties.json' file). Used to access correct directories
     * @param {Object} cache metadata cache
     * @param {Object} properties mcdev config
     * @param {string} [subType] limit retrieve to specific subType
     */
    constructor(client, businessUnit, cache, properties, subType) {
        this.client = client;
        this.businessUnit = businessUnit;
        this.cache = cache;
        this.properties = properties;
        this.subType = subType;
    }

    /**
     * Returns file contents mapped to their filename without '.json' ending
     * @param {string} dir directory that contains '.json' files to be read
     * @param {boolean} [listBadKeys=false] do not print errors, used for badKeys()
     * @returns {Object} fileName => fileContent map
     */
    static getJsonFromFS(dir, listBadKeys) {
        const fileName2FileContent = {};
        try {
            const files = File.readdirSync(dir);
            files.forEach((fileName) => {
                try {
                    if (fileName.endsWith('.json')) {
                        const fileContent = File.readJSONFile(dir, fileName, true, false);
                        const fileNameWithoutEnding = File.reverseFilterIllegalFilenames(
                            fileName.split(/\.(\w|-)+-meta.json/)[0]
                        );
                        // We always store the filename using the External Key (CustomerKey or key) to avoid duplicate names.
                        // to ensure any changes are done to both the filename and external key do a check here
                        if (
                            fileContent[this.definition.keyField] === fileNameWithoutEnding ||
                            listBadKeys
                        ) {
                            fileName2FileContent[fileNameWithoutEnding] = fileContent;
                        } else {
                            Util.metadataLogger(
                                'error',
                                this.definition.type,
                                'getJsonFromFS',
                                'Name of the Metadata and the External Identifier must match',
                                JSON.stringify({
                                    Filename: fileNameWithoutEnding,
                                    ExternalIdentifier: fileContent[this.definition.keyField],
                                })
                            );
                        }
                    }
                } catch (ex) {
                    // by catching this in the loop we gracefully handle the issue and move on to the next file
                    Util.metadataLogger('debug', this.definition.type, 'getJsonFromFS', ex);
                }
            });
        } catch (ex) {
            // this will catch issues with readdirSync
            Util.metadataLogger('debug', this.definition.type, 'getJsonFromFS', ex);
            throw new Error(ex);
        }
        return fileName2FileContent;
    }

    /**
     * Returns fieldnames of Metadata Type. 'this.definition.fields' variable only set in child classes.
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @returns {string[]} Fieldnames
     */
    static getFieldNamesToRetrieve(additionalFields) {
        const fieldNames = [];
        for (const fieldName in this.definition.fields) {
            if (
                (additionalFields && additionalFields.includes(fieldName)) ||
                this.definition.fields[fieldName].retrieving
            ) {
                fieldNames.push(fieldName);
            }
        }
        if (!fieldNames.includes(this.definition.idField)) {
            // Always retrieve the ID because it may be used in references
            fieldNames.push(this.definition.idField);
        }
        return fieldNames;
    }

    /**
     * Deploys metadata
     * @param {MetadataTypeMap} metadata metadata mapped by their keyField
     * @param {string} deployDir directory where deploy metadata are saved
     * @param {string} retrieveDir directory where metadata after deploy should be saved
     * @param {Util.BuObject} buObject properties for auth
     * @returns {Promise<Object>} Promise of keyField => metadata map
     */
    static async deploy(metadata, deployDir, retrieveDir, buObject) {
        const upsertResults = await this.upsert(metadata, deployDir, buObject);
        await this.postDeployTasks(upsertResults, metadata);
        const savedMetadata = await this.saveResults(upsertResults, retrieveDir, null);
        if (this.properties.metaDataTypes.documentOnRetrieve.includes(this.definition.type)) {
            // * do not await here as this might take a while and has no impact on the deploy
            this.document(buObject, savedMetadata, true);
        }
        return upsertResults;
    }

    /**
     * Gets executed after deployment of metadata type
     * @param {MetadataTypeMap} metadata metadata mapped by their keyField
     * @param {MetadataTypeMap} originalMetadata metadata to be updated (contains additioanl fields)
     * @returns {void}
     */
    static postDeployTasks(metadata, originalMetadata) {}

    /**
     * Gets executed after retreive of metadata type
     * @param {MetadataTypeItem} metadata a single item
     * @param {string} targetDir folder where retrieves should be saved
     * @param {boolean} [isTemplating] signals that we are retrieving templates
     * @returns {MetadataTypeItem} cloned metadata
     */
    static postRetrieveTasks(metadata, targetDir, isTemplating) {
        return JSON.parse(JSON.stringify(metadata));
    }
    /**
     * used to synchronize name and external key during retrieveAsTemplate
     * @param {MetadataTypeItem} metadata a single item
     * @param {string} [warningMsg] optional msg to show the user
     * @returns {void}
     */
    static overrideKeyWithName(metadata, warningMsg) {
        if (
            this.definition.nameField &&
            this.definition.keyField &&
            metadata[this.definition.nameField] !== metadata[this.definition.keyField]
        ) {
            Util.logger.warn(
                `Reset external key of ${this.definition.type} ${
                    metadata[this.definition.nameField]
                } to its name (${metadata[this.definition.keyField]})`
            );
            if (warningMsg) {
                Util.logger.warn(warningMsg);
            }
            // do this after printing to cli or we lost the info
            metadata[this.definition.keyField] = metadata[this.definition.nameField];
        }
    }
    /**
     * Gets metadata from Marketing Cloud
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {string[]} [overrideFields] Returns specified fields even if their retrieve definition is not set to true
     * @param {Util.BuObject} buObject properties for auth
     * @param {string} [subType] optionally limit to a single subtype
     * @returns {Promise<{metadata:MetadataTypeMap,type:string}>} metadata
     */
    static retrieve(retrieveDir, overrideFields, buObject, subType) {
        Util.metadataLogger('error', this.definition.type, 'retrieve', `Not Supported`);
        const metadata = {};
        return { metadata: null, type: this.definition.type };
    }

    /**
     * Gets metadata cache with limited fields and does not store value to disk
     * @param {Util.BuObject} buObject properties for auth
     * @param {string} [subType] optionally limit to a single subtype
     * @returns {Promise<{metadata:MetadataTypeMap,type:string}>} metadata
     */
    static async retrieveForCache(buObject, subType) {
        return this.retrieve(null, null, buObject, subType);
    }
    /**
     * Gets metadata cache with limited fields and does not store value to disk
     * @param {string} templateDir Directory where retrieved metadata directory will be saved
     * @param {string} name name of the metadata file
     * @param {Util.TemplateMap} templateVariables variables to be replaced in the metadata
     * @param {string} [subType] optionally limit to a single subtype
     * @returns {Promise<{metadata:MetadataTypeMap,type:string}>} metadata
     */
    static retrieveAsTemplate(templateDir, name, templateVariables, subType) {
        Util.logger.error('retrieveAsTemplate is not supported yet for ' + this.definition.type);
        Util.metadataLogger(
            'debug',
            this.definition.type,
            'retrieveAsTemplate',
            `(${templateDir}, ${name}, ${templateVariables}) no templating function`
        );
        return { metadata: null, type: this.definition.type };
    }

    /**
     * Gets executed before deploying metadata
     * @param {MetadataTypeItem} metadata a single metadata item
     * @param {string} deployDir folder where files for deployment are stored
     * @returns {Promise<MetadataTypeItem>} Promise of a single metadata item
     */
    static async preDeployTasks(metadata, deployDir) {
        return metadata;
    }

    /**
     * Abstract create method that needs to be implemented in child metadata type
     * @param {MetadataTypeItem} metadata single metadata entry
     * @param {string} deployDir directory where deploy metadata are saved
     * @returns {void}
     */
    static create(metadata, deployDir) {
        Util.metadataLogger('error', this.definition.type, 'create', 'create not supported');
        return;
    }

    /**
     * Abstract update method that needs to be implemented in child metadata type
     * @param {MetadataTypeItem} metadata single metadata entry
     * @param {MetadataTypeItem} [metadataBefore] metadata mapped by their keyField
     * @returns {void}
     */
    static update(metadata, metadataBefore) {
        Util.metadataLogger('error', this.definition.type, 'update', 'update not supported');
        return;
    }

    /**
     * MetadataType upsert, after retrieving from target and comparing to check if create or update operation is needed.
     * @param {MetadataTypeMap} metadata metadata mapped by their keyField
     * @param {string} deployDir directory where deploy metadata are saved
     * @param {Util.BuObject} [buObject] properties for auth
     * @returns {Promise<MetadataTypeMap>} keyField => metadata map
     */
    static async upsert(metadata, deployDir, buObject) {
        const metadataToUpdate = [];
        const metadataToCreate = [];
        for (const metadataKey in metadata) {
            try {
                // preDeployTasks parsing
                const deployableMetadata = await this.preDeployTasks(
                    metadata[metadataKey],
                    deployDir
                );
                // if preDeploy returns nothing then it cannot be deployed so skip deployment
                if (deployableMetadata) {
                    metadata[metadataKey] = deployableMetadata;
                    const normalizedKey = File.reverseFilterIllegalFilenames(metadataKey);
                    // Update if it already exists; Create it if not
                    if (
                        Util.logger.level === 'debug' &&
                        metadata[metadataKey][this.definition.idField]
                    ) {
                        // TODO: re-evaluate in future releases if & when we managed to solve folder dependencies once and for all
                        // only used if resource is excluded from cache and we still want to update it
                        // needed e.g. to rewire lost folders
                        Util.logger.warn(
                            'Hotfix for non-cachable resource found in deploy folder. Trying update:'
                        );
                        Util.logger.warn(JSON.stringify(metadata[metadataKey]));
                        metadataToUpdate.push({
                            before: {},
                            after: metadata[metadataKey],
                        });
                    } else if (this.cache[this.definition.type][normalizedKey]) {
                        // normal way of processing update files
                        metadata[metadataKey][this.definition.idField] = this.cache[
                            this.definition.type
                        ][normalizedKey][this.definition.idField];
                        metadataToUpdate.push({
                            before: this.cache[this.definition.type][normalizedKey],
                            after: metadata[metadataKey],
                        });
                    } else {
                        metadataToCreate.push(metadata[metadataKey]);
                    }
                }
            } catch (ex) {
                Util.metadataLogger('error', this.definition.type, 'upsert', ex, metadataKey);
            }
        }

        const createResults = (
            await Promise.map(
                metadataToCreate,
                (metadataEntry) => this.create(metadataEntry, deployDir),
                { concurrency: 10 }
            )
        ).filter((r) => r !== undefined && r !== null);
        const updateResults = (
            await Promise.map(
                metadataToUpdate,
                (metadataEntry) => this.update(metadataEntry.after, metadataEntry.before),
                { concurrency: 10 }
            )
        ).filter((r) => r !== undefined && r !== null);
        // Logging
        Util.metadataLogger(
            'info',
            this.definition.type,
            'upsert',
            `${createResults.length} of ${metadataToCreate.length} created / ${updateResults.length} of ${metadataToUpdate.length} updated`
        );

        // if Results then parse as SOAP
        if (this.definition.bodyIteratorField === 'Results') {
            // put in Retrieve Format for parsing
            // todo add handling when response does not contain items.
            // @ts-ignore
            const metadataResults = createResults
                .concat(updateResults)
                .filter((r) => r !== undefined && r !== null)
                .map((r) => r.body.Results)
                .flat()
                .map((r) => r.Object);
            return this.parseResponseBody({ Results: metadataResults });
        } else {
            // put in Retrieve Format for parsing
            // todo add handling when response does not contain items.
            // @ts-ignore
            const metadataResults = createResults
                .concat(updateResults)
                .filter((r) => r !== undefined && r !== null && r.res && r.res.body)
                .map((r) => r.res.body);
            return this.parseResponseBody({ items: metadataResults });
        }
    }

    /**
     * Creates a single metadata entry via REST
     * @param {MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {string} uri rest endpoint for POST
     * @returns {Promise} Promise
     */
    static async createREST(metadataEntry, uri) {
        this.removeNotCreateableFields(metadataEntry);

        try {
            let response;
            await Util.retryOnError(
                `Retrying ${this.definition.type}: ${metadataEntry[this.definition.nameField]}`,
                async () => (response = await this.client.rest.post(uri, metadataEntry))
            );
            this.checkForErrors(response);
            Util.logger.info(
                `- created ${this.definition.type}: ${metadataEntry[this.definition.keyField]}`
            );
            return response;
        } catch (ex) {
            Util.logger.error(
                `- error creating ${this.definition.type}: ${
                    metadataEntry[this.definition.keyField]
                } (${ex.message})`
            );
            return null;
        }
    }

    /**
     * Creates a single metadata entry via fuel-soap (generic lib not wrapper)
     * @param {MetadataTypeItem} metadataEntry single metadata entry
     * @returns {Promise} Promise
     */
    static async createSOAP(metadataEntry) {
        try {
            const res = await new Promise((resolve, reject) => {
                this.removeNotCreateableFields(metadataEntry);
                this.client.soap.create(
                    this.definition.type.charAt(0).toUpperCase() + this.definition.type.slice(1),
                    metadataEntry,
                    null,
                    (error, response) => (error ? reject(error) : resolve(response))
                );
            });
            Util.logger.info(
                `- created ${this.definition.type}: ${metadataEntry[this.definition.keyField]}`
            );
            return res;
        } catch (ex) {
            Util.logger.error(
                `- error creating ${this.definition.type}: ${
                    metadataEntry[this.definition.keyField]
                } (${ex.message})`
            );

            return null;
        }
    }

    /**
     * Updates a single metadata entry via REST
     * @param {MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {string} uri rest endpoint for PATCH
     * @returns {Promise} Promise
     */
    static async updateREST(metadataEntry, uri) {
        this.removeNotUpdateableFields(metadataEntry);
        const options = {
            uri: uri,
            json: metadataEntry,
            headers: {},
        };
        try {
            let response;
            await Util.retryOnError(
                `Retrying ${this.definition.type}: ${metadataEntry[this.definition.nameField]}`,
                async () => (response = await this.client.rest.patch(options))
            );
            this.checkForErrors(response);
            Util.logger.info(
                `- updated ${this.definition.type}: ${metadataEntry[this.definition.keyField]}`
            );
            return response;
        } catch (ex) {
            Util.logger.error(
                `- error updating ${this.definition.type}: ${
                    metadataEntry[this.definition.keyField]
                } (${ex.message})`
            );
            return null;
        }
    }

    /**
     * Updates a single metadata entry via fuel-soap (generic lib not wrapper)
     * @param {MetadataTypeItem} metadataEntry single metadata entry
     * @returns {Promise} Promise
     */
    static async updateSOAP(metadataEntry) {
        try {
            const res = await new Promise((resolve, reject) => {
                this.removeNotUpdateableFields(metadataEntry);
                this.client.soap.update(
                    this.definition.type.charAt(0).toUpperCase() + this.definition.type.slice(1),
                    metadataEntry,
                    null,
                    (error, response) => (error ? reject(error) : resolve(response))
                );
            });
            Util.logger.info(
                `- updated ${this.definition.type}: ${metadataEntry[this.definition.keyField]}`
            );
            return res;
        } catch (ex) {
            Util.logger.error(
                `- error updating ${this.definition.type}: ${
                    metadataEntry[this.definition.keyField]
                } (${ex.message})`
            );

            return null;
        }
    }
    /**
     * Retrieves SOAP via generic fuel-soap wrapper based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {Util.BuObject} buObject properties for auth
     * @param {Object} [requestParams] required for the specific request (filter for example)
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @returns {Promise<{metadata:MetadataTypeMap,type:string}>} Promise of item map
     */
    static async retrieveSOAPgeneric(retrieveDir, buObject, requestParams, additionalFields) {
        const response = await this.client.soap.retrieveBulk(
            this.definition.type,
            this.getFieldNamesToRetrieve(additionalFields),
            requestParams
        );

        const metadata = this.parseResponseBody(response);

        if (retrieveDir) {
            const savedMetadata = await this.saveResults(metadata, retrieveDir, null);
            Util.logger.info(
                `Downloaded: ${this.definition.type} (${Object.keys(savedMetadata).length})`
            );

            if (
                buObject &&
                this.properties.metaDataTypes.documentOnRetrieve.includes(this.definition.type)
            ) {
                await this.document(buObject, savedMetadata);
            }
        }
        return { metadata: metadata, type: this.definition.type };
    }

    /**
     * Retrieves Metadata for Rest Types
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {string} uri rest endpoint for GET
     * @param {string} [overrideType] force a metadata type (mainly used for Folders)
     * @param {Util.TemplateMap} [templateVariables] variables to be replaced in the metadata
     * @returns {Promise<{metadata:MetadataTypeMap,type:string}>} Promise of item map
     */
    static async retrieveREST(retrieveDir, uri, overrideType, templateVariables) {
        const response = this.definition.paginate
            ? await this.client.rest.getBulk(uri)
            : await this.client.rest.get(uri);
        const results = this.parseResponseBody(response);

        // get extended metadata if applicable
        if (this.definition.hasExtended) {
            const extended = await this.client.rest.getCollection(
                Object.keys(results).map((key) => uri + results[key][this.definition.idField])
            );
            for (const ext of extended) {
                const key = ext[this.definition.keyField];
                results[key] = Object.assign(results[key], ext);
            }
        }

        if (retrieveDir) {
            const savedMetadata = await this.saveResults(
                results,
                retrieveDir,
                overrideType,
                templateVariables
            );
            Util.logger.info(
                `Downloaded: ${overrideType || this.definition.type} (${
                    Object.keys(savedMetadata).length
                })`
            );
        }

        return { metadata: results, type: overrideType || this.definition.type };
    }

    /**
     * Builds map of metadata entries mapped to their keyfields
     * @param {Object} body json of response body
     * @returns {Promise<MetadataTypeMap>} keyField => metadata map
     */
    static parseResponseBody(body) {
        const bodyIteratorField = this.definition.bodyIteratorField;
        const keyField = this.definition.keyField;
        const metadataStructure = {};
        if (body !== null) {
            // in some cases data is just an array
            if (Array.isArray(bodyIteratorField)) {
                for (const item of body) {
                    const key = item[keyField];
                    metadataStructure[key] = item;
                }
            } else if (body[bodyIteratorField]) {
                for (const item of body[bodyIteratorField]) {
                    const key = item[keyField];
                    metadataStructure[key] = item;
                }
            }
        }
        return metadataStructure;
    }

    /**
     * Deletes a field in a metadata entry if the selected definition property equals false.
     * @example
     * Removes field (or nested fields childs) that are not updateable
     * deleteFieldByDefinition(metadataEntry, 'CustomerKey', 'isUpdateable');
     * @param {MetadataTypeItem} metadataEntry One entry of a metadataType
     * @param {string} fieldPath field path to be checked if it conforms to the definition (dot seperated if nested): 'fuu.bar'
     * @param {'isCreateable'|'isUpdateable'|'retrieving'|'templating'} definitionProperty delete field if definitionProperty equals false for specified field. Options: [isCreateable | isUpdateable]
     * @param {string} origin string of parent object, required when using arrays as these are parsed slightly differently.
     * @returns {void}
     */
    static deleteFieldByDefinition(metadataEntry, fieldPath, definitionProperty, origin) {
        // Get content of nested property
        let fieldContent;
        try {
            fieldContent = fieldPath.split('.').reduce((field, key) => field[key], metadataEntry);
        } catch (e) {
            // when we hit fields that have dots in their name (e.g. interarction, metaData['simulation.id']) then this will fail
            // decided to skip these cases for now entirely
            return;
        }
        let originHelper;

        // revert back placeholder to dots
        if (origin) {
            originHelper = origin + '.' + fieldPath;
        } else {
            originHelper = fieldPath;
        }

        if (
            this.definition.fields[originHelper] &&
            this.definition.fields[originHelper].skipValidation
        ) {
            // skip if current field should not be validated
            return;
        } else if (
            Array.isArray(fieldContent) &&
            this.definition.fields[originHelper] &&
            this.definition.fields[originHelper][definitionProperty] === true
        ) {
            for (const subObject of fieldContent) {
                // for simple arrays skip, only process object or array arrays further
                if (Array.isArray(subObject) || typeof subObject === 'object') {
                    for (const subField in subObject) {
                        this.deleteFieldByDefinition(
                            subObject,
                            subField,
                            definitionProperty,
                            originHelper + '[]'
                        );
                    }
                }
            }
        } else if (
            typeof fieldContent === 'object' &&
            !Array.isArray(fieldContent) &&
            (this.definition.fields[originHelper] == null ||
                this.definition.fields[originHelper][definitionProperty] === true)
        ) {
            // Recursive call of this method if there are nested fields
            for (const subField in fieldContent) {
                this.deleteFieldByDefinition(
                    metadataEntry,
                    originHelper + '.' + subField,
                    definitionProperty,
                    null
                );
            }
        } else if (!this.definition.fields[originHelper]) {
            // Display warining if there is no definition for the current field
            Util.logger.verbose(
                `MetadataType[${this.definition.type}].deleteFieldByDefinition[${definitionProperty}]:: Field ${originHelper} not in metadata info`
            );
        } else if (this.definition.fields[originHelper][definitionProperty] === false) {
            // Check if field/nested field should be deleted depending on the definitionProperty
            fieldPath.split('.').reduce((field, key, index) => {
                if (index === fieldPath.split('.').length - 1) {
                    delete field[key];
                } else {
                    return field[key];
                }
            }, metadataEntry);
        }
    }
    /**
     * Remove fields from metadata entry that are not createable
     * @param {MetadataTypeItem} metadataEntry metadata entry
     * @returns {void}
     */
    static removeNotCreateableFields(metadataEntry) {
        for (const field in metadataEntry) {
            this.deleteFieldByDefinition(metadataEntry, field, 'isCreateable', null);
        }
    }

    /**
     * Remove fields from metadata entry that are not updateable
     * @param {MetadataTypeItem} metadataEntry metadata entry
     * @returns {void}
     */
    static removeNotUpdateableFields(metadataEntry) {
        for (const field in metadataEntry) {
            this.deleteFieldByDefinition(metadataEntry, field, 'isUpdateable', null);
        }
    }

    /**
     * Remove fields from metadata entry that are not needed in the template
     * @param {MetadataTypeItem} metadataEntry metadata entry
     * @returns {void}
     */
    static keepTemplateFields(metadataEntry) {
        for (const field in metadataEntry) {
            this.deleteFieldByDefinition(metadataEntry, field, 'template', null);
        }
    }

    /**
     * Remove fields from metadata entry that are not needed in the stored metadata
     * @param {MetadataTypeItem} metadataEntry metadata entry
     * @returns {void}
     */
    static keepRetrieveFields(metadataEntry) {
        for (const field in metadataEntry) {
            this.deleteFieldByDefinition(metadataEntry, field, 'retrieving', null);
        }
    }

    /**
     * checks if the current metadata entry should be saved on retrieve or not
     * @static
     * @param {MetadataTypeItem} metadataEntry metadata entry
     * @param {boolean} [include=false] true: use definition.include / options.include; false=exclude: use definition.filter / options.exclude
     * @returns {boolean} true: skip saving == filtered; false: continue with saving
     * @memberof MetadataType
     */
    static isFiltered(metadataEntry, include) {
        if (include) {
            // check include-only filters (== discard rest)
            const includeByDefinition = this._filterOther(this.definition.include, metadataEntry);
            const includeByConfig = this._filterOther(
                this.properties.options.include[this.definition.type],
                metadataEntry
            );
            if (includeByDefinition === false || includeByConfig === false) {
                Util.logger.debug(
                    `Filtered ${this.definition.type} '${
                        metadataEntry[this.definition.nameField]
                    }' (${metadataEntry[this.definition.keyField]}): not matching include filter`
                );

                return true;
            }
        } else {
            // check exclude-only filters (== keep rest)
            const excludeByDefinition = this._filterOther(this.definition.filter, metadataEntry);
            const excludeByConfig = this._filterOther(
                this.properties.options.exclude[this.definition.type],
                metadataEntry
            );
            if (excludeByDefinition || excludeByConfig) {
                Util.logger.debug(
                    `Filtered ${this.definition.type} '${
                        metadataEntry[this.definition.nameField]
                    }' (${metadataEntry[this.definition.keyField]}): matching exclude filter`
                );
                return true;
            }
        }
        // this metadata type has no filters defined or no match was found
        return false;
    }
    /**
     * optionally filter by what folder something is in
     * @static
     * @param {Object} metadataEntry metadata entry
     * @param {boolean} [include=false] true: use definition.include / options.include; false=exclude: use definition.filter / options.exclude
     * @returns {boolean} true: filtered == do NOT save; false: not filtered == do save
     * @memberof MetadataType
     */
    static isFilteredFolder(metadataEntry, include) {
        if (metadataEntry.json && metadataEntry.json.r__folder_Path) {
            // r__folder_Path found in sub-object
            metadataEntry = metadataEntry.json;
        } else if (!metadataEntry.r__folder_Path) {
            // no r__folder_Path found at all
            return false;
        }
        // r__folder_Path found

        if (include) {
            const errorMsg = `Filtered ${this.definition.type} '${
                metadataEntry[this.definition.nameField]
            }' (${
                metadataEntry[this.definition.keyField]
            }): not matching include filter for folder`;
            // check include-only filters (== discard rest)
            const includeByDefinition = this._filterFolder(
                this.definition.include,
                metadataEntry.r__folder_Path
            );
            if (includeByDefinition === false) {
                Util.logger.debug(errorMsg + ' (Accenture SFMC DevTools default)');
                return true;
            }

            const includeByConfig = this._filterFolder(
                this.properties.options.include[this.definition.type],
                metadataEntry.r__folder_Path
            );
            if (includeByConfig === false) {
                Util.logger.debug(errorMsg + ' (project config)');
                return true;
            }
        } else {
            const errorMsg = `Filtered ${this.definition.type} '${
                metadataEntry[this.definition.nameField]
            }' (${metadataEntry[this.definition.keyField]}): matching exclude filter for folder`;
            // check exclude-only filters (== keep rest)
            const excludeByDefinition = this._filterFolder(
                this.definition.filter,
                metadataEntry.r__folder_Path
            );
            if (excludeByDefinition) {
                Util.logger.debug(errorMsg + ' (project config)');
                return true;
            }

            const excludeByConfig = this._filterFolder(
                this.properties.options.exclude[this.definition.type],
                metadataEntry.r__folder_Path
            );
            if (excludeByConfig) {
                Util.logger.debug(errorMsg + ' (Accenture SFMC DevTools default)');
                return true;
            }
        }
        // this metadata type has no filters defined or no match was found
        return false;
    }
    /**
     * internal helper
     * @private
     * @param {Object} myFilter include/exclude filter object
     * @param {string} r__folder_Path already determined folder path
     * @returns {?boolean} true: filter value found; false: filter value not found; null: no filter defined
     */
    static _filterFolder(myFilter, r__folder_Path) {
        if (!myFilter || !myFilter.r__folder_Path) {
            // no filter defined
            return null;
        }
        // consolidate input: could be String[] or String
        const filteredValues = Array.isArray(myFilter.r__folder_Path)
            ? myFilter.r__folder_Path
            : [myFilter.r__folder_Path];

        for (const path of filteredValues) {
            if (r__folder_Path.startsWith(path)) {
                // filter matched
                // this filters the given folder and anything below it.
                // to only filter subfolders, end with "/", to also filter the given folder, omit the "/"
                return true;
            }
        }

        // no filters matched
        return false;
    }
    /**
     * internal helper
     * @private
     * @param {Object} myFilter include/exclude filter object
     * @param {Object} metadataEntry metadata entry
     * @returns {?boolean} true: filter value found; false: filter value not found; null: no filter defined
     */
    static _filterOther(myFilter, metadataEntry) {
        // not possible to check r__folder_Path before parseMetadata was run; handled in `isFilteredFolder()`
        if (
            !myFilter ||
            !Object.keys(myFilter).filter((item) => item !== 'r__folder_Path').length
        ) {
            // no filter defined
            return null;
        }

        for (const key in myFilter) {
            // consolidate input: could be String[] or String
            const filteredValues = Array.isArray(myFilter[key]) ? myFilter[key] : [myFilter[key]];

            if (filteredValues.includes(metadataEntry[key])) {
                // filter matched
                return true;
            }
        }

        // no filters matched
        return false;
    }

    /**
     * Paginates a URL
     * @param {string} url url of the request
     * @param {number} last Number of the page of the last request
     * @returns {string} new url with pagination
     */
    static paginate(url, last) {
        if (this.definition.restPagination) {
            const baseUrl = url.split('?')[0];
            const queryParams = new URLSearchParams(url.split('?')[1]);
            // if no page add page
            if (!queryParams.has('$page')) {
                queryParams.append('$page', (1).toString());
            }
            // if there is a page and a last value, then add to it.
            else if (queryParams.has('$page') && last) {
                queryParams.set('$page', (Number(last) + 1).toString());
            }
            return baseUrl + '?' + decodeURIComponent(queryParams.toString());
        } else {
            return url;
        }
    }
    /**
     * Helper for writing Metadata to disk, used for Retrieve and deploy
     * @param {MetadataTypeMap} results metadata results from deploy
     * @param {string} retrieveDir directory where metadata should be stored after deploy/retrieve
     * @param {string} [overrideType] for use when there is a subtype (such as folder-queries)
     * @param {Util.TemplateMap} [templateVariables] variables to be replaced in the metadata
     * @returns {Promise<MetadataTypeMap>} Promise of saved metadata
     */
    static async saveResults(results, retrieveDir, overrideType, templateVariables) {
        const savedResults = {};
        const subtypeExtension = '.' + (overrideType || this.definition.type) + '-meta';
        let filterCounter = 0;
        for (const metadataEntry in results) {
            try {
                if (
                    this.isFiltered(results[metadataEntry], true) ||
                    this.isFiltered(results[metadataEntry], false)
                ) {
                    // if current metadata entry is filtered don't save it
                    filterCounter++;
                    continue;
                }

                // define directory into which the current metdata shall be saved
                const baseDir = [retrieveDir, ...(overrideType || this.definition.type).split('-')];

                results[metadataEntry] = await this.postRetrieveTasks(
                    results[metadataEntry],
                    retrieveDir,
                    templateVariables ? true : false
                );
                if (!results[metadataEntry] || results[metadataEntry] === null) {
                    // we encountered a situation in our postRetrieveTasks that made us want to filter this record
                    delete results[metadataEntry];
                    filterCounter++;
                    continue;
                }

                if (
                    this.isFilteredFolder(results[metadataEntry], true) ||
                    this.isFilteredFolder(results[metadataEntry], false)
                ) {
                    // if current metadata entry is filtered don't save it
                    filterCounter++;
                    continue;
                }

                // for complex types like asset, script, query we need to save the scripts that were extracted from the JSON
                if (results[metadataEntry].json && results[metadataEntry].codeArr) {
                    // replace market values with template variable placeholders (do not do it on .codeArr)
                    if (templateVariables) {
                        results[metadataEntry].json = Util.replaceByObject(
                            results[metadataEntry].json,
                            templateVariables
                        );
                        results[metadataEntry].subFolder = Util.replaceByObject(
                            results[metadataEntry].subFolder,
                            templateVariables
                        );
                    }

                    const postRetrieveData = results[metadataEntry];
                    if (postRetrieveData.subFolder) {
                        // very complex types have their own subfolder
                        baseDir.push(...postRetrieveData.subFolder);
                    }
                    // save extracted scripts
                    for (const script of postRetrieveData.codeArr) {
                        const dir = [...baseDir];
                        if (script.subFolder) {
                            // some files shall be saved in yet a deeper subfolder
                            dir.push(...script.subFolder);
                        }
                        File.writePrettyToFile(
                            dir,
                            script.fileName + subtypeExtension,
                            script.fileExt,
                            script.content,
                            templateVariables
                        );
                    }
                    // normalize results[metadataEntry]
                    results[metadataEntry] = postRetrieveData.json;
                } else {
                    // not a complex type, run the the entire JSON through templating
                    // replace market values with template variable placeholders
                    if (templateVariables) {
                        results[metadataEntry] = Util.replaceByObject(
                            results[metadataEntry],
                            templateVariables
                        );
                    }
                }

                // we dont store Id on local disk, but we need it for caching logic,
                // so its in retrieve but not in save. Here we put into the clone so that the original
                // object used for caching doesnt have the Id removed.
                const saveClone = JSON.parse(JSON.stringify(results[metadataEntry]));
                if (!this.definition.keepId) {
                    delete saveClone[this.definition.idField];
                }

                if (templateVariables) {
                    this.keepTemplateFields(saveClone);
                } else {
                    this.keepRetrieveFields(saveClone);
                }
                savedResults[metadataEntry] = saveClone;
                File.writeJSONToFile(
                    // manage subtypes
                    baseDir,
                    saveClone[this.definition.keyField] + subtypeExtension,
                    saveClone
                );
            } catch (ex) {
                console.error(ex.stack);
                Util.metadataLogger(
                    'error',
                    this.definition.type,
                    'saveResults',
                    ex,
                    metadataEntry
                );
            }
        }
        if (filterCounter) {
            if (this.definition.type !== 'asset') {
                // interferes with progress bar in assets and is printed 1-by-1 otherwise
                Util.logger.info(
                    `Filtered ${this.definition.type}: ${filterCounter} (downloaded but not saved to disk)`
                );
            }
        }
        return savedResults;
    }
    /**
     * helper for buildDefinition
     * handles extracted code if any are found for complex types (e.g script, asset, query)
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string} targetDir Directory where built definitions will be saved
     * @param {MetadataTypeItem} metadata main JSON file that was read from file system
     * @param {Util.TemplateMap} variables variables to be replaced in the metadata
     * @param {string} templateName name of the template to be built
     * @returns {Promise<void>} Promise
     */
    static async buildDefinitionForExtracts(
        templateDir,
        targetDir,
        metadata,
        variables,
        templateName
    ) {
        // generic version here does nothing. actual cases handled in type classes
        return null;
    }
    /**
     * check template directory for complex types that open subfolders for their subtypes
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string} templateName name of the metadata file
     * @returns {string} subtype name
     */
    static findSubType(templateDir, templateName) {
        return null;
    }
    /**
     * optional method used for some types to try a different folder structure
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string[]} typeDirArr current subdir for this type
     * @param {string} templateName name of the metadata template
     * @param {string} fileName name of the metadata template file w/o extension
     * @param {Error} ex error from first attempt
     * @returns {Object} metadata
     */
    static async readSecondaryFolder(templateDir, typeDirArr, templateName, fileName, ex) {
        // we just want to push the method into the catch here
        throw new Error(ex);
    }
    /**
     * Builds definition based on template
     * NOTE: Most metadata files should use this generic method, unless custom
     * parsing is required (for example scripts & queries)
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {String|String[]} targetDir (List of) Directory where built definitions will be saved
     * @param {string} templateName name of the metadata file
     * @param {Util.TemplateMap} variables variables to be replaced in the metadata
     * @returns {Promise<{metadata:MetadataTypeMap,type:string}>} Promise of item map
     */
    static async buildDefinition(templateDir, targetDir, templateName, variables) {
        // retrieve metadata template
        let metadataStr;
        let typeDirArr = [this.definition.type];
        const subType = this.findSubType(templateDir, templateName);
        if (subType) {
            typeDirArr.push(subType);
        }
        const suffix = subType ? `-${subType}-meta` : '-meta';
        const fileName = templateName + '.' + this.definition.type + suffix;
        try {
            // ! do not load via readJSONFile to ensure we get a string, not parsed JSON
            // templated files might contain illegal json before the conversion back to the file that shall be saved
            metadataStr = await File.readFile([templateDir, ...typeDirArr], fileName, 'json');
        } catch (ex) {
            try {
                metadataStr = await this.readSecondaryFolder(
                    templateDir,
                    typeDirArr,
                    templateName,
                    fileName,
                    ex
                );
            } catch (ex) {
                throw new Error(
                    `${this.definition.type}:: Could not find ./${File.normalizePath([
                        templateDir,
                        ...typeDirArr,
                        fileName + '.json',
                    ])}.`
                );
            }
            // return;
        }

        let metadata;
        try {
            // update all initial variables & create metadata object
            metadata = JSON.parse(Mustache.render(metadataStr, variables));
            typeDirArr = typeDirArr.map((el) => Mustache.render(el, variables));
        } catch (ex) {
            throw new Error(
                `${this.definition.type}:: Error applying template variables on ${
                    templateName + '.' + this.definition.type
                }${suffix}.json. Please check if your replacement values will result in valid json.`
            );
        }

        // handle extracted code
        // run after metadata was templated and converted into JS-object
        // templating to extracted content is applied inside of buildDefinitionForExtracts()
        await this.buildDefinitionForExtracts(
            templateDir,
            targetDir,
            metadata,
            variables,
            templateName
        );

        try {
            // write to file
            let targetDirArr;
            if (!Array.isArray(targetDir)) {
                targetDirArr = [targetDir];
            } else {
                targetDirArr = targetDir;
            }
            for (const targetDir of targetDirArr) {
                File.writeJSONToFile(
                    [targetDir, ...typeDirArr],
                    metadata[this.definition.keyField] + '.' + this.definition.type + suffix,
                    metadata
                );
            }
            Util.logger.info(
                'MetadataType[' +
                    this.definition.type +
                    '].buildDefinition:: Complete - ' +
                    metadata[this.definition.keyField]
            );

            return { metadata: metadata, type: this.definition.type };
        } catch (ex) {
            throw new Error(`${this.definition.type}:: ${ex.message}`);
        }
    }
    /**
     *
     * @param {Object} response response payload from REST API
     * @returns {void}
     */
    static checkForErrors(response) {
        if (response && response.res.statusCode >= 400 && response.res.statusCode < 600) {
            const errors = [];
            if (response.body.errors) {
                for (const errMsg of response.body.errors) {
                    errors.push(errMsg.message.split('<br />').join(''));
                }
            } else if (response.body.validationErrors) {
                for (const errMsg of response.body.validationErrors) {
                    errors.push(errMsg.message.split('<br />').join(''));
                }
            } else if (response.body.message) {
                errors.push(response.body.message);
            } else {
                errors.push(`Undefined Errors: ${JSON.stringify(response.body)}`);
            }
            throw new Error(
                `Errors on upserting metadata at ${response.res.request.path}: ${errors.join(
                    '<br />'
                )}`
            );
        }
    }

    /**
     * Gets metadata cache with limited fields and does not store value to disk
     * @param {Util.BuObject} [buObject] properties for auth
     * @param {MetadataTypeMap} [metadata] a list of type definitions
     * @param {boolean} [isDeploy] used to skip non-supported message during deploy
     * @returns {void}
     */
    static document(buObject, metadata, isDeploy) {
        if (!isDeploy) {
            Util.logger.error(`Documenting type ${this.definition.type} is not supported.`);
        }
    }

    /**
     * Delete a data extension from the specified business unit
     * @param {Util.BuObject} buObject references credentials
     * @param {string} customerKey Identifier of data extension
     * @returns {void} -
     */
    static deleteByKey(buObject, customerKey) {
        Util.logger.error(`Deleting type ${this.definition.type} is not supported.`);
    }
    /**
     * Returns metadata of a business unit that is saved locally
     * @param {string} readDir root directory of metadata.
     * @param {boolean} [listBadKeys=false] do not print errors, used for badKeys()
     * @param {Object} [buMetadata] Metadata of BU in local directory
     * @returns {Object} Metadata of BU in local directory
     */
    static readBUMetadataForType(readDir, listBadKeys, buMetadata) {
        buMetadata = buMetadata || {};
        readDir = File.normalizePath([readDir, this.definition.type]);
        try {
            if (File.existsSync(readDir)) {
                // check if folder name is a valid metadataType, then check if the user limited to a certain type in the command params
                buMetadata[this.definition.type] = this.getJsonFromFS(readDir, listBadKeys);
                return buMetadata;
            } else {
                throw new Error(`Directory '${readDir}' does not exist.`);
            }
        } catch (ex) {
            throw new Error(ex.message);
        }
    }
}

MetadataType.definition = {
    bodyIteratorField: '',
    dependencies: [],
    fields: null,
    hasExtended: null,
    idField: '',
    keyField: '',
    nameField: '',
    type: '',
};
/**
 * @type {Util.ET_Client}
 */
MetadataType.client = undefined;
/**
 * @type {MultiMetadataTypeMap}
 */
MetadataType.cache = {};
MetadataType.properties = null;

module.exports = MetadataType;
