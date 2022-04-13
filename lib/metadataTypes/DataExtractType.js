'use strict';

const MetadataType = require('./MetadataType');

/**
 * DataExtractType MetadataType
 * Only for Caching No retrieve/upsert is required
 * as this is a configuration in the EID
 * @augments MetadataType
 */
class DataExtractType extends MetadataType {
    /**
     * Construtor method
     * @param {Object} properties General configuration to be used in retrieve
     * @param {auth.BuObject} buObject details of business unit in processing
     * @returns {void}
     */
    constructor(properties, buObject) {
        super(properties, buObject);
        this.definition = require('../MetadataTypeDefinitions').dataExtractType;
    }
    /**
     * Retrieves Metadata of  Data Extract Type.
     * @param {String} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise<Object>} Promise of metadata
     */
    retrieve(retrieveDir) {
        return super.retrieveREST(retrieveDir, '/automation/v1/dataextracttypes/', null);
    }
    /**
     * Retrieves Metadata of  Data Extract Type for caching.
     * @returns {Promise<Object>} Promise of metadata
     */
    retrieveForCache() {
        return super.retrieveREST(null, '/automation/v1/dataextracttypes/', null);
    }
}

module.exports = DataExtractType;
