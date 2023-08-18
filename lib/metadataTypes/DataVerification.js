'use strict';

const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const cache = require('../util/cache');

/**
 * DataVerification MetadataType
 *
 * @augments MetadataType
 */
class DataVerification extends MetadataType {
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
        let param = '';
        if (key?.startsWith('id:')) {
            param = key.slice(3);
        } else if (key) {
            param = key;
        }
        if (param === '') {
            throw new Error('DataVerification can only be retrieved if the ID is known');
        }
        try {
            return await super.retrieveREST(
                null,
                '/automation/v1/dataverifications/' + param,
                null,
                key
            );
        } catch (ex) {
            if (
                ex.message === 'Not Found' ||
                ex.message === 'Request failed with status code 400'
            ) {
                if (retrieveDir) {
                    Util.logger.info(
                        `Downloaded: ${this.definition.type} (0)${Util.getKeysString(param)}`
                    );
                }
                // if the ID is too short, the system will throw the 400 error
                return { metadata: {} };
            } else {
                throw ex;
            }
        }
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
     * @param {TYPE.DataVerificationItem} metadata a single Data Extract
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
     * @param {TYPE.DataVerificationItem} metadata a single Data Extract
     * @returns {Promise} Promise
     */
    static update(metadata) {
        return super.updateREST(
            metadata,
            '/automation/v1/dataverifications/' + metadata.dataVerificationDefinitionId
        );
    }

    /**
     * prepares a dataVerification for deployment
     *
     * @param {TYPE.DataVerificationItem} metadata a single dataVerification activity definition
     * @returns {TYPE.DataVerificationItem} metadata object
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
     * @param {TYPE.DataVerificationItem} metadata a single dataVerification activity definition
     * @returns {TYPE.DataVerificationItem} Array with one metadata object and one sql string
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
DataVerification.definition = require('../MetadataTypeDefinitions').dataVerification;

module.exports = DataVerification;
