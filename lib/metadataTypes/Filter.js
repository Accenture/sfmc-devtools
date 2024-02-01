'use strict';

import TYPE from '../../types/mcdev.d.js';
import MetadataType from './MetadataType.js';

/**
 * Filter MetadataType
 *
 * @augments MetadataType
 */
class Filter extends MetadataType {
    /**
     * Retrieves Metadata of Filter.
     * Endpoint /automation/v1/filters/ returns all Filters,
     * but only with some of the fields. So it is needed to loop over
     * Filters with the endpoint /automation/v1/filters/{id}
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void} [_] unused parameter
     * @param {void} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise
     */
    static async retrieve(retrieveDir, _, __, key) {
        return super.retrieveREST(retrieveDir, '/automation/v1/filters/', null, key);
    }
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
Filter.definition = MetadataTypeDefinitions.filter;

export default Filter;
