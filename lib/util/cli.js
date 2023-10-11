'use strict';

import TYPE from '../../types/mcdev.d.js';
import BuHelper from './businessUnit.js';
import File from './file.js';
import config from './config.js';
import inquirer from 'inquirer';
import MetadataDefinitions from './../MetadataTypeDefinitions.js';
import { Util } from './util.js';
import auth from './auth.js';
import 'console.table';
import MetadataTypeInfo from './../MetadataTypeInfo.js';
import TransactionalMessage from './../metadataTypes/TransactionalMessage.js';

/**
 * CLI helper class
 */

const Cli = {
    /**
     * used when initially setting up a project.
     * loads default config and adds first credential
     *
     * @returns {Promise.<boolean>} success of init
     */
    async initMcdevConfig() {
        Util.logger.info('-- Initialising server connection --');
        Util.logger.info('Please enter a name for your "Installed Package" credentials:');
        const propertiesTemplate = await config.getDefaultProperties();
        delete propertiesTemplate.credentials.default;

        // wait for the interaction to finish or else an outer await will run before this is done
        return this._setCredential(propertiesTemplate, null);
    },
    /**
     * Extends template file for properties.json
     *
     * @param {TYPE.Mcdevrc} properties config file's json
     * @returns {Promise.<boolean | string>} status
     */
    async addExtraCredential(properties) {
        const skipInteraction = Util.skipInteraction;
        if (await config.checkProperties(properties)) {
            this.logExistingCredentials(properties);
            Util.logger.info('\nPlease enter your new credentials');
            if (skipInteraction && properties.credentials[skipInteraction.credentialName]) {
                Util.logger.error(
                    `Credential '${skipInteraction.credentialName}' already existing. If you tried updating please provide run 'mcdev init ${skipInteraction.credentialName}'`
                );
                return null;
            }
            return this._setCredential(properties, null);
        } else {
            // return null here to avoid seeing 2 error messages for the same issue
            return null;
        }
    },
    /**
     * interactive helper to set automation run completion/error note
     *
     * @param {TYPE.SupportedMetadataTypes} noteType note type (error/completion)
     * @returns {Promise.<string[]>} responses
     */
    async updateNotificationEmails(noteType) {
        const questions = [];
        questions.push(
            {
                type: 'confirm',
                name: 'provideEmail',
                message: `To set run ${noteType} note, an email address should be set. Do you want to set it?`,
                default: false,
            },
            {
                type: 'input',
                name: 'updateNotificationNotes',
                message: `Please enter email addresses separated by a comma:`,
                // eslint-disable-next-line jsdoc/require-jsdoc
                filter: function (emails) {
                    return emails
                        .split(',')
                        .map((email) => {
                            if (!Util.emailValidator(email)) {
                                Util.logger.info(` ☇ skipping ${email}' - invalid email address`);
                            }
                            return email.trim();
                        })
                        .filter((email) => Util.emailValidator(email));
                },
            }
        );
        try {
            if (!(await inquirer.prompt(questions[0])).provideEmail) {
                return;
            }
            return (await inquirer.prompt(questions[1])).updateNotificationNotes;
        } catch (ex) {
            Util.logger.info(ex);
        }
    },
    /**
     *
     * @param {TYPE.SupportedMetadataTypes} type limit execution to given metadata type
     * @param {TYPE.SupportedMetadataTypes[]} dependentTypes types that depent on type
     * @returns {Promise.<boolean>} true if user wants to continue with retrieve
     */
    async postFixKeysReretrieve(type, dependentTypes) {
        if (Util.isTrue(Util.skipInteraction?.fixKeysReretrieve)) {
            return true;
        } else if (Util.isFalse(Util.skipInteraction?.fixKeysReretrieve)) {
            return false;
        } else {
            const now = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'fixKeysReretrieve',
                    message: `Do you want to re-retrieve dependent types (${dependentTypes.join(
                        ', '
                    )}) now?`,
                    default: true,
                },
            ]);
            if (Util.OPTIONS._multiBuExecution) {
                const remember = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'rememberFixKeysReretrieve',
                        message: `Remember answer for other BUs?`,
                        default: true,
                    },
                ]);
                if (remember.rememberFixKeysReretrieve) {
                    Util.skipInteraction ||= {};
                    Util.skipInteraction.fixKeysReretrieve = now.fixKeysReretrieve;
                }
            }
            return now.fixKeysReretrieve;
        }
    },
    /**
     * helper that logs to cli which credentials are already existing in our config file
     *
     * @param {TYPE.Mcdevrc} properties config file's json
     * @returns {void}
     */
    logExistingCredentials(properties) {
        Util.logger.info('Found the following credentials in your config file:');
        for (const cred in properties.credentials) {
            if (Object.prototype.hasOwnProperty.call(properties.credentials, cred)) {
                Util.logger.info(` - ${cred}`);
            }
        }
    },
    /**
     * Extends template file for properties.json
     * update credentials
     *
     * @param {TYPE.Mcdevrc} properties config file's json
     * @param {string} credName name of credential that needs updating
     * @returns {Promise.<boolean>} success of update
     */
    async updateCredential(properties, credName) {
        const skipInteraction = Util.skipInteraction;
        if (credName) {
            if (!skipInteraction) {
                Util.logger.info(`Please enter the details for '${credName}'`);
            }
            return await this._setCredential(properties, credName);
        }
    },
    /**
     * Returns Object with parameters required for accessing API
     *
     * @param {TYPE.Mcdevrc} properties object of all configuration including credentials
     * @param {string} target code of BU to use
     * @param {boolean|string} [isCredentialOnly] true:don't ask for BU | string: name of BU
     * @param {boolean} [allowAll] Offer ALL as option in BU selection
     * @returns {Promise.<TYPE.BuObject>} credential to be used for Business Unit
     */
    async getCredentialObject(properties, target, isCredentialOnly, allowAll) {
        try {
            if (!(await config.checkProperties(properties))) {
                // return null here to avoid seeing 2 error messages for the same issue
                return null;
            }
            let [credential, businessUnit] = target ? target.split('/') : [null, null];
            if (
                credential &&
                properties.credentials[credential] &&
                !businessUnit &&
                'string' === typeof isCredentialOnly
            ) {
                // correct credential provided and BU pre-selected
                businessUnit = isCredentialOnly;
            } else if (!credential || !properties.credentials[credential]) {
                // no or unknown credential provided; BU either to be selected or pre-selected
                if (credential !== null) {
                    Util.logger.warn(`Credential '${credential}' not found`);
                }
                const response = await this._selectBU(properties, null, isCredentialOnly, allowAll);
                credential = response.credential;
                businessUnit = response.businessUnit;
                if (!isCredentialOnly) {
                    Util.logger.info(
                        `You could directly pass in this info with '${credential}/${businessUnit}'`
                    );
                } else if (credential && !businessUnit && 'string' === typeof isCredentialOnly) {
                    // BU pre-selected
                    businessUnit = isCredentialOnly;
                }
            } else if (
                !isCredentialOnly &&
                (!businessUnit || !properties.credentials[credential].businessUnits[businessUnit])
            ) {
                // correct credential provided but BU still needed
                if (businessUnit && businessUnit !== 'undefined') {
                    Util.logger.warn(
                        `Business Unit '${businessUnit}' not found for credential '${credential}'`
                    );
                }
                const response = await this._selectBU(properties, credential, null, allowAll);
                businessUnit = response.businessUnit;
                Util.logger.info(
                    `You could directly pass in this info with '${credential}/${businessUnit}'`
                );
            }
            return {
                eid: properties.credentials[credential].eid,
                mid: properties.credentials[credential].businessUnits[businessUnit],
                businessUnit: businessUnit,
                credential: credential,
            };
        } catch (ex) {
            Util.logger.error(ex.message);
            return null;
        }
    },
    /**
     * helps select the right credential in case of bad initial input
     *
     * @param {TYPE.Mcdevrc} properties config file's json
     * @param {string} [credential] name of valid credential
     * @param {boolean} [isCredentialOnly] don't ask for BU if true
     * @param {boolean} [allowAll] Offer ALL as option in BU selection
     * @returns {Promise.<Array>} selected credential/BU combo
     */
    async _selectBU(properties, credential, isCredentialOnly, allowAll) {
        const credList = [];
        const buList = [];
        const questions = [];
        const allBUsAnswer = '* (All BUs)';
        // no proper credential nor BU was given. ask for credential first
        if (!credential) {
            for (const cred in properties.credentials) {
                if (Object.keys(properties.credentials[cred].businessUnits).length) {
                    // only add credentials that have BUs
                    credList.push(cred);
                }
            }
            questions.push({
                type: 'list',
                name: 'credential',
                message: 'Please select the credential you were looking for:',
                choices: credList,
                // eslint-disable-next-line jsdoc/require-jsdoc
                filter: function (answer) {
                    if (!isCredentialOnly) {
                        for (const bu in properties.credentials[answer].businessUnits) {
                            buList.push(bu);
                        }
                        if (!buList.length) {
                            // unlikely error as we are filtering for this already while creating credList
                            throw new Error('No Business Unit defined for this credential');
                        } else if (allowAll) {
                            // add ALL option to beginning of list
                            buList.unshift(allBUsAnswer);
                        }
                    }
                    return answer;
                },
            });
        } else if (credential) {
            for (const bu in properties.credentials[credential].businessUnits) {
                buList.push(bu);
            }
            if (!buList.length) {
                // that could only happen if config is faulty
                throw new Error('No Business Unit defined for this credential');
            } else if (allowAll) {
                // add ALL option to beginning of list
                buList.unshift(allBUsAnswer);
            }
        }
        if ((credential && buList.length) || (!credential && !isCredentialOnly)) {
            questions.push({
                type: 'list',
                name: 'businessUnit',
                message: 'Please select the right BU:',
                choices: buList,
            });
        }
        let responses = null;
        if (questions.length) {
            try {
                responses = await inquirer.prompt(questions);
            } catch (ex) {
                Util.logger.info(ex);
            }
            if (responses.businessUnit && responses.businessUnit === allBUsAnswer) {
                // remove textual explanation of *
                responses.businessUnit = '*';
            }
        } else {
            throw new Error('credentials / BUs not configured');
        }
        return responses;
    },
    /**
     * helper around _askCredentials
     *
     * @param {TYPE.Mcdevrc} properties from config file
     * @param {string} [credName] name of credential that needs updating
     * @returns {Promise.<boolean | string>} success of refresh or credential name
     */
    async _setCredential(properties, credName) {
        const skipInteraction = Util.skipInteraction;
        // Get user input
        let credentialsGood = null;
        let inputData;
        do {
            if (skipInteraction) {
                if (
                    skipInteraction.client_id &&
                    skipInteraction.client_secret &&
                    skipInteraction.auth_url &&
                    skipInteraction.account_id &&
                    skipInteraction.credentialName
                ) {
                    // assume skipInteraction=={client_id,client_secret,auth_url,credentialName}
                    inputData = skipInteraction;
                } else {
                    throw new Error(
                        '--skipInteraction flag found but not defined for all required inputs: client_id,client_secret,auth_url,account_id,credentialName'
                    );
                }
            } else {
                inputData = await this._askCredentials(properties, credName);
            }

            // test if credentials are valid
            try {
                await auth.saveCredential(
                    {
                        client_id: inputData.client_id,
                        client_secret: inputData.client_secret,
                        auth_url: inputData.auth_url,
                        account_id: Number.parseInt(inputData.account_id),
                    },
                    inputData.credentialName
                );
                credentialsGood = true;
                // update central config now that the credentials are verified
                properties.credentials[inputData.credentialName] = {
                    eid: Number.parseInt(inputData.account_id),
                    businessUnits: {},
                };
            } catch (ex) {
                Util.logger.error(
                    `We could not verify your credential due to a problem (${ex.message}). Please try again.`
                );
                credentialsGood = false;
                if (skipInteraction) {
                    // break the otherwise infinite loop
                    return;
                }
            }
        } while (!credentialsGood);
        // Get all business units and add them to the properties
        const status = await BuHelper.refreshBUProperties(properties, inputData.credentialName);
        return status ? inputData.credentialName : status;
    },

    /**
     * helper for {@link Cli.addExtraCredential}
     *
     * @param {TYPE.Mcdevrc} properties from config file
     * @param {string} [credName] name of credential that needs updating
     * @returns {Promise.<object>} credential info
     */
    async _askCredentials(properties, credName) {
        const questions = [];
        if (!credName) {
            questions.push({
                type: 'input',
                name: 'credentialName',
                message: 'Credential name (your choice)',
                // eslint-disable-next-line jsdoc/require-jsdoc
                validate: function (value) {
                    if (!value || value.trim().length < 2) {
                        return 'Please enter at least 2 characters';
                    }
                    if (properties && properties.credentials[value]) {
                        return `There already is an account with the name '${value}' in your config.`;
                    }
                    const converted = encodeURIComponent(value).replaceAll(/[*]/g, '_STAR_');
                    if (value != converted) {
                        return 'Please do not use any special chars';
                    }
                    return true;
                },
            });
        }
        const tenantRegex =
            /^https:\/\/([\w-]{28})\.(auth|soap|rest)\.marketingcloudapis\.com[/]?$/iu;
        questions.push(
            {
                type: 'input',
                name: 'client_id',
                message: 'Client Id',
                // eslint-disable-next-line jsdoc/require-jsdoc
                validate: function (value) {
                    if (!value || value.trim().length < 10) {
                        return 'Please enter valid client id';
                    }
                    return true;
                },
            },
            {
                type: 'input',
                name: 'client_secret',
                message: 'Client Secret',
                // eslint-disable-next-line jsdoc/require-jsdoc
                validate: function (value) {
                    if (!value || value.trim().length < 10) {
                        return 'Please enter valid client secret';
                    }
                    return true;
                },
            },
            {
                type: 'input',
                name: 'auth_url',
                message: 'Authentication Base URI',
                validate: (value) => {
                    if (!value || value.trim().length < 10) {
                        return 'Please enter a valid tenant identifier';
                    } else if (tenantRegex.test(value.trim())) {
                        // all good
                        return true;
                    } else {
                        return `Please copy the URI directly from the installed package's "API Integration" section. It looks like this: https://a1b2b3xy56z.auth.marketingcloudapis.com/`;
                    }
                },
            },
            {
                type: 'number',
                name: 'account_id',
                message: 'MID of Parent Business Unit',
            }
        );
        const responses = await inquirer.prompt(questions);
        // remove extra white space
        responses.client_id = responses.client_id.trim();
        responses.client_secret = responses.client_secret.trim();
        responses.auth_url = responses.auth_url.trim();

        if (credName) {
            // if credential name was provided as parameter, we didn't ask the user for it
            responses.credentialName = credName;
        }

        return responses;
    },
    /**
     * allows updating the metadata types that shall be retrieved
     *
     * @param {TYPE.Mcdevrc} properties config file's json
     * @param {string[]} [setTypesArr] skip user prompt and overwrite with this list if given
     * @returns {Promise.<void>} -
     */
    async selectTypes(properties, setTypesArr) {
        let responses;
        if (setTypesArr) {
            responses = {
                selectedTypes: setTypesArr,
            };
        } else {
            if (Util.logger.level === 'debug') {
                Util.logger.warn(
                    'Debug mode enabled. Allowing selection of "disabled" types. Please be aware that these might be unstable.'
                );
            } else {
                Util.logger.info(
                    'Run mcdev selectTypes --debug if you need to use "disabled" types.'
                );
            }
            const flattenedDefinitions = [];
            for (const el in MetadataDefinitions) {
                // if subtypes on metadata (eg. Assets) then add each nested subtype
                if (
                    MetadataDefinitions[el].subTypes &&
                    Array.isArray(MetadataDefinitions[el].typeRetrieveByDefault)
                ) {
                    for (const subtype of MetadataDefinitions[el].subTypes) {
                        flattenedDefinitions.push({
                            typeName:
                                MetadataDefinitions[el].typeName.replace('-[Subtype]', ': ') +
                                subtype,
                            type: MetadataDefinitions[el].type + '-' + subtype,
                            mainType: MetadataDefinitions[el].type,
                            typeRetrieveByDefault:
                                MetadataDefinitions[el].typeRetrieveByDefault.includes(subtype),
                        });
                    }
                }
                // else just return normal type
                else {
                    flattenedDefinitions.push({
                        typeName: MetadataDefinitions[el].typeName,
                        type: MetadataDefinitions[el].type,
                        typeRetrieveByDefault: MetadataDefinitions[el].typeRetrieveByDefault,
                    });
                }
            }
            // walk through all definitions (sub and main) and select them if already selected
            const typeChoices = flattenedDefinitions.map((def) => ({
                name:
                    def.typeName +
                    (Util.logger.level === 'debug' && !def.typeRetrieveByDefault
                        ? ' \x1B[1;30;40m(non-default)\u001B[0m'
                        : ''),
                value: def.type,
                disabled:
                    Util.logger.level === 'debug' || def.typeRetrieveByDefault ? false : 'disabled',
                // subtypes can be activated through their main type
                checked:
                    properties.metaDataTypes.retrieve.includes(def.type) ||
                    (properties.metaDataTypes.retrieve.includes(def.mainType) &&
                        def.typeRetrieveByDefault)
                        ? true
                        : false,
            }));

            // sort types by 1) initially selected and 2) alphabetically
            typeChoices.sort((a, b) => {
                if (a.name && b.name && a.name.toLowerCase() < b.name.toLowerCase()) {
                    return -1;
                }
                if (a.name && b.name && a.name.toLowerCase() > b.name.toLowerCase()) {
                    return 1;
                }
                if (a.value.toLowerCase() < b.value.toLowerCase()) {
                    return -1;
                }
                if (a.value.toLowerCase() > b.value.toLowerCase()) {
                    return 1;
                }
                return 0;
            });
            // add end-of-list marker
            typeChoices.push(new inquirer.Separator(' ==== '));
            responses = await inquirer.prompt([
                {
                    type: 'checkbox',
                    message: 'Select Metadata types for retrieval',
                    name: 'selectedTypes',
                    pageSize: 10,
                    choices: typeChoices,
                },
            ]);
        }

        if (responses.selectedTypes) {
            this._summarizeSubtypes(responses, 'asset');
            // update config
            properties.metaDataTypes.retrieve = responses.selectedTypes;
            await File.saveConfigFile(properties);
        }
    },
    /**
     * helper for {@link Cli.selectTypes} that converts subtypes back to main type if all and only defaults were selected
     * this keeps the config automatically upgradable when we add new subtypes or change what is selected by default
     *
     * @param {object} responses wrapper object for respones
     * @param {string[]} responses.selectedTypes what types the user selected
     * @param {string} type metadata type
     * @returns {void}
     */
    _summarizeSubtypes(responses, type) {
        const selectedAssetSubtypes = responses.selectedTypes.filter((str) =>
            str.includes(type + '-')
        );
        if (
            selectedAssetSubtypes.length === MetadataDefinitions[type].typeRetrieveByDefault.length
        ) {
            const nonDefaultSelectedAssetSubtypes = selectedAssetSubtypes
                .map((subtype) => subtype.replace(type + '-', ''))
                .filter(
                    (subtype) => !MetadataDefinitions[type].typeRetrieveByDefault.includes(subtype)
                );
            if (!nonDefaultSelectedAssetSubtypes.length) {
                // found all defaults and nothing else. replace with main type
                responses.selectedTypes = responses.selectedTypes.filter(
                    (str) => !str.includes(type + '-')
                );

                responses.selectedTypes.push(type);
                responses.selectedTypes.sort();
            }
        }
    },

    /**
     * shows metadata type descriptions
     *
     * @returns {object[]} list of supported types with their apiNames
     */
    explainTypes() {
        const json = [];
        const apiNameArr = Object.keys(MetadataDefinitions);

        for (const apiName of apiNameArr) {
            const details = MetadataDefinitions[apiName];
            const supportCheckClass = apiName.startsWith('transactional')
                ? TransactionalMessage
                : MetadataTypeInfo[apiName];
            json.push({
                name: details.typeName,
                apiName: details.type,
                retrieveByDefault: details.typeRetrieveByDefault,
                supports: {
                    retrieve: Object.prototype.hasOwnProperty.call(supportCheckClass, 'retrieve'),
                    create: Object.prototype.hasOwnProperty.call(supportCheckClass, 'create'),
                    update: Object.prototype.hasOwnProperty.call(supportCheckClass, 'update'),
                    delete: Object.prototype.hasOwnProperty.call(supportCheckClass, 'deleteByKey'),
                    changeKey:
                        supportCheckClass.definition.keyIsFixed === false &&
                        supportCheckClass.definition.keyField !==
                            supportCheckClass.definition.idField &&
                        supportCheckClass.definition.fields[supportCheckClass.definition.keyField]
                            .isUpdateable &&
                        Object.prototype.hasOwnProperty.call(supportCheckClass, 'update'),
                    buildTemplate: Object.prototype.hasOwnProperty.call(
                        supportCheckClass,
                        'create'
                    ), // supported for all types that can be created
                    retrieveAsTemplate: Object.prototype.hasOwnProperty.call(
                        supportCheckClass,
                        'retrieveAsTemplate'
                    ),
                },
                description: details.typeDescription,
            });
        }
        if (Util.OPTIONS.json) {
            if (Util.OPTIONS.loggerLevel !== 'error') {
                console.log(JSON.stringify(json, null, 2)); // eslint-disable-line no-console
            }
            return json;
        }

        const typeChoices = [];
        for (const el in MetadataDefinitions) {
            if (MetadataDefinitions[el].subTypes && MetadataDefinitions[el].extendedSubTypes) {
                // used for assets to show whats available by default
                typeChoices.push({
                    Name: MetadataDefinitions[el].typeName,
                    Default: '┐',
                    Description: MetadataDefinitions[el].typeDescription,
                });
                let lastCountdown = MetadataDefinitions[el].subTypes.length;
                for (const subtype of MetadataDefinitions[el].subTypes) {
                    lastCountdown--;
                    const subTypeRetrieveByDefault =
                        Array.isArray(MetadataDefinitions[el].typeRetrieveByDefault) &&
                        MetadataDefinitions[el].typeRetrieveByDefault.includes(subtype);

                    const definition =
                        '  ' + MetadataDefinitions[el].extendedSubTypes?.[subtype]?.join(', ');
                    typeChoices.push({
                        Name:
                            MetadataDefinitions[el].typeName.replace('-[Subtype]', ': ') + subtype,
                        Default:
                            (lastCountdown > 0 ? '├ ' : '└ ') +
                            (subTypeRetrieveByDefault ? 'yes' : '-'),
                        Description:
                            definition.length > 90 ? definition.slice(0, 90) + '...' : definition,
                    });
                }
                // change leading symbol of last subtype to close the tree visually
            } else {
                // types without subtypes
                typeChoices.push({
                    Name: MetadataDefinitions[el].typeName,
                    Default: MetadataDefinitions[el].typeRetrieveByDefault ? 'yes' : '-',
                    Description: MetadataDefinitions[el].typeDescription,
                });
            }
        }
        typeChoices.sort((a, b) => {
            if (a.Name.toLowerCase() < b.Name.toLowerCase()) {
                return -1;
            }
            if (a.Name.toLowerCase() > b.Name.toLowerCase()) {
                return 1;
            }
            return 0;
        });
        if (Util.OPTIONS.loggerLevel !== 'error') {
            console.table(typeChoices); // eslint-disable-line no-console
        }
        return json;
    },
};

export default Cli;
