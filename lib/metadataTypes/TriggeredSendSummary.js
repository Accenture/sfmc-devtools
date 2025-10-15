'use strict';

import MetadataType from './MetadataType.js';
import cache from '../util/cache.js';

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
        try {
            // CustomerKey for this type is the same as the CustomerKey of the TriggeredSend it relates to
            const triggeredSendCategoryID = cache.searchForField(
                'triggeredSend',
                metadata.CustomerKey,
                'CustomerKey',
                'CategoryID'
            );
            metadata['TriggeredSend.CategoryID'] = triggeredSendCategoryID;
            // folder path for a TriggeredSendSummary is the same as for the related TriggeredSend. CategoryID is not retrievable for this type, so use the TriggeredSend's field
            this.setFolderPath(metadata);
            const triggeredSendName = cache.searchForField(
                'triggeredSend',
                metadata.CustomerKey,
                'CustomerKey',
                'Name'
            );
            metadata.r__triggeredSend_name = triggeredSendName;
            const triggeredSendKey = cache.searchForField(
                'triggeredSend',
                metadata.CustomerKey,
                'CustomerKey',
                'CustomerKey'
            );
            metadata.r__triggeredSend_key = triggeredSendKey;
        } catch {
            // the function will throw an error if the field is not found. We don't need to store the summary if the related TriggeredSend is not found
            throw new Error(
                `Could not find related TriggeredSend with CustomerKey '${metadata.CustomerKey}', or CategoryID, Name or CustomerKey fields missing.`
            );
        }
        return metadata;
    }
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
TriggeredSendSummary.definition = MetadataTypeDefinitions.triggeredSendSummary;

export default TriggeredSendSummary;
