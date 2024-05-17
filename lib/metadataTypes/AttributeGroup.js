'use strict';

import MetadataType from './MetadataType.js';
import { Util } from '../util/util.js';
import cache from '../util/cache.js';

/**
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItem} MetadataTypeItem
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMapObj} MetadataTypeMapObj
 */

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
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
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
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static retrieveForCache() {
        return super.retrieveREST(null, '/hub/v1/contacts/schema/attributeGroups');
    }

    /**
     * manages post retrieve steps
     *
     * @param {MetadataTypeItem} metadata a single metadata
     * @returns {MetadataTypeItem} metadata
     */
    static postRetrieveTasks(metadata) {
        // Member ID
        delete metadata.mID;

        // attributeSet
        metadata.r__attributeSet_definitionKey = metadata.attributeSetIdentifiers.map(
            (attributeSet) => {
                try {
                    const key = cache.searchForField(
                        'attributeSet',
                        attributeSet.definitionID,
                        'definitionID',
                        'definitionKey'
                    );
                    if (key !== attributeSet.definitionKey) {
                        Util.logger.debug(
                            `AttributeSet key mismatch. Overwriting ${attributeSet.definitionKey} with ${key}`
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
            }
        );
        delete metadata.attributeSetIdentifiers;

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
     * @param {MetadataTypeItem} metadata a single item
     * @returns {MetadataTypeItem} Promise
     */
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
AttributeGroup.definition = MetadataTypeDefinitions.attributeGroup;

export default AttributeGroup;
