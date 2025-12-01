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
        this.setFolderPath(metadata);

        try {
            // filterDefinition
            metadata.r__filterDefinition_CustomerKey = cache.searchForField(
                'filterDefinition',
                metadata.filterDefinitionId,
                'id',
                'key'
            );
            delete metadata.filterDefinitionId;
        } catch {
            try {
                // filterDefinitionHidden - auto-generated for filtered dataExtensions
                metadata.r__filterDefinition_CustomerKey = cache.searchForField(
                    'filterDefinitionHidden',
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
            // source
            switch (metadata[`${target}TypeId`]) {
                // case 1: {
                //     // List
                //     // TODO
                //     break;
                case 2: {
                    // dataExtension
                    metadata[`r__${target}_dataExtension_CustomerKey`] = cache.searchForField(
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
     * prepares a record for deployment
     *
     * @param {FilterItem} metadata a single record
     * @returns {Promise.<FilterItem>} Promise of updated single record
     */
    static async preDeployTasks(metadata) {
        // folder
        if (metadata.r__folder_Path) {
            metadata.categoryId = Number(
                cache.searchForField('folder', metadata.r__folder_Path, 'Path', 'ID')
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
                ` - Filter '${metadata.name}' (${metadata.customerKey}): Unsupported source type ${
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
                ` - Filter '${metadata.name}' (${
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
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
Filter.definition = MetadataTypeDefinitions.filter;

export default Filter;
