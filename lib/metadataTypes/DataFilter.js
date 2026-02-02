'use strict';

import MetadataType from './MetadataType.js';
import { Util } from '../util/util.js';
import cache from '../util/cache.js';
import DataExtensionField from './DataExtensionField.js';
import Folder from './Folder.js';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import File from '../util/file.js';

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
 * @typedef {import('../../types/mcdev.d.js').DataFilterItem} DataFilterItem
 * @typedef {import('../../types/mcdev.d.js').DataFilterMap} DataFilterMap
 * @typedef {import('../../types/mcdev.d.js').MultiMetadataTypeMap} MultiMetadataTypeMap
 * @typedef {import('../../types/mcdev.d.js').FilterConditionSet} FilterConditionSet
 * @typedef {import('../../types/mcdev.d.js').FilterCondition} FilterCondition
 */

/**
 * DataFilter (FilterDefinition) MetadataType
 *
 * @augments MetadataType
 */
class DataFilter extends MetadataType {
    static cache = {}; // type internal cache for various things
    static deIdKeyMap;
    static hidden = false;
    /**
     * Retrieves all records and saves it to disk
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {string[]} [_] unused parameter
     * @param {string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<{metadata: DataFilterMap, type: string}>} Promise of items
     */
    static async retrieve(retrieveDir, _, __, key) {
        Util.logBeta(this.definition.type);
        /** @type {DataFilterMap} */
        const filterDefinitionMap = {};

        const objectId = key ? await this._getObjectIdForSingleRetrieve(key) : null;
        if (objectId) {
            const metadataMapSingle = await super.retrieveREST(
                null,
                '/email/v1/filters/filterdefinition/' + objectId,
                null,
                key
            );
            Object.assign(filterDefinitionMap, metadataMapSingle.metadata);
        } else {
            const filterFolders = await this._getFilterFolderIds();

            for (const folderId of filterFolders) {
                // TODO - compare to automation/v1/filterdefinitions/
                // get by id: GET automation/v1/filterdefinitions/<objectid>
                // get collection: GET automation/v1/filterdefinitions?view=categoryinfo (no folder ids required!)
                // create: POST automation/v1/filters/
                const metadataMapFolder = await super.retrieveREST(
                    null,
                    'email/v1/filters/filterdefinition/category/' +
                        folderId +
                        '?derivedFromType=1,2,3,4&',
                    null,
                    key
                );
                if (Object.keys(metadataMapFolder.metadata).length) {
                    Object.assign(filterDefinitionMap, metadataMapFolder.metadata);
                    if (filterDefinitionMap[key]) {
                        // if key was found we can stop checking other folders
                        break;
                    }
                }
            }
        }
        // /** @type {DataFilterMap} */
        // const filterDefinitionMap = metadataTypeMapObj.metadata;
        for (const item of Object.values(filterDefinitionMap)) {
            // description is not returned when emptyg
            item.description ||= '';
        }
        if (retrieveDir) {
            // custom dataExtensionField caching
            await this._cacheDeFields(filterDefinitionMap, 'retrieve');
            // await this._cacheContactAttributes(filterDefinitionMap);
            // await this._cacheMeasures(filterDefinitionMap);

            const savedMetadata = await this.saveResults(filterDefinitionMap, retrieveDir);
            Util.logger.info(
                `Downloaded: ${this.definition.type} (${Object.keys(savedMetadata).length})` +
                    Util.getKeysString(key)
            );
        }

        return { metadata: filterDefinitionMap, type: this.definition.type };
    }
    /**
     * helper for {@link DataFilter.retrieve}
     *
     * @param {boolean} [recached] indicates if this is a recursive call after cache refresh
     * @returns {Promise.<number[]>} Array of folder IDs
     */
    static async _getFilterFolderIds(recached = false) {
        const fromCache =
            this.cache.folderFilter || cache.getCache().folder
                ? Object.values(this.cache.folderFilter || cache.getCache().folder)
                      .filter((item) => item.ContentType === 'filterdefinition')
                      .filter(
                          (item) =>
                              (!this.hidden && item.Path.startsWith('Data Filters')) ||
                              (this.hidden && !item.Path.startsWith('Data Filters'))
                      ) // only retrieve from Data Filters folder
                      .map((item) => item.ID)
                : [];
        if (fromCache.length) {
            return fromCache;
        }
        if (recached) {
            Util.logger.debug('_getFilterFolderIds: could not find filterdefinition folders');
            return [];
        }

        const subTypeArr = ['hidden', 'filterdefinition'];
        Util.logger.info(` - Caching dependent Metadata: folder`);
        Util.logSubtypes(subTypeArr);

        Folder.client = this.client;
        Folder.buObject = this.buObject;
        Folder.properties = this.properties;
        this.cache.folderFilter = (await Folder.retrieveForCache(null, subTypeArr)).metadata;
        return this._getFilterFolderIds(true);
    }
    /**
     * helper for {@link DataFilter._cacheMeasures}
     *
     * @returns {Promise.<number[]>} Array of folder IDs
     */
    static async _getMeasureFolderIds() {
        const fromCache =
            this.cache.folderMeasure?.[this.buObject.mid] || cache.getCache().folder
                ? Object.values(
                      this.cache.folderMeasure?.[this.buObject.mid] || cache.getCache().folder
                  )
                      .filter((item) => item.ContentType === 'measure')
                      .map((item) => item.ID)
                : [];
        if (fromCache.length) {
            return fromCache;
        }

        const subTypeArr = ['measure'];
        Util.logger.info(` - Caching dependent Metadata: folder`);
        Util.logSubtypes(subTypeArr);

        Folder.client = this.client;
        Folder.buObject = this.buObject;
        Folder.properties = this.properties;
        this.cache.folderMeasure ||= {};
        this.cache.folderMeasure[this.buObject.mid] = (
            await Folder.retrieveForCache(null, subTypeArr)
        ).metadata;
        return this._getMeasureFolderIds();
    }

    /**
     * helper for {@link DataFilter.retrieve}. uses cached dataExtensions to resolve dataExtensionFields
     *
     * @param {DataFilterMap} metadataTypeMap -
     * @param {'retrieve'|'deploy'} [mode] -
     */
    static async _cacheDeFields(metadataTypeMap, mode) {
        const deKeys =
            mode === 'retrieve'
                ? Object.values(metadataTypeMap)
                      .filter((item) => item.derivedFromObjectTypeName === 'DataExtension')
                      .filter((item) => item.derivedFromObjectId)
                      .map((item) => {
                          try {
                              const deKey = cache.searchForField(
                                  'dataExtension',
                                  item.derivedFromObjectId,
                                  'ObjectID',
                                  'CustomerKey'
                              );
                              if (deKey) {
                                  this.deIdKeyMap ||= {};
                                  this.deIdKeyMap[item.derivedFromObjectId] = deKey;
                                  return deKey;
                              }
                          } catch {
                              return null;
                          }
                      })
                      .filter(Boolean)
                : Object.values(metadataTypeMap)
                      .filter((item) => item.r__source_dataExtension_key)
                      .map((item) => item.r__source_dataExtension_key)
                      .filter(Boolean);
        if (deKeys.length) {
            Util.logger.info(' - Caching dependent Metadata: dataExtensionField');
            // only proceed with the download if we have dataExtension keys
            const fieldOptions = {};
            for (const deKey of deKeys) {
                fieldOptions.filter = fieldOptions.filter
                    ? {
                          leftOperand: {
                              leftOperand: 'DataExtension.CustomerKey',
                              operator: 'equals',
                              rightOperand: deKey,
                          },
                          operator: 'OR',
                          rightOperand: fieldOptions.filter,
                      }
                    : {
                          leftOperand: 'DataExtension.CustomerKey',
                          operator: 'equals',
                          rightOperand: deKey,
                      };
            }
            DataExtensionField.buObject = this.buObject;
            DataExtensionField.client = this.client;
            DataExtensionField.properties = this.properties;
            this.dataExtensionFieldCache = (
                await DataExtensionField.retrieveForCacheDE(fieldOptions, ['Name', 'ObjectID'])
            ).metadata;
        }
    }
    /**
     * helper for {@link DataFilter.retrieve}
     *
     * @param {DataFilterMap} metadataTypeMap -
     */
    static async _cacheContactAttributes(metadataTypeMap) {
        if (this.cache.contactAttributes?.[this.buObject.mid]) {
            return;
        }
        const subscriberFilters = Object.values(metadataTypeMap)
            .filter((item) => item.derivedFromObjectTypeName === 'SubscriberAttributes')
            .filter((item) => item.derivedFromObjectId);
        if (subscriberFilters.length) {
            Util.logger.info(' - Caching dependent Metadata: contactAttributes');
            const response = await this.client.rest.get('/email/v1/Contacts/Attributes/');
            const keyFieldBackup = this.definition.keyField;
            this.definition.keyField = 'id';
            this.cache.contactAttributes ||= {};
            this.cache.contactAttributes[this.buObject.mid] = this.parseResponseBody(response);
            this.definition.keyField = keyFieldBackup;
        }
    }
    /**
     * helper for {@link DataFilter.retrieve}
     *
     * @param {DataFilterMap} metadataTypeMap -
     */
    static async _cacheMeasures(metadataTypeMap) {
        if (this.cache.measures?.[this.buObject.mid]) {
            return;
        }
        const subscriberFilters = Object.values(metadataTypeMap)
            .filter((item) => item.derivedFromObjectTypeName === 'SubscriberAttributes')
            .filter((item) => item.derivedFromObjectId);
        const measureFolders = await this._getMeasureFolderIds();
        if (subscriberFilters.length) {
            Util.logger.info(' - Caching dependent Metadata: measure');
            const response = { items: [] };
            for (const folderId of measureFolders) {
                const metadataMapFolder = await this.client.rest.getBulk(
                    'email/v1/Measures/category/' + folderId + '/',
                    250 // 250 is what the GUI is using
                );
                if (Object.keys(metadataMapFolder.items).length) {
                    response.items.push(...metadataMapFolder.items);
                }
            }

            const keyFieldBackup = this.definition.keyField;
            this.definition.keyField = 'measureID';
            this.cache.measures ||= {};
            this.cache.measures[this.buObject.mid] = this.parseResponseBody(response);
            this.definition.keyField = keyFieldBackup;
        }
    }

    /**
     * Retrieves all records for caching
     *
     * @returns {Promise.<{metadata: DataFilterMap, type: string}>} Promise of items
     */
    static async retrieveForCache() {
        return this.retrieve(null);
    }

    /**
     * parses retrieved Metadata before saving
     *
     * @param {DataFilterItem} metadata a single record
     * @returns {Promise.<DataFilterItem>} parsed metadata definition
     */
    static async postRetrieveTasks(metadata) {
        // if (metadata.derivedFromType > 4) {
        //     // GUI only shows types 1,2,3,4; lets mimic that here.
        //     // type 6 seems to be journey related. Maybe we need to change that again in the future
        //     return;
        // }
        // folder
        super.setFolderPath(metadata);

        // parse XML filter for further processing in JSON format
        const xmlToJson = new XMLParser({
            preserveOrder: false, // XML parser returns undefined if this is true
            ignoreAttributes: false,
            allowBooleanAttributes: true,
        });
        metadata.c__filterDefinition = xmlToJson.parse(
            metadata.filterDefinitionXml
        )?.FilterDefinition;
        delete metadata.filterDefinitionXml;
        switch (metadata.derivedFromType) {
            case 1: {
                // if (metadata.c__filterDefinition['@_Source'] === 'SubscriberAttribute') {
                //     if (
                //         metadata.derivedFromObjectId &&
                //         metadata.derivedFromObjectId !== '00000000-0000-0000-0000-000000000000'
                //     ) {
                //         // Lists
                //         try {
                //             metadata.r__source_list_PathName = cache.getListPathName(
                //                 metadata.derivedFromObjectId,
                //                 'ObjectID'
                //             );
                //         } catch {
                //             Util.logger.warn(
                //                 ` - skipping ${this.definition.type} ${metadata.key}: list ${metadata.derivedFromObjectId} not found on current or Parent BU`
                //             );
                //         }
                //     } else {
                //         // SubscriberAttributes
                //         // - nothing to do
                //     }
                // }
                // // SubscriberAttributes
                // this._postRetrieve_resolveAttributeIds(metadata);
                // delete metadata.derivedFromObjectId;
                // delete metadata.derivedFromObjectName;
                // delete metadata.derivedFromObjectTypeName;
                // delete metadata.derivedFromType;
                // delete metadata.c__filterDefinition['@_Source'];
                break;
            }
            case 2: {
                // DataExtension + XXX?
                if (
                    metadata.c__filterDefinition['@_Source'] === 'Meta' ||
                    metadata.derivedFromObjectId === '00000000-0000-0000-0000-000000000000'
                ) {
                    // TODO - weird so far not understood case of Source=Meta
                    // sample: <FilterDefinition Source=\"Meta\"><Include><ConditionSet Operator=\"OR\" ConditionSetName=\"Individual Filter Grouping\"><Condition ID=\"55530cec-1df4-e611-80cc-1402ec7222b4\" isParam=\"false\" isPathed=\"true\"  pathAttrGroupID=\"75530cec-1df4-e611-80cc-1402ec7222b4\" Operator=\"Equal\"><Value><![CDATA[994607]]></Value></Condition><Condition ID=\"55530cec-1df4-e611-80cc-1402ec7222b4\" isParam=\"false\" isPathed=\"true\"  pathAttrGroupID=\"75530cec-1df4-e611-80cc-1402ec7222b4\" Operator=\"Equal\"><Value><![CDATA[3624804]]></Value></Condition></ConditionSet></Include><Exclude></Exclude></FilterDefinition>
                } else if (metadata.c__filterDefinition['@_Source'] === 'DataExtension') {
                    // DataExtension
                    try {
                        metadata.r__source_dataExtension_key =
                            this.deIdKeyMap?.[metadata.derivedFromObjectId] ||
                            cache.searchForField(
                                'dataExtension',
                                metadata.derivedFromObjectId,
                                'ObjectID',
                                'CustomerKey'
                            );
                        delete metadata.derivedFromObjectName;
                        delete metadata.derivedFromObjectTypeName;
                    } catch {
                        Util.logger.debug(
                            ` - skipping ${this.definition.type} ${metadata.key}: dataExtension ${metadata.derivedFromObjectId} not found on BU`
                        );
                        return;
                    }
                    this._resolveFields(metadata, 'postRetrieve');

                    delete metadata.derivedFromObjectId;
                    delete metadata.derivedFromType;
                    delete metadata.c__filterDefinition['@_Source'];
                    delete metadata.c__filterDefinition['@_SourceID'];
                }
                break;
            }
        }

        return metadata;
    }

    /**
     * helper for {@link postRetrieveTasks}
     *
     * @param {DataFilterItem} metadata -
     * @param {'postRetrieve'|'preDeploy'} mode -
     * @param {object[]} [fieldCache] -
     * @param {FilterConditionSet} [filter] -
     * @returns {void}
     */
    static _resolveFields(metadata, mode, fieldCache, filter) {
        if (!filter) {
            return this._resolveFields(
                metadata,
                mode,
                Object.values(this.dataExtensionFieldCache),
                metadata.c__filterDefinition?.ConditionSet
            );
        }
        if (filter.Condition) {
            const conditionsArr = Array.isArray(filter.Condition)
                ? filter.Condition
                : [filter.Condition];
            if (mode === 'postRetrieve') {
                for (const condition of conditionsArr) {
                    this._postRetrieve_resolveFieldIdsCondition(condition, fieldCache);
                }
            } else if (mode === 'preDeploy') {
                for (const condition of conditionsArr) {
                    this._preDeploy_resolveFieldNamesCondition(condition, fieldCache);
                }
            }
        }
        if (filter.ConditionSet) {
            const conditionSet = Array.isArray(filter.ConditionSet)
                ? filter.ConditionSet
                : [filter.ConditionSet];
            for (const cs of conditionSet) {
                this._resolveFields(metadata, mode, fieldCache, cs);
            }
        }
    }
    /**
     * helper for {@link _resolveFields}
     *
     * @param {FilterCondition} condition -
     * @param {object[]} fieldCache -
     * @returns {void}
     */
    static _postRetrieve_resolveFieldIdsCondition(condition, fieldCache) {
        condition.r__dataExtensionField_name = fieldCache.find(
            (field) => field.ObjectID === condition['@_ID']
        )?.Name;
        if (condition.r__dataExtensionField_name) {
            delete condition['@_ID'];
        }
        if (['IsEmpty', 'IsNotEmpty'].includes(condition['@_Operator'])) {
            delete condition.Value;
        }
    }
    /**
     * helper for {@link _resolveFields}
     *
     * @param {FilterCondition} condition -
     * @param {object[]} fieldCache -
     * @returns {void}
     */
    static _preDeploy_resolveFieldNamesCondition(condition, fieldCache) {
        condition['@_ID'] = fieldCache.find(
            (field) => field.Name === condition.r__dataExtensionField_name
        )?.ObjectID;
        if (condition['@_ID']) {
            delete condition.r__dataExtensionField_name;
        }
        if (['IsEmpty', 'IsNotEmpty'].includes(condition['@_Operator'])) {
            condition.Value ||= '';
        } else if (condition?.Value && typeof condition.Value !== 'object') {
            // allow adding cdata
            // @ts-ignore
            condition.Value = { cdata: condition.Value };
        }
    }
    /**
     * helper for {@link postRetrieveTasks}
     *
     * @param {DataFilterItem} metadata -
     * @param {object} [filter] -
     * @returns {void}
     */
    static _postRetrieve_resolveAttributeIds(metadata, filter) {
        if (!filter) {
            return this._postRetrieve_resolveAttributeIds(
                metadata,
                metadata.c__filterDefinition?.ConditionSet
            );
        }
        const contactAttributes = this.cache.contactAttributes[this.buObject.mid];
        const measures = this.cache.measures[this.buObject.mid];
        const conditionsArr = Array.isArray(filter.Condition)
            ? filter.Condition
            : [filter.Condition];
        for (const condition of conditionsArr) {
            condition['@_ID'] += '';
            if (condition['@_SourceType'] === 'Measure' && measures[condition['@_ID']]) {
                condition.r__measure = measures[condition['@_ID']]?.name;
                delete condition['@_ID'];
            } else if (
                condition['@_SourceType'] !== 'Measure' &&
                contactAttributes[condition['@_ID']]
            ) {
                condition.r__contactAttribute = contactAttributes[condition['@_ID']]?.name;
                delete condition['@_ID'];
            }
            if (['IsEmpty', 'IsNotEmpty'].includes(condition['@_Operator'])) {
                delete condition.Value;
            }
        }
        if (filter.ConditionSet) {
            this._postRetrieve_resolveAttributeIds(metadata, filter.ConditionSet);
        }
    }

    /**
     * prepares a item for deployment
     *
     * @param {DataFilterItem} metadata a single record
     * @returns {Promise.<DataFilterItem>} Promise of updated single item
     */
    static async preDeployTasks(metadata) {
        // folder
        super.setFolderId(metadata);

        // disable updates to r__source_dataExtension_key
        // the API and GUI prevent changes to the source data extensions.
        // to avoid confusion and accidental changes, we will reset the values from cache before deployment
        const normalizedKey = File.reverseFilterIllegalFilenames(
            metadata[this.definition.keyField]
        );
        const cachedVersion = cache.getByKey(this.definition.type, normalizedKey);

        // DataExtension
        if (metadata.r__source_dataExtension_key) {
            metadata.derivedFromObjectId = cache.searchForField(
                'dataExtension',
                metadata.r__source_dataExtension_key,
                'CustomerKey',
                'ObjectID'
            );
            if (
                cachedVersion &&
                cachedVersion.derivedFromObjectId !== metadata.derivedFromObjectId
            ) {
                throw new Error(
                    `Updating r__source_dataExtension_key is not allowed. You need to delete and re-create the dataFilter to change this.`
                );
            }
            metadata.derivedFromObjectName = cache.searchForField(
                'dataExtension',
                metadata.r__source_dataExtension_key,
                'CustomerKey',
                'Name'
            );
            metadata.derivedFromObjectTypeName = 'DataExtension';
            metadata.derivedFromType = 2;
            metadata.c__filterDefinition['@_Source'] = 'DataExtension';
            metadata.c__filterDefinition['@_SourceID'] = metadata.derivedFromObjectId;
            this._resolveFields(metadata, 'preDeploy');

            delete metadata.r__source_dataExtension_key;
        }

        const jsonToXml = new XMLBuilder({
            preserveOrder: false, // XML BUilder  returns undefined if this is true
            ignoreAttributes: false,
            cdataPropName: 'cdata',
        });
        metadata.filterDefinitionXml = jsonToXml.build({
            FilterDefinition: metadata.c__filterDefinition,
        });
        delete metadata.c__filterDefinition;
        return metadata;
    }

    /**
     * MetadataType upsert, after retrieving from target and comparing to check if create or update operation is needed.
     *
     * @param {MetadataTypeMap} metadataMap metadata mapped by their keyField
     * @param {string} deployDir directory where deploy metadata are saved
     * @param {boolean} [runUpsertSequentially] when a type has self-dependencies creates need to run one at a time and created/changed keys need to be cached to ensure following creates/updates have thoses keys available
     * @returns {Promise.<MetadataTypeMap>} keyField => metadata map
     */
    static async upsert(metadataMap, deployDir, runUpsertSequentially = false) {
        Util.logBeta(this.definition.type);
        await this._cacheDeFields(metadataMap, 'deploy');
        return super.upsert(metadataMap, deployDir, runUpsertSequentially);
    }
    /**
     * Creates a single item
     *
     * @param {DataFilterItem} metadata a single item
     * @returns {Promise.<DataFilterItem>} Promise
     */
    static create(metadata) {
        return super.createREST(metadata, '/email/v1/filters/filterdefinition/');
    }
    /**
     * Updates a single item
     *
     * @param {DataFilterItem} metadata a single item
     * @returns {Promise.<DataFilterItem>} Promise
     */
    static update(metadata) {
        return super.updateREST(
            metadata,
            '/email/v1/filters/filterdefinition/' + metadata[this.definition.idField]
        );
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
        return super.deleteByKeyREST('/email/v1/filters/filterdefinition/' + objectId, key);
    }
}
// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
DataFilter.definition = MetadataTypeDefinitions.dataFilter;

export default DataFilter;
