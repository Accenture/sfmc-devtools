'use strict';

import MetadataType from './MetadataType.js';
import { Util } from '../util/util.js';
import File from '../util/file.js';
import Definitions from '../MetadataTypeDefinitions.js';
import cache from '../util/cache.js';
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
 * @typedef {import('../../types/mcdev.d.js').SDKError} SDKError
 * @typedef {import('../../types/mcdev.d.js').SoapRequestParams} SoapRequestParams
 * @typedef {import('../../types/mcdev.d.js').TemplateMap} TemplateMap
 * @typedef {import('../../types/mcdev.d.js').TypeKeyCombo} TypeKeyCombo
 */

/**
 * @typedef {import('../../types/mcdev.d.js').AutomationItem} AutomationItem
 * @typedef {import('../../types/mcdev.d.js').AutomationItemObj} AutomationItemObj
 * @typedef {import('../../types/mcdev.d.js').AutomationMap} AutomationMap
 * @typedef {import('../../types/mcdev.d.js').AutomationMapObj} AutomationMapObj
 * @typedef {import('../../types/mcdev.d.js').AutomationSchedule} AutomationSchedule
 * @typedef {import('../../types/mcdev.d.js').AutomationScheduleSoap} AutomationScheduleSoap
 */

/**
 * Automation MetadataType
 *
 * @augments MetadataType
 */
class Automation extends MetadataType {
    static notificationUpdates = {};
    static createdKeyMap;
    static _skipNotificationRetrieve = false;
    /** @type {AutomationMap} */
    static _cachedMetadataMap;

    /**
     * Retrieves Metadata of Automation
     *
     * @param {string} [retrieveDir] Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<AutomationMapObj>} Promise of metadata
     */
    static async retrieve(retrieveDir, _, __, key) {
        let metadataMap;
        if (key && this._cachedMetadataMap?.[key]) {
            metadataMap = {};
            metadataMap[key] = this._cachedMetadataMap[key];
            delete this._cachedMetadataMap;
        } else if (!key && this._cachedMetadataMap) {
            metadataMap = this._cachedMetadataMap;
            delete this._cachedMetadataMap;
        } else {
            /** @type {SoapRequestParams} */
            let requestParams = null;
            const objectIds = [];
            if (key?.startsWith('id:')) {
                objectIds.push(key.slice(3));
            } else if (key) {
                requestParams = {
                    filter: {
                        leftOperand: 'CustomerKey',
                        operator: 'equals',
                        rightOperand: key,
                    },
                };
            }
            const results = await this.client.soap.retrieveBulk(
                'Program',
                ['ObjectID'],
                requestParams
            );
            if (results?.Results?.length) {
                objectIds.push(...results.Results.map((item) => item.ObjectID));
            }

            // the API seems to handle 50 concurrent requests nicely
            const response = objectIds.length
                ? await this.retrieveRESTcollection(
                      objectIds.map((objectID) => ({
                          id: objectID,
                          uri: '/automation/v1/automations/' + objectID,
                      })),
                      50,
                      !key
                  )
                : null;
            metadataMap = response?.metadata || {};
        }

        if (!this._skipNotificationRetrieve && Object.keys(metadataMap).length) {
            // attach notification and wait timezone information to each automation that has any
            await this.#getAutomationLegacyREST(metadataMap);
        }

        // * retrieveDir can be empty when we use it in the context of postDeployTasks
        if (retrieveDir) {
            this.retrieveDir = retrieveDir;
            const savedMetadataMap = await this.saveResults(metadataMap, retrieveDir, null, null);
            Util.logger.info(
                `Downloaded: ${this.definition.type} (${Object.keys(savedMetadataMap).length})` +
                    Util.getKeysString(key)
            );
            if (Object.keys(savedMetadataMap).length) {
                await this.runDocumentOnRetrieve(key, savedMetadataMap);
            } else if (key) {
                this.postDeleteTasks(key);
            }
        }
        return { metadata: metadataMap, type: this.definition.type };
    }

    /**
     * helper for {@link this.retrieveRESTcollection}
     *
     * @param {SDKError} ex exception
     * @param {string} id id or key of item
     * @returns {Promise.<any>} can return retry-result
     */
    static async handleRESTErrors(ex, id) {
        try {
            if (ex.message == 'socket hang up') {
                // one more retry; it's a rare case but retrying again should solve the issue gracefully
                return await this.client.rest.get('/automation/v1/automations/' + id);
            }
        } catch {
            // no extra action needed, handled below
        }
        // if we do get here, we should log the error and continue instead of failing to download all automations
        Util.logger.error(` ☇ skipping Automation ${id}: ${ex.message} ${ex.code}`);
        return null;
    }

    /**
     * helper for {@link Automation.retrieve} to get Automation Notifications
     *
     * @param {MetadataTypeMap} metadataMap keyField => metadata map
     * @returns {Promise.<object>} Promise of automation legacy api response
     */
    static async #getAutomationLegacyREST(metadataMap) {
        Util.logger.info(
            Util.getGrayMsg(` Retrieving Automation Notification & additional information...`)
        );

        // get list of keys that we retrieved so far
        const foundKeys = Object.keys(metadataMap);

        // get encodedAutomationID to retrieve notification information
        const iteratorBackup = this.definition.bodyIteratorField;
        this.definition.bodyIteratorField = 'entry';
        const automationLegacyMapObj = await super.retrieveREST(
            undefined,
            `/legacy/v1/beta/bulk/automations/automation/definition/`
        );
        this.definition.bodyIteratorField = iteratorBackup;
        // notification
        const notificationLegacyMap = Object.keys(automationLegacyMapObj.metadata)
            .filter((key) => foundKeys.includes(key))
            // ! using the `id` field to retrieve notifications does not work. instead one needs to use the URL in the `notifications` field
            .map((key) => ({
                id: automationLegacyMapObj.metadata[key].id,
                key,
            }));
        // created / modified / paused / wait activities
        const extendedDetailsLegacyMap = Object.keys(automationLegacyMapObj.metadata)
            .filter((key) => foundKeys.includes(key))
            .map((key) => ({
                id: automationLegacyMapObj.metadata[key].id,
                key,
            }));

        const rateLimit = pLimit(5);

        // get wait activities for automations using it
        await Promise.all(
            extendedDetailsLegacyMap.map((automationLegacy) =>
                // notifications
                rateLimit(async () => {
                    // this is a file so extended is at another endpoint
                    try {
                        const item = metadataMap[automationLegacy.key];
                        const extended = await this.client.rest.get(
                            `/legacy/v1/beta/bulk/automations/automation/definition/` +
                                automationLegacy.id
                        );
                        // created
                        item.createdName = extended.createdBy?.name;
                        item.createdDate = extended.createdDate;

                        // last modified
                        item.modifiedName = extended.lastSavedBy?.name;
                        item.modifiedDate = extended.lastSaveDate;

                        // last paused
                        item.pausedName = extended.lastPausedBy?.name;
                        item.pausedDate = extended.lastPausedDate;
                        // add timezone to wait activities
                        if (Array.isArray(extended?.processes)) {
                            for (const step of extended.processes) {
                                // steps
                                if (!Array.isArray(step?.workers)) {
                                    continue;
                                }
                                for (const activity of step.workers) {
                                    // activties
                                    if (
                                        activity.objectTypeId === 467 &&
                                        activity.serializedObject
                                    ) {
                                        // wait activities
                                        const waitObj = JSON.parse(activity.serializedObject);
                                        if (waitObj.timeZone) {
                                            // add timezone to the wait activity
                                            item.steps[step.sequence].activities[
                                                activity.sequence
                                            ].timeZone = waitObj.timeZone;
                                        }
                                        // * wait activities are not supported in the new API
                                    }
                                }
                            }
                        }
                    } catch (ex) {
                        Util.logger.debug(
                            ` ☇ issue retrieving extended details for automation ${automationLegacy.key}: ${ex.message} ${ex.code}`
                        );
                    }
                })
            )
        );

        // get notifications for each automation
        let found = 0;
        let skipped = 0;
        const notificationPromiseMap = await Promise.all(
            notificationLegacyMap.map((automationLegacy) =>
                // notifications
                rateLimit(async () => {
                    // this is a file so extended is at another endpoint
                    try {
                        const notificationsResult = await this.client.rest.get(
                            '/legacy/v1/beta/automations/notifications/' + automationLegacy.id
                        );
                        if (Array.isArray(notificationsResult?.workers)) {
                            metadataMap[automationLegacy.key].notifications =
                                notificationsResult.workers.map((n) => ({
                                    email: n.definition.split(',').map((item) => item.trim()),
                                    message: n.body,
                                    type: n.notificationType,
                                }));
                            found++;
                        } else {
                            if (
                                !notificationsResult ||
                                typeof notificationsResult !== 'object' ||
                                Object.keys(notificationsResult).length !== 1 ||
                                !notificationsResult?.programId
                            ) {
                                throw new TypeError(JSON.stringify(notificationsResult));
                            }
                            // * if there are no automation notifications, the API returns a single object with the programId
                        }
                    } catch (ex) {
                        Util.logger.debug(
                            ` ☇ issue retrieving Notifications for automation ${automationLegacy.key}: ${ex.message} ${ex.code}`
                        );
                        skipped++;
                    }
                })
            )
        );
        Util.logger.info(
            Util.getGrayMsg(` Notifications found for ${found} automation${found === 1 ? '' : 's'}`)
        );
        Util.logger.debug(
            `Notifications not found for ${skipped} automation${skipped === 1 ? '' : 's'}`
        );
        return notificationPromiseMap;
    }

    /**
     * Retrieves Metadata of Automation
     *
     * @returns {Promise.<AutomationMapObj>} Promise of metadata
     */
    static async retrieveChangelog() {
        const results = await this.client.soap.retrieveBulk('Program', ['ObjectID']);
        const details = [];
        for (const item of results.Results
            ? await Promise.all(
                  results.Results.map((a) =>
                      this.client.soap.retrieveBulk(
                          'Automation',
                          [
                              'ProgramID',
                              'Name',
                              'CustomerKey',
                              'CategoryID',
                              'LastSaveDate',
                              'LastSavedBy',
                              'CreatedBy',
                              'CreatedDate',
                          ],
                          {
                              filter: {
                                  leftOperand: 'ProgramID',
                                  operator: 'equals',
                                  rightOperand: a.ObjectID,
                              },
                          }
                      )
                  )
              )
            : []) {
            details.push(...item.Results);
        }
        details.map((item) => {
            item.key = item.CustomerKey;
        });

        const parsed = this.parseResponseBody({ items: details });

        return { metadata: parsed, type: this.definition.type };
    }

    /**
     * Retrieves automation metadata for caching
     *
     * @returns {Promise.<AutomationMapObj>} Promise of metadata
     */
    static async retrieveForCache() {
        let results = {};
        if (this._cachedMetadataMap) {
            results.Results = Object.values(this._cachedMetadataMap);
            delete this._cachedMetadataMap;
        } else {
            // get automations for cache
            results = await this.client.soap.retrieveBulk('Program', [
                'ObjectID',
                'CustomerKey',
                'Name',
            ]);
        }
        /** @type {AutomationMap} */
        const resultsConverted = {};
        if (Array.isArray(results?.Results)) {
            // get encodedAutomationID to retrieve notification information
            const keyBackup = this.definition.keyField;
            const iteratorBackup = this.definition.bodyIteratorField;
            this.definition.keyField = 'key';
            this.definition.bodyIteratorField = 'entry';
            const automationsLegacy = await super.retrieveREST(
                undefined,
                `/legacy/v1/beta/bulk/automations/automation/definition/`
            );
            this.definition.keyField = keyBackup;
            this.definition.bodyIteratorField = iteratorBackup;

            // merge encodedAutomationID into results
            for (const m of results.Results) {
                const key = m.CustomerKey || m.key;
                resultsConverted[key] = {
                    id: m.ObjectID || m.id,
                    key: key,
                    name: m.Name || m.name,
                    programId: automationsLegacy.metadata[key]?.id,
                    status: automationsLegacy.metadata[key]?.status,
                };
            }
        }
        return { metadata: resultsConverted, type: this.definition.type };
    }

    /**
     * Retrieve a specific Automation Definition by Name
     *
     * @param {string} templateDir Directory where retrieved metadata directory will be saved
     * @param {string} name name of the metadata file
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {Promise.<AutomationItemObj>} Promise of metadata
     */
    static async retrieveAsTemplate(templateDir, name, templateVariables) {
        const results = await this.client.soap.retrieve('Program', ['ObjectID', 'Name'], {
            filter: {
                leftOperand: 'Name',
                operator: 'equals',
                rightOperand: name,
            },
        });
        if (Array.isArray(results?.Results)) {
            // eq-operator returns a similar, not exact match and hence might return more than 1 entry
            const metadata = results.Results.find((item) => item.Name === name);
            if (!metadata) {
                Util.logger.error(`${this.definition.type} '${name}' not found on server.`);
                return;
            }
            let details = await this.client.rest.get(
                '/automation/v1/automations/' + metadata.ObjectID
            );
            const metadataMap = this.parseResponseBody({ items: [details] });
            if (Object.keys(metadataMap).length) {
                // attach notification and wait timezone information to each automation that has any
                await this.#getAutomationLegacyREST(metadataMap);
                details = Object.values(metadataMap)[0];
            }

            let val = null;
            let originalKey;
            // if parsing fails, we should just save what we get
            try {
                const parsedDetails = this.postRetrieveTasks(details);
                originalKey = parsedDetails[this.definition.keyField];
                if (parsedDetails !== null) {
                    val = JSON.parse(
                        Util.replaceByObject(JSON.stringify(parsedDetails), templateVariables)
                    );
                }
            } catch {
                val = structuredClone(details);
            }
            if (val === null) {
                throw new Error(
                    `Automations '${name}' was skipped and hence cannot be used for templating.`
                );
            }
            // remove all fields not listed in Definition for templating
            this.keepTemplateFields(val);
            await File.writeJSONToFile(
                [templateDir, this.definition.type].join('/'),
                originalKey + '.' + this.definition.type + '-meta',
                val
            );
            Util.logger.info(`- templated ${this.definition.type}: ${name}`);
            return { metadata: val, type: this.definition.type };
        } else if (results) {
            Util.logger.error(`${this.definition.type} '${name}' not found on server.`);
            Util.logger.info(`Downloaded: automation (0)`);
            return { metadata: {}, type: this.definition.type };
        } else {
            throw new Error(JSON.stringify(results));
        }
    }

    /**
     * helper for {@link Automation.postRetrieveTasks} and {@link Automation.execute}
     *
     * @param {AutomationItem} metadata a single automation
     * @returns {boolean} true if the automation schedule is valid
     */
    static #isValidSchedule(metadata) {
        if (metadata.type === 'scheduled' && metadata.schedule?.startDate) {
            try {
                if (this.definition.timeZoneMapping[metadata.schedule.timezoneName]) {
                    // if we found the id in our list, remove the redundant data
                    delete metadata.schedule.timezoneId;
                }
            } catch {
                Util.logger.debug(
                    `- Schedule name '${metadata.schedule.timezoneName}' not found in definition.timeZoneMapping`
                );
            }
            return true;
        } else {
            return false;
        }
    }

    /**
     * manages post retrieve steps
     *
     * @param {AutomationItem} metadata a single automation
     * @returns {AutomationItem | void} parsed item
     */
    static postRetrieveTasks(metadata) {
        // folder
        this.setFolderPath(metadata);
        // automations are often skipped due to lack of support.
        if (metadata.type == 'automationtriggered' && metadata.automationTrigger) {
            const automationTrigger = metadata.automationTrigger;
            if (automationTrigger.fileTransferLocationId) {
                try {
                    automationTrigger.r__fileLocation_name = cache.searchForField(
                        'fileLocation',
                        automationTrigger.fileTransferLocationId,
                        'id',
                        'name'
                    );
                    delete automationTrigger.fileTransferLocationId;
                } catch (ex) {
                    Util.logger.warn(` - automation ${metadata.key}: ${ex.message}`);
                }
            }
            if (automationTrigger.fileNamePatternType) {
                try {
                    automationTrigger.fileNamePatternType = Util.inverseGet(
                        this.definition.fileNameOperatorMapping,
                        automationTrigger.fileNamePatternType
                    );
                } catch {
                    Util.logger.warn(
                        ` - Unknown File naming Pattern '${automationTrigger.fileNamePatternType}' in Automation '${metadata.name}'`
                    );
                }
            }
        }
        try {
            if (metadata.type === 'scheduled' && metadata.schedule?.startDate) {
                // Starting Source == 'Schedule'

                if (!this.#isValidSchedule(metadata)) {
                    return;
                }
                // type 'Running' is temporary status only, overwrite with Scheduled for storage.
                if (metadata.type === 'scheduled' && metadata.status === 'Running') {
                    metadata.status = 'Scheduled';
                }
            } else if (metadata.type === 'triggered' && metadata.fileTrigger) {
                // Starting Source == 'File Drop'
                // Do nothing for now
            }
            if (metadata.steps) {
                let i = 0;

                for (const step of metadata.steps) {
                    i++;

                    const stepNumber = step.stepNumber || step.step || i;
                    delete step.stepNumber;
                    delete step.step;

                    for (const activity of step.activities) {
                        try {
                            // get metadata type of activity
                            activity.r__type = Util.inverseGet(
                                this.definition.activityTypeMapping,
                                activity.objectTypeId
                            );
                            delete activity.objectTypeId;
                        } catch {
                            Util.logger.warn(
                                ` - Unknown activity type '${activity.objectTypeId}'` +
                                    ` in step ${stepNumber}.${activity.displayOrder}` +
                                    ` of Automation '${metadata.name}'`
                            );
                            continue;
                        }

                        // if no activityObjectId then either serialized activity
                        // (config in Automation ) or unconfigured so no further action to be taken
                        if (
                            activity.activityObjectId === '00000000-0000-0000-0000-000000000000' ||
                            activity.activityObjectId == null
                        ) {
                            Util.logger.debug(
                                ` - skipping ${
                                    metadata[this.definition.keyField]
                                } activity ${stepNumber}.${
                                    activity.displayOrder
                                } due to missing activityObjectId: ${JSON.stringify(activity)}`
                            );
                            // empty if block
                            continue;
                        } else if (this.definition.customDeployTypes.includes(activity.r__type)) {
                            if (activity.r__type === 'wait') {
                                // convert 12 to 24 hrs system
                                let waitTime24;
                                const [waitDuration, waitUnit] = activity.name.split(' ');
                                if (waitUnit === 'AM' || waitUnit === 'PM') {
                                    waitTime24 = waitDuration;
                                    if (waitUnit === 'PM') {
                                        waitTime24 =
                                            (Number(waitTime24.split(':')[0]) + 12).toString() +
                                            ':00';
                                    }
                                    activity.name = waitTime24;
                                }
                            }
                            continue;
                        } else if (!this.definition.dependencies.includes(activity.r__type)) {
                            Util.logger.debug(
                                ` - skipping ${
                                    metadata[this.definition.keyField]
                                } activity ${stepNumber}.${
                                    activity.displayOrder
                                } because the type ${
                                    activity.r__type
                                } is not set up as a dependency for ${this.definition.type}`
                            );
                            continue;
                        }
                        // / if managed by cache we can update references to support deployment
                        if (
                            Definitions[activity.r__type]?.['idField'] &&
                            cache.getCache()[activity.r__type]
                        ) {
                            try {
                                activity.r__key = cache.searchForField(
                                    activity.r__type,
                                    activity.activityObjectId,
                                    Definitions[activity.r__type].idField,
                                    Definitions[activity.r__type].keyField
                                );
                                delete activity.name;
                            } catch (ex) {
                                // getFromCache throws error where the dependent metadata is not found
                                Util.logger.warn(
                                    ` - Missing ${activity.r__type} activity '${activity.name}'` +
                                        ` in step ${stepNumber}.${activity.displayOrder}` +
                                        ` of Automation '${metadata.name}' (${ex.message})`
                                );
                            }
                        } else {
                            Util.logger.warn(
                                ` - Missing ${activity.r__type} activity '${activity.name}'` +
                                    ` in step ${stepNumber}.${activity.displayOrder}` +
                                    ` of Automation '${metadata.name}' (Not Found in Cache)`
                            );
                        }
                    }
                    // In some cases the displayOrder and array order are not equal which leads to a different order every time we retrieve & deployed the automation. To prevent that, we sort the activities by displayOrder on retrieve
                    step.activities.sort((a, b) => a.displayOrder - b.displayOrder);
                }
            }
            return structuredClone(metadata);
        } catch (ex) {
            Util.logger.warn(
                ` - ${this.definition.typeName} '${metadata[this.definition.nameField]}': ${
                    ex.message
                }`
            );
            return null;
        }
    }

    /**
     * a function to start query execution via API
     *
     * @param {string[]} keyArr customerkey of the metadata
     * @returns {Promise.<string[]>} Returns list of keys that were executed
     */
    static async execute(keyArr) {
        /** @type {AutomationMap} */
        const metadataMap = {};
        for (const key of keyArr) {
            if (Util.OPTIONS.schedule) {
                // schedule
                const results = await this.retrieve(undefined, undefined, undefined, key);
                if (Object.keys(results.metadata).length) {
                    for (const resultKey of Object.keys(results.metadata)) {
                        if (this.#isValidSchedule(results.metadata[resultKey])) {
                            metadataMap[resultKey] = results.metadata[resultKey];
                        } else {
                            Util.logger.error(
                                ` - skipping ${this.definition.type} ${results.metadata[resultKey].name}: no valid schedule settings found.`
                            );
                        }
                    }
                }
            } else {
                // runOnce
                const objectId = await this.#getObjectIdForSingleRetrieve(key);
                /** @type {AutomationItem} */
                metadataMap[key] = { key, id: objectId };
            }
        }
        if (!Object.keys(metadataMap).length) {
            Util.logger.error(`No ${this.definition.type} to execute`);
            return;
        }
        Util.logger.info(
            `Starting automations ${
                Util.OPTIONS.schedule
                    ? 'according to schedule'
                    : 'to run once (use --schedule or --execute=schedule to schedule instead)'
            }: ${Object.keys(metadataMap).length}`
        );
        const promiseResults = [];
        for (const key of Object.keys(metadataMap)) {
            if (Util.OPTIONS.schedule && metadataMap[key].status === 'Scheduled') {
                // schedule
                Util.logger.info(
                    ` - skipping ${this.definition.type} ${metadataMap[key].name}: already scheduled.`
                );
            } else {
                // schedule + runOnce
                promiseResults.push(this.#executeItem(metadataMap, key));
            }
        }
        const results = await Promise.all(promiseResults);
        const executedKeyArr = results
            .filter(Boolean)
            .filter((r) => r.response.OverallStatus === 'OK')
            .map((r) => r.key);
        Util.logger.info(`Executed ${executedKeyArr.length} of ${keyArr.length} items`);
        return executedKeyArr;
    }

    /**
     * helper for {@link Automation.execute}
     *
     * @param {AutomationMap} metadataMap map of metadata
     * @param {string} key key of the metadata
     * @returns {Promise.<{key:string, response:object}>} metadata key and API response
     */
    static async #executeItem(metadataMap, key) {
        if (Util.OPTIONS.schedule) {
            this.#preDeploySchedule(metadataMap[key]);
            metadataMap[key].status = 'Scheduled';
            return this.#scheduleAutomation(metadataMap, metadataMap, key);
        } else {
            return this.#runOnce(metadataMap[key]);
        }
    }

    /**
     * helper for {@link Automation.execute}
     *
     * @param {AutomationItem} metadataEntry metadata object
     * @returns {Promise.<{key:string, response:object}>} metadata key and API response
     */
    static async #runOnce(metadataEntry) {
        return super.executeSOAP(metadataEntry);
    }

    /**
     *  Standardizes a check for multiple messages but adds query specific filters to error texts
     *
     * @param {object} ex response payload from REST API
     * @returns {string[]} formatted Error Message
     */
    static getErrorsREST(ex) {
        const errors = super.getErrorsREST(ex);
        if (errors?.length > 0) {
            return errors.map((msg) =>
                msg
                    .split('403 Forbidden')
                    .join('403 Forbidden: Please check if the automation is currently running.')
            );
        }
        return errors;
    }

    /**
     * a function to start query execution via API
     *
     * @param {string[]} keyArr customerkey of the metadata
     * @returns {Promise.<string[]>} Returns list of keys that were paused
     */
    static async pause(keyArr) {
        const metadataMap = {};
        for (const key of keyArr) {
            if (key) {
                const results = await this.retrieve(undefined, undefined, undefined, key);
                if (Object.keys(results.metadata).length) {
                    for (const key of Object.keys(results.metadata)) {
                        if (this.#isValidSchedule(results.metadata[key])) {
                            metadataMap[key] = results.metadata[key];
                        } else {
                            Util.logger.error(
                                ` - skipping ${this.definition.type} ${results.metadata[key].name}: no valid schedule settings found.`
                            );
                        }
                    }
                }
            }
        }

        Util.logger.info(`Pausing automations: ${Object.keys(metadataMap).length}`);
        const promiseResults = [];
        for (const key of Object.keys(metadataMap)) {
            if (metadataMap[key].status === 'Scheduled') {
                promiseResults.push(this.#pauseItem(metadataMap[key]));
            } else if (metadataMap[key].status === 'PausedSchedule') {
                Util.logger.info(
                    ` - skipping ${this.definition.type} ${metadataMap[key].name}: already paused.`
                );
            } else {
                Util.logger.error(
                    ` - skipping ${this.definition.type} ${
                        metadataMap[key].name
                    }: currently ${metadataMap[
                        key
                    ].status.toLowerCase()}. Please try again in a few minutes.`
                );
            }
        }
        const pausedKeyArr = (await Promise.all(promiseResults))
            .filter(Boolean)
            .filter((r) => r.response.OverallStatus === 'OK')
            .map((r) => r.key);

        Util.logger.info(`Paused ${pausedKeyArr.length} of ${keyArr.length} items`);
        return pausedKeyArr;
    }

    /**
     * helper for {@link Automation.pause}
     *
     * @param {AutomationItem} metadata automation metadata
     * @returns {Promise.<{key:string, response:object}>} metadata key and API response
     */
    static async #pauseItem(metadata) {
        const schedule = {};
        try {
            const response = await this.client.soap.schedule(
                'Automation',
                schedule,
                {
                    Interaction: {
                        ObjectID: metadata[this.definition.idField],
                    },
                },
                'pause',
                {}
            );
            Util.logger.info(
                ` - paused ${this.definition.type}: ${metadata[this.definition.keyField]} / ${
                    metadata[this.definition.nameField]
                }`
            );
            return { key: metadata[this.definition.keyField], response };
        } catch (ex) {
            this._handleSOAPErrors(ex, 'pausing', metadata, false);
            return null;
        }
    }

    /**
     * Deploys automation - the saved file is the original one due to large differences required for deployment
     *
     * @param {AutomationMap} metadata metadata mapped by their keyField
     * @param {string} targetBU name/shorthand of target businessUnit for mapping
     * @param {string} retrieveDir directory where metadata after deploy should be saved
     * @returns {Promise.<AutomationMap>} Promise
     */
    static async deploy(metadata, targetBU, retrieveDir) {
        const upsertResults = await this.upsert(metadata, targetBU);
        const savedMetadata = await this.saveResults(upsertResults, retrieveDir, null);
        if (
            this.properties.metaDataTypes.documentOnRetrieve.includes(this.definition.type) &&
            !this.definition.documentInOneFile
        ) {
            const count = Object.keys(savedMetadata).length;
            Util.logger.debug(` - Running document for ${count} record${count === 1 ? '' : 's'}`);
            await this.document(savedMetadata);
        }
        return upsertResults;
    }

    /**
     * Creates a single automation
     *
     * @param {AutomationItem} metadata single metadata entry
     * @returns {Promise} Promise
     */
    static create(metadata) {
        const uri = '/automation/v1/automations/';
        return super.createREST(metadata, uri);
    }

    /**
     * Updates a single automation
     *
     * @param {AutomationItem} metadata single metadata entry
     * @param {AutomationItem} metadataBefore metadata mapped by their keyField
     * @returns {Promise} Promise
     */
    static update(metadata, metadataBefore) {
        if (metadataBefore.status === 'Running') {
            Util.logger.error(
                ` ☇ error updating ${this.definition.type} ${
                    metadata[this.definition.keyField] || metadata[this.definition.nameField]
                } / ${
                    metadata[this.definition.nameField]
                }: You cannot update an automation that's currently running. Please wait a bit and retry.`
            );
            return null;
        }
        const uri = '/automation/v1/automations/' + metadata.id;
        return super.updateREST(metadata, uri);
    }

    /**
     * helper for {@link Automation.preDeployTasks} and {@link Automation.execute}
     *
     * @param {AutomationItem} metadata metadata mapped by their keyField
     */
    static #preDeploySchedule(metadata) {
        delete metadata.schedule.rangeTypeId;
        delete metadata.schedule.pattern;
        delete metadata.schedule.scheduledTime;
        delete metadata.schedule.scheduledStatus;
        if (this.definition.timeZoneMapping[metadata.schedule.timezoneName]) {
            metadata.schedule.timezoneId =
                this.definition.timeZoneMapping[metadata.schedule.timezoneName];
        } else {
            Util.logger.error(
                `Could not find timezone ${metadata.schedule.timezoneName} in definition.timeZoneMapping`
            );
        }

        // the upsert API needs this to be named scheduleTypeId; the retrieve API returns it as typeId
        metadata.schedule.scheduleTypeId = metadata.schedule.typeId;
        delete metadata.schedule.typeId;

        // prep startSource
        metadata.startSource = { schedule: metadata.schedule, typeId: 1 };
    }

    /**
     * Gets executed before deploying metadata
     *
     * @param {AutomationItem} metadata metadata mapped by their keyField
     * @returns {Promise.<AutomationItem>} Promise
     */
    static async preDeployTasks(metadata) {
        if (metadata.notifications) {
            this.notificationUpdates[metadata.key] = metadata.notifications;
        } else {
            const cached = cache.getByKey(this.definition.type, metadata.key);
            if (cached?.notifications) {
                // if notifications existed but are no longer present in the deployment package, we need to run an empty update call to remove them
                this.notificationUpdates[metadata.key] = [];
            }
        }
        if (metadata.type == 'automationtriggered' && metadata.automationTrigger) {
            const automationTrigger = metadata.automationTrigger;

            if (automationTrigger.r__fileLocation_name) {
                automationTrigger.fileTransferLocationId = cache.searchForField(
                    'fileLocation',
                    automationTrigger.r__fileLocation_name,
                    'name',
                    'id'
                );
                delete automationTrigger.r__fileLocation_name;
            }
            if (
                automationTrigger.fileNamePatternType &&
                typeof automationTrigger.fileNamePatternType === 'string'
            ) {
                automationTrigger.fileNamePatternType =
                    this.definition.fileNameOperatorMapping[automationTrigger.fileNamePatternType];
            }
        }
        if (this.validateDeployMetadata(metadata)) {
            // folder
            this.setFolderId(metadata);

            if (metadata.type === 'scheduled' && metadata?.schedule?.startDate) {
                // Starting Source == 'Schedule'

                this.#preDeploySchedule(metadata);
                // * run _buildSchedule here but only to check if things look ok - do not use the returned schedule object for deploy
                this._buildSchedule(metadata.schedule);

                delete metadata.schedule.timezoneName;
                delete metadata.startSource.schedule.timezoneName;
            } else if (metadata.type === 'triggered' && metadata.fileTrigger) {
                // Starting Source == 'File Drop'

                // prep startSource
                metadata.startSource = {
                    fileDrop: {
                        fileNamePattern: metadata.fileTrigger.fileNamingPattern,
                        fileNamePatternTypeId: metadata.fileTrigger.fileNamePatternTypeId,
                        folderLocation: metadata.fileTrigger.folderLocationText,
                        queueFiles: metadata.fileTrigger.queueFiles,
                    },
                    typeId: 2,
                };
                delete metadata.fileTrigger;
            }
            delete metadata.schedule;
            delete metadata.type;
            let i = 0;
            if (metadata.steps) {
                for (const step of metadata.steps) {
                    let displayOrder = 0;
                    for (const activity of step.activities) {
                        activity.displayOrder = ++displayOrder;
                        if (
                            activity.r__key &&
                            this.definition.dependencies.includes(activity.r__type)
                        ) {
                            // automations can have empty placeholder for activities with only their type defined
                            activity.activityObjectId = cache.searchForField(
                                activity.r__type,
                                activity.r__key,
                                Definitions[activity.r__type].keyField,
                                Definitions[activity.r__type].idField
                            );
                            activity.name = cache.searchForField(
                                activity.r__type,
                                activity.r__key,
                                Definitions[activity.r__type].keyField,
                                Definitions[activity.r__type].nameField
                            );
                        }
                        if (activity.r__type === 'wait') {
                            const [waitDuration, waitUnit] = activity.name.split(' ');
                            const waitDurationNumber = Number(waitDuration);
                            const allowedWaitUnits = [
                                'Minutes',
                                'Hours',
                                'Days',
                                'Weeks',
                                'Months',
                                'Years',
                            ];
                            if (
                                waitDurationNumber &&
                                waitUnit &&
                                allowedWaitUnits.includes(waitUnit)
                            ) {
                                // @ts-expect-error - serializedObject is only used to create/update wait activities
                                activity.serializedObject = JSON.stringify({
                                    duration: waitDurationNumber,
                                    durationUnits: waitUnit,
                                });
                            } else if (!waitUnit) {
                                // convert 24 hrs based time in waitDuration back into 12 hrs based time
                                let waitTime12 = waitDuration;
                                waitTime12 =
                                    Number(waitTime12) > 12
                                        ? (Number(waitTime12) - 12).toString() + ' AM'
                                        : waitTime12 + ' PM';
                                // @ts-expect-error - serializedObject is only used to create/update wait activities
                                activity.serializedObject = JSON.stringify({
                                    specifiedTime: waitDuration,
                                    timeZone: activity.timeZone || 'GMT Standard Time',
                                });
                            }
                        }
                        activity.objectTypeId =
                            this.definition.activityTypeMapping[activity.r__type];
                        delete activity.r__key;
                        delete activity.r__type;
                    }
                    step.annotation = step.name;
                    step.stepNumber = i;
                    delete step.name;
                    delete step.step;
                    i++;
                }
            }

            if (!Util.OPTIONS.matchName) {
                // make sure the name is unique
                const thisCache = cache.getCache()[this.definition.type];
                const relevantNames = Object.keys(thisCache).map((key) => ({
                    type: null,
                    key: key,
                    name: thisCache[key][this.definition.nameField],
                }));
                // if the name is already in the folder for a different key, add a number to the end
                metadata[this.definition.nameField] = this.findUniqueName(
                    metadata[this.definition.keyField],
                    metadata[this.definition.nameField],
                    relevantNames
                );
            }

            return metadata;
        } else {
            return null;
        }
    }

    /**
     * Validates the automation to be sure it can be deployed.
     * Whitelisted Activites are deployed but require configuration
     *
     * @param {AutomationItem} metadata single automation record
     * @returns {boolean} result if automation can be deployed based on steps
     */
    static validateDeployMetadata(metadata) {
        let deployable = true;
        const errors = [];
        if (metadata.steps) {
            let stepNumber = 0;
            for (const step of metadata.steps) {
                stepNumber++;
                let displayOrder = 0;

                for (const activity of step.activities) {
                    displayOrder++;
                    // check if manual deploy required. if so then log warning
                    if (this.definition.manualDeployTypes.includes(activity.r__type)) {
                        Util.logger.warn(
                            `- ${this.definition.type} '${metadata.name}' requires additional manual configuration: '${activity.r__key || activity.name}' in step ${stepNumber}.${displayOrder}`
                        );
                    }
                    // cannot deploy because it is not supported
                    else if (
                        !this.definition.customDeployTypes.includes(activity.r__type) &&
                        !this.definition.dependencies.includes(activity.r__type)
                    ) {
                        errors.push(
                            `   • not supported ${activity.r__type} activity '${activity.r__key || activity.name}' in step ${stepNumber}.${displayOrder}`
                        );
                        deployable = false;
                    }
                }
            }
        }
        if (!deployable) {
            Util.logger.error(
                ` ☇ skipping ${this.definition.type} ${metadata[this.definition.keyField]} / ${
                    metadata[this.definition.nameField]
                }:`
            );
            for (const error of errors) {
                Util.logger.error(error);
            }
        }
        return deployable;
    }

    /**
     * helper for {@link MetadataType.updateREST} and {@link MetadataType.updateSOAP} that removes old files after the key was changed
     *
     * @param {MetadataTypeItem} metadataEntry a single metadata Entry
     * @returns {Promise.<void>} -
     */
    static async _postChangeKeyTasks(metadataEntry) {
        super._postChangeKeyTasks(metadataEntry, true);
    }

    /**
     * Gets executed after deployment of metadata type
     *
     * @param {AutomationMap} metadataMap metadata mapped by their keyField
     * @param {AutomationMap} originalMetadataMap metadata to be updated (contains additioanl fields)
     * @returns {Promise.<void>} -
     */
    static async postDeployTasks(metadataMap, originalMetadataMap) {
        for (const key in metadataMap) {
            const item = metadataMap[key];

            const oldKey = Util.changedKeysMap?.[this.definition.type]?.[key] || key;
            delete Util.changedKeysMap?.[this.definition.type]?.[key];

            if (!item.type) {
                // create response does not return the type attribute

                const scheduleHelper = item.schedule || item.startSource.schedule;

                // el.type
                item.type = scheduleHelper
                    ? 'scheduled'
                    : item.fileTrigger
                      ? 'triggered'
                      : undefined;

                // el.schedule.timezoneName
                if (item.type === 'scheduled') {
                    // not existing for triggered automations
                    scheduleHelper.timezoneName ||= Util.inverseGet(
                        this.definition.timeZoneMapping,
                        scheduleHelper.timezoneId
                    );
                }

                // @ts-expect-error - string vs enum
                item.status ||= Util.inverseGet(this.definition.statusMapping, item.statusId);
            }
            // need to put schedule on here if status is scheduled
            await Automation.#scheduleAutomation(metadataMap, originalMetadataMap, key, oldKey);

            // need to update notifications separately if there are any
            await Automation.#updateNotificationInfoREST(metadataMap, key);

            // rewrite upsert to retrieve fields
            if (item.steps) {
                for (const step of item.steps) {
                    step.name = step.annotation;
                    delete step.annotation;
                }
            }
        }
        if (Util.OPTIONS.execute || Util.OPTIONS.schedule) {
            Util.logger.info(`Executing: ${this.definition.type}`);
            await this.execute(Object.keys(metadataMap));
        }
        Util.logger.debug(
            `Caching all ${this.definition.type} post-deploy to ensure we have all fields`
        );
        // dont use retrieveForCache here because that is simplified for automations
        const typeCache = await this.retrieve();
        // update values in upsertResults with retrieved values before saving to disk
        for (const key of Object.keys(metadataMap)) {
            if (typeCache.metadata[key]) {
                metadataMap[key] = typeCache.metadata[key];
            }
        }
    }

    /**
     * helper for {@link Automation.postDeployTasks}
     *
     * @param {AutomationMap} metadataMap metadata mapped by their keyField
     * @param {string} key current customer key
     * @returns {Promise.<void>} -
     */
    static async #updateNotificationInfoREST(metadataMap, key) {
        if (this.notificationUpdates[key]) {
            // create & update automation calls return programId as 'legacyId'; retrieve does not return it
            const programId = metadataMap[key]?.legacyId;
            if (programId) {
                const notificationBody = {
                    programId,
                    workers: this.notificationUpdates[key].map((notification) => ({
                        programId,
                        notificationType: notification.type,
                        definition: Array.isArray(notification.email)
                            ? notification.email.join(',')
                            : notification.email,
                        body: notification.message,
                        channelType: 'Account',
                    })),
                };
                try {
                    const result = await this.client.rest.post(
                        '/legacy/v1/beta/automations/notifications/' + programId,
                        notificationBody
                    );
                    if (result) {
                        // should be empty if all OK
                        throw new Error(result);
                    }
                } catch (ex) {
                    Util.logger.error(
                        `Error updating notifications for automation '${metadataMap[key].name}': ${ex.message} (${ex.code}))`
                    );
                }
                Util.logger.info(
                    Util.getGrayMsg(
                        ` - updated notifications for automation '${metadataMap[key].name}'`
                    )
                );
            }
        }
    }

    /**
     * helper for {@link Automation.postDeployTasks}
     *
     * @param {AutomationMap} metadataMap metadata mapped by their keyField
     * @param {AutomationMap} originalMetadataMap metadata to be updated (contains additioanl fields)
     * @param {string} key current customer key
     * @param {string} [oldKey] old customer key before fixKey / changeKeyValue / changeKeyField
     * @returns {Promise.<{key:string, response:object}>} metadata key and API response
     */
    static async #scheduleAutomation(metadataMap, originalMetadataMap, key, oldKey) {
        let response = null;
        oldKey ||= key;
        if (originalMetadataMap[oldKey]?.type === 'scheduled') {
            // Starting Source == 'Schedule': Try starting the automation
            if (originalMetadataMap[oldKey].status === 'Scheduled') {
                let schedule = null;
                try {
                    schedule = this._buildSchedule(originalMetadataMap[oldKey].schedule);
                } catch (ex) {
                    Util.logger.error(
                        `- Could not create schedule for automation '${originalMetadataMap[oldKey].name}' to start it: ${ex.message}`
                    );
                }
                if (schedule !== null) {
                    try {
                        // remove the fields that are not needed for the schedule but only for CLI output
                        const schedule_StartDateTime = schedule._StartDateTime;
                        delete schedule._StartDateTime;
                        const schedule_interval = schedule._interval;
                        delete schedule._interval;
                        const schedule_timezoneString = schedule._timezoneString;
                        delete schedule._timezoneString;
                        // start the automation
                        response = await this.client.soap.schedule(
                            'Automation',
                            schedule,
                            {
                                Interaction: {
                                    ObjectID: metadataMap[key][this.definition.idField],
                                },
                            },
                            'start',
                            {}
                        );
                        const intervalString =
                            (schedule_interval > 1 ? `${schedule_interval} ` : '') +
                            (schedule.RecurrenceType === 'Daily'
                                ? 'Day'
                                : schedule.RecurrenceType.slice(0, -2) +
                                  (schedule_interval > 1 ? 's' : ''));
                        Util.logger.warn(
                            ` - scheduled automation '${
                                originalMetadataMap[oldKey].name
                            }' deployed as Active: runs every ${intervalString} starting ${
                                schedule_StartDateTime.split('T').join(' ').split('.')[0]
                            } ${schedule_timezoneString}`
                        );
                    } catch {
                        // API does not return anything usefull here. We have to know the rules instead
                        Util.logger.error(
                            ` ☇ error starting scheduled ${this.definition.type}${key}: Please check schedule settings`
                        );
                    }
                }
            } else {
                Util.logger.info(
                    Util.getGrayMsg(
                        ` - scheduled automation '${originalMetadataMap[oldKey].name}' deployed as Paused`
                    )
                );
            }
        }
        if (metadataMap[key].startSource) {
            metadataMap[key].schedule = metadataMap[key].startSource.schedule;

            delete metadataMap[key].startSource;
        }
        if (metadataMap[key].schedule?.scheduleTypeId) {
            metadataMap[key].schedule.typeId = metadataMap[key].schedule.scheduleTypeId;
            delete metadataMap[key].schedule.scheduleTypeId;
        }
        return { key, response };
    }

    /**
     * generic script that retrieves the folder path from cache and updates the given metadata with it after retrieve
     *
     * @param {MetadataTypeItem} metadata a single script activity definition
     */
    static setFolderPath(metadata) {
        const folderIdField = metadata[this.definition.folderIdField]
            ? this.definition.folderIdField
            : 'CategoryID';
        try {
            metadata.r__folder_Path = cache.searchForField(
                'folder',
                metadata[folderIdField],
                'ID',
                'Path'
            );
            delete metadata[folderIdField];
            if (metadata.r__folder_Path !== 'my automations') {
                Util.logger.verbose(
                    `- automation '${
                        metadata[this.definition.nameField]
                    }' is located in subfolder ${
                        metadata.r__folder_Path
                    }. Please note that creating automation folders is not supported via API and hence you will have to create it manually in the GUI if you choose to deploy this automation.`
                );
            }
        } catch (ex) {
            Util.logger.warn(
                ` - ${this.definition.type} '${metadata[this.definition.nameField]}' (${
                    metadata[this.definition.keyField]
                }): Could not find folder (${ex.message})`
            );
        }
    }

    /**
     * Builds a schedule object to be used for scheduling an automation
     * based on combination of ical string and start/end dates.
     *
     * @param {AutomationSchedule} scheduleObject child of automation metadata used for scheduling
     * @returns {AutomationScheduleSoap} Schedulable object for soap API (currently not rest supported)
     */
    static _buildSchedule(scheduleObject) {
        /**
         * @type {AutomationScheduleSoap}
         */
        const schedule = {
            Recurrence: {},
            TimeZone: { ID: null, IDSpecified: true },
            RecurrenceRangeType: null,
            StartDateTime: null,
        };
        // build recurrence
        const recurHelper = {};
        // ical values are split by ; then have key values split by =
        for (const obj of scheduleObject.icalRecur.split(';')) {
            const a = obj.split('=');
            recurHelper[a[0]] = a[1];
        }
        if (recurHelper.INTERVAL) {
            recurHelper.INTERVAL = Number.parseInt(recurHelper.INTERVAL);
        }
        // the ical schedule is all in caps but soap objects require Title Case.
        const keyStem = recurHelper.FREQ.charAt(0) + recurHelper.FREQ.slice(1, -2).toLowerCase();

        const patternType = recurHelper['BYMONTH']
            ? 'ByMonth'
            : recurHelper['BYWEEK']
              ? 'ByWeek'
              : recurHelper['BYDAY']
                ? 'ByDay'
                : 'Interval';
        schedule.Recurrence[keyStem + 'lyRecurrencePatternType'] = patternType;
        schedule.Recurrence['@_xsi:type'] = keyStem + 'lyRecurrence';
        schedule.RecurrenceType = keyStem + 'ly';
        if (keyStem === 'Dai') {
            schedule.Recurrence['DayInterval'] = recurHelper.INTERVAL;
        } else {
            schedule.Recurrence[keyStem + 'Interval'] = recurHelper.INTERVAL;
        }
        schedule._interval = recurHelper.INTERVAL; // for CLI output only

        if (!['Minute', 'Hour', 'Dai'].includes(keyStem)) {
            // todo: add support for weekly
            // todo: add support for monthly
            // todo: add support for yearly
            throw new Error(
                'Scheduling automatically not supported for Weekly, Monthly and Yearly, please configure manually.'
            );
        }
        if (recurHelper.FREQ === 'MINUTELY' && recurHelper.INTERVAL && recurHelper.INTERVAL < 5) {
            throw new Error(
                'The smallest interval you can configure is 5 minutes. Please adjust your schedule.'
            );
        }

        if (this.definition.timeZoneMapping[scheduleObject.timezoneName]) {
            scheduleObject.timezoneId =
                this.definition.timeZoneMapping[scheduleObject.timezoneName];
        } else {
            throw new Error(
                `Could not find timezone ${scheduleObject.timezoneName} in definition.timeZoneMapping`
            );
        }
        schedule.TimeZone.ID = scheduleObject.timezoneId;
        schedule._timezoneString = this.definition.timeZoneDifference[scheduleObject.timezoneId];

        // add tz to input date to ensure Date() creates a date object with the right tz
        const inputStartDateString = scheduleObject.startDate + schedule._timezoneString;

        /** @type {Date | string} */
        let startDateTime;
        if (new Date(inputStartDateString) > new Date()) {
            // if start date is in future take this
            startDateTime = scheduleObject.startDate;
            schedule._StartDateTime = scheduleObject.startDate; // store copy for CLI output
        } else {
            // if start date is in past calculate new start date
            const scheduledDate = new Date(inputStartDateString);
            const futureDate = new Date();

            switch (keyStem) {
                case 'Dai': {
                    // keep time from template and start today if possible
                    if (scheduledDate.getHours() <= futureDate.getHours()) {
                        // hour on template has already passed today, start tomorrow
                        futureDate.setDate(futureDate.getDate() + 1);
                    }
                    futureDate.setHours(scheduledDate.getHours());
                    futureDate.setMinutes(scheduledDate.getMinutes());

                    break;
                }
                case 'Hour': {
                    // keep minute and start next possible hour
                    if (scheduledDate.getMinutes() <= futureDate.getMinutes()) {
                        futureDate.setHours(futureDate.getHours() + 1);
                    }
                    futureDate.setMinutes(scheduledDate.getMinutes());

                    break;
                }
                case 'Minute': {
                    // schedule in next 15 minutes randomly to avoid that all automations run at exactly
                    // earliest start 1 minute from now
                    // the same time which would slow performance
                    futureDate.setMinutes(
                        futureDate.getMinutes() + 1 + Math.ceil(Math.random() * 15)
                    );

                    break;
                }
                // No default
            }
            // return time as Dateobject
            startDateTime = futureDate;
            const localTimezoneOffset = futureDate.getTimezoneOffset() / -60;
            schedule._StartDateTime = this._calcTime(localTimezoneOffset, futureDate); // store copy for CLI output
        }

        // The Create/Update API expects dates to be in US-Central time
        // The retrieve API returns the date in whatever timezone one chose, hence we need to convert this upon upsert
        schedule.StartDateTime = this._calcTime(
            this.properties.options.serverTimeOffset,
            startDateTime,
            schedule._timezoneString
        );

        if (recurHelper.UNTIL) {
            schedule.RecurrenceRangeType = 'EndOn';
            schedule.EndDateTime = scheduleObject.endDate;
        } else {
            schedule.RecurrenceRangeType = 'EndAfter';
            schedule.Occurrences = recurHelper.COUNT;
        }

        return schedule;
    }

    /**
     * used to convert dates to the system timezone required for startDate
     *
     * @param {number} offsetServer stack4: US Mountain time (UTC-7); other stacks: US Central (UTC-6)
     * @param {string|Date} dateInput date in ISO format (2021-12-05T20:00:00.983)
     * @param {string} [offsetInput] timzone difference (+02:00)
     * @returns {string} date in server
     */
    static _calcTime(offsetServer, dateInput, offsetInput) {
        // get UTC time in msec
        const utc =
            'string' === typeof dateInput
                ? new Date(dateInput + offsetInput).getTime()
                : dateInput.getTime();

        // create new Date object reflecting SFMC's servertime
        const dateServer = new Date(utc + 3600000 * offsetServer);

        // return time as a string without trailing "Z" and without miliseconds (separated by .)
        return dateServer.toISOString().slice(0, -1).split('.')[0];
    }

    /**
     * Experimental: Only working for DataExtensions:
     * Saves json content to a html table in the local file system. Will create the parent directory if it does not exist.
     * The json's first level of keys must represent the rows and the secend level the columns
     *
     * @private
     * @param {AutomationItem} json dataextension
     * @param {object[][]} tabled prepped array for output in tabular format
     * @returns {string} file content
     */
    static _generateDocMd(json, tabled) {
        let output = `## ${json.key}\n\n`;
        if (json.key !== json.name) {
            output += `**Name** (not equal to External Key)**:** ${json.name}\n\n`;
        }

        output +=
            `**Description:** ${json.description || 'n/a'}\n\n` +
            `**Folder:** ${
                json.r__folder_Path ||
                '_Hidden! Could not find folder with ID ' + json.categoryId + '_'
            }/\n\n`;
        const automationType = { scheduled: 'Schedule', triggered: 'File Drop' };
        output += `**Started by:** ${automationType[json.type] || 'Not defined'}\n\n`;
        output += `**Status:** ${json.status}\n\n`;
        if (json.type === 'scheduled' || json.schedule) {
            const tz =
                this.definition.timeZoneDifference[
                    this.definition.timeZoneMapping[json?.schedule?.timezoneName]
                ];

            if (json.schedule?.icalRecur) {
                output += `**Schedule:**\n\n`;
                output += `* Start: ${json.schedule.startDate.split('T').join(' ')} ${tz}\n`;
                output += `* End: ${json.schedule.endDate.split('T').join(' ')} ${tz}\n`;
                output += `* Timezone: ${json.schedule.timezoneName}\n`;

                const ical = {};
                for (const item of json.schedule.icalRecur.split(';')) {
                    const temp = item.split('=');
                    ical[temp[0]] = temp[1];
                }
                const frequency = ical.FREQ.slice(0, -2).toLowerCase();

                output += `* Recurrance: `;
                output +=
                    ical.COUNT == 1
                        ? 'run only once'
                        : `every${ical.INTERVAL > 1 ? ' ' + ical.INTERVAL : ''} ${
                              frequency === 'dai' ? 'day' : frequency
                          }${ical.INTERVAL > 1 ? 's' : ''}${
                              ical.COUNT
                                  ? ` for ${ical.COUNT} times`
                                  : ical.UNTIL
                                    ? ' until end date'
                                    : ''
                          }`;
                output += '\n';
            } else if (json.schedule) {
                output += `**Schedule:** Not defined\n`;
            }
        } else if (json.type === 'triggered' && json.fileTrigger) {
            output += `**File Trigger:**\n\n`;
            output += `* Queue Files: ${json.fileTrigger.queueFiles}\n`;
            output += `* Published: ${json.fileTrigger.isPublished}\n`;
            output += `* Pattern: ${json.fileTrigger.fileNamingPattern}\n`;
            output += `* Folder:  ${json.fileTrigger.folderLocationText}\n`;
        }
        // add empty line to ensure the following notifications are rendered properly
        output += '\n';
        if (json.notifications?.length) {
            output += `**Notifications:**\n\n`;
            // ensure notifications are sorted by type regardless of how the API returns it
            const notifications = {};
            for (const n of json.notifications) {
                notifications[n.type] =
                    (Array.isArray(n.email) ? n.email.join(',') : n.email) +
                    (n.message ? ` ("${n.message}")` : '');
            }
            if (notifications.Complete) {
                output += `* Complete: ${notifications.Complete}\n`;
            }
            if (notifications.Error) {
                output += `* Error: ${notifications.Error}\n`;
            }
        } else {
            output += `**Notifications:** _none_\n\n`;
        }

        // show table with automation steps
        if (tabled && tabled.length) {
            // add empty line to ensure the following table is rendered properly
            output += '\n';
            let tableSeparator = '';
            const row1 = [];
            for (const column of tabled[0]) {
                row1.push(
                    `| ${column.title}${
                        column.description
                            ? `<br>_<small>${column.description.replaceAll('\n', '<br>')}</small>_`
                            : ''
                    } `
                );
                tableSeparator += '| --- ';
            }
            output += row1.join('') + `|\n${tableSeparator}|\n`;
            for (let i = 1; i < tabled.length; i++) {
                for (const activity of tabled[i]) {
                    output += activity
                        ? `| _${activity.i}: ${activity.type}_<br>${activity.key} `
                        : '| - ';
                }
                output += '|\n';
            }
        }
        return output;
    }

    /**
     * Saves json content to a html table in the local file system. Will create the parent directory if it does not exist.
     * The json's first level of keys must represent the rows and the secend level the columns
     *
     * @private
     * @param {string} directory directory the file will be written to
     * @param {string} filename name of the file without '.json' ending
     * @param {AutomationItem} json dataextension.columns
     * @param {'html'|'md'} mode html or md
     * @returns {Promise.<void>} Promise of success of saving the file
     */
    static async _writeDoc(directory, filename, json, mode) {
        await File.ensureDir(directory);

        const tabled = [];
        if (json.steps && json.steps.length) {
            tabled.push(
                json.steps.map((step, index) => ({
                    title: `Step ${index + 1}`,
                    description: step.name || '-',
                }))
            );
            let maxActivities = 0;
            for (const step of json.steps) {
                if (step.activities.length > maxActivities) {
                    maxActivities = step.activities.length;
                }
            }
            for (let activityIndex = 0; activityIndex < maxActivities; activityIndex++) {
                tabled.push(
                    json.steps.map((step, stepIndex) =>
                        step.activities[activityIndex]
                            ? {
                                  i: stepIndex + 1 + '.' + (activityIndex + 1),
                                  key:
                                      step.activities[activityIndex].r__key ||
                                      (step.activities[activityIndex].timeZone
                                          ? `${step.activities[activityIndex].name}<br>${step.activities[activityIndex].timeZone}`
                                          : step.activities[activityIndex].name),
                                  type: step.activities[activityIndex].r__type,
                              }
                            : null
                    )
                );
            }
        }
        let output;
        if (mode === 'md') {
            output = this._generateDocMd(json, tabled);
            try {
                // write to disk
                await File.writeToFile(directory, filename + '.automation-doc', mode, output);
            } catch (ex) {
                Util.logger.error(`Automation.writeDeToX(${mode}):: error | ` + ex.message);
            }
        }
    }

    /**
     * Parses metadata into a readable Markdown/HTML format then saves it
     *
     * @param {AutomationMap} [metadata] a list of dataExtension definitions
     * @returns {Promise.<void>} -
     */
    static async document(metadata) {
        if (['md', 'both'].includes(this.properties.options.documentType)) {
            if (!metadata) {
                metadata = (
                    await this.readBUMetadataForType(
                        File.normalizePath([
                            this.properties.directories.retrieve,
                            this.buObject.credential,
                            this.buObject.businessUnit,
                        ]),
                        true
                    )
                ).automation;
            }
            const docPath = File.normalizePath([
                this.properties.directories.retrieve,
                this.buObject.credential,
                this.buObject.businessUnit,
                this.definition.type,
            ]);
            if (!metadata || !Object.keys(metadata).length) {
                // as part of retrieve & manual execution we could face an empty folder
                return;
            }
            await Promise.all(
                Object.keys(metadata).map((key) =>
                    this._writeDoc(docPath + '/', key, metadata[key], 'md')
                )
            );
        }
    }

    /**
     * should return only the json for all but asset, query and script that are saved as multiple files
     * additionally, the documentation for dataExtension and automation should be returned
     *
     * @param {string[]} keyArr customerkey of the metadata
     * @returns {Promise.<string[]>} list of all files that need to be committed in a flat array ['path/file1.ext', 'path/file2.ext']
     */
    static async getFilesToCommit(keyArr) {
        if (this.properties.metaDataTypes.documentOnRetrieve.includes(this.definition.type)) {
            // document automation is active. assume we want to commit the MD file as well
            const path = File.normalizePath([
                this.properties.directories.retrieve,
                this.buObject.credential,
                this.buObject.businessUnit,
                this.definition.type,
            ]);

            const fileList = keyArr.flatMap((key) => [
                File.normalizePath([path, `${key}.${this.definition.type}-meta.json`]),
                File.normalizePath([path, `${key}.${this.definition.type}-doc.md`]),
            ]);
            return fileList;
        } else {
            // document automation is not active upon retrieve, run default method instead
            return super.getFilesToCommit(keyArr);
        }
    }

    /**
     * helper to allow us to select single metadata entries via REST
     *
     * @param {string} key customer key
     * @returns {Promise.<string>} objectId or enpty string
     */
    static async #getObjectIdForSingleRetrieve(key) {
        const response = await this.client.soap.retrieve('Program', ['ObjectID'], {
            filter: {
                leftOperand: 'CustomerKey',
                operator: 'equals',
                rightOperand: key,
            },
        });
        return response?.Results?.length ? response.Results[0].ObjectID : null;
    }

    /**
     * Delete a metadata item from the specified business unit
     *
     * @param {string} key Identifier of data extension
     * @returns {Promise.<boolean>} deletion success status
     */
    static async deleteByKey(key) {
        // the delete endpoint returns a general exception if the automation does not exist; handle it gracefully instead by adding a retrieve first
        const objectId = key ? await this.#getObjectIdForSingleRetrieve(key) : null;
        if (!objectId) {
            await this.deleteNotFound(key);
            return false;
        }
        return super.deleteByKeySOAP(key, 'CustomerKey');
    }

    /**
     * clean up after deleting a metadata item
     *
     * @param {string} customerKey Identifier of metadata item
     * @returns {Promise.<void>} -
     */
    static async postDeleteTasks(customerKey) {
        // delete local copy: retrieve/cred/bu/.../...-meta.json
        // delete local copy: retrieve/cred/bu/.../...-doc.md
        await super.postDeleteTasks(customerKey, [`${this.definition.type}-doc.md`]);
    }

    /**
     * helper for {@link MetadataType.getNestedValue} - adjusted for automation activities
     *
     * @param {any} obj the metadataItem to search in (or the result)
     * @param {string[]} nestedKeyParts key in dot-notation split into parts
     * @param {string} dependentType used for types that need custom handling
     * @returns {(string) | (string)[]} result
     */
    static getNestedValueHelper(obj, nestedKeyParts, dependentType) {
        if (nestedKeyParts.length == 0) {
            // key was found; append '' to ensure we always return a string
            return obj + '';
        }
        // get most left key
        const key = nestedKeyParts.shift();
        if (!obj[key]) {
            // key was not found
            return;
        }
        if (Array.isArray(obj[key])) {
            return obj[key].flatMap((x) =>
                this.getNestedValueHelper(x, [...nestedKeyParts], dependentType)
            );
        } else {
            if (nestedKeyParts.length == 0) {
                // key was found if length is 0 and search field (r__type) is equal the current type, else, keep going
                return obj[key] === dependentType ? obj.r__key : undefined;
            } else {
                return this.getNestedValueHelper(obj[key], [...nestedKeyParts], dependentType);
            }
        }
    }
}

// Assign definition to static attributes
Automation.definition = Definitions.automation;

export default Automation;
