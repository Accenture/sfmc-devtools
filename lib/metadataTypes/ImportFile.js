'use strict';

const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const File = require('../util/file');
const cache = require('../util/cache');

/**
 * ImportFile MetadataType
 *
 * @augments MetadataType
 */
class ImportFile extends MetadataType {
    /**
     * Retrieves Metadata of Import File.
     * Endpoint /automation/v1/imports/ return all Import Files with all details.
     * Currently it is not needed to loop over Imports with endpoint /automation/v1/imports/{id}
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void} [_] unused parameter
     * @param {void} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise
     */
    static retrieve(retrieveDir, _, __, key) {
        return super.retrieveREST(retrieveDir, '/automation/v1/imports/', null, key);
    }

    /**
     * Retrieves import definition metadata for caching
     *
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise
     */
    static async retrieveForCache() {
        return super.retrieveREST(null, '/automation/v1/imports/');
    }

    /**
     * Retrieve a specific Import Definition by Name
     *
     * @param {string} templateDir Directory where retrieved metadata directory will be saved
     * @param {string} name name of the metadata file
     * @param {TYPE.TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {Promise.<TYPE.MetadataTypeItemObj>} Promise
     */
    static async retrieveAsTemplate(templateDir, name, templateVariables) {
        const res = await this.client.rest.get(
            '/automation/v1/imports/?$filter=name%20eq%20' + encodeURIComponent(name)
        );
        if (Array.isArray(res?.items) && res?.items.length) {
            // eq-operator returns a similar, not exact match and hence might return more than 1 entry
            const metadata = res.items.find((item) => item.name === name);
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
            await File.writeJSONToFile(
                [templateDir, this.definition.type].join('/'),
                originalKey + '.' + this.definition.type + '-meta',
                JSON.parse(Util.replaceByObject(JSON.stringify(val), templateVariables))
            );
            Util.logger.info(`- templated ${this.definition.type}: ${name}`);
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
     *
     * @param {TYPE.MetadataTypeItem} importDef a single importDef
     * @returns {TYPE.MetadataTypeItem} metadata
     */
    static postRetrieveTasks(importDef) {
        const val = this.parseMetadata(importDef);
        return val;
    }

    /**
     * Creates a single Import File
     *
     * @param {TYPE.MetadataTypeItem} importFile a single Import File
     * @returns {Promise} Promise
     */
    static create(importFile) {
        return super.createREST(importFile, '/automation/v1/imports/');
    }

    /**
     * Updates a single Import File
     *
     * @param {TYPE.MetadataTypeItem} importFile a single Import File
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
     *
     * @param {TYPE.MetadataTypeItem} metadata a single importDef
     * @returns {Promise} Promise
     */
    static async preDeployTasks(metadata) {
        metadata.fileTransferLocationId = cache.searchForField(
            'fileLocation',
            metadata.r__fileLocation_name,
            'name',
            'id'
        );
        delete metadata.r__fileLocation_name;

        if (metadata.c__destinationType === 'DataExtension') {
            if (metadata.r__dataExtension_CustomerKey) {
                metadata.destinationObjectId = cache.searchForField(
                    'dataExtension',
                    metadata.r__dataExtension_CustomerKey,
                    'CustomerKey',
                    'ObjectID'
                );
                delete metadata.r__dataExtension_CustomerKey;
            } else {
                throw new Error('Import Destination DataExtension not defined');
            }
        } else if (metadata.c__destinationType === 'List') {
            if (metadata.r__list_PathName) {
                metadata.destinationObjectId = cache.getListObjectId(
                    metadata.r__list_PathName,
                    'ObjectID'
                );
                // destinationId is also needed for List types
                metadata.destinationId = cache.getListObjectId(metadata.r__list_PathName, 'ID');
                delete metadata.r__list_PathName;
            } else {
                throw new Error('Import Destination List not defined');
            }
        } else {
            Util.logger.debug(
                ` - importFile ${metadata[this.definition.keyField]}: Import Destination Type ${
                    metadata.c__destinationType
                } not fully supported. Deploy might fail.`
            );
        }
        // When the destinationObjectTypeId is 584 it refers to Mobile Connect which is not supported as an Import Type
        metadata.destinationObjectTypeId =
            this.definition.destinationObjectTypeMapping[metadata.c__destinationType];
        metadata.subscriberImportTypeId =
            this.definition.subscriberImportTypeMapping[metadata.c__subscriberImportType];
        metadata.updateTypeId = this.definition.updateTypeMapping[metadata.c__dataAction];
        return metadata;
    }
    /**
     * helper function to get a list of keys where notification email address should be updated
     *
     * @param {TYPE.MetadataTypeMap} metadataMap metadata mapped by their keyField
     * @returns {string[]} list of keys
     */
    static async getKeysToSetNotifications(metadataMap) {
        const keysForDeploy = [];
        if (Object.keys(metadataMap).length) {
            Util.logger.info(
                `Searching for ${this.definition.type} keys among downloaded items where notification email address should be updated:`
            );
            for (const item of Object.values(metadataMap)) {
                if (item['notificationEmailAddress'] === Util.OPTIONS.completionEmail) {
                    Util.logger.verbose(
                        ` ☇ skipping ${this.definition.type} ${
                            item[this.definition.keyField]
                        }: email address does not need to be updated`
                    );
                } else {
                    keysForDeploy.push(item[this.definition.keyField]);
                    Util.logger.info(
                        ` - added ${this.definition.type} to updateNotification queue: ${
                            item[this.definition.keyField]
                        }`
                    );
                }
            }
            Util.logger.info(
                `Found ${keysForDeploy.length} ${this.definition.type} keys to update email notification address`
            );
        }
        return keysForDeploy;
    }

    /**
     * parses retrieved Metadata before saving
     *
     * @param {TYPE.MetadataTypeItem} metadata a single import definition
     * @returns {TYPE.MetadataTypeItem} parsed metadata definition
     */
    static parseMetadata(metadata) {
        metadata.r__fileLocation_name = cache.searchForField(
            'fileLocation',
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
                Util.logger.warn(` - ImportFile ${metadata.customerKey}: ${ex.message}`);
            }
        } else if (metadata.c__destinationType === 'List') {
            try {
                metadata.r__list_PathName = cache.getListPathName(
                    metadata.destinationObjectId,
                    'ObjectID'
                );
                delete metadata.destinationObjectId;
            } catch (ex) {
                Util.logger.warn(` - ImportFile ${metadata.customerKey}: ${ex.message}`);
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
    /**
     * helper for {@link MetadataType.upsert}
     *
     * @param {TYPE.MetadataTypeMap} metadataMap list of metadata
     * @param {string} metadataKey key of item we are looking at
     * @param {boolean} hasError error flag from previous code
     * @param {TYPE.MetadataTypeItemDiff[]} metadataToUpdate list of items to update
     * @param {TYPE.MetadataTypeItem[]} metadataToCreate list of items to create
     * @returns {'create' | 'update' | 'skip'} action to take
     */
    static createOrUpdate(metadataMap, metadataKey, hasError, metadataToUpdate, metadataToCreate) {
        if (Util.OPTIONS.clear) {
            metadataMap[metadataKey].sendEmailNotification = false;
            metadataMap[metadataKey].notificationEmailAddress = '';
        } else if (Util.OPTIONS.completionEmail) {
            metadataMap[metadataKey].sendEmailNotification = true;
            metadataMap[metadataKey].notificationEmailAddress = Util.OPTIONS.completionEmail;
        }
        const createOrUpdateAction = super.createOrUpdate(
            metadataMap,
            metadataKey,
            hasError,
            metadataToUpdate,
            metadataToCreate
        );
        return createOrUpdateAction;
    }
}

// Assign definition to static attributes
ImportFile.definition = require('../MetadataTypeDefinitions').importFile;

module.exports = ImportFile;
