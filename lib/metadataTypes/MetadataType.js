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

const deepEqual = require('deep-equal');
const pLimit = require('p-limit');
const Mustache = require('mustache');
/**
 * ensure that Mustache does not escape any characters
 *
 * @param {string} text -
 * @returns {string} text
 */
Mustache.escape = function (text) {
    return text;
};

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
     * @returns {TYPE.MetadataTypeMap} fileName => fileContent map
     */
    static getJsonFromFS(dir, listBadKeys) {
        const fileName2FileContent = {};
        try {
            const files = File.readdirSync(dir);
            for (const fileName of files) {
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
            }
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
     * @param {boolean} [isCaching] if true, then check if field should be skipped for caching
     * @returns {string[]} Fieldnames
     */
    static getFieldNamesToRetrieve(additionalFields, isCaching) {
        const fieldNames = [];
        for (const fieldName in this.definition.fields) {
            if (
                additionalFields?.includes(fieldName) ||
                (this.definition.fields[fieldName].retrieving &&
                    !(isCaching && this.definition.fields[fieldName].skipCache))
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
     * @param {boolean} [isRefresh] optional flag to indicate that triggeredSend should be refreshed after deployment of assets
     * @returns {Promise.<TYPE.MetadataTypeMap>} Promise of keyField => metadata map
     */
    static async deploy(metadata, deployDir, retrieveDir, isRefresh) {
        const upsertResults = await this.upsert(metadata, deployDir, isRefresh);
        const savedMetadata = await this.saveResults(upsertResults, retrieveDir, null);
        if (
            this.properties.metaDataTypes.documentOnRetrieve.includes(this.definition.type) &&
            !this.definition.documentInOneFile
        ) {
            // * do not await here as this might take a while and has no impact on the deploy
            // * this should only be run if documentation is on a per metadata record level. Types that document an overview into a single file will need a full retrieve to work instead
            this.document(savedMetadata, true);
        }
        return upsertResults;
    }

    /**
     * Gets executed after deployment of metadata type
     *
     * @param {TYPE.MetadataTypeMap} upsertResults metadata mapped by their keyField as returned by update/create
     * @param {TYPE.MetadataTypeMap} originalMetadata metadata to be updated (contains additioanl fields)
     * @param {{created: number, updated: number}} createdUpdated counter representing successful creates/updates
     * @param {boolean} [isRefresh] optional flag to indicate that triggeredSend should be refreshed after deployment of assets
     * @returns {void}
     */
    static postDeployTasks(upsertResults, originalMetadata, createdUpdated, isRefresh) {}

    /**
     * helper for {@link createREST}
     *
     * @param {TYPE.MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {object} apiResponse varies depending on the API call
     * @returns {void}
     */
    static postCreateTasks(metadataEntry, apiResponse) {}

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
     * generic script that retrieves the folder path from cache and updates the given metadata with it after retrieve
     *
     * @param {TYPE.MetadataTypeItem} metadata a single item
     */
    static setFolderPath(metadata) {
        if (!this.definition.folderIdField) {
            return;
        }
        try {
            metadata.r__folder_Path = cache.searchForField(
                'folder',
                metadata[this.definition.folderIdField],
                'ID',
                'Path'
            );
            delete metadata[this.definition.folderIdField];
        } catch (ex) {
            Util.logger.warn(
                ` - ${this.definition.type} '${metadata[this.definition.nameField]}' (${
                    metadata[this.definition.keyField]
                }): Could not find folder (${ex.message})`
            );
        }
    }
    /**
     * generic script that retrieves the folder ID from cache and updates the given metadata with it before deploy
     *
     * @param {TYPE.MetadataTypeItem} metadata a single item
     */
    static setFolderId(metadata) {
        if (!this.definition.folderIdField) {
            return;
        }
        metadata[this.definition.folderIdField] = cache.searchForField(
            'folder',
            metadata.r__folder_Path,
            'Path',
            'ID'
        );
        delete metadata.r__folder_Path;
    }

    /**
     * Gets metadata from Marketing Cloud
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @param {string[]} [subTypeArr] optionally limit to a single subtype
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} metadata
     */
    static retrieve(retrieveDir, additionalFields, subTypeArr, key) {
        Util.metadataLogger('error', this.definition.type, 'retrieve', `Not Supported`);
        const metadata = {};
        return { metadata: null, type: this.definition.type };
    }
    /**
     * Gets metadata from Marketing Cloud
     *
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @param {string[]} [subTypeArr] optionally limit to a single subtype
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} metadata
     */
    static retrieveChangelog(additionalFields, subTypeArr) {
        return this.retrieveForCache(additionalFields, subTypeArr);
    }

    /**
     * Gets metadata cache with limited fields and does not store value to disk
     *
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @param {string[]} [subTypeArr] optionally limit to a single subtype
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} metadata
     */
    static async retrieveForCache(additionalFields, subTypeArr) {
        return this.retrieve(null, additionalFields, subTypeArr);
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
        const subType = await this.findSubType(retrieveDir, key);
        if (subType) {
            typeDirArr.push(subType);
        }
        const suffix = subType ? `-${subType}-meta` : '-meta';
        const fileName = key + '.' + this.definition.type + suffix;
        try {
            // ! do not load via readJSONFile to ensure we get a string, not parsed JSON
            // templated files might contain illegal json before the conversion back to the file that shall be saved
            metadataStr = await File.readFilteredFilename(
                [retrieveDir, ...typeDirArr],
                fileName,
                'json'
            );
        } catch (ex) {
            try {
                metadataStr = await this.readSecondaryFolder(
                    retrieveDir,
                    typeDirArr,
                    key,
                    fileName,
                    ex
                );
            } catch {
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
        if (this.definition.stringifyFieldsBeforeTemplate) {
            // numeric fields are returned as numbers by the SDK/API. If we try to replace them in buildTemplate it would break the JSON format - but not if we stringify them first because then the {{{var}}} is in quotes
            metadataStr = JSON.parse(metadataStr);
            for (const field of this.definition.stringifyFieldsBeforeTemplate) {
                if (metadataStr[field]) {
                    if (Array.isArray(metadataStr[field])) {
                        for (let i = 0; i < metadataStr[field].length; i++) {
                            metadataStr[field][i] = metadataStr[field][i].toString();
                        }
                    } else if ('object' === typeof metadataStr[field]) {
                        for (const subField in metadataStr[field]) {
                            metadataStr[field][subField] = metadataStr[field][subField].toString();
                        }
                    } else {
                        metadataStr[field] = metadataStr[field].toString();
                    }
                }
            }
            metadataStr = JSON.stringify(metadataStr);
        }
        const metadata = JSON.parse(Util.replaceByObject(metadataStr, templateVariables));
        this.keepTemplateFields(metadata);

        // handle extracted code
        // templating to extracted content is applied inside of buildTemplateForNested()
        await this.buildTemplateForNested(
            retrieveDir,
            templateDir,
            metadata,
            templateVariables,
            key
        );

        try {
            // write to file
            await File.writeJSONToFile([templateDir, ...typeDirArr], fileName, metadata);
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
        Util.logger.error(
            ` ☇ skipping ${this.definition.type} ${metadata[this.definition.keyField]} / ${
                metadata[this.definition.nameField]
            }: create is not supported yet for ${this.definition.type}`
        );
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
        Util.logger.error(
            ` ☇ skipping ${this.definition.type} ${metadata[this.definition.keyField]} / ${
                metadata[this.definition.nameField]
            }: update is not supported yet for ${this.definition.type}`
        );
        return;
    }
    /**
     * Abstract refresh method that needs to be implemented in child metadata type
     *
     * @returns {void}
     */
    static refresh() {
        Util.logger.error(
            ` ☇ skipping ${this.definition.type}: refresh is not supported yet for ${this.definition.type}`
        );
        return;
    }

    /**
     * test if metadata was actually changed or not to potentially skip it during deployment
     *
     * @param {TYPE.MetadataTypeItem} cachedVersion cached version from the server
     * @param {TYPE.MetadataTypeItem} metadata item to upload
     * @param {string} [fieldName] optional field name to use for identifying the record in logs
     * @returns {boolean} true if metadata was changed
     */
    static hasChanged(cachedVersion, metadata, fieldName) {
        // should be set up type by type but the *_generic version is likely a good start for many types
        return true;
    }
    /**
     * test if metadata was actually changed or not to potentially skip it during deployment
     *
     * @param {TYPE.MetadataTypeItem} cachedVersion cached version from the server
     * @param {TYPE.MetadataTypeItem} metadata item to upload
     * @param {string} [fieldName] optional field name to use for identifying the record in logs
     * @param {boolean} [silent] optionally suppress logging
     * @returns {boolean} true on first identified deviation or false if none are found
     */
    static hasChangedGeneric(cachedVersion, metadata, fieldName, silent) {
        if (!cachedVersion) {
            return true;
        }
        // we do need the full set in other places and hence need to work with a clone here
        const clonedMetada = JSON.parse(JSON.stringify(metadata));
        this.removeNotUpdateableFields(clonedMetada);
        // iterate over what we want to upload rather than what we cached to avoid false positives
        for (const prop in clonedMetada) {
            if (this.definition.ignoreFieldsForUpdateCheck?.includes(prop)) {
                continue;
            }
            if (
                clonedMetada[prop] === null ||
                ['string', 'number', 'boolean'].includes(typeof clonedMetada[prop])
            ) {
                // check simple variables directly
                // check should ignore types to bypass string/number auto-conversions caused by SFMC-SDK
                if (clonedMetada[prop] != cachedVersion[prop]) {
                    Util.logger.debug(
                        `${this.definition.type}:: ${
                            clonedMetada[fieldName || this.definition.keyField]
                        }.${prop} changed: '${cachedVersion[prop]}' to '${clonedMetada[prop]}'`
                    );
                    return true;
                }
            } else if (deepEqual(clonedMetada[prop], cachedVersion[prop])) {
                // test complex objects here
                Util.logger.debug(
                    `${this.definition.type}:: ${
                        clonedMetada[fieldName || this.definition.keyField]
                    }.${prop} changed: '${cachedVersion[prop]}' to '${clonedMetada[prop]}'`
                );
                return true;
            }
        }
        if (!silent) {
            Util.logger.verbose(
                ` ☇ skipping ${this.definition.type} ${clonedMetada[this.definition.keyField]} / ${
                    clonedMetada[fieldName || this.definition.nameField]
                }: no change detected`
            );
        }
        return false;
    }
    /**
     * MetadataType upsert, after retrieving from target and comparing to check if create or update operation is needed.
     *
     * @param {TYPE.MetadataTypeMap} metadata metadata mapped by their keyField
     * @param {string} deployDir directory where deploy metadata are saved
     * @param {boolean} [isRefresh] optional flag to indicate that triggeredSend should be refreshed after deployment of assets
     * @returns {Promise.<TYPE.MetadataTypeMap>} keyField => metadata map
     */
    static async upsert(metadata, deployDir, isRefresh) {
        const orignalMetadata = JSON.parse(JSON.stringify(metadata));
        const metadataToUpdate = [];
        const metadataToCreate = [];
        let filteredByPreDeploy = 0;
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
                        ` ☇ skipping ${this.definition.type} ${
                            deployableMetadata[this.definition.keyField]
                        } / ${deployableMetadata[this.definition.nameField]}: ${ex.message}`
                    );
                }
                // if preDeploy returns nothing then it cannot be deployed so skip deployment
                if (deployableMetadata) {
                    metadata[metadataKey] = deployableMetadata;
                    // create normalizedKey off of whats in the json rather than from "metadataKey" because preDeployTasks might have altered something (type asset)
                    this.createOrUpdate(
                        metadata,
                        metadataKey,
                        hasError,
                        metadataToUpdate,
                        metadataToCreate
                    );
                } else {
                    filteredByPreDeploy++;
                }
            } catch (ex) {
                Util.logger.errorStack(
                    ex,
                    `Upserting ${this.definition.type} failed: ${ex.message}`
                );
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
        Util.logger.info(
            `${this.definition.type} upsert: ${createResults.length} of ${metadataToCreate.length} created / ${updateResults.length} of ${metadataToUpdate.length} updated` +
                (filteredByPreDeploy > 0 ? ` / ${filteredByPreDeploy} filtered` : '')
        );
        let upsertResults;
        if (this.definition.bodyIteratorField === 'Results') {
            // if Results then parse as SOAP
            // put in Retrieve Format for parsing
            // todo add handling when response does not contain items.
            // @ts-ignore
            const metadataResults = createResults
                .concat(updateResults)
                // TODO remove Object.keys check after create/update SOAP methods stop returning empty objects instead of null
                .filter((r) => r !== undefined && r !== null && Object.keys(r).length !== 0)
                .flatMap((r) => r.Results)
                .map((r) => r.Object);
            upsertResults = this.parseResponseBody({ Results: metadataResults });
        } else {
            // likely comming from one of the many REST APIs
            // put in Retrieve Format for parsing
            // todo add handling when response does not contain items.
            // @ts-ignore
            const metadataResults = createResults.concat(updateResults).filter(Boolean);
            upsertResults = this.parseResponseBody(metadataResults);
        }
        await this.postDeployTasks(
            upsertResults,
            orignalMetadata,
            { created: createResults.length, updated: updateResults.length },
            isRefresh
        );
        return upsertResults;
    }

    /**
     * helper for {@link MetadataType.upsert}
     *
     * @param {TYPE.MetadataTypeItem} metadata single metadata itme
     * @param {string} metadataKey key of item we are looking at
     * @param {boolean} hasError error flag from previous code
     * @param {TYPE.MetadataTypeItemDiff[]} metadataToUpdate list of items to update
     * @param {TYPE.MetadataTypeItem[]} metadataToCreate list of items to create
     * @returns {'create' | 'update' | 'skip'} action to take
     */
    static createOrUpdate(metadata, metadataKey, hasError, metadataToUpdate, metadataToCreate) {
        const normalizedKey = File.reverseFilterIllegalFilenames(
            metadata[metadataKey][this.definition.keyField]
        );
        // Update if it already exists; Create it if not
        if (Util.logger.level === 'debug' && metadata[metadataKey][this.definition.idField]) {
            // TODO: re-evaluate in future releases if & when we managed to solve folder dependencies once and for all
            // only used if resource is excluded from cache and we still want to update it
            // needed e.g. to rewire lost folders
            Util.logger.warn(
                ' - Hotfix for non-cachable resource found in deploy folder. Trying update:'
            );
            Util.logger.warn(JSON.stringify(metadata[metadataKey]));
            if (hasError) {
                metadataToUpdate.push(null);
                return 'skip';
            } else {
                metadataToUpdate.push({
                    before: {},
                    after: metadata[metadataKey],
                });
                return 'update';
            }
        } else if (cache.getByKey(this.definition.type, normalizedKey)) {
            // normal way of processing update files
            const cachedVersion = cache.getByKey(this.definition.type, normalizedKey);
            if (!this.hasChanged(cachedVersion, metadata[metadataKey])) {
                hasError = true;
            }

            if (hasError) {
                // do this in case something went wrong during pre-deploy steps to ensure the total counter is correct
                metadataToUpdate.push(null);
                return 'skip';
            } else {
                // add ObjectId to allow actual update
                metadata[metadataKey][this.definition.idField] =
                    cachedVersion[this.definition.idField];

                metadataToUpdate.push({
                    before: cache.getByKey(this.definition.type, normalizedKey),
                    after: metadata[metadataKey],
                });
                return 'update';
            }
        } else {
            if (hasError) {
                // do this in case something went wrong during pre-deploy steps to ensure the total counter is correct
                metadataToCreate.push(null);
                return 'skip';
            } else {
                metadataToCreate.push(metadata[metadataKey]);
                return 'create';
            }
        }
    }

    /**
     * Creates a single metadata entry via REST
     *
     * @param {TYPE.MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {string} uri rest endpoint for POST
     * @returns {Promise.<object> | null} Promise of API response or null in case of an error
     */
    static async createREST(metadataEntry, uri) {
        this.removeNotCreateableFields(metadataEntry);
        try {
            const response = await this.client.rest.post(uri, metadataEntry);
            await this.postCreateTasks(metadataEntry, response);
            Util.logger.info(
                ` - created ${this.definition.type}: ${
                    metadataEntry[this.definition.keyField] ||
                    metadataEntry[this.definition.nameField]
                } / ${metadataEntry[this.definition.nameField]}`
            );
            return response;
        } catch (ex) {
            const parsedErrors = this.checkForErrors(ex);
            Util.logger.error(
                ` ☇ error creating ${this.definition.type} ${
                    metadataEntry[this.definition.keyField] ||
                    metadataEntry[this.definition.nameField]
                } / ${metadataEntry[this.definition.nameField]}:`
            );
            for (const msg of parsedErrors) {
                Util.logger.error('   • ' + msg);
            }
            return null;
        }
    }

    /**
     * Creates a single metadata entry via fuel-soap (generic lib not wrapper)
     *
     * @param {TYPE.MetadataTypeItem} metadataEntry single metadata entry
     * @param {boolean} [handleOutside] if the API reponse is irregular this allows you to handle it outside of this generic method
     * @returns {Promise.<object> | null} Promise of API response or null in case of an error
     */
    static async createSOAP(metadataEntry, handleOutside) {
        const soapType = this.definition.soapType || this.definition.type;
        try {
            this.removeNotCreateableFields(metadataEntry);
            const response = await this.client.soap.create(
                soapType.charAt(0).toUpperCase() + soapType.slice(1),
                metadataEntry,
                null
            );

            if (!handleOutside) {
                Util.logger.info(
                    ` - created ${this.definition.type}: ${
                        metadataEntry[this.definition.keyField]
                    } / ${metadataEntry[this.definition.nameField]}`
                );
            }
            return response;
        } catch (ex) {
            this._handleSOAPErrors(ex, 'creating', metadataEntry, handleOutside);
            return null;
        }
    }

    /**
     * Updates a single metadata entry via REST
     *
     * @param {TYPE.MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {string} uri rest endpoint for PATCH
     * @param {'patch'|'post'|'put'} [httpMethod='patch'] defaults to 'patch'; some update requests require PUT instead of PATCH
     * @returns {Promise.<object> | null} Promise of API response or null in case of an error
     */
    static async updateREST(metadataEntry, uri, httpMethod = 'patch') {
        Util.logger.info('uri: ' + uri);
        this.removeNotUpdateableFields(metadataEntry);
        try {
            const response = await this.client.rest[httpMethod](uri, metadataEntry);
            this.checkForErrors(response);
            // some times, e.g. automation dont return a key in their update response and hence we need to fall back to name
            Util.logger.info(
                ` - updated ${this.definition.type}: ${
                    metadataEntry[this.definition.keyField] ||
                    metadataEntry[this.definition.nameField]
                } / ${metadataEntry[this.definition.nameField]}`
            );
            return response;
        } catch (ex) {
            const parsedErrors = this.checkForErrors(ex);
            Util.logger.error(
                ` ☇ error updating ${this.definition.type} ${
                    metadataEntry[this.definition.keyField] ||
                    metadataEntry[this.definition.nameField]
                } / ${metadataEntry[this.definition.nameField]}:`
            );
            for (const msg of parsedErrors) {
                Util.logger.error('   • ' + msg);
            }
            return null;
        }
    }

    /**
     * Updates a single metadata entry via fuel-soap (generic lib not wrapper)
     *
     * @param {TYPE.MetadataTypeItem} metadataEntry single metadata entry
     * @param {boolean} [handleOutside] if the API reponse is irregular this allows you to handle it outside of this generic method
     * @returns {Promise.<object> | null} Promise of API response or null in case of an error
     */
    static async updateSOAP(metadataEntry, handleOutside) {
        const soapType = this.definition.soapType || this.definition.type;
        try {
            this.removeNotUpdateableFields(metadataEntry);
            const response = await this.client.soap.update(
                soapType.charAt(0).toUpperCase() + soapType.slice(1),
                metadataEntry,
                null
            );
            if (!handleOutside) {
                Util.logger.info(
                    ` - updated ${this.definition.type}: ${
                        metadataEntry[this.definition.keyField]
                    } / ${metadataEntry[this.definition.nameField]}`
                );
            }
            return response;
        } catch (ex) {
            this._handleSOAPErrors(ex, 'updating', metadataEntry, handleOutside);
            return null;
        }
    }
    /**
     *
     * @param {Error} ex error that occured
     * @param {'creating'|'updating'} msg what to print in the log
     * @param {TYPE.MetadataTypeItem} [metadataEntry] single metadata entry
     * @param {boolean} [handleOutside] if the API reponse is irregular this allows you to handle it outside of this generic method
     */
    static _handleSOAPErrors(ex, msg, metadataEntry, handleOutside) {
        if (handleOutside) {
            throw ex;
        } else {
            const errorMsg = this.getSOAPErrorMsg(ex);
            const name = metadataEntry ? ` '${metadataEntry[this.definition.keyField]}'` : '';
            Util.logger.error(` ☇ error ${msg} ${this.definition.type}${name}: ${errorMsg}`);
        }
    }
    /**
     * helper for {@link _handleSOAPErrors}
     *
     * @param {Error} ex error that occured
     * @returns {string} error message
     */
    static getSOAPErrorMsg(ex) {
        return ex?.json?.Results?.length
            ? `${ex.json.Results[0].StatusMessage} (Code ${ex.json.Results[0].ErrorCode})`
            : ex.message;
    }
    /**
     * Retrieves SOAP via generic fuel-soap wrapper based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {TYPE.SoapRequestParams} [requestParams] required for the specific request (filter for example)
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of item map
     */
    static async retrieveSOAP(retrieveDir, requestParams, additionalFields) {
        requestParams = requestParams || {};
        const fields = this.getFieldNamesToRetrieve(additionalFields, !retrieveDir);
        const soapType = this.definition.soapType || this.definition.type;
        let response;
        try {
            response = await this.client.soap.retrieveBulk(soapType, fields, requestParams);
        } catch (ex) {
            this._handleSOAPErrors(ex, 'retrieving');
            return {};
        }
        const metadata = this.parseResponseBody(response);

        if (retrieveDir) {
            const savedMetadata = await this.saveResults(metadata, retrieveDir, null);
            Util.logger.info(
                `Downloaded: ${this.definition.type} (${Object.keys(savedMetadata).length})`
            );
            if (
                this.buObject &&
                this.properties.metaDataTypes.documentOnRetrieve.includes(this.definition.type)
            ) {
                await this.document(savedMetadata);
            }
        }
        return { metadata: metadata, type: this.definition.type };
    }

    /**
     * Retrieves Metadata for Rest Types
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {string} uri rest endpoint for GET
     * @param {TYPE.TemplateMap} [templateVariables] variables to be replaced in the metadata
     * @param {string|number} [singleRetrieve] key of single item to filter by
     * @returns {Promise.<{metadata: (TYPE.MetadataTypeMap | TYPE.MetadataTypeItem), type: string}>} Promise of item map (single item for templated result)
     */
    static async retrieveREST(retrieveDir, uri, templateVariables, singleRetrieve) {
        const response =
            this.definition.restPagination && !singleRetrieve
                ? await this.client.rest.getBulk(uri, this.definition.restPageSize || 500)
                : await this.client.rest.get(uri);
        const results = this.parseResponseBody(response, singleRetrieve);
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
                null,
                templateVariables
            );
            Util.logger.info(
                `Downloaded: ${this.definition.type} (${Object.keys(savedMetadata).length})` +
                    Util.getKeysString(singleRetrieve)
            );
        }

        return {
            metadata: templateVariables ? Object.values(results)[0] : results,
            type: this.definition.type,
        };
    }

    /**
     * Builds map of metadata entries mapped to their keyfields
     *
     * @param {object} body json of response body
     * @param {string|number} [singleRetrieve] key of single item to filter by
     * @returns {TYPE.MetadataTypeMap} keyField => metadata map
     */
    static parseResponseBody(body, singleRetrieve) {
        const bodyIteratorField = this.definition.bodyIteratorField;
        const keyField = this.definition.keyField;
        const metadataStructure = {};
        if (body !== null) {
            if (Array.isArray(body)) {
                // in some cases data is just an array
                for (const item of body) {
                    const key = item[keyField];
                    metadataStructure[key] = item;
                }
            } else if (body[bodyIteratorField]) {
                for (const item of body[bodyIteratorField]) {
                    const key = item[keyField];
                    metadataStructure[key] = item;
                }
            } else if (singleRetrieve) {
                // some types will return a single item intead of an array if the key is supported by their api
                // ! currently, the id: prefix is only supported by journey (interaction)
                if (singleRetrieve.startsWith('id:')) {
                    singleRetrieve = body[keyField];
                }
                metadataStructure[singleRetrieve] = body;
                return metadataStructure;
            }
            if (
                metadataStructure[singleRetrieve] &&
                (typeof singleRetrieve === 'string' || typeof singleRetrieve === 'number')
            ) {
                // in case we really just wanted one entry but couldnt do so in the api call, filter it here
                const single = {};
                single[singleRetrieve] = metadataStructure[singleRetrieve];
                return single;
            } else if (singleRetrieve) {
                return {};
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
        } catch {
            // when we hit fields that have dots in their name (e.g. interarction, metaData['simulation.id']) then this will fail
            // decided to skip these cases for now entirely
            return;
        }
        // revert back placeholder to dots
        const originHelper = origin ? origin + '.' + fieldPath : fieldPath;

        if (this.definition.fields[originHelper]?.skipValidation || originHelper === '@_xsi:type') {
            // skip if current field should not be validated OR if field is internal helper field xsi:type
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
                Util.logger.debug(errorMsg + ' (Accenture SFMC DevTools default)');
                return true;
            }

            const excludeByConfig = this._filterFolder(
                this.properties.options.exclude[this.definition.type],
                metadataEntry.r__folder_Path
            );
            if (excludeByConfig) {
                Util.logger.debug(errorMsg + ' (project config)');
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
        let filterCounter = 0;
        let subtypeExtension;
        for (const originalKey in results) {
            if (this.definition.type === 'asset') {
                overrideType =
                    this.definition.type +
                    '-' +
                    Object.keys(this.definition.extendedSubTypes).find((type) =>
                        this.definition.extendedSubTypes[type].includes(
                            results[originalKey].assetType.name
                        )
                    );
            }
            subtypeExtension = '.' + (overrideType || this.definition.type) + '-meta';

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
                await File.writeJSONToFile(
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
                Util.logger.errorStack(
                    ex,
                    ` - Saving ${this.definition.type} ${originalKey} failed`
                );
            }
        }
        if (filterCounter && this.definition.type !== 'asset') {
            // interferes with progress bar in assets and is printed 1-by-1 otherwise
            Util.logger.info(
                ` - Filtered ${this.definition.type}: ${filterCounter} (downloaded but not saved to disk)`
            );
        }
        return savedResults;
    }
    /**
     * helper for {@link buildDefinitionForNested}
     * searches extracted file for template variable names and applies the market values
     *
     * @param {string} code code from extracted code
     * @param {TYPE.TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {string} code with markets applied
     */
    static applyTemplateValues(code, templateVariables) {
        // replace template variables with their values
        return Mustache.render(code, templateVariables, {}, ['{{{', '}}}']);
    }
    /**
     * helper for {@link buildTemplateForNested}
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
     * helper for {@link buildDefinition}
     * handles extracted code if any are found for complex types (e.g script, asset, query)
     *
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string} targetDir Directory where built definitions will be saved
     * @param {TYPE.MetadataTypeItem} metadata main JSON file that was read from file system
     * @param {TYPE.TemplateMap} variables variables to be replaced in the metadata
     * @param {string} templateName name of the template to be built
     * @returns {Promise.<string[][]>} list of extracted files with path-parts provided as an array
     */
    static async buildDefinitionForNested(
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
     * helper for {@link buildTemplate}
     * handles extracted code if any are found for complex types
     *
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string|string[]} targetDir (List of) Directory where built definitions will be saved
     * @param {TYPE.MetadataTypeItem} metadata main JSON file that was read from file system
     * @param {TYPE.TemplateMap} templateVariables variables to be replaced in the metadata
     * @param {string} templateName name of the template to be built
     * @returns {Promise.<string[][]>} list of extracted files with path-parts provided as an array
     */
    static buildTemplateForNested(
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
     * @returns {Promise.<string>} subtype name
     */
    static async findSubType(templateDir, templateName) {
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
        const subType = await this.findSubType(templateDir, templateName);
        if (subType) {
            typeDirArr.push(subType);
        }
        const suffix = subType ? `-${subType}-meta` : '-meta';
        const fileName = templateName + '.' + this.definition.type + suffix;
        try {
            // ! do not load via readJSONFile to ensure we get a string, not parsed JSON
            // templated files might contain illegal json before the conversion back to the file that shall be saved
            metadataStr = await File.readFilteredFilename(
                [templateDir, ...typeDirArr],
                fileName,
                'json'
            );
        } catch (ex) {
            try {
                metadataStr = await this.readSecondaryFolder(
                    templateDir,
                    typeDirArr,
                    templateName,
                    fileName,
                    ex
                );
            } catch {
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
            metadata = JSON.parse(Mustache.render(metadataStr, variables, {}, ['{{{', '}}}']));
            typeDirArr = typeDirArr.map((el) => Mustache.render(el, variables, {}, ['{{{', '}}}']));
        } catch {
            throw new Error(
                `${this.definition.type}:: Error applying template variables on ${
                    templateName + '.' + this.definition.type
                }${suffix}.json. Please check if your replacement values will result in valid json.`
            );
        }

        // handle extracted code
        // run after metadata was templated and converted into JS-object
        // templating to extracted content is applied inside of buildDefinitionForNested()
        await this.buildDefinitionForNested(
            templateDir,
            targetDir,
            metadata,
            variables,
            templateName
        );

        try {
            // write to file
            const targetDirArr = Array.isArray(targetDir) ? targetDir : [targetDir];

            for (const targetDir of targetDirArr) {
                await File.writeJSONToFile(
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
     * @returns {string[] | void} formatted Error Message
     */
    static checkForErrors(ex) {
        if (ex?.response?.status >= 400 && ex?.response?.status < 600) {
            const errors = [];
            if (ex.response.data.errors) {
                for (const errMsg of ex.response.data.errors) {
                    errors.push(
                        ...errMsg.message
                            .split('<br />')
                            .map((el) => el.trim())
                            .filter(Boolean)
                    );
                }
            } else if (ex.response.data.validationErrors) {
                for (const errMsg of ex.response.data.validationErrors) {
                    errors.push(
                        ...errMsg.message
                            .split('<br />')
                            .map((el) => el.trim())
                            .filter(Boolean)
                    );
                }
            } else if (ex.response.data.message) {
                errors.push(ex.response.data.message);
            } else {
                errors.push(`Undefined Errors: ${JSON.stringify(ex.response.data)}`);
            }
            Util.logger.debug(JSON.stringify(ex.config));
            Util.logger.debug(JSON.stringify(ex.response.data));
            return errors;
        }
    }

    /**
     * Gets metadata cache with limited fields and does not store value to disk
     *
     * @param {TYPE.MetadataTypeMap} [metadata] a list of type definitions
     * @param {boolean} [isDeploy] used to skip non-supported message during deploy
     * @returns {void}
     */
    static document(metadata, isDeploy) {
        if (!isDeploy) {
            Util.logger.error(`Documenting type ${this.definition.type} is not supported.`);
        }
    }

    /**
     * Delete a metadata item from the specified business unit
     *
     * @param {string} customerKey Identifier of data extension
     * @returns {boolean} deletion success status
     */
    static deleteByKey(customerKey) {
        Util.logger.error(`Deletion is not yet supported for ${this.definition.typeName}!`);
        return false;
    }
    /**
     * clean up after deleting a metadata item
     *
     * @param {string} customerKey Identifier of metadata item
     * @param {string[]} [additionalExtensions] additional file extensions to delete on top of `${this.definition.type}-meta.json`
     * @returns {Promise.<void>} - Promise
     */
    static async postDeleteTasks(customerKey, additionalExtensions) {
        // delete local copy: retrieve/cred/bu/type/...json + whatever additional extensions were passed
        const extArr = [`${this.definition.type}-meta.json`, ...(additionalExtensions || [])];
        for (const ext of extArr) {
            const jsonFile = File.normalizePath([
                this.properties.directories.retrieve,
                this.buObject.credential,
                this.buObject.businessUnit,
                this.definition.type,
                `${customerKey}.${ext}`,
            ]);
            await File.remove(jsonFile);
        }
    }

    /**
     * Delete a data extension from the specified business unit
     *
     * @param {string} customerKey Identifier of metadata
     * @param {string} [overrideKeyField] optionally change the name of the key field if the api uses a different name
     * @param {boolean} [handleOutside] if the API reponse is irregular this allows you to handle it outside of this generic method
     * @returns {boolean} deletion success flag
     */
    static async deleteByKeySOAP(customerKey, overrideKeyField, handleOutside) {
        const metadata = {};
        metadata[overrideKeyField || this.definition.keyField] = customerKey;
        const soapType = this.definition.soapType || this.definition.type;
        try {
            await this.client.soap.delete(
                soapType.charAt(0).toUpperCase() + soapType.slice(1),
                metadata,
                null
            );
            if (!handleOutside) {
                Util.logger.info(` - deleted ${this.definition.type}: ${customerKey}`);
            }
            this.postDeleteTasks(customerKey);

            return true;
        } catch (ex) {
            if (handleOutside) {
                throw ex;
            } else {
                const errorMsg = ex?.results?.length
                    ? `${ex.results[0].StatusMessage} (Code ${ex.results[0].ErrorCode})`
                    : ex.message;
                Util.logger.error(
                    `- error deleting ${this.definition.type} '${customerKey}': ${errorMsg}`
                );
            }

            return false;
        }
    }
    /**
     * Delete a data extension from the specified business unit
     *
     * @param {string} url endpoint
     * @param {string} key Identifier of metadata
     * @param {boolean} [handleOutside] if the API reponse is irregular this allows you to handle it outside of this generic method
     * @returns {boolean} deletion success flag
     */
    static async deleteByKeyREST(url, key, handleOutside) {
        try {
            await this.client.rest.delete(url);
            if (!handleOutside) {
                Util.logger.info(` - deleted ${this.definition.type}: ${key}`);
            }
            this.postDeleteTasks(key);

            return true;
        } catch (ex) {
            if (handleOutside) {
                throw ex;
            } else {
                Util.logger.errorStack(ex, ` - Deleting ${this.definition.type} '${key}' failed`);
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
            if (File.pathExistsSync(readDir)) {
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
    /**
     * should return only the json for all but asset, query and script that are saved as multiple files
     * additionally, the documentation for dataExtension and automation should be returned
     *
     * @param {string[]} keyArr customerkey of the metadata
     * @returns {Promise.<string[]>} list of all files that need to be committed in a flat array ['path/file1.ext', 'path/file2.ext']
     */
    static getFilesToCommit(keyArr) {
        const typeExtension = '.' + this.definition.type + '-meta.json';
        const path = File.normalizePath([
            this.properties.directories.retrieve,
            this.buObject.credential,
            this.buObject.businessUnit,
            this.definition.type,
        ]);

        const fileList = keyArr.map((key) => File.normalizePath([path, key + typeExtension]));
        return fileList;
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
 * @type {TYPE.Mcdevrc}
 */
MetadataType.properties = null;
/**
 * @type {string}
 */
MetadataType.subType = null;
/**
 * @type {TYPE.BuObject}
 */
MetadataType.buObject = null;

module.exports = MetadataType;
