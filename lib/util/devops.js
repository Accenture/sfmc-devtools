const File = require('./file');
const path = require('path');
const inquirer = require('inquirer');
const Util = require('./util');
const git = require('simple-git')();
const MetadataType = require('../MetadataTypeInfo');
const jsonToTable = require('json-to-table');
/**
 * DevOps helper class
 */

const DevOps = {
    /**
     * Extracts the delta between a commit and the current state for deployment.
     * Interactive commit selection if no commits are passed.
     * @param {Object} properties central properties object
     * @param {String} [range] git commit range
     * @param {boolean} [saveToDeployDir] if true, copy metadata changes into deploy directory
     * @param {String} [filterPaths] filter file paths that start with any specified path (comma separated)
     * @returns {Promise<Object[]>} -
     */
    async createDeltaPkg(properties, range, saveToDeployDir, filterPaths) {
        const rangeUserInput = range;
        Util.logger.info('Create Delta Package ::');
        if (filterPaths) {
            filterPaths = filterPaths.split(',').map((filePath) =>
                path
                    .normalize(properties.directories.retrieve + filePath)
                    .split('\\')
                    .join('/')
            );
        } else {
            filterPaths = [properties.directories.retrieve];
        }
        if (range) {
            if (!range.includes('..')) {
                // we limit the user here somewhat by always comparing to current branch if no range was given
                // this should make it easier in most scenrios though
                range = range + '..HEAD';
            }
            Util.logger.info(
                `Analyzing changes in directories: ${filterPaths} based on commit range: ${range}`
            );
        } else {
            // get the last 10 commits by default to choose from. Default can be changed in mcdev config.
            // Current commit is skipped due to no changes
            const commits = await git.log([
                '--skip=1',
                `-${properties.options.deployment.commitHistory || 10}`,
            ]);
            const display = commits.all.map((commit) => ({
                name: commit.date + ' / ' + commit.message + ' / ' + commit.author_name,
                value: commit.hash,
            }));
            display.push(new inquirer.Separator(' ==== '));

            const questions = [
                {
                    type: 'list',
                    message: 'Select base commit for comparison with current commit',
                    name: 'commit',
                    pageSize: 10,
                    choices: display,
                },
            ];
            const responses = await new Promise((resolve) => {
                inquirer.prompt(questions).then((answers) => {
                    resolve(answers);
                });
            });
            range = `${responses.commit}..HEAD`;
        }

        const metadata = {};
        // TODO: add filter based on if metadata type is deployable or not
        const gitActionsCounter = {
            delete: 0,
            'add/update': 0,
            move: 0,
        };
        const delta = (await git.diffSummary([range])).files
            // populate additional info for all changed files
            .map((file) => {
                // If file was moved it's path needs to be parsed
                file.moved = file.file.includes('=>');
                if (file.moved) {
                    const p = file.file;
                    const paths = {
                        base: p.substring(0, p.indexOf('{')),
                        before: p.substring(p.indexOf('{') + 1, p.indexOf('=>') - 1),
                        after: p.substring(p.indexOf('=>') + 3, p.indexOf('}')),
                        end: p.substring(p.indexOf('}') + 1),
                    };
                    file.fromPath = path
                        .normalize(`${paths.base}${paths.before}${paths.end}`)
                        .split('\\')
                        .join('/');
                    file.file = path
                        .normalize(`${paths.base}${paths.after}${paths.end}`)
                        .split('\\')
                        .join('/');
                } else {
                    file.fromPath = '-';
                    file.file = path.normalize(file.file).split('\\').join('/');
                }

                // get metadata type from file name
                file.type = path.basename(file.file).split('.')[1].split('-').shift();

                return file;
            })
            // Filter to only handle files that start with at least one of the passed filterPaths.
            // ! Filter happens after initial parse, because if file was moved its new path has to be calculated
            .filter((file) => filterPaths.some((path) => file.file.startsWith(path)))
            // ensure badly named files on unsupported metadata types are not in our subset
            .filter((file) => {
                if (!MetadataType[file.type]) {
                    Util.logger.debug(
                        `Unknown metadata-type found for (${file.file}): ` + file.type
                    );
                    return false;
                } else {
                    return true;
                }
            })
            .map((file) => {
                // Gets external key based on file name und the assumption that filename = externalKey
                if (file.type === 'folder') {
                    file.externalKey = null;
                    file.name = path.basename(file.file).split('.').shift();
                } else {
                    file.externalKey = path.basename(file.file).split('.').shift();
                    file.name = null;
                }

                // Check if file doesn't exist in reported path, that means it was a git deletion
                // TODO: improve git action detection by switching from diffSummary to diff with --summary result parsing
                if (!File.existsSync(file.file)) {
                    file.gitAction = 'delete';
                } else if (file.moved) {
                    file.gitAction = 'move';
                } else {
                    file.gitAction = 'add/update';
                }
                gitActionsCounter[file.gitAction]++;
                file._credential = file.file.split('/')[1];
                file._businessUnit = file.file.split('/')[2];

                // Parse retrieve directory to also populate the name field (not possible for deleted files)
                if (file.gitAction !== 'delete' && file.type !== 'folder') {
                    // folders are saved with their name as file-name, not with their key, hence this section can be skipped for folders
                    const buPath = `${properties.directories.retrieve}/${file._credential}/${file._businessUnit}/`;
                    if (!metadata[file._credential]) {
                        metadata[file._credential] = {};
                    }
                    if (!metadata[file._credential][file._businessUnit]) {
                        metadata[file._credential][file._businessUnit] = {};
                    }
                    if (!metadata[file._credential][file._businessUnit][file.type]) {
                        try {
                            MetadataType[file.type].readBUMetadataForType(
                                buPath,
                                false,
                                metadata[file._credential][file._businessUnit]
                            );
                        } catch (ex) {
                            // silently catch directory-not-found errors here
                            Util.logger.debug(ex.message);
                        }
                    }
                    const fileContent =
                        metadata[file._credential][file._businessUnit][file.type][file.externalKey];
                    if (fileContent) {
                        file.name = fileContent[MetadataType[file.type].definition.nameField];
                    }
                }
                return file;
            });
        if (
            !gitActionsCounter['add/update'] &&
            !gitActionsCounter.move &&
            !gitActionsCounter.delete
        ) {
            Util.logger.warn(
                `- ❌  No changes found. Check what branch you are currently on and if the target branch name (${rangeUserInput}${
                    range !== rangeUserInput ? ' converted to ' + range : ''
                }) was correct`
            );
            return [];
        }
        // Write into delta.json to serve as documentation
        File.writeJSONToFile(properties.directories.deltaPackage, 'delta_package', delta);
        this.document(properties.directories.deltaPackage, delta);
        Util.logger.info(
            `- ✔️  Identified changes: Add/Update=${gitActionsCounter['add/update']}, Move=${gitActionsCounter['move']}, Delete=${gitActionsCounter['delete']}`
        );
        if (gitActionsCounter.delete > 0) {
            Util.logger.warn(
                'Please note that deletions have to be done manually on the SFMC website.'
            );
        }
        Util.logger.info(
            `Saved report in ${path.join(properties.directories.deltaPackage, 'delta_package.md')}`
        );

        // Copy filtered list of files into deploy directory
        if (saveToDeployDir) {
            const copied = delta.map((file) =>
                File.copyFile(
                    file.file,
                    file.file.replace(
                        path.normalize(properties.directories.retrieve),
                        path.normalize(properties.directories.deploy)
                    )
                )
            );
            const results = await Promise.all(copied);
            const failed = results.filter((result) => result.status === 'failed');
            const skipped = results.filter((result) => result.status === 'skipped');

            Util.logger.info(
                `Copied changes to deploy directory (${
                    results.length - skipped.length - failed.length
                } copied)`
            );
            Util.logger.debug(
                `Copied changes to deploy directory (${
                    results.length - skipped.length - failed.length
                } copied, ${skipped.length} skipped, ${failed.length} failed)`
            );
            if (skipped.length > 0) {
                skipped.forEach((file) =>
                    Util.logger.debug(`Skipped - ${file.statusMessage} - ${file.file}`)
                );
            }
            if (failed.length > 0) {
                failed.forEach((file) =>
                    Util.logger.error(`Failed - ${file.statusMessage} - ${file.file}`)
                );
            }
        }
        return delta;
    },
    /**
     * create markdown file for deployment listing
     * @param {String} directory -
     * @param {Object} jsonReport -
     * @returns {void}
     */
    document(directory, jsonReport) {
        const tabled = jsonToTable(jsonReport);
        let output = `# Deployment Report\n\n`;
        let tableSeparator = '';
        tabled[0].forEach((column) => {
            if (column !== '') {
                output += `| ${column} `;
                tableSeparator += '| --- ';
            }
        });
        output += `|\n${tableSeparator}|\n`;
        for (let i = 1; i < tabled.length; i++) {
            tabled[i].forEach((field) => {
                if (field !== '') {
                    field = field === true ? '✓' : field === false ? '✗' : field;
                    output += `| ${field} `;
                }
            });
            output += '|\n';
        }
        try {
            // write to disk (asynchronously)
            File.writeToFile(directory, 'delta_package', 'md', output);
        } catch (ex) {
            Util.logger.error(`DevOps.document():: error | ` + ex.message);
        }
    },
};

module.exports = DevOps;
