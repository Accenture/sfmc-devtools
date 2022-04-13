'use strict';

const MetadataType = require('./MetadataType');

/**
 * AttributeGroup MetadataType
 * @augments MetadataType
 */
class AttributeGroup extends MetadataType {
    /**
     * Construtor method
     * @param {Object} properties General configuration to be used in retrieve
     * @param {auth.BuObject} buObject details of business unit in processing
     * @returns {void}
     */
    constructor(properties, buObject) {
        super(properties, buObject);
        this.definition = require('../MetadataTypeDefinitions').attributeGroup;
    }
    /**
     * Retrieves Metadata of schema attribute groups for caching.
     * @returns {Promise<Object>} Promise of metadata
     */
    retrieveForCache() {
        return super.retrieveREST(null, '/hub/v1/contacts/schema/attributeGroups', null);
    }

    /**
     * Retrieves Metadata of schema attribute groups.
     * @param {String} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise<Object>} Promise of metadata
     */
    retrieve(retrieveDir) {
        return super.retrieveREST(retrieveDir, '/hub/v1/contacts/schema/attributeGroups', null);
    }
}

module.exports = AttributeGroup;
