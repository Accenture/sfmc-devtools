'use strict';

import MetadataType from './MetadataType.js';
import { Util } from '../util/util.js';
import File from '../util/file.js';
import cache from '../util/cache.js';

/**
 * @typedef {import('../../types/mcdev.d.js').BuObject} BuObject
 * @typedef {import('../../types/mcdev.d.js').CodeExtract} CodeExtract
 * @typedef {import('../../types/mcdev.d.js').CodeExtractItem} CodeExtractItem
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItem} MetadataTypeItem
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItemDiff} MetadataTypeItemDiff
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItemObj} MetadataTypeItemObj
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMap} MetadataTypeMap
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMapObj} MetadataTypeMapObj
 * @typedef {import('../../types/mcdev.d.js').SoapRequestParams} SoapRequestParams
 * @typedef {import('../../types/mcdev.d.js').TemplateMap} TemplateMap
 */

/**
 * @typedef {import('../../types/mcdev.d.js').UserDocument} UserDocument
 * @typedef {import('../../types/mcdev.d.js').UserDocumentDocument} UserDocumentDocument
 * @typedef {import('../../types/mcdev.d.js').UserDocumentDiff} UserDocumentDiff
 * @typedef {import('../../types/mcdev.d.js').UserDocumentMap} UserDocumentMap
 * @typedef {import('../../types/mcdev.d.js').AccountUserConfiguration} AccountUserConfiguration
 */

/**
 * MetadataType
 *
 * @augments MetadataType
 */
class User extends MetadataType {
    static userBUassignments;
    static userIdBuMap;

    /**
     * Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void | string[]} _ unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static async retrieve(retrieveDir, _, __, key) {
        if (retrieveDir && this.buObject.eid !== this.buObject.mid) {
            // only skip if this was not for caching
            Util.logger.info(' - Skipping User retrieval on non-parent BU');
            return;
        }
        return this._retrieve(retrieveDir, key);
    }

    /**
     * Retrieves import definition metadata for caching
     *
     * @returns {Promise.<MetadataTypeMapObj>} Promise
     */
    static async retrieveForCache() {
        return this.retrieve(null);
    }

    /**
     * Create a single item.
     *
     * @param {MetadataTypeItem} metadata single metadata entry
     * @returns {Promise} Promise
     */
    static async create(metadata) {
        if (this.buObject.eid !== this.buObject.mid) {
            Util.logger.info(' - Skipping User creation on non-parent BU');
            return;
        }
        return super.createSOAP(metadata);
    }

    /**
     * Updates a single item.
     *
     * @param {MetadataTypeItem} metadata single metadata entry
     * @returns {Promise} Promise
     */
    static async update(metadata) {
        if (this.buObject.eid !== this.buObject.mid) {
            Util.logger.info(' - Skipping User update on non-parent BU');
            return;
        }
        return super.updateSOAP(metadata);
    }

    /**
     * prepares a item for deployment
     *
     * @param {UserDocument} metadata of a single item
     * @returns {Promise.<UserDocument>} metadata object
     */
    static async preDeployTasks(metadata) {
        metadata.Client = {
            ID: this.buObject.mid,
        };

        // convert roles into API compliant format
        if (metadata.c__RoleNamesGlobal?.length) {
            metadata.Roles = {
                Role: metadata.c__RoleNamesGlobal
                    .filter(
                        // individual role (which are not manageable nor visible in the GUI)
                        (roleName) => !roleName.startsWith('Individual role for ')
                    )
                    .map((roleName) => {
                        let roleCache;
                        try {
                            const roleKey = cache.searchForField(
                                'role',
                                roleName,
                                'Name',
                                'CustomerKey'
                            );
                            roleCache = cache.getByKey('role', roleKey + '');
                        } catch {
                            // skip this role in case of errors
                            return;
                        }
                        if (roleCache?.c__notAssignable) {
                            throw new Error(
                                `Default roles starting on 'Marketing Cloud' are not assignable via API and get removed upon update. Please create/update the user manually in the GUI or remove that role.`
                            );
                        }
                        return {
                            ObjectID: roleCache.ObjectID,
                            Name: roleName,
                        };
                    })
                    .filter(Boolean),
            };
        }
        delete metadata.c__RoleNamesGlobal;

        // check if DefaultBusinessUnit is listed in AssociatedBUs
        if (!metadata.c__AssociatedBusinessUnits.includes(metadata.DefaultBusinessUnit)) {
            metadata.c__AssociatedBusinessUnits.push(metadata.DefaultBusinessUnit);
            Util.logger.info(
                Util.getGrayMsg(
                    ` - adding DefaultBusinessUnit to list of associated Business Units (${metadata.CustomerKey} / ${metadata.Name}): ${metadata.DefaultBusinessUnit}`
                )
            );
        }
        if (metadata.c__AssociatedBusinessUnits.length) {
            // ensure we do not have duplicates in the list - could happen due to user error or due to templating
            metadata.c__AssociatedBusinessUnits = [...new Set(metadata.c__AssociatedBusinessUnits)];
        }

        // Timezone
        if (metadata.c__TimeZoneName) {
            // find the ID of the timezone
            metadata.TimeZone = { Name: metadata.c__TimeZoneName };
            metadata.TimeZone.ID =
                '' +
                cache.searchForField('_timezone', metadata.c__TimeZoneName, 'description', 'id');
            delete metadata.c__TimeZoneName;
        }

        // Locale
        if (metadata.c__LocaleCode) {
            // we cannot easily confirm if hte code is valid but SFMC's API will likely throw an error if not
            metadata.Locale = { LocaleCode: metadata.c__LocaleCode };
            delete metadata.c__LocaleCode;
        }

        // convert SSO / Federation Token into API compliant format
        if (metadata.SsoIdentity || metadata.SsoIdentities) {
            const ssoIdentity = {};
            let error = false;
            if (metadata.SsoIdentity) {
                // assume metadata.SsoIdentity is an object
                ssoIdentity.IsActive = metadata.SsoIdentity.IsActive;
                ssoIdentity.FederatedID = metadata.SsoIdentity.FederatedID;
                delete metadata.SsoIdentity;
            } else if (Array.isArray(metadata.SsoIdentities)) {
                // be nice and allow SsoIdentities as an alternative if its an array of objects
                ssoIdentity.IsActive = metadata.SsoIdentities[0].IsActive;
                ssoIdentity.FederatedID = metadata.SsoIdentities[0].FederatedID;
            } else if (
                Array.isArray(metadata.SsoIdentities?.SsoIdentity) &&
                metadata.SsoIdentities?.SsoIdentity.length
            ) {
                // API-compliant format already provided; just use it
                ssoIdentity.IsActive = metadata.SsoIdentities.SsoIdentity[0]?.IsActive;
                ssoIdentity.FederatedID = metadata.SsoIdentities.SsoIdentity[0]?.FederatedID;
            } else {
                error = true;
            }
            if (
                (ssoIdentity.IsActive !== true && ssoIdentity.IsActive !== false) ||
                !ssoIdentity.FederatedID ||
                error
            ) {
                throw new TypeError(
                    'SsoIdentity should be an object with IsActive and FederatedID properties.'
                );
            }
            // if SsoIdentity is set, assume this was on purpose and bring it
            metadata.SsoIdentities = {
                SsoIdentity: [
                    {
                        IsActive: ssoIdentity.IsActive,
                        FederatedID: ssoIdentity.FederatedID,
                    },
                ],
            };
        }

        delete metadata.c__type;
        delete metadata.c__AccountUserID;
        delete metadata.c__IsLocked_readOnly;

        return metadata;
    }

    /**
     * MetadataType upsert, after retrieving from target and comparing to check if create or update operation is needed.
     *
     * @param {MetadataTypeMap} metadataMap metadata mapped by their keyField
     * @param {string} deployDir directory where deploy metadata are saved
     * @param {boolean} [runUpsertSequentially] when a type has self-dependencies creates need to run one at a time and created/changed keys need to be cached to ensure following creates/updates have thoses keys available
     * @returns {Promise.<MetadataTypeMap>} keyField => metadata map
     */
    static async upsert(metadataMap, deployDir, runUpsertSequentially = false) {
        if (typeof this.userIdBuMap !== 'object' || Object.keys(this.userIdBuMap).length === 0) {
            this.cacheBusinessUnitAssignments();
        }

        return super.upsert(metadataMap, deployDir, runUpsertSequentially);
    }

    /**
     * helper for {@link MetadataType.upsert}
     *
     * @param {MetadataTypeMap} metadata list of metadata
     * @param {string} metadataKey key of item we are looking at
     * @param {boolean} hasError error flag from previous code
     * @param {UserDocumentDiff[]} metadataToUpdate list of items to update
     * @param {UserDocument[]} metadataToCreate list of items to create
     * @returns {Promise.<'create'|'update'|'skip'>} action to take
     */
    static async createOrUpdate(
        metadata,
        metadataKey,
        hasError,
        metadataToUpdate,
        metadataToCreate
    ) {
        const action = await super.createOrUpdate(
            metadata,
            metadataKey,
            hasError,
            metadataToUpdate,
            metadataToCreate
        );

        if (action === 'create') {
            const createItem = metadataToCreate.at(-1);
            User._setPasswordForNewUser(createItem);
            User._prepareRoleAssignments({ before: null, after: createItem });
            User._prepareBuAssignments(metadata[metadataKey], null, createItem);
        } else if (action === 'update') {
            const updateItem = metadataToUpdate.at(-1);
            User._prepareRoleAssignments(updateItem);
            User._prepareBuAssignments(metadata[metadataKey], updateItem, null);
        }
        return action;
    }

    /**
     * helper for {@link createOrUpdate}
     *
     * @private
     * @param {MetadataTypeItem} metadata single metadata itme
     * @param {UserDocumentDiff} [updateItem] item to update
     * @param {UserDocument} [createItem] item to create
     */
    static _prepareBuAssignments(metadata, updateItem, createItem) {
        this.userBUassignments ||= { add: {}, delete: {} };
        if (updateItem) {
            // remove business units that were unassigned
            const deletedBUs = [];
            updateItem.before.c__AssociatedBusinessUnits =
                this.userIdBuMap[updateItem.before.ID] || [];
            for (const oldBuAssignment of updateItem.before.c__AssociatedBusinessUnits) {
                // check if oldRole is missing in list of new roles
                if (!updateItem.after.c__AssociatedBusinessUnits.includes(oldBuAssignment)) {
                    deletedBUs.push(oldBuAssignment);
                }
            }
            if (deletedBUs.length > 0) {
                this.userBUassignments['delete'][updateItem.before.AccountUserID] = deletedBUs;
            }
            // add business units that were newly assigned
            const addedBUs = [];
            for (const newBuAssignment of updateItem.after.c__AssociatedBusinessUnits) {
                // check if oldRole is missing in list of new roles
                if (!updateItem.before.c__AssociatedBusinessUnits.includes(newBuAssignment)) {
                    addedBUs.push(newBuAssignment);
                }
            }
            if (addedBUs.length > 0) {
                this.userBUassignments['add'][updateItem.before.AccountUserID] = addedBUs;
            }
        }
        // add BUs for new users
        if (createItem) {
            const addedBUs = createItem.c__AssociatedBusinessUnits || [];
            if (addedBUs.length > 0) {
                this.userBUassignments['add']['key:' + createItem.CustomerKey] = addedBUs;
            }
        }
        delete metadata.c__AssociatedBusinessUnits;
    }

    /**
     * Gets executed after deployment of metadata type
     *
     * @param {UserDocumentMap} upsertResults metadata mapped by their keyField
     * @returns {Promise.<void>} promise
     */
    static async postDeployTasks(upsertResults) {
        if (Object.keys(upsertResults).length) {
            await this._handleBuAssignments(upsertResults);
        }
    }

    /**
     * create/update business unit assignments. helper for {@link postDeployTasks}
     *
     * @private
     * @param {UserDocumentMap} upsertResults metadata mapped by their keyField
     * @returns {Promise.<void>} -
     */
    static async _handleBuAssignments(upsertResults) {
        /** @type {AccountUserConfiguration[]} */
        const configs = [];
        for (const action in this.userBUassignments) {
            for (const data of Object.entries(this.userBUassignments[action])) {
                const buIds = data[1];
                let userId = data[0];
                if (!userId) {
                    continue;
                }
                userId = userId.startsWith('key:') ? upsertResults[userId.slice(4)].ID : userId;
                configs.push(
                    /** @type {AccountUserConfiguration} */ {
                        Client: { ID: this.buObject.eid },
                        ID: userId,
                        BusinessUnitAssignmentConfiguration: {
                            BusinessUnitIds: { BusinessUnitId: buIds },
                            IsDelete: action === 'delete',
                        },
                    }
                );
            }
        }
        if (configs.length > 0) {
            Util.logger.info('Deploying: BU assignment changes');
            // run update
            const buResponse = await this.client.soap.configure('AccountUser', configs);
            // process response
            if (buResponse.OverallStatus === 'OK') {
                // get userIdNameMap
                const userIdNameMap = {};
                for (const user of Object.values(upsertResults)) {
                    userIdNameMap[user.ID] = `${user.CustomerKey} / ${user.Name}`;
                }
                // log what was added / removed
                let configureResults = buResponse.Results?.[0]?.Result;
                if (!configureResults) {
                    Util.logger.debug(
                        'buResponse.Results?.[0]?.Result not defined: ' + JSON.stringify(buResponse)
                    );
                    return;
                }
                if (!Array.isArray(configureResults)) {
                    configureResults = [configureResults];
                }
                const userBUresults = {};
                for (const result of configureResults) {
                    if (result.StatusCode === 'OK') {
                        /** @type {AccountUserConfiguration} */
                        const config = result.Object;
                        const buArr =
                            config.BusinessUnitAssignmentConfiguration.BusinessUnitIds
                                .BusinessUnitId;
                        userBUresults[config.ID] ||= {
                            add: [],
                            delete: [],
                        };
                        userBUresults[config.ID][
                            config.BusinessUnitAssignmentConfiguration.IsDelete ? 'delete' : 'add'
                        ] = Array.isArray(buArr) ? buArr : [buArr];
                    } else {
                        Util.logger.debug(
                            `Unknown error occured during processing of BU assignment reponse: ${JSON.stringify(
                                result
                            )}`
                        );
                    }
                }
                for (const [userId, buResult] of Object.entries(userBUresults)) {
                    // show CLI log
                    const msgs = [];
                    if (buResult['add']?.length) {
                        msgs.push(`MID ${buResult['add'].join(', ')} access granted`);
                    } else {
                        msgs.push('no new access granted');
                    }
                    if (buResult['delete']?.length) {
                        msgs.push(`MID ${buResult['delete'].join(', ')} access removed`);
                    } else {
                        msgs.push('no access removed');
                    }
                    Util.logger.info(` - user ${userIdNameMap[userId]}: ${msgs.join(' / ')}`);
                    // update BU map in local variable
                    if (buResult['add']?.length) {
                        this.userIdBuMap[userId] ||= [];
                        this.userIdBuMap[userId].push(
                            ...buResult['add'].filter(
                                (item) => !this.userIdBuMap[userId].includes(item)
                            )
                        );
                    }
                    if (buResult['delete']?.length) {
                        this.userIdBuMap[userId] ||= [];
                        this.userIdBuMap[userId] = this.userIdBuMap[userId].filter(
                            (item) => !buResult['delete'].includes(item)
                        );
                    }
                }
            }
        }
    }

    /**
     * helper for {@link User.createOrUpdate}
     *
     * @private
     * @param {UserDocument} metadata single created user
     * @returns {void}
     */
    static _setPasswordForNewUser(metadata) {
        // if Password is not set during CREATE, generate one
        // avoids error "Name, Email, UserID, and Password are required fields when creating a new user. (Code 11003)"
        if (!metadata.Password) {
            metadata.Password = this._generatePassword();
            Util.logger.info(
                ` - Password for ${metadata.UserID} was not given. Generated password:`
            );
            // use console.log here to print the generated password to bypass the logfile
            // eslint-disable-next-line no-console
            console.log(metadata.Password);
        }
    }

    /**
     * helper for {@link User.createOrUpdate}
     * It searches for roles that were removed from the user and unassigns them; it also prints a summary of added/removed roles
     * Adding roles works automatically for roles listed on the user
     *
     * @private
     * @param {UserDocumentDiff} item updated user with before and after state
     * @returns {void}
     */
    static _prepareRoleAssignments(item) {
        // delete global roles from user that were not in the c__RoleNamesGlobal array / Roles.Role
        const deletedRoles = [];
        const deletedRoleNames = [];
        if (item.after?.Roles?.Role && !Array.isArray(item.after.Roles.Role)) {
            item.after.Roles.Role = [item.after.Roles.Role];
        }
        if (item.before?.Roles?.Role) {
            if (!Array.isArray(item.before.Roles.Role)) {
                item.before.Roles.Role = [item.before.Roles.Role];
            }
            for (const oldRole of item.before.Roles.Role) {
                // check if oldRole is missing in list of new roles --> removing role
                let oldRoleFound = false;
                if (item.after.Roles?.Role) {
                    for (const newRole of item.after.Roles.Role) {
                        if (newRole.ObjectID == oldRole.ObjectID) {
                            oldRoleFound = true;
                            break;
                        }
                    }
                }
                if (!oldRoleFound && !oldRole.Name.startsWith('Individual role for ')) {
                    // delete role unless it is an individual role (which are not manageable nor visible in the GUI)
                    deletedRoles.push({ ObjectID: oldRole.ObjectID, Name: oldRole.Name });
                    deletedRoleNames.push(oldRole.Name);
                }
            }
        }
        const addedRoleNames = [];
        if (item.after?.Roles?.Role) {
            for (const newRole of item.after.Roles.Role) {
                // check if newRole is missing in list of old roles --> adding role
                let roleAlreadyExisting = false;
                if (item.before?.Roles?.Role) {
                    for (const oldRole of item.before.Roles.Role) {
                        if (newRole.ObjectID == oldRole.ObjectID) {
                            roleAlreadyExisting = true;
                            break;
                        }
                    }
                }
                if (!roleAlreadyExisting) {
                    addedRoleNames.push(newRole.Name);
                    // Note: no AssignmentConfigurations property is needed to ADD global roles
                }
            }
            if (addedRoleNames.length) {
                Util.logger.info(
                    Util.getGrayMsg(
                        ` - adding role-assignment (${item.after.CustomerKey} / ${
                            item.after.Name
                        }): ${addedRoleNames.join(', ')}`
                    )
                );
            }
        }
        if (deletedRoles.length) {
            Util.logger.info(
                Util.getGrayMsg(
                    ` - removing role-assignment (${item.after.CustomerKey} / ${
                        item.after.Name
                    }): ${deletedRoleNames.join(', ')}`
                )
            );
            // add deleted roles to payload with IsDelete=true
            if (!item.after.Roles) {
                item.after.Roles = { Role: [] };
            } else if (!item.after.Roles.Role) {
                item.after.Roles.Role = [];
            }
            item.after.Roles.Role.push(
                ...deletedRoles.map((role) =>
                    this._getRoleObjectForDeploy(
                        role.ObjectID,
                        role.Name,
                        item.after.AccountUserID,
                        false,
                        true
                    )
                )
            );
        }
    }

    /**
     * helper for {@link User._prepareRoleAssignments}
     *
     * @param {string} roleId role.ObjectID
     * @param {string} roleName role.Name
     * @param {number} userId user.AccountUserID
     * @param {boolean} assignmentOnly if true, only assignment configuration will be returned
     * @param {boolean} [isRoleRemovale] if true, role will be removed from user; otherwise added
     * @returns {object} format needed by API
     */
    static _getRoleObjectForDeploy(
        roleId,
        roleName,
        userId,
        assignmentOnly,
        isRoleRemovale = false
    ) {
        const assignmentConfigurations = {
            AssignmentConfiguration: [
                {
                    AccountUserId: userId,
                    AssignmentConfigureType: 'RoleUser',
                    IsDelete: isRoleRemovale,
                },
            ],
        };
        return assignmentOnly
            ? assignmentConfigurations
            : {
                  ObjectID: roleId,
                  Name: roleName,
                  AssignmentConfigurations: assignmentConfigurations,
              };
    }

    /**
     * Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     *
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static async retrieveChangelog() {
        return this._retrieve();
    }

    /**
     * Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     *
     * @private
     * @param {string} [retrieveDir] Directory where retrieved metadata directory will be saved
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static async _retrieve(retrieveDir, key) {
        /** @type {SoapRequestParams} */
        const requestParams = {
            QueryAllAccounts: true,

            filter: {
                // normal users
                leftOperand: 'Email',
                operator: 'like',
                rightOperand: '@',
            },
        };
        if (key) {
            // move original filter down one level into rightOperand and add key filter into leftOperand
            requestParams.filter = {
                leftOperand: {
                    leftOperand: 'CustomerKey',
                    operator: 'equals',
                    rightOperand: key,
                },
                operator: 'AND',
                rightOperand: requestParams.filter,
            };
        } else {
            // if we are not filtering by key the following requests will take long. Warn the user
            Util.logger.info(` - Loading ${this.definition.type}s. This might take a while...`);
        }

        // get actual user details
        return this.retrieveSOAP(retrieveDir, requestParams, key);
    }

    /**
     * Retrieves SOAP via generic fuel-soap wrapper based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {SoapRequestParams} [requestParams] required for the specific request (filter for example)
     * @param {string} [singleRetrieve] key of single item to filter by
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @returns {Promise.<MetadataTypeMapObj>} Promise of item map
     */
    static async retrieveSOAP(retrieveDir, requestParams, singleRetrieve, additionalFields) {
        // to avoid not retrieving roles and userPermissions for users above the 2500 records limit we need to retrieve users twice, once with ActiveFlag=true and once with ActiveFlag=false
        const requestParamsUser = {
            QueryAllAccounts: true,
            filter: {
                leftOperand: {
                    leftOperand: 'ActiveFlag',
                    operator: 'equals',
                    rightOperand: null,
                },
                operator: 'AND',
                rightOperand: requestParams.filter,
            },
        };
        const fields = this.getFieldNamesToRetrieve(additionalFields, !retrieveDir);
        const soapType = this.definition.soapType || this.definition.type;
        let resultsBulk;
        let foundSingle = false;
        for (const active of [true, false]) {
            requestParamsUser.filter.leftOperand.rightOperand = active;
            try {
                const resultsBatch = await this.client.soap.retrieveBulk(
                    soapType,
                    fields,
                    requestParamsUser
                );
                if (Array.isArray(resultsBatch?.Results)) {
                    Util.logger.debug(
                        Util.getGrayMsg(
                            `   - found ${resultsBatch?.Results.length} ${
                                active ? 'active' : 'inactive'
                            } ${this.definition.type}s`
                        )
                    );
                    if (resultsBulk) {
                        // once first batch is done, the follow just add to result payload
                        resultsBulk.Results.push(...resultsBatch.Results);
                    } else {
                        resultsBulk = resultsBatch;
                    }
                    if (singleRetrieve && resultsBatch?.Results.length) {
                        foundSingle = true;
                        break;
                    }
                }
            } catch (ex) {
                this._handleSOAPErrors(ex, 'retrieving');
                return;
            }
        }
        if (
            !foundSingle &&
            !(await this._retrieveSOAP_installedPackage(
                requestParams,
                soapType,
                fields,
                resultsBulk
            ))
        ) {
            return;
        }

        const metadata = this.parseResponseBody(resultsBulk);
        if (retrieveDir) {
            if (!singleRetrieve) {
                Util.logger.info(
                    Util.getGrayMsg(`   - found ${resultsBulk?.Results.length} users`)
                );
            }
            if (resultsBulk?.Results?.length > 0) {
                // get BUs that each users have access to
                // split array resultsBulk?.Results into chunks to avoid not getting all roles
                await this.cacheBusinessUnitAssignments(resultsBulk.Results);
            }

            const savedMetadata = await this.saveResults(metadata, retrieveDir, null);
            Util.logger.info(
                `Downloaded: ${this.definition.type} (${Object.keys(savedMetadata).length})` +
                    Util.getKeysString(singleRetrieve)
            );
            if (!singleRetrieve) {
                // print summary to cli
                const counter = {
                    userActive: 0,
                    userInactive: 0,
                    installedPackage: 0,
                };
                for (const id in savedMetadata) {
                    /** @typedef {UserDocument} */
                    const item = savedMetadata[id];
                    if (item.c__type === 'Installed Package') {
                        counter.installedPackage++;
                    } else if (item.ActiveFlag) {
                        counter.userActive++;
                    } else {
                        counter.userInactive++;
                    }
                }
                Util.logger.info(
                    Util.getGrayMsg(
                        `Found ${counter.userActive} active users / ${counter.userInactive} inactive users / ${counter.installedPackage} installed packages`
                    )
                );
            }
            await this.runDocumentOnRetrieve(singleRetrieve, savedMetadata);
        }
        return { metadata: metadata, type: this.definition.type };
    }

    /**
     * helper for {@link retrieveSOAP} and {@link upsert}; populates userIdBuMap
     *
     * @param {MetadataTypeItem[]} [metadataList] -
     * @returns {Promise.<void>} -
     */
    static async cacheBusinessUnitAssignments(metadataList) {
        if (!metadataList) {
            // if run via upsert() then we won't have the metadataList with AccountUserID anywhere but in cache
            const cacheUsers = cache.getCache().user;
            metadataList = cacheUsers ? Object.values(cacheUsers) : [];
        }
        const chunkSize = 100;
        this.userIdBuMap = {};
        Util.logger.info(` - Caching dependent Metadata: Business Unit assignments`);
        for (let i = 0; i < metadataList?.length; i += chunkSize) {
            if (i > 0) {
                Util.logger.info(
                    Util.getGrayMsg(`   - Requesting next batch (retrieved BUs for ${i} users)`)
                );
            }
            const accountUserIDList = metadataList
                .map((item) => item.AccountUserID)
                .filter(Boolean);
            const chunk = accountUserIDList?.slice(i, i + chunkSize);
            const resultsBatch = (
                await this.client.soap.retrieveBulk(
                    'AccountUserAccount',
                    ['AccountUser.AccountUserID', 'Account.ID'],
                    {
                        filter: {
                            leftOperand: 'AccountUser.AccountUserID',
                            operator: chunk.length > 1 ? 'IN' : 'equals', // API does not allow IN for single item
                            rightOperand: chunk,
                        },
                    }
                )
            ).Results;
            for (const item of resultsBatch) {
                this.userIdBuMap[item.AccountUser.AccountUserID] ||= [];
                // push to array if not already in array
                if (!this.userIdBuMap[item.AccountUser.AccountUserID].includes(item.Account.ID)) {
                    this.userIdBuMap[item.AccountUser.AccountUserID].push(item.Account.ID);
                }
            }
        }
    }

    /**
     * helper for {@link User.retrieveSOAP}
     *
     * @private
     * @param {SoapRequestParams} requestParams required for the specific request (filter for example)
     * @param {string} soapType e.g. AccountUser
     * @param {string[]} fields list of fields to retrieve
     * @param {object} resultsBulk actual return value of this method
     * @returns {Promise.<boolean>} success flag
     */
    static async _retrieveSOAP_installedPackage(requestParams, soapType, fields, resultsBulk) {
        /** @type {SoapRequestParams} */
        const requestParamsInstalledPackage = {
            QueryAllAccounts: true,

            filter: {
                leftOperand: {
                    leftOperand: 'ActiveFlag',
                    operator: 'equals',
                    rightOperand: true, // inactive installed packages are not visible in UI and hence cannot be reactivated there. Let's not retrieve them
                },
                operator: 'AND',
                rightOperand: {
                    leftOperand: {
                        // filter out normal users
                        leftOperand: 'Email',
                        operator: 'isNull',
                    },
                    operator: 'OR',
                    rightOperand: {
                        // installed packages
                        leftOperand: {
                            leftOperand: 'Name',
                            operator: 'like',
                            rightOperand: ' app user', // ! will not work if the name was too long as "app user" might be cut off
                        },
                        operator: 'AND',
                        rightOperand: {
                            // this is used to filter out system generated installed packages. in our testing, at least those installed packages created in the last few years have hat set this to false while additional (hidden) installed packages have it set to true.
                            leftOperand: 'MustChangePassword',
                            operator: 'equals',
                            rightOperand: 'false',
                        },
                    },
                },
            },
        };
        if (
            'object' === typeof requestParams?.filter?.leftOperand &&
            requestParams?.filter?.leftOperand?.leftOperand === 'CustomerKey'
        ) {
            requestParamsInstalledPackage.filter = {
                leftOperand: requestParams?.filter?.leftOperand,
                operator: 'AND',
                rightOperand: requestParamsInstalledPackage.filter,
            };
        }
        try {
            const resultsBatch = await this.client.soap.retrieveBulk(
                soapType,
                fields,
                requestParamsInstalledPackage
            );
            if (Array.isArray(resultsBatch?.Results)) {
                Util.logger.debug(
                    Util.getGrayMsg(`   - found ${resultsBatch?.Results.length} installed packages`)
                );
                if (resultsBulk) {
                    // once first batch is done, the follow just add to result payload
                    resultsBulk.Results.push(...resultsBatch.Results);
                } else {
                    resultsBulk = resultsBatch;
                }
            }
        } catch (ex) {
            this._handleSOAPErrors(ex, 'retrieving');
            return false;
        }
        return true;
    }

    /**
     *
     * @param {string} dateStr first date
     * @param {string} interval defaults to 'days'
     * @returns {string} time difference
     */
    static #timeSinceDate(dateStr, interval = 'days') {
        const second = 1000,
            minute = second * 60,
            hour = minute * 60,
            day = hour * 24,
            week = day * 7;
        const date = new Date(dateStr);
        const now = new Date();
        // get difference in miliseconds
        const timediff = now.valueOf() - date.valueOf();
        if (Number.isNaN(timediff)) {
            return '';
        }
        let result;
        switch (interval) {
            case 'years': {
                result = now.getFullYear() - date.getFullYear();
                break;
            }
            case 'months': {
                result =
                    now.getFullYear() * 12 +
                    now.getMonth() -
                    (date.getFullYear() * 12 + date.getMonth());
                break;
            }
            case 'weeks': {
                result = Math.floor(timediff / week);
                break;
            }
            case 'days': {
                result = Math.floor(timediff / day);
                break;
            }
            case 'hours': {
                result = Math.floor(timediff / hour);
                break;
            }
            case 'minutes': {
                result = Math.floor(timediff / minute);
                break;
            }
            case 'seconds': {
                result = Math.floor(timediff / second);
                break;
            }
            default: {
                return;
            }
        }
        return result + ' ' + interval;
    }

    /**
     * helper to print bu names
     *
     * @private
     * @param {number} id bu id
     * @returns {string} "bu name (bu id)""
     */
    static _getBuName(id) {
        const name = this.buObject.eid == id ? '_ParentBU_' : this.buIdName[id];
        return `<nobr>${name} (${id})</nobr>`;
    }

    /**
     * helper that gets BU names from config
     *
     * @private
     */
    static _getBuNames() {
        this.buIdName = {};
        for (const cred in this.properties.credentials) {
            for (const buName in this.properties.credentials[cred].businessUnits) {
                this.buIdName[this.properties.credentials[cred].businessUnits[buName]] = buName;
            }
        }
    }

    /**
     * helper for {@link User.createOrUpdate} to generate a random initial password for new users
     * note: possible minimum length values in SFMC are 6, 8, 10, 15 chars. Therefore we should default here to 15 chars.
     *
     * @private
     * @param {number} [length] length of password; defaults to 15
     * @returns {string} random password
     */
    static _generatePassword(length = 15) {
        const alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const special = '!@#$%&';
        const numeric = '0123456789';
        const charset = alpha + special + numeric;
        let retVal;
        do {
            retVal = '';
            for (let i = 0, n = charset.length; i < length; ++i) {
                retVal += charset.charAt(Math.floor(Math.random() * n));
            }
            // check if password contains at least one of each character type or else generate a new one
        } while (
            !/[a-z]/.test(retVal) ||
            !/[A-Z]/.test(retVal) ||
            !/[0-9]/.test(retVal) ||
            !/[!@#$%&]/.test(retVal)
        );
        return retVal;
    }

    /**
     * Creates markdown documentation of all roles
     *
     * @param {UserDocumentMap} [metadata] user list
     * @returns {Promise.<void>} -
     */
    static async document(metadata) {
        if (this.buObject.eid !== this.buObject.mid) {
            Util.logger.error(
                `Users can only be retrieved & documented for the ${Util.parentBuName}`
            );
            return;
        }

        if (!metadata) {
            // load users from disk if document was called directly and not part of a retrieve
            try {
                metadata = (
                    await this.readBUMetadataForType(
                        File.normalizePath([
                            this.properties.directories.retrieve,
                            this.buObject.credential,
                            Util.parentBuName,
                        ]),
                        true
                    )
                ).user;
            } catch (ex) {
                Util.logger.error(ex.message);
                return;
            }
        }

        // init map of BU Ids > BU Name
        this._getBuNames();

        /** @type {UserDocumentDocument[]} */
        const users = [];

        for (const id in metadata) {
            const user = metadata[id];
            // TODO resolve user permissions to something readable
            // user roles
            let roles = '';
            if (user.c__RoleNamesGlobal) {
                roles = '<nobr>' + user.c__RoleNamesGlobal.join(',</nobr><br> <nobr>') + '</nobr>';
            }
            let associatedBus = '';
            if (user.c__AssociatedBusinessUnits) {
                // ensure Parent BU is first in list
                user.c__AssociatedBusinessUnits.push(user.DefaultBusinessUnit);
                // ensure associatedBus have no duplicates
                associatedBus = [
                    ...new Set(user.c__AssociatedBusinessUnits.map((mid) => this._getBuName(mid))),
                ]
                    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
                    .join(',<br> ');
            }
            const defaultBUName = this._getBuName(user.DefaultBusinessUnit);
            const LastSuccessfulLogin = user.LastSuccessfulLogin.split('.')[0];

            users.push({
                ...user, // keep that here to satisfy the type
                TYPE: user.c__type,
                UserID: user.UserID,
                AccountUserID: user.c__AccountUserID,
                CustomerKey: user.CustomerKey,
                Name: user.Name,
                Email: user.Email,
                NotificationEmailAddress: user.NotificationEmailAddress,
                ActiveFlagDocs: user.ActiveFlag === true ? '✓' : '-',
                IsLockedDocs: user.IsLocked === true ? '✓' : '-',
                IsAPIUserDocs: user.IsAPIUser === true ? '✓' : '-',
                MustChangePasswordDocs: user.MustChangePassword === true ? '✓' : '-',
                DefaultBusinessUnitDocs: defaultBUName,
                AssociatedBusDocs: associatedBus,
                RolesDocs: roles,
                LastSuccessfulLogin: user.LastSuccessfulLogin
                    ? // on create & update, LastSuccessfulLogin often gets overwritten with the current date
                      LastSuccessfulLogin === user.CreatedDate.split('.')[0] ||
                      LastSuccessfulLogin === user.ModifiedDate.split('.')[0]
                        ? 'unknown'
                        : this.#timeSinceDate(user.LastSuccessfulLogin)
                    : 'never',
                CreatedDate: user.CreatedDate ? user.CreatedDate.split('T').join(' ') : 'n/a',
                ModifiedDate: user.ModifiedDate ? user.ModifiedDate.split('T').join(' ') : 'n/a',
                ModifiedBy: user.Client.ModifiedBy || 'n/a',
                TimeZoneName: user.c__TimeZoneName.slice(1, 10),
                c__LocaleCode: user.c__LocaleCode,
            });
        }
        users.sort((a, b) => (a.Name < b.Name ? -1 : a.Name > b.Name ? 1 : 0));
        const columnsToPrint = [
            ['Name', 'Name'],
            ['Last successful Login', 'LastSuccessfulLogin'],
            ['Active', 'ActiveFlagDocs'],
            ['Access Locked out', 'IsLockedDocs'],
            ['API User', 'IsAPIUserDocs'],
            ['Must change PW', 'MustChangePasswordDocs'],
            ['Default BU', 'DefaultBusinessUnitDocs'],
            ['BU Access', 'AssociatedBusDocs'],
            ['Roles', 'RolesDocs'],
            ['Login', 'UserID'],
            ['ID', 'AccountUserID'],
            ['Key', 'CustomerKey'],
            ['E-Mail', 'Email'],
            ['Notification E-Mail', 'NotificationEmailAddress'],
            ['Timezone', 'TimeZoneName'],
            ['SFMC Locale', 'c__LocaleCode'],
            ['Modified Date', 'ModifiedDate'],
            ['Modified By', 'ModifiedBy'],
            ['Created Date', 'CreatedDate'],
        ];
        let output = `# User Overview - ${this.buObject.credential}`;
        output += this._generateDocMd(
            users.filter((user) => user.TYPE === 'User' && user.ActiveFlagDocs === '✓'),
            'User',
            columnsToPrint
        );
        output += this._generateDocMd(
            users.filter((user) => user.TYPE === 'User' && user.ActiveFlagDocs === '-'),
            'Inactivated User',
            columnsToPrint
        );
        output += this._generateDocMd(
            users.filter((user) => user.TYPE === 'Installed Package'),
            'Installed Package',
            columnsToPrint
        );
        const docPath = File.normalizePath([this.properties.directories.docs, 'user']);

        try {
            const filename = this.buObject.credential;
            // write to disk
            await File.writeToFile(docPath, filename + '.users', 'md', output);
            Util.logger.info(`Created ${File.normalizePath([docPath, filename])}.users.md`);
            if (['html', 'both'].includes(this.properties.options.documentType)) {
                Util.logger.warn(' - HTML-based documentation of user currently not supported.');
            }
        } catch (ex) {
            Util.logger.error(`user.document():: error | `, ex.message);
        }
    }

    /**
     *
     * @private
     * @param {object[]} users list of users and installed package
     * @param {'Installed Package'|'User'|'Inactivated User'} type choose what sub type to print
     * @param {Array[]} columnsToPrint helper array
     * @returns {string} markdown
     */
    static _generateDocMd(users, type, columnsToPrint) {
        let output = `\n\n## ${type}s (${users.length})\n\n`;
        let tableSeparator = '';
        for (const column of columnsToPrint) {
            output += `| ${column[0]} `;
            tableSeparator += '| --- ';
        }
        output += `|\n${tableSeparator}|\n`;
        for (const user of users) {
            for (const column of columnsToPrint) {
                output += `| ${user[column[1]]} `;
            }
            output += `|\n`;
        }
        return output;
    }

    /**
     * manages post retrieve steps
     *
     * @param {UserDocument} metadata a single item
     * @returns {MetadataTypeItem | void} a single item
     */
    static postRetrieveTasks(metadata) {
        metadata.c__type = 'Installed Package';
        if (metadata.Email.includes('@') && !metadata.Name.endsWith('app user')) {
            metadata.c__type = 'User';
        }
        if (metadata.c__type === 'Installed Package' && !metadata.ActiveFlag) {
            // deleted installed package - we do try to filter them in the API call but sometimes they slip through in the other calls
            return;
        }

        // rewrite AccountUserID to avoid accidental overwrites by create attempts but still allow users to search for this ID
        metadata.c__AccountUserID = metadata.AccountUserID;
        delete metadata.AccountUserID;

        // the actual field cannot be updated. to avoid confusion, we rename it
        metadata.c__IsLocked_readOnly = metadata.IsLocked;
        delete metadata.IsLocked;
        if (metadata.c__IsLocked_readOnly) {
            // add this field in case the user is locked to offer the opportunity to unlock it via api
            metadata.Unlock = false;
        }

        metadata.c__AssociatedBusinessUnits = this.userIdBuMap[metadata.ID] || [];
        metadata.c__AssociatedBusinessUnits.sort();

        // make roles easily accessible
        let roles;
        if (metadata.Roles?.Role) {
            // normalize to always use array
            if (!metadata.Roles.Role.length) {
                metadata.Roles.Role = [metadata.Roles.Role];
            }
            // convert complex object into basic set of info
            // turns out, Role Names are unique and hence we can turn this into a simple array of names
            roles = metadata.Roles.Role.map((item) => item.Name)
                .filter(Boolean)
                .filter(
                    // individual role (which are not manageable nor visible in the GUI)
                    (roleName) => !roleName.startsWith('Individual role for ')
                )
                .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
        } else {
            // set to empty array
            roles = [];
        }
        metadata.c__RoleNamesGlobal = roles;
        delete metadata.Roles;

        // Timezone
        if (metadata.TimeZone?.ID) {
            metadata.c__TimeZoneName = cache.searchForField(
                '_timezone',
                metadata.TimeZone.ID,
                'id',
                'description'
            );
            delete metadata.TimeZone;
        }

        // Locale
        if (metadata.Locale?.LocaleCode) {
            metadata.c__LocaleCode = metadata.Locale.LocaleCode;
            delete metadata.Locale;
        }

        return metadata;
    }
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
User.definition = MetadataTypeDefinitions.user;

export default User;
