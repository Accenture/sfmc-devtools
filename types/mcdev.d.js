const SDK = require('sfmc-sdk');
/**
 * @ignore
 * @typedef {object} BuObject
 * @property {string} clientId installed package client id
 * @property {string} clientSecret installed package client secret
 * @property {string} tenant subdomain part of Authentication Base Uri
 * @property {string} [eid] Enterprise ID = MID of the parent BU
 * @property {string} [mid] MID of the BU to work with
 * @property {string} [businessUnit] name of the BU to interact with
 * @property {string} [credential] name of the credential to interact with
 */
/**
 * @typedef {Object.<string, string>} TemplateMap
 * @typedef {'accountUser'|'asset'|'attributeGroup'|'automation'|'campaign'|'contentArea'|'dataExtension'|'dataExtensionField'|'dataExtensionTemplate'|'dataExtract'|'dataExtractType'|'discovery'|'email'|'emailSendDefinition'|'eventDefinition'|'fileTransfer'|'filter'|'folder'|'ftpLocation'|'importFile'|'interaction'|'list'|'mobileCode'|'mobileKeyword'|'query'|'role'|'script'|'setDefinition'|'triggeredSendDefinition'} SupportedMetadataTypes
 */

/**
 * @typedef {Object.<string, any>} MetadataTypeItem
 * @typedef {Object.<string, MetadataTypeItem>} MetadataTypeMap key=customer key
 * @typedef {Object.<string, MetadataTypeMap>} MultiMetadataTypeMap key=Supported MetadataType
 * @typedef {Object.<string, MetadataTypeItem[]>} MultiMetadataTypeList key=Supported MetadataType
 * @typedef {{metadata:MetadataTypeMap,type:SupportedMetadataTypes}} MetadataTypeMapObj
 * @typedef {{metadata:MetadataTypeItem,type:SupportedMetadataTypes}} MetadataTypeItemObj
 */

/**
 * @typedef {object} CodeExtractItem
 * @property {MetadataTypeItem} json metadata of one item w/o code
 * @property {CodeExtract[]} codeArr list of code snippets in this item
 * @property {string[]} subFolder mostly set to null, otherwise list of subfolders
 */
/**
 * @typedef {object} CodeExtract
 * @property {string[]} subFolder mostly set to null, otherwise subfolders path split into elements
 * @property {string} fileName name of file w/o extension
 * @property {string} fileExt file extension
 * @property {string} content file content
 * @property {'base64'} [encoding] optional for binary files
 */
/**
 * @typedef {object} QueryItem
 * @property {string} name name
 * @property {string} key key
 * @property {string} description -
 * @property {string} targetKey key of target data extension
 * @property {string} createdDate e.g. "2020-09-14T01:42:03.017"
 * @property {string} modifiedDate e.g. "2020-09-14T01:42:03.017"
 * @property {'Overwrite'|'Update'|'Append'} targetUpdateTypeName defines how the query writes into the target data extension
 * @property {0|1|2} [targetUpdateTypeId] mapped to targetUpdateTypeName via this.definition.targetUpdateTypeMapping
 * @property {string} [targetId] Object ID of DE (removed before save)
 * @property {string} [targetDescription] Description DE (removed before save)
 * @property {boolean} isFrozen looks like this is always set to false
 * @property {string} [queryText] contains SQL query with line breaks converted to '\n'. The content is extracted during retrieval and written into a separate *.sql file
 * @property {string} [categoryId] holds folder ID, replaced with r__folder_Path during retrieve
 * @property {string} r__folder_Path folder path in which this DE is saved
 * @typedef {Object.<string, QueryItem>} QueryMap
 * @typedef {object} CodeExtractItem
 * @property {QueryItem} json metadata of one item w/o code
 * @property {CodeExtract[]} codeArr list of code snippets in this item
 * @property {string[]} subFolder mostly set to null, otherwise list of subfolders
 */
/**
 * @typedef {object} ScriptItem
 * @property {string} name name
 * @property {string} key key
 * @property {string} description -
 * @property {string} createdDate e.g. "2020-09-14T01:42:03.017"
 * @property {string} modifiedDate e.g. "2020-09-14T01:42:03.017"
 * @property {string} [script] contains script with line breaks converted to '\n'. The content is extracted during retrieval and written into a separate *.ssjs file
 * @property {string} [categoryId] holds folder ID, replaced with r__folder_Path during retrieve
 * @property {string} r__folder_Path folder path in which this DE is saved
 * @typedef {Object.<string, ScriptItem>} ScriptMap
 */
/**
 * @typedef {Object.<string, any>} AssetItem
 * @typedef {Object.<string, AssetItem>} AssetMap
 * @typedef {'archive'|'asset'|'audio'|'block'|'code'|'document'|'image'|'message'|'other'|'rawimage'|'template'|'textfile'|'video'} AssetSubType
 */
/**
 * @typedef {object} DataExtensionFieldItem
 * @property {string} [ObjectID] id
 * @property {string} [CustomerKey] key in format [DEkey].[FieldName]
 * @property {object} [DataExtension] -
 * @property {string} DataExtension.CustomerKey key of DE
 * @property {string} Name name of field
 * @property {string} [Name_new] custom attribute that is only used when trying to rename a field from Name to Name_new
 * @property {string} DefaultValue empty string for not set
 * @property {true|false} IsRequired -
 * @property {true|false} IsPrimaryKey -
 * @property {string} Ordinal 1, 2, 3, ...
 * @property {'Text'|'Number'|'Date'|'Boolean'|'Decimal'|'EmailAddress'|'Phone'|'Locale'} FieldType can only be set on create
 * @property {string} Scale the number of places after the decimal that the field can hold; example: "0","1", ...
 * @typedef {Object.<string, DataExtensionFieldItem>} DataExtensionFieldMap
 */
/**
 * @typedef {object} DataExtensionItem
 * @property {string} CustomerKey key
 * @property {string} Name name
 * @property {string} Description -
 * @property {true|false} IsSendable -
 * @property {true|false} IsTestable -
 * @property {object} SendableDataExtensionField -
 * @property {string} SendableDataExtensionField.Name -
 * @property {object} SendableSubscriberField -
 * @property {string} SendableSubscriberField.Name -
 * @property {DataExtensionFieldItem[]} Fields list of DE fields
 * @property {'dataextension'|'salesforcedataextension'|'synchronizeddataextension'|'shared_dataextension'|'shared_salesforcedataextension'} r__folder_ContentType retrieved from associated folder
 * @property {string} r__folder_Path folder path in which this DE is saved
 * @property {string} [CategoryID] holds folder ID, replaced with r__folder_Path during retrieve
 * @property {string} [r__dataExtensionTemplate_Name] name of optionally associated DE template
 * @property {object} [Template] -
 * @property {string} [Template.CustomerKey] key of optionally associated DE teplate
 * @typedef {Object.<string, DataExtensionItem>} DataExtensionMap
 */
/**
 * @typedef {object} AccountUserDocument
 * @property {string} TYPE user.type__c
 * @property {string} UserID user.UserID
 * @property {string} AccountUserID user.AccountUserID
 * @property {string} CustomerKey user.CustomerKey
 * @property {string} Name user.Name
 * @property {string} Email user.Email
 * @property {string} NotificationEmailAddress user.NotificationEmailAddress
 * @property {string} ActiveFlag user.ActiveFlag === true ? '✓' : '-'
 * @property {string} IsAPIUser user.IsAPIUser === true ? '✓' : '-'
 * @property {string} MustChangePassword user.MustChangePassword === true ? '✓' : '-'
 * @property {string} DefaultBusinessUnit defaultBUName
 * @property {string} AssociatedBusinessUnits__c associatedBus
 * @property {string} Roles roles
 * @property {string} UserPermissions userPermissions
 * @property {string} LastSuccessfulLogin this.timeSinceDate(user.LastSuccessfulLogin)
 * @property {string} CreatedDate user.CreatedDate
 * @property {string} ModifiedDate user.ModifiedDate
 */

/**
 * @typedef {object} AutomationActivity
 * @property {string} name name (not key) of activity
 * @property {string} [objectTypeId] Id of assoicated activity type; see this.definition.activityTypeMapping
 * @property {string} [activityObjectId] Object Id of assoicated metadata item
 * @property {number} [displayOrder] order within step; starts with 1 or higher number
 * @property {string} r__type see this.definition.activityTypeMapping
 */
/**
 * @typedef {object}  AutomationStep
 * @property {string} name description
 * @property {string} [annotation] equals AutomationStep.name
 * @property {number} [step] step iterator; starts with 1
 * @property {number} [stepNumber] step iterator, automatically set during deployment
 * @property {AutomationActivity[]} activities -
 */
/**
 * @typedef {object} AutomationSchedule REST format
 * @property {number} typeId ?
 * @property {string} startDate example: '2021-05-07T09:00:00'
 * @property {string} endDate example: '2021-05-07T09:00:00'
 * @property {string} icalRecur example: 'FREQ=DAILY;UNTIL=20790606T160000;INTERVAL=1'
 * @property {string} timezoneName example: 'W. Europe Standard Time'; see this.definition.timeZoneMapping
 * @property {number} [timezoneId] see this.definition.timeZoneMapping
 */
/**
 * @typedef {object} AutomationScheduleSoap SOAP format
 * @property {object} Recurrence -
 * @property {object} Recurrence.$ {'xsi:type': keyStem + 'lyRecurrence'}
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
 * @property {object} TimeZone -
 * @property {number} TimeZone.ID AutomationSchedule.timezoneId
 * @property {string} _timezoneString internal variable for CLI output only
 * @property {string} StartDateTime AutomationSchedule.startDate
 * @property {string} EndDateTime AutomationSchedule.endDate
 * @property {string} _StartDateTime AutomationSchedule.startDate; internal variable for CLI output only
 * @property {'EndOn'|'EndAfter'} RecurrenceRangeType set to 'EndOn' if AutomationSchedule.icalRecur contains 'UNTIL'; otherwise to 'EndAfter'
 * @property {number} Occurrences only exists if RecurrenceRangeType=='EndAfter'
 */
/**
 * @typedef {object} AutomationItem
 * @property {string} [id] Object Id
 * @property {string} key key
 * @property {string} name name
 * @property {string} description -
 * @property {'scheduled'|'triggered'} type Starting Source = Schedule / File Drop
 * @property {'Scheduled'|'Running'|'Ready'|'Building'|'PausedSchedule'|'InactiveTrigger'} status -
 * @property {AutomationSchedule} [schedule] only existing if type=scheduled
 * @property {object} [fileTrigger] only existing if type=triggered
 * @property {string} fileTrigger.fileNamingPattern file name with placeholders
 * @property {number} fileTrigger.fileNamePatternTypeId -
 * @property {string} fileTrigger.folderLocationText where to look for the fileNamingPattern
 * @property {boolean} fileTrigger.isPublished ?
 * @property {boolean} fileTrigger.queueFiles ?
 * @property {boolean} fileTrigger.triggerActive -
 * @property {object} [startSource] -
 * @property {AutomationSchedule} [startSource.schedule] rewritten to AutomationItem.schedule
 * @property {object} [startSource.fileDrop] rewritten to AutomationItem.fileTrigger
 * @property {string} startSource.fileDrop.fileNamingPattern file name with placeholders
 * @property {string} startSource.fileDrop.fileNamePatternTypeId -
 * @property {string} startSource.fileDrop.folderLocation -
 * @property {boolean} startSource.fileDrop.queueFiles -
 * @property {number} startSource.typeId -
 * @property {AutomationStep[]} steps -
 * @property {string} r__folder_Path folder path
 * @property {string} [categoryId] holds folder ID, replaced with r__folder_Path during retrieve
 */
/**
 * @typedef {Object.<string, AutomationItem>} AutomationMap
 * @typedef {{metadata:AutomationMap,type:string}} AutomationMapObj
 * @typedef {{metadata:AutomationItem,type:string}} AutomationItemObj
 * @typedef {object} DeltaPkgItem
 * @property {string} file relative path to file
 * @property {number} changes changed lines
 * @property {number} insertions added lines
 * @property {number} deletions deleted lines
 * @property {boolean} binary is a binary file
 * @property {boolean} moved git thinks this file was moved
 * @property {string} [fromPath] git thinks this relative path is where the file was before
 * @property {SupportedMetadataTypes} type metadata type
 * @property {string} externalKey key
 * @property {string} name name
 * @property {'move'|'add/update'|'delete'} gitAction what git recognized as an action
 * @property {string} _credential mcdev credential name
 * @property {string} _businessUnit mcdev business unit name inside of _credential
 * @typedef {SDK} SDK
 */

/**
 * @typedef {object} skipInteraction signals what to insert automatically for things usually asked via wizard
 * @property {string} client_id client id of installed package
 * @property {string} client_secret client secret of installed package
 * @property {string} auth_url tenant specific auth url of installed package
 * @property {number} account_id MID of the Parent Business Unit
 * @property {string} credentialName how you would like the credential to be named
 * @property {string} gitRemoteUrl URL of Git remote server
 */

/**
 * @typedef {object} AuthObject
 * @property {string} client_id client_id client_id for sfmc-sdk auth
 * @property {string} client_secret client_secret for sfmc-sdk auth
 * @property {number} account_id mid of business unit to auth against
 * @property {string} auth_url authentication base url
 */

/**
 * @typedef {object} SoapRequestParams
 * @property {string} [continueRequest] request id
 * @property {object} [options] additional options (CallsInConversation, Client, ConversationID, Priority, RequestType, SaveOptions, ScheduledTime, SendResponseTo, SequenceCode)
 * @property {*} clientIDs ?
 * @property {SoapFilter} [filter] simple or complex
complex
 * @property {boolean} [QueryAllAccounts] all BUs or just one
 * @typedef {object} SoapFilter
 * @property {string|SoapFilter} leftOperand string for simple or a new filter-object for complex
 * @property {'AND'|'OR'|'equals'|'notEquals'|'isNull'|'isNotNull'|'greaterThan'|'lessThan'|'greaterThanOrEqual'|'lessThanOrEqual'|'between'|'IN'|'like'} operator various options
 * @property {string|number|boolean|Array|SoapFilter} [rightOperand] string for simple or a new filter-object for complex; omit for isNull and isNotNull
 */

/**
 * @typedef {object} Mcdevrc
 * @property {object} credentials list of credentials
 * @property {object} options configure options for mcdev
 * @property {object} directories configure directories for mcdev to read/write to
 * @property {string} directories.businessUnits "businessUnits/"
 * @property {string} directories.deploy "deploy/"
 * @property {string} directories.docs "docs/"
 * @property {string} directories.retrieve "retrieve/"
 * @property {string} directories.template "template/"
 * @property {string} directories.templateBuilds ["retrieve/", "deploy/"]
 * @property {Object.<string, object>} markets templating variables grouped by markets
 * @property {object} marketList combination of markets and BUs for streamlined deployments
 * @property {object} metaDataTypes templating variables grouped by markets
 * @property {string[]} metaDataTypes.retrieve define what types shall be downloaded by default during retrieve
 * @property {string[]} metaDataTypes.documentOnRetrieve which types should be parsed & documented after retrieve
 * @property {string} version mcdev version that last updated the config file
 */

/**
 * @typedef {object} Logger
 * @property {Function} info print info message
 * @property {Function} warn print warning message
 * @property {Function} verbose additional messages that are not important
 * @property {Function} debug print debug message
 * @property {Function} error print error message
 * @property {Function} errorStack print error with trace message
 */

module.exports = {};
