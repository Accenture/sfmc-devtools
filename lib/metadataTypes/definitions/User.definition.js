module.exports = {
    bodyIteratorField: 'Results',
    dependencies: ['role'],
    folderType: null,
    hasExtended: false,
    idField: 'AccountUserID', // ID contains the same value as AccountUserID but is not required by API
    keyField: 'CustomerKey',
    nameField: 'Name',
    type: 'user',
    soapType: 'accountUser',
    typeDescription: 'Marketing Cloud users',
    typeName: 'User',
    typeRetrieveByDefault: false,
    stringifyFieldsBeforeTemplate: ['DefaultBusinessUnit', 'AssociatedBusinessUnits__c'],
    fields: {
        AccountUserID: {
            isCreateable: false,
            isUpdateable: true,
            retrieving: true,
            template: false,
        },
        ActiveFlag: { isCreateable: true, isUpdateable: true, retrieving: true, template: true },
        AssociatedBusinessUnits: {
            isCreateable: null,
            isUpdateable: null,
            retrieving: false,
            template: null,
        },
        BusinessUnit: {
            isCreateable: null,
            isUpdateable: null,
            retrieving: false,
            template: null,
        },
        ChallengeAnswer: {
            isCreateable: null,
            isUpdateable: null,
            retrieving: false,
            template: false,
        },
        ChallengePhrase: {
            isCreateable: null,
            isUpdateable: null,
            retrieving: false,
            template: false,
        },
        Client: { isCreateable: true, isUpdateable: true, retrieving: false, template: false },
        'Client.ID': { isCreateable: true, isUpdateable: true, retrieving: false, template: false },
        CorrelationID: {
            isCreateable: null,
            isUpdateable: null,
            retrieving: false,
            template: null,
        },
        CreatedDate: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        CustomerKey: { isCreateable: true, isUpdateable: true, retrieving: true, template: true },
        DefaultApplication: {
            isCreateable: null,
            isUpdateable: null,
            retrieving: false,
            template: null,
        },
        DefaultBusinessUnit: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        DefaultBusinessUnitObject: {
            isCreateable: null,
            isUpdateable: null,
            retrieving: false,
            template: null,
        },
        Delete: { isCreateable: null, isUpdateable: null, retrieving: false, template: null },
        Email: { isCreateable: true, isUpdateable: true, retrieving: true, template: true },
        ID: { isCreateable: false, isUpdateable: false, retrieving: false, template: false },
        IsAPIUser: { isCreateable: true, isUpdateable: true, retrieving: true, template: true },
        IsLocked: { isCreateable: null, isUpdateable: null, retrieving: true, template: true },
        LanguageLocale: {
            // not supported by API
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
        Locale: {
            // not supported by API
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
        ObjectState: { isCreateable: null, isUpdateable: null, retrieving: false, template: null },
        Owner: { isCreateable: null, isUpdateable: null, retrieving: false, template: null },
        PartnerKey: { isCreateable: null, isUpdateable: null, retrieving: false, template: null },
        PartnerProperties: {
            isCreateable: null,
            isUpdateable: null,
            retrieving: false,
            template: null,
        },
        Password: { isCreateable: true, isUpdateable: null, retrieving: false, template: false },
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
        TimeZone: {
            // not supported by API
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        Unlock: { isCreateable: null, isUpdateable: null, retrieving: false, template: null },
        UserID: { isCreateable: true, isUpdateable: true, retrieving: true, template: true },
        UserPermissions: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
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
        type__c: {
            skipValidation: true,
        },
        AssociatedBusinessUnits__c: {
            skipValidation: true,
        },
        RoleNamesGlobal__c: {
            skipValidation: true,
        },
    },
};