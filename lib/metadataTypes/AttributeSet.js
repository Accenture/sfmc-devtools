'use strict';

const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');
const AttributeGroup = require('./AttributeGroup');
const Util = require('../util/util');
const cache = require('../util/cache');

/**
 * AttributeSet MetadataType
 *
 * @augments MetadataType
 */
class AttributeSet extends MetadataType {
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
            // ! attributeGroup and attributeSet both link to each other. caching attributeGroup here "manually", assuming that it's quicker than the other way round
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
        const metadataCache = super.parseResponseBody(body);

        // make sure we add the entire list to cache before running postRetrieveTasks because of the self-references this type is using
        // usually, the cache is only written into after all postRetrieveTasks have been run
        cache.setMetadata(this.definition.type, metadataCache);

        const metadataStructure = super.parseResponseBody(body, singleRetrieve);
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
            // attributeSet created for Group Connect do not have a folder
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
                    if (
                        relationship[type + 'Item']?.connectingID?.identifierType ===
                        'FullyQualifiedName'
                    ) {
                        delete relationship[type + 'Item'].connectingID;
                    }
                    let relationshipObj = null;
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
                            // get relationship fieldnames
                            relationshipObj = {
                                valueDefinitions: this._getSystemValueDefinitions(),
                            };
                            break;
                        }
                        case 'AttributeSet': {
                            try {
                                relationship[type + 'Item'].r__attributeSet_definitionKey =
                                    cache.searchForField(
                                        'attributeSet',
                                        relationship[type + 'Item']?.identifier,
                                        'definitionID',
                                        'definitionKey'
                                    );
                                delete relationship[type + 'Item']?.identifier;

                                // get relationship fieldnames
                                // check if its a self-reference to metadata.valueDefinitions or if it's a reference to another attributeSet
                                relationshipObj =
                                    relationship[type + 'Item'].r__attributeSet_definitionKey ===
                                    metadata.definitionKey
                                        ? metadata
                                        : cache.getByKey(
                                              'attributeSet',
                                              relationship[type + 'Item']
                                                  .r__attributeSet_definitionKey
                                          );
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
                    try {
                        // get relationship fieldnames
                        // resolve field values
                        for (const attr of relationship.relationshipAttributes) {
                            const id = attr[type + 'AttributeID'];
                            const valueDefinition = relationshipObj.valueDefinitions.find(
                                (item) => item.valueDefinitionID === id
                            );
                            if (valueDefinition) {
                                attr['c__' + type + 'FullyQualifiedName'] =
                                    valueDefinition.fullyQualifiedName;
                                delete attr[type + 'AttributeID'];
                                delete attr[type + 'ConnectingID'];
                            } else {
                                throw new Error(
                                    `Could not find ${type}AttributeID ${id} of relationship ${relationship.relationshipID}`
                                );
                            }
                        }
                    } catch (ex) {
                        Util.logger.warn(
                            ` - ${this.definition.type} ${metadata[this.definition.nameField]} / ${
                                metadata[this.definition.keyField]
                            }: ${ex.message}`
                        );
                    }
                }
            }
        }

        // Member ID
        delete metadata.customObjectOwnerMID;

        // connectingID.identifierType seems to be always set to 'FullyQualifiedName' - to be sure we check it here and remove it if it's the case
        if (metadata.connectingID?.identifierType === 'FullyQualifiedName') {
            // remove useless field
            delete metadata.connectingID;
        }

        return metadata;
    }

    /**
     * helper for {@link AttributeSet.postRetrieveTasks}
     *
     * @returns {object[]} all system value definitions
     */
    static _getSystemValueDefinitions() {
        if (!this.systemValueDefinitions) {
            this.systemValueDefinitions = Object.values(cache.getCache()['attributeSet'])
                .flatMap((item) => {
                    if (item.isSystemDefined) {
                        return item.valueDefinitions;
                    }
                })
                .filter(Boolean);
        }
        return this.systemValueDefinitions;
    }
}

// Assign definition to static attributes
AttributeSet.definition = require('../MetadataTypeDefinitions').attributeSet;

module.exports = AttributeSet;