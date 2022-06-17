'use strict';

const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');

/**
 * DataExtractType MetadataType
 * Only for Caching No retrieve/upsert is required
 * as this is a configuration in the EID
 *
 * @augments MetadataType
 */
class DataExtractType extends MetadataType {
    /**
     * Retrieves Metadata of  Data Extract Type.
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void} [_] unused parameter
     * @param {void} [__] unused parameter
     * @param {void} [___] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of metadata
     */
    static retrieve(retrieveDir, _, __, ___, key) {
        return super.retrieveREST(retrieveDir, '/automation/v1/dataextracttypes/', null, null, key);
    }
    /**
     * Retrieves Metadata of  Data Extract Type for caching.
     *
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of metadata
     */
    static retrieveForCache() {
        return super.retrieveREST(null, '/automation/v1/dataextracttypes/');
    }
}

// Assign definition to static attributes
DataExtractType.definition = require('../MetadataTypeDefinitions').dataExtractType;

module.exports = DataExtractType;
