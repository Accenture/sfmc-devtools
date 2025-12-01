export default Retriever;
export type BuObject = import("../types/mcdev.d.js").BuObject;
export type CodeExtract = import("../types/mcdev.d.js").CodeExtract;
export type CodeExtractItem = import("../types/mcdev.d.js").CodeExtractItem;
export type Mcdevrc = import("../types/mcdev.d.js").Mcdevrc;
export type MetadataTypeItem = import("../types/mcdev.d.js").MetadataTypeItem;
export type MetadataTypeItemDiff = import("../types/mcdev.d.js").MetadataTypeItemDiff;
export type MetadataTypeItemObj = import("../types/mcdev.d.js").MetadataTypeItemObj;
export type MetadataTypeMap = import("../types/mcdev.d.js").MetadataTypeMap;
export type MetadataTypeMapObj = import("../types/mcdev.d.js").MetadataTypeMapObj;
export type MultiMetadataTypeList = import("../types/mcdev.d.js").MultiMetadataTypeList;
export type MultiMetadataTypeMap = import("../types/mcdev.d.js").MultiMetadataTypeMap;
export type SoapRequestParams = import("../types/mcdev.d.js").SoapRequestParams;
export type TemplateMap = import("../types/mcdev.d.js").TemplateMap;
export type TypeKeyCombo = import("../types/mcdev.d.js").TypeKeyCombo;
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
declare class Retriever {
    /**
     * Creates a Retriever, uses v2 auth if v2AuthOptions are passed.
     *
     * @param {Mcdevrc} properties General configuration to be used in retrieve
     * @param {BuObject} buObject properties for auth
     */
    constructor(properties: Mcdevrc, buObject: BuObject);
    buObject: import("../types/mcdev.d.js").BuObject;
    properties: import("../types/mcdev.d.js").Mcdevrc;
    retrieveDir: string;
    templateDir: string;
    savePath: string;
    /**
     * Retrieve metadata of specified types into local file system and Retriever.metadata
     *
     * @param {string[]} metadataTypes list of metadata types to retrieve; can include subtypes!
     * @param {string[] | TypeKeyCombo} [namesOrKeys] name of Metadata to retrieveAsTemplate or list of keys for normal retrieval
     * @param {TemplateMap} [templateVariables] Object of values which can be replaced (in case of templating)
     * @param {boolean} [changelogOnly] skip saving, only create json in memory
     * @returns {Promise.<MultiMetadataTypeList>} Promise of a list of retrieved items grouped by type {automation:[...], query:[...]}
     */
    retrieve(metadataTypes: string[], namesOrKeys?: string[] | TypeKeyCombo, templateVariables?: TemplateMap, changelogOnly?: boolean): Promise<MultiMetadataTypeList>;
    /**
     * helper for Retriever.retrieve to get all dependencies of the given types
     *
     * @param {string[]} metadataTypes list of metadata types to retrieve; can include subtypes!
     * @returns {string[]} unique list dependent metadata types
     */
    _getTypeDependencies(metadataTypes: string[]): string[];
}
//# sourceMappingURL=Retriever.d.ts.map