'use strict';

const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const File = require('../util/file');
const cache = require('../util/cache');
const Mustache = require('mustache');

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
     * @param {void} [_] unused parameter
     * @param {void} [__] unused parameter
     * @param {void} [___] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<{metadata: TYPE.QueryMap, type: string}>} Promise of metadata
     */
    static async retrieve(retrieveDir, _, __, ___, key) {
        await File.initPrettier('sql');
        const objectId = await this._getObjectIdForSingleRetrieve(key);
        return super.retrieveREST(
            retrieveDir,
            '/automation/v1/queries/' + (objectId ? objectId : ''),
            null,
            null,
            key
        );
    }
    /**
     * helper to allow us to select single metadata entries via REST
     *
     * @private
     * @param {string} key customer key
     * @returns {Promise.<string>} objectId or enpty string
     */
    static async _getObjectIdForSingleRetrieve(key) {
        if (!key) {
            return null;
        }
        const response = await this.client.soap.retrieve('QueryDefinition', ['ObjectID'], {
            filter: {
                leftOperand: 'CustomerKey',
                operator: 'equals',
                rightOperand: key,
            },
        });
        return response.Results[0].ObjectID;
    }

    /**
     * Retrieves query metadata for caching
     *
     * @returns {Promise.<{metadata: TYPE.QueryMap, type: string}>} Promise of metadata
     */
    static async retrieveForCache() {
        return super.retrieveREST(null, '/automation/v1/queries/');
    }

    /**
     * Retrieve a specific Query by Name
     *
     * @param {string} templateDir Directory where retrieved metadata directory will be saved
     * @param {string} name name of the metadata file
     * @param {TYPE.TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {Promise.<{metadata: Query, type: string}>} Promise of metadata
     */
    static async retrieveAsTemplate(templateDir, name, templateVariables) {
        await File.initPrettier('sql');
        return super.retrieveREST(
            templateDir,
            '/automation/v1/queries/?$filter=Name%20eq%20' + encodeURIComponent(name),
            null,
            templateVariables
        );
    }

    /**
     * manages post retrieve steps
     *
     * @param {TYPE.QueryItem} metadata a single query
     * @returns {TYPE.CodeExtractItem} Array with one metadata object and one query string
     */
    static postRetrieveTasks(metadata) {
        return this.parseMetadata(metadata);
    }

    /**
     * Creates a single query
     *
     * @param {TYPE.QueryItem} query a single query
     * @returns {Promise} Promise
     */
    static create(query) {
        const uri = '/automation/v1/queries/';
        return super.createREST(query, uri);
    }

    /**
     * Updates a single query
     *
     * @param {TYPE.QueryItem} query a single query
     * @returns {Promise} Promise
     */
    static update(query) {
        const uri = '/automation/v1/queries/' + query.queryDefinitionId;
        return super.updateREST(query, uri);
    }

    /**
     * prepares a Query for deployment
     *
     * @param {TYPE.QueryItem} metadata a single query activity
     * @param {string} deployDir directory of deploy files
     * @returns {Promise.<TYPE.QueryItem>} Promise
     */
    static async preDeployTasks(metadata, deployDir) {
        metadata.queryText = await File.readFilteredFilename(
            deployDir + '/' + this.definition.type,
            metadata.key + '.' + this.definition.type + '-meta',
            'sql'
        );
        metadata.targetKey = cache.searchForField(
            'dataExtension',
            metadata.targetKey,
            'CustomerKey',
            'CustomerKey'
        );
        metadata.categoryId = cache.searchForField('folder', metadata.r__folder_Path, 'Path', 'ID');
        delete metadata.r__folder_Path;
        metadata.targetUpdateTypeId =
            this.definition.targetUpdateTypeMapping[metadata.targetUpdateTypeName];
        return metadata;
    }
    /**
     * helper for buildDefinitionForNested
     * searches extracted SQL file for template variables and applies the market values
     *
     * @param {string} code code from extracted code
     * @param {TYPE.TemplateMap} templateVariables variables to be replaced in the metadata
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
        return Mustache.render(code, templateVariables);
    }
    /**
     * helper for buildDefinition
     * handles extracted code if any are found for complex types
     *
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string|string[]} targetDir (List of) Directory where built definitions will be saved
     * @param {TYPE.QueryItem} metadata main JSON file that was read from file system
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
     * helper for buildTemplate
     * handles extracted code if any are found for complex types
     *
     * @example queries are saved as 1 json and 1 sql file. both files need to be run through templating
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string|string[]} targetDir (List of) Directory where built definitions will be saved
     * @param {TYPE.QueryItem} metadata main JSON file that was read from file system
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
     * helper for buildTemplateForNested / buildDefinitionForNested
     * handles extracted code if any are found for complex types
     *
     * @private
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string|string[]} targetDir (List of) Directory where built definitions will be saved
     * @param {TYPE.QueryItem} metadata main JSON file that was read from file system
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
        } catch (ex) {
            throw new Error(
                `${this.definition.type}:: Error applying template variables on ${
                    metadata[this.definition.keyField] + '.' + this.definition.type
                }-meta.sql.`
            );
        }

        // write to file
        const targetDirArr = Array.isArray(targetDir) ? targetDir : [targetDir];
        const nestedFilePaths = [];

        for (const targetDir of targetDirArr) {
            File.writeToFile(
                [targetDir, this.definition.type],
                metadata[this.definition.keyField] + '.' + this.definition.type + '-meta',
                'sql',
                code
            );
            nestedFilePaths.push([
                targetDir,
                this.definition.type,
                metadata[this.definition.keyField] + '.' + this.definition.type + '-meta.sql',
            ]);
        }
        return nestedFilePaths;
    }

    /**
     * parses retrieved Metadata before saving
     *
     * @param {TYPE.QueryItem} metadata a single query activity definition
     * @returns {TYPE.CodeExtractItem} a single item with code parts extracted
     */
    static parseMetadata(metadata) {
        // folder
        try {
            metadata.r__folder_Path = cache.searchForField(
                'folder',
                metadata.categoryId,
                'ID',
                'Path'
            );
            delete metadata.categoryId;
        } catch (ex) {
            Util.logger.warn(`Query '${metadata.key}': ${ex.message}`);
        }

        // extract SQL
        const codeArr = [
            {
                subFolder: null,
                fileName: metadata.key,
                fileExt: 'sql',
                content: metadata.queryText,
            },
        ];
        delete metadata.queryText;

        return { json: metadata, codeArr: codeArr, subFolder: null };
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

        const fileList = keyArr
            .map((key) => [
                File.normalizePath([path, `${key}.${this.definition.type}-meta.json`]),
                File.normalizePath([path, `${key}.${this.definition.type}-meta.sql`]),
            ])
            .flat();
        return fileList;
    }
}

// Assign definition & cache to static attributes
Query.definition = require('../MetadataTypeDefinitions').query;

module.exports = Query;
