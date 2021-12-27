'use strict';

const File = require('./file');
const inquirer = require('inquirer');
const Util = require('./util');
const commandExists = require('command-exists');
const git = require('simple-git/promise')();

/**
 * CLI helper class
 */

const Init = {
    /**
     * check if git repo exists and otherwise create one
     * @param {Object} [skipInteraction] signals what to insert automatically for things usually asked via wizard
     * @param {String} skipInteraction.gitRemoteUrl URL of Git remote server
     * @returns {Promise<{status:String, repoName:String}>} success flag
     */
    async initGitRepo(skipInteraction) {
        const result = { status: null, repoName: null };
        // check if git is installed (https://www.npmjs.com/package/command-exists)
        if (!commandExists.sync('git')) {
            Util.logger.error('Git installation not found.');
            Util.logger.error(
                'Please follow our tutorial on installing Git: https://go.accenture.com/mcdevdocs'
            );
            result.status = 'error';
            return result;
        }
        // 3. test if in git repo
        const gitRepoFoundInCWD = File.existsSync('.git');
        let newRepoInitialized = null;
        if (gitRepoFoundInCWD) {
            Util.logger.info(`✔️  Git repository found`);
            newRepoInitialized = false;
        } else {
            Util.logger.warn('No Git repository found. Initializing git:');
            Util.execSync('git', ['init']);
            if (File.existsSync('.git')) {
                newRepoInitialized = true;
            } else {
                Util.logger.error(
                    'We detected a problem initializing your Git repository. Please run "git init" manually'
                );
                result.status = 'error';
                return result;
            }
        }
        Util.logger.info('Ensuring long file paths are not causing issues with git:');
        try {
            Util.execSync('git', ['config', '--local', 'core.longpaths', 'true']);
        } catch (ex) {
            Util.logger.warn(
                `Updating your git config failed. We recommend running the above command manually yourself to avoid issues.`
            );
        }
        Util.logger.info('Ensuring checkout (git pull) as-is and commit Unix-style line endings:');
        try {
            Util.execSync('git', ['config', '--local', 'core.autocrlf', 'input']);
        } catch (ex) {
            Util.logger.warn(
                `Updating your git config failed. We recommend running the above command manually yourself to avoid issues.`
            );
        }

        // offer to update local user.name and user.email
        await this._updateGitConfigUser(skipInteraction);
        if (newRepoInitialized) {
            // offer to insert git remote url now
            result.repoName = await this._addGitRemote(skipInteraction);
        }

        Util.logger.info('✔️  Git initialization done.');
        result.status = newRepoInitialized ? 'init' : 'update';
        return result;
    },
    /**
     * offer to push the new repo straight to the server
     * @param {Boolean|Object} [skipInteraction] signals what to insert automatically for things usually asked via wizard
     * @returns {void}
     */
    async gitPush(skipInteraction) {
        const gitRemotes = (await git.getRemotes(true)).filter((item) => item.name === 'origin');
        if (gitRemotes.length && gitRemotes[0].refs.push) {
            // check if remote repo is still empty (otherwise to risky to blindly push)
            let remoteBranchesExist;
            Util.logger.info('Checking remote Git repository for existing branches...');
            try {
                // First, we need to update our local copy of the repo
                await git.fetch();
                // Then, we can check how many remote branches 'git fetch' has found
                remoteBranchesExist = (await git.branch(['-r'])).all.length > 0;
            } catch (ex) {
                Util.logger.error('Could not contact remote git server: ' + ex.message);
            }
            if (remoteBranchesExist === false) {
                // offer git push if no remote branches found
                Util.logger.info(
                    `Your remote Git repository is still empty and ready to store your initial backup. Hint: This is the server version of the repo which you share with your team.`
                );
                let responses;
                if (!skipInteraction) {
                    const questions = [
                        {
                            type: 'confirm',
                            name: 'gitPush',
                            message: `Would you like to 'push' your backup to the remote Git repo?`,
                            default: true,
                        },
                    ];
                    responses = await new Promise((resolve) => {
                        inquirer.prompt(questions).then((answers) => {
                            resolve(answers);
                        });
                    });
                }
                if (skipInteraction || responses.gitPush) {
                    Util.execSync('git', ['push', '-u', 'origin', 'master']);
                }
            } else if (remoteBranchesExist === true) {
                Util.logger.info(
                    'Your remote Git repository already contains data. Please execute a git push manually.'
                );
            }
        }
    },
    /**
     * offers to add the git remote origin
     * @param {Object} [skipInteraction] signals what to insert automatically for things usually asked via wizard
     * @param {String} skipInteraction.gitRemoteUrl URL of Git remote server
     * @returns {String} repo name (optionally)
     */
    async _addGitRemote(skipInteraction) {
        // #1 ask if the user wants to do it now
        let responses;
        if (!skipInteraction) {
            const questions = [
                {
                    type: 'confirm',
                    name: 'gitOriginKnown',
                    message: `Do you know the remote/clone URL of your Git repo (starts with ssh:// or http:// and ends on '.git')?`,
                    default: true,
                },
            ];
            responses = await new Promise((resolve) => {
                inquirer.prompt(questions).then((answers) => {
                    resolve(answers);
                });
            });
        }
        if (skipInteraction || responses.gitOriginKnown) {
            // #2 if yes, guide the user to input the right url
            if (skipInteraction) {
                responses = skipInteraction;
            } else {
                const questions = [
                    {
                        type: 'input',
                        name: 'gitRemoteUrl',
                        message: 'Git Remote URL',
                        validate: (value) => {
                            value = value.trim();
                            if (!value || value.length < 10) {
                                return 'Please enter a valid remote URL';
                            } else if (!value.startsWith('http') && !value.startsWith('ssh')) {
                                return `Your Git Remote URL should start with 'http' or 'ssh'`;
                            } else if (!value.endsWith('.git')) {
                                return `Your Git Remote URL should end with '.git'`;
                            } else {
                                // all good
                                return true;
                            }
                        },
                    },
                ];
                responses = await new Promise((resolve) => {
                    inquirer.prompt(questions).then((answers) => {
                        resolve(answers);
                    });
                });
            }
            responses.gitRemoteUrl = responses.gitRemoteUrl.trim();
            Util.execSync('git', ['remote', 'add', 'origin', responses.gitRemoteUrl]);
            return responses.gitRemoteUrl.split('/').pop().split('.')[0];
        }
    },
    /**
     * checks global config and ask to config the user info and then store it locally
     * @param {Object|Boolean} [skipInteraction] signals what to insert automatically for things usually asked via wizard
     * @returns {void}
     */
    async _updateGitConfigUser(skipInteraction) {
        const gitUser = (await this._getGitConfigUser()) || {};
        Util.logger.info(
            `Please confirm your Git user name & email. It should be in the format 'FirstName LastName' and 'your.email@accenture.com'. The current (potentially wrong) values are provided as default. If correct, confirm with ENTER, otherwise please update:`
        );
        let responses;
        if (skipInteraction) {
            responses = {
                name: gitUser['user.name'],
                email: gitUser['user.email'],
            };
        } else {
            const questions = [
                {
                    type: 'input',
                    name: 'name',
                    message: 'Git user.name',
                    default: gitUser['user.name'] || null,
                    // eslint-disable-next-line require-jsdoc
                    validate: function (value) {
                        if (
                            !value ||
                            value.trim().length < 4 ||
                            value.includes('"') ||
                            value.includes("'")
                        ) {
                            return 'Please enter valid name';
                        }
                        return true;
                    },
                },
                {
                    type: 'input',
                    name: 'email',
                    message: 'Git user.email',
                    default: gitUser['user.email'] || null,
                    // eslint-disable-next-line require-jsdoc
                    validate: function (value) {
                        value = value.trim();
                        const regex =
                            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                        if (!value || !regex.test(String(value).toLowerCase())) {
                            return 'Please enter valid email';
                        }
                        return true;
                    },
                },
            ];
            responses = await new Promise((resolve) => {
                inquirer.prompt(questions).then((answers) => {
                    resolve(answers);
                });
            });
        }
        if (responses.name && responses.email) {
            // name can contain spaces - wrap it in quotes
            const name = `"${responses.name.trim()}"`;
            const email = responses.email.trim();
            Util.execSync('git', ['config', '--local', 'user.name', name]);
            Util.execSync('git', ['config', '--local', 'user.email', email]);
        }
    },
    /**
     * retrieves the global user.name and user.email values
     * @returns {Promise<{'user.name': String, 'user.email': String}>} user.name and user.email
     */
    async _getGitConfigUser() {
        const gitConfigs = await git.listConfig();
        // remove local config
        delete gitConfigs.values['.git/config'];
        const result = {};

        Object.keys(gitConfigs.values).forEach((file) => {
            if (gitConfigs.values[file]['user.name']) {
                result['user.name'] = gitConfigs.values[file]['user.name'];
            }
            if (gitConfigs.values[file]['user.email']) {
                result['user.email'] = gitConfigs.values[file]['user.email'];
            }
        });
        if (!result['user.name'] || !result['user.email']) {
            return null;
        }
        return result;
    },
};

module.exports = Init;
