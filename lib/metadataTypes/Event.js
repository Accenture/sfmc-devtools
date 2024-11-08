'use strict';

import MetadataType from './MetadataType.js';
import { Util } from '../util/util.js';
import File from '../util/file.js';
import cache from '../util/cache.js';
import deepEqual from 'deep-equal';
import pLimit from 'p-limit';

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
 *
 * @typedef {import('../../types/mcdev.d.js').ReferenceObject} ReferenceObject
 * @typedef {import('../../types/mcdev.d.js').SfObjectField} SfObjectField
 * @typedef {import('../../types/mcdev.d.js').configurationArguments} configurationArguments
 * @typedef {import('../../types/mcdev.d.js').Conditions} Conditions
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
    static async retrieve(retrieveDir, _, __, key) {
        Util.logBeta(this.definition.type);
        try {
            return await super.retrieveREST(
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
                    await this.postRetrieveTasks(event[0]),
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
     * @returns {Promise.<MetadataTypeItem>} parsed version
     */
    static async preDeployTasks(metadata) {
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
                metadata.iconUrl ||=
                    '/events/js/salesforce-event/events/NetworkMember/images/SF-Event-Icon.svg';
                break;
            }
            case 'AutomationAudience': {
                metadata.iconUrl ||= '/images/icon-data-extension.svg';
                break;
            }
        }

        // automation
        if (metadata.r__automation_key) {
            metadata.automationId = cache.searchForField(
                'automation',
                metadata.r__automation_key,
                'key',
                'id'
            );
            if (metadata.arguments) {
                metadata.arguments.automationId = metadata.automationId;
            }
            delete metadata.arguments.automationId;
        }
        // dataExteension
        // is resolved in createOrUpdate

        await this.preDeployTasks_SalesforceEntryEvents(
            metadata.type,
            metadata.configurationArguments
        );

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
     * @returns {Promise.<MetadataTypeItem>} parsed metadata
     */
    static async postRetrieveTasks(metadata) {
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

        // automation
        try {
            if (
                metadata?.automationId &&
                metadata?.automationId !== '00000000-0000-0000-0000-000000000000'
            ) {
                metadata.r__automation_key = cache.searchForField(
                    'automation',
                    metadata.automationId,
                    'id',
                    'key'
                );
                delete metadata.automationId;
                delete metadata.arguments?.automationId;
            }
        } catch (ex) {
            Util.logger.verbose(
                ` - ${this.definition.type} ${metadata[this.definition.nameField]} (${
                    metadata[this.definition.keyField]
                }): ${ex.message}.`
            );
        }
        // dataExtension
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

        try {
            await this.postRetrieveTasks_SalesforceEntryEvents(
                metadata.type,
                metadata.configurationArguments,
                metadata.eventDefinitionKey,
                metadata.publishedInteractionCount >= 1
            );
        } catch (ex) {
            Util.logger.warn(
                ` - ${this.definition.type} '${metadata[this.definition.nameField]}' (${metadata[this.definition.keyField]}): ${ex.message}`
            );
        }

        return metadata;
    }
    static sfObjects = {
        /** @type {string[]} */
        workflowObjects: null,
        /** @type {Object.<string, ReferenceObject[]>} object-name > object data */
        referencedObjects: {},
        /** @type {Object.<string, Object.<string, SfObjectField>>} object-name > field-name > field data */
        objectFields: {},
        /** @type {Object.<string, Promise.<any>>} */
        loadingFields: {},
        /** @type {Object.<string, Promise.<any>>} */
        loadingRelatedObjects: {},
        /** @type {Promise.<any>} */
        loadingWorkflowObjects: null,
    };

    /**
     * helper for {@link checkSalesforceEntryEvents} that retrieves information about SF object fields
     *
     * @param {string} objectAPIName salesforce object api name
     */
    static async getSalesforceObjects(objectAPIName) {
        if (!objectAPIName) {
            return;
        }

        // 1 get all available Salesforce objects
        // similar response to /jbint/getWorkflowObjects
        if (!this.sfObjects.workflowObjects) {
            if (!this.sfObjects.loadingWorkflowObjects) {
                this.sfObjects.loadingWorkflowObjects = this._getWorkflowObjects();
            }
            await this.sfObjects.loadingWorkflowObjects;
        }

        // 2 get objects related to the selected object
        // same response as /jbint/getRelatedObjects?type=<objectAPIName>
        if (!this.sfObjects.referencedObjects?.[objectAPIName]) {
            if (!this.sfObjects.loadingRelatedObjects[objectAPIName]) {
                this.sfObjects.loadingRelatedObjects[objectAPIName] =
                    this._getRelatedSfObjects(objectAPIName);
            }
            await this.sfObjects.loadingRelatedObjects[objectAPIName];

            // 3 get fields
            const rateLimit = pLimit(20);
            const uniqueSfObjectNames = this.sfObjects.referencedObjects[objectAPIName]
                ? [
                      ...new Set(
                          Object.values(this.sfObjects.referencedObjects[objectAPIName])
                              .map((el) => el.referenceObjectName)
                              .sort()
                      ),
                  ]
                : [];
            await Promise.all(
                uniqueSfObjectNames.map((objectAPIName) =>
                    rateLimit(async () => {
                        this.sfObjects.loadingFields[objectAPIName] ||=
                            this._getSalesforceObjectFields(objectAPIName);
                        return this.sfObjects.loadingFields[objectAPIName];
                    })
                )
            );

            // 4 create Common fields
            const contactLeadName = 'Contacts and Leads';
            if (
                this.sfObjects.objectFields['Contact'] &&
                this.sfObjects.objectFields['Lead'] &&
                !this.sfObjects.workflowObjects.includes(contactLeadName)
            ) {
                Util.logger.verbose(
                    Util.getGrayMsg(' - Constructing Common / Contacts and Leads object')
                );
                // add fake entry to workflowObjects to allow testing for this easily
                this.sfObjects.workflowObjects.push(contactLeadName);

                // construct fields object for it
                this.sfObjects.objectFields[contactLeadName] = {};
                const contactFieldNames = Object.keys(this.sfObjects.objectFields['Contact']);
                const leadFieldNames = Object.keys(this.sfObjects.objectFields['Lead']);
                for (const fieldName of contactFieldNames.filter((item) =>
                    leadFieldNames.includes(item)
                )) {
                    // copy the value from contact - while thats not perfectly correct it will hopefully be sufficient for what we need to check
                    this.sfObjects.objectFields[contactLeadName][fieldName] = structuredClone(
                        this.sfObjects.objectFields['Contact'][fieldName]
                    );
                    this.sfObjects.objectFields[contactLeadName][fieldName].objectname = 'Common';

                    // do not delete fields from Contact or Lead because it depends on the environment where we have to look for those
                }
                // create duplicate to also reference this via "Common"
                this.sfObjects.objectFields['Common'] =
                    this.sfObjects.objectFields[contactLeadName];
            }
        }
        return;
    }
    /**
     * helper that allows skipping to run this again in multi-key retrieval
     */
    static async _getWorkflowObjects() {
        Util.logger.info(Util.getGrayMsg(' - Caching Salesforce Objects'));
        const workflowObjectsResponse = await this.client.rest.get(
            `/data/v1/integration/member/salesforce/workflowobjects`
        );
        this.sfObjects.workflowObjects = workflowObjectsResponse
            ? workflowObjectsResponse.map((o) => o.apiname)
            : [];
    }
    /**
     * helper that allows skipping to run this again in multi-key retrieval
     *
     * @param {string} objectAPIName SF entry object of the current event
     */
    static async _getRelatedSfObjects(objectAPIName) {
        Util.logger.info(
            Util.getGrayMsg(' - Caching Related Salesforce Objects for ' + objectAPIName)
        );
        try {
            const referenceObjectsResponse = await this.client.rest.get(
                `/data/v1/integration/member/salesforce/object/${objectAPIName}/referenceobjects`
            );
            // add itself first so that we get the fields for objectAPIName as well
            const selfReference = {
                referenceObjectName: objectAPIName,
                relationshipName: objectAPIName,
            };
            this.sfObjects.referencedObjects[objectAPIName] = referenceObjectsResponse
                ? [selfReference, ...referenceObjectsResponse]
                : [selfReference];
            if (
                referenceObjectsResponse.some((el) => el.referenceObjectName === 'Lead') &&
                referenceObjectsResponse.some((el) => el.referenceObjectName === 'Contact')
            ) {
                // add fake object "Common" to referenced objects for testing
                this.sfObjects.referencedObjects[objectAPIName].push({
                    displayname: 'Common',
                    relationshipIdName: 'Id',
                    relationshipName: 'Common',
                    isPolymorphic: false,
                    referenceObjectName: 'Common',
                });
            }
        } catch (ex) {
            if (ex.code === 'ERR_BAD_RESPONSE') {
                throw new Error(
                    `Could not find Salesforce entry object ${objectAPIName} on connected org.`
                );
            }
        }
    }
    /**
     * helper that allows skipping to run this again in multi-key retrieval
     *
     * @param {string} objectAPIName SF object for which to get the fields
     */
    static async _getSalesforceObjectFields(objectAPIName) {
        if (this.sfObjects.objectFields[objectAPIName] || objectAPIName === 'Common') {
            return;
        }
        Util.logger.verbose(
            Util.getGrayMsg(' - Caching Fields for Salesforce Object ' + objectAPIName)
        );

        const referenceObjectsFieldsResponse = await this.client.rest.get(
            `/legacy/v1/beta/integration/member/salesforce/object/${objectAPIName}`
        );
        if (referenceObjectsFieldsResponse?.sfobjectfields?.length) {
            Util.logger.debug(
                `Found ${referenceObjectsFieldsResponse?.sfobjectfields?.length} fields for Salesforce Object ${objectAPIName}`
            );
            this.sfObjects.objectFields[objectAPIName] = {};
            // !add default fields that are somehow not always returned by this legacy beta API
            for (const field of this.defaultSalesforceFields) {
                // @ts-expect-error hack to work around shortcomings of legacy beta API
                this.sfObjects.objectFields[objectAPIName][field] = {
                    label: field,
                    name: field,
                };
            }
            // add fields returned by API
            for (const field of referenceObjectsFieldsResponse.sfobjectfields) {
                this.sfObjects.objectFields[objectAPIName][field.name] = field;
            }
        } else {
            Util.logger.warn(
                `Could not cache fields for Salesforce Object '${objectAPIName}'. This is likely caused by insufficient access of your MC-Connect integration user. Please check assigned permission sets / the profile.`
            );
        }
        return;
    }

    static defaultSalesforceFields = [
        'Id',
        'Name',
        'FirstName',
        'LastName',
        'Phone',
        'CreatedById',
        'CreatedDate',
        'IsDeleted',
        'LastModifiedById',
        'LastModifiedDate',
        'SystemModstamp',
    ];

    /**
     *
     * @param {configurationArguments} ca trigger[0].configurationArguments
     * @param {boolean} isPublished if the current item is published it means we do not need to do contact vs common checks
     */
    static checkSalesforceEntryEvents(ca, isPublished) {
        // 1 check eventDataConfig
        const edcObjects = ca.eventDataConfig.objects.sort((a, b) =>
            a.dePrefix.localeCompare(b.dePrefix)
        );
        const errors = [];
        const dePrefixFields = {};
        const dePrefixRelationshipMap = {};
        const dePrefixReferenceObjectMap = {};
        // SFMC only uses "Common" to aggreagate Contacts and Leads if that was actively selected in the entry event. Also, already published journeys/events continue to work even if fields would later be changed, leading to a shift from or to the "common" fake-object.
        const checkCommon =
            ca.whoToInject === 'Contact ID/Lead ID (Contacts and Leads)' && !isPublished;
        for (const object of edcObjects) {
            // create secondary object to quickly check eventDataSummary against
            dePrefixFields[object.dePrefix] = object.fields;

            // if the current object is the entry object then relationshipName and referenceObject are set to empty strings because it's not "referencing" a "relationship" but just listing its own fields
            dePrefixRelationshipMap[object.dePrefix] =
                object.relationshipName === ''
                    ? object.dePrefix.split(':')[0]
                    : object.relationshipName;
            dePrefixReferenceObjectMap[object.dePrefix] =
                object.referenceObject === ''
                    ? object.dePrefix.split(':')[0]
                    : object.referenceObject;

            // 1.1 check if fields in eventDataConfig exist in Salesforce
            // if it has no value this is the entry-source object itself
            const referencedObject =
                object.referenceObject === '' ? ca.objectAPIName : object.referenceObject;
            // sort list of fields alphabetically
            object.fields.sort();
            // check if object was cached earlier
            if (!this.sfObjects.workflowObjects.includes(referencedObject)) {
                errors.push(`Salesforce object ${referencedObject} not found on connected org.`);
            } else if (
                !this.sfObjects.objectFields[referencedObject] ||
                !Object.keys(this.sfObjects.objectFields[referencedObject]).length
            ) {
                // check if we found fields for the object
                errors.push(
                    `Fields for Salesforce object ${referencedObject} could not be checked. Fields selected in entry event: ` +
                        object.fields.join(', ')
                );
            } else {
                // check if the fields selected in the eventDefinition are actually available
                for (const fieldName of object.fields) {
                    if (
                        checkCommon &&
                        (referencedObject === 'Contact' || referencedObject === 'Lead') &&
                        this.sfObjects.objectFields['Common'][fieldName]
                    ) {
                        errors.push(
                            `Salesforce object field ${referencedObject}.${fieldName} needs to be referenced as Common.${fieldName}`
                        );
                    } else if (!this.sfObjects.objectFields[referencedObject][fieldName]) {
                        // TODO reactivate after switch to new API
                        // errors.push(
                        //     `Salesforce object field ${referencedObject}.${fieldName} not available on connected org.`
                        // );
                    }
                    // 1.2 check if all fields in eventDataConfig are listed in the eventDataSummary
                    if (!ca.eventDataSummary.includes(object.dePrefix + fieldName)) {
                        // TODO instead, remove in postRetrieve and re-add in preDeploy
                        errors.push(
                            `Field ${object.dePrefix + fieldName} is listed under eventDataConfig${object.referenceObject ? ` for referenceObject ` + object.referenceObject : ''} but not in eventDataSummary`
                        );
                    }
                }
            }
        }

        // 2 compare eventDataConfig with eventDataSummary
        // check if all fields in eventDataSummary are listed in the eventDataConfig

        for (let fieldName of ca.eventDataSummary) {
            // TODO instead, remove in postRetrieve and re-add in preDeploy
            const fieldPath = fieldName.split(':');
            fieldName = fieldPath.pop();
            const dePrefix = fieldPath.join(':') + ':';
            if (!dePrefixFields[dePrefix]) {
                errors.push(
                    `Field ${dePrefix + fieldName} is listed under eventDataSummary but object ${dePrefix} was not found in eventDataConfig`
                );
            } else if (!dePrefixFields[dePrefix]?.includes(fieldName)) {
                errors.push(
                    `Field ${dePrefix + fieldName} is listed under eventDataSummary but not in eventDataConfig`
                );
            }
        }

        // 3 check contactKey
        // check against referencedObjects
        const referencedContactObj = this.sfObjects.referencedObjects[ca.objectAPIName].find(
            (el) =>
                el.relationshipName ===
                (ca.contactKey.relationshipName == ''
                    ? ca.contactKey.referenceObjectName
                    : ca.contactKey.relationshipName)
        );
        if (referencedContactObj) {
            if (
                ca.contactKey.isPolymorphic &&
                referencedContactObj.isPolymorphic !== ca.contactKey.isPolymorphic
            ) {
                errors.push(
                    `configurationArguments.contactKey states an incorrect isPolimorphic value. Should be ${referencedContactObj.isPolymorphic}`
                );
            }
            if (referencedContactObj.referenceObjectName !== ca.contactKey.referenceObjectName) {
                errors.push(
                    `configurationArguments.contactKey states an incorrect referenceObjectName value. Should be ${referencedContactObj.referenceObjectName}`
                );
            }
            // * if contactKey uses "Common" then there is no fieldName attribute but instead relationshipIdName needs to be checked
            if (
                checkCommon &&
                ca.contactKey.referenceObjectName === 'Contact' &&
                this.sfObjects.objectFields['Common'][
                    ca.contactKey.fieldName || ca.contactKey.relationshipIdName
                ]
            ) {
                errors.push(
                    `configurationArguments.contactKey should be referencing Common instead of Contact`
                );
            } else if (
                !this.sfObjects.objectFields[ca.contactKey.referenceObjectName]?.[
                    ca.contactKey.fieldName || ca.contactKey.relationshipIdName
                ]
            ) {
                errors.push(
                    `configurationArguments.contactKey states the invalid fieldName '${ca.contactKey.fieldName || ca.contactKey.relationshipIdName}' value that does not exist on ${ca.contactKey.referenceObjectName}`
                );
            }
        } else {
            errors.push(
                `configurationArguments.contactKey references ${
                    ca.contactKey.relationshipName == ''
                        ? ca.contactKey.referenceObjectName
                        : ca.contactKey.relationshipName
                } which is not found in related salesforce objects`
            );
        }

        // 4 check passThroughArgument
        const dePrefixCommon = ca.objectAPIName + ':Common';
        for (const key of Object.keys(ca.passThroughArgument.fields)) {
            const fieldPath = ca.passThroughArgument.fields[key].split(':');
            const fieldName = fieldPath.pop();
            const dePrefix = fieldPath.join(':') + ':';
            // it seems these fields do NOT need to be in the eventDataConfig
            const relationshipName = dePrefixRelationshipMap[dePrefix];
            const referenceObject = dePrefixReferenceObjectMap[dePrefix];

            if (!this.sfObjects.objectFields[referenceObject]?.[fieldName]) {
                errors.push(
                    `Field ${dePrefix + fieldName} is listed under passThroughArgument.fields.${key} but is not available on connected org.`
                );
            } else if (
                checkCommon &&
                (relationshipName === 'Contact' || relationshipName === 'Lead') &&
                this.sfObjects.objectFields['Common']?.[fieldName]
            ) {
                errors.push(
                    `Field ${dePrefix + fieldName} is listed under passThroughArgument.fields.${key} but needs to be referenced as ${dePrefixCommon}.${fieldName}`
                );
            }
        }

        // 5.a check primaryObjectFilterCriteria
        this.checkSfFilterFieldsExist(
            ca.primaryObjectFilterCriteria.conditions,
            errors,
            'primaryObjectFilterCriteria'
        );

        // 5.b check relatedObjectFilterCriteria
        this.checkSfFilterFieldsExist(
            ca.relatedObjectFilterCriteria.conditions,
            errors,
            'relatedObjectFilterCriteria'
        );

        // 6.a remove primaryObjectFilterSummary (and auto-generate it again in preDeploy from primaryObjectFilterCriteria)
        // TODO
        // 6.b remove relatedObjectFilterSummary (and auto-generate it again in preDeploy from relatedObjectFilterCriteria)
        // TODO

        // 7 remove eventDataSummary (and auto-generate it again in preDeploy from eventDataConfig)
        // TODO

        // 8 remove evaluationCriteriaSummary  (and auto-generate it again in preDeploy from salesforceTriggerCriteria)
        // TODO

        // throw error if problems were found
        if (errors?.length) {
            // add a line break
            if (errors.length > 1) {
                errors.unshift(``);
            }
            throw new Error(errors.join('\n        · ')); // eslint-disable-line unicorn/error-message
        }
    }

    /**
     *
     * @param {object[]} conditions -
     * @param {string[]} errors list of errors
     * @param {'primaryObjectFilterCriteria'|'relatedObjectFilterCriteria'} context used to improve error logs
     */
    static checkSfFilterFieldsExist(conditions, errors, context) {
        for (const condition of conditions) {
            if (
                condition.fieldName & condition.referenceObjectName &&
                !this.sfObjects.objectFields[condition.referenceObjectName]?.[condition.fieldName]
            ) {
                errors.push(
                    `Field ${condition.referenceObjectName}.${condition.fieldName} is listed under ${context} but is not available on connected org.`
                );
            } else if (condition.conditions) {
                this.checkSfFilterFieldsExist(condition.conditions, errors, context);
            }
        }
    }

    static requiredConfigurationArguments = [
        'applicationExtensionKey',
        'contactKey',
        'contactPersonType',
        'eventDataConfig',
        'objectAPIName',
        'passThroughArgument',
        'primaryObjectFilterCriteria',
        'relatedObjectFilterCriteria',
        'salesforceTriggerCriteria',
        'version',
        'whoToInject',
    ];
    /**
     *
     * @param {string} triggerType e.g. SalesforceObjectTriggerV2, APIEvent, ...
     * @param {configurationArguments} ca trigger[0].configurationArguments
     * @param {string} key of event / journey
     * @param {boolean} isPublished if the current item is published it means we do not need to do contact vs common checks
     * @param {string} [type] optionally provide metadatype for error on missing configurationArguments attributes
     * @returns {Promise.<void>} -
     */
    static async postRetrieveTasks_SalesforceEntryEvents(triggerType, ca, key, isPublished, type) {
        if (triggerType !== 'SalesforceObjectTriggerV2' || !ca) {
            return;
        }
        // normalize payload because these fields are sometimes set as strings and sometimes as objects
        // @ts-expect-error journeys SOMETIMES spell it "Api" and this script aims to auto-correct that
        if (ca.objectApiName) {
            // on event only the uppercase version is used. lets make sure we normalize that here.
            // @ts-expect-error journeys SOMETIMES spell it "Api" and this script aims to auto-correct that
            ca.objectAPIName = ca.objectApiName;
            // @ts-expect-error journeys SOMETIMES spell it "Api" and this script aims to auto-correct that
            delete ca.objectApiName;
        }

        // check if everything important is there or else MC Connect cannot publish this AND other journeys
        for (const attribute of this.requiredConfigurationArguments) {
            if (!ca[attribute]) {
                Util.logger.error(
                    ` - ${type || this.definition.type} ${key}: required field configurationArguments.${attribute} not set`
                );
            }
        }

        // normalize payload because these fields are sometimes set as strings and sometimes as objects
        ca.contactKey =
            'string' === typeof ca.contactKey ? JSON.parse(ca.contactKey) : ca.contactKey;
        ca.eventDataConfig =
            'string' === typeof ca.eventDataConfig
                ? JSON.parse(ca.eventDataConfig)
                : ca.eventDataConfig;
        ca.eventDataSummary =
            'string' === typeof ca.eventDataSummary
                ? // @ts-expect-error transforming this from API-string-format to from mcdev-format
                  ca.eventDataSummary.split('; ').filter(Boolean).sort()
                : ca.eventDataSummary;
        ca.passThroughArgument =
            'string' === typeof ca.passThroughArgument
                ? JSON.parse(ca.passThroughArgument)
                : ca.passThroughArgument;
        ca.primaryObjectFilterCriteria =
            'string' === typeof ca.primaryObjectFilterCriteria
                ? JSON.parse(ca.primaryObjectFilterCriteria)
                : ca.primaryObjectFilterCriteria;
        ca.relatedObjectFilterCriteria =
            'string' === typeof ca.relatedObjectFilterCriteria
                ? JSON.parse(ca.relatedObjectFilterCriteria)
                : ca.relatedObjectFilterCriteria;

        // get info about salesforce objects if not already cached
        // * SF product team actually sometimes sets this field with uppercase "API" and sometimes with "Api"... Great job, guys!
        await this.getSalesforceObjects(ca.objectAPIName);

        // check if whats on the journey matches what SF Core offers
        this.checkSalesforceEntryEvents(ca, isPublished);
    }

    /**
     *
     * @param {string} triggerType e.g. SalesforceObjectTriggerV2, APIEvent, ...
     * @param {configurationArguments} ca trigger[0].configurationArguments
     * @returns {Promise.<void>} -
     */
    static async preDeployTasks_SalesforceEntryEvents(triggerType, ca) {
        if (triggerType !== 'SalesforceObjectTriggerV2' || !ca) {
            return;
        }

        // check if everything important is there or else MC Connect cannot publish this AND other journeys
        const missingFields = [];
        for (const attribute of this.requiredConfigurationArguments) {
            if (!ca[attribute]) {
                missingFields.push(attribute);
            }
        }
        if (missingFields.length) {
            throw new Error(
                `required field not set: \n -` +
                    missingFields
                        .map((attribute) => `configurationArguments.${attribute}`)
                        .join('\n - ')
            );
        }

        // get info about salesforce objects if not already cached
        await this.getSalesforceObjects(ca.objectAPIName);

        // check if whats on the journey matches what SF Core offers
        this.checkSalesforceEntryEvents(ca, false);

        // normalize payload because these fields are sometimes set as strings and sometimes as objects
        // @ts-expect-error reverting this back from mcdev-format to API format
        ca.contactKey =
            'object' === typeof ca.contactKey ? JSON.stringify(ca.contactKey) : ca.contactKey;
        // @ts-expect-error reverting this back from mcdev-format to API format
        ca.eventDataConfig =
            'object' === typeof ca.eventDataConfig
                ? JSON.stringify(ca.eventDataConfig)
                : ca.eventDataConfig;
        // @ts-expect-error reverting this back from mcdev-format to API format
        ca.eventDataSummary = Array.isArray(ca.eventDataSummary)
            ? ca.eventDataSummary.join('; ') + '; '
            : ca.eventDataSummary;
        // @ts-expect-error reverting this back from mcdev-format to API format
        ca.passThroughArgument =
            'object' === typeof ca.passThroughArgument
                ? JSON.stringify(ca.passThroughArgument)
                : ca.passThroughArgument;
        // @ts-expect-error reverting this back from mcdev-format to API format
        ca.primaryObjectFilterCriteria =
            'object' === typeof ca.primaryObjectFilterCriteria
                ? JSON.stringify(ca.primaryObjectFilterCriteria)
                : ca.primaryObjectFilterCriteria;
        // @ts-expect-error reverting this back from mcdev-format to API format
        ca.relatedObjectFilterCriteria =
            'object' === typeof ca.relatedObjectFilterCriteria
                ? JSON.stringify(ca.relatedObjectFilterCriteria)
                : ca.relatedObjectFilterCriteria;

        // @ts-expect-error journeys SOMETIMES spell it "Api" and this script aims to auto-correct that
        if (ca.objectApiName) {
            // on event only the uppercase version is used. lets make sure we normalize that here.
            // @ts-expect-error journeys SOMETIMES spell it "Api" and this script aims to auto-correct that
            ca.objectAPIName = ca.objectApiName;
            // @ts-expect-error journeys SOMETIMES spell it "Api" and this script aims to auto-correct that
            delete ca.objectApiName;
        }
    }
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
import DataExtension from './DataExtension.js';
import Retriever from './../Retriever.js';
Event.definition = MetadataTypeDefinitions.event;

export default Event;
