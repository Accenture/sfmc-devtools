export default Builder;
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
export type SoapRequestParams = import("../types/mcdev.d.js").SoapRequestParams;
export type TemplateMap = import("../types/mcdev.d.js").TemplateMap;
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
declare class Builder {
    /**
     * Build a template based on a list of metadata files in the retrieve folder.
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {string} selectedType supported metadata type
     * @param {string[]} keyArr customerkey of the metadata
     * @param {string[]} marketArr market localizations
     * @returns {Promise.<MultiMetadataTypeList>} -
     */
    static buildTemplate(businessUnit: string, selectedType: string, keyArr: string[], marketArr: string[]): Promise<MultiMetadataTypeList>;
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
    static buildDefinition(businessUnit: string, selectedType: string, nameArr: string[], marketArr: string[], isPurgeDeployFolder?: boolean): Promise<MultiMetadataTypeList>;
    /**
     * Build a specific metadata file based on a template using a list of bu-market combos
     *
     * @param {string} listName name of list of BU-market combos
     * @param {string} type supported metadata type
     * @param {string[]} nameArr name of the metadata
     * @returns {Promise.<object>} -
     */
    static buildDefinitionBulk(listName: string, type: string, nameArr: string[]): Promise<object>;
    /**
     * Creates a Builder, uses v2 auth if v2AuthOptions are passed.
     *
     * @param {Mcdevrc} properties properties for auth
saved
     * @param {BuObject} buObject properties for auth
     */
    constructor(properties: Mcdevrc, buObject: BuObject);
    properties: import("../types/mcdev.d.js").Mcdevrc;
    templateDir: string;
    retrieveDir: string;
    buObject: import("../types/mcdev.d.js").BuObject;
    targetDir: string[];
    /**
     * @type {MultiMetadataTypeList}
     */
    metadata: MultiMetadataTypeList;
    /**
     * Builds a specific metadata file by name
     *
     * @param {string} metadataType metadata type to build
     * @param {string[]} nameArr name of metadata to build
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {Promise.<MultiMetadataTypeList>} Promise
     */
    _buildDefinition(metadataType: string, nameArr: string[], templateVariables: TemplateMap): Promise<MultiMetadataTypeList>;
    /**
     * Build a template based on a list of metadata files in the retrieve folder.
     *
     * @param {string} metadataType metadata type to create a template of
     * @param {string[]} keyArr customerkey of metadata to create a template of
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {Promise.<MultiMetadataTypeList>} Promise
     */
    _buildTemplate(metadataType: string, keyArr: string[], templateVariables: TemplateMap): Promise<MultiMetadataTypeList>;
}
//# sourceMappingURL=Builder.d.ts.map