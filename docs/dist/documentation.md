## Classes

<dl>
<dt><a href="#Builder">Builder</a></dt>
<dd><p>Builds metadata from a template using market specific customisation</p>
</dd>
<dt><a href="#Deployer">Deployer</a></dt>
<dd><p>Reads metadata from local directory and deploys it to specified target business unit.
Source and target business units are also compared before the deployment to apply metadata specific patches.</p>
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
<dt><a href="#MetadataTypeDefinitions">MetadataTypeDefinitions</a></dt>
<dd><p>Provides access to all metadataType classes</p>
</dd>
<dt><a href="#MetadataTypeInfo">MetadataTypeInfo</a></dt>
<dd><p>Provides access to all metadataType classes</p>
</dd>
<dt><a href="#BusinessUnit">BusinessUnit</a></dt>
<dd><p>Helper that handles retrieval of BU info</p>
</dd>
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
<dt><a href="#ET_Client">ET_Client</a> : <code><a href="#ET_Client">ET_Client</a></code></dt>
<dd></dd>
<dt><a href="#Util">Util</a></dt>
<dd><p>Util that contains logger and simple util methods</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#createDeltaPkg">createDeltaPkg(argv)</a> ⇒ <code>void</code></dt>
<dd><p>handler for &#39;mcdev createDeltaPkg</p>
</dd>
<dt><a href="#_setLoggingLevel">_setLoggingLevel(argv)</a> ⇒ <code>void</code></dt>
<dd><p>configures what is displayed in the console</p>
</dd>
<dt><a href="#selectTypes">selectTypes()</a> ⇒ <code>Promise</code></dt>
<dd></dd>
<dt><a href="#explainTypes">explainTypes()</a> ⇒ <code>Promise</code></dt>
<dd></dd>
<dt><a href="#upgrade">upgrade([skipInteraction])</a> ⇒ <code>Promise</code></dt>
<dd></dd>
<dt><a href="#retrieve">retrieve(businessUnit, [selectedType])</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>Retrieve all metadata from the specified business unit into the local file system.</p>
</dd>
<dt><a href="#_retrieveBU">_retrieveBU(cred, bu, [selectedType])</a> ⇒ <code>Promise</code></dt>
<dd><p>helper for retrieve()</p>
</dd>
<dt><a href="#_deployBU">_deployBU(cred, bu, [type])</a> ⇒ <code>Promise</code></dt>
<dd><p>helper for deploy()</p>
</dd>
<dt><a href="#deploy">deploy(businessUnit, [selectedType])</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>Deploys all metadata located in the &#39;deploy&#39; directory to the specified business unit</p>
</dd>
<dt><a href="#initProject">initProject([credentialsName], [skipInteraction])</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>Creates template file for properties.json</p>
</dd>
<dt><a href="#findBUs">findBUs(credentialsName)</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>Refreshes BU names and ID&#39;s from MC instance</p>
</dd>
<dt><a href="#document">document(businessUnit, type)</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>Creates docs for supported metadata types in Markdown and/or HTML format</p>
</dd>
<dt><a href="#deleteByKey">deleteByKey(businessUnit, type, customerKey)</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>Creates docs for supported metadata types in Markdown and/or HTML format</p>
</dd>
<dt><a href="#badKeys">badKeys(businessUnit)</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>Converts metadata to legacy format. Output is saved in &#39;converted&#39; directory</p>
</dd>
<dt><a href="#retrieveAsTemplate">retrieveAsTemplate(businessUnit, selectedType, name, market)</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>Retrieve a specific metadata file and templatise.</p>
</dd>
<dt><a href="#buildDefinition">buildDefinition(businessUnit, type, name, market)</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>Build a specific metadata file based on a template.</p>
</dd>
<dt><a href="#_checkMarket">_checkMarket(market)</a> ⇒ <code>Boolean</code></dt>
<dd><p>check if a market name exists in current mcdev config</p>
</dd>
<dt><a href="#buildDefinitionBulk">buildDefinitionBulk(listName, type, name)</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>Build a specific metadata file based on a template using a list of bu-market combos</p>
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
<dt><a href="#CodeExtractItem">CodeExtractItem</a> : <code>Object.&lt;string, any&gt;</code></dt>
<dd></dd>
<dt><a href="#AutomationMap">AutomationMap</a> : <code>Object</code></dt>
<dd><p>REST format</p>
</dd>
<dt><a href="#DataExtensionMap">DataExtensionMap</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#DataExtensionFieldMap">DataExtensionFieldMap</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#MultiMetadataTypeMap">MultiMetadataTypeMap</a> : <code>Object.&lt;string, any&gt;</code></dt>
<dd></dd>
<dt><a href="#CodeExtractItem">CodeExtractItem</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#CodeExtractItem">CodeExtractItem</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#TemplateMap">TemplateMap</a> : <code>Object.&lt;string, string&gt;</code></dt>
<dd></dd>
</dl>

<a name="Builder"></a>

## Builder
Builds metadata from a template using market specific customisation

**Kind**: global class  

* [Builder](#Builder)
    * [new Builder(properties, buObject, client)](#new_Builder_new)
    * _instance_
        * [.buildDefinition(metadataType, name, variables)](#Builder+buildDefinition) ⇒ <code>Promise</code>
    * _static_
        * [.verifyMarketList(mlName, properties)](#Builder.verifyMarketList) ⇒ <code>void</code>

<a name="new_Builder_new"></a>

### new Builder(properties, buObject, client)
Creates a Builder, uses v2 auth if v2AuthOptions are passed.


| Param | Type | Description |
| --- | --- | --- |
| properties | <code>Object</code> | properties for auth |
| properties.clientId | <code>String</code> | clientId for FuelSDK auth |
| properties.clientSecret | <code>String</code> | clientSecret for FuelSDK auth |
| properties.directories | <code>Object</code> | list of default directories |
| properties.directories.template | <code>String</code> | where templates are saved |
| properties.directories.templateBuilds | <code>String</code> | where template-based deployment definitions are saved |
| properties.tenant | <code>String</code> | v2 Auth Tenant Information |
| properties.businessUnits | <code>String</code> | ID of Business Unit to authenticate with |
| buObject | <code>Object</code> | properties for auth |
| buObject.clientId | <code>String</code> | clientId for FuelSDK auth |
| buObject.clientSecret | <code>String</code> | clientSecret for FuelSDK auth |
| buObject.credential | <code>Object</code> | clientId for FuelSDK auth |
| buObject.tenant | <code>String</code> | v2 Auth Tenant Information |
| buObject.mid | <code>String</code> | ID of Business Unit to authenticate with |
| buObject.businessUnit | <code>String</code> | name of Business Unit to authenticate with |
| client | <code>Util.ET\_Client</code> | fuel client |

<a name="Builder+buildDefinition"></a>

### builder.buildDefinition(metadataType, name, variables) ⇒ <code>Promise</code>
Builds a specific metadata file by name

**Kind**: instance method of [<code>Builder</code>](#Builder)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadataType | <code>String</code> | metadata type to build |
| name | <code>String</code> | name of metadata to build |
| variables | <code>Object</code> | variables to be replaced in the metadata |

<a name="Builder.verifyMarketList"></a>

### Builder.verifyMarketList(mlName, properties) ⇒ <code>void</code>
ensure provided MarketList exists and it's content including markets and BUs checks out

**Kind**: static method of [<code>Builder</code>](#Builder)  
**Returns**: <code>void</code> - throws errors if problems were found  

| Param | Type | Description |
| --- | --- | --- |
| mlName | <code>String</code> | name of marketList |
| properties | <code>Object</code> | General configuration to be used in retrieve |
| properties.markets | <code>Object</code> | list of template variable combos |
| properties.marketList | <code>Object</code> | list of bu-market combos |
| properties.credentials | <code>Object</code> | list of credentials and their BUs |

<a name="Deployer"></a>

## Deployer
Reads metadata from local directory and deploys it to specified target business unit.
Source and target business units are also compared before the deployment to apply metadata specific patches.

**Kind**: global class  

* [Deployer](#Deployer)
    * [new Deployer(properties, buObject, client, [type])](#new_Deployer_new)
    * _instance_
        * [.deploy()](#Deployer+deploy) ⇒ <code>Promise</code>
        * [.deployCallback(result, metadataType)](#Deployer+deployCallback) ⇒ <code>void</code>
    * _static_
        * [.readBUMetadata(deployDir, [type], [listBadKeys])](#Deployer.readBUMetadata) ⇒ <code>Object</code>
        * [.createFolderDefinitions(deployDir, metadata, metadataTypeArr)](#Deployer.createFolderDefinitions) ⇒ <code>void</code>

<a name="new_Deployer_new"></a>

### new Deployer(properties, buObject, client, [type])
Creates a Deployer, uses v2 auth if v2AuthOptions are passed.


| Param | Type | Description |
| --- | --- | --- |
| properties | <code>Object</code> | General configuration to be used in retrieve |
| properties.directories | <code>Object</code> | Directories to be used when interacting with FS |
| buObject | <code>Object</code> | properties for auth |
| buObject.clientId | <code>String</code> | clientId for FuelSDK auth |
| buObject.clientSecret | <code>String</code> | clientSecret for FuelSDK auth |
| buObject.credential | <code>Object</code> | clientId for FuelSDK auth |
| buObject.tenant | <code>String</code> | v2 Auth Tenant Information |
| buObject.mid | <code>String</code> | ID of Business Unit to authenticate with |
| buObject.businessUnit | <code>String</code> | name of Business Unit to authenticate with |
| client | <code>Util.ET\_Client</code> | fuel client |
| [type] | <code>String</code> | limit deployment to given metadata type |

<a name="Deployer+deploy"></a>

### deployer.deploy() ⇒ <code>Promise</code>
Deploy all metadata that is located in the deployDir

**Kind**: instance method of [<code>Deployer</code>](#Deployer)  
**Returns**: <code>Promise</code> - Promise  
<a name="Deployer+deployCallback"></a>

### deployer.deployCallback(result, metadataType) ⇒ <code>void</code>
Gets called for every deployed metadata entry

**Kind**: instance method of [<code>Deployer</code>](#Deployer)  

| Param | Type | Description |
| --- | --- | --- |
| result | <code>Object</code> | Deployment result |
| metadataType | <code>String</code> | Name of metadata type |

<a name="Deployer.readBUMetadata"></a>

### Deployer.readBUMetadata(deployDir, [type], [listBadKeys]) ⇒ <code>Object</code>
Returns metadata of a business unit that is saved locally

**Kind**: static method of [<code>Deployer</code>](#Deployer)  
**Returns**: <code>Object</code> - Metadata of BU in local directory  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| deployDir | <code>String</code> |  | root directory of metadata. |
| [type] | <code>String</code> |  | limit deployment to given metadata type |
| [listBadKeys] | <code>boolean</code> | <code>false</code> | do not print errors, used for badKeys() |

<a name="Deployer.createFolderDefinitions"></a>

### Deployer.createFolderDefinitions(deployDir, metadata, metadataTypeArr) ⇒ <code>void</code>
parses asset metadata to auto-create folders in target folder

**Kind**: static method of [<code>Deployer</code>](#Deployer)  

| Param | Type | Description |
| --- | --- | --- |
| deployDir | <code>String</code> | root directory of metadata. |
| metadata | <code>Object</code> | list of metadata |
| metadataTypeArr | <code>String</code> | list of metadata types |

<a name="Asset"></a>

## Asset ⇐ [<code>MetadataType</code>](#MetadataType)
FileTransfer MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [Asset](#Asset) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir, _, __, [selectedSubType])](#Asset.retrieve) ⇒ <code>Promise.&lt;{metadata:AssetMap, type:string}&gt;</code>
    * [.retrieveForCache(_, [selectedSubType])](#Asset.retrieveForCache) ⇒ <code>Promise.&lt;{metadata:AssetMap, type:string}&gt;</code>
    * [.retrieveAsTemplate(templateDir, name, templateVariables, [selectedSubType])](#Asset.retrieveAsTemplate) ⇒ <code>Promise.&lt;{metadata:AssetMap, type:string}&gt;</code>
    * [.create(metadata)](#Asset.create) ⇒ <code>Promise</code>
    * [.update(metadata)](#Asset.update) ⇒ <code>Promise</code>
    * [.requestSubType(subType, subTypeArray, [retrieveDir], [templateName], [templateVariables])](#Asset.requestSubType) ⇒ <code>Promise</code>
    * [.requestAndSaveExtended(items, subType, retrieveDir, [templateVariables])](#Asset.requestAndSaveExtended) ⇒ <code>Promise</code>
    * [._retrieveExtendedFile(metadata, subType, retrieveDir)](#Asset._retrieveExtendedFile) ⇒ <code>Promise.&lt;void&gt;</code>
    * [._readExtendedFileFromFS(metadata, subType, deployDir)](#Asset._readExtendedFileFromFS) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.postRetrieveTasks(metadata, [_], isTemplating)](#Asset.postRetrieveTasks) ⇒ [<code>CodeExtractItem</code>](#CodeExtractItem)
    * [.preDeployTasks(metadata, deployDir)](#Asset.preDeployTasks) ⇒ <code>Promise.&lt;AssetItem&gt;</code>
    * [.getSubtype(metadata)](#Asset.getSubtype) ⇒ <code>AssetSubType</code>
    * [.buildDefinitionForExtracts(templateDir, targetDir, metadata, variables, templateName)](#Asset.buildDefinitionForExtracts) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.parseMetadata(metadata)](#Asset.parseMetadata) ⇒ [<code>CodeExtractItem</code>](#CodeExtractItem)
    * [._mergeCode(metadata, deployDir, subType, [templateName])](#Asset._mergeCode) ⇒ <code>Promise.&lt;Array.&lt;MetadataType.CodeExtract&gt;&gt;</code>
    * [._mergeCode_slots(metadataSlots, readDirArr, subtypeExtension, subDirArr, fileList, customerKey, [templateName])](#Asset._mergeCode_slots) ⇒ <code>Promise.&lt;void&gt;</code>
    * [._extractCode(metadata)](#Asset._extractCode) ⇒ [<code>CodeExtractItem</code>](#CodeExtractItem)
    * [._extractCode_slots(metadataSlots, codeArr)](#Asset._extractCode_slots) ⇒ <code>void</code>
    * [.getJsonFromFS(dir)](#Asset.getJsonFromFS) ⇒ <code>Object</code>
    * [.findSubType(templateDir, templateName)](#Asset.findSubType) ⇒ <code>AssetSubType</code>
    * [.readSecondaryFolder(templateDir, typeDirArr, templateName, fileName)](#Asset.readSecondaryFolder) ⇒ <code>AssetItem</code>

<a name="Asset.retrieve"></a>

### Asset.retrieve(retrieveDir, _, __, [selectedSubType]) ⇒ <code>Promise.&lt;{metadata:AssetMap, type:string}&gt;</code>
Retrieves Metadata of Asset

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>Promise.&lt;{metadata:AssetMap, type:string}&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| _ | <code>void</code> | - |
| __ | <code>void</code> | - |
| [selectedSubType] | <code>AssetSubType</code> | optionally limit to a single subtype |

<a name="Asset.retrieveForCache"></a>

### Asset.retrieveForCache(_, [selectedSubType]) ⇒ <code>Promise.&lt;{metadata:AssetMap, type:string}&gt;</code>
Retrieves asset metadata for caching

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>Promise.&lt;{metadata:AssetMap, type:string}&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| _ | <code>void</code> | - |
| [selectedSubType] | <code>string</code> | optionally limit to a single subtype |

<a name="Asset.retrieveAsTemplate"></a>

### Asset.retrieveAsTemplate(templateDir, name, templateVariables, [selectedSubType]) ⇒ <code>Promise.&lt;{metadata:AssetMap, type:string}&gt;</code>
Retrieves asset metadata for caching

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>Promise.&lt;{metadata:AssetMap, type:string}&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| name | <code>string</code> | name of the metadata file |
| templateVariables | <code>Util.TemplateMap</code> | variables to be replaced in the metadata |
| [selectedSubType] | <code>AssetSubType</code> | optionally limit to a single subtype |

<a name="Asset.create"></a>

### Asset.create(metadata) ⇒ <code>Promise</code>
Creates a single asset

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>AssetItem</code> | a single asset |

<a name="Asset.update"></a>

### Asset.update(metadata) ⇒ <code>Promise</code>
Updates a single asset

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>AssetItem</code> | a single asset |

<a name="Asset.requestSubType"></a>

### Asset.requestSubType(subType, subTypeArray, [retrieveDir], [templateName], [templateVariables]) ⇒ <code>Promise</code>
Retrieves Metadata of a specific asset type

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| subType | <code>AssetSubType</code> | group of similar assets to put in a folder (ie. images) |
| subTypeArray | <code>Array.&lt;AssetSubType&gt;</code> | list of all asset types within this subtype |
| [retrieveDir] | <code>string</code> | target directory for saving assets |
| [templateName] | <code>string</code> | name of the metadata file |
| [templateVariables] | <code>Util.TemplateMap</code> | variables to be replaced in the metadata |

<a name="Asset.requestAndSaveExtended"></a>

### Asset.requestAndSaveExtended(items, subType, retrieveDir, [templateVariables]) ⇒ <code>Promise</code>
Retrieves extended metadata (files or extended content) of asset

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| items | <code>Array</code> | array of items to retrieve |
| subType | <code>AssetSubType</code> | group of similar assets to put in a folder (ie. images) |
| retrieveDir | <code>string</code> | target directory for saving assets |
| [templateVariables] | <code>Util.TemplateMap</code> | variables to be replaced in the metadata |

<a name="Asset._retrieveExtendedFile"></a>

### Asset.\_retrieveExtendedFile(metadata, subType, retrieveDir) ⇒ <code>Promise.&lt;void&gt;</code>
Some metadata types store their actual content as a separate file, e.g. images
This method retrieves these and saves them alongside the metadata json

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>AssetItem</code> | a single asset |
| subType | <code>AssetSubType</code> | group of similar assets to put in a folder (ie. images) |
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
| metadata | <code>AssetItem</code> | a single asset |
| subType | <code>AssetSubType</code> | group of similar assets to put in a folder (ie. images) |
| deployDir | <code>string</code> | directory of deploy files |

<a name="Asset.postRetrieveTasks"></a>

### Asset.postRetrieveTasks(metadata, [_], isTemplating) ⇒ [<code>CodeExtractItem</code>](#CodeExtractItem)
manages post retrieve steps

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: [<code>CodeExtractItem</code>](#CodeExtractItem) - metadata  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>AssetItem</code> | a single asset |
| [_] | <code>string</code> | unused |
| isTemplating | <code>Boolean</code> | signals that we are retrieving templates |

<a name="Asset.preDeployTasks"></a>

### Asset.preDeployTasks(metadata, deployDir) ⇒ <code>Promise.&lt;AssetItem&gt;</code>
prepares an asset definition for deployment

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>Promise.&lt;AssetItem&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>AssetItem</code> | a single asset |
| deployDir | <code>string</code> | directory of deploy files |

<a name="Asset.getSubtype"></a>

### Asset.getSubtype(metadata) ⇒ <code>AssetSubType</code>
determines the subtype of the current asset

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>AssetSubType</code> - subtype  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>AssetItem</code> | a single asset |

<a name="Asset.buildDefinitionForExtracts"></a>

### Asset.buildDefinitionForExtracts(templateDir, targetDir, metadata, variables, templateName) ⇒ <code>Promise.&lt;void&gt;</code>
helper for buildDefinition
handles extracted code if any are found for complex types

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>Promise.&lt;void&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where metadata templates are stored |
| targetDir | <code>string</code> | Directory where built definitions will be saved |
| metadata | <code>AssetItem</code> | main JSON file that was read from file system |
| variables | <code>Util.TemplateMap</code> | variables to be replaced in the metadata |
| templateName | <code>string</code> | name of the template to be built |

<a name="Asset.parseMetadata"></a>

### Asset.parseMetadata(metadata) ⇒ [<code>CodeExtractItem</code>](#CodeExtractItem)
parses retrieved Metadata before saving

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: [<code>CodeExtractItem</code>](#CodeExtractItem) - parsed metadata definition  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>AssetItem</code> | a single asset definition |

<a name="Asset._mergeCode"></a>

### Asset.\_mergeCode(metadata, deployDir, subType, [templateName]) ⇒ <code>Promise.&lt;Array.&lt;MetadataType.CodeExtract&gt;&gt;</code>
helper for this.preDeployTasks() that loads extracted code content back into JSON

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>Promise.&lt;Array.&lt;MetadataType.CodeExtract&gt;&gt;</code> - fileList for templating (disregarded during deployment)  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>AssetItem</code> | a single asset definition |
| deployDir | <code>string</code> | directory of deploy files |
| subType | <code>AssetSubType</code> | asset-subtype name |
| [templateName] | <code>string</code> | name of the template used to built defintion (prior applying templating) |

<a name="Asset._mergeCode_slots"></a>

### Asset.\_mergeCode\_slots(metadataSlots, readDirArr, subtypeExtension, subDirArr, fileList, customerKey, [templateName]) ⇒ <code>Promise.&lt;void&gt;</code>
helper for this.preDeployTasks() that loads extracted code content back into JSON

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| metadataSlots | <code>Object</code> | metadata.views.html.slots or deeper slots.<>.blocks.<>.slots |
| readDirArr | <code>Array.&lt;string&gt;</code> | directory of deploy files |
| subtypeExtension | <code>string</code> | asset-subtype name ending on -meta |
| subDirArr | <code>Array.&lt;string&gt;</code> | directory of files w/o leading deploy dir |
| fileList | <code>Array.&lt;Object&gt;</code> | directory of files w/o leading deploy dir |
| customerKey | <code>string</code> | external key of template (could have been changed if used during templating) |
| [templateName] | <code>string</code> | name of the template used to built defintion (prior applying templating) |

<a name="Asset._extractCode"></a>

### Asset.\_extractCode(metadata) ⇒ [<code>CodeExtractItem</code>](#CodeExtractItem)
helper for this.parseMetadata() that finds code content in JSON and extracts it
to allow saving that separately and formatted

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: [<code>CodeExtractItem</code>](#CodeExtractItem) - { json: metadata, codeArr: object[], subFolder: string[] }  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>AssetItem</code> | a single asset definition |

<a name="Asset._extractCode_slots"></a>

### Asset.\_extractCode\_slots(metadataSlots, codeArr) ⇒ <code>void</code>
**Kind**: static method of [<code>Asset</code>](#Asset)  

| Param | Type | Description |
| --- | --- | --- |
| metadataSlots | <code>Object</code> | metadata.views.html.slots or deeper slots.<>.blocks.<>.slots |
| codeArr | <code>Array.&lt;Object&gt;</code> | to be extended array for extracted code |

<a name="Asset.getJsonFromFS"></a>

### Asset.getJsonFromFS(dir) ⇒ <code>Object</code>
Returns file contents mapped to their fileName without '.json' ending

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>Object</code> - fileName => fileContent map  

| Param | Type | Description |
| --- | --- | --- |
| dir | <code>string</code> | directory that contains '.json' files to be read |

<a name="Asset.findSubType"></a>

### Asset.findSubType(templateDir, templateName) ⇒ <code>AssetSubType</code>
check template directory for complex types that open subfolders for their subtypes

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>AssetSubType</code> - subtype name  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where metadata templates are stored |
| templateName | <code>string</code> | name of the metadata file |

<a name="Asset.readSecondaryFolder"></a>

### Asset.readSecondaryFolder(templateDir, typeDirArr, templateName, fileName) ⇒ <code>AssetItem</code>
optional method used for some types to try a different folder structure

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>AssetItem</code> - metadata  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where metadata templates are stored |
| typeDirArr | <code>Array.&lt;string&gt;</code> | current subdir for this type |
| templateName | <code>string</code> | name of the metadata template |
| fileName | <code>string</code> | name of the metadata template file w/o extension |

<a name="AttributeGroup"></a>

## AttributeGroup ⇐ [<code>MetadataType</code>](#MetadataType)
AttributeGroup MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [AttributeGroup](#AttributeGroup) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieveForCache()](#AttributeGroup.retrieveForCache) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [.retrieve(retrieveDir)](#AttributeGroup.retrieve) ⇒ <code>Promise.&lt;Object&gt;</code>

<a name="AttributeGroup.retrieveForCache"></a>

### AttributeGroup.retrieveForCache() ⇒ <code>Promise.&lt;Object&gt;</code>
Retrieves Metadata of schema attribute groups for caching.

**Kind**: static method of [<code>AttributeGroup</code>](#AttributeGroup)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Promise of metadata  
<a name="AttributeGroup.retrieve"></a>

### AttributeGroup.retrieve(retrieveDir) ⇒ <code>Promise.&lt;Object&gt;</code>
Retrieves Metadata of schema attribute groups.

**Kind**: static method of [<code>AttributeGroup</code>](#AttributeGroup)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Promise of metadata  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>String</code> | Directory where retrieved metadata directory will be saved |

<a name="Automation"></a>

## Automation ⇐ [<code>MetadataType</code>](#MetadataType)
Automation MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [Automation](#Automation) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir)](#Automation.retrieve) ⇒ <code>Promise.&lt;{metadata:AutomationMap, type:string}&gt;</code>
    * [.retrieveForCache()](#Automation.retrieveForCache) ⇒ <code>Promise.&lt;{metadata:AutomationMap, type:string}&gt;</code>
    * [.retrieveAsTemplate(templateDir, name, variables)](#Automation.retrieveAsTemplate) ⇒ <code>Promise.&lt;{metadata:AutomationMap, type:string}&gt;</code>
    * [.postRetrieveTasks(metadata, [_], [isTemplating])](#Automation.postRetrieveTasks) ⇒ <code>AutomationItem</code>
    * [.deploy(metadata, targetBU, retrieveDir)](#Automation.deploy) ⇒ [<code>Promise.&lt;AutomationMap&gt;</code>](#AutomationMap)
    * [.create(metadata)](#Automation.create) ⇒ <code>Promise</code>
    * [.update(metadata, metadataBefore)](#Automation.update) ⇒ <code>Promise</code>
    * [.preDeployTasks(metadata)](#Automation.preDeployTasks) ⇒ <code>Promise.&lt;AutomationItem&gt;</code>
    * [.validateDeployMetadata(metadata)](#Automation.validateDeployMetadata) ⇒ <code>Boolean</code>
    * [.postDeployTasks(metadata, originalMetadata)](#Automation.postDeployTasks) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.parseMetadata(metadata)](#Automation.parseMetadata) ⇒ <code>Array</code>
    * [._buildSchedule(scheduleObject)](#Automation._buildSchedule) ⇒ <code>AutomationScheduleSoap</code>
    * [._calcTime(offsetServer, dateInput, [offsetInput])](#Automation._calcTime) ⇒ <code>string</code>

<a name="Automation.retrieve"></a>

### Automation.retrieve(retrieveDir) ⇒ <code>Promise.&lt;{metadata:AutomationMap, type:string}&gt;</code>
Retrieves Metadata of Automation

**Kind**: static method of [<code>Automation</code>](#Automation)  
**Returns**: <code>Promise.&lt;{metadata:AutomationMap, type:string}&gt;</code> - Promise of metadata  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |

<a name="Automation.retrieveForCache"></a>

### Automation.retrieveForCache() ⇒ <code>Promise.&lt;{metadata:AutomationMap, type:string}&gt;</code>
Retrieves automation metadata for caching

**Kind**: static method of [<code>Automation</code>](#Automation)  
**Returns**: <code>Promise.&lt;{metadata:AutomationMap, type:string}&gt;</code> - Promise of metadata  
<a name="Automation.retrieveAsTemplate"></a>

### Automation.retrieveAsTemplate(templateDir, name, variables) ⇒ <code>Promise.&lt;{metadata:AutomationMap, type:string}&gt;</code>
Retrieve a specific Automation Definition by Name

**Kind**: static method of [<code>Automation</code>](#Automation)  
**Returns**: <code>Promise.&lt;{metadata:AutomationMap, type:string}&gt;</code> - Promise of metadata  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| name | <code>string</code> | name of the metadata file |
| variables | <code>Util.TemplateMap</code> | variables to be replaced in the metadata |

<a name="Automation.postRetrieveTasks"></a>

### Automation.postRetrieveTasks(metadata, [_], [isTemplating]) ⇒ <code>AutomationItem</code>
manages post retrieve steps

**Kind**: static method of [<code>Automation</code>](#Automation)  
**Returns**: <code>AutomationItem</code> - metadata  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>AutomationItem</code> | a single automation |
| [_] | <code>string</code> | unused |
| [isTemplating] | <code>Boolean</code> | signals that we are retrieving templates |

<a name="Automation.deploy"></a>

### Automation.deploy(metadata, targetBU, retrieveDir) ⇒ [<code>Promise.&lt;AutomationMap&gt;</code>](#AutomationMap)
Deploys automation - the saved file is the original one due to large differences required for deployment

**Kind**: static method of [<code>Automation</code>](#Automation)  
**Returns**: [<code>Promise.&lt;AutomationMap&gt;</code>](#AutomationMap) - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | [<code>AutomationMap</code>](#AutomationMap) | metadata mapped by their keyField |
| targetBU | <code>string</code> | name/shorthand of target businessUnit for mapping |
| retrieveDir | <code>string</code> | directory where metadata after deploy should be saved |

<a name="Automation.create"></a>

### Automation.create(metadata) ⇒ <code>Promise</code>
Creates a single automation

**Kind**: static method of [<code>Automation</code>](#Automation)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>AutomationItem</code> | single metadata entry |

<a name="Automation.update"></a>

### Automation.update(metadata, metadataBefore) ⇒ <code>Promise</code>
Updates a single automation

**Kind**: static method of [<code>Automation</code>](#Automation)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>AutomationItem</code> | single metadata entry |
| metadataBefore | <code>AutomationItem</code> | metadata mapped by their keyField |

<a name="Automation.preDeployTasks"></a>

### Automation.preDeployTasks(metadata) ⇒ <code>Promise.&lt;AutomationItem&gt;</code>
Gets executed before deploying metadata

**Kind**: static method of [<code>Automation</code>](#Automation)  
**Returns**: <code>Promise.&lt;AutomationItem&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>AutomationItem</code> | metadata mapped by their keyField |

<a name="Automation.validateDeployMetadata"></a>

### Automation.validateDeployMetadata(metadata) ⇒ <code>Boolean</code>
Validates the automation to be sure it can be deployed.
Whitelisted Activites are deployed but require configuration

**Kind**: static method of [<code>Automation</code>](#Automation)  
**Returns**: <code>Boolean</code> - result if automation can be deployed based on steps  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>AutomationItem</code> | single automation record |

<a name="Automation.postDeployTasks"></a>

### Automation.postDeployTasks(metadata, originalMetadata) ⇒ <code>Promise.&lt;void&gt;</code>
Gets executed after deployment of metadata type

**Kind**: static method of [<code>Automation</code>](#Automation)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| metadata | [<code>AutomationMap</code>](#AutomationMap) | metadata mapped by their keyField |
| originalMetadata | [<code>AutomationMap</code>](#AutomationMap) | metadata to be updated (contains additioanl fields) |

<a name="Automation.parseMetadata"></a>

### Automation.parseMetadata(metadata) ⇒ <code>Array</code>
parses retrieved Metadata before saving

**Kind**: static method of [<code>Automation</code>](#Automation)  
**Returns**: <code>Array</code> - Array with one metadata object and one sql string  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>AutomationItem</code> | a single automation definition |

<a name="Automation._buildSchedule"></a>

### Automation.\_buildSchedule(scheduleObject) ⇒ <code>AutomationScheduleSoap</code>
Builds a schedule object to be used for scheduling an automation
based on combination of ical string and start/end dates.

**Kind**: static method of [<code>Automation</code>](#Automation)  
**Returns**: <code>AutomationScheduleSoap</code> - Schedulable object for soap API (currently not rest supported)  

| Param | Type | Description |
| --- | --- | --- |
| scheduleObject | <code>AutomationSchedule</code> | child of automation metadata used for scheduling |

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

<a name="Campaign"></a>

## Campaign ⇐ [<code>MetadataType</code>](#MetadataType)
Campaign MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [Campaign](#Campaign) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir)](#Campaign.retrieve) ⇒ <code>Promise</code>
    * [._retrieveCampaignAsset(retrieveDir, id, name)](#Campaign._retrieveCampaignAsset) ⇒ <code>Promise</code>
    * [._parseAssetResponseBody(body)](#Campaign._parseAssetResponseBody) ⇒ <code>Object</code>

<a name="Campaign.retrieve"></a>

### Campaign.retrieve(retrieveDir) ⇒ <code>Promise</code>
Retrieves Metadata of campaigns. Afterwards, starts metadata retrieval for their campaign assets

**Kind**: static method of [<code>Campaign</code>](#Campaign)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>String</code> | Directory where retrieved metadata directory will be saved |

<a name="Campaign._retrieveCampaignAsset"></a>

### Campaign.\_retrieveCampaignAsset(retrieveDir, id, name) ⇒ <code>Promise</code>
Retrieves campaign asset for a specific campaign

**Kind**: static method of [<code>Campaign</code>](#Campaign)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>String</code> | Directory where retrieved metadata directory will be saved |
| id | <code>Number</code> | id of the parent campaign |
| name | <code>String</code> | name of the parent campaign |

<a name="Campaign._parseAssetResponseBody"></a>

### Campaign.\_parseAssetResponseBody(body) ⇒ <code>Object</code>
Parses campaign asset response body and returns metadata entries mapped to their id

**Kind**: static method of [<code>Campaign</code>](#Campaign)  
**Returns**: <code>Object</code> - keyField => metadata map  

| Param | Type | Description |
| --- | --- | --- |
| body | <code>Object</code> | response body of metadata retrieval |

<a name="ContentArea"></a>

## ContentArea ⇐ [<code>MetadataType</code>](#MetadataType)
ContentArea MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [ContentArea](#ContentArea) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir)](#ContentArea.retrieve) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [.postRetrieveTasks(metadata)](#ContentArea.postRetrieveTasks) ⇒ <code>Array.&lt;Object&gt;</code>
    * [.parseMetadata(metadata)](#ContentArea.parseMetadata) ⇒ <code>Array</code>

<a name="ContentArea.retrieve"></a>

### ContentArea.retrieve(retrieveDir) ⇒ <code>Promise.&lt;Object&gt;</code>
Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata

**Kind**: static method of [<code>ContentArea</code>](#ContentArea)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Promise of metadata  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>String</code> | Directory where retrieved metadata directory will be saved |

<a name="ContentArea.postRetrieveTasks"></a>

### ContentArea.postRetrieveTasks(metadata) ⇒ <code>Array.&lt;Object&gt;</code>
manages post retrieve steps

**Kind**: static method of [<code>ContentArea</code>](#ContentArea)  
**Returns**: <code>Array.&lt;Object&gt;</code> - Array with one metadata object and one query string  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>Object</code> | a single query |

<a name="ContentArea.parseMetadata"></a>

### ContentArea.parseMetadata(metadata) ⇒ <code>Array</code>
parses retrieved Metadata before saving

**Kind**: static method of [<code>ContentArea</code>](#ContentArea)  
**Returns**: <code>Array</code> - Array with one metadata object and one sql string  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>Object</code> | a single query activity definition |

<a name="DataExtension"></a>

## DataExtension ⇐ [<code>MetadataType</code>](#MetadataType)
DataExtension MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [DataExtension](#DataExtension) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.upsert(desToDeploy, _, buObject)](#DataExtension.upsert) ⇒ <code>Promise</code>
    * [._filterUpsertResults(res)](#DataExtension._filterUpsertResults) ⇒ <code>Boolean</code>
    * [.prepareDeployColumnsOnUpdate(deployColumns, targetColumns)](#DataExtension.prepareDeployColumnsOnUpdate) ⇒ <code>void</code>
    * [.create(metadata)](#DataExtension.create) ⇒ <code>Promise</code>
    * [.update(metadata)](#DataExtension.update) ⇒ <code>Promise</code>
    * [.retrieve(retrieveDir, [additionalFields], buObject)](#DataExtension.retrieve) ⇒ <code>Promise.&lt;{metadata:DataExtensionMap, type:string}&gt;</code>
    * [.postRetrieveTasks(metadata, [_], [isTemplating])](#DataExtension.postRetrieveTasks) ⇒ <code>DataExtensionItem</code>
    * [.preDeployTasks(metadata)](#DataExtension.preDeployTasks) ⇒ <code>Promise.&lt;DataExtensionItem&gt;</code>
    * [.document(buObject, [metadata], [isDeploy])](#DataExtension.document) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.deleteByKey(buObject, customerKey)](#DataExtension.deleteByKey) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.retrieveForCache(buObject)](#DataExtension.retrieveForCache) ⇒ <code>Promise</code>
    * [.retrieveAsTemplate(templateDir, name, variables)](#DataExtension.retrieveAsTemplate) ⇒ <code>Promise.&lt;{metadata:DataExtensionMap, type:string}&gt;</code>

<a name="DataExtension.upsert"></a>

### DataExtension.upsert(desToDeploy, _, buObject) ⇒ <code>Promise</code>
Upserts dataExtensions after retrieving them from source and target to compare
if create or update operation is needed.

**Kind**: static method of [<code>DataExtension</code>](#DataExtension)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| desToDeploy | [<code>DataExtensionMap</code>](#DataExtensionMap) | dataExtensions mapped by their customerKey |
| _ | <code>Object</code> | - |
| buObject | <code>Util.BuObject</code> | properties for auth |

<a name="DataExtension._filterUpsertResults"></a>

### DataExtension.\_filterUpsertResults(res) ⇒ <code>Boolean</code>
helper for upsert()

**Kind**: static method of [<code>DataExtension</code>](#DataExtension)  
**Returns**: <code>Boolean</code> - true: keep, false: discard  

| Param | Type | Description |
| --- | --- | --- |
| res | <code>Object</code> | - |

<a name="DataExtension.prepareDeployColumnsOnUpdate"></a>

### DataExtension.prepareDeployColumnsOnUpdate(deployColumns, targetColumns) ⇒ <code>void</code>
Mofifies passed deployColumns for update by mapping ObjectID to their target column's values.
Removes FieldType field if its the same in deploy and target column, because it results in an error even if its of the same type

**Kind**: static method of [<code>DataExtension</code>](#DataExtension)  

| Param | Type | Description |
| --- | --- | --- |
| deployColumns | <code>Array.&lt;DataExtensionField.DataExtensionFieldItem&gt;</code> | Columns of data extension that will be deployed |
| targetColumns | <code>Array.&lt;DataExtensionField.DataExtensionFieldItem&gt;</code> | Columns of data extension that currently exists in target |

<a name="DataExtension.create"></a>

### DataExtension.create(metadata) ⇒ <code>Promise</code>
Create a single dataExtension. Also creates their columns in 'dataExtension.columns'

**Kind**: static method of [<code>DataExtension</code>](#DataExtension)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>DataExtensionItem</code> | single metadata entry |

<a name="DataExtension.update"></a>

### DataExtension.update(metadata) ⇒ <code>Promise</code>
Updates a single dataExtension. Also updates their columns in 'dataExtension.columns'

**Kind**: static method of [<code>DataExtension</code>](#DataExtension)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>DataExtensionItem</code> | single metadata entry |

<a name="DataExtension.retrieve"></a>

### DataExtension.retrieve(retrieveDir, [additionalFields], buObject) ⇒ <code>Promise.&lt;{metadata:DataExtensionMap, type:string}&gt;</code>
Retrieves dataExtension metadata. Afterwards starts retrieval of dataExtensionColumn metadata retrieval

**Kind**: static method of [<code>DataExtension</code>](#DataExtension)  
**Returns**: <code>Promise.&lt;{metadata:DataExtensionMap, type:string}&gt;</code> - Promise of item map  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| [additionalFields] | <code>Array.&lt;string&gt;</code> | Returns specified fields even if their retrieve definition is not set to true |
| buObject | <code>Util.BuObject</code> | properties for auth |

<a name="DataExtension.postRetrieveTasks"></a>

### DataExtension.postRetrieveTasks(metadata, [_], [isTemplating]) ⇒ <code>DataExtensionItem</code>
manages post retrieve steps

**Kind**: static method of [<code>DataExtension</code>](#DataExtension)  
**Returns**: <code>DataExtensionItem</code> - metadata  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>DataExtensionItem</code> | a single dataExtension |
| [_] | <code>string</code> | unused |
| [isTemplating] | <code>boolean</code> | signals that we are retrieving templates |

<a name="DataExtension.preDeployTasks"></a>

### DataExtension.preDeployTasks(metadata) ⇒ <code>Promise.&lt;DataExtensionItem&gt;</code>
prepares a DataExtension for deployment

**Kind**: static method of [<code>DataExtension</code>](#DataExtension)  
**Returns**: <code>Promise.&lt;DataExtensionItem&gt;</code> - Promise of updated single DE  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>DataExtensionItem</code> | a single data Extension |

<a name="DataExtension.document"></a>

### DataExtension.document(buObject, [metadata], [isDeploy]) ⇒ <code>Promise.&lt;void&gt;</code>
Parses metadata into a readable Markdown/HTML format then saves it

**Kind**: static method of [<code>DataExtension</code>](#DataExtension)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| buObject | <code>Util.BuObject</code> | properties for auth |
| [metadata] | [<code>DataExtensionMap</code>](#DataExtensionMap) | a list of dataExtension definitions |
| [isDeploy] | <code>boolean</code> | used to skip non-supported message during deploy |

<a name="DataExtension.deleteByKey"></a>

### DataExtension.deleteByKey(buObject, customerKey) ⇒ <code>Promise.&lt;void&gt;</code>
Delete a data extension from the specified business unit

**Kind**: static method of [<code>DataExtension</code>](#DataExtension)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| buObject | <code>Object</code> | references credentials |
| customerKey | <code>string</code> | Identifier of data extension |

<a name="DataExtension.retrieveForCache"></a>

### DataExtension.retrieveForCache(buObject) ⇒ <code>Promise</code>
Retrieves folder metadata into local filesystem. Also creates a uniquePath attribute for each folder.

**Kind**: static method of [<code>DataExtension</code>](#DataExtension)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| buObject | <code>Object</code> | properties for auth |

<a name="DataExtension.retrieveAsTemplate"></a>

### DataExtension.retrieveAsTemplate(templateDir, name, variables) ⇒ <code>Promise.&lt;{metadata:DataExtensionMap, type:string}&gt;</code>
Retrieves dataExtension metadata in template format.

**Kind**: static method of [<code>DataExtension</code>](#DataExtension)  
**Returns**: <code>Promise.&lt;{metadata:DataExtensionMap, type:string}&gt;</code> - Promise of items  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| name | <code>string</code> | name of the metadata item |
| variables | <code>Util.TemplateMap</code> | variables to be replaced in the metadata |

<a name="DataExtensionField"></a>

## DataExtensionField ⇐ [<code>MetadataType</code>](#MetadataType)
DataExtensionField MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [DataExtensionField](#DataExtensionField) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir, [additionalFields], buObject)](#DataExtensionField.retrieve) ⇒ <code>Promise.&lt;{metadata:DataExtensionFieldMap, type:string}&gt;</code>
    * [.retrieveForCache([options], [additionalFields])](#DataExtensionField.retrieveForCache) ⇒ <code>Promise.&lt;{metadata:DataExtensionFieldMap, type:string}&gt;</code>
    * [.convertToSortedArray(fieldsObj)](#DataExtensionField.convertToSortedArray) ⇒ <code>Array.&lt;DataExtensionFieldItem&gt;</code>
    * [.sortDeFields(a, b)](#DataExtensionField.sortDeFields) ⇒ <code>boolean</code>
    * [.postRetrieveTasks(metadata, forDataExtension)](#DataExtensionField.postRetrieveTasks) ⇒ <code>DataExtensionFieldItem</code>

<a name="DataExtensionField.retrieve"></a>

### DataExtensionField.retrieve(retrieveDir, [additionalFields], buObject) ⇒ <code>Promise.&lt;{metadata:DataExtensionFieldMap, type:string}&gt;</code>
Retrieves all records and saves it to disk

**Kind**: static method of [<code>DataExtensionField</code>](#DataExtensionField)  
**Returns**: <code>Promise.&lt;{metadata:DataExtensionFieldMap, type:string}&gt;</code> - Promise of items  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| [additionalFields] | <code>Array.&lt;string&gt;</code> | Returns specified fields even if their retrieve definition is not set to true |
| buObject | <code>Object</code> | properties for auth |

<a name="DataExtensionField.retrieveForCache"></a>

### DataExtensionField.retrieveForCache([options], [additionalFields]) ⇒ <code>Promise.&lt;{metadata:DataExtensionFieldMap, type:string}&gt;</code>
Retrieves all records for caching

**Kind**: static method of [<code>DataExtensionField</code>](#DataExtensionField)  
**Returns**: <code>Promise.&lt;{metadata:DataExtensionFieldMap, type:string}&gt;</code> - Promise of items  

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> | required for the specific request (filter for example) |
| [additionalFields] | <code>Array.&lt;string&gt;</code> | Returns specified fields even if their retrieve definition is not set to true |

<a name="DataExtensionField.convertToSortedArray"></a>

### DataExtensionField.convertToSortedArray(fieldsObj) ⇒ <code>Array.&lt;DataExtensionFieldItem&gt;</code>
helper for DataExtension.js that sorts the fields into an array

**Kind**: static method of [<code>DataExtensionField</code>](#DataExtensionField)  
**Returns**: <code>Array.&lt;DataExtensionFieldItem&gt;</code> - sorted array of field objects  

| Param | Type | Description |
| --- | --- | --- |
| fieldsObj | [<code>DataExtensionFieldMap</code>](#DataExtensionFieldMap) | customerKey-based list of fields for one dataExtension |

<a name="DataExtensionField.sortDeFields"></a>

### DataExtensionField.sortDeFields(a, b) ⇒ <code>boolean</code>
sorting method to ensure `Ordinal` is respected

**Kind**: static method of [<code>DataExtensionField</code>](#DataExtensionField)  
**Returns**: <code>boolean</code> - sorting based on Ordinal  

| Param | Type | Description |
| --- | --- | --- |
| a | <code>DataExtensionFieldItem</code> | - |
| b | <code>DataExtensionFieldItem</code> | - |

<a name="DataExtensionField.postRetrieveTasks"></a>

### DataExtensionField.postRetrieveTasks(metadata, forDataExtension) ⇒ <code>DataExtensionFieldItem</code>
manages post retrieve steps

**Kind**: static method of [<code>DataExtensionField</code>](#DataExtensionField)  
**Returns**: <code>DataExtensionFieldItem</code> - metadata  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>DataExtensionFieldItem</code> | a single item |
| forDataExtension | <code>boolean</code> | when used by DataExtension class we remove more fields |

<a name="DataExtensionTemplate"></a>

## DataExtensionTemplate ⇐ [<code>MetadataType</code>](#MetadataType)
DataExtensionTemplate MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  
<a name="DataExtensionTemplate.retrieve"></a>

### DataExtensionTemplate.retrieve(retrieveDir) ⇒ <code>Promise.&lt;Object&gt;</code>
Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata

**Kind**: static method of [<code>DataExtensionTemplate</code>](#DataExtensionTemplate)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Promise of metadata  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>String</code> | Directory where retrieved metadata directory will be saved |

<a name="DataExtract"></a>

## DataExtract ⇐ [<code>MetadataType</code>](#MetadataType)
DataExtract MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [DataExtract](#DataExtract) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir)](#DataExtract.retrieve) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [.retrieveForCache()](#DataExtract.retrieveForCache) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [.retrieveAsTemplate(templateDir, name, variables)](#DataExtract.retrieveAsTemplate) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [.postRetrieveTasks(fileTransfer)](#DataExtract.postRetrieveTasks) ⇒ <code>Array.&lt;Object&gt;</code>
    * [.create(dataExtract)](#DataExtract.create) ⇒ <code>Promise</code>
    * [.update(dataExtract)](#DataExtract.update) ⇒ <code>Promise</code>
    * [.preDeployTasks(metadata)](#DataExtract.preDeployTasks) ⇒ <code>Object</code>
    * [.parseMetadata(metadata)](#DataExtract.parseMetadata) ⇒ <code>Array</code>

<a name="DataExtract.retrieve"></a>

### DataExtract.retrieve(retrieveDir) ⇒ <code>Promise.&lt;Object&gt;</code>
Retrieves Metadata of Data Extract Activity.
Endpoint /automation/v1/dataextracts/ returns all Data Extracts

**Kind**: static method of [<code>DataExtract</code>](#DataExtract)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Promise of metadata  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>String</code> | Directory where retrieved metadata directory will be saved |

<a name="DataExtract.retrieveForCache"></a>

### DataExtract.retrieveForCache() ⇒ <code>Promise.&lt;Object&gt;</code>
Retrieves Metadata of  Data Extract Activity for caching

**Kind**: static method of [<code>DataExtract</code>](#DataExtract)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Promise of metadata  
<a name="DataExtract.retrieveAsTemplate"></a>

### DataExtract.retrieveAsTemplate(templateDir, name, variables) ⇒ <code>Promise.&lt;Object&gt;</code>
Retrieve a specific dataExtract Definition by Name

**Kind**: static method of [<code>DataExtract</code>](#DataExtract)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Promise of metadata  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>String</code> | Directory where retrieved metadata directory will be saved |
| name | <code>String</code> | name of the metadata file |
| variables | <code>Object</code> | variables to be replaced in the metadata |

<a name="DataExtract.postRetrieveTasks"></a>

### DataExtract.postRetrieveTasks(fileTransfer) ⇒ <code>Array.&lt;Object&gt;</code>
manages post retrieve steps

**Kind**: static method of [<code>DataExtract</code>](#DataExtract)  
**Returns**: <code>Array.&lt;Object&gt;</code> - metadata  

| Param | Type | Description |
| --- | --- | --- |
| fileTransfer | <code>Object</code> | a single fileTransfer |

<a name="DataExtract.create"></a>

### DataExtract.create(dataExtract) ⇒ <code>Promise</code>
Creates a single Data Extract

**Kind**: static method of [<code>DataExtract</code>](#DataExtract)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| dataExtract | <code>Object</code> | a single Data Extract |

<a name="DataExtract.update"></a>

### DataExtract.update(dataExtract) ⇒ <code>Promise</code>
Updates a single Data Extract

**Kind**: static method of [<code>DataExtract</code>](#DataExtract)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| dataExtract | <code>Object</code> | a single Data Extract |

<a name="DataExtract.preDeployTasks"></a>

### DataExtract.preDeployTasks(metadata) ⇒ <code>Object</code>
prepares a dataExtract for deployment

**Kind**: static method of [<code>DataExtract</code>](#DataExtract)  
**Returns**: <code>Object</code> - metadata object  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>Object</code> | a single dataExtract activity definition |

<a name="DataExtract.parseMetadata"></a>

### DataExtract.parseMetadata(metadata) ⇒ <code>Array</code>
parses retrieved Metadata before saving

**Kind**: static method of [<code>DataExtract</code>](#DataExtract)  
**Returns**: <code>Array</code> - Array with one metadata object and one sql string  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>Object</code> | a single dataExtract activity definition |

<a name="DataExtractType"></a>

## DataExtractType ⇐ [<code>MetadataType</code>](#MetadataType)
DataExtractType MetadataType
Only for Caching No retrieve/upsert is required
as this is a configuration in the EID

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [DataExtractType](#DataExtractType) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir)](#DataExtractType.retrieve) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [.retrieveForCache()](#DataExtractType.retrieveForCache) ⇒ <code>Promise.&lt;Object&gt;</code>

<a name="DataExtractType.retrieve"></a>

### DataExtractType.retrieve(retrieveDir) ⇒ <code>Promise.&lt;Object&gt;</code>
Retrieves Metadata of  Data Extract Type.

**Kind**: static method of [<code>DataExtractType</code>](#DataExtractType)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Promise of metadata  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>String</code> | Directory where retrieved metadata directory will be saved |

<a name="DataExtractType.retrieveForCache"></a>

### DataExtractType.retrieveForCache() ⇒ <code>Promise.&lt;Object&gt;</code>
Retrieves Metadata of  Data Extract Type for caching.

**Kind**: static method of [<code>DataExtractType</code>](#DataExtractType)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Promise of metadata  
<a name="Discovery"></a>

## Discovery ⇐ [<code>MetadataType</code>](#MetadataType)
ImportFile MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  
<a name="Discovery.retrieve"></a>

### Discovery.retrieve(retrieveDir, [_], buObject) ⇒ <code>Promise</code>
Retrieves API endpoint
documentation: https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-apis.meta/mc-apis/routes.htm

**Kind**: static method of [<code>Discovery</code>](#Discovery)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>String</code> | Directory where retrieved metadata directory will be saved |
| [_] | <code>Array.&lt;String&gt;</code> | not used |
| buObject | <code>Object</code> | properties for auth |

<a name="Email"></a>

## Email ⇐ [<code>MetadataType</code>](#MetadataType)
Email MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [Email](#Email) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir)](#Email.retrieve) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [.postRetrieveTasks(metadata)](#Email.postRetrieveTasks) ⇒ <code>Array.&lt;Object&gt;</code>
    * [.parseMetadata(metadata)](#Email.parseMetadata) ⇒ <code>Array</code>

<a name="Email.retrieve"></a>

### Email.retrieve(retrieveDir) ⇒ <code>Promise.&lt;Object&gt;</code>
Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata

**Kind**: static method of [<code>Email</code>](#Email)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Promise of metadata  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>String</code> | Directory where retrieved metadata directory will be saved |

<a name="Email.postRetrieveTasks"></a>

### Email.postRetrieveTasks(metadata) ⇒ <code>Array.&lt;Object&gt;</code>
manages post retrieve steps

**Kind**: static method of [<code>Email</code>](#Email)  
**Returns**: <code>Array.&lt;Object&gt;</code> - Array with one metadata object and one query string  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>Object</code> | a single query |

<a name="Email.parseMetadata"></a>

### Email.parseMetadata(metadata) ⇒ <code>Array</code>
parses retrieved Metadata before saving

**Kind**: static method of [<code>Email</code>](#Email)  
**Returns**: <code>Array</code> - Array with one metadata object and one sql string  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>Object</code> | a single query activity definition |

<a name="EmailSendDefinition"></a>

## EmailSendDefinition ⇐ [<code>MetadataType</code>](#MetadataType)
MessageSendActivity MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [EmailSendDefinition](#EmailSendDefinition) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir, _, buObject)](#EmailSendDefinition.retrieve) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [.update(metadataItem)](#EmailSendDefinition.update) ⇒ <code>Promise</code>
    * [.create(metadataItem)](#EmailSendDefinition.create) ⇒ <code>Promise</code>
    * [.preDeployTasks(metadata)](#EmailSendDefinition.preDeployTasks) ⇒ <code>Promise</code>
    * [.postRetrieveTasks(metadata)](#EmailSendDefinition.postRetrieveTasks) ⇒ <code>Array.&lt;Object&gt;</code>
    * [.parseMetadata(metadata)](#EmailSendDefinition.parseMetadata) ⇒ <code>Array</code>

<a name="EmailSendDefinition.retrieve"></a>

### EmailSendDefinition.retrieve(retrieveDir, _, buObject) ⇒ <code>Promise.&lt;Object&gt;</code>
Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata

**Kind**: static method of [<code>EmailSendDefinition</code>](#EmailSendDefinition)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Promise of metadata  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>String</code> | Directory where retrieved metadata directory will be saved |
| _ | <code>void</code> | - |
| buObject | <code>Object</code> | properties for auth |

<a name="EmailSendDefinition.update"></a>

### EmailSendDefinition.update(metadataItem) ⇒ <code>Promise</code>
Updates a single item

**Kind**: static method of [<code>EmailSendDefinition</code>](#EmailSendDefinition)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadataItem | <code>Object</code> | a single item |

<a name="EmailSendDefinition.create"></a>

### EmailSendDefinition.create(metadataItem) ⇒ <code>Promise</code>
Creates a single item

**Kind**: static method of [<code>EmailSendDefinition</code>](#EmailSendDefinition)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadataItem | <code>Object</code> | a single item |

<a name="EmailSendDefinition.preDeployTasks"></a>

### EmailSendDefinition.preDeployTasks(metadata) ⇒ <code>Promise</code>
prepares a single item for deployment

**Kind**: static method of [<code>EmailSendDefinition</code>](#EmailSendDefinition)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>Object</code> | a single script activity definition |

<a name="EmailSendDefinition.postRetrieveTasks"></a>

### EmailSendDefinition.postRetrieveTasks(metadata) ⇒ <code>Array.&lt;Object&gt;</code>
manages post retrieve steps

**Kind**: static method of [<code>EmailSendDefinition</code>](#EmailSendDefinition)  
**Returns**: <code>Array.&lt;Object&gt;</code> - Array with one metadata object and one query string  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>Object</code> | a single query |

<a name="EmailSendDefinition.parseMetadata"></a>

### EmailSendDefinition.parseMetadata(metadata) ⇒ <code>Array</code>
parses retrieved Metadata before saving

**Kind**: static method of [<code>EmailSendDefinition</code>](#EmailSendDefinition)  
**Returns**: <code>Array</code> - Array with one metadata object and one sql string  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>Object</code> | a single query activity definition |

<a name="EventDefinition"></a>

## EventDefinition ⇐ [<code>MetadataType</code>](#MetadataType)
EventDefinition MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [EventDefinition](#EventDefinition) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir)](#EventDefinition.retrieve) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [.retrieveForCache()](#EventDefinition.retrieveForCache) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [.retrieveAsTemplate(templateDir, name, variables)](#EventDefinition.retrieveAsTemplate) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [.postRetrieveTasks(eventDef)](#EventDefinition.postRetrieveTasks) ⇒ <code>Array.&lt;Object&gt;</code>
    * [.create(EventDefinition)](#EventDefinition.create) ⇒ <code>Promise</code>
    * [.update(EventDefinition)](#EventDefinition.update) ⇒ <code>Promise</code>
    * [.preDeployTasks(metadata)](#EventDefinition.preDeployTasks) ⇒ <code>Promise</code>
    * [.parseMetadata(metadata)](#EventDefinition.parseMetadata) ⇒ <code>Array</code>

<a name="EventDefinition.retrieve"></a>

### EventDefinition.retrieve(retrieveDir) ⇒ <code>Promise.&lt;Object&gt;</code>
Retrieves Metadata of Event Definition.
Endpoint /interaction/v1/EventDefinitions return all Event Definitions with all details.
Currently it is not needed to loop over Imports with endpoint /interaction/v1/EventDefinitions/{id}

**Kind**: static method of [<code>EventDefinition</code>](#EventDefinition)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Promise of metadata  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>String</code> | Directory where retrieved metadata directory will be saved |

<a name="EventDefinition.retrieveForCache"></a>

### EventDefinition.retrieveForCache() ⇒ <code>Promise.&lt;Object&gt;</code>
Retrieves event definition metadata for caching

**Kind**: static method of [<code>EventDefinition</code>](#EventDefinition)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Promise of metadata  
<a name="EventDefinition.retrieveAsTemplate"></a>

### EventDefinition.retrieveAsTemplate(templateDir, name, variables) ⇒ <code>Promise.&lt;Object&gt;</code>
Retrieve a specific Event Definition by Name

**Kind**: static method of [<code>EventDefinition</code>](#EventDefinition)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Promise of metadata  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>String</code> | Directory where retrieved metadata directory will be saved |
| name | <code>String</code> | name of the metadata file |
| variables | <code>Object</code> | variables to be replaced in the metadata |

<a name="EventDefinition.postRetrieveTasks"></a>

### EventDefinition.postRetrieveTasks(eventDef) ⇒ <code>Array.&lt;Object&gt;</code>
manages post retrieve steps

**Kind**: static method of [<code>EventDefinition</code>](#EventDefinition)  
**Returns**: <code>Array.&lt;Object&gt;</code> - metadata  

| Param | Type | Description |
| --- | --- | --- |
| eventDef | <code>Object</code> | a single importDef |

<a name="EventDefinition.create"></a>

### EventDefinition.create(EventDefinition) ⇒ <code>Promise</code>
Creates a single Event Definition

**Kind**: static method of [<code>EventDefinition</code>](#EventDefinition)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| EventDefinition | <code>Object</code> | a single Event Definition |

<a name="EventDefinition.update"></a>

### EventDefinition.update(EventDefinition) ⇒ <code>Promise</code>
Updates a single Event Definition (using PUT method since PATCH isn't supported)

**Kind**: static method of [<code>EventDefinition</code>](#EventDefinition)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| EventDefinition | <code>Object</code> | a single Event Definition |

<a name="EventDefinition.preDeployTasks"></a>

### EventDefinition.preDeployTasks(metadata) ⇒ <code>Promise</code>
prepares an event definition for deployment

**Kind**: static method of [<code>EventDefinition</code>](#EventDefinition)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>Object</code> | a single eventDefinition |

<a name="EventDefinition.parseMetadata"></a>

### EventDefinition.parseMetadata(metadata) ⇒ <code>Array</code>
parses retrieved Metadata before saving

**Kind**: static method of [<code>EventDefinition</code>](#EventDefinition)  
**Returns**: <code>Array</code> - Array with one metadata object and one sql string  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>Object</code> | a single event definition |

<a name="FileTransfer"></a>

## FileTransfer ⇐ [<code>MetadataType</code>](#MetadataType)
FileTransfer MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [FileTransfer](#FileTransfer) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir)](#FileTransfer.retrieve) ⇒ <code>Promise</code>
    * [.retrieveForCache()](#FileTransfer.retrieveForCache) ⇒ <code>Promise</code>
    * [.retrieveAsTemplate(templateDir, name, variables)](#FileTransfer.retrieveAsTemplate) ⇒ <code>Promise</code>
    * [.postRetrieveTasks(metadata)](#FileTransfer.postRetrieveTasks) ⇒ <code>Array.&lt;Object&gt;</code>
    * [.create(fileTransfer)](#FileTransfer.create) ⇒ <code>Promise</code>
    * [.update(fileTransfer)](#FileTransfer.update) ⇒ <code>Promise</code>
    * [.preDeployTasks(metadata)](#FileTransfer.preDeployTasks) ⇒ <code>Promise</code>
    * [.parseMetadata(metadata)](#FileTransfer.parseMetadata) ⇒ <code>Array</code>

<a name="FileTransfer.retrieve"></a>

### FileTransfer.retrieve(retrieveDir) ⇒ <code>Promise</code>
Retrieves Metadata of FileTransfer Activity.
Endpoint /automation/v1/filetransfers/ returns all File Transfers

**Kind**: static method of [<code>FileTransfer</code>](#FileTransfer)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>String</code> | Directory where retrieved metadata directory will be saved |

<a name="FileTransfer.retrieveForCache"></a>

### FileTransfer.retrieveForCache() ⇒ <code>Promise</code>
Retrieves Metadata of  FileTransfer Activity for caching

**Kind**: static method of [<code>FileTransfer</code>](#FileTransfer)  
**Returns**: <code>Promise</code> - Promise  
<a name="FileTransfer.retrieveAsTemplate"></a>

### FileTransfer.retrieveAsTemplate(templateDir, name, variables) ⇒ <code>Promise</code>
Retrieve a specific File Transfer Definition by Name

**Kind**: static method of [<code>FileTransfer</code>](#FileTransfer)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>String</code> | Directory where retrieved metadata directory will be saved |
| name | <code>String</code> | name of the metadata file |
| variables | <code>Object</code> | variables to be replaced in the metadata |

<a name="FileTransfer.postRetrieveTasks"></a>

### FileTransfer.postRetrieveTasks(metadata) ⇒ <code>Array.&lt;Object&gt;</code>
manages post retrieve steps

**Kind**: static method of [<code>FileTransfer</code>](#FileTransfer)  
**Returns**: <code>Array.&lt;Object&gt;</code> - metadata  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>Object</code> | a single fileTransfer activity definition |

<a name="FileTransfer.create"></a>

### FileTransfer.create(fileTransfer) ⇒ <code>Promise</code>
Creates a single File Transfer

**Kind**: static method of [<code>FileTransfer</code>](#FileTransfer)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| fileTransfer | <code>Object</code> | a single File Transfer |

<a name="FileTransfer.update"></a>

### FileTransfer.update(fileTransfer) ⇒ <code>Promise</code>
Updates a single File Transfer

**Kind**: static method of [<code>FileTransfer</code>](#FileTransfer)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| fileTransfer | <code>Object</code> | a single File Transfer |

<a name="FileTransfer.preDeployTasks"></a>

### FileTransfer.preDeployTasks(metadata) ⇒ <code>Promise</code>
prepares a fileTransfer for deployment

**Kind**: static method of [<code>FileTransfer</code>](#FileTransfer)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>Object</code> | a single fileTransfer activity definition |

<a name="FileTransfer.parseMetadata"></a>

### FileTransfer.parseMetadata(metadata) ⇒ <code>Array</code>
parses retrieved Metadata before saving

**Kind**: static method of [<code>FileTransfer</code>](#FileTransfer)  
**Returns**: <code>Array</code> - Array with one metadata object and one sql string  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>Object</code> | a single fileTransfer activity definition |

<a name="Filter"></a>

## Filter ⇐ [<code>MetadataType</code>](#MetadataType)
Filter MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  
<a name="Filter.retrieve"></a>

### Filter.retrieve(retrieveDir) ⇒ <code>Promise</code>
Retrieves Metadata of Filter.
Endpoint /automation/v1/filters/ returns all Filters,
but only with some of the fields. So it is needed to loop over
Filters with the endpoint /automation/v1/filters/{id}

**Kind**: static method of [<code>Filter</code>](#Filter)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>String</code> | Directory where retrieved metadata directory will be saved |

<a name="Folder"></a>

## Folder ⇐ [<code>MetadataType</code>](#MetadataType)
Folder MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [Folder](#Folder) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir, [additionalFields], buObject)](#Folder.retrieve) ⇒ <code>Promise</code>
    * [.retrieveForCache(buObject)](#Folder.retrieveForCache) ⇒ <code>Promise</code>
    * [.upsert(metadata)](#Folder.upsert) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [.create(metadata)](#Folder.create) ⇒ <code>Promise</code>
    * [.update(metadata)](#Folder.update) ⇒ <code>Promise</code>
    * [.preDeployTasks(metadata)](#Folder.preDeployTasks) ⇒ <code>Promise</code>
    * [.getJsonFromFS(dir, [listBadKeys])](#Folder.getJsonFromFS) ⇒ <code>Object</code>
    * [.retrieveHelper([additionalFields], [queryAllAccounts])](#Folder.retrieveHelper) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [.postRetrieveTasks(metadata)](#Folder.postRetrieveTasks) ⇒ <code>Array.&lt;Object&gt;</code>
    * [.saveResults(results, retrieveDir, mid)](#Folder.saveResults) ⇒ <code>Promise.&lt;Object&gt;</code>

<a name="Folder.retrieve"></a>

### Folder.retrieve(retrieveDir, [additionalFields], buObject) ⇒ <code>Promise</code>
Retrieves metadata of metadata type into local filesystem. executes callback with retrieved metadata

**Kind**: static method of [<code>Folder</code>](#Folder)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>String</code> | Directory where retrieved metadata directory will be saved |
| [additionalFields] | <code>Array.&lt;String&gt;</code> | Returns specified fields even if their retrieve definition is not set to true |
| buObject | <code>Object</code> | properties for auth |

<a name="Folder.retrieveForCache"></a>

### Folder.retrieveForCache(buObject) ⇒ <code>Promise</code>
Retrieves folder metadata for caching

**Kind**: static method of [<code>Folder</code>](#Folder)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| buObject | <code>Object</code> | properties for auth |

<a name="Folder.upsert"></a>

### Folder.upsert(metadata) ⇒ <code>Promise.&lt;Object&gt;</code>
Folder upsert (copied from Metadata Upsert), after retrieving from target
and comparing to check if create or update operation is needed.
Copied due to having a dependency on itself, meaning the created need to be serial

**Kind**: static method of [<code>Folder</code>](#Folder)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Promise of saved metadata  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>Object</code> | metadata mapped by their keyField |

<a name="Folder.create"></a>

### Folder.create(metadata) ⇒ <code>Promise</code>
creates a folder based on metatadata

**Kind**: static method of [<code>Folder</code>](#Folder)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>Object</code> | metadata of the folder |

<a name="Folder.update"></a>

### Folder.update(metadata) ⇒ <code>Promise</code>
Updates a single Folder.

**Kind**: static method of [<code>Folder</code>](#Folder)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>Object</code> | single metadata entry |

<a name="Folder.preDeployTasks"></a>

### Folder.preDeployTasks(metadata) ⇒ <code>Promise</code>
prepares a folder for deployment

**Kind**: static method of [<code>Folder</code>](#Folder)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>Object</code> | a single folder definition |

<a name="Folder.getJsonFromFS"></a>

### Folder.getJsonFromFS(dir, [listBadKeys]) ⇒ <code>Object</code>
Returns file contents mapped to their filename without '.json' ending

**Kind**: static method of [<code>Folder</code>](#Folder)  
**Returns**: <code>Object</code> - fileName => fileContent map  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| dir | <code>String</code> |  | directory that contains '.json' files to be read |
| [listBadKeys] | <code>boolean</code> | <code>false</code> | do not print errors, used for badKeys() |

<a name="Folder.retrieveHelper"></a>

### Folder.retrieveHelper([additionalFields], [queryAllAccounts]) ⇒ <code>Promise.&lt;Object&gt;</code>
Helper to retrieve the folders as promise

**Kind**: static method of [<code>Folder</code>](#Folder)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - soap object  

| Param | Type | Description |
| --- | --- | --- |
| [additionalFields] | <code>Array.&lt;String&gt;</code> | Returns specified fields even if their retrieve definition is not set to true |
| [queryAllAccounts] | <code>Boolean</code> | which queryAllAccounts setting to use |

<a name="Folder.postRetrieveTasks"></a>

### Folder.postRetrieveTasks(metadata) ⇒ <code>Array.&lt;Object&gt;</code>
Gets executed after retreive of metadata type

**Kind**: static method of [<code>Folder</code>](#Folder)  
**Returns**: <code>Array.&lt;Object&gt;</code> - cloned metadata  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>Object</code> | metadata mapped by their keyField |

<a name="Folder.saveResults"></a>

### Folder.saveResults(results, retrieveDir, mid) ⇒ <code>Promise.&lt;Object&gt;</code>
Helper for writing Metadata to disk, used for Retrieve and deploy

**Kind**: static method of [<code>Folder</code>](#Folder)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Promise of saved metadata  

| Param | Type | Description |
| --- | --- | --- |
| results | <code>Object</code> | metadata results from deploy |
| retrieveDir | <code>String</code> | directory where metadata should be stored after deploy/retrieve |
| mid | <code>Number</code> | current mid for this credential / business unit |

<a name="FtpLocation"></a>

## FtpLocation ⇐ [<code>MetadataType</code>](#MetadataType)
ImportFile MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [FtpLocation](#FtpLocation) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir)](#FtpLocation.retrieve) ⇒ <code>Promise</code>
    * [.retrieveForCache()](#FtpLocation.retrieveForCache) ⇒ <code>Promise</code>

<a name="FtpLocation.retrieve"></a>

### FtpLocation.retrieve(retrieveDir) ⇒ <code>Promise</code>
Retrieves Metadata of FtpLocation
Endpoint /automation/v1/ftplocations/ return all FtpLocations

**Kind**: static method of [<code>FtpLocation</code>](#FtpLocation)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>String</code> | Directory where retrieved metadata directory will be saved |

<a name="FtpLocation.retrieveForCache"></a>

### FtpLocation.retrieveForCache() ⇒ <code>Promise</code>
Retrieves folder metadata into local filesystem. Also creates a uniquePath attribute for each folder.

**Kind**: static method of [<code>FtpLocation</code>](#FtpLocation)  
**Returns**: <code>Promise</code> - Promise  
<a name="ImportFile"></a>

## ImportFile ⇐ [<code>MetadataType</code>](#MetadataType)
ImportFile MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [ImportFile](#ImportFile) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir)](#ImportFile.retrieve) ⇒ <code>Promise</code>
    * [.retrieveForCache()](#ImportFile.retrieveForCache) ⇒ <code>Promise</code>
    * [.retrieveAsTemplate(templateDir, name, variables)](#ImportFile.retrieveAsTemplate) ⇒ <code>Promise</code>
    * [.postRetrieveTasks(importDef)](#ImportFile.postRetrieveTasks) ⇒ <code>Array.&lt;Object&gt;</code>
    * [.create(importFile)](#ImportFile.create) ⇒ <code>Promise</code>
    * [.update(importFile)](#ImportFile.update) ⇒ <code>Promise</code>
    * [.preDeployTasks(metadata)](#ImportFile.preDeployTasks) ⇒ <code>Promise</code>
    * [.parseMetadata(metadata)](#ImportFile.parseMetadata) ⇒ <code>Object</code>

<a name="ImportFile.retrieve"></a>

### ImportFile.retrieve(retrieveDir) ⇒ <code>Promise</code>
Retrieves Metadata of Import File.
Endpoint /automation/v1/imports/ return all Import Files with all details.
Currently it is not needed to loop over Imports with endpoint /automation/v1/imports/{id}

**Kind**: static method of [<code>ImportFile</code>](#ImportFile)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>String</code> | Directory where retrieved metadata directory will be saved |

<a name="ImportFile.retrieveForCache"></a>

### ImportFile.retrieveForCache() ⇒ <code>Promise</code>
Retrieves import definition metadata for caching

**Kind**: static method of [<code>ImportFile</code>](#ImportFile)  
**Returns**: <code>Promise</code> - Promise  
<a name="ImportFile.retrieveAsTemplate"></a>

### ImportFile.retrieveAsTemplate(templateDir, name, variables) ⇒ <code>Promise</code>
Retrieve a specific Import Definition by Name

**Kind**: static method of [<code>ImportFile</code>](#ImportFile)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>String</code> | Directory where retrieved metadata directory will be saved |
| name | <code>String</code> | name of the metadata file |
| variables | <code>Object</code> | variables to be replaced in the metadata |

<a name="ImportFile.postRetrieveTasks"></a>

### ImportFile.postRetrieveTasks(importDef) ⇒ <code>Array.&lt;Object&gt;</code>
manages post retrieve steps

**Kind**: static method of [<code>ImportFile</code>](#ImportFile)  
**Returns**: <code>Array.&lt;Object&gt;</code> - metadata  

| Param | Type | Description |
| --- | --- | --- |
| importDef | <code>Object</code> | a single importDef |

<a name="ImportFile.create"></a>

### ImportFile.create(importFile) ⇒ <code>Promise</code>
Creates a single Import File

**Kind**: static method of [<code>ImportFile</code>](#ImportFile)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| importFile | <code>Object</code> | a single Import File |

<a name="ImportFile.update"></a>

### ImportFile.update(importFile) ⇒ <code>Promise</code>
Updates a single Import File

**Kind**: static method of [<code>ImportFile</code>](#ImportFile)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| importFile | <code>Object</code> | a single Import File |

<a name="ImportFile.preDeployTasks"></a>

### ImportFile.preDeployTasks(metadata) ⇒ <code>Promise</code>
prepares a import definition for deployment

**Kind**: static method of [<code>ImportFile</code>](#ImportFile)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>Object</code> | a single importDef |

<a name="ImportFile.parseMetadata"></a>

### ImportFile.parseMetadata(metadata) ⇒ <code>Object</code>
parses retrieved Metadata before saving

**Kind**: static method of [<code>ImportFile</code>](#ImportFile)  
**Returns**: <code>Object</code> - parsed metadata definition  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>Object</code> | a single import definition |

<a name="Interaction"></a>

## Interaction ⇐ [<code>MetadataType</code>](#MetadataType)
Script MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  
<a name="Interaction.retrieve"></a>

### Interaction.retrieve(retrieveDir) ⇒ <code>Promise</code>
Retrieves Metadata of Interaction
Endpoint /interaction/v1/interactions?extras=all&pageSize=50000 return 50000 Scripts with all details.

**Kind**: static method of [<code>Interaction</code>](#Interaction)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>String</code> | Directory where retrieved metadata directory will be saved |

<a name="List"></a>

## List ⇐ [<code>MetadataType</code>](#MetadataType)
List MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [List](#List) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir)](#List.retrieve) ⇒ <code>Promise</code>
    * [.retrieveForCache()](#List.retrieveForCache) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [.postRetrieveTasks(list)](#List.postRetrieveTasks) ⇒ <code>Array.&lt;Object&gt;</code>
    * [.parseMetadata(metadata, [parseForCache])](#List.parseMetadata) ⇒ <code>Array</code>

<a name="List.retrieve"></a>

### List.retrieve(retrieveDir) ⇒ <code>Promise</code>
Retrieves Metadata of Lists

**Kind**: static method of [<code>List</code>](#List)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>String</code> | Directory where retrieved metadata directory will be saved |

<a name="List.retrieveForCache"></a>

### List.retrieveForCache() ⇒ <code>Promise.&lt;Object&gt;</code>
Gets metadata cache with limited fields and does not store value to disk

**Kind**: static method of [<code>List</code>](#List)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Promise of metadata  
<a name="List.postRetrieveTasks"></a>

### List.postRetrieveTasks(list) ⇒ <code>Array.&lt;Object&gt;</code>
manages post retrieve steps

**Kind**: static method of [<code>List</code>](#List)  
**Returns**: <code>Array.&lt;Object&gt;</code> - metadata  

| Param | Type | Description |
| --- | --- | --- |
| list | <code>Object</code> | a single list |

<a name="List.parseMetadata"></a>

### List.parseMetadata(metadata, [parseForCache]) ⇒ <code>Array</code>
parses retrieved Metadata before saving

**Kind**: static method of [<code>List</code>](#List)  
**Returns**: <code>Array</code> - Array with one metadata object and one sql string  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>Object</code> | a single list definition |
| [parseForCache] | <code>Boolean</code> | if set to true, the Category ID is kept |

<a name="MetadataType"></a>

## MetadataType
MetadataType class that gets extended by their specific metadata type class.
Provides default functionality that can be overwritten by child metadata type classes

**Kind**: global class  

* [MetadataType](#MetadataType)
    * [new MetadataType(client, businessUnit, cache, properties, [subType])](#new_MetadataType_new)
    * [.client](#MetadataType.client) : <code>Util.ET\_Client</code>
    * [.cache](#MetadataType.cache) : [<code>MultiMetadataTypeMap</code>](#MultiMetadataTypeMap)
    * [.getJsonFromFS(dir, [listBadKeys])](#MetadataType.getJsonFromFS) ⇒ <code>Object</code>
    * [.getFieldNamesToRetrieve([additionalFields])](#MetadataType.getFieldNamesToRetrieve) ⇒ <code>Array.&lt;string&gt;</code>
    * [.deploy(metadata, deployDir, retrieveDir, buObject)](#MetadataType.deploy) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [.postDeployTasks(metadata, originalMetadata)](#MetadataType.postDeployTasks) ⇒ <code>void</code>
    * [.postRetrieveTasks(metadata, targetDir, [isTemplating])](#MetadataType.postRetrieveTasks) ⇒ <code>MetadataTypeItem</code>
    * [.overrideKeyWithName(metadata, [warningMsg])](#MetadataType.overrideKeyWithName) ⇒ <code>void</code>
    * [.retrieve(retrieveDir, [additionalFields], buObject, [subType])](#MetadataType.retrieve) ⇒ <code>Promise.&lt;{metadata:MetadataTypeMap, type:string}&gt;</code>
    * [.retrieveForCache(buObject, [subType])](#MetadataType.retrieveForCache) ⇒ <code>Promise.&lt;{metadata:MetadataTypeMap, type:string}&gt;</code>
    * [.retrieveAsTemplate(templateDir, name, templateVariables, [subType])](#MetadataType.retrieveAsTemplate) ⇒ <code>Promise.&lt;{metadata:MetadataTypeMap, type:string}&gt;</code>
    * [.preDeployTasks(metadata, deployDir)](#MetadataType.preDeployTasks) ⇒ <code>Promise.&lt;MetadataTypeItem&gt;</code>
    * [.create(metadata, deployDir)](#MetadataType.create) ⇒ <code>void</code>
    * [.update(metadata, [metadataBefore])](#MetadataType.update) ⇒ <code>void</code>
    * [.upsert(metadata, deployDir, [buObject])](#MetadataType.upsert) ⇒ <code>Promise.&lt;MetadataTypeMap&gt;</code>
    * [.createREST(metadataEntry, uri)](#MetadataType.createREST) ⇒ <code>Promise</code>
    * [.createSOAP(metadataEntry, [overrideType], [handleOutside])](#MetadataType.createSOAP) ⇒ <code>Promise</code>
    * [.updateREST(metadataEntry, uri)](#MetadataType.updateREST) ⇒ <code>Promise</code>
    * [.updateSOAP(metadataEntry, [overrideType], [handleOutside])](#MetadataType.updateSOAP) ⇒ <code>Promise</code>
    * [.retrieveSOAPgeneric(retrieveDir, buObject, [options], [additionalFields], [overrideType])](#MetadataType.retrieveSOAPgeneric) ⇒ <code>Promise.&lt;{metadata:MetadataTypeMap, type:string}&gt;</code>
    * [.retrieveSOAPBody(fields, [options], [type])](#MetadataType.retrieveSOAPBody) ⇒ <code>Promise.&lt;MetadataTypeMap&gt;</code>
    * [.retrieveREST(retrieveDir, uri, [overrideType], [templateVariables])](#MetadataType.retrieveREST) ⇒ <code>Promise.&lt;{metadata:MetadataTypeMap, type:string}&gt;</code>
    * [.parseResponseBody(body)](#MetadataType.parseResponseBody) ⇒ <code>Promise.&lt;MetadataTypeMap&gt;</code>
    * [.deleteFieldByDefinition(metadataEntry, fieldPath, definitionProperty, origin)](#MetadataType.deleteFieldByDefinition) ⇒ <code>void</code>
    * [.removeNotCreateableFields(metadataEntry)](#MetadataType.removeNotCreateableFields) ⇒ <code>void</code>
    * [.removeNotUpdateableFields(metadataEntry)](#MetadataType.removeNotUpdateableFields) ⇒ <code>void</code>
    * [.keepTemplateFields(metadataEntry)](#MetadataType.keepTemplateFields) ⇒ <code>void</code>
    * [.keepRetrieveFields(metadataEntry)](#MetadataType.keepRetrieveFields) ⇒ <code>void</code>
    * [.isFiltered(metadataEntry, [include])](#MetadataType.isFiltered) ⇒ <code>boolean</code>
    * [.isFilteredFolder(metadataEntry, [include])](#MetadataType.isFilteredFolder) ⇒ <code>boolean</code>
    * [.paginate(url, last)](#MetadataType.paginate) ⇒ <code>string</code>
    * [.saveResults(results, retrieveDir, [overrideType], [templateVariables])](#MetadataType.saveResults) ⇒ <code>Promise.&lt;MetadataTypeMap&gt;</code>
    * [.buildDefinitionForExtracts(templateDir, targetDir, metadata, variables, templateName)](#MetadataType.buildDefinitionForExtracts) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.findSubType(templateDir, templateName)](#MetadataType.findSubType) ⇒ <code>string</code>
    * [.readSecondaryFolder(templateDir, typeDirArr, templateName, fileName, ex)](#MetadataType.readSecondaryFolder) ⇒ <code>Object</code>
    * [.buildDefinition(templateDir, targetDir, templateName, variables)](#MetadataType.buildDefinition) ⇒ <code>Promise.&lt;{metadata:MetadataTypeMap, type:string}&gt;</code>
    * [.checkForErrors(response)](#MetadataType.checkForErrors) ⇒ <code>void</code>
    * [.document([buObject], [metadata], [isDeploy])](#MetadataType.document) ⇒ <code>void</code>
    * [.deleteByKey(buObject, customerKey)](#MetadataType.deleteByKey) ⇒ <code>void</code>
    * [.readBUMetadataForType(readDir, [listBadKeys], [buMetadata])](#MetadataType.readBUMetadataForType) ⇒ <code>Object</code>

<a name="new_MetadataType_new"></a>

### new MetadataType(client, businessUnit, cache, properties, [subType])
Instantiates a metadata constructor to avoid passing variables.


| Param | Type | Description |
| --- | --- | --- |
| client | <code>Util.ET\_Client</code> | client for sfmc fuelsdk |
| businessUnit | <code>string</code> | Name of business unit (corresponding to their keys in 'properties.json' file). Used to access correct directories |
| cache | <code>Object</code> | metadata cache |
| properties | <code>Object</code> | mcdev config |
| [subType] | <code>string</code> | limit retrieve to specific subType |

<a name="MetadataType.client"></a>

### MetadataType.client : <code>Util.ET\_Client</code>
**Kind**: static property of [<code>MetadataType</code>](#MetadataType)  
<a name="MetadataType.cache"></a>

### MetadataType.cache : [<code>MultiMetadataTypeMap</code>](#MultiMetadataTypeMap)
**Kind**: static property of [<code>MetadataType</code>](#MetadataType)  
<a name="MetadataType.getJsonFromFS"></a>

### MetadataType.getJsonFromFS(dir, [listBadKeys]) ⇒ <code>Object</code>
Returns file contents mapped to their filename without '.json' ending

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Object</code> - fileName => fileContent map  

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

### MetadataType.deploy(metadata, deployDir, retrieveDir, buObject) ⇒ <code>Promise.&lt;Object&gt;</code>
Deploys metadata

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Promise of keyField => metadata map  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>MetadataTypeMap</code> | metadata mapped by their keyField |
| deployDir | <code>string</code> | directory where deploy metadata are saved |
| retrieveDir | <code>string</code> | directory where metadata after deploy should be saved |
| buObject | <code>Util.BuObject</code> | properties for auth |

<a name="MetadataType.postDeployTasks"></a>

### MetadataType.postDeployTasks(metadata, originalMetadata) ⇒ <code>void</code>
Gets executed after deployment of metadata type

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>MetadataTypeMap</code> | metadata mapped by their keyField |
| originalMetadata | <code>MetadataTypeMap</code> | metadata to be updated (contains additioanl fields) |

<a name="MetadataType.postRetrieveTasks"></a>

### MetadataType.postRetrieveTasks(metadata, targetDir, [isTemplating]) ⇒ <code>MetadataTypeItem</code>
Gets executed after retreive of metadata type

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>MetadataTypeItem</code> - cloned metadata  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>MetadataTypeItem</code> | a single item |
| targetDir | <code>string</code> | folder where retrieves should be saved |
| [isTemplating] | <code>boolean</code> | signals that we are retrieving templates |

<a name="MetadataType.overrideKeyWithName"></a>

### MetadataType.overrideKeyWithName(metadata, [warningMsg]) ⇒ <code>void</code>
used to synchronize name and external key during retrieveAsTemplate

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>MetadataTypeItem</code> | a single item |
| [warningMsg] | <code>string</code> | optional msg to show the user |

<a name="MetadataType.retrieve"></a>

### MetadataType.retrieve(retrieveDir, [additionalFields], buObject, [subType]) ⇒ <code>Promise.&lt;{metadata:MetadataTypeMap, type:string}&gt;</code>
Gets metadata from Marketing Cloud

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise.&lt;{metadata:MetadataTypeMap, type:string}&gt;</code> - metadata  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| [additionalFields] | <code>Array.&lt;string&gt;</code> | Returns specified fields even if their retrieve definition is not set to true |
| buObject | <code>Util.BuObject</code> | properties for auth |
| [subType] | <code>string</code> | optionally limit to a single subtype |

<a name="MetadataType.retrieveForCache"></a>

### MetadataType.retrieveForCache(buObject, [subType]) ⇒ <code>Promise.&lt;{metadata:MetadataTypeMap, type:string}&gt;</code>
Gets metadata cache with limited fields and does not store value to disk

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise.&lt;{metadata:MetadataTypeMap, type:string}&gt;</code> - metadata  

| Param | Type | Description |
| --- | --- | --- |
| buObject | <code>Util.BuObject</code> | properties for auth |
| [subType] | <code>string</code> | optionally limit to a single subtype |

<a name="MetadataType.retrieveAsTemplate"></a>

### MetadataType.retrieveAsTemplate(templateDir, name, templateVariables, [subType]) ⇒ <code>Promise.&lt;{metadata:MetadataTypeMap, type:string}&gt;</code>
Gets metadata cache with limited fields and does not store value to disk

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise.&lt;{metadata:MetadataTypeMap, type:string}&gt;</code> - metadata  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| name | <code>string</code> | name of the metadata file |
| templateVariables | <code>Util.TemplateMap</code> | variables to be replaced in the metadata |
| [subType] | <code>string</code> | optionally limit to a single subtype |

<a name="MetadataType.preDeployTasks"></a>

### MetadataType.preDeployTasks(metadata, deployDir) ⇒ <code>Promise.&lt;MetadataTypeItem&gt;</code>
Gets executed before deploying metadata

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise.&lt;MetadataTypeItem&gt;</code> - Promise of a single metadata item  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>MetadataTypeItem</code> | a single metadata item |
| deployDir | <code>string</code> | folder where files for deployment are stored |

<a name="MetadataType.create"></a>

### MetadataType.create(metadata, deployDir) ⇒ <code>void</code>
Abstract create method that needs to be implemented in child metadata type

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>MetadataTypeItem</code> | single metadata entry |
| deployDir | <code>string</code> | directory where deploy metadata are saved |

<a name="MetadataType.update"></a>

### MetadataType.update(metadata, [metadataBefore]) ⇒ <code>void</code>
Abstract update method that needs to be implemented in child metadata type

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>MetadataTypeItem</code> | single metadata entry |
| [metadataBefore] | <code>MetadataTypeItem</code> | metadata mapped by their keyField |

<a name="MetadataType.upsert"></a>

### MetadataType.upsert(metadata, deployDir, [buObject]) ⇒ <code>Promise.&lt;MetadataTypeMap&gt;</code>
MetadataType upsert, after retrieving from target and comparing to check if create or update operation is needed.

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise.&lt;MetadataTypeMap&gt;</code> - keyField => metadata map  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>MetadataTypeMap</code> | metadata mapped by their keyField |
| deployDir | <code>string</code> | directory where deploy metadata are saved |
| [buObject] | <code>Util.BuObject</code> | properties for auth |

<a name="MetadataType.createREST"></a>

### MetadataType.createREST(metadataEntry, uri) ⇒ <code>Promise</code>
Creates a single metadata entry via REST

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadataEntry | <code>MetadataTypeItem</code> | a single metadata Entry |
| uri | <code>string</code> | rest endpoint for POST |

<a name="MetadataType.createSOAP"></a>

### MetadataType.createSOAP(metadataEntry, [overrideType], [handleOutside]) ⇒ <code>Promise</code>
Creates a single metadata entry via fuel-soap (generic lib not wrapper)

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadataEntry | <code>MetadataTypeItem</code> | single metadata entry |
| [overrideType] | <code>string</code> | can be used if the API type differs from the otherwise used type identifier |
| [handleOutside] | <code>boolean</code> | if the API reponse is irregular this allows you to handle it outside of this generic method |

<a name="MetadataType.updateREST"></a>

### MetadataType.updateREST(metadataEntry, uri) ⇒ <code>Promise</code>
Updates a single metadata entry via REST

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadataEntry | <code>MetadataTypeItem</code> | a single metadata Entry |
| uri | <code>string</code> | rest endpoint for PATCH |

<a name="MetadataType.updateSOAP"></a>

### MetadataType.updateSOAP(metadataEntry, [overrideType], [handleOutside]) ⇒ <code>Promise</code>
Updates a single metadata entry via fuel-soap (generic lib not wrapper)

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadataEntry | <code>MetadataTypeItem</code> | single metadata entry |
| [overrideType] | <code>string</code> | can be used if the API type differs from the otherwise used type identifier |
| [handleOutside] | <code>boolean</code> | if the API reponse is irregular this allows you to handle it outside of this generic method |

<a name="MetadataType.retrieveSOAPgeneric"></a>

### MetadataType.retrieveSOAPgeneric(retrieveDir, buObject, [options], [additionalFields], [overrideType]) ⇒ <code>Promise.&lt;{metadata:MetadataTypeMap, type:string}&gt;</code>
Retrieves SOAP via generic fuel-soap wrapper based metadata of metadata type into local filesystem. executes callback with retrieved metadata

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise.&lt;{metadata:MetadataTypeMap, type:string}&gt;</code> - Promise of item map  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| buObject | <code>Util.BuObject</code> | properties for auth |
| [options] | <code>Object</code> | required for the specific request (filter for example) |
| [additionalFields] | <code>Array.&lt;string&gt;</code> | Returns specified fields even if their retrieve definition is not set to true |
| [overrideType] | <code>string</code> | can be used if the API type differs from the otherwise used type identifier |

<a name="MetadataType.retrieveSOAPBody"></a>

### MetadataType.retrieveSOAPBody(fields, [options], [type]) ⇒ <code>Promise.&lt;MetadataTypeMap&gt;</code>
helper that handles batched retrieve via SOAP

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise.&lt;MetadataTypeMap&gt;</code> - keyField => metadata map  

| Param | Type | Description |
| --- | --- | --- |
| fields | <code>Array.&lt;string&gt;</code> | list of fields that we want to see retrieved |
| [options] | <code>Object</code> | required for the specific request (filter for example) |
| [type] | <code>string</code> | optionally overwrite the API type of the metadata here |

<a name="MetadataType.retrieveREST"></a>

### MetadataType.retrieveREST(retrieveDir, uri, [overrideType], [templateVariables]) ⇒ <code>Promise.&lt;{metadata:MetadataTypeMap, type:string}&gt;</code>
Retrieves Metadata for Rest Types

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise.&lt;{metadata:MetadataTypeMap, type:string}&gt;</code> - Promise of item map  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| uri | <code>string</code> | rest endpoint for GET |
| [overrideType] | <code>string</code> | force a metadata type (mainly used for Folders) |
| [templateVariables] | <code>Util.TemplateMap</code> | variables to be replaced in the metadata |

<a name="MetadataType.parseResponseBody"></a>

### MetadataType.parseResponseBody(body) ⇒ <code>Promise.&lt;MetadataTypeMap&gt;</code>
Builds map of metadata entries mapped to their keyfields

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise.&lt;MetadataTypeMap&gt;</code> - keyField => metadata map  

| Param | Type | Description |
| --- | --- | --- |
| body | <code>Object</code> | json of response body |

<a name="MetadataType.deleteFieldByDefinition"></a>

### MetadataType.deleteFieldByDefinition(metadataEntry, fieldPath, definitionProperty, origin) ⇒ <code>void</code>
Deletes a field in a metadata entry if the selected definition property equals false.

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  

| Param | Type | Description |
| --- | --- | --- |
| metadataEntry | <code>MetadataTypeItem</code> | One entry of a metadataType |
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
| metadataEntry | <code>MetadataTypeItem</code> | metadata entry |

<a name="MetadataType.removeNotUpdateableFields"></a>

### MetadataType.removeNotUpdateableFields(metadataEntry) ⇒ <code>void</code>
Remove fields from metadata entry that are not updateable

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  

| Param | Type | Description |
| --- | --- | --- |
| metadataEntry | <code>MetadataTypeItem</code> | metadata entry |

<a name="MetadataType.keepTemplateFields"></a>

### MetadataType.keepTemplateFields(metadataEntry) ⇒ <code>void</code>
Remove fields from metadata entry that are not needed in the template

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  

| Param | Type | Description |
| --- | --- | --- |
| metadataEntry | <code>MetadataTypeItem</code> | metadata entry |

<a name="MetadataType.keepRetrieveFields"></a>

### MetadataType.keepRetrieveFields(metadataEntry) ⇒ <code>void</code>
Remove fields from metadata entry that are not needed in the stored metadata

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  

| Param | Type | Description |
| --- | --- | --- |
| metadataEntry | <code>MetadataTypeItem</code> | metadata entry |

<a name="MetadataType.isFiltered"></a>

### MetadataType.isFiltered(metadataEntry, [include]) ⇒ <code>boolean</code>
checks if the current metadata entry should be saved on retrieve or not

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>boolean</code> - true: skip saving == filtered; false: continue with saving  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| metadataEntry | <code>MetadataTypeItem</code> |  | metadata entry |
| [include] | <code>boolean</code> | <code>false</code> | true: use definition.include / options.include; false=exclude: use definition.filter / options.exclude |

<a name="MetadataType.isFilteredFolder"></a>

### MetadataType.isFilteredFolder(metadataEntry, [include]) ⇒ <code>boolean</code>
optionally filter by what folder something is in

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>boolean</code> - true: filtered == do NOT save; false: not filtered == do save  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| metadataEntry | <code>Object</code> |  | metadata entry |
| [include] | <code>boolean</code> | <code>false</code> | true: use definition.include / options.include; false=exclude: use definition.filter / options.exclude |

<a name="MetadataType.paginate"></a>

### MetadataType.paginate(url, last) ⇒ <code>string</code>
Paginates a URL

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>string</code> - new url with pagination  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | url of the request |
| last | <code>number</code> | Number of the page of the last request |

<a name="MetadataType.saveResults"></a>

### MetadataType.saveResults(results, retrieveDir, [overrideType], [templateVariables]) ⇒ <code>Promise.&lt;MetadataTypeMap&gt;</code>
Helper for writing Metadata to disk, used for Retrieve and deploy

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise.&lt;MetadataTypeMap&gt;</code> - Promise of saved metadata  

| Param | Type | Description |
| --- | --- | --- |
| results | <code>MetadataTypeMap</code> | metadata results from deploy |
| retrieveDir | <code>string</code> | directory where metadata should be stored after deploy/retrieve |
| [overrideType] | <code>string</code> | for use when there is a subtype (such as folder-queries) |
| [templateVariables] | <code>Util.TemplateMap</code> | variables to be replaced in the metadata |

<a name="MetadataType.buildDefinitionForExtracts"></a>

### MetadataType.buildDefinitionForExtracts(templateDir, targetDir, metadata, variables, templateName) ⇒ <code>Promise.&lt;void&gt;</code>
helper for buildDefinition
handles extracted code if any are found for complex types (e.g script, asset, query)

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise.&lt;void&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where metadata templates are stored |
| targetDir | <code>string</code> | Directory where built definitions will be saved |
| metadata | <code>MetadataTypeItem</code> | main JSON file that was read from file system |
| variables | <code>Util.TemplateMap</code> | variables to be replaced in the metadata |
| templateName | <code>string</code> | name of the template to be built |

<a name="MetadataType.findSubType"></a>

### MetadataType.findSubType(templateDir, templateName) ⇒ <code>string</code>
check template directory for complex types that open subfolders for their subtypes

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>string</code> - subtype name  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where metadata templates are stored |
| templateName | <code>string</code> | name of the metadata file |

<a name="MetadataType.readSecondaryFolder"></a>

### MetadataType.readSecondaryFolder(templateDir, typeDirArr, templateName, fileName, ex) ⇒ <code>Object</code>
optional method used for some types to try a different folder structure

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Object</code> - metadata  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where metadata templates are stored |
| typeDirArr | <code>Array.&lt;string&gt;</code> | current subdir for this type |
| templateName | <code>string</code> | name of the metadata template |
| fileName | <code>string</code> | name of the metadata template file w/o extension |
| ex | <code>Error</code> | error from first attempt |

<a name="MetadataType.buildDefinition"></a>

### MetadataType.buildDefinition(templateDir, targetDir, templateName, variables) ⇒ <code>Promise.&lt;{metadata:MetadataTypeMap, type:string}&gt;</code>
Builds definition based on template
NOTE: Most metadata files should use this generic method, unless custom
parsing is required (for example scripts & queries)

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Promise.&lt;{metadata:MetadataTypeMap, type:string}&gt;</code> - Promise of item map  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where metadata templates are stored |
| targetDir | <code>String</code> \| <code>Array.&lt;String&gt;</code> | (List of) Directory where built definitions will be saved |
| templateName | <code>string</code> | name of the metadata file |
| variables | <code>Util.TemplateMap</code> | variables to be replaced in the metadata |

<a name="MetadataType.checkForErrors"></a>

### MetadataType.checkForErrors(response) ⇒ <code>void</code>
**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  

| Param | Type | Description |
| --- | --- | --- |
| response | <code>Object</code> | response payload from REST API |

<a name="MetadataType.document"></a>

### MetadataType.document([buObject], [metadata], [isDeploy]) ⇒ <code>void</code>
Gets metadata cache with limited fields and does not store value to disk

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  

| Param | Type | Description |
| --- | --- | --- |
| [buObject] | <code>Util.BuObject</code> | properties for auth |
| [metadata] | <code>MetadataTypeMap</code> | a list of type definitions |
| [isDeploy] | <code>boolean</code> | used to skip non-supported message during deploy |

<a name="MetadataType.deleteByKey"></a>

### MetadataType.deleteByKey(buObject, customerKey) ⇒ <code>void</code>
Delete a data extension from the specified business unit

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>void</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| buObject | <code>Util.BuObject</code> | references credentials |
| customerKey | <code>string</code> | Identifier of data extension |

<a name="MetadataType.readBUMetadataForType"></a>

### MetadataType.readBUMetadataForType(readDir, [listBadKeys], [buMetadata]) ⇒ <code>Object</code>
Returns metadata of a business unit that is saved locally

**Kind**: static method of [<code>MetadataType</code>](#MetadataType)  
**Returns**: <code>Object</code> - Metadata of BU in local directory  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| readDir | <code>string</code> |  | root directory of metadata. |
| [listBadKeys] | <code>boolean</code> | <code>false</code> | do not print errors, used for badKeys() |
| [buMetadata] | <code>Object</code> |  | Metadata of BU in local directory |

<a name="Query"></a>

## Query ⇐ [<code>MetadataType</code>](#MetadataType)
Query MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [Query](#Query) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir)](#Query.retrieve) ⇒ <code>Promise.&lt;{metadata:QueryMap, type:string}&gt;</code>
    * [.retrieveForCache()](#Query.retrieveForCache) ⇒ <code>Promise.&lt;{metadata:QueryMap, type:string}&gt;</code>
    * [.retrieveAsTemplate(templateDir, name, templateVariables)](#Query.retrieveAsTemplate) ⇒ <code>Promise.&lt;{metadata:QueryMap, type:string}&gt;</code>
    * [.postRetrieveTasks(metadata, _, isTemplating)](#Query.postRetrieveTasks) ⇒ [<code>CodeExtractItem</code>](#CodeExtractItem)
    * [.create(query)](#Query.create) ⇒ <code>Promise</code>
    * [.update(query)](#Query.update) ⇒ <code>Promise</code>
    * [.preDeployTasks(metadata, deployDir)](#Query.preDeployTasks) ⇒ <code>Promise.&lt;QueryItem&gt;</code>
    * [.buildDefinitionForExtracts(templateDir, targetDir, metadata, variables, templateName)](#Query.buildDefinitionForExtracts) ⇒ <code>Promise</code>
    * [.parseMetadata(metadata)](#Query.parseMetadata) ⇒ [<code>CodeExtractItem</code>](#CodeExtractItem)

<a name="Query.retrieve"></a>

### Query.retrieve(retrieveDir) ⇒ <code>Promise.&lt;{metadata:QueryMap, type:string}&gt;</code>
Retrieves Metadata of queries

**Kind**: static method of [<code>Query</code>](#Query)  
**Returns**: <code>Promise.&lt;{metadata:QueryMap, type:string}&gt;</code> - Promise of metadata  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |

<a name="Query.retrieveForCache"></a>

### Query.retrieveForCache() ⇒ <code>Promise.&lt;{metadata:QueryMap, type:string}&gt;</code>
Retrieves query metadata for caching

**Kind**: static method of [<code>Query</code>](#Query)  
**Returns**: <code>Promise.&lt;{metadata:QueryMap, type:string}&gt;</code> - Promise of metadata  
<a name="Query.retrieveAsTemplate"></a>

### Query.retrieveAsTemplate(templateDir, name, templateVariables) ⇒ <code>Promise.&lt;{metadata:QueryMap, type:string}&gt;</code>
Retrieve a specific Query by Name

**Kind**: static method of [<code>Query</code>](#Query)  
**Returns**: <code>Promise.&lt;{metadata:QueryMap, type:string}&gt;</code> - Promise of metadata  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| name | <code>string</code> | name of the metadata file |
| templateVariables | <code>Util.TemplateMap</code> | variables to be replaced in the metadata |

<a name="Query.postRetrieveTasks"></a>

### Query.postRetrieveTasks(metadata, _, isTemplating) ⇒ [<code>CodeExtractItem</code>](#CodeExtractItem)
manages post retrieve steps

**Kind**: static method of [<code>Query</code>](#Query)  
**Returns**: [<code>CodeExtractItem</code>](#CodeExtractItem) - Array with one metadata object and one query string  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>QueryItem</code> | a single query |
| _ | <code>string</code> | unused |
| isTemplating | <code>boolean</code> | signals that we are retrieving templates |

<a name="Query.create"></a>

### Query.create(query) ⇒ <code>Promise</code>
Creates a single query

**Kind**: static method of [<code>Query</code>](#Query)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>QueryItem</code> | a single query |

<a name="Query.update"></a>

### Query.update(query) ⇒ <code>Promise</code>
Updates a single query

**Kind**: static method of [<code>Query</code>](#Query)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>QueryItem</code> | a single query |

<a name="Query.preDeployTasks"></a>

### Query.preDeployTasks(metadata, deployDir) ⇒ <code>Promise.&lt;QueryItem&gt;</code>
prepares a Query for deployment

**Kind**: static method of [<code>Query</code>](#Query)  
**Returns**: <code>Promise.&lt;QueryItem&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>QueryItem</code> | a single query activity |
| deployDir | <code>string</code> | directory of deploy files |

<a name="Query.buildDefinitionForExtracts"></a>

### Query.buildDefinitionForExtracts(templateDir, targetDir, metadata, variables, templateName) ⇒ <code>Promise</code>
helper for buildDefinition
handles extracted code if any are found for complex types

**Kind**: static method of [<code>Query</code>](#Query)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where metadata templates are stored |
| targetDir | <code>string</code> \| <code>Array.&lt;string&gt;</code> | (List of) Directory where built definitions will be saved |
| metadata | <code>Object</code> | main JSON file that was read from file system |
| variables | <code>Object</code> | variables to be replaced in the metadata |
| templateName | <code>string</code> | name of the template to be built |

<a name="Query.parseMetadata"></a>

### Query.parseMetadata(metadata) ⇒ [<code>CodeExtractItem</code>](#CodeExtractItem)
parses retrieved Metadata before saving

**Kind**: static method of [<code>Query</code>](#Query)  
**Returns**: [<code>CodeExtractItem</code>](#CodeExtractItem) - a single item with code parts extracted  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>QueryItem</code> | a single query activity definition |

<a name="Role"></a>

## Role ⇐ [<code>MetadataType</code>](#MetadataType)
ImportFile MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [Role](#Role) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir, _, buObject)](#Role.retrieve) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [.preDeployTasks(metadata)](#Role.preDeployTasks) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [.create(metadata)](#Role.create) ⇒ <code>Promise</code>
    * [.update(metadata)](#Role.update) ⇒ <code>Promise</code>
    * [.document(buObject, [metadata])](#Role.document) ⇒ <code>Promise.&lt;void&gt;</code>
    * [._traverseRoles(role, element, [permission], [isAllowed])](#Role._traverseRoles) ⇒ <code>void</code>

<a name="Role.retrieve"></a>

### Role.retrieve(retrieveDir, _, buObject) ⇒ <code>Promise.&lt;Object&gt;</code>
Gets metadata from Marketing Cloud

**Kind**: static method of [<code>Role</code>](#Role)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Metadata store object  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>String</code> | Directory where retrieved metadata directory will be saved |
| _ | <code>Array.&lt;String&gt;</code> | Returns specified fields even if their retrieve definition is not set to true |
| buObject | <code>Object</code> | properties for auth |

<a name="Role.preDeployTasks"></a>

### Role.preDeployTasks(metadata) ⇒ <code>Promise.&lt;Object&gt;</code>
Gets executed before deploying metadata

**Kind**: static method of [<code>Role</code>](#Role)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Promise of a single metadata item  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>Object</code> | a single metadata item |

<a name="Role.create"></a>

### Role.create(metadata) ⇒ <code>Promise</code>
Create a single Role.

**Kind**: static method of [<code>Role</code>](#Role)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>Object</code> | single metadata entry |

<a name="Role.update"></a>

### Role.update(metadata) ⇒ <code>Promise</code>
Updates a single Role.

**Kind**: static method of [<code>Role</code>](#Role)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>Object</code> | single metadata entry |

<a name="Role.document"></a>

### Role.document(buObject, [metadata]) ⇒ <code>Promise.&lt;void&gt;</code>
Creates markdown documentation of all roles

**Kind**: static method of [<code>Role</code>](#Role)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| buObject | <code>Object</code> | properties for auth |
| [metadata] | <code>Object</code> | role definitions |

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
    * [.retrieve(retrieveDir)](#Script.retrieve) ⇒ <code>Promise.&lt;{metadata:ScriptMap, type:string}&gt;</code>
    * [.retrieveForCache()](#Script.retrieveForCache) ⇒ <code>Promise.&lt;{metadata:ScriptMap, type:string}&gt;</code>
    * [.retrieveAsTemplate(templateDir, name, templateVariables)](#Script.retrieveAsTemplate) ⇒ <code>Promise.&lt;{metadata:ScriptMap, type:string}&gt;</code>
    * [.postRetrieveTasks(metadata, [_], [isTemplating])](#Script.postRetrieveTasks) ⇒ [<code>CodeExtractItem</code>](#CodeExtractItem)
    * [.update(script)](#Script.update) ⇒ <code>Promise</code>
    * [.create(script)](#Script.create) ⇒ <code>Promise</code>
    * [._mergeCode(metadata, deployDir, [templateName])](#Script._mergeCode) ⇒ <code>Promise.&lt;String&gt;</code>
    * [.preDeployTasks(metadata, dir)](#Script.preDeployTasks) ⇒ <code>ScriptItem</code>
    * [.buildDefinitionForExtracts(templateDir, targetDir, metadata, variables, templateName)](#Script.buildDefinitionForExtracts) ⇒ <code>Promise</code>
    * [.parseMetadata(metadata)](#Script.parseMetadata) ⇒ [<code>CodeExtractItem</code>](#CodeExtractItem)

<a name="Script.retrieve"></a>

### Script.retrieve(retrieveDir) ⇒ <code>Promise.&lt;{metadata:ScriptMap, type:string}&gt;</code>
Retrieves Metadata of Script
Endpoint /automation/v1/scripts/ return all Scripts with all details.

**Kind**: static method of [<code>Script</code>](#Script)  
**Returns**: <code>Promise.&lt;{metadata:ScriptMap, type:string}&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>string</code> | Directory where retrieved metadata directory will be saved |

<a name="Script.retrieveForCache"></a>

### Script.retrieveForCache() ⇒ <code>Promise.&lt;{metadata:ScriptMap, type:string}&gt;</code>
Retrieves script metadata for caching

**Kind**: static method of [<code>Script</code>](#Script)  
**Returns**: <code>Promise.&lt;{metadata:ScriptMap, type:string}&gt;</code> - Promise  
<a name="Script.retrieveAsTemplate"></a>

### Script.retrieveAsTemplate(templateDir, name, templateVariables) ⇒ <code>Promise.&lt;{metadata:ScriptMap, type:string}&gt;</code>
Retrieve a specific Script by Name

**Kind**: static method of [<code>Script</code>](#Script)  
**Returns**: <code>Promise.&lt;{metadata:ScriptMap, type:string}&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where retrieved metadata directory will be saved |
| name | <code>string</code> | name of the metadata file |
| templateVariables | <code>Util.TemplateMap</code> | variables to be replaced in the metadata |

<a name="Script.postRetrieveTasks"></a>

### Script.postRetrieveTasks(metadata, [_], [isTemplating]) ⇒ [<code>CodeExtractItem</code>](#CodeExtractItem)
manages post retrieve steps

**Kind**: static method of [<code>Script</code>](#Script)  
**Returns**: [<code>CodeExtractItem</code>](#CodeExtractItem) - Array with one metadata object and one ssjs string  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>ScriptItem</code> | a single script |
| [_] | <code>string</code> | unused |
| [isTemplating] | <code>boolean</code> | signals that we are retrieving templates |

<a name="Script.update"></a>

### Script.update(script) ⇒ <code>Promise</code>
Updates a single Script

**Kind**: static method of [<code>Script</code>](#Script)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| script | <code>Object</code> | a single Script |

<a name="Script.create"></a>

### Script.create(script) ⇒ <code>Promise</code>
Creates a single Script

**Kind**: static method of [<code>Script</code>](#Script)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| script | <code>Object</code> | a single Script |

<a name="Script._mergeCode"></a>

### Script.\_mergeCode(metadata, deployDir, [templateName]) ⇒ <code>Promise.&lt;String&gt;</code>
helper for this.preDeployTasks() that loads extracted code content back into JSON

**Kind**: static method of [<code>Script</code>](#Script)  
**Returns**: <code>Promise.&lt;String&gt;</code> - content for metadata.script  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>ScriptItem</code> | a single asset definition |
| deployDir | <code>string</code> | directory of deploy files |
| [templateName] | <code>string</code> | name of the template used to built defintion (prior applying templating) |

<a name="Script.preDeployTasks"></a>

### Script.preDeployTasks(metadata, dir) ⇒ <code>ScriptItem</code>
prepares a Script for deployment

**Kind**: static method of [<code>Script</code>](#Script)  
**Returns**: <code>ScriptItem</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>ScriptItem</code> | a single script activity definition |
| dir | <code>string</code> | directory of deploy files |

<a name="Script.buildDefinitionForExtracts"></a>

### Script.buildDefinitionForExtracts(templateDir, targetDir, metadata, variables, templateName) ⇒ <code>Promise</code>
helper for buildDefinition
handles extracted code if any are found for complex types

**Kind**: static method of [<code>Script</code>](#Script)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| templateDir | <code>string</code> | Directory where metadata templates are stored |
| targetDir | <code>string</code> \| <code>Array.&lt;string&gt;</code> | (List of) Directory where built definitions will be saved |
| metadata | <code>ScriptItem</code> | main JSON file that was read from file system |
| variables | <code>Util.TemplateMap</code> | variables to be replaced in the metadata |
| templateName | <code>string</code> | name of the template to be built |

<a name="Script.parseMetadata"></a>

### Script.parseMetadata(metadata) ⇒ [<code>CodeExtractItem</code>](#CodeExtractItem)
Splits the script metadata into two parts and parses in a standard manner

**Kind**: static method of [<code>Script</code>](#Script)  
**Returns**: [<code>CodeExtractItem</code>](#CodeExtractItem) - a single item with code parts extracted  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>ScriptItem</code> | a single script activity definition |

<a name="SetDefinition"></a>

## SetDefinition ⇐ [<code>MetadataType</code>](#MetadataType)
SetDefinition MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [SetDefinition](#SetDefinition) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir)](#SetDefinition.retrieve) ⇒ <code>Promise</code>
    * [.retrieveForCache()](#SetDefinition.retrieveForCache) ⇒ <code>Promise</code>

<a name="SetDefinition.retrieve"></a>

### SetDefinition.retrieve(retrieveDir) ⇒ <code>Promise</code>
Retrieves Metadata of schema set Definitions.

**Kind**: static method of [<code>SetDefinition</code>](#SetDefinition)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>String</code> | Directory where retrieved metadata directory will be saved |

<a name="SetDefinition.retrieveForCache"></a>

### SetDefinition.retrieveForCache() ⇒ <code>Promise</code>
Retrieves Metadata of schema set definitions for caching.

**Kind**: static method of [<code>SetDefinition</code>](#SetDefinition)  
**Returns**: <code>Promise</code> - Promise  
<a name="TriggeredSendDefinition"></a>

## TriggeredSendDefinition ⇐ [<code>MetadataType</code>](#MetadataType)
MessageSendActivity MetadataType

**Kind**: global class  
**Extends**: [<code>MetadataType</code>](#MetadataType)  

* [TriggeredSendDefinition](#TriggeredSendDefinition) ⇐ [<code>MetadataType</code>](#MetadataType)
    * [.retrieve(retrieveDir)](#TriggeredSendDefinition.retrieve) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [.create(metadata)](#TriggeredSendDefinition.create) ⇒ <code>Promise</code>
    * [.update(metadata)](#TriggeredSendDefinition.update) ⇒ <code>Promise</code>
    * [.postRetrieveTasks(metadata)](#TriggeredSendDefinition.postRetrieveTasks) ⇒ <code>Array.&lt;Object&gt;</code>
    * [.parseMetadata(metadata)](#TriggeredSendDefinition.parseMetadata) ⇒ <code>Array</code>
    * [.preDeployTasks(metadata)](#TriggeredSendDefinition.preDeployTasks) ⇒ <code>Object</code>

<a name="TriggeredSendDefinition.retrieve"></a>

### TriggeredSendDefinition.retrieve(retrieveDir) ⇒ <code>Promise.&lt;Object&gt;</code>
Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata

**Kind**: static method of [<code>TriggeredSendDefinition</code>](#TriggeredSendDefinition)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Promise of metadata  

| Param | Type | Description |
| --- | --- | --- |
| retrieveDir | <code>String</code> | Directory where retrieved metadata directory will be saved |

<a name="TriggeredSendDefinition.create"></a>

### TriggeredSendDefinition.create(metadata) ⇒ <code>Promise</code>
Create a single TSD.

**Kind**: static method of [<code>TriggeredSendDefinition</code>](#TriggeredSendDefinition)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>Object</code> | single metadata entry |

<a name="TriggeredSendDefinition.update"></a>

### TriggeredSendDefinition.update(metadata) ⇒ <code>Promise</code>
Updates a single TSD.

**Kind**: static method of [<code>TriggeredSendDefinition</code>](#TriggeredSendDefinition)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>Object</code> | single metadata entry |

<a name="TriggeredSendDefinition.postRetrieveTasks"></a>

### TriggeredSendDefinition.postRetrieveTasks(metadata) ⇒ <code>Array.&lt;Object&gt;</code>
manages post retrieve steps

**Kind**: static method of [<code>TriggeredSendDefinition</code>](#TriggeredSendDefinition)  
**Returns**: <code>Array.&lt;Object&gt;</code> - Array with one metadata object and one query string  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>Object</code> | a single query |

<a name="TriggeredSendDefinition.parseMetadata"></a>

### TriggeredSendDefinition.parseMetadata(metadata) ⇒ <code>Array</code>
parses retrieved Metadata before saving

**Kind**: static method of [<code>TriggeredSendDefinition</code>](#TriggeredSendDefinition)  
**Returns**: <code>Array</code> - Array with one metadata object and one sql string  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>Object</code> | a single query activity definition |

<a name="TriggeredSendDefinition.preDeployTasks"></a>

### TriggeredSendDefinition.preDeployTasks(metadata) ⇒ <code>Object</code>
prepares a TSD for deployment

**Kind**: static method of [<code>TriggeredSendDefinition</code>](#TriggeredSendDefinition)  
**Returns**: <code>Object</code> - metadata object  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>Object</code> | of a single TSD |

<a name="Retriever"></a>

## Retriever
Retrieves metadata from a business unit and saves it to the local filesystem.

**Kind**: global class  

* [Retriever](#Retriever)
    * [new Retriever(properties, buObject, client)](#new_Retriever_new)
    * [.retrieve(metadataTypes, [name], [templateVariables])](#Retriever+retrieve) ⇒ <code>Promise</code>

<a name="new_Retriever_new"></a>

### new Retriever(properties, buObject, client)
Creates a Retriever, uses v2 auth if v2AuthOptions are passed.


| Param | Type | Description |
| --- | --- | --- |
| properties | <code>Object</code> | General configuration to be used in retrieve |
| properties.directories | <code>Object</code> | Directories to be used when interacting with FS |
| buObject | <code>Object</code> | properties for auth |
| buObject.clientId | <code>String</code> | clientId for FuelSDK auth |
| buObject.clientSecret | <code>String</code> | clientSecret for FuelSDK auth |
| buObject.credential | <code>Object</code> | clientId for FuelSDK auth |
| buObject.tenant | <code>String</code> | v2 Auth Tenant Information |
| [buObject.mid] | <code>String</code> | ID of Business Unit to authenticate with |
| [buObject.businessUnit] | <code>String</code> | name of Business Unit to authenticate with |
| client | <code>Util.ET\_Client</code> | fuel client |

<a name="Retriever+retrieve"></a>

### retriever.retrieve(metadataTypes, [name], [templateVariables]) ⇒ <code>Promise</code>
Retrieve metadata of specified types into local file system and Retriever.metadata

**Kind**: instance method of [<code>Retriever</code>](#Retriever)  
**Returns**: <code>Promise</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| metadataTypes | <code>Array.&lt;String&gt;</code> | String list of metadata types to retrieve |
| [name] | <code>String</code> | name of Metadata to retrieve (in case of templating) |
| [templateVariables] | <code>Object</code> | Object of values which can be replaced (in case of templating) |

<a name="MetadataTypeDefinitions"></a>

## MetadataTypeDefinitions
Provides access to all metadataType classes

**Kind**: global constant  
<a name="MetadataTypeInfo"></a>

## MetadataTypeInfo
Provides access to all metadataType classes

**Kind**: global constant  
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
| properties | <code>object</code> | current properties that have to be refreshed |
| credentialsName | <code>string</code> | identifying name of the installed package / project |

<a name="Cli"></a>

## Cli
CLI helper class

**Kind**: global constant  

* [Cli](#Cli)
    * [.initMcdevConfig([skipInteraction])](#Cli.initMcdevConfig) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.addExtraCredential(properties, [skipInteraction])](#Cli.addExtraCredential) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.updateCredential(properties, credName, [skipInteraction])](#Cli.updateCredential) ⇒ <code>Promise.&lt;Boolean&gt;</code>
    * [.getCredentialObject(properties, target, [isCredentialOnly], [allowAll])](#Cli.getCredentialObject) ⇒ <code>Promise.&lt;Util.BuObject&gt;</code>
    * [._selectBU(properties, [credential], [isCredentialOnly], [allowAll])](#Cli._selectBU) ⇒ <code>Promise.&lt;Array&gt;</code>
    * [._setCredential(properties, [credName], [skipInteraction])](#Cli._setCredential) ⇒ <code>Promise.&lt;(boolean\|String)&gt;</code>
    * [._askCredentials(properties, [credName])](#Cli._askCredentials) ⇒ <code>Promise.&lt;Object&gt;</code>
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
| [skipInteraction] | <code>Object</code> | signals what to insert automatically for things usually asked via wizard |
| skipInteraction.clientId | <code>String</code> | client id of installed package |
| skipInteraction.clientSecret | <code>String</code> | client id of installed package |
| skipInteraction.tenant | <code>String</code> | client id of installed package |
| skipInteraction.credentialsName | <code>String</code> | how you would like the credential to be named |

<a name="Cli.addExtraCredential"></a>

### Cli.addExtraCredential(properties, [skipInteraction]) ⇒ <code>Promise.&lt;void&gt;</code>
Extends template file for properties.json

**Kind**: static method of [<code>Cli</code>](#Cli)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>Object</code> | config file's json |
| properties.credentials | <code>Object</code> | list of existing credentials |
| [skipInteraction] | <code>Object</code> | signals what to insert automatically for things usually asked via wizard |
| skipInteraction.clientId | <code>String</code> | client id of installed package |
| skipInteraction.clientSecret | <code>String</code> | client id of installed package |
| skipInteraction.tenant | <code>String</code> | client id of installed package |
| skipInteraction.credentialsName | <code>String</code> | how you would like the credential to be named |

<a name="Cli.updateCredential"></a>

### Cli.updateCredential(properties, credName, [skipInteraction]) ⇒ <code>Promise.&lt;Boolean&gt;</code>
Extends template file for properties.json
update credentials

**Kind**: static method of [<code>Cli</code>](#Cli)  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - success of update  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>object</code> | config file's json |
| credName | <code>string</code> | name of credential that needs updating |
| [skipInteraction] | <code>Object</code> | signals what to insert automatically for things usually asked via wizard |
| skipInteraction.clientId | <code>String</code> | client id of installed package |
| skipInteraction.clientSecret | <code>String</code> | client id of installed package |
| skipInteraction.tenant | <code>String</code> | client id of installed package |
| skipInteraction.credentialsName | <code>String</code> | how you would like the credential to be named |

<a name="Cli.getCredentialObject"></a>

### Cli.getCredentialObject(properties, target, [isCredentialOnly], [allowAll]) ⇒ <code>Promise.&lt;Util.BuObject&gt;</code>
Returns Object with parameters required for accessing API

**Kind**: static method of [<code>Cli</code>](#Cli)  
**Returns**: <code>Promise.&lt;Util.BuObject&gt;</code> - credential to be used for Business Unit  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>Object</code> | object of all configuration including credentials |
| target | <code>String</code> | code of BU to use |
| [isCredentialOnly] | <code>boolean</code> \| <code>string</code> | true:don't ask for BU | string: name of BU |
| [allowAll] | <code>boolean</code> | Offer ALL as option in BU selection |

<a name="Cli._selectBU"></a>

### Cli.\_selectBU(properties, [credential], [isCredentialOnly], [allowAll]) ⇒ <code>Promise.&lt;Array&gt;</code>
helps select the right credential in case of bad initial input

**Kind**: static method of [<code>Cli</code>](#Cli)  
**Returns**: <code>Promise.&lt;Array&gt;</code> - selected credential/BU combo  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>object</code> | config file's json |
| [credential] | <code>string</code> | name of valid credential |
| [isCredentialOnly] | <code>boolean</code> | don't ask for BU if true |
| [allowAll] | <code>boolean</code> | Offer ALL as option in BU selection |

<a name="Cli._setCredential"></a>

### Cli.\_setCredential(properties, [credName], [skipInteraction]) ⇒ <code>Promise.&lt;(boolean\|String)&gt;</code>
helper around _askCredentials

**Kind**: static method of [<code>Cli</code>](#Cli)  
**Returns**: <code>Promise.&lt;(boolean\|String)&gt;</code> - success of refresh or credential name  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>object</code> | from config file |
| [credName] | <code>string</code> | name of credential that needs updating |
| [skipInteraction] | <code>Object</code> | signals what to insert automatically for things usually asked via wizard |
| skipInteraction.clientId | <code>String</code> | client id of installed package |
| skipInteraction.clientSecret | <code>String</code> | client id of installed package |
| skipInteraction.tenant | <code>String</code> | client id of installed package |
| skipInteraction.credentialsName | <code>String</code> | how you would like the credential to be named |

<a name="Cli._askCredentials"></a>

### Cli.\_askCredentials(properties, [credName]) ⇒ <code>Promise.&lt;Object&gt;</code>
helper for addExtraCredential()

**Kind**: static method of [<code>Cli</code>](#Cli)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - credential info  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>Object</code> | from config file |
| [credName] | <code>string</code> | name of credential that needs updating |

<a name="Cli.selectTypes"></a>

### Cli.selectTypes(properties, [setTypesArr]) ⇒ <code>Promise.&lt;void&gt;</code>
allows updating the metadata types that shall be retrieved

**Kind**: static method of [<code>Cli</code>](#Cli)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>object</code> | config file's json |
| properties.metaDataTypes | <code>object</code> | - |
| properties.metaDataTypes.retrieve | <code>Array.&lt;String&gt;</code> | list of currently retrieved types |
| [setTypesArr] | <code>Array.&lt;String&gt;</code> | skip user prompt and overwrite with this list if given |

<a name="Cli._summarizeSubtypes"></a>

### Cli.\_summarizeSubtypes(responses, type) ⇒ <code>void</code>
helper for this.selectTypes() that converts subtypes back to main type if all and only defaults were selected
this keeps the config automatically upgradable when we add new subtypes or change what is selected by default

**Kind**: static method of [<code>Cli</code>](#Cli)  

| Param | Type | Description |
| --- | --- | --- |
| responses | <code>Object</code> | wrapper object for respones |
| responses.selectedTypes | <code>Array.&lt;String&gt;</code> | what types the user selected |
| type | <code>String</code> | metadata type |

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
    * [.createDeltaPkg(properties, [range], [saveToDeployDir], [filterPaths])](#DevOps.createDeltaPkg) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [.document(directory, jsonReport)](#DevOps.document) ⇒ <code>void</code>

<a name="DevOps.createDeltaPkg"></a>

### DevOps.createDeltaPkg(properties, [range], [saveToDeployDir], [filterPaths]) ⇒ <code>Promise.&lt;Object&gt;</code>
Extracts the delta between a commit and the current state for deployment.
Interactive commit selection if no commits are passed.

**Kind**: static method of [<code>DevOps</code>](#DevOps)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>Object</code> | central properties object |
| [range] | <code>String</code> | git commit range |
| [saveToDeployDir] | <code>boolean</code> | if true, copy metadata changes into deploy directory |
| [filterPaths] | <code>String</code> | filter file paths that start with any specified path (comma separated) |

<a name="DevOps.document"></a>

### DevOps.document(directory, jsonReport) ⇒ <code>void</code>
create markdown file for deployment listing

**Kind**: static method of [<code>DevOps</code>](#DevOps)  

| Param | Type | Description |
| --- | --- | --- |
| directory | <code>String</code> | - |
| jsonReport | <code>Object</code> | - |

<a name="File"></a>

## File
File extends fs-extra. It adds logger and util methods for file handling

**Kind**: global constant  

* [File](#File)
    * [.copyFile(from, to)](#File.copyFile) ⇒ <code>Object</code>
    * [.filterIllegalPathChars(path)](#File.filterIllegalPathChars) ⇒ <code>String</code>
    * [.filterIllegalFilenames(filename)](#File.filterIllegalFilenames) ⇒ <code>String</code>
    * [.reverseFilterIllegalFilenames(filename)](#File.reverseFilterIllegalFilenames) ⇒ <code>String</code>
    * [.normalizePath(denormalizedPath)](#File.normalizePath) ⇒ <code>String</code>
    * [.writeJSONToFile(directory, filename, content)](#File.writeJSONToFile) ⇒ <code>Promise</code>
    * [.writePrettyToFile(directory, filename, filetype, content, [templateVariables])](#File.writePrettyToFile) ⇒ <code>Promise.&lt;Boolean&gt;</code>
    * [._beautify_sql(content)](#File._beautify_sql) ⇒ <code>String</code>
    * [._beautify_prettier(directory, filename, filetype, content)](#File._beautify_prettier) ⇒ <code>String</code>
    * [.writeToFile(directory, filename, filetype, content, [encoding])](#File.writeToFile) ⇒ <code>Promise.&lt;Boolean&gt;</code>
    * [.readJSONFile(directory, filename, sync, cleanPath)](#File.readJSONFile) ⇒ <code>Promise</code> \| <code>Object</code>
    * [.readFile(directory, filename, filetype, [encoding])](#File.readFile) ⇒ <code>Promise.&lt;String&gt;</code>
    * [.readDirectories(directory, depth, [includeStem], [_stemLength])](#File.readDirectories) ⇒ <code>Promise.&lt;Array.&lt;String&gt;&gt;</code>
    * [.readDirectoriesSync(directory, [depth], [includeStem], [_stemLength])](#File.readDirectoriesSync) ⇒ <code>Array.&lt;String&gt;</code>
    * [.loadConfigFile([silent])](#File.loadConfigFile) ⇒ <code>Object</code>
    * [.saveConfigFile(properties)](#File.saveConfigFile) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.initPrettier([filetype])](#File.initPrettier) ⇒ <code>Promise.&lt;Boolean&gt;</code>

<a name="File.copyFile"></a>

### File.copyFile(from, to) ⇒ <code>Object</code>
copies a file from one path to another

**Kind**: static method of [<code>File</code>](#File)  
**Returns**: <code>Object</code> - - results object  

| Param | Type | Description |
| --- | --- | --- |
| from | <code>String</code> | full filepath including name of existing file |
| to | <code>String</code> | full filepath including name where file should go |

<a name="File.filterIllegalPathChars"></a>

### File.filterIllegalPathChars(path) ⇒ <code>String</code>
makes sure Windows accepts path names

**Kind**: static method of [<code>File</code>](#File)  
**Returns**: <code>String</code> - - corrected string  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>String</code> | filename or path |

<a name="File.filterIllegalFilenames"></a>

### File.filterIllegalFilenames(filename) ⇒ <code>String</code>
makes sure Windows accepts file names

**Kind**: static method of [<code>File</code>](#File)  
**Returns**: <code>String</code> - - corrected string  

| Param | Type | Description |
| --- | --- | --- |
| filename | <code>String</code> | filename or path |

<a name="File.reverseFilterIllegalFilenames"></a>

### File.reverseFilterIllegalFilenames(filename) ⇒ <code>String</code>
makes sure Windows accepts file names

**Kind**: static method of [<code>File</code>](#File)  
**Returns**: <code>String</code> - - corrected string  

| Param | Type | Description |
| --- | --- | --- |
| filename | <code>String</code> | filename or path |

<a name="File.normalizePath"></a>

### File.normalizePath(denormalizedPath) ⇒ <code>String</code>
Takes various types of path strings and formats into a platform specific path

**Kind**: static method of [<code>File</code>](#File)  
**Returns**: <code>String</code> - Path strings  

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
| filename | <code>String</code> | name of the file without '.json' ending |
| content | <code>Object</code> | filecontent |

<a name="File.writePrettyToFile"></a>

### File.writePrettyToFile(directory, filename, filetype, content, [templateVariables]) ⇒ <code>Promise.&lt;Boolean&gt;</code>
Saves beautified files in the local file system. Will create the parent directory if it does not exist
! Important: run 'await File.initPrettier()' in your MetadataType.retrieve() once before hitting this

**Kind**: static method of [<code>File</code>](#File)  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| directory | <code>string</code> \| <code>Array.&lt;string&gt;</code> | directory the file will be written to |
| filename | <code>String</code> | name of the file without suffix |
| filetype | <code>String</code> | filetype ie. JSON or SSJS |
| content | <code>String</code> | filecontent |
| [templateVariables] | <code>Object</code> | templating variables to be replaced in the metadata |

<a name="File._beautify_sql"></a>

### File.\_beautify\_sql(content) ⇒ <code>String</code>
helper for writePrettyToFile, applying sql formatting onto given stringified content

**Kind**: static method of [<code>File</code>](#File)  
**Returns**: <code>String</code> - original string on error; formatted string on success  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>String</code> | filecontent |

<a name="File._beautify_prettier"></a>

### File.\_beautify\_prettier(directory, filename, filetype, content) ⇒ <code>String</code>
helper for writePrettyToFile, applying prettier onto given stringified content
! Important: run 'await File.initPrettier()' in your MetadataType.retrieve() once before hitting this

**Kind**: static method of [<code>File</code>](#File)  
**Returns**: <code>String</code> - original string on error; formatted string on success  

| Param | Type | Description |
| --- | --- | --- |
| directory | <code>string</code> \| <code>Array.&lt;string&gt;</code> | directory the file will be written to |
| filename | <code>String</code> | name of the file without suffix |
| filetype | <code>String</code> | filetype ie. JSON or SSJS |
| content | <code>String</code> | filecontent |

<a name="File.writeToFile"></a>

### File.writeToFile(directory, filename, filetype, content, [encoding]) ⇒ <code>Promise.&lt;Boolean&gt;</code>
Saves text content to a file in the local file system. Will create the parent directory if it does not exist

**Kind**: static method of [<code>File</code>](#File)  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| directory | <code>string</code> \| <code>Array.&lt;string&gt;</code> | directory the file will be written to |
| filename | <code>String</code> | name of the file without '.json' ending |
| filetype | <code>String</code> | filetype suffix |
| content | <code>String</code> | filecontent |
| [encoding] | <code>Object</code> | added for certain file types (like images) |

<a name="File.readJSONFile"></a>

### File.readJSONFile(directory, filename, sync, cleanPath) ⇒ <code>Promise</code> \| <code>Object</code>
Saves json content to a file in the local file system. Will create the parent directory if it does not exist

**Kind**: static method of [<code>File</code>](#File)  
**Returns**: <code>Promise</code> \| <code>Object</code> - Promise or JSON object depending on if async or not  

| Param | Type | Description |
| --- | --- | --- |
| directory | <code>String</code> \| <code>Array.&lt;String&gt;</code> | directory where the file is stored |
| filename | <code>String</code> | name of the file without '.json' ending |
| sync | <code>Boolean</code> | should execute sync (default is async) |
| cleanPath | <code>Boolean</code> | should execute sync (default is true) |

<a name="File.readFile"></a>

### File.readFile(directory, filename, filetype, [encoding]) ⇒ <code>Promise.&lt;String&gt;</code>
reads file from local file system.

**Kind**: static method of [<code>File</code>](#File)  
**Returns**: <code>Promise.&lt;String&gt;</code> - file contents  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| directory | <code>String</code> \| <code>Array.&lt;String&gt;</code> |  | directory where the file is stored |
| filename | <code>String</code> |  | name of the file without '.json' ending |
| filetype | <code>String</code> |  | filetype suffix |
| [encoding] | <code>String</code> | <code>&#x27;utf8&#x27;</code> | read file with encoding (defaults to utf-8) |

<a name="File.readDirectories"></a>

### File.readDirectories(directory, depth, [includeStem], [_stemLength]) ⇒ <code>Promise.&lt;Array.&lt;String&gt;&gt;</code>
reads directories to a specific depth returning an array
of file paths to be iterated over

**Kind**: static method of [<code>File</code>](#File)  
**Returns**: <code>Promise.&lt;Array.&lt;String&gt;&gt;</code> - array of fully defined file paths  

| Param | Type | Description |
| --- | --- | --- |
| directory | <code>String</code> | directory to checkin |
| depth | <code>Number</code> | how many levels to check (1 base) |
| [includeStem] | <code>Boolean</code> | include the parent directory in the response |
| [_stemLength] | <code>Number</code> | set recursively for subfolders. do not set manually! |

**Example**  
```js
['deploy/mcdev/bu1']
```
<a name="File.readDirectoriesSync"></a>

### File.readDirectoriesSync(directory, [depth], [includeStem], [_stemLength]) ⇒ <code>Array.&lt;String&gt;</code>
reads directories to a specific depth returning an array
of file paths to be iterated over using sync api (required in constructors)

**Kind**: static method of [<code>File</code>](#File)  
**Returns**: <code>Array.&lt;String&gt;</code> - array of fully defined file paths  

| Param | Type | Description |
| --- | --- | --- |
| directory | <code>String</code> | directory to checkin |
| [depth] | <code>Number</code> | how many levels to check (1 base) |
| [includeStem] | <code>Boolean</code> | include the parent directory in the response |
| [_stemLength] | <code>Number</code> | set recursively for subfolders. do not set manually! |

**Example**  
```js
['deploy/mcdev/bu1']
```
<a name="File.loadConfigFile"></a>

### File.loadConfigFile([silent]) ⇒ <code>Object</code>
loads central properties from config file

**Kind**: static method of [<code>File</code>](#File)  
**Returns**: <code>Object</code> - central properties object  

| Param | Type | Description |
| --- | --- | --- |
| [silent] | <code>Boolean</code> | omit throwing errors and print messages; assuming not silent if not set |

<a name="File.saveConfigFile"></a>

### File.saveConfigFile(properties) ⇒ <code>Promise.&lt;void&gt;</code>
helper that splits the config back into auth & config parts to save them separately

**Kind**: static method of [<code>File</code>](#File)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>Object</code> | central properties object |

<a name="File.initPrettier"></a>

### File.initPrettier([filetype]) ⇒ <code>Promise.&lt;Boolean&gt;</code>
Initalises Prettier formatting lib async.

**Kind**: static method of [<code>File</code>](#File)  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - success of config load  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [filetype] | <code>String</code> | <code>&#x27;html&#x27;</code> | filetype ie. JSON or SSJS |

<a name="Init"></a>

## Init
CLI helper class

**Kind**: global constant  

* [Init](#Init)
    * [.fixMcdevConfig(properties)](#Init.fixMcdevConfig) ⇒ <code>Promise.&lt;Boolean&gt;</code>
    * [.createIdeConfigFiles()](#Init.createIdeConfigFiles) ⇒ <code>Promise.&lt;Boolean&gt;</code>
    * [._updateLeaf(propertiersCur, defaultPropsCur, fieldName)](#Init._updateLeaf) ⇒ <code>void</code>
    * [._createIdeConfigFile(fileNameArr, [fileContent])](#Init._createIdeConfigFile) ⇒ <code>Promise.&lt;Boolean&gt;</code>
    * [.initGitRepo([skipInteraction])](#Init.initGitRepo) ⇒ <code>Promise.&lt;{status:String, repoName:String}&gt;</code>
    * [.gitPush([skipInteraction])](#Init.gitPush) ⇒ <code>void</code>
    * [._addGitRemote([skipInteraction])](#Init._addGitRemote) ⇒ <code>String</code>
    * [._updateGitConfigUser([skipInteraction])](#Init._updateGitConfigUser) ⇒ <code>void</code>
    * [._getGitConfigUser()](#Init._getGitConfigUser) ⇒ <code>Promise.&lt;{&#x27;user.name&#x27;: String, &#x27;user.email&#x27;: String}&gt;</code>
    * [.initProject(properties, credentialsName, [skipInteraction])](#Init.initProject) ⇒ <code>Promise.&lt;void&gt;</code>
    * [._downloadAllBUs(bu, gitStatus, [skipInteraction])](#Init._downloadAllBUs) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.upgradeProject(properties, [initial], [repoName])](#Init.upgradeProject) ⇒ <code>Promise.&lt;Boolean&gt;</code>
    * [._getMissingCredentials(properties)](#Init._getMissingCredentials) ⇒ <code>Array.&lt;String&gt;</code>
    * [.installDependencies([repoName])](#Init.installDependencies) ⇒ <code>Promise.&lt;Boolean&gt;</code>
    * [._getDefaultPackageJson([currentContent])](#Init._getDefaultPackageJson) ⇒ <code>Promise.&lt;{script: Object, author: String, license: String}&gt;</code>

<a name="Init.fixMcdevConfig"></a>

### Init.fixMcdevConfig(properties) ⇒ <code>Promise.&lt;Boolean&gt;</code>
helper method for this.upgradeProject that upgrades project config if needed

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - returns true if worked without errors  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>Object</code> | config file's json |

<a name="Init.createIdeConfigFiles"></a>

### Init.createIdeConfigFiles() ⇒ <code>Promise.&lt;Boolean&gt;</code>
handles creation/update of all config file from the boilerplate

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - status of config file creation  
<a name="Init._updateLeaf"></a>

### Init.\_updateLeaf(propertiersCur, defaultPropsCur, fieldName) ⇒ <code>void</code>
recursive helper for _fixMcdevConfig that adds missing settings

**Kind**: static method of [<code>Init</code>](#Init)  

| Param | Type | Description |
| --- | --- | --- |
| propertiersCur | <code>Object</code> | current sub-object of project settings |
| defaultPropsCur | <code>Object</code> | current sub-object of default settings |
| fieldName | <code>String</code> | dot-concatenated object-path that needs adding |

<a name="Init._createIdeConfigFile"></a>

### Init.\_createIdeConfigFile(fileNameArr, [fileContent]) ⇒ <code>Promise.&lt;Boolean&gt;</code>
handles creation/update of one config file from the boilerplate at a time

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - install successful or error occured  

| Param | Type | Description |
| --- | --- | --- |
| fileNameArr | <code>Array.&lt;String&gt;</code> | 0: path, 1: filename, 2: extension with dot |
| [fileContent] | <code>String</code> | in case we cannot copy files 1:1 this can be used to pass in content |

<a name="Init.initGitRepo"></a>

### Init.initGitRepo([skipInteraction]) ⇒ <code>Promise.&lt;{status:String, repoName:String}&gt;</code>
check if git repo exists and otherwise create one

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;{status:String, repoName:String}&gt;</code> - success flag  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>Object</code> | signals what to insert automatically for things usually asked via wizard |
| skipInteraction.gitRemoteUrl | <code>String</code> | URL of Git remote server |

<a name="Init.gitPush"></a>

### Init.gitPush([skipInteraction]) ⇒ <code>void</code>
offer to push the new repo straight to the server

**Kind**: static method of [<code>Init</code>](#Init)  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>Boolean</code> \| <code>Object</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init._addGitRemote"></a>

### Init.\_addGitRemote([skipInteraction]) ⇒ <code>String</code>
offers to add the git remote origin

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>String</code> - repo name (optionally)  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>Object</code> | signals what to insert automatically for things usually asked via wizard |
| skipInteraction.gitRemoteUrl | <code>String</code> | URL of Git remote server |

<a name="Init._updateGitConfigUser"></a>

### Init.\_updateGitConfigUser([skipInteraction]) ⇒ <code>void</code>
checks global config and ask to config the user info and then store it locally

**Kind**: static method of [<code>Init</code>](#Init)  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>Object</code> \| <code>Boolean</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init._getGitConfigUser"></a>

### Init.\_getGitConfigUser() ⇒ <code>Promise.&lt;{&#x27;user.name&#x27;: String, &#x27;user.email&#x27;: String}&gt;</code>
retrieves the global user.name and user.email values

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;{&#x27;user.name&#x27;: String, &#x27;user.email&#x27;: String}&gt;</code> - user.name and user.email  
<a name="Init.initProject"></a>

### Init.initProject(properties, credentialsName, [skipInteraction]) ⇒ <code>Promise.&lt;void&gt;</code>
Creates template file for properties.json

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>Object</code> | config file's json |
| credentialsName | <code>string</code> | identifying name of the installed package / project |
| [skipInteraction] | <code>Object</code> | signals what to insert automatically for things usually asked via wizard |
| skipInteraction.clientId | <code>String</code> | client id of installed package |
| skipInteraction.clientSecret | <code>String</code> | client id of installed package |
| skipInteraction.tenant | <code>String</code> | client id of installed package |
| skipInteraction.credentialsName | <code>String</code> | how you would like the credential to be named |
| skipInteraction.gitRemoteUrl | <code>String</code> | URL of Git remote server |

<a name="Init._downloadAllBUs"></a>

### Init.\_downloadAllBUs(bu, gitStatus, [skipInteraction]) ⇒ <code>Promise.&lt;void&gt;</code>
helper for this.initProject()

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| bu | <code>String</code> | cred/bu or cred/* or * |
| gitStatus | <code>String</code> | signals what state the git repo is in |
| [skipInteraction] | <code>Boolean</code> \| <code>Object</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init.upgradeProject"></a>

### Init.upgradeProject(properties, [initial], [repoName]) ⇒ <code>Promise.&lt;Boolean&gt;</code>
wrapper around npm dependency & configuration file setup

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - success flag  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>Object</code> | config file's json |
| [initial] | <code>Boolean</code> | print message if not part of initial setup |
| [repoName] | <code>String</code> | if git URL was provided earlier, the repo name was extracted to use it for npm init |

<a name="Init._getMissingCredentials"></a>

### Init.\_getMissingCredentials(properties) ⇒ <code>Array.&lt;String&gt;</code>
finds credentials that are set up in config but not in auth file

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Array.&lt;String&gt;</code> - list of credential names  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>object</code> | javascript object in .mcdevrc.json |

<a name="Init.installDependencies"></a>

### Init.installDependencies([repoName]) ⇒ <code>Promise.&lt;Boolean&gt;</code>
initiates npm project and then
takes care of loading the pre-configured dependency list
from the boilerplate directory to them as dev-dependencies

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - install successful or error occured  

| Param | Type | Description |
| --- | --- | --- |
| [repoName] | <code>String</code> | if git URL was provided earlier, the repo name was extracted to use it for npm init |

<a name="Init._getDefaultPackageJson"></a>

### Init.\_getDefaultPackageJson([currentContent]) ⇒ <code>Promise.&lt;{script: Object, author: String, license: String}&gt;</code>
ensure we have certain default values in our config

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;{script: Object, author: String, license: String}&gt;</code> - extended currentContent  

| Param | Type | Description |
| --- | --- | --- |
| [currentContent] | <code>Object</code> | what was read from existing package.json file |

<a name="Init"></a>

## Init
CLI helper class

**Kind**: global constant  

* [Init](#Init)
    * [.fixMcdevConfig(properties)](#Init.fixMcdevConfig) ⇒ <code>Promise.&lt;Boolean&gt;</code>
    * [.createIdeConfigFiles()](#Init.createIdeConfigFiles) ⇒ <code>Promise.&lt;Boolean&gt;</code>
    * [._updateLeaf(propertiersCur, defaultPropsCur, fieldName)](#Init._updateLeaf) ⇒ <code>void</code>
    * [._createIdeConfigFile(fileNameArr, [fileContent])](#Init._createIdeConfigFile) ⇒ <code>Promise.&lt;Boolean&gt;</code>
    * [.initGitRepo([skipInteraction])](#Init.initGitRepo) ⇒ <code>Promise.&lt;{status:String, repoName:String}&gt;</code>
    * [.gitPush([skipInteraction])](#Init.gitPush) ⇒ <code>void</code>
    * [._addGitRemote([skipInteraction])](#Init._addGitRemote) ⇒ <code>String</code>
    * [._updateGitConfigUser([skipInteraction])](#Init._updateGitConfigUser) ⇒ <code>void</code>
    * [._getGitConfigUser()](#Init._getGitConfigUser) ⇒ <code>Promise.&lt;{&#x27;user.name&#x27;: String, &#x27;user.email&#x27;: String}&gt;</code>
    * [.initProject(properties, credentialsName, [skipInteraction])](#Init.initProject) ⇒ <code>Promise.&lt;void&gt;</code>
    * [._downloadAllBUs(bu, gitStatus, [skipInteraction])](#Init._downloadAllBUs) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.upgradeProject(properties, [initial], [repoName])](#Init.upgradeProject) ⇒ <code>Promise.&lt;Boolean&gt;</code>
    * [._getMissingCredentials(properties)](#Init._getMissingCredentials) ⇒ <code>Array.&lt;String&gt;</code>
    * [.installDependencies([repoName])](#Init.installDependencies) ⇒ <code>Promise.&lt;Boolean&gt;</code>
    * [._getDefaultPackageJson([currentContent])](#Init._getDefaultPackageJson) ⇒ <code>Promise.&lt;{script: Object, author: String, license: String}&gt;</code>

<a name="Init.fixMcdevConfig"></a>

### Init.fixMcdevConfig(properties) ⇒ <code>Promise.&lt;Boolean&gt;</code>
helper method for this.upgradeProject that upgrades project config if needed

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - returns true if worked without errors  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>Object</code> | config file's json |

<a name="Init.createIdeConfigFiles"></a>

### Init.createIdeConfigFiles() ⇒ <code>Promise.&lt;Boolean&gt;</code>
handles creation/update of all config file from the boilerplate

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - status of config file creation  
<a name="Init._updateLeaf"></a>

### Init.\_updateLeaf(propertiersCur, defaultPropsCur, fieldName) ⇒ <code>void</code>
recursive helper for _fixMcdevConfig that adds missing settings

**Kind**: static method of [<code>Init</code>](#Init)  

| Param | Type | Description |
| --- | --- | --- |
| propertiersCur | <code>Object</code> | current sub-object of project settings |
| defaultPropsCur | <code>Object</code> | current sub-object of default settings |
| fieldName | <code>String</code> | dot-concatenated object-path that needs adding |

<a name="Init._createIdeConfigFile"></a>

### Init.\_createIdeConfigFile(fileNameArr, [fileContent]) ⇒ <code>Promise.&lt;Boolean&gt;</code>
handles creation/update of one config file from the boilerplate at a time

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - install successful or error occured  

| Param | Type | Description |
| --- | --- | --- |
| fileNameArr | <code>Array.&lt;String&gt;</code> | 0: path, 1: filename, 2: extension with dot |
| [fileContent] | <code>String</code> | in case we cannot copy files 1:1 this can be used to pass in content |

<a name="Init.initGitRepo"></a>

### Init.initGitRepo([skipInteraction]) ⇒ <code>Promise.&lt;{status:String, repoName:String}&gt;</code>
check if git repo exists and otherwise create one

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;{status:String, repoName:String}&gt;</code> - success flag  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>Object</code> | signals what to insert automatically for things usually asked via wizard |
| skipInteraction.gitRemoteUrl | <code>String</code> | URL of Git remote server |

<a name="Init.gitPush"></a>

### Init.gitPush([skipInteraction]) ⇒ <code>void</code>
offer to push the new repo straight to the server

**Kind**: static method of [<code>Init</code>](#Init)  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>Boolean</code> \| <code>Object</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init._addGitRemote"></a>

### Init.\_addGitRemote([skipInteraction]) ⇒ <code>String</code>
offers to add the git remote origin

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>String</code> - repo name (optionally)  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>Object</code> | signals what to insert automatically for things usually asked via wizard |
| skipInteraction.gitRemoteUrl | <code>String</code> | URL of Git remote server |

<a name="Init._updateGitConfigUser"></a>

### Init.\_updateGitConfigUser([skipInteraction]) ⇒ <code>void</code>
checks global config and ask to config the user info and then store it locally

**Kind**: static method of [<code>Init</code>](#Init)  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>Object</code> \| <code>Boolean</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init._getGitConfigUser"></a>

### Init.\_getGitConfigUser() ⇒ <code>Promise.&lt;{&#x27;user.name&#x27;: String, &#x27;user.email&#x27;: String}&gt;</code>
retrieves the global user.name and user.email values

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;{&#x27;user.name&#x27;: String, &#x27;user.email&#x27;: String}&gt;</code> - user.name and user.email  
<a name="Init.initProject"></a>

### Init.initProject(properties, credentialsName, [skipInteraction]) ⇒ <code>Promise.&lt;void&gt;</code>
Creates template file for properties.json

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>Object</code> | config file's json |
| credentialsName | <code>string</code> | identifying name of the installed package / project |
| [skipInteraction] | <code>Object</code> | signals what to insert automatically for things usually asked via wizard |
| skipInteraction.clientId | <code>String</code> | client id of installed package |
| skipInteraction.clientSecret | <code>String</code> | client id of installed package |
| skipInteraction.tenant | <code>String</code> | client id of installed package |
| skipInteraction.credentialsName | <code>String</code> | how you would like the credential to be named |
| skipInteraction.gitRemoteUrl | <code>String</code> | URL of Git remote server |

<a name="Init._downloadAllBUs"></a>

### Init.\_downloadAllBUs(bu, gitStatus, [skipInteraction]) ⇒ <code>Promise.&lt;void&gt;</code>
helper for this.initProject()

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| bu | <code>String</code> | cred/bu or cred/* or * |
| gitStatus | <code>String</code> | signals what state the git repo is in |
| [skipInteraction] | <code>Boolean</code> \| <code>Object</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init.upgradeProject"></a>

### Init.upgradeProject(properties, [initial], [repoName]) ⇒ <code>Promise.&lt;Boolean&gt;</code>
wrapper around npm dependency & configuration file setup

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - success flag  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>Object</code> | config file's json |
| [initial] | <code>Boolean</code> | print message if not part of initial setup |
| [repoName] | <code>String</code> | if git URL was provided earlier, the repo name was extracted to use it for npm init |

<a name="Init._getMissingCredentials"></a>

### Init.\_getMissingCredentials(properties) ⇒ <code>Array.&lt;String&gt;</code>
finds credentials that are set up in config but not in auth file

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Array.&lt;String&gt;</code> - list of credential names  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>object</code> | javascript object in .mcdevrc.json |

<a name="Init.installDependencies"></a>

### Init.installDependencies([repoName]) ⇒ <code>Promise.&lt;Boolean&gt;</code>
initiates npm project and then
takes care of loading the pre-configured dependency list
from the boilerplate directory to them as dev-dependencies

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - install successful or error occured  

| Param | Type | Description |
| --- | --- | --- |
| [repoName] | <code>String</code> | if git URL was provided earlier, the repo name was extracted to use it for npm init |

<a name="Init._getDefaultPackageJson"></a>

### Init.\_getDefaultPackageJson([currentContent]) ⇒ <code>Promise.&lt;{script: Object, author: String, license: String}&gt;</code>
ensure we have certain default values in our config

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;{script: Object, author: String, license: String}&gt;</code> - extended currentContent  

| Param | Type | Description |
| --- | --- | --- |
| [currentContent] | <code>Object</code> | what was read from existing package.json file |

<a name="Init"></a>

## Init
CLI helper class

**Kind**: global constant  

* [Init](#Init)
    * [.fixMcdevConfig(properties)](#Init.fixMcdevConfig) ⇒ <code>Promise.&lt;Boolean&gt;</code>
    * [.createIdeConfigFiles()](#Init.createIdeConfigFiles) ⇒ <code>Promise.&lt;Boolean&gt;</code>
    * [._updateLeaf(propertiersCur, defaultPropsCur, fieldName)](#Init._updateLeaf) ⇒ <code>void</code>
    * [._createIdeConfigFile(fileNameArr, [fileContent])](#Init._createIdeConfigFile) ⇒ <code>Promise.&lt;Boolean&gt;</code>
    * [.initGitRepo([skipInteraction])](#Init.initGitRepo) ⇒ <code>Promise.&lt;{status:String, repoName:String}&gt;</code>
    * [.gitPush([skipInteraction])](#Init.gitPush) ⇒ <code>void</code>
    * [._addGitRemote([skipInteraction])](#Init._addGitRemote) ⇒ <code>String</code>
    * [._updateGitConfigUser([skipInteraction])](#Init._updateGitConfigUser) ⇒ <code>void</code>
    * [._getGitConfigUser()](#Init._getGitConfigUser) ⇒ <code>Promise.&lt;{&#x27;user.name&#x27;: String, &#x27;user.email&#x27;: String}&gt;</code>
    * [.initProject(properties, credentialsName, [skipInteraction])](#Init.initProject) ⇒ <code>Promise.&lt;void&gt;</code>
    * [._downloadAllBUs(bu, gitStatus, [skipInteraction])](#Init._downloadAllBUs) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.upgradeProject(properties, [initial], [repoName])](#Init.upgradeProject) ⇒ <code>Promise.&lt;Boolean&gt;</code>
    * [._getMissingCredentials(properties)](#Init._getMissingCredentials) ⇒ <code>Array.&lt;String&gt;</code>
    * [.installDependencies([repoName])](#Init.installDependencies) ⇒ <code>Promise.&lt;Boolean&gt;</code>
    * [._getDefaultPackageJson([currentContent])](#Init._getDefaultPackageJson) ⇒ <code>Promise.&lt;{script: Object, author: String, license: String}&gt;</code>

<a name="Init.fixMcdevConfig"></a>

### Init.fixMcdevConfig(properties) ⇒ <code>Promise.&lt;Boolean&gt;</code>
helper method for this.upgradeProject that upgrades project config if needed

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - returns true if worked without errors  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>Object</code> | config file's json |

<a name="Init.createIdeConfigFiles"></a>

### Init.createIdeConfigFiles() ⇒ <code>Promise.&lt;Boolean&gt;</code>
handles creation/update of all config file from the boilerplate

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - status of config file creation  
<a name="Init._updateLeaf"></a>

### Init.\_updateLeaf(propertiersCur, defaultPropsCur, fieldName) ⇒ <code>void</code>
recursive helper for _fixMcdevConfig that adds missing settings

**Kind**: static method of [<code>Init</code>](#Init)  

| Param | Type | Description |
| --- | --- | --- |
| propertiersCur | <code>Object</code> | current sub-object of project settings |
| defaultPropsCur | <code>Object</code> | current sub-object of default settings |
| fieldName | <code>String</code> | dot-concatenated object-path that needs adding |

<a name="Init._createIdeConfigFile"></a>

### Init.\_createIdeConfigFile(fileNameArr, [fileContent]) ⇒ <code>Promise.&lt;Boolean&gt;</code>
handles creation/update of one config file from the boilerplate at a time

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - install successful or error occured  

| Param | Type | Description |
| --- | --- | --- |
| fileNameArr | <code>Array.&lt;String&gt;</code> | 0: path, 1: filename, 2: extension with dot |
| [fileContent] | <code>String</code> | in case we cannot copy files 1:1 this can be used to pass in content |

<a name="Init.initGitRepo"></a>

### Init.initGitRepo([skipInteraction]) ⇒ <code>Promise.&lt;{status:String, repoName:String}&gt;</code>
check if git repo exists and otherwise create one

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;{status:String, repoName:String}&gt;</code> - success flag  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>Object</code> | signals what to insert automatically for things usually asked via wizard |
| skipInteraction.gitRemoteUrl | <code>String</code> | URL of Git remote server |

<a name="Init.gitPush"></a>

### Init.gitPush([skipInteraction]) ⇒ <code>void</code>
offer to push the new repo straight to the server

**Kind**: static method of [<code>Init</code>](#Init)  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>Boolean</code> \| <code>Object</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init._addGitRemote"></a>

### Init.\_addGitRemote([skipInteraction]) ⇒ <code>String</code>
offers to add the git remote origin

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>String</code> - repo name (optionally)  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>Object</code> | signals what to insert automatically for things usually asked via wizard |
| skipInteraction.gitRemoteUrl | <code>String</code> | URL of Git remote server |

<a name="Init._updateGitConfigUser"></a>

### Init.\_updateGitConfigUser([skipInteraction]) ⇒ <code>void</code>
checks global config and ask to config the user info and then store it locally

**Kind**: static method of [<code>Init</code>](#Init)  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>Object</code> \| <code>Boolean</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init._getGitConfigUser"></a>

### Init.\_getGitConfigUser() ⇒ <code>Promise.&lt;{&#x27;user.name&#x27;: String, &#x27;user.email&#x27;: String}&gt;</code>
retrieves the global user.name and user.email values

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;{&#x27;user.name&#x27;: String, &#x27;user.email&#x27;: String}&gt;</code> - user.name and user.email  
<a name="Init.initProject"></a>

### Init.initProject(properties, credentialsName, [skipInteraction]) ⇒ <code>Promise.&lt;void&gt;</code>
Creates template file for properties.json

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>Object</code> | config file's json |
| credentialsName | <code>string</code> | identifying name of the installed package / project |
| [skipInteraction] | <code>Object</code> | signals what to insert automatically for things usually asked via wizard |
| skipInteraction.clientId | <code>String</code> | client id of installed package |
| skipInteraction.clientSecret | <code>String</code> | client id of installed package |
| skipInteraction.tenant | <code>String</code> | client id of installed package |
| skipInteraction.credentialsName | <code>String</code> | how you would like the credential to be named |
| skipInteraction.gitRemoteUrl | <code>String</code> | URL of Git remote server |

<a name="Init._downloadAllBUs"></a>

### Init.\_downloadAllBUs(bu, gitStatus, [skipInteraction]) ⇒ <code>Promise.&lt;void&gt;</code>
helper for this.initProject()

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| bu | <code>String</code> | cred/bu or cred/* or * |
| gitStatus | <code>String</code> | signals what state the git repo is in |
| [skipInteraction] | <code>Boolean</code> \| <code>Object</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init.upgradeProject"></a>

### Init.upgradeProject(properties, [initial], [repoName]) ⇒ <code>Promise.&lt;Boolean&gt;</code>
wrapper around npm dependency & configuration file setup

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - success flag  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>Object</code> | config file's json |
| [initial] | <code>Boolean</code> | print message if not part of initial setup |
| [repoName] | <code>String</code> | if git URL was provided earlier, the repo name was extracted to use it for npm init |

<a name="Init._getMissingCredentials"></a>

### Init.\_getMissingCredentials(properties) ⇒ <code>Array.&lt;String&gt;</code>
finds credentials that are set up in config but not in auth file

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Array.&lt;String&gt;</code> - list of credential names  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>object</code> | javascript object in .mcdevrc.json |

<a name="Init.installDependencies"></a>

### Init.installDependencies([repoName]) ⇒ <code>Promise.&lt;Boolean&gt;</code>
initiates npm project and then
takes care of loading the pre-configured dependency list
from the boilerplate directory to them as dev-dependencies

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - install successful or error occured  

| Param | Type | Description |
| --- | --- | --- |
| [repoName] | <code>String</code> | if git URL was provided earlier, the repo name was extracted to use it for npm init |

<a name="Init._getDefaultPackageJson"></a>

### Init.\_getDefaultPackageJson([currentContent]) ⇒ <code>Promise.&lt;{script: Object, author: String, license: String}&gt;</code>
ensure we have certain default values in our config

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;{script: Object, author: String, license: String}&gt;</code> - extended currentContent  

| Param | Type | Description |
| --- | --- | --- |
| [currentContent] | <code>Object</code> | what was read from existing package.json file |

<a name="Init"></a>

## Init
CLI helper class

**Kind**: global constant  

* [Init](#Init)
    * [.fixMcdevConfig(properties)](#Init.fixMcdevConfig) ⇒ <code>Promise.&lt;Boolean&gt;</code>
    * [.createIdeConfigFiles()](#Init.createIdeConfigFiles) ⇒ <code>Promise.&lt;Boolean&gt;</code>
    * [._updateLeaf(propertiersCur, defaultPropsCur, fieldName)](#Init._updateLeaf) ⇒ <code>void</code>
    * [._createIdeConfigFile(fileNameArr, [fileContent])](#Init._createIdeConfigFile) ⇒ <code>Promise.&lt;Boolean&gt;</code>
    * [.initGitRepo([skipInteraction])](#Init.initGitRepo) ⇒ <code>Promise.&lt;{status:String, repoName:String}&gt;</code>
    * [.gitPush([skipInteraction])](#Init.gitPush) ⇒ <code>void</code>
    * [._addGitRemote([skipInteraction])](#Init._addGitRemote) ⇒ <code>String</code>
    * [._updateGitConfigUser([skipInteraction])](#Init._updateGitConfigUser) ⇒ <code>void</code>
    * [._getGitConfigUser()](#Init._getGitConfigUser) ⇒ <code>Promise.&lt;{&#x27;user.name&#x27;: String, &#x27;user.email&#x27;: String}&gt;</code>
    * [.initProject(properties, credentialsName, [skipInteraction])](#Init.initProject) ⇒ <code>Promise.&lt;void&gt;</code>
    * [._downloadAllBUs(bu, gitStatus, [skipInteraction])](#Init._downloadAllBUs) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.upgradeProject(properties, [initial], [repoName])](#Init.upgradeProject) ⇒ <code>Promise.&lt;Boolean&gt;</code>
    * [._getMissingCredentials(properties)](#Init._getMissingCredentials) ⇒ <code>Array.&lt;String&gt;</code>
    * [.installDependencies([repoName])](#Init.installDependencies) ⇒ <code>Promise.&lt;Boolean&gt;</code>
    * [._getDefaultPackageJson([currentContent])](#Init._getDefaultPackageJson) ⇒ <code>Promise.&lt;{script: Object, author: String, license: String}&gt;</code>

<a name="Init.fixMcdevConfig"></a>

### Init.fixMcdevConfig(properties) ⇒ <code>Promise.&lt;Boolean&gt;</code>
helper method for this.upgradeProject that upgrades project config if needed

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - returns true if worked without errors  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>Object</code> | config file's json |

<a name="Init.createIdeConfigFiles"></a>

### Init.createIdeConfigFiles() ⇒ <code>Promise.&lt;Boolean&gt;</code>
handles creation/update of all config file from the boilerplate

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - status of config file creation  
<a name="Init._updateLeaf"></a>

### Init.\_updateLeaf(propertiersCur, defaultPropsCur, fieldName) ⇒ <code>void</code>
recursive helper for _fixMcdevConfig that adds missing settings

**Kind**: static method of [<code>Init</code>](#Init)  

| Param | Type | Description |
| --- | --- | --- |
| propertiersCur | <code>Object</code> | current sub-object of project settings |
| defaultPropsCur | <code>Object</code> | current sub-object of default settings |
| fieldName | <code>String</code> | dot-concatenated object-path that needs adding |

<a name="Init._createIdeConfigFile"></a>

### Init.\_createIdeConfigFile(fileNameArr, [fileContent]) ⇒ <code>Promise.&lt;Boolean&gt;</code>
handles creation/update of one config file from the boilerplate at a time

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - install successful or error occured  

| Param | Type | Description |
| --- | --- | --- |
| fileNameArr | <code>Array.&lt;String&gt;</code> | 0: path, 1: filename, 2: extension with dot |
| [fileContent] | <code>String</code> | in case we cannot copy files 1:1 this can be used to pass in content |

<a name="Init.initGitRepo"></a>

### Init.initGitRepo([skipInteraction]) ⇒ <code>Promise.&lt;{status:String, repoName:String}&gt;</code>
check if git repo exists and otherwise create one

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;{status:String, repoName:String}&gt;</code> - success flag  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>Object</code> | signals what to insert automatically for things usually asked via wizard |
| skipInteraction.gitRemoteUrl | <code>String</code> | URL of Git remote server |

<a name="Init.gitPush"></a>

### Init.gitPush([skipInteraction]) ⇒ <code>void</code>
offer to push the new repo straight to the server

**Kind**: static method of [<code>Init</code>](#Init)  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>Boolean</code> \| <code>Object</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init._addGitRemote"></a>

### Init.\_addGitRemote([skipInteraction]) ⇒ <code>String</code>
offers to add the git remote origin

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>String</code> - repo name (optionally)  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>Object</code> | signals what to insert automatically for things usually asked via wizard |
| skipInteraction.gitRemoteUrl | <code>String</code> | URL of Git remote server |

<a name="Init._updateGitConfigUser"></a>

### Init.\_updateGitConfigUser([skipInteraction]) ⇒ <code>void</code>
checks global config and ask to config the user info and then store it locally

**Kind**: static method of [<code>Init</code>](#Init)  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>Object</code> \| <code>Boolean</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init._getGitConfigUser"></a>

### Init.\_getGitConfigUser() ⇒ <code>Promise.&lt;{&#x27;user.name&#x27;: String, &#x27;user.email&#x27;: String}&gt;</code>
retrieves the global user.name and user.email values

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;{&#x27;user.name&#x27;: String, &#x27;user.email&#x27;: String}&gt;</code> - user.name and user.email  
<a name="Init.initProject"></a>

### Init.initProject(properties, credentialsName, [skipInteraction]) ⇒ <code>Promise.&lt;void&gt;</code>
Creates template file for properties.json

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>Object</code> | config file's json |
| credentialsName | <code>string</code> | identifying name of the installed package / project |
| [skipInteraction] | <code>Object</code> | signals what to insert automatically for things usually asked via wizard |
| skipInteraction.clientId | <code>String</code> | client id of installed package |
| skipInteraction.clientSecret | <code>String</code> | client id of installed package |
| skipInteraction.tenant | <code>String</code> | client id of installed package |
| skipInteraction.credentialsName | <code>String</code> | how you would like the credential to be named |
| skipInteraction.gitRemoteUrl | <code>String</code> | URL of Git remote server |

<a name="Init._downloadAllBUs"></a>

### Init.\_downloadAllBUs(bu, gitStatus, [skipInteraction]) ⇒ <code>Promise.&lt;void&gt;</code>
helper for this.initProject()

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| bu | <code>String</code> | cred/bu or cred/* or * |
| gitStatus | <code>String</code> | signals what state the git repo is in |
| [skipInteraction] | <code>Boolean</code> \| <code>Object</code> | signals what to insert automatically for things usually asked via wizard |

<a name="Init.upgradeProject"></a>

### Init.upgradeProject(properties, [initial], [repoName]) ⇒ <code>Promise.&lt;Boolean&gt;</code>
wrapper around npm dependency & configuration file setup

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - success flag  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>Object</code> | config file's json |
| [initial] | <code>Boolean</code> | print message if not part of initial setup |
| [repoName] | <code>String</code> | if git URL was provided earlier, the repo name was extracted to use it for npm init |

<a name="Init._getMissingCredentials"></a>

### Init.\_getMissingCredentials(properties) ⇒ <code>Array.&lt;String&gt;</code>
finds credentials that are set up in config but not in auth file

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Array.&lt;String&gt;</code> - list of credential names  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>object</code> | javascript object in .mcdevrc.json |

<a name="Init.installDependencies"></a>

### Init.installDependencies([repoName]) ⇒ <code>Promise.&lt;Boolean&gt;</code>
initiates npm project and then
takes care of loading the pre-configured dependency list
from the boilerplate directory to them as dev-dependencies

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - install successful or error occured  

| Param | Type | Description |
| --- | --- | --- |
| [repoName] | <code>String</code> | if git URL was provided earlier, the repo name was extracted to use it for npm init |

<a name="Init._getDefaultPackageJson"></a>

### Init.\_getDefaultPackageJson([currentContent]) ⇒ <code>Promise.&lt;{script: Object, author: String, license: String}&gt;</code>
ensure we have certain default values in our config

**Kind**: static method of [<code>Init</code>](#Init)  
**Returns**: <code>Promise.&lt;{script: Object, author: String, license: String}&gt;</code> - extended currentContent  

| Param | Type | Description |
| --- | --- | --- |
| [currentContent] | <code>Object</code> | what was read from existing package.json file |

<a name="ET_Client"></a>

## ET\_Client : [<code>ET\_Client</code>](#ET_Client)
**Kind**: global constant  
<a name="Util"></a>

## Util
Util that contains logger and simple util methods

**Kind**: global constant  

* [Util](#Util)
    * [.logger](#Util.logger)
    * [.getDefaultProperties()](#Util.getDefaultProperties) ⇒ <code>object</code>
    * [.getRetrieveTypeChoices()](#Util.getRetrieveTypeChoices) ⇒ <code>Array.&lt;string&gt;</code>
    * [.checkProperties(properties, [silent])](#Util.checkProperties) ⇒ <code>boolean</code> \| <code>Array.&lt;String&gt;</code>
    * [.metadataLogger(level, type, method, payload, [source])](#Util.metadataLogger) ⇒ <code>void</code>
    * [.replaceByObject(str, obj)](#Util.replaceByObject) ⇒ <code>String</code> \| <code>Object</code>
    * [.inverseGet(objs, val)](#Util.inverseGet) ⇒ <code>String</code>
    * [.getMetadataHierachy(metadataTypes)](#Util.getMetadataHierachy) ⇒ <code>Array.&lt;String&gt;</code>
    * [.getETClient(buObject)](#Util.getETClient) ⇒ [<code>Promise.&lt;ET\_Client&gt;</code>](#ET_Client)
        * [~myClient](#Util.getETClient..myClient) : [<code>ET\_Client</code>](#ET_Client)
    * [.getFromCache(cache, metadataType, searchValue, searchField, returnField)](#Util.getFromCache) ⇒ <code>String</code>
    * [.resolveObjPath(path, obj)](#Util.resolveObjPath) ⇒ <code>any</code>
    * [.getListObjectIdFromCache(cache, listPathName, returnField)](#Util.getListObjectIdFromCache) ⇒ <code>String</code>
    * [.getListPathNameFromCache(cache, searchValue, searchField)](#Util.getListPathNameFromCache) ⇒ <code>String</code>
    * [.retryOnError(errorMsg, callback, [silentError], [retries])](#Util.retryOnError) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.execSync(cmd, [args])](#Util.execSync) ⇒ <code>undefined</code>

<a name="Util.logger"></a>

### Util.logger
Logger that creates timestamped log file in 'logs/' directory

**Kind**: static property of [<code>Util</code>](#Util)  
<a name="Util.getDefaultProperties"></a>

### Util.getDefaultProperties() ⇒ <code>object</code>
defines how the properties.json should look like
used for creating a template and for checking if variables are set

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>object</code> - default properties  
<a name="Util.getRetrieveTypeChoices"></a>

### Util.getRetrieveTypeChoices() ⇒ <code>Array.&lt;string&gt;</code>
helper for getDefaultProperties()

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>Array.&lt;string&gt;</code> - type choices  
<a name="Util.checkProperties"></a>

### Util.checkProperties(properties, [silent]) ⇒ <code>boolean</code> \| <code>Array.&lt;String&gt;</code>
check if the config file is correctly formatted and has values

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>boolean</code> \| <code>Array.&lt;String&gt;</code> - file structure ok OR list of fields to be fixed  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>object</code> | javascript object in .mcdevrc.json |
| [silent] | <code>boolean</code> | set to true for internal use w/o cli output |

<a name="Util.metadataLogger"></a>

### Util.metadataLogger(level, type, method, payload, [source]) ⇒ <code>void</code>
Logger helper for Metadata functions

**Kind**: static method of [<code>Util</code>](#Util)  

| Param | Type | Description |
| --- | --- | --- |
| level | <code>String</code> | of log (error, info, warn) |
| type | <code>String</code> | of metadata being referenced |
| method | <code>String</code> | name which log was called from |
| payload | <code>\*</code> | generic object which details the error |
| [source] | <code>String</code> | key/id of metadata which relates to error |

<a name="Util.replaceByObject"></a>

### Util.replaceByObject(str, obj) ⇒ <code>String</code> \| <code>Object</code>
replaces values in a JSON object string, based on a series of
key-value pairs (obj)

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>String</code> \| <code>Object</code> - replaced version of str  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>String</code> \| <code>Object</code> | JSON object or its stringified version, which has values to be replaced |
| obj | [<code>TemplateMap</code>](#TemplateMap) | key value object which contains keys to be replaced and values to be replaced with |

<a name="Util.inverseGet"></a>

### Util.inverseGet(objs, val) ⇒ <code>String</code>
get key of an object based on the first matching value

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>String</code> - key  

| Param | Type | Description |
| --- | --- | --- |
| objs | <code>Object</code> | object of objects to be searched |
| val | <code>String</code> | value to be searched for |

<a name="Util.getMetadataHierachy"></a>

### Util.getMetadataHierachy(metadataTypes) ⇒ <code>Array.&lt;String&gt;</code>
Returns Order in which metadata needs to be retrieved/deployed

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>Array.&lt;String&gt;</code> - retrieve/deploy order as array  

| Param | Type | Description |
| --- | --- | --- |
| metadataTypes | <code>Array.&lt;String&gt;</code> | which should be retrieved/deployed |

<a name="Util.getETClient"></a>

### Util.getETClient(buObject) ⇒ [<code>Promise.&lt;ET\_Client&gt;</code>](#ET_Client)
signs in with SFMC

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: [<code>Promise.&lt;ET\_Client&gt;</code>](#ET_Client) - auth object  

| Param | Type | Description |
| --- | --- | --- |
| buObject | <code>BuObject</code> | properties for auth |

<a name="Util.getETClient..myClient"></a>

#### getETClient~myClient : [<code>ET\_Client</code>](#ET_Client)
**Kind**: inner constant of [<code>getETClient</code>](#Util.getETClient)  
<a name="Util.getFromCache"></a>

### Util.getFromCache(cache, metadataType, searchValue, searchField, returnField) ⇒ <code>String</code>
standardized method for getting data from cache.

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>String</code> - unique user definable metadata key (usually external/customer key)  

| Param | Type | Description |
| --- | --- | --- |
| cache | <code>Object</code> | data retrieved from sfmc instance |
| metadataType | <code>String</code> | metadata type ie. query |
| searchValue | <code>String</code> | unique identifier of metadata being looked for |
| searchField | <code>String</code> | field name (key in object) which contains the unique identifer |
| returnField | <code>String</code> | field which should be returned |

<a name="Util.resolveObjPath"></a>

### Util.resolveObjPath(path, obj) ⇒ <code>any</code>
let's you dynamically walk down an object and get a value

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>any</code> - value of obj.path  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>String</code> | 'fieldA.fieldB.fieldC' |
| obj | <code>Object</code> | some parent object |

<a name="Util.getListObjectIdFromCache"></a>

### Util.getListObjectIdFromCache(cache, listPathName, returnField) ⇒ <code>String</code>
standardized method for getting data from cache - adapted for special case of lists
! keeping this in util/util.js rather than in metadataTypes/List.js to avoid potential circular dependencies

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>String</code> - unique ObjectId of list  

| Param | Type | Description |
| --- | --- | --- |
| cache | <code>Object</code> | data retrieved from sfmc instance |
| listPathName | <code>String</code> | folderPath/ListName combo of list |
| returnField | <code>String</code> | ObjectID or ID |

<a name="Util.getListPathNameFromCache"></a>

### Util.getListPathNameFromCache(cache, searchValue, searchField) ⇒ <code>String</code>
standardized method for getting data from cache - adapted for special case of lists
! keeping this in util/util.js rather than in metadataTypes/List.js to avoid potential circular dependencies

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>String</code> - unique folderPath/ListName combo of list  

| Param | Type | Description |
| --- | --- | --- |
| cache | <code>Object</code> | data retrieved from sfmc instance |
| searchValue | <code>String</code> | unique identifier of metadata being looked for |
| searchField | <code>String</code> | ObjectID or ID |

<a name="Util.retryOnError"></a>

### Util.retryOnError(errorMsg, callback, [silentError], [retries]) ⇒ <code>Promise.&lt;void&gt;</code>
retry on network issues

**Kind**: static method of [<code>Util</code>](#Util)  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| errorMsg | <code>String</code> |  | what to print behind "Connection error. " |
| callback | <code>function</code> |  | what to try executing |
| [silentError] | <code>Boolean</code> | <code>false</code> | prints retry messages to log only; default=false |
| [retries] | <code>Number</code> | <code>1</code> | number of retries; default=1 |

<a name="Util.execSync"></a>

### Util.execSync(cmd, [args]) ⇒ <code>undefined</code>
helper to run other commands as if run manually by user

**Kind**: static method of [<code>Util</code>](#Util)  

| Param | Type | Description |
| --- | --- | --- |
| cmd | <code>string</code> | to be executed command |
| [args] | <code>Array.&lt;string&gt;</code> | list of arguments |

<a name="createDeltaPkg"></a>

## createDeltaPkg(argv) ⇒ <code>void</code>
handler for 'mcdev createDeltaPkg

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| argv | <code>Object</code> | yargs parameters |
| [argv.range] | <code>String</code> | git commit range into deploy directory |
| [argv.filter] | <code>String</code> | filter file paths that start with any |
| [argv.skipInteraction] | <code>Boolean</code> | allows to skip interactive wizard |

<a name="_setLoggingLevel"></a>

## \_setLoggingLevel(argv) ⇒ <code>void</code>
configures what is displayed in the console

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| argv | <code>object</code> | list of command line parameters given by user |
| [argv.silent] | <code>Boolean</code> | only errors printed to CLI |
| [argv.verbose] | <code>Boolean</code> | chatty user CLI output |
| [argv.debug] | <code>Boolean</code> | enables developer output & features |

<a name="selectTypes"></a>

## selectTypes() ⇒ <code>Promise</code>
**Kind**: global function  
**Returns**: <code>Promise</code> - .  
<a name="explainTypes"></a>

## explainTypes() ⇒ <code>Promise</code>
**Kind**: global function  
**Returns**: <code>Promise</code> - .  
<a name="upgrade"></a>

## upgrade([skipInteraction]) ⇒ <code>Promise</code>
**Kind**: global function  
**Returns**: <code>Promise</code> - .  

| Param | Type | Description |
| --- | --- | --- |
| [skipInteraction] | <code>Boolean</code> \| <code>Object</code> | signals what to insert automatically for things usually asked via wizard |

<a name="retrieve"></a>

## retrieve(businessUnit, [selectedType]) ⇒ <code>Promise.&lt;void&gt;</code>
Retrieve all metadata from the specified business unit into the local file system.

**Kind**: global function  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| businessUnit | <code>String</code> | references credentials from properties.json |
| [selectedType] | <code>String</code> | limit retrieval to given metadata type |

<a name="_retrieveBU"></a>

## \_retrieveBU(cred, bu, [selectedType]) ⇒ <code>Promise</code>
helper for retrieve()

**Kind**: global function  
**Returns**: <code>Promise</code> - ensure that BUs are worked on sequentially  

| Param | Type | Description |
| --- | --- | --- |
| cred | <code>String</code> | name of Credential |
| bu | <code>String</code> | name of BU |
| [selectedType] | <code>String</code> | limit retrieval to given metadata type/subtype |

<a name="_deployBU"></a>

## \_deployBU(cred, bu, [type]) ⇒ <code>Promise</code>
helper for deploy()

**Kind**: global function  
**Returns**: <code>Promise</code> - ensure that BUs are worked on sequentially  

| Param | Type | Description |
| --- | --- | --- |
| cred | <code>String</code> | name of Credential |
| bu | <code>String</code> | name of BU |
| [type] | <code>String</code> | limit deployment to given metadata type |

<a name="deploy"></a>

## deploy(businessUnit, [selectedType]) ⇒ <code>Promise.&lt;void&gt;</code>
Deploys all metadata located in the 'deploy' directory to the specified business unit

**Kind**: global function  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| businessUnit | <code>String</code> | references credentials from properties.json |
| [selectedType] | <code>String</code> | limit deployment to given metadata type |

<a name="initProject"></a>

## initProject([credentialsName], [skipInteraction]) ⇒ <code>Promise.&lt;void&gt;</code>
Creates template file for properties.json

**Kind**: global function  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| [credentialsName] | <code>string</code> | identifying name of the installed package / project |
| [skipInteraction] | <code>Boolean</code> \| <code>Object</code> | signals what to insert automatically for things usually asked via wizard |

<a name="findBUs"></a>

## findBUs(credentialsName) ⇒ <code>Promise.&lt;void&gt;</code>
Refreshes BU names and ID's from MC instance

**Kind**: global function  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| credentialsName | <code>string</code> | identifying name of the installed package / project |

<a name="document"></a>

## document(businessUnit, type) ⇒ <code>Promise.&lt;void&gt;</code>
Creates docs for supported metadata types in Markdown and/or HTML format

**Kind**: global function  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| businessUnit | <code>String</code> | references credentials from properties.json |
| type | <code>String</code> | metadata type |

<a name="deleteByKey"></a>

## deleteByKey(businessUnit, type, customerKey) ⇒ <code>Promise.&lt;void&gt;</code>
Creates docs for supported metadata types in Markdown and/or HTML format

**Kind**: global function  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| businessUnit | <code>String</code> | references credentials from properties.json |
| type | <code>String</code> | supported metadata type |
| customerKey | <code>String</code> | Identifier of data extension |

<a name="badKeys"></a>

## badKeys(businessUnit) ⇒ <code>Promise.&lt;void&gt;</code>
Converts metadata to legacy format. Output is saved in 'converted' directory

**Kind**: global function  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| businessUnit | <code>String</code> | references credentials from properties.json |

<a name="retrieveAsTemplate"></a>

## retrieveAsTemplate(businessUnit, selectedType, name, market) ⇒ <code>Promise.&lt;void&gt;</code>
Retrieve a specific metadata file and templatise.

**Kind**: global function  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| businessUnit | <code>String</code> | references credentials from properties.json |
| selectedType | <code>String</code> | supported metadata type |
| name | <code>String</code> | name of the metadata |
| market | <code>String</code> | market which should be used to revert template |

<a name="buildDefinition"></a>

## buildDefinition(businessUnit, type, name, market) ⇒ <code>Promise.&lt;void&gt;</code>
Build a specific metadata file based on a template.

**Kind**: global function  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| businessUnit | <code>String</code> | references credentials from properties.json |
| type | <code>String</code> | supported metadata type |
| name | <code>String</code> | name of the metadata |
| market | <code>String</code> | market localizations |

<a name="_checkMarket"></a>

## \_checkMarket(market) ⇒ <code>Boolean</code>
check if a market name exists in current mcdev config

**Kind**: global function  
**Returns**: <code>Boolean</code> - found market or not  

| Param | Type | Description |
| --- | --- | --- |
| market | <code>String</code> | market localizations |

<a name="buildDefinitionBulk"></a>

## buildDefinitionBulk(listName, type, name) ⇒ <code>Promise.&lt;void&gt;</code>
Build a specific metadata file based on a template using a list of bu-market combos

**Kind**: global function  
**Returns**: <code>Promise.&lt;void&gt;</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| listName | <code>String</code> | name of list of BU-market combos |
| type | <code>String</code> | supported metadata type |
| name | <code>String</code> | name of the metadata |

<a name="createNewLoggerTransport"></a>

## createNewLoggerTransport() ⇒ <code>object</code>
wrapper around our standard winston logging to console and logfile

**Kind**: global function  
**Returns**: <code>object</code> - initiated logger for console and file  
<a name="startLogger"></a>

## startLogger() ⇒ <code>void</code>
initiate winston logger

**Kind**: global function  
<a name="CodeExtractItem"></a>

## CodeExtractItem : <code>Object.&lt;string, any&gt;</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| json | <code>AssetItem</code> | metadata of one item w/o code |
| codeArr | <code>Array.&lt;MetadataType.CodeExtract&gt;</code> | list of code snippets in this item |
| subFolder | <code>Array.&lt;string&gt;</code> | mostly set to null, otherwise list of subfolders |

<a name="AutomationMap"></a>

## AutomationMap : <code>Object</code>
REST format

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | name (not key) of activity |
| [objectTypeId] | <code>string</code> | Id of assoicated activity type; see this.definition.activityTypeMapping |
| [activityObjectId] | <code>string</code> | Object Id of assoicated metadata item |
| displayOrder | <code>number</code> | order within step; starts with 1 or higher number |
| r__type | <code>string</code> | see this.definition.activityTypeMapping |
| name | <code>string</code> | description |
| [annotation] | <code>string</code> | equals AutomationStep.name |
| step | <code>number</code> | step iterator |
| [stepNumber] | <code>number</code> | step iterator, automatically set during deployment |
| activities | <code>Array.&lt;AutomationActivity&gt;</code> | - |
| typeId | <code>number</code> | ? |
| startDate | <code>string</code> | example: '2021-05-07T09:00:00' |
| endDate | <code>string</code> | example: '2021-05-07T09:00:00' |
| icalRecur | <code>string</code> | example: 'FREQ=DAILY;UNTIL=20790606T160000;INTERVAL=1' |
| timezoneName | <code>string</code> | example: 'W. Europe Standard Time'; see this.definition.timeZoneMapping |
| [timezoneId] | <code>number</code> | see this.definition.timeZoneMapping |
| Recurrence | <code>Object</code> | - |
| Recurrence.$ | <code>Object</code> | {'xsi:type': keyStem + 'lyRecurrence'} |
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
| TimeZone | <code>Object</code> | - |
| TimeZone.ID | <code>number</code> | AutomationSchedule.timezoneId |
| _timezoneString | <code>string</code> | internal variable for CLI output only |
| StartDateTime | <code>string</code> | AutomationSchedule.startDate |
| EndDateTime | <code>string</code> | AutomationSchedule.endDate |
| _StartDateTime | <code>string</code> | AutomationSchedule.startDate; internal variable for CLI output only |
| RecurrenceRangeType | <code>&#x27;EndOn&#x27;</code> \| <code>&#x27;EndAfter&#x27;</code> | set to 'EndOn' if AutomationSchedule.icalRecur contains 'UNTIL'; otherwise to 'EndAfter' |
| Occurrences | <code>number</code> | only exists if RecurrenceRangeType=='EndAfter' |
| [id] | <code>string</code> | Object Id |
| key | <code>string</code> | key |
| name | <code>string</code> | name |
| description | <code>string</code> | - |
| type | <code>&#x27;scheduled&#x27;</code> \| <code>&#x27;triggered&#x27;</code> | Starting Source = Schedule / File Drop |
| status | <code>&#x27;Scheduled&#x27;</code> \| <code>&#x27;Running&#x27;</code> | - |
| [schedule] | <code>AutomationSchedule</code> | only existing if type=scheduled |
| [fileTrigger] | <code>Object</code> | only existing if type=triggered |
| fileTrigger.fileNamingPattern | <code>string</code> | - |
| fileTrigger.fileNamePatternTypeId | <code>string</code> | - |
| fileTrigger.folderLocationText | <code>string</code> | - |
| fileTrigger.queueFiles | <code>string</code> | - |
| [startSource] | <code>Object</code> | - |
| [startSource.schedule] | <code>AutomationSchedule</code> | rewritten to AutomationItem.schedule |
| [startSource.fileDrop] | <code>Object</code> | rewritten to AutomationItem.fileTrigger |
| startSource.fileDrop.fileNamingPattern | <code>string</code> | - |
| startSource.fileDrop.fileNamePatternTypeId | <code>string</code> | - |
| startSource.fileDrop.folderLocation | <code>string</code> | - |
| startSource.fileDrop.queueFiles | <code>string</code> | - |
| startSource.typeId | <code>number</code> | - |
| steps | <code>Array.&lt;AutomationStep&gt;</code> | - |
| r__folder_Path | <code>string</code> | folder path |
| [categoryId] | <code>string</code> | holds folder ID, replaced with r__folder_Path during retrieve |

<a name="DataExtensionMap"></a>

## DataExtensionMap : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| CustomerKey | <code>string</code> | key |
| Name | <code>string</code> | name |
| Description | <code>string</code> | - |
| IsSendable | <code>&#x27;true&#x27;</code> \| <code>&#x27;false&#x27;</code> | - |
| IsTestable | <code>&#x27;true&#x27;</code> \| <code>&#x27;false&#x27;</code> | - |
| SendableDataExtensionField | <code>Object</code> | - |
| SendableDataExtensionField.Name | <code>string</code> | - |
| SendableSubscriberField | <code>Object</code> | - |
| SendableSubscriberField.Name | <code>string</code> | - |
| Fields | <code>Array.&lt;DataExtensionField.DataExtensionFieldItem&gt;</code> | list of DE fields |
| r__folder_ContentType | <code>&#x27;dataextension&#x27;</code> \| <code>&#x27;salesforcedataextension&#x27;</code> \| <code>&#x27;synchronizeddataextension&#x27;</code> \| <code>&#x27;shared\_dataextension&#x27;</code> \| <code>&#x27;shared\_salesforcedataextension&#x27;</code> | retrieved from associated folder |
| r__folder_Path | <code>string</code> | folder path in which this DE is saved |
| [CategoryID] | <code>string</code> | holds folder ID, replaced with r__folder_Path during retrieve |
| [r__dataExtensionTemplate_Name] | <code>string</code> | name of optionally associated DE template |
| [Template] | <code>Object</code> | - |
| [Template.CustomerKey] | <code>string</code> | key of optionally associated DE teplate |

<a name="DataExtensionFieldMap"></a>

## DataExtensionFieldMap : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [ObjectID] | <code>string</code> | id |
| [CustomerKey] | <code>string</code> | key |
| [DataExtension] | <code>Object</code> | - |
| DataExtension.CustomerKey | <code>string</code> | key of DE |
| Name | <code>string</code> | name |
| [Name_new] | <code>string</code> | custom attribute that is only used when trying to rename a field from Name to Name_new |
| DefaultValue | <code>string</code> | - |
| IsRequired | <code>&#x27;true&#x27;</code> \| <code>&#x27;false&#x27;</code> | - |
| IsPrimaryKey | <code>&#x27;true&#x27;</code> \| <code>&#x27;false&#x27;</code> | - |
| Ordinal | <code>string</code> | 1, 2, 3, ... |
| FieldType | <code>&#x27;Text&#x27;</code> \| <code>&#x27;Date&#x27;</code> \| <code>&#x27;Number&#x27;</code> \| <code>&#x27;Decimal&#x27;</code> \| <code>&#x27;Email&#x27;</code> | type of data in this field; API fails if field is provided during an update |

<a name="MultiMetadataTypeMap"></a>

## MultiMetadataTypeMap : <code>Object.&lt;string, any&gt;</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| json | <code>MetadataTypeItem</code> | metadata of one item w/o code |
| codeArr | <code>Array.&lt;CodeExtract&gt;</code> | list of code snippets in this item |
| subFolder | <code>Array.&lt;string&gt;</code> | mostly set to null, otherwise list of subfolders |
| subFolder | <code>Array.&lt;string&gt;</code> | mostly set to null, otherwise subfolders path split into elements |
| fileName | <code>string</code> | name of file w/o extension |
| fileExt | <code>string</code> | file extension |
| content | <code>string</code> | file content |
| [encoding] | <code>&#x27;base64&#x27;</code> | optional for binary files |

<a name="CodeExtractItem"></a>

## CodeExtractItem : <code>Object</code>
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
| codeArr | <code>Array.&lt;MetadataType.CodeExtract&gt;</code> | list of code snippets in this item |
| subFolder | <code>Array.&lt;string&gt;</code> | mostly set to null, otherwise list of subfolders |

<a name="CodeExtractItem"></a>

## CodeExtractItem : <code>Object</code>
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
| json | <code>ScriptItem</code> | metadata of one item w/o code |
| codeArr | <code>Array.&lt;MetadataType.CodeExtract&gt;</code> | list of code snippets in this item |
| subFolder | <code>Array.&lt;string&gt;</code> | mostly set to null, otherwise list of subfolders |

<a name="TemplateMap"></a>

## TemplateMap : <code>Object.&lt;string, string&gt;</code>
**Kind**: global typedef  
