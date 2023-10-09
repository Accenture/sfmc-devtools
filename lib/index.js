'use strict';

import TYPE from '../types/mcdev.d.js';
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
     * @param {boolean | TYPE.skipInteraction} [skipInteraction] signals what to insert automatically for things usually asked via wizard
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
            'execute',
            'filter',
            'fixShared',
            'fromRetrieve',
            'json',
            'like',
            'noLogColors',
            'noLogFile',
            'refresh',
            '_runningTest',
            'schedule',
            'skipInteraction',
            'errorEmail',
            'completionEmail',
            'errorNote',
            'completionNote',
            'clear',
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
     * @param {string} [argv.range] git commit range
    into deploy directory
     * @param {string} [argv.filter] filter file paths that start with any
     * @param {TYPE.DeltaPkgItem[]} [argv.diffArr] list of files to include in delta package (skips git diff when provided)
     * @returns {Promise.<TYPE.DeltaPkgItem[]>} list of changed items
     */
    static async createDeltaPkg(argv) {
        Util.startLogger();
        Util.logger.info('Create Delta Package ::');
        const properties = await config.getProperties();
        if (!(await config.checkProperties(properties))) {
            return null;
        }

        return argv.filter
            ? // get source market and source BU from config
              DevOps.getDeltaList(properties, argv.range, true, argv.filter, argv.commitHistory)
            : // If no custom filter was provided, use deployment marketLists & templating
              DevOps.buildDeltaDefinitions(
                  properties,
                  argv.range,
                  argv.diffArr,
                  argv.commitHistory
              );
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
     * @returns {object[]} list of supported types with their apiNames
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
     * Retrieve all metadata from the specified business unit into the local file system.
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {TYPE.SupportedMetadataTypes[]|TYPE.TypeKeyCombo} [selectedTypesArr] limit retrieval to given metadata type
     * @param {string[]} [keys] limit retrieval to given metadata key
     * @param {boolean} [changelogOnly] skip saving, only create json in memory
     * @returns {Promise.<object>} -
     */
    static async retrieve(businessUnit, selectedTypesArr, keys, changelogOnly) {
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
     * @private
     * @param {string} cred name of Credential
     * @param {string} bu name of BU
     * @param {TYPE.SupportedMetadataTypes[]|TYPE.TypeKeyCombo} [selectedTypesArr] limit retrieval to given metadata type/subtype
     * @param {string[]} [keys] limit retrieval to given metadata key
     * @param {boolean} [changelogOnly] skip saving, only create json in memory
     * @returns {Promise.<object>} ensure that BUs are worked on sequentially
     */
    static async #retrieveBU(cred, bu, selectedTypesArr, keys, changelogOnly) {
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
                    const [type, subType] = Util.getTypeAndSubType(selectedType);
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
                    if (!keys) {
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
                File.removeSync(File.normalizePath([properties.directories.retrieve, cred, bu]));
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
     * @param {TYPE.SupportedMetadataTypes[]} [selectedTypesArr] limit deployment to given metadata type
     * @param {string[]} [keyArr] limit deployment to given metadata keys
     * @returns {Promise.<Object.<string,TYPE.MultiMetadataTypeMap>>} deployed metadata per BU (first key: bu name, second key: metadata type)
     */
    static async deploy(businessUnit, selectedTypesArr, keyArr) {
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
        await Init.initProject(properties, credentialsName);
    }
    /**
     * Clones an existing project from git repository and installs it
     *
     * @returns {Promise.<void>} -
     */
    static async joinProject() {
        Util.startLogger();
        Util.logger.info('mcdev:: Joining an existing project');
        await Init.joinProject();
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
     * @param {string} type supported metadata type
     * @param {string} customerKey Identifier of metadata
     * @returns {Promise.<boolean>} true if successful, false otherwise
     */
    static async deleteByKey(businessUnit, type, customerKey) {
        Util.startLogger();
        Util.logger.info('mcdev:: delete');
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
            Util.logger.info(
                Util.getGrayMsg(` - Deleting ${type} with key ${customerKey} on BU ${businessUnit}`)
            );
            try {
                MetadataTypeInfo[type].properties = properties;
                MetadataTypeInfo[type].buObject = buObject;
                return await MetadataTypeInfo[type].deleteByKey(customerKey);
            } catch (ex) {
                Util.logger.errorStack(ex, ` - Deleting ${type} failed`);
            }
        }
    }
    /**
     * ensures triggered sends are restarted to ensure they pick up on changes of the underlying emails
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {string} type references credentials from properties.json
     * @param {string[]} [keyArr] metadata keys
     * @returns {Promise.<void>} -
     */
    static async refresh(businessUnit, type, keyArr) {
        Util.startLogger();
        Util.logger.info('mcdev:: refresh');
        if (!type || !Util._isValidType(type, true)) {
            type = 'triggeredSend';
            Util.logger.info(' - setting type to ' + type);
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
            try {
                cache.initCache(buObject);
                MetadataTypeInfo[type].properties = properties;
                MetadataTypeInfo[type].buObject = buObject;
                await MetadataTypeInfo[type].refresh(keyArr);
            } catch (ex) {
                Util.logger.errorStack(ex, 'mcdev.refresh ' + ex.message);
            }
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
            if (await File.pathExistsSync(filename)) {
                File.removeSync(filename);
            }

            const regex = new RegExp('(\\w+-){4}\\w+');
            await File.ensureDir(retrieveDir);
            const metadata = Deployer.readBUMetadata(retrieveDir, null, true);
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
     * @returns {Promise.<TYPE.MultiMetadataTypeList>} -
     */
    static async retrieveAsTemplate(businessUnit, selectedType, name, market) {
        Util.startLogger();
        Util.logger.info('mcdev:: Retrieve as Template');
        const properties = await config.getProperties();
        if (!(await config.checkProperties(properties))) {
            return null;
        }
        if (!Util._isValidType(selectedType)) {
            return;
        }
        const [type, subType] = Util.getTypeAndSubType(selectedType);

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
     * Build a template based on a list of metadata files in the retrieve folder.
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {string} selectedType supported metadata type
     * @param {string[]} keyArr customerkey of the metadata
     * @param {string} market market localizations
     * @returns {Promise.<TYPE.MultiMetadataTypeList>} -
     */
    static async buildTemplate(businessUnit, selectedType, keyArr, market) {
        Util.startLogger();
        Util.logger.info('mcdev:: Build Template from retrieved files');
        return Builder.buildTemplate(businessUnit, selectedType, keyArr, market);
    }
    /**
     * Build a specific metadata file based on a template.
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {string} selectedType supported metadata type
     * @param {string} name name of the metadata
     * @param {string} market market localizations
     * @returns {Promise.<void>} -
     */
    static async buildDefinition(businessUnit, selectedType, name, market) {
        Util.startLogger();
        Util.logger.info('mcdev:: Build Definition from Template');
        return Builder.buildDefinition(businessUnit, selectedType, name, market);
    }

    /**
     * Build a specific metadata file based on a template using a list of bu-market combos
     *
     * @param {string} listName name of list of BU-market combos
     * @param {string} type supported metadata type
     * @param {string} name name of the metadata
     * @returns {Promise.<void>} -
     */
    static async buildDefinitionBulk(listName, type, name) {
        Util.startLogger();
        Util.logger.info('mcdev:: Build Definition from Template Bulk');
        return Builder.buildDefinitionBulk(listName, type, name);
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
     * Schedule an item (shortcut for execute --schedule)
     *
     * @param {string} businessUnit name of BU
     * @param {TYPE.SupportedMetadataTypes} [selectedType] limit to given metadata types
     * @param {string[]} [keys] customerkey of the metadata
     * @returns {Promise.<Object.<string, string[]>>} key: business unit name, value: list of scheduled item keys
     */
    static async schedule(businessUnit, selectedType, keys) {
        this.setOptions({ schedule: true });
        return this.#runMethod('execute', businessUnit, selectedType, keys);
    }
    /**
     * Start/execute an item
     *
     * @param {string} businessUnit name of BU
     * @param {TYPE.SupportedMetadataTypes} [selectedType] limit to given metadata types
     * @param {string[]} [keys] customerkey of the metadata
     * @returns {Promise.<Object.<string, string[]>>} key: business unit name, value: list of executed item keys
     */
    static async execute(businessUnit, selectedType, keys) {
        return this.#runMethod('execute', businessUnit, selectedType, keys);
    }
    /**
     * pause an item
     *
     * @param {string} businessUnit name of BU
     * @param {TYPE.SupportedMetadataTypes} [selectedType] limit to given metadata types
     * @param {string[]} [keys] customerkey of the metadata
     * @returns {Promise.<Object.<string, string[]>>} key: business unit name, value: list of paused item keys
     */
    static async pause(businessUnit, selectedType, keys) {
        return this.#runMethod('pause', businessUnit, selectedType, keys);
    }
    /**
     * Updates the key to match the name field
     *
     * @param {string} businessUnit name of BU
     * @param {TYPE.SupportedMetadataTypes} selectedType limit to given metadata types
     * @param {string[]} [keys] customerkey of the metadata
     * @returns {Promise.<Object.<string, string[]>>} key: business unit name, value: list of paused item keys
     */
    static async fixKeys(businessUnit, selectedType, keys) {
        return this.#runMethod('fixKeys', businessUnit, selectedType, keys);
    }
    /**
     * run a method across BUs
     *
     * @param {'execute'|'pause'|'fixKeys'|'updateNotifications'} methodName what to run
     * @param {string} businessUnit name of BU
     * @param {TYPE.SupportedMetadataTypes} [selectedType] limit to given metadata types
     * @param {string[]} [keys] customerkey of the metadata
     * @returns {Promise.<Object.<string, string[]>>} key: business unit name, value: list of affected item keys
     */
    static async #runMethod(methodName, businessUnit, selectedType, keys) {
        Util.startLogger();
        let lang_past;
        let lang_present;
        let requireKeyOrLike;
        let checkMetadataSupport;
        const resultObj = {};

        switch (methodName) {
            case 'execute': {
                lang_past = 'executed';
                lang_present = 'executing';
                requireKeyOrLike = true;
                checkMetadataSupport = true;
                break;
            }
            case 'pause': {
                lang_past = 'paused';
                lang_present = 'pausing';
                requireKeyOrLike = true;
                checkMetadataSupport = true;
                break;
            }
            case 'fixKeys': {
                lang_past = 'fixed keys';
                lang_present = 'fixing keys';
                requireKeyOrLike = false;
                checkMetadataSupport = false;
                break;
            }
            case 'updateNotifications': {
                lang_past = 'updated notifications for';
                lang_present = 'updating notifications for';
                requireKeyOrLike = true;
                checkMetadataSupport = false;
                break;
            }
        }

        Util.logger.info(`mcdev:: ${methodName} ${selectedType}`);
        const properties = await config.getProperties();
        let counter_credBu = 0;
        let counter_credKeys = 0;
        if (!(await config.checkProperties(properties))) {
            // return null here to avoid seeing 2 error messages for the same issue
            return resultObj;
        }
        if (!Util._isValidType(selectedType)) {
            return resultObj;
        }
        if (
            checkMetadataSupport &&
            !Object.prototype.hasOwnProperty.call(MetadataTypeInfo[selectedType], methodName)
        ) {
            Util.logger.error(
                ` ☇ skipping ${selectedType}: ${methodName} is not supported yet for ${selectedType}`
            );
            return resultObj;
        }

        if (
            requireKeyOrLike &&
            (!Array.isArray(keys) || !keys.length) &&
            (!Util.OPTIONS.like || !Object.keys(Util.OPTIONS.like).length)
        ) {
            Util.logger.error('At least one key or a --like filter is required.');
            return resultObj;
        } else if (
            Array.isArray(keys) &&
            keys.length &&
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
                    resultObj[cred + '/' + bu] = await this.#runOnBU(
                        methodName,
                        cred,
                        bu,
                        selectedType,
                        keys
                    );
                    counter_credBu++;
                    counter_credKeys += resultObj[cred + '/' + bu].length;
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
                    resultObj[cred + '/' + bu] = await this.#runOnBU(
                        methodName,
                        cred,
                        bu,
                        selectedType,
                        keys
                    );
                    counter_credBu++;
                    counter_credKeys += resultObj[cred + '/' + bu].length;
                    Util.startLogger(true);
                }
                Util.logger.info(
                    `:: ${lang_past} for ${counter_credKeys} ${selectedType}s on ${counter_credBu} BUs for ${cred}`
                );
            } else {
                // execute runMethod for the entity on one BU only
                resultObj[cred + '/' + bu] = await this.#runOnBU(
                    methodName,
                    cred,
                    bu,
                    selectedType,
                    keys
                );
                Util.logger.info(`:: Done`);
            }
        }
        return resultObj;
    }
    /**
     * helper for {@link Mcdev.#runMethod}
     *
     * @param {'execute'|'pause'|'fixKeys'|'updateNotifications'} methodName what to run
     * @param {string} cred name of Credential
     * @param {string} bu name of BU
     * @param {TYPE.SupportedMetadataTypes} [type] limit execution to given metadata type
     * @param {string[]} keyArr customerkey of the metadata
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
                case 'updateNotifications': {
                    if (Object.prototype.hasOwnProperty.call(MetadataTypeInfo[type], methodName)) {
                        resultArr.push(...(await MetadataTypeInfo[type][methodName](keyArr)));
                        if (resultArr.length > 0) {
                            Util.logger.info(`Retrieving ${type} to have most recent changes`);
                            const retriever = new Retriever(properties, buObject);
                            await retriever.retrieve([type], resultArr, null, false);
                        }
                    } else {
                        resultArr.push(
                            ...(await this.#updateNotifications(cred, bu, type, keyArr))
                        );
                    }
                    break;
                }
                default: {
                    if (Util.OPTIONS.like && Object.keys(Util.OPTIONS.like).length) {
                        keyArr = await this.#retrieveKeysWithLike(type, buObject);
                    }
                    if (!keyArr || (Array.isArray(keyArr) && !keyArr.length)) {
                        throw new Error('No keys were provided');
                    } // result will be undefined (false) if methodName is not supported for the type
                    resultArr.push(...(await MetadataTypeInfo[type][methodName](keyArr)));
                }
            }
        } catch (ex) {
            Util.logger.errorStack(ex, 'mcdev.' + methodName + ' failed');
        }
        return resultArr;
    }

    /**
     * helper for {@link Mcdev.#runOnBU}
     *
     * @param {TYPE.SupportedMetadataTypes} selectedType limit execution to given metadata type
     * @param {TYPE.BuObject} buObject properties for auth
     * @returns {string[]} keyArr
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
     * @param {TYPE.SupportedMetadataTypes} type limit execution to given metadata type
     * @param {string[]} [keyArr] customerkey of the metadata
     * @returns {Promise.<string[]>} list of keys that were affected
     */
    static async #fixKeys(cred, bu, type, keyArr) {
        const properties = await config.getProperties();
        let actuallyFixedKeys = [];
        if (
            MetadataTypeDefinitions[type].keyIsFixed === true ||
            MetadataTypeDefinitions[type].keyField === MetadataTypeDefinitions[type].idField
        ) {
            Util.logger.error(`Key cannot be updated for this type`);
            return actuallyFixedKeys;
        }
        const buObject = await Cli.getCredentialObject(
            properties,
            cred === null ? null : cred + '/' + bu,
            null,
            true
        );
        this.setOptions({
            changeKeyField: MetadataTypeDefinitions[type].nameField,
            fromRetrieve: true,
        });
        actuallyFixedKeys = await this.#updateItems(cred, bu, type, keyArr, 'fixKeys');
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
                const reRetrieve = await Cli.postFixKeysReretrieve(type, dependentTypes);
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

        return actuallyFixedKeys;
    }
    /**
     * A function to retrieve, update and deploy items
     *
     * @param {string} cred name of Credential
     * @param {string} bu name of BU
     * @param {TYPE.SupportedMetadataTypes} type limit execution to given metadata type
     * @param {string[]} [keyArr] customerkey of the metadata
     * @param {string} methodName name of the function to execute
     * @returns {Promise.<string[]>} list of keys that were affected
     */
    static async #updateItems(cred, bu, type, keyArr, methodName) {
        const properties = await config.getProperties();
        let actuallyUpdatedItems = [];
        const resultArr = [];

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
            const keysForDeploy = await this.#getKeys(type, metadataMap, methodName);
            if (keysForDeploy.length < 1) {
                Util.logger.warn(
                    `No items found with a key-name mismatch that match your criteria.\n`
                );
                return resultArr;
            }
            const deployed = await Deployer.deploy(cred + '/' + bu, [type], keysForDeploy);
            actuallyUpdatedItems = Object.keys(Object.values(Object.values(deployed)[0])[0]);
            resultArr.push(...actuallyUpdatedItems);
        } catch (ex) {
            Util.logger.errorStack(ex, `mcdev.${methodName} failed`);
        }
        return resultArr;
    }
    /**
     * helper function to get keys of items to update
     *
     * @param {TYPE.SupportedMetadataTypes} type limit execution to given metadata type
     * @param {TYPE.MetadataTypeMap} metadataMap metadata mapped by their keyField
     * @param {string} methodName name of the method to execute
     * @returns {string[]} list of keys
     */
    static async #getKeys(type, metadataMap, methodName) {
        const keys = [];
        switch (methodName) {
            case 'fixKeys': {
                keys.push(...(await MetadataTypeInfo[type].getKeysForFixing(metadataMap)));
                break;
            }
            case 'updateNotifications': {
                keys.push(...(await MetadataTypeInfo[type].getKeysToSetNotifications(metadataMap)));
                break;
            }
        }
        return keys;
    }
    /**
     * Updates notification email address field
     *
     * @param {string} businessUnit name of BU
     * @param {TYPE.SupportedMetadataTypes} selectedType limit execution to given metadata type
     * @param {string[]} [keys] customerkey of the metadata
     * @returns {Promise.<Object.<string, string[]>>} key: business unit name, value: list of affected item keys
     */
    static async updateNotifications(businessUnit, selectedType, keys) {
        if (
            !Util.OPTIONS.completionEmail &&
            !Util.OPTIONS.errorEmail &&
            !Util.OPTIONS.completionNote &&
            !Util.OPTIONS.errorNote &&
            !Util.OPTIONS.clear
        ) {
            // if no options were provided there is nothing to update
            Util.logger.error(`No email addresses, run notes or a clear option was provided`);
            return [];
        }

        return await this.#runMethod('updateNotifications', businessUnit, selectedType, keys);
    }
    /**
     * Updates notification email address field
     *
     * @param {string} cred name of Credential
     * @param {string} bu name of BU
     * @param {TYPE.SupportedMetadataTypes} type limit execution to given metadata type
     * @param {string[]} [keyArr] customerkey of the metadata
     * @returns {Promise.<string[]>} list of keys that were affected
     */
    static async #updateNotifications(cred, bu, type, keyArr) {
        let keysUpdatedNotifications = [];
        if (Util.OPTIONS.errorEmail || Util.OPTIONS.errorNote || Util.OPTIONS.completionNote) {
            Util.logger.error(
                `--errorEmail, --errorNote and --completionNote options are not available for ${type}`
            );
            return keysUpdatedNotifications;
        }
        if (!MetadataTypeDefinitions[type].fields.sendEmailNotification) {
            Util.logger.error(`Update notifications is not supported for this type`);
            return keysUpdatedNotifications;
        }
        this.setOptions({
            fromRetrieve: true,
        });
        keysUpdatedNotifications = await this.#updateItems(
            cred,
            bu,
            type,
            keyArr,
            'updateNotifications'
        );
        if (keysUpdatedNotifications && keysUpdatedNotifications.length) {
            Util.logger.info(
                `Successfully updated notifications. Updated ${
                    keysUpdatedNotifications.length
                } key${keysUpdatedNotifications.length === 1 ? '' : 's'} of type ${type}`
            );
        } else {
            Util.logger.warn(`No keys of type ${type} updated.`);
        }
        return keysUpdatedNotifications;
    }
}

export default Mcdev;
