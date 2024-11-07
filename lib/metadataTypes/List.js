'use strict';

import MetadataType from './MetadataType.js';
import Folder from './Folder.js';
import { Util } from '../util/util.js';
import cache from '../util/cache.js';
import auth from '../util/auth.js';

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
 * List MetadataType
 *
 * @augments MetadataType
 */
class List extends MetadataType {
    /**
     * Retrieves Metadata of Lists
     *
     * @param {string} [retrieveDir] Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise
     */
    static async retrieve(retrieveDir, _, __, key) {
        /** @type {SoapRequestParams} */
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
        const results = await super.retrieveSOAP(retrieveDir, requestParams, key);
        return await this._retrieveParentAllSubs(results);
    }

    /**
     * Gets metadata cache with limited fields and does not store value to disk
     *
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static async retrieveForCache() {
        const results = await this.retrieve();
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
        if (cache.getCache()?.folder) {
            cache.mergeMetadata('folder', result.metadata);
        } else {
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
     * @param {MetadataTypeMapObj} results metadata from retrieve for current BU
     * @returns {Promise.<MetadataTypeMapObj>} Promise
     */
    static async _retrieveParentAllSubs(results) {
        // Check if we're in a child BU
        if (this.buObject.eid !== this.buObject.mid) {
            // for caching, we want to get the All Subscriber List from the Parent Account
            Util.logger.debug(' - Checking MasterUnsubscribeBehavior for current BU');
            /** @type {BuObject} */
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
                // For child BUs using the parent's All Subscribers list
                Util.logger.debug(` - BU uses ParentBU's All Subscriber List`);
                Util.logger.info(
                    ' - Caching dependent Metadata: All Subscriber list (on _ParentBU_)'
                );
                // do not use retrieveForCache here because (a) it does not support key-filtering and (b) it would cache folders on top which we do not need for the global all subscriber list
                const metadataParentBu = await this.retrieve(null, null, null, 'All Subscribers');
                // manually set folder path of parent's All Subscriber List to avoid retrieving folders
                for (const key of Object.keys(metadataParentBu.metadata)) {
                    metadataParentBu.metadata[key].r__folder_Path = 'System';
                    metadataParentBu.metadata[key].Category = null; // Remove Category to avoid folder issues
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
                // Ensure the All Subscribers list for this BU is properly set
                for (const key in results.metadata) {
                    if (results.metadata[key].ListName === 'All Subscribers') {
                        results.metadata[key].r__folder_Path = 'System';
                        results.metadata[key].Category = null;
                        break;
                    }
                }
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
        return super.deleteByKeySOAP(customerKey);
    }

    /**
     * manages post retrieve steps
     *
     * @param {MetadataTypeItem} list a single list
     * @returns {MetadataTypeItem} metadata
     */
    static postRetrieveTasks(list) {
        return this.parseMetadata(list);
    }

    /**
     * parses retrieved Metadata before saving
     *
     * @param {MetadataTypeItem} metadata a single list definition
     * @param {boolean} [parseForCache] if set to true, the Category ID is kept
     * @returns {MetadataTypeItem} Array with one metadata object and one sql string
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
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
List.definition = MetadataTypeDefinitions.list;

export default List;
