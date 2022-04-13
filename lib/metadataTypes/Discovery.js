'use strict';

const MetadataType = require('./MetadataType');
const Util = require('../util/util');

/**
 * ImportFile MetadataType
 * @augments MetadataType
 */
class Discovery extends MetadataType {
    /**
     * Construtor method
     * @param {Object} properties General configuration to be used in retrieve
     * @param {auth.BuObject} buObject details of business unit in processing
     * @returns {void}
     */
    constructor(properties, buObject) {
        super(properties, buObject);
        this.definition = require('../MetadataTypeDefinitions').discovery;
    }
    /**
     * Retrieves API endpoint
     * documentation: https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-apis.meta/mc-apis/routes.htm
     * @param {String} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise} Promise
     */
    async retrieve(retrieveDir) {
        if (!this.buObject.isParent) {
            // don't run for BUs other than Parent BU
            Util.logger.warn('Skipping Discovery retrieval on non-parent BU');
            return;
        } else {
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
            await this.saveResults(metadataStructure, retrieveDir, null);
            Util.logger.info('Downloaded: ' + this.definition.type);
            return { metadata: metadataStructure, type: this.definition.type };
        }
    }
}

module.exports = Discovery;
