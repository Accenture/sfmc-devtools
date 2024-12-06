'use strict';

import MetadataType from './MetadataType.js';
import { Util } from '../util/util.js';
import DataExtension from './DataExtension.js';

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
 * @typedef {import('../../types/mcdev.d.js').DataExtensionFieldMap} DataExtensionFieldMap
 * @typedef {import('../../types/mcdev.d.js').DataExtensionFieldItem} DataExtensionFieldItem
 */

/**
 * DataExtensionField MetadataType
 *
 * @augments MetadataType
 */
class DataExtensionField extends MetadataType {
    static fixShared_fields;

    /**
     * Retrieves all records and saves it to disk
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @returns {Promise.<{metadata: DataExtensionFieldMap, type: string}>} Promise of items
     */
    static async retrieve(retrieveDir, additionalFields) {
        return super.retrieveSOAP(retrieveDir, null, null, additionalFields);
    }
    /**
     * Retrieves all records and saves it to disk
     *
     * @returns {Promise.<MetadataTypeMapObj>} Promise of items
     */
    static async retrieveForCache() {
        const cachedDEs = cache.getCache().dataExtension;
        if (cachedDEs) {
            await DataExtension.attachFields(cachedDEs);
        }
        return;
    }

    /**
     * Retrieves all records for caching
     *
     * @param {SoapRequestParams} [requestParams] required for the specific request (filter for example)
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @returns {Promise.<{metadata: DataExtensionFieldMap, type: string}>} Promise of items
     */
    static async retrieveForCacheDE(requestParams, additionalFields) {
        let response;
        response = await super.retrieveSOAP(null, requestParams, null, additionalFields);
        if (!response) {
            // try again but without filters as a workaround for the "String or binary data would be truncated." issue
            response = await super.retrieveSOAP(null, {}, null, additionalFields);
        }
        return response;
    }

    /**
     * helper for DataExtension.retrieveFieldsForSingleDe that sorts the fields into an array
     *
     * @param {DataExtensionFieldMap} fieldsObj customerKey-based list of fields for one dataExtension
     * @returns {DataExtensionFieldItem[]} sorted array of field objects
     */
    static convertToSortedArray(fieldsObj) {
        return (
            Object.keys(fieldsObj)
                .map((field) => fieldsObj[field])
                // the API returns the fields not sorted
                .sort(this.sortDeFields)
        );
    }

    /**
     * sorting method to ensure `Ordinal` is respected
     *
     * @param {DataExtensionFieldItem} a -
     * @param {DataExtensionFieldItem} b -
     * @returns {number} sorting based on Ordinal
     */
    static sortDeFields(a, b) {
        return a.Ordinal - b.Ordinal;
    }

    /**
     * manages post retrieve steps; only used by DataExtension class
     *
     * @param {DataExtensionFieldItem} metadata a single item
     * @returns {DataExtensionFieldItem} metadata
     */
    static postRetrieveTasksDE(metadata) {
        // remove fields according to definition
        this.keepRetrieveFields(metadata);

        // remove fields that we do not need after association to a DE
        delete metadata.CustomerKey;
        delete metadata.DataExtension;
        delete metadata.Ordinal;
        if (metadata.FieldType !== 'Decimal') {
            // remove scale - it's only used for "Decimal" to define the digits behind the decimal
            delete metadata.Scale;
        }
        return metadata;
    }

    /**
     * Mofifies passed deployColumns for update by mapping ObjectID to their target column's values.
     * Removes FieldType field if its the same in deploy and target column, because it results in an error even if its of the same type
     *
     * @param {DataExtensionFieldItem[]} deployColumns Columns of data extension that will be deployed
     * @param {string} deKey external/customer key of Data Extension
     * @returns {Promise.<DataExtensionFieldMap>} existing fields by their original name to allow re-adding FieldType after update
     */
    static async prepareDeployColumnsOnUpdate(deployColumns, deKey) {
        // create list of DE keys that had changes to their fields to be able to use it as a filter in the --fixShared logic
        this.fixShared_fields ||= {};
        this.fixShared_fields[deKey] ||= {};

        // get row count to know which field restrictions apply
        let hasData = false;
        try {
            const rowset = await this.client.rest.get(
                `/data/v1/customobjectdata/key/${deKey}/rowset?$page=1&$pagesize=1`
            );
            const rowCount = rowset.count;
            hasData = rowCount > 0;
            Util.logger.debug(`dataExtension ${deKey} row count: ${rowCount}`);
        } catch (ex) {
            Util.logger.debug(`Could not retrieve rowcount for ${deKey}: ${ex.message}`);
        }

        // retrieve existing fields to enable updating them
        const response = await this.retrieveForCacheDE(
            {
                filter: {
                    leftOperand: 'DataExtension.CustomerKey',
                    operator: 'equals',
                    rightOperand: deKey,
                },
            },
            ['Name', 'ObjectID']
        );

        const fieldsObj = response.metadata;

        // ensure fields can be updated properly by their adding ObjectId based on Name-matching
        /** @type {DataExtensionFieldMap} */
        const existingFieldByName = {};

        for (const key of Object.keys(fieldsObj)) {
            // make sure we stringify the name in case it looked numeric and then lowercase it for easy comparison as the server is comparing field names case-insensitive
            existingFieldByName[(fieldsObj[key].Name + '').toLowerCase()] = fieldsObj[key];
        }
        for (let i = deployColumns.length - 1; i >= 0; i--) {
            const item = deployColumns[i];
            // make sure we stringify the name in case it looked numeric and then lowercase it for easy comparison as the server is comparing field names case-insensitive
            const itemOld = existingFieldByName[(item.Name + '').toLowerCase()];
            if (itemOld) {
                // field is getting updated ---

                // Updating to a new FieldType will result in an error; warn & afterwards remove it
                if (itemOld.FieldType !== item.FieldType) {
                    // applicable: with or without data but simply ignored by API
                    Util.logger.warn(
                        ` - The Field Type of an existing field cannot be changed. Keeping the original value for [${deKey}].[${item.Name}]: '${itemOld.FieldType}'`
                    );
                    item.FieldType = itemOld.FieldType;
                }
                if (item.FieldType !== 'Decimal') {
                    // remove scale - it's only used for "Decimal" to define the digits behind the decimal
                    delete item.Scale;
                }
                delete item.FieldType;

                if (itemOld.MaxLength > item.MaxLength) {
                    // applicable: with or without data (Code 310007)
                    Util.logger.warn(
                        ` - The length of an existing field cannot be decreased. Keeping the original value for [${deKey}].[${item.Name}]: '${itemOld.MaxLength}'`
                    );
                    item.MaxLength = itemOld.MaxLength;
                }
                if (Util.isFalse(itemOld.IsRequired) && Util.isTrue(item.IsRequired)) {
                    // applicable: with or without data (Code 310007)
                    Util.logger.warn(
                        ` - A field cannot be changed to be required on update after it was created to allow nulls. Resetting to not equired: [${deKey}].[${item.Name}]`
                    );
                    item.IsRequired = itemOld.IsRequired;
                }

                // enable renaming
                if (item.Name_new) {
                    Util.logger.info(
                        ` - Found Name_new='${item.Name_new}' for field ${deKey}.${item.Name} - trying to rename.`
                    );
                    item.Name = item.Name_new;
                    delete item.Name_new;
                }

                // check if any changes were found
                let changeFound = false;
                for (const key of Object.keys(item)) {
                    if (item[key] !== itemOld[key]) {
                        changeFound = true;
                    }
                }
                // share fields with fixShared logic
                this.fixShared_fields[deKey][item.Name] = structuredClone(item);
                this.fixShared_fields[deKey][item.Name].FieldType = itemOld.FieldType;

                if (!changeFound) {
                    deployColumns.splice(i, 1);
                    Util.logger.verbose(`no change - removed field [${deKey}].[${item.Name}]`);
                    continue;
                }

                // set the ObjectId for clear identification during update
                item.ObjectID = itemOld.ObjectID;
            } else {
                // field is getting added ---

                if (hasData && Util.isTrue(item.IsRequired) && item.DefaultValue === '') {
                    // applicable: with data only
                    if (Util.isFalse(item.IsPrimaryKey)) {
                        Util.logger.warn(
                            ` - Adding new fields to an existing table requires that these fields are either not-required (nullable) or have a default value set. Changing [${deKey}].[${item.Name}] to be not-required`
                        );
                        item.IsRequired = false;
                    } else {
                        Util.logger.error(
                            `- You cannot add a new primary key field to an existing table that has data. Removing [${deKey}].[${item.Name}] from deployment`
                        );
                        deployColumns.splice(i, 1);
                    }
                }
                if (item.Name_new) {
                    Util.logger.info(
                        ` - Found Name_new='${item.Name_new}' for field ${deKey}.${item.Name} but could not find a corresponding DE field on the server - adding new field instead of updating.`
                    );
                    delete item.Name_new;
                }
                // Field doesn't exist in target, therefore Remove ObjectID if present
                delete item.ObjectID;

                this.fixShared_fields[deKey][item.Name] = structuredClone(item);
            }
            if (Util.isTrue(item.IsPrimaryKey) && Util.isFalse(item.IsRequired)) {
                // applicable: with or without data
                Util.logger.warn(
                    `- Primary Key field [${deKey}].[${item.Name}] cannot be not-required (nullable). Changing field to be required!`
                );
                item.IsRequired = true;
            }

            // filter bad manual changes to the json
            if (!Util.isTrue(item.IsRequired) && !Util.isFalse(item.IsRequired)) {
                Util.logger.error(
                    `- Invalid value for 'IsRequired' of [${deKey}].[${item.Name}]. Found '${item.IsRequired}' instead of 'true'/'false'. Removing field from deploy!`
                );
                deployColumns.splice(i, 1);
            }
            if (!Util.isTrue(item.IsPrimaryKey) && !Util.isFalse(item.IsPrimaryKey)) {
                Util.logger.error(
                    `- Invalid value for 'IsPrimaryKey' of [${deKey}].[${item.Name}]. Found '${item.IsPrimaryKey}' instead of 'true'/'false'. Removing field from deploy!`
                );
                deployColumns.splice(i, 1);
            }
        }

        Util.logger.info(
            Util.getGrayMsg(
                ` - Found ${deployColumns.length} added/updated Fields for ${deKey}${
                    deployColumns.length ? ': ' : ''
                }` + deployColumns.map((item) => item.Name).join(', ')
            )
        );

        return existingFieldByName;
    }

    /**
     * Delete a metadata item from the specified business unit
     *
     * @param {string} customerKey Identifier of data extension
     * @returns {Promise.<boolean>} deletion success status
     */
    static async deleteByKey(customerKey) {
        return this.deleteByKeySOAP(customerKey);
    }

    /**
     * Delete a data extension from the specified business unit
     *
     * @param {string} customerKey Identifier of metadata
     * @param {string} [fieldId] for programmatic deletes only one can pass in the ID directly
     * @returns {Promise.<boolean>} deletion success flag
     */
    static async deleteByKeySOAP(customerKey, fieldId) {
        const [deKey, fieldKey] = customerKey.split('.');
        customerKey = `[${deKey}].[${fieldKey}]`;

        let fieldObjectID = fieldId;
        // get the object id
        if (!fieldObjectID) {
            const response = await this.retrieveForCacheDE(
                {
                    filter: {
                        leftOperand: 'CustomerKey',
                        operator: 'equals',
                        rightOperand: customerKey,
                    },
                },
                ['Name', 'ObjectID']
            );
            fieldObjectID = response.metadata[customerKey]?.ObjectID;
        }
        if (!fieldObjectID) {
            Util.logger.error(`Could not find ${customerKey} on your BU`);
            return false;
        }

        // normal code
        const keyObj = {
            CustomerKey: deKey,
            Fields: {
                Field: {
                    ObjectID: fieldObjectID,
                },
            },
        };
        try {
            // ! we really do need to delete from DataExtension not DataExtensionField here!
            this.client.soap.delete('DataExtension', keyObj, null);

            if (!fieldId) {
                Util.logger.info(` - deleted ${this.definition.type}: ${customerKey}`);
                this.postDeleteTasks(customerKey);
            }
            return true;
        } catch (ex) {
            const errorMsg = ex.results?.length
                ? `${ex.results[0].StatusMessage} (Code ${ex.results[0].ErrorCode})`
                : ex.message;
            Util.logger.error(
                `- error deleting ${this.definition.type} '${customerKey}': ${errorMsg}`
            );

            return false;
        }
    }

    /**
     * clean up after deleting a metadata item
     *
     * @param {string} customerKey Identifier of metadata item
     * @returns {Promise.<void>} -
     */
    static async postDeleteTasks(customerKey) {
        // TODO actually clean up local dataextension json
        Util.logger.warn(
            ` - The dataExtension for ${customerKey} wasn't updated locally yet after removing this field.`
        );
    }
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
import cache from '../util/cache.js';
DataExtensionField.definition = MetadataTypeDefinitions.dataExtensionField;

export default DataExtensionField;
