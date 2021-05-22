'use strict';

/**
 * @typedef {Object} DataExtensionFieldItem
 * @property {string} [ObjectID] id
 * @property {string} [CustomerKey] key
 * @property {Object} [DataExtension] -
 * @property {string} DataExtension.CustomerKey key of DE
 * @property {string} Name name
 * @property {string} DefaultValue -
 * @property {'true'|'false'} IsRequired -
 * @property {'true'|'false'} IsPrimaryKey -
 * @property {string} Ordinal 1, 2, 3, ...
 * @property {'Text'|'Date'|'Number'|'Decimal'|'Email'} FieldType -
 *
 * @typedef {Object.<string, DataExtensionFieldItem>} DataExtensionFieldMap
 */

const MetadataType = require('../MetadataType');

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
            // in case it is being saved, remove brackets
            metadata.CustomerKey = metadata.CustomerKey.replaceAll('[', '').replaceAll(']', '');
            // remove fields that we do not need after association to a DE
            delete metadata.DataExtension;
            delete metadata.Ordinal;
        }
        return metadata;
    }
}

// Assign definition to static attributes
DataExtensionField.cache = {};

module.exports = DataExtensionField;
