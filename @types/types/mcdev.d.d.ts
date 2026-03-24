declare const _default: {};
export default _default;
export type BuObject = {
    /**
     * installed package client id
     */
    clientId?: string | undefined;
    /**
     * installed package client secret
     */
    clientSecret?: string | undefined;
    /**
     * subdomain part of Authentication Base Uri
     */
    tenant?: string | undefined;
    /**
     * Enterprise ID = MID of the parent BU
     */
    eid?: number | undefined;
    /**
     * MID of the BU to work with
     */
    mid?: number | undefined;
    /**
     * name of the BU to interact with
     */
    businessUnit?: string | undefined;
    /**
     * name of the credential to interact with
     */
    credential?: string | undefined;
};
export type TemplateMap = {
    [x: string]: string;
};
export type SupportedMetadataTypes = "asset" | "asset-archive" | "asset-asset" | "asset-audio" | "asset-block" | "asset-code" | "asset-document" | "asset-image" | "asset-message" | "asset-other" | "asset-rawimage" | "asset-template" | "asset-textfile" | "asset-video" | "attributeGroup" | "attributeSet" | "automation" | "campaign" | "contentArea" | "dataExtension" | "dataExtensionField" | "dataExtensionTemplate" | "dataExtract" | "dataExtractType" | "discovery" | "deliveryProfile" | "email" | "emailSend" | "event" | "fileLocation" | "fileTransfer" | "filter" | "folder" | "importFile" | "journey" | "list" | "mobileCode" | "mobileKeyword" | "mobileMessage" | "query" | "role" | "script" | "sendClassification" | "senderProfile" | "transactionalEmail" | "transactionalPush" | "transactionalSMS" | "triggeredSend" | "user" | "verification";
/**
 * object-key=SupportedMetadataTypes, value=array of external keys
 */
export type TypeKeyCombo = {
    [x: string]: string[] | null;
};
/**
 * generic metadata item
 */
export type MetadataTypeItem = any;
/**
 * key=customer key
 */
export type MetadataTypeMap = {
    [x: string]: any;
};
/**
 * key=Supported MetadataType
 */
export type MultiMetadataTypeMap = {
    [x: string]: {
        [x: string]: any;
    };
};
/**
 * key=Supported MetadataType
 */
export type MultiMetadataTypeList = {
    [x: string]: any[];
};
export type MetadataTypeMapObj = {
    metadata: MetadataTypeMap;
    type: string;
};
export type MetadataTypeItemObj = {
    metadata: MetadataTypeItem;
    type: string;
};
/**
 * key=MID
 */
export type Cache = {
    [x: number]: {
        [x: string]: {
            [x: string]: any;
        };
    };
};
/**
 * used during update
 */
export type MetadataTypeItemDiff = {
    before: MetadataTypeItem;
    after: MetadataTypeItem;
};
export type CodeExtractItem = {
    /**
     * metadata of one item w/o code
     */
    json: MetadataTypeItem;
    /**
     * list of code snippets in this item
     */
    codeArr: CodeExtract[];
    /**
     * mostly set to null, otherwise list of subfolders
     */
    subFolder: string[];
};
export type CodeExtract = {
    /**
     * mostly set to null, otherwise subfolders path split into elements
     */
    subFolder: string[];
    /**
     * name of file w/o extension
     */
    fileName: string;
    /**
     * file extension
     */
    fileExt: string;
    /**
     * file content
     */
    content: string;
    /**
     * optional for binary files
     */
    encoding?: "base64" | undefined;
};
export type QueryItem = {
    /**
     * name
     */
    name: string;
    /**
     * key
     */
    key: string;
    /**
     * -
     */
    description: string;
    /**
     * Object ID of DE (removed before save)
     */
    targetId?: string | undefined;
    /**
     * key of target data extension
     */
    targetKey: string;
    /**
     * key of target data extension
     */
    r__dataExtension_key: string;
    /**
     * e.g. "2020-09-14T01:42:03.017"
     */
    createdDate: string;
    /**
     * e.g. "2020-09-14T01:42:03.017"
     */
    modifiedDate: string;
    /**
     * defines how the query writes into the target data extension
     */
    targetUpdateTypeName: "Overwrite" | "Update" | "Append";
    /**
     * 0|1|2, mapped to targetUpdateTypeName via this.definition.targetUpdateTypeMapping
     */
    targetUpdateTypeId?: number | undefined;
    /**
     * Description DE (removed before save)
     */
    targetDescription?: string | undefined;
    /**
     * looks like this is always set to false
     */
    isFrozen: boolean;
    /**
     * contains SQL query with line breaks converted to '\n'. The content is extracted during retrieval and written into a separate *.sql file
     */
    queryText?: string | undefined;
    /**
     * holds folder ID, replaced with r__folder_Path during retrieve
     */
    categoryId?: string | undefined;
    /**
     * folder path in which this DE is saved
     */
    r__folder_Path: string;
    /**
     * Object ID of query
     */
    queryDefinitionId?: string | undefined;
};
export type QueryMap = {
    [x: string]: QueryItem;
};
export type ScriptItem = {
    /**
     * name
     */
    name: string;
    /**
     * key
     */
    key: string;
    /**
     * -
     */
    description: string;
    /**
     * e.g. "2020-09-14T01:42:03.017"
     */
    createdDate: string;
    /**
     * e.g. "2020-09-14T01:42:03.017"
     */
    modifiedDate: string;
    /**
     * contains script with line breaks converted to '\n'. The content is extracted during retrieval and written into a separate *.ssjs file
     */
    script?: string | undefined;
    /**
     * holds folder ID, replaced with r__folder_Path during retrieve
     */
    categoryId?: string | undefined;
    /**
     * folder path in which this DE is saved
     */
    r__folder_Path: string;
};
export type ScriptMap = {
    [x: string]: ScriptItem;
};
export type AssetItem = {
    [x: string]: any;
};
export type AssetMap = {
    [x: string]: {
        [x: string]: any;
    };
};
export type AssetSubType = "archive" | "asset" | "audio" | "block" | "code" | "document" | "image" | "message" | "other" | "rawimage" | "template" | "textfile" | "video";
export type DataExtensionFieldItem = {
    /**
     * id
     */
    ObjectID?: string | undefined;
    /**
     * key in format [DEkey].[FieldName]
     */
    CustomerKey?: string | undefined;
    /**
     * -
     */
    DataExtension?: {
        /**
         * key of DE
         */
        CustomerKey: string;
    } | undefined;
    /**
     * name of field
     */
    Name: string;
    /**
     * custom attribute that is only used when trying to rename a field from Name to Name_new
     */
    Name_new?: string | undefined;
    /**
     * empty string for not set
     */
    DefaultValue: string;
    /**
     * -
     */
    IsRequired: true | false;
    /**
     * opposite of IsRequired
     */
    IsNullable?: boolean | undefined;
    /**
     * -
     */
    IsPrimaryKey: true | false;
    /**
     * 1, 2, 3, ...
     */
    Ordinal: number;
    /**
     * can only be set on create
     */
    FieldType: "Text" | "Number" | "Date" | "Boolean" | "Decimal" | "EmailAddress" | "Phone" | "Locale";
    /**
     * field length
     */
    MaxLength: number | string;
    /**
     * the number of places after the decimal that the field can hold; example: "0","1", ...
     */
    Scale: string;
};
/**
 * key: name of field, value: DataExtensionFieldItem
 */
export type DataExtensionFieldMap = {
    [x: string]: DataExtensionFieldItem;
};
export type DataExtensionItem = {
    /**
     * key
     */
    CustomerKey: string;
    /**
     * name
     */
    Name: string;
    /**
     * -
     */
    Description: string;
    /**
     * iso format
     */
    CreatedDate?: string | undefined;
    /**
     * iso format
     */
    ModifiedDate?: string | undefined;
    /**
     * -
     */
    IsSendable: true | false;
    /**
     * -
     */
    IsTestable: true | false;
    /**
     * -
     */
    SendableDataExtensionField: {
        Name: string;
    };
    /**
     * -
     */
    SendableSubscriberField: {
        Name: string;
    };
    /**
     * list of DE fields
     */
    Fields: DataExtensionFieldItem[];
    /**
     * retrieved from associated folder
     */
    r__folder_ContentType: "dataextension" | "salesforcedataextension" | "synchronizeddataextension" | "shared_dataextension" | "shared_salesforcedataextension";
    /**
     * folder path in which this DE is saved
     */
    r__folder_Path: string;
    /**
     * holds folder ID, replaced with r__folder_Path during retrieve
     */
    CategoryID?: string | undefined;
    /**
     * name of optionally associated DE template
     */
    r__dataExtensionTemplate_name?: string | undefined;
    /**
     * -
     */
    Template?: {
        /**
         * key of optionally associated DE teplate
         */
        CustomerKey?: string | undefined;
    } | undefined;
    /**
     * empty string or US date + 12:00:00 AM
     */
    RetainUntil: string;
    /**
     * YYYY-MM-DD
     */
    c__retainUntil: string;
    /**
     * readable name of retention policy
     */
    c__retentionPolicy?: "none" | "allRecordsAndDataextension" | "allRecords" | "individialRecords" | undefined;
    /**
     * number of days/weeks/months/years before retention kicks in
     */
    DataRetentionPeriodLength?: number | undefined;
    /**
     * 3:Days, 4:Weeks, 5:Months, 6:Years
     */
    DataRetentionPeriodUnitOfMeasure?: number | undefined;
    /**
     * 3:Days, 4:Weeks, 5:Months, 6:Years
     */
    c__dataRetentionPeriodUnitOfMeasure?: string | undefined;
    /**
     * true for retention policy individialRecords
     */
    RowBasedRetention?: boolean | undefined;
    /**
     * ?
     */
    ResetRetentionPeriodOnImport: boolean;
    /**
     * true for retention policy allRecords
     */
    DeleteAtEndOfRetentionPeriod?: boolean | undefined;
};
export type DataExtensionMap = {
    [x: string]: DataExtensionItem;
};
export type UserDocument = {
    /**
     * -
     */
    TYPE: "User" | "Installed Package" | "Inactivated User";
    /**
     * equal to UserID; optional in update/create calls
     */
    ID?: string | undefined;
    /**
     * equal to ID; required in update/create calls
     */
    UserID: string;
    /**
     * user.AccountUserID
     */
    AccountUserID?: number | undefined;
    /**
     * copy of AccountUserID
     */
    c__AccountUserID: number;
    /**
     * user.CustomerKey
     */
    CustomerKey: string;
    /**
     * user.Name
     */
    Name: string;
    /**
     * user.Email
     */
    Email: string;
    /**
     * user.NotificationEmailAddress
     */
    NotificationEmailAddress: string;
    /**
     * user.ActiveFlag === true ? '✓' : '-'
     */
    ActiveFlag: boolean;
    /**
     * user.IsAPIUser === true ? '✓' : '-'
     */
    IsAPIUser: boolean;
    /**
     * user.MustChangePassword === true ? '✓' : '-'
     */
    MustChangePassword: boolean;
    /**
     * default MID; BUName after we resolved it
     */
    DefaultBusinessUnit: number;
    /**
     * associatedBus
     */
    c__AssociatedBusinessUnits: number[];
    /**
     * (API only)
     */
    Roles?: {
        /**
         * roles (API only)
         */
        Role?: object[] | undefined;
    } | undefined;
    /**
     * roles
     */
    c__RoleNamesGlobal: string[];
    /**
     * userPermissions
     */
    UserPermissions: string[];
    /**
     * this.timeSinceDate(user.LastSuccessfulLogin)
     */
    LastSuccessfulLogin: string;
    /**
     * user.CreatedDate
     */
    CreatedDate: string;
    /**
     * user.ModifiedDate
     */
    ModifiedDate: string;
    /**
     * -
     */
    Client: {
        ID?: number | undefined;
        ModifiedBy?: number | undefined;
    };
    /**
     * -
     */
    c__type: "User" | "Installed Package";
    /**
     * (API only)
     */
    IsLocked?: boolean | undefined;
    /**
     * used to unlock a user that has IsLocked === true
     */
    Unlock?: boolean | undefined;
    /**
     * copy of IsLocked
     */
    c__IsLocked_readOnly: boolean;
    /**
     * name of timezone
     */
    c__TimeZoneName: string;
    /**
     * (API only)
     */
    TimeZone?: {
        /**
         * (API only)
         */
        Name?: string | undefined;
        /**
         * (API only)
         */
        ID?: string | undefined;
    } | undefined;
    /**
     * only used to set the password. cannot be retrieved
     */
    Password?: string | undefined;
    /**
     * fr-CA, en-US, ...
     */
    c__LocaleCode: "en-US" | "fr-CA" | "fr-FR" | "de-DE" | "it-IT" | "ja-JP" | "pt-BR" | "es-419" | "es-ES";
    /**
     * (API only)
     */
    Locale?: {
        /**
         * (API only)
         */
        LocaleCode?: "en-US" | "fr-CA" | "fr-FR" | "de-DE" | "it-IT" | "ja-JP" | "pt-BR" | "es-419" | "es-ES" | undefined;
    } | undefined;
    /**
     * -
     */
    SsoIdentity?: object | undefined;
    /**
     * -
     */
    SsoIdentities?: object | any[] | undefined;
};
export type UserDocumentDiff = {
    before: UserDocument;
    after: UserDocument;
};
/**
 * key=customer key
 */
export type UserDocumentMap = {
    [x: string]: UserDocument;
};
export type UserDocumentDocumentHelper = {
    /**
     * docs: user.ActiveFlag === true ? '✓' : '-'
     */
    ActiveFlagDocs: string;
    /**
     * docs: user.IsAPIUser === true ? '✓' : '-'
     */
    IsAPIUserDocs: string;
    /**
     * docs: user.MustChangePassword === true ? '✓' : '-'
     */
    MustChangePasswordDocs: string;
    /**
     * docs: default MID; BUName after we resolved it
     */
    DefaultBusinessUnitDocs: string;
    /**
     * docs: list of roles as concatenated string
     */
    RolesDocs: string;
    /**
     * docs: list of associated BUs as concatenated string
     */
    AssociatedBusDocs: string;
    /**
     * docs: user name who last modified this user
     */
    ModifiedBy: string | number;
    /**
     * docs: name of timezone
     */
    TimeZoneName: string;
    /**
     * docs: if the user cannot login
     */
    IsLockedDocs: string;
};
export type UserDocumentDocument = UserDocument & UserDocumentDocumentHelper;
export type AccountUserConfiguration = {
    /**
     * wrapper
     */
    Client: {
        ID: number;
    };
    /**
     * empty string
     */
    PartnerKey?: string | undefined;
    /**
     * User ID e.g:717133502
     */
    ID: number | string;
    /**
     * empty string
     */
    ObjectID?: string | undefined;
    /**
     * 0,1
     */
    Delete?: number | undefined;
    /**
     * -
     */
    BusinessUnitAssignmentConfiguration: BusinessUnitAssignmentConfiguration;
};
export type BusinessUnitAssignmentConfiguration = {
    /**
     * wrapper
     */
    BusinessUnitIds: {
        BusinessUnitId: number[] | number;
    };
    /**
     * assign BU if false, remove assignment if true
     */
    IsDelete: boolean;
};
export type AutomationActivity = {
    /**
     * key of associated activity
     */
    r__key: string;
    /**
     * name (not key) of associated activity
     */
    name?: string | undefined;
    /**
     * used by wait activity if a specific time of day was set
     */
    timeZone?: string | undefined;
    /**
     * Id of assoicated activity type; see this.definition.activityTypeMapping
     */
    objectTypeId?: number | undefined;
    /**
     * Object Id of assoicated metadata item
     */
    activityObjectId?: string | undefined;
    /**
     * order within step; starts with 1 or higher number
     */
    displayOrder?: number | undefined;
    /**
     * see this.definition.activityTypeMapping
     */
    r__type: string;
};
export type AutomationStep = {
    /**
     * description
     */
    name: string;
    /**
     * equals AutomationStep.name
     */
    annotation?: string | undefined;
    /**
     * step iterator; starts with 1
     */
    step?: number | undefined;
    /**
     * step iterator, automatically set during deployment
     */
    stepNumber?: number | undefined;
    /**
     * -
     */
    activities: AutomationActivity[];
};
/**
 * REST format
 */
export type AutomationSchedule = {
    /**
     * legacy id of schedule
     */
    id: string;
    /**
     * equals schedule.scheduleTypeId; upsert endpoint requires scheduleTypeId. retrieve endpoint returns typeId
     */
    typeId: number;
    /**
     * equals schedule.typeId; upsert endpoint requires scheduleTypeId. retrieve endpoint returns typeId
     */
    scheduleTypeId?: number | undefined;
    /**
     * example: '2021-05-07T09:00:00'
     */
    startDate: string;
    /**
     * example: '2021-05-07T09:00:00'
     */
    endDate: string;
    /**
     * example: 'FREQ=DAILY;UNTIL=20790606T160000;INTERVAL=1'
     */
    icalRecur: string;
    /**
     * same as icalRecur but returned by legacy-API; example: 'FREQ=DAILY;UNTIL=20790606T160000;INTERVAL=1'
     */
    iCalRecur?: string | undefined;
    /**
     * example: 'W. Europe Standard Time'; see this.definition.timeZoneMapping
     */
    timezoneName: string;
    /**
     * same as timezoneName but returned by legacy-API; example: 'W. Europe Standard Time'; see this.definition.timeZoneMapping
     */
    timeZone?: string | undefined;
    /**
     * kept in legacy API only, exact description of what this schedule does
     */
    description?: string | undefined;
    /**
     * see this.definition.timeZoneMapping
     */
    timezoneId?: number | undefined;
    /**
     * same as timezoneId but returned by legacy-API; see this.definition.timeZoneMapping
     */
    timeZoneId?: number | undefined;
    /**
     * ?
     */
    rangeTypeId?: number | undefined;
    /**
     * ?
     */
    pattern?: any;
    /**
     * ?
     */
    scheduledTime?: any;
    /**
     * ?
     */
    scheduledStatus?: string | undefined;
};
/**
 * SOAP format
 */
export type AutomationScheduleSoap = {
    /**
     * 'Minutely'|'Hourly'|'Daily'|'Weekly'|'Monthly'|'Yearly'
     */
    RecurrenceType?: string | undefined;
    /**
     * -
     */
    Recurrence: {
        $?: object | undefined;
        YearlyRecurrencePatternType?: "ByYear" | undefined;
        MonthlyRecurrencePatternType?: "ByMonth" | undefined;
        WeeklyRecurrencePatternType?: "ByWeek" | undefined;
        DailyRecurrencePatternType?: "ByDay" | undefined;
        MinutelyRecurrencePatternType?: "Interval" | undefined;
        HourlyRecurrencePatternType?: "Interval" | undefined;
        YearInterval?: number | undefined;
        MonthInterval?: number | undefined;
        WeekInterval?: number | undefined;
        DayInterval?: number | undefined;
        HourInterval?: number | undefined;
        MinuteInterval?: number | undefined;
    };
    /**
     * internal variable for CLI output only
     */
    _interval?: number | undefined;
    /**
     * -
     */
    TimeZone: {
        ID: number;
        IDSpecified?: true | undefined;
    };
    /**
     * internal variable for CLI output only
     */
    _timezoneString?: string | undefined;
    /**
     * AutomationSchedule.startDate
     */
    StartDateTime: string;
    /**
     * AutomationSchedule.startDate; internal variable for CLI output only
     */
    _StartDateTime?: string | undefined;
    /**
     * AutomationSchedule.endDate
     */
    EndDateTime?: string | undefined;
    /**
     * set to 'EndOn' if AutomationSchedule.icalRecur contains 'UNTIL'; otherwise to 'EndAfter'
     */
    RecurrenceRangeType: "EndOn" | "EndAfter";
    /**
     * only exists if RecurrenceRangeType=='EndAfter'
     */
    Occurrences?: number | undefined;
};
export type AutomationItem = {
    /**
     * Object Id
     */
    id: string;
    /**
     * legacy Object Id - used for handling notifications
     */
    legacyId?: string | undefined;
    /**
     * Object Id as returned by SOAP API
     */
    ObjectID?: string | undefined;
    /**
     * legacy id
     */
    programId?: string | undefined;
    /**
     * key (Rest API)
     */
    key: string;
    /**
     * key (SOAP API)
     */
    CustomerKey?: string | undefined;
    /**
     * name (Rest API)
     */
    name?: string | undefined;
    /**
     * name (SOAP API)
     */
    Name?: string | undefined;
    /**
     * notifications
     */
    notifications?: any;
    /**
     * -
     */
    description?: string | undefined;
    /**
     * Starting Source = Schedule / File Drop
     */
    type?: "scheduled" | "triggered" | "automationtriggered" | undefined;
    /**
     * Starting Source = Schedule / File Drop; from legacy api
     */
    automationType?: "scheduled" | "triggered" | "automationtriggered" | undefined;
    /**
     * automation status
     */
    status?: "Scheduled" | "Running" | "Ready" | "Building" | "PausedSchedule" | "InactiveTrigger" | undefined;
    /**
     * automation status
     */
    statusId?: number | undefined;
    /**
     * only existing if type=scheduled
     */
    schedule?: AutomationSchedule | undefined;
    /**
     * only existing if type=triggered
     */
    fileTrigger?: {
        /**
         * file name with placeholders
         */
        fileNamingPattern: string;
        /**
         * -
         */
        fileNamePatternTypeId: number;
        /**
         * where to look for the fileNamingPattern
         */
        folderLocationText: string;
        /**
         * ?
         */
        isPublished: boolean;
        /**
         * ?
         */
        queueFiles: boolean;
        /**
         * -
         */
        triggerActive: boolean;
    } | undefined;
    /**
     * only existing if type=automationtriggered
     */
    automationTrigger?: object | undefined;
    /**
     * -
     */
    startSource?: {
        /**
         * rewritten to AutomationItem.schedule
         */
        schedule?: AutomationSchedule | undefined;
        /**
         * rewritten to AutomationItem.fileTrigger
         */
        fileDrop?: {
            /**
             * file name with placeholders
             */
            fileNamePattern: string;
            /**
             * -
             */
            fileNamePatternTypeId: number;
            /**
             * -
             */
            folderLocation: string;
            /**
             * -
             */
            queueFiles: boolean;
        } | undefined;
        /**
         * -
         */
        typeId: number;
    } | undefined;
    /**
     * -
     */
    steps?: AutomationStep[] | undefined;
    /**
     * folder path
     */
    r__folder_Path?: string | undefined;
    /**
     * holds folder ID, replaced with r__folder_Path during retrieve
     */
    categoryId?: string | undefined;
    /**
     * user name of person who created this automation
     */
    createdName?: string | undefined;
    /**
     * iso format
     */
    createdDate?: string | undefined;
    /**
     * user name of person who last modified this automation
     */
    modifiedName?: string | undefined;
    /**
     * iso format
     */
    modifiedDate?: string | undefined;
    /**
     * user name of person who paused this automation
     */
    pausedName?: string | undefined;
    /**
     * iso format
     */
    pausedDate?: string | undefined;
};
export type VerificationItem = {
    /**
     * ID / Key
     */
    dataVerificationDefinitionId: string;
    /**
     * key
     */
    verificationType: "IsEqualTo" | "IsLessThan" | "IsGreaterThan" | "IsOutsideRange" | "IsInsideRange" | "IsNotEqualTo" | "IsNotLessThan" | "IsNotGreaterThan" | "IsNotOutsideRange" | "IsNotInsideRange";
    /**
     * used for all verificationTypes; lower value for IsOutsideRange, IsInsideRange, IsNotOutsideRange, IsNotInsideRange
     */
    value1: number;
    /**
     * only used for IsOutsideRange, IsInsideRange, IsNotOutsideRange, IsNotInsideRange; otherwise set to 0
     */
    value2: number;
    /**
     * flag to stop automation if verification fails
     */
    shouldStopOnFailure: boolean;
    /**
     * flag to send email if verification fails
     */
    shouldEmailOnFailure: boolean;
    /**
     * email address to send notification to; empty string if shouldEmailOnFailure=false
     */
    notificationEmailAddress: string;
    /**
     * email message to send; empty string if shouldEmailOnFailure=false
     */
    notificationEmailMessage: string;
    /**
     * user id of creator
     */
    createdBy: number;
    /**
     * ObjectID of target data extension
     */
    targetObjectId?: string | undefined;
    /**
     * key of target data extension
     */
    r__dataExtension_key: string;
    /**
     * custom key for verifications based on automation, step and activity number
     */
    c__automation_step: string;
};
export type AutomationMap = {
    [x: string]: AutomationItem;
};
export type AutomationMapObj = {
    metadata: AutomationMap;
    type: string;
};
export type AutomationItemObj = {
    metadata: object | AutomationItem;
    type: string;
};
export type McdevDeltaPkgItem = {
    /**
     * relative path to file
     */
    file: string;
    /**
     * changed lines
     */
    changes: number;
    /**
     * added lines
     */
    insertions: number;
    /**
     * deleted lines
     */
    deletions: number;
    /**
     * is a binary file
     */
    binary: boolean;
    /**
     * git thinks this file was moved
     */
    moved: boolean;
    /**
     * git thinks this relative path is where the file was before
     */
    fromPath?: string | undefined;
    /**
     * metadata type
     */
    type: string;
    /**
     * key
     */
    externalKey: string;
    /**
     * name
     */
    name: string;
    /**
     * what git recognized as an action
     */
    gitAction: "move" | "add/update" | "delete";
    /**
     * mcdev credential name
     */
    _credential: string;
    /**
     * mcdev business unit name inside of _credential
     */
    _businessUnit: string;
};
export type DeltaPkgItem = import("simple-git").DiffResultTextFile & McdevDeltaPkgItem;
export type RestError = import("sfmc-sdk/util").RestError;
export type SOAPError = import("sfmc-sdk/util").SOAPError;
export type SDKError = SOAPError & RestError;
/**
 * signals what to insert automatically for things usually asked via wizard
 */
export type SkipInteraction = {
    /**
     * client id of installed package
     */
    client_id?: string | undefined;
    /**
     * client secret of installed package
     */
    client_secret?: string | undefined;
    /**
     * tenant specific auth url of installed package
     */
    auth_url?: string | undefined;
    /**
     * MID of the Parent Business Unit
     */
    account_id?: number | undefined;
    /**
     * how you would like the credential to be named
     */
    credentialName?: string | undefined;
    /**
     * URL of Git remote server
     */
    gitRemoteUrl?: string | undefined;
    /**
     * will trigger re-downloading latest versions of dependent types after fixing keys
     */
    fixKeysReretrieve?: boolean | undefined;
    /**
     * used by mcdev init to directly push to a remote
     */
    gitPush?: string | undefined;
    /**
     * used by mcdev init to directly push to a remote
     */
    developmentBu?: string | undefined;
    /**
     * used by mcdev init to directly push to a remote
     */
    downloadBUs?: string | undefined;
};
export type FilterItem = {
    /**
     * folder id
     */
    categoryId: number;
    /**
     * -
     */
    createdDate?: string | undefined;
    /**
     * key
     */
    customerKey: string;
    /**
     * DE/List ID
     */
    destinationObjectId: string;
    /**
     * 1:SubscriberList, 2:DataExtension, 3:GroupWizard, 4:BehavioralData
     */
    destinationTypeId: 1 | 2 | 3 | 4;
    /**
     * ?
     */
    filterActivityId: string;
    /**
     * ObjectID of filterDefinition
     */
    filterDefinitionId: string;
    /**
     * -
     */
    modifiedDate: string;
    /**
     * name
     */
    name: string;
    /**
     * -
     */
    description?: string | undefined;
    /**
     * DE/List ID
     */
    sourceObjectId: string;
    /**
     * required for upsert; unknown purpose; set to null
     */
    resultGroupFolderId: null;
    /**
     * required for upsert; unknown purpose; set to null
     */
    resultGroupName: null;
    /**
     * required for upsert; unknown purpose; set to null
     */
    sourceId: null;
    /**
     * 1:SubscriberList, 2:DataExtension, 3:GroupWizard, 4:BehavioralData
     */
    sourceTypeId: 1 | 2 | 3 | 4;
    /**
     * seems to be a duplicate of sourceTypeId?
     */
    filterDefinitionSourceTypeId?: 1 | 2 | 3 | 4 | undefined;
    /**
     * description of destination DE
     */
    resultDEDescription?: string | undefined;
    /**
     * name of destination DE
     */
    resultDEName?: string | undefined;
    /**
     * key of destination DE
     */
    resultDEKey?: string | undefined;
    /**
     * ?
     */
    statusId: number;
    /**
     * relationship to filterDefinition
     */
    r__dataFilter_key?: string | undefined;
    /**
     * relationship to dataExtension source
     */
    r__source_dataExtension_key?: string | undefined;
    /**
     * relationship to dataExtension destination
     */
    r__destination_dataExtension_key?: string | undefined;
    /**
     * relationship to folder
     */
    r__folder_Path?: string | undefined;
};
export type FilterMap = {
    [x: string]: FilterItem;
};
/**
 * /automation/v1/filterdefinitions/<id> (not used)
 */
export type AutomationFilterDefinitionItem = {
    /**
     * object id
     */
    id: string;
    /**
     * external key
     */
    key: string;
    /**
     * -
     */
    createdDate: string;
    /**
     * user id
     */
    createdBy: number;
    /**
     * -
     */
    createdName: string;
    /**
     * (omitted by API if empty)
     */
    description?: string | undefined;
    /**
     * -
     */
    modifiedDate: string;
    /**
     * user id
     */
    modifiedBy: number;
    /**
     * -
     */
    modifiedName: string;
    /**
     * name
     */
    name: string;
    /**
     * folder id
     */
    categoryId: string;
    /**
     * from REST API defines the filter in XML form
     */
    filterDefinitionXml: string;
    /**
     * 1:list/profile attributes/measures, 2: dataExtension
     */
    derivedFromType: 1 | 2;
    /**
     * ?
     */
    isSendable: boolean;
};
/**
 * /email/v1/filters/filterdefinition/<id>
 */
export type DataFilterItem = {
    /**
     * object id
     */
    id: string;
    /**
     * external key
     */
    key: string;
    /**
     * date
     */
    createdDate: string;
    /**
     * user id
     */
    createdBy: number;
    /**
     * name
     */
    createdName: string;
    /**
     * (omitted by API if empty)
     */
    description?: string | undefined;
    /**
     * date
     */
    lastUpdated: string;
    /**
     * user id
     */
    lastUpdatedBy: number;
    /**
     * name
     */
    lastUpdatedName: string;
    /**
     * name
     */
    name: string;
    /**
     * folder id
     */
    categoryId: string;
    /**
     * from REST API defines the filter in XML form
     */
    filterDefinitionXml: string;
    /**
     * 1:list/profile attributes/measures, 2: dataExtension
     */
    derivedFromType: 1 | 2;
    /**
     * Id of DataExtension - present if derivedFromType=2
     */
    derivedFromObjectId: string;
    /**
     * -
     */
    derivedFromObjectTypeName: "DataExtension" | "SubscriberAttributes";
    /**
     * name of DataExtension
     */
    derivedFromObjectName?: string | undefined;
    /**
     * ?
     */
    isSendable: boolean;
    /**
     * copied from SOAP API, defines the filter in readable form
     */
    c__filterDefinition?: {
        /**
         * -
         */
        ConditionSet: FilterConditionSet;
    } | undefined;
    /**
     * relationship to list source (if derivedFromType=1)
     */
    r__source_list_PathName?: string | undefined;
    /**
     * relationship to dataExtension source (if derivedFromType=2)
     */
    r__source_dataExtension_key?: string | undefined;
};
export type FilterConditionSet = {
    /**
     * -
     */
    Condition: FilterCondition | FilterCondition[];
    /**
     * -
     */
    ConditionSet: FilterConditionSet;
};
export type FilterCondition = {
    /**
     * comparison operator (actually \@_Operator)
     */
    Operator: "IsEmpty" | "IsNotEmpty" | "Equals";
    /**
     * object id of field (actually \@_ID)
     */
    ID?: string | undefined;
    /**
     * filter value to compare against
     */
    Value?: string | undefined;
    /**
     * name of field
     */
    r__dataExtensionField_name?: string | undefined;
};
export type DataFilterMap = {
    [x: string]: DataFilterItem;
};
export type AuthObject = {
    /**
     * client_id client_id for sfmc-sdk auth
     */
    client_id: string;
    /**
     * client_secret for sfmc-sdk auth
     */
    client_secret: string;
    /**
     * mid of business unit to auth against
     */
    account_id: number;
    /**
     * authentication base url
     */
    auth_url: string;
};
export type SoapRequestParams = {
    /**
     * request id
     */
    continueRequest?: string | undefined;
    /**
     * additional options (CallsInConversation, Client, ConversationID, Priority, RequestType, SaveOptions, ScheduledTime, SendResponseTo, SequenceCode)
     */
    options?: object | undefined;
    /**
     * ?
     */
    clientIDs?: any;
    /**
     * simple or complex
     * complex
     */
    filter?: SoapSDKFilter | undefined;
    /**
     * all BUs or just one
     */
    QueryAllAccounts?: boolean | undefined;
};
export type SoapFilterSimple = {
    /**
     * field
     */
    property: string;
    /**
     * various options
     */
    simpleOperator: "equals" | "notEquals" | "isNull" | "isNotNull" | "greaterThan" | "lessThan" | "greaterThanOrEqual" | "lessThanOrEqual" | "between" | "IN" | "in" | "like";
    /**
     * field value
     */
    value?: string | number | boolean | string[] | number[] | undefined;
};
export type SoapFilterComplex = {
    /**
     * string for simple or a new filter-object for complex
     */
    leftOperand: SoapSDKFilter;
    /**
     * various options
     */
    logicalOperator: "AND" | "OR";
    /**
     * string for simple or a new filter-object for complex; omit for isNull and isNotNull
     */
    rightOperand: SoapSDKFilter;
};
export type SoapSDKFilterSimple = {
    /**
     * string for simple or a new filter-object for complex
     */
    leftOperand: SoapFilterSimple["property"];
    /**
     * various options
     */
    operator: SoapFilterSimple["simpleOperator"];
    /**
     * string for simple or a new filter-object for complex; omit for isNull and isNotNull
     */
    rightOperand?: SoapFilterSimple["value"];
};
export type SoapSDKFilterComplex = {
    /**
     * string for simple or a new filter-object for complex
     */
    leftOperand: SoapFilterComplex["leftOperand"];
    /**
     * various options
     */
    operator: SoapFilterComplex["logicalOperator"];
    /**
     * string for simple or a new filter-object for complex; omit for isNull and isNotNull
     */
    rightOperand: SoapFilterComplex["rightOperand"];
};
export type SoapSDKFilter = SoapSDKFilterSimple | SoapSDKFilterComplex;
export type AssetRequestParams = {
    /**
     * request id
     */
    continueRequest?: string | undefined;
    /**
     * additional options (CallsInConversation, Client, ConversationID, Priority, RequestType, SaveOptions, ScheduledTime, SendResponseTo, SequenceCode)
     */
    options?: object | undefined;
    /**
     * ?
     * complex
     */
    clientIDs?: any;
    /**
     * pagination
     */
    page?: object | undefined;
    /**
     * list of fields we want returned
     */
    fields?: string[] | undefined;
    /**
     * pagination
     */
    sort?: {
        property: string;
        direction: "ASC" | "DESC";
    }[] | undefined;
    /**
     * simple or complex filter
     */
    query?: AssetFilter | AssetFilterSimple | undefined;
};
export type AssetFilter = {
    /**
     * string for simple or a new filter-object for complex
     */
    leftOperand: AssetFilter | AssetFilterSimple;
    /**
     * various options
     */
    logicalOperator: "AND" | "OR";
    /**
     * string for simple or a new filter-object for complex; omit for isNull and isNotNull
     */
    rightOperand?: SoapSDKFilter | AssetFilterSimple | undefined;
};
export type AssetFilterSimple = {
    /**
     * field
     */
    property: string;
    /**
     * various options
     */
    simpleOperator: "equal" | "notEquals" | "isNull" | "isNotNull" | "greaterThan" | "lessThan" | "greaterThanOrEqual" | "lessThanOrEqual" | "between" | "IN" | "in" | "like";
    /**
     * field value
     */
    value: string | number | boolean | any[];
};
export type Mcdevrc = {
    /**
     * list of credentials
     */
    credentials: object;
    /**
     * configure options for mcdev
     */
    options: object;
    /**
     * configure directories for mcdev to read/write to
     */
    directories: {
        businessUnits: string;
        deploy: string;
        docs: string;
        retrieve: string;
        template: string;
        templateBuilds: string;
    };
    /**
     * templating variables grouped by markets
     */
    markets: {
        [x: string]: object;
    };
    /**
     * combination of markets and BUs for streamlined deployments
     */
    marketList: object;
    /**
     * templating variables grouped by markets
     */
    metaDataTypes: {
        retrieve: string[];
        createDeltaPkg: string[];
        documentOnRetrieve: string[];
    };
    /**
     * mcdev version that last updated the config file
     */
    version: string;
};
export type LoggerLevel = "error" | "verbose" | "info" | "debug";
export type McdevLogger = {
    /**
     * (msg) print info message
     */
    level?: LoggerLevel | undefined;
    /**
     * (msg) print error message; wrapper around winstonLogger.error that also sets error code to 1
     */
    error: (msg: string) => void;
    /**
     * print error with trace message
     */
    errorStack: (ex: SDKError, message?: string) => void;
};
export type Logger = import("winston").Logger & McdevLogger;
export type AssetItemSimple = {
    id: number;
    key: string;
    name: string;
};
export type AssetItemSimpleMap = {
    [x: string]: AssetItemSimple;
};
export type AssetItemIdSimpleMap = {
    [x: number]: AssetItemSimple;
};
export type ContentBlockConversionTypes = "id" | "key" | "name";
export type ExplainType = {
    /**
     * readable name of type
     */
    name: string;
    /**
     * api parameter name for type
     */
    apiName: string;
    /**
     * more info on what this type is about
     */
    description: string;
    /**
     * is it retrieved by default OR list of subtypes that are retrieved by default
     */
    retrieveByDefault: boolean | string[];
    /**
     * supported features
     */
    supports: {
        retrieve: boolean;
        create: boolean;
        update: boolean;
        delete: boolean;
        changeKey: boolean;
        buildTemplate: boolean;
        retrieveAsTemplate: boolean;
    };
};
export type ListItem = {
    /**
     * wrapper
     */
    Client?: {
        /**
         * owning BU's MID
         */
        ID: number;
    } | undefined;
    /**
     * not used
     */
    PartnerKey?: string | undefined;
    /**
     * "2021-06-21T11:54:57.103"
     */
    CreatedDate?: string | undefined;
    /**
     * "2021-06-21T11:54:57.103"
     */
    ModifiedDate?: string | undefined;
    /**
     * unique identifier per BU
     */
    ID?: number | undefined;
    /**
     * not used
     */
    ObjectID?: string | undefined;
    /**
     * unique identifer per BU
     */
    CustomerKey?: string | undefined;
    /**
     * customn field that tracks the exact directory path of the current folder including its own name
     */
    Path?: string | undefined;
    /**
     * wrapper
     */
    ParentFolder?: {
        /**
         * folder id of parent folder; 0 if current folder is already on top level
         */
        ID: number;
        /**
         * not used
         */
        ObjectID?: string | undefined;
        /**
         * customn field that tracks the exact directory path of the current folder including its own name
         */
        Path?: string | undefined;
    } | undefined;
    /**
     * folder name
     */
    Name: string;
    /**
     * deprecated option to describe the folder content
     */
    Description?: string | undefined;
    /**
     * e.g. "shared_data"; see folder-subtypes for complete list
     */
    ContentType: string;
    /**
     * ?
     */
    IsActive: boolean;
    /**
     * option to disable renaming/moving this folder via GUI
     */
    IsEditable: boolean;
    /**
     * option to prevent creating subfolders via GUI
     */
    AllowChildren: boolean;
    /**
     * helper flag for Deployer class to signal if the folder was auto-generated or manually placed
     */
    _generated?: boolean | undefined;
};
/**
 * key=id
 */
export type ListIdMap = {
    [x: number]: ListItem;
};
/**
 * key=customer key
 */
export type ListMap = {
    [x: string]: ListItem;
};
/**
 * returned by /data/v1/integration/member/salesforce/object/<OBJECT NAME>/referenceobjects
 */
export type ReferenceObject = {
    /**
     * label
     */
    displayname: string;
    /**
     * api name of salesforce object
     */
    referenceObjectName: string;
    /**
     * name of lookup/MD field on related object ending on __r (way to return fields from other object)
     */
    relationshipName: string;
    /**
     * name of lookup/MD field on related object ending on __c (returning id)
     */
    relationshipIdName: string;
    /**
     * if this lookup can point to multiple objects or not
     */
    isPolymorphic: boolean;
};
/**
 * returned by /legacy/v1/beta/integration/member/salesforce/object/<OBJECT NAME>
 */
export type SfObjectPicklist = {
    /**
     * -
     */
    active: boolean;
    /**
     * -
     */
    defaultValue: boolean;
    /**
     * what you see in the GUI
     */
    label: string;
    /**
     * whats stored in the DB
     */
    value: string;
};
/**
 * returned by /legacy/v1/beta/integration/member/salesforce/object/<OBJECT NAME>
 */
export type SfObjectField = {
    /**
     * "Annual Revenue"
     */
    label: string;
    /**
     * "AnnualRevenue"
     */
    name: string;
    /**
     * type
     */
    datatype: "currency" | "string" | "int" | "picklist" | "textarea" | "boolean" | "date" | "datetime" | "email";
    /**
     * 0-4000
     */
    length: number;
    /**
     * == not required
     */
    nillable: boolean;
    /**
     * is it a custom field
     */
    custom: boolean;
    /**
     * always true?
     */
    updateable: boolean;
    /**
     * always true?
     */
    createable: boolean;
    /**
     * -
     */
    defaultedoncreate: boolean;
    /**
     * -
     */
    externalid: boolean;
    /**
     * -
     */
    idlookup: boolean;
    /**
     * -
     */
    precision: number;
    /**
     * -
     */
    scale: number;
    /**
     * "Currency"
     */
    displaydatatype: "Currency" | "Text" | "Number" | "Picklist" | "Text Area (long)" | "Checkbox" | "Date" | "Date/Time" | "Email";
    /**
     * "Lead",
     */
    objectname: string;
    /**
     * "",
     */
    relationname: string;
    /**
     * -
     */
    isnamefield: boolean;
    /**
     * list of values
     */
    picklist?: SfObjectPicklist[] | undefined;
};
export type configurationArguments = {
    /**
     * SalesforceObjectTriggerV2
     */
    applicationExtensionKey: string;
    /**
     * 3.0
     */
    version: string;
    /**
     * what record event in SF triggers this
     */
    salesforceTriggerCriteria: "Created" | "Updated" | "CreatedUpdated";
    /**
     * what objects are used by this event
     */
    eventDataConfig: {
        objects: eventDataConfigObject[];
    };
    /**
     * TODO
     */
    primaryObjectFilterCriteria: Conditions;
    /**
     * TODO
     */
    relatedObjectFilterCriteria: Conditions;
    /**
     * seems to only exist on journey but not on event and also not on every journey
     */
    additionalObjectFilterCriteria?: object | undefined;
    /**
     * defines how this event links to the all contacts list
     */
    contactKey: {
        relationshipIdName: string;
        relationshipName: string;
        isPolymorphic: boolean;
        referenceObjectName: string;
        fieldName?: string | undefined;
    };
    /**
     * TODO
     */
    passThroughArgument: {
        fields: {
            ContactKey: string;
            Email: object;
            HasOptedOutOfEmail?: string | undefined;
        };
    };
    /**
     * primaryObjectFilterCriteria in simplified string-form
     */
    primaryObjectFilterSummary: string;
    /**
     * relatedObjectFilterCriteria in simplified string-form
     */
    relatedObjectFilterSummary: string;
    /**
     * eventDataConfig in simplified string-form
     */
    eventDataSummary: string[];
    /**
     * salesforceTriggerCriteria plus semi-colon
     */
    evaluationCriteriaSummary: "Created;" | "Updated;" | "Created;Updated;";
    /**
     * if objectAPIName==CampaignMember then this is also CampaignMember; otherwise it's Contact
     */
    contactPersonType: "CampaignMember" | "Contact";
    /**
     * the SF object on which the salesforceTriggerCriteria is listening on
     */
    objectAPIName: string;
    /**
     * "objectAPIName (Contact / Lead / Contacts and Leads)"
     */
    whoToInject: string;
    /**
     * empty string for SF events
     */
    criteria: string;
    /**
     * set to 0 for SF events
     */
    schemaVersionId: number;
};
/**
 * part of configurationArguments
 */
export type eventDataConfigObject = {
    /**
     * CampaignMember:Campaign:
     */
    dePrefix: string;
    /**
     * ?
     */
    isPolymorphic: boolean;
    /**
     * field on parent object containing the id; ends on __c for custom fields; same as referenceObject for standard fields; can be "Contacts and Leads"
     */
    referenceObject: string;
    /**
     * field on parent object acting as lookup; ends on __r for custom fields; same as referenceObject for standard fields; can be "Common"
     */
    relationshipName: string;
    /**
     * ?
     */
    relationshipIdName?: string | undefined;
    /**
     * list of field names that are used by this journey
     */
    fields: string[];
};
/**
 * part of configurationArguments
 */
export type Conditions = {
    /**
     * -
     */
    operand: "AND" | "OR";
    /**
     * list of conditions
     */
    conditions: (Conditions | FieldCondition)[];
};
/**
 * part of configurationArguments
 */
export type FieldCondition = {
    /**
     * is 0 for booleans, otherwise field length
     */
    _length: number;
    /**
     * type
     */
    datatype: "currency" | "string" | "int" | "picklist" | "textarea" | "boolean" | "date" | "datetime" | "email";
    /**
     * field API name; "TR1__Email__c"
     */
    fieldName: string;
    /**
     * "CampaignMember-CampaignMember"
     */
    folderId: string;
    /**
     * "CampaignMember-CampaignMember-TR1__Email__c"
     */
    id: string;
    /**
     * ?
     */
    isPolymorphic: boolean;
    /**
     * likely the field label; "Email"
     */
    name: string;
    /**
     * condition comparator
     */
    operator: "equals" | "EQUALS" | "WASSET";
    /**
     * value to compare the field with if operator is sth like "equals"; booleans are stored as upper-camel-case string!
     */
    value?: string | undefined;
    /**
     * ?
     */
    precision: number;
    /**
     * "Contacts and Leads"
     */
    referenceObjectName: string;
    /**
     * "CommonId"; can be an empty string
     */
    relationshipIdName: string;
    /**
     * "Common"; can be an empty string
     */
    relationshipName: string;
    /**
     * ?
     */
    scale: number;
    /**
     * seems to be equal to name-attribute?; "Email"
     */
    text: string;
};
export type validationRuleFix = () => boolean | null;
export type validationRuleTest = () => boolean;
export type validationRule = {
    /**
     * error message to display in case of a failed test
     */
    failedMsg: string;
    /**
     * test to run
     */
    passed: validationRuleTest;
    /**
     * test to run
     */
    fix?: validationRuleFix | undefined;
};
/**
 * key=rule name
 */
export type validationRuleList = {
    [x: string]: validationRule;
};
export type DomainVerificationItem = {
    /**
     * EID
     */
    enterpriseId?: number | undefined;
    /**
     * MID
     */
    memberId?: number | undefined;
    /**
     * domain or email address used in retrieve and create
     */
    domain?: string | undefined;
    /**
     * email address used in update call for isSendable field
     */
    emailAddress?: string | undefined;
    /**
     * returned by retrieve
     */
    status?: "Verified" | "Pending" | undefined;
    /**
     * returned by retrieve and required for update call
     */
    domainType?: "SAP" | "UserDomain" | "PrivateDomain" | "RegisteredDomain" | undefined;
    /**
     * automatically true upon creation. can be changed to false via update
     */
    isSendable: boolean;
    /**
     * e.g. ""2023-06-19T11:11:17.32""
     */
    emailSendTime?: string | undefined;
    /**
     * for bulk-creation only: email address to send notifications to when done
     */
    notificationEmail?: string | undefined;
    /**
     * for bulk-creation only: list of email addresses to verify
     */
    addresses?: string[] | undefined;
    /**
     * for bulk-creation only: instead of an array in addresses, specify the name of a DE
     */
    deTable?: string | undefined;
    /**
     * for bulk-creation only: instead of an array in addresses, specify the name of a DE column/field here
     */
    deColumn?: string | undefined;
};
export type BuildFilter = {
    /**
     * include key filters
     */
    include?: BuildFilterKeys | undefined;
    /**
     * exclude key filters
     */
    exclude?: BuildFilterKeys | undefined;
};
export type BuildFilterKeys = {
    /**
     * object with keys representing metadata types ("*" for all types, or specific type names) and values being arrays of string patterns to match against
     */
    key?: any;
};
//# sourceMappingURL=mcdev.d.d.ts.map