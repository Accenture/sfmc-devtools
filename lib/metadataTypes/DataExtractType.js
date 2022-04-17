'use strict';

const MetadataType = require('./MetadataType');

/**
 * DataExtractType MetadataType
 * Only for Caching No retrieve/upsert is required
 * as this is a configuration in the EID
 *
 * @augments MetadataType
 */
class DataExtractType extends MetadataType {
    /**
     * Retrieves Metadata of  Data Extract Type.
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise<object>} Promise of metadata
     */
    static retrieve(retrieveDir) {
        return super.retrieveREST(retrieveDir, '/automation/v1/dataextracttypes/', null);
    }
    /**
     * Retrieves Metadata of  Data Extract Type for caching.
     *
     * @returns {Promise<object>} Promise of metadata
     */
    static retrieveForCache() {
        return super.retrieveREST(null, '/automation/v1/dataextracttypes/', null);
    }
}

// Assign definition to static attributes
DataExtractType.definition = require('../MetadataTypeDefinitions').dataExtractType;

module.exports = DataExtractType;
