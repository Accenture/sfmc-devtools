'use strict';

const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const File = require('../util/file');
const Mustache = require('mustache');
/**
 * Query MetadataType
 * @augments MetadataType
 */
class Query extends MetadataType {
    /**
     * Retrieves Metadata of queries
     * @param {String} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise<Object>} Promise of metadata
     */
    static async retrieve(retrieveDir) {
        return super.retrieveREST(retrieveDir, '/automation/v1/queries/', null);
    }

    /**
     * Retrieves query metadata for caching
     * @returns {Promise<Object>} Promise of metadata
     */
    static async retrieveForCache() {
        return super.retrieveREST(null, '/automation/v1/queries/', null);
    }

    /**
     * Retrieve a specific Query by Name
     * @param {String} templateDir Directory where retrieved metadata directory will be saved
     * @param {String} name name of the metadata file
     * @param {Object} templateVariables variables to be replaced in the metadata
     * @returns {Promise<Object>} Promise of metadata
     */
    static async retrieveAsTemplate(templateDir, name, templateVariables) {
        return super.retrieveREST(
            templateDir,
            '/automation/v1/queries/?$filter=Name%20eq%20' + name.split(' ').join('%20'),
            null,
            templateVariables
        );
    }

    /**
     * manages post retrieve steps
     * @param {Object} metadata a single query
     * @param {String} _ unused
     * @param {Boolean} isTemplating signals that we are retrieving templates
     * @returns {Object[]} Array with one metadata object and one query string
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
     * @param {Object} query a single query
     * @returns {Promise} Promise
     */
    static create(query) {
        const uri = '/automation/v1/queries/';
        return super.createREST(query, uri);
    }

    /**
     * Updates a single query
     * @param {Object} query a single query
     * @returns {Promise} Promise
     */
    static update(query) {
        const uri = '/automation/v1/queries/' + query.queryDefinitionId;
        return super.updateREST(query, uri);
    }

    /**
     * prepares a Query for deployment
     * @param {Object} metadata a single query activity definition
     * @param {String} deployDir directory of deploy files
     * @returns {Promise} Promise
     */
    static async preDeployTasks(metadata, deployDir) {
        metadata.queryText = await File.readFile(
            deployDir + '/' + this.definition.type,
            metadata.key + '.' + this.definition.type + '-meta',
            'sql'
        );
        try {
            metadata.targetKey = Util.getFromCache(
                this.cache,
                'dataExtension',
                metadata.targetKey,
                'CustomerKey',
                'CustomerKey'
            );
        } catch (ex) {
            throw new Error(`Query '${metadata.key}': ${ex.message}`);
        }
        try {
            metadata.categoryId = Util.getFromCache(
                this.cache,
                'folder',
                metadata.r__folder_Path,
                'Path',
                'ID'
            );
            delete metadata.r__folder_Path;
        } catch (ex) {
            throw new Error(`Query '${metadata.key}': ${ex.message}`);
        }
        metadata.targetUpdateTypeId = this.definition.targetUpdateTypeMapping[
            metadata.targetUpdateTypeName
        ];
        return metadata;
    }

    /**
     * helper for buildDefinition
     * handles extracted code if any are found for complex types
     * @param {String} templateDir Directory where metadata templates are stored
     * @param {String|String[]} targetDir (List of) Directory where built definitions will be saved
     * @param {Object} metadata main JSON file that was read from file system
     * @param {Object} variables variables to be replaced in the metadata
     * @param {String} templateName name of the template to be built
     * @returns {Promise} Promise
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
     * @param {Object} metadata a single query activity definition
     * @returns {Array} Array with one metadata object and one sql string
     */
    static parseMetadata(metadata) {
        // folder
        try {
            metadata.r__folder_Path = Util.getFromCache(
                this.cache,
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
Query.cache = {};
Query.client = undefined;

module.exports = Query;
