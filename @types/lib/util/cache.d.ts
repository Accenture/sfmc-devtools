declare namespace _default {
    function initCache(buObject: BuObject): void;
    function getCache(): MultiMetadataTypeMap;
    function clearCache(mid?: number): void;
    function getByKey(type: string, key: string): MetadataTypeItem;
    function setMetadata(type: string, metadataMap: MetadataTypeMap): void;
    function mergeMetadata(type: string, metadataMap: MetadataTypeMap, overrideMID?: number): void;
    /**
     * standardized method for getting data from cache.
     *
     * @param {string} metadataType metadata type ie. query
     * @param {string|number|boolean} searchValue unique identifier of metadata being looked for
     * @param {string} searchField field name (key in object) which contains the unique identifer
     * @param {string} returnField field which should be returned
     * @param {number} [overrideMID] ignore currentMID and use alternative (for example parent MID)
     * @returns {string} value of specified field. Error is thrown if not found
     */
    function searchForField(metadataType: string, searchValue: string | number | boolean, searchField: string, returnField: string, overrideMID?: number): string;
    /**
     * helper for setFolderId
     *
     * @param {string} r__folder_Path folder path value
     * @param {number} [overrideMID] ignore currentMID and use alternative (for example parent MID)
     * @param {boolean} allowOtherBu getting folder from other BU; FALSE for folder parent search
     * @returns {number} folder ID
     */
    function getFolderId(r__folder_Path: string, overrideMID?: number, allowOtherBu?: boolean): number;
    /**
     * standardized method for getting data from cache - adapted for special case of lists
     * ! keeping this in util/cache.js rather than in metadataTypes/List.js to avoid potential circular dependencies
     *
     * @param {string} searchValue unique identifier of metadata being looked for
     * @param {'ObjectID'|'ID'|'CustomerKey'} searchField ObjectID:string(uuid), ID:numeric, CustomerKey:string(name + folder ID)
     * @returns {string} unique folderPath/ListName combo of list
     */
    function getListPathName(searchValue: string, searchField: "ObjectID" | "ID" | "CustomerKey"): string;
    /**
     * standardized method for getting data from cache - adapted for special case of lists
     * ! keeping this in util/cache.js rather than in metadataTypes/List.js to avoid potential circular dependencies
     *
     * @param {string} listPathName folderPath/ListName combo of list
     * @param {'ObjectID'|'ID'|'CustomerKey'|'ListName'} returnField ObjectID:string(uuid), ID:numeric, CustomerKey:string(name + folder ID)
     * @returns {string} unique ObjectId of list
     */
    function getListObjectId(listPathName: string, returnField: "ObjectID" | "ID" | "CustomerKey" | "ListName"): string;
}
export default _default;
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
export type ListItem = import("../../types/mcdev.d.js").ListItem;
export type ListMap = import("../../types/mcdev.d.js").ListMap;
//# sourceMappingURL=cache.d.ts.map