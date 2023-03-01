'use strict';

const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');
const AttributeGroup = require('./AttributeGroup');
const Util = require('../util/util');
const cache = require('../util/cache');

/**
 * AttributeSetDefinition MetadataType
 *
 * @augments MetadataType
 */
class AttributeSetDefinition extends MetadataType {
    /**
     * Retrieves Metadata of schema set Definitions.
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void} [_] unused parameter
     * @param {void} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise
     */
    static async retrieve(retrieveDir, _, __, key) {
        if (retrieveDir && !cache.getCache()?.attributeGroup) {
            // ! attributeGroup and attributeSetDefinition both link to each other. caching attributeGroup here "manually", assuming that it's quicker than the other way round
            Util.logger.info(' - Caching dependent Metadata: attributeGroup');
            AttributeGroup.buObject = this.buObject;
            AttributeGroup.client = this.client;
            AttributeGroup.properties = this.properties;
            const result = await AttributeGroup.retrieveForCache();
            cache.setMetadata('attributeGroup', result.metadata);
        }
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

    /**
     * Builds map of metadata entries mapped to their keyfields
     *
     * @param {object} body json of response body
     * @param {string|number} [singleRetrieve] key of single item to filter by
     * @returns {TYPE.MetadataTypeMap} keyField => metadata map
     */
    static parseResponseBody(body, singleRetrieve) {
        const metadataStructure = super.parseResponseBody(body, singleRetrieve);

        // make sure we add the entire list to cache before running postRetrieveTasks because of the self-references this type is using
        // usually, the cache is only written into after all postRetrieveTasks have been run
        cache.setMetadata(this.definition.type, metadataStructure);

        return metadataStructure;
    }

    /**
     * manages post retrieve steps
     *
     * @param {TYPE.MetadataTypeItem} metadata a single metadata
     * @returns {TYPE.MetadataTypeItem} metadata
     */
    static postRetrieveTasks(metadata) {
        // folder
        if (metadata.storageLogicalType === 'DataExtension') {
            // attributeSetDefinition created for Group Connect do not have a folder
            super.setFolderPath(metadata);
        }

        // source
        switch (metadata.storageLogicalType) {
            case 'ExactTargetSchema': // synced / shared DEs
            case 'DataExtension': {
                // local DEs
                try {
                    metadata.r__dataExtension_CustomerKey = cache.searchForField(
                        'dataExtension',
                        metadata.storageReferenceID.value,
                        'ObjectID',
                        'CustomerKey'
                    );
                    // TODO: check if fields in metadata.sendAttributeStorageName exist in data extension --> error
                    // TODO: check if fields in data extension exist in metadata.sendAttributeStorageName --> warn

                    delete metadata.storageReferenceID;
                    delete metadata.storageName;
                    delete metadata.storageObjectInformation; // type ExactTargetSchema only
                } catch (ex) {
                    Util.logger.warn(
                        ` - ${this.definition.type} ${metadata[this.definition.keyField]}: ${
                            ex.message
                        }`
                    );
                }
                break;
            }
            case 'MobileAttributes': {
                // TODO: implement
                // "storageName": "_MobileAddress",

                break;
            }
            case 'EnterpriseAttributes': {
                // TODO: implement
                // "storageName": "_EnterpriseAttribute",

                break;
            }
            case 'PushAttributes': {
                // TODO: implement
                // "storageName": "_PushAddress",

                break;
            }
        }

        // relationships to attributeGroups & AttributeSet
        if (Array.isArray(metadata.relationships)) {
            for (const relationship of metadata.relationships) {
                for (const type of ['left', 'right']) {
                    switch (relationship[type + 'Item'].relationshipType) {
                        case 'AttributeGroup': {
                            try {
                                relationship[type + 'Item'].r__attributeGroup_definitionKey =
                                    cache.searchForField(
                                        'attributeGroup',
                                        relationship[type + 'Item']?.identifier,
                                        'definitionID',
                                        'definitionKey'
                                    );
                                delete relationship[type + 'Item']?.identifier;
                            } catch (ex) {
                                Util.logger.warn(
                                    ` - ${this.definition.type} ${
                                        metadata[this.definition.keyField]
                                    }: ${ex.message}`
                                );
                            }
                            break;
                        }
                        case 'AttributeSet': {
                            try {
                                relationship[
                                    type + 'Item'
                                ].r__attributeSetDefinition_definitionKey = cache.searchForField(
                                    'attributeSetDefinition',
                                    relationship[type + 'Item']?.identifier,
                                    'definitionID',
                                    'definitionKey'
                                );
                                delete relationship[type + 'Item']?.identifier;
                            } catch (ex) {
                                Util.logger.warn(
                                    ` - ${this.definition.type} ${
                                        metadata[this.definition.keyField]
                                    }: ${ex.message}`
                                );
                            }
                            break;
                        }
                    }
                }
            }
        }

        // Member ID
        delete metadata.customObjectOwnerMID;

        return metadata;
    }
    /**
     * prepares for deployment
     *
     * @param {TYPE.MetadataTypeItem} metadata a single item
     * @returns {TYPE.MetadataTypeItem} Promise
     */
    static async preDeployTasks(metadata) {
        // folder
        if (metadata.storageLogicalType) {
            // attributeSetDefinition created for Group Connect do not have a folder
            super.setFolderId(metadata);
        }

        // source
        switch (metadata.storageLogicalType) {
            case 'ExactTargetSchema': // synced / shared DEs
            case 'DataExtension': {
                // local DEs
                try {
                    const de = cache.getByKey(
                        'dataExtension',
                        metadata.r__dataExtension_CustomerKey
                    );

                    metadata.storageReferenceID = {
                        value: de.ObjectID,
                    };
                    metadata.storageName = de.Name;
                    if (metadata.storageLogicalType === 'ExactTargetSchema') {
                        metadata.storageObjectInformation = {
                            externalObjectAPIName: de.Name.split('_Salesforce')[0],
                        };
                    }

                    // TODO: check if fields in metadata.sendAttributeStorageName exist in data extension --> error
                    // TODO: check if fields in data extension exist in metadata.sendAttributeStorageName --> warn
                } catch (ex) {
                    Util.logger.warn(
                        ` - ${this.definition.type} ${metadata[this.definition.keyField]}: ${
                            ex.message
                        }`
                    );
                }
                break;
            }
            case 'MobileAttributes': {
                // TODO: implement
                // "storageName": "_MobileAddress",

                break;
            }
            case 'EnterpriseAttributes': {
                // TODO: implement
                // "storageName": "_EnterpriseAttribute",

                break;
            }
            case 'PushAttributes': {
                // TODO: implement
                // "storageName": "_PushAddress",

                break;
            }
        }

        // attributeGroups
        // relationships to attributeGroups & AttributeSet
        if (Array.isArray(metadata.relationships)) {
            for (const relationship of metadata.relationships) {
                try {
                    relationship.leftItem.identifier = cache.searchForField(
                        'attributeGroup',
                        relationship.leftItem.r__attributeGroup_definitionKey,
                        'definitionKey',
                        'definitionID'
                    );
                    delete relationship.leftItem.r__attributeGroup_definitionKey;
                } catch (ex) {
                    Util.logger.warn(
                        ` - ${this.definition.type} ${metadata[this.definition.keyField]}: ${
                            ex.message
                        }`
                    );
                }
            }
            for (const relationship of metadata.relationships) {
                for (const type of ['left', 'right']) {
                    switch (relationship[type + 'Item'].relationshipType) {
                        case 'AttributeGroup': {
                            relationship[type + 'Item'].identifier = cache.searchForField(
                                'attributeGroup',
                                relationship[type + 'Item']?.r__attributeGroup_definitionKey,
                                'definitionKey',
                                'definitionID'
                            );
                            break;
                        }
                        case 'AttributeSet': {
                            try {
                                relationship[type + 'Item'].identifier = cache.searchForField(
                                    'attributeSetDefinition',
                                    relationship[type + 'Item']
                                        ?.r__attributeSetDefinition_definitionKey,
                                    'definitionID',
                                    'definitionKey'
                                );

                                // get relationship fieldnames
                                // check if its a self-reference to metadata.valueDefinitions or if it's a reference to another attributeSetDefinition
                                // TODO: implement
                            } catch (ex) {
                                Util.logger.warn(
                                    ` - ${this.definition.type} ${
                                        metadata[this.definition.keyField]
                                    }: ${ex.message}`
                                );
                            }
                            break;
                        }
                    }
                }
            }
        }

        // Member ID - set to ID of deployment target automatically
        metadata.customObjectOwnerMID = this.buObject.mid;

        return metadata;
    }
}

// Assign definition to static attributes
AttributeSetDefinition.definition = require('../MetadataTypeDefinitions').attributeSetDefinition;

module.exports = AttributeSetDefinition;
