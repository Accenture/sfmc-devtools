'use strict';

import asset from './metadataTypes/Asset';
import attributeGroup from './metadataTypes/AttributeGroup';
import automation from './metadataTypes/Automation';
import campaign from './metadataTypes/Campaign';
import contentArea from './metadataTypes/ContentArea';
import dataExtension from './metadataTypes/DataExtension';
import dataExtensionField from './metadataTypes/DataExtensionField';
import dataExtensionTemplate from './metadataTypes/DataExtensionTemplate';
import dataExtract from './metadataTypes/DataExtract';
import dataExtractType from './metadataTypes/DataExtractType';
import discovery from './metadataTypes/Discovery';
import email from './metadataTypes/Email';
import emailSend from './metadataTypes/EmailSend';
import event from './metadataTypes/Event';
import fileLocation from './metadataTypes/FileLocation';
import fileTransfer from './metadataTypes/FileTransfer';
import filter from './metadataTypes/Filter';
import folder from './metadataTypes/Folder';
import importFile from './metadataTypes/ImportFile';
import journey from './metadataTypes/Journey';
import list from './metadataTypes/List';
import mobileCode from './metadataTypes/MobileCode';
import mobileKeyword from './metadataTypes/MobileKeyword';
import mobileMessage from './metadataTypes/MobileMessage';
import query from './metadataTypes/Query';
import role from './metadataTypes/Role';
import script from './metadataTypes/Script';
import sendClassification from './metadataTypes/SendClassification';
import setDefinition from './metadataTypes/SetDefinition';
import transactionalEmail from './metadataTypes/TransactionalEmail';
import transactionalPush from './metadataTypes/TransactionalPush';
import transactionalSMS from './metadataTypes/TransactionalSMS';
import triggeredSend from './metadataTypes/TriggeredSend';
import user from './metadataTypes/User';

/**
 * Provides access to all metadataType classes
 */
const MetadataTypeInfo = {
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

export default MetadataTypeInfo;
