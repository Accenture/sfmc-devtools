'use strict';

const MetadataType = require('./MetadataType');

/**
 * Filter MetadataType
 * @augments MetadataType
 */
class Filter extends MetadataType {
    /**
     * Construtor method
     * @param {Object} properties General configuration to be used in retrieve
     * @param {auth.BuObject} buObject details of business unit in processing
     * @returns {void}
     */
    constructor(properties, buObject) {
        super(properties, buObject);
        this.definition = require('../MetadataTypeDefinitions').filter;
    }
    /**
     * Retrieves Metadata of Filter.
     * Endpoint /automation/v1/filters/ returns all Filters,
     * but only with some of the fields. So it is needed to loop over
     * Filters with the endpoint /automation/v1/filters/{id}
     * @param {String} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise} Promise
     */
    async retrieve(retrieveDir) {
        return super.retrieveREST(retrieveDir, '/automation/v1/filters/', null);
    }
}

module.exports = Filter;
