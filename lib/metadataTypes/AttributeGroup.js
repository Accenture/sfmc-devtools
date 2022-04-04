'use strict';

const MetadataType = require('./MetadataType');

/**
 * AttributeGroup MetadataType
 * @augments MetadataType
 */
class AttributeGroup extends MetadataType {
    /**
     * Retrieves Metadata of schema attribute groups for caching.
     * @returns {Promise<Object>} Promise of metadata
     */
    static retrieveForCache() {
        return super.retrieveREST(null, '/hub/v1/contacts/schema/attributeGroups', null);
    }

    /**
     * Retrieves Metadata of schema attribute groups.
     * @param {String} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise<Object>} Promise of metadata
     */
    static retrieve(retrieveDir) {
        return super.retrieveREST(retrieveDir, '/hub/v1/contacts/schema/attributeGroups', null);
    }
}

// Assign definition to static attributes
AttributeGroup.definition = require('../MetadataTypeDefinitions').attributeGroup;

module.exports = AttributeGroup;
