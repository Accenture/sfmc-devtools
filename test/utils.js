import File from '../lib/util/file.js';
import path from 'node:path';
import MockAdapter from 'axios-mock-adapter';
import { axiosInstance } from '../node_modules/sfmc-sdk/lib/util.js';
import handler from '../lib/index.js';
import auth from '../lib/util/auth.js';
import { Util } from '../lib/util/util.js';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// for some reason doesnt realize below reference
// eslint-disable-next-line no-unused-vars
import fsmock from 'mock-fs';

let apimock;
import { handleSOAPRequest, handleRESTRequest, soapUrl, restUrl } from './resourceFactory.js';
const authResources = File.readJsonSync(path.join(__dirname, './resources/auth.json'));

/**
 * gets file from Retrieve folder
 *
 * @param {string} customerKey of metadata
 * @param {string} type of metadata
 * @param {string} [buName] used when we need to test on ParentBU
 * @returns {Promise.<string>} file in string form
 */
export function getActualJson(customerKey, type, buName = 'testBU') {
    return File.readJSON(
        `./retrieve/testInstance/${buName}/${type}/${customerKey}.${type}-meta.json`
    );
}

/**
 * gets file from Retrieve folder
 *
 * @param {string} customerKey of metadata
 * @param {string} type of metadata
 * @param {string} [buName] used when we need to test on ParentBU
 * @returns {string} file path
 */
export function getActualDoc(customerKey, type, buName = 'testBU') {
    return `./retrieve/testInstance/${buName}/${type}/${customerKey}.${type}-doc.md`;
}
/**
 * gets file from Retrieve folder
 *
 * @param {string} customerKey of metadata
 * @param {string} type of metadata
 * @param {string} ext file extension
 * @returns {string} file path
 */
export function getActualFile(customerKey, type, ext) {
    return `./retrieve/testInstance/testBU/${type}/${customerKey}.${type}-meta.${ext}`;
}
/**
 * gets file from Deploy folder
 *
 * @param {string} customerKey of metadata
 * @param {string} type of metadata
 * @param {string} [buName] used when we need to test on ParentBU
 * @returns {Promise.<string>} file in string form
 */
export function getActualDeployJson(customerKey, type, buName = 'testBU') {
    return File.readJSON(
        `./deploy/testInstance/${buName}/${type}/${customerKey}.${type}-meta.json`
    );
}
/**
 * gets file from Deploy folder
 *
 * @param {string} customerKey of metadata
 * @param {string} type of metadata
 * @param {string} ext file extension
 * @returns {string} file path
 */
export function getActualDeployFile(customerKey, type, ext) {
    return `./deploy/testInstance/testBU/${type}/${customerKey}.${type}-meta.${ext}`;
}
/**
 * gets file from Template folder
 *
 * @param {string} customerKey of metadata
 * @param {string} type of metadata
 * @returns {Promise.<string>} file in string form
 */
export function getActualTemplateJson(customerKey, type) {
    return File.readJSON(`./template/${type}/${customerKey}.${type}-meta.json`);
}
/**
 * gets file from Template folder
 *
 * @param {string} customerKey of metadata
 * @param {string} type of metadata
 * @param {string} ext file extension
 * @returns {string} file path
 */
export function getActualTemplateFile(customerKey, type, ext) {
    return `./template/${type}/${customerKey}.${type}-meta.${ext}`;
}
/**
 * gets file from resources folder which should be used for comparison
 *
 * @param {string} mid of Business Unit
 * @param {string} type of metadata
 * @param {string} action of SOAP request
 * @returns {Promise.<string>} file in string form
 */
export function getExpectedJson(mid, type, action) {
    return File.readJSON(path.join('test', 'resources', mid, type, action + '-expected.json'));
}
/**
 * gets file from resources folder which should be used for comparison
 *
 * @param {string} mid of Business Unit
 * @param {string} type of metadata
 * @param {string} action of SOAP request
 * @param {string} ext file extension
 * @returns {string} file path
 */
export function getExpectedFile(mid, type, action, ext) {
    return path.join('test', 'resources', mid, type, action + '-expected.' + ext);
}
/**
 * setup mocks for API and FS
 *
 * @param {boolean} [isDeploy] if true, will mock deploy folder
 * @returns {void}
 */
export function mockSetup(isDeploy) {
    if (!isDeploy) {
        // no need to execute this again - already done in standard setup
        handler.setOptions({ debug: true, noLogFile: true });
    }
    // @ts-expect-error somehow, MockAdapter does not expect type AxiosInstance
    apimock = new MockAdapter(axiosInstance, { onNoMatch: 'throwException' });
    // set access_token to mid to allow for autorouting of mock to correct resources
    apimock.onPost(authResources.success.url).reply((config) => {
        authResources.success.response.access_token = JSON.parse(config.data).account_id;
        return [authResources.success.status, authResources.success.response];
    });
    apimock.onPost(soapUrl).reply((config) => handleSOAPRequest(config));
    apimock
        .onAny(new RegExp(`^${escapeRegExp(restUrl)}`))
        .reply((config) => handleRESTRequest(config));
    const fsMockConf = {
        '.beautyamp.json': fsmock.load(
            path.resolve(__dirname, '../boilerplate/files/.beautyamp.json')
        ),
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
        'node_modules/beauty-amp-core2': fsmock.load(
            path.resolve(__dirname, '../node_modules/beauty-amp-core2')
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
        'node_modules/jsox': fsmock.load(path.resolve(__dirname, '../node_modules/jsox')),
        'node_modules/nearley': fsmock.load(path.resolve(__dirname, '../node_modules/nearley')),
    };
    if (isDeploy) {
        // load files we manually prepared for a direct test of `deploy` command
        fsMockConf.deploy = fsmock.load(path.resolve(__dirname, 'mockRoot/deploy'));
    }
    fsmock(fsMockConf);

    // ! reset exitCode or else tests could influence each other; do this in mockSetup to to ensure correct starting value
    process.exitCode = 0;
}

/**
 * resets mocks for API and FS
 *
 * @returns {void}
 */
export function mockReset() {
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
}
/**
 * helper to return amount of api callouts
 *
 * @param {boolean} [includeToken] if true, will include token calls in count
 * @returns {object} of API history
 */
export function getAPIHistoryLength(includeToken) {
    const historyArr = Object.values(apimock.history).flat();
    if (includeToken) {
        return historyArr.length;
    }
    return historyArr.filter((item) => item.url !== '/v2/token').length;
}
/**
 * helper to return api history
 *
 * @returns {object} of API history
 */
export function getAPIHistory() {
    return apimock.history;
}
/**
 * helper to return most important fields for each api call
 *
 * @returns {object} of API history
 */
export function getAPIHistoryDebug() {
    const historyArr = Object.values(apimock.history)
        .flat()
        .map((item) => {
            const log = { method: item.method, url: item.url };
            if (item.data) {
                log.body = item.data;
            }
            return log;
        });
    return historyArr;
}
/**
 * helper to return most important fields for each api call
 *
 * @returns {void} of API history
 */
export function logAPIHistoryDebug() {
    console.log(getAPIHistoryDebug()); // eslint-disable-line no-console
}

/**
 * escapes string for regex
 *
 * @param {string} str to escape
 * @returns {string} escaped string
 */
function escapeRegExp(str) {
    return str.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
