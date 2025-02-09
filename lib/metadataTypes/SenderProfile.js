'use strict';

import MetadataType from './MetadataType.js';
import File from '../util/file.js';
import DomainVerification from './DomainVerification.js';
import cache from '../util/cache.js';
import { Util } from '../util/util.js';
import ReplaceCbReference from '../util/replaceContentBlockReference.js';

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
 * SenderProfile MetadataType
 *
 * @augments MetadataType
 */
class SenderProfile extends MetadataType {
    /**
     * Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     *
     * @param {string} [retrieveDir] Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static async retrieve(retrieveDir, _, __, key) {
        /** @type {SoapRequestParams} */
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
     * manages post retrieve steps
     *
     * @param {MetadataTypeItem} metadata a single item
     * @returns {MetadataTypeItem} a single item
     */
    static postRetrieveTasks(metadata) {
        // makes or easier reading
        if (metadata.Client) {
            try {
                metadata.createdBy = cache.searchForField(
                    'user',
                    metadata.Client.CreatedBy,
                    'AccountUserID',
                    'Name'
                );
            } catch (ex) {
                Util.logger.verbose(
                    ` - ${this.definition.type} ${metadata[this.definition.nameField]} (${
                        metadata[this.definition.keyField]
                    }): ${ex.message}.`
                );
            }

            try {
                metadata.modifiedBy = cache.searchForField(
                    'user',
                    metadata.Client.ModifiedBy,
                    'AccountUserID',
                    'Name'
                );
            } catch (ex) {
                Util.logger.verbose(
                    ` - ${this.definition.type} ${metadata[this.definition.nameField]} (${
                        metadata[this.definition.keyField]
                    }): ${ex.message}.`
                );
            }

            delete metadata.Client;
        }

        // check if email address is verified. Otherwise this SenderProfile (and Send Classifications using it) will not be usable in Journey Builder
        this.verifySenderEmailAddresses(metadata);

        return metadata;
    }

    /**
     *
     * @param {MetadataTypeItem} metadata a single item
     * @param {MetadataTypeItem} [metadataCaller] if called from SendClassification this can be used to adjust logs
     * @param {any} [definition] type defintiion from SendClassification
     */
    static verifySenderEmailAddresses(metadata, metadataCaller, definition) {
        if (!metadataCaller) {
            metadataCaller = metadata;
        }
        if (!definition) {
            definition = this.definition;
        }
        const emailsToCheck = {
            FromAddress: metadata.FromAddress.trim() + '',
            FallbackFromAddress: metadata.FallbackFromAddress.trim() + '',
        };
        for (const [field, email] of Object.entries(emailsToCheck)) {
            if (email && !email.startsWith('%%') && email.includes('@')) {
                const domainVerification = cache.getByKey('domainVerification', email);
                if (domainVerification) {
                    if (domainVerification.status !== 'Verified') {
                        Util.logger.warn(
                            Util.getMsgPrefix(definition, metadataCaller) +
                                `: ${field} ${email} is currently in status ${domainVerification.status}. This ${definition.typeName} will not be usable in Journey Builder. To fix, please go to Setup > Feature Settings > Email Studio > From Address Management to verify the email.`
                        );
                    }
                    if (domainVerification.isSendable === false) {
                        Util.logger.warn(
                            Util.getMsgPrefix(definition, metadataCaller) +
                                `: ${field} ${email} is currently not sendable. This ${definition.typeName} will not be usable in Journey Builder. To auto-fix run any update on senderProfile:"${metadata[this.definition.keyField]}" via mcdev.`
                        );
                    }
                } else {
                    Util.logger.warn(
                        Util.getMsgPrefix(definition, metadataCaller) +
                            `: ${field} ${email} is not verified. This ${definition.typeName} will not be usable in Journey Builder. To auto-fix run any update on senderProfile:"${metadata[this.definition.keyField]}" via mcdev. Alternatively, please go to Setup > Feature Settings > Email Studio > From Address Management.`
                    );
                }
            }
        }
    }

    /**
     * prepares a single item for deployment
     *
     * @param {MetadataTypeItem} metadata a single query activity
     * @returns {Promise.<MetadataTypeItem>} Promise
     */
    static async preDeployTasks(metadata) {
        // cleanup
        delete metadata.createdBy;
        delete metadata.modifiedBy;

        if (
            metadata.UseDefaultRMMRules &&
            (metadata.AutoForwardToEmailAddress !== '' || metadata.AutoForwardToName !== '')
        ) {
            Util.logger.warn(
                Util.getMsgPrefix(this.definition, metadata) +
                    `AutoForwardToEmailAddress and AutoForwardToName will be ignored because UseDefaultRMMRules is set to true; setting UseDefaultRMMRules to false`
            );
            metadata.UseDefaultRMMRules = false;
        }
        if (!Util.OPTIONS.matchName) {
            // #4 make sure the name is unique
            const thisCache = cache.getCache()[this.definition.type];
            const relevantNames = Object.keys(thisCache).map((key) => ({
                type: null,
                key: key,
                name: thisCache[key][this.definition.nameField],
            }));
            // if the name is already in the folder for a different key, add a number to the end
            metadata[this.definition.nameField] = this.findUniqueName(
                metadata[this.definition.keyField],
                metadata[this.definition.nameField],
                relevantNames
            );
        }
        return metadata;
    }

    /**
     * Gets executed after deployment of metadata type
     *
     * @param {MetadataTypeMap} upsertResults metadata mapped by their keyField as returned by update/create
     * @returns {Promise.<void>} -
     */
    static async postDeployTasks(upsertResults) {
        // re-retrieve all upserted items to ensure we have all fields (createdDate and modifiedDate are otherwise not present)
        Util.logger.debug(
            `Caching all ${this.definition.type} post-deploy to ensure we have all fields`
        );
        const domainVerificationEmails = new Set();

        const typeCache = await this.retrieveForCache();
        // update values in upsertResults with retrieved values before saving to disk
        for (const key of Object.keys(upsertResults)) {
            if (typeCache.metadata[key]) {
                upsertResults[key] = typeCache.metadata[key];
            }

            // ensure the FromAddress is verified or else attempt to create it
            const emailsToCheck = [
                upsertResults[key].FromAddress.trim() + '',
                upsertResults[key].FallbackFromAddress.trim() + '',
            ];

            for (const email of emailsToCheck) {
                if (email && !email.startsWith('%%') && email.includes('@')) {
                    const domainVerification = cache.getByKey('domainVerification', email);
                    if (!domainVerification) {
                        domainVerificationEmails.add(email);
                    }
                }
            }
        }

        if (domainVerificationEmails.size) {
            Util.logger.info(
                Util.getGrayMsg(`Setting up required E-Mail Addresses for Sender Profiles:`)
            );

            const domainVerificationCreateMap = {};
            for (const email of domainVerificationEmails) {
                domainVerificationCreateMap[email] = {
                    domain: email,
                    isSendable: true,
                };
            }

            const deployDir = File.normalizePath([
                this.properties.directories.deploy,
                this.buObject.credential,
                this.buObject.businessUnit,
            ]);
            const retrieveDir = File.normalizePath([
                this.properties.directories.retrieve,
                this.buObject.credential,
                this.buObject.businessUnit,
            ]);
            DomainVerification.buObject = this.buObject;
            DomainVerification.client = this.client;
            DomainVerification.properties = this.properties;
            const domainVerificationCreateResult = await DomainVerification.deploy(
                domainVerificationCreateMap,
                deployDir,
                retrieveDir
            );
            cache.mergeMetadata('domainVerification', domainVerificationCreateResult);
        }
    }

    /**
     *
     * @param {MetadataTypeItem} item single metadata item
     * @param {string} [_] parameter not used
     * @param {Set.<string>} [findAssetKeys] list of keys that were found referenced via ContentBlockByX; if set, method only gets keys and runs no updates
     * @returns {Promise.<MetadataTypeItem>} key of the item that was updated
     */
    static async replaceCbReference(item, _, findAssetKeys) {
        const parentName = `${this.definition.type} ${item[this.definition.keyField]}`;
        let changes = false;
        let error;

        // *** type specific logic ***
        try {
            item.FromName = ReplaceCbReference.replaceReference(
                item.FromName,
                parentName,
                findAssetKeys
            );
            changes = true;
        } catch (ex) {
            if (ex.code !== 200) {
                error = ex;
            }
        }
        try {
            item.FromAddress = ReplaceCbReference.replaceReference(
                item.FromAddress,
                parentName,
                findAssetKeys
            );
            changes = true;
        } catch (ex) {
            if (ex.code !== 200) {
                error = ex;
            }
        }
        try {
            item.AutoForwardToEmailAddress = ReplaceCbReference.replaceReference(
                item.AutoForwardToEmailAddress,
                parentName,
                findAssetKeys
            );
            changes = true;
        } catch (ex) {
            if (ex.code !== 200) {
                error = ex;
            }
        }
        try {
            item.AutoForwardToName = ReplaceCbReference.replaceReference(
                item.AutoForwardToName,
                parentName,
                findAssetKeys
            );
            changes = true;
        } catch (ex) {
            if (ex.code !== 200) {
                error = ex;
            }
        }
        if (error) {
            throw error;
        }

        if (!changes) {
            const ex = new Error('No changes made to the code.');
            // @ts-expect-error custom error object
            ex.code = 200;
            throw ex;
        }

        // *** finish ***
        // replaceReference will throw an error if nothing was updated which will end execution here
        // no error means we have a new item to deploy and need to update the item in our retrieve folder
        return item;
    }
}

// Assign definition & cache to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
SenderProfile.definition = MetadataTypeDefinitions.senderProfile;

export default SenderProfile;
