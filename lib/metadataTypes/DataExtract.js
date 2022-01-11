'use strict';

const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const File = require('../util/file');

/**
 * DataExtract MetadataType
 * @augments MetadataType
 */
class DataExtract extends MetadataType {
    /**
     * Retrieves Metadata of Data Extract Activity.
     * Endpoint /automation/v1/dataextracts/ returns all Data Extracts
     * @param {String} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise<Object>} Promise of metadata
     */
    static async retrieve(retrieveDir) {
        return super.retrieveREST(retrieveDir, '/automation/v1/dataextracts/', null);
    }
    /**
     * Retrieves Metadata of  Data Extract Activity for caching
     * @returns {Promise<Object>} Promise of metadata
     */
    static async retrieveForCache() {
        return super.retrieveREST(null, '/automation/v1/dataextracts/', null);
    }

    /**
     * Retrieve a specific dataExtract Definition by Name
     * @param {String} templateDir Directory where retrieved metadata directory will be saved
     * @param {String} name name of the metadata file
     * @param {Object} variables variables to be replaced in the metadata
     * @returns {Promise<Object>} Promise of metadata
     */
    static async retrieveAsTemplate(templateDir, name, variables) {
        const res = await this.client.rest.get(
            '/automation/v1/dataextracts/?$filter=name%20eq%20' + encodeURIComponent(name)
        );
        if (res.body && Array.isArray(res.items) && res.items.length) {
            // eq-operator returns a similar, not exact match and hence might return more than 1 entry
            const [metadata] = res.items.filter((item) => item.name === name);
            if (!metadata) {
                Util.logger.error(`No ${this.definition.typeName} found with name "${name}"`);
                return;
            }

            // get full definition
            const extended = await this.client.rest.get(
                '/automation/v1/dataextracts/' + metadata.id
            );
            const val = JSON.parse(
                Util.replaceByObject(JSON.stringify(this.parseMetadata(extended.body)), variables)
            );

            // remove all fields listed in Definition for templating
            this.keepTemplateFields(val);
            File.writeJSONToFile(
                [templateDir, this.definition.type].join('/'),
                val.customerKey + '.' + this.definition.type + '-meta',
                JSON.parse(Util.replaceByObject(JSON.stringify(val), variables))
            );
            Util.logger.info(
                `Dataextracts.retrieveAsTemplate:: Written Metadata to filesystem (${name})`
            );
            return { metadata: val, type: this.definition.type };
        } else if (res.body && res.body.items) {
            Util.logger.error(`No ${this.definition.typeName} found with name "${name}"`);
        } else {
            throw new Error(
                `Encountered unknown error when retrieveing ${
                    this.definition.typeName
                } "${name}": ${JSON.stringify(res.body)}`
            );
        }
    }

    /**
     * manages post retrieve steps
     * @param {Object} fileTransfer a single fileTransfer
     * @returns {Object[]} metadata
     */
    static postRetrieveTasks(fileTransfer) {
        return this.parseMetadata(fileTransfer);
    }

    /**
     * Creates a single Data Extract
     * @param {Object} dataExtract a single Data Extract
     * @returns {Promise} Promise
     */
    static create(dataExtract) {
        return super.createREST(dataExtract, '/automation/v1/dataextracts/');
    }

    /**
     * Updates a single Data Extract
     * @param {Object} dataExtract a single Data Extract
     * @returns {Promise} Promise
     */
    static update(dataExtract) {
        return super.updateREST(
            dataExtract,
            '/automation/v1/dataextracts/' + dataExtract.dataExtractDefinitionId
        );
    }

    /**
     * prepares a dataExtract for deployment
     * @param {Object} metadata a single dataExtract activity definition
     * @returns {Object} metadata object
     */
    static preDeployTasks(metadata) {
        metadata.dataExtractTypeId = Util.getFromCache(
            this.cache,
            'dataExtractType',
            metadata.r__dataExtractType_name,
            'name',
            'extractId'
        );
        delete metadata.r__dataExtractType_name;
        return metadata;
    }
    /**
     * parses retrieved Metadata before saving
     * @param {Object} metadata a single dataExtract activity definition
     * @returns {Array} Array with one metadata object and one sql string
     */
    static parseMetadata(metadata) {
        metadata.r__dataExtractType_name = Util.getFromCache(
            this.cache,
            'dataExtractType',
            metadata.dataExtractTypeId,
            'extractId',
            'name'
        );
        delete metadata.dataExtractTypeId;
        return JSON.parse(JSON.stringify(metadata));
    }
}

// Assign definition to static attributes
DataExtract.definition = require('../MetadataTypeDefinitions').dataExtract;
DataExtract.cache = {};
DataExtract.client = undefined;

module.exports = DataExtract;
