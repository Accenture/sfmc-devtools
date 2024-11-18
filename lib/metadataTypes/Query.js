'use strict';

import { Util } from '../util/util.js';
import MetadataType from './MetadataType.js';
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
 * @typedef {import('../../types/mcdev.d.js').QueryItem} QueryItem
 * @typedef {import('../../types/mcdev.d.js').QueryMap} QueryMap
 */

/**
 * Query MetadataType
 *
 * @augments MetadataType
 */
class Query extends MetadataType {
    /**
     * Retrieves Metadata of queries
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<{metadata: QueryMap, type: string}>} Promise of metadata
     */
    static async retrieve(retrieveDir, _, __, key) {
        await File.initPrettier('sql');
        let objectId = null;
        if (key) {
            objectId = await this._getObjectIdForSingleRetrieve(key);
            if (!objectId) {
                // avoid running the rest request below by returning early
                Util.logger.info(
                    `Downloaded: ${this.definition.type} (0)${Util.getKeysString(key)}`
                );
                return { metadata: {}, type: this.definition.type };
            }
        }

        return super.retrieveREST(
            retrieveDir,
            '/automation/v1/queries/' + (objectId || ''),
            null,
            key
        );
    }

    /**
     * a function to start query execution via API
     *
     * @param {string[]} keyArr customerkey of the metadata
     * @returns {Promise.<string[]>} Returns list of keys that were executed successfully
     */
    static async execute(keyArr) {
        const results = [];
        // works only with objectId
        let objectId;
        for (const key of keyArr) {
            if (key) {
                objectId = await this._getObjectIdForSingleRetrieve(key);
                if (!objectId) {
                    Util.logger.info(`Skipping ${key} - did not find an item with such key`);
                    continue;
                }
            }
            results.push(
                super.executeREST(`/automation/v1/queries/${objectId}/actions/start/`, key)
            );
        }
        const executedKeyArr = (await Promise.all(results))
            .filter((r) => r.response === 'OK')
            .map((r) => r.key);
        Util.logger.info(`Executed ${executedKeyArr.length} of ${keyArr.length} items`);
        return executedKeyArr;
    }

    /**
     * helper to allow us to select single metadata entries via REST
     *
     * @private
     * @param {string} key customer key
     * @returns {Promise.<string>} objectId or enpty string
     */
    static async _getObjectIdForSingleRetrieve(key) {
        const response = await this.client.soap.retrieve('QueryDefinition', ['ObjectID'], {
            filter: {
                leftOperand: {
                    leftOperand: 'CustomerKey',
                    operator: 'equals',
                    rightOperand: key,
                },
                operator: 'AND',
                rightOperand: {
                    leftOperand: 'Status',
                    operator: 'equals',
                    rightOperand: 'Active',
                },
            },
        });
        return response?.Results?.length ? response.Results[0].ObjectID : null;
    }

    /**
     * Retrieves query metadata for caching
     *
     * @returns {Promise.<{metadata: QueryMap, type: string}>} Promise of metadata
     */
    static async retrieveForCache() {
        return super.retrieveREST(null, '/automation/v1/queries/');
    }

    /**
     * Retrieve a specific Query by Name
     *
     * @param {string} templateDir Directory where retrieved metadata directory will be saved
     * @param {string} name name of the metadata file
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {Promise.<{metadata: Query, type: string}>} Promise of metadata
     */
    static async retrieveAsTemplate(templateDir, name, templateVariables) {
        await File.initPrettier('sql');
        return super.retrieveREST(
            templateDir,
            '/automation/v1/queries/?$filter=Name%20eq%20' + encodeURIComponent(name),
            templateVariables
        );
    }

    /**
     * manages post retrieve steps
     *
     * @param {QueryItem} metadata a single query
     * @returns {CodeExtractItem} Array with one metadata object and one query string
     */
    static postRetrieveTasks(metadata) {
        // folder
        super.setFolderPath(metadata);

        // extract SQL
        const codeArr = [
            {
                subFolder: null,
                fileName: metadata[this.definition.keyField],
                fileExt: 'sql',
                content: metadata.queryText,
            },
        ];
        delete metadata.queryText;

        try {
            if (metadata.targetId) {
                // overwrite targetKey via targetId (it's not updated on name/key change of the DE)
                const targetKey = cache.searchForField(
                    'dataExtension',
                    metadata.targetId,
                    'ObjectID',
                    'CustomerKey'
                );
                if (targetKey !== metadata.targetKey) {
                    Util.logger.debug(
                        ` - ${this.definition.type} ${metadata[this.definition.nameField]} (${
                            metadata[this.definition.keyField]
                        }): Replacing targetKey value in saved JSON '${
                            metadata.targetKey
                        }' --> '${targetKey}'. Acquired new value from looking up the DE's ObjectID in targetId.`
                    );
                }
                metadata.r__dataExtension_key = targetKey;
            } else {
                // if no targetId is set, at least check if the targetKey points to an existing DE (no override needed)
                metadata.r__dataExtension_key = cache.searchForField(
                    'dataExtension',
                    metadata.targetKey,
                    'CustomerKey',
                    'CustomerKey'
                );
            }
            delete metadata.targetKey;
        } catch (ex) {
            Util.logger.warn(
                ` - ${this.definition.type} ${metadata[this.definition.nameField]} (${
                    metadata[this.definition.keyField]
                }): ${ex.message}.`
            );
        }
        delete metadata.targetId;

        return { json: metadata, codeArr: codeArr, subFolder: null };
    }

    /**
     * Creates a single query
     *
     * @param {QueryItem} query a single query
     * @returns {Promise} Promise
     */
    static create(query) {
        const uri = '/automation/v1/queries/';
        return super.createREST(query, uri);
    }

    /**
     * Updates a single query
     *
     * @param {QueryItem} query a single query
     * @returns {Promise} Promise
     */
    static update(query) {
        const uri = '/automation/v1/queries/' + query.queryDefinitionId;
        return super.updateREST(query, uri);
    }

    /**
     * prepares a Query for deployment
     *
     * @param {QueryItem} metadata a single query activity
     * @param {string} deployDir directory of deploy files
     * @returns {Promise.<QueryItem>} Promise
     */
    static async preDeployTasks(metadata, deployDir) {
        // folder
        super.setFolderId(metadata);

        // reinject queryText
        metadata.queryText = await File.readFilteredFilename(
            deployDir + '/' + this.definition.type,
            metadata[this.definition.keyField] + '.' + this.definition.type + '-meta',
            'sql'
        );

        // dataExtension
        metadata.targetKey = cache.searchForField(
            'dataExtension',
            metadata.r__dataExtension_key,
            'CustomerKey',
            'CustomerKey'
        );
        // we've seen queries without this ID set - crucial in case the DE ever gets renamed to ensure the query keeps working
        metadata.targetId = cache.searchForField(
            'dataExtension',
            metadata.r__dataExtension_key,
            'CustomerKey',
            'ObjectID'
        );

        // set ID for Append / Overwrite/ Update action
        metadata.targetUpdateTypeId =
            this.definition.targetUpdateTypeMapping[metadata.targetUpdateTypeName];

        if (!Util.OPTIONS.matchName) {
            // make sure the name is unique
            const thisCache = cache.getCache()[this.definition.type];
            const relevantNames = Object.keys(thisCache).map((key) => ({
                type: null,
                key: key,
                name: thisCache[key][this.definition.nameField],
            }));
            // if the name is already in the folder for a different key, add a number to the end
            metadata[this.definition.nameField] = this.findUniqueName(
                metadata[this.definition.keyField],
                metadata[this.definition.nameField],
                relevantNames
            );
        }

        return metadata;
    }

    /**
     * helper for {@link Query.buildDefinitionForNested}
     * searches extracted SQL file for template variables and applies the market values
     *
     * @param {string} code code from extracted code
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {string} code with markets applied
     */
    static applyTemplateValues(code, templateVariables) {
        // fix bad formatting applied by SQL Formatter Plus
        code = code
            .split(' { { { ')
            .join('{{{')
            .split('{ { { ')
            .join('{{{')
            .split(' } } } ')
            .join('}}}')
            .split(' } } }')
            .join('}}}');

        // replace template variables with their values
        return super.applyTemplateValues(code, templateVariables);
    }

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
     * @example queries are saved as 1 json and 1 sql file. both files need to be run through templating
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string|string[]} targetDir (List of) Directory where built definitions will be saved
     * @param {QueryItem} metadata main JSON file that was read from file system
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
    static async _buildForNested(
        templateDir,
        targetDir,
        metadata,
        templateVariables,
        templateName,
        mode
    ) {
        // get SQL from filesystem
        let code = await File.readFilteredFilename(
            [templateDir, this.definition.type],
            templateName + '.' + this.definition.type + '-meta',
            'sql'
        );

        try {
            if (mode === 'definition') {
                code = this.applyTemplateValues(code, templateVariables);
            } else if (mode === 'template') {
                code = this.applyTemplateNames(code, templateVariables);
            }
        } catch {
            throw new Error(
                `${this.definition.type}:: Error applying template variables on ${
                    templateName + '.' + this.definition.type
                }-meta.sql.`
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
                'sql',
                code
            );
            nestedFilePaths.push([
                targetDir,
                this.definition.type,
                fileName + '.' + this.definition.type + '-meta.sql',
            ]);
        }
        return nestedFilePaths;
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
            File.normalizePath([path, `${key}.${this.definition.type}-meta.sql`]),
        ]);
        return fileList;
    }

    /**
     *  Standardizes a check for multiple messages but adds query specific filters to error texts
     *
     * @param {object} ex response payload from REST API
     * @returns {string[]} formatted Error Message
     */
    static getErrorsREST(ex) {
        const errors = super.getErrorsREST(ex);
        if (errors?.length > 0) {
            return errors.map((msg) => msg.split('Error saving the Query field.').join(''));
        }
        return errors;
    }

    /**
     * Delete a metadata item from the specified business unit
     *
     * @param {string} customerKey Identifier of data extension
     * @returns {Promise.<boolean>} deletion success flag
     */
    static async deleteByKey(customerKey) {
        // delete only works with the query's object id
        const objectId = customerKey ? await this._getObjectIdForSingleRetrieve(customerKey) : null;
        if (!objectId) {
            Util.logger.error(` - query ${customerKey} not found`);
            return false;
        }
        return super.deleteByKeyREST('/automation/v1/queries/' + objectId, customerKey);
    }

    /**
     * clean up after deleting a metadata item
     *
     * @param {string} customerKey Identifier of metadata item
     * @returns {Promise.<void>} -
     */
    static async postDeleteTasks(customerKey) {
        // delete local copy: retrieve/cred/bu/.../...-meta.json
        // delete local copy: retrieve/cred/bu/.../...-meta.sql
        await super.postDeleteTasks(customerKey, [`${this.definition.type}-meta.sql`]);
    }

    /**
     * Gets executed after deployment of metadata type
     *
     * @param {MetadataTypeMap} upsertResults metadata mapped by their keyField as returned by update/create
     */
    static async postDeployTasks(upsertResults) {
        if (Util.OPTIONS.execute) {
            Util.logger.info(`Executing: ${this.definition.type}`);
            await this.execute(Object.keys(upsertResults));
        }
    }
}

// Assign definition & cache to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
Query.definition = MetadataTypeDefinitions.query;

export default Query;
