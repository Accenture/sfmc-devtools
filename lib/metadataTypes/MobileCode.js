'use strict';

const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');

/**
 * MobileCode MetadataType
 *
 * @augments MetadataType
 */
class MobileCode extends MetadataType {
    /**
     * Retrieves Metadata of Mobile Keywords
     * Endpoint /legacy/v1/beta/mobile/code/ return all Mobile Codes with all details.
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise<TYPE.MetadataTypeMapObj>} Promise of metadata
     */
    static retrieve(retrieveDir) {
        return super.retrieveREST(retrieveDir, '/legacy/v1/beta/mobile/code/', null);
    }

    /**
     * Retrieves event definition metadata for caching
     *
     * @returns {Promise<TYPE.MetadataTypeMapObj>} Promise of metadata
     */
    static retrieveForCache() {
        return super.retrieveREST(null, '/legacy/v1/beta/mobile/code/', null);
    }
}

// Assign definition to static attributes
MobileCode.definition = require('../MetadataTypeDefinitions').mobileCode;

module.exports = MobileCode;
