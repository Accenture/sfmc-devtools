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
 * @typedef {import('../../types/mcdev.d.js').SoapSDKFilterSimple} SoapSDKFilterSimple
 * @typedef {import('../../types/mcdev.d.js').TemplateMap} TemplateMap
 */

/**
 * ImportFile MetadataType
 *
 * @augments MetadataType
 */
class Role extends MetadataType {
    /**
     * Gets metadata from Marketing Cloud
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] Returns specified fields even if their retrieve definition is not set to true
     * @param {void | string[]} [___] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Metadata store object
     */
    static async retrieve(retrieveDir, _, ___, key) {
        if (retrieveDir && this.buObject.eid !== this.buObject.mid) {
            // don't run for BUs other than Parent BU
            // this check does not work during caching
            Util.logger.info(' - Skipping Role retrieval on non-parent BU');
            return;
        }

        const fields = super.getFieldNamesToRetrieve(null, !retrieveDir);

        /** @type {SoapRequestParams} */
        let requestParams = {
            // filter individual roles
            filter: {
                leftOperand: 'IsPrivate',
                operator: 'equals',
                rightOperand: false,
            },
        };
        if (key) {
            // move original filter down one level into rightOperand and add key filter into leftOperand
            /** @type {SoapSDKFilterSimple} */
            const keyFilter = {
                leftOperand: 'CustomerKey',
                operator: 'equals',
                rightOperand: key,
            };
            requestParams = {
                filter: {
                    leftOperand: keyFilter,
                    operator: 'AND',
                    rightOperand: requestParams.filter,
                },
            };
        }

        const results = await this.client.soap.retrieve('Role', fields, requestParams);

        const parsed = this.parseResponseBody(results);
        if (retrieveDir) {
            const savedMetadata = await super.saveResults(parsed, retrieveDir, null);
            Util.logger.info(
                `Downloaded: ${this.definition.type} (${Object.keys(savedMetadata).length})` +
                    Util.getKeysString(key)
            );

            await this.runDocumentOnRetrieve(key, savedMetadata);
        }

        await this.cacheDefaultRolesAndTimezones(parsed);

        return { metadata: parsed, type: this.definition.type };
    }

    /**
     * adds default roles to the list of retrieved roles for proper caching (but not storing)
     * also caches available timezones for retrieve-user
     *
     * @param {MetadataTypeMap} parsed list or previously retrieved items as reference
     */
    static async cacheDefaultRolesAndTimezones(parsed) {
        // retrieve "Marketing Cloud%" roles not returned by SOAP API for cache (required by retrieve-user)
        // also cache available timezones for retrieve-user
        Util.logger.info(Util.getGrayMsg(' - Caching default roles and timezones'));
        const { roles, timeZones } = await this.client.rest.get(
            '/platform/v1/setup/quickflow/data'
        );
        // this endpoint does not provide keys
        const roleNameKeyMap = {
            'Marketing Cloud Administrator': 'SYS_DEF_IMHADMIN',
            'Marketing Cloud Channel Manager': 'SYS_DEF_CHANNELMANAGER',
            'Marketing Cloud Content Editor/Publisher': 'SYS_DEF_CONTENTEDIT',
            'Marketing Cloud Security Administrator': 'SYS_DEF_SECURITYADMIN',
            'Marketing Cloud Viewer': 'SYS_DEF_VIEWER',
        };
        for (const role of roles) {
            if (roleNameKeyMap[role.roleName]) {
                parsed[roleNameKeyMap[role.roleName]] = {
                    CustomerKey: roleNameKeyMap[role.roleName],
                    Name: role.roleName,
                    ObjectID: role.roleID,
                    Desscription: role.description,
                    CreatedDate: '2012-02-21T02:09:19.983',
                    IsSystemDefined: true,
                    c__notAssignable: true,
                };
            }
        }
        // the languages object is incomplete. the actual list is much longer --> ignoring it here
        // convert timeZones to object
        const timeZonesObj = {};
        for (const timeZone of timeZones) {
            timeZonesObj[timeZone.id] = timeZone;
        }
        // cache timeZones to share it with other type-classes
        cache.setMetadata('_timezone', timeZonesObj);
    }

    /**
     * Gets executed before deploying metadata
     *
     * @param {MetadataTypeItem} metadata a single metadata item
     * @returns {MetadataTypeItem} Promise of a single metadata item
     */
    static preDeployTasks(metadata) {
        if (this.definition.deployBlacklist.includes(metadata.CustomerKey)) {
            throw new Error(
                `Skipped ${metadata.Name} (${metadata.CustomerKey}) because its CustomerKey is reserved for a default system role.`
            );
        }
        return metadata;
    }

    /**
     * Create a single Role.
     *
     * @param {MetadataTypeItem} metadata single metadata entry
     * @returns {Promise} Promise
     */
    static create(metadata) {
        return super.createSOAP(metadata);
    }

    /**
     * Updates a single Role.
     *
     * @param {MetadataTypeItem} metadata single metadata entry
     * @returns {Promise} Promise
     */
    static update(metadata) {
        return super.updateSOAP(metadata);
    }

    /**
     * Creates markdown documentation of all roles
     *
     * @param {MetadataTypeMap} [metadata] role definitions
     * @returns {Promise.<void>} -
     */
    static async document(metadata) {
        if (this.buObject.eid !== this.buObject.mid) {
            Util.logger.error(
                `Roles can only be retrieved & documented for the ${Util.parentBuName}`
            );
            return;
        }
        if (!metadata) {
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
                ).role;
            } catch (ex) {
                Util.logger.error(ex.message);
                return;
            }
        }
        const directory = File.normalizePath([this.properties.directories.docs, 'role']);

        // initialize permission object
        this.allPermissions = {};
        // traverse all permissions recursively and write them into allPermissions object once it has reached the end
        for (const role in metadata) {
            // filter standard rules
            if (
                this.properties.options?.documentStandardRoles === false &&
                'string' === typeof metadata[role]?.CustomerKey && // key could be numeric
                metadata[role].CustomerKey.startsWith('SYS_DEF')
            ) {
                delete metadata[role];
            } else {
                for (const element of metadata[role].PermissionSets.PermissionSet) {
                    this._traverseRoles(role, element);
                }
            }
        }
        // Create output markdown
        let output = `# Permission Overview - ${this.buObject.credential}\n\n`;
        output += `> **Legend**
>
> <hr>
>
> **[Role Name]** = System Default Role
>
> **Role Name** = Custom Role
>
> **+** = _Allow_: User has access to the application or functionality
>
> ** •** = _Not Set_: User permission for this app or functionality is not explicitely granted nor denied, but defaults to Deny
>
> **-** = _Deny_: User does not have access to the app or functionality
>
> <hr>\n\n`;
        // Loop through all permissions
        for (const permGroup in this.allPermissions) {
            output += '## ' + permGroup + '\n\n';
            // create table header
            output += '| Permission |';
            let separator = '| --- |';
            for (const role in metadata) {
                output +=
                    metadata[role].IsSystemDefined === true
                        ? ` [${metadata[role].Name}] |`
                        : ` ${metadata[role].Name} |`;
                separator += ' --- |';
            }
            output += '\n' + separator + '\n';
            // Write all permissions of a major permission group
            // output += '| ';
            for (const permission in this.allPermissions[permGroup]) {
                output += '| ' + permission + ' |';
                for (const role in this.allPermissions[permGroup][permission]) {
                    if (this.allPermissions[permGroup][permission][role] === true) {
                        output += ' + |';
                    } else if (this.allPermissions[permGroup][permission][role] === false) {
                        output += ' - |';
                    } else if (
                        'undefined' === typeof this.allPermissions[permGroup][permission][role]
                    ) {
                        output += '  • |';
                    } else {
                        output += ' ' + this.allPermissions[permGroup][permission][role] + ' |';
                    }
                }
                output += '\n';
            }
            output += '\n';
        }
        try {
            const filename = this.buObject.credential;
            // write to disk
            await File.writeToFile(directory, filename + '.roles', 'md', output);
            Util.logger.info(`Created ${File.normalizePath([directory, filename])}.roles.md`);
            if (['html', 'both'].includes(this.properties.options.documentType)) {
                Util.logger.warn(' - HTML-based documentation of roles currently not supported.');
            }
        } catch (ex) {
            Util.logger.error(`Roles.document():: error | `, ex.message);
        }
    }

    /**
     * iterates through permissions to output proper row-names for nested permissionss
     *
     * @static
     * @param {string} role name of the user role
     * @param {object} element data of the permission
     * @param {string} [permission] name of the permission
     * @param {string} [isAllowed] "true" / "false" from the parent
     * @memberof Role
     * @returns {void}
     */
    static _traverseRoles(role, element, permission, isAllowed) {
        const _permission = permission ? permission + ' > ' + element.Name : element.Name;
        // Reached end: write permission into this.allPermissions
        if (element.Operation) {
            const permSplit = _permission.split(' > ');
            const permOperation = permSplit.pop();
            let basePermission = permSplit.shift();
            if (basePermission === 'Interactive Marketing Hub') {
                basePermission = 'Salesforce Marketing Cloud';
            }
            const permissionName = `<nobr><b>${permSplit.join(
                ' > '
            )}</b> > ${permOperation}</nobr>`;
            if (!this.allPermissions[basePermission]) {
                this.allPermissions[basePermission] = {};
            }
            if (!this.allPermissions[basePermission][permissionName]) {
                this.allPermissions[basePermission][permissionName] = {};
            }
            this.allPermissions[basePermission][permissionName][role] =
                element.IsAllowed || isAllowed;
            // Not at end: Traverse more
        } else if (element.PermissionSets) {
            if (Array.isArray(element.PermissionSets.PermissionSet)) {
                for (const nextElement of element.PermissionSets.PermissionSet) {
                    this._traverseRoles(role, nextElement, _permission);
                }
            } else {
                this._traverseRoles(
                    role,
                    element.PermissionSets.PermissionSet,
                    _permission,
                    element.IsAllowed || isAllowed
                );
            }
            // Not at end: Traverse more
        } else if (element.Permissions) {
            if (Array.isArray(element.Permissions.Permission)) {
                for (const nextElement of element.Permissions.Permission) {
                    this._traverseRoles(
                        role,
                        nextElement,
                        _permission,
                        element.IsAllowed || isAllowed
                    );
                }
            } else {
                this._traverseRoles(
                    role,
                    element.Permissions.Permission,
                    _permission,
                    element.IsAllowed || isAllowed
                );
            }
        }
    }
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
Role.definition = MetadataTypeDefinitions.role;

export default Role;
