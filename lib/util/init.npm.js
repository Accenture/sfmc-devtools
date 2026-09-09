'use strict';

import File from './file.js';
import path from 'node:path';
import { Util } from './util.js';
import InitConfig from './init.config.js';
import semver from 'semver';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
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
     * Prepare package changes without writing or invoking npm.
     *
     * @param {string} [repoName] optional initial project name
     * @param {string} [versionBeforeUpgrade] original project version for retirement gating
     * @returns {Promise.<object | false>} approved package and dependency installation plan
     */
    async preflightDependencies(repoName, versionBeforeUpgrade) {
        const exists = await File.pathExists('package.json');
        const current = exists ? await File.readJSON('package.json') : {};
        const project = structuredClone(current);
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
        const manifest = await File.readJSON(
            path.resolve(__dirname, Util.boilerplateDirectory, 'npm-dependencies.json')
        );
        if (!Array.isArray(manifest)) {
            throw new TypeError('The tooling dependency manifest must be an array.');
        }
        const defaults = {};
        const changes = [];
        if (current.type && current.type !== project.type) {
            changes.push(`module type: ${current.type} -> ${project.type}`);
        }
        if (current.engines?.node !== undefined && current.engines.node !== project.engines.node) {
            changes.push(`engines.node: ${current.engines.node} -> ${project.engines.node}`);
        }
        for (const name of [...Object.keys(scripts), ...Object.keys(retiredScripts)]) {
            if (
                current.scripts?.[name] !== undefined &&
                current.scripts[name] !== project.scripts[name]
            ) {
                changes.push(
                    `script ${name}: ${current.scripts[name]} -> ${project.scripts[name] || '(removed)'}`
                );
            }
        }
        for (const name of manifest) {
            defaults[name] =
                Util.packageJsonMcdev.dependencies?.[name] ||
                Util.packageJsonMcdev.devDependencies?.[name] ||
                'latest';
        }
        for (const name of Object.keys(defaults)) {
            const sections = ['dependencies', 'devDependencies'].filter(
                (section) => project[section]?.[name] !== undefined
            );
            if (!sections.length) {
                project.devDependencies ||= {};
                project.devDependencies[name] = defaults[name];
            }
            for (const section of sections) {
                const existing = project[section][name];
                // Only simple versions can demonstrate an upgrade; preserve custom specs.
                const existingVersion = semver.valid(existing.replace(/^[\^~]/, ''));
                const defaultVersion = semver.valid(defaults[name].replace(/^[\^~]/, ''));
                if (
                    existingVersion &&
                    defaultVersion &&
                    semver.lt(existingVersion, defaultVersion)
                ) {
                    project[section][name] = defaults[name];
                    changes.push(`${section}.${name}: ${existing} -> ${defaults[name]}`);
                }
            }
        }
        const retired = semver.lt(semver.valid(versionBeforeUpgrade) || '0.0.0', '10.0.0')
            ? retiredDependencies.filter(
                  (name) =>
                      current.dependencies?.[name] !== undefined ||
                      current.devDependencies?.[name] !== undefined
              )
            : [];
        changes.push(...retired.map((name) => `remove dependency ${name}`));
        if (
            changes.length &&
            !(await InitConfig.confirmToolingReplacement(
                `package.json tooling changes:\n${changes.join('\n')}`
            ))
        ) {
            return false;
        }
        for (const section of ['dependencies', 'devDependencies']) {
            for (const name of retired) {
                if (project[section]) {
                    delete project[section][name];
                }
            }
        }
        return { project, fresh: !exists };
    },

    /**
     * Apply an approved package migration and install package-derived defaults.
     *
     * @param {string} [repoName] initial project name
     * @param {string} [versionBeforeUpgrade] original pre-v10 project version, retained for migration retries
     * @param {object} [prepared] preflight result from the orchestrator
     * @returns {Promise.<boolean>} whether installation succeeded
     */
    async installDependencies(repoName, versionBeforeUpgrade, prepared) {
        const plan = prepared || (await this.preflightDependencies(repoName, versionBeforeUpgrade));
        if (!plan) {
            return false;
        }
        const { fresh } = plan;
        let { project } = plan;
        if (fresh) {
            // Seed the approved name before npm validates the directory-derived default.
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
        // Install from the approved declarations without npm normalizing chosen ranges.
        // Always reconcile artifacts, including retries after a previous install failed.
        if (Util.execSync('npm', ['install'], true) === null) {
            Util.logger.error('Could not install/update dependencies. Migration incomplete.');
            return false;
        }
        Util.logger.info('Project tooling dependencies are up to date.');
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
