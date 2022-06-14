/* eslint-disable no-control-regex */
'use strict';

const fs = require('fs-extra');
const packageJson = require('../../package.json');
const path = require('path');
const prettier = require('prettier');
const Util = require('./util');
const updateNotifier = require('update-notifier');

// inform user when there is an update
const notifier = updateNotifier({
    pkg: packageJson,
    updateCheckInterval: 1000 * 3600 * 24, // once per day
});
// Notify using the built-in convenience method
notifier.notify();

/**
 * File extends fs-extra. It adds logger and util methods for file handling
 */
const File = {
    /**
     * copies a file from one path to another
     *
     * @param {string} from - full filepath including name of existing file
     * @param {string} to - full filepath including name where file should go
     * @returns {object} - results object
     */
    async copyFile(from, to) {
        try {
            await fs.copy(from, to);
            return { status: 'ok', file: from };
        } catch (ex) {
            // This can happen in some cases where referencing files deleted in Commit
            if (ex.message.startsWith('ENOENT: no such file or directory')) {
                return {
                    status: 'skipped',
                    statusMessage: 'deleted from repository',
                    file: from,
                };
            } else {
                return { status: 'failed', statusMessage: ex.message, file: from };
            }
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
                .replace(/[*]/g, '_STAR_')
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
                .replace(/[*]/g, '_STAR_')
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
        if (Array.isArray(denormalizedPath)) {
            // if the value is undefined set to empty string to allow parsing
            return path.join(...denormalizedPath.map((val) => val || ''));
        } else {
            // if directory is empty put . as otherwill will write to c://
            return path.join(denormalizedPath || '.');
        }
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
        await fs.ensureDir(directory);
        try {
            return fs.writeJSON(path.join(directory, filename + '.json'), content, { spaces: 4 });
        } catch (ex) {
            Util.logger.error('File.writeJSONToFile:: error | ' + ex.message);
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
     * @param {object} [templateVariables] templating variables to be replaced in the metadata
     * @returns {Promise.<boolean>} Promise
     */
    writePrettyToFile: async function (directory, filename, filetype, content, templateVariables) {
        let formatted = await this._beautify_prettier(directory, filename, filetype, content);
        if (templateVariables) {
            formatted = Util.replaceByObject(formatted, templateVariables);
        }
        return this.writeToFile(directory, filename, filetype, formatted);
    },
    /**
     * helper for writePrettyToFile, applying prettier onto given stringified content
     * ! Important: run 'await File.initPrettier()' in your MetadataType.retrieve() once before hitting this
     *
     * @param {string|string[]} directory directory the file will be written to
     * @param {string} filename name of the file without suffix
     * @param {string} filetype filetype ie. JSON or SSJS
     * @param {string} content filecontent
     * @returns {string} original string on error; formatted string on success
     */
    _beautify_prettier: function (directory, filename, filetype, content) {
        if (!FileFs.prettierConfig) {
            // either no prettier config in project directory or initPrettier was not run before this
            return content;
        } else if (content.includes('%%[') || content.includes('%%=')) {
            // in case we find AMPScript we need to abort beautifying as prettier
            // will throw an error falsely assuming bad syntax
            return content;
        }
        let formatted = '';
        try {
            // load the right prettier config relative to our file
            switch (filetype) {
                case 'htm':
                case 'html':
                    FileFs.prettierConfig.parser = 'html';
                    break;
                case 'ssjs':
                case 'js':
                    FileFs.prettierConfig.parser = 'babel';
                    break;
                case 'json':
                    FileFs.prettierConfig.parser = 'json';
                    break;
                case 'yaml':
                case 'yml':
                    FileFs.prettierConfig.parser = 'yaml';
                    break;
                case 'ts':
                    FileFs.prettierConfig.parser = 'babel-ts';
                    break;
                case 'css':
                    FileFs.prettierConfig.parser = 'css';
                    break;
                case 'less':
                    FileFs.prettierConfig.parser = 'less';
                    break;
                case 'sass':
                case 'scss':
                    FileFs.prettierConfig.parser = 'scss';
                    break;
                case 'md':
                    FileFs.prettierConfig.parser = 'markdown';
                    break;
                case 'sql':
                    FileFs.prettierConfig.parser = 'sql';
                    break;
                default:
                    FileFs.prettierConfig.parser = 'babel';
            }
            formatted = prettier.format(content, FileFs.prettierConfig);
        } catch (ex) {
            const warnMsg = `Potential Code issue found in ${this.normalizePath([
                ...directory,
                filename + '.' + filetype,
            ])}`;
            Util.logger.debug(warnMsg);

            // save prettier errror into log file
            // Note: we have to filter color codes from prettier's error message before saving it to file
            this.writeToFile(
                directory,
                filename + '.error',
                'log',
                `Error Log\nParser: ${FileFs.prettierConfig.parser}\n${ex.message.replace(
                    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,

                    ''
                )}`
            );

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
     * @param {boolean} sync should execute sync (default is async)
     * @param {boolean} cleanPath should execute sync (default is true)
     * @returns {Promise | object} Promise or JSON object depending on if async or not
     */
    readJSONFile: function (directory, filename, sync, cleanPath) {
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
                json = sync
                    ? fs.readJsonSync(path.join(directory, filename + '.json'))
                    : fs.readJson(path.join(directory, filename + '.json'));
            } catch (ex) {
                // Note: this only works for sync, not async
                Util.logger.debug(ex.stack);
                throw new Error(`${ex.code}: ${ex.message}`);
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
     * @param {string} [encoding='utf8'] read file with encoding (defaults to utf-8)
     * @returns {Promise.<string>} file contents
     */
    readFile: function (directory, filename, filetype, encoding) {
        try {
            directory = this.filterIllegalPathChars(this.normalizePath(directory));
            filename = this.filterIllegalFilenames(filename);
            return fs.readFile(path.join(directory, filename + '.' + filetype), encoding || 'utf8');
        } catch (ex) {
            Util.logger.error('File.readFile:: error | ' + ex.message);
        }
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
                if (includeStem) {
                    return [directory];
                } else {
                    // remove base directory and leading slahes and backslashes
                    return [
                        directory.substring(_stemLength).replace(/^\\+/, '').replace(/^\/+/, ''),
                    ];
                }
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
     *
     * @example ['deploy/mcdev/bu1']
     * @param {string} directory directory to checkin
     * @param {number} [depth] how many levels to check (1 base)
     * @param {boolean} [includeStem] include the parent directory in the response
     * @param {number} [_stemLength] set recursively for subfolders. do not set manually!
     * @returns {string[]} array of fully defined file paths
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
                const currentPath = directory.substring(_stemLength).replace(path.sep, '');
                children.push(currentPath ? currentPath : '.');
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
                    children.push(...nestedChildren);
                }
            }
            return children;
        } catch (ex) {
            Util.logger.error('File.readDirectoriesSync:: error | ' + ex.message);
            Util.logger.debug(ex.stack);
        }
    },
    /**
     * loads central properties from config file
     *
     * @param {boolean} [silent] omit throwing errors and print messages; assuming not silent if not set
     * @returns {object} central properties object
     */
    loadConfigFile(silent) {
        let properties;
        if (fs.pathExistsSync(Util.configFileName)) {
            try {
                properties = fs.readJsonSync(Util.configFileName);
            } catch (ex) {
                Util.logger.error(`${ex.code}: ${ex.message}`);
                return;
            }
            if (fs.pathExistsSync(Util.authFileName)) {
                let auth;
                try {
                    auth = fs.readJsonSync(Util.authFileName);
                } catch (ex) {
                    Util.logger.error(`${ex.code}: ${ex.message}`);
                    return;
                }

                if (!auth) {
                    const err = `${Util.authFileName} is not set up correctly.`;
                    Util.logger.error(err);
                    throw new Error(err);
                }
                for (const cred in properties.credentials) {
                    if (auth[cred]) {
                        if (properties.credentials[cred].eid !== auth[cred].account_id && !silent) {
                            const err = `'${cred}' found in ${
                                Util.configFileName
                            } (${typeof properties.credentials[cred].eid} ${
                                properties.credentials[cred].eid
                            }) and ${Util.authFileName} (${typeof auth[cred].account_id} ${
                                auth[cred].account_id
                            }) have a Enterprise ID mismatch. Please check.`;
                            Util.logger.error(err);
                            throw new Error(err);
                        }
                        // TODO add auth checks #294
                    } else if (!silent) {
                        Util.logger.warn(
                            `'${cred}' found in ${Util.configFileName} but not in ${Util.authFileName}. Please run 'mcdev init' to provide the missing credential details.`
                        );
                    }
                }
            } else if (!silent) {
                Util.logger.warn(
                    `${Util.authFileName} not found. Please run 'mcdev init' to provide the missing credential details.`
                );
            }
        }
        return properties;
    },
    /**
     * helper that splits the config back into auth & config parts to save them separately
     *
     * @param {object} properties central properties object
     * @returns {Promise.<void>} -
     */
    async saveConfigFile(properties) {
        // we want to save to save the full version here to allow us to upgrade configs properly in the future
        properties.version = packageJson.version;

        await this.writeJSONToFile('', Util.configFileName.split('.json')[0], properties);
        Util.logger.info(`✔️  ${Util.configFileName} and ${Util.authFileName} saved successfully`);
    },
    /**
     * Initalises Prettier formatting lib async.
     *
     * @param {string} [filetype='html'] filetype ie. JSON or SSJS
     * @returns {Promise.<boolean>} success of config load
     */
    async initPrettier(filetype) {
        if (FileFs.prettierConfig === null) {
            filetype = filetype || 'html';
            try {
                // pass in project dir with fake index.html to avoid "no parser" error
                // by using process.cwd we are limiting ourselves to a config in the project root
                // note: overrides will be ignored unless they are for *.html if hand in an html file here. This method includes the overrides corresponding to the file we pass in
                FileFs.prettierConfig = await prettier.resolveConfig(
                    path.join(process.cwd(), 'index.' + filetype)
                );
                if (FileFs.prettierConfig === null) {
                    // set to false to avoid re-running this after an initial failure
                    throw new Error(
                        `No .prettierrc found in your project directory. Please run 'mcdev upgrade' to create it`
                    );
                }

                return true;
            } catch (ex) {
                FileFs.prettierConfig = false;
                Util.logger.error('Cannot apply auto-formatting to your code:' + ex.message);
                return false;
            }
        } else {
            return false;
        }
    },
};
const FileFs = { ...fs, ...File };
FileFs.prettierConfig = null;

module.exports = FileFs;
