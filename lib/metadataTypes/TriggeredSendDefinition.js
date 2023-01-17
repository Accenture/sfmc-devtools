'use strict';

const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const cache = require('../util/cache');

/**
 * MessageSendActivity MetadataType
 *
 * @augments MetadataType
 */
class TriggeredSendDefinition extends MetadataType {
    /**
     * Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void} [_] unused parameter
     * @param {void} [__] unused parameter
     * @param {void} [___] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of metadata
     */
    static retrieve(retrieveDir, _, __, ___, key) {
        /** @type {TYPE.SoapRequestParams} */
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

        return super.retrieveSOAP(retrieveDir, null, requestParams);
    }

    /**
     * Create a single TSD.
     *
     * @param {TYPE.MetadataTypeItem} metadata single metadata entry
     * @returns {Promise} Promise
     */
    static create(metadata) {
        return super.createSOAP(metadata);
    }

    /**
     * Updates a single TSD.
     *
     * @param {TYPE.MetadataTypeItem} metadata single metadata entry
     * @returns {Promise} Promise
     */
    static update(metadata) {
        // * in case of update and active definition, we need to pause first.
        // * this should be done manually to not accidentally purge production queues
        return super.updateSOAP(metadata);
    }

    /**
     * Delete a metadata item from the specified business unit
     *
     * @param {string} customerKey Identifier of data extension
     * @returns {Promise.<boolean>} deletion success status
     */
    static deleteByKey(customerKey) {
        return super.deleteByKeySOAP(customerKey, false);
    }

    /**
     * manages post retrieve steps
     *
     * @param {TYPE.MetadataTypeItem} metadata a single query
     * @returns {TYPE.MetadataTypeItem} Array with one metadata object and one query string
     */
    static postRetrieveTasks(metadata) {
        return this.parseMetadata(metadata);
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
                metadata[this.definition.folderIdField],
                'ID',
                'Path'
            );
            delete metadata[this.definition.folderIdField];
        } catch (ex) {
            Util.logger.verbose(
                ` - skipping ${this.definition.type} '${metadata[this.definition.nameField]}' (${
                    metadata[this.definition.keyField]
                }): Could not find folder (${ex.message})`
            );
            throw ex;
        }
    }
    /**
     * parses retrieved Metadata before saving
     *
     * @param {TYPE.MetadataTypeItem} metadata a single query activity definition
     * @returns {TYPE.MetadataTypeItem | void} Array with one metadata object and one sql string
     */
    static parseMetadata(metadata) {
        // remove IsPlatformObject, always has to be 'false'
        delete metadata.IsPlatformObject;
        // folder
        try {
            this.setFolderPath(metadata);
        } catch {
            return;
        }

        // email
        try {
            // classic
            const classicEmail = cache.searchForField('email', metadata.Email.ID, 'ID', 'Name');
            metadata.r__email_Name = classicEmail;
            delete metadata.Email;
        } catch {
            try {
                // content builder
                const contentBuilderEmailName = cache.searchForField(
                    'asset',
                    metadata.Email.ID,
                    'legacyData.legacyId',
                    'name'
                );
                metadata.r__assetMessage_Name = contentBuilderEmailName;
                const contentBuilderEmailKey = cache.searchForField(
                    'asset',
                    metadata.Email.ID,
                    'legacyData.legacyId',
                    'customerKey'
                );
                metadata.r__assetMessage_Key = contentBuilderEmailKey;
                delete metadata.Email;
            } catch {
                Util.logger.verbose(
                    ` - skipping ${this.definition.typeName} '${metadata.Name}'/'${metadata.CustomerKey}': Could not find email with ID ${metadata.Email.ID} in Classic nor in Content Builder.`
                );
                return;
            }
        }
        // List (optional)
        if (metadata.List) {
            try {
                metadata.r__list_PathName = cache.getListPathName(metadata.List.ID, 'ID');
                delete metadata.List;
            } catch (ex) {
                Util.logger.verbose(
                    ` - skipping ${this.definition.typeName} '${metadata.Name}'/'${metadata.CustomerKey}': ${ex.message}`
                );
                return;
            }
        }

        return metadata;
    }
    /**
     * prepares a TSD for deployment
     *
     * @param {TYPE.MetadataTypeItem} metadata of a single TSD
     * @returns {TYPE.MetadataTypeItem} metadata object
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
        if (metadata.r__email_Name) {
            // classic
            metadata.Email = {
                ID: cache.searchForField('email', metadata.r__email_Name, 'Name', 'ID'),
            };
            delete metadata.r__email_Name;
        } else if (metadata.r__assetMessage_Key) {
            // content builder
            // * this ignores r__assetMessage_Name on purpose as that is only unique per parent folder but useful during PR reviews
            metadata.Email = {
                ID: cache.searchForField(
                    'asset',
                    metadata.r__assetMessage_Key,
                    'customerKey',
                    'legacyData.legacyId'
                ),
            };
            delete metadata.r__assetMessage_Key;
            delete metadata.r__assetMessage_Name;
        } else if (metadata?.Email?.ID) {
            throw new Error(
                `r__assetMessage_Key / r__email_Name not defined but instead found Email.ID. Please try re-retrieving this TSD from your BU.`
            );
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

        return metadata;
    }
    /**
     * TSD-specific refresh method that finds active TSDs and refreshes them
     *
     * @returns {Promise.<void>} -
     */
    static async refresh() {
        // cache ACTIVE triggeredSends from the server
        /** @type {TYPE.SoapRequestParams} */
        const requestParams = {
            filter: {
                leftOperand: 'TriggeredSendStatus',
                operator: 'IN',
                rightOperand: ['Active'], // Active=Running, Inactive=Paused
            },
        };
        const metadata = (await super.retrieveSOAP(null, null, requestParams)).metadata;

        // then executes pause, publish, start on them.
        const refreshList = [];
        const keyList = Object.keys(metadata);
        Util.logger.info(`Refreshing ${keyList.length} ${this.definition.typeName}...`);
        Util.logger.debug(`Refreshing keys: ${keyList.join(', ')}`);
        for (const key of Object.keys(metadata)) {
            refreshList.push(this._refreshItem(key));
        }
        await Promise.all(refreshList);
        Util.logger.info(`Refresh done.`);
    }

    /**
     * helper for {@link refresh} that pauses, publishes and starts a triggered send
     *
     * @param {string} key external key of triggered send item
     * @returns {Promise.<void>} -
     */
    static async _refreshItem(key) {
        const item = {};
        item[this.definition.keyField] = key;
        // pause
        item.TriggeredSendStatus = 'Inactive';
        await this.update(item);
        delete item.TriggeredSendStatus;

        // publish
        item.RefreshContent = 'true';
        await this.update(item);
        delete item.RefreshContent;

        // start
        item.TriggeredSendStatus = 'Active';
        await this.update(item);
    }
}

// Assign definition to static attributes
TriggeredSendDefinition.definition = require('../MetadataTypeDefinitions').triggeredSendDefinition;

module.exports = TriggeredSendDefinition;
