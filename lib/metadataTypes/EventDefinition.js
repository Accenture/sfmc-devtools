'use strict';

const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const File = require('../util/file');
const cache = require('../util/cache');

/**
 * EventDefinition MetadataType
 * @augments MetadataType
 */
class EventDefinition extends MetadataType {
    /**
     * Construtor method
     * @param {Object} properties General configuration to be used in retrieve
     * @param {auth.BuObject} buObject details of business unit in processing
     * @returns {void}
     */
    constructor(properties, buObject) {
        super(properties, buObject);
        this.definition = require('../MetadataTypeDefinitions').eventDefinition;
    }
    /**
     * Retrieves Metadata of Event Definition.
     * Endpoint /interaction/v1/EventDefinitions return all Event Definitions with all details.
     * Currently it is not needed to loop over Imports with endpoint /interaction/v1/EventDefinitions/{id}
     * @param {String} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise<Object>} Promise of metadata
     */
    retrieve(retrieveDir) {
        return super.retrieveREST(retrieveDir, '/interaction/v1/EventDefinitions/', null);
    }

    /**
     * Retrieves event definition metadata for caching
     * @returns {Promise<Object>} Promise of metadata
     */
    retrieveForCache() {
        return super.retrieveREST(null, '/interaction/v1/EventDefinitions/', null);
    }

    /**
     * Retrieve a specific Event Definition by Name
     * @param {String} templateDir Directory where retrieved metadata directory will be saved
     * @param {String} name name of the metadata file
     * @param {Object} templateVariables variables to be replaced in the metadata
     * @returns {Promise<Object>} Promise of metadata
     */
    async retrieveAsTemplate(templateDir, name, templateVariables) {
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
                File.writeJSONToFile(
                    [templateDir, this.definition.type].join('/'),
                    originalKey + '.' + this.definition.type + '-meta',
                    JSON.parse(Util.replaceByObject(JSON.stringify(eventDef), templateVariables))
                );
                Util.logger.info(
                    `EventDefinition.retrieveAsTemplate:: Written Metadata to filesystem (${name})`
                );
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
     * @param {Object} eventDef a single importDef
     * @returns {Object[]} metadata
     */
    postRetrieveTasks(eventDef) {
        const val = this.parseMetadata(eventDef);
        this.keepRetrieveFields(val);
        return val;
    }

    /**
     * Creates a single Event Definition
     * @param {Util.MetadataTypeItem} EventDefinition a single Event Definition
     * @returns {Promise} Promise
     */
    create(EventDefinition) {
        return super.createREST(EventDefinition, '/interaction/v1/EventDefinitions/');
    }

    /**
     * Updates a single Event Definition (using PUT method since PATCH isn't supported)
     * @param {Util.MetadataTypeItem} metadataEntry a single Event Definition
     * @returns {Promise} Promise
     */
    async update(metadataEntry) {
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
     * @param {Object} metadata a single eventDefinition
     * @returns {Promise} Promise
     */
    async preDeployTasks(metadata) {
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
     * @param {Object} metadata a single event definition
     * @returns {Array} Array with one metadata object and one sql string
     */
    parseMetadata(metadata) {
        try {
            metadata.dataExtensionId = cache.searchForField(
                'dataExtension',
                metadata.dataExtensionId,
                'ObjectID',
                'CustomerKey'
            );
            metadata.arguments.dataExtensionId = metadata.dataExtensionId;
            return JSON.parse(JSON.stringify(metadata));
        } catch (ex) {
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

module.exports = EventDefinition;
