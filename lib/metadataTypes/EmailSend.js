'use strict';

import MetadataType from './MetadataType.js';
import { Util } from '../util/util.js';
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
 */

/**
 * MessageSendActivity MetadataType
 *
 * @augments MetadataType
 */
class EmailSend extends MetadataType {
    /**
     * Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     *
     * @param {string} [retrieveDir] Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static retrieve(retrieveDir, _, __, key) {
        /** @type {SoapRequestParams} */
        let requestParams = {
            filter: {
                leftOperand: {
                    // somehow that parameter controls visible (non deleted?) email send activities
                    leftOperand: 'IsPlatformObject',
                    operator: 'equals',
                    rightOperand: false,
                },
                operator: 'AND',
                rightOperand: {
                    leftOperand: 'Description',
                    operator: 'notEquals',
                    rightOperand: 'SFSendDefinition',
                },
            },
        };
        if (key) {
            // move original filter down one level into rightOperand and add key filter into leftOperand
            requestParams = {
                filter: {
                    leftOperand: {
                        leftOperand: 'CustomerKey',
                        operator: 'equals',
                        rightOperand: key,
                    },
                    operator: 'AND',
                    rightOperand: requestParams.filter,
                },
            };
        }
        return super.retrieveSOAP(retrieveDir, requestParams, key);
    }

    /**
     * Updates a single item
     *
     * @param {MetadataTypeItem} metadataItem a single item
     * @returns {Promise} Promise
     */
    static update(metadataItem) {
        return super.updateSOAP(metadataItem);
    }

    /**
     * Creates a single item
     *
     * @param {MetadataTypeItem} metadataItem a single item
     * @returns {Promise} Promise
     */
    static create(metadataItem) {
        return super.createSOAP(metadataItem);
    }

    /**
     * Delete a metadata item from the specified business unit
     *
     * @param {string} customerKey Identifier of data extension
     * @returns {Promise.<boolean>} deletion success status
     */
    static deleteByKey(customerKey) {
        return super.deleteByKeySOAP(customerKey);
    }

    /**
     * prepares a single item for deployment
     *
     * @param {MetadataTypeItem} metadata a single script activity definition
     * @returns {Promise.<MetadataTypeItem>} Promise
     */
    static async preDeployTasks(metadata) {
        // re-add IsPlatformObject, required for visibility
        metadata.IsPlatformObject = false;
        // folder
        super.setFolderId(metadata);
        // email; in case we still have Email.ID, keep it but warn
        metadata.Email ||= {};
        if (metadata.r__email_Name) {
            // classic
            metadata.Email.ID = cache.searchForField('email', metadata.r__email_Name, 'Name', 'ID');
            delete metadata.r__email_Name;
        } else if (metadata.r__asset_customerKey) {
            // content builder
            // * this ignores r__asset_name_readOnly on purpose\ as that is only unique per parent folder but useful during PR reviews
            // will try to find the key with the bu mid at the end, if unable, will try to find the key without it
            try {
                // check asset key as provided
                metadata.Email.ID = cache.searchForField(
                    'asset',
                    metadata.r__asset_customerKey,
                    'customerKey',
                    'legacyData.legacyId'
                );
                delete metadata.r__asset_customerKey;
                delete metadata.r__asset_name_readOnly;
            } catch {
                // if we deploy to another BU, try applying the BU's MID to the end, which we do in preDeployTasks for assets

                // get suffix to update customer key at the end
                const suffix = '-' + this.buObject.mid;

                metadata.Email.ID = cache.searchForField(
                    'asset',
                    metadata.r__asset_customerKey.slice(0, Math.max(0, 36 - suffix.length)) +
                        suffix,
                    'customerKey',
                    'legacyData.legacyId'
                );
                delete metadata.r__asset_customerKey;
                delete metadata.r__asset_name_readOnly;
            }
        } else if (metadata.Email.ID) {
            Util.logger.warn(
                ` - ${this.definition.type} ${metadata[this.definition.nameField]} (${
                    metadata[this.definition.keyField]
                }): Email.ID was provided manually in your deployment file. We recommend using r__asset_customerKey instead.`
            );
            try {
                // content builder - test only
                cache.searchForField(
                    'asset',
                    metadata.Email.ID,
                    'legacyData.legacyId',
                    'customerKey'
                );
            } catch {
                try {
                    // classic - test only
                    cache.searchForField('email', metadata.Email.ID, 'ID', 'Name');
                } catch {
                    throw new Error(
                        ` ☇ skipping ${this.definition.type} ${metadata.Name} (${metadata.CustomerKey}): Could not find email with ID ${metadata.Email.ID} in Content Builder or Classic Emails.`
                    );
                }
            }
        }
        // Target Audience DataExtension
        // normalize first because this can be an array
        if (!metadata.SendDefinitionList) {
            metadata.SendDefinitionList = [];
        } else if (!Array.isArray(metadata.SendDefinitionList)) {
            metadata.SendDefinitionList = [metadata.SendDefinitionList];
        }
        // Target Audience source
        // - DataSourceTypeID=CustomObject --> DataExtension is source; list is also defined
        // - DataSourceTypeID=List --> List is source; DE is not defined
        for (const sdl of metadata.SendDefinitionList) {
            // get DataExtension (optional)
            if (sdl.r__dataExtension_CustomerKey) {
                if (sdl.DataSourceTypeID !== 'CustomObject') {
                    throw new Error(
                        `Expecting DataSourceTypeID to equal 'CustomObject' when r__dataExtension_CustomerKey is defined; Found '${sdl.DataSourceTypeID}'`
                    );
                }
                sdl.CustomObjectID = cache.searchForField(
                    'dataExtension',
                    sdl.r__dataExtension_CustomerKey,
                    'CustomerKey',
                    'ObjectID'
                );
                delete sdl.r__dataExtension_CustomerKey;
            } else if (sdl.DataSourceTypeID === 'CustomObject') {
                throw new Error(
                    `Expecting r__dataExtension_CustomerKey to be defined if DataSourceTypeID='CustomObject'`
                );
            }
            if (!sdl.SalesForceObjectID || sdl.SalesForceObjectID === '') {
                // otherwise this causes error 42117 / invalid ObjectID
                delete sdl.SalesForceObjectID;
            }
            // get List (required)
            if (sdl.r__list_PathName) {
                sdl.List = {
                    ID: cache.getListObjectId(sdl.r__list_PathName, 'ID'),
                };
                delete sdl.r__list_PathName;
            } else if (sdl.SendDefinitionListType === 'SourceList') {
                // dont throw an error for type 'ExclusionList'
                throw new Error(
                    `Field SendDefinitionList.r__list_PathName was not defined. Please try re-retrieving this ESD from your source BU.`
                );
            }
        }

        // sender profile
        if (metadata.r__senderProfile_CustomerKey) {
            cache.searchForField(
                'senderProfile',
                metadata.r__senderProfile_CustomerKey,
                'CustomerKey',
                'CustomerKey'
            );
            metadata.SenderProfile = {
                CustomerKey: metadata.r__senderProfile_CustomerKey,
            };
            delete metadata.r__senderProfile_CustomerKey;
        }
        // send classification
        if (metadata.r__sendClassification_CustomerKey) {
            cache.searchForField(
                'sendClassification',
                metadata.r__sendClassification_CustomerKey,
                'CustomerKey',
                'CustomerKey'
            );
            metadata.SendClassification = {
                CustomerKey: metadata.r__sendClassification_CustomerKey,
            };
            delete metadata.r__sendClassification_CustomerKey;
        }
        // delivery profile
        if (metadata.r__deliveryProfile_key) {
            cache.searchForField('deliveryProfile', metadata.r__deliveryProfile_key, 'key', 'key');
            metadata.DeliveryProfile = {
                CustomerKey: metadata.r__deliveryProfile_key,
            };
            delete metadata.r__deliveryProfile_key;
        }

        return metadata;
    }

    /**
     * manages post retrieve steps
     *
     * @param {MetadataTypeItem} metadata a single query
     * @returns {MetadataTypeItem} Array with one metadata object and one query string
     */
    static postRetrieveTasks(metadata) {
        // remove IsPlatformObject, always has to be 'false'
        delete metadata.IsPlatformObject;
        // folder
        super.setFolderPath(metadata);

        // email
        if (metadata.Email?.ID) {
            try {
                // content builder
                const contentBuilderEmailName = cache.searchForField(
                    'asset',
                    metadata.Email.ID,
                    'legacyData.legacyId',
                    'name'
                );
                metadata.r__asset_name_readOnly = contentBuilderEmailName;
                const contentBuilderEmailKey = cache.searchForField(
                    'asset',
                    metadata.Email.ID,
                    'legacyData.legacyId',
                    'customerKey'
                );
                metadata.r__asset_customerKey = contentBuilderEmailKey;
                delete metadata.Email;
            } catch {
                try {
                    // classic
                    const classicEmail = cache.searchForField(
                        'email',
                        metadata.Email.ID,
                        'ID',
                        'Name'
                    );
                    metadata.r__email_Name = classicEmail;
                    delete metadata.Email;
                } catch {
                    Util.logger.warn(
                        ` - ${this.definition.type} ${metadata[this.definition.nameField]} (${
                            metadata[this.definition.keyField]
                        }): Could not find email with ID ${
                            metadata.Email.ID
                        } Content Builder or Classic Emails.`
                    );
                }
            }
        }
        // Target Audience DataExtension
        // normalize first because this can be an array
        if (!metadata.SendDefinitionList) {
            metadata.SendDefinitionList = [];
        } else if (!Array.isArray(metadata.SendDefinitionList)) {
            metadata.SendDefinitionList = [metadata.SendDefinitionList];
        }
        // Target Audience DataExtension
        for (const sdl of metadata.SendDefinitionList) {
            // get DataExtension keys
            if (sdl.CustomObjectID) {
                try {
                    sdl.r__dataExtension_CustomerKey = cache.searchForField(
                        'dataExtension',
                        sdl.CustomObjectID,
                        'ObjectID',
                        'CustomerKey'
                    );
                    delete sdl.CustomObjectID;
                } catch {
                    Util.logger.warn(
                        ` - ${this.definition.type} ${metadata[this.definition.nameField]} (${
                            metadata[this.definition.keyField]
                        }): Could not find Target Audience (DataExtension) with ObjectID ${
                            sdl.CustomObjectID
                        }.`
                    );
                }
            }
            // List
            if (sdl.List?.ID) {
                try {
                    sdl.r__list_PathName = cache.getListPathName(sdl.List.ID, 'ID');
                    delete sdl.List;
                } catch (ex) {
                    Util.logger.warn(
                        ` - ${this.definition.type} ${metadata[this.definition.nameField]} (${
                            metadata[this.definition.keyField]
                        }): ${ex.message}`
                    );
                }
            }
            if (!sdl.SalesForceObjectID) {
                // otherwise this causes error 42117 / invalid ObjectID
                delete sdl.SalesForceObjectID;
            }
        }

        // sender profile
        if (metadata.SenderProfile?.CustomerKey) {
            try {
                cache.searchForField(
                    'senderProfile',
                    metadata.SenderProfile.CustomerKey,
                    'CustomerKey',
                    'CustomerKey'
                );
                metadata.r__senderProfile_CustomerKey = metadata.SenderProfile.CustomerKey;
                delete metadata.SenderProfile;
            } catch (ex) {
                Util.logger.warn(
                    ` - ${this.definition.type} ${metadata.CustomerKey}: ${ex.message}`
                );
            }
        }
        // send classification
        if (metadata.SendClassification?.CustomerKey) {
            try {
                cache.searchForField(
                    'sendClassification',
                    metadata.SendClassification.CustomerKey,
                    'CustomerKey',
                    'CustomerKey'
                );
                metadata.r__sendClassification_CustomerKey =
                    metadata.SendClassification.CustomerKey;
                delete metadata.SendClassification;
            } catch (ex) {
                Util.logger.warn(
                    ` - ${this.definition.type} ${metadata.CustomerKey}: ${ex.message}`
                );
            }
        }
        // delivery profile
        if (metadata.DeliveryProfile?.CustomerKey) {
            try {
                cache.searchForField(
                    'deliveryProfile',
                    metadata.DeliveryProfile.CustomerKey,
                    'key',
                    'key'
                );
                metadata.r__deliveryProfile_key = metadata.DeliveryProfile.CustomerKey;
                delete metadata.DeliveryProfile;
            } catch (ex) {
                Util.logger.warn(
                    ` - ${this.definition.type} ${metadata.CustomerKey}: ${ex.message}`
                );
            }
        }

        return metadata;
    }
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
EmailSend.definition = MetadataTypeDefinitions.emailSend;

export default EmailSend;
