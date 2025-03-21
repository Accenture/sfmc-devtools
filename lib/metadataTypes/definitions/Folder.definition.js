export default {
    bodyIteratorField: 'Results',
    dependencies: [],
    dependencyGraph: null,
    subTypes: [
        'asset-shared',
        'asset',
        'automations',
        'contextual_suppression_list',
        'dataextension',
        'filteractivity',
        'filterdefinition',
        'hidden',
        'journey',
        'list',
        'mysubs',
        'publication',
        'queryactivity',
        'salesforcedataextension',
        'shared_content',
        'shared_data',
        'shared_dataextension',
        'shared_email',
        'shared_item',
        'shared_portfolio',
        'shared_publication',
        'shared_salesforcedataextension',
        'shared_suppression_list',
        'shared_template',
        'ssjsactivity',
        'suppression_list',
        'synchronizeddataextension',
        'triggered_send_journeybuilder',
        'triggered_send',
    ],
    deployFolderTypes: [
        // lower-case values!
        'asset',
        'automations',
        'dataextension',
        'filteractivity',
        'filterdefinition',
        'journey',
        'list',
        'mysubs',
        'publication',
        'queryactivity',
        'salesforcedataextension',
        'shared_dataextension',
        'shared_salesforcedataextension',
        'ssjsactivity',
        'suppression_list',
        'synchronizeddataextension',
        'triggered_send_journeybuilder',
        'triggered_send',
    ],
    deployFolderTypesRest: ['automations', 'journey', 'triggered_send_journeybuilder'],
    deployFolderBlacklist: [
        // lower-case values!
        'shared data extensions',
        'shared salesforce data extensions',
    ],
    folderTypesFromParent: [
        'asset-shared',
        'asset',
        'shared_content',
        'shared_data',
        'shared_dataextension',
        'shared_email',
        'shared_item',
        'shared_portfolio',
        'shared_publication',
        'shared_salesforcedataextension',
        'shared_suppression_list',
        'shared_template',
        'synchronizeddataextension',
    ],
    hasExtended: false,
    idField: 'ID',
    keepId: true,
    keyIsFixed: true,
    keyField: 'CustomerKey',
    nameField: 'Name',
    restPagination: false,
    type: 'folder',
    soapType: 'DataFolder',
    typeDescription: 'Used to structure all kinds of other metadata.',
    typeRetrieveByDefault: false,
    typeCdpByDefault: false,
    typeName: 'Folder',
    fields: {
        $: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        '@_xsi:type': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        ID: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: false,
        },
        'Client.ID': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        CustomerKey: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: false,
        },
        Description: {
            isCreateable: true,
            isUpdateable: false, // dont update this to prevent accidental overrides by auto-created folders
            retrieving: true,
            template: false,
        },
        CreatedDate: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        ModifiedDate: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        ContentType: {
            isCreateable: true,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        IsActive: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        IsEditable: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        AllowChildren: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        ObjectID: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        Name: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'ParentFolder.CustomerKey': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        'ParentFolder.ID': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: false,
        },
        'ParentFolder.PartnerKey': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        'ParentFolder.ObjectID': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        'ParentFolder.Path': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        PartnerKey: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        Path: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        _generated: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        catType: {
            // REST only, equal to SOAP's ContentType
            isCreateable: true,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        name: {
            // REST only, equal to SOAP's ParentFolder.ID
            isCreateable: true,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        parentCatId: {
            // REST only, equal to SOAP's ParentFolder.ID
            isCreateable: true,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
    },
};
