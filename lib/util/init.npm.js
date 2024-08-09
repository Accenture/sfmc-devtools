'use strict';

import File from './file.js';
import path from 'node:path';
import { Util } from './util.js';
import semver from 'semver';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * CLI helper class
 */

const Init = {
    /**
     * initiates npm project and then
     * takes care of loading the pre-configured dependency list
     * from the boilerplate directory to them as dev-dependencies
     *
     * @param {string} [repoName] if git URL was provided earlier, the repo name was extracted to use it for npm init
     * @returns {Promise.<boolean>} install successful or error occured
     */
    async installDependencies(repoName) {
        let fileContent;
        let projectPackageJson;
        if (await File.pathExists('package.json')) {
            try {
                fileContent = await File.readFile('package.json', 'utf8');
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
                    .replaceAll(/[^a-z0-9 ]/gi, '')
                    .replaceAll(/ /gi, '-');
            projectPackageJson = { name: standardNpmName };
            this._getDefaultPackageJson(projectPackageJson);
            await File.writeToFile('./', 'package', 'json', JSON.stringify(projectPackageJson));
            // execute "no questions asked" npm init
            Util.execSync('npm', ['init', '--yes'], true);
            try {
                fileContent = await File.readFile('package.json', 'utf8');
                if (fileContent) {
                    projectPackageJson = JSON.parse(fileContent);
                }
                // type="module" is solely required for the new flat configs of ESLint >=9
                Util.execSync('npm', ['pkg', 'set', 'type="module"'], true);
                Util.logger.info('✔️  package.json created');
            } catch {
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
        if (!(await File.pathExists(dependencyFile))) {
            Util.logger.debug(`Dependency file not found in ${dependencyFile}`);
            return false;
        }
        const defaultDependencies = await File.readJSON(dependencyFile);
        const versionsDefault = {};
        for (const name of defaultDependencies) {
            // check mcdev.devDependencies first
            versionsDefault[name] = Object.keys(Util.packageJsonMcdev.dependencies).includes(name)
                ? Util.packageJsonMcdev.dependencies[name]
                : // then check mcdev.devDependencies
                  Object.keys(Util.packageJsonMcdev.devDependencies).includes(name)
                  ? Util.packageJsonMcdev.devDependencies[name]
                  : // fallback to using latest version if not found
                    'latest';
        }

        const versionsProject = {};
        if (projectPackageJson.devDependencies) {
            for (const name of defaultDependencies) {
                // check project.devDependencies
                versionsProject[name] = Object.keys(projectPackageJson.devDependencies).includes(
                    name
                )
                    ? projectPackageJson.devDependencies[name].replace(/^[\^~]/, '')
                    : // fallback to invalid version if not found
                      '0.0.0';
            }
        }
        const loadDependencies = defaultDependencies.filter(
            (name) =>
                !projectPackageJson ||
                !projectPackageJson.devDependencies ||
                !projectPackageJson.devDependencies[name] ||
                versionsDefault[name] == 'latest' ||
                // filters out file:.. references instead of versions that would otherwise lead to an error in semver.gt()
                !semver.valid(versionsProject[name]) ||
                semver.gt(versionsDefault[name], versionsProject[name])
        );
        if (loadDependencies.length) {
            Util.logger.info('Installing/Updating Dependencies:');
            const args = ['install', '--save-dev'].concat(
                loadDependencies.map((name) => `${name}@${versionsDefault[name]}`)
            );

            Util.execSync('npm', args);
            Util.logger.info('✔️  Dependencies installed.');
        } else {
            Util.logger.info(
                `✔️  All default dependencies are already installed: ` +
                    defaultDependencies.map((name) => `${name}@${versionsProject[name]}`).join(', ')
            );
        }
        return true;
    },

    /**
     * ensure we have certain default values in our config
     *
     * @param {object} [currentContent] what was read from existing package.json file
     * @returns {Promise.<{script: object, author: string, license: string}>} extended currentContent
     */
    async _getDefaultPackageJson(currentContent) {
        currentContent ||= {};
        // #1 scripts
        const predefinedCommandList = {
            build: 'sfmc-build all',
            'build-cp': 'sfmc-build cloudPages',
            'build-email': 'sfmc-build emails',
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
        if (!currentContent.type || currentContent.type !== 'module') {
            // type="module" is solely required for the new flat configs of ESLint >=9
            currentContent.type = 'module';
        }
        return currentContent;
    },
};

export default Init;
