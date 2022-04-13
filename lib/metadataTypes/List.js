'use strict';

const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const cache = require('../util/cache');

/**
 * List MetadataType
 * @augments MetadataType
 */
class List extends MetadataType {
    /**
     * Construtor method
     * @param {Object} properties General configuration to be used in retrieve
     * @param {auth.BuObject} buObject details of business unit in processing
     * @returns {void}
     */
    constructor(properties, buObject) {
        super(properties, buObject);
        this.definition = require('../MetadataTypeDefinitions').list;
    }
    /**
     * Retrieves Metadata of Lists
     * @param {String} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise} Promise
     */
    retrieve(retrieveDir) {
        return super.retrieveSOAP(retrieveDir);
    }
    /**
     * Gets metadata cache with limited fields and does not store value to disk
     * @returns {Promise<Object>} Promise of metadata
     */
    async retrieveForCache() {
        const results = await this.retrieve(null);
        for (const metadataEntry in results.metadata) {
            this.parseMetadata(results.metadata[metadataEntry], true);
        }
        return results;
    }

    /**
     * Delete a metadata item from the specified business unit
     * @param {string} customerKey Identifier of data extension
     * @returns {Promise<boolean>} deletion success status
     */
    deleteByKey(customerKey) {
        return super.deleteByKeySOAP(customerKey, false);
    }

    /**
     * manages post retrieve steps
     * @param {Object} list a single list
     * @returns {Object[]} metadata
     */
    postRetrieveTasks(list) {
        return this.parseMetadata(list);
    }
    /**
     * parses retrieved Metadata before saving
     * @param {Object} metadata a single list definition
     * @param {Boolean} [parseForCache] if set to true, the Category ID is kept
     * @returns {Array} Array with one metadata object and one sql string
     */
    parseMetadata(metadata, parseForCache) {
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

module.exports = List;
