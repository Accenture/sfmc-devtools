export default DevOps;
export type AuthObject = import('../../types/mcdev.d.js').AuthObject;
export type BuObject = import('../../types/mcdev.d.js').BuObject;
export type Cache = import('../../types/mcdev.d.js').Cache;
export type CodeExtract = import('../../types/mcdev.d.js').CodeExtract;
export type CodeExtractItem = import('../../types/mcdev.d.js').CodeExtractItem;
export type DeltaPkgItem = import('../../types/mcdev.d.js').DeltaPkgItem;
export type Mcdevrc = import('../../types/mcdev.d.js').Mcdevrc;
export type MetadataTypeItem = import('../../types/mcdev.d.js').MetadataTypeItem;
export type MetadataTypeItemDiff = import('../../types/mcdev.d.js').MetadataTypeItemDiff;
export type MetadataTypeItemObj = import('../../types/mcdev.d.js').MetadataTypeItemObj;
export type MetadataTypeMap = import('../../types/mcdev.d.js').MetadataTypeMap;
export type MetadataTypeMapObj = import('../../types/mcdev.d.js').MetadataTypeMapObj;
export type MultiMetadataTypeList = import('../../types/mcdev.d.js').MultiMetadataTypeList;
export type MultiMetadataTypeMap = import('../../types/mcdev.d.js').MultiMetadataTypeMap;
export type SoapRequestParams = import('../../types/mcdev.d.js').SoapRequestParams;
export type TemplateMap = import('../../types/mcdev.d.js').TemplateMap;
export type TypeKeyCombo = import('../../types/mcdev.d.js').TypeKeyCombo;
declare namespace DevOps {
    /**
     * Extracts the delta between a commit and the current state for deployment.
     * Interactive commit selection if no commits are passed.
     *
     * @param {Mcdevrc} properties central properties object
     * @param {string} [range] git commit range
     * @param {boolean} [saveToDeployDir] if true, copy metadata changes into deploy directory
     * @param {string} [filterPathsCSV] filter file paths that start with any specified path (comma separated)
     * @param {number} [commitHistory] cli option to override default commit history value in config
     * @returns {Promise.<DeltaPkgItem[]>} -
     */
    function getDeltaList(properties: import("../../types/mcdev.d.js").Mcdevrc, range?: string, saveToDeployDir?: boolean, filterPathsCSV?: string, commitHistory?: number): Promise<import("../../types/mcdev.d.js").DeltaPkgItem[]>;
    /**
     * wrapper around DevOps.getDeltaList, Builder.buildTemplate and M
     *
     * @param {Mcdevrc} properties project config file
     * @param {string} range git commit range
     * @param {DeltaPkgItem[]} [diffArr] instead of running git diff the method can also get a list of files to process
     * @param {number} [commitHistory] cli option to override default commit history value in config
     * @returns {Promise.<DeltaPkgItem[]>} -
     */
    function buildDeltaDefinitions(properties: import("../../types/mcdev.d.js").Mcdevrc, range: string, diffArr?: import("../../types/mcdev.d.js").DeltaPkgItem[], commitHistory?: number): Promise<import("../../types/mcdev.d.js").DeltaPkgItem[]>;
    /**
     * create markdown file for deployment listing
     *
     * @param {string} directory -
     * @param {object} jsonReport -
     * @returns {void}
     */
    function document(directory: string, jsonReport: any): void;
    /**
     * should return only the json for all but asset, query and script that are saved as multiple files
     * additionally, the documentation for dataExtension and automation should be returned
     *
     * @param {Mcdevrc} properties central properties object
     * @param {BuObject} buObject references credentials
     * @param {string} metadataType metadata type to build
     * @param {string[]} keyArr customerkey of the metadata
     * @returns {Promise.<string[]>} list of all files that need to be committed in a flat array ['path/file1.ext', 'path/file2.ext']
     */
    function getFilesToCommit(properties: import("../../types/mcdev.d.js").Mcdevrc, buObject: import("../../types/mcdev.d.js").BuObject, metadataType: string, keyArr: string[]): Promise<string[]>;
}
//# sourceMappingURL=devops.d.ts.map