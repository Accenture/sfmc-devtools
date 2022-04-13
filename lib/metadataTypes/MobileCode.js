'use strict';

const MetadataType = require('./MetadataType');

/**
 * MobileCode MetadataType
 * @augments MetadataType
 */
class MobileCode extends MetadataType {
    /**
     * Construtor method
     * @param {Object} properties General configuration to be used in retrieve
     * @param {auth.BuObject} buObject details of business unit in processing
     * @returns {void}
     */
    constructor(properties, buObject) {
        super(properties, buObject);
        this.definition = require('../MetadataTypeDefinitions').mobileCode;
    }
    /**
     * Retrieves Metadata of Mobile Keywords
     * Endpoint /legacy/v1/beta/mobile/code/ return all Mobile Codes with all details.
     * @param {String} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise<Object>} Promise of metadata
     */
    retrieve(retrieveDir) {
        return super.retrieveREST(retrieveDir, '/legacy/v1/beta/mobile/code/', null);
    }

    /**
     * Retrieves event definition metadata for caching
     * @returns {Promise<Object>} Promise of metadata
     */
    retrieveForCache() {
        return super.retrieveREST(null, '/legacy/v1/beta/mobile/code/', null);
    }
}

module.exports = MobileCode;
