export default AttributeSet;
export type MetadataTypeItem = import('../../types/mcdev.d.js').MetadataTypeItem;
export type MetadataTypeMap = import('../../types/mcdev.d.js').MetadataTypeMap;
export type MetadataTypeMapObj = import('../../types/mcdev.d.js').MetadataTypeMapObj;
/**
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItem} MetadataTypeItem
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMap} MetadataTypeMap
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMapObj} MetadataTypeMapObj
 */
/**
 * AttributeSet MetadataType
 *
 * @augments MetadataType
 */
declare class AttributeSet extends MetadataType {
    static systemValueDefinitions: any;
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
     *
     * @returns {object[]} all system value definitions
     */
    static _getSystemValueDefinitions(): object[];
}
declare namespace AttributeSet {
    let definition: {
        bodyIteratorField: string;
        dependencies: string[];
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
        typeName: string;
        fields: {
            applicationID: {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            applicationKey: {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            attributeCount: {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            canAddValues: {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            canChangeValues: {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            }; /**
             * Retrieves Metadata of schema set definitions for caching.
             *
             * @returns {Promise.<MetadataTypeMapObj>} Promise
             */
            canModify: {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            canRemove: {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            categoryID: {
                isCreateable: any;
                isUpdateable: any;
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
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            createdBy: {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            customObjectOwnerMID: {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'dataRetentionProperties.isDeleteAtEndOfRetentionPeriod': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'dataRetentionProperties.isResetRetentionPeriodOnImport': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'dataRetentionProperties.isRowBasedRetention': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'dataRetentionProperties.periodUnitOfMeasure': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'dataRetentionProperties.setDefinitionID': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'dataRetentionProperties.periodLength': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            definitionID: {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            definitionKey: {
                isCreateable: any;
                isUpdateable: any;
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
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            isEvent: {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            isHidden: {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            isReadOnly: {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            isRoot: {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            isSendable: {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            isShared: {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            isSystemDefined: {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            isTestaable: {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'leftConnectingID.identifierType': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'leftItem.cardinality': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'leftItem.cardinality ': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'leftItem.connectingID.identifierType': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'leftItem.identifier': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'leftItem.relationshipType': {
                isCreateable: any;
                isUpdateable: any;
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
                isCreateable: boolean; /**
                 * Builds map of metadata entries mapped to their keyfields
                 *
                 * @param {object} body json of response body
                 * @param {string} [singleRetrieve] key of single item to filter by
                 * @returns {MetadataTypeMap} keyField => metadata map
                 */
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            name: {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            nonStandardAttributeGroupReferences: {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'nonStandardAttributeGroupReferences[].attributeGroupType': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'nonStandardAttributeGroupReferences[].attributeGroupID': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                /**
                 * manages post retrieve steps
                 *
                 * @param {MetadataTypeItem} metadata a single metadata
                 * @returns {MetadataTypeItem} metadata
                 */
                template: any;
            };
            'nonStandardAttributeGroupReferences[].definitionKey': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'obfuscationProperties.maskType': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'obfuscationProperties.maskTypeID': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'obfuscationProperties.storageType': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'obfuscationProperties.storageTypeID': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'obfuscationProperties.valueDefinitionID': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'parentDefinition.connectingID.identifierType': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'parentDefinition.definitionID': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'parentDefinition.definitionKey': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'parentDefinition.definitionName.value': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            parentID: {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            relationshipCount: {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            relationships: {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'relationships[].canModify': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'relationships[].canRemove': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'relationships[].isGroupToSetRelationship': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'relationships[].isHidden': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'relationships[].isSystemDefined': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'relationships[].leftRelationshipID': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'relationships[].leftRelationshipIDs': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'relationships[].leftRelationshipIDs[].type': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'relationships[].leftRelationshipIDs[].value': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'relationships[].leftRelationshipReferenceType': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'relationships[].relationshipAttributes': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'relationships[].relationshipAttributes[].leftAttributeID': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'relationships[].relationshipAttributes[].rightAttributeID': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'relationships[].relationshipAttributes[].c__leftFullyQualifiedName': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'relationships[].relationshipAttributes[].c__rightFullyQualifiedName': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'relationships[].relationshipID': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'rightConnectingID.identifierType': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'rightItem.cardinality': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'rightItem.connectingID.identifierType': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'rightItem.identifier': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'rightItem.relationshipType': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            sendAttributeStorageName: {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            sendContactKeyStorageName: {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            setDefinitionID: {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            setDefinitionKey: {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'setDefinitionName.value': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'storageFieldReferenceID.type': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'storageFieldReferenceID.value': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            storageLogicalType: {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            storageName: {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'storageObjectFieldInformation.externalIsRowIdentifier': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'storageObjectFieldInformation.externalObjectFieldAPIName': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'storageObjectFieldInformation.externalObjectFieldDataTypeName': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'storageObjectFieldInformation.externalObjectFieldLength': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            storageObjectIDs: {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'storageObjectInformation.externalObjectAPIName': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'storageReferenceID.type': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'storageReferenceID.value': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            valueDefinitions: {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].baseType': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].customerDataID': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].connectingID': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].dataSourceID': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].dataSourceName': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].dataType': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].defaultValue': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].definitionID': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].definitionKey': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].definitionName': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].description': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].displayOrder': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].fullyQualifiedName': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].identifierType': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].isHidden': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].isIdentityValue': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].isNullable': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].isPrimaryKey': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].isReadOnly': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].isSystemDefined': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].isUpdateable': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].length': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].localizedDescription': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].name': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].obfuscationProperties': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].obfuscationProperties.maskType': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].obfuscationProperties.maskTypeID': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].obfuscationProperties.storageType': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].obfuscationProperties.storageTypeID': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].obfuscationProperties.valueDefinitionID': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].ordinal': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].parentDefinition': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].parentIdentifier': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].parentType': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].restrictionLookupListID': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].scale': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].setDefinitionID': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].setDefinitionKey': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].setDefinitionName': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].storageFieldReferenceID': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].storageFieldReferenceID.type': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].storageFieldReferenceID.value': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].storageName': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].valueDefinitionID': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            'valueDefinitions[].valueDefinitionKey': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            r__folder_Path: {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            r__dataExtension_key: {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
        };
    };
}
import MetadataType from './MetadataType.js';
//# sourceMappingURL=AttributeSet.d.ts.map