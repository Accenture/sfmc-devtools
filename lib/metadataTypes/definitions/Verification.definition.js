module.exports = {
    bodyIteratorField: 'items',
    dependencies: ['dataExtension'],
    hasExtended: false,
    idField: 'dataVerificationDefinitionId',
    keyIsFixed: true,
    keyField: 'dataVerificationDefinitionId',
    createdDateField: null,
    createdNameField: 'createdBy',
    lastmodDateField: null,
    lastmodNameField: null,
    nameField: 'dataVerificationDefinitionId',
    restPagination: false,
    maxKeyLength: 36, // confirmed max length
    type: 'verification',
    typeDescription: 'Check DataExtension for a row count',
    typeRetrieveByDefault: true,
    typeName: 'Automation: Verification Activity',
    fields: {
        createdBy: {
            // User ID
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        dataVerificationDefinitionId: {
            isCreateable: false, // auto-assigned during creation by SFMC
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        notificationEmailAddress: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        notificationEmailMessage: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        shouldEmailOnFailure: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        shouldStopOnFailure: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        targetObjectId: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        value1: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        value2: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        verificationType: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        r__dataExtension_CustomerKey: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
    },
};
