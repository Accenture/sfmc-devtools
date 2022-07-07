'use strict';

const jsonToTable = require('json-to-table');
const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');
const DataExtensionField = require('./DataExtensionField');
const Folder = require('./Folder');
const Util = require('../util/util');
const File = require('../util/file');
const auth = require('../util/auth');
const cache = require('../util/cache');

/**
 * DataExtension MetadataType
 *
 * @augments MetadataType
 */
class DataExtension extends MetadataType {
    /**
     * Upserts dataExtensions after retrieving them from source and target to compare
     * if create or update operation is needed.
     *
     * @param {TYPE.DataExtensionMap} desToDeploy dataExtensions mapped by their customerKey
     * @param {void} _ unused parameter
     * @param {TYPE.BuObject} buObject properties for auth
     * @returns {Promise} Promise
     */
    static async upsert(desToDeploy, _, buObject) {
        // get dataExtensions from target BU for add/update decision
        /** @type {TYPE.DataExtensionMap} */
        const targetMetadata = cache.getCache().dataExtension || {};
        // get existing de-fields to properly handle add/update/delete of fields
        await this._attachFields(targetMetadata);

        /** @type {Promise[]} */
        const deCreatePromises = [];
        /** @type {Promise[]} */
        const deUpdatePromises = [];
        let filteredByPreDeploy = 0;
        for (const dataExtension in desToDeploy) {
            if (desToDeploy[dataExtension].Name.startsWith('_')) {
                Util.logger.warn(
                    ` ☇ skipping dataExtension ${desToDeploy[dataExtension].Name}: Cannot Upsert Strongly Typed Data Extensions`
                );
                filteredByPreDeploy++;
                continue;
            }
            if (
                buObject.eid !== buObject.mid &&
                desToDeploy[dataExtension].r__folder_Path.startsWith('Shared Items')
            ) {
                // this needs to be run before executing preDeployTasks()
                Util.logger.warn(
                    ` ☇ skipping dataExtension ${desToDeploy[dataExtension].Name}: Cannot Create/Update a Shared Data Extension from the Child BU`
                );
                filteredByPreDeploy++;
                continue;
            }
            if (
                desToDeploy[dataExtension].r__folder_Path.startsWith('Synchronized Data Extensions')
            ) {
                // this needs to be run before executing preDeployTasks()
                Util.logger.warn(
                    ` ☇ skipping dataExtension ${desToDeploy[dataExtension].Name}:Cannot Create/Update a Synchronized Data Extension. Please use Contact Builder to maintain these`
                );
                filteredByPreDeploy++;
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
                ' - Please note that Data Retention Policies can only be set during creation, not during update.'
            );
        }

        const createResults = (await Promise.allSettled(deCreatePromises)).filter(
            this._filterUpsertResults
        );
        const updateResults = (await Promise.allSettled(deUpdatePromises)).filter(
            this._filterUpsertResults
        );

        const successfulResults = [...createResults, ...updateResults];
        Util.logger.info(
            `${this.definition.type} upsert: ${createResults.length} of ${deCreatePromises.length} created / ${updateResults.length} of ${deUpdatePromises.length} updated` +
                (filteredByPreDeploy > 0 ? ` / ${filteredByPreDeploy} filtered` : '')
        );
        if (successfulResults.length > 0) {
            const metadataResults = successfulResults
                .map((r) => r.value.Results[0].Object)
                .map((r) => {
                    // if only one fields added will return object otherwise array
                    if (Array.isArray(r?.Fields?.Field)) {
                        r.Fields = r.Fields.Field;
                    } else if (r?.Fields?.Field) {
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
     *
     * @param {object} res -
     * @returns {boolean} true: keep, false: discard
     */
    static _filterUpsertResults(res) {
        if (res.status === 'rejected') {
            // promise rejects, whole request failed
            Util.logger.error('- error upserting dataExtension: ' + res.reason);
            return false;
        } else if (res.value == undefined || Object.keys(res.value).length === 0) {
            // in case of returning empty result handle gracefully
            // TODO: consider if SOAP handler for this should really return empty object
            return false;
        } else if (res.value.results) {
            Util.logger.error(
                '- error upserting dataExtension: ' +
                    (res.value.Results[0].Object ? res.value.Results[0].Object.Name : '') +
                    '. ' +
                    res.value.Results[0].StatusMessage
            );
            return false;
        } else if (res.status === 'fulfilled' && res?.value?.faultstring) {
            // can happen that the promise does not reject, but that it resolves an error
            Util.logger.error('- error upserting dataExtension: ' + res.value.faultstring);
            return false;
        } else {
            return true;
        }
    }

    /**
     * Create a single dataExtension. Also creates their columns in 'dataExtension.columns'
     *
     * @param {TYPE.DataExtensionItem} metadata single metadata entry
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
     *
     * @private
     * @param {TYPE.DataExtensionItem} metadata single metadata entry
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
                ` - RetainUntil date was reset automatically because RetentionPeriod info was found in: ${metadata.CustomerKey}`
            );
        }
    }
    /**
     * Updates a single dataExtension. Also updates their columns in 'dataExtension.columns'
     *
     * @param {TYPE.DataExtensionItem} metadata single metadata entry
     * @returns {Promise} Promise
     */
    static async update(metadata) {
        // Update dataExtension + Columns if they already exist; Create them if not
        // Modify columns for update call
        DataExtensionField.client = this.client;
        DataExtensionField.properties = this.properties;
        DataExtension.oldFields = DataExtension.oldFields || {};
        DataExtension.oldFields[metadata[this.definition.keyField]] =
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
     *
     * @param {TYPE.DataExtensionMap} upsertedMetadata metadata mapped by their keyField
     * @param {TYPE.DataExtensionMap} originalMetadata metadata to be updated (contains additioanl fields)
     * @returns {void}
     */
    static postDeployTasks(upsertedMetadata, originalMetadata) {
        for (const key in upsertedMetadata) {
            const item = upsertedMetadata[key];
            const cachedVersion = cache.getByKey('dataExtension', item.CustomerKey);
            if (cachedVersion) {
                // UPDATE
                // restore retention values that are typically not returned by the update call
                item.RowBasedRetention = cachedVersion.RowBasedRetention;
                item.ResetRetentionPeriodOnImport = cachedVersion.ResetRetentionPeriodOnImport;
                item.DeleteAtEndOfRetentionPeriod = cachedVersion.DeleteAtEndOfRetentionPeriod;
                item.RetainUntil = cachedVersion.RetainUntil;

                const existingFields = DataExtension.oldFields[item[this.definition.keyField]];
                if (item.Fields === '') {
                    // if no fields were updated, we need to set Fields to "empty string" for the API to work
                    // reset here to get the correct field list
                    item.Fields = Object.keys(existingFields)
                        .map((key) => existingFields[key])
                        .sort((a, b) => a.Ordinal - b.Ordinal);
                }
                if (existingFields) {
                    // get list of updated fields
                    /** @type {TYPE.DataExtensionFieldItem[]} */
                    const updatedFieldsArr = originalMetadata[key].Fields.Field.filter(
                        (field) => field.ObjectID && field.ObjectID !== ''
                    );
                    // convert existing fields obj into array and sort
                    /** @type {TYPE.DataExtensionFieldItem[]} */
                    const finalFieldsArr = Object.keys(existingFields)
                        .map((key) => {
                            /** @type {TYPE.DataExtensionFieldItem} */
                            const existingField = existingFields[key];
                            // check if the current field was updated and then override with it. otherwise use existing value
                            const field =
                                updatedFieldsArr.find(
                                    (field) => field.ObjectID === existingField.ObjectID
                                ) || existingField;
                            // field does not have a ordinal value because we rely on array order
                            field.Ordinal = existingField.Ordinal;
                            // updating FieldType is not supported by API and hence removed
                            field.FieldType = existingField.FieldType;
                            return field;
                        })
                        .sort((a, b) => a.Ordinal - b.Ordinal);

                    // get list of new fields
                    /** @type {TYPE.DataExtensionFieldItem[]} */
                    const newFieldsArr = originalMetadata[key].Fields.Field.filter(
                        (field) => !field.ObjectID
                    );
                    // push new fields to end of list
                    if (newFieldsArr.length) {
                        finalFieldsArr.push(...newFieldsArr);
                    }

                    // sort Fields entry to the end of the object for saving in .json
                    delete item.Fields;
                    item.Fields = finalFieldsArr;
                }
            }
            // UPDATE + CREATE
            for (const field of item.Fields) {
                DataExtensionField.postRetrieveTasks(field, true);
            }
        }
    }

    /**
     * Retrieves dataExtension metadata. Afterwards starts retrieval of dataExtensionColumn metadata retrieval
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @param {TYPE.BuObject} buObject properties for auth
     * @param {void} [_] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<{metadata: TYPE.DataExtensionMap, type: string}>} Promise of item map
     */
    static async retrieve(retrieveDir, additionalFields, buObject, _, key) {
        /** @type {TYPE.SoapRequestParams} */
        let requestParams = null;
        /** @type {TYPE.SoapRequestParams} */
        let fieldOptions = null;
        if (key) {
            requestParams = {
                filter: {
                    leftOperand: 'CustomerKey',
                    operator: 'equals',
                    rightOperand: key,
                },
            };
            fieldOptions = {
                filter: {
                    leftOperand: 'DataExtension.CustomerKey',
                    operator: 'equals',
                    rightOperand: key,
                },
            };
        }
        let metadata = await this._retrieveAll(additionalFields, requestParams);
        // in case of cache dont get fields
        if (metadata && retrieveDir) {
            // get fields from API
            await this._attachFields(metadata, fieldOptions, additionalFields);
        }
        if (!retrieveDir && buObject.eid !== buObject.mid) {
            // for caching, we want to retrieve shared DEs as well from the instance parent BU
            Util.logger.info(
                ' - Caching dependent Metadata: dataExtension (shared via _ParentBU_)'
            );
            /** @type {TYPE.BuObject} */
            const buObjectParentBu = {
                eid: this.properties.credentials[buObject.credential].eid,
                mid: this.properties.credentials[buObject.credential].eid,
                businessUnit: Util.parentBuName,
                credential: buObject.credential,
            };
            try {
                this.client = auth.getSDK(buObjectParentBu);
            } catch (ex) {
                Util.logger.error(ex.message);
                return;
            }
            const metadataParentBu = await this._retrieveAll(additionalFields);

            // get shared folders to match our shared / synched Data Extensions
            Util.logger.info(' - Caching dependent Metadata: folder (shared via _ParentBU_)');
            Folder.client = this.client;
            Folder.properties = this.properties;
            const result = await Folder.retrieveForCache(buObjectParentBu);
            cache.mergeMetadata('folder', result.metadata, buObject.eid);

            // get the types and clean out non-shared ones
            const folderTypesFromParent = require('../MetadataTypeDefinitions').folder
                .folderTypesFromParent;
            for (const metadataEntry in metadataParentBu) {
                try {
                    // get the data extension type from the folder
                    const folderContentType = cache.searchForField(
                        'folder',
                        metadataParentBu[metadataEntry].CategoryID,
                        'ID',
                        'ContentType',
                        buObject.eid
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
            this.client = auth.getSDK(this.buObject);
            Folder.client = auth.getSDK(this.buObject);

            // make sure to overwrite parent bu DEs with local ones
            metadata = { ...metadataParentBu, ...metadata };
        }
        if (retrieveDir) {
            const savedMetadata = await super.saveResults(metadata, retrieveDir, null);
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
     * helper to retrieve all dataExtension fields and attach them to the dataExtension metadata
     *
     * @private
     * @param {TYPE.DataExtensionMap} metadata already cached dataExtension metadata
     * @param {TYPE.SoapRequestParams} [fieldOptions] optionally filter results
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @returns {Promise.<void>} -
     */
    static async _attachFields(metadata, fieldOptions, additionalFields) {
        const fieldsObj = await this._retrieveFields(fieldOptions, additionalFields);
        const fieldKeys = Object.keys(fieldsObj);
        // add fields to corresponding DE
        for (const key of fieldKeys) {
            const field = fieldsObj[key];
            if (metadata[field?.DataExtension?.CustomerKey]) {
                metadata[field.DataExtension.CustomerKey].Fields.push(field);
            } else {
                Util.logger.warn(` - Issue retrieving data extension fields. key='${key}'`);
            }
        }

        // sort fields by Ordinal value (API returns field unsorted)
        for (const metadataEntry in metadata) {
            metadata[metadataEntry].Fields.sort(DataExtensionField.sortDeFields);
        }

        // remove attributes that we do not want to retrieve
        // * do this after sorting on the DE's field list
        for (const key of fieldKeys) {
            DataExtensionField.postRetrieveTasks(fieldsObj[key], true);
        }
    }

    /**
     * Retrieves dataExtension metadata. Afterwards starts retrieval of dataExtensionColumn metadata retrieval
     *
     * @param {TYPE.BuObject} [buObject] properties for auth
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @returns {Promise.<{metadata: TYPE.DataExtensionMap, type: string}>} Promise of item map
     */
    static async retrieveChangelog(buObject, additionalFields) {
        const metadata = await this._retrieveAll(additionalFields);
        return { metadata: metadata, type: 'dataExtension' };
    }
    /**
     * manages post retrieve steps
     *
     * @param {TYPE.DataExtensionItem} metadata a single dataExtension
     * @returns {TYPE.DataExtensionItem} metadata
     */
    static async postRetrieveTasks(metadata) {
        // Error during deploy if SendableSubscriberField.Name = '_SubscriberKey' even though it is retrieved like that
        // Therefore map it to 'Subscriber Key'. Retrieving afterward still results in '_SubscriberKey'
        if (metadata.SendableSubscriberField?.Name === '_SubscriberKey') {
            metadata.SendableSubscriberField.Name = 'Subscriber Key';
        }
        return this._parseMetadata(JSON.parse(JSON.stringify(metadata)));
    }

    /**
     * Helper to retrieve Data Extension Fields
     *
     * @private
     * @param {TYPE.SoapRequestParams} [options] options (e.g. continueRequest)
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @returns {Promise.<TYPE.DataExtensionFieldMap>} Promise of items
     */
    static async _retrieveFields(options, additionalFields) {
        if (!options) {
            // dont print this during updates or templating which retrieves fields DE-by-DE
            Util.logger.info(' - Caching dependent Metadata: dataExtensionField');
        }
        DataExtensionField.client = this.client;
        DataExtensionField.properties = this.properties;

        const response = await DataExtensionField.retrieveForCache(options, additionalFields);
        return response.metadata;
    }
    /**
     * helps retrieving fields during templating and deploy where we dont want the full list
     *
     * @private
     * @param {TYPE.DataExtensionMap} metadata list of DEs
     * @param {string} customerKey external key of single DE
     * @returns {Promise.<void>} -
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

        DataExtensionField.client = this.client;
        DataExtensionField.properties = this.properties;
        const fieldArr = DataExtensionField.convertToSortedArray(fieldsObj);

        // remove attributes that we do not want to retrieve
        // * do this after sorting on the DE's field list
        for (const field of fieldArr) {
            DataExtensionField.postRetrieveTasks(field, true);
        }

        metadata[customerKey].Fields = fieldArr;
    }

    /**
     * prepares a DataExtension for deployment
     *
     * @param {TYPE.DataExtensionItem} metadata a single data Extension
     * @returns {Promise.<TYPE.DataExtensionItem>} Promise of updated single DE
     */
    static async preDeployTasks(metadata) {
        // folder
        metadata.CategoryID = cache.searchForField('folder', metadata.r__folder_Path, 'Path', 'ID');
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
                    CustomerKey: cache.searchForField(
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
     *
     * @private
     * @param {TYPE.DataExtensionItem} json single dataextension
     * @param {object[][]} tabled prepped array for output in tabular format
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
            json.r__folder_Path ||
            '<i>Hidden! Could not find folder with ID ' + json.CategoryID + '</i>'
        }</p>`;
        output += `<p><b>Fields in table:</b> ${tabled.length - 1}</p>`;
        output += '<p><b>Sendable:</b> ';
        output +=
            json.IsSendable === true
                ? 'Yes (<i>' +
                  json.SendableDataExtensionField.Name +
                  '</i> to <i>' +
                  json.SendableSubscriberField.Name +
                  '</i>)</p>\n\n'
                : `No</p>\n\n`;
        output += `<p><b>Testable:</b> ${json.IsTestable === true ? 'Yes' : 'No'}</p>\n\n`;
        if (json.r__dataExtensionTemplate_Name) {
            output += `<p><b>Template:</b> ${json.r__dataExtensionTemplate_Name}</p>`;
        }

        output += '<table><thead><tr>';
        for (const element of tabled[0]) {
            output += '<th>' + element + '</th>';
        }
        output += '</tr><thead><tbody>';
        for (let i = 1; i < tabled.length; i++) {
            output += '<tr>';
            for (const field of tabled[i]) {
                output += `<td>${field}</td>`;
            }
            output += '</tr>';
        }
        output += '</tbody></table>';
        return output;
    }

    /**
     * Experimental: Only working for DataExtensions:
     * Saves json content to a html table in the local file system. Will create the parent directory if it does not exist.
     * The json's first level of keys must represent the rows and the secend level the columns
     *
     * @private
     * @param {TYPE.DataExtensionItem} json dataextension
     * @param {object[][]} tabled prepped array for output in tabular format
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
                json.r__folder_Path ||
                '_Hidden! Could not find folder with ID ' + json.CategoryID + '_'
            }/\n\n` +
            `**Fields in table:** ${tabled.length - 1}\n\n`;
        output += '**Sendable:** ';
        output +=
            json.IsSendable === true
                ? 'Yes (`' +
                  json.SendableDataExtensionField.Name +
                  '` to `' +
                  json.SendableSubscriberField.Name +
                  '`)\n\n'
                : `No\n\n`;
        output += `**Testable:** ${json.IsTestable === true ? 'Yes' : 'No'}\n\n`;
        if (json.r__dataExtensionTemplate_Name) {
            output += `**Template:** ${json.r__dataExtensionTemplate_Name}\n\n`;
        }

        let tableSeparator = '';
        for (const column of tabled[0]) {
            output += `| ${column} `;
            tableSeparator += '| --- ';
        }
        output += `|\n${tableSeparator}|\n`;
        for (let i = 1; i < tabled.length; i++) {
            for (const field of tabled[i]) {
                output += `| ${field} `;
            }
            output += '|\n';
        }
        return output;
    }

    /**
     * Saves json content to a html table in the local file system. Will create the parent directory if it does not exist.
     * The json's first level of keys must represent the rows and the secend level the columns
     *
     * @private
     * @param {string} directory directory the file will be written to
     * @param {string} filename name of the file without '.json' ending
     * @param {TYPE.DataExtensionItem} json dataextension.columns
     * @param {'html'|'md'} mode html or md
     * @param {string[]} [fieldsToKeep] list of keys(columns) to show. This will also specify
     * @returns {Promise.<boolean>} Promise of success of saving the file
     */
    static async _writeDoc(directory, filename, json, mode, fieldsToKeep) {
        let fieldsJson = Object.values(json.Fields);
        if (fieldsToKeep) {
            const newJson = [];
            for (const element of fieldsJson) {
                const newJsonElement = {};
                for (const field of fieldsToKeep) {
                    newJsonElement[field] = element[field];
                }
                newJson.push(newJsonElement);
            }
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
            await File.writeToFile(directory, filename + '.dataExtension-doc', mode, output);
        } catch (ex) {
            Util.logger.error(`DataExtension.writeDeToX(${mode}):: error | ` + ex.message);
        }
    }
    /**
     * Parses metadata into a readable Markdown/HTML format then saves it
     *
     * @param {TYPE.BuObject} buObject properties for auth
     * @param {TYPE.DataExtensionMap} [metadata] a list of dataExtension definitions
     * @returns {Promise.<void>} -
     */
    static async document(buObject, metadata) {
        try {
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
        } catch (ex) {
            Util.logger.error(ex.message);
            return;
        }
        const docPath = File.normalizePath([
            this.properties.directories.retrieve,
            buObject.credential,
            buObject.businessUnit,
            this.definition.type,
        ]);
        if (!metadata || !Object.keys(metadata).length) {
            // as part of retrieve & manual execution we could face an empty folder
            return;
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
        return Promise.all(
            Object.keys(metadata).map((customerKey) => {
                // for (const customerKey in metadata) {
                if (metadata[customerKey]?.Fields?.length) {
                    for (const field of metadata[customerKey].Fields) {
                        field.IsNullable = !Util.isTrue(field.IsRequired);
                        for (const key of columnsToIterateThrough) {
                            if (Util.isTrue(field[key])) {
                                field[key] = '+';
                            } else if (Util.isFalse(field[key])) {
                                field[key] = '-';
                            }
                        }
                    }

                    if (['html', 'both'].includes(this.properties.options.documentType)) {
                        return this._writeDoc(
                            docPath + '/',
                            customerKey,
                            metadata[customerKey],
                            'html',
                            columnsToPrint
                        );
                    }
                    if (['md', 'both'].includes(this.properties.options.documentType)) {
                        return this._writeDoc(
                            docPath + '/',
                            customerKey,
                            metadata[customerKey],
                            'md',
                            columnsToPrint
                        );
                    }
                }
            })
        );
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
     * clean up after deleting a metadata item
     *
     * @param {TYPE.BuObject} buObject references credentials
     * @param {string} customerKey Identifier of metadata item
     * @returns {void}
     */
    static async postDeleteTasks(buObject, customerKey) {
        // delete local copy: retrieve/cred/bu/dataExtension/...json
        const jsonFile = File.normalizePath([
            this.properties.directories.retrieve,
            buObject.credential,
            buObject.businessUnit,
            this.definition.type,
            `${customerKey}.${this.definition.type}-meta.json`,
        ]);
        await File.remove(jsonFile);
        // delete local copy: doc/dataExtension/cred/bu/...md
        const mdFile = File.normalizePath([
            this.properties.directories.docs,
            'dataExtension',
            buObject.credential,
            buObject.businessUnit,
            `${customerKey}.${this.definition.type}.md`,
        ]);
        await File.remove(mdFile);
    }

    /**
     * Retrieves folder metadata into local filesystem. Also creates a uniquePath attribute for each folder.
     *
     * @param {TYPE.BuObject} buObject properties for auth
     * @returns {Promise.<{metadata: TYPE.DataExtensionMap, type: string}>} Promise
     */
    static async retrieveForCache(buObject) {
        return this.retrieve(null, ['ObjectID', 'CustomerKey', 'Name'], buObject, null, null);
    }
    /**
     * Retrieves dataExtension metadata in template format.
     *
     * @param {string} templateDir Directory where retrieved metadata directory will be saved
     * @param {string} name name of the metadata item
     * @param {TYPE.TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {Promise.<{metadata: TYPE.DataExtensionMap, type: string}>} Promise of items
     */
    static async retrieveAsTemplate(templateDir, name, templateVariables) {
        const options = {
            filter: {
                leftOperand: 'Name',
                operator: 'equals',
                rightOperand: name,
            },
        };

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

                const originalKey = key;
                const metadataCleaned = JSON.parse(
                    JSON.stringify(await this.postRetrieveTasks(metadata[key]))
                );

                this.keepTemplateFields(metadataCleaned);
                const metadataTemplated = JSON.parse(
                    Util.replaceByObject(JSON.stringify(metadataCleaned), templateVariables)
                );
                await File.writeJSONToFile(
                    [templateDir, this.definition.type].join('/'),
                    originalKey + '.' + this.definition.type + '-meta',
                    metadataTemplated
                );
            } catch (ex) {
                Util.metadataLogger('error', this.definition.type, 'retrieve', ex, key);
            }
        }
        Util.logger.info(`- templated ${this.definition.type}: ${customerKey}`);

        return { metadata: metadata[customerKey], type: 'dataExtension' };
    }

    /**
     * parses retrieved Metadata before saving
     *
     * @private
     * @param {TYPE.DataExtensionItem} metadata a single dataExtension definition
     * @returns {TYPE.DataExtensionItem} a single dataExtension definition
     */
    static _parseMetadata(metadata) {
        let error = false;
        let verbose = false;
        // data extension type (from folder)
        try {
            metadata.r__folder_ContentType = cache.searchForField(
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
                Util.logger.warn(` - dataExtension '${metadata.Name}': ${ex.message}`);
            }
        }
        // folder
        try {
            metadata.r__folder_Path = cache.searchForField(
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
        if (metadata.Template?.CustomerKey) {
            try {
                metadata.r__dataExtensionTemplate_Name = cache.searchForField(
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
                    ` - Issue with dataExtension '${
                        metadata[this.definition.nameField]
                    }': Could not find specified DataExtension Template. Please note that DataExtensions based on SMSMessageTracking and SMSSubscriptionLog cannot be deployed automatically across BUs at this point.`
                );
            }
        }
        // remove the date fields manually here because we need them in the changelog but not in the saved json
        delete metadata.CreatedDate;
        delete metadata.ModifiedDate;

        return metadata;
    }

    /**
     * Retrieves dataExtension metadata and cleans it
     *
     * @private
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @param {TYPE.SoapRequestParams} [options] e.g. filter
     * @returns {Promise.<TYPE.DataExtensionMap>} keyField => metadata map
     */
    static async _retrieveAll(additionalFields, options) {
        const { metadata } = await super.retrieveSOAP(null, null, options, additionalFields);
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
    /**
     * should return only the json for all but asset, query and script that are saved as multiple files
     * additionally, the documentation for dataExtension and automation should be returned
     *
     * @param {string[]} keyArr customerkey of the metadata
     * @returns {string[]} list of all files that need to be committed in a flat array ['path/file1.ext', 'path/file2.ext']
     */
    static getFilesToCommit(keyArr) {
        if (!this.properties.metaDataTypes.documentOnRetrieve.includes(this.definition.type)) {
            // document dataExtension is not active upon retrieve, run default method instead
            return super.getFilesToCommit(keyArr);
        } else {
            // document dataExtension is active. assume we want to commit the MD file as well
            const path = File.normalizePath([
                this.properties.directories.retrieve,
                this.buObject.credential,
                this.buObject.businessUnit,
                this.definition.type,
            ]);

            const fileList = keyArr.flatMap((key) => [
                File.normalizePath([path, `${key}.${this.definition.type}-meta.json`]),
                File.normalizePath([path, `${key}.${this.definition.type}-doc.md`]),
            ]);
            return fileList;
        }
    }
}

// Assign definition to static attributes
DataExtension.definition = require('../MetadataTypeDefinitions').dataExtension;

module.exports = DataExtension;
