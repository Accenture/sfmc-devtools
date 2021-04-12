'use strict';

/**
 * @typedef {Object} FilterDefinitionSOAPItem
 * @property {string} ObjectID id
 * @property {string} CustomerKey key
 * @property {Object} [DataFilter] most relevant part that defines the filter
 * @property {Object} DataFilter.LeftOperand -
 * @property {string} DataFilter.LeftOperand.Property -
 * @property {string} DataFilter.LeftOperand.SimpleOperator -
 * @property {string} DataFilter.LeftOperand.Value -
 * @property {string} DataFilter.LogicalOperator -
 * @property {Object} [DataFilter.RightOperand] -
 * @property {string} DataFilter.RightOperand.Property -
 * @property {string} DataFilter.RightOperand.SimpleOperator -
 * @property {string} DataFilter.RightOperand.Value -
 * @property {string} Name name
 * @property {string} Description -
 * @property {string} [ObjectState] returned from SOAP API; used to return error messages
 *
 * @typedef {Object.<string, FilterDefinitionSOAPItem>} FilterDefinitionSOAPItemMap

 *
 * /automation/v1/filterdefinitions/<id> (not used)
 * @typedef {Object} AutomationFilterDefinitionItem
 * @property {string} id object id
 * @property {string} key external key
 * @property {string} createdDate -
 * @property {number} createdBy user id
 * @property {string} createdName -
 * @property {string} [description] (omitted by API if empty)
 * @property {string} modifiedDate -
 * @property {number} modifiedBy user id
 * @property {string} modifiedName -
 * @property {string} name name
 * @property {string} categoryId folder id
 * @property {string} filterDefinitionXml from REST API defines the filter in XML form
 * @property {1|2} derivedFromType 1:list/profile attributes/measures, 2: dataExtension
 * @property {boolean} isSendable ?
 * @property {Object} [soap__DataFilter] copied from SOAP API, defines the filter in readable form
 * @property {Object} soap__DataFilter.LeftOperand -
 * @property {string} soap__DataFilter.LeftOperand.Property -
 * @property {string} soap__DataFilter.LeftOperand.SimpleOperator -
 * @property {string} soap__DataFilter.LeftOperand.Value -
 * @property {string} soap__DataFilter.LogicalOperator -
 * @property {Object} [soap__DataFilter.RightOperand] -
 * @property {string} soap__DataFilter.RightOperand.Property -
 * @property {string} soap__DataFilter.RightOperand.SimpleOperator -
 * @property {string} soap__DataFilter.RightOperand.Value -
 *
 * /email/v1/filters/filterdefinition/<id>
 * @typedef {Object} FilterDefinitionItem
 * @property {string} id object id
 * @property {string} key external key
 * @property {string} createdDate date
 * @property {number} createdBy user id
 * @property {string} createdName name
 * @property {string} [description] (omitted by API if empty)
 * @property {string} lastUpdated date
 * @property {number} lastUpdatedBy user id
 * @property {string} lastUpdatedName name
 * @property {string} name name
 * @property {string} categoryId folder id
 * @property {string} filterDefinitionXml from REST API defines the filter in XML form
 * @property {1|2} derivedFromType 1:list/profile attributes/measures, 2: dataExtension
 * @property {string} derivedFromObjectId Id of DataExtension - present if derivedFromType=2
 * @property {'DataExtension'|'SubscriberAttributes'} derivedFromObjectTypeName -
 * @property {string} [derivedFromObjectName] name of DataExtension
 * @property {boolean} isSendable ?
 * @property {Object} [soap__DataFilter] copied from SOAP API, defines the filter in readable form
 * @property {Object} soap__DataFilter.LeftOperand -
 * @property {string} soap__DataFilter.LeftOperand.Property -
 * @property {string} soap__DataFilter.LeftOperand.SimpleOperator -
 * @property {string} soap__DataFilter.LeftOperand.Value -
 * @property {string} soap__DataFilter.LogicalOperator -
 * @property {Object} [soap__DataFilter.RightOperand] -
 * @property {string} soap__DataFilter.RightOperand.Property -
 * @property {string} soap__DataFilter.RightOperand.SimpleOperator -
 * @property {string} soap__DataFilter.RightOperand.Value -

 *
 * @typedef {Object.<string, FilterDefinitionItem>} FilterDefinitionMap
 */

const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const xml2js = require('xml2js');

/**
 * FilterDefinition MetadataType
 * @augments MetadataType
 */
class FilterDefinition extends MetadataType {
    /**
     * Retrieves all records and saves it to disk
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise<{metadata:FilterDefinitionMap,type:string}>} Promise of items
     */
    static async retrieve(retrieveDir) {
        // #1 get the list via SOAP cause the corresponding REST call has no BU filter apparently
        // for reference the rest path: '/automation/v1/filterdefinitions?view=categoryinfo'
        const keyFieldBak = this.definition.keyField;
        const soapFields = ['DataFilter', 'ObjectID', 'CustomerKey', 'Description', 'Name'];
        this.definition.keyField = 'CustomerKey';
        /**
         * @type {FilterDefinitionSOAPItemMap[]}
         */
        const responseObject = await this.retrieveSOAPBody(soapFields);
        this.definition.keyField = keyFieldBak;

        // convert back to array
        /**
         * @type {FilterDefinitionSOAPItem[]}
         */
        const listResponse = Object.keys(responseObject)
            .map((key) => responseObject[key])
            .filter((item) => {
                if (item.ObjectState) {
                    Util.logger.debug(
                        `Filtered filterDefinition ${item.name}: ${item.ObjectState}`
                    );
                    return false;
                } else {
                    return true;
                }
            });

        // #2
        // /automation/v1/filterdefinitions/<id>
        const response = (
            await Promise.all(
                listResponse.map((item) =>
                    this.client.RestClient.get({
                        uri: '/email/v1/filters/filterdefinition/' + item.ObjectID,
                    })
                )
            )
        )
            .map((item) => item.body)
            .map((item) => {
                // description is not returned when empty
                item.description = item.description || '';
                // add extra info from XML
                item.c__soap_DataFilter = responseObject[item.key].DataFilter;
                return item;
            });
        const results = this.parseResponseBody({ Results: response });
        if (retrieveDir) {
            const savedMetadata = await this.saveResults(results, retrieveDir, null, null);
            Util.logger.info(
                `Downloaded: ${this.definition.type} (${Object.keys(savedMetadata).length})`
            );
        }

        return { metadata: results, type: this.definition.type };

        // return super.retrieveSOAPgeneric(retrieveDir);
    }
    /**
     * Retrieves all records for caching
     * @returns {Promise<{metadata:FilterDefinitionMap,type:string}>} Promise of items
     */
    static async retrieveForCache() {
        return this.retrieve(null);
    }

    /**
     * manages post retrieve steps
     * @param {FilterDefinitionItem} item a single record
     * @returns {FilterDefinitionItem} parsed metadata definition
     */
    static async postRetrieveTasks(item) {
        return this.parseMetadata(item);
    }
    /**
     * parses retrieved Metadata before saving
     * @param {FilterDefinitionItem} metadata a single record
     * @returns {FilterDefinitionItem} parsed metadata definition
     */
    static async parseMetadata(metadata) {
        try {
            // folder
            metadata.r__folder_Path = Util.getFromCache(
                this.cache,
                'folder',
                metadata.categoryId,
                'ID',
                'Path'
            );
            delete metadata.categoryId;

            if (metadata.derivedFromType === 2) {
                // DataExtension
                metadata.r__dataExtension_CustomerKey = Util.getFromCache(
                    this.cache,
                    'dataExtension',
                    metadata.derivedFromObjectId,
                    'ObjectID',
                    'CustomerKey'
                );
            }
            delete metadata.derivedFromObjectId;
            delete metadata.derivedFromType;
            metadata.c__filterDefinition = await xml2js.parseStringPromise(
                metadata.filterDefinitionXml /* , options */
            );

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
     * @param {FilterDefinitionItem} metadata a single record
     * @returns {Promise<FilterDefinitionItem>} Promise of updated single item
     */
    static async preDeployTasks(metadata) {
        // folder
        metadata.categoryId = Util.getFromCache(
            this.cache,
            'folder',
            metadata.r__folder_Path,
            'Path',
            'ID'
        );
        delete metadata.r__folder_Path;

        if (metadata.derivedFromObjectTypeName === 'SubscriberAttributes') {
            // List
            metadata.derivedFromType = 1;
            metadata.derivedFromObjectId = '00000000-0000-0000-0000-000000000000';
        } else {
            // DataExtension
            metadata.derivedFromType = 2;

            if (metadata.r__dataExtension_CustomerKey) {
                metadata.derivedFromObjectId = Util.getFromCache(
                    this.cache,
                    'dataExtension',
                    metadata.r__dataExtension_CustomerKey,
                    'CustomerKey',
                    'ObjectID'
                );
                delete metadata.r__dataExtension_CustomerKey;
            }
        }
        delete metadata.c__filterDefinition;
        delete metadata.c__soap_DataFilter;

        return metadata;
    }
    /**
     * Creates a single item
     * @param {FilterDefinitionItem} metadata a single item
     * @returns {Promise<FilterDefinitionItem>} Promise
     */
    static create(metadata) {
        // TODO test the create
        return super.createREST(metadata, '/email/v1/filters/filterdefinition/');
    }
    /**
     * Updates a single item
     * @param {FilterDefinitionItem} metadata a single item
     * @returns {Promise<FilterDefinitionItem>} Promise
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
