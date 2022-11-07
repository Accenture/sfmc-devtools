'use strict';
const TYPE = require('../../types/mcdev.d');
const Cli = require('./cli');
const File = require('./file');
const config = require('./config');
const InitGit = require('./init.git');
const InitNpm = require('./init.npm');
const InitConfig = require('./init.config');
const inquirer = require('inquirer');
const Util = require('./util');

/**
 * CLI helper class
 */

const Init = {
    /**
     * Creates template file for properties.json
     *
     * @param {TYPE.Mcdevrc} properties config file's json
     * @param {string} credentialName identifying name of the installed package / project
     * @returns {Promise.<void>} -
     */
    async initProject(properties, credentialName) {
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
                            const success = await Cli.updateCredential(properties, badCredName);
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

                let responses;
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
                    responses = await inquirer.prompt([
                        {
                            type: 'confirm',
                            name: 'isAddCredential',
                            message: 'Do you want to add another credential instead?',
                            default: false,
                        },
                    ]);
                }
                let credentialName;
                if (skipInteraction || responses.isAddCredential) {
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

            let status = await this.upgradeProject(properties, true, initGit.repoName);
            if (!status) {
                return;
            }

            // ask for credentials and create mcdev config
            status = await Cli.initMcdevConfig();
            if (!status) {
                return;
            }

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
     * helper for this.initProject()
     *
     * @param {string} bu cred/bu or cred/* or *
     * @param {string} gitStatus signals what state the git repo is in
     * @returns {Promise.<void>} -
     */
    async _downloadAllBUs(bu, gitStatus) {
        const skipInteraction = Util.skipInteraction;
        let responses;
        if (!skipInteraction) {
            responses = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'initialRetrieveAll',
                    message: 'Do you want to start downloading all Business Units (recommended)?',
                    default: true,
                },
            ]);
        }
        if (skipInteraction.downloadBUs === 'true' || responses?.initialRetrieveAll) {
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
     * @param {TYPE.Mcdevrc} properties config file's json
     * @param {boolean} [initial] print message if not part of initial setup
     * @param {string} [repoName] if git URL was provided earlier, the repo name was extracted to use it for npm init
     * @returns {Promise.<boolean>} success flag
     */
    async upgradeProject(properties, initial, repoName) {
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
            status = await InitConfig.upgradeAuthFile(properties);
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
     * finds credentials that are set up in config but not in auth file
     *
     * @param {TYPE.Mcdevrc} properties javascript object in .mcdevrc.json
     * @returns {string[]} list of credential names
     */
    _getMissingCredentials(properties) {
        let missingCredentials;
        if (properties?.credentials) {
            // reload auth file because for some reason we didnt want that in our main properties object
            let auth;
            try {
                auth = File.readJsonSync(Util.authFileName);
            } catch (ex) {
                Util.logger.error(`${ex.code}: ${ex.message}`);
                return;
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

module.exports = Init;
