module.exports = {
    bodyIteratorField: 'items',
    dependencies: [],
    hasExtended: false,
    idField: 'id',
    keyField: 'name',
    nameField: 'name',
    restPagination: false,
    type: 'ftpLocation',
    typeDescription:
        'A File Location which can be used for export or import of files to/from Marketing Cloud.',
    typeRetrieveByDefault: true,
    typeName: 'FTP Location',
    fields: {
        id: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        locationTypeId: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        locationUrl: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        name: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        relPath: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
    },
};
