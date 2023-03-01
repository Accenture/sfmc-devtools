'use strict';

/**
 * Provides access to all metadataType classes
 */
const MetadataTypeInfo = {
    accountUser: require('./metadataTypes/AccountUser'),
    asset: require('./metadataTypes/Asset'),
    attributeGroup: require('./metadataTypes/AttributeGroup'),
    attributeSetDefinition: require('./metadataTypes/AttributeSetDefinition'),
    automation: require('./metadataTypes/Automation'),
    campaign: require('./metadataTypes/Campaign'),
    contentArea: require('./metadataTypes/ContentArea'),
    dataExtension: require('./metadataTypes/DataExtension'),
    dataExtensionField: require('./metadataTypes/DataExtensionField'),
    dataExtensionTemplate: require('./metadataTypes/DataExtensionTemplate'),
    dataExtract: require('./metadataTypes/DataExtract'),
    dataExtractType: require('./metadataTypes/DataExtractType'),
    discovery: require('./metadataTypes/Discovery'),
    email: require('./metadataTypes/Email'),
    emailSendDefinition: require('./metadataTypes/EmailSendDefinition'),
    eventDefinition: require('./metadataTypes/EventDefinition'),
    fileTransfer: require('./metadataTypes/FileTransfer'),
    filter: require('./metadataTypes/Filter'),
    folder: require('./metadataTypes/Folder'),
    ftpLocation: require('./metadataTypes/FtpLocation'),
    importFile: require('./metadataTypes/ImportFile'),
    interaction: require('./metadataTypes/Interaction'),
    list: require('./metadataTypes/List'),
    mobileCode: require('./metadataTypes/MobileCode'),
    mobileKeyword: require('./metadataTypes/MobileKeyword'),
    query: require('./metadataTypes/Query'),
    role: require('./metadataTypes/Role'),
    script: require('./metadataTypes/Script'),
    sendClassification: require('./metadataTypes/SendClassification'),
    transactionalEmail: require('./metadataTypes/TransactionalEmail'),
    transactionalPush: require('./metadataTypes/TransactionalPush'),
    transactionalSMS: require('./metadataTypes/TransactionalSMS'),
    triggeredSendDefinition: require('./metadataTypes/TriggeredSendDefinition'),
};

module.exports = MetadataTypeInfo;
