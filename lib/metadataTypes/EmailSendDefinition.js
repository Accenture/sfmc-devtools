'use strict';

const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const cache = require('../util/cache');

/**
 * MessageSendActivity MetadataType
 *
 * @augments MetadataType
 */
class EmailSendDefinition extends MetadataType {
    /**
     * Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void} [_] unused parameter
     * @param {void} [__] unused parameter
     * @param {void} [___] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of metadata
     */
    static retrieve(retrieveDir, _, __, ___, key) {
        /** @type {TYPE.SoapRequestParams} */
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
        return super.retrieveSOAP(retrieveDir, null, requestParams);
    }

    /**
     * Updates a single item
     *
     * @param {TYPE.MetadataTypeItem} metadataItem a single item
     * @returns {Promise} Promise
     */
    static update(metadataItem) {
        return super.updateSOAP(metadataItem);
    }

    /**
     * Creates a single item
     *
     * @param {TYPE.MetadataTypeItem} metadataItem a single item
     * @returns {Promise} Promise
     */
    static create(metadataItem) {
        return super.createSOAP(metadataItem);
    }

    /**
     * Delete a metadata item from the specified business unit
     *
     * @param {TYPE.BuObject} buObject references credentials
     * @param {string} customerKey Identifier of data extension
     * @returns {Promise.<boolean>} deletion success status
     */
    static deleteByKey(buObject, customerKey) {
        return super.deleteByKeySOAP(buObject, customerKey, false);
    }

    /**
     * prepares a single item for deployment
     *
     * @param {TYPE.MetadataTypeItem} metadata a single script activity definition
     * @returns {Promise.<TYPE.MetadataTypeItem>} Promise
     */
    static async preDeployTasks(metadata) {
        // re-add IsPlatformObject, required for visibility
        metadata.IsPlatformObject = false;
        // folder
        metadata.CategoryID = cache.searchForField('folder', metadata.r__folder_Path, 'Path', 'ID');
        delete metadata.r__folder_Path;
        // email
        metadata.Email = {};
        if (metadata.r__email_Name) {
            // classic
            metadata.Email.ID = cache.searchForField('email', metadata.r__email_Name, 'Name', 'ID');
            delete metadata.r__email_Name;
        } else if (metadata.r__assetMessage_Key) {
            // content builder
            // * this ignores r__assetMessage_Name on purpose as that is only unique per parent folder but useful during PR reviews
            metadata.Email.ID = cache.searchForField(
                'asset',
                metadata.r__assetMessage_Key,
                'customerKey',
                'legacyData.legacyId'
            );
            delete metadata.r__assetMessage_Key;
            delete metadata.r__assetMessage_Name;
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
            if (sdl.r__dataExtension_Key) {
                if (sdl.DataSourceTypeID !== 'CustomObject') {
                    throw new Error(
                        `Skipping ${metadata.Name} (${metadata.CustomerKey}): Expecting DataSourceTypeID to equal 'CustomObject' when r__dataExtension_Key is defined; Found '${sdl.DataSourceTypeID}'`
                    );
                }
                sdl.CustomObjectID = cache.searchForField(
                    'dataExtension',
                    sdl.r__dataExtension_Key,
                    'CustomerKey',
                    'ObjectID'
                );
                delete sdl.r__dataExtension_Key;
            } else if (sdl.DataSourceTypeID === 'CustomObject') {
                throw new Error(
                    `Skipping ${metadata.Name} (${metadata.CustomerKey}): Expecting r__dataExtension_Key to be defined if DataSourceTypeID='CustomObject'`
                );
            }
            // get List (required)
            if (sdl.r__list_PathName) {
                sdl.List = {
                    ID: cache.getListObjectId(sdl.r__list_PathName, 'ID'),
                };
                delete sdl.r__list_PathName;
            } else {
                throw new Error(
                    `Field SendDefinitionList.r__list_PathName was not defined. Please try re-retrieving this ESD from your source BU.`
                );
            }
        }

        return metadata;
    }

    /**
     * manages post retrieve steps
     *
     * @param {TYPE.MetadataTypeItem} metadata a single query
     * @returns {TYPE.MetadataTypeItem} Array with one metadata object and one query string
     */
    static postRetrieveTasks(metadata) {
        return this.parseMetadata(metadata);
    }
    /**
     * parses retrieved Metadata before saving
     *
     * @param {TYPE.MetadataTypeItem} metadata a single query activity definition
     * @returns {TYPE.MetadataTypeItem} Array with one metadata object and one sql string
     */
    static parseMetadata(metadata) {
        // remove IsPlatformObject, always has to be 'false'
        delete metadata.IsPlatformObject;
        // folder
        super.setFolderPath(metadata);

        // email
        try {
            // classic
            const classicEmail = cache.searchForField('email', metadata.Email.ID, 'ID', 'Name');
            metadata.r__email_Name = classicEmail;
            delete metadata.Email;
        } catch {
            try {
                // content builder
                const contentBuilderEmailName = cache.searchForField(
                    'asset',
                    metadata.Email.ID,
                    'legacyData.legacyId',
                    'name'
                );
                metadata.r__assetMessage_Name = contentBuilderEmailName;
                const contentBuilderEmailKey = cache.searchForField(
                    'asset',
                    metadata.Email.ID,
                    'legacyData.legacyId',
                    'customerKey'
                );
                metadata.r__assetMessage_Key = contentBuilderEmailKey;
                delete metadata.Email;
            } catch {
                Util.logger.warn(
                    ` - ${this.definition.typeName} '${metadata.Name}'/'${metadata.CustomerKey}': Could not find email with ID ${metadata.Email.ID} in Classic nor in Content Builder.`
                );
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
                    sdl.r__dataExtension_Key = cache.searchForField(
                        'dataExtension',
                        sdl.CustomObjectID,
                        'ObjectID',
                        'CustomerKey'
                    );
                    delete sdl.CustomObjectID;
                } catch {
                    Util.logger.warn(
                        ` - ${this.definition.typeName} '${metadata.Name}'/'${metadata.CustomerKey}': Could not find Target Audience (DataExtension) with ObjectID ${sdl.CustomObjectID}.`
                    );
                }
            }
            // List
            try {
                sdl.r__list_PathName = cache.getListPathName(sdl.List.ID, 'ID');
                delete sdl.List;
            } catch (ex) {
                Util.logger.warn(
                    ` - ${this.definition.typeName} '${metadata.Name}'/'${metadata.CustomerKey}': ${ex.message}`
                );
            }
        }

        return metadata;
    }
}

// Assign definition to static attributes
EmailSendDefinition.definition = require('../MetadataTypeDefinitions').emailSendDefinition;

module.exports = EmailSendDefinition;
