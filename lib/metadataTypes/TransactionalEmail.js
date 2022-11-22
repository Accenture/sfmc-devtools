'use strict';

const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');
const Util = require('../util/util');

/**
 * TransactionalEmail MetadataType
 *
 * @augments MetadataType
 */
class TransactionalEmail extends MetadataType {
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
        const baseUri = '/messaging/v1/email/definitions/';
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
        return super.retrieveREST(null, '/messaging/v1/email/definitions/');
    }
    /**
     * Updates a single item
     *
     * @param {TYPE.MetadataTypeItem} metadata a single item
     * @returns {Promise} Promise
     */
    static update(metadata) {
        return super.updateREST(metadata, '/messaging/v1/email/definitions');
    }

    /**
     * Creates a single item
     *
     * @param {TYPE.MetadataTypeItem} metadata a single item
     * @returns {Promise} Promise
     */
    static create(metadata) {
        return super.createREST(metadata, '/messaging/v1/email/definitions');
    }
    /**
     * Delete a metadata item from the specified business unit
     *
     * @param {TYPE.BuObject} buObject references credentials
     * @param {string} key Identifier of item
     * @returns {Promise.<boolean>} deletion success status
     */
    static deleteByKey(buObject, key) {
        return super.deleteByKeyREST(
            buObject,
            '/messaging/v1/email/definitions/' + key,
            key,
            false
        );
    }
}

// Assign definition to static attributes
TransactionalEmail.definition = require('../MetadataTypeDefinitions').transactionalEmail;

module.exports = TransactionalEmail;
