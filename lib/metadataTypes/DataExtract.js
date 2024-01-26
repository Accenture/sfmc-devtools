'use strict';

import TYPE from '../../types/mcdev.d.js';
import MetadataType from './MetadataType.js';
import { Util } from '../util/util.js';
import File from '../util/file.js';
import cache from '../util/cache.js';

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
     * @param {void} [_] unused parameter
     * @param {void} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of metadata
     */
    static async retrieve(retrieveDir, _, __, key) {
        return super.retrieveREST(retrieveDir, '/automation/v1/dataextracts/', null, key);
    }
    /**
     * Retrieves Metadata of  Data Extract Activity for caching
     *
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of metadata
     */
    static async retrieveForCache() {
        return super.retrieveREST(null, '/automation/v1/dataextracts/');
    }

    /**
     * Retrieve a specific dataExtract Definition by Name
     *
     * @param {string} templateDir Directory where retrieved metadata directory will be saved
     * @param {string} name name of the metadata file
     * @param {TYPE.TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {Promise.<TYPE.MetadataTypeItemObj>} Promise of metadata
     */
    static async retrieveAsTemplate(templateDir, name, templateVariables) {
        const res = await this.client.rest.get(
            '/automation/v1/dataextracts/?$filter=name%20eq%20' + encodeURIComponent(name)
        );
        if (Array.isArray(res.items) && res.items.length) {
            // eq-operator returns a similar, not exact match and hence might return more than 1 entry
            const metadata = res.items.find((item) => item.name === name);
            if (!metadata) {
                Util.logger.error(`No ${this.definition.typeName} found with name "${name}"`);
                return;
            }

            // get full definition
            const extended = await this.client.rest.get(
                '/automation/v1/dataextracts/' + metadata[this.definition.idField]
            );
            const originalKey = extended[this.definition.keyField];
            const val = JSON.parse(
                Util.replaceByObject(
                    JSON.stringify(this.parseMetadata(extended)),
                    templateVariables
                )
            );

            // remove all fields listed in Definition for templating
            this.keepTemplateFields(val);
            await File.writeJSONToFile(
                [templateDir, this.definition.type].join('/'),
                originalKey + '.' + this.definition.type + '-meta',
                JSON.parse(Util.replaceByObject(JSON.stringify(val), templateVariables))
            );
            Util.logger.info(`- templated ${this.definition.type}: ${name}`);
            return { metadata: val, type: this.definition.type };
        } else if (res?.items) {
            Util.logger.error(`No ${this.definition.typeName} found with name "${name}"`);
        } else {
            throw new Error(
                `Encountered unknown error when retrieveing ${
                    this.definition.typeName
                } "${name}": ${JSON.stringify(res)}`
            );
        }
    }

    /**
     * manages post retrieve steps
     *
     * @param {TYPE.MetadataTypeItem} fileTransfer a single fileTransfer
     * @returns {TYPE.MetadataTypeItem} metadata
     */
    static postRetrieveTasks(fileTransfer) {
        return this.parseMetadata(fileTransfer);
    }

    /**
     * Creates a single Data Extract
     *
     * @param {TYPE.MetadataTypeItem} dataExtract a single Data Extract
     * @returns {Promise} Promise
     */
    static create(dataExtract) {
        return super.createREST(dataExtract, '/automation/v1/dataextracts/');
    }

    /**
     * Updates a single Data Extract
     *
     * @param {TYPE.MetadataTypeItem} dataExtract a single Data Extract
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
     * @param {TYPE.MetadataTypeItem} metadata a single dataExtract activity definition
     * @returns {TYPE.MetadataTypeItem} metadata object
     */
    static preDeployTasks(metadata) {
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
     * parses retrieved Metadata before saving
     *
     * @param {TYPE.MetadataTypeItem} metadata a single dataExtract activity definition
     * @returns {TYPE.MetadataTypeItem} Array with one metadata object and one sql string
     */
    static parseMetadata(metadata) {
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
        return JSON.parse(JSON.stringify(metadata));
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
     * @param {string} customerKey Identifier of data extension
     * @returns {boolean} deletion success status
     */
    static async deleteByKey(customerKey) {
        // delete only works with the query's object id
        const objectId = customerKey ? await this._getObjectIdForSingleRetrieve(customerKey) : null;
        if (!objectId) {
            Util.logger.error(` - dataExtract not found`);
            return false;
        }
        return super.deleteByKeyREST('/automation/v1/dataextracts/' + objectId, customerKey);
    }
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
DataExtract.definition = MetadataTypeDefinitions.dataExtract;

export default DataExtract;
