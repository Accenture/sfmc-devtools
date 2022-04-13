'use strict';

const MetadataType = require('./MetadataType');

/**
 * DataExtensionTemplate MetadataType
 * @augments MetadataType
 */
class DataExtensionTemplate extends MetadataType {
    /**
     * Construtor method
     * @param {Object} properties General configuration to be used in retrieve
     * @param {auth.BuObject} buObject details of business unit in processing
     * @returns {void}
     */
    constructor(properties, buObject) {
        super(properties, buObject);
        this.definition = require('../MetadataTypeDefinitions').dataExtensionTemplate;
    }
    /**
     * Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     * @param {String} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise<Object>} Promise of metadata
     */
    retrieve(retrieveDir) {
        return super.retrieveSOAP(retrieveDir);
    }
}

module.exports = DataExtensionTemplate;
