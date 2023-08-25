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
        if (metadata.r__asset_customerKey) {
            // we merely want to be able to show an error if it does not exist
            metadata.content = {
                customerKey: cache.searchForField(
                    'asset',
                    metadata.r__asset_customerKey,
                    'customerKey',
                    'customerKey'
                ),
            };
            delete metadata.r__asset_customerKey;
        }
        // subscriptions: dataExtension
        if (metadata.subscriptions?.r__dataExtension_CustomerKey) {
            // we merely want to be able to show an error if it does not exist
            metadata.subscriptions.dataExtension = cache.searchForField(
                'dataExtension',
                metadata.subscriptions.r__dataExtension_CustomerKey,
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

        return metadata;
    }
    /**
     * helper for {@link TransactionalEmail.createREST}
     *
     * @param {TYPE.MetadataTypeItem} _ not used
     * @param {object} apiResponse varies depending on the API call
     * @returns {void}
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
    }
    /**
     * Gets executed after deployment of metadata type
     *
     * @returns {void}
     */
    static postDeployTasks() {
        if (this._createdJourneyKeys?.length) {
            Util.logger.warn(
                `Please download related journeys via: mcdev r ${this.buObject.credential}/${
                    this.buObject.businessUnit
                } journey "${this._createdJourneyKeys.join(',')}"`
            );
        }
        delete this._createdJourneyKeys;
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
            metadata.r__asset_customerKey = metadata.content.customerKey;
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
            try {
                // we merely want to be able to show a warning if it does not exist
                metadata.subscriptions.r__dataExtension_CustomerKey = cache.searchForField(
                    'dataExtension',
                    metadata.subscriptions.dataExtension,
                    'CustomerKey',
                    'CustomerKey'
                );
                delete metadata.subscriptions.dataExtension;
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

        return metadata;
    }
    /**
     * Delete a metadata item from the specified business unit
     *
     * @param {string} key Identifier of item
     * @returns {Promise.<boolean>} deletion success status
     */
    static async deleteByKey(key) {
        const metadataMapObj = await this.retrieveForCache(key);
        const journeyKey = metadataMapObj?.metadata?.[key]?.journey?.interactionKey;

        const isDeleted = await super.deleteByKeyREST(
            '/messaging/v1/' + this.subType + '/definitions/' + key,
            key,
            false
        );
        if (isDeleted && journeyKey) {
            const Journey = require('./Journey');
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
TransactionalEmail.definition = require('../MetadataTypeDefinitions').transactionalEmail;

module.exports = TransactionalEmail;
