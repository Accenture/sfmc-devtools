'use strict';

/**
 * @typedef {Object.<string,string>} TemplateMap
 */

const fs = require('fs-extra'); // ! do not switch to util/file.js to avoid circular dependency
const MetadataRef = require('../MetadataTypes');
const packageJsonMcdev = require('../../package.json');
const path = require('path');
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
    expectedAuthScope: [
        'accounts_read',
        'accounts_write',
        'approvals_read',
        'approvals_write',
        'audiences_read',
        'audiences_write',
        'automations_execute',
        'automations_read',
        'automations_write',
        'calendar_read',
        'calendar_write',
        'campaign_read',
        'campaign_write',
        'data_extensions_read',
        'data_extensions_write',
        'documents_and_images_read',
        'documents_and_images_write',
        'email_read',
        'email_send',
        'email_write',
        'event_notification_callback_create',
        'event_notification_callback_delete',
        'event_notification_callback_read',
        'event_notification_callback_update',
        'event_notification_subscription_create',
        'event_notification_subscription_delete',
        'event_notification_subscription_read',
        'event_notification_subscription_update',
        'file_locations_read',
        'file_locations_write',
        'journeys_execute',
        'journeys_read',
        'journeys_write',
        'key_manage_revoke',
        'key_manage_rotate',
        'key_manage_view',
        'list_and_subscribers_read',
        'list_and_subscribers_write',
        'marketing_cloud_connect_read',
        'marketing_cloud_connect_send',
        'marketing_cloud_connect_write',
        'offline',
        'ott_channels_read',
        'ott_channels_write',
        'ott_chat_messaging_read',
        'ott_chat_messaging_send',
        'push_read',
        'push_send',
        'push_write',
        'saved_content_read',
        'saved_content_write',
        'sms_read',
        'sms_send',
        'sms_write',
        'social_post',
        'social_publish',
        'social_read',
        'social_write',
        'tags_read',
        'tags_write',
        'tracking_events_read',
        'tracking_events_write',
        'users_read',
        'users_write',
        'web_publish',
        'web_read',
        'web_write',
        'webhooks_read',
        'webhooks_write',
        'workflows_read',
        'workflows_write',
    ],
    /**
     * defines how the properties.json should look like
     * used for creating a template and for checking if variables are set
     *
     * @returns {object} default properties
     */
    getDefaultProperties: function () {
        const configFileName = path.resolve(__dirname, this.boilerplateDirectory, 'config.json');
        if (!fs.existsSync(configFileName)) {
            this.logger.debug(`Default config file file not found in ${configFileName}`);
            return false;
        }
        const defaultProperties = fs.readJsonSync(configFileName);
        // set default name for parent BU
        defaultProperties.credentials.default.businessUnits[this.parentBuName] = '000000000';
        // set default retrieve values
        defaultProperties.metaDataTypes.retrieve = this.getRetrieveTypeChoices();

        return defaultProperties;
    },
    /**
     * helper for getDefaultProperties()
     * @returns {string[]} type choices
     */
    getRetrieveTypeChoices() {
        const typeChoices = [];
        for (const definition in MetadataRef.getDefinitions()) {
            if (
                Array.isArray(definition.typeRetrieveByDefault) ||
                definition.typeRetrieveByDefault === true
            ) {
                // complex types like assets are saved as array but to ease upgradability we
                // save the main type only unless the user deviates from our pre-selection.
                // Types that dont have subtypes set this field to true or false
                typeChoices.push(definition.type);
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
     * @param {object} properties javascript object in .mcdevrc.json
     * @param {boolean} [silent] set to true for internal use w/o cli output
     * @returns {boolean|String[]} file structure ok OR list of fields to be fixed
     */
    checkProperties: function (properties, silent) {
        if (!fs.existsSync(Util.configFileName) || !properties) {
            Util.logger.error(`\nCould not find ${Util.configFileName} in ${process.cwd()}.`);
            Util.logger.error(`Run 'mcdev init' to initialize your project.\n`);
            return false;
        }
        if (!fs.existsSync(Util.authFileName) || !properties) {
            Util.logger.error(`\nCould not find ${Util.authFileName} in ${process.cwd()}.`);
            Util.logger.error(`Run 'mcdev init' to initialize your project.\n`);
            return false;
        }

        // check if user is running older mcdev version than whats saved to the config
        if (properties.version && semver.gt(properties.version, packageJsonMcdev.version)) {
            // dont run this for Catalyst to MC DevTools migration
            Util.logger.error(
                `Your Accenture SFMC DevTools version ${packageJsonMcdev.version} is lower than your project's config version ${properties.version}`
            );
            const questions = [
                {
                    type: 'confirm',
                    name: 'runUpgradeNow',
                    message: `Do you want to run 'npm update -g mcdev' now? This may take a few minutes.`,
                    default: true,
                },
            ];
            inquirer.prompt(questions).then((responses) => {
                if (responses.runUpgradeNow) {
                    // use _execSync here to avoid a circular dependency
                    this.execSync('npm', ['update', '-g', 'mcdev']);
                }
            });
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
                                    !properties.credentials[cred].clientId ||
                                    properties.credentials[cred].clientId === '--- update me ---'
                                ) {
                                    errorMsgs.push(`invalid ClientId on ${cred}`);
                                    solutionSet.add(`Run 'mcdev init ${cred}'`);
                                }
                                if (
                                    !properties.credentials[cred].clientSecret ||
                                    properties.credentials[cred].clientSecret ===
                                        '--- update me ---'
                                ) {
                                    errorMsgs.push(`invalid ClientSecret on ${cred}`);
                                    solutionSet.add(`Run 'mcdev init ${cred}'`);
                                }
                                if (
                                    !properties.credentials[cred].tenant ||
                                    properties.credentials[cred].tenant === '--- update me ---'
                                ) {
                                    errorMsgs.push(`invalid tenant on ${cred}`);
                                    solutionSet.add(`Run 'mcdev init ${cred}'`);
                                }
                                if (
                                    !properties.credentials[cred].eid ||
                                    properties.credentials[cred].eid === 0
                                ) {
                                    errorMsgs.push(`invalid eid on ${cred}`);
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
                                        properties.credentials[cred].businessUnits[buName] !==
                                            '000000000'
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
        if (!properties.version || semver.gt(packageJsonMcdev.version, properties.version)) {
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
                Util.logger.info(
                    [
                        'Here is what you can do to fix these issues:',
                        ...Array.from(solutionSet),
                    ].join('\n- ')
                );
                const questions = [
                    {
                        type: 'confirm',
                        name: 'runUpgradeNow',
                        message: `Do you want to run 'mcdev upgrade' now?`,
                        default: true,
                    },
                ];
                inquirer.prompt(questions).then((responses) => {
                    if (responses.runUpgradeNow) {
                        // use _execSync here to avoid a circular dependency
                        this.execSync('mcdev', ['upgrade']);
                    }
                });

                return false;
            } else {
                return true;
            }
        }
    },
    loggerTransports: null,
    /**
     * Logger that creates timestamped log file in 'logs/' directory
     */
    logger: null,
    restartLogger: startLogger,
    /**
     * Logger helper for Metadata functions
     * @param {String} level of log (error, info, warn)
     * @param {String} type of metadata being referenced
     * @param {String} method name which log was called from
     * @param {*} payload generic object which details the error
     * @param {String} [source] key/id of metadata which relates to error
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
     * @param {String|Object} str JSON object or its stringified version, which has values to be replaced
     * @param {TemplateMap} obj key value object which contains keys to be replaced and values to be replaced with
     * @returns {String|Object} replaced version of str
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

        sortable.sort(function (a, b) {
            return b[1].length - a[1].length;
        });
        for (const pair of sortable) {
            const escVal = pair[1].replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
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
     * @param {Object} objs object of objects to be searched
     * @param {String} val value to be searched for
     * @returns {String} key
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
     * @param {String[]} metadataTypes which should be retrieved/deployed
     * @returns {String[]} retrieve/deploy order as array
     */
    getMetadataHierachy(metadataTypes) {
        const dependencies = [];
        // loop through all metadata types which are being retrieved/deployed
        const subTypeDeps = {};
        for (const metadataType of metadataTypes) {
            const type = metadataType.split('-')[0];
            // if they have dependencies then add a dependency pair for each type
            if (MetadataRef.getDefinition(type).dependencies.length > 0) {
                dependencies.push(
                    ...MetadataRef.getDefinition(type).dependencies.map((dep) => {
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
     * standardized method for getting data from cache.
     *
     * @param {Object} cache data retrieved from sfmc instance
     * @param {String} metadataType metadata type ie. query
     * @param {String} searchValue unique identifier of metadata being looked for
     * @param {String} searchField field name (key in object) which contains the unique identifer
     * @param {String} returnField field which should be returned
     * @returns {String} unique user definable metadata key (usually external/customer key)
     */
    getFromCache(cache, metadataType, searchValue, searchField, returnField) {
        for (const key in cache[metadataType]) {
            if (Util.resolveObjPath(searchField, cache[metadataType][key]) == searchValue) {
                try {
                    if (Util.resolveObjPath(returnField, cache[metadataType][key])) {
                        return Util.resolveObjPath(returnField, cache[metadataType][key]);
                    } else {
                        throw new Error();
                    }
                } catch (ex) {
                    throw new Error(
                        `${metadataType} with ${searchField} '${searchValue}' does not have field '${returnField}'`
                    );
                }
            }
        }
        throw new Error(
            `Missing one or more dependent metadata. ${metadataType} with ${searchField}='${searchValue}' was not found. Please ensure to create this first or include it in the deployment package.`
        );
    },
    /**
     * let's you dynamically walk down an object and get a value
     * @param {String} path 'fieldA.fieldB.fieldC'
     * @param {Object} obj some parent object
     * @returns {any} value of obj.path
     */
    resolveObjPath(path, obj) {
        return path.split('.').reduce(function (prev, curr) {
            return prev ? prev[curr] : null;
        }, obj);
    },
    /**
     * standardized method for getting data from cache - adapted for special case of lists
     * ! keeping this in util/util.js rather than in metadataTypes/List.js to avoid potential circular dependencies
     *
     * @param {Object} cache data retrieved from sfmc instance
     * @param {String} listPathName folderPath/ListName combo of list
     * @param {String} returnField ObjectID or ID
     * @returns {String} unique ObjectId of list
     */
    getListObjectIdFromCache(cache, listPathName, returnField) {
        let folderPath = listPathName.split('/');
        const listName = folderPath.pop();
        folderPath = folderPath.join('/');
        for (const key in cache['list']) {
            if (
                cache['list'][key].ListName === listName &&
                cache['list'][key].r__folder_Path === folderPath
            ) {
                try {
                    if (cache['list'][key][returnField]) {
                        return cache['list'][key][returnField];
                    } else {
                        throw new Error();
                    }
                } catch (ex) {
                    throw new Error(
                        `${'list'} with ListName='${listName}' and r__folder_Path='${folderPath}' does not have field '${returnField}'`
                    );
                }
            }
        }
        throw new Error(
            `Missing one or more dependent metadata. list with ListName='${listName}' and r__folder_Path='${folderPath}' was not found. Please ensure to create this first or include it in the deployment package.`
        );
    },

    /**
     * standardized method for getting data from cache - adapted for special case of lists
     * ! keeping this in util/util.js rather than in metadataTypes/List.js to avoid potential circular dependencies
     *
     * @param {Object} cache data retrieved from sfmc instance
     * @param {String} searchValue unique identifier of metadata being looked for
     * @param {String} searchField ObjectID or ID
     * @returns {String} unique folderPath/ListName combo of list
     */
    getListPathNameFromCache(cache, searchValue, searchField) {
        const returnField1 = 'r__folder_Path';
        const returnField2 = 'ListName';
        for (const key in cache['list']) {
            if (cache['list'][key][searchField] === searchValue) {
                try {
                    if (cache['list'][key][returnField1] && cache['list'][key][returnField2]) {
                        return (
                            cache['list'][key][returnField1] +
                            '/' +
                            cache['list'][key][returnField2]
                        );
                    } else {
                        throw new Error();
                    }
                } catch (ex) {
                    throw new Error(
                        `${'list'} with ${searchField}='${searchValue}' does not have the fields ${returnField1} and ${returnField2}`
                    );
                }
            }
        }
        throw new Error(
            `Missing one or more dependent metadata. list with ${searchField}='${searchValue}' was not found. Please ensure to create this first or include it in the deployment package.`
        );
    },
    /**
     * retry on network issues
     * @param {String} errorMsg what to print behind "Connection error. "
     * @param {Function} callback what to try executing
     * @param {Boolean} [silentError=false] prints retry messages to log only; default=false
     * @param {Number} [retries=1] number of retries; default=1
     * @returns {Promise<void>} -
     */
    async retryOnError(errorMsg, callback, silentError, retries) {
        if ('undefined' === typeof retries || retries === null) {
            retries = 1;
        }
        try {
            await callback();
        } catch (ex) {
            if (
                retries > 0 &&
                ex.code &&
                ['ETIMEDOUT', 'EHOSTUNREACH', 'ENOTFOUND', 'ECONNRESET'].includes(ex.code)
            ) {
                retries--;
                if (silentError) {
                    Util.logger.debug(
                        `Connection error. ${errorMsg} - Retries left: ${retries + 1}`
                    );
                } else {
                    Util.logger.error(`Connection error. ${errorMsg}`);
                }
                Util.logger.debug(ex.stack);
                await this.retryOnError(errorMsg, callback, retries);
            } else if (
                ex.code &&
                ['ETIMEDOUT', 'EHOSTUNREACH', 'ENOTFOUND', 'ECONNRESET'].includes(ex.code)
            ) {
                Util.logger.debug(ex.stack);
                if (Util.logger.level === 'debug') {
                    console.log(ex.stack);
                }
                throw new Error(
                    `Failed due to a Connection Error (${ex.code}) - Please check your network connection and try again`
                );
            }
            throw ex;
        }
    },
    /**
     * helper to run other commands as if run manually by user
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
     * ensure provided MarketList exists and it's content including markets and BUs checks out
     * @param {String} mlName name of marketList
     * @param {Object} properties General configuration to be used in retrieve
     * @param {Object} properties.markets list of template variable combos
     * @param {Object} properties.marketList list of bu-market combos
     * @param {Object} properties.credentials list of credentials and their BUs
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
     * check if a market name exists in current mcdev config
     * @param {String} market market localizations
     * @returns {Boolean} found market or not
     */
    checkMarket(market) {
        if (global.config.markets[market]) {
            return true;
        } else {
            Util.logger.error(`Could not find the market '${market}' in your configuration file.`);
            const marketArr = [];
            for (const oneMarket in global.config.markets) {
                marketArr.push(oneMarket);
            }
            if (marketArr.length) {
                Util.logger.info('Available markets are: ' + marketArr.join(', '));
            }
            return false;
        }
    },
};
/**
 * wrapper around our standard winston logging to console and logfile
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
 * @returns {void}
 */
function startLogger() {
    Util.loggerTransports = createNewLoggerTransport();
    Util.logger = winston.createLogger({
        levels: winston.config.npm.levels,
        transports: [Util.loggerTransports.console, Util.loggerTransports.file],
    });
    Util.logger.debug(`:: mcdev ${packageJsonMcdev.version} ::`);
}
startLogger();

module.exports = Util;
