export namespace Util {
    let authFileName: string;
    let boilerplateDirectory: string;
    let configFileName: string;
    let defaultGitBranch: string;
    let parentBuName: string;
    let standardizedSplitChar: string;
    let skipInteraction: SkipInteraction;
    let packageJsonMcdev: any;
    let OPTIONS: {};
    let changedKeysMap: {};
    let matchedByName: {};
    /**
     * helper that allows filtering an object by its keys
     *
     * @param {Object.<string,*>} originalObj object that you want to filter
     * @param {string[]} [whitelistArr] positive filter. if not provided, returns originalObj without filter
     * @returns {Object.<string,*>} filtered object that only contains keys you provided
     */
    function filterObjByKeys(originalObj: {
        [x: string]: any;
    }, whitelistArr?: string[]): {
        [x: string]: any;
    };
    /**
     * extended Array.includes method that allows check if an array-element starts with a certain string
     *
     * @param {string[]} arr your array of strigns
     * @param {string} search the string you are looking for
     * @returns {boolean} found / not found
     */
    function includesStartsWith(arr: string[], search: string): boolean;
    /**
     * extended Array.includes method that allows check if an array-element starts with a certain string
     *
     * @param {string[]} arr your array of strigns
     * @param {string} search the string you are looking for
     * @returns {number} array index 0..n or -1 of not found
     */
    function includesStartsWithIndex(arr: string[], search: string): number;
    /**
     * check if a market name exists in current mcdev config
     *
     * @param {string} market market localizations
     * @param {Mcdevrc} properties local mcdev config
     * @returns {boolean} found market or not
     */
    function checkMarket(market: string, properties: Mcdevrc): boolean;
    /**
     * check if a market name exists in current mcdev config
     *
     * @param {string[]} marketArr market localizations
     * @param {Mcdevrc} properties local mcdev config
     * @returns {boolean} found market or not
     */
    function checkMarketList(marketArr: string[], properties: Mcdevrc): boolean;
    /**
     * ensure provided MarketList exists and it's content including markets and BUs checks out
     *
     * @param {string} mlName name of marketList
     * @param {Mcdevrc} properties General configuration to be used in retrieve
     */
    function verifyMarketList(mlName: string, properties: Mcdevrc): void;
    /**
     *
     * @param {string | TypeKeyCombo} selectedTypes supported metadata type
     * @param {string[]} [keyArr] name/key of the metadata
     * @param {string} [commandName] for log output only
     * @returns {TypeKeyCombo | undefined} true if everything is valid; false otherwise
     */
    function checkAndPrepareTypeKeyCombo(selectedTypes: string | TypeKeyCombo, keyArr?: string[], commandName?: string): TypeKeyCombo | undefined;
    /**
     * used to ensure the program tells surrounding software that an unrecoverable error occured
     *
     * @returns {void}
     */
    function signalFatalError(): void;
    /**
     * SFMC accepts multiple true values for Boolean attributes for which we are checking here.
     * The same problem occurs when evaluating boolean CLI flags
     *
     * @param {*} attrValue value
     * @returns {boolean} attribute value == true ? true : false
     */
    function isTrue(attrValue: any): boolean;
    /**
     * SFMC accepts multiple false values for Boolean attributes for which we are checking here.
     * The same problem occurs when evaluating boolean CLI flags
     *
     * @param {*} attrValue value
     * @returns {boolean} attribute value == false ? true : false
     */
    function isFalse(attrValue: any): boolean;
    /**
     * helper for Mcdev.retrieve, Mcdev.retrieveAsTemplate and Mcdev.deploy
     *
     * @param {string} selectedType type or type-subtype
     * @param {boolean} [handleOutside] if the API reponse is irregular this allows you to handle it outside of this generic method
     * @returns {boolean} type ok or not
     */
    function _isValidType(selectedType: string, handleOutside?: boolean): boolean;
    /**
     * helper for Mcdev.retrieve, Mcdev.retrieveAsTemplate and Mcdev.deploy
     *
     * @param {Mcdevrc} properties javascript object in .mcdevrc.json
     * @param {string} businessUnit name of BU
     * @param {boolean} [handleOutside] if the API reponse is irregular this allows you to handle it outside of this generic method
     * @returns {boolean} bu found or not
     */
    function isValidBU(properties: Mcdevrc, businessUnit: string, handleOutside?: boolean): boolean;
    /**
     * helper that deals with extracting type and subtype
     *
     * @param {string} selectedType "type" or "type-subtype"
     * @returns {{type:string, subType:string}} first elem is type, second elem is subType
     */
    function getTypeAndSubType(selectedType: string): {
        type: string;
        subType: string;
    };
    /**
     * helper for getDefaultProperties()
     *
     * @param {'typeRetrieveByDefault'|'typeCdpByDefault'} field relevant field in type definition
     * @returns {string[]} type choices
     */
    function getTypeChoices(field: "typeRetrieveByDefault" | "typeCdpByDefault"): string[];
    /**
     * helper for cli.selectTypes and init.config.fixMcdevConfig that converts subtypes back to main type if all and only defaults were selected
     * this keeps the config automatically upgradable when we add new subtypes or change what is selected by default
     *
     * @param {'typeRetrieveByDefault'|'typeCdpByDefault'} field relevant field in type definition
     * @param {string[]} selectedTypes what types the user selected
     * @param {'asset'} [type] metadata type
     * @returns {string[]} filtered selectedTypes
     */
    function summarizeSubtypes(field: "typeRetrieveByDefault" | "typeCdpByDefault", selectedTypes: string[], type?: "asset"): string[];
    let logFileName: string;
    function _createNewLoggerTransport(noLogFile?: boolean): object;
    let loggerTransports: any;
    let logger: Logger;
    function startLogger(restart?: boolean, noLogFile?: boolean): void;
    function metadataLogger(level: string, type: string, method: string, payload: any, source?: string): void;
    function replaceByObject(str: string | object, obj: TemplateMap): string | object;
    function inverseGet(objs: object, val: string | number): string;
    /**
     *helper for Mcdev.fixKeys. Retrieve dependent metadata
     *
     * @param {string} fixedType type of the metadata passed as a parameter to fixKeys function
     * @returns {string[]} array of types that depend on the given type
     */
    function getDependentMetadata(fixedType: string): string[];
    /**
     * Returns Order in which metadata needs to be retrieved/deployed
     *
     * @param {string[]} typeArr which should be retrieved/deployed
     * @returns {Object.<string, string[]>} retrieve/deploy order as array
     */
    function getMetadataHierachy(typeArr: string[]): {
        [x: string]: string[];
    };
    /**
     * let's you dynamically walk down an object and get a value
     *
     * @param {string} path 'fieldA.fieldB.fieldC'
     * @param {object} obj some parent object
     * @returns {any} value of obj.path
     */
    function resolveObjPath(path: string, obj: object): any;
    /**
     * helper to run other commands as if run manually by user
     *
     * @param {string} cmd to be executed command
     * @param {string[]} [args] list of arguments
     * @param {boolean} [hideOutput] if true, output of command will be hidden from CLI
     * @returns {string|void} output of command if hideOutput is true
     */
    function execSync(cmd: string, args?: string[], hideOutput?: boolean): string | void;
    /**
     * standardize check to ensure only one result is returned from template search
     *
     * @param {MetadataTypeItem[]} results array of metadata
     * @param {string} keyToSearch the field which contains the searched value
     * @param {string} searchValue the value which is being looked for
     * @returns {MetadataTypeItem} metadata to be used in building template
     */
    function templateSearchResult(results: MetadataTypeItem[], keyToSearch: string, searchValue: string): MetadataTypeItem;
    /**
     * configures what is displayed in the console
     *
     * @param {object} argv list of command line parameters given by user
     * @param {boolean} [argv.silent] only errors printed to CLI
     * @param {boolean} [argv.verbose] chatty user CLI output
     * @param {boolean} [argv.debug] enables developer output & features
     * @returns {void}
     */
    function setLoggingLevel(argv: {
        silent?: boolean;
        verbose?: boolean;
        debug?: boolean;
    }): void;
    /**
     * outputs a warning that the given type is still in beta
     *
     * @param {string} type api name of the type thats in beta
     */
    function logBeta(type: string): void;
    namespace color {
        let reset: string;
        let dim: string;
        let bright: string;
        let underscore: string;
        let blink: string;
        let reverse: string;
        let hidden: string;
        let fgBlack: string;
        let fgRed: string;
        let fgGreen: string;
        let fgYellow: string;
        let fgBlue: string;
        let fgMagenta: string;
        let fgCyan: string;
        let fgWhite: string;
        let fgGray: string;
        let bgBlack: string;
        let bgRed: string;
        let bgGreen: string;
        let bgYellow: string;
        let bgBlue: string;
        let bgMagenta: string;
        let bgCyan: string;
        let bgWhite: string;
        let bgGray: string;
    }
    /**
     * helper that wraps a message in the correct color codes to have them printed gray
     *
     * @param {string} msg log message that should be wrapped with color codes
     * @returns {string} gray msg
     */
    function getGrayMsg(msg: string): string;
    /**
     * helper that returns the prefix of item specific log messages
     *
     * @param {any} definition metadata definition
     * @param {MetadataTypeItem} metadataItem metadata item
     * @returns {string} msg prefix
     */
    function getMsgPrefix(definition: any, metadataItem: MetadataTypeItem): string;
    /**
     * helper that returns the prefix of item specific log messages
     *
     * @param {any} definition metadata definition
     * @param {MetadataTypeItem} metadataItem metadata item
     * @returns {string} key or key/name combo
     */
    function getTypeKeyName(definition: any, metadataItem: MetadataTypeItem): string;
    /**
     * helper that returns the prefix of item specific log messages
     *
     * @param {any} definition metadata definition
     * @param {MetadataTypeItem} metadataItem metadata item
     * @returns {string} key or key/name combo
     */
    function getKeyName(definition: any, metadataItem: MetadataTypeItem): string;
    /**
     * helper to print the subtypes we filtered by
     *
     * @param {string[]} subTypeArr list of subtypes to be printed
     * @param {string} [indent] optional prefix of spaces to be added to the log message
     * @returns {void}
     */
    function logSubtypes(subTypeArr: string[], indent?: string): void;
    /**
     * helper to print the subtypes we filtered by
     *
     * @param {string[] | string} keyArr list of subtypes to be printed
     * @param {boolean} [isId] optional flag to indicate if key is an id
     * @returns {string} string to be appended to log message
     */
    function getKeysString(keyArr: string[] | string, isId?: boolean): string;
    /**
     * pause execution of code; useful when multiple server calls are dependent on each other and might not be executed right away
     *
     * @param {number} ms time in miliseconds to wait
     * @returns {Promise.<void>} - promise to wait for
     */
    function sleep(ms: number): Promise<void>;
    /**
     * helper for Asset.extractCode and Script.prepExtractedCode to determine if a code block is a valid SSJS block
     *
     * @example the following is invalid:
     * <script runat="server">
     *       // 1
     *   </script>
     *   <script runat="server">
     *       // 2
     *   </script>
     *
     *   the following is valid:
     *   <script runat="server">
     *       // 3
     *   </script>
     * @param {string} code code block to check
     * @returns {string} the SSJS code if code block is a valid SSJS block, otherwise null
     */
    function getSsjs(code: string): string;
    /**
     * allows us to filter just like with SQL's LIKE operator
     *
     * @param {string} testString field value to test
     * @param {string} search search string in SQL LIKE format
     * @returns {boolean} true if testString matches search
     */
    function stringLike(testString: string, search: string): boolean;
    /**
     * returns true if no LIKE filter is defined or if all filters match
     *
     * @param {MetadataTypeItem} metadata a single metadata item
     * @param {object} [filters] only used in recursive calls
     * @returns {boolean} true if no LIKE filter is defined or if all filters match
     */
    function fieldsLike(metadata: MetadataTypeItem, filters?: object): boolean;
    /**
     * helper used by SOAP methods to ensure the type always uses an upper-cased first letter
     *
     * @param {string} str string to capitalize
     * @returns {string} str with first letter capitalized
     */
    function capitalizeFirstLetter(str: string): string;
    /**
     * helper for Retriever and Deployer class
     *
     * @param {string | string[]} typeArr -
     * @param {string[]} keyArr -
     * @param {boolean} [returnEmpty] returns array with null element if false/not set; Retriever needs this to be false; Deployer needs it to be true
     * @returns {TypeKeyCombo} -
     */
    function createTypeKeyCombo(typeArr: string | string[], keyArr: string[], returnEmpty?: boolean): TypeKeyCombo;
    /**
     * helper that converts TypeKeyCombo objects into a string with all relevant -m parameters
     *
     * @param {TypeKeyCombo} [selectedTypes] selected metadata types & key
     * @returns {string} object converted into --metadata parameters
     */
    function convertTypeKeyToCli(selectedTypes?: TypeKeyCombo): string;
    /**
     * helper that converts TypeKeyCombo objects into a string with all relevant -m parameters
     *
     * @param {TypeKeyCombo} [selectedTypes] selected metadata types & key
     * @returns {string} object converted into --metadata parameters
     */
    function convertTypeKeyToString(selectedTypes?: TypeKeyCombo): string;
    /**
     * helper that checks how many keys are defined in TypeKeyCombo object
     *
     * @param {TypeKeyCombo} [selectedTypes] selected metadata types & key
     * @returns {number} amount of keys across all types
     */
    function getTypeKeyCount(selectedTypes?: TypeKeyCombo): number;
    /**
     * async version of Array.find()
     * returns the first element in the provided array that satisfies the provided testin function
     *
     * @param {Array} arr your test array
     * @param {Function} asyncCallback callback
     * @returns {Promise.<any | undefined>} first element that passed the test
     */
    function findAsync(arr: any[], asyncCallback: Function): Promise<any | undefined>;
    /**
     *
     * @param {Array} array array to be chunked
     * @param {number} chunk_size integer > 0
     * @returns {Array[]} array of arrays with max chunk_size members per element, last element might have less
     */
    function chunk(array: any[], chunk_size: number): any[][];
    /**
     * recursively find all values of the given key in the object
     *
     * @param {any} object data to search in
     * @param {string} key attribute to find
     * @returns {Array} all values of the given key
     */
    function findLeafVals(object: any, key: string): any[];
    /**
     * helper that returns a new object with sorted attributes of the given object
     *
     * @param {object} obj object with unsorted attributes
     * @returns {object} obj but with sorted attributes
     */
    function sortObjectAttributes(obj: object): object;
}
export type AuthObject = import("../../types/mcdev.d.js").AuthObject;
export type BuObject = import("../../types/mcdev.d.js").BuObject;
export type Cache = import("../../types/mcdev.d.js").Cache;
export type CodeExtract = import("../../types/mcdev.d.js").CodeExtract;
export type CodeExtractItem = import("../../types/mcdev.d.js").CodeExtractItem;
export type DeltaPkgItem = import("../../types/mcdev.d.js").DeltaPkgItem;
export type McdevLogger = import("../../types/mcdev.d.js").McdevLogger;
export type Logger = import("../../types/mcdev.d.js").Logger;
export type Mcdevrc = import("../../types/mcdev.d.js").Mcdevrc;
export type MetadataTypeItem = import("../../types/mcdev.d.js").MetadataTypeItem;
export type MetadataTypeItemDiff = import("../../types/mcdev.d.js").MetadataTypeItemDiff;
export type MetadataTypeItemObj = import("../../types/mcdev.d.js").MetadataTypeItemObj;
export type MetadataTypeMap = import("../../types/mcdev.d.js").MetadataTypeMap;
export type MetadataTypeMapObj = import("../../types/mcdev.d.js").MetadataTypeMapObj;
export type MultiMetadataTypeList = import("../../types/mcdev.d.js").MultiMetadataTypeList;
export type MultiMetadataTypeMap = import("../../types/mcdev.d.js").MultiMetadataTypeMap;
export type SkipInteraction = import("../../types/mcdev.d.js").SkipInteraction;
export type SoapRequestParams = import("../../types/mcdev.d.js").SoapRequestParams;
export type TemplateMap = import("../../types/mcdev.d.js").TemplateMap;
export type TypeKeyCombo = import("../../types/mcdev.d.js").TypeKeyCombo;
export type SDKError = import("../../types/mcdev.d.js").SDKError;
//# sourceMappingURL=util.d.ts.map