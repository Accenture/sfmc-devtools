'use strict';

const MetadataType = require('./MetadataType');
const TYPE = require('../../types/mcdev.d');
const Util = require('../util/util');
const File = require('../util/file');
const Definitions = require('../MetadataTypeDefinitions');
const cache = require('../util/cache');
const pLimit = require('p-limit');
const Cli = require('../util/cli');

/**
 * Automation MetadataType
 *
 * @augments MetadataType
 */
class Automation extends MetadataType {
    static notificationUpdates = {};
    /**
     * Retrieves Metadata of Automation
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void} [_] unused parameter
     * @param {void} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<TYPE.AutomationMapObj>} Promise of metadata
     */
    static async retrieve(retrieveDir, _, __, key) {
        /** @type {TYPE.SoapRequestParams} */
        let requestParams = null;
        if (key) {
            requestParams = {
                filter: {
                    leftOperand: 'CustomerKey',
                    operator: 'equals',
                    rightOperand: key,
                },
            };
        }
        const results = await this.client.soap.retrieveBulk('Program', ['ObjectID'], requestParams);
        if (results.Results?.length && !key) {
            // empty results will come back without "Results" defined
            Util.logger.info(
                Util.getGrayMsg(
                    ` - ${results.Results?.length} automation${
                        results.Results?.length === 1 ? '' : 's'
                    } found. Retrieving details...`
                )
            );
        }
        // the API seems to handle 50 concurrent requests nicely
        const rateLimit = pLimit(50);

        const details = results.Results
            ? await Promise.all(
                  results.Results.map(async (item) =>
                      rateLimit(async () => {
                          try {
                              return await this.client.rest.get(
                                  '/automation/v1/automations/' + item.ObjectID
                              );
                          } catch (ex) {
                              try {
                                  if (ex.message == 'socket hang up') {
                                      // one more retry; it's a rare case but retrying again should solve the issue gracefully
                                      return await this.client.rest.get(
                                          '/automation/v1/automations/' + item.ObjectID
                                      );
                                  }
                              } catch {
                                  // no extra action needed, handled below
                              }
                              // if we do get here, we should log the error and continue instead of failing to download all automations
                              Util.logger.error(
                                  ` ☇ skipping Automation ${item.ObjectID}: ${ex.message} ${ex.code}`
                              );
                              return null;
                          }
                      })
                  )
              )
            : [];

        // * if retrieving some automations fails, a null element would remain in the details-array for each of them that needs to be filtered to prevent it from causing issues elsewhere
        let metadataMap = this.parseResponseBody({ items: details.filter(Boolean) });

        if (Object.keys(metadataMap).length) {
            // attach notification information to each automation that has any
            await this.#getAutomationNotificationsREST(metadataMap);
        }

        // * retrieveDir can be empty when we use it in the context of postDeployTasks
        if (retrieveDir) {
            metadataMap = await this.saveResults(metadataMap, retrieveDir, null, null);
            Util.logger.info(
                `Downloaded: ${this.definition.type} (${Object.keys(metadataMap).length})` +
                    Util.getKeysString(key)
            );

            await this.runDocumentOnRetrieve(key, metadataMap);
        }
        return { metadata: metadataMap, type: this.definition.type };
    }

    /**
     * helper for {@link Automation.retrieve} to get Automation Notifications
     *
     * @private
     * @param {TYPE.MetadataTypeMap} metadataMap keyField => metadata map
     * @returns {Promise.<void>} Promise of nothing
     */
    static async #getAutomationNotificationsREST(metadataMap) {
        Util.logger.info(Util.getGrayMsg(` Retrieving Automation Notification information...`));

        // get list of keys that we retrieved so far
        const foundKeys = Object.keys(metadataMap);

        // get encodedAutomationID to retrieve notification information
        const automationLegacyMapObj = await this.#getEncodedAutomationIDs();
        const automationLegacyMap = Object.keys(automationLegacyMapObj.metadata)
            .filter((key) => foundKeys.includes(key))
            // ! using the `id` field to retrieve notifications does not work. instead one needs to use the URL in the `notifications` field
            .map((key) => ({
                id: automationLegacyMapObj.metadata[key].id,
                key,
            }));

        // get notifications for each automation
        const rateLimit = pLimit(5);
        let found = 0;
        let skipped = 0;
        const promiseMap = await Promise.all(
            automationLegacyMap.map((automationLegacy) =>
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
        return promiseMap;
    }

    /**
     * Retrieves Metadata of Automation
     *
     * @returns {Promise.<TYPE.AutomationMapObj>} Promise of metadata
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
     * @returns {Promise.<TYPE.AutomationMapObj>} Promise of metadata
     */
    static async retrieveForCache() {
        // get automations for cache
        const results = await this.client.soap.retrieveBulk('Program', [
            'ObjectID',
            'CustomerKey',
            'Name',
        ]);
        const resultsConverted = {};
        if (Array.isArray(results?.Results)) {
            // get encodedAutomationID to retrieve notification information
            const automationsLegacy = await this.#getEncodedAutomationIDs();
            // merge encodedAutomationID into results
            for (const m of results.Results) {
                resultsConverted[m.CustomerKey] = {
                    id: m.ObjectID,
                    key: m.CustomerKey,
                    name: m.Name,
                    programId: automationsLegacy.metadata[m.CustomerKey]?.id,
                    status: automationsLegacy.metadata[m.CustomerKey]?.status,
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
     * @param {TYPE.TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {Promise.<TYPE.AutomationItemObj>} Promise of metadata
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
                // attach notification information to each automation that has any
                await this.#getAutomationNotificationsREST(metadataMap);
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
                val = JSON.parse(JSON.stringify(details));
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
     * @param {TYPE.AutomationItem} metadata a single automation
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
     * @param {TYPE.AutomationItem} metadata a single automation
     * @returns {TYPE.AutomationItem | void} parsed item
     */
    static postRetrieveTasks(metadata) {
        // folder
        this.setFolderPath(metadata);
        // automations are often skipped due to lack of support.
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
                        }
                        // / if managed by cache we can update references to support deployment
                        else if (
                            Definitions[activity.r__type]?.['idField'] &&
                            cache.getCache(this.buObject.mid)[activity.r__type]
                        ) {
                            try {
                                // this will override the name returned by the API in case this activity's name was changed since the automation was last updated, keeping things nicely in sync for mcdev
                                const name = cache.searchForField(
                                    activity.r__type,
                                    activity.activityObjectId,
                                    Definitions[activity.r__type].idField,
                                    Definitions[activity.r__type].nameField
                                );
                                if (name !== activity.name) {
                                    Util.logger.debug(
                                        ` - updated name of step ${stepNumber}.${activity.displayOrder}` +
                                            ` in Automation '${metadata.name}' from ${activity.name} to ${name}`
                                    );
                                    activity.name = name;
                                }
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
                }
            }
            return JSON.parse(JSON.stringify(metadata));
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
                metadataMap[key] = {};
                metadataMap[key][this.definition.idField] = objectId;
                metadataMap[key][this.definition.keyField] = key;
            }
        }
        if (!Object.keys(metadataMap).length) {
            Util.logger.error(`No ${this.definition.type} to execute`);
            return false;
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
     * @param {TYPE.AutomationMap} metadataMap map of metadata
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
     * @param {TYPE.AutomationItem} metadataEntry metadata object
     * @returns {Promise.<{key:string, response:object}>} metadata key and API response
     */
    static async #runOnce(metadataEntry) {
        return super.executeSOAP(metadataEntry);
    }

    /**
     *  Standardizes a check for multiple messages but adds query specific filters to error texts
     *
     * @param {object} ex response payload from REST API
     * @returns {string[] | void} formatted Error Message
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
     * @param {TYPE.AutomationItem} metadata automation metadata
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
     * @param {TYPE.AutomationMap} metadata metadata mapped by their keyField
     * @param {string} targetBU name/shorthand of target businessUnit for mapping
     * @param {string} retrieveDir directory where metadata after deploy should be saved
     * @returns {Promise.<TYPE.AutomationMap>} Promise
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
     * @param {TYPE.AutomationItem} metadata single metadata entry
     * @returns {Promise} Promise
     */
    static create(metadata) {
        const uri = '/automation/v1/automations/';
        return super.createREST(metadata, uri);
    }

    /**
     * Updates a single automation
     *
     * @param {TYPE.AutomationItem} metadata single metadata entry
     * @param {TYPE.AutomationItem} metadataBefore metadata mapped by their keyField
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
     * @param {TYPE.AutomationItem} metadata metadata mapped by their keyField
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
     * @param {TYPE.AutomationItem} metadata metadata mapped by their keyField
     * @returns {Promise.<TYPE.AutomationItem>} Promise
     */
    static async preDeployTasks(metadata) {
        if (metadata.notifications) {
            this.notificationUpdates[metadata.key] = metadata.notifications;
        } else {
            const cached = cache.getByKey(metadata.key);
            if (cached?.notifications) {
                // if notifications existed but are no longer present in the deployment package, we need to run an empty update call to remove them
                this.notificationUpdates[metadata.key] = [];
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
                        filenamePattern: metadata.fileTrigger.fileNamingPattern,
                        filenamePatternTypeId: metadata.fileTrigger.fileNamePatternTypeId,
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
                            activity.name &&
                            this.definition.dependencies.includes(activity.r__type)
                        ) {
                            // automations can have empty placeholder for activities with only their type defined
                            activity.activityObjectId = cache.searchForField(
                                activity.r__type,
                                activity.name,
                                Definitions[activity.r__type].nameField,
                                Definitions[activity.r__type].idField
                            );
                        }
                        activity.objectTypeId =
                            this.definition.activityTypeMapping[activity.r__type];
                        delete activity.r__type;
                    }
                    step.annotation = step.name;
                    step.stepNumber = i;
                    delete step.name;
                    delete step.step;
                    i++;
                }
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
     * @param {TYPE.AutomationItem} metadata single automation record
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
                            `- ${this.definition.type} '${metadata.name}' requires additional manual configuration: '${activity.name}' in step ${stepNumber}.${displayOrder}`
                        );
                    }
                    // cannot deploy because it is not supported
                    else if (!this.definition.dependencies.includes(activity.r__type)) {
                        errors.push(
                            `   • not supported ${activity.r__type} activity '${activity.name}' in step ${stepNumber}.${displayOrder}`
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
     * @private
     * @param {TYPE.MetadataTypeItem} metadataEntry a single metadata Entry
     * @returns {void}
     */
    static async _postChangeKeyTasks(metadataEntry) {
        super._postChangeKeyTasks(metadataEntry, true);
    }

    /**
     * Gets executed after deployment of metadata type
     *
     * @param {TYPE.AutomationMap} metadataMap metadata mapped by their keyField
     * @param {TYPE.AutomationMap} originalMetadataMap metadata to be updated (contains additioanl fields)
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

                // el.status
                item.status ||= Util.inverseGet(this.definition.statusMapping, item.statusId);
            }
            // need to put schedule on here if status is scheduled
            await Automation.#scheduleAutomation(metadataMap, originalMetadataMap, key, oldKey);

            // need to update notifications separately if there are any
            await Automation.#updateNotificationInfo(metadataMap, key);

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
    }
    /**
     * helper for {@link Automation.postDeployTasks}
     *
     * @param {TYPE.AutomationMap} metadataMap metadata mapped by their keyField
     * @param {string} key current customer key
     * @returns {Promise.<void>} -
     */
    static async #updateNotificationInfo(metadataMap, key) {
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
                this.#updateNotificationInfoREST(key, programId, notificationBody);
            }
        }
    }
    /**
     * helper function to send POST request to update notifications
     *
     * @param {string} key current customer key
     * @param {string} programId legacy automation id
     * @param {string} notificationBody notification payload
     * @returns {string} returns "OK" or "Error"
     */
    static async #updateNotificationInfoREST(key, programId, notificationBody) {
        try {
            const result = await this.client.rest.post(
                '/legacy/v1/beta/automations/notifications/' + programId,
                notificationBody
            );
            if (result) {
                // should be empty if all OK
                throw new Error(result);
            } else {
                Util.logger.info(
                    Util.getGrayMsg(` - updated notifications for automation '${key}'`)
                );
                return 'OK';
            }
        } catch (ex) {
            Util.logger.error(
                ex.code === 'ERR_BAD_REQUEST'
                    ? `Error updating notifications for automation ${key}: ${ex.message} (${ex.code})). Make sure that the email address is correct.`
                    : `Error updating notifications for automation '${key}': ${ex.message} (${ex.code})).`
            );
            return 'Error';
        }
    }

    /**
     * helper for {@link Automation.postDeployTasks}
     *
     * @param {TYPE.AutomationMap} metadataMap metadata mapped by their keyField
     * @param {TYPE.AutomationMap} originalMetadataMap metadata to be updated (contains additioanl fields)
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
     * @param {TYPE.MetadataTypeItem} metadata a single script activity definition
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
     * automation-specific script that retrieves the folder ID from cache and updates the given metadata with it before deploy
     *
     * @param {TYPE.MetadataTypeItem} metadata a single item
     */
    static setFolderId(metadata) {
        try {
            metadata.categoryId = cache.searchForField(
                'folder',
                metadata.r__folder_Path,
                'Path',
                'ID'
            );
            if (metadata.r__folder_Path !== 'my automations') {
                Util.logger.warn(
                    ` - Automation '${
                        metadata[this.definition.nameField]
                    }' is located in subfolder ${
                        metadata.r__folder_Path
                    }. Please note that creating automation folders is not supported via API and hence you will have to create it manually in the GUI if you choose to deploy this automation.`
                );
            }
            delete metadata.r__folder_Path;
        } catch {
            throw new Error(
                `Folder '${metadata.r__folder_Path}' was not found on the server. Please create this manually in the GUI. Automation-folders cannot be deployed automatically.`
            );
        }
    }

    /**
     * Builds a schedule object to be used for scheduling an automation
     * based on combination of ical string and start/end dates.
     *
     * @param {TYPE.AutomationSchedule} scheduleObject child of automation metadata used for scheduling
     * @returns {TYPE.AutomationScheduleSoap} Schedulable object for soap API (currently not rest supported)
     */
    static _buildSchedule(scheduleObject) {
        /**
         * @type {TYPE.AutomationScheduleSoap}
         */
        const schedule = { Recurrence: {}, TimeZone: { IDSpecified: true } };
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

        if (new Date(inputStartDateString) > new Date()) {
            // if start date is in future take this
            schedule.StartDateTime = scheduleObject.startDate;
            schedule._StartDateTime = schedule.StartDateTime; // store copy for CLI output
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
            schedule.StartDateTime = futureDate;
            const localTimezoneOffset = schedule.StartDateTime.getTimezoneOffset() / -60;
            schedule._StartDateTime = this._calcTime(localTimezoneOffset, schedule.StartDateTime); // store copy for CLI output
        }

        // The Create/Update API expects dates to be in US-Central time
        // The retrieve API returns the date in whatever timezone one chose, hence we need to convert this upon upsert
        schedule.StartDateTime = this._calcTime(
            this.properties.options.serverTimeOffset,
            schedule.StartDateTime,
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
     * @param {TYPE.AutomationItem} json dataextension
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
                for (const field of tabled[i]) {
                    output += field ? `| _${field.i}: ${field.type}_<br>${field.name} ` : '| - ';
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
     * @param {TYPE.AutomationItem} json dataextension.columns
     * @param {'html'|'md'} mode html or md
     * @returns {Promise.<boolean>} Promise of success of saving the file
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
                                  name: step.activities[activityIndex].name,
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
     * @param {TYPE.AutomationMap} [metadata] a list of dataExtension definitions
     * @returns {Promise.<void>} -
     */
    static async document(metadata) {
        if (['md', 'both'].includes(this.properties.options.documentType)) {
            if (!metadata) {
                metadata = this.readBUMetadataForType(
                    File.normalizePath([
                        this.properties.directories.retrieve,
                        this.buObject.credential,
                        this.buObject.businessUnit,
                    ]),
                    true
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
            return await Promise.all(
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
     * @returns {string[]} list of all files that need to be committed in a flat array ['path/file1.ext', 'path/file2.ext']
     */
    static getFilesToCommit(keyArr) {
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
     * @private
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
     * @param {string} customerKey Identifier of data extension
     * @returns {boolean} deletion success status
     */
    static async deleteByKey(customerKey) {
        // the delete endpoint returns a general exception if the automation does not exist; handle it gracefully instead by adding a retrieve first
        const objectId = customerKey ? await this.#getObjectIdForSingleRetrieve(customerKey) : null;
        if (!objectId) {
            Util.logger.error(` - automation not found`);
            return false;
        }
        return super.deleteByKeySOAP(customerKey, 'CustomerKey');
    }
    /**
     * clean up after deleting a metadata item
     *
     * @param {string} customerKey Identifier of metadata item
     * @returns {void}
     */
    static async postDeleteTasks(customerKey) {
        // delete local copy: retrieve/cred/bu/.../...-meta.json
        // delete local copy: retrieve/cred/bu/.../...-doc.md
        await super.postDeleteTasks(customerKey, [`${this.definition.type}-doc.md`]);
    }
    /**
     * helper function to retrieve data about all automations in the BU
     *
     * @returns {Promise.<string[]>} returns data about automations with the legacy key
     */
    static async #getEncodedAutomationIDs() {
        const keyBackup = this.definition.keyField;
        const iteratorBackup = this.definition.bodyIteratorField;
        this.definition.keyField = 'key';
        this.definition.bodyIteratorField = 'entry';
        const automationLegacyKeys = await super.retrieveREST(
            undefined,
            `/legacy/v1/beta/bulk/automations/automation/definition/`
        );
        this.definition.keyField = keyBackup;
        this.definition.bodyIteratorField = iteratorBackup;
        return automationLegacyKeys;
    }
    /**
     * A function to update automation email notifications
     *
     * @param {string} keys metadata keys
     * @returns {Promise.<string[]>} keys of the automations where notifications were updated
     */
    static async updateNotifications(keys) {
        const updatedKeys = [];
        if (Util.OPTIONS.clear) {
            updatedKeys.push(...(await this.clearNotifications(keys)));
            return updatedKeys;
        }
        let completionEmail = [],
            errorEmail = [],
            notificationsResult,
            oldCompletionEmails,
            oldCompletionNote,
            oldErrorEmails,
            oldErrorNote;

        if (Util.OPTIONS.completionEmail) {
            completionEmail = Util.OPTIONS.completionEmail.split(',');
        }
        if (Util.OPTIONS.errorEmail) {
            errorEmail = Util.OPTIONS.errorEmail.split(',');
        }
        let completionNote = Util.OPTIONS.completionNote;
        let errorNote = Util.OPTIONS.errorNote;

        let shouldUpdateCompletion =
            (completionNote && completionNote.length > 0) || completionEmail.length > 0
                ? true
                : false;
        let shouldUpdateError =
            (errorNote && errorNote.length > 0) || errorEmail.length > 0 ? true : false;

        const automationLegacyMapObj = await this.#getEncodedAutomationIDs(); // retrieve automation legacy keys to update notifications
        for (const key of Object.keys(automationLegacyMapObj.metadata)) {
            // create payload
            const notificationBody = {
                programId: automationLegacyMapObj.metadata[key].id,
                workers: [],
            };

            if (Array.isArray(keys) && keys.includes(key)) {
                try {
                    notificationsResult = await this.client.rest.get(
                        '/legacy/v1/beta/automations/notifications/' +
                            automationLegacyMapObj.metadata[key].id
                    );
                } catch (ex) {
                    Util.logger.error(
                        `Error retrieving notifications for automation '${key}': ${ex.message} (${ex.code}))`
                    );
                }
                // if a note was provided and email address was not - check if notif email address exists
                if (
                    completionNote &&
                    completionEmail.length === 0 &&
                    (!notificationsResult.workers ||
                        !notificationsResult.workers.find(
                            (notification) => notification.notificationType == 'Complete'
                        ))
                ) {
                    const emails = await Cli.updateNotificationEmails('completionEmail');
                    if (emails) {
                        // merge the string input into completionEmail array
                        completionEmail = completionEmail.concat(emails.split(','));
                    } else {
                        completionNote = undefined;
                        shouldUpdateCompletion = false;
                        Util.logger.info(
                            ` ☇ skipping --completionNote' - the email address for Run completion was not set`
                        );
                    }
                }
                // same for errorNote
                if (
                    errorNote &&
                    errorEmail.length === 0 &&
                    (!notificationsResult.workers ||
                        !notificationsResult.workers.find(
                            (notification) => notification.notificationType == 'Error'
                        ))
                ) {
                    const emails = await Cli.updateNotificationEmails('errorEmail');
                    if (emails) {
                        // merge the string input into errorEmail array
                        errorEmail = errorEmail.concat(emails.split(','));
                    } else {
                        errorNote = undefined;
                        shouldUpdateError = false;
                        Util.logger.info(
                            ` ☇ skipping --errorNote' - the email address for Runtime error was not set`
                        );
                    }
                }

                // check if there are any notifications set
                if (Array.isArray(notificationsResult?.workers)) {
                    // if the parameters provided are the same as the email addresses/notes already in the notifications - skip this automation
                    oldCompletionEmails = notificationsResult.workers
                        .filter((notification) => notification.notificationType == 'Complete')
                        .map((notification) => notification.definition);
                    oldCompletionNote = notificationsResult.workers.find(
                        (notification) => notification.notificationType == 'Complete'
                    )?.body;
                    for (const email of completionEmail) {
                        if (oldCompletionEmails.includes(email) || !Util.emailValidator(email)) {
                            Util.logger.info(
                                ` ☇ skipping ${email}- this email address is already in the notifications or is not a valid email`
                            );
                            completionEmail.splice(completionEmail.indexOf(email), 1);
                        }
                    }
                    // if old note is the same as the one that the user provided - no need to update
                    if (oldCompletionNote == completionNote) {
                        completionNote = null;
                    }
                    oldErrorEmails = notificationsResult.workers
                        .filter((notification) => notification.notificationType == 'Error')
                        .map((notification) => notification.definition);
                    oldErrorNote = notificationsResult.workers.find(
                        (notification) => notification.notificationType == 'Error'
                    )?.body;
                    for (const email of errorEmail) {
                        if (oldErrorEmails.includes(email) || !Util.emailValidator(email)) {
                            Util.logger.info(
                                ` ☇ skipping ${email}- this email address is already in the notifications or is not a valid email`
                            );
                            errorEmail.splice(errorEmail.indexOf(email), 1);
                        }
                    }
                    // if old note is the same as the one that the user provided - no need to update
                    if (oldErrorNote == errorNote) {
                        errorNote = null;
                    }

                    // earlier we have removed email addresses that are already in the notifications and verified that the new note is different from the one user provided.
                    if (completionEmail.length < 1 && !completionNote) {
                        shouldUpdateCompletion = false;
                    }
                    if (errorEmail.length < 1 && !errorNote) {
                        shouldUpdateError = false;
                    }
                    if (!shouldUpdateCompletion && !shouldUpdateError) {
                        Util.logger.info(
                            `You have provided email addresses that are already in the automation notification. The notes didn't change either. Exiting..`
                        );
                        return updatedKeys;
                    }
                    // copy existing notifications into payload
                    if (notificationsResult.workers) {
                        notificationBody.workers = notificationsResult.workers;
                    }
                }
                // if new note is null then keep the old one only update emails
                if (!completionNote) {
                    completionNote = oldCompletionNote;
                }
                // completionEmail is an array even if there is only one email
                if (completionEmail.length > 0) {
                    for (const email of completionEmail) {
                        if (Util.emailValidator(email)) {
                            notificationBody.workers.push({
                                programId: automationLegacyMapObj.metadata[key].id,
                                notificationType: 'Complete',
                                definition: email,
                                body: completionNote,
                                channelType: 'Account',
                            });
                        } else {
                            Util.logger.info(
                                ` ☇ skipping ${email}- this email address is not a valid email`
                            );
                        }
                    }
                } else {
                    // no emails to update, only update the note

                    for (const notification of notificationBody.workers) {
                        if (notification.notificationType == 'Complete') {
                            notificationBody.workers.map(
                                (notification) => (notification.body = completionNote)
                            );
                        }
                    }
                }
                if (!errorNote) {
                    errorNote = oldErrorNote;
                }
                if (errorEmail.length > 0) {
                    for (const email of errorEmail) {
                        if (Util.emailValidator(email)) {
                            notificationBody.workers.push({
                                programId: automationLegacyMapObj.metadata[key].id,
                                notificationType: 'Error',
                                definition: email,
                                body: errorNote,
                                channelType: 'Account',
                            });
                        } else {
                            Util.logger.info(
                                ` ☇ skipping ${email}- this email address is not a valid email`
                            );
                        }
                    }
                } else {
                    for (const notification of notificationBody.workers) {
                        if (notification.notificationType == 'Error') {
                            notificationBody.workers.map(
                                (notification) => (notification.body = errorNote)
                            );
                        }
                    }
                }
                if (
                    notificationBody.workers &&
                    notificationBody.workers.length > 0 &&
                    (await this.#updateNotificationInfoREST(
                        key,
                        automationLegacyMapObj.metadata[key].id,
                        notificationBody
                    )) === 'OK'
                ) {
                    updatedKeys.push(key);
                }
            }
        }

        return updatedKeys;
    }
    /**
     * A function to remove automation email notifications and/or notes
     *
     * @param {string} keys metadata keys
     * @returns {Promise.<string[]>} keys of the automations where notifications were updated
     */
    static async clearNotifications(keys) {
        const clear = Util.OPTIONS.clear.toLowerCase();
        const automationLegacyMapObj = await this.#getEncodedAutomationIDs(); // retrieve automation legacy keys to update notifications
        const updatedKeys = [];
        let notificationsResult;
        for (const key of Object.keys(automationLegacyMapObj.metadata)) {
            if (Array.isArray(keys) && keys.includes(key)) {
                let notificationBody;
                notificationBody = {
                    programId: automationLegacyMapObj.metadata[key].id,
                    workers: [],
                };
                try {
                    notificationsResult = await this.client.rest.get(
                        '/legacy/v1/beta/automations/notifications/' +
                            automationLegacyMapObj.metadata[key].id
                    );
                } catch (ex) {
                    Util.logger.error(
                        `Error retrieving notifications for automation '${key}': ${ex.message} (${ex.code}))`
                    );
                }
                if (!notificationsResult.workers) {
                    Util.logger.info(
                        `☇ skipping automation ${key}. No notifications set for this automation.'`
                    );
                    continue;
                }
                switch (clear) {
                    case 'all': {
                        notificationBody = {
                            programId: automationLegacyMapObj.metadata[key].id,
                        };
                        Util.logger.info(
                            `--clear=all option was provided. Removing all emails and notes'`
                        );
                        break;
                    }
                    case 'erroremail': {
                        for (const notification of notificationsResult.workers) {
                            if (notification.notificationType == 'Complete') {
                                notificationBody.workers.push(notification);
                            }
                        }
                        Util.logger.info(
                            `--clear=erroremail option was provided. Removing all error emails and notes'`
                        );
                        break;
                    }
                    case 'completionemail': {
                        for (const notification of notificationsResult.workers) {
                            if (notification.notificationType == 'Error') {
                                notificationBody.workers.push(notification);
                            }
                        }
                        Util.logger.info(
                            `--clear=completionemail option was provided. Removing all completion emails and notes'`
                        );
                        break;
                    }
                    case 'notes': {
                        // removes only notes (completion and error)
                        notificationsResult.workers.map((notification) => (notification.body = ''));
                        notificationBody.workers = notificationsResult.workers;
                        Util.logger.info(`--clear=notes option was provided. Removing all notes'`);
                        break;
                    }
                    default: {
                        Util.logger.error(`Unknown --clear option. Exiting'`);
                        return updatedKeys;
                    }
                }
                // update notifications
                if (
                    (await this.#updateNotificationInfoREST(
                        key,
                        automationLegacyMapObj.metadata[key].id,
                        notificationBody
                    )) === 'OK'
                ) {
                    Util.logger.info(`clearNotifications executed for automation '${key}'`);
                    updatedKeys.push(key);
                }
            }
        }
        return updatedKeys;
    }
}

// Assign definition to static attributes
Automation.definition = Definitions.automation;

module.exports = Automation;
