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
     * @param {string} [versionToPersist] version to store while saving config migrations
     * @returns {Promise.<boolean>} returns true if worked without errors
     */
    async fixMcdevConfig(properties, versionToPersist) {
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
                if (typeof properties.credentials[cred].businessUnits[bu] !== 'string') {
                    continue;
                }

                properties.credentials[cred].businessUnits[bu] = Number.parseInt(
                    properties.credentials[cred].businessUnits[bu]
                );
                credentialMidsUpdated = true;
            }
            if (!credentialMidsUpdated) {
                continue;
            }

            updateConfigNeeded = true;
            upgradeMsgs.push(`- ✔️  updated Business Unit format (${cred})`);
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
            // update config while retaining the prior version until all upgrade phases succeed
            if (!(await File.saveConfigFile(properties, versionToPersist))) {
                return false;
            }
        } else {
            Util.logger.info(`✔️  No problems found in existing ${Util.configFileName}`);
        }

        return true;
    },

    /**
     * handles creation/update of all config files from the boilerplate, one at a time
     *
     * @param {string} versionBeforeUpgrade 'x.y.z'
     * @returns {Promise.<boolean>} status of config file creation
     */
    async createIdeConfigFiles(versionBeforeUpgrade) {
        Util.logger.info('Checking configuration files:');
        await File.ensureDir('deploy/');
        await File.ensureDir('src/cloudPages');
        const forced = await this._getForcedUpdateList(versionBeforeUpgrade);
        const creationLog = [await this._removeIdeConfigFiles(forced)];
        const root = path.resolve(__dirname, Util.boilerplateDirectory);
        creationLog.push(
            await this._createIdeConfigFile(
                '.gitignore',
                forced,
                await File.readFile(path.join(root, 'gitignore-template'), 'utf8')
            )
        );
        const filesRoot = path.join(root, 'files');
        const directories = File.readDirectoriesSync(filesRoot, 10, false);
        if (!directories) {
            throw new Error('Could not inspect tooling templates.');
        }
        for (const directory of directories) {
            for (const name of await File.readdir(path.join(filesRoot, directory))) {
                const source = path.join(filesRoot, directory, name);
                if (!(await File.lstat(source)).isDirectory()) {
                    creationLog.push(
                        await this._createIdeConfigFile(
                            path.normalize(path.join(directory, name)),
                            forced,
                            await File.readFile(source, 'utf8')
                        )
                    );
                }
            }
        }
        if (creationLog.includes(false) && creationLog.includes(true)) {
            Util.logger.warn('✋  Configuration files creation partially failed.');
            return false;
        } else if (creationLog.includes(false)) {
            Util.logger.error('❌  Configuration files creation failed.');
            return false;
        } else {
            Util.logger.info('✔️  Configuration files done.');
            return true;
        }
    },

    /**
     * Prompt for an ordinary configuration override.
     *
     * @param {string} message selection to present
     * @param {boolean} [defaultValue] initial selection
     * @returns {Promise.<boolean>} user's selection
     */
    async promptConfirmation(message, defaultValue = true) {
        return confirm({ message, default: defaultValue });
    },

    /**
     * Compare, optionally back up, and write one configuration file.
     *
     * @param {string} fileName destination path
     * @param {{updates:string[],deletes:string[]}} forced version-gated replacements and retirements
     * @param {string} content boilerplate contents
     * @returns {Promise.<boolean>} success, including a declined override
     */
    async _createIdeConfigFile(fileName, forced, content) {
        if (forced.deletes.includes(fileName)) {
            return true;
        }
        const exists = await this._hasDirectoryEntry(fileName);
        if (exists) {
            if (!(await File.stat(fileName)).isFile()) {
                throw new Error(`Configuration destination is not a regular file: ${fileName}`);
            }
            if ((await File.readFile(fileName, 'utf8')) === content) {
                Util.logger.info(`- ✔️  ${fileName} found. No update needed`);
                return true;
            }
            if (forced.updates.includes(fileName)) {
                Util.logger.info(
                    `- ✋  ${fileName} found but an update is required. Commencing with override:`
                );
            } else {
                Util.logger.info(
                    `- ✋  ${fileName} found with differences to the new standard version. We recommend updating it.`
                );
                if (
                    !Util.skipInteraction &&
                    !(await this.promptConfirmation(`Update ${fileName}?`, true))
                ) {
                    return true;
                }
            }
            await File.rename(fileName, fileName + '.BAK');
        }
        const basename = path.basename(fileName);
        const dot = basename.lastIndexOf('.');
        const success = await File.writeToFile(
            path.dirname(fileName),
            basename.slice(0, dot),
            basename.slice(dot + 1),
            content
        );
        if (success) {
            Util.logger.info(
                `- ✔️  ${fileName} ${exists ? `updated (we created a backup of the old file under ${fileName}.BAK)` : 'created'}`
            );
        } else {
            Util.logger.warn(`- ❌  ${fileName} ${exists ? 'update' : 'creation'} failed`);
        }
        return success;
    },

    /**
     * Check entry occupancy without following links or hiding access errors.
     *
     * @param {string} fileName destination or backup path
     * @returns {Promise.<boolean>} whether the directory entry exists
     */
    async _hasDirectoryEntry(fileName) {
        try {
            await File.lstat(fileName);
            return true;
        } catch (ex) {
            if (ex.code === 'ENOENT') {
                return false;
            }
            throw ex;
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
            fieldNameArr.shift();
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
        // Normalize only the comparison; orchestration retains the original persisted version.
        const comparisonVersion = semver.valid(projectVersion) || '0.0.0';
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
                if (semver.gt(element.version, comparisonVersion)) {
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
                }
            }
        }

        return { updates, deletes };
    },

    /**
     * handles deletion of no longer needed config files
     *
     * @param {{updates:string[],deletes:string[]}} relevantForced if file is in .deletes, we require deleting/renaming it
     * @returns {Promise.<boolean>} deletion successful or error occured
     */
    async _removeIdeConfigFiles(relevantForced) {
        for (const fileName of relevantForced.deletes) {
            if (!(await this._hasDirectoryEntry(fileName))) {
                continue;
            }

            Util.logger.info(
                `- ✋  ${fileName} found but it is required to delete it. Commencing rename instead for your convenience:`
            );

            await File.rename(fileName, fileName + '.BAK');
            Util.logger.info(`- ✔️  ${fileName} removed (renamed to ${fileName + '.BAK'})`);
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
