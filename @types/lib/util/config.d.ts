export default config;
export type AuthObject = import("../../types/mcdev.d.js").AuthObject;
export type BuObject = import("../../types/mcdev.d.js").BuObject;
export type Cache = import("../../types/mcdev.d.js").Cache;
export type CodeExtract = import("../../types/mcdev.d.js").CodeExtract;
export type CodeExtractItem = import("../../types/mcdev.d.js").CodeExtractItem;
export type DeltaPkgItem = import("../../types/mcdev.d.js").DeltaPkgItem;
export type Mcdevrc = import("../../types/mcdev.d.js").Mcdevrc;
export type MetadataTypeItem = import("../../types/mcdev.d.js").MetadataTypeItem;
export type MetadataTypeItemDiff = import("../../types/mcdev.d.js").MetadataTypeItemDiff;
export type MetadataTypeItemObj = import("../../types/mcdev.d.js").MetadataTypeItemObj;
export type MetadataTypeMap = import("../../types/mcdev.d.js").MetadataTypeMap;
export type MetadataTypeMapObj = import("../../types/mcdev.d.js").MetadataTypeMapObj;
export type MultiMetadataTypeList = import("../../types/mcdev.d.js").MultiMetadataTypeList;
export type MultiMetadataTypeMap = import("../../types/mcdev.d.js").MultiMetadataTypeMap;
export type SoapRequestParams = import("../../types/mcdev.d.js").SoapRequestParams;
export type TemplateMap = import("../../types/mcdev.d.js").TemplateMap;
export type TypeKeyCombo = import("../../types/mcdev.d.js").TypeKeyCombo;
declare namespace config {
    let properties: any;
    /**
     * loads central properties from config file
     *
     * @param {boolean} [silent] omit throwing errors and print messages; assuming not silent if not set
     * @param {boolean} [isInit] don't tell the user to run init
     * @returns {Promise.<Mcdevrc>} central properties object
     */
    function getProperties(silent?: boolean, isInit?: boolean): Promise<Mcdevrc>;
    /**
     * check if the config file is correctly formatted and has values
     *
     * @param {Mcdevrc} properties javascript object in .mcdevrc.json
     * @param {boolean} [silent] set to true for internal use w/o cli output
     * @returns {Promise.<boolean | string[]>} file structure ok OR list of fields to be fixed
     */
    function checkProperties(properties: Mcdevrc, silent?: boolean): Promise<boolean | string[]>;
    /**
     * defines how the properties.json should look like
     * used for creating a template and for checking if variables are set
     *
     * @returns {Promise.<Mcdevrc>} default properties
     */
    function getDefaultProperties(): Promise<Mcdevrc>;
}
//# sourceMappingURL=config.d.ts.map