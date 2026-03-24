export default AttributeSet;
export type MetadataTypeItem = import("../../types/mcdev.d.js").MetadataTypeItem;
export type MetadataTypeMap = import("../../types/mcdev.d.js").MetadataTypeMap;
export type MetadataTypeMapObj = import("../../types/mcdev.d.js").MetadataTypeMapObj;
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
    static retrieve(retrieveDir: string, _?: void | string[] | undefined, __?: void | string[] | undefined, key?: string): Promise<MetadataTypeMapObj>;
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
        dependencyGraph: {
            dataExtension: string[];
            attributeSet: string[];
            attributeGroup: string[];
        };
        hasExtended: boolean;
        idField: string;
        keyIsFixed: boolean;
        keyField: string;
        nameField: string;
        folderIdField: string;
        createdDateField: string;
        createdNameField: string;
        lastmodDateField: null;
        lastmodNameField: null;
        restPagination: boolean;
        type: string;
        typeDescription: string;
        typeRetrieveByDefault: boolean;
        typeCdpByDefault: boolean;
        typeName: string;
        fields: {
            applicationID: {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            applicationKey: {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            attributeCount: {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            canAddValues: {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            canChangeValues: {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            canModify: {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            canRemove: {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            categoryID: {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'connectingID.identifierType': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            createDate: {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            createdBy: {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            customObjectOwnerMID: {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'dataRetentionProperties.isDeleteAtEndOfRetentionPeriod': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'dataRetentionProperties.isResetRetentionPeriodOnImport': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'dataRetentionProperties.isRowBasedRetention': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'dataRetentionProperties.periodUnitOfMeasure': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'dataRetentionProperties.setDefinitionID': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'dataRetentionProperties.periodLength': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            definitionID: {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            definitionKey: {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
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
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            isEvent: {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            isHidden: {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            isReadOnly: {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            isRoot: {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            isSendable: {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            isShared: {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            isSystemDefined: {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            isTestaable: {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'leftConnectingID.identifierType': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'leftItem.cardinality': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'leftItem.cardinality ': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'leftItem.connectingID.identifierType': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'leftItem.identifier': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'leftItem.relationshipType': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
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
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            nonStandardAttributeGroupReferences: {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'nonStandardAttributeGroupReferences[].attributeGroupType': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'nonStandardAttributeGroupReferences[].attributeGroupID': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'nonStandardAttributeGroupReferences[].definitionKey': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'obfuscationProperties.maskType': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'obfuscationProperties.maskTypeID': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'obfuscationProperties.storageType': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'obfuscationProperties.storageTypeID': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'obfuscationProperties.valueDefinitionID': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'parentDefinition.connectingID.identifierType': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'parentDefinition.definitionID': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'parentDefinition.definitionKey': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'parentDefinition.definitionName.value': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            parentID: {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            relationshipCount: {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            relationships: {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'relationships[].canModify': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'relationships[].canRemove': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'relationships[].isGroupToSetRelationship': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'relationships[].isHidden': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'relationships[].isSystemDefined': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'relationships[].leftRelationshipID': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'relationships[].leftRelationshipIDs': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'relationships[].leftItem.cardinality': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'relationships[].leftItem.relationshipType': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'relationships[].leftItem.r__attributeSet_key': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'relationships[].leftItem.r__attributeGroup_key': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'relationships[].rightItem.cardinality': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'relationships[].rightItem.relationshipType': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'relationships[].rightItem.r__attributeSet_key': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'relationships[].rightItem.r__attributeGroup_key': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'relationships[].leftRelationshipIDs[].type': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'relationships[].leftRelationshipIDs[].value': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'relationships[].leftRelationshipReferenceType': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'relationships[].relationshipAttributes': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'relationships[].relationshipAttributes[].leftAttributeID': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'relationships[].relationshipAttributes[].rightAttributeID': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'relationships[].relationshipAttributes[].c__leftFullyQualifiedName': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'relationships[].relationshipAttributes[].c__rightFullyQualifiedName': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'relationships[].relationshipID': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'rightConnectingID.identifierType': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'rightItem.cardinality': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'rightItem.connectingID.identifierType': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'rightItem.identifier': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'rightItem.relationshipType': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            sendAttributeStorageName: {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            sendContactKeyStorageName: {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            setDefinitionID: {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            setDefinitionKey: {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'setDefinitionName.value': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'storageFieldReferenceID.type': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'storageFieldReferenceID.value': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            storageLogicalType: {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            storageName: {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'storageObjectFieldInformation.externalIsRowIdentifier': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'storageObjectFieldInformation.externalObjectFieldAPIName': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'storageObjectFieldInformation.externalObjectFieldDataTypeName': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'storageObjectFieldInformation.externalObjectFieldLength': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            storageObjectIDs: {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'storageObjectInformation.externalObjectAPIName': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'storageReferenceID.type': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'storageReferenceID.value': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            valueDefinitions: {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].baseType': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].customerDataID': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].connectingID': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].dataSourceID': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].dataSourceName': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].dataType': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].defaultValue': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].definitionID': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].definitionKey': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].definitionName': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].description': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].displayOrder': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].fullyQualifiedName': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].identifierType': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].isHidden': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].isIdentityValue': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].isNullable': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].isPrimaryKey': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].isReadOnly': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].isSystemDefined': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].isUpdateable': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].length': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].localizedDescription': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].name': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].obfuscationProperties': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].obfuscationProperties.maskType': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].obfuscationProperties.maskTypeID': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].obfuscationProperties.storageType': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].obfuscationProperties.storageTypeID': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].obfuscationProperties.valueDefinitionID': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].ordinal': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].parentDefinition': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].parentIdentifier': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].parentType': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].restrictionLookupListID': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].scale': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].setDefinitionID': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].setDefinitionKey': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].setDefinitionName': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].storageFieldReferenceID': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].storageFieldReferenceID.type': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].storageFieldReferenceID.value': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].storageFieldValueID.type': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].storageFieldValueID.value': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].storageName': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
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
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            'valueDefinitions[].valueDefinitionKey': {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            r__folder_Path: {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
            r__dataExtension_key: {
                isCreateable: null;
                isUpdateable: null;
                retrieving: boolean;
                template: null;
            };
        };
    };
}
import MetadataType from './MetadataType.js';
//# sourceMappingURL=AttributeSet.d.ts.map