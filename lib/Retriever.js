'use strict';

const TYPE = require('../types/mcdev.d');
const MetadataTypeInfo = require('./MetadataTypeInfo');
const Util = require('./util/util');
const File = require('./util/file');
const cache = require('./util/cache');
const auth = require('./util/auth');
/**
 * Retrieves metadata from a business unit and saves it to the local filesystem.
 */
class Retriever {
    /**
     * Creates a Retriever, uses v2 auth if v2AuthOptions are passed.
     *
     * @param {TYPE.Mcdevrc} properties General configuration to be used in retrieve
     * @param {TYPE.BuObject} buObject properties for auth
     */
    constructor(properties, buObject) {
        this.buObject = buObject;
        this.properties = properties;
        this.retrieveDir = properties.directories.retrieve;
        this.templateDir = properties.directories.template;
        this.savePath = File.normalizePath([
            properties.directories.retrieve,
            buObject.credential,
            buObject.businessUnit,
        ]);
    }

    /**
     * Retrieve metadata of specified types into local file system and Retriever.metadata
     *
     * @param {TYPE.SupportedMetadataTypes[]} metadataTypes list of metadata types to retrieve; can include subtypes!
     * @param {string[]|TYPE.TypeKeyCombo} [namesOrKeys] name of Metadata to retrieveAsTemplate or list of keys for normal retrieval
     * @param {TYPE.TemplateMap} [templateVariables] Object of values which can be replaced (in case of templating)
     * @param {boolean} [changelogOnly] skip saving, only create json in memory
     * @returns {Promise.<TYPE.MultiMetadataTypeList>} Promise of a list of retrieved items grouped by type {automation:[...], query:[...]}
     */
    async retrieve(metadataTypes, namesOrKeys, templateVariables, changelogOnly) {
        /**
         * @type {TYPE.MultiMetadataTypeList}
         */
        const retrieveChangelog = {};
        if (!namesOrKeys || (Array.isArray(namesOrKeys) && !namesOrKeys.length)) {
            // no keys were provided, ensure we retrieve all
            namesOrKeys = [null];
        }
        /** @type {TYPE.TypeKeyCombo} */
        let typeKeyMap = {};
        if (Array.isArray(namesOrKeys)) {
            // no keys or array of keys was provided (likely called via CLI or to retrieve all)
            // transform into TypeKeyCombo to iterate over it
            for (const type of metadataTypes) {
                typeKeyMap[type] = namesOrKeys;
            }
        } else {
            // assuming TypeKeyCombo was provided
            typeKeyMap = namesOrKeys;
        }
        // defined colors for optionally printing the keys we filtered by
        const color = {
            reset: '\x1B[0m',
            dim: '\x1B[2m',
        };
        for (const metadataType of Util.getMetadataHierachy(metadataTypes)) {
            const [type, subType] = metadataType.split('-');
            // if types were added by getMetadataHierachy() for caching, make sure the key-list is set to [null] for them which will retrieve all
            typeKeyMap[metadataType] = typeKeyMap[metadataType] || [null];
            // add client to metadata process class instead of passing every time
            MetadataTypeInfo[type].client = auth.getSDK(this.buObject);
            MetadataTypeInfo[type].properties = this.properties;
            MetadataTypeInfo[type].buObject = this.buObject;
            try {
                let result;
                if (!metadataTypes.includes(type) && !metadataTypes.includes(metadataType)) {
                    if (changelogOnly && type !== 'folder') {
                        // no extra caching needed for list view except for folders
                        continue;
                    }
                    Util.logger.info(`Caching dependent Metadata: ${metadataType}`);
                    result = await MetadataTypeInfo[type].retrieveForCache(this.buObject, subType);
                } else if (templateVariables) {
                    Util.logger.info(`Retrieving as Template: ${metadataType}`);

                    result = await Promise.all(
                        typeKeyMap[metadataType].map((name) =>
                            MetadataTypeInfo[type].retrieveAsTemplate(
                                this.templateDir,
                                name,
                                templateVariables,
                                subType
                            )
                        )
                    );
                } else {
                    Util.logger.info(
                        `Retrieving: ${metadataType}` +
                            (typeKeyMap[metadataType][0] !== null
                                ? ` ${color.dim}(Keys: ${typeKeyMap[metadataType].join(', ')})${
                                      color.reset
                                  }`
                                : '')
                    );
                    result = await (changelogOnly
                        ? MetadataTypeInfo[type].retrieveChangelog(this.buObject, null, subType)
                        : Promise.all(
                              typeKeyMap[metadataType].map((key) =>
                                  MetadataTypeInfo[type].retrieve(
                                      this.savePath,
                                      null,
                                      this.buObject,
                                      subType,
                                      key
                                  )
                              )
                          ));
                    if (changelogOnly) {
                        // add folder to changelog
                        for (const key of Object.keys(result.metadata)) {
                            MetadataTypeInfo[type].setFolderPath(result.metadata[key]);
                        }
                    }
                }
                if (result) {
                    if (Array.isArray(result)) {
                        for (const result_i of result) {
                            if (result_i?.metadata && Object.keys(result_i.metadata).length) {
                                cache.mergeMetadata(type, result_i.metadata);
                            }
                        }
                        if (metadataTypes.includes(type) || metadataTypes.includes(metadataType)) {
                            retrieveChangelog[type] = result
                                .filter((el) => !!el)
                                .map((element) => element.metadata);
                        }
                    } else {
                        cache.setMetadata(type, result.metadata);
                        if (metadataTypes.includes(type) || metadataTypes.includes(metadataType)) {
                            retrieveChangelog[type] = result.metadata;
                        }
                    }
                }
            } catch (ex) {
                Util.logger.errorStack(ex, `Retrieving ${metadataType} failed`);
                // do not continue retrieving if one type failed. simply skip processing the rest of the for-loop
                break;
            }
        }
        return retrieveChangelog;
    }
}

module.exports = Retriever;
