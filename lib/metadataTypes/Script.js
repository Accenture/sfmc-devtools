'use strict';

const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const File = require('../util/file');
const Mustache = require('mustache');

/**
 * @typedef {Object} ScriptItem
 * @property {string} name name
 * @property {string} key key
 * @property {string} description -
 * @property {string} createdDate e.g. "2020-09-14T01:42:03.017"
 * @property {string} modifiedDate e.g. "2020-09-14T01:42:03.017"
 * @property {string} [script] contains script with line breaks converted to '\n'. The content is extracted during retrieval and written into a separate *.ssjs file
 * @property {string} [categoryId] holds folder ID, replaced with r__folder_Path during retrieve
 * @property {string} r__folder_Path folder path in which this DE is saved
 *
 * @typedef {Object.<string, ScriptItem>} ScriptMap
 *
 * @typedef {Object} CodeExtractItem
 * @property {ScriptItem} json metadata of one item w/o code
 * @property {MetadataType.CodeExtract[]} codeArr list of code snippets in this item
 * @property {string[]} subFolder mostly set to null, otherwise list of subfolders
 */

/**
 * Script MetadataType
 * @augments MetadataType
 */
class Script extends MetadataType {
    /**
     * Retrieves Metadata of Script
     * Endpoint /automation/v1/scripts/ return all Scripts with all details.
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise<{metadata:ScriptMap,type:string}>} Promise
     */
    static async retrieve(retrieveDir) {
        await File.initPrettier('ssjs');
        return super.retrieveREST(retrieveDir, '/automation/v1/scripts/', null);
    }
    /**
     * Retrieves script metadata for caching
     * @returns {Promise<{metadata:ScriptMap,type:string}>} Promise
     */
    static async retrieveForCache() {
        return super.retrieveREST(null, '/automation/v1/scripts/', null);
    }

    /**
     * Retrieve a specific Script by Name
     * @param {string} templateDir Directory where retrieved metadata directory will be saved
     * @param {string} name name of the metadata file
     * @param {Util.TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {Promise<{metadata:ScriptMap,type:string}>} Promise
     */
    static async retrieveAsTemplate(templateDir, name, templateVariables) {
        await File.initPrettier('ssjs');
        return super.retrieveREST(
            templateDir,
            '/automation/v1/scripts/?$filter=name%20eq%20' + name.split(' ').join('%20'),
            null,
            templateVariables
        );
    }

    /**
     * manages post retrieve steps
     * @param {ScriptItem} metadata a single script
     * @param {string} [_] unused
     * @param {boolean} [isTemplating] signals that we are retrieving templates
     * @returns {CodeExtractItem} Array with one metadata object and one ssjs string
     */
    static postRetrieveTasks(metadata, _, isTemplating) {
        // if retrieving template, replace the name with customer key if that wasn't already the case
        if (isTemplating) {
            const warningMsg =
                'Ensure that Automations using this script are updated with the new script-key before deployment.';
            this.overrideKeyWithName(metadata, warningMsg);
        }
        return this.parseMetadata(metadata);
    }

    /**
     * Updates a single Script
     * @param {Object} script a single Script
     * @returns {Promise} Promise
     */
    static update(script) {
        return super.updateREST(script, '/automation/v1/scripts/' + script.ssjsActivityId);
    }

    /**
     * Creates a single Script
     * @param {Object} script a single Script
     * @returns {Promise} Promise
     */
    static create(script) {
        return super.createREST(script, '/automation/v1/scripts/');
    }

    /**
     * helper for this.preDeployTasks() that loads extracted code content back into JSON
     * @param {ScriptItem} metadata a single asset definition
     * @param {string} deployDir directory of deploy files
     * @param {string} [templateName] name of the template used to built defintion (prior applying templating)
     * @returns {Promise<String>} content for metadata.script
     */
    static async _mergeCode(metadata, deployDir, templateName) {
        templateName = templateName || metadata.key;
        let code;
        const codePath = File.normalizePath([
            deployDir,
            this.definition.type,
            templateName + '.' + this.definition.type + '-meta',
        ]);

        if (File.existsSync(codePath + '.ssjs')) {
            code = await File.readFile(
                [deployDir, this.definition.type],
                templateName + '.' + this.definition.type + '-meta',
                'ssjs'
            );
            code = `<script runat="server">\n${code}</script>`;
        } else if (File.existsSync(codePath + '.html')) {
            code = await File.readFile(
                [deployDir, this.definition.type],
                templateName + '.' + this.definition.type + '-meta',
                'html'
            );
        } else {
            throw new Error(`Could not find ${codePath}.ssjs (or html)`);
        }
        return code;
    }
    /**
     * prepares a Script for deployment
     * @param {ScriptItem} metadata a single script activity definition
     * @param {string} dir directory of deploy files
     * @returns {ScriptItem} Promise
     */
    static async preDeployTasks(metadata, dir) {
        // folder
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
            Util.logger.error(`Script '${metadata.key}': ${ex.message}`);
        }

        // code
        metadata.script = await this._mergeCode(metadata, dir);

        return metadata;
    }

    /**
     * helper for buildDefinition
     * handles extracted code if any are found for complex types
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string|string[]} targetDir (List of) Directory where built definitions will be saved
     * @param {ScriptItem} metadata main JSON file that was read from file system
     * @param {Util.TemplateMap} variables variables to be replaced in the metadata
     * @param {string} templateName name of the template to be built
     * @returns {Promise} Promise
     */
    static async buildDefinitionForExtracts(
        templateDir,
        targetDir,
        metadata,
        variables,
        templateName
    ) {
        // get SSJS from filesystem
        let code = await this._mergeCode(metadata, templateDir, templateName);
        // replace template variables with their values
        try {
            code = Mustache.render(code, variables);
        } catch (ex) {
            Util.logger.debug('script.buildDefinitionForExtracts: ' + ex.message);
            throw new Error(
                `${this.definition.type}:: Error applying template variables on ${
                    metadata[this.definition.keyField] + '.' + this.definition.type
                }-meta.ssjs.`
            );
        }

        // write to file
        const targetDirArr = Array.isArray(targetDir) ? targetDir : [targetDir];

        for (const targetDir of targetDirArr) {
            File.writeToFile(
                [targetDir, this.definition.type],
                metadata[this.definition.keyField] + '.' + this.definition.type + '-meta',
                'ssjs',
                code
            );
        }
    }

    /**
     * Splits the script metadata into two parts and parses in a standard manner
     * @param {ScriptItem} metadata a single script activity definition
     * @returns {CodeExtractItem} a single item with code parts extracted
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
            Util.logger.warn(`Script '${metadata.key}': ${ex.message}`);
        }

        // extract SSJS
        const codeArr = [];
        // keep between tags
        const regex = /<\s*script .*?>(.+?)<\s*\/script>/gms;
        let ssjs;
        let fileExt;
        const regexMatches = regex.exec(metadata.script);
        if (regexMatches && regexMatches.length > 1) {
            ssjs = regexMatches[1];
            fileExt = 'ssjs';
        } else {
            ssjs = metadata.script;
            fileExt = 'html';
            Util.logger.warn(
                'Script.parseMetadata:: Could not find script tags, saving whole text in SSJS: ' +
                    metadata.name
            );
        }
        delete metadata.script;
        codeArr.push({
            subFolder: null,
            fileName: metadata.key,
            fileExt: fileExt,
            content: ssjs,
        });

        return { json: metadata, codeArr: codeArr, subFolder: null };
    }
}

// Assign definition & cache to static attributes
Script.definition = require('../MetadataTypeDefinitions').script;
Script.cache = {};
Script.client = undefined;

module.exports = Script;
