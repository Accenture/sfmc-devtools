'use strict';

const MetadataType = require('./MetadataType');

/**
 * DataExtensionTemplate MetadataType
 * @augments MetadataType
 */
class DataExtensionTemplate extends MetadataType {
    /**
     * Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     * @param {String} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise<Object>} Promise of metadata
     */
    static retrieve(retrieveDir) {
        return super.retrieveSOAP(retrieveDir);
    }
}

// Assign definition to static attributes
DataExtensionTemplate.definition = require('../MetadataTypeDefinitions').dataExtensionTemplate;

module.exports = DataExtensionTemplate;
