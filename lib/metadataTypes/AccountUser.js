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
     * Creates markdown documentation of all roles
     * @param {Object} buObject properties for auth
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
            let type = 'App';
            if (user.Email.includes('@')) {
                type = 'User';
            }
            let userPermissions = '';
            if (user.UserPermissions) {
                if (!user.UserPermissions.length) {
                    // 1 single user permission found, normalize it
                    user.UserPermissions = [user.UserPermissions];
                }
                userPermissions = user.UserPermissions.map((item) => item.ID).join(', ');
            }
            let roles = '';
            if (user.Roles && user.Roles.Role) {
                if (!user.Roles.Role.length) {
                    // 1 single role found, normalize it
                    user.Roles.Role = [user.Roles.Role];
                }

                roles = user.Roles.Role.map((item) => item.Name).join(', ');
            }
            users.push({
                TYPE: type,
                ID: user.ID,
                AccountUserID: user.AccountUserID,
                CustomerKey: user.CustomerKey,
                Name: user.Name,
                Email: user.Email,
                NotificationEmailAddress: user.NotificationEmailAddress,
                ActiveFlag: user.ActiveFlag === 'true' ? true : false,
                IsAPIUser: user.IsAPIUser === 'true' ? true : false,
                MustChangePassword: user.MustChangePassword === 'true' ? true : false,
                DefaultBusinessUnit: user.DefaultBusinessUnit,
                UserPermissions: userPermissions,
                Roles: roles,
                LastSuccessfulLogin: user.LastSuccessfulLogin,
                CreatedDate: user.CreatedDate,
                ModifiedDate: user.ModifiedDate,
            });
        }
        console.log(users);
        // Create output markdown TODO
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
