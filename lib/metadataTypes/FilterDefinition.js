'use strict';

import MetadataType from './MetadataType.js';
import { Util } from '../util/util.js';
import cache from '../util/cache.js';
import DataExtensionField from './DataExtensionField.js';
import Folder from './Folder.js';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';

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
 * @typedef {import('../../types/mcdev.d.js').FilterDefinitionItem} FilterDefinitionItem
 * @typedef {import('../../types/mcdev.d.js').FilterDefinitionMap} FilterDefinitionMap
 * @typedef {import('../../types/mcdev.d.js').MultiMetadataTypeMap} MultiMetadataTypeMap
 * @typedef {import('../../types/mcdev.d.js').FilterConditionSet} FilterConditionSet
 * @typedef {import('../../types/mcdev.d.js').FilterCondition} FilterCondition
 */

/**
 * FilterDefinition MetadataType
 *
 * @augments MetadataType
 */
class FilterDefinition extends MetadataType {
    static cache = {}; // type internal cache for various things
    static deIdKeyMap;
    /**
     * Retrieves all records and saves it to disk
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {string[]} [_] unused parameter
     * @param {string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<{metadata: FilterDefinitionMap, type: string}>} Promise of items
     */
    static async retrieve(retrieveDir, _, __, key) {
        const filterFolders = await this._getFilterFolderIds();
        /** @type {FilterDefinitionMap} */
        const filterDefinitionMap = {};

        for (const folderId of filterFolders) {
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
                if (key) {
                    // if key was found we can stop checking other folders
                    break;
                }
            }
        }
        // /** @type {FilterDefinitionMap} */
        // const filterDefinitionMap = metadataTypeMapObj.metadata;
        for (const item of Object.values(filterDefinitionMap)) {
            // description is not returned when emptyg
            item.description ||= '';
        }
        if (retrieveDir) {
            // custom dataExtensionField caching
            await this._cacheDeFields(filterDefinitionMap);
            await this._cacheContactAttributes(filterDefinitionMap);
            await this._cacheMeasures(filterDefinitionMap);

            const savedMetadata = await this.saveResults(filterDefinitionMap, retrieveDir);
            Util.logger.info(
                `Downloaded: ${this.definition.type} (${Object.keys(savedMetadata).length})` +
                    Util.getKeysString(key)
            );
        }

        return { metadata: filterDefinitionMap, type: this.definition.type };
    }
    /**
     * helper for {@link FilterDefinition.retrieve}
     *
     * @param {boolean} [hidden] used to filter out hidden or non-hidden filterDefinitions
     * @returns {Promise.<number[]>} Array of folder IDs
     */
    static async _getFilterFolderIds(hidden = false) {
        const fromCache =
            this.cache.folderFilter || cache.getCache().folder
                ? Object.values(this.cache.folderFilter || cache.getCache().folder)
                      .filter((item) => item.ContentType === 'filterdefinition')
                      .filter(
                          (item) =>
                              (!hidden && item.Path.startsWith('Data Filters')) ||
                              (hidden && !item.Path.startsWith('Data Filters'))
                      ) // only retrieve from Data Filters folder
                      .map((item) => item.ID)
                : [];
        if (fromCache.length) {
            return fromCache;
        }

        const subTypeArr = ['hidden', 'filterdefinition'];
        Util.logger.info(` - Caching dependent Metadata: folder`);
        Util.logSubtypes(subTypeArr);

        Folder.client = this.client;
        Folder.buObject = this.buObject;
        Folder.properties = this.properties;
        this.cache.folderFilter = (await Folder.retrieveForCache(null, subTypeArr)).metadata;
        return this._getFilterFolderIds(hidden);
    }
    /**
     * helper for {@link FilterDefinition._cacheMeasures}
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
     * helper for {@link FilterDefinition.retrieve}. uses cached dataExtensions to resolve dataExtensionFields
     *
     * @param {FilterDefinitionMap} metadataTypeMap -
     */
    static async _cacheDeFields(metadataTypeMap) {
        const deKeys = Object.values(metadataTypeMap)
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
     * helper for {@link FilterDefinition.retrieve}
     *
     * @param {FilterDefinitionMap} metadataTypeMap -
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
     * helper for {@link FilterDefinition.retrieve}
     *
     * @param {FilterDefinitionMap} metadataTypeMap -
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
     * @returns {Promise.<{metadata: FilterDefinitionMap, type: string}>} Promise of items
     */
    static async retrieveForCache() {
        return this.retrieve(null);
    }

    /**
     * parses retrieved Metadata before saving
     *
     * @param {FilterDefinitionItem} metadata a single record
     * @returns {Promise.<FilterDefinitionItem>} parsed metadata definition
     */
    static async postRetrieveTasks(metadata) {
        if (metadata.derivedFromType > 4) {
            // GUI only shows types 1,2,3,4; lets mimic that here.
            // type 6 seems to be journey related. Maybe we need to change that again in the future
            return;
        }
        // folder
        this.setFolderPath(metadata);

        // parse XML filter for further processing in JSON format
        const xmlToJson = new XMLParser({ ignoreAttributes: false });
        metadata.c__filterDefinition = xmlToJson.parse(
            metadata.filterDefinitionXml
        )?.FilterDefinition;
        delete metadata.filterDefinitionXml;

        switch (metadata.derivedFromType) {
            case 1: {
                if (metadata.c__filterDefinition['@_Source'] === 'SubscriberAttribute') {
                    if (
                        metadata.derivedFromObjectId &&
                        metadata.derivedFromObjectId !== '00000000-0000-0000-0000-000000000000'
                    ) {
                        // Lists
                        try {
                            metadata.r__source_list_PathName = cache.getListPathName(
                                metadata.derivedFromObjectId,
                                'ObjectID'
                            );
                        } catch {
                            Util.logger.warn(
                                ` - skipping ${this.definition.type} ${metadata.key}: list ${metadata.derivedFromObjectId} not found on current or Parent BU`
                            );
                        }
                    } else {
                        // SubscriberAttributes
                        // - nothing to do
                    }
                }
                // SubscriberAttributes
                this._resolveAttributeIds(metadata);
                delete metadata.derivedFromObjectId;
                delete metadata.derivedFromObjectName;
                delete metadata.derivedFromObjectTypeName;
                delete metadata.derivedFromType;
                delete metadata.c__filterDefinition['@_Source'];
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
                        metadata.r__source_dataExtension_CustomerKey =
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

                    this._resolveFieldIds(metadata);
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
     * @param {FilterDefinitionItem} metadata -
     * @param {object[]} [fieldCache] -
     * @param {FilterConditionSet} [filter] -
     * @returns {void}
     */
    static _resolveFieldIds(metadata, fieldCache, filter) {
        if (!filter) {
            return this._resolveFieldIds(
                metadata,
                Object.values(this.dataExtensionFieldCache),
                metadata.c__filterDefinition?.ConditionSet
            );
        }
        if (filter.Condition) {
            const conditionsArr = Array.isArray(filter.Condition)
                ? filter.Condition
                : [filter.Condition];
            for (const condition of conditionsArr) {
                this._resolveFieldIdsCondition(condition, fieldCache);
            }
        }
        if (filter.ConditionSet) {
            const conditionSet = Array.isArray(filter.ConditionSet)
                ? filter.ConditionSet
                : [filter.ConditionSet];
            for (const cs of conditionSet) {
                this._resolveFieldIds(metadata, fieldCache, cs);
            }
        }
    }
    /**
     * helper for {@link _resolveFieldIds}
     *
     * @param {FilterCondition} condition -
     * @param {object[]} fieldCache -
     * @returns {void}
     */
    static _resolveFieldIdsCondition(condition, fieldCache) {
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
     * helper for {@link postRetrieveTasks}
     *
     * @param {FilterDefinitionItem} metadata -
     * @param {object} [filter] -
     * @returns {void}
     */
    static _resolveAttributeIds(metadata, filter) {
        if (!filter) {
            return this._resolveAttributeIds(metadata, metadata.c__filterDefinition?.ConditionSet);
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
            this._resolveAttributeIds(metadata, filter.ConditionSet);
        }
    }

    /**
     * prepares a item for deployment
     *
     * @param {FilterDefinitionItem} metadata a single record
     * @returns {Promise.<FilterDefinitionItem>} Promise of updated single item
     */
    static async preDeployTasks(metadata) {
        // folder
        super.setFolderId(metadata);

        if (metadata.derivedFromObjectTypeName === 'SubscriberAttributes') {
            // SubscriberAttributes
            metadata.derivedFromType = 1;
            metadata.derivedFromObjectId = '00000000-0000-0000-0000-000000000000';
        } else {
            // DataExtension
            metadata.derivedFromType = 2;

            if (metadata.r__source_dataExtension_CustomerKey) {
                metadata.derivedFromObjectId = cache.searchForField(
                    'dataExtension',
                    metadata.r__source_dataExtension_CustomerKey,
                    'CustomerKey',
                    'ObjectID'
                );
                delete metadata.r__source_dataExtension_CustomerKey;
            }
        }

        const jsonToXml = new XMLBuilder({ ignoreAttributes: false });
        metadata.filterDefinitionXml = jsonToXml.build(metadata.c__filterDefinition);
        delete metadata.c__filterDefinition;

        return metadata;
    }
    /**
     * Creates a single item
     *
     * @param {FilterDefinitionItem} metadata a single item
     * @returns {Promise.<FilterDefinitionItem>} Promise
     */
    static create(metadata) {
        // TODO test the create
        return super.createREST(metadata, '/email/v1/filters/filterdefinition/');
    }
    /**
     * Updates a single item
     *
     * @param {FilterDefinitionItem} metadata a single item
     * @returns {Promise.<FilterDefinitionItem>} Promise
     */
    static update(metadata) {
        // TODO test the update
        return super.updateREST(
            metadata,
            '/email/v1/filters/filterdefinition/' + metadata[this.definition.idField]
        );
    }
}
// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
FilterDefinition.definition = MetadataTypeDefinitions.filterDefinition;

export default FilterDefinition;
