'use strict';

import MetadataType from './MetadataType.js';
import { Util } from '../util/util.js';
import File from '../util/file.js';
import cache from '../util/cache.js';

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
 * MobileKeyword MetadataType
 *
 * @augments MetadataType
 */
class MobileKeyword extends MetadataType {
    /**
     * Retrieves Metadata of Mobile Keywords
     * Endpoint /legacy/v1/beta/mobile/keyword/ return all Mobile Keywords with all details.
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static retrieve(retrieveDir, _, __, key) {
        try {
            let queryParams;
            [key, queryParams] = this.#getRetrieveKeyAndUrl(key);

            return super.retrieveREST(
                retrieveDir,
                '/legacy/v1/beta/mobile/keyword/' + queryParams,
                null,
                key
            );
        } catch (ex) {
            // if the mobileMessage does not exist, the API returns the error "Request failed with status code 400 (ERR_BAD_REQUEST)" which would otherwise bring execution to a hold
            if (key && ex.code === 'ERR_BAD_REQUEST') {
                Util.logger.info(
                    `Downloaded: ${this.definition.type} (0)${Util.getKeysString(key)}`
                );
                this.postDeleteTasks(key);
            } else {
                throw ex;
            }
        }
        return;
    }

    /**
     * helper for {@link parseResponseBody} that creates a custom key field for this type based on mobileCode and keyword
     *
     * @param {MetadataTypeItem} metadata single item
     */
    static createCustomKeyField(metadata) {
        metadata.c__codeKeyword = metadata.code.code + '.' + metadata.keyword;
    }

    /**
     * helper for {@link MobileKeyword.preDeployTasks} and {@link MobileKeyword.createOrUpdate} to ensure we have code & keyword properly set
     *
     * @param {MetadataTypeItem} metadata single item
     */
    static #setCodeAndKeyword(metadata) {
        const [code, keyword] = metadata.c__codeKeyword.split('.');

        if (!code || !metadata.r__mobileCode_key || code !== metadata.r__mobileCode_key) {
            throw new Error(
                `r__mobileCode_key (${metadata.r__mobileCode_key}) does not match code (${code}) in c__codeKeyword (${metadata.c__codeKeyword}).`
            );
        }

        // mobileCode
        metadata.code = {
            id: cache.searchForField('mobileCode', code, 'code', 'id'),
        };

        // keyword
        metadata.keyword = keyword;
    }

    /**
     * helper for {@link MetadataType.upsert}
     *
     * @param {MetadataTypeMap} metadataMap list of metadata
     * @param {string} metadataKey key of item we are looking at
     * @param {boolean} hasError error flag from previous code
     * @param {MetadataTypeItemDiff[]} metadataToUpdate list of items to update
     * @param {MetadataTypeItem[]} metadataToCreate list of items to create
     * @returns {Promise.<'create'|'update'|'skip'>} action to take
     */
    static async createOrUpdate(
        metadataMap,
        metadataKey,
        hasError,
        metadataToUpdate,
        metadataToCreate
    ) {
        const createOrUpdateAction = await super.createOrUpdate(
            metadataMap,
            metadataKey,
            hasError,
            metadataToUpdate,
            metadataToCreate
        );
        if (createOrUpdateAction === 'update') {
            // in case --changeKeyField or --changeKeyValue was used, let's ensure we set code & keyword here again
            this.#setCodeAndKeyword(metadataMap[metadataKey]);
        }
        return createOrUpdateAction;
    }

    /**
     * Retrieves event definition metadata for caching
     *
     * @param {void | string[]} [_] parameter not used
     * @param {void | string[]} [__] parameter not used
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static retrieveForCache(_, __, key) {
        return this.retrieve(null, null, null, key);
    }

    /**
     * retrieve an item and create a template from it
     *
     * @param {string} templateDir Directory where retrieved metadata directory will be saved
     * @param {string} key name of the metadata file
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {Promise.<MetadataTypeItemObj>} Promise of metadata
     */
    static async retrieveAsTemplate(templateDir, key, templateVariables) {
        try {
            let queryParams;
            [key, queryParams] = this.#getRetrieveKeyAndUrl(key);

            return super.retrieveTemplateREST(
                templateDir,
                `/legacy/v1/beta/mobile/keyword/` + queryParams,
                templateVariables,
                key
            );
        } catch (ex) {
            // if the mobileMessage does not exist, the API returns the error "Request failed with status code 400 (ERR_BAD_REQUEST)" which would otherwise bring execution to a hold
            if (key && ex.code === 'ERR_BAD_REQUEST') {
                Util.logger.info(
                    `Downloaded: ${this.definition.type} (0)${Util.getKeysString(key)}`
                );
            } else {
                throw ex;
            }
        }
    }

    /**
     * helper for {@link MobileKeyword.retrieve} and {@link MobileKeyword.retrieveAsTemplate}
     *
     * @param {string} key customer key of single item to retrieve / name of the metadata file
     * @returns {Array} key, queryParams
     */
    static #getRetrieveKeyAndUrl(key) {
        let queryParams;
        if (key) {
            if (key.startsWith('id:')) {
                // overwrite queryParams
                queryParams = key.slice(3);
            } else if (key.includes('.')) {
                // keywords are always uppercased
                key = key.toUpperCase();
                // format: code.keyword
                const [code, keyword] = key.split('.');
                queryParams = `?view=simple&$where=keyword%20eq%20%27${keyword}%27%20and%code%20eq%20%27${code}%27%20`;
            } else {
                throw new Error(
                    `key ${key} has unexpected format. Expected 'code.keyword' or 'id:yourId'`
                );
            }
        } else {
            queryParams = '?view=simple';
        }
        return [key, queryParams];
    }

    /**
     * Creates a single item
     *
     * @param {MetadataTypeItem} metadata a single item
     * @returns {Promise} Promise
     */
    static create(metadata) {
        return super.createREST(metadata, '/legacy/v1/beta/mobile/keyword/');
    }

    /**
     * Updates a single item
     *
     * @param {MetadataTypeItem} metadata a single item
     * @returns {Promise} Promise
     */
    static update(metadata) {
        return super.updateREST(
            metadata,
            '/legacy/v1/beta/mobile/keyword/' + metadata[this.definition.idField],
            'post' // upsert API, post for insert and update!
        );
    }

    /**
     * manages post retrieve steps
     *
     * @param {MetadataTypeItem} metadata a single item
     * @returns {CodeExtractItem | MetadataTypeItem | void} Array with one metadata object and one ssjs string; or single metadata object; nothing if filtered
     */
    static postRetrieveTasks(metadata) {
        try {
            metadata.r__mobileCode_key = cache.searchForField(
                'mobileCode',
                metadata.code.code,
                'code',
                'code'
            );
        } catch {
            // in case the the mobileCode cannot be found, do not save this keyword as its no longer accessible in the UI either
            Util.logger.debug(
                ` - skipping ${this.definition.type} ${
                    metadata[this.definition.keyField]
                }. Could not find parent mobileCode ${metadata.code.code}`
            );
            return;
        }

        if (metadata.responseMessage) {
            // extract message body
            const codeArr = [];
            // keep between tags
            const { fileExt, code } = this.prepExtractedCode(metadata.responseMessage);
            delete metadata.responseMessage;
            codeArr.push({
                subFolder: null,
                fileName: metadata[this.definition.keyField],
                fileExt: fileExt,
                content: code,
            });
            return { json: metadata, codeArr: codeArr, subFolder: null };
        } else {
            return metadata;
        }
    }

    /**
     * helper for {@link MobileKeyword.postRetrieveTasks} and {@link MobileKeyword._buildForNested}
     *
     * @param {string} metadataScript the code of the file
     * @returns {{fileExt:string,code:string}} returns found extension and file content
     */
    static prepExtractedCode(metadataScript) {
        const code = metadataScript;
        const fileExt = 'amp';

        return { fileExt, code };
    }

    /**
     * helper for {@link MetadataType.buildDefinition}
     * handles extracted code if any are found for complex types
     *
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string|string[]} targetDir (List of) Directory where built definitions will be saved
     * @param {MetadataTypeItem} metadata main JSON file that was read from file system
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @param {string} templateName name of the template to be built
     * @returns {Promise.<string[][]>} list of extracted files with path-parts provided as an array
     */
    static buildDefinitionForNested(
        templateDir,
        targetDir,
        metadata,
        templateVariables,
        templateName
    ) {
        return this._buildForNested(
            templateDir,
            targetDir,
            metadata,
            templateVariables,
            templateName,
            'definition'
        );
    }

    /**
     * helper for {@link MetadataType.buildTemplate}
     * handles extracted code if any are found for complex types
     *
     * @example scripts are saved as 1 json and 1 ssjs file. both files need to be run through templating
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
        return this._buildForNested(
            templateDir,
            targetDir,
            metadata,
            templateVariables,
            templateName,
            'template'
        );
    }

    /**
     * helper for {@link MobileKeyword.buildTemplateForNested} / {@link MobileKeyword.buildDefinitionForNested}
     * handles extracted code if any are found for complex types
     *
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string|string[]} targetDir (List of) Directory where built definitions will be saved
     * @param {MetadataTypeItem} metadata main JSON file that was read from file system
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @param {string} templateName name of the template to be built
     * @param {'definition'|'template'} mode defines what we use this helper for
     * @returns {Promise.<string[][]>} list of extracted files with path-parts provided as an array
     */
    static async _buildForNested(
        templateDir,
        targetDir,
        metadata,
        templateVariables,
        templateName,
        mode
    ) {
        // get code from filesystem
        let code = await this._mergeCode(metadata, templateDir, templateName);
        if (!code) {
            return null;
        }
        const file = this.prepExtractedCode(code);
        const fileExt = file.fileExt;
        code = file.code;
        // apply templating
        try {
            if (mode === 'definition') {
                // replace template variables with their values
                code = this.applyTemplateValues(code, templateVariables);
            } else if (mode === 'template') {
                // replace template values with corresponding variable names
                code = this.applyTemplateNames(code, templateVariables);
            }
        } catch {
            throw new Error(
                `${this.definition.type}:: Error applying template variables on ${
                    templateName + '.' + this.definition.type
                }-meta.${fileExt}.`
            );
        }

        // write to file
        const targetDirArr = Array.isArray(targetDir) ? targetDir : [targetDir];
        const nestedFilePaths = [];

        // keep old name if creating templates, otherwise use new name
        const fileName = mode === 'definition' ? metadata[this.definition.keyField] : templateName;

        for (const targetDir of targetDirArr) {
            File.writeToFile(
                [targetDir, this.definition.type],
                fileName + '.' + this.definition.type + '-meta',
                fileExt,
                code
            );
            nestedFilePaths.push([
                targetDir,
                this.definition.type,
                fileName + '.' + this.definition.type + '-meta.' + fileExt,
            ]);
        }
        return nestedFilePaths;
    }

    /**
     * prepares an event definition for deployment
     *
     * @param {MetadataTypeItem} metadata a single MobileKeyword
     * @param {string} deployDir directory of deploy files
     * @returns {Promise.<MetadataTypeItem>} Promise
     */
    static async preDeployTasks(metadata, deployDir) {
        // code
        metadata.responseMessage = await this._mergeCode(metadata, deployDir);

        if (metadata.responseMessage && metadata.keywordType === 'NORMAL') {
            throw new Error(
                `Custom Response Text is not supported for keywords of type 'NORMAL'. Please remove the .amp file or change the keywordType to 'STOP' or 'INFO'.`
            );
        }
        if (!metadata.companyName && metadata.keywordType !== 'NORMAL') {
            metadata.companyName = 'IGNORED';
            Util.logger.debug(
                ` - No companyName found for keyword ${
                    metadata[this.definition.keyField]
                }. Setting to IGNORED.`
            );
        }

        this.#setCodeAndKeyword(metadata);
        return metadata;
    }

    /**
     * helper for {@link MetadataType.createREST}
     *
     * @param {MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {object} apiResponse varies depending on the API call
     * @returns {Promise.<object>} apiResponse
     */
    static async postCreateTasks(metadataEntry, apiResponse) {
        await super.postDeployTasks_legacyApi(metadataEntry, apiResponse);

        return apiResponse;
    }

    /**
     * helper for {@link MetadataType.updateREST}
     *
     * @param {MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {object} apiResponse varies depending on the API call
     * @returns {Promise.<object>} apiResponse, potentially modified
     */
    static async postUpdateTasks(metadataEntry, apiResponse) {
        await super.postDeployTasks_legacyApi(metadataEntry, apiResponse);
        return apiResponse;
    }

    /**
     * helper for {@link MobileKeyword.preDeployTasks} that loads extracted code content back into JSON
     *
     * @param {MetadataTypeItem} metadata a single definition
     * @param {string} deployDir directory of deploy files
     * @param {string} [templateName] name of the template used to built defintion (prior applying templating)
     * @returns {Promise.<string>} content for metadata.script
     */
    static async _mergeCode(metadata, deployDir, templateName) {
        templateName ||= metadata[this.definition.keyField];
        const codePath = File.normalizePath([
            deployDir,
            this.definition.type,
            templateName + '.' + this.definition.type + '-meta',
        ]);

        if (await File.pathExists(codePath + '.amp')) {
            return await File.readFilteredFilename(
                [deployDir, this.definition.type],
                templateName + '.' + this.definition.type + '-meta',
                'amp'
            );
        } else {
            // keeep this as a debug message, as it is optional and hence not an error
            Util.logger.debug(`Could not find ${codePath}.amp`);
            return null;
        }
    }

    /**
     * Delete a metadata item from the specified business unit
     *
     * @param {string} key Identifier of item
     * @returns {Promise.<boolean>} deletion success status
     */
    static async deleteByKey(key) {
        // get id from cache
        const { metadata } = await this.retrieveForCache(undefined, undefined, key);
        if (!metadata[key]) {
            Util.logger.error(` - mobileKeyword ${key} not found`);
            return false;
        }
        const id = metadata[key][this.definition.idField];
        // execute delete
        Util.logger.info(
            ' - Note: As long as the provided API key once existed, you will not see an error even if the mobileKeyword is already deleted.'
        );
        return super.deleteByKeyREST('/legacy/v1/beta/mobile/keyword/' + id, key, false);
    }

    /**
     * clean up after deleting a metadata item
     *
     * @param {string} customerKey Identifier of metadata item
     * @returns {Promise.<void>} -
     */
    static async postDeleteTasks(customerKey) {
        // delete local copy: retrieve/cred/bu/type/...-meta.json
        // delete local copy: retrieve/cred/bu/type/...-meta.amp
        super.postDeleteTasks(customerKey, [`${this.definition.type}-meta.amp`]);
    }

    /**
     * should return only the json for all but asset, query and script that are saved as multiple files
     * additionally, the documentation for dataExtension and automation should be returned
     *
     * @param {string[]} keyArr customerkey of the metadata
     * @returns {Promise.<string[]>} list of all files that need to be committed in a flat array ['path/file1.ext', 'path/file2.ext']
     */
    static async getFilesToCommit(keyArr) {
        const path = File.normalizePath([
            this.properties.directories.retrieve,
            this.buObject.credential,
            this.buObject.businessUnit,
            this.definition.type,
        ]);

        const fileList = keyArr.flatMap((key) => [
            File.normalizePath([path, `${key}.${this.definition.type}-meta.json`]),
            File.normalizePath([path, `${key}.${this.definition.type}-meta.amp`]),
        ]);
        return fileList;
    }
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
MobileKeyword.definition = MetadataTypeDefinitions.mobileKeyword;

export default MobileKeyword;
