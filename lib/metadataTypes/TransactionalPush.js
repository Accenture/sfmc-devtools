'use strict';

import TransactionalMessage from './TransactionalMessage.js';
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
 * TransactionalPush TransactionalMessage
 *
 * @augments TransactionalMessage
 */
class TransactionalPush extends TransactionalMessage {
    static subType = 'push';

    /**
     * prepares for deployment
     *
     * @param {MetadataTypeItem} metadata a single item
     * @returns {Promise.<MetadataTypeItem>} -
     */
    static async preDeployTasks(metadata) {
        // asset
        if (metadata.r__asset_key) {
            // we merely want to be able to show an error if it does not exist
            metadata.content ||= {};
            metadata.content.customerKey = cache.searchForField(
                'asset',
                metadata.r__asset_key,
                'customerKey',
                'customerKey'
            );
            delete metadata.r__asset_key;
        }
        if (metadata.options?.badge && typeof metadata.options?.badge !== 'string') {
            // ensure it's a string, or else the API will return an error. Our SDK turns numbers in strings into actual numbers
            metadata.options.badge += '';
        }

        return metadata;
    }

    /**
     * manages post retrieve steps
     *
     * @param {MetadataTypeItem} metadata a single item
     * @returns {MetadataTypeItem} a single item
     */
    static postRetrieveTasks(metadata) {
        // asset
        if (metadata.content?.customerKey) {
            try {
                // we merely want to be able to show an error if it does not exist
                metadata.r__asset_key = cache.searchForField(
                    'asset',
                    metadata.content.customerKey,
                    'customerKey',
                    'customerKey'
                );
                delete metadata.content;
            } catch (ex) {
                Util.logger.warn(
                    ` - ${this.definition.type} ${metadata[this.definition.nameField]} (${
                        metadata[this.definition.keyField]
                    }): ${ex.message}.`
                );
            }
        }
        if (metadata.options?.badge && typeof metadata.options?.badge !== 'string') {
            // ensure it's a string, or else the API will return an error. Our SDK turns numbers in strings into actual numbers
            metadata.options.badge += '';
        }

        return metadata;
    }
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
TransactionalPush.definition = MetadataTypeDefinitions.transactionalPush;

export default TransactionalPush;
