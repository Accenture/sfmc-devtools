'use strict';

import asset from './metadataTypes/definitions/Asset.definition';
import attributeGroup from './metadataTypes/definitions/AttributeGroup.definition';
import automation from './metadataTypes/definitions/Automation.definition';
import campaign from './metadataTypes/definitions/Campaign.definition';
import contentArea from './metadataTypes/definitions/ContentArea.definition';
import dataExtension from './metadataTypes/definitions/DataExtension.definition';
import dataExtensionField from './metadataTypes/definitions/DataExtensionField.definition';
import dataExtensionTemplate from './metadataTypes/definitions/DataExtensionTemplate.definition';
import dataExtract from './metadataTypes/definitions/DataExtract.definition';
import dataExtractType from './metadataTypes/definitions/DataExtractType.definition';
import discovery from './metadataTypes/definitions/Discovery.definition';
import email from './metadataTypes/definitions/Email.definition';
import emailSend from './metadataTypes/definitions/EmailSend.definition';
import event from './metadataTypes/definitions/Event.definition';
import fileLocation from './metadataTypes/definitions/FileLocation.definition';
import fileTransfer from './metadataTypes/definitions/FileTransfer.definition';
import filter from './metadataTypes/definitions/Filter.definition';
import folder from './metadataTypes/definitions/Folder.definition';
import importFile from './metadataTypes/definitions/ImportFile.definition';
import journey from './metadataTypes/definitions/Journey.definition';
import list from './metadataTypes/definitions/List.definition';
import mobileCode from './metadataTypes/definitions/MobileCode.definition';
import mobileKeyword from './metadataTypes/definitions/MobileKeyword.definition';
import mobileMessage from './metadataTypes/definitions/MobileMessage.definition';
import query from './metadataTypes/definitions/Query.definition';
import role from './metadataTypes/definitions/Role.definition';
import script from './metadataTypes/definitions/Script.definition';
import sendClassification from './metadataTypes/definitions/SendClassification.definition';
import setDefinition from './metadataTypes/definitions/SetDefinition.definition';
import transactionalEmail from './metadataTypes/definitions/TransactionalEmail.definition';
import transactionalPush from './metadataTypes/definitions/TransactionalPush.definition';
import transactionalSMS from './metadataTypes/definitions/TransactionalSMS.definition';
import triggeredSend from './metadataTypes/definitions/TriggeredSend.definition';
import user from './metadataTypes/definitions/User.definition';

/**
 * Provides access to all metadataType classes
 */
const MetadataTypeDefinitions = {
    asset,
    attributeGroup,
    automation,
    campaign,
    contentArea,
    dataExtension,
    dataExtensionField,
    dataExtensionTemplate,
    dataExtract,
    dataExtractType,
    discovery,
    email,
    emailSend,
    event,
    fileLocation,
    fileTransfer,
    filter,
    folder,
    importFile,
    journey,
    list,
    mobileCode,
    mobileKeyword,
    mobileMessage,
    query,
    role,
    script,
    sendClassification,
    setDefinition,
    transactionalEmail,
    transactionalPush,
    transactionalSMS,
    triggeredSend,
    user,
};

export default MetadataTypeDefinitions;
