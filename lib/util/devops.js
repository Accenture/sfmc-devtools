import File from './file.js';
import path from 'node:path';
import { select, confirm, Separator } from '@inquirer/prompts';
import { Util } from './util.js';
import Cli from './cli.js';
import { simpleGit } from 'simple-git';
const git = simpleGit();
import mcdev from '../index.js';
import Builder from '../Builder.js';
import MetadataType from '../MetadataTypeInfo.js';
import jsonToTable from 'json-to-table';
import pLimit from 'p-limit';
import cliProgress from 'cli-progress';

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

/**
 * DevOps helper class
 */
const DevOps = {
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
    async getDeltaList(properties, range, saveToDeployDir, filterPathsCSV, commitHistory) {
        const rangeUserInput = range;
        const filterPaths = filterPathsCSV
            ? filterPathsCSV.split(',').map((filePath) =>
                  path
                      .normalize(properties.directories.retrieve + filePath)
                      .split('\\')
                      .join('/')
              )
            : [properties.directories.retrieve];
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
                `-${commitHistory || properties.options.deployment.commitHistory || 10}`,
            ]);
            /** @type {({value: string, name?: string, description?: string, disabled?: boolean | string} | Separator)[]} */
            const choices = commits.all.map((commit) => ({
                name:
                    commit.date.split('T').join(' ').split('+')[0] +
                    ' / ' +
                    commit.message +
                    ' / ' +
                    commit.author_name,
                value: commit.hash,
            }));
            choices.push(new Separator(' ==== '));

            const baseCommit = await select({
                message: 'Select base commit for comparison with current commit',
                pageSize: 10,
                choices: choices,
            });
            range = `${baseCommit}..HEAD`;
        }

        const metadata = {};
        // TODO: add filter based on if metadata type is deployable or not
        const gitActionsCounter = {
            delete: 0,
            'add/update': 0,
            move: 0,
        };
        const diffSummary = await git.diffSummary([range]);
        Util.logger.info(`Found ${diffSummary.files.length} changed files in the commit range`);
        /**
         * @type {DeltaPkgItem[]}
         */
        // first, process everything that can be done synchronously here
        const deltaSync = diffSummary.files
            // populate additional info for all changed files
            .map((/** @type {DeltaPkgItem} */ file) => {
                // If file was moved it's path needs to be parsed
                file.moved = file.file.includes('=>');
                if (file.moved) {
                    const p = file.file;
                    // TODO: rewrite remaining substring() to slice()
                    const paths = {
                        base: p.slice(0, Math.max(0, p.indexOf('{'))),
                        before: p.substring(p.indexOf('{') + 1, p.indexOf('=>') - 1), // eslint-disable-line unicorn/prefer-string-slice
                        after: p.substring(p.indexOf('=>') + 3, p.indexOf('}')), // eslint-disable-line unicorn/prefer-string-slice
                        end: p.slice(Math.max(0, p.indexOf('}') + 1)),
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
                file.type = file.file.split('/')[3];

                return file;
            })
            // Filter to only handle files that start with at least one of the passed filterPaths.
            // ! Filter happens after initial parse, because if file was moved its new path has to be calculated
            .filter((file) => filterPaths.some((path) => file.file.startsWith(path)))
            .filter((file) => !file.file.endsWith('.error.log'))
            .filter((file) => !file.file.endsWith('.md'))
            // ensure badly named files on unsupported metadata types are not in our subset
            .filter((/** @type {DeltaPkgItem} */ file) => {
                if (MetadataType[file.type]) {
                    return true;
                } else {
                    Util.logger.debug(
                        `Unknown metadata-type found for (${file.file}): ` + file.type
                    );
                    return false;
                }
            });

        Util.logger.info(
            `Identified ${deltaSync.length} relevant file changes after filtering file types and folders. Processing related metadata now.`
        );
        // second, we need to do asynchronous file operations

        const extendedBar = new cliProgress.SingleBar(
            {
                format: '                 Processing changes [{bar}] {percentage}% | {value}/{total}',
            },
            cliProgress.Presets.shades_classic
        );
        extendedBar.start(deltaSync.length, 0);
        const rateLimit = pLimit(10);

        /**
         * @type {DeltaPkgItem[]}
         */
        const delta = await Promise.all(
            deltaSync.map((/** @type {DeltaPkgItem} */ file) =>
                rateLimit(async () => {
                    // Gets external key based on file name und the assumption that filename = externalKey
                    if (file.type === 'folder') {
                        file.externalKey = null;
                        file.name = path.basename(file.file).split('.').shift();
                    } else {
                        // find the key in paths like:
                        // - retrieve/cred/bu/asset/block/016aecc7-7063-4b78-93f4-aa119ea933c7.asset-block-meta.html
                        // - retrieve/cred/bu/asset/message/003c1ef5-f538-473a-91da-26942024a64a/blocks/views.html.slots.[bottom-8frq7iw2k99].asset-message-meta.html
                        // - retrieve/cred/bu/query/03efd5f1-ba1f-487a-9c9a-36aeb2ae5192.query-meta.sql
                        file.externalKey =
                            file.type === 'asset'
                                ? file.file.split('/')[5].split('.')[0] // assets have an additional folder level for their subtype
                                : file.file.split('/')[4].split('.')[0];
                        file.name = null;
                    }

                    // Check if file doesn't exist in reported path, that means it was a git deletion
                    // TODO: improve git action detection by switching from diffSummary to diff with --summary result parsing
                    if (!(await File.pathExists(file.file))) {
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
                                await MetadataType[file.type].readBUMetadataForType(
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
                            metadata[file._credential][file._businessUnit][file.type][
                                file.externalKey
                            ];
                        if (fileContent) {
                            file.name = fileContent[MetadataType[file.type].definition.nameField];
                        }
                    }
                    extendedBar.increment();
                    return file;
                })
            )
        );
        // stop the progress bar
        extendedBar.stop();

        if (
            !gitActionsCounter['add/update'] &&
            !gitActionsCounter.move &&
            !gitActionsCounter.delete
        ) {
            Util.logger.warn(
                `- ❌  No changes found. Check what branch you are currently on and if the target branch name (${rangeUserInput}${
                    range === rangeUserInput ? '' : ' converted to ' + range
                }) was correct`
            );
            return [];
        }
        // Write into delta.json to serve as documentation
        const directoryDeltaPkg = File.normalizePath([
            properties.directories.docs,
            'deltaPackage/',
        ]);
        await File.writeJSONToFile(directoryDeltaPkg, 'delta_package', delta);
        this.document(directoryDeltaPkg, delta);
        Util.logger.info(
            `- ✔️  Identified changes: Add/Update=${gitActionsCounter['add/update']}, Move=${gitActionsCounter['move']}, Delete=${gitActionsCounter['delete']}`
        );
        if (gitActionsCounter.delete > 0) {
            Util.logger.warn(
                'Please note that deletions have to be done manually on the SFMC website.'
            );
        }
        Util.logger.info(`Saved report in ${path.join(directoryDeltaPkg, 'delta_package.md')}`);

        // Copy filtered list of files into deploy directory
        // only do that if we do not use templating
        if (saveToDeployDir) {
            // if templating is not used, we need to add related files to the delta package
            const typeKeysMap = {};
            /** @type {Object.<string, BuObject>} */
            const buObjects = {};
            for (const file of delta) {
                if (file.gitAction === 'delete' || file.type === 'folder') {
                    continue;
                }
                if (typeKeysMap[file.type]) {
                    typeKeysMap[file.type].push(file.externalKey);
                } else {
                    typeKeysMap[file.type] = [file.externalKey];
                }
                if (!buObjects[`${file._credential}/${file._businessUnit}`]) {
                    buObjects[`${file._credential}/${file._businessUnit}`] =
                        await Cli.getCredentialObject(
                            properties,
                            `${file._credential}/${file._businessUnit}`
                        );
                }
            }
            // a bit crude but works for now
            for (const buObject of Object.values(buObjects)) {
                for (const type in typeKeysMap) {
                    MetadataType[type].buObject = buObject;
                    MetadataType[type].properties = properties;
                    const additionalFiles = await MetadataType[type].getFilesToCommit(
                        typeKeysMap[type]
                    );
                    if (additionalFiles?.length) {
                        delta.push(
                            ...additionalFiles
                                .map((filePath) => ({
                                    file: path.normalize(filePath).split('\\').join('/'),
                                    type,
                                    gitAction: 'add/update',
                                }))
                                .filter(
                                    // avoid adding files that we already have in the list
                                    (addFile) =>
                                        !delta.find((existFile) => existFile.file === addFile.file)
                                )
                        );
                    }
                }
            }

            let isPurgeDeployFolder;
            if (!Util.skipInteraction) {
                // deploy folder is in targets for definition creation
                // recommend to purge their content first
                isPurgeDeployFolder = await confirm({
                    message:
                        'Do you want to empty the deploy folder (ensures no files from previous deployments remain)?',
                    default: true,
                });
            }
            if (Util.skipInteraction || isPurgeDeployFolder) {
                // Clear output folder structure for selected sub-type
                for (const buObject of Object.values(buObjects)) {
                    await File.remove(
                        File.normalizePath([
                            properties.directories.deploy,
                            buObject.credential,
                            buObject.businessUnit,
                        ])
                    );
                }
            }

            /** @type {Promise.<{status:'ok'|'skipped'|'failed', statusMessage:string, file:string}>[]} */
            const copied = delta
                .filter((file) => !file.file.endsWith('.md')) // filter documentation files
                .map((file) =>
                    File.copyFileSimple(
                        file.file,
                        path
                            .normalize(file.file)
                            .replace(
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
                for (const file of skipped) {
                    Util.logger.debug(`Skipped - ${file.statusMessage} - ${file.file}`);
                }
            }
            if (failed.length > 0) {
                for (const file of failed) {
                    Util.logger.error(`Failed - ${file.statusMessage} - ${file.file}`);
                }
            }
        }
        return delta;
    },

    /**
     * wrapper around DevOps.getDeltaList, Builder.buildTemplate and M
     *
     * @param {Mcdevrc} properties project config file
     * @param {string} range git commit range
     * @param {DeltaPkgItem[]} [diffArr] instead of running git diff the method can also get a list of files to process
     * @param {number} [commitHistory] cli option to override default commit history value in config
     * @returns {Promise.<DeltaPkgItem[]>} -
     */
    async buildDeltaDefinitions(properties, range, diffArr, commitHistory) {
        // check if sourceTargetMapping is valid
        let sourceTargetMapping;
        if (properties.options.deployment.branchSourceTargetMapping?.[range]) {
            Util.logger.info(Util.getGrayMsg('Using branch specific sourceTargetMapping'));
            sourceTargetMapping = properties.options.deployment.branchSourceTargetMapping[range];
        } else if (
            properties.options.deployment.sourceTargetMapping &&
            Object.keys(properties.options.deployment.sourceTargetMapping).length
        ) {
            Util.logger.info(Util.getGrayMsg('Using generic sourceTargetMapping'));
            sourceTargetMapping = properties.options.deployment.sourceTargetMapping;
        } else {
            Util.logger.error('Bad configuration of options.deployment.sourceTargetMapping');
            return;
        }
        const sourceMarketListArr = Object.keys(sourceTargetMapping);
        /** @type {DeltaPkgItem[]} */
        const deltaDeployAll = [];
        for (const sourceML of sourceMarketListArr) {
            // check if sourceTargetMapping has valid values
            // #1 check source marketlist
            try {
                Util.verifyMarketList(sourceML, properties);
                // remove potentially existing "description"-entry
                delete properties.marketList[sourceML].description;

                const sourceMarketBuArr = Object.keys(properties.marketList[sourceML]);
                if (sourceMarketBuArr.length !== 1) {
                    throw new Error('Only 1 BU is allowed per source marketList');
                }
                if ('string' !== typeof properties.marketList[sourceML][sourceMarketBuArr[0]]) {
                    throw new TypeError('Only 1 market per BU is allowed per source marketList');
                }
            } catch (ex) {
                Util.logger.error('Deployment Source: ' + ex.message);
                return;
            }
            // #2 check corresponding target marketList
            let targetML;
            try {
                targetML = sourceTargetMapping[sourceML];
                if ('string' !== typeof targetML) {
                    throw new TypeError(
                        'Please define one target marketList per source in deployment.sourceTargetMapping (No arrays allowed)'
                    );
                }
                Util.verifyMarketList(targetML, properties);
                // remove potentially existing "description"-entry
                delete properties.marketList[targetML].description;
            } catch (ex) {
                Util.logger.error('Deployment Target: ' + ex.message);
            }
        }
        if (Util.OPTIONS.purge === true && sourceMarketListArr.length > 1) {
            // if --purge was defined and there is more than one source-target mapping, execute the purge up front to avoid deleting the package that was created by a prior mapping in this same run
            for (const sourceMlName of sourceMarketListArr) {
                /** @type {string} */
                Builder.purgeDeployFolderList(sourceTargetMapping[sourceMlName]);
            }
            Util.OPTIONS.purge = false;
        }

        // all good let's loop a second time for actual execution
        for (const sourceMlName of sourceMarketListArr) {
            /** @type {string} */
            const targetMlName = sourceTargetMapping[sourceMlName];
            /** @type {string} */
            const sourceBU = Object.keys(properties.marketList[sourceMlName])[0];
            /** @type {string} */
            const sourceMarket = Object.values(properties.marketList[sourceMlName])[0];
            if ('string' !== typeof sourceMarket) {
                Util.logger.error(
                    'Deployment Source market list needs to have a 1:1 BU-Market combo. Your value: ' +
                        sourceMarket
                );
                return;
            }

            const delta = Array.isArray(diffArr)
                ? diffArr
                : await DevOps.getDeltaList(properties, range, false, sourceBU, commitHistory);
            // If only chaing templating and buildDefinition if required
            if (!delta || delta.length === 0) {
                // info/error messages was printed by DevOps.createDeltaPkg() already
                return;
            }
            Util.logger.info('=============');

            // Put files into maps. One map with BU -> type -> file (for retrieveAsTemplate)
            // Other map only with type -> file (for buildDefinitionBulk)
            const buTypeDelta = {}; // for bt, with BU info
            const deltaDeploy = delta
                // Only template/build files that were added/updated/moved. no deletions
                // ! doesn't work for folder, because their name parsing doesnt work at the moment
                .filter((file) => file.gitAction !== 'delete' && file.name);
            deltaDeployAll.push(...deltaDeploy);
            for (const file of deltaDeploy) {
                const buFrom = `${file._credential}/${file._businessUnit}`;
                if (!buTypeDelta[buFrom]) {
                    // init object
                    /** @type {TypeKeyCombo} */
                    buTypeDelta[buFrom] = {};
                }
                if (!buTypeDelta[buFrom][file.type]) {
                    // init array
                    buTypeDelta[buFrom][file.type] = [];
                }
                if (!buTypeDelta[buFrom][file.type].includes(file.externalKey)) {
                    buTypeDelta[buFrom][file.type].push(file.externalKey);
                }
            }
            for (const buFrom in buTypeDelta) {
                // Run buildTemplate for each business unit for each type
                await mcdev.build(
                    buFrom,
                    undefined,
                    buTypeDelta[buFrom],
                    [sourceMarket],
                    [targetMlName],
                    true
                );
            }
        }
        if (!deltaDeployAll.length) {
            Util.logger.error(
                '- ❌ No Templates or Deploy Definitions created. Check if you expected no changes.'
            );
        }
        return deltaDeployAll;
    },

    /**
     * create markdown file for deployment listing
     *
     * @param {string} directory -
     * @param {object} jsonReport -
     * @returns {void}
     */
    document(directory, jsonReport) {
        const tabled = jsonToTable(jsonReport);
        let output = `# Deployment Report\n\n`;
        let tableSeparator = '';
        for (const column of tabled[0]) {
            if (column !== '') {
                output += `| ${column} `;
                tableSeparator += '| --- ';
            }
        }
        output += `|\n${tableSeparator}|\n`;
        for (let i = 1; i < tabled.length; i++) {
            for (let field of tabled[i]) {
                if (field !== '') {
                    field = field === true ? '✓' : field === false ? '✗' : field;
                    output += `| ${field} `;
                }
            }
            output += '|\n';
        }
        try {
            // write to disk (asynchronously)
            File.writeToFile(directory, 'delta_package', 'md', output);
        } catch (ex) {
            Util.logger.error(`DevOps.document():: error | ` + ex.message);
        }
    },

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
    getFilesToCommit(properties, buObject, metadataType, keyArr) {
        MetadataType[metadataType].properties = properties;
        MetadataType[metadataType].buObject = buObject;
        return MetadataType[metadataType].getFilesToCommit(keyArr);
    },
};

export default DevOps;
