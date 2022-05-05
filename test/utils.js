const File = require('../lib/util/file');
const path = require('path');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const auth = require('../lib/util/auth');
const Util = require('../lib/util/util');

// for some reason doesnt realize below reference
// eslint-disable-next-line no-unused-vars
const fsmock = require('mock-fs');
let apimock;
const authResources = require('./resources/auth.json');
const resourceFactory = require('./resourceFactory');

/**
 * gets file from Retrieve folder
 *
 * @param {string} customerKey of metadata
 * @param {string} type of metadata
 * @returns {Promise<string>} file in string form
 */
exports.getActualFile = (customerKey, type) =>
    File.readJSON(`./retrieve/testInstance/testBU/${type}/${customerKey}.${type}-meta.json`);
/**
 * gets file from Deploy folder
 *
 * @param {string} customerKey of metadata
 * @param {string} type of metadata
 * @returns {Promise<string>} file in string form
 */
exports.getActualDeployFile = (customerKey, type) =>
    File.readJSON(`./deploy/testInstance/testBU/${type}/${customerKey}.${type}-meta.json`);
/**
 * gets file from Template folder
 *
 * @param {string} customerKey of metadata
 * @param {string} type of metadata
 * @returns {Promise<string>} file in string form
 */
exports.getActualTemplate = (customerKey, type) =>
    File.readJSON(`./template/${type}/${customerKey}.${type}-meta.json`);

/**
 * gets file from resources folder which should be used for comparison
 *
 * @param {number} mid of Business Unit
 * @param {string} type of metadata
 * @param {string} action of SOAP request
 * @returns {Promise<string>} file in string form
 */
exports.getExpectedFile = (mid, type, action) =>
    File.readJSON(path.join('test', 'resources', mid, type, action + '-expected.json'));
/**
 * setup mocks for API and FS
 *
 * @returns {void}
 */
exports.mockSetup = () => {
    //
    Util.setLoggingLevel({ debug: true });
    apimock = new MockAdapter(axios, { onNoMatch: 'throwException' });
    // set access_token to mid to allow for autorouting of mock to correct resources
    apimock.onPost(authResources.success.url).reply((config) => {
        authResources.success.response.access_token = JSON.parse(config.data).account_id;
        return [authResources.success.status, authResources.success.response];
    });
    apimock
        .onPost(resourceFactory.soapUrl)
        .reply((config) => resourceFactory.handleSOAPRequest(config));
    apimock
        .onAny(new RegExp(`^${escapeRegExp(resourceFactory.restUrl)}`))
        .reply((config) => resourceFactory.handleRESTRequest(config));
    fsmock({
        '.mcdevrc.json': fsmock.load(path.resolve(__dirname, 'mockRoot/.mcdevrc.json')),
        '.mcdev-auth.json': fsmock.load(path.resolve(__dirname, 'mockRoot/.mcdev-auth.json')),
        '.prettierrc': fsmock.load(path.resolve(__dirname, 'mockRoot/.prettierrc')),
        deploy: fsmock.load(path.resolve(__dirname, 'mockRoot/deploy')),
        test: fsmock.load(path.resolve(__dirname)),
    });
};
/**
 * resets mocks for API and FS
 *
 * @returns {void}
 */
exports.mockReset = () => {
    auth.clearSessions();
    apimock.restore();
};
/**
 * helper to return api history
 *
 * @returns {object} of API history
 */
exports.getAPIHistory = () => apimock.history;

/**
 * escapes string for regex
 *
 * @param {string} str to escape
 * @returns {string} escaped string
 */
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
