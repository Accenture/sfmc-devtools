'use strict';

import AttributeGroup from './AttributeGroup.js';
import MetadataType from './MetadataType.js';
import TYPE from '../../types/mcdev.d.js';
import { Util } from '../util/util.js';
import cache from '../util/cache.js';

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
        return super.retrieveREST(retrieveDir, '/hub/v1/contacts/schema/setDefinitions', null, key);
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
     * used to identify updated shared data extensions that are used in attributeSets.
     * helper for DataExtension.#fixShared_onBU
     *
     * @param {Object.<string, string>} sharedDataExtensionMap ID-Key relationship of shared data extensions
     * @param {object} fixShared_fields DataExtensionField.fixShared_fields
     * @returns {Promise.<string[]>} Promise of list of shared dataExtension IDs
     */
    static async fixShared_retrieve(sharedDataExtensionMap, fixShared_fields) {
        if (!Object.keys(sharedDataExtensionMap).length) {
            return [];
        }
        const result = await super.retrieveREST(null, '/hub/v1/contacts/schema/setDefinitions');
        const metadataMap = result?.metadata;
        if (metadataMap && Object.keys(metadataMap).length) {
            const sharedDeIds = Object.keys(metadataMap)
                .filter(
                    (asKey) =>
                        metadataMap[asKey].storageLogicalType === 'ExactTargetSchema' ||
                        metadataMap[asKey].storageLogicalType === 'DataExtension'
                )
                .filter((asKey) => {
                    // check if dataExtension ID is found on any attributeSet of this BU
                    if (sharedDataExtensionMap[metadataMap[asKey].storageReferenceID.value]) {
                        Util.logger.debug(
                            ` shared dataExtension ID ${metadataMap[asKey].storageReferenceID.value} found in attributeSet ${asKey}`
                        );
                        return true;
                    } else {
                        return false;
                    }
                })
                .filter((asKey) => {
                    // check if any of the dataExtension fields dont exist on the attributeSet or are out of date
                    const deKey =
                        sharedDataExtensionMap[metadataMap[asKey].storageReferenceID.value];
                    const asFields = metadataMap[asKey].valueDefinitions;
                    const deFields = Object.values(fixShared_fields[deKey]);
                    return deFields.some((deField) => {
                        const search = asFields.filter((asf) => asf.name === deField.Name);
                        if (!search.length) {
                            Util.logger.debug(
                                Util.getGrayMsg(
                                    ` - Field ${deField.Name} not found in attributeSet; Note: only first recognized difference is printed to log`
                                )
                            );
                            return true;
                        }
                        const asField = search[0];
                        if (asField.dataType !== deField.FieldType) {
                            Util.logger.debug(
                                Util.getGrayMsg(
                                    ` - Field ${deField.Name} FieldType changed (old: ${asField.dataType}; new: ${deField.FieldType}); Note: only first recognized difference is printed to log`
                                )
                            );
                            return true;
                        }
                        asField.defaultValue ||= '';
                        if (
                            (asField.defaultValue && deField.DefaultValue === '') ||
                            (deField.FieldType === 'Boolean' &&
                                deField.DefaultValue !== '' &&
                                (deField.DefaultValue
                                    ? 'True'
                                    : 'False' !== asField.defaultValue)) ||
                            (deField.FieldType !== 'Boolean' &&
                                deField.DefaultValue !== asField.defaultValue)
                        ) {
                            Util.logger.debug(
                                ` - Field ${deField.Name} DefaultValue changed (old: ${asField.defaultValue}; new: ${deField.DefaultValue}); Note: only first recognized difference is printed to log`
                            );
                            return true;
                        }
                        // some field types don't carry the length property. reset to 0 to ease comparison
                        asField.length ||= 0;
                        if (asField.length !== deField.MaxLength) {
                            Util.logger.debug(
                                ` - Field ${deField.Name} MaxLength changed (old: ${asField.length}; new: ${deField.MaxLength}); Note: only first recognized difference is printed to log`
                            );
                            return true;
                        }
                        if (asField.isNullable !== deField.IsRequired) {
                            Util.logger.debug(
                                ` - Field ${deField.Name} IsRequired changed (old: ${asField.isNullable}; new: ${deField.IsRequired}); Note: only first recognized difference is printed to log`
                            );
                            return true;
                        }
                        if (asField.isPrimaryKey !== deField.IsPrimaryKey) {
                            Util.logger.debug(
                                ` - Field ${deField.Name} IsPrimaryKey changed (old: ${asField.isPrimaryKey}; new: ${deField.IsPrimaryKey}); Note: only first recognized difference is printed to log`
                            );
                            return true;
                        }
                        return false;
                    });
                })
                .map((key) => metadataMap[key].storageReferenceID.value)
                .filter(Boolean);
            return sharedDeIds;
        } else {
            // nothing to do - return empty array
            return [];
        }
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
                // shared / local DEs
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

        // remove duplicate ID fields (main field is definitionID)
        delete metadata.setDefinitionID;
        if (metadata.dataRetentionProperties?.setDefinitionID) {
            delete metadata.dataRetentionProperties?.setDefinitionID;
        }

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
        this.systemValueDefinitions ||= {};
        if (!this.systemValueDefinitions[this.buObject.mid]) {
            this.systemValueDefinitions[this.buObject.mid] = Object.values(
                cache.getCache()['attributeSet']
            )
                .flatMap((item) => {
                    if (item.isSystemDefined) {
                        return item.valueDefinitions;
                    }
                })
                .filter(Boolean);
        }
        return this.systemValueDefinitions[this.buObject.mid];
    }
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
AttributeSet.definition = MetadataTypeDefinitions.attributeSet;

export default AttributeSet;
