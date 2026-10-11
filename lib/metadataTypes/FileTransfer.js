'use strict';

import MetadataType from './MetadataType.js';
import { Util } from '../util/util.js';
import cache from '../util/cache.js';

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
 * FileTransfer MetadataType
 *
 * @augments MetadataType
 */
class FileTransfer extends MetadataType {
    /**
     * Retrieves Metadata of FileTransfer Activity.
     * Endpoint /automation/v1/filetransfers/ returns all File Transfers
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise
     */
    static async retrieve(retrieveDir, _, __, key) {
        return super.retrieveREST(retrieveDir, '/automation/v1/filetransfers/', key);
    }

    /**
     * Retrieves Metadata of  FileTransfer Activity for caching
     *
     * @returns {Promise.<MetadataTypeMapObj>} Promise
     */
    static async retrieveForCache() {
        return super.retrieveREST(null, '/automation/v1/filetransfers/');
    }

    /**
     * Creates a single File Transfer
     *
     * @param {MetadataTypeItem} fileTransfer a single File Transfer
     * @returns {Promise} Promise
     */
    static create(fileTransfer) {
        return super.createREST(fileTransfer, '/automation/v1/filetransfers/');
    }

    /**
     * Updates a single File Transfer
     *
     * @param {MetadataTypeItem} fileTransfer a single File Transfer
     * @returns {Promise} Promise
     */
    static update(fileTransfer) {
        return super.updateREST(fileTransfer, '/automation/v1/filetransfers/' + fileTransfer.id);
    }

    /**
     * prepares a fileTransfer for deployment
     *
     * @param {MetadataTypeItem} metadata a single fileTransfer activity definition
     * @returns {Promise} Promise
     */
    static async preDeployTasks(metadata) {
        if (metadata.r__fileLocation_name) {
            metadata.fileTransferLocationId = cache.searchForField(
                'fileLocation',
                metadata.r__fileLocation_name,
                'name',
                'id'
            );
            delete metadata.r__fileLocation_name;
        } else {
            throw new Error(
                'r__fileLocation_name not set. Please ensure the source is properly set up and re-retrieve it first.'
            );
        }
        return metadata;
    }

    /**
     * manages post retrieve steps
     *
     * @param {MetadataTypeItem} metadata a single fileTransfer activity definition
     * @returns {MetadataTypeItem} parsed metadata
     */
    static postRetrieveTasks(metadata) {
        try {
            metadata.r__fileLocation_name = cache.searchForField(
                'fileLocation',
                metadata.fileTransferLocationId,
                'id',
                'name'
            );
            delete metadata.fileTransferLocationId;
        } catch (ex) {
            Util.logger.warn(
                ` - FileTransfer '${metadata[this.definition.keyField]}': ${ex.message}`
            );
        }

        return metadata;
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
        const filter = name ? '?$filter=name%20eq%20' + encodeURIComponent(name) : '';
        const results = await this.client.rest.get('/automation/v1/filetransfers/' + filter);
        const items = results?.items || [];
        const found = items.find((item) =>
            name ? item[this.definition.nameField] === name : item[this.definition.keyField] === key
        );
        return found?.id || null;
    }

    /**
     * Delete a metadata item from the specified business unit
     *
     * @param {string} key Identifier of data extension
     * @returns {Promise.<boolean>} deletion success flag
     */
    static async deleteByKey(key) {
        // delete only works with the query's object id
        const objectId = key ? await this._getObjectIdForSingleRetrieve(key) : null;
        if (!objectId) {
            await this.deleteNotFound(key);
            return false;
        }
        return super.deleteByKeyREST('/automation/v1/filetransfers/' + objectId, key);
    }
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
FileTransfer.definition = MetadataTypeDefinitions.fileTransfer;

export default FileTransfer;
