'use strict';

const TYPE = require('../../types/mcdev.d');
const Cli = require('./cli');
const File = require('./file');
const Util = require('./util');
const inquirer = require('inquirer');
const path = require('path');
const semver = require('semver');

/**
 * CLI helper class
 */

const Init = {
    /**
     * helper method for this.upgradeProject that upgrades project config if needed
     *
     * @param {TYPE.Mcdevrc} properties config file's json
     * @returns {Promise.<boolean>} returns true if worked without errors
     */
    async fixMcdevConfig(properties) {
        if (!properties) {
            // skip if no config exists yet
            return true;
        }

        let updateConfigNeeded = false;

        const upgradeMsgs = [`Upgrading existing ${Util.configFileName}:`];

        const missingFields = await Util.checkProperties(properties, true);
        const defaultProps = Util.getDefaultProperties();
        if (missingFields.length) {
            missingFields.forEach((fieldName) => {
                switch (fieldName) {
                    case 'marketList':
                        if (properties.marketBulk) {
                            upgradeMsgs.push(`- ✔️  converted 'marketBulk' to '${fieldName}'`);
                            properties[fieldName] = properties.marketBulk;
                            delete properties.marketBulk;
                        } else {
                            upgradeMsgs.push(`- ✔️  added '${fieldName}'`);
                            this._updateLeaf(properties, defaultProps, fieldName);
                        }
                        break;
                    case 'directories.docs':
                        if (properties.directories.badKeys) {
                            delete properties.directories.badKeys;
                            upgradeMsgs.push(`- ✋ removed 'directories.badKeys'`);
                        }
                        if (properties.directories.dataExtension) {
                            File.removeSync(properties.directories.dataExtension);
                            delete properties.directories.dataExtension;
                            upgradeMsgs.push(`- ✋ removed 'directories.dataExtension'`);
                        }
                        if (properties.directories.deltaPackage) {
                            delete properties.directories.deltaPackage;
                            upgradeMsgs.push(`- ✋ removed 'directories.deltaPackage'`);
                        }
                        if (properties.directories.dataextension) {
                            delete properties.directories.dataextension;
                            upgradeMsgs.push(`- ✋ removed 'directories.dataextension'`);
                        }
                        if (properties.directories.roles) {
                            delete properties.directories.roles;
                            upgradeMsgs.push(`- ✋ removed 'directories.roles'`);
                        }
                        if (properties.directories.users) {
                            delete properties.directories.users;
                            upgradeMsgs.push(`- ✋ removed 'directories.users'`);
                        }

                        this._updateLeaf(properties, defaultProps, fieldName);
                        upgradeMsgs.push(`- ✔️  added '${fieldName}'`);
                        break;
                    case 'metaDataTypes.documentOnRetrieve':
                        if (!properties.options.documentOnRetrieve) {
                            properties.metaDataTypes.documentOnRetrieve = [];
                        } else {
                            this._updateLeaf(properties, defaultProps, fieldName);
                        }
                        delete properties.options.documentOnRetrieve;
                        upgradeMsgs.push(
                            `- ✔️  converted 'options.documentOnRetrieve' to '${fieldName}'`
                        );
                        break;
                    case 'options.deployment.commitHistory':
                        if (properties.options.commitHistory) {
                            upgradeMsgs.push(
                                `- ✔️  converted 'options.commitHistory' to '${fieldName}'`
                            );
                            properties.options.deployment.commitHistory =
                                properties.options.commitHistory;
                            delete properties.options.commitHistory;
                        } else {
                            upgradeMsgs.push(`- ✔️  added '${fieldName}'`);
                            this._updateLeaf(properties, defaultProps, fieldName);
                        }
                        break;
                    case 'options.exclude':
                        if (properties.options.filter) {
                            upgradeMsgs.push(`- ✔️  converted 'options.filter' to '${fieldName}'`);
                            properties.options.exclude = properties.options.filter;
                            delete properties.options.filter;
                        } else {
                            upgradeMsgs.push(`- ✔️  added '${fieldName}'`);
                            this._updateLeaf(properties, defaultProps, fieldName);
                        }
                        break;
                    case 'version':
                        // do nothing other than ensure we re-save the config (with the new version)
                        upgradeMsgs.push(`- ✔️  version updated`);
                        break;
                    default:
                        this._updateLeaf(properties, defaultProps, fieldName);
                        upgradeMsgs.push(`- ✔️  added '${fieldName}'`);
                }
            });
            updateConfigNeeded = true;
        }

        // ensure we document dataExtensions and automations on retrieve as they should now be in the retrieve folder
        this._updateLeaf(properties, defaultProps, 'metaDataTypes.documentOnRetrieve');
        upgradeMsgs.push(
            `- ✔️  updated 'metaDataTypes.documentOnRetrieve' to include all available types`
        );

        // check if metaDataTypes.retrieve is set to default values and if not, launch selectTypes
        const defaultRetrieveArr = Util.getRetrieveTypeChoices();
        let reselectDefaultRetrieve = false;
        const toBeRemovedTypes = properties.metaDataTypes.retrieve.filter(
            (type) => !defaultRetrieveArr.includes(type)
        );
        const toBeAddedTypes = defaultRetrieveArr.filter(
            (type) => !properties.metaDataTypes.retrieve.includes(type)
        );

        if (toBeRemovedTypes.length || toBeAddedTypes.length) {
            reselectDefaultRetrieve = true;
            updateConfigNeeded = true;
        }

        // move to version 4 uses integers for MIDs
        for (const cred in properties.credentials) {
            properties.credentials[cred].eid = parseInt(properties.credentials[cred].eid);
            for (const bu in properties.credentials[cred].businessUnits) {
                properties.credentials[cred].businessUnits[bu] = parseInt(
                    properties.credentials[cred].businessUnits[bu]
                );
            }
            updateConfigNeeded = true;
            upgradeMsgs.push(`- ✔️  updated Business Unit format (${cred})`);
        }

        // update config
        if (updateConfigNeeded) {
            for (const msg of upgradeMsgs) {
                Util.logger.info(msg);
            }
            if (reselectDefaultRetrieve) {
                // run selectTypes here as it _also_ runs File.saveConfigFile()
                Util.logger.warn(
                    'Your metaDataTypes.retrieve list is not set to standard values. Resetting config.'
                );
                Util.logger.warn('');
                if (toBeAddedTypes.length) {
                    Util.logger.warn('Adding types:');
                    toBeAddedTypes.forEach((type) => {
                        Util.logger.warn(` - ${type}`);
                    });
                    Util.logger.warn('');
                }
                if (toBeRemovedTypes.length) {
                    Util.logger.warn('Removing types:');
                    toBeRemovedTypes.forEach((type) => {
                        Util.logger.warn(` - ${type}`);
                    });
                    Util.logger.warn('');
                }
                await Cli.selectTypes(properties, defaultRetrieveArr);
            } else {
                // update config if anything else was changed but no re-selection of retrieve-types was triggered
                await File.saveConfigFile(properties);
            }
        } else {
            Util.logger.info(`✔️  No problems found in existing ${Util.configFileName}`);
        }

        return true;
    },

    /**
     * handles creation/update of all config file from the boilerplate
     *
     * @param {string} versionBeforeUpgrade 'x.y.z'
     * @returns {Promise.<boolean>} status of config file creation
     */
    async createIdeConfigFiles(versionBeforeUpgrade) {
        Util.logger.info('Checking configuration files (existing files will not be changed):');
        const creationLog = [];
        await File.ensureDir('deploy/');
        await File.ensureDir('src/cloudPages');
        const relevantForcedUpdates = await this._getForcedUpdateList(versionBeforeUpgrade);

        // copy in .gitignore (cant be retrieved via npm install directly)
        const gitignoreFileName = path.resolve(
            __dirname,
            Util.boilerplateDirectory,
            'gitignore-template'
        );
        if (!(await File.pathExists(gitignoreFileName))) {
            Util.logger.debug(`Dependency file not found in ${gitignoreFileName}`);
            return false;
        } else {
            const fileContent = await File.readFile(gitignoreFileName, 'utf8');
            creationLog.push(
                await this._createIdeConfigFile(
                    ['.' + path.sep, '', '.gitignore'],
                    relevantForcedUpdates,
                    fileContent
                )
            );
        }

        // load file list from boilerplate dir and initiate copy process
        const boilerPlateFilesPath = path.resolve(__dirname, Util.boilerplateDirectory, 'files');
        // ! do not switch to readDirectories before merging the two custom methods. Their logic is different!
        const directories = await File.readDirectoriesSync(boilerPlateFilesPath, 10, false);
        for (const subdir of directories) {
            // walk thru the root of our boilerplate-files  directory and all sub folders
            const curDir = path.join(boilerPlateFilesPath, subdir);
            for (const file of await File.readdir(curDir)) {
                // read all files in these directories
                if (!(await File.lstat(path.join(curDir, file))).isDirectory()) {
                    // filter entries that are actually folders
                    const fileArr = file.split('.');
                    const ext = '.' + fileArr.pop();
                    // awaiting the result here due to interactive optional overwrite
                    creationLog.push(
                        await this._createIdeConfigFile(
                            [subdir + path.sep, fileArr.join('.'), ext],
                            relevantForcedUpdates
                        )
                    );
                }
            }
        }

        if (creationLog.includes(false) && creationLog.includes(true)) {
            Util.logger.warn('✋  Configuration files creation partially failed.');
            return true;
        } else if (creationLog.includes(false)) {
            Util.logger.error('❌  Configuration files creation failed.');
            return false;
        } else {
            Util.logger.info('✔️  Configuration files done.');
            return true;
        }
    },
    /**
     * recursive helper for _fixMcdevConfig that adds missing settings
     *
     * @param {object} propertiersCur current sub-object of project settings
     * @param {object} defaultPropsCur current sub-object of default settings
     * @param {string} fieldName dot-concatenated object-path that needs adding
     * @returns {void}
     */
    _updateLeaf(propertiersCur, defaultPropsCur, fieldName) {
        if (fieldName.includes('.')) {
            const fieldNameArr = fieldName.split('.');
            const curKey = fieldNameArr[0];
            if (!propertiersCur[curKey]) {
                propertiersCur[curKey] = {};
            }
            fieldNameArr.splice(0, 1);
            this._updateLeaf(
                propertiersCur[curKey],
                defaultPropsCur[curKey],
                fieldNameArr.join('.')
            );
        } else {
            propertiersCur[fieldName] = defaultPropsCur[fieldName];
        }
    },
    /**
     * returns list of files that need to be updated
     *
     * @param {string} projectVersion version found in config file of the current project
     * @returns {Promise.<string[]>} relevant files with path that need to be updated
     */
    async _getForcedUpdateList(projectVersion) {
        // list of files that absolutely need to get overwritten, no questions asked, when upgrading from a version lower than the given.
        let forceIdeConfigUpdate;
        const relevantForcedUpdates = [];
        if (await File.pathExists(Util.configFileName)) {
            forceIdeConfigUpdate = File.readJsonSync(
                path.resolve(__dirname, Util.boilerplateDirectory, 'forcedUpdates.json')
            );
            // return all if no project version was found or only changes from "newer" versions otherwise
            for (const element of forceIdeConfigUpdate) {
                if (!projectVersion || semver.gt(element.version, projectVersion)) {
                    relevantForcedUpdates.push(
                        // adapt it for local file systems
                        ...element.files.map((item) => path.normalize(item))
                    );
                } else {
                    continue;
                }
            }
        }

        return relevantForcedUpdates;
    },
    /**
     * handles creation/update of one config file from the boilerplate at a time
     *
     * @param {string[]} fileNameArr 0: path, 1: filename, 2: extension with dot
     * @param {string[]} relevantForcedUpdates if fileNameArr is in this list we require an override
     * @param {string} [boilerplateFileContent] in case we cannot copy files 1:1 this can be used to pass in content
     * @returns {Promise.<boolean>} install successful or error occured
     */
    async _createIdeConfigFile(fileNameArr, relevantForcedUpdates, boilerplateFileContent) {
        let update = false;
        const fileName = fileNameArr.join('');
        const boilerplateFileName = path.resolve(
            __dirname,
            Util.boilerplateDirectory,
            'files',
            fileName
        );
        boilerplateFileContent =
            boilerplateFileContent || (await File.readFile(boilerplateFileName, 'utf8'));

        if (await File.pathExists(fileName)) {
            const existingFileContent = await File.readFile(fileName, 'utf8');
            if (existingFileContent === boilerplateFileContent) {
                Util.logger.info(`- ✔️  ${fileName} found. No update needed`);
                return true;
            }
            if (relevantForcedUpdates.includes(path.normalize(fileName))) {
                Util.logger.info(
                    `- ✋  ${fileName} found but an update is required. Commencing with override:`
                );
            } else {
                Util.logger.info(
                    `- ✋  ${fileName} found with differences to the new standard version. We recommend updating it.`
                );
                if (!Util.skipInteraction) {
                    const responses = await inquirer.prompt([
                        {
                            type: 'confirm',
                            name: 'overrideFile',
                            message: 'Would you like to update (override) it?',
                            default: true,
                        },
                    ]);
                    if (!responses.overrideFile) {
                        // skip override without error
                        return true;
                    }
                }
            }
            update = true;

            // ensure our update is not leading to data loss in case config files were not versioned correctly by the user
            await File.rename(fileName, fileName + '.BAK');
        }
        const saveStatus = await File.writeToFile(
            fileNameArr[0],
            fileNameArr[1],
            fileNameArr[2].substr(1),
            boilerplateFileContent
        );

        if (saveStatus) {
            Util.logger.info(
                `- ✔️  ${fileName} ${
                    update
                        ? `updated (we created a backup of the old file under ${fileName + '.BAK'})`
                        : 'created'
                }`
            );
            return true;
        } else {
            Util.logger.warn(`- ❌  ${fileName} ${update ? 'update' : 'creation'} failed`);
            return false;
        }
    },
    /**
     * helper method for this.upgradeProject that upgrades project config if needed
     *
     * @returns {Promise.<boolean>} returns true if worked without errors
     */
    async upgradeAuthFile() {
        if (await File.pathExists(Util.authFileName)) {
            const existingAuth = await File.readJSON(Util.authFileName);
            // if has credentials key then is old format
            if (existingAuth.credentials) {
                const newAuth = {};
                for (const cred in existingAuth.credentials) {
                    newAuth[cred] = {
                        client_id: existingAuth.credentials[cred].clientId,
                        client_secret: existingAuth.credentials[cred].clientSecret,
                        auth_url: `https://${existingAuth.credentials[cred].tenant}.auth.marketingcloudapis.com/`,
                        account_id: parseInt(existingAuth.credentials[cred].eid),
                    };
                }
                await File.writeJSONToFile(
                    './',
                    Util.authFileName.replace(/(.json)+$/, ''),
                    newAuth
                );
                Util.logger.info(`- ✔️  upgraded credential file`);
            }
        }
        return true;
    },
};

module.exports = Init;
