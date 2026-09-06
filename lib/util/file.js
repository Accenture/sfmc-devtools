'use strict';
import fs from 'fs-extra';

import path from 'node:path';
import prettier from 'prettier';
import * as prettierPluginSfmc from 'prettier-plugin-sfmc';
import { Util } from './util.js';
import updateNotifier from 'update-notifier';
import config from './config.js';

/**
 * @typedef {import('../../types/mcdev.d.js').AuthObject} AuthObject
 * @typedef {import('../../types/mcdev.d.js').BuObject} BuObject
 * @typedef {import('../../types/mcdev.d.js').Cache} Cache
 * @typedef {import('../../types/mcdev.d.js').CodeExtract} CodeExtract
 * @typedef {import('../../types/mcdev.d.js').CodeExtractItem} CodeExtractItem
 * @typedef {import('../../types/mcdev.d.js').DeltaPkgItem} DeltaPkgItem
 * @typedef {import('../../types/mcdev.d.js').Mcdevrc} Mcdevrc
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItem} MetadataTypeItem
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItemDiff} MetadataTypeItemDiff
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItemObj} MetadataTypeItemObj
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMap} MetadataTypeMap
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMapObj} MetadataTypeMapObj
 * @typedef {import('../../types/mcdev.d.js').MultiMetadataTypeList} MultiMetadataTypeList
 * @typedef {import('../../types/mcdev.d.js').MultiMetadataTypeMap} MultiMetadataTypeMap
 * @typedef {import('../../types/mcdev.d.js').SoapRequestParams} SoapRequestParams
 * @typedef {import('../../types/mcdev.d.js').TemplateMap} TemplateMap
 * @typedef {import('../../types/mcdev.d.js').TypeKeyCombo} TypeKeyCombo
 */

// inform user when there is an update
const notifier = updateNotifier({
    pkg: Util.packageJsonMcdev,
    updateCheckInterval: 1000 * 3600 * 24, // once per day
});
// Notify using the built-in convenience method
notifier.notify();

/**
 * File extends fs-extra. It adds logger and util methods for file handling
 */
const File = {
    // Deprecated compatibility fields. Formatting uses immutable per-filetype entries below.
    prettierConfig: null,
    prettierConfigFileType: null,
    prettierConfigCache: new Map(),

    /**
     * Maps mcdev file extensions to Prettier parser names.
     *
     * @param {string} filetype file extension without dot
     * @returns {string | undefined} parser name when mcdev has an explicit mapping
     */
    _getPrettierParser(filetype) {
        switch (filetype.toLowerCase()) {
            case 'amp':
            case 'ampscript':
            case 'html':
            case 'htm':
            case 'hbs': {
                return 'ampscript-parse';
            }
            case 'ssjs':
            case 'js': {
                return 'babel';
            }
            case 'sql': {
                return 'sql';
            }
            case 'json': {
                return 'json';
            }
            case 'jsonc': {
                return 'jsonc';
            }
            case 'yaml':
            case 'yml': {
                return 'yaml';
            }
            case 'ts': {
                return 'babel-ts';
            }
            case 'css': {
                return 'css';
            }
            case 'less': {
                return 'less';
            }
            case 'scss': {
                return 'scss';
            }
            case 'md': {
                return 'markdown';
            }
            default: {
                // Unknown and intentionally unsupported text types (csv, rss, sass, txt, xml)
                // rely on filepath inference; absent inference means safe pass-through.
                return;
            }
        }
    },

    /**
     * Checks whether formatting is enabled by CLI or project configuration.
     *
     * @param {Mcdevrc} properties project configuration
     * @returns {boolean} whether formatting should run
     */
    _isFormattingEnabled(properties) {
        return Boolean(
            (properties?.options?.formatOnSave && Util.OPTIONS.format === undefined) ||
            Util.OPTIONS.format
        );
    },

    /**
     * copies a file from one path to another
     *
     * @param {string} from - full filepath including name of existing file
     * @param {string} to - full filepath including name where file should go
     * @returns {Promise.<{status:'ok'|'skipped'|'failed', statusMessage:string, file:string}>} - results object
     */
    async copyFileSimple(from, to) {
        try {
            await fs.copy(from, to);
            return { status: 'ok', statusMessage: null, file: from };
        } catch (ex) {
            // This can happen in some cases where referencing files deleted in Commit
            return ex.message.startsWith('ENOENT: no such file or directory')
                ? {
                      status: 'skipped',
                      statusMessage: 'deleted from repository',
                      file: from,
                  }
                : { status: 'failed', statusMessage: ex.message, file: from };
        }
    },

    /**
     * makes sure Windows accepts path names
     *
     * @param {string} path - filename or path
     * @returns {string} - corrected string
     */
    filterIllegalPathChars(path) {
        return (
            encodeURIComponent(path)
                .replaceAll(/[*]/g, '_STAR_')
                // convert space back
                .split('%20')
                .join(' ')
                // convert forward slash back as it's needed in dirs
                .split('%2F')
                .join('/')
                // convert backward slash back as it's needed in dirs
                .split('%5C')
                .join('\\')
                // convert opening-curly brackets back for templating
                .split('%7B')
                .join('{')
                // convert closing-curly brackets back for templating
                .split('%7D')
                .join('}')
                // convert brackets back for asset blocks
                .split('%5B')
                .join('[')
                // convert brackets back for asset blocks
                .split('%5D')
                .join(']')
                // convert @ back for users
                .split('%40')
                .join('@')
        );
    },

    /**
     * makes sure Windows accepts file names
     *
     * @param {string} filename - filename or path
     * @returns {string} - corrected string
     */
    filterIllegalFilenames(filename) {
        return (
            encodeURIComponent(filename)
                .replaceAll(/[*]/g, '_STAR_')
                // convert space back
                .split('%20')
                .join(' ')
                // convert opening-curly brackets back for templating
                .split('%7B')
                .join('{')
                // convert closing-curly brackets back for templating
                .split('%7D')
                .join('}')
                // convert brackets back for asset blocks
                .split('%5B')
                .join('[')
                // convert brackets back for asset blocks
                .split('%5D')
                .join(']')
                // convert @ back for users
                .split('%40')
                .join('@')
        );
    },

    /**
     * makes sure Windows accepts file names
     *
     * @param {string} filename - filename or path
     * @returns {string} - corrected string
     */
    reverseFilterIllegalFilenames(filename) {
        return decodeURIComponent(filename).split('_STAR_').join('*');
    },

    /**
     * Takes various types of path strings and formats into a platform specific path
     *
     * @param {string|string[]} denormalizedPath directory the file will be written to
     * @returns {string} Path strings
     */
    normalizePath: function (denormalizedPath) {
        /* eslint-disable unicorn/prefer-ternary */
        if (Array.isArray(denormalizedPath)) {
            // if the value is undefined set to empty string to allow parsing
            return path.join(...denormalizedPath.map((val) => val || ''));
        } else {
            // if directory is empty put . as otherwill will write to c://
            return path.join(denormalizedPath || '.');
        }
        /* eslint-enable unicorn/prefer-ternary */
    },

    /**
     * Saves json content to a file in the local file system. Will create the parent directory if it does not exist
     *
     * @param {string|string[]} directory directory the file will be written to
     * @param {string} filename name of the file without '.json' ending
     * @param {object} content filecontent
     * @returns {Promise} Promise
     */
    writeJSONToFile: async function (directory, filename, content) {
        directory = this.filterIllegalPathChars(this.normalizePath(directory));
        filename = this.filterIllegalFilenames(filename);
        try {
            await fs.ensureDir(directory);
            await fs.writeJSON(path.join(directory, filename + '.json'), content, { spaces: 4 });
            return true;
        } catch (ex) {
            Util.logger.error('File.writeJSONToFile:: error | ' + ex.message);
            return false;
        }
    },

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
    writePrettyToFile: async function (directory, filename, filetype, content, templateVariables) {
        const properties = await config.getProperties();
        let formatted = this._isFormattingEnabled(properties)
            ? await this._beautify_prettier(directory, filename, filetype, content)
            : content;
        if (templateVariables) {
            formatted = Util.replaceByObject(formatted, templateVariables);
        }
        return this.writeToFile(directory, filename, filetype, formatted);
    },

    /**
     * Formats extracted Transactional SMS content when formatting is enabled.
     *
     * @param {string} content extracted AMPscript content
     * @returns {Promise.<string>} original string when disabled or on error; formatted string on success
     */
    _formatTransactionalSmsContent: async function (content) {
        const properties = await config.getProperties();
        if (!this._isFormattingEnabled(properties)) {
            return content;
        }
        return this._beautify_prettier('', '', 'amp', content);
    },

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
    _beautify_prettier: async function (directory, filename, filetype, content) {
        const properties = await config.getProperties();
        const normalizedFiletype = filetype.toLowerCase();
        const filepath = path.resolve(
            this.normalizePath(directory),
            `${filename || 'index'}.${normalizedFiletype}`
        );
        const mappedParser = this._getPrettierParser(normalizedFiletype);
        let effectiveParser;
        /** @type {string} */
        let formatted;
        try {
            await this.initPrettier(normalizedFiletype);
            const resolvedConfig = FileFs.prettierConfigCache.get(normalizedFiletype);
            if (!resolvedConfig) {
                return content;
            }
            effectiveParser = resolvedConfig.parser || mappedParser;
            if (!effectiveParser && !(await prettier.getFileInfo(filepath)).inferredParser) {
                return content;
            }

            const formatOptions = {
                ...resolvedConfig,
                filepath,
                plugins: [...(resolvedConfig.plugins || []), prettierPluginSfmc],
            };
            if (effectiveParser) {
                formatOptions.parser = effectiveParser;
            }
            formatted = await prettier.format(content, formatOptions);
        } catch (ex) {
            if (properties?.options?.formatErrorLog) {
                // save prettier error into log file
                // Note: filter color codes from Prettier's error message before saving it
                /* eslint-disable no-control-regex */
                const parserContext = effectiveParser ? `Parser: ${effectiveParser}\n` : '';
                await this.writeToFile(
                    directory,
                    filename + '.error',
                    'log',
                    `Error Log\nFile: ${filepath}\n${parserContext}${ex.message.replaceAll(
                        /[\u001B\u009B][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
                        ''
                    )}`
                );
                /* eslint-enable no-control-regex */
            }

            formatted = content;
        }

        return formatted;
    },

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
    writeToFile: async function (directory, filename, filetype, content, encoding) {
        directory = this.filterIllegalPathChars(this.normalizePath(directory));
        await fs.ensureDir(directory);
        // filter characters that are illegal for file names in Windows
        filename = this.filterIllegalFilenames(filename);
        const filePath = path.join(directory, filename + '.' + filetype);
        try {
            if (await fs.pathExists(filePath)) {
                Util.logger.debug(`Overwriting: ${filePath}`);
            }
            await fs.writeFile(filePath, content, encoding);
            return true;
        } catch (ex) {
            Util.logger.error('File.writeToFile:: error | ' + ex.message);
            return false;
        }
    },

    /**
     * Saves json content to a file in the local file system. Will create the parent directory if it does not exist
     *
     * @param {string | string[]} directory directory where the file is stored
     * @param {string} filename name of the file without '.json' ending
     * @param {boolean} cleanPath filters illegal chars if true
     * @returns {Promise.<object | object | void>} Promise or JSON object depending on if async or not; void on error
     */
    readJSONFile: async function (directory, filename, cleanPath) {
        try {
            if (cleanPath == null || cleanPath == true) {
                directory = this.filterIllegalPathChars(this.normalizePath(directory));
                filename = this.filterIllegalFilenames(filename);
            } else {
                directory = this.normalizePath(directory);
            }

            if (filename.endsWith('.json')) {
                filename = filename.slice(0, -5);
            }
            let json;
            try {
                json = await fs.readJSON(path.join(directory, filename + '.json'));
            } catch (ex) {
                Util.logger.debug(ex.stack);
            }
            return json;
        } catch (ex) {
            Util.logger.error('File.readJSONFile:: error | ' + ex.message);
        }
    },

    /**
     * reads file from local file system.
     *
     * @param {string | string[]} directory directory where the file is stored
     * @param {string} filename name of the file without '.json' ending
     * @param {string} filetype filetype suffix
     * @param {string} [encoding] read file with encoding (defaults to utf-8)
     * @returns {Promise.<string>} file contents; void on error
     */
    readFilteredFilename: async function (directory, filename, filetype, encoding) {
        try {
            directory = this.filterIllegalPathChars(this.normalizePath(directory));
            filename = this.filterIllegalFilenames(filename);
            // @ts-expect-error somehow, the typing for fs-extra is not correct
            return fs.readFile(path.join(directory, filename + '.' + filetype), encoding || 'utf8');
        } catch (ex) {
            Util.logger.debug('File.readFilteredFilename:: error | ' + ex.message);
        }
        return;
    },

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
    readDirectories: async function (directory, depth, includeStem, _stemLength) {
        try {
            if (!_stemLength) {
                // only set this on first iteration
                _stemLength = directory.length;
            }
            const raw = await fs.readdir(directory, { withFileTypes: true });
            let children = [];
            for (const dirent of raw) {
                const direntPath = path.join(directory, dirent.name);
                if (
                    (await fs.pathExists(direntPath)) &&
                    (await fs.lstat(direntPath)).isDirectory() &&
                    depth > 0
                ) {
                    const nestedChildren = await this.readDirectories(
                        direntPath,
                        depth - 1,
                        includeStem,
                        _stemLength
                    );
                    children = children.concat(nestedChildren);
                }
            }
            if (children.length === 0) {
                // if not includeStem then remove base directory and leading slahes and backslashes
                return includeStem
                    ? [directory]
                    : [
                          directory
                              .slice(Math.max(0, _stemLength))
                              .replace(/^\\+/, '')
                              .replace(/^\/+/, ''),
                      ];
            } else {
                return children;
            }
        } catch (ex) {
            Util.logger.error('File.readDirectories:: error | ' + ex.message);
            Util.logger.debug(ex.stack);
        }
    },

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
    readDirectoriesSync: function (directory, depth, includeStem, _stemLength) {
        try {
            const children = [];

            if (!_stemLength) {
                // only set this on first iteration
                _stemLength = directory.length;
            }

            // add current directory
            if (includeStem) {
                children.push(directory);
            } else {
                // remove base directory and leading slahes and backslashes
                const currentPath = directory.slice(Math.max(0, _stemLength)).replace(path.sep, '');
                children.push(currentPath || '.');
            }
            // read all directories
            const raw = fs.readdirSync(directory, { withFileTypes: true });

            // loop through children of current directory (if not then this is skipped)
            for (const dirent of raw) {
                // if directory found and should get children then recursively call
                if (dirent.isDirectory() && depth > 0) {
                    const nestedChildren = this.readDirectoriesSync(
                        path.join(directory, dirent.name),
                        depth - 1,
                        includeStem,
                        _stemLength
                    );
                    if (Array.isArray(nestedChildren) && nestedChildren.length > 0) {
                        children.push(...nestedChildren);
                    }
                }
            }
            return children;
        } catch (ex) {
            Util.logger.error('File.readDirectoriesSync:: error | ' + ex.message);
            Util.logger.debug(ex.stack);
        }
    },

    /**
     * helper that splits the config back into auth & config parts to save them separately
     *
     * @param {Mcdevrc} properties central properties object
     * @param {string} [version] version to persist; defaults to the current mcdev version
     * @returns {Promise.<boolean>} whether the config file was saved successfully
     */
    async saveConfigFile(properties, version = Util.packageJsonMcdev.version) {
        const previousVersion = properties.version;
        // save the full version to allow us to upgrade configs properly in the future
        properties.version = version;

        const success = await this.writeJSONToFile(
            '',
            Util.configFileName.split('.json')[0],
            properties
        );
        if (!success) {
            properties.version = previousVersion;
            return false;
        }
        Util.logger.info(`✔️  ${Util.configFileName} and ${Util.authFileName} saved successfully`);
        return true;
    },

    /**
     * Initalises Prettier formatting lib async.
     *
     * @param {string} [filetype] filetype ie. JSON or SSJS
     * @returns {Promise.<boolean>} success of config load
     */
    async initPrettier(filetype = 'html') {
        const properties = await config.getProperties();
        if (!this._isFormattingEnabled(properties)) {
            return;
        }

        const effectiveFiletype = filetype.toLowerCase();
        if (FileFs.prettierConfigCache.has(effectiveFiletype)) {
            return false;
        }

        try {
            // Resolve against a synthetic project-root file so matching overrides are applied.
            // Clear Prettier's internal cache because mcdev tests and long-running API users can update config.
            prettier.clearConfigCache();
            const resolvedConfig = await prettier.resolveConfig(
                path.join(process.cwd(), 'index.' + effectiveFiletype)
            );
            if (resolvedConfig === null) {
                throw new Error(
                    `No .prettierrc found in your project directory. Please run 'mcdev upgrade' to create it`
                );
            }

            const immutableConfig = Object.freeze({
                ...resolvedConfig,
                plugins: Object.freeze([...(resolvedConfig.plugins || [])]),
            });
            FileFs.prettierConfigCache.set(effectiveFiletype, immutableConfig);
            // Maintain public compatibility fields without using them for formatting decisions.
            FileFs.prettierConfig = immutableConfig;
            FileFs.prettierConfigFileType = effectiveFiletype;
            return true;
        } catch (ex) {
            FileFs.prettierConfigCache.set(effectiveFiletype, false);
            FileFs.prettierConfig = false;
            FileFs.prettierConfigFileType = effectiveFiletype;
            Util.logger.error('Cannot apply auto-formatting to your code: ' + ex.message);
            return false;
        }
    },
};

const FileFs = Object.assign(fs, File);
export default FileFs;
