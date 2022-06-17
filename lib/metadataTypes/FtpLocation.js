'use strict';

const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');

/**
 * ImportFile MetadataType
 *
 * @augments MetadataType
 */
class FtpLocation extends MetadataType {
    /**
     * Retrieves Metadata of FtpLocation
     * Endpoint /automation/v1/ftplocations/ return all FtpLocations
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void} [_] unused parameter
     * @param {void} [__] unused parameter
     * @param {void} [___] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise
     */
    static retrieve(retrieveDir, _, __, ___, key) {
        return super.retrieveREST(retrieveDir, '/automation/v1/ftplocations/', null, null, key);
    }

    /**
     * Retrieves folder metadata into local filesystem. Also creates a uniquePath attribute for each folder.
     *
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise
     */
    static async retrieveForCache() {
        return super.retrieveREST(null, '/automation/v1/ftplocations/');
    }
}

// Assign definition to static attributes
FtpLocation.definition = require('../MetadataTypeDefinitions').ftpLocation;

module.exports = FtpLocation;
