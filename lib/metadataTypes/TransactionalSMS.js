'use strict';

const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const File = require('../util/file');
const beautifier = require('beauty-amp-core');

/**
 * TransactionalSMS MetadataType
 *
 * @augments MetadataType
 */
class TransactionalSMS extends MetadataType {
    /**
     * Retrieves Metadata of Mobile Keywords
     * Endpoint /legacy/v1/beta/mobile/code/ return all Mobile Codes with all details.
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void} [_] unused parameter
     * @param {void} [__] unused parameter
     * @param {void} [___] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of metadata
     */
    static async retrieve(retrieveDir, _, __, ___, key) {
        let keyList;
        const baseUri = '/messaging/v1/sms/definitions/';
        if (!key) {
            // Retrieve all
            const response = this.definition.restPagination
                ? await this.client.rest.getBulk(baseUri)
                : await this.client.rest.get(baseUri);
            keyList = Object.keys(this.parseResponseBody(response));
        } else {
            // Retrieve single
            keyList = [key];
        }

        // get all sms with additional details not given by the list endpoint
        const details = keyList
            ? await Promise.all(keyList.map((key) => this.client.rest.get(baseUri + (key || ''))))
            : [];

        const parsed = this.parseResponseBody({ definitions: details });

        // * retrieveDir is mandatory in this method as it is not used for caching (there is a seperate method for that)
        const savedMetadata = await this.saveResults(parsed, retrieveDir, null, null);
        Util.logger.info(
            `Downloaded: ${this.definition.type} (${Object.keys(savedMetadata).length})`
        );

        return { metadata: savedMetadata, type: this.definition.type };
    }

    /**
     * Retrieves event definition metadata for caching
     *
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of metadata
     */
    static retrieveForCache() {
        return super.retrieveREST(null, '/messaging/v1/sms/definitions/');
    }
    /**
     * Updates a single item
     *
     * @param {TYPE.MetadataTypeItem} metadata a single item
     * @returns {Promise} Promise
     */
    static update(metadata) {
        return super.updateREST(metadata, '/messaging/v1/sms/definitions');
    }

    /**
     * Creates a single item
     *
     * @param {TYPE.MetadataTypeItem} metadata a single item
     * @returns {Promise} Promise
     */
    static create(metadata) {
        return super.createREST(metadata, '/messaging/v1/sms/definitions');
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
        return this.parseMetadata(metadata);
    }

    /**
     * Splits the metadata into two parts and parses in a standard manner
     *
     * @param {TYPE.ScripMetadataTypeItemtItem} metadata a single item
     * @returns {TYPE.CodeExtractItem} a single item with code parts extracted
     */
    static parseMetadata(metadata) {
        // extract message body
        const codeArr = [];
        // keep between tags
        const { fileExt, code } = this.prepExtractedCode(metadata.content.message);
        delete metadata.content;
        codeArr.push({
            subFolder: null,
            fileName: metadata[this.definition.keyField],
            fileExt: fileExt,
            content: code,
        });

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
