'use strict';

const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const File = require('../util/file');
const cache = require('../util/cache');

/**
 * Script MetadataType
 *
 * @augments MetadataType
 */
class Script extends MetadataType {
    /**
     * Retrieves Metadata of Script
     * Endpoint /automation/v1/scripts/ return all Scripts with all details.
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void} [_] unused parameter
     * @param {void} [__] unused parameter
     * @param {void} [___] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<{metadata: TYPE.ScriptMap, type: string}>} Promise
     */
    static async retrieve(retrieveDir, _, __, ___, key) {
        await File.initPrettier('ssjs');
        return super.retrieveREST(retrieveDir, '/automation/v1/scripts/', null, null, key);
    }
    /**
     * Retrieves script metadata for caching
     *
     * @returns {Promise.<{metadata: TYPE.ScriptMap, type: string}>} Promise
     */
    static async retrieveForCache() {
        return super.retrieveREST(null, '/automation/v1/scripts/');
    }

    /**
     * Retrieve a specific Script by Name
     *
     * @param {string} templateDir Directory where retrieved metadata directory will be saved
     * @param {string} name name of the metadata file
     * @param {TYPE.TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {Promise.<{metadata: TYPE.Script, type: string}>} Promise
     */
    static async retrieveAsTemplate(templateDir, name, templateVariables) {
        await File.initPrettier('ssjs');
        return super.retrieveREST(
            templateDir,
            '/automation/v1/scripts/?$filter=name%20eq%20' + encodeURIComponent(name),
            null,
            templateVariables
        );
    }

    /**
     * manages post retrieve steps
     *
     * @param {TYPE.ScriptItem} metadata a single script
     * @returns {TYPE.CodeExtractItem} Array with one metadata object and one ssjs string
     */
    static postRetrieveTasks(metadata) {
        return this.parseMetadata(metadata);
    }

    /**
     * Updates a single Script
     *
     * @param {TYPE.MetadataTypeItem} script a single Script
     * @returns {Promise} Promise
     */
    static update(script) {
        return super.updateREST(script, '/automation/v1/scripts/' + script.ssjsActivityId);
    }

    /**
     * Creates a single Script
     *
     * @param {TYPE.MetadataTypeItem} script a single Script
     * @returns {Promise} Promise
     */
    static create(script) {
        return super.createREST(script, '/automation/v1/scripts/');
    }

    /**
     * helper for {@link preDeployTasks} that loads extracted code content back into JSON
     *
     * @param {TYPE.ScriptItem} metadata a single asset definition
     * @param {string} deployDir directory of deploy files
     * @param {string} [templateName] name of the template used to built defintion (prior applying templating)
     * @returns {Promise.<string>} content for metadata.script
     */
    static async _mergeCode(metadata, deployDir, templateName) {
        templateName = templateName || metadata.key;
        let code;
        const codePath = File.normalizePath([
            deployDir,
            this.definition.type,
            templateName + '.' + this.definition.type + '-meta',
        ]);

        if (await File.pathExists(codePath + '.ssjs')) {
            code = await File.readFilteredFilename(
                [deployDir, this.definition.type],
                templateName + '.' + this.definition.type + '-meta',
                'ssjs'
            );
            code = `<script runat="server">\n${code}</script>`;
        } else if (await File.pathExists(codePath + '.html')) {
            code = await File.readFilteredFilename(
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
     *
     * @param {TYPE.ScriptItem} metadata a single script activity definition
     * @param {string} dir directory of deploy files
     * @returns {TYPE.ScriptItem} Promise
     */
    static async preDeployTasks(metadata, dir) {
        // folder
        metadata.categoryId = cache.searchForField('folder', metadata.r__folder_Path, 'Path', 'ID');
        delete metadata.r__folder_Path;

        // code
        metadata.script = await this._mergeCode(metadata, dir);

        return metadata;
    }
    /**
     * helper for {@link MetadataType.buildDefinition}
     * handles extracted code if any are found for complex types
     *
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string|string[]} targetDir (List of) Directory where built definitions will be saved
     * @param {TYPE.ScriptItem} metadata main JSON file that was read from file system
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
     * @param {TYPE.ScriptItem} metadata main JSON file that was read from file system
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
     * @param {TYPE.ScriptItem} metadata main JSON file that was read from file system
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
        const rawCode = await this._mergeCode(metadata, templateDir, templateName);
        // get SSJS from filesystem
        const file = Script.extractCodeFromJson(rawCode, metadata.name);
        let code = file.code;
        const fileExt = file.fileExt;
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
                }-meta.ssjs.`
            );
        }

        code = code.replace(/^\n/, '');

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
     * Splits the script metadata into two parts and parses in a standard manner
     *
     * @param {TYPE.ScriptItem} metadata a single script activity definition
     * @returns {TYPE.CodeExtractItem} a single item with code parts extracted
     */
    static parseMetadata(metadata) {
        // folder
        super.setFolderPath(metadata);

        // extract SSJS
        const codeArr = [];
        // keep between tags
        const { fileExt, code } = Script.extractCodeFromJson(metadata.script, metadata.name);
        delete metadata.script;
        codeArr.push({
            subFolder: null,
            fileName: metadata.key,
            fileExt: fileExt,
            content: code,
        });

        return { json: metadata, codeArr: codeArr, subFolder: null };
    }
    /**
     * helper for {@link parseMetadata} and {@link _buildForNested}
     *
     * @param {string} metadataScript the code of the file
     * @param {string} metadataName the name of the metadata
     * @returns {{fileExt:string,code:string}} returns found extension and file content
     */
    static extractCodeFromJson(metadataScript, metadataName) {
        const regex = /<\s*script .*?>(.+?)<\s*\/script>/gms;
        let code;
        let fileExt;
        const regexMatches = regex.exec(metadataScript);
        if (regexMatches?.length > 1) {
            code = regexMatches[1];
            fileExt = 'ssjs';
        } else {
            code = metadataScript;
            fileExt = 'html';
            Util.logger.warn(
                ` - Could not find script tags, saving code in ${metadataName}.script-meta.html instead of as SSJS file.`
            );
        }
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
            File.normalizePath([path, `${key}.${this.definition.type}-meta.ssjs`]),
            File.normalizePath([path, `${key}.${this.definition.type}-meta.html`]),
        ]);
        return fileList;
    }
}

// Assign definition & cache to static attributes
Script.definition = require('../MetadataTypeDefinitions').script;

module.exports = Script;
