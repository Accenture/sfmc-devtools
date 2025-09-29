'use strict';

import MetadataType from './MetadataType.js';
import cache from '../util/cache.js';
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
 * MessageSendActivity MetadataType
 *
 * @augments MetadataType
 */
class TriggeredSendSummary extends MetadataType {
    /**
     * Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static retrieve(retrieveDir, _, __, key) {
        /** @type {SoapRequestParams} */
        let requestParams = {};
        if (key) {
            // move original filter down one level into rightOperand and add key filter into leftOperand
            requestParams = {
                filter: {
                    leftOperand: {
                        leftOperand: 'CustomerKey',
                        operator: 'equals',
                        rightOperand: key,
                    },
                    operator: 'AND',
                    rightOperand: requestParams.filter,
                },
            };
        }

        return super.retrieveSOAP(retrieveDir, requestParams, key);
    }
    /**
     * parses retrieved Metadata before saving
     *
     * @param {MetadataTypeItem} metadata a single item
     * @returns {MetadataTypeItem | void} Array with one metadata object and one sql string
     */
    static postRetrieveTasks(metadata) {
        // folder
        this.setFolderPath(metadata);
        try {
            // CustomerKey for this type is the same as the CustomerKey of the TriggeredSend it relates to
            const triggeredSendName = cache.searchForField('triggeredSend', metadata.CustomerKey, 'CustomerKey', 'Name')
            metadata.r__triggeredSend_name = triggeredSendName;
            const triggeredSendKey = cache.searchForField('triggeredSend', metadata.CustomerKey, 'CustomerKey', 'CustomerKey');
            metadata.r__triggeredSend_key = triggeredSendKey;
        } catch (ex) {
            Util.logger.verbose(
                ` - ${this.definition.typeName} '${metadata.Name}'/'${metadata.CustomerKey}': Could not find triggeredSend with CustomerKey ${metadata.CustomerKey}`
            );
        }
        return metadata;
    }
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
TriggeredSendSummary.definition = MetadataTypeDefinitions.triggeredSendSummary;

export default TriggeredSendSummary;
