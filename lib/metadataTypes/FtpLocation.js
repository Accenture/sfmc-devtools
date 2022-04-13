'use strict';

const MetadataType = require('./MetadataType');

/**
 * ImportFile MetadataType
 * @augments MetadataType
 */
class FtpLocation extends MetadataType {
    /**
     * Construtor method
     * @param {Object} properties General configuration to be used in retrieve
     * @param {auth.BuObject} buObject details of business unit in processing
     * @returns {void}
     */
    constructor(properties, buObject) {
        super(properties, buObject);
        this.definition = require('../MetadataTypeDefinitions').ftpLocation;
    }
    /**
     * Retrieves Metadata of FtpLocation
     * Endpoint /automation/v1/ftplocations/ return all FtpLocations
     * @param {String} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise} Promise
     */
    retrieve(retrieveDir) {
        return super.retrieveREST(retrieveDir, '/automation/v1/ftplocations/', null);
    }

    /**
     * Retrieves folder metadata into local filesystem. Also creates a uniquePath attribute for each folder.
     * @returns {Promise} Promise
     */
    async retrieveForCache() {
        return super.retrieveREST(null, '/automation/v1/ftplocations/', null);
    }
}

module.exports = FtpLocation;
