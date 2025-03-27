export default FileFs;
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
declare const FileFs: typeof fs & {
    prettierConfig: any;
    prettierConfigFileType: any;
    /**
     * copies a file from one path to another
     *
     * @param {string} from - full filepath including name of existing file
     * @param {string} to - full filepath including name where file should go
     * @returns {Promise.<{status:'ok'|'skipped'|'failed', statusMessage:string, file:string}>} - results object
     */
    copyFileSimple(from: string, to: string): Promise<{
        status: "ok" | "skipped" | "failed";
        statusMessage: string;
        file: string;
    }>;
    /**
     * makes sure Windows accepts path names
     *
     * @param {string} path - filename or path
     * @returns {string} - corrected string
     */
    filterIllegalPathChars(path: string): string;
    /**
     * makes sure Windows accepts file names
     *
     * @param {string} filename - filename or path
     * @returns {string} - corrected string
     */
    filterIllegalFilenames(filename: string): string;
    /**
     * makes sure Windows accepts file names
     *
     * @param {string} filename - filename or path
     * @returns {string} - corrected string
     */
    reverseFilterIllegalFilenames(filename: string): string;
    /**
     * Takes various types of path strings and formats into a platform specific path
     *
     * @param {string|string[]} denormalizedPath directory the file will be written to
     * @returns {string} Path strings
     */
    normalizePath: (denormalizedPath: string | string[]) => string;
    /**
     * Saves json content to a file in the local file system. Will create the parent directory if it does not exist
     *
     * @param {string|string[]} directory directory the file will be written to
     * @param {string} filename name of the file without '.json' ending
     * @param {object} content filecontent
     * @returns {Promise} Promise
     */
    writeJSONToFile: (directory: string | string[], filename: string, content: object) => Promise<any>;
    /**
     * Saves beautified files in the local file system. Will create the parent directory if it does not exist
     * ! Important: run 'await File.initPrettier()' in your MetadataType.retrieve() once before hitting this
     *
     * @param {string|string[]} directory directory the file will be written to
     * @param {string} filename name of the file without suffix
     * @param {string} filetype filetype ie. JSON or SSJS
     * @param {string} content filecontent
     * @param {TemplateMap} [templateVariables] templating variables to be replaced in the metadata
     * @returns {Promise.<boolean>} Promise
     */
    writePrettyToFile: (directory: string | string[], filename: string, filetype: string, content: string, templateVariables?: TemplateMap) => Promise<boolean>;
    /**
     * helper that applies beautyAmp onto given stringified content; strongly typed for strings only
     *
     * @param {string} content code
     * @param {boolean} [formatHTML] applies formatting to html and ampscript if true
     * @returns {Promise.<string>} formatted code
     */
    _beautify_beautyAmp_beautify: (content: string, formatHTML?: boolean) => Promise<string>;
    /**
     * helper for {@link File.writePrettyToFile}, applying beautyAmp onto given stringified content
     *
     * @param {string} content filecontent
     * @param {boolean} formatHTML should we format HTML or not via prettier included in beautyAmp
     * @returns {Promise.<string>} original string on error; formatted string on success
     */
    beautify_beautyAmp: (content: string, formatHTML?: boolean) => Promise<string>;
    /**
     * helper for {@link File.writePrettyToFile}, applying prettier onto given stringified content
     * ! Important: run 'await File.initPrettier()' in your MetadataType.retrieve() once before hitting this
     *
     * @param {string|string[]} directory directory the file will be written to
     * @param {string} filename name of the file without suffix
     * @param {string} filetype filetype ie. JSON or SSJS
     * @param {string} content filecontent
     * @returns {Promise.<string>} original string on error; formatted string on success
     */
    _beautify_prettier: (directory: string | string[], filename: string, filetype: string, content: string) => Promise<string>;
    /**
     * Saves text content to a file in the local file system. Will create the parent directory if it does not exist
     *
     * @param {string|string[]} directory directory the file will be written to
     * @param {string} filename name of the file without '.json' ending
     * @param {string} filetype filetype suffix
     * @param {string} content filecontent
     * @param {object} [encoding] added for certain file types (like images)
     * @returns {Promise.<boolean>} Promise
     */
    writeToFile: (directory: string | string[], filename: string, filetype: string, content: string, encoding?: object) => Promise<boolean>;
    /**
     * Saves json content to a file in the local file system. Will create the parent directory if it does not exist
     *
     * @param {string | string[]} directory directory where the file is stored
     * @param {string} filename name of the file without '.json' ending
     * @param {boolean} cleanPath filters illegal chars if true
     * @returns {Promise.<object | object | void>} Promise or JSON object depending on if async or not; void on error
     */
    readJSONFile: (directory: string | string[], filename: string, cleanPath: boolean) => Promise<object | object | void>;
    /**
     * reads file from local file system.
     *
     * @param {string | string[]} directory directory where the file is stored
     * @param {string} filename name of the file without '.json' ending
     * @param {string} filetype filetype suffix
     * @param {string} [encoding] read file with encoding (defaults to utf-8)
     * @returns {Promise.<string>} file contents; void on error
     */
    readFilteredFilename: (directory: string | string[], filename: string, filetype: string, encoding?: string) => Promise<string>;
    /**
     * reads directories to a specific depth returning an array
     * of file paths to be iterated over
     *
     * @example ['deploy/mcdev/bu1']
     * @param {string} directory directory to checkin
     * @param {number} depth how many levels to check (1 base)
     * @param {boolean} [includeStem] include the parent directory in the response
     * @param {number} [_stemLength] set recursively for subfolders. do not set manually!
     * @returns {Promise.<string[]>} array of fully defined file paths
     */
    readDirectories: (directory: string, depth: number, includeStem?: boolean, _stemLength?: number) => Promise<string[]>;
    /**
     * reads directories to a specific depth returning an array
     * of file paths to be iterated over using sync api (required in constructors)
     * TODO - merge with readDirectories. so far the logic is really different
     *
     * @example ['deploy/mcdev/bu1']
     * @param {string} directory directory to checkin
     * @param {number} [depth] how many levels to check (1 base)
     * @param {boolean} [includeStem] include the parent directory in the response
     * @param {number} [_stemLength] set recursively for subfolders. do not set manually!
     * @returns {string[] | void} array of fully defined file paths; void on error
     */
    readDirectoriesSync: (directory: string, depth?: number, includeStem?: boolean, _stemLength?: number) => string[] | void;
    /**
     * helper that splits the config back into auth & config parts to save them separately
     *
     * @param {Mcdevrc} properties central properties object
     * @returns {Promise.<void>} -
     */
    saveConfigFile(properties: Mcdevrc): Promise<void>;
    /**
     * Initalises Prettier formatting lib async.
     *
     * @param {string} [filetype] filetype ie. JSON or SSJS
     * @returns {Promise.<boolean>} success of config load
     */
    initPrettier(filetype?: string): Promise<boolean>;
};
import fs from 'fs-extra';
//# sourceMappingURL=file.d.ts.map