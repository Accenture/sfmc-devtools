export default {
    bodyIteratorField: '',
    dependencies: [],
    hasExtended: false,
    idField: 'extractId',
    keyIsFixed: null,
    keyField: 'name',
    nameField: 'name',
    restPagination: false,
    type: 'dataExtractType',
    typeDescription:
        'Types of Data Extracts enabled for a specific business unit. This normally should not be stored.',
    typeRetrieveByDefault: false,
    typeName: 'Data Extract Type',
    fields: {
        name: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        extractId: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
    },
};
