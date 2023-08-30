'use strict';

/**
 * Provides access to all metadataType classes
 */
const MetadataTypeDefinitions = {
    asset: require('./metadataTypes/definitions/Asset.definition'),
    attributeGroup: require('./metadataTypes/definitions/AttributeGroup.definition'),
    attributeSet: require('./metadataTypes/definitions/AttributeSet.definition'),
    automation: require('./metadataTypes/definitions/Automation.definition'),
    campaign: require('./metadataTypes/definitions/Campaign.definition'),
    contentArea: require('./metadataTypes/definitions/ContentArea.definition'),
    dataExtension: require('./metadataTypes/definitions/DataExtension.definition'),
    dataExtensionField: require('./metadataTypes/definitions/DataExtensionField.definition'),
    dataExtensionTemplate: require('./metadataTypes/definitions/DataExtensionTemplate.definition'),
    dataExtract: require('./metadataTypes/definitions/DataExtract.definition'),
    dataExtractType: require('./metadataTypes/definitions/DataExtractType.definition'),
    discovery: require('./metadataTypes/definitions/Discovery.definition'),
    email: require('./metadataTypes/definitions/Email.definition'),
    emailSend: require('./metadataTypes/definitions/EmailSend.definition'),
    event: require('./metadataTypes/definitions/Event.definition'),
    fileLocation: require('./metadataTypes/definitions/FileLocation.definition'),
    fileTransfer: require('./metadataTypes/definitions/FileTransfer.definition'),
    filter: require('./metadataTypes/definitions/Filter.definition'),
    filterDefinition: require('./metadataTypes/definitions/FilterDefinition.definition'),
    filterDefinitionHidden: require('./metadataTypes/definitions/FilterDefinitionHidden.definition'),
    folder: require('./metadataTypes/definitions/Folder.definition'),
    importFile: require('./metadataTypes/definitions/ImportFile.definition'),
    journey: require('./metadataTypes/definitions/Journey.definition'),
    list: require('./metadataTypes/definitions/List.definition'),
    mobileCode: require('./metadataTypes/definitions/MobileCode.definition'),
    mobileKeyword: require('./metadataTypes/definitions/MobileKeyword.definition'),
    mobileMessage: require('./metadataTypes/definitions/MobileMessage.definition'),
    query: require('./metadataTypes/definitions/Query.definition'),
    role: require('./metadataTypes/definitions/Role.definition'),
    script: require('./metadataTypes/definitions/Script.definition'),
    sendClassification: require('./metadataTypes/definitions/SendClassification.definition'),
    transactionalEmail: require('./metadataTypes/definitions/TransactionalEmail.definition'),
    transactionalPush: require('./metadataTypes/definitions/TransactionalPush.definition'),
    transactionalSMS: require('./metadataTypes/definitions/TransactionalSMS.definition'),
    triggeredSend: require('./metadataTypes/definitions/TriggeredSend.definition'),
    user: require('./metadataTypes/definitions/User.definition'),
    verification: require('./metadataTypes/definitions/Verification.definition'),
};

module.exports = MetadataTypeDefinitions;
