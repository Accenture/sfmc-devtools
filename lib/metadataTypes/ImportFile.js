'use strict';

import MetadataType from './MetadataType.js';
import { Util } from '../util/util.js';
import File from '../util/file.js';
import cache from '../util/cache.js';

/**
 * @typedef {import('../../types/mcdev.d.js').BuObject} BuObject
 * @typedef {import('../../types/mcdev.d.js').CodeExtract} CodeExtract
 * @typedef {import('../../types/mcdev.d.js').CodeExtractItem} CodeExtractItem
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItem} MetadataTypeItem
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItemDiff} MetadataTypeItemDiff
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItemObj} MetadataTypeItemObj
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMap} MetadataTypeMap
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMapObj} MetadataTypeMapObj
 * @typedef {import('../../types/mcdev.d.js').SoapRequestParams} SoapRequestParams
 * @typedef {import('../../types/mcdev.d.js').TemplateMap} TemplateMap
 * @typedef {import('../../types/mcdev.d.js').SDKError} SDKError
 */

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
     * @param {string} [retrieveDir] Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise
     */
    static async retrieve(retrieveDir, _, __, key) {
        let objectId = null;
        if (key) {
            // using '?$filter=customerKey%20eq%20' + encodeURIComponent(key) would also work but that just retrieves more data for no reason
            objectId = await this._getObjectIdForSingleRetrieve(key);
            if (!objectId) {
                // avoid running the rest request below by returning early
                Util.logger.info(
                    `Downloaded: ${this.definition.type} (0)${Util.getKeysString(key)}`
                );
                this.postDeleteTasks(key);
                return { metadata: {}, type: this.definition.type };
            }
        }
        Util.logger.debug(' - retrieving extended metadata for SMS imports');
        const smsImportResults = await this.client.rest.getBulk(
            '/legacy/v1/beta/mobile/imports/',
            50
        );
        this.smsImports = {};
        if (smsImportResults.totalResults > 0 && smsImportResults.entry.length > 0) {
            Util.logger.info(`Caching dependent Metadata: dataExtension (source for SMS imports)`);
            const sourceObject = {};
            for (const item of smsImportResults.entry) {
                // this api does not show the key but the name is assumed to be unique
                this.smsImports[item.name] = item;

                try {
                    if (!sourceObject[item.sourceObjectId]) {
                        sourceObject[item.sourceObjectId] = await this.client.rest.get(
                            '/legacy/v1/beta/object/' + item.sourceObjectId
                        );
                    }
                    item.sourceObjectKey = sourceObject[item.sourceObjectId].key;
                } catch {
                    Util.logger.warn(
                        `endpoint /legacy/v1/beta/object/${item.sourceObjectId} does not exist`
                    );
                }
            }
        }

        return super.retrieveREST(
            retrieveDir,
            '/automation/v1/imports/' + (objectId || ''),
            null,
            key
        );
    }

    /**
     * helper for {@link MetadataType.retrieveRESTcollection}
     *
     * @param {SDKError} ex exception
     * @param {string} key id or key of item
     * @param {string} url url to call for retry
     * @returns {Promise.<any>} can return retry-result
     */
    static async handleRESTErrors(ex, key, url) {
        try {
            if (ex.code == 'ERR_BAD_RESPONSE') {
                // one more retry; it's a rare case but retrying again should solve the issue gracefully
                Util.logger.info(
                    ` - Connection problem (Code: ${ex.code}). Retrying once${
                        ex.endpoint
                            ? Util.getGrayMsg(
                                  ' - ' + ex.endpoint.split('rest.marketingcloudapis.com')[1]
                              )
                            : ''
                    }`
                );
                Util.logger.errorStack(ex);
                return await this.client.rest.get(url);
            }
        } catch {
            // no extra action needed, handled below
        }
        // if we do get here, we should log the error and continue instead of failing to download all automations
        Util.logger.error(` ☇ skipping ${this.definition.type} ${key}: ${ex.message} ${ex.code}`);
        return null;
    }

    /**
     * Retrieves import definition metadata for caching
     *
     * @param {void | string[]} [_] parameter not used
     * @param {void | string[]} [__] parameter not used
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise
     */
    static retrieveForCache(_, __, key) {
        return this.retrieve(null, null, null, key);
    }

    /**
     * Retrieve a specific Import Definition by Name
     *
     * @param {string} templateDir Directory where retrieved metadata directory will be saved
     * @param {string} name name of the metadata file
     * @param {TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {Promise.<MetadataTypeItemObj>} Promise
     */
    static async retrieveAsTemplate(templateDir, name, templateVariables) {
        // using '?$filter=name%20eq%20' + encodeURIComponent(name) would also work but that just retrieves more data for no reason
        const cache = await this.retrieveForCache(null, null, 'name:' + name);
        const metadataArr = Object.values(cache?.metadata);
        if (Array.isArray(metadataArr) && metadataArr.length) {
            // eq-operator returns a similar, not exact match and hence might return more than 1 entry
            const metadata = metadataArr.find((item) => item.name === name);
            if (!metadata) {
                Util.logger.error(`No ${this.definition.typeName} found with name "${name}"`);
                return;
            }
            const originalKey = metadata[this.definition.keyField];
            const val = JSON.parse(
                Util.replaceByObject(
                    JSON.stringify(this.postRetrieveTasks(metadata)),
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
        } else if (metadataArr) {
            Util.logger.error(`No ${this.definition.typeName} found with name "${name}"`);
        } else {
            throw new Error(
                `Encountered unknown error when retrieveing ${
                    this.definition.typeName
                } "${name}": ${JSON.stringify(metadataArr)}`
            );
        }
    }

    /**
     * helper to allow us to select single metadata entries via REST
     *
     * @private
     * @param {string} key customer key
     * @returns {Promise.<string>} objectId or enpty string
     */
    static async _getObjectIdForSingleRetrieve(key) {
        const response = await this.client.soap.retrieve('ImportDefinition', ['ObjectID'], {
            filter: key.startsWith('name:')
                ? {
                      leftOperand: 'Name',
                      operator: 'equals',
                      rightOperand: key.slice(5),
                  }
                : {
                      leftOperand: 'CustomerKey',
                      operator: 'equals',
                      rightOperand: key,
                  },
        });
        return response?.Results?.length ? response.Results[0].ObjectID : null;
    }

    /**
     * Creates a single Import File
     *
     * @param {MetadataTypeItem} importFile a single Import File
     * @returns {Promise} Promise
     */
    static create(importFile) {
        return super.createREST(importFile, '/automation/v1/imports/');
    }

    /**
     * Updates a single Import File
     *
     * @param {MetadataTypeItem} importFile a single Import File
     * @returns {Promise} Promise
     */
    static update(importFile) {
        return super.updateREST(
            importFile,
            '/automation/v1/imports/' + importFile.importDefinitionId
        );
    }

    /**
     * Deploys metadata
     *
     * @param {MetadataTypeMap} metadataMap metadata mapped by their keyField
     * @param {string} deployDir directory where deploy metadata are saved
     * @param {string} retrieveDir directory where metadata after deploy should be saved
     * @returns {Promise.<MetadataTypeMap>} Promise of keyField => metadata map
     */
    static async deploy(metadataMap, deployDir, retrieveDir) {
        if (
            Object.values(metadataMap).filter((item) => item.destination.c__type === 'SMS').length >
            0
        ) {
            Util.logger.info(`Caching dependent Metadata: dataExtension (source for SMS imports)`);

            const dataExtensionLegacyResult = await this.client.rest.getBulk(
                '/legacy/v1/beta/object/',
                500
            );
            this.dataExtensionsLegacy = {};
            if (dataExtensionLegacyResult?.entry?.length) {
                for (const item of dataExtensionLegacyResult.entry) {
                    this.dataExtensionsLegacy[item.key] = item;
                }
            }
        }

        return super.deploy(metadataMap, deployDir, retrieveDir);
    }

    /**
     * prepares a import definition for deployment
     *
     * @param {MetadataTypeItem} metadata a single importDef
     * @returns {Promise.<MetadataTypeItem>} Promise
     */
    static async preDeployTasks(metadata) {
        const fileLocation = cache.getByKey('fileLocation', metadata.source?.r__fileLocation_name);
        if (!fileLocation) {
            throw new Error(
                `fileLocation ${metadata.source?.r__fileLocation_name} not found in cache`
            );
        }

        metadata.fileTransferLocationId = fileLocation.id;
        metadata.fileTransferLocationTypeId = fileLocation.locationTypeId;
        delete metadata.source.r__fileLocation_name;

        switch (metadata.destination.c__type) {
            case 'DataExtension': {
                if (metadata.destination.r__dataExtension_key) {
                    metadata.destinationObjectId = cache.searchForField(
                        'dataExtension',
                        metadata.destination.r__dataExtension_key,
                        'CustomerKey',
                        'ObjectID'
                    );
                    delete metadata.destination.r__dataExtension_key;
                } else {
                    throw new Error('Import Destination DataExtension not defined');
                }
                if (metadata.source.c__type === 'DataExtension' && metadata.r__dataExtension_key) {
                    // only happens for dataimport activities (summer24 release)
                    metadata.source.sourceCustomObjectId = cache.searchForField(
                        'dataExtension',
                        metadata.r__dataExtension_key,
                        'CustomerKey',
                        'ObjectID'
                    );
                    metadata.source.sourceDataExtensionName = cache.searchForField(
                        'dataExtension',
                        metadata.r__dataExtension_key,
                        'CustomerKey',
                        'Name'
                    );
                    delete metadata.r__dataExtension_key;
                }
                break;
            }
            case 'List': {
                if (metadata.destination.r__list_PathName) {
                    metadata.destinationObjectId = cache.getListObjectId(
                        metadata.destination.r__list_PathName,
                        'ObjectID'
                    );
                    // destinationId is also needed for List types
                    metadata.destinationId = cache.getListObjectId(
                        metadata.destination.r__list_PathName,
                        'ID'
                    );
                    delete metadata.destination.r__list_PathName;
                } else {
                    throw new Error('Import Destination List not defined');
                }
                break;
            }
            case 'SMS': {
                if (metadata.destination.r__mobileKeyword_key) {
                    // code
                    const codeObj = cache.getByKey(
                        'mobileCode',
                        metadata.destination.r__mobileKeyword_key.split('.')[0]
                    );
                    if (!codeObj) {
                        throw new Error(
                            `mobileCode ${metadata.destination.r__mobileKeyword_key} not found in cache`
                        );
                    }
                    metadata.code = codeObj;

                    // keyword
                    const keywordObj = cache.getByKey(
                        'mobileKeyword',
                        metadata.destination.r__mobileKeyword_key
                    );
                    if (!keywordObj) {
                        throw new Error(
                            `mobileKeyword ${metadata.destination.r__mobileKeyword_key} not found in cache`
                        );
                    }
                    metadata.keyword = keywordObj;
                } else {
                    Util.logger.error(
                        ` - importFile ${metadata[this.definition.keyField]}: No code or keyword info found. Please re-download this from the source.`
                    );
                }

                // destination
                metadata.destinationObjectId = '00000000-0000-0000-0000-000000000000';
                metadata.destinationObjectType = 'MobileSubscription';
                // source
                if (this.dataExtensionsLegacy[metadata.source.r__dataExtension_key]) {
                    metadata.sourceObjectId =
                        this.dataExtensionsLegacy[metadata.source.r__dataExtension_key].id;
                    metadata.sourceObjectName =
                        this.dataExtensionsLegacy[
                            metadata.source.r__dataExtension_key
                        ].dataExtensionName;
                    delete metadata.source.r__dataExtension_key;
                }

                Util.logger.debug(
                    ` - importFile ${metadata[this.definition.keyField]}: Import Destination Type ${
                        metadata.destination.c__type
                    } not fully supported. Deploy might fail.`
                );
                break;
            }
            default: {
                Util.logger.debug(
                    ` - importFile ${metadata[this.definition.keyField]}: Import Destination Type ${
                        metadata.destination.c__type
                    } not fully supported. Deploy might fail.`
                );
            }
        }
        if (metadata.c__blankFileProcessing) {
            // omit this if not set
            metadata.blankFileProcessingType =
                this.definition.blankFileProcessingTypeMapping[metadata.c__blankFileProcessing];
        }
        // When the destinationObjectTypeId is 584 it refers to Mobile Connect which is not supported as an Import Type
        metadata.destinationObjectTypeId =
            this.definition.destinationObjectTypeMapping[metadata.destination.c__type];
        metadata.subscriberImportTypeId =
            this.definition.subscriberImportTypeMapping[metadata.c__subscriberImportType];
        metadata.updateTypeId = this.definition.updateTypeMapping[metadata.c__dataAction];

        // re-add sendEmailNotification as we hide that during retrieve, assuming it's irrelevant since there is the other field notificationEmailAddress from which its value can be derived
        if (metadata.notificationEmailAddress) {
            metadata.sendEmailNotification = true;
        } else {
            delete metadata.notificationEmailAddress;
            metadata.sendEmailNotification = false;
        }

        delete metadata.destination;
        delete metadata.source;
        return metadata;
    }

    /**
     * manages post retrieve steps
     *
     * @param {MetadataTypeItem} metadata a single item
     * @returns {MetadataTypeItem} parsed metadata
     */
    static postRetrieveTasks(metadata) {
        metadata.destination = {
            // * When the destinationObjectTypeId is 584 it refers to Mobile Connect which is not supported as an Import Type
            c__type: Util.inverseGet(
                this.definition.destinationObjectTypeMapping,
                metadata.destinationObjectTypeId
            ),
        };
        // destination.c__type SMS & DataExtension both set fileNamingPattern to _CustomObject and they both define a DE as source
        metadata.source = {
            c__type:
                metadata.fileNamingPattern === '_CustomObject' ? 'DataExtension' : 'File Location',
        };
        try {
            metadata.source.r__fileLocation_name = cache.searchForField(
                'fileLocation',
                metadata.fileTransferLocationId,
                'id',
                'name'
            );
            delete metadata.fileTransferLocationId;
        } catch (ex) {
            Util.logger.warn(` - importFile ${metadata.customerKey}: ${ex.message}`);
        }

        switch (metadata.destination.c__type) {
            case 'DataExtension': {
                try {
                    metadata.destination.r__dataExtension_key = cache.searchForField(
                        'dataExtension',
                        metadata.destinationObjectId,
                        'ObjectID',
                        'CustomerKey'
                    );
                    delete metadata.destinationObjectId;
                } catch (ex) {
                    Util.logger.warn(` - importFile ${metadata.customerKey}: ${ex.message}`);
                }
                if (
                    metadata.source.c__type === 'DataExtension' &&
                    metadata.sourceCustomObjectId !== ''
                ) {
                    // only happens for dataimport activities (summer24 release)
                    try {
                        metadata.source.r__dataExtension_key = cache.searchForField(
                            'dataExtension',
                            metadata.sourceCustomObjectId,
                            'ObjectID',
                            'CustomerKey'
                        );
                        delete metadata.sourceCustomObjectId;
                        delete metadata.sourceDataExtensionName;
                    } catch (ex) {
                        Util.logger.warn(` - importFile ${metadata.customerKey}: ${ex.message}`);
                    }
                }

                break;
            }
            case 'List': {
                try {
                    metadata.destination.r__list_PathName = cache.getListPathName(
                        metadata.destinationObjectId,
                        'ObjectID'
                    );
                    delete metadata.destinationObjectId;
                } catch (ex) {
                    Util.logger.warn(` - importFile ${metadata.customerKey}: ${ex.message}`);
                }

                break;
            }
            case 'SMS': {
                if (this.smsImports[metadata.name]) {
                    const smsImport = this.smsImports[metadata.name];

                    // code
                    try {
                        cache.searchForField('mobileCode', smsImport.code?.code, 'code', 'code');
                    } catch (ex) {
                        Util.logger.warn(` - importFile ${metadata.customerKey}: ${ex.message}`);
                    }
                    // keyword
                    try {
                        cache.searchForField(
                            'mobileKeyword',
                            smsImport.keyword?.keyword,
                            'c__codeKeyword',
                            'c__codeKeyword'
                        );
                    } catch (ex) {
                        Util.logger.warn(` - importFile ${metadata.customerKey}: ${ex.message}`);
                    }

                    // code + keyword
                    metadata.destination.r__mobileKeyword_key =
                        smsImport.code?.code + '.' + smsImport.keyword?.keyword;
                    // source dataExtension
                    if (smsImport.sourceObjectKey) {
                        metadata.source.r__dataExtension_key = smsImport.sourceObjectKey;
                    }
                } else {
                    Util.logger.warn(
                        ` - importFile ${metadata.customerKey}: Could not find mobile code and keyword nor source for this SMS import activity.`
                    );
                }
                // remove empty desitination
                delete metadata.destinationObjectId;

                break;
            }
            default: {
                Util.logger.debug(
                    ` - importFile ${metadata.customerKey}: Destination Type ${metadata.destinationObjectTypeId} not fully supported. Deploy might fail.`
                );
            }
        }
        delete metadata.destinationObjectTypeId;

        if (metadata.blankFileProcessingType) {
            // omit this if not set
            metadata.c__blankFileProcessing = Util.inverseGet(
                this.definition.blankFileProcessingTypeMapping,
                metadata.blankFileProcessingType
            );
            delete metadata.blankFileProcessingType;
        }

        if (!metadata.notificationEmailAddress) {
            metadata.notificationEmailAddress = '';
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
     * Delete a metadata item from the specified business unit
     *
     * @param {string} key Identifier of data extension
     * @returns {Promise.<boolean>} deletion success flag
     */
    static async deleteByKey(key) {
        // delete only works with the query's object id
        const objectId = key ? await this._getObjectIdForSingleRetrieve(key) : null;
        if (!objectId) {
            await this.deleteNotFound(key);
            return false;
        }
        return super.deleteByKeyREST('/automation/v1/imports/' + objectId, key);
    }
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
ImportFile.definition = MetadataTypeDefinitions.importFile;

export default ImportFile;
