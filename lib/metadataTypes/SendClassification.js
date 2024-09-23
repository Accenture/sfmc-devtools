'use strict';

import MetadataType from './MetadataType.js';
import { Util } from '../util/util.js';
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
 * SendClassification MetadataType
 *
 * @augments MetadataType
 */
class SendClassification extends MetadataType {
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
        let requestParams = null;
        if (key) {
            requestParams = {
                filter: {
                    leftOperand: 'CustomerKey',
                    operator: 'equals',
                    rightOperand: key,
                },
            };
        }
        return super.retrieveSOAP(retrieveDir, requestParams, key);
    }

    /**
     * Retrieves event definition metadata for caching
     *
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static async retrieveForCache() {
        const typeMap = await this.retrieve(null);
        for (const item of Object.values(typeMap.metadata)) {
            // run postRetrieveTasks to cross-update deliveryProfile cache
            this.postRetrieveTasks(item);
        }
        return typeMap;
    }

    /**
     * Updates a single item
     *
     * @param {MetadataTypeItem} metadataItem a single item
     * @returns {Promise} Promise
     */
    static update(metadataItem) {
        return super.updateSOAP(metadataItem);
    }

    /**
     * Creates a single item
     *
     * @param {MetadataTypeItem} metadataItem a single item
     * @returns {Promise} Promise
     */
    static create(metadataItem) {
        return super.createSOAP(metadataItem);
    }

    /**
     * Delete a metadata item from the specified business unit
     *
     * @param {string} customerKey Identifier of data extension
     * @returns {Promise.<boolean>} deletion success status
     */
    static deleteByKey(customerKey) {
        return super.deleteByKeySOAP(customerKey);
    }

    /**
     * prepares a import definition for deployment
     *
     * @param {MetadataTypeItem} metadata a single importDef
     * @returns {Promise.<MetadataTypeItem>} Promise
     */
    static async preDeployTasks(metadata) {
        metadata.SendClassificationType =
            this.definition.sendClassificationTypeMapping[metadata.c__classification];
        delete metadata.c__classification;

        const spId = cache.searchForField(
            'senderProfile',
            metadata.r__senderProfile_key,
            'CustomerKey',
            'ObjectID'
        );
        metadata.SenderProfile = {
            ObjectID: spId,
            CustomerKey: metadata.r__senderProfile_key,
        };
        delete metadata.r__senderProfile_key;

        const dpId = cache.searchForField(
            'deliveryProfile',
            metadata.r__deliveryProfile_key,
            'key',
            'ObjectID'
        );
        metadata.DeliveryProfile = {
            ObjectID: dpId,
            CustomerKey: metadata.r__deliveryProfile_key,
        };
        delete metadata.r__deliveryProfile_key;

        return metadata;
    }

    /**
     * manages post retrieve steps
     *
     * @param {MetadataTypeItem} metadata a single item
     * @returns {MetadataTypeItem} parsed metadata
     */
    static postRetrieveTasks(metadata) {
        metadata.c__classification = Util.inverseGet(
            this.definition.sendClassificationTypeMapping,
            metadata.SendClassificationType
        );
        delete metadata.SendClassificationType;

        if (cache.getCache().senderProfile) {
            // when sendClassification was only cached it can happen that we don't have the senderProfile cache yet
            try {
                metadata.r__senderProfile_key = cache.searchForField(
                    'senderProfile',
                    metadata.SenderProfile.ObjectID,
                    'ObjectID',
                    'CustomerKey'
                );
                delete metadata.SenderProfile;
            } catch (ex) {
                Util.logger.warn(
                    ` - ${this.definition.type} ${metadata.CustomerKey}: ${ex.message}`
                );
            }
        }
        try {
            metadata.r__deliveryProfile_key = cache.searchForField(
                'deliveryProfile',
                metadata.DeliveryProfile.CustomerKey,
                'key',
                'key'
            );
            // add ObjectID to deliveryProfile cache because it cannot be retrieved any other way and this way we can resolve it in journeys
            const dp = cache.getByKey('deliveryProfile', metadata.DeliveryProfile.CustomerKey);
            if (dp) {
                dp.ObjectID = metadata.DeliveryProfile.ObjectID;
            } else {
                Util.logger.debug(
                    ` - ${this.definition.type} ${metadata.CustomerKey}: Could not find deliveryProfile ${metadata.DeliveryProfile.CustomerKey} in cache`
                );
            }

            delete metadata.DeliveryProfile;
        } catch (ex) {
            Util.logger.warn(` - ${this.definition.type} ${metadata.CustomerKey}: ${ex.message}`);
        }

        return metadata;
    }
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
SendClassification.definition = MetadataTypeDefinitions.sendClassification;

export default SendClassification;
