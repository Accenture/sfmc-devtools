'use strict';

const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const File = require('../util/file');

/**
 * EventDefinition MetadataType
 * @augments MetadataType
 */
class EventDefinition extends MetadataType {
    /**
     * Retrieves Metadata of Event Definition.
     * Endpoint /interaction/v1/EventDefinitions return all Event Definitions with all details.
     * Currently it is not needed to loop over Imports with endpoint /interaction/v1/EventDefinitions/{id}
     * @param {String} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise<Object>} Promise of metadata
     */
    static retrieve(retrieveDir) {
        return super.retrieveREST(retrieveDir, '/interaction/v1/EventDefinitions/', null);
    }

    /**
     * Retrieves event definition metadata for caching
     * @returns {Promise<Object>} Promise of metadata
     */
    static retrieveForCache() {
        return super.retrieveREST(null, '/interaction/v1/EventDefinitions/', null);
    }

    /**
     * Retrieve a specific Event Definition by Name
     * @param {String} templateDir Directory where retrieved metadata directory will be saved
     * @param {String} name name of the metadata file
     * @param {Object} templateVariables variables to be replaced in the metadata
     * @returns {Promise<Object>} Promise of metadata
     */
    static async retrieveAsTemplate(templateDir, name, templateVariables) {
        // todo template based on name
        const options = {
            uri: '/interaction/v1/EventDefinitions?name=' + encodeURIComponent(name),
        };
        const res = await this.client.RestClient.get(options);
        const event = res.body.items.filter((item) => item.name === name);
        try {
            if (!event || event.length === 0) {
                throw new Error(`No Event Definitions Found with name "${name}"`);
            } else if (event.length > 1) {
                throw new Error(
                    `Multiple Event Definitions with name "${name}"` +
                        `please rename to be unique to avoid issues`
                );
            } else if (event && event.length === 1) {
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
    static postRetrieveTasks(eventDef) {
        const val = this.parseMetadata(eventDef);
        this.keepRetrieveFields(val);
        return val;
    }

    /**
     * Creates a single Event Definition
     * @param {Object} EventDefinition a single Event Definition
     * @returns {Promise} Promise
     */
    static create(EventDefinition) {
        return super.createREST(EventDefinition, '/interaction/v1/EventDefinitions/');
    }

    /**
     * Updates a single Event Definition (using PUT method since PATCH isn't supported)
     * @param {Object} EventDefinition a single Event Definition
     * @returns {Promise} Promise
     */
    static async update(EventDefinition) {
        this.removeNotUpdateableFields(EventDefinition);
        const options = {
            uri: '/interaction/v1/EventDefinitions/' + EventDefinition.id,
            json: EventDefinition,
            headers: {},
        };
        try {
            const response = await this.client.RestClient.put(options);
            super.checkForErrors(response);
            return response;
        } catch (ex) {
            Util.metadataLogger(
                'error',
                this.definition.type,
                'updateREST',
                ex,
                EventDefinition.name
            );
            return null;
        }
    }

    /**
     * prepares an event definition for deployment
     * @param {Object} metadata a single eventDefinition
     * @returns {Promise} Promise
     */
    static async preDeployTasks(metadata) {
        metadata.dataExtensionId = Util.getFromCache(
            this.cache,
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
    static parseMetadata(metadata) {
        try {
            metadata.dataExtensionId = Util.getFromCache(
                this.cache,
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

// Assign definition to static attributes
EventDefinition.definition = require('../MetadataTypeDefinitions').eventDefinition;
EventDefinition.cache = {};
EventDefinition.client = undefined;

module.exports = EventDefinition;
