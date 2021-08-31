#!/usr/bin/env node
'use strict';

const mcdev = require('./index');
const Definition = require('./MetadataTypeDefinitions');
const MetadataType = require('./MetadataTypeInfo');

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
    const userList = (await mcdev.retrieve('ACN-Learning/_ParentBU_', 'accountUser', true))
        .accountUser;
    // reduce userList to simple id-name map
    Object.keys(userList).forEach((id) => {
        userList[id] = userList[id].Name;
    });

    // get changed metadata
    const retrieveList = await mcdev.retrieve('ACN-Learning/MCDEV_Training_Source', null, true);
    const allMetadata = [];
    Object.keys(retrieveList).map((type) => {
        if (retrieveList[type]) {
            const def = customDefinition[type] || Definition[type];
            allMetadata.push(
                ...Object.keys(retrieveList[type]).map((key) => {
                    const item = retrieveList[type][key];
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
                        cb: userList[item[def.createdNameField]] || item[def.createdNameField],
                        ld: item[def.lastmodDateField],
                        lb: userList[item[def.lastmodNameField]] || item[def.lastmodNameField],
                    };
                    return listEntry;
                })
            );
        }
    });
    const finalResult = allMetadata.filter((item) => undefined !== item);
    console.log('finalResult', finalResult);
})();
