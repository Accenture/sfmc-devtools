'use strict';

// const TYPE = require('../../types/mcdev.d');
import File from './file.js';

import inquirer from 'inquirer';
import { Util } from './util.js';
import commandExists from 'command-exists';
import gitFactory from 'simple-git';
const git = gitFactory();

/**
 * CLI helper class
 */

const Init = {
    /**
     * check if git repo exists and otherwise create one
     *
     * @returns {Promise.<{status: string, repoName: string}>} success flag
     */
    async initGitRepo() {
        const result = { status: null, repoName: null };
        // check if git is installed (https://www.npmjs.com/package/command-exists)
        if (!commandExists.sync('git')) {
            Util.logger.error('Git installation not found.');
            Util.logger.error(
                'Please follow our tutorial on installing Git: https://github.com/Accenture/sfmc-devtools#212-install-the-git-command-line'
            );
            result.status = 'error';
            return result;
        }
        // 3. test if in git repo
        const gitRepoFoundInCWD = await File.pathExists('.git');
        let newRepoInitialized = null;
        if (gitRepoFoundInCWD) {
            Util.logger.info(`✔️  Git repository found`);
            newRepoInitialized = false;
        } else {
            Util.logger.warn('No Git repository found. Initializing git:');
            Util.execSync('git', ['init']);
            if (await File.pathExists('.git')) {
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
        } catch {
            Util.logger.warn(
                `Updating your git config failed. We recommend running the above command manually yourself to avoid issues.`
            );
        }
        Util.logger.info('Ensuring checkout (git pull) as-is and commit Unix-style line endings:');
        try {
            Util.execSync('git', ['config', '--local', 'core.autocrlf', 'input']);
        } catch {
            Util.logger.warn(
                `Updating your git config failed. We recommend running the above command manually yourself to avoid issues.`
            );
        }

        // offer to update local user.name and user.email
        await this._updateGitConfigUser();
        if (newRepoInitialized) {
            // offer to insert git remote url now
            result.repoName = await this._addGitRemote();
        }

        Util.logger.info('✔️  Git initialization done.');
        result.status = newRepoInitialized ? 'init' : 'update';
        return result;
    },
    /**
     * offer to push the new repo straight to the server
     *
     * @returns {void}
     */
    async gitPush() {
        const skipInteraction = Util.skipInteraction;
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
                    responses = await inquirer.prompt([
                        {
                            type: 'confirm',
                            name: 'gitPush',
                            message: `Would you like to 'push' your backup to the remote Git repo?`,
                            default: true,
                        },
                    ]);
                }
                if (skipInteraction?.gitPush === 'true' || responses?.gitPush) {
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
     *
     * @returns {string} repo name (optionally)
     */
    async _addGitRemote() {
        const skipInteraction = Util.skipInteraction;
        // #1 ask if the user wants to do it now
        let responses;
        if (!skipInteraction) {
            responses = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'gitOriginKnown',
                    message: `Do you know the remote/clone URL of your Git repo (starts with ssh:// or http:// and ends on '.git')?`,
                    default: true,
                },
            ]);
        }
        if (skipInteraction || responses.gitOriginKnown) {
            // #2 if yes, guide the user to input the right url
            /* eslint-disable unicorn/prefer-ternary */
            if (skipInteraction) {
                responses = skipInteraction;
            } else {
                responses = await inquirer.prompt([
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
                            } else if (value.endsWith('.git')) {
                                // all good
                                return true;
                            } else {
                                return `Your Git Remote URL should end with '.git'`;
                            }
                        },
                    },
                ]);
            }
            /* eslint-enable unicorn/prefer-ternary */
            if (typeof responses.gitRemoteUrl === 'string') {
                responses.gitRemoteUrl = responses.gitRemoteUrl.trim();
                Util.execSync('git', ['remote', 'add', 'origin', responses.gitRemoteUrl]);
                return responses.gitRemoteUrl.split('/').pop().split('.')[0];
            }
        }
    },
    /**
     * checks global config and ask to config the user info and then store it locally
     *
     * @returns {void}
     */
    async _updateGitConfigUser() {
        const skipInteraction = Util.skipInteraction;
        const gitUser = (await this._getGitConfigUser()) || {};
        Util.logger.info(
            `Please confirm your Git user name & email. It should be in the format 'FirstName LastName' and 'your.email@accenture.com'. The current (potentially wrong) values are provided as default. If correct, confirm with ENTER, otherwise please update:`
        );
        let responses;
        /* eslint-disable unicorn/prefer-ternary */
        if (skipInteraction) {
            responses = {
                name: gitUser['user.name'],
                email: gitUser['user.email'],
            };
        } else {
            responses = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'name',
                    message: 'Git user.name',
                    default: gitUser['user.name'] || null,
                    // eslint-disable-next-line jsdoc/require-jsdoc
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
                    // eslint-disable-next-line jsdoc/require-jsdoc
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
            ]);
        }
        /* eslint-enable unicorn/prefer-ternary */

        if (responses.name && responses.email) {
            // name can contain spaces - wrap it in quotes
            const name = `"${responses.name.trim()}"`;
            const email = responses.email.trim();
            try {
                Util.execSync('git', ['config', '--local', 'user.name', name]);
                Util.execSync('git', ['config', '--local', 'user.email', email]);
            } catch (ex) {
                // if project folder is not a git folder then using --local will lead to a fatal error
                Util.logger.warn('- Could not update git user name and email');
                Util.logger.debug(ex.message);
            }
        }
    },
    /**
     * retrieves the global user.name and user.email values
     *
     * @returns {Promise.<{'user.name': string, 'user.email': string}>} user.name and user.email
     */
    async _getGitConfigUser() {
        const names = await git.getConfig('user.name');
        const emails = await git.getConfig('user.email');

        return { 'user.name': names.value || '', 'user.email': emails.value || '' };
    },
};

export default Init;
