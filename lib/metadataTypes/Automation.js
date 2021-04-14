'use strict';

const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const File = require('../util/file');
const Definitions = require('../MetadataTypeDefinitions');

/**
 * @typedef {Object} AutomationActivity
 * @property {string} name name (not key) of activity
 * @property {string} [objectTypeId] Id of assoicated activity type; see this.definition.activityTypeMapping
 * @property {string} [activityObjectId] Object Id of assoicated metadata item
 * @property {number} displayOrder order within step; starts with 1 or higher number
 * @property {string} r__type see this.definition.activityTypeMapping
 *
 * @typedef {Object} AutomationStep
 * @property {string} name description
 * @property {string} [annotation] equals AutomationStep.name
 * @property {number} step step iterator
 * @property {number} [stepNumber] step iterator, automatically set during deployment
 * @property {AutomationActivity[]} activities -
 *
 * @typedef {Object} AutomationSchedule REST format
 * @property {number} typeId ?
 * @property {string} startDate example: '2021-05-07T09:00:00'
 * @property {string} endDate example: '2021-05-07T09:00:00'
 * @property {string} icalRecur example: 'FREQ=DAILY;UNTIL=20790606T160000;INTERVAL=1'
 * @property {string} timezoneName example: 'W. Europe Standard Time'; see this.definition.timeZoneMapping
 * @property {number} [timezoneId] see this.definition.timeZoneMapping
 *
 * @typedef {Object} AutomationScheduleSoap SOAP format
 * @property {Object} Recurrence -
 * @property {Object} Recurrence.$ {'xsi:type': keyStem + 'lyRecurrence'}
 * @property {'ByYear'} [Recurrence.YearlyRecurrencePatternType] * currently not supported by tool *
 * @property {'ByMonth'} [Recurrence.MonthlyRecurrencePatternType] * currently not supported by tool *
 * @property {'ByWeek'} [Recurrence.WeeklyRecurrencePatternType] * currently not supported by tool *
 * @property {'ByDay'} [Recurrence.DailyRecurrencePatternType] -
 * @property {'Interval'} [Recurrence.MinutelyRecurrencePatternType] -
 * @property {'Interval'} [Recurrence.HourlyRecurrencePatternType] -
 * @property {number} [Recurrence.YearInterval] 1..n * currently not supported by tool *
 * @property {number} [Recurrence.MonthInterval] 1..n * currently not supported by tool *
 * @property {number} [Recurrence.WeekInterval] 1..n * currently not supported by tool *
 * @property {number} [Recurrence.DayInterval] 1..n
 * @property {number} [Recurrence.HourInterval] 1..n
 * @property {number} [Recurrence.MinuteInterval] 1..n
 * @property {number} _interval internal variable for CLI output only
 * @property {Object} TimeZone -
 * @property {number} TimeZone.ID AutomationSchedule.timezoneId
 * @property {string} _timezoneString internal variable for CLI output only
 * @property {string} StartDateTime AutomationSchedule.startDate
 * @property {string} EndDateTime AutomationSchedule.endDate
 * @property {string} _StartDateTime AutomationSchedule.startDate; internal variable for CLI output only
 * @property {'EndOn'|'EndAfter'} RecurrenceRangeType set to 'EndOn' if AutomationSchedule.icalRecur contains 'UNTIL'; otherwise to 'EndAfter'
 * @property {number} Occurrences only exists if RecurrenceRangeType=='EndAfter'
 *
 * @typedef {Object} AutomationItem
 * @property {string} [id] Object Id
 * @property {string} key key
 * @property {string} name name
 * @property {string} description -
 * @property {'scheduled'|'triggered'} type Starting Source = Schedule / File Drop
 * @property {'Scheduled'|'Running'} status -
 * @property {AutomationSchedule} [schedule] only existing if type=scheduled
 * @property {Object} [fileTrigger] only existing if type=triggered
 * @property {string} fileTrigger.fileNamingPattern -
 * @property {string} fileTrigger.fileNamePatternTypeId -
 * @property {string} fileTrigger.folderLocationText -
 * @property {string} fileTrigger.queueFiles -
 * @property {Object} [startSource] -
 * @property {AutomationSchedule} [startSource.schedule] rewritten to AutomationItem.schedule
 * @property {Object} [startSource.fileDrop] rewritten to AutomationItem.fileTrigger
 * @property {string} startSource.fileDrop.fileNamingPattern -
 * @property {string} startSource.fileDrop.fileNamePatternTypeId -
 * @property {string} startSource.fileDrop.folderLocation -
 * @property {string} startSource.fileDrop.queueFiles -
 * @property {number} startSource.typeId -
 * @property {AutomationStep[]} steps -
 * @property {string} r__folder_Path folder path
 * @property {string} [categoryId] holds folder ID, replaced with r__folder_Path during retrieve
 *
 * @typedef {Object.<string, AutomationItem>} AutomationMap
 */

/**
 * Automation MetadataType
 * @augments MetadataType
 */
class Automation extends MetadataType {
    /**
     * Retrieves Metadata of Automation
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise<{metadata:AutomationMap,type:string}>} Promise of metadata
     */
    static async retrieve(retrieveDir) {
        const results = await this.client.soap.retrieveBulk('Program', ['ObjectID']);

        const details = await Promise.all(
            results.Results.map((a) =>
                this.client.rest.get('/automation/v1/automations/' + a.ObjectID)
            )
        );
        const parsed = this.parseResponseBody({ items: details });

        const savedMetadata = await this.saveResults(parsed, retrieveDir, null, null);
        Util.logger.info(
            `Downloaded: ${this.definition.type} (${Object.keys(savedMetadata).length})`
        );
        return { metadata: parsed, type: this.definition.type };
    }

    /**
     * Retrieves automation metadata for caching
     * @returns {Promise<{metadata:AutomationMap,type:string}>} Promise of metadata
     */
    static async retrieveForCache() {
        const results = await this.client.soap.retrieveBulk('Program', [
            'ObjectID',
            'CustomerKey',
            'Name',
        ]);
        const resultsConverted = {};
        for (const m of results.Results) {
            resultsConverted[m.CustomerKey] = {
                id: m.ObjectID,
                key: m.CustomerKey,
                name: m.Name,
            };
        }
        return { metadata: resultsConverted, type: this.definition.type };
    }

    /**
     * Retrieve a specific Automation Definition by Name
     * @param {string} templateDir Directory where retrieved metadata directory will be saved
     * @param {string} name name of the metadata file
     * @param {Util.TemplateMap} variables variables to be replaced in the metadata
     * @returns {Promise<{metadata:AutomationMap,type:string}>} Promise of metadata
     */
    static async retrieveAsTemplate(templateDir, name, variables) {
        const results = await this.client.soap.retrieve('Program', ['ObjectID', 'Name'], {
            filter: {
                leftOperand: 'Name',
                operator: 'equals',
                rightOperand: name,
            },
        });
        if (results && Array.isArray(results.Results)) {
            // eq-operator returns a similar, not exact match and hence might return more than 1 entry
            const [metadata] = results.filter((item) => item.Name === name);
            if (!metadata) {
                Util.logger.error(`No ${this.definition.typeName} found with name "${name}"`);
                return;
            }
            const details = await this.client.rest.get(
                '/automation/v1/automations/' + metadata.ObjectID
            );
            let val = null;
            // if parsing fails, we should just save what we get
            try {
                const parsedDetails = this.parseMetadata(details);
                if (parsedDetails !== null) {
                    val = JSON.parse(
                        Util.replaceByObject(JSON.stringify(parsedDetails), variables)
                    );
                }
            } catch (ex) {
                val = JSON.parse(JSON.stringify(details));
            }
            if (val === null) {
                throw new Error(
                    `Automations '${name}' was skipped and hence cannot be used for templating.`
                );
            }
            // remove all fields not listed in Definition for templating
            this.keepTemplateFields(val);
            File.writeJSONToFile(
                [templateDir, this.definition.type].join('/'),
                val[this.definition.keyField] + '.' + this.definition.type + '-meta',
                val
            );
            Util.logger.info(
                `Automation.retrieveAsTemplate:: Written Metadata to filesystem (${name})`
            );
            return { metadata: val, type: this.definition.type };
        } else if (results) {
            throw new Error(`No Automations Found with name '${name}'`);
        } else {
            throw new Error(JSON.stringify(results));
        }
    }
    /**
     * manages post retrieve steps
     * @param {AutomationItem} metadata a single automation
     * @param {string} [_] unused
     * @param {Boolean} [isTemplating] signals that we are retrieving templates
     * @returns {AutomationItem} metadata
     */
    static postRetrieveTasks(metadata, _, isTemplating) {
        // if retrieving template, replace the name with customer key if that wasn't already the case
        if (isTemplating) {
            const warningMsg = null;
            this.overrideKeyWithName(metadata, warningMsg);
        }
        return this.parseMetadata(metadata);
    }

    /**
     * Deploys automation - the saved file is the original one due to large differences required for deployment
     * @param {AutomationMap} metadata metadata mapped by their keyField
     * @param {string} targetBU name/shorthand of target businessUnit for mapping
     * @param {string} retrieveDir directory where metadata after deploy should be saved
     * @returns {Promise<AutomationMap>} Promise
     */
    static async deploy(metadata, targetBU, retrieveDir) {
        const orignalMetadata = JSON.parse(JSON.stringify(metadata));
        const upsertResults = await this.upsert(metadata, targetBU);
        await this.postDeployTasks(upsertResults, orignalMetadata);
        await this.saveResults(upsertResults, retrieveDir, null);
        return upsertResults;
    }

    /**
     * Creates a single automation
     * @param {AutomationItem} metadata single metadata entry
     * @returns {Promise} Promise
     */
    static create(metadata) {
        const uri = '/automation/v1/automations/';
        return super.createREST(metadata, uri);
    }

    /**
     * Updates a single automation
     * @param {AutomationItem} metadata single metadata entry
     * @param {AutomationItem} metadataBefore metadata mapped by their keyField
     * @returns {Promise} Promise
     */
    static update(metadata, metadataBefore) {
        metadata.id = metadataBefore.id;
        const uri = '/automation/v1/automations/' + metadata.id;
        return super.updateREST(metadata, uri);
    }

    /**
     * Gets executed before deploying metadata
     * @param {AutomationItem} metadata metadata mapped by their keyField
     * @returns {Promise<AutomationItem>} Promise
     */
    static async preDeployTasks(metadata) {
        if (this.validateDeployMetadata(metadata)) {
            try {
                metadata.categoryId = Util.getFromCache(
                    this.cache,
                    'folder',
                    metadata.r__folder_Path,
                    'Path',
                    'ID'
                );
                if (metadata.r__folder_Path !== 'my automations') {
                    Util.logger.warn(
                        `Automation '${
                            metadata[this.definition.nameField]
                        }' is located in subfolder ${
                            metadata.r__folder_Path
                        }. Please note that creating automation folders is not supported via API and hence you will have to create it manually in the GUI if you choose to deploy this automation.`
                    );
                }
                delete metadata.r__folder_Path;
            } catch (ex) {
                throw new Error(
                    `Folder '${metadata.r__folder_Path}' was not found on the server. Please create this manually in the GUI. Automation-folders cannot be deployed automatically.`
                );
            }
            if (metadata.type === 'scheduled' && metadata.schedule && metadata.schedule.startDate) {
                // Starting Source == 'Schedule'

                delete metadata.schedule.rangeTypeId;
                delete metadata.schedule.pattern;
                delete metadata.schedule.scheduledTime;
                delete metadata.schedule.scheduledStatus;
                if (this.definition.timeZoneMapping[metadata.schedule.timezoneName]) {
                    metadata.schedule.timezoneId = this.definition.timeZoneMapping[
                        metadata.schedule.timezoneName
                    ];
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
            for (const step of metadata.steps) {
                for (const activity of step.activities) {
                    if (activity.name && this.definition.dependencies.includes(activity.r__type)) {
                        // automations can have empty placeholder for activities with only their type defined
                        activity.activityObjectId = Util.getFromCache(
                            this.cache,
                            activity.r__type,
                            activity.name,
                            Definitions[activity.r__type].nameField,
                            Definitions[activity.r__type].idField
                        );
                    }
                    activity.objectTypeId = this.definition.activityTypeMapping[activity.r__type];
                    delete activity.r__type;
                }
                step.annotation = step.name;
                step.stepNumber = i;
                delete step.name;
                delete step.step;
                i++;
            }
            return metadata;
        } else {
            return null;
        }
    }
    /**
     * Validates the automation to be sure it can be deployed.
     * Whitelisted Activites are deployed but require configuration
     * @param {AutomationItem} metadata single automation record
     * @returns {Boolean} result if automation can be deployed based on steps
     */
    static validateDeployMetadata(metadata) {
        let deployable = true;
        if (metadata.steps) {
            for (const step of metadata.steps) {
                for (const activity of step.activities) {
                    // check if manual deploy required. if so then log warning
                    if (this.definition.manualDeployTypes.includes(activity.r__type)) {
                        Util.logger.warn(
                            `Automation '${
                                metadata.name
                            }' requires additional manual configuration: '${
                                activity.name
                            }' in step ${step.stepNumber || step.step}.${activity.displayOrder}`
                        );
                    }
                    // cannot deploy because it is not supported
                    else if (!this.definition.dependencies.includes(activity.r__type)) {
                        Util.logger.error(
                            `Automation '${
                                metadata.name
                            }' cannot be deployed as the following activity is not supported: '${
                                activity.name
                            }' in step ${step.stepNumber || step.step}.${activity.displayOrder}`
                        );
                        deployable = false;
                    }
                }
            }
        }
        return deployable;
    }

    /**
     * Gets executed after deployment of metadata type
     * @param {AutomationMap} metadata metadata mapped by their keyField
     * @param {AutomationMap} originalMetadata metadata to be updated (contains additioanl fields)
     * @returns {Promise<void>} -
     */
    static async postDeployTasks(metadata, originalMetadata) {
        for (const key in metadata) {
            // need to put schedule on here if status is scheduled

            if (originalMetadata[key] && originalMetadata[key].type === 'scheduled') {
                // Starting Source == 'Schedule': Try starting the automation
                if (originalMetadata[key].status === 'Scheduled') {
                    let schedule = null;
                    try {
                        schedule = this._buildSchedule(originalMetadata[key].schedule);
                    } catch (ex) {
                        Util.logger.error(
                            `Could not create schedule for automation ${originalMetadata[key].name} to start it: ${ex.message}`
                        );
                    }
                    if (schedule !== null) {
                        try {
                            await new Promise((resolve, reject) => {
                                this.client.soap.schedule(
                                    'Automation',
                                    schedule,
                                    {
                                        Interaction: {
                                            ObjectID: metadata[key].id,
                                        },
                                    },
                                    'start',
                                    null,
                                    (error, response) => {
                                        if (
                                            error ||
                                            (response.body.Results &&
                                                response.body.Results[0] &&
                                                response.body.Results[0].StatusCode &&
                                                response.body.Results[0].StatusCode === 'Error')
                                        ) {
                                            reject(error || response.body.Results[0].StatusMessage);
                                        } else {
                                            resolve(response.body.Results);
                                        }
                                    }
                                );
                            });
                            const intervalString =
                                (schedule._interval > 1 ? `${schedule._interval} ` : '') +
                                (schedule.RecurrenceType === 'Daily'
                                    ? 'Day'
                                    : schedule.RecurrenceType.slice(0, -2) +
                                      (schedule._interval > 1 ? 's' : ''));
                            Util.logger.warn(
                                `Automation '${
                                    originalMetadata[key].name
                                }' deployed Active: runs every ${intervalString} starting ${
                                    schedule._StartDateTime.split('T').join(' ').split('.')[0]
                                } ${schedule._timezoneString}`
                            );
                        } catch (ex) {
                            Util.logger.error(
                                `Could not start automation '${originalMetadata[key].name}': ${ex.message}`
                            );
                        }
                    }
                } else {
                    Util.logger.warn(`Automation '${originalMetadata[key].name}' deployed Paused`);
                }
            }
            if (metadata[key].startSource) {
                metadata[key].schedule = metadata[key].startSource.schedule;

                delete metadata[key].startSource;
            }
            if (metadata[key].schedule) {
                metadata[key].schedule.typeId = metadata[key].schedule.scheduleTypeId;
                delete metadata[key].schedule.scheduleTypeId;
            }
        }
    }

    /**
     * parses retrieved Metadata before saving
     * @param {AutomationItem} metadata a single automation definition
     * @returns {Array} Array with one metadata object and one sql string
     */
    static parseMetadata(metadata) {
        // automations are often skipped due to lack of support.
        try {
            metadata.r__folder_Path = Util.getFromCache(
                this.cache,
                'folder',
                metadata.categoryId,
                'ID',
                'Path'
            );
            delete metadata.categoryId;
            if (metadata.r__folder_Path !== 'my automations') {
                Util.logger.verbose(
                    `Automation '${metadata[this.definition.nameField]}' is located in subfolder ${
                        metadata.r__folder_Path
                    }. Please note that creating automation folders is not supported via API and hence you will have to create it manually in the GUI if you choose to deploy this automation.`
                );
            }
        } catch (ex) {
            // * don't exit on missing folder for automation
            Util.logger.warn(
                `${this.definition.typeName} '${metadata[this.definition.nameField]}': ${
                    ex.message
                }`
            );
        }
        try {
            if (metadata.type === 'scheduled' && metadata.schedule && metadata.schedule.startDate) {
                // Starting Source == 'Schedule'

                try {
                    if (this.definition.timeZoneMapping[metadata.schedule.timezoneName]) {
                        // if we found the id in our list, remove the redundant data
                        delete metadata.schedule.timezoneId;
                    }
                } catch (ex) {
                    Util.logger.debug(
                        `Schedule name '${metadata.schedule.timezoneName}' not found in definition.timeZoneMapping`
                    );
                }
                try {
                    // type 'Running' is temporary status only, overwrite with Scheduled for storage.
                    if (metadata.type === 'scheduled' && metadata.status === 'Running') {
                        metadata.status === 'Scheduled';
                    }
                } catch (ex) {
                    Util.metadataLogger(
                        'error',
                        this.definition.type,
                        'parseMetadata',
                        `${metadata.name} does not have a valid schedule setting. `
                    );
                    return null;
                }
            } else if (metadata.type === 'triggered' && metadata.fileTrigger) {
                // Starting Source == 'File Drop'
                // Do nothing for now
            }
            if (metadata.steps) {
                for (const step of metadata.steps) {
                    for (const activity of step.activities) {
                        try {
                            // get metadata type of activity
                            activity.r__type = Util.inverseGet(
                                this.definition.activityTypeMapping,
                                activity.objectTypeId
                            );
                            delete activity.objectTypeId;
                            // if no activityObjectId then either serialized activity
                            // (config in Automation ) or unconfigured so no further action to be taken
                            if (
                                activity.activityObjectId ===
                                    '00000000-0000-0000-0000-000000000000' ||
                                activity.activityObjectId == null ||
                                !this.definition.dependencies.includes(activity.r__type)
                            ) {
                                // empty if block
                            }
                            // / if managed by cache we can update references to support deployment
                            else if (
                                Definitions[activity.r__type] &&
                                Definitions[activity.r__type]['idField'] &&
                                this.cache[activity.r__type]
                            ) {
                                try {
                                    activity.activityObjectId = Util.getFromCache(
                                        this.cache,
                                        activity.r__type,
                                        activity.activityObjectId,
                                        Definitions[activity.r__type].idField,
                                        Definitions[activity.r__type].nameField
                                    );
                                } catch (e) {
                                    // getFromCache throws error where the dependent metadata is not found
                                    Util.logger.error(
                                        `Missing ${activity.r__type} activity '${activity.name}'` +
                                            ` in step ${step.stepNumber || step.step}.${
                                                activity.displayOrder
                                            }` +
                                            ` of Automation '${metadata.name}' (${e.message})`
                                    );
                                    return null;
                                }
                            } else {
                                Util.logger.error(
                                    `Missing ${activity.r__type} activity '${activity.name}'` +
                                        ` in step ${step.stepNumber || step.step}.${
                                            activity.displayOrder
                                        }` +
                                        ` of Automation '${metadata.name}' (Not Found in Cache)`
                                );
                                return null;
                            }
                        } catch (ex) {
                            Util.logger.warn(
                                `Excluding automation '${metadata.name}' from retrieve (ObjectType ${activity.objectTypeId} is unknown)`
                            );
                            return null;
                        }
                    }
                }
            }
            return JSON.parse(JSON.stringify(metadata));
        } catch (ex) {
            Util.logger.warn(
                `${this.definition.typeName} '${metadata[this.definition.nameField]}': ${
                    ex.message
                }`
            );
            return null;
        }
    }

    /**
     * Builds a schedule object to be used for scheduling an automation
     * based on combination of ical string and start/end dates.
     * @param {AutomationSchedule} scheduleObject child of automation metadata used for scheduling
     * @returns {AutomationScheduleSoap} Schedulable object for soap API (currently not rest supported)
     */
    static _buildSchedule(scheduleObject) {
        /**
         * @type {AutomationScheduleSoap}
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
        schedule.Recurrence['$'] = {
            'xsi:type': keyStem + 'lyRecurrence',
        };
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
            scheduleObject.timezoneId = this.definition.timeZoneMapping[
                scheduleObject.timezoneName
            ];
        } else {
            Util.logger.error(
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

            if (keyStem === 'Dai') {
                // keep time from template and start today if possible
                if (scheduledDate.getHours() <= futureDate.getHours()) {
                    // hour on template has already passed today, start tomorrow
                    futureDate.setDate(futureDate.getDate() + 1);
                }
                futureDate.setHours(scheduledDate.getHours());
                futureDate.setMinutes(scheduledDate.getMinutes());
            } else if (keyStem === 'Hour') {
                // keep minute and start next possible hour
                if (scheduledDate.getMinutes() <= futureDate.getMinutes()) {
                    futureDate.setHours(futureDate.getHours() + 1);
                }
                futureDate.setMinutes(scheduledDate.getMinutes());
            } else if (keyStem === 'Minute') {
                // schedule in next 15 minutes randomly to avoid that all automations run at exactly
                // earliest start 1 minute from now
                // the same time which would slow performance
                futureDate.setMinutes(futureDate.getMinutes() + 1 + Math.ceil(Math.random() * 15));
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
        let utc;
        if ('string' === typeof dateInput) {
            utc = new Date(dateInput + offsetInput).getTime();
        } else {
            utc = dateInput.getTime();
        }

        // create new Date object reflecting SFMC's servertime
        const dateServer = new Date(utc + 3600000 * offsetServer);

        // return time as a string without trailing "Z"
        return dateServer.toISOString().slice(0, -1);
    }
}

// Assign definition to static attributes
Automation.definition = Definitions.automation;
Automation.cache = {};
Automation.client = undefined;

module.exports = Automation;
