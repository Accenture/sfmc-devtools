'use strict';

const MetadataType = require('./MetadataType');

/**
 * ImportFile MetadataType
 * @augments MetadataType
 */
class FtpLocation extends MetadataType {
    /**
     * Retrieves Metadata of FtpLocation
     * Endpoint /automation/v1/ftplocations/ return all FtpLocations
     * @param {String} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise} Promise
     */
    static retrieve(retrieveDir) {
        return super.retrieveREST(retrieveDir, '/automation/v1/ftplocations/', null);
    }

    /**
     * Retrieves folder metadata into local filesystem. Also creates a uniquePath attribute for each folder.
     * @returns {Promise} Promise
     */
    static async retrieveForCache() {
        return super.retrieveREST(null, '/automation/v1/ftplocations/', null);
    }
}

// Assign definition to static attributes
FtpLocation.definition = require('../MetadataTypeDefinitions').ftpLocation;

module.exports = FtpLocation;
