'use strict';

const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const File = require('../util/file');

/**
 * MessageSendActivity MetadataType
 * @augments MetadataType
 */
class AccountUser extends MetadataType {
    /**
     * Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     * @param {String} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {String[]} _ Returns specified fields even if their retrieve definition is not set to true
     * @param {Object} buObject properties for auth
     * @returns {Promise<Object>} Promise of metadata
     */
    static retrieve(retrieveDir, _, buObject) {
        if (buObject.eid !== buObject.mid) {
            Util.logger.info('Skipping User retrieval on non-parent BU');
            return;
        }
        const options = {
            queryAllAccounts: true,

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
                        rightOperand: ' app user',
                    },
                    operator: 'AND',
                    rightOperand: {
                        leftOperand: 'MustChangePassword',
                        operator: 'equals',
                        rightOperand: 'false',
                    },
                },
            },
        };

        return super.retrieveSOAPgeneric(retrieveDir, buObject, options);
    }
    /**
     *
     * @param {string} date first date
     * @param {string} date2 second date
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
     * Creates markdown documentation of all roles
     * @param {Util.BuObject} buObject properties for auth
     * @param {Object} [metadata] user list
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
            metadata = this.readBUMetadataForType(
                File.normalizePath([
                    this.properties.directories.retrieve,
                    buObject.credential,
                    Util.parentBuName,
                ]),
                true
            ).role;
        }
        // const directory = File.normalizePath(['docs/users', buObject.credential]);

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
                    .sort(function (a, b) {
                        return a < b ? -1 : a > b ? 1 : 0;
                    })
                    .join(', ');
            }
            // user roles
            // TODO think about what to do with "individual role" entries
            let roles = '';
            if (user.Roles && user.Roles.Role) {
                if (!user.Roles.Role.length) {
                    // 1 single role found, normalize it
                    user.Roles.Role = [user.Roles.Role];
                }

                roles = user.Roles.Role.map((item) => item.Name)
                    .sort(function (a, b) {
                        return a < b ? -1 : a > b ? 1 : 0;
                    })
                    .join(',<br>');
            }
            const buIds = {};
            Object.keys(this.properties.credentials[buObject.credential].businessUnits).forEach(
                (name) => {
                    buIds[this.properties.credentials[buObject.credential].businessUnits[name]] =
                        name;
                }
            );
            const defaultBUName =
                buIds[user.DefaultBusinessUnit] + ` (${user.DefaultBusinessUnit})`;
            users.push({
                TYPE: user.type__c,
                UserID: user.UserID,
                AccountUserID: user.AccountUserID,
                CustomerKey: user.CustomerKey,
                Name: user.Name,
                Email: user.Email,
                NotificationEmailAddress: user.NotificationEmailAddress,
                ActiveFlag: user.ActiveFlag === 'true' ? '✓' : '-',
                IsAPIUser: user.IsAPIUser === 'true' ? '✓' : '-',
                MustChangePassword: user.MustChangePassword === 'true' ? '✓' : '-',
                DefaultBusinessUnit: defaultBUName,
                Roles: roles,
                UserPermissions: userPermissions,
                LastSuccessfulLogin: this.timeSinceDate(user.LastSuccessfulLogin),
                CreatedDate: user.CreatedDate.split('T').join(' '),
                ModifiedDate: user.ModifiedDate.split('T').join(' '),
            });
        }
        users.sort(function (a, b) {
            return a.Name < b.Name ? -1 : a.Name > b.Name ? 1 : 0;
        });
        console.log(users);
        const columnsToPrint = [
            ['Type', 'TYPE'],
            ['Name', 'Name'],
            ['Login', 'UserID'],
            ['ID', 'AccountUserID'],
            ['Key', 'CustomerKey'],
            ['E-Mail', 'Email'],
            ['Notification E-Mail', 'NotificationEmailAddress'],
            ['Active', 'ActiveFlag'],
            ['API User', 'IsAPIUser'],
            ['Must change PW', 'MustChangePassword'],
            ['Default BU', 'DefaultBusinessUnit'],
            ['Roles', 'Roles'],
            ['User Permissions', 'UserPermissions'],
            ['Last successful Login', 'LastSuccessfulLogin'],
            ['Modified Date', 'ModifiedDate'],
            ['Created Date', 'CreatedDate'],
        ];
        let output = `# User Overview - ${buObject.credential}\n\n`;
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

        const docPath = File.normalizePath([this.properties.directories.roles]);

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
     * Experimental: Only working for DataExtensions:
     * Saves json content to a html table in the local file system. Will create the parent directory if it does not exist.
     * The json's first level of keys must represent the rows and the secend level the columns
     * @private
     * @param {DataExtensionItem} json dataextension
     * @param {Array} tabled prepped array for output in tabular format
     * @returns {string} file content
     */
    /**
     *
     * @param {Object[]} users list of users and installed package
     * @param {'Installed Package'|'User'} type choose what sub type to print
     * @param {Array[]} columnsToPrint helper array
     * @param {Object} buObject properties for auth
     * @returns {string} markdown
     */
    static _generateDocMd(users, type, columnsToPrint) {
        let output = `## ${type}s (${users.length})\n\n`;
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
     * Create a single TSD.
     * @param {Object} metadata single metadata entry
     * @returns {Promise} Promise
     */
    // static create(metadata) {
    //     return super.createSOAP(metadata);
    // }

    /**
     * Updates a single TSD.
     * @param {Object} metadata single metadata entry
     * @returns {Promise} Promise
     */
    // static update(metadata) {
    //     // * in case of update and active definition, we need to pause first.
    //     // * this should be done manually to not accidentally purge production queues
    //     return super.updateSOAP(metadata);
    // }
    /**
     * checks if the current metadata entry should be saved on retrieve or not
     * @static
     * @param {Object} metadataEntry metadata entry
     * @returns {boolean} if false, do not save
     * @memberof MetadataType
     */
    // static isFiltered(metadataEntry) {
    //     try {
    //         // get folder path to be able to filter journey-created TSDs
    //         const folderPath = Util.getFromCache(
    //             this.cache,
    //             'folder',
    //             metadataEntry.CategoryID,
    //             'ID',
    //             'Path'
    //         );

    //         if (folderPath && folderPath.startsWith('Journey Builder Sends/')) {
    //             // filter out any triggered sends that were auto-created by journeys
    //             return true;
    //         }
    //     } catch (ex) {
    //         // handle it in parseMetadata()
    //     }
    //     return false;
    // }

    /**
     * manages post retrieve steps
     * @param {Object} metadata a single query
     * @returns {Object[]} Array with one metadata object and one query string
     */
    static postRetrieveTasks(metadata) {
        return this.parseMetadata(metadata);
    }
    /**
     * parses retrieved Metadata before saving
     * @param {Object} metadata a single query activity definition
     * @returns {Array} Array with one metadata object and one sql string
     */
    static parseMetadata(metadata) {
        metadata.type__c = 'Installed Package';
        if (metadata.Email.includes('@') && !metadata.Name.endsWith('app user')) {
            metadata.type__c = 'User';
        }

        // remove IsPlatformObject, always has to be 'false'
        // delete metadata.IsPlatformObject;
        // // folder
        // try {
        //     metadata.r__folder_Path = Util.getFromCache(
        //         this.cache,
        //         'folder',
        //         metadata.CategoryID,
        //         'ID',
        //         'Path'
        //     );
        //     delete metadata.CategoryID;
        // } catch (ex) {
        //     Util.logger.warn(
        //         `Triggered Send '${metadata.Name}'/'${metadata.CustomerKey}': ${ex.message}`
        //     );
        // }
        // // email
        // try {
        //     // classic
        //     const classicEmail = Util.getFromCache(
        //         this.cache,
        //         'email',
        //         metadata.Email.ID,
        //         'ID',
        //         'Name'
        //     );
        //     metadata.r__email_Name = classicEmail;
        //     delete metadata.Email;
        // } catch (ex) {
        //     try {
        //         // content builder
        //         const contentBuilderEmailName = Util.getFromCache(
        //             this.cache,
        //             'asset',
        //             metadata.Email.ID,
        //             'legacyData.legacyId',
        //             'name'
        //         );
        //         metadata.r__assetMessage_Name = contentBuilderEmailName;
        //         const contentBuilderEmailKey = Util.getFromCache(
        //             this.cache,
        //             'asset',
        //             metadata.Email.ID,
        //             'legacyData.legacyId',
        //             'customerKey'
        //         );
        //         metadata.r__assetMessage_Key = contentBuilderEmailKey;
        //         delete metadata.Email;
        //     } catch (ex) {
        //         Util.logger.warn(
        //             `${this.definition.typeName} '${metadata.Name}'/'${metadata.CustomerKey}': Could not find email with ID ${metadata.Email.ID} in Classic nor in Content Builder.`
        //         );
        //     }
        // }
        // // List
        // try {
        //     metadata.r__list_PathName = Util.getListPathNameFromCache(
        //         this.cache,
        //         metadata.List.ID,
        //         'ID'
        //     );
        //     delete metadata.List;
        // } catch (ex) {
        //     Util.logger.warn(
        //         `${this.definition.typeName} '${metadata.Name}'/'${metadata.CustomerKey}': ${ex.message}`
        //     );
        // }

        return metadata;
    }
}

// Assign definition to static attributes
AccountUser.definition = require('../MetadataTypeDefinitions').accountUser;

module.exports = AccountUser;
