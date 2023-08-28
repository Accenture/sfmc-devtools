'use strict';

const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const File = require('../util/file');
const cache = require('../util/cache');

/**
 * MobileMessage MetadataType
 *
 * @augments MetadataType
 */
class MobileMessage extends MetadataType {
    /**
     * Retrieves Metadata of Mobile Keywords
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void} [_] unused parameter
     * @param {void} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<TYPE.MetadataTypeMapObj> | void} Promise of metadata
     */
    static retrieve(retrieveDir, _, __, key) {
        if (key && key.startsWith('id:')) {
            // if key starts with id: remove it to be compatible with other legacy API types (MetadataType.postCreateTasks_legacyApi)
            key = key.slice(3);
        }
        try {
            return super.retrieveREST(
                retrieveDir,
                '/legacy/v1/beta/mobile/message/' +
                    (key ||
                        '?view=details&version=3&$sort=lastUpdated%20DESC&$where=isTest%20eq%200%20and%20status%20neq%20%27Archive%27'),
                null,
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
     * Retrieves event definition metadata for caching
     *
     * @param {void} _ parameter not used
     * @param {void} __ parameter not used
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of metadata
     */
    static retrieveForCache(_, __, key) {
        return this.retrieve(null, null, null, key);
    }

    /**
     * Updates a single item
     *
     * @param {TYPE.MetadataTypeItem} metadata a single item
     * @returns {Promise} Promise
     */
    static update(metadata) {
        return super.updateREST(
            metadata,
            '/legacy/v1/beta/mobile/message/' + metadata[this.definition.idField],
            'post' // upsert API, post for insert and update!
        );
    }

    /**
     * Creates a single item
     *
     * @param {TYPE.MetadataTypeItem} metadata a single item
     * @returns {Promise} Promise
     */
    static create(metadata) {
        return super.createREST(metadata, '/legacy/v1/beta/mobile/message/');
    }
    /**
     * helper for {@link MobileMessage.preDeployTasks} that loads extracted code content back into JSON
     *
     * @param {TYPE.MetadataTypeItem} metadata a single definition
     * @param {string} deployDir directory of deploy files
     * @param {string} [templateName] name of the template used to built defintion (prior applying templating)
     * @returns {Promise.<string>} code
     */
    static async _mergeCode(metadata, deployDir, templateName) {
        const fileExtension = 'amp';
        templateName ||= metadata[this.definition.keyField];
        const codePath = File.normalizePath([
            deployDir,
            this.definition.type,
            templateName + '.' + this.definition.type + '-meta',
        ]);

        if (await File.pathExists(codePath + '.' + fileExtension)) {
            return await File.readFilteredFilename(
                [deployDir, this.definition.type],
                templateName + '.' + this.definition.type + '-meta',
                fileExtension
            );
        } else {
            throw new Error(`Could not find ${codePath}.${fileExtension}`);
        }
    }
    /**
     * helper for {@link MobileMessage.postRetrieveTasks} and {@link MobileMessage._buildForNested}
     *
     * @param {string} code the code of the file
     * @returns {{fileExt:string,code:string}} returns found extension and file content
     */
    static prepExtractedCode(code) {
        const fileExt = 'amp';

        return { fileExt, code };
    }

    /**
     * should return only the json for all but asset, query and script that are saved as multiple files
     * additionally, the documentation for dataExtension and automation should be returned
     *
     * @param {string[]} keyArr customerkey of the metadata
     * @returns {string[]} list of all files that need to be committed in a flat array ['path/file1.ext', 'path/file2.ext']
     */
    static getFilesToCommit(keyArr) {
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

    /**
     * manages post retrieve steps
     *
     * @param {TYPE.MetadataTypeItem} metadata a single query
     * @returns {TYPE.CodeExtractItem} Array with one metadata object and one query string
     */
    static postRetrieveTasks(metadata) {
        // mobileCode
        try {
            cache.searchForField('mobileCode', metadata.code.code, 'code', 'code');
        } catch (ex) {
            Util.logger.warn(
                ` - ${this.definition.type} ${metadata[this.definition.nameField]} (${
                    metadata[this.definition.keyField]
                }): ${ex.message}.`
            );
        }

        // mobileKeyword
        try {
            for (const attr of ['keyword', 'subscriptionKeyword', 'nextKeyword']) {
                if (metadata[attr]?.id) {
                    metadata[attr] = {
                        c__codeKeyword: cache.searchForField(
                            'mobileKeyword',
                            metadata[attr].id,
                            'id',
                            'c__codeKeyword'
                        ),
                    };
                }
            }
        } catch (ex) {
            Util.logger.warn(
                ` - ${this.definition.type} ${metadata[this.definition.nameField]} (${
                    metadata[this.definition.keyField]
                }): ${ex.message}.`
            );
        }
        // campaign
        try {
            if (Array.isArray(metadata.campaigns)) {
                metadata.c__campaignNames = [];

                for (const campaign of metadata.campaigns) {
                    try {
                        // test if exists
                        const test = cache.getByKey('campaign', campaign.name);
                        if (!test) {
                            throw new Error(`campaign ${campaign.name} not found in cache`);
                        }

                        metadata.c__campaignNames.push(campaign.name);
                    } catch (ex) {
                        Util.logger.warn(
                            ` - ${this.definition.type} ${metadata[this.definition.nameField]}: ${
                                ex.message
                            }`
                        );
                    }
                }
                delete metadata.campaigns;
            }
        } catch (ex) {
            Util.logger.warn(
                ` - ${this.definition.type} ${metadata[this.definition.nameField]} (${
                    metadata[this.definition.keyField]
                }): ${ex.message}.`
            );
        }

        if (metadata.smsTriggeredSendDefinitionId !== '00000000-0000-0000-0000-000000000000') {
            // TODO unknown type
        }

        if (metadata.triggeredSendName) {
            // TODO unknown type
        }

        if (metadata.messageObjectId) {
            // TODO unknown type
        }

        if (metadata.template?.id) {
            // TODO unknown type
        }

        // extract text/code
        const codeArr = [];
        // keep between tags
        const { fileExt, code } = this.prepExtractedCode(metadata.text);
        delete metadata.text;
        codeArr.push({
            subFolder: null,
            fileName: metadata[this.definition.keyField],
            fileExt: fileExt,
            content: code,
        });

        return { json: metadata, codeArr: codeArr, subFolder: null };
    }

    /**
     * prepares an event definition for deployment
     *
     * @param {TYPE.MetadataTypeItem} metadata a single MobileMessage
     * @param {string} deployDir directory of deploy files
     * @returns {TYPE.MetadataTypeItem} Promise
     */
    static async preDeployTasks(metadata, deployDir) {
        // mobileCode
        const code = cache.getByKey('mobileCode', metadata.code.code);
        if (!code) {
            throw new Error(`mobileCode ${metadata.code.code} not found in cache`);
        }
        metadata.code = code;

        // mobileKeyword
        for (const attr of ['keyword', 'subscriptionKeyword', 'nextKeyword']) {
            if (metadata[attr]?.c__codeKeyword) {
                const keywordObj = cache.getByKey('mobileKeyword', metadata[attr].c__codeKeyword);
                if (!keywordObj) {
                    throw new Error(
                        `mobileKeyword ${metadata[attr].c__codeKeyword} not found in cache`
                    );
                }
                metadata[attr] = keywordObj;
            }
        }

        // campaign
        if (Array.isArray(metadata.c__campaignNames)) {
            metadata.campaigns = [];

            for (const campaignName of metadata.c__campaignNames) {
                const campaign = cache.getByKey('campaign', campaignName);
                if (!campaign) {
                    throw new Error(`campaign ${campaignName} not found in cache`);
                }
                metadata.campaigns.push({
                    id: campaign.id,
                    name: campaignName,
                    display: {
                        name: 'color',
                        value: campaign.color,
                    },
                });
            }
            delete metadata.c__campaignNames;
        }

        if (metadata.smsTriggeredSendDefinitionId !== '00000000-0000-0000-0000-000000000000') {
            // TODO unknown type
        }

        // code
        metadata.text = await this._mergeCode(metadata, deployDir);

        return metadata;
    }
    /**
     * helper for {@link MetadataType.createREST}
     *
     * @param {TYPE.MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {object} apiResponse varies depending on the API call
     * @returns {void}
     */
    static async postCreateTasks(metadataEntry, apiResponse) {
        await super.postDeployTasks_legacyApi(metadataEntry, apiResponse);
    }
    /**
     * helper for {@link MetadataType.updateREST}
     *
     * @param {TYPE.MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {object} apiResponse varies depending on the API call
     * @returns {void}
     */
    static async postUpdateTasks(metadataEntry, apiResponse) {
        await super.postDeployTasks_legacyApi(metadataEntry, apiResponse);
    }
    /**
     * helper for {@link MetadataType.buildDefinition}
     * handles extracted code if any are found for complex types
     *
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string|string[]} targetDir (List of) Directory where built definitions will be saved
     * @param {TYPE.MetadataTypeItem} metadata main JSON file that was read from file system
     * @param {TYPE.TemplateMap} templateVariables variables to be replaced in the metadata
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
     * helper for {@link MobileMessage.buildTemplateForNested} / {@link MobileMessage.buildDefinitionForNested}
     * handles extracted code if any are found for complex types
     *
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string|string[]} targetDir (List of) Directory where built definitions will be saved
     * @param {TYPE.MetadataTypeItem} metadata main JSON file that was read from file system
     * @param {TYPE.TemplateMap} templateVariables variables to be replaced in the metadata
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
        // try to remove script tags and decide on file extension (html/ssjs)
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
                }-meta.amp.`
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
     * Delete a metadata item from the specified business unit
     * ! the endpoint expects the ID and not a key but for mcdev in this case key==id
     *
     * @param {string} id Identifier of item
     * @returns {Promise.<boolean>} deletion success status
     */
    static deleteByKey(id) {
        Util.logger.info(
            ' - Note: As long as the provided API key once existed, you will not see an error even if the mobileMessage is already deleted.'
        );
        return super.deleteByKeyREST('/legacy/v1/beta/mobile/message/' + id, id, false);
    }
}

// Assign definition to static attributes
MobileMessage.definition = require('../MetadataTypeDefinitions').mobileMessage;

module.exports = MobileMessage;
