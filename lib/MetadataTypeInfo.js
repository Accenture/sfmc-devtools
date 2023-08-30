'use strict';

/**
 * Provides access to all metadataType classes
 */
const MetadataTypeInfo = {
    asset: require('./metadataTypes/Asset'),
    attributeGroup: require('./metadataTypes/AttributeGroup'),
    attributeSet: require('./metadataTypes/AttributeSet'),
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
    emailSend: require('./metadataTypes/EmailSend'),
    event: require('./metadataTypes/Event'),
    fileLocation: require('./metadataTypes/FileLocation'),
    fileTransfer: require('./metadataTypes/FileTransfer'),
    filter: require('./metadataTypes/Filter'),
    filterDefinition: require('./metadataTypes/FilterDefinition'),
    filterDefinitionHidden: require('./metadataTypes/FilterDefinitionHidden'),
    folder: require('./metadataTypes/Folder'),
    importFile: require('./metadataTypes/ImportFile'),
    journey: require('./metadataTypes/Journey'),
    list: require('./metadataTypes/List'),
    mobileCode: require('./metadataTypes/MobileCode'),
    mobileKeyword: require('./metadataTypes/MobileKeyword'),
    mobileMessage: require('./metadataTypes/MobileMessage'),
    query: require('./metadataTypes/Query'),
    role: require('./metadataTypes/Role'),
    script: require('./metadataTypes/Script'),
    sendClassification: require('./metadataTypes/SendClassification'),
    transactionalEmail: require('./metadataTypes/TransactionalEmail'),
    transactionalPush: require('./metadataTypes/TransactionalPush'),
    transactionalSMS: require('./metadataTypes/TransactionalSMS'),
    triggeredSend: require('./metadataTypes/TriggeredSend'),
    user: require('./metadataTypes/User'),
    verification: require('./metadataTypes/Verification'),
};

module.exports = MetadataTypeInfo;
