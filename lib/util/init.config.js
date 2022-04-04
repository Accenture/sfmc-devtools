'use strict';

const Cli = require('./cli');
const File = require('./file');
const Util = require('./util');
const inquirer = require('inquirer');
const path = require('path');

/**
 * CLI helper class
 */

const Init = {
    /**
     * helper method for this.upgradeProject that upgrades project config if needed
     * @param {Object} properties config file's json
     * @returns {Promise<Boolean>} returns true if worked without errors
     */
    async fixMcdevConfig(properties) {
        if (!properties) {
            // skip if no config exists yet
            return true;
        }

        let updateConfigNeeded = false;

        const upgradeMsgs = [`Upgrading existing ${Util.configFileName}:`];

        const missingFields = await Util.checkProperties(properties, true);
        if (missingFields.length) {
            const defaultProps = Util.getDefaultProperties();
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
                    case 'directories.dataExtension':
                        if (properties.directories.dataextension) {
                            upgradeMsgs.push(
                                `- ✔️  converted 'directories.dataextension' to '${fieldName}'`
                            );
                            properties.directories.dataExtension =
                                properties.directories.dataextension;
                            delete properties.directories.dataextension;
                        } else {
                            upgradeMsgs.push(`- ✔️  added '${fieldName}'`);
                            this._updateLeaf(properties, defaultProps, fieldName);
                        }
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
     * @returns {Promise<Boolean>} status of config file creation
     */
    async createIdeConfigFiles() {
        Util.logger.info('Checking configuration files (existing files will not be changed):');
        const creationLog = [];

        if (!File.existsSync('deploy/')) {
            File.mkdirpSync('deploy/');
        }

        if (!File.existsSync('src/cloudPages')) {
            File.mkdirpSync('src/cloudPages');
        }

        // copy in .gitignore (cant be retrieved via npm install directly)
        const gitignoreFileName = path.resolve(
            __dirname,
            Util.boilerplateDirectory,
            'gitignore-template'
        );
        if (!File.existsSync(gitignoreFileName)) {
            Util.logger.debug(`Dependency file not found in ${gitignoreFileName}`);
            return false;
        } else {
            const fileContent = File.readFileSync(gitignoreFileName, 'utf8');
            creationLog.push(
                await this._createIdeConfigFile(['.' + path.sep, '', '.gitignore'], fileContent)
            );
        }

        // load file list from boilerplate dir and initiate copy process
        const boilerPlateFilesPath = path.resolve(__dirname, Util.boilerplateDirectory, 'files');
        const directories = File.readDirectoriesSync(boilerPlateFilesPath, 10, false);

        for (const subdir of directories) {
            // walk thru the root of our boilerplate-files  directory and all sub folders
            const curDir = path.join(boilerPlateFilesPath, subdir);
            for (const file of File.readdirSync(curDir)) {
                // read all files in these directories
                if (!File.lstatSync(path.join(curDir, file)).isDirectory()) {
                    // filter entries that are actually folders
                    const fileArr = file.split('.');
                    const ext = '.' + fileArr.pop();
                    // awaiting the result here due to interactive optional overwrite
                    creationLog.push(
                        await this._createIdeConfigFile([subdir + path.sep, fileArr.join('.'), ext])
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
     * @param {Object} propertiersCur current sub-object of project settings
     * @param {Object} defaultPropsCur current sub-object of default settings
     * @param {String} fieldName dot-concatenated object-path that needs adding
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
     * handles creation/update of one config file from the boilerplate at a time
     * @param {String[]} fileNameArr 0: path, 1: filename, 2: extension with dot
     * @param {String} [fileContent] in case we cannot copy files 1:1 this can be used to pass in content
     * @returns {Promise<Boolean>} install successful or error occured
     */
    async _createIdeConfigFile(fileNameArr, fileContent) {
        const fileName = fileNameArr.join('');
        const boilerplateFileName = path.resolve(
            __dirname,
            Util.boilerplateDirectory,
            'files',
            fileName
        );
        if (File.existsSync(fileName)) {
            Util.logger.info(`- ✋  ${fileName} already existing`);
            const responses = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'overrideFile',
                    message: 'Would you like to override it?',
                    default: false,
                },
            ]);
            if (!responses.overrideFile) {
                return true;
            }
        }
        fileContent = fileContent || File.readFileSync(boilerplateFileName, 'utf8');
        const saveStatus = await File.writeToFile(
            fileNameArr[0],
            fileNameArr[1],
            fileNameArr[2].substr(1),
            fileContent
        );

        if (saveStatus) {
            Util.logger.info(`- ✔️  ${fileName} created`);
            return true;
        } else {
            Util.logger.warn(`- ❌  ${fileName} creation failed`);
            return false;
        }
    },
};

module.exports = Init;
