'use strict';

import { Util } from './util/util.js';
import auth from './util/auth.js';
import File from './util/file.js';
import config from './util/config.js';
import Init from './util/init.js';
import InitGit from './util/init.git.js';
import Cli from './util/cli.js';
import DevOps from './util/devops.js';
import BuHelper from './util/businessUnit.js';
import Builder from './Builder.js';
import Deployer from './Deployer.js';
import MetadataTypeInfo from './MetadataTypeInfo.js';
import MetadataTypeDefinitions from './MetadataTypeDefinitions.js';
import Retriever from './Retriever.js';
import cache from './util/cache.js';
import ReplaceContentBlockReference from './util/replaceContentBlockReference.js';
import pLimit from 'p-limit';
import path from 'node:path';

import { confirm } from '@inquirer/prompts';

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
class Mcdev {
    /**
     * @returns {string} current version of mcdev
     */
    static version() {
        console.log('mcdev v' + Util.packageJsonMcdev.version); // eslint-disable-line no-console
        return Util.packageJsonMcdev.version;
    }

    /**
     * helper method to use unattended mode when including mcdev as a package
     *
     * @param {SkipInteraction} [skipInteraction] signals what to insert automatically for things usually asked via wizard
     * @returns {void}
     */
    static setSkipInteraction(skipInteraction) {
        Util.skipInteraction = skipInteraction;
    }

    /**
     * configures what is displayed in the console
     *
     * @param {object} argv list of command line parameters given by user
     * @param {boolean} [argv.silent] only errors printed to CLI
     * @param {boolean} [argv.verbose] chatty user CLI output
     * @param {boolean} [argv.debug] enables developer output & features
     * @returns {void}
     */
    static setLoggingLevel(argv) {
        Util.setLoggingLevel(argv);
    }

    /**
     * allows setting system wide / command related options
     *
     * @param {object} argv list of command line parameters given by user
     * @returns {void}
     */
    static setOptions(argv) {
        const knownOptions = [
            'api',
            'changeKeyField',
            'changeKeyValue',
            'commitHistory',
            'dependencies',
            'errorLog',
            'execute',
            'filter',
            'fixShared',
            'format',
            'fromRetrieve',
            'ignoreFolder',
            'ignoreSfFields',
            'json',
            'keySuffix',
            'like',
            'matchName',
            'noLogColors',
            'noLogFile',
            'noUpdate',
            'autoMidSuffix',
            'publish',
            'purge',
            'range',
            'referenceFrom',
            'referenceTo',
            'refresh',
            'retrieve',
            'schedule',
            'skipDeploy',
            'skipInteraction',
            'skipRetrieve',
            'skipStatusCheck',
            'skipValidation',
            'validate',
            '_runningTest',
            '_welcomeMessageShown',
        ];
        for (const option of knownOptions) {
            if (argv[option] !== undefined) {
                Util.OPTIONS[option] = argv[option];
            }
        }
        // set logging level
        const loggingOptions = ['silent', 'verbose', 'debug'];
        for (const option of loggingOptions) {
            if (argv[option] !== undefined) {
                this.setLoggingLevel(argv);
                break;
            }
        }
        // set skip interaction
        if (argv.skipInteraction !== undefined) {
            this.setSkipInteraction(argv.skipInteraction);
        }
    }

    /**
     * handler for 'mcdev createDeltaPkg
     *
     * @param {object} argv yargs parameters
     * @param {string} [argv.commitrange] git commit range via positional
     * @param {string} [argv.range] git commit range via option
     * @param {string} [argv.filter] filter file paths that start with any
     * @param {number} [argv.commitHistory] filter file paths that start with any
     * @param {DeltaPkgItem[]} [argv.diffArr] list of files to include in delta package (skips git diff when provided)
     * @returns {Promise.<DeltaPkgItem[]>} list of changed items
     */
    static async createDeltaPkg(argv) {
        Util.startLogger();
        Util.logger.info('Create Delta Package ::');
        const properties = await config.getProperties();
        if (!(await config.checkProperties(properties))) {
            return null;
        }
        if (argv.commitrange) {
            Util.logger.warn(
                `Depecation Notice: Please start using --range to define the commit range or target branch. The positional argument will be removed in the next major release.`
            );
        }
        const range = argv.commitrange || Util.OPTIONS.range;
        try {
            return await (argv.filter
                ? // get source market and source BU from config
                  DevOps.getDeltaList(properties, range, true, argv.filter, argv.commitHistory)
                : // If no custom filter was provided, use deployment marketLists & templating
                  DevOps.buildDeltaDefinitions(
                      properties,
                      range,
                      argv.diffArr,
                      argv.commitHistory
                  ));
        } catch (ex) {
            Util.logger.error(ex.message);
        }
    }

    /**
     * @returns {Promise} .
     */
    static async selectTypes() {
        Util.startLogger();
        const properties = await config.getProperties();
        if (!(await config.checkProperties(properties))) {
            return null;
        }
        await Cli.selectTypes(properties);
    }

    /**
     * @returns {ExplainType[]} list of supported types with their apiNames
     */
    static explainTypes() {
        return Cli.explainTypes();
    }

    /**
     * @returns {Promise.<boolean>} success flag
     */
    static async upgrade() {
        Util.startLogger();
        const properties = await config.getProperties();
        if (!properties) {
            Util.logger.error('No config found. Please run mcdev init');
            return false;
        }
        if ((await InitGit.initGitRepo()).status === 'error') {
            return false;
        }

        return Init.upgradeProject(properties, false);
    }

    /**
     * helper to show an off-the-logs message to users
     */
    static #welcomeMessage() {
        if (Util.OPTIONS._welcomeMessageShown) {
            // ensure we don't spam the user in case methods are called multiple times
            return;
        }
        Util.OPTIONS._welcomeMessageShown = true;

        const color = Util.isRunViaVSCodeExtension
            ? { reset: '', bgWhite: '', fgBlue: '' }
            : Util.color;
        /* eslint-disable no-console */
        if (process.env['USERDNSDOMAIN'] === 'DIR.SVC.ACCENTURE.COM') {
            // Accenture internal message
            console.log(
                `\n` +
                    `    Thank you for using Accenture SFMC DevTools on your Accenture laptop!\n` +
                    `    We are trying to understand who is using mcdev across the globe and would therefore appreciate it if you left a message\n` +
                    `    in our Accenture Teams channel ${color.bgWhite}telling us about your journey with mcdev${color.reset}: ${color.fgBlue}https://go.accenture.com/mcdevTeams${color.reset}.\n` +
                    `\n` +
                    `    For any questions or concerns, please feel free to create a ticket in GitHub: ${color.fgBlue}https://bit.ly/mcdev-support${color.reset}.\n`
            );
        } else {
            // external message
            console.log(
                `\n` +
                    `    Thank you for using Accenture SFMC DevTools!\n` +
                    `\n` +
                    `    For any questions or concerns, please feel free to create a ticket in GitHub: ${color.fgBlue}https://bit.ly/mcdev-support${color.reset}.\n`
            );
        }
        /* eslint-enable no-console */
    }

    /**
     * Retrieve all metadata from the specified business unit into the local file system.
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {string[] | TypeKeyCombo} [selectedTypesArr] limit retrieval to given metadata type
     * @param {string[]} [keys] limit retrieval to given metadata key
     * @param {boolean} [changelogOnly] skip saving, only create json in memory
     * @returns {Promise.<object>} -
     */
    static async retrieve(businessUnit, selectedTypesArr, keys, changelogOnly) {
        this.#welcomeMessage();
        console.time('Time'); // eslint-disable-line no-console
        Util.startLogger();
        Util.logger.info('mcdev:: Retrieve');
        const properties = await config.getProperties();
        if (!(await config.checkProperties(properties))) {
            // return null here to avoid seeing 2 error messages for the same issue
            return null;
        }

        // assume a list was passed in and check each entry's validity
        if (selectedTypesArr) {
            for (const selectedType of Array.isArray(selectedTypesArr)
                ? selectedTypesArr
                : Object.keys(selectedTypesArr)) {
                if (!Util._isValidType(selectedType)) {
                    return;
                }
            }
        }
        const resultsObj = {};
        if (businessUnit === '*') {
            Util.logger.info(':: Retrieving all BUs for all credentials');
            let counter_credTotal = 0;
            for (const cred in properties.credentials) {
                Util.logger.info(`:: Retrieving all BUs for ${cred}`);
                let counter_credBu = 0;
                for (const bu in properties.credentials[cred].businessUnits) {
                    resultsObj[`${cred}/${bu}`] = await this.#retrieveBU(
                        cred,
                        bu,
                        selectedTypesArr,
                        keys
                    );
                    counter_credBu++;
                    Util.startLogger(true);
                }
                counter_credTotal += counter_credBu;
                Util.logger.info(`:: ${counter_credBu} BUs of ${cred}\n`);
            }
            const credentialCount = Object.keys(properties.credentials).length;
            Util.logger.info(
                `:: Done for ${counter_credTotal} BUs of ${credentialCount} credential${
                    credentialCount === 1 ? '' : 's'
                } in total\n`
            );
        } else {
            let [cred, bu] = businessUnit ? businessUnit.split('/') : [null, null];
            // to allow all-BU via user selection we need to run this here already
            if (
                properties.credentials &&
                (!properties.credentials[cred] ||
                    (bu !== '*' && !properties.credentials[cred].businessUnits[bu]))
            ) {
                const buObject = await Cli.getCredentialObject(
                    properties,
                    cred === null ? null : cred + '/' + bu,
                    null,
                    true
                );
                if (buObject === null) {
                    return;
                } else {
                    cred = buObject.credential;
                    bu = buObject.businessUnit;
                }
            }

            if (bu === '*' && properties.credentials && properties.credentials[cred]) {
                Util.logger.info(`:: Retrieving all BUs for ${cred}`);
                let counter_credBu = 0;
                for (const bu in properties.credentials[cred].businessUnits) {
                    resultsObj[`${cred}/${bu}`] = await this.#retrieveBU(
                        cred,
                        bu,
                        selectedTypesArr,
                        keys
                    );
                    counter_credBu++;
                    Util.startLogger(true);
                }
                Util.logger.info(`:: Done for ${counter_credBu} BUs of ${cred}\n`);
            } else {
                // retrieve a single BU; return
                const retrieveChangelog = await this.#retrieveBU(
                    cred,
                    bu,
                    selectedTypesArr,
                    keys,
                    changelogOnly
                );
                if (changelogOnly) {
                    console.timeEnd('Time'); // eslint-disable-line no-console
                    return retrieveChangelog;
                } else {
                    resultsObj[`${cred}/${bu}`] = retrieveChangelog;
                }
                Util.logger.info(`:: Done\n`);
            }
        }

        // merge all results into one object
        for (const credBu in resultsObj) {
            for (const type in resultsObj[credBu]) {
                const base = resultsObj[credBu][type][0];

                for (let i = 1; i < resultsObj[credBu][type].length; i++) {
                    // merge all items into the first array
                    Object.assign(base, resultsObj[credBu][type][i]);
                }
                resultsObj[credBu][type] = resultsObj[credBu][type][0];
            }
        }
        console.timeEnd('Time'); // eslint-disable-line no-console

        return resultsObj;
    }

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
    static async #retrieveBU(cred, bu, selectedTypesArr, keys, changelogOnly) {
        // ensure changes to the selectedTypesArr on one BU do not affect other BUs called in the same go
        selectedTypesArr = structuredClone(selectedTypesArr);

        const properties = await config.getProperties();
        if (!(await config.checkProperties(properties))) {
            return null;
        }
        const buObject = await Cli.getCredentialObject(
            properties,
            cred === null ? null : cred + '/' + bu,
            null,
            true
        );
        if (buObject !== null) {
            cache.initCache(buObject);
            cred = buObject.credential;
            bu = buObject.businessUnit;
            // clean up old folders after types were renamed
            // TODO: Remove renamedTypes-logic 6 months after version 5 release
            const renamedTypes = {
                attributeSet: 'setDefinition',
                emailSend: 'emailSendDefinition',
                event: 'eventDefinition',
                fileLocation: 'ftpLocation',
                journey: 'interaction',
                triggeredSend: 'triggeredSendDefinition',
                user: 'accountUser',
            };
            Util.logger.info('');
            Util.logger.info(`:: Retrieving ${cred}/${bu}`);
            const retrieveTypesArr = [];
            if (selectedTypesArr) {
                for (const selectedType of Array.isArray(selectedTypesArr)
                    ? selectedTypesArr
                    : Object.keys(selectedTypesArr)) {
                    const { type, subType } = Util.getTypeAndSubType(selectedType);
                    const removePathArr = [properties.directories.retrieve, cred, bu, type];
                    if (
                        type &&
                        subType &&
                        MetadataTypeInfo[type] &&
                        MetadataTypeDefinitions[type].subTypes.includes(subType)
                    ) {
                        // Clear output folder structure for selected sub-type
                        removePathArr.push(subType);
                        retrieveTypesArr.push(selectedType);
                    } else if (type && MetadataTypeInfo[type]) {
                        // Clear output folder structure for selected type
                        retrieveTypesArr.push(type);
                    }
                    const areKeySet = Array.isArray(selectedTypesArr)
                        ? keys
                        : Object.values(selectedTypesArr).filter(Boolean).length;
                    if (!areKeySet) {
                        // dont delete directories if we are just re-retrieving a single file
                        await File.remove(File.normalizePath(removePathArr));
                        // clean up old folders after types were renamed
                        // TODO: Remove this with version 5.0.0
                        if (renamedTypes[type]) {
                            await File.remove(
                                File.normalizePath([
                                    properties.directories.retrieve,
                                    cred,
                                    bu,
                                    renamedTypes[type],
                                ])
                            );
                        }
                    }
                }
            }
            if (!retrieveTypesArr.length) {
                // assume no type was given and config settings are used instead:
                // Clear output folder structure
                await File.remove(File.normalizePath([properties.directories.retrieve, cred, bu]));
                // removes subtypes and removes duplicates
                retrieveTypesArr.push(
                    ...new Set(properties.metaDataTypes.retrieve.map((type) => type.split('-')[0]))
                );
                for (const selectedType of retrieveTypesArr) {
                    const test = Util._isValidType(selectedType);
                    if (!test) {
                        Util.logger.error(
                            `Please remove the type ${selectedType} from your ${Util.configFileName}`
                        );
                        return;
                    }
                }
            }
            const retriever = new Retriever(properties, buObject);

            try {
                // await is required or the calls end up conflicting
                const retrieveChangelog = await retriever.retrieve(
                    retrieveTypesArr,
                    Array.isArray(selectedTypesArr) ? keys : selectedTypesArr,
                    null,
                    changelogOnly
                );
                return retrieveChangelog;
            } catch (ex) {
                Util.logger.errorStack(ex, 'mcdev.retrieve failed');
            }
        }
    }

    /**
     * Deploys all metadata located in the 'deploy' directory to the specified business unit
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {string[] | TypeKeyCombo} [selectedTypesArr] limit deployment to given metadata type
     * @param {string[]} [keyArr] limit deployment to given metadata keys
     * @returns {Promise.<Object.<string, MultiMetadataTypeMap>>} deployed metadata per BU (first key: bu name, second key: metadata type)
     */
    static async deploy(businessUnit, selectedTypesArr, keyArr) {
        this.#welcomeMessage();
        console.time('Time'); // eslint-disable-line no-console
        Util.startLogger();
        const deployResult = await Deployer.deploy(businessUnit, selectedTypesArr, keyArr);
        console.timeEnd('Time'); // eslint-disable-line no-console
        return deployResult;
    }

    /**
     * Creates template file for properties.json
     *
     * @param {string} [credentialsName] identifying name of the installed package / project
     * @returns {Promise.<void>} -
     */
    static async initProject(credentialsName) {
        Util.startLogger();
        Util.logger.info('mcdev:: Setting up project');
        const properties = await config.getProperties(!!credentialsName, true);
        try {
            await Init.initProject(properties, credentialsName);
        } catch (ex) {
            Util.logger.error(ex.message);
        }
    }

    /**
     * Clones an existing project from git repository and installs it
     *
     * @returns {Promise.<void>} -
     */
    static async joinProject() {
        Util.startLogger();
        Util.logger.info('mcdev:: Joining an existing project');
        try {
            await Init.joinProject();
        } catch (ex) {
            Util.logger.error(ex.message);
        }
    }

    /**
     * Refreshes BU names and ID's from MC instance
     *
     * @param {string} credentialsName identifying name of the installed package / project
     * @returns {Promise.<void>} -
     */
    static async findBUs(credentialsName) {
        Util.startLogger();
        Util.logger.info('mcdev:: Load BUs');
        const properties = await config.getProperties();
        if (!(await config.checkProperties(properties))) {
            return null;
        }
        const buObject = await Cli.getCredentialObject(properties, credentialsName, true);
        if (buObject !== null) {
            BuHelper.refreshBUProperties(properties, buObject.credential);
        }
    }

    /**
     * Creates docs for supported metadata types in Markdown and/or HTML format
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {string} type metadata type
     * @returns {Promise.<void>} -
     */
    static async document(businessUnit, type) {
        Util.startLogger();
        Util.logger.info('mcdev:: Document');
        const properties = await config.getProperties();
        if (!(await config.checkProperties(properties))) {
            return null;
        }
        if (type && !MetadataTypeInfo[type]) {
            Util.logger.error(`:: '${type}' is not a valid metadata type`);
            return;
        }
        try {
            const parentBUOnlyTypes = ['user', 'role'];
            const buObject = await Cli.getCredentialObject(
                properties,
                parentBUOnlyTypes.includes(type) ? businessUnit.split('/')[0] : businessUnit,
                parentBUOnlyTypes.includes(type) ? Util.parentBuName : null
            );
            if (buObject !== null) {
                MetadataTypeInfo[type].properties = properties;
                MetadataTypeInfo[type].buObject = buObject;
                MetadataTypeInfo[type].document();
            }
        } catch (ex) {
            Util.logger.error('mcdev.document ' + ex.message);
            Util.logger.debug(ex.stack);
            Util.logger.info(
                'If the directoy does not exist, you may need to retrieve this BU first.'
            );
        }
    }

    /**
     * deletes metadata from MC instance by key
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {string | TypeKeyCombo} selectedTypes supported metadata type (single) or complex object
     * @param {string[] | string} [keys] Identifier of metadata
     * @returns {Promise.<boolean>} true if successful, false otherwise
     */
    static async deleteByKey(businessUnit, selectedTypes, keys) {
        Util.startLogger();
        Util.logger.info('mcdev:: delete');

        /** @typedef {string[]} */
        let selectedTypesArr;

        /** @typedef {TypeKeyCombo} */
        let selectedTypesObj;
        let keyArr;
        keyArr = 'string' === typeof keys ? [keys] : keys;
        if ('string' === typeof selectedTypes) {
            selectedTypesArr = [selectedTypes];
        } else {
            selectedTypesObj = selectedTypes;
            // reset keys array because it will be overriden by values from selectedTypesObj
            keyArr = null;
        }
        // check if types are valid
        for (const selectedType of selectedTypesArr || Object.keys(selectedTypesObj)) {
            if (!Util._isValidType(selectedType)) {
                return;
            }
        }
        const properties = await config.getProperties();
        if (!(await config.checkProperties(properties))) {
            return null;
        }
        const buObject = await Cli.getCredentialObject(properties, businessUnit);
        if (!buObject) {
            return;
        }
        let client;
        try {
            client = auth.getSDK(buObject);
        } catch (ex) {
            Util.logger.error(ex.message);
            return;
        }
        let status = true;
        for (const type of selectedTypesArr || Object.keys(selectedTypesObj)) {
            keyArr = selectedTypesArr ? keyArr : selectedTypesObj[type];
            if (!keyArr) {
                Util.logger.error(`No keys set for ${type}`);
                return;
            }
            MetadataTypeInfo[type].client = client;
            MetadataTypeInfo[type].properties = properties;
            MetadataTypeInfo[type].buObject = buObject;
            const deleteLimit = pLimit(20);

            await Promise.allSettled(
                keyArr.map((key) =>
                    deleteLimit(async () => {
                        // Util.logger.info(
                        //     Util.getGrayMsg(` - Deleting ${type} ${key} on BU ${businessUnit}`)
                        // );
                        try {
                            const result = await MetadataTypeInfo[type].deleteByKey(key);
                            status &&= result;
                        } catch (ex) {
                            Util.logger.errorStack(
                                ex,
                                ` - Deleting ${type} ${key} on BU ${businessUnit} failed`
                            );
                            status = false;
                        }
                        return status;
                    })
                )
            );
        }

        return status;
    }

    /**
     * get name & key for provided id
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {string} type supported metadata type
     * @param {string} id Identifier of metadata
     * @returns {Promise.<{key:string, name:string, path:string}>} key, name and path of metadata; null if not found
     */
    static async resolveId(businessUnit, type, id) {
        Util.startLogger();
        if (!Util.OPTIONS.json) {
            Util.logger.info('mcdev:: resolveId');
        }
        if (!Util._isValidType(type)) {
            return;
        }
        const properties = await config.getProperties();
        if (!(await config.checkProperties(properties))) {
            return null;
        }
        const buObject = await Cli.getCredentialObject(properties, businessUnit);
        if (buObject !== null) {
            try {
                MetadataTypeInfo[type].client = auth.getSDK(buObject);
            } catch (ex) {
                Util.logger.error(ex.message);
                return;
            }
            if (!Util.OPTIONS.json) {
                Util.logger.info(
                    Util.getGrayMsg(` - Searching ${type} with id ${id} on BU ${businessUnit}`)
                );
            }
            try {
                MetadataTypeInfo[type].properties = properties;
                MetadataTypeInfo[type].buObject = buObject;
                return await MetadataTypeInfo[type].resolveId(id);
            } catch (ex) {
                Util.logger.errorStack(ex, ` - Could not resolve ID of ${type} ${id}`);
            }
        }
    }

    /**
     * ensures triggered sends are restarted to ensure they pick up on changes of the underlying emails
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {string[] | TypeKeyCombo} selectedTypes limit to given metadata types
     * @param {string[]} [keys] customerkey of the metadata
     * @returns {Promise.<Object.<string, Object.<string, string[]>>>} key: business unit name, key2: type, value: list of affected item keys
     */
    static async refresh(businessUnit, selectedTypes, keys) {
        return this.#runMethod('refresh', businessUnit, selectedTypes, keys);
    }

    /**
     * method for contributors to get details on SOAP objects
     *
     * @param {string} type references credentials from properties.json
     * @param {string} [businessUnit] defaults to first credential's ParentBU
     * @returns {Promise.<void>} -
     */
    static async describeSoap(type, businessUnit) {
        Util.startLogger();
        Util.logger.info('mcdev:: describe SOAP');
        const properties = await config.getProperties();
        if (!(await config.checkProperties(properties))) {
            return null;
        }
        const credential = Object.keys(properties.credentials)[0];
        businessUnit ||=
            credential + '/' + Object.keys(properties.credentials[credential].businessUnits)[0];
        const buObject = await Cli.getCredentialObject(properties, businessUnit);
        if (!buObject) {
            return;
        }
        try {
            const client = auth.getSDK(buObject);
            const response = await client.soap.describe(type);
            if (response?.ObjectDefinition?.Properties) {
                Util.logger.info(
                    `Properties for SOAP object ${response.ObjectDefinition.ObjectType}:`
                );
                const properties = response.ObjectDefinition.Properties.map((prop) => {
                    delete prop.PartnerKey;
                    delete prop.ObjectID;
                    return prop;
                });
                if (Util.OPTIONS.json) {
                    console.log(JSON.stringify(properties, null, 2)); // eslint-disable-line no-console
                } else {
                    console.table(properties); // eslint-disable-line no-console
                }
                return properties;
            } else {
                throw new Error(
                    `Soap object ${type} not found. Please check the spelling and retry`
                );
            }
        } catch (ex) {
            Util.logger.error(ex.message);
        }
    }

    /**
     * Converts metadata to legacy format. Output is saved in 'converted' directory
     *
     * @param {string} businessUnit references credentials from properties.json
     * @returns {Promise.<void>} -
     */
    static async badKeys(businessUnit) {
        Util.startLogger();
        const properties = await config.getProperties();
        if (!(await config.checkProperties(properties))) {
            return null;
        }
        const buObject = await Cli.getCredentialObject(properties, businessUnit);
        if (buObject !== null) {
            Util.logger.info('Gathering list of Name<>External Key mismatches (bad keys)');
            const retrieveDir = File.filterIllegalPathChars(
                File.normalizePath([
                    properties.directories.retrieve,
                    buObject.credential,
                    buObject.businessUnit,
                ])
            );
            const docPath = File.normalizePath([
                properties.directories.docs,
                'badKeys',
                buObject.credential,
            ]);
            const filename = File.normalizePath([
                docPath,
                File.filterIllegalFilenames(buObject.businessUnit) + '.badKeys.md',
            ]);
            await File.ensureDir(docPath);
            if (await File.pathExists(filename)) {
                await File.remove(filename);
            }

            const regex = new RegExp(String.raw`(\w+-){4}\w+`);
            await File.ensureDir(retrieveDir);
            const metadata = await Deployer.readBUMetadata(retrieveDir, null, true);
            let output = '# List of Metadata with Name-Key mismatches\n';
            for (const metadataType in metadata) {
                let listEntries = '';
                for (const entry in metadata[metadataType]) {
                    const metadataEntry = metadata[metadataType][entry];
                    if (regex.test(entry)) {
                        if (metadataType === 'query' && metadataEntry.Status === 'Inactive') {
                            continue;
                        }
                        listEntries +=
                            '- ' +
                            entry +
                            (metadataEntry.name || metadataEntry.Name
                                ? ' => ' + (metadataEntry.name || metadataEntry.Name)
                                : '') +
                            '\n';
                    }
                }
                if (listEntries !== '') {
                    output += '\n## ' + metadataType + '\n\n' + listEntries;
                }
            }
            await File.writeToFile(
                docPath,
                File.filterIllegalFilenames(buObject.businessUnit) + '.badKeys',
                'md',
                output
            );
            Util.logger.info('Bad keys documented in ' + filename);
        }
    }

    /**
     * Retrieve a specific metadata file and templatise.
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {string} selectedType supported metadata type
     * @param {string[]} name name of the metadata
     * @param {string} market market which should be used to revert template
     * @returns {Promise.<MultiMetadataTypeList>} -
     */
    static async retrieveAsTemplate(businessUnit, selectedType, name, market) {
        Util.startLogger();
        Util.logger.warn(
            'mcdev:: [DEPRECATED] Retrieve as Template [DEPRECATED] - use "retrieve" + "buildTemplate" instead'
        );
        const properties = await config.getProperties();
        if (!(await config.checkProperties(properties))) {
            return null;
        }
        if (!Util._isValidType(selectedType)) {
            return;
        }
        const { type, subType } = Util.getTypeAndSubType(selectedType);

        let retrieveTypesArr;
        if (
            type &&
            subType &&
            MetadataTypeInfo[type] &&
            MetadataTypeDefinitions[type].subTypes.includes(subType)
        ) {
            retrieveTypesArr = [selectedType];
        } else if (type && MetadataTypeInfo[type]) {
            retrieveTypesArr = [type];
        }
        const buObject = await Cli.getCredentialObject(properties, businessUnit);
        if (buObject !== null) {
            cache.initCache(buObject);
            const retriever = new Retriever(properties, buObject);
            if (Util.checkMarket(market, properties)) {
                return retriever.retrieve(retrieveTypesArr, name, properties.markets[market]);
            }
        }
    }

    /**
     * @param {string} businessUnit references credentials from properties.json
     * @param {TypeKeyCombo} typeKeyList limit retrieval to given metadata type
     * @returns {Promise.<TypeKeyCombo>} selected types including dependencies
     */
    static async addDependentCbReferences(businessUnit, typeKeyList) {
        if (!Util.OPTIONS.dependencies) {
            return;
        }
        const initialAssetNumber = typeKeyList['asset']?.length || 0;
        const properties = await config.getProperties();
        const buObject = await Cli.getCredentialObject(properties, businessUnit);
        Util.logger.info(
            'Searching for additional dependencies that were linked via ContentBlockByKey, ContentBlockByName and ContentBlockById'
        );

        await ReplaceContentBlockReference.createCache(properties, buObject, true);

        // because we re-use the replaceReference logic here we need to manually set this value
        /** @type {ContentBlockConversionTypes[]} */
        Util.OPTIONS.referenceFrom = ['key', 'name', 'id'];
        /** @type {ContentBlockConversionTypes} */
        Util.OPTIONS.referenceTo = 'key';

        /** @type {Set.<string>} */
        const assetDependencies = new Set();
        const retrieveDir = File.filterIllegalPathChars(
            File.normalizePath([
                properties.directories.retrieve,
                buObject.credential,
                buObject.businessUnit,
            ])
        );
        // check all non-asset types for dependencies
        for (const depType in typeKeyList) {
            if (
                !Object.prototype.hasOwnProperty.call(
                    MetadataTypeInfo[depType],
                    'replaceCbReference'
                ) ||
                depType === 'asset'
            ) {
                continue;
            }
            MetadataTypeInfo[depType].properties = properties;
            MetadataTypeInfo[depType].buObject = buObject;
            await MetadataTypeInfo[depType].getCbReferenceKeys(
                typeKeyList[depType],
                retrieveDir,
                assetDependencies
            );
        }
        // add dependencies to selectedTypes
        if (assetDependencies.size) {
            const depType = 'asset';
            if (typeKeyList[depType]) {
                typeKeyList[depType].push(...assetDependencies);
            } else {
                typeKeyList[depType] = [...assetDependencies];
            }
            // remove duplicates in main object after adding dependencies
            typeKeyList[depType] = [...new Set(typeKeyList[depType])];
        }

        // check all assets for dependencies recursively
        if (typeKeyList.asset?.length) {
            const depType = 'asset';
            const Asset = MetadataTypeInfo[depType];
            Asset.properties = properties;
            Asset.buObject = buObject;
            const additionalAssetDependencies = [
                ...(await Asset.getCbReferenceKeys(
                    typeKeyList[depType],
                    retrieveDir,
                    new Set(typeKeyList[depType])
                )),
            ];
            if (additionalAssetDependencies.length) {
                Util.logger.info(
                    `Found ${additionalAssetDependencies.length - initialAssetNumber} additional assets linked via ContentBlockByX.`
                );
            }
            // reset cache in case this is used progammatically somehow
            Asset.getJsonFromFSCache = null;

            // remove duplicates in main object after adding dependencies
            typeKeyList[depType] = [...new Set(typeKeyList[depType])];
        }

        return typeKeyList;
    }

    /**
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {TypeKeyCombo} typeKeyList limit retrieval to given metadata type
     * @returns {Promise.<TypeKeyCombo>} dependencies
     */
    static async addDependencies(businessUnit, typeKeyList) {
        if (!Util.OPTIONS.dependencies) {
            return;
        }
        Util.logger.info(
            'You might see warnings about items not being found if you have not re-retrieved everything lately.'
        );

        // try re-retrieve without passing selectedTypes to ensure we find all dependencies
        await this._reRetrieve(businessUnit, true);

        Util.logger.info(
            'Searching for selected items and their dependencies in your project folder'
        );
        /** @type {TypeKeyCombo} */
        const dependencies = {};
        /** @type {TypeKeyCombo} */
        const notFoundList = {};
        const initiallySelectedTypesArr = Object.keys(typeKeyList);

        const properties = await config.getProperties();
        const buObject = await Cli.getCredentialObject(properties, businessUnit);
        for (const type of initiallySelectedTypesArr) {
            MetadataTypeInfo[type].properties = properties;
            MetadataTypeInfo[type].buObject = buObject;
            await MetadataTypeInfo[type].getDependentFiles(
                typeKeyList[type],
                dependencies,
                notFoundList,
                true
            );
        }
        if (Util.getTypeKeyCount(notFoundList)) {
            // if we have missing items, we need to retrieve them
            Util.logger.warn(
                `We recommend you retrieve the missing items with the following command and then re-run buildDefinition:`
            );
            Util.logger.warn(
                `   mcdev retrieve ${businessUnit} ${Util.convertTypeKeyToCli(notFoundList)}`
            );
        }

        // remove duplicates & empty types
        for (const type in dependencies) {
            if (dependencies[type].length) {
                dependencies[type] = [...new Set(dependencies[type])];
            } else {
                delete dependencies[type];
            }
        }

        // add dependencies to selectedTypes
        if (Object.keys(dependencies).length) {
            Util.logger.info(
                `Found ${Util.getTypeKeyCount(dependencies)} items across ${Object.keys(dependencies).length} types.`
            );
            for (const type in dependencies) {
                if (typeKeyList[type]) {
                    typeKeyList[type].push(...dependencies[type]);
                } else {
                    typeKeyList[type] = dependencies[type];
                }
                // remove duplicates in main object after adding dependencies
                typeKeyList[type] = [...new Set(typeKeyList[type])];
            }
        }
        return dependencies;
    }

    /**
     * Build a template based on a list of metadata files in the retrieve folder.
     *
     * @param {string} businessUnitTemplate references credentials from properties.json
     * @param {string} businessUnitDefinition references credentials from properties.json
     * @param {TypeKeyCombo} typeKeyCombo limit retrieval to given metadata type
     * @returns {Promise.<MultiMetadataTypeList | object>} response from buildDefinition
     */
    static async clone(businessUnitTemplate, businessUnitDefinition, typeKeyCombo) {
        return this.build(
            businessUnitTemplate,
            businessUnitDefinition,
            typeKeyCombo,
            ['__clone__'],
            ['__clone__']
        );
    }

    /**
     * Build a template based on a list of metadata files in the retrieve folder.
     *
     * @param {string} businessUnitTemplate references credentials from properties.json
     * @param {string} businessUnitDefinition references credentials from properties.json
     * @param {TypeKeyCombo} typeKeyCombo limit retrieval to given metadata type
     * @param {string[]} marketTemplate market localizations
     * @param {string[]} marketDefinition market localizations
     * @param {boolean} [bulk] runs buildDefinitionBulk instead of buildDefinition; requires marketList to be defined and given via marketDefinition
     * @returns {Promise.<MultiMetadataTypeList | object>} response from buildDefinition
     */
    static async build(
        businessUnitTemplate,
        businessUnitDefinition,
        typeKeyCombo,
        marketTemplate,
        marketDefinition,
        bulk
    ) {
        if (!bulk && !businessUnitDefinition) {
            Util.logger.error(
                'Please provide a business unit to deploy to via --buTo or activate --bulk'
            );
            return;
        }

        // check if types are valid
        for (const type of Object.keys(typeKeyCombo)) {
            if (!Util._isValidType(type)) {
                return;
            }
            if (!Array.isArray(typeKeyCombo[type])) {
                Util.logger.error('You need to define keys, not just types to run build');
                // we need an array of keys here
                return;
            }
        }

        // redirect templates to temporary folder when executed via build()
        const properties = await config.getProperties();
        const templateDirBackup = properties.directories.template;
        properties.directories.template = '.mcdev/template/';

        Util.logger.info('mcdev:: Build Template & Build Definition');
        await this.buildTemplate(businessUnitTemplate, typeKeyCombo, null, marketTemplate);

        if (typeof Util.OPTIONS.purge !== 'boolean') {
            const properties = await config.getProperties();
            // deploy folder is in targets for definition creation
            // recommend to purge their content first
            Util.OPTIONS.purge = await confirm({
                message: `Do you want to empty relevant BU sub-folders in /${properties.directories.deploy} (ensures no files from previous deployments remain)?`,
                default: true,
            });
        }

        const response = bulk
            ? await this.buildDefinitionBulk(marketDefinition[0], typeKeyCombo, null)
            : await this.buildDefinition(
                  businessUnitDefinition,
                  typeKeyCombo,
                  null,
                  marketDefinition
              );

        // reset temporary template folder
        try {
            await File.remove(properties.directories.template);
        } catch {
            // sometimes the first attempt is not successful for some operating system reason. Trying again mostly solves this
            await File.remove(properties.directories.template);
        }
        properties.directories.template = templateDirBackup;

        return response;
    }

    /**
     * Build a template based on a list of metadata files in the retrieve folder.
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {string | TypeKeyCombo} selectedTypes limit retrieval to given metadata type
     * @param {string[] | undefined} keyArr customerkey of the metadata
     * @param {string[]} marketArr market localizations
     * @returns {Promise.<MultiMetadataTypeList>} -
     */
    static async buildTemplate(businessUnit, selectedTypes, keyArr, marketArr) {
        this.#welcomeMessage();

        Util.startLogger();
        Util.logger.info('mcdev:: Build Template from retrieved files');
        const properties = await config.getProperties();
        const buObject = await Cli.getCredentialObject(properties, businessUnit);
        if (!Util.checkMarketList(marketArr, properties)) {
            return;
        }

        const typeKeyList = Util.checkAndPrepareTypeKeyCombo(
            selectedTypes,
            keyArr,
            'buildTemplate'
        );
        if (!typeKeyList) {
            return;
        }

        if (!Util.OPTIONS.dependencies) {
            await this._reRetrieve(businessUnit, false, typeKeyList);
        }
        // convert names to keys
        const retrieveDir = File.normalizePath([
            properties.directories.retrieve,
            buObject.credential,
            buObject.businessUnit,
        ]);
        for (const type of Object.keys(typeKeyList)) {
            const keyArr = typeKeyList[type];
            if (keyArr.some((key) => key.startsWith('name:'))) {
                // at least one key was provided as a name -> load all files from disk to try and find that key
                const builTemplateCache = Object.values(
                    await MetadataTypeInfo[type].getJsonFromFS(retrieveDir + path.sep + type)
                );
                typeKeyList[type] = keyArr
                    .map((key) => {
                        if (key.startsWith('name:')) {
                            // key was defined by name. try and find matching item on disk
                            const name = key.slice(5);
                            const foundKeysByName = builTemplateCache
                                .filter(
                                    (item) =>
                                        name == item[MetadataTypeInfo[type].definition.nameField]
                                )
                                .map((item) => item[MetadataTypeInfo[type].definition.keyField]);
                            if (foundKeysByName.length === 1) {
                                key = foundKeysByName[0];
                                Util.logger.debug(
                                    `- found ${type} key '${key}' for name '${name}'`
                                );
                                return key;
                            } else if (foundKeysByName.length > 1) {
                                Util.logger.error(
                                    `Found multiple keys (${foundKeysByName.join(', ')}) for name: ${key}`
                                );
                                return;
                            } else {
                                Util.logger.error(`Could not find any keys for name: ${name}`);
                                return;
                            }
                        } else {
                            return key;
                        }
                    })
                    .filter(Boolean);
            }
        }

        // if dependencies are enabled, we need to search for them and add them to our
        await this.addDependencies(businessUnit, typeKeyList);
        await this.addDependentCbReferences(businessUnit, typeKeyList);

        /** @type {MultiMetadataTypeList} */
        const returnObj = {};
        for (const type of Object.keys(typeKeyList)) {
            // ensure keys are sorted again, after finding dependencies, to enhance log readability
            typeKeyList[type].sort();

            const result = await Builder.buildTemplate(
                businessUnit,
                type,
                typeKeyList[type],
                marketArr
            );
            returnObj[type] = result[type];
        }
        Util.logger.info(`Templated ${Util.getTypeKeyCount(returnObj)} items`);
        return returnObj;
    }

    /**
     * Build a specific metadata file based on a template.
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {boolean} [alwaysAsk] by default this code only runs if --retrieve is set; this flag allows to always ask
     * @param {TypeKeyCombo} [selectedTypes] limit retrieval to given metadata type
     * @returns {Promise.<void>} -
     */
    static async _reRetrieve(businessUnit, alwaysAsk = false, selectedTypes) {
        let runRetrieveNow;
        if (!Util.OPTIONS.skipInteraction && !Util.OPTIONS.retrieve && alwaysAsk) {
            runRetrieveNow = await confirm({
                message: `Do you want to re-retrieve ${selectedTypes ? Util.convertTypeKeyToString(selectedTypes) : 'all metadata'} for ${businessUnit} now?`,
                default: false,
            });
        }
        if (runRetrieveNow || Util.OPTIONS.retrieve) {
            Util.logger.info(
                `Re-retrieving ${businessUnit}: ${selectedTypes ? Util.convertTypeKeyToString(selectedTypes) : 'all metadata'}`
            );
            // we need to work with a clone here because retrieve() modifies the object passed in as 2nd parameter
            const retrieveTypes = structuredClone(selectedTypes);
            await this.retrieve(businessUnit, retrieveTypes);
        }
    }

    /**
     * Build a specific metadata file based on a template.
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {string | TypeKeyCombo} selectedTypes limit retrieval to given metadata type
     * @param {string[] | undefined} nameArr name of the metadata
     * @param {string[]} marketArr market localizations
     * @returns {Promise.<MultiMetadataTypeList>} -
     */
    static async buildDefinition(businessUnit, selectedTypes, nameArr, marketArr) {
        this.#welcomeMessage();

        Util.startLogger();
        Util.logger.info('mcdev:: Build Definition from Template');
        const properties = await config.getProperties();
        if (!Util.checkMarketList(marketArr, properties)) {
            return;
        }
        const typeKeyList = Util.checkAndPrepareTypeKeyCombo(
            selectedTypes,
            nameArr,
            'buildDefinition'
        );
        if (!typeKeyList) {
            return;
        }

        if (Util.OPTIONS.purge) {
            const buObject = await Cli.getCredentialObject(properties, businessUnit);
            Builder.purgeDeployFolder(buObject.credential + '/' + buObject.businessUnit);
        } else {
            Util.logger.info(` ☇ skipping purge of folder`);
        }
        /** @type {MultiMetadataTypeList} */
        const returnObj = {};
        for (const type of Object.keys(typeKeyList)) {
            const result = await Builder.buildDefinition(
                businessUnit,
                type,
                typeKeyList[type],
                marketArr
            );
            returnObj[type] = result[type];
        }
        Util.logger.info('Done');
        return returnObj;
    }

    /**
     * Build a specific metadata file based on a template using a list of bu-market combos
     *
     * @param {string} listName name of list of BU-market combos
     * @param {string | TypeKeyCombo} selectedTypes supported metadata type
     * @param {string[]} [nameArr] name of the metadata
     * @returns {Promise.<object>} -
     */
    static async buildDefinitionBulk(listName, selectedTypes, nameArr) {
        this.#welcomeMessage();

        Util.startLogger();
        Util.logger.info('mcdev:: Build Definition from Template Bulk');

        const properties = await config.getProperties();
        try {
            Util.verifyMarketList(listName, properties);
        } catch (ex) {
            Util.logger.error(ex.message);
            return;
        }
        const typeKeyList = Util.checkAndPrepareTypeKeyCombo(
            selectedTypes,
            nameArr,
            'buildDefinitionBulk'
        );
        if (!typeKeyList) {
            return;
        }
        if (Util.OPTIONS.purge) {
            Builder.purgeDeployFolderList(listName);
        } else {
            Util.logger.info(` ☇ skipping purge of folder`);
        }
        /** @type {MultiMetadataTypeList} */
        const returnObj = {};
        for (const type of Object.keys(typeKeyList)) {
            Util.logger.info(Util.getGrayMsg(`buildDefinitionBulk for ${type}`));
            const result = await Builder.buildDefinitionBulk(listName, type, typeKeyList[type]);
            returnObj[type] = result;
        }
        Util.logger.info('Done');
        return returnObj;
    }

    /**
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {string} selectedType supported metadata type
     * @param {string[]} keyArr customerkey of the metadata
     * @returns {Promise.<string[]>} list of all files that need to be committed in a flat array ['path/file1.ext', 'path/file2.ext']
     */
    static async getFilesToCommit(businessUnit, selectedType, keyArr) {
        Util.startLogger();
        Util.logger.info('mcdev:: getFilesToCommit');
        const properties = await config.getProperties();
        if (!(await config.checkProperties(properties))) {
            return null;
        }
        if (!Util._isValidType(selectedType)) {
            return;
        }
        if (selectedType.includes('-')) {
            Util.logger.error(
                `:: '${selectedType}' is not a valid metadata type. Please don't include subtypes.`
            );
            return;
        }
        const buObject = await Cli.getCredentialObject(properties, businessUnit);
        if (buObject !== null) {
            return DevOps.getFilesToCommit(properties, buObject, selectedType, keyArr);
        }
    }

    /**
     * Publish an item
     *
     * @param {string} businessUnit name of BU
     * @param {string[] | TypeKeyCombo} selectedTypes limit to given metadata types
     * @param {string[]} [keys] customerkey of the metadata
     * @returns {Promise.<Object.<string, Object.<string, string[]>>>} key: business unit name, key2: type, value: list of affected item keys
     */
    static async publish(businessUnit, selectedTypes, keys) {
        return this.#runMethod('publish', businessUnit, selectedTypes, keys);
    }
    /**
     * Publish an item
     *
     * @param {string} businessUnit name of BU
     * @param {string[] | TypeKeyCombo} selectedTypes limit to given metadata types
     * @param {string[]} [keys] customerkey of the metadata
     * @returns {Promise.<Object.<string, Object.<string, string[]>>>} key: business unit name, key2: type, value: list of affected item keys
     */
    static async validate(businessUnit, selectedTypes, keys) {
        return this.#runMethod('validate', businessUnit, selectedTypes, keys);
    }

    /**
     * Start/execute an item
     *
     * @param {string} businessUnit name of BU
     * @param {string[] | TypeKeyCombo} selectedTypes limit to given metadata types
     * @param {string[]} [keys] customerkey of the metadata
     * @returns {Promise.<Object.<string, Object.<string, string[]>>>} key: business unit name, key2: type, value: list of affected item keys
     */
    static async execute(businessUnit, selectedTypes, keys) {
        return this.#runMethod('execute', businessUnit, selectedTypes, keys);
    }

    /**
     * Schedule an item (shortcut for execute --schedule)
     *
     * @param {string} businessUnit name of BU
     * @param {string[] | TypeKeyCombo} selectedTypes limit to given metadata types
     * @param {string[]} [keys] customerkey of the metadata
     * @returns {Promise.<Object.<string, Object.<string, string[]>>>} key: business unit name, key2: type, value: list of affected item keys
     */
    static async schedule(businessUnit, selectedTypes, keys) {
        this.setOptions({ schedule: true });
        return this.#runMethod('execute', businessUnit, selectedTypes, keys);
    }

    /**
     * pause an item
     *
     * @param {string} businessUnit name of BU
     * @param {string[] | TypeKeyCombo} selectedTypes limit to given metadata types
     * @param {string[]} [keys] customerkey of the metadata
     * @returns {Promise.<Object.<string, Object.<string, string[]>>>} key: business unit name, key2: type, value: list of affected item keys
     */
    static async pause(businessUnit, selectedTypes, keys) {
        return this.#runMethod('pause', businessUnit, selectedTypes, keys);
    }

    /**
     * stop an item
     *
     * @param {string} businessUnit name of BU
     * @param {string[] | TypeKeyCombo} selectedTypes limit to given metadata types
     * @param {string[]} [keys] customerkey of the metadata
     * @returns {Promise.<Object.<string, Object.<string, string[]>>>} key: business unit name, key2: type, value: list of affected item keys
     */
    static async stop(businessUnit, selectedTypes, keys) {
        return this.#runMethod('stop', businessUnit, selectedTypes, keys);
    }

    /**
     * Updates the key to match the name field
     *
     * @param {string} businessUnit name of BU
     * @param {TypeKeyCombo | undefined} selectedTypesObj limit retrieval to given metadata type
     * @param {string} to what to replace with
     * @param {string[]} [fromList] what to replace
     * @returns {Promise.<Object.<string, object>>} key1: business unit name, key2:type value: list of fixed item keys
     */
    static async replaceCbReference(businessUnit, selectedTypesObj, to, fromList) {
        const allowedFromTo = ['key', 'name', 'id'];
        if (!allowedFromTo.includes(to)) {
            Util.logger.error(
                `Invalid value for argument: --to, Given: "${to}", Choices: "${allowedFromTo.join('", "')}"`
            );
            return;
        }

        if (fromList) {
            if (!Array.isArray(fromList)) {
                // equalize to array
                fromList = [fromList];
            }
            for (const from of fromList) {
                if (!allowedFromTo.includes(from)) {
                    Util.logger.error(
                        `Invalid value for argument: --from, Given: "${from}", Choices: "${allowedFromTo.join('", "')}"`
                    );
                }
                if (from == to) {
                    Util.logger.error('--from and --to cannot be the same');
                }
            }
        }

        // define final from/to values and, if from was not set, auto-set it to remaining values not set for to
        const referenceFrom = fromList || allowedFromTo.filter((item) => item !== to);
        const referenceTo = to;

        // if called via CLI, saving the from/to values in OPTIONS was done already, but we need to cover package includes as well
        this.setOptions({ referenceFrom, referenceTo });

        const properties = await config.getProperties();
        if (!Util.isValidBU(properties, businessUnit)) {
            return;
        }

        /** @typedef {string[]} */
        let selectedTypesArr;
        if (selectedTypesObj) {
            // check if types are valid
            for (const selectedType of Object.keys(selectedTypesObj)) {
                if (!Util._isValidType(selectedType)) {
                    return;
                }
            }
        } else {
            // do it for all types that have a replaceCbReference method
            selectedTypesArr = [];
            selectedTypesArr.push(
                ...new Set(
                    properties.metaDataTypes.retrieve
                        .map((type) => type.split('-')[0])
                        .filter((type) =>
                            Object.prototype.hasOwnProperty.call(
                                MetadataTypeInfo[type],
                                'replaceCbReference'
                            )
                        )
                )
            );
        }
        Util.logger.info(
            `:: Replacing ${referenceFrom.map((from) => 'ContentBlockBy' + Util.capitalizeFirstLetter(from)).join(' and ')} with ContentBlockBy${Util.capitalizeFirstLetter(to)} for ${(Array.isArray(
                selectedTypesArr
            )
                ? selectedTypesArr
                : Object.keys(selectedTypesObj)
            ).join(', ')}`
        );

        const response = await this.#runMethod(
            'replaceCbReference',
            businessUnit,
            selectedTypesArr || selectedTypesObj
        );

        return response;
    }

    /**
     * Updates the key to match the name field
     *
     * @param {string} businessUnit name of BU
     * @param {string[] | TypeKeyCombo} selectedTypes limit retrieval to given metadata type
     * @param {string[]} [keys] customerkey of the metadata
     * @returns {Promise.<Object.<string, object>>} key1: business unit name, key2:type value: list of fixed item keys
     */
    static async fixKeys(businessUnit, selectedTypes, keys) {
        const properties = await config.getProperties();
        // make sure validation rules dont keep us from fixing the keys
        this.setOptions({ skipValidation: true });
        let reRetrieveAll = false;

        /** @typedef {string[]} */
        let selectedTypesArr;

        /** @typedef {TypeKeyCombo} */
        let selectedTypesObj;
        if (selectedTypes) {
            // check if types are valid
            for (const selectedType of Array.isArray(selectedTypes)
                ? selectedTypes
                : Object.keys(selectedTypes)) {
                if (!Util._isValidType(selectedType)) {
                    return;
                }
            }
            if (Array.isArray(selectedTypes)) {
                selectedTypesArr = selectedTypes;
            } else {
                selectedTypesObj = selectedTypes;
            }
        } else {
            // do it for all standard retrieve types
            selectedTypesArr = [];
            selectedTypesArr.push(
                ...new Set(
                    properties.metaDataTypes.retrieve
                        .map((type) => type.split('-')[0])
                        .filter(
                            (type) =>
                                !MetadataTypeDefinitions[type].keyIsFixed &&
                                MetadataTypeDefinitions[type].keyField !==
                                    MetadataTypeDefinitions[type].nameField &&
                                MetadataTypeDefinitions[type].keyField !==
                                    MetadataTypeDefinitions[type].idField
                        )
                )
            );
            Util.logger.info(
                `:: Fixing keys for ${selectedTypesArr ? selectedTypesArr.join(', ') : Object.keys(selectedTypesObj).join(', ')}`
            );
            reRetrieveAll = true;
            this.setOptions({
                skipInteraction: { fixKeysReretrieve: false },
            });
        }
        // `Type 'event' is not supported for fixKeys for compatibility reasons. Draft Journeys would otherwise be broken after the key change. If you do need to update an event key, use deploy --changeKeyValue or --changeKeyField instead.`;
        if (Array.isArray(selectedTypes) && selectedTypes.includes('event')) {
            selectedTypesArr = selectedTypes.filter((type) => type !== 'event');
        } else if (selectedTypesObj && selectedTypesObj.event) {
            delete selectedTypesObj.event;
        }

        const response = await this.#runMethod(
            'fixKeys',
            businessUnit,
            selectedTypesArr || selectedTypesObj,
            keys
        );

        if (reRetrieveAll) {
            // only done if selectedTypesArr is set as fallback
            Util.logger.info(
                `Retrieving latest versions of ${selectedTypesArr.join(', ')} from server`
            );
            const buObject = await Cli.getCredentialObject(properties, businessUnit, null, true);
            const retriever = new Retriever(properties, buObject);
            await retriever.retrieve(selectedTypesArr, null, null, false);
        }
        return response;
    }

    /**
     * run a method across BUs
     *
     * @param {'execute'|'pause'|'stop'|'publish'|'validate'|'fixKeys'|'replaceCbReference'|'refresh'} methodName what to run
     * @param {string} businessUnit name of BU
     * @param {string[] | TypeKeyCombo} [selectedTypes] limit to given metadata types
     * @param {string[]} [keys] customerkey of the metadata
     * @returns {Promise.<Object.<string, Object.<string, string[]>>>} key: business unit name, key2: type, value: list of affected item keys
     */
    static async #runMethod(methodName, businessUnit, selectedTypes, keys) {
        Util.startLogger();
        let lang_past;
        let lang_present;
        let requireType;
        let requireKeyOrLike;
        let checkMetadataSupport;
        /** @type {Object.<string, Object.<string, string[]>>} */
        const resultObj = {};

        switch (methodName) {
            case 'execute': {
                lang_past = 'executed';
                lang_present = 'executing';
                requireType = true;
                requireKeyOrLike = true;
                checkMetadataSupport = true;
                break;
            }
            case 'pause': {
                lang_past = 'paused';
                lang_present = 'pausing';
                requireType = true;
                requireKeyOrLike = true;
                checkMetadataSupport = true;
                break;
            }
            case 'stop': {
                lang_past = 'stopped';
                lang_present = 'stopping';
                requireType = true;
                requireKeyOrLike = true;
                checkMetadataSupport = true;
                break;
            }
            case 'publish': {
                lang_past = 'published';
                lang_present = 'publishing';
                requireType = true;
                requireKeyOrLike = true;
                checkMetadataSupport = true;
                break;
            }
            case 'validate': {
                lang_past = 'validated';
                lang_present = 'validating';
                requireType = true;
                requireKeyOrLike = true;
                checkMetadataSupport = true;
                break;
            }
            case 'fixKeys': {
                lang_past = 'fixed keys';
                lang_present = 'fixing keys';
                requireType = false;
                requireKeyOrLike = false;
                checkMetadataSupport = false;
                break;
            }
            case 'replaceCbReference': {
                lang_past = 'replaced references';
                lang_present = 'replacing references';
                requireType = false;
                requireKeyOrLike = false;
                checkMetadataSupport = true;
                break;
            }
            case 'refresh': {
                lang_past = 'refreshed';
                lang_present = 'refreshing';
                requireType = true;
                requireKeyOrLike = false;
                checkMetadataSupport = true;
                break;
            }
        }

        /** @typedef {string[]} */
        let selectedTypesArr;

        /** @typedef {TypeKeyCombo} */
        let selectedTypesObj;
        if (selectedTypes) {
            // check if types are valid
            for (const selectedType of Array.isArray(selectedTypes)
                ? selectedTypes
                : Object.keys(selectedTypes)) {
                if (!Util._isValidType(selectedType)) {
                    return resultObj;
                }
                if (
                    checkMetadataSupport &&
                    !Object.prototype.hasOwnProperty.call(
                        MetadataTypeInfo[selectedType],
                        methodName
                    )
                ) {
                    Util.logger.error(
                        ` ☇ skipping ${selectedType}: ${methodName} is not supported yet for ${selectedType}`
                    );
                    return resultObj;
                }
            }
            if (Array.isArray(selectedTypes)) {
                selectedTypesArr = selectedTypes;
            } else {
                selectedTypesObj = selectedTypes;
            }
        }
        if (
            requireType &&
            !Array.isArray(selectedTypesArr) &&
            (!selectedTypesObj || !Object.keys(selectedTypesObj).length)
        ) {
            Util.logger.error('At least one metadata type needs to be defined.');
            return resultObj;
        }
        const properties = await config.getProperties();
        if (!(await config.checkProperties(properties))) {
            // return null here to avoid seeing 2 error messages for the same issue
            return resultObj;
        }
        for (const selectedType of selectedTypesArr || Object.keys(selectedTypesObj)) {
            Util.logger.info(`mcdev:: ${methodName} ${selectedType}`);
            let counter_credBu = 0;
            let counter_credKeys = 0;
            const keyArr = selectedTypesArr ? keys : selectedTypesObj[selectedType];
            if (
                requireKeyOrLike &&
                (!Array.isArray(keyArr) || !keyArr.length) &&
                (!Util.OPTIONS.like || !Object.keys(Util.OPTIONS.like).length)
            ) {
                Util.logger.error('At least one key or a --like filter is required.');
                return resultObj;
            } else if (
                Array.isArray(keyArr) &&
                keyArr.length &&
                Util.OPTIONS.like &&
                Object.keys(Util.OPTIONS.like).length
            ) {
                Util.logger.error('You can either specify keys OR a --like filter.');
                return resultObj;
            }

            if (businessUnit === '*') {
                Util.OPTIONS._multiBuExecution = true;
                Util.logger.info(
                    `:: ${lang_present} the ${selectedType} on all BUs for all credentials`
                );
                let counter_credTotal = 0;
                for (const cred in properties.credentials) {
                    Util.logger.info(`:: ${lang_present} ${selectedType} on all BUs for ${cred}`);
                    // reset counter per cred
                    counter_credKeys = 0;
                    counter_credBu = 0;
                    for (const bu in properties.credentials[cred].businessUnits) {
                        resultObj[cred + '/' + bu] ||= {};
                        resultObj[cred + '/' + bu][selectedType] = await this.#runOnBU(
                            methodName,
                            cred,
                            bu,
                            selectedType,
                            keyArr
                        );
                        counter_credBu++;
                        counter_credKeys += resultObj[cred + '/' + bu][selectedType].length;
                        Util.startLogger(true);
                    }
                    counter_credTotal += counter_credBu;
                    Util.logger.info(
                        `:: ${lang_past} for ${counter_credKeys} ${selectedType}s on ${counter_credBu} BUs for ${cred}`
                    );
                }
                Util.logger.info(
                    `:: ${lang_past} ${selectedType} on ${counter_credTotal} BUs in total\n`
                );
            } else {
                let [cred, bu] = businessUnit ? businessUnit.split('/') : [null, null];
                // to allow all-BU via user selection we need to run this here already
                if (
                    properties.credentials &&
                    (!properties.credentials[cred] ||
                        (bu !== '*' && !properties.credentials[cred].businessUnits[bu]))
                ) {
                    const buObject = await Cli.getCredentialObject(
                        properties,
                        cred === null ? null : cred + '/' + bu,
                        null,
                        true
                    );
                    if (buObject === null) {
                        return resultObj;
                    } else {
                        cred = buObject.credential;
                        bu = buObject.businessUnit;
                    }
                }
                if (bu === '*' && properties.credentials && properties.credentials[cred]) {
                    Util.OPTIONS._multiBuExecution = true;
                    Util.logger.info(`:: ${lang_present} ${selectedType} on all BUs for ${cred}`);
                    for (const bu in properties.credentials[cred].businessUnits) {
                        resultObj[cred + '/' + bu] ||= {};
                        resultObj[cred + '/' + bu][selectedType] = await this.#runOnBU(
                            methodName,
                            cred,
                            bu,
                            selectedType,
                            keyArr
                        );
                        counter_credBu++;
                        counter_credKeys += resultObj[cred + '/' + bu][selectedType].length;
                        Util.startLogger(true);
                    }
                    Util.logger.info(
                        `:: ${lang_past} for ${counter_credKeys} ${selectedType}s on ${counter_credBu} BUs for ${cred}`
                    );
                } else {
                    // execute runMethod for the entity on one BU only
                    resultObj[cred + '/' + bu] ||= {};
                    resultObj[cred + '/' + bu][selectedType] = await this.#runOnBU(
                        methodName,
                        cred,
                        bu,
                        selectedType,
                        keyArr
                    );
                    Util.logger.info(`:: Done`);
                }
            }
        }
        return resultObj;
    }

    /**
     * helper for Mcdev.#runMethod
     *
     * @param {'execute'|'pause'|'stop'|'publish'|'validate'|'fixKeys'|'replaceCbReference'|'refresh'} methodName what to run
     * @param {string} cred name of Credential
     * @param {string} bu name of BU
     * @param {string} [type] limit execution to given metadata type
     * @param {string[]} [keyArr] customerkey of the metadata
     * @returns {Promise.<string[]>} list of keys that were affected
     */
    static async #runOnBU(methodName, cred, bu, type, keyArr) {
        const properties = await config.getProperties();
        const resultArr = [];
        const buObject = await Cli.getCredentialObject(
            properties,
            cred === null ? null : cred + '/' + bu,
            null,
            true
        );
        try {
            if (!type) {
                throw new Error('No type was provided');
            }
            if (buObject !== null) {
                cache.initCache(buObject);
                cred = buObject.credential;
                bu = buObject.businessUnit;
            }
            Util.logger.info(`:: ${methodName} ${type} on ${cred}/${bu}`);
            MetadataTypeInfo[type].client = auth.getSDK(buObject);

            MetadataTypeInfo[type].properties = properties;
            MetadataTypeInfo[type].buObject = buObject;
            switch (methodName) {
                case 'fixKeys': {
                    {
                        resultArr.push(...(await this.#fixKeys(cred, bu, type, keyArr)));

                        break;
                    }
                }
                case 'replaceCbReference': {
                    {
                        resultArr.push(...(await this.#replaceCbReference(cred, bu, type, keyArr)));

                        break;
                    }
                }
                default: {
                    if (Util.OPTIONS.like && Object.keys(Util.OPTIONS.like).length) {
                        keyArr = await this.#retrieveKeysWithLike(type, buObject);
                    }
                    resultArr.push(...(await MetadataTypeInfo[type][methodName](keyArr)));
                }
            }
        } catch (ex) {
            Util.logger.errorStack(ex, 'mcdev.' + methodName + ' failed');
        }

        return resultArr;
    }

    /**
     * helper for Mcdev.#runOnBU
     *
     * @param {string} selectedType limit execution to given metadata type
     * @param {BuObject} buObject properties for auth
     * @returns {Promise.<string[]>} keyArr
     */
    static async #retrieveKeysWithLike(selectedType, buObject) {
        const properties = await config.getProperties();

        // cache depenencies
        const deployOrder = Util.getMetadataHierachy([selectedType]);
        for (const type in deployOrder) {
            const subTypeArr = deployOrder[type];
            MetadataTypeInfo[type].client = auth.getSDK(buObject);
            MetadataTypeInfo[type].properties = properties;
            MetadataTypeInfo[type].buObject = buObject;
            Util.logger.info(`Caching dependent Metadata: ${type}`);
            Util.logSubtypes(subTypeArr);
            const result = await MetadataTypeInfo[type].retrieveForCache(null, subTypeArr);
            if (result) {
                if (Array.isArray(result)) {
                    for (const result_i of result) {
                        if (result_i?.metadata && Object.keys(result_i.metadata).length) {
                            cache.mergeMetadata(type, result_i.metadata);
                        }
                    }
                } else {
                    cache.setMetadata(type, result.metadata);
                }
            }
        }

        // find all keys in chosen type that match the like-filter
        const keyArr = [];
        const metadataMap = cache.getCache()[selectedType];
        if (!metadataMap) {
            throw new Error(`Selected type ${selectedType} could not be cached`);
        }
        Util.logger.info(
            Util.getGrayMsg(`Found ${Object.keys(metadataMap).length} ${selectedType}s`)
        );
        for (const originalKey in metadataMap) {
            // hide postRetrieveOutput
            Util.setLoggingLevel({ silent: true });
            metadataMap[originalKey] = MetadataTypeInfo[selectedType].postRetrieveTasks(
                metadataMap[originalKey]
            );
            // reactivate logging
            Util.setLoggingLevel({});
            if (Util.fieldsLike(metadataMap[originalKey])) {
                keyArr.push(originalKey);
            }
        }
        Util.logger.info(
            Util.getGrayMsg(
                `Identified ${keyArr.length} ${selectedType}${
                    keyArr.length === 1 ? '' : 's'
                } that match${keyArr.length === 1 ? 'es' : ''} the like-filter`
            )
        );

        return keyArr;
    }

    /**
     * Updates the key to match the name field
     *
     * @param {string} cred name of Credential
     * @param {string} bu name of BU
     * @param {string} type limit execution to given metadata type
     * @param {string[]} [keyArr] customerkey of the metadata
     * @returns {Promise.<string[]>} list of keys that were affected
     */
    static async #fixKeys(cred, bu, type, keyArr) {
        const properties = await config.getProperties();
        let actuallyFixedKeys = [];
        const resultArr = [];

        if (
            MetadataTypeDefinitions[type].keyIsFixed === true ||
            MetadataTypeDefinitions[type].keyField === MetadataTypeDefinitions[type].idField
        ) {
            Util.logger.error(`Key cannot be updated for this type`);
            return resultArr;
        }

        const buObject = await Cli.getCredentialObject(
            properties,
            cred === null ? null : cred + '/' + bu,
            null,
            true
        );
        try {
            Util.logger.info(`Retrieving latest versions of ${type} from server`);
            const retriever = new Retriever(properties, buObject);
            const retrieved = await retriever.retrieve([type], keyArr, null, false);

            const metadataMap = Object.values(retrieved)[0][0];
            const keysForDeploy = MetadataTypeInfo[type].getKeysForFixing(metadataMap);
            if (keysForDeploy.length < 1) {
                Util.logger.warn(
                    `No items found with a key-name mismatch that match your criteria.\n`
                );
                return resultArr;
            }
            this.setOptions({
                changeKeyField: MetadataTypeDefinitions[type].nameField,
                fromRetrieve: true,
            });
            const deployed = await Deployer.deploy(cred + '/' + bu, [type], keysForDeploy);
            actuallyFixedKeys = Object.keys(Object.values(Object.values(deployed)[0])[0]);
            resultArr.push(...actuallyFixedKeys);
            const dependentTypes = await Util.getDependentMetadata(type);
            if (actuallyFixedKeys && actuallyFixedKeys.length) {
                Util.logger.info(
                    `Successfully updated ${actuallyFixedKeys.length} key${
                        actuallyFixedKeys.length === 1 ? '' : 's'
                    } of type ${type}`
                );
                if (dependentTypes.length) {
                    Util.logger.warn(
                        `Please re-retrieve the following types as your local copies might now be outdated: ${Util.getGrayMsg(
                            dependentTypes.join(', ')
                        )}`
                    );
                    const reRetrieve = await Cli.postFixKeysReretrieve(dependentTypes);
                    if (reRetrieve) {
                        Util.logger.info(
                            `Retrieving latest versions of ${dependentTypes.join(', ')} from server`
                        );
                        const retriever = new Retriever(properties, buObject);
                        await retriever.retrieve(dependentTypes, null, null, false);
                    }
                } else {
                    Util.logger.info(
                        `No dependent types found that need to be re-retrieved after fixing keys of type ${type}.`
                    );
                }
            } else {
                Util.logger.warn(`No keys of type ${type} updated.`);
            }
        } catch (ex) {
            Util.logger.errorStack(ex, 'mcdev.fixKeys failed');
        }
        return resultArr;
    }

    /**
     * Updates the key to match the name field
     *
     * @param {string} cred name of Credential
     * @param {string} bu name of BU
     * @param {string} type limit execution to given metadata type
     * @param {string[]} [keyArr] customerkey of the metadata
     * @returns {Promise.<string[]>} list of keys that were affected
     */
    static async #replaceCbReference(cred, bu, type, keyArr) {
        const properties = await config.getProperties();
        let updatedKeys = [];
        const resultArr = [];

        const buObject = await Cli.getCredentialObject(
            properties,
            cred === null ? null : cred + '/' + bu,
            null,
            true
        );
        const savePath = File.normalizePath([
            properties.directories.retrieve,
            buObject.credential,
            buObject.businessUnit,
        ]);

        await ReplaceContentBlockReference.createCache(properties, buObject);

        try {
            let metadataMap;
            if (Util.OPTIONS.skipRetrieve) {
                Util.logger.warn(
                    'Skipping retrieve due to --skipRetrieve flag. Hope you know what you are doing.'
                );
                metadataMap = await MetadataTypeInfo[type].getJsonFromFS(
                    File.normalizePath([savePath, type])
                );
            } else {
                Util.logger.info(`Retrieving latest versions of ${type} from server`);
                const retriever = new Retriever(properties, buObject);
                const retrieved = await retriever.retrieve([type], keyArr);
                metadataMap = Object.values(retrieved)[0][0];
            }
            const keysForDeploy = await MetadataTypeInfo[type].replaceCbReferenceLoop(
                metadataMap,
                savePath
            );

            if (keysForDeploy.length < 1) {
                Util.logger.warn(`No items found that can be updated.\n`);
                return resultArr;
            }
            if (Util.OPTIONS.skipDeploy) {
                resultArr.push(...keysForDeploy);
                Util.logger.warn('DRY-RUN MODE: Skipping deploy due to --skipDeploy flag.');
                Util.logger.info(
                    'Once you are satisfied with the result, re-run without --skipRetrieve nor --skipDeploy to actually deploy the changes or run:'
                );
                Util.logger.info(`    mcdev d ${cred}/${bu} ${type} "${keysForDeploy.join(',')}"`);
            } else {
                this.setOptions({
                    fromRetrieve: true,
                });
                const deployed = await Deployer.deploy(cred + '/' + bu, [type], keysForDeploy);
                updatedKeys = Object.keys(Object.values(Object.values(deployed)[0])[0]);
                resultArr.push(...updatedKeys);
                if (updatedKeys && updatedKeys.length) {
                    Util.logger.info(
                        `Successfully updated ${updatedKeys.length} item${
                            updatedKeys.length === 1 ? '' : 's'
                        } of type ${type}`
                    );
                } else {
                    Util.logger.warn(`Nothing updated for type ${type}`);
                }
            }
        } catch (ex) {
            Util.logger.errorStack(ex, 'mcdev.replaceCbReference failed');
        }
        return resultArr;
    }

    /**
     * helper to convert CSVs into an array. if only one value was given, it's also returned as an array
     *
     * @param {string|string[]|undefined} metadataOption potentially comma-separated value or null
     * @param {string[]} [allowedIdentifiers] 'key', 'id', 'name'
     * @param {boolean} [firstOnly] removes all but the first entry if enabled
     * @returns {TypeKeyCombo} values split into an array.
     */
    static metadataToTypeKey(
        metadataOption,
        allowedIdentifiers = ['key', 'id', 'name'],
        firstOnly = false
    ) {
        if (!metadataOption) {
            return undefined; // eslint-disable-line unicorn/no-useless-undefined
        } else if (!Array.isArray(metadataOption)) {
            metadataOption = [metadataOption];
        }
        if (firstOnly) {
            // delete everything but the first entry
            metadataOption.length = 1;
        }
        const metadataOptionMap = metadataOption.map((item) => {
            const itemArr = item.split(':');
            const type = itemArr.shift();
            switch (itemArr.length) {
                case 0: {
                    // no ":" found
                    return { type };
                }
                case 1: {
                    // 1 ":" found
                    if (allowedIdentifiers.includes('key')) {
                        return { type, key: itemArr[0] };
                    }
                    break;
                }
                default: {
                    // 2 or more ":" found
                    switch (itemArr[0]) {
                        case 'key':
                        case 'k': {
                            if (allowedIdentifiers.includes('key')) {
                                // remove k/key
                                itemArr.shift();
                                return { type, key: itemArr.join(':') };
                            }
                            break;
                        }
                        case 'id':
                        case 'i': {
                            if (allowedIdentifiers.includes('id')) {
                                // remove i/id
                                itemArr.shift();
                                return { type, id: itemArr.join(':') };
                            }
                            break;
                        }
                        case 'name':
                        case 'n': {
                            if (allowedIdentifiers.includes('name')) {
                                // remove n/name
                                itemArr.shift();
                                return { type, name: itemArr.join(':') };
                            }
                            break;
                        }
                        default: {
                            // assume ":" is part of the key (e.g. possible for DE-fields)
                            if (allowedIdentifiers.includes('key')) {
                                return { type, key: itemArr.join(':') };
                            }
                        }
                    }
                }
            }
        });
        /** @type {TypeKeyCombo} */
        const response = {};
        for (const item of metadataOptionMap) {
            if (item) {
                if (item.key || item.id || item.name) {
                    if (!response[item.type]) {
                        response[item.type] = [];
                    }
                    response[item.type].push(
                        item.key ||
                            (item.id ? 'id:' + item.id : item.name ? 'name:' + item.name : null)
                    );
                } else {
                    if (!response[item.type]) {
                        response[item.type] = null;
                    }
                }
            }
        }

        return Object.keys(response).length >= 1 ? response : undefined;
    }
}

export default Mcdev;
