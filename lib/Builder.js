'use strict';

import { Util } from './util/util.js';
import File from './util/file.js';
import config from './util/config.js';
import Cli from './util/cli.js';
import auth from './util/auth.js';
import MetadataTypeInfo from './MetadataTypeInfo.js';

/**
 * @typedef {import('../types/mcdev.d.js').BuObject} BuObject
 * @typedef {import('../types/mcdev.d.js').CodeExtract} CodeExtract
 * @typedef {import('../types/mcdev.d.js').CodeExtractItem} CodeExtractItem
 * @typedef {import('../types/mcdev.d.js').Mcdevrc} Mcdevrc
 * @typedef {import('../types/mcdev.d.js').MetadataTypeItem} MetadataTypeItem
 * @typedef {import('../types/mcdev.d.js').MetadataTypeItemDiff} MetadataTypeItemDiff
 * @typedef {import('../types/mcdev.d.js').MetadataTypeItemObj} MetadataTypeItemObj
 * @typedef {import('../types/mcdev.d.js').MetadataTypeMap} MetadataTypeMap
 * @typedef {import('../types/mcdev.d.js').MetadataTypeMapObj} MetadataTypeMapObj
 * @typedef {import('../types/mcdev.d.js').MultiMetadataTypeList} MultiMetadataTypeList
 * @typedef {import('../types/mcdev.d.js').SoapRequestParams} SoapRequestParams
 * @typedef {import('../types/mcdev.d.js').TemplateMap} TemplateMap
 */

/**
 * Builds metadata from a template using market specific customisation
 */
class Builder {
    /**
     * Creates a Builder, uses v2 auth if v2AuthOptions are passed.
     *
     * @param {Mcdevrc} properties properties for auth
saved
     * @param {BuObject} buObject properties for auth
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
        this.targetDir = templateBuildsArr.map((directoriesTemplateBuilds) =>
            File.normalizePath([
                directoriesTemplateBuilds,
                buObject.credential,
                buObject.businessUnit,
            ])
        );

        /**
         * @type {MultiMetadataTypeList}
         */
        this.metadata = {};
    }

    /**
     * Builds a specific metadata file by name
     *
     * @param {string} metadataType metadata type to build
     * @param {string[]} nameArr name of metadata to build
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {Promise.<MultiMetadataTypeList>} Promise
     */
    async _buildDefinition(metadataType, nameArr, templateVariables) {
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
            if (result && type === result[0]?.type) {
                // result elements can be undefined for each key that we did not find
                this.metadata[type] = result.filter(Boolean).map((element) => element.metadata);
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
     * @param {string[]} marketArr market localizations
     * @returns {Promise.<MultiMetadataTypeList>} -
     */
    static async buildTemplate(businessUnit, selectedType, keyArr, marketArr) {
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
        /** @type {TemplateMap} */
        const templateVariables = {};
        for (const market of marketArr) {
            if (Util.checkMarket(market, properties)) {
                Object.assign(templateVariables, properties.markets[market]);
            } else {
                // do not execute the rest of this method if a market was invalid
                return;
            }
        }
        const buObject = await Cli.getCredentialObject(properties, businessUnit);
        if (buObject !== null) {
            const builder = new Builder(properties, buObject);
            return builder._buildTemplate(selectedType, keyArr, templateVariables);
        }
    }

    /**
     * Build a template based on a list of metadata files in the retrieve folder.
     *
     * @param {string} metadataType metadata type to create a template of
     * @param {string[]} keyArr customerkey of metadata to create a template of
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {Promise.<MultiMetadataTypeList>} Promise
     */
    async _buildTemplate(metadataType, keyArr, templateVariables) {
        const type = metadataType;
        try {
            /** @type {MetadataTypeItemObj[]} */
            const result = await Promise.all(
                keyArr.map(async (key) => {
                    MetadataTypeInfo[type].properties = this.properties;
                    MetadataTypeInfo[type].buObject = this.buObject;

                    try {
                        /** @type {MetadataTypeItemObj} */
                        const response = await MetadataTypeInfo[type].buildTemplate(
                            this.retrieveDir,
                            this.templateDir,
                            key,
                            templateVariables
                        );
                        return response;
                    } catch (ex) {
                        Util.logger.errorStack(ex, ` ☇ skipping template asset: ${key}`);
                    }
                })
            );
            if (result && type === result[0]?.type) {
                // result elements can be undefined for each key that we did not find
                this.metadata[type] = result.filter(Boolean).map((element) => element.metadata);
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
     * @param {string[]} nameArr name of the metadata
     * @param {string[]} marketArr market localizations
     * @param {boolean} [isPurgeDeployFolder] whether to purge the deploy folder
     * @returns {Promise.<MultiMetadataTypeList>} -
     */
    static async buildDefinition(
        businessUnit,
        selectedType,
        nameArr,
        marketArr,
        isPurgeDeployFolder
    ) {
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
        /** @type {TemplateMap} */
        const templateVariables = {};
        for (const market of marketArr) {
            if (Util.checkMarket(market, properties)) {
                Object.assign(templateVariables, properties.markets[market]);
            } else {
                // do not execute the rest of this method if a market was invalid
                return;
            }
        }
        const buObject = await Cli.getCredentialObject(properties, businessUnit);
        if (buObject !== null) {
            // standard deploy folder
            const deployDir = File.normalizePath([
                properties.directories.deploy,
                buObject.credential,
                buObject.businessUnit,
            ]);
            const builder = new Builder(properties, buObject);

            if (isPurgeDeployFolder && builder.targetDir.includes(deployDir)) {
                // Clear output folder structure for selected sub-type
                // only run this if the standard deploy folder is a target of buildDefinition (which technically could be changed)
                await File.remove(
                    File.normalizePath([
                        properties.directories.deploy,
                        buObject.credential,
                        buObject.businessUnit,
                    ])
                );
            }
            return builder._buildDefinition(selectedType, nameArr, templateVariables);
        }
    }

    /**
     * Build a specific metadata file based on a template using a list of bu-market combos
     *
     * @param {string} listName name of list of BU-market combos
     * @param {string} type supported metadata type
     * @param {string[]} nameArr name of the metadata
     * @returns {Promise.<object>} -
     */
    static async buildDefinitionBulk(listName, type, nameArr) {
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

        const responseObj = {};
        for (const businessUnit in properties.marketList[listName]) {
            if (businessUnit === 'description') {
                // skip, it's just a metadata on this list and not a BU
                continue;
            }
            i++;
            /** @type {string | string[] | string[][]} */
            const market = properties.marketList[listName][businessUnit];
            const marketList = 'string' === typeof market ? [market] : market;

            for (const market of marketList) {
                // one can now send multiple markets to buildTemplate/buildDefinition and hence that also needs to work for marketLists
                const marketArr = 'string' === typeof market ? [market] : market;
                for (const market of marketArr) {
                    if (!Util.checkMarket(market, properties)) {
                        return;
                    }
                }

                Util.logger.info(`Executing for '${businessUnit}': '${marketArr.join('-')}'`);
                // omitting "await" to speed up creation
                responseObj[businessUnit] ||= {};
                responseObj[businessUnit][marketArr.join('-')] = await this.buildDefinition(
                    businessUnit,
                    type,
                    nameArr,
                    marketArr
                );
            }
        }

        if (!i) {
            Util.logger.error('Please define properties.marketList in your config');
        }
        return responseObj;
    }
}

export default Builder;
