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
 * ImportFile MetadataType
 *
 * @augments MetadataType
 */
class FtpLocation extends MetadataType {
    /**
     * Retrieves Metadata of FtpLocation
     * Endpoint /automation/v1/ftplocations/ return all FtpLocations
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise
     */
    static retrieve(retrieveDir, _, __, key) {
        return super.retrieveREST(retrieveDir, '/automation/v1/ftplocations/', null, key);
    }

    /**
     * Retrieves folder metadata into local filesystem. Also creates a uniquePath attribute for each folder.
     *
     * @returns {Promise.<MetadataTypeMapObj>} Promise
     */
    static async retrieveForCache() {
        return super.retrieveREST(null, '/automation/v1/ftplocations/');
    }
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
FtpLocation.definition = MetadataTypeDefinitions.fileLocation;

export default FtpLocation;
