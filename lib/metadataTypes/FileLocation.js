'use strict';

import MetadataType from './MetadataType.js';
import { Util } from '../util/util.js';

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
 * ImportFile MetadataType
 *
 * @augments MetadataType
 */
class FileLocation extends MetadataType {
    static cache = {};
    /**
     * Retrieves Metadata of FileLocation
     * Endpoint /automation/v1/ftplocations/ return all FileLocations
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise
     */
    static async retrieve(retrieveDir, _, __, key) {
        try {
            const keyFieldBak = this.definition.keyField;
            this.definition.keyField = this.definition.nameField; // to be able to map data endpoint results by name temporarily
            const dataItems = await super.retrieveREST(
                null,
                '/data/v1/filetransferlocation' + (key ? '/' + encodeURIComponent(key) : 's'),
                null,
                key
            );
            this.definition.keyField = keyFieldBak;
            this.cache.dataItems = dataItems.metadata;
        } catch (ex) {
            if (ex.code === 'ERR_BAD_REQUEST') {
                // if retrieve-by-key comes up empty, the data-endpoint returns a code 400
                Util.logger.debug(ex.message);
            } else {
                Util.logger.warn(ex.message);
            }
        }
        const items = await super.retrieveREST(
            retrieveDir,
            '/automation/v1/ftplocations/',
            null,
            key
        );

        return items;
    }

    /**
     * Retrieves folder metadata into local filesystem. Also creates a uniquePath attribute for each folder.
     *
     * @returns {Promise.<MetadataTypeMapObj>} Promise
     */
    static async retrieveForCache() {
        return this.retrieve(null);
    }

    /**
     * Creates a single item
     *
     * @param {MetadataTypeItem} metadata a single item
     * @returns {Promise.<MetadataTypeItem>} Promise
     */
    static create(metadata) {
        return this.createREST(metadata, '/data/v1/filetransferlocation');
    }
    /**
     * Updates a single item
     *
     * @param {MetadataTypeItem} metadata a single item
     * @returns {Promise.<MetadataTypeItem>} Promise
     */
    static update(metadata) {
        return this.updateREST(
            metadata,
            '/data/v1/filetransferlocation/' +
                encodeURIComponent(metadata[this.definition.keyField])
        );
    }

    /**
     * helper for {@link parseResponseBody} that creates a custom key field for this type based on mobileCode and keyword
     *
     * @param {MetadataTypeItem} metadata single item
     */
    static createCustomKeyField(metadata) {
        if (metadata.fileTransferLocation) {
            const fileTransferLocation = metadata.fileTransferLocation;
            for (const key of Object.keys(metadata)) {
                delete metadata[key];
            }
            Object.assign(metadata, fileTransferLocation);
        }
        // old file location types are only returned by the automation-endpoint which does not return customerKey field - but also these are not updatable and hence we can improvise here

        metadata.customerKey ||= metadata.name;
    }

    /**
     * Creates a single metadata entry via REST
     *
     * @param {MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {string} uri rest endpoint for POST
     * @param {boolean} [handleOutside] if the API reponse is irregular this allows you to handle it outside of this generic method
     * @returns {Promise.<object> | null} Promise of API response or null in case of an error
     */
    static async createREST(metadataEntry, uri, handleOutside) {
        this.removeNotCreateableFields(metadataEntry);
        const createPayload = { fileTransferLocation: metadataEntry };
        try {
            // set to empty object in case API returned nothing to be able to update it in helper classes
            let response = (await this.client.rest.post(uri, createPayload)) || {};
            response = await this.postCreateTasks(metadataEntry, response);
            if (!handleOutside) {
                Util.logger.info(
                    ` - created ${Util.getTypeKeyName(this.definition, metadataEntry)}`
                );
            }
            return response;
        } catch (ex) {
            const parsedErrors = this.getErrorsREST(ex);
            Util.logger.error(
                ` ☇ error creating ${Util.getTypeKeyName(this.definition, metadataEntry)}:`
            );
            if (parsedErrors.length) {
                for (const msg of parsedErrors) {
                    Util.logger.error('   • ' + msg);
                }
            } else if (ex?.message) {
                Util.logger.debug(ex.message);
            }
            return null;
        }
    }

    /**
     * helper for {@link MetadataType.createREST}
     *
     * @param {MetadataTypeItem} _ a single metadata Entry
     * @param {object} apiResponse varies depending on the API call
     * @returns {Promise.<object>} apiResponse, potentially modified
     */
    static async postCreateTasks(_, apiResponse) {
        return apiResponse?.fileTransferLocation || apiResponse;
    }

    /**
     * Updates a single metadata entry via REST
     *
     * @param {MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {string} uri rest endpoint for PATCH
     * @param {'patch'|'post'|'put'} [httpMethod] defaults to 'patch'; some update requests require PUT instead of PATCH
     * @param {boolean} [handleOutside] if the API reponse is irregular this allows you to handle it outside of this generic method
     * @returns {Promise.<object> | null} Promise of API response or null in case of an error
     */
    static async updateREST(metadataEntry, uri, httpMethod = 'patch', handleOutside) {
        this.removeNotUpdateableFields(metadataEntry);
        const updatePayload = { fileTransferLocation: metadataEntry };
        try {
            // set to empty object in case API returned nothing to be able to update it in helper classes
            let response = (await this.client.rest[httpMethod](uri, updatePayload)) || {};
            await this._postChangeKeyTasks(metadataEntry);
            this.getErrorsREST(response);
            response = await this.postUpdateTasks(metadataEntry, response);
            // some times, e.g. automation dont return a key in their update response and hence we need to fall back to name
            if (!handleOutside) {
                Util.logger.info(
                    ` - updated ${Util.getTypeKeyName(this.definition, metadataEntry)}`
                );
            }
            return response;
        } catch (ex) {
            const parsedErrors = this.getErrorsREST(ex);
            Util.logger.error(
                ` ☇ error updating ${Util.getTypeKeyName(this.definition, metadataEntry)}:`
            );
            for (const msg of parsedErrors) {
                Util.logger.error('   • ' + msg);
            }
            return null;
        }
    }

    /**
     * helper for {@link MetadataType.updateREST} and {@link MetadataType.updateSOAP}
     *
     * @param {MetadataTypeItem} _ a single metadata Entry
     * @param {object} apiResponse varies depending on the API call
     * @returns {Promise.<object>} apiResponse, potentially modified
     */
    static postUpdateTasks(_, apiResponse) {
        return apiResponse?.fileTransferLocation || apiResponse;
    }
    /**
     * prepares a import definition for deployment
     *
     * @param {MetadataTypeItem} metadata a single importDef
     * @returns {Promise.<MetadataTypeItem>} Promise
     */
    static async preDeployTasks(metadata) {
        if (metadata.c__locationType) {
            metadata.locationTypeId = this.definition.locationTypeMapping[metadata.c__locationType];
            if (this.definition.locationTypeMappingDeployable[metadata.c__locationType]) {
                metadata.locationType =
                    this.definition.locationTypeMappingDeployable[metadata.c__locationType];
            } else {
                throw new Error(
                    `Only FileLocations of types ${this.definition.locationTypeMappingDeployable.join(', ')} can be deployed via mcdev.`
                );
            }
        }
        return metadata;
    }

    /**
     * manages post retrieve steps
     *
     * @param {MetadataTypeItem} metadata a single item
     * @returns {MetadataTypeItem} parsed metadata
     */
    static postRetrieveTasks(metadata) {
        if (metadata.locationTypeId !== undefined) {
            if (
                metadata.locationTypeId >= 13 &&
                this.cache.dataItems[metadata[this.definition.nameField]]
            ) {
                Object.assign(metadata, this.cache.dataItems[metadata[this.definition.nameField]]);
            }

            try {
                metadata.c__locationType = Util.inverseGet(
                    this.definition.locationTypeMapping,
                    metadata.locationTypeId
                );
                delete metadata.locationTypeId;
            } catch {
                Util.logger.info(
                    'Please report this new & unknown locationTypeId to the mcdev developer team via github: ' +
                        metadata.locationTypeId
                );
            }
        } else if (metadata.locationType) {
            // assuming create/update of new types
            metadata.c__locationType = Util.inverseGet(
                this.definition.locationTypeMappingDeployable,
                metadata.locationType
            );
        }
        return metadata;
    }

    /**
     * Delete a metadata item from the specified business unit
     *
     * @param {string} key Identifier of data extension
     * @returns {Promise.<boolean>} deletion success flag
     */
    static async deleteByKey(key) {
        // delete only works with the query's object id
        return super.deleteByKeyREST(
            '/data/v1/filetransferlocation/' + encodeURIComponent(key),
            key
        );
    }
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
FileLocation.definition = MetadataTypeDefinitions.fileLocation;

export default FileLocation;
