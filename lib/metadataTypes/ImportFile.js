'use strict';

const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const File = require('../util/file');
const cache = require('../util/cache');

/**
 * ImportFile MetadataType
 * @augments MetadataType
 */
class ImportFile extends MetadataType {
    /**
     * Retrieves Metadata of Import File.
     * Endpoint /automation/v1/imports/ return all Import Files with all details.
     * Currently it is not needed to loop over Imports with endpoint /automation/v1/imports/{id}
     * @param {String} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise} Promise
     */
    static retrieve(retrieveDir) {
        return super.retrieveREST(retrieveDir, '/automation/v1/imports/', null);
    }

    /**
     * Retrieves import definition metadata for caching
     * @returns {Promise} Promise
     */
    static async retrieveForCache() {
        return super.retrieveREST(null, '/automation/v1/imports/', null);
    }

    /**
     * Retrieve a specific Import Definition by Name
     * @param {String} templateDir Directory where retrieved metadata directory will be saved
     * @param {String} name name of the metadata file
     * @param {Object} templateVariables variables to be replaced in the metadata
     * @returns {Promise} Promise
     */
    static async retrieveAsTemplate(templateDir, name, templateVariables) {
        const res = await this.client.rest.get(
            '/automation/v1/imports/?$filter=name%20eq%20' + encodeURIComponent(name)
        );
        if (Array.isArray(res?.items) && res?.items.length) {
            // eq-operator returns a similar, not exact match and hence might return more than 1 entry
            const [metadata] = res.items.filter((item) => item.name === name);
            if (!metadata) {
                Util.logger.error(`No ${this.definition.typeName} found with name "${name}"`);
                return;
            }
            const originalKey = metadata[this.definition.keyField];
            const val = JSON.parse(
                Util.replaceByObject(
                    JSON.stringify(this.parseMetadata(metadata)),
                    templateVariables
                )
            );

            // remove all fields listed in Definition for templating
            this.keepTemplateFields(val);
            File.writeJSONToFile(
                [templateDir, this.definition.type].join('/'),
                originalKey + '.' + this.definition.type + '-meta',
                JSON.parse(Util.replaceByObject(JSON.stringify(val), templateVariables))
            );
            Util.logger.info(
                `ImportFile.retrieveAsTemplate:: Written Metadata to filesystem (${name})`
            );
            return { metadata: val, type: this.definition.type };
        } else if (res?.items) {
            Util.logger.error(`No ${this.definition.typeName} found with name "${name}"`);
        } else {
            throw new Error(
                `Encountered unknown error when retrieveing ${
                    this.definition.typeName
                } "${name}": ${JSON.stringify(res)}`
            );
        }
    }

    /**
     * manages post retrieve steps
     * @param {Object} importDef a single importDef
     * @returns {Object[]} metadata
     */
    static postRetrieveTasks(importDef) {
        const val = this.parseMetadata(importDef);
        return val;
    }

    /**
     * Creates a single Import File
     * @param {Object} importFile a single Import File
     * @returns {Promise} Promise
     */
    static create(importFile) {
        return super.createREST(importFile, '/automation/v1/imports/');
    }

    /**
     * Updates a single Import File
     * @param {Object} importFile a single Import File
     * @returns {Promise} Promise
     */
    static update(importFile) {
        return super.updateREST(
            importFile,
            '/automation/v1/imports/' + importFile.importDefinitionId
        );
    }

    /**
     * prepares a import definition for deployment
     * @param {Object} metadata a single importDef
     * @returns {Promise} Promise
     */
    static async preDeployTasks(metadata) {
        metadata.fileTransferLocationId = cache.searchForField(
            'ftpLocation',
            metadata.r__ftpLocation_name,
            'name',
            'id'
        );
        delete metadata.r__ftpLocation_name;

        if (metadata.c__destinationType === 'DataExtension') {
            metadata.destinationObjectId = cache.searchForField(
                'dataExtension',
                metadata.r__dataExtension_CustomerKey,
                'CustomerKey',
                'ObjectID'
            );
            delete metadata.r__dataExtension_CustomerKey;
        } else if (metadata.c__destinationType === 'List') {
            metadata.destinationObjectId = cache.getListObjectId(
                metadata.r__list_PathName,
                'ObjectID'
            );
            // destinationId is also needed for List types
            metadata.destinationId = cache.getListObjectId(metadata.r__list_PathName, 'ID');
            delete metadata.r__list_PathName;
        }
        // When the destinationObjectTypeId is 584 is refers to Mobile Connect which is not supported as an Import Type
        metadata.destinationObjectTypeId =
            this.definition.destinationObjectTypeMapping[metadata.c__destinationType];
        metadata.subscriberImportTypeId =
            this.definition.subscriberImportTypeMapping[metadata.c__subscriberImportType];
        metadata.updateTypeId = this.definition.updateTypeMapping[metadata.c__dataAction];
        return metadata;
    }

    /**
     * parses retrieved Metadata before saving
     * @param {Object} metadata a single import definition
     * @returns {Object} parsed metadata definition
     */
    static parseMetadata(metadata) {
        metadata.r__ftpLocation_name = cache.searchForField(
            'ftpLocation',
            metadata.fileTransferLocationId,
            'id',
            'name'
        );
        delete metadata.fileTransferLocationId;

        // * When the destinationObjectTypeId is 584 it refers to Mobile Connect which is not supported as an Import Type
        metadata.c__destinationType = Util.inverseGet(
            this.definition.destinationObjectTypeMapping,
            metadata.destinationObjectTypeId
        );
        delete metadata.destinationObjectTypeId;
        if (metadata.c__destinationType === 'DataExtension') {
            try {
                metadata.r__dataExtension_CustomerKey = cache.searchForField(
                    'dataExtension',
                    metadata.destinationObjectId,
                    'ObjectID',
                    'CustomerKey'
                );
                delete metadata.destinationObjectId;
            } catch (ex) {
                Util.logger.error(`ImportFile ${metadata.customerKey}: ${ex.message}`);
            }
        } else if (metadata.c__destinationType === 'List') {
            try {
                metadata.r__list_PathName = cache.getListPathName(
                    metadata.destinationObjectId,
                    'ObjectID'
                );
                delete metadata.destinationObjectId;
            } catch (ex) {
                Util.logger.error(`ImportFile ${metadata.customerKey}: ${ex.message}`);
            }
        }

        metadata.c__subscriberImportType = Util.inverseGet(
            this.definition.subscriberImportTypeMapping,
            metadata.subscriberImportTypeId
        );
        delete metadata.subscriberImportTypeId;
        metadata.c__dataAction = Util.inverseGet(
            this.definition.updateTypeMapping,
            metadata.updateTypeId
        );
        delete metadata.updateTypeId;
        return metadata;
    }
}

// Assign definition to static attributes
ImportFile.definition = require('../MetadataTypeDefinitions').importFile;

module.exports = ImportFile;
