export default DataExtensionField;
export type BuObject = import("../../types/mcdev.d.js").BuObject;
export type CodeExtract = import("../../types/mcdev.d.js").CodeExtract;
export type CodeExtractItem = import("../../types/mcdev.d.js").CodeExtractItem;
export type MetadataTypeItem = import("../../types/mcdev.d.js").MetadataTypeItem;
export type MetadataTypeItemDiff = import("../../types/mcdev.d.js").MetadataTypeItemDiff;
export type MetadataTypeItemObj = import("../../types/mcdev.d.js").MetadataTypeItemObj;
export type MetadataTypeMap = import("../../types/mcdev.d.js").MetadataTypeMap;
export type MetadataTypeMapObj = import("../../types/mcdev.d.js").MetadataTypeMapObj;
export type SoapRequestParams = import("../../types/mcdev.d.js").SoapRequestParams;
export type TemplateMap = import("../../types/mcdev.d.js").TemplateMap;
export type DataExtensionFieldMap = import("../../types/mcdev.d.js").DataExtensionFieldMap;
export type DataExtensionFieldItem = import("../../types/mcdev.d.js").DataExtensionFieldItem;
/**
 * @typedef {import('../../types/mcdev.d.js').BuObject} BuObject
 * @typedef {import('../../types/mcdev.d.js').CodeExtract} CodeExtract
 * @typedef {import('../../types/mcdev.d.js').CodeExtractItem} CodeExtractItem
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItem} MetadataTypeItem
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItemDiff} MetadataTypeItemDiff
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItemObj} MetadataTypeItemObj
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMap} MetadataTypeMap
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMapObj} MetadataTypeMapObj
 * @typedef {import('../../types/mcdev.d.js').SoapRequestParams} SoapRequestParams
 * @typedef {import('../../types/mcdev.d.js').TemplateMap} TemplateMap
 */
/**
 * @typedef {import('../../types/mcdev.d.js').DataExtensionFieldMap} DataExtensionFieldMap
 * @typedef {import('../../types/mcdev.d.js').DataExtensionFieldItem} DataExtensionFieldItem
 */
/**
 * DataExtensionField MetadataType
 *
 * @augments MetadataType
 */
declare class DataExtensionField extends MetadataType {
    static fixShared_fields: any;
    /**
     * Retrieves all records and saves it to disk
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @returns {Promise.<{metadata: DataExtensionFieldMap, type: string}>} Promise of items
     */
    static retrieve(retrieveDir: string, additionalFields?: string[]): Promise<{
        metadata: DataExtensionFieldMap;
        type: string;
    }>;
    /**
     * Retrieves all records and saves it to disk
     *
     * @returns {Promise.<MetadataTypeMapObj>} Promise of items
     */
    static retrieveForCache(): Promise<MetadataTypeMapObj>;
    /**
     * Retrieves all records for caching
     *
     * @param {SoapRequestParams} [requestParams] required for the specific request (filter for example)
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @returns {Promise.<{metadata: DataExtensionFieldMap, type: string}>} Promise of items
     */
    static retrieveForCacheDE(requestParams?: SoapRequestParams, additionalFields?: string[]): Promise<{
        metadata: DataExtensionFieldMap;
        type: string;
    }>;
    /**
     * helper for DataExtension.retrieveFieldsForSingleDe that sorts the fields into an array
     *
     * @param {DataExtensionFieldMap} fieldsObj customerKey-based list of fields for one dataExtension
     * @returns {DataExtensionFieldItem[]} sorted array of field objects
     */
    static convertToSortedArray(fieldsObj: DataExtensionFieldMap): DataExtensionFieldItem[];
    /**
     * sorting method to ensure `Ordinal` is respected
     *
     * @param {DataExtensionFieldItem} a -
     * @param {DataExtensionFieldItem} b -
     * @returns {number} sorting based on Ordinal
     */
    static sortDeFields(a: DataExtensionFieldItem, b: DataExtensionFieldItem): number;
    /**
     * manages post retrieve steps; only used by DataExtension class
     *
     * @param {DataExtensionFieldItem} metadata a single item
     * @returns {DataExtensionFieldItem} metadata
     */
    static postRetrieveTasksDE(metadata: DataExtensionFieldItem): DataExtensionFieldItem;
    /**
     * Mofifies passed deployColumns for update by mapping ObjectID to their target column's values.
     * Removes FieldType field if its the same in deploy and target column, because it results in an error even if its of the same type
     *
     * @param {DataExtensionFieldItem[]} deployColumns Columns of data extension that will be deployed
     * @param {string} deKey external/customer key of Data Extension
     * @returns {Promise.<DataExtensionFieldMap>} existing fields by their original name to allow re-adding FieldType after update
     */
    static prepareDeployColumnsOnUpdate(deployColumns: DataExtensionFieldItem[], deKey: string): Promise<DataExtensionFieldMap>;
    /**
     * Delete a data extension from the specified business unit
     *
     * @param {string} customerKey Identifier of metadata
     * @param {string} [fieldId] for programmatic deletes only one can pass in the ID directly
     * @returns {Promise.<boolean>} deletion success flag
     */
    static deleteByKeySOAP(customerKey: string, fieldId?: string): Promise<boolean>;
    /**
     * clean up after deleting a metadata item
     *
     * @param {string} customerKey Identifier of metadata item
     * @returns {Promise.<void>} -
     */
    static postDeleteTasks(customerKey: string): Promise<void>;
}
declare namespace DataExtensionField {
    let definition: {
        bodyIteratorField: string;
        dependencies: string[];
        dependencyGraph: any;
        filter: {};
        hasExtended: boolean;
        idField: string;
        keyIsFixed: boolean;
        keyField: string;
        nameField: string;
        restPagination: boolean;
        type: string;
        typeDescription: string;
        typeRetrieveByDefault: boolean;
        typeCdpByDefault: boolean;
        typeName: string;
        fields: {
            'Client.ID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            CreatedDate: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            CustomerKey: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'DataExtension.CustomerKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'DataExtension.PartnerKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'DataExtension.ObjectID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            DefaultValue: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            FieldType: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            IsPrimaryKey: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            IsRequired: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            MaxLength: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            ModifiedDate: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            Name: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            ObjectID: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            Ordinal: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            PartnerKey: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            Scale: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
        };
    };
}
import MetadataType from './MetadataType.js';
//# sourceMappingURL=DataExtensionField.d.ts.map