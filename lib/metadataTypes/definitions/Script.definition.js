export default {
    bodyIteratorField: 'items',
    dependencies: ['folder-ssjsactivity'],
    dependencyGraph: null,
    folderType: 'ssjsactivity',
    hasExtended: false,
    idField: 'ssjsActivityId',
    keyIsFixed: false,
    keyField: 'key',
    nameField: 'name',
    folderIdField: 'categoryId',
    createdDateField: 'createdDate',
    createdNameField: null,
    lastmodDateField: 'modifiedDate',
    lastmodNameField: null,
    restPagination: true,
    type: 'script',
    typeDescription: 'Execute more complex tasks via SSJS or AMPScript.',
    typeRetrieveByDefault: true,
    typeCdpByDefault: true,
    typeName: 'Automation: Script Activity',
    fields: {
        categoryId: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        createdBy: {
            // not existing in rest api
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        createdDate: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        description: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        folderLocationText: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        key: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        modifiedBy: {
            // not existing in rest api
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        modifiedDate: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        name: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        script: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        ssjsActivityId: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: false,
        },
        status: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        statusId: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        r__folder_Path: { skipValidation: true },
    },
};
