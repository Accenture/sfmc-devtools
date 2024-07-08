declare const _default: {};
export default _default;
export type BuObject = {
    /**
     * installed package client id
     */
    clientId?: string;
    /**
     * installed package client secret
     */
    clientSecret?: string;
    /**
     * subdomain part of Authentication Base Uri
     */
    tenant?: string;
    /**
     * Enterprise ID = MID of the parent BU
     */
    eid?: number;
    /**
     * MID of the BU to work with
     */
    mid?: number;
    /**
     * name of the BU to interact with
     */
    businessUnit?: string;
    /**
     * name of the credential to interact with
     */
    credential?: string;
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
    [x: string]: MetadataTypeItem;
};
/**
 * key=Supported MetadataType
 */
export type MultiMetadataTypeMap = {
    [x: string]: MetadataTypeMap;
};
/**
 * key=Supported MetadataType
 */
export type MultiMetadataTypeList = {
    [x: string]: MetadataTypeItem[];
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
    [x: number]: MultiMetadataTypeMap;
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
    encoding?: "base64";
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
    targetId?: string;
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
    targetUpdateTypeId?: number;
    /**
     * Description DE (removed before save)
     */
    targetDescription?: string;
    /**
     * looks like this is always set to false
     */
    isFrozen: boolean;
    /**
     * contains SQL query with line breaks converted to '\n'. The content is extracted during retrieval and written into a separate *.sql file
     */
    queryText?: string;
    /**
     * holds folder ID, replaced with r__folder_Path during retrieve
     */
    categoryId?: string;
    /**
     * folder path in which this DE is saved
     */
    r__folder_Path: string;
    /**
     * Object ID of query
     */
    queryDefinitionId?: string;
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
    script?: string;
    /**
     * holds folder ID, replaced with r__folder_Path during retrieve
     */
    categoryId?: string;
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
    [x: string]: AssetItem;
};
export type AssetSubType = "archive" | "asset" | "audio" | "block" | "code" | "document" | "image" | "message" | "other" | "rawimage" | "template" | "textfile" | "video";
export type DataExtensionFieldItem = {
    /**
     * id
     */
    ObjectID?: string;
    /**
     * key in format [DEkey].[FieldName]
     */
    CustomerKey?: string;
    /**
     * -
     */
    DataExtension?: {
        CustomerKey: string;
    };
    /**
     * name of field
     */
    Name: string;
    /**
     * custom attribute that is only used when trying to rename a field from Name to Name_new
     */
    Name_new?: string;
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
    IsNullable?: true | false;
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
    CreatedDate?: string;
    /**
     * iso format
     */
    ModifiedDate?: string;
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
    CategoryID?: string;
    /**
     * name of optionally associated DE template
     */
    r__dataExtensionTemplate_name?: string;
    /**
     * -
     */
    Template?: {
        CustomerKey?: string;
    };
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
    c__retentionPolicy?: "none" | "allRecordsAndDataextension" | "allRecords" | "individialRecords";
    /**
     * number of days/weeks/months/years before retention kicks in
     */
    DataRetentionPeriodLength?: number;
    /**
     * 3:Days, 4:Weeks, 5:Months, 6:Years
     */
    DataRetentionPeriodUnitOfMeasure?: number;
    /**
     * 3:Days, 4:Weeks, 5:Months, 6:Years
     */
    c__dataRetentionPeriodUnitOfMeasure?: string;
    /**
     * true for retention policy individialRecords
     */
    RowBasedRetention?: boolean;
    /**
     * ?
     */
    ResetRetentionPeriodOnImport: boolean;
    /**
     * true for retention policy allRecords
     */
    DeleteAtEndOfRetentionPeriod?: boolean;
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
    ID?: string;
    /**
     * equal to ID; required in update/create calls
     */
    UserID: string;
    /**
     * user.AccountUserID
     */
    AccountUserID?: number;
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
        Role?: object[];
    };
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
        ID?: number;
        ModifiedBy?: number;
    };
    /**
     * -
     */
    c__type: "User" | "Installed Package";
    /**
     * (API only)
     */
    IsLocked?: boolean;
    /**
     * used to unlock a user that has IsLocked === true
     */
    Unlock?: boolean;
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
        Name?: string;
        ID?: string;
    };
    /**
     * only used to set the password. cannot be retrieved
     */
    Password?: string;
    /**
     * fr-CA, en-US, ...
     */
    c__LocaleCode: "en-US" | "fr-CA" | "fr-FR" | "de-DE" | "it-IT" | "ja-JP" | "pt-BR" | "es-419" | "es-ES";
    /**
     * (API only)
     */
    Locale?: {
        LocaleCode?: "en-US" | "fr-CA" | "fr-FR" | "de-DE" | "it-IT" | "ja-JP" | "pt-BR" | "es-419" | "es-ES";
    };
    /**
     * -
     */
    SsoIdentity?: object;
    /**
     * -
     */
    SsoIdentities?: any[] | object;
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
    PartnerKey?: string;
    /**
     * User ID e.g:717133502
     */
    ID: number | string;
    /**
     * empty string
     */
    ObjectID?: string;
    /**
     * 0,1
     */
    Delete?: number;
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
    name?: string;
    /**
     * Id of assoicated activity type; see this.definition.activityTypeMapping
     */
    objectTypeId?: number;
    /**
     * Object Id of assoicated metadata item
     */
    activityObjectId?: string;
    /**
     * order within step; starts with 1 or higher number
     */
    displayOrder?: number;
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
    annotation?: string;
    /**
     * step iterator; starts with 1
     */
    step?: number;
    /**
     * step iterator, automatically set during deployment
     */
    stepNumber?: number;
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
     * equals schedule.scheduleTypeId; upsert endpoint requires scheduleTypeId. retrieve endpoint returns typeId
     */
    typeId: number;
    /**
     * equals schedule.typeId; upsert endpoint requires scheduleTypeId. retrieve endpoint returns typeId
     */
    scheduleTypeId?: number;
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
     * example: 'W. Europe Standard Time'; see this.definition.timeZoneMapping
     */
    timezoneName: string;
    /**
     * see this.definition.timeZoneMapping
     */
    timezoneId?: number;
    /**
     * ?
     */
    rangeTypeId?: number;
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
    scheduledStatus?: string;
};
/**
 * SOAP format
 */
export type AutomationScheduleSoap = {
    /**
     * 'Minutely'|'Hourly'|'Daily'|'Weekly'|'Monthly'|'Yearly'
     */
    RecurrenceType?: string;
    /**
     * -
     */
    Recurrence: {
        $?: object;
        YearlyRecurrencePatternType?: "ByYear";
        MonthlyRecurrencePatternType?: "ByMonth";
        WeeklyRecurrencePatternType?: "ByWeek";
        DailyRecurrencePatternType?: "ByDay";
        MinutelyRecurrencePatternType?: "Interval";
        HourlyRecurrencePatternType?: "Interval";
        YearInterval?: number;
        MonthInterval?: number;
        WeekInterval?: number;
        DayInterval?: number;
        HourInterval?: number;
        MinuteInterval?: number;
    };
    /**
     * internal variable for CLI output only
     */
    _interval?: number;
    /**
     * -
     */
    TimeZone: {
        ID: number;
        IDSpecified?: true;
    };
    /**
     * internal variable for CLI output only
     */
    _timezoneString?: string;
    /**
     * AutomationSchedule.startDate
     */
    StartDateTime: string;
    /**
     * AutomationSchedule.startDate; internal variable for CLI output only
     */
    _StartDateTime?: string;
    /**
     * AutomationSchedule.endDate
     */
    EndDateTime?: string;
    /**
     * set to 'EndOn' if AutomationSchedule.icalRecur contains 'UNTIL'; otherwise to 'EndAfter'
     */
    RecurrenceRangeType: "EndOn" | "EndAfter";
    /**
     * only exists if RecurrenceRangeType=='EndAfter'
     */
    Occurrences?: number;
};
export type AutomationItem = {
    /**
     * Object Id
     */
    id: string;
    /**
     * legacy Object Id - used for handling notifications
     */
    legacyId?: string;
    /**
     * Object Id as returned by SOAP API
     */
    ObjectID?: string;
    /**
     * legacy id
     */
    programId?: string;
    /**
     * key (Rest API)
     */
    key: string;
    /**
     * key (SOAP API)
     */
    CustomerKey?: string;
    /**
     * name (Rest API)
     */
    name?: string;
    /**
     * name (SOAP API)
     */
    Name?: string;
    /**
     * notifications
     */
    notifications?: any;
    /**
     * -
     */
    description?: string;
    /**
     * Starting Source = Schedule / File Drop
     */
    type?: "scheduled" | "triggered";
    /**
     * automation status
     */
    status?: "Scheduled" | "Running" | "Ready" | "Building" | "PausedSchedule" | "InactiveTrigger";
    /**
     * automation status
     */
    statusId?: number;
    /**
     * only existing if type=scheduled
     */
    schedule?: AutomationSchedule;
    /**
     * only existing if type=triggered
     */
    fileTrigger?: {
        fileNamingPattern: string;
        fileNamePatternTypeId: number;
        folderLocationText: string;
        isPublished: boolean;
        queueFiles: boolean;
        triggerActive: boolean;
    };
    /**
     * -
     */
    startSource?: {
        schedule?: AutomationSchedule;
        fileDrop?: {
            fileNamePattern: string;
            fileNamePatternTypeId: number;
            folderLocation: string;
            queueFiles: boolean;
        };
        typeId: number;
    };
    /**
     * -
     */
    steps?: AutomationStep[];
    /**
     * folder path
     */
    r__folder_Path?: string;
    /**
     * holds folder ID, replaced with r__folder_Path during retrieve
     */
    categoryId?: string;
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
    targetObjectId?: string;
    /**
     * key of target data extension
     */
    r__dataExtension_key: string;
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
    fromPath?: string;
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
    client_id?: string;
    /**
     * client secret of installed package
     */
    client_secret?: string;
    /**
     * tenant specific auth url of installed package
     */
    auth_url?: string;
    /**
     * MID of the Parent Business Unit
     */
    account_id?: number;
    /**
     * how you would like the credential to be named
     */
    credentialName?: string;
    /**
     * URL of Git remote server
     */
    gitRemoteUrl?: string;
    /**
     * will trigger re-downloading latest versions of dependent types after fixing keys
     */
    fixKeysReretrieve?: boolean;
    /**
     * used by mcdev init to directly push to a remote
     */
    gitPush?: string;
    /**
     * used by mcdev init to directly push to a remote
     */
    developmentBu?: string;
    /**
     * used by mcdev init to directly push to a remote
     */
    downloadBUs?: string;
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
    continueRequest?: string;
    /**
     * additional options (CallsInConversation, Client, ConversationID, Priority, RequestType, SaveOptions, ScheduledTime, SendResponseTo, SequenceCode)
     */
    options?: object;
    /**
     * ?
     */
    clientIDs?: any;
    /**
     * simple or complex
     * complex
     */
    filter?: SoapSDKFilter;
    /**
     * all BUs or just one
     */
    QueryAllAccounts?: boolean;
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
    value?: string | number | boolean | string[] | number[];
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
    continueRequest?: string;
    /**
     * additional options (CallsInConversation, Client, ConversationID, Priority, RequestType, SaveOptions, ScheduledTime, SendResponseTo, SequenceCode)
     */
    options?: object;
    /**
     * ?
     * complex
     */
    clientIDs?: any;
    /**
     * pagination
     */
    page?: object;
    /**
     * list of fields we want returned
     */
    fields?: string[];
    /**
     * pagination
     */
    sort?: {
        property: string;
        direction: "ASC" | "DESC";
    }[];
    /**
     * simple or complex filter
     */
    query?: AssetFilter | AssetFilterSimple;
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
    rightOperand?: SoapSDKFilter | AssetFilterSimple;
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
    level?: LoggerLevel;
    /**
     * (msg) print error message
     */
    error: Function;
    /**
     * (ex, msg) print error with trace message
     */
    errorStack: Function;
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
//# sourceMappingURL=mcdev.d.d.ts.map