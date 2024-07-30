'use strict';

import MetadataType from './MetadataType.js';
import { Util } from '../util/util.js';
import File from '../util/file.js';
import pLimit from 'p-limit';
import cliProgress from 'cli-progress';
import cache from '../util/cache.js';
import TriggeredSend from './TriggeredSend.js';
import Folder from './Folder.js';
import ReplaceCbReference from '../util/replaceContentBlockReference.js';

/**
 * @typedef {import('../../types/mcdev.d.js').BuObject} BuObject
 * @typedef {import('../../types/mcdev.d.js').CodeExtract} CodeExtract
 * @typedef {import('../../types/mcdev.d.js').CodeExtractItem} CodeExtractItem
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItem} MetadataTypeItem
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItemDiff} MetadataTypeItemDiff
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMap} MetadataTypeMap
 * @typedef {import('../../types/mcdev.d.js').SoapRequestParams} SoapRequestParams
 * @typedef {import('../../types/mcdev.d.js').TemplateMap} TemplateMap
 * @typedef {import('../../types/mcdev.d.js').TypeKeyCombo} TypeKeyCombo
 */
/**
 * @typedef {import('../../types/mcdev.d.js').AssetSubType} AssetSubType
 * @typedef {import('../../types/mcdev.d.js').AssetMap} AssetMap
 * @typedef {import('../../types/mcdev.d.js').AssetItem} AssetItem
 * @typedef {import('../../types/mcdev.d.js').AssetRequestParams} AssetRequestParams
 */

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
     * @param {void | string[]} _ unused parameter
     * @param {string[]} [subTypeArr] optionally limit to a single AssetSubType
     * @param {string} [key] customer key
     * @param {boolean} [loadShared] optionally retrieve assets from other BUs that were shared with the current
     * @returns {Promise.<{metadata: AssetMap, type: string}>} Promise
     */
    static async retrieve(retrieveDir, _, subTypeArr, key, loadShared = false) {
        const items = [];
        if (subTypeArr) {
            // check if elements in subTypeArr exist in this.definition.subTypes
            const invalidSubTypes = subTypeArr.filter(
                (subType) => !this.definition.subTypes.includes(subType)
            );
            if (invalidSubTypes.length) {
                throw new Error(`Invalid subType(s) found: ${invalidSubTypes.join(', ')}`);
            }
        }
        subTypeArr ||= this._getSubTypes();
        if (retrieveDir) {
            await File.initPrettier();
        }
        if (retrieveDir && !cache.getCache()?.asset) {
            // cache this for 3 reasons:
            //  1) subtypes asset, message and template reference other content blocks by id/key/objectId as part of their views
            //  2) subtype message references a template if it is template-based
            //  3) all non-binary subtypes support ampscript / ssjs which can load otherc content blocks via ContentBlockyByX()

            Util.logger.info(' - Caching dependent Metadata: asset');
            const resultLocal = await this.retrieveForCache(
                undefined,
                this.definition.selflinkedSubTypes,
                undefined,
                false
            );
            cache.mergeMetadata('asset', resultLocal.metadata);
            Util.logger.info(' - Caching dependent Metadata: shared asset');
            const resultShared = await this.retrieveForCache(
                undefined,
                this.definition.selflinkedSubTypes,
                undefined,
                true
            );
            cache.mergeMetadata('asset', resultShared.metadata);
        }
        if (retrieveDir) {
            if (key) {
                // retrieve by key/id/name
                items.push(
                    ...(await this.requestSubType(null, retrieveDir, key, null, loadShared))
                );
            } else {
                // retrieve all
                // loop through subtypes and return results of each subType for caching (saving is handled per subtype)
                for (const subType of subTypeArr) {
                    // each subtype contains multiple different specific types (images contains jpg and png for example)
                    // we use await here to limit the risk of too many concurrent api requests at time
                    items.push(
                        ...(await this.requestSubType(subType, retrieveDir, key, null, loadShared))
                    );
                }
            }
        } else {
            // caching
            items.push(...(await this.requestSubType(subTypeArr, null, null, null, loadShared)));
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
     * @param {void | string[]} [_] parameter not used
     * @param {string[]} [subTypeArr] optionally limit to a single subtype
     * @param {void | string} [__] parameter not used
     * @param {boolean} [loadShared] optionally retrieve assets from other BUs that were shared with the current
     * @returns {Promise.<{metadata: AssetMap, type: string}>} Promise
     */
    static retrieveForCache(_, subTypeArr, __, loadShared = false) {
        return this.retrieve(null, null, subTypeArr, undefined, loadShared);
    }

    /**
     * Retrieves asset metadata for templating
     *
     * @param {string} templateDir Directory where retrieved metadata directory will be saved
     * @param {string} name name of the metadata file
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @param {AssetSubType} [selectedSubType] optionally limit to a single subtype
     * @returns {Promise.<{metadata: AssetItem, type: string}>} Promise
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
                ...(await this.requestSubType(
                    subType,
                    templateDir,
                    'name:' + name,
                    templateVariables
                ))
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
     * @returns {string[]} AssetSubType array
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
     * @param {AssetItem} metadata a single asset
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
     * @param {AssetItem} metadata a single asset
     * @returns {Promise} Promise
     */
    static update(metadata) {
        const uri = '/asset/v1/content/assets/' + metadata.id;
        return super.updateREST(metadata, uri);
    }
    /**
     * Retrieves Metadata of a specific asset type
     *
     * @param {string|string[]} subType group of similar assets to put in a folder (ie. images)
     * @param {string} [retrieveDir] target directory for saving assets
     * @param {string} [key] key/id/name to filter by
     * @param {TemplateMap} [templateVariables] variables to be replaced in the metadata
     * @param {boolean} [loadShared] optionally retrieve assets from other BUs that were shared with the current
     * @returns {Promise.<object[]>} Promise
     */
    static async requestSubType(subType, retrieveDir, key, templateVariables, loadShared = false) {
        const subTypeArr = Array.isArray(subType) ? subType : [subType];
        if (retrieveDir) {
            if (Array.isArray(subType)) {
                throw new TypeError(
                    'requestSubType should not be called with multiple subtypes when retrieving to disk.'
                );
            } else if (!key) {
                Util.logger.info(`- Retrieving Subtype: ${subType}`);
            }
        } else {
            // in this mode we can accept arrays because we don't need to save this to a subtype folder but just want the records
            Util.logSubtypes(subTypeArr);
        }
        /** @type {AssetSubType[]} */
        const extendedSubTypeArr = key
            ? [null]
            : subTypeArr.flatMap((subType) => this.definition.extendedSubTypes[subType]);
        // the API can only assetType.ids at a time or else will throw: "DbUtility.GetPagedCollection passing through non-timeout DB error (30001)"
        const subtypeIdsList = key
            ? [null]
            : Util.chunk(
                  extendedSubTypeArr?.map(
                      (subTypeItemName) => this.definition.typeMapping[subTypeItemName]
                  ),
                  50
              );
        const uri = '/asset/v1/content/assets/query' + (loadShared ? '?scope=shared' : '');
        /** @type {AssetRequestParams} */
        const payload = {
            page: {
                page: 1,
                pageSize: 50,
            },
            query: null,
            fields: [
                'category',
                'createdDate',
                'createdBy',
                'modifiedDate',
                'modifiedBy',
                'objectID',
            ], // get folder to allow duplicate name check against cache
        };
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

        let items = [];

        for (const subtypeIds of subtypeIdsList) {
            if (key) {
                if (key.startsWith('id:')) {
                    payload.query = {
                        property: this.definition.idField,
                        simpleOperator: 'equal',
                        value: key.slice(3),
                    };
                } else if (key.startsWith('name:')) {
                    payload.query = {
                        property: this.definition.nameField,
                        simpleOperator: 'equal',
                        value: key.slice(5),
                    };
                } else {
                    payload.query = {
                        property: this.definition.keyField,
                        simpleOperator: 'equal',
                        value: key,
                    };
                }
            } else {
                payload.query = {
                    property: 'assetType.id',
                    simpleOperator: 'in',
                    value: subtypeIds,
                };
                // payload.sort = [{ property: 'id', direction: 'ASC' }];
            }
            // for caching we do not need these fields
            let moreResults = false;
            let lastPage = 0;
            do {
                payload.page.page = lastPage + 1;
                const response = await this.client.rest.post(uri, payload);
                if (response?.items?.length) {
                    // sometimes the api will return a payload without items
                    // --> ensure we only add proper items-arrays here
                    items = items.concat(response.items);
                    if (key && subType === null) {
                        subType = this.#getMainSubtype(response?.items[0].assetType.name);
                    }
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
        }

        // only when we save results do we need the complete metadata or files. caching can skip these
        if (retrieveDir && !Array.isArray(subType)) {
            if (items.length > 0) {
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
            }
            // always show the summary even if we already had the progress bar in the console
            Util.logger.info(`  Downloaded asset-${subType}: ${items.length}`);
        }

        return items;
    }
    /**
     * Retrieves extended metadata (files or extended content) of asset
     *
     * @param {Array} items array of items to retrieve
     * @param {string} subType group of similar assets to put in a folder (ie. images)
     * @param {string} retrieveDir target directory for saving assets
     * @param {TemplateMap} [templateVariables] variables to be replaced in the metadata
     * @returns {Promise.<MetadataTypeMap>} Promise
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
                    '                 Downloading [{bar}] {percentage}% | {value}/{total} | asset-' +
                    subType,
            },
            cliProgress.Presets.shades_classic
        );

        const completed = [];
        const failed = [];
        const metadataMap = {};

        // put in do loop to manage issues with connection timeout
        do {
            // use promise execution limiting to avoid rate limits on api, but speed up execution
            // start the progress bar with a total value of 200 and start value of 0
            extendedBar.start(items.length - completed.length, 0);
            try {
                const rateLimit = pLimit(5);

                const promiseMap = await Promise.all(
                    items.map((item, index) =>
                        rateLimit(async () => {
                            const metadataMapSaveSingle = {};

                            // this is a file so extended is at another endpoint
                            if (item?.fileProperties?.extension && !completed.includes(item.id)) {
                                try {
                                    // retrieving the extended file does not need to be awaited
                                    await this._retrieveExtendedFile(item, subType, retrieveDir);
                                } catch (ex) {
                                    failed.push({ item: item, error: ex });
                                }
                                // still return even if extended failed
                                metadataMap[item.customerKey] = item;
                                // even if the extended file failed, still save the metadata
                                metadataMapSaveSingle[item.customerKey] = item;
                            }
                            // this is a complex type which stores data in the asset itself
                            else if (!completed.includes(item.id)) {
                                try {
                                    const extendedItem = await this.client.rest.get(
                                        'asset/v1/content/assets/' + item.id
                                    );
                                    // only return the metadata if we have extended content
                                    metadataMap[item.customerKey] = extendedItem;
                                    // only save the metadata if we have extended content
                                    metadataMapSaveSingle[item.customerKey] = extendedItem;
                                    // overwrite the original item with the extended content to ensure retrieve() returns it
                                    items[index] = extendedItem;
                                } catch (ex) {
                                    failed.push({ item: item, error: ex });
                                }
                            }
                            completed.push(item.id);
                            if (metadataMapSaveSingle[item.customerKey]) {
                                await this.saveResults(
                                    metadataMapSaveSingle,
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
        return metadataMap;
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
     * @param {AssetItem} metadata a single asset
     * @param {string} subType group of similar assets to put in a folder (ie. images)
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
     * @param {AssetItem} metadata a single asset
     * @param {string} subType group of similar assets to put in a folder (ie. images)
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
     * @param {AssetItem} metadata a single asset
     * @returns {CodeExtractItem} metadata
     */
    static postRetrieveTasks(metadata) {
        // folder
        this.setFolderPath(metadata);

        // template-based emails
        if (metadata.assetType.name === 'templatebasedemail') {
            // get template
            try {
                if (metadata.views?.html?.template?.id) {
                    metadata.views.html.template.r__asset_key = cache.searchForField(
                        'asset',
                        metadata.views?.html?.template?.id,
                        'id',
                        'customerKey'
                    );
                    delete metadata.views.html.template.id;
                    delete metadata.views.html.template.name;
                    delete metadata.views.html.template.assetType;
                    delete metadata.views.html.template.availableViews;
                    delete metadata.views.html.template.data;
                    delete metadata.views.html.template.modelVersion;
                }
            } catch {
                Util.logger.warn(
                    ` - ${this.definition.type} '${metadata[this.definition.nameField]}' (${
                        metadata[this.definition.keyField]
                    }): Could not find email template with id (${metadata.views.html.template.id})`
                );
            }
        }

        // extract HTML for selected subtypes and convert payload for easier processing in MetadataType.saveResults()
        return this._extractCode(metadata);
    }

    /**
     * Gets executed after deployment of metadata type
     *
     * @param {MetadataTypeMap} metadata metadata mapped by their keyField
     * @param {MetadataTypeMap} _ originalMetadata to be updated (contains additioanl fields)
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
     * @param {MetadataTypeMap} metadata metadata mapped by their keyField
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
     * @param {AssetItem} metadata a single asset
     * @param {string} deployDir directory of deploy files
     * @returns {Promise.<AssetItem>} Promise
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

        // template-based emails
        if (
            metadata.assetType.name === 'templatebasedemail' &&
            metadata.views?.html?.template?.r__asset_key
        ) {
            // template
            metadata.views.html.template.id = cache.searchForField(
                'asset',
                metadata.views.html.template.r__asset_key,
                'customerKey',
                'id'
            );
            metadata.views.html.template.name = cache.searchForField(
                'asset',
                metadata.views.html.template.r__asset_key,
                'customerKey',
                'name'
            );
            metadata.views.html.template.assetType = {
                id: 4,
                name: 'template',
                displayName: 'Template',
            };

            metadata.views.html.template.data = {
                email: { options: { generateFrom: null } },
            };

            metadata.views.html.template.availableViews = [];
            metadata.views.html.template.modelVersion = 2;
            delete metadata.views.html.template.r__asset_key;
        }

        // restore asset type id which is needed for deploy
        metadata.assetType.id = this.definition.typeMapping[metadata.assetType.name];

        // define asset's subtype
        const subType = this._getSubtype(metadata);

        // #0 format blocks in slots for deployment
        await this._preDeployTasksBocks(metadata);

        // #1 get text extracts back into the JSON
        await this._mergeCode(metadata, deployDir, subType);

        // #2 get file from local disk and insert as base64
        await this._readExtendedFileFromFS(metadata, subType, deployDir);

        // only execute #3 if we are deploying / copying from one BU to another, not while using mcdev as a developer tool
        if (
            Util.OPTIONS.autoMidSuffix &&
            this.buObject.mid &&
            metadata.memberId != this.buObject.mid && // soft comparison to accomodate for string-version of mid
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
        if (!Util.OPTIONS.matchName) {
            // #4 make sure the name is unique
            const assetCache = cache.getCache()[this.definition.type];
            const namesInFolder = Object.keys(assetCache)
                .filter((key) => assetCache[key].category.id === metadata.category.id)
                .map((key) => ({
                    type: this.#getMainSubtype(assetCache[key].assetType.name),
                    key: key,
                    name: assetCache[key].name,
                }));
            // if the name is already in the folder for a different key, add a number to the end
            metadata[this.definition.nameField] = this._findUniqueName(
                metadata[this.definition.keyField],
                metadata[this.definition.nameField],
                this.#getMainSubtype(metadata.assetType.name),
                namesInFolder
            );
        }
        return metadata;
    }
    /**
     * find the subType matching the extendedSubType
     *
     * @param {string} extendedSubType webpage, htmlblock, etc
     * @returns {string} subType: block, message, other, etc
     */
    static #getMainSubtype(extendedSubType) {
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
     * @param {{ type: string; key: string; name: any; }[]} namesInFolder names of the assets in the same folder
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
     * @param {AssetItem} metadata a single asset
     * @returns {string} subtype
     */
    static _getSubtype(metadata) {
        for (const sub in this.definition.extendedSubTypes) {
            if (this.definition.extendedSubTypes[sub].includes(metadata.assetType.name)) {
                return sub;
            }
        }
        return;
    }
    /**
     * helper for {@link MetadataType.buildDefinition}
     * handles extracted code if any are found for complex types
     *
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string} targetDir Directory where built definitions will be saved
     * @param {AssetItem} metadata main JSON file that was read from file system
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @param {string} templateName name of the template to be built
     * @returns {Promise.<string[][]>} list of extracted files with path-parts provided as an array
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
     * @param {AssetItem} metadata main JSON file that was read from file system
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @param {string} templateName name of the template to be built
     * @returns {Promise.<string[][]>} list of extracted files with path-parts provided as an array
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
     * @param {string|string[]} targetDir (List of) Directory where built definitions will be saved
     * @param {AssetItem} metadata main JSON file that was read from file system
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @param {string} templateName name of the template to be built
     * @param {'definition'|'template'} mode defines what we use this helper for
     * @returns {Promise.<string[][]>} list of extracted files with path-parts provided as an array
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
        metadata = structuredClone(metadata);

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

            // apply templating to subfolders
            extractedFile.subFolder = extractedFile.subFolder
                .map((el) => (el === templateName ? metadata[this.definition.keyField] : el))
                .map((el) => this.applyTemplateValues(el, templateVariables));

            // apply templating to filenames of extracted code
            extractedFile.fileName = extractedFile.fileName
                .split('.')
                .map((el) => (el === templateName ? metadata[this.definition.keyField] : el))
                .join('.');
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
        const nestedFilePaths = [];

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
                nestedFilePaths.push([
                    File.normalizePath([targetDir, ...extractedFile.subFolder]),
                    extractedFile.fileName +
                        '.' +
                        this.definition.type +
                        '-meta.' +
                        extractedFile.fileExt,
                ]);
            }
        }
        return nestedFilePaths;
    }
    /**
     * generic script that retrieves the folder path from cache and updates the given metadata with it after retrieve
     *
     * @param {MetadataTypeItem} metadata a single script activity definition
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
     * @param {MetadataTypeItem} metadata a single item
     */
    static setFolderId(metadata) {
        if (!metadata.r__folder_Path) {
            throw new Error(
                `Dependent folder could not be found because r__folder_Path is not set`
            );
        }
        metadata.category = {
            id: cache.getFolderId(metadata.r__folder_Path),
        };
        delete metadata.r__folder_Path;
    }

    /**
     * helper for {@link Asset.preDeployTasks} that loads extracted code content back into JSON
     *
     * @param {AssetItem} metadata a single asset definition
     * @returns {Promise.<void>} fileList for templating (disregarded during deployment)
     */
    static async _preDeployTasksBocks(metadata) {
        switch (metadata.assetType.name) {
            case 'templatebasedemail': // message
            case 'htmlemail':
            case 'webpage': {
                // metadata.views.html.slots.<>.blocks.<>.content (optional)
                if (metadata?.views?.html?.slots) {
                    await this._preDeployTasksBocks_slots(metadata.views.html.slots);
                }
                break;
            }
            case 'template': {
                // metadata.slots.<>.blocks.<>.content (optional)
                if (metadata?.slots) {
                    await this._preDeployTasksBocks_slots(metadata.slots);
                }

                break;
            }
        }
    }
    /**
     * helper for {@link Asset.preDeployTasks} that loads extracted code content back into JSON
     *
     * @param {object} metadataSlots metadata.views.html.slots or deeper slots.<>.blocks.<>.slots
     * @returns {Promise.<void>} -
     */
    static async _preDeployTasksBocks_slots(metadataSlots) {
        for (const slot in metadataSlots) {
            if (Object.prototype.hasOwnProperty.call(metadataSlots, slot)) {
                const slotObj = metadataSlots[slot];
                // found slot
                if (slotObj.blocks) {
                    for (const block in slotObj.blocks) {
                        if (Object.prototype.hasOwnProperty.call(slotObj.blocks, block)) {
                            const asset = slotObj.blocks[block];
                            if (asset.r__asset_key) {
                                // by only running the following if r__asset_key was set, we simply skip anything that wasnt resolved during retrieve
                                asset.customerKey = asset.r__asset_key;
                                asset.id = cache.searchForField(
                                    'asset',
                                    asset.r__asset_key,
                                    'customerKey',
                                    'id'
                                );
                                asset.objectID = cache.searchForField(
                                    'asset',
                                    asset.r__asset_key,
                                    'customerKey',
                                    'objectID'
                                );
                                delete asset.r__asset_key;
                                asset.thumbnail = {
                                    thumbnailUrl: '/v1/assets/' + asset.id + '/thumbnail',
                                };

                                this.setFolderId(asset);
                            }
                            await this._preDeployTasksBocks(asset);
                        }
                    }
                }
            }
        }
    }

    /**
     * helper for {@link Asset.preDeployTasks} that loads extracted code content back into JSON
     *
     * @param {AssetItem} metadata a single asset definition
     * @param {string} deployDir directory of deploy files
     * @param {string} subType asset-subtype name; full list in AssetSubType
     * @param {string} [templateName] name of the template used to built defintion (prior applying templating)
     * @param {boolean} [fileListOnly] does not read file contents nor update metadata if true
     * @returns {Promise.<CodeExtract[]>} fileList for templating (disregarded during deployment)
     */
    static async _mergeCode(metadata, deployDir, subType, templateName, fileListOnly = false) {
        const subtypeExtension = `.${this.definition.type}-${subType}-meta`;
        const fileList = [];
        let subDirArr;
        let readDirArr;
        // unfortunately, asset's key can contain spaces at beginning/end which can break the file system when folders are created with it
        const customerKey = metadata.customerKey.trim();
        const templateFileName = templateName || customerKey;
        switch (metadata.assetType.name) {
            case 'templatebasedemail': // message
            case 'htmlemail': {
                // message
                // this complex type always creates its own subdir per asset
                subDirArr = [this.definition.type, subType];
                readDirArr = [deployDir, ...subDirArr, templateFileName];

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
                            subFolder: [...subDirArr, templateFileName],
                            fileName: fileName,
                            fileExt: 'html',
                            content: metadata.views.html.content,
                        });
                    }
                }
                // metadata.views.html.content (optional)
                // the main content can be empty (=not set up yet) hence check if we did extract sth or else readFile() will print error msgs
                const fileNamePreheader = 'views.preheader.content' + subtypeExtension;
                if (
                    (await File.pathExists(
                        File.normalizePath([...readDirArr, `${fileNamePreheader}.amp`])
                    )) &&
                    metadata.views.preheader
                ) {
                    if (!fileListOnly) {
                        metadata.views.preheader.content = await File.readFilteredFilename(
                            readDirArr,
                            fileNamePreheader,
                            'amp'
                        );
                    }

                    if (templateName) {
                        // to use this method in templating, store a copy of the info in fileList
                        fileList.push({
                            subFolder: [...subDirArr, templateFileName],
                            fileName: fileNamePreheader,
                            fileExt: 'amp',
                            content: metadata.views.preheader.content,
                        });
                    }
                }

                // metadata.views.text.content (optional)
                // the main content can be empty (=not set up yet) hence check if we did extract sth or else readFile() will print error msgs
                const fileNameText = 'views.text.content' + subtypeExtension;
                if (
                    (await File.pathExists(
                        File.normalizePath([...readDirArr, `${fileNameText}.amp`])
                    )) &&
                    metadata.views.text
                ) {
                    if (!fileListOnly) {
                        metadata.views.text.content = await File.readFilteredFilename(
                            readDirArr,
                            fileNameText,
                            'amp'
                        );
                    }

                    if (templateName) {
                        // to use this method in templating, store a copy of the info in fileList
                        fileList.push({
                            subFolder: [...subDirArr, templateFileName],
                            fileName: fileNameText,
                            fileExt: 'amp',
                            content: metadata.views.text.content,
                        });
                    }
                } else if (metadata.views.text) {
                    // ensure the text version gets generated from html
                    metadata.views.text.data = {
                        email: {
                            options: {
                                generateFrom: 'html',
                            },
                        },
                    };
                    metadata.views.text.generateFrom = 'html';
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
                readDirArr = [deployDir, ...subDirArr, templateFileName];
                const fileName = 'content' + subtypeExtension;

                const fileExtArr = ['html'];
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
                                subFolder: [...subDirArr, templateFileName],
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
                            `${templateFileName}${subtypeExtension}.amp`,
                        ])
                    )
                ) {
                    // the main content can be empty (=not set up yet) hence check if we did extract sth or else readFile() will print error msgs
                    if (!fileListOnly) {
                        metadata.views.text.content = await File.readFilteredFilename(
                            readDirArr,
                            templateFileName + subtypeExtension,
                            'amp'
                        );
                    }
                    if (templateName) {
                        // to use this method in templating, store a copy of the info in fileList
                        fileList.push({
                            subFolder: subDirArr,
                            fileName: templateFileName + subtypeExtension,
                            fileExt: 'amp',
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
                readDirArr = [deployDir, ...subDirArr, templateFileName];

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
                            subFolder: [...subDirArr, templateFileName],
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
                            subFolder: [...subDirArr, templateFileName],
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
                const fileExtArr = ['html', 'ssjs', 'amp'];
                for (const ext of fileExtArr) {
                    if (
                        await File.pathExists(
                            File.normalizePath([
                                ...readDirArr,
                                `${templateFileName}${subtypeExtension}.${ext}`,
                            ])
                        )
                    ) {
                        // the main content can be empty (=not set up yet) hence check if we did extract sth or else readFile() will print error msgs
                        if (!fileListOnly) {
                            metadata.content = await File.readFilteredFilename(
                                readDirArr,
                                templateFileName + subtypeExtension,
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
                                fileName: templateFileName + subtypeExtension,
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
        const templateFileName = templateName || customerKey;

        for (const slot in metadataSlots) {
            if (Object.prototype.hasOwnProperty.call(metadataSlots, slot)) {
                const slotObj = metadataSlots[slot];
                // found slot
                if (slotObj.blocks) {
                    for (const block in slotObj.blocks) {
                        if (Object.prototype.hasOwnProperty.call(slotObj.blocks, block)) {
                            const asset = slotObj.blocks[block];
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
                                    asset.content = await File.readFilteredFilename(
                                        [...readDirArr, 'blocks'],
                                        fileName,
                                        'html'
                                    );
                                }
                                if (templateName) {
                                    // to use this method in templating, store a copy of the info in fileList
                                    fileList.push({
                                        subFolder: [...subDirArr, templateFileName, 'blocks'],
                                        fileName: fileName,
                                        fileExt: 'html',
                                        content: asset.content,
                                    });
                                }
                            }
                            if (asset.slots) {
                                // * recursion: each block can have slots of its own
                                await this._mergeCode_slots(
                                    `${prefix}.[${slot}-${block}]`,
                                    asset.slots,
                                    readDirArr,
                                    subtypeExtension,
                                    subDirArr,
                                    fileList,
                                    customerKey,
                                    templateName,
                                    fileListOnly
                                );
                            } else if (asset?.views?.html?.slots) {
                                // * recursion: each block can have slots of its own
                                await this._mergeCode_slots(
                                    `${prefix}.[${slot}-${block}]`,
                                    asset.views.html.slots,
                                    readDirArr,
                                    subtypeExtension,
                                    subDirArr,
                                    fileList,
                                    customerKey,
                                    templateName,
                                    fileListOnly
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
     * @param {AssetItem} metadata a single asset definition
     * @returns {CodeExtractItem} { json: metadata, codeArr: object[], subFolder: string[] }
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
                // metadata.views.preheader.content (optional)
                if (metadata.views?.preheader?.content?.length) {
                    codeArr.push({
                        subFolder: null,
                        fileName: 'views.preheader.content',
                        fileExt: 'amp',
                        content: metadata.views.preheader.content,
                    });
                    delete metadata.views.preheader.content;
                }

                // metadata.views.text.content (optional)
                if (metadata.views?.text?.content?.length) {
                    codeArr.push({
                        subFolder: null,
                        fileName: 'views.text.content',
                        fileExt: 'amp',
                        content: metadata.views.text.content,
                    });
                    delete metadata.views.text.content;
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
                const fileExt = 'html';
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
                        fileExt: 'amp',
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
     * helper for {@link Asset.postRetrieveTasks} via {@link Asset._extractCode}
     *
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
                        const asset = slotObj.blocks[block];
                        if (asset.content) {
                            // found content block
                            const code = asset.content;
                            codeArr.push({
                                subFolder: ['blocks'],
                                fileName: `${prefix}.[${slot}-${block}]`,
                                fileExt: 'html',
                                content: code,
                            });
                            delete asset.content;
                        }
                        // clean up fields from the other content block
                        if (asset.id) {
                            try {
                                asset.r__asset_key = cache.searchForField(
                                    'asset',
                                    asset.id,
                                    'id',
                                    'customerKey'
                                );
                                // only delete this if we found the asset in cache, otherwise ignore
                                delete asset.id;
                                delete asset.objectID;
                                delete asset.customerKey;
                                delete asset.thumbnail;
                            } catch {
                                Util.logger.debug(
                                    ` - asset id:${asset.id} / key:${asset.customerKey} / name:${asset.name} not found in cache`
                                );
                            }
                        }
                        if (asset.category?.id) {
                            this.setFolderPath(asset);
                        }

                        if (asset.slots) {
                            // * recursion: each block can have slots of its own
                            this._extractCode_slots(
                                `${prefix}.[${slot}-${block}]`,
                                asset.slots,
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
     * @param {string} dir directory with json files, e.g. /retrieve/cred/bu/asset, /deploy/cred/bu/asset, /template/asset
     * @param {boolean} [_] unused parameter
     * @param {string[]} [selectedSubType] asset, message, ...
     * @returns {Promise.<MetadataTypeMap>} fileName => fileContent map
     */
    static async getJsonFromFS(dir, _, selectedSubType) {
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
                await this._getJsonFromFS(currentdir, subtype, fileName2FileContent);
            }
        } catch (ex) {
            // this will catch issues with readdir
            Util.metadataLogger('debug', this.definition.type, 'getJsonFromFS', ex);
            throw new Error(ex);
        }
        return fileName2FileContent;
    }
    /**
     * helper for {@link Asset.getJsonFromFS} that reads the file system for metadata files
     *
     * @param {string} currentdir directory to scan
     * @param {string} subtype single subtype of asset
     * @param {MetadataTypeMap} fileName2FileContent fileName => fileContent map
     */
    static async _getJsonFromFS(currentdir, subtype, fileName2FileContent) {
        if (await File.pathExists(currentdir)) {
            const fileEnding = `.asset-${subtype}-meta.json`;
            const fileEndingLength = fileEnding.length;
            const files = await File.readdir(currentdir, { withFileTypes: true });
            for (const dirent of files) {
                const fileName = dirent.name;
                try {
                    if (dirent.isDirectory()) {
                        await this._getJsonFromFS(
                            File.normalizePath([currentdir, fileName]),
                            subtype,
                            fileName2FileContent
                        );
                    } else if (fileName.endsWith(fileEnding)) {
                        const fileContent = await File.readJSONFile(currentdir, fileName, false);
                        // subtype will change the metadata suffix length
                        const fileNameWithoutEnding = fileName.slice(0, -fileEndingLength);
                        fileName2FileContent[fileNameWithoutEnding] = fileContent;
                    }
                } catch (ex) {
                    // by catching this in the loop we gracefully handle the issue and move on to the next file
                    Util.metadataLogger('debug', this.definition.type, 'getJsonFromFS', ex);
                }
            }
        }
    }

    /**
     * check template directory for complex types that open subfolders for their subtypes
     *
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string} templateName name of the metadata file
     * @returns {Promise.<string>} AssetSubType name
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
        return subType;
    }
    /**
     * optional method used for some types to try a different folder structure
     *
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string[]} typeDirArr current subdir for this type
     * @param {string} templateName name of the metadata template
     * @param {string} fileName name of the metadata template file w/o extension
     * @returns {Promise.<string>} metadata in string form
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
     * @returns {Promise.<string[]>} list of all files that need to be committed in a flat array ['path/file1.ext', 'path/file2.ext']
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
                        const metadata = await File.readJSONFile(filePath, fileName, false);
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
     * @returns {Promise.<string>} id value or null
     */
    static async _getIdForSingleRetrieve(key) {
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
     * helper to allow us to select single metadata entries via REST
     *
     * @private
     * @param {string} id id field
     * @returns {Promise.<string>} key value or null
     */
    static async _getKeyForSingleRetrieve(id) {
        const results = await this.client.rest.get('/asset/v1/content/assets/' + id);
        return results?.customerKey || null;
    }

    /**
     * Delete a metadata item from the specified business unit
     *
     * @param {string} key Identifier of item
     * @returns {Promise.<boolean>} deletion success flag
     */
    static async deleteByKey(key) {
        // delete only works with the query's object id
        let id;
        if (key?.startsWith('id:')) {
            id = key.slice(3);
            // we need to get the actual key so that postDeletetTasks know what to do
            key = await this._getKeyForSingleRetrieve(id);
        } else {
            id = key ? await this._getIdForSingleRetrieve(key) : null;
        }
        if (!id) {
            Util.logger.error(` - ${this.definition.type} not found`);
            return false;
        }
        return super.deleteByKeyREST('/asset/v1/content/assets/' + id, key);
    }

    /**
     * clean up after deleting a metadata item
     * cannot use the generic method due to the complexity of how assets are saved to disk
     *
     * @param {string} key Identifier of metadata item
     * @returns {Promise.<void>} -
     */
    static async postDeleteTasks(key) {
        if (key?.startsWith('id:')) {
            // sad
        }
        const fileArr = await this.getFilesToCommit([key]);

        // check if asset sits in its own folder
        const ownFolderIndex =
            fileArr[0].indexOf(key + '\\') > 0
                ? fileArr[0].indexOf(key + '\\')
                : fileArr[0].indexOf(key + '/');
        if (ownFolderIndex > 0) {
            fileArr.push(fileArr[0].slice(0, ownFolderIndex + key.length));
        }

        for (const filePath of fileArr) {
            await File.remove(filePath);
        }
    }
    /**
     * get name & key for provided id
     *
     * @param {string} id Identifier of metadata
     * @returns {Promise.<{key:string, name:string, path:string, folder:string, mid:number, error:string, isShared:boolean}>} key, name and path of metadata; null if not found
     */
    static async resolveId(id) {
        let response;
        const json = {
            key: '',
            isShared: false,
            name: '',
            path: '',
            folder: '',
            mid: 0,
            legacyId: 0,
            error: '',
            sharedWith: [],
        };
        try {
            response = await this.client.rest.get(
                'asset/v1/content/assets/' +
                    id +
                    '?$fields=id,customerKey,name,memberId,legacyData,sharingProperties'
            );
        } catch (ex) {
            if (ex.response?.status !== 404) {
                throw ex;
            }
        }
        if (response?.id) {
            const item = response;
            const subType = this.#getMainSubtype(item.assetType.name);

            // prep response object
            json.key = item[this.definition.keyField];
            json.name = item[this.definition.nameField];
            json.mid = item.memberId;
            json.isShared = item.memberId != this.buObject.mid;
            json.sharedWith = item.sharingProperties?.sharedWith || null;
            json.legacyId = item.legacyData?.legacyId;

            const ownerBUName = json.isShared
                ? Util.inverseGet(
                      this.properties.credentials[this.buObject.credential].businessUnits,
                      json.mid
                  )
                : this.buObject.businessUnit;

            // find path for code of content block, fall back to json if not found; undefined if not even the json exists
            let path = await this.#getPath(subType, item, ownerBUName);

            if (!json.sharedWith) {
                delete json.sharedWith;
            }
            if (!json.isShared && !path) {
                // if not shared, we should have the file on disk; attempt download
                if (!cache.getCache()?.folder) {
                    // folders not cached yet but required to fill json.path
                    Folder.client = this.client;
                    Folder.buObject = this.buObject;
                    Folder.properties = this.properties;
                    const result = await Folder.retrieveForCache(null, ['asset', 'asset-shared']);
                    if (!cache.getCache()) {
                        cache.initCache(this.buObject);
                    }
                    cache.setMetadata('folder', result.metadata);
                }

                await this.retrieve(
                    File.normalizePath([
                        this.properties.directories.retrieve,
                        this.buObject.credential,
                        this.buObject.businessUnit,
                    ]),
                    null,
                    [subType],
                    json.key
                );
                // try again
                path = await this.#getPath(subType, item, this.buObject.businessUnit);
            }

            if (path) {
                json.path = path;
                delete json.error;
            } else {
                json.error = 'file not found on local disk';
                delete json.path;
            }
            const fileContent = await this.#getJson(subType, item);
            if (fileContent?.r__folder_Path) {
                json.folder = fileContent.r__folder_Path;
            }
            if (!json.legacyId) {
                delete json.legacyId;
            }

            if (Util.OPTIONS.json) {
                // for automated processing by VSCode extension, optionally print the json
                console.log(JSON.stringify(json, null, 2)); // eslint-disable-line no-console
            } else {
                Util.logger.info(` - ID: ${id}`);
                Util.logger.info(` - Key: ${item[this.definition.keyField]}`);
                Util.logger.info(` - Name: ${item[this.definition.nameField]}`);

                if (json.isShared) {
                    Util.logger.warn(' - Shared from: ' + ownerBUName + ' (' + json.mid + ')');
                }
                if (json.sharedWith && Array.isArray(json.sharedWith)) {
                    Util.logger.warn(
                        ` - Shared with: ${json.sharedWith
                            .map(
                                (mid) =>
                                    Util.inverseGet(
                                        this.properties.credentials[this.buObject.credential]
                                            .businessUnits,
                                        mid
                                    ) +
                                    ' (' +
                                    mid +
                                    ')'
                            )
                            .sort()
                            .join(', ')}`
                    );
                }
                if (json.legacyId) {
                    Util.logger.info(` - Legacy ID: ${json.legacyId}`);
                }
                Util.logger.info(` - How to use:`);
                Util.logger.info(`     %%= ContentBlockByKey("${json.key}") =%%`);

                if (json.folder) {
                    Util.logger.info(
                        `     %%= ContentBlockByName("${json.folder.split('/').join('\\') + '\\' + json.name}") =%%`
                    );
                    if (json.folder.includes('&amp;') || json.name.includes('&amp;')) {
                        Util.logger.warn(
                            ` - ContentBlockByName will fail because your path or name contains the & or &amp; symbol. Please replace it with 'and' or remove it.`
                        );
                    }
                }
                Util.logger.info(
                    ' - local link: ' +
                        (path ||
                            `404. Try running mcdev r ${this.buObject.credential}/${ownerBUName} ${this.definition.type}-${subType} ${item[this.definition.keyField]}`)
                );
            }
            return json;
        } else {
            json.error = 'id not found';
            delete json.key;
            delete json.mid;
            delete json.name;
            delete json.path;
            delete json.folder;
            delete json.isShared;
            delete json.legacyId;
            delete json.sharedWith;
            if (Util.OPTIONS.json) {
                console.log(JSON.stringify(json, null, 2)); // eslint-disable-line no-console
                return json;
            }
            Util.logger.error(` - ${this.definition.type} with id ${id} not found on BU`);
            return json;
        }
    }

    /**
     * helper for {@link Asset.resolveId} that finds the path to the asset's code
     *
     * @param {string} subType asset subtype
     * @param {object} item api response for metadata
     * @param {string} buName owner business unit name
     * @returns {Promise.<string>} path to the asset's code
     */
    static async #getPath(subType, item, buName) {
        const pathBase1 = `./retrieve/${this.buObject.credential}/${buName}/${this.definition.type}/${subType}/${item[this.definition.keyField]}.${this.definition.type}-${subType}-meta.`;
        const pathBase2 = `./retrieve/${this.buObject.credential}/${buName}/${this.definition.type}/${subType}/${item[this.definition.keyField]}/${item[this.definition.keyField]}.${this.definition.type}-${subType}-meta.`;
        const paths = [];
        for (const ext of ['html', 'ssjs', 'amp', 'json']) {
            paths.push(pathBase1 + ext, pathBase2 + ext);
        }
        const path = await Util.findAsync(paths, async (p) => await File.pathExists(p));
        return path;
    }
    /**
     * helper for {@link Asset.resolveId} that loads the JSON file for the asset
     *
     * @param {string} subType asset subtype
     * @param {object} item api response for metadata
     * @returns {Promise.<object>} JS object of the asset we loaded from disk
     */
    static async #getJson(subType, item) {
        const mid = item.memberId;
        const buName =
            mid === this.buObject.mid
                ? this.buObject.businessUnit
                : Object.keys(
                      this.properties.credentials[this.buObject.credential].businessUnits
                  ).find(
                      (buName) =>
                          this.properties.credentials[this.buObject.credential].businessUnits[
                              buName
                          ] == mid
                  );
        const pathBase1 = `./retrieve/${this.buObject.credential}/${buName}/${this.definition.type}/${subType}/${item[this.definition.keyField]}.${this.definition.type}-${subType}-meta.`;
        const pathBase2 = `./retrieve/${this.buObject.credential}/${buName}/${this.definition.type}/${subType}/${item[this.definition.keyField]}/${item[this.definition.keyField]}.${this.definition.type}-${subType}-meta.`;
        const paths = [];
        paths.push(pathBase1 + 'json', pathBase2 + 'json');

        const path = await Util.findAsync(paths, async (p) => await File.pathExists(p));
        const pathArr = path.split('/');
        const fileName = pathArr.pop().slice(0, -5);
        const fileContent = await File.readJSONFile(pathArr.join('/'), fileName, false);
        return fileContent;
    }
    /**
     *
     * @param {MetadataTypeItem} item single metadata item
     * @param {string} retrieveDir directory where metadata is saved
     * @param {Set.<string>} [findAssetKeys] list of keys that were found referenced via ContentBlockByX; if set, method only gets keys and runs no updates
     * @returns {Promise.<MetadataTypeItem>} key of the item that was updated
     */
    static async replaceCbReference(item, retrieveDir, findAssetKeys) {
        const responseItem = structuredClone(item);
        const parentName = `${this.definition.type} ${item[this.definition.keyField]}`;
        let changes = false;
        let error;

        // *** type specific logic ***
        const subType = this.#getMainSubtype(item.assetType.name);
        /** @type {CodeExtract[]} */
        const fileList = await this._mergeCode(
            item,
            retrieveDir,
            subType,
            item[this.definition.keyField],
            false
        );
        const fileListChanged = [];
        for (const file of fileList) {
            try {
                file.content = ReplaceCbReference.replaceReference(
                    file.content,
                    parentName,
                    findAssetKeys
                );
                changes = true;
                fileListChanged.push(file);
            } catch (ex) {
                if (ex.code !== 200) {
                    error = ex;
                }
            }
        }
        if (!findAssetKeys) {
            // save what was changed regardless of other errors
            for (const extractedFile of fileListChanged) {
                File.writeToFile(
                    [retrieveDir, ...extractedFile.subFolder],
                    extractedFile.fileName,
                    extractedFile.fileExt,
                    extractedFile.content,
                    extractedFile.encoding || null
                );
            }
        }

        if (error) {
            throw error;
        }

        if (!changes) {
            const ex = new Error('No changes made to the code.');
            // @ts-expect-error custom error object
            ex.code = 200;
            throw ex;
        }

        // *** finish ***
        // replaceReference will throw an error if nothing was updated which will end execution here
        // no error means we have a new item to deploy and need to update the item in our retrieve folder
        return responseItem;
    }
    /**
     * this iterates over all items found in the retrieve folder and executes the type-specific method for replacing references
     *
     * @param {MetadataTypeMap} metadataMap list of metadata (keyField => metadata)
     * @param {string} retrieveDir retrieve dir including cred and bu
     * @param {Set.<string>} [findAssetKeys] list of keys that were found referenced via ContentBlockByX; if set, method only gets keys and runs no updates
     * @returns {Promise.<string[]>} Returns list of keys for which references were replaced
     */
    static async replaceCbReferenceLoop(metadataMap, retrieveDir, findAssetKeys) {
        const keysForDeploy = [];
        if (!metadataMap) {
            // if a type was skipped e.g. because it shall only be looked at on the parent then we would expect metadataMap to be undefined
            return keysForDeploy;
        }

        const fromDescription = Util.OPTIONS.referenceFrom
            .map((from) => 'ContentBlockBy' + Util.capitalizeFirstLetter(from))
            .join(' and ');

        if (Object.keys(metadataMap).length) {
            Util.logger.debug(` - Searching in ${this.definition.type} `);
            const deployMap = {};

            for (const key in metadataMap) {
                const item = metadataMap[key];
                if (this.isFiltered(item, true) || this.isFiltered(item, false)) {
                    // we would not have saved these items to disk but they exist in the cache and hence need to be skipped here

                    continue;
                }

                try {
                    // add key but make sure to turn it into string or else numeric keys will be filtered later
                    deployMap[key] = await this.replaceCbReference(
                        item,
                        retrieveDir,
                        findAssetKeys
                    );

                    // ! this method is equal to the super version except that it does not run saveToDisk here
                    // await this.saveToDisk(deployMap, key, baseDir);
                    if (findAssetKeys) {
                        keysForDeploy.push(...[...findAssetKeys].map((key) => key + ''));
                    } else {
                        keysForDeploy.push(key + '');
                        Util.logger.info(
                            ` - added ${this.definition.type} to update queue: ${key}`
                        );
                    }
                } catch (ex) {
                    if (ex.code !== 200) {
                        // dont print error if we simply did not find relevant content blocks
                        Util.logger.errorStack(
                            ex,
                            'issue with ' + this.definition.type + ' ' + key
                        );
                    }
                    if (!findAssetKeys) {
                        Util.logger.info(
                            Util.getGrayMsg(
                                ` ☇ skipping ${this.definition.type} ${
                                    item[this.definition.keyField]
                                }: no ${fromDescription} found`
                            )
                        );
                    }
                }
            }
            if (!findAssetKeys) {
                Util.logger.info(
                    `Found ${keysForDeploy.length} ${this.definition.type}${keysForDeploy.length === 1 ? '' : 's'} to update`
                );
            }
        }
        return keysForDeploy;
    }
    /**
     *
     * @param {string[]} keyArr limit retrieval to given metadata type
     * @param {string} retrieveDir retrieve dir including cred and bu
     * @param {Set.<string>} findAssetKeys list of keys that were found referenced via ContentBlockByX; if set, method only gets keys and runs no updates
     * @returns {Promise.<Set.<string>>} found asset keys
     */
    static async getCbReferenceKeys(keyArr, retrieveDir, findAssetKeys) {
        if (!Object.prototype.hasOwnProperty.call(this, 'replaceCbReference')) {
            // only types that have a replaceCbReference method actually have ampscript/ssjs
            return;
        }
        if (!this.getJsonFromFSCache) {
            // avoid re-reading the same files in every recursive iteration
            this.getJsonFromFSCache = await this.getJsonFromFS(
                File.normalizePath([retrieveDir, this.definition.type])
            );
        }
        // get all metadata of the current type; then filter by keys in selectedTypes
        const metadataMap = Util.filterObjByKeys(this.getJsonFromFSCache, [...findAssetKeys]);
        const newKeysFound = new Set(
            await this.replaceCbReferenceLoop(metadataMap, retrieveDir, findAssetKeys)
        );
        if (newKeysFound.size) {
            const keysToCrawl = [];
            for (const value of newKeysFound) {
                if (!keyArr.includes(value)) {
                    keyArr.push(value);
                    keysToCrawl.push(value);
                }
            }
            Util.logger.info(Util.getGrayMsg(` - asset: ${keysToCrawl.join(', ')}`));

            if (keysToCrawl.length) {
                findAssetKeys = new Set([
                    ...findAssetKeys,
                    ...(await this.getCbReferenceKeys(keyArr, retrieveDir, new Set(keysToCrawl))),
                ]);
            }
        }
        return findAssetKeys;
    }

    /**
     * optional helper for {@link this.getDependentTypes}
     *
     * @param {object} metadataItem metadata json read from filesystem
     * @param {TypeKeyCombo} dependentTypeKeyCombo list started in this.getDependentTypes
     */
    static getDependentFilesExtra(metadataItem, dependentTypeKeyCombo) {
        const dependentKeyArr = [];
        // search:
        // - metadata.views.html.slots
        // - metadata.slots
        if (metadataItem.views?.html?.slots) {
            this._getDependentFilesExtra(metadataItem.views.html.slots, dependentKeyArr);
        }
        if (metadataItem.slots) {
            this._getDependentFilesExtra(metadataItem.slots, dependentKeyArr);
        }
        if (dependentKeyArr.length) {
            dependentTypeKeyCombo.asset ||= [];
            dependentTypeKeyCombo.asset.push(...dependentKeyArr);
        }
    }
    /**
     * @param {object} slots metadata.views.html.slots or deeper slots.<>.blocks.<>.slots
     * @param {string[]} dependentKeyArr list of found keys
     */
    static _getDependentFilesExtra(slots, dependentKeyArr) {
        for (const slot in slots) {
            for (const block in slots[slot].blocks) {
                const asset = slots[slot].blocks[block];
                if (asset.r__asset_key) {
                    dependentKeyArr.push(asset.r__asset_key);
                }
                if (asset.views?.html?.slots) {
                    // * recursion: each block can have slots of its own
                    this._getDependentFilesExtra(asset.views.html.slots, dependentKeyArr);
                }
                if (asset.slots) {
                    // * recursion: each block can have slots of its own
                    this._getDependentFilesExtra(asset.slots, dependentKeyArr);
                }
            }
        }
    }
    /**
     * helper for {@link MetadataType.createOrUpdate}
     *
     * @param {MetadataTypeItem} metadataItem to be deployed item
     * @returns {MetadataTypeItem} cached item or undefined
     */
    static getCacheMatchedByName(metadataItem) {
        let cacheMatchedByName;

        if (Util.OPTIONS.matchName && this.definition.allowMatchingByName) {
            // make sure to run the search ONLY if OPTIONS.matchName is true and definition.allowMatchingByName signals support
            // try {
            const assetCache = cache.getCache()?.asset;
            const potentials = [];
            for (const key in assetCache) {
                const cachedAsset = assetCache[key];
                if (
                    cachedAsset[this.definition.nameField] ===
                        metadataItem[this.definition.nameField] &&
                    cachedAsset.assetType.id === metadataItem.assetType.id
                ) {
                    potentials.push(cachedAsset);
                }
            }
            if (potentials.length > 1) {
                throw new Error(
                    `found multiple name matches in cache for ${this.definition.type} ${metadataItem[this.definition.keyField]} / ${metadataItem[this.definition.nameField]}. Check their keys for more details: ${potentials.map((p) => p[this.definition.keyField]).join(', ')}`
                );
            } else if (potentials.length === 1) {
                const deployFolderPath = cache.searchForField(
                    'folder',
                    metadataItem.category.id,
                    'ID',
                    'Path'
                );
                if (potentials[0].category.id === metadataItem.category.id) {
                    cacheMatchedByName = potentials[0];

                    Util.logger.info(
                        Util.getGrayMsg(
                            ` - found ${this.definition.type} ${metadataItem[this.definition.keyField]} in cache by name "${metadataItem[this.definition.nameField]}" and folder "${deployFolderPath}": ${cacheMatchedByName[this.definition.keyField]}`
                        )
                    );
                } else {
                    const cacheFolderPath = cache.searchForField(
                        'folder',
                        potentials[0].category.id,
                        'ID',
                        'Path'
                    );
                    throw new Error(
                        `found ${this.definition.type} ${metadataItem[this.definition.keyField]} in cache by name "${metadataItem[this.definition.nameField]}" but in different folders: "${deployFolderPath}" vs "${cacheFolderPath}": ${potentials[0][this.definition.keyField]}`
                    );
                }
            }
        }
        return cacheMatchedByName;
    }
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';

Asset.definition = MetadataTypeDefinitions.asset;

export default Asset;
