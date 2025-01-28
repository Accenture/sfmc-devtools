'use strict';

import MetadataDefinitions from './../MetadataTypeDefinitions.js';
import process from 'node:process';
import toposort from 'toposort';
import winston from 'winston';
import child_process from 'node:child_process';
import path from 'node:path';
// import just to resolve cyclical - TO DO consider if could move to file or context
import { readJsonSync } from 'fs-extra/esm';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @typedef {import('../../types/mcdev.d.js').AuthObject} AuthObject
 * @typedef {import('../../types/mcdev.d.js').BuObject} BuObject
 * @typedef {import('../../types/mcdev.d.js').Cache} Cache
 * @typedef {import('../../types/mcdev.d.js').CodeExtract} CodeExtract
 * @typedef {import('../../types/mcdev.d.js').CodeExtractItem} CodeExtractItem
 * @typedef {import('../../types/mcdev.d.js').DeltaPkgItem} DeltaPkgItem
 * @typedef {import('../../types/mcdev.d.js').McdevLogger} McdevLogger
 * @typedef {import('../../types/mcdev.d.js').Logger} Logger
 * @typedef {import('../../types/mcdev.d.js').Mcdevrc} Mcdevrc
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItem} MetadataTypeItem
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItemDiff} MetadataTypeItemDiff
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItemObj} MetadataTypeItemObj
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMap} MetadataTypeMap
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMapObj} MetadataTypeMapObj
 * @typedef {import('../../types/mcdev.d.js').MultiMetadataTypeList} MultiMetadataTypeList
 * @typedef {import('../../types/mcdev.d.js').MultiMetadataTypeMap} MultiMetadataTypeMap
 * @typedef {import('../../types/mcdev.d.js').SkipInteraction} SkipInteraction
 * @typedef {import('../../types/mcdev.d.js').SoapRequestParams} SoapRequestParams
 * @typedef {import('../../types/mcdev.d.js').TemplateMap} TemplateMap
 * @typedef {import('../../types/mcdev.d.js').TypeKeyCombo} TypeKeyCombo
 * @typedef {import('../../types/mcdev.d.js').SDKError} SDKError
 */

/**
 * Util that contains logger and simple util methods
 */
export const Util = {
    isRunViaVSCodeExtension:
        process.env.VSCODE_AMD_ENTRYPOINT === 'vs/workbench/api/node/extensionHostProcess' || // run via VSCode extension
        process.env.VSCODE_CRASH_REPORTER_PROCESS_TYPE === 'extensionHost',
    authFileName: '.mcdev-auth.json',
    boilerplateDirectory: '../../boilerplate',
    configFileName: '.mcdevrc.json',
    defaultGitBranch: 'main',
    parentBuName: '_ParentBU_',
    standardizedSplitChar: '/',
    /** @type {SkipInteraction} */
    skipInteraction: null,
    packageJsonMcdev: readJsonSync(path.join(__dirname, '../../package.json')),
    OPTIONS: {},
    changedKeysMap: {},
    matchedByName: {},

    /**
     * helper that allows filtering an object by its keys
     *
     * @param {Object.<string,*>} originalObj object that you want to filter
     * @param {string[]} [whitelistArr] positive filter. if not provided, returns originalObj without filter
     * @returns {Object.<string,*>} filtered object that only contains keys you provided
     */
    filterObjByKeys(originalObj, whitelistArr) {
        if (!whitelistArr || !Array.isArray(whitelistArr)) {
            return originalObj;
        }
        return Object.keys(originalObj)
            .filter((key) => whitelistArr.includes(key))
            .reduce((obj, key) => {
                obj[key] = originalObj[key];
                return obj;
            }, {});
    },

    /**
     * extended Array.includes method that allows check if an array-element starts with a certain string
     *
     * @param {string[]} arr your array of strigns
     * @param {string} search the string you are looking for
     * @returns {boolean} found / not found
     */
    includesStartsWith(arr, search) {
        return this.includesStartsWithIndex(arr, search) >= 0;
    },

    /**
     * extended Array.includes method that allows check if an array-element starts with a certain string
     *
     * @param {string[]} arr your array of strigns
     * @param {string} search the string you are looking for
     * @returns {number} array index 0..n or -1 of not found
     */
    includesStartsWithIndex(arr, search) {
        return Array.isArray(arr) ? arr.findIndex((el) => el.startsWith(search)) : -1;
    },

    /**
     * check if a market name exists in current mcdev config
     *
     * @param {string} market market localizations
     * @param {Mcdevrc} properties local mcdev config
     * @returns {boolean} found market or not
     */
    checkMarket(market, properties) {
        if (properties.markets[market]) {
            return true;
        } else {
            Util.logger.error(`Could not find the market '${market}' in your configuration file.`);
            const marketArr = Object.keys(properties.markets);

            if (marketArr.length) {
                Util.logger.info('Available markets are: ' + marketArr.join(', '));
            }
            return false;
        }
    },

    /**
     * ensure provided MarketList exists and it's content including markets and BUs checks out
     *
     * @param {string} mlName name of marketList
     * @param {Mcdevrc} properties General configuration to be used in retrieve
     */
    verifyMarketList(mlName, properties) {
        if (properties.marketList[mlName]) {
            // ML exists, check if it is properly set up

            // check if BUs in marketList are valid
            let buCounter = 0;
            for (const businessUnit in properties.marketList[mlName]) {
                if (businessUnit !== 'description') {
                    buCounter++;
                    const [cred, bu] = businessUnit ? businessUnit.split('/') : [null, null];
                    if (
                        !properties.credentials[cred] ||
                        !properties.credentials[cred].businessUnits[bu]
                    ) {
                        throw new Error(`'${businessUnit}' in Market ${mlName} is not defined.`);
                    }
                    // check if markets are valid
                    let marketArr = properties.marketList[mlName][businessUnit];
                    if ('string' === typeof marketArr) {
                        marketArr = [marketArr];
                    }
                    for (const market of marketArr) {
                        if (properties.markets[market]) {
                            // * markets can be empty or include variables. Nothing we can test here
                        } else {
                            throw new Error(`Market '${market}' is not defined.`);
                        }
                    }
                }
            }
            if (!buCounter) {
                throw new Error(`No BUs defined in marketList ${mlName}`);
            }
        } else {
            // ML does not exist
            throw new Error(`Market List ${mlName} is not defined`);
        }
    },
    /**
     *
     * @param {string | TypeKeyCombo} selectedTypes supported metadata type
     * @param {string[]} [keyArr] name/key of the metadata
     * @param {string} [commandName] for log output only
     * @returns {TypeKeyCombo | undefined} true if everything is valid; false otherwise
     */
    checkAndPrepareTypeKeyCombo(selectedTypes, keyArr, commandName) {
        if ('string' === typeof selectedTypes) {
            // ensure we have TypeKeyCombo here
            /** @type {TypeKeyCombo} */
            selectedTypes = this.createTypeKeyCombo(selectedTypes, keyArr);
        }
        // check if types are valid
        for (const type of Object.keys(selectedTypes)) {
            if (!this._isValidType(type)) {
                return;
            }
            if (!Array.isArray(selectedTypes[type]) || !selectedTypes[type].length) {
                this.logger.error(
                    'You need to define keys, not just types to run ' + (commandName || '')
                );
                // we need an array of keys here
                return;
            }
            // ensure keys are sorted to enhance log readability
            selectedTypes[type].sort();
        }
        return selectedTypes;
    },

    /**
     * used to ensure the program tells surrounding software that an unrecoverable error occured
     *
     * @returns {void}
     */
    signalFatalError() {
        // Util.logger.debug('Util.signalFataError() sets process.exitCode = 1 unless already set');
        process.exitCode ||= 1;
    },

    /**
     * SFMC accepts multiple true values for Boolean attributes for which we are checking here.
     * The same problem occurs when evaluating boolean CLI flags
     *
     * @param {*} attrValue value
     * @returns {boolean} attribute value == true ? true : false
     */
    isTrue(attrValue) {
        return ['true', 'TRUE', 'True', '1', 1, 'Y', 'y', true].includes(attrValue);
    },

    /**
     * SFMC accepts multiple false values for Boolean attributes for which we are checking here.
     * The same problem occurs when evaluating boolean CLI flags
     *
     * @param {*} attrValue value
     * @returns {boolean} attribute value == false ? true : false
     */
    isFalse(attrValue) {
        return ['false', 'FALSE', 'False', '0', 0, 'N', 'n', false].includes(attrValue);
    },

    /**
     * helper for Mcdev.retrieve, Mcdev.retrieveAsTemplate and Mcdev.deploy
     *
     * @param {string} selectedType type or type-subtype
     * @param {boolean} [handleOutside] if the API reponse is irregular this allows you to handle it outside of this generic method
     * @returns {boolean} type ok or not
     */
    _isValidType(selectedType, handleOutside) {
        const { type, subType } = Util.getTypeAndSubType(selectedType);
        if (type && !MetadataDefinitions[type]) {
            if (!handleOutside) {
                Util.logger.error(`:: '${type}' is not a valid metadata type`);
            }
            return false;
        } else if (
            type &&
            subType &&
            (!MetadataDefinitions[type] || !MetadataDefinitions[type].subTypes.includes(subType))
        ) {
            if (!handleOutside) {
                Util.logger.error(`:: '${selectedType}' is not a valid metadata type`);
            }
            return false;
        }
        return true;
    },

    /**
     * helper for Mcdev.retrieve, Mcdev.retrieveAsTemplate and Mcdev.deploy
     *
     * @param {Mcdevrc} properties javascript object in .mcdevrc.json
     * @param {string} businessUnit name of BU
     * @param {boolean} [handleOutside] if the API reponse is irregular this allows you to handle it outside of this generic method
     * @returns {boolean} bu found or not
     */
    _isValidBU(properties, businessUnit, handleOutside) {
        const [cred, bu] = businessUnit ? businessUnit.split('/') : [null, null];
        if (!properties.credentials[cred]) {
            if (!handleOutside) {
                Util.logger.error(`Credential not found`);
            }
            return false;
        } else if (!properties.credentials[cred].businessUnits[bu]) {
            if (!handleOutside) {
                Util.logger.error(`BU not found in credential`);
            }
            return false;
        }
        return true;
    },

    /**
     * helper that deals with extracting type and subtype
     *
     * @param {string} selectedType "type" or "type-subtype"
     * @returns {{type:string, subType:string}} first elem is type, second elem is subType
     */
    getTypeAndSubType(selectedType) {
        if (selectedType) {
            const temp = selectedType.split('-');
            const type = temp.shift(); // remove first item which is the main typ
            const subType = temp.join('-'); // subType can include "-"
            return { type, subType };
        } else {
            return { type: null, subType: null };
        }
    },

    /**
     * helper for getDefaultProperties()
     *
     * @returns {string[]} type choices
     */
    getRetrieveTypeChoices() {
        const typeChoices = [];
        for (const el in MetadataDefinitions) {
            if (
                Array.isArray(MetadataDefinitions[el].typeRetrieveByDefault) ||
                MetadataDefinitions[el].typeRetrieveByDefault === true
            ) {
                // complex types like assets are saved as array but to ease upgradability we
                // save the main type only unless the user deviates from our pre-selection.
                // Types that dont have subtypes set this field to true or false
                typeChoices.push(MetadataDefinitions[el].type);
            }
        }

        typeChoices.sort((a, b) => {
            if (a.toLowerCase() < b.toLowerCase()) {
                return -1;
            }
            if (a.toLowerCase() > b.toLowerCase()) {
                return 1;
            }
            return 0;
        });

        return typeChoices;
    },

    /**
     * wrapper around our standard winston logging to console and logfile
     *
     * @param {boolean} [noLogFile] optional flag to indicate if we should log to file; CLI logs are always on
     * @returns {object} initiated logger for console and file
     */
    _createNewLoggerTransport: function (noLogFile = false) {
        // {
        //   error: 0,
        //   warn: 1,
        //   info: 2,
        //   http: 3,
        //   verbose: 4,
        //   debug: 5,
        //   silly: 6
        // }
        if (
            this.isRunViaVSCodeExtension || // run via VSCode extension
            process.env.FORK_PROCESS_ID || // run via Git-Fork
            process.env.PATH.toLowerCase().includes('sourcetree') // run via Atlassian SourceTree
        ) {
            Util.OPTIONS.noLogColors = true;
        }
        const logFileName = new Date().toISOString().split(':').join('.');
        const transports = {
            console: new winston.transports.Console({
                // Write logs to Console
                level: Util.OPTIONS.loggerLevel || 'info',
                format: winston.format.combine(
                    Util.OPTIONS.noLogColors
                        ? winston.format.uncolorize()
                        : winston.format.colorize(),
                    winston.format.timestamp({ format: 'HH:mm:ss' }),
                    winston.format.simple(),
                    winston.format.printf(
                        (info) => `${info.timestamp} ${info.level}: ${info.message}`
                    )
                ),
            }),
        };
        if (!noLogFile) {
            transports.file = new winston.transports.File({
                // Write logs to logfile
                filename: 'logs/' + logFileName + '.log',
                level: 'debug', // log everything
                format: winston.format.combine(
                    winston.format.uncolorize(),
                    winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
                    winston.format.simple(),
                    winston.format.printf(
                        (info) => `${info.timestamp} ${info.level}: ${info.message}`
                    )
                ),
            });
            if (Util.OPTIONS.errorLog) {
                // used by CI/CD solutions like Copado to quickly show the error message to admins/users
                transports.fileError = new winston.transports.File({
                    // Write logs to additional error-logfile for better visibility of errors
                    filename: 'logs/' + logFileName + '-errors.log',
                    level: 'error', // only log errors
                    lazy: true, // if true, log files will be created on demand, not at the initialization time.
                    format: winston.format.combine(
                        winston.format.uncolorize(),
                        winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
                        winston.format.simple(),
                        winston.format.printf(
                            (info) => `${info.timestamp} ${info.level}: ${info.message}`
                        )
                    ),
                });
            }
        }
        return transports;
    },

    loggerTransports: null,
    /**
     * Logger that creates timestamped log file in 'logs/' directory
     *
     * @type {Logger}
     */
    logger: null,

    /**
     * initiate winston logger
     *
     * @param {boolean} [restart] if true, logger will be restarted; otherwise, an existing logger will be used
     * @param {boolean} [noLogFile] if false, logger will log to file; otherwise, only to console
     * @returns {void}
     */
    startLogger: function (restart = false, noLogFile = false) {
        if (
            !(
                Util.loggerTransports === null ||
                restart ||
                (!Util.loggerTransports?.file && !noLogFile && !Util.OPTIONS?.noLogFile)
            )
        ) {
            // logger already started
            return;
        }
        Util.loggerTransports = this._createNewLoggerTransport(
            noLogFile || Util.OPTIONS?.noLogFile
        );
        const myWinston = winston.createLogger({
            level: Util.OPTIONS.loggerLevel,
            levels: winston.config.npm.levels,
            transports: Object.values(Util.loggerTransports),
        });
        const winstonError = myWinston.error;
        /** @type {McdevLogger} */
        const winstonExtension = {
            /**
             * helper that prints better stack trace for errors
             *
             * @param {SDKError} ex the error
             * @param {string} [message] optional custom message to be printed as error together with the exception's message
             * @returns {void}
             */
            errorStack: function (ex, message) {
                if (message) {
                    // ! this method only sets exitCode=1 if message-param was set
                    // if not, then this method purely outputs debug information and should not change the exitCode
                    winstonError(`${message}: ${ex.message}${ex.code ? ' (' + ex.code + ')' : ''}`);
                    if (ex.endpoint) {
                        // ex.endpoint is only available if 'ex' is of type RestError
                        winstonError('    endpoint: ' + ex.endpoint);
                    }
                    Util.signalFatalError();
                } else {
                    myWinston.debug(`${ex.message}${ex.code ? ' (' + ex.code + ')' : ''}`);
                    if (ex.endpoint) {
                        // ex.endpoint is only available if 'ex' is of type RestError
                        myWinston.debug('    endpoint: ' + ex.endpoint);
                    }
                }
                let stack;
                /* eslint-disable unicorn/prefer-ternary */
                if (
                    [
                        'ETIMEDOUT',
                        'EHOSTUNREACH',
                        'ENOTFOUND',
                        'ECONNRESET',
                        'ECONNABORTED',
                    ].includes(ex.code)
                ) {
                    // the stack would just return a one-liner that does not help
                    stack = new Error().stack; // eslint-disable-line unicorn/error-message
                } else {
                    stack = ex.stack;
                }
                /* eslint-enable unicorn/prefer-ternary */
                myWinston.debug(stack);
            },

            /**
             * errors should cause surrounding applications to take notice
             * hence we overwrite the default error function here
             *
             * @param {string} msg - the message to log
             * @returns {void}
             */
            error: function (msg) {
                winstonError(msg);
                Util.signalFatalError();
            },
        };
        Util.logger = Object.assign(myWinston, winstonExtension);

        const processArgv = process.argv.slice(2);
        Util.logger.debug(
            `:: mcdev ${Util.packageJsonMcdev.version} :: ⚡ mcdev ${processArgv.join(' ')}`
        );
    },

    /**
     * Logger helper for Metadata functions
     *
     * @param {string} level of log (error, info, warn)
     * @param {string} type of metadata being referenced
     * @param {string} method name which log was called from
     * @param {*} payload generic object which details the error
     * @param {string} [source] key/id of metadata which relates to error
     * @returns {void}
     */
    metadataLogger: function (level, type, method, payload, source) {
        let prependSource = '';
        if (source) {
            prependSource = source + ' - ';
        }
        if (payload instanceof Error) {
            // extract error message
            Util.logger[level](`${type}.${method}: ${prependSource}${payload.message}`);
        } else if (typeof payload === 'string') {
            // print out simple string
            Util.logger[level](`${type} ${method}: ${prependSource}${payload}`);
        } else {
            // Print out JSON String as default.
            Util.logger[level](`${type}.${method}: ${prependSource}${JSON.stringify(payload)}`);
        }
    },

    /**
     * replaces values in a JSON object string, based on a series of
     * key-value pairs (obj)
     *
     * @param {string | object} str JSON object or its stringified version, which has values to be replaced
     * @param {TemplateMap} obj key value object which contains keys to be replaced and values to be replaced with
     * @returns {string | object} replaced version of str
     */
    replaceByObject: function (str, obj) {
        let convertType = false;
        if ('string' !== typeof str) {
            convertType = true;
            str = JSON.stringify(str);
        }
        // sort by value length
        const sortable = [];
        for (const key in obj) {
            // only push in value if not null
            if (obj[key]) {
                sortable.push([key, obj[key]]);
            }
        }

        sortable.sort((a, b) => b[1].length - a[1].length);
        for (const pair of sortable) {
            const escVal = pair[1].toString().replaceAll(/[-/\\^$*+?.()|[\]{}]/g, String.raw`\$&`);
            const regString = new RegExp(escVal, 'g');
            str = str.replace(regString, '{{{' + pair[0] + '}}}');
        }
        if (convertType) {
            str = JSON.parse(str);
        }
        return str;
    },

    /**
     * get key of an object based on the first matching value
     *
     * @param {object} objs object of objects to be searched
     * @param {string | number} val value to be searched for
     * @returns {string} key
     */
    inverseGet: function (objs, val) {
        for (const obj in objs) {
            if (objs[obj] === val) {
                return obj;
            }
        }
        throw new Error(`${val} not found in object`);
    },

    /**
     *helper for Mcdev.fixKeys. Retrieve dependent metadata
     *
     * @param {string} fixedType type of the metadata passed as a parameter to fixKeys function
     * @returns {string[]} array of types that depend on the given type
     */
    getDependentMetadata(fixedType) {
        const dependencies = new Set();

        for (const dependentType of Object.keys(MetadataDefinitions)) {
            if (MetadataDefinitions[dependentType].dependencies.includes(fixedType)) {
                // fixedType was found as a dependency of dependentType
                dependencies.add(dependentType);
            } else if (
                MetadataDefinitions[dependentType].dependencies.some((dependency) =>
                    dependency.startsWith(fixedType + '-')
                )
            ) {
                // if MetadataTypeDefinitions[dependentType].dependencies start with type then also add dependentType to the set; use some to check if any of the dependencies start with type
                dependencies.add(dependentType);
            }
        }
        return [...dependencies];
    },

    /**
     * Returns Order in which metadata needs to be retrieved/deployed
     *
     * @param {string[]} typeArr which should be retrieved/deployed
     * @returns {Object.<string, string[]>} retrieve/deploy order as array
     */
    getMetadataHierachy(typeArr) {
        const dependencies = [];
        // loop through all metadata types which are being retrieved/deployed
        const subTypeDeps = {};
        for (const typeSubType of typeArr) {
            const type = typeSubType.split('-')[0];
            // if they have dependencies then add a dependency pair for each type
            if (MetadataDefinitions[type].dependencies.length > 0) {
                dependencies.push(
                    ...MetadataDefinitions[type].dependencies.map((dep) => {
                        if (dep.includes('-')) {
                            // log subtypes to be able to replace them if main type is also present
                            subTypeDeps[dep.split('-')[0]] ||= new Set();
                            subTypeDeps[dep.split('-')[0]].add(dep);
                        }
                        return [dep, typeSubType];
                    })
                );
            }
            // if they have no dependencies then just add them with undefined.
            else {
                dependencies.push([undefined, typeSubType]);
            }
        }
        const allDeps = dependencies.map((dep) => dep[0]);
        // remove subtypes if main type is in the list
        for (const type of Object.keys(subTypeDeps)
            // only look at subtype deps that are also supposed to be retrieved or cached fully
            .filter((type) => typeArr.includes(type) || allDeps.includes(type))) {
            // convert set into array to walk its elements
            for (const subType of subTypeDeps[type]) {
                for (const item of dependencies) {
                    if (item[0] === subType) {
                        // if subtype recognized, replace with main type
                        item[0] = type;
                    }
                }
            }
        }

        // sort list & remove the undefined dependencies
        const flatList = toposort(dependencies).filter((a) => !!a);
        /** @type {Object.<string, null | Set.<string>>} */
        const setList = {};
        // group subtypes per type
        for (const flatType of flatList) {
            if (flatType.includes('-')) {
                const { type, subType } = Util.getTypeAndSubType(flatType);
                if (setList[type] === null) {
                    // if main type is already required, then don't filter by subtypes
                    continue;
                } else if (setList[type] && subType) {
                    // add another subtype to the set
                    setList[type].add(subType);
                    continue;
                } else {
                    // create a new set with the first subtype; subKey will be always set here
                    setList[type] = new Set([subType]);
                }
                if (subTypeDeps[type]) {
                    // check if there are depndent subtypes that need to be added
                    /** @type {string[]} */
                    const temp = [...subTypeDeps[type]].map((a) => {
                        const temp = a.split('-');
                        temp.shift(); // remove first item which is the main type
                        return temp.join('-'); // subType can include "-"
                    });
                    for (const item of temp) {
                        setList[type].add(item);
                    }
                }
            } else {
                setList[flatType] = null;
            }
        }
        // convert sets into arrays
        /** @type {Object.<string, string[]>} */
        const finalList = {};

        for (const type of Object.keys(setList)) {
            finalList[type] = setList[type] instanceof Set ? [...setList[type]] : null;
        }

        return finalList;
    },

    /**
     * let's you dynamically walk down an object and get a value
     *
     * @param {string} path 'fieldA.fieldB.fieldC'
     * @param {object} obj some parent object
     * @returns {any} value of obj.path
     */
    resolveObjPath(path, obj) {
        return path.split('.').reduce((prev, curr) => (prev ? prev[curr] : null), obj);
    },

    /**
     * helper to run other commands as if run manually by user
     *
     * @param {string} cmd to be executed command
     * @param {string[]} [args] list of arguments
     * @param {boolean} [hideOutput] if true, output of command will be hidden from CLI
     * @returns {string|void} output of command if hideOutput is true
     */
    execSync(cmd, args, hideOutput) {
        args ||= [];
        Util.logger.info('⚡ ' + cmd + ' ' + args.join(' '));

        try {
            if (hideOutput) {
                // no output displayed to user but instead returned to parsed elsewhere
                return child_process
                    .execSync(cmd + ' ' + args.join(' '))
                    .toString()
                    .trim();
            } else {
                // the following options ensure the user sees the same output and
                // interaction options as if the command was manually run
                child_process.execSync(cmd + ' ' + args.join(' '), { stdio: [0, 1, 2] });
                return null;
            }
        } catch {
            // avoid errors from execSync to bubble up
            return null;
        }
    },

    /**
     * standardize check to ensure only one result is returned from template search
     *
     * @param {MetadataTypeItem[]} results array of metadata
     * @param {string} keyToSearch the field which contains the searched value
     * @param {string} searchValue the value which is being looked for
     * @returns {MetadataTypeItem} metadata to be used in building template
     */
    templateSearchResult(results, keyToSearch, searchValue) {
        const matching = results.filter((item) => item[keyToSearch] === searchValue);

        if (matching.length === 0) {
            throw new Error(`No metadata found with name "${searchValue}"`);
        } else if (matching.length > 1) {
            throw new Error(
                `Multiple metadata with name "${searchValue}" please rename to be unique to avoid issues`
            );
        } else {
            return matching[0];
        }
    },

    /**
     * configures what is displayed in the console
     *
     * @param {object} argv list of command line parameters given by user
     * @param {boolean} [argv.silent] only errors printed to CLI
     * @param {boolean} [argv.verbose] chatty user CLI output
     * @param {boolean} [argv.debug] enables developer output & features
     * @returns {void}
     */
    setLoggingLevel(argv) {
        if (argv.silent) {
            // only errors printed to CLI
            Util.OPTIONS.loggerLevel = 'error';
            Util.logger.debug('CLI logger set to: silent');
        } else if (argv.verbose) {
            // chatty user cli logs
            Util.OPTIONS.loggerLevel = 'verbose';
            Util.logger.debug('CLI logger set to: verbose');
        } else {
            // default user cli logs
            Util.OPTIONS.loggerLevel = 'info';
            Util.logger.debug('CLI logger set to: info / default');
        }
        if (argv.debug) {
            // enables developer output & features. no change to actual logs
            Util.OPTIONS.loggerLevel = 'debug';
            Util.logger.debug('CLI logger set to: debug');
        }
        if (Util.loggerTransports?.console) {
            Util.loggerTransports.console.level = Util.OPTIONS.loggerLevel;
        }
        if (Util.logger) {
            Util.logger.level = Util.OPTIONS.loggerLevel;
        }
    },

    /**
     * outputs a warning that the given type is still in beta
     *
     * @param {string} type api name of the type thats in beta
     */
    logBeta(type) {
        Util.logger.warn(
            ` - 🚧 ${type} support is currently still in beta. Please report any issues here: https://github.com/Accenture/sfmc-devtools/issues/new/choose`
        );
    },
    // defined colors for logging things in different colors
    color: {
        reset: '\x1B[0m',
        dim: '\x1B[2m',
        bright: '\x1B[1m',
        underscore: '\x1B[4m',
        blink: '\x1B[5m',
        reverse: '\x1B[7m',
        hidden: '\x1B[8m',

        fgBlack: '\x1B[30m',
        fgRed: '\x1B[31m',
        fgGreen: '\x1B[32m',
        fgYellow: '\x1B[33m',
        fgBlue: '\x1B[34m',
        fgMagenta: '\x1B[35m',
        fgCyan: '\x1B[36m',
        fgWhite: '\x1B[37m',
        fgGray: '\x1B[90m',

        bgBlack: '\x1B[40m',
        bgRed: '\x1B[41m',
        bgGreen: '\x1B[42m',
        bgYellow: '\x1B[43m',
        bgBlue: '\x1B[44m',
        bgMagenta: '\x1B[45m',
        bgCyan: '\x1B[46m',
        bgWhite: '\x1B[47m',
        bgGray: '\x1B[100m',
    },

    /**
     * helper that wraps a message in the correct color codes to have them printed gray
     *
     * @param {string} msg log message that should be wrapped with color codes
     * @returns {string} gray msg
     */
    getGrayMsg(msg) {
        return `${Util.color.dim}${msg}${Util.color.reset}`;
    },

    /**
     * helper to print the subtypes we filtered by
     *
     * @param {string[]} subTypeArr list of subtypes to be printed
     * @param {string} [indent] optional prefix of spaces to be added to the log message
     * @returns {void}
     */
    logSubtypes(subTypeArr, indent = '') {
        if (subTypeArr && subTypeArr.length > 0) {
            Util.logger.info(
                Util.getGrayMsg(
                    `${indent} - Subtype${subTypeArr.length > 1 ? 's' : ''}: ${[...subTypeArr].sort().join(', ')}`
                )
            );
        }
    },

    /**
     * helper to print the subtypes we filtered by
     *
     * @param {string[] | string} keyArr list of subtypes to be printed
     * @param {boolean} [isId] optional flag to indicate if key is an id
     * @returns {string} string to be appended to log message
     */
    getKeysString(keyArr, isId) {
        if (!keyArr) {
            return '';
        }
        if (!Array.isArray(keyArr)) {
            // if only one key, make it an array
            keyArr = [keyArr];
        }
        if (keyArr.length > 0) {
            return Util.getGrayMsg(
                ` - ${isId ? 'ID' : 'Key'}${keyArr.length > 1 ? 's' : ''}: ${keyArr.join(', ')}`
            );
        }
        return '';
    },

    /**
     * pause execution of code; useful when multiple server calls are dependent on each other and might not be executed right away
     *
     * @param {number} ms time in miliseconds to wait
     * @returns {Promise.<void>} - promise to wait for
     */
    async sleep(ms) {
        if (Util.OPTIONS._runningTest) {
            Util.logger.debug('Skipping sleep in test mode');
            return;
        }
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    },

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
    getSsjs(code) {
        if (!code) {
            return null;
        }
        // \s*      whitespace characters, zero or more times
        // [^>]*?   any character that is not a >, zero or more times, un-greedily
        // (.*)     capture any character, zero or more times
        // /s      dotall flag
        // ideally the code looks like <script runat="server">...</script>

        // regex that matches <script runat="server">...</script>, <script runat="server" language="javascript">...</script> or <script language="JavaScript" runat="server">...</script>, but it may not match <script language="ampscript" runat="server">...</script> and it may also not match <script runat="server" language="ampscript">...</script>
        const scriptRegex =
            /^<\s*script\s*(language=["']{1}javascript["']{1})?\s?[^>]*?runat\s*=\s*["']{1}server["']{1}\s*?(language=["']{1}javascript["']{1})?\s*>(.*)<\/\s*script\s*>$/is;

        code = code.trim();
        const regexMatches = scriptRegex.exec(code);
        // regexMatches indexes:
        // 1: first optional language block
        // 2: second optional language block
        // 3: the actual code
        if (regexMatches?.length > 1 && regexMatches[3]) {
            // script found
            /* eslint-disable unicorn/prefer-ternary */
            if (regexMatches[3].includes('<script')) {
                // nested script found
                return null;
            } else {
                // no nested script found: return the assumed SSJS-code
                return regexMatches[3];
            }
            /* eslint-enable unicorn/prefer-ternary */
        }
        // no script found
        return null;
    },

    /**
     * allows us to filter just like with SQL's LIKE operator
     *
     * @param {string} testString field value to test
     * @param {string} search search string in SQL LIKE format
     * @returns {boolean} true if testString matches search
     */
    stringLike(testString, search) {
        if (typeof search !== 'string' || this === null) {
            return false;
        }
        // Remove special chars
        search = search.replaceAll(
            new RegExp(String.raw`([\.\\\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:\-])`, 'g'),
            String.raw`\$1`
        );
        // Replace % and _ with equivalent regex
        search = search.replaceAll('%', '.*').replaceAll('_', '.');
        // Check matches
        return new RegExp('^' + search + '$', 'gi').test(testString);
    },

    /**
     * returns true if no LIKE filter is defined or if all filters match
     *
     * @param {MetadataTypeItem} metadata a single metadata item
     * @param {object} [filters] only used in recursive calls
     * @returns {boolean} true if no LIKE filter is defined or if all filters match
     */
    fieldsLike(metadata, filters) {
        if (metadata.json && metadata.codeArr) {
            // Compensate for CodeExtractItem format
            metadata = metadata.json;
        }
        filters ||= Util.OPTIONS.like;
        if (!filters) {
            return true;
        }
        const fields = Object.keys(filters);
        return fields.every((field) => {
            // to allow passing in an array via cli, e.g. --like=field1,field2, we need to convert comma separated lists into arrays
            const filter =
                typeof filters[field] === 'string' && filters[field].includes(',')
                    ? filters[field].split(',')
                    : filters[field];
            if (Array.isArray(metadata[field])) {
                return metadata[field].some((f) => Util.fieldsLike(f, filter));
            } else {
                if (typeof filter === 'string') {
                    return Util.stringLike(metadata[field], filter);
                } else if (Array.isArray(filter)) {
                    return filter.some((f) => Util.stringLike(metadata[field], f));
                } else if (typeof filter === 'object') {
                    return Util.fieldsLike(metadata[field], filter);
                }
            }
            return false;
        });
    },

    /**
     * helper used by SOAP methods to ensure the type always uses an upper-cased first letter
     *
     * @param {string} str string to capitalize
     * @returns {string} str with first letter capitalized
     */
    capitalizeFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    /**
     * helper for Retriever and Deployer class
     *
     * @param {string | string[]} typeArr -
     * @param {string[]} keyArr -
     * @param {boolean} [returnEmpty] returns array with null element if false/not set; Retriever needs this to be false; Deployer needs it to be true
     * @returns {TypeKeyCombo} -
     */
    createTypeKeyCombo(typeArr, keyArr, returnEmpty = false) {
        if (!keyArr || (Array.isArray(keyArr) && !keyArr.length)) {
            // no keys were provided, ensure we retrieve all
            keyArr = returnEmpty ? null : [null];
        }
        /** @type {TypeKeyCombo} */
        const typeKeyMap = {};
        if ('string' === typeof typeArr) {
            typeArr = [typeArr];
        }
        // no keys or array of keys was provided (likely called via CLI or to retrieve all)
        // transform into TypeKeyCombo to iterate over it
        for (const type of typeArr) {
            typeKeyMap[type] = keyArr;
        }
        return typeKeyMap;
    },

    /**
     * helper that converts TypeKeyCombo objects into a string with all relevant -m parameters
     *
     * @param {TypeKeyCombo} [selectedTypes] selected metadata types & key
     * @returns {string} object converted into --metadata parameters
     */
    convertTypeKeyToCli(selectedTypes) {
        return selectedTypes
            ? Object.keys(selectedTypes)
                  .reduce((previousValue, type) => {
                      previousValue.push(
                          ...selectedTypes[type].map((key) =>
                              key === null ? `-m ${type}` : `-m "${type}:${key}"`
                          )
                      );
                      return previousValue;
                  }, [])
                  .join(' ')
            : '';
    },

    /**
     * helper that converts TypeKeyCombo objects into a string with all relevant -m parameters
     *
     * @param {TypeKeyCombo} [selectedTypes] selected metadata types & key
     * @returns {string} object converted into --metadata parameters
     */
    convertTypeKeyToString(selectedTypes) {
        return selectedTypes
            ? Object.keys(selectedTypes)
                  .reduce((previousValue, type) => {
                      previousValue.push(
                          selectedTypes[type]
                              .map((key, index) => {
                                  let response = '';
                                  if (index === 0) {
                                      response += `${type}`;
                                  }
                                  if (key !== null && index === 0) {
                                      response += ' (';
                                  }
                                  response += key === null ? `` : `"${key}"`;
                                  if (key !== null && index === selectedTypes[type].length - 1) {
                                      response += ')';
                                  }
                                  return response;
                              })
                              .join(', ')
                      );
                      return previousValue;
                  }, [])
                  .join(', ')
            : '';
    },

    /**
     * helper that checks how many keys are defined in TypeKeyCombo object
     *
     * @param {TypeKeyCombo} [selectedTypes] selected metadata types & key
     * @returns {number} amount of keys across all types
     */
    getTypeKeyCount(selectedTypes) {
        return Object.keys(selectedTypes).reduce(
            (previousValue, type) =>
                previousValue + (selectedTypes[type] ? selectedTypes[type].length : 0),
            0
        );
    },

    /**
     * async version of Array.find()
     * returns the first element in the provided array that satisfies the provided testin function
     *
     * @param {Array} arr your test array
     * @param {Function} asyncCallback callback
     * @returns {Promise.<any | undefined>} first element that passed the test
     */
    async findAsync(arr, asyncCallback) {
        for (const element of arr) {
            if (await asyncCallback(element)) {
                return element;
            }
        }
    },

    /**
     *
     * @param {Array} array array to be chunked
     * @param {number} chunk_size integer > 0
     * @returns {Array[]} array of arrays with max chunk_size members per element, last element might have less
     */
    chunk(array, chunk_size) {
        return array.length == 0
            ? []
            : [array.splice(0, chunk_size)].concat(this.chunk(array, chunk_size));
    },
    /**
     * recursively find all values of the given key in the object
     *
     * @param {any} object data to search in
     * @param {string} key attribute to find
     * @returns {Array} all values of the given key
     */
    findLeafVals(object, key) {
        const values = [];
        Object.keys(object).map((k) => {
            if (k === key) {
                values.push(object[k]);
                return true;
            }
            if (object[k] && typeof object[k] === 'object') {
                values.push(...this.findLeafVals(object[k], key));
            }
        });
        return [...new Set(values.sort())];
    },
    /**
     * helper that returns a new object with sorted attributes of the given object
     *
     * @param {object} obj object with unsorted attributes
     * @returns {object} obj but with sorted attributes
     */
    sortObjectAttributes(obj) {
        return Object.keys(obj)
            .sort()
            .reduce((acc, key) => {
                acc[key] = obj[key];
                return acc;
            }, {});
    },
};

Util.startLogger(false, true);
