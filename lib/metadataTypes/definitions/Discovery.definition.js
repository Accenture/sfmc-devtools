export default {
    bodyIteratorField: null,
    dependencies: [],
    dependencyGraph: null,
    endPointMapping: {
        Address: '/address/v1/rest',
        Asset: '/asset/v1/rest',
        Automation: '/automation/v1/rest',
        Contacts: '/contacts/v1/rest',
        Data: '/data/v1/rest',
        Device: '/device/v1/rest',
        Email: '/email/v1/rest',
        Guide: '/guide/v1/rest',
        Hub: '/hub/v1/rest',
        Interaction: '/interaction/v1/rest',
        'Interaction-Experimental': '/interaction-experimental/v1/rest',
        Legacy: '/legacy/v1/rest',
        Messaging: '/messaging/v1/rest',
        'Messaging-Experimental': '/messaging-experimental/v1/rest',
        OTT: '/ott/v1/rest',
        'OTT-Experimental': '/ott/v1/rest/experimental',
        Platform: '/platform/v1/rest',
        'Platform-Experimental': '/platform/v1/rest/experimental',
        Provisioning: '/provisioning/v1/rest',
        Push: '/push/v1/rest',
        SMS: '/sms/v1/rest',
    },
    hasExtended: false,
    idField: '',
    keyIsFixed: true,
    keyField: 'key',
    nameField: 'name',
    restPagination: false,
    type: 'discovery',
    typeDescription:
        'Description of all API endpoints accessible via REST API; only relevant for developers of Accenture SFMC DevTools.',
    typeRetrieveByDefault: false,
    typeCdpByDefault: false,
    typeName: 'API Discovery',
    fields: {
        basePath: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        baseUrl: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        description: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        discoveryVersion: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        documentationLink: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        id: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        key: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        kind: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        methods: {
            skipValidation: true,
        },
        metadata: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        'metadata.supportsResponseEncoding': {
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
        protocol: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        resources: {
            skipValidation: true,
        },
        rootUrl: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        schemas: {
            skipValidation: true,
        },
        servicePath: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        title: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        version: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
    },
};
