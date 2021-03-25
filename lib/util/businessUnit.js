'use strict';

const Util = require('./util');
const File = require('./file');
const Retriever = require('../Retriever');

/**
 * Helper that handles retrieval of BU info
 */
const BusinessUnit = {
    /**
     * Refreshes BU names and ID's from MC instance
     * @param {object} properties current properties that have to be refreshed
     * @param {string} credentialsName identifying name of the installed package / project
     * @returns {Promise<boolean>} success of refresh
     */
    refreshBUProperties: async function (properties, credentialsName) {
        const currentCredentials = properties.credentials[credentialsName];
        const buObject = {
            clientId: currentCredentials.clientId,
            clientSecret: currentCredentials.clientSecret,
            tenant: currentCredentials.tenant,
        };
        let client;
        Util.logger.info(`Testing credentials`);
        try {
            client = await Util.getETClient(buObject);
        } catch (ex) {
            Util.logger.error(ex.message);
            return false;
        }
        const retriever = new Retriever(properties, buObject, client);
        Util.logger.info(`Loading BUs`);

        const buResult = await new Promise((resolve) => {
            retriever.client.SoapClient.retrieve(
                'BusinessUnit',
                ['Name', 'ID', 'ParentName', 'ParentID', 'IsActive'],
                { queryAllAccounts: true },
                (error, response) => {
                    if (error) {
                        Util.logger.error(`Credentials failure. ${error}`);
                        resolve(null);
                        // throw new Error(error);
                    } else {
                        resolve(response.body.Results);
                    }
                }
            );
        });
        if (buResult !== null && !buResult.length) {
            Util.logger.error(`Credentials worked but no BUs found. Check access rights!`);
        } else if (buResult !== null) {
            Util.logger.info(`Found ${buResult.length} BUs:`);
            // create shortcut and reset BU list at the same time. we don't want old entries clutter the new list
            const myBuList = (currentCredentials.businessUnits = {});
            // sort array by name for better display (wont affect object in settings)
            buResult
                .sort((a, b) => {
                    if (a.ParentID === '0') {
                        return -1;
                    }
                    if (b.ParentID === '0') {
                        return 1;
                    }
                    if (a.Name.toLowerCase() < b.Name.toLowerCase()) {
                        return -1;
                    }
                    if (a.Name.toLowerCase() > b.Name.toLowerCase()) {
                        return 1;
                    }
                    return 0;
                })
                .forEach((element) => {
                    if (element.ParentID === '0') {
                        myBuList[Util.parentBuName] = element.ID;
                        currentCredentials.eid = element.ID;
                        Util.logger.info(` - ${Util.parentBuName} (${element.Name})`);
                    } else {
                        const equalizedName = element.Name.replace(/[^\w\s]/gi, '') // remove special chars
                            .replace(/ +/g, '_') // convert spaces to underscore
                            .replace(/__+/g, '_'); // make sure we never have more than one underscore in a row
                        myBuList[equalizedName] = element.ID;
                        Util.logger.info(
                            ` - ${element.Name} ${
                                element.Name !== equalizedName ? `(${equalizedName})` : ''
                            }`
                        );
                    }
                });
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
                buResult
            );
            // update config
            await File.saveConfigFile(properties);
        }
        return true;
    },
};

module.exports = BusinessUnit;
