import { Util } from './util.js';
import File from './file.js';
import SDK from 'sfmc-sdk';
import Conf from 'conf';

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

const credentialStore = new Conf({
    projectName: 'mcdev',
    configName: 'sessions',
    clearInvalidConfig: true,
});
const initializedSDKs = {};
let authfile;

const Auth = {
    /**
     * For each business unit, set up base credentials to be used.
     *
     * @param {AuthObject} authObject details for
     * @param {string} credential of the instance
     * @returns {Promise.<void>} -
     */
    async saveCredential(authObject, credential) {
        const sdk = setupSDK(credential, authObject);
        try {
            // check credentials to allow clear log output and stop execution
            // @ts-expect-error - params are optional but jsdoc in SFMC-SDK says otherwise
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
     * @param {BuObject} buObject information about current context
     * @returns {SDK} auth object
     */
    getSDK(buObject) {
        const credentialKey = `${buObject.credential}/${buObject.businessUnit}`;
        if (initializedSDKs[credentialKey]) {
            // return initialied SDK if available
            return initializedSDKs[credentialKey];
        } else {
            // check existing credentials cached
            authfile ||= File.readJsonSync(Util.authFileName);
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
 * @param {AuthObject} authObject credentials for specific BU
 * @returns {SDK} auth object
 */
function setupSDK(sessionKey, authObject) {
    return new SDK(authObject, {
        eventHandlers: {
            onLoop: (type, accumulator) => {
                Util.logger.info(
                    Util.getGrayMsg(
                        ` - Requesting next batch (currently ${accumulator?.length} records)`
                    )
                );
            },
            onRefresh: (authObject) => {
                authObject.scope = authObject.scope.split(' '); // Scope is usually not an array, but we enforce conversion here for simplicity
                credentialStore.set(sessionKey, authObject);
            },
            onConnectionError: (ex, remainingAttempts) => {
                Util.logger.info(
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
            logRequest: (req) => {
                const msg = JSON.parse(JSON.stringify(req));
                if (msg.url === '/Service.asmx') {
                    msg.data = msg.data.replaceAll(
                        /<fueloauth(.*)<\/fueloauth>/gim,
                        '<fueloauth>*** TOKEN REMOVED ***</fueloauth>'
                    );
                } else if (msg.headers?.Authorization) {
                    msg.headers.Authorization = 'Bearer *** TOKEN REMOVED ***';
                }
                switch (Util.OPTIONS.api) {
                    case 'cli': {
                        /* eslint-disable no-console */
                        console.log(
                            `${Util.color.fgMagenta}API REQUEST >>${Util.color.reset}`,
                            msg
                        );
                        /* eslint-enable no-console */

                        break;
                    }
                    case 'log': {
                        let data;
                        if (msg.data) {
                            data = msg.data;
                            delete msg.data;
                        }
                        Util.logger.debug('API REQUEST >> ' + JSON.stringify(msg, null, 2));
                        if (data) {
                            // printing it separately leads to better formatting
                            Util.logger.debug(
                                'API REQUEST body >> \n  ' +
                                    (typeof data === 'string'
                                        ? data
                                        : JSON.stringify(data, null, 2))
                            );
                        }

                        break;
                    }
                    // No default
                }
            },
            logResponse: (res) => {
                const msg =
                    typeof res.data == 'string' ? res.data : JSON.stringify(res.data, null, 2);
                if (Util.OPTIONS.api === 'cli') {
                    console.log(`${Util.color.fgMagenta}API RESPONSE <<${Util.color.reset}`, msg); // eslint-disable-line no-console
                } else if (Util.OPTIONS.api === 'log') {
                    Util.logger.debug('API RESPONSE body << \n  ' + msg);
                }
            },
        },
        requestAttempts: 4,
        retryOnConnectionError: true,
    });
}

export default Auth;
