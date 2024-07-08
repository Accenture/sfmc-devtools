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

import fsmock from 'mock-fs';

let apimock;
import { handleSOAPRequest, handleRESTRequest, soapUrl, restUrl } from './resourceFactory.js';
const authResources = File.readJsonSync(path.join(__dirname, './resources/auth.json'));

/**
 * gets file from Retrieve folder
 *
 * @param {string} from source path (starting in bu folder)
 * @param {string} to target path (starting in bu folder)
 * @param {string} [mid] used when we need to test on ParentBU
 * @returns {Promise.<string>} file in string form
 */
export async function copyFile(from, to, mid = '9999999') {
    return File.copyFile(`./test/resources/${mid}/${from}`, `./test/resources/${mid}/${to}`);
}
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
 * @returns {Promise.<string>} file path
 */
export function getActualDoc(customerKey, type, buName = 'testBU') {
    return File.readFile(
        `./retrieve/testInstance/${buName}/${type}/${customerKey}.${type}-doc.md`,
        'utf8'
    );
}
/**
 * gets file from Retrieve folder
 *
 * @param {string} customerKey of metadata
 * @param {string} type of metadata
 * @param {string} ext file extension
 * @param {string} [buName] used when we need to test on ParentBU
 * @returns {Promise.<string | null>} file in string form, null if not found
 */
export async function getActualFile(customerKey, type, ext, buName = 'testBU') {
    const path = `./retrieve/testInstance/${buName}/${type}/${customerKey}.${type}-meta.${ext}`;
    try {
        return await File.readFile(path, 'utf8');
    } catch {
        console.log(`File not found: ${path}`); // eslint-disable-line no-console
        return null;
    }
}
/**
 * gets file from Deploy folder
 *
 * @param {string} customerKey of metadata
 * @param {string} type of metadata
 * @param {string} [buName] used when we need to test on ParentBU
 * @returns {Promise.<string>} file in JSON form
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
 * @param {string} [buName] used when we need to test on ParentBU
 * @returns {Promise.<string>} file in string form
 */
export function getActualDeployFile(customerKey, type, ext, buName = 'testBU') {
    return File.readFile(
        `./deploy/testInstance/${buName}/${type}/${customerKey}.${type}-meta.${ext}`,
        'utf8'
    );
}
/**
 * gets file from Template folder
 *
 * @param {string} customerKey of metadata
 * @param {string} type of metadata
 * @returns {Promise.<string>} file in JSON form
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
 * @returns {Promise.<string>} file in string form
 */
export function getActualTemplateFile(customerKey, type, ext) {
    return File.readFile(`./template/${type}/${customerKey}.${type}-meta.${ext}`, 'utf8');
}
/**
 * gets file from resources folder which should be used for comparison
 *
 * @param {string} mid of Business Unit
 * @param {string} type of metadata
 * @param {string} action of SOAP request
 * @returns {Promise.<string>} file in JSON form
 */
export function getExpectedJson(mid, type, action) {
    return File.readJSON(`./test/resources/${mid}/${type}/${action}-expected.json`);
}
/**
 * gets file from resources folder which should be used for comparison
 *
 * @param {string} mid of Business Unit
 * @param {string} type of metadata
 * @param {string} action of SOAP request
 * @param {string} ext file extension
 * @returns {Promise.<string>} file in string form
 */
export function getExpectedFile(mid, type, action, ext) {
    return File.readFile(`./test/resources/${mid}/${type}/${action}-expected.${ext}`, 'utf8');
}
/**
 * setup mocks for API and FS
 *
 * @param {boolean} [isDeploy] if true, will mock deploy folder
 * @returns {void}
 */
export function mockSetup(isDeploy) {
    // no need to execute this again if we ran it a 2nd time for deploy - already done in standard setup
    if (!isDeploy) {
        // reset all options to default
        handler.setOptions({
            // test config
            debug: true,
            noLogFile: true,
            // reset
            api: undefined,
            keySuffix: undefined,
            changeKeyField: undefined,
            changeKeyValue: undefined,
            commitHistory: undefined,
            errorLog: undefined,
            execute: undefined,
            filter: undefined,
            fixShared: undefined,
            fromRetrieve: undefined,
            json: undefined,
            like: undefined,
            noMidSuffix: undefined,
            refresh: undefined,
            _runningTest: undefined,
            schedule: undefined,
            skipInteraction: undefined,
        });
    }
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
        'eslint.config.js': fsmock.load(
            path.resolve(__dirname, '../boilerplate/files/eslint.config.js')
        ),
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
 *
 * @param {'patch'|'delete'|'post'|'get'|'put'} method http method
 * @param {string} url url without domain, end on % if you want to search with startsWith()
 * @returns {object} json payload of the request
 */
export function getRestCallout(method, url) {
    const subset = apimock.history[method];
    const myCallout = subset.find((item) =>
        url.endsWith('%') ? item.url.startsWith(url.slice(0, -1)) : item.url === url
    );
    return JSON.parse(myCallout.data);
}
/**
 *
 * @param {'Schedule'|'Retrieve'|'Create'|'Update'|'Delete'|'Describe'|'Execute'} requestAction soap request types
 * @param {string} [objectType] optionall filter requests by object
 * @returns {object[]} json payload of the requests
 */
export function getSoapCallouts(requestAction, objectType) {
    const method = 'post';
    const url = '/Service.asmx';
    const subset = apimock.history[method];
    const myCallout = subset
        // find soap requests
        .filter((item) => item.url === url)
        // find soap requestst of the correct request type
        .filter((item) => item.headers.SOAPAction === requestAction)
        // find soap requestst of the correct request type
        .filter((item) =>
            !objectType || item.data.includes('<ObjectType')
                ? item.data.split('<ObjectType>')[1].split('</ObjectType>')[0] === objectType
                : item.data.includes('<Objects xsi:type="')
                  ? item.data.split('<Objects xsi:type="')[1].split('">')[0] === objectType
                  : false
        )
        .map((item) => item.data);
    return myCallout;
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
    return str.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`); // $& means the whole matched string
}
