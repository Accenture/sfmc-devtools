'use strict';

import TYPE from '../../types/mcdev.d.js';
import MetadataType from './MetadataType.js';
import { Util } from '../util/util.js';

/**
 * TransactionalMessage MetadataType
 *
 * @augments MetadataType
 */
class TransactionalMessage extends MetadataType {
    // define this.subType as string here for intellisense; requires to be redefined in child class
    static subType;
    /**
     * Retrieves Metadata
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void} [_] unused parameter
     * @param {void} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of metadata
     */
    static async retrieve(retrieveDir, _, __, key) {
        let keyList;
        const baseUri = '/messaging/v1/' + this.subType + '/definitions/';
        if (key) {
            // Retrieve single
            keyList = [key];
        } else {
            // Retrieve all
            // * keep deleted items for caching (and to decide on update vs create)
            const parsed = (
                await this.retrieveREST(
                    null,
                    baseUri + (retrieveDir ? '?$filter=status%20neq%20deleted' : '')
                )
            ).metadata;
            keyList = Object.keys(parsed);
        }
        // get all transactionalX items with additional details not given by the list endpoint
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
        let savedMetadata;
        if (retrieveDir) {
            // * retrieveDir is mandatory in this method as it is not used for caching (there is a seperate method for that)
            savedMetadata = await this.saveResults(parsed, retrieveDir, null, null);
            Util.logger.info(
                `Downloaded: ${this.definition.type} (${Object.keys(savedMetadata).length})` +
                    Util.getKeysString(key)
            );
        }

        return { metadata: savedMetadata || parsed, type: this.definition.type };
    }

    /**
     * Retrieves event definition metadata for caching
     *
     * @param {string} [key] customer key of single item to cache
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of metadata
     */
    static retrieveForCache(key) {
        // the call to /messaging/v1/email/definitions/ does not return definitionId
        // definitionId is required for resolving dependencies on interactions.
        // we should therefore use the already defined retrieve method
        return this.retrieve(undefined, undefined, undefined, key);
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
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
TransactionalMessage.definition = MetadataTypeDefinitions.transactionalSMS;

export default TransactionalMessage;
