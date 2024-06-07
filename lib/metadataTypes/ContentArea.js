'use strict';

import MetadataType from './MetadataType.js';
import { Util } from '../util/util.js';
import cache from '../util/cache.js';

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
 * ContentArea MetadataType
 *
 * @augments MetadataType
 */
class ContentArea extends MetadataType {
    /**
     * Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static retrieve(retrieveDir, _, __, key) {
        Util.logger.warn(
            ' - Classic Content Areas are deprecated and will be discontinued by SFMC in the near future. Ensure that you migrate any existing Content Areas to Content Builder as soon as possible.'
        );
        /** @type {SoapRequestParams} */
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
        // !dont activate `await File.initPrettier('html');` as we only want to retrieve for migration and formatting might mess with the outcome
        return super.retrieveSOAP(retrieveDir, requestParams, key);
    }
    /**
     * generic script that retrieves the folder path from cache and updates the given metadata with it after retrieve
     *
     * @param {MetadataTypeItem} metadata a single script activity definition
     */
    static setFolderPath(metadata) {
        try {
            metadata.r__folder_Path = cache.searchForField(
                'folder',
                metadata[this.definition.folderIdField],
                'ID',
                'Path'
            );
            delete metadata[this.definition.folderIdField];
        } catch (ex) {
            Util.logger.debug(
                ` - ${this.definition.type} '${metadata[this.definition.nameField]}' (${
                    metadata[this.definition.keyField]
                }): Could not find folder (${ex.message})`
            );
            // classic content blocks that reside in the main folder are
            // saved with CategoryID=0, instead of to the actual ID of
            // their parent root folder.
            metadata.r__folder_Path = 'my contents';
        }
    }
    /**
     * parses retrieved Metadata before saving
     *
     * @param {MetadataTypeItem} metadata a single item
     * @returns {MetadataTypeItem} parsed item
     */
    static postRetrieveTasks(metadata) {
        // folder
        this.setFolderPath(metadata);

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
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
ContentArea.definition = MetadataTypeDefinitions.contentArea;

export default ContentArea;
