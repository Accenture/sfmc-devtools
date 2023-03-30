'use strict';

const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const File = require('../util/file');
const beautifier = require('beauty-amp-core');
const cache = require('../util/cache');

/**
 * MobileKeyword MetadataType
 *
 * @augments MetadataType
 */
class MobileKeyword extends MetadataType {
    /**
     * Retrieves Metadata of Mobile Keywords
     * Endpoint /legacy/v1/beta/mobile/keyword/ return all Mobile Keywords with all details.
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void} [_] unused parameter
     * @param {void} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<TYPE.MetadataTypeMapObj> | void} Promise of metadata
     */
    static retrieve(retrieveDir, _, __, key) {
        try {
            return super.retrieveREST(
                retrieveDir,
                '/legacy/v1/beta/mobile/keyword/' +
                    (key
                        ? key.startsWith('id:')
                            ? key.slice(3)
                            : `?view=simple&$where=keyword%20eq%20%27${key}%27%20`
                        : '?view=simple'),
                null,
                key
            );
        } catch (ex) {
            // if the mobileMessage does not exist, the API returns the error "Request failed with status code 400 (ERR_BAD_REQUEST)" which would otherwise bring execution to a hold
            if (key && ex.code === 'ERR_BAD_REQUEST') {
                Util.logger.info(
                    `Downloaded: ${this.definition.type} (0)${Util.getKeysString(key)}`
                );
            } else {
                throw ex;
            }
        }
    }

    /**
     * Retrieves event definition metadata for caching
     *
     * @param {void} _ parameter not used
     * @param {void} __ parameter not used
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of metadata
     */
    static retrieveForCache(_, __, key) {
        return this.retrieve(null, null, null, key);
    }

    /**
     * Retrieve a specific keyword
     *
     * @param {string} templateDir Directory where retrieved metadata directory will be saved
     * @param {string} name name of the metadata file
     * @param {TYPE.TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {Promise.<TYPE.MetadataTypeItemObj>} Promise of metadata
     */
    static async retrieveAsTemplate(templateDir, name, templateVariables) {
        // TODO: Decide if we want to keep default handling (and move other types) or keep unique parsing?
        try {
            const res = await this.client.rest.get(
                `/legacy/v1/beta/mobile/keyword/?view=simple&$where=keyword%20eq%20%27${name}%27%20`
            );
            const metadata = JSON.parse(
                Util.replaceByObject(
                    JSON.stringify(Util.templateSearchResult(res.entry, 'keyword', name)),
                    templateVariables
                )
            );
            if (!metadata.code.id) {
                throw new Error(
                    `MobileKeyword.parseMetadata:: ` +
                        `No Mobile Code was found for ` +
                        `event: ${metadata.name}. ` +
                        `This cannot be templated`
                );
            }
            // remove all fields listed in Definition for templating
            this.keepTemplateFields(metadata);
            await File.writeJSONToFile(
                [templateDir, this.definition.type].join('/'),
                metadata.keyword + '.' + this.definition.type + '-meta',
                metadata
            );
            Util.logger.info(`- templated ${this.definition.type}: ${name}`);
            return { metadata: metadata, type: this.definition.type };
        } catch (ex) {
            Util.logger.error('MobileKeyword.retrieveAsTemplate:: ' + ex);
            return null;
        }
    }

    /**
     * Creates a single Event Definition
     *
     * @param {TYPE.MetadataTypeItem} MobileKeyword a single Event Definition
     * @returns {Promise} Promise
     */
    static create(MobileKeyword) {
        return super.createREST(MobileKeyword, '/legacy/v1/beta/mobile/keyword/');
    }
    /**
     * Updates a single item
     *
     * @param {TYPE.MetadataTypeItem} metadata a single item
     * @returns {Promise} Promise
     */
    static update(metadata) {
        return super.updateREST(
            metadata,
            '/legacy/v1/beta/mobile/keyword/' + metadata[this.definition.idField],
            'post' // upsert API, post for insert and update!
        );
    }

    /**
     * manages post retrieve steps
     *
     * @param {TYPE.MetadataTypeItem} metadata a single item
     * @returns {TYPE.CodeExtractItem | TYPE.MetadataTypeItem} Array with one metadata object and one ssjs string
     */
    static postRetrieveTasks(metadata) {
        if (metadata.responseMessage) {
            // extract message body
            const codeArr = [];
            // keep between tags
            const { fileExt, code } = this.prepExtractedCode(metadata.responseMessage);
            delete metadata.responseMessage;
            codeArr.push({
                subFolder: null,
                fileName: metadata[this.definition.keyField],
                fileExt: fileExt,
                content: code,
            });
            return { json: metadata, codeArr: codeArr, subFolder: null };
        } else {
            return metadata;
        }
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
        if (!code) {
            return null;
        }
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
     * prepares an event definition for deployment
     *
     * @param {TYPE.MetadataTypeItem} metadata a single MobileKeyword
     * @param {string} deployDir directory of deploy files
     * @returns {Promise.<TYPE.MetadataTypeItem>} Promise
     */
    static async preDeployTasks(metadata, deployDir) {
        // code
        metadata.responseMessage = await this._mergeCode(metadata, deployDir);

        // mobileCode
        metadata.code.id = cache.searchForField('mobileCode', metadata.code.code, 'code', 'id');
        return metadata;
    }
    /**
     * helper for {@link createREST}
     *
     * @param {TYPE.MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {object} apiResponse varies depending on the API call
     * @returns {void}
     */
    static async postCreateTasks(metadataEntry, apiResponse) {
        await super.postCreateTasks_legacyApi(metadataEntry, apiResponse);
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
            // keeep this as a debug message, as it is optional and hence not an error
            Util.logger.debug(`Could not find ${codePath}.amp`);
            return null;
        }
    }
    /**
     * Delete a metadata item from the specified business unit
     *
     * @param {string} key Identifier of item
     * @returns {Promise.<boolean>} deletion success status
     */
    static deleteByKey(key) {
        Util.logger.info(
            ' - Note: As long as the provided API key once existed, you will not see an error even if the mobileKeyword is already deleted.'
        );
        return super.deleteByKeyREST('/legacy/v1/beta/mobile/keyword/' + key, key, false);
    }

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
MobileKeyword.definition = require('../MetadataTypeDefinitions').mobileKeyword;

module.exports = MobileKeyword;
