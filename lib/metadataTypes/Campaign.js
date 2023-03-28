'use strict';

const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const File = require('../util/file');

/**
 * Campaign MetadataType
 *
 * @augments MetadataType
 */
class Campaign extends MetadataType {
    /**
     * Retrieves Metadata of campaigns. Afterwards, starts metadata retrieval for their campaign assets
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void} [_] unused parameter
     * @param {void} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise
     */
    static async retrieve(retrieveDir, _, __, key) {
        this.upgradeGetBulk();
        const res = await super.retrieveREST(
            retrieveDir,
            '/legacy/v1/beta2/data/campaign/',
            null,
            key
        );
        // get assignments
        Util.logger.info(`Retrieving: campaignAsset`);
        const campaignAssets = await Promise.all(
            Object.keys(res.metadata).map((key) =>
                this.getAssetTags(retrieveDir, res.metadata[key].campaignId, key)
            )
        );
        Util.logger.info(
            `Downloaded: campaignAsset (${campaignAssets.flat().length})` + Util.getKeysString(key)
        );

        return res;
    }
    /**
     * Retrieves event definition metadata for caching
     *
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of metadata
     */
    static retrieveForCache() {
        this.upgradeGetBulk();
        return super.retrieveREST(null, '/legacy/v1/beta2/data/campaign/');
    }
    /**
     * helper for {@link MobileMessage.retrieve} and {@link MobileMessage.retrieveForCache}
     */
    static upgradeGetBulk() {
        this.getBulkBackup ||= this.client.rest.getBulk;
        this.client.rest.getBulk = this.getBulkForLegacyApi.bind(this.client.rest);
    }

    /**
     * Method that makes paginated GET API Requests using $pageSize and $page parameters
     * TODO: remove before release in favor of upgrading SFMC-SDK
     *
     * @param {string} url of the resource to retrieve
     * @param {number} [pageSize] of the response, defaults to 50
     * @param {'items'|'definitions'|'entry'} [iteratorField] attribute of the response to iterate over
     * @returns {Promise.<object>} API response combined items
     */
    static async getBulkForLegacyApi(url, pageSize, iteratorField) {
        let page = 1;
        const baseUrl = url.split('?')[0];
        const isTransactionalMessageApi = this.isTransactionalMessageApi(baseUrl);
        const isLegacyApi = baseUrl && baseUrl.startsWith('/legacy/v1/');
        const queryParams = new URLSearchParams(url.split('?')[1]);
        let collector;
        let shouldPaginate = false;
        let pageSizeName = '$pageSize';
        let pageName = '$page';
        let countName = 'count';
        if (isLegacyApi) {
            pageSizeName = '$top';
            pageName = '$skip';
            countName = 'totalResults';
            page = 0; // index starts with 0 for mobileMessage
            if (pageSize != 50) {
                // values other than 50 are ignore by at least some of the sub-endpoints; while others have 50 as the maximum.
                pageSize = 50;
            }
        }
        queryParams.set(pageSizeName, Number(pageSize || 50).toString());
        do {
            queryParams.set(pageName, Number(page).toString());
            const temp = await this._apiRequest(
                {
                    method: 'GET',
                    url: baseUrl + '?' + decodeURIComponent(queryParams.toString()),
                },
                this.options.requestAttempts
            );
            if (!iteratorField) {
                if (Array.isArray(temp.items)) {
                    iteratorField = 'items';
                } else if (Array.isArray(temp.definitions)) {
                    iteratorField = 'definitions';
                } else if (Array.isArray(temp.entry)) {
                    iteratorField = 'entry';
                } else {
                    throw new TypeError('Could not find an array to iterate over');
                }
            }
            if (collector && Array.isArray(temp[iteratorField])) {
                collector[iteratorField].push(...temp[iteratorField]);
            } else if (collector == null) {
                collector = temp;
            }
            if (
                Array.isArray(collector[iteratorField]) &&
                collector[iteratorField].length >= temp[countName] &&
                (!isTransactionalMessageApi ||
                    (isTransactionalMessageApi && temp[countName] != temp[pageSizeName]))
            ) {
                // ! the transactional message API returns a value for "count" that represents the currently returned number of records, instead of the total amount. checking for count != pageSize is a workaround for this
                // * opened Support Case #43988240 for this issue
                shouldPaginate = false;
            } else {
                page++;
                shouldPaginate = true;
                if (this.options?.eventHandlers?.onLoop) {
                    this.options.eventHandlers.onLoop(null, collector?.[iteratorField]);
                }
            }
        } while (shouldPaginate);
        return collector;
    }

    /**
     * Parses campaign asset response body and returns metadata entries mapped to their id
     *
     * @param {string} retrieveDir folder where to save
     * @param {string} campaignId of camapaign to retrieve
     * @param {string} name of camapaign for saving
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Campaign Asset Object
     */
    static async getAssetTags(retrieveDir, campaignId, name) {
        const res = await this.client.rest.getBulk(`/hub/v1/campaigns/${campaignId}/assets`);

        for (const asset of res.items) {
            await File.writeJSONToFile(
                `${retrieveDir}/campaign/${name}/assets/`,
                asset.id + '.campaignAsset-meta',
                asset
            );
        }
        return res.items;
    }
}
// Assign definition to static attributes
Campaign.definition = require('../MetadataTypeDefinitions').campaign;

module.exports = Campaign;
