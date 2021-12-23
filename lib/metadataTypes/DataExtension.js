'use strict';

const jsonToTable = require('json-to-table');
const MetadataType = require('./MetadataType');
const DataExtensionField = require('./DataExtensionField');
const Folder = require('./Folder');
const Util = require('../util/util');
const File = require('../util/file');

/**
 * @typedef {Object} DataExtensionItem
 * @property {string} CustomerKey key
 * @property {string} Name name
 * @property {string} Description -
 * @property {'true'|'false'} IsSendable -
 * @property {'true'|'false'} IsTestable -
 * @property {Object} SendableDataExtensionField -
 * @property {string} SendableDataExtensionField.Name -
 * @property {Object} SendableSubscriberField -
 * @property {string} SendableSubscriberField.Name -
 * @property {DataExtensionField.DataExtensionFieldItem[]} Fields list of DE fields
 * @property {'dataextension'|'salesforcedataextension'|'synchronizeddataextension'|'shared_dataextension'|'shared_salesforcedataextension'} r__folder_ContentType retrieved from associated folder
 * @property {string} r__folder_Path folder path in which this DE is saved
 * @property {string} [CategoryID] holds folder ID, replaced with r__folder_Path during retrieve
 * @property {string} [r__dataExtensionTemplate_Name] name of optionally associated DE template
 * @property {Object} [Template] -
 * @property {string} [Template.CustomerKey] key of optionally associated DE teplate
 *
 * @typedef {Object.<string, DataExtensionItem>} DataExtensionMap
 */

/**
 * DataExtension MetadataType
 * @augments MetadataType
 */
class DataExtension extends MetadataType {
    /**
     * Upserts dataExtensions after retrieving them from source and target to compare
     * if create or update operation is needed.
     * @param {DataExtensionMap} desToDeploy dataExtensions mapped by their customerKey
     * @param {Object} _ -
     * @param {Util.BuObject} buObject properties for auth
     * @returns {Promise} Promise
     */
    static async upsert(desToDeploy, _, buObject) {
        Util.logger.info('- Retrieve target metadata for comparison with deploy metadata');
        const results = await this.retrieveForCache(buObject, null, true);
        const targetMetadata = results.metadata;
        Util.logger.info('- Retrieved target metadata');
        /** @type {Promise[]} */
        const deCreatePromises = [];
        /** @type {Promise[]} */
        const deUpdatePromises = [];
        for (const dataExtension in desToDeploy) {
            if (desToDeploy[dataExtension].Name.startsWith('_')) {
                Util.logger.warn(
                    '- Cannot Upsert Strongly Typed Data Extensions - skipping ' +
                        desToDeploy[dataExtension].Name
                );
                continue;
            }
            if (
                buObject.eid !== buObject.mid &&
                desToDeploy[dataExtension].r__folder_Path.startsWith('Shared Items')
            ) {
                // this needs to be run before executing preDeployTasks()
                Util.logger.warn(
                    `- Cannot Create/Update a Shared Data Extension from the Child BU - skipping ${desToDeploy[dataExtension].Name}`
                );
                continue;
            }
            if (
                desToDeploy[dataExtension].r__folder_Path.startsWith('Synchronized Data Extensions')
            ) {
                // this needs to be run before executing preDeployTasks()
                Util.logger.warn(
                    `- Cannot Create/Update a Synchronized Data Extension. Please use Contact Builder to maintain these - skipping ${desToDeploy[dataExtension].Name}`
                );
                continue;
            }
            try {
                desToDeploy[dataExtension] = await this.preDeployTasks(desToDeploy[dataExtension]);
            } catch (ex) {
                // problem with retrieving folder for this DE found
                // output error & remove from deploy list
                Util.logger.error(
                    `- dataExtension ${desToDeploy[dataExtension].Name}: ${ex.message}`
                );
                delete desToDeploy[dataExtension];
                // skip rest of handling for this DE
                continue;
            }
            if (targetMetadata[dataExtension]) {
                // data extension already exists in target and needs to be updated
                deUpdatePromises.push(DataExtension.update(desToDeploy[dataExtension]));
            } else {
                // data extension does not exist in target and has to be created
                deCreatePromises.push(DataExtension.create(desToDeploy[dataExtension]));
            }
        }
        if (deUpdatePromises.length) {
            Util.logger.info(
                '- Please note that Data Retention Policies can only be set during creation, not during update.'
            );
        }

        const createResults = (await Promise.allSettled(deCreatePromises)).filter(
            this._filterUpsertResults
        );
        const updateResults = (await Promise.allSettled(deUpdatePromises)).filter(
            this._filterUpsertResults
        );

        const successfulResults = [...createResults, ...updateResults];

        Util.metadataLogger(
            'info',
            this.definition.type,
            'upsert',
            `${createResults.length} of ${deCreatePromises.length} created / ${updateResults.length} of ${deUpdatePromises.length} updated`
        );
        if (successfulResults.length > 0) {
            const metadataResults = successfulResults
                .map((r) => r.value.Results[0].Object)
                .map((r) => {
                    // if only one fields added will return object otherwise array
                    if (r.Fields && r.Fields.Field && Array.isArray(r.Fields.Field)) {
                        r.Fields = r.Fields.Field;
                    } else if (r.Fields && r.Fields.Field) {
                        r.Fields = [r.Fields.Field];
                    }
                    return r;
                });
            return super.parseResponseBody({ Results: metadataResults });
        } else {
            return {};
        }
    }

    /**
     * helper for upsert()
     * @param {Object} res -
     * @returns {Boolean} true: keep, false: discard
     */
    static _filterUpsertResults(res) {
        if (res.status === 'rejected') {
            // promise rejects, whole request failed
            Util.logger.error('- error upserting dataExtension: ' + res.reason);
            return false;
        } else if (res.value && res.value.Results && res.value.Results[0].StatusCode != 'OK') {
            Util.logger.error(
                '- error upserting dataExtension: ' +
                    (res.value.Results[0].Object ? res.value.Results[0].Object.Name : '') +
                    '. ' +
                    res.value.Results[0].StatusMessage
            );
            return false;
        } else if (res.status === 'fulfilled' && res.value && res.value.faultstring) {
            // can happen that the promise does not reject, but that it resolves an error
            Util.logger.error('- error upserting dataExtension: ' + res.value.faultstring);
            return false;
        } else {
            return true;
        }
    }

    /**
     * Create a single dataExtension. Also creates their columns in 'dataExtension.columns'
     * @param {DataExtensionItem} metadata single metadata entry
     * @returns {Promise} Promise
     */
    static async create(metadata) {
        this._cleanupRetentionPolicyFields(metadata);

        // convert simple array into object.Array.object format to cope with how the XML body in the SOAP call needs to look like:
        // <Fields>
        //   <Field>
        //     <CustomerKey>SubscriberKey</CustomerKey>
        //      ..
        //   </Field>
        // </Fields>
        metadata.Fields = { Field: metadata.Fields };

        return super.createSOAP(metadata);
    }

    /**
     * SFMC saves a date in "RetainUntil" under certain circumstances even
     * if that field duplicates whats in the period fields
     * during deployment, that extra value is not accepted by the APIs which is why it needs to be removed
     * @private
     * @param {DataExtensionItem} metadata single metadata entry
     * @returns {void}
     */
    static _cleanupRetentionPolicyFields(metadata) {
        if (
            metadata.DataRetentionPeriodLength &&
            metadata.DataRetentionPeriodUnitOfMeasure &&
            metadata.RetainUntil !== ''
        ) {
            metadata.RetainUntil = '';
            Util.logger.warn(
                `RetainUntil date was reset automatically because RetentionPeriod info was found in: ${metadata.CustomerKey}`
            );
        }
    }
    /**
     * Updates a single dataExtension. Also updates their columns in 'dataExtension.columns'
     * @param {DataExtensionItem} metadata single metadata entry
     * @returns {Promise} Promise
     */
    static async update(metadata) {
        // Update dataExtension + Columns if they already exist; Create them if not
        // Modify columns for update call
        DataExtensionField.cache = this.metadata;
        DataExtensionField.client = this.client;
        DataExtensionField.properties = this.properties;
        DataExtension.oldFields = DataExtension.oldFields || {};
        DataExtension.oldFields[metadata.CustomerKey] =
            await DataExtensionField.prepareDeployColumnsOnUpdate(
                metadata.Fields,
                metadata.CustomerKey
            );

        // convert simple array into object.Array.object format to cope with how the XML body in the SOAP call needs to look like:
        // <Fields>
        //   <Field>
        //     <CustomerKey>SubscriberKey</CustomerKey>
        //      ..
        //   </Field>
        // </Fields>

        metadata.Fields = { Field: metadata.Fields };
        return super.updateSOAP(metadata);
    }
    /**
     * Gets executed after deployment of metadata type
     * @param {DataExtensionMap} upsertedMetadata metadata mapped by their keyField
     * @returns {void}
     */
    static postDeployTasks(upsertedMetadata) {
        if (!DataExtension.oldFields) {
            // only run postDeploy if we are in update mode
            return;
        }
        // somewhat of a workardoun but it ensures we get the field list from the server rather than whatever we might have in cache got returned during update/add. This ensures a complete and correctly ordered field list
        for (const key in upsertedMetadata) {
            const item = upsertedMetadata[key];
            const isUpdate =
                this.cache &&
                this.cache.dataExtension &&
                this.cache.dataExtension[item.CustomerKey];
            if (isUpdate) {
                const cachedVersion = this.cache.dataExtension[item.CustomerKey];
                // restore retention values that are typically not returned by the update call
                item.RowBasedRetention = cachedVersion.RowBasedRetention;
                item.ResetRetentionPeriodOnImport = cachedVersion.ResetRetentionPeriodOnImport;
                item.DeleteAtEndOfRetentionPeriod = cachedVersion.DeleteAtEndOfRetentionPeriod;
                item.RetainUntil = cachedVersion.RetainUntil;

                // ensure we have th
                const existingFields = DataExtension.oldFields[item[this.definition.nameField]];
                if (item.Fields !== '' && existingFields) {
                    // TODO should be replaced by a manual sort using existingFields
                    // ! this is inefficient because it triggers a new download of the fields during the saveResults() step
                    item.Fields.length = 0;
                }
                // sort Fields entry to the end of the object for saving in .json
                const fieldsBackup = item.Fields;
                delete item.Fields;
                item.Fields = fieldsBackup;
            }
        }
    }

    /**
     * Retrieves dataExtension metadata. Afterwards starts retrieval of dataExtensionColumn metadata retrieval
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @param {Util.BuObject} buObject properties for auth
     * @param {void} [_] -
     * @param {boolean} [isDeploy] used to signal that fields shall be retrieve in caching mode
     * @returns {Promise<{metadata:DataExtensionMap,type:string}>} Promise of item map
     */
    static async retrieve(retrieveDir, additionalFields, buObject, _, isDeploy) {
        let metadata = await this._retrieveAll(additionalFields);
        // in case of cache dont get fields
        if (isDeploy || (metadata && retrieveDir)) {
            // get fields from API
            const fieldsObj = await this._retrieveFields(null, additionalFields);
            const fieldKeys = Object.keys(fieldsObj);
            // add fields to corresponding DE
            fieldKeys.forEach((key) => {
                const field = fieldsObj[key];
                if (metadata[field?.DataExtension?.CustomerKey]) {
                    metadata[field.DataExtension.CustomerKey].Fields.push(field);
                } else {
                    Util.logger.warn(`Issue retrieving data extension fields. key='${key}'`);
                }
            });

            // sort fields by Ordinal value (API returns field unsorted)
            for (const metadataEntry in metadata) {
                metadata[metadataEntry].Fields.sort(DataExtensionField.sortDeFields);
            }

            // remove attributes that we do not want to retrieve
            // * do this after sorting on the DE's field list
            fieldKeys.forEach((key) => {
                DataExtensionField.postRetrieveTasks(fieldsObj[key], true);
            });
        }
        if (!retrieveDir && buObject.eid !== buObject.mid) {
            // for caching, we want to retrieve shared DEs as well from the instance parent BU
            Util.logger.info('- Caching dependent Metadata: dataExtension (shared via _ParentBU_)');
            /** @type {Util.BuObject} */
            const buObjectParentBu = {
                clientId: this.properties.credentials[buObject.credential].clientId,
                clientSecret: this.properties.credentials[buObject.credential].clientSecret,
                tenant: this.properties.credentials[buObject.credential].tenant,
                eid: this.properties.credentials[buObject.credential].eid,
                mid: this.properties.credentials[buObject.credential].eid,
                businessUnit: Util.parentBuName,
                credential: buObject.credential,
            };
            const clientBackup = this.client;
            try {
                this.client = await Util.getETClient(buObjectParentBu);
            } catch (ex) {
                Util.logger.error(ex.message);
                return;
            }
            const metadataParentBu = await this._retrieveAll(additionalFields);

            // get shared folders to match our shared / synched Data Extensions
            Util.logger.info('- Caching dependent Metadata: folder (shared via _ParentBU_)');
            Folder.cache = {};
            Folder.client = this.client;
            Folder.properties = this.properties;
            const result = await Folder.retrieveForCache(buObjectParentBu);
            const parentCache = {
                folder: result.metadata,
            };

            // get the types and clean out non-shared ones
            const folderTypesFromParent = require('../MetadataTypeDefinitions').folder
                .folderTypesFromParent;
            for (const metadataEntry in metadataParentBu) {
                try {
                    // get the data extension type from the folder
                    const folderContentType = Util.getFromCache(
                        parentCache,
                        'folder',
                        metadataParentBu[metadataEntry].CategoryID,
                        'ID',
                        'ContentType'
                    );
                    if (!folderTypesFromParent.includes(folderContentType)) {
                        Util.logger.verbose(
                            `removing ${metadataEntry} because r__folder_ContentType '${folderContentType}' identifies this DE as not being shared`
                        );
                        delete metadataParentBu[metadataEntry];
                    }
                } catch (ex) {
                    Util.logger.debug(
                        `removing ${metadataEntry} because of error while retrieving r__folder_ContentType: ${ex.message}`
                    );
                    delete metadataParentBu[metadataEntry];
                }
            }

            // revert client to current default
            this.client = clientBackup;
            Folder.client = clientBackup;
            Folder.cache = this.cache;

            // make sure to overwrite parent bu DEs with local ones
            metadata = { ...metadataParentBu, ...metadata };
        }

        if (retrieveDir) {
            const savedMetadata = await this.saveResults(metadata, retrieveDir, null);
            Util.logger.info(
                `Downloaded: ${this.definition.type} (${Object.keys(savedMetadata).length})`
            );
            if (this.properties.metaDataTypes.documentOnRetrieve.includes(this.definition.type)) {
                await this.document(buObject, savedMetadata);
            }
        }
        return { metadata: metadata, type: 'dataExtension' };
    }
    /**
     * Retrieves dataExtension metadata. Afterwards starts retrieval of dataExtensionColumn metadata retrieval
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @returns {Promise<{metadata:DataExtensionMap,type:string}>} Promise of item map
     */
    static async retrieveChangelog(additionalFields) {
        const metadata = await this._retrieveAll(additionalFields);
        return { metadata: metadata, type: 'dataExtension' };
    }
    /**
     * manages post retrieve steps
     * @param {DataExtensionItem} metadata a single dataExtension
     * @param {string} [_] unused
     * @param {boolean} [isTemplating] signals that we are retrieving templates
     * @returns {DataExtensionItem} metadata
     */
    static async postRetrieveTasks(metadata, _, isTemplating) {
        if (!metadata.Fields || !metadata.Fields.length) {
            // assume we were in deploy mode. retrieve fields.
            const tempList = {};
            tempList[metadata[this.definition.keyField]] = metadata;
            await this._retrieveFieldsForSingleDe(tempList, metadata[this.definition.keyField]);
        }
        // if retrieving template, replace the name with customer key if that wasn't already the case
        if (isTemplating) {
            const warningMsg =
                'Ensure that Queries that write into this DE are updated with the new key before deployment.';
            this.overrideKeyWithName(metadata, warningMsg);
        }
        // Error during deploy if SendableSubscriberField.Name = '_SubscriberKey' even though it is retrieved like that
        // Therefore map it to 'Subscriber Key'. Retrieving afterward still results in '_SubscriberKey'
        if (
            metadata.SendableSubscriberField &&
            metadata.SendableSubscriberField.Name === '_SubscriberKey'
        ) {
            metadata.SendableSubscriberField.Name = 'Subscriber Key';
        }
        return this._parseMetadata(JSON.parse(JSON.stringify(metadata)));
    }

    /**
     * Helper to retrieve Data Extension Fields
     * @private
     * @param {Object} [options] options (e.g. continueRequest)
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @returns {Promise<DataExtensionField.DataExtensionFieldMap>} Promise of items
     */
    static async _retrieveFields(options, additionalFields) {
        if (!options) {
            // dont print this during updates or templating which retrieves fields DE-by-DE
            Util.logger.info('- Caching dependent Metadata: dataExtensionField');
        }
        DataExtensionField.cache = this.metadata;
        DataExtensionField.client = this.client;
        DataExtensionField.properties = this.properties;

        const response = await DataExtensionField.retrieveForCache(options, additionalFields);
        return response.metadata;
    }
    /**
     * helps retrieving fields during templating and deploy where we dont want the full list
     * @private
     * @param {DataExtensionMap} metadata list of DEs
     * @param {string} customerKey external key of single DE
     * @returns {Promise<void>} updates are made directly to `metadata`
     */
    static async _retrieveFieldsForSingleDe(metadata, customerKey) {
        const fieldOptions = {
            filter: {
                leftOperand: 'DataExtension.CustomerKey',
                operator: 'equals',
                rightOperand: customerKey,
            },
        };
        const fieldsObj = await this._retrieveFields(fieldOptions);

        DataExtensionField.cache = this.metadata;
        DataExtensionField.client = this.client;
        DataExtensionField.properties = this.properties;
        const fieldArr = DataExtensionField.convertToSortedArray(fieldsObj);

        // remove attributes that we do not want to retrieve
        // * do this after sorting on the DE's field list
        fieldArr.forEach((field) => {
            DataExtensionField.postRetrieveTasks(field, true);
        });

        metadata[customerKey].Fields = fieldArr;
    }

    /**
     * prepares a DataExtension for deployment
     * @param {DataExtensionItem} metadata a single data Extension
     * @returns {Promise<DataExtensionItem>} Promise of updated single DE
     */
    static async preDeployTasks(metadata) {
        // folder
        metadata.CategoryID = Util.getFromCache(
            this.cache,
            'folder',
            metadata.r__folder_Path,
            'Path',
            'ID'
        );
        delete metadata.r__folder_Path;

        // DataExtensionTemplate
        if (metadata.r__dataExtensionTemplate_Name) {
            // remove templated fields
            for (const templateField of this.definition.templateFields[
                metadata.r__dataExtensionTemplate_Name
            ]) {
                for (let index = 0; index < metadata.Fields.length; index++) {
                    const element = metadata.Fields[index];
                    if (element.Name === templateField) {
                        metadata.Fields.splice(index, 1);
                        Util.logger.debug(`Removed template field: ${templateField}`);
                        break;
                    }
                }
            }

            // get template's CustomerKey
            try {
                metadata.Template = {
                    CustomerKey: Util.getFromCache(
                        this.cache,
                        'dataExtensionTemplate',
                        metadata.r__dataExtensionTemplate_Name,
                        'Name',
                        'CustomerKey'
                    ),
                };
                delete metadata.r__dataExtensionTemplate_Name;
            } catch (ex) {
                Util.logger.debug(ex.message);
                // It is assumed that non-supported types would not have been converted to r__dataExtensionTemplate_Name upon retrieve.
                // Deploying to same BU therefore still works!
                // A workaround for cross-BU deploy exists but it's likely not beneficial to explain to users:
                // Create a DE based on the not-supported template on the target BU, retrieve it, copy the Template.CustomerKey into the to-be-deployed DE (or use mcdev-templating), done
                throw new Error(
                    `Skipping DataExtension '${
                        metadata[this.definition.nameField]
                    }': Could not find specified DataExtension Template. Please note that DataExtensions based on SMSMessageTracking and SMSSubscriptionLog cannot be deployed automatically across BUs at this point.`
                );
            }
        }

        // contenttype
        delete metadata.r__folder_ContentType;

        // Error if SendableSubscriberField.Name = '_SubscriberKey' even though it is retrieved like that
        // Therefore map it to 'Subscriber Key'. Retrieving afterward still results in '_SubscriberKey'
        // TODO remove from preDeploy with release of version 4, keep until then to help with migration of old metadata
        if (
            metadata.SendableSubscriberField &&
            metadata.SendableSubscriberField.Name === '_SubscriberKey'
        ) {
            metadata.SendableSubscriberField.Name = 'Subscriber Key';
        }

        return metadata;
    }

    /**
     * Saves json content to a html table in the local file system. Will create the parent directory if it does not exist.
     * The json's first level of keys must represent the rows and the secend level the columns
     * @private
     * @param {DataExtensionItem} json single dataextension
     * @param {Array} tabled prepped array for output in tabular format
     * @returns {string} file content
     */
    static _generateDocHtml(json, tabled) {
        let output =
            '<html> <head> <style> html, table { font-family: arial, sans-serif; border-collapse: collapse; width: 100%; } td, th { border: 1px solid #dddddd; text-align: left; padding: 8px; } tbody>tr:hover { background-color: #EBECF0; } </style> </head> <body></body>';

        output += `<h2>${json.CustomerKey}</h2>`;
        if (json.CustomerKey !== json.Name) {
            output += `<p><b>Error - Name not equal to External Key:</b> ${json.Name}</p>`;
        }

        output += `<p><b>Description:</b> ${json.Description || 'n/a'}</p>`;
        output += `<p><b>Folder:</b> ${
            json.r__folder_Path
                ? json.r__folder_Path
                : '<i>Hidden! Could not find folder with ID ' + json.CategoryID + '</i>'
        }</p>`;
        output += `<p><b>Fields in table:</b> ${tabled.length - 1}</p>`;
        output += '<p><b>Sendable:</b> ';
        if (json.IsSendable === 'true') {
            output +=
                'Yes (<i>' +
                json.SendableDataExtensionField.Name +
                '</i> to <i>' +
                json.SendableSubscriberField.Name +
                '</i>)</p>\n\n';
        } else {
            output += `No</p>\n\n`;
        }
        output += `<p><b>Testable:</b> ${json.IsTestable === 'true' ? 'Yes' : 'No'}</p>\n\n`;
        if (json.r__dataExtensionTemplate_Name) {
            output += `<p><b>Template:</b> ${json.r__dataExtensionTemplate_Name}</p>`;
        }

        output += '<table><thead><tr>';
        tabled[0].forEach((element) => {
            output += '<th>' + element + '</th>';
        });
        output += '</tr><thead><tbody>';
        for (let i = 1; i < tabled.length; i++) {
            output += '<tr>';
            tabled[i].forEach((field) => {
                output += `<td>${field}</td>`;
            });
            output += '</tr>';
        }
        output += '</tbody></table>';
        return output;
    }

    /**
     * Experimental: Only working for DataExtensions:
     * Saves json content to a html table in the local file system. Will create the parent directory if it does not exist.
     * The json's first level of keys must represent the rows and the secend level the columns
     * @private
     * @param {DataExtensionItem} json dataextension
     * @param {Array} tabled prepped array for output in tabular format
     * @returns {string} file content
     */
    static _generateDocMd(json, tabled) {
        let output = `## ${json.CustomerKey}\n\n`;
        if (json.CustomerKey !== json.Name) {
            output += `**Name** (not equal to External Key)**:** ${json.Name}\n\n`;
        }

        output +=
            `**Description:** ${json.Description || 'n/a'}\n\n` +
            `**Folder:** ${
                json.r__folder_Path
                    ? json.r__folder_Path
                    : '_Hidden! Could not find folder with ID ' + json.CategoryID + '_'
            }/\n\n` +
            `**Fields in table:** ${tabled.length - 1}\n\n`;
        output += '**Sendable:** ';
        if (json.IsSendable === 'true') {
            output +=
                'Yes (`' +
                json.SendableDataExtensionField.Name +
                '` to `' +
                json.SendableSubscriberField.Name +
                '`)\n\n';
        } else {
            output += `No\n\n`;
        }
        output += `**Testable:** ${json.IsTestable === 'true' ? 'Yes' : 'No'}\n\n`;
        if (json.r__dataExtensionTemplate_Name) {
            output += `**Template:** ${json.r__dataExtensionTemplate_Name}\n\n`;
        }

        let tableSeparator = '';
        tabled[0].forEach((column) => {
            output += `| ${column} `;
            tableSeparator += '| --- ';
        });
        output += `|\n${tableSeparator}|\n`;
        for (let i = 1; i < tabled.length; i++) {
            tabled[i].forEach((field) => {
                output += `| ${field} `;
            });
            output += '|\n';
        }
        return output;
    }

    /**
     * Saves json content to a html table in the local file system. Will create the parent directory if it does not exist.
     * The json's first level of keys must represent the rows and the secend level the columns
     * @private
     * @param {string} directory directory the file will be written to
     * @param {string} filename name of the file without '.json' ending
     * @param {DataExtensionItem} json dataextension.columns
     * @param {'html'|'md'} mode html or md
     * @param {string[]} [fieldsToKeep] list of keys(columns) to show. This will also specify
     * @returns {Promise<boolean>} Promise of success of saving the file
     */
    static async _writeDoc(directory, filename, json, mode, fieldsToKeep) {
        if (!File.existsSync(directory)) {
            File.mkdirpSync(directory);
        }
        let fieldsJson = Object.values(json.Fields);
        if (fieldsToKeep) {
            const newJson = [];
            fieldsJson.forEach((element) => {
                const newJsonElement = {};
                fieldsToKeep.forEach((field) => {
                    newJsonElement[field] = element[field];
                });
                newJson.push(newJsonElement);
            });
            fieldsJson = newJson;
        }
        const tabled = jsonToTable(fieldsJson);
        let output;
        if (mode === 'html') {
            output = DataExtension._generateDocHtml(json, tabled);
        } else if (mode === 'md') {
            output = DataExtension._generateDocMd(json, tabled);
        }
        try {
            // write to disk
            await File.writeToFile(directory, filename + '.dataExtension', mode, output);
        } catch (ex) {
            Util.logger.error(`DataExtension.writeDeToX(${mode}):: error | ` + ex.message);
        }
    }
    /**
     * Parses metadata into a readable Markdown/HTML format then saves it
     * @param {Util.BuObject} buObject properties for auth
     * @param {DataExtensionMap} [metadata] a list of dataExtension definitions
     * @param {boolean} [isDeploy] used to skip non-supported message during deploy
     * @returns {Promise<void>} -
     */
    static async document(buObject, metadata, isDeploy) {
        if (!metadata) {
            metadata = this.readBUMetadataForType(
                File.normalizePath([
                    this.properties.directories.retrieve,
                    buObject.credential,
                    buObject.businessUnit,
                ]),
                true
            ).dataExtension;
        }
        const docPath = File.normalizePath([
            this.properties.directories.dataExtension,
            buObject.credential,
            buObject.businessUnit,
        ]);
        if (!metadata || !Object.keys(metadata).length) {
            // as part of retrieve & manual execution we could face an empty folder
            return;
        }
        if (!isDeploy) {
            File.removeSync(docPath);
        }
        const columnsToIterateThrough = ['IsNullable', 'IsPrimaryKey'];
        const columnsToPrint = [
            'Name',
            'FieldType',
            'MaxLength',
            'IsPrimaryKey',
            'IsNullable',
            'DefaultValue',
        ];
        for (const customerKey in metadata) {
            if (metadata[customerKey].Fields && metadata[customerKey].Fields.length) {
                metadata[customerKey].Fields.forEach((field) => {
                    field.IsNullable = (!(field.IsRequired === 'true')).toString();
                    columnsToIterateThrough.forEach((key) => {
                        if (field[key] === 'true') {
                            field[key] = '+';
                        } else if (field[key] === 'false') {
                            field[key] = '-';
                        }
                    });
                });

                if (['html', 'both'].includes(this.properties.options.documentType)) {
                    this._writeDoc(
                        docPath + '/',
                        customerKey,
                        metadata[customerKey],
                        'html',
                        columnsToPrint
                    );
                }
                if (['md', 'both'].includes(this.properties.options.documentType)) {
                    this._writeDoc(
                        docPath + '/',
                        customerKey,
                        metadata[customerKey],
                        'md',
                        columnsToPrint
                    );
                }
            }
        }
        if (['html', 'both'].includes(this.properties.options.documentType)) {
            Util.logger.info(`Created ${docPath}/*.dataExtension.html`);
        }
        if (['md', 'both'].includes(this.properties.options.documentType)) {
            Util.logger.info(`Created ${docPath}/*.dataExtension.md`);
        }
    }

    /**
     * Delete a data extension from the specified business unit
     * @param {Object} buObject references credentials
     * @param {string} customerKey Identifier of data extension
     * @returns {Promise<void>} -
     */
    static async deleteByKey(buObject, customerKey) {
        let client;
        try {
            client = await Util.getETClient(buObject);
        } catch (ex) {
            Util.logger.error(ex.message);
            return;
        }
        const config = {
            props: { CustomerKey: customerKey },
        };

        client.dataExtension(config).delete((error, response) => {
            if (error && error.results && error.results[0]) {
                if (error.results[0].ErrorCode === '310007') {
                    Util.logger.error(
                        'mcdev.deleteDE:: It seems the DataExtension you were trying to delete does not exist on the given BU or its External Key was changed.'
                    );
                } else {
                    Util.logger.error('mcdev.deleteDE:: ' + error.results[0].StatusMessage);
                }
            } else if (error) {
                Util.logger.error('mcdev.deleteDE:: ' + JSON.stringify(error));
            } else if (response && response && response.Results && response.Results[0]) {
                Util.logger.info(
                    `mcdev.deleteDE:: Success: ${response.Results[0].StatusMessage} (${customerKey})`
                );
                // delete local copy: retrieve/cred/bu/dataExtension/...json
                const jsonFile = File.normalizePath([
                    this.properties.directories.retrieve,
                    buObject.credential,
                    buObject.businessUnit,
                    this.definition.type,
                    `${customerKey}.${this.definition.type}-meta.json`,
                ]);
                if (File.existsSync(jsonFile)) {
                    File.unlinkSync(jsonFile);
                }
                // delete local copy: doc/dataExtension/cred/bu/...md
                const mdFile = File.normalizePath([
                    this.properties.directories.dataExtension,
                    buObject.credential,
                    buObject.businessUnit,
                    `${customerKey}.${this.definition.type}.md`,
                ]);
                if (File.existsSync(mdFile)) {
                    File.unlinkSync(mdFile);
                }
            } else {
                Util.logger.info('mcdev.deleteDE:: Success: ' + JSON.stringify(response));
            }
        });
    }

    /**
     * Retrieves folder metadata into local filesystem. Also creates a uniquePath attribute for each folder.
     * @param {Object} buObject properties for auth
     * @param {void} [_] -
     * @param {boolean} [isDeploy] used to signal that fields shall be retrieve in caching mode
     * @returns {Promise} Promise
     */
    static async retrieveForCache(buObject, _, isDeploy) {
        return this.retrieve(null, ['ObjectID', 'CustomerKey', 'Name'], buObject, null, isDeploy);
    }
    /**
     * Retrieves dataExtension metadata in template format.
     * @param {string} templateDir Directory where retrieved metadata directory will be saved
     * @param {string} name name of the metadata item
     * @param {Util.TemplateMap} variables variables to be replaced in the metadata
     * @returns {Promise<{metadata:DataExtensionMap,type:string}>} Promise of items
     */
    static async retrieveAsTemplate(templateDir, name, variables) {
        const options = {
            filter: {
                leftOperand: 'Name',
                operator: 'equals',
                rightOperand: name,
            },
        };
        /** @type DataExtensionMap */
        // const metadata = super.parseResponseBody(response.body);
        const metadata = await this._retrieveAll(null, options);

        if (!Object.keys(metadata).length) {
            Util.logger.error(`${this.definition.type} '${name}' not found on server.`);
            Util.logger.info('Downloaded: dataExtension (0)');
            return { metadata: {}, type: 'dataExtension' };
        }
        const customerKey = Object.keys(metadata)[0];
        await this._retrieveFieldsForSingleDe(metadata, customerKey);

        for (const key in metadata) {
            try {
                // API returns field unsorted
                metadata[key].Fields.sort((a, b) => a.Ordinal - b.Ordinal);

                const metadataCleaned = JSON.parse(
                    JSON.stringify(await this.postRetrieveTasks(metadata[key], null, !!variables))
                );

                this.keepTemplateFields(metadataCleaned);
                const metadataTemplated = JSON.parse(
                    Util.replaceByObject(JSON.stringify(metadataCleaned), variables)
                );
                File.writeJSONToFile(
                    [templateDir, this.definition.type].join('/'),
                    metadataTemplated[this.definition.keyField] +
                        '.' +
                        this.definition.type +
                        '-meta',
                    metadataTemplated
                );
            } catch (ex) {
                Util.metadataLogger('error', this.definition.type, 'retrieve', ex, key);
            }
        }

        Util.logger.info(
            `DataExtension.retrieveAsTemplate:: All records written to filesystem (${customerKey})`
        );
        return { metadata: metadata, type: 'dataExtension' };
    }

    /**
     * parses retrieved Metadata before saving
     * @private
     * @param {DataExtensionItem} metadata a single dataExtension definition
     * @returns {DataExtensionItem} a single dataExtension definition
     */
    static _parseMetadata(metadata) {
        let error = false;
        let verbose = false;
        // data extension type (from folder)
        try {
            metadata.r__folder_ContentType = Util.getFromCache(
                this.cache,
                'folder',
                metadata.CategoryID,
                'ID',
                'ContentType'
            );
        } catch (ex) {
            if (/(_Salesforce)(_\d\d?\d?)?$/.test(metadata.Name)) {
                verbose = true;
                metadata.r__folder_ContentType = 'synchronizeddataextension';
            } else {
                error = true;
                Util.logger.warn(`Data Extension '${metadata.Name}': ${ex.message}`);
            }
        }
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
            if (/(_Salesforce)(_\d\d?\d?)?$/.test(metadata.Name)) {
                metadata.r__folder_Path = 'Synchronized Data Extensions';
                delete metadata.CategoryID;

                if (!verbose) {
                    Util.logger.verbose(
                        `Synchronized Data Extension of other BU found: '${metadata.Name}'. Setting folder to 'Synchronized Data Extensions'`
                    );
                }
            } else if (!error) {
                Util.logger.error(`Data Extension '${metadata.Name}': ${ex.message}`);
            }
        }
        // DataExtensionTemplate
        if (metadata.Template && metadata.Template.CustomerKey) {
            try {
                metadata.r__dataExtensionTemplate_Name = Util.getFromCache(
                    this.cache,
                    'dataExtensionTemplate',
                    metadata.Template.CustomerKey,
                    'CustomerKey',
                    'Name'
                );
                delete metadata.Template;
            } catch (ex) {
                Util.logger.debug(ex.message);
                // Let's allow retrieving such DEs but warn that they cannot be deployed to another BU.
                // Deploying to same BU  still works!
                // A workaround exists but it's likely not beneficial to explain to users:
                // Create a DE based on the not-supported template on the target BU, retrieve it, copy the Template.CustomerKey into the to-be-deployed DE (or use mcdev-templating), done
                Util.logger.warn(
                    `Issue with DataExtension '${
                        metadata[this.definition.nameField]
                    }': Could not find specified DataExtension Template. Please note that DataExtensions based on SMSMessageTracking and SMSSubscriptionLog cannot be deployed automatically across BUs at this point.`
                );
            }
        }

        return metadata;
    }

    /**
     * Retrieves dataExtension metadata and cleans it
     * @private
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @param {Object} [options] e.g. filter
     * @returns {Promise<DataExtensionMap>} keyField => metadata map
     */
    static async _retrieveAll(additionalFields, options) {
        const metadata = (await super.retrieveSOAPgeneric(null, null, options, additionalFields))
            .metadata;
        for (const key in metadata) {
            // some system data extensions do not have CategoryID which throws errors in other places. These do not need to be parsed
            if (!metadata[key].CategoryID) {
                delete metadata[key];
            } else {
                metadata[key].Fields = [];
            }
        }
        return metadata;
    }
}

// Assign definition to static attributes
DataExtension.definition = require('../MetadataTypeDefinitions').dataExtension;
/**
 * @type {Util.SDK}
 */
DataExtension.client = undefined;
DataExtension.cache = {};

module.exports = DataExtension;
