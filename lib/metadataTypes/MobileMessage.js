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
        this.upgradeGetBulk();
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
     * helper for {@link MobileMessage.retrieve} and {@link MobileMessage.retrieveForCache}
     */
    static upgradeGetBulk() {
        this.getBulkBackup ||= this.client.rest.getBulk;
        this.client.rest.getBulk = this.getBulkForLegacyApi.bind(this.client.rest);
    }

    /**
     * Method that makes paginated GET API Requests using $pageSize and $page parameters
     * TODO: remove before release in favor of upgrading SFMC-SDK
     *
     * @param {string} url of the resource to retrieve
     * @param {number} [pageSize] of the response, defaults to 50
     * @param {'items'|'definitions'|'entry'} [iteratorField] attribute of the response to iterate over
     * @returns {Promise.<object>} API response combined items
     */
    static async getBulkForLegacyApi(url, pageSize, iteratorField) {
        let page = 1;
        const baseUrl = url.split('?')[0];
        const isTransactionalMessageApi = this.isTransactionalMessageApi(baseUrl);
        const isLegacyApi = baseUrl && baseUrl.startsWith('/legacy/v1/');
        const queryParams = new URLSearchParams(url.split('?')[1]);
        let collector;
        let shouldPaginate = false;
        let pageSizeName = '$pageSize';
        let pageName = '$page';
        let countName = 'count';
        if (isLegacyApi) {
            pageSizeName = '$top';
            pageName = '$skip';
            countName = 'totalResults';
            page = 0; // index starts with 0 for mobileMessage
            if (pageSize != 50) {
                // values other than 50 are ignore by at least some of the sub-endpoints; while others have 50 as the maximum.
                pageSize = 50;
            }
        }
        queryParams.set(pageSizeName, Number(pageSize || 50).toString());
        do {
            queryParams.set(pageName, Number(page).toString());
            const temp = await this._apiRequest(
                {
                    method: 'GET',
                    url: baseUrl + '?' + decodeURIComponent(queryParams.toString()),
                },
                this.options.requestAttempts
            );
            if (!iteratorField) {
                if (Array.isArray(temp.items)) {
                    iteratorField = 'items';
                } else if (Array.isArray(temp.definitions)) {
                    iteratorField = 'definitions';
                } else if (Array.isArray(temp.entry)) {
                    iteratorField = 'entry';
                } else {
                    throw new TypeError('Could not find an array to iterate over');
                }
            }
            if (collector && Array.isArray(temp[iteratorField])) {
                collector[iteratorField].push(...temp[iteratorField]);
            } else if (collector == null) {
                collector = temp;
            }
            if (
                Array.isArray(collector[iteratorField]) &&
                collector[iteratorField].length >= temp[countName] &&
                (!isTransactionalMessageApi ||
                    (isTransactionalMessageApi && temp[countName] != temp[pageSizeName]))
            ) {
                // ! the transactional message API returns a value for "count" that represents the currently returned number of records, instead of the total amount. checking for count != pageSize is a workaround for this
                // * opened Support Case #43988240 for this issue
                shouldPaginate = false;
            } else {
                page++;
                shouldPaginate = true;
                if (this.options?.eventHandlers?.onLoop) {
                    this.options.eventHandlers.onLoop(null, collector?.[iteratorField]);
                }
            }
        } while (shouldPaginate);
        return collector;
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
     * helper for {@link preDeployTasks} that loads extracted code content back into JSON
     *
     * @param {TYPE.MetadataTypeItem} metadata a single definition
     * @param {string} deployDir directory of deploy files
     * @param {string} [templateName] name of the template used to built defintion (prior applying templating)
     * @returns {Promise.<string>} code
     */
    static async _mergeCode(metadata, deployDir, templateName) {
        const fileExtension = 'amp';
        templateName = templateName || metadata[this.definition.keyField];
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
     * helper for {@link parseMetadata} and {@link _buildForNested}
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
            if (metadata.keyword?.keyword) {
                cache.searchForField(
                    'mobileKeyword',
                    metadata.keyword.keyword,
                    'keyword',
                    'keyword'
                );
            }
            if (metadata.subscriptionKeyword?.keyword) {
                cache.searchForField(
                    'mobileKeyword',
                    metadata.subscriptionKeyword.keyword,
                    'keyword',
                    'keyword'
                );
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
        if (metadata.keyword?.keyword) {
            const keyword = cache.getByKey('mobileKeyword', metadata.keyword.keyword);
            if (!keyword) {
                throw new Error(`mobileKeyword ${metadata.keyword.keyword} not found in cache`);
            }
            metadata.keyword = keyword;
        }
        if (metadata.subscriptionKeyword?.keyword) {
            const keyword = cache.getByKey('mobileKeyword', metadata.subscriptionKeyword.keyword);
            if (!keyword) {
                throw new Error(`mobileKeyword ${metadata.keyword.keyword} not found in cache`);
            }

            metadata.subscriptionKeyword.keyword = keyword;
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
     * helper for {@link createREST}
     *
     * @param {TYPE.MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {object} apiResponse varies depending on the API call
     * @returns {void}
     */
    static async postCreateTasks(metadataEntry, apiResponse) {
        await super.postCreateTasks_legacyApi(metadataEntry, apiResponse);
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
     * helper for {@link buildTemplateForNested} / {@link buildDefinitionForNested}
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
