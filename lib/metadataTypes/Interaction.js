'use strict';

const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const cache = require('../util/cache');
const File = require('../util/file');

/**
 * Script MetadataType
 *
 * @augments MetadataType
 */
class Interaction extends MetadataType {
    /**
     * Retrieves Metadata of Interaction
     * Endpoint /interaction/v1/interactions?extras=all&pageSize=50000 return 50000 Scripts with all details.
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void} [_] unused parameter
     * @param {void} [__] unused parameter
     * @param {void} [___] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise
     */
    static retrieve(retrieveDir, _, __, ___, key) {
        let singleKey = '';
        if (key) {
            /* eslint-disable unicorn/prefer-ternary */
            if (key.startsWith('id:')) {
                // ! allow selecting journeys by ID because that's what users see in the URL
                singleKey = '/' + key.slice(3);
            } else {
                singleKey = '/key:' + encodeURIComponent(key);
            }
            /* eslint-enable unicorn/prefer-ternary */
        }
        return super.retrieveREST(
            retrieveDir,
            `/interaction/v1/interactions${singleKey}?extras=all`,
            null,
            null,
            key
        );
    }
    /**
     * Delete a metadata item from the specified business unit
     *
     * @param {TYPE.BuObject} buObject references credentials
     * @param {string} key Identifier of item
     * @param {number} version required version of metadata
     * @returns {Promise.<boolean>} deletion success status
     */
    static async deleteByKey(buObject, key, version) {
        if (Number.isNaN(version)) {
            throw new TypeError(
                'Version is required for deleting interactions to avoid accidental deletion of the wrong item.'
            );
        }
        let singleKey = '';
        /* eslint-disable unicorn/prefer-ternary */
        if (key.startsWith('id:')) {
            // ! allow selecting journeys by ID because that's what users see in the URL
            singleKey = key.slice(3);
        } else {
            // delete by key with specified version does not work, therefore we need to get the ID first
            const response = await this.client.rest.get(
                `/interaction/v1/interactions/key:${key}?extras=`
            );
            const results = this.parseResponseBody(response, key);
            singleKey = results[key].id;
            Util.logger.debug(`Deleting interaction ${key} via its ID ${singleKey}`);
        }
        Util.logger.warn(
            `Deleting Interactions via this command breaks following retrieve-by-key/id requests until you've deployed/created a new draft version! You can get still get the latest available version of your journey by retrieving all interactions on this BU.`
        );
        /* eslint-enable unicorn/prefer-ternary */
        return super.deleteByKeyREST(
            buObject,
            '/interaction/v1/interactions/' + singleKey + `?versionNumber=${version}`,
            key,
            false
        );
    }
    /**
     * Updates a single item
     *
     * @param {TYPE.MetadataTypeItem} metadata a single item
     * @returns {Promise} Promise
     */
    static update(metadata) {
        return super.updateREST(metadata, '/interaction/v1/interactions/', true);
    }

    /**
     * Creates a single item
     *
     * @param {TYPE.MetadataTypeItem} metadata a single item
     * @returns {Promise} Promise
     */
    static create(metadata) {
        return super.createREST(metadata, '/interaction/v1/interactions/');
    }

    /**
     * manages post retrieve steps
     *
     * @param {TYPE.MetadataTypeItem} metadata a single query
     * @returns {TYPE.MetadataTypeItem} Array with one metadata object and one query string
     */
    static postRetrieveTasks(metadata) {
        // folder
        super.setFolderPath(metadata);

        // eventDefinition
        if (metadata.triggers?.length > 0 && metadata.triggers[0].metaData?.eventDefinitionKey) {
            // trigger found; there can only be one entry in this array
            try {
                cache.searchForField(
                    'eventDefinition',
                    metadata.triggers[0].metaData?.eventDefinitionKey,
                    'eventDefinitionKey',
                    'eventDefinitionKey'
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
     * prepares a TSD for deployment
     *
     * @param {TYPE.MetadataTypeItem} metadata of a single TSD
     * @returns {TYPE.MetadataTypeItem} metadata object
     */
    static async preDeployTasks(metadata) {
        if (metadata.status !== 'Draft') {
            metadata.status !== 'Draft';
        }

        // folder
        super.setFolderId(metadata);

        // eventDefinition
        if (metadata.triggers?.length > 0 && metadata.triggers[0].metaData?.eventDefinitionKey) {
            // trigger found; there can only be one entry in this array
            cache.searchForField(
                'eventDefinition',
                metadata.triggers[0].metaData?.eventDefinitionKey,
                'eventDefinitionKey',
                'eventDefinitionKey'
            );
        }

        return metadata;
    }

    /**
     *
     * @param {TYPE.MetadataTypeItem} metadata single metadata itme
     * @param {string} metadataKey key of item we are looking at
     * @param {boolean} hasError error flag from previous code
     * @param {TYPE.MetadataTypeItemDiff[]} metadataToUpdate list of items to update
     * @param {TYPE.MetadataTypeItem[]} metadataToCreate list of items to create
     */
    static createOrUpdate(metadata, metadataKey, hasError, metadataToUpdate, metadataToCreate) {
        const normalizedKey = File.reverseFilterIllegalFilenames(
            metadata[metadataKey][this.definition.keyField]
        );
        // Update if it already exists; Create it if not
        if (Util.logger.level === 'debug' && metadata[metadataKey][this.definition.idField]) {
            // TODO: re-evaluate in future releases if & when we managed to solve folder dependencies once and for all
            // only used if resource is excluded from cache and we still want to update it
            // needed e.g. to rewire lost folders
            Util.logger.warn(
                ' - Hotfix for non-cachable resource found in deploy folder. Trying update:'
            );
            Util.logger.warn(JSON.stringify(metadata[metadataKey]));
            if (hasError) {
                metadataToUpdate.push(null);
            } else {
                metadataToUpdate.push({
                    before: {},
                    after: metadata[metadataKey],
                });
            }
        } else {
            const cachedVersion = cache.getByKey(this.definition.type, normalizedKey);
            if (cachedVersion && cachedVersion.status === 'Draft') {
                // normal way of processing update files
                if (!this.hasChanged(cachedVersion, metadata[metadataKey])) {
                    hasError = true;
                }

                if (hasError) {
                    // do this in case something went wrong during pre-deploy steps to ensure the total counter is correct
                    metadataToUpdate.push(null);
                } else {
                    // add ObjectId to allow actual update
                    metadata[metadataKey][this.definition.idField] =
                        cachedVersion[this.definition.idField];
                    // add ObjectId to allow actual update
                    metadata[metadataKey].version = cachedVersion.version;

                    metadataToUpdate.push({
                        before: cachedVersion,
                        after: metadata[metadataKey],
                    });
                }
            } else {
                if (hasError) {
                    // do this in case something went wrong during pre-deploy steps to ensure the total counter is correct
                    metadataToCreate.push(null);
                } else {
                    if (cachedVersion) {
                        Util.logger.info(
                            ` - Found ${this.definition.type} ${
                                metadata[metadataKey][this.definition.nameField]
                            } (${
                                metadata[metadataKey][this.definition.keyField]
                            }) on BU, but it is not in Draft status. Will create new version.`
                        );
                    }

                    metadataToCreate.push(metadata[metadataKey]);
                }
            }
        }
    }
}

// Assign definition to static attributes
Interaction.definition = require('../MetadataTypeDefinitions').interaction;

module.exports = Interaction;
