'use strict';

const MetadataType = require('./MetadataType');

/**
 * MobileCode MetadataType
 * @augments MetadataType
 */
class MobileCode extends MetadataType {
    /**
     * Retrieves Metadata of Mobile Keywords
     * Endpoint /legacy/v1/beta/mobile/code/ return all Mobile Codes with all details.
     * @param {String} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise<Object>} Promise of metadata
     */
    static retrieve(retrieveDir) {
        return super.retrieveREST(retrieveDir, '/legacy/v1/beta/mobile/code/', null);
    }

    /**
     * Retrieves event definition metadata for caching
     * @returns {Promise<Object>} Promise of metadata
     */
    static retrieveForCache() {
        return super.retrieveREST(null, '/legacy/v1/beta/mobile/code/', null);
    }
}

// Assign definition to static attributes
MobileCode.definition = require('../MetadataTypeDefinitions').mobileCode;
MobileCode.cache = {};
MobileCode.client = undefined;

module.exports = MobileCode;
