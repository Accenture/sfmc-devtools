'use strict';

const MetadataType = require('../MetadataType');

/**
 * DataExtractType MetadataType
 * Only for Caching No retrieve/upsert is required
 * as this is a configuration in the EID
 * @augments MetadataType
 */
class DataExtractType extends MetadataType {
    /**
     * Retrieves Metadata of  Data Extract Type.
     * @param {String} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise<Object>} Promise of metadata
     */
    static retrieve(retrieveDir) {
        return super.retrieveREST(retrieveDir, '/automation/v1/dataextracttypes/', null);
    }
    /**
     * Retrieves Metadata of  Data Extract Type for caching.
     * @returns {Promise<Object>} Promise of metadata
     */
    static retrieveForCache() {
        return super.retrieveREST(null, '/automation/v1/dataextracttypes/', null);
    }
}

// Assign definition to static attributes
DataExtractType.cache = {};

module.exports = DataExtractType;
