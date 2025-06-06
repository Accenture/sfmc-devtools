export default {
    bodyIteratorField: 'Results',
    dependencies: [
        'folder-userinitiatedsends',
        'email',
        'asset-message',
        'dataExtension',
        'list',
        'sendClassification',
        'senderProfile',
        'deliveryProfile',
    ], // filter(+)
    dependencyGraph: {
        asset: ['r__asset_key'],
        dataExtension: ['SendDefinitionList.r__dataExtension_key'],
        deliveryProfile: ['r__deliveryProfile_key'],
        list: ['SendDefinitionList.r__list_PathName'],
        sendClassification: ['r__sendClassification_key'],
        senderProfile: ['r__senderProfile_key'],
    },
    folderType: 'userinitiatedsends',
    hasExtended: false,
    idField: 'ObjectID',
    keepId: true,
    keyIsFixed: false,
    keyField: 'CustomerKey',
    nameField: 'Name',
    folderIdField: 'CategoryID',
    createdDateField: 'CreatedDate',
    createdNameField: null,
    lastmodDateField: 'ModifiedDate',
    lastmodNameField: null,
    restPagination: null,
    maxKeyLength: 36, // confirmed max length
    type: 'emailSend',
    soapType: 'emailSendDefinition',
    typeDescription: 'Mainly used in Automations as "Send Email Activity".',
    typeRetrieveByDefault: true,
    typeCdpByDefault: true,
    typeName: 'E-Mail Send Definition',
    fields: {
        Additional: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            templating: true,
        },
        AutoBccEmail: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            templating: true,
        },
        BccEmail: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            templating: true,
        },
        CategoryID: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            templating: true,
        },
        CCEmail: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            templating: true,
        },
        'Client.ID': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        CorrelationID: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        CreatedDate: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            templating: false,
        },
        CustomerKey: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            templating: true,
        },
        DeduplicateByEmail: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            templating: true,
        },
        'DeliveryProfile.CustomerKey': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            templating: true,
        },
        'DeliveryProfile.DomainType': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'DeliveryProfile.FooterContentArea.ID': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'DeliveryProfile.FooterSalutationSource': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'DeliveryProfile.HeaderContentArea.ID': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'DeliveryProfile.HeaderSalutationSource': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'DeliveryProfile.ObjectID': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'DeliveryProfile.PartnerKey': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'DeliveryProfile.PrivateDomain': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            templating: true,
        },
        'DeliveryProfile.PrivateIP': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            templating: true,
        },
        'DeliveryProfile.SourceAddressType': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        DeliveryScheduledTime: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        Description: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            templating: true,
        },
        DomainType: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        DynamicEmailSubject: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            templating: true,
        },
        'Email.ID': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            templating: true,
        },
        'Email.ObjectID': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'Email.PartnerKey': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'Email.Name': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: false,
            templating: false,
        },
        'Email.Subject': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: false,
            templating: false,
        },
        'Email.Status': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: false,
            templating: false,
        },
        EmailSubject: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            templating: true,
        },
        ExclusionFilter: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            templating: true,
        },
        FooterContentArea: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        FooterSalutationSource: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        FromAddress: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        FromName: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        HeaderContentArea: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        HeaderSalutationSource: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        ID: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        IntegratedTracking: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        InteractionObjectID: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        IsMultipart: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            templating: true,
        },
        IsPlatformObject: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            templating: true,
        },
        IsSeedListSend: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        IsSendLogging: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            templating: false,
        },
        IsWrapped: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            templating: true,
        },
        Keyword: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        MessageDeliveryType: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        ModifiedDate: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            templating: false,
        },
        Name: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            templating: true,
        },
        ObjectID: {
            isCreateable: false,
            isUpdateable: true,
            retrieving: false,
            templating: false,
        },
        ObjectState: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        Owner: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        PartnerKey: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        PartnerProperties: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        PreHeader: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        PrivateDomain: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        PrivateIP: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        ReplyToAddress: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        ReplyToDisplayName: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        SeedListOccurance: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'SendClassification.CustomerKey': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            templating: true,
        },
        'SendClassification.ObjectID': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'SendClassification.PartnerKey': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'SendDefinitionList.CustomObjectID': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: false,
            templating: false,
        },
        SendDefinitionList: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            templating: true,
        },
        'SendDefinitionList[].ObjectID': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'SendDefinitionList[].PartnerKey': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'SendDefinitionList[].CustomObjectID': {
            skipValidation: true, // cannot be asked for but will be retrieved
        },
        'SendDefinitionList[].SendDefinitionListType': {
            skipValidation: true, // cannot be asked for but will be retrieved
        },
        'SendDefinitionList[].DataSourceTypeID': {
            skipValidation: true, // cannot be asked for but will be retrieved
        },
        'SendDefinitionList[].IsTestObject': {
            skipValidation: true, // cannot be asked for but will be retrieved
        },
        'SendDefinitionList[].SalesForceObjectID': {
            skipValidation: true, // cannot be asked for but will be retrieved
        },
        'SendDefinitionList[].Name': {
            skipValidation: true, // cannot be asked for but will be retrieved
        },
        'SendDefinitionList[].r__dataExtension_key': {
            skipValidation: true,
        },
        'SendDefinitionList[].List.ObjectID': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'SendDefinitionList[].List.PartnerKey': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'SendDefinitionList[].r__list_PathName': {
            skipValidation: true,
        },
        'SenderProfile.CustomerKey': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            templating: true,
        },
        'SenderProfile.FromAddress': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'SenderProfile.FromName': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'SenderProfile.ObjectID': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        'SenderProfile.PartnerKey': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        SendLimit: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            templating: true,
        },
        SendWindowClose: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            templating: true,
        },
        SendWindowDelete: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        SendWindowOpen: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            templating: true,
        },
        SourceAddressType: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        SuppressTracking: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            templating: true,
        },
        TestEmailAddr: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            templating: true,
        },
        TimeZone: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        TrackingUsers: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            templating: false,
        },
        r__asset_name_readOnly: { skipValidation: true },
        r__asset_key: { skipValidation: true },
        r__email_name: { skipValidation: true },
        r__folder_Path: { skipValidation: true },
        r__senderProfile_key: { skipValidation: true },
        r__sendClassification_key: { skipValidation: true },
        r__deliveryProfile_key: { skipValidation: true },
    },
};
