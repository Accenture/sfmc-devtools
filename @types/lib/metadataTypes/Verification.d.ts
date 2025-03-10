export default Verification;
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
export type RestError = import("../../types/mcdev.d.js").RestError;
export type VerificationItem = import("../../types/mcdev.d.js").VerificationItem;
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
 * @typedef {import('../../types/mcdev.d.js').RestError} RestError
 */
/**
 * @typedef {import('../../types/mcdev.d.js').VerificationItem} VerificationItem
 */
/**
 * Verification MetadataType
 *
 * @augments MetadataType
 */
declare class Verification extends MetadataType {
    static verificationIdKeyMap: any;
    /**
     * Retrieves Metadata of Data Verification Activity.
     *
     * @param {string} [retrieveDir] Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static retrieve(retrieveDir?: string, _?: void | string[], __?: void | string[], key?: string): Promise<MetadataTypeMapObj>;
    /**
     * helper for {@link this.retrieveRESTcollection}
     *
     * @param {RestError} ex exception
     * @param {string} id id or key of item
     * @returns {null} -
     */
    static handleRESTErrors(ex: RestError, id: string): null;
    /**
     * Retrieves Metadata of item for caching
     *
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static retrieveForCache(): Promise<MetadataTypeMapObj>;
    /**
     * Creates a single item
     *
     * @param {VerificationItem} metadata a single item
     * @returns {Promise} Promise
     */
    static create(metadata: VerificationItem): Promise<any>;
    /**
     * Updates a single item
     *
     * @param {VerificationItem} metadata a single item
     * @returns {Promise} Promise
     */
    static update(metadata: VerificationItem): Promise<any>;
    /**
     * prepares a verification for deployment
     *
     * @param {VerificationItem} metadata a single verification activity definition
     * @returns {Promise.<VerificationItem>} metadata object
     */
    static preDeployTasks(metadata: VerificationItem): Promise<VerificationItem>;
    /**
     * parses retrieved Metadata before saving
     *
     * @param {VerificationItem} metadata a single verification activity definition
     * @returns {VerificationItem} Array with one metadata object and one sql string
     */
    static postRetrieveTasks(metadata: VerificationItem): VerificationItem;
}
declare namespace Verification {
    let definition: {
        bodyIteratorField: string;
        dependencies: string[];
        dependencyGraph: {
            dataExtension: string[];
        };
        hasExtended: boolean;
        idField: string;
        keyIsFixed: boolean;
        keyField: string;
        createdDateField: any;
        createdNameField: string;
        lastmodDateField: any;
        lastmodNameField: any;
        nameField: string;
        restPagination: boolean;
        maxKeyLength: number;
        type: string;
        typeDescription: string;
        typeRetrieveByDefault: boolean;
        typeCdpByDefault: boolean;
        typeName: string;
        fields: {
            createdBy: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            dataVerificationDefinitionId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            notificationEmailAddress: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            notificationEmailMessage: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            shouldEmailOnFailure: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            shouldStopOnFailure: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            targetObjectId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            value1: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            value2: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            verificationType: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            r__dataExtension_key: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            c__automation_step: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
        };
    };
}
import MetadataType from './MetadataType.js';
//# sourceMappingURL=Verification.d.ts.map