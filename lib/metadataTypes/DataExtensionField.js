'use strict';

const Util = require('../util/util');

/**
 * @typedef {Object} DataExtensionFieldItem
 * @property {string} [ObjectID] id
 * @property {string} [CustomerKey] key in format [DEkey].[FieldName]
 * @property {Object} [DataExtension] -
 * @property {string} DataExtension.CustomerKey key of DE
 * @property {string} Name name of field
 * @property {string} [Name_new] custom attribute that is only used when trying to rename a field from Name to Name_new
 * @property {string} DefaultValue empty string for not set
 * @property {'true'|'false'} IsRequired -
 * @property {'true'|'false'} IsPrimaryKey -
 * @property {string} Ordinal 1, 2, 3, ...
 * @property {'Text'|'Number'|'Date'|'Boolean'|'Decimal'|'EmailAddress'|'Phone'|'Locale'} FieldType can only be set on create
 * @property {string} Scale the number of places after the decimal that the field can hold; example: "0","1", ...
 *
 * @typedef {Object.<string, DataExtensionFieldItem>} DataExtensionFieldMap
 */

const MetadataType = require('./MetadataType');

/**
 * DataExtensionField MetadataType
 * @augments MetadataType
 */
class DataExtensionField extends MetadataType {
    /**
     * Retrieves all records and saves it to disk
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @param {Object} buObject properties for auth
     * @returns {Promise<{metadata:DataExtensionFieldMap,type:string}>} Promise of items
     */
    static async retrieve(retrieveDir, additionalFields, buObject) {
        return super.retrieveSOAPgeneric(retrieveDir, buObject, null, additionalFields);
    }
    /**
     * Retrieves all records for caching
     * @param {Object} [requestParams] required for the specific request (filter for example)
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @returns {Promise<{metadata:DataExtensionFieldMap,type:string}>} Promise of items
     */
    static async retrieveForCache(requestParams, additionalFields) {
        return super.retrieveSOAPgeneric(null, null, requestParams, additionalFields);
    }
    /**
     * helper for DataExtension.js that sorts the fields into an array
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
     * @param {DataExtensionFieldItem} a -
     * @param {DataExtensionFieldItem} b -
     * @returns {boolean} sorting based on Ordinal
     */
    static sortDeFields(a, b) {
        return a.Ordinal - b.Ordinal;
    }
    /**
     * manages post retrieve steps
     * @param {DataExtensionFieldItem} metadata a single item
     * @param {boolean} forDataExtension when used by DataExtension class we remove more fields
     * @returns {DataExtensionFieldItem} metadata
     */
    static postRetrieveTasks(metadata, forDataExtension) {
        return this._parseMetadata(metadata, forDataExtension);
    }

    /**
     * parses retrieved Metadata before saving
     * @private
     * @param {DataExtensionFieldItem} metadata a single record
     * @param {boolean} forDataExtension when used by DataExtension class we remove more fields
     * @returns {DataExtensionFieldItem} parsed metadata definition
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
     * @param {DataExtensionFieldItem[]} deployColumns Columns of data extension that will be deployed
     * @param {string} deKey external/customer key of Data Extension
     * @returns {Object<string,DataExtensionFieldItem>} existing fields by their original name to allow re-adding FieldType after update
     */
    static async prepareDeployColumnsOnUpdate(deployColumns, deKey) {
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
        /** @type {Object<string,DataExtensionFieldItem>} */
        const existingFieldByName = {};

        Object.keys(fieldsObj).forEach((key) => {
            existingFieldByName[fieldsObj[key].Name] = fieldsObj[key];
        });
        for (let i = deployColumns.length - 1; i >= 0; i--) {
            const item = deployColumns[i];
            const itemOld = existingFieldByName[item.Name];
            if (itemOld) {
                // field is getting updated ---

                // Updating to a new FieldType will result in an error; warn & afterwards remove it
                if (itemOld.FieldType !== item.FieldType) {
                    Util.logger.warn(
                        `- The Field Type of an existing field cannot be changed. Keeping the original value for [${deKey}].[${item.Name}]: '${itemOld.FieldType}'`
                    );
                    item.FieldType = itemOld.FieldType;
                }
                if (item.FieldType !== 'Decimal') {
                    // remove scale - it's only used for "Decimal" to define the digits behind the decimal
                    delete item.Scale;
                }
                delete item.FieldType;

                if (itemOld.MaxLength > item.MaxLength) {
                    Util.logger.warn(
                        `- The length of an existing field cannot be decreased. Keeping the original value for [${deKey}].[${item.Name}]: '${itemOld.MaxLength}'`
                    );
                    item.MaxLength = itemOld.MaxLength;
                }
                if (Util.isFalse(itemOld.IsRequired) && Util.isTrue(item.IsRequired)) {
                    Util.logger.warn(
                        `- A field cannot be changed to be required on update after it was created to allow nulls: [${deKey}].[${item.Name}]`
                    );
                    item.IsRequired = itemOld.IsRequired;
                }

                // enable renaming
                if (item.Name_new) {
                    item.Name = item.Name_new;
                    delete item.Name_new;
                    Util.logger.warn(
                        `Found 'Name_new' value '${item.Name_new}' for ${deKey}.${item.Name} - trying to rename.`
                    );
                }

                // check if any changes were found
                let changeFound = false;
                Object.keys(item).forEach((key) => {
                    if (item[key] !== itemOld[key]) {
                        changeFound = true;
                    }
                });
                if (!changeFound) {
                    deployColumns.splice(i, 1);
                    Util.logger.verbose(`no change - removed field [${deKey}].[${item.Name}]`);
                    continue;
                }

                // set the ObjectId for clear identification during update
                item.ObjectID = itemOld.ObjectID;
            } else {
                // field is getting added ---
                if (Util.isTrue(item.IsRequired) && item.DefaultValue === '') {
                    Util.logger.warn(
                        `- Adding new fields to an existing table requires that these fields are either not-required (nullable) or have a default value set. Changing [${deKey}].[${item.Name}] to be not-required`
                    );
                    item.IsRequired = 'false';
                }
                if (item.Name_new) {
                    Util.logger.warn(
                        `Found 'Name_new' value '${item.Name_new}' for ${deKey}.${item.Name} but could not find a corresponding DE field on the server - adding new field instead of updating.`
                    );
                    delete item.Name_new;
                }
                // Field doesn't exist in target, therefore Remove ObjectID if present
                delete item.ObjectID;
            }
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
        Util.logger.debug(
            `${deployColumns.length} Fields added/updated for [${deKey}]: ` +
                deployColumns.map((item) => item.Name).join(', ')
        );
        return deployColumns.length ? existingFieldByName : null;
    }

    /**
     * Delete a metadata item from the specified business unit
     * @param {Util.BuObject} buObject references credentials
     * @param {string} customerKey Identifier of data extension
     * @returns {Promise<boolean>} deletion success status
     */
    static deleteByKey(buObject, customerKey) {
        return this.deleteByKeySOAP(buObject, customerKey, false);
    }

    /**
     * Delete a data extension from the specified business unit
     * @param {Util.BuObject} buObject references credentials
     * @param {string} customerKey Identifier of metadata
     * @param {boolean} [handleOutside] if the API reponse is irregular this allows you to handle it outside of this generic method
     * @returns {boolean} deletion success flag
     */
    static async deleteByKeySOAP(buObject, customerKey, handleOutside) {
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
            await Util.retryOnError(
                `Retrying to delete ${this.definition.type}: ${customerKey}`,
                async () =>
                    await new Promise((resolve, reject) => {
                        this.client.SoapClient.delete(
                            'DataExtension', // yes, not DataExtensionField
                            keyObj,
                            null,
                            (error, response) => (error ? reject(error) : resolve(response))
                        );
                    })
            );
            if (!handleOutside) {
                Util.logger.info(`- deleted ${this.definition.type}: ${customerKey}`);
            }
            this.postDeleteTasks(buObject, customerKey);
            return true;
        } catch (ex) {
            if (!handleOutside) {
                let errorMsg;
                if (ex.results && ex.results.length) {
                    errorMsg = `${ex.results[0].StatusMessage} (Code ${ex.results[0].ErrorCode})`;
                } else {
                    errorMsg = ex.message;
                }
                Util.logger.error(
                    `- error deleting ${this.definition.type} '${customerKey}': ${errorMsg}`
                );
            } else {
                throw ex;
            }

            return false;
        }
    }
    /**
     * clean up after deleting a metadata item
     * @param {string} customerKey Identifier of metadata item
     * @returns {void} -
     */
    static async postDeleteTasks(customerKey) {
        // TODO actually clean up local dataextension json
        Util.logger.warn(
            `The dataExtension for ${customerKey} wasn't updated locally yet after removing this field.`
        );
    }
}

// Assign definition to static attributes
DataExtensionField.definition = require('../MetadataTypeDefinitions').dataExtensionField;
DataExtensionField.cache = {};
/**
 * @type {Util.SDK}
 */
DataExtensionField.client = undefined;

module.exports = DataExtensionField;
