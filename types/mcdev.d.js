/**
 * @typedef {object} BuObject
 * @property {string} [clientId] installed package client id
 * @property {string} [clientSecret] installed package client secret
 * @property {string} [tenant] subdomain part of Authentication Base Uri
 * @property {number} [eid] Enterprise ID = MID of the parent BU
 * @property {number} [mid] MID of the BU to work with
 * @property {string} [businessUnit] name of the BU to interact with
 * @property {string} [credential] name of the credential to interact with
 */
/**
 * @typedef {Object.<string, string>} TemplateMap
 * @typedef {'asset'|'asset-archive'|'asset-asset'|'asset-audio'|'asset-block'|'asset-code'|'asset-document'|'asset-image'|'asset-message'|'asset-other'|'asset-rawimage'|'asset-template'|'asset-textfile'|'asset-video'|'attributeGroup'|'attributeSet'|'automation'|'campaign'|'contentArea'|'dataExtension'|'dataExtensionField'|'dataExtensionTemplate'|'dataExtract'|'dataExtractType'|'discovery'|'email'|'emailSend'|'event'|'fileLocation'|'fileTransfer'|'filter'|'folder'|'importFile'|'journey'|'list'|'mobileCode'|'mobileKeyword'|'mobileMessage'|'query'|'role'|'script'|'sendClassification'|'transactionalEmail'|'transactionalPush'|'transactionalSMS'|'triggeredSend'|'user'|'verification'} SupportedMetadataTypes
 * @typedef {Object.<SupportedMetadataTypes, string[]>} TypeKeyCombo object-key=metadata type, value=array of external keys
 */

/**
 * @typedef {Object.<any, any>} MetadataTypeItem generic metadata item
 * @typedef {Object.<string, MetadataTypeItem>} MetadataTypeMap key=customer key
 * @typedef {Object.<string, MetadataTypeMap>} MultiMetadataTypeMap key=Supported MetadataType
 * @typedef {Object.<string, MetadataTypeItem[]>} MultiMetadataTypeList key=Supported MetadataType
 * @typedef {{metadata: MetadataTypeMap, type: string}} MetadataTypeMapObj
 * @typedef {{metadata: MetadataTypeItem, type: string}} MetadataTypeItemObj
 * @typedef {Object.<number, MultiMetadataTypeMap>} Cache key=MID
 * @typedef {{before: MetadataTypeItem, after: MetadataTypeItem}} MetadataTypeItemDiff used during update
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
 * @property {string} [CreatedDate] iso format
 * @property {string} [ModifiedDate] iso format
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
 * @typedef {object} UserDocument
 * @property {'User'|'Installed Package'|'Inactivated User'} TYPE -
 * @property {string} [ID] equal to UserID; optional in update/create calls
 * @property {string} UserID equal to ID; required in update/create calls
 * @property {number} [AccountUserID] user.AccountUserID
 * @property {number} c__AccountUserID copy of AccountUserID
 * @property {string} CustomerKey user.CustomerKey
 * @property {string} Name user.Name
 * @property {string} Email user.Email
 * @property {string} NotificationEmailAddress user.NotificationEmailAddress
 * @property {boolean} ActiveFlag user.ActiveFlag === true ? '✓' : '-'
 * @property {boolean} IsAPIUser user.IsAPIUser === true ? '✓' : '-'
 * @property {boolean} MustChangePassword user.MustChangePassword === true ? '✓' : '-'
 * @property {number} DefaultBusinessUnit default MID; BUName after we resolved it
 * @property {number[]} c__AssociatedBusinessUnits associatedBus
 * @property {object} [Roles] (API only)
 * @property {object[]} [Roles.Role] roles (API only)
 * @property {string[]} c__RoleNamesGlobal roles
 * @property {string[]} UserPermissions userPermissions
 * @property {string} LastSuccessfulLogin this.timeSinceDate(user.LastSuccessfulLogin)
 * @property {string} CreatedDate user.CreatedDate
 * @property {string} ModifiedDate user.ModifiedDate
 * @property {object} Client -
 * @property {number} [Client.ID] EID e.g:7281698
 * @property {number} [Client.ModifiedBy] AccountUserID of user who last modified this user
 * @property {'User'|'Installed Package'} c__type -
 * @property {boolean|string} [IsLocked] (API only)
 * @property {boolean} [Unlock] used to unlock a user that has IsLocked === true
 * @property {boolean} c__IsLocked_readOnly copy of IsLocked
 * @property {string} c__TimeZoneName name of timezone
 * @property {object} [TimeZone] (API only)
 * @property {string} [TimeZone.Name] (API only)
 * @property {string} [TimeZone.ID] (API only)
 * @property {string} [Password] only used to set the password. cannot be retrieved
 * @property {'en-US'|'fr-CA'|'fr-FR'|'de-DE'|'it-IT'|'ja-JP'|'pt-BR'|'es-419'|'es-ES'} c__LocaleCode fr-CA, en-US, ...
 * @property {object} [Locale] (API only)
 * @property {'en-US'|'fr-CA'|'fr-FR'|'de-DE'|'it-IT'|'ja-JP'|'pt-BR'|'es-419'|'es-ES'} [Locale.LocaleCode] (API only)
 * @property {object} [SsoIdentity] -
 * @property {Array|object} [SsoIdentities] -
 */
/**
 * @typedef {{before:UserDocument,after:UserDocument}} UserDocumentDiff
 * @typedef {Object.<string, UserDocument>} UserDocumentMap key=customer key
 */
/**
 * @typedef {UserDocument & object} UserDocumentDocument
 * @property {boolean | string} ActiveFlag user.ActiveFlag === true ? '✓' : '-'
 * @property {boolean | string} IsAPIUser user.IsAPIUser === true ? '✓' : '-'
 * @property {boolean | string} MustChangePassword user.MustChangePassword === true ? '✓' : '-'
 * @property {number | string} DefaultBusinessUnit default MID; BUName after we resolved it
 */
/**
 * @typedef {object} AccountUserConfiguration
 * @property {object} Client wrapper
 * @property {number} Client.ID EID e.g:7281698
 * @property {string} [PartnerKey] empty string
 * @property {number | string} ID User ID e.g:717133502
 * @property {string} [ObjectID] empty string
 * @property {number} [Delete] 0,1
 * @property {BusinessUnitAssignmentConfiguration} BusinessUnitAssignmentConfiguration -
 * @typedef {object} BusinessUnitAssignmentConfiguration
 * @property {object} BusinessUnitIds wrapper
 * @property {number[]|number} BusinessUnitIds.BusinessUnitId e.g:[518003624]
 * @property {boolean} IsDelete assign BU if false, remove assignment if true
 */

/**
 * @typedef {object} AutomationActivity
 * @property {string} name name (not key) of activity
 * @property {number} [objectTypeId] Id of assoicated activity type; see this.definition.activityTypeMapping
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
 * @property {number} typeId equals schedule.scheduleTypeId; upsert endpoint requires scheduleTypeId. retrieve endpoint returns typeId
 * @property {number} [scheduleTypeId] equals schedule.typeId; upsert endpoint requires scheduleTypeId. retrieve endpoint returns typeId
 * @property {string} startDate example: '2021-05-07T09:00:00'
 * @property {string} endDate example: '2021-05-07T09:00:00'
 * @property {string} icalRecur example: 'FREQ=DAILY;UNTIL=20790606T160000;INTERVAL=1'
 * @property {string} timezoneName example: 'W. Europe Standard Time'; see this.definition.timeZoneMapping
 * @property {number} [timezoneId] see this.definition.timeZoneMapping
 * @property {number} [rangeTypeId] ?
 * @property {any} [pattern] ?
 * @property {any} [scheduledTime] ?
 * @property {string} [scheduledStatus] ?
 */
/**
 * @typedef {object} AutomationScheduleSoap SOAP format
 * @property {string} [RecurrenceType] 'Minutely'|'Hourly'|'Daily'|'Weekly'|'Monthly'|'Yearly'
 * @property {object} Recurrence -
 * @property {object} [Recurrence.$] {'xsi:type': keyStem + 'lyRecurrence'}
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
 * @property {number} [_interval] internal variable for CLI output only
 * @property {object} TimeZone -
 * @property {number} TimeZone.ID AutomationSchedule.timezoneId
 * @property {true} [TimeZone.IDSpecified] always true
 * @property {string} [_timezoneString] internal variable for CLI output only
 * @property {string} StartDateTime AutomationSchedule.startDate
 * @property {string} [_StartDateTime] AutomationSchedule.startDate; internal variable for CLI output only
 * @property {string} [EndDateTime] AutomationSchedule.endDate
 * @property {'EndOn'|'EndAfter'} RecurrenceRangeType set to 'EndOn' if AutomationSchedule.icalRecur contains 'UNTIL'; otherwise to 'EndAfter'
 * @property {number} [Occurrences] only exists if RecurrenceRangeType=='EndAfter'
 */
/**
 * @typedef {object} AutomationItem
 * @property {string} id Object Id
 * @property {string} [legacyId] legacy Object Id - used for handling notifications
 * @property {string} [ObjectID] Object Id as returned by SOAP API
 * @property {string} [programId] legacy id
 * @property {string} key key (Rest API)
 * @property {string} [CustomerKey] key (SOAP API)
 * @property {string} [name] name (Rest API)
 * @property {string} [Name] name (SOAP API)
 * @property {any} [notifications] notifications
 * @property {string} [description] -
 * @property {'scheduled'|'triggered'} [type] Starting Source = Schedule / File Drop
 * @property {'Scheduled'|'Running'|'Ready'|'Building'|'PausedSchedule'|'InactiveTrigger'} [status] automation status
 * @property {number} [statusId] automation status
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
 * @property {string} startSource.fileDrop.fileNamePattern file name with placeholders
 * @property {number} startSource.fileDrop.fileNamePatternTypeId -
 * @property {string} startSource.fileDrop.folderLocation -
 * @property {boolean} startSource.fileDrop.queueFiles -
 * @property {number} startSource.typeId -
 * @property {AutomationStep[]} [steps] -
 * @property {string} [r__folder_Path] folder path
 * @property {string} [categoryId] holds folder ID, replaced with r__folder_Path during retrieve
 */
/**
 * @typedef {object} VerificationItem
 * @property {string} dataVerificationDefinitionId ID / Key
 * @property {'IsEqualTo'|'IsLessThan'|'IsGreaterThan'|'IsOutsideRange'|'IsInsideRange'|'IsNotEqualTo'|'IsNotLessThan'|'IsNotGreaterThan'|'IsNotOutsideRange'|'IsNotInsideRange'} verificationType key
 * @property {number} value1 used for all verificationTypes; lower value for IsOutsideRange, IsInsideRange, IsNotOutsideRange, IsNotInsideRange
 * @property {number} value2 only used for IsOutsideRange, IsInsideRange, IsNotOutsideRange, IsNotInsideRange; otherwise set to 0
 * @property {boolean} shouldStopOnFailure flag to stop automation if verification fails
 * @property {boolean} shouldEmailOnFailure flag to send email if verification fails
 * @property {string} notificationEmailAddress email address to send notification to; empty string if shouldEmailOnFailure=false
 * @property {string} notificationEmailMessage email message to send; empty string if shouldEmailOnFailure=false
 * @property {number} createdBy user id of creator
 * @property {string} [targetObjectId] ObjectID of target data extension
 * @property {string} r__dataExtension_CustomerKey key of target data extension
 */

/**
 * @typedef {Object.<string, AutomationItem>} AutomationMap
 * @typedef {{metadata:AutomationMap,type:string}} AutomationMapObj
 * @typedef {{metadata:object | AutomationItem,type:string}} AutomationItemObj
 * @typedef {object} McdevDeltaPkgItem
 * @property {string} file relative path to file
 * @property {number} changes changed lines
 * @property {number} insertions added lines
 * @property {number} deletions deleted lines
 * @property {boolean} binary is a binary file
 * @property {boolean} moved git thinks this file was moved
 * @property {string} [fromPath] git thinks this relative path is where the file was before
 * @property {string} type metadata type
 * @property {string} externalKey key
 * @property {string} name name
 * @property {'move'|'add/update'|'delete'} gitAction what git recognized as an action
 * @property {string} _credential mcdev credential name
 * @property {string} _businessUnit mcdev business unit name inside of _credential
 * @typedef {import('simple-git').DiffResultTextFile & McdevDeltaPkgItem} DeltaPkgItem
 */
/**
 * @typedef {import('sfmc-sdk/auth').default} SDKauth
 * @typedef {import('sfmc-sdk/rest').default} SDKrest
 * @typedef {import('sfmc-sdk/soap').default} SDKsoap
 * @typedef {import('sfmc-sdk/util').RestError} RestError
 * @typedef {import('sfmc-sdk/util').SOAPError} SOAPError
 * @typedef {SOAPError & RestError} SDKError
 * @typedef {object} SDK
 * @property {SDKauth} auth SDKauth
 * @property {SDKrest} rest SDKrest
 * @property {SDKsoap} soap SDKsoap
 */

/**
 * @typedef {object} SkipInteraction signals what to insert automatically for things usually asked via wizard
 * @property {string} [client_id] client id of installed package
 * @property {string} [client_secret] client secret of installed package
 * @property {string} [auth_url] tenant specific auth url of installed package
 * @property {number} [account_id] MID of the Parent Business Unit
 * @property {string} [credentialName] how you would like the credential to be named
 * @property {string} [gitRemoteUrl] URL of Git remote server
 * @property {boolean} [fixKeysReretrieve] will trigger re-downloading latest versions of dependent types after fixing keys
 * @property {string} [gitPush] used by mcdev init to directly push to a remote
 * @property {string} [developmentBu] used by mcdev init to directly push to a remote
 * @property {string} [downloadBUs] used by mcdev init to directly push to a remote
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
 * @property {*} [clientIDs] ?
 * @property {SoapSDKFilter} [filter] simple or complex
complex
 * @property {boolean} [QueryAllAccounts] all BUs or just one
 */
/**
 * @typedef {object} SoapFilterSimple
 * @property {string} property field
 * @property {'equals'|'notEquals'|'isNull'|'isNotNull'|'greaterThan'|'lessThan'|'greaterThanOrEqual'|'lessThanOrEqual'|'between'|'IN'|'in'|'like'} simpleOperator various options
 * @property {string | number | boolean | Array} [value] field value
 */
/**
 * @typedef {object} SoapFilterComplex
 * @property {SoapSDKFilter} leftOperand string for simple or a new filter-object for complex
 * @property {'AND'|'OR'} logicalOperator various options
 * @property {SoapSDKFilter} rightOperand string for simple or a new filter-object for complex; omit for isNull and isNotNull
 */
/**
 * @typedef {object} SoapSDKFilterSimple
 * @property {SoapFilterSimple["property"]} leftOperand string for simple or a new filter-object for complex
 * @property {SoapFilterSimple["simpleOperator"]} operator various options
 * @property {SoapFilterSimple["value"]} [rightOperand] string for simple or a new filter-object for complex; omit for isNull and isNotNull
 */
/**
 * @typedef {object} SoapSDKFilterComplex
 * @property {SoapFilterComplex["leftOperand"]} leftOperand string for simple or a new filter-object for complex
 * @property {SoapFilterComplex["logicalOperator"]} operator various options
 * @property {SoapFilterComplex["rightOperand"]} rightOperand string for simple or a new filter-object for complex; omit for isNull and isNotNull
 */
/**
 * @typedef {SoapSDKFilterSimple | SoapSDKFilterComplex} SoapSDKFilter
 */

/**
 * @typedef {object} AssetRequestParams
 * @property {string} [continueRequest] request id
 * @property {object} [options] additional options (CallsInConversation, Client, ConversationID, Priority, RequestType, SaveOptions, ScheduledTime, SendResponseTo, SequenceCode)
 * @property {*} [clientIDs] ?
complex
 * @property {object} [page] pagination
 * @property {string[]} [fields] list of fields we want returned
 * @property {{property:string, direction: 'ASC'|'DESC'}[]} [sort] pagination
 * @property {AssetFilter | AssetFilterSimple} [query] simple or complex filter
 */

/**
 * @typedef {object} AssetFilter
 * @property {AssetFilter | AssetFilterSimple} leftOperand string for simple or a new filter-object for complex
 * @property {'AND'|'OR'} logicalOperator various options
 * @property {SoapSDKFilter | AssetFilterSimple} [rightOperand] string for simple or a new filter-object for complex; omit for isNull and isNotNull
 */
/**
 * @typedef {object} AssetFilterSimple
 * @property {string} property field
 * @property {'equal'|'notEquals'|'isNull'|'isNotNull'|'greaterThan'|'lessThan'|'greaterThanOrEqual'|'lessThanOrEqual'|'between'|'IN'|'in'|'like'} simpleOperator various options
 * @property {string | number | boolean | Array} value field value
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
 * @typedef {'error'|'verbose'|'info'|'debug'} LoggerLevel
 * @typedef {object} McdevLogger
 * @property {LoggerLevel} [level] (msg) print info message
 * @property {Function} error (msg) print error message
 * @property {Function} errorStack (ex, msg) print error with trace message
 * @typedef {import('winston').Logger & McdevLogger} Logger
 */

export default {};
