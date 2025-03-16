declare namespace _default {
    export namespace activityTypeMapping {
        let dataExtract: number;
        let dataFactoryUtility: number;
        let emailSend: number;
        let fileTransfer: number;
        let filter: number;
        let fireEvent: number;
        let importFile: number;
        let journeyEntry: number;
        let journeyEntryOld: number;
        let query: number;
        let script: number;
        let verification: number;
        let wait: number;
        let push: number;
        let sms: number;
        let reportDefinition: number;
        let refreshMobileFilteredList: number;
        let refreshGroup: number;
        let interactions: number;
        let interactionStudioData: number;
        let importMobileContact: number;
    }
    export let bodyIteratorField: string;
    export let dependencies: string[];
    export namespace dependencyGraph {
        let dataExtract_1: string[];
        export { dataExtract_1 as dataExtract };
        let emailSend_1: string[];
        export { emailSend_1 as emailSend };
        let fileTransfer_1: string[];
        export { fileTransfer_1 as fileTransfer };
        let importFile_1: string[];
        export { importFile_1 as importFile };
        let query_1: string[];
        export { query_1 as query };
        let script_1: string[];
        export { script_1 as script };
        let verification_1: string[];
        export { verification_1 as verification };
    }
    export let folderType: string;
    export let hasExtended: boolean;
    export namespace filter_1 {
        let description: string[];
    }
    export { filter_1 as filter };
    export let idField: string;
    export let keyIsFixed: boolean;
    export let keyField: string;
    export let nameField: string;
    export let folderIdField: string;
    export let createdDateField: string;
    export let createdNameField: string;
    export let lastmodDateField: string;
    export let lastmodNameField: string;
    export let restPagination: boolean;
    export let maxKeyLength: number;
    export namespace scheduleTypeMapping {
        let MINUTELY: number;
        let HOURLY: number;
        let DAILY: number;
        let WEEKLY: number;
        let MONTHLY: number;
    }
    export namespace statusMapping {
        let AwaitingTrigger: number;
        let Building: number;
        let BuildingError: number;
        let Error: number;
        let InactiveTrigger: number;
        let PausedSchedule: number;
        let Ready: number;
        let Running: number;
        let Scheduled: number;
        let Stopped: number;
    }
    export let fileNameOperatorMapping: {
        Equals: number;
        Contains: number;
        'Begins with': number;
        'Ends with': number;
    };
    export let timeZoneMapping: {
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
        'Cen. Australia Standard Time': number;
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
    export let timeZoneDifference: {
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
    export let type: string;
    export let typeDescription: string;
    export let typeRetrieveByDefault: boolean;
    export let typeCdpByDefault: boolean;
    export let typeName: string;
    export let customDeployTypes: string[];
    export let manualDeployTypes: any[];
    export let fields: {
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
        createdByName: {
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
        createdName: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        modifiedDate: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        modifiedName: {
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
        'steps[].activities[].timeZone': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'steps[].description': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'steps[].annotation': {
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
}
export default _default;
//# sourceMappingURL=Automation.definition.d.ts.map