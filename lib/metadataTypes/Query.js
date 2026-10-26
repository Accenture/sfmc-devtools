'use strict';

import { Util } from '../util/util.js';
import MetadataType from './MetadataType.js';
import File from '../util/file.js';
import cache from '../util/cache.js';
import auth from '../util/auth.js';
import { parseSourceTables } from '../util/sqlTables.js';

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
 * @typedef {import('../../types/mcdev.d.js').TypeKeyCombo} TypeKeyCombo
 */

/**
 * @typedef {import('../../types/mcdev.d.js').QueryItem} QueryItem
 * @typedef {import('../../types/mcdev.d.js').QueryMap} QueryMap
 * @typedef {import('../util/sqlTables.js').SqlTable} SqlTable
 */

/**
 * @typedef {object} DataExtensionNameMap
 * @property {Object.<string, string>} local lower-case name => key of dataExtensions on the current BU
 * @property {Object.<string, string>} shared lower-case name => key of shared / synchronized dataExtensions from _ParentBU_
 */

/**
 * Query MetadataType
 *
 * @augments MetadataType
 */
class Query extends MetadataType {
    /**
     * dataExtension names cached per dependency search, keyed by the notFoundList object that
     * {@link Mcdev.addDependencies} creates once per run and passes through all recursive calls.
     * A new run therefore always sees new dataExtensions, also in long-running processes like the VS Code extension.
     *
     * @type {WeakMap.<TypeKeyCombo, Object.<number, DataExtensionNameMap>>}
     */
    static #dataExtensionNameMaps = new WeakMap();

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

        return super.retrieveREST(retrieveDir, '/automation/v1/queries/' + (objectId || ''), key);
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
            .replaceAll(' { { { ', '{{{')
            .replaceAll('{ { { ', '{{{')
            .replaceAll(' } } } ', '}}}')
            .replaceAll(' } } }', '}}}');

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
     * Extends {@link MetadataType.getDependentFiles}: besides the target dataExtension, also adds the
     * dataExtensions that the SQL selects from (FROM, JOIN, APPLY).
     * Table names are resolved to keys via {@link DataExtension.retrieveForCache}, which also returns
     * shared dataExtensions when running on a child BU.
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
        const knownKeys = new Set(multiTypeKeyList[this.definition.type]);
        const result = await super.getDependentFiles(
            keyArr,
            multiTypeKeyList,
            notFoundList,
            isFirstCall
        );
        // only check queries that were found on disk during this call
        const foundKeys = new Set(multiTypeKeyList[this.definition.type]);
        const newKeys = [
            ...new Set(
                keyArr
                    .map((key) => key + '')
                    .filter((key) => foundKeys.has(key) && !knownKeys.has(key))
            ),
        ];
        if (!newKeys.length) {
            return result;
        }
        const sourceKeys = await this._getSourceDataExtensionKeys(newKeys, notFoundList);
        if (sourceKeys.length) {
            DataExtension.properties = this.properties;
            DataExtension.buObject = this.buObject;
            await DataExtension.getDependentFiles(sourceKeys, multiTypeKeyList, notFoundList);
        }
        return multiTypeKeyList;
    }

    /**
     * helper for {@link Query.getDependentFiles}
     * reads the SQL of the given queries and returns the keys of the dataExtensions it selects from.
     * Tables that cannot be resolved to a dataExtension are reported as a warning.
     *
     * @param {string[]} keyArr keys of queries that were found in the retrieve folder
     * @param {TypeKeyCombo} runCacheKey object that identifies the current dependency search, used to cache dataExtension names
     * @returns {Promise.<string[]>} unique dataExtension keys
     */
    static async _getSourceDataExtensionKeys(keyArr, runCacheKey) {
        const queryDir = File.normalizePath([
            this.properties.directories.retrieve,
            this.buObject.credential,
            this.buObject.businessUnit,
            this.definition.type,
        ]);
        const buName = this.buObject.credential + '/' + this.buObject.businessUnit;
        /** @type {DataExtensionNameMap} */
        let nameMap;
        const sourceKeys = new Set();
        // target dataExtensions were already handled by the default dependency search
        const targetKeys = new Set();
        let unresolvedTableCount = 0;
        let unresolvedQueryCount = 0;
        for (const key of keyArr) {
            /** @type {QueryItem} */
            let metadata;
            let sql;
            try {
                metadata = await File.readJson(
                    File.normalizePath([queryDir, `${key}.${this.definition.type}-meta.json`])
                );
                sql = await File.readFilteredFilename(
                    queryDir,
                    `${key}.${this.definition.type}-meta`,
                    'sql'
                );
            } catch {
                Util.logger.debug(
                    ` - ${this.definition.type} ${key}: Could not read JSON or SQL file while trying to find dependencies. Skipping`
                );
                continue;
            }
            if (metadata.r__dataExtension_key) {
                targetKeys.add(metadata.r__dataExtension_key);
            }
            const { tables, skipped } = parseSourceTables(sql);
            const queryLabel = `${this.definition.type} ${metadata[this.definition.nameField]} (${key})`;
            for (const reference of skipped) {
                if (reference.reason === 'template') {
                    Util.logger.verbose(
                        ` - ${queryLabel}: Skipping table name with template placeholder in SQL: ${reference.text}`
                    );
                } else {
                    // the package might be incomplete, so this must not be hidden in verbose logs
                    Util.logger.warn(
                        ` ☇ ${queryLabel}: Could not read the table name in SQL near "${reference.text}". Please check manually if a dataExtension is missing in the package.`
                    );
                }
            }
            if (!tables.length) {
                continue;
            }
            if (!nameMap) {
                try {
                    nameMap = await this._getDataExtensionNameMap(runCacheKey);
                } catch (ex) {
                    Util.logger.warn(
                        ` ☇ Could not load dataExtension names for ${buName} (${ex.message}). Skipping the search for dataExtensions used in SQL.`
                    );
                    return [];
                }
            }
            const unresolved = [];
            for (const table of tables) {
                const deKey = this._resolveTableName(table, nameMap);
                if (deKey) {
                    sourceKeys.add(deKey);
                } else {
                    unresolved.push((table.isEnt ? 'ENT.' : '') + table.name);
                }
            }
            if (!unresolved.length) {
                continue;
            }
            unresolvedTableCount += unresolved.length;
            unresolvedQueryCount++;
            Util.logger.warn(
                ` ☇ ${queryLabel}: ${
                    unresolved.length === 1 ? 'Table' : 'Tables'
                } ${unresolved.join(', ')} used in the SQL ${
                    unresolved.length === 1 ? 'was' : 'were'
                } not found as dataExtension on ${buName}`
            );
        }
        if (unresolvedTableCount) {
            Util.logger.warn(
                `${unresolvedTableCount} ${
                    unresolvedTableCount === 1 ? 'table' : 'tables'
                } used in the SQL of ${unresolvedQueryCount} ${
                    unresolvedQueryCount === 1 ? 'query' : 'queries'
                } could not be resolved to a dataExtension and will not be part of the package. Please check if ${
                    unresolvedTableCount === 1 ? 'it exists' : 'they exist'
                } on ${buName}.`
            );
        }
        for (const deKey of targetKeys) {
            sourceKeys.delete(deKey);
        }
        return [...sourceKeys];
    }

    /**
     * helper for {@link Query._getSourceDataExtensionKeys}
     * loads all dataExtension names of the current BU (and shared ones from _ParentBU_ on child BUs) once per BU and run
     *
     * @param {TypeKeyCombo} runCacheKey object that identifies the current dependency search
     * @returns {Promise.<DataExtensionNameMap>} lower-case name => key maps
     */
    static async _getDataExtensionNameMap(runCacheKey) {
        const mid = this.buObject.mid;
        let runCache = Query.#dataExtensionNameMaps.get(runCacheKey);
        if (!runCache) {
            runCache = {};
            Query.#dataExtensionNameMaps.set(runCacheKey, runCache);
        }
        if (runCache[mid]) {
            return runCache[mid];
        }
        Util.logger.info(
            ' - Caching dependent Metadata: dataExtension (to resolve table names used in SQL)'
        );
        if (!cache.getCache()) {
            cache.initCache(this.buObject);
        }
        DataExtension.properties = this.properties;
        DataExtension.buObject = this.buObject;
        DataExtension.client = auth.getSDK(this.buObject);
        const { metadata } = await DataExtension.retrieveForCache();

        /** @type {DataExtensionNameMap} */
        const nameMap = { local: {}, shared: {} };
        const isChildBu = this.buObject.eid !== this.buObject.mid;
        for (const de of Object.values(metadata || {})) {
            if (!de?.Name) {
                continue;
            }
            const isShared = isChildBu && this._isSharedDataExtensionFolder(de.CategoryID);
            nameMap[isShared ? 'shared' : 'local'][de.Name.toLowerCase()] = de.CustomerKey;
        }
        runCache[mid] = nameMap;
        return nameMap;
    }

    /**
     * helper for {@link Query._getDataExtensionNameMap}
     * shared folders of _ParentBU_ were cached under the EID by {@link DataExtension.retrieveSharedForCache};
     * same check as in {@link DataExtensionField.isSharedDe}, which reads the dataExtension from the global cache instead
     *
     * @param {number|string} categoryId folder ID of a dataExtension
     * @returns {boolean} true if the folder holds shared or synchronized dataExtensions
     */
    static _isSharedDataExtensionFolder(categoryId) {
        try {
            const contentType = cache.searchForField(
                'folder',
                categoryId,
                'ID',
                'ContentType',
                this.buObject.eid
            );
            return MetadataTypeDefinitions.folder.folderTypesFromParent.includes(contentType);
        } catch {
            return false;
        }
    }

    /**
     * helper for {@link Query._getSourceDataExtensionKeys}
     * SFMC compares table names without case. ENT. prefers shared dataExtensions, other names prefer local ones.
     * Both fall back to the other list because this is used to find dependencies, not to validate the SQL.
     *
     * @param {SqlTable} table table found in the SQL
     * @param {DataExtensionNameMap} nameMap lower-case name => key maps
     * @returns {string|undefined} dataExtension key or undefined if not found
     */
    static _resolveTableName(table, nameMap) {
        const name = table.name.toLowerCase();
        return table.isEnt
            ? (nameMap.shared[name] ?? nameMap.local[name])
            : (nameMap.local[name] ?? nameMap.shared[name]);
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
            return errors.map((msg) => msg.replaceAll('Error saving the Query field.', ''));
        }
        return errors;
    }

    /**
     * Delete a metadata item from the specified business unit
     *
     * @param {string} key Identifier of data extension
     * @returns {Promise.<boolean>} deletion success flag
     */
    static async deleteByKey(key) {
        // delete only works with the query's object id
        const objectId = key ? await this._getObjectIdForSingleRetrieve(key) : null;
        if (!objectId) {
            await this.deleteNotFound(key);
            return false;
        }
        return super.deleteByKeyREST('/automation/v1/queries/' + objectId, key);
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
        if (!Util.OPTIONS.execute) {
            return;
        }

        Util.logger.info(`Executing: ${this.definition.type}`);
        await this.execute(Object.keys(upsertResults));
    }
}

// Assign definition & cache to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
import DataExtension from './DataExtension.js';
Query.definition = MetadataTypeDefinitions.query;

export default Query;
