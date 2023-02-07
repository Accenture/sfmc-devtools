'use strict';

const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');

/**
 * SetDefinition MetadataType
 *
 * @augments MetadataType
 */
class SetDefinition extends MetadataType {
    /**
     * Retrieves Metadata of schema set Definitions.
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void} [_] unused parameter
     * @param {void} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise
     */
    static retrieve(retrieveDir, _, __, key) {
        return super.retrieveREST(
            retrieveDir,
            '/hub/v1/contacts/schema/setDefinitions',
            null,
            null,
            key
        );
    }
    /**
     * Retrieves Metadata of schema set definitions for caching.
     *
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise
     */
    static retrieveForCache() {
        return super.retrieveREST(null, '/hub/v1/contacts/schema/setDefinitions');
    }
}

// Assign definition to static attributes
SetDefinition.definition = require('../MetadataTypeDefinitions').setDefinition;

module.exports = SetDefinition;
