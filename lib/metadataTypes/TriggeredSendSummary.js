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
 * TriggeredSendSummary MetadataType
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
        // CustomerKey for this type is the same as the CustomerKey of the TriggeredSend it relates to
        const triggeredSend = cache.getByKey('triggeredSend', metadata.CustomerKey);
        if (!triggeredSend) {
            Util.logger.verbose(
                `Could not find related TriggeredSend with CustomerKey '${metadata.CustomerKey}' for the TriggeredSendSummary.`
            );
            return null;
        }
        metadata['TriggeredSend.CategoryID'] = triggeredSend.CategoryID;
        // folder path for a TriggeredSendSummary is the same as for the related TriggeredSend. CategoryID is not retrievable for this type, so use the TriggeredSend's field
        this.setFolderPath(metadata);
        if (!metadata.r__folder_Path) {
            Util.logger.verbose(
                ` ☇ skipping ${this.definition.typeName} '${metadata.Name}'/'${metadata.CustomerKey}': Could not find folder.`
            );
            // do not save this Triggered Send Summary because it would not be visible in the user interface
            return;
        }
        delete metadata['TriggeredSend.CategoryID'];
        metadata.r__triggeredSend_name = triggeredSend.Name;
        metadata.r__triggeredSend_key = triggeredSend.CustomerKey;

        return metadata;
    }
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
TriggeredSendSummary.definition = MetadataTypeDefinitions.triggeredSendSummary;

export default TriggeredSendSummary;
