export default {
    bodyIteratorField: 'entry',
    dependencies: [],
    filter: {},
    hasExtended: false,
    idField: 'id',
    keyField: 'key',
    keyIsFixed: false,
    maxKeyLength: 36, // confirmed max length
    nameField: 'name',
    createdDateField: 'createdDate',
    createdNameField: null,
    lastmodDateField: 'lastUpdated',
    lastmodNameField: null,
    restPagination: false,
    type: 'deliveryProfile',
    typeDescription:
        'Delivery profiles specify details such as IP address, domain, header inclusion, and footer; Via API we can only check for their existence but not see any details.',
    typeRetrieveByDefault: false,
    typeName: 'Delivery Profile',
    fields: {
        id: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        key: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        name: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        description: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        createdDate: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        lastUpdated: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
    },
};
