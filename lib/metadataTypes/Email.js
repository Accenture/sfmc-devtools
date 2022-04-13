'use strict';

const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const cache = require('../util/cache');

/**
 * Email MetadataType
 * @augments MetadataType
 */
class Email extends MetadataType {
    /**
     * Construtor method
     * @param {Object} properties General configuration to be used in retrieve
     * @param {auth.BuObject} buObject details of business unit in processing
     * @returns {void}
     */
    constructor(properties, buObject) {
        super(properties, buObject);
        this.definition = require('../MetadataTypeDefinitions').email;
    }
    /**
     * Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     * @param {String} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise<Object>} Promise of metadata
     */
    retrieve(retrieveDir) {
        Util.logger.warn(
            'Classic E-Mails are deprecated and will be discontinued by SFMC in the near future. Ensure that you migrate any existing E-Mails to Content Builder as soon as possible.'
        );
        // !dont activate `await File.initPrettier('html');` as we only want to retrieve for migration and formatting might mess with the outcome
        return super.retrieveSOAP(retrieveDir);
    }
    /**
     * manages post retrieve steps
     * @param {Object} metadata a single query
     * @returns {Object[]} Array with one metadata object and one query string
     */
    postRetrieveTasks(metadata) {
        return this.parseMetadata(metadata);
    }
    /**
     * parses retrieved Metadata before saving
     * @param {Object} metadata a single query activity definition
     * @returns {Array} Array with one metadata object and one sql string
     */
    parseMetadata(metadata) {
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

module.exports = Email;
