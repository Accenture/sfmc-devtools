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
    static retrieve(retrieveDir) {
        return new Promise((resolve) => {
            const config = {
                props: null,
                options: {},
            };
            this.client.campaign(config).get(async (error, response) => {
                if (error) {
                    throw new Error(error);
                }
                // Save metadata structure
                const metadata = Campaign.parseResponseBody(response.body);
                // Util.logger.info('Campaign.retrieve:: Parsed Response');
                // Write metadata to local filesystem
                for (const metadataEntry in metadata) {
                    File.writeJSONToFile(
                        retrieveDir + '/campaign/' + metadataEntry + '/',
                        metadataEntry + '.' + this.definition.type + '-meta',
                        metadata[metadataEntry]
                    );
                }
                const campaignAssetPromises = [];
                for (const campaign in metadata) {
                    try {
                        campaignAssetPromises.push(
                            Campaign._retrieveCampaignAsset(
                                retrieveDir,
                                metadata[campaign].id,
                                metadata[campaign].name
                            )
                        );
                    } catch (ex) {
                        Util.logger.error(ex.message);
                    }
                }
                const values = await Promise.all(campaignAssetPromises);
                Util.logger.info(
                    `Downloaded: ${this.definition.type} (${Object.keys(metadata).length})`
                );
                resolve({ metadata: values, type: 'campaign' });
            });
        });
    }

    /**
     * Retrieves campaign asset for a specific campaign
     * @param {String} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {Number} id id of the parent campaign
     * @param {String} name name of the parent campaign
     * @returns {Promise} Promise
     */
    static _retrieveCampaignAsset(retrieveDir, id, name) {
        return new Promise((resolve, reject) => {
            const config = {
                props: { id: id },
                options: {},
            };
            this.client.campaignAsset(config).get((error, response) => {
                if (error) {
                    reject(error);
                } else {
                    const assets = Campaign._parseAssetResponseBody(response.body);

                    for (const asset in assets) {
                        File.writeJSONToFile(
                            retrieveDir + '/campaign/' + name + '/assets/',
                            asset + '.campaignAsset-meta',
                            assets[asset]
                        );
                    }
                    resolve(assets);
                }
            });
        });
    }

    /**
     * Parses campaign asset response body and returns metadata entries mapped to their id
     * @param {Object} body response body of metadata retrieval
     * @returns {Object} keyField => metadata map
     */
    static _parseAssetResponseBody(body) {
        const metadataStructure = {};
        if (body.items) {
            for (let i = 0; i < body.items.length; i++) {
                const item = body.items[i];
                // if needed: Makes sure files can be saved on windows operating systems
                // .replace(/[/\\?%*:|"<>]/g, '-');
                const key = item.id;
                metadataStructure[key] = item;
            }
        } else {
            Util.logger.debug(
                `Campaign._parseAssetResponseBody:: Format of 'body' parameter wrong: `,
                body
            );
        }
        return metadataStructure;
    }
}
// Assign definition to static attributes
Campaign.definition = require('../MetadataTypeDefinitions').campaign;
Campaign.client = undefined;
Campaign.cache = {};

module.exports = Campaign;
