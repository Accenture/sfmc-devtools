'use strict';

const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const cache = require('../util/cache');

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
    static async retrieve(retrieveDir, _, __, key) {
        return super.retrieveREST(
            retrieveDir,
            '/hub/v1/contacts/schema/attributeGroups',
            null,
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
    /**
     * manages post retrieve steps
     *
     * @param {TYPE.MetadataTypeItem} metadata a single metadata
     * @returns {TYPE.MetadataTypeItem} metadata
     */
    static postRetrieveTasks(metadata) {
        // Member ID
        delete metadata.mID;

        // attributeSet
        metadata.attributeSetIdentifiers = metadata.attributeSetIdentifiers.map((attributeSet) => {
            try {
                const key = cache.searchForField(
                    'attributeSet',
                    attributeSet.definitionID,
                    'definitionID',
                    'definitionKey'
                );
                if (key !== attributeSet.definitionKey) {
                    throw new Error(
                        `AttributeSet key mismatch. Found ${key} instead of ${attributeSet.definitionKey}`
                    );
                }
                return key;
            } catch (ex) {
                Util.logger.warn(
                    ` - ${this.definition.type} ${metadata[this.definition.keyField]} (for ${
                        attributeSet.definitionKey
                    }): ${ex.message}`
                );
                return attributeSet;
            }
        });

        // requiredRelationships
        // TODO: implement

        return metadata;
    }
    /**
     * prepares for deployment
     *
     * @param {TYPE.MetadataTypeItem} metadata a single item
     * @returns {TYPE.MetadataTypeItem} Promise
     */
    static async preDeployTasks(metadata) {
        // Member ID - set to ID of deployment target automatically
        metadata.mID = this.buObject.mid;

        // attributeSet
        metadata.attributeSetIdentifiers = metadata.attributeSetIdentifiers.map((key) => {
            const as = cache.getByKey('attributeSet', key);
            return {
                definitionKey: key,
                definitionID: as.definitionID,
                definitionName: as.definitionName,
                connectingID: as.connectingID,
            };
        });

        // requiredRelationships
        // TODO: implement

        return metadata;
    }
}

// Assign definition to static attributes
AttributeGroup.definition = require('../MetadataTypeDefinitions').attributeGroup;

module.exports = AttributeGroup;
