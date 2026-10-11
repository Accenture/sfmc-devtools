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
 * DataExtract MetadataType
 *
 * @augments MetadataType
 */
class DataExtract extends MetadataType {
    /**
     * Retrieves Metadata of Data Extract Activity.
     * Endpoint /automation/v1/dataextracts/ returns all Data Extracts
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static async retrieve(retrieveDir, _, __, key) {
        return super.retrieveREST(retrieveDir, '/automation/v1/dataextracts/', key);
    }

    /**
     * Retrieves Metadata of  Data Extract Activity for caching
     *
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static async retrieveForCache() {
        return super.retrieveREST(null, '/automation/v1/dataextracts/');
    }

    /**
     * Creates a single Data Extract
     *
     * @param {MetadataTypeItem} dataExtract a single Data Extract
     * @returns {Promise} Promise
     */
    static create(dataExtract) {
        return super.createREST(dataExtract, '/automation/v1/dataextracts/');
    }

    /**
     * Updates a single Data Extract
     *
     * @param {MetadataTypeItem} dataExtract a single Data Extract
     * @returns {Promise} Promise
     */
    static update(dataExtract) {
        return super.updateREST(
            dataExtract,
            '/automation/v1/dataextracts/' + dataExtract.dataExtractDefinitionId
        );
    }

    /**
     * prepares a dataExtract for deployment
     *
     * @param {MetadataTypeItem} metadata a single dataExtract activity definition
     * @returns {MetadataTypeItem} metadata object
     */
    static preDeployTasks(metadata) {
        // dataExtension
        if (metadata.r__dataExtension_key) {
            const deField = metadata.dataFields.find((field) => field.name === 'DECustomerKey');
            if (deField) {
                deField.value = cache.searchForField(
                    'dataExtension',
                    metadata.r__dataExtension_key,
                    'CustomerKey',
                    'CustomerKey'
                );
                delete metadata.r__dataExtension_key;
            }
        }

        // dataExtractType
        metadata.dataExtractTypeId = cache.searchForField(
            'dataExtractType',
            metadata.r__dataExtractType_name,
            'name',
            'extractId'
        );
        delete metadata.r__dataExtractType_name;
        return metadata;
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
     * manages post retrieve steps
     *
     * @param {MetadataTypeItem} metadata a single item
     * @returns {MetadataTypeItem} metadata
     */
    static postRetrieveTasks(metadata) {
        // user
        try {
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
            metadata.modifiedBy = cache.searchForField(
                'user',
                metadata.modifiedBy,
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
        // dataExtension
        const deField = metadata.dataFields.find((field) => field.name === 'DECustomerKey');
        if (deField && deField.value) {
            try {
                metadata.r__dataExtension_key = cache.searchForField(
                    'dataExtension',
                    deField.value,
                    'CustomerKey',
                    'CustomerKey'
                );
                delete deField.value;
            } catch (ex) {
                Util.logger.warn(
                    ` - ${this.definition.type} ${metadata[this.definition.keyField]}: ${ex.message}`
                );
            }
        }

        // dataExtractType
        try {
            metadata.r__dataExtractType_name = cache.searchForField(
                'dataExtractType',
                metadata.dataExtractTypeId,
                'extractId',
                'name'
            );
            delete metadata.dataExtractTypeId;
        } catch (ex) {
            Util.logger.warn(
                ` - ${this.definition.type} ${metadata[this.definition.keyField]}: ${ex.message}`
            );
        }
        return metadata;
    }

    /**
     * helper to allow us to select single metadata entries via REST
     *
     * @private
     * @param {string} key customer key
     * @returns {Promise.<string>} objectId or enpty string
     */
    static async _getObjectIdForSingleRetrieve(key) {
        const name = key.startsWith('name:') ? key.slice(5) : null;
        const filter = name ? '?$filter=name%20eq%20' + encodeURIComponent(name) : '';
        const results = await this.client.rest.get('/automation/v1/dataextracts/' + filter);
        const items = results?.items || [];
        const found = items.find((item) =>
            name ? item[this.definition.nameField] === name : item[this.definition.keyField] === key
        );
        return found?.dataExtractDefinitionId || null;
    }

    /**
     * Delete a metadata item from the specified business unit
     *
     * @param {string} key Identifier of data extension
     * @returns {Promise.<boolean>} deletion success flag
     */
    static async deleteByKey(key) {
        // delete only works with the query's object id
        const objectId = key ? await this._getObjectIdForSingleRetrieve(key) : null;
        if (!objectId) {
            await this.deleteNotFound(key);
            return false;
        }
        return super.deleteByKeyREST('/automation/v1/dataextracts/' + objectId, key);
    }
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
DataExtract.definition = MetadataTypeDefinitions.dataExtract;

export default DataExtract;
