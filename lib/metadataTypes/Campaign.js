'use strict';

const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const File = require('../util/file');

/**
 * Campaign MetadataType
 * @augments MetadataType
 */
class Campaign extends MetadataType {
    /**
     * Retrieves Metadata of campaigns. Afterwards, starts metadata retrieval for their campaign assets
     * @param {String} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise} Promise
     */
    static async retrieve(retrieveDir) {
        const res = await super.retrieveREST(retrieveDir, '/hub/v1/campaigns', null);
        // get assignments

        const campaignAssets = await Promise.all(
            Object.keys(res.metadata).map((key) =>
                this.getAssetTags(retrieveDir, res.metadata[key].id, key)
            )
        );
        Util.logger.info(`Downloaded: campaignAssets (${campaignAssets.flat().length})`);

        return res;
    }

    /**
     * Parses campaign asset response body and returns metadata entries mapped to their id
     * @param {String} retrieveDir folder where to save
     * @param {String} id of camapaign to retrieve
     * @param {String} name of camapaign for saving
     * @returns {Promise<Object>} Campaign Asset Object
     */
    static async getAssetTags(retrieveDir, id, name) {
        const res = await this.client.rest.getBulk(`/hub/v1/campaigns/${id}/assets`);

        for (const asset of res.items) {
            File.writeJSONToFile(
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
/**
 * @type {Util.SDK}
 */
Campaign.client = undefined;
Campaign.cache = {};

module.exports = Campaign;
