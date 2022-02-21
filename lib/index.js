'use strict';

const Util = require('./util/util');
const File = require('./util/file');
const Init = require('./util/init');
const InitGit = require('./util/init.git');
const Cli = require('./util/cli');
const DevOps = require('./util/devops');
const BuHelper = require('./util/businessUnit');
const Builder = require('./Builder');
const Deployer = require('./Deployer');
const MetadataTypeInfo = require('./MetadataTypeInfo');
const MetadataTypeDefinitions = require('./MetadataTypeDefinitions');
const Retriever = require('./Retriever');
const inquirer = require('inquirer');
let properties;

/**
 * main class
 */
class Mcdev {
    /**
     * handler for 'mcdev createDeltaPkg
    * @param {Object} argv yargs parameters
    * @param {String} [argv.range] git commit range
    into deploy directory
    * @param {String} [argv.filter] filter file paths that start with any
    * @param {Boolean} [argv.skipInteraction] allows to skip interactive wizard
    * @returns {void}
    */
    static async createDeltaPkg(argv) {
        properties = properties || File.loadConfigFile();
        if (!Util.checkProperties(properties)) {
            return null;
        }
        // get source market and source BU from config
        if (argv.filter) {
            return DevOps.createDeltaPkg(properties, argv.range, true, argv.filter);
        } else {
            // If no custom filter was provided, use deployment marketLists & templating

            // check if sourceTargetMapping is valid
            if (
                !properties.options.deployment.sourceTargetMapping ||
                !Object.keys(properties.options.deployment.sourceTargetMapping).length
            ) {
                Util.logger.error('Bad configuration of options.deployment.sourceTargetMapping');
                return;
            }
            const sourceMarketListArr = Object.keys(
                properties.options.deployment.sourceTargetMapping
            );

            for (const sourceML of sourceMarketListArr) {
                // check if sourceTargetMapping has valid values
                // #1 check source marketlist
                try {
                    Builder.verifyMarketList(sourceML, properties);
                    // remove potentially existing "description"-entry
                    delete properties.marketList[sourceML].description;

                    const sourceMarketBuArr = Object.keys(properties.marketList[sourceML]);
                    if (sourceMarketBuArr.length !== 1) {
                        throw new Error('Only 1 BU is allowed per source marketList');
                    }
                    if ('string' !== typeof properties.marketList[sourceML][sourceMarketBuArr[0]]) {
                        throw new Error('Only 1 market per BU is allowed per source marketList');
                    }
                } catch (ex) {
                    Util.logger.error('Deployment Source: ' + ex.message);
                    return;
                }
                // #2 check corresponding target marketList
                let targetML;
                try {
                    targetML = properties.options.deployment.sourceTargetMapping[sourceML];
                    if ('string' !== typeof targetML) {
                        throw new Error(
                            'Please define one target marketList per source in deployment.sourceTargetMapping (No arrays allowed)'
                        );
                    }
                    Builder.verifyMarketList(targetML, properties);
                    // remove potentially existing "description"-entry
                    delete properties.marketList[targetML].description;
                } catch (ex) {
                    Util.logger.error('Deployment Target: ' + ex.message);
                }
            }
            // all good let's loop a second time for actual execution
            for (const sourceMlName of sourceMarketListArr) {
                const targetMlName =
                    properties.options.deployment.sourceTargetMapping[sourceMlName];
                const sourceBU = Object.keys(properties.marketList[sourceMlName])[0];
                const sourceMarket = Object.values(properties.marketList[sourceMlName])[0];

                const delta = await DevOps.createDeltaPkg(properties, argv.range, false, sourceBU);
                // If only chaing templating and buildDefinition if required
                if (!delta || delta.length === 0) {
                    // info/error messages was printed by DevOps.createDeltaPkg() already
                    return;
                }
                Util.logger.info('=============');

                // Put files into maps. One map with BU -> type -> file (for retrieveAsTemplate)
                // Other map only with type -> file (for buildDefinitionBulk)
                const buTypeDelta = {};
                const typeDelta = {};
                delta
                    // Only template/build files that were added/updated/moved. no deletions
                    // ! doesn't work for folder, because their name parsing doesnt work at the moment
                    .filter((file) => file.gitAction !== 'delete' && file.name)
                    .forEach((file) => {
                        const buPath = `${file._credential}/${file._businessUnit}`;
                        if (!buTypeDelta[buPath]) {
                            buTypeDelta[buPath] = {};
                        }
                        if (!buTypeDelta[buPath][file.type]) {
                            buTypeDelta[buPath][file.type] = [];
                        }
                        buTypeDelta[buPath][file.type].push(file.name);
                    });

                // Run retrieve as template for each business unit for each type
                Util.logger.info('Retrieve template from Git delta');
                // ! needs to be for (.. in ..) loop so that it gets executed in series
                for (const bu in buTypeDelta) {
                    for (const type in buTypeDelta[bu]) {
                        Util.logger.info(
                            `⚡ mcdev rt ${bu} ${type} "${buTypeDelta[bu][type].join(
                                ','
                            )}" ${sourceMarket}`
                        );
                        const result = await this.retrieveAsTemplate(
                            bu,
                            type,
                            buTypeDelta[bu][type].join(','),
                            sourceMarket
                        );

                        // ensure we have the right key for bd/bdb that matches the name used for rt
                        const keys = result[type].map(
                            (item) => item[MetadataTypeInfo[type].definition.keyField]
                        );
                        if (!typeDelta[type]) {
                            typeDelta[type] = [];
                        }
                        typeDelta[type].push(...keys);
                    }
                }

                // Run build definitions bulk for each type
                Util.logger.info(`- ✔️  Templates created`);
                Util.logger.info('=============');
                Util.logger.info('Build definitions from delta templates');
                if (
                    properties.directories.templateBuilds == properties.directories.deploy ||
                    (Array.isArray(properties.directories.templateBuilds) &&
                        properties.directories.templateBuilds.includes(
                            properties.directories.deploy
                        ))
                ) {
                    let responses;
                    if (!argv.skipInteraction) {
                        // deploy folder is in targets for definition creation
                        // recommend to purge their content first
                        const questions = [
                            {
                                type: 'confirm',
                                name: 'isPurgeDeployFolder',
                                message:
                                    'Do you want to empty the deploy folder (ensures no files from previous deployments remain)?',
                                default: true,
                            },
                        ];
                        responses = await new Promise((resolve) => {
                            inquirer.prompt(questions).then((answers) => {
                                resolve(answers);
                            });
                        });
                    }
                    if (argv.skipInteraction || responses.isPurgeDeployFolders) {
                        // Clear output folder structure for selected sub-type
                        File.removeSync(File.normalizePath([properties.directories.deploy]));
                    }
                }
                const bdPromises = [];
                for (const type in typeDelta) {
                    Util.logger.info(
                        `⚡ mcdev bdb ${targetMlName} ${type} "${typeDelta[type].join(',')}"`
                    );
                    // omitting "await" to speed up creation
                    bdPromises.push(
                        this.buildDefinitionBulk(targetMlName, type, typeDelta[type].join(','))
                    );
                }
                await Promise.all(bdPromises);
                Util.logger.info(`- ✔️  Deploy defintions created`);
                if (
                    properties.directories.templateBuilds == properties.directories.deploy ||
                    (Array.isArray(properties.directories.templateBuilds) &&
                        properties.directories.templateBuilds.includes(
                            properties.directories.deploy
                        ))
                ) {
                    Util.logger.info(`You can now run deploy on the prepared BUs`);
                } else {
                    Util.logger.info(
                        `Your templated defintions are now ready to be copied into the deploy folder. Hint: You can have this auto-copied if you adjust directories.templateBuilds in your config.`
                    );
                }
            }
        }
    }

    /**
     * configures what is displayed in the console
     * @param {object} argv list of command line parameters given by user
     * @param {Boolean} [argv.silent] only errors printed to CLI
     * @param {Boolean} [argv.verbose] chatty user CLI output
     * @param {Boolean} [argv.debug] enables developer output & features
     * @returns {void}
     */
    static setLoggingLevel(argv) {
        if (argv.silent) {
            // only errors printed to CLI
            Util.logger.level = 'error';
            Util.loggerTransports.console.level = 'error';
        } else if (argv.verbose) {
            // chatty user cli logs
            Util.logger.level = 'verbose';
            Util.loggerTransports.console.level = 'verbose';
        } else {
            // default user cli logs
            // TODO to be switched to "warn" when cli-process is integrated
            Util.logger.level = 'info';
            Util.loggerTransports.console.level = 'info';
        }
        if (argv.debug) {
            // enables developer output & features. no change to actual logs
            Util.logger.level = 'debug';
        }
    }

    /**
     * @returns {Promise} .
     */
    static async selectTypes() {
        properties = properties || File.loadConfigFile();
        if (!Util.checkProperties(properties)) {
            return null;
        }
        await Cli.selectTypes(properties);
    }
    /**
     * @returns {Promise} .
     */
    static explainTypes() {
        Cli.explainTypes();
    }
    /**
     * @param {Boolean|Object} [skipInteraction] signals what to insert automatically for things usually asked via wizard
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
     * @param {String} businessUnit references credentials from properties.json
     * @param {String} [selectedType] limit retrieval to given metadata type
     * @param {boolean} [changelogOnly] skip saving, only create json in memory
     * @returns {Promise<Object>} -
     */
    static async retrieve(businessUnit, selectedType, changelogOnly) {
        Util.logger.info('mcdev:: Retrieve');
        properties = properties || File.loadConfigFile();
        if (!Util.checkProperties(properties)) {
            // return null here to avoid seeing 2 error messages for the same issue
            return null;
        }
        const [type, subType] = selectedType ? selectedType.split('-') : [];
        if (type && !MetadataTypeInfo[type]) {
            Util.logger.error(`:: '${type}' is not a valid metadata type`);
            return;
        } else if (
            type &&
            subType &&
            (!MetadataTypeInfo[type] || !MetadataTypeDefinitions[type].subTypes.includes(subType))
        ) {
            Util.logger.error(`:: '${selectedType}' is not a valid metadata type`);
            return;
        }

        if (businessUnit === '*') {
            Util.logger.info('\n:: Retrieving all BUs for all credentials');
            let counter_credTotal = 0;
            for (const cred in properties.credentials) {
                Util.logger.info(`\n:: Retrieving all BUs for ${cred}`);
                let counter_credBu = 0;
                for (const bu in properties.credentials[cred].businessUnits) {
                    await this._retrieveBU(cred, bu, selectedType);
                    counter_credBu++;
                    Util.restartLogger();
                }
                counter_credTotal += counter_credBu;
                Util.logger.info(`\n:: ${counter_credBu} BUs for ${cred}\n`);
            }
            Util.logger.info(`\n:: ${counter_credTotal} BUs in total\n`);
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
                Util.logger.info(`\n:: Retrieving all BUs for ${cred}`);
                let counter_credBu = 0;
                for (const bu in properties.credentials[cred].businessUnits) {
                    await this._retrieveBU(cred, bu, selectedType);
                    counter_credBu++;
                    Util.restartLogger();
                }
                Util.logger.info(`\n:: ${counter_credBu} BUs for ${cred}\n`);
            } else {
                // retrieve a single BU; return
                const retrieveChangelog = await this._retrieveBU(
                    cred,
                    bu,
                    selectedType,
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
     * @param {String} cred name of Credential
     * @param {String} bu name of BU
     * @param {String} [selectedType] limit retrieval to given metadata type/subtype
     * @param {boolean} [changelogOnly] skip saving, only create json in memory
     * @returns {Promise<Object>} ensure that BUs are worked on sequentially
     */
    static async _retrieveBU(cred, bu, selectedType, changelogOnly) {
        properties = properties || File.loadConfigFile();
        const buObject = await Cli.getCredentialObject(
            properties,
            cred !== null ? cred + '/' + bu : null,
            null,
            true
        );
        if (buObject !== null) {
            cred = buObject.credential;
            bu = buObject.businessUnit;
            Util.logger.info(`\n:: Retrieving ${cred}/${bu}\n`);
            let retrieveTypesArr;
            const [type, subType] = selectedType ? selectedType.split('-') : [];
            if (
                type &&
                subType &&
                MetadataTypeInfo[type] &&
                MetadataTypeDefinitions[type].subTypes.includes(subType)
            ) {
                // Clear output folder structure for selected sub-type
                File.removeSync(
                    File.normalizePath([properties.directories.retrieve, cred, bu, type, subType])
                );
                retrieveTypesArr = [selectedType];
            } else if (type && MetadataTypeInfo[type]) {
                // Clear output folder structure for selected type
                File.removeSync(
                    File.normalizePath([properties.directories.retrieve, cred, bu, type])
                );
                retrieveTypesArr = [type];
            } else {
                // Clear output folder structure
                File.removeSync(File.normalizePath([properties.directories.retrieve, cred, bu]));
                // assume no type was given and config settings are used instead:
                // removes subtypes and removes duplicates
                retrieveTypesArr = [
                    ...new Set(properties.metaDataTypes.retrieve.map((type) => type.split('-')[0])),
                ];
            }
            let client;
            try {
                client = await Util.getETClient(buObject);
            } catch (ex) {
                Util.logger.error(ex.message);
                return;
            }
            const retriever = new Retriever(properties, buObject, client);

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
                Util.logger.error('mcdev.retrieve failed: ' + ex.message);
                Util.logger.debug(ex.stack);
                if (Util.logger.level === 'debug') {
                    console.log(ex.stack);
                }
            }
        }
    }
    /**
     * helper for deploy()
     * @param {String} cred name of Credential
     * @param {String} bu name of BU
     * @param {String} [type] limit deployment to given metadata type
     * @returns {Promise} ensure that BUs are worked on sequentially
     */
    static async _deployBU(cred, bu, type) {
        const buPath = `${cred}/${bu}`;
        Util.logger.info(`::Deploying ${buPath}`);
        properties = properties || File.loadConfigFile();
        const buObject = await Cli.getCredentialObject(properties, buPath, null, true);
        if (buObject !== null) {
            let client;
            try {
                client = await Util.getETClient(buObject);
            } catch (ex) {
                Util.logger.error(ex.message);
                return;
            }
            const deployer = new Deployer(properties, buObject, client, type);
            try {
                // await is required or the calls end up conflicting
                await deployer.deploy();
            } catch (ex) {
                Util.logger.error('mcdev.deploy failed: ' + ex.message);
                Util.logger.debug(ex.stack);
                if (Util.logger.level === 'debug') {
                    console.log(ex.stack);
                }
            }
        }
    }

    /**
     * Deploys all metadata located in the 'deploy' directory to the specified business unit
     * @param {String} businessUnit references credentials from properties.json
     * @param {String} [selectedType] limit deployment to given metadata type
     * @returns {Promise<void>} -
     */
    static async deploy(businessUnit, selectedType) {
        Util.logger.info('mcdev:: Deploy');
        properties = properties || File.loadConfigFile();

        const [type, subType] = selectedType ? selectedType.split('-') : [];
        if (type && !MetadataTypeInfo[type]) {
            Util.logger.error(`:: '${type}' is not a valid metadata type`);
            return;
        } else if (
            type &&
            subType &&
            (!MetadataTypeInfo[type] || !MetadataTypeDefinitions[type].subTypes.includes(subType))
        ) {
            Util.logger.error(`:: '${selectedType}' is not a valid metadata type`);
            return;
        }
        let counter_credBu = 0;
        if (businessUnit === '*') {
            // all credentials and all BUs shall be deployed to
            const deployFolders = await File.readDirectories(
                properties.directories.deploy,
                2,
                false
            );
            for (const buPath of deployFolders.filter((r) => r.includes('/'))) {
                const [cred, bu] = buPath.split('/');
                await this._deployBU(cred, bu, type);
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
                Util.logger.info(`\n:: Deploying all BUs for ${cred}`);
                let counter_credBu = 0;
                // for (const bu in properties.credentials[cred].businessUnits) {
                const deployFolders = await File.readDirectories(
                    File.normalizePath([properties.directories.deploy, cred]),
                    1,
                    false
                );
                for (const buPath of deployFolders) {
                    await this._deployBU(cred, buPath, type);
                    counter_credBu++;
                    Util.logger.info('');
                    Util.restartLogger();
                }
                Util.logger.info(`\n:: ${counter_credBu} BUs for ${cred}\n`);
            } else {
                // either bad credential or specific BU or no BU given
                await this._deployBU(cred, bu, type);
                counter_credBu++;
            }
        }
        if (counter_credBu !== 0) {
            Util.logger.info(`\n:: Deployed ${counter_credBu} BUs\n`);
        }
    }

    /**
     * Creates template file for properties.json
     * @param {string} [credentialsName] identifying name of the installed package / project
     * @param {Boolean|Object} [skipInteraction] signals what to insert automatically for things usually asked via wizard
     * @returns {Promise<void>} -
     */
    static async initProject(credentialsName, skipInteraction) {
        Util.logger.info('mcdev:: Setting up project');
        properties = properties || File.loadConfigFile(!!credentialsName);
        await Init.initProject(properties, credentialsName, skipInteraction);
    }

    /**
     * Refreshes BU names and ID's from MC instance
     * @param {string} credentialsName identifying name of the installed package / project
     * @returns {Promise<void>} -
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
     * @param {String} businessUnit references credentials from properties.json
     * @param {String} type metadata type
     * @returns {Promise<void>} -
     */
    static async document(businessUnit, type) {
        Util.logger.info('mcdev:: Document');
        properties = properties || File.loadConfigFile();
        if (type && !MetadataTypeInfo[type]) {
            Util.logger.error(`:: '${type}' is not a valid metadata type`);
            return;
        }
        try {
            const parentBUOnlyTypes = ['role'];
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
     * @param {String} businessUnit references credentials from properties.json
     * @param {String} type supported metadata type
     * @param {String} customerKey Identifier of data extension
     * @returns {Promise<void>} -
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
                MetadataTypeInfo[type].client = await Util.getETClient(buObject);
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
     * @param {String} businessUnit references credentials from properties.json
     * @returns {Promise<void>} -
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
            const docPath = File.filterIllegalPathChars(
                properties.directories.badKeys + buObject.credential
            );
            const filename = File.normalizePath([
                docPath,
                File.filterIllegalFilenames(buObject.businessUnit) + '.badKeys.md',
            ]);
            if (!File.existsSync(docPath)) {
                File.mkdirpSync(docPath);
            } else if (File.existsSync(filename)) {
                File.removeSync(filename);
            }

            const regex = RegExp('(\\w+-){4}\\w+');
            let metadata;
            if (File.existsSync(retrieveDir)) {
                metadata = Deployer.readBUMetadata(retrieveDir, null, true);
            } else {
                Util.logger.warn(
                    `Looks like ${retrieveDir} does not exist. If there was no metadata retrieved this is expected, in other cases re-run retrieve to attempt to fix this issue`
                );
                return;
            }
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
     * @param {String} businessUnit references credentials from properties.json
     * @param {String} selectedType supported metadata type
     * @param {String} name name of the metadata
     * @param {String} market market which should be used to revert template
     * @returns {Promise<Util.MultiMetadataTypeList>} -
     */
    static async retrieveAsTemplate(businessUnit, selectedType, name, market) {
        Util.logger.info('mcdev:: Retrieve as Template');
        properties = properties || File.loadConfigFile();
        const [type, subType] = selectedType ? selectedType.split('-') : [];
        if (type && !MetadataTypeInfo[type]) {
            Util.logger.error(`:: '${type}' is not a valid metadata type`);
            return;
        } else if (
            type &&
            subType &&
            (!MetadataTypeInfo[type] || !MetadataTypeDefinitions[type].subTypes.includes(subType))
        ) {
            Util.logger.error(`:: '${selectedType}' is not a valid metadata type`);
            return;
        }

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
            let client;
            try {
                client = await Util.getETClient(buObject);
            } catch (ex) {
                Util.logger.error(ex.message);
                return;
            }
            const retriever = new Retriever(properties, buObject, client);
            if (this._checkMarket(market)) {
                return retriever.retrieve(retrieveTypesArr, name, properties.markets[market]);
            }
        }
    }

    /**
     * Build a specific metadata file based on a template.
     * @param {String} businessUnit references credentials from properties.json
     * @param {String} type supported metadata type
     * @param {String} name name of the metadata
     * @param {String} market market localizations
     * @returns {Promise<void>} -
     */
    static async buildDefinition(businessUnit, type, name, market) {
        Util.logger.info('mcdev:: Build Definition from Template');
        properties = properties || File.loadConfigFile();
        if (type.includes('-')) {
            Util.logger.error(
                `:: '${type}' is not a valid metadata type. Please don't include subtypes.`
            );
            return;
        }
        if (type && !MetadataTypeInfo[type]) {
            Util.logger.error(`:: '${type}' is not a valid metadata type`);
            return;
        }
        const buObject = await Cli.getCredentialObject(properties, businessUnit);
        if (buObject !== null) {
            const builder = new Builder(properties, buObject, null);
            if (market === '*') {
                for (const oneMarket in properties.markets) {
                    builder.buildDefinition(type, name, properties.markets[oneMarket]);
                }
            } else {
                if (this._checkMarket(market)) {
                    builder.buildDefinition(type, name, properties.markets[market]);
                }
            }
        }
    }
    /**
     * check if a market name exists in current mcdev config
     * @param {String} market market localizations
     * @returns {Boolean} found market or not
     */
    static _checkMarket(market) {
        properties = properties || File.loadConfigFile();
        if (properties.markets[market]) {
            return true;
        } else {
            Util.logger.error(`Could not find the market '${market}' in your configuration file.`);
            const marketArr = [];
            for (const oneMarket in properties.markets) {
                marketArr.push(oneMarket);
            }
            if (marketArr.length) {
                Util.logger.info('Available markets are: ' + marketArr.join(', '));
            }
            return false;
        }
    }

    /**
     * Build a specific metadata file based on a template using a list of bu-market combos
     * @param {String} listName name of list of BU-market combos
     * @param {String} type supported metadata type
     * @param {String} name name of the metadata
     * @returns {Promise<void>} -
     */
    static async buildDefinitionBulk(listName, type, name) {
        Util.logger.info('mcdev:: Build Definition from Template Bulk');
        properties = properties || File.loadConfigFile();
        if (!properties.marketList) {
            Util.logger.error('Please define properties.marketList object in your config');
            return;
        }
        if (!properties.marketList[listName]) {
            Util.logger.error(`Please define properties.marketList.${listName} in your config`);
            return;
        }
        if (type && !MetadataTypeInfo[type]) {
            Util.logger.error(`:: '${type}' is not a valid metadata type`);
            return;
        }
        let i = 0;
        for (const businessUnit in properties.marketList[listName]) {
            if (businessUnit === 'description') {
                // skip, it's just a metadata on this list and not a BU
                continue;
            }
            i++;
            const market = properties.marketList[listName][businessUnit];
            let marketList = [];
            if ('string' === typeof market) {
                marketList.push(market);
            } else {
                marketList = market;
            }
            marketList.forEach((market) => {
                if (market && properties.markets[market]) {
                    Util.logger.info(`Executing for '${businessUnit}': '${market}'`);
                    this.buildDefinition(businessUnit, type, name, market);
                } else {
                    Util.logger.error(
                        `Could not find '${market}' in properties.markets. Please check your properties.marketList.${listName} confguration.`
                    );
                }
            });
        }
        if (!i) {
            Util.logger.error('Please define properties.marketList in your config');
        }
    }
}

module.exports = Mcdev;
