export default AttributeGroup;
export type MetadataTypeItem = import("../../types/mcdev.d.js").MetadataTypeItem;
export type MetadataTypeMapObj = import("../../types/mcdev.d.js").MetadataTypeMapObj;
/**
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItem} MetadataTypeItem
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMapObj} MetadataTypeMapObj
 */
/**
 * AttributeGroup MetadataType
 *
 * @augments MetadataType
 */
declare class AttributeGroup extends MetadataType {
    /**
     * Retrieves Metadata of schema attribute groups.
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static retrieve(retrieveDir: string, _?: void | string[], __?: void | string[], key?: string): Promise<MetadataTypeMapObj>;
    /**
     * Retrieves Metadata of schema attribute groups for caching.
     *
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static retrieveForCache(): Promise<MetadataTypeMapObj>;
    /**
     * manages post retrieve steps
     *
     * @param {MetadataTypeItem} metadata a single metadata
     * @returns {MetadataTypeItem} metadata
     */
    static postRetrieveTasks(metadata: MetadataTypeItem): MetadataTypeItem;
}
declare namespace AttributeGroup {
    let definition: {
        bodyIteratorField: string;
        dependencies: string[];
        hasExtended: boolean;
        idField: string;
        keyIsFixed: boolean;
        keyField: string;
        nameField: string;
        restPagination: boolean;
        type: string;
        typeDescription: string;
        typeRetrieveByDefault: boolean;
        typeName: string;
        fields: {
            applicationID: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            applicationKey: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            attributeCount: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            attributeGroupIconKey: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            attributeGroupType: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            attributeSetIdentifiers: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'attributeSetIdentifiers[].connectingID.identifierType': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: boolean;
            };
            'attributeSetIdentifiers[].definitionID': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: boolean;
            };
            'attributeSetIdentifiers[].definitionKey': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: boolean;
            };
            'attributeSetIdentifiers[].definitionName.value': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: boolean;
            };
            'attributeSetIdentifiers[].namespace': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: boolean;
            };
            canAddProperties: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            canAddRelationships: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            canChangeProperties: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            canModify: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            canRemove: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            connectingID: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'connectingID.identifierType': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            containsSchemaAttributes: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            definitionID: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            definitionKey: {
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
            description: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            displayOrder: {
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
            isHidden: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            isOwner: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            isPrimary: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            isSystemDefined: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            localizedDescription: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'localizedDescription.resourceSetKey': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: boolean;
            };
            'localizedDescription.resourceValueKey': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: boolean;
            };
            'localizedDescription.value': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: boolean;
            };
            mID: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            namespace: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            objectState: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            requiredRelationships: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            r__attributeSet_key: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
        };
    };
}
import MetadataType from './MetadataType.js';
//# sourceMappingURL=AttributeGroup.d.ts.map