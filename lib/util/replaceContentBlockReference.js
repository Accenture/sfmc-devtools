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
        const regexBy = {
            id: [
                /ContentBlockById\(\s*"([0-9]+)"\s*\)/gim,
                /ContentBlockById\(\s*'([0-9]+)'\s*\)/gim,
            ],
            key: [
                /ContentBlockByKey\(\s*"([a-z0-9-/._]+)"\s*\)/gim,
                /ContentBlockByKey\(\s*'([a-z0-9-/._]+)'\s*\)/gim,
            ],
            name: [
                /ContentBlockByName\(\s*"([ a-z0-9-\\._]+)"\s*\)/gim,
                /ContentBlockByName\(\s*'([ a-z0-9-\\._]+)'\s*\)/gim,
            ],
        };
        let result = str;
        for (const regex of regexBy[from]) {
            result = result.replaceAll(regex, (match, identifier) => {
                const asset = this.getAssetBy[from](identifier);
                return this._replaceWith(asset, to);
            });
        }
        return result;
    },
    _getAssetBy: {
        /**
         *
         * @private
         * @param {string} pathName r__folder_Path +'/'+ name
         * @returns {{id: number, key: string, pathName: string}} asset object
         */
        name(pathName) {
            // TODO
            return { id: 9999, key: 'my-key', pathName: pathName };
        },
        /**
         *
         * @private
         * @param {number} id id of asset
         * @returns {{id: number, key: string, pathName: string}} asset object
         */
        id(id) {
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
        key(key) {
            // TODO
            return {
                id: 9999,
                key: key,
                pathName: `Content Builder\\Release 2 - BUILD\\Content Blocks Library\\NEW\\03. Header and banner\\Referred contentblock\\RS_Dev_Header_blue`,
            };
        },
    },
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
