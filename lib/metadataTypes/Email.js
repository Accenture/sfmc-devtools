'use strict';

const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const cache = require('../util/cache');

/**
 * Email MetadataType
 *
 * @augments MetadataType
 */
class Email extends MetadataType {
    /**
     * Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise<object>} Promise of metadata
     */
    static retrieve(retrieveDir) {
        Util.logger.warn(
            'Classic E-Mails are deprecated and will be discontinued by SFMC in the near future. Ensure that you migrate any existing E-Mails to Content Builder as soon as possible.'
        );
        // !dont activate `await File.initPrettier('html');` as we only want to retrieve for migration and formatting might mess with the outcome
        return super.retrieveSOAP(retrieveDir, null);
    }
    /**
     * manages post retrieve steps
     *
     * @param {object} metadata a single query
     * @returns {object[]} Array with one metadata object and one query string
     */
    static postRetrieveTasks(metadata) {
        return this.parseMetadata(metadata);
    }
    /**
     * parses retrieved Metadata before saving
     *
     * @param {object} metadata a single query activity definition
     * @returns {Array} Array with one metadata object and one sql string
     */
    static parseMetadata(metadata) {
        // folder
        try {
            metadata.r__folder_Path = cache.searchForField(
                'folder',
                metadata.CategoryID,
                'ID',
                'Path'
            );
            delete metadata.CategoryID;
        } catch (ex) {
            Util.logger.warn(
                `Classic E-Mail '${metadata.Name}'/'${metadata.CustomerKey}': ${ex.message}`
            );
        }

        // extract code
        const codeArr = [
            {
                subFolder: null,
                fileName: metadata.CustomerKey,
                fileExt: 'html',
                content: metadata.HTMLBody,
            },
        ];
        delete metadata.HTMLBody;

        return { json: metadata, codeArr: codeArr, subFolder: null };
    }
}

// Assign definition to static attributes
Email.definition = require('../MetadataTypeDefinitions').email;

module.exports = Email;
