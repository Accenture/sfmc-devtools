'use strict';

/**
 * @typedef {Object} FilterItem
 * @property {number} categoryId folder id
 * @property {string} [createdDate] -
 * @property {string} customerKey key
 * @property {string} destinationObjectId DE/List ID
 * @property {1|2|3|4} destinationTypeId 1:SubscriberList, 2:DataExtension, 3:GroupWizard, 4:BehavioralData
 * @property {string} filterActivityId ?
 * @property {string} filterDefinitionId ObjectID of filterDefinition
 * @property {string} modifiedDate -
 * @property {string} name name
 * @property {string} sourceObjectId DE/List ID
 * @property {1|2|3|4} sourceTypeId 1:SubscriberList, 2:DataExtension, 3:GroupWizard, 4:BehavioralData
 * @property {number} statusId ?
 *
 * @typedef {Object.<string, FilterItem>} FilterMap
 */

const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const cache = require('../util/cache');

const dataTypes = {
    1: 'List',
    2: 'DataExtension',
    3: 'Group Wizard',
    4: 'Behavioral Data',
};

/**
 * Filter MetadataType
 * @augments MetadataType
 */
class Filter extends MetadataType {
    /**
     * Retrieves Metadata of Filter.
     * Endpoint /automation/v1/filters/ returns all Filters,
     * but only with some of the fields. So it is needed to loop over
     * Filters with the endpoint /automation/v1/filters/{id}
     * @param {String} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise<{metadata:FilterMap,type:string}>} Promise of items
     */
    static async retrieve(retrieveDir) {
        return super.retrieveREST(retrieveDir, '/automation/v1/filters/', null);
    }
    /**
     * manages post retrieve steps
     * @param {FilterItem} item a single record
     * @returns {FilterItem} parsed metadata definition
     */
    static postRetrieveTasks(item) {
        return this.parseMetadata(item);
    }
    /**
     * parses retrieved Metadata before saving
     * @param {FilterItem} metadata a single record
     * @returns {FilterItem} parsed metadata definition
     */
    static parseMetadata(metadata) {
        try {
            // folder
            metadata.r__folder_Path = cache.searchForField(
                'folder',
                metadata.categoryId,
                'ID',
                'Path'
            );
            delete metadata.categoryId;

            // filterDefinition
            metadata.r__filterDefinition_CustomerKey = cache.searchForField(
                'filterDefinition',
                metadata.filterDefinitionId,
                'id',
                'key'
            );
            delete metadata.filterDefinitionId;

            // source
            if (metadata.sourceTypeId === 1) {
                // list
            } else if (metadata.sourceTypeId === 2) {
                // dataExtension
                metadata.r__source_dataExtension_CustomerKey = cache.searchForField(
                    'dataExtension',
                    metadata.sourceObjectId,
                    'ObjectID',
                    'CustomerKey'
                );
                delete metadata.sourceObjectId;
                delete metadata.sourceTypeId;
            } else {
                Util.logger.warn(
                    `Filter '${metadata.name}' (${metadata.customerKey}): Unsupported source type ${
                        metadata.sourceTypeId
                    }=${dataTypes[metadata.sourceTypeId]}`
                );
            }

            // target
            if (metadata.destinationTypeId === 1) {
                // list
            } else if (metadata.destinationTypeId === 2) {
                // dataExtension
                metadata.r__destination_dataExtension_CustomerKey = cache.searchForField(
                    'dataExtension',
                    metadata.destinationObjectId,
                    'ObjectID',
                    'CustomerKey'
                );
                delete metadata.destinationObjectId;
                delete metadata.destinationTypeId;
            } else {
                Util.logger.warn(
                    `Filter '${metadata.name}' (${
                        metadata.customerKey
                    }): Unsupported destination type ${metadata.destinationTypeId}=${
                        dataTypes[metadata.destinationTypeId]
                    }`
                );
            }
        } catch (ex) {
            Util.logger.warn(`Filter '${metadata.name}' (${metadata.customerKey}): ${ex.message}`);
        }
        return metadata;
    }
    /**
     * prepares a record for deployment
     * @param {FilterItem} metadata a single record
     * @returns {Promise<FilterItem>} Promise of updated single record
     */
    static async preDeployTasks(metadata) {
        // folder
        if (metadata.r__folder_Path) {
            metadata.categoryId = cache.searchForField(
                'folder',
                metadata.r__folder_Path,
                'Path',
                'ID'
            );
            delete metadata.r__folder_Path;
        }

        // filterDefinition
        if (metadata.r__filterDefinition_CustomerKey) {
            metadata.filterDefinitionId = cache.searchForField(
                'filterDefinition',
                metadata.r__filterDefinition_CustomerKey,
                'CustomerKey',
                'ObjectID'
            );
            delete metadata.r__filterDefinition_CustomerKey;
        }

        // source
        if (metadata.sourceTypeId === 1) {
            // list
        } else if (metadata.r__source_dataExtension_CustomerKey) {
            // dataExtension
            metadata.sourceObjectId = cache.searchForField(
                'dataExtension',
                metadata.r__source_dataExtension_CustomerKey,
                'CustomerKey',
                'ObjectID'
            );
            metadata.sourceTypeId = 2;
            delete metadata.r__source_dataExtension_CustomerKey;
        } else {
            // assume the type id is still in the metadata
            throw new Error(
                `Filter '${metadata.name}' (${metadata.customerKey}): Unsupported source type ${
                    metadata.sourceTypeId
                }=${dataTypes[metadata.sourceTypeId]}`
            );
        }

        // target
        if (metadata.destinationTypeId === 1) {
            // list
        } else if (metadata.r__destination_dataExtension_CustomerKey) {
            // dataExtension
            metadata.destinationObjectId = cache.searchForField(
                'dataExtension',
                metadata.r__destination_dataExtension_CustomerKey,
                'CustomerKey',
                'ObjectID'
            );
            metadata.destinationTypeId = 2;
            delete metadata.r__destination_dataExtension_CustomerKey;
        } else {
            // assume the type id is still in the metadata
            throw new Error(
                `Filter '${metadata.name}' (${
                    metadata.customerKey
                }): Unsupported destination type ${metadata.destinationTypeId}=${
                    dataTypes[metadata.destinationTypeId]
                }`
            );
        }

        return metadata;
    }
}

// Assign definition to static attributes
Filter.definition = require('../MetadataTypeDefinitions').filter;

module.exports = Filter;
