'use strict';

import MetadataType from './MetadataType.js';
import { Util } from '../util/util.js';
import cache from '../util/cache.js';
import { isDeepEqual } from '../util/isDeepEqual.js';

/**
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItem} MetadataTypeItem
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMap} MetadataTypeMap
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMapObj} MetadataTypeMapObj
 */

/**
 * case-insensitive comparison of API ids (GUIDs)
 *
 * @param {string} [a] id
 * @param {string} [b] id
 * @returns {boolean} true if both ids are set and equal
 */
function isSameId(a, b) {
    return !!a && !!b && String(a).toLowerCase() === String(b).toLowerCase();
}

/**
 * helper for {@link AttributeSet._getDifferences}: retention settings without the duplicate set id
 *
 * @param {MetadataTypeItem} item attributeSet
 * @returns {object} dataRetentionProperties without setDefinitionID
 */
function getRetention(item) {
    const retention = structuredClone(item.dataRetentionProperties || {});
    delete retention.setDefinitionID;
    return retention;
}

/**
 * AttributeSet MetadataType
 *
 * @augments MetadataType
 */
class AttributeSet extends MetadataType {
    static systemValueDefinitions;
    /**
     * data resolved in preDeployTasks that create() needs but which must not be sent to the API
     *
     * @type {Map.<string, {attributeGroupID: string}>}
     */
    static deployContext = new Map();
    /**
     * owning attributeGroup id of every set created during the current deploy, keyed by the set's definitionID
     *
     * @type {Map.<string, string>}
     */
    static createdSetGroups = new Map();
    /**
     * keys of sets the server deleted together with their parent set or attributeGroup during the current delete run;
     * reset whenever the attributeSet cache is reloaded for a delete (see AttributeGroup.cacheForDelete)
     *
     * @type {Set.<string>}
     */
    static cascadeDeletedKeys = new Set();

    /**
     * Retrieves Metadata of schema set Definitions.
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise
     */
    static async retrieve(retrieveDir, _, __, key) {
        // attributeGroup is cached by Retriever via the attributeSet -> attributeGroup dependency
        return super.retrieveREST(retrieveDir, '/hub/v1/contacts/schema/setDefinitions', key);
    }

    /**
     * Retrieves Metadata of schema set definitions for caching.
     *
     * @returns {Promise.<MetadataTypeMapObj>} Promise
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
     * @param {string} [singleRetrieve] key of single item to filter by
     * @returns {MetadataTypeMap} keyField => metadata map
     */
    static parseResponseBody(body, singleRetrieve) {
        const metadataCache = super.parseResponseBody(body);

        // make sure we add the entire list to cache before running postRetrieveTasks because of the self-references this type is using
        // usually, the cache is only written into after all postRetrieveTasks have been run
        if (Array.isArray(body)) {
            // an array body only comes from upsert (create/update results): merge it into the existing cache instead of replacing the full list
            cache.mergeMetadata(this.definition.type, metadataCache);
        } else {
            cache.setMetadata(this.definition.type, metadataCache);
        }

        const metadataStructure = super.parseResponseBody(body, singleRetrieve);
        return metadataStructure;
    }

    /**
     * manages post retrieve steps
     *
     * @param {MetadataTypeItem} metadata a single metadata
     * @returns {MetadataTypeItem} metadata
     */
    static postRetrieveTasks(metadata) {
        // the cache holds the same objects; work on a copy so that other sets can still read the raw relationships from the cache
        metadata = structuredClone(metadata);

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
                    metadata.r__dataExtension_key = cache.searchForField(
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

        // relationships to attributeGroups & AttributeSet; stored on the set that is linked in (right side)
        const relationships = this._getIncomingRelationships(metadata);
        if (relationships) {
            metadata.relationships = relationships;
        }
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
                                relationship[type + 'Item'].r__attributeGroup_key =
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
                                relationship[type + 'Item'].r__attributeSet_key =
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
                                    relationship[type + 'Item'].r__attributeSet_key ===
                                    metadata.definitionKey
                                        ? metadata
                                        : cache.getByKey(
                                              'attributeSet',
                                              relationship[type + 'Item'].r__attributeSet_key
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
                                // the set itself is identified via leftItem / rightItem; only store the field key
                                attr['c__' + type + 'Field'] = valueDefinition.definitionKey;
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
     * Returns the relationships that link the given set in (set is rightItem), incl. self-relationships.
     * The API returns set-to-set relationships only on the left (pre-existing) set, so these are taken from the other sets in the cache,
     * while relationships pointing from this set to another set are left out (they are stored in the other set's file).
     *
     * @param {MetadataTypeItem} metadata a single attributeSet (raw API format)
     * @returns {object[] | undefined} copy of the incoming relationships; undefined if the set had none and none were found
     */
    static _getIncomingRelationships(metadata) {
        const ownId = metadata.definitionID;
        const relationships = Array.isArray(metadata.relationships)
            ? metadata.relationships.filter(
                  (rel) =>
                      !(
                          rel.leftItem?.relationshipType === 'AttributeSet' &&
                          rel.leftItem.identifier === ownId
                      ) || rel.rightItem?.identifier === ownId
              )
            : [];
        const knownIds = new Set(relationships.map((rel) => rel.relationshipID));
        const cachedSets = cache.getCache()?.[this.definition.type] || {};
        for (const otherSet of Object.values(cachedSets)) {
            if (otherSet.definitionID === ownId || !Array.isArray(otherSet.relationships)) {
                continue;
            }
            for (const rel of otherSet.relationships) {
                if (rel.rightItem?.identifier !== ownId || knownIds.has(rel.relationshipID)) {
                    continue;
                }

                relationships.push(structuredClone(rel));
                knownIds.add(rel.relationshipID);
            }
        }
        return Array.isArray(metadata.relationships) || relationships.length
            ? relationships
            : undefined;
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
        this.deployContext = new Map();
        this.createdSetGroups = new Map();
        return super.deploy(metadata, deployDir, retrieveDir);
    }

    /**
     * sets linked to other sets of the same deploy need to be created after those; hence upsert runs sequentially on a sorted map
     *
     * @param {MetadataTypeMap} metadataMap metadata mapped by their keyField
     * @param {string} deployDir directory where deploy metadata are saved
     * @returns {Promise.<MetadataTypeMap>} keyField => metadata map
     */
    static async upsert(metadataMap, deployDir) {
        return super.upsert(this._sortForDeploy(metadataMap), deployDir, true);
    }

    /**
     * helper for {@link AttributeSet.upsert}: puts sets whose incoming relationship starts at another set of this deploy after that set.
     * Sets that are part of (or depend on) a cycle are reported and left out.
     *
     * @param {MetadataTypeMap} metadataMap metadata mapped by their keyField
     * @returns {MetadataTypeMap} sorted copy of the map
     */
    static _sortForDeploy(metadataMap) {
        const parents = {};
        for (const key in metadataMap) {
            parents[key] = (
                Array.isArray(metadataMap[key]?.relationships) ? metadataMap[key].relationships : []
            )
                .map((rel) => rel.leftItem?.r__attributeSet_key)
                .filter((parentKey) => parentKey && parentKey !== key && metadataMap[parentKey]);
        }
        /** @type {MetadataTypeMap} */
        const sorted = {};
        let added = true;
        while (added) {
            added = false;
            for (const key in metadataMap) {
                if (sorted[key] || parents[key].some((parentKey) => !sorted[parentKey])) {
                    continue;
                }

                sorted[key] = metadataMap[key];
                added = true;
            }
        }
        for (const key in metadataMap) {
            if (!sorted[key]) {
                Util.logger.error(
                    ` ☇ skipping ${this.definition.type} ${key}: circular relationship between attributeSets of this deploy (${parents[key].join(', ')})`
                );
            }
        }
        return sorted;
    }

    /**
     * prepares a set for deployment: resolves all references and builds the create payload.
     * Every unsupported situation throws, which makes upsert skip the item.
     *
     * @param {MetadataTypeItem} metadata a single item
     * @returns {Promise.<MetadataTypeItem>} Promise of the create payload
     */
    static async preDeployTasks(metadata) {
        const key = metadata[this.definition.keyField];
        if (metadata.isSystemDefined) {
            throw new Error('system-defined attributeSets cannot be deployed');
        }
        if (metadata.storageLogicalType !== 'DataExtension') {
            throw new Error(
                `attributeSets with storageLogicalType ${metadata.storageLogicalType} cannot be deployed; only sets linking a data extension are supported`
            );
        }
        const name = metadata.name || metadata.definitionName?.value;
        if (!name) {
            throw new Error('name is required');
        }
        if (!metadata.r__dataExtension_key) {
            throw new Error('r__dataExtension_key is required');
        }

        // data extension (local, shared and synchronized DEs are all in the dataExtension cache)
        const deObjectID = cache.searchForField(
            'dataExtension',
            metadata.r__dataExtension_key,
            'CustomerKey',
            'ObjectID'
        );
        const deName = cache.searchForField(
            'dataExtension',
            metadata.r__dataExtension_key,
            'CustomerKey',
            'Name'
        );
        const otherSet = Object.values(cache.getCache()?.[this.definition.type] || {}).find(
            (set) =>
                set[this.definition.keyField] !== key &&
                isSameId(set.storageReferenceID?.value, deObjectID)
        );
        if (otherSet) {
            throw new Error(
                `dataExtension ${metadata.r__dataExtension_key} is already linked by attributeSet ${otherSet[this.definition.keyField]}`
            );
        }

        // relationship
        const incoming = (
            Array.isArray(metadata.relationships) ? metadata.relationships : []
        ).filter((rel) => {
            if (
                rel.leftItem?.r__attributeSet_key === key &&
                rel.rightItem?.r__attributeSet_key === key
            ) {
                Util.logger.warn(
                    ` - ${this.definition.type} ${key}: self-relationship cannot be created via API and is ignored`
                );
                return false;
            }
            return true;
        });
        if (incoming.length !== 1) {
            throw new Error(
                `exactly one relationship linking this set to an attributeGroup or another attributeSet is required, found ${incoming.length}`
            );
        }
        const rel = incoming[0];
        if (!rel.leftItem?.cardinality || !rel.rightItem?.cardinality) {
            throw new Error('leftItem.cardinality and rightItem.cardinality are required');
        }
        if (!Array.isArray(rel.relationshipAttributes) || !rel.relationshipAttributes.length) {
            throw new Error('relationshipAttributes are required');
        }
        const left = this._resolveLeftItem(rel.leftItem);
        const cachedVersion = cache.getByKey(this.definition.type, key);
        // new sets reference the DE field id; existing sets only need their own attribute ids to detect changes
        const deFieldIds = cachedVersion ? null : await this._getDataExtensionFieldIds(deObjectID);
        const relationshipAttributes = rel.relationshipAttributes.map((attr) => {
            const rightAttributeID = cachedVersion
                ? cachedVersion.valueDefinitions?.find(
                      (valueDef) => valueDef.definitionKey === attr.c__rightField
                  )?.valueDefinitionID
                : deFieldIds[attr.c__rightField];
            if (!cachedVersion && !rightAttributeID) {
                throw new Error(
                    `field ${attr.c__rightField} not found in dataExtension ${metadata.r__dataExtension_key}`
                );
            }
            return {
                leftAttributeID: this._getLeftAttributeID(left, attr.c__leftField),
                rightAttributeID,
            };
        });

        const relationship = {
            leftItem: {
                identifier: left.identifier,
                relationshipType: left.relationshipType,
                cardinality: rel.leftItem.cardinality,
            },
            rightItem: {
                relationshipType: 'AttributeSet',
                cardinality: rel.rightItem.cardinality,
            },
            relationshipAttributes,
            isGroupToSetRelationship: left.relationshipType === 'AttributeGroup',
        };
        if (relationship.isGroupToSetRelationship) {
            // differs per relationship attribute; send exactly what was retrieved
            if (rel.leftRelationshipReferenceType) {
                relationship.leftRelationshipReferenceType = rel.leftRelationshipReferenceType;
            }
            if (rel.leftRelationshipIDs) {
                relationship.leftRelationshipIDs = structuredClone(rel.leftRelationshipIDs);
            }
        }

        /** @type {MetadataTypeItem} */
        const payload = {
            definitionKey: key,
            name,
            definitionName: { value: name },
            storageReferenceID: { type: 'Guid', value: deObjectID },
            storageName: deName,
            storageLogicalType: 'DataExtension',
            isRoot: metadata.isRoot ?? false,
            valueDefinitions: [],
            nonStandardAttributeGroupReferences: [],
            relationships: [relationship],
        };
        if (metadata.dataRetentionProperties) {
            // not createable; only used to warn about differences
            payload.dataRetentionProperties = metadata.dataRetentionProperties;
        }
        this.deployContext.set(key, { attributeGroupID: left.groupId });
        return payload;
    }

    /**
     * helper for {@link AttributeSet.preDeployTasks}
     *
     * @param {object} leftItem leftItem of the relationship in retrieve format
     * @returns {{identifier: string, relationshipType: 'AttributeGroup'|'AttributeSet', groupId: string, set?: MetadataTypeItem}} resolved left side
     */
    static _resolveLeftItem(leftItem) {
        if (leftItem?.r__attributeGroup_key) {
            const group = cache.getByKey('attributeGroup', leftItem.r__attributeGroup_key);
            if (!group?.definitionID) {
                throw new Error(
                    `attributeGroup ${leftItem.r__attributeGroup_key} was not found on your BU`
                );
            }
            return {
                identifier: group.definitionID,
                relationshipType: 'AttributeGroup',
                groupId: group.definitionID,
            };
        }
        if (leftItem?.r__attributeSet_key) {
            const set = cache.getByKey(this.definition.type, leftItem.r__attributeSet_key);
            if (!set?.definitionID) {
                throw new Error(
                    `attributeSet ${leftItem.r__attributeSet_key} was not found on your BU or in this deploy`
                );
            }
            const groupId = this._getOwningGroupId(set.definitionID);
            if (!groupId) {
                throw new Error(
                    `could not find the attributeGroup of attributeSet ${leftItem.r__attributeSet_key}`
                );
            }
            return {
                identifier: set.definitionID,
                relationshipType: 'AttributeSet',
                groupId,
                set,
            };
        }
        throw new Error('leftItem requires r__attributeGroup_key or r__attributeSet_key');
    }

    /**
     * helper for {@link AttributeSet.preDeployTasks}
     *
     * @param {{relationshipType: string, set?: MetadataTypeItem}} left resolved left side
     * @param {string} fieldKey c__leftField
     * @returns {string} valueDefinitionID of the left attribute
     */
    static _getLeftAttributeID(left, fieldKey) {
        if (left.relationshipType === 'AttributeSet') {
            const valueDefinition = left.set.valueDefinitions?.find(
                (valueDef) => valueDef.definitionKey === fieldKey
            );
            if (!valueDefinition?.valueDefinitionID) {
                throw new Error(
                    `field ${fieldKey} not found in attributeSet ${left.set[this.definition.keyField]}`
                );
            }
            return valueDefinition.valueDefinitionID;
        }
        // group side: attributes of the system sets; prefer the root Contact set as keys like ContactKey exist on several system sets
        const systemSets = Object.values(cache.getCache()?.[this.definition.type] || {}).filter(
            (set) => set.isSystemDefined
        );
        const contactMatch = systemSets
            .find((set) => set[this.definition.keyField] === 'Contact')
            ?.valueDefinitions?.find((valueDef) => valueDef.definitionKey === fieldKey);
        if (contactMatch?.valueDefinitionID) {
            return contactMatch.valueDefinitionID;
        }
        const matches = systemSets.flatMap((set) =>
            (set.valueDefinitions || [])
                .filter((valueDef) => valueDef.definitionKey === fieldKey)
                .map((valueDef) => ({ setKey: set[this.definition.keyField], valueDef }))
        );
        if (matches.length === 1 && matches[0].valueDef.valueDefinitionID) {
            return matches[0].valueDef.valueDefinitionID;
        }
        throw new Error(
            matches.length
                ? `field ${fieldKey} is ambiguous on the attributeGroup side (found in ${matches.map((m) => m.setKey).join(', ')})`
                : `field ${fieldKey} not found on the attributeGroup side`
        );
    }

    /**
     * helper for {@link AttributeSet.preDeployTasks}: SOAP cannot return fields of parent-owned DEs from a child BU, REST can
     *
     * @param {string} deObjectID ObjectID of the data extension
     * @returns {Promise.<Object.<string, string>>} field name => field id
     */
    static async _getDataExtensionFieldIds(deObjectID) {
        const response = await this.client.rest.get(`/data/v1/customobjects/${deObjectID}/fields`);
        const fields = Array.isArray(response) ? response : response?.fields || [];
        return Object.fromEntries(fields.map((field) => [field.name, field.id]));
    }

    /**
     * finds the raw relationship that links the given set in (set is rightItem; self-relationships are ignored).
     * A set-to-set relationship is only stored on the left set, hence all cached sets are searched.
     *
     * @param {string} setId definitionID of the set
     * @returns {{relationship: object, storedOn: string} | undefined} relationship and the definitionID of the set that holds it
     */
    static _findIncomingRelationship(setId) {
        for (const set of Object.values(cache.getCache()?.[this.definition.type] || {})) {
            for (const rel of Array.isArray(set.relationships) ? set.relationships : []) {
                if (
                    isSameId(rel.rightItem?.identifier, setId) &&
                    !isSameId(rel.leftItem?.identifier, setId)
                ) {
                    return { relationship: rel, storedOn: set.definitionID };
                }
            }
        }
        return;
    }

    /**
     * returns the id of the attributeGroup a set belongs to; needed as attributeGroupID query parameter
     *
     * @param {string} setId definitionID of the set
     * @param {Set.<string>} [visited] used internally to stop on circular relationships
     * @returns {string | undefined} definitionID of the attributeGroup
     */
    static _getOwningGroupId(setId, visited = new Set()) {
        if (this.createdSetGroups.has(setId)) {
            return this.createdSetGroups.get(setId);
        }
        const groups = Object.values(cache.getCache()?.attributeGroup || {});
        const setKey = Object.values(cache.getCache()?.[this.definition.type] || {}).find((set) =>
            isSameId(set.definitionID, setId)
        )?.[this.definition.keyField];
        const group = groups.find(
            (group) =>
                group.attributeSetIdentifiers?.some((item) => isSameId(item.definitionID, setId)) ||
                // groups deployed in the same run are cached in retrieve format
                (setKey && Array.isArray(group.r__attributeSet_key)
                    ? group.r__attributeSet_key.includes(setKey)
                    : false)
        );
        if (group) {
            return group.definitionID;
        }
        // follow the incoming relationship up to the group
        if (visited.has(setId)) {
            return;
        }
        visited.add(setId);
        const leftItem = this._findIncomingRelationship(setId)?.relationship.leftItem;
        if (leftItem?.relationshipType === 'AttributeGroup') {
            return leftItem.identifier;
        }
        return leftItem?.identifier
            ? this._getOwningGroupId(leftItem.identifier, visited)
            : undefined;
    }

    /**
     * Creates a single attributeSet
     *
     * @param {MetadataTypeItem} metadata single metadata entry
     * @returns {Promise.<object> | null} Promise of API response or null in case of an error
     */
    static async create(metadata) {
        const groupId = this.deployContext.get(
            metadata[this.definition.keyField]
        )?.attributeGroupID;
        return super.createREST(
            metadata,
            '/hub/v1/contacts/schema/setDefinitions?attributeGroupID=' + groupId
        );
    }

    /**
     * helper for {@link MetadataType.createREST}: unwraps the created item so that upsert can parse it like a retrieved item.
     * The server generates definitionID and valueDefinitions; these are copied onto the deployed entry so that upsert caches them
     * and sets linked to this one later in the same deploy can be resolved.
     *
     * @param {MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {object} apiResponse varies depending on the API call
     * @returns {Promise.<object>} apiResponse, potentially modified
     */
    static async postCreateTasks(metadataEntry, apiResponse) {
        let item = apiResponse?.setDefinition || apiResponse;
        if (Array.isArray(item)) {
            item = item[0];
        }
        if (item?.definitionID) {
            Object.assign(metadataEntry, structuredClone(item));
            const groupId = this.deployContext.get(
                metadataEntry[this.definition.keyField]
            )?.attributeGroupID;
            if (groupId) {
                this.createdSetGroups.set(item.definitionID, groupId);
            }
        }
        return item;
    }

    /**
     * helper for {@link AttributeSet.hasChanged} and {@link AttributeSet.update}
     *
     * @param {MetadataTypeItem} cachedVersion cached version from the server (raw API format)
     * @param {MetadataTypeItem} metadata payload created by preDeployTasks
     * @returns {{name: boolean, cardinality: {relationship: object, storedOn: string} | null, unsupported: string[]}} differences
     */
    static _getDifferences(cachedVersion, metadata) {
        const differences = {
            name:
                metadata.definitionName?.value !==
                (cachedVersion.definitionName?.value ?? cachedVersion.name),
            cardinality: null,
            unsupported: [],
        };
        if (
            !isSameId(metadata.storageReferenceID?.value, cachedVersion.storageReferenceID?.value)
        ) {
            differences.unsupported.push('linked dataExtension');
        }
        if (Boolean(metadata.isRoot) !== Boolean(cachedVersion.isRoot)) {
            differences.unsupported.push('isRoot');
        }
        if (
            metadata.dataRetentionProperties &&
            !isDeepEqual(getRetention(metadata), getRetention(cachedVersion))
        ) {
            differences.unsupported.push('dataRetentionProperties');
        }
        const rel = metadata.relationships?.[0];
        const incoming = this._findIncomingRelationship(cachedVersion.definitionID);
        if (!rel || !incoming) {
            differences.unsupported.push('relationship');
        } else if (
            !isSameId(incoming.relationship.leftItem?.identifier, rel.leftItem.identifier) ||
            incoming.relationship.leftItem?.relationshipType !== rel.leftItem.relationshipType
        ) {
            differences.unsupported.push('relationship parent');
        } else {
            const getPairs = (attributes) =>
                (attributes || [])
                    .map((attr) => `${attr.leftAttributeID}|${attr.rightAttributeID}`.toLowerCase())
                    .toSorted();
            if (
                !isDeepEqual(
                    getPairs(incoming.relationship.relationshipAttributes),
                    getPairs(rel.relationshipAttributes)
                )
            ) {
                differences.unsupported.push('relationship fields');
            }
            if (
                incoming.relationship.leftItem.cardinality !== rel.leftItem.cardinality ||
                incoming.relationship.rightItem?.cardinality !== rel.rightItem.cardinality
            ) {
                differences.cardinality = incoming;
            }
        }
        return differences;
    }

    /**
     * test if metadata was actually changed or not to potentially skip it during deployment.
     * only compares what the payload contains, as the cache holds raw API data
     *
     * @param {MetadataTypeItem} cachedVersion cached version from the server
     * @param {MetadataTypeItem} metadata item to upload
     * @returns {boolean} true if metadata was changed
     */
    static hasChanged(cachedVersion, metadata) {
        const differences = this._getDifferences(cachedVersion, metadata);
        if (differences.name || differences.cardinality || differences.unsupported.length) {
            return true;
        }
        Util.logger.verbose(
            ` ☇ skipping ${this.definition.type} ${metadata[this.definition.keyField]} / ${
                metadata[this.definition.nameField] || ''
            }: no change detected`
        );
        return false;
    }

    /**
     * Updates the few things the API allows to change: the name and the cardinality of the incoming relationship.
     * Everything else is reported as warning. Relationships are never deleted here because deleting the last one deletes the set.
     *
     * @param {MetadataTypeItem} metadata payload created by preDeployTasks
     * @param {MetadataTypeItem} metadataBefore cached version from the server (raw API format)
     * @returns {Promise.<object | null>} updated item in raw API format or null if nothing was updated
     */
    static async update(metadata, metadataBefore) {
        const key = metadata[this.definition.keyField];
        const differences = this._getDifferences(metadataBefore, metadata);
        if (differences.unsupported.length) {
            Util.logger.warn(
                ` ☇ ${this.definition.type} ${key}: ${differences.unsupported.join(', ')} cannot be changed via API; change not applied`
            );
        }
        let updated = false;
        if (differences.name) {
            try {
                await this.client.rest.post(
                    `/hub/v1/contacts/schema/setDefinitions/${metadataBefore.definitionID}/definitionName`,
                    { value: metadata.definitionName.value }
                );
                metadataBefore.definitionName = { value: metadata.definitionName.value };
                metadataBefore.name = metadata.definitionName.value;
                updated = true;
                Util.logger.info(
                    ` - updated ${this.definition.type} ${key}: name changed to ${metadata.definitionName.value}`
                );
            } catch (ex) {
                this._logUpdateError(ex, key, 'name');
            }
        }
        if (differences.cardinality) {
            const { relationship, storedOn } = differences.cardinality;
            const rel = metadata.relationships[0];
            try {
                await this.client.rest.post(
                    `/hub/v1/contacts/schema/setDefinitions/${storedOn}/relationships/${relationship.relationshipID}/items`,
                    {
                        leftItem: { cardinality: rel.leftItem.cardinality },
                        rightItem: { cardinality: rel.rightItem.cardinality },
                    }
                );
                // the relationship object is part of the cache (on this set or on the left set)
                relationship.leftItem.cardinality = rel.leftItem.cardinality;
                relationship.rightItem.cardinality = rel.rightItem.cardinality;
                updated = true;
                Util.logger.info(
                    ` - updated ${this.definition.type} ${key}: relationship cardinality changed to ${rel.leftItem.cardinality} : ${rel.rightItem.cardinality}`
                );
            } catch (ex) {
                this._logUpdateError(ex, key, 'relationship cardinality');
            }
        }
        if (!updated) {
            return null;
        }
        const result = structuredClone(metadataBefore);
        // upsert caches the deployed entry; keep it in raw API format for sets processed later in this deploy
        Object.assign(metadata, structuredClone(result));
        return result;
    }

    /**
     * helper for {@link AttributeSet.update}
     *
     * @param {object} ex error
     * @param {string} key key of the set
     * @param {string} what what was updated
     * @returns {void}
     */
    static _logUpdateError(ex, key, what) {
        Util.logger.error(` ☇ error updating ${what} of ${this.definition.type} ${key}:`);
        const parsedErrors = this.getErrorsREST(ex);
        if (parsedErrors.length) {
            for (const msg of parsedErrors) {
                Util.logger.error('   • ' + msg);
            }
        } else if (ex?.message) {
            Util.logger.error('   • ' + ex.message);
        }
    }

    /**
     * re-reads all sets after a successful create/update so that the saved files reflect the server
     * (e.g. a set-to-set relationship is only returned on the left set)
     *
     * @param {MetadataTypeMap} upsertResults metadata mapped by their keyField as returned by update/create
     * @param {MetadataTypeMap} originalMetadata metadata to be updated (contains additioanl fields)
     * @param {{created: number, updated: number}} createdUpdated counter representing successful creates/updates
     * @returns {Promise.<void>} -
     */
    static async postDeployTasks(upsertResults, originalMetadata, createdUpdated) {
        if (!createdUpdated.created && !createdUpdated.updated) {
            return;
        }
        try {
            const fresh = (await this.retrieveForCache()).metadata;
            for (const key in upsertResults) {
                if (fresh[key]) {
                    upsertResults[key] = fresh[key];
                } else {
                    // not (yet) returned by the server: keep what create/update returned
                    cache.mergeMetadata(this.definition.type, { [key]: upsertResults[key] });
                }
            }
        } catch (ex) {
            Util.logger.warn(
                ` - could not re-retrieve ${this.definition.type}s after deploy: ${ex.message}`
            );
        }
    }

    /**
     * makes sure attributeGroup and attributeSet are cached (raw API format) before deleting
     *
     * @returns {Promise.<void>} -
     */
    static async preDeleteTasks() {
        // AttributeGroup imports AttributeSet; a dynamic import avoids the circular static import
        const { default: AttributeGroup } = await import('./AttributeGroup.js');
        AttributeGroup.buObject = this.buObject;
        AttributeGroup.client = this.client;
        AttributeGroup.properties = this.properties;
        await AttributeGroup.cacheForDelete();
    }

    /**
     * keys of all cached sets that belong to the given attributeGroup (incl. sets linked in via another set)
     *
     * @param {string} groupId definitionID of the attributeGroup
     * @returns {string[]} attributeSet keys
     */
    static _getSetKeysOfGroup(groupId) {
        return Object.values(cache.getCache()?.[this.definition.type] || {})
            .filter((set) => isSameId(this._getOwningGroupId(set.definitionID), groupId))
            .map((set) => set[this.definition.keyField]);
    }

    /**
     * keys of all cached sets that are linked in only through the given set (recursively).
     * The API deletes a set together with its last incoming relationship, hence these go with it.
     *
     * @param {string} setId definitionID of the set that is deleted
     * @returns {string[]} attributeSet keys
     */
    static _getSetKeysLinkedOnlyThrough(setId) {
        const sets = Object.values(cache.getCache()?.[this.definition.type] || {});
        /** @type {Map.<string, Set.<string>>} set id => ids of everything that links it in */
        const incoming = new Map();
        for (const set of sets) {
            for (const rel of Array.isArray(set.relationships) ? set.relationships : []) {
                const right = rel.rightItem?.identifier;
                const left = rel.leftItem?.identifier;
                if (!right || !left || isSameId(right, left)) {
                    continue;
                }
                const rightId = String(right).toLowerCase();
                if (!incoming.has(rightId)) {
                    incoming.set(rightId, new Set());
                }
                incoming.get(rightId).add(String(left).toLowerCase());
            }
        }
        const removed = new Set([String(setId).toLowerCase()]);
        const keys = [];
        let found = true;
        while (found) {
            found = false;
            for (const set of sets) {
                const id = String(set.definitionID).toLowerCase();
                const lefts = incoming.get(id);
                if (!(!removed.has(id) && lefts?.size && [...lefts].every((l) => removed.has(l)))) {
                    continue;
                }

                removed.add(id);
                keys.push(set[this.definition.keyField]);
                found = true;
            }
        }
        return keys;
    }

    /**
     * removes deleted sets from the cache and their retrieved files from disk
     *
     * @param {string[]} keys attributeSet keys
     * @param {boolean} [isCascade] true if the server deleted these sets together with their parent set or attributeGroup
     * @returns {Promise.<void>} -
     */
    static async removeDeletedSets(keys, isCascade) {
        for (const key of keys) {
            delete cache.getCache()?.[this.definition.type]?.[key];
            if (isCascade) {
                this.cascadeDeletedKeys.add(key);
            }
            await this.postDeleteTasks(key);
        }
    }

    /**
     * Delete an attributeSet. Sets that are linked in only through this set are deleted by the server as well.
     *
     * @param {string} key Identifier of the attributeSet
     * @returns {Promise.<boolean>} deletion success flag
     */
    static async deleteByKey(key) {
        const set = cache.getByKey(this.definition.type, key);
        if (!set && this.cascadeDeletedKeys.has(key)) {
            Util.logger.info(
                ` - ${this.definition.type} ${key} was already deleted together with its parent`
            );
            return true;
        }
        if (!set) {
            await this.deleteNotFound(key);
            return false;
        }
        if (set.isSystemDefined) {
            Util.logger.error(
                ` ☇ skipping deletion of ${this.definition.type} ${key}: system-defined attributeSets cannot be deleted`
            );
            return false;
        }
        const groupId = this._getOwningGroupId(set.definitionID);
        if (!groupId) {
            Util.logger.error(
                ` ☇ skipping deletion of ${this.definition.type} ${key}: could not find the attributeGroup it belongs to`
            );
            return false;
        }
        const cascaded = this._getSetKeysLinkedOnlyThrough(set.definitionID);
        if (cascaded.length) {
            Util.logger.warn(
                ` - deleting ${this.definition.type} ${key} also deletes the following attributeSets that are only linked in through it: ${cascaded.join(', ')}`
            );
        }
        const isDeleted = await super.deleteByKeyREST(
            '/hub/v1/contacts/schema/setDefinitions/' +
                set.definitionID +
                '?attributeGroupID=' +
                groupId,
            key
        );
        if (isDeleted) {
            await this.removeDeletedSets([key]);
            await this.removeDeletedSets(cascaded, true);
            Util.logger.warn(
                ` - the retrieved attributeGroup that held ${this.definition.type} ${key} is now outdated; re-retrieve attributeGroup`
            );
        }
        return isDeleted;
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
