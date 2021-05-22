'use strict';

/**
 * Provides access to all metadataType details
 */
const MetadataTypeInfo = {};
const MetadataTypeDefinition = {};
const supportedTypes = [
    'Asset',
    'AttributeGroup',
    'Campaign',
    'ContentArea',
    'DataExtension',
    'DataExtensionField',
    'DataExtensionTemplate',
    'DataExtract',
    'DataExtractType',
    'Discovery',
    'Email',
    'EmailSendDefinition',
    'EventDefinition',
    'Discovery',
    'FileTransfer',
    'Filter',
    'Folder',
    'FtpLocation',
    'ImportFile',
    'Interaction',
    'List',
    'Query',
    'Role',
    'Script',
    'SetDefinition',
    'TriggeredSendDefinition',
];

exports.getType = (type) => {
    if (!MetadataTypeInfo[type]) {
        MetadataTypeInfo[type] = require('./types/' + type);
        MetadataTypeInfo[type].definition = this.getDefinition(type);
    }
    return MetadataTypeInfo[type];
};

exports.getDefinition = (type) => {
    if (!MetadataTypeDefinition[type]) {
        MetadataTypeDefinition[type] = require('./definitions/' + type + '.definition');
    }
    return MetadataTypeDefinition[type];
};
exports.getTypes = () => supportedTypes.map(this.getType);
exports.getDefinitions = () => supportedTypes.map(this.getDefinition);
