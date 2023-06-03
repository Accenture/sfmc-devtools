'use strict';

import TYPE from '../../types/mcdev.d.js';
import MetadataType from './MetadataType.js';
import { Util } from '../util/util.js';

/**
 * DataExtensionField MetadataType
 *
 * @augments MetadataType
 */
class DataExtensionField extends MetadataType {
    /**
     * Retrieves all records and saves it to disk
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @returns {Promise.<{metadata: TYPE.DataExtensionFieldMap, type: string}>} Promise of items
     */
    static async retrieve(retrieveDir, additionalFields) {
        return super.retrieveSOAP(retrieveDir, null, null, additionalFields);
    }
    /**
     * Retrieves all records for caching
     *
     * @param {TYPE.SoapRequestParams} [requestParams] required for the specific request (filter for example)
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @returns {Promise.<{metadata: TYPE.DataExtensionFieldMap, type: string}>} Promise of items
     */
    static async retrieveForCache(requestParams, additionalFields) {
        return super.retrieveSOAP(null, requestParams, null, additionalFields);
    }
    /**
     * helper for {@link DataExtension._retrieveFieldsForSingleDe} that sorts the fields into an array
     *
     * @param {TYPE.DataExtensionFieldMap} fieldsObj customerKey-based list of fields for one dataExtension
     * @returns {TYPE.DataExtensionFieldItem[]} sorted array of field objects
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
     * @param {TYPE.DataExtensionFieldItem} a -
     * @param {TYPE.DataExtensionFieldItem} b -
     * @returns {boolean} sorting based on Ordinal
     */
    static sortDeFields(a, b) {
        return a.Ordinal - b.Ordinal;
    }
    /**
     * manages post retrieve steps
     *
     * @param {TYPE.DataExtensionFieldItem} metadata a single item
     * @param {boolean} forDataExtension when used by DataExtension class we remove more fields
     * @returns {TYPE.DataExtensionFieldItem} metadata
     */
    static postRetrieveTasks(metadata, forDataExtension) {
        return this._parseMetadata(metadata, forDataExtension);
    }

    /**
     * parses retrieved Metadata before saving
     *
     * @private
     * @param {TYPE.DataExtensionFieldItem} metadata a single record
     * @param {boolean} forDataExtension when used by DataExtension class we remove more fields
     * @returns {TYPE.DataExtensionFieldItem} parsed metadata definition
     */
    static _parseMetadata(metadata, forDataExtension) {
        if (forDataExtension) {
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
        }
        return metadata;
    }
    /**
     * Mofifies passed deployColumns for update by mapping ObjectID to their target column's values.
     * Removes FieldType field if its the same in deploy and target column, because it results in an error even if its of the same type
     *
     * @param {TYPE.DataExtensionFieldItem[]} deployColumns Columns of data extension that will be deployed
     * @param {string} deKey external/customer key of Data Extension
     * @returns {Promise.<Object.<string, TYPE.DataExtensionFieldItem>>} existing fields by their original name to allow re-adding FieldType after update
     */
    static async prepareDeployColumnsOnUpdate(deployColumns, deKey) {
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
        const response = await this.retrieveForCache(
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
        /** @type {Object.<string, TYPE.DataExtensionFieldItem>} */
        const existingFieldByName = {};

        for (const key of Object.keys(fieldsObj)) {
            existingFieldByName[fieldsObj[key].Name] = fieldsObj[key];
        }
        for (let i = deployColumns.length - 1; i >= 0; i--) {
            const item = deployColumns[i];
            const itemOld = existingFieldByName[item.Name];
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
    static deleteByKey(customerKey) {
        return this.deleteByKeySOAP(customerKey);
    }

    /**
     * Delete a data extension from the specified business unit
     *
     * @param {string} customerKey Identifier of metadata
     * @returns {boolean} deletion success flag
     */
    static async deleteByKeySOAP(customerKey) {
        const [deKey, fieldKey] = customerKey.split('.');
        customerKey = `[${deKey}].[${fieldKey}]`;

        // get the object id
        const response = await this.retrieveForCache(
            {
                filter: {
                    leftOperand: 'CustomerKey',
                    operator: 'equals',
                    rightOperand: customerKey,
                },
            },
            ['Name', 'ObjectID']
        );
        const fieldObjectID = response.metadata[customerKey].ObjectID;
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
            this.client.soap.delete(
                'DataExtension', // yes, not DataExtensionField
                keyObj,
                null
            );

            Util.logger.info(`- deleted ${this.definition.type}: ${customerKey}`);
            this.postDeleteTasks(customerKey);
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
     * @returns {void}
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
DataExtensionField.definition = MetadataTypeDefinitions.dataExtensionField;

export default DataExtensionField;
