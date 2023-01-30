'use strict';

const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const File = require('../util/file');
const cache = require('../util/cache');

/**
 * EventDefinition MetadataType
 *
 * @augments MetadataType
 */
class EventDefinition extends MetadataType {
    /**
     * Retrieves Metadata of Event Definition.
     * Endpoint /interaction/v1/EventDefinitions return all Event Definitions with all details.
     * Currently it is not needed to loop over Imports with endpoint /interaction/v1/EventDefinitions/{id}
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void} [_] unused parameter
     * @param {void} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of metadata
     */
    static retrieve(retrieveDir, _, __, key) {
        Util.logBeta(this.definition.type);
        return super.retrieveREST(
            retrieveDir,
            `/interaction/v1/EventDefinitions${
                key ? '/key:' + encodeURIComponent(key) : ''
            }?extras=all`,
            null,
            null,
            key
        );
    }

    /**
     * Retrieves event definition metadata for caching
     *
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of metadata
     */
    static retrieveForCache() {
        return super.retrieveREST(null, '/interaction/v1/EventDefinitions/');
    }

    /**
     * Retrieve a specific Event Definition by Name
     *
     * @param {string} templateDir Directory where retrieved metadata directory will be saved
     * @param {string} name name of the metadata file
     * @param {TYPE.TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {Promise.<TYPE.MetadataTypeItemObj>} Promise of metadata
     */
    static async retrieveAsTemplate(templateDir, name, templateVariables) {
        Util.logBeta(this.definition.type);
        const res = await this.client.rest.get(
            '/interaction/v1/EventDefinitions?name=' + encodeURIComponent(name)
        );
        const event = res.items.filter((item) => item.name === name);
        try {
            if (!event || event.length === 0) {
                throw new Error(`No Event Definitions Found with name "${name}"`);
            } else if (event.length > 1) {
                throw new Error(
                    `Multiple Event Definitions with name "${name}"` +
                        `please rename to be unique to avoid issues`
                );
            } else if (event?.length === 1) {
                const originalKey = event[0][this.definition.keyField];
                const eventDef = JSON.parse(
                    Util.replaceByObject(
                        JSON.stringify(this.parseMetadata(event[0])),
                        templateVariables
                    )
                );
                if (!eventDef.dataExtensionId) {
                    throw new Error(
                        `EventDefinition.parseMetadata:: ` +
                            `No Data Extension found for ` +
                            `event: ${eventDef.name}. ` +
                            `This cannot be templated`
                    );
                }

                // remove all fields listed in Definition for templating
                this.keepTemplateFields(eventDef);
                await File.writeJSONToFile(
                    [templateDir, this.definition.type].join('/'),
                    originalKey + '.' + this.definition.type + '-meta',
                    JSON.parse(Util.replaceByObject(JSON.stringify(eventDef), templateVariables))
                );
                Util.logger.info(`- templated ${this.definition.type}: ${name}`);
                return { metadata: eventDef, type: this.definition.type };
            } else {
                throw new Error(
                    `Encountered unknown error when retrieveing ${
                        this.definition.typeName
                    } "${name}": ${JSON.stringify(res.body)}`
                );
            }
        } catch (ex) {
            Util.logger.error('EventDefinition.retrieveAsTemplate:: ' + ex);
            return null;
        }
    }

    /**
     * manages post retrieve steps
     *
     * @param {TYPE.MetadataTypeItem} eventDef a single item of Event Definition
     * @returns {TYPE.MetadataTypeItem} metadata
     */
    static postRetrieveTasks(eventDef) {
        const val = this.parseMetadata(eventDef);
        this.keepRetrieveFields(val);
        return val;
    }
    /**
     * Delete a metadata item from the specified business unit
     *
     * @param {string} key Identifier of item
     * @returns {Promise.<boolean>} deletion success status
     */
    static deleteByKey(key) {
        Util.logBeta(this.definition.type);
        return super.deleteByKeyREST(
            '/interaction/v1/eventDefinitions/key:' + encodeURIComponent(key),
            key,
            false
        );
    }
    /**
     * Deploys metadata - merely kept here to be able to print {@link Util.logBeta} once per deploy
     *
     * @param {TYPE.MetadataTypeMap} metadata metadata mapped by their keyField
     * @param {string} deployDir directory where deploy metadata are saved
     * @param {string} retrieveDir directory where metadata after deploy should be saved
     * @param {TYPE.BuObject} buObject properties for auth
     * @returns {Promise.<TYPE.MetadataTypeMap>} Promise of keyField => metadata map
     */
    static async deploy(metadata, deployDir, retrieveDir, buObject) {
        Util.logBeta(this.definition.type);
        return super.deploy(metadata, deployDir, retrieveDir, buObject);
    }

    /**
     * Creates a single Event Definition
     *
     * @param {TYPE.MetadataTypeItem} EventDefinition a single Event Definition
     * @returns {Promise} Promise
     */
    static create(EventDefinition) {
        return super.createREST(EventDefinition, '/interaction/v1/EventDefinitions/');
    }

    /**
     * Updates a single Event Definition (using PUT method since PATCH isn't supported)
     *
     * @param {TYPE.MetadataTypeItem} metadataEntry a single Event Definition
     * @returns {Promise} Promise
     */
    static async update(metadataEntry) {
        if (metadataEntry === null || metadataEntry === undefined) {
            return null;
        }
        this.removeNotUpdateableFields(metadataEntry);
        const options = {
            uri: '/interaction/v1/EventDefinitions/' + metadataEntry.id,
            json: metadataEntry,
            headers: {},
        };
        try {
            const response = await this.client.rest.put(options);
            super.checkForErrors(response);
            return response;
        } catch (ex) {
            Util.metadataLogger(
                'error',
                this.definition.type,
                'updateREST',
                ex,
                metadataEntry.name
            );
            return null;
        }
    }

    /**
     * prepares an event definition for deployment
     *
     * @param {TYPE.MetadataTypeItem} metadata a single eventDefinition
     * @returns {TYPE.MetadataTypeItem} parsed version
     */
    static preDeployTasks(metadata) {
        metadata.dataExtensionId = cache.searchForField(
            'dataExtension',
            metadata.dataExtensionName,
            'Name',
            'ObjectID'
        );
        metadata.arguments.dataExtensionId = metadata.dataExtensionId;
        return metadata;
    }

    /**
     * parses retrieved Metadata before saving
     *
     * @param {TYPE.MetadataTypeItem} metadata a single event definition
     * @returns {TYPE.MetadataTypeItem} parsed metadata
     */
    static parseMetadata(metadata) {
        try {
            metadata.dataExtensionId = cache.searchForField(
                'dataExtension',
                metadata.dataExtensionId,
                'ObjectID',
                'CustomerKey'
            );
            metadata.arguments.dataExtensionId = metadata.dataExtensionId;
            return JSON.parse(JSON.stringify(metadata));
        } catch {
            Util.metadataLogger(
                'verbose',
                this.definition.type,
                'parseMetadata',
                `No related Data Extension found for Event '${metadata.name}'. Consider deleting the event definition`
            );
            return metadata;
        }
    }
}

// Assign definition to static attributes
EventDefinition.definition = require('../MetadataTypeDefinitions').eventDefinition;

module.exports = EventDefinition;
