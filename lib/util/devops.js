import File from './file.js';
import path from 'node:path';
import { select, confirm, Separator } from '@inquirer/prompts';
import { Util } from './util.js';
import Cli from './cli.js';
import { simpleGit } from 'simple-git';
import mcdev from '../index.js';
import Builder from '../Builder.js';
import MetadataType from '../MetadataTypeInfo.js';
import jsonToTable from 'json-to-table';
import { analyzeDelta } from './deltaAnalysis.js';
import { preflightDelta } from './deltaPreflight.js';
import { createGitAssetTree } from './gitAssetTree.js';

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
 * @typedef {import('../../types/mcdev.d.js').BuildFilter} BuildFilter
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
        const prepared = await this._prepareDelta(properties, range, filterPathsCSV, commitHistory);
        return this._publishDelta(properties, prepared, saveToDeployDir, filterPathsCSV);
    },

    /**
     * Resolve source filters and verify selected inputs without producing output.
     *
     * @param {Mcdevrc} properties configuration
     * @param {string} range exact user comparison
     * @param {string} filterPathsCSV source filters
     * @param {number} commitHistory interactive history limit
     * @returns {Promise.<object>} analyzed delta and verified manifest
     */
    async _prepareDelta(properties, range, filterPathsCSV, commitHistory) {
        const git = simpleGit();
        const rangeUserInput = range;
        let filterPaths = filterPathsCSV
            ? filterPathsCSV
                  .split(',')
                  .map(
                      (filePath) =>
                          path
                              .normalize(path.join(properties.directories.retrieve, filePath))
                              .replaceAll('\\', '/') + '/'
                  )
            : [properties.directories.retrieve];
        if (range) {
            if (!range.includes('..')) {
                // we limit the user here somewhat by always comparing to current branch if no range was given
                // this should make it easier in most scenrios though
                range += '..HEAD';
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
                    commit.date.replaceAll('T', ' ').split('+', 1)[0] +
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

        const repositoryRoot = (await git.revparse(['--show-toplevel'])).trim();
        const retrieveRoot = path
            .relative(repositoryRoot, path.resolve(properties.directories.retrieve))
            .replaceAll('\\', '/');
        filterPaths = filterPaths.map(
            (filter) =>
                path.relative(repositoryRoot, path.resolve(filter)).replaceAll('\\', '/') + '/'
        );
        const sourceBUs = Object.entries(properties.credentials).flatMap(([credential, value]) =>
            Object.keys(value.businessUnits).map((bu) => `${credential}/${bu}`)
        );
        const access = createGitAssetTree(git);
        const analysis = await analyzeDelta({
            git,
            range,
            retrieveRoot,
            sourceBUs: sourceBUs.filter((bu) => {
                const buPath = `${retrieveRoot}/${bu}/`;
                return filterPaths.some(
                    (filter) => buPath.startsWith(filter) || filter.startsWith(buPath)
                );
            }),
            access,
        });
        // Apply explicit component filters before selecting owners and validating inputs.
        analysis.changes = analysis.changes.filter((change) =>
            filterPaths.some((filter) => change.record.file.startsWith(filter))
        );
        analysis.records = analysis.changes.map((change) => change.record);
        analysis.selectedOwners = analysis.selectedOwners.filter((selection) =>
            analysis.changes.some(
                (change) => change.destinationOwner?.path === selection.owner.path
            )
        );
        const manifest = await preflightDelta({ git, repositoryRoot, analysis, access });
        return { analysis, manifest, repositoryRoot, range, rangeUserInput };
    },

    /**
     * Publish an already verified delta and optionally copy its selected inputs.
     *
     * @param {Mcdevrc} properties configuration
     * @param {object} prepared read-only preparation result
     * @param {boolean} saveToDeployDir copy mode
     * @param {string} filterPathsCSV report suffix
     * @returns {Promise.<DeltaPkgItem[]>} public delta records
     */
    async _publishDelta(properties, prepared, saveToDeployDir, filterPathsCSV = '') {
        const { analysis, manifest, repositoryRoot, range, rangeUserInput } = prepared;
        const delta = [...analysis.records];
        const gitActionsCounter = { delete: 0, 'add/update': 0, move: 0 };
        for (const file of delta) {
            gitActionsCounter[file.gitAction]++;
        }
        if (analysis.skipped.length) {
            Util.logger.info(`Skipped ${analysis.skipped.length} structural asset migrations.`);
        }

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
        const directoryDeltaPkg = 'logs/';
        await File.writeJSONToFile(
            directoryDeltaPkg,
            Util.logFileName + '-delta_package-' + filterPathsCSV.replaceAll(/[,/]/g, '-'),
            delta
        );
        this.document(directoryDeltaPkg, filterPathsCSV, delta);
        Util.logger.info(
            `- ✔️  Identified changes: Add/Update=${gitActionsCounter['add/update']}, Move=${gitActionsCounter['move']}, Delete=${gitActionsCounter['delete']}`
        );
        if (gitActionsCounter.move > 0 || gitActionsCounter.delete > 0) {
            Util.logger.warn(
                'Deleted/Changed keys detected! Please note that re-keyed components should have their key changed as a pre-deployment step.'
            );
        }
        Util.logger.info(
            `Saved report in ./${directoryDeltaPkg}${Util.logFileName}-delta_package.md`
        );

        // const deletedTypeKeys = {};
        // for (const file of delta.filter((file) => file.gitAction === 'delete')) {
        //     if (deletedTypeKeys[file.type]) {
        //         deletedTypeKeys[file.type].add(file.externalKey);
        //     } else {
        //         deletedTypeKeys[file.type] = new Set([file.externalKey]);
        //     }
        // }
        // for (const deletedType in deletedTypeKeys) {
        //     const keyArr = [...deletedTypeKeys[deletedType]];
        //     Util.logger.warn(`Found deleted ${deletedType} keys: ${keyArr.join(', ')}`);
        // }

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
                    if (type === 'asset') {
                        continue;
                    }
                    MetadataType[type].buObject = buObject;
                    MetadataType[type].properties = properties;
                    const additionalFiles = await MetadataType[type].getFilesToCommit(
                        typeKeysMap[type]
                    );
                    if (additionalFiles?.length) {
                        delta.push(
                            ...additionalFiles
                                .map((filePath) => ({
                                    // Metadata helpers return project-relative paths, unlike Git.
                                    file: path
                                        .relative(repositoryRoot, path.resolve(filePath))
                                        .replaceAll('\\', '/'),
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

            for (const file of new Set([...manifest.values()].flat())) {
                const relative = path.relative(repositoryRoot, file).replaceAll('\\', '/');
                if (delta.every((record) => record.file !== relative)) {
                    delta.push({ file: relative, type: 'asset', gitAction: 'add/update' });
                }
            }

            const retrieveDirectory = path.resolve(properties.directories.retrieve);
            const deployDirectory = path.resolve(properties.directories.deploy);
            // Git records are repository-relative; verified manifest inputs are absolute.
            const copySources = new Set([
                ...delta
                    .filter((file) => file.type !== 'asset' && file.gitAction !== 'delete')
                    .map((file) => path.resolve(repositoryRoot, file.file)),
                ...[...manifest.values()].flat(),
            ]);
            const copyInputs = [...copySources]
                .filter((source) => !source.endsWith('.md'))
                .map((source) => {
                    const relative = path.relative(retrieveDirectory, source);
                    if (
                        relative === '..' ||
                        relative.startsWith('..' + path.sep) ||
                        path.isAbsolute(relative)
                    ) {
                        throw new Error(
                            `Delta copy source outside configured retrieve directory: ${source}`
                        );
                    }
                    return { source, destination: path.resolve(deployDirectory, relative) };
                });

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

            const copied = copyInputs.map(({ source, destination }) =>
                File.copyFileSimple(source, destination)
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
        // Explicit lists are caller-managed selections, not Git-backed packaging evidence.
        const explicitList = Array.isArray(diffArr);
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

                const sourceMarketBuArr = Object.keys(properties.marketList[sourceML]).filter(
                    (key) => key !== 'filter'
                );
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
                return;
            }
        }
        // Finish every source mapping before reports, cleanup, templates or delete instructions.
        const preparations = new Map();
        if (!explicitList) {
            for (const sourceML of sourceMarketListArr) {
                const sourceBU = Object.keys(properties.marketList[sourceML]).find(
                    (key) => key !== 'filter'
                );
                preparations.set(
                    sourceML,
                    await this._prepareDelta(properties, range, sourceBU, commitHistory)
                );
            }
        }
        // Resolve effective Git build keys once, after every mapping passed preflight.
        const effectiveSelections = new Map();
        for (const [sourceML, prepared] of preparations) {
            const byBU = {};
            for (const file of prepared.analysis.records) {
                if (
                    file.gitAction === 'delete' ||
                    !file.name ||
                    (Array.isArray(properties.metaDataTypes.createDeltaPkg) &&
                        !properties.metaDataTypes.createDeltaPkg.includes(file.type))
                ) {
                    continue;
                }
                const bu = `${file._credential}/${file._businessUnit}`;
                byBU[bu] ||= {};
                byBU[bu][file.type] ||= [];
                if (!byBU[bu][file.type].includes(file.externalKey)) {
                    byBU[bu][file.type].push(file.externalKey);
                }
            }
            for (const [bu, selection] of Object.entries(byBU)) {
                mcdev.applyKeyFilters(selection, properties.marketList[sourceML].filter);
                for (const type of Object.keys(selection)) {
                    if (!selection[type].length) {
                        delete selection[type];
                    }
                }
                if (!Object.keys(selection).length) {
                    delete byBU[bu];
                }
            }
            effectiveSelections.set(sourceML, byBU);
        }
        // Empty Git selections must not clear deploy output or consume the purge option.
        // Keep caller-managed lists on their existing mapping/reuse path.
        const actionableMappings = explicitList
            ? diffArr.length > 0
                ? sourceMarketListArr
                : []
            : sourceMarketListArr.filter(
                  (sourceML) => Object.keys(effectiveSelections.get(sourceML)).length > 0
              );
        if (
            Util.OPTIONS.purge === true &&
            sourceMarketListArr.length > 1 &&
            actionableMappings.length > 0
        ) {
            // if --purge was defined and there is more than one source-target mapping, execute the purge up front to avoid deleting the package that was created by a prior mapping in this same run
            for (const sourceMlName of actionableMappings) {
                /** @type {string} */
                await Builder.purgeDeployFolderList(sourceTargetMapping[sourceMlName]);
            }
            Util.OPTIONS.purge = false;
        }

        // all good let's loop a second time for actual execution
        for (const sourceMlName of sourceMarketListArr) {
            /** @type {string} */
            const targetMlName = sourceTargetMapping[sourceMlName];
            const sourceMarketLists = properties.marketList[sourceMlName];
            /** @type {string} */
            const sourceBU = Object.keys(sourceMarketLists).find((key) => key !== 'filter');
            // accept ["oneMarket"] or "oneMarket" for sourceMarket, but not ["oneMarket","secondMarket"] or []
            /** @type {string} */
            const sourceMarket =
                Array.isArray(sourceMarketLists[sourceBU]) &&
                sourceMarketLists[sourceBU].length === 1
                    ? sourceMarketLists[sourceBU][0]
                    : sourceMarketLists[sourceBU];
            if ('string' !== typeof sourceMarket) {
                Util.logger.error(
                    'Deployment Source market list needs to have a 1:1 BU-Market combo. Your value: ' +
                        sourceMarket
                );
                // skip this source-target mapping
                continue;
            }
            let delta;
            try {
                delta = explicitList
                    ? diffArr
                    : await this._publishDelta(
                          properties,
                          preparations.get(sourceMlName),
                          false,
                          sourceBU
                      );
            } catch (ex) {
                Util.logger.error(ex.message);
                return;
            }
            // If only chaing templating and buildDefinition if required
            if (!delta || delta.length === 0) {
                // skip this source-target mapping
                continue;
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
            const buildSelections = explicitList
                ? buTypeDelta
                : effectiveSelections.get(sourceMlName);
            for (const buFrom in buildSelections) {
                for (const type of Object.keys(buildSelections[buFrom])) {
                    if (
                        !Array.isArray(properties.metaDataTypes.createDeltaPkg) ||
                        properties.metaDataTypes.createDeltaPkg.includes(type)
                    ) {
                        continue;
                    }

                    Util.logger.warn(
                        `Skipping ${type} for build based on config.metaDataTypes.createDeltaPkg: ${buildSelections[buFrom][type].join(', ')}`
                    );
                    delete buildSelections[buFrom][type];
                }
                if (!explicitList && !Object.keys(buildSelections[buFrom]).length) {
                    continue;
                }
                // Pass only this BU's preflight-approved asset inputs to the template consumer.
                const prepared = preparations.get(sourceMlName);
                const verifiedAssetInputs = explicitList ? undefined : new Map();
                for (const change of prepared?.analysis.changes || []) {
                    if (
                        change.destinationOwner &&
                        `${change.record._credential}/${change.record._businessUnit}` === buFrom
                    ) {
                        verifiedAssetInputs.set(
                            change.record.externalKey,
                            prepared.manifest.get(change.destinationOwner.path)
                        );
                    }
                }
                // Run buildTemplate for each business unit for each type
                await mcdev.build(
                    buFrom,
                    undefined,
                    buildSelections[buFrom],
                    [sourceMarket],
                    [targetMlName],
                    true,
                    sourceMarketLists.filter,
                    verifiedAssetInputs
                );
            }
            // Explicit lists retain the legacy asset JSON deletion heuristic; Git lists
            // already classify logical owner deletion using committed endpoint evidence.
            const deleteDelta = explicitList
                ? delta.filter(
                      (file) =>
                          file.gitAction !== 'delete' ||
                          file.type !== 'asset' ||
                          file.file.endsWith('.json')
                  )
                : delta;
            this._generateDeleteInstructions(deleteDelta, sourceMarket, properties, targetMlName);
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
     * @param {string} filterPathsCSV -
     * @param {object} jsonReport -
     * @returns {void}
     */
    document(directory, filterPathsCSV, jsonReport) {
        const tabled = jsonToTable(jsonReport);
        let output = `# Deployment Report\n\n`;
        let tableSeparator = '';
        for (const column of tabled[0]) {
            if (column === '') {
                continue;
            }

            output += `| ${column} `;
            tableSeparator += '| --- ';
        }
        output += `|\n${tableSeparator}|\n`;
        for (let i = 1; i < tabled.length; i++) {
            for (let field of tabled[i]) {
                if (field === '') {
                    continue;
                }

                field = field === true ? '✓' : field === false ? '✗' : field;
                output += `| ${field} `;
            }
            output += '|\n';
        }
        try {
            // write to disk (asynchronously)
            File.writeToFile(
                directory,
                Util.logFileName + '-delta_package-' + filterPathsCSV.replaceAll(/[,/]/g, '-'),
                'md',
                output
            );
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
    /**
     * helper for {@link DevOps.buildDeltaDefinitions}
     *
     * @param {DeltaPkgItem[]} delta git delta
     * @param {string} sourceMarket market for the source BU
     * @param {Mcdevrc} properties mcdev config
     * @param {string} targetMlName marketList used to build for the target BU
     */
    _generateDeleteInstructions(delta, sourceMarket, properties, targetMlName) {
        // Analysis assigns delete only when the logical destination owner is absent.
        const deltaDelete = delta.filter((file) => file.gitAction === 'delete');
        const buTypeDeltaDelete = {}; // for bt, with BU info

        for (const file of deltaDelete) {
            const buFrom = `${file._credential}/${file._businessUnit}`;
            if (!buTypeDeltaDelete[buFrom]) {
                // init object
                /** @type {TypeKeyCombo} */
                buTypeDeltaDelete[buFrom] = {};
            }
            if (!buTypeDeltaDelete[buFrom][file.type]) {
                // init array
                buTypeDeltaDelete[buFrom][file.type] = [];
            }
            if (!buTypeDeltaDelete[buFrom][file.type].includes(file.externalKey)) {
                buTypeDeltaDelete[buFrom][file.type].push(file.externalKey);
            }
        }
        const deleteByBU = {};
        for (const buFrom in buTypeDeltaDelete) {
            /** @type {TemplateMap} */
            const sourceVariables = {};
            if (Util.checkMarket(sourceMarket, properties)) {
                Object.assign(sourceVariables, properties.markets[sourceMarket]);
            }
            const typeKeyFrom = {};
            const typeKeyDelete = {};
            for (const type of Object.keys(buTypeDeltaDelete[buFrom])) {
                if (
                    Array.isArray(properties.metaDataTypes.createDeltaPkg) &&
                    !properties.metaDataTypes.createDeltaPkg.includes(type)
                ) {
                    Util.logger.warn(
                        `Skipping ${type} for delete based on config.metaDataTypes.createDeltaPkg: ${buTypeDeltaDelete[buFrom][type].join(', ')}`
                    );
                    delete buTypeDeltaDelete[buFrom][type];
                    continue;
                }
                typeKeyFrom[type] = new Set();
                if (Object.keys(sourceVariables).length > 0) {
                    for (let i = 0; i < buTypeDeltaDelete[buFrom][type].length; i++) {
                        // add templating variables to keys
                        typeKeyFrom[type].add(
                            Util.replaceByObject(
                                buTypeDeltaDelete[buFrom][type][i],
                                sourceVariables
                            )
                        );
                    }
                }
                typeKeyFrom[type] = Array.from(typeKeyFrom[type]);
                for (const targetBu in properties.marketList[targetMlName]) {
                    typeKeyDelete[targetBu] ||= {};
                    typeKeyDelete[targetBu][type] ||= [];
                    deleteByBU[targetBu] || {};
                    const market = properties.marketList[targetMlName][targetBu];
                    const markets = 'string' === typeof market ? [market] : market;
                    for (const marketArr of markets) {
                        const templateVariables = {};
                        for (const market of Array.isArray(marketArr) ? marketArr : [marketArr]) {
                            if (Util.checkMarket(market, properties)) {
                                Object.assign(templateVariables, properties.markets[market]);
                            }
                        }
                        typeKeyDelete[targetBu][type].push(
                            ...typeKeyFrom[type].map((key) =>
                                MetadataType[type].applyTemplateValues(key, templateVariables)
                            )
                        );
                    }
                }
            }
            for (const targetBu in typeKeyDelete) {
                const metadataList = [];
                for (const type in typeKeyDelete[targetBu]) {
                    for (const key of typeKeyDelete[targetBu][type]) {
                        metadataList.push(type + ':"' + key + '"');
                    }
                }
                if (metadataList.length) {
                    Util.logger.warn(
                        `Run the following to delete ${metadataList.length} potentially existing old files in ${targetBu}`
                    );
                    Util.logger.warn(`mcdev delete ${targetBu} -m ${metadataList.join(' ')}`);
                }
            }
        }
    },
};

export default DevOps;
