'use strict';

import auth from './auth.js';
import cache from './cache.js';
import File from './file.js';
import { Util } from '../util/util.js';

import Folder from '../metadataTypes/Folder.js';
import Asset from '../metadataTypes/Asset.js';

/**
 * @typedef {import('../../types/mcdev.d.js').AuthObject} AuthObject
 * @typedef {import('../../types/mcdev.d.js').BuObject} BuObject
 * @typedef {import('../../types/mcdev.d.js').Cache} Cache
 * @typedef {import('../../types/mcdev.d.js').CodeExtract} CodeExtract
 * @typedef {import('../../types/mcdev.d.js').CodeExtractItem} CodeExtractItem
 * @typedef {import('../../types/mcdev.d.js').DeltaPkgItem} DeltaPkgItem
 * @typedef {import('../../types/mcdev.d.js').McdevLogger} McdevLogger
 * @typedef {import('../../types/mcdev.d.js').Logger} Logger
 * @typedef {import('../../types/mcdev.d.js').Mcdevrc} Mcdevrc
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItem} MetadataTypeItem
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItemDiff} MetadataTypeItemDiff
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItemObj} MetadataTypeItemObj
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMap} MetadataTypeMap
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMapObj} MetadataTypeMapObj
 * @typedef {import('../../types/mcdev.d.js').MultiMetadataTypeList} MultiMetadataTypeList
 * @typedef {import('../../types/mcdev.d.js').MultiMetadataTypeMap} MultiMetadataTypeMap
 * @typedef {import('../../types/mcdev.d.js').SkipInteraction} SkipInteraction
 * @typedef {import('../../types/mcdev.d.js').SoapRequestParams} SoapRequestParams
 * @typedef {import('../../types/mcdev.d.js').TemplateMap} TemplateMap
 * @typedef {import('../../types/mcdev.d.js').TypeKeyCombo} TypeKeyCombo
 * @typedef {import('../../types/mcdev.d.js').SDKError} SDKError
 *
 * @typedef {import('../../types/mcdev.d.js').AssetMap} AssetMap
 * @typedef {import('../../types/mcdev.d.js').AssetItemSimple} AssetItemSimple
 * @typedef {import('../../types/mcdev.d.js').AssetItemSimpleMap} AssetItemSimpleMap
 * @typedef {import('../../types/mcdev.d.js').AssetItemIdSimpleMap} AssetItemIdSimpleMap
 * @typedef {import('../../types/mcdev.d.js').ContentBlockConversionTypes} ContentBlockConversionTypes
 */

/**
 * Util that contains logger and simple util methods
 */
export default class ReplaceContentBlockReference {
    /** @type {{id: AssetItemIdSimpleMap, key: AssetItemSimpleMap, name: AssetItemSimpleMap}} */
    static assetCacheMap = {
        id: {},
        key: {},
        name: {},
    };
    /** @type {Object.<string, {id: RegExp[], key: RegExp[], name: RegExp[]}>} */
    static #regexBy = {
        // TODO: handle cases in which variables or functions are passed into ContentBlockByX

        amp: {
            id: [
                /ContentBlockById\(\s*"([0-9]+)"\s*\)/gim,
                /ContentBlockById\(\s*'([0-9]+)'\s*\)/gim,
                /ContentBlockById\(\s*([0-9]+)\s*\)/gim,
            ],
            key: [
                /ContentBlockByKey\(\s*"([a-z0-9-/._][ a-z0-9-/._]+[a-z0-9-/._])"\s*\)/gim,
                /ContentBlockByKey\(\s*'([a-z0-9-/._][ a-z0-9-/._]+[a-z0-9-/._])'\s*\)/gim,
            ],
            name: [
                /ContentBlockByName\(\s*"([ a-z0-9-\\._)(]+)"\s*\)/gim,
                /ContentBlockByName\(\s*'([ a-z0-9-\\._)(]+)'\s*\)/gim,
            ],
        },
        ssjs: {
            id: [
                /Platform.Function.ContentBlockById\(\s*"([0-9]+)"\s*\)/gim,
                /Platform.Function.ContentBlockById\(\s*'([0-9]+)'\s*\)/gim,
                /Platform.Function.ContentBlockById\(\s*([0-9]+)\s*\)/gim,
            ],
            key: [
                /Platform.Function.ContentBlockByKey\(\s*"([a-z0-9-/._][ a-z0-9-/._]+[a-z0-9-/._])"\s*\)/gim,
                /Platform.Function.ContentBlockByKey\(\s*'([a-z0-9-/._][ a-z0-9-/._]+[a-z0-9-/._])'\s*\)/gim,
            ],
            name: [
                /Platform.Function.ContentBlockByName\(\s*"([ a-z0-9-\\._)(]+)"\s*\)/gim,
                /Platform.Function.ContentBlockByName\(\s*'([ a-z0-9-\\._)(]+)'\s*\)/gim,
            ],
        },
    };

    /**
     * helper for tests
     */
    static resetCacheMap() {
        this.assetCacheMap = {
            id: {},
            key: {},
            name: {},
        };
    }

    /**
     * used to equalize the reference in the code to whatever is set in the "to" field
     *
     * @param {string} str full code string
     * @param {string} parentName name of the object that was passed in; used in error message only
     * @param {Set.<string>} [findAssetKeys] list of keys that were found referenced via ContentBlockByX; if set, method only gets keys and runs no updates
     * @returns {string} replaced string
     */
    static replaceReference(str, parentName, findAssetKeys) {
        if (!str) {
            const ex = new Error('No string provided');
            // @ts-expect-error custom error object
            ex.code = 200;
            throw ex;
        }
        /** @type {ContentBlockConversionTypes[]} */
        const fromList = Util.OPTIONS.referenceFrom;
        /** @type {ContentBlockConversionTypes} */
        const to = Util.OPTIONS.referenceTo;
        let result = str;
        let changes = 0;
        const languages = [
            { name: 'ssjs', isSsjs: true },
            { name: 'amp', isSsjs: false },
        ];
        for (const from of fromList) {
            for (const lang of languages) {
                for (const regex of this.#regexBy[lang.name][from]) {
                    result = result.replaceAll(regex, (match, identifier) => {
                        const referencedAsset = this.#getAssetBy(
                            from,
                            identifier,
                            parentName,
                            lang.isSsjs,
                            !!findAssetKeys
                        );
                        if (referencedAsset && referencedAsset[to]) {
                            // make sure we not only found the asset but also have a replacement for it (folder issue could block swap to ContentBlockByName)
                            changes++;
                            if (findAssetKeys) {
                                findAssetKeys.add(referencedAsset.key);
                                return;
                            } else {
                                return this.#replaceWith(referencedAsset, to, lang.isSsjs);
                            }
                        } else {
                            if (referencedAsset && !referencedAsset[to]) {
                                // this is expected to only happen if to=="name"
                                Util.logger.error(
                                    ` - ${parentName}: Asset ${from} ${identifier} has no valid ${to} reference`
                                );
                            } else if (!referencedAsset && findAssetKeys) {
                                const newError = new Error(`${identifier}`);
                                // @ts-expect-error custom error object
                                newError.code = 404;
                                throw newError;
                            }
                            return match;
                        }
                    });
                }
            }
        }
        if (!changes) {
            const ex = new Error('No changes made to the code.');
            // @ts-expect-error custom error object
            ex.code = 200;
            throw ex;
        }
        return result;
    }

    /**
     *
     * @param {ContentBlockConversionTypes} from replace with
     * @param {string|number} identifier id, key or name of asset
     * @param {string} parentName name of the object that was passed in; used in error message only
     * @param {boolean} [isSsjs] replaces backslashes with double backslashes in name if true
     * @param {boolean} [handleOutside] don not print error message if asset not found
     * @returns {AssetItemSimple} asset object
     */
    static #getAssetBy(from, identifier, parentName, isSsjs = false, handleOutside = false) {
        let reference;
        switch (from) {
            case 'id': {
                reference = ReplaceContentBlockReference.assetCacheMap.id[identifier];
                break;
            }
            case 'key': {
                reference = ReplaceContentBlockReference.assetCacheMap.key[identifier];
                break;
            }
            case 'name': {
                if (isSsjs && typeof identifier === 'string') {
                    identifier = identifier.replaceAll('\\\\', '\\');
                }
                reference = ReplaceContentBlockReference.assetCacheMap.name[identifier];
                break;
            }
        }
        if (!reference && !handleOutside) {
            Util.logger.error(` - ${parentName}: Asset not found for ${from} ${identifier}`);
        }
        return reference;
    }

    /**
     *
     * @param {AssetItemSimple} asset asset object
     * @param {ContentBlockConversionTypes} to replace with
     * @param {boolean} [isSsjs] replaces backslashes with double backslashes in name if true
     * @returns {string} replaced string
     */
    static #replaceWith(asset, to, isSsjs = false) {
        switch (to) {
            case 'id': {
                return `${isSsjs ? 'Platform.Function.' : ''}ContentBlockById(${asset.id})`;
            }
            case 'key': {
                return `${isSsjs ? 'Platform.Function.' : ''}ContentBlockByKey("${asset.key}")`;
            }
            case 'name': {
                return `${isSsjs ? 'Platform.Function.' : ''}ContentBlockByName("${isSsjs ? asset.name.replaceAll('\\', '\\\\') : asset.name}")`;
            }
        }
    }

    /**
     * ensures we cache the right things from disk and if required from server
     *
     * @param {Mcdevrc} properties properties for auth
     * @param {BuObject} buObject properties for auth
     * @param {boolean} [retrieveSharedOnly] for --dependencies only, do not have to re-retrieve local assets
     * @returns {Promise.<void>} -
     */
    static async createCache(properties, buObject, retrieveSharedOnly = false) {
        const { localAssets, sharedAssets } = await ReplaceContentBlockReference._retrieveCache(
            buObject,
            properties,
            retrieveSharedOnly
        );

        ReplaceContentBlockReference.createCacheForMap(localAssets);
        ReplaceContentBlockReference.createCacheForMap(sharedAssets);
    }

    /**
     * helper for {@link ReplaceContentBlockReference.createCache} that converts AssetMap into AssetItemSimple entries in this.assetCacheMap
     *
     * @param {AssetMap} metadataMap list of local or shared assets
     */
    static createCacheForMap(metadataMap) {
        for (const element of Object.values(metadataMap)) {
            // create actual cache map
            /** @type {AssetItemSimple} */
            const simpleAsset = {
                id: element.id,
                key: element.customerKey,
                // ! note that ContentBlockByName expects backslashes between folders and file name, not forward slashes
                name: element.r__folder_Path
                    ? element.r__folder_Path.replaceAll('/', '\\') + '\\' + element.name
                    : null,
            };
            // if this method was filled by Asset.upsert it might have been run before with more accurate (retrieved) data including the id that we do not want to override
            this.assetCacheMap.key[simpleAsset.key] ||= simpleAsset;
            if (simpleAsset.id) {
                // if this method was filled by Asset.upsert it won't have ids
                this.assetCacheMap.id[simpleAsset.id] = simpleAsset;
            }
            if (simpleAsset.name) {
                // while asset without path could still be found via search, it would no longer referencable via ContentBlockByName
                // if this method was filled by Asset.upsert it might have been run before with more accurate (retrieved) data including the id that we do not want to override
                this.assetCacheMap.name[simpleAsset.name] ||= simpleAsset;
            }
        }
    }

    /**
     * helper for {@link ReplaceContentBlockReference.createCache}
     *
     * @param {BuObject} buObject references credentials
     * @param {Mcdevrc} properties central properties object
     * @param {boolean} [retrieveSharedOnly] for --dependencies only, do not have to re-retrieve local assets
     * @returns {Promise.<{localAssets: AssetMap, sharedAssets: AssetMap}>} -
     */
    static async _retrieveCache(buObject, properties, retrieveSharedOnly = false) {
        const client = auth.getSDK(buObject);

        if (!cache.getCache()) {
            cache.initCache(buObject);
        }
        Util.logger.info(' - Caching folders');
        Folder.buObject = buObject;
        Folder.properties = properties;
        Folder.client = client;
        const resultFolder = await Folder.retrieveForCache(null, ['asset', 'asset-shared']);
        cache.setMetadata('folder', resultFolder.metadata);

        let localAssets;
        if (retrieveSharedOnly) {
            Util.logger.debug(' - Caching assets locally');
            if (!Asset.getJsonFromFSCache) {
                // avoid re-reading the same files in every recursive iteration
                Asset.getJsonFromFSCache = await Asset.getJsonFromFS(
                    File.normalizePath([
                        properties.directories.retrieve,
                        buObject.credential,
                        buObject.businessUnit,
                        Asset.definition.type,
                    ])
                );
            }
            localAssets = Asset.getJsonFromFSCache;
            cache.setMetadata('asset', Asset.getJsonFromFSCache);
        } else {
            Util.logger.info(' - Caching assets from server');
            Asset.buObject = buObject;
            Asset.properties = properties;
            Asset.client = client;
            const resultAsset = await Asset.retrieveForCache(
                undefined,
                Asset.definition.crosslinkedSubTypes
            );
            for (const element of Object.values(resultAsset.metadata)) {
                // ensure we got the folder-path in our cache
                Asset.setFolderPath(element);
            }
            localAssets = resultAsset.metadata;
            cache.setMetadata('asset', resultAsset.metadata);
        }

        // get shared assets
        Util.logger.info(' - Caching shared assets from server (not stored on disk)');
        Asset.buObject = buObject;
        Asset.properties = properties;
        Asset.client = client;
        const sharedAssets = (
            await Asset.retrieveForCache(
                undefined,
                Asset.definition.crosslinkedSubTypes,
                undefined,
                true
            )
        )?.metadata;
        // lets not put the shared assets into our cache to avoid confusing the system...

        for (const element of Object.values(sharedAssets)) {
            // ensure we got the folder-path in our cache
            Asset.setFolderPath(element);
        }
        return { localAssets, sharedAssets };
    }
}
