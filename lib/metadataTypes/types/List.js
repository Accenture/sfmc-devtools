'use strict';

const MetadataType = require('../MetadataType');

const Util = require('../../util/util');

/**
 * List MetadataType
 * @augments MetadataType
 */
class List extends MetadataType {
    /**
     * Retrieves Metadata of Lists
     * @param {String} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise} Promise
     */
    static retrieve(retrieveDir) {
        return super.retrieveSOAPgeneric(retrieveDir);
    }
    /**
     * Gets metadata cache with limited fields and does not store value to disk
     * @returns {Promise<Object>} Promise of metadata
     */
    static async retrieveForCache() {
        const results = await this.retrieve(null);
        for (const metadataEntry in results.metadata) {
            this.parseMetadata(results.metadata[metadataEntry], true);
        }
        return results;
    }

    /**
     * manages post retrieve steps
     * @param {Object} list a single list
     * @returns {Object[]} metadata
     */
    static postRetrieveTasks(list) {
        return this.parseMetadata(list);
    }
    /**
     * parses retrieved Metadata before saving
     * @param {Object} metadata a single list definition
     * @param {Boolean} [parseForCache] if set to true, the Category ID is kept
     * @returns {Array} Array with one metadata object and one sql string
     */
    static parseMetadata(metadata, parseForCache) {
        try {
            metadata.r__folder_Path = Util.getFromCache(
                this.cache,
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

module.exports = List;
