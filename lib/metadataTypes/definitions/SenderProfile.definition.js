export default {
    bodyIteratorField: 'Results',
    dependencies: [],
    dependencyGraph: null,
    filter: {},
    hasExtended: false,
    idField: 'ObjectID',
    keyField: 'CustomerKey',
    keyIsFixed: false,
    maxKeyLength: 36, // confirmed max length
    nameField: 'Name',
    createdDateField: 'CreatedDate',
    createdNameField: null,
    lastmodDateField: 'ModifiedDate',
    lastmodNameField: null,
    restPagination: false,
    type: 'senderProfile',
    typeDescription: 'Specifies the From information for a send in a central location',
    typeRetrieveByDefault: true,
    typeName: 'Sender Profile',
    fields: {
        'Client.ID': {
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
        ModifiedDate: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        CustomerKey: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        ObjectID: {
            isCreateable: false,
            isUpdateable: true,
            retrieving: true,
            template: false,
        },
        Name: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        Description: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
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

        AutoForwardToEmailAddress: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        AutoForwardToName: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        AutoForwardTriggeredSend: {
            // not supported
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        AutoReply: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        AutoReplyTriggeredSend: {
            // not supported
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        DataRetentionPeriodLength: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        DataRetentionPeriodUnitOfMeasure: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        DirectForward: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        FromAddress: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        FromName: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        ID: {
            // not supported
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        ReplyManagementRuleSet: {
            // not supported
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        ReplyToAddress: {
            // not supported
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        ReplyToDisplayName: {
            // not supported
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        SenderHeaderEmailAddress: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        SenderHeaderName: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        UseDefaultRMMRules: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
    },
};
