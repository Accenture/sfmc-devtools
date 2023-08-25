'use strict';

const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');
const Automation = require('./Automation');
const Util = require('../util/util');
const cache = require('../util/cache');

/**
 * Verification MetadataType
 *
 * @augments MetadataType
 */
class Verification extends MetadataType {
    /**
     * Retrieves Metadata of Data Verification Activity.
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void} [_] unused parameter
     * @param {void} [__] unused parameter
     * @param {string} key customer key of single item to retrieve
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of metadata
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
     * @param {Error} ex exception
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
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of metadata
     */
    static async retrieveForCache() {
        return this.retrieve();
    }

    /**
     * Creates a single Data Extract
     *
     * @param {TYPE.VerificationItem} metadata a single Data Extract
     * @returns {Promise} Promise
     */
    static create(metadata) {
        return super.createREST(metadata, '/automation/v1/dataverifications/');
    }

    /**
     * helper for {@link MetadataType.createREST}
     *
     * @param {TYPE.MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {object} apiResponse varies depending on the API call
     * @param {TYPE.MetadataTypeItem} metadataEntryWithAllFields like metadataEntry but before non-creatable fields were stripped
     * @returns {void}
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
    }

    /**
     * Updates a single Data Extract
     *
     * @param {TYPE.VerificationItem} metadata a single Data Extract
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
     * @param {TYPE.VerificationItem} metadata a single verification activity definition
     * @returns {TYPE.VerificationItem} metadata object
     */
    static preDeployTasks(metadata) {
        metadata.targetObjectId = cache.searchForField(
            'dataExtension',
            metadata.r__dataExtension_CustomerKey,
            'CustomerKey',
            'ObjectID'
        );
        delete metadata.r__dataExtension_CustomerKey;
        return metadata;
    }
    /**
     * parses retrieved Metadata before saving
     *
     * @param {TYPE.VerificationItem} metadata a single verification activity definition
     * @returns {TYPE.VerificationItem} Array with one metadata object and one sql string
     */
    static postRetrieveTasks(metadata) {
        try {
            metadata.r__dataExtension_CustomerKey = cache.searchForField(
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
Verification.definition = require('../MetadataTypeDefinitions').verification;

module.exports = Verification;