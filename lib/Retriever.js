'use strict';

import MetadataTypeInfo from './MetadataTypeInfo.js';
import MetadataDefinitions from './MetadataTypeDefinitions.js';
import { Util } from './util/util.js';
import File from './util/file.js';
import cache from './util/cache.js';
import auth from './util/auth.js';

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
 * @typedef {import('../types/mcdev.d.js').MultiMetadataTypeMap} MultiMetadataTypeMap
 * @typedef {import('../types/mcdev.d.js').SoapRequestParams} SoapRequestParams
 * @typedef {import('../types/mcdev.d.js').TemplateMap} TemplateMap
 * @typedef {import('../types/mcdev.d.js').TypeKeyCombo} TypeKeyCombo
 */

/**
 * Retrieves metadata from a business unit and saves it to the local filesystem.
 */
class Retriever {
    /**
     * Creates a Retriever, uses v2 auth if v2AuthOptions are passed.
     *
     * @param {Mcdevrc} properties General configuration to be used in retrieve
     * @param {BuObject} buObject properties for auth
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
     * @param {string[]} metadataTypes list of metadata types to retrieve; can include subtypes!
     * @param {string[] | TypeKeyCombo} [namesOrKeys] name of Metadata to retrieveAsTemplate or list of keys for normal retrieval
     * @param {TemplateMap} [templateVariables] Object of values which can be replaced (in case of templating)
     * @param {boolean} [changelogOnly] skip saving, only create json in memory
     * @returns {Promise.<MultiMetadataTypeList>} Promise of a list of retrieved items grouped by type {automation:[...], query:[...]}
     */
    async retrieve(metadataTypes, namesOrKeys, templateVariables, changelogOnly) {
        /**
         * @type {MultiMetadataTypeList}
         */
        const retrieveChangelog = {};
        /** @type {TypeKeyCombo} */
        const typeKeyMap =
            !namesOrKeys || Array.isArray(namesOrKeys)
                ? Util.createTypeKeyCombo(metadataTypes, namesOrKeys)
                : namesOrKeys;
        // ensure we know which real dependencies we have to ensure we cache those completely
        const dependencies = this._getTypeDependencies(metadataTypes);
        const deployOrder = Util.getMetadataHierachy(metadataTypes);
        for (const type in deployOrder) {
            const subTypeArr = deployOrder[type];
            // if types were added by getMetadataHierachy() for caching, make sure the key-list is set to [null] for them which will retrieve all
            // if we have a subtype, we need to find the correct key-list for it
            typeKeyMap[type] ||= typeKeyMap[
                Object.keys(typeKeyMap).find((k) => k.startsWith(type + '-'))
            ] || [null];

            // add client to metadata process class instead of passing every time
            MetadataTypeInfo[type].client = auth.getSDK(this.buObject);
            MetadataTypeInfo[type].properties = this.properties;
            MetadataTypeInfo[type].buObject = this.buObject;
            try {
                let result;
                if (
                    !metadataTypes.includes(type) &&
                    (!Array.isArray(subTypeArr) ||
                        (Array.isArray(subTypeArr) &&
                            !metadataTypes.includes(`${type}-${subTypeArr?.[0]}`)))
                ) {
                    // type not in list of types to retrieve, but is a dependency of one of them
                    if (changelogOnly && type !== 'folder') {
                        // no extra caching needed for list view except for folders
                        continue;
                    }
                    Util.logger.info(`Caching dependent Metadata: ${type}`);
                    Util.logSubtypes(subTypeArr);
                    result = await MetadataTypeInfo[type].retrieveForCache(null, subTypeArr);
                } else if (templateVariables) {
                    // type is in list of types to retrieve and we have template variables
                    Util.logger.info(`Retrieving as Template: ${type}`);
                    if (subTypeArr?.length > 1) {
                        Util.logger.warn(
                            `retrieveAsTemplate only works with one subtype, ignoring all but first subtype from your list: ${subTypeArr.join(
                                ', '
                            )}`
                        );
                    }
                    result = await Promise.all(
                        typeKeyMap[type].map((name) =>
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
                        (typeKeyMap[type].length > 1 || typeKeyMap[type][0] !== null) &&
                        (dependencies.includes(type) || dependencies.includes(type))
                    ) {
                        // if we have a key-list and the type is a dependency, we need to cache the whole type
                        Util.logger.info(`Caching dependent Metadata: ${type}`);
                        Util.logSubtypes(subTypeArr);
                        cacheResult = await MetadataTypeInfo[type].retrieveForCache(
                            null,
                            subTypeArr
                        );
                    }
                    Util.logger.info(
                        `Retrieving: ${type}` +
                            (typeKeyMap[type][0] === null
                                ? ''
                                : Util.getKeysString(typeKeyMap[type]))
                    );
                    result = await (changelogOnly
                        ? MetadataTypeInfo[type].retrieveChangelog(null, subTypeArr)
                        : Promise.all(
                              typeKeyMap[type].map((key) =>
                                  MetadataTypeInfo[type].retrieve(
                                      this.savePath,
                                      null,
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
                        if (metadataTypes.includes(type) || metadataTypes.includes(type)) {
                            retrieveChangelog[type] = result
                                .filter((el) => !!el)
                                .map((element) => element.metadata);
                        }
                    } else {
                        cache.setMetadata(type, result.metadata);
                        if (metadataTypes.includes(type) || metadataTypes.includes(type)) {
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
                    Util.logger.errorStack(ex, ` - Retrieving ${type} failed`);
                }
            }
        }
        return retrieveChangelog;
    }

    /**
     * helper for Retriever.retrieve to get all dependencies of the given types
     *
     * @param {string[]} metadataTypes list of metadata types to retrieve; can include subtypes!
     * @returns {string[]} unique list dependent metadata types
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

export default Retriever;
