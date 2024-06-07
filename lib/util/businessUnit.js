'use strict';

import { Util } from './util.js';
import File from './file.js';
import auth from './auth.js';

/**
 * @typedef {import('../../types/mcdev.d.js').AuthObject} AuthObject
 * @typedef {import('../../types/mcdev.d.js').BuObject} BuObject
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
 */

/**
 * Helper that handles retrieval of BU info
 */
const BusinessUnit = {
    /**
     * Refreshes BU names and ID's from MC instance
     *
     * @param {Mcdevrc} properties current properties that have to be refreshed
     * @param {string} credentialsName identifying name of the installed package / project
     * @returns {Promise.<boolean>} success of refresh
     */
    refreshBUProperties: async function (properties, credentialsName) {
        const currentCredentials = properties.credentials[credentialsName];
        Util.logger.info(`Loading BUs`);
        try {
            const client = auth.getSDK({
                mid: currentCredentials.eid,
                eid: currentCredentials.eid,
                credential: credentialsName,
                businessUnit: '_ParentBU_',
            });
            const buResult = await client.soap.retrieve(
                'BusinessUnit',
                ['Name', 'ID', 'ParentName', 'ParentID', 'IsActive'],
                { QueryAllAccounts: true }
            );
            if (buResult !== null && !buResult.Results) {
                Util.logger.error(`Credentials worked but no BUs found. Check access rights!`);
            } else if (buResult !== null) {
                Util.logger.info(`Found ${buResult.Results.length} BUs:`);
                // create shortcut and reset BU list at the same time. we don't want old entries clutter the new list
                const myBuList = (currentCredentials.businessUnits = {});
                // sort array by name for better display (wont affect object in settings)
                for (const element of buResult.Results.map((element) => {
                    element.ID = Number.parseInt(element.ID);
                    element.ParentID = Number.parseInt(element.ParentID);
                    return element;
                }).sort((a, b) => {
                    if (a.ParentID === 0) {
                        return -1;
                    }
                    if (b.ParentID === 0) {
                        return 1;
                    }
                    if (a.Name.toLowerCase() < b.Name.toLowerCase()) {
                        return -1;
                    }
                    if (a.Name.toLowerCase() > b.Name.toLowerCase()) {
                        return 1;
                    }
                    return 0;
                })) {
                    if (element.ParentID === 0) {
                        myBuList[Util.parentBuName] = element.ID;
                        currentCredentials.eid = element.ID;
                        Util.logger.info(` - ${Util.parentBuName} (${element.Name})`);
                    } else {
                        const equalizedName = element.Name.replaceAll(/[^\w\s]/gi, '') // remove special chars
                            .replaceAll(/ +/g, '_') // convert spaces to underscore
                            .replaceAll(/__+/g, '_'); // make sure we never have more than one underscore in a row
                        myBuList[equalizedName] = element.ID;
                        Util.logger.info(
                            ` - ${element.Name} ${
                                element.Name === equalizedName ? '' : `(${equalizedName})`
                            }`
                        );
                    }
                }
                Util.logger.debug(`EID: ${currentCredentials.eid}`);
                if (currentCredentials.eid === null) {
                    Util.logger.warn(
                        `It seems your 'installed package' was not created on the Parent BU of your instance.`
                    );
                    Util.logger.warn(
                        `While basic functionality will work, it is strongly recommended that you create a new 'installed package' there to enable support for shared Data Extensions and automatic retrieval of the BU list.`
                    );
                    Util.logger.warn(
                        `If you cannot create a package on the Parent BU, please open your ./.mcdevrc.json and update the list of BUs and their MIDs manually.`
                    );
                    // allow user to work by setting this to an obviously false value which nonetheless doesn't block execution
                    currentCredentials.eid = -1;
                }
                // store BU list for repo
                await File.writeJSONToFile(
                    properties.directories.businessUnits,
                    File.filterIllegalFilenames(credentialsName + '.businessUnits'),
                    buResult.Results
                );
                // update config
                await File.saveConfigFile(properties);
            }
        } catch (ex) {
            Util.logger.error(`Credentials failure. ${ex}`);
            return null;
        }
        return true;
    },
};

export default BusinessUnit;
