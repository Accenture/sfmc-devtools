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
                metadata.r__mobileApplication_key = cache.searchForField(
                    'mobileApplication',
                    metadata.application.id,
                    'key',
                    'key'
                );
                // ! key and id are somehow switched when we retrieve mobileApplication vs how its stored on mobilePush! need to make sure we also switch it in pre-deploy steps
                delete metadata.application;
            } catch (ex) {
                Util.logger.warn(
                    `Could not find mobileApplication with id ${metadata.application.id} for mobilePush ${metadata.name}. This mobilePush will be retrieved without reference to a mobileApplication. Error details: ${ex}`
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
            } catch (ex) {
                Util.logger.warn(
                    `Could not find asset with id ${metadata.assetId} for mobilePush ${metadata.name}. This mobilePush will be retrieved without reference to an asset. Error details: ${ex}`
                );
            }
        }

        // TODO: messageType
        // 1 (outbound=push), 3 (location entry), 4 (location exit), 5 (beacon), 7 (inapp) or 8 (inbox)

        // TODO: contentType
        // 1 (alert), 2 (inbox), and 3 (inbox and alert)

        // TODO: tzPastSendAction
        // 0=send immediately, 1 (send immediately), 2 (send at scheduled time on the next day), or 3 (never send)

        // TODO: sendInitiator
        // TODO: status
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
        // TODO mirror what was done in postRetrieveTasks
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
