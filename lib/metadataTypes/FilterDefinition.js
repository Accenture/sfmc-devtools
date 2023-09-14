'use strict';

const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');
const DataExtensionField = require('./DataExtensionField');
const Folder = require('./Folder');
const Util = require('../util/util');
const cache = require('../util/cache');
const { XMLBuilder, XMLParser } = require('fast-xml-parser');

/**
 * FilterDefinition MetadataType
 *
 * @augments MetadataType
 */
class FilterDefinition extends MetadataType {
    static cache = {}; // type internal cache for various things
    /**
     * Retrieves all records and saves it to disk
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void} [_] unused parameter
     * @param {void} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<{metadata: TYPE.FilterDefinitionMap, type: string}>} Promise of items
     */
    static async retrieve(retrieveDir, _, __, key) {
        const filterFolders = await this.getFilterFolderIds();

        const metadataTypeMapObj = { metadata: {}, type: this.definition.type };
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
                metadataTypeMapObj.metadata = {
                    ...metadataTypeMapObj.metadata,
                    ...metadataMapFolder.metadata,
                };
                if (key) {
                    // if key was found we can stop checking other folders
                    break;
                }
            }
        }
        // console.log('metadataMap', metadataMap);

        for (const item of Object.values(metadataTypeMapObj.metadata)) {
            // description is not returned when emptyg
            item.description ||= '';
        }
        if (retrieveDir) {
            // custom dataExtensionField caching
            await this.cacheDeFields(metadataTypeMapObj);
            await this.cacheContactAttributes(metadataTypeMapObj);
            await this.cacheMeasures(metadataTypeMapObj);

            const savedMetadata = await this.saveResults(metadataTypeMapObj.metadata, retrieveDir);
            Util.logger.info(
                `Downloaded: ${this.definition.type} (${Object.keys(savedMetadata).length})` +
                    Util.getKeysString(key)
            );
        }

        return metadataTypeMapObj;
    }
    /**
     * helper for {@link FilterDefinition.retrieve}
     *
     * @param {boolean} [hidden] used to filter out hidden or non-hidden filterDefinitions
     * @returns {number[]} Array of folder IDs
     */
    static async getFilterFolderIds(hidden = false) {
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
        return this.getFilterFolderIds(hidden);
    }
    /**
     * helper for {@link FilterDefinition.retrieve}
     *
     * @returns {number[]} Array of folder IDs
     */
    static async getMeasureFolderIds() {
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
        return this.getMeasureFolderIds();
    }

    /**
     *
     * @param {TYPE.MultiMetadataTypeMap} metadataTypeMapObj -
     */
    static async cacheDeFields(metadataTypeMapObj) {
        const deKeys = Object.values(metadataTypeMapObj.metadata)
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
                await DataExtensionField.retrieveForCache(fieldOptions, ['Name', 'ObjectID'])
            ).metadata;
        }
    }
    /**
     *
     * @param {TYPE.MultiMetadataTypeMap} metadataTypeMapObj -
     */
    static async cacheContactAttributes(metadataTypeMapObj) {
        if (this.cache.contactAttributes?.[this.buObject.mid]) {
            return;
        }
        const subscriberFilters = Object.values(metadataTypeMapObj.metadata)
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
     *
     * @param {TYPE.MultiMetadataTypeMap} metadataTypeMapObj -
     */
    static async cacheMeasures(metadataTypeMapObj) {
        if (this.cache.measures?.[this.buObject.mid]) {
            return;
        }
        const subscriberFilters = Object.values(metadataTypeMapObj.metadata)
            .filter((item) => item.derivedFromObjectTypeName === 'SubscriberAttributes')
            .filter((item) => item.derivedFromObjectId);
        const measureFolders = await this.getMeasureFolderIds();
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
     * @returns {Promise.<{metadata: TYPE.FilterDefinitionMap, type: string}>} Promise of items
     */
    static async retrieveForCache() {
        return this.retrieve(null);
    }

    /**
     * parses retrieved Metadata before saving
     *
     * @param {TYPE.FilterDefinitionItem} metadata a single record
     * @returns {TYPE.FilterDefinitionItem} parsed metadata definition
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
                            // return;
                        }
                    } else {
                        // SubscriberAttributes
                        // - nothing to do
                    }
                }

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
                    } catch {
                        Util.logger.debug(
                            ` - skipping ${this.definition.type} ${metadata.key}: dataExtension ${metadata.derivedFromObjectId} not found on BU`
                        );
                        return;
                    }
                }
                break;
            }
            case 3: {
                // TODO
                break;
            }
            case 4: {
                // TODO
                break;
            }
            case 5: {
                // TODO
                break;
            }
            case 6: {
                // TODO
                break;
            }
        }

        // map Condition ID to fields ID
        switch (metadata.derivedFromType) {
            case 1: {
                // SubscriberAttributes
                this.resolveAttributeIds(metadata);
                delete metadata.derivedFromObjectId;
                delete metadata.derivedFromType;
                delete metadata.c__filterDefinition['@_Source'];
                break;
            }
            case 2: {
                if (metadata.c__filterDefinition['@_Source'] === 'Meta') {
                    // TODO - weird so far not understood case of Source=Meta
                    // sample: <FilterDefinition Source=\"Meta\"><Include><ConditionSet Operator=\"OR\" ConditionSetName=\"Individual Filter Grouping\"><Condition ID=\"55530cec-1df4-e611-80cc-1402ec7222b4\" isParam=\"false\" isPathed=\"true\"  pathAttrGroupID=\"75530cec-1df4-e611-80cc-1402ec7222b4\" Operator=\"Equal\"><Value><![CDATA[994607]]></Value></Condition><Condition ID=\"55530cec-1df4-e611-80cc-1402ec7222b4\" isParam=\"false\" isPathed=\"true\"  pathAttrGroupID=\"75530cec-1df4-e611-80cc-1402ec7222b4\" Operator=\"Equal\"><Value><![CDATA[3624804]]></Value></Condition></ConditionSet></Include><Exclude></Exclude></FilterDefinition>
                } else if (metadata.c__filterDefinition['@_Source'] === 'DataExtension') {
                    // DataExtension
                    this.resolveFieldIds(metadata);
                    delete metadata.derivedFromObjectId;
                    delete metadata.derivedFromType;
                    delete metadata.c__filterDefinition['@_Source'];
                    delete metadata.c__filterDefinition['@_SourceID'];
                }
                break;
            }
            case 3: {
                // TODO
                break;
            }
            case 4: {
                // TODO
                break;
            }
            case 5: {
                // TODO
                break;
            }
            case 6: {
                // TODO
                break;
            }
        }
        return metadata;
    }

    /**
     *
     * @param {TYPE.FilterDefinitionItem} metadata -
     * @param {object[]} [fieldCache] -
     * @param {object} [filter] -
     * @returns {void}
     */
    static resolveFieldIds(metadata, fieldCache, filter) {
        if (!filter) {
            return this.resolveFieldIds(
                metadata,
                Object.values(this.dataExtensionFieldCache),
                metadata.c__filterDefinition?.ConditionSet
            );
        }
        const conditionsArr = Array.isArray(filter.Condition)
            ? filter.Condition
            : [filter.Condition];
        for (const condition of conditionsArr) {
            condition.r__dataExtensionField = fieldCache.find(
                (field) => field.ObjectID === condition['@_ID']
            )?.Name;
            delete condition['@_ID'];
            if (['IsEmpty', 'IsNotEmpty'].includes(condition['@_Operator'])) {
                delete condition.Value;
            }
        }
        if (filter.ConditionSet) {
            this.resolveFieldIds(metadata, fieldCache, filter.ConditionSet);
        }
    }
    /**
     *
     * @param {TYPE.FilterDefinitionItem} metadata -
     * @param {object} [filter] -
     * @returns {void}
     */
    static resolveAttributeIds(metadata, filter) {
        if (!filter) {
            return this.resolveAttributeIds(metadata, metadata.c__filterDefinition?.ConditionSet);
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
            this.resolveAttributeIds(metadata, filter.ConditionSet);
        }
    }

    /**
     * prepares a item for deployment
     *
     * @param {TYPE.FilterDefinitionItem} metadata a single record
     * @returns {Promise.<TYPE.FilterDefinitionItem>} Promise of updated single item
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

            if (metadata.r__dataExtension_CustomerKey) {
                metadata.derivedFromObjectId = cache.searchForField(
                    'dataExtension',
                    metadata.r__dataExtension_CustomerKey,
                    'CustomerKey',
                    'ObjectID'
                );
                delete metadata.r__dataExtension_CustomerKey;
            }
        }

        const jsonToXml = new XMLBuilder({ ignoreAttributes: false });
        metadata.filterDefinitionXml = jsonToXml.build(metadata.c__filterDefinition);
        delete metadata.c__filterDefinition;
        delete metadata.c__soap_DataFilter;

        return metadata;
    }
    /**
     * Creates a single item
     *
     * @param {TYPE.FilterDefinitionItem} metadata a single item
     * @returns {Promise.<TYPE.FilterDefinitionItem>} Promise
     */
    static create(metadata) {
        // TODO test the create
        return super.createREST(metadata, '/email/v1/filters/filterdefinition/');
    }
    /**
     * Updates a single item
     *
     * @param {TYPE.FilterDefinitionItem} metadata a single item
     * @returns {Promise.<TYPE.FilterDefinitionItem>} Promise
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
FilterDefinition.definition = require('../MetadataTypeDefinitions').filterDefinition;

module.exports = FilterDefinition;
