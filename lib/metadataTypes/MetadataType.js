'use strict';

/* eslint no-unused-vars:off */
/*
 * README no-unused-vars is reduced to WARNING here as this file is a template
 * for all metadata types and methods often define params that are not used
 * in the generic version of the method
 */

const TYPE = require('../../types/mcdev.d');
const Util = require('../util/util');
const File = require('../util/file');
const cache = require('../util/cache');

const pLimit = require('p-limit');
const Mustache = require('mustache');

/**
 * MetadataType class that gets extended by their specific metadata type class.
 * Provides default functionality that can be overwritten by child metadata type classes
 *
 */
class MetadataType {
    /**
     * Returns file contents mapped to their filename without '.json' ending
     *
     * @param {string} dir directory that contains '.json' files to be read
     * @param {boolean} [listBadKeys=false] do not print errors, used for badKeys()
     * @returns {object} fileName => fileContent map
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
                        // ! convert numbers to string to allow numeric keys to be checked properly
                        const key = Number.isInteger(fileContent[this.definition.keyField])
                            ? fileContent[this.definition.keyField].toString()
                            : fileContent[this.definition.keyField];
                        if (key === fileNameWithoutEnding || listBadKeys) {
                            fileName2FileContent[fileNameWithoutEnding] = fileContent;
                        } else {
                            Util.metadataLogger(
                                'error',
                                this.definition.type,
                                'getJsonFromFS',
                                'Name of the Metadata and the External Identifier must match',
                                JSON.stringify({
                                    Filename: fileNameWithoutEnding,
                                    ExternalIdentifier: key,
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
     *
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @returns {string[]} Fieldnames
     */
    static getFieldNamesToRetrieve(additionalFields) {
        const fieldNames = [];
        for (const fieldName in this.definition.fields) {
            if (
                additionalFields?.includes(fieldName) ||
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
     *
     * @param {TYPE.MetadataTypeMap} metadata metadata mapped by their keyField
     * @param {string} deployDir directory where deploy metadata are saved
     * @param {string} retrieveDir directory where metadata after deploy should be saved
     * @param {TYPE.BuObject} buObject properties for auth
     * @returns {Promise.<object>} Promise of keyField => metadata map
     */
    static async deploy(metadata, deployDir, retrieveDir, buObject) {
        const upsertResults = await this.upsert(metadata, deployDir, buObject);
        await this.postDeployTasks(upsertResults, metadata);
        const savedMetadata = await this.saveResults(upsertResults, retrieveDir, null);
        if (
            this.properties.metaDataTypes.documentOnRetrieve.includes(this.definition.type) &&
            !this.definition.documentInOneFile
        ) {
            // * do not await here as this might take a while and has no impact on the deploy
            // * this should only be run if documentation is on a per metadata record level. Types that document an overview into a single file will need a full retrieve to work instead
            this.document(buObject, savedMetadata, true);
        }
        return upsertResults;
    }

    /**
     * Gets executed after deployment of metadata type
     *
     * @param {TYPE.MetadataTypeMap} metadata metadata mapped by their keyField
     * @param {TYPE.MetadataTypeMap} originalMetadata metadata to be updated (contains additioanl fields)
     * @returns {void}
     */
    static postDeployTasks(metadata, originalMetadata) {}

    /**
     * Gets executed after retreive of metadata type
     *
     * @param {TYPE.MetadataTypeItem} metadata a single item
     * @param {string} targetDir folder where retrieves should be saved
     * @param {boolean} [isTemplating] signals that we are retrieving templates
     * @returns {TYPE.MetadataTypeItem} cloned metadata
     */
    static postRetrieveTasks(metadata, targetDir, isTemplating) {
        return JSON.parse(JSON.stringify(metadata));
    }
    /**
     * Gets metadata from Marketing Cloud
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @param {TYPE.BuObject} buObject properties for auth
     * @param {string} [subType] optionally limit to a single subtype
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} metadata
     */
    static retrieve(retrieveDir, additionalFields, buObject, subType) {
        Util.metadataLogger('error', this.definition.type, 'retrieve', `Not Supported`);
        const metadata = {};
        return { metadata: null, type: this.definition.type };
    }
    /**
     * Gets metadata from Marketing Cloud
     *
     * @param {TYPE.BuObject} [buObject] properties for auth
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @param {string} [subType] optionally limit to a single subtype
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} metadata
     */
    static retrieveChangelog(buObject, additionalFields, subType) {
        return this.retrieveForCache(buObject, subType);
    }

    /**
     * Gets metadata cache with limited fields and does not store value to disk
     *
     * @param {TYPE.BuObject} buObject properties for auth
     * @param {string} [subType] optionally limit to a single subtype
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} metadata
     */
    static async retrieveForCache(buObject, subType) {
        return this.retrieve(null, null, buObject, subType);
    }
    /**
     * Gets metadata cache with limited fields and does not store value to disk
     *
     * @param {string} templateDir Directory where retrieved metadata directory will be saved
     * @param {string} name name of the metadata file
     * @param {TYPE.TemplateMap} templateVariables variables to be replaced in the metadata
     * @param {string} [subType] optionally limit to a single subtype
     * @returns {Promise.<TYPE.MetadataTypeItemObj>} metadata
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
     * Gets metadata cache with limited fields and does not store value to disk
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {string} templateDir (List of) Directory where built definitions will be saved
     * @param {string} key name of the metadata file
     * @param {TYPE.TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {Promise.<TYPE.MetadataTypeItemObj>} single metadata
     */
    static async buildTemplate(retrieveDir, templateDir, key, templateVariables) {
        // retrieve metadata template
        let metadataStr;
        const typeDirArr = [this.definition.type];
        const subType = this.findSubType(retrieveDir, key);
        if (subType) {
            typeDirArr.push(subType);
        }
        const suffix = subType ? `-${subType}-meta` : '-meta';
        const fileName = key + '.' + this.definition.type + suffix;
        try {
            // ! do not load via readJSONFile to ensure we get a string, not parsed JSON
            // templated files might contain illegal json before the conversion back to the file that shall be saved
            metadataStr = await File.readFile([retrieveDir, ...typeDirArr], fileName, 'json');
        } catch (ex) {
            try {
                metadataStr = await this.readSecondaryFolder(
                    retrieveDir,
                    typeDirArr,
                    key,
                    fileName,
                    ex
                );
            } catch (ex) {
                throw new Error(
                    `${this.definition.type}:: Could not find ./${File.normalizePath([
                        retrieveDir,
                        ...typeDirArr,
                        fileName + '.json',
                    ])}.`
                );
            }
            // return;
        }
        const metadata = JSON.parse(Util.replaceByObject(metadataStr, templateVariables));
        this.keepTemplateFields(metadata);

        // handle extracted code
        // templating to extracted content is applied inside of buildTemplateForExtracts()
        await this.buildTemplateForExtracts(
            retrieveDir,
            templateDir,
            metadata,
            templateVariables,
            key
        );

        try {
            // write to file
            File.writeJSONToFile(
                [templateDir, ...typeDirArr],
                key + '.' + this.definition.type + suffix,
                metadata
            );
            Util.logger.info(
                `- templated ${this.definition.type}: ${key} (${
                    metadata[this.definition.nameField]
                })`
            );

            return { metadata: metadata, type: this.definition.type };
        } catch (ex) {
            throw new Error(`${this.definition.type}:: ${ex.message}`);
        }
    }

    /**
     * Gets executed before deploying metadata
     *
     * @param {TYPE.MetadataTypeItem} metadata a single metadata item
     * @param {string} deployDir folder where files for deployment are stored
     * @returns {Promise.<TYPE.MetadataTypeItem>} Promise of a single metadata item
     */
    static async preDeployTasks(metadata, deployDir) {
        return metadata;
    }

    /**
     * Abstract create method that needs to be implemented in child metadata type
     *
     * @param {TYPE.MetadataTypeItem} metadata single metadata entry
     * @param {string} deployDir directory where deploy metadata are saved
     * @returns {void}
     */
    static create(metadata, deployDir) {
        Util.metadataLogger('error', this.definition.type, 'create', 'create not supported');
        return;
    }

    /**
     * Abstract update method that needs to be implemented in child metadata type
     *
     * @param {TYPE.MetadataTypeItem} metadata single metadata entry
     * @param {TYPE.MetadataTypeItem} [metadataBefore] metadata mapped by their keyField
     * @returns {void}
     */
    static update(metadata, metadataBefore) {
        Util.metadataLogger('error', this.definition.type, 'update', 'update not supported');
        return;
    }

    /**
     * MetadataType upsert, after retrieving from target and comparing to check if create or update operation is needed.
     *
     * @param {TYPE.MetadataTypeMap} metadata metadata mapped by their keyField
     * @param {string} deployDir directory where deploy metadata are saved
     * @param {TYPE.BuObject} [buObject] properties for auth
     * @returns {Promise.<TYPE.MetadataTypeMap>} keyField => metadata map
     */
    static async upsert(metadata, deployDir, buObject) {
        const metadataToUpdate = [];
        const metadataToCreate = [];
        for (const metadataKey in metadata) {
            let hasError = false;
            try {
                // preDeployTasks parsing
                let deployableMetadata;
                try {
                    deployableMetadata = await this.preDeployTasks(
                        metadata[metadataKey],
                        deployDir
                    );
                } catch (ex) {
                    // do this in case something went wrong during pre-deploy steps to ensure the total counter is correct
                    hasError = true;
                    deployableMetadata = metadata[metadataKey];
                    Util.logger.error(
                        `- skipping ${this.definition.type}: ${
                            deployableMetadata[this.definition.nameField]
                        } (${ex.message})`
                    );
                }
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
                        if (hasError) {
                            metadataToUpdate.push(null);
                        } else {
                            metadataToUpdate.push({
                                before: {},
                                after: metadata[metadataKey],
                            });
                        }
                    } else if (cache.getByKey(this.definition.type, normalizedKey)) {
                        // normal way of processing update files
                        metadata[metadataKey][this.definition.idField] = cache.getByKey(
                            this.definition.type,
                            normalizedKey
                        )[this.definition.idField];
                        if (hasError) {
                            // do this in case something went wrong during pre-deploy steps to ensure the total counter is correct
                            metadataToUpdate.push(null);
                        } else {
                            metadataToUpdate.push({
                                before: cache.getByKey(this.definition.type, normalizedKey),
                                after: metadata[metadataKey],
                            });
                        }
                    } else {
                        if (hasError) {
                            // do this in case something went wrong during pre-deploy steps to ensure the total counter is correct
                            metadataToCreate.push(null);
                        } else {
                            metadataToCreate.push(metadata[metadataKey]);
                        }
                    }
                }
            } catch (ex) {
                Util.metadataLogger('error', this.definition.type, 'upsert', ex, metadataKey);
            }
        }
        const createLimit = pLimit(10);
        const createResults = (
            await Promise.all(
                metadataToCreate
                    .filter((r) => r !== undefined && r !== null)
                    .map((metadataEntry) =>
                        createLimit(() => this.create(metadataEntry, deployDir))
                    )
            )
        ).filter((r) => r !== undefined && r !== null);
        const updateLimit = pLimit(10);
        const updateResults = (
            await Promise.all(
                metadataToUpdate
                    .filter((r) => r !== undefined && r !== null)
                    .map((metadataEntry) =>
                        updateLimit(() => this.update(metadataEntry.after, metadataEntry.before))
                    )
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
                // TODO remove Object.keys check after create/update SOAP methods stop returning empty objects instead of null
                .filter((r) => r !== undefined && r !== null && Object.keys(r).length !== 0)
                .map((r) => r.Results)
                .flat()
                .map((r) => r.Object);
            return this.parseResponseBody({ Results: metadataResults });
        } else {
            // put in Retrieve Format for parsing
            // todo add handling when response does not contain items.
            // @ts-ignore
            const metadataResults = createResults.concat(updateResults).filter((r) => r);
            return this.parseResponseBody({ items: metadataResults });
        }
    }

    /**
     * Creates a single metadata entry via REST
     *
     * @param {TYPE.MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {string} uri rest endpoint for POST
     * @returns {Promise} Promise
     */
    static async createREST(metadataEntry, uri) {
        this.removeNotCreateableFields(metadataEntry);
        try {
            const response = await this.client.rest.post(uri, metadataEntry);
            Util.logger.info(
                `- created ${this.definition.type}: ${metadataEntry[this.definition.keyField]}`
            );
            return response;
        } catch (ex) {
            const parsedErrors = this.checkForErrors(ex);
            Util.logger.error(
                `- error creating ${this.definition.type}: ${
                    metadataEntry[this.definition.keyField]
                } (${parsedErrors})`
            );
            return null;
        }
    }

    /**
     * Creates a single metadata entry via fuel-soap (generic lib not wrapper)
     *
     * @param {TYPE.MetadataTypeItem} metadataEntry single metadata entry
     * @param {string} [overrideType] can be used if the API type differs from the otherwise used type identifier
     * @param {boolean} [handleOutside] if the API reponse is irregular this allows you to handle it outside of this generic method
     * @returns {Promise} Promise
     */
    static async createSOAP(metadataEntry, overrideType, handleOutside) {
        try {
            this.removeNotCreateableFields(metadataEntry);
            const response = await this.client.soap.create(
                overrideType ||
                    this.definition.type.charAt(0).toUpperCase() + this.definition.type.slice(1),
                metadataEntry,
                null
            );

            if (!handleOutside) {
                Util.logger.info(
                    `- created ${this.definition.type}: ${metadataEntry[this.definition.keyField]}`
                );
            }
            return response;
        } catch (ex) {
            if (!handleOutside) {
                let errorMsg;
                if (ex.results && ex.results.length) {
                    errorMsg = `${ex.results[0].StatusMessage} (Code ${ex.results[0].ErrorCode})`;
                } else {
                    errorMsg = ex.message;
                }
                Util.logger.error(
                    `- error creating ${this.definition.type} '${
                        metadataEntry[this.definition.keyField]
                    }': ${errorMsg}`
                );
            } else {
                throw ex;
            }

            return {};
        }
    }

    /**
     * Updates a single metadata entry via REST
     *
     * @param {TYPE.MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {string} uri rest endpoint for PATCH
     * @returns {Promise} Promise
     */
    static async updateREST(metadataEntry, uri) {
        this.removeNotUpdateableFields(metadataEntry);
        try {
            const response = await this.client.rest.patch(uri, metadataEntry);
            this.checkForErrors(response);
            // some times, e.g. automation dont return a key in their update response and hence we need to fall back to name
            Util.logger.info(
                `- updated ${this.definition.type}: ${
                    metadataEntry[this.definition.keyField] ||
                    metadataEntry[this.definition.nameField]
                }`
            );
            return response;
        } catch (ex) {
            const parsedErrors = this.checkForErrors(ex);
            Util.logger.error(
                `- error updating ${this.definition.type}: ${
                    metadataEntry[this.definition.keyField]
                } (${parsedErrors})`
            );
            return null;
        }
    }

    /**
     * Updates a single metadata entry via fuel-soap (generic lib not wrapper)
     *
     * @param {TYPE.MetadataTypeItem} metadataEntry single metadata entry
     * @param {string} [overrideType] can be used if the API type differs from the otherwise used type identifier
     * @param {boolean} [handleOutside] if the API reponse is irregular this allows you to handle it outside of this generic method
     * @returns {Promise} Promise
     */
    static async updateSOAP(metadataEntry, overrideType, handleOutside) {
        try {
            this.removeNotUpdateableFields(metadataEntry);
            const response = await this.client.soap.update(
                overrideType ||
                    this.definition.type.charAt(0).toUpperCase() + this.definition.type.slice(1),
                metadataEntry,
                null
            );
            if (!handleOutside) {
                Util.logger.info(
                    `- updated ${this.definition.type}: ${metadataEntry[this.definition.keyField]}`
                );
            }
            return response;
        } catch (ex) {
            if (!handleOutside) {
                let errorMsg;
                if (ex?.results.length) {
                    errorMsg = `${ex.results[0].StatusMessage} (Code ${ex.results[0].ErrorCode})`;
                } else {
                    errorMsg = ex.message;
                }
                Util.logger.error(
                    `- error updating ${this.definition.type} '${
                        metadataEntry[this.definition.keyField]
                    }': ${errorMsg}`
                );
            } else {
                throw ex;
            }

            return {};
        }
    }
    /**
     * Retrieves SOAP via generic fuel-soap wrapper based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {TYPE.BuObject} buObject properties for auth
     * @param {object} [requestParams] required for the specific request (filter for example)
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of item map
     */
    static async retrieveSOAP(retrieveDir, buObject, requestParams, additionalFields) {
        requestParams = requestParams || {};
        const fields = this.getFieldNamesToRetrieve(additionalFields);
        const response = await this.client.soap.retrieveBulk(
            this.definition.type,
            fields,
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
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {string} uri rest endpoint for GET
     * @param {string} [overrideType] force a metadata type (mainly used for Folders)
     * @param {TYPE.TemplateMap} [templateVariables] variables to be replaced in the metadata
     * @returns {Promise.<{metadata: (TYPE.MetadataTypeMap | TYPE.MetadataTypeItem), type: string}>} Promise of item map (single item for templated result)
     */
    static async retrieveREST(retrieveDir, uri, overrideType, templateVariables) {
        const response = this.definition.restPagination
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

        return {
            metadata: templateVariables ? Object.values(results)[0] : results,
            type: overrideType || this.definition.type,
        };
    }

    /**
     * Builds map of metadata entries mapped to their keyfields
     *
     * @param {object} body json of response body
     * @returns {Promise.<TYPE.MetadataTypeMap>} keyField => metadata map
     */
    static parseResponseBody(body) {
        const bodyIteratorField = this.definition.bodyIteratorField;
        const keyField = this.definition.keyField;
        const metadataStructure = {};

        if (body !== null) {
            // in some cases data is just an array
            if (Array.isArray(body)) {
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
     *
     * @example
     * Removes field (or nested fields childs) that are not updateable
     * deleteFieldByDefinition(metadataEntry, 'CustomerKey', 'isUpdateable');
     * @param {TYPE.MetadataTypeItem} metadataEntry One entry of a metadataType
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

        if (this.definition.fields[originHelper]?.skipValidation) {
            // skip if current field should not be validated
            return;
        } else if (
            Array.isArray(fieldContent) &&
            this.definition.fields[originHelper]?.[definitionProperty] === true
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
     *
     * @param {TYPE.MetadataTypeItem} metadataEntry metadata entry
     * @returns {void}
     */
    static removeNotCreateableFields(metadataEntry) {
        for (const field in metadataEntry) {
            this.deleteFieldByDefinition(metadataEntry, field, 'isCreateable', null);
        }
    }

    /**
     * Remove fields from metadata entry that are not updateable
     *
     * @param {TYPE.MetadataTypeItem} metadataEntry metadata entry
     * @returns {void}
     */
    static removeNotUpdateableFields(metadataEntry) {
        for (const field in metadataEntry) {
            this.deleteFieldByDefinition(metadataEntry, field, 'isUpdateable', null);
        }
    }

    /**
     * Remove fields from metadata entry that are not needed in the template
     *
     * @param {TYPE.MetadataTypeItem} metadataEntry metadata entry
     * @returns {void}
     */
    static keepTemplateFields(metadataEntry) {
        for (const field in metadataEntry) {
            this.deleteFieldByDefinition(metadataEntry, field, 'template', null);
        }
    }

    /**
     * Remove fields from metadata entry that are not needed in the stored metadata
     *
     * @param {TYPE.MetadataTypeItem} metadataEntry metadata entry
     * @returns {void}
     */
    static keepRetrieveFields(metadataEntry) {
        for (const field in metadataEntry) {
            this.deleteFieldByDefinition(metadataEntry, field, 'retrieving', null);
        }
    }

    /**
     * checks if the current metadata entry should be saved on retrieve or not
     *
     * @static
     * @param {TYPE.MetadataTypeItem} metadataEntry metadata entry
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
     *
     * @static
     * @param {object} metadataEntry metadata entry
     * @param {boolean} [include=false] true: use definition.include / options.include; false=exclude: use definition.filter / options.exclude
     * @returns {boolean} true: filtered == do NOT save; false: not filtered == do save
     * @memberof MetadataType
     */
    static isFilteredFolder(metadataEntry, include) {
        if (metadataEntry.json?.r__folder_Path) {
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
     *
     * @private
     * @param {object} myFilter include/exclude filter object
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
     *
     * @private
     * @param {object} myFilter include/exclude filter object
     * @param {object} metadataEntry metadata entry
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
     * Helper for writing Metadata to disk, used for Retrieve and deploy
     *
     * @param {TYPE.MetadataTypeMap} results metadata results from deploy
     * @param {string} retrieveDir directory where metadata should be stored after deploy/retrieve
     * @param {string} [overrideType] for use when there is a subtype (such as folder-queries)
     * @param {TYPE.TemplateMap} [templateVariables] variables to be replaced in the metadata
     * @returns {Promise.<TYPE.MetadataTypeMap>} Promise of saved metadata
     */
    static async saveResults(results, retrieveDir, overrideType, templateVariables) {
        const savedResults = {};
        const subtypeExtension = '.' + (overrideType || this.definition.type) + '-meta';
        let filterCounter = 0;
        for (const originalKey in results) {
            try {
                if (
                    this.isFiltered(results[originalKey], true) ||
                    this.isFiltered(results[originalKey], false)
                ) {
                    // if current metadata entry is filtered don't save it
                    filterCounter++;
                    continue;
                }

                // define directory into which the current metdata shall be saved
                const baseDir = [retrieveDir, ...(overrideType || this.definition.type).split('-')];

                results[originalKey] = await this.postRetrieveTasks(
                    results[originalKey],
                    retrieveDir,
                    templateVariables ? true : false
                );
                if (!results[originalKey] || results[originalKey] === null) {
                    // we encountered a situation in our postRetrieveTasks that made us want to filter this record
                    delete results[originalKey];
                    filterCounter++;
                    continue;
                }

                if (
                    this.isFilteredFolder(results[originalKey], true) ||
                    this.isFilteredFolder(results[originalKey], false)
                ) {
                    // if current metadata entry is filtered don't save it
                    filterCounter++;
                    continue;
                }

                // for complex types like asset, script, query we need to save the scripts that were extracted from the JSON
                if (results[originalKey].json && results[originalKey].codeArr) {
                    // replace market values with template variable placeholders (do not do it on .codeArr)
                    if (templateVariables) {
                        results[originalKey].json = Util.replaceByObject(
                            results[originalKey].json,
                            templateVariables
                        );
                        results[originalKey].subFolder = Util.replaceByObject(
                            results[originalKey].subFolder,
                            templateVariables
                        );
                    }

                    const postRetrieveData = results[originalKey];
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
                    results[originalKey] = postRetrieveData.json;
                } else {
                    // not a complex type, run the the entire JSON through templating
                    // replace market values with template variable placeholders
                    if (templateVariables) {
                        results[originalKey] = Util.replaceByObject(
                            results[originalKey],
                            templateVariables
                        );
                    }
                }

                // we dont store Id on local disk, but we need it for caching logic,
                // so its in retrieve but not in save. Here we put into the clone so that the original
                // object used for caching doesnt have the Id removed.
                const saveClone = JSON.parse(JSON.stringify(results[originalKey]));
                if (!this.definition.keepId) {
                    delete saveClone[this.definition.idField];
                }

                if (templateVariables) {
                    this.keepTemplateFields(saveClone);
                } else {
                    this.keepRetrieveFields(saveClone);
                }
                savedResults[originalKey] = saveClone;
                File.writeJSONToFile(
                    // manage subtypes
                    baseDir,
                    originalKey + subtypeExtension,
                    saveClone
                );
                if (templateVariables) {
                    Util.logger.info(
                        `- templated ${this.definition.type}: ${
                            saveClone[this.definition.nameField]
                        }`
                    );
                }
            } catch (ex) {
                Util.logger.errorStack(ex, `Saving ${this.definition.type} ${originalKey} failed`);
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
     * helper for buildDefinitionForExtracts
     * searches extracted file for template variable names and applies the market values
     *
     * @param {string} code code from extracted code
     * @param {TYPE.TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {string} code with markets applied
     */
    static applyTemplateValues(code, templateVariables) {
        // replace template variables with their values
        return Mustache.render(code, templateVariables);
    }
    /**
     * helper for buildTemplateForExtracts
     * searches extracted file for template variable values and applies the market variable names
     *
     * @param {string} code code from extracted code
     * @param {TYPE.TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {string} code with markets applied
     */
    static applyTemplateNames(code, templateVariables) {
        // replace template variables with their values
        return Util.replaceByObject(code, templateVariables);
    }
    /**
     * helper for buildDefinition
     * handles extracted code if any are found for complex types (e.g script, asset, query)
     *
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string} targetDir Directory where built definitions will be saved
     * @param {TYPE.MetadataTypeItem} metadata main JSON file that was read from file system
     * @param {TYPE.TemplateMap} variables variables to be replaced in the metadata
     * @param {string} templateName name of the template to be built
     * @returns {Promise.<void>} Promise
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
     * helper for buildTemplate
     * handles extracted code if any are found for complex types
     *
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string|string[]} targetDir (List of) Directory where built definitions will be saved
     * @param {TYPE.MetadataTypeItem} metadata main JSON file that was read from file system
     * @param {TYPE.TemplateMap} templateVariables variables to be replaced in the metadata
     * @param {string} templateName name of the template to be built
     * @returns {Promise.<void>} void
     */
    static buildTemplateForExtracts(
        templateDir,
        targetDir,
        metadata,
        templateVariables,
        templateName
    ) {
        // generic version here does nothing. actual cases handled in type classes
        return null;
    }
    /**
     * check template directory for complex types that open subfolders for their subtypes
     *
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string} templateName name of the metadata file
     * @returns {string} subtype name
     */
    static findSubType(templateDir, templateName) {
        return null;
    }
    /**
     * optional method used for some types to try a different folder structure
     *
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string[]} typeDirArr current subdir for this type
     * @param {string} templateName name of the metadata template
     * @param {string} fileName name of the metadata template file w/o extension
     * @param {Error} ex error from first attempt
     * @returns {object} metadata
     */
    static async readSecondaryFolder(templateDir, typeDirArr, templateName, fileName, ex) {
        // we just want to push the method into the catch here
        throw new Error(ex);
    }
    /**
     * Builds definition based on template
     * NOTE: Most metadata files should use this generic method, unless custom
     * parsing is required (for example scripts & queries)
     *
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string | string[]} targetDir (List of) Directory where built definitions will be saved
     * @param {string} templateName name of the metadata file
     * @param {TYPE.TemplateMap} variables variables to be replaced in the metadata
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of item map
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
                `- prepared deployment definition of ${this.definition.type}: ${
                    metadata[this.definition.keyField]
                }`
            );

            return { metadata: metadata, type: this.definition.type };
        } catch (ex) {
            throw new Error(`${this.definition.type}:: ${ex.message}`);
        }
    }
    /**
     *  Standardizes a check for multiple messages
     *
     * @param {object} ex response payload from REST API
     * @returns {string} formatted Error Message
     */
    static checkForErrors(ex) {
        if (ex?.response?.status >= 400 && ex?.response?.status < 600) {
            const errors = [];
            if (ex.response.data.errors) {
                for (const errMsg of ex.response.data.errors) {
                    errors.push(errMsg.message.split('<br />').join(''));
                }
            } else if (ex.response.data.validationErrors) {
                for (const errMsg of ex.response.data.validationErrors) {
                    errors.push(errMsg.message.split('<br />').join(''));
                }
            } else if (ex.response.data.message) {
                errors.push(ex.response.data.message);
            } else {
                errors.push(`Undefined Errors: ${JSON.stringify(ex.response.data)}`);
            }
            Util.logger.debug(JSON.stringify(ex.config));
            Util.logger.debug(JSON.stringify(ex.response.data));
            return `Errors on upserting metadata at ${ex.request.path}: ${errors.join('<br />')}`;
        }
    }

    /**
     * Gets metadata cache with limited fields and does not store value to disk
     *
     * @param {TYPE.BuObject} [buObject] properties for auth
     * @param {TYPE.MetadataTypeMap} [metadata] a list of type definitions
     * @param {boolean} [isDeploy] used to skip non-supported message during deploy
     * @returns {void}
     */
    static document(buObject, metadata, isDeploy) {
        if (!isDeploy) {
            Util.logger.error(`Documenting type ${this.definition.type} is not supported.`);
        }
    }

    /**
     * Delete a metadata item from the specified business unit
     *
     * @param {TYPE.BuObject} buObject references credentials
     * @param {string} customerKey Identifier of data extension
     * @returns {boolean} deletion success status
     */
    static deleteByKey(buObject, customerKey) {
        Util.logger.error(`Deletion is not yet supported for ${this.definition.typeName}!`);
        return false;
    }
    /**
     * clean up after deleting a metadata item
     *
     * @param {TYPE.BuObject} buObject references credentials
     * @param {string} customerKey Identifier of metadata item
     * @returns {void} -
     */
    static async postDeleteTasks(buObject, customerKey) {
        // delete local copy: retrieve/cred/bu/type/...json
        const jsonFile = File.normalizePath([
            this.properties.directories.retrieve,
            buObject.credential,
            buObject.businessUnit,
            this.definition.type,
            `${customerKey}.${this.definition.type}-meta.json`,
        ]);
        if (File.existsSync(jsonFile)) {
            File.unlinkSync(jsonFile);
        }
    }

    /**
     * Delete a data extension from the specified business unit
     *
     * @param {TYPE.BuObject} buObject references credentials
     * @param {string} customerKey Identifier of metadata
     * @param {boolean} [handleOutside] if the API reponse is irregular this allows you to handle it outside of this generic method
     * @returns {boolean} deletion success flag
     */
    static async deleteByKeySOAP(buObject, customerKey, handleOutside) {
        const keyObj = {};
        keyObj[this.definition.keyField] = customerKey;
        try {
            this.client.soap.delete(
                this.definition.type.charAt(0).toUpperCase() + this.definition.type.slice(1),
                keyObj,
                null
            );
            if (!handleOutside) {
                Util.logger.info(`- deleted ${this.definition.type}: ${customerKey}`);
            }
            this.postDeleteTasks(buObject, customerKey);

            return true;
        } catch (ex) {
            if (!handleOutside) {
                let errorMsg;
                if (ex?.results?.length) {
                    errorMsg = `${ex.results[0].StatusMessage} (Code ${ex.results[0].ErrorCode})`;
                } else {
                    errorMsg = ex.message;
                }
                Util.logger.error(
                    `- error deleting ${this.definition.type} '${customerKey}': ${errorMsg}`
                );
            } else {
                throw ex;
            }

            return false;
        }
    }
    /**
     * Returns metadata of a business unit that is saved locally
     *
     * @param {string} readDir root directory of metadata.
     * @param {boolean} [listBadKeys=false] do not print errors, used for badKeys()
     * @param {object} [buMetadata] Metadata of BU in local directory
     * @returns {object} Metadata of BU in local directory
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
 * @type {TYPE.SDK}
 */
MetadataType.client = undefined;
/**
 * @type {TYPE.MultiMetadataTypeMap}
 */
MetadataType.properties = null;
/**
 * @type {string}
 */
MetadataType.subType = null;
/**
 * @type {object}
 */
MetadataType.buObject = null;

module.exports = MetadataType;
