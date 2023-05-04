'use strict';

const MetadataType = require('./MetadataType');
const TYPE = require('../../types/mcdev.d');

/**
 * AttributeGroup MetadataType
 *
 * @augments MetadataType
 */
class AttributeGroup extends MetadataType {
    /**
     * Retrieves Metadata of schema attribute groups.
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void} [_] unused parameter
     * @param {void} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of metadata
     */
    static retrieve(retrieveDir, _, __, key) {
        return super.retrieveREST(
            retrieveDir,
            '/hub/v1/contacts/schema/attributeGroups',
            null,
            key
        );
    }
    /**
     * Retrieves Metadata of schema attribute groups for caching.
     *
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of metadata
     */
    static retrieveForCache() {
        return super.retrieveREST(null, '/hub/v1/contacts/schema/attributeGroups');
    }
}

// Assign definition to static attributes
AttributeGroup.definition = require('../MetadataTypeDefinitions').attributeGroup;

module.exports = AttributeGroup;
