'use strict';

const MetadataType = require('./MetadataType');

/**
 * Filter MetadataType
 * @augments MetadataType
 */
class Filter extends MetadataType {
    /**
     * Retrieves Metadata of Filter.
     * Endpoint /automation/v1/filters/ returns all Filters,
     * but only with some of the fields. So it is needed to loop over
     * Filters with the endpoint /automation/v1/filters/{id}
     * @param {String} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise} Promise
     */
    static async retrieve(retrieveDir) {
        return super.retrieveREST(retrieveDir, '/automation/v1/filters/', null);
    }
}

// Assign definition to static attributes
Filter.definition = require('../MetadataTypeDefinitions').filter;

module.exports = Filter;
