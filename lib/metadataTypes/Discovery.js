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
     * @param {void | string[]} [_] not used
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise
     */
    static async retrieve(retrieveDir, _, __, key) {
        if (key) {
            Util.logger.error('Discovery.retrieve() does not support key parameter');
        }
        if (this.buObject.eid === this.buObject.mid) {
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
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
Discovery.definition = MetadataTypeDefinitions.discovery;

export default Discovery;
