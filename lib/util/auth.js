/**
 * @typedef {object} AuthObject
 * @property {string} client_id client_id client_id for sfmc-sdk auth
 * @property {string} client_secret client_secret for sfmc-sdk auth
 * @property {number} account_id mid of business unit to auth against
 * @property {string} auth_url authentication base url
 */

const Util = require('./util');
const File = require('./file');
const SDK = require('sfmc-sdk');
const Conf = require('conf');
const credentialStore = new Conf({ configName: 'sessions', clearInvalidConfig: true });
// const currentMID = null;
const initializedSDKs = {};
let authfile;

module.exports = {
    /**
     * For each business unit, set up base credentials to be used.
     *
     * @param {Util.AuthObject} authObject details for
     * @param {string} credential of the instance
     * @returns {void}
     */
    async saveCredential(authObject, credential) {
        const sdk = setupSDK(credential, authObject);
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
                const existingAuth = await File.readJson(Util.authFileName);
                existingAuth[credential] = authObject;

                File.writeJSON(Util.authFileName, existingAuth);
                authfile = existingAuth;
            }
        } catch (ex) {
            throw new Error(ex.message);
        }
    },
    /**
     * Returns an SDK instance to be used for API calls
     *
     * @param {Util.BuObject} buObject information about current context
     * @returns {SDK} auth object
     */
    getSDK(buObject) {
        const credentialKey = `${buObject.credential}/${buObject.businessUnit}`;
        // return initialied SDK if available
        if (initializedSDKs[credentialKey]) {
            return initializedSDKs[credentialKey];
        } else {
            let authObj = credentialStore.get(credentialKey);
            if (!authObj) {
                authfile = authfile || File.readJsonSync(Util.authFileName);
                authObj = authfile[buObject.credential];
                authObj.account_id = buObject.mid;
            }
            initializedSDKs[credentialKey] = setupSDK(credentialKey, authObj);

            return initializedSDKs[credentialKey];
        }
    },
};

const setupSDK = (credentialKey, authObject) =>
    new SDK(authObject, {
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
