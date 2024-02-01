'use strict';

import TYPE from '../../types/mcdev.d.js';
import TransactionalMessage from './TransactionalMessage.js';
import { Util } from '../util/util.js';
import File from '../util/file.js';
import cache from '../util/cache.js';

/**
 * TransactionalSMS MetadataType
 *
 * @augments TransactionalMessage
 */
class TransactionalSMS extends TransactionalMessage {
    static subType = 'sms';
    /**
     * clean up after deleting a metadata item
     *
     * @param {string} customerKey Identifier of metadata item
     * @returns {void}
     */
    static async postDeleteTasks(customerKey) {
        // delete local copy: retrieve/cred/bu/type/...-meta.json
        // delete local copy: retrieve/cred/bu/type/...-meta.amp
        super.postDeleteTasks(customerKey, [`${this.definition.type}-meta.amp`]);
    }

    /**
     * prepares for deployment
     *
     * @param {TYPE.MetadataTypeItem} metadata a single item
     * @param {string} deployDir directory of deploy files
     * @returns {Promise.<TYPE.MetadataTypeItem>} Promise
     */
    static async preDeployTasks(metadata, deployDir) {
        // code
        metadata.content = {
            message: await this._mergeCode(metadata, deployDir),
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
            // subscriptions: mobileKeyword
            if (metadata.subscriptions?.keyword) {
                // we merely want to be able to show an error if it does not exist
                cache.searchForField(
                    'mobileKeyword',
                    metadata.subscriptions.shortCode + '.' + metadata.subscriptions.keyword,
                    'c__codeKeyword',
                    'id'
                );
            }
        }
        return metadata;
    }
    /**
     * helper for {@link TransactionalSMS.preDeployTasks} that loads extracted code content back into JSON
     *
     * @param {TYPE.MetadataTypeItem} metadata a single definition
     * @param {string} deployDir directory of deploy files
     * @param {string} [templateName] name of the template used to built defintion (prior applying templating)
     * @returns {Promise.<string>} content for metadata.script
     */
    static async _mergeCode(metadata, deployDir, templateName) {
        templateName ||= metadata[this.definition.keyField];
        const codePath = File.normalizePath([
            deployDir,
            this.definition.type,
            templateName + '.' + this.definition.type + '-meta',
        ]);

        if (await File.pathExists(codePath + '.amp')) {
            return await File.readFilteredFilename(
                [deployDir, this.definition.type],
                templateName + '.' + this.definition.type + '-meta',
                'amp'
            );
        } else {
            throw new Error(`Could not find ${codePath}.amp`);
        }
    }
    /**
     * manages post retrieve steps
     *
     * @param {TYPE.MetadataTypeItem} metadata a single item
     * @returns {Promise.<TYPE.CodeExtractItem>} Array with one metadata object and one ssjs string
     */
    static async postRetrieveTasks(metadata) {
        // extract message body
        const codeArr = [];
        // keep between tags
        const { fileExt, code } = await this.prepExtractedCode(metadata.content?.message);
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
                    metadata.subscriptions.shortCode + '.' + metadata.subscriptions.keyword,
                    'c__codeKeyword',
                    'id'
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
     * helper for {@link TransactionalSMS.postRetrieveTasks} and {@link TransactionalSMS._buildForNested}
     *
     * @param {string} metadataScript the code of the file
     * @returns {Promise.<{fileExt:string,code:string}>} returns found extension and file content
     */
    static async prepExtractedCode(metadataScript) {
        const code = await File.beautify_beautyAmp(metadataScript, false);
        const fileExt = 'amp';

        return { fileExt, code };
    }
    /**
     * helper for {@link TransactionalMessage.buildDefinition}
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
     * helper for {@link TransactionalMessage.buildTemplate}
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
     * helper for {@link TransactionalSMS.buildTemplateForNested} / {@link TransactionalSMS.buildDefinitionForNested}
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
        const file = await this.prepExtractedCode(code, metadata.name);
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
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
TransactionalSMS.definition = MetadataTypeDefinitions.transactionalSMS;

export default TransactionalSMS;
