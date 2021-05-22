'use strict';

const File = require('../util/file');
const inquirer = require('inquirer');
const path = require('path');
const Util = require('../util');

/**
 * CLI helper class
 */

const Init = {
    /**
     * initiates npm project and then
     * takes care of loading the pre-configured dependency list
     * from the boilerplate directory to them as dev-dependencies
     * @param {String} [repoName] if git URL was provided earlier, the repo name was extracted to use it for npm init
     * @returns {Promise<Boolean>} install successful or error occured
     */
    async installDependencies(repoName) {
        let fileContent;
        let projectPackageJson;
        if (File.existsSync('package.json')) {
            try {
                fileContent = File.readFileSync('package.json', 'utf8');
            } catch (ex) {
                Util.logger.error(
                    'Your package.json was found but seems to be corrupted: ' + ex.message
                );
            }
            if (fileContent) {
                projectPackageJson = JSON.parse(fileContent);
                this._getDefaultPackageJson(projectPackageJson);
                await File.writeJSON('./package.json', projectPackageJson, { spaces: 2 });
                Util.logger.info('✔️  package.json found');
            }
        } else {
            Util.logger.warn('No package.json found. Initializing node project:');
            // make sure the npm project name is compliant with npm rules
            const currentFolderName = path.basename(path.resolve());
            const standardNpmName =
                repoName ||
                currentFolderName
                    .toLowerCase()
                    .replace(/[^a-z0-9 ]/gi, '')
                    .replace(/ /gi, '-');
            projectPackageJson = { name: standardNpmName };
            this._getDefaultPackageJson(projectPackageJson);
            await File.writeToFile('./', 'package', 'json', JSON.stringify(projectPackageJson));
            // execute "no questions asked" npm init
            Util.execSync('npm', ['init', '--yes']);
            try {
                fileContent = File.readFileSync('package.json', 'utf8');
                if (fileContent) {
                    projectPackageJson = JSON.parse(fileContent);
                }
                Util.logger.info('✔️  package.json created');
            } catch (ex) {
                Util.logger.error('No package.json found. Please run "npm init" manually');
                return false;
            }
        }

        // ensure npm dependencies are loaded
        const dependencyFile = path.resolve(
            __dirname,
            Util.boilerplateDirectory,
            'npm-dependencies.json'
        );
        if (!File.existsSync(dependencyFile)) {
            Util.logger.debug(`Dependency file not found in ${dependencyFile}`);
            return false;
        }
        const defaultDependencies = File.readJsonSync(dependencyFile);

        const loadDependencies = defaultDependencies.filter(
            (name) =>
                !projectPackageJson ||
                !projectPackageJson.devDependencies ||
                !projectPackageJson.devDependencies[name]
        );
        if (loadDependencies.length < defaultDependencies.length) {
            Util.logger.info(
                `✔️  ${
                    !loadDependencies.length ? 'All' : 'Some'
                } default dependencies are already installed: ` + defaultDependencies.join(', ')
            );
            const questions = [
                {
                    type: 'confirm',
                    name: 'runUpdate',
                    message: 'Would you like to attempt updating them?',
                    default: true,
                },
            ];
            const responses = await new Promise((resolve) => {
                inquirer.prompt(questions).then((answers) => {
                    resolve(answers);
                });
            });
            if (responses.runUpdate) {
                loadDependencies.length = 0;
                loadDependencies.push(...defaultDependencies);
            }
        }
        if (loadDependencies.length) {
            Util.logger.info('Installing Dependencies:');
            const args = ['install', '--save-dev'].concat(loadDependencies);

            Util.execSync('npm', args);
            Util.logger.info('✔️  Dependencies installed.');
        }
        return true;
    },
    /**
     * ensure we have certain default values in our config
     * @param {Object} [currentContent] what was read from existing package.json file
     * @returns {Promise<{script: Object, author: String, license: String}>} extended currentContent
     */
    async _getDefaultPackageJson(currentContent) {
        currentContent = currentContent || {};
        // #1 scripts
        const predefinedCommandList = {
            build: 'sfmc-build all',
            'build-cp': 'sfmc-build cloudPages',
            'build-email': 'sfmc-build emails',
            upgrade: 'npm-check --update',
            'eslint-check': 'eslint',
        };
        if (!currentContent.scripts) {
            currentContent.scripts = {};
        }
        for (const key in predefinedCommandList) {
            currentContent.scripts[key] = predefinedCommandList[key];
        }
        // #2 Author
        if (!currentContent.author || currentContent.author === '') {
            currentContent.author = 'Accenture';
        }
        // #3 License
        if (!currentContent.license || currentContent.license === 'ISC') {
            currentContent.license = 'UNLICENSED';
        }
        return currentContent;
    },
};

module.exports = Init;
