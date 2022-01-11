'use strict';

const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const File = require('../util/file');

/**
 * FileTransfer MetadataType
 * @augments MetadataType
 */
class FileTransfer extends MetadataType {
    /**
     * Retrieves Metadata of FileTransfer Activity.
     * Endpoint /automation/v1/filetransfers/ returns all File Transfers
     * @param {String} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise} Promise
     */
    static async retrieve(retrieveDir) {
        return super.retrieveREST(retrieveDir, '/automation/v1/filetransfers/', null);
    }
    /**
     * Retrieves Metadata of  FileTransfer Activity for caching
     * @returns {Promise} Promise
     */
    static async retrieveForCache() {
        return super.retrieveREST(null, '/automation/v1/filetransfers/', null);
    }

    /**
     * Retrieve a specific File Transfer Definition by Name
     * @param {String} templateDir Directory where retrieved metadata directory will be saved
     * @param {String} name name of the metadata file
     * @param {Object} variables variables to be replaced in the metadata
     * @returns {Promise} Promise
     */
    static async retrieveAsTemplate(templateDir, name, variables) {
        const res = await this.client.rest.get(
            '/automation/v1/filetransfers/?$filter=name%20eq%20' + encodeURIComponent(name)
        );
        if (res && Array.isArray(res.items) && res.items.length) {
            // eq-operator returns a similar, not exact match and hence might return more than 1 entry
            const [metadata] = res.items.filter((item) => item.name === name);
            if (!metadata) {
                Util.logger.error(`No ${this.definition.typeName} found with name "${name}"`);
                return;
            }

            // get full definition
            const extended = await this.client.rest.get(
                '/automation/v1/filetransfers/' + metadata.id
            );
            const val = JSON.parse(
                Util.replaceByObject(JSON.stringify(this.parseMetadata(extended.body)), variables)
            );

            // remove all fields listed in Definition for templating
            this.keepTemplateFields(val);
            File.writeJSONToFile(
                [templateDir, this.definition.type].join('/'),
                val.customerKey + '.' + this.definition.type + '-meta',
                JSON.parse(Util.replaceByObject(JSON.stringify(val), variables))
            );
            Util.logger.info(
                `FileTransfer.retrieveAsTemplate:: Written Metadata to filesystem (${name})`
            );
            return { metadata: val, type: this.definition.type };
        } else if (res.body && res.body.items) {
            Util.logger.error(`No ${this.definition.typeName} found with name "${name}"`);
        } else {
            throw new Error(
                `Encountered unknown error when retrieveing ${
                    this.definition.typeName
                } "${name}": ${JSON.stringify(res.body)}`
            );
        }
    }

    /**
     * manages post retrieve steps
     * @param {Object} metadata a single fileTransfer activity definition
     * @returns {Object[]} metadata
     */
    static postRetrieveTasks(metadata) {
        const values = this.parseMetadata(metadata);
        return values;
    }

    /**
     * Creates a single File Transfer
     * @param {Object} fileTransfer a single File Transfer
     * @returns {Promise} Promise
     */
    static create(fileTransfer) {
        return super.createREST(fileTransfer, '/automation/v1/filetransfers/');
    }

    /**
     * Updates a single File Transfer
     * @param {Object} fileTransfer a single File Transfer
     * @returns {Promise} Promise
     */
    static update(fileTransfer) {
        return super.updateREST(fileTransfer, '/automation/v1/filetransfers/' + fileTransfer.id);
    }

    /**
     * prepares a fileTransfer for deployment
     * @param {Object} metadata a single fileTransfer activity definition
     * @returns {Promise} Promise
     */
    static async preDeployTasks(metadata) {
        metadata.fileTransferLocationId = Util.getFromCache(
            this.cache,
            'ftpLocation',
            metadata.r__ftpLocation_name,
            'name',
            'id'
        );
        return metadata;
    }
    /**
     * parses retrieved Metadata before saving
     * @param {Object} metadata a single fileTransfer activity definition
     * @returns {Array} Array with one metadata object and one sql string
     */
    static parseMetadata(metadata) {
        metadata.r__ftpLocation_name = Util.getFromCache(
            this.cache,
            'ftpLocation',
            metadata.fileTransferLocationId,
            'id',
            'name'
        );
        delete metadata.fileTransferLocationId;
        return metadata;
    }
}

// Assign definition to static attributes
FileTransfer.definition = require('../MetadataTypeDefinitions').fileTransfer;
FileTransfer.cache = {};
FileTransfer.client = undefined;

module.exports = FileTransfer;
