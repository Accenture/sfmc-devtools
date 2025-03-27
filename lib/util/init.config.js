'use strict';

import File from './file.js';
import config from './config.js';
import { Util } from './util.js';
import { confirm } from '@inquirer/prompts';
import path from 'node:path';
import semver from 'semver';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @typedef {import('../../types/mcdev.d.js').AuthObject} AuthObject
 * @typedef {import('../../types/mcdev.d.js').BuObject} BuObject
 * @typedef {import('../../types/mcdev.d.js').Cache} Cache
 * @typedef {import('../../types/mcdev.d.js').CodeExtract} CodeExtract
 * @typedef {import('../../types/mcdev.d.js').CodeExtractItem} CodeExtractItem
 * @typedef {import('../../types/mcdev.d.js').DeltaPkgItem} DeltaPkgItem
 * @typedef {import('../../types/mcdev.d.js').Mcdevrc} Mcdevrc
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItem} MetadataTypeItem
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItemDiff} MetadataTypeItemDiff
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItemObj} MetadataTypeItemObj
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMap} MetadataTypeMap
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMapObj} MetadataTypeMapObj
 * @typedef {import('../../types/mcdev.d.js').MultiMetadataTypeList} MultiMetadataTypeList
 * @typedef {import('../../types/mcdev.d.js').MultiMetadataTypeMap} MultiMetadataTypeMap
 * @typedef {import('../../types/mcdev.d.js').SoapRequestParams} SoapRequestParams
 * @typedef {import('../../types/mcdev.d.js').TemplateMap} TemplateMap
 * @typedef {import('../../types/mcdev.d.js').TypeKeyCombo} TypeKeyCombo
 */

/**
 * CLI helper class
 */

const Init = {
    /**
     * helper method for this.upgradeProject that upgrades project config if needed
     *
     * @param {Mcdevrc} properties config file's json
     * @returns {Promise.<boolean>} returns true if worked without errors
     */
    async fixMcdevConfig(properties) {
        if (!properties) {
            // skip if no config exists yet
            return true;
        }

        let updateConfigNeeded = false;

        const upgradeMsgs = [`Upgrading existing ${Util.configFileName}:`];

        const missingFields = await config.checkProperties(properties, true);
        const defaultProps = await config.getDefaultProperties();
        if (Array.isArray(missingFields) && missingFields.length) {
            for (const fieldName of missingFields) {
                switch (fieldName) {
                    case 'marketList': {
                        // @ts-expect-error - deprecated field
                        if (properties.marketBulk) {
                            upgradeMsgs.push(`- ✔️  converted 'marketBulk' to '${fieldName}'`);
                            // @ts-expect-error - deprecated field
                            properties[fieldName] = properties.marketBulk;
                            // @ts-expect-error - deprecated field
                            delete properties.marketBulk;
                        } else {
                            upgradeMsgs.push(`- ✔️  added '${fieldName}'`);
                            this._updateLeaf(properties, defaultProps, fieldName);
                        }
                        break;
                    }
                    case 'directories.docs': {
                        // @ts-expect-error - deprecated field
                        if (properties.directories.badKeys) {
                            // @ts-expect-error - deprecated field
                            delete properties.directories.badKeys;
                            upgradeMsgs.push(`- ✋ removed 'directories.badKeys'`);
                        }
                        // @ts-expect-error - deprecated field
                        if (properties.directories.dataExtension) {
                            // @ts-expect-error - deprecated field
                            File.removeSync(properties.directories.dataExtension);
                            // @ts-expect-error - deprecated field
                            delete properties.directories.dataExtension;
                            upgradeMsgs.push(`- ✋ removed 'directories.dataExtension'`);
                        }
                        // @ts-expect-error - deprecated field
                        if (properties.directories.deltaPackage) {
                            // @ts-expect-error - deprecated field
                            delete properties.directories.deltaPackage;
                            upgradeMsgs.push(`- ✋ removed 'directories.deltaPackage'`);
                        }
                        // @ts-expect-error - deprecated field
                        if (properties.directories.roles) {
                            // @ts-expect-error - deprecated field
                            delete properties.directories.roles;
                            upgradeMsgs.push(`- ✋ removed 'directories.roles'`);
                        }
                        // @ts-expect-error - deprecated field
                        if (properties.directories.users) {
                            // @ts-expect-error - deprecated field
                            delete properties.directories.users;
                            upgradeMsgs.push(`- ✋ removed 'directories.users'`);
                        }

                        this._updateLeaf(properties, defaultProps, fieldName);
                        upgradeMsgs.push(`- ✔️  added '${fieldName}'`);
                        break;
                    }
                    case 'metaDataTypes.documentOnRetrieve': {
                        if (properties.options.documentOnRetrieve) {
                            this._updateLeaf(properties, defaultProps, fieldName);
                        } else {
                            properties.metaDataTypes.documentOnRetrieve = [];
                        }
                        delete properties.options.documentOnRetrieve;
                        upgradeMsgs.push(
                            `- ✔️  converted 'options.documentOnRetrieve' to '${fieldName}'`
                        );
                        break;
                    }
                    case 'options.deployment.commitHistory': {
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
                    }
                    case 'options.exclude': {
                        if (properties.options.filter) {
                            upgradeMsgs.push(`- ✔️  converted 'options.filter' to '${fieldName}'`);
                            properties.options.exclude = properties.options.filter;
                            delete properties.options.filter;
                        } else {
                            upgradeMsgs.push(`- ✔️  added '${fieldName}'`);
                            this._updateLeaf(properties, defaultProps, fieldName);
                        }
                        break;
                    }
                    case 'version': {
                        // do nothing other than ensure we re-save the config (with the new version)
                        upgradeMsgs.push(`- ✔️  version updated`);
                        break;
                    }
                    default: {
                        this._updateLeaf(properties, defaultProps, fieldName);
                        upgradeMsgs.push(`- ✔️  added '${fieldName}'`);
                    }
                }
            }
            updateConfigNeeded = true;
        }

        // ensure we document dataExtensions and automations on retrieve as they should now be in the retrieve folder
        if (this._updateLeaf(properties, defaultProps, 'metaDataTypes.documentOnRetrieve')) {
            upgradeMsgs.push(
                `- ✔️  updated 'metaDataTypes.documentOnRetrieve' to include all available types`
            );
            updateConfigNeeded = true;
        }

        // check if metaDataTypes.retrieve is set to default values and if not, launch selectTypes
        const defaultRetrieveArr = Util.getTypeChoices('typeRetrieveByDefault');
        let reselectDefaultRetrieve = false;
        const toBeRemovedRetrieve = properties.metaDataTypes.retrieve.filter(
            (type) => !defaultRetrieveArr.includes(type)
        );
        const toBeAddedRetrieve = defaultRetrieveArr.filter(
            (type) => !properties.metaDataTypes.retrieve.includes(type)
        );

        if (toBeRemovedRetrieve.length || toBeAddedRetrieve.length) {
            reselectDefaultRetrieve = true;
            updateConfigNeeded = true;
        }

        // check if metaDataTypes.retrieve is set to default values and if not, launch selectTypes
        const defaultCdpArr = Util.getTypeChoices('typeCdpByDefault');
        let reselectDefaultCdp = false;
        const toBeRemovedCdp = properties.metaDataTypes.createDeltaPkg.filter(
            (type) => !defaultCdpArr.includes(type)
        );
        const toBeAddedCdp = defaultCdpArr.filter(
            (type) => !properties.metaDataTypes.createDeltaPkg.includes(type)
        );

        if (toBeRemovedCdp.length || toBeAddedCdp.length) {
            reselectDefaultCdp = true;
            updateConfigNeeded = true;
        }

        // move to version 4 uses integers for MIDs
        for (const cred in properties.credentials) {
            let credentialMidsUpdated = false;
            if (typeof properties.credentials[cred].eid === 'string') {
                properties.credentials[cred].eid = Number.parseInt(
                    properties.credentials[cred].eid
                );
                credentialMidsUpdated = true;
            }
            for (const bu in properties.credentials[cred].businessUnits) {
                if (typeof properties.credentials[cred].businessUnits[bu] === 'string') {
                    properties.credentials[cred].businessUnits[bu] = Number.parseInt(
                        properties.credentials[cred].businessUnits[bu]
                    );
                    credentialMidsUpdated = true;
                }
            }
            if (credentialMidsUpdated) {
                updateConfigNeeded = true;
                upgradeMsgs.push(`- ✔️  updated Business Unit format (${cred})`);
            }
        }

        // update config
        if (updateConfigNeeded) {
            for (const msg of upgradeMsgs) {
                Util.logger.info(msg);
            }
            if (reselectDefaultCdp) {
                // run selectTypes here as it _also_ runs File.saveConfigFile()
                Util.logger.warn(
                    'Your metaDataTypes.createDeltaPkg list is not set to standard values. Resetting config.'
                );
                Util.logger.warn('');
                if (toBeAddedCdp.length) {
                    Util.logger.warn('Adding types:');
                    for (const type of toBeAddedCdp) {
                        Util.logger.warn(` - ${type}`);
                    }
                    Util.logger.warn('');
                }
                if (toBeRemovedCdp.length) {
                    Util.logger.warn('Removing types:');
                    for (const type of toBeRemovedCdp) {
                        Util.logger.warn(` - ${type}`);
                    }
                    Util.logger.warn('');
                }
                properties.metaDataTypes.createDeltaPkg = Util.summarizeSubtypes(
                    'typeCdpByDefault',
                    defaultCdpArr
                );
            }
            if (reselectDefaultRetrieve) {
                // run selectTypes here as it _also_ runs File.saveConfigFile()
                Util.logger.warn(
                    'Your metaDataTypes.retrieve list is not set to standard values. Resetting config.'
                );
                Util.logger.warn('');
                if (toBeAddedRetrieve.length) {
                    Util.logger.warn('Adding types:');
                    for (const type of toBeAddedRetrieve) {
                        Util.logger.warn(` - ${type}`);
                    }
                    Util.logger.warn('');
                }
                if (toBeRemovedRetrieve.length) {
                    Util.logger.warn('Removing types:');
                    for (const type of toBeRemovedRetrieve) {
                        Util.logger.warn(` - ${type}`);
                    }
                    Util.logger.warn('');
                }
                properties.metaDataTypes.retrieve = Util.summarizeSubtypes(
                    'typeRetrieveByDefault',
                    defaultRetrieveArr
                );
            }
            // update config
            await File.saveConfigFile(properties);
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
        const relevantForced = await this._getForcedUpdateList(versionBeforeUpgrade);

        await this._removeIdeConfigFiles(relevantForced);

        // copy in .gitignore (cant be retrieved via npm install directly)
        const gitignoreFileName = path.resolve(
            __dirname,
            Util.boilerplateDirectory,
            'gitignore-template'
        );
        if (await File.pathExists(gitignoreFileName)) {
            const fileContent = await File.readFile(gitignoreFileName, 'utf8');
            creationLog.push(
                await this._createIdeConfigFile(
                    ['.' + path.sep, '', '.gitignore'],
                    relevantForced,
                    fileContent
                )
            );
        } else {
            Util.logger.debug(`Dependency file not found in ${gitignoreFileName}`);
            return false;
        }

        // load file list from boilerplate dir and initiate copy process
        const boilerPlateFilesPath = path.resolve(__dirname, Util.boilerplateDirectory, 'files');
        // ! do not switch to readDirectories before merging the two custom methods. Their logic is different!
        const directories = await File.readDirectoriesSync(boilerPlateFilesPath, 10, false);
        if (directories) {
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
                                relevantForced
                            )
                        );
                    }
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
     * recursive helper for {@link Init.fixMcdevConfig} that adds missing settings
     *
     * @param {object} propertiersCur current sub-object of project settings
     * @param {object} defaultPropsCur current sub-object of default settings
     * @param {string} fieldName dot-concatenated object-path that needs adding
     * @returns {boolean} was something updated or not
     */
    _updateLeaf(propertiersCur, defaultPropsCur, fieldName) {
        if (fieldName.includes('.')) {
            const fieldNameArr = fieldName.split('.');
            const curKey = fieldNameArr[0];
            let updated = false;
            if (!propertiersCur[curKey]) {
                updated = true;
                propertiersCur[curKey] = {};
            }
            fieldNameArr.splice(0, 1);
            return (
                this._updateLeaf(
                    propertiersCur[curKey],
                    defaultPropsCur[curKey],
                    fieldNameArr.join('.')
                ) || updated
            );
        } else if (Util.isEqual(propertiersCur[fieldName], defaultPropsCur[fieldName])) {
            return false;
        } else {
            propertiersCur[fieldName] = defaultPropsCur[fieldName];
            return true;
        }
    },

    /**
     * returns list of files that need to be updated
     *
     * @param {string} projectVersion version found in config file of the current project
     * @returns {Promise.<{updates:string[],deletes:string[]}>} relevant files with path that need to be updated
     */
    async _getForcedUpdateList(projectVersion) {
        // list of files that absolutely need to get overwritten, no questions asked, when upgrading from a version lower than the given.
        let forceIdeConfigUpdate;
        const updates = [];
        const deletes = [];
        if (await File.pathExists(Util.configFileName)) {
            forceIdeConfigUpdate = await File.readJSON(
                path.resolve(__dirname, Util.boilerplateDirectory, 'forcedUpdates.json')
            );
            // return all if no project version was found or only changes from "newer" versions otherwise
            for (const element of forceIdeConfigUpdate) {
                if (!projectVersion || semver.gt(element.version, projectVersion)) {
                    updates.push(
                        // adapt it for local file systems
                        ...element.files.map((item) => path.normalize(item))
                    );
                    if (element.filesRemove) {
                        deletes.push(
                            // adapt it for local file systems
                            ...element.filesRemove.map((item) => path.normalize(item))
                        );
                    }
                } else {
                    continue;
                }
            }
        }

        return { updates, deletes };
    },

    /**
     * handles creation/update of one config file from the boilerplate at a time
     *
     * @param {string[]} fileNameArr 0: path, 1: filename, 2: extension with dot
     * @param {{updates:string[],deletes:string[]}} relevantForced if fileNameArr is in this list we require an override
     * @param {string} [boilerplateFileContent] in case we cannot copy files 1:1 this can be used to pass in content
     * @returns {Promise.<boolean>} install successful or error occured
     */
    async _createIdeConfigFile(fileNameArr, relevantForced, boilerplateFileContent) {
        const fileName = fileNameArr.join('');
        const boilerplateFileName = path.resolve(
            __dirname,
            Util.boilerplateDirectory,
            'files',
            fileName
        );
        boilerplateFileContent ||= await File.readFile(boilerplateFileName, 'utf8');

        let todo = null;

        if (await File.pathExists(fileName)) {
            if (relevantForced.deletes.includes(path.normalize(fileName))) {
                Util.logger.info(
                    `- ✋  ${fileName} found but it is required to delete it. Commencing rename instead for your convenience:`
                );
                todo = 'delete';
            } else {
                const existingFileContent = await File.readFile(fileName, 'utf8');
                if (existingFileContent === boilerplateFileContent) {
                    Util.logger.info(`- ✔️  ${fileName} found. No update needed`);
                    return true;
                }
            }

            if (relevantForced.updates.includes(path.normalize(fileName))) {
                Util.logger.info(
                    `- ✋  ${fileName} found but an update is required. Commencing with override:`
                );
                todo = 'update';
            } else {
                Util.logger.info(
                    `- ✋  ${fileName} found with differences to the new standard version. We recommend updating it.`
                );
                if (Util.skipInteraction) {
                    todo = 'update';
                } else {
                    const overrideFile = await confirm({
                        message: 'Would you like to update (override) it?',
                        default: true,
                    });
                    if (overrideFile) {
                        todo = 'update';
                    } else {
                        // skip override without error
                        return true;
                    }
                }
            }

            // ensure our update is not leading to data loss in case config files were not versioned correctly by the user
            await File.rename(fileName, fileName + '.BAK');
        } else if (!relevantForced.deletes.includes(path.normalize(fileName))) {
            todo = 'create';
        }
        if (todo === 'create' || todo === 'update') {
            const saveStatus = await File.writeToFile(
                fileNameArr[0],
                fileNameArr[1],
                fileNameArr[2].slice(1),
                boilerplateFileContent
            );

            if (saveStatus) {
                Util.logger.info(
                    `- ✔️  ${fileName} ${
                        todo === 'update'
                            ? `updated (we created a backup of the old file under ${fileName + '.BAK'})`
                            : 'created'
                    }`
                );
                return true;
            } else {
                Util.logger.warn(
                    `- ❌  ${fileName} ${todo === 'update' ? 'update' : 'creation'} failed`
                );
                return false;
            }
        } else if (todo === 'delete') {
            await File.rename(fileName, fileName + '.BAK');
            Util.logger.info(`- ✔️  ${fileName} removed (renamed to ${fileName + '.BAK'})`);
            return true;
        }
    },

    /**
     * handles deletion of no longer needed config files
     *
     * @param {{updates:string[],deletes:string[]}} relevantForced if file is in .deletes, we require deleting/renaming it
     * @returns {Promise.<boolean>} deletion successful or error occured
     */
    async _removeIdeConfigFiles(relevantForced) {
        for (const fileName of relevantForced.deletes) {
            if (await File.pathExists(fileName)) {
                Util.logger.info(
                    `- ✋  ${fileName} found but it is required to delete it. Commencing rename instead for your convenience:`
                );

                await File.rename(fileName, fileName + '.BAK');
                Util.logger.info(`- ✔️  ${fileName} removed (renamed to ${fileName + '.BAK'})`);
            }
        }
        return true;
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
                        account_id: Number.parseInt(existingAuth.credentials[cred].eid),
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

export default Init;
