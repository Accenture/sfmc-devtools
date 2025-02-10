'use strict';

import TransactionalMessage from './TransactionalMessage.js';
import Journey from './Journey.js';
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
 * TransactionalEmail MetadataType
 *
 * @augments TransactionalMessage
 */
class TransactionalEmail extends TransactionalMessage {
    static subType = 'email';
    /** @type {Array} */
    static _createdJourneyKeys;

    /**
     * Updates a single item
     *
     * @param {MetadataTypeItem} metadata how the item shall look after the update
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
     * Updates a single item
     *
     * @param {MetadataTypeItem} metadata how the item shall look after the update
     * @returns {Promise} Promise
     */
    static create(metadata) {
        if (metadata.definitionType === 'Transactional' && metadata.channel === 'email') {
            // only send this during create or else we might end up with an unexpected outcome
            Util.logger.warn(
                ` - ${this.definition.type} ${metadata[this.definition.nameField]} (${
                    metadata[this.definition.keyField]
                }): While possible, it is not recommended to create transactional journeys via transactionalEmail. Instead, create the journey and then publish it (mcdev deploy cred/bu journey --publish)`
            );
        }
        return super.create(metadata);
    }

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
            metadata.content = {
                customerKey: cache.searchForField(
                    'asset',
                    metadata.r__asset_key,
                    'customerKey',
                    'customerKey'
                ),
            };
            delete metadata.r__asset_key;
        }
        // subscriptions: dataExtension
        if (metadata.subscriptions?.r__dataExtension_key) {
            // we merely want to be able to show an error if it does not exist
            metadata.subscriptions.dataExtension = cache.searchForField(
                'dataExtension',
                metadata.subscriptions.r__dataExtension_key,
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
        // ! update & create enpoints dont accept journey.interactionKey. They only allow to create a new journey
        metadata.options ||= {};
        metadata.options.createJourney = true; // only send this during create or else we might end up with an unexpected outcome

        // subscriptions: sendClassification
        if (metadata.r__sendClassification_key) {
            // we merely want to be able to show an error if it does not exist
            metadata.classification = cache.searchForField(
                'sendClassification',
                metadata.r__sendClassification_key,
                'CustomerKey',
                'CustomerKey'
            );
            delete metadata.r__sendClassification_key;
        }

        return metadata;
    }

    /**
     * helper for {@link TransactionalEmail.createREST}
     *
     * @param {MetadataTypeItem} _ not used
     * @param {object} apiResponse varies depending on the API call
     * @returns {Promise.<object>} apiResponse
     */
    static async postCreateTasks(_, apiResponse) {
        if (apiResponse.journey?.interactionKey) {
            Util.logger.warn(
                ` - created journey: ${apiResponse.journey.interactionKey} (auto-created when ${this.definition.type} ${apiResponse.definitionKey} was created)`
            );
            // when we create new transactionalEmails, we should also download the new journey that was created with it
            this._createdJourneyKeys ||= [];
            this._createdJourneyKeys.push(apiResponse.journey?.interactionKey);

            // do what postRetrieveTasks won't be able to do without spending lots of time on caching
            apiResponse.r__journey_key = apiResponse.journey.interactionKey;
            delete apiResponse.journey;
        }

        return apiResponse;
    }

    /**
     * Gets executed after deployment of metadata type
     *
     * @returns {Promise.<void>} -
     */
    static async postDeployTasks() {
        if (this._createdJourneyKeys?.length) {
            Util.logger.warn(
                `Please download related journeys via: mcdev retrieve ${this.buObject.credential}/${this.buObject.businessUnit} -m
                ${this._createdJourneyKeys.map((el) => `"journey:${el}"`).join(' ')}`
            );
        }
        delete this._createdJourneyKeys;
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
            metadata.r__asset_key = metadata.content.customerKey;
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
            delete metadata.content;
        }

        // subscriptions: dataExtension
        if (metadata.subscriptions?.dataExtension) {
            metadata.subscriptions.r__dataExtension_key = metadata.subscriptions.dataExtension;
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
            delete metadata.subscriptions.dataExtension;
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
            metadata.r__journey_key = metadata.journey.interactionKey;
            try {
                // we merely want to be able to show a warning if it does not exist
                metadata.r__journey_key = cache.searchForField(
                    'journey',
                    metadata.journey.interactionKey,
                    'key',
                    'key'
                );
            } catch (ex) {
                Util.logger.warn(
                    ` - ${this.definition.type} ${metadata[this.definition.nameField]} (${
                        metadata[this.definition.keyField]
                    }): ${ex.message}.`
                );
            }
            delete metadata.journey;
        }
        // sendClassification
        if (metadata.classification) {
            metadata.r__sendClassification_key = metadata.classification;
            try {
                // we merely want to be able to show a warning if it does not exist
                metadata.r__sendClassification_key = cache.searchForField(
                    'sendClassification',
                    metadata.classification,
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
            delete metadata.classification;
        }

        return metadata;
    }

    /**
     * Delete a metadata item from the specified business unit
     *
     * @param {string} key Identifier of item
     * @returns {Promise.<boolean>} deletion success status
     */
    static async deleteByKey(key) {
        const metadataMapObj = await this.retrieveForCache(null, null, key);
        const journeyKey = metadataMapObj?.metadata?.[key]?.journey?.interactionKey;

        const isDeleted = await super.deleteByKeyREST(
            '/messaging/v1/' + this.subType + '/definitions/' + key,
            key,
            false
        );
        if (isDeleted && journeyKey) {
            Util.logger.info(
                ` - deleted ${Journey.definition.type}: ${journeyKey} (SFMC auto-deletes the related journey of ${this.definition.type} ${key})`
            );
            Journey.buObject = this.buObject;
            Journey.properties = this.properties;
            Journey.client = this.client;
            Journey.postDeleteTasks(journeyKey);
        }
        return isDeleted;
    }
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
TransactionalEmail.definition = MetadataTypeDefinitions.transactionalEmail;

export default TransactionalEmail;
