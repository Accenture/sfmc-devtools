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
        let paramArr = [];
        if (key?.startsWith('id:')) {
            paramArr = [key.slice(3)];
        } else if (key) {
            paramArr = [key];
        }
        if (!paramArr.length) {
            // there is no API endpoint to retrieve all dataVerification items, so we need to retrieve all automations and iterate over their activities
            Util.logger.info(` - Caching dependent Metadata: automation`);
            Automation.client = this.client;
            Automation.buObject = this.buObject;
            Automation.properties = this.properties;
            Automation._skipNotificationRetrieve = true;
            delete Automation._cachedMetadataMap;
            const automationsMapObj = await Automation.retrieve();
            delete Automation._skipNotificationRetrieve;
            if (automationsMapObj?.metadata && Object.keys(automationsMapObj?.metadata).length) {
                if (!key) {
                    // if we are not retrieving a single item, cache the automations for later use during retrieval of automations
                    Automation._cachedMetadataMap = automationsMapObj?.metadata;
                }
                // automations found, lets iterate over their activities to find the dataVerification items
                const dataVerificationIds = [];
                for (const automation of Object.values(automationsMapObj.metadata)) {
                    if (automation.steps) {
                        for (const step of automation.steps) {
                            for (const activity of step.activities) {
                                if (
                                    activity.objectTypeId === 1000 &&
                                    activity.activityObjectId &&
                                    activity.activityObjectId !==
                                        '00000000-0000-0000-0000-000000000000'
                                ) {
                                    dataVerificationIds.push(activity.activityObjectId);
                                }
                            }
                        }
                    }
                }
                if (dataVerificationIds.length) {
                    paramArr.push(...dataVerificationIds);
                }
            }
        }
        const results = {};
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
     * Retrieves Metadata of  Data Extract Activity for caching
     *
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static async retrieveForCache() {
        return this.retrieve();
    }

    /**
     * Creates a single Data Extract
     *
     * @param {VerificationItem} metadata a single Data Extract
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
     * @returns {Promise.<void>} -
     */
    static async postCreateTasks(metadataEntry, apiResponse, metadataEntryWithAllFields) {
        if (!apiResponse?.[this.definition.idField]) {
            return;
        }
        Util.logger.warn(
            ` - ${this.definition.type} ${
                metadataEntryWithAllFields?.[this.definition.idField]
            }: new key ${
                apiResponse?.[this.definition.idField]
            } automatically assigned during creation`
        );
        metadataEntry[this.definition.idField] = apiResponse?.[this.definition.idField];

        // map structure: cred/bu --> type --> old key --> new key
        const buName = this.buObject.credential + '/' + this.buObject.businessUnit;
        Automation.createdKeyMap ||= {};
        Automation.createdKeyMap[buName] ||= {};
        Automation.createdKeyMap[buName][this.definition.type] ||= {};
        Automation.createdKeyMap[buName][this.definition.type][
            metadataEntryWithAllFields[this.definition.idField]
        ] = metadataEntry[this.definition.idField];
    }

    /**
     * Updates a single Data Extract
     *
     * @param {VerificationItem} metadata a single Data Extract
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
        return super.deleteByKeyREST('/automation/v1/dataverifications/' + key, key);
    }
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
Verification.definition = MetadataTypeDefinitions.verification;

export default Verification;
