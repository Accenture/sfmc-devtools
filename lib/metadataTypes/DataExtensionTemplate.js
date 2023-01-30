'use strict';

const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');

/**
 * DataExtensionTemplate MetadataType
 *
 * @augments MetadataType
 */
class DataExtensionTemplate extends MetadataType {
    /**
     * Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void} [_] unused parameter
     * @param {void} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of metadata
     */
    static retrieve(retrieveDir, _, __, key) {
        /** @type {TYPE.SoapRequestParams} */
        let requestParams = null;
        if (key) {
            requestParams = {
                filter: {
                    leftOperand: 'CustomerKey',
                    operator: 'equals',
                    rightOperand: key,
                },
            };
        }
        return super.retrieveSOAP(retrieveDir, null, requestParams);
    }
}

// Assign definition to static attributes
DataExtensionTemplate.definition = require('../MetadataTypeDefinitions').dataExtensionTemplate;

module.exports = DataExtensionTemplate;
