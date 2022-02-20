'use strict';

const MetadataType = require('./MetadataType');

/**
 * SetDefinition MetadataType
 * @augments MetadataType
 */
class SetDefinition extends MetadataType {
    /**
     * Retrieves Metadata of schema set Definitions.
     * @param {String} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise} Promise
     */
    static retrieve(retrieveDir) {
        return super.retrieveREST(retrieveDir, '/hub/v1/contacts/schema/setDefinitions', null);
    }
    /**
     * Retrieves Metadata of schema set definitions for caching.
     * @returns {Promise} Promise
     */
    static retrieveForCache() {
        return super.retrieveREST(null, '/hub/v1/contacts/schema/setDefinitions', null);
    }
}

// Assign definition to static attributes
SetDefinition.definition = require('../MetadataTypeDefinitions').setDefinition;

module.exports = SetDefinition;
