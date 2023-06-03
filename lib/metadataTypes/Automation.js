'use strict';

import MetadataType from './MetadataType.js';
import TYPE from '../../types/mcdev.d.js';
import { Util } from '../util/util.js';
import File from '../util/file.js';
import Definitions from '../MetadataTypeDefinitions.js';
import cache from '../util/cache.js';

/**
 * Automation MetadataType
 *
 * @augments MetadataType
 */
class Automation extends MetadataType {
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
                    ` - ${results.Results?.length} Automation${
                        results.Results?.length === 1 ? '' : 's'
                    } found. Retrieving details...`
                )
            );
        }
        const details = results.Results
            ? await Promise.all(
                  results.Results.map(async (a) => {
                      try {
                          return await this.client.rest.get(
                              '/automation/v1/automations/' + a.ObjectID
                          );
                      } catch (ex) {
                          try {
                              if (ex.message == 'socket hang up') {
                                  // one more retry; it's a rare case but retrying again should solve the issue gracefully
                                  return await this.client.rest.get(
                                      '/automation/v1/automations/' + a.ObjectID
                                  );
                              }
                          } catch {
                              // no extra action needed, handled below
                          }
                          // if we do get here, we should log the error and continue instead of failing to download all automations
                          Util.logger.error(
                              ` ☇ skipping Automation ${a.ObjectID}: ${ex.message} ${ex.code}`
                          );
                          return null;
                      }
                  })
              )
            : [];
        let metadataMap = this.parseResponseBody({ items: details });
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
        const results = await this.client.soap.retrieveBulk('Program', [
            'ObjectID',
            'CustomerKey',
            'Name',
        ]);
        const resultsConverted = {};
        if (Array.isArray(results?.Results)) {
            for (const m of results.Results) {
                resultsConverted[m.CustomerKey] = {
                    id: m.ObjectID,
                    key: m.CustomerKey,
                    name: m.Name,
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
            const details = await this.client.rest.get(
                '/automation/v1/automations/' + metadata.ObjectID
            );
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
                try {
                    // type 'Running' is temporary status only, overwrite with Scheduled for storage.
                    if (metadata.type === 'scheduled' && metadata.status === 'Running') {
                        metadata.status = 'Scheduled';
                    }
                } catch {
                    Util.logger.error(
                        `- ${this.definition.type} ${metadata.name} does not have a valid schedule setting.`
                    );
                    return;
                }
            } else if (metadata.type === 'triggered' && metadata.fileTrigger) {
                // Starting Source == 'File Drop'
                // Do nothing for now
            }
            if (metadata.steps) {
                for (const step of metadata.steps) {
                    const stepNumber = step.stepNumber || step.step;
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
                                ` - skip parsing of activity due to missing activityObjectId: ${JSON.stringify(
                                    activity
                                )}`
                            );
                            // empty if block
                        } else if (!this.definition.dependencies.includes(activity.r__type)) {
                            Util.logger.debug(
                                ` - skip parsing because the type is not set up as a dependecy for ${this.definition.type}`
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
     * Deploys automation - the saved file is the original one due to large differences required for deployment
     *
     * @param {TYPE.AutomationMap} metadata metadata mapped by their keyField
     * @param {string} targetBU name/shorthand of target businessUnit for mapping
     * @param {string} retrieveDir directory where metadata after deploy should be saved
     * @param {boolean} [isRefresh] optional flag - so far not used by automation
     * @returns {Promise.<TYPE.AutomationMap>} Promise
     */
    static async deploy(metadata, targetBU, retrieveDir, isRefresh) {
        const upsertResults = await this.upsert(metadata, targetBU, isRefresh);
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
        metadata.id = metadataBefore.id;
        const uri = '/automation/v1/automations/' + metadata.id;
        return super.updateREST(metadata, uri);
    }

    /**
     * Gets executed before deploying metadata
     *
     * @param {TYPE.AutomationItem} metadata metadata mapped by their keyField
     * @returns {Promise.<TYPE.AutomationItem>} Promise
     */
    static async preDeployTasks(metadata) {
        if (this.validateDeployMetadata(metadata)) {
            // folder
            this.setFolderId(metadata);

            if (metadata.type === 'scheduled' && metadata?.schedule?.startDate) {
                // Starting Source == 'Schedule'

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
                delete metadata.schedule.timezoneName;
                // the upsert API needs this to be named scheduleTypeId; the retrieve API returns it as typeId
                metadata.schedule.scheduleTypeId = metadata.schedule.typeId;
                delete metadata.schedule.typeId;

                // prep startSource
                metadata.startSource = { schedule: metadata.schedule, typeId: 1 };
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
     * Gets executed after deployment of metadata type
     *
     * @param {TYPE.AutomationMap} metadataMap metadata mapped by their keyField
     * @param {TYPE.AutomationMap} originalMetadataMap metadata to be updated (contains additioanl fields)
     * @returns {Promise.<void>} -
     */
    static async postDeployTasks(metadataMap, originalMetadataMap) {
        for (const key in metadataMap) {
            // need to put schedule on here if status is scheduled

            if (originalMetadataMap[key]?.type === 'scheduled') {
                // Starting Source == 'Schedule': Try starting the automation
                if (originalMetadataMap[key].status === 'Scheduled') {
                    let schedule = null;
                    try {
                        schedule = this._buildSchedule(originalMetadataMap[key].schedule);
                    } catch (ex) {
                        Util.logger.error(
                            `- Could not create schedule for automation ${originalMetadataMap[key].name} to start it: ${ex.message}`
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
                            await this.client.soap.schedule(
                                'Automation',
                                schedule,
                                {
                                    Interaction: {
                                        ObjectID: metadataMap[key].id,
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
                                    originalMetadataMap[key].name
                                }' deployed Active: runs every ${intervalString} starting ${
                                    schedule_StartDateTime.split('T').join(' ').split('.')[0]
                                } ${schedule_timezoneString}`
                            );
                        } catch (ex) {
                            Util.logger.error(
                                `- Could not start scheduled automation '${originalMetadataMap[key].name}': ${ex.message}`
                            );
                        }
                    }
                } else {
                    Util.logger.warn(
                        ` - scheduled automation '${originalMetadataMap[key].name}' deployed Paused`
                    );
                }
            }
            if (metadataMap[key].startSource) {
                metadataMap[key].schedule = metadataMap[key].startSource.schedule;

                delete metadataMap[key].startSource;
            }
            if (metadataMap[key].schedule) {
                metadataMap[key].schedule.typeId = metadataMap[key].schedule.scheduleTypeId;
                delete metadataMap[key].schedule.scheduleTypeId;
            }

            // re-retrieve deployed items because the API does not return any info for them except the new id (api key)
            try {
                const { metadata } = await this.retrieve(null, null, null, key);
                metadataMap[key] = Object.values(metadata)[0];
                // postRetrieveTasks will be run automatically on this via super.saveResult
            } catch (ex) {
                throw new Error(
                    `Could not get details for new ${this.definition.type} ${key} from server (${ex.message})`
                );
            }
        }
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

        if (this.definition.timeZoneMapping[scheduleObject.timezoneName]) {
            scheduleObject.timezoneId =
                this.definition.timeZoneMapping[scheduleObject.timezoneName];
        } else {
            Util.logger.error(
                `- Could not find timezone ${scheduleObject.timezoneName} in definition.timeZoneMapping`
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

        // return time as a string without trailing "Z"
        return dateServer.toISOString().slice(0, -1);
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
        if (json.type === 'scheduled') {
            const tz =
                this.definition.timeZoneDifference[
                    this.definition.timeZoneMapping[json?.schedule?.timezoneName]
                ];

            if (json.schedule?.icalRecur) {
                output += `**Schedule:**\n\n`;
                output += `* Start: ${json.schedule.startDate.split('T').join(' ')} ${tz}\n`;
                output += `* End: ${json.schedule.endDate.split('T').join(' ')} ${tz}\n`;
                output += `* Timezone:  ${json.schedule.timezoneName}\n`;

                const ical = {};
                for (const item of json.schedule.icalRecur.split(';')) {
                    const temp = item.split('=');
                    ical[temp[0]] = temp[1];
                }
                const frequency = ical.FREQ.slice(0, -2).toLowerCase();

                output += `* Recurrance: every ${ical.INTERVAL > 1 ? ical.INTERVAL : ''} ${
                    frequency === 'dai' ? 'day' : frequency
                }${ical.INTERVAL > 1 ? 's' : ''} ${ical.COUNT ? `for ${ical.COUNT} times` : ''}\n`;
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
    static async _getObjectIdForSingleRetrieve(key) {
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
        const objectId = customerKey ? await this._getObjectIdForSingleRetrieve(customerKey) : null;
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
}

// Assign definition to static attributes
Automation.definition = Definitions.automation;

export default Automation;
