'use strict';

const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');
const Util = require('../util/util');

/**
 * TransactionalMessage MetadataType
 *
 * @augments MetadataType
 */
class TransactionalMessage extends MetadataType {
    // define this.subType as string here for intellisense; requires to be redefined in child class
    static subType;
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
        const baseUri = '/messaging/v1/' + this.subType + '/definitions/';
        if (key) {
            // Retrieve single
            keyList = [key];
        } else {
            // Retrieve all
            const response = this.definition.restPagination
                ? await this.client.rest.getBulk(baseUri)
                : await this.client.rest.get(baseUri);
            const parsed = this.parseResponseBody(response);
            keyList = Object.keys(parsed).filter((item) => parsed[item].status !== 'Deleted');
            const filteredCount = Object.keys(parsed).length - keyList.length;
            if (filteredCount) {
                Util.logger.info(
                    ` - Filtered ${this.definition.type} with status 'deleted': ${filteredCount} (downloaded but not saved to disk)`
                );
            }
        }

        // get all sms with additional details not given by the list endpoint
        const details = (
            await Promise.all(
                keyList.map(async (key) => {
                    try {
                        return await this.client.rest.get(baseUri + (key || ''));
                    } catch {
                        return null;
                    }
                })
            )
        ).filter(Boolean);
        const parsed = this.parseResponseBody({ definitions: details });

        // * retrieveDir is mandatory in this method as it is not used for caching (there is a seperate method for that)
        const savedMetadata = await this.saveResults(parsed, retrieveDir, null, null);
        // defined colors for optionally printing the keys we filtered by
        const color = {
            reset: '\x1B[0m',
            dim: '\x1B[2m',
        };
        Util.logger.info(
            `Downloaded: ${this.definition.type} (${Object.keys(savedMetadata).length})` +
                (key === null ? '' : ` ${color.dim}(Key: ${key})${color.reset}`)
        );

        return { metadata: savedMetadata, type: this.definition.type };
    }

    /**
     * Retrieves event definition metadata for caching
     *
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of metadata
     */
    static retrieveForCache() {
        return super.retrieveREST(null, '/messaging/v1/' + this.subType + '/definitions/');
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
            '/messaging/v1/' + this.subType + '/definitions/' + metadata[this.definition.keyField]
        );
    }

    /**
     * Creates a single item
     *
     * @param {TYPE.MetadataTypeItem} metadata a single item
     * @returns {Promise} Promise
     */
    static create(metadata) {
        return super.createREST(metadata, '/messaging/v1/' + this.subType + '/definitions');
    }
    /**
     * Delete a metadata item from the specified business unit
     *
     * @param {string} key Identifier of item
     * @returns {Promise.<boolean>} deletion success status
     */
    static deleteByKey(key) {
        return super.deleteByKeyREST(
            '/messaging/v1/' + this.subType + '/definitions/' + key,
            key,
            false
        );
    }
}

// Assign definition to static attributes
// ! using SMS definitions here as placeholder to have auto completion
TransactionalMessage.definition = require('../MetadataTypeDefinitions').transactionalSMS;

module.exports = TransactionalMessage;
