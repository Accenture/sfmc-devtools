import { Util } from './util.js';

/**
 * @typedef {import('../../types/mcdev.d.js').AuthObject} AuthObject
 * @typedef {import('../../types/mcdev.d.js').BuObject} BuObject
 * @typedef {import('../../types/mcdev.d.js').Cache} Cache
 * @typedef {import('../../types/mcdev.d.js').CodeExtract} CodeExtract
 * @typedef {import('../../types/mcdev.d.js').CodeExtractItem} CodeExtractItem
 * @typedef {import('../../types/mcdev.d.js').DeltaPkgItem} DeltaPkgItem
 * @typedef {import('../../types/mcdev.d.js').Mcdevrc} Mcdevrc
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItem} MetadataTypeItem
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItemDiff} MetadataTypeItemDiff
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItemObj} MetadataTypeItemObj
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMap} MetadataTypeMap
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMapObj} MetadataTypeMapObj
 * @typedef {import('../../types/mcdev.d.js').MultiMetadataTypeList} MultiMetadataTypeList
 * @typedef {import('../../types/mcdev.d.js').MultiMetadataTypeMap} MultiMetadataTypeMap
 * @typedef {import('../../types/mcdev.d.js').SoapRequestParams} SoapRequestParams
 * @typedef {import('../../types/mcdev.d.js').TemplateMap} TemplateMap
 * @typedef {import('../../types/mcdev.d.js').TypeKeyCombo} TypeKeyCombo
 *
 * @typedef {import('../../types/mcdev.d.js').ListItem} ListItem
 * @typedef {import('../../types/mcdev.d.js').ListMap} ListMap
 */

/** @type {Cache} */
const dataStore = {};
let currentMID = null;

export default {
    /**
     * Method to setup buObject
     * NOTE: in future this may need to restore, rather than wipe the cache
     *
     * @param {BuObject} buObject for current Business unit
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
     * @returns {MultiMetadataTypeMap} cache for one Business Unit
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
     * @param {string} type of Metadata to retrieve from cache
     * @param {string} key of the specific metadata
     * @returns {MetadataTypeItem} cached metadata item
     */
    getByKey: (type, key) => dataStore[currentMID]?.[type]?.[key],
    /**
     * override cache for given metadata type with new data
     *
     * @param {string} type of Metadata to retrieve from cache
     * @param {MetadataTypeMap} metadataMap map to be set
     * @returns {void}
     */
    setMetadata: (type, metadataMap) => {
        dataStore[currentMID][type] = metadataMap;
    },
    /**
     * merges entire metadata type with existing cache
     *
     * @param {string} type of Metadata to retrieve from cache
     * @param {MetadataTypeMap} metadataMap map to be merged
     * @param {number} [overrideMID] which should be used for merging
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
     * @param {string} metadataType metadata type ie. query
     * @param {string|number|boolean} searchValue unique identifier of metadata being looked for
     * @param {string} searchField field name (key in object) which contains the unique identifer
     * @param {string} returnField field which should be returned
     * @param {number} [overrideMID] ignore currentMID and use alternative (for example parent MID)
     * @returns {string} value of specified field. Error is thrown if not found
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
     * helper for setFolderId
     *
     * @param {string} r__folder_Path folder path value
     * @param {number} [overrideMID] ignore currentMID and use alternative (for example parent MID)
     * @returns {number} folder ID
     */
    getFolderId(r__folder_Path, overrideMID) {
        if (!r__folder_Path) {
            throw new Error('r__folder_Path not set');
        }
        /** @type {ListMap} */
        const folderMap = dataStore[overrideMID || currentMID]?.['folder'];
        if (!folderMap) {
            throw new Error('No folders found in cache');
        }
        const potentialFolders = [];
        for (const folder of Object.values(folderMap)) {
            if (folder.Path === r__folder_Path) {
                if (folder.Client.ID === (overrideMID || currentMID)) {
                    return folder.ID;
                } else {
                    potentialFolders.push(folder);
                }
            }
        }
        if (potentialFolders.length >= 1) {
            return potentialFolders[0].ID;
        } else {
            throw new Error(`No folders found with path ${r__folder_Path}`);
        }
    },
    /**
     * standardized method for getting data from cache - adapted for special case of lists
     * ! keeping this in util/cache.js rather than in metadataTypes/List.js to avoid potential circular dependencies
     *
     * @param {string} searchValue unique identifier of metadata being looked for
     * @param {'ObjectID'|'ID'|'CustomerKey'} searchField ObjectID:string(uuid), ID:numeric, CustomerKey:string(name + folder ID)
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
     * @param {'ObjectID'|'ID'|'CustomerKey'|'ListName'} returnField ObjectID:string(uuid), ID:numeric, CustomerKey:string(name + folder ID)
     * @returns {string} unique ObjectId of list
     */
    getListObjectId(listPathName, returnField) {
        const folderPathArr = listPathName.split('/');
        const listName = folderPathArr.pop();
        const folderPath = folderPathArr.join('/');
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
