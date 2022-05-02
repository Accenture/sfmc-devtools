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
 * @typedef {object.<string, string>} TemplateMap
 */

/**
 * @typedef {object.<string, any>} MetadataTypeItem
 * @typedef {object.<string, MetadataTypeItem>} MetadataTypeMap
 * @typedef {object.<string, MetadataTypeMap>} MultiMetadataTypeMap
 * @typedef {object.<string, MetadataTypeItem[]>} MultiMetadataTypeList
 * @typedef {{metadata:MetadataTypeMap,type:string}} MetadataTypeMapObj
 * @typedef {{metadata:MetadataTypeItem,type:string}} MetadataTypeItemObj
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
 * @typedef {object.<string, QueryItem>} QueryMap
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
 * @typedef {object.<string, ScriptItem>} ScriptMap
 */
/**
 * @typedef {object.<string, any>} AssetItem
 * @typedef {object.<string, AssetItem>} AssetMap
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
 * @property {'true'|'false'} IsRequired -
 * @property {'true'|'false'} IsPrimaryKey -
 * @property {string} Ordinal 1, 2, 3, ...
 * @property {'Text'|'Number'|'Date'|'Boolean'|'Decimal'|'EmailAddress'|'Phone'|'Locale'} FieldType can only be set on create
 * @property {string} Scale the number of places after the decimal that the field can hold; example: "0","1", ...
 * @typedef {object.<string, DataExtensionFieldItem>} DataExtensionFieldMap
 */
/**
 * @typedef {object} DataExtensionItem
 * @property {string} CustomerKey key
 * @property {string} Name name
 * @property {string} Description -
 * @property {'true'|'false'} IsSendable -
 * @property {'true'|'false'} IsTestable -
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
 * @typedef {object.<string, DataExtensionItem>} DataExtensionMap
 */
