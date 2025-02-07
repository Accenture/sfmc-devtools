// https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/sendclassification.html
export default {
    bodyIteratorField: 'Results',
    dependencies: ['senderProfile', 'deliveryProfile'],
    dependencyGraph: {
        senderProfile: ['r__senderProfile_key'],
        // deliveryProfile: ['r__deliveryProfile_key'], // deliveryProfile cannot be deployed
    },
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
    type: 'sendClassification',
    typeDescription:
        'Lets admins define Delivery Profile, Sender Profile and CAN-SPAM for an email job in a central location.',
    typeRetrieveByDefault: true,
    typeName: 'Send Classification',
    sendClassificationTypeMapping: {
        Commercial: 'Marketing',
        Transactional: 'Operational',
    },
    fields: {
        'Client.ID': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        CreatedDate: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: false,
        },
        ModifiedDate: {
            isCreateable: true,
            isUpdateable: true,
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

        ArchiveEmail: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'DeliveryProfile.CustomerKey': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'DeliveryProfile.PartnerKey': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        'DeliveryProfile.ObjectID': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        HonorPublicationListOptOutsForTransactionalSends: {
            /* not supported */
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        SendClassificationType: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'SenderProfile.CustomerKey': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'SenderProfile.PartnerKey': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        'SenderProfile.ObjectID': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: false,
        },
        SendPriority: {
            /* not supported */
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        c__classification: {
            skipValidation: true,
        },
        r__deliveryProfile_key: {
            skipValidation: true,
        },
        r__senderProfile_key: {
            skipValidation: true,
        },
    },
};
