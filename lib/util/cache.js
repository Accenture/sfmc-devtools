import TYPE from '../../types/mcdev.d.js';
import { Util } from './util.js';

/** @type {TYPE.Cache} */
const dataStore = {};
let currentMID = null;

export default {
    /**
     * Method to setup buObject
     * NOTE: in future this may need to restore, rather than wipe the cache
     *
     * @param {TYPE.BuObject} buObject for current Business unit
     * @returns {void}
     */
    initCache: (buObject) => {
        if (buObject?.mid) {
            currentMID = buObject.mid;
            dataStore[currentMID] = {};
            // If the EID is not setup, also do this for required types (ie. Folders)
            if (!dataStore[buObject.eid]) {
                dataStore[buObject.eid] = {};
            }
        } else {
            throw new Error('Business Unit (buObject) used when initialzing cache was missing MID');
        }
    },
    /**
     * return entire cache for current MID
     *
     * @returns {TYPE.MultiMetadataTypeMap} cache for one Business Unit
     */
    getCache: () => dataStore[currentMID],

    /* eslint-disable unicorn/no-array-for-each */
    /**
     * clean cache for one BU if mid provided, otherwise whole cache
     *
     * @param {number} [mid] of business unit
     * @returns {void}
     */
    clearCache: (mid) =>
        mid
            ? Object.keys(dataStore[mid]).forEach((key) => delete dataStore[mid][key])
            : Object.keys(dataStore).forEach((key) => delete dataStore[key]),
    /* eslint-enable unicorn/no-array-for-each */

    /**
     * return a specific item from cache
     *
     * @param {TYPE.SupportedMetadataTypes} type of Metadata to retrieve from cache
     * @param {string} key of the specific metadata
     * @returns {TYPE.MetadataTypeItem} cached metadata item
     */
    getByKey: (type, key) => dataStore[currentMID]?.[type]?.[key],
    /**
     * override cache for given metadata type with new data
     *
     * @param {TYPE.SupportedMetadataTypes} type of Metadata to retrieve from cache
     * @param {TYPE.MetadataTypeMap} metadataMap map to be set
     * @returns {void}
     */
    setMetadata: (type, metadataMap) => {
        dataStore[currentMID][type] = metadataMap;
    },
    /**
     * merges entire metadata type with existing cache
     *
     * @param {TYPE.SupportedMetadataTypes} type of Metadata to retrieve from cache
     * @param {TYPE.MetadataTypeMap} metadataMap map to be merged
     * @param {number} overrideMID which should be used for merging
     * @returns {void}
     */
    mergeMetadata: (type, metadataMap, overrideMID) => {
        // ensure cache exists for type
        dataStore[currentMID][type] ||= {};
        // if overrideMID is provided, create a copy of current MID cache
        if (overrideMID) {
            // ! needs to be verified if this is actually needed. When discovering an issue with this method actually overriting metadataMap, this copy-logic was present and i did not want to break things
            dataStore[overrideMID][type] = Object.assign({}, dataStore[currentMID][type]);
        }
        // merge metadataMap into existing cache
        Object.assign(dataStore[overrideMID || currentMID][type] || {}, metadataMap);
    },
    /**
     * standardized method for getting data from cache.
     *
     * @param {TYPE.SupportedMetadataTypes} metadataType metadata type ie. query
     * @param {string|number|boolean} searchValue unique identifier of metadata being looked for
     * @param {string} searchField field name (key in object) which contains the unique identifer
     * @param {string} returnField field which should be returned
     * @param {number} [overrideMID] ignore currentMID and use alternative (for example parent MID)
     * @returns {string|number|boolean} value of specified field. Error is thrown if not found
     */
    searchForField(metadataType, searchValue, searchField, returnField, overrideMID) {
        for (const key in dataStore[overrideMID || currentMID]?.[metadataType]) {
            if (
                Util.resolveObjPath(
                    searchField,
                    dataStore[overrideMID || currentMID][metadataType][key]
                ) == searchValue
            ) {
                try {
                    if (
                        Util.resolveObjPath(
                            returnField,
                            dataStore[overrideMID || currentMID][metadataType][key]
                        )
                    ) {
                        return Util.resolveObjPath(
                            returnField,
                            dataStore[overrideMID || currentMID][metadataType][key]
                        );
                    } else {
                        throw new Error(); // eslint-disable-line unicorn/error-message
                    }
                } catch {
                    throw new Error(
                        `${metadataType} with ${searchField} '${searchValue}' does not have field '${returnField}'`
                    );
                }
            }
        }
        throw new Error(
            `Dependent ${metadataType} with ${searchField}='${searchValue}' was not found on your BU`
        );
    },
    /**
     * standardized method for getting data from cache - adapted for special case of lists
     * ! keeping this in util/cache.js rather than in metadataTypes/List.js to avoid potential circular dependencies
     *
     * @param {string} searchValue unique identifier of metadata being looked for
     * @param {string} searchField ObjectID or ID
     * @returns {string} unique folderPath/ListName combo of list
     */
    getListPathName(searchValue, searchField) {
        const returnField1 = 'r__folder_Path';
        const returnField2 = 'ListName';
        for (const key in dataStore[currentMID]['list']) {
            if (dataStore[currentMID]['list'][key][searchField] === searchValue) {
                try {
                    if (
                        dataStore[currentMID]['list'][key][returnField1] &&
                        dataStore[currentMID]['list'][key][returnField2]
                    ) {
                        return (
                            dataStore[currentMID]['list'][key][returnField1] +
                            '/' +
                            dataStore[currentMID]['list'][key][returnField2]
                        );
                    } else {
                        throw new Error(); // eslint-disable-line unicorn/error-message
                    }
                } catch {
                    throw new Error(
                        `${'list'} with ${searchField}='${searchValue}' does not have the fields ${returnField1} and ${returnField2}`
                    );
                }
            }
        }
        throw new Error(
            `Dependent list with ${searchField}='${searchValue}' was not found on your BU`
        );
    },
    /**
     * standardized method for getting data from cache - adapted for special case of lists
     * ! keeping this in util/cache.js rather than in metadataTypes/List.js to avoid potential circular dependencies
     *
     * @param {string} listPathName folderPath/ListName combo of list
     * @param {string} returnField ObjectID or ID
     * @returns {string} unique ObjectId of list
     */
    getListObjectId(listPathName, returnField) {
        let folderPath = listPathName.split('/');
        const listName = folderPath.pop();
        folderPath = folderPath.join('/');
        for (const key in dataStore[currentMID]['list']) {
            if (
                dataStore[currentMID]['list'][key].ListName === listName &&
                dataStore[currentMID]['list'][key].r__folder_Path === folderPath
            ) {
                try {
                    if (dataStore[currentMID]['list'][key][returnField]) {
                        return dataStore[currentMID]['list'][key][returnField];
                    } else {
                        throw new Error(); // eslint-disable-line unicorn/error-message
                    }
                } catch {
                    throw new Error(
                        `${'list'} with ListName='${listName}' and r__folder_Path='${folderPath}' does not have field '${returnField}'`
                    );
                }
            }
        }
        throw new Error(
            `Dependent list with ListName='${listName}' and r__folder_Path='${folderPath}' was not found on your BU`
        );
    },
};
