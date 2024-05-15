'use strict';

import MetadataType from './MetadataType.js';
import toposort from 'toposort';
import { Util } from '../util/util.js';
import File from '../util/file.js';
import cache from '../util/cache.js';

/**
 * @typedef {import('../../types/mcdev.d.js').BuObject} BuObject
 * @typedef {import('../../types/mcdev.d.js').CodeExtract} CodeExtract
 * @typedef {import('../../types/mcdev.d.js').CodeExtractItem} CodeExtractItem
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItem} MetadataTypeItem
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItemDiff} MetadataTypeItemDiff
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItemObj} MetadataTypeItemObj
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMap} MetadataTypeMap
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMapObj} MetadataTypeMapObj
 * @typedef {import('../../types/mcdev.d.js').SoapRequestParams} SoapRequestParams
 * @typedef {import('../../types/mcdev.d.js').TemplateMap} TemplateMap
 */

/**
 * Folder MetadataType
 *
 * @augments MetadataType
 */
class Folder extends MetadataType {
    /**
     * Retrieves metadata of metadata type into local filesystem. executes callback with retrieved metadata
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @param {string[]} [subTypeArr] content type of folder
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise} Promise
     */
    static async retrieve(retrieveDir, additionalFields, subTypeArr, key) {
        if (key) {
            Util.logger.error(`Folder.retrieve() does not support key parameter`);
        }
        const queryAllFolders = await this.retrieveHelper(additionalFields, true, subTypeArr);

        if (this.buObject.eid !== this.buObject.mid) {
            queryAllFolders.push(
                ...(await this.retrieveHelper(additionalFields, false, subTypeArr))
            );
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
                val.CustomerKey = [this.buObject.eid, val.ID].join('-');
            }
            // ensure name is a string and not a number (SFMC-SDK workaround)
            val.Name = val.Name + '';

            idMap[val.ID] = val;
        }

        // create root node for attaching, but will be deleted later
        idMap[0] = {
            Name: '<ROOT>',
        };
        for (const id of sortPairs) {
            if (!idMap[id]) {
                Util.logger.debug(`Error: id ${id} not found in idMap-obj but in sortPairs-array.`);
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
                    Util.logger.warn(
                        ` - Skipping folder ${idMap[id].Name} (${id}, type: ${idMap[id].ContentType}): Cannot find parent folder (${idMap[id].ParentFolder.ID})`
                    );
                }
            }
            // All folders except the artificial root have ParentFolder attribute. If they dont something else is wrong
            else if (idMap[id].Name !== '<ROOT>') {
                idMap[id].Path = '';
                Util.logger.warn(
                    ` - Skipping folder ${idMap[id].Name} (${id}, type: ${idMap[id].ContentType}): Does not have a parent folder`
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
                (this.buObject.mid == idMap[id].Client.ID ||
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
            const savedMetadata = await this.saveResults(metadata, retrieveDir, this.buObject.mid);
            Util.logger.info(
                `Downloaded: ${this.definition.type} (${Object.keys(savedMetadata).length})`
            );
        }
        return { metadata: metadata, type: this.definition.type };
    }

    /**
     * Retrieves folder metadata for caching
     *
     * @param {void | string[]} [_] parameter not used
     * @param {string[]} [subTypeArr] content type of folder
     * @returns {Promise} Promise
     */
    static retrieveForCache(_, subTypeArr) {
        return this.retrieve(null, null, subTypeArr, null);
    }

    /**
     * Folder upsert (copied from Metadata Upsert), after retrieving from target
     * and comparing to check if create or update operation is needed.
     * Copied due to having a dependency on itself, meaning the created need to be serial
     *
     * @param {MetadataTypeMap} metadata metadata mapped by their keyField
     * @returns {Promise.<object>} Promise of saved metadata
     */
    static async upsert(metadata) {
        const orignalMetadata = JSON.parse(JSON.stringify(metadata));
        let updateCount = 0;
        let updateFailedCount = 0;
        let createCount = 0;
        let createFailedCount = 0;
        let filteredByPreDeploy = 0;
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
                                const cachedVersion = cache.getByKey(
                                    'folder',
                                    cache.searchForField(
                                        'folder',
                                        deployableMetadata.Path,
                                        'Path',
                                        this.definition.keyField
                                    )
                                );
                                if (
                                    existingId &&
                                    !this.hasChangedGeneric(
                                        cachedVersion,
                                        metadata[metadataKey],
                                        'Path',
                                        true
                                    )
                                ) {
                                    Util.logger.verbose(
                                        ` - skipping ${this.definition.type} ${
                                            cachedVersion?.Path ||
                                            metadata[metadataKey][this.definition.nameField]
                                        }: no change detected`
                                    );
                                    filteredByPreDeploy++;
                                    continue;
                                }
                            } catch {
                                // In case no path matching, then try to use CustomerKey
                                const cachedVersion = cache.getByKey('folder', normalizedKey);
                                existingId = cachedVersion?.ID;
                                if (
                                    existingId &&
                                    !this.hasChangedGeneric(
                                        cachedVersion,
                                        metadata[metadataKey],
                                        'Path',
                                        true
                                    )
                                ) {
                                    Util.logger.verbose(
                                        ` - skipping ${this.definition.type} ${
                                            cachedVersion?.Path ||
                                            metadata[metadataKey][this.definition.nameField]
                                        }: no change detected`
                                    );
                                    filteredByPreDeploy++;
                                    continue;
                                }
                            }

                            let result;
                            // since deployableMetadata will be modified for deploy, make a copy for reference
                            const beforeMetadata = JSON.parse(JSON.stringify(deployableMetadata));
                            if (existingId) {
                                // if an existing folder exists with the same name/path then use that
                                deployableMetadata.ID = existingId;
                                result = await this.update(deployableMetadata);
                                if (result) {
                                    updateCount++;
                                } else {
                                    updateFailedCount++;
                                }
                            } else {
                                result = await this.create(deployableMetadata);
                                if (result) {
                                    createCount++;
                                } else {
                                    createFailedCount++;
                                }
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
                        Util.logger.errorStack(
                            ex,
                            `Upserting ${this.definition.type} failed: ${ex.message}`
                        );
                    }
                }
            }
        }
        // Logging
        Util.logger.info(
            `${this.definition.type} upsert: ${createCount} of ${
                createCount + createFailedCount
            } created / ${updateCount} of ${updateCount + updateFailedCount} updated` +
                (filteredByPreDeploy > 0 ? ` / ${filteredByPreDeploy} filtered` : '')
        );

        if (updateCount) {
            Util.logger.warn(
                ` - Folders are recognized for updates based on their CustomerKey or, if that is not given, their folder-path.`
            );
        }
        await this.postDeployTasks(upsertResults, orignalMetadata, {
            created: createCount,
            updated: updateCount,
        });
        return upsertResults;
    }

    /**
     * creates a folder based on metatadata
     *
     * @param {MetadataTypeItem} metadataEntry metadata of the folder
     * @returns {Promise} Promise
     */
    static async create(metadataEntry) {
        if (metadataEntry?.Parent?.ID === 0) {
            Util.logger.error(
                `${this.definition.type}-${metadataEntry.ContentType}.create:: Cannot create Root Folder: ${metadataEntry.Name}`
            );
            return {};
        }
        const path = metadataEntry.Path;
        try {
            // * We tried using the SOAP endpoint for creating folders but that did not support folders for automations nor journeys. This rest endpoint seems to cover everything though
            const restPayload = {
                parentCatId: metadataEntry.ParentFolder.ID,
                name: metadataEntry.Name,
                catType: metadataEntry.ContentType,
            };
            const response = await super.createREST(restPayload, '/email/v1/category', true);
            if (response?.objectId) {
                // convert the response to the same format as the SOAP response
                metadataEntry.ID = response.objectId;
                // the following is a bit of a hack to make the response look like the SOAP response; not sure if we actually need that anywhere like this --> future developers feel free to double check
                const returnObject = {
                    Results: [
                        {
                            Object: metadataEntry,
                        },
                    ],
                };

                Util.logger.info(` - created folder: ${path}`);
                return returnObject;
            } else {
                throw new Error(response);
            }
        } catch (ex) {
            if (ex?.results) {
                Util.logger.error(
                    `${this.definition.type}-${metadataEntry.ContentType}.create:: error creating: '${path}'. ${ex.results[0].StatusMessage}`
                );
            } else if (ex) {
                Util.logger.error(
                    `${this.definition.type}-${metadataEntry.ContentType}.create:: error creating: '${path}'. ${ex.message}`
                );
            }
        }
    }

    /**
     * Updates a single Folder.
     *
     * @param {MetadataTypeItem} metadataEntry single metadata entry
     * @returns {Promise} Promise
     */
    static async update(metadataEntry) {
        const path = metadataEntry.Path;
        try {
            const response = await super.updateSOAP(metadataEntry, true);
            if (response) {
                response.Results[0].Object = metadataEntry;
                response.Results[0].Object.CustomerKey = metadataEntry.CustomerKey;
                delete response.Results[0].Object.$;
                Util.logger.info(` - updated folder: ${path}`);
                return response;
            }
        } catch (ex) {
            if (ex?.results) {
                Util.logger.error(
                    `${this.definition.type}-${metadataEntry.ContentType}.update:: error updating: '${path}'. ${ex.results[0].StatusMessage}`
                );
            } else if (ex) {
                Util.logger.error(
                    `${this.definition.type}-${metadataEntry.ContentType}.update:: error updating: '${path}'. ${ex.message}`
                );
            }
        }
    }

    /**
     * prepares a folder for deployment
     *
     * @param {MetadataTypeItem} metadata a single folder definition
     * @returns {Promise.<MetadataTypeItem>} Promise of parsed folder metadata
     */
    static async preDeployTasks(metadata) {
        if (!this.definition.deployFolderTypes.includes(metadata.ContentType.toLowerCase())) {
            Util.logger.warn(
                ` - Folder ${metadata.Name} is of a type which does not support deployment (Type: ${metadata.ContentType}). Please create this manually in the Web-Interface.`
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
     *
     * @param {string} dir directory that contains '.json' files to be read
     * @param {boolean} [listBadKeys] do not print errors, used for badKeys()
     * @returns {MetadataTypeMap} fileName => fileContent map
     */
    static getJsonFromFS(dir, listBadKeys) {
        try {
            /** @type {MetadataTypeMap} */
            const fileName2FileContent = {};
            const directories = File.readDirectoriesSync(dir, 10, true);
            let newCounter = 0;
            if (!Array.isArray(directories)) {
                return fileName2FileContent;
            }
            for (const subdir of directories) {
                // standardise to / and then remove the stem up until folder as this
                // should not be in the path for the metadata. In case no split then return empty as this is root

                const standardSubDir = File.reverseFilterIllegalFilenames(
                    subdir.replaceAll('\\', '/').split(/folder\//)[1] || ''
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
                                const key = fileContent.CustomerKey || `new-${++newCounter}`;
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
     *
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @param {boolean} [queryAllAccounts] which queryAllAccounts setting to use
     * @param {string[]} [contentTypeList] content type of folder
     * @returns {Promise.<object>} soap object
     */
    static async retrieveHelper(additionalFields, queryAllAccounts, contentTypeList) {
        const options = { QueryAllAccounts: !!queryAllAccounts };
        if (contentTypeList) {
            for (const contentType of contentTypeList) {
                options.filter = options.filter
                    ? {
                          leftOperand: {
                              leftOperand: 'ContentType',
                              operator: 'equals',
                              rightOperand: contentType,
                          },
                          operator: 'OR',
                          rightOperand: options.filter,
                      }
                    : {
                          leftOperand: 'ContentType',
                          operator: 'equals',
                          rightOperand: contentType,
                      };
            }
        }
        const response = await this.client.soap.retrieveBulk(
            'DataFolder',
            this.getFieldNamesToRetrieve(additionalFields).filter(
                (field) => !field.includes('Path')
            ),
            options
        );
        return response.Results;
    }
    /**
     * Gets executed after retreive of metadata type
     *
     * @param {MetadataTypeItem} metadata metadata mapped by their keyField
     * @returns {MetadataTypeItem} cloned metadata
     */
    static postRetrieveTasks(metadata) {
        return JSON.parse(JSON.stringify(metadata));
    }
    /**
     * Helper for writing Metadata to disk, used for Retrieve and deploy
     *
     * @param {MetadataTypeMap} results metadata results from deploy
     * @param {string} retrieveDir directory where metadata should be stored after deploy/retrieve
     * @param {number | string} mid unused parameter
     * @returns {Promise.<object>} Promise of saved metadata
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
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
Folder.definition = MetadataTypeDefinitions.folder;

export default Folder;
