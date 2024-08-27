'use strict';

import MetadataType from './MetadataType.js';
import { Util } from '../util/util.js';
import cache from '../util/cache.js';
import asset from './Asset.js';
import folder from './Folder.js';
import list from './List.js';
import ReplaceCbReference from '../util/replaceContentBlockReference.js';

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
 * MessageSendActivity MetadataType
 *
 * @augments MetadataType
 */
class TriggeredSend extends MetadataType {
    /**
     * Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static retrieve(retrieveDir, _, __, key) {
        /** @type {SoapRequestParams} */
        let requestParams = {
            filter: {
                leftOperand: 'TriggeredSendStatus',
                operator: 'IN',
                rightOperand: ['New', 'Active', 'Inactive', 'Moved', 'Canceled'], // New, Active=Running, Inactive=Paused, (Deleted)
            },
        };
        if (key) {
            // move original filter down one level into rightOperand and add key filter into leftOperand
            requestParams = {
                filter: {
                    leftOperand: {
                        leftOperand: 'CustomerKey',
                        operator: 'equals',
                        rightOperand: key,
                    },
                    operator: 'AND',
                    rightOperand: requestParams.filter,
                },
            };
        }

        return super.retrieveSOAP(retrieveDir, requestParams, key);
    }

    /**
     * Create a single TSD.
     *
     * @param {MetadataTypeItem} metadata single metadata entry
     * @returns {Promise} Promise
     */
    static create(metadata) {
        return super.createSOAP(metadata);
    }

    /**
     * Updates a single TSD.
     *
     * @param {MetadataTypeItem} metadata single metadata entry
     * @returns {Promise} Promise
     */
    static update(metadata) {
        // * in case of update and active definition, we need to pause first.
        // * this should be done manually to not accidentally pause production queues without restarting them
        return super.updateSOAP(metadata);
    }

    /**
     * Delete a metadata item from the specified business unit
     *
     * @param {string} customerKey Identifier of data extension
     * @returns {Promise.<boolean>} deletion success status
     */
    static deleteByKey(customerKey) {
        return super.deleteByKeySOAP(customerKey);
    }

    /**
     * parses retrieved Metadata before saving
     *
     * @param {MetadataTypeItem} metadata a single item
     * @returns {MetadataTypeItem | void} Array with one metadata object and one sql string
     */
    static postRetrieveTasks(metadata) {
        // remove IsPlatformObject, always has to be 'false'
        delete metadata.IsPlatformObject;

        // folder
        this.setFolderPath(metadata);
        if (!metadata.r__folder_Path) {
            Util.logger.verbose(
                ` ☇ skipping ${this.definition.typeName} '${metadata.Name}'/'${metadata.CustomerKey}': Could not find folder.`
            );
            // do not save this TSD because it would not be visible in the user interface
            return;
        }
        // email
        try {
            // content builder
            const contentBuilderEmailName = cache.searchForField(
                'asset',
                metadata.Email.ID,
                'legacyData.legacyId',
                'name'
            );
            metadata.r__asset_name_readOnly = contentBuilderEmailName;
            const contentBuilderEmailKey = cache.searchForField(
                'asset',
                metadata.Email.ID,
                'legacyData.legacyId',
                'customerKey'
            );
            metadata.r__asset_key = contentBuilderEmailKey;
            delete metadata.Email;
        } catch {
            try {
                // classic
                const classicEmail = cache.searchForField('email', metadata.Email.ID, 'ID', 'Name');
                metadata.r__email_name = classicEmail;
                delete metadata.Email;
            } catch {
                Util.logger.verbose(
                    ` - ${this.definition.typeName} '${metadata.Name}'/'${metadata.CustomerKey}': Could not find email with ID ${metadata.Email.ID} in Classic nor in Content Builder. This TSD cannot be republished but potentially restarted with its cached version of the email.`
                );
                // save this TSD because it could be fixed by the user or potentially restarted without a fix; also, it might be used by a journey
            }
        }
        // message priority
        if (metadata.Priority) {
            metadata.c__priority = Util.inverseGet(
                this.definition.priorityMapping,
                metadata.Priority
            );
            delete metadata.Priority;
        }

        // List (optional)
        if (metadata.List) {
            try {
                metadata.r__list_PathName = cache.getListPathName(metadata.List.ID, 'ID');
                delete metadata.List;
            } catch (ex) {
                Util.logger.verbose(
                    ` - ${this.definition.typeName} '${metadata.Name}'/'${metadata.CustomerKey}': ${ex.message}`
                );
                // save this TSD because it could be fixed by the user
            }
        }

        // sender profile
        if (metadata.SenderProfile?.ObjectID) {
            try {
                const spKey = cache.searchForField(
                    'senderProfile',
                    metadata.SenderProfile.ObjectID,
                    'ObjectID',
                    'CustomerKey'
                );
                metadata.r__senderProfile_key = spKey;
                delete metadata.SenderProfile;
            } catch (ex) {
                Util.logger.warn(
                    ` - ${this.definition.type} ${metadata.CustomerKey}: ${ex.message} (senderProfile key ${metadata.SenderProfile.CustomerKey})`
                );
            }
        }
        // send classification
        if (metadata.SendClassification?.ObjectID) {
            try {
                const scKey = cache.searchForField(
                    'sendClassification',
                    metadata.SendClassification.ObjectID,
                    'ObjectID',
                    'CustomerKey'
                );
                metadata.r__sendClassification_key = scKey;
                delete metadata.SendClassification;
            } catch (ex) {
                Util.logger.warn(
                    ` - ${this.definition.type} ${metadata.CustomerKey}: ${ex.message} (sendClassification key ${metadata.SendClassification.CustomerKey})`
                );
            }
        }

        return metadata;
    }

    /**
     * prepares a TSD for deployment
     *
     * @param {MetadataTypeItem} metadata of a single TSD
     * @returns {Promise.<MetadataTypeItem>} metadata object
     */
    static async preDeployTasks(metadata) {
        const cachedVersion = cache.getByKey(this.definition.type, metadata.CustomerKey);
        if (
            cachedVersion?.TriggeredSendStatus === 'Active' &&
            cachedVersion?.TriggeredSendStatus === metadata.TriggeredSendStatus
        ) {
            throw new Error(
                `Please pause the Triggered Send '${metadata.Name}' before updating it. You may do so via GUI; or via Accenture SFMC DevTools by setting TriggeredSendStatus to 'Inactive'.`
            );
        }
        // re-add IsPlatformObject, required for visibility
        metadata.IsPlatformObject = false;
        // folder
        super.setFolderId(metadata);
        // email
        if (metadata.r__email_name) {
            // classic
            metadata.Email = {
                ID: cache.searchForField('email', metadata.r__email_name, 'Name', 'ID'),
            };
            delete metadata.r__email_name;
        } else if (metadata.r__asset_key) {
            // content builder
            // * this ignores r__asset_name_readOnly on purpose as that is only unique per parent folder but useful during PR reviews
            metadata.Email = {
                ID: cache.searchForField(
                    'asset',
                    metadata.r__asset_key,
                    'customerKey',
                    'legacyData.legacyId'
                ),
            };
            delete metadata.r__asset_key;
            delete metadata.r__asset_name_readOnly;
        } else if (metadata?.Email?.ID) {
            throw new Error(
                `r__asset_key / r__email_name not defined but instead found Email.ID. Please try re-retrieving this TSD from your BU.`
            );
        }
        // message priority
        if (metadata.c__priority) {
            metadata.Priority = this.definition.priorityMapping[metadata.c__priority];
            delete metadata.c__priority;
        }
        // get List (optional)
        if (metadata.r__list_PathName) {
            metadata.List = {
                ID: cache.getListObjectId(metadata.r__list_PathName, 'ID'),
            };
            delete metadata.r__list_PathName;
        } else if (metadata?.List?.ID) {
            throw new Error(
                `r__list_PathName not defined but instead found List.ID. Please try re-retrieving this TSD from your BU.`
            );
        }
        // sender profile
        if (metadata.r__senderProfile_key) {
            cache.searchForField(
                'senderProfile',
                metadata.r__senderProfile_key,
                'CustomerKey',
                'CustomerKey'
            );
            metadata.SenderProfile = {
                CustomerKey: metadata.r__senderProfile_key,
            };
            delete metadata.r__senderProfile_key;
        }
        // send classification
        if (metadata.r__sendClassification_key) {
            cache.searchForField(
                'sendClassification',
                metadata.r__sendClassification_key,
                'CustomerKey',
                'CustomerKey'
            );
            metadata.SendClassification = {
                CustomerKey: metadata.r__sendClassification_key,
            };
            delete metadata.r__sendClassification_key;
        }

        return metadata;
    }

    /**
     * TSD-specific refresh method that finds active TSDs and refreshes them
     *
     * @param {string[]} [keyArr] metadata keys
     * @param {boolean} [checkKey] whether to check if the key is valid
     * @returns {Promise.<void>} -
     */
    static async refresh(keyArr, checkKey = true) {
        console.time('Time'); // eslint-disable-line no-console
        if (!keyArr) {
            keyArr = await this.getKeysForValidTSDs((await this.findRefreshableItems()).metadata);
            checkKey = false;
        }
        // then executes pause, publish, start on them.
        const refreshList = [];
        Util.logger.info(`Refreshing ${keyArr.length} ${this.definition.typeName}...`);
        Util.logger.debug(`Refreshing keys: ${keyArr.join(', ')}`);
        for (const key of keyArr) {
            refreshList.push(this._refreshItem(key, checkKey));
        }
        const successCounter = (await Promise.all(refreshList)).filter(Boolean).length;
        Util.logger.info(`Refreshed ${successCounter} of ${keyArr.length}`);
        console.timeEnd('Time'); // eslint-disable-line no-console
    }

    /**
     * helper for {@link TriggeredSend.refresh} that extracts the keys from the TSD item map and eli
     *
     * @param {MetadataTypeMap} metadata TSD item map
     * @returns {Promise.<string[]>} keyArr
     */
    static async getKeysForValidTSDs(metadata) {
        const keyArr = Object.keys(metadata).filter((key) => {
            const test = this.postRetrieveTasks(metadata[key]);
            return test?.CustomerKey || false;
        });
        Util.logger.info(`Found ${keyArr.length} refreshable items.`);
        return keyArr;
    }

    /**
     * helper for {@link TriggeredSend.refresh} that finds active TSDs on the server and filters it by the same rules that {@link TriggeredSend.retrieve} is using to avoid refreshing TSDs with broken dependencies
     *
     * @param {boolean} [assetLoaded] if run after Asset.deploy via --refresh option this will skip caching assets
     * @returns {Promise.<MetadataTypeMapObj>} Promise of TSD item map
     */
    static async findRefreshableItems(assetLoaded = false) {
        Util.logger.info('Finding refreshable items...');
        // cache dependencies to test for broken links
        // skip deprecated classic emails here, assuming they cannot be updated and hence are not relevant for {@link refresh}
        const requiredCache = {
            folder: [
                'hidden',
                'list',
                'mysubs',
                'suppression_list',
                'publication',
                'contextual_suppression_list',
                'triggered_send',
                'triggered_send_journeybuilder',
            ],
            asset: ['message'],
            list: null,
        };
        const cacheTypes = {
            asset,
            folder,
            list,
        };
        for (const [type, subTypeArr] of Object.entries(requiredCache)) {
            if (type === 'asset' && assetLoaded) {
                continue;
            }
            Util.logger.info(` - Caching dependent Metadata: ${type}`);
            Util.logSubtypes(subTypeArr);
            cacheTypes[type].client = this.client;
            cacheTypes[type].buObject = this.buObject;
            cacheTypes[type].properties = this.properties;

            const result = await cacheTypes[type].retrieveForCache(null, subTypeArr);
            if (cache.getCache()?.[type]) {
                // re-run caching to merge with existing cache, assuming we might have missed subtypes
                cache.mergeMetadata(type, result.metadata);
            } else {
                cache.setMetadata(type, result.metadata);
            }
        }
        //  cache ACTIVE triggeredSends from the server
        /** @type {SoapRequestParams} */
        const requestParams = {
            filter: {
                leftOperand: 'TriggeredSendStatus',
                operator: 'IN',
                rightOperand: ['dummy', 'Active'], // using equals does not work for this field for an unknown reason and IN requires at least 2 values, hence the 'dummy' entry
            },
        };
        return super.retrieveSOAP(null, requestParams);
    }

    /**
     * helper for {@link TriggeredSend.refresh} that pauses, publishes and starts a triggered send
     *
     * @param {string} key external key of triggered send item
     * @param {boolean} checkKey whether to check if key exists on the server
     * @returns {Promise.<boolean>} true if refresh was successful
     */
    static async _refreshItem(key, checkKey) {
        const item = {};
        let test;
        item[this.definition.keyField] = key;
        // check triggeredSend-key exists on the server AND its status==ACTIVE
        if (checkKey) {
            /** @type {SoapRequestParams} */
            const requestParams = {
                filter: {
                    leftOperand: 'CustomerKey',
                    operator: 'equals',
                    rightOperand: key,
                },
            };
            try {
                test = (
                    await super.retrieveSOAP(null, requestParams, key, [
                        'CustomerKey',
                        'TriggeredSendStatus',
                    ])
                )?.metadata;
            } catch (ex) {
                const errorMsg = super.getSOAPErrorMsg(ex);
                Util.logger.error(` ☇ skipping ${this.definition.typeName}: ${key} - ${errorMsg}}`);
                return false;
            }
            if (!test[key]) {
                Util.logger.error(
                    ` ☇ skipping ${this.definition.typeName}: ${key} - not found on server`
                );
                return false;
            }
            if (test[key].TriggeredSendStatus !== 'Active') {
                Util.logger.error(
                    ` ☇ skipping ${this.definition.typeName}: ${key} - refresh only needed for running entries (TriggeredSendStatus=Active)`
                );
                return false;
            }
        }

        // pause
        try {
            item.TriggeredSendStatus = 'Inactive';
            test = await super.updateSOAP(item, true);
            if (test.OverallStatus !== 'OK') {
                throw new Error(test.Results[0].StatusMessage);
            }
            delete item.TriggeredSendStatus;
            Util.logger.info(` - paused ${this.definition.typeName}: ${key}`);
        } catch (ex) {
            const errorMsg = super.getSOAPErrorMsg(ex);

            Util.logger.error(
                ` - failed to pause ${this.definition.typeName}: ${key} - ${errorMsg}`
            );
            return false;
        }

        // publish
        try {
            item.RefreshContent = 'true';
            test = await super.updateSOAP(item, true);
            if (test.OverallStatus !== 'OK') {
                throw new Error(test.Results[0].StatusMessage);
            }
            delete item.RefreshContent;
            Util.logger.info(` - published ${this.definition.typeName}: ${key}`);
        } catch (ex) {
            const errorMsg = super.getSOAPErrorMsg(ex);
            Util.logger.error(
                ` - failed to publish ${this.definition.typeName}: ${key} - ${errorMsg}`
            );
            return false;
        }

        // start
        try {
            item.TriggeredSendStatus = 'Active';
            test = await super.updateSOAP(item, true);
            if (test.OverallStatus !== 'OK') {
                throw new Error(test.Results[0].StatusMessage);
            }
            delete item.RefreshContent;
            Util.logger.info(` - started ${this.definition.typeName}: ${key}`);
        } catch (ex) {
            const errorMsg = super.getSOAPErrorMsg(ex);
            Util.logger.error(
                ` - failed to publish ${this.definition.typeName}: ${key} - ${errorMsg}`
            );
            return false;
        }
        return true;
    }

    /**
     *
     * @param {MetadataTypeItem} item single metadata item
     * @param {string} [_] parameter not used
     * @param {Set.<string>} [findAssetKeys] list of keys that were found referenced via ContentBlockByX; if set, method only gets keys and runs no updates
     * @returns {Promise.<MetadataTypeItem>} key of the item that was updated
     */
    static async replaceCbReference(item, _, findAssetKeys) {
        const parentName = `${this.definition.type} ${item[this.definition.keyField]}`;
        let changes = false;
        let error;

        // *** type specific logic ***
        try {
            item.FromName = ReplaceCbReference.replaceReference(
                item.FromName,
                parentName,
                findAssetKeys
            );
            changes = true;
        } catch (ex) {
            if (ex.code !== 200) {
                error = ex;
            }
        }
        try {
            item.FromAddress = ReplaceCbReference.replaceReference(
                item.FromAddress,
                parentName,
                findAssetKeys
            );
            changes = true;
        } catch (ex) {
            if (ex.code !== 200) {
                error = ex;
            }
        }
        try {
            item.EmailSubject = ReplaceCbReference.replaceReference(
                item.EmailSubject,
                parentName,
                findAssetKeys
            );
            changes = true;
        } catch (ex) {
            if (ex.code !== 200) {
                error = ex;
            }
        }
        try {
            item.DynamicEmailSubject = ReplaceCbReference.replaceReference(
                item.DynamicEmailSubject,
                parentName,
                findAssetKeys
            );
            changes = true;
        } catch (ex) {
            if (ex.code !== 200) {
                error = ex;
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
        return item;
    }
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
TriggeredSend.definition = MetadataTypeDefinitions.triggeredSend;

export default TriggeredSend;
