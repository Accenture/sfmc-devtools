'use strict';

const TYPE = require('../types/mcdev.d');
const MetadataTypeInfo = require('./MetadataTypeInfo');
const MetadataDefinitions = require('./MetadataTypeDefinitions');
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
        // ensure we know which real dependencies we have to ensure we cache those completely
        const dependencies = this._getTypeDependencies(metadataTypes);
        const deployOrder = Util.getMetadataHierachy(metadataTypes);
        for (const metadataType in deployOrder) {
            const type = metadataType;
            const subTypeArr = deployOrder[metadataType];
            // if types were added by getMetadataHierachy() for caching, make sure the key-list is set to [null] for them which will retrieve all
            typeKeyMap[metadataType] = typeKeyMap[metadataType] || [null];
            // add client to metadata process class instead of passing every time
            MetadataTypeInfo[type].client = auth.getSDK(this.buObject);
            MetadataTypeInfo[type].properties = this.properties;
            MetadataTypeInfo[type].buObject = this.buObject;
            try {
                let result;
                if (!metadataTypes.includes(type) && !metadataTypes.includes(metadataType)) {
                    // type not in list of types to retrieve, but is a dependency of one of them
                    if (changelogOnly && type !== 'folder') {
                        // no extra caching needed for list view except for folders
                        continue;
                    }
                    Util.logger.info(`Caching dependent Metadata: ${metadataType}`);
                    Util.logSubtypes(subTypeArr);
                    result = await MetadataTypeInfo[type].retrieveForCache(null, subTypeArr);
                } else if (templateVariables) {
                    // type is in list of types to retrieve and we have template variables
                    Util.logger.info(`Retrieving as Template: ${metadataType}`);
                    if (subTypeArr?.length > 1) {
                        Util.logger.warn(
                            `retrieveAsTemplate only works with one subtype, ignoring all but first subtype from your list: ${subTypeArr.join(
                                ', '
                            )}`
                        );
                    }
                    result = await Promise.all(
                        typeKeyMap[metadataType].map((name) =>
                            MetadataTypeInfo[type].retrieveAsTemplate(
                                this.templateDir,
                                name,
                                templateVariables,
                                subTypeArr?.[0]
                            )
                        )
                    );
                } else {
                    // type is in list of types to retrieve and we don't have template variables
                    let cacheResult = null;
                    if (
                        (typeKeyMap[metadataType].length > 1 ||
                            typeKeyMap[metadataType][0] !== null) &&
                        (dependencies.includes(type) || dependencies.includes(metadataType))
                    ) {
                        // if we have a key-list and the type is a dependency, we need to cache the whole type
                        Util.logger.info(`Caching dependent Metadata: ${metadataType}`);
                        Util.logSubtypes(subTypeArr);
                        cacheResult = await MetadataTypeInfo[type].retrieveForCache(
                            null,
                            subTypeArr
                        );
                    }
                    Util.logger.info(
                        `Retrieving: ${metadataType}` +
                            (typeKeyMap[metadataType][0] === null
                                ? ''
                                : Util.getKeysString(typeKeyMap[metadataType]))
                    );
                    result = await (changelogOnly
                        ? MetadataTypeInfo[type].retrieveChangelog(this.buObject, null, subTypeArr)
                        : Promise.all(
                              typeKeyMap[metadataType].map((key) =>
                                  MetadataTypeInfo[type].retrieve(
                                      this.savePath,
                                      null,
                                      this.buObject,
                                      subTypeArr,
                                      key
                                  )
                              )
                          ));
                    if (Array.isArray(result) && cacheResult !== null) {
                        // if we have a key-list and the type is a dependency, we need to cache the whole type
                        result = [cacheResult, ...result];
                    }
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
                if (
                    ex.code === 'invalid_client' ||
                    ex.message.startsWith('Client authentication failed.')
                ) {
                    // do not continue retrieving if we logged an authentication issue
                    Util.logger.error(ex.message);
                    break;
                } else {
                    Util.logger.errorStack(ex, ` - Retrieving ${metadataType} failed`);
                }
            }
        }
        return retrieveChangelog;
    }

    /**
     * helper for {@link retrieve} to get all dependencies of the given types
     *
     * @param {TYPE.SupportedMetadataTypes[]} metadataTypes list of metadata types to retrieve; can include subtypes!
     * @returns {TYPE.SupportedMetadataTypes[]} unique list dependent metadata types
     */
    _getTypeDependencies(metadataTypes) {
        let dependencies = [];
        for (const metadataType of metadataTypes) {
            const type = metadataType.split('-')[0];
            // if they have dependencies then add a dependency pair for each type
            if (MetadataDefinitions[type].dependencies.length > 0) {
                dependencies.push(
                    ...MetadataDefinitions[type].dependencies.map((dep) => dep.split('-')[0])
                );
            }
        }
        dependencies = [...new Set(dependencies)];
        return dependencies;
    }
}

module.exports = Retriever;
