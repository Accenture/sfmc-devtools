'use strict';

import MetadataType from './MetadataType.js';
import { Util } from '../util/util.js';
import cache from '../util/cache.js';

const dataTypes = {
    1: 'List',
    2: 'DataExtension',
    3: 'Group Wizard',
    4: 'Behavioral Data',
};

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
 * @typedef {import('../../types/mcdev.d.js').FilterItem} FilterItem
 */

/**
 * Filter MetadataType
 *
 * @augments MetadataType
 */
class Filter extends MetadataType {
    /**
     * Retrieves Metadata of Filter.
     * Endpoint /automation/v1/filters/ returns all Filters,
     * but only with some of the fields. So it is needed to loop over
     * Filters with the endpoint /automation/v1/filters/{id}
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise
     */
    static async retrieve(retrieveDir, _, __, key) {
        return super.retrieveREST(retrieveDir, '/automation/v1/filters/', null, key);
    }
    /**
     * parses retrieved Metadata before saving
     *
     * @param {FilterItem} metadata a single record
     * @returns {FilterItem} parsed metadata definition
     */
    static postRetrieveTasks(metadata) {
        // folder
        super.setFolderPath(metadata);

        try {
            // filterDefinition
            metadata.r__dataFilter_key = cache.searchForField(
                'dataFilter',
                metadata.filterDefinitionId,
                'id',
                'key'
            );
            delete metadata.filterDefinitionId;
        } catch {
            try {
                // filterDefinitionHidden - auto-generated for filtered dataExtensions
                metadata.r__dataFilter_key = cache.searchForField(
                    'dataFilterHidden',
                    metadata.filterDefinitionId,
                    'id',
                    'key'
                );
                delete metadata.filterDefinitionId;
            } catch {
                // ignore
            }
        }

        this._postRetrieve_dataTypeMapping('source', metadata);
        this._postRetrieve_dataTypeMapping('destination', metadata);
        return metadata;
    }

    /**
     * helper for postRetrieveTasks to map data types
     *
     * @param {'source'|'destination'} target we are processing source and destinations
     * @param {FilterItem} metadata single record
     */
    static _postRetrieve_dataTypeMapping(target, metadata) {
        try {
            switch (metadata[`${target}TypeId`]) {
                // case 1: {
                //     // List
                //     // TODO
                //     break;
                case 2: {
                    // dataExtension
                    metadata[`r__${target}_dataExtension_key`] = cache.searchForField(
                        'dataExtension',
                        metadata[`${target}ObjectId`],
                        'ObjectID',
                        'CustomerKey'
                    );
                    delete metadata[`${target}ObjectId`];
                    delete metadata[`${target}TypeId`];
                    break;
                }
                // case 3: {
                //     // GroupWizard
                //     // TODO
                //     break;
                // }
                // case 4: {
                //     // BehavioralData
                //     // TODO
                //     break;
                // }
                default: {
                    Util.logger.warn(
                        ` - Filter '${metadata.name}' (${
                            metadata.customerKey
                        }): Unsupported ${target} type '${dataTypes[metadata[`${target}TypeId`]]}'`
                    );
                }
            }
        } catch (ex) {
            Util.logger.warn(
                ` - filter '${metadata.name}' (${metadata.customerKey}): ${target} not found (${ex.message})`
            );
        }
    }
    /**
     * helper for preDeployTasks to map data types
     *
     * @param {'source'|'destination'} target we are processing source and destinations
     * @param {FilterItem} metadata single record
     */
    static _preDeploy_dataTypeMapping(target, metadata) {
        // TODO List / TypeId==1

        // dataExtension
        if (metadata[`r__${target}_dataExtension_key`]) {
            metadata[`${target}TypeId`] = 2;

            metadata[`${target}ObjectId`] = cache.searchForField(
                'dataExtension',
                metadata[`r__${target}_dataExtension_key`],
                'CustomerKey',
                'ObjectID'
            );
            if (target === 'source') {
                // this seems to be duplicated in update calls from the GUI
                metadata.filterDefinitionSourceTypeId = metadata[`${target}TypeId`];
                metadata.sourceId = null;
            } else if (target === 'destination') {
                const deItem = cache.getByKey(
                    'dataExtension',
                    metadata[`r__${target}_dataExtension_key`]
                );
                metadata.resultDEDescription = deItem?.Description || '';
                metadata.resultDEName = deItem?.Name || '';
                metadata.resultDEKey = deItem?.CustomerKey || '';

                metadata.resultGroupFolderId = null;
                metadata.resultGroupName = null;
            }
            delete metadata[`r__${target}_dataExtension_key`];
        }

        // TODO GroupWizard / TypeId==3

        // TODO BehavioralData / TypeId==4
    }

    /**
     * Creates a single item
     * this uses soap API because the rest api does not allow hotlinking to an existing target DE
     *
     * @param {FilterItem} item a single item
     * @returns {Promise} Promise
     */
    static async create(item) {
        // create: POST automation/v1/filters/
        // {"filterDefinitionId":"4b9adc79-8f56-488c-9910-ab7ad7afc13a","name":"jb_talent_flat_2_gui","description":"","categoryId":"5319","sourceId":null,"resultGroupFolderId":null,"resultGroupName":null,"filterDefinitionSourceTypeId":2,"folderLocationText":"Filter","customerKey":"jb_talent_flat_2_gui","resultDEName":"jb_talent_flat_2_gui","resultDEKey":"jb_talent_flat_2_gui","resultDEDescription":""}
        // return super.createREST(item, '/automation/v1/filters/');

        const response = await super.createSOAP(this.preCreateSOAPItem(item));
        return this.postCreateTasks(item, response);
    }

    /**
     * helper that converts the rest item into a soap item
     *
     * @param {FilterItem} item a single item
     * @returns {object} SOAP formatted filter item
     */
    static preCreateSOAPItem(item) {
        return {
            FilterDefinitionID: item.filterDefinitionId,
            Name: item.name,
            Description: item.description || '',
            // CategoryID: item.categoryId,
            CustomerKey: item.customerKey,
            DestinationTypeID: item.destinationTypeId,
            DestinationObjectID: item.destinationObjectId,
            SourceTypeID: item.sourceTypeId,
            SourceObjectID: item.sourceObjectId,
        };
    }

    /**
     * helper that runs update on all create calls to ensure all fields are set
     *
     * @param {FilterItem} restItem original rest item
     * @param {object} response SOAP response
     * @returns {Promise.<FilterItem>} created item
     */
    static async postCreateTasks(restItem, response) {
        if (!response) {
            return response;
        }
        const soapItem = response.Results?.[0].Object;
        restItem.filterActivityId = soapItem.FilterActivityID;
        return this.update(restItem);
    }
    /**
     * Updates a single item
     *
     * @param {MetadataTypeItem} item a single item
     * @returns {Promise} Promise
     */
    static update(item) {
        return super.updateREST(item, '/automation/v1/filters/' + item[this.definition.idField]);
    }

    /**
     * prepares a record for deployment
     *
     * @param {FilterItem} metadata a single record
     * @returns {Promise.<FilterItem>} Promise of updated single record
     */
    static async preDeployTasks(metadata) {
        // folder
        super.setFolderId(metadata);

        // filterDefinition
        if (metadata.r__dataFilter_key) {
            metadata.filterDefinitionId = cache.searchForField(
                'dataFilter',
                metadata.r__dataFilter_key,
                'key',
                'id'
            );
            delete metadata.r__dataFilter_key;
        }
        if (!metadata.description) {
            metadata.description = '';
        }

        metadata.resultGroupFolderId = null;
        metadata.sourceId = null;

        this._preDeploy_dataTypeMapping('source', metadata);
        this._preDeploy_dataTypeMapping('destination', metadata);

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
        const response = await this.client.soap.retrieve(this.definition.soapType, ['ObjectID'], {
            filter: {
                leftOperand: name ? 'Name' : 'CustomerKey',
                operator: 'equals',
                rightOperand: name || key,
            },
        });
        return response?.Results?.length ? response.Results[0].ObjectID : null;
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
        return super.deleteByKeyREST('/automation/v1/filters/' + objectId, key);
    }
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
Filter.definition = MetadataTypeDefinitions.filter;

export default Filter;
