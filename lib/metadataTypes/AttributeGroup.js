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
        // attributeSetDefinition
        for (const attributeSet of metadata.attributeSetIdentifiers) {
            try {
                const key = cache.searchForField(
                    'attributeSetDefinition',
                    attributeSet.definitionID,
                    'definitionID',
                    'definitionKey'
                );
                if (key !== attributeSet.definitionKey) {
                    throw new Error(
                        `AttributeSetDefinition key mismatch. Found ${key} instead of ${attributeSet.definitionKey}`
                    );
                }
                delete attributeSet.definitionID;
                delete attributeSet.definitionName;
                delete attributeSet.connectingID;
            } catch (ex) {
                Util.logger.warn(
                    ` - ${this.definition.type} ${metadata[this.definition.keyField]} (for ${
                        attributeSet.definitionKey
                    }): ${ex.message}`
                );
            }
        }
        // Member ID
        delete metadata.mID;

        return metadata;
    }
    /**
     * prepares for deployment
     *
     * @param {TYPE.MetadataTypeItem} metadata a single item
     * @returns {TYPE.MetadataTypeItem} Promise
     */
    static async preDeployTasks(metadata) {
        // attributeSetDefinition
        for (const attributeSet of metadata.attributeSetIdentifiers) {
            try {
                const as = cache.getByKey('attributeSetDefinition', attributeSet.definitionKey);
                attributeSet.definitionID = as.definitionID;
                attributeSet.definitionName = as.definitionName?.value;
                attributeSet.connectingID = as.connectingID;
            } catch (ex) {
                Util.logger.warn(
                    ` - ${this.definition.type} ${metadata[this.definition.keyField]}: ${
                        ex.message
                    }`
                );
            }
        }

        // Member ID - set to ID of deployment target automatically
        metadata.mID = this.buObject.mid;

        return metadata;
    }
}

// Assign definition to static attributes
AttributeGroup.definition = require('../MetadataTypeDefinitions').attributeGroup;

module.exports = AttributeGroup;
