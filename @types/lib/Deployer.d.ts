export default Deployer;
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
export type MultiMetadataTypeMap = import("../types/mcdev.d.js").MultiMetadataTypeMap;
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
 * @typedef {import('../types/mcdev.d.js').SoapRequestParams} SoapRequestParams
 * @typedef {import('../types/mcdev.d.js').TemplateMap} TemplateMap
 * @typedef {import('../types/mcdev.d.js').MultiMetadataTypeMap} MultiMetadataTypeMap
 * @typedef {import('../types/mcdev.d.js').TypeKeyCombo} TypeKeyCombo
 */
/**
 * Reads metadata from local directory and deploys it to specified target business unit.
 * Source and target business units are also compared before the deployment to apply metadata specific patches.
 */
declare class Deployer {
    /**
     * Deploys all metadata located in the 'deploy' directory to the specified business unit
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {string[] | TypeKeyCombo} [selectedTypesArr] limit deployment to given metadata type
     * @param {string[]} [keyArr] limit deployment to given metadata keys
     * @returns {Promise.<Object.<string, MultiMetadataTypeMap>>} deployed metadata per BU (first key: bu name, second key: metadata type)
     */
    static deploy(businessUnit: string, selectedTypesArr?: string[] | TypeKeyCombo, keyArr?: string[]): Promise<{
        [x: string]: MultiMetadataTypeMap;
    }>;
    /**
     * helper for {@link Deployer.deploy}
     *
     * @param {string} cred name of Credential
     * @param {string} bu name of BU
     * @param {Mcdevrc} properties General configuration to be used in retrieve
     * @param {string[] | TypeKeyCombo} [typeArr] limit deployment to given metadata type
     * @param {string[]} [keyArr] limit deployment to given metadata keys
     * @returns {Promise.<MultiMetadataTypeMap>} ensure that BUs are worked on sequentially
     */
    static _deployBU(cred: string, bu: string, properties: Mcdevrc, typeArr?: string[] | TypeKeyCombo, keyArr?: string[]): Promise<MultiMetadataTypeMap>;
    /**
     * Returns metadata of a business unit that is saved locally
     *
     * @param {string} deployDir root directory of metadata.
     * @param {string[]} [typeArr] limit deployment to given metadata type
     * @param {boolean} [listBadKeys] do not print errors, used for badKeys()
     * @returns {Promise.<MultiMetadataTypeMap>} Metadata of BU in local directory
     */
    static readBUMetadata(deployDir: string, typeArr?: string[], listBadKeys?: boolean): Promise<MultiMetadataTypeMap>;
    /**
     * parses asset metadata to auto-create folders in target folder
     *
     * @param {string} deployDir root directory of metadata.
     * @param {MultiMetadataTypeMap} metadata list of metadata
     * @param {string[]} metadataTypeArr list of metadata types
     * @returns {Promise.<object>} folder metadata
     */
    static createFolderDefinitions(deployDir: string, metadata: MultiMetadataTypeMap, metadataTypeArr: string[]): Promise<object>;
    /**
     * Creates a Deployer, uses v2 auth if v2AuthOptions are passed.
     *
     * @param {Mcdevrc} properties General configuration to be used in retrieve
     * @param {BuObject} buObject properties for auth
     */
    constructor(properties: Mcdevrc, buObject: BuObject);
    buObject: import("../types/mcdev.d.js").BuObject;
    properties: import("../types/mcdev.d.js").Mcdevrc;
    deployDir: string;
    retrieveDir: string;
    /**
     * Deploy all metadata that is located in the deployDir
     *
     * @param {string[] | TypeKeyCombo} [types] limit deployment to given metadata type (can include subtype)
     * @param {string[]} [keyArr] limit deployment to given metadata keys
     * @returns {Promise.<MultiMetadataTypeMap>} Promise of all deployed metadata
     */
    _deploy(types?: string[] | TypeKeyCombo, keyArr?: string[]): Promise<MultiMetadataTypeMap>;
    /** @type {MultiMetadataTypeMap} */
    metadata: MultiMetadataTypeMap;
}
//# sourceMappingURL=Deployer.d.ts.map