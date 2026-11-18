'use strict';

import AttributeSet from './AttributeSet.js';
import MetadataType from './MetadataType.js';
import { Util } from '../util/util.js';
import cache from '../util/cache.js';

/**
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItem} MetadataTypeItem
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMap} MetadataTypeMap
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMapObj} MetadataTypeMapObj
 */

/**
 * helper for {@link AttributeGroup.hasChanged}: description is a plain string in the cache (raw API, absent when empty) and {value} after preDeployTasks
 *
 * @param {MetadataTypeItem} item attributeGroup
 * @returns {string} description or empty string
 */
function getDescription(item) {
    return (
        (typeof item.description === 'object' ? item.description?.value : item.description) || ''
    );
}

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
        if (retrieveDir && !cache.getCache()?.attributeSet) {
            // ! attributeSet depends on attributeGroup (deploy order) but postRetrieveTasks needs the attributeSet cache to resolve r__attributeSet_key. caching attributeSet here "manually"
            Util.logger.info(' - Caching dependent Metadata: attributeSet');
            AttributeSet.buObject = this.buObject;
            AttributeSet.client = this.client;
            AttributeSet.properties = this.properties;
            const result = await AttributeSet.retrieveForCache();
            cache.setMetadata('attributeSet', result.metadata);
        }
        return super.retrieveREST(retrieveDir, '/hub/v1/contacts/schema/attributeGroups', key);
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
        metadata.r__attributeSet_key = metadata.attributeSetIdentifiers.map((attributeSet) => {
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
        });
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
     * Deploys metadata - merely kept here to be able to print {@link Util.logBeta} once per deploy
     *
     * @param {MetadataTypeMap} metadata metadata mapped by their keyField
     * @param {string} deployDir directory where deploy metadata are saved
     * @param {string} retrieveDir directory where metadata after deploy should be saved
     * @returns {Promise.<MetadataTypeMap>} Promise of keyField => metadata map
     */
    static async deploy(metadata, deployDir, retrieveDir) {
        Util.logBeta(this.definition.type);
        return super.deploy(metadata, deployDir, retrieveDir);
    }

    /**
     * prepares for deployment
     *
     * @param {MetadataTypeItem} metadata a single item
     * @returns {Promise.<MetadataTypeItem>} Promise
     */
    static async preDeployTasks(metadata) {
        if (metadata.isSystemDefined || metadata.applicationKey) {
            throw new Error(
                'system-defined attributeGroups cannot be deployed (isSystemDefined / applicationKey is set)'
            );
        }
        if (!metadata.definitionName?.value) {
            throw new Error('definitionName.value is required');
        }
        // the API only accepts description as {value}; retrieve stores it as a plain string
        if (typeof metadata.description === 'string') {
            metadata.description = { value: metadata.description };
        }
        metadata.fullyQualifiedName = metadata.definitionName.value;
        // membership is owned by the attributeSets and read-only on the group
        delete metadata.r__attributeSet_key;
        // server id of the source BU; never sent and must not trigger the id-based update path in createOrUpdate (debug mode)
        delete metadata.definitionID;
        return metadata;
    }

    /**
     * Creates a single attributeGroup
     *
     * @param {MetadataTypeItem} metadata single metadata entry
     * @returns {Promise.<object> | null} Promise of API response or null in case of an error
     */
    static async create(metadata) {
        return super.createREST(metadata, '/hub/v1/contacts/schema/attributeGroups');
    }

    /**
     * helper for {@link MetadataType.createREST}: unwraps the created item so that upsert can parse it like a retrieved item
     *
     * @param {MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {object} apiResponse varies depending on the API call
     * @returns {Promise.<object>} apiResponse, potentially modified
     */
    static async postCreateTasks(metadataEntry, apiResponse) {
        return apiResponse?.attributeGroupDefinition || apiResponse;
    }

    /**
     * attributeGroups cannot be changed via API after creation (only a rename exists, which also overwrites the key on the server).
     * Nothing is sent; differences are only reported. Compares against the raw cached API data.
     *
     * @param {MetadataTypeItem} metadata single metadata entry
     * @param {MetadataTypeItem} metadataBefore cached version from the server
     * @returns {Promise.<null>} always null as nothing is updated
     */
    static async update(metadata, metadataBefore) {
        const key = metadata[this.definition.keyField];
        if (metadata.definitionName?.value !== metadataBefore?.definitionName?.value) {
            Util.logger.error(
                ` ☇ skipping ${this.definition.type} ${key}: renaming an attributeGroup changes its key on the server; rename it in Contact Builder and re-retrieve`
            );
        } else if (
            getDescription(metadata) !== getDescription(metadataBefore) ||
            (metadata.attributeGroupIconKey || '') !== (metadataBefore?.attributeGroupIconKey || '')
        ) {
            Util.logger.warn(
                ` ☇ skipping ${this.definition.type} ${key}: description and attributeGroupIconKey cannot be changed via API after creation`
            );
        } else {
            Util.logger.verbose(` ☇ skipping ${this.definition.type} ${key}: no change detected`);
        }
        return null;
    }

    /**
     * caches attributeGroup and attributeSet (raw API format) unless already cached; shared by both types' preDeleteTasks
     *
     * @returns {Promise.<void>} -
     */
    static async cacheForDelete() {
        if (!cache.getCache()) {
            cache.initCache(this.buObject);
        }
        AttributeSet.buObject = this.buObject;
        AttributeSet.client = this.client;
        AttributeSet.properties = this.properties;
        if (!cache.getCache().attributeGroup) {
            cache.setMetadata('attributeGroup', (await this.retrieveForCache()).metadata);
        }
        if (!cache.getCache().attributeSet) {
            // a fresh cache starts a new delete run: forget cascade-deleted keys of earlier runs / other BUs.
            // Not reset when already cached so that deleting attributeGroup and attributeSet in one command keeps the group's cascade
            AttributeSet.cascadeDeletedKeys.clear();
            // parseResponseBody already writes the raw list into the cache
            await AttributeSet.retrieveForCache();
        }
    }

    /**
     * makes sure attributeGroup and attributeSet are cached before deleting
     *
     * @returns {Promise.<void>} -
     */
    static async preDeleteTasks() {
        await this.cacheForDelete();
    }

    /**
     * Delete an attributeGroup. The server deletes all attributeSets of the group with it (data extensions stay).
     *
     * @param {string} key Identifier of the attributeGroup
     * @returns {Promise.<boolean>} deletion success flag
     */
    static async deleteByKey(key) {
        const group = cache.getByKey(this.definition.type, key);
        if (!group) {
            await this.deleteNotFound(key);
            return false;
        }
        if (group.isSystemDefined) {
            Util.logger.error(
                ` ☇ skipping deletion of ${this.definition.type} ${key}: system-defined attributeGroups cannot be deleted`
            );
            return false;
        }
        const cascaded = AttributeSet._getSetKeysOfGroup(group.definitionID);
        if (cascaded.length) {
            Util.logger.warn(
                ` - deleting ${this.definition.type} ${key} also deletes all of its attributeSets: ${cascaded.join(', ')}`
            );
        }
        const isDeleted = await super.deleteByKeyREST(
            '/hub/v1/contacts/schema/attributeGroups/' + group.definitionID,
            key
        );
        if (isDeleted) {
            delete cache.getCache()[this.definition.type][key];
            await AttributeSet.removeDeletedSets(cascaded, true);
        }
        return isDeleted;
    }
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
AttributeGroup.definition = MetadataTypeDefinitions.attributeGroup;

export default AttributeGroup;
