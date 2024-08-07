'use strict';
import Cli from './cli.js';
import File from './file.js';
import config from './config.js';
import InitGit from './init.git.js';
import InitNpm from './init.npm.js';
import InitConfig from './init.config.js';
import { confirm, input, select } from '@inquirer/prompts';
import { Util } from './util.js';
import fs from 'node:fs';
import path from 'node:path';

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
     * Creates template file for properties.json
     *
     * @param {Mcdevrc} properties config file's json
     * @param {string} [credentialName] identifying name of the installed package / project; if set, will update this credential
     * @param {boolean} [refreshBUs] if this was triggered by mcdev join, do not refresh BUs
     * @returns {Promise.<void>} -
     */
    async initProject(properties, credentialName, refreshBUs = true) {
        if (!(await Init._checkPathForCloud())) {
            return;
        }

        const skipInteraction = Util.skipInteraction;
        if (!properties) {
            // try to get cached properties because we return null in case of a crucial error
            properties = config.properties;
        }
        const missingCredentials = this._getMissingCredentials(properties);
        if ((await File.pathExists(Util.configFileName)) && properties) {
            // config exists
            if (credentialName) {
                // update-credential mode
                if (!properties.credentials[credentialName]) {
                    Util.logger.error(
                        `Could not update credential '${credentialName}' because it was not found in your config. Please check your spelling and try again.`
                    );
                    Cli.logExistingCredentials(properties);
                    if (skipInteraction) {
                        return;
                    }
                    const response = await Cli._selectBU(properties, null, true);
                    credentialName = response.credential;
                }
                Util.logger.info(`Updating existing credential '${credentialName}'`);
                let error;
                do {
                    error = false;
                    try {
                        const success = await Cli.updateCredential(properties, credentialName);
                        if (success) {
                            Util.logger.info(`✔️  Credential '${credentialName}' updated.`);
                        } else {
                            error = true;
                        }
                    } catch (ex) {
                        if (skipInteraction) {
                            Util.logger.error(ex.message);
                            return;
                        } else {
                            // retry
                            error = true;
                        }
                    }
                } while (error && !skipInteraction);
                Util.logger.debug('reloading config');
                properties = await config.getProperties(true);
            } else if (missingCredentials.length) {
                // forced update-credential mode - user likely cloned repo and is missing mcdev-auth.json
                Util.logger.warn(
                    `We found ${missingCredentials.length} credential${
                        missingCredentials.length > 1 ? 's' : ''
                    } in your ${Util.configFileName} that ${
                        missingCredentials.length > 1 ? 'are' : 'is'
                    } missing details.`
                );
                for (const badCredName of missingCredentials) {
                    let error;
                    do {
                        error = false;
                        try {
                            const success = await Cli.updateCredential(
                                properties,
                                badCredName,
                                refreshBUs
                            );
                            if (success) {
                                Util.logger.info(`✔️  Credential '${badCredName}' updated.`);
                            } else {
                                error = true;
                            }
                        } catch {
                            error = true;
                        }
                    } while (error);
                    Util.logger.debug('reloading config');
                    properties = await config.getProperties(true);
                }
                Util.logger.info('✔️  All credentials updated.');
                // assume node dependencies are not installed
                Util.execSync('npm', ['install']);
                Util.logger.info('✔️  Dependencies installed.');
                Util.logger.info('You can now start using Accenture SFMC DevTools.');
            } else if (!missingCredentials.length) {
                // add-credential mode
                Util.logger.warn(Util.configFileName + ' found in root');

                let isAddCredential;
                if (skipInteraction) {
                    if (
                        skipInteraction.client_id &&
                        skipInteraction.client_secret &&
                        skipInteraction.auth_url &&
                        skipInteraction.account_id &&
                        skipInteraction.credentialName
                    ) {
                        // assume automated input; only option here is to add a new credential
                        // requires skipInteraction=={client_id,client_secret,auth_url,account_id,credentialName}
                        // will be checked inside of Cli.addExtraCredential()
                        Util.logger.info('Adding another credential');
                    } else {
                        throw new Error(
                            '--skipInteraction flag found but missing required input for client_id,client_secret,auth_url,account_id,credentialName'
                        );
                    }
                } else {
                    isAddCredential = await confirm({
                        message: 'Do you want to add another credential instead?',
                        default: false,
                    });
                }
                let credentialName;
                if (skipInteraction || isAddCredential) {
                    credentialName = await Cli.addExtraCredential(properties);
                }
                if (credentialName) {
                    await this._downloadAllBUs(`${credentialName}/*`, 'update');
                }
            }
        } else {
            // config does not exist
            // assuming it's the first time this command is run for this project

            // initialize git repo
            const initGit = await InitGit.initGitRepo();
            if (initGit.status === 'error') {
                return;
            }

            // set up IDE files and load npm dependencies

            if (!(await this.upgradeProject(properties, true, initGit.repoName))) {
                return;
            }

            // ask for credentials and create mcdev config
            if (!(await Cli.initMcdevConfig())) {
                return;
            }

            // set up markets and market lists initially
            await Init._initMarkets();

            // create first commit to backup the project configuration
            if (initGit.status === 'init') {
                Util.logger.info(`Committing initial setup to Git:`);
                Util.execSync('git', ['add', '.']);
                Util.execSync('git', ['commit', '-n', '-m', '"Initial commit"', '--quiet']);
                Util.logger.info(`✔️  Configuration committed`);
            }

            // do initial retrieve *
            await this._downloadAllBUs('"*"', initGit.status);

            // backup to server
            await InitGit.gitPush();

            // all done
            Util.logger.info('You are now ready to work with Accenture SFMC DevTools!');
            Util.logger.warn(
                'If you use VSCode, please restart it now to install recommended extensions.'
            );
        }
    },

    /**
     * Creates template file for properties.json
     *
     * @returns {Promise.<void>} -
     */
    async joinProject() {
        if (!(await Init._checkPathForCloud())) {
            return;
        }

        const isJoin = await confirm({
            message:
                'Do you want to join an existing project for which you have a Git-Repository URL?',
            default: true,
        });
        if (isJoin) {
            const gitRepoQs = {
                gitRepoUrl: await input({
                    message: 'Please enter the Git-Repository URL',
                }),
                gitBranch: await input({
                    message:
                        'If you were asked to work on a specific branch, please enter it now (or leave empty for default)',
                }),
            };

            const repoName = gitRepoQs.gitRepoUrl.split('/').pop().replace('.git', '');
            // clone repo into current folder
            Util.logger.info(
                'Cloning initiated. You might be asked for your Git credentials in a pop-up window in a few seconds.'
            );
            Util.execSync(
                'git',
                [
                    'clone',
                    gitRepoQs.gitBranch ? `--branch ${gitRepoQs.gitBranch}` : null,
                    '--config core.longpaths=true',
                    '--config core.autocrlf=input',
                    gitRepoQs.gitRepoUrl,
                ].filter(Boolean)
            );

            if (!fs.existsSync(repoName)) {
                Util.logger.error(
                    'Could not clone repository. Please check your Git-Repository URL as well as your credentials and try again.'
                );
                Util.logger.info(
                    'Check if you need an "API-Token" instead of your normal user password to authenticate'
                );
                return;
            }
            // make sure we switch to the new subfolder or else the rest will fail
            process.chdir(repoName);

            // check if the branch looks good
            const properties = await config.getProperties(true, true);
            if (!properties) {
                Util.logger.error(
                    'Could not find .mcdevrc.json file in project folder. Please check your Git repository and branch.'
                );
                return;
            }

            // get name and email that's to be used for git commits
            await InitGit._updateGitConfigUser();

            // ask the user to enter the server credentials
            await this.initProject(properties, null, false);
        } else {
            return;
        }
    },

    /**
     * helper for @initProject that optionally creates markets and market lists for all BUs
     */
    async _initMarkets() {
        const skipInteraction = Util.skipInteraction;
        const properties = await config.getProperties(true);

        // get list of business units
        const firstCredentialName = Object.keys(properties.credentials)[0];
        const businessUnits = Object.keys(
            properties.credentials[firstCredentialName].businessUnits
        );

        // set up empty markets for them
        const markets = {};
        for (const bu of businessUnits) {
            markets[bu] = { suffix: '_' + bu };
        }
        properties.markets = markets;

        let sourceBuName;
        // set up default deployment market lists
        if (skipInteraction) {
            // don't ask, list all BUs in deployment-target and set deployment-source to ???
            if (!businessUnits.includes(skipInteraction.developmentBu)) {
                Util.logger.warn(
                    `Could not find developmentBu=${skipInteraction.developmentBu} in business units. Skipping.`
                );
                delete skipInteraction.developmentBu;
            }
            sourceBuName = skipInteraction.developmentBu || '???';
            if (!skipInteraction.developmentBu) {
                Util.logger.info(
                    'Market List "deployment-source" will need to be set up manually. Marking all BUs as target BUs in "deployment-target".'
                );
            }
        } else {
            sourceBuName = await select({
                message: 'Please select your development business unit:',
                choices: businessUnits.map((bu) => ({ name: bu, value: bu })),
            });
        }
        // set source list
        properties.marketList['deployment-source'][firstCredentialName + '/' + sourceBuName] =
            sourceBuName;

        // set target list
        for (const bu of businessUnits) {
            // filter out source BU & parent BU to ensure they dont get deployed to automatically
            if (bu !== sourceBuName && bu !== '_ParentBU_') {
                properties.marketList['deployment-target'][firstCredentialName + '/' + bu] = bu;
            }
        }
        await File.saveConfigFile(properties);
    },

    /**
     * helper for {@link Init.initProject}
     *
     * @param {string} bu cred/bu or cred/* or *
     * @param {string} gitStatus signals what state the git repo is in
     * @returns {Promise.<void>} -
     */
    async _downloadAllBUs(bu, gitStatus) {
        const skipInteraction = Util.skipInteraction;
        let initialRetrieveAll;
        if (!skipInteraction) {
            initialRetrieveAll = await confirm({
                message: 'Do you want to start downloading all Business Units (recommended)?',
                default: true,
            });
        }
        if (skipInteraction?.downloadBUs === 'true' || initialRetrieveAll) {
            Util.execSync('mcdev', ['retrieve', bu]);

            if (gitStatus === 'init') {
                Util.logger.info(`Committing first backup of your SFMC instance:`);
                Util.execSync('git', ['add', '.']);
                Util.execSync('git', ['commit', '-n', '-m', '"First instance backup"', '--quiet']);
                Util.logger.info(`✔️  SFMC instance backed up`);
            } else if (gitStatus === 'update') {
                Util.logger.warn(
                    'Please manually commit this backup according to your projects guidelines.'
                );
                // TODO create guided commit:
                // 1. ask if commit with all changes shall be created
                // 2. ask if that should be done to current branch (show which one we are on) or a new branch
                //      a. if new: ask off of which we shall branch off of (show list) and then auto-create new branch and switch to it
                // 3. create commit
            }
        }
    },

    /**
     * wrapper around npm dependency & configuration file setup
     *
     * @param {Mcdevrc} properties config file's json
     * @param {boolean} [initial] print message if not part of initial setup
     * @param {string} [repoName] if git URL was provided earlier, the repo name was extracted to use it for npm init
     * @returns {Promise.<boolean>} success flag
     */
    async upgradeProject(properties, initial, repoName) {
        if (!(await Init._checkPathForCloud())) {
            return;
        }

        let status;
        const versionBeforeUpgrade = properties?.version || '0.0.0';
        if (!initial) {
            Util.logger.info(
                'Upgrading project with newest configuration, npm dependencies & other project configurations:'
            );

            // ensure an existing config is up to current specs
            status = await InitConfig.fixMcdevConfig(properties);
            if (!status) {
                return false;
            }
            // version 4 release to simplify auth
            status = await InitConfig.upgradeAuthFile();
            if (!status) {
                return false;
            }
        }

        // create files before installing dependencies to ensure .gitignore is properly set up
        status = await InitConfig.createIdeConfigFiles(versionBeforeUpgrade);
        if (!status) {
            return false;
        }

        // install node dependencies
        status = await InitNpm.installDependencies(repoName);
        if (!status) {
            return false;
        }

        return true;
    },

    /**
     * check if git repo is being saved on a cloud service and warn the user
     *
     * @private
     * @returns {Promise.<boolean>} true if path is good; false if project seems to be in a cloud service folder
     */
    async _checkPathForCloud() {
        const absolutePath = path.resolve('');
        // popular cloud services and their respective default name for the absolute path
        // * CloudDocs is the default folder name for iCloud
        const cloudServices = ['Dropbox', 'OneDrive', 'Google Drive', 'iCloud', 'CloudDocs'];
        let cloudServiceFound = false;
        for (const variable in cloudServices) {
            if (absolutePath.includes(cloudServices[variable])) {
                Util.logger.warn(
                    `It seems your project folder will be synchronized via '${
                        cloudServices[variable] === 'CloudDocs' ? 'iCloud' : cloudServices[variable]
                    }'. This can reduce the overall performance of your computer due to conflicts with Git.`
                );
                Util.logger.warn(
                    `We strongly recommend moving your project folder outside of the '${
                        cloudServices[variable] === 'CloudDocs' ? 'iCloud' : cloudServices[variable]
                    }' folder.`
                );
                cloudServiceFound = true;
            }
        }
        if (!cloudServiceFound && absolutePath.includes(process.env.USERPROFILE)) {
            // warn user to not place project folder into user profile folder
            Util.logger.warn(
                `It seems your project folder is located in your user profile's default folder which is often synchronized to webservices like ${cloudServices.join(
                    ', '
                )}. This can reduce the overall performance of your computer due to conflicts between with Git.`
            );
            Util.logger.warn(
                `We strongly recommend moving your project folder outside of this folder.`
            );
            cloudServiceFound = true;
        }
        if (cloudServiceFound) {
            const ignoreCloudWarning = await confirm({
                message: 'Do you want to continue anyways?',
                default: false,
            });
            if (!ignoreCloudWarning) {
                Util.logger.error('Exiting due to cloud service warning');
                return false;
            }
        }
        return true;
    },

    /**
     * finds credentials that are set up in config but not in auth file
     *
     * @private
     * @param {Mcdevrc} properties javascript object in .mcdevrc.json
     * @returns {string[]} list of credential names
     */
    _getMissingCredentials(properties) {
        let missingCredentials;
        if (properties?.credentials) {
            // reload auth file because for some reason we didnt want that in our main properties object
            let auth;
            try {
                auth = File.readJsonSync(Util.authFileName);
            } catch {
                // file not found
                auth = [];
            }
            // walk through config credentials and check if the matching credential in the auth file is missing something
            missingCredentials = Object.keys(properties.credentials).filter(
                (cred) =>
                    !auth[cred] ||
                    !auth[cred].account_id ||
                    properties.credentials[cred].eid != auth[cred].account_id ||
                    !auth[cred].client_id ||
                    !auth[cred].client_secret ||
                    !auth[cred].auth_url
            );
        }
        return missingCredentials || [];
    },
};

export default Init;
