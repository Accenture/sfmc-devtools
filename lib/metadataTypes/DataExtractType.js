'use strict';

import MetadataType from './MetadataType.js';

/**
 * @typedef {import('../../types/mcdev.d.js').BuObject} BuObject
 * @typedef {import('../../types/mcdev.d.js').CodeExtract} CodeExtract
 * @typedef {import('../../types/mcdev.d.js').CodeExtractItem} CodeExtractItem
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItem} MetadataTypeItem
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItemDiff} MetadataTypeItemDiff
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItemObj} MetadataTypeItemObj
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMap} MetadataTypeMap
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMapObj} MetadataTypeMapObj
 * @typedef {import('../../types/mcdev.d.js').SoapRequestParams} SoapRequestParams
 * @typedef {import('../../types/mcdev.d.js').TemplateMap} TemplateMap
 */

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
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static retrieve(retrieveDir, _, __, key) {
        return super.retrieveREST(retrieveDir, '/automation/v1/dataextracttypes/', null, key);
    }

    /**
     * Retrieves Metadata of  Data Extract Type for caching.
     *
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static retrieveForCache() {
        return super.retrieveREST(null, '/automation/v1/dataextracttypes/');
    }
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
DataExtractType.definition = MetadataTypeDefinitions.dataExtractType;

export default DataExtractType;
