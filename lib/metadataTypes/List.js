'use strict';

const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');
const Folder = require('./Folder');
const Util = require('../util/util');
const cache = require('../util/cache');
const auth = require('../util/auth');

/**
 * List MetadataType
 *
 * @augments MetadataType
 */
class List extends MetadataType {
    /**
     * Retrieves Metadata of Lists
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void} [_] unused parameter
     * @param {void} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise
     */
    static async retrieve(retrieveDir, _, __, key) {
        /** @type {TYPE.SoapRequestParams} */
        let requestParams = null;
        if (key) {
            requestParams = {
                filter: {
                    leftOperand: {
                        leftOperand: 'CustomerKey',
                        operator: 'equals',
                        rightOperand: key,
                    },
                    operator: 'OR',
                    rightOperand: {
                        // deviating from standard here by allowing to search without the rather weird key which includes the folder name!
                        leftOperand: 'ListName',
                        operator: 'equals',
                        rightOperand: key,
                    },
                },
            };
        }
        const results = await super.retrieveSOAP(retrieveDir, requestParams);
        return await this._retrieveParentAllSubs(results);
    }
    /**
     * Gets metadata cache with limited fields and does not store value to disk
     *
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of metadata
     */
    static async retrieveForCache() {
        const results = await this.retrieve();
        if (!cache.getCache()?.folder) {
            const subTypeArr = [
                'list',
                'mysubs',
                'suppression_list',
                'publication',
                'contextual_suppression_list',
            ];
            Util.logger.debug('folders not cached but required for list');
            Util.logger.info(' - Caching dependent Metadata: folder');
            Util.logSubtypes(subTypeArr);
            Folder.client = this.client;
            Folder.buObject = this.buObject;
            Folder.properties = this.properties;
            const result = await Folder.retrieveForCache(null, subTypeArr);
            cache.setMetadata('folder', result.metadata);
        }
        for (const metadataEntry in results.metadata) {
            this.parseMetadata(results.metadata[metadataEntry], true);
        }
        return results;
    }

    /**
     * helper for @link retrieveForCache and @link retrieve
     *
     * @private
     * @param {TYPE.MetadataTypeMapObj} results metadata from retrieve for current BU
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise
     */
    static async _retrieveParentAllSubs(results) {
        if (this.buObject.eid !== this.buObject.mid) {
            // for caching, we want to get the All Subscriber List from the Parent Account
            Util.logger.debug(' - Checking MasterUnsubscribeBehavior for current BU');
            /** @type {TYPE.BuObject} */
            const buObjectParentBu = {
                eid: this.properties.credentials[this.buObject.credential].eid,
                mid: this.properties.credentials[this.buObject.credential].eid,
                businessUnit: Util.parentBuName,
                credential: this.buObject.credential,
            };
            const clientBackup = this.client;
            const buObjectBackup = this.buObject;
            try {
                this.client = auth.getSDK(buObjectParentBu);
            } catch (ex) {
                Util.logger.error(ex.message);
                return;
            }
            this.buObject = buObjectParentBu;
            const buResult = await this.client.soap.retrieve(
                'BusinessUnit',
                ['MasterUnsubscribeBehavior'],
                {
                    QueryAllAccounts: true,
                    filter: {
                        leftOperand: 'ID',
                        operator: 'equals',
                        rightOperand: this.properties.credentials[this.buObject.credential].eid,
                    },
                }
            );
            const masterUnsubscribeBehavior = buResult.Results[0]?.MasterUnsubscribeBehavior;
            if (masterUnsubscribeBehavior === 'ENTIRE_ENTERPRISE') {
                Util.logger.debug(` - BU uses ParentBU's All Subscriber List`);
                Util.logger.info(
                    ' - Caching dependent Metadata: All Subscriber list (on _ParentBU_)'
                );
                // do not use retrieveForCache here because (a) it does not support key-filtering and (b) it would cache folders on top which we do not need for the global all subscriber list
                const metadataParentBu = await this.retrieve(null, null, null, 'All Subscribers');
                // manually set folder path of parent's All Subscriber List to avoid retrieving folders
                for (const key of Object.keys(metadataParentBu.metadata)) {
                    metadataParentBu.metadata[key].r__folder_Path = 'my subscribers';
                }
                // find & delete local All Subscriber list to avoid referencing the wrong one
                for (const key of Object.keys(results.metadata)) {
                    if (results.metadata[key].ListName === 'All Subscribers') {
                        delete results.metadata[key];
                        break;
                    }
                }

                // revert to current default
                this.client = clientBackup;
                this.buObject = buObjectBackup;

                // make sure to overwrite parent bu DEs with local ones
                return {
                    metadata: { ...metadataParentBu.metadata, ...results.metadata },
                    type: results.type,
                };
            } else if (masterUnsubscribeBehavior === 'BUSINESS_UNIT_ONLY') {
                // revert client to current default
                this.client = clientBackup;

                Util.logger.debug(' - BU uses own All Subscriber List');
            }
        }
        return results;
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
     * @param {TYPE.MetadataTypeItem} list a single list
     * @returns {TYPE.MetadataTypeItem} metadata
     */
    static postRetrieveTasks(list) {
        return this.parseMetadata(list);
    }
    /**
     * parses retrieved Metadata before saving
     *
     * @param {TYPE.MetadataTypeItem} metadata a single list definition
     * @param {boolean} [parseForCache] if set to true, the Category ID is kept
     * @returns {TYPE.MetadataTypeItem} Array with one metadata object and one sql string
     */
    static parseMetadata(metadata, parseForCache) {
        if (!metadata.r__folder_Path) {
            // if we cached all subs from parent bu, we don't need to parse the folder path again here
            try {
                metadata.r__folder_Path = cache.searchForField(
                    'folder',
                    metadata.Category,
                    'ID',
                    'Path'
                );
                if (!parseForCache) {
                    delete metadata.Category;
                }
            } catch (ex) {
                Util.logger.warn(
                    ` - List ${metadata.ID}: '${metadata.CustomerKey}': ${ex.message}`
                );
            }
        }
        return metadata;
    }
}
// Assign definition to static attributes
List.definition = require('../MetadataTypeDefinitions').list;

module.exports = List;
