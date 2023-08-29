module.exports = {
    bodyIteratorField: 'Results',
    dependencies: ['folder-filterdefinition', 'folder-hidden', 'dataExtension'],
    filter: {},
    hasExtended: false,
    idField: 'id',
    keyField: 'key',
    nameField: 'name',
    folderType: 'filterdefinition',
    folderIdField: 'categoryId',
    createdDateField: 'createdDate',
    createdNameField: 'createdBy',
    lastmodDateField: 'lastUpdated',
    lastmodNameField: 'lastUpdatedBy',
    restPagination: false,
    type: 'filterDefinition',
    typeDescription:
        'Defines an audience based on specified rules. Used by Filter Activities and Filtered DEs.',
    typeRetrieveByDefault: true,
    typeName: 'Filter Definition',
    fields: {
        // the GUI seems to ONLY send fields during update that are actually changed. It has yet to be tested if that also works with sending other fiedls as well
        id: {
            isCreateable: false,
            isUpdateable: false, // included in URL
            retrieving: false,
            template: false,
        },
        key: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        createdDate: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        createdBy: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        // createdByName: {
        //     isCreateable: false,
        //     isUpdateable: false,
        //     retrieving: false,
        //     template: false,
        // },
        lastUpdated: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        lastUpdatedBy: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        // lastUpdatedName: {
        //     isCreateable: false,
        //     isUpdateable: false,
        //     retrieving: false,
        //     template: false,
        // },
        name: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        categoryId: {
            // returned by GET / CREATE / UPDATE; used in CREATE payload
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        // CategoryId: {
        //     // used by UPDATE payload
        //     isCreateable: false,
        //     isUpdateable: true,
        //     retrieving: false,
        //     template: false,
        // },
        filterDefinitionXml: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        // DerivedFromType: {
        //     // this upper-cased spelling is used by GUI when creating a dataExtension based filterDefintion
        //     isCreateable: true,
        //     isUpdateable: false, // cannot be updated
        //     retrieving: false,
        //     template: false,
        // },
        derivedFromType: {
            // 1: SubscriberAttributes, 2: DataExtension, 6: EntryCriteria;
            isCreateable: true,
            isUpdateable: false, // cannot be updated
            retrieving: true,
            template: true,
        },
        derivedFromObjectId: {
            // dataExtension ID or '00000000-0000-0000-0000-000000000000' for lists
            isCreateable: true,
            isUpdateable: false, // cannot be updated
            retrieving: true,
            template: true,
        },
        derivedFromObjectTypeName: {
            // "SubscriberAttributes" | "DataExtension" | "EntryCriteria" ...; only returned by GET API
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        derivedFromObjectName: {
            // dataExtension name; field only returned by GET-API
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        isSendable: {
            isCreateable: false, // automatically set during create
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
    },
};
