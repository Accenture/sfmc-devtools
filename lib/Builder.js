'use strict';

const TYPE = require('../types/mcdev.d');
const Util = require('./util/util');
const File = require('./util/file');
const Cli = require('./util/cli');
const auth = require('./util/auth');
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
     * @param {object} properties.directories list of default directories
     * @param {string} properties.directories.template where templates are saved
     * @param {string} properties.directories.templateBuilds where template-based deployment definitions are saved
     * @param {string} properties.businessUnits ID of Business Unit to authenticate with
     * @param {TYPE.BuObject} buObject properties for auth
     */
    constructor(properties, buObject) {
        this.properties = properties;
        this.templateDir = properties.directories.template;
        this.retrieveDir = File.normalizePath([
            properties.directories.retrieve,
            buObject.credential,
            buObject.businessUnit,
        ]);
        this.buObject = buObject;

        // allow multiple target directories
        const templateBuildsArr = Array.isArray(properties.directories.templateBuilds)
            ? properties.directories.templateBuilds
            : [properties.directories.templateBuilds];
        this.targetDir = templateBuildsArr.map(
            (directoriesTemplateBuilds) =>
                directoriesTemplateBuilds + buObject.credential + '/' + buObject.businessUnit
        );

        /**
         * @type {TYPE.MultiMetadataTypeList}
         */
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

                    MetadataTypeInfo[type].client = auth.getSDK(this.buObject);
                    MetadataTypeInfo[type].properties = this.properties;
                    MetadataTypeInfo[type].buObject = this.buObject;
                    return MetadataTypeInfo[type].buildDefinition(
                        this.templateDir,
                        this.targetDir,
                        name,
                        templateVariables
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
            Util.logger.errorStack(ex, 'mcdev.buildDefinition');
        }
        return this.metadata;
    }
    /**
     * Build a template based on a list of metadata files in the retrieve folder.
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {string} selectedType supported metadata type
     * @param {string[]} keyArr customerkey of the metadata
     * @param {string} market market localizations
     * @returns {Promise.<TYPE.MultiMetadataTypeList>} -
     */
    static async buildTemplate(businessUnit, selectedType, keyArr, market) {
        Util.logger.info('mcdev:: Build Definition from Template');
        const properties = File.loadConfigFile();
        if (!Util._isValidType(selectedType)) {
            return;
        }
        if (selectedType.includes('-')) {
            Util.logger.error(
                `:: '${selectedType}' is not a valid metadata type. Please don't include subtypes.`
            );
            return;
        }
        const buObject = await Cli.getCredentialObject(properties, businessUnit);
        if (buObject !== null) {
            const builder = new Builder(properties, buObject);
            if (this._checkMarket(market)) {
                return builder.buildTemplate(selectedType, keyArr, properties.markets[market]);
            }
        }
    }
    /**
     * Build a template based on a list of metadata files in the retrieve folder.
     *
     * @param {string} metadataType metadata type to create a template of
     * @param {string[]} keyArr customerkey of metadata to create a template of
     * @param {TYPE.TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {Promise.<TYPE.MultiMetadataTypeList>} Promise
     */
    async buildTemplate(metadataType, keyArr, templateVariables) {
        const type = metadataType;
        try {
            /** @type {TYPE.MetadataTypeItemObj[]} */
            const result = await Promise.all(
                keyArr.map((key) => {
                    // with npx and powershell spaces are not parsed correctly as part of a string
                    // we hence require users to put %20 in their stead and have to convert that back
                    key = key.split('%20').join(' ');

                    MetadataTypeInfo[type].client = this.client;
                    MetadataTypeInfo[type].properties = this.properties;
                    MetadataTypeInfo[type].buObject = this.buObject;

                    /** @type {TYPE.MetadataTypeItemObj} */
                    return MetadataTypeInfo[type].buildTemplate(
                        this.retrieveDir,
                        this.templateDir,
                        key,
                        templateVariables
                    );
                })
            );
            if (result) {
                this.metadata[result[0].type] = result.map((element) => element.metadata);
            }
        } catch (ex) {
            Util.logger.errorStack(ex, 'mcdev.buildTemplate');
        }
        return this.metadata;
    }
    /**
     * Build a specific metadata file based on a template.
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {string} selectedType supported metadata type
     * @param {string} name name of the metadata
     * @param {string} market market localizations
     * @returns {Promise.<void>} -
     */
    static async buildDefinition(businessUnit, selectedType, name, market) {
        const properties = File.loadConfigFile();
        if (!Util._isValidType(selectedType)) {
            return;
        }
        if (selectedType.includes('-')) {
            Util.logger.error(
                `:: '${selectedType}' is not a valid metadata type. Please don't include subtypes.`
            );
            return;
        }
        const buObject = await Cli.getCredentialObject(properties, businessUnit);
        if (buObject !== null) {
            const builder = new Builder(properties, buObject);
            if (market === '*') {
                for (const oneMarket in properties.markets) {
                    builder.buildDefinition(selectedType, name, properties.markets[oneMarket]);
                }
            } else {
                if (this._checkMarket(market)) {
                    builder.buildDefinition(selectedType, name, properties.markets[market]);
                }
            }
        }
    }
    /**
     * Build a specific metadata file based on a template using a list of bu-market combos
     *
     * @param {string} listName name of list of BU-market combos
     * @param {string} type supported metadata type
     * @param {string} name name of the metadata
     * @returns {Promise.<void>} -
     */
    static async buildDefinitionBulk(listName, type, name) {
        const properties = File.loadConfigFile();
        if (!properties.marketList) {
            Util.logger.error('Please define properties.marketList object in your config');
            return;
        }
        if (!properties.marketList[listName]) {
            Util.logger.error(`Please define properties.marketList.${listName} in your config`);
            return;
        }
        if (type && !MetadataTypeInfo[type]) {
            Util.logger.error(`:: '${type}' is not a valid metadata type`);
            return;
        }
        let i = 0;
        for (const businessUnit in properties.marketList[listName]) {
            if (businessUnit === 'description') {
                // skip, it's just a metadata on this list and not a BU
                continue;
            }
            i++;
            const market = properties.marketList[listName][businessUnit];
            let marketList = [];
            if ('string' === typeof market) {
                marketList.push(market);
            } else {
                marketList = market;
            }
            marketList.forEach((market) => {
                if (market && properties.markets[market]) {
                    Util.logger.info(`Executing for '${businessUnit}': '${market}'`);
                    this.buildDefinition(businessUnit, type, name, market);
                } else {
                    Util.logger.error(
                        `Could not find '${market}' in properties.markets. Please check your properties.marketList.${listName} confguration.`
                    );
                }
            });
        }
        if (!i) {
            Util.logger.error('Please define properties.marketList in your config');
        }
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
    /**
     * check if a market name exists in current mcdev config
     *
     * @param {string} market market localizations
     * @returns {boolean} found market or not
     */
    static _checkMarket(market) {
        const properties = File.loadConfigFile();
        if (properties.markets[market]) {
            return true;
        } else {
            Util.logger.error(`Could not find the market '${market}' in your configuration file.`);
            const marketArr = Object.values(properties.markets);

            if (marketArr.length) {
                Util.logger.info('Available markets are: ' + marketArr.join(', '));
            }
            return false;
        }
    }
}

module.exports = Builder;
