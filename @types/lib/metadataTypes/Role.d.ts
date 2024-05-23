export default Role;
export type BuObject = import('../../types/mcdev.d.js').BuObject;
export type CodeExtract = import('../../types/mcdev.d.js').CodeExtract;
export type CodeExtractItem = import('../../types/mcdev.d.js').CodeExtractItem;
export type MetadataTypeItem = import('../../types/mcdev.d.js').MetadataTypeItem;
export type MetadataTypeItemDiff = import('../../types/mcdev.d.js').MetadataTypeItemDiff;
export type MetadataTypeItemObj = import('../../types/mcdev.d.js').MetadataTypeItemObj;
export type MetadataTypeMap = import('../../types/mcdev.d.js').MetadataTypeMap;
export type MetadataTypeMapObj = import('../../types/mcdev.d.js').MetadataTypeMapObj;
export type SoapRequestParams = import('../../types/mcdev.d.js').SoapRequestParams;
export type SoapSDKFilterSimple = import('../../types/mcdev.d.js').SoapSDKFilterSimple;
export type TemplateMap = import('../../types/mcdev.d.js').TemplateMap;
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
 * @typedef {import('../../types/mcdev.d.js').SoapSDKFilterSimple} SoapSDKFilterSimple
 * @typedef {import('../../types/mcdev.d.js').TemplateMap} TemplateMap
 */
/**
 * ImportFile MetadataType
 *
 * @augments MetadataType
 */
declare class Role extends MetadataType {
    /**
     * Gets metadata from Marketing Cloud
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] Returns specified fields even if their retrieve definition is not set to true
     * @param {void | string[]} [___] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Metadata store object
     */
    static retrieve(retrieveDir: string, _?: void | string[], ___?: void | string[], key?: string): Promise<MetadataTypeMapObj>;
    /**
     * Gets executed before deploying metadata
     *
     * @param {MetadataTypeItem} metadata a single metadata item
     * @returns {MetadataTypeItem} Promise of a single metadata item
     */
    static preDeployTasks(metadata: MetadataTypeItem): MetadataTypeItem;
    /**
     * Create a single Role.
     *
     * @param {MetadataTypeItem} metadata single metadata entry
     * @returns {Promise} Promise
     */
    static create(metadata: MetadataTypeItem): Promise<any>;
    /**
     * Updates a single Role.
     *
     * @param {MetadataTypeItem} metadata single metadata entry
     * @returns {Promise} Promise
     */
    static update(metadata: MetadataTypeItem): Promise<any>;
    /**
     * Creates markdown documentation of all roles
     *
     * @param {MetadataTypeMap} [metadata] role definitions
     * @returns {Promise.<void>} -
     */
    static document(metadata?: MetadataTypeMap): Promise<void>;
    /**
     * iterates through permissions to output proper row-names for nested permissionss
     *
     * @static
     * @param {string} role name of the user role
     * @param {object} element data of the permission
     * @param {string} [permission] name of the permission
     * @param {string} [isAllowed] "true" / "false" from the parent
     * @memberof Role
     * @returns {void}
     */
    static _traverseRoles(role: string, element: object, permission?: string, isAllowed?: string): void;
}
declare namespace Role {
    let allPermissions: {};
    let definition: {
        bodyIteratorField: string;
        dependencies: any[];
        deployBlacklist: string[];
        documentInOneFile: boolean;
        hasExtended: boolean;
        idField: string;
        keyIsFixed: boolean;
        keyField: string;
        nameField: string;
        createdDateField: string;
        createdNameField: any;
        lastmodDateField: string;
        lastmodNameField: any;
        maxKeyLength: number;
        type: string;
        typeDescription: string;
        typeRetrieveByDefault: boolean;
        typeName: string;
        fields: {
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
            Description: {
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
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
            };
            ObjectID: {
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
            IsSystemDefined: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            PermissionSets: {
                retrieving: boolean;
                skipCache: boolean;
                skipValidation: boolean;
            };
            c__notAssignable: {
                skipValidation: boolean;
            };
        };
    };
}
import MetadataType from './MetadataType.js';
//# sourceMappingURL=Role.d.ts.map