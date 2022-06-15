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
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise
     */
    static async retrieve(retrieveDir) {
        const res = await super.retrieveREST(retrieveDir, '/hub/v1/campaigns');
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
     *
     * @param {string} retrieveDir folder where to save
     * @param {string} id of camapaign to retrieve
     * @param {string} name of camapaign for saving
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Campaign Asset Object
     */
    static async getAssetTags(retrieveDir, id, name) {
        const res = await this.client.rest.getBulk(`/hub/v1/campaigns/${id}/assets`);

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
