'use strict';

const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');

/**
 * Script MetadataType
 *
 * @augments MetadataType
 */
class Interaction extends MetadataType {
    /**
     * Retrieves Metadata of Interaction
     * Endpoint /interaction/v1/interactions?extras=all&pageSize=50000 return 50000 Scripts with all details.
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise
     */
    static retrieve(retrieveDir) {
        return super.retrieveREST(retrieveDir, '/interaction/v1/interactions?extras=all', null);
    }
}

// Assign definition to static attributes
Interaction.definition = require('../MetadataTypeDefinitions').interaction;

module.exports = Interaction;
