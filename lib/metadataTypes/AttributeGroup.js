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
     * Creates a single item
     *
     * @param {TYPE.MetadataTypeItem} metadata a single item
     * @returns {Promise} Promise
     */
    static create(metadata) {
        return super.createREST(metadata, '/hub/v1/contacts/schema/attributeGroups');
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

        // description is not returned by API when empty. Set to empty string to propose the field as an option to users
        metadata.description ||= '';

        // applicationKey is only used by system generated attribute groups and otherwise it's empty.
        if (metadata.applicationKey === '') {
            // remove useless field
            delete metadata.applicationKey;
        }

        // connectingID.identifierType seems to be always set to 'FullyQualifiedName' - to be sure we check it here and remove it if it's the case
        if (metadata.connectingID?.identifierType === 'FullyQualifiedName') {
            // remove useless field
            delete metadata.connectingID;
        }

        // containsSchemaAttributes is only true for system generated attribute groups and otherwise it's false.
        if (!metadata.containsSchemaAttributes) {
            delete metadata.containsSchemaAttributes;
        }

        // isSystemDefined is only true for system generated attribute groups and cannot be deployed
        if (!metadata.isSystemDefined) {
            delete metadata.isSystemDefined;
        }

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

        // description is not returned by API when empty. Remove it before deployment if empty
        if (metadata.description === '') {
            delete metadata.description;
        }

        // filter system defined attribute groups
        if (metadata.isSystemDefined) {
            throw new Error(
                ` ☇ skipping ${this.definition.type} ${metadata[this.definition.keyField]} / ${
                    metadata[this.definition.nameField]
                }: Cannot deploy system defined attribute groups (isSystemDefined: true)`
            );
        }

        // connectingID.identifierType seems to be always set to 'FullyQualifiedName' - we remove it during retrieve and auto-set it here again
        if (!metadata.connectingID?.identifierType) {
            metadata.connectingID = {
                identifierType: 'FullyQualifiedName',
            };
        }

        // fullyQualifiedName is equal to definitionName.value and needs to be auto-populated for deploy
        metadata.fullyQualifiedName = metadata.definitionName?.value;

        // containsSchemaAttributes is only true for system generated attribute groups and otherwise it's false which is why we remove it during retrieve and auto-set it here again
        if (!metadata.containsSchemaAttributes) {
            metadata.containsSchemaAttributes = false;
        }

        return metadata;
    }
}

// Assign definition to static attributes
AttributeGroup.definition = require('../MetadataTypeDefinitions').attributeGroup;

module.exports = AttributeGroup;
