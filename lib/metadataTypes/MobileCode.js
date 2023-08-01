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
     * @param {void} [_] unused parameter
     * @param {void} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of metadata
     */
    static retrieve(retrieveDir, _, __, key) {
        return super.retrieveREST(
            retrieveDir,
            '/legacy/v1/beta/mobile/code/' + (key ? `?$where=keyword%20eq%20%27${key}%27%20` : ''),
            null,
            key
        );
    }

    /**
     * Retrieves event definition metadata for caching
     *
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of metadata
     */
    static retrieveForCache() {
        return super.retrieveREST(null, '/legacy/v1/beta/mobile/code/');
    }
}

// Assign definition to static attributes
MobileCode.definition = require('../MetadataTypeDefinitions').mobileCode;

module.exports = MobileCode;
