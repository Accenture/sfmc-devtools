'use strict';

import TYPE from '../../types/mcdev.d.js';
import TransactionalMessage from './TransactionalMessage.js';
import { Util } from '../util/util.js';
import cache from '../util/cache.js';

/**
 * TransactionalEmail MetadataType
 *
 * @augments TransactionalMessage
 */
class TransactionalEmail extends TransactionalMessage {
    static subType = 'email';

    /**
     * Updates a single item
     *
     * @param {TYPE.MetadataTypeItem} metadata how the item shall look after the update
     * @returns {Promise} Promise
     */
    static update(metadata) {
        if (metadata.options?.createJourney) {
            // only send this during create or else we might end up with an unexpected outcome
            Util.logger.warn(
                ` - ${this.definition.type} ${metadata[this.definition.nameField]} (${
                    metadata[this.definition.keyField]
                }): Cannot update journey link during update. If you need to relink this item to a new journey please delete and recreate it.`
            );
            delete metadata.options.createJourney;
        }
        return super.update(metadata);
    }

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
            metadata.subscriptions.list = cache.getListObjectId(
                metadata.subscriptions.r__list_PathName,
                'CustomerKey'
            );
            delete metadata.subscriptions.r__list_PathName;
        }

        // journey
        if (metadata.journey?.interactionKey) {
            // ! update & create enpoints dont accept journey.interactionKey. They only allow to create a new journey
            metadata.options ||= {};
            metadata.options.createJourney = true; // only send this during create or else we might end up with an unexpected outcome
            delete metadata.journey.interactionKey;
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
                cache.searchForField('journey', metadata.journey.interactionKey, 'key', 'key');
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
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
TransactionalEmail.definition = MetadataTypeDefinitions.transactionalEmail;

export default TransactionalEmail;
