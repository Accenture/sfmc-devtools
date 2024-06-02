export default Mcdev;
export type BuObject = import('../types/mcdev.d.js').BuObject;
export type CodeExtract = import('../types/mcdev.d.js').CodeExtract;
export type CodeExtractItem = import('../types/mcdev.d.js').CodeExtractItem;
export type DeltaPkgItem = import('../types/mcdev.d.js').DeltaPkgItem;
export type Mcdevrc = import('../types/mcdev.d.js').Mcdevrc;
export type MetadataTypeItem = import('../types/mcdev.d.js').MetadataTypeItem;
export type MetadataTypeItemDiff = import('../types/mcdev.d.js').MetadataTypeItemDiff;
export type MetadataTypeItemObj = import('../types/mcdev.d.js').MetadataTypeItemObj;
export type MetadataTypeMap = import('../types/mcdev.d.js').MetadataTypeMap;
export type MetadataTypeMapObj = import('../types/mcdev.d.js').MetadataTypeMapObj;
export type MultiMetadataTypeList = import('../types/mcdev.d.js').MultiMetadataTypeList;
export type MultiMetadataTypeMap = import('../types/mcdev.d.js').MultiMetadataTypeMap;
export type SkipInteraction = import('../types/mcdev.d.js').SkipInteraction;
export type SoapRequestParams = import('../types/mcdev.d.js').SoapRequestParams;
export type TemplateMap = import('../types/mcdev.d.js').TemplateMap;
export type TypeKeyCombo = import('../types/mcdev.d.js').TypeKeyCombo;
export type ExplainType = import('../types/mcdev.d.js').ExplainType;
export type ContentBlockConversionTypes = import('../types/mcdev.d.js').ContentBlockConversionTypes;
/**
 * @typedef {import('../types/mcdev.d.js').BuObject} BuObject
 * @typedef {import('../types/mcdev.d.js').CodeExtract} CodeExtract
 * @typedef {import('../types/mcdev.d.js').CodeExtractItem} CodeExtractItem
 * @typedef {import('../types/mcdev.d.js').DeltaPkgItem} DeltaPkgItem
 * @typedef {import('../types/mcdev.d.js').Mcdevrc} Mcdevrc
 * @typedef {import('../types/mcdev.d.js').MetadataTypeItem} MetadataTypeItem
 * @typedef {import('../types/mcdev.d.js').MetadataTypeItemDiff} MetadataTypeItemDiff
 * @typedef {import('../types/mcdev.d.js').MetadataTypeItemObj} MetadataTypeItemObj
 * @typedef {import('../types/mcdev.d.js').MetadataTypeMap} MetadataTypeMap
 * @typedef {import('../types/mcdev.d.js').MetadataTypeMapObj} MetadataTypeMapObj
 * @typedef {import('../types/mcdev.d.js').MultiMetadataTypeList} MultiMetadataTypeList
 * @typedef {import('../types/mcdev.d.js').MultiMetadataTypeMap} MultiMetadataTypeMap
 * @typedef {import('../types/mcdev.d.js').SkipInteraction} SkipInteraction
 * @typedef {import('../types/mcdev.d.js').SoapRequestParams} SoapRequestParams
 * @typedef {import('../types/mcdev.d.js').TemplateMap} TemplateMap
 * @typedef {import('../types/mcdev.d.js').TypeKeyCombo} TypeKeyCombo
 * @typedef {import('../types/mcdev.d.js').ExplainType} ExplainType
 * @typedef {import('../types/mcdev.d.js').ContentBlockConversionTypes} ContentBlockConversionTypes
 */
/**
 * main class
 */
declare class Mcdev {
    /**
     * @returns {string} current version of mcdev
     */
    static version(): string;
    /**
     * helper method to use unattended mode when including mcdev as a package
     *
     * @param {SkipInteraction} [skipInteraction] signals what to insert automatically for things usually asked via wizard
     * @returns {void}
     */
    static setSkipInteraction(skipInteraction?: SkipInteraction): void;
    /**
     * configures what is displayed in the console
     *
     * @param {object} argv list of command line parameters given by user
     * @param {boolean} [argv.silent] only errors printed to CLI
     * @param {boolean} [argv.verbose] chatty user CLI output
     * @param {boolean} [argv.debug] enables developer output & features
     * @returns {void}
     */
    static setLoggingLevel(argv: {
        silent?: boolean;
        verbose?: boolean;
        debug?: boolean;
    }): void;
    /**
     * allows setting system wide / command related options
     *
     * @param {object} argv list of command line parameters given by user
     * @returns {void}
     */
    static setOptions(argv: object): void;
    /**
     * handler for 'mcdev createDeltaPkg
     *
     * @param {object} argv yargs parameters
     * @param {string} [argv.range] git commit range
    into deploy directory
     * @param {string} [argv.filter] filter file paths that start with any
     * @param {number} [argv.commitHistory] filter file paths that start with any
     * @param {DeltaPkgItem[]} [argv.diffArr] list of files to include in delta package (skips git diff when provided)
     * @returns {Promise.<DeltaPkgItem[]>} list of changed items
     */
    static createDeltaPkg(argv: {
        range?: string;
        filter?: string;
        commitHistory?: number;
        diffArr?: DeltaPkgItem[];
    }): Promise<DeltaPkgItem[]>;
    /**
     * @returns {Promise} .
     */
    static selectTypes(): Promise<any>;
    /**
     * @returns {ExplainType[]} list of supported types with their apiNames
     */
    static explainTypes(): ExplainType[];
    /**
     * @returns {Promise.<boolean>} success flag
     */
    static upgrade(): Promise<boolean>;
    /**
     * helper to show an off-the-logs message to users
     */
    static "__#7@#welcomeMessage"(): void;
    /**
     * Retrieve all metadata from the specified business unit into the local file system.
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {string[] | TypeKeyCombo} [selectedTypesArr] limit retrieval to given metadata type
     * @param {string[]} [keys] limit retrieval to given metadata key
     * @param {boolean} [changelogOnly] skip saving, only create json in memory
     * @returns {Promise.<object>} -
     */
    static retrieve(businessUnit: string, selectedTypesArr?: string[] | TypeKeyCombo, keys?: string[], changelogOnly?: boolean): Promise<object>;
    /**
     * helper for {@link Mcdev.retrieve}
     *
     * @param {string} cred name of Credential
     * @param {string} bu name of BU
     * @param {string[] | TypeKeyCombo} [selectedTypesArr] limit retrieval to given metadata type/subtype
     * @param {string[]} [keys] limit retrieval to given metadata key
     * @param {boolean} [changelogOnly] skip saving, only create json in memory
     * @returns {Promise.<object>} ensure that BUs are worked on sequentially
     */
    static "__#7@#retrieveBU"(cred: string, bu: string, selectedTypesArr?: string[] | TypeKeyCombo, keys?: string[], changelogOnly?: boolean): Promise<object>;
    /**
     * Deploys all metadata located in the 'deploy' directory to the specified business unit
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {string[] | TypeKeyCombo} [selectedTypesArr] limit deployment to given metadata type
     * @param {string[]} [keyArr] limit deployment to given metadata keys
     * @returns {Promise.<Object.<string, MultiMetadataTypeMap>>} deployed metadata per BU (first key: bu name, second key: metadata type)
     */
    static deploy(businessUnit: string, selectedTypesArr?: string[] | TypeKeyCombo, keyArr?: string[]): Promise<{
        [x: string]: MultiMetadataTypeMap;
    }>;
    /**
     * Creates template file for properties.json
     *
     * @param {string} [credentialsName] identifying name of the installed package / project
     * @returns {Promise.<void>} -
     */
    static initProject(credentialsName?: string): Promise<void>;
    /**
     * Clones an existing project from git repository and installs it
     *
     * @returns {Promise.<void>} -
     */
    static joinProject(): Promise<void>;
    /**
     * Refreshes BU names and ID's from MC instance
     *
     * @param {string} credentialsName identifying name of the installed package / project
     * @returns {Promise.<void>} -
     */
    static findBUs(credentialsName: string): Promise<void>;
    /**
     * Creates docs for supported metadata types in Markdown and/or HTML format
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {string} type metadata type
     * @returns {Promise.<void>} -
     */
    static document(businessUnit: string, type: string): Promise<void>;
    /**
     * deletes metadata from MC instance by key
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {string} type supported metadata type
     * @param {string} customerKey Identifier of metadata
     * @returns {Promise.<boolean>} true if successful, false otherwise
     */
    static deleteByKey(businessUnit: string, type: string, customerKey: string): Promise<boolean>;
    /**
     * get name & key for provided id
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {string} type supported metadata type
     * @param {string} id Identifier of metadata
     * @returns {Promise.<{key:string, name:string, path:string}>} key, name and path of metadata; null if not found
     */
    static resolveId(businessUnit: string, type: string, id: string): Promise<{
        key: string;
        name: string;
        path: string;
    }>;
    /**
     * ensures triggered sends are restarted to ensure they pick up on changes of the underlying emails
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {string} type references credentials from properties.json
     * @param {string[]} [keyArr] metadata keys
     * @returns {Promise.<void>} -
     */
    static refresh(businessUnit: string, type: string, keyArr?: string[]): Promise<void>;
    /**
     * Converts metadata to legacy format. Output is saved in 'converted' directory
     *
     * @param {string} businessUnit references credentials from properties.json
     * @returns {Promise.<void>} -
     */
    static badKeys(businessUnit: string): Promise<void>;
    /**
     * Retrieve a specific metadata file and templatise.
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {string} selectedType supported metadata type
     * @param {string[]} name name of the metadata
     * @param {string} market market which should be used to revert template
     * @returns {Promise.<MultiMetadataTypeList>} -
     */
    static retrieveAsTemplate(businessUnit: string, selectedType: string, name: string[], market: string): Promise<MultiMetadataTypeList>;
    /**
     * Build a template based on a list of metadata files in the retrieve folder.
     *
     * @param {string} businessUnitTemplate references credentials from properties.json
     * @param {string} businessUnitDefinition references credentials from properties.json
     * @param {TypeKeyCombo} typeKeyCombo limit retrieval to given metadata type
     * @param {string} marketTemplate market localizations
     * @param {string} marketDefinition market localizations
     * @param {boolean} [bulk] runs buildDefinitionBulk instead of buildDefinition; requires marketList to be defined and given via marketDefinition
     * @returns {Promise.<MultiMetadataTypeList | object>} response from buildDefinition
     */
    static build(businessUnitTemplate: string, businessUnitDefinition: string, typeKeyCombo: TypeKeyCombo, marketTemplate: string, marketDefinition: string, bulk?: boolean): Promise<MultiMetadataTypeList | object>;
    /**
     * Build a template based on a list of metadata files in the retrieve folder.
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {string | TypeKeyCombo} selectedTypes limit retrieval to given metadata type
     * @param {string[]} keyArr customerkey of the metadata
     * @param {string} market market localizations
     * @returns {Promise.<MultiMetadataTypeList>} -
     */
    static buildTemplate(businessUnit: string, selectedTypes: string | TypeKeyCombo, keyArr: string[], market: string): Promise<MultiMetadataTypeList>;
    /**
     * Build a specific metadata file based on a template.
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {string | TypeKeyCombo} selectedTypes limit retrieval to given metadata type
     * @param {string[]} nameArr name of the metadata
     * @param {string} market market localizations
     * @returns {Promise.<MultiMetadataTypeList>} -
     */
    static buildDefinition(businessUnit: string, selectedTypes: string | TypeKeyCombo, nameArr: string[], market: string): Promise<MultiMetadataTypeList>;
    /**
     * Build a specific metadata file based on a template using a list of bu-market combos
     *
     * @param {string} listName name of list of BU-market combos
     * @param {string | TypeKeyCombo} selectedTypes supported metadata type
     * @param {string[]} [nameArr] name of the metadata
     * @returns {Promise.<object>} -
     */
    static buildDefinitionBulk(listName: string, selectedTypes: string | TypeKeyCombo, nameArr?: string[]): Promise<object>;
    /**
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {string} selectedType supported metadata type
     * @param {string[]} keyArr customerkey of the metadata
     * @returns {Promise.<string[]>} list of all files that need to be committed in a flat array ['path/file1.ext', 'path/file2.ext']
     */
    static getFilesToCommit(businessUnit: string, selectedType: string, keyArr: string[]): Promise<string[]>;
    /**
     * Schedule an item (shortcut for execute --schedule)
     *
     * @param {string} businessUnit name of BU
     * @param {string} [selectedType] limit to given metadata types
     * @param {string[]} [keys] customerkey of the metadata
     * @returns {Promise.<Object.<string, string[]>>} key: business unit name, value: list of scheduled item keys
     */
    static schedule(businessUnit: string, selectedType?: string, keys?: string[]): Promise<{
        [x: string]: string[];
    }>;
    /**
     * Start/execute an item
     *
     * @param {string} businessUnit name of BU
     * @param {string} [selectedType] limit to given metadata types
     * @param {string[]} [keys] customerkey of the metadata
     * @returns {Promise.<Object.<string, string[]>>} key: business unit name, value: list of executed item keys
     */
    static execute(businessUnit: string, selectedType?: string, keys?: string[]): Promise<{
        [x: string]: string[];
    }>;
    /**
     * pause an item
     *
     * @param {string} businessUnit name of BU
     * @param {string} [selectedType] limit to given metadata types
     * @param {string[]} [keys] customerkey of the metadata
     * @returns {Promise.<Object.<string, string[]>>} key: business unit name, value: list of paused item keys
     */
    static pause(businessUnit: string, selectedType?: string, keys?: string[]): Promise<{
        [x: string]: string[];
    }>;
    /**
     * Updates the key to match the name field
     *
     * @param {string} businessUnit name of BU
     * @param {TypeKeyCombo} selectedTypesArr limit retrieval to given metadata type
     * @param {string} to what to replace with
     * @param {string[]} [fromList] what to replace
     * @returns {Promise.<Object.<string, object>>} key1: business unit name, key2:type value: list of fixed item keys
     */
    static replaceCbReference(businessUnit: string, selectedTypesArr: TypeKeyCombo, to: string, fromList?: string[]): Promise<{
        [x: string]: object;
    }>;
    /**
     * Updates the key to match the name field
     *
     * @param {string} businessUnit name of BU
     * @param {string[] | TypeKeyCombo} selectedTypesArr limit retrieval to given metadata type
     * @param {string[]} [keys] customerkey of the metadata
     * @returns {Promise.<Object.<string, object>>} key1: business unit name, key2:type value: list of fixed item keys
     */
    static fixKeys(businessUnit: string, selectedTypesArr: string[] | TypeKeyCombo, keys?: string[]): Promise<{
        [x: string]: object;
    }>;
    /**
     * run a method across BUs
     *
     * @param {'execute'|'pause'|'fixKeys'|'replaceCbReference'} methodName what to run
     * @param {string} businessUnit name of BU
     * @param {string} [selectedType] limit to given metadata types
     * @param {string[]} [keys] customerkey of the metadata
     * @returns {Promise.<Object.<string, string[]>>} key: business unit name, value: list of affected item keys
     */
    static "__#7@#runMethod"(methodName: 'execute' | 'pause' | 'fixKeys' | 'replaceCbReference', businessUnit: string, selectedType?: string, keys?: string[]): Promise<{
        [x: string]: string[];
    }>;
    /**
     * helper for Mcdev.#runMethod
     *
     * @param {'execute'|'pause'|'fixKeys'|'replaceCbReference'} methodName what to run
     * @param {string} cred name of Credential
     * @param {string} bu name of BU
     * @param {string} [type] limit execution to given metadata type
     * @param {string[]} [keyArr] customerkey of the metadata
     * @returns {Promise.<string[]>} list of keys that were affected
     */
    static "__#7@#runOnBU"(methodName: 'execute' | 'pause' | 'fixKeys' | 'replaceCbReference', cred: string, bu: string, type?: string, keyArr?: string[]): Promise<string[]>;
    /**
     * helper for Mcdev.#runOnBU
     *
     * @param {string} selectedType limit execution to given metadata type
     * @param {BuObject} buObject properties for auth
     * @returns {Promise.<string[]>} keyArr
     */
    static "__#7@#retrieveKeysWithLike"(selectedType: string, buObject: BuObject): Promise<string[]>;
    /**
     * Updates the key to match the name field
     *
     * @param {string} cred name of Credential
     * @param {string} bu name of BU
     * @param {string} type limit execution to given metadata type
     * @param {string[]} [keyArr] customerkey of the metadata
     * @returns {Promise.<string[]>} list of keys that were affected
     */
    static "__#7@#fixKeys"(cred: string, bu: string, type: string, keyArr?: string[]): Promise<string[]>;
    /**
     * Updates the key to match the name field
     *
     * @param {string} cred name of Credential
     * @param {string} bu name of BU
     * @param {string} type limit execution to given metadata type
     * @param {string[]} [keyArr] customerkey of the metadata
     * @returns {Promise.<string[]>} list of keys that were affected
     */
    static "__#7@#replaceCbReference"(cred: string, bu: string, type: string, keyArr?: string[]): Promise<string[]>;
    /**
     * helper to convert CSVs into an array. if only one value was given, it's also returned as an array
     *
     * @param {string|string[]} metadataOption potentially comma-separated value or null
     * @param {string[]} [allowedIdentifiers] 'key', 'id', 'name'
     * @param {boolean} [firstOnly] removes all but the first entry if enabled
     * @returns {TypeKeyCombo} values split into an array.
     */
    static metadataToTypeKey(metadataOption: string | string[], allowedIdentifiers?: string[], firstOnly?: boolean): TypeKeyCombo;
}
//# sourceMappingURL=index.d.ts.map