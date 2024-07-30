'use strict';

/* eslint no-unused-vars:off */
/*
 * README no-unused-vars is reduced to WARNING here as this file is a template
 * for all metadata types and methods often define params that are not used
 * in the generic version of the method
 */

import { Util } from '../util/util.js';
import File from '../util/file.js';
import cache from '../util/cache.js';
import deepEqual from 'deep-equal';
import pLimit from 'p-limit';
import Mustache from 'mustache';
import MetadataTypeInfo from '../MetadataTypeInfo.js';

/**
 * @typedef {import('../../types/mcdev.d.js').BuObject} BuObject
 * @typedef {import('../../types/mcdev.d.js').CodeExtract} CodeExtract
 * @typedef {import('../../types/mcdev.d.js').CodeExtractItem} CodeExtractItem
 * @typedef {import('../../types/mcdev.d.js').Mcdevrc} Mcdevrc
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItem} MetadataTypeItem
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItemDiff} MetadataTypeItemDiff
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItemObj} MetadataTypeItemObj
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMap} MetadataTypeMap
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMapObj} MetadataTypeMapObj
 * @typedef {import('../../types/mcdev.d.js').MultiMetadataTypeList} MultiMetadataTypeList
 * @typedef {import('../../types/mcdev.d.js').SoapRequestParams} SoapRequestParams
 * @typedef {import('../../types/mcdev.d.js').TemplateMap} TemplateMap
 * @typedef {import('../../types/mcdev.d.js').TypeKeyCombo} TypeKeyCombo
 * @typedef {import('sfmc-sdk').default} SDK
 * @typedef {import('../../types/mcdev.d.js').SDKError} SDKError
 * @typedef {import('../../types/mcdev.d.js').SOAPError} SOAPError
 * @typedef {import('../../types/mcdev.d.js').RestError} RestError
 * @typedef {import('../../types/mcdev.d.js').ContentBlockConversionTypes} ContentBlockConversionTypes
 */

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
     * @param {string} dir directory with json files, e.g. /retrieve/cred/bu/event, /deploy/cred/bu/event, /template/event
     * @param {boolean} [listBadKeys] do not print errors, used for badKeys()
     * @param {string[]} [selectedSubType] asset, message, ...
     * @returns {Promise.<MetadataTypeMap>} fileName => fileContent map
     */
    static async getJsonFromFS(dir, listBadKeys, selectedSubType) {
        const fileName2FileContent = {};
        try {
            const files = await File.readdir(dir);
            for (const fileName of files) {
                try {
                    if (fileName.endsWith('.json')) {
                        const fileContent = await File.readJSONFile(dir, fileName, false);
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
                            Util.logger.error(
                                ` ${this.definition.type} ${key}: Name of the metadata file and the JSON-key (${this.definition.keyField}) must match` +
                                    Util.getGrayMsg(` - ${dir}/${fileName}`)
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
     * @param {MetadataTypeMap} metadata metadata mapped by their keyField
     * @param {string} deployDir directory where deploy metadata are saved
     * @param {string} retrieveDir directory where metadata after deploy should be saved
     * @returns {Promise.<MetadataTypeMap>} Promise of keyField => metadata map
     */
    static async deploy(metadata, deployDir, retrieveDir) {
        const upsertResults = await this.upsert(metadata, deployDir);
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
     * @param {MetadataTypeMap} upsertResults metadata mapped by their keyField as returned by update/create
     * @param {MetadataTypeMap} originalMetadata metadata to be updated (contains additioanl fields)
     * @param {{created: number, updated: number}} createdUpdated counter representing successful creates/updates
     * @returns {Promise.<void>} -
     */
    static async postDeployTasks(upsertResults, originalMetadata, createdUpdated) {}

    /**
     * helper for {@link MetadataType.createREST}
     *
     * @param {MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {object} apiResponse varies depending on the API call
     * @param {MetadataTypeItem} metadataEntryWithAllFields like metadataEntry but before non-creatable fields were stripped
     * @returns {void}
     */
    static postCreateTasks(metadataEntry, apiResponse, metadataEntryWithAllFields) {}

    /**
     * helper for {@link MetadataType.updateREST}
     *
     * @param {MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {object} apiResponse varies depending on the API call
     * @returns {void}
     */
    static postUpdateTasks(metadataEntry, apiResponse) {}

    /**
     * helper for {@link MetadataType.createREST} when legacy API endpoints as these do not return the created item but only their new id
     *
     * @param {MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {object} apiResponse varies depending on the API call
     * @returns {Promise.<void>} -
     */
    static async postDeployTasks_legacyApi(metadataEntry, apiResponse) {
        if (!apiResponse?.[this.definition.idField] && !metadataEntry?.[this.definition.idField]) {
            return;
        }
        const id =
            apiResponse?.[this.definition.idField] || metadataEntry?.[this.definition.idField];
        // re-retrieve created items because the API does not return any info for them except the new id (api key)
        try {
            const { metadata } = await this.retrieveForCache(null, null, 'id:' + id);
            const item = Object.values(metadata)[0];
            // ensure the "created item" cli log entry has the new auto-generated value
            metadataEntry[this.definition.keyField] = item[this.definition.keyField];
            // ensure postRetrieveTasks has the complete object in "apiResponse"
            Object.assign(apiResponse, item);
            // postRetrieveTasks will be run automatically on this via super.saveResult
        } catch (ex) {
            throw new Error(
                `Could not get details for new ${this.definition.type} ${id} from server (${ex.message})`
            );
        }
    }

    /**
     * Gets executed after retreive of metadata type
     *
     * @param {MetadataTypeItem} metadata a single item
     * @param {string} targetDir folder where retrieves should be saved
     * @param {boolean} [isTemplating] signals that we are retrieving templates
     * @returns {MetadataTypeItem} cloned metadata
     */
    static postRetrieveTasks(metadata, targetDir, isTemplating) {
        return structuredClone(metadata);
    }
    /**
     * generic script that retrieves the folder path from cache and updates the given metadata with it after retrieve
     *
     * @param {MetadataTypeItem} metadata a single item
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
     * @param {MetadataTypeItem} metadata a single item
     */
    static setFolderId(metadata) {
        if (!this.definition.folderIdField) {
            return;
        }
        if (!metadata.r__folder_Path) {
            throw new Error(
                `Dependent folder could not be found because r__folder_Path is not set`
            );
        }
        metadata[this.definition.folderIdField] = cache.getFolderId(metadata.r__folder_Path);
        delete metadata.r__folder_Path;
    }

    /**
     * Gets metadata from Marketing Cloud
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @param {string[]} [subTypeArr] optionally limit to a single subtype
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} metadata
     */
    static async retrieve(retrieveDir, additionalFields, subTypeArr, key) {
        Util.metadataLogger('error', this.definition.type, 'retrieve', `Not Supported`);
        const metadata = {};
        return { metadata: {}, type: this.definition.type };
    }
    /**
     * Gets metadata from Marketing Cloud
     *
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @param {string[]} [subTypeArr] optionally limit to a single subtype
     * @returns {Promise.<MetadataTypeMapObj>} metadata
     */
    static retrieveChangelog(additionalFields, subTypeArr) {
        return this.retrieveForCache(additionalFields, subTypeArr);
    }

    /**
     * Gets metadata cache with limited fields and does not store value to disk
     *
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @param {string[]} [subTypeArr] optionally limit to a single subtype
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} metadata
     */
    static async retrieveForCache(additionalFields, subTypeArr, key) {
        return this.retrieve(null, additionalFields, subTypeArr, key);
    }
    /**
     * Gets metadata cache with limited fields and does not store value to disk
     *
     * @param {string} templateDir Directory where retrieved metadata directory will be saved
     * @param {string} name name of the metadata file
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @param {string} [subType] optionally limit to a single subtype
     * @returns {Promise.<MetadataTypeItemObj>} metadata
     */
    static async retrieveAsTemplate(templateDir, name, templateVariables, subType) {
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
     * Retrieve a specific Script by Name
     *
     * @param {string} templateDir Directory where retrieved metadata directory will be saved
     * @param {string} uri rest endpoint for GET
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @param {string} name name (not key) of the metadata item
     * @returns {Promise.<{metadata: MetadataTypeItem, type: string}>} Promise
     */
    static async retrieveTemplateREST(templateDir, uri, templateVariables, name) {
        return this.retrieveREST(templateDir, uri, templateVariables, name);
    }

    /**
     * Gets metadata cache with limited fields and does not store value to disk
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {string} templateDir (List of) Directory where built definitions will be saved
     * @param {string} key name of the metadata file
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {Promise.<MetadataTypeItemObj>} single metadata
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
            if (!metadataStr) {
                throw new Error('File not found');
            }
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
                // only happening for types that use readSecondaryFolder (e.g. asset)
                // if we still have no metadataStr then we have to skip this metadata for all types and hence handle it outside of this catch
            }
            if (!metadataStr) {
                Util.logger.warn(
                    Util.getGrayMsg(` ☇ skipped ${this.definition.type} ${key}: not found`)
                );
                return;
            }
        }

        if (this.definition.stringifyFieldsBeforeTemplate) {
            // numeric fields are returned as numbers by the SDK/API. If we try to replace them in buildTemplate it would break the JSON format - but not if we stringify them first because then the {{{var}}} is in quotes
            const metadataTemp = JSON.parse(metadataStr);
            for (const field of this.definition.stringifyFieldsBeforeTemplate) {
                if (metadataTemp[field]) {
                    if (Array.isArray(metadataTemp[field])) {
                        for (let i = 0; i < metadataTemp[field].length; i++) {
                            metadataTemp[field][i] = metadataTemp[field][i].toString();
                        }
                    } else if ('object' === typeof metadataTemp[field]) {
                        for (const subField in metadataTemp[field]) {
                            metadataTemp[field][subField] =
                                metadataTemp[field][subField].toString();
                        }
                    } else {
                        metadataTemp[field] = metadataTemp[field].toString();
                    }
                }
            }
            metadataStr = JSON.stringify(metadataTemp);
        }
        // handle extracted code
        // templating to extracted content is applied inside of buildTemplateForNested()
        await this.buildTemplateForNested(
            retrieveDir,
            templateDir,
            JSON.parse(metadataStr),
            templateVariables,
            key
        );

        const metadata = JSON.parse(Util.replaceByObject(metadataStr, templateVariables));
        this.keepTemplateFields(metadata);

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
     * @param {MetadataTypeItem} metadata a single metadata item
     * @param {string} deployDir folder where files for deployment are stored
     * @returns {Promise.<MetadataTypeItem>} Promise of a single metadata item
     */
    static async preDeployTasks(metadata, deployDir) {
        return metadata;
    }

    /**
     * Abstract create method that needs to be implemented in child metadata type
     *
     * @param {MetadataTypeItem} metadata single metadata entry
     * @param {string} deployDir directory where deploy metadata are saved
     * @returns {Promise.<object> | null} Promise of API response or null in case of an error
     */
    static async create(metadata, deployDir) {
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
     * @param {MetadataTypeItem} metadata single metadata entry
     * @param {MetadataTypeItem} [metadataBefore] metadata mapped by their keyField
     * @returns {Promise.<object> | null} Promise of API response or null in case of an error
     */
    static async update(metadata, metadataBefore) {
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
     *
     * @param {string[]} keyArr limit retrieval to given metadata type
     * @param {string} retrieveDir retrieve dir including cred and bu
     * @param {Set.<string>} [findAssetKeys] list of keys that were found referenced via ContentBlockByX; if set, method only gets keys and runs no updates
     * @returns {Promise.<Set.<string>>} found asset keys
     */
    static async getCbReferenceKeys(keyArr, retrieveDir, findAssetKeys) {
        if (!Object.prototype.hasOwnProperty.call(this, 'replaceCbReference')) {
            // only types that have a replaceCbReference method actually have ampscript/ssjs
            return;
        }
        // get all metadata of the current type; then filter by keys in selectedTypes
        const metadataMap = Util.filterObjByKeys(
            await this.getJsonFromFS(File.normalizePath([retrieveDir, this.definition.type])),
            keyArr
        );
        await this.replaceCbReferenceLoop(metadataMap, retrieveDir, findAssetKeys);
        return findAssetKeys;
    }
    /**
     * this iterates over all items found in the retrieve folder and executes the type-specific method for replacing references
     *
     * @param {MetadataTypeMap} metadataMap list of metadata (keyField => metadata)
     * @param {string} retrieveDir retrieve dir including cred and bu
     * @param {Set.<string>} [findAssetKeys] list of keys that were found referenced via ContentBlockByX; if set, method only gets keys and runs no updates
     * @returns {Promise.<string[]>} Returns list of keys for which references were replaced
     */
    static async replaceCbReferenceLoop(metadataMap, retrieveDir, findAssetKeys) {
        const keysForDeploy = [];
        if (!metadataMap) {
            // if a type was skipped e.g. because it shall only be looked at on the parent then we would expect metadataMap to be undefined
            return keysForDeploy;
        }
        const fromDescription = Util.OPTIONS.referenceFrom
            .map((from) => 'ContentBlockBy' + Util.capitalizeFirstLetter(from))
            .join(' and ');

        if (Object.keys(metadataMap).length) {
            Util.logger.debug(` - Searching in ${this.definition.type} `);
            const baseDir = [retrieveDir, ...this.definition.type.split('-')];
            const deployMap = {};

            for (const key in metadataMap) {
                const item = metadataMap[key];
                if (this.isFiltered(item, true) || this.isFiltered(item, false)) {
                    // we would not have saved these items to disk but they exist in the cache and hence need to be skipped here

                    continue;
                }

                try {
                    // add key but make sure to turn it into string or else numeric keys will be filtered later
                    deployMap[key] = await this.replaceCbReference(
                        item,
                        retrieveDir,
                        findAssetKeys
                    );
                    keysForDeploy.push(key + '');
                    if (!findAssetKeys) {
                        await this.saveToDisk(deployMap, key, baseDir);

                        Util.logger.info(
                            ` - added ${this.definition.type} to update queue: ${key}`
                        );
                    }
                } catch (ex) {
                    if (ex.code !== 200) {
                        // dont print error if we simply did not find relevant content blocks
                        Util.logger.errorStack(ex, ex.message);
                    }
                    if (!findAssetKeys) {
                        Util.logger.info(
                            Util.getGrayMsg(
                                ` ☇ skipping ${this.definition.type} ${
                                    item[this.definition.keyField]
                                }: no ${fromDescription} found`
                            )
                        );
                    }
                }
            }
            if (!findAssetKeys) {
                Util.logger.info(
                    `Found ${keysForDeploy.length} ${this.definition.type}${keysForDeploy.length === 1 ? '' : 's'} to update`
                );
            }
        }
        return keysForDeploy;
    }
    /**
     * Abstract execute method that needs to be implemented in child metadata type
     *
     * @param {MetadataTypeItem} item single metadata item
     * @param {string} [retrieveDir] directory where metadata is saved
     * @param {Set.<string>} [findAssetKeys] list of keys that were found referenced via ContentBlockByX; if set, method only gets keys and runs no updates
     * @returns {Promise.<MetadataTypeItem | CodeExtractItem>} key of the item that was updated
     */
    static async replaceCbReference(item, retrieveDir, findAssetKeys) {
        Util.logger.error(
            ` ☇ skipping ${this.definition.type}: replaceCbReference is not supported yet for ${this.definition.type}`
        );
        return [];
    }

    /**
     * Abstract execute method that needs to be implemented in child metadata type
     *
     * @param {string[]} keyArr customerkey of the metadata
     * @returns {Promise.<string[]>} Returns list of keys that were executed
     */
    static async execute(keyArr) {
        Util.logger.error(
            ` ☇ skipping ${this.definition.type}: execute is not supported yet for ${this.definition.type}`
        );
        return [];
    }
    /**
     * Abstract pause method that needs to be implemented in child metadata type
     *
     * @param {string[]} keyArr customerkey of the metadata
     * @returns {Promise.<string[]>} Returns list of keys that were paused
     */
    static async pause(keyArr) {
        Util.logger.error(
            ` ☇ skipping ${this.definition.type}: pause is not supported yet for ${this.definition.type}`
        );
        return [];
    }

    /**
     * test if metadata was actually changed or not to potentially skip it during deployment
     *
     * @param {MetadataTypeItem} cachedVersion cached version from the server
     * @param {MetadataTypeItem} metadata item to upload
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
     * @param {MetadataTypeItem} cachedVersion cached version from the server
     * @param {MetadataTypeItem} metadataItem item to upload
     * @param {string} [fieldName] optional field name to use for identifying the record in logs
     * @param {boolean} [silent] optionally suppress logging
     * @returns {boolean} true on first identified deviation or false if none are found
     */
    static hasChangedGeneric(cachedVersion, metadataItem, fieldName, silent) {
        if (!cachedVersion) {
            return true;
        }
        // we do need the full set in other places and hence need to work with a clone here
        const clonedMetada = structuredClone(metadataItem);
        // keep copy of identifier in case it is among the non-updateable fields
        const identifier = clonedMetada[fieldName || this.definition.keyField];
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
                            identifier
                        }.${prop} changed: '${cachedVersion[prop]}' to '${clonedMetada[prop]}'`
                    );
                    return true;
                }
            } else if (deepEqual(clonedMetada[prop], cachedVersion[prop])) {
                // test complex objects here
                Util.logger.debug(
                    `${this.definition.type}:: ${
                        identifier
                    }.${prop} changed: '${cachedVersion[prop]}' to '${clonedMetada[prop]}'`
                );
                return true;
            }
        }
        if (!silent) {
            Util.logger.verbose(
                ` ☇ skipping ${this.definition.type} ${identifier} / ${
                    clonedMetada[this.definition.nameField] || ''
                }: no change detected`
            );
        }
        return false;
    }
    /**
     * MetadataType upsert, after retrieving from target and comparing to check if create or update operation is needed.
     *
     * @param {MetadataTypeMap} metadataMap metadata mapped by their keyField
     * @param {string} deployDir directory where deploy metadata are saved
     * @returns {Promise.<MetadataTypeMap>} keyField => metadata map
     */
    static async upsert(metadataMap, deployDir) {
        const orignalMetadataMap = structuredClone(metadataMap);
        const metadataToUpdate = [];
        const metadataToCreate = [];
        let filteredByPreDeploy = 0;
        for (const metadataKey in metadataMap) {
            let hasError = false;
            try {
                // preDeployTasks parsing
                let deployableMetadata;
                try {
                    deployableMetadata = await this.preDeployTasks(
                        metadataMap[metadataKey],
                        deployDir
                    );
                } catch (ex) {
                    // do this in case something went wrong during pre-deploy steps to ensure the total counter is correct
                    hasError = true;
                    deployableMetadata = metadataMap[metadataKey];

                    // * include ": ${ex.message}" in the error if this is ever turned back into Util.logger.error()
                    Util.logger.errorStack(
                        ex,
                        ` ☇ skipping ${this.definition.type} ${
                            deployableMetadata[this.definition.keyField]
                        } / ${deployableMetadata[this.definition.nameField]}`
                    );
                }
                // if preDeploy returns nothing then it cannot be deployed so skip deployment
                if (deployableMetadata) {
                    metadataMap[metadataKey] = deployableMetadata;
                    // create normalizedKey off of whats in the json rather than from "metadataKey" because preDeployTasks might have altered something (type asset)
                    await this.createOrUpdate(
                        metadataMap,
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

        if (Util.OPTIONS.noUpdate && metadataToUpdate.length > 0) {
            Util.logger.info(
                ` ☇ skipping update of ${metadataToUpdate.length} ${this.definition.type}${metadataToUpdate.length == 1 ? '' : 's'}: --noUpdate flag is set`
            );
        }

        const updateLimit = pLimit(10);
        const updateResults = Util.OPTIONS.noUpdate
            ? []
            : (
                  await Promise.all(
                      metadataToUpdate
                          .filter((r) => r !== undefined && r !== null)
                          .map((metadataEntry) =>
                              updateLimit(() =>
                                  this.update(metadataEntry.after, metadataEntry.before)
                              )
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
            const metadataResults = createResults.concat(updateResults).filter(Boolean);
            upsertResults = this.parseResponseBody(metadataResults);
        }
        await this.postDeployTasks(upsertResults, orignalMetadataMap, {
            created: createResults.length,
            updated: updateResults.length,
        });
        return upsertResults;
    }

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
    static async createOrUpdate(
        metadataMap,
        metadataKey,
        hasError,
        metadataToUpdate,
        metadataToCreate
    ) {
        let normalizedKey = File.reverseFilterIllegalFilenames(
            metadataMap[metadataKey][this.definition.keyField]
        );

        // Update if it already exists; Create it if not
        const maxKeyLength = this.definition.maxKeyLength || 36;

        // make sure keySuffix always has a string value
        Util.OPTIONS.keySuffix = Util.OPTIONS.keySuffix ? Util.OPTIONS.keySuffix.trim() : '';
        if (Util.OPTIONS.keySuffix && !cache.getByKey(this.definition.type, normalizedKey)) {
            // to ensure we go into update mode like we would with appending the MID to asset-keys, recreated the normalized key here
            const newKey = this.getNewKey(
                this.definition.keyField,
                metadataMap[metadataKey],
                maxKeyLength
            );

            normalizedKey = File.reverseFilterIllegalFilenames(newKey);
        }
        const cacheMatchedByKey = cache.getByKey(this.definition.type, normalizedKey);
        const cacheMatchedByName = cacheMatchedByKey
            ? null
            : this.getCacheMatchedByName(metadataMap[metadataKey]);

        if (
            Util.logger.level === 'debug' &&
            metadataMap[metadataKey][this.definition.idField] &&
            this.definition.idField !== this.definition.keyField
        ) {
            // TODO: re-evaluate in future releases if & when we managed to solve folder dependencies once and for all
            // only used if resource is excluded from cache and we still want to update it
            // needed e.g. to rewire lost folders
            Util.logger.warn(
                ' - Hotfix for non-cachable resource found in deploy folder. Trying update:'
            );
            Util.logger.warn(JSON.stringify(metadataMap[metadataKey]));
            if (hasError) {
                metadataToUpdate.push(null);
                return 'skip';
            } else {
                metadataToUpdate.push({
                    before: {},
                    after: metadataMap[metadataKey],
                });
                return 'update';
            }
        } else if (cacheMatchedByKey || cacheMatchedByName) {
            // normal way of processing update files
            const cachedVersion = cacheMatchedByKey || cacheMatchedByName;
            if (!this.hasChanged(cachedVersion, metadataMap[metadataKey])) {
                hasError = true;
            }

            if (Util.OPTIONS.changeKeyField) {
                if (this.definition.keyField == this.definition.idField) {
                    Util.logger.error(
                        ` - --changeKeyField cannot be used for types that use their ID as key. Skipping change.`
                    );
                    hasError = true;
                } else if (this.definition.keyIsFixed) {
                    Util.logger.error(
                        ` - type ${this.definition.type} does not support --changeKeyField and --changeKeyValue. Skipping change.`
                    );
                    hasError = true;
                } else if (!metadataMap[metadataKey][Util.OPTIONS.changeKeyField]) {
                    Util.logger.error(
                        ` - --changeKeyField is set to ${Util.OPTIONS.changeKeyField} but no value was found in the metadata. Skipping change.`
                    );
                    hasError = true;
                } else if (Util.OPTIONS.changeKeyField === this.definition.keyField) {
                    // simple issue, used WARN to avoid signaling a problem to ci/cd and don't fail deploy
                    Util.logger.warn(
                        ` - --changeKeyField is set to the same value as the keyField for ${this.definition.type}. Skipping change.`
                    );
                } else if (metadataMap[metadataKey][Util.OPTIONS.changeKeyField]) {
                    const newKey = this.getNewKey(
                        Util.OPTIONS.changeKeyField,
                        metadataMap[metadataKey],
                        maxKeyLength
                    );

                    if (
                        metadataMap[metadataKey][Util.OPTIONS.changeKeyField] +
                            '' +
                            Util.OPTIONS.keySuffix >
                        maxKeyLength
                    ) {
                        Util.logger.warn(
                            `${this.definition.type} ${this.definition.keyField} may not exceed ${maxKeyLength} characters. Truncated the value in field ${Util.OPTIONS.changeKeyField} to ${newKey}`
                        );
                    }
                    if (metadataKey == newKey) {
                        Util.logger.warn(
                            ` - --changeKeyField(${Util.OPTIONS.changeKeyField}) is providing the current value of the key (${metadataKey}). Skipping change.`
                        );
                    } else {
                        Util.logger.info(
                            ` - Changing ${this.definition.type} key from ${metadataKey} to ${newKey} via --changeKeyField=${Util.OPTIONS.changeKeyField}`
                        );
                        metadataMap[metadataKey][this.definition.keyField] = newKey;

                        // ensure we can delete the old file(s) after the successful update
                        Util.changedKeysMap[this.definition.type] ||= {};
                        Util.changedKeysMap[this.definition.type][newKey] = metadataKey;
                    }
                }
            } else if (Util.OPTIONS.changeKeyValue) {
                if (Util.OPTIONS.keySuffix !== '') {
                    Util.logger.warn(`Ignoring --keySuffix as --changeKeyValue is set.`);
                }
                // NOTE: trim twice while getting the newKey value to remove leading spaces before limiting the length
                const newKey = Util.OPTIONS.changeKeyValue.trim().slice(0, maxKeyLength).trim();
                if (Util.OPTIONS.changeKeyValue.trim().length > maxKeyLength) {
                    Util.logger.warn(
                        `${this.definition.type} ${this.definition.keyField} may not exceed ${maxKeyLength} characters. Truncated your value to ${newKey}`
                    );
                }
                if (this.definition.keyField == this.definition.idField) {
                    Util.logger.error(
                        ` - --changeKeyValue cannot be used for types that use their ID as key. Skipping change.`
                    );
                    hasError = true;
                } else if (this.definition.keyIsFixed) {
                    Util.logger.error(
                        ` - type ${this.definition.type} does not support --changeKeyField and --changeKeyValue. Skipping change.`
                    );
                    hasError = true;
                } else if (metadataKey == newKey) {
                    Util.logger.warn(
                        ` - --changeKeyValue is providing the current value of the key (${metadataKey}). Skipping change.`
                    );
                } else {
                    Util.logger.info(
                        ` - Changing ${this.definition.type} key from ${metadataKey} to ${newKey} via --changeKeyValue`
                    );
                    metadataMap[metadataKey][this.definition.keyField] = newKey;

                    // ensure we can delete the old file(s) after the successful update
                    Util.changedKeysMap[this.definition.type] ||= {};
                    Util.changedKeysMap[this.definition.type][newKey] = metadataKey;
                }
            } else if (Util.OPTIONS.keySuffix && Util.OPTIONS.keySuffix !== '') {
                // assume we simply want to append a suffix
                const newKey = this.getNewKey(
                    this.definition.keyField,
                    metadataMap[metadataKey],
                    maxKeyLength
                );
                Util.logger.info(
                    ` - Changing ${this.definition.type} key from ${metadataKey} to ${newKey} via --keySuffix=${Util.OPTIONS.keySuffix}`
                );
                metadataMap[metadataKey][this.definition.keyField] = newKey;

                // ensure we can delete the old file(s) after the successful update
                Util.changedKeysMap[this.definition.type] ||= {};
                Util.changedKeysMap[this.definition.type][newKey] = metadataKey;
            }

            if (hasError) {
                // do this in case something went wrong during pre-deploy steps to ensure the total counter is correct
                metadataToUpdate.push(null);
                return 'skip';
            } else {
                // add ObjectId to allow actual update
                metadataMap[metadataKey][this.definition.idField] =
                    cachedVersion[this.definition.idField];

                metadataToUpdate.push({
                    before: cachedVersion,
                    after: metadataMap[metadataKey],
                });

                return 'update';
            }
        } else {
            if (hasError) {
                // do this in case something went wrong during pre-deploy steps to ensure the total counter is correct
                metadataToCreate.push(null);
                return 'skip';
            } else {
                if (Util.OPTIONS.keySuffix && Util.OPTIONS.keySuffix !== '') {
                    // assume we simply want to append a suffix
                    const newKey = this.getNewKey(
                        this.definition.keyField,
                        metadataMap[metadataKey],
                        maxKeyLength
                    );
                    Util.logger.info(
                        ` - Changing ${this.definition.type} key from ${metadataKey} to ${newKey} via --keySuffix=${Util.OPTIONS.keySuffix}`
                    );
                    metadataMap[metadataKey][this.definition.keyField] = newKey;
                }

                metadataToCreate.push(metadataMap[metadataKey]);
                return 'create';
            }
        }
    }

    /**
     * helper for {@link MetadataType.createOrUpdate}
     *
     * @param {MetadataTypeItem} metadataItem to be deployed item
     * @returns {MetadataTypeItem} cached item or undefined
     */
    static getCacheMatchedByName(metadataItem) {
        // not supported generically
        return null;
    }

    /**
     * Creates a single metadata entry via REST
     *
     * @param {MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {string} uri rest endpoint for POST
     * @param {boolean} [handleOutside] if the API reponse is irregular this allows you to handle it outside of this generic method
     * @returns {Promise.<object> | null} Promise of API response or null in case of an error
     */
    static async createREST(metadataEntry, uri, handleOutside) {
        const metadataClone = structuredClone(metadataEntry);
        this.removeNotCreateableFields(metadataEntry);
        try {
            // set to empty object in case API returned nothing to be able to update it in helper classes
            const response = (await this.client.rest.post(uri, metadataEntry)) || {};
            await this.postCreateTasks(metadataEntry, response, metadataClone);
            if (!handleOutside) {
                Util.logger.info(
                    ` - created ${this.definition.type}: ${
                        metadataEntry[this.definition.keyField] ||
                        metadataEntry[this.definition.nameField]
                    } / ${metadataEntry[this.definition.nameField]}`
                );
            }
            return response;
        } catch (ex) {
            const parsedErrors = this.getErrorsREST(ex);
            Util.logger.error(
                ` ☇ error creating ${this.definition.type} ${
                    metadataEntry[this.definition.keyField] ||
                    metadataEntry[this.definition.nameField]
                } / ${metadataEntry[this.definition.nameField]}:`
            );
            if (parsedErrors.length) {
                for (const msg of parsedErrors) {
                    Util.logger.error('   • ' + msg);
                }
            } else if (ex?.message) {
                Util.logger.debug(ex.message);
            }
            return null;
        }
    }

    /**
     * Creates a single metadata entry via fuel-soap (generic lib not wrapper)
     *
     * @param {MetadataTypeItem} metadataEntry single metadata entry
     * @param {boolean} [handleOutside] if the API reponse is irregular this allows you to handle it outside of this generic method
     * @returns {Promise.<object> | null} Promise of API response or null in case of an error
     */
    static async createSOAP(metadataEntry, handleOutside) {
        const soapType = this.definition.soapType || this.definition.type;
        this.removeNotCreateableFields(metadataEntry);
        try {
            const response = await this.client.soap.create(
                Util.capitalizeFirstLetter(soapType),
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
     * @param {MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {string} uri rest endpoint for PATCH
     * @param {'patch'|'post'|'put'} [httpMethod] defaults to 'patch'; some update requests require PUT instead of PATCH
     * @returns {Promise.<object> | null} Promise of API response or null in case of an error
     */
    static async updateREST(metadataEntry, uri, httpMethod = 'patch') {
        this.removeNotUpdateableFields(metadataEntry);
        try {
            // set to empty object in case API returned nothing to be able to update it in helper classes
            const response = (await this.client.rest[httpMethod](uri, metadataEntry)) || {};
            await this._postChangeKeyTasks(metadataEntry);
            this.getErrorsREST(response);
            await this.postUpdateTasks(metadataEntry, response);
            // some times, e.g. automation dont return a key in their update response and hence we need to fall back to name
            Util.logger.info(
                ` - updated ${this.definition.type}: ${
                    metadataEntry[this.definition.keyField] ||
                    metadataEntry[this.definition.nameField]
                } / ${metadataEntry[this.definition.nameField]}`
            );
            return response;
        } catch (ex) {
            const parsedErrors = this.getErrorsREST(ex);
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
     * helper for {@link MetadataType.updateREST} and {@link MetadataType.updateSOAP} that removes old files after the key was changed
     *
     * @param {MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {boolean} [keepMap] some types require to check the old-key new-key relationship in their postDeployTasks; currently used by dataExtension only
     * @returns {Promise.<void>} -
     */
    static async _postChangeKeyTasks(metadataEntry, keepMap = false) {
        if (
            (Util.OPTIONS.changeKeyField || Util.OPTIONS.changeKeyValue) &&
            Util.changedKeysMap?.[this.definition.type]?.[metadataEntry[this.definition.keyField]]
        ) {
            const oldKey =
                Util.changedKeysMap?.[this.definition.type]?.[
                    metadataEntry[this.definition.keyField]
                ];

            // delete file(s) of old key
            await this.postDeleteTasks(oldKey);

            // fix key in cache
            const typeCache = cache.getCache()[this.definition.type];
            typeCache[metadataEntry[this.definition.keyField]] = typeCache[oldKey];
            delete typeCache[oldKey];

            if (!keepMap) {
                // clean entry from to-do list
                delete Util.changedKeysMap?.[this.definition.type]?.[
                    metadataEntry[this.definition.keyField]
                ];
            }
        }
    }

    /**
     * Updates a single metadata entry via fuel-soap (generic lib not wrapper)
     *
     * @param {MetadataTypeItem} metadataEntry single metadata entry
     * @param {boolean} [handleOutside] if the API reponse is irregular this allows you to handle it outside of this generic method
     * @returns {Promise.<object> | null} Promise of API response or null in case of an error
     */
    static async updateSOAP(metadataEntry, handleOutside) {
        const soapType = this.definition.soapType || this.definition.type;
        this.removeNotUpdateableFields(metadataEntry);
        try {
            const response = await this.client.soap.update(
                Util.capitalizeFirstLetter(soapType),
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
            await this._postChangeKeyTasks(metadataEntry);
            return response;
        } catch (ex) {
            this._handleSOAPErrors(ex, 'updating', metadataEntry, handleOutside);
            return null;
        }
    }
    /**
     *
     * @param {SOAPError} ex error that occured
     * @param {'creating'|'updating'|'retrieving'|'executing'|'pausing'} msg what to print in the log
     * @param {MetadataTypeItem} [metadataEntry] single metadata entry
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
     * helper for {@link MetadataType._handleSOAPErrors}
     *
     * @param {SOAPError} ex error that occured
     * @returns {string} error message
     */
    static getSOAPErrorMsg(ex) {
        if (ex?.json?.Results?.length) {
            if (ex?.json?.Results[0].StatusMessage) {
                return `${ex.json.Results[0].StatusMessage} (Code ${ex.json.Results[0].ErrorCode})`;
            } else if (ex?.json?.Results[0].Result.StatusMessage) {
                return `${ex.json.Results[0].Result.StatusMessage} (Code ${ex.json.Results[0].Result.ErrorCode})`;
            }
        }
        return ex.message;
    }
    /**
     * Retrieves SOAP via generic fuel-soap wrapper based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     *
     * @param {string} [retrieveDir] Directory where retrieved metadata directory will be saved
     * @param {SoapRequestParams} [requestParams] required for the specific request (filter for example)
     * @param {string} [singleRetrieve] key of single item to filter by
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @returns {Promise.<MetadataTypeMapObj>} Promise of item map
     */
    static async retrieveSOAP(retrieveDir, requestParams, singleRetrieve, additionalFields) {
        requestParams ||= {};
        const fields = this.getFieldNamesToRetrieve(additionalFields, !retrieveDir);
        const soapType = this.definition.soapType || this.definition.type;
        let response;
        try {
            response = await this.client.soap.retrieveBulk(
                Util.capitalizeFirstLetter(soapType),
                fields,
                requestParams
            );
        } catch (ex) {
            this._handleSOAPErrors(ex, 'retrieving');
            return;
        }
        const metadata = this.parseResponseBody(response);

        if (retrieveDir) {
            const savedMetadata = await this.saveResults(metadata, retrieveDir, null);
            Util.logger.info(
                `Downloaded: ${this.definition.type} (${Object.keys(savedMetadata).length})` +
                    Util.getKeysString(singleRetrieve)
            );
            await this.runDocumentOnRetrieve(singleRetrieve, savedMetadata);
        }
        return { metadata: metadata, type: this.definition.type };
    }

    /**
     * Retrieves Metadata for Rest Types
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {string} uri rest endpoint for GET
     * @param {TemplateMap} [templateVariables] variables to be replaced in the metadata
     * @param {string} [singleRetrieve] key of single item to filter by
     * @returns {Promise.<{metadata: (MetadataTypeMap | MetadataTypeItem), type: string}>} Promise of item map (single item for templated result)
     */
    static async retrieveREST(retrieveDir, uri, templateVariables, singleRetrieve) {
        const response =
            this.definition.restPagination && !singleRetrieve
                ? await this.client.rest.getBulk(uri, this.definition.restPageSize || 500)
                : await this.client.rest.get(uri);
        const results = this.parseResponseBody(response, singleRetrieve);
        // get extended metadata if applicable
        if (this.definition.hasExtended) {
            Util.logger.debug(' - retrieving extended metadata');
            const extended = await this.client.rest.getCollection(
                Object.keys(results)
                    .map((key) =>
                        uri.endsWith(results[key][this.definition.idField])
                            ? null
                            : uri + results[key][this.definition.idField]
                    )
                    .filter(Boolean)
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
            await this.runDocumentOnRetrieve(singleRetrieve, savedMetadata);
        }

        return {
            metadata: templateVariables ? Object.values(results)[0] : results,
            type: this.definition.type,
        };
    }
    /**
     *
     * @param {object[]} urlArray {uri: string, id: string} combo of URL and ID/key of metadata
     * @param {number} [concurrentRequests] optionally set a different amount of concurrent requests
     * @param {boolean} [logAmountOfUrls] if true, prints an info message about to-be loaded amount of metadata
     * @returns {Promise.<{metadata: (MetadataTypeMap | MetadataTypeItem), type: string}>} Promise of item map (single item for templated result)
     */
    static async retrieveRESTcollection(urlArray, concurrentRequests = 10, logAmountOfUrls = true) {
        if (logAmountOfUrls) {
            Util.logger.info(
                Util.getGrayMsg(
                    ` - ${urlArray?.length} ${this.definition.type}${
                        urlArray?.length === 1 ? '' : 's'
                    } found. Retrieving details...`
                )
            );
        }
        const rateLimit = pLimit(concurrentRequests);

        const metadataArr = urlArray.length
            ? await Promise.all(
                  urlArray.map(async (item) =>
                      rateLimit(async () => {
                          try {
                              return await this.client.rest.get(item.uri);
                          } catch (ex) {
                              return this.handleRESTErrors(ex, item.id);
                          }
                      })
                  )
              )
            : [];
        const results = {};
        for (const item of metadataArr) {
            const key = item[this.definition.keyField];
            results[key] = item;
        }
        return {
            metadata: results,
            type: this.definition.type,
        };
    }

    /**
     * helper for {@link this.retrieveRESTcollection}
     *
     * @param {RestError} ex exception
     * @param {string} id id or key of item
     * @returns {Promise.<any>} -
     */
    static async handleRESTErrors(ex, id) {
        // if the ID is too short, the system will throw the 400 error
        Util.logger.debug(` ☇ skipping ${this.definition.type} ${id}: ${ex.message} ${ex.code}`);

        return null;
    }
    /**
     * Used to execute a query/automation etc.
     *
     * @param {string} uri REST endpoint where the POST request should be sent
     * @param {string} key item key
     * @returns {Promise.<{key:string, response:string}>} metadata key and API response (OK or error)
     */
    static async executeREST(uri, key) {
        try {
            const response = await this.client.rest.post(uri, {}); // payload is empty for this request
            if (response === 'OK') {
                Util.logger.info(` - executed ${this.definition.type}: ${key}`);
            } else {
                throw new Error(response);
            }
            return { key, response };
        } catch (ex) {
            Util.logger.error(`Failed to execute ${this.definition.type} ${key}: ${ex.message}`);
        }
    }

    /**
     * Used to execute a query/automation etc.
     *
     * @param {MetadataTypeItem} [metadataEntry] single metadata entry
     * @returns {Promise.<{key:string, response:object}>} metadata key and API response
     */
    static async executeSOAP(metadataEntry) {
        const soapType = this.definition.soapType || this.definition.type;
        try {
            const response = await this.client.soap.perform(
                Util.capitalizeFirstLetter(soapType),
                'start',
                {
                    ObjectID: metadataEntry[this.definition.idField],
                }
            );
            if (response?.OverallStatus === 'OK') {
                Util.logger.info(
                    ` - executed ${this.definition.type}: ${
                        metadataEntry[this.definition.keyField]
                    }`
                );
            } else {
                throw new Error(response?.OverallStatus);
            }
            return { key: metadataEntry[this.definition.keyField], response };
        } catch (ex) {
            this._handleSOAPErrors(ex, 'executing', metadataEntry);
            return null;
        }
    }

    /**
     * helper for {@link MetadataType.retrieveREST} and {@link MetadataType.retrieveSOAP}
     *
     * @param {string|number} singleRetrieve key of single item to filter by
     * @param {MetadataTypeMap} metadataMap saved metadata
     * @returns {Promise.<void>} -
     */
    static async runDocumentOnRetrieve(singleRetrieve, metadataMap) {
        if (
            this.buObject &&
            this.properties.metaDataTypes.documentOnRetrieve.includes(this.definition.type)
        ) {
            if (!singleRetrieve || (singleRetrieve && !this.definition.documentInOneFile)) {
                const count = Object.keys(metadataMap).length;
                Util.logger.debug(
                    ` - Running document for ${count} record${count === 1 ? '' : 's'}`
                );
                await this.document(metadataMap);
            } else {
                Util.logger.info(
                    Util.getGrayMsg(
                        ` - Skipped running document because you supplied keys and ${this.definition.type} is documented in a single file for all.`
                    )
                );
            }
        }
    }

    /**
     * Builds map of metadata entries mapped to their keyfields
     *
     * @param {object} body json of response body
     * @param {string} [singleRetrieve] key of single item to filter by
     * @returns {MetadataTypeMap} keyField => metadata map
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
                if ('string' === typeof singleRetrieve && singleRetrieve.startsWith('id:')) {
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
     * @param {MetadataTypeItem} metadataEntry One entry of a metadataType
     * @param {string} fieldPath field path to be checked if it conforms to the definition (dot seperated if nested): 'fuu.bar'
     * @param {'isCreateable'|'isUpdateable'|'retrieving'|'template'} definitionProperty delete field if definitionProperty equals false for specified field. Options: [isCreateable | isUpdateable]
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
        let originHelper;
        if (origin) {
            originHelper = this.definition.fields[origin + '.%']
                ? origin + '.%'
                : origin + '.' + fieldPath;
        } else {
            originHelper = fieldPath;
        }

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
                    fieldContent,
                    subField,
                    definitionProperty,
                    originHelper
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
     *
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
     *
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
     *
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
     *
     * @static
     * @param {MetadataTypeItem} metadataEntry metadata entry
     * @param {boolean} [include] true: use definition.include / options.include; false=exclude: use definition.filter / options.exclude
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
     * @param {boolean} [include] true: use definition.include / options.include; false=exclude: use definition.filter / options.exclude
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
        // not possible to check r__folder_Path before postRetrieveTasks was run; handled in `isFilteredFolder()`
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
     * @param {MetadataTypeMap} results metadata results from deploy
     * @param {string} retrieveDir directory where metadata should be stored after deploy/retrieve
     * @param {string} [overrideType] for use when there is a subtype (such as folder-queries)
     * @param {TemplateMap} [templateVariables] variables to be replaced in the metadata
     * @returns {Promise.<MetadataTypeMap>} Promise of saved metadata
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

                savedResults[originalKey] = await this.saveToDisk(
                    results,
                    originalKey,
                    baseDir,
                    subtypeExtension,
                    templateVariables
                );
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
     *
     * @param {MetadataTypeMap} results metadata results from deploy
     * @param {string} originalKey key of metadata
     * @param {string[]} baseDir [retrieveDir, ...overrideType.split('-')]
     * @param {string} [subtypeExtension] e.g. ".asset-meta" or ".query-meta"
     * @param {TemplateMap} [templateVariables] variables to be replaced in the metadata
     * @returns {Promise.<MetadataTypeItem>} saved metadata
     */
    static async saveToDisk(results, originalKey, baseDir, subtypeExtension, templateVariables) {
        subtypeExtension ||= '.' + this.definition.type + '-meta';
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
            // normalize results[metadataEntry]
            results[originalKey] = postRetrieveData.json;

            if (Util.OPTIONS.like && !Util.fieldsLike(results[originalKey])) {
                Util.logger.debug(`Filtered ${originalKey} because of --like option`);
                return;
            }

            if (postRetrieveData.subFolder) {
                // very complex types have their own subfolder
                baseDir.push(...postRetrieveData.subFolder);
            }
            // save extracted scripts
            await Promise.all(
                postRetrieveData.codeArr.map(async (script) => {
                    const dir = [...baseDir];
                    if (script.subFolder) {
                        // some files shall be saved in yet a deeper subfolder
                        dir.push(...script.subFolder);
                    }
                    return File.writePrettyToFile(
                        dir,
                        script.fileName + subtypeExtension,
                        script.fileExt,
                        script.content,
                        templateVariables
                    );
                })
            );
        } else {
            // not a complex type, run the the entire JSON through templating
            // replace market values with template variable placeholders
            if (templateVariables) {
                results[originalKey] = Util.replaceByObject(
                    results[originalKey],
                    templateVariables
                );
            }
            if (Util.OPTIONS.like && !Util.fieldsLike(results[originalKey])) {
                Util.logger.debug(`Filtered ${originalKey} because of --like option`);
                return;
            }
        }

        // we dont store Id on local disk, but we need it for caching logic,
        // so its in retrieve but not in save. Here we put into the clone so that the original
        // object used for caching doesnt have the Id removed.

        const saveClone = structuredClone(results[originalKey]);
        if (!this.definition.keepId && this.definition.idField !== this.definition.keyField) {
            delete saveClone[this.definition.idField];
        }

        if (templateVariables) {
            this.keepTemplateFields(saveClone);
        } else {
            this.keepRetrieveFields(saveClone);
        }

        await File.writeJSONToFile(
            // manage subtypes
            baseDir,
            originalKey + subtypeExtension,
            saveClone
        );
        if (templateVariables) {
            Util.logger.info(
                `- templated ${this.definition.type}: ${saveClone[this.definition.nameField]}`
            );
        }

        return saveClone;
    }
    /**
     * helper for {@link MetadataType.buildDefinitionForNested}
     * searches extracted file for template variable names and applies the market values
     *
     * @param {string} code code from extracted code
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {string} code with markets applied
     */
    static applyTemplateValues(code, templateVariables) {
        // replace template variables with their values
        return Mustache.render(code, templateVariables, {}, ['{{{', '}}}']);
    }
    /**
     * helper for {@link MetadataType.buildTemplateForNested}
     * searches extracted file for template variable values and applies the market variable names
     *
     * @param {string} code code from extracted code
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {string} code with markets applied
     */
    static applyTemplateNames(code, templateVariables) {
        // replace template variables with their values
        return Util.replaceByObject(code, templateVariables);
    }
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
     * @returns {Promise.<string>} metadata in string form
     */
    static async readSecondaryFolder(templateDir, typeDirArr, templateName, fileName, ex) {
        // we just want to push the method into the catch here
        return;
    }
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
            if (!metadataStr) {
                throw new Error('File not found');
            }
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
                // only happening for types that use readSecondaryFolder (e.g. asset)
                // if we still have no metadataStr then we have to skip this metadata for all types and hence handle it outside of this catch
            }
            if (!metadataStr) {
                Util.logger.warn(
                    Util.getGrayMsg(
                        ` ☇ skipped ${this.definition.type} ${templateName}: template not found`
                    )
                );
                return;
            }
        }

        let metadata;
        try {
            // update all initial variables & create metadata object
            metadata = JSON.parse(this.applyTemplateValues(metadataStr, variables));
            typeDirArr = typeDirArr
                .map((el) => (el === templateName ? metadata[this.definition.keyField] : el))
                .map((el) => this.applyTemplateValues(el, variables));
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
     * @returns {string[]} formatted Error Message
     */
    static getErrorsREST(ex) {
        const errors = [];
        if (ex?.response?.status >= 400 && ex?.response?.status < 600) {
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
            } else if (ex.response.data) {
                errors.push(`Undefined Errors: ${JSON.stringify(ex.response.data)}`);
                Util.logger.debug(JSON.stringify(ex.response.data));
            } else {
                errors.push(`${ex.response.status} ${ex.response.statusText}`);
            }
            Util.logger.debug(JSON.stringify(ex.config));
        }
        return errors;
    }

    /**
     * Gets metadata cache with limited fields and does not store value to disk
     *
     * @param {MetadataTypeMap} [metadata] a list of type definitions
     * @param {boolean} [isDeploy] used to skip non-supported message during deploy
     * @returns {void}
     */
    static document(metadata, isDeploy) {
        if (!isDeploy) {
            Util.logger.error(`Documenting type ${this.definition.type} is not supported.`);
        }
    }

    /**
     * get name & key for provided id
     *
     * @param {string} id Identifier of metadata
     * @returns {Promise.<{key:string, name:string}>} key, name and path of metadata; null if not found
     */
    static async resolveId(id) {
        Util.logger.error(`resolveId type ${this.definition.type} is not supported.`);
        return;
    }

    /**
     * Delete a metadata item from the specified business unit
     *
     * @param {string} customerKey Identifier of data extension
     * @returns {Promise.<boolean>} deletion success status
     */
    static async deleteByKey(customerKey) {
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
     * @returns {Promise.<boolean>} deletion success flag
     */
    static async deleteByKeySOAP(customerKey, overrideKeyField, handleOutside) {
        const metadata = {};
        metadata[overrideKeyField || this.definition.keyField] = customerKey;
        const soapType = this.definition.soapType || this.definition.type;
        try {
            await this.client.soap.delete(Util.capitalizeFirstLetter(soapType), metadata, null);
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
     * @returns {Promise.<boolean>} deletion success flag
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
     * @param {boolean} [listBadKeys] do not print errors, used for badKeys()
     * @param {object} [buMetadata] Metadata of BU in local directory
     * @returns {Promise.<object>} Metadata of BU in local directory
     */
    static async readBUMetadataForType(readDir, listBadKeys, buMetadata) {
        buMetadata ||= {};
        readDir = File.normalizePath([readDir, this.definition.type]);
        try {
            if (await File.pathExists(readDir)) {
                // check if folder name is a valid metadataType, then check if the user limited to a certain type in the command params
                buMetadata[this.definition.type] = await this.getJsonFromFS(readDir, listBadKeys);
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
    static async getFilesToCommit(keyArr) {
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
    /**
     *
     * @param {string[]} keyArr customerkey of the metadata
     * @param {TypeKeyCombo} multiTypeKeyList list of all keys that need to be deployed
     * @param {TypeKeyCombo} notFoundList list of all keys that were not found
     * @param {boolean} isFirstCall will not gray out the log message for type/keys that you initially selected but only for their dependencies
     * @returns {Promise.<TypeKeyCombo>} list of all keys that need to be deployed
     */
    static async getDependentFiles(
        keyArr,
        multiTypeKeyList = {},
        notFoundList = {},
        isFirstCall = false
    ) {
        if (
            !Object.prototype.hasOwnProperty.call(this, 'create') &&
            !Object.prototype.hasOwnProperty.call(this, 'update')
        ) {
            Util.logger.info(
                Util.getGrayMsg(
                    ` ☇ skipping ${this.definition.type} (${keyArr.join(', ')}) as it is currently not supported to deploy it`
                )
            );
            return;
        }
        // initialize key array for current type unless it already exists
        multiTypeKeyList[this.definition.type] ||= [];
        notFoundList[this.definition.type] ||= [];

        keyArr = keyArr
            // make sure all keys are strings
            .map((key) => key + '')
            .filter(
                (key) =>
                    // make sure we don't retry components that we have already searched without result
                    !notFoundList[this.definition.type].includes(key) &&
                    // make sure we don't search for components that we have already found
                    !multiTypeKeyList[this.definition.type].includes(key)
            );
        if (!keyArr.length) {
            return;
        }
        const msg = ` - ${this.definition.type}: ${keyArr.join(', ')}`;
        Util.logger.info(isFirstCall ? msg : Util.getGrayMsg(msg));
        // get paths to jsons
        const filePaths = (await this.getFilesToCommit(keyArr))
            .filter(Boolean)
            .filter((path) => path.endsWith('.json'));

        /** @type {TypeKeyCombo} */
        const dependentTypeKeyCombo = {};
        for (const filePath of filePaths) {
            let metadataItem;
            try {
                metadataItem = await File.readJson(filePath);
            } catch {
                Util.logger.debug(
                    `- Could not read ${filePath} while trying to find dependencies. Skipping`
                );
                continue;
            }
            // store current key if JSON file was found; because otherwise we could not include it in the package anyways
            multiTypeKeyList[this.definition.type].push(
                metadataItem[this.definition.keyField] + ''
            );

            // get dependent keys for this type
            if (this.definition.dependencyGraph) {
                for (const depType in this.definition.dependencyGraph) {
                    MetadataTypeInfo[depType].properties = this.properties;
                    MetadataTypeInfo[depType].buObject = this.buObject;

                    const dependentKeyArr = [];
                    for (const fieldReference of this.definition.dependencyGraph[depType]) {
                        // ! this assumes we always have keys in this; will fail for list
                        const foundKeys = this.getNestedValue(
                            metadataItem,
                            fieldReference,
                            depType
                        );
                        if (foundKeys) {
                            dependentKeyArr.push(...foundKeys);
                        }
                    }
                    if (dependentKeyArr.length) {
                        dependentTypeKeyCombo[depType] ||= [];
                        dependentTypeKeyCombo[depType].push(...dependentKeyArr);
                    }
                }
            }
            this.getDependentFilesExtra(metadataItem, dependentTypeKeyCombo);
        }
        if (Object.keys(dependentTypeKeyCombo).length) {
            for (const type in dependentTypeKeyCombo) {
                // ensure we don't have duplicates
                dependentTypeKeyCombo[type] = [...new Set(dependentTypeKeyCombo[type])];
                // try to read the jsons for those dependant keys
                await MetadataTypeInfo[type].getDependentFiles(
                    dependentTypeKeyCombo[type],
                    multiTypeKeyList,
                    notFoundList
                );
            }
        } else {
            Util.logger.verbose(
                ` - ${this.definition.type} ${keyArr.join(', ')}: No new dependencies found`
            );
        }
        const notFound = keyArr.filter(
            (key) => !multiTypeKeyList[this.definition.type].includes(key)
        );
        if (notFound && notFound.length) {
            Util.logger.warn(
                Util.getGrayMsg(
                    `    ☇ skipping ${this.definition.type} dependenc${notFound.length === 1 ? 'y' : 'ies'} ${notFound.join(', ')}: Not found on your in your project folder.`
                )
            );
            // make sure we don't search for it twice
            notFoundList[this.definition.type] ||= [];
            notFoundList[this.definition.type].push(...notFound);
        }
        return multiTypeKeyList;
    }

    /**
     * optional helper for {@link this.getDependentTypes}
     *
     * @param {object} metadataItem metadata json read from filesystem
     * @param {TypeKeyCombo} dependentTypeKeyCombo list started in this.getDependentTypes
     */
    static getDependentFilesExtra(metadataItem, dependentTypeKeyCombo) {}

    /**
     * helper for {@link MetadataType.getDependentFiles}
     *
     * @param {MetadataTypeItem} obj the metadataItem to search in
     * @param {string} nestedKey e.g "my.field.here"
     * @param {string} dependentType used for types that need custom handling
     * @returns {(string)[]} result array or null if nothing was found
     */
    static getNestedValue(obj, nestedKey, dependentType) {
        const nestedKeyParts = nestedKey.split('.');
        const result = this.getNestedValueHelper(obj, nestedKeyParts, dependentType);

        // remove duplicates and null values
        const resultArr = (Array.isArray(result) ? [...new Set(result)] : [result]).filter(Boolean);
        // return array if entries were found or null otherwise
        return resultArr.length ? resultArr : null;
    }

    /**
     * helper for {@link MetadataType.getNestedValue}
     *
     * @param {any} obj the metadataItem to search in (or the result)
     * @param {string[]} nestedKeyParts key in dot-notation split into parts
     * @param {string} dependentType used for types that need custom handling
     * @returns {(string) | (string)[]} result
     */
    static getNestedValueHelper(obj, nestedKeyParts, dependentType) {
        if (nestedKeyParts.length == 0) {
            // key was found; append '' to ensure we always return a string
            return obj + '';
        }
        // get most left key
        const key = nestedKeyParts.shift();
        if (!obj[key]) {
            // key was not found
            return;
        }
        return Array.isArray(obj[key])
            ? obj[key].flatMap((x) =>
                  this.getNestedValueHelper(x, [...nestedKeyParts], dependentType)
              )
            : this.getNestedValueHelper(obj[key], [...nestedKeyParts], dependentType);
    }

    /**
     *
     * @param {MetadataTypeMap} metadataMap metadata mapped by their keyField
     * @returns {string[]} list of keys
     */
    static getKeysForFixing(metadataMap) {
        const keysForDeploy = [];
        if (!metadataMap) {
            // if a type was skipped e.g. because it shall only be looked at on the parent then we would expect metadataMap to be undefined
            return keysForDeploy;
        }
        if (Object.keys(metadataMap).length) {
            Util.logger.info(
                `Searching for ${this.definition.type} keys among downloaded items that need fixing:`
            );
            Util.OPTIONS.keySuffix = Util.OPTIONS.keySuffix ? Util.OPTIONS.keySuffix.trim() : '';
            const maxKeyLength = this.definition.maxKeyLength || 36;

            for (const item of Object.values(metadataMap)) {
                if (this.isFiltered(item, true) || this.isFiltered(item, false)) {
                    // we would not have saved these items to disk but they exist in the cache and hence need to be skipped here

                    continue;
                }
                if (
                    (item[this.definition.nameField].endsWith(Util.OPTIONS.keySuffix) &&
                        item[this.definition.nameField].length > maxKeyLength) ||
                    (!item[this.definition.nameField].endsWith(Util.OPTIONS.keySuffix) &&
                        item[this.definition.nameField].length + Util.OPTIONS.keySuffix.length >
                            maxKeyLength)
                ) {
                    Util.logger.warn(
                        `Name of the item ${item[this.definition.keyField]} (${
                            item[this.definition.nameField]
                        }) is too long for a key${Util.OPTIONS.keySuffix.length ? ' (including the suffix ' + Util.OPTIONS.keySuffix + ')' : ''}. Consider renaming your item. Key will be equal first ${maxKeyLength} characters of the name`
                    );
                }
                const newKey = this.getNewKey(this.definition.nameField, item, maxKeyLength);
                if (newKey != item[this.definition.keyField] && !this.definition.keyIsFixed) {
                    // add key but make sure to turn it into string or else numeric keys will be filtered later
                    keysForDeploy.push(item[this.definition.keyField] + '');
                    Util.logger.info(
                        ` - added ${this.definition.type} to fixKey queue: ${
                            item[this.definition.keyField]
                        } >> ${newKey}`
                    );
                } else {
                    Util.logger.info(
                        Util.getGrayMsg(
                            ` ☇ skipping ${this.definition.type} ${
                                item[this.definition.keyField]
                            }: key does not need to be updated`
                        )
                    );
                }
            }
            Util.logger.info(`Found ${keysForDeploy.length} ${this.definition.type} keys to fix`);
        }
        return keysForDeploy;
    }
    /**
     * helper for getKeysForFixing and createOrUpdate
     *
     * @param {string} baseField name of the field to start the new key with
     * @param {MetadataTypeItem} metadataItem -
     * @param {number} maxKeyLength -
     * @returns {string} newKey
     */
    static getNewKey(baseField, metadataItem, maxKeyLength) {
        const keySuffix = Util.OPTIONS.keySuffix;
        let newKey;
        newKey = (metadataItem[baseField] + '').trim().slice(0, maxKeyLength).trim();
        if (keySuffix.length && !newKey.endsWith(keySuffix)) {
            newKey =
                (metadataItem[baseField] + '')
                    .trim()
                    .slice(0, maxKeyLength - keySuffix.length)
                    .trim() + keySuffix;
        }

        return newKey;
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
 * @type {SDK}
 */
MetadataType.client = undefined;
/**
 * @type {Mcdevrc}
 */
MetadataType.properties = null;
/**
 * @type {string}
 */
MetadataType.subType = null;
/**
 * @type {BuObject}
 */
MetadataType.buObject = null;

export default MetadataType;
