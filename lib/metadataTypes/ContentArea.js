'use strict';

const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const cache = require('../util/cache');

/**
 * ContentArea MetadataType
 *
 * @augments MetadataType
 */
class ContentArea extends MetadataType {
    /**
     * Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of metadata
     */
    static retrieve(retrieveDir) {
        Util.logger.warn(
            'Classic Content Areas are deprecated and will be discontinued by SFMC in the near future. Ensure that you migrate any existing Content Areas to Content Builder as soon as possible.'
        );
        // !dont activate `await File.initPrettier('html');` as we only want to retrieve for migration and formatting might mess with the outcome
        return super.retrieveSOAP(retrieveDir);
    }
    /**
     * manages post retrieve steps
     *
     * @param {TYPE.MetadataTypeItem} metadata a single item
     * @returns {TYPE.MetadataTypeItem} parsed item
     */
    static postRetrieveTasks(metadata) {
        return this.parseMetadata(metadata);
    }
    /**
     * parses retrieved Metadata before saving
     *
     * @param {TYPE.MetadataTypeItem} metadata a single item
     * @returns {TYPE.MetadataTypeItem} parsed item
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
        } catch (ex) {
            Util.logger.debug(`Classic Content Area '${metadata.CustomerKey}': ${ex.message}`);
            // classic content blocks that reside in the main folder are
            // saved with CategoryID=0, instead of to the actual ID of
            // their parent root folder.
            metadata.r__folder_Path = 'my contents';
        }

        // extract code
        const codeArr = [
            {
                subFolder: null,
                fileName: metadata.CustomerKey,
                fileExt: 'html',
                content: metadata.Content,
            },
        ];
        delete metadata.Content;

        return { json: metadata, codeArr: codeArr, subFolder: null };
    }
}

// Assign definition to static attributes
ContentArea.definition = require('../MetadataTypeDefinitions').contentArea;

module.exports = ContentArea;
