'use strict';

import auth from './auth.js';
import cache from './cache.js';
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
    /** @type {{id: RegExp[], key: RegExp[], name: RegExp[]}} */
    static #regexBy = {
        // TODO: handle cases in which variables or functions are passed into ContentBlockByX

        amp: {
            id: [
                /ContentBlockById\(\s*"([0-9]+)"\s*\)/gim,
                /ContentBlockById\(\s*'([0-9]+)'\s*\)/gim,
                /ContentBlockById\(\s*([0-9]+)\s*\)/gim,
            ],
            key: [
                /ContentBlockByKey\(\s*"([a-z0-9-/._]+)"\s*\)/gim,
                /ContentBlockByKey\(\s*'([a-z0-9-/._]+)'\s*\)/gim,
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
                /Platform.Function.ContentBlockByKey\(\s*"([a-z0-9-/._]+)"\s*\)/gim,
                /Platform.Function.ContentBlockByKey\(\s*'([a-z0-9-/._]+)'\s*\)/gim,
            ],
            name: [
                /Platform.Function.ContentBlockByName\(\s*"([ a-z0-9-\\._)(]+)"\s*\)/gim,
                /Platform.Function.ContentBlockByName\(\s*'([ a-z0-9-\\._)(]+)'\s*\)/gim,
            ],
        },
    };

    /**
     * used to equalize the reference in the code to whatever is set in the "to" field
     *
     * @param {string} str full code string
     * @param {string} parentName name of the object that was passed in; used in error message only
     * @param {ContentBlockConversionTypes[]} [fromList] what to replace
     * @param {ContentBlockConversionTypes} [to] what to replace with
     * @returns {string} replaced string
     */
    static replaceReference(str, parentName, fromList, to) {
        if (!str) {
            const ex = new Error('No string provided');
            ex.code = 200;
            throw ex;
        }
        fromList ||= Util.OPTIONS.referenceFrom;
        to ||= Util.OPTIONS.referenceTo;
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
                            lang.isSsjs
                        );
                        if (referencedAsset) {
                            changes++;
                            return this.#replaceWith(referencedAsset, to, lang.isSsjs);
                        } else {
                            return match;
                        }
                    });
                }
            }
        }
        if (!changes) {
            const ex = new Error('No changes made to the code.');
            ex.code = 200;
            throw ex;
        }
        return result;
    }
    /**
     *
     * @private
     * @param {ContentBlockConversionTypes} from replace with
     * @param {string|number} identifier id, key or name of asset
     * @param {string} parentName name of the object that was passed in; used in error message only
     * @param {boolean} [isSsjs] replaces backslashes with double backslashes in name if true
     * @returns {AssetItemSimple} asset object
     */
    static #getAssetBy(from, identifier, parentName, isSsjs = false) {
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
                if (isSsjs) {
                    identifier = identifier.replaceAll('\\\\', '\\');
                }
                reference = ReplaceContentBlockReference.assetCacheMap.name[identifier];
                break;
            }
        }
        if (!reference) {
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
     *
     * @param {Mcdevrc} properties properties for auth
saved
     * @param {BuObject} buObject properties for auth
     */
    static async createCacheMap(properties, buObject) {
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

        Util.logger.info(' - Caching assets');
        Asset.buObject = buObject;
        Asset.properties = properties;
        Asset.client = client;
        const resultAsset = await Asset.retrieveForCache(undefined, [
            'asset',
            'code',
            'textfile',
            'block',
            'other',
        ]);
        for (const element of Object.values(resultAsset.metadata)) {
            // ensure we got the folder-path in our cache
            Asset.setFolderPath(element);

            // create actual cache map
            const simpleAsset = {
                id: element.id,
                key: element.customerKey,
                name: element.r__folder_Path.replaceAll('/', '\\') + '\\' + element.name,
            };
            // ! note that ContentBlockByName expects backslashes between folders and file name, not forward slashes
            ReplaceContentBlockReference.assetCacheMap.id[simpleAsset.id] = simpleAsset;
            ReplaceContentBlockReference.assetCacheMap.key[simpleAsset.key] = simpleAsset;
            ReplaceContentBlockReference.assetCacheMap.name[simpleAsset.name] = simpleAsset;
        }

        cache.setMetadata('asset', resultAsset.metadata);
    }
}
