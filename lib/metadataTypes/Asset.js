'use strict';

import MetadataType from './MetadataType.js';
import TYPE from '../../types/mcdev.d.js';
import { Util } from '../util/util.js';
import File from '../util/file.js';
import pLimit from 'p-limit';
import cliProgress from 'cli-progress';
import cache from '../util/cache.js';
import TriggeredSend from './TriggeredSend.js';

/**
 * FileTransfer MetadataType
 *
 * @augments MetadataType
 */
class Asset extends MetadataType {
    /**
     * Retrieves Metadata of Asset
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void} _ -
     * @param {TYPE.AssetSubType[]} [subTypeArr] optionally limit to a single subtype
     * @param {string} [key] customer key
     * @returns {Promise.<{metadata: TYPE.AssetMap, type: string}>} Promise
     */
    static async retrieve(retrieveDir, _, subTypeArr, key) {
        const items = [];
        subTypeArr ||= this._getSubTypes();
        if (retrieveDir) {
            await File.initPrettier();
        }
        // loop through subtypes and return results of each subType for caching (saving is handled per subtype)
        for (const subType of subTypeArr) {
            // each subtype contains multiple different specific types (images contains jpg and png for example)
            // we use await here to limit the risk of too many concurrent api requests at time
            items.push(...(await this.requestSubType(subType, retrieveDir, null, null, key)));
        }
        const metadata = this.parseResponseBody({ items: items });
        if (retrieveDir) {
            Util.logger.info(
                `Downloaded: ${this.definition.type} (${Object.keys(metadata).length})` +
                    Util.getKeysString(key)
            );
        }
        return { metadata: metadata, type: this.definition.type };
    }

    /**
     * Retrieves asset metadata for caching
     *
     * @param {void} [_] parameter not used
     * @param {string[]} [subTypeArr] optionally limit to a single subtype
     * @returns {Promise.<{metadata: TYPE.AssetMap, type: string}>} Promise
     */
    static retrieveForCache(_, subTypeArr) {
        return this.retrieve(null, null, subTypeArr);
    }

    /**
     * Retrieves asset metadata for templating
     *
     * @param {string} templateDir Directory where retrieved metadata directory will be saved
     * @param {string} name name of the metadata file
     * @param {TYPE.TemplateMap} templateVariables variables to be replaced in the metadata
     * @param {TYPE.AssetSubType} [selectedSubType] optionally limit to a single subtype
     * @returns {Promise.<{metadata: TYPE.AssetItem, type: string}>} Promise
     */
    static async retrieveAsTemplate(templateDir, name, templateVariables, selectedSubType) {
        const items = [];
        const subTypes = selectedSubType ? [selectedSubType] : this._getSubTypes();
        await File.initPrettier();
        // loop through subtypes and return results of each subType for caching (saving is handled per subtype)
        for (const subType of subTypes) {
            // each subtype contains multiple different specific types (images contains jpg and png for example)
            // we use await here to limit the risk of too many concurrent api requests at time
            items.push(
                ...(await this.requestSubType(subType, templateDir, name, templateVariables))
            );
        }
        const metadata = this.parseResponseBody({ items: items });
        if (!Object.keys(metadata).length) {
            Util.logger.error(`${this.definition.type} '${name}' not found on server.`);
        }
        Util.logger.info(`Downloaded: ${this.definition.type} (${Object.keys(metadata).length})`);

        return { metadata: Object.values(metadata)[0], type: this.definition.type };
    }
    /**
     * helper for {@link Asset.retrieve} + {@link Asset.retrieveAsTemplate}
     *
     * @private
     * @returns {TYPE.AssetSubType[]} subtype array
     */
    static _getSubTypes() {
        const selectedSubTypeArr = this.properties.metaDataTypes.retrieve.filter((type) =>
            type.startsWith('asset-')
        );
        /* eslint-disable unicorn/prefer-ternary */
        if (
            this.properties.metaDataTypes.retrieve.includes('asset') ||
            !selectedSubTypeArr.length
        ) {
            // if "asset" is found in config assume to download the default subtypes only
            return this.definition.typeRetrieveByDefault;
        } else {
            return selectedSubTypeArr.map((type) => type.replace('asset-', ''));
        }
        /* eslint-enable unicorn/prefer-ternary */
    }

    /**
     * Creates a single asset
     *
     * @param {TYPE.AssetItem} metadata a single asset
     * @returns {Promise} Promise
     */
    static create(metadata) {
        delete metadata.businessUnitAvailability;
        const uri = '/asset/v1/content/assets/';
        return super.createREST(metadata, uri);
    }

    /**
     * Updates a single asset
     *
     * @param {TYPE.AssetItem} metadata a single asset
     * @returns {Promise} Promise
     */
    static update(metadata) {
        const uri = '/asset/v1/content/assets/' + metadata.id;
        return super.updateREST(metadata, uri);
    }
    /**
     * Retrieves Metadata of a specific asset type
     *
     * @param {TYPE.AssetSubType} subType group of similar assets to put in a folder (ie. images)
     * @param {string} [retrieveDir] target directory for saving assets
     * @param {string} [templateName] name of the metadata file
     * @param {TYPE.TemplateMap} [templateVariables] variables to be replaced in the metadata
     * @param {string} key customer key to filter by
     * @returns {Promise} Promise
     */
    static async requestSubType(subType, retrieveDir, templateName, templateVariables, key) {
        if (retrieveDir) {
            Util.logger.info(`- Retrieving Subtype: ${subType}`);
        } else {
            Util.logger.info(` - Caching Subtype: ${subType}`);
        }
        /** @type {TYPE.AssetSubType[]} */
        const extendedSubTypeArr = this.definition.extendedSubTypes[subType];
        const subtypeIds = extendedSubTypeArr?.map(
            (subTypeItemName) => Asset.definition.typeMapping[subTypeItemName]
        );
        const uri = '/asset/v1/content/assets/query';
        const payload = {
            page: {
                page: 1,
                pageSize: 50,
            },
            query: null,
            fields: ['category', 'createdDate', 'createdBy', 'modifiedDate', 'modifiedBy'], // get folder to allow duplicate name check against cache
        };

        if (templateName) {
            payload.query = {
                leftOperand: {
                    property: 'assetType.id',
                    simpleOperator: 'in',
                    value: subtypeIds,
                },
                logicalOperator: 'AND',
                rightOperand: {
                    property: this.definition.nameField,
                    simpleOperator: 'equal',
                    value: templateName,
                },
            };
        } else if (key) {
            payload.query = {
                leftOperand: {
                    property: 'assetType.id',
                    simpleOperator: 'in',
                    value: subtypeIds,
                },
                logicalOperator: 'AND',
                rightOperand: {
                    property: this.definition.keyField,
                    simpleOperator: 'equal',
                    value: key,
                },
            };
        } else {
            payload.query = {
                property: 'assetType.id',
                simpleOperator: 'in',
                value: subtypeIds,
            };
            payload.sort = [{ property: 'id', direction: 'ASC' }];
        }
        // for caching we do not need these fields
        if (retrieveDir) {
            payload.fields = [
                'fileProperties',
                'status',
                'category',
                'createdDate',
                'createdBy',
                'modifiedDate',
                'modifiedBy',
                'availableViews',
                'data',
                'tags',
            ];
        }
        let moreResults = false;
        let lastPage = 0;
        let items = [];
        do {
            payload.page.page = lastPage + 1;
            const response = await this.client.rest.post(uri, payload);
            if (response?.items?.length) {
                // sometimes the api will return a payload without items
                // --> ensure we only add proper items-arrays here
                items = items.concat(response.items);
            }
            // check if any more records
            if (response?.message?.includes('all shards failed')) {
                // When running certain filters, there is a limit of 10k on ElastiCache.
                // Since we sort by ID, we can get the last ID then run new requests from there
                payload.query = {
                    leftOperand: {
                        property: 'assetType.id',
                        simpleOperator: 'in',
                        value: subtypeIds,
                    },
                    logicalOperator: 'AND',
                    rightOperand: {
                        property: 'id',
                        simpleOperator: 'greaterThan',
                        value: items.at(-1).id,
                    },
                };
                lastPage = 0;
                moreResults = true;
            } else if (response.page * response.pageSize < response.count) {
                moreResults = true;
                lastPage = Number(response.page);
            } else {
                moreResults = false;
            }
        } while (moreResults);

        // only when we save results do we need the complete metadata or files. caching can skip these
        if (retrieveDir && items.length > 0) {
            for (const item of items) {
                if (item.customerKey.trim() !== item.customerKey) {
                    Util.logger.warn(
                        `  - ${this.definition.type} ${item[this.definition.nameField]} (${
                            item[this.definition.keyField]
                        }) has leading or trailing spaces in customerKey. Please remove them in SFMC.`
                    );
                }
            }
            // we have to wait on execution or it potentially causes memory reference issues when changing between BUs
            await this.requestAndSaveExtended(items, subType, retrieveDir, templateVariables);
            Util.logger.debug(`Downloaded asset-${subType}: ${items.length}`);
        } else if (retrieveDir && !items.length) {
            Util.logger.info(`  Downloaded asset-${subType}: ${items.length}`);
        }

        return items.map((item) => {
            item._subType = subType;
            return item;
        });
    }
    /**
     * Retrieves extended metadata (files or extended content) of asset
     *
     * @param {Array} items array of items to retrieve
     * @param {TYPE.AssetSubType} subType group of similar assets to put in a folder (ie. images)
     * @param {string} retrieveDir target directory for saving assets
     * @param {TYPE.TemplateMap} [templateVariables] variables to be replaced in the metadata
     * @returns {Promise} Promise
     */
    static async requestAndSaveExtended(items, subType, retrieveDir, templateVariables) {
        // disable CLI logs other than error while retrieving subtype
        const loggerLevelBak = Util.logger.level;
        if (loggerLevelBak !== 'error') {
            // disable logging to cli other than Errors
            Util.setLoggingLevel({ silent: true });
        }
        const extendedBar = new cliProgress.SingleBar(
            {
                format:
                    '                 Downloaded [{bar}] {percentage}% | {value}/{total} | asset-' +
                    subType,
            },
            cliProgress.Presets.shades_classic
        );

        const completed = [];
        const failed = [];
        // put in do loop to manage issues with connection timeout
        do {
            // use promise execution limiting to avoid rate limits on api, but speed up execution
            // start the progress bar with a total value of 200 and start value of 0
            extendedBar.start(items.length - completed.length, 0);
            try {
                const rateLimit = pLimit(5);

                const promiseMap = await Promise.all(
                    items.map((item) =>
                        rateLimit(async () => {
                            const metadata = {};
                            // this is a file so extended is at another endpoint
                            if (item?.fileProperties?.extension && !completed.includes(item.id)) {
                                try {
                                    // retrieving the extended file does not need to be awaited
                                    await this._retrieveExtendedFile(item, subType, retrieveDir);
                                } catch (ex) {
                                    failed.push({ item: item, error: ex });
                                }
                                // even if the extended file failed, still save the metadata
                                metadata[item.customerKey] = item;
                            }
                            // this is a complex type which stores data in the asset itself
                            else if (!completed.includes(item.id)) {
                                try {
                                    const extendedItem = await this.client.rest.get(
                                        'asset/v1/content/assets/' + item.id
                                    );
                                    // only save the metadata if we have extended content
                                    metadata[item.customerKey] = extendedItem;
                                } catch (ex) {
                                    failed.push({ item: item, error: ex });
                                }
                            }
                            completed.push(item.id);
                            if (metadata[item.customerKey]) {
                                await this.saveResults(
                                    metadata,
                                    retrieveDir,
                                    'asset-' + subType,
                                    templateVariables
                                );
                            }
                            // update the current value in your application..
                            extendedBar.increment();
                        })
                    )
                );

                // stop the progress bar
                extendedBar.stop();
                Asset._resetLogLevel(loggerLevelBak, failed);
                return promiseMap;
            } catch (ex) {
                extendedBar.stop();
                Asset._resetLogLevel(loggerLevelBak, failed);
                // timeouts should be retried, others can be exited
                if (ex.code !== 'ETIMEDOUT') {
                    throw ex;
                }
            }
        } while (completed.length === items.length);
    }

    /**
     * helper that reset the log level and prints errors
     *
     * @private
     * @param {'info'|'verbose'|'debug'|'error'} loggerLevelBak original logger level
     * @param {object[]} failed array of failed items
     */
    static _resetLogLevel(loggerLevelBak, failed) {
        // re-enable CLI logs
        if (loggerLevelBak !== 'error') {
            // reset logging level
            let obj;
            switch (loggerLevelBak) {
                case 'info': {
                    obj = {};
                    break;
                }
                case 'verbose': {
                    obj = { verbose: true };
                    break;
                }
                case 'debug': {
                    obj = { debug: true };
                    break;
                }
                case 'error': {
                    obj = { silent: true };
                }
            }
            Util.setLoggingLevel(obj);
        }

        if (failed.length) {
            Util.logger.warn(
                ` - Failed to download ${failed.length} extended file${
                    failed.length > 1 ? 's' : ''
                }:`
            );
            for (const fail of failed) {
                Util.logger.warn(
                    `   - "${fail.item.name}" (${fail.item.customerKey}): ${fail.error.message} (${
                        fail.error.code
                    })${
                        fail.error.endpoint
                            ? Util.getGrayMsg(
                                  ' - ' +
                                      fail.error.endpoint.split('rest.marketingcloudapis.com')[1]
                              )
                            : ''
                    }`
                );
            }
            Util.logger.info(
                ' - You will still find a JSON file for each of these in the download directory.'
            );
        }
    }

    /**
     * Some metadata types store their actual content as a separate file, e.g. images
     * This method retrieves these and saves them alongside the metadata json
     *
     * @param {TYPE.AssetItem} metadata a single asset
     * @param {TYPE.AssetSubType} subType group of similar assets to put in a folder (ie. images)
     * @param {string} retrieveDir target directory for saving assets
     * @returns {Promise.<void>} -
     */
    static async _retrieveExtendedFile(metadata, subType, retrieveDir) {
        const file = await this.client.rest.get('asset/v1/content/assets/' + metadata.id + '/file');

        // to handle uploaded files that bear the same name, SFMC engineers decided to add a number after the fileName
        // however, their solution was not following standards: fileName="header.png (4) " and then extension="png (4) "
        const fileExt = metadata.fileProperties.extension.split(' ')[0];

        File.writeToFile(
            [retrieveDir, this.definition.type, subType],
            metadata.customerKey,
            fileExt,
            file,
            'base64'
        );
    }
    /**
     * helper for {@link Asset.preDeployTasks}
     * Some metadata types store their actual content as a separate file, e.g. images
     * This method reads these from the local FS stores them in the metadata object allowing to deploy it
     *
     * @param {TYPE.AssetItem} metadata a single asset
     * @param {TYPE.AssetSubType} subType group of similar assets to put in a folder (ie. images)
     * @param {string} deployDir directory of deploy files
     * @param {boolean} [pathOnly] used by getFilesToCommit which does not need the binary file to be actually read
     * @returns {Promise.<string>} if found will return the path of the binary file
     */
    static async _readExtendedFileFromFS(metadata, subType, deployDir, pathOnly = false) {
        // to handle uploaded files that bear the same name, SFMC engineers decided to add a number after the fileName
        // however, their solution was not following standards: fileName="header.png (4) " and then extension="png (4) "
        if (!metadata?.fileProperties?.extension) {
            return;
        }
        const fileExt = metadata.fileProperties.extension.split(' ')[0];

        const path = File.normalizePath([
            deployDir,
            this.definition.type,
            subType,
            `${metadata.customerKey}.${fileExt}`,
        ]);
        if (await File.pathExists(path)) {
            if (!pathOnly) {
                metadata.file = await File.readFilteredFilename(
                    [deployDir, this.definition.type, subType],
                    metadata.customerKey,
                    fileExt,
                    'base64'
                );
            }
            return path;
        }
    }
    /**
     * manages post retrieve steps
     *
     * @param {TYPE.AssetItem} metadata a single asset
     * @returns {TYPE.CodeExtractItem} metadata
     */
    static postRetrieveTasks(metadata) {
        // folder
        this.setFolderPath(metadata);
        // extract HTML for selected subtypes and convert payload for easier processing in MetadataType.saveResults()
        metadata = this._extractCode(metadata);
        return metadata;
    }

    /**
     * Gets executed after deployment of metadata type
     *
     * @param {TYPE.MetadataTypeMap} metadata metadata mapped by their keyField
     * @param {TYPE.MetadataTypeMap} _ originalMetadata to be updated (contains additioanl fields)
     * @param {{created: number, updated: number}} createdUpdated counter representing successful creates/updates
     * @returns {Promise.<void>} -
     */
    static async postDeployTasks(metadata, _, createdUpdated) {
        if (Util.OPTIONS.refresh) {
            if (createdUpdated.updated) {
                // only run this if assets were updated. for created assets we do not expect
                this._refreshTriggeredSend(metadata);
            } else {
                Util.logger.warn(
                    'You set the --refresh flag but no updated assets found. Skipping refresh of triggeredSendDefinitions.'
                );
            }
        }
    }

    /**
     * helper for {@link Asset.postDeployTasks}. triggers a refresh of active triggerredSendDefinitions associated with the updated asset-message items. Gets executed if refresh option has been set.
     *
     * @private
     * @param {TYPE.MetadataTypeMap} metadata metadata mapped by their keyField
     * @returns {Promise.<void>} -
     */
    static async _refreshTriggeredSend(metadata) {
        // get legacyData.legacyId from assets to compare to TSD's metadata.Email.ID to
        const legacyIdArr = Object.keys(metadata)
            .map((key) => metadata[key]?.legacyData?.legacyId)
            .filter(Boolean);

        if (!legacyIdArr.length) {
            Util.logger.warn(
                'No legacyId found in updated emails. Skipping refresh of triggeredSendDefinitions.'
            );
            return;
        }
        // prep triggeredSendDefinition class
        TriggeredSend.properties = this.properties;
        TriggeredSend.buObject = this.buObject;
        TriggeredSend.client = this.client;
        try {
            // find refreshable TSDs
            const tsdObj = (await TriggeredSend.findRefreshableItems(true)).metadata;

            const tsdCountInitial = Object.keys(tsdObj).length;
            const emailCount = legacyIdArr.length;
            // filter TSDs by legacyId
            for (const key in tsdObj) {
                if (!legacyIdArr.includes(tsdObj[key].Email.ID)) {
                    delete tsdObj[key];
                }
            }
            const tsdCountFiltered = Object.keys(tsdObj).length;
            Util.logger.info(
                `Found ${tsdCountFiltered} out of ${tsdCountInitial} total triggeredSendDefinitions for ${emailCount} deployed emails. Commencing validation...`
            );

            // get keys of TSDs to refresh
            const keyArr = await TriggeredSend.getKeysForValidTSDs(tsdObj);

            await TriggeredSend.refresh(keyArr);
        } catch {
            Util.logger.warn('Failed to refresh triggeredSendDefinition');
        }
    }

    /**
     * prepares an asset definition for deployment
     *
     * @param {TYPE.AssetItem} metadata a single asset
     * @param {string} deployDir directory of deploy files
     * @returns {Promise.<TYPE.AssetItem>} Promise
     */
    static async preDeployTasks(metadata, deployDir) {
        // additonalattributes fail where the value is "" so we need to remove them from deploy
        if (metadata?.data?.email?.attributes?.length > 0) {
            metadata.data.email.attributes = metadata.data.email.attributes.filter(
                (attr) => attr.value
            );
        }

        // folder
        this.setFolderId(metadata);

        // restore asset type id which is needed for deploy
        metadata.assetType.id = this.definition.typeMapping[metadata.assetType.name];

        // define asset's subtype
        const subType = this._getSubtype(metadata);

        // #1 get text extracts back into the JSON
        await this._mergeCode(metadata, deployDir, subType);

        // #2 get file from local disk and insert as base64
        await this._readExtendedFileFromFS(metadata, subType, deployDir);

        // only execute #3 if we are deploying / copying from one BU to another, not while using mcdev as a developer tool
        if (
            this.buObject.mid &&
            metadata.memberId !== this.buObject.mid &&
            !metadata[this.definition.keyField].endsWith(this.buObject.mid)
        ) {
            // #3 make sure customer key is unique by suffixing it with target MID (unless we are deploying to the same MID)
            // check if this suffixed with the source MID
            const suffix = '-' + this.buObject.mid;
            // for customer key max is 36 chars
            metadata[this.definition.keyField] =
                metadata[this.definition.keyField].slice(0, Math.max(0, 36 - suffix.length)) +
                suffix;
        }
        // #4 make sure the name is unique
        const assetCache = cache.getCache()[this.definition.type];
        const namesInFolder = Object.keys(assetCache)
            .filter((key) => assetCache[key].category.id === metadata.category.id)
            .map((key) => ({
                type: this._getMainSubtype(assetCache[key].assetType.name),
                key: key,
                name: assetCache[key].name,
            }));
        // if the name is already in the folder for a different key, add a number to the end
        metadata[this.definition.nameField] = this._findUniqueName(
            metadata[this.definition.keyField],
            metadata[this.definition.nameField],
            this._getMainSubtype(metadata.assetType.name),
            namesInFolder
        );
        return metadata;
    }
    /**
     * find the subType matching the extendedSubType
     *
     * @param {string} extendedSubType webpage, htmlblock, etc
     * @returns {string} subType: block, message, other, etc
     */
    static _getMainSubtype(extendedSubType) {
        return Object.keys(this.definition.extendedSubTypes).find((subType) =>
            this.definition.extendedSubTypes[subType].includes(extendedSubType)
        );
    }
    /**
     * helper to find a new unique name during asset creation
     *
     * @private
     * @param {string} key key of the asset
     * @param {string} name name of the asset
     * @param {string} type assetType-name
     * @param {string[]} namesInFolder names of the assets in the same folder
     * @returns {string} new name
     */
    static _findUniqueName(key, name, type, namesInFolder) {
        let newName = name;
        let suffix;
        let i = 1;
        while (
            namesInFolder.find(
                (item) => item.name === newName && item.type === type && item.key !== key
            )
        ) {
            suffix = ' (' + i + ')';
            // for customer key max is 100 chars
            newName = name.slice(0, Math.max(0, 100 - suffix.length)) + suffix;
            i++;
        }
        return newName;
    }
    /**
     * determines the subtype of the current asset
     *
     * @private
     * @param {TYPE.AssetItem} metadata a single asset
     * @returns {TYPE.AssetSubType | void} subtype
     */
    static _getSubtype(metadata) {
        for (const sub in this.definition.extendedSubTypes) {
            if (this.definition.extendedSubTypes[sub].includes(metadata.assetType.name)) {
                return sub;
            }
        }
    }
    /**
     * helper for {@link MetadataType.buildDefinition}
     * handles extracted code if any are found for complex types
     *
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string} targetDir Directory where built definitions will be saved
     * @param {TYPE.AssetItem} metadata main JSON file that was read from file system
     * @param {TYPE.TemplateMap} templateVariables variables to be replaced in the metadata
     * @param {string} templateName name of the template to be built
     * @returns {Promise.<void>} -
     */
    static buildDefinitionForNested(
        templateDir,
        targetDir,
        metadata,
        templateVariables,
        templateName
    ) {
        return this._buildForNested(
            templateDir,
            targetDir,
            metadata,
            templateVariables,
            templateName,
            'definition'
        );
    }
    /**
     * helper for {@link MetadataType.buildTemplate}
     * handles extracted code if any are found for complex types
     *
     * @example assets of type codesnippetblock will result in 1 json and 1 amp/html file. both files need to be run through templating
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string|string[]} targetDir (List of) Directory where built definitions will be saved
     * @param {TYPE.AssetItem} metadata main JSON file that was read from file system
     * @param {TYPE.TemplateMap} templateVariables variables to be replaced in the metadata
     * @param {string} templateName name of the template to be built
     * @returns {Promise.<void>} -
     */
    static buildTemplateForNested(
        templateDir,
        targetDir,
        metadata,
        templateVariables,
        templateName
    ) {
        return this._buildForNested(
            templateDir,
            targetDir,
            metadata,
            templateVariables,
            templateName,
            'template'
        );
    }

    /**
     * helper for {@link MetadataType.buildDefinition}
     * handles extracted code if any are found for complex types
     *
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string} targetDir Directory where built definitions will be saved
     * @param {TYPE.AssetItem} metadata main JSON file that was read from file system
     * @param {TYPE.TemplateMap} templateVariables variables to be replaced in the metadata
     * @param {string} templateName name of the template to be built
     * @param {'definition'|'template'} mode defines what we use this helper for
     * @returns {Promise.<void>} -
     */
    static async _buildForNested(
        templateDir,
        targetDir,
        metadata,
        templateVariables,
        templateName,
        mode
    ) {
        // * because asset's _mergeCode() is overwriting 'metadata', clone it to ensure the main file is not modified by what we do in here
        metadata = JSON.parse(JSON.stringify(metadata));

        // #1 text extracts
        // define asset's subtype
        const subType = this._getSubtype(metadata);
        // get HTML from filesystem
        const fileList = await this._mergeCode(metadata, templateDir, subType, templateName);
        // replace template variables with their values
        for (const extractedFile of fileList) {
            try {
                if (mode === 'definition') {
                    // replace template variables with their values
                    extractedFile.content = this.applyTemplateValues(
                        extractedFile.content,
                        templateVariables
                    );
                } else if (mode === 'template') {
                    // replace template values with corresponding variable names
                    extractedFile.content = this.applyTemplateNames(
                        extractedFile.content,
                        templateVariables
                    );
                }
            } catch {
                throw new Error(
                    `${this.definition.type}:: Error applying template variables on ${
                        metadata[this.definition.keyField]
                    }: ${extractedFile.fileName}.${extractedFile.fileExt}.`
                );
            }
        }

        // #2 binary extracts
        if (metadata?.fileProperties?.extension) {
            // to handle uploaded files that bear the same name, SFMC engineers decided to add a number after the fileName
            // however, their solution was not following standards: fileName="header.png (4) " and then extension="png (4) "
            const fileExt = metadata.fileProperties.extension.split(' ')[0];

            const filecontent = await File.readFilteredFilename(
                [templateDir, this.definition.type, subType],
                templateName,
                fileExt,
                'base64'
            );

            // keep old name if creating templates, otherwise use new name
            const fileName =
                mode === 'definition' ? metadata[this.definition.keyField] : templateName;

            fileList.push({
                subFolder: [this.definition.type, subType],
                fileName: fileName,
                fileExt: fileExt,
                content: filecontent,
                encoding: 'base64',
            });
        }

        // write to file (#1 + #2)
        const targetDirArr = Array.isArray(targetDir) ? targetDir : [targetDir];
        for (const targetDir of targetDirArr) {
            for (const extractedFile of fileList) {
                File.writeToFile(
                    [targetDir, ...extractedFile.subFolder],
                    extractedFile.fileName,
                    extractedFile.fileExt,
                    extractedFile.content,
                    extractedFile.encoding || null
                );
            }
        }
    }
    /**
     * generic script that retrieves the folder path from cache and updates the given metadata with it after retrieve
     *
     * @param {TYPE.MetadataTypeItem} metadata a single script activity definition
     */
    static setFolderPath(metadata) {
        try {
            metadata.r__folder_Path = cache.searchForField(
                'folder',
                metadata.category.id,
                'ID',
                'Path'
            );
            delete metadata.category;
        } catch (ex) {
            Util.logger.warn(
                ` - ${this.definition.type} '${metadata[this.definition.nameField]}' (${
                    metadata[this.definition.keyField]
                }): Could not find folder (${ex.message})`
            );
        }
    }
    /**
     * Asset-specific script that retrieves the folder ID from cache and updates the given metadata with it before deploy
     *
     * @param {TYPE.MetadataTypeItem} metadata a single item
     */
    static setFolderId(metadata) {
        metadata.category = {
            id: cache.searchForField('folder', metadata.r__folder_Path, 'Path', 'ID'),
        };
        delete metadata.r__folder_Path;
    }

    /**
     * helper for {@link Asset.preDeployTasks} that loads extracted code content back into JSON
     *
     * @param {TYPE.AssetItem} metadata a single asset definition
     * @param {string} deployDir directory of deploy files
     * @param {TYPE.AssetSubType} subType asset-subtype name
     * @param {string} [templateName] name of the template used to built defintion (prior applying templating)
     * @param {boolean} [fileListOnly] does not read file contents nor update metadata if true
     * @returns {Promise.<TYPE.CodeExtract[]>} fileList for templating (disregarded during deployment)
     */
    static async _mergeCode(metadata, deployDir, subType, templateName, fileListOnly = false) {
        const subtypeExtension = `.${this.definition.type}-${subType}-meta`;
        const fileList = [];
        let subDirArr;
        let readDirArr;
        // unfortunately, asset's key can contain spaces at beginning/end which can break the file system when folders are created with it
        const customerKey = metadata.customerKey.trim();
        switch (metadata.assetType.name) {
            case 'templatebasedemail': // message
            case 'htmlemail': {
                // message
                // this complex type always creates its own subdir per asset
                subDirArr = [this.definition.type, subType];
                readDirArr = [deployDir, ...subDirArr, templateName || customerKey];

                // metadata.views.html.content (mandatory)
                // the main content can be empty (=not set up yet) hence check if we did extract sth or else readFile() will print error msgs
                const fileName = 'views.html.content' + subtypeExtension;
                if (
                    (await File.pathExists(
                        File.normalizePath([...readDirArr, `${fileName}.html`])
                    )) &&
                    metadata.views.html
                ) {
                    if (!fileListOnly) {
                        metadata.views.html.content = await File.readFilteredFilename(
                            readDirArr,
                            fileName,
                            'html'
                        );
                    }

                    if (templateName) {
                        // to use this method in templating, store a copy of the info in fileList
                        fileList.push({
                            subFolder: [...subDirArr, customerKey],
                            fileName: fileName,
                            fileExt: 'html',
                            content: metadata.views.html.content,
                        });
                    }
                }

                // metadata.views.html.slots.<>.blocks.<>.content (optional)
                if (metadata?.views?.html?.slots) {
                    await this._mergeCode_slots(
                        'views.html.slots',
                        metadata.views.html.slots,
                        readDirArr,
                        subtypeExtension,
                        subDirArr,
                        fileList,
                        customerKey,
                        templateName,
                        fileListOnly
                    );
                }
                break;
            }
            case 'template': {
                // template-template
                // this complex type always creates its own subdir per asset
                subDirArr = [this.definition.type, subType];
                readDirArr = [deployDir, ...subDirArr, templateName || customerKey];
                const fileName = 'content' + subtypeExtension;

                const fileExtArr = ['html']; // eslint-disable-line no-case-declarations
                for (const ext of fileExtArr) {
                    if (
                        await File.pathExists(
                            File.normalizePath([...readDirArr, `${fileName}.${ext}`])
                        )
                    ) {
                        // the main content can be empty (=not set up yet) hence check if we did extract sth or else readFile() will print error msgs
                        if (!fileListOnly) {
                            metadata.content = await File.readFilteredFilename(
                                readDirArr,
                                fileName,
                                ext
                            );
                        }
                        if (templateName) {
                            // to use this method in templating, store a copy of the info in fileList
                            fileList.push({
                                subFolder: subDirArr,
                                fileName: fileName,
                                fileExt: ext,
                                content: metadata.content,
                            });
                        }
                        // break loop when found
                        break;
                    }
                }

                // metadata.slots.<>.blocks.<>.content (optional)
                if (metadata?.slots) {
                    await this._mergeCode_slots(
                        'slots',
                        metadata.slots,
                        readDirArr,
                        subtypeExtension,
                        subDirArr,
                        fileList,
                        customerKey,
                        templateName,
                        fileListOnly
                    );
                }

                break;
            }
            case 'textonlyemail': {
                // message
                // metadata.views.text.content
                subDirArr = [this.definition.type, subType];
                readDirArr = [deployDir, ...subDirArr];
                if (
                    await File.pathExists(
                        File.normalizePath([
                            ...readDirArr,
                            `${templateName || customerKey}${subtypeExtension}.html`,
                        ])
                    )
                ) {
                    // the main content can be empty (=not set up yet) hence check if we did extract sth or else readFile() will print error msgs
                    if (!fileListOnly) {
                        metadata.views.text.content = await File.readFilteredFilename(
                            readDirArr,
                            (templateName || customerKey) + subtypeExtension,
                            'html'
                        );
                    }
                    if (templateName) {
                        // to use this method in templating, store a copy of the info in fileList
                        fileList.push({
                            subFolder: subDirArr,
                            fileName: customerKey + subtypeExtension,
                            fileExt: 'html',
                            content: metadata.views.text.content,
                        });
                    }
                }
                break;
            }
            case 'webpage': {
                // asset
                // this complex type always creates its own subdir per asset
                subDirArr = [this.definition.type, subType];
                readDirArr = [deployDir, ...subDirArr, templateName || customerKey];

                // metadata.views.html.slots.<>.blocks.<>.content (optional) (pre & post 20222)
                if (metadata?.views?.html?.slots) {
                    await this._mergeCode_slots(
                        'views.html.slots',
                        metadata.views.html.slots,
                        readDirArr,
                        subtypeExtension,
                        subDirArr,
                        fileList,
                        customerKey,
                        templateName,
                        fileListOnly
                    );
                }

                // +++ old webpages / pre-2022 +++
                // metadata.views.html.content (mandatory)
                if (
                    (await File.pathExists(
                        File.normalizePath([
                            ...readDirArr,
                            `views.html.content${subtypeExtension}.html`,
                        ])
                    )) && // the main content can be empty (=not set up yet) hence check if we did extract sth or else readFile() will print error msgs
                    metadata.views?.html
                ) {
                    if (!fileListOnly) {
                        metadata.views.html.content = await File.readFilteredFilename(
                            readDirArr,
                            'views.html.content' + subtypeExtension,
                            'html'
                        );
                    }
                    if (templateName) {
                        // to use this method in templating, store a copy of the info in fileList
                        fileList.push({
                            subFolder: [...subDirArr, customerKey],
                            fileName: 'views.html.content' + subtypeExtension,
                            fileExt: 'html',
                            content: metadata.views.html.content,
                        });
                    }
                }

                // +++ new webpages / 2022+ +++
                // metadata.content
                if (
                    await File.pathExists(
                        File.normalizePath([...readDirArr, `content${subtypeExtension}.html`])
                    )
                ) {
                    // the main content can be empty (=not set up yet) hence check if we did extract sth or else readFile() will print error msgs
                    if (!fileListOnly) {
                        metadata.content = await File.readFilteredFilename(
                            readDirArr,
                            'content' + subtypeExtension,
                            'html'
                        );
                    }
                    if (templateName) {
                        // to use this method in templating, store a copy of the info in fileList
                        fileList.push({
                            subFolder: [...subDirArr, customerKey],
                            fileName: 'content' + subtypeExtension,
                            fileExt: 'html',
                            content: metadata.views.html.content,
                        });
                    }
                }

                break;
            }
            case 'buttonblock': // block - Button Block
            case 'freeformblock': // block
            case 'htmlblock': // block
            case 'icemailformblock': // block - Interactive Content Email Form
            case 'imageblock': // block - Image Block
            case 'textblock': // block
            case 'smartcaptureblock': // other
            case 'codesnippetblock': {
                // other
                // metadata.content
                subDirArr = [this.definition.type, subType];
                readDirArr = [deployDir, ...subDirArr];
                const fileExtArr = ['html', 'ssjs', 'amp']; // eslint-disable-line no-case-declarations
                for (const ext of fileExtArr) {
                    if (
                        await File.pathExists(
                            File.normalizePath([
                                ...readDirArr,
                                `${templateName || customerKey}${subtypeExtension}.${ext}`,
                            ])
                        )
                    ) {
                        // the main content can be empty (=not set up yet) hence check if we did extract sth or else readFile() will print error msgs
                        if (!fileListOnly) {
                            metadata.content = await File.readFilteredFilename(
                                readDirArr,
                                (templateName || customerKey) + subtypeExtension,
                                ext
                            );
                            if (ext === 'ssjs') {
                                metadata.content = `<script runat="server">\n${metadata.content}</script>`;
                            }
                        }
                        if (templateName) {
                            // to use this method in templating, store a copy of the info in fileList
                            fileList.push({
                                subFolder: subDirArr,
                                fileName: (templateName || customerKey) + subtypeExtension,
                                fileExt: ext,
                                content: metadata.content,
                            });
                        }
                        // break loop when found
                        break;
                    }
                }
                break;
            }
        }
        return fileList;
    }
    /**
     * helper for {@link Asset.preDeployTasks} that loads extracted code content back into JSON
     *
     * @param {string} prefix usually the customerkey
     * @param {object} metadataSlots metadata.views.html.slots or deeper slots.<>.blocks.<>.slots
     * @param {string[]} readDirArr directory of deploy files
     * @param {string} subtypeExtension asset-subtype name ending on -meta
     * @param {string[]} subDirArr directory of files w/o leading deploy dir
     * @param {object[]} fileList directory of files w/o leading deploy dir
     * @param {string} customerKey external key of template (could have been changed if used during templating)
     * @param {string} [templateName] name of the template used to built defintion (prior applying templating)
     * @param {boolean} [fileListOnly] does not read file contents nor update metadata if true
     * @returns {Promise.<void>} -
     */
    static async _mergeCode_slots(
        prefix,
        metadataSlots,
        readDirArr,
        subtypeExtension,
        subDirArr,
        fileList,
        customerKey,
        templateName,
        fileListOnly = false
    ) {
        for (const slot in metadataSlots) {
            if (Object.prototype.hasOwnProperty.call(metadataSlots, slot)) {
                const slotObj = metadataSlots[slot];
                // found slot
                if (slotObj.blocks) {
                    for (const block in slotObj.blocks) {
                        if (Object.prototype.hasOwnProperty.call(slotObj.blocks, block)) {
                            const fileName = `${prefix}.[${slot}-${block}]${subtypeExtension}`;
                            if (
                                await File.pathExists(
                                    File.normalizePath([
                                        ...readDirArr,
                                        'blocks',
                                        `${fileName}.html`,
                                    ])
                                )
                            ) {
                                // the main content can be empty (=not set up yet) hence check if we did extract sth or else readFile() will print error msgs
                                // if an extracted block was found, save it back into JSON
                                if (!fileListOnly) {
                                    slotObj.blocks[block].content = await File.readFilteredFilename(
                                        [...readDirArr, 'blocks'],
                                        fileName,
                                        'html'
                                    );
                                }
                                if (templateName) {
                                    // to use this method in templating, store a copy of the info in fileList
                                    fileList.push({
                                        subFolder: [...subDirArr, customerKey, 'blocks'],
                                        fileName: fileName,
                                        fileExt: 'html',
                                        content: slotObj.blocks[block].content,
                                    });
                                }
                            }
                            if (slotObj.blocks[block].slots) {
                                // * recursion: each block can have slots of its own
                                await this._mergeCode_slots(
                                    `${prefix}.[${slot}-${block}]`,
                                    slotObj.blocks[block].slots,
                                    readDirArr,
                                    subtypeExtension,
                                    subDirArr,
                                    fileList,
                                    customerKey,
                                    templateName
                                );
                            }
                        }
                    }
                }
            }
        }
    }
    /**
     * helper for {@link Asset.postRetrieveTasks} that finds code content in JSON and extracts it
     * to allow saving that separately and formatted
     *
     * @param {TYPE.AssetItem} metadata a single asset definition
     * @returns {TYPE.CodeExtractItem} { json: metadata, codeArr: object[], subFolder: string[] }
     */
    static _extractCode(metadata) {
        const codeArr = [];
        let subType;
        // unfortunately, asset's key can contain spaces at beginning/end which can break the file system when folders are created with it
        const customerKey = metadata.customerKey.trim();
        switch (metadata.assetType.name) {
            case 'templatebasedemail': // message-templatebasedemail
            case 'htmlemail': {
                // message-htmlemail
                // metadata.views.html.content (mandatory)
                if (metadata.views?.html?.content?.length) {
                    codeArr.push({
                        subFolder: null,
                        fileName: 'views.html.content',
                        fileExt: 'html',
                        content: metadata.views.html.content,
                    });
                    delete metadata.views.html.content;
                }

                // metadata.views.html.slots.<>.blocks.<>.content (optional)
                if (metadata.views?.html?.slots) {
                    this._extractCode_slots('views.html.slots', metadata.views.html.slots, codeArr);
                }

                return {
                    json: metadata,
                    codeArr: codeArr,
                    subFolder: [customerKey],
                };
            }
            case 'template': {
                // template-template
                // metadata.content
                const fileExt = 'html'; // eslint-disable-line no-case-declarations
                if (metadata?.content?.length) {
                    codeArr.push({
                        subFolder: null,
                        fileName: 'content',
                        fileExt: fileExt,
                        content: metadata.content,
                    });
                    delete metadata.content;
                }
                // metadata.slots.<>.blocks.<>.content (optional)
                if (metadata.slots) {
                    this._extractCode_slots('slots', metadata.slots, codeArr);
                }

                return {
                    json: metadata,
                    codeArr: codeArr,
                    subFolder: [customerKey],
                };
            }
            case 'textonlyemail': {
                // message-textonlyemail
                // metadata.views.text.content
                if (metadata.views?.text?.content?.length) {
                    codeArr.push({
                        subFolder: null,
                        fileName: customerKey,
                        fileExt: 'html',
                        content: metadata.views.text.content,
                    });
                    delete metadata.views.text.content;
                }
                return { json: metadata, codeArr: codeArr, subFolder: null };
            }
            case 'webpage': {
                // asset-webpage
                // metadata.views.html.content (pre & post 20222)
                if (metadata.views?.html?.content?.length) {
                    codeArr.push({
                        subFolder: null,
                        fileName: 'views.html.content',
                        fileExt: 'html',
                        content: metadata.views.html.content,
                    });
                    delete metadata.views.html.content;
                }

                // +++ old webpages / pre-2022 +++
                // metadata.views.html.slots.<>.blocks.<>.content (optional)
                if (metadata.views?.html?.slots) {
                    this._extractCode_slots('views.html.slots', metadata.views.html.slots, codeArr);
                }

                // +++ new webpages / 2022+ +++
                // metadata.content
                if (metadata?.content?.length) {
                    codeArr.push({
                        subFolder: null,
                        fileName: 'content',
                        fileExt: 'html',
                        content: metadata.content,
                    });
                    delete metadata.content;
                }
                return {
                    json: metadata,
                    codeArr: codeArr,
                    subFolder: [customerKey],
                };
            }
            case 'buttonblock': // block-buttonblock
            case 'freeformblock': // block-freeformblock
            case 'htmlblock': // block-htmlblock
            case 'icemailformblock': // block-icemailformblock - Interactive Content Email Form
            case 'imageblock': // block-imageblock - Image Block
            case 'textblock': // block-textblock
            case 'smartcaptureblock': // other-smartcaptureblock
            case 'codesnippetblock': {
                // other-codesnippetblock
                // metadata.content
                let fileExt;
                let content = metadata?.content;
                const ssjs = Util.getSsjs(metadata?.content);

                if (ssjs) {
                    fileExt = 'ssjs';
                    content = ssjs;
                } else if (
                    metadata.assetType.name === 'codesnippetblock' && // extracted code snippets should end on the right extension
                    content?.includes('%%[')
                ) {
                    fileExt = 'amp';
                } else {
                    fileExt = 'html';
                }
                if (content?.length) {
                    codeArr.push({
                        subFolder: null,
                        fileName: customerKey,
                        fileExt: fileExt,
                        content: content,
                    });
                    delete metadata.content;
                }
                return { json: metadata, codeArr: codeArr, subFolder: null };
            }
            default: {
                subType = this._getSubtype(metadata);
                if (!this.definition.binarySubtypes.includes(subType)) {
                    Util.logger.debug(
                        'not processed metadata.assetType.name: ' + metadata.assetType.name
                    );
                }
                return { json: metadata, codeArr: codeArr, subFolder: null };
            }
        }
    }
    /**
     * @param {string} prefix usually the customerkey
     * @param {object} metadataSlots metadata.views.html.slots or deeper slots.<>.blocks.<>.slots
     * @param {object[]} codeArr to be extended array for extracted code
     * @returns {void}
     */
    static _extractCode_slots(prefix, metadataSlots, codeArr) {
        for (const slot in metadataSlots) {
            if (Object.prototype.hasOwnProperty.call(metadataSlots, slot)) {
                const slotObj = metadataSlots[slot];
                // found slot
                for (const block in slotObj.blocks) {
                    if (Object.prototype.hasOwnProperty.call(slotObj.blocks, block)) {
                        if (slotObj.blocks[block].content) {
                            // found content block
                            const code = slotObj.blocks[block].content;
                            codeArr.push({
                                subFolder: ['blocks'],
                                fileName: `${prefix}.[${slot}-${block}]`,
                                fileExt: 'html',
                                content: code,
                            });
                            delete slotObj.blocks[block].content;
                        }
                        if (slotObj.blocks[block].slots) {
                            // * recursion: each block can have slots of its own
                            this._extractCode_slots(
                                `${prefix}.[${slot}-${block}]`,
                                slotObj.blocks[block].slots,
                                codeArr
                            );
                        }
                    }
                }
            }
        }
    }
    /**
     * Returns file contents mapped to their fileName without '.json' ending
     *
     * @param {string} dir directory that contains '.json' files to be read
     * @param {void} [_] unused parameter
     * @param {string[]} selectedSubType asset, message, ...
     * @returns {TYPE.MetadataTypeMap} fileName => fileContent map
     */
    static getJsonFromFS(dir, _, selectedSubType) {
        const fileName2FileContent = {};
        try {
            for (const subtype of this.definition.subTypes) {
                if (
                    selectedSubType &&
                    !selectedSubType.includes('asset-' + subtype) &&
                    !selectedSubType.includes('asset')
                ) {
                    continue;
                }
                const currentdir = File.normalizePath([dir, subtype]);
                if (File.pathExistsSync(currentdir)) {
                    const files = File.readdirSync(currentdir, { withFileTypes: true });

                    for (const dirent of files) {
                        try {
                            let thisDir = currentdir;
                            let fileName = dirent.name;
                            if (dirent.isDirectory()) {
                                // complex types with more than one extracted piece of code are saved in their
                                // own subfolder (with folder name = CustomerKey)
                                // this section aims to find that json in the subfolder
                                const subfolderFiles = File.readdirSync(
                                    File.normalizePath([currentdir, dirent.name])
                                );
                                for (const subFileName of subfolderFiles) {
                                    if (subFileName.endsWith('-meta.json')) {
                                        fileName = subFileName;
                                        thisDir = File.normalizePath([currentdir, dirent.name]);
                                    }
                                }
                            }
                            if (fileName.endsWith('-meta.json')) {
                                const fileContent = File.readJSONFile(
                                    thisDir,
                                    fileName,
                                    true,
                                    false
                                );
                                // subtype will change the metadata suffix length
                                const fileNameWithoutEnding = fileName.slice(
                                    0,
                                    -17 - subtype.length
                                );
                                fileName2FileContent[fileNameWithoutEnding] = fileContent;
                            }
                        } catch (ex) {
                            // by catching this in the loop we gracefully handle the issue and move on to the next file
                            Util.metadataLogger('debug', this.definition.type, 'getJsonFromFS', ex);
                        }
                    }
                }
            }
        } catch (ex) {
            // this will catch issues with readdirSync
            Util.metadataLogger('debug', this.definition.type, 'getJsonFromFS', ex);
            throw new Error(ex);
        }
        return fileName2FileContent;
    }
    /**
     * check template directory for complex types that open subfolders for their subtypes
     *
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string} templateName name of the metadata file
     * @returns {Promise.<TYPE.AssetSubType>} subtype name
     */
    static async findSubType(templateDir, templateName) {
        const typeDirArr = [this.definition.type];
        let subType;
        for (const st of this.definition.subTypes) {
            const fileNameFull = templateName + '.' + this.definition.type + `-${st}-meta.json`;
            if (
                (await File.pathExists(
                    File.normalizePath([templateDir, ...typeDirArr, st, fileNameFull])
                )) ||
                (await File.pathExists(
                    File.normalizePath([templateDir, ...typeDirArr, st, templateName, fileNameFull])
                ))
            ) {
                subType = st;
                break;
            }
        }
        if (!subType) {
            throw new Error(
                `Could not find asset with name ${templateName} in ${File.normalizePath([
                    templateDir,
                    ...typeDirArr,
                ])}`
            );
        }
        return subType;
    }
    /**
     * optional method used for some types to try a different folder structure
     *
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string[]} typeDirArr current subdir for this type
     * @param {string} templateName name of the metadata template
     * @param {string} fileName name of the metadata template file w/o extension
     * @returns {TYPE.AssetItem} metadata
     */
    static async readSecondaryFolder(templateDir, typeDirArr, templateName, fileName) {
        // handles subtypes that create 1 folder per asset -> currently causes the below File.ReadFile to error out
        typeDirArr.push(templateName);
        return await File.readFilteredFilename([templateDir, ...typeDirArr], fileName, 'json');
    }
    /**
     * should return only the json for all but asset, query and script that are saved as multiple files
     * additionally, the documentation for dataExtension and automation should be returned
     *
     * @param {string[]} keyArr customerkey of the metadata
     * @returns {string[]} list of all files that need to be committed in a flat array ['path/file1.ext', 'path/file2.ext']
     */
    static async getFilesToCommit(keyArr) {
        const basePath = File.normalizePath([
            this.properties.directories.retrieve,
            this.buObject.credential,
            this.buObject.businessUnit,
        ]);

        const fileList = (
            await Promise.all(
                keyArr.map(async (key) => {
                    // get subType, path an fileName by scanning the retrieve folder
                    let subType;
                    let filePath;
                    let fileName;
                    for (const st of this.definition.subTypes) {
                        fileName = `${key}.${this.definition.type}-${st}-meta.json`;
                        if (
                            await File.pathExists(
                                File.normalizePath([basePath, this.definition.type, st, fileName])
                            )
                        ) {
                            subType = st;
                            filePath = [basePath, this.definition.type, st];
                            break;
                        } else if (
                            await File.pathExists(
                                File.normalizePath([
                                    basePath,
                                    this.definition.type,
                                    st,
                                    key,
                                    fileName,
                                ])
                            )
                        ) {
                            subType = st;
                            filePath = [basePath, this.definition.type, st, key];
                            break;
                        }
                    }
                    if (
                        Array.isArray(filePath) &&
                        (await File.pathExists(File.normalizePath([...filePath, fileName])))
                    ) {
                        // #1 load json to be able to find extracted text files & binary files
                        const metadata = File.readJSONFile(filePath, fileName, true, false);
                        // #2 find all extracted text files
                        const fileListNested = (
                            await this._mergeCode(metadata, basePath, subType, metadata.customerKey)
                        ).map((item) =>
                            File.normalizePath([
                                basePath,
                                ...item.subFolder,
                                `${item.fileName}.${item.fileExt}`,
                            ])
                        );
                        const response = [
                            File.normalizePath([...filePath, fileName]),
                            ...fileListNested,
                        ];
                        // #3 get binary file
                        const binaryFilePath = await this._readExtendedFileFromFS(
                            metadata,
                            subType,
                            basePath,
                            false
                        );
                        if (binaryFilePath) {
                            response.push(binaryFilePath);
                        }

                        return response;
                    } else {
                        return [];
                    }
                })
            )
        ).flat();
        return fileList;
    }
    /**
     * helper to allow us to select single metadata entries via REST
     *
     * @private
     * @param {string} key customer key
     * @returns {Promise.<string>} objectId or enpty string
     */
    static async _getObjectIdForSingleRetrieve(key) {
        const name = key.startsWith('name:') ? key.slice(5) : null;
        const filter = name
            ? '?$filter=name%20eq%20' + encodeURIComponent(name)
            : '?$filter=customerKey%20eq%20' + encodeURIComponent(key);

        const results = await this.client.rest.get('/asset/v1/content/assets/' + filter);
        const items = results?.items || [];
        const found = items.find((item) =>
            name ? item[this.definition.nameField] === name : item[this.definition.keyField] === key
        );
        return found?.id || null;
    }

    /**
     * Delete a metadata item from the specified business unit
     *
     * @param {string} customerKey Identifier of data extension
     * @returns {Promise.<boolean>} deletion success flag
     */
    static async deleteByKey(customerKey) {
        // delete only works with the query's object id
        const objectId = customerKey ? await this._getObjectIdForSingleRetrieve(customerKey) : null;
        if (!objectId) {
            Util.logger.error(` - ${this.definition.type} not found`);
            return false;
        }
        return super.deleteByKeyREST('/asset/v1/content/assets/' + objectId, customerKey);
    }

    /**
     * clean up after deleting a metadata item
     * cannot use the generic method due to the complexity of how assets are saved to disk
     *
     * @param {string} customerKey Identifier of metadata item
     * @returns {void}
     */
    static async postDeleteTasks(customerKey) {
        const fileArr = await this.getFilesToCommit([customerKey]);

        // check if asset sits in its own folder
        const ownFolderIndex =
            fileArr[0].indexOf(customerKey + '\\') > 0
                ? fileArr[0].indexOf(customerKey + '\\')
                : fileArr[0].indexOf(customerKey + '/');
        if (ownFolderIndex > 0) {
            fileArr.push(fileArr[0].slice(0, ownFolderIndex + customerKey.length));
        }

        for (const filePath of fileArr) {
            await File.remove(filePath);
        }
    }
    /**
     * get name & key for provided id
     *
     * @param {string} id Identifier of metadata
     * @returns {Promise.<{key:string, name:string, path:string}>} key, name and path of metadata; null if not found
     */
    static async resolveId(id) {
        const uri = '/asset/v1/content/assets/query';
        const payload = {
            query: {
                property: 'id',
                simpleOperator: 'equal',
                value: id,
            },
        };
        const response = await this.client.rest.post(uri, payload);
        if (response.items.length === 1) {
            const item = response.items[0];
            const subType = this._getMainSubtype(item.assetType.name);
            // find path for code of content block, fall back to json if not found; undefined if not even the json exists
            const pathBase1 = `./retrieve/${this.buObject.credential}/${this.buObject.businessUnit}/${this.definition.type}/${subType}/${item[this.definition.keyField]}.${this.definition.type}-${subType}-meta.`;
            const pathBase2 = `./retrieve/${this.buObject.credential}/${this.buObject.businessUnit}/${this.definition.type}/${subType}/${item[this.definition.keyField]}/${item[this.definition.keyField]}.${this.definition.type}-${subType}-meta.`;
            const paths = [];
            for (const ext of ['html', 'ssjs', 'amp', 'json']) {
                paths.push(pathBase1 + ext, pathBase2 + ext);
            }
            const path = paths.find((p) => File.pathExistsSync(p));

            // prep response object
            const json = {
                key: item[this.definition.keyField],
                name: item[this.definition.nameField],
                path: path,
            };
            if (Util.OPTIONS.json) {
                // for automated processing by VSCode extension, optionally print the json
                if (Util.OPTIONS.loggerLevel !== 'error') {
                    console.log(JSON.stringify(json, null, 2)); // eslint-disable-line no-console
                }
            } else {
                Util.logger.info(
                    ` - ${this.definition.type}-${subType} found: ${item[this.definition.keyField]} (${item[this.definition.nameField]})`
                );
                Util.logger.info(' - link: ' + path);
            }
            return json;
        } else {
            if (Util.OPTIONS.json) {
                return null;
            }
            Util.logger.error(` - ${this.definition.type} with id ${id} not found on BU`);
            return null;
        }
    }
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';

Asset.definition = MetadataTypeDefinitions.asset;

export default Asset;
