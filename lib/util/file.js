/* eslint-disable no-control-regex */
'use strict';

const fs = require('fs-extra');
const packageJson = require('../../package.json');
const path = require('path');
const prettier = require('prettier');
const Util = require('./util');
const sql = require('sql-formatter-plus');
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
        if (!fs.existsSync(directory)) {
            fs.mkdirpSync(directory);
        }
        try {
            await fs.writeJSON(path.join(directory, filename + '.json'), content, { spaces: 4 });
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
     * @returns {Promise<boolean>} Promise
     */
    writePrettyToFile: async function (directory, filename, filetype, content, templateVariables) {
        let formatted;
        if (filetype === 'sql') {
            formatted = this._beautify_sql(content);
        } else {
            // we need to ensure formatted is a String, not a Promise
            formatted = await this._beautify_prettier(directory, filename, filetype, content);
        }
        if (templateVariables) {
            formatted = Util.replaceByObject(formatted, templateVariables);
        }

        return this.writeToFile(directory, filename, filetype, formatted);
    },
    /**
     * helper for writePrettyToFile, applying sql formatting onto given stringified content
     *
     * @param {string} content filecontent
     * @returns {string} original string on error; formatted string on success
     */
    _beautify_sql: function (content) {
        let formatted;
        try {
            formatted = sql.format(content, {
                language: 'sql', // Defaults to "sql"
                indent: '    ', // Defaults to two spaces,W
                uppercase: true, // Defaults to false
                linesBetweenQueries: 1, // Defaults to 1
            });
            // if templating variables were in the code, those now have extra spaces
            formatted = formatted.split('{ { { ').join('{{{').split(' } } }').join('}}}');
        } catch (ex) {
            Util.logger.debug('SQL Formatter Exception: ' + ex.message);
            formatted = content;
        }
        return formatted;
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
     * @returns {Promise<boolean>} Promise
     */
    writeToFile: async function (directory, filename, filetype, content, encoding) {
        directory = this.filterIllegalPathChars(this.normalizePath(directory));
        if (!fs.existsSync(directory)) {
            fs.mkdirpSync(directory);
        }
        // filter characters that are illegal for file names in Windows
        filename = this.filterIllegalFilenames(filename);
        const filePath = path.join(directory, filename + '.' + filetype);
        try {
            if (fs.existsSync(filePath)) {
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
     * @returns {Promise<string>} file contents
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
     * @returns {Promise<string[]>} array of fully defined file paths
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
                    fs.existsSync(direntPath) &&
                    fs.lstatSync(direntPath).isDirectory() &&
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
        if (fs.existsSync(Util.configFileName)) {
            // properties = JSON.parse(fs.readFileSync(Util.configFileName, 'utf8'));
            try {
                properties = fs.readJsonSync(Util.configFileName);
            } catch (ex) {
                Util.logger.error(`${ex.code}: ${ex.message}`);
                return;
            }
            if (fs.existsSync(Util.authFileName)) {
                let auth;
                try {
                    auth = fs.readJsonSync(Util.authFileName);
                } catch (ex) {
                    Util.logger.error(`${ex.code}: ${ex.message}`);
                    return;
                }

                if (!auth.credentials) {
                    const err = `${Util.authFileName} is not set up correctly.`;
                    Util.logger.error(err);
                    throw new Error(err);
                }
                for (const cred in properties.credentials) {
                    const configset = properties.credentials[cred];
                    const authset = auth.credentials[cred];
                    if (authset) {
                        if (configset.eid === authset.eid) {
                            for (const key in authset) {
                                configset[key] = authset[key];
                            }
                        } else if (!silent) {
                            const err = `'${cred}' found in ${Util.configFileName} and ${Util.authFileName} have a Enterprise ID mismatch. Please check.`;
                            Util.logger.error(err);
                            throw new Error(err);
                        }
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
     * @returns {Promise<void>} -
     */
    async saveConfigFile(properties) {
        const auth = { credentials: {} };
        const config = properties;
        for (const cred in config.credentials) {
            auth.credentials[cred] = {};
            // copy id+secret+tenant to auth file
            auth.credentials[cred].clientId = config.credentials[cred].clientId;
            auth.credentials[cred].clientSecret = config.credentials[cred].clientSecret;
            auth.credentials[cred].tenant = config.credentials[cred].tenant;
            // copy eid as well to make sure we can test for equality when merging the files during runtime
            auth.credentials[cred].eid = config.credentials[cred].eid;
            // delete id+secret from config file
            delete config.credentials[cred].clientId;
            delete config.credentials[cred].clientSecret;
            delete config.credentials[cred].tenant;
        }
        // we want to save to save the full version here to allow us to upgrade configs properly in the future
        config.version = packageJson.version;

        await this.writeJSONToFile('', Util.configFileName.split('.json')[0], config);
        await this.writeJSONToFile('', Util.authFileName.split('.json')[0], auth);
        Util.logger.info(`✔️  ${Util.configFileName} and ${Util.authFileName} saved successfully`);
    },
    /**
     * Initalises Prettier formatting lib async.
     *
     * @param {string} [filetype='html'] filetype ie. JSON or SSJS
     * @returns {Promise<boolean>} success of config load
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
