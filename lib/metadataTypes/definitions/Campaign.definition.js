export default {
    bodyIteratorField: 'entry',
    dependencies: [],
    hasExtended: false,
    idField: 'id',
    keepId: true,
    keyIsFixed: null,
    keyField: 'name',
    nameField: 'name',
    createdDateField: 'createdDate',
    createdNameField: null,
    lastmodDateField: 'lastUpdated',
    lastmodNameField: null,
    restPagination: true,
    restPageSize: 50,
    type: 'campaign',
    typeDescription: 'Way of tagging/categorizing emails, journeys and alike.',
    typeRetrieveByDefault: false,
    typeName: 'Campaign Tag',
    fields: {
        id: {
            // alphanumeric string
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            templating: false,
        },
        campaignId: {
            // numeric
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        type: {
            // always set to "Campaign"
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        createdDate: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            templating: false,
        },
        createdBy: {
            // returns https://mc....rest.marketingcloudapis.com/legacy/v1/beta/organization/user/Nzc1MTU2ODo0OjA
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        ownerId: {
            // returns https://mc....rest.marketingcloudapis.com/legacy/v1/beta/organization/user/Nzc1MTU2ODo0OjA
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        lastUpdated: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            templating: false,
        },
        name: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            templating: false,
        },
        description: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            templating: false,
        },
        externalKey: {
            // can be empty - should use "name" instead as key
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            templating: false,
        },
        campaignCode: {
            // always empty string; real value is in field "externalKey"
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'display.name': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            templating: false,
        },
        'display.value': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            templating: false,
        },
        isFavorite: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            templating: false,
        },
        campaignOwnerName: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            templating: false,
        },
        campaignOwner: {
            // value like "MDo0OjE"
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        campaignStatus: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            templating: false,
        },
    },
};
