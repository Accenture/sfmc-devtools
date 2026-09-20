'use strict';

import MetadataType from './MetadataType.js';
import { Util } from '../util/util.js';

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
 * MobilePushApp MetadataType
 *
 * @augments MetadataType
 */
class MobilePushApp extends MetadataType {
    /**
     * Retrieves Metadata of Mobile Keywords
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static async retrieve(retrieveDir, _, __, key) {
        if (key && key.startsWith('id:')) {
            // if key starts with id: remove it to be compatible with other legacy API types (MetadataType.postCreateTasks_legacyApi)
            key = key.slice(3);
        }
        try {
            // ! retrieveREST is async; await so a rejected Promise is caught below
            return await super.retrieveREST(
                retrieveDir,
                '/push/v1/application/' + (key || ''),
                null,
                key
            );
        } catch (ex) {
            // if the mobilePushApp key does not exist, the API returns HTTP 400 with body { message: "Validation Error", errorcode: 10006 }; sfmc-sdk surfaces that as RestError.code === 10006. Handle it gracefully instead of aborting the whole retrieve.
            if (key && ex.code === 10006) {
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
     * helper for {@link MetadataType.createREST}
     *
     * @param {MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {object} apiResponse varies depending on the API call
     * @returns {Promise.<object>} apiResponse
     */
    static async postCreateTasks(metadataEntry, apiResponse) {
        await super.postDeployTasks_legacyApi(metadataEntry, apiResponse);

        return apiResponse;
    }

    /**
     * helper for {@link MetadataType.updateREST}
     *
     * @param {MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {object} apiResponse varies depending on the API call
     * @returns {Promise.<object>} apiResponse, potentially modified
     */
    static async postUpdateTasks(metadataEntry, apiResponse) {
        await super.postDeployTasks_legacyApi(metadataEntry, apiResponse);
        return apiResponse;
    }

    /**
     * Delete a metadata item from the specified business unit
     * ! the endpoint expects the ID and not a key but for mcdev in this case key==id
     *
     * @param {string} id Identifier of item
     * @returns {Promise.<boolean>} deletion success status
     */
    // static deleteByKey(id) {
    //     Util.logger.info(
    //         Util.getGrayMsg(
    //             ' - Note: As long as the provided API key once existed, you will not see an error even if the MobilePushApp is already deleted.'
    //         )
    //     );
    //     return super.deleteByKeyREST('/legacy/v1/beta/push/application/' + id, id, 400);
    // }
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
MobilePushApp.definition = MetadataTypeDefinitions.mobilePushApp;

export default MobilePushApp;
