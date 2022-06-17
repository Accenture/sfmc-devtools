'use strict';

const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const cache = require('../util/cache');

/**
 * List MetadataType
 *
 * @augments MetadataType
 */
class List extends MetadataType {
    /**
     * Retrieves Metadata of Lists
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void} [_] unused parameter
     * @param {void} [__] unused parameter
     * @param {void} [___] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise
     */
    static retrieve(retrieveDir, _, __, ___, key) {
        /** @type {TYPE.SoapRequestParams} */
        let requestParams = null;
        if (key) {
            requestParams = {
                filter: {
                    leftOperand: {
                        leftOperand: 'CustomerKey',
                        operator: 'equals',
                        rightOperand: key,
                    },
                    operator: 'OR',
                    rightOperand: {
                        // deviating from standard here by allowing to search without the rather weird key which includes the folder name!
                        leftOperand: 'ListName',
                        operator: 'equals',
                        rightOperand: key,
                    },
                },
            };
        }
        return super.retrieveSOAP(retrieveDir, null, requestParams);
    }
    /**
     * Gets metadata cache with limited fields and does not store value to disk
     *
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of metadata
     */
    static async retrieveForCache() {
        const results = await this.retrieve(null);
        for (const metadataEntry in results.metadata) {
            this.parseMetadata(results.metadata[metadataEntry], true);
        }
        return results;
    }

    /**
     * Delete a metadata item from the specified business unit
     *
     * @param {TYPE.BuObject} buObject references credentials
     * @param {string} customerKey Identifier of data extension
     * @returns {Promise.<boolean>} deletion success status
     */
    static deleteByKey(buObject, customerKey) {
        return super.deleteByKeySOAP(buObject, customerKey, false);
    }

    /**
     * manages post retrieve steps
     *
     * @param {TYPE.MetadataTypeItem} list a single list
     * @returns {TYPE.MetadataTypeItem} metadata
     */
    static postRetrieveTasks(list) {
        return this.parseMetadata(list);
    }
    /**
     * parses retrieved Metadata before saving
     *
     * @param {TYPE.MetadataTypeItem} metadata a single list definition
     * @param {boolean} [parseForCache] if set to true, the Category ID is kept
     * @returns {TYPE.MetadataTypeItem} Array with one metadata object and one sql string
     */
    static parseMetadata(metadata, parseForCache) {
        try {
            metadata.r__folder_Path = cache.searchForField(
                'folder',
                metadata.Category,
                'ID',
                'Path'
            );
            if (!parseForCache) {
                delete metadata.Category;
            }
            return metadata;
        } catch (ex) {
            Util.logger.warn(`List ${metadata.ID}: '${metadata.CustomerKey}': ${ex.message}`);
        }
    }
}
// Assign definition to static attributes
List.definition = require('../MetadataTypeDefinitions').list;

module.exports = List;
