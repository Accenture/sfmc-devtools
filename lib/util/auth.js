/**
 * @typedef {require('../metadataTypes/MetadataType.js')} MetadataType
 */

/**
 * @typedef {Object} BuObject
 * @property {String} credential client_id for sfmc-sdk auth
 * @property {Integer} mid ID of Business Unit to authenticate with
 * @property {Integer} eid Parent ID of Business Unit to authenticate with
 * @property {String} businessUnit name of Business Unit to authenticate with
 **/

/**
 * @typedef {Object} AuthObject
 * @property {String} client_id client_id client_id for sfmc-sdk auth
 * @property {String} client_secret client_secret for sfmc-sdk auth
 * @property {Integer} account_id mid of business unit to auth against
 * @property {String} auth_url authentication base url
 **/

const Util = require('./util');
/** @type SDK */
const SDK = require('sfmc-sdk');
const Conf = require('conf');
const credentialStore = new Conf({ configName: 'sessions', clearInvalidConfig: true });
// const currentMID = null;
const initializedSDKs = {};

module.exports = {
    /**
     * For each business unit, set up base credentials to be used.
     *
     * @param {AuthObject} authObject details for
     * @param {String} credentialName of the instance
     * @returns {void}
     */
    async saveCredential(authObject, credentialName) {
        const sdk = setupSDK(credentialName, authObject);
        try {
            // check credentials to allow clear log output and stop execution
            const test = await sdk.auth.getAccessToken();
            if (test.error) {
                throw new Error(test.error_description);
            } else if (test.scope) {
                // find missing rights
                const missingAccess = sdk.auth
                    .getSupportedScopes()
                    .filter((element) => !test.scope.includes(element));

                if (missingAccess.length) {
                    Util.logger.warn(
                        'Installed package has insufficient access. You might encounter malfunctions!'
                    );
                    Util.logger.warn('Missing scope: ' + missingAccess.join(', '));
                }
                credentialStore.set(`${credentialName}/_ParentBU_`, authObject);
            }
        } catch (ex) {
            throw new Error(ex.message);
        }
    },
    /**
     * Returns an SDK instance to be used for API calls
     *
     * @param {BuObject} buObject information about current context
     * @returns {SDK} auth object
     */
    getSDK(buObject) {
        const credentialKey = `${buObject.credential}/${buObject.businessUnit}`;
        // return initialied SDK if available
        if (initializedSDKs[credentialKey]) {
            return initializedSDKs[credentialKey];
        } else {
            // check if a previous credential is available for this mid, if not set a new one from eid
            let authObj = credentialStore.get(credentialKey);
            if (authObj == null) {
                authObj = credentialStore.get(`${buObject.credential}/_ParentBU_`);
                if (authObj === null) {
                    throw new Error('No credential available for this MID or EID');
                } else {
                    authObj.account_id = buObject.mid;
                }
            }

            initializedSDKs[credentialKey] = setupSDK(credentialKey, authObj);
            return initializedSDKs[credentialKey];
        }
    },
};

const setupSDK = (credentialKey, authObject) => {
    console.log(authObject);
    return new SDK(authObject, {
        eventHandlers: {
            onLoop: (type, req) => {
                Util.logger.info(
                    `- Requesting next batch (currently ${req.Results.length} records)`
                );
            },
            onRefresh: (authObject) => {
                authObject.scope = authObject.scope.split(' '); // Scope is usually not an array, but we enforce conversion here for simplicity
                credentialStore.set(credentialKey, authObject);
            },
            onConnectionError: (ex, remainingAttempts) => {
                Util.logger.warn(
                    `- Connection problem (Code: ${ex.code}). Retrying ${remainingAttempts} time${
                        remainingAttempts > 1 ? 's' : ''
                    }`
                );
                Util.logger.errorStack(ex);
            },
        },
        requestAttempts: 4,
        retryOnConnectionError: true,
    });
};
