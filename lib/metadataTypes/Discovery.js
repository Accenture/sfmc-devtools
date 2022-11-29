'use strict';

const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');
const Util = require('../util/util');

/**
 * ImportFile MetadataType
 *
 * @augments MetadataType
 */
class Discovery extends MetadataType {
    /**
     * Retrieves API endpoint
     * documentation: https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-apis.meta/mc-apis/routes.htm
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void} [_] not used
     * @param {TYPE.BuObject} buObject properties for auth
     * @param {void} [___] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise
     */
    static async retrieve(retrieveDir, _, buObject, ___, key) {
        if (key) {
            Util.logger.error('Discovery.retrieve() does not support key parameter');
        }
        if (buObject.eid === buObject.mid) {
            const res = await this.client.rest.getCollection(
                Object.keys(this.definition.endPointMapping).map(
                    (endpoint) => this.definition.endPointMapping[endpoint]
                )
            );

            const metadataStructure = {};
            for (const [i, v] of res.entries()) {
                v.key = Object.keys(this.definition.endPointMapping)[i];
                metadataStructure[v.key] = v;
            }
            await super.saveResults(metadataStructure, retrieveDir, null);
            Util.logger.info('Downloaded: ' + this.definition.type);
            return { metadata: metadataStructure, type: this.definition.type };
        } else {
            // don't run for BUs other than Parent BU
            Util.logger.warn(' - Skipping Discovery retrieval on non-parent BU');
            return;
        }
    }
}

// Assign definition to static attributes
Discovery.definition = require('../MetadataTypeDefinitions').discovery;

module.exports = Discovery;
