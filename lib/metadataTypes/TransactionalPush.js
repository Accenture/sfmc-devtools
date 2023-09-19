'use strict';

import TYPE from '../../types/mcdev.d.js';
import TransactionalMessage from './TransactionalMessage.js';
import { Util } from '../util/util.js';
import cache from '../util/cache.js';

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
     * @param {TYPE.MetadataTypeItem} metadata a single item
     * @returns {TYPE.MetadataTypeItem} Promise
     */
    static async preDeployTasks(metadata) {
        // asset
        if (metadata.content?.customerKey) {
            // we merely want to be able to show an error if it does not exist
            cache.searchForField(
                'asset',
                metadata.content.customerKey,
                'customerKey',
                'customerKey',
            );
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
     * @param {TYPE.MetadataTypeItem} metadata a single item
     * @returns {TYPE.MetadataTypeItem} a single item
     */
    static postRetrieveTasks(metadata) {
        // asset
        if (metadata.content?.customerKey) {
            try {
                // we merely want to be able to show an error if it does not exist
                cache.searchForField(
                    'asset',
                    metadata.content.customerKey,
                    'customerKey',
                    'customerKey',
                );
            } catch (ex) {
                Util.logger.warn(
                    ` - ${this.definition.type} ${metadata[this.definition.nameField]} (${
                        metadata[this.definition.keyField]
                    }): ${ex.message}.`,
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
