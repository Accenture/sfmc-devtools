'use strict';

import asset from './metadataTypes/Asset.js';
import attributeGroup from './metadataTypes/AttributeGroup.js';
import attributeSet from './metadataTypes/AttributeSet.js';
import automation from './metadataTypes/Automation.js';
import campaign from './metadataTypes/Campaign.js';
import contentArea from './metadataTypes/ContentArea.js';
import dataExtension from './metadataTypes/DataExtension.js';
import dataExtensionField from './metadataTypes/DataExtensionField.js';
import dataExtensionTemplate from './metadataTypes/DataExtensionTemplate.js';
import dataExtract from './metadataTypes/DataExtract.js';
import dataExtractType from './metadataTypes/DataExtractType.js';
import discovery from './metadataTypes/Discovery.js';
import email from './metadataTypes/Email.js';
import emailSend from './metadataTypes/EmailSend.js';
import event from './metadataTypes/Event.js';
import fileLocation from './metadataTypes/FileLocation.js';
import fileTransfer from './metadataTypes/FileTransfer.js';
import filter from './metadataTypes/Filter.js';
import folder from './metadataTypes/Folder.js';
import importFile from './metadataTypes/ImportFile.js';
import journey from './metadataTypes/Journey.js';
import list from './metadataTypes/List.js';
import mobileCode from './metadataTypes/MobileCode.js';
import mobileKeyword from './metadataTypes/MobileKeyword.js';
import mobileMessage from './metadataTypes/MobileMessage.js';
import query from './metadataTypes/Query.js';
import role from './metadataTypes/Role.js';
import script from './metadataTypes/Script.js';
import sendClassification from './metadataTypes/SendClassification.js';
import transactionalEmail from './metadataTypes/TransactionalEmail.js';
import transactionalPush from './metadataTypes/TransactionalPush.js';
import transactionalSMS from './metadataTypes/TransactionalSMS.js';
import triggeredSend from './metadataTypes/TriggeredSend.js';
import user from './metadataTypes/User.js';
import verification from './metadataTypes/Verification.js';

/**
 * Provides access to all metadataType classes
 */
const MetadataTypeInfo = {
    asset,
    attributeGroup,
    attributeSet,
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
    transactionalEmail,
    transactionalPush,
    transactionalSMS,
    triggeredSend,
    user,
    verification,
};

export default MetadataTypeInfo;
