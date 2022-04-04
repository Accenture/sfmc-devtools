/**
 * @typedef {require('../metadataTypes/MetadataType.js')} MetadataType
 */
const Util = require('./util');
/** @type SDK */
const SDK = require('sfmc-sdk');
const Conf = require('conf');
const credentialStore = new Conf({ configName: 'sessions', clearInvalidConfig: true });
const currentMID = null;

module.exports = {
    /**
     * signs in with SFMC
     *
     * @param {BuObject} buObject properties for auth
     * @returns {Promise<SDK>} auth object
     */
    async getSDK(buObject) {
        const credentialKey = `${buObject.mid}|${buObject.clientId}`;
        // Retrieve existing configuration from credential store (for example tokens still valid)
        const existing = credentialStore.get(credentialKey) || {};
        // build new values from BU object, but augment with previous values if available
        const config = Object.assign(existing, {
            client_id: buObject.clientId,
            client_secret: buObject.clientSecret,
            auth_url: 'https://' + buObject.tenant + '.auth.marketingcloudapis.com/',
            account_id: buObject.mid,
        });

        /** @type SDK */
        const sdk = new SDK(config, {
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
                        `- Connection problem (Code: ${
                            ex.code
                        }). Retrying ${remainingAttempts} time${remainingAttempts > 1 ? 's' : ''}`
                    );
                    Util.logger.errorStack(ex);
                },
            },
            requestAttempts: 4,
            retryOnConnectionError: true,
        });

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
            }
        } catch (ex) {
            throw new Error(ex.message);
        }
        return sdk;
    },
};
