'use strict';

const TYPE = require('../types/mcdev.d');
const Util = require('./util/util');
const File = require('./util/file');
const config = require('./util/config');
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
     * @param {TYPE.Mcdevrc} properties properties for auth
saved
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
     * @returns {Promise.<TYPE.MultiMetadataTypeList>} Promise
     */
    async _buildDefinition(metadataType, name, templateVariables) {
        let nameArr;
        /* eslint-disable unicorn/prefer-ternary */
        if (name.includes(',')) {
            nameArr = name.split(',').map((item) =>
                // allow whitespace in comma-separated lists
                item.trim()
            );
        } else {
            nameArr = [name.trim()];
        }
        /* eslint-enable unicorn/prefer-ternary */

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
                for (const element of result) {
                    this.metadata[result[0].type].push(element.metadata);
                }
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
        const properties = await config.getProperties();
        if (!(await config.checkProperties(properties))) {
            return null;
        }
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
            if (Util.checkMarket(market, properties)) {
                return builder._buildTemplate(selectedType, keyArr, properties.markets[market]);
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
    async _buildTemplate(metadataType, keyArr, templateVariables) {
        const type = metadataType;
        try {
            /** @type {TYPE.MetadataTypeItemObj[]} */
            const result = await Promise.all(
                keyArr.map((key) => {
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
     * @returns {Promise.<TYPE.MultiMetadataTypeList>} -
     */
    static async buildDefinition(businessUnit, selectedType, name, market) {
        const properties = await config.getProperties();
        if (!(await config.checkProperties(properties))) {
            return null;
        }
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
            if (Util.checkMarket(market, properties)) {
                return builder._buildDefinition(selectedType, name, properties.markets[market]);
            }
        }
    }
    /**
     * Build a specific metadata file based on a template using a list of bu-market combos
     *
     * @param {string} listName name of list of BU-market combos
     * @param {string} type supported metadata type
     * @param {string} name name of the metadata
     * @returns {Promise.<TYPE.MultiMetadataTypeList[]>} -
     */
    static async buildDefinitionBulk(listName, type, name) {
        const properties = await config.getProperties();
        if (!(await config.checkProperties(properties))) {
            return null;
        }
        try {
            Util.verifyMarketList(listName, properties);
        } catch (ex) {
            Util.logger.error(ex.message);
            return;
        }
        if (type && !MetadataTypeInfo[type]) {
            Util.logger.error(`:: '${type}' is not a valid metadata type`);
            return;
        }
        let i = 0;
        const bdPromises = [];

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
            for (const market of marketList) {
                if (Util.checkMarket(market, properties)) {
                    Util.logger.info(`Executing for '${businessUnit}': '${market}'`);
                    // omitting "await" to speed up creation
                    bdPromises.push(this.buildDefinition(businessUnit, type, name, market));
                }
            }
        }
        const response = await Promise.all(bdPromises);

        if (!i) {
            Util.logger.error('Please define properties.marketList in your config');
        }
        return response;
    }
}

module.exports = Builder;
