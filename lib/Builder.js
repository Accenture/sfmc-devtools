'use strict';

const Util = require('./util/util');

const MetadataTypeInfo = require('./MetadataTypeInfo');
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
     * @param {Util.SDK} client fuel client
     */
    constructor(properties, buObject, client) {
        this.client = client;
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

                    MetadataTypeInfo[type].client = this.client;
                    MetadataTypeInfo[type].properties = this.properties;
                    return MetadataTypeInfo[type].buildDefinition(
                        this.templateDir,
                        this.targetDir,
                        name,
                        variables
                    );
                })
            );
            // TODO confirm if should replace this.metadata
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
    /**
     * ensure provided MarketList exists and it's content including markets and BUs checks out
     * @param {String} mlName name of marketList
     * @param {Object} properties General configuration to be used in retrieve
     * @param {Object} properties.markets list of template variable combos
     * @param {Object} properties.marketList list of bu-market combos
     * @param {Object} properties.credentials list of credentials and their BUs
     * @returns {void} throws errors if problems were found
     */
    static verifyMarketList(mlName, properties) {
        if (!properties.marketList[mlName]) {
            // ML does not exist
            throw new Error(`Market List ${mlName} is not defined`);
        } else {
            // ML exists, check if it is properly set up

            // check if BUs in marketList are valid
            let buCounter = 0;
            for (const businessUnit in properties.marketList[mlName]) {
                if (businessUnit !== 'description') {
                    buCounter++;
                    const [cred, bu] = businessUnit ? businessUnit.split('/') : [null, null];
                    if (
                        !properties.credentials[cred] ||
                        !properties.credentials[cred].businessUnits[bu]
                    ) {
                        throw new Error(`'${businessUnit}' in Market ${mlName} is not defined.`);
                    }
                    // check if markets are valid
                    let marketArr = properties.marketList[mlName][businessUnit];
                    if ('string' === typeof marketArr) {
                        marketArr = [marketArr];
                    }
                    for (const market of marketArr) {
                        if (!properties.markets[market]) {
                            throw new Error(`Market '${market}' is not defined.`);
                        } else {
                            // * markets can be empty or include variables. Nothing we can test here
                        }
                    }
                }
            }
            if (!buCounter) {
                throw new Error(`No BUs defined in marketList ${mlName}`);
            }
        }
    }
}

module.exports = Builder;
