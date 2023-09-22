'use strict';

import TYPE from '../../types/mcdev.d.js';
import MetadataType from './MetadataType.js';
import { Util } from '../util/util.js';
import File from '../util/file.js';

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
        return super.retrieveREST(null, '/legacy/v1/beta2/data/campaign/');
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
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
Campaign.definition = MetadataTypeDefinitions.campaign;

export default Campaign;
