'use strict';

const TYPE = require('../types/mcdev.d');
const Util = require('./util/util');
const File = require('./util/file');

const MetadataTypeInfo = require('./MetadataTypeInfo');
// @ts-ignore

/**
 * Builds metadata from a template using market specific customisation
 */
class Builder {
    /**
     * Creates a Builder, uses v2 auth if v2AuthOptions are passed.
     *
     * @param {object} properties properties for auth
     * @param {string} properties.clientId clientId for FuelSDK auth
     * @param {string} properties.clientSecret clientSecret for FuelSDK auth
     * @param {object} properties.directories list of default directories
     * @param {string} properties.directories.template where templates are saved
     * @param {string} properties.directories.templateBuilds where template-based deployment definitions are saved
     * @param {string} properties.tenant v2 Auth Tenant Information
     * @param {string} properties.businessUnits ID of Business Unit to authenticate with
     * @param {TYPE.BuObject} buObject properties for auth
     * @param {TYPE.SDK} client fuel client
     */
    constructor(properties, buObject, client) {
        this.client = client;
        this.properties = properties;
        this.templateDir = properties.directories.template;
        this.retrieveDir = File.normalizePath([
            properties.directories.retrieve,
            buObject.credential,
            buObject.businessUnit,
        ]);

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
     *
     * @param {string} metadataType metadata type to build
     * @param {string} name name of metadata to build
     * @param {TYPE.TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {Promise} Promise
     */
    async buildDefinition(metadataType, name, templateVariables) {
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
                        templateVariables
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
            Util.logger.errorStack(ex, 'mcdev.buildDefinition');
        }
        return this.metadata;
    }
    /**
     * Builds a specific metadata file by name
     *
     * @param {string} metadataType metadata type to create a template of
     * @param {string} key customerkey of metadata to create a template of
     * @param {TYPE.TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {Promise<{metadata:Util.MetadataTypeItem,type:string}>} Promise
     */
    async buildTemplate(metadataType, key, templateVariables) {
        let keyArr;
        if (key.includes(',')) {
            keyArr = key.split(',').map((item) =>
                // allow whitespace in comma-separated lists
                item.trim()
            );
        } else {
            keyArr = [key.trim()];
        }
        const type = metadataType;
        try {
            const result = await Promise.all(
                keyArr.map((key) => {
                    // with npx and powershell spaces are not parsed correctly as part of a string
                    // we hence require users to put %20 in their stead and have to convert that back
                    key = key.split('%20').join(' ');

                    MetadataTypeInfo[type].client = this.client;
                    MetadataTypeInfo[type].properties = this.properties;

                    return MetadataTypeInfo[type].buildTemplate(
                        this.retrieveDir,
                        this.templateDir,
                        key,
                        templateVariables
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
            Util.logger.errorStack(ex, 'mcdev.buildTemplate');
        }
        return this.metadata;
    }
    /**
     * ensure provided MarketList exists and it's content including markets and BUs checks out
     *
     * @param {string} mlName name of marketList
     * @param {object} properties General configuration to be used in retrieve
     * @param {object} properties.markets list of template variable combos
     * @param {object} properties.marketList list of bu-market combos
     * @param {object} properties.credentials list of credentials and their BUs
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
