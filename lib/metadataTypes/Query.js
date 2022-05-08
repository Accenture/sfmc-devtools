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
     * @returns {Promise.<{metadata: TYPE.QueryMap, type: string}>} Promise of metadata
     */
    static async retrieve(retrieveDir) {
        await File.initPrettier('sql');
        return super.retrieveREST(retrieveDir, '/automation/v1/queries/', null);
    }

    /**
     * Retrieves query metadata for caching
     *
     * @returns {Promise.<{metadata: TYPE.QueryMap, type: string}>} Promise of metadata
     */
    static async retrieveForCache() {
        return super.retrieveREST(null, '/automation/v1/queries/', null);
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
     * @param {string} _ unused
     * @param {boolean} isTemplating signals that we are retrieving templates
     * @returns {TYPE.CodeExtractItem} Array with one metadata object and one query string
     */
    static postRetrieveTasks(metadata, _, isTemplating) {
        // if retrieving template, replace the name with customer key if that wasn't already the case
        if (isTemplating) {
            const warningMsg =
                'Ensure that Automations using this query are updated with the new query-key before deployment.';
            this.overrideKeyWithName(metadata, warningMsg);
        }
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
        metadata.queryText = await File.readFile(
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
     * helper for buildDefinition
     * handles extracted code if any are found for complex types
     *
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string|string[]} targetDir (List of) Directory where built definitions will be saved
     * @param {TYPE.MetadataTypeItem} metadata main JSON file that was read from file system
     * @param {object} variables variables to be replaced in the metadata
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
        // get SQL from filesystem
        let code = await File.readFile(
            [templateDir, this.definition.type],
            templateName + '.' + this.definition.type + '-meta',
            'sql'
        );
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
        try {
            code = Mustache.render(code, variables);
        } catch (ex) {
            throw new Error(
                `${this.definition.type}:: Error applying template variables on ${
                    metadata[this.definition.keyField] + '.' + this.definition.type
                }-meta.sql.`
            );
        }

        // write to file
        const targetDirArr = Array.isArray(targetDir) ? targetDir : [targetDir];

        for (const targetDir of targetDirArr) {
            File.writeToFile(
                [targetDir, this.definition.type],
                metadata[this.definition.keyField] + '.' + this.definition.type + '-meta',
                'sql',
                code
            );
        }
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
}

// Assign definition & cache to static attributes
Query.definition = require('../MetadataTypeDefinitions').query;

module.exports = Query;
