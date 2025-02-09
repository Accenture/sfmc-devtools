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
 * @typedef {import('../../types/mcdev.d.js').DomainVerificationItem} DomainVerificationItem
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
     * @param {DomainVerificationItem} metadataItem a single item
     * @returns {Promise} Promise
     */
    static create(metadataItem) {
        return super.createREST(metadataItem, '/messaging/v1/domainverification/');
    }

    /**
     * helper for {@link MetadataType.createREST}
     *
     * @param {DomainVerificationItem} metadataEntry a single metadata Entry
     * @param {object} apiResponse varies depending on the API call
     * @returns {Promise.<DomainVerificationItem>} apiResponse
     */
    static async postCreateTasks(metadataEntry, apiResponse) {
        if (apiResponse && apiResponse === `${metadataEntry.domain} successfully added.`) {
            return metadataEntry;
        } else {
            throw new Error(apiResponse);
        }
    }

    /**
     * helper for {@link update}
     *
     * @param {DomainVerificationItem} metadataEntry a single metadata Entry
     * @param {object} apiResponse varies depending on the API call
     * @returns {Promise.<DomainVerificationItem>} apiResponse, potentially modified
     */
    static async postUpdateTasks(metadataEntry, apiResponse) {
        if (apiResponse && apiResponse === `1 records successfully updated!`) {
            metadataEntry.domain = metadataEntry.emailAddress;
            return metadataEntry;
        } else {
            throw new Error(apiResponse);
        }
    }

    /**
     * Updates a single item; replaces super.updateREST because we need to send metadataItem as an array for some reason and also get an array back
     *
     * @param {DomainVerificationItem} metadataItem a single item
     * @returns {Promise.<DomainVerificationItem>} Promise
     */
    static async update(metadataItem) {
        const uri = '/messaging/v1/domainverification/update';

        this.removeNotUpdateableFields(metadataItem);
        try {
            // set to empty object in case API returned nothing to be able to update it in helper classes
            let response = (await this.client.rest.post(uri, [metadataItem])) || {};
            this.getErrorsREST(response);
            response = await this.postUpdateTasks(metadataItem, response);
            // some times, e.g. automation dont return a key in their update response and hence we need to fall back to name
            Util.logger.info(` - updated ${Util.getTypeKeyName(this.definition, metadataItem)}`);
            return metadataItem;
        } catch (ex) {
            const parsedErrors = this.getErrorsREST(ex);
            Util.logger.error(
                ` ☇ error updating ${Util.getTypeKeyName(this.definition, metadataItem)}:`
            );
            for (const msg of parsedErrors) {
                Util.logger.error('   • ' + msg);
            }
            return null;
        }
    }
    /**
     * manages post retrieve steps
     *
     * @param {DomainVerificationItem} metadataItem a single item
     * @returns {DomainVerificationItem} metadata
     */
    static postRetrieveTasks(metadataItem) {
        if (metadataItem.status !== 'Verified') {
            Util.logger.warn(
                Util.getMsgPrefix(this.definition, metadataItem) +
                    ` is not verified. Current status: ${metadataItem.status}`
            );
        }
        if (!metadataItem.isSendable) {
            Util.logger.warn(
                Util.getMsgPrefix(this.definition, metadataItem) + ` is not sendable.`
            );
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
     * prepares a single item for deployment
     *
     * @param {DomainVerificationItem} metadata a single item
     * @returns {Promise.<DomainVerificationItem>} Promise
     */
    static async preDeployTasks(metadata) {
        if (metadata.domainType && metadata.domainType !== 'UserDomain') {
            throw new Error(
                `Can only delete entries of type 'UserDomain'. Found: ${metadata.domainType}`
            );
        }
        // prep for update which uses emailAddress instead of domain
        metadata.emailAddress = metadata.domain;

        return metadata;
    }

    /**
     * Gets executed before deleting a list of keys for the current type
     *
     * @returns {Promise.<void>} -
     */
    static async preDeleteTasks() {
        if (!cache.getCache()) {
            cache.initCache(this.buObject);
        }
        if (!cache.getCache()?.domainVerification) {
            cache.setMetadata(this.definition.type, (await this.retrieveForCache())?.metadata);
        }
    }

    /**
     * Delete a metadata item from the specified business unit
     *
     * @param {string} key Identifier of data extension
     * @returns {Promise.<boolean>} deletion success flag
     */
    static async deleteByKey(key) {
        const metadataItem = cache.getByKey(this.definition.type, key);
        if (!metadataItem) {
            Util.logger.error(` - ${this.definition.type} ${key} not found`);
            return false;
        }
        if (metadataItem.domainType !== 'UserDomain') {
            Util.logger.error(
                ` - ${this.definition.type} ${key}: Can only delete entries of type UserDomain. Found: ${metadataItem.domainType}`
            );
            return false;
        }
        try {
            const response = await this.client.rest.post(
                '/messaging/v1/domainverification/delete',
                [
                    {
                        emailAddress: metadataItem.domain,
                        domainType: metadataItem.domainType,
                    },
                ]
            );
            if (response === '1 records successfully updated!') {
                Util.logger.info(` - deleted ${this.definition.type}: ${key}`);
                this.postDeleteTasks(key);
                return true;
            } else {
                Util.logger.error(
                    ` - Deleting ${this.definition.type} '${key}' failed: ` + response
                );
                return false;
            }
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
