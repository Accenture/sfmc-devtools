## Classes

<dl>
<dt><a href="#Builder">Builder</a></dt>
<dd><p>Builds metadata from a template using market specific customisation</p>
</dd>
<dt><a href="#Deployer">Deployer</a></dt>
<dd><p>Reads metadata from local directory and deploys it to specified target business unit.
Source and target business units are also compared before the deployment to apply metadata specific patches.</p>
</dd>
<dt><a href="#Mcdev">Mcdev</a></dt>
<dd><p>main class</p>
</dd>
<dt><a href="#AccountUser">AccountUser</a> ⇐ <code><a href="#MetadataType">MetadataType</a></code></dt>
<dd><p>MessageSendActivity MetadataType</p>
</dd>
<dt><a href="#Asset">Asset</a> ⇐ <code><a href="#MetadataType">MetadataType</a></code></dt>
<dd><p>FileTransfer MetadataType</p>
</dd>
<dt><a href="#AttributeGroup">AttributeGroup</a> ⇐ <code><a href="#MetadataType">MetadataType</a></code></dt>
<dd><p>AttributeGroup MetadataType</p>
</dd>
<dt><a href="#Automation">Automation</a> ⇐ <code><a href="#MetadataType">MetadataType</a></code></dt>
<dd><p>Automation MetadataType</p>
</dd>
<dt><a href="#Campaign">Campaign</a> ⇐ <code><a href="#MetadataType">MetadataType</a></code></dt>
<dd><p>Campaign MetadataType</p>
</dd>
<dt><a href="#ContentArea">ContentArea</a> ⇐ <code><a href="#MetadataType">MetadataType</a></code></dt>
<dd><p>ContentArea MetadataType</p>
</dd>
<dt><a href="#DataExtension">DataExtension</a> ⇐ <code><a href="#MetadataType">MetadataType</a></code></dt>
<dd><p>DataExtension MetadataType</p>
</dd>
<dt><a href="#DataExtensionField">DataExtensionField</a> ⇐ <code><a href="#MetadataType">MetadataType</a></code></dt>
<dd><p>DataExtensionField MetadataType</p>
</dd>
<dt><a href="#DataExtensionTemplate">DataExtensionTemplate</a> ⇐ <code><a href="#MetadataType">MetadataType</a></code></dt>
<dd><p>DataExtensionTemplate MetadataType</p>
</dd>
<dt><a href="#DataExtract">DataExtract</a> ⇐ <code><a href="#MetadataType">MetadataType</a></code></dt>
<dd><p>DataExtract MetadataType</p>
</dd>
<dt><a href="#DataExtractType">DataExtractType</a> ⇐ <code><a href="#MetadataType">MetadataType</a></code></dt>
<dd><p>DataExtractType MetadataType
Only for Caching No retrieve/upsert is required
as this is a configuration in the EID</p>
</dd>
<dt><a href="#Discovery">Discovery</a> ⇐ <code><a href="#MetadataType">MetadataType</a></code></dt>
<dd><p>ImportFile MetadataType</p>
</dd>
<dt><a href="#Email">Email</a> ⇐ <code><a href="#MetadataType">MetadataType</a></code></dt>
<dd><p>Email MetadataType</p>
</dd>
<dt><a href="#EmailSendDefinition">EmailSendDefinition</a> ⇐ <code><a href="#MetadataType">MetadataType</a></code></dt>
<dd><p>MessageSendActivity MetadataType</p>
</dd>
<dt><a href="#EventDefinition">EventDefinition</a> ⇐ <code><a href="#MetadataType">MetadataType</a></code></dt>
<dd><p>EventDefinition MetadataType</p>
</dd>
<dt><a href="#FileTransfer">FileTransfer</a> ⇐ <code><a href="#MetadataType">MetadataType</a></code></dt>
<dd><p>FileTransfer MetadataType</p>
</dd>
<dt><a href="#Filter">Filter</a> ⇐ <code><a href="#MetadataType">MetadataType</a></code></dt>
<dd><p>Filter MetadataType</p>
</dd>
<dt><a href="#Folder">Folder</a> ⇐ <code><a href="#MetadataType">MetadataType</a></code></dt>
<dd><p>Folder MetadataType</p>
</dd>
<dt><a href="#FtpLocation">FtpLocation</a> ⇐ <code><a href="#MetadataType">MetadataType</a></code></dt>
<dd><p>ImportFile MetadataType</p>
</dd>
<dt><a href="#ImportFile">ImportFile</a> ⇐ <code><a href="#MetadataType">MetadataType</a></code></dt>
<dd><p>ImportFile MetadataType</p>
</dd>
<dt><a href="#Interaction">Interaction</a> ⇐ <code><a href="#MetadataType">MetadataType</a></code></dt>
<dd><p>Script MetadataType</p>
</dd>
<dt><a href="#List">List</a> ⇐ <code><a href="#MetadataType">MetadataType</a></code></dt>
<dd><p>List MetadataType</p>
</dd>
<dt><a href="#MetadataType">MetadataType</a></dt>
<dd><p>MetadataType class that gets extended by their specific metadata type class.
Provides default functionality that can be overwritten by child metadata type classes</p>
</dd>
<dt><a href="#MobileCode">MobileCode</a> ⇐ <code><a href="#MetadataType">MetadataType</a></code></dt>
<dd><p>MobileCode MetadataType</p>
</dd>
<dt><a href="#MobileKeyword">MobileKeyword</a> ⇐ <code><a href="#MetadataType">MetadataType</a></code></dt>
<dd><p>MobileKeyword MetadataType</p>
</dd>
<dt><a href="#Query">Query</a> ⇐ <code><a href="#MetadataType">MetadataType</a></code></dt>
<dd><p>Query MetadataType</p>
</dd>
<dt><a href="#Role">Role</a> ⇐ <code><a href="#MetadataType">MetadataType</a></code></dt>
<dd><p>ImportFile MetadataType</p>
</dd>
<dt><a href="#Script">Script</a> ⇐ <code><a href="#MetadataType">MetadataType</a></code></dt>
<dd><p>Script MetadataType</p>
</dd>
<dt><a href="#SetDefinition">SetDefinition</a> ⇐ <code><a href="#MetadataType">MetadataType</a></code></dt>
<dd><p>SetDefinition MetadataType</p>
</dd>
<dt><a href="#TriggeredSendDefinition">TriggeredSendDefinition</a> ⇐ <code><a href="#MetadataType">MetadataType</a></code></dt>
<dd><p>MessageSendActivity MetadataType</p>
</dd>
<dt><a href="#Retriever">Retriever</a></dt>
<dd><p>Retrieves metadata from a business unit and saves it to the local filesystem.</p>
</dd>
</dl>

## Constants

<dl>
<dt><a href="#Util">Util</a></dt>
<dd><p>CLI entry for SFMC DevTools</p>
</dd>
<dt><a href="#MetadataTypeDefinitions">MetadataTypeDefinitions</a></dt>
<dd><p>Provides access to all metadataType classes</p>
</dd>
<dt><a href="#MetadataTypeInfo">MetadataTypeInfo</a></dt>
<dd><p>Provides access to all metadataType classes</p>
</dd>
<dt><a href="#mcdev">mcdev</a></dt>
<dd><p>sample file on how to retrieve a simple changelog to use in GUIs or automated processing of any kind</p>
</dd>
<dt><a href="#BusinessUnit">BusinessUnit</a></dt>
<dd><p>Helper that handles retrieval of BU info</p>
</dd>
<dt><a href="#dataStore">dataStore</a> : <code>TYPE.Cache</code></dt>
<dd></dd>
<dt><a href="#Cli">Cli</a></dt>
<dd><p>CLI helper class</p>
</dd>
<dt><a href="#DevOps">DevOps</a></dt>
<dd><p>DevOps helper class</p>
</dd>
<dt><a href="#File">File</a></dt>
<dd><p>File extends fs-extra. It adds logger and util methods for file handling</p>
</dd>
<dt><a href="#Init">Init</a></dt>
<dd><p>CLI helper class</p>
</dd>
<dt><a href="#Init">Init</a></dt>
<dd><p>CLI helper class</p>
</dd>
<dt><a href="#Init">Init</a></dt>
<dd><p>CLI helper class</p>
</dd>
<dt><a href="#Init">Init</a></dt>
<dd><p>CLI helper class</p>
</dd>
<dt><a href="#Util">Util</a></dt>
<dd><p>Util that contains logger and simple util methods</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#csvToArray">csvToArray(csv)</a> ⇒ <code>Array.&lt;string&gt;</code></dt>
<dd><p>helper to convert CSVs into an array. if only one value was given, it&#39;s also returned as an array</p>
</dd>
<dt><a href="#getUserName">getUserName(userList, item, fieldname)</a> ⇒ <code>string</code></dt>
<dd></dd>
<dt><a href="#setupSDK">setupSDK(credentialKey, authObject)</a> ⇒ <code><a href="#SDK">SDK</a></code></dt>
<dd><p>Returns an SDK instance to be used for API calls</p>
</dd>
<dt><a href="#createNewLoggerTransport">createNewLoggerTransport()</a> ⇒ <code>object</code></dt>
<dd><p>wrapper around our standard winston logging to console and logfile</p>
</dd>
<dt><a href="#startLogger">startLogger()</a> ⇒ <code>void</code></dt>
<dd><p>initiate winston logger</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#SupportedMetadataTypes">SupportedMetadataTypes</a> : <code>Object.&lt;string, string&gt;</code></dt>
<dd></dd>
<dt><a href="#Cache">Cache</a> : <code>Object.&lt;string, any&gt;</code></dt>
<dd><p>key=customer key</p>
</dd>
<dt><a href="#CodeExtractItem">CodeExtractItem</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#CodeExtract">CodeExtract</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#CodeExtractItem">CodeExtractItem</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#ScriptMap">ScriptMap</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#AssetSubType">AssetSubType</a> : <code>Object.&lt;string, any&gt;</code></dt>
<dd></dd>
<dt><a href="#DataExtensionFieldMap">DataExtensionFieldMap</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#DataExtensionMap">DataExtensionMap</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#AccountUserDocument">AccountUserDocument</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#AutomationActivity">AutomationActivity</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#AutomationStep">AutomationStep</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#AutomationSchedule">AutomationSchedule</a> : <code>object</code></dt>
<dd><p>REST format</p>
</dd>
<dt><a href="#AutomationScheduleSoap">AutomationScheduleSoap</a> : <code>object</code></dt>
<dd><p>SOAP format</p>
</dd>
<dt><a href="#AutomationItem">AutomationItem</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#SDK">SDK</a> : <code>Object.&lt;string, AutomationItem&gt;</code></dt>
<dd></dd>
<dt><a href="#skipInteraction">skipInteraction</a> : <code>object</code></dt>
<dd><p>signals what to insert automatically for things usually asked via wizard</p>
</dd>
<dt><a href="#AuthObject">AuthObject</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#SoapFilter">SoapFilter</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#Mcdevrc">Mcdevrc</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#Logger">Logger</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="Builder"></a>

## Builder
Builds metadata from a template using market specific customisation

**Kind**: global class  

* [Builder](#Builder)
    * [new Builder(properties, buObject)](#new_Builder_new)
    * _instance_
        * [.metadata](#Builder+metadata) : <code>TYPE.MultiMetadataTypeList</code>
        * [._buildDefinition(metadataType, name, templateVariables)](#Builder+_buildDefinition) ⇒ <code>Promise.&lt;TYPE.MultiMetadataTypeList&gt;</code>
        * [._buildTemplate(metadataType, keyArr, templateVariables)](#Builder+_buildTemplate) ⇒ <code>Promise.&lt;TYPE.MultiMetadataTypeList&gt;</code>
    * _static_
        * [.buildTemplate(businessUnit, selectedType, keyArr, market)](#Builder.buildTemplate) ⇒ <code>Promise.&lt;TYPE.MultiMetadataTypeList&gt;</code>
        * [.buildDefinition(businessUnit, selectedType, name, market)](#Builder.buildDefinition) ⇒ <code>Promise.&lt;TYPE.MultiMetadataTypeList&gt;</code>
        * [.buildDefinitionBulk(listName, type, name)](#Builder.buildDefinitionBulk) ⇒ <code>Promise.&lt;void&gt;</code>

<a name="new_Builder_new"></a>

### new Builder(properties, buObject)
Creates a Builder, uses v2 auth if v2AuthOptions are passed.


| Param | Type | Description |
| --- | --- | --- |
| properties | <code>TYPE.Mcdevrc</code> | properties for auth saved |
| buObject | <code>TYPE.BuObject</code> | properties for auth |

<a name="Builder+metadata"></a>

### builder.metadata : <code>TYPE.MultiMetadataTypeList</code>
**Kind**: instance property of [<code>Builder</code>](#Builder)  
<a name="Builder+_buildDefinition"></a>

### builder.\_buildDefinition(metadataType, name, templateVariables) ⇒ <code>Promise.&lt;TYPE.MultiMetadataTypeList&gt;</code>
Builds a specific metadata file by name

**Kind**: instance method of [<code>Builder</code>](#Builder)  
**Returns**: <code>Promise.&lt;TYPE.MultiMetadataTypeList&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadataType | <code>string</code> | metadata type to build |
| name | <code>string</code> | name of metadata to build |
| templateVariables | <code>TYPE.TemplateMap</code> | variables to be replaced in the metadata |

<a name="Builder+_buildTemplate"></a>

### builder.\_buildTemplate(metadataType, keyArr, templateVariables) ⇒ <code>Promise.&lt;TYPE.MultiMetadataTypeList&gt;</code>
Build a template based on a list of metadata files in the retrieve folder.

**Kind**: instance method of [<code>Builder</code>](#Builder)  
**Returns**: <code>Promise.&lt;TYPE.MultiMetadataTypeList&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadataType | <code>string</code> | metadata type to create a template of |
| keyArr | <code>Array.&lt;string&gt;</code> | customerkey of metadata to create a template of |
| templateVariables | <code>TYPE.TemplateMap</code> | variables to be replaced in the metadata |

<a name="Builder.buildTemplate"></a>

### Builder.buildTemplate(businessUnit, selectedType, keyArr, market) ⇒ <code>Promise.&lt;TYPE.MultiMetadataTypeList&gt;</code>
Build a template based on a list of metadata files in the retrieve folder.

**Kind**: static method of [<code>Builder</code>](#Builder)  
**Returns**: <code>Promise.&lt;TYPE.MultiMetadataTypeList&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| businessUnit | <code>string</code> | references credentials from properties.json |
| selectedType | <code>string</code> | supported metadata type |
| keyArr | <code>Array.&lt;string&gt;</code> | customerkey of the metadata |
| market | <code>string</code> | market localizations |

<a name="Builder.buildDefinition"></a>

### Builder.buildDefinition(businessUnit, selectedType, name, market) ⇒ <code>Promise.&lt;TYPE.MultiMetadataTypeList&gt;</code>
Build a specific metadata file based on a template.

**Kind**: static method of [<code>Builder</code>](#Builder)  
**Returns**: <code>Promise.&lt;TYPE.MultiMetadataTypeList&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| businessUnit | <code>string</code> | references credentials from properties.json |
| selectedType | <code>string</code> | supported metadata type |
| name | <code>string</code> | name of the metadata |
| market | <code>string</code> | market localizations |

<a name="Builder.buildDefinitionBulk"></a>

### Builder.buildDefinitionBulk(listName, type, name) ⇒ <code>Promise.&lt;void&gt;</code>
Build a specific metadata file based on a template using a list of bu-market combos

**Kind**: static method of [<code>Builder</code>](#Builder)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| listName | <code>string</code> | name of list of BU-market combos |
| type | <code>string</code> | supported metadata type |
| name | <code>string</code> | name of the metadata |

<a name="Deployer"></a>

## Deployer
Reads metadata from local directory and deploys it to specified target business unit.
Source and target business units are also compared before the deployment to apply metadata specific patches.

**Kind**: global class  

* [Deployer](#Deployer)
    * [new Deployer(properties, buObject)](#new_Deployer_new)
    * _instance_
        * [.metadata](#Deployer+metadata) : <code>TYPE.MultiMetadataTypeMap</code>
        * [._deploy([typeArr], [keyArr], [fromRetrieve])](#Deployer+_deploy) ⇒ <code>Promise</code>
        * [.deployCallback(result, metadataType)](#Deployer+deployCallback) ⇒ <code>void</code>
    * _static_
        * [.deploy(businessUnit, [selectedTypesArr], [keyArr], [fromRetrieve])](#Deployer.deploy) ⇒ <code>Promise.&lt;void&gt;</code>
        * [._deployBU(cred, bu, properties, [typeArr], [keyArr], [fromRetrieve])](#Deployer._deployBU) ⇒ <code>Promise</code>
        * [.readBUMetadata(deployDir, [typeArr], [listBadKeys])](#Deployer.readBUMetadata) ⇒ <code>TYPE.MultiMetadataTypeMap</code>
        * [.createFolderDefinitions(deployDir, metadata, metadataTypeArr)](#Deployer.createFolderDefinitions) ⇒ <code>void</code>

<a name="new_Deployer_new"></a>

### new Deployer(properties, buObject)
Creates a Deployer, uses v2 auth if v2AuthOptions are passed.


| Param | Type | Description |
| --- | --- | --- |
| properties | <code>TYPE.Mcdevrc</code> | General configuration to be used in retrieve |
| buObject | <code>TYPE.BuObject</code> | properties for auth |

<a name="Deployer+metadata"></a>

### deployer.metadata : <code>TYPE.MultiMetadataTypeMap</code>
**Kind**: instance property of [<code>Deployer</code>](#Deployer)  
<a name="Deployer+_deploy"></a>

### deployer.\_deploy([typeArr], [keyArr], [fromRetrieve]) ⇒ <code>Promise</code>
Deploy all metadata that is located in the deployDir

**Kind**: instance method of [<code>Deployer</code>](#Deployer)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| [typeArr] | <code>Array.&lt;string&gt;</code> | limit deployment to given metadata type (can include subtype) |
| [keyArr] | <code>Array.&lt;string&gt;</code> | limit deployment to given metadata keys |
| [fromRetrieve] | <code>boolean</code> | if true, no folders will be updated/created |

<a name="Deployer+deployCallback"></a>

### deployer.deployCallback(result, metadataType) ⇒ <code>void</code>
Gets called for every deployed metadata entry

**Kind**: instance method of [<code>Deployer</code>](#Deployer)  

| Param | Type | Description |
| --- | --- | --- |
| result | <code>object</code> | Deployment result |
| metadataType | <code>string</code> | Name of metadata type |

<a name="Deployer.deploy"></a>

### Deployer.deploy(businessUnit, [selectedTypesArr], [keyArr], [fromRetrieve]) ⇒ <code>Promise.&lt;void&gt;</code>
Deploys all metadata located in the 'deploy' directory to the specified business unit

**Kind**: static method of [<code>Deployer</code>](#Deployer)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| businessUnit | <code>string</code> | references credentials from properties.json |
| [selectedTypesArr] | <code>Array.&lt;string&gt;</code> | limit deployment to given metadata type |
| [keyArr] | <code>Array.&lt;string&gt;</code> | limit deployment to given metadata keys |
| [fromRetrieve] | <code>boolean</code> | optionally deploy whats defined via selectedTypesArr + keyArr directly from retrieve folder instead of from deploy folder |

<a name="Deployer._deployBU"></a>

### Deployer.\_deployBU(cred, bu, properties, [typeArr], [keyArr], [fromRetrieve]) ⇒ <code>Promise</code>
helper for deploy()

**Kind**: static method of [<code>Deployer</code>](#Deployer)  
**Returns**: <code>Promise</code> - ensure that BUs are worked on sequentially  

| Param | Type | Description |
| --- | --- | --- |
| cred | <code>string</code> | name of Credential |
| bu | <code>string</code> | name of BU |
| properties | <code>TYPE.Mcdevrc</code> | General configuration to be used in retrieve |
| [typeArr] | <code>Array.&lt;string&gt;</code> | limit deployment to given metadata type |
| [keyArr] | <code>Array.&lt;string&gt;</code> | limit deployment to given metadata keys |
| [fromRetrieve] | <code>boolean</code> | optionally deploy whats defined via selectedTypesArr + keyArr directly from retrieve folder instead of from deploy folder |

<a name="Deployer.readBUMetadata"></a>

### Deployer.readBUMetadata(deployDir, [typeArr], [listBadKeys]) ⇒ <code>TYPE.MultiMetadataTypeMap</code>
Returns metadata of a business unit that is saved locally

**Kind**: static method of [<code>Deployer</code>](#Deployer)  
**Returns**: <code>TYPE.MultiMetadataTypeMap</code> - Metadata of BU in local directory  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| deployDir | <code>string</code> |  | root directory of metadata. |
| [typeArr] | <code>Array.&lt;string&gt;</code> |  | limit deployment to given metadata type |
| [listBadKeys] | <code>boolean</code> | <code>false</code> | do not print errors, used for badKeys() |

<a name="Deployer.createFolderDefinitions"></a>

### Deployer.createFolderDefinitions(deployDir, metadata, metadataTypeArr) ⇒ <code>void</code>
parses asset metadata to auto-create folders in target folder

**Kind**: static method of [<code>Deployer</code>](#Deployer)  

| Param | Type | Description |
| --- | --- | --- |
| deployDir | <code>string</code> | root directory of metadata. |
| metadata | <code>TYPE.MultiMetadataTypeMap</code> | list of metadata |
| metadataTypeArr | <code>Array.&lt;TYPE.SupportedMetadataTypes&gt;</code> | list of metadata types |

<a name="Mcdev"></a>

## Mcdev
main class

**Kind**: global class  

* [Mcdev](#Mcdev)
    * [.setSkipInteraction([skipInteraction])](#Mcdev.setSkipInteraction) ⇒ <code>void</code>
    * [.setLoggingLevel(argv)](#Mcdev.setLoggingLevel) ⇒ <code>void</code>
    * [.createDeltaPkg(argv)](#Mcdev.createDeltaPkg) ⇒ <code>Promise.&lt;Array.&lt;TYPE.DeltaPkgItem&gt;&gt;</code>
    * [.selectTypes()](#Mcdev.selectTypes) ⇒ <code>Promise</code>
    * [.explainTypes()](#Mcdev.explainTypes) ⇒ <code>void</code>
    * [.upgrade([skipInteraction])](#Mcdev.upgrade) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.retrieve(businessUnit, [selectedTypesArr], [keys], [changelogOnly])](#Mcdev.retrieve) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.deploy(businessUnit, [selectedTypesArr], [keyArr], [fromRetrieve])](#Mcdev.deploy) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.initProject([credentialsName], [skipInteraction])](#Mcdev.initProject) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.findBUs(credentialsName)](#Mcdev.findBUs) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.document(businessUnit, type)](#Mcdev.document) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.deleteByKey(businessUnit, type, customerKey)](#Mcdev.deleteByKey) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.badKeys(businessUnit)](#Mcdev.badKeys) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.retrieveAsTemplate(businessUnit, selectedType, name, market)](#Mcdev.retrieveAsTemplate) ⇒ <code>Promise.&lt;TYPE.MultiMetadataTypeList&gt;</code>
    * [.buildTemplate(businessUnit, selectedType, keyArr, market)](#Mcdev.buildTemplate) ⇒ <code>Promise.&lt;TYPE.MultiMetadataTypeList&gt;</code>
    * [.buildDefinition(businessUnit, selectedType, name, market)](#Mcdev.buildDefinition) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.buildDefinitionBulk(listName, type, name)](#Mcdev.buildDefinitionBulk) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.getFilesToCommit(businessUnit, selectedType, keyArr)](#Mcdev.getFilesToCommit) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>

<a name="Mcdev.setSkipInteraction"></a>

### Mcdev.setSkipInteraction([skipInteraction]) ⇒ <code>void</code>
helper method to use unattended mode when including mcdev as a package

**Kind**: static method of [<code>Mcdev</code>](#Mcdev)  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>boolean</code> \| <code>TYPE.skipInteraction</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Mcdev.setLoggingLevel"></a>

### Mcdev.setLoggingLevel(argv) ⇒ <code>void</code>
configures what is displayed in the console

**Kind**: static method of [<code>Mcdev</code>](#Mcdev)  

| Param | Type | Description |
| --- | --- | --- |
| argv | <code>object</code> | list of command line parameters given by user |
| [argv.silent] | <code>boolean</code> | only errors printed to CLI |
| [argv.verbose] | <code>boolean</code> | chatty user CLI output |
| [argv.debug] | <code>boolean</code> | enables developer output & features |

<a name="Mcdev.createDeltaPkg"></a>

### Mcdev.createDeltaPkg(argv) ⇒ <code>Promise.&lt;Array.&lt;TYPE.DeltaPkgItem&gt;&gt;</code>
handler for 'mcdev createDeltaPkg

**Kind**: static method of [<code>Mcdev</code>](#Mcdev)  
**Returns**: <code>Promise.&lt;Array.&lt;TYPE.DeltaPkgItem&gt;&gt;</code> - list of changed items  

| Param | Type | Description |
| --- | --- | --- |
| argv | <code>object</code> | yargs parameters |
| [argv.range] | <code>string</code> | git commit range     into deploy directory |
| [argv.filter] | <code>string</code> | filter file paths that start with any |
| [argv.skipInteraction] | <code>TYPE.skipInteraction</code> | allows to skip interactive wizard |

<a name="Mcdev.selectTypes"></a>

### Mcdev.selectTypes() ⇒ <code>Promise</code>
**Kind**: static method of [<code>Mcdev</code>](#Mcdev)  
**Returns**: <code>Promise</code> - .  
<a name="Mcdev.explainTypes"></a>

### Mcdev.explainTypes() ⇒ <code>void</code>
**Kind**: static method of [<code>Mcdev</code>](#Mcdev)  
**Returns**: <code>void</code> - .  
<a name="Mcdev.upgrade"></a>

### Mcdev.upgrade([skipInteraction]) ⇒ <code>Promise.&lt;boolean&gt;</code>
**Kind**: static method of [<code>Mcdev</code>](#Mcdev)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - success flag  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>boolean</code> \| <code>TYPE.skipInteraction</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Mcdev.retrieve"></a>

### Mcdev.retrieve(businessUnit, [selectedTypesArr], [keys], [changelogOnly]) ⇒ <code>Promise.&lt;object&gt;</code>
Retrieve all metadata from the specified business unit into the local file system.

**Kind**: static method of [<code>Mcdev</code>](#Mcdev)  
**Returns**: <code>Promise.&lt;object&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| businessUnit | <code>string</code> | references credentials from properties.json |
| [selectedTypesArr] | <code>Array.&lt;string&gt;</code> | limit retrieval to given metadata type |
| [keys] | <code>Array.&lt;string&gt;</code> | limit retrieval to given metadata key |
| [changelogOnly] | <code>boolean</code> | skip saving, only create json in memory |

<a name="Mcdev.deploy"></a>

### Mcdev.deploy(businessUnit, [selectedTypesArr], [keyArr], [fromRetrieve]) ⇒ <code>Promise.&lt;void&gt;</code>
Deploys all metadata located in the 'deploy' directory to the specified business unit

**Kind**: static method of [<code>Mcdev</code>](#Mcdev)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| businessUnit | <code>string</code> |  | references credentials from properties.json |
| [selectedTypesArr] | <code>Array.&lt;string&gt;</code> |  | limit deployment to given metadata type |
| [keyArr] | <code>Array.&lt;string&gt;</code> |  | limit deployment to given metadata keys |
| [fromRetrieve] | <code>boolean</code> | <code>false</code> | optionally deploy whats defined via selectedTypesArr + keyArr directly from retrieve folder instead of from deploy folder |

<a name="Mcdev.initProject"></a>

### Mcdev.initProject([credentialsName], [skipInteraction]) ⇒ <code>Promise.&lt;void&gt;</code>
Creates template file for properties.json

**Kind**: static method of [<code>Mcdev</code>](#Mcdev)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| [credentialsName] | <code>string</code> | identifying name of the installed package / project |
| [skipInteraction] | <code>boolean</code> \| <code>TYPE.skipInteraction</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Mcdev.findBUs"></a>

### Mcdev.findBUs(credentialsName) ⇒ <code>Promise.&lt;void&gt;</code>
Refreshes BU names and ID's from MC instance

**Kind**: static method of [<code>Mcdev</code>](#Mcdev)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| credentialsName | <code>string</code> | identifying name of the installed package / project |

<a name="Mcdev.document"></a>

### Mcdev.document(businessUnit, type) ⇒ <code>Promise.&lt;void&gt;</code>
Creates docs for supported metadata types in Markdown and/or HTML format

**Kind**: static method of [<code>Mcdev</code>](#Mcdev)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| businessUnit | <code>string</code> | references credentials from properties.json |
| type | <code>string</code> | metadata type |

<a name="Mcdev.deleteByKey"></a>

### Mcdev.deleteByKey(businessUnit, type, customerKey) ⇒ <code>Promise.&lt;void&gt;</code>
Creates docs for supported metadata types in Markdown and/or HTML format

**Kind**: static method of [<code>Mcdev</code>](#Mcdev)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| businessUnit | <code>string</code> | references credentials from properties.json |
| type | <code>string</code> | supported metadata type |
| customerKey | <code>string</code> | Identifier of data extension |

<a name="Mcdev.badKeys"></a>

### Mcdev.badKeys(businessUnit) ⇒ <code>Promise.&lt;void&gt;</code>
Converts metadata to legacy format. Output is saved in 'converted' directory

**Kind**: static method of [<code>Mcdev</code>](#Mcdev)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| businessUnit | <code>string</code> | references credentials from properties.json |

<a name="Mcdev.retrieveAsTemplate"></a>

### Mcdev.retrieveAsTemplate(businessUnit, selectedType, name, market) ⇒ <code>Promise.&lt;TYPE.MultiMetadataTypeList&gt;</code>
Retrieve a specific metadata file and templatise.

**Kind**: static method of [<code>Mcdev</code>](#Mcdev)  
**Returns**: <code>Promise.&lt;TYPE.MultiMetadataTypeList&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| businessUnit | <code>string</code> | references credentials from properties.json |
| selectedType | <code>string</code> | supported metadata type |
| name | <code>Array.&lt;string&gt;</code> | name of the metadata |
| market | <code>string</code> | market which should be used to revert template |

<a name="Mcdev.buildTemplate"></a>

### Mcdev.buildTemplate(businessUnit, selectedType, keyArr, market) ⇒ <code>Promise.&lt;TYPE.MultiMetadataTypeList&gt;</code>
Build a template based on a list of metadata files in the retrieve folder.

**Kind**: static method of [<code>Mcdev</code>](#Mcdev)  
**Returns**: <code>Promise.&lt;TYPE.MultiMetadataTypeList&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| businessUnit | <code>string</code> | references credentials from properties.json |
| selectedType | <code>string</code> | supported metadata type |
| keyArr | <code>Array.&lt;string&gt;</code> | customerkey of the metadata |
| market | <code>string</code> | market localizations |

<a name="Mcdev.buildDefinition"></a>

### Mcdev.buildDefinition(businessUnit, selectedType, name, market) ⇒ <code>Promise.&lt;void&gt;</code>
Build a specific metadata file based on a template.

**Kind**: static method of [<code>Mcdev</code>](#Mcdev)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| businessUnit | <code>string</code> | references credentials from properties.json |
| selectedType | <code>string</code> | supported metadata type |
| name | <code>string</code> | name of the metadata |
| market | <code>string</code> | market localizations |

<a name="Mcdev.buildDefinitionBulk"></a>

### Mcdev.buildDefinitionBulk(listName, type, name) ⇒ <code>Promise.&lt;void&gt;</code>
Build a specific metadata file based on a template using a list of bu-market combos

**Kind**: static method of [<code>Mcdev</code>](#Mcdev)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| listName | <code>string</code> | name of list of BU-market combos |
| type | <code>string</code> | supported metadata type |
| name | <code>string</code> | name of the metadata |

<a name="Mcdev.getFilesToCommit"></a>

### Mcdev.getFilesToCommit(businessUnit, selectedType, keyArr) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
**Kind**: static method of [<code>Mcdev</code>](#Mcdev)  
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - list of all files that need to be committed in a flat array ['path/file1.ext', 'path/file2.ext']  

| Param | Type | Description |
| --- | --- | --- |
| businessUnit | <code>string</code> | references credentials from properties.json |
| selectedType | <code>string</code> | supported metadata type |
| keyArr | <code>Array.&lt;string&gt;</code> | customerkey of the metadata |

<a name="AccountUser"></a>

## AccountUser ⇐ [<code>MetadataType</code>](#MetadataType)
MessageSendActivity MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [AccountUser](#AccountUser) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir, _, buObject, [___], [key])](#AccountUser.retrieve) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
    * [.retrieveChangelog(buObject)](#AccountUser.retrieveChangelog) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
    * [.timeSinceDate(date)](#AccountUser.timeSinceDate) ⇒ <code>number</code>
    * [.getBuName(buObject, id)](#AccountUser.getBuName) ⇒ <code>string</code>
    * [.document(buObject, [metadata])](#AccountUser.document) ⇒ <code>Promise.&lt;void&gt;</code>
    * [._generateDocMd(users, type, columnsToPrint)](#AccountUser._generateDocMd) ⇒ <code>string</code>
    * [.postRetrieveTasks(metadata)](#AccountUser.postRetrieveTasks) ⇒ <code>TYPE.MetadataTypeItem</code>
    * [.parseMetadata(metadata)](#AccountUser.parseMetadata) ⇒ <code>TYPE.MetadataTypeItem</code>

<a name="AccountUser.retrieve"></a>

### AccountUser.retrieve(retrieveDir, _, buObject, [___], [key]) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata

**Kind**: static method of [<code>AccountUser</code>](#AccountUser)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Promise of metadata  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| _ | <code>void</code> | unused parameter |
| buObject | <code>TYPE.BuObject</code> | properties for auth |
| [___] | <code>void</code> | unused parameter |
| [key] | <code>string</code> | customer key of single item to retrieve |

<a name="AccountUser.retrieveChangelog"></a>

### AccountUser.retrieveChangelog(buObject) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata

**Kind**: static method of [<code>AccountUser</code>](#AccountUser)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Promise of metadata  

| Param | Type | Description |
| --- | --- | --- |
| buObject | <code>TYPE.BuObject</code> | properties for auth |

<a name="AccountUser.timeSinceDate"></a>

### AccountUser.timeSinceDate(date) ⇒ <code>number</code>
**Kind**: static method of [<code>AccountUser</code>](#AccountUser)  
**Returns**: <code>number</code> - time difference  

| Param | Type | Description |
| --- | --- | --- |
| date | <code>string</code> | first date |

<a name="AccountUser.getBuName"></a>

### AccountUser.getBuName(buObject, id) ⇒ <code>string</code>
helper to print bu names

**Kind**: static method of [<code>AccountUser</code>](#AccountUser)  
**Returns**: <code>string</code> - "bu name (bu id)""  

| Param | Type | Description |
| --- | --- | --- |
| buObject | <code>TYPE.BuObject</code> | needed for eid |
| buObject.eid | <code>string</code> | needed to check for parent bu |
| id | <code>number</code> | bu id |

<a name="AccountUser.document"></a>

### AccountUser.document(buObject, [metadata]) ⇒ <code>Promise.&lt;void&gt;</code>
Creates markdown documentation of all roles

**Kind**: static method of [<code>AccountUser</code>](#AccountUser)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| buObject | <code>TYPE.BuObject</code> | properties for auth |
| [metadata] | <code>TYPE.MetadataTypeMap</code> | user list |

<a name="AccountUser._generateDocMd"></a>

### AccountUser.\_generateDocMd(users, type, columnsToPrint) ⇒ <code>string</code>
**Kind**: static method of [<code>AccountUser</code>](#AccountUser)  
**Returns**: <code>string</code> - markdown  

| Param | Type | Description |
| --- | --- | --- |
| users | <code>Array.&lt;object&gt;</code> | list of users and installed package |
| type | <code>&#x27;Installed Package&#x27;</code> \| <code>&#x27;User&#x27;</code> | choose what sub type to print |
| columnsToPrint | <code>Array.&lt;Array&gt;</code> | helper array |

<a name="AccountUser.postRetrieveTasks"></a>

### AccountUser.postRetrieveTasks(metadata) ⇒ <code>TYPE.MetadataTypeItem</code>
manages post retrieve steps

**Kind**: static method of [<code>AccountUser</code>](#AccountUser)  
**Returns**: <code>TYPE.MetadataTypeItem</code> - Array with one metadata object and one query string  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeItem</code> | a single query |

<a name="AccountUser.parseMetadata"></a>

### AccountUser.parseMetadata(metadata) ⇒ <code>TYPE.MetadataTypeItem</code>
parses retrieved Metadata before saving

**Kind**: static method of [<code>AccountUser</code>](#AccountUser)  
**Returns**: <code>TYPE.MetadataTypeItem</code> - Array with one metadata object and one sql string  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeItem</code> | a single query activity definition |

<a name="Asset"></a>

## Asset ⇐ [<code>MetadataType</code>](#MetadataType)
FileTransfer MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [Asset](#Asset) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir, _, __, [selectedSubType], [key])](#Asset.retrieve) ⇒ <code>Promise.&lt;{metadata: TYPE.AssetMap, type: string}&gt;</code>
    * [.retrieveForCache(_, [selectedSubType])](#Asset.retrieveForCache) ⇒ <code>Promise.&lt;{metadata: TYPE.AssetMap, type: string}&gt;</code>
    * [.retrieveAsTemplate(templateDir, name, templateVariables, [selectedSubType])](#Asset.retrieveAsTemplate) ⇒ <code>Promise.&lt;{metadata: TYPE.AssetItem, type: string}&gt;</code>
    * [.create(metadata)](#Asset.create) ⇒ <code>Promise</code>
    * [.update(metadata)](#Asset.update) ⇒ <code>Promise</code>
    * [.requestSubType(subType, subTypeArray, [retrieveDir], [templateName], [templateVariables], key)](#Asset.requestSubType) ⇒ <code>Promise</code>
    * [.requestAndSaveExtended(items, subType, retrieveDir, [templateVariables])](#Asset.requestAndSaveExtended) ⇒ <code>Promise</code>
    * [._retrieveExtendedFile(metadata, subType, retrieveDir)](#Asset._retrieveExtendedFile) ⇒ <code>Promise.&lt;void&gt;</code>
    * [._readExtendedFileFromFS(metadata, subType, deployDir)](#Asset._readExtendedFileFromFS) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.postRetrieveTasks(metadata)](#Asset.postRetrieveTasks) ⇒ <code>TYPE.CodeExtractItem</code>
    * [.preDeployTasks(metadata, deployDir, buObject)](#Asset.preDeployTasks) ⇒ <code>Promise.&lt;TYPE.AssetItem&gt;</code>
    * [._getMainSubtype(extendedSubType)](#Asset._getMainSubtype) ⇒ <code>string</code>
    * [.buildDefinitionForNested(templateDir, targetDir, metadata, templateVariables, templateName)](#Asset.buildDefinitionForNested) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.buildTemplateForNested(templateDir, targetDir, metadata, templateVariables, templateName)](#Asset.buildTemplateForNested) ⇒ <code>Promise.&lt;void&gt;</code>
    * [._buildForNested(templateDir, targetDir, metadata, templateVariables, templateName, mode)](#Asset._buildForNested) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.parseMetadata(metadata)](#Asset.parseMetadata) ⇒ <code>TYPE.CodeExtractItem</code>
    * [._mergeCode(metadata, deployDir, subType, [templateName], [fileListOnly])](#Asset._mergeCode) ⇒ <code>Promise.&lt;Array.&lt;TYPE.CodeExtract&gt;&gt;</code>
    * [._mergeCode_slots(prefix, metadataSlots, readDirArr, subtypeExtension, subDirArr, fileList, customerKey, [templateName], [fileListOnly])](#Asset._mergeCode_slots) ⇒ <code>Promise.&lt;void&gt;</code>
    * [._extractCode(metadata)](#Asset._extractCode) ⇒ <code>TYPE.CodeExtractItem</code>
    * [._extractCode_slots(prefix, metadataSlots, codeArr)](#Asset._extractCode_slots) ⇒ <code>void</code>
    * [.getJsonFromFS(dir, [_], selectedSubType)](#Asset.getJsonFromFS) ⇒ <code>TYPE.MetadataTypeMap</code>
    * [.findSubType(templateDir, templateName)](#Asset.findSubType) ⇒ <code>Promise.&lt;TYPE.AssetSubType&gt;</code>
    * [.readSecondaryFolder(templateDir, typeDirArr, templateName, fileName)](#Asset.readSecondaryFolder) ⇒ <code>TYPE.AssetItem</code>
    * [.getFilesToCommit(keyArr)](#Asset.getFilesToCommit) ⇒ <code>Array.&lt;string&gt;</code>

<a name="Asset.retrieve"></a>

### Asset.retrieve(retrieveDir, _, __, [selectedSubType], [key]) ⇒ <code>Promise.&lt;{metadata: TYPE.AssetMap, type: string}&gt;</code>
Retrieves Metadata of Asset

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>Promise.&lt;{metadata: TYPE.AssetMap, type: string}&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| _ | <code>void</code> | - |
| __ | <code>void</code> | - |
| [selectedSubType] | <code>TYPE.AssetSubType</code> | optionally limit to a single subtype |
| [key] | <code>string</code> | customer key |

<a name="Asset.retrieveForCache"></a>

### Asset.retrieveForCache(_, [selectedSubType]) ⇒ <code>Promise.&lt;{metadata: TYPE.AssetMap, type: string}&gt;</code>
Retrieves asset metadata for caching

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>Promise.&lt;{metadata: TYPE.AssetMap, type: string}&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| _ | <code>void</code> | - |
| [selectedSubType] | <code>string</code> | optionally limit to a single subtype |

<a name="Asset.retrieveAsTemplate"></a>

### Asset.retrieveAsTemplate(templateDir, name, templateVariables, [selectedSubType]) ⇒ <code>Promise.&lt;{metadata: TYPE.AssetItem, type: string}&gt;</code>
Retrieves asset metadata for templating

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>Promise.&lt;{metadata: TYPE.AssetItem, type: string}&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| name | <code>string</code> | name of the metadata file |
| templateVariables | <code>TYPE.TemplateMap</code> | variables to be replaced in the metadata |
| [selectedSubType] | <code>TYPE.AssetSubType</code> | optionally limit to a single subtype |

<a name="Asset.create"></a>

### Asset.create(metadata) ⇒ <code>Promise</code>
Creates a single asset

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.AssetItem</code> | a single asset |

<a name="Asset.update"></a>

### Asset.update(metadata) ⇒ <code>Promise</code>
Updates a single asset

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.AssetItem</code> | a single asset |

<a name="Asset.requestSubType"></a>

### Asset.requestSubType(subType, subTypeArray, [retrieveDir], [templateName], [templateVariables], key) ⇒ <code>Promise</code>
Retrieves Metadata of a specific asset type

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| subType | <code>TYPE.AssetSubType</code> | group of similar assets to put in a folder (ie. images) |
| subTypeArray | <code>Array.&lt;TYPE.AssetSubType&gt;</code> | list of all asset types within this subtype |
| [retrieveDir] | <code>string</code> | target directory for saving assets |
| [templateName] | <code>string</code> | name of the metadata file |
| [templateVariables] | <code>TYPE.TemplateMap</code> | variables to be replaced in the metadata |
| key | <code>string</code> | customer key to filter by |

<a name="Asset.requestAndSaveExtended"></a>

### Asset.requestAndSaveExtended(items, subType, retrieveDir, [templateVariables]) ⇒ <code>Promise</code>
Retrieves extended metadata (files or extended content) of asset

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| items | <code>Array</code> | array of items to retrieve |
| subType | <code>TYPE.AssetSubType</code> | group of similar assets to put in a folder (ie. images) |
| retrieveDir | <code>string</code> | target directory for saving assets |
| [templateVariables] | <code>TYPE.TemplateMap</code> | variables to be replaced in the metadata |

<a name="Asset._retrieveExtendedFile"></a>

### Asset.\_retrieveExtendedFile(metadata, subType, retrieveDir) ⇒ <code>Promise.&lt;void&gt;</code>
Some metadata types store their actual content as a separate file, e.g. images
This method retrieves these and saves them alongside the metadata json

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.AssetItem</code> | a single asset |
| subType | <code>TYPE.AssetSubType</code> | group of similar assets to put in a folder (ie. images) |
| retrieveDir | <code>string</code> | target directory for saving assets |

<a name="Asset._readExtendedFileFromFS"></a>

### Asset.\_readExtendedFileFromFS(metadata, subType, deployDir) ⇒ <code>Promise.&lt;void&gt;</code>
helper for this.preDeployTasks()
Some metadata types store their actual content as a separate file, e.g. images
This method reads these from the local FS stores them in the metadata object allowing to deploy it

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.AssetItem</code> | a single asset |
| subType | <code>TYPE.AssetSubType</code> | group of similar assets to put in a folder (ie. images) |
| deployDir | <code>string</code> | directory of deploy files |

<a name="Asset.postRetrieveTasks"></a>

### Asset.postRetrieveTasks(metadata) ⇒ <code>TYPE.CodeExtractItem</code>
manages post retrieve steps

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>TYPE.CodeExtractItem</code> - metadata  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.AssetItem</code> | a single asset |

<a name="Asset.preDeployTasks"></a>

### Asset.preDeployTasks(metadata, deployDir, buObject) ⇒ <code>Promise.&lt;TYPE.AssetItem&gt;</code>
prepares an asset definition for deployment

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>Promise.&lt;TYPE.AssetItem&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.AssetItem</code> | a single asset |
| deployDir | <code>string</code> | directory of deploy files |
| buObject | <code>TYPE.BuObject</code> | buObject properties for auth |

<a name="Asset._getMainSubtype"></a>

### Asset.\_getMainSubtype(extendedSubType) ⇒ <code>string</code>
find the subType matching the extendedSubType

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>string</code> - subType: block, message, other, etc  

| Param | Type | Description |
| --- | --- | --- |
| extendedSubType | <code>string</code> | webpage, htmlblock, etc |

<a name="Asset.buildDefinitionForNested"></a>

### Asset.buildDefinitionForNested(templateDir, targetDir, metadata, templateVariables, templateName) ⇒ <code>Promise.&lt;void&gt;</code>
helper for buildDefinition
handles extracted code if any are found for complex types

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>Promise.&lt;void&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where metadata templates are stored |
| targetDir | <code>string</code> | Directory where built definitions will be saved |
| metadata | <code>TYPE.AssetItem</code> | main JSON file that was read from file system |
| templateVariables | <code>TYPE.TemplateMap</code> | variables to be replaced in the metadata |
| templateName | <code>string</code> | name of the template to be built |

<a name="Asset.buildTemplateForNested"></a>

### Asset.buildTemplateForNested(templateDir, targetDir, metadata, templateVariables, templateName) ⇒ <code>Promise.&lt;void&gt;</code>
helper for buildTemplate
handles extracted code if any are found for complex types

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>Promise.&lt;void&gt;</code> - void  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where metadata templates are stored |
| targetDir | <code>string</code> \| <code>Array.&lt;string&gt;</code> | (List of) Directory where built definitions will be saved |
| metadata | <code>TYPE.AssetItem</code> | main JSON file that was read from file system |
| templateVariables | <code>TYPE.TemplateMap</code> | variables to be replaced in the metadata |
| templateName | <code>string</code> | name of the template to be built |

**Example**  
```js
assets of type codesnippetblock will result in 1 json and 1 amp/html file. both files need to be run through templating
```
<a name="Asset._buildForNested"></a>

### Asset.\_buildForNested(templateDir, targetDir, metadata, templateVariables, templateName, mode) ⇒ <code>Promise.&lt;void&gt;</code>
helper for buildDefinition
handles extracted code if any are found for complex types

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>Promise.&lt;void&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where metadata templates are stored |
| targetDir | <code>string</code> | Directory where built definitions will be saved |
| metadata | <code>TYPE.AssetItem</code> | main JSON file that was read from file system |
| templateVariables | <code>TYPE.TemplateMap</code> | variables to be replaced in the metadata |
| templateName | <code>string</code> | name of the template to be built |
| mode | <code>&#x27;definition&#x27;</code> \| <code>&#x27;template&#x27;</code> | defines what we use this helper for |

<a name="Asset.parseMetadata"></a>

### Asset.parseMetadata(metadata) ⇒ <code>TYPE.CodeExtractItem</code>
parses retrieved Metadata before saving

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>TYPE.CodeExtractItem</code> - parsed metadata definition  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.AssetItem</code> | a single asset definition |

<a name="Asset._mergeCode"></a>

### Asset.\_mergeCode(metadata, deployDir, subType, [templateName], [fileListOnly]) ⇒ <code>Promise.&lt;Array.&lt;TYPE.CodeExtract&gt;&gt;</code>
helper for this.preDeployTasks() that loads extracted code content back into JSON

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>Promise.&lt;Array.&lt;TYPE.CodeExtract&gt;&gt;</code> - fileList for templating (disregarded during deployment)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| metadata | <code>TYPE.AssetItem</code> |  | a single asset definition |
| deployDir | <code>string</code> |  | directory of deploy files |
| subType | <code>TYPE.AssetSubType</code> |  | asset-subtype name |
| [templateName] | <code>string</code> |  | name of the template used to built defintion (prior applying templating) |
| [fileListOnly] | <code>boolean</code> | <code>false</code> | does not read file contents nor update metadata if true |

<a name="Asset._mergeCode_slots"></a>

### Asset.\_mergeCode\_slots(prefix, metadataSlots, readDirArr, subtypeExtension, subDirArr, fileList, customerKey, [templateName], [fileListOnly]) ⇒ <code>Promise.&lt;void&gt;</code>
helper for this.preDeployTasks() that loads extracted code content back into JSON

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| prefix | <code>string</code> |  | usually the customerkey |
| metadataSlots | <code>object</code> |  | metadata.views.html.slots or deeper slots.<>.blocks.<>.slots |
| readDirArr | <code>Array.&lt;string&gt;</code> |  | directory of deploy files |
| subtypeExtension | <code>string</code> |  | asset-subtype name ending on -meta |
| subDirArr | <code>Array.&lt;string&gt;</code> |  | directory of files w/o leading deploy dir |
| fileList | <code>Array.&lt;object&gt;</code> |  | directory of files w/o leading deploy dir |
| customerKey | <code>string</code> |  | external key of template (could have been changed if used during templating) |
| [templateName] | <code>string</code> |  | name of the template used to built defintion (prior applying templating) |
| [fileListOnly] | <code>boolean</code> | <code>false</code> | does not read file contents nor update metadata if true |

<a name="Asset._extractCode"></a>

### Asset.\_extractCode(metadata) ⇒ <code>TYPE.CodeExtractItem</code>
helper for this.parseMetadata() that finds code content in JSON and extracts it
to allow saving that separately and formatted

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>TYPE.CodeExtractItem</code> - { json: metadata, codeArr: object[], subFolder: string[] }  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.AssetItem</code> | a single asset definition |

<a name="Asset._extractCode_slots"></a>

### Asset.\_extractCode\_slots(prefix, metadataSlots, codeArr) ⇒ <code>void</code>
**Kind**: static method of [<code>Asset</code>](#Asset)  

| Param | Type | Description |
| --- | --- | --- |
| prefix | <code>string</code> | usually the customerkey |
| metadataSlots | <code>object</code> | metadata.views.html.slots or deeper slots.<>.blocks.<>.slots |
| codeArr | <code>Array.&lt;object&gt;</code> | to be extended array for extracted code |

<a name="Asset.getJsonFromFS"></a>

### Asset.getJsonFromFS(dir, [_], selectedSubType) ⇒ <code>TYPE.MetadataTypeMap</code>
Returns file contents mapped to their fileName without '.json' ending

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>TYPE.MetadataTypeMap</code> - fileName => fileContent map  

| Param | Type | Description |
| --- | --- | --- |
| dir | <code>string</code> | directory that contains '.json' files to be read |
| [_] | <code>void</code> | unused parameter |
| selectedSubType | <code>Array.&lt;string&gt;</code> | asset, message, ... |

<a name="Asset.findSubType"></a>

### Asset.findSubType(templateDir, templateName) ⇒ <code>Promise.&lt;TYPE.AssetSubType&gt;</code>
check template directory for complex types that open subfolders for their subtypes

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>Promise.&lt;TYPE.AssetSubType&gt;</code> - subtype name  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where metadata templates are stored |
| templateName | <code>string</code> | name of the metadata file |

<a name="Asset.readSecondaryFolder"></a>

### Asset.readSecondaryFolder(templateDir, typeDirArr, templateName, fileName) ⇒ <code>TYPE.AssetItem</code>
optional method used for some types to try a different folder structure

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>TYPE.AssetItem</code> - metadata  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where metadata templates are stored |
| typeDirArr | <code>Array.&lt;string&gt;</code> | current subdir for this type |
| templateName | <code>string</code> | name of the metadata template |
| fileName | <code>string</code> | name of the metadata template file w/o extension |

<a name="Asset.getFilesToCommit"></a>

### Asset.getFilesToCommit(keyArr) ⇒ <code>Array.&lt;string&gt;</code>
should return only the json for all but asset, query and script that are saved as multiple files
additionally, the documentation for dataExtension and automation should be returned

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>Array.&lt;string&gt;</code> - list of all files that need to be committed in a flat array ['path/file1.ext', 'path/file2.ext']  

| Param | Type | Description |
| --- | --- | --- |
| keyArr | <code>Array.&lt;string&gt;</code> | customerkey of the metadata |

<a name="AttributeGroup"></a>

## AttributeGroup ⇐ [<code>MetadataType</code>](#MetadataType)
AttributeGroup MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [AttributeGroup](#AttributeGroup) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir, [_], [__], [___], [key])](#AttributeGroup.retrieve) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
    * [.retrieveForCache()](#AttributeGroup.retrieveForCache) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>

<a name="AttributeGroup.retrieve"></a>

### AttributeGroup.retrieve(retrieveDir, [_], [__], [___], [key]) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Retrieves Metadata of schema attribute groups.

**Kind**: static method of [<code>AttributeGroup</code>](#AttributeGroup)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Promise of metadata  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| [_] | <code>void</code> | unused parameter |
| [__] | <code>void</code> | unused parameter |
| [___] | <code>void</code> | unused parameter |
| [key] | <code>string</code> | customer key of single item to retrieve |

<a name="AttributeGroup.retrieveForCache"></a>

### AttributeGroup.retrieveForCache() ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Retrieves Metadata of schema attribute groups for caching.

**Kind**: static method of [<code>AttributeGroup</code>](#AttributeGroup)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Promise of metadata  
<a name="Automation"></a>

## Automation ⇐ [<code>MetadataType</code>](#MetadataType)
Automation MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [Automation](#Automation) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir, [_], [__], [___], [key])](#Automation.retrieve) ⇒ <code>Promise.&lt;TYPE.AutomationMapObj&gt;</code>
    * [.retrieveChangelog()](#Automation.retrieveChangelog) ⇒ <code>Promise.&lt;TYPE.AutomationMapObj&gt;</code>
    * [.retrieveForCache()](#Automation.retrieveForCache) ⇒ <code>Promise.&lt;TYPE.AutomationMapObj&gt;</code>
    * [.retrieveAsTemplate(templateDir, name, templateVariables)](#Automation.retrieveAsTemplate) ⇒ <code>Promise.&lt;TYPE.AutomationItemObj&gt;</code>
    * [.postRetrieveTasks(metadata)](#Automation.postRetrieveTasks) ⇒ <code>TYPE.AutomationItem</code>
    * [.deploy(metadata, targetBU, retrieveDir)](#Automation.deploy) ⇒ <code>Promise.&lt;TYPE.AutomationMap&gt;</code>
    * [.create(metadata)](#Automation.create) ⇒ <code>Promise</code>
    * [.update(metadata, metadataBefore)](#Automation.update) ⇒ <code>Promise</code>
    * [.preDeployTasks(metadata)](#Automation.preDeployTasks) ⇒ <code>Promise.&lt;TYPE.AutomationItem&gt;</code>
    * [.validateDeployMetadata(metadata)](#Automation.validateDeployMetadata) ⇒ <code>boolean</code>
    * [.postDeployTasks(metadata, originalMetadata)](#Automation.postDeployTasks) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.parseMetadata(metadata)](#Automation.parseMetadata) ⇒ <code>TYPE.AutomationItem</code>
    * [._buildSchedule(scheduleObject)](#Automation._buildSchedule) ⇒ <code>TYPE.AutomationScheduleSoap</code>
    * [._calcTime(offsetServer, dateInput, [offsetInput])](#Automation._calcTime) ⇒ <code>string</code>
    * [.document(buObject, [metadata])](#Automation.document) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.getFilesToCommit(keyArr)](#Automation.getFilesToCommit) ⇒ <code>Array.&lt;string&gt;</code>

<a name="Automation.retrieve"></a>

### Automation.retrieve(retrieveDir, [_], [__], [___], [key]) ⇒ <code>Promise.&lt;TYPE.AutomationMapObj&gt;</code>
Retrieves Metadata of Automation

**Kind**: static method of [<code>Automation</code>](#Automation)  
**Returns**: <code>Promise.&lt;TYPE.AutomationMapObj&gt;</code> - Promise of metadata  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| [_] | <code>void</code> | unused parameter |
| [__] | <code>void</code> | unused parameter |
| [___] | <code>void</code> | unused parameter |
| [key] | <code>string</code> | customer key of single item to retrieve |

<a name="Automation.retrieveChangelog"></a>

### Automation.retrieveChangelog() ⇒ <code>Promise.&lt;TYPE.AutomationMapObj&gt;</code>
Retrieves Metadata of Automation

**Kind**: static method of [<code>Automation</code>](#Automation)  
**Returns**: <code>Promise.&lt;TYPE.AutomationMapObj&gt;</code> - Promise of metadata  
<a name="Automation.retrieveForCache"></a>

### Automation.retrieveForCache() ⇒ <code>Promise.&lt;TYPE.AutomationMapObj&gt;</code>
Retrieves automation metadata for caching

**Kind**: static method of [<code>Automation</code>](#Automation)  
**Returns**: <code>Promise.&lt;TYPE.AutomationMapObj&gt;</code> - Promise of metadata  
<a name="Automation.retrieveAsTemplate"></a>

### Automation.retrieveAsTemplate(templateDir, name, templateVariables) ⇒ <code>Promise.&lt;TYPE.AutomationItemObj&gt;</code>
Retrieve a specific Automation Definition by Name

**Kind**: static method of [<code>Automation</code>](#Automation)  
**Returns**: <code>Promise.&lt;TYPE.AutomationItemObj&gt;</code> - Promise of metadata  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| name | <code>string</code> | name of the metadata file |
| templateVariables | <code>TYPE.TemplateMap</code> | variables to be replaced in the metadata |

<a name="Automation.postRetrieveTasks"></a>

### Automation.postRetrieveTasks(metadata) ⇒ <code>TYPE.AutomationItem</code>
manages post retrieve steps

**Kind**: static method of [<code>Automation</code>](#Automation)  
**Returns**: <code>TYPE.AutomationItem</code> - metadata  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.AutomationItem</code> | a single automation |

<a name="Automation.deploy"></a>

### Automation.deploy(metadata, targetBU, retrieveDir) ⇒ <code>Promise.&lt;TYPE.AutomationMap&gt;</code>
Deploys automation - the saved file is the original one due to large differences required for deployment

**Kind**: static method of [<code>Automation</code>](#Automation)  
**Returns**: <code>Promise.&lt;TYPE.AutomationMap&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.AutomationMap</code> | metadata mapped by their keyField |
| targetBU | <code>string</code> | name/shorthand of target businessUnit for mapping |
| retrieveDir | <code>string</code> | directory where metadata after deploy should be saved |

<a name="Automation.create"></a>

### Automation.create(metadata) ⇒ <code>Promise</code>
Creates a single automation

**Kind**: static method of [<code>Automation</code>](#Automation)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.AutomationItem</code> | single metadata entry |

<a name="Automation.update"></a>

### Automation.update(metadata, metadataBefore) ⇒ <code>Promise</code>
Updates a single automation

**Kind**: static method of [<code>Automation</code>](#Automation)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.AutomationItem</code> | single metadata entry |
| metadataBefore | <code>TYPE.AutomationItem</code> | metadata mapped by their keyField |

<a name="Automation.preDeployTasks"></a>

### Automation.preDeployTasks(metadata) ⇒ <code>Promise.&lt;TYPE.AutomationItem&gt;</code>
Gets executed before deploying metadata

**Kind**: static method of [<code>Automation</code>](#Automation)  
**Returns**: <code>Promise.&lt;TYPE.AutomationItem&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.AutomationItem</code> | metadata mapped by their keyField |

<a name="Automation.validateDeployMetadata"></a>

### Automation.validateDeployMetadata(metadata) ⇒ <code>boolean</code>
Validates the automation to be sure it can be deployed.
Whitelisted Activites are deployed but require configuration

**Kind**: static method of [<code>Automation</code>](#Automation)  
**Returns**: <code>boolean</code> - result if automation can be deployed based on steps  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.AutomationItem</code> | single automation record |

<a name="Automation.postDeployTasks"></a>

### Automation.postDeployTasks(metadata, originalMetadata) ⇒ <code>Promise.&lt;void&gt;</code>
Gets executed after deployment of metadata type

**Kind**: static method of [<code>Automation</code>](#Automation)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.AutomationMap</code> | metadata mapped by their keyField |
| originalMetadata | <code>TYPE.AutomationMap</code> | metadata to be updated (contains additioanl fields) |

<a name="Automation.parseMetadata"></a>

### Automation.parseMetadata(metadata) ⇒ <code>TYPE.AutomationItem</code>
parses retrieved Metadata before saving

**Kind**: static method of [<code>Automation</code>](#Automation)  
**Returns**: <code>TYPE.AutomationItem</code> - parsed item  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.AutomationItem</code> | a single automation definition |

<a name="Automation._buildSchedule"></a>

### Automation.\_buildSchedule(scheduleObject) ⇒ <code>TYPE.AutomationScheduleSoap</code>
Builds a schedule object to be used for scheduling an automation
based on combination of ical string and start/end dates.

**Kind**: static method of [<code>Automation</code>](#Automation)  
**Returns**: <code>TYPE.AutomationScheduleSoap</code> - Schedulable object for soap API (currently not rest supported)  

| Param | Type | Description |
| --- | --- | --- |
| scheduleObject | <code>TYPE.AutomationSchedule</code> | child of automation metadata used for scheduling |

<a name="Automation._calcTime"></a>

### Automation.\_calcTime(offsetServer, dateInput, [offsetInput]) ⇒ <code>string</code>
used to convert dates to the system timezone required for startDate

**Kind**: static method of [<code>Automation</code>](#Automation)  
**Returns**: <code>string</code> - date in server  

| Param | Type | Description |
| --- | --- | --- |
| offsetServer | <code>number</code> | stack4: US Mountain time (UTC-7); other stacks: US Central (UTC-6) |
| dateInput | <code>string</code> \| <code>Date</code> | date in ISO format (2021-12-05T20:00:00.983) |
| [offsetInput] | <code>string</code> | timzone difference (+02:00) |

<a name="Automation.document"></a>

### Automation.document(buObject, [metadata]) ⇒ <code>Promise.&lt;void&gt;</code>
Parses metadata into a readable Markdown/HTML format then saves it

**Kind**: static method of [<code>Automation</code>](#Automation)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| buObject | <code>TYPE.BuObject</code> | properties for auth |
| [metadata] | <code>TYPE.AutomationMap</code> | a list of dataExtension definitions |

<a name="Automation.getFilesToCommit"></a>

### Automation.getFilesToCommit(keyArr) ⇒ <code>Array.&lt;string&gt;</code>
should return only the json for all but asset, query and script that are saved as multiple files
additionally, the documentation for dataExtension and automation should be returned

**Kind**: static method of [<code>Automation</code>](#Automation)  
**Returns**: <code>Array.&lt;string&gt;</code> - list of all files that need to be committed in a flat array ['path/file1.ext', 'path/file2.ext']  

| Param | Type | Description |
| --- | --- | --- |
| keyArr | <code>Array.&lt;string&gt;</code> | customerkey of the metadata |

<a name="Campaign"></a>

## Campaign ⇐ [<code>MetadataType</code>](#MetadataType)
Campaign MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [Campaign](#Campaign) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir, [_], [__], [___], [key])](#Campaign.retrieve) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
    * [.getAssetTags(retrieveDir, id, name)](#Campaign.getAssetTags) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>

<a name="Campaign.retrieve"></a>

### Campaign.retrieve(retrieveDir, [_], [__], [___], [key]) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Retrieves Metadata of campaigns. Afterwards, starts metadata retrieval for their campaign assets

**Kind**: static method of [<code>Campaign</code>](#Campaign)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| [_] | <code>void</code> | unused parameter |
| [__] | <code>void</code> | unused parameter |
| [___] | <code>void</code> | unused parameter |
| [key] | <code>string</code> | customer key of single item to retrieve |

<a name="Campaign.getAssetTags"></a>

### Campaign.getAssetTags(retrieveDir, id, name) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Parses campaign asset response body and returns metadata entries mapped to their id

**Kind**: static method of [<code>Campaign</code>](#Campaign)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Campaign Asset Object  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | folder where to save |
| id | <code>string</code> | of camapaign to retrieve |
| name | <code>string</code> | of camapaign for saving |

<a name="ContentArea"></a>

## ContentArea ⇐ [<code>MetadataType</code>](#MetadataType)
ContentArea MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [ContentArea](#ContentArea) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir, [_], [__], [___], [key])](#ContentArea.retrieve) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
    * [.postRetrieveTasks(metadata)](#ContentArea.postRetrieveTasks) ⇒ <code>TYPE.MetadataTypeItem</code>
    * [.parseMetadata(metadata)](#ContentArea.parseMetadata) ⇒ <code>TYPE.MetadataTypeItem</code>

<a name="ContentArea.retrieve"></a>

### ContentArea.retrieve(retrieveDir, [_], [__], [___], [key]) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata

**Kind**: static method of [<code>ContentArea</code>](#ContentArea)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Promise of metadata  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| [_] | <code>void</code> | unused parameter |
| [__] | <code>void</code> | unused parameter |
| [___] | <code>void</code> | unused parameter |
| [key] | <code>string</code> | customer key of single item to retrieve |

<a name="ContentArea.postRetrieveTasks"></a>

### ContentArea.postRetrieveTasks(metadata) ⇒ <code>TYPE.MetadataTypeItem</code>
manages post retrieve steps

**Kind**: static method of [<code>ContentArea</code>](#ContentArea)  
**Returns**: <code>TYPE.MetadataTypeItem</code> - parsed item  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeItem</code> | a single item |

<a name="ContentArea.parseMetadata"></a>

### ContentArea.parseMetadata(metadata) ⇒ <code>TYPE.MetadataTypeItem</code>
parses retrieved Metadata before saving

**Kind**: static method of [<code>ContentArea</code>](#ContentArea)  
**Returns**: <code>TYPE.MetadataTypeItem</code> - parsed item  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeItem</code> | a single item |

<a name="DataExtension"></a>

## DataExtension ⇐ [<code>MetadataType</code>](#MetadataType)
DataExtension MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [DataExtension](#DataExtension) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.upsert(desToDeploy, _, buObject)](#DataExtension.upsert) ⇒ <code>Promise</code>
    * [._filterUpsertResults(res)](#DataExtension._filterUpsertResults) ⇒ <code>boolean</code>
    * [.create(metadata)](#DataExtension.create) ⇒ <code>Promise</code>
    * [.update(metadata)](#DataExtension.update) ⇒ <code>Promise</code>
    * [.postDeployTasks(upsertedMetadata, originalMetadata)](#DataExtension.postDeployTasks) ⇒ <code>void</code>
    * [.retrieve(retrieveDir, [additionalFields], buObject, [_], [key], [isDeploy])](#DataExtension.retrieve) ⇒ <code>Promise.&lt;{metadata: TYPE.DataExtensionMap, type: string}&gt;</code>
    * [.retrieveChangelog([buObject], [additionalFields])](#DataExtension.retrieveChangelog) ⇒ <code>Promise.&lt;{metadata: TYPE.DataExtensionMap, type: string}&gt;</code>
    * [.postRetrieveTasks(metadata)](#DataExtension.postRetrieveTasks) ⇒ <code>TYPE.DataExtensionItem</code>
    * [.preDeployTasks(metadata)](#DataExtension.preDeployTasks) ⇒ <code>Promise.&lt;TYPE.DataExtensionItem&gt;</code>
    * [.document(buObject, [metadata])](#DataExtension.document) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.deleteByKey(buObject, customerKey)](#DataExtension.deleteByKey) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.postDeleteTasks(buObject, customerKey)](#DataExtension.postDeleteTasks) ⇒ <code>void</code>
    * [.retrieveForCache(buObject, [_], [isDeploy])](#DataExtension.retrieveForCache) ⇒ <code>Promise.&lt;{metadata: TYPE.DataExtensionMap, type: string}&gt;</code>
    * [.retrieveAsTemplate(templateDir, name, templateVariables)](#DataExtension.retrieveAsTemplate) ⇒ <code>Promise.&lt;{metadata: TYPE.DataExtensionMap, type: string}&gt;</code>
    * [.getFilesToCommit(keyArr)](#DataExtension.getFilesToCommit) ⇒ <code>Array.&lt;string&gt;</code>

<a name="DataExtension.upsert"></a>

### DataExtension.upsert(desToDeploy, _, buObject) ⇒ <code>Promise</code>
Upserts dataExtensions after retrieving them from source and target to compare
if create or update operation is needed.

**Kind**: static method of [<code>DataExtension</code>](#DataExtension)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| desToDeploy | <code>TYPE.DataExtensionMap</code> | dataExtensions mapped by their customerKey |
| _ | <code>void</code> | unused parameter |
| buObject | <code>TYPE.BuObject</code> | properties for auth |

<a name="DataExtension._filterUpsertResults"></a>

### DataExtension.\_filterUpsertResults(res) ⇒ <code>boolean</code>
helper for upsert()

**Kind**: static method of [<code>DataExtension</code>](#DataExtension)  
**Returns**: <code>boolean</code> - true: keep, false: discard  

| Param | Type | Description |
| --- | --- | --- |
| res | <code>object</code> | - |

<a name="DataExtension.create"></a>

### DataExtension.create(metadata) ⇒ <code>Promise</code>
Create a single dataExtension. Also creates their columns in 'dataExtension.columns'

**Kind**: static method of [<code>DataExtension</code>](#DataExtension)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.DataExtensionItem</code> | single metadata entry |

<a name="DataExtension.update"></a>

### DataExtension.update(metadata) ⇒ <code>Promise</code>
Updates a single dataExtension. Also updates their columns in 'dataExtension.columns'

**Kind**: static method of [<code>DataExtension</code>](#DataExtension)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.DataExtensionItem</code> | single metadata entry |

<a name="DataExtension.postDeployTasks"></a>

### DataExtension.postDeployTasks(upsertedMetadata, originalMetadata) ⇒ <code>void</code>
Gets executed after deployment of metadata type

**Kind**: static method of [<code>DataExtension</code>](#DataExtension)  

| Param | Type | Description |
| --- | --- | --- |
| upsertedMetadata | <code>TYPE.DataExtensionMap</code> | metadata mapped by their keyField |
| originalMetadata | <code>TYPE.DataExtensionMap</code> | metadata to be updated (contains additioanl fields) |

<a name="DataExtension.retrieve"></a>

### DataExtension.retrieve(retrieveDir, [additionalFields], buObject, [_], [key], [isDeploy]) ⇒ <code>Promise.&lt;{metadata: TYPE.DataExtensionMap, type: string}&gt;</code>
Retrieves dataExtension metadata. Afterwards starts retrieval of dataExtensionColumn metadata retrieval

**Kind**: static method of [<code>DataExtension</code>](#DataExtension)  
**Returns**: <code>Promise.&lt;{metadata: TYPE.DataExtensionMap, type: string}&gt;</code> - Promise of item map  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| [additionalFields] | <code>Array.&lt;string&gt;</code> | Returns specified fields even if their retrieve definition is not set to true |
| buObject | <code>TYPE.BuObject</code> | properties for auth |
| [_] | <code>void</code> | unused parameter |
| [key] | <code>string</code> | customer key of single item to retrieve |
| [isDeploy] | <code>boolean</code> | used to signal that fields shall be retrieve in caching mode |

<a name="DataExtension.retrieveChangelog"></a>

### DataExtension.retrieveChangelog([buObject], [additionalFields]) ⇒ <code>Promise.&lt;{metadata: TYPE.DataExtensionMap, type: string}&gt;</code>
Retrieves dataExtension metadata. Afterwards starts retrieval of dataExtensionColumn metadata retrieval

**Kind**: static method of [<code>DataExtension</code>](#DataExtension)  
**Returns**: <code>Promise.&lt;{metadata: TYPE.DataExtensionMap, type: string}&gt;</code> - Promise of item map  

| Param | Type | Description |
| --- | --- | --- |
| [buObject] | <code>TYPE.BuObject</code> | properties for auth |
| [additionalFields] | <code>Array.&lt;string&gt;</code> | Returns specified fields even if their retrieve definition is not set to true |

<a name="DataExtension.postRetrieveTasks"></a>

### DataExtension.postRetrieveTasks(metadata) ⇒ <code>TYPE.DataExtensionItem</code>
manages post retrieve steps

**Kind**: static method of [<code>DataExtension</code>](#DataExtension)  
**Returns**: <code>TYPE.DataExtensionItem</code> - metadata  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.DataExtensionItem</code> | a single dataExtension |

<a name="DataExtension.preDeployTasks"></a>

### DataExtension.preDeployTasks(metadata) ⇒ <code>Promise.&lt;TYPE.DataExtensionItem&gt;</code>
prepares a DataExtension for deployment

**Kind**: static method of [<code>DataExtension</code>](#DataExtension)  
**Returns**: <code>Promise.&lt;TYPE.DataExtensionItem&gt;</code> - Promise of updated single DE  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.DataExtensionItem</code> | a single data Extension |

<a name="DataExtension.document"></a>

### DataExtension.document(buObject, [metadata]) ⇒ <code>Promise.&lt;void&gt;</code>
Parses metadata into a readable Markdown/HTML format then saves it

**Kind**: static method of [<code>DataExtension</code>](#DataExtension)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| buObject | <code>TYPE.BuObject</code> | properties for auth |
| [metadata] | <code>TYPE.DataExtensionMap</code> | a list of dataExtension definitions |

<a name="DataExtension.deleteByKey"></a>

### DataExtension.deleteByKey(buObject, customerKey) ⇒ <code>Promise.&lt;boolean&gt;</code>
Delete a metadata item from the specified business unit

**Kind**: static method of [<code>DataExtension</code>](#DataExtension)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - deletion success status  

| Param | Type | Description |
| --- | --- | --- |
| buObject | <code>TYPE.BuObject</code> | references credentials |
| customerKey | <code>string</code> | Identifier of data extension |

<a name="DataExtension.postDeleteTasks"></a>

### DataExtension.postDeleteTasks(buObject, customerKey) ⇒ <code>void</code>
clean up after deleting a metadata item

**Kind**: static method of [<code>DataExtension</code>](#DataExtension)  
**Returns**: <code>void</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| buObject | <code>TYPE.BuObject</code> | references credentials |
| customerKey | <code>string</code> | Identifier of metadata item |

<a name="DataExtension.retrieveForCache"></a>

### DataExtension.retrieveForCache(buObject, [_], [isDeploy]) ⇒ <code>Promise.&lt;{metadata: TYPE.DataExtensionMap, type: string}&gt;</code>
Retrieves folder metadata into local filesystem. Also creates a uniquePath attribute for each folder.

**Kind**: static method of [<code>DataExtension</code>](#DataExtension)  
**Returns**: <code>Promise.&lt;{metadata: TYPE.DataExtensionMap, type: string}&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| buObject | <code>TYPE.BuObject</code> | properties for auth |
| [_] | <code>void</code> | - |
| [isDeploy] | <code>boolean</code> | used to signal that fields shall be retrieve in caching mode |

<a name="DataExtension.retrieveAsTemplate"></a>

### DataExtension.retrieveAsTemplate(templateDir, name, templateVariables) ⇒ <code>Promise.&lt;{metadata: TYPE.DataExtensionMap, type: string}&gt;</code>
Retrieves dataExtension metadata in template format.

**Kind**: static method of [<code>DataExtension</code>](#DataExtension)  
**Returns**: <code>Promise.&lt;{metadata: TYPE.DataExtensionMap, type: string}&gt;</code> - Promise of items  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| name | <code>string</code> | name of the metadata item |
| templateVariables | <code>TYPE.TemplateMap</code> | variables to be replaced in the metadata |

<a name="DataExtension.getFilesToCommit"></a>

### DataExtension.getFilesToCommit(keyArr) ⇒ <code>Array.&lt;string&gt;</code>
should return only the json for all but asset, query and script that are saved as multiple files
additionally, the documentation for dataExtension and automation should be returned

**Kind**: static method of [<code>DataExtension</code>](#DataExtension)  
**Returns**: <code>Array.&lt;string&gt;</code> - list of all files that need to be committed in a flat array ['path/file1.ext', 'path/file2.ext']  

| Param | Type | Description |
| --- | --- | --- |
| keyArr | <code>Array.&lt;string&gt;</code> | customerkey of the metadata |

<a name="DataExtensionField"></a>

## DataExtensionField ⇐ [<code>MetadataType</code>](#MetadataType)
DataExtensionField MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [DataExtensionField](#DataExtensionField) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir, [additionalFields], buObject)](#DataExtensionField.retrieve) ⇒ <code>Promise.&lt;{metadata: TYPE.DataExtensionFieldMap, type: string}&gt;</code>
    * [.retrieveForCache([requestParams], [additionalFields])](#DataExtensionField.retrieveForCache) ⇒ <code>Promise.&lt;{metadata: TYPE.DataExtensionFieldMap, type: string}&gt;</code>
    * [.convertToSortedArray(fieldsObj)](#DataExtensionField.convertToSortedArray) ⇒ <code>Array.&lt;TYPE.DataExtensionFieldItem&gt;</code>
    * [.sortDeFields(a, b)](#DataExtensionField.sortDeFields) ⇒ <code>boolean</code>
    * [.postRetrieveTasks(metadata, forDataExtension)](#DataExtensionField.postRetrieveTasks) ⇒ <code>TYPE.DataExtensionFieldItem</code>
    * [.prepareDeployColumnsOnUpdate(deployColumns, deKey)](#DataExtensionField.prepareDeployColumnsOnUpdate) ⇒ <code>Object.&lt;string, TYPE.DataExtensionFieldItem&gt;</code>
    * [.deleteByKey(buObject, customerKey)](#DataExtensionField.deleteByKey) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.deleteByKeySOAP(buObject, customerKey, [handleOutside])](#DataExtensionField.deleteByKeySOAP) ⇒ <code>boolean</code>
    * [.postDeleteTasks(customerKey)](#DataExtensionField.postDeleteTasks) ⇒ <code>void</code>

<a name="DataExtensionField.retrieve"></a>

### DataExtensionField.retrieve(retrieveDir, [additionalFields], buObject) ⇒ <code>Promise.&lt;{metadata: TYPE.DataExtensionFieldMap, type: string}&gt;</code>
Retrieves all records and saves it to disk

**Kind**: static method of [<code>DataExtensionField</code>](#DataExtensionField)  
**Returns**: <code>Promise.&lt;{metadata: TYPE.DataExtensionFieldMap, type: string}&gt;</code> - Promise of items  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| [additionalFields] | <code>Array.&lt;string&gt;</code> | Returns specified fields even if their retrieve definition is not set to true |
| buObject | <code>TYPE.BuObject</code> | properties for auth |

<a name="DataExtensionField.retrieveForCache"></a>

### DataExtensionField.retrieveForCache([requestParams], [additionalFields]) ⇒ <code>Promise.&lt;{metadata: TYPE.DataExtensionFieldMap, type: string}&gt;</code>
Retrieves all records for caching

**Kind**: static method of [<code>DataExtensionField</code>](#DataExtensionField)  
**Returns**: <code>Promise.&lt;{metadata: TYPE.DataExtensionFieldMap, type: string}&gt;</code> - Promise of items  

| Param | Type | Description |
| --- | --- | --- |
| [requestParams] | <code>TYPE.SoapRequestParams</code> | required for the specific request (filter for example) |
| [additionalFields] | <code>Array.&lt;string&gt;</code> | Returns specified fields even if their retrieve definition is not set to true |

<a name="DataExtensionField.convertToSortedArray"></a>

### DataExtensionField.convertToSortedArray(fieldsObj) ⇒ <code>Array.&lt;TYPE.DataExtensionFieldItem&gt;</code>
helper for DataExtension.js that sorts the fields into an array

**Kind**: static method of [<code>DataExtensionField</code>](#DataExtensionField)  
**Returns**: <code>Array.&lt;TYPE.DataExtensionFieldItem&gt;</code> - sorted array of field objects  

| Param | Type | Description |
| --- | --- | --- |
| fieldsObj | <code>TYPE.DataExtensionFieldMap</code> | customerKey-based list of fields for one dataExtension |

<a name="DataExtensionField.sortDeFields"></a>

### DataExtensionField.sortDeFields(a, b) ⇒ <code>boolean</code>
sorting method to ensure `Ordinal` is respected

**Kind**: static method of [<code>DataExtensionField</code>](#DataExtensionField)  
**Returns**: <code>boolean</code> - sorting based on Ordinal  

| Param | Type | Description |
| --- | --- | --- |
| a | <code>TYPE.DataExtensionFieldItem</code> | - |
| b | <code>TYPE.DataExtensionFieldItem</code> | - |

<a name="DataExtensionField.postRetrieveTasks"></a>

### DataExtensionField.postRetrieveTasks(metadata, forDataExtension) ⇒ <code>TYPE.DataExtensionFieldItem</code>
manages post retrieve steps

**Kind**: static method of [<code>DataExtensionField</code>](#DataExtensionField)  
**Returns**: <code>TYPE.DataExtensionFieldItem</code> - metadata  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.DataExtensionFieldItem</code> | a single item |
| forDataExtension | <code>boolean</code> | when used by DataExtension class we remove more fields |

<a name="DataExtensionField.prepareDeployColumnsOnUpdate"></a>

### DataExtensionField.prepareDeployColumnsOnUpdate(deployColumns, deKey) ⇒ <code>Object.&lt;string, TYPE.DataExtensionFieldItem&gt;</code>
Mofifies passed deployColumns for update by mapping ObjectID to their target column's values.
Removes FieldType field if its the same in deploy and target column, because it results in an error even if its of the same type

**Kind**: static method of [<code>DataExtensionField</code>](#DataExtensionField)  
**Returns**: <code>Object.&lt;string, TYPE.DataExtensionFieldItem&gt;</code> - existing fields by their original name to allow re-adding FieldType after update  

| Param | Type | Description |
| --- | --- | --- |
| deployColumns | <code>Array.&lt;TYPE.DataExtensionFieldItem&gt;</code> | Columns of data extension that will be deployed |
| deKey | <code>string</code> | external/customer key of Data Extension |

<a name="DataExtensionField.deleteByKey"></a>

### DataExtensionField.deleteByKey(buObject, customerKey) ⇒ <code>Promise.&lt;boolean&gt;</code>
Delete a metadata item from the specified business unit

**Kind**: static method of [<code>DataExtensionField</code>](#DataExtensionField)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - deletion success status  

| Param | Type | Description |
| --- | --- | --- |
| buObject | <code>TYPE.BuObject</code> | references credentials |
| customerKey | <code>string</code> | Identifier of data extension |

<a name="DataExtensionField.deleteByKeySOAP"></a>

### DataExtensionField.deleteByKeySOAP(buObject, customerKey, [handleOutside]) ⇒ <code>boolean</code>
Delete a data extension from the specified business unit

**Kind**: static method of [<code>DataExtensionField</code>](#DataExtensionField)  
**Returns**: <code>boolean</code> - deletion success flag  

| Param | Type | Description |
| --- | --- | --- |
| buObject | <code>TYPE.BuObject</code> | references credentials |
| customerKey | <code>string</code> | Identifier of metadata |
| [handleOutside] | <code>boolean</code> | if the API reponse is irregular this allows you to handle it outside of this generic method |

<a name="DataExtensionField.postDeleteTasks"></a>

### DataExtensionField.postDeleteTasks(customerKey) ⇒ <code>void</code>
clean up after deleting a metadata item

**Kind**: static method of [<code>DataExtensionField</code>](#DataExtensionField)  
**Returns**: <code>void</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| customerKey | <code>string</code> | Identifier of metadata item |

<a name="DataExtensionTemplate"></a>

## DataExtensionTemplate ⇐ [<code>MetadataType</code>](#MetadataType)
DataExtensionTemplate MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  
<a name="DataExtensionTemplate.retrieve"></a>

### DataExtensionTemplate.retrieve(retrieveDir, [_], [__], [___], [key]) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata

**Kind**: static method of [<code>DataExtensionTemplate</code>](#DataExtensionTemplate)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Promise of metadata  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| [_] | <code>void</code> | unused parameter |
| [__] | <code>void</code> | unused parameter |
| [___] | <code>void</code> | unused parameter |
| [key] | <code>string</code> | customer key of single item to retrieve |

<a name="DataExtract"></a>

## DataExtract ⇐ [<code>MetadataType</code>](#MetadataType)
DataExtract MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [DataExtract](#DataExtract) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir, [_], [__], [___], [key])](#DataExtract.retrieve) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
    * [.retrieveForCache()](#DataExtract.retrieveForCache) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
    * [.retrieveAsTemplate(templateDir, name, templateVariables)](#DataExtract.retrieveAsTemplate) ⇒ <code>Promise.&lt;TYPE.MetadataTypeItemObj&gt;</code>
    * [.postRetrieveTasks(fileTransfer)](#DataExtract.postRetrieveTasks) ⇒ <code>TYPE.MetadataTypeItem</code>
    * [.create(dataExtract)](#DataExtract.create) ⇒ <code>Promise</code>
    * [.update(dataExtract)](#DataExtract.update) ⇒ <code>Promise</code>
    * [.preDeployTasks(metadata)](#DataExtract.preDeployTasks) ⇒ <code>TYPE.MetadataTypeItem</code>
    * [.parseMetadata(metadata)](#DataExtract.parseMetadata) ⇒ <code>TYPE.MetadataTypeItem</code>

<a name="DataExtract.retrieve"></a>

### DataExtract.retrieve(retrieveDir, [_], [__], [___], [key]) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Retrieves Metadata of Data Extract Activity.
Endpoint /automation/v1/dataextracts/ returns all Data Extracts

**Kind**: static method of [<code>DataExtract</code>](#DataExtract)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Promise of metadata  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| [_] | <code>void</code> | unused parameter |
| [__] | <code>void</code> | unused parameter |
| [___] | <code>void</code> | unused parameter |
| [key] | <code>string</code> | customer key of single item to retrieve |

<a name="DataExtract.retrieveForCache"></a>

### DataExtract.retrieveForCache() ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Retrieves Metadata of  Data Extract Activity for caching

**Kind**: static method of [<code>DataExtract</code>](#DataExtract)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Promise of metadata  
<a name="DataExtract.retrieveAsTemplate"></a>

### DataExtract.retrieveAsTemplate(templateDir, name, templateVariables) ⇒ <code>Promise.&lt;TYPE.MetadataTypeItemObj&gt;</code>
Retrieve a specific dataExtract Definition by Name

**Kind**: static method of [<code>DataExtract</code>](#DataExtract)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeItemObj&gt;</code> - Promise of metadata  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| name | <code>string</code> | name of the metadata file |
| templateVariables | <code>TYPE.TemplateMap</code> | variables to be replaced in the metadata |

<a name="DataExtract.postRetrieveTasks"></a>

### DataExtract.postRetrieveTasks(fileTransfer) ⇒ <code>TYPE.MetadataTypeItem</code>
manages post retrieve steps

**Kind**: static method of [<code>DataExtract</code>](#DataExtract)  
**Returns**: <code>TYPE.MetadataTypeItem</code> - metadata  

| Param | Type | Description |
| --- | --- | --- |
| fileTransfer | <code>TYPE.MetadataTypeItem</code> | a single fileTransfer |

<a name="DataExtract.create"></a>

### DataExtract.create(dataExtract) ⇒ <code>Promise</code>
Creates a single Data Extract

**Kind**: static method of [<code>DataExtract</code>](#DataExtract)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| dataExtract | <code>TYPE.MetadataTypeItem</code> | a single Data Extract |

<a name="DataExtract.update"></a>

### DataExtract.update(dataExtract) ⇒ <code>Promise</code>
Updates a single Data Extract

**Kind**: static method of [<code>DataExtract</code>](#DataExtract)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| dataExtract | <code>TYPE.MetadataTypeItem</code> | a single Data Extract |

<a name="DataExtract.preDeployTasks"></a>

### DataExtract.preDeployTasks(metadata) ⇒ <code>TYPE.MetadataTypeItem</code>
prepares a dataExtract for deployment

**Kind**: static method of [<code>DataExtract</code>](#DataExtract)  
**Returns**: <code>TYPE.MetadataTypeItem</code> - metadata object  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeItem</code> | a single dataExtract activity definition |

<a name="DataExtract.parseMetadata"></a>

### DataExtract.parseMetadata(metadata) ⇒ <code>TYPE.MetadataTypeItem</code>
parses retrieved Metadata before saving

**Kind**: static method of [<code>DataExtract</code>](#DataExtract)  
**Returns**: <code>TYPE.MetadataTypeItem</code> - Array with one metadata object and one sql string  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeItem</code> | a single dataExtract activity definition |

<a name="DataExtractType"></a>

## DataExtractType ⇐ [<code>MetadataType</code>](#MetadataType)
DataExtractType MetadataType
Only for Caching No retrieve/upsert is required
as this is a configuration in the EID

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [DataExtractType](#DataExtractType) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir, [_], [__], [___], [key])](#DataExtractType.retrieve) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
    * [.retrieveForCache()](#DataExtractType.retrieveForCache) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>

<a name="DataExtractType.retrieve"></a>

### DataExtractType.retrieve(retrieveDir, [_], [__], [___], [key]) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Retrieves Metadata of  Data Extract Type.

**Kind**: static method of [<code>DataExtractType</code>](#DataExtractType)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Promise of metadata  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| [_] | <code>void</code> | unused parameter |
| [__] | <code>void</code> | unused parameter |
| [___] | <code>void</code> | unused parameter |
| [key] | <code>string</code> | customer key of single item to retrieve |

<a name="DataExtractType.retrieveForCache"></a>

### DataExtractType.retrieveForCache() ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Retrieves Metadata of  Data Extract Type for caching.

**Kind**: static method of [<code>DataExtractType</code>](#DataExtractType)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Promise of metadata  
<a name="Discovery"></a>

## Discovery ⇐ [<code>MetadataType</code>](#MetadataType)
ImportFile MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  
<a name="Discovery.retrieve"></a>

### Discovery.retrieve(retrieveDir, [_], buObject, [___], [key]) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Retrieves API endpoint
documentation: https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-apis.meta/mc-apis/routes.htm

**Kind**: static method of [<code>Discovery</code>](#Discovery)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| [_] | <code>void</code> | not used |
| buObject | <code>TYPE.BuObject</code> | properties for auth |
| [___] | <code>void</code> | unused parameter |
| [key] | <code>string</code> | customer key of single item to retrieve |

<a name="Email"></a>

## Email ⇐ [<code>MetadataType</code>](#MetadataType)
Email MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [Email](#Email) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir, [_], [__], [___], [key])](#Email.retrieve) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
    * [.postRetrieveTasks(metadata)](#Email.postRetrieveTasks) ⇒ <code>TYPE.MetadataTypeItem</code>
    * [.parseMetadata(metadata)](#Email.parseMetadata) ⇒ <code>TYPE.MetadataTypeItem</code>

<a name="Email.retrieve"></a>

### Email.retrieve(retrieveDir, [_], [__], [___], [key]) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata

**Kind**: static method of [<code>Email</code>](#Email)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Promise of metadata  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| [_] | <code>void</code> | unused parameter |
| [__] | <code>void</code> | unused parameter |
| [___] | <code>void</code> | unused parameter |
| [key] | <code>string</code> | customer key of single item to retrieve |

<a name="Email.postRetrieveTasks"></a>

### Email.postRetrieveTasks(metadata) ⇒ <code>TYPE.MetadataTypeItem</code>
manages post retrieve steps

**Kind**: static method of [<code>Email</code>](#Email)  
**Returns**: <code>TYPE.MetadataTypeItem</code> - Array with one metadata object and one query string  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeItem</code> | a single query |

<a name="Email.parseMetadata"></a>

### Email.parseMetadata(metadata) ⇒ <code>TYPE.MetadataTypeItem</code>
parses retrieved Metadata before saving

**Kind**: static method of [<code>Email</code>](#Email)  
**Returns**: <code>TYPE.MetadataTypeItem</code> - Array with one metadata object and one sql string  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeItem</code> | a single query activity definition |

<a name="EmailSendDefinition"></a>

## EmailSendDefinition ⇐ [<code>MetadataType</code>](#MetadataType)
MessageSendActivity MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [EmailSendDefinition](#EmailSendDefinition) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir, [_], [__], [___], [key])](#EmailSendDefinition.retrieve) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
    * [.update(metadataItem)](#EmailSendDefinition.update) ⇒ <code>Promise</code>
    * [.create(metadataItem)](#EmailSendDefinition.create) ⇒ <code>Promise</code>
    * [.deleteByKey(buObject, customerKey)](#EmailSendDefinition.deleteByKey) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.preDeployTasks(metadata)](#EmailSendDefinition.preDeployTasks) ⇒ <code>Promise.&lt;TYPE.MetadataTypeItem&gt;</code>
    * [.postRetrieveTasks(metadata)](#EmailSendDefinition.postRetrieveTasks) ⇒ <code>TYPE.MetadataTypeItem</code>
    * [.parseMetadata(metadata)](#EmailSendDefinition.parseMetadata) ⇒ <code>TYPE.MetadataTypeItem</code>

<a name="EmailSendDefinition.retrieve"></a>

### EmailSendDefinition.retrieve(retrieveDir, [_], [__], [___], [key]) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata

**Kind**: static method of [<code>EmailSendDefinition</code>](#EmailSendDefinition)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Promise of metadata  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| [_] | <code>void</code> | unused parameter |
| [__] | <code>void</code> | unused parameter |
| [___] | <code>void</code> | unused parameter |
| [key] | <code>string</code> | customer key of single item to retrieve |

<a name="EmailSendDefinition.update"></a>

### EmailSendDefinition.update(metadataItem) ⇒ <code>Promise</code>
Updates a single item

**Kind**: static method of [<code>EmailSendDefinition</code>](#EmailSendDefinition)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadataItem | <code>TYPE.MetadataTypeItem</code> | a single item |

<a name="EmailSendDefinition.create"></a>

### EmailSendDefinition.create(metadataItem) ⇒ <code>Promise</code>
Creates a single item

**Kind**: static method of [<code>EmailSendDefinition</code>](#EmailSendDefinition)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadataItem | <code>TYPE.MetadataTypeItem</code> | a single item |

<a name="EmailSendDefinition.deleteByKey"></a>

### EmailSendDefinition.deleteByKey(buObject, customerKey) ⇒ <code>Promise.&lt;boolean&gt;</code>
Delete a metadata item from the specified business unit

**Kind**: static method of [<code>EmailSendDefinition</code>](#EmailSendDefinition)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - deletion success status  

| Param | Type | Description |
| --- | --- | --- |
| buObject | <code>TYPE.BuObject</code> | references credentials |
| customerKey | <code>string</code> | Identifier of data extension |

<a name="EmailSendDefinition.preDeployTasks"></a>

### EmailSendDefinition.preDeployTasks(metadata) ⇒ <code>Promise.&lt;TYPE.MetadataTypeItem&gt;</code>
prepares a single item for deployment

**Kind**: static method of [<code>EmailSendDefinition</code>](#EmailSendDefinition)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeItem&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeItem</code> | a single script activity definition |

<a name="EmailSendDefinition.postRetrieveTasks"></a>

### EmailSendDefinition.postRetrieveTasks(metadata) ⇒ <code>TYPE.MetadataTypeItem</code>
manages post retrieve steps

**Kind**: static method of [<code>EmailSendDefinition</code>](#EmailSendDefinition)  
**Returns**: <code>TYPE.MetadataTypeItem</code> - Array with one metadata object and one query string  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeItem</code> | a single query |

<a name="EmailSendDefinition.parseMetadata"></a>

### EmailSendDefinition.parseMetadata(metadata) ⇒ <code>TYPE.MetadataTypeItem</code>
parses retrieved Metadata before saving

**Kind**: static method of [<code>EmailSendDefinition</code>](#EmailSendDefinition)  
**Returns**: <code>TYPE.MetadataTypeItem</code> - Array with one metadata object and one sql string  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeItem</code> | a single query activity definition |

<a name="EventDefinition"></a>

## EventDefinition ⇐ [<code>MetadataType</code>](#MetadataType)
EventDefinition MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [EventDefinition](#EventDefinition) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir, [_], [__], [___], [key])](#EventDefinition.retrieve) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
    * [.retrieveForCache()](#EventDefinition.retrieveForCache) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
    * [.retrieveAsTemplate(templateDir, name, templateVariables)](#EventDefinition.retrieveAsTemplate) ⇒ <code>Promise.&lt;TYPE.MetadataTypeItemObj&gt;</code>
    * [.postRetrieveTasks(eventDef)](#EventDefinition.postRetrieveTasks) ⇒ <code>TYPE.MetadataTypeItem</code>
    * [.create(EventDefinition)](#EventDefinition.create) ⇒ <code>Promise</code>
    * [.update(metadataEntry)](#EventDefinition.update) ⇒ <code>Promise</code>
    * [.preDeployTasks(metadata)](#EventDefinition.preDeployTasks) ⇒ <code>TYPE.MetadataTypeItem</code>
    * [.parseMetadata(metadata)](#EventDefinition.parseMetadata) ⇒ <code>TYPE.MetadataTypeItem</code>

<a name="EventDefinition.retrieve"></a>

### EventDefinition.retrieve(retrieveDir, [_], [__], [___], [key]) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Retrieves Metadata of Event Definition.
Endpoint /interaction/v1/EventDefinitions return all Event Definitions with all details.
Currently it is not needed to loop over Imports with endpoint /interaction/v1/EventDefinitions/{id}

**Kind**: static method of [<code>EventDefinition</code>](#EventDefinition)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Promise of metadata  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| [_] | <code>void</code> | unused parameter |
| [__] | <code>void</code> | unused parameter |
| [___] | <code>void</code> | unused parameter |
| [key] | <code>string</code> | customer key of single item to retrieve |

<a name="EventDefinition.retrieveForCache"></a>

### EventDefinition.retrieveForCache() ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Retrieves event definition metadata for caching

**Kind**: static method of [<code>EventDefinition</code>](#EventDefinition)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Promise of metadata  
<a name="EventDefinition.retrieveAsTemplate"></a>

### EventDefinition.retrieveAsTemplate(templateDir, name, templateVariables) ⇒ <code>Promise.&lt;TYPE.MetadataTypeItemObj&gt;</code>
Retrieve a specific Event Definition by Name

**Kind**: static method of [<code>EventDefinition</code>](#EventDefinition)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeItemObj&gt;</code> - Promise of metadata  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| name | <code>string</code> | name of the metadata file |
| templateVariables | <code>TYPE.TemplateMap</code> | variables to be replaced in the metadata |

<a name="EventDefinition.postRetrieveTasks"></a>

### EventDefinition.postRetrieveTasks(eventDef) ⇒ <code>TYPE.MetadataTypeItem</code>
manages post retrieve steps

**Kind**: static method of [<code>EventDefinition</code>](#EventDefinition)  
**Returns**: <code>TYPE.MetadataTypeItem</code> - metadata  

| Param | Type | Description |
| --- | --- | --- |
| eventDef | <code>TYPE.MetadataTypeItem</code> | a single item of Event Definition |

<a name="EventDefinition.create"></a>

### EventDefinition.create(EventDefinition) ⇒ <code>Promise</code>
Creates a single Event Definition

**Kind**: static method of [<code>EventDefinition</code>](#EventDefinition)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| EventDefinition | <code>TYPE.MetadataTypeItem</code> | a single Event Definition |

<a name="EventDefinition.update"></a>

### EventDefinition.update(metadataEntry) ⇒ <code>Promise</code>
Updates a single Event Definition (using PUT method since PATCH isn't supported)

**Kind**: static method of [<code>EventDefinition</code>](#EventDefinition)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadataEntry | <code>TYPE.MetadataTypeItem</code> | a single Event Definition |

<a name="EventDefinition.preDeployTasks"></a>

### EventDefinition.preDeployTasks(metadata) ⇒ <code>TYPE.MetadataTypeItem</code>
prepares an event definition for deployment

**Kind**: static method of [<code>EventDefinition</code>](#EventDefinition)  
**Returns**: <code>TYPE.MetadataTypeItem</code> - parsed version  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeItem</code> | a single eventDefinition |

<a name="EventDefinition.parseMetadata"></a>

### EventDefinition.parseMetadata(metadata) ⇒ <code>TYPE.MetadataTypeItem</code>
parses retrieved Metadata before saving

**Kind**: static method of [<code>EventDefinition</code>](#EventDefinition)  
**Returns**: <code>TYPE.MetadataTypeItem</code> - parsed metadata  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeItem</code> | a single event definition |

<a name="FileTransfer"></a>

## FileTransfer ⇐ [<code>MetadataType</code>](#MetadataType)
FileTransfer MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [FileTransfer](#FileTransfer) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir, [_], [__], [___], [key])](#FileTransfer.retrieve) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
    * [.retrieveForCache()](#FileTransfer.retrieveForCache) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
    * [.retrieveAsTemplate(templateDir, name, templateVariables)](#FileTransfer.retrieveAsTemplate) ⇒ <code>Promise.&lt;TYPE.MetadataTypeItemObj&gt;</code>
    * [.postRetrieveTasks(metadata)](#FileTransfer.postRetrieveTasks) ⇒ <code>Array.&lt;object&gt;</code>
    * [.create(fileTransfer)](#FileTransfer.create) ⇒ <code>Promise</code>
    * [.update(fileTransfer)](#FileTransfer.update) ⇒ <code>Promise</code>
    * [.preDeployTasks(metadata)](#FileTransfer.preDeployTasks) ⇒ <code>Promise</code>
    * [.parseMetadata(metadata)](#FileTransfer.parseMetadata) ⇒ <code>TYPE.MetadataTypeItem</code>

<a name="FileTransfer.retrieve"></a>

### FileTransfer.retrieve(retrieveDir, [_], [__], [___], [key]) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Retrieves Metadata of FileTransfer Activity.
Endpoint /automation/v1/filetransfers/ returns all File Transfers

**Kind**: static method of [<code>FileTransfer</code>](#FileTransfer)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| [_] | <code>void</code> | unused parameter |
| [__] | <code>void</code> | unused parameter |
| [___] | <code>void</code> | unused parameter |
| [key] | <code>string</code> | customer key of single item to retrieve |

<a name="FileTransfer.retrieveForCache"></a>

### FileTransfer.retrieveForCache() ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Retrieves Metadata of  FileTransfer Activity for caching

**Kind**: static method of [<code>FileTransfer</code>](#FileTransfer)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Promise  
<a name="FileTransfer.retrieveAsTemplate"></a>

### FileTransfer.retrieveAsTemplate(templateDir, name, templateVariables) ⇒ <code>Promise.&lt;TYPE.MetadataTypeItemObj&gt;</code>
Retrieve a specific File Transfer Definition by Name

**Kind**: static method of [<code>FileTransfer</code>](#FileTransfer)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeItemObj&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| name | <code>string</code> | name of the metadata file |
| templateVariables | <code>TYPE.TemplateMap</code> | variables to be replaced in the metadata |

<a name="FileTransfer.postRetrieveTasks"></a>

### FileTransfer.postRetrieveTasks(metadata) ⇒ <code>Array.&lt;object&gt;</code>
manages post retrieve steps

**Kind**: static method of [<code>FileTransfer</code>](#FileTransfer)  
**Returns**: <code>Array.&lt;object&gt;</code> - metadata  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeItem</code> | a single fileTransfer activity definition |

<a name="FileTransfer.create"></a>

### FileTransfer.create(fileTransfer) ⇒ <code>Promise</code>
Creates a single File Transfer

**Kind**: static method of [<code>FileTransfer</code>](#FileTransfer)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| fileTransfer | <code>TYPE.MetadataTypeItem</code> | a single File Transfer |

<a name="FileTransfer.update"></a>

### FileTransfer.update(fileTransfer) ⇒ <code>Promise</code>
Updates a single File Transfer

**Kind**: static method of [<code>FileTransfer</code>](#FileTransfer)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| fileTransfer | <code>TYPE.MetadataTypeItem</code> | a single File Transfer |

<a name="FileTransfer.preDeployTasks"></a>

### FileTransfer.preDeployTasks(metadata) ⇒ <code>Promise</code>
prepares a fileTransfer for deployment

**Kind**: static method of [<code>FileTransfer</code>](#FileTransfer)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeItem</code> | a single fileTransfer activity definition |

<a name="FileTransfer.parseMetadata"></a>

### FileTransfer.parseMetadata(metadata) ⇒ <code>TYPE.MetadataTypeItem</code>
parses retrieved Metadata before saving

**Kind**: static method of [<code>FileTransfer</code>](#FileTransfer)  
**Returns**: <code>TYPE.MetadataTypeItem</code> - parsed metadata  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeItem</code> | a single fileTransfer activity definition |

<a name="Filter"></a>

## Filter ⇐ [<code>MetadataType</code>](#MetadataType)
Filter MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  
<a name="Filter.retrieve"></a>

### Filter.retrieve(retrieveDir, [_], [__], [___], [key]) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Retrieves Metadata of Filter.
Endpoint /automation/v1/filters/ returns all Filters,
but only with some of the fields. So it is needed to loop over
Filters with the endpoint /automation/v1/filters/{id}

**Kind**: static method of [<code>Filter</code>](#Filter)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| [_] | <code>void</code> | unused parameter |
| [__] | <code>void</code> | unused parameter |
| [___] | <code>void</code> | unused parameter |
| [key] | <code>string</code> | customer key of single item to retrieve |

<a name="Folder"></a>

## Folder ⇐ [<code>MetadataType</code>](#MetadataType)
Folder MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [Folder](#Folder) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir, [additionalFields], buObject, [___], [key])](#Folder.retrieve) ⇒ <code>Promise</code>
    * [.retrieveForCache(buObject)](#Folder.retrieveForCache) ⇒ <code>Promise</code>
    * [.upsert(metadata)](#Folder.upsert) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.create(metadataEntry)](#Folder.create) ⇒ <code>Promise</code>
    * [.update(metadataEntry)](#Folder.update) ⇒ <code>Promise</code>
    * [.preDeployTasks(metadata)](#Folder.preDeployTasks) ⇒ <code>Promise.&lt;TYPE.MetadataTypeItem&gt;</code>
    * [.getJsonFromFS(dir, [listBadKeys])](#Folder.getJsonFromFS) ⇒ <code>TYPE.MetadataTypeMap</code>
    * [.retrieveHelper([additionalFields], [queryAllAccounts])](#Folder.retrieveHelper) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.postRetrieveTasks(metadata)](#Folder.postRetrieveTasks) ⇒ <code>TYPE.MetadataTypeItem</code>
    * [.saveResults(results, retrieveDir, mid)](#Folder.saveResults) ⇒ <code>Promise.&lt;object&gt;</code>

<a name="Folder.retrieve"></a>

### Folder.retrieve(retrieveDir, [additionalFields], buObject, [___], [key]) ⇒ <code>Promise</code>
Retrieves metadata of metadata type into local filesystem. executes callback with retrieved metadata

**Kind**: static method of [<code>Folder</code>](#Folder)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| [additionalFields] | <code>Array.&lt;string&gt;</code> | Returns specified fields even if their retrieve definition is not set to true |
| buObject | <code>TYPE.BuObject</code> | properties for auth |
| [___] | <code>void</code> | unused parameter |
| [key] | <code>string</code> | customer key of single item to retrieve |

<a name="Folder.retrieveForCache"></a>

### Folder.retrieveForCache(buObject) ⇒ <code>Promise</code>
Retrieves folder metadata for caching

**Kind**: static method of [<code>Folder</code>](#Folder)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| buObject | <code>TYPE.BuObject</code> | properties for auth |

<a name="Folder.upsert"></a>

### Folder.upsert(metadata) ⇒ <code>Promise.&lt;object&gt;</code>
Folder upsert (copied from Metadata Upsert), after retrieving from target
and comparing to check if create or update operation is needed.
Copied due to having a dependency on itself, meaning the created need to be serial

**Kind**: static method of [<code>Folder</code>](#Folder)  
**Returns**: <code>Promise.&lt;object&gt;</code> - Promise of saved metadata  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeMap</code> | metadata mapped by their keyField |

<a name="Folder.create"></a>

### Folder.create(metadataEntry) ⇒ <code>Promise</code>
creates a folder based on metatadata

**Kind**: static method of [<code>Folder</code>](#Folder)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadataEntry | <code>TYPE.MetadataTypeItem</code> | metadata of the folder |

<a name="Folder.update"></a>

### Folder.update(metadataEntry) ⇒ <code>Promise</code>
Updates a single Folder.

**Kind**: static method of [<code>Folder</code>](#Folder)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadataEntry | <code>TYPE.MetadataTypeItem</code> | single metadata entry |

<a name="Folder.preDeployTasks"></a>

### Folder.preDeployTasks(metadata) ⇒ <code>Promise.&lt;TYPE.MetadataTypeItem&gt;</code>
prepares a folder for deployment

**Kind**: static method of [<code>Folder</code>](#Folder)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeItem&gt;</code> - Promise of parsed folder metadata  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeItem</code> | a single folder definition |

<a name="Folder.getJsonFromFS"></a>

### Folder.getJsonFromFS(dir, [listBadKeys]) ⇒ <code>TYPE.MetadataTypeMap</code>
Returns file contents mapped to their filename without '.json' ending

**Kind**: static method of [<code>Folder</code>](#Folder)  
**Returns**: <code>TYPE.MetadataTypeMap</code> - fileName => fileContent map  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| dir | <code>string</code> |  | directory that contains '.json' files to be read |
| [listBadKeys] | <code>boolean</code> | <code>false</code> | do not print errors, used for badKeys() |

<a name="Folder.retrieveHelper"></a>

### Folder.retrieveHelper([additionalFields], [queryAllAccounts]) ⇒ <code>Promise.&lt;object&gt;</code>
Helper to retrieve the folders as promise

**Kind**: static method of [<code>Folder</code>](#Folder)  
**Returns**: <code>Promise.&lt;object&gt;</code> - soap object  

| Param | Type | Description |
| --- | --- | --- |
| [additionalFields] | <code>Array.&lt;string&gt;</code> | Returns specified fields even if their retrieve definition is not set to true |
| [queryAllAccounts] | <code>boolean</code> | which queryAllAccounts setting to use |

<a name="Folder.postRetrieveTasks"></a>

### Folder.postRetrieveTasks(metadata) ⇒ <code>TYPE.MetadataTypeItem</code>
Gets executed after retreive of metadata type

**Kind**: static method of [<code>Folder</code>](#Folder)  
**Returns**: <code>TYPE.MetadataTypeItem</code> - cloned metadata  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeItem</code> | metadata mapped by their keyField |

<a name="Folder.saveResults"></a>

### Folder.saveResults(results, retrieveDir, mid) ⇒ <code>Promise.&lt;object&gt;</code>
Helper for writing Metadata to disk, used for Retrieve and deploy

**Kind**: static method of [<code>Folder</code>](#Folder)  
**Returns**: <code>Promise.&lt;object&gt;</code> - Promise of saved metadata  

| Param | Type | Description |
| --- | --- | --- |
| results | <code>object</code> | metadata results from deploy |
| retrieveDir | <code>string</code> | directory where metadata should be stored after deploy/retrieve |
| mid | <code>number</code> | current mid for this credential / business unit |

<a name="FtpLocation"></a>

## FtpLocation ⇐ [<code>MetadataType</code>](#MetadataType)
ImportFile MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [FtpLocation](#FtpLocation) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir, [_], [__], [___], [key])](#FtpLocation.retrieve) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
    * [.retrieveForCache()](#FtpLocation.retrieveForCache) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>

<a name="FtpLocation.retrieve"></a>

### FtpLocation.retrieve(retrieveDir, [_], [__], [___], [key]) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Retrieves Metadata of FtpLocation
Endpoint /automation/v1/ftplocations/ return all FtpLocations

**Kind**: static method of [<code>FtpLocation</code>](#FtpLocation)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| [_] | <code>void</code> | unused parameter |
| [__] | <code>void</code> | unused parameter |
| [___] | <code>void</code> | unused parameter |
| [key] | <code>string</code> | customer key of single item to retrieve |

<a name="FtpLocation.retrieveForCache"></a>

### FtpLocation.retrieveForCache() ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Retrieves folder metadata into local filesystem. Also creates a uniquePath attribute for each folder.

**Kind**: static method of [<code>FtpLocation</code>](#FtpLocation)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Promise  
<a name="ImportFile"></a>

## ImportFile ⇐ [<code>MetadataType</code>](#MetadataType)
ImportFile MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [ImportFile](#ImportFile) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir, [_], [__], [___], [key])](#ImportFile.retrieve) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
    * [.retrieveForCache()](#ImportFile.retrieveForCache) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
    * [.retrieveAsTemplate(templateDir, name, templateVariables)](#ImportFile.retrieveAsTemplate) ⇒ <code>Promise.&lt;TYPE.MetadataTypeItemObj&gt;</code>
    * [.postRetrieveTasks(importDef)](#ImportFile.postRetrieveTasks) ⇒ <code>TYPE.MetadataTypeItem</code>
    * [.create(importFile)](#ImportFile.create) ⇒ <code>Promise</code>
    * [.update(importFile)](#ImportFile.update) ⇒ <code>Promise</code>
    * [.preDeployTasks(metadata)](#ImportFile.preDeployTasks) ⇒ <code>Promise</code>
    * [.parseMetadata(metadata)](#ImportFile.parseMetadata) ⇒ <code>TYPE.MetadataTypeItem</code>

<a name="ImportFile.retrieve"></a>

### ImportFile.retrieve(retrieveDir, [_], [__], [___], [key]) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Retrieves Metadata of Import File.
Endpoint /automation/v1/imports/ return all Import Files with all details.
Currently it is not needed to loop over Imports with endpoint /automation/v1/imports/{id}

**Kind**: static method of [<code>ImportFile</code>](#ImportFile)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| [_] | <code>void</code> | unused parameter |
| [__] | <code>void</code> | unused parameter |
| [___] | <code>void</code> | unused parameter |
| [key] | <code>string</code> | customer key of single item to retrieve |

<a name="ImportFile.retrieveForCache"></a>

### ImportFile.retrieveForCache() ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Retrieves import definition metadata for caching

**Kind**: static method of [<code>ImportFile</code>](#ImportFile)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Promise  
<a name="ImportFile.retrieveAsTemplate"></a>

### ImportFile.retrieveAsTemplate(templateDir, name, templateVariables) ⇒ <code>Promise.&lt;TYPE.MetadataTypeItemObj&gt;</code>
Retrieve a specific Import Definition by Name

**Kind**: static method of [<code>ImportFile</code>](#ImportFile)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeItemObj&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| name | <code>string</code> | name of the metadata file |
| templateVariables | <code>TYPE.TemplateMap</code> | variables to be replaced in the metadata |

<a name="ImportFile.postRetrieveTasks"></a>

### ImportFile.postRetrieveTasks(importDef) ⇒ <code>TYPE.MetadataTypeItem</code>
manages post retrieve steps

**Kind**: static method of [<code>ImportFile</code>](#ImportFile)  
**Returns**: <code>TYPE.MetadataTypeItem</code> - metadata  

| Param | Type | Description |
| --- | --- | --- |
| importDef | <code>TYPE.MetadataTypeItem</code> | a single importDef |

<a name="ImportFile.create"></a>

### ImportFile.create(importFile) ⇒ <code>Promise</code>
Creates a single Import File

**Kind**: static method of [<code>ImportFile</code>](#ImportFile)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| importFile | <code>TYPE.MetadataTypeItem</code> | a single Import File |

<a name="ImportFile.update"></a>

### ImportFile.update(importFile) ⇒ <code>Promise</code>
Updates a single Import File

**Kind**: static method of [<code>ImportFile</code>](#ImportFile)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| importFile | <code>TYPE.MetadataTypeItem</code> | a single Import File |

<a name="ImportFile.preDeployTasks"></a>

### ImportFile.preDeployTasks(metadata) ⇒ <code>Promise</code>
prepares a import definition for deployment

**Kind**: static method of [<code>ImportFile</code>](#ImportFile)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeItem</code> | a single importDef |

<a name="ImportFile.parseMetadata"></a>

### ImportFile.parseMetadata(metadata) ⇒ <code>TYPE.MetadataTypeItem</code>
parses retrieved Metadata before saving

**Kind**: static method of [<code>ImportFile</code>](#ImportFile)  
**Returns**: <code>TYPE.MetadataTypeItem</code> - parsed metadata definition  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeItem</code> | a single import definition |

<a name="Interaction"></a>

## Interaction ⇐ [<code>MetadataType</code>](#MetadataType)
Script MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  
<a name="Interaction.retrieve"></a>

### Interaction.retrieve(retrieveDir, [_], [__], [___], [key]) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Retrieves Metadata of Interaction
Endpoint /interaction/v1/interactions?extras=all&pageSize=50000 return 50000 Scripts with all details.

**Kind**: static method of [<code>Interaction</code>](#Interaction)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| [_] | <code>void</code> | unused parameter |
| [__] | <code>void</code> | unused parameter |
| [___] | <code>void</code> | unused parameter |
| [key] | <code>string</code> | customer key of single item to retrieve |

<a name="List"></a>

## List ⇐ [<code>MetadataType</code>](#MetadataType)
List MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [List](#List) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir, [_], [__], [___], [key])](#List.retrieve) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
    * [.retrieveForCache()](#List.retrieveForCache) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
    * [.deleteByKey(buObject, customerKey)](#List.deleteByKey) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.postRetrieveTasks(list)](#List.postRetrieveTasks) ⇒ <code>TYPE.MetadataTypeItem</code>
    * [.parseMetadata(metadata, [parseForCache])](#List.parseMetadata) ⇒ <code>TYPE.MetadataTypeItem</code>

<a name="List.retrieve"></a>

### List.retrieve(retrieveDir, [_], [__], [___], [key]) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Retrieves Metadata of Lists

**Kind**: static method of [<code>List</code>](#List)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| [_] | <code>void</code> | unused parameter |
| [__] | <code>void</code> | unused parameter |
| [___] | <code>void</code> | unused parameter |
| [key] | <code>string</code> | customer key of single item to retrieve |

<a name="List.retrieveForCache"></a>

### List.retrieveForCache() ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Gets metadata cache with limited fields and does not store value to disk

**Kind**: static method of [<code>List</code>](#List)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Promise of metadata  
<a name="List.deleteByKey"></a>

### List.deleteByKey(buObject, customerKey) ⇒ <code>Promise.&lt;boolean&gt;</code>
Delete a metadata item from the specified business unit

**Kind**: static method of [<code>List</code>](#List)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - deletion success status  

| Param | Type | Description |
| --- | --- | --- |
| buObject | <code>TYPE.BuObject</code> | references credentials |
| customerKey | <code>string</code> | Identifier of data extension |

<a name="List.postRetrieveTasks"></a>

### List.postRetrieveTasks(list) ⇒ <code>TYPE.MetadataTypeItem</code>
manages post retrieve steps

**Kind**: static method of [<code>List</code>](#List)  
**Returns**: <code>TYPE.MetadataTypeItem</code> - metadata  

| Param | Type | Description |
| --- | --- | --- |
| list | <code>TYPE.MetadataTypeItem</code> | a single list |

<a name="List.parseMetadata"></a>

### List.parseMetadata(metadata, [parseForCache]) ⇒ <code>TYPE.MetadataTypeItem</code>
parses retrieved Metadata before saving

**Kind**: static method of [<code>List</code>](#List)  
**Returns**: <code>TYPE.MetadataTypeItem</code> - Array with one metadata object and one sql string  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeItem</code> | a single list definition |
| [parseForCache] | <code>boolean</code> | if set to true, the Category ID is kept |

<a name="MetadataType"></a>

## MetadataType
MetadataType class that gets extended by their specific metadata type class.
Provides default functionality that can be overwritten by child metadata type classes

**Kind**: global class  

* [MetadataType](#MetadataType)
    * [.client](#MetadataType.client) : <code>TYPE.SDK</code>
    * [.properties](#MetadataType.properties) : <code>object</code>
    * [.subType](#MetadataType.subType) : <code>string</code>
    * [.buObject](#MetadataType.buObject) : <code>TYPE.BuObject</code>
    * [.getJsonFromFS(dir, [listBadKeys])](#MetadataType.getJsonFromFS) ⇒ <code>TYPE.MetadataTypeMap</code>
    * [.getFieldNamesToRetrieve([additionalFields])](#MetadataType.getFieldNamesToRetrieve) ⇒ <code>Array.&lt;string&gt;</code>
    * [.deploy(metadata, deployDir, retrieveDir, buObject)](#MetadataType.deploy) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.postDeployTasks(metadata, originalMetadata)](#MetadataType.postDeployTasks) ⇒ <code>void</code>
    * [.postRetrieveTasks(metadata, targetDir, [isTemplating])](#MetadataType.postRetrieveTasks) ⇒ <code>TYPE.MetadataTypeItem</code>
    * [.retrieve(retrieveDir, [additionalFields], buObject, [subType], [key])](#MetadataType.retrieve) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
    * [.retrieveChangelog([buObject], [additionalFields], [subType])](#MetadataType.retrieveChangelog) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
    * [.retrieveForCache(buObject, [subType])](#MetadataType.retrieveForCache) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
    * [.retrieveAsTemplate(templateDir, name, templateVariables, [subType])](#MetadataType.retrieveAsTemplate) ⇒ <code>Promise.&lt;TYPE.MetadataTypeItemObj&gt;</code>
    * [.buildTemplate(retrieveDir, templateDir, key, templateVariables)](#MetadataType.buildTemplate) ⇒ <code>Promise.&lt;TYPE.MetadataTypeItemObj&gt;</code>
    * [.preDeployTasks(metadata, deployDir, buObject)](#MetadataType.preDeployTasks) ⇒ <code>Promise.&lt;TYPE.MetadataTypeItem&gt;</code>
    * [.create(metadata, deployDir)](#MetadataType.create) ⇒ <code>void</code>
    * [.update(metadata, [metadataBefore])](#MetadataType.update) ⇒ <code>void</code>
    * [.upsert(metadata, deployDir, [buObject])](#MetadataType.upsert) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMap&gt;</code>
    * [.createREST(metadataEntry, uri)](#MetadataType.createREST) ⇒ <code>Promise</code>
    * [.createSOAP(metadataEntry, [overrideType], [handleOutside])](#MetadataType.createSOAP) ⇒ <code>Promise</code>
    * [.updateREST(metadataEntry, uri)](#MetadataType.updateREST) ⇒ <code>Promise</code>
    * [.updateSOAP(metadataEntry, [overrideType], [handleOutside])](#MetadataType.updateSOAP) ⇒ <code>Promise</code>
    * [.retrieveSOAP(retrieveDir, buObject, [requestParams], [additionalFields])](#MetadataType.retrieveSOAP) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
    * [.retrieveREST(retrieveDir, uri, [overrideType], [templateVariables], [singleRetrieve])](#MetadataType.retrieveREST) ⇒ <code>Promise.&lt;{metadata: (TYPE.MetadataTypeMap\|TYPE.MetadataTypeItem), type: string}&gt;</code>
    * [.parseResponseBody(body, [singleRetrieve])](#MetadataType.parseResponseBody) ⇒ <code>TYPE.MetadataTypeMap</code>
    * [.deleteFieldByDefinition(metadataEntry, fieldPath, definitionProperty, origin)](#MetadataType.deleteFieldByDefinition) ⇒ <code>void</code>
    * [.removeNotCreateableFields(metadataEntry)](#MetadataType.removeNotCreateableFields) ⇒ <code>void</code>
    * [.removeNotUpdateableFields(metadataEntry)](#MetadataType.removeNotUpdateableFields) ⇒ <code>void</code>
    * [.keepTemplateFields(metadataEntry)](#MetadataType.keepTemplateFields) ⇒ <code>void</code>
    * [.keepRetrieveFields(metadataEntry)](#MetadataType.keepRetrieveFields) ⇒ <code>void</code>
    * [.isFiltered(metadataEntry, [include])](#MetadataType.isFiltered) ⇒ <code>boolean</code>
    * [.isFilteredFolder(metadataEntry, [include])](#MetadataType.isFilteredFolder) ⇒ <code>boolean</code>
    * [.saveResults(results, retrieveDir, [overrideType], [templateVariables])](#MetadataType.saveResults) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMap&gt;</code>
    * [.applyTemplateValues(code, templateVariables)](#MetadataType.applyTemplateValues) ⇒ <code>string</code>
    * [.applyTemplateNames(code, templateVariables)](#MetadataType.applyTemplateNames) ⇒ <code>string</code>
    * [.buildDefinitionForNested(templateDir, targetDir, metadata, variables, templateName)](#MetadataType.buildDefinitionForNested) ⇒ <code>Promise.&lt;Array.&lt;Array.&lt;string&gt;&gt;&gt;</code>
    * [.buildTemplateForNested(templateDir, targetDir, metadata, templateVariables, templateName)](#MetadataType.buildTemplateForNested) ⇒ <code>Promise.&lt;Array.&lt;Array.&lt;string&gt;&gt;&gt;</code>
    * [.findSubType(templateDir, templateName)](#MetadataType.findSubType) ⇒ <code>Promise.&lt;string&gt;</code>
    * [.readSecondaryFolder(templateDir, typeDirArr, templateName, fileName, ex)](#MetadataType.readSecondaryFolder) ⇒ <code>object</code>
    * [.buildDefinition(templateDir, targetDir, templateName, variables)](#MetadataType.buildDefinition) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
    * [.checkForErrors(ex)](#MetadataType.checkForErrors) ⇒ <code>string</code>
    * [.document([buObject], [metadata], [isDeploy])](#MetadataType.document) ⇒ <code>void</code>
    * [.deleteByKey(buObject, customerKey)](#MetadataType.deleteByKey) ⇒ <code>boolean</code>
    * [.postDeleteTasks(buObject, customerKey)](#MetadataType.postDeleteTasks) ⇒ <code>void</code>
    * [.deleteByKeySOAP(buObject, customerKey, [handleOutside])](#MetadataType.deleteByKeySOAP) ⇒ <code>boolean</code>
    * [.readBUMetadataForType(readDir, [listBadKeys], [buMetadata])](#MetadataType.readBUMetadataForType) ⇒ <code>object</code>
    * [.getFilesToCommit(keyArr)](#MetadataType.getFilesToCommit) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>

<a name="MetadataType.client"></a>

### MetadataType.client : <code>TYPE.SDK</code>
**Kind**: static property of [<code>MetadataType</code>](#MetadataType)  
<a name="MetadataType.properties"></a>

### MetadataType.properties : <code>object</code>
**Kind**: static property of [<code>MetadataType</code>](#MetadataType)  
<a name="MetadataType.subType"></a>

### MetadataType.subType : <code>string</code>
**Kind**: static property of [<code>MetadataType</code>](#MetadataType)  
<a name="MetadataType.buObject"></a>

### MetadataType.buObject : <code>TYPE.BuObject</code>
**Kind**: static property of [<code>MetadataType</code>](#MetadataType)  
<a name="MetadataType.getJsonFromFS"></a>

### MetadataType.getJsonFromFS(dir, [listBadKeys]) ⇒ <code>TYPE.MetadataTypeMap</code>
Returns file contents mapped to their filename without '.json' ending

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>TYPE.MetadataTypeMap</code> - fileName => fileContent map  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| dir | <code>string</code> |  | directory that contains '.json' files to be read |
| [listBadKeys] | <code>boolean</code> | <code>false</code> | do not print errors, used for badKeys() |

<a name="MetadataType.getFieldNamesToRetrieve"></a>

### MetadataType.getFieldNamesToRetrieve([additionalFields]) ⇒ <code>Array.&lt;string&gt;</code>
Returns fieldnames of Metadata Type. 'this.definition.fields' variable only set in child classes.

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Array.&lt;string&gt;</code> - Fieldnames  

| Param | Type | Description |
| --- | --- | --- |
| [additionalFields] | <code>Array.&lt;string&gt;</code> | Returns specified fields even if their retrieve definition is not set to true |

<a name="MetadataType.deploy"></a>

### MetadataType.deploy(metadata, deployDir, retrieveDir, buObject) ⇒ <code>Promise.&lt;object&gt;</code>
Deploys metadata

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise.&lt;object&gt;</code> - Promise of keyField => metadata map  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeMap</code> | metadata mapped by their keyField |
| deployDir | <code>string</code> | directory where deploy metadata are saved |
| retrieveDir | <code>string</code> | directory where metadata after deploy should be saved |
| buObject | <code>TYPE.BuObject</code> | properties for auth |

<a name="MetadataType.postDeployTasks"></a>

### MetadataType.postDeployTasks(metadata, originalMetadata) ⇒ <code>void</code>
Gets executed after deployment of metadata type

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeMap</code> | metadata mapped by their keyField |
| originalMetadata | <code>TYPE.MetadataTypeMap</code> | metadata to be updated (contains additioanl fields) |

<a name="MetadataType.postRetrieveTasks"></a>

### MetadataType.postRetrieveTasks(metadata, targetDir, [isTemplating]) ⇒ <code>TYPE.MetadataTypeItem</code>
Gets executed after retreive of metadata type

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>TYPE.MetadataTypeItem</code> - cloned metadata  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeItem</code> | a single item |
| targetDir | <code>string</code> | folder where retrieves should be saved |
| [isTemplating] | <code>boolean</code> | signals that we are retrieving templates |

<a name="MetadataType.retrieve"></a>

### MetadataType.retrieve(retrieveDir, [additionalFields], buObject, [subType], [key]) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Gets metadata from Marketing Cloud

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - metadata  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| [additionalFields] | <code>Array.&lt;string&gt;</code> | Returns specified fields even if their retrieve definition is not set to true |
| buObject | <code>TYPE.BuObject</code> | properties for auth |
| [subType] | <code>string</code> | optionally limit to a single subtype |
| [key] | <code>string</code> | customer key of single item to retrieve |

<a name="MetadataType.retrieveChangelog"></a>

### MetadataType.retrieveChangelog([buObject], [additionalFields], [subType]) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Gets metadata from Marketing Cloud

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - metadata  

| Param | Type | Description |
| --- | --- | --- |
| [buObject] | <code>TYPE.BuObject</code> | properties for auth |
| [additionalFields] | <code>Array.&lt;string&gt;</code> | Returns specified fields even if their retrieve definition is not set to true |
| [subType] | <code>string</code> | optionally limit to a single subtype |

<a name="MetadataType.retrieveForCache"></a>

### MetadataType.retrieveForCache(buObject, [subType]) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Gets metadata cache with limited fields and does not store value to disk

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - metadata  

| Param | Type | Description |
| --- | --- | --- |
| buObject | <code>TYPE.BuObject</code> | properties for auth |
| [subType] | <code>string</code> | optionally limit to a single subtype |

<a name="MetadataType.retrieveAsTemplate"></a>

### MetadataType.retrieveAsTemplate(templateDir, name, templateVariables, [subType]) ⇒ <code>Promise.&lt;TYPE.MetadataTypeItemObj&gt;</code>
Gets metadata cache with limited fields and does not store value to disk

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeItemObj&gt;</code> - metadata  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| name | <code>string</code> | name of the metadata file |
| templateVariables | <code>TYPE.TemplateMap</code> | variables to be replaced in the metadata |
| [subType] | <code>string</code> | optionally limit to a single subtype |

<a name="MetadataType.buildTemplate"></a>

### MetadataType.buildTemplate(retrieveDir, templateDir, key, templateVariables) ⇒ <code>Promise.&lt;TYPE.MetadataTypeItemObj&gt;</code>
Gets metadata cache with limited fields and does not store value to disk

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeItemObj&gt;</code> - single metadata  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| templateDir | <code>string</code> | (List of) Directory where built definitions will be saved |
| key | <code>string</code> | name of the metadata file |
| templateVariables | <code>TYPE.TemplateMap</code> | variables to be replaced in the metadata |

<a name="MetadataType.preDeployTasks"></a>

### MetadataType.preDeployTasks(metadata, deployDir, buObject) ⇒ <code>Promise.&lt;TYPE.MetadataTypeItem&gt;</code>
Gets executed before deploying metadata

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeItem&gt;</code> - Promise of a single metadata item  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeItem</code> | a single metadata item |
| deployDir | <code>string</code> | folder where files for deployment are stored |
| buObject | <code>TYPE.BuObject</code> | buObject properties for auth |

<a name="MetadataType.create"></a>

### MetadataType.create(metadata, deployDir) ⇒ <code>void</code>
Abstract create method that needs to be implemented in child metadata type

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeItem</code> | single metadata entry |
| deployDir | <code>string</code> | directory where deploy metadata are saved |

<a name="MetadataType.update"></a>

### MetadataType.update(metadata, [metadataBefore]) ⇒ <code>void</code>
Abstract update method that needs to be implemented in child metadata type

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeItem</code> | single metadata entry |
| [metadataBefore] | <code>TYPE.MetadataTypeItem</code> | metadata mapped by their keyField |

<a name="MetadataType.upsert"></a>

### MetadataType.upsert(metadata, deployDir, [buObject]) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMap&gt;</code>
MetadataType upsert, after retrieving from target and comparing to check if create or update operation is needed.

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMap&gt;</code> - keyField => metadata map  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeMap</code> | metadata mapped by their keyField |
| deployDir | <code>string</code> | directory where deploy metadata are saved |
| [buObject] | <code>TYPE.BuObject</code> | properties for auth |

<a name="MetadataType.createREST"></a>

### MetadataType.createREST(metadataEntry, uri) ⇒ <code>Promise</code>
Creates a single metadata entry via REST

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadataEntry | <code>TYPE.MetadataTypeItem</code> | a single metadata Entry |
| uri | <code>string</code> | rest endpoint for POST |

<a name="MetadataType.createSOAP"></a>

### MetadataType.createSOAP(metadataEntry, [overrideType], [handleOutside]) ⇒ <code>Promise</code>
Creates a single metadata entry via fuel-soap (generic lib not wrapper)

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadataEntry | <code>TYPE.MetadataTypeItem</code> | single metadata entry |
| [overrideType] | <code>string</code> | can be used if the API type differs from the otherwise used type identifier |
| [handleOutside] | <code>boolean</code> | if the API reponse is irregular this allows you to handle it outside of this generic method |

<a name="MetadataType.updateREST"></a>

### MetadataType.updateREST(metadataEntry, uri) ⇒ <code>Promise</code>
Updates a single metadata entry via REST

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadataEntry | <code>TYPE.MetadataTypeItem</code> | a single metadata Entry |
| uri | <code>string</code> | rest endpoint for PATCH |

<a name="MetadataType.updateSOAP"></a>

### MetadataType.updateSOAP(metadataEntry, [overrideType], [handleOutside]) ⇒ <code>Promise</code>
Updates a single metadata entry via fuel-soap (generic lib not wrapper)

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadataEntry | <code>TYPE.MetadataTypeItem</code> | single metadata entry |
| [overrideType] | <code>string</code> | can be used if the API type differs from the otherwise used type identifier |
| [handleOutside] | <code>boolean</code> | if the API reponse is irregular this allows you to handle it outside of this generic method |

<a name="MetadataType.retrieveSOAP"></a>

### MetadataType.retrieveSOAP(retrieveDir, buObject, [requestParams], [additionalFields]) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Retrieves SOAP via generic fuel-soap wrapper based metadata of metadata type into local filesystem. executes callback with retrieved metadata

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Promise of item map  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| buObject | <code>TYPE.BuObject</code> | properties for auth |
| [requestParams] | <code>TYPE.SoapRequestParams</code> | required for the specific request (filter for example) |
| [additionalFields] | <code>Array.&lt;string&gt;</code> | Returns specified fields even if their retrieve definition is not set to true |

<a name="MetadataType.retrieveREST"></a>

### MetadataType.retrieveREST(retrieveDir, uri, [overrideType], [templateVariables], [singleRetrieve]) ⇒ <code>Promise.&lt;{metadata: (TYPE.MetadataTypeMap\|TYPE.MetadataTypeItem), type: string}&gt;</code>
Retrieves Metadata for Rest Types

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise.&lt;{metadata: (TYPE.MetadataTypeMap\|TYPE.MetadataTypeItem), type: string}&gt;</code> - Promise of item map (single item for templated result)  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| uri | <code>string</code> | rest endpoint for GET |
| [overrideType] | <code>string</code> | force a metadata type (mainly used for Folders) |
| [templateVariables] | <code>TYPE.TemplateMap</code> | variables to be replaced in the metadata |
| [singleRetrieve] | <code>string</code> \| <code>number</code> | key of single item to filter by |

<a name="MetadataType.parseResponseBody"></a>

### MetadataType.parseResponseBody(body, [singleRetrieve]) ⇒ <code>TYPE.MetadataTypeMap</code>
Builds map of metadata entries mapped to their keyfields

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>TYPE.MetadataTypeMap</code> - keyField => metadata map  

| Param | Type | Description |
| --- | --- | --- |
| body | <code>object</code> | json of response body |
| [singleRetrieve] | <code>string</code> \| <code>number</code> | key of single item to filter by |

<a name="MetadataType.deleteFieldByDefinition"></a>

### MetadataType.deleteFieldByDefinition(metadataEntry, fieldPath, definitionProperty, origin) ⇒ <code>void</code>
Deletes a field in a metadata entry if the selected definition property equals false.

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  

| Param | Type | Description |
| --- | --- | --- |
| metadataEntry | <code>TYPE.MetadataTypeItem</code> | One entry of a metadataType |
| fieldPath | <code>string</code> | field path to be checked if it conforms to the definition (dot seperated if nested): 'fuu.bar' |
| definitionProperty | <code>&#x27;isCreateable&#x27;</code> \| <code>&#x27;isUpdateable&#x27;</code> \| <code>&#x27;retrieving&#x27;</code> \| <code>&#x27;templating&#x27;</code> | delete field if definitionProperty equals false for specified field. Options: [isCreateable | isUpdateable] |
| origin | <code>string</code> | string of parent object, required when using arrays as these are parsed slightly differently. |

**Example**  
```js
Removes field (or nested fields childs) that are not updateable
deleteFieldByDefinition(metadataEntry, 'CustomerKey', 'isUpdateable');
```
<a name="MetadataType.removeNotCreateableFields"></a>

### MetadataType.removeNotCreateableFields(metadataEntry) ⇒ <code>void</code>
Remove fields from metadata entry that are not createable

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  

| Param | Type | Description |
| --- | --- | --- |
| metadataEntry | <code>TYPE.MetadataTypeItem</code> | metadata entry |

<a name="MetadataType.removeNotUpdateableFields"></a>

### MetadataType.removeNotUpdateableFields(metadataEntry) ⇒ <code>void</code>
Remove fields from metadata entry that are not updateable

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  

| Param | Type | Description |
| --- | --- | --- |
| metadataEntry | <code>TYPE.MetadataTypeItem</code> | metadata entry |

<a name="MetadataType.keepTemplateFields"></a>

### MetadataType.keepTemplateFields(metadataEntry) ⇒ <code>void</code>
Remove fields from metadata entry that are not needed in the template

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  

| Param | Type | Description |
| --- | --- | --- |
| metadataEntry | <code>TYPE.MetadataTypeItem</code> | metadata entry |

<a name="MetadataType.keepRetrieveFields"></a>

### MetadataType.keepRetrieveFields(metadataEntry) ⇒ <code>void</code>
Remove fields from metadata entry that are not needed in the stored metadata

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  

| Param | Type | Description |
| --- | --- | --- |
| metadataEntry | <code>TYPE.MetadataTypeItem</code> | metadata entry |

<a name="MetadataType.isFiltered"></a>

### MetadataType.isFiltered(metadataEntry, [include]) ⇒ <code>boolean</code>
checks if the current metadata entry should be saved on retrieve or not

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>boolean</code> - true: skip saving == filtered; false: continue with saving  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| metadataEntry | <code>TYPE.MetadataTypeItem</code> |  | metadata entry |
| [include] | <code>boolean</code> | <code>false</code> | true: use definition.include / options.include; false=exclude: use definition.filter / options.exclude |

<a name="MetadataType.isFilteredFolder"></a>

### MetadataType.isFilteredFolder(metadataEntry, [include]) ⇒ <code>boolean</code>
optionally filter by what folder something is in

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>boolean</code> - true: filtered == do NOT save; false: not filtered == do save  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| metadataEntry | <code>object</code> |  | metadata entry |
| [include] | <code>boolean</code> | <code>false</code> | true: use definition.include / options.include; false=exclude: use definition.filter / options.exclude |

<a name="MetadataType.saveResults"></a>

### MetadataType.saveResults(results, retrieveDir, [overrideType], [templateVariables]) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMap&gt;</code>
Helper for writing Metadata to disk, used for Retrieve and deploy

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMap&gt;</code> - Promise of saved metadata  

| Param | Type | Description |
| --- | --- | --- |
| results | <code>TYPE.MetadataTypeMap</code> | metadata results from deploy |
| retrieveDir | <code>string</code> | directory where metadata should be stored after deploy/retrieve |
| [overrideType] | <code>string</code> | for use when there is a subtype (such as folder-queries) |
| [templateVariables] | <code>TYPE.TemplateMap</code> | variables to be replaced in the metadata |

<a name="MetadataType.applyTemplateValues"></a>

### MetadataType.applyTemplateValues(code, templateVariables) ⇒ <code>string</code>
helper for buildDefinitionForNested
searches extracted file for template variable names and applies the market values

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>string</code> - code with markets applied  

| Param | Type | Description |
| --- | --- | --- |
| code | <code>string</code> | code from extracted code |
| templateVariables | <code>TYPE.TemplateMap</code> | variables to be replaced in the metadata |

<a name="MetadataType.applyTemplateNames"></a>

### MetadataType.applyTemplateNames(code, templateVariables) ⇒ <code>string</code>
helper for buildTemplateForNested
searches extracted file for template variable values and applies the market variable names

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>string</code> - code with markets applied  

| Param | Type | Description |
| --- | --- | --- |
| code | <code>string</code> | code from extracted code |
| templateVariables | <code>TYPE.TemplateMap</code> | variables to be replaced in the metadata |

<a name="MetadataType.buildDefinitionForNested"></a>

### MetadataType.buildDefinitionForNested(templateDir, targetDir, metadata, variables, templateName) ⇒ <code>Promise.&lt;Array.&lt;Array.&lt;string&gt;&gt;&gt;</code>
helper for buildDefinition
handles extracted code if any are found for complex types (e.g script, asset, query)

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise.&lt;Array.&lt;Array.&lt;string&gt;&gt;&gt;</code> - list of extracted files with path-parts provided as an array  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where metadata templates are stored |
| targetDir | <code>string</code> | Directory where built definitions will be saved |
| metadata | <code>TYPE.MetadataTypeItem</code> | main JSON file that was read from file system |
| variables | <code>TYPE.TemplateMap</code> | variables to be replaced in the metadata |
| templateName | <code>string</code> | name of the template to be built |

<a name="MetadataType.buildTemplateForNested"></a>

### MetadataType.buildTemplateForNested(templateDir, targetDir, metadata, templateVariables, templateName) ⇒ <code>Promise.&lt;Array.&lt;Array.&lt;string&gt;&gt;&gt;</code>
helper for buildTemplate
handles extracted code if any are found for complex types

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise.&lt;Array.&lt;Array.&lt;string&gt;&gt;&gt;</code> - list of extracted files with path-parts provided as an array  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where metadata templates are stored |
| targetDir | <code>string</code> \| <code>Array.&lt;string&gt;</code> | (List of) Directory where built definitions will be saved |
| metadata | <code>TYPE.MetadataTypeItem</code> | main JSON file that was read from file system |
| templateVariables | <code>TYPE.TemplateMap</code> | variables to be replaced in the metadata |
| templateName | <code>string</code> | name of the template to be built |

<a name="MetadataType.findSubType"></a>

### MetadataType.findSubType(templateDir, templateName) ⇒ <code>Promise.&lt;string&gt;</code>
check template directory for complex types that open subfolders for their subtypes

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise.&lt;string&gt;</code> - subtype name  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where metadata templates are stored |
| templateName | <code>string</code> | name of the metadata file |

<a name="MetadataType.readSecondaryFolder"></a>

### MetadataType.readSecondaryFolder(templateDir, typeDirArr, templateName, fileName, ex) ⇒ <code>object</code>
optional method used for some types to try a different folder structure

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>object</code> - metadata  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where metadata templates are stored |
| typeDirArr | <code>Array.&lt;string&gt;</code> | current subdir for this type |
| templateName | <code>string</code> | name of the metadata template |
| fileName | <code>string</code> | name of the metadata template file w/o extension |
| ex | <code>Error</code> | error from first attempt |

<a name="MetadataType.buildDefinition"></a>

### MetadataType.buildDefinition(templateDir, targetDir, templateName, variables) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Builds definition based on template
NOTE: Most metadata files should use this generic method, unless custom
parsing is required (for example scripts & queries)

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Promise of item map  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where metadata templates are stored |
| targetDir | <code>string</code> \| <code>Array.&lt;string&gt;</code> | (List of) Directory where built definitions will be saved |
| templateName | <code>string</code> | name of the metadata file |
| variables | <code>TYPE.TemplateMap</code> | variables to be replaced in the metadata |

<a name="MetadataType.checkForErrors"></a>

### MetadataType.checkForErrors(ex) ⇒ <code>string</code>
Standardizes a check for multiple messages

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>string</code> - formatted Error Message  

| Param | Type | Description |
| --- | --- | --- |
| ex | <code>object</code> | response payload from REST API |

<a name="MetadataType.document"></a>

### MetadataType.document([buObject], [metadata], [isDeploy]) ⇒ <code>void</code>
Gets metadata cache with limited fields and does not store value to disk

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  

| Param | Type | Description |
| --- | --- | --- |
| [buObject] | <code>TYPE.BuObject</code> | properties for auth |
| [metadata] | <code>TYPE.MetadataTypeMap</code> | a list of type definitions |
| [isDeploy] | <code>boolean</code> | used to skip non-supported message during deploy |

<a name="MetadataType.deleteByKey"></a>

### MetadataType.deleteByKey(buObject, customerKey) ⇒ <code>boolean</code>
Delete a metadata item from the specified business unit

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>boolean</code> - deletion success status  

| Param | Type | Description |
| --- | --- | --- |
| buObject | <code>TYPE.BuObject</code> | references credentials |
| customerKey | <code>string</code> | Identifier of data extension |

<a name="MetadataType.postDeleteTasks"></a>

### MetadataType.postDeleteTasks(buObject, customerKey) ⇒ <code>void</code>
clean up after deleting a metadata item

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>void</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| buObject | <code>TYPE.BuObject</code> | references credentials |
| customerKey | <code>string</code> | Identifier of metadata item |

<a name="MetadataType.deleteByKeySOAP"></a>

### MetadataType.deleteByKeySOAP(buObject, customerKey, [handleOutside]) ⇒ <code>boolean</code>
Delete a data extension from the specified business unit

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>boolean</code> - deletion success flag  

| Param | Type | Description |
| --- | --- | --- |
| buObject | <code>TYPE.BuObject</code> | references credentials |
| customerKey | <code>string</code> | Identifier of metadata |
| [handleOutside] | <code>boolean</code> | if the API reponse is irregular this allows you to handle it outside of this generic method |

<a name="MetadataType.readBUMetadataForType"></a>

### MetadataType.readBUMetadataForType(readDir, [listBadKeys], [buMetadata]) ⇒ <code>object</code>
Returns metadata of a business unit that is saved locally

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>object</code> - Metadata of BU in local directory  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| readDir | <code>string</code> |  | root directory of metadata. |
| [listBadKeys] | <code>boolean</code> | <code>false</code> | do not print errors, used for badKeys() |
| [buMetadata] | <code>object</code> |  | Metadata of BU in local directory |

<a name="MetadataType.getFilesToCommit"></a>

### MetadataType.getFilesToCommit(keyArr) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
should return only the json for all but asset, query and script that are saved as multiple files
additionally, the documentation for dataExtension and automation should be returned

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - list of all files that need to be committed in a flat array ['path/file1.ext', 'path/file2.ext']  

| Param | Type | Description |
| --- | --- | --- |
| keyArr | <code>Array.&lt;string&gt;</code> | customerkey of the metadata |

<a name="MobileCode"></a>

## MobileCode ⇐ [<code>MetadataType</code>](#MetadataType)
MobileCode MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [MobileCode](#MobileCode) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir, [_], [__], [___], [key])](#MobileCode.retrieve) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
    * [.retrieveForCache()](#MobileCode.retrieveForCache) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>

<a name="MobileCode.retrieve"></a>

### MobileCode.retrieve(retrieveDir, [_], [__], [___], [key]) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Retrieves Metadata of Mobile Keywords
Endpoint /legacy/v1/beta/mobile/code/ return all Mobile Codes with all details.

**Kind**: static method of [<code>MobileCode</code>](#MobileCode)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Promise of metadata  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| [_] | <code>void</code> | unused parameter |
| [__] | <code>void</code> | unused parameter |
| [___] | <code>void</code> | unused parameter |
| [key] | <code>string</code> | customer key of single item to retrieve |

<a name="MobileCode.retrieveForCache"></a>

### MobileCode.retrieveForCache() ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Retrieves event definition metadata for caching

**Kind**: static method of [<code>MobileCode</code>](#MobileCode)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Promise of metadata  
<a name="MobileKeyword"></a>

## MobileKeyword ⇐ [<code>MetadataType</code>](#MetadataType)
MobileKeyword MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [MobileKeyword](#MobileKeyword) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir, [_], [__], [___], [key])](#MobileKeyword.retrieve) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
    * [.retrieveForCache()](#MobileKeyword.retrieveForCache) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
    * [.retrieveAsTemplate(templateDir, name, templateVariables)](#MobileKeyword.retrieveAsTemplate) ⇒ <code>Promise.&lt;TYPE.MetadataTypeItemObj&gt;</code>
    * [.create(MobileKeyword)](#MobileKeyword.create) ⇒ <code>Promise</code>
    * [.preDeployTasks(metadata)](#MobileKeyword.preDeployTasks) ⇒ <code>TYPE.MetadataTypeItem</code>

<a name="MobileKeyword.retrieve"></a>

### MobileKeyword.retrieve(retrieveDir, [_], [__], [___], [key]) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Retrieves Metadata of Mobile Keywords
Endpoint /legacy/v1/beta/mobile/keyword/ return all Mobile Keywords with all details.

**Kind**: static method of [<code>MobileKeyword</code>](#MobileKeyword)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Promise of metadata  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| [_] | <code>void</code> | unused parameter |
| [__] | <code>void</code> | unused parameter |
| [___] | <code>void</code> | unused parameter |
| [key] | <code>string</code> | customer key of single item to retrieve |

<a name="MobileKeyword.retrieveForCache"></a>

### MobileKeyword.retrieveForCache() ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Retrieves event definition metadata for caching

**Kind**: static method of [<code>MobileKeyword</code>](#MobileKeyword)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Promise of metadata  
<a name="MobileKeyword.retrieveAsTemplate"></a>

### MobileKeyword.retrieveAsTemplate(templateDir, name, templateVariables) ⇒ <code>Promise.&lt;TYPE.MetadataTypeItemObj&gt;</code>
Retrieve a specific keyword

**Kind**: static method of [<code>MobileKeyword</code>](#MobileKeyword)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeItemObj&gt;</code> - Promise of metadata  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| name | <code>string</code> | name of the metadata file |
| templateVariables | <code>TYPE.TemplateMap</code> | variables to be replaced in the metadata |

<a name="MobileKeyword.create"></a>

### MobileKeyword.create(MobileKeyword) ⇒ <code>Promise</code>
Creates a single Event Definition

**Kind**: static method of [<code>MobileKeyword</code>](#MobileKeyword)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| MobileKeyword | <code>TYPE.MetadataTypeItem</code> | a single Event Definition |

<a name="MobileKeyword.preDeployTasks"></a>

### MobileKeyword.preDeployTasks(metadata) ⇒ <code>TYPE.MetadataTypeItem</code>
prepares an event definition for deployment

**Kind**: static method of [<code>MobileKeyword</code>](#MobileKeyword)  
**Returns**: <code>TYPE.MetadataTypeItem</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeItem</code> | a single MobileKeyword |

<a name="Query"></a>

## Query ⇐ [<code>MetadataType</code>](#MetadataType)
Query MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [Query](#Query) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir, [_], [__], [___], [key])](#Query.retrieve) ⇒ <code>Promise.&lt;{metadata: TYPE.QueryMap, type: string}&gt;</code>
    * [.retrieveForCache()](#Query.retrieveForCache) ⇒ <code>Promise.&lt;{metadata: TYPE.QueryMap, type: string}&gt;</code>
    * [.retrieveAsTemplate(templateDir, name, templateVariables)](#Query.retrieveAsTemplate) ⇒ <code>Promise.&lt;{metadata: Query, type: string}&gt;</code>
    * [.postRetrieveTasks(metadata)](#Query.postRetrieveTasks) ⇒ <code>TYPE.CodeExtractItem</code>
    * [.create(query)](#Query.create) ⇒ <code>Promise</code>
    * [.update(query)](#Query.update) ⇒ <code>Promise</code>
    * [.preDeployTasks(metadata, deployDir)](#Query.preDeployTasks) ⇒ <code>Promise.&lt;TYPE.QueryItem&gt;</code>
    * [.applyTemplateValues(code, templateVariables)](#Query.applyTemplateValues) ⇒ <code>string</code>
    * [.buildDefinitionForNested(templateDir, targetDir, metadata, templateVariables, templateName)](#Query.buildDefinitionForNested) ⇒ <code>Promise.&lt;Array.&lt;Array.&lt;string&gt;&gt;&gt;</code>
    * [.buildTemplateForNested(templateDir, targetDir, metadata, templateVariables, templateName)](#Query.buildTemplateForNested) ⇒ <code>Promise.&lt;Array.&lt;Array.&lt;string&gt;&gt;&gt;</code>
    * [.parseMetadata(metadata)](#Query.parseMetadata) ⇒ <code>TYPE.CodeExtractItem</code>
    * [.getFilesToCommit(keyArr)](#Query.getFilesToCommit) ⇒ <code>Array.&lt;string&gt;</code>

<a name="Query.retrieve"></a>

### Query.retrieve(retrieveDir, [_], [__], [___], [key]) ⇒ <code>Promise.&lt;{metadata: TYPE.QueryMap, type: string}&gt;</code>
Retrieves Metadata of queries

**Kind**: static method of [<code>Query</code>](#Query)  
**Returns**: <code>Promise.&lt;{metadata: TYPE.QueryMap, type: string}&gt;</code> - Promise of metadata  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| [_] | <code>void</code> | unused parameter |
| [__] | <code>void</code> | unused parameter |
| [___] | <code>void</code> | unused parameter |
| [key] | <code>string</code> | customer key of single item to retrieve |

<a name="Query.retrieveForCache"></a>

### Query.retrieveForCache() ⇒ <code>Promise.&lt;{metadata: TYPE.QueryMap, type: string}&gt;</code>
Retrieves query metadata for caching

**Kind**: static method of [<code>Query</code>](#Query)  
**Returns**: <code>Promise.&lt;{metadata: TYPE.QueryMap, type: string}&gt;</code> - Promise of metadata  
<a name="Query.retrieveAsTemplate"></a>

### Query.retrieveAsTemplate(templateDir, name, templateVariables) ⇒ <code>Promise.&lt;{metadata: Query, type: string}&gt;</code>
Retrieve a specific Query by Name

**Kind**: static method of [<code>Query</code>](#Query)  
**Returns**: <code>Promise.&lt;{metadata: Query, type: string}&gt;</code> - Promise of metadata  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| name | <code>string</code> | name of the metadata file |
| templateVariables | <code>TYPE.TemplateMap</code> | variables to be replaced in the metadata |

<a name="Query.postRetrieveTasks"></a>

### Query.postRetrieveTasks(metadata) ⇒ <code>TYPE.CodeExtractItem</code>
manages post retrieve steps

**Kind**: static method of [<code>Query</code>](#Query)  
**Returns**: <code>TYPE.CodeExtractItem</code> - Array with one metadata object and one query string  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.QueryItem</code> | a single query |

<a name="Query.create"></a>

### Query.create(query) ⇒ <code>Promise</code>
Creates a single query

**Kind**: static method of [<code>Query</code>](#Query)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>TYPE.QueryItem</code> | a single query |

<a name="Query.update"></a>

### Query.update(query) ⇒ <code>Promise</code>
Updates a single query

**Kind**: static method of [<code>Query</code>](#Query)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>TYPE.QueryItem</code> | a single query |

<a name="Query.preDeployTasks"></a>

### Query.preDeployTasks(metadata, deployDir) ⇒ <code>Promise.&lt;TYPE.QueryItem&gt;</code>
prepares a Query for deployment

**Kind**: static method of [<code>Query</code>](#Query)  
**Returns**: <code>Promise.&lt;TYPE.QueryItem&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.QueryItem</code> | a single query activity |
| deployDir | <code>string</code> | directory of deploy files |

<a name="Query.applyTemplateValues"></a>

### Query.applyTemplateValues(code, templateVariables) ⇒ <code>string</code>
helper for buildDefinitionForNested
searches extracted SQL file for template variables and applies the market values

**Kind**: static method of [<code>Query</code>](#Query)  
**Returns**: <code>string</code> - code with markets applied  

| Param | Type | Description |
| --- | --- | --- |
| code | <code>string</code> | code from extracted code |
| templateVariables | <code>TYPE.TemplateMap</code> | variables to be replaced in the metadata |

<a name="Query.buildDefinitionForNested"></a>

### Query.buildDefinitionForNested(templateDir, targetDir, metadata, templateVariables, templateName) ⇒ <code>Promise.&lt;Array.&lt;Array.&lt;string&gt;&gt;&gt;</code>
helper for buildDefinition
handles extracted code if any are found for complex types

**Kind**: static method of [<code>Query</code>](#Query)  
**Returns**: <code>Promise.&lt;Array.&lt;Array.&lt;string&gt;&gt;&gt;</code> - list of extracted files with path-parts provided as an array  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where metadata templates are stored |
| targetDir | <code>string</code> \| <code>Array.&lt;string&gt;</code> | (List of) Directory where built definitions will be saved |
| metadata | <code>TYPE.QueryItem</code> | main JSON file that was read from file system |
| templateVariables | <code>TYPE.TemplateMap</code> | variables to be replaced in the metadata |
| templateName | <code>string</code> | name of the template to be built |

<a name="Query.buildTemplateForNested"></a>

### Query.buildTemplateForNested(templateDir, targetDir, metadata, templateVariables, templateName) ⇒ <code>Promise.&lt;Array.&lt;Array.&lt;string&gt;&gt;&gt;</code>
helper for buildTemplate
handles extracted code if any are found for complex types

**Kind**: static method of [<code>Query</code>](#Query)  
**Returns**: <code>Promise.&lt;Array.&lt;Array.&lt;string&gt;&gt;&gt;</code> - list of extracted files with path-parts provided as an array  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where metadata templates are stored |
| targetDir | <code>string</code> \| <code>Array.&lt;string&gt;</code> | (List of) Directory where built definitions will be saved |
| metadata | <code>TYPE.QueryItem</code> | main JSON file that was read from file system |
| templateVariables | <code>TYPE.TemplateMap</code> | variables to be replaced in the metadata |
| templateName | <code>string</code> | name of the template to be built |

**Example**  
```js
queries are saved as 1 json and 1 sql file. both files need to be run through templating
```
<a name="Query.parseMetadata"></a>

### Query.parseMetadata(metadata) ⇒ <code>TYPE.CodeExtractItem</code>
parses retrieved Metadata before saving

**Kind**: static method of [<code>Query</code>](#Query)  
**Returns**: <code>TYPE.CodeExtractItem</code> - a single item with code parts extracted  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.QueryItem</code> | a single query activity definition |

<a name="Query.getFilesToCommit"></a>

### Query.getFilesToCommit(keyArr) ⇒ <code>Array.&lt;string&gt;</code>
should return only the json for all but asset, query and script that are saved as multiple files
additionally, the documentation for dataExtension and automation should be returned

**Kind**: static method of [<code>Query</code>](#Query)  
**Returns**: <code>Array.&lt;string&gt;</code> - list of all files that need to be committed in a flat array ['path/file1.ext', 'path/file2.ext']  

| Param | Type | Description |
| --- | --- | --- |
| keyArr | <code>Array.&lt;string&gt;</code> | customerkey of the metadata |

<a name="Role"></a>

## Role ⇐ [<code>MetadataType</code>](#MetadataType)
ImportFile MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [Role](#Role) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir, _, buObject, [___], [key])](#Role.retrieve) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
    * [.preDeployTasks(metadata)](#Role.preDeployTasks) ⇒ <code>TYPE.MetadataTypeItem</code>
    * [.create(metadata)](#Role.create) ⇒ <code>Promise</code>
    * [.update(metadata)](#Role.update) ⇒ <code>Promise</code>
    * [.document(buObject, [metadata])](#Role.document) ⇒ <code>Promise.&lt;void&gt;</code>
    * [._traverseRoles(role, element, [permission], [isAllowed])](#Role._traverseRoles) ⇒ <code>void</code>

<a name="Role.retrieve"></a>

### Role.retrieve(retrieveDir, _, buObject, [___], [key]) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Gets metadata from Marketing Cloud

**Kind**: static method of [<code>Role</code>](#Role)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Metadata store object  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| _ | <code>Array.&lt;string&gt;</code> | Returns specified fields even if their retrieve definition is not set to true |
| buObject | <code>TYPE.BuObject</code> | properties for auth |
| [___] | <code>void</code> | unused parameter |
| [key] | <code>string</code> | customer key of single item to retrieve |

<a name="Role.preDeployTasks"></a>

### Role.preDeployTasks(metadata) ⇒ <code>TYPE.MetadataTypeItem</code>
Gets executed before deploying metadata

**Kind**: static method of [<code>Role</code>](#Role)  
**Returns**: <code>TYPE.MetadataTypeItem</code> - Promise of a single metadata item  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeItem</code> | a single metadata item |

<a name="Role.create"></a>

### Role.create(metadata) ⇒ <code>Promise</code>
Create a single Role.

**Kind**: static method of [<code>Role</code>](#Role)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeItem</code> | single metadata entry |

<a name="Role.update"></a>

### Role.update(metadata) ⇒ <code>Promise</code>
Updates a single Role.

**Kind**: static method of [<code>Role</code>](#Role)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeItem</code> | single metadata entry |

<a name="Role.document"></a>

### Role.document(buObject, [metadata]) ⇒ <code>Promise.&lt;void&gt;</code>
Creates markdown documentation of all roles

**Kind**: static method of [<code>Role</code>](#Role)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| buObject | <code>TYPE.BuObject</code> | properties for auth |
| [metadata] | <code>TYPE.MetadataTypeMap</code> | role definitions |

<a name="Role._traverseRoles"></a>

### Role.\_traverseRoles(role, element, [permission], [isAllowed]) ⇒ <code>void</code>
iterates through permissions to output proper row-names for nested permissionss

**Kind**: static method of [<code>Role</code>](#Role)  

| Param | Type | Description |
| --- | --- | --- |
| role | <code>string</code> | name of the user role |
| element | <code>object</code> | data of the permission |
| [permission] | <code>string</code> | name of the permission |
| [isAllowed] | <code>string</code> | "true" / "false" from the |

<a name="Script"></a>

## Script ⇐ [<code>MetadataType</code>](#MetadataType)
Script MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [Script](#Script) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir, [_], [__], [___], [key])](#Script.retrieve) ⇒ <code>Promise.&lt;{metadata: TYPE.ScriptMap, type: string}&gt;</code>
    * [.retrieveForCache()](#Script.retrieveForCache) ⇒ <code>Promise.&lt;{metadata: TYPE.ScriptMap, type: string}&gt;</code>
    * [.retrieveAsTemplate(templateDir, name, templateVariables)](#Script.retrieveAsTemplate) ⇒ <code>Promise.&lt;{metadata: TYPE.Script, type: string}&gt;</code>
    * [.postRetrieveTasks(metadata)](#Script.postRetrieveTasks) ⇒ <code>TYPE.CodeExtractItem</code>
    * [.update(script)](#Script.update) ⇒ <code>Promise</code>
    * [.create(script)](#Script.create) ⇒ <code>Promise</code>
    * [._mergeCode(metadata, deployDir, [templateName])](#Script._mergeCode) ⇒ <code>Promise.&lt;string&gt;</code>
    * [.preDeployTasks(metadata, dir)](#Script.preDeployTasks) ⇒ <code>TYPE.ScriptItem</code>
    * [.buildDefinitionForNested(templateDir, targetDir, metadata, templateVariables, templateName)](#Script.buildDefinitionForNested) ⇒ <code>Promise.&lt;Array.&lt;Array.&lt;string&gt;&gt;&gt;</code>
    * [.buildTemplateForNested(templateDir, targetDir, metadata, templateVariables, templateName)](#Script.buildTemplateForNested) ⇒ <code>Promise.&lt;Array.&lt;Array.&lt;string&gt;&gt;&gt;</code>
    * [._buildForNested(templateDir, targetDir, metadata, templateVariables, templateName, mode)](#Script._buildForNested) ⇒ <code>Promise.&lt;Array.&lt;Array.&lt;string&gt;&gt;&gt;</code>
    * [.parseMetadata(metadata)](#Script.parseMetadata) ⇒ <code>TYPE.CodeExtractItem</code>
    * [.getFilesToCommit(keyArr)](#Script.getFilesToCommit) ⇒ <code>Array.&lt;string&gt;</code>

<a name="Script.retrieve"></a>

### Script.retrieve(retrieveDir, [_], [__], [___], [key]) ⇒ <code>Promise.&lt;{metadata: TYPE.ScriptMap, type: string}&gt;</code>
Retrieves Metadata of Script
Endpoint /automation/v1/scripts/ return all Scripts with all details.

**Kind**: static method of [<code>Script</code>](#Script)  
**Returns**: <code>Promise.&lt;{metadata: TYPE.ScriptMap, type: string}&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| [_] | <code>void</code> | unused parameter |
| [__] | <code>void</code> | unused parameter |
| [___] | <code>void</code> | unused parameter |
| [key] | <code>string</code> | customer key of single item to retrieve |

<a name="Script.retrieveForCache"></a>

### Script.retrieveForCache() ⇒ <code>Promise.&lt;{metadata: TYPE.ScriptMap, type: string}&gt;</code>
Retrieves script metadata for caching

**Kind**: static method of [<code>Script</code>](#Script)  
**Returns**: <code>Promise.&lt;{metadata: TYPE.ScriptMap, type: string}&gt;</code> - Promise  
<a name="Script.retrieveAsTemplate"></a>

### Script.retrieveAsTemplate(templateDir, name, templateVariables) ⇒ <code>Promise.&lt;{metadata: TYPE.Script, type: string}&gt;</code>
Retrieve a specific Script by Name

**Kind**: static method of [<code>Script</code>](#Script)  
**Returns**: <code>Promise.&lt;{metadata: TYPE.Script, type: string}&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| name | <code>string</code> | name of the metadata file |
| templateVariables | <code>TYPE.TemplateMap</code> | variables to be replaced in the metadata |

<a name="Script.postRetrieveTasks"></a>

### Script.postRetrieveTasks(metadata) ⇒ <code>TYPE.CodeExtractItem</code>
manages post retrieve steps

**Kind**: static method of [<code>Script</code>](#Script)  
**Returns**: <code>TYPE.CodeExtractItem</code> - Array with one metadata object and one ssjs string  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.ScriptItem</code> | a single script |

<a name="Script.update"></a>

### Script.update(script) ⇒ <code>Promise</code>
Updates a single Script

**Kind**: static method of [<code>Script</code>](#Script)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| script | <code>TYPE.MetadataTypeItem</code> | a single Script |

<a name="Script.create"></a>

### Script.create(script) ⇒ <code>Promise</code>
Creates a single Script

**Kind**: static method of [<code>Script</code>](#Script)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| script | <code>TYPE.MetadataTypeItem</code> | a single Script |

<a name="Script._mergeCode"></a>

### Script.\_mergeCode(metadata, deployDir, [templateName]) ⇒ <code>Promise.&lt;string&gt;</code>
helper for this.preDeployTasks() that loads extracted code content back into JSON

**Kind**: static method of [<code>Script</code>](#Script)  
**Returns**: <code>Promise.&lt;string&gt;</code> - content for metadata.script  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.ScriptItem</code> | a single asset definition |
| deployDir | <code>string</code> | directory of deploy files |
| [templateName] | <code>string</code> | name of the template used to built defintion (prior applying templating) |

<a name="Script.preDeployTasks"></a>

### Script.preDeployTasks(metadata, dir) ⇒ <code>TYPE.ScriptItem</code>
prepares a Script for deployment

**Kind**: static method of [<code>Script</code>](#Script)  
**Returns**: <code>TYPE.ScriptItem</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.ScriptItem</code> | a single script activity definition |
| dir | <code>string</code> | directory of deploy files |

<a name="Script.buildDefinitionForNested"></a>

### Script.buildDefinitionForNested(templateDir, targetDir, metadata, templateVariables, templateName) ⇒ <code>Promise.&lt;Array.&lt;Array.&lt;string&gt;&gt;&gt;</code>
helper for buildDefinition
handles extracted code if any are found for complex types

**Kind**: static method of [<code>Script</code>](#Script)  
**Returns**: <code>Promise.&lt;Array.&lt;Array.&lt;string&gt;&gt;&gt;</code> - list of extracted files with path-parts provided as an array  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where metadata templates are stored |
| targetDir | <code>string</code> \| <code>Array.&lt;string&gt;</code> | (List of) Directory where built definitions will be saved |
| metadata | <code>TYPE.ScriptItem</code> | main JSON file that was read from file system |
| templateVariables | <code>TYPE.TemplateMap</code> | variables to be replaced in the metadata |
| templateName | <code>string</code> | name of the template to be built |

<a name="Script.buildTemplateForNested"></a>

### Script.buildTemplateForNested(templateDir, targetDir, metadata, templateVariables, templateName) ⇒ <code>Promise.&lt;Array.&lt;Array.&lt;string&gt;&gt;&gt;</code>
helper for buildTemplate
handles extracted code if any are found for complex types

**Kind**: static method of [<code>Script</code>](#Script)  
**Returns**: <code>Promise.&lt;Array.&lt;Array.&lt;string&gt;&gt;&gt;</code> - list of extracted files with path-parts provided as an array  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where metadata templates are stored |
| targetDir | <code>string</code> \| <code>Array.&lt;string&gt;</code> | (List of) Directory where built definitions will be saved |
| metadata | <code>TYPE.ScriptItem</code> | main JSON file that was read from file system |
| templateVariables | <code>TYPE.TemplateMap</code> | variables to be replaced in the metadata |
| templateName | <code>string</code> | name of the template to be built |

**Example**  
```js
scripts are saved as 1 json and 1 ssjs file. both files need to be run through templating
```
<a name="Script._buildForNested"></a>

### Script.\_buildForNested(templateDir, targetDir, metadata, templateVariables, templateName, mode) ⇒ <code>Promise.&lt;Array.&lt;Array.&lt;string&gt;&gt;&gt;</code>
helper for buildTemplateForNested / buildDefinitionForNested
handles extracted code if any are found for complex types

**Kind**: static method of [<code>Script</code>](#Script)  
**Returns**: <code>Promise.&lt;Array.&lt;Array.&lt;string&gt;&gt;&gt;</code> - list of extracted files with path-parts provided as an array  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where metadata templates are stored |
| targetDir | <code>string</code> \| <code>Array.&lt;string&gt;</code> | (List of) Directory where built definitions will be saved |
| metadata | <code>TYPE.ScriptItem</code> | main JSON file that was read from file system |
| templateVariables | <code>TYPE.TemplateMap</code> | variables to be replaced in the metadata |
| templateName | <code>string</code> | name of the template to be built |
| mode | <code>&#x27;definition&#x27;</code> \| <code>&#x27;template&#x27;</code> | defines what we use this helper for |

<a name="Script.parseMetadata"></a>

### Script.parseMetadata(metadata) ⇒ <code>TYPE.CodeExtractItem</code>
Splits the script metadata into two parts and parses in a standard manner

**Kind**: static method of [<code>Script</code>](#Script)  
**Returns**: <code>TYPE.CodeExtractItem</code> - a single item with code parts extracted  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.ScriptItem</code> | a single script activity definition |

<a name="Script.getFilesToCommit"></a>

### Script.getFilesToCommit(keyArr) ⇒ <code>Array.&lt;string&gt;</code>
should return only the json for all but asset, query and script that are saved as multiple files
additionally, the documentation for dataExtension and automation should be returned

**Kind**: static method of [<code>Script</code>](#Script)  
**Returns**: <code>Array.&lt;string&gt;</code> - list of all files that need to be committed in a flat array ['path/file1.ext', 'path/file2.ext']  

| Param | Type | Description |
| --- | --- | --- |
| keyArr | <code>Array.&lt;string&gt;</code> | customerkey of the metadata |

<a name="SetDefinition"></a>

## SetDefinition ⇐ [<code>MetadataType</code>](#MetadataType)
SetDefinition MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [SetDefinition](#SetDefinition) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir, [_], [__], [___], [key])](#SetDefinition.retrieve) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
    * [.retrieveForCache()](#SetDefinition.retrieveForCache) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>

<a name="SetDefinition.retrieve"></a>

### SetDefinition.retrieve(retrieveDir, [_], [__], [___], [key]) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Retrieves Metadata of schema set Definitions.

**Kind**: static method of [<code>SetDefinition</code>](#SetDefinition)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| [_] | <code>void</code> | unused parameter |
| [__] | <code>void</code> | unused parameter |
| [___] | <code>void</code> | unused parameter |
| [key] | <code>string</code> | customer key of single item to retrieve |

<a name="SetDefinition.retrieveForCache"></a>

### SetDefinition.retrieveForCache() ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Retrieves Metadata of schema set definitions for caching.

**Kind**: static method of [<code>SetDefinition</code>](#SetDefinition)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Promise  
<a name="TriggeredSendDefinition"></a>

## TriggeredSendDefinition ⇐ [<code>MetadataType</code>](#MetadataType)
MessageSendActivity MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [TriggeredSendDefinition](#TriggeredSendDefinition) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir, [_], [__], [___], [key])](#TriggeredSendDefinition.retrieve) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
    * [.create(metadata)](#TriggeredSendDefinition.create) ⇒ <code>Promise</code>
    * [.update(metadata)](#TriggeredSendDefinition.update) ⇒ <code>Promise</code>
    * [.deleteByKey(buObject, customerKey)](#TriggeredSendDefinition.deleteByKey) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.postRetrieveTasks(metadata)](#TriggeredSendDefinition.postRetrieveTasks) ⇒ <code>TYPE.MetadataTypeItem</code>
    * [.parseMetadata(metadata)](#TriggeredSendDefinition.parseMetadata) ⇒ <code>TYPE.MetadataTypeItem</code>
    * [.preDeployTasks(metadata)](#TriggeredSendDefinition.preDeployTasks) ⇒ <code>TYPE.MetadataTypeItem</code>

<a name="TriggeredSendDefinition.retrieve"></a>

### TriggeredSendDefinition.retrieve(retrieveDir, [_], [__], [___], [key]) ⇒ <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code>
Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata

**Kind**: static method of [<code>TriggeredSendDefinition</code>](#TriggeredSendDefinition)  
**Returns**: <code>Promise.&lt;TYPE.MetadataTypeMapObj&gt;</code> - Promise of metadata  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| [_] | <code>void</code> | unused parameter |
| [__] | <code>void</code> | unused parameter |
| [___] | <code>void</code> | unused parameter |
| [key] | <code>string</code> | customer key of single item to retrieve |

<a name="TriggeredSendDefinition.create"></a>

### TriggeredSendDefinition.create(metadata) ⇒ <code>Promise</code>
Create a single TSD.

**Kind**: static method of [<code>TriggeredSendDefinition</code>](#TriggeredSendDefinition)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeItem</code> | single metadata entry |

<a name="TriggeredSendDefinition.update"></a>

### TriggeredSendDefinition.update(metadata) ⇒ <code>Promise</code>
Updates a single TSD.

**Kind**: static method of [<code>TriggeredSendDefinition</code>](#TriggeredSendDefinition)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeItem</code> | single metadata entry |

<a name="TriggeredSendDefinition.deleteByKey"></a>

### TriggeredSendDefinition.deleteByKey(buObject, customerKey) ⇒ <code>Promise.&lt;boolean&gt;</code>
Delete a metadata item from the specified business unit

**Kind**: static method of [<code>TriggeredSendDefinition</code>](#TriggeredSendDefinition)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - deletion success status  

| Param | Type | Description |
| --- | --- | --- |
| buObject | <code>TYPE.BuObject</code> | references credentials |
| customerKey | <code>string</code> | Identifier of data extension |

<a name="TriggeredSendDefinition.postRetrieveTasks"></a>

### TriggeredSendDefinition.postRetrieveTasks(metadata) ⇒ <code>TYPE.MetadataTypeItem</code>
manages post retrieve steps

**Kind**: static method of [<code>TriggeredSendDefinition</code>](#TriggeredSendDefinition)  
**Returns**: <code>TYPE.MetadataTypeItem</code> - Array with one metadata object and one query string  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeItem</code> | a single query |

<a name="TriggeredSendDefinition.parseMetadata"></a>

### TriggeredSendDefinition.parseMetadata(metadata) ⇒ <code>TYPE.MetadataTypeItem</code>
parses retrieved Metadata before saving

**Kind**: static method of [<code>TriggeredSendDefinition</code>](#TriggeredSendDefinition)  
**Returns**: <code>TYPE.MetadataTypeItem</code> - Array with one metadata object and one sql string  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeItem</code> | a single query activity definition |

<a name="TriggeredSendDefinition.preDeployTasks"></a>

### TriggeredSendDefinition.preDeployTasks(metadata) ⇒ <code>TYPE.MetadataTypeItem</code>
prepares a TSD for deployment

**Kind**: static method of [<code>TriggeredSendDefinition</code>](#TriggeredSendDefinition)  
**Returns**: <code>TYPE.MetadataTypeItem</code> - metadata object  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>TYPE.MetadataTypeItem</code> | of a single TSD |

<a name="Retriever"></a>

## Retriever
Retrieves metadata from a business unit and saves it to the local filesystem.

**Kind**: global class  

* [Retriever](#Retriever)
    * [new Retriever(properties, buObject)](#new_Retriever_new)
    * [.retrieve(metadataTypes, [namesOrKeys], [templateVariables], [changelogOnly])](#Retriever+retrieve) ⇒ <code>Promise.&lt;TYPE.MultiMetadataTypeList&gt;</code>

<a name="new_Retriever_new"></a>

### new Retriever(properties, buObject)
Creates a Retriever, uses v2 auth if v2AuthOptions are passed.


| Param | Type | Description |
| --- | --- | --- |
| properties | <code>TYPE.Mcdevrc</code> | General configuration to be used in retrieve |
| buObject | <code>TYPE.BuObject</code> | properties for auth |

<a name="Retriever+retrieve"></a>

### retriever.retrieve(metadataTypes, [namesOrKeys], [templateVariables], [changelogOnly]) ⇒ <code>Promise.&lt;TYPE.MultiMetadataTypeList&gt;</code>
Retrieve metadata of specified types into local file system and Retriever.metadata

**Kind**: instance method of [<code>Retriever</code>](#Retriever)  
**Returns**: <code>Promise.&lt;TYPE.MultiMetadataTypeList&gt;</code> - Promise of a list of retrieved items grouped by type {automation:[...], query:[...]}  

| Param | Type | Description |
| --- | --- | --- |
| metadataTypes | <code>Array.&lt;string&gt;</code> | String list of metadata types to retrieve |
| [namesOrKeys] | <code>Array.&lt;string&gt;</code> | name of Metadata to retrieveAsTemplate or list of keys for normal retrieval |
| [templateVariables] | <code>TYPE.TemplateMap</code> | Object of values which can be replaced (in case of templating) |
| [changelogOnly] | <code>boolean</code> | skip saving, only create json in memory |

<a name="Util"></a>

## Util
CLI entry for SFMC DevTools

**Kind**: global constant  

* [Util](#Util)
    * [.skipInteraction](#Util.skipInteraction) : <code>TYPE.skipInteraction</code>
    * [.logger](#Util.logger) : <code>TYPE.Logger</code>
    * [.filterObjByKeys(originalObj, [whitelistArr])](#Util.filterObjByKeys) ⇒ <code>Object.&lt;string, \*&gt;</code>
    * [.includesStartsWith(arr, search)](#Util.includesStartsWith) ⇒ <code>boolean</code>
    * [.includesStartsWithIndex(arr, search)](#Util.includesStartsWithIndex) ⇒ <code>number</code>
    * [.checkMarket(market, properties)](#Util.checkMarket) ⇒ <code>boolean</code>
    * [.verifyMarketList(mlName, properties)](#Util.verifyMarketList) ⇒ <code>void</code>
    * [.signalFatalError()](#Util.signalFatalError) ⇒ <code>void</code>
    * [.isTrue(attrValue)](#Util.isTrue) ⇒ <code>boolean</code>
    * [.isFalse(attrValue)](#Util.isFalse) ⇒ <code>boolean</code>
    * [._isValidType(selectedType)](#Util._isValidType) ⇒ <code>boolean</code>
    * [.getDefaultProperties()](#Util.getDefaultProperties) ⇒ <code>TYPE.Mcdevrc</code>
    * [.getRetrieveTypeChoices()](#Util.getRetrieveTypeChoices) ⇒ <code>Array.&lt;string&gt;</code>
    * [.checkProperties(properties, [silent])](#Util.checkProperties) ⇒ <code>Promise.&lt;(boolean\|Array.&lt;string&gt;)&gt;</code>
    * [.metadataLogger(level, type, method, payload, [source])](#Util.metadataLogger) ⇒ <code>void</code>
    * [.replaceByObject(str, obj)](#Util.replaceByObject) ⇒ <code>string</code> \| <code>object</code>
    * [.inverseGet(objs, val)](#Util.inverseGet) ⇒ <code>string</code>
    * [.getMetadataHierachy(metadataTypes)](#Util.getMetadataHierachy) ⇒ <code>Array.&lt;string&gt;</code>
    * [.resolveObjPath(path, obj)](#Util.resolveObjPath) ⇒ <code>any</code>
    * [.execSync(cmd, [args])](#Util.execSync) ⇒ <code>undefined</code>
    * [.templateSearchResult(results, keyToSearch, searchValue)](#Util.templateSearchResult) ⇒ <code>TYPE.MetadataTypeItem</code>
    * [.setLoggingLevel(argv)](#Util.setLoggingLevel) ⇒ <code>void</code>

<a name="Util.skipInteraction"></a>

### Util.skipInteraction : <code>TYPE.skipInteraction</code>
**Kind**: static property of [<code>Util</code>](#Util)  
<a name="Util.logger"></a>

### Util.logger : <code>TYPE.Logger</code>
Logger that creates timestamped log file in 'logs/' directory

**Kind**: static property of [<code>Util</code>](#Util)  
<a name="Util.filterObjByKeys"></a>

### Util.filterObjByKeys(originalObj, [whitelistArr]) ⇒ <code>Object.&lt;string, \*&gt;</code>
helper that allows filtering an object by its keys

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>Object.&lt;string, \*&gt;</code> - filtered object that only contains keys you provided  

| Param | Type | Description |
| --- | --- | --- |
| originalObj | <code>Object.&lt;string, \*&gt;</code> | object that you want to filter |
| [whitelistArr] | <code>Array.&lt;string&gt;</code> | positive filter. if not provided, returns originalObj without filter |

<a name="Util.includesStartsWith"></a>

### Util.includesStartsWith(arr, search) ⇒ <code>boolean</code>
extended Array.includes method that allows check if an array-element starts with a certain string

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>boolean</code> - found / not found  

| Param | Type | Description |
| --- | --- | --- |
| arr | <code>Array.&lt;string&gt;</code> | your array of strigns |
| search | <code>string</code> | the string you are looking for |

<a name="Util.includesStartsWithIndex"></a>

### Util.includesStartsWithIndex(arr, search) ⇒ <code>number</code>
extended Array.includes method that allows check if an array-element starts with a certain string

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>number</code> - array index 0..n or -1 of not found  

| Param | Type | Description |
| --- | --- | --- |
| arr | <code>Array.&lt;string&gt;</code> | your array of strigns |
| search | <code>string</code> | the string you are looking for |

<a name="Util.checkMarket"></a>

### Util.checkMarket(market, properties) ⇒ <code>boolean</code>
check if a market name exists in current mcdev config

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>boolean</code> - found market or not  

| Param | Type | Description |
| --- | --- | --- |
| market | <code>string</code> | market localizations |
| properties | <code>TYPE.Mcdevrc</code> | local mcdev config |

<a name="Util.verifyMarketList"></a>

### Util.verifyMarketList(mlName, properties) ⇒ <code>void</code>
ensure provided MarketList exists and it's content including markets and BUs checks out

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>void</code> - throws errors if problems were found  

| Param | Type | Description |
| --- | --- | --- |
| mlName | <code>string</code> | name of marketList |
| properties | <code>TYPE.Mcdevrc</code> | General configuration to be used in retrieve |

<a name="Util.signalFatalError"></a>

### Util.signalFatalError() ⇒ <code>void</code>
used to ensure the program tells surrounding software that an unrecoverable error occured

**Kind**: static method of [<code>Util</code>](#Util)  
<a name="Util.isTrue"></a>

### Util.isTrue(attrValue) ⇒ <code>boolean</code>
SFMC accepts multiple true values for Boolean attributes for which we are checking here

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>boolean</code> - attribute value == true ? true : false  

| Param | Type | Description |
| --- | --- | --- |
| attrValue | <code>\*</code> | value |

<a name="Util.isFalse"></a>

### Util.isFalse(attrValue) ⇒ <code>boolean</code>
SFMC accepts multiple false values for Boolean attributes for which we are checking here

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>boolean</code> - attribute value == false ? true : false  

| Param | Type | Description |
| --- | --- | --- |
| attrValue | <code>\*</code> | value |

<a name="Util._isValidType"></a>

### Util.\_isValidType(selectedType) ⇒ <code>boolean</code>
helper for retrieve, retrieveAsTemplate and deploy

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>boolean</code> - type ok or not  

| Param | Type | Description |
| --- | --- | --- |
| selectedType | <code>string</code> | type or type-subtype |

<a name="Util.getDefaultProperties"></a>

### Util.getDefaultProperties() ⇒ <code>TYPE.Mcdevrc</code>
defines how the properties.json should look like
used for creating a template and for checking if variables are set

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>TYPE.Mcdevrc</code> - default properties  
<a name="Util.getRetrieveTypeChoices"></a>

### Util.getRetrieveTypeChoices() ⇒ <code>Array.&lt;string&gt;</code>
helper for getDefaultProperties()

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>Array.&lt;string&gt;</code> - type choices  
<a name="Util.checkProperties"></a>

### Util.checkProperties(properties, [silent]) ⇒ <code>Promise.&lt;(boolean\|Array.&lt;string&gt;)&gt;</code>
check if the config file is correctly formatted and has values

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>Promise.&lt;(boolean\|Array.&lt;string&gt;)&gt;</code> - file structure ok OR list of fields to be fixed  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>TYPE.Mcdevrc</code> | javascript object in .mcdevrc.json |
| [silent] | <code>boolean</code> | set to true for internal use w/o cli output |

<a name="Util.metadataLogger"></a>

### Util.metadataLogger(level, type, method, payload, [source]) ⇒ <code>void</code>
Logger helper for Metadata functions

**Kind**: static method of [<code>Util</code>](#Util)  

| Param | Type | Description |
| --- | --- | --- |
| level | <code>string</code> | of log (error, info, warn) |
| type | <code>string</code> | of metadata being referenced |
| method | <code>string</code> | name which log was called from |
| payload | <code>\*</code> | generic object which details the error |
| [source] | <code>string</code> | key/id of metadata which relates to error |

<a name="Util.replaceByObject"></a>

### Util.replaceByObject(str, obj) ⇒ <code>string</code> \| <code>object</code>
replaces values in a JSON object string, based on a series of
key-value pairs (obj)

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>string</code> \| <code>object</code> - replaced version of str  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>string</code> \| <code>object</code> | JSON object or its stringified version, which has values to be replaced |
| obj | <code>TYPE.TemplateMap</code> | key value object which contains keys to be replaced and values to be replaced with |

<a name="Util.inverseGet"></a>

### Util.inverseGet(objs, val) ⇒ <code>string</code>
get key of an object based on the first matching value

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>string</code> - key  

| Param | Type | Description |
| --- | --- | --- |
| objs | <code>object</code> | object of objects to be searched |
| val | <code>string</code> | value to be searched for |

<a name="Util.getMetadataHierachy"></a>

### Util.getMetadataHierachy(metadataTypes) ⇒ <code>Array.&lt;string&gt;</code>
Returns Order in which metadata needs to be retrieved/deployed

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>Array.&lt;string&gt;</code> - retrieve/deploy order as array  

| Param | Type | Description |
| --- | --- | --- |
| metadataTypes | <code>Array.&lt;string&gt;</code> | which should be retrieved/deployed |

<a name="Util.resolveObjPath"></a>

### Util.resolveObjPath(path, obj) ⇒ <code>any</code>
let's you dynamically walk down an object and get a value

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>any</code> - value of obj.path  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | 'fieldA.fieldB.fieldC' |
| obj | <code>object</code> | some parent object |

<a name="Util.execSync"></a>

### Util.execSync(cmd, [args]) ⇒ <code>undefined</code>
helper to run other commands as if run manually by user

**Kind**: static method of [<code>Util</code>](#Util)  

| Param | Type | Description |
| --- | --- | --- |
| cmd | <code>string</code> | to be executed command |
| [args] | <code>Array.&lt;string&gt;</code> | list of arguments |

<a name="Util.templateSearchResult"></a>

### Util.templateSearchResult(results, keyToSearch, searchValue) ⇒ <code>TYPE.MetadataTypeItem</code>
standardize check to ensure only one result is returned from template search

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>TYPE.MetadataTypeItem</code> - metadata to be used in building template  

| Param | Type | Description |
| --- | --- | --- |
| results | <code>Array.&lt;TYPE.MetadataTypeItem&gt;</code> | array of metadata |
| keyToSearch | <code>string</code> | the field which contains the searched value |
| searchValue | <code>string</code> | the value which is being looked for |

<a name="Util.setLoggingLevel"></a>

### Util.setLoggingLevel(argv) ⇒ <code>void</code>
configures what is displayed in the console

**Kind**: static method of [<code>Util</code>](#Util)  

| Param | Type | Description |
| --- | --- | --- |
| argv | <code>object</code> | list of command line parameters given by user |
| [argv.silent] | <code>boolean</code> | only errors printed to CLI |
| [argv.verbose] | <code>boolean</code> | chatty user CLI output |
| [argv.debug] | <code>boolean</code> | enables developer output & features |

<a name="MetadataTypeDefinitions"></a>

## MetadataTypeDefinitions
Provides access to all metadataType classes

**Kind**: global constant  
<a name="MetadataTypeInfo"></a>

## MetadataTypeInfo
Provides access to all metadataType classes

**Kind**: global constant  
<a name="mcdev"></a>

## mcdev
sample file on how to retrieve a simple changelog to use in GUIs or automated processing of any kind

**Kind**: global constant  
**Example**  
```js
[{
    name: 'deName',
    key: 'deKey',
    t: 'dataExtension',
    cd: '2020-05-06T00:16:00.737',
    cb: 'name of creator',
    ld: '2020-05-06T00:16:00.737',
    lb: 'name of lastmodified'
  }]
```
<a name="BusinessUnit"></a>

## BusinessUnit
Helper that handles retrieval of BU info

**Kind**: global constant  
<a name="BusinessUnit.refreshBUProperties"></a>

### BusinessUnit.refreshBUProperties(properties, credentialsName) ⇒ <code>Promise.&lt;boolean&gt;</code>
Refreshes BU names and ID's from MC instance

**Kind**: static method of [<code>BusinessUnit</code>](#BusinessUnit)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - success of refresh  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>TYPE.Mcdevrc</code> | current properties that have to be refreshed |
| credentialsName | <code>string</code> | identifying name of the installed package / project |

<a name="dataStore"></a>

## dataStore : <code>TYPE.Cache</code>
**Kind**: global constant  
<a name="Cli"></a>

## Cli
CLI helper class

**Kind**: global constant  

* [Cli](#Cli)
    * [.initMcdevConfig([skipInteraction])](#Cli.initMcdevConfig) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.addExtraCredential(properties, [skipInteraction])](#Cli.addExtraCredential) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.updateCredential(properties, credName, [skipInteraction])](#Cli.updateCredential) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.getCredentialObject(properties, target, [isCredentialOnly], [allowAll])](#Cli.getCredentialObject) ⇒ <code>Promise.&lt;TYPE.BuObject&gt;</code>
    * [._selectBU(properties, [credential], [isCredentialOnly], [allowAll])](#Cli._selectBU) ⇒ <code>Promise.&lt;Array&gt;</code>
    * [._setCredential(properties, [credName], [skipInteraction])](#Cli._setCredential) ⇒ <code>Promise.&lt;(boolean\|string)&gt;</code>
    * [._askCredentials(properties, [credName])](#Cli._askCredentials) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.selectTypes(properties, [setTypesArr])](#Cli.selectTypes) ⇒ <code>Promise.&lt;void&gt;</code>
    * [._summarizeSubtypes(responses, type)](#Cli._summarizeSubtypes) ⇒ <code>void</code>
    * [.explainTypes()](#Cli.explainTypes) ⇒ <code>void</code>

<a name="Cli.initMcdevConfig"></a>

### Cli.initMcdevConfig([skipInteraction]) ⇒ <code>Promise.&lt;boolean&gt;</code>
used when initially setting up a project.
loads default config and adds first credential

**Kind**: static method of [<code>Cli</code>](#Cli)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - success of init  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>TYPE.skipInteraction</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Cli.addExtraCredential"></a>

### Cli.addExtraCredential(properties, [skipInteraction]) ⇒ <code>Promise.&lt;void&gt;</code>
Extends template file for properties.json

**Kind**: static method of [<code>Cli</code>](#Cli)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>TYPE.Mcdevrc</code> | config file's json |
| [skipInteraction] | <code>TYPE.skipInteraction</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Cli.updateCredential"></a>

### Cli.updateCredential(properties, credName, [skipInteraction]) ⇒ <code>Promise.&lt;boolean&gt;</code>
Extends template file for properties.json
update credentials

**Kind**: static method of [<code>Cli</code>](#Cli)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - success of update  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>TYPE.Mcdevrc</code> | config file's json |
| credName | <code>string</code> | name of credential that needs updating |
| [skipInteraction] | <code>TYPE.skipInteraction</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Cli.getCredentialObject"></a>

### Cli.getCredentialObject(properties, target, [isCredentialOnly], [allowAll]) ⇒ <code>Promise.&lt;TYPE.BuObject&gt;</code>
Returns Object with parameters required for accessing API

**Kind**: static method of [<code>Cli</code>](#Cli)  
**Returns**: <code>Promise.&lt;TYPE.BuObject&gt;</code> - credential to be used for Business Unit  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>TYPE.Mcdevrc</code> | object of all configuration including credentials |
| target | <code>string</code> | code of BU to use |
| [isCredentialOnly] | <code>boolean</code> \| <code>string</code> | true:don't ask for BU | string: name of BU |
| [allowAll] | <code>boolean</code> | Offer ALL as option in BU selection |

<a name="Cli._selectBU"></a>

### Cli.\_selectBU(properties, [credential], [isCredentialOnly], [allowAll]) ⇒ <code>Promise.&lt;Array&gt;</code>
helps select the right credential in case of bad initial input

**Kind**: static method of [<code>Cli</code>](#Cli)  
**Returns**: <code>Promise.&lt;Array&gt;</code> - selected credential/BU combo  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>TYPE.Mcdevrc</code> | config file's json |
| [credential] | <code>string</code> | name of valid credential |
| [isCredentialOnly] | <code>boolean</code> | don't ask for BU if true |
| [allowAll] | <code>boolean</code> | Offer ALL as option in BU selection |

<a name="Cli._setCredential"></a>

### Cli.\_setCredential(properties, [credName], [skipInteraction]) ⇒ <code>Promise.&lt;(boolean\|string)&gt;</code>
helper around _askCredentials

**Kind**: static method of [<code>Cli</code>](#Cli)  
**Returns**: <code>Promise.&lt;(boolean\|string)&gt;</code> - success of refresh or credential name  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>TYPE.Mcdevrc</code> | from config file |
| [credName] | <code>string</code> | name of credential that needs updating |
| [skipInteraction] | <code>TYPE.skipInteraction</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Cli._askCredentials"></a>

### Cli.\_askCredentials(properties, [credName]) ⇒ <code>Promise.&lt;object&gt;</code>
helper for addExtraCredential()

**Kind**: static method of [<code>Cli</code>](#Cli)  
**Returns**: <code>Promise.&lt;object&gt;</code> - credential info  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>TYPE.Mcdevrc</code> | from config file |
| [credName] | <code>string</code> | name of credential that needs updating |

<a name="Cli.selectTypes"></a>

### Cli.selectTypes(properties, [setTypesArr]) ⇒ <code>Promise.&lt;void&gt;</code>
allows updating the metadata types that shall be retrieved

**Kind**: static method of [<code>Cli</code>](#Cli)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>TYPE.Mcdevrc</code> | config file's json |
| [setTypesArr] | <code>Array.&lt;string&gt;</code> | skip user prompt and overwrite with this list if given |

<a name="Cli._summarizeSubtypes"></a>

### Cli.\_summarizeSubtypes(responses, type) ⇒ <code>void</code>
helper for this.selectTypes() that converts subtypes back to main type if all and only defaults were selected
this keeps the config automatically upgradable when we add new subtypes or change what is selected by default

**Kind**: static method of [<code>Cli</code>](#Cli)  

| Param | Type | Description |
| --- | --- | --- |
| responses | <code>object</code> | wrapper object for respones |
| responses.selectedTypes | <code>Array.&lt;string&gt;</code> | what types the user selected |
| type | <code>string</code> | metadata type |

<a name="Cli.explainTypes"></a>

### Cli.explainTypes() ⇒ <code>void</code>
shows metadata type descriptions

**Kind**: static method of [<code>Cli</code>](#Cli)  
**Returns**: <code>void</code> - -  
<a name="DevOps"></a>

## DevOps
DevOps helper class

**Kind**: global constant  

* [DevOps](#DevOps)
    * [.getDeltaList(properties, [range], [saveToDeployDir], [filterPaths])](#DevOps.getDeltaList) ⇒ <code>Promise.&lt;Array.&lt;TYPE.DeltaPkgItem&gt;&gt;</code>
        * [~delta](#DevOps.getDeltaList..delta) : <code>Array.&lt;TYPE.DeltaPkgItem&gt;</code>
        * [~copied](#DevOps.getDeltaList..copied) : <code>TYPE.DeltaPkgItem</code>
    * [.buildDeltaDefinitions(properties, range, [skipInteraction])](#DevOps.buildDeltaDefinitions)
    * [.document(directory, jsonReport)](#DevOps.document) ⇒ <code>void</code>
    * [.getFilesToCommit(properties, buObject, metadataType, keyArr)](#DevOps.getFilesToCommit) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>

<a name="DevOps.getDeltaList"></a>

### DevOps.getDeltaList(properties, [range], [saveToDeployDir], [filterPaths]) ⇒ <code>Promise.&lt;Array.&lt;TYPE.DeltaPkgItem&gt;&gt;</code>
Extracts the delta between a commit and the current state for deployment.
Interactive commit selection if no commits are passed.

**Kind**: static method of [<code>DevOps</code>](#DevOps)  
**Returns**: <code>Promise.&lt;Array.&lt;TYPE.DeltaPkgItem&gt;&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>TYPE.Mcdevrc</code> | central properties object |
| [range] | <code>string</code> | git commit range |
| [saveToDeployDir] | <code>boolean</code> | if true, copy metadata changes into deploy directory |
| [filterPaths] | <code>string</code> | filter file paths that start with any specified path (comma separated) |


* [.getDeltaList(properties, [range], [saveToDeployDir], [filterPaths])](#DevOps.getDeltaList) ⇒ <code>Promise.&lt;Array.&lt;TYPE.DeltaPkgItem&gt;&gt;</code>
    * [~delta](#DevOps.getDeltaList..delta) : <code>Array.&lt;TYPE.DeltaPkgItem&gt;</code>
    * [~copied](#DevOps.getDeltaList..copied) : <code>TYPE.DeltaPkgItem</code>

<a name="DevOps.getDeltaList..delta"></a>

#### getDeltaList~delta : <code>Array.&lt;TYPE.DeltaPkgItem&gt;</code>
**Kind**: inner constant of [<code>getDeltaList</code>](#DevOps.getDeltaList)  
<a name="DevOps.getDeltaList..copied"></a>

#### getDeltaList~copied : <code>TYPE.DeltaPkgItem</code>
**Kind**: inner constant of [<code>getDeltaList</code>](#DevOps.getDeltaList)  
<a name="DevOps.buildDeltaDefinitions"></a>

### DevOps.buildDeltaDefinitions(properties, range, [skipInteraction])
wrapper around DevOps.getDeltaList, Builder.buildTemplate and M

**Kind**: static method of [<code>DevOps</code>](#DevOps)  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>TYPE.Mcdevrc</code> | project config file |
| range | <code>string</code> | git commit range |
| [skipInteraction] | <code>TYPE.SkipInteraction</code> | allows to skip interactive wizard |

<a name="DevOps.document"></a>

### DevOps.document(directory, jsonReport) ⇒ <code>void</code>
create markdown file for deployment listing

**Kind**: static method of [<code>DevOps</code>](#DevOps)  

| Param | Type | Description |
| --- | --- | --- |
| directory | <code>string</code> | - |
| jsonReport | <code>object</code> | - |

<a name="DevOps.getFilesToCommit"></a>

### DevOps.getFilesToCommit(properties, buObject, metadataType, keyArr) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
should return only the json for all but asset, query and script that are saved as multiple files
additionally, the documentation for dataExtension and automation should be returned

**Kind**: static method of [<code>DevOps</code>](#DevOps)  
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - list of all files that need to be committed in a flat array ['path/file1.ext', 'path/file2.ext']  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>TYPE.Mcdevrc</code> | central properties object |
| buObject | <code>TYPE.BuObject</code> | references credentials |
| metadataType | <code>string</code> | metadata type to build |
| keyArr | <code>Array.&lt;string&gt;</code> | customerkey of the metadata |

<a name="File"></a>

## File
File extends fs-extra. It adds logger and util methods for file handling

**Kind**: global constant  

* [File](#File)
    * [.copyFile(from, to)](#File.copyFile) ⇒ <code>object</code>
    * [.filterIllegalPathChars(path)](#File.filterIllegalPathChars) ⇒ <code>string</code>
    * [.filterIllegalFilenames(filename)](#File.filterIllegalFilenames) ⇒ <code>string</code>
    * [.reverseFilterIllegalFilenames(filename)](#File.reverseFilterIllegalFilenames) ⇒ <code>string</code>
    * [.normalizePath(denormalizedPath)](#File.normalizePath) ⇒ <code>string</code>
    * [.writeJSONToFile(directory, filename, content)](#File.writeJSONToFile) ⇒ <code>Promise</code>
    * [.writePrettyToFile(directory, filename, filetype, content, [templateVariables])](#File.writePrettyToFile) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [._beautify_prettier(directory, filename, filetype, content)](#File._beautify_prettier) ⇒ <code>string</code>
    * [.writeToFile(directory, filename, filetype, content, [encoding])](#File.writeToFile) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.readJSONFile(directory, filename, sync, cleanPath)](#File.readJSONFile) ⇒ <code>Promise</code> \| <code>object</code>
    * [.readFilteredFilename(directory, filename, filetype, [encoding])](#File.readFilteredFilename) ⇒ <code>Promise.&lt;string&gt;</code>
    * [.readDirectories(directory, depth, [includeStem], [_stemLength])](#File.readDirectories) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
    * [.readDirectoriesSync(directory, [depth], [includeStem], [_stemLength])](#File.readDirectoriesSync) ⇒ <code>Array.&lt;string&gt;</code>
    * [.loadConfigFile([silent])](#File.loadConfigFile) ⇒ <code>TYPE.Mcdevrc</code>
    * [.saveConfigFile(properties)](#File.saveConfigFile) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.initPrettier([filetype])](#File.initPrettier) ⇒ <code>Promise.&lt;boolean&gt;</code>

<a name="File.copyFile"></a>

### File.copyFile(from, to) ⇒ <code>object</code>
copies a file from one path to another

**Kind**: static method of [<code>File</code>](#File)  
**Returns**: <code>object</code> - - results object  

| Param | Type | Description |
| --- | --- | --- |
| from | <code>string</code> | full filepath including name of existing file |
| to | <code>string</code> | full filepath including name where file should go |

<a name="File.filterIllegalPathChars"></a>

### File.filterIllegalPathChars(path) ⇒ <code>string</code>
makes sure Windows accepts path names

**Kind**: static method of [<code>File</code>](#File)  
**Returns**: <code>string</code> - - corrected string  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | filename or path |

<a name="File.filterIllegalFilenames"></a>

### File.filterIllegalFilenames(filename) ⇒ <code>string</code>
makes sure Windows accepts file names

**Kind**: static method of [<code>File</code>](#File)  
**Returns**: <code>string</code> - - corrected string  

| Param | Type | Description |
| --- | --- | --- |
| filename | <code>string</code> | filename or path |

<a name="File.reverseFilterIllegalFilenames"></a>

### File.reverseFilterIllegalFilenames(filename) ⇒ <code>string</code>
makes sure Windows accepts file names

**Kind**: static method of [<code>File</code>](#File)  
**Returns**: <code>string</code> - - corrected string  

| Param | Type | Description |
| --- | --- | --- |
| filename | <code>string</code> | filename or path |

<a name="File.normalizePath"></a>

### File.normalizePath(denormalizedPath) ⇒ <code>string</code>
Takes various types of path strings and formats into a platform specific path

**Kind**: static method of [<code>File</code>](#File)  
**Returns**: <code>string</code> - Path strings  

| Param | Type | Description |
| --- | --- | --- |
| denormalizedPath | <code>string</code> \| <code>Array.&lt;string&gt;</code> | directory the file will be written to |

<a name="File.writeJSONToFile"></a>

### File.writeJSONToFile(directory, filename, content) ⇒ <code>Promise</code>
Saves json content to a file in the local file system. Will create the parent directory if it does not exist

**Kind**: static method of [<code>File</code>](#File)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| directory | <code>string</code> \| <code>Array.&lt;string&gt;</code> | directory the file will be written to |
| filename | <code>string</code> | name of the file without '.json' ending |
| content | <code>object</code> | filecontent |

<a name="File.writePrettyToFile"></a>

### File.writePrettyToFile(directory, filename, filetype, content, [templateVariables]) ⇒ <code>Promise.&lt;boolean&gt;</code>
Saves beautified files in the local file system. Will create the parent directory if it does not exist
! Important: run 'await File.initPrettier()' in your MetadataType.retrieve() once before hitting this

**Kind**: static method of [<code>File</code>](#File)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| directory | <code>string</code> \| <code>Array.&lt;string&gt;</code> | directory the file will be written to |
| filename | <code>string</code> | name of the file without suffix |
| filetype | <code>string</code> | filetype ie. JSON or SSJS |
| content | <code>string</code> | filecontent |
| [templateVariables] | <code>TYPE.TemplateMap</code> | templating variables to be replaced in the metadata |

<a name="File._beautify_prettier"></a>

### File.\_beautify\_prettier(directory, filename, filetype, content) ⇒ <code>string</code>
helper for writePrettyToFile, applying prettier onto given stringified content
! Important: run 'await File.initPrettier()' in your MetadataType.retrieve() once before hitting this

**Kind**: static method of [<code>File</code>](#File)  
**Returns**: <code>string</code> - original string on error; formatted string on success  

| Param | Type | Description |
| --- | --- | --- |
| directory | <code>string</code> \| <code>Array.&lt;string&gt;</code> | directory the file will be written to |
| filename | <code>string</code> | name of the file without suffix |
| filetype | <code>string</code> | filetype ie. JSON or SSJS |
| content | <code>string</code> | filecontent |

<a name="File.writeToFile"></a>

### File.writeToFile(directory, filename, filetype, content, [encoding]) ⇒ <code>Promise.&lt;boolean&gt;</code>
Saves text content to a file in the local file system. Will create the parent directory if it does not exist

**Kind**: static method of [<code>File</code>](#File)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| directory | <code>string</code> \| <code>Array.&lt;string&gt;</code> | directory the file will be written to |
| filename | <code>string</code> | name of the file without '.json' ending |
| filetype | <code>string</code> | filetype suffix |
| content | <code>string</code> | filecontent |
| [encoding] | <code>object</code> | added for certain file types (like images) |

<a name="File.readJSONFile"></a>

### File.readJSONFile(directory, filename, sync, cleanPath) ⇒ <code>Promise</code> \| <code>object</code>
Saves json content to a file in the local file system. Will create the parent directory if it does not exist

**Kind**: static method of [<code>File</code>](#File)  
**Returns**: <code>Promise</code> \| <code>object</code> - Promise or JSON object depending on if async or not  

| Param | Type | Description |
| --- | --- | --- |
| directory | <code>string</code> \| <code>Array.&lt;string&gt;</code> | directory where the file is stored |
| filename | <code>string</code> | name of the file without '.json' ending |
| sync | <code>boolean</code> | should execute sync (default is async) |
| cleanPath | <code>boolean</code> | should execute sync (default is true) |

<a name="File.readFilteredFilename"></a>

### File.readFilteredFilename(directory, filename, filetype, [encoding]) ⇒ <code>Promise.&lt;string&gt;</code>
reads file from local file system.

**Kind**: static method of [<code>File</code>](#File)  
**Returns**: <code>Promise.&lt;string&gt;</code> - file contents  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| directory | <code>string</code> \| <code>Array.&lt;string&gt;</code> |  | directory where the file is stored |
| filename | <code>string</code> |  | name of the file without '.json' ending |
| filetype | <code>string</code> |  | filetype suffix |
| [encoding] | <code>string</code> | <code>&quot;&#x27;utf8&#x27;&quot;</code> | read file with encoding (defaults to utf-8) |

<a name="File.readDirectories"></a>

### File.readDirectories(directory, depth, [includeStem], [_stemLength]) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
reads directories to a specific depth returning an array
of file paths to be iterated over

**Kind**: static method of [<code>File</code>](#File)  
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - array of fully defined file paths  

| Param | Type | Description |
| --- | --- | --- |
| directory | <code>string</code> | directory to checkin |
| depth | <code>number</code> | how many levels to check (1 base) |
| [includeStem] | <code>boolean</code> | include the parent directory in the response |
| [_stemLength] | <code>number</code> | set recursively for subfolders. do not set manually! |

**Example**  
```js
['deploy/mcdev/bu1']
```
<a name="File.readDirectoriesSync"></a>

### File.readDirectoriesSync(directory, [depth], [includeStem], [_stemLength]) ⇒ <code>Array.&lt;string&gt;</code>
reads directories to a specific depth returning an array
of file paths to be iterated over using sync api (required in constructors)
TODO - merge with readDirectories. so far the logic is really different

**Kind**: static method of [<code>File</code>](#File)  
**Returns**: <code>Array.&lt;string&gt;</code> - array of fully defined file paths  

| Param | Type | Description |
| --- | --- | --- |
| directory | <code>string</code> | directory to checkin |
| [depth] | <code>number</code> | how many levels to check (1 base) |
| [includeStem] | <code>boolean</code> | include the parent directory in the response |
| [_stemLength] | <code>number</code> | set recursively for subfolders. do not set manually! |

**Example**  
```js
['deploy/mcdev/bu1']
```
<a name="File.loadConfigFile"></a>

### File.loadConfigFile([silent]) ⇒ <code>TYPE.Mcdevrc</code>
loads central properties from config file

**Kind**: static method of [<code>File</code>](#File)  
**Returns**: <code>TYPE.Mcdevrc</code> - central properties object  

| Param | Type | Description |
| --- | --- | --- |
| [silent] | <code>boolean</code> | omit throwing errors and print messages; assuming not silent if not set |

<a name="File.saveConfigFile"></a>

### File.saveConfigFile(properties) ⇒ <code>Promise.&lt;void&gt;</code>
helper that splits the config back into auth & config parts to save them separately

**Kind**: static method of [<code>File</code>](#File)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>TYPE.Mcdevrc</code> | central properties object |

<a name="File.initPrettier"></a>

### File.initPrettier([filetype]) ⇒ <code>Promise.&lt;boolean&gt;</code>
Initalises Prettier formatting lib async.

**Kind**: static method of [<code>File</code>](#File)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - success of config load  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [filetype] | <code>string</code> | <code>&quot;&#x27;html&#x27;&quot;</code> | filetype ie. JSON or SSJS |

<a name="Init"></a>

## Init
CLI helper class

**Kind**: global constant  

* [Init](#Init)
    * [.fixMcdevConfig(properties)](#Init.fixMcdevConfig) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.createIdeConfigFiles(versionBeforeUpgrade)](#Init.createIdeConfigFiles) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [._updateLeaf(propertiersCur, defaultPropsCur, fieldName)](#Init._updateLeaf) ⇒ <code>void</code>
    * [._getForcedUpdateList(projectVersion)](#Init._getForcedUpdateList) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
    * [._createIdeConfigFile(fileNameArr, relevantForcedUpdates, [boilerplateFileContent])](#Init._createIdeConfigFile) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.upgradeAuthFile()](#Init.upgradeAuthFile) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.initGitRepo([skipInteraction])](#Init.initGitRepo) ⇒ <code>Promise.&lt;{status: string, repoName: string}&gt;</code>
    * [.gitPush([skipInteraction])](#Init.gitPush) ⇒ <code>void</code>
    * [._addGitRemote([skipInteraction])](#Init._addGitRemote) ⇒ <code>string</code>
    * [._updateGitConfigUser([skipInteraction])](#Init._updateGitConfigUser) ⇒ <code>void</code>
    * [._getGitConfigUser()](#Init._getGitConfigUser) ⇒ <code>Promise.&lt;{&#x27;user.name&#x27;: string, &#x27;user.email&#x27;: string}&gt;</code>
    * [.initProject(properties, credentialName, [skipInteraction])](#Init.initProject) ⇒ <code>Promise.&lt;void&gt;</code>
    * [._downloadAllBUs(bu, gitStatus, [skipInteraction])](#Init._downloadAllBUs) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.upgradeProject(properties, [initial], [repoName])](#Init.upgradeProject) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [._getMissingCredentials(properties)](#Init._getMissingCredentials) ⇒ <code>Array.&lt;string&gt;</code>
    * [.installDependencies([repoName])](#Init.installDependencies) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [._getDefaultPackageJson([currentContent])](#Init._getDefaultPackageJson) ⇒ <code>Promise.&lt;{script: object, author: string, license: string}&gt;</code>

<a name="Init.fixMcdevConfig"></a>

### Init.fixMcdevConfig(properties) ⇒ <code>Promise.&lt;boolean&gt;</code>
helper method for this.upgradeProject that upgrades project config if needed

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - returns true if worked without errors  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>TYPE.Mcdevrc</code> | config file's json |

<a name="Init.createIdeConfigFiles"></a>

### Init.createIdeConfigFiles(versionBeforeUpgrade) ⇒ <code>Promise.&lt;boolean&gt;</code>
handles creation/update of all config file from the boilerplate

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - status of config file creation  

| Param | Type | Description |
| --- | --- | --- |
| versionBeforeUpgrade | <code>string</code> | 'x.y.z' |

<a name="Init._updateLeaf"></a>

### Init.\_updateLeaf(propertiersCur, defaultPropsCur, fieldName) ⇒ <code>void</code>
recursive helper for _fixMcdevConfig that adds missing settings

**Kind**: static method of [<code>Init</code>](#Init)  

| Param | Type | Description |
| --- | --- | --- |
| propertiersCur | <code>object</code> | current sub-object of project settings |
| defaultPropsCur | <code>object</code> | current sub-object of default settings |
| fieldName | <code>string</code> | dot-concatenated object-path that needs adding |

<a name="Init._getForcedUpdateList"></a>

### Init.\_getForcedUpdateList(projectVersion) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
returns list of files that need to be updated

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - relevant files with path that need to be updated  

| Param | Type | Description |
| --- | --- | --- |
| projectVersion | <code>string</code> | version found in config file of the current project |

<a name="Init._createIdeConfigFile"></a>

### Init.\_createIdeConfigFile(fileNameArr, relevantForcedUpdates, [boilerplateFileContent]) ⇒ <code>Promise.&lt;boolean&gt;</code>
handles creation/update of one config file from the boilerplate at a time

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - install successful or error occured  

| Param | Type | Description |
| --- | --- | --- |
| fileNameArr | <code>Array.&lt;string&gt;</code> | 0: path, 1: filename, 2: extension with dot |
| relevantForcedUpdates | <code>Array.&lt;string&gt;</code> | if fileNameArr is in this list we require an override |
| [boilerplateFileContent] | <code>string</code> | in case we cannot copy files 1:1 this can be used to pass in content |

<a name="Init.upgradeAuthFile"></a>

### Init.upgradeAuthFile() ⇒ <code>Promise.&lt;boolean&gt;</code>
helper method for this.upgradeProject that upgrades project config if needed

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - returns true if worked without errors  
<a name="Init.initGitRepo"></a>

### Init.initGitRepo([skipInteraction]) ⇒ <code>Promise.&lt;{status: string, repoName: string}&gt;</code>
check if git repo exists and otherwise create one

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;{status: string, repoName: string}&gt;</code> - success flag  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>TYPE.skipInteraction</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init.gitPush"></a>

### Init.gitPush([skipInteraction]) ⇒ <code>void</code>
offer to push the new repo straight to the server

**Kind**: static method of [<code>Init</code>](#Init)  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>boolean</code> \| <code>TYPE.skipInteraction</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init._addGitRemote"></a>

### Init.\_addGitRemote([skipInteraction]) ⇒ <code>string</code>
offers to add the git remote origin

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>string</code> - repo name (optionally)  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>TYPE.skipInteraction</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init._updateGitConfigUser"></a>

### Init.\_updateGitConfigUser([skipInteraction]) ⇒ <code>void</code>
checks global config and ask to config the user info and then store it locally

**Kind**: static method of [<code>Init</code>](#Init)  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>boolean</code> \| <code>TYPE.skipInteraction</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init._getGitConfigUser"></a>

### Init.\_getGitConfigUser() ⇒ <code>Promise.&lt;{&#x27;user.name&#x27;: string, &#x27;user.email&#x27;: string}&gt;</code>
retrieves the global user.name and user.email values

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;{&#x27;user.name&#x27;: string, &#x27;user.email&#x27;: string}&gt;</code> - user.name and user.email  
<a name="Init.initProject"></a>

### Init.initProject(properties, credentialName, [skipInteraction]) ⇒ <code>Promise.&lt;void&gt;</code>
Creates template file for properties.json

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>TYPE.Mcdevrc</code> | config file's json |
| credentialName | <code>string</code> | identifying name of the installed package / project |
| [skipInteraction] | <code>TYPE.skipInteraction</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init._downloadAllBUs"></a>

### Init.\_downloadAllBUs(bu, gitStatus, [skipInteraction]) ⇒ <code>Promise.&lt;void&gt;</code>
helper for this.initProject()

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| bu | <code>string</code> | cred/bu or cred/* or * |
| gitStatus | <code>string</code> | signals what state the git repo is in |
| [skipInteraction] | <code>boolean</code> \| <code>TYPE.skipInteraction</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init.upgradeProject"></a>

### Init.upgradeProject(properties, [initial], [repoName]) ⇒ <code>Promise.&lt;boolean&gt;</code>
wrapper around npm dependency & configuration file setup

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - success flag  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>TYPE.Mcdevrc</code> | config file's json |
| [initial] | <code>boolean</code> | print message if not part of initial setup |
| [repoName] | <code>string</code> | if git URL was provided earlier, the repo name was extracted to use it for npm init |

<a name="Init._getMissingCredentials"></a>

### Init.\_getMissingCredentials(properties) ⇒ <code>Array.&lt;string&gt;</code>
finds credentials that are set up in config but not in auth file

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Array.&lt;string&gt;</code> - list of credential names  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>TYPE.Mcdevrc</code> | javascript object in .mcdevrc.json |

<a name="Init.installDependencies"></a>

### Init.installDependencies([repoName]) ⇒ <code>Promise.&lt;boolean&gt;</code>
initiates npm project and then
takes care of loading the pre-configured dependency list
from the boilerplate directory to them as dev-dependencies

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - install successful or error occured  

| Param | Type | Description |
| --- | --- | --- |
| [repoName] | <code>string</code> | if git URL was provided earlier, the repo name was extracted to use it for npm init |

<a name="Init._getDefaultPackageJson"></a>

### Init.\_getDefaultPackageJson([currentContent]) ⇒ <code>Promise.&lt;{script: object, author: string, license: string}&gt;</code>
ensure we have certain default values in our config

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;{script: object, author: string, license: string}&gt;</code> - extended currentContent  

| Param | Type | Description |
| --- | --- | --- |
| [currentContent] | <code>object</code> | what was read from existing package.json file |

<a name="Init"></a>

## Init
CLI helper class

**Kind**: global constant  

* [Init](#Init)
    * [.fixMcdevConfig(properties)](#Init.fixMcdevConfig) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.createIdeConfigFiles(versionBeforeUpgrade)](#Init.createIdeConfigFiles) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [._updateLeaf(propertiersCur, defaultPropsCur, fieldName)](#Init._updateLeaf) ⇒ <code>void</code>
    * [._getForcedUpdateList(projectVersion)](#Init._getForcedUpdateList) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
    * [._createIdeConfigFile(fileNameArr, relevantForcedUpdates, [boilerplateFileContent])](#Init._createIdeConfigFile) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.upgradeAuthFile()](#Init.upgradeAuthFile) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.initGitRepo([skipInteraction])](#Init.initGitRepo) ⇒ <code>Promise.&lt;{status: string, repoName: string}&gt;</code>
    * [.gitPush([skipInteraction])](#Init.gitPush) ⇒ <code>void</code>
    * [._addGitRemote([skipInteraction])](#Init._addGitRemote) ⇒ <code>string</code>
    * [._updateGitConfigUser([skipInteraction])](#Init._updateGitConfigUser) ⇒ <code>void</code>
    * [._getGitConfigUser()](#Init._getGitConfigUser) ⇒ <code>Promise.&lt;{&#x27;user.name&#x27;: string, &#x27;user.email&#x27;: string}&gt;</code>
    * [.initProject(properties, credentialName, [skipInteraction])](#Init.initProject) ⇒ <code>Promise.&lt;void&gt;</code>
    * [._downloadAllBUs(bu, gitStatus, [skipInteraction])](#Init._downloadAllBUs) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.upgradeProject(properties, [initial], [repoName])](#Init.upgradeProject) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [._getMissingCredentials(properties)](#Init._getMissingCredentials) ⇒ <code>Array.&lt;string&gt;</code>
    * [.installDependencies([repoName])](#Init.installDependencies) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [._getDefaultPackageJson([currentContent])](#Init._getDefaultPackageJson) ⇒ <code>Promise.&lt;{script: object, author: string, license: string}&gt;</code>

<a name="Init.fixMcdevConfig"></a>

### Init.fixMcdevConfig(properties) ⇒ <code>Promise.&lt;boolean&gt;</code>
helper method for this.upgradeProject that upgrades project config if needed

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - returns true if worked without errors  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>TYPE.Mcdevrc</code> | config file's json |

<a name="Init.createIdeConfigFiles"></a>

### Init.createIdeConfigFiles(versionBeforeUpgrade) ⇒ <code>Promise.&lt;boolean&gt;</code>
handles creation/update of all config file from the boilerplate

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - status of config file creation  

| Param | Type | Description |
| --- | --- | --- |
| versionBeforeUpgrade | <code>string</code> | 'x.y.z' |

<a name="Init._updateLeaf"></a>

### Init.\_updateLeaf(propertiersCur, defaultPropsCur, fieldName) ⇒ <code>void</code>
recursive helper for _fixMcdevConfig that adds missing settings

**Kind**: static method of [<code>Init</code>](#Init)  

| Param | Type | Description |
| --- | --- | --- |
| propertiersCur | <code>object</code> | current sub-object of project settings |
| defaultPropsCur | <code>object</code> | current sub-object of default settings |
| fieldName | <code>string</code> | dot-concatenated object-path that needs adding |

<a name="Init._getForcedUpdateList"></a>

### Init.\_getForcedUpdateList(projectVersion) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
returns list of files that need to be updated

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - relevant files with path that need to be updated  

| Param | Type | Description |
| --- | --- | --- |
| projectVersion | <code>string</code> | version found in config file of the current project |

<a name="Init._createIdeConfigFile"></a>

### Init.\_createIdeConfigFile(fileNameArr, relevantForcedUpdates, [boilerplateFileContent]) ⇒ <code>Promise.&lt;boolean&gt;</code>
handles creation/update of one config file from the boilerplate at a time

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - install successful or error occured  

| Param | Type | Description |
| --- | --- | --- |
| fileNameArr | <code>Array.&lt;string&gt;</code> | 0: path, 1: filename, 2: extension with dot |
| relevantForcedUpdates | <code>Array.&lt;string&gt;</code> | if fileNameArr is in this list we require an override |
| [boilerplateFileContent] | <code>string</code> | in case we cannot copy files 1:1 this can be used to pass in content |

<a name="Init.upgradeAuthFile"></a>

### Init.upgradeAuthFile() ⇒ <code>Promise.&lt;boolean&gt;</code>
helper method for this.upgradeProject that upgrades project config if needed

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - returns true if worked without errors  
<a name="Init.initGitRepo"></a>

### Init.initGitRepo([skipInteraction]) ⇒ <code>Promise.&lt;{status: string, repoName: string}&gt;</code>
check if git repo exists and otherwise create one

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;{status: string, repoName: string}&gt;</code> - success flag  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>TYPE.skipInteraction</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init.gitPush"></a>

### Init.gitPush([skipInteraction]) ⇒ <code>void</code>
offer to push the new repo straight to the server

**Kind**: static method of [<code>Init</code>](#Init)  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>boolean</code> \| <code>TYPE.skipInteraction</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init._addGitRemote"></a>

### Init.\_addGitRemote([skipInteraction]) ⇒ <code>string</code>
offers to add the git remote origin

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>string</code> - repo name (optionally)  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>TYPE.skipInteraction</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init._updateGitConfigUser"></a>

### Init.\_updateGitConfigUser([skipInteraction]) ⇒ <code>void</code>
checks global config and ask to config the user info and then store it locally

**Kind**: static method of [<code>Init</code>](#Init)  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>boolean</code> \| <code>TYPE.skipInteraction</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init._getGitConfigUser"></a>

### Init.\_getGitConfigUser() ⇒ <code>Promise.&lt;{&#x27;user.name&#x27;: string, &#x27;user.email&#x27;: string}&gt;</code>
retrieves the global user.name and user.email values

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;{&#x27;user.name&#x27;: string, &#x27;user.email&#x27;: string}&gt;</code> - user.name and user.email  
<a name="Init.initProject"></a>

### Init.initProject(properties, credentialName, [skipInteraction]) ⇒ <code>Promise.&lt;void&gt;</code>
Creates template file for properties.json

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>TYPE.Mcdevrc</code> | config file's json |
| credentialName | <code>string</code> | identifying name of the installed package / project |
| [skipInteraction] | <code>TYPE.skipInteraction</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init._downloadAllBUs"></a>

### Init.\_downloadAllBUs(bu, gitStatus, [skipInteraction]) ⇒ <code>Promise.&lt;void&gt;</code>
helper for this.initProject()

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| bu | <code>string</code> | cred/bu or cred/* or * |
| gitStatus | <code>string</code> | signals what state the git repo is in |
| [skipInteraction] | <code>boolean</code> \| <code>TYPE.skipInteraction</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init.upgradeProject"></a>

### Init.upgradeProject(properties, [initial], [repoName]) ⇒ <code>Promise.&lt;boolean&gt;</code>
wrapper around npm dependency & configuration file setup

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - success flag  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>TYPE.Mcdevrc</code> | config file's json |
| [initial] | <code>boolean</code> | print message if not part of initial setup |
| [repoName] | <code>string</code> | if git URL was provided earlier, the repo name was extracted to use it for npm init |

<a name="Init._getMissingCredentials"></a>

### Init.\_getMissingCredentials(properties) ⇒ <code>Array.&lt;string&gt;</code>
finds credentials that are set up in config but not in auth file

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Array.&lt;string&gt;</code> - list of credential names  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>TYPE.Mcdevrc</code> | javascript object in .mcdevrc.json |

<a name="Init.installDependencies"></a>

### Init.installDependencies([repoName]) ⇒ <code>Promise.&lt;boolean&gt;</code>
initiates npm project and then
takes care of loading the pre-configured dependency list
from the boilerplate directory to them as dev-dependencies

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - install successful or error occured  

| Param | Type | Description |
| --- | --- | --- |
| [repoName] | <code>string</code> | if git URL was provided earlier, the repo name was extracted to use it for npm init |

<a name="Init._getDefaultPackageJson"></a>

### Init.\_getDefaultPackageJson([currentContent]) ⇒ <code>Promise.&lt;{script: object, author: string, license: string}&gt;</code>
ensure we have certain default values in our config

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;{script: object, author: string, license: string}&gt;</code> - extended currentContent  

| Param | Type | Description |
| --- | --- | --- |
| [currentContent] | <code>object</code> | what was read from existing package.json file |

<a name="Init"></a>

## Init
CLI helper class

**Kind**: global constant  

* [Init](#Init)
    * [.fixMcdevConfig(properties)](#Init.fixMcdevConfig) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.createIdeConfigFiles(versionBeforeUpgrade)](#Init.createIdeConfigFiles) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [._updateLeaf(propertiersCur, defaultPropsCur, fieldName)](#Init._updateLeaf) ⇒ <code>void</code>
    * [._getForcedUpdateList(projectVersion)](#Init._getForcedUpdateList) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
    * [._createIdeConfigFile(fileNameArr, relevantForcedUpdates, [boilerplateFileContent])](#Init._createIdeConfigFile) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.upgradeAuthFile()](#Init.upgradeAuthFile) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.initGitRepo([skipInteraction])](#Init.initGitRepo) ⇒ <code>Promise.&lt;{status: string, repoName: string}&gt;</code>
    * [.gitPush([skipInteraction])](#Init.gitPush) ⇒ <code>void</code>
    * [._addGitRemote([skipInteraction])](#Init._addGitRemote) ⇒ <code>string</code>
    * [._updateGitConfigUser([skipInteraction])](#Init._updateGitConfigUser) ⇒ <code>void</code>
    * [._getGitConfigUser()](#Init._getGitConfigUser) ⇒ <code>Promise.&lt;{&#x27;user.name&#x27;: string, &#x27;user.email&#x27;: string}&gt;</code>
    * [.initProject(properties, credentialName, [skipInteraction])](#Init.initProject) ⇒ <code>Promise.&lt;void&gt;</code>
    * [._downloadAllBUs(bu, gitStatus, [skipInteraction])](#Init._downloadAllBUs) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.upgradeProject(properties, [initial], [repoName])](#Init.upgradeProject) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [._getMissingCredentials(properties)](#Init._getMissingCredentials) ⇒ <code>Array.&lt;string&gt;</code>
    * [.installDependencies([repoName])](#Init.installDependencies) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [._getDefaultPackageJson([currentContent])](#Init._getDefaultPackageJson) ⇒ <code>Promise.&lt;{script: object, author: string, license: string}&gt;</code>

<a name="Init.fixMcdevConfig"></a>

### Init.fixMcdevConfig(properties) ⇒ <code>Promise.&lt;boolean&gt;</code>
helper method for this.upgradeProject that upgrades project config if needed

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - returns true if worked without errors  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>TYPE.Mcdevrc</code> | config file's json |

<a name="Init.createIdeConfigFiles"></a>

### Init.createIdeConfigFiles(versionBeforeUpgrade) ⇒ <code>Promise.&lt;boolean&gt;</code>
handles creation/update of all config file from the boilerplate

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - status of config file creation  

| Param | Type | Description |
| --- | --- | --- |
| versionBeforeUpgrade | <code>string</code> | 'x.y.z' |

<a name="Init._updateLeaf"></a>

### Init.\_updateLeaf(propertiersCur, defaultPropsCur, fieldName) ⇒ <code>void</code>
recursive helper for _fixMcdevConfig that adds missing settings

**Kind**: static method of [<code>Init</code>](#Init)  

| Param | Type | Description |
| --- | --- | --- |
| propertiersCur | <code>object</code> | current sub-object of project settings |
| defaultPropsCur | <code>object</code> | current sub-object of default settings |
| fieldName | <code>string</code> | dot-concatenated object-path that needs adding |

<a name="Init._getForcedUpdateList"></a>

### Init.\_getForcedUpdateList(projectVersion) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
returns list of files that need to be updated

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - relevant files with path that need to be updated  

| Param | Type | Description |
| --- | --- | --- |
| projectVersion | <code>string</code> | version found in config file of the current project |

<a name="Init._createIdeConfigFile"></a>

### Init.\_createIdeConfigFile(fileNameArr, relevantForcedUpdates, [boilerplateFileContent]) ⇒ <code>Promise.&lt;boolean&gt;</code>
handles creation/update of one config file from the boilerplate at a time

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - install successful or error occured  

| Param | Type | Description |
| --- | --- | --- |
| fileNameArr | <code>Array.&lt;string&gt;</code> | 0: path, 1: filename, 2: extension with dot |
| relevantForcedUpdates | <code>Array.&lt;string&gt;</code> | if fileNameArr is in this list we require an override |
| [boilerplateFileContent] | <code>string</code> | in case we cannot copy files 1:1 this can be used to pass in content |

<a name="Init.upgradeAuthFile"></a>

### Init.upgradeAuthFile() ⇒ <code>Promise.&lt;boolean&gt;</code>
helper method for this.upgradeProject that upgrades project config if needed

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - returns true if worked without errors  
<a name="Init.initGitRepo"></a>

### Init.initGitRepo([skipInteraction]) ⇒ <code>Promise.&lt;{status: string, repoName: string}&gt;</code>
check if git repo exists and otherwise create one

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;{status: string, repoName: string}&gt;</code> - success flag  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>TYPE.skipInteraction</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init.gitPush"></a>

### Init.gitPush([skipInteraction]) ⇒ <code>void</code>
offer to push the new repo straight to the server

**Kind**: static method of [<code>Init</code>](#Init)  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>boolean</code> \| <code>TYPE.skipInteraction</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init._addGitRemote"></a>

### Init.\_addGitRemote([skipInteraction]) ⇒ <code>string</code>
offers to add the git remote origin

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>string</code> - repo name (optionally)  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>TYPE.skipInteraction</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init._updateGitConfigUser"></a>

### Init.\_updateGitConfigUser([skipInteraction]) ⇒ <code>void</code>
checks global config and ask to config the user info and then store it locally

**Kind**: static method of [<code>Init</code>](#Init)  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>boolean</code> \| <code>TYPE.skipInteraction</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init._getGitConfigUser"></a>

### Init.\_getGitConfigUser() ⇒ <code>Promise.&lt;{&#x27;user.name&#x27;: string, &#x27;user.email&#x27;: string}&gt;</code>
retrieves the global user.name and user.email values

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;{&#x27;user.name&#x27;: string, &#x27;user.email&#x27;: string}&gt;</code> - user.name and user.email  
<a name="Init.initProject"></a>

### Init.initProject(properties, credentialName, [skipInteraction]) ⇒ <code>Promise.&lt;void&gt;</code>
Creates template file for properties.json

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>TYPE.Mcdevrc</code> | config file's json |
| credentialName | <code>string</code> | identifying name of the installed package / project |
| [skipInteraction] | <code>TYPE.skipInteraction</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init._downloadAllBUs"></a>

### Init.\_downloadAllBUs(bu, gitStatus, [skipInteraction]) ⇒ <code>Promise.&lt;void&gt;</code>
helper for this.initProject()

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| bu | <code>string</code> | cred/bu or cred/* or * |
| gitStatus | <code>string</code> | signals what state the git repo is in |
| [skipInteraction] | <code>boolean</code> \| <code>TYPE.skipInteraction</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init.upgradeProject"></a>

### Init.upgradeProject(properties, [initial], [repoName]) ⇒ <code>Promise.&lt;boolean&gt;</code>
wrapper around npm dependency & configuration file setup

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - success flag  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>TYPE.Mcdevrc</code> | config file's json |
| [initial] | <code>boolean</code> | print message if not part of initial setup |
| [repoName] | <code>string</code> | if git URL was provided earlier, the repo name was extracted to use it for npm init |

<a name="Init._getMissingCredentials"></a>

### Init.\_getMissingCredentials(properties) ⇒ <code>Array.&lt;string&gt;</code>
finds credentials that are set up in config but not in auth file

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Array.&lt;string&gt;</code> - list of credential names  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>TYPE.Mcdevrc</code> | javascript object in .mcdevrc.json |

<a name="Init.installDependencies"></a>

### Init.installDependencies([repoName]) ⇒ <code>Promise.&lt;boolean&gt;</code>
initiates npm project and then
takes care of loading the pre-configured dependency list
from the boilerplate directory to them as dev-dependencies

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - install successful or error occured  

| Param | Type | Description |
| --- | --- | --- |
| [repoName] | <code>string</code> | if git URL was provided earlier, the repo name was extracted to use it for npm init |

<a name="Init._getDefaultPackageJson"></a>

### Init.\_getDefaultPackageJson([currentContent]) ⇒ <code>Promise.&lt;{script: object, author: string, license: string}&gt;</code>
ensure we have certain default values in our config

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;{script: object, author: string, license: string}&gt;</code> - extended currentContent  

| Param | Type | Description |
| --- | --- | --- |
| [currentContent] | <code>object</code> | what was read from existing package.json file |

<a name="Init"></a>

## Init
CLI helper class

**Kind**: global constant  

* [Init](#Init)
    * [.fixMcdevConfig(properties)](#Init.fixMcdevConfig) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.createIdeConfigFiles(versionBeforeUpgrade)](#Init.createIdeConfigFiles) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [._updateLeaf(propertiersCur, defaultPropsCur, fieldName)](#Init._updateLeaf) ⇒ <code>void</code>
    * [._getForcedUpdateList(projectVersion)](#Init._getForcedUpdateList) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
    * [._createIdeConfigFile(fileNameArr, relevantForcedUpdates, [boilerplateFileContent])](#Init._createIdeConfigFile) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.upgradeAuthFile()](#Init.upgradeAuthFile) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.initGitRepo([skipInteraction])](#Init.initGitRepo) ⇒ <code>Promise.&lt;{status: string, repoName: string}&gt;</code>
    * [.gitPush([skipInteraction])](#Init.gitPush) ⇒ <code>void</code>
    * [._addGitRemote([skipInteraction])](#Init._addGitRemote) ⇒ <code>string</code>
    * [._updateGitConfigUser([skipInteraction])](#Init._updateGitConfigUser) ⇒ <code>void</code>
    * [._getGitConfigUser()](#Init._getGitConfigUser) ⇒ <code>Promise.&lt;{&#x27;user.name&#x27;: string, &#x27;user.email&#x27;: string}&gt;</code>
    * [.initProject(properties, credentialName, [skipInteraction])](#Init.initProject) ⇒ <code>Promise.&lt;void&gt;</code>
    * [._downloadAllBUs(bu, gitStatus, [skipInteraction])](#Init._downloadAllBUs) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.upgradeProject(properties, [initial], [repoName])](#Init.upgradeProject) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [._getMissingCredentials(properties)](#Init._getMissingCredentials) ⇒ <code>Array.&lt;string&gt;</code>
    * [.installDependencies([repoName])](#Init.installDependencies) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [._getDefaultPackageJson([currentContent])](#Init._getDefaultPackageJson) ⇒ <code>Promise.&lt;{script: object, author: string, license: string}&gt;</code>

<a name="Init.fixMcdevConfig"></a>

### Init.fixMcdevConfig(properties) ⇒ <code>Promise.&lt;boolean&gt;</code>
helper method for this.upgradeProject that upgrades project config if needed

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - returns true if worked without errors  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>TYPE.Mcdevrc</code> | config file's json |

<a name="Init.createIdeConfigFiles"></a>

### Init.createIdeConfigFiles(versionBeforeUpgrade) ⇒ <code>Promise.&lt;boolean&gt;</code>
handles creation/update of all config file from the boilerplate

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - status of config file creation  

| Param | Type | Description |
| --- | --- | --- |
| versionBeforeUpgrade | <code>string</code> | 'x.y.z' |

<a name="Init._updateLeaf"></a>

### Init.\_updateLeaf(propertiersCur, defaultPropsCur, fieldName) ⇒ <code>void</code>
recursive helper for _fixMcdevConfig that adds missing settings

**Kind**: static method of [<code>Init</code>](#Init)  

| Param | Type | Description |
| --- | --- | --- |
| propertiersCur | <code>object</code> | current sub-object of project settings |
| defaultPropsCur | <code>object</code> | current sub-object of default settings |
| fieldName | <code>string</code> | dot-concatenated object-path that needs adding |

<a name="Init._getForcedUpdateList"></a>

### Init.\_getForcedUpdateList(projectVersion) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
returns list of files that need to be updated

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - relevant files with path that need to be updated  

| Param | Type | Description |
| --- | --- | --- |
| projectVersion | <code>string</code> | version found in config file of the current project |

<a name="Init._createIdeConfigFile"></a>

### Init.\_createIdeConfigFile(fileNameArr, relevantForcedUpdates, [boilerplateFileContent]) ⇒ <code>Promise.&lt;boolean&gt;</code>
handles creation/update of one config file from the boilerplate at a time

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - install successful or error occured  

| Param | Type | Description |
| --- | --- | --- |
| fileNameArr | <code>Array.&lt;string&gt;</code> | 0: path, 1: filename, 2: extension with dot |
| relevantForcedUpdates | <code>Array.&lt;string&gt;</code> | if fileNameArr is in this list we require an override |
| [boilerplateFileContent] | <code>string</code> | in case we cannot copy files 1:1 this can be used to pass in content |

<a name="Init.upgradeAuthFile"></a>

### Init.upgradeAuthFile() ⇒ <code>Promise.&lt;boolean&gt;</code>
helper method for this.upgradeProject that upgrades project config if needed

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - returns true if worked without errors  
<a name="Init.initGitRepo"></a>

### Init.initGitRepo([skipInteraction]) ⇒ <code>Promise.&lt;{status: string, repoName: string}&gt;</code>
check if git repo exists and otherwise create one

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;{status: string, repoName: string}&gt;</code> - success flag  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>TYPE.skipInteraction</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init.gitPush"></a>

### Init.gitPush([skipInteraction]) ⇒ <code>void</code>
offer to push the new repo straight to the server

**Kind**: static method of [<code>Init</code>](#Init)  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>boolean</code> \| <code>TYPE.skipInteraction</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init._addGitRemote"></a>

### Init.\_addGitRemote([skipInteraction]) ⇒ <code>string</code>
offers to add the git remote origin

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>string</code> - repo name (optionally)  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>TYPE.skipInteraction</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init._updateGitConfigUser"></a>

### Init.\_updateGitConfigUser([skipInteraction]) ⇒ <code>void</code>
checks global config and ask to config the user info and then store it locally

**Kind**: static method of [<code>Init</code>](#Init)  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>boolean</code> \| <code>TYPE.skipInteraction</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init._getGitConfigUser"></a>

### Init.\_getGitConfigUser() ⇒ <code>Promise.&lt;{&#x27;user.name&#x27;: string, &#x27;user.email&#x27;: string}&gt;</code>
retrieves the global user.name and user.email values

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;{&#x27;user.name&#x27;: string, &#x27;user.email&#x27;: string}&gt;</code> - user.name and user.email  
<a name="Init.initProject"></a>

### Init.initProject(properties, credentialName, [skipInteraction]) ⇒ <code>Promise.&lt;void&gt;</code>
Creates template file for properties.json

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>TYPE.Mcdevrc</code> | config file's json |
| credentialName | <code>string</code> | identifying name of the installed package / project |
| [skipInteraction] | <code>TYPE.skipInteraction</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init._downloadAllBUs"></a>

### Init.\_downloadAllBUs(bu, gitStatus, [skipInteraction]) ⇒ <code>Promise.&lt;void&gt;</code>
helper for this.initProject()

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| bu | <code>string</code> | cred/bu or cred/* or * |
| gitStatus | <code>string</code> | signals what state the git repo is in |
| [skipInteraction] | <code>boolean</code> \| <code>TYPE.skipInteraction</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init.upgradeProject"></a>

### Init.upgradeProject(properties, [initial], [repoName]) ⇒ <code>Promise.&lt;boolean&gt;</code>
wrapper around npm dependency & configuration file setup

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - success flag  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>TYPE.Mcdevrc</code> | config file's json |
| [initial] | <code>boolean</code> | print message if not part of initial setup |
| [repoName] | <code>string</code> | if git URL was provided earlier, the repo name was extracted to use it for npm init |

<a name="Init._getMissingCredentials"></a>

### Init.\_getMissingCredentials(properties) ⇒ <code>Array.&lt;string&gt;</code>
finds credentials that are set up in config but not in auth file

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Array.&lt;string&gt;</code> - list of credential names  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>TYPE.Mcdevrc</code> | javascript object in .mcdevrc.json |

<a name="Init.installDependencies"></a>

### Init.installDependencies([repoName]) ⇒ <code>Promise.&lt;boolean&gt;</code>
initiates npm project and then
takes care of loading the pre-configured dependency list
from the boilerplate directory to them as dev-dependencies

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - install successful or error occured  

| Param | Type | Description |
| --- | --- | --- |
| [repoName] | <code>string</code> | if git URL was provided earlier, the repo name was extracted to use it for npm init |

<a name="Init._getDefaultPackageJson"></a>

### Init.\_getDefaultPackageJson([currentContent]) ⇒ <code>Promise.&lt;{script: object, author: string, license: string}&gt;</code>
ensure we have certain default values in our config

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;{script: object, author: string, license: string}&gt;</code> - extended currentContent  

| Param | Type | Description |
| --- | --- | --- |
| [currentContent] | <code>object</code> | what was read from existing package.json file |

<a name="Util"></a>

## Util
Util that contains logger and simple util methods

**Kind**: global constant  

* [Util](#Util)
    * [.skipInteraction](#Util.skipInteraction) : <code>TYPE.skipInteraction</code>
    * [.logger](#Util.logger) : <code>TYPE.Logger</code>
    * [.filterObjByKeys(originalObj, [whitelistArr])](#Util.filterObjByKeys) ⇒ <code>Object.&lt;string, \*&gt;</code>
    * [.includesStartsWith(arr, search)](#Util.includesStartsWith) ⇒ <code>boolean</code>
    * [.includesStartsWithIndex(arr, search)](#Util.includesStartsWithIndex) ⇒ <code>number</code>
    * [.checkMarket(market, properties)](#Util.checkMarket) ⇒ <code>boolean</code>
    * [.verifyMarketList(mlName, properties)](#Util.verifyMarketList) ⇒ <code>void</code>
    * [.signalFatalError()](#Util.signalFatalError) ⇒ <code>void</code>
    * [.isTrue(attrValue)](#Util.isTrue) ⇒ <code>boolean</code>
    * [.isFalse(attrValue)](#Util.isFalse) ⇒ <code>boolean</code>
    * [._isValidType(selectedType)](#Util._isValidType) ⇒ <code>boolean</code>
    * [.getDefaultProperties()](#Util.getDefaultProperties) ⇒ <code>TYPE.Mcdevrc</code>
    * [.getRetrieveTypeChoices()](#Util.getRetrieveTypeChoices) ⇒ <code>Array.&lt;string&gt;</code>
    * [.checkProperties(properties, [silent])](#Util.checkProperties) ⇒ <code>Promise.&lt;(boolean\|Array.&lt;string&gt;)&gt;</code>
    * [.metadataLogger(level, type, method, payload, [source])](#Util.metadataLogger) ⇒ <code>void</code>
    * [.replaceByObject(str, obj)](#Util.replaceByObject) ⇒ <code>string</code> \| <code>object</code>
    * [.inverseGet(objs, val)](#Util.inverseGet) ⇒ <code>string</code>
    * [.getMetadataHierachy(metadataTypes)](#Util.getMetadataHierachy) ⇒ <code>Array.&lt;string&gt;</code>
    * [.resolveObjPath(path, obj)](#Util.resolveObjPath) ⇒ <code>any</code>
    * [.execSync(cmd, [args])](#Util.execSync) ⇒ <code>undefined</code>
    * [.templateSearchResult(results, keyToSearch, searchValue)](#Util.templateSearchResult) ⇒ <code>TYPE.MetadataTypeItem</code>
    * [.setLoggingLevel(argv)](#Util.setLoggingLevel) ⇒ <code>void</code>

<a name="Util.skipInteraction"></a>

### Util.skipInteraction : <code>TYPE.skipInteraction</code>
**Kind**: static property of [<code>Util</code>](#Util)  
<a name="Util.logger"></a>

### Util.logger : <code>TYPE.Logger</code>
Logger that creates timestamped log file in 'logs/' directory

**Kind**: static property of [<code>Util</code>](#Util)  
<a name="Util.filterObjByKeys"></a>

### Util.filterObjByKeys(originalObj, [whitelistArr]) ⇒ <code>Object.&lt;string, \*&gt;</code>
helper that allows filtering an object by its keys

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>Object.&lt;string, \*&gt;</code> - filtered object that only contains keys you provided  

| Param | Type | Description |
| --- | --- | --- |
| originalObj | <code>Object.&lt;string, \*&gt;</code> | object that you want to filter |
| [whitelistArr] | <code>Array.&lt;string&gt;</code> | positive filter. if not provided, returns originalObj without filter |

<a name="Util.includesStartsWith"></a>

### Util.includesStartsWith(arr, search) ⇒ <code>boolean</code>
extended Array.includes method that allows check if an array-element starts with a certain string

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>boolean</code> - found / not found  

| Param | Type | Description |
| --- | --- | --- |
| arr | <code>Array.&lt;string&gt;</code> | your array of strigns |
| search | <code>string</code> | the string you are looking for |

<a name="Util.includesStartsWithIndex"></a>

### Util.includesStartsWithIndex(arr, search) ⇒ <code>number</code>
extended Array.includes method that allows check if an array-element starts with a certain string

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>number</code> - array index 0..n or -1 of not found  

| Param | Type | Description |
| --- | --- | --- |
| arr | <code>Array.&lt;string&gt;</code> | your array of strigns |
| search | <code>string</code> | the string you are looking for |

<a name="Util.checkMarket"></a>

### Util.checkMarket(market, properties) ⇒ <code>boolean</code>
check if a market name exists in current mcdev config

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>boolean</code> - found market or not  

| Param | Type | Description |
| --- | --- | --- |
| market | <code>string</code> | market localizations |
| properties | <code>TYPE.Mcdevrc</code> | local mcdev config |

<a name="Util.verifyMarketList"></a>

### Util.verifyMarketList(mlName, properties) ⇒ <code>void</code>
ensure provided MarketList exists and it's content including markets and BUs checks out

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>void</code> - throws errors if problems were found  

| Param | Type | Description |
| --- | --- | --- |
| mlName | <code>string</code> | name of marketList |
| properties | <code>TYPE.Mcdevrc</code> | General configuration to be used in retrieve |

<a name="Util.signalFatalError"></a>

### Util.signalFatalError() ⇒ <code>void</code>
used to ensure the program tells surrounding software that an unrecoverable error occured

**Kind**: static method of [<code>Util</code>](#Util)  
<a name="Util.isTrue"></a>

### Util.isTrue(attrValue) ⇒ <code>boolean</code>
SFMC accepts multiple true values for Boolean attributes for which we are checking here

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>boolean</code> - attribute value == true ? true : false  

| Param | Type | Description |
| --- | --- | --- |
| attrValue | <code>\*</code> | value |

<a name="Util.isFalse"></a>

### Util.isFalse(attrValue) ⇒ <code>boolean</code>
SFMC accepts multiple false values for Boolean attributes for which we are checking here

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>boolean</code> - attribute value == false ? true : false  

| Param | Type | Description |
| --- | --- | --- |
| attrValue | <code>\*</code> | value |

<a name="Util._isValidType"></a>

### Util.\_isValidType(selectedType) ⇒ <code>boolean</code>
helper for retrieve, retrieveAsTemplate and deploy

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>boolean</code> - type ok or not  

| Param | Type | Description |
| --- | --- | --- |
| selectedType | <code>string</code> | type or type-subtype |

<a name="Util.getDefaultProperties"></a>

### Util.getDefaultProperties() ⇒ <code>TYPE.Mcdevrc</code>
defines how the properties.json should look like
used for creating a template and for checking if variables are set

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>TYPE.Mcdevrc</code> - default properties  
<a name="Util.getRetrieveTypeChoices"></a>

### Util.getRetrieveTypeChoices() ⇒ <code>Array.&lt;string&gt;</code>
helper for getDefaultProperties()

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>Array.&lt;string&gt;</code> - type choices  
<a name="Util.checkProperties"></a>

### Util.checkProperties(properties, [silent]) ⇒ <code>Promise.&lt;(boolean\|Array.&lt;string&gt;)&gt;</code>
check if the config file is correctly formatted and has values

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>Promise.&lt;(boolean\|Array.&lt;string&gt;)&gt;</code> - file structure ok OR list of fields to be fixed  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>TYPE.Mcdevrc</code> | javascript object in .mcdevrc.json |
| [silent] | <code>boolean</code> | set to true for internal use w/o cli output |

<a name="Util.metadataLogger"></a>

### Util.metadataLogger(level, type, method, payload, [source]) ⇒ <code>void</code>
Logger helper for Metadata functions

**Kind**: static method of [<code>Util</code>](#Util)  

| Param | Type | Description |
| --- | --- | --- |
| level | <code>string</code> | of log (error, info, warn) |
| type | <code>string</code> | of metadata being referenced |
| method | <code>string</code> | name which log was called from |
| payload | <code>\*</code> | generic object which details the error |
| [source] | <code>string</code> | key/id of metadata which relates to error |

<a name="Util.replaceByObject"></a>

### Util.replaceByObject(str, obj) ⇒ <code>string</code> \| <code>object</code>
replaces values in a JSON object string, based on a series of
key-value pairs (obj)

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>string</code> \| <code>object</code> - replaced version of str  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>string</code> \| <code>object</code> | JSON object or its stringified version, which has values to be replaced |
| obj | <code>TYPE.TemplateMap</code> | key value object which contains keys to be replaced and values to be replaced with |

<a name="Util.inverseGet"></a>

### Util.inverseGet(objs, val) ⇒ <code>string</code>
get key of an object based on the first matching value

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>string</code> - key  

| Param | Type | Description |
| --- | --- | --- |
| objs | <code>object</code> | object of objects to be searched |
| val | <code>string</code> | value to be searched for |

<a name="Util.getMetadataHierachy"></a>

### Util.getMetadataHierachy(metadataTypes) ⇒ <code>Array.&lt;string&gt;</code>
Returns Order in which metadata needs to be retrieved/deployed

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>Array.&lt;string&gt;</code> - retrieve/deploy order as array  

| Param | Type | Description |
| --- | --- | --- |
| metadataTypes | <code>Array.&lt;string&gt;</code> | which should be retrieved/deployed |

<a name="Util.resolveObjPath"></a>

### Util.resolveObjPath(path, obj) ⇒ <code>any</code>
let's you dynamically walk down an object and get a value

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>any</code> - value of obj.path  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | 'fieldA.fieldB.fieldC' |
| obj | <code>object</code> | some parent object |

<a name="Util.execSync"></a>

### Util.execSync(cmd, [args]) ⇒ <code>undefined</code>
helper to run other commands as if run manually by user

**Kind**: static method of [<code>Util</code>](#Util)  

| Param | Type | Description |
| --- | --- | --- |
| cmd | <code>string</code> | to be executed command |
| [args] | <code>Array.&lt;string&gt;</code> | list of arguments |

<a name="Util.templateSearchResult"></a>

### Util.templateSearchResult(results, keyToSearch, searchValue) ⇒ <code>TYPE.MetadataTypeItem</code>
standardize check to ensure only one result is returned from template search

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>TYPE.MetadataTypeItem</code> - metadata to be used in building template  

| Param | Type | Description |
| --- | --- | --- |
| results | <code>Array.&lt;TYPE.MetadataTypeItem&gt;</code> | array of metadata |
| keyToSearch | <code>string</code> | the field which contains the searched value |
| searchValue | <code>string</code> | the value which is being looked for |

<a name="Util.setLoggingLevel"></a>

### Util.setLoggingLevel(argv) ⇒ <code>void</code>
configures what is displayed in the console

**Kind**: static method of [<code>Util</code>](#Util)  

| Param | Type | Description |
| --- | --- | --- |
| argv | <code>object</code> | list of command line parameters given by user |
| [argv.silent] | <code>boolean</code> | only errors printed to CLI |
| [argv.verbose] | <code>boolean</code> | chatty user CLI output |
| [argv.debug] | <code>boolean</code> | enables developer output & features |

<a name="csvToArray"></a>

## csvToArray(csv) ⇒ <code>Array.&lt;string&gt;</code>
helper to convert CSVs into an array. if only one value was given, it's also returned as an array

**Kind**: global function  
**Returns**: <code>Array.&lt;string&gt;</code> - values split into an array.  

| Param | Type | Description |
| --- | --- | --- |
| csv | <code>string</code> | potentially comma-separated value or null |

<a name="getUserName"></a>

## getUserName(userList, item, fieldname) ⇒ <code>string</code>
**Kind**: global function  
**Returns**: <code>string</code> - username or user id or 'n/a'  

| Param | Type | Description |
| --- | --- | --- |
| userList | <code>Object.&lt;string, string&gt;</code> | user-id > user-name map |
| item | <code>Object.&lt;string, string&gt;</code> | single metadata item |
| fieldname | <code>string</code> | name of field containing the info |

<a name="setupSDK"></a>

## setupSDK(credentialKey, authObject) ⇒ [<code>SDK</code>](#SDK)
Returns an SDK instance to be used for API calls

**Kind**: global function  
**Returns**: [<code>SDK</code>](#SDK) - auth object  

| Param | Type | Description |
| --- | --- | --- |
| credentialKey | <code>string</code> | key for specific BU |
| authObject | <code>TYPE.AuthObject</code> | credentials for specific BU |

<a name="createNewLoggerTransport"></a>

## createNewLoggerTransport() ⇒ <code>object</code>
wrapper around our standard winston logging to console and logfile

**Kind**: global function  
**Returns**: <code>object</code> - initiated logger for console and file  
<a name="startLogger"></a>

## startLogger() ⇒ <code>void</code>
initiate winston logger

**Kind**: global function  
<a name="SupportedMetadataTypes"></a>

## SupportedMetadataTypes : <code>Object.&lt;string, string&gt;</code>
**Kind**: global typedef  
<a name="Cache"></a>

## Cache : <code>Object.&lt;string, any&gt;</code>
key=customer key

**Kind**: global typedef  
<a name="CodeExtractItem"></a>

## CodeExtractItem : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| json | <code>MetadataTypeItem</code> | metadata of one item w/o code |
| codeArr | [<code>Array.&lt;CodeExtract&gt;</code>](#CodeExtract) | list of code snippets in this item |
| subFolder | <code>Array.&lt;string&gt;</code> | mostly set to null, otherwise list of subfolders |

<a name="CodeExtract"></a>

## CodeExtract : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| subFolder | <code>Array.&lt;string&gt;</code> | mostly set to null, otherwise subfolders path split into elements |
| fileName | <code>string</code> | name of file w/o extension |
| fileExt | <code>string</code> | file extension |
| content | <code>string</code> | file content |
| [encoding] | <code>&#x27;base64&#x27;</code> | optional for binary files |

<a name="CodeExtractItem"></a>

## CodeExtractItem : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | name |
| key | <code>string</code> | key |
| description | <code>string</code> | - |
| targetKey | <code>string</code> | key of target data extension |
| createdDate | <code>string</code> | e.g. "2020-09-14T01:42:03.017" |
| modifiedDate | <code>string</code> | e.g. "2020-09-14T01:42:03.017" |
| targetUpdateTypeName | <code>&#x27;Overwrite&#x27;</code> \| <code>&#x27;Update&#x27;</code> \| <code>&#x27;Append&#x27;</code> | defines how the query writes into the target data extension |
| [targetUpdateTypeId] | <code>0</code> \| <code>1</code> \| <code>2</code> | mapped to targetUpdateTypeName via this.definition.targetUpdateTypeMapping |
| [targetId] | <code>string</code> | Object ID of DE (removed before save) |
| [targetDescription] | <code>string</code> | Description DE (removed before save) |
| isFrozen | <code>boolean</code> | looks like this is always set to false |
| [queryText] | <code>string</code> | contains SQL query with line breaks converted to '\n'. The content is extracted during retrieval and written into a separate *.sql file |
| [categoryId] | <code>string</code> | holds folder ID, replaced with r__folder_Path during retrieve |
| r__folder_Path | <code>string</code> | folder path in which this DE is saved |
| json | <code>QueryItem</code> | metadata of one item w/o code |
| codeArr | [<code>Array.&lt;CodeExtract&gt;</code>](#CodeExtract) | list of code snippets in this item |
| subFolder | <code>Array.&lt;string&gt;</code> | mostly set to null, otherwise list of subfolders |

<a name="ScriptMap"></a>

## ScriptMap : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | name |
| key | <code>string</code> | key |
| description | <code>string</code> | - |
| createdDate | <code>string</code> | e.g. "2020-09-14T01:42:03.017" |
| modifiedDate | <code>string</code> | e.g. "2020-09-14T01:42:03.017" |
| [script] | <code>string</code> | contains script with line breaks converted to '\n'. The content is extracted during retrieval and written into a separate *.ssjs file |
| [categoryId] | <code>string</code> | holds folder ID, replaced with r__folder_Path during retrieve |
| r__folder_Path | <code>string</code> | folder path in which this DE is saved |

<a name="AssetSubType"></a>

## AssetSubType : <code>Object.&lt;string, any&gt;</code>
**Kind**: global typedef  
<a name="DataExtensionFieldMap"></a>

## DataExtensionFieldMap : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [ObjectID] | <code>string</code> | id |
| [CustomerKey] | <code>string</code> | key in format [DEkey].[FieldName] |
| [DataExtension] | <code>object</code> | - |
| DataExtension.CustomerKey | <code>string</code> | key of DE |
| Name | <code>string</code> | name of field |
| [Name_new] | <code>string</code> | custom attribute that is only used when trying to rename a field from Name to Name_new |
| DefaultValue | <code>string</code> | empty string for not set |
| IsRequired | <code>true</code> \| <code>false</code> | - |
| IsPrimaryKey | <code>true</code> \| <code>false</code> | - |
| Ordinal | <code>string</code> | 1, 2, 3, ... |
| FieldType | <code>&#x27;Text&#x27;</code> \| <code>&#x27;Number&#x27;</code> \| <code>&#x27;Date&#x27;</code> \| <code>&#x27;Boolean&#x27;</code> \| <code>&#x27;Decimal&#x27;</code> \| <code>&#x27;EmailAddress&#x27;</code> \| <code>&#x27;Phone&#x27;</code> \| <code>&#x27;Locale&#x27;</code> | can only be set on create |
| Scale | <code>string</code> | the number of places after the decimal that the field can hold; example: "0","1", ... |

<a name="DataExtensionMap"></a>

## DataExtensionMap : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| CustomerKey | <code>string</code> | key |
| Name | <code>string</code> | name |
| Description | <code>string</code> | - |
| [CreatedDate] | <code>string</code> | iso format |
| [ModifiedDate] | <code>string</code> | iso format |
| IsSendable | <code>true</code> \| <code>false</code> | - |
| IsTestable | <code>true</code> \| <code>false</code> | - |
| SendableDataExtensionField | <code>object</code> | - |
| SendableDataExtensionField.Name | <code>string</code> | - |
| SendableSubscriberField | <code>object</code> | - |
| SendableSubscriberField.Name | <code>string</code> | - |
| Fields | <code>Array.&lt;DataExtensionFieldItem&gt;</code> | list of DE fields |
| r__folder_ContentType | <code>&#x27;dataextension&#x27;</code> \| <code>&#x27;salesforcedataextension&#x27;</code> \| <code>&#x27;synchronizeddataextension&#x27;</code> \| <code>&#x27;shared\_dataextension&#x27;</code> \| <code>&#x27;shared\_salesforcedataextension&#x27;</code> | retrieved from associated folder |
| r__folder_Path | <code>string</code> | folder path in which this DE is saved |
| [CategoryID] | <code>string</code> | holds folder ID, replaced with r__folder_Path during retrieve |
| [r__dataExtensionTemplate_Name] | <code>string</code> | name of optionally associated DE template |
| [Template] | <code>object</code> | - |
| [Template.CustomerKey] | <code>string</code> | key of optionally associated DE teplate |

<a name="AccountUserDocument"></a>

## AccountUserDocument : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| TYPE | <code>string</code> | user.type__c |
| UserID | <code>string</code> | user.UserID |
| AccountUserID | <code>string</code> | user.AccountUserID |
| CustomerKey | <code>string</code> | user.CustomerKey |
| Name | <code>string</code> | user.Name |
| Email | <code>string</code> | user.Email |
| NotificationEmailAddress | <code>string</code> | user.NotificationEmailAddress |
| ActiveFlag | <code>string</code> | user.ActiveFlag === true ? '✓' : '-' |
| IsAPIUser | <code>string</code> | user.IsAPIUser === true ? '✓' : '-' |
| MustChangePassword | <code>string</code> | user.MustChangePassword === true ? '✓' : '-' |
| DefaultBusinessUnit | <code>string</code> | defaultBUName |
| AssociatedBusinessUnits__c | <code>string</code> | associatedBus |
| Roles | <code>string</code> | roles |
| UserPermissions | <code>string</code> | userPermissions |
| LastSuccessfulLogin | <code>string</code> | this.timeSinceDate(user.LastSuccessfulLogin) |
| CreatedDate | <code>string</code> | user.CreatedDate |
| ModifiedDate | <code>string</code> | user.ModifiedDate |

<a name="AutomationActivity"></a>

## AutomationActivity : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | name (not key) of activity |
| [objectTypeId] | <code>string</code> | Id of assoicated activity type; see this.definition.activityTypeMapping |
| [activityObjectId] | <code>string</code> | Object Id of assoicated metadata item |
| [displayOrder] | <code>number</code> | order within step; starts with 1 or higher number |
| r__type | <code>string</code> | see this.definition.activityTypeMapping |

<a name="AutomationStep"></a>

## AutomationStep : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | description |
| [annotation] | <code>string</code> | equals AutomationStep.name |
| [step] | <code>number</code> | step iterator; starts with 1 |
| [stepNumber] | <code>number</code> | step iterator, automatically set during deployment |
| activities | [<code>Array.&lt;AutomationActivity&gt;</code>](#AutomationActivity) | - |

<a name="AutomationSchedule"></a>

## AutomationSchedule : <code>object</code>
REST format

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| typeId | <code>number</code> | ? |
| startDate | <code>string</code> | example: '2021-05-07T09:00:00' |
| endDate | <code>string</code> | example: '2021-05-07T09:00:00' |
| icalRecur | <code>string</code> | example: 'FREQ=DAILY;UNTIL=20790606T160000;INTERVAL=1' |
| timezoneName | <code>string</code> | example: 'W. Europe Standard Time'; see this.definition.timeZoneMapping |
| [timezoneId] | <code>number</code> | see this.definition.timeZoneMapping |

<a name="AutomationScheduleSoap"></a>

## AutomationScheduleSoap : <code>object</code>
SOAP format

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| Recurrence | <code>object</code> | - |
| Recurrence.$ | <code>object</code> | {'xsi:type': keyStem + 'lyRecurrence'} |
| [Recurrence.YearlyRecurrencePatternType] | <code>&#x27;ByYear&#x27;</code> | * currently not supported by tool * |
| [Recurrence.MonthlyRecurrencePatternType] | <code>&#x27;ByMonth&#x27;</code> | * currently not supported by tool * |
| [Recurrence.WeeklyRecurrencePatternType] | <code>&#x27;ByWeek&#x27;</code> | * currently not supported by tool * |
| [Recurrence.DailyRecurrencePatternType] | <code>&#x27;ByDay&#x27;</code> | - |
| [Recurrence.MinutelyRecurrencePatternType] | <code>&#x27;Interval&#x27;</code> | - |
| [Recurrence.HourlyRecurrencePatternType] | <code>&#x27;Interval&#x27;</code> | - |
| [Recurrence.YearInterval] | <code>number</code> | 1..n * currently not supported by tool * |
| [Recurrence.MonthInterval] | <code>number</code> | 1..n * currently not supported by tool * |
| [Recurrence.WeekInterval] | <code>number</code> | 1..n * currently not supported by tool * |
| [Recurrence.DayInterval] | <code>number</code> | 1..n |
| [Recurrence.HourInterval] | <code>number</code> | 1..n |
| [Recurrence.MinuteInterval] | <code>number</code> | 1..n |
| _interval | <code>number</code> | internal variable for CLI output only |
| TimeZone | <code>object</code> | - |
| TimeZone.ID | <code>number</code> | AutomationSchedule.timezoneId |
| _timezoneString | <code>string</code> | internal variable for CLI output only |
| StartDateTime | <code>string</code> | AutomationSchedule.startDate |
| EndDateTime | <code>string</code> | AutomationSchedule.endDate |
| _StartDateTime | <code>string</code> | AutomationSchedule.startDate; internal variable for CLI output only |
| RecurrenceRangeType | <code>&#x27;EndOn&#x27;</code> \| <code>&#x27;EndAfter&#x27;</code> | set to 'EndOn' if AutomationSchedule.icalRecur contains 'UNTIL'; otherwise to 'EndAfter' |
| Occurrences | <code>number</code> | only exists if RecurrenceRangeType=='EndAfter' |

<a name="AutomationItem"></a>

## AutomationItem : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [id] | <code>string</code> | Object Id |
| key | <code>string</code> | key |
| name | <code>string</code> | name |
| description | <code>string</code> | - |
| type | <code>&#x27;scheduled&#x27;</code> \| <code>&#x27;triggered&#x27;</code> | Starting Source = Schedule / File Drop |
| status | <code>&#x27;Scheduled&#x27;</code> \| <code>&#x27;Running&#x27;</code> \| <code>&#x27;Ready&#x27;</code> \| <code>&#x27;Building&#x27;</code> \| <code>&#x27;PausedSchedule&#x27;</code> \| <code>&#x27;InactiveTrigger&#x27;</code> | - |
| [schedule] | [<code>AutomationSchedule</code>](#AutomationSchedule) | only existing if type=scheduled |
| [fileTrigger] | <code>object</code> | only existing if type=triggered |
| fileTrigger.fileNamingPattern | <code>string</code> | file name with placeholders |
| fileTrigger.fileNamePatternTypeId | <code>number</code> | - |
| fileTrigger.folderLocationText | <code>string</code> | where to look for the fileNamingPattern |
| fileTrigger.isPublished | <code>boolean</code> | ? |
| fileTrigger.queueFiles | <code>boolean</code> | ? |
| fileTrigger.triggerActive | <code>boolean</code> | - |
| [startSource] | <code>object</code> | - |
| [startSource.schedule] | [<code>AutomationSchedule</code>](#AutomationSchedule) | rewritten to AutomationItem.schedule |
| [startSource.fileDrop] | <code>object</code> | rewritten to AutomationItem.fileTrigger |
| startSource.fileDrop.fileNamingPattern | <code>string</code> | file name with placeholders |
| startSource.fileDrop.fileNamePatternTypeId | <code>string</code> | - |
| startSource.fileDrop.folderLocation | <code>string</code> | - |
| startSource.fileDrop.queueFiles | <code>boolean</code> | - |
| startSource.typeId | <code>number</code> | - |
| steps | [<code>Array.&lt;AutomationStep&gt;</code>](#AutomationStep) | - |
| r__folder_Path | <code>string</code> | folder path |
| [categoryId] | <code>string</code> | holds folder ID, replaced with r__folder_Path during retrieve |

<a name="SDK"></a>

## SDK : <code>Object.&lt;string, AutomationItem&gt;</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| file | <code>string</code> | relative path to file |
| changes | <code>number</code> | changed lines |
| insertions | <code>number</code> | added lines |
| deletions | <code>number</code> | deleted lines |
| binary | <code>boolean</code> | is a binary file |
| moved | <code>boolean</code> | git thinks this file was moved |
| [fromPath] | <code>string</code> | git thinks this relative path is where the file was before |
| type | [<code>SupportedMetadataTypes</code>](#SupportedMetadataTypes) | metadata type |
| externalKey | <code>string</code> | key |
| name | <code>string</code> | name |
| gitAction | <code>&#x27;move&#x27;</code> \| <code>&#x27;add/update&#x27;</code> \| <code>&#x27;delete&#x27;</code> | what git recognized as an action |
| _credential | <code>string</code> | mcdev credential name |
| _businessUnit | <code>string</code> | mcdev business unit name inside of _credential |

<a name="skipInteraction"></a>

## skipInteraction : <code>object</code>
signals what to insert automatically for things usually asked via wizard

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| client_id | <code>string</code> | client id of installed package |
| client_secret | <code>string</code> | client secret of installed package |
| auth_url | <code>string</code> | tenant specific auth url of installed package |
| account_id | <code>number</code> | MID of the Parent Business Unit |
| credentialName | <code>string</code> | how you would like the credential to be named |
| gitRemoteUrl | <code>string</code> | URL of Git remote server |

<a name="AuthObject"></a>

## AuthObject : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| client_id | <code>string</code> | client_id client_id for sfmc-sdk auth |
| client_secret | <code>string</code> | client_secret for sfmc-sdk auth |
| account_id | <code>number</code> | mid of business unit to auth against |
| auth_url | <code>string</code> | authentication base url |

<a name="SoapFilter"></a>

## SoapFilter : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [continueRequest] | <code>string</code> | request id |
| [options] | <code>object</code> | additional options (CallsInConversation, Client, ConversationID, Priority, RequestType, SaveOptions, ScheduledTime, SendResponseTo, SequenceCode) |
| clientIDs | <code>\*</code> | ? |
| [filter] | [<code>SoapFilter</code>](#SoapFilter) | simple or complex complex |
| [QueryAllAccounts] | <code>boolean</code> | all BUs or just one |
| leftOperand | <code>string</code> \| [<code>SoapFilter</code>](#SoapFilter) | string for simple or a new filter-object for complex |
| operator | <code>&#x27;AND&#x27;</code> \| <code>&#x27;OR&#x27;</code> \| <code>&#x27;equals&#x27;</code> \| <code>&#x27;notEquals&#x27;</code> \| <code>&#x27;isNull&#x27;</code> \| <code>&#x27;isNotNull&#x27;</code> \| <code>&#x27;greaterThan&#x27;</code> \| <code>&#x27;lessThan&#x27;</code> \| <code>&#x27;greaterThanOrEqual&#x27;</code> \| <code>&#x27;lessThanOrEqual&#x27;</code> \| <code>&#x27;between&#x27;</code> \| <code>&#x27;IN&#x27;</code> \| <code>&#x27;like&#x27;</code> | various options |
| [rightOperand] | <code>string</code> \| <code>number</code> \| <code>boolean</code> \| <code>Array</code> \| [<code>SoapFilter</code>](#SoapFilter) | string for simple or a new filter-object for complex; omit for isNull and isNotNull |

<a name="Mcdevrc"></a>

## Mcdevrc : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| credentials | <code>object</code> | list of credentials |
| options | <code>object</code> | configure options for mcdev |
| directories | <code>object</code> | configure directories for mcdev to read/write to |
| directories.businessUnits | <code>string</code> | "businessUnits/" |
| directories.deploy | <code>string</code> | "deploy/" |
| directories.docs | <code>string</code> | "docs/" |
| directories.retrieve | <code>string</code> | "retrieve/" |
| directories.template | <code>string</code> | "template/" |
| directories.templateBuilds | <code>string</code> | ["retrieve/", "deploy/"] |
| markets | <code>Object.&lt;string, object&gt;</code> | templating variables grouped by markets |
| marketList | <code>object</code> | combination of markets and BUs for streamlined deployments |
| metaDataTypes | <code>object</code> | templating variables grouped by markets |
| metaDataTypes.retrieve | <code>Array.&lt;string&gt;</code> | define what types shall be downloaded by default during retrieve |
| metaDataTypes.documentOnRetrieve | <code>Array.&lt;string&gt;</code> | which types should be parsed & documented after retrieve |
| version | <code>string</code> | mcdev version that last updated the config file |

<a name="Logger"></a>

## Logger : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| info | <code>function</code> | print info message |
| warn | <code>function</code> | print warning message |
| verbose | <code>function</code> | additional messages that are not important |
| debug | <code>function</code> | print debug message |
| error | <code>function</code> | print error message |
| errorStack | <code>function</code> | print error with trace message |

