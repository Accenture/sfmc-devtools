'use strict';

const TYPE = require('../types/mcdev.d');
const Util = require('./util/util');
const auth = require('./util/auth');
const File = require('./util/file');
const config = require('./util/config');
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
const cache = require('./util/cache');

/**
 * main class
 */
class Mcdev {
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
     * handler for 'mcdev createDeltaPkg
     *
     * @param {object} argv yargs parameters
     * @param {string} [argv.range] git commit range
    into deploy directory
     * @param {string} [argv.filter] filter file paths that start with any
     * @param {TYPE.skipInteraction} [argv.skipInteraction] allows to skip interactive wizard
     * @returns {Promise.<TYPE.DeltaPkgItem[]>} list of changed items
     */
    static async createDeltaPkg(argv) {
        Util.logger.info('Create Delta Package ::');
        Mcdev.setSkipInteraction(argv.skipInteraction);
        const properties = await config.getProperties();
        if (!(await config.checkProperties(properties))) {
            return null;
        }

        return argv.filter
            ? // get source market and source BU from config
              DevOps.getDeltaList(properties, argv.range, true, argv.filter)
            : // If no custom filter was provided, use deployment marketLists & templating
              DevOps.buildDeltaDefinitions(properties, argv.range, argv.skipInteraction);
    }

    /**
     * @returns {Promise} .
     */
    static async selectTypes() {
        const properties = await config.getProperties();
        if (!(await config.checkProperties(properties))) {
            return null;
        }
        await Cli.selectTypes(properties);
    }
    /**
     * @returns {void}
     */
    static explainTypes() {
        Cli.explainTypes();
    }
    /**
     * @param {boolean | TYPE.skipInteraction} [skipInteraction] signals what to insert automatically for things usually asked via wizard
     * @returns {Promise.<boolean>} success flag
     */
    static async upgrade(skipInteraction) {
        Mcdev.setSkipInteraction(skipInteraction);
        const properties = await config.getProperties();
        if (!properties) {
            Util.logger.error('No config found. Please run mcdev init');
            return false;
        }
        if ((await InitGit.initGitRepo(skipInteraction)).status === 'error') {
            return false;
        }

        return Init.upgradeProject(properties, false);
    }

    /**
     * Retrieve all metadata from the specified business unit into the local file system.
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {string[]} [selectedTypesArr] limit retrieval to given metadata type
     * @param {string[]} [keys] limit retrieval to given metadata key
     * @param {boolean} [changelogOnly] skip saving, only create json in memory
     * @returns {Promise.<object>} -
     */
    static async retrieve(businessUnit, selectedTypesArr, keys, changelogOnly) {
        Util.logger.info('mcdev:: Retrieve');
        const properties = await config.getProperties();
        if (!(await config.checkProperties(properties))) {
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
                    await this._retrieveBU(cred, bu, selectedTypesArr, keys);
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
                    await this._retrieveBU(cred, bu, selectedTypesArr, keys);
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
                    keys,
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
     * @param {string[]} [keys] limit retrieval to given metadata key
     * @param {boolean} [changelogOnly] skip saving, only create json in memory
     * @returns {Promise.<object>} ensure that BUs are worked on sequentially
     */
    static async _retrieveBU(cred, bu, selectedTypesArr, keys, changelogOnly) {
        const properties = await config.getProperties();
        if (!(await config.checkProperties(properties))) {
            return null;
        }
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
                    keys,
                    null,
                    changelogOnly
                );
                if (changelogOnly) {
                    return retrieveChangelog;
                }
            } catch (ex) {
                Util.logger.errorStack(ex, 'mcdev.retrieve failed');
            }
        }
    }

    /**
     * Deploys all metadata located in the 'deploy' directory to the specified business unit
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {string[]} [selectedTypesArr] limit deployment to given metadata type
     * @param {string[]} [keyArr] limit deployment to given metadata keys
     * @param {boolean} [fromRetrieve] optionally deploy whats defined via selectedTypesArr + keyArr directly from retrieve folder instead of from deploy folder
     * @returns {Promise.<void>} -
     */
    static async deploy(businessUnit, selectedTypesArr, keyArr, fromRetrieve = false) {
        return Deployer.deploy(businessUnit, selectedTypesArr, keyArr, fromRetrieve);
    }

    /**
     * Creates template file for properties.json
     *
     * @param {string} [credentialsName] identifying name of the installed package / project
     * @param {boolean | TYPE.skipInteraction} [skipInteraction] signals what to insert automatically for things usually asked via wizard
     * @returns {Promise.<void>} -
     */
    static async initProject(credentialsName, skipInteraction) {
        Util.logger.info('mcdev:: Setting up project');
        Mcdev.setSkipInteraction(skipInteraction);
        const properties = await config.getProperties(!!credentialsName);
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
        const properties = await config.getProperties();
        if (!(await config.checkProperties(properties))) {
            return null;
        }
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
        Util.logger.info('mcdev:: Retrieve as Template');
        const properties = await config.getProperties();
        if (!(await config.checkProperties(properties))) {
            return null;
        }
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
}

module.exports = Mcdev;
