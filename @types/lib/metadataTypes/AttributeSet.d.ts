export default AttributeSet;
export type MetadataTypeItem = import("../../types/mcdev.d.js").MetadataTypeItem;
export type MetadataTypeMap = import("../../types/mcdev.d.js").MetadataTypeMap;
export type MetadataTypeMapObj = import("../../types/mcdev.d.js").MetadataTypeMapObj;
/**
 * AttributeSet MetadataType
 *
 * @augments MetadataType
 */
declare class AttributeSet extends MetadataType {
    static systemValueDefinitions: any;
    /**
     * data resolved in preDeployTasks that create() needs but which must not be sent to the API
     *
     * @type {Map.<string, {attributeGroupID: string}>}
     */
    static deployContext: Map<string, {
        attributeGroupID: string;
    }>;
    /**
     * owning attributeGroup id of every set created during the current deploy, keyed by the set's definitionID
     *
     * @type {Map.<string, string>}
     */
    static createdSetGroups: Map<string, string>;
    /**
     * keys of sets the server deleted together with their parent set or attributeGroup during the current delete run;
     * reset whenever the attributeSet cache is reloaded for a delete (see AttributeGroup.cacheForDelete)
     *
     * @type {Set.<string>}
     */
    static cascadeDeletedKeys: Set<string>;
    /**
     * Retrieves Metadata of schema set Definitions.
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise
     */
    static retrieve(retrieveDir: string, _?: void | string[], __?: void | string[], key?: string): Promise<MetadataTypeMapObj>;
    /**
     * Retrieves Metadata of schema set definitions for caching.
     *
     * @returns {Promise.<MetadataTypeMapObj>} Promise
     */
    static retrieveForCache(): Promise<MetadataTypeMapObj>;
    /**
     * used to identify updated shared data extensions that are used in attributeSets.
     * helper for DataExtension.#fixShared_onBU
     *
     * @param {Object.<string, string>} sharedDataExtensionMap ID-Key relationship of shared data extensions
     * @param {object} fixShared_fields DataExtensionField.fixShared_fields
     * @returns {Promise.<string[]>} Promise of list of shared dataExtension IDs
     */
    static fixShared_retrieve(sharedDataExtensionMap: {
        [x: string]: string;
    }, fixShared_fields: object): Promise<string[]>;
    /**
     * manages post retrieve steps
     *
     * @param {MetadataTypeItem} metadata a single metadata
     * @returns {MetadataTypeItem} metadata
     */
    static postRetrieveTasks(metadata: MetadataTypeItem): MetadataTypeItem;
    /**
     * helper for {@link AttributeSet.postRetrieveTasks}
     * Returns the relationships that link the given set in (set is rightItem), incl. self-relationships.
     * The API returns set-to-set relationships only on the left (pre-existing) set, so these are taken from the other sets in the cache,
     * while relationships pointing from this set to another set are left out (they are stored in the other set's file).
     *
     * @param {MetadataTypeItem} metadata a single attributeSet (raw API format)
     * @returns {object[] | undefined} copy of the incoming relationships; undefined if the set had none and none were found
     */
    static _getIncomingRelationships(metadata: MetadataTypeItem): object[] | undefined;
    /**
     * sets linked to other sets of the same deploy need to be created after those; hence upsert runs sequentially on a sorted map
     *
     * @param {MetadataTypeMap} metadataMap metadata mapped by their keyField
     * @param {string} deployDir directory where deploy metadata are saved
     * @returns {Promise.<MetadataTypeMap>} keyField => metadata map
     */
    static upsert(metadataMap: MetadataTypeMap, deployDir: string): Promise<MetadataTypeMap>;
    /**
     * helper for {@link AttributeSet.upsert}: puts sets whose incoming relationship starts at another set of this deploy after that set.
     * Sets that are part of (or depend on) a cycle are reported and left out.
     *
     * @param {MetadataTypeMap} metadataMap metadata mapped by their keyField
     * @returns {MetadataTypeMap} sorted copy of the map
     */
    static _sortForDeploy(metadataMap: MetadataTypeMap): MetadataTypeMap;
    /**
     * prepares a set for deployment: resolves all references and builds the create payload.
     * Every unsupported situation throws, which makes upsert skip the item.
     *
     * @param {MetadataTypeItem} metadata a single item
     * @returns {Promise.<MetadataTypeItem>} Promise of the create payload
     */
    static preDeployTasks(metadata: MetadataTypeItem): Promise<MetadataTypeItem>;
    /**
     * helper for {@link AttributeSet.preDeployTasks}
     *
     * @param {object} leftItem leftItem of the relationship in retrieve format
     * @returns {{identifier: string, relationshipType: 'AttributeGroup'|'AttributeSet', groupId: string, set?: MetadataTypeItem}} resolved left side
     */
    static _resolveLeftItem(leftItem: object): {
        identifier: string;
        relationshipType: "AttributeGroup" | "AttributeSet";
        groupId: string;
        set?: MetadataTypeItem;
    };
    /**
     * helper for {@link AttributeSet.preDeployTasks}
     *
     * @param {{relationshipType: string, set?: MetadataTypeItem}} left resolved left side
     * @param {string} fieldKey c__leftField
     * @returns {string} valueDefinitionID of the left attribute
     */
    static _getLeftAttributeID(left: {
        relationshipType: string;
        set?: MetadataTypeItem;
    }, fieldKey: string): string;
    /**
     * helper for {@link AttributeSet.preDeployTasks}: SOAP cannot return fields of parent-owned DEs from a child BU, REST can
     *
     * @param {string} deObjectID ObjectID of the data extension
     * @returns {Promise.<Object.<string, string>>} field name => field id
     */
    static _getDataExtensionFieldIds(deObjectID: string): Promise<{
        [x: string]: string;
    }>;
    /**
     * finds the raw relationship that links the given set in (set is rightItem; self-relationships are ignored).
     * A set-to-set relationship is only stored on the left set, hence all cached sets are searched.
     *
     * @param {string} setId definitionID of the set
     * @returns {{relationship: object, storedOn: string} | undefined} relationship and the definitionID of the set that holds it
     */
    static _findIncomingRelationship(setId: string): {
        relationship: object;
        storedOn: string;
    } | undefined;
    /**
     * returns the id of the attributeGroup a set belongs to; needed as attributeGroupID query parameter
     *
     * @param {string} setId definitionID of the set
     * @param {Set.<string>} [visited] used internally to stop on circular relationships
     * @returns {string | undefined} definitionID of the attributeGroup
     */
    static _getOwningGroupId(setId: string, visited?: Set<string>): string | undefined;
    /**
     * Creates a single attributeSet
     *
     * @param {MetadataTypeItem} metadata single metadata entry
     * @returns {Promise.<object> | null} Promise of API response or null in case of an error
     */
    static create(metadata: MetadataTypeItem): Promise<object> | null;
    /**
     * helper for {@link MetadataType.createREST}: unwraps the created item so that upsert can parse it like a retrieved item.
     * The server generates definitionID and valueDefinitions; these are copied onto the deployed entry so that upsert caches them
     * and sets linked to this one later in the same deploy can be resolved.
     *
     * @param {MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {object} apiResponse varies depending on the API call
     * @returns {Promise.<object>} apiResponse, potentially modified
     */
    static postCreateTasks(metadataEntry: MetadataTypeItem, apiResponse: object): Promise<object>;
    /**
     * helper for {@link AttributeSet.hasChanged} and {@link AttributeSet.update}
     *
     * @param {MetadataTypeItem} cachedVersion cached version from the server (raw API format)
     * @param {MetadataTypeItem} metadata payload created by preDeployTasks
     * @returns {{name: boolean, cardinality: {relationship: object, storedOn: string} | null, unsupported: string[]}} differences
     */
    static _getDifferences(cachedVersion: MetadataTypeItem, metadata: MetadataTypeItem): {
        name: boolean;
        cardinality: {
            relationship: object;
            storedOn: string;
        } | null;
        unsupported: string[];
    };
    /**
     * test if metadata was actually changed or not to potentially skip it during deployment.
     * only compares what the payload contains, as the cache holds raw API data
     *
     * @param {MetadataTypeItem} cachedVersion cached version from the server
     * @param {MetadataTypeItem} metadata item to upload
     * @returns {boolean} true if metadata was changed
     */
    static hasChanged(cachedVersion: MetadataTypeItem, metadata: MetadataTypeItem): boolean;
    /**
     * Updates the few things the API allows to change: the name and the cardinality of the incoming relationship.
     * Everything else is reported as warning. Relationships are never deleted here because deleting the last one deletes the set.
     *
     * @param {MetadataTypeItem} metadata payload created by preDeployTasks
     * @param {MetadataTypeItem} metadataBefore cached version from the server (raw API format)
     * @returns {Promise.<object | null>} updated item in raw API format or null if nothing was updated
     */
    static update(metadata: MetadataTypeItem, metadataBefore: MetadataTypeItem): Promise<object | null>;
    /**
     * helper for {@link AttributeSet.update}
     *
     * @param {object} ex error
     * @param {string} key key of the set
     * @param {string} what what was updated
     * @returns {void}
     */
    static _logUpdateError(ex: object, key: string, what: string): void;
    /**
     * makes sure attributeGroup and attributeSet are cached (raw API format) before deleting
     *
     * @returns {Promise.<void>} -
     */
    static preDeleteTasks(): Promise<void>;
    /**
     * keys of all cached sets that belong to the given attributeGroup (incl. sets linked in via another set)
     *
     * @param {string} groupId definitionID of the attributeGroup
     * @returns {string[]} attributeSet keys
     */
    static _getSetKeysOfGroup(groupId: string): string[];
    /**
     * keys of all cached sets that are linked in only through the given set (recursively).
     * The API deletes a set together with its last incoming relationship, hence these go with it.
     *
     * @param {string} setId definitionID of the set that is deleted
     * @returns {string[]} attributeSet keys
     */
    static _getSetKeysLinkedOnlyThrough(setId: string): string[];
    /**
     * removes deleted sets from the cache and their retrieved files from disk
     *
     * @param {string[]} keys attributeSet keys
     * @param {boolean} [isCascade] true if the server deleted these sets together with their parent set or attributeGroup
     * @returns {Promise.<void>} -
     */
    static removeDeletedSets(keys: string[], isCascade?: boolean): Promise<void>;
    /**
     * helper for {@link AttributeSet.postRetrieveTasks}
     *
     * @returns {object[]} all system value definitions
     */
    static _getSystemValueDefinitions(): object[];
}
declare namespace AttributeSet {
    let definition: {
        bodyIteratorField: string;
        dependencies: string[];
        dependencyGraph: {
            dataExtension: string[];
            attributeSet: string[];
            attributeGroup: string[];
        };
        deleteSynchronously: boolean;
        hasExtended: boolean;
        idField: string;
        keyIsFixed: boolean;
        keyField: string;
        nameField: string;
        folderIdField: string;
        createdDateField: string;
        createdNameField: string;
        lastmodDateField: any;
        lastmodNameField: any;
        restPagination: boolean;
        type: string;
        typeDescription: string;
        typeRetrieveByDefault: boolean;
        typeCdpByDefault: boolean;
        typeName: string;
        fields: {
            applicationID: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            applicationKey: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            attributeCount: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            canAddValues: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            canChangeValues: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            canModify: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            canRemove: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            categoryID: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'connectingID.identifierType': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            createDate: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            createdBy: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            customObjectOwnerMID: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            dataRetentionProperties: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'dataRetentionProperties.isDeleteAtEndOfRetentionPeriod': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'dataRetentionProperties.isResetRetentionPeriodOnImport': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'dataRetentionProperties.isRowBasedRetention': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'dataRetentionProperties.periodUnitOfMeasure': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'dataRetentionProperties.setDefinitionID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'dataRetentionProperties.periodLength': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            definitionID: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            definitionKey: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            definitionName: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'definitionName.value': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            fullyQualifiedName: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            isCustomObjectBacked: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            isEvent: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            isHidden: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            isReadOnly: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            isRoot: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            isSendable: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            isShared: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            isSystemDefined: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            isTestaable: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'leftConnectingID.identifierType': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'leftItem.cardinality': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'leftItem.cardinality ': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'leftItem.connectingID.identifierType': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'leftItem.identifier': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'leftItem.relationshipType': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            localizedDescription: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'localizedDescription.resourceSetKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'localizedDescription.resourceValueKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'localizedDescription.value': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            name: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            nonStandardAttributeGroupReferences: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'nonStandardAttributeGroupReferences[].attributeGroupType': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'nonStandardAttributeGroupReferences[].attributeGroupID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'nonStandardAttributeGroupReferences[].definitionKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'obfuscationProperties.maskType': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'obfuscationProperties.maskTypeID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'obfuscationProperties.storageType': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'obfuscationProperties.storageTypeID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'obfuscationProperties.valueDefinitionID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'parentDefinition.connectingID.identifierType': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'parentDefinition.definitionID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'parentDefinition.definitionKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'parentDefinition.definitionName.value': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            parentID: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            relationshipCount: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            relationships: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'relationships[].canModify': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'relationships[].canRemove': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'relationships[].isGroupToSetRelationship': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'relationships[].isHidden': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'relationships[].isSystemDefined': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'relationships[].leftRelationshipID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'relationships[].leftRelationshipIDs': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'relationships[].leftItem': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'relationships[].leftItem.identifier': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'relationships[].leftItem.cardinality': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'relationships[].leftItem.relationshipType': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'relationships[].leftItem.r__attributeSet_key': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'relationships[].leftItem.r__attributeGroup_key': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'relationships[].rightItem': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'relationships[].rightItem.cardinality': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'relationships[].rightItem.relationshipType': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'relationships[].rightItem.r__attributeSet_key': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'relationships[].rightItem.r__attributeGroup_key': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'relationships[].leftRelationshipIDs[].type': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'relationships[].leftRelationshipIDs[].value': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'relationships[].leftRelationshipReferenceType': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'relationships[].relationshipAttributes': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'relationships[].relationshipAttributes[].leftAttributeID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'relationships[].relationshipAttributes[].rightAttributeID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'relationships[].relationshipAttributes[].c__leftField': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'relationships[].relationshipAttributes[].c__rightField': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'relationships[].relationshipID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'rightConnectingID.identifierType': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'rightItem.cardinality': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'rightItem.connectingID.identifierType': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'rightItem.identifier': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'rightItem.relationshipType': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            sendAttributeStorageName: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            sendContactKeyStorageName: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            setDefinitionID: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            setDefinitionKey: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'setDefinitionName.value': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'storageFieldReferenceID.type': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'storageFieldReferenceID.value': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            storageLogicalType: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            storageName: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'storageObjectFieldInformation.externalIsRowIdentifier': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'storageObjectFieldInformation.externalObjectFieldAPIName': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'storageObjectFieldInformation.externalObjectFieldDataTypeName': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'storageObjectFieldInformation.externalObjectFieldLength': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            storageObjectIDs: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'storageObjectInformation.externalObjectAPIName': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            storageReferenceID: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'storageReferenceID.type': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'storageReferenceID.value': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            valueDefinitions: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].baseType': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].customerDataID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].connectingID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].dataSourceID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].dataSourceName': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].dataType': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].defaultValue': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].definitionID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].definitionKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].definitionName': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].description': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].displayOrder': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].fullyQualifiedName': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].identifierType': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].isHidden': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].isIdentityValue': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].isNullable': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].isPrimaryKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].isReadOnly': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].isSystemDefined': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].isUpdateable': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].length': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].localizedDescription': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].name': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].obfuscationProperties': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].obfuscationProperties.maskType': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].obfuscationProperties.maskTypeID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].obfuscationProperties.storageType': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].obfuscationProperties.storageTypeID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].obfuscationProperties.valueDefinitionID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].ordinal': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].parentDefinition': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].parentIdentifier': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].parentType': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].restrictionLookupListID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].scale': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].setDefinitionID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].setDefinitionKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].setDefinitionName': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].storageFieldReferenceID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].storageFieldReferenceID.type': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].storageFieldReferenceID.value': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].storageFieldValueID.type': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].storageFieldValueID.value': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].storageName': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].storageObjectFieldInformation': {
                skipValidation: boolean;
            };
            'valueDefinitions[].storageObjectFieldInformation.externalObjectFieldAPIName': {
                skipValidation: boolean;
            };
            'valueDefinitions[].storageObjectFieldInformation.externalObjectFieldDataTypeName': {
                skipValidation: boolean;
            };
            'valueDefinitions[].storageObjectFieldInformation.externalObjectFieldLength': {
                skipValidation: boolean;
            };
            'valueDefinitions[].storageObjectFieldInformation.externalIsRowIdentifier': {
                skipValidation: boolean;
            };
            'valueDefinitions[].valueDefinitionID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].valueDefinitionKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            r__folder_Path: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
            r__dataExtension_key: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: any;
            };
        };
    };
}
import MetadataType from './MetadataType.js';
//# sourceMappingURL=AttributeSet.d.ts.map