'use strict';

const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const cache = require('../util/cache');

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
                (key !== null ? ` ${color.dim}(Key: ${key})${color.reset}` : '')
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
    /**
     * prepares for deployment
     *
     * @param {TYPE.MetadataTypeItem} metadata a single item
     * @returns {TYPE.MetadataTypeItem} Promise
     */
    static async preDeployTasks(metadata) {
        // asset
        if (metadata.content?.customerKey) {
            // we merely want to be able to show an error if it does not exist
            cache.searchForField(
                'asset',
                metadata.content.customerKey,
                'customerKey',
                'customerKey'
            );
        }
        // subscriptions: dataExtension
        if (metadata.subscriptions?.dataExtension) {
            // we merely want to be able to show an error if it does not exist
            cache.searchForField(
                'dataExtension',
                metadata.subscriptions.dataExtension,
                'CustomerKey',
                'CustomerKey'
            );
        }
        // subscriptions: list
        if (metadata.subscriptions?.r__list_PathName) {
            metadata.subscriptions.list = cache.getListObjectId(
                metadata.r__list_PathName,
                'CustomerKey'
            );
            delete metadata.subscriptions.r__list_PathName;
        } else if (metadata.subscriptions?.list) {
            throw new Error(
                `r__list_PathName not defined but instead found List.ID. Please try re-retrieving this from your BU.`
            );
        }

        // journey
        if (metadata.journey?.interactionKey) {
            cache.searchForField('interaction', metadata.journey.interactionKey, 'key', 'key');
        }

        return metadata;
    }
    /**
     * manages post retrieve steps
     *
     * @param {TYPE.MetadataTypeItem} metadata a single item
     * @returns {TYPE.MetadataTypeItem} a single item
     */
    static postRetrieveTasks(metadata) {
        // asset
        if (metadata.content?.customerKey) {
            try {
                // we merely want to be able to show an error if it does not exist
                cache.searchForField(
                    'asset',
                    metadata.content.customerKey,
                    'customerKey',
                    'customerKey'
                );
            } catch (ex) {
                Util.logger.warn(
                    ` - ${this.definition.type} ${metadata[this.definition.nameField]} (${
                        metadata[this.definition.keyField]
                    }): ${ex.message}.`
                );
            }
        }
        // subscriptions: dataExtension
        if (metadata.subscriptions?.dataExtension) {
            try {
                // we merely want to be able to show a warning if it does not exist
                cache.searchForField(
                    'dataExtension',
                    metadata.subscriptions.dataExtension,
                    'CustomerKey',
                    'CustomerKey'
                );
            } catch (ex) {
                Util.logger.warn(
                    ` - ${this.definition.type} ${metadata[this.definition.nameField]} (${
                        metadata[this.definition.keyField]
                    }): ${ex.message}.`
                );
            }
        }
        // subscriptions: list
        if (metadata.subscriptions?.list) {
            try {
                metadata.r__list_PathName = cache.getListPathName(
                    metadata.subscriptions.list,
                    'CustomerKey'
                );
                delete metadata.subscriptions.list;
            } catch (ex) {
                Util.logger.warn(
                    ` - ${this.definition.type} ${metadata[this.definition.nameField]} (${
                        metadata[this.definition.keyField]
                    }): ${ex.message}.`
                );
            }
        }
        // journey
        if (metadata.journey?.interactionKey) {
            try {
                // we merely want to be able to show a warning if it does not exist
                cache.searchForField('interaction', metadata.journey.interactionKey, 'key', 'key');
            } catch (ex) {
                Util.logger.warn(
                    ` - ${this.definition.type} ${metadata[this.definition.nameField]} (${
                        metadata[this.definition.keyField]
                    }): ${ex.message}.`
                );
            }
        }

        return metadata;
    }
}

// Assign definition to static attributes
TransactionalEmail.definition = require('../MetadataTypeDefinitions').transactionalEmail;

module.exports = TransactionalEmail;
