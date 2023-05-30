const File = require('../lib/util/file');
const path = require('node:path');
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
 * @param {string} [buName] used when we need to test on ParentBU
 * @returns {Promise.<string>} file in string form
 */
exports.getActualJson = (customerKey, type, buName = 'testBU') =>
    File.readJSON(`./retrieve/testInstance/${buName}/${type}/${customerKey}.${type}-meta.json`);
/**
 * gets file from Retrieve folder
 *
 * @param {string} customerKey of metadata
 * @param {string} type of metadata
 * @param {string} [buName] used when we need to test on ParentBU
 * @returns {Promise.<string>} file in string form
 */
exports.getActualDoc = (customerKey, type, buName = 'testBU') =>
    `./retrieve/testInstance/${buName}/${type}/${customerKey}.${type}-doc.md`;
/**
 * gets file from Retrieve folder
 *
 * @param {string} customerKey of metadata
 * @param {string} type of metadata
 * @param {string} ext file extension
 * @returns {Promise.<string>} file in string form
 */
exports.getActualFile = (customerKey, type, ext) =>
    `./retrieve/testInstance/testBU/${type}/${customerKey}.${type}-meta.${ext}`;
/**
 * gets file from Deploy folder
 *
 * @param {string} customerKey of metadata
 * @param {string} type of metadata
 * @param {string} [buName] used when we need to test on ParentBU
 * @returns {Promise.<string>} file in string form
 */
exports.getActualDeployJson = (customerKey, type, buName = 'testBU') =>
    File.readJSON(`./deploy/testInstance/${buName}/${type}/${customerKey}.${type}-meta.json`);
/**
 * gets file from Deploy folder
 *
 * @param {string} customerKey of metadata
 * @param {string} type of metadata
 * @param {string} ext file extension
 * @returns {Promise.<string>} file in string form
 */
exports.getActualDeployFile = (customerKey, type, ext) =>
    `./deploy/testInstance/testBU/${type}/${customerKey}.${type}-meta.${ext}`;
/**
 * gets file from Template folder
 *
 * @param {string} customerKey of metadata
 * @param {string} type of metadata
 * @returns {Promise.<string>} file in string form
 */
exports.getActualTemplateJson = (customerKey, type) =>
    File.readJSON(`./template/${type}/${customerKey}.${type}-meta.json`);
/**
 * gets file from Template folder
 *
 * @param {string} customerKey of metadata
 * @param {string} type of metadata
 * @param {string} ext file extension
 * @returns {Promise.<string>} file in string form
 */
exports.getActualTemplateFile = (customerKey, type, ext) =>
    `./template/${type}/${customerKey}.${type}-meta.${ext}`;

/**
 * gets file from resources folder which should be used for comparison
 *
 * @param {number} mid of Business Unit
 * @param {string} type of metadata
 * @param {string} action of SOAP request
 * @returns {Promise.<string>} file in string form
 */
exports.getExpectedJson = (mid, type, action) =>
    File.readJSON(path.join('test', 'resources', mid, type, action + '-expected.json'));
/**
 * gets file from resources folder which should be used for comparison
 *
 * @param {number} mid of Business Unit
 * @param {string} type of metadata
 * @param {string} action of SOAP request
 * @param {string} ext file extension
 * @returns {Promise.<string>} file in string form
 */
exports.getExpectedFile = (mid, type, action, ext) =>
    path.join('test', 'resources', mid, type, action + '-expected.' + ext);
/**
 * setup mocks for API and FS
 *
 * @param {boolean} [isDeploy] if true, will mock deploy folder
 * @returns {void}
 */

exports.mockSetup = (isDeploy) => {
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
    const fsMockConf = {
        '.prettierrc': fsmock.load(path.resolve(__dirname, '../boilerplate/files/.prettierrc')),
        '.eslintrc': fsmock.load(path.resolve(__dirname, '../boilerplate/files/.eslintrc')),
        '.eslintignore': fsmock.load(path.resolve(__dirname, '../boilerplate/files/.eslintignore')),
        '.mcdevrc.json': fsmock.load(path.resolve(__dirname, 'mockRoot/.mcdevrc.json')),
        '.mcdev-auth.json': fsmock.load(path.resolve(__dirname, 'mockRoot/.mcdev-auth.json')),
        'boilerplate/config.json': fsmock.load(
            path.resolve(__dirname, '../boilerplate/config.json')
        ),
        test: fsmock.load(path.resolve(__dirname)),
        // the following node_modules are required for prettier's SQL parser to work
        'node_modules/prettier': fsmock.load(path.resolve(__dirname, '../node_modules/prettier')),
        'node_modules/prettier-plugin-sql': fsmock.load(
            path.resolve(__dirname, '../node_modules/prettier-plugin-sql')
        ),
        'node_modules/node-sql-parser': fsmock.load(
            path.resolve(__dirname, '../node_modules/node-sql-parser')
        ),
        'node_modules/big-integer': fsmock.load(
            path.resolve(__dirname, '../node_modules/big-integer')
        ),
        'node_modules/sql-formatter': fsmock.load(
            path.resolve(__dirname, '../node_modules/sql-formatter')
        ),
        'node_modules/nearley': fsmock.load(path.resolve(__dirname, '../node_modules/nearley')),
    };
    if (isDeploy) {
        // load files we manually prepared for a direct test of `deploy` command
        fsMockConf.deploy = fsmock.load(path.resolve(__dirname, 'mockRoot/deploy'));
    }
    fsmock(fsMockConf);

    // ! reset exitCode or else tests could influence each other; do this in mockSetup to to ensure correct starting value
    process.exitCode = 0;
};

/**
 * resets mocks for API and FS
 *
 * @returns {void}
 */
exports.mockReset = () => {
    // remove all options that might have been set by previous tests
    for (const key in Util.OPTIONS) {
        if (Object.prototype.hasOwnProperty.call(Util.OPTIONS, key)) {
            delete Util.OPTIONS[key];
        }
    }
    // reset sfmc login
    auth.clearSessions();
    fsmock.restore();
    apimock.restore();
};
/**
 * helper to return amount of api callouts
 *
 * @param {boolean} [includeToken] if true, will include token calls in count
 * @returns {object} of API history
 */
exports.getAPIHistoryLength = (includeToken) => {
    const historyArr = Object.values(apimock.history).flat();
    if (includeToken) {
        return historyArr.length;
    }
    return historyArr.filter((item) => item.url !== '/v2/token').length;
};
/**
 * helper to return api history
 *
 * @returns {object} of API history
 */
exports.getAPIHistory = () => apimock.history;
/**
 * helper to return most important fields for each api call
 *
 * @returns {object} of API history
 */
function getAPIHistoryDebug() {
    const historyArr = Object.values(apimock.history)
        .flat()
        .map((item) => ({ url: item.url, data: item.data }));
    return historyArr;
}
exports.getAPIHistoryDebug = getAPIHistoryDebug;
/**
 * helper to return most important fields for each api call
 *
 * @returns {void} of API history
 */
exports.logAPIHistoryDebug = () => {
    console.log(getAPIHistoryDebug()); // eslint-disable-line no-console
};

/**
 * escapes string for regex
 *
 * @param {string} str to escape
 * @returns {string} escaped string
 */
function escapeRegExp(str) {
    return str.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
