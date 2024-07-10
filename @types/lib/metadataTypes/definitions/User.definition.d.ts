declare namespace _default {
    let bodyIteratorField: string;
    let dependencies: string[];
    namespace dependencyGraph {
        let role: string[];
    }
    let folderType: any;
    let hasExtended: boolean;
    let idField: string;
    let keepId: boolean;
    let keyIsFixed: boolean;
    let keyField: string;
    let nameField: string;
    let createdDateField: string;
    let createdNameField: any;
    let lastmodDateField: string;
    let lastmodNameField: string;
    let maxKeyLength: number;
    let type: string;
    let soapType: string;
    let typeDescription: string;
    let typeName: string;
    let typeRetrieveByDefault: boolean;
    let documentInOneFile: boolean;
    let stringifyFieldsBeforeTemplate: string[];
    let fields: {
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
            template: boolean;
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
        DefaultApplication: {
            isCreateable: boolean;
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
}
export default _default;
//# sourceMappingURL=User.definition.d.ts.map