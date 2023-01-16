'use strict';

const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');

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
                singleKey = '/' + encodeURIComponent(key.slice(3));
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
     * @returns {Promise.<boolean>} deletion success status
     */
    static deleteByKey(buObject, key) {
        return super.deleteByKeyREST(
            buObject,
            '/interaction/v1/interactions/key:' + key,
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

        return metadata;
    }
    /**
     * prepares a TSD for deployment
     *
     * @param {TYPE.MetadataTypeItem} metadata of a single TSD
     * @returns {TYPE.MetadataTypeItem} metadata object
     */
    static async preDeployTasks(metadata) {
        // folder
        super.setFolderId(metadata);
        return metadata;
    }
}

// Assign definition to static attributes
Interaction.definition = require('../MetadataTypeDefinitions').interaction;

module.exports = Interaction;
