'use strict';

const TYPE = require('../../types/mcdev.d');
const TransactionalMessage = require('./TransactionalMessage');
const Util = require('../util/util');
const File = require('../util/file');
const beautifier = require('beauty-amp-core');
const cache = require('../util/cache');

/**
 * TransactionalSMS MetadataType
 *
 * @augments MetadataType
 */
class TransactionalSMS extends TransactionalMessage {
    static subType = 'sms';
    /**
     * clean up after deleting a metadata item
     *
     * @param {TYPE.BuObject} buObject references credentials
     * @param {string} customerKey Identifier of metadata item
     * @returns {void}
     */
    static async postDeleteTasks(buObject, customerKey) {
        // delete local copy: retrieve/cred/bu/type/...json
        const fileName = File.normalizePath([
            this.properties.directories.retrieve,
            buObject.credential,
            buObject.businessUnit,
            this.definition.type,
            `${customerKey}.${this.definition.type}-meta.`,
        ]);
        await File.remove(fileName + 'json');
        await File.remove(fileName + 'amp');
    }

    /**
     * prepares for deployment
     *
     * @param {TYPE.MetadataTypeItem} metadata a single item
     * @param {string} dir directory of deploy files
     * @returns {TYPE.MetadataTypeItem} Promise
     */
    static async preDeployTasks(metadata, dir) {
        // code
        metadata.content = {
            message: await this._mergeCode(metadata, dir),
        };

        if (this._isHTML(metadata.content?.message)) {
            // keep this as a non-blocking warning because the test not 100% accurate
            Util.logger.warn(
                ` - ${this.definition.type} ${metadata[this.definition.nameField]} (${
                    metadata[this.definition.keyField]
                }): HTML detected`
            );
        }

        // subscriptions: mobileCode
        if (metadata.subscriptions?.shortCode) {
            // we merely want to be able to show an error if it does not exist
            cache.searchForField('mobileCode', metadata.subscriptions.shortCode, 'code', 'code');
        }
        // subscriptions: mobileKeyword
        if (metadata.subscriptions?.keyword) {
            // we merely want to be able to show an error if it does not exist
            cache.searchForField(
                'mobileKeyword',
                metadata.subscriptions.keyword,
                'keyword',
                'keyword'
            );
        }
        return metadata;
    }
    /**
     * helper for {@link preDeployTasks} that loads extracted code content back into JSON
     *
     * @param {TYPE.MetadataTypeItem} metadata a single definition
     * @param {string} deployDir directory of deploy files
     * @param {string} [templateName] name of the template used to built defintion (prior applying templating)
     * @returns {Promise.<string>} content for metadata.script
     */
    static async _mergeCode(metadata, deployDir, templateName) {
        templateName = templateName || metadata[this.definition.keyField];
        let code;
        const codePath = File.normalizePath([
            deployDir,
            this.definition.type,
            templateName + '.' + this.definition.type + '-meta',
        ]);

        if (await File.pathExists(codePath + '.amp')) {
            code = await File.readFilteredFilename(
                [deployDir, this.definition.type],
                templateName + '.' + this.definition.type + '-meta',
                'amp'
            );
        } else {
            throw new Error(`Could not find ${codePath}.amp`);
        }
        return code;
    }
    /**
     * manages post retrieve steps
     *
     * @param {TYPE.MetadataTypeItem} metadata a single item
     * @returns {TYPE.CodeExtractItem} Array with one metadata object and one ssjs string
     */
    static postRetrieveTasks(metadata) {
        // extract message body
        const codeArr = [];
        // keep between tags
        const { fileExt, code } = this.prepExtractedCode(metadata.content?.message);
        delete metadata.content;
        codeArr.push({
            subFolder: null,
            fileName: metadata[this.definition.keyField],
            fileExt: fileExt,
            content: code,
        });

        if (this._isHTML(code)) {
            Util.logger.warn(
                ` - ${this.definition.type} ${metadata[this.definition.nameField]} (${
                    metadata[this.definition.keyField]
                }): HTML detected`
            );
        }

        // subscriptions: mobileCode
        if (metadata.subscriptions?.shortCode) {
            try {
                // we merely want to be able to show a warning if it does not exist
                cache.searchForField(
                    'mobileCode',
                    metadata.subscriptions.shortCode,
                    'code',
                    'code'
                );
            } catch {
                Util.logger.warn(
                    ` - ${this.definition.type} ${metadata[this.definition.nameField]} (${
                        metadata[this.definition.keyField]
                    }): Could not find mobileCode ${metadata.subscriptions.shortCode}.`
                );
            }
        }
        // subscriptions: mobileKeyword
        if (metadata.subscriptions?.keyword) {
            try {
                // we merely want to be able to show a warning if it does not exist
                cache.searchForField(
                    'mobileKeyword',
                    metadata.subscriptions.keyword,
                    'keyword',
                    'keyword'
                );
            } catch {
                Util.logger.warn(
                    ` - ${this.definition.type} ${metadata[this.definition.nameField]} (${
                        metadata[this.definition.keyField]
                    }): Could not find mobileKeyword ${metadata.subscriptions.keyword}.`
                );
            }
        }

        return { json: metadata, codeArr: codeArr, subFolder: null };
    }
    /**
     * helper for {@link parseMetadata} and {@link _buildForNested}
     *
     * @param {string} metadataScript the code of the file
     * @returns {{fileExt:string,code:string}} returns found extension and file content
     */
    static prepExtractedCode(metadataScript) {
        // immutable at the moment:
        const ampscript = {
            capitalizeAndOrNot: true,
            capitalizeIfFor: true,
            capitalizeSet: true,
            capitalizeVar: true,
            maxParametersPerLine: 4,
        };
        // immutable at the moment:
        const editor = {
            insertSpaces: true,
            tabSize: 4,
        };
        // logs trough console only for the moment.
        const logs = {
            loggerOn: false, // <= disable logging
        };

        beautifier.setup(ampscript, editor, logs);
        const code = beautifier.beautify(metadataScript);
        const fileExt = 'amp';

        return { fileExt, code };
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
        const file = this.prepExtractedCode(code, metadata.name);
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
                }-meta.${fileExt}.`
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
     * very simplified test for HTML code in our SMS
     *
     * @param {string} code sms source code
     * @returns {boolean} true if HTML is found
     */
    static _isHTML(code) {
        return /(<([^>]+)>)/gi.test(code);
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
}

// Assign definition to static attributes
TransactionalSMS.definition = require('../MetadataTypeDefinitions').transactionalSMS;

module.exports = TransactionalSMS;
