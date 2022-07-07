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
     * @param {void} [_] unused parameter
     * @param {void} [__] unused parameter
     * @param {void} [___] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise
     */
    static retrieve(retrieveDir, _, __, ___, key) {
        return super.retrieveREST(
            retrieveDir,
            `/interaction/v1/interactions${
                key ? '/key:' + encodeURIComponent(key) : ''
            }?extras=all`,
            null,
            null,
            key
        );
    }
}

// Assign definition to static attributes
Interaction.definition = require('../MetadataTypeDefinitions').interaction;

module.exports = Interaction;
