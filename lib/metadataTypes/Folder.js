'use strict';

const MetadataType = require('./MetadataType');
const toposort = require('toposort');
const Util = require('../util/util');
const File = require('../util/file');
const cache = require('../util/cache');

/**
 * Folder MetadataType
 * @augments MetadataType
 */
class Folder extends MetadataType {
    /**
     * Retrieves metadata of metadata type into local filesystem. executes callback with retrieved metadata
     * @param {String} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {String[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @param {Object} buObject properties for auth
     * @returns {Promise} Promise
     */
    static async retrieve(retrieveDir, additionalFields, buObject) {
        const queryAllFolders = await this.retrieveHelper(additionalFields, true);
        // if this is the parent, no need to query twice as QueryAllAccounts works.

        if (buObject.eid !== buObject.mid) {
            queryAllFolders.push(...(await this.retrieveHelper(additionalFields, false)));
        }
        const sortPairs = toposort(queryAllFolders.map((a) => [a.ParentFolder.ID, a.ID]));
        const idMap = {};
        for (const val of queryAllFolders) {
            // Contact Builder Lists create a folder called "Audiences" with the same Customer Key as the
            // main data extension folder. We restrict this from deploy so setting customer key to allow retrieve
            if (val.CustomerKey === 'dataextension_default' && val.Name === 'Audiences') {
                val.CustomerKey = 'dataextension_audiences';
            }
            // by default folders do not have an external key, we set this to ID plus EID as this will be unique
            else if (!val.CustomerKey) {
                val.CustomerKey = [buObject.eid, val.ID].join('-');
            }

            idMap[val.ID] = val;
        }

        // create root node for attaching, but will be deleted later
        idMap[0] = {
            Name: '<ROOT>',
        };
        for (const id of sortPairs) {
            if (!idMap[id]) {
                Util.logger.debug(`Error: id ${id} not found in idMap-obj but in sortPairs-array.`);
                if (Util.logger.level === 'debug') {
                    console.log(`Error: id ${id} not found in idMap-ob but in sortPairs-array.`);
                }
            } else if (
                idMap[id].ParentFolder &&
                Number.isSafeInteger(idMap[id].ParentFolder.ID) &&
                idMap[id].Name !== '<ROOT>'
            ) {
                // if the parent folder can be found by ID
                if (idMap[idMap[id].ParentFolder.ID]) {
                    // if the parent folder has a Path
                    if (idMap[idMap[id].ParentFolder.ID].Path) {
                        const parent = idMap[idMap[id].ParentFolder.ID];
                        // we use / here not system separator as it is important to keep metadata consistent
                        idMap[id].Path = [parent.Path, idMap[id].Name].join(
                            Util.standardizedSplitChar
                        );
                        idMap[id].ParentFolder.Path = parent.Path;
                    } else {
                        idMap[id].Path = idMap[id].Name;
                    }
                } else {
                    Util.logger.error(
                        `Skipping - Cannot find parent folder (${idMap[id].ParentFolder.ID}) of: ${idMap[id].Name} (${id}, type: ${idMap[id].ContentType})`
                    );
                }
            }
            // All folders except the artificial root have ParentFolder attribute. If they dont something else is wrong
            else if (idMap[id].Name !== '<ROOT>') {
                idMap[id].Path = '';
                Util.logger.error(
                    `Skipping - Folder ${idMap[id].Name} does not have a parent folder (type: ${idMap[id].ContentType})`
                );
            }
        }

        // helper for error warning
        const buMapping = {};
        for (const cred in this.properties.credentials) {
            const buObj = this.properties.credentials[cred].businessUnits;
            for (const bu in buObj) {
                buMapping[buObj[bu]] = `${cred}/${bu}`;
            }
        }

        // build a new map using the customer key instead of id
        const metadata = {};
        for (const id in idMap) {
            // remove keys which are listed in other BUs and skip root
            if (
                idMap[id].Client?.ID &&
                (buObject.mid == idMap[id].Client.ID ||
                    this.definition.folderTypesFromParent.includes(
                        idMap[id].ContentType.toLowerCase()
                    ))
            ) {
                if (metadata[idMap[id].CustomerKey]) {
                    // check the shortest path as this is likely the more important folder.
                    if (metadata[idMap[id].CustomerKey].Path.length > idMap[id].Path.length) {
                        Util.logger.debug(
                            `MetadataType[folder-${
                                idMap[id].ContentType
                            }].retrieve:: Duplicate CustomerKey on Folder. Keeping: ${
                                idMap[id].Path
                            }, Overwriting: ${metadata[idMap[id].CustomerKey].Path}`
                        );
                        metadata[idMap[id].CustomerKey] = idMap[id];
                    } else {
                        Util.logger.debug(
                            `MetadataType[folder-${
                                idMap[id].ContentType
                            }].retrieve:: Duplicate CustomerKey on Folder. Keeping: ${
                                metadata[idMap[id].CustomerKey].Path
                            }, Ignoring: ${idMap[id].Path}`
                        );
                    }
                } else {
                    metadata[idMap[id].CustomerKey] = idMap[id];
                }
            } else {
                delete idMap[id];
            }
        }
        if (retrieveDir) {
            const savedMetadata = await this.saveResults(metadata, retrieveDir, buObject.mid);
            Util.logger.info(
                `Downloaded: ${this.definition.type} (${Object.keys(savedMetadata).length})`
            );
        }
        return { metadata: metadata, type: this.definition.type };
    }

    /**
     * Retrieves folder metadata for caching
     * @param {Object} buObject properties for auth
     * @returns {Promise} Promise
     */
    static retrieveForCache(buObject) {
        return this.retrieve(null, null, buObject);
    }

    /**
     * Folder upsert (copied from Metadata Upsert), after retrieving from target
     * and comparing to check if create or update operation is needed.
     * Copied due to having a dependency on itself, meaning the created need to be serial
     * @param {Object} metadata metadata mapped by their keyField
     * @returns {Promise<Object>} Promise of saved metadata
     */
    static async upsert(metadata) {
        let updateCount = 0;
        let createCount = 0;
        const upsertResults = {};
        const sortPairs = toposort(
            Object.keys(metadata).map((customerKey) => [
                metadata[customerKey].ParentFolder.Path,
                metadata[customerKey].Path,
            ])
        );
        // loop of loops to find a match between two arrays
        for (const folderPath of sortPairs) {
            for (const metadataKey in metadata) {
                if (metadata[metadataKey].Path === folderPath) {
                    try {
                        // preDeployTasks parsing
                        const deployableMetadata = await this.preDeployTasks(metadata[metadataKey]);
                        // if preDeploy returns nothing then it cannot be deployed so skip deployment
                        if (deployableMetadata) {
                            const normalizedKey = File.reverseFilterIllegalFilenames(metadataKey);

                            let existingId;
                            try {
                                // perform a secondary check based on path
                                existingId = cache.searchForField(
                                    'folder',
                                    deployableMetadata.Path,
                                    'Path',
                                    'ID'
                                );
                            } catch (ex) {
                                // In case no path matching, then try to use CustomerKey
                                existingId = cache.getByKey('folder', normalizedKey)?.ID;
                            }

                            let result;
                            // since deployableMetadata will be modified for deploy, make a copy for reference
                            const beforeMetadata = JSON.parse(JSON.stringify(deployableMetadata));
                            if (existingId) {
                                // if an existing folder exists with the same name/path then use that
                                deployableMetadata.ID = existingId;
                                result = await this.update(deployableMetadata);
                                updateCount++;
                            } else {
                                result = await this.create(deployableMetadata);
                                createCount++;
                            }
                            if (result?.Results) {
                                const parsed = this.parseResponseBody({
                                    Results: [result.Results[0].Object],
                                });
                                if (!result.Results[0].Object.CustomerKey && parsed['undefined']) {
                                    // when inserting folders without specifying a CustomerKey, this happens in parseResponseBody()
                                    parsed[normalizedKey] = parsed['undefined'];
                                    delete parsed['undefined'];
                                }
                                const newObject = {};
                                newObject[normalizedKey] = Object.assign(
                                    beforeMetadata,
                                    parsed[normalizedKey]
                                );
                                cache.mergeMetadata('folder', newObject);

                                upsertResults[metadataKey] = beforeMetadata;
                            } else {
                                Util.logger.debug(result);
                                throw new Error(
                                    `'${beforeMetadata.Path}' was not deployed correctly`
                                );
                            }
                        }
                    } catch (ex) {
                        Util.metadataLogger('error', 'folder', 'upsert', ex, metadataKey);
                    }
                }
            }
        }
        // Logging
        Util.metadataLogger(
            'info',
            this.definition.type,
            'upsert',
            `${createCount} created / ${updateCount} updated`
        );

        if (updateCount) {
            Util.logger.warn(
                `Folders are recognized for updates based on their CustomerKey or, if that is not given, their folder-path.`
            );
        }
        return upsertResults;
    }

    /**
     * creates a folder based on metatadata
     * @param {Object} metadata metadata of the folder
     * @returns {Promise} Promise
     */
    static async create(metadata) {
        if (metadata?.Parent?.ID === 0) {
            Util.logger.error(
                `${this.definition.type}-${metadata.ContentType}.create:: Cannot create Root Folder: ${metadata.Name}`
            );
            return {};
        }
        const path = metadata.Path;
        try {
            const response = await super.createSOAP(metadata, 'DataFolder', true);
            if (response) {
                response.Results[0].Object = metadata;
                response.Results[0].Object.ID = response.Results[0].NewID;
                response.Results[0].Object.CustomerKey = metadata.CustomerKey;
                delete response.Results[0].Object.$;

                Util.logger.info(`- created folder: ${path}`);
                return response;
            }
        } catch (ex) {
            if (ex?.results) {
                Util.logger.error(
                    `${this.definition.type}-${metadata.ContentType}.create:: error creating: '${path}'. ${ex.results[0].StatusMessage}`
                );
            } else if (ex) {
                Util.logger.error(
                    `${this.definition.type}-${metadata.ContentType}.create:: error creating: '${path}'. ${ex.message}`
                );
            }
        }
    }

    /**
     * Updates a single Folder.
     * @param {Object} metadata single metadata entry
     * @returns {Promise} Promise
     */
    static async update(metadata) {
        const path = metadata.Path;
        try {
            const response = await super.updateSOAP(metadata, 'DataFolder', true);
            if (response) {
                response.Results[0].Object = metadata;
                response.Results[0].Object.CustomerKey = metadata.CustomerKey;
                delete response.Results[0].Object.$;
                Util.logger.info(`- updated folder: ${path}`);
                return response;
            }
        } catch (ex) {
            if (ex?.results) {
                Util.logger.error(
                    `${this.definition.type}-${metadata.ContentType}.update:: error updating: '${path}'. ${ex.results[0].StatusMessage}`
                );
            } else if (ex) {
                Util.logger.error(
                    `${this.definition.type}-${metadata.ContentType}.update:: error updating: '${path}'. ${ex.message}`
                );
            }
        }
    }

    /**
     * prepares a folder for deployment
     * @param {Object} metadata a single folder definition
     * @returns {Promise} Promise
     */
    static async preDeployTasks(metadata) {
        if (!this.definition.deployFolderTypes.includes(metadata.ContentType.toLowerCase())) {
            Util.logger.warn(
                `Folder ${metadata.Name} is of a type which does not support deployment (Type: ${metadata.ContentType}). Please create this manually in the Web-Interface.`
            );
            return;
        }
        // skip certain folders by name
        else if (this.definition.deployFolderBlacklist.includes(metadata.Name.toLowerCase())) {
            Util.metadataLogger(
                'debug',
                'folder',
                'preDeployTasks',
                `Folder ${metadata.Name} is blacklisted for deployment due to it being a reserved name or that folder cannot be deployed`
            );
            return;
        }

        // skip when metadata isnt editable
        else if (!metadata.IsEditable) {
            Util.metadataLogger(
                'warn',
                'folder',
                'preDeployTasks',
                `Folders with IsEditable (such as ${metadata.Name}) are skipped in deployment to avoid overwriting system folder`
            );
            return;
        }
        // retreive ID based on the matching Path of the parent folder
        else if (metadata?.ParentFolder?.Path) {
            metadata.ParentFolder.ID = cache.searchForField(
                'folder',
                metadata.ParentFolder.Path,
                'Path',
                'ID'
            );
            return metadata;
        } else {
            Util.metadataLogger(
                'warn',
                'folder',
                'preDeployTasks',
                `skipping root folder '${metadata.Name}' (no need to include this in deployment)`
            );
            return;
        }
    }

    /**
     * Returns file contents mapped to their filename without '.json' ending
     * @param {String} dir directory that contains '.json' files to be read
     * @param {boolean} [listBadKeys=false] do not print errors, used for badKeys()
     * @returns {Object} fileName => fileContent map
     */
    static getJsonFromFS(dir, listBadKeys) {
        try {
            const fileName2FileContent = {};
            const directories = File.readDirectoriesSync(dir, 10, true);
            let newCounter = 0;
            for (const subdir of directories) {
                // standardise to / and then remove the stem up until folder as this
                // should not be in the path for the metadata. In case no split then return empty as this is root

                const standardSubDir = File.reverseFilterIllegalFilenames(
                    subdir.replace(/\\/g, '/').split(/folder\//)[1] || ''
                );
                for (const fileName of File.readdirSync(subdir)) {
                    try {
                        if (fileName.endsWith('meta.json')) {
                            const fileContent = File.readJSONFile(subdir, fileName, true, false);

                            const fileNameWithoutEnding = File.reverseFilterIllegalFilenames(
                                fileName.split(/\.(\w|-)+-meta.json/)[0]
                            );

                            if (fileContent.Name === fileNameWithoutEnding) {
                                fileContent.Path =
                                    (standardSubDir ? standardSubDir + '/' : '') +
                                    fileNameWithoutEnding;
                                fileContent.ParentFolder = {
                                    Path: standardSubDir,
                                };
                                const key = fileContent.CustomerKey
                                    ? fileContent.CustomerKey
                                    : `new-${++newCounter}`;
                                if (fileName2FileContent[key]) {
                                    Util.logger.error(
                                        `Your have multiple folder-JSONs with the same CustomerKey '${key}' - skipping ${fileName}`
                                    );
                                } else {
                                    fileName2FileContent[key] = fileContent;
                                }
                            } else if (!listBadKeys) {
                                Util.metadataLogger(
                                    'error',
                                    this.definition.type,
                                    'getJsonFromFS',
                                    'Name of the Folder and the Filename must match',
                                    JSON.stringify({
                                        Filename: fileNameWithoutEnding,
                                        MetadataName: fileContent.Name,
                                    })
                                );
                            }
                        }
                    } catch (ex) {
                        // by catching this in the loop we gracefully handle the issue and move on to the next file
                        Util.metadataLogger('debug', this.definition.type, 'getJsonFromFS', ex);
                    }
                }
            }
            return fileName2FileContent;
        } catch (ex) {
            Util.metadataLogger('error', this.definition.type, 'getJsonFromFS', ex);
            throw new Error(ex);
        }
    }

    /**
     * Helper to retrieve the folders as promise
     * @param {String[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @param {Boolean} [queryAllAccounts] which queryAllAccounts setting to use
     * @returns {Promise<Object>} soap object
     */
    static async retrieveHelper(additionalFields, queryAllAccounts) {
        const options = { QueryAllAccounts: !!queryAllAccounts };
        let status = 'MoreDataAvailable';
        const Results = [];
        do {
            const response = await this.client.soap.retrieveBulk(
                'DataFolder',
                this.getFieldNamesToRetrieve(additionalFields).filter(
                    (field) => !field.includes('Path')
                ),
                options
            );
            // merge results with existing
            Results.push(...response.Results);
            // set status for calling again if required
            status = response.OverallStatus;
            options.continueRequest = response.RequestID;
            if (status === 'MoreDataAvailable') {
                Util.logger.info(
                    '- more than ' +
                        Results.length +
                        ' folders in Business Unit - loading next batch...'
                );
            }
        } while (status === 'MoreDataAvailable');
        return Results;
    }
    /**
     * Gets executed after retreive of metadata type
     * @param {Object} metadata metadata mapped by their keyField
     * @returns {Object[]} cloned metadata
     */
    static postRetrieveTasks(metadata) {
        return JSON.parse(JSON.stringify(metadata));
    }
    /**
     * Helper for writing Metadata to disk, used for Retrieve and deploy
     * @param {Object} results metadata results from deploy
     * @param {String} retrieveDir directory where metadata should be stored after deploy/retrieve
     * @param {Number} mid current mid for this credential / business unit
     * @returns {Promise<Object>} Promise of saved metadata
     */
    static async saveResults(results, retrieveDir, mid) {
        const savedResults = {};
        for (const metadataEntry in results) {
            try {
                // skip saving shared folders as they technically live in parent.
                // ! Warning: our result set does not have Client.ID in it - bad check?
                if (results[metadataEntry].Client && mid != results[metadataEntry].Client.ID) {
                    continue;
                } else if (
                    results[metadataEntry] &&
                    (this.isFiltered(results[metadataEntry], true) ||
                        this.isFiltered(results[metadataEntry], false))
                ) {
                    // if current metadata entry is filtered skip writeJSONToFile()
                    continue;
                }
                // get subfolder into which we need to save this JSON
                // * cannot use split('/') here due to the "A/B Testing" folder
                const stem = results[metadataEntry].Path.slice(
                    0,
                    -results[metadataEntry].Name.length
                );

                // we dont store Id on local disk, but we need it for caching logic,
                // so its in retrieve but not in save. Here we put into the clone so that the original
                // object used for caching doesnt have the Id removed.
                const tempHolder = this.postRetrieveTasks(results[metadataEntry]);
                this.keepRetrieveFields(tempHolder);
                delete tempHolder.ParentFolder;
                delete tempHolder.Client;
                if (!this.definition.keepId) {
                    delete tempHolder.ID;
                }
                savedResults[metadataEntry] = tempHolder;

                // need to {await} writeJSONToFile() here because sometimes SFMC allows the same folder to be created twice and then we run into race conditions, causing bad JSON to be saved
                await File.writeJSONToFile(
                    // manage subtypes
                    [retrieveDir, 'folder', stem],
                    tempHolder.Name + '.folder-meta',
                    tempHolder
                );
            } catch (ex) {
                Util.metadataLogger(
                    'error',
                    this.definition.type,
                    'saveResults',
                    ex,
                    metadataEntry
                );
            }
        }
        return savedResults;
    }
}

// Assign definition to static attributes
Folder.definition = require('../MetadataTypeDefinitions').folder;

module.exports = Folder;
