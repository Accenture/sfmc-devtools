'use strict';

import MetadataType from './MetadataType.js';
import { Util } from '../util/util.js';
import File from '../util/file.js';
import cache from '../util/cache.js';
import deepEqual from 'deep-equal';

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
 * Event MetadataType
 *
 * @augments MetadataType
 */
class Event extends MetadataType {
    static reCacheDataExtensions = [];
    /**
     * Retrieves Metadata of Event Definition.
     * Endpoint /interaction/v1/eventDefinitions return all Event Definitions with all details.
     * Currently it is not needed to loop over Imports with endpoint /interaction/v1/eventDefinitions/{id}
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static retrieve(retrieveDir, _, __, key) {
        Util.logBeta(this.definition.type);
        try {
            return super.retrieveREST(
                retrieveDir,
                `/interaction/v1/eventDefinitions${
                    key ? '/key:' + encodeURIComponent(key) : ''
                }?extras=all`,
                null,
                key
            );
        } catch (ex) {
            // if the event does not exist, the API returns the error "Request failed with status code 400 (ERR_BAD_REQUEST)" which would otherwise bring execution to a hold
            if (key && ex.code === 'ERR_BAD_REQUEST') {
                Util.logger.info(
                    `Downloaded: ${this.definition.type} (0)${Util.getKeysString(key)}`
                );
            } else {
                throw ex;
            }
        }
        return;
    }

    /**
     * Retrieves event definition metadata for caching
     *
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static retrieveForCache() {
        return this.retrieve(null);
    }

    /**
     * Retrieve a specific Event Definition by Name
     *
     * @param {string} templateDir Directory where retrieved metadata directory will be saved
     * @param {string} name name of the metadata file
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {Promise.<MetadataTypeItemObj>} Promise of metadata
     */
    static async retrieveAsTemplate(templateDir, name, templateVariables) {
        Util.logBeta(this.definition.type);
        const res = await this.client.rest.get(
            '/interaction/v1/eventDefinitions?name=' + encodeURIComponent(name)
        );
        const event = res.items.filter((item) => item.name === name);
        try {
            if (!event || event.length === 0) {
                throw new Error(`No Event Definitions Found with name "${name}"`);
            } else if (event.length > 1) {
                throw new Error(
                    `Multiple Event Definitions with name "${name}"` +
                        `please rename to be unique to avoid issues`
                );
            } else if (event?.length === 1) {
                const originalKey = event[0][this.definition.keyField];
                const metadataItemTemplated = Util.replaceByObject(
                    this.postRetrieveTasks(event[0]),
                    templateVariables
                );

                if (!metadataItemTemplated.r__dataExtension_key) {
                    throw new Error(
                        `Event.postRetrieveTasks:: No Data Extension found for ${this.definition.type}: ${metadataItemTemplated.name}. This cannot be templated.`
                    );
                }

                // remove all fields listed in Definition for templating
                this.keepTemplateFields(metadataItemTemplated);
                await File.writeJSONToFile(
                    [templateDir, this.definition.type].join('/'),
                    originalKey + '.' + this.definition.type + '-meta',
                    metadataItemTemplated
                );
                Util.logger.info(` - templated ${this.definition.type}: ${name}`);
                return { metadata: metadataItemTemplated, type: this.definition.type };
            } else {
                throw new Error(
                    `Encountered unknown error when retrieveing ${
                        this.definition.typeName
                    } "${name}": ${JSON.stringify(res.body)}`
                );
            }
        } catch (ex) {
            Util.logger.error('Event.retrieveAsTemplate:: ' + ex);
            return null;
        }
    }

    /**
     * Delete a metadata item from the specified business unit
     *
     * @param {string} key Identifier of item
     * @returns {Promise.<boolean>} deletion success status
     */
    static deleteByKey(key) {
        Util.logBeta(this.definition.type);
        return super.deleteByKeyREST(
            '/interaction/v1/eventDefinitions/key:' + encodeURIComponent(key),
            key,
            false
        );
    }
    /**
     * Deploys metadata - merely kept here to be able to print {@link Util.logBeta} once per deploy
     *
     * @param {MetadataTypeMap} metadata metadata mapped by their keyField
     * @param {string} deployDir directory where deploy metadata are saved
     * @param {string} retrieveDir directory where metadata after deploy should be saved
     * @returns {Promise.<MetadataTypeMap>} Promise of keyField => metadata map
     */
    static async deploy(metadata, deployDir, retrieveDir) {
        Util.logBeta(this.definition.type);
        return super.deploy(metadata, deployDir, retrieveDir);
    }

    /**
     * Creates a single Event Definition
     *
     * @param {MetadataTypeItem} metadata a single Event Definition
     * @returns {Promise} Promise
     */
    static create(metadata) {
        return super.createREST(metadata, '/interaction/v1/eventDefinitions/');
    }

    /**
     * Updates a single Event Definition (using PUT method since PATCH isn't supported)
     *
     * @param {MetadataTypeItem} metadataEntry a single Event Definition
     * @returns {Promise} Promise
     */
    static async update(metadataEntry) {
        return super.updateREST(
            metadataEntry,
            '/interaction/v1/eventDefinitions/key:' +
                encodeURIComponent(metadataEntry[this.definition.keyField]),
            'put'
        );
    }

    /**
     * prepares an event definition for deployment
     *
     * @param {MetadataTypeItem} metadata a single eventDefinition
     * @returns {MetadataTypeItem} parsed version
     */
    static preDeployTasks(metadata) {
        // Note: lots has to be done in createOrUpdate based on what action is required
        metadata.arguments ||= {};
        metadata.arguments.eventDefinitionKey = metadata.eventDefinitionKey;

        // standard values
        metadata.isVisibleInPicker ||= false;
        if (metadata.isVisibleInPicker && !metadata.sourceApplicationExtensionId) {
            Util.logger.warn(
                ` - ${this.definition.type} ${metadata[this.definition.keyField]}: isVisibleInPicker is true but sourceApplicationExtensionId is missing. Setting isVisibleInPicker to false.`
            );
            metadata.isVisibleInPicker = false;
        }
        metadata.isPlatformObject ||= false;
        metadata.mode ||= 'Production';
        switch (metadata.type) {
            case 'APIEvent': {
                metadata.entrySourceGroupConfigUrl ||=
                    'jb:///data/entry/api-event/entrysourcegroupconfig.json';
                metadata.iconUrl ||= '/images/icon_journeyBuilder-event-api-blue.svg';
                break;
            }
            case 'SalesforceObjectTriggerV2': {
                metadata.iconUrl ||= '/jbint-events/events/SalesforceData/images/SF-Event-Icon.svg';
                break;
            }
        }

        return metadata;
    }
    /**
     * helper for {@link MetadataType.upsert}
     *
     * @param {MetadataTypeMap} metadataMap list of metadata
     * @param {string} metadataKey key of item we are looking at
     * @param {boolean} hasError error flag from previous code
     * @param {MetadataTypeItemDiff[]} metadataToUpdate list of items to update
     * @param {MetadataTypeItem[]} metadataToCreate list of items to create
     * @returns {Promise.<'create'|'update'|'skip'>} action to take
     */
    static async createOrUpdate(
        metadataMap,
        metadataKey,
        hasError,
        metadataToUpdate,
        metadataToCreate
    ) {
        const createOrUpdateAction = await super.createOrUpdate(
            metadataMap,
            metadataKey,
            hasError,
            metadataToUpdate,
            metadataToCreate
        );
        const metadataItem = metadataMap[metadataKey];
        if (createOrUpdateAction === 'update') {
            if (metadataItem.r__dataExtension_key) {
                metadataItem.dataExtensionId = cache.searchForField(
                    'dataExtension',
                    metadataItem.r__dataExtension_key,
                    'CustomerKey',
                    'ObjectID'
                );
                metadataItem.dataExtensionName = cache.searchForField(
                    'dataExtension',
                    metadataItem.r__dataExtension_key,
                    'CustomerKey',
                    'Name'
                );
                metadataItem.arguments.dataExtensionId = metadataItem.dataExtensionId;
                if (metadataItem.schema) {
                    metadataItem.schema.id = metadataItem.dataExtensionId;
                    metadataItem.schema.name = metadataItem.dataExtensionName;
                }
            }
            if (metadataItem.schema?.fields?.length) {
                const normalizedKey = File.reverseFilterIllegalFilenames(
                    metadataMap[metadataKey][this.definition.keyField]
                );
                const cachedVersion = cache.getByKey(this.definition.type, normalizedKey);
                if (cachedVersion?.schema?.fields?.length) {
                    const cacheClone = structuredClone(cachedVersion);
                    cacheClone.schema.fields = cacheClone.schema.fields.map((field) => {
                        delete field.isDevicePreference;
                        return field;
                    });
                    if (!deepEqual(metadataItem?.schema?.fields, cacheClone?.schema?.fields)) {
                        Util.logger.warn(
                            ` - ${this.definition.type} ${metadataItem[this.definition.keyField]}: schema fields differ from server version. Resetting as this will not be reflected on dataExtension.`
                        );
                        metadataItem.schema.fields = cacheClone.schema.fields;
                    }
                }
            }
        } else if (createOrUpdateAction === 'create') {
            try {
                if (metadataItem.r__dataExtension_key) {
                    metadataItem.dataExtensionId = cache.searchForField(
                        'dataExtension',
                        metadataItem.r__dataExtension_key,
                        'CustomerKey',
                        'ObjectID'
                    );
                    metadataItem.dataExtensionName = cache.searchForField(
                        'dataExtension',
                        metadataItem.r__dataExtension_key,
                        'CustomerKey',
                        'Name'
                    );
                    if (metadataItem.schema) {
                        delete metadataItem.schema;
                        Util.logger.info(
                            ` - ${this.definition.type} ${metadataItem[this.definition.keyField]}: dataExtension ${metadataItem.r__dataExtension_key} found, ignoring schema-section in ${this.definition.type} json`
                        );
                    }
                }
            } catch {
                // no action
            }
            if (metadataItem.schema) {
                if (metadataItem.r__dataExtension_key) {
                    metadataItem.schema.name = metadataItem.r__dataExtension_key;
                }
                Util.logger.warn(
                    `Data Extension ${metadataItem.schema.name || metadataItem[this.definition.keyField]} not found on BU. Creating it automatically based on schema-definition.`
                );
                // we want the event api to create the DE for us based on the schema
                this.reCacheDataExtensions.push({
                    eventKey: metadataItem[this.definition.keyField],
                    deKey: metadataItem.schema.name || metadataItem[this.definition.keyField],
                });
            }
        }
        return createOrUpdateAction;
    }
    /**
     * Gets executed after deployment of metadata type
     *
     * @param {MetadataTypeMap} upsertResults metadata mapped by their keyField as returned by update/create
     * @param {MetadataTypeMap} originalMetadata metadata to be updated (contains additioanl fields)
     * @param {{created: number, updated: number}} createdUpdated counter representing successful creates/updates
     * @returns {Promise.<void>} -
     */
    static async postDeployTasks(upsertResults, originalMetadata, createdUpdated) {
        // CREATE ONLY - if dataExtensions were auto-
        if (this.reCacheDataExtensions.length && createdUpdated.created > 0) {
            Util.logger.warn(' - Re-caching dependent Metadata: dataExtension');
            const deRetrieve = await DataExtension.retrieveForCache();
            cache.setMetadata('dataExtension', deRetrieve.metadata);
            const reDownloadDeKeys = [];
            // try to update key & name of the auto-generated dataExtension
            for (const { eventKey, deKey } of this.reCacheDataExtensions) {
                if (!upsertResults[eventKey]) {
                    continue;
                }
                const eventItem = upsertResults[eventKey];
                const newDeKey = cache.searchForField(
                    'dataExtension',
                    eventItem.dataExtensionId,
                    'ObjectID',
                    'CustomerKey'
                );
                // get dataExtension from cache which conveniently already has the ObjectID set
                const deObj = cache.getByKey('dataExtension', newDeKey);
                const oldName = deObj[DataExtension.definition.nameField];
                // prepare a clone of the DE to update name & key to match the event
                const clone = structuredClone(deObj);
                clone[DataExtension.definition.keyField] = deKey;
                clone[DataExtension.definition.nameField] = deKey;
                try {
                    // update DE on server
                    await DataExtension.update(clone, true);
                    Util.logger.info(
                        ` - changed dataExtension ${newDeKey} (${oldName}) key/name to ${deKey}`
                    );
                    // update cache
                    deObj[DataExtension.definition.keyField] = deKey;
                    deObj[DataExtension.definition.nameField] = deKey;

                    reDownloadDeKeys.push(deObj[DataExtension.definition.keyField]);
                } catch {
                    // fallback, set DE key to value of DE name
                    const clone = structuredClone(deObj);
                    clone[DataExtension.definition.keyField] = oldName;
                    try {
                        // update DE on server
                        await DataExtension.update(clone, true);
                        Util.logger.info(
                            ` - changed dataExtension ${newDeKey} (${oldName}) key to ${oldName}`
                        );
                        // update cache
                        deObj[DataExtension.definition.keyField] =
                            deObj[DataExtension.definition.nameField];

                        reDownloadDeKeys.push(deObj[DataExtension.definition.keyField]);
                    } catch {
                        Util.logger.debug(
                            ` - failed to change dataExtension ${newDeKey} (${oldName}) key/name`
                        );
                    }
                }
            }
            this.reCacheDataExtensions.length = 0;

            // ensure we have downloaded auto-created DEs
            if (reDownloadDeKeys.length) {
                const retriever = new Retriever(this.properties, this.buObject);
                await retriever.retrieve(['dataExtension'], reDownloadDeKeys);
            }
        }
    }

    /**
     * parses retrieved Metadata before saving
     *
     * @param {MetadataTypeItem} metadata a single event definition
     * @returns {MetadataTypeItem} parsed metadata
     */
    static postRetrieveTasks(metadata) {
        try {
            metadata.r__dataExtension_key = cache.searchForField(
                'dataExtension',
                metadata.dataExtensionId,
                'ObjectID',
                'CustomerKey'
            );
            delete metadata.dataExtensionId;
            delete metadata.dataExtensionName;
            delete metadata.arguments.dataExtensionId;
            if (metadata.schema) {
                delete metadata.schema.id;
            }
        } catch (ex) {
            Util.logger.verbose(
                ` - ${this.definition.type} ${metadata[this.definition.nameField]} (${
                    metadata[this.definition.keyField]
                }): ${ex.message}.`
            );
        }
        if (!metadata.isPlatformObject) {
            delete metadata.isPlatformObject;
        }
        if (metadata.mode === 'Production') {
            delete metadata.mode;
        }

        return metadata;
    }
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
import DataExtension from './DataExtension.js';
import Retriever from './../Retriever.js';
Event.definition = MetadataTypeDefinitions.event;

export default Event;
