export default Automation;
export type BuObject = import('../../types/mcdev.d.js').BuObject;
export type CodeExtract = import('../../types/mcdev.d.js').CodeExtract;
export type CodeExtractItem = import('../../types/mcdev.d.js').CodeExtractItem;
export type MetadataTypeItem = import('../../types/mcdev.d.js').MetadataTypeItem;
export type MetadataTypeItemDiff = import('../../types/mcdev.d.js').MetadataTypeItemDiff;
export type MetadataTypeItemObj = import('../../types/mcdev.d.js').MetadataTypeItemObj;
export type MetadataTypeMap = import('../../types/mcdev.d.js').MetadataTypeMap;
export type MetadataTypeMapObj = import('../../types/mcdev.d.js').MetadataTypeMapObj;
export type SDKError = import('../../types/mcdev.d.js').SDKError;
export type SoapRequestParams = import('../../types/mcdev.d.js').SoapRequestParams;
export type TemplateMap = import('../../types/mcdev.d.js').TemplateMap;
export type AutomationItem = import('../../types/mcdev.d.js').AutomationItem;
export type AutomationItemObj = import('../../types/mcdev.d.js').AutomationItemObj;
export type AutomationMap = import('../../types/mcdev.d.js').AutomationMap;
export type AutomationMapObj = import('../../types/mcdev.d.js').AutomationMapObj;
export type AutomationSchedule = import('../../types/mcdev.d.js').AutomationSchedule;
export type AutomationScheduleSoap = import('../../types/mcdev.d.js').AutomationScheduleSoap;
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
declare class Automation extends MetadataType {
    static notificationUpdates: {};
    static createdKeyMap: any;
    static _skipNotificationRetrieve: boolean;
    /** @type {AutomationMap} */
    static _cachedMetadataMap: AutomationMap;
    /**
     * Retrieves Metadata of Automation
     *
     * @param {string} [retrieveDir] Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<AutomationMapObj>} Promise of metadata
     */
    static retrieve(retrieveDir?: string, _?: void | string[], __?: void | string[], key?: string): Promise<AutomationMapObj>;
    /**
     * helper for {@link Automation.retrieve} to get Automation Notifications
     *
     * @param {MetadataTypeMap} metadataMap keyField => metadata map
     * @returns {Promise.<object>} Promise of automation legacy api response
     */
    static "__#3@#getAutomationNotificationsREST"(metadataMap: MetadataTypeMap): Promise<object>;
    /**
     * Retrieves Metadata of Automation
     *
     * @returns {Promise.<AutomationMapObj>} Promise of metadata
     */
    static retrieveChangelog(): Promise<AutomationMapObj>;
    /**
     * Retrieves automation metadata for caching
     *
     * @returns {Promise.<AutomationMapObj>} Promise of metadata
     */
    static retrieveForCache(): Promise<AutomationMapObj>;
    /**
     * Retrieve a specific Automation Definition by Name
     *
     * @param {string} templateDir Directory where retrieved metadata directory will be saved
     * @param {string} name name of the metadata file
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {Promise.<AutomationItemObj>} Promise of metadata
     */
    static retrieveAsTemplate(templateDir: string, name: string, templateVariables: TemplateMap): Promise<AutomationItemObj>;
    /**
     * helper for {@link Automation.postRetrieveTasks} and {@link Automation.execute}
     *
     * @param {AutomationItem} metadata a single automation
     * @returns {boolean} true if the automation schedule is valid
     */
    static "__#3@#isValidSchedule"(metadata: AutomationItem): boolean;
    /**
     * manages post retrieve steps
     *
     * @param {AutomationItem} metadata a single automation
     * @returns {AutomationItem | void} parsed item
     */
    static postRetrieveTasks(metadata: AutomationItem): AutomationItem | void;
    /**
     * helper for {@link Automation.execute}
     *
     * @param {AutomationMap} metadataMap map of metadata
     * @param {string} key key of the metadata
     * @returns {Promise.<{key:string, response:object}>} metadata key and API response
     */
    static "__#3@#executeItem"(metadataMap: AutomationMap, key: string): Promise<{
        key: string;
        response: object;
    }>;
    /**
     * helper for {@link Automation.execute}
     *
     * @param {AutomationItem} metadataEntry metadata object
     * @returns {Promise.<{key:string, response:object}>} metadata key and API response
     */
    static "__#3@#runOnce"(metadataEntry: AutomationItem): Promise<{
        key: string;
        response: object;
    }>;
    /**
     * helper for {@link Automation.pause}
     *
     * @param {AutomationItem} metadata automation metadata
     * @returns {Promise.<{key:string, response:object}>} metadata key and API response
     */
    static "__#3@#pauseItem"(metadata: AutomationItem): Promise<{
        key: string;
        response: object;
    }>;
    /**
     * Deploys automation - the saved file is the original one due to large differences required for deployment
     *
     * @param {AutomationMap} metadata metadata mapped by their keyField
     * @param {string} targetBU name/shorthand of target businessUnit for mapping
     * @param {string} retrieveDir directory where metadata after deploy should be saved
     * @returns {Promise.<AutomationMap>} Promise
     */
    static deploy(metadata: AutomationMap, targetBU: string, retrieveDir: string): Promise<AutomationMap>;
    /**
     * Creates a single automation
     *
     * @param {AutomationItem} metadata single metadata entry
     * @returns {Promise} Promise
     */
    static create(metadata: AutomationItem): Promise<any>;
    /**
     * Updates a single automation
     *
     * @param {AutomationItem} metadata single metadata entry
     * @param {AutomationItem} metadataBefore metadata mapped by their keyField
     * @returns {Promise} Promise
     */
    static update(metadata: AutomationItem, metadataBefore: AutomationItem): Promise<any>;
    /**
     * helper for {@link Automation.preDeployTasks} and {@link Automation.execute}
     *
     * @param {AutomationItem} metadata metadata mapped by their keyField
     */
    static "__#3@#preDeploySchedule"(metadata: AutomationItem): void;
    /**
     * Gets executed before deploying metadata
     *
     * @param {AutomationItem} metadata metadata mapped by their keyField
     * @returns {Promise.<AutomationItem>} Promise
     */
    static preDeployTasks(metadata: AutomationItem): Promise<AutomationItem>;
    /**
     * Validates the automation to be sure it can be deployed.
     * Whitelisted Activites are deployed but require configuration
     *
     * @param {AutomationItem} metadata single automation record
     * @returns {boolean} result if automation can be deployed based on steps
     */
    static validateDeployMetadata(metadata: AutomationItem): boolean;
    /**
     * helper for {@link MetadataType.updateREST} and {@link MetadataType.updateSOAP} that removes old files after the key was changed
     *
     * @param {MetadataTypeItem} metadataEntry a single metadata Entry
     * @returns {Promise.<void>} -
     */
    static _postChangeKeyTasks(metadataEntry: MetadataTypeItem): Promise<void>;
    /**
     * Gets executed after deployment of metadata type
     *
     * @param {AutomationMap} metadataMap metadata mapped by their keyField
     * @param {AutomationMap} originalMetadataMap metadata to be updated (contains additioanl fields)
     * @returns {Promise.<void>} -
     */
    static postDeployTasks(metadataMap: AutomationMap, originalMetadataMap: AutomationMap): Promise<void>;
    /**
     * helper for {@link Automation.postDeployTasks}
     *
     * @param {AutomationMap} metadataMap metadata mapped by their keyField
     * @param {string} key current customer key
     * @returns {Promise.<void>} -
     */
    static "__#3@#updateNotificationInfoREST"(metadataMap: AutomationMap, key: string): Promise<void>;
    /**
     * helper for {@link Automation.postDeployTasks}
     *
     * @param {AutomationMap} metadataMap metadata mapped by their keyField
     * @param {AutomationMap} originalMetadataMap metadata to be updated (contains additioanl fields)
     * @param {string} key current customer key
     * @param {string} [oldKey] old customer key before fixKey / changeKeyValue / changeKeyField
     * @returns {Promise.<{key:string, response:object}>} metadata key and API response
     */
    static "__#3@#scheduleAutomation"(metadataMap: AutomationMap, originalMetadataMap: AutomationMap, key: string, oldKey?: string): Promise<{
        key: string;
        response: object;
    }>;
    /**
     * Builds a schedule object to be used for scheduling an automation
     * based on combination of ical string and start/end dates.
     *
     * @param {AutomationSchedule} scheduleObject child of automation metadata used for scheduling
     * @returns {AutomationScheduleSoap} Schedulable object for soap API (currently not rest supported)
     */
    static _buildSchedule(scheduleObject: AutomationSchedule): AutomationScheduleSoap;
    /**
     * used to convert dates to the system timezone required for startDate
     *
     * @param {number} offsetServer stack4: US Mountain time (UTC-7); other stacks: US Central (UTC-6)
     * @param {string|Date} dateInput date in ISO format (2021-12-05T20:00:00.983)
     * @param {string} [offsetInput] timzone difference (+02:00)
     * @returns {string} date in server
     */
    static _calcTime(offsetServer: number, dateInput: string | Date, offsetInput?: string): string;
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
    private static _generateDocMd;
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
    private static _writeDoc;
    /**
     * Parses metadata into a readable Markdown/HTML format then saves it
     *
     * @param {AutomationMap} [metadata] a list of dataExtension definitions
     * @returns {Promise.<void>} -
     */
    static document(metadata?: AutomationMap): Promise<void>;
    /**
     * helper to allow us to select single metadata entries via REST
     *
     * @param {string} key customer key
     * @returns {Promise.<string>} objectId or enpty string
     */
    static "__#3@#getObjectIdForSingleRetrieve"(key: string): Promise<string>;
    /**
     * clean up after deleting a metadata item
     *
     * @param {string} customerKey Identifier of metadata item
     * @returns {Promise.<void>} -
     */
    static postDeleteTasks(customerKey: string): Promise<void>;
}
declare namespace Automation {
    let retrieveDir: string;
    let definition: {
        activityTypeMapping: {
            dataExtract: number;
            dataFactoryUtility: number;
            emailSend: number;
            fileTransfer: number;
            filter: number;
            fireEvent: number;
            importFile: number;
            journeyEntry: number;
            journeyEntryOld: number;
            query: number;
            script: number;
            verification: number;
            wait: number;
            push: number;
            sms: number;
            reportDefinition: number;
            refreshMobileFilteredList: number;
            refreshGroup: number;
            interactions: number;
            interactionStudioData: number;
            importMobileContact: number;
        };
        bodyIteratorField: string;
        dependencies: string[];
        folderType: string;
        hasExtended: boolean;
        filter: {
            description: string[];
        };
        idField: string;
        keyIsFixed: boolean;
        keyField: string;
        nameField: string;
        folderIdField: string;
        createdDateField: string; /**
         * @typedef {import('../../types/mcdev.d.js').AutomationItem} AutomationItem
         * @typedef {import('../../types/mcdev.d.js').AutomationItemObj} AutomationItemObj
         * @typedef {import('../../types/mcdev.d.js').AutomationMap} AutomationMap
         * @typedef {import('../../types/mcdev.d.js').AutomationMapObj} AutomationMapObj
         * @typedef {import('../../types/mcdev.d.js').AutomationSchedule} AutomationSchedule
         * @typedef {import('../../types/mcdev.d.js').AutomationScheduleSoap} AutomationScheduleSoap
         */
        createdNameField: string;
        lastmodDateField: string;
        lastmodNameField: string;
        restPagination: boolean;
        maxKeyLength: number;
        scheduleTypeMapping: {
            MINUTELY: number;
            HOURLY: number;
            DAILY: number;
            WEEKLY: number;
            MONTHLY: number;
        };
        statusMapping: {
            AwaitingTrigger: number;
            Building: number;
            /**
             * Automation MetadataType
             *
             * @augments MetadataType
             */
            BuildingError: number;
            Error: number;
            InactiveTrigger: number;
            PausedSchedule: number;
            Ready: number;
            Running: number;
            Scheduled: number;
            Stopped: number;
        };
        timeZoneMapping: {
            'Afghanistan Standard Time': number;
            'Alaskan Standard Time': number;
            'Arab Standard Time': number;
            'Arabian Standard Time': number;
            'Arabic Standard Time': number;
            'Argentina Standard Time': number;
            'Atlantic Standard Time': number;
            'AUS Central Standard Time': number;
            'AUS Eastern Standard Time': number;
            'Azerbaijan Standard Time': number;
            'Azores Standard Time': number;
            'Canada Central Standard Time': number;
            'Cape Verde Standard Time': number;
            'Caucasus Standard Time': number;
            'Cen. Australia Standard Time': number; /** @type {SoapRequestParams} */
            'Central America Standard Time': number;
            'Central Asia Standard Time': number;
            'Central Brazilian Standard Time': number;
            'Central Europe Standard Time': number;
            'Central European Standard Time': number;
            'Central Pacific Standard Time': number;
            'Central Standard Time': number;
            'Central Standard Time (Mexico)': number;
            'Central Standard Time (no DST)': number;
            'China Standard Time': number;
            'Dateline Standard Time': number;
            'E. Africa Standard Time': number;
            'E. Australia Standard Time': number;
            'E. Europe Standard Time': number;
            'E. South America Standard Time': number;
            'Eastern Standard Time': number;
            'Egypt Standard Time': number;
            'Ekaterinburg Standard Time': number;
            'Fiji Standard Time': number;
            'FLE Standard Time': number;
            'Georgian Standard Time': number;
            'GMT Standard Time': number;
            'Greenland Standard Time': number;
            'Greenwich Standard Time': number;
            'GTB Standard Time': number;
            'Hawaiian Standard Time': number;
            'India Standard Time': number;
            'Iran Standard Time': number;
            'Israel Standard Time': number;
            'Jordan Standard Time': number;
            'Korea Standard Time': number;
            'Mauritius Standard Time': number;
            'Mid-Atlantic Standard Time': number;
            'Middle East Standard Time': number;
            'Montevideo Standard Time': number;
            'Morocco Standard Time': number;
            'Mountain Standard Time': number;
            'Mountain Standard Time (Mexico)': number;
            'Myanmar Standard Time': number;
            'N. Central Asia Standard Time': number;
            'Namibia Standard Time': number;
            'Nepal Standard Time': number;
            'New Zealand Standard Time': number;
            'Newfoundland Standard Time': number;
            'North Asia East Standard Time': number;
            'North Asia Standard Time': number;
            'Pacific SA Standard Time': number;
            'Pacific Standard Time': number;
            'Pacific Standard Time (Mexico)': number;
            'Pakistan Standard Time': number;
            'Romance Standard Time': number;
            'Russian Standard Time': number;
            'SA Pacific Standard Time': number;
            'SA Western Standard Time': number;
            'Samoa Standard Time': number;
            'SE Asia Standard Time': number;
            'Singapore Standard Time': number;
            'South Africa Standard Time': number;
            'Sri Lanka Standard Time': number;
            'Taipei Standard Time': number;
            'Tasmania Standard Time': number;
            'Tokyo Standard Time': number;
            'Tonga Standard Time': number;
            'US Eastern Standard Time': number;
            'US Mountain Standard Time': number;
            'Venezuela Standard Time': number;
            'Vladivostok Standard Time': number;
            'W. Australia Standard Time': number;
            'W. Central Africa Standard Time': number;
            'W. Europe Standard Time': number;
            'West Asia Standard Time': number;
            'West Pacific Standard Time': number;
            'Yakutsk Standard Time': number;
        };
        timeZoneDifference: {
            1: string;
            2: string;
            3: string;
            4: string;
            5: string;
            6: string;
            7: string;
            8: string;
            9: string;
            10: string;
            11: string;
            12: string;
            13: string;
            14: string;
            15: string;
            16: string;
            17: string;
            18: string;
            19: string;
            20: string;
            21: string;
            22: string;
            23: string;
            24: string;
            25: string;
            26: string;
            27: string;
            28: string;
            29: string;
            30: string;
            31: string;
            32: string;
            33: string;
            34: string;
            35: string;
            36: string;
            37: string;
            38: string;
            39: string;
            40: string;
            41: string;
            42: string;
            43: string;
            44: string;
            45: string;
            46: string;
            47: string;
            48: string;
            49: string;
            50: string;
            51: string;
            52: string;
            53: string;
            54: string;
            55: string;
            56: string;
            57: string;
            58: string;
            59: string;
            60: string;
            61: string;
            62: string;
            63: string;
            64: string;
            65: string;
            66: string;
            67: string;
            68: string;
            69: string;
            70: string;
            71: string;
            72: string;
            73: string;
            74: string;
            75: string;
            76: string;
            77: string;
            78: string;
            79: string;
            80: string;
            81: string;
            82: string;
            83: string;
            84: string;
            85: string;
            86: string;
            87: string;
            88: string;
            89: string;
            90: string;
            91: string;
            92: string;
        };
        type: string;
        typeDescription: string;
        typeRetrieveByDefault: boolean;
        typeName: string;
        manualDeployTypes: string[];
        fields: {
            categoryId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            description: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'fileTrigger.fileNamePatternTypeId': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'fileTrigger.fileNamingPattern': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'fileTrigger.folderLocationText': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'fileTrigger.isPublished': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'fileTrigger.queueFiles': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'fileTrigger.triggerActive': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            id: {
                isCreateable: boolean;
                isUpdateable: any;
                retrieving: boolean;
                template: boolean;
            };
            key: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            lastRunInstanceId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            lastRunTime: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            legacyId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            lastSavedDate: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            lastSavedByName: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            createdDate: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            createdByName: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            updateInProgress: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            name: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            notifications: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'notifications[].email': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'notifications[].message': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                /** @type {AutomationMap} */
                template: boolean;
            };
            'notifications[].channelType': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'notifications[].type': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'notifications[].notificationType': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            startSource: {
                skipValidation: boolean;
            };
            'schedule.endDate': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'schedule.icalRecur': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'schedule.id': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'schedule.occurrences': {
                isCreateable: boolean;
                /**
                 * Retrieve a specific Automation Definition by Name
                 *
                 * @param {string} templateDir Directory where retrieved metadata directory will be saved
                 * @param {string} name name of the metadata file
                 * @param {TemplateMap} templateVariables variables to be replaced in the metadata
                 * @returns {Promise.<AutomationItemObj>} Promise of metadata
                 */
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'schedule.pattern': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'schedule.rangeTypeId': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'schedule.scheduledTime': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'schedule.scheduleStatus': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'schedule.startDate': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'schedule.statusId': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'schedule.timezoneId': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'schedule.timezoneName': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'schedule.typeId': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            status: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            statusId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            steps: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'steps[].activities': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'steps[].activities[].activityObjectId': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'steps[].activities[].displayOrder': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'steps[].activities[].id': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'steps[].activities[].name': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'steps[].activities[].objectTypeId': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'steps[].activities[].targetDataExtensions': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'steps[].activities[].description': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'steps[].activities[].serializedObject': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'steps[].activities[].r__type': {
                skipValidation: boolean;
            };
            'steps[].activities[].r__key': {
                skipValidation: boolean;
            };
            'steps[].description': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'steps[].annotation': {
                /**
                 * manages post retrieve steps
                 *
                 * @param {AutomationItem} metadata a single automation
                 * @returns {AutomationItem | void} parsed item
                 */
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'steps[].id': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'steps[].name': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'steps[].step': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'steps[].stepNumber': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            type: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            typeId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            r__folder_Path: {
                skipValidation: boolean;
            };
        };
    };
}
import MetadataType from './MetadataType.js';
//# sourceMappingURL=Automation.d.ts.map