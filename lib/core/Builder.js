'use strict';

const Util = require('../util/util');

const MetadataRef = require('../metadataTypes');
// @ts-ignore

/**
 * Builds metadata from a template using market specific customisation
 */
class Builder {
    /**
     * Creates a Builder, uses v2 auth if v2AuthOptions are passed.
     *
     * @param {Object} properties properties for auth
     * @param {String} properties.clientId clientId for FuelSDK auth
     * @param {String} properties.clientSecret clientSecret for FuelSDK auth
     * @param {Object} properties.directories list of default directories
     * @param {String} properties.directories.template where templates are saved
     * @param {String} properties.directories.templateBuilds where template-based deployment definitions are saved
     * @param {String} properties.tenant v2 Auth Tenant Information
     * @param {String} properties.businessUnits ID of Business Unit to authenticate with
     * @param {Object} buObject properties for auth
     * @param {String} buObject.clientId clientId for FuelSDK auth
     * @param {String} buObject.clientSecret clientSecret for FuelSDK auth
     * @param {Object} buObject.credential clientId for FuelSDK auth
     * @param {String} buObject.tenant v2 Auth Tenant Information
     * @param {String} buObject.mid ID of Business Unit to authenticate with
     * @param {String} buObject.businessUnit name of Business Unit to authenticate with
     */
    constructor(properties, buObject) {
        this.properties = properties;
        this.templateDir = properties.directories.template;

        // allow multiple target directories
        const templateBuildsArr = Array.isArray(properties.directories.templateBuilds)
            ? properties.directories.templateBuilds
            : [properties.directories.templateBuilds];

        this.targetDir = templateBuildsArr.map(
            (directoriesTemplateBuilds) =>
                directoriesTemplateBuilds + buObject.credential + '/' + buObject.businessUnit
        );

        this.metadata = {};
    }

    /**
     * Builds a specific metadata file by name
     * @param {String} metadataType metadata type to build
     * @param {String} name name of metadata to build
     * @param {Object} variables variables to be replaced in the metadata
     * @returns {Promise} Promise
     */
    async buildDefinition(metadataType, name, variables) {
        let nameArr;
        if (name.includes(',')) {
            nameArr = name.split(',').map((item) =>
                // allow whitespace in comma-separated lists
                item.trim()
            );
        } else {
            nameArr = [name.trim()];
        }
        const type = metadataType;
        try {
            const result = await Promise.all(
                nameArr.map((name) => {
                    // with npx and powershell spaces are not parsed correctly as part of a string
                    // we hence require users to put %20 in their stead and have to convert that back
                    name = name.split('%20').join(' ');

                    MetadataRef.getInfo(type).cache = null;
                    MetadataRef.getInfo(type).properties = this.properties;
                    return MetadataRef.getInfo(type).buildDefinition(
                        this.templateDir,
                        this.targetDir,
                        name,
                        variables
                    );
                })
            );
            if (result) {
                this.metadata[result[0].type] = [];
                result.forEach((element) => {
                    this.metadata[result[0].type].push(element.metadata);
                });
            }
        } catch (ex) {
            Util.logger.error('mcdev.buildDefinition:' + ex.message);
            Util.logger.debug(ex.stack);
            if (Util.logger.level === 'debug') {
                console.log(ex.stack);
            }
        }
        return this.metadata;
    }
}

module.exports = Builder;
