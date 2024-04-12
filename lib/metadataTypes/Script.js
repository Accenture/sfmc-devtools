'use strict';

import MetadataType from './MetadataType.js';
import { Util } from '../util/util.js';
import File from '../util/file.js';

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
 * @typedef {import('../../types/mcdev.d.js').ScriptItem} ScriptItem
 * @typedef {import('../../types/mcdev.d.js').ScriptMap} ScriptMap
 */

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
     * @param {string} [retrieveDir] Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<{metadata: ScriptMap, type: string}>} Promise
     */
    static async retrieve(retrieveDir, _, __, key) {
        await File.initPrettier('ssjs');
        return super.retrieveREST(retrieveDir, '/automation/v1/scripts/', null, key);
    }
    /**
     * Retrieves script metadata for caching
     *
     * @returns {Promise.<{metadata: ScriptMap, type: string}>} Promise
     */
    static async retrieveForCache() {
        return super.retrieveREST(null, '/automation/v1/scripts/');
    }

    /**
     * Retrieve a specific Script by Name
     *
     * @param {string} templateDir Directory where retrieved metadata directory will be saved
     * @param {string} name name of the metadata file
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {Promise.<{metadata: ScriptItem, type: string}>} Promise
     */
    static async retrieveAsTemplate(templateDir, name, templateVariables) {
        await File.initPrettier('ssjs');
        return super.retrieveREST(
            templateDir,
            '/automation/v1/scripts/?$filter=name%20eq%20' + encodeURIComponent(name),
            templateVariables
        );
    }

    /**
     * Updates a single Script
     *
     * @param {MetadataTypeItem} script a single Script
     * @returns {Promise} Promise
     */
    static update(script) {
        return super.updateREST(script, '/automation/v1/scripts/' + script.ssjsActivityId);
    }

    /**
     * Creates a single Script
     *
     * @param {MetadataTypeItem} script a single Script
     * @returns {Promise} Promise
     */
    static create(script) {
        return super.createREST(script, '/automation/v1/scripts/');
    }

    /**
     * helper for {@link Script.preDeployTasks} that loads extracted code content back into JSON
     *
     * @param {ScriptItem} metadata a single asset definition
     * @param {string} deployDir directory of deploy files
     * @param {string} [templateName] name of the template used to built defintion (prior applying templating)
     * @returns {Promise.<string>} content for metadata.script
     */
    static async _mergeCode(metadata, deployDir, templateName) {
        templateName ||= metadata[this.definition.keyField];
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
     * @param {ScriptItem} metadata a single script activity definition
     * @param {string} dir directory of deploy files
     * @returns {Promise.<ScriptItem>} Promise
     */
    static async preDeployTasks(metadata, dir) {
        // folder
        super.setFolderId(metadata);

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
     * @param {ScriptItem} metadata main JSON file that was read from file system
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
     * @param {ScriptItem} metadata main JSON file that was read from file system
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
     * helper for {@link Script.buildTemplateForNested} / {@link Script.buildDefinitionForNested}
     * handles extracted code if any are found for complex types
     *
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string|string[]} targetDir (List of) Directory where built definitions will be saved
     * @param {ScriptItem} metadata main JSON file that was read from file system
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
        // get SSJS from filesystem
        let code = await this._mergeCode(metadata, templateDir, templateName);
        // try to remove script tags and decide on file extension (html/ssjs)
        const file = this.prepExtractedCode(code, metadata.name);
        const fileExt = file.fileExt;
        code = fileExt === 'ssjs' ? file.code.replace(/^\n/, '') : file.code;
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
                }-meta.ssjs.`
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
     * manages post retrieve steps
     *
     * @param {ScriptItem} metadata a single item
     * @returns {CodeExtractItem} a single item with code parts extracted
     */
    static postRetrieveTasks(metadata) {
        // folder
        super.setFolderPath(metadata);

        // extract SSJS
        const codeArr = [];
        // keep between tags
        const { fileExt, code } = this.prepExtractedCode(metadata.script, metadata.name);
        delete metadata.script;
        codeArr.push({
            subFolder: null,
            fileName: metadata[this.definition.keyField],
            fileExt: fileExt,
            content: code,
        });

        return { json: metadata, codeArr: codeArr, subFolder: null };
    }

    /**
     * helper for {@link Script.postRetrieveTasks} and {@link Script._buildForNested}
     *
     * @param {string} metadataScript the code of the file
     * @param {string} metadataName the name of the metadata
     * @returns {{fileExt:string,code:string}} returns found extension and file content
     */
    static prepExtractedCode(metadataScript, metadataName) {
        let code;
        let fileExt;
        const ssjs = Util.getSsjs(metadataScript);
        if (ssjs) {
            code = ssjs;
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
            File.normalizePath([path, `${key}.${this.definition.type}-meta.ssjs`]),
            File.normalizePath([path, `${key}.${this.definition.type}-meta.html`]),
        ]);
        return fileList;
    }
    /**
     * helper to allow us to select single metadata entries via REST
     *
     * @private
     * @param {string} key customer key
     * @returns {Promise.<string>} objectId or enpty string
     */
    static async _getObjectIdForSingleRetrieve(key) {
        const name = key.startsWith('name:') ? key.slice(5) : null;
        const filter = name
            ? '?$filter=name%20eq%20' + encodeURIComponent(name)
            : '?$filter=key%20eq%20' + encodeURIComponent(key);
        const results = await this.client.rest.get('/automation/v1/scripts/' + filter);
        const items = results?.items || [];
        const found = items.find((item) =>
            name ? item[this.definition.nameField] === name : item[this.definition.keyField] === key
        );
        return found?.ssjsActivityId || null;
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
            Util.logger.error(` - ${this.definition.type} not found`);
            return false;
        }
        return super.deleteByKeyREST('/automation/v1/scripts/' + objectId, customerKey);
    }
    /**
     * clean up after deleting a metadata item
     *
     * @param {string} customerKey Identifier of metadata item
     * @returns {Promise.<void>} -
     */
    static async postDeleteTasks(customerKey) {
        // delete local copy: retrieve/cred/bu/.../...-meta.json
        // delete local copy: retrieve/cred/bu/.../...-meta.ssjs
        // delete local copy: retrieve/cred/bu/.../...-meta.html
        await super.postDeleteTasks(customerKey, [
            `${this.definition.type}-meta.ssjs`,
            `${this.definition.type}-meta.html`,
        ]);
    }
}

// Assign definition & cache to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
Script.definition = MetadataTypeDefinitions.script;

export default Script;
