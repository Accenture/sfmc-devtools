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
            if (key) {
                try {
                    const verification = await super.retrieveREST(
                        null,
                        '/automation/v1/dataverifications/' + paramArr[0],
                        null,
                        key
                    );
                    const key = Object.values(verification?.metadata)[0]?.[
                        this.definition.keyField
                    ];
                    results[key] = verification?.metadata[key];
                } catch (ex) {
                    if (
                        ex.message === 'Not Found' ||
                        ex.message === 'Request failed with status code 400'
                    ) {
                        // if the ID is too short, the system will throw the 400 error
                    } else {
                        throw ex;
                    }
                }
            } else {
                const uri = '/automation/v1/dataverifications/';

                const verificationArr = await this.client.rest.getCollection(
                    paramArr.map((id) => uri + id)
                );
                for (const verification of verificationArr) {
                    const key = verification[this.definition.keyField];
                    results[key] = verification;
                }
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
     * Retrieves Metadata of  Data Extract Activity for caching
     *
     * @param {void} [_] not used
     * @param {void} [__] not used
     * @param {string[]} [keyArr] customer key of single item to retrieve
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of metadata
     */
    static async retrieveForCache(_, __, keyArr) {
        const resultArr = await Promise.all(
            keyArr.map(async (key) => this.retrieve(null, null, null, key))
        );
        const base = resultArr[0];
        if (resultArr.length > 1) {
            base.metadata = resultArr.reduce((acc, cur) => {
                if (cur?.metadata) {
                    acc.metadata = Object.assign(acc.metadata, cur.metadata);
                }
                return acc;
            }).metadata;
        }
        return base;
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
            '/automation/v1/dataverifications/' + metadata.verificationDefinitionId
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
