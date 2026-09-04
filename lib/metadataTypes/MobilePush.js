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
 * MobilePush MetadataType
 *
 * @augments MetadataType
 */
class MobilePush extends MetadataType {
    /**
     * Retrieves Metadata of Mobile Keywords
     * get all: https://developer.salesforce.com/docs/marketing/marketing-cloud/references/mc_rest_push?meta=Get%2BPush%2BMessages
     * get one: https://developer.salesforce.com/docs/marketing/marketing-cloud/references/mc_rest_push?meta=Get%2Ba%2BPush%2BMessage%2Bby%2BID
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static retrieve(retrieveDir, _, __, key) {
        if (key && key.startsWith('id:')) {
            // if key starts with id: remove it to be compatible with other legacy API types (MetadataType.postCreateTasks_legacyApi)
            key = key.slice(3);
        }
        try {
            // ! the endpoint expects the ID and not a key but for mcdev in this case key==id
            return super.retrieveREST(retrieveDir, '/push/v1/message/' + (key || ''), null, key);
        } catch (ex) {
            // if the mobilePush does not exist, the API returns the error "Request failed with status code 400 (ERR_BAD_REQUEST)" which would otherwise bring execution to a hold
            if (key && ex.code === 'ERR_BAD_REQUEST') {
                Util.logger.info(
                    `Downloaded: ${this.definition.type} (0)${Util.getKeysString(key)}`
                );
                this.postDeleteTasks(key);
            } else {
                throw ex;
            }
        }
        return;
    }

    /**
     * Retrieves event definition metadata for caching
     *
     * @param {void | string[]} [_] parameter not used
     * @param {void | string[]} [__] parameter not used
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static retrieveForCache(_, __, key) {
        return this.retrieve(null, null, null, key);
    }

    /**
     * Updates a single item
     * docs: https://developer.salesforce.com/docs/marketing/marketing-cloud/references/mc_rest_push?meta=Update%2Ba%2BPush%2BMessage
     *
     * @param {MetadataTypeItem} metadata a single item
     * @returns {Promise} Promise
     */
    static update(metadata) {
        // ! the endpoint expects the ID and not a key but for mcdev in this case key==id
        return super.updateREST(
            metadata,
            '/push/v1/message/' + metadata[this.definition.idField],
            'put' // upsert API, put for insert and update!
        );
    }

    /**
     * Creates a single item
     * docs: https://developer.salesforce.com/docs/marketing/marketing-cloud/references/mc_rest_push?meta=Create%2Ba%2BPush%2BMessage
     *
     * @param {MetadataTypeItem} metadata a single item
     * @returns {Promise} Promise
     */
    static create(metadata) {
        return super.createREST(metadata, '/push/v1/message/');
    }

    /**
     * manages post retrieve steps
     * field definitions: https://developer.salesforce.com/docs/marketing/marketing-cloud/references/mc_rest_push?meta=Get%2Ba%2BPush%2BMessage%2Bby%2BID
     *
     * @param {MetadataTypeItem} metadata a single query
     * @returns {MetadataTypeItem} Array with one metadata object and one query string
     */
    static postRetrieveTasks(metadata) {
        // mobile application
        if (metadata.application?.id) {
            try {
                metadata.r__mobilePushApp_key = cache.searchForField(
                    'mobileApplication',
                    metadata.application.id,
                    'id',
                    'id'
                );
                delete metadata.application;
            } catch {
                Util.logger.warn(
                    `Could not find mobileApplication with id ${metadata.application.id} for mobilePush ${metadata.name} (${metadata.id}).`
                );
            }
        }
        // asset
        if (metadata.assetId) {
            try {
                metadata.r__asset_key = cache.searchForField(
                    'asset',
                    metadata.assetId,
                    'id',
                    'customerKey'
                );
                delete metadata.assetId;
            } catch {
                Util.logger.warn(
                    `Could not find asset with id ${metadata.assetId} for mobilePush ${metadata.name} (${metadata.id}).`
                );
            }
        }

        // messageType
        // 1 (outbound=push), 3 (location entry), 4 (location exit), 5 (beacon), 7 (inapp) or 8 (inbox)
        try {
            metadata.c__messageType = Util.inverseGet(
                this.definition.messageTypeMapping,
                metadata.messageType
            );
            delete metadata.messageType;
        } catch {
            Util.logger.warn(
                `Could not find messageType ${metadata.messageType} for mobilePush ${metadata.name} (${metadata.id}).`
            );
        }

        // contentType
        // 1 (alert), 2 (inbox), and 3 (inbox and alert)
        try {
            metadata.c__contentType = Util.inverseGet(
                this.definition.contentTypeMapping,
                metadata.contentType
            );
            delete metadata.contentType;
        } catch {
            if (metadata.contentType !== 0 && metadata.contentType !== 5) {
                // ! weirdly, we saw contentType 0 and 5 in the wild, which is not documented in the API docs.  log a warning.
                Util.logger.warn(
                    `Could not find contentType ${metadata.contentType} for mobilePush ${metadata.name} (${metadata.id}).`
                );
            }
        }

        // tzPastSendAction
        // 0=send immediately, 1 (send immediately), 2 (send at scheduled time on the next day), or 3 (never send)
        try {
            metadata.c__tzPastSendAction = Util.inverseGet(
                this.definition.tzPastSendActionMapping,
                metadata.tzPastSendAction
            );
            delete metadata.tzPastSendAction;
        } catch {
            Util.logger.warn(
                `Could not find tzPastSendAction ${metadata.tzPastSendAction} for mobilePush ${metadata.name} (${metadata.id}).`
            );
        }

        // sendInitiator
        // Possible values: 0 (UI-based send), 1 (API), 2 (automation), or 3 (Journey Builder)
        try {
            metadata.c__sendInitiator = Util.inverseGet(
                this.definition.sendInitiatorMapping,
                metadata.sendInitiator
            );
            delete metadata.sendInitiator;
        } catch {
            Util.logger.warn(
                `Could not find sendInitiator ${metadata.sendInitiator} for mobilePush ${metadata.name} (${metadata.id}).`
            );
        }

        // status
        //  Possible values: 1 (draft), 2 (active), 3 (inactive), or 4 (deleted).
        try {
            metadata.c__status = Util.inverseGet(this.definition.statusMapping, metadata.status);
            delete metadata.status;
        } catch {
            Util.logger.warn(
                `Could not find status ${metadata.status} for mobilePush ${metadata.name} (${metadata.id}).`
            );
        }

        // TODO: advanceInboxSendType

        return metadata;
    }

    /**
     * prepares an event definition for deployment
     *
     * @param {MetadataTypeItem} metadata a single MobilePush
     * @returns {Promise.<MetadataTypeItem>} Promise
     */
    static async preDeployTasks(metadata) {
        if (metadata.r__mobilePushApp_key) {
            const mobileApplication = cache.getByKey(
                'mobileApplication',
                metadata.r__mobilePushApp_key
            );
            if (!mobileApplication) {
                throw new Error(
                    `mobileApplication ${metadata.r__mobilePushApp_key} not found in cache`
                );
            }
            metadata.application = mobileApplication;

            delete metadata.r__mobilePushApp_key;
        }

        if (metadata.r__asset_key) {
            metadata.assetId = cache.searchForField(
                'asset',
                metadata.r__asset_key,
                'customerKey',
                'id'
            );
            delete metadata.r__asset_key;
        }
        if (metadata.c__messageType) {
            metadata.messageType = this.definition.messageTypeMapping[metadata.c__messageType];
        }
        if (metadata.c__contentType) {
            metadata.contentType = this.definition.contentTypeMapping[metadata.c__contentType];
        }
        if (metadata.c__tzPastSendAction) {
            metadata.tzPastSendAction =
                this.definition.tzPastSendActionMapping[metadata.c__tzPastSendAction];
        }
        if (metadata.c__sendInitiator) {
            metadata.sendInitiator =
                this.definition.sendInitiatorMapping[metadata.c__sendInitiator];
        }
        if (metadata.c__status) {
            metadata.status = this.definition.statusMapping[metadata.c__status];
        }
        return metadata;
    }

    /**
     * helper for {@link MetadataType.createREST}
     *
     * @param {MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {object} apiResponse varies depending on the API call
     * @returns {Promise.<object>} apiResponse
     */
    // static async postCreateTasks(metadataEntry, apiResponse) {
    //     await super.postDeployTasks_legacyApi(metadataEntry, apiResponse);

    //     return apiResponse;
    // }

    /**
     * helper for {@link MetadataType.updateREST}
     *
     * @param {MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {object} apiResponse varies depending on the API call
     * @returns {Promise.<object>} apiResponse, potentially modified
     */
    // static async postUpdateTasks(metadataEntry, apiResponse) {
    //     await super.postDeployTasks_legacyApi(metadataEntry, apiResponse);
    //     return apiResponse;
    // }

    /**
     * Delete a metadata item from the specified business unit
     * ! the endpoint expects the ID and not a key but for mcdev in this case key==id
     *
     * @param {string} id Identifier of item
     * @returns {Promise.<boolean>} deletion success status
     */
    static deleteByKey(id) {
        Util.logger.info(
            Util.getGrayMsg(
                ' - Note: As long as the provided API key once existed, you will not see an error even if the mobilePush is already deleted.'
            )
        );
        return super.deleteByKeyREST('/push/v1/message/' + id, id, 400);
    }
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
MobilePush.definition = MetadataTypeDefinitions.mobilePush;

export default MobilePush;
