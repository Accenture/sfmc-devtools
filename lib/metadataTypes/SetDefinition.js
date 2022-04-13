'use strict';

const MetadataType = require('./MetadataType');

/**
 * SetDefinition MetadataType
 * @augments MetadataType
 */
class SetDefinition extends MetadataType {
    /**
     * Construtor method
     * @param {Object} properties General configuration to be used in retrieve
     * @param {auth.BuObject} buObject details of business unit in processing
     * @returns {void}
     */
    constructor(properties, buObject) {
        super(properties, buObject);
        this.definition = require('../MetadataTypeDefinitions').setDefinition;
    }
    /**
     * Retrieves Metadata of schema set Definitions.
     * @param {String} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise} Promise
     */
    retrieve(retrieveDir) {
        return super.retrieveREST(retrieveDir, '/hub/v1/contacts/schema/setDefinitions', null);
    }
    /**
     * Retrieves Metadata of schema set definitions for caching.
     * @returns {Promise} Promise
     */
    retrieveForCache() {
        return super.retrieveREST(null, '/hub/v1/contacts/schema/setDefinitions', null);
    }
}

module.exports = SetDefinition;
