'use strict';

// import MetadataDefinitions from '../MetadataTypeDefinitions.js';

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
 */

/**
 * Util that contains logger and simple util methods
 */
export const ReplaceContentBlockReference = {
    /**
     *
     * @param {string} str full code string
     * @param {'id'|'key'|'name'} from what to replace
     * @param {'id'|'key'|'name'} to what to replace with
     * @returns {string} replaced string
     */
    replaceContentBlockReference(str, from, to) {
        const regexById_double = /ContentBlockById\(\s*"([0-9]+)"\s*\)/gim;
        const regexByKey_double = /ContentBlockByKey\(\s*"([a-z0-9-/._]+)"\s*\)/gim;
        const regexByName_double = /ContentBlockByName\(\s*"([ a-z0-9-\\._]+)"\s*\)/gim;

        const regexById_single = /ContentBlockById\(\s*'([0-9]+)'\s*\)/gim;
        const regexByKey_single = /ContentBlockByKey\(\s*'([a-z0-9-/._]+)'\s*\)/gim;
        const regexByName_single = /ContentBlockByName\(\s*'([ a-z0-9-\\._]+)'\s*\)/gim;

        switch (from) {
            case 'id': {
                const doubleReplaced = str.replaceAll(regexById_double, (match, id) => {
                    const asset = this._getAssetById(id);
                    return this._replaceWith(asset, to);
                });
                return doubleReplaced.replaceAll(regexById_single, (match, id) => {
                    const asset = this._getAssetById(id);
                    return this._replaceWith(asset, to);
                });
            }
            case 'key': {
                const doubleReplaced = str.replaceAll(regexByKey_double, (match, key) => {
                    const asset = this._getAssetByKey(key);
                    return this._replaceWith(asset, to);
                });
                return doubleReplaced.replaceAll(regexByKey_single, (match, key) => {
                    const asset = this._getAssetByKey(key);
                    return this._replaceWith(asset, to);
                });
            }
            case 'name': {
                const doubleReplaced = str.replaceAll(regexByName_double, (match, pathName) => {
                    const asset = this._getAssetByPathName(pathName);
                    return this._replaceWith(asset, to);
                });
                return doubleReplaced.replaceAll(regexByName_single, (match, pathName) => {
                    const asset = this._getAssetByPathName(pathName);
                    return this._replaceWith(asset, to);
                });
            }
        }
    },
    /**
     *
     * @private
     * @param {string} pathName r__folder_Path +'/'+ name
     * @returns {{id: number, key: string, pathName: string}} asset object
     */
    _getAssetByPathName(pathName) {
        // TODO
        return { id: 9999, key: 'my-key', pathName: pathName };
    },
    /**
     *
     * @private
     * @param {number} id id of asset
     * @returns {{id: number, key: string, pathName: string}} asset object
     */
    _getAssetById(id) {
        // TODO
        return {
            id: id,
            key: 'my-key',
            pathName: `Content Builder\\Release 2 - BUILD\\Content Blocks Library\\NEW\\03. Header and banner\\Referred contentblock\\RS_Dev_Header_blue`,
        };
    },
    /**
     *
     * @private
     * @param {string} key customerKey field of asset
     * @returns {{id: number, key: string, pathName: string}} asset object
     */
    _getAssetByKey(key) {
        // TODO
        return {
            id: 9999,
            key: key,
            pathName: `Content Builder\\Release 2 - BUILD\\Content Blocks Library\\NEW\\03. Header and banner\\Referred contentblock\\RS_Dev_Header_blue`,
        };
    },

    /* const fixedString = testStringId.replaceAll(regexById, replaceIdWithName);
     */
    /**
     *
     * @private
     * @param {{id: number, key: string, pathName: string}} asset asset object
     * @param {'id'|'key'|'name'} to replace with
     * @returns {string} replaced string
     */
    _replaceWith(asset, to) {
        switch (to) {
            case 'id': {
                return `ContentBlockById("${asset.id}")`;
            }
            case 'key': {
                return `ContentBlockByKey("${asset.key}")`;
            }
            case 'name': {
                return `ContentBlockByName("${asset.pathName}")`;
            }
        }
    },
};
