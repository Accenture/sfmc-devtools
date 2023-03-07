'use strict';

const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const cache = require('../util/cache');

/**
 * MobileMessage MetadataType
 *
 * @augments MetadataType
 */
class MobileMessage extends MetadataType {
    /**
     * Retrieves Metadata of Mobile Keywords
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void} [_] unused parameter
     * @param {void} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<TYPE.MetadataTypeMapObj> | void} Promise of metadata
     */
    static retrieve(retrieveDir, _, __, key) {
        this._upgradeGetBulk();
        try {
            return super.retrieveREST(
                retrieveDir,
                '/legacy/v1/beta/mobile/message/' +
                    (key ||
                        '?view=details&version=3&$sort=lastUpdated%20DESC&$where=isTest%20eq%200%20and%20status%20neq%20%27Archive%27'),
                null,
                null,
                key
            );
        } catch (ex) {
            // if the mobileMessage does not exist, the API returns the error "Request failed with status code 400 (ERR_BAD_REQUEST)" which would otherwise bring execution to a hold
            if (key && ex.code === 'ERR_BAD_REQUEST') {
                Util.logger.info(
                    `Downloaded: ${this.definition.type} (0)${Util.getKeysString(key)}`
                );
            } else {
                throw ex;
            }
        }
    }

    /**
     * Retrieves event definition metadata for caching
     *
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of metadata
     */
    static retrieveForCache() {
        this._upgradeGetBulk();
        return super.retrieveREST(
            null,
            '/legacy/v1/beta/mobile/message/' +
                '?view=details&version=3&$sort=lastUpdated%20DESC&$where=isTest%20eq%200%20and%20status%20neq%20%27Archive%27'
        );
    }

    /**
     * helper for {@link MobileMessage.retrieve} and {@link MobileMessage.retrieveForCache}
     */
    static _upgradeGetBulk() {
        this.getBulkBackup ||= this.client.rest.getBulk;
        this.client.rest.getBulk = this.getBulkForMobileApi.bind(this.client.rest);
    }

    /**
     * Method that makes paginated GET API Requests using $pageSize and $page parameters
     *
     * @param {string} url of the resource to retrieve
     * @param {number} [pageSize] of the response, defaults to 50
     * @param {'items'|'definitions'|'entry'} [iteratorField] attribute of the response to iterate over
     * @returns {Promise.<object>} API response combined items
     */
    static async getBulkForMobileApi(url, pageSize, iteratorField) {
        let page = 1;
        const baseUrl = url.split('?')[0];
        const isTransactionalMessageApi = this.isTransactionalMessageApi(baseUrl);
        const isMobileApi = baseUrl && baseUrl.startsWith('/legacy/v1/beta/mobile');
        const queryParams = new URLSearchParams(url.split('?')[1]);
        let collector;
        let shouldPaginate = false;
        let pageSizeName = '$pageSize';
        let pageName = '$page';
        let countName = 'count';
        if (isMobileApi) {
            pageSizeName = '$top';
            pageName = '$skip';
            countName = 'totalResults';
            page = 0; // index starts with 0 for mobileMessage
            if (pageSize != 50) {
                // values other than 50 are ignore by at least some of the sub-endpoints; while others have 50 as the maximum.
                pageSize = 50;
            }
        }
        queryParams.set(pageSizeName, Number(pageSize || 50).toString());
        do {
            queryParams.set(pageName, Number(page).toString());
            const temp = await this._apiRequest(
                {
                    method: 'GET',
                    url: baseUrl + '?' + decodeURIComponent(queryParams.toString()),
                },
                this.options.requestAttempts
            );
            if (!iteratorField) {
                if (Array.isArray(temp.items)) {
                    iteratorField = 'items';
                } else if (Array.isArray(temp.definitions)) {
                    iteratorField = 'definitions';
                } else if (Array.isArray(temp.entry)) {
                    iteratorField = 'entry';
                } else {
                    throw new TypeError('Could not find an array to iterate over');
                }
            }
            if (collector && Array.isArray(temp[iteratorField])) {
                collector[iteratorField].push(...temp[iteratorField]);
            } else if (collector == null) {
                collector = temp;
            }
            if (
                Array.isArray(collector[iteratorField]) &&
                collector[iteratorField].length >= temp[countName] &&
                (!isTransactionalMessageApi ||
                    (isTransactionalMessageApi && temp[countName] != temp[pageSizeName]))
            ) {
                // ! the transactional message API returns a value for "count" that represents the currently returned number of records, instead of the total amount. checking for count != pageSize is a workaround for this
                // * opened Support Case #43988240 for this issue
                shouldPaginate = false;
            } else {
                page++;
                shouldPaginate = true;
                if (this.options?.eventHandlers?.onLoop) {
                    this.options.eventHandlers.onLoop(null, collector?.[iteratorField]);
                }
            }
        } while (shouldPaginate);
        return collector;
    }

    /**
     * Updates a single item
     *
     * @param {TYPE.MetadataTypeItem} metadata a single item
     * @returns {Promise} Promise
     */
    static update(metadata) {
        return super.updateREST(
            metadata,
            '/legacy/v1/beta/mobile/message/' + metadata[this.definition.keyField],
            'post'
        );
    }

    /**
     * Creates a single Event Definition
     *
     * @param {TYPE.MetadataTypeItem} metadata a single Event Definition
     * @returns {Promise} Promise
     */
    static create(metadata) {
        return super.createREST(metadata, '/legacy/v1/beta/mobile/message/');
    }
    /**
     * manages post retrieve steps
     *
     * @param {TYPE.MetadataTypeItem} metadata a single query
     * @returns {TYPE.MetadataTypeItem} Array with one metadata object and one query string
     */
    static postRetrieveTasks(metadata) {
        // mobileCode
        try {
            cache.searchForField('mobileCode', metadata.code.code, 'code', 'code');
        } catch (ex) {
            Util.logger.warn(
                ` - ${this.definition.type} ${metadata[this.definition.nameField]} (${
                    metadata[this.definition.keyField]
                }): ${ex.message}.`
            );
        }
        // mobileKeyword
        if (metadata.keyword?.keyword) {
            try {
                cache.searchForField(
                    'mobileKeyword',
                    metadata.keyword.keyword,
                    'keyword',
                    'keyword'
                );
            } catch (ex) {
                Util.logger.warn(
                    ` - ${this.definition.type} ${metadata[this.definition.nameField]} (${
                        metadata[this.definition.keyField]
                    }): ${ex.message}.`
                );
            }
        }

        return metadata;
    }

    /**
     * prepares an event definition for deployment
     *
     * @param {TYPE.MetadataTypeItem} metadata a single MobileMessage
     * @returns {TYPE.MetadataTypeItem} Promise
     */
    static preDeployTasks(metadata) {
        // mobileCode
        metadata.code = cache.getByKey('mobileCode', metadata.code.code);

        // mobileKeyword
        if (metadata.keyword?.keyword) {
            metadata.keyword = cache.getByKey('mobilekeyword', metadata.keyword.keyword);
        }

        return metadata;
    }
    /**
     * Delete a metadata item from the specified business unit
     *
     * @param {string} key Identifier of item
     * @returns {Promise.<boolean>} deletion success status
     */
    static deleteByKey(key) {
        Util.logger.info(
            ' - Note: As long as the provided API key once existed, you will not see an error even if the mobileMessage is already deleted.'
        );
        return super.deleteByKeyREST('/legacy/v1/beta/mobile/message/' + key, key, false);
    }
}

// Assign definition to static attributes
MobileMessage.definition = require('../MetadataTypeDefinitions').mobileMessage;

module.exports = MobileMessage;
