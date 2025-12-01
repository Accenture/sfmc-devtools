'use strict';

import Automation from './Automation.js';
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
 * @typedef {import('../../types/mcdev.d.js').RestError} RestError
 */

/**
 * @typedef {import('../../types/mcdev.d.js').VerificationItem} VerificationItem
 */

/**
 * Verification MetadataType
 *
 * @augments MetadataType
 */
class Verification extends MetadataType {
    static verificationIdKeyMap;
    /**
     * Retrieves Metadata of Data Verification Activity.
     *
     * @param {string} [retrieveDir] Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static async retrieve(retrieveDir, _, __, key) {
        const paramArr = [];
        let automationKey;
        if (key) {
            const regex = /^(.*?)__s\d{1,3}\.\d{1,3}$/;
            const match = key.match(regex);
            if (match) {
                // automation key found
                automationKey = match[1];
            } else {
                // invalid key, unset it
                Util.logger.error(`Invalid key: ${key}`);
                return;
            }
        }
        const results = {};
        // there is no API endpoint to retrieve all dataVerification items, so we need to retrieve all automations and iterate over their activities
        Util.logger.info(` - Caching dependent Metadata: automation`);
        Automation.client = this.client;
        Automation.buObject = this.buObject;
        Automation.properties = this.properties;
        Automation._skipNotificationRetrieve = true;
        delete Automation._cachedMetadataMap;
        const automationsMapObj = automationKey
            ? await Automation.retrieve(undefined, undefined, undefined, automationKey)
            : await Automation.retrieve();
        delete Automation._skipNotificationRetrieve;
        if (automationsMapObj?.metadata && Object.keys(automationsMapObj?.metadata).length) {
            if (!key) {
                // if we are not retrieving a single item, cache the automations for later use during retrieval of automations
                Automation._cachedMetadataMap = automationsMapObj?.metadata;
            }
            // automations found, lets iterate over their activities to find the dataVerification items
            this.verificationIdKeyMap = {};
            for (const automation of Object.values(automationsMapObj.metadata)) {
                if (automation.steps) {
                    for (const step of automation.steps) {
                        // ideally one would use activity.displayOrder here but that doesnt always start at 1 nor is it always sequential. To avoid cross-BU issues, we use a custom order
                        let order = 1;
                        for (const activity of step.activities) {
                            if (
                                activity.objectTypeId === 1000 &&
                                activity.activityObjectId &&
                                activity.activityObjectId !== '00000000-0000-0000-0000-000000000000'
                            ) {
                                // log the verification id
                                this.verificationIdKeyMap[activity.activityObjectId] =
                                    `${automation.key}__s${step.step}.${order}`;
                            }
                            order++;
                        }
                    }
                }
            }
            if (Object.keys(this.verificationIdKeyMap).length) {
                paramArr.push(...Object.keys(this.verificationIdKeyMap));
            }
        }
        if (paramArr.length) {
            const response = await this.retrieveRESTcollection(
                paramArr.map((id) => ({ id, uri: '/automation/v1/dataverifications/' + id })),
                undefined,
                !key
            );
            if (response?.metadata) {
                Object.assign(results, response.metadata);
            }
        }
        if (retrieveDir) {
            const savedMetadata = await this.saveResults(results, retrieveDir, null, null);
            Util.logger.info(
                `Downloaded: ${this.definition.type} (${Object.keys(savedMetadata).length})` +
                    Util.getKeysString(key)
            );
        }

        return {
            metadata: results,
            type: this.definition.type,
        };
    }

    /**
     * helper for {@link this.retrieveRESTcollection}
     *
     * @param {RestError} ex exception
     * @param {string} id id or key of item
     * @returns {null} -
     */
    static handleRESTErrors(ex, id) {
        if (ex.message === 'Not Found' || ex.message === 'Request failed with status code 400') {
            // if the ID is too short, the system will throw the 400 error
            Util.logger.debug(
                ` ☇ skipping ${this.definition.type} ${id}: ${ex.message} ${ex.code}`
            );
        } else {
            // if we do get here, we should log the error and continue instead of failing to download all automations
            Util.logger.error(
                ` ☇ skipping ${this.definition.type} ${id}: ${ex.message} ${ex.code}`
            );
        }
        return null;
    }

    /**
     * Retrieves Metadata of item for caching
     *
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static async retrieveForCache() {
        return this.retrieve();
    }

    /**
     * Creates a single item
     *
     * @param {VerificationItem} metadata a single item
     * @returns {Promise} Promise
     */
    static create(metadata) {
        return super.createREST(metadata, '/automation/v1/dataverifications/');
    }

    /**
     * helper for {@link MetadataType.createREST}
     *
     * @param {MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {object} apiResponse varies depending on the API call
     * @param {MetadataTypeItem} metadataEntryWithAllFields like metadataEntry but before non-creatable fields were stripped
     * @returns {Promise.<object>} apiResponse
     */
    static async postCreateTasks(metadataEntry, apiResponse, metadataEntryWithAllFields) {
        if (!apiResponse?.[this.definition.idField]) {
            return;
        }
        // update apiResponse to ensure the new metadata is saved correctly on disk
        apiResponse[this.definition.keyField] =
            metadataEntryWithAllFields?.[this.definition.keyField];

        // update info on metadataEntry to allow for proper logs
        metadataEntry[this.definition.keyField] =
            metadataEntryWithAllFields?.[this.definition.keyField];
        metadataEntry[this.definition.idField] = apiResponse?.[this.definition.idField];

        return apiResponse;
    }
    /**
     * helper for {@link MetadataType.updateREST} and {@link MetadataType.updateSOAP}
     *
     * @param {MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {object} apiResponse varies depending on the API call
     * @param {MetadataTypeItem} metadataEntryWithAllFields like metadataEntry but before non-creatable fields were stripped
     * @returns {Promise.<object>} apiResponse, potentially modified
     */
    static postUpdateTasks(metadataEntry, apiResponse, metadataEntryWithAllFields) {
        // update apiResponse to ensure the new metadata is saved correctly on disk
        apiResponse[this.definition.keyField] =
            metadataEntryWithAllFields?.[this.definition.keyField];

        // update info on metadataEntry to allow for proper logs
        metadataEntry[this.definition.keyField] =
            metadataEntryWithAllFields?.[this.definition.keyField];
        metadataEntry[this.definition.idField] = apiResponse?.[this.definition.idField];
        return apiResponse;
    }

    /**
     * Updates a single item
     *
     * @param {VerificationItem} metadata a single item
     * @returns {Promise} Promise
     */
    static update(metadata) {
        return super.updateREST(
            metadata,
            '/automation/v1/dataverifications/' + metadata.dataVerificationDefinitionId
        );
    }

    /**
     * prepares a verification for deployment
     *
     * @param {VerificationItem} metadata a single verification activity definition
     * @returns {Promise.<VerificationItem>} metadata object
     */
    static async preDeployTasks(metadata) {
        metadata.targetObjectId = cache.searchForField(
            'dataExtension',
            metadata.r__dataExtension_key,
            'CustomerKey',
            'ObjectID'
        );
        delete metadata.r__dataExtension_key;

        return metadata;
    }

    /**
     * helper for {@link parseResponseBody} that creates a custom key field for this type based on mobileCode and keyword
     *
     * @param {MetadataTypeItem} metadata single item
     */
    static createCustomKeyField(metadata) {
        if (this.verificationIdKeyMap[metadata[this.definition.idField]]) {
            metadata[this.definition.keyField] =
                this.verificationIdKeyMap[metadata[this.definition.idField]];
        }
    }

    /**
     * parses retrieved Metadata before saving
     *
     * @param {VerificationItem} metadata a single verification activity definition
     * @returns {VerificationItem} Array with one metadata object and one sql string
     */
    static postRetrieveTasks(metadata) {
        try {
            // @ts-expect-error
            metadata.createdBy = cache.searchForField(
                'user',
                metadata.createdBy,
                'AccountUserID',
                'Name'
            );
        } catch (ex) {
            Util.logger.verbose(
                ` - ${this.definition.type} ${metadata[this.definition.nameField]} (${
                    metadata[this.definition.keyField]
                }): ${ex.message}.`
            );
        }
        try {
            metadata.r__dataExtension_key = cache.searchForField(
                'dataExtension',
                metadata.targetObjectId,
                'ObjectID',
                'CustomerKey'
            );
            delete metadata.targetObjectId;
        } catch (ex) {
            Util.logger.warn(
                ` - ${this.definition.type} ${metadata[this.definition.keyField]}: ${ex.message}`
            );
        }
        return metadata;
    }

    /**
     * Delete a metadata item from the specified business unit
     *
     * @param {string} key Identifier of item
     * @returns {Promise.<boolean>} deletion success status
     */
    static deleteByKey(key) {
        return super.deleteByKeyREST('/automation/v1/dataverifications/' + key, key, 400);
    }
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
Verification.definition = MetadataTypeDefinitions.verification;

export default Verification;
