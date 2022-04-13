'use strict';

const MetadataType = require('./MetadataType');

/**
 * Script MetadataType
 * @augments MetadataType
 */
class Interaction extends MetadataType {
    /**
     * Construtor method
     * @param {Object} properties General configuration to be used in retrieve
     * @param {auth.BuObject} buObject details of business unit in processing
     * @returns {void}
     */
    constructor(properties, buObject) {
        super(properties, buObject);
        this.definition = require('../MetadataTypeDefinitions').interaction;
    }
    /**
     * Retrieves Metadata of Interaction
     * Endpoint /interaction/v1/interactions?extras=all&pageSize=50000 return 50000 Scripts with all details.
     * @param {String} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise} Promise
     */
    retrieve(retrieveDir) {
        return super.retrieveREST(retrieveDir, '/interaction/v1/interactions?extras=all', null);
    }
}

module.exports = Interaction;
