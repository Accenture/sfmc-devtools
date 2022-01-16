'use strict';

const MetadataType = require('./MetadataType');
const Util = require('../util/util');

/**
 * MessageSendActivity MetadataType
 * @augments MetadataType
 */
class TriggeredSendDefinition extends MetadataType {
    /**
     * Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     * @param {String} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise<Object>} Promise of metadata
     */
    static retrieve(retrieveDir) {
        const requestParams = {
            filter: {
                leftOperand: {
                    // somehow that parameter controls visible (non deleted?) email send activities
                    leftOperand: 'IsPlatformObject',
                    operator: 'equals',
                    rightOperand: false,
                },
                operator: 'AND',
                rightOperand: {
                    leftOperand: 'TriggeredSendStatus',
                    operator: 'IN',
                    rightOperand: ['New', 'Active', 'Inactive'], // New, Active=Running, Inactive=Paused, (Deleted)
                },
            },
        };
        return super.retrieveSOAPgeneric(retrieveDir, null, requestParams);
    }

    /**
     * Create a single TSD.
     * @param {Object} metadata single metadata entry
     * @returns {Promise} Promise
     */
    static create(metadata) {
        return super.createSOAP(metadata);
    }

    /**
     * Updates a single TSD.
     * @param {Object} metadata single metadata entry
     * @returns {Promise} Promise
     */
    static update(metadata) {
        // * in case of update and active definition, we need to pause first.
        // * this should be done manually to not accidentally purge production queues
        return super.updateSOAP(metadata);
    }

    /**
     * Delete a metadata item from the specified business unit
     * @param {Util.BuObject} buObject references credentials
     * @param {string} customerKey Identifier of data extension
     * @returns {Promise<boolean>} deletion success status
     */
    static deleteByKey(buObject, customerKey) {
        return super.deleteByKeySOAP(buObject, customerKey, false);
    }

    /**
     * checks if the current metadata entry should be saved on retrieve or not
     * @static
     * @param {Object} metadataEntry metadata entry
     * @returns {boolean} if false, do not save
     * @memberof MetadataType
     */
    static isFiltered(metadataEntry) {
        try {
            // get folder path to be able to filter journey-created TSDs
            const folderPath = Util.getFromCache(
                this.cache,
                'folder',
                metadataEntry.CategoryID,
                'ID',
                'Path'
            );

            if (folderPath && folderPath.startsWith('Journey Builder Sends/')) {
                // filter out any triggered sends that were auto-created by journeys
                return true;
            }
        } catch (ex) {
            // handle it in parseMetadata()
        }
        return false;
    }

    /**
     * manages post retrieve steps
     * @param {Object} metadata a single query
     * @returns {Object[]} Array with one metadata object and one query string
     */
    static postRetrieveTasks(metadata) {
        return this.parseMetadata(metadata);
    }
    /**
     * parses retrieved Metadata before saving
     * @param {Object} metadata a single query activity definition
     * @returns {Array} Array with one metadata object and one sql string
     */
    static parseMetadata(metadata) {
        // remove IsPlatformObject, always has to be 'false'
        delete metadata.IsPlatformObject;
        // folder
        try {
            metadata.r__folder_Path = Util.getFromCache(
                this.cache,
                'folder',
                metadata.CategoryID,
                'ID',
                'Path'
            );
            delete metadata.CategoryID;
        } catch (ex) {
            Util.logger.warn(
                `Triggered Send '${metadata.Name}'/'${metadata.CustomerKey}': ${ex.message}`
            );
        }
        // email
        try {
            // classic
            const classicEmail = Util.getFromCache(
                this.cache,
                'email',
                metadata.Email.ID,
                'ID',
                'Name'
            );
            metadata.r__email_Name = classicEmail;
            delete metadata.Email;
        } catch (ex) {
            try {
                // content builder
                const contentBuilderEmailName = Util.getFromCache(
                    this.cache,
                    'asset',
                    metadata.Email.ID,
                    'legacyData.legacyId',
                    'name'
                );
                metadata.r__assetMessage_Name = contentBuilderEmailName;
                const contentBuilderEmailKey = Util.getFromCache(
                    this.cache,
                    'asset',
                    metadata.Email.ID,
                    'legacyData.legacyId',
                    'customerKey'
                );
                metadata.r__assetMessage_Key = contentBuilderEmailKey;
                delete metadata.Email;
            } catch (ex) {
                Util.logger.warn(
                    `${this.definition.typeName} '${metadata.Name}'/'${metadata.CustomerKey}': Could not find email with ID ${metadata.Email.ID} in Classic nor in Content Builder.`
                );
            }
        }
        // List
        try {
            metadata.r__list_PathName = Util.getListPathNameFromCache(
                this.cache,
                metadata.List.ID,
                'ID'
            );
            delete metadata.List;
        } catch (ex) {
            Util.logger.warn(
                `${this.definition.typeName} '${metadata.Name}'/'${metadata.CustomerKey}': ${ex.message}`
            );
        }

        return metadata;
    }
    /**
     * prepares a TSD for deployment
     * @param {Object} metadata of a single TSD
     * @returns {Object} metadata object
     */
    static async preDeployTasks(metadata) {
        const cachedVersion = this.cache[this.definition.type][metadata.CustomerKey];
        if (
            cachedVersion &&
            cachedVersion.TriggeredSendStatus === 'Active' &&
            cachedVersion.TriggeredSendStatus === metadata.TriggeredSendStatus
        ) {
            throw new Error(
                `Please pause the Triggered Send '${metadata.Name}' before updating it. You may do so via GUI; or via Accenture SFMC DevTools by setting TriggeredSendStatus to 'Inactive'.`
            );
        }
        // re-add IsPlatformObject, required for visibility
        metadata.IsPlatformObject = false;
        // folder
        metadata.CategoryID = Util.getFromCache(
            this.cache,
            'folder',
            metadata.r__folder_Path,
            'Path',
            'ID'
        );
        delete metadata.r__folder_Path;
        // email
        if (metadata.r__email_Name) {
            // classic
            metadata.Email = {
                ID: Util.getFromCache(this.cache, 'email', metadata.r__email_Name, 'Name', 'ID'),
            };
            delete metadata.r__email_Name;
        } else if (metadata.r__assetMessage_Key) {
            // content builder
            // * this ignores r__assetMessage_Name on purpose as that is only unique per parent folder but useful during PR reviews
            metadata.Email = {
                ID: Util.getFromCache(
                    this.cache,
                    'asset',
                    metadata.r__assetMessage_Key,
                    'customerKey',
                    'legacyData.legacyId'
                ),
            };
            delete metadata.r__assetMessage_Key;
            delete metadata.r__assetMessage_Name;
        } else if (metadata.Email && metadata.Email.ID) {
            throw new Error(
                `r__assetMessage_Key / r__email_Name not defined but instead found Email.ID. Please try re-retrieving this TSD from your BU.`
            );
        }
        // get List
        if (metadata.r__list_PathName) {
            metadata.List = {
                ID: Util.getListObjectIdFromCache(this.cache, metadata.r__list_PathName, 'ID'),
            };
            delete metadata.r__list_PathName;
        } else if (metadata.List && metadata.List.ID) {
            throw new Error(
                `r__list_PathName not defined but instead found List.ID. Please try re-retrieving this TSD from your BU.`
            );
        }

        return metadata;
    }
}

// Assign definition to static attributes
TriggeredSendDefinition.definition = require('../MetadataTypeDefinitions').triggeredSendDefinition;
/**
 * @type {Util.SDK}
 */
TriggeredSendDefinition.client = undefined;

module.exports = TriggeredSendDefinition;
