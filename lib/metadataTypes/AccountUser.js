'use strict';

const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const File = require('../util/file');

/**
 * MessageSendActivity MetadataType
 *
 * @augments MetadataType
 */
class AccountUser extends MetadataType {
    /**
     * Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {string[]} _ Returns specified fields even if their retrieve definition is not set to true
     * @param {object} buObject properties for auth
     * @returns {Promise<object>} Promise of metadata
     */
    static async retrieve(retrieveDir, _, buObject) {
        if (buObject.eid !== buObject.mid) {
            Util.logger.info('Skipping User retrieval on non-parent BU');
            return;
        }
        Util.logger.info('- Caching dependent Metadata: AccountUserAccount');

        // get BUs that each users have access to
        const optionsBUs = {};

        const resultsBatch = (
            await this.client.soap.retrieveBulk(
                'AccountUserAccount',
                ['AccountUser.AccountUserID', 'AccountUser.UserID', 'Account.ID', 'Account.Name'],
                { options: optionsBUs }
            )
        ).Results;
        this.userIdBuMap = {};
        resultsBatch.forEach((item) => {
            this.userIdBuMap[item.AccountUser.AccountUserID] =
                this.userIdBuMap[item.AccountUser.AccountUserID] || [];
            this.userIdBuMap[item.AccountUser.AccountUserID].push({
                ID: item.Account.ID,
                Name: item.Account.Name,
            });
        });
        // get actual user details
        const options = {
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

        return super.retrieveSOAP(retrieveDir, buObject, options);
    }
    /**
     *
     * @param {string} date first date
     * @returns {number} time difference
     */
    static timeSinceDate(date) {
        const interval = 'days';
        const second = 1000,
            minute = second * 60,
            hour = minute * 60,
            day = hour * 24,
            week = day * 7;
        date = new Date(date);
        const now = new Date();
        const timediff = now - date;
        if (isNaN(timediff)) {
            return NaN;
        }
        let result;
        switch (interval) {
            case 'years':
                result = now.getFullYear() - date.getFullYear();
                break;
            case 'months':
                result =
                    now.getFullYear() * 12 +
                    now.getMonth() -
                    (date.getFullYear() * 12 + date.getMonth());
                break;
            case 'weeks':
                result = Math.floor(timediff / week);
                break;
            case 'days':
                result = Math.floor(timediff / day);
                break;
            case 'hours':
                result = Math.floor(timediff / hour);
                break;
            case 'minutes':
                result = Math.floor(timediff / minute);
                break;
            case 'seconds':
                result = Math.floor(timediff / second);
                break;
            default:
                return undefined;
        }
        return result + ' ' + interval;
    }
    /**
     * helper to print bu names
     *
     * @param {BuObject} buObject needed for eid
     * @param {string} buObject.eid needed to check for parent bu
     * @param {number} id bu id
     * @returns {string} "bu name (bu id)""
     */
    static getBuName(buObject, id) {
        let name;
        if (buObject.eid == id) {
            name = '_ParentBU_';
        } else {
            name = this.buIdName[id];
        }
        return `<nobr>${name} (${id})</nobr>`;
    }
    /**
     * Creates markdown documentation of all roles
     *
     * @param {BuObject} buObject properties for auth
     * @param {object} [metadata] user list
     * @returns {Promise<void>} -
     */
    static async document(buObject, metadata) {
        if (buObject.eid !== buObject.mid) {
            Util.logger.error(
                `Users can only be retrieved & documented for the ${Util.parentBuName}`
            );
            return;
        }
        if (!metadata) {
            // load users from disk if document was called directly and not part of a retrieve
            try {
                metadata = this.readBUMetadataForType(
                    File.normalizePath([
                        this.properties.directories.retrieve,
                        buObject.credential,
                        Util.parentBuName,
                    ]),
                    true
                ).accountUser;
            } catch (ex) {
                Util.logger.error(ex.message);
                return;
            }
        }
        // init map of BU Ids > BU Name
        this.buIdName = {};

        // initialize permission object
        this.allPermissions = {};
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
            if (user.Roles) {
                roles =
                    '<nobr>' +
                    user.Roles.map((item) => item.Name)
                        .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
                        .join(',</nobr><br> <nobr>') +
                    '</nobr>';
            }
            let associatedBus = '';
            if (user.AssociatedBusinessUnits__c) {
                associatedBus = user.AssociatedBusinessUnits__c.map((item) => {
                    this.buIdName[item.ID] = item.Name;
                    return this.getBuName(buObject, item.ID);
                })
                    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
                    .join(',<br> ');
            }
            const defaultBUName = this.getBuName(buObject, user.DefaultBusinessUnit);
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
                LastSuccessfulLogin: this.timeSinceDate(user.LastSuccessfulLogin),
                CreatedDate: user.CreatedDate.split('T').join(' '),
                ModifiedDate: user.ModifiedDate.split('T').join(' '),
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
        let output = `# User Overview - ${buObject.credential}`;
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
        const docPath = File.normalizePath([this.properties.directories.users]);

        try {
            const filename = buObject.credential;
            // ensure docs/roles folder is existing (depends on setup in .mcdevrc.json)
            if (!File.existsSync(docPath)) {
                File.mkdirpSync(docPath);
            }
            // write to disk
            await File.writeToFile(docPath, filename + '.accountUser', 'md', output);
            Util.logger.info(`Created ${docPath}${filename}.accountUser.md`);
            if (['html', 'both'].includes(this.properties.options.documentType)) {
                Util.logger.warn(
                    'HTML-based documentation of accountUser currently not supported.'
                );
            }
        } catch (ex) {
            Util.logger.error(`AccountUser.document():: error | `, ex.message);
        }
    }
    /**
     *
     * @param {object[]} users list of users and installed package
     * @param {'Installed Package'|'User'} type choose what sub type to print
     * @param {Array[]} columnsToPrint helper array
     * @returns {string} markdown
     */
    static _generateDocMd(users, type, columnsToPrint) {
        let output = `\n\n## ${type}s (${users.length})\n\n`;
        let tableSeparator = '';
        columnsToPrint.forEach((column) => {
            output += `| ${column[0]} `;
            tableSeparator += '| --- ';
        });
        output += `|\n${tableSeparator}|\n`;
        users.forEach((user) => {
            columnsToPrint.forEach((column) => {
                output += `| ${user[column[1]]} `;
            });
            output += `|\n`;
        });
        return output;
    }

    /**
     * manages post retrieve steps
     *
     * @param {object} metadata a single query
     * @returns {object[]} Array with one metadata object and one query string
     */
    static postRetrieveTasks(metadata) {
        return this.parseMetadata(metadata);
    }
    /**
     * parses retrieved Metadata before saving
     *
     * @param {object} metadata a single query activity definition
     * @returns {Array} Array with one metadata object and one sql string
     */
    static parseMetadata(metadata) {
        metadata.type__c = 'Installed Package';
        if (metadata.Email.includes('@') && !metadata.Name.endsWith('app user')) {
            metadata.type__c = 'User';
        }

        if (this.userIdBuMap[metadata.ID]) {
            metadata.AssociatedBusinessUnits__c = this.userIdBuMap[metadata.ID];
        } else {
            metadata.AssociatedBusinessUnits__c = [];
        }

        let roles;
        if (metadata.Roles.Role) {
            // normalize to always use array
            if (!metadata.Roles.Role.length) {
                metadata.Roles.Role = [metadata.Roles.Role];
            }
            // convert complex object into basic set of info
            roles = metadata.Roles.Role.map((item) => ({
                Name: item.Name,
                CustomerKey: item.CustomerKey,
            })).sort((a, b) => (a.Name < b.Name ? -1 : a.Name > b.Name ? 1 : 0));
        } else {
            // set to empty array
            roles = [];
        }
        metadata.Roles = roles;

        return metadata;
    }
}

// Assign definition to static attributes
AccountUser.definition = require('../MetadataTypeDefinitions').accountUser;

module.exports = AccountUser;
