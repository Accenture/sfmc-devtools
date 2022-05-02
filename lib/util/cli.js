'use strict';

const BuHelper = require('./businessUnit');
const File = require('./file');
const inquirer = require('inquirer');
const MetadataDefinitions = require('./../MetadataTypeDefinitions');
const Util = require('./util');

/**
 * CLI helper class
 */

const Cli = {
    /**
     * used when initially setting up a project.
     * loads default config and adds first credential
     *
     * @param {object} [skipInteraction] signals what to insert automatically for things usually asked via wizard
     * @param {string} skipInteraction.clientId client id of installed package
     * @param {string} skipInteraction.clientSecret client secret of installed package
     * @param {string} skipInteraction.tenant tenant of installed package
     * @param {string} skipInteraction.eid MID of the Parent Business Unit
     * @param {string} skipInteraction.credentialsName how you would like the credential to be named
     * @returns {Promise<boolean>} success of init
     */
    async initMcdevConfig(skipInteraction) {
        Util.logger.info('-- Initialising server connection --');
        Util.logger.info('Please enter a name for your "Installed Package" credentials:');
        const propertiesTemplate = Util.getDefaultProperties();
        delete propertiesTemplate.credentials.default;

        // wait for the interaction to finish or else an outer await will run before this is done
        return this._setCredential(propertiesTemplate, null, skipInteraction);
    },
    /**
     * Extends template file for properties.json
     *
     * @param {object} properties config file's json
     * @param {object} properties.credentials list of existing credentials
     * @param {object} [skipInteraction] signals what to insert automatically for things usually asked via wizard
     * @param {string} skipInteraction.clientId client id of installed package
     * @param {string} skipInteraction.clientSecret client secret of installed package
     * @param {string} skipInteraction.tenant tenant of installed package
     * @param {string} skipInteraction.eid MID of the Parent Business Unit
     * @param {string} skipInteraction.credentialsName how you would like the credential to be named
     * @returns {Promise<void>} -
     */
    async addExtraCredential(properties, skipInteraction) {
        if (!(await Util.checkProperties(properties))) {
            // return null here to avoid seeing 2 error messages for the same issue
            return null;
        } else {
            Util.logger.info('Found the following credentials in your config file:');
            for (const cred in properties.credentials) {
                if (Object.prototype.hasOwnProperty.call(properties.credentials, cred)) {
                    Util.logger.info(` - ${cred}`);
                }
            }
            Util.logger.info('\nPlease enter your new credentials');
            if (skipInteraction && properties.credentials[skipInteraction.credentialsName]) {
                Util.logger.error(
                    `Credential '${skipInteraction.credentialsName}' already existing. If you tried updating please provide run 'mcdev init ${skipInteraction.credentialsName}'`
                );
            }
            return this._setCredential(properties, null, skipInteraction);
        }
    },
    /**
     * Extends template file for properties.json
     * update credentials
     *
     * @param {object} properties config file's json
     * @param {string} credName name of credential that needs updating
     * @param {object} [skipInteraction] signals what to insert automatically for things usually asked via wizard
     * @param {string} skipInteraction.clientId client id of installed package
     * @param {string} skipInteraction.clientSecret client secret of installed package
     * @param {string} skipInteraction.tenant tenant of installed package
     * @param {string} skipInteraction.eid MID of the Parent Business Unit
     * @param {string} skipInteraction.credentialsName how you would like the credential to be named
     * @returns {Promise<boolean>} success of update
     */
    async updateCredential(properties, credName, skipInteraction) {
        if (credName) {
            if (!skipInteraction) {
                Util.logger.info(`Please enter the details for '${credName}'`);
            }
            return await this._setCredential(properties, credName, skipInteraction);
        }
    },
    /**
     * Returns Object with parameters required for accessing API
     *
     * @param {object} properties object of all configuration including credentials
     * @param {string} target code of BU to use
     * @param {boolean|string} [isCredentialOnly] true:don't ask for BU | string: name of BU
     * @param {boolean} [allowAll] Offer ALL as option in BU selection
     * @returns {Promise<BuObject>} credential to be used for Business Unit
     */
    async getCredentialObject(properties, target, isCredentialOnly, allowAll) {
        try {
            if (!(await Util.checkProperties(properties))) {
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
                clientId: properties.credentials[credential].clientId,
                clientSecret: properties.credentials[credential].clientSecret,
                tenant: properties.credentials[credential].tenant,
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
     * @param {object} properties config file's json
     * @param {string} [credential] name of valid credential
     * @param {boolean} [isCredentialOnly] don't ask for BU if true
     * @param {boolean} [allowAll] Offer ALL as option in BU selection
     * @returns {Promise<Array>} selected credential/BU combo
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
                // eslint-disable-next-line require-jsdoc
                /**
                 *
                 * @param answer
                 */
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
            } catch (e) {
                Util.logger.info(e);
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
     * @param {object} properties from config file
     * @param {string} [credName] name of credential that needs updating
     * @param {object} [skipInteraction] signals what to insert automatically for things usually asked via wizard
     * @param {string} skipInteraction.clientId client id of installed package
     * @param {string} skipInteraction.clientSecret client id of installed package
     * @param {string} skipInteraction.tenant client id of installed package
     * @param {string} skipInteraction.credentialsName how you would like the credential to be named
     * @returns {Promise<boolean | string>} success of refresh or credential name
     */
    async _setCredential(properties, credName, skipInteraction) {
        // Get user input
        let credentialsGood = null;
        let inputData;
        do {
            if (skipInteraction) {
                if (
                    skipInteraction.clientId &&
                    skipInteraction.clientSecret &&
                    skipInteraction.tenant &&
                    skipInteraction.eid &&
                    skipInteraction.credentialsName
                ) {
                    // assume skipInteraction=={clientId,clientSecret,tenant,credentialsName}
                    inputData = skipInteraction;
                } else {
                    throw new Error(
                        '--skipInteraction flag found but missing required input for clientId,clientSecret,tenant,eid,credentialsName'
                    );
                }
            } else {
                inputData = await this._askCredentials(properties, credName);
            }
            // Replace defaults with user input
            const buObject = {
                clientId: inputData.clientId,
                clientSecret: inputData.clientSecret,
                tenant: inputData.tenant,
                mid: parseInt(inputData.eid),
                businessUnits: null,
            };

            // test if credentials are valid
            try {
                await Util.getETClient(buObject);
                credentialsGood = true;

                // update central config now that the credentials are verified
                properties.credentials[inputData.credentialsName] = buObject;
            } catch (ex) {
                Util.logger.error(ex.message);
                credentialsGood = false;
                if (skipInteraction) {
                    // break the otherwise infinite loop
                    return;
                }
            }
        } while (!credentialsGood);
        // Get all business units and add them to the properties
        const status = await BuHelper.refreshBUProperties(properties, inputData.credentialsName);
        return status ? inputData.credentialsName : status;
    },

    /**
     * helper for addExtraCredential()
     *
     * @param {object} properties from config file
     * @param {string} [credName] name of credential that needs updating
     * @returns {Promise<object>} credential info
     */
    async _askCredentials(properties, credName) {
        const questions = [];
        if (!credName) {
            questions.push({
                type: 'input',
                name: 'credentialsName',
                message: 'Credential name (your choice)',
                // eslint-disable-next-line require-jsdoc
                /**
                 *
                 * @param value
                 */
                validate: function (value) {
                    if (!value || value.trim().length < 2) {
                        return 'Please enter at least 2 characters';
                    }
                    if (properties && properties.credentials[value]) {
                        return `There already is an account with the name '${value}' in your config.`;
                    }
                    const converted = encodeURIComponent(value).replace(/[*]/g, '_STAR_');
                    if (value != converted) {
                        return 'Please do not use any special chars';
                    }
                    return true;
                },
            });
        }
        const tenantRegex = /^https:\/\/([\w-]*)\.(auth|soap|rest)\.marketingcloudapis\.com[/]?$/iu;
        questions.push(
            {
                type: 'input',
                name: 'clientId',
                message: 'Client Id',
                // eslint-disable-next-line require-jsdoc
                /**
                 *
                 * @param value
                 */
                validate: function (value) {
                    if (!value || value.trim().length < 10) {
                        return 'Please enter valid client id';
                    }
                    return true;
                },
            },
            {
                type: 'input',
                name: 'clientSecret',
                message: 'Client Secret',
                // eslint-disable-next-line require-jsdoc
                /**
                 *
                 * @param value
                 */
                validate: function (value) {
                    if (!value || value.trim().length < 10) {
                        return 'Please enter valid client secret';
                    }
                    return true;
                },
            },
            {
                type: 'input',
                name: 'tenant',
                message: 'Authentication Base URI',
                validate: (value) => {
                    if (!value || value.trim().length < 10) {
                        return 'Please enter a valid tenant identifier';
                    } else if (!tenantRegex.test(value.trim())) {
                        return `Please copy the URI directly from the installed package's "API Integration" section. It looks like this: https://a1b2b3xy56z.auth.marketingcloudapis.com/`;
                    } else {
                        // all good
                        return true;
                    }
                },
            },
            {
                type: 'input',
                name: 'eid',
                message: 'MID of Parent Business Unit',
                validate: (value) => {
                    if (!value || !Number.isInteger(value)) {
                        return 'Please enter a valid EID';
                    } else {
                        // all good
                        return true;
                    }
                },
            }
        );
        const responses = await inquirer.prompt(questions);
        // remove extra white space
        responses.clientId = responses.clientId.trim();
        responses.clientSecret = responses.clientSecret.trim();
        responses.tenant = responses.tenant.trim();
        responses.eid = responses.eid.trim();

        // extract the tenant sub-domain from the URI; the format was already validated above
        responses.tenant = responses.tenant.match(tenantRegex)[1];

        if (credName) {
            // if credential name was provided as parameter, we didn't ask the user for it
            responses.credentialsName = credName;
        }

        return responses;
    },
    /**
     * allows updating the metadata types that shall be retrieved
     *
     * @param {object} properties config file's json
     * @param {object} properties.metaDataTypes -
     * @param {string[]} properties.metaDataTypes.retrieve list of currently retrieved types
     * @param {string[]} [setTypesArr] skip user prompt and overwrite with this list if given
     * @returns {Promise<void>} -
     */
    async selectTypes(properties, setTypesArr) {
        let responses;
        if (!setTypesArr) {
            if (Util.logger.level !== 'debug') {
                Util.logger.info(
                    'Run mcdev selectTypes --debug if you need to use "disabled" types.'
                );
            } else {
                Util.logger.warn(
                    'Debug mode enabled. Allowing selection of "disabled" types. Please be aware that these might be unstable.'
                );
            }
            const flattenedDefinitions = [];
            for (const el in MetadataDefinitions) {
                // if subtypes on metadata (eg. Assets) then add each nested subtype
                if (MetadataDefinitions[el].subTypes) {
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
                        ? ' \x1b[1;30;40m(non-default)\u001b[0m'
                        : ''),
                value: def.type,
                disabled: !(Util.logger.level === 'debug' || def.typeRetrieveByDefault)
                    ? 'disabled'
                    : false,
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
        } else {
            responses = {
                selectedTypes: setTypesArr,
            };
        }

        if (responses.selectedTypes) {
            this._summarizeSubtypes(responses, 'asset');
            // update config
            properties.metaDataTypes.retrieve = responses.selectedTypes;
            await File.saveConfigFile(properties);
        }
    },
    /**
     * helper for this.selectTypes() that converts subtypes back to main type if all and only defaults were selected
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
     * @returns {void} -
     */
    explainTypes() {
        // overwrites default layout of console.table
        require('console.table');

        const typeChoices = [];
        for (const el in MetadataDefinitions) {
            if (MetadataDefinitions[el].subTypes) {
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
                        MetadataDefinitions[el].typeRetrieveByDefault.includes(subtype);
                    const definition =
                        '  ' + MetadataDefinitions[el].extendedSubTypes[subtype].join(', ');
                    typeChoices.push({
                        Name:
                            MetadataDefinitions[el].typeName.replace('-[Subtype]', ': ') + subtype,
                        Default:
                            (lastCountdown > 0 ? '├ ' : '└ ') +
                            (subTypeRetrieveByDefault ? 'yes' : '-'),
                        Description:
                            definition.length > 90 ? definition.substr(0, 90) + '...' : definition,
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
        console.table(typeChoices);
    },
};

module.exports = Cli;
