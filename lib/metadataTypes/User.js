'use strict';

const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const File = require('../util/file');
const cache = require('../util/cache');

/**
 * MetadataType
 *
 * @augments MetadataType
 */
class User extends MetadataType {
    /**
     * Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void} _ unused parameter
     * @param {void} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of metadata
     */
    static async retrieve(retrieveDir, _, __, key) {
        if (this.buObject.eid !== this.buObject.mid) {
            Util.logger.info(' - Skipping User retrieval on non-parent BU');
            return;
        }
        return this._retrieve(retrieveDir, key);
    }
    /**
     * Retrieves import definition metadata for caching
     *
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise
     */
    static async retrieveForCache() {
        return this.retrieve(null);
    }

    /**
     * Create a single item.
     *
     * @param {TYPE.MetadataTypeItem} metadata single metadata entry
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
     * @param {TYPE.MetadataTypeItem} metadata single metadata entry
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
     * @param {TYPE.UserDocument} metadata of a single item
     * @returns {TYPE.UserDocument} metadata object
     */
    static async preDeployTasks(metadata) {
        delete metadata.type__c;
        delete metadata.UserPermissions;

        metadata.Client = {
            ID: this.buObject.mid,
        };

        // convert roles into API compliant format
        if (metadata.RoleNamesGlobal__c?.length) {
            metadata.Roles = {
                Role: metadata.RoleNamesGlobal__c.map((roleName) => {
                    try {
                        const roleObjectId = cache.searchForField(
                            'role',
                            roleName,
                            'Name',
                            'ObjectID'
                        );
                        return { ObjectID: roleObjectId, Name: roleName };
                    } catch {
                        return;
                    }
                }).filter(Boolean),
            };
        }
        delete metadata.RoleNamesGlobal__c;

        // check if DefaultBusinessUnit is listed in AssociatedBUs
        if (!metadata.AssociatedBusinessUnits__c.includes(metadata.DefaultBusinessUnit)) {
            metadata.AssociatedBusinessUnits__c.push(metadata.DefaultBusinessUnit);
            Util.logger.info(
                Util.getGrayMsg(
                    ` - adding DefaultBusinessUnit to list of associated Business Units (${metadata.CustomerKey} / ${metadata.Name}): ${metadata.DefaultBusinessUnit}`
                )
            );
        }

        // convert SSO / Federation Token into API compliant format
        if (metadata.SsoIdentity || metadata.SsoIdentities) {
            const ssoIdentity = {};
            if (metadata.SsoIdentity) {
                // assume metadata.SsoIdentity is an object
                ssoIdentity.IsActive = metadata.SsoIdentity.IsActive;
                ssoIdentity.FederatedId = metadata.SsoIdentity.FederatedId;
                delete metadata.SsoIdentity;
            } else if (Array.isArray(metadata.SsoIdentities)) {
                // be nice and allow SsoIdentities as an alternative if its an array of objects
                ssoIdentity.IsActive = metadata.SsoIdentities[0].IsActive;
                ssoIdentity.FederatedId = metadata.SsoIdentities[0].FederatedId;
            } else if (
                Array.isArray(metadata.SsoIdentities?.SsoIdentity) &&
                metadata.SsoIdentities?.SsoIdentity.length
            ) {
                // API-compliant format already provided; just use it
                ssoIdentity.IsActive = metadata.SsoIdentities.SsoIdentity[0]?.IsActive;
                ssoIdentity.FederatedId = metadata.SsoIdentities.SsoIdentity[0]?.FederatedId;
            } else {
                throw new TypeError(
                    'SsoIdentity should be an object with IsActive and FederatedId properties.'
                );
            }
            // if SsoIdentity is set, assume this was on purpose and bring it
            metadata.SsoIdentities = {
                SsoIdentity: [
                    {
                        IsActive: ssoIdentity.IsActive,
                        FederatedId: ssoIdentity.FederatedId,
                    },
                ],
            };
        }
        return metadata;
    }
    /**
     * helper for {@link MetadataType.upsert}
     *
     * @param {TYPE.MetadataTypeItem} metadata single metadata item
     * @param {string} metadataKey key of item we are looking at
     * @param {boolean} hasError error flag from previous code
     * @param {TYPE.UserDocumentDiff[]} metadataToUpdate list of items to update
     * @param {TYPE.UserDocument[]} metadataToCreate list of items to create
     * @returns {void}
     */
    static createOrUpdate(metadata, metadataKey, hasError, metadataToUpdate, metadataToCreate) {
        const action = super.createOrUpdate(
            metadata,
            metadataKey,
            hasError,
            metadataToUpdate,
            metadataToCreate
        );

        if (action === 'create') {
            const createItem = metadataToCreate[metadataToCreate.length - 1];
            User._setPasswordForNewUser(createItem);
            User.prepareBuAssignments(metadata, null, createItem);
        } else if (action === 'update') {
            const updateItem = metadataToUpdate[metadataToUpdate.length - 1];
            User._unassignRemovedRoles(updateItem);
            User.prepareBuAssignments(metadata, updateItem, null);
        }
    }

    /**
     *
     * @param {TYPE.MetadataTypeItem} metadata single metadata itme
     * @param {TYPE.UserDocumentDiff} [updateItem] item to update
     * @param {TYPE.UserDocument} [createItem] item to create
     */
    static prepareBuAssignments(metadata, updateItem, createItem) {
        this.userBUassignments ||= { add: {}, delete: {} };
        if (updateItem) {
            // remove business units that were unassigned
            const deletedBUs = [];
            updateItem.before.AssociatedBusinessUnits__c =
                this.userIdBuMap[updateItem.before.ID] || [];
            for (const oldBuAssignment of updateItem.before.AssociatedBusinessUnits__c) {
                // check if oldRole is missing in list of new roles
                if (!updateItem.after.AssociatedBusinessUnits__c.includes(oldBuAssignment)) {
                    deletedBUs.push(oldBuAssignment);
                }
            }
            if (deletedBUs.length > 0) {
                this.userBUassignments['delete'][updateItem.before.AccountUserID] = deletedBUs;
            }
            // add business units that were newly assigned
            const addedBUs = [];
            for (const newBuAssignment of updateItem.after.AssociatedBusinessUnits__c) {
                // check if oldRole is missing in list of new roles
                if (!updateItem.before.AssociatedBusinessUnits__c.includes(newBuAssignment)) {
                    addedBUs.push(newBuAssignment);
                }
            }
            if (addedBUs.length > 0) {
                this.userBUassignments['add'][updateItem.before.AccountUserID] = addedBUs;
            }
        }
        // add BUs for new users
        if (createItem) {
            const addedBUs = createItem.AssociatedBusinessUnits__c || [];
            if (addedBUs.length > 0) {
                this.userBUassignments['add']['key:' + createItem.CustomerKey] = addedBUs;
            }
        }
        delete metadata.AssociatedBusinessUnits__c;
    }

    /**
     * Gets executed after deployment of metadata type
     *
     * @param {TYPE.UserDocumentMap} metadata metadata mapped by their keyField
     * @returns {Promise.<void>} promise
     */
    static async postDeployTasks(metadata) {
        await this._handleBuAssignments(metadata);
    }
    /**
     * create/update business unit assignments
     *
     * @private
     * @param {TYPE.UserDocumentMap} metadata metadata mapped by their keyField
     * @returns {void}
     */
    static async _handleBuAssignments(metadata) {
        /** @type {TYPE.UserConfiguration[]} */
        const configs = [];
        for (const action in this.userBUassignments) {
            for (const data of Object.entries(this.userBUassignments[action])) {
                const buIds = data.buIds;
                if (!data.userId) {
                    continue;
                }
                const userId = data.userId.startsWith('key:')
                    ? metadata[userId.slice(4)].ID
                    : data.userId;
                configs.push(
                    /** @type {TYPE.UserConfiguration} */ {
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
            Util.logger.info('Handling BU assignment changes:');
            // run update
            const buResponse = await this.client.soap.configure('AccountUser', configs);
            // process response
            if (buResponse.OverallStatus === 'OK') {
                // get userIdNameMap
                const userIdNameMap = {};
                for (const user of Object.values(metadata)) {
                    userIdNameMap[user.ID] = `${user.CustomerKey} / ${user.Name}`;
                }
                // log what was added / removed
                const configureResults = buResponse.Results?.[0]?.Result;
                if (Array.isArray(configureResults)) {
                    const userBUresults = {};
                    for (const result of configureResults) {
                        if (result.StatusCode === 'OK') {
                            /** @type {TYPE.UserConfiguration} */
                            const config = result.Object;
                            const buArr =
                                config.BusinessUnitAssignmentConfiguration.BusinessUnitIds
                                    .BusinessUnitId;
                            userBUresults[config.ID] = userBUresults[config.ID] || {
                                add: [],
                                delete: [],
                            };
                            userBUresults[config.ID][
                                config.BusinessUnitAssignmentConfiguration.IsDelete
                                    ? 'delete'
                                    : 'add'
                            ] = Array.isArray(buArr) ? buArr : [buArr];
                        } else {
                            // TODO: handle (so far unknown) error
                        }
                    }
                    for (const [userId, buResult] of Object.entries(userBUresults)) {
                        Util.logger.info(
                            ` - ${userIdNameMap[userId]}: ${buResult['add'].join(
                                ', '
                            )} assigned / ${buResult['delete'].join(', ')} removed`
                        );
                    }
                }
            }
            // console.log('buResponse', JSON.stringify(buResponse));
        }
    }

    /**
     * helper for {@link User.createOrUpdate}
     *
     * @private
     * @param {TYPE.UserDocument} metadata single created user
     * @returns {void}
     */
    static _setPasswordForNewUser(metadata) {
        // if Password is not set during CREATE, generate one
        // avoids error "Name, Email, UserID, and Password are required fields when creating a new user. (Code 11003)"
        if (!metadata.Password) {
            metadata.Password = this._generatePassword();
            Util.logger.info(
                ` - Password for ${metadata.UserID} was not given. Generated password: ${metadata.Password}`
            );
        }
    }

    /**
     * helper for {@link User.createOrUpdate}
     * it searches for roles that were removed from the user and unassigns them
     *
     * @private
     * @param {TYPE.UserDocumentDiff} item updated user with before and after state
     * @returns {void}
     */
    static _unassignRemovedRoles(item) {
        // delete global roles from user that were not in the RoleNamesGlobal__c array / Roles.Role
        const deletedRoleIds = [];
        const deletedRoleNames = [];
        for (const oldRole of item.before.Roles.Role) {
            // check if oldRole is missing in list of new roles
            let oldRoleFound = false;
            for (const newRole of item.after.Roles.Role) {
                if (newRole.ObjectID == oldRole.ObjectID) {
                    oldRoleFound = true;
                    break;
                }
            }
            if (!oldRoleFound) {
                deletedRoleIds.push(oldRole.ObjectID);
                deletedRoleNames.push(oldRole.Name);
            }
        }
        const addedRoleNames = [];
        for (const newRole of item.after.Roles.Role) {
            // check if oldRole is missing in list of new roles
            let newRoleFound = false;
            for (const oldRole of item.before.Roles.Role) {
                if (newRole.ObjectID == oldRole.ObjectID) {
                    newRoleFound = true;
                    break;
                }
            }
            if (!newRoleFound) {
                addedRoleNames.push(newRole.Name);
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
        if (deletedRoleIds.length) {
            Util.logger.info(
                Util.getGrayMsg(
                    ` - removing role-assignment (${item.after.CustomerKey} / ${
                        item.after.Name
                    }): ${deletedRoleNames.join(', ')}`
                )
            );
            // add deleted roles to payload with IsDelete=true
            item.after.Roles.Role.push(
                ...deletedRoleIds.map((id) => ({
                    ObjectID: id,
                    AssignmentConfigurations: {
                        AssignmentConfiguration: [
                            {
                                AccountUserId: item.after.AccountUserID,
                                AssignmentConfigureType: 'RoleUser',
                                IsDelete: true,
                            },
                        ],
                    },
                }))
            );
        }
    }

    /**
     * Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     *
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of metadata
     */
    static async retrieveChangelog() {
        return this._retrieve();
    }
    /**
     * Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     *
     * @private
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of metadata
     */
    static async _retrieve(retrieveDir, key) {
        this.userIdBuMap = {};

        // get BUs that each users have access to
        const optionsBUs = {};
        Util.logger.info(
            ' - Caching dependent Metadata: AccountUserAccount (Business Unit assignments)'
        );
        const resultsBatch = (
            await this.client.soap.retrieveBulk(
                'AccountUserAccount',
                ['AccountUser.AccountUserID', 'Account.ID'],
                optionsBUs
            )
        ).Results;
        for (const item of resultsBatch) {
            this.userIdBuMap[item.AccountUser.AccountUserID] =
                this.userIdBuMap[item.AccountUser.AccountUserID] || [];
            // push to array if not already in array
            if (!this.userIdBuMap[item.AccountUser.AccountUserID].includes(item.Account.ID)) {
                this.userIdBuMap[item.AccountUser.AccountUserID].push(item.Account.ID);
            }
        }
        // get actual user details
        /** @type {TYPE.SoapRequestParams} */
        let requestParams = {
            QueryAllAccounts: true,

            filter: {
                leftOperand: {
                    // normal users
                    leftOperand: 'Email',
                    operator: 'like',
                    rightOperand: '@',
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
        };
        if (key) {
            // move original filter down one level into rightOperand and add key filter into leftOperand
            requestParams = {
                filter: {
                    leftOperand: {
                        leftOperand: 'CustomerKey',
                        operator: 'equals',
                        rightOperand: key,
                    },
                    operator: 'AND',
                    rightOperand: requestParams.filter,
                },
            };
        }
        Util.logger.info(` - Loading ${this.definition.type}. This might take a while...`);
        return super.retrieveSOAP(retrieveDir, requestParams);
    }
    /**
     *
     * @private
     * @param {string} date first date
     * @returns {number} time difference
     */
    static _timeSinceDate(date) {
        const interval = 'days';
        const second = 1000,
            minute = second * 60,
            hour = minute * 60,
            day = hour * 24,
            week = day * 7;
        date = new Date(date);
        const now = new Date();
        const timediff = now - date;
        if (Number.isNaN(timediff)) {
            return Number.NaN;
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
     * helper for {@link createOrUpdate} to generate a random initial password for new users
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
     * @param {TYPE.MetadataTypeMap} [metadata] user list
     * @returns {Promise.<void>} -
     */
    static async document(metadata) {
        if (this.buObject.eid !== this.buObject.mid) {
            Util.logger.error(
                `Users can only be retrieved & documented for the ${Util.parentBuName}`
            );
            return;
        }

        // if ran as part of retrieve/deploy with key, exit here
        if (metadata && Object.keys(metadata).length === 1) {
            Util.logger.debug(
                'Only 1 user found. Skipping documentation, assuming we ran retrieve-by-key.'
            );
            return;
        }

        if (!metadata) {
            // load users from disk if document was called directly and not part of a retrieve
            try {
                metadata = this.readBUMetadataForType(
                    File.normalizePath([
                        this.properties.directories.retrieve,
                        this.buObject.credential,
                        Util.parentBuName,
                    ]),
                    true
                ).user;
            } catch (ex) {
                Util.logger.error(ex.message);
                return;
            }
        }

        // print summary to cli
        const counter = {
            userActive: 0,
            userInactive: 0,
            installedPackage: 0,
        };
        for (const id in metadata) {
            const item = metadata[id];
            if (item.type__c === 'Installed Package') {
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

        // init map of BU Ids > BU Name
        this._getBuNames();

        // initialize permission object
        this.allPermissions = {};
        /**
         * @type {TYPE.UserDocument[]}
         */
        const users = [];
        // traverse all permissions recursively and write them into allPermissions object once it has reached the end
        for (const id in metadata) {
            const user = metadata[id];
            // TODO resolve user permissions to something readable
            let userPermissions = '';
            if (user.UserPermissions) {
                if (!user.UserPermissions.length) {
                    // 1 single user permission found, normalize it
                    user.UserPermissions = [user.UserPermissions];
                }
                userPermissions = user.UserPermissions.map((item) => item.ID * 1)
                    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
                    .join(', ');
            }
            // user roles
            // TODO think about what to do with "individual role" entries
            let roles = '';
            if (user.RoleNamesGlobal__c) {
                roles = '<nobr>' + user.RoleNamesGlobal__c.join(',</nobr><br> <nobr>') + '</nobr>';
            }
            let associatedBus = '';
            if (user.AssociatedBusinessUnits__c) {
                user.AssociatedBusinessUnits__c.push({
                    ID: user.DefaultBusinessUnit,
                });
                // ensure associatedBus have no duplicates
                associatedBus = [
                    ...new Set(
                        user.AssociatedBusinessUnits__c.map((item) => this._getBuName(item.ID))
                    ),
                ]
                    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
                    .join(',<br> ');
            }
            const defaultBUName = this._getBuName(user.DefaultBusinessUnit);
            users.push({
                TYPE: user.type__c,
                UserID: user.UserID,
                AccountUserID: user.AccountUserID,
                CustomerKey: user.CustomerKey,
                Name: user.Name,
                Email: user.Email,
                NotificationEmailAddress: user.NotificationEmailAddress,
                ActiveFlag: user.ActiveFlag === true ? '✓' : '-',
                IsAPIUser: user.IsAPIUser === true ? '✓' : '-',
                MustChangePassword: user.MustChangePassword === true ? '✓' : '-',
                DefaultBusinessUnit: defaultBUName,
                AssociatedBusinessUnits__c: associatedBus,
                Roles: roles,
                UserPermissions: userPermissions,
                LastSuccessfulLogin: user.LastSuccessfulLogin
                    ? this._timeSinceDate(user.LastSuccessfulLogin)
                    : 'never',
                CreatedDate: user.CreatedDate ? user.CreatedDate.split('T').join(' ') : 'n/a',
                ModifiedDate: user.ModifiedDate ? user.ModifiedDate.split('T').join(' ') : 'n/a',
            });
        }
        users.sort((a, b) => (a.Name < b.Name ? -1 : a.Name > b.Name ? 1 : 0));
        const columnsToPrint = [
            ['Name', 'Name'],
            ['Last successful Login', 'LastSuccessfulLogin'],
            ['Active', 'ActiveFlag'],
            ['API User', 'IsAPIUser'],
            ['Must change PW', 'MustChangePassword'],
            ['Default BU', 'DefaultBusinessUnit'],
            ['BU Access', 'AssociatedBusinessUnits__c'],
            ['Roles', 'Roles'],
            ['User Permissions', 'UserPermissions'],
            ['Login', 'UserID'],
            ['ID', 'AccountUserID'],
            ['Key', 'CustomerKey'],
            ['E-Mail', 'Email'],
            ['Notification E-Mail', 'NotificationEmailAddress'],
            ['Modified Date', 'ModifiedDate'],
            ['Created Date', 'CreatedDate'],
        ];
        let output = `# User Overview - ${this.buObject.credential}`;
        output += this._generateDocMd(
            users.filter((user) => user.TYPE === 'User' && user.ActiveFlag === '✓'),
            'User',
            columnsToPrint
        );
        output += this._generateDocMd(
            users.filter((user) => user.TYPE === 'User' && user.ActiveFlag === '-'),
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
     * @param {'Installed Package'|'User'} type choose what sub type to print
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
     * @param {TYPE.MetadataTypeItem} metadata a single query
     * @returns {TYPE.MetadataTypeItem} Array with one metadata object and one query string
     */
    static postRetrieveTasks(metadata) {
        metadata.type__c = 'Installed Package';
        if (metadata.Email.includes('@') && !metadata.Name.endsWith('app user')) {
            metadata.type__c = 'User';
        }

        metadata.AssociatedBusinessUnits__c = this.userIdBuMap[metadata.ID] || [];

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
                .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
        } else {
            // set to empty array
            roles = [];
        }
        metadata.RoleNamesGlobal__c = roles;
        delete metadata.Roles;

        return metadata;
    }
}

// Assign definition to static attributes
User.definition = require('../MetadataTypeDefinitions').user;

module.exports = User;
