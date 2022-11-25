'use strict';

const TYPE = require('../../types/mcdev.d');
const TransactionalMessage = require('./TransactionalMessage');
const Util = require('../util/util');
const cache = require('../util/cache');

/**
 * TransactionalEmail MetadataType
 *
 * @augments TransactionalMessage
 */
class TransactionalEmail extends TransactionalMessage {
    static subType = 'email';

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
                'customerKey'
            );
        }
        // subscriptions: dataExtension
        if (metadata.subscriptions?.dataExtension) {
            // we merely want to be able to show an error if it does not exist
            cache.searchForField(
                'dataExtension',
                metadata.subscriptions.dataExtension,
                'CustomerKey',
                'CustomerKey'
            );
        }
        // subscriptions: list
        if (metadata.subscriptions?.r__list_PathName) {
            metadata.subscriptions.list = {
                ID: cache.getListObjectId(metadata.subscriptions.r__list_PathName, 'CustomerKey'),
            };
            delete metadata.subscriptions.r__list_PathName;
        }

        // journey
        if (metadata.journey?.interactionKey) {
            cache.searchForField('interaction', metadata.journey.interactionKey, 'key', 'key');
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
                    'customerKey'
                );
            } catch (ex) {
                Util.logger.warn(
                    ` - ${this.definition.type} ${metadata[this.definition.nameField]} (${
                        metadata[this.definition.keyField]
                    }): ${ex.message}.`
                );
            }
        }
        // subscriptions: dataExtension
        if (metadata.subscriptions?.dataExtension) {
            try {
                // we merely want to be able to show a warning if it does not exist
                cache.searchForField(
                    'dataExtension',
                    metadata.subscriptions.dataExtension,
                    'CustomerKey',
                    'CustomerKey'
                );
            } catch (ex) {
                Util.logger.warn(
                    ` - ${this.definition.type} ${metadata[this.definition.nameField]} (${
                        metadata[this.definition.keyField]
                    }): ${ex.message}.`
                );
            }
        }
        // subscriptions: list
        if (metadata.subscriptions?.list) {
            try {
                // List
                metadata.subscriptions.r__list_PathName = cache.getListPathName(
                    metadata.subscriptions.list,
                    'CustomerKey'
                );
                delete metadata.subscriptions.list;
            } catch (ex) {
                Util.logger.warn(
                    ` - ${this.definition.type} ${metadata[this.definition.nameField]} (${
                        metadata[this.definition.keyField]
                    }): ${ex.message}.`
                );
            }
        }
        // journey
        if (metadata.journey?.interactionKey) {
            try {
                // we merely want to be able to show a warning if it does not exist
                cache.searchForField('interaction', metadata.journey.interactionKey, 'key', 'key');
            } catch (ex) {
                Util.logger.warn(
                    ` - ${this.definition.type} ${metadata[this.definition.nameField]} (${
                        metadata[this.definition.keyField]
                    }): ${ex.message}.`
                );
            }
        }

        return metadata;
    }
}

// Assign definition to static attributes
TransactionalEmail.definition = require('../MetadataTypeDefinitions').transactionalEmail;

module.exports = TransactionalEmail;
