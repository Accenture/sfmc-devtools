'use strict';

const TYPE = require('../../types/mcdev.d');
const fs = require('fs-extra'); // ! do not switch to util/file.js to avoid circular dependency
const MetadataDefinitions = require('./../MetadataTypeDefinitions');
const packageJsonMcdev = require('../../package.json');
const path = require('path');
const process = require('process');
const toposort = require('toposort');
const winston = require('winston');
const inquirer = require('inquirer');
const child_process = require('child_process');
const semver = require('semver');

/**
 * Util that contains logger and simple util methods
 */
const Util = {
    authFileName: '.mcdev-auth.json',
    boilerplateDirectory: '../../boilerplate',
    configFileName: '.mcdevrc.json',
    parentBuName: '_ParentBU_',
    standardizedSplitChar: '/',
    /** @type {TYPE.skipInteraction} */
    skipInteraction: false,

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
        return Array.isArray(arr) ? arr.findIndex((el) => el.startsWith(search), search) : -1;
    },
    /**
     * check if a market name exists in current mcdev config
     *
     * @param {string} market market localizations
     * @param {TYPE.Mcdevrc} properties local mcdev config
     * @returns {boolean} found market or not
     */
    checkMarket(market, properties) {
        if (properties.markets[market]) {
            return true;
        } else {
            Util.logger.error(`Could not find the market '${market}' in your configuration file.`);
            const marketArr = Object.values(properties.markets);

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
     * @param {TYPE.Mcdevrc} properties General configuration to be used in retrieve
     * @returns {void} throws errors if problems were found
     */
    verifyMarketList(mlName, properties) {
        if (!properties.marketList[mlName]) {
            // ML does not exist
            throw new Error(`Market List ${mlName} is not defined`);
        } else {
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
                        if (!properties.markets[market]) {
                            throw new Error(`Market '${market}' is not defined.`);
                        } else {
                            // * markets can be empty or include variables. Nothing we can test here
                        }
                    }
                }
            }
            if (!buCounter) {
                throw new Error(`No BUs defined in marketList ${mlName}`);
            }
        }
    },
    /**
     * used to ensure the program tells surrounding software that an unrecoverable error occured
     *
     * @returns {void}
     */
    signalFatalError() {
        process.exitCode = 1;
    },
    /**
     * SFMC accepts multiple true values for Boolean attributes for which we are checking here
     *
     * @param {*} attrValue value
     * @returns {boolean} attribute value == true ? true : false
     */
    isTrue(attrValue) {
        return ['true', 'TRUE', 'True', '1', 1, 'Y', true].includes(attrValue);
    },
    /**
     * SFMC accepts multiple false values for Boolean attributes for which we are checking here
     *
     * @param {*} attrValue value
     * @returns {boolean} attribute value == false ? true : false
     */
    isFalse(attrValue) {
        return ['false', 'FALSE', 'False', '0', 0, 'N', false].includes(attrValue);
    },
    /**
     * helper for retrieve, retrieveAsTemplate and deploy
     *
     * @param {string} selectedType type or type-subtype
     * @returns {boolean} type ok or not
     */
    _isValidType(selectedType) {
        const [type, subType] = selectedType ? selectedType.split('-') : [];
        if (type && !MetadataDefinitions[type]) {
            Util.logger.error(`:: '${type}' is not a valid metadata type`);
            return;
        } else if (
            type &&
            subType &&
            (!MetadataDefinitions[type] || !MetadataDefinitions[type].subTypes.includes(subType))
        ) {
            Util.logger.error(`:: '${selectedType}' is not a valid metadata type`);
            return;
        }
        return true;
    },

    /**
     * defines how the properties.json should look like
     * used for creating a template and for checking if variables are set
     *
     * @returns {TYPE.Mcdevrc} default properties
     */
    getDefaultProperties() {
        const configFileName = path.resolve(__dirname, this.boilerplateDirectory, 'config.json');
        if (!fs.pathExistsSync(configFileName)) {
            this.logger.debug(`Default config file not found in ${configFileName}`);
            return false;
        }
        const defaultProperties = fs.readJsonSync(configFileName);
        // set default name for parent BU
        defaultProperties.credentials.default.businessUnits[this.parentBuName] = 0;
        // set default retrieve values
        defaultProperties.metaDataTypes.retrieve = this.getRetrieveTypeChoices();

        return defaultProperties;
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
     * check if the config file is correctly formatted and has values
     *
     * @param {TYPE.Mcdevrc} properties javascript object in .mcdevrc.json
     * @param {boolean} [silent] set to true for internal use w/o cli output
     * @returns {Promise.<boolean | string[]>} file structure ok OR list of fields to be fixed
     */
    checkProperties: async function (properties, silent) {
        if (!(await fs.pathExists(Util.configFileName)) || !properties) {
            Util.logger.error(`\nCould not find ${Util.configFileName} in ${process.cwd()}.`);
            Util.logger.error(`Run 'mcdev init' to initialize your project.\n`);
            return false;
        }
        if (!(await fs.pathExists(Util.authFileName)) || !properties) {
            Util.logger.error(`\nCould not find ${Util.authFileName} in ${process.cwd()}.`);
            Util.logger.error(`Run 'mcdev init' to initialize your project.\n`);
            return false;
        }

        // check if user is running older (ignores patches) mcdev version than whats saved to the config
        if (properties.version && semver.gt(properties.version, packageJsonMcdev.version)) {
            Util.logger.error(
                `Your Accenture SFMC DevTools version ${packageJsonMcdev.version} is lower than your project's config version ${properties.version}`
            );
            if (Util.skipInteraction) {
                return false;
            }

            const responses = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'runUpgradeNow',
                    message: `Do you want to run 'npm update -g mcdev@${properties.version}' now? This may take a few minutes.`,
                    default: true,
                },
            ]);
            if (responses.runUpgradeNow) {
                // use _execSync here to avoid a circular dependency
                this.execSync('npm', ['update', '-g', `mcdev@${properties.version}`]);
            }
            return false;
        }

        // check config properties
        const defaultProps = this.getDefaultProperties();
        const errorMsgs = [];
        const solutionSet = new Set();
        const missingFields = [];
        for (const key in defaultProps) {
            if (Object.prototype.hasOwnProperty.call(defaultProps, key)) {
                if (!Object.prototype.hasOwnProperty.call(properties, key)) {
                    errorMsgs.push(`${key}{} missing`);
                    solutionSet.add(
                        `Run 'mcdev upgrade' to fix missing or changed configuration options`
                    );
                    missingFields.push(key);
                } else {
                    if (!silent && key === 'credentials') {
                        if (!Object.keys(properties.credentials)) {
                            errorMsgs.push(`no Credential defined`);
                        } else {
                            for (const cred in properties.credentials) {
                                if (cred.includes('/') || cred.includes('\\')) {
                                    errorMsgs.push(
                                        `Credential names may not includes slashes: ${cred}`
                                    );
                                    solutionSet.add('Apply manual fix in your config.');
                                }
                                if (
                                    !properties.credentials[cred].eid ||
                                    properties.credentials[cred].eid === 0
                                ) {
                                    errorMsgs.push(`invalid account_id (EID) on ${cred}`);
                                    solutionSet.add(`Run 'mcdev init ${cred}'`);
                                }
                                let i = 0;
                                for (const buName in properties.credentials[cred].businessUnits) {
                                    if (buName.includes('/') || buName.includes('\\')) {
                                        errorMsgs.push(
                                            `Business Unit names may not includes slashes: ${cred}: ${buName}`
                                        );
                                        solutionSet.add(`Run 'mcdev reloadBUs ${cred}'`);
                                    }
                                    if (
                                        Object.prototype.hasOwnProperty.call(
                                            properties.credentials[cred].businessUnits,
                                            buName
                                        ) &&
                                        properties.credentials[cred].businessUnits[buName] !== 0
                                    ) {
                                        i++;
                                    }
                                }
                                if (!i) {
                                    errorMsgs.push(`no Business Units defined`);
                                    solutionSet.add(`Run 'mcdev reloadBUs ${cred}'`);
                                }
                            }
                        }
                    } else if (['directories', 'metaDataTypes', 'options'].includes(key)) {
                        for (const subkey in defaultProps[key]) {
                            if (
                                Object.prototype.hasOwnProperty.call(defaultProps[key], subkey) &&
                                !Object.prototype.hasOwnProperty.call(properties[key], subkey)
                            ) {
                                errorMsgs.push(
                                    `${key}.${subkey} missing. Default value (${
                                        Array.isArray(defaultProps[key][subkey])
                                            ? 'Array'
                                            : typeof defaultProps[key][subkey]
                                    }): ${defaultProps[key][subkey]}`
                                );
                                solutionSet.add(
                                    `Run 'mcdev upgrade' to fix missing or changed configuration options`
                                );
                                missingFields.push(`${key}.${subkey}`);
                            } else if (subkey === 'deployment') {
                                for (const dkey in defaultProps[key][subkey]) {
                                    if (
                                        Object.prototype.hasOwnProperty.call(
                                            defaultProps[key][subkey],
                                            dkey
                                        ) &&
                                        !Object.prototype.hasOwnProperty.call(
                                            properties[key][subkey],
                                            dkey
                                        )
                                    ) {
                                        errorMsgs.push(
                                            `${key}.${subkey} missing. Default value (${
                                                Array.isArray(defaultProps[key][subkey][dkey])
                                                    ? 'Array'
                                                    : typeof defaultProps[key][subkey][dkey]
                                            }): ${defaultProps[key][subkey][dkey]}`
                                        );
                                        solutionSet.add(
                                            `Run 'mcdev upgrade' to fix missing or changed configuration options`
                                        );
                                        missingFields.push(`${key}.${subkey}.${dkey}`);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        // check if project config version is outdated compared to user's mcdev version
        if (
            !properties.version ||
            (![null, 'patch'].includes(semver.diff(packageJsonMcdev.version, properties.version)) &&
                semver.gt(packageJsonMcdev.version, properties.version))
        ) {
            errorMsgs.push(
                `Your project's config version ${properties.version} is lower than your Accenture SFMC DevTools version ${packageJsonMcdev.version}`
            );
            solutionSet.add(`Run 'mcdev upgrade' to ensure optimal performance`);
            missingFields.push('version');
        }
        if (silent) {
            return missingFields;
        } else {
            if (errorMsgs.length) {
                const errorMsgOutput = [
                    `Found problems in your ./${Util.configFileName} that you need to fix first:`,
                ];
                for (const msg of errorMsgs) {
                    errorMsgOutput.push(' - ' + msg);
                }
                Util.logger.error(errorMsgOutput.join('\n'));
                if (Util.skipInteraction) {
                    return false;
                }
                Util.logger.info(
                    [
                        'Here is what you can do to fix these issues:',
                        ...Array.from(solutionSet),
                    ].join('\n- ')
                );
                const responses = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'runUpgradeNow',
                        message: `Do you want to run 'mcdev upgrade' now?`,
                        default: true,
                    },
                ]);
                if (responses.runUpgradeNow) {
                    // use _execSync here to avoid a circular dependency
                    this.execSync('mcdev', ['upgrade']);
                }
                return false;
            } else {
                return true;
            }
        }
    },
    loggerTransports: null,
    /**
     * Logger that creates timestamped log file in 'logs/' directory
     *
     * @type {TYPE.Logger}
     */
    logger: null,
    restartLogger: startLogger,
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
     * @param {TYPE.TemplateMap} obj key value object which contains keys to be replaced and values to be replaced with
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
            const escVal = pair[1].toString().replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
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
     * @param {string} val value to be searched for
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
     * Returns Order in which metadata needs to be retrieved/deployed
     *
     * @param {string[]} metadataTypes which should be retrieved/deployed
     * @returns {string[]} retrieve/deploy order as array
     */
    getMetadataHierachy(metadataTypes) {
        const dependencies = [];
        // loop through all metadata types which are being retrieved/deployed
        const subTypeDeps = {};
        for (const metadataType of metadataTypes) {
            const type = metadataType.split('-')[0];
            // if they have dependencies then add a dependency pair for each type
            if (MetadataDefinitions[type].dependencies.length > 0) {
                dependencies.push(
                    ...MetadataDefinitions[type].dependencies.map((dep) => {
                        if (dep.includes('-')) {
                            // log subtypes to be able to replace them if main type is also present
                            subTypeDeps[dep.split('-')[0]] =
                                subTypeDeps[dep.split('-')[0]] || new Set();
                            subTypeDeps[dep.split('-')[0]].add(dep);
                        }
                        return [dep, metadataType];
                    })
                );
            }
            // if they have no dependencies then just add them with undefined.
            else {
                dependencies.push([undefined, metadataType]);
            }
        }
        // remove subtypes if main type is in the list
        Object.keys(subTypeDeps)
            // only look at subtype deps that are also supposed to be retrieved fully
            .filter((type) => metadataTypes.includes(type))
            // Rewrite the subtype dependecies to main types.
            .forEach((type) => {
                // convert set into array to walk its elements
                [...subTypeDeps[type]].forEach((subType) => {
                    dependencies.forEach((item) => {
                        if (item[0] === subType) {
                            // if subtype recognized, replace with main type
                            item[0] = type;
                        }
                    });
                });
            });

        // sort list & remove the undefined dependencies
        return toposort(dependencies).filter((a) => !!a);
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
     * @returns {undefined}
     */
    execSync(cmd, args) {
        args = args || [];
        Util.logger.info('⚡ ' + cmd + ' ' + args.join(' '));

        // the following options ensure the user sees the same output and
        // interaction options as if the command was manually run
        const options = { stdio: [0, 1, 2] };
        return child_process.execSync(cmd + ' ' + args.join(' '), options);
    },
    /**
     * standardize check to ensure only one result is returned from template search
     *
     * @param {TYPE.MetadataTypeItem[]} results array of metadata
     * @param {string} keyToSearch the field which contains the searched value
     * @param {string} searchValue the value which is being looked for
     * @returns {TYPE.MetadataTypeItem} metadata to be used in building template
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
        Util.loggerTransports.console.file = 'debug';
        if (argv.silent) {
            // only errors printed to CLI
            Util.logger.level = 'error';
            Util.loggerTransports.console.level = 'error';
            Util.logger.debug('CLI logger set to: silent');
        } else if (argv.verbose) {
            // chatty user cli logs
            Util.logger.level = 'verbose';
            Util.loggerTransports.console.level = 'verbose';
            Util.logger.debug('CLI logger set to: verbose');
        } else {
            // default user cli logs
            // TODO to be switched to "warn" when cli-process is integrated
            Util.logger.level = 'info';
            Util.loggerTransports.console.level = 'info';
            Util.logger.debug('CLI logger set to: info / default');
        }
        if (argv.debug) {
            // enables developer output & features. no change to actual logs
            Util.logger.level = 'debug';
            Util.loggerTransports.console.level = 'debug';
            Util.logger.debug('CLI logger set to: debug');
        }
    },
    /**
     * helper for hasChangedGeneric
     *
     * @param {*} oldItem old version of an object
     * @param {*} newItem new version of an object
     * @param {string} prop property of object to be checked
     * @returns {boolean} true if property has changed
     */
    isObjectChanged(oldItem, newItem, prop) {
        if (!oldItem) {
            return true;
        }
        if (
            newItem[prop] === null ||
            ['string', 'number', 'boolean'].includes(typeof newItem[prop])
        ) {
            // check should ignore types to bypass string/number auto-conversions caused by SFMC-SDK
            return newItem[prop] != oldItem[prop];
        } else if (Array.isArray(newItem[prop])) {
            return this.arrayEquals(oldItem[prop], newItem[prop]);
        } else {
            let equal = true;
            for (const propDeep in newItem[prop]) {
                equal = equal && this.isObjectChanged(oldItem[prop], newItem[prop], propDeep);
            }
            return equal;
        }
    },
    /**
     * compares to arrays and returns true if they are different
     *
     * @param {Array} arrayA first array to compare
     * @param {Array} arrayB second array to compare
     * @returns {boolean} true if arrays are equal
     */
    arrayEquals(arrayA, arrayB) {
        // if one of the arrays is a falsy value, return
        if (!arrayA || !arrayB) {
            return false;
        }

        // check if both are actually arrays
        if (!Array.isArray(arrayA) || !Array.isArray(arrayB)) {
            return false;
        }

        // compare lengths - can save a lot of time
        if (arrayA.length != arrayB.length) {
            return false;
        }

        for (let i = 0, l = arrayA.length; i < l; i++) {
            // Check if we have nested arrays
            if (Array.isArray(arrayA[i]) || Array.isArray(arrayB[i])) {
                // recurse into the nested arrays
                if (!this.arrayEquals(arrayA[i], arrayB[i])) {
                    return false;
                }
            } else if (arrayA[i] != arrayB[i]) {
                // Warning - two different object instances will never be equal: {x:20} != {x:20}
                return false;
            }
        }
        return true;
    },
};
/**
 * wrapper around our standard winston logging to console and logfile
 *
 * @returns {object} initiated logger for console and file
 */
function createNewLoggerTransport() {
    return {
        console: new winston.transports.Console({
            // Write logs to Console
            level: 'info',
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp({ format: 'HH:mm:ss' }),
                winston.format.simple(),
                winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
            ),
        }),
        file: new winston.transports.File({
            // Write logs to logfile
            filename: 'logs/' + new Date().toISOString().split(':').join('.') + '.log',
            // filename: 'logs/' + Math.floor(Date.now() / 1000) + '.log',
            level: 'debug',
            format: winston.format.combine(
                winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
                winston.format.simple(),
                winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
            ),
        }),
    };
}
/**
 * initiate winston logger
 *
 * @returns {void}
 */
function startLogger() {
    Util.loggerTransports = createNewLoggerTransport();
    const myWinston = winston.createLogger({
        levels: winston.config.npm.levels,
        transports: [Util.loggerTransports.console, Util.loggerTransports.file],
    });
    const winstonError = myWinston.error;
    const winstonExtension = {
        /**
         * helper that prints better stack trace for errors
         *
         * @param {Error} ex the error
         * @param {string} [message] optional custom message to be printed as error together with the exception's message
         * @returns {void}
         */
        errorStack: function (ex, message) {
            if (message) {
                myWinston.error(message + ': ' + ex.message);
            }
            let stack;
            if (
                ['ETIMEDOUT', 'EHOSTUNREACH', 'ENOTFOUND', 'ECONNRESET', 'ECONNABORTED'].includes(
                    ex.code
                )
            ) {
                // the stack would just return a one-liner that does not help
                stack = new Error().stack;
            } else {
                stack = ex.stack;
            }
            myWinston.debug(stack);
            Util.signalFatalError();
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

    Util.logger.debug(`:: mcdev ${packageJsonMcdev.version} ::`);
}
startLogger();

module.exports = Util;
