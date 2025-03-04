declare namespace _default {
    let bodyIteratorField: string;
    let dependencies: string[];
    let dependencyGraph: any;
    let hasExtended: boolean;
    let idField: string;
    let keepId: boolean;
    let keyIsFixed: boolean;
    let keyField: string;
    let nameField: string;
    let folderIdField: string;
    let restPagination: any;
    let type: string;
    let typeDescription: string;
    let typeRetrieveByDefault: boolean;
    let typeCdpByDefault: boolean;
    let typeName: string;
    let fields: {
        CategoryID: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        CharacterSet: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        'Client.ID': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        'Client.PartnerClientKey': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        ClonedFromID: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        ContentAreas: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        'ContentAreas.CategoryID': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        'ContentAreas.Content': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        'ContentAreas.CustomerKey': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        'ContentAreas.ID': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        'ContentAreas.IsBlank': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        'ContentAreas.IsDynamicContent': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        'ContentAreas.IsLocked': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        'ContentAreas.IsSurvey': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        'ContentAreas.Key': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        'ContentAreas.Name': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        'ContentAreas.ObjectID': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        'ContentAreas.PartnerKey': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        'ContentAreas[].CategoryID': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        'ContentAreas[].Content': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        'ContentAreas[].CustomerKey': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        'ContentAreas[].ID': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        'ContentAreas[].IsBlank': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        'ContentAreas[].IsDynamicContent': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        'ContentAreas[].IsLocked': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        'ContentAreas[].IsSurvey': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        'ContentAreas[].Key': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        'ContentAreas[].Name': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        'ContentAreas[].ObjectID': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        'ContentAreas[].PartnerKey': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        ContentCheckStatus: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        CreatedDate: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        CustomerKey: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        EmailType: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        Folder: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        HasDynamicSubjectLine: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        HTMLBody: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        ID: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        IsActive: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        IsHTMLPaste: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        ModifiedDate: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        Name: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        ObjectID: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        PartnerKey: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        PreHeader: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        Status: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        Subject: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        SyncTextWithHTML: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
        TextBody: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            templating: boolean;
        };
    };
}
export default _default;
//# sourceMappingURL=Email.definition.d.ts.map