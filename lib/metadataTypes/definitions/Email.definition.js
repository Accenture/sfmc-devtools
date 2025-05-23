export default {
    bodyIteratorField: 'Results',
    dependencies: ['folder-hidden', 'folder-email', 'folder-shared_email_default'],
    dependencyGraph: null,
    hasExtended: false,
    idField: 'ID',
    keepId: true,
    keyIsFixed: true,
    keyField: 'CustomerKey',
    nameField: 'Name',
    folderIdField: 'CategoryID',
    restPagination: null,
    type: 'email',
    typeDescription:
        'DEPRECATED: Old way of saving E-Mails; please migrate these to new E-Mail (`Asset: message`).',
    typeRetrieveByDefault: false,
    typeCdpByDefault: false,
    typeName: 'E-Mail (Classic)',
    fields: {
        CategoryID: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            templating: false,
        },
        CharacterSet: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            templating: false,
        },
        'Client.ID': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'Client.PartnerClientKey': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            templating: false,
        },
        ClonedFromID: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            templating: false,
        },
        ContentAreas: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            templating: false,
        },
        'ContentAreas.CategoryID': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'ContentAreas.Content': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'ContentAreas.CustomerKey': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'ContentAreas.ID': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'ContentAreas.IsBlank': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'ContentAreas.IsDynamicContent': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'ContentAreas.IsLocked': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'ContentAreas.IsSurvey': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'ContentAreas.Key': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'ContentAreas.Name': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'ContentAreas.ObjectID': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'ContentAreas.PartnerKey': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'ContentAreas[].CategoryID': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'ContentAreas[].Content': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'ContentAreas[].CustomerKey': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'ContentAreas[].ID': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'ContentAreas[].IsBlank': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'ContentAreas[].IsDynamicContent': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'ContentAreas[].IsLocked': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'ContentAreas[].IsSurvey': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'ContentAreas[].Key': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'ContentAreas[].Name': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'ContentAreas[].ObjectID': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'ContentAreas[].PartnerKey': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        ContentCheckStatus: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            templating: false,
        },
        CreatedDate: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            templating: false,
        },
        CustomerKey: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            templating: false,
        },
        EmailType: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            templating: false,
        },
        Folder: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            templating: false,
        },
        HasDynamicSubjectLine: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            templating: false,
        },
        HTMLBody: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            templating: false,
        },
        ID: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            templating: false,
        },
        IsActive: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            templating: false,
        },
        IsHTMLPaste: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            templating: false,
        },
        ModifiedDate: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            templating: false,
        },
        Name: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            templating: false,
        },
        ObjectID: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        PartnerKey: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            templating: false,
        },
        PreHeader: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            templating: false,
        },
        Status: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            templating: false,
        },
        Subject: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            templating: false,
        },
        SyncTextWithHTML: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        TextBody: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            templating: false,
        },
    },
};
