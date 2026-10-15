'use strict';

import File from './file.js';
import path from 'node:path';
import { Util } from './util.js';
import semver from 'semver';
const retiredDependencies = ['eslint-config-ssjs', 'eslint-plugin-prettier', 'prettier-plugin-sql'];
const retiredScripts = {
    build: 'sfmc-build all',
    'build-cp': 'sfmc-build cloudPages',
    'build-email': 'sfmc-build emails',
    'eslint-check': 'eslint',
};
const scripts = {
    lint: 'eslint .',
    'lint:fix': 'eslint . --fix',
    format: 'prettier . --write',
    'format:check': 'prettier . --check',
};

/** CLI helper for project tooling dependencies. */
const Init = {
    /**
     * Update project tooling defaults and install dependencies.
     *
     * @param {string} [repoName] optional initial project name
     * @param {string} [versionBeforeUpgrade] original project version for retirement gating
     * @returns {Promise.<boolean>} whether installation succeeded
     */
    async installDependencies(repoName, versionBeforeUpgrade) {
        const exists = await File.pathExists('package.json');
        const current = exists ? await File.readJSON('package.json') : {};
        let project = structuredClone(current);
        if (!exists) {
            const selected = repoName?.trim().toLowerCase();
            const validName = /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/;
            const directoryName = path
                .basename(path.resolve())
                .toLowerCase()
                .replaceAll(/[^a-z0-9 ]/g, '')
                .trim()
                .replaceAll(/ +/g, '-');
            const name = selected && validName.test(selected) ? selected : directoryName;
            project.name =
                name && name.length <= 214 && !['node_modules', 'favicon.ico'].includes(name)
                    ? name
                    : 'mcdev-project';
        }
        this._getDefaultPackageJson(project);
        const manifest = await File.readJSON(Util.getBoilerplatePath('npm-dependencies.json'));
        if (!Array.isArray(manifest)) {
            throw new TypeError('The tooling dependency manifest must be an array.');
        }
        const versionsDefault = {};
        for (const name of manifest) {
            versionsDefault[name] =
                Util.packageJsonMcdev.dependencies?.[name] ||
                Util.packageJsonMcdev.devDependencies?.[name] ||
                'latest';
        }
        const versionsProject = {};
        for (const name of manifest) {
            versionsProject[name] =
                project.devDependencies?.[name]?.replace(/^[\^~]/, '') || '0.0.0';
        }
        const loadDependencies = manifest.filter(
            (name) =>
                !project.devDependencies?.[name] ||
                versionsDefault[name] === 'latest' ||
                !semver.valid(versionsProject[name]) ||
                semver.gt(versionsDefault[name], versionsProject[name])
        );
        const retired = semver.lt(semver.valid(versionBeforeUpgrade) || '0.0.0', '10.0.0')
            ? retiredDependencies.filter(
                  (name) =>
                      current.dependencies?.[name] !== undefined ||
                      current.devDependencies?.[name] !== undefined
              )
            : [];
        if (!exists) {
            // Seed the project name before npm validates the directory-derived default.
            await File.writeJSON('package.json', { name: project.name }, { spaces: 2 });
            if (
                Util.execSync('npm', ['init', '--yes'], true) === null ||
                !(await File.pathExists('package.json'))
            ) {
                Util.logger.error('Could not initialize package.json. Migration incomplete.');
                return false;
            }
            const generated = await File.readJSON('package.json');
            project = {
                ...generated,
                ...project,
                scripts: { ...generated.scripts, ...project.scripts },
            };
        }
        await File.writeJSON('package.json', project, { spaces: 2 });
        if (retired.length && Util.execSync('npm', ['uninstall', ...retired], true) === null) {
            Util.logger.error('Could not uninstall retired dependencies. Migration incomplete.');
            return false;
        }
        if (loadDependencies.length) {
            Util.logger.info('Installing/Updating Dependencies:');
            const args = ['install', '--save-dev'].concat(
                loadDependencies.map((name) => `${name}@${versionsDefault[name]}`)
            );
            if (Util.execSync('npm', args, true) === null) {
                Util.logger.error('Could not install/update dependencies. Migration incomplete.');
                return false;
            }
            Util.logger.info('✔️  Dependencies installed.');
        } else {
            Util.logger.info(
                `✔️  All default dependencies are already installed: ` +
                    manifest.map((name) => `${name}@${versionsProject[name]}`).join(', ')
            );
        }
        return true;
    },

    /**
     * Apply owned defaults while retaining unrelated project settings.
     *
     * @param {object} currentContent existing package contents
     * @returns {object} updated package contents
     */
    _getDefaultPackageJson(currentContent) {
        currentContent.scripts ||= {};
        for (const [name, command] of Object.entries(retiredScripts)) {
            if (currentContent.scripts[name] === command) {
                delete currentContent.scripts[name];
            }
        }
        Object.assign(currentContent.scripts, scripts);
        currentContent.author ||= 'Accenture';
        if (!currentContent.license || currentContent.license === 'ISC') {
            currentContent.license = 'UNLICENSED';
        }
        currentContent.engines ||= {};
        if (
            !semver.validRange(currentContent.engines.node) ||
            !semver.subset(currentContent.engines.node, Util.packageJsonMcdev.engines.node)
        ) {
            currentContent.engines.node = Util.packageJsonMcdev.engines.node;
        }
        currentContent.type = 'module';
        return currentContent;
    },
};

export default Init;
