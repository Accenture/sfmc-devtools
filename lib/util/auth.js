'use strict';

const SDK = require('sfmc-sdk');
const Conf = require('conf');
const sessionStore = new Conf({ configName: 'sessions', clearInvalidConfig: true });
const credentialStore = new Conf({ configName: 'credentials', clearInvalidConfig: true });
const Util = require('./util');

const { context } = require('./context');
let sdkInstance = null;

/**
 * signs in with SFMC
 *
 * @param {Number} account_id MID of business unit
 * @returns {Promise<SDK>} auth object
 */
exports.sdk = () => {
    // if no account_id then use current context
    if (!sdkInstance) {
        throw new Error('SDK Not initialized');
    }
    return sdkInstance;
};

/**
 * Initializes the SDK because the current object is not the current MID
 * @param {Number} account_id MID to retrieve
 * @returns {Promise<SDK>} auth object
 */
exports.initSDK = async (account_id) => {
    // check if any need to init
    if (
        sdkInstance &&
        sdkInstance.auth &&
        sdkInstance.auth.options &&
        sdkInstance.auth.options.account_id === account_id
    ) {
        return sdkInstance;
    }

    const existing = sessionStore.get(account_id.toString());
    const credential = getCredential(context.businessUnits[account_id]);
    let config;
    // if nothing existing OR different then rebuild, else use existing
    if (
        !existing ||
        Object.keys(existing).length === 0 ||
        existing.client_id !== credential.client_id
    ) {
        config = Object.assign(credential, {
            account_id: account_id,
        });
    } else {
        config = existing;
    }

    /** @type SDK */
    const newSDK = new SDK(config, {
        onLoop: (type, req) => {
            console.log(type, `Requesting next batch (currently ${req.Results.length} records)`);
        },
        onRefresh: (options) => {
            sessionStore.set(account_id.toString(), options);
        },
    });

    try {
        // check credentials to allow clear log output and stop execution
        const test = await newSDK.auth.getAccessToken();
        if (test.error) {
            throw new Error(test.error_description);
        } else if (test.scope) {
            // find missing rights
            const currentScope = test.scope.split(' ');
            const missingAccess = Util.expectedAuthScope.filter(
                (element) => !currentScope.includes(element)
            );
            const excessAccess = currentScope.filter(
                (element) => !Util.expectedAuthScope.includes(element)
            );
            if (excessAccess.length) {
                Util.logger.debug('Extra access found:' + excessAccess.join(', '));
            }
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
    sdkInstance = newSDK;
    return sdkInstance;
};
function getCredentials() {
    return credentialStore.store;
}
function getCredential(eid) {
    return credentialStore.get(eid.toString());
}
function setCredentials(eid, options) {
    // credentialStore.set(eid.toString(), {
    //     client_id: config.client_id,
    //     client_secret: config.client_secret,
    //     auth_url: config.auth_url,
    // });
}
function removeCredentials(eid) {
    credentialStore.delete(eid.toString());
}
