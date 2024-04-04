import { Util } from './util.js';
import File from './file.js';
import inquirer from 'inquirer';
import semver from 'semver';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
 * Central class for loading and validating properties from config and auth
 */
const config = {
    properties: null,

    /**
     * loads central properties from config file
     *
     * @param {boolean} [silent] omit throwing errors and print messages; assuming not silent if not set
     * @param {boolean} [isInit] don't tell the user to run init
     * @returns {Promise.<Mcdevrc>} central properties object
     */
    async getProperties(silent, isInit) {
        if (config.properties) {
            return config.properties;
        }
        if (await File.pathExists(Util.configFileName)) {
            try {
                config.properties = await File.readJson(Util.configFileName);
            } catch (ex) {
                Util.logger.error(`${ex.code}: ${ex.message}`);
                return;
            }
            if (await File.pathExists(Util.authFileName)) {
                let auth;
                try {
                    auth = await File.readJson(Util.authFileName);
                } catch (ex) {
                    Util.logger.error(`${ex.code}: ${ex.message}`);
                    return;
                }

                if (!auth) {
                    const err = `${Util.authFileName} is not set up correctly.`;
                    Util.logger.error(err);
                    throw new Error(err);
                }
                for (const cred in config.properties.credentials) {
                    if (auth[cred]) {
                        if (
                            config.properties.credentials[cred].eid != auth[cred].account_id &&
                            !silent
                        ) {
                            Util.logger.error(
                                `'${cred}' found in ${Util.configFileName} (${typeof config
                                    .properties.credentials[cred].eid} ${
                                    config.properties.credentials[cred].eid
                                }) and ${Util.authFileName} (${typeof auth[cred].account_id} ${
                                    auth[cred].account_id
                                }) have a Enterprise ID mismatch. Please check.`
                            );
                            return;
                        }
                        // TODO add auth checks #294
                    } else if (!silent) {
                        Util.logger.error(
                            `'${cred}' found in ${Util.configFileName} but not in ${Util.authFileName}. Please run 'mcdev init' to provide the missing credential details.`
                        );
                        return;
                    }
                }
            } else if (!silent && !isInit) {
                Util.logger.error(
                    `${Util.authFileName} not found. Please run 'mcdev init' to provide the missing credential details.`
                );
                return;
            }
        }
        return config.properties;
    },
    /**
     * check if the config file is correctly formatted and has values
     *
     * @param {Mcdevrc} properties javascript object in .mcdevrc.json
     * @param {boolean} [silent] set to true for internal use w/o cli output
     * @returns {Promise.<boolean | string[]>} file structure ok OR list of fields to be fixed
     */
    async checkProperties(properties, silent) {
        if (!(await File.pathExists(Util.configFileName))) {
            Util.logger.error(`Could not find ${Util.configFileName} in ${process.cwd()}.`);
            Util.logger.error(`Run 'mcdev init' to initialize your project.\n`);
            return false;
        }
        if (!(await File.pathExists(Util.authFileName))) {
            Util.logger.error(`Could not find ${Util.authFileName} in ${process.cwd()}.`);
            Util.logger.error(`Run 'mcdev init' to initialize your project.\n`);
            return false;
        }
        if (!properties) {
            // assume there was an error loading the config failed
            return false;
        }

        // check if user is running older (ignores patches) mcdev version than whats saved to the config
        if (properties.version && semver.gt(properties.version, Util.packageJsonMcdev.version)) {
            Util.logger.error(
                `Your Accenture SFMC DevTools version ${Util.packageJsonMcdev.version} is lower than your project's config version ${properties.version}`
            );
            if (Util.skipInteraction) {
                return false;
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
            return false;
        }

        // check config properties
        const defaultProps = await this.getDefaultProperties();
        const errorMsgs = [];
        const solutionSet = new Set();
        const missingFields = [];
        for (const key in defaultProps) {
            if (Object.prototype.hasOwnProperty.call(defaultProps, key)) {
                if (Object.prototype.hasOwnProperty.call(properties, key)) {
                    if (!silent && key === 'credentials') {
                        if (Object.keys(properties.credentials)) {
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
                        } else {
                            errorMsgs.push(`no Credential defined`);
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
                } else {
                    errorMsgs.push(`${key}{} missing`);
                    solutionSet.add(
                        `Run 'mcdev upgrade' to fix missing or changed configuration options`
                    );
                    missingFields.push(key);
                }
            }
        }
        // check if project config version is outdated compared to user's mcdev version
        if (
            !properties.version ||
            (![null, 'patch'].includes(
                semver.diff(Util.packageJsonMcdev.version, properties.version)
            ) &&
                semver.gt(Util.packageJsonMcdev.version, properties.version))
        ) {
            errorMsgs.push(
                `Your project's config version ${properties.version} is lower than your Accenture SFMC DevTools version ${Util.packageJsonMcdev.version}`
            );
            solutionSet.add(`Run 'mcdev upgrade' to ensure optimal performance`);
            missingFields.push('version');
        }
        if (silent) {
            return missingFields;
        } else {
            if (errorMsgs.length) {
                const errorMsgOutput = [
                    `Found problems in your ./${Util.configFileName} that you need to fix first:`,
                ];
                for (const msg of errorMsgs) {
                    errorMsgOutput.push(' - ' + msg);
                }
                Util.logger.error(errorMsgOutput.join('\n'));
                if (Util.skipInteraction) {
                    return false;
                }
                Util.logger.info(
                    [
                        'Here is what you can do to fix these issues:',
                        ...Array.from(solutionSet),
                    ].join('\n- ')
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
                    Util.execSync('mcdev', ['upgrade']);
                }
                return false;
            } else {
                return true;
            }
        }
    },
    /**
     * defines how the properties.json should look like
     * used for creating a template and for checking if variables are set
     *
     * @returns {Promise.<Mcdevrc>} default properties
     */
    async getDefaultProperties() {
        const configFileName = path.resolve(__dirname, Util.boilerplateDirectory, 'config.json');
        if (!(await File.pathExists(configFileName))) {
            Util.logger.debug(`Default config file not found in ${configFileName}`);
            return;
        }
        // const defaultProperties = File.readJsonSync(configFileName);
        const defaultProperties = await File.readJson(configFileName);
        // set default name for parent BU
        defaultProperties.credentials.default.businessUnits[Util.parentBuName] = 0;
        // set default retrieve values
        defaultProperties.metaDataTypes.retrieve = Util.getRetrieveTypeChoices();

        return defaultProperties;
    },
};
export default config;
