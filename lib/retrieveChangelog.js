#!/usr/bin/env node'use strict';

/* eslint-disable unicorn/prefer-top-level-await */
/**
 * sample file on how to retrieve a simple changelog to use in GUIs or automated processing of any kind
 *
 * @example
 [{
    name: 'deName',
    key: 'deKey',
    t: 'dataExtension',
    cd: '2020-05-06T00:16:00.737',
    cb: 'name of creator',
    ld: '2020-05-06T00:16:00.737',
    lb: 'name of lastmodified'
  }]
 */

import mcdev from './index';

import Definition from './MetadataTypeDefinitions';
import MetadataType from './MetadataTypeInfo';

// disable cli logs
// mcdev._setLoggingLevel({ silent: true });

const customDefinition = {
    automation: {
        keyField: 'CustomerKey',
        nameField: 'Name',
        createdDateField: 'CreatedDate',
        createdNameField: 'CreatedBy',
        lastmodDateField: 'LastSaveDate',
        lastmodNameField: 'LastSavedBy',
    },
    dataExtension: {
        keyField: 'CustomerKey',
        nameField: 'Name',
        createdDateField: 'CreatedDate',
        createdNameField: null,
        lastmodDateField: 'ModifiedDate',
        lastmodNameField: null,
    },
};
(async function () {
    // get userid>name mapping
    const userList = (await mcdev.retrieve('ACN-Learning/_ParentBU_', 'user', true)).user;
    // reduce userList to simple id-name map
    for (const key of Object.keys(userList)) {
        userList[userList[key].ID] = userList[key].Name;
        delete userList[key];
    }

    // get changed metadata
    const changelogList = await mcdev.retrieve('ACN-Learning/MCDEV_Training_Source', null, true);
    const allMetadata = [];
    Object.keys(changelogList).map((type) => {
        if (changelogList[type]) {
            const def = customDefinition[type] || Definition[type];
            allMetadata.push(
                ...Object.keys(changelogList[type]).map((key) => {
                    const item = changelogList[type][key];
                    if (
                        MetadataType[type].isFiltered(item, true) ||
                        MetadataType[type].isFiltered(item, false)
                    ) {
                        return;
                    }

                    const listEntry = {
                        name: item[def.nameField],
                        key: item[def.keyField],
                        t: type,
                        cd: item[def.createdDateField],
                        cb: getUserName(userList, item, def.createdNameField),
                        ld: item[def.lastmodDateField],
                        lb: getUserName(userList, item, def.lastmodNameField),
                    };
                    return listEntry;
                })
            );
        }
    });
    const finalResult = allMetadata.filter((item) => undefined !== item);
    console.log('finalResult', finalResult); // eslint-disable-line no-console
})();

/**
 *
 * @param {Object.<string, string>} userList user-id > user-name map
 * @param {Object.<string, string>} item single metadata item
 * @param {string} fieldname name of field containing the info
 * @returns {string} username or user id or 'n/a'
 */
function getUserName(userList, item, fieldname) {
    return userList[item[fieldname]] || item[fieldname] || 'n/a';
}
