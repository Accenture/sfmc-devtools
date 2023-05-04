module.exports = {
    bodyIteratorField: 'Results',
    dependencies: ['role'],
    folderType: null,
    hasExtended: false,
    idField: 'AccountUserID', // ID contains the same value as AccountUserID but is not required by API
    keepId: true,
    keyIsFixed: false,
    keyField: 'CustomerKey',
    nameField: 'Name',
    createdDateField: 'CreatedDate',
    createdNameField: null,
    lastmodDateField: 'ModifiedDate',
    lastmodNameField: 'Client.ModifiedBy',
    type: 'user',
    soapType: 'AccountUser',
    typeDescription: 'Marketing Cloud users',
    typeName: 'User',
    typeRetrieveByDefault: false,
    stringifyFieldsBeforeTemplate: ['DefaultBusinessUnit', 'c__AssociatedBusinessUnits'],
    fields: {
        AccountUserID: {
            // numeric id, cannot be changed but identifies the useruniquely
            isCreateable: false,
            isUpdateable: true,
            retrieving: true,
            template: false,
        },
        ActiveFlag: { isCreateable: true, isUpdateable: true, retrieving: true, template: true },
        AssociatedBusinessUnits: {
            // not supported by API
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        BusinessUnit: {
            // not supported by API
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        ChallengeAnswer: {
            // alwasy empty
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        ChallengePhrase: {
            // alwasy empty
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        'Client.ID': { isCreateable: true, isUpdateable: true, retrieving: false, template: false },
        'Client.ModifiedBy': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        'Client.PartnerClientKey': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        CorrelationID: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        CreatedDate: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        CustomerKey: { isCreateable: true, isUpdateable: true, retrieving: true, template: true },
        DefaultApplication: {
            // not supported by API
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        DefaultBusinessUnit: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        DefaultBusinessUnitObject: {
            // more complex version of DefaultBusinessUnit thats not needed for deployment
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        Delete: { isCreateable: false, isUpdateable: false, retrieving: false, template: false },
        Email: { isCreateable: true, isUpdateable: true, retrieving: true, template: true },
        ID: { isCreateable: false, isUpdateable: false, retrieving: false, template: false },
        IsAPIUser: { isCreateable: true, isUpdateable: true, retrieving: true, template: true },
        IsLocked: {
            // Indicates if account user can or cannot log into their account
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        'LanguageLocale.LocaleCode': {
            // seems to always return en-US
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        LastSuccessfulLogin: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        'Locale.LocaleCode': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'Locale.ObjectID': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        'Locale.PartnerKey': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        ModifiedDate: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        MustChangePassword: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        Name: { isCreateable: true, isUpdateable: true, retrieving: true, template: true },
        NotificationEmailAddress: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        ObjectID: { isCreateable: null, isUpdateable: null, retrieving: false, template: null },
        ObjectState: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        Owner: { isCreateable: false, isUpdateable: false, retrieving: false, template: false },
        PartnerKey: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        PartnerProperties: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        Password: { isCreateable: true, isUpdateable: true, retrieving: false, template: false },
        Roles: { isCreateable: true, isUpdateable: true, retrieving: true, template: true },
        'Roles.Role': {
            skipValidation: true,
        },
        'Roles.Role[].Client': {
            skipValidation: false,
        },
        SsoIdentities: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: false, // retrieve not supported by API
            template: false,
        },
        'SsoIdentities[]': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: false,
            template: false,
        },
        'SsoIdentities[].IsActive': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: false,
            template: false,
        },
        'SsoIdentities[].FederatedID': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: false,
            template: false,
        },
        'TimeZone.ID': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: false,
        },
        'TimeZone.Name': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        'TimeZone.ObjectID': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        'TimeZone.PartnerKey': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        Unlock: {
            // do not retrieve it but also do not remove it from retrieve as we are adding it manually
            skipValidation: true,
            isCreateable: false,
            isUpdateable: true,
            template: true,
        },
        UserID: { isCreateable: true, isUpdateable: true, retrieving: true, template: true },
        UserPermissions: {
            // not sure what to do with the reponse yet. might become interesting for the future
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        'UserPermissions.PartnerKey': {
            isCreateable: null,
            isUpdateable: null,
            retrieving: false,
            template: false,
        },
        'UserPermissions.ID': {
            skipValidation: true,
        },
        'UserPermissions.ObjectID': {
            isCreateable: null,
            isUpdateable: null,
            retrieving: false,
            template: false,
        },
        'UserPermissions.Name': {
            isCreateable: null,
            isUpdateable: null,
            retrieving: false,
            template: false,
        },
        'UserPermissions.Value': {
            isCreateable: null,
            isUpdateable: null,
            retrieving: false,
            template: false,
        },
        'UserPermissions.Description': {
            isCreateable: null,
            isUpdateable: null,
            retrieving: false,
            template: false,
        },
        'UserPermissions.Delete': {
            isCreateable: null,
            isUpdateable: null,
            retrieving: false,
            template: false,
        },
        'UserPermissions[].PartnerKey': {
            isCreateable: null,
            isUpdateable: null,
            retrieving: false,
            template: false,
        },
        'UserPermissions[].ID': {
            skipValidation: true,
        },
        'UserPermissions[].ObjectID': {
            isCreateable: null,
            isUpdateable: null,
            retrieving: false,
            template: false,
        },
        'UserPermissions[].Name': {
            isCreateable: null,
            isUpdateable: null,
            retrieving: false,
            template: false,
        },
        'UserPermissions[].Value': {
            isCreateable: null,
            isUpdateable: null,
            retrieving: false,
            template: false,
        },
        'UserPermissions[].Description': {
            isCreateable: null,
            isUpdateable: null,
            retrieving: false,
            template: false,
        },
        'UserPermissions[].Delete': {
            isCreateable: null,
            isUpdateable: null,
            retrieving: false,
            template: false,
        },
        c__type: {
            isCreateable: false,
            isUpdateable: false,
            retrieve: null, // handled via script
            template: false,
        },
        c__AssociatedBusinessUnits: {
            skipValidation: true,
        },
        c__RoleNamesGlobal: {
            skipValidation: true,
        },
        c__LocaleCode: {
            skipValidation: true,
        },
        c__TimeZoneName: {
            skipValidation: true,
        },
        c__AccountUserID: {
            isCreateable: false,
            isUpdateable: false,
            retrieve: null, // handled via script
            template: false,
        },
        c__IsLocked_readOnly: {
            isCreateable: false,
            isUpdateable: false,
            retrieve: null, // handled via script
            template: false,
        },
    },
};
