'use strict';

const TYPE = require('../types/mcdev.d');
const Util = require('./util/util');
const auth = require('./util/auth');
const File = require('./util/file');
const Init = require('./util/init');
const path = require('path');

const InitGit = require('./util/init.git');
const Cli = require('./util/cli');
const DevOps = require('./util/devops');
const BuHelper = require('./util/businessUnit');
const Builder = require('./Builder');
const Deployer = require('./Deployer');
const MetadataTypeInfo = require('./MetadataTypeInfo');
const MetadataTypeDefinitions = require('./MetadataTypeDefinitions');
const Retriever = require('./Retriever');
const cache = require('./util/cache');
let properties;

/**
 * main class
 */
class Mcdev {
    /**
     * helper method to use unattended mode when including mcdev as a package
     *
     * @param {TYPE.skipInteraction} [skipInteraction] signals what to insert automatically for things usually asked via wizard
     * @returns {void}
     */
    static setSkipInteraction(skipInteraction) {
        Util.skipInteraction = skipInteraction;
    }
    /**
     * handler for 'mcdev createDeltaPkg
     *
     * @param {object} argv yargs parameters
     * @param {string} [argv.range] git commit range
    into deploy directory
     * @param {string} [argv.filter] filter file paths that start with any
     * @param {object} [argv.skipInteraction] allows to skip interactive wizard
     * @returns {Promise.<TYPE.DeltaPkgItem[]>} list of changed items
     */
    static async createDeltaPkg(argv) {
        properties = properties || File.loadConfigFile();
        if (!(await Util.checkProperties(properties))) {
            return null;
        }
        // get source market and source BU from config
        if (argv.filter) {
            return DevOps.getDeltaList(properties, argv.range, true, argv.filter);
        } else {
            // If no custom filter was provided, use deployment marketLists & templating
            return DevOps.buildDeltaDefinitions(properties, argv.range, argv.skipInteraction);
        }
    }

    /**
     * @returns {Promise} .
     */
    static async selectTypes() {
        properties = properties || File.loadConfigFile();
        if (!(await Util.checkProperties(properties))) {
            return null;
        }
        await Cli.selectTypes(properties);
    }
    /**
     * @returns {void} .
     */
    static explainTypes() {
        Cli.explainTypes();
    }
    /**
     * @param {boolean | object} [skipInteraction] signals what to insert automatically for things usually asked via wizard
     * @returns {Promise} .
     */
    static async upgrade(skipInteraction) {
        properties = properties || File.loadConfigFile();
        if (!properties) {
            Util.logger.error('No config found. Please run mcdev init');
            return;
        }
        if ((await InitGit.initGitRepo(skipInteraction)).status === 'error') {
            return;
        }

        Init.upgradeProject(properties, false);
    }

    /**
     * Retrieve all metadata from the specified business unit into the local file system.
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {string[]} [selectedTypesArr] limit retrieval to given metadata type
     * @param {boolean} [changelogOnly] skip saving, only create json in memory
     * @returns {Promise.<object>} -
     */
    static async retrieve(businessUnit, selectedTypesArr, changelogOnly) {
        Util.logger.info('mcdev:: Retrieve');
        properties = properties || File.loadConfigFile();
        if (!(await Util.checkProperties(properties))) {
            // return null here to avoid seeing 2 error messages for the same issue
            return null;
        }

        // assume a list was passed in and check each entry's validity
        if (selectedTypesArr) {
            for (const selectedType of selectedTypesArr) {
                if (!Util._isValidType(selectedType)) {
                    return;
                }
            }
        }

        if (businessUnit === '*') {
            Util.logger.info('\n               :: Retrieving all BUs for all credentials');
            let counter_credTotal = 0;
            for (const cred in properties.credentials) {
                Util.logger.info(`\n               :: Retrieving all BUs for ${cred}`);
                let counter_credBu = 0;
                for (const bu in properties.credentials[cred].businessUnits) {
                    await this._retrieveBU(cred, bu, selectedTypesArr);
                    counter_credBu++;
                    Util.restartLogger();
                }
                counter_credTotal += counter_credBu;
                Util.logger.info(`\n               :: ${counter_credBu} BUs for ${cred}\n`);
            }
            Util.logger.info(`\n               :: ${counter_credTotal} BUs in total\n`);
        } else {
            let [cred, bu] = businessUnit ? businessUnit.split('/') : [null, null];
            // to allow all-BU via user selection we need to run this here already
            if (
                properties.credentials &&
                (!properties.credentials[cred] ||
                    (bu !== '*' && properties.credentials[cred].businessUnits[bu]))
            ) {
                const buObject = await Cli.getCredentialObject(
                    properties,
                    cred !== null ? cred + '/' + bu : null,
                    null,
                    true
                );
                if (buObject !== null) {
                    cred = buObject.credential;
                    bu = buObject.businessUnit;
                } else {
                    return;
                }
            }

            if (bu === '*' && properties.credentials && properties.credentials[cred]) {
                Util.logger.info(`\n               :: Retrieving all BUs for ${cred}`);
                let counter_credBu = 0;
                for (const bu in properties.credentials[cred].businessUnits) {
                    await this._retrieveBU(cred, bu, selectedTypesArr);
                    counter_credBu++;
                    Util.restartLogger();
                }
                Util.logger.info(`\n               :: ${counter_credBu} BUs for ${cred}\n`);
            } else {
                // retrieve a single BU; return
                const retrieveChangelog = await this._retrieveBU(
                    cred,
                    bu,
                    selectedTypesArr,
                    changelogOnly
                );
                if (changelogOnly) {
                    return retrieveChangelog;
                }
                Util.logger.info(`:: Done\n`);
            }
        }
    }
    /**
     * helper for retrieve()
     *
     * @private
     * @param {string} cred name of Credential
     * @param {string} bu name of BU
     * @param {string[]} [selectedTypesArr] limit retrieval to given metadata type/subtype
     * @param {boolean} [changelogOnly] skip saving, only create json in memory
     * @returns {Promise.<object>} ensure that BUs are worked on sequentially
     */
    static async _retrieveBU(cred, bu, selectedTypesArr, changelogOnly) {
        properties = properties || File.loadConfigFile();
        const buObject = await Cli.getCredentialObject(
            properties,
            cred !== null ? cred + '/' + bu : null,
            null,
            true
        );
        if (buObject !== null) {
            cache.initCache(buObject);
            cred = buObject.credential;
            bu = buObject.businessUnit;
            Util.logger.info(`\n               :: Retrieving ${cred}/${bu}\n`);
            const retrieveTypesArr = [];
            if (selectedTypesArr) {
                for (const selectedType of selectedTypesArr) {
                    const [type, subType] = selectedType ? selectedType.split('-') : [];
                    if (
                        type &&
                        subType &&
                        MetadataTypeInfo[type] &&
                        MetadataTypeDefinitions[type].subTypes.includes(subType)
                    ) {
                        // Clear output folder structure for selected sub-type
                        File.removeSync(
                            File.normalizePath([
                                properties.directories.retrieve,
                                cred,
                                bu,
                                type,
                                subType,
                            ])
                        );
                        retrieveTypesArr.push(selectedType);
                    } else if (type && MetadataTypeInfo[type]) {
                        // Clear output folder structure for selected type
                        File.removeSync(
                            File.normalizePath([properties.directories.retrieve, cred, bu, type])
                        );
                        retrieveTypesArr.push(type);
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
            }
            const retriever = new Retriever(properties, buObject);

            try {
                // await is required or the calls end up conflicting
                const retrieveChangelog = await retriever.retrieve(
                    retrieveTypesArr,
                    null,
                    null,
                    changelogOnly
                );
                if (changelogOnly) {
                    return retrieveChangelog;
                }
                if (properties.options.documentOnRetrieve) {
                    // todo: find the underlying async issue that makes this wait necessary
                    await new Promise((resolve) => {
                        setTimeout(() => resolve('done!'), 1000);
                    });
                    await this.badKeys(`${cred}/${bu}`);
                }
            } catch (ex) {
                Util.logger.errorStack(ex, 'mcdev.retrieve failed');
            }
        }
    }
    /**
     * helper for deploy()
     *
     * @param {string} cred name of Credential
     * @param {string} bu name of BU
     * @param {string[]} [typeArr] limit deployment to given metadata type
     * @param {string[]} [keyArr] limit deployment to given metadata keys
     * @returns {Promise} ensure that BUs are worked on sequentially
     */
    static async _deployBU(cred, bu, typeArr, keyArr) {
        const buPath = `${cred}/${bu}`;
        Util.logger.info(`::Deploying ${buPath}`);
        properties = properties || File.loadConfigFile();
        const buObject = await Cli.getCredentialObject(properties, buPath, null, true);
        if (buObject !== null) {
            cache.initCache(buObject);
            const deployer = new Deployer(properties, buObject);
            try {
                // await is required or the calls end up conflicting
                await deployer.deploy(typeArr, keyArr);
            } catch (ex) {
                Util.logger.errorStack(ex, 'mcdev.deploy failed');
            }
        }
    }

    /**
     * Deploys all metadata located in the 'deploy' directory to the specified business unit
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {string[]} [selectedTypesArr] limit deployment to given metadata type
     * @param {string[]} [keyArr] limit deployment to given metadata keys
     * @returns {Promise.<void>} -
     */
    static async deploy(businessUnit, selectedTypesArr, keyArr) {
        Util.logger.info('mcdev:: Deploy');
        properties = properties || File.loadConfigFile();

        if (selectedTypesArr) {
            for (const selectedType of selectedTypesArr) {
                if (!Util._isValidType(selectedType)) {
                    return;
                }
            }
        }
        let counter_credBu = 0;
        if (businessUnit === '*') {
            // all credentials and all BUs shall be deployed to
            const deployFolders = await File.readDirectories(
                properties.directories.deploy,
                2,
                false
            );
            for (const buPath of deployFolders.filter((r) => r.includes(path.sep))) {
                const [cred, bu] = buPath.split(path.sep);
                await this._deployBU(cred, bu, selectedTypesArr);
                counter_credBu++;
                Util.logger.info('');
                Util.restartLogger();
            }
        } else {
            // anything but "*" passed in
            let [cred, bu] = businessUnit ? businessUnit.split('/') : [null, null];

            // to allow all-BU via user selection we need to run this here already
            if (
                properties.credentials &&
                (!properties.credentials[cred] ||
                    (bu !== '*' && properties.credentials[cred].businessUnits[bu]))
            ) {
                const buObject = await Cli.getCredentialObject(
                    properties,
                    cred !== null ? cred + '/' + bu : null,
                    null,
                    true
                );
                if (buObject !== null) {
                    cred = buObject.credential;
                    bu = buObject.businessUnit;
                } else {
                    return;
                }
            }

            if (bu === '*' && properties.credentials && properties.credentials[cred]) {
                // valid credential given and -all- BUs targeted
                Util.logger.info(`\n               :: Deploying all BUs for ${cred}`);
                let counter_credBu = 0;
                // for (const bu in properties.credentials[cred].businessUnits) {
                const deployFolders = await File.readDirectories(
                    File.normalizePath([properties.directories.deploy, cred]),
                    1,
                    false
                );
                for (const buPath of deployFolders) {
                    await this._deployBU(cred, buPath, selectedTypesArr, keyArr);
                    counter_credBu++;
                    Util.logger.info('');
                    Util.restartLogger();
                }
                Util.logger.info(`\n               :: ${counter_credBu} BUs for ${cred}\n`);
            } else {
                // either bad credential or specific BU or no BU given
                await this._deployBU(cred, bu, selectedTypesArr, keyArr);
                counter_credBu++;
            }
        }
        if (counter_credBu !== 0) {
            Util.logger.info(`\n               :: Deployed ${counter_credBu} BUs\n`);
        }
    }

    /**
     * Creates template file for properties.json
     *
     * @param {string} [credentialsName] identifying name of the installed package / project
     * @param {boolean | object} [skipInteraction] signals what to insert automatically for things usually asked via wizard
     * @returns {Promise.<void>} -
     */
    static async initProject(credentialsName, skipInteraction) {
        Util.logger.info('mcdev:: Setting up project');
        properties = properties || File.loadConfigFile(!!credentialsName);
        await Init.initProject(properties, credentialsName, skipInteraction);
    }

    /**
     * Refreshes BU names and ID's from MC instance
     *
     * @param {string} credentialsName identifying name of the installed package / project
     * @returns {Promise.<void>} -
     */
    static async findBUs(credentialsName) {
        Util.logger.info('mcdev:: Load BUs');
        properties = properties || File.loadConfigFile();
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
        Util.logger.info('mcdev:: Document');
        properties = properties || File.loadConfigFile();
        if (type && !MetadataTypeInfo[type]) {
            Util.logger.error(`:: '${type}' is not a valid metadata type`);
            return;
        }
        try {
            const parentBUOnlyTypes = ['accountUser', 'role'];
            const buObject = await Cli.getCredentialObject(
                properties,
                parentBUOnlyTypes.includes(type) ? businessUnit.split('/')[0] : businessUnit,
                parentBUOnlyTypes.includes(type) ? Util.parentBuName : null
            );
            if (buObject !== null) {
                MetadataTypeInfo[type].properties = properties;
                MetadataTypeInfo[type].document(buObject);
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
     * Creates docs for supported metadata types in Markdown and/or HTML format
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {string} type supported metadata type
     * @param {string} customerKey Identifier of data extension
     * @returns {Promise.<void>} -
     */
    static async deleteByKey(businessUnit, type, customerKey) {
        Util.logger.info('mcdev:: delete');
        properties = properties || File.loadConfigFile();
        const buObject = await Cli.getCredentialObject(properties, businessUnit);
        if (buObject !== null) {
            if ('string' !== typeof type) {
                Util.logger.error('mcdev.delete failed: Bad metadata type passed in');
                return;
            }
            try {
                MetadataTypeInfo[type].client = auth.getSDK(buObject);
            } catch (ex) {
                Util.logger.error(ex.message);
                return;
            }
            try {
                MetadataTypeInfo[type].properties = properties;
                MetadataTypeInfo[type].deleteByKey(buObject, customerKey);
            } catch (ex) {
                Util.logger.error('mcdev.delete ' + ex.message);
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
        properties = properties || File.loadConfigFile();
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

            const regex = RegExp('(\\w+-){4}\\w+');
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
     * @param {string} name name of the metadata
     * @param {string} market market which should be used to revert template
     * @returns {Promise.<TYPE.MultiMetadataTypeList>} -
     */
    static async retrieveAsTemplate(businessUnit, selectedType, name, market) {
        Util.logger.info('mcdev:: Retrieve as Template');
        properties = properties || File.loadConfigFile();
        if (!Util._isValidType(selectedType)) {
            return;
        }
        const [type, subType] = selectedType ? selectedType.split('-') : [];

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
        Util.logger.info('mcdev:: getFilesToCommit');
        const properties = File.loadConfigFile();
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
}

module.exports = Mcdev;
