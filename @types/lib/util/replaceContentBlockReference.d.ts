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
    static assetCacheMap: {
        id: AssetItemIdSimpleMap;
        key: AssetItemSimpleMap;
        name: AssetItemSimpleMap;
    };
    /** @type {Object.<string, {id: RegExp[], key: RegExp[], name: RegExp[]}>} */
    static "__#2@#regexBy": {
        [x: string]: {
            id: RegExp[];
            key: RegExp[];
            name: RegExp[];
        };
    };
    /**
     * used to equalize the reference in the code to whatever is set in the "to" field
     *
     * @param {string} str full code string
     * @param {string} parentName name of the object that was passed in; used in error message only
     * @param {Set.<string>} [findAssetKeys] list of keys that were found referenced via ContentBlockByX; if set, method only gets keys and runs no updates
     * @returns {string} replaced string
     */
    static replaceReference(str: string, parentName: string, findAssetKeys?: Set<string>): string;
    /**
     *
     * @param {ContentBlockConversionTypes} from replace with
     * @param {string|number} identifier id, key or name of asset
     * @param {string} parentName name of the object that was passed in; used in error message only
     * @param {boolean} [isSsjs] replaces backslashes with double backslashes in name if true
     * @returns {AssetItemSimple} asset object
     */
    static "__#2@#getAssetBy"(from: ContentBlockConversionTypes, identifier: string | number, parentName: string, isSsjs?: boolean): AssetItemSimple;
    /**
     *
     * @param {AssetItemSimple} asset asset object
     * @param {ContentBlockConversionTypes} to replace with
     * @param {boolean} [isSsjs] replaces backslashes with double backslashes in name if true
     * @returns {string} replaced string
     */
    static "__#2@#replaceWith"(asset: AssetItemSimple, to: ContentBlockConversionTypes, isSsjs?: boolean): string;
    /**
     * ensures we cache the right things from disk and if required from server
     *
     * @param {Mcdevrc} properties properties for auth
saved
     * @param {BuObject} buObject properties for auth
     * @param {boolean} [retrieveSharedOnly] for --dependencies only, do not have to re-retrieve local assets
     * @returns {Promise.<void>} -
     */
    static createCacheMap(properties: Mcdevrc, buObject: BuObject, retrieveSharedOnly?: boolean): Promise<void>;
    /**
     * helper for {@link this.createCacheMap} that converts AssetMap into Asset
     *
     * @param {AssetMap} metadataMap list of local or shared assets
     */
    static _createCacheMap(metadataMap: AssetMap): void;
    /**
     * helper for {@link this.createCacheMap}
     *
     * @param {BuObject} buObject references credentials
     * @param {Mcdevrc} properties central properties object
     * @param {boolean} [retrieveSharedOnly] for --dependencies only, do not have to re-retrieve local assets
     * @returns {Promise.<{localAssets: AssetMap, sharedAssets: AssetMap}>} -
     */
    static _retrieveCache(buObject: BuObject, properties: Mcdevrc, retrieveSharedOnly?: boolean): Promise<{
        localAssets: AssetMap;
        sharedAssets: AssetMap;
    }>;
}
export type AuthObject = import("../../types/mcdev.d.js").AuthObject;
export type BuObject = import("../../types/mcdev.d.js").BuObject;
export type Cache = import("../../types/mcdev.d.js").Cache;
export type CodeExtract = import("../../types/mcdev.d.js").CodeExtract;
export type CodeExtractItem = import("../../types/mcdev.d.js").CodeExtractItem;
export type DeltaPkgItem = import("../../types/mcdev.d.js").DeltaPkgItem;
export type McdevLogger = import("../../types/mcdev.d.js").McdevLogger;
export type Logger = import("../../types/mcdev.d.js").Logger;
export type Mcdevrc = import("../../types/mcdev.d.js").Mcdevrc;
export type MetadataTypeItem = import("../../types/mcdev.d.js").MetadataTypeItem;
export type MetadataTypeItemDiff = import("../../types/mcdev.d.js").MetadataTypeItemDiff;
export type MetadataTypeItemObj = import("../../types/mcdev.d.js").MetadataTypeItemObj;
export type MetadataTypeMap = import("../../types/mcdev.d.js").MetadataTypeMap;
export type MetadataTypeMapObj = import("../../types/mcdev.d.js").MetadataTypeMapObj;
export type MultiMetadataTypeList = import("../../types/mcdev.d.js").MultiMetadataTypeList;
export type MultiMetadataTypeMap = import("../../types/mcdev.d.js").MultiMetadataTypeMap;
export type SkipInteraction = import("../../types/mcdev.d.js").SkipInteraction;
export type SoapRequestParams = import("../../types/mcdev.d.js").SoapRequestParams;
export type TemplateMap = import("../../types/mcdev.d.js").TemplateMap;
export type TypeKeyCombo = import("../../types/mcdev.d.js").TypeKeyCombo;
export type SDKError = import("../../types/mcdev.d.js").SDKError;
export type AssetMap = import("../../types/mcdev.d.js").AssetMap;
export type AssetItemSimple = import("../../types/mcdev.d.js").AssetItemSimple;
export type AssetItemSimpleMap = import("../../types/mcdev.d.js").AssetItemSimpleMap;
export type AssetItemIdSimpleMap = import("../../types/mcdev.d.js").AssetItemIdSimpleMap;
export type ContentBlockConversionTypes = import("../../types/mcdev.d.js").ContentBlockConversionTypes;
//# sourceMappingURL=replaceContentBlockReference.d.ts.map