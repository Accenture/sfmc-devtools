'use strict';

const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const File = require('../util/file');

/**
 * ImportFile MetadataType
 * @augments MetadataType
 */
class Role extends MetadataType {
    /**
     * Gets metadata from Marketing Cloud
     * @param {String} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {String[]} _ Returns specified fields even if their retrieve definition is not set to true
     * @param {Object} buObject properties for auth
     * @returns {Promise<Object>} Metadata store object
     */
    static async retrieve(retrieveDir, _, buObject) {
        if (retrieveDir) {
            // don't run for BUs other than Parent BU
            // this check does not work during caching
            if (buObject.eid !== buObject.mid) {
                Util.logger.info('Skipping Role retrieval on non-parent BU');
                return;
            }
        }

        const fields = Object.keys(this.definition.fields).reduce((accumulator, currentValue) => {
            if (this.definition.fields[currentValue].retrieving) {
                accumulator.push(currentValue);
            }
            return accumulator;
        }, []);
        const requestParams = {
            // filter individual roles
            filter: {
                leftOperand: 'IsPrivate',
                operator: 'equals',
                rightOperand: false,
            },
        };
        const results = await this.client.soap.retrieve('Role', fields, requestParams);

        const parsed = this.parseResponseBody(results);
        if (retrieveDir) {
            const savedMetadata = await this.saveResults(parsed, retrieveDir, null);
            Util.logger.info(
                `Downloaded: ${this.definition.type} (${Object.keys(savedMetadata).length})`
            );
            if (this.properties.metaDataTypes.documentOnRetrieve.includes(this.definition.type)) {
                await this.document(buObject, savedMetadata);
            }
        }
        return { metadata: parsed, type: this.definition.type };
    }
    /**
     * Gets executed before deploying metadata
     * @param {Object} metadata a single metadata item
     * @returns {Promise<Object>} Promise of a single metadata item
     */
    static async preDeployTasks(metadata) {
        if (this.definition.deployBlacklist.includes(metadata.CustomerKey)) {
            throw new Error(
                `Skipped ${metadata.Name} (${metadata.CustomerKey}) because its CustomerKey is reserved for a default system role.`
            );
        }
        return metadata;
    }

    /**
     * Create a single Role.
     * @param {Object} metadata single metadata entry
     * @returns {Promise} Promise
     */
    static create(metadata) {
        return super.createSOAP(metadata);
    }

    /**
     * Updates a single Role.
     * @param {Object} metadata single metadata entry
     * @returns {Promise} Promise
     */
    static update(metadata) {
        return super.updateSOAP(metadata);
    }

    /**
     * Creates markdown documentation of all roles
     * @param {Object} buObject properties for auth
     * @param {Object} [metadata] role definitions
     * @returns {Promise<void>} -
     */
    static async document(buObject, metadata) {
        if (buObject.eid !== buObject.mid) {
            Util.logger.error(
                `Roles can only be retrieved & documented for the ${Util.parentBuName}`
            );
            return;
        }
        if (!metadata) {
            try {
                metadata = this.readBUMetadataForType(
                    File.normalizePath([
                        this.properties.directories.retrieve,
                        buObject.credential,
                        Util.parentBuName,
                    ]),
                    true
                ).role;
            } catch (ex) {
                Util.logger.error(ex.message);
                return;
            }
        }
        const directory = this.properties.directories.roles;

        // initialize permission object
        this.allPermissions = {};
        // traverse all permissions recursively and write them into allPermissions object once it has reached the end
        for (const role in metadata) {
            metadata[role].PermissionSets.PermissionSet.forEach((element) => {
                this._traverseRoles(role, element);
            });
        }
        // Create output markdown
        let output = `# Permission Overview - ${buObject.credential}\n\n`;
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
> **•** = _Not Set_: User permission for this app or functionality is not explicitely granted nor denied, but defaults to Deny
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
                    metadata[role].IsSystemDefined === 'true'
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
                    if (this.allPermissions[permGroup][permission][role] === 'true') {
                        output += ' + |';
                    } else if (this.allPermissions[permGroup][permission][role] === 'false') {
                        output += ' - |';
                    } else if (
                        'undefined' === typeof this.allPermissions[permGroup][permission][role]
                    ) {
                        output += ' • |';
                    } else {
                        output += ' ' + this.allPermissions[permGroup][permission][role] + ' |';
                    }
                }
                output += '\n';
            }
            output += '\n';
        }
        try {
            const filename = buObject.credential;
            // write to disk
            await File.writeToFile(directory, filename + '.roles', 'md', output);
            Util.logger.info(`Created ${directory}${filename}.roles.md`);
            if (['html', 'both'].includes(this.properties.options.documentType)) {
                Util.logger.warn('HTML-based documentation of roles currently not supported.');
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
     * @param {string} [isAllowed] "true" / "false" from the
     * @memberof Role
     * @returns {void}
     */
    static _traverseRoles(role, element, permission, isAllowed) {
        let _permission;
        if (permission) {
            _permission = permission + ' > ' + element.Name;
        } else {
            _permission = element.Name;
        }
        // Reached end: write permission into this.allPermissions
        if (element.Operation) {
            const permSplit = _permission.split(' > ');
            const basePermission = permSplit.shift();
            const permissionName = permSplit.join(' > ');
            if (!this.allPermissions[basePermission]) {
                this.allPermissions[basePermission] = {};
            }
            if (!this.allPermissions[basePermission][permissionName]) {
                this.allPermissions[basePermission][permissionName] = {};
            }
            this.allPermissions[basePermission][permissionName][role] = element.IsAllowed
                ? element.IsAllowed
                : isAllowed;
            // Not at end: Traverse more
        } else if (element.PermissionSets) {
            if (Array.isArray(element.PermissionSets.PermissionSet)) {
                element.PermissionSets.PermissionSet.forEach((nextElement) => {
                    this._traverseRoles(role, nextElement, _permission);
                });
            } else {
                this._traverseRoles(
                    role,
                    element.PermissionSets.PermissionSet,
                    _permission,
                    element.IsAllowed,
                    isAllowed
                );
            }
            // Not at end: Traverse more
        } else if (element.Permissions) {
            if (Array.isArray(element.Permissions.Permission)) {
                element.Permissions.Permission.forEach((nextElement) => {
                    this._traverseRoles(
                        role,
                        nextElement,
                        _permission,
                        element.IsAllowed ? element.IsAllowed : isAllowed
                    );
                });
            } else {
                this._traverseRoles(
                    role,
                    element.Permissions.Permission,
                    _permission,
                    element.IsAllowed ? element.IsAllowed : isAllowed
                );
            }
        }
    }
}

// Assign definition to static attributes
Role.definition = require('../MetadataTypeDefinitions').role;
Role.cache = {};
Role.client = undefined;

module.exports = Role;
