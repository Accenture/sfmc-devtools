const TYPE = require('../../types/mcdev.d');
const Util = require('./util');
const File = require('./file');
const SDK = require('sfmc-sdk');
const Conf = require('conf');
const credentialStore = new Conf({ configName: 'sessions', clearInvalidConfig: true });
// const currentMID = null;
const initializedSDKs = {};
let authfile;

const Auth = {
    /**
     * For each business unit, set up base credentials to be used.
     *
     * @param {TYPE.AuthObject} authObject details for
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
                const existingAuth = (await File.pathExists(Util.authFileName))
                    ? await File.readJson(Util.authFileName)
                    : {};
                existingAuth[credential] = authObject;
                await File.writeJSONToFile('./', Util.authFileName.split('.json')[0], existingAuth);
                authfile = existingAuth;
            }
        } catch (ex) {
            throw new Error(ex.message);
        }
    },
    /**
     * Returns an SDK instance to be used for API calls
     *
     * @param {TYPE.BuObject} buObject information about current context
     * @returns {SDK} auth object
     */
    getSDK(buObject) {
        const credentialKey = `${buObject.credential}/${buObject.businessUnit}`;
        if (initializedSDKs[credentialKey]) {
            // return initialied SDK if available
            return initializedSDKs[credentialKey];
        } else {
            // check existing credentials cached
            authfile = authfile || File.readJsonSync(Util.authFileName);
            const newAuthObj = authfile[buObject.credential];
            // use client_id + MID to ensure a unique combination across instances
            const sessionKey = newAuthObj.client_id + '|' + buObject.mid;
            const existingAuthObj = credentialStore.get(sessionKey);
            if (!existingAuthObj) {
                newAuthObj.account_id = buObject.mid;
            }
            initializedSDKs[credentialKey] = setupSDK(credentialKey, existingAuthObj || newAuthObj);
            return initializedSDKs[credentialKey];
        }
    },
    /**
     * helper to clear all auth sessions
     *
     * @returns {void}
     */
    clearSessions() {
        credentialStore.clear();
        Util.logger.info(`Auth sessions cleared`);
    },
};
/**
 * Returns an SDK instance to be used for API calls
 *
 * @param {string} sessionKey key for specific BU
 * @param {TYPE.AuthObject} authObject credentials for specific BU
 * @returns {SDK} auth object
 */
function setupSDK(sessionKey, authObject) {
    return new SDK(authObject, {
        eventHandlers: {
            onLoop: (type, accumulator) => {
                Util.logger.info(
                    ` - Requesting next batch (currently ${accumulator?.length} records)`
                );
            },
            onRefresh: (authObject) => {
                authObject.scope = authObject.scope.split(' '); // Scope is usually not an array, but we enforce conversion here for simplicity
                credentialStore.set(sessionKey, authObject);
            },
            onConnectionError: (ex, remainingAttempts) => {
                Util.logger.warn(
                    ` - Connection problem (Code: ${ex.code}). Retrying ${remainingAttempts} time${
                        remainingAttempts > 1 ? 's' : ''
                    }${
                        ex.endpoint
                            ? Util.getGrayMsg(
                                  ' - ' + ex.endpoint.split('rest.marketingcloudapis.com')[1]
                              )
                            : ''
                    }`
                );
                Util.logger.errorStack(ex);
            },
        },
        requestAttempts: 4,
        retryOnConnectionError: true,
    });
}

module.exports = Auth;
