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
 * DomainVerification MetadataType
 *
 * @augments MetadataType
 */
class DomainVerification extends MetadataType {
    /**
     * Retrieves Metadata ofDomainVerification.
     * Endpoint /automation/v1/dataextracts/ returns all items
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static async retrieve(retrieveDir, _, __, key) {
        return super.retrieveREST(retrieveDir, '/messaging/v1/domainverification/', null, key);
    }

    /**
     * Retrieves Metadata of DomainVerification for caching
     *
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static async retrieveForCache() {
        return super.retrieveREST(null, '/messaging/v1/domainverification/');
    }

    /**
     * Creates a single item
     *
     * @param {MetadataTypeItem} metadataItem a single item
     * @returns {Promise} Promise
     */
    static create(metadataItem) {
        return super.createREST(metadataItem, '/messaging/v1/domainverification/');
    }

    /**
     * helper for {@link MetadataType.createREST}
     *
     * @param {MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {object} apiResponse varies depending on the API call
     * @returns {Promise.<object>} apiResponse
     */
    static async postCreateTasks(metadataEntry, apiResponse) {
        if (apiResponse && apiResponse === `${metadataEntry.domain} successfully added.`) {
            return metadataEntry;
        } else {
            throw new Error(apiResponse);
        }
    }

    /**
     * Updates a single item
     *
     * @param {MetadataTypeItem} metadataItem a single item
     * @returns {Promise.<any>} Promise
     */
    static update(metadataItem) {
        if (metadataItem.domainType === 'UserDomain') {
            return super.updateREST(
                { emailAddress: metadataItem.domain, isSendable: metadataItem.isSendable },
                '/messaging/v1/domainverification/update',
                'post'
            );
        } else {
            Util.logger.error(
                ` - ${this.definition.type} ${metadataItem.domain}: Can only delete entries of type 'UserDomain'. Found: ${metadataItem.domainType}`
            );
        }
        return;
    }
    /**
     * manages post retrieve steps
     *
     * @param {MetadataTypeItem} metadataItem a single item
     * @returns {MetadataTypeItem} metadata
     */
    static postRetrieveTasks(metadataItem) {
        if (metadataItem.status !== 'Verified') {
            Util.logger.warn(
                Util.getMsgPrefix(this.definition, metadataItem) +
                    `not verified. Current status: ${metadataItem.status}`
            );
        }
        if (!metadataItem.isSendable) {
            Util.logger.warn(Util.getMsgPrefix(this.definition, metadataItem) + `not sendable.`);
        }
        return metadataItem;
    }

    /**
     * Gets executed after deployment of metadata type
     *
     * @param {MetadataTypeMap} upsertResults metadata mapped by their keyField as returned by update/create
     * @returns {Promise.<void>} -
     */
    static async postDeployTasks(upsertResults) {
        // re-retrieve all upserted items to ensure we have all fields (createdDate and modifiedDate are otherwise not present)
        Util.logger.debug(
            `Caching all ${this.definition.type} post-deploy to ensure we have all fields`
        );
        const typeCache = await this.retrieveForCache();
        // update values in upsertResults with retrieved values before saving to disk
        for (const key of Object.keys(upsertResults)) {
            if (typeCache.metadata[key]) {
                upsertResults[key] = typeCache.metadata[key];
            }
        }
    }

    /**
     * Delete a metadata item from the specified business unit
     *
     * @param {string} key Identifier of data extension
     * @returns {Promise.<boolean>} deletion success flag
     */
    static async deleteByKey(key) {
        if (!cache.getCache().domainVerification) {
            cache.setMetadata(this.definition.type, await this.retrieveForCache());
        }
        const metadataItem = cache.getByKey(this.definition.type, key);
        if (!metadataItem) {
            Util.logger.error(` - ${this.definition.type} ${key} not found`);
            return false;
        }
        if (metadataItem.domainType !== 'UserDomain') {
            Util.logger.error(
                ` - ${this.definition.type} ${key}: Can only delete entries of type 'UserDomain'. Found: ${metadataItem.domainType}`
            );
            return false;
        }
        try {
            await this.client.rest.post('/messaging/v1/domainverification/delete', [
                {
                    emailAddress: metadataItem.domain,
                    domainType: metadataItem.domainType,
                },
            ]);
            Util.logger.info(` - deleted ${this.definition.type}: ${key}`);
            this.postDeleteTasks(key);

            return true;
        } catch (ex) {
            Util.logger.errorStack(ex, ` - Deleting ${this.definition.type} '${key}' failed`);

            return false;
        }
    }
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
DomainVerification.definition = MetadataTypeDefinitions.domainVerification;

export default DomainVerification;
