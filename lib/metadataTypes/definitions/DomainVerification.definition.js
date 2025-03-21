export default {
    bodyIteratorField: 'items',
    dependencies: [],
    dependencyGraph: null,
    hasExtended: false,
    idField: 'domain',
    keyIsFixed: true, // you can only change the "isSendable" property
    keyField: 'domain',
    createdDateField: null,
    createdNameField: null,
    lastmodDateField: null,
    lastmodNameField: null,
    nameField: 'domain',
    restPagination: true,
    maxKeyLength: 254, // assumed max length
    type: 'domainVerification',
    typeDescription: 'Domains emails that are verified for sending',
    typeRetrieveByDefault: true,
    typeCdpByDefault: true,
    typeName: 'Domain Verification',
    fields: {
        domain: {
            isCreateable: true,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        emailAddress: {
            // this is the same as domain, but the update API uses this field name instead
            isCreateable: false,
            isUpdateable: true,
            retrieving: false,
            template: false,
        },
        enterpriseId: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        memberId: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        domainType: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        isSendable: {
            isCreateable: false,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        status: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        emailSendTime: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
    },
};
