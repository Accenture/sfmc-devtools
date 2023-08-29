'use strict';

const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const cache = require('../util/cache');
const { XMLBuilder, XMLParser } = require('fast-xml-parser');

/**
 * FilterDefinition MetadataType
 *
 * @augments MetadataType
 */
class FilterDefinition extends MetadataType {
    /**
     * Retrieves all records and saves it to disk
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise.<{metadata: TYPE.FilterDefinitionMap, type: string}>} Promise of items
     */
    static async retrieve(retrieveDir) {
        // #1 get the list via SOAP cause the corresponding REST call has no BU filter apparently
        // for reference the rest path: '/automation/v1/filterdefinitions?view=categoryinfo'

        const soapFields = ['DataFilter', 'ObjectID', 'CustomerKey', 'Description', 'Name'];
        /**
         * @type {TYPE.FilterDefinitionSOAPItemMap[]}
         */
        const responseSOAP = await this.client.soap.retrieveBulk(this.definition.type, soapFields);
        console.log('responseSOAP', responseSOAP); // eslint-disable-line no-console

        // backup REST value of the keyField
        const keyFieldBak = this.definition.keyField;
        this.definition.keyField = 'CustomerKey';
        const responseSOAPMap = this.parseResponseBody(responseSOAP);
        // restore the keyField to its REST value
        this.definition.keyField = keyFieldBak;
        console.log('responseSOAPMap', responseSOAPMap); // eslint-disable-line no-console

        /**
         * @type {TYPE.FilterDefinitionSOAPItem[]}
         */
        const responseSOAPList = responseSOAP.Results.filter((item) => {
            if (item.ObjectState) {
                Util.logger.debug(`Filtered filterDefinition ${item.name}: ${item.ObjectState}`);
                return false;
            } else {
                return true;
            }
        });

        // #2
        // /automation/v1/filterdefinitions/<id>
        const responseREST = (
            await Promise.all(
                responseSOAPList.map((item) =>
                    this.client.rest.get('/email/v1/filters/filterdefinition/' + item.ObjectID)
                )
            )
        ).map((item) => {
            // description is not returned when empty
            item.description ||= '';
            // add extra info from XML
            item.c__soap_DataFilter = responseSOAPMap[item.key].DataFilter;
            return item;
        });
        console.log('responseREST', responseREST); // eslint-disable-line no-console
        const results = this.parseResponseBody({ Results: responseREST });
        if (retrieveDir) {
            const savedMetadata = await this.saveResults(results, retrieveDir, null, null);
            Util.logger.info(
                `Downloaded: ${this.definition.type} (${Object.keys(savedMetadata).length})`
            );
        }

        return { metadata: results, type: this.definition.type };
    }
    /**
     * Retrieves all records for caching
     *
     * @returns {Promise.<{metadata: TYPE.FilterDefinitionMap, type: string}>} Promise of items
     */
    static async retrieveForCache() {
        return this.retrieve(null);
    }

    /**
     * manages post retrieve steps
     *
     * @param {TYPE.FilterDefinitionItem} item a single record
     * @returns {TYPE.FilterDefinitionItem} parsed metadata definition
     */
    static async postRetrieveTasks(item) {
        return this.parseMetadata(item);
    }
    /**
     * parses retrieved Metadata before saving
     *
     * @param {TYPE.FilterDefinitionItem} metadata a single record
     * @returns {TYPE.FilterDefinitionItem} parsed metadata definition
     */
    static async parseMetadata(metadata) {
        try {
            // folder
            metadata.r__folder_Path = cache.searchForField(
                'folder',
                metadata.categoryId,
                'ID',
                'Path'
            );
            delete metadata.categoryId;

            if (metadata.derivedFromType === 2) {
                // DataExtension
                metadata.r__dataExtension_CustomerKey = cache.searchForField(
                    'dataExtension',
                    metadata.derivedFromObjectId,
                    'ObjectID',
                    'CustomerKey'
                );
            }
            metadata.del__derivedFromObjectId = metadata.derivedFromObjectId; // TEMP for DEBUGGING / remove before release
            metadata.del__derivedFromType = metadata.derivedFromType; // TEMP for DEBUGGING / remove before release
            delete metadata.derivedFromObjectId;
            delete metadata.derivedFromType;

            const xmlToJson = new XMLParser({ ignoreAttributes: false });
            metadata.c__filterDefinition = xmlToJson.parse(metadata.filterDefinitionXml);

            // TODO check if Condition ID needs to be resolved or can be ignored
        } catch (ex) {
            Util.logger.error(
                `FilterDefinition '${metadata.name}' (${metadata.key}): ${ex.message}`
            );
        }
        return metadata;
    }
    /**
     * prepares a item for deployment
     *
     * @param {TYPE.FilterDefinitionItem} metadata a single record
     * @returns {Promise.<TYPE.FilterDefinitionItem>} Promise of updated single item
     */
    static async preDeployTasks(metadata) {
        // folder
        metadata.categoryId = cache.searchForField('folder', metadata.r__folder_Path, 'Path', 'ID');
        delete metadata.r__folder_Path;

        if (metadata.derivedFromObjectTypeName === 'SubscriberAttributes') {
            // List
            metadata.derivedFromType = 1;
            metadata.derivedFromObjectId = '00000000-0000-0000-0000-000000000000';
        } else {
            // DataExtension
            metadata.derivedFromType = 2;

            if (metadata.r__dataExtension_CustomerKey) {
                metadata.derivedFromObjectId = cache.searchForField(
                    'dataExtension',
                    metadata.r__dataExtension_CustomerKey,
                    'CustomerKey',
                    'ObjectID'
                );
                delete metadata.r__dataExtension_CustomerKey;
            }
        }

        const jsonToXml = new XMLBuilder({ ignoreAttributes: false });
        metadata.filterDefinitionXml = jsonToXml.build(metadata.c__filterDefinition);
        delete metadata.c__filterDefinition;
        delete metadata.c__soap_DataFilter;

        return metadata;
    }
    /**
     * Creates a single item
     *
     * @param {TYPE.FilterDefinitionItem} metadata a single item
     * @returns {Promise.<TYPE.FilterDefinitionItem>} Promise
     */
    static create(metadata) {
        // TODO test the create
        return super.createREST(metadata, '/email/v1/filters/filterdefinition/');
    }
    /**
     * Updates a single item
     *
     * @param {TYPE.FilterDefinitionItem} metadata a single item
     * @returns {Promise.<TYPE.FilterDefinitionItem>} Promise
     */
    static update(metadata) {
        // TODO test the update
        // TODO figure out how to get the ID on the fly
        return super.updateREST(metadata, '/email/v1/filters/filterdefinition/' + metadata.Id);
    }
}
// Assign definition to static attributes
FilterDefinition.definition = require('../MetadataTypeDefinitions').filterDefinition;

module.exports = FilterDefinition;
