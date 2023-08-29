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
     * @param {void} [_] unused parameter
     * @param {void} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<{metadata: TYPE.FilterDefinitionMap, type: string}>} Promise of items
     */
    static async retrieve(retrieveDir, _, __, key) {
        // #1 get the list via SOAP cause the corresponding REST call has no BU filter apparently
        // for reference the rest path: '/automation/v1/filterdefinitions?view=categoryinfo'

        const soapFields = ['DataFilter', 'ObjectID', 'CustomerKey', 'Name'];
        let requestParams;
        if (key) {
            requestParams = {
                filter: {
                    leftOperand: 'CustomerKey',
                    operator: 'equals',
                    rightOperand: key,
                },
            };
        }

        /**
         * @type {TYPE.FilterDefinitionSOAPItemMap[]}
         */
        const responseSOAP = await this.client.soap.retrieveBulk(
            this.definition.type,
            soapFields,
            requestParams
        );

        // backup REST value of the keyField
        const keyFieldBak = this.definition.keyField;
        this.definition.keyField = 'CustomerKey';
        const responseSOAPMap = this.parseResponseBody(responseSOAP, key);
        // restore the keyField to its REST value
        this.definition.keyField = keyFieldBak;

        /**
         * @type {TYPE.FilterDefinitionSOAPItem[]}
         */
        const responseSOAPList = responseSOAP.Results.filter((item) => {
            if (item.ObjectState) {
                Util.logger.debug(`Filtered filterDefinition ${item.Name}: ${item.ObjectState}`);
                return false;
            } else {
                return true;
            }
        });

        // #2
        // /automation/v1/filterdefinitions/<id>
        const metadataMap = (
            await super.retrieveRESTcollection(
                responseSOAPList.map((item) => ({
                    id: item.ObjectID,
                    uri: '/email/v1/filters/filterdefinition/' + item.ObjectID,
                }))
            )
        ).metadata;
        for (const item of Object.values(metadataMap)) {
            // description is not returned when empty
            item.description ||= '';
            // add extra info from XML
            item.c__soap_DataFilter = responseSOAPMap[item.key].DataFilter;
        }
        if (retrieveDir) {
            const savedMetadata = await this.saveResults(metadataMap, retrieveDir);
            Util.logger.info(
                `Downloaded: ${this.definition.type} (${Object.keys(savedMetadata).length})`
            );
        }

        return { metadata: metadataMap, type: this.definition.type };
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
     * parses retrieved Metadata before saving
     *
     * @param {TYPE.FilterDefinitionItem} metadata a single record
     * @returns {TYPE.FilterDefinitionItem} parsed metadata definition
     */
    static async postRetrieveTasks(metadata) {
        if (metadata.derivedFromType > 4) {
            // GUI only shows types 1,2,3,4; lets mimic that here.
            // type 6 seems to be journey related. Maybe we need to change that again in the future
            return;
        }
        try {
            // folder
            this.setFolderPath(metadata);

            switch (metadata.derivedFromType) {
                case 1: {
                    // SubscriberAttributes
                    // TODO
                    break;
                }
                case 2: {
                    // DataExtension
                    metadata.r__dataExtension_CustomerKey = cache.searchForField(
                        'dataExtension',
                        metadata.derivedFromObjectId,
                        'ObjectID',
                        'CustomerKey'
                    );
                    delete metadata.derivedFromObjectId;
                    delete metadata.derivedFromType;
                    break;
                }
                case 3: {
                    // TODO
                    break;
                }
                case 4: {
                    // TODO
                    break;
                }
                case 5: {
                    // TODO
                    break;
                }
                case 6: {
                    // TODO
                    break;
                }
            }

            const xmlToJson = new XMLParser({ ignoreAttributes: false });
            metadata.c__filterDefinition = xmlToJson.parse(metadata.filterDefinitionXml);
            // TODO map Condition ID to DataExtensionField ID
            delete metadata.filterDefinitionXml;
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
        super.setFolderId(metadata);

        if (metadata.derivedFromObjectTypeName === 'SubscriberAttributes') {
            // SubscriberAttributes
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
        return super.updateREST(
            metadata,
            '/email/v1/filters/filterdefinition/' + metadata[this.definition.idField]
        );
    }
}
// Assign definition to static attributes
FilterDefinition.definition = require('../MetadataTypeDefinitions').filterDefinition;

module.exports = FilterDefinition;
