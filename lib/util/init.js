'use strict';
const TYPE = require('../../types/mcdev.d');
const Cli = require('./cli');
const File = require('./file');
const InitGit = require('./init.git');
const InitNpm = require('./init.npm');
const InitConfig = require('./init.config');
const inquirer = require('inquirer');
const Util = require('./util');
const config = require('./config');

/**
 * CLI helper class
 */

const Init = {
    /**
     * Creates template file for properties.json
     *
     * @param {object} properties config file's json
     * @param {string} credentialName identifying name of the installed package / project
     * @param {TYPE.skipInteraction} [skipInteraction] signals what to insert automatically for things usually asked via wizard
     * @returns {Promise.<void>} -
     */
    async initProject(properties, credentialName, skipInteraction) {
        const missingCredentials = await this._getMissingCredentials(properties);
        if ((await File.pathExists(Util.configFileName)) && properties) {
            // config exists
            if (credentialName) {
                Util.logger.info(`Updating credential '${credentialName}'`);
                // update-credential mode
                console.log('CHECK', properties);
                if (!properties.credentials[credentialName]) {
                    Util.logger.error(`Could not find credential '${credentialName}'`);
                    const response = await Cli._selectBU(properties, null, true);
                    credentialName = response.credential;
                }
                let error;
                do {
                    error = false;
                    try {
                        const success = await Cli.updateCredential(
                            properties,
                            credentialName,
                            skipInteraction
                        );
                        if (success) {
                            Util.logger.info(`✔️  Credential '${credentialName}' updated.`);
                        } else {
                            error = true;
                        }
                    } catch (ex) {
                        error = true;
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
                                skipInteraction
                            );
                            if (success) {
                                Util.logger.info(`✔️  Credential '${badCredName}' updated.`);
                            } else {
                                error = true;
                            }
                        } catch (ex) {
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
                    credentialName = await Cli.addExtraCredential(properties, skipInteraction);
                }
                if (credentialName) {
                    await this._downloadAllBUs(`${credentialName}/*`, 'update', skipInteraction);
                }
            }
        } else {
            // config does not exist
            // assuming it's the first time this command is run for this project

            // initialize git repo
            const initGit = await InitGit.initGitRepo(skipInteraction);
            if (initGit.status === 'error') {
                return;
            }

            // set up IDE files and load npm dependencies

            let status = await this.upgradeProject(properties, true, initGit.repoName);
            if (!status) {
                return;
            }

            // ask for credentials and create mcdev config
            status = await Cli.initMcdevConfig(skipInteraction);
            if (!status) {
                return;
            }

            // create first commit to backup the project configuration
            if (initGit.status === 'init') {
                Util.logger.info(`Committing initial setup to Git:`);
                Util.execSync('git', ['add', '.']);
                Util.execSync('git', ['commit', '-m', '"Initial commit"', '--quiet']);
                Util.logger.info(`✔️  Configuration committed`);
            }

            // do initial retrieve *
            await this._downloadAllBUs('"*"', initGit.status);

            // backup to server
            await InitGit.gitPush(skipInteraction);

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
     * @param {boolean | object} [skipInteraction] signals what to insert automatically for things usually asked via wizard
     * @returns {Promise.<void>} -
     */
    async _downloadAllBUs(bu, gitStatus, skipInteraction) {
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
        if (skipInteraction || responses.initialRetrieveAll) {
            Util.execSync('mcdev', ['retrieve', bu]);

            if (gitStatus === 'init') {
                Util.logger.info(`Committing first backup of your SFMC instance:`);
                Util.execSync('git', ['add', '.']);
                Util.execSync('git', ['commit', '-m', '"First instance backup"', '--quiet']);
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
     * @param {object} properties config file's json
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
     * @param {object} properties javascript object in .mcdevrc.json
     * @returns {Promise.<string[]>} list of credential names
     */
    async _getMissingCredentials(properties) {
        let missingCredentials;
        const authCredentials = await File.readJson(Util.authFileName);
        console.log('GET', authCredentials);
        if (properties && properties.credentials) {
            missingCredentials = Object.keys(properties.credentials).filter(
                (cred) =>
                    !authCredentials ||
                    !authCredentials[cred] ||
                    !authCredentials[cred].client_id ||
                    !authCredentials[cred].client_secret ||
                    !authCredentials[cred].auth_url ||
                    !authCredentials[cred].account_id
            );
        }
        return missingCredentials || [];
    },
};

module.exports = Init;
