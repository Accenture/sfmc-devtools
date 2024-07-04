export default User;
export type BuObject = import('../../types/mcdev.d.js').BuObject;
export type CodeExtract = import('../../types/mcdev.d.js').CodeExtract;
export type CodeExtractItem = import('../../types/mcdev.d.js').CodeExtractItem;
export type MetadataTypeItem = import('../../types/mcdev.d.js').MetadataTypeItem;
export type MetadataTypeItemDiff = import('../../types/mcdev.d.js').MetadataTypeItemDiff;
export type MetadataTypeItemObj = import('../../types/mcdev.d.js').MetadataTypeItemObj;
export type MetadataTypeMap = import('../../types/mcdev.d.js').MetadataTypeMap;
export type MetadataTypeMapObj = import('../../types/mcdev.d.js').MetadataTypeMapObj;
export type SoapRequestParams = import('../../types/mcdev.d.js').SoapRequestParams;
export type TemplateMap = import('../../types/mcdev.d.js').TemplateMap;
export type UserDocument = import('../../types/mcdev.d.js').UserDocument;
export type UserDocumentDocument = import('../../types/mcdev.d.js').UserDocumentDocument;
export type UserDocumentDiff = import('../../types/mcdev.d.js').UserDocumentDiff;
export type UserDocumentMap = import('../../types/mcdev.d.js').UserDocumentMap;
export type AccountUserConfiguration = import('../../types/mcdev.d.js').AccountUserConfiguration;
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
 * @typedef {import('../../types/mcdev.d.js').UserDocument} UserDocument
 * @typedef {import('../../types/mcdev.d.js').UserDocumentDocument} UserDocumentDocument
 * @typedef {import('../../types/mcdev.d.js').UserDocumentDiff} UserDocumentDiff
 * @typedef {import('../../types/mcdev.d.js').UserDocumentMap} UserDocumentMap
 * @typedef {import('../../types/mcdev.d.js').AccountUserConfiguration} AccountUserConfiguration
 */
/**
 * MetadataType
 *
 * @augments MetadataType
 */
declare class User extends MetadataType {
    static userBUassignments: any;
    /**
     * Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void | string[]} _ unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static retrieve(retrieveDir: string, _: void | string[], __?: void | string[], key?: string): Promise<MetadataTypeMapObj>;
    /**
     * Retrieves import definition metadata for caching
     *
     * @returns {Promise.<MetadataTypeMapObj>} Promise
     */
    static retrieveForCache(): Promise<MetadataTypeMapObj>;
    /**
     * Create a single item.
     *
     * @param {MetadataTypeItem} metadata single metadata entry
     * @returns {Promise} Promise
     */
    static create(metadata: MetadataTypeItem): Promise<any>;
    /**
     * Updates a single item.
     *
     * @param {MetadataTypeItem} metadata single metadata entry
     * @returns {Promise} Promise
     */
    static update(metadata: MetadataTypeItem): Promise<any>;
    /**
     * prepares a item for deployment
     *
     * @param {UserDocument} metadata of a single item
     * @returns {Promise.<UserDocument>} metadata object
     */
    static preDeployTasks(metadata: UserDocument): Promise<UserDocument>;
    /**
     * helper for {@link MetadataType.upsert}
     *
     * @param {MetadataTypeMap} metadata list of metadata
     * @param {string} metadataKey key of item we are looking at
     * @param {boolean} hasError error flag from previous code
     * @param {UserDocumentDiff[]} metadataToUpdate list of items to update
     * @param {UserDocument[]} metadataToCreate list of items to create
     * @returns {Promise.<'create'|'update'|'skip'>} action to take
     */
    static createOrUpdate(metadata: MetadataTypeMap, metadataKey: string, hasError: boolean, metadataToUpdate: UserDocumentDiff[], metadataToCreate: UserDocument[]): Promise<'create' | 'update' | 'skip'>;
    /**
     *
     * @private
     * @param {MetadataTypeItem} metadata single metadata itme
     * @param {UserDocumentDiff} [updateItem] item to update
     * @param {UserDocument} [createItem] item to create
     */
    private static _prepareBuAssignments;
    /**
     * Gets executed after deployment of metadata type
     *
     * @param {UserDocumentMap} upsertResults metadata mapped by their keyField
     * @returns {Promise.<void>} promise
     */
    static postDeployTasks(upsertResults: UserDocumentMap): Promise<void>;
    /**
     * create/update business unit assignments
     *
     * @private
     * @param {UserDocumentMap} upsertResults metadata mapped by their keyField
     * @returns {Promise.<void>} -
     */
    private static _handleBuAssignments;
    /**
     * helper for {@link User.createOrUpdate}
     *
     * @private
     * @param {UserDocument} metadata single created user
     * @returns {void}
     */
    private static _setPasswordForNewUser;
    /**
     * helper for {@link User.createOrUpdate}
     * It searches for roles that were removed from the user and unassigns them; it also prints a summary of added/removed roles
     * Adding roles works automatically for roles listed on the user
     *
     * @private
     * @param {UserDocumentDiff} item updated user with before and after state
     * @returns {void}
     */
    private static _prepareRoleAssignments;
    /**
     * helper for {@link User._prepareRoleAssignments}
     *
     * @param {string} roleId role.ObjectID
     * @param {string} roleName role.Name
     * @param {number} userId user.AccountUserID
     * @param {boolean} assignmentOnly if true, only assignment configuration will be returned
     * @param {boolean} [isRoleRemovale] if true, role will be removed from user; otherwise added
     * @returns {object} format needed by API
     */
    static _getRoleObjectForDeploy(roleId: string, roleName: string, userId: number, assignmentOnly: boolean, isRoleRemovale?: boolean): object;
    /**
     * Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     *
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static retrieveChangelog(): Promise<MetadataTypeMapObj>;
    /**
     * Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     *
     * @private
     * @param {string} [retrieveDir] Directory where retrieved metadata directory will be saved
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    private static _retrieve;
    /**
     * Retrieves SOAP via generic fuel-soap wrapper based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {SoapRequestParams} [requestParams] required for the specific request (filter for example)
     * @param {string} [singleRetrieve] key of single item to filter by
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @returns {Promise.<MetadataTypeMapObj>} Promise of item map
     */
    static retrieveSOAP(retrieveDir: string, requestParams?: SoapRequestParams, singleRetrieve?: string, additionalFields?: string[]): Promise<MetadataTypeMapObj>;
    /**
     * helper for {@link User.retrieveSOAP}
     *
     * @private
     * @param {SoapRequestParams} requestParams required for the specific request (filter for example)
     * @param {string} soapType e.g. AccountUser
     * @param {string[]} fields list of fields to retrieve
     * @param {object} resultsBulk actual return value of this method
     * @returns {Promise.<boolean>} success flag
     */
    private static _retrieveSOAP_installedPackage;
    /**
     *
     * @param {string} dateStr first date
     * @param {string} interval defaults to 'days'
     * @returns {string} time difference
     */
    static "__#7@#timeSinceDate"(dateStr: string, interval?: string): string;
    /**
     * helper to print bu names
     *
     * @private
     * @param {number} id bu id
     * @returns {string} "bu name (bu id)""
     */
    private static _getBuName;
    /**
     * helper that gets BU names from config
     *
     * @private
     */
    private static _getBuNames;
    /**
     * helper for {@link User.createOrUpdate} to generate a random initial password for new users
     * note: possible minimum length values in SFMC are 6, 8, 10, 15 chars. Therefore we should default here to 15 chars.
     *
     * @private
     * @param {number} [length] length of password; defaults to 15
     * @returns {string} random password
     */
    private static _generatePassword;
    /**
     * Creates markdown documentation of all roles
     *
     * @param {UserDocumentMap} [metadata] user list
     * @returns {Promise.<void>} -
     */
    static document(metadata?: UserDocumentMap): Promise<void>;
    /**
     *
     * @private
     * @param {object[]} users list of users and installed package
     * @param {'Installed Package'|'User'|'Inactivated User'} type choose what sub type to print
     * @param {Array[]} columnsToPrint helper array
     * @returns {string} markdown
     */
    private static _generateDocMd;
    /**
     * manages post retrieve steps
     *
     * @param {MetadataTypeItem} metadata a single item
     * @returns {MetadataTypeItem | void} a single item
     */
    static postRetrieveTasks(metadata: MetadataTypeItem): MetadataTypeItem | void;
}
declare namespace User {
    let userIdBuMap: {};
    let buIdName: {};
    let definition: {
        bodyIteratorField: string;
        dependencies: string[];
        folderType: any;
        hasExtended: boolean;
        idField: string;
        keepId: boolean;
        keyIsFixed: boolean;
        keyField: string;
        nameField: string;
        createdDateField: string;
        createdNameField: any;
        lastmodDateField: string;
        lastmodNameField: string;
        maxKeyLength: number;
        type: string;
        soapType: string;
        typeDescription: string;
        typeName: string;
        typeRetrieveByDefault: boolean;
        documentInOneFile: boolean;
        stringifyFieldsBeforeTemplate: string[];
        fields: {
            AccountUserID: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            ActiveFlag: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            AssociatedBusinessUnits: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            BusinessUnit: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean; /**
                 * Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata
                 *
                 * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
                 * @param {void | string[]} _ unused parameter
                 * @param {void | string[]} [__] unused parameter
                 * @param {string} [key] customer key of single item to retrieve
                 * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
                 */
            };
            ChallengeAnswer: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            ChallengePhrase: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'Client.ID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'Client.ModifiedBy': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'Client.PartnerClientKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            CorrelationID: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean; /**
                 * Create a single item.
                 *
                 * @param {MetadataTypeItem} metadata single metadata entry
                 * @returns {Promise} Promise
                 */
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
            DefaultApplication: {
                isCreateable: boolean; /**
                 * Updates a single item.
                 *
                 * @param {MetadataTypeItem} metadata single metadata entry
                 * @returns {Promise} Promise
                 */
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            DefaultBusinessUnit: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            DefaultBusinessUnitObject: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            Delete: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            Email: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            ID: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            IsAPIUser: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            IsLocked: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'LanguageLocale.LocaleCode': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            LastSuccessfulLogin: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'Locale.LocaleCode': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'Locale.ObjectID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'Locale.PartnerKey': {
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
            MustChangePassword: {
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
            NotificationEmailAddress: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            ObjectID: {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: any;
            };
            ObjectState: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            Owner: {
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
            PartnerProperties: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            Password: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            Roles: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'Roles.Role': {
                skipValidation: boolean;
            };
            'Roles.Role[].Client': {
                skipValidation: boolean;
            };
            SsoIdentities: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'SsoIdentities.SsoIdentity': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'SsoIdentities.SsoIdentity[].IsActive': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'SsoIdentities.SsoIdentity[].FederatedID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'TimeZone.ID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'TimeZone.Name': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'TimeZone.ObjectID': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'TimeZone.PartnerKey': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            Unlock: {
                skipValidation: boolean;
                isCreateable: boolean;
                isUpdateable: boolean;
                template: boolean;
            };
            UserID: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            UserPermissions: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'UserPermissions.PartnerKey': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: boolean;
            };
            'UserPermissions.ID': {
                skipValidation: boolean;
            };
            'UserPermissions.ObjectID': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: boolean;
            };
            'UserPermissions.Name': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: boolean;
            };
            'UserPermissions.Value': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: boolean;
            };
            'UserPermissions.Description': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: boolean;
            };
            'UserPermissions.Delete': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: boolean;
            };
            'UserPermissions[].PartnerKey': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: boolean;
            };
            'UserPermissions[].ID': {
                skipValidation: boolean;
            };
            'UserPermissions[].ObjectID': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: boolean;
            };
            'UserPermissions[].Name': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: boolean;
            };
            'UserPermissions[].Value': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: boolean;
            };
            'UserPermissions[].Description': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: boolean;
            };
            'UserPermissions[].Delete': {
                isCreateable: any;
                isUpdateable: any;
                retrieving: boolean;
                template: boolean;
            };
            c__type: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieve: any;
                template: boolean;
            };
            c__AssociatedBusinessUnits: {
                skipValidation: boolean;
            };
            c__RoleNamesGlobal: {
                skipValidation: boolean;
            };
            c__LocaleCode: {
                skipValidation: boolean;
            };
            c__TimeZoneName: {
                skipValidation: boolean;
            };
            c__AccountUserID: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieve: any;
                template: boolean;
            };
            c__IsLocked_readOnly: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieve: any;
                template: boolean;
            };
        };
    };
}
import MetadataType from './MetadataType.js';
//# sourceMappingURL=User.d.ts.map