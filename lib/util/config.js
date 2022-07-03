const TYPE = require('../../types/mcdev.d');
const Util = require('./util');
const File = require('./file');
const inquirer = require('inquirer');
const semver = require('semver');
const path = require('path');
const packageJsonMcdev = require('../../package.json');
/**
 * Central class for loading and validating properties from config and auth
 */
const config = {
    properties: null,
    /**
     * loads central properties from config file
     *
     * @param {boolean} [silent] omit throwing errors and print messages; assuming not silent if not set
     * @returns {object} central properties object
     */
    async getProperties(silent) {
        // already loaded, return existing
        if (config.properties) {
            return config.properties;
        }
        if (await File.pathExists(Util.configFileName)) {
            config.properties = await File.readJson(Util.configFileName);

            if (await File.pathExists(Util.authFileName)) {
                const auth = await File.readJson(Util.authFileName);
                for (const cred in config.properties.credentials) {
                    if (auth[cred]) {
                        if (
                            config.properties.credentials[cred].eid !== auth[cred].account_id &&
                            !silent
                        ) {
                            throw new Error(
                                `'${cred}' found in ${Util.configFileName} and ${Util.authFileName} have a Enterprise ID mismatch. Please check.`
                            );
                        }
                        // TODO add auth checks #294
                    } else if (!silent) {
                        throw new Error(
                            `'${cred}' found in ${Util.configFileName} but not in ${Util.authFileName}. Please run 'mcdev init' to provide the missing credential details.`
                        );
                    }
                }
            } else if (!silent) {
                throw new Error(
                    `${Util.authFileName} not found. Please run 'mcdev init' to provide the missing credential details.`
                );
            }
        }
        await this.checkProperties(config.properties, silent);
        return config.properties;
    },
    /**
     * check if the config file is correctly formatted and has values
     *
     * @param {TYPE.Mcdevrc} properties javascript object in .mcdevrc.json
     * @param {boolean} [skipCredentialValidation] set to true for internal use w/o cli output
     * @returns {Promise.<boolean | string[]>} file structure ok OR list of fields to be fixed
     */
    async checkProperties(properties, skipCredentialValidation) {
        if (!(await File.pathExists(Util.configFileName)) || !properties) {
            throw new Error(
                `Could not find ${
                    Util.configFileName
                } in ${process.cwd()}.Run 'mcdev init' to initialize your project.\n`
            );
        }
        if (!(await File.pathExists(Util.authFileName)) || !properties) {
            throw new Error(
                `Could not find ${
                    Util.authFileName
                } in ${process.cwd()}.Run 'mcdev init' to initialize your project.\n`
            );
        }

        // check if user is running older (ignores patches) mcdev version than whats saved to the config
        if (properties.version && semver.gt(properties.version, packageJsonMcdev.version)) {
            const errorMsg = `Your Accenture SFMC DevTools version ${packageJsonMcdev.version} is lower than your project's config version ${properties.version}`;
            if (Util.skipInteraction) {
                throw new Error(errorMsg);
            }
            const responses = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'runUpgradeNow',
                    message: `Do you want to run 'npm update -g mcdev@${properties.version}' now? This may take a few minutes.`,
                    default: true,
                },
            ]);
            if (responses.runUpgradeNow) {
                // use _execSync here to avoid a circular dependency
                Util.execSync('npm', ['update', '-g', `mcdev@${properties.version}`]);
            }
            throw new Error(errorMsg);
        }

        // check config properties
        const { errorMsgs, solutionSet } = await this.getProblems(
            properties,
            null,
            skipCredentialValidation
        );
        if (errorMsgs.length) {
            const errorMsgOutput = [
                `Found problems in your ./${Util.configFileName} that you need to fix first:`,
            ];
            for (const msg of errorMsgs) {
                errorMsgOutput.push(' - ' + msg);
            }
            const errorMsgText = errorMsgOutput.join('\n');
            if (Util.skipInteraction) {
                throw new Error(errorMsgText);
            }
            Util.logger.error(errorMsgText);
            Util.logger.info(
                ['Here is what you can do to fix these issues:', ...Array.from(solutionSet)].join(
                    '\n- '
                )
            );
            const responses = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'runUpgradeNow',
                    message: `Do you want to run 'mcdev upgrade' now?`,
                    default: true,
                },
            ]);
            if (responses.runUpgradeNow) {
                // use _execSync here to avoid a circular dependency
                this.execSync('mcdev', ['upgrade']);
            }
            throw new Error(errorMsgOutput);
        }
    },
    /**
     * defines how the properties.json should look like
     * used for creating a template and for checking if variables are set
     *
     * @returns {TYPE.Mcdevrc} default properties
     */
    async getDefaultProperties() {
        const configFileName = path.resolve(__dirname, Util.boilerplateDirectory, 'config.json');
        if (!(await File.pathExists(configFileName))) {
            this.logger.debug(`Default config file not found in ${configFileName}`);
            return false;
        }
        const defaultProperties = await File.readJson(configFileName);
        // set default name for parent BU
        defaultProperties.credentials.default.businessUnits[Util.parentBuName] = 0;
        // set default retrieve values
        defaultProperties.metaDataTypes.retrieve = Util.getRetrieveTypeChoices();

        return defaultProperties;
    },
    /**
     *
     * @param {TYPE.Mcdevrc} properties javascript object in .mcdevrc.json
     * @param {TYPE.Mcdevrc} [defaultProps] default properties
     * @param {boolean} [skipCredentialValidation] used by init.config.js>fixMcdevConfig() to auto-fix the config file
     * @returns {Promise.<{missingFields: string[], errorMsgs: string[], solutionSet: Set<string>}>} -
     */
    async getProblems(properties, defaultProps, skipCredentialValidation) {
        defaultProps = defaultProps || (await this.getDefaultProperties());
        const errorMsgs = [];
        const solutionSet = new Set();
        const missingFields = [];
        for (const key in defaultProps) {
            if (Object.prototype.hasOwnProperty.call(defaultProps, key)) {
                if (!Object.prototype.hasOwnProperty.call(properties, key)) {
                    errorMsgs.push(`${key}{} missing`);
                    solutionSet.add(
                        `Run 'mcdev upgrade' to fix missing or changed configuration options`
                    );
                    missingFields.push(key);
                } else {
                    if (!skipCredentialValidation && key === 'credentials') {
                        if (!Object.keys(properties.credentials)) {
                            errorMsgs.push(`no Credential defined`);
                        } else {
                            for (const cred in properties.credentials) {
                                if (cred.includes('/') || cred.includes('\\')) {
                                    errorMsgs.push(
                                        `Credential names may not includes slashes: ${cred}`
                                    );
                                    solutionSet.add('Apply manual fix in your config.');
                                }
                                if (
                                    !properties.credentials[cred].eid ||
                                    properties.credentials[cred].eid === 0
                                ) {
                                    errorMsgs.push(`invalid account_id (EID) on ${cred}`);
                                    solutionSet.add(`Run 'mcdev init ${cred}'`);
                                }
                                let i = 0;
                                for (const buName in properties.credentials[cred].businessUnits) {
                                    if (buName.includes('/') || buName.includes('\\')) {
                                        errorMsgs.push(
                                            `Business Unit names may not includes slashes: ${cred}: ${buName}`
                                        );
                                        solutionSet.add(`Run 'mcdev reloadBUs ${cred}'`);
                                    }
                                    if (
                                        Object.prototype.hasOwnProperty.call(
                                            properties.credentials[cred].businessUnits,
                                            buName
                                        ) &&
                                        properties.credentials[cred].businessUnits[buName] !== 0
                                    ) {
                                        i++;
                                    }
                                }
                                if (!i) {
                                    errorMsgs.push(`no Business Units defined`);
                                    solutionSet.add(`Run 'mcdev reloadBUs ${cred}'`);
                                }
                            }
                        }
                    } else if (['directories', 'metaDataTypes', 'options'].includes(key)) {
                        for (const subkey in defaultProps[key]) {
                            if (
                                Object.prototype.hasOwnProperty.call(defaultProps[key], subkey) &&
                                !Object.prototype.hasOwnProperty.call(properties[key], subkey)
                            ) {
                                errorMsgs.push(
                                    `${key}.${subkey} missing. Default value (${
                                        Array.isArray(defaultProps[key][subkey])
                                            ? 'Array'
                                            : typeof defaultProps[key][subkey]
                                    }): ${defaultProps[key][subkey]}`
                                );
                                solutionSet.add(
                                    `Run 'mcdev upgrade' to fix missing or changed configuration options`
                                );
                                missingFields.push(`${key}.${subkey}`);
                            } else if (subkey === 'deployment') {
                                for (const dkey in defaultProps[key][subkey]) {
                                    if (
                                        Object.prototype.hasOwnProperty.call(
                                            defaultProps[key][subkey],
                                            dkey
                                        ) &&
                                        !Object.prototype.hasOwnProperty.call(
                                            properties[key][subkey],
                                            dkey
                                        )
                                    ) {
                                        errorMsgs.push(
                                            `${key}.${subkey} missing. Default value (${
                                                Array.isArray(defaultProps[key][subkey][dkey])
                                                    ? 'Array'
                                                    : typeof defaultProps[key][subkey][dkey]
                                            }): ${defaultProps[key][subkey][dkey]}`
                                        );
                                        solutionSet.add(
                                            `Run 'mcdev upgrade' to fix missing or changed configuration options`
                                        );
                                        missingFields.push(`${key}.${subkey}.${dkey}`);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        // check if project config version is outdated compared to user's mcdev version
        if (
            !properties.version ||
            (![null, 'patch'].includes(semver.diff(packageJsonMcdev.version, properties.version)) &&
                semver.gt(packageJsonMcdev.version, properties.version))
        ) {
            errorMsgs.push(
                `Your project's config version ${properties.version} is lower than your Accenture SFMC DevTools version ${packageJsonMcdev.version}`
            );
            solutionSet.add(`Run 'mcdev upgrade' to ensure optimal performance`);
            missingFields.push('version');
        }
        return { missingFields, errorMsgs, solutionSet };
    },
};

module.exports = config;
