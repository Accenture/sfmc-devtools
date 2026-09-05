import fs from 'fs-extra';
import path from 'node:path';
import { XMLParser } from 'fast-xml-parser';
import { Util } from '../lib/util/util.js';

import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRootHelper = __dirname.split(path.sep);
projectRootHelper.pop();
const projectRoot = projectRootHelper.join(path.sep) + path.sep;

const parser = new XMLParser();
const attributeParser = new XMLParser({ ignoreAttributes: false });
/** @type {typeof Util.color} */
const color = Util.color;

export const tWarn = `${color.bgYellow}${color.fgBlack}TEST-WARNING${color.reset}`;
export const tError = `${color.bgRed}${color.fgBlack}TEST-ERROR${color.reset}`;

const loadingFile = 'loading server file:///';

/**
 * gets mock SOAP metadata for responding
 *
 * @param {string} mcdevAction SOAP action
 * @param {string} type metadata Type
 * @param {string} mid of Business Unit
 * @param {object|string} filter likely for customer key
 * @param {boolean} [QueryAllAccounts] get data from other BUs or not
 * @returns {Promise.<string>} relevant metadata stringified
 */
async function loadSOAPRecords(mcdevAction, type, mid, filter, QueryAllAccounts) {
    type = type[0].toLowerCase() + type.slice(1);
    const testPath = path.join('test', 'resources', mid.toString(), type, mcdevAction);
    const filterPath = getFilterPath(filter, QueryAllAccounts);
    if (await fs.pathExists(testPath + filterPath + '-response.xml')) {
        console.log(loadingFile + projectRoot + testPath + filterPath + '-response.xml'); // eslint-disable-line no-console
        return fs.readFile(testPath + filterPath + '-response.xml', {
            encoding: 'utf8',
        });
    } else if (await fs.pathExists(testPath + '-response.xml')) {
        if (filterPath) {
            /* eslint-disable no-console */
            console.log(
                `${tWarn}: You are loading your reponse from ${
                    testPath + '-response.xml'
                } instead of the more specific ${
                    testPath + filterPath + '-response.xml'
                }. Make sure this is intended`
            );
            /* eslint-enable no-console */
        }
        console.log(loadingFile + projectRoot + testPath + '-response.xml'); // eslint-disable-line no-console
        return fs.readFile(testPath + '-response.xml', {
            encoding: 'utf8',
        });
    }
    /* eslint-disable no-console */
    console.log(
        `${tError}: Please create file ${
            filterPath ? testPath + filterPath + '-response.xml or ' : ''
        }${testPath + '-response.xml'}`
    );
    /* eslint-enable no-console */

    // return error
    process.exitCode = 404;
    return fs.readFile(path.join('test', 'resources', mcdevAction + '-response.xml'), {
        encoding: 'utf8',
    });
}

/**
 * helper for {@link loadSOAPRecords} to get the filter path
 *
 * @param {object|string} filter likely for customer key
 * @param {boolean} [QueryAllAccounts] get data from other BUs or not
 * @param {number} [shorten] number of characters to shorten filters by to match windows max file length of 256 chars
 * @returns {string} filterPath value
 */
function getFilterPath(filter, QueryAllAccounts, shorten) {
    const filterPath =
        (typeof filter === 'string' && filter ? '-' + filter : filterToPath(filter, shorten)) +
        (QueryAllAccounts ? '-QAA' : '');
    if ((filterPath + '-response.xml').length > 256) {
        shorten ||= 10;
        return getFilterPath(filter, QueryAllAccounts, shorten - 1);
    } else {
        return filterPath;
    }
}

/**
 * main filter to path function
 *
 * @param {object} filter main filter object
 * @param {string} filter.Property field name
 * @param {string} filter.SimpleOperator string representation of the comparison method
 * @param {string} filter.Value field value to check for
 * @param {object} filter.LeftOperand contains a filter object itself
 * @param {'AND'|'OR'} filter.LogicalOperator string representation of the comparison method
 * @param {object} filter.RightOperand field value to check for
 * @param {number} [shorten] number of characters to shorten filters by to match windows max file length of 256 chars
 * @returns {string} string represenation of the entire filter
 */
export function filterToPath(filter, shorten) {
    if (filter) {
        return '-' + _filterToPath(filter, shorten);
    }
    return '';
}

/**
 * helper for filterToPath
 *
 * @param {object} filter main filter object
 * @param {string} filter.Property field name
 * @param {string} filter.SimpleOperator string representation of the comparison method
 * @param {string} filter.Value field value to check for
 * @param {object} filter.LeftOperand contains a filter object itself
 * @param {'AND'|'OR'} filter.LogicalOperator string representation of the comparison method
 * @param {object} filter.RightOperand field value to check for
 * @param {number} [shorten] number of characters to shorten filters by to match windows max file length of 256 chars
 * @returns {string} string represenation of the entire filter
 */
function _filterToPath(filter, shorten) {
    if (filter.Property && filter.SimpleOperator) {
        let value;
        if (filter.Value === undefined) {
            value = '';
        } else if (Array.isArray(filter.Value)) {
            value = shorten
                ? filter.Value.map((val) => val.slice(0, Math.max(0, shorten))).join(',')
                : filter.Value.join(',');
        } else {
            value = shorten ? filter.Value.slice(0, Math.max(0, shorten)) : filter.Value;
        }
        return `${filter.Property}${filter.SimpleOperator.replace('equals', '=')}${value}`;
    } else if (filter.LeftOperand && filter.LogicalOperator && filter.RightOperand) {
        return (
            _filterToPath(filter.LeftOperand, shorten) +
            filter.LogicalOperator +
            _filterToPath(filter.RightOperand, shorten)
        );
    } else {
        throw new Error('unknown filter type');
    }
}

/**
 * based on request, respond with different soap data
 *
 * @param {object} config mock api request object
 * @returns {Promise.<Array>} status code plus response in string form
 */
export const handleSOAPRequest = async (config) => {
    const jObj = parser.parse(config.data);
    const fullObj = attributeParser.parse(config.data);
    let responseXML;

    switch (config.headers.SOAPAction) {
        case 'Retrieve': {
            responseXML = await loadSOAPRecords(
                config.headers.SOAPAction.toLocaleLowerCase(),
                jObj.Envelope.Body.RetrieveRequestMsg.RetrieveRequest.ObjectType,
                jObj.Envelope.Header.fueloauth,
                jObj.Envelope.Body.RetrieveRequestMsg.RetrieveRequest.Filter,
                jObj.Envelope.Body.RetrieveRequestMsg.RetrieveRequest.QueryAllAccounts
            );

            break;
        }
        case 'Create': {
            let filter = null;
            if (fullObj.Envelope.Body.CreateRequest.Objects['@_xsi:type'] === 'DataFolder') {
                filter = `ContentType=${fullObj.Envelope.Body.CreateRequest.Objects.ContentType},Name=${fullObj.Envelope.Body.CreateRequest.Objects.Name},ParentFolderID=${fullObj.Envelope.Body.CreateRequest.Objects.ParentFolder.ID}`;
            }
            responseXML = await loadSOAPRecords(
                config.headers.SOAPAction.toLocaleLowerCase(),
                fullObj.Envelope.Body.CreateRequest.Objects['@_xsi:type'],
                jObj.Envelope.Header.fueloauth,
                filter
            );

            break;
        }
        case 'Update': {
            responseXML = await loadSOAPRecords(
                config.headers.SOAPAction.toLocaleLowerCase(),
                fullObj.Envelope.Body.UpdateRequest.Objects['@_xsi:type'],
                jObj.Envelope.Header.fueloauth,
                null
            );

            break;
        }
        case 'Configure': {
            responseXML = await loadSOAPRecords(
                config.headers.SOAPAction.toLocaleLowerCase(),
                fullObj.Envelope.Body.ConfigureRequestMsg.Configurations.Configuration[0][
                    '@_xsi:type'
                ],
                jObj.Envelope.Header.fueloauth,
                null
            );

            break;
        }
        case 'Delete': {
            responseXML = await loadSOAPRecords(
                config.headers.SOAPAction.toLocaleLowerCase(),
                fullObj.Envelope.Body.DeleteRequest.Objects['@_xsi:type'],
                jObj.Envelope.Header.fueloauth,
                null
            );

            break;
        }
        case 'Schedule': {
            responseXML = await loadSOAPRecords(
                config.headers.SOAPAction.toLocaleLowerCase(),
                fullObj.Envelope.Body.ScheduleRequestMsg.Interactions.Interaction['@_xsi:type'],
                jObj.Envelope.Header.fueloauth,
                fullObj.Envelope.Body.ScheduleRequestMsg.Interactions.Interaction.ObjectID
            );

            break;
        }
        case 'Perform': {
            responseXML = await loadSOAPRecords(
                config.headers.SOAPAction.toLocaleLowerCase(),
                fullObj.Envelope.Body.PerformRequestMsg.Definitions.Definition['@_xsi:type'],
                jObj.Envelope.Header.fueloauth,
                fullObj.Envelope.Body.PerformRequestMsg.Definitions.Definition.ObjectID
            );

            break;
        }
        default: {
            throw new Error(
                `The SOAP Action ${config.headers.SOAPAction} is not supported by test handler`
            );
        }
    }

    return [200, responseXML];
};

/**
 * helper to return soap base URL
 *
 * @returns {string} soap URL
 */
export const soapUrl =
    'https://mct0l7nxfq2r988t1kxfy8sc4xxx.soap.marketingcloudapis.com/Service.asmx';

/**
 * canonical query-view projection key-set — the fields an asset `query` (POST assets/query)
 * response item returns. Most GET-only fields (content/views/meta/design/slots/objectID/owner/
 * version/thumbnail/contentType/enterpriseId/…) are reserved for the GET response / withheld here;
 * `data` + `legacyData` are the exception — the recorded query-view surfaced them for the email
 * subtypes, and downstream types resolve email references through the cached `legacyData.legacyId`.
 *
 * @type {string[]}
 */
const ASSET_QUERY_PROJECTION_KEYS = [
    'id',
    'customerKey',
    'assetType',
    'name',
    'description',
    'category',
    'fileProperties',
    'availableViews',
    'status',
    'createdDate',
    'createdBy',
    'modifiedDate',
    'modifiedBy',
    'modelVersion',
    // message/email subtypes (207 templatebasedemail, 208 htmlemail) surfaced their `data` +
    // `legacyData` blocks in the recorded query-view — journeys / emailSends / triggeredSends
    // resolve the referenced email by the query-cached `legacyData.legacyId`, so these must be
    // projected (copied only when present on the body; a diverging query value is supplied via
    // the pool entry's `queryOverrides`).
    'data',
    'legacyData',
];

/**
 * lazily loads the asset pool (id → { body }) fresh through the mocked fs so mock-fs serves it
 *
 * @returns {Promise.<object>} parsed pool object, or {} on missing/parse error
 */
async function loadAssetPool() {
    const poolPath = path.join(
        'test',
        'resources',
        '9999999',
        'asset',
        'v1',
        'content',
        'assets',
        'assets-pool.json'
    );
    try {
        if (!(await fs.pathExists(poolPath))) {
            return {};
        }
        const raw = await fs.readFile(poolPath, { encoding: 'utf8' });
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

/**
 * projects a full asset body down to the canonical query key-set (copying only keys that exist).
 * A pool entry may carry an optional `queryOverrides` object whose keys are shallow-merged onto
 * the projected item — this reproduces recorded fixtures where the query-view of an asset returned
 * a different value than its GET body (e.g. asset 1295064's name differs between query and GET).
 *
 * @param {object} body full asset body
 * @param {object} [queryOverrides] optional per-field query-view overrides
 * @returns {object} slim query-view item
 */
function projectAssetQueryItem(body, queryOverrides) {
    const item = {};
    for (const key of ASSET_QUERY_PROJECTION_KEYS) {
        if (Object.prototype.hasOwnProperty.call(body, key)) {
            item[key] = body[key];
        }
    }
    if (queryOverrides) {
        Object.assign(item, queryOverrides);
    }
    return item;
}

/**
 * dynamic asset READ engine — serves by-id GET, assetType.id-in query POST, and customerKey
 * by-key GET from the asset pool. Reads only; never matches create (bare POST), update (PATCH)
 * or delete (DELETE). Returns null when the request is not an engine-owned read.
 *
 * @param {object} config mock api request object
 * @param {URL} urlObj parsed request URL
 * @returns {Promise.<Array|null>} [200, stringified response] when owned, else null
 */
async function handleAssetReadEngine(config, urlObj) {
    const method = config.method;
    // query POST — assetType.id-in only (equal-op falls through to file fixtures)
    if (method === 'post' && /^\/?asset\/v1\/content\/assets\/query(\?|$)/.test(config.url)) {
        if (!config.data) {
            return null;
        }
        let data;
        try {
            data = JSON.parse(config.data);
        } catch {
            return null;
        }
        // mirror resolver: parse rightOperand || query (compound leftOperand omitted — unreachable)
        const myObj = data.query?.rightOperand || data.query;
        if (
            !myObj ||
            myObj.property !== 'assetType.id' ||
            myObj.simpleOperator !== 'in' ||
            !Array.isArray(myObj.value)
        ) {
            // not an assetType.id-in filter → fall through so file fixtures win
            return null;
        }
        const requested = myObj.value.map(Number);
        const pool = await loadAssetPool();
        // The retrieve makes two kinds of assetType.id-in queries:
        //   • the cache pass bundles ALL self-linked subtypes into one broad chunk, so a single
        //     query spans multiple subtypes (e.g. asks for both a block type 197 AND webpage 205).
        //   • the download pass queries ONE subtype at a time (e.g. webstudio = 205,206,240…249),
        //     so a webpage query never also asks for a block type.
        // Content-child assets (webpage content nested inside a landingpage/microsite/
        // interactivecontent parent — the only pool bodies without a `status`) are dependencies
        // pulled into cache for reference resolution, not standalone retrievable assets. The
        // recorded API surfaced them only in the broad cache-pass query, never in the isolated
        // per-subtype download query. Detect the cache-pass query by it spanning both a block
        // type (197) and the webpage type (205); only then include the content children.
        const isCrossSubtypeCacheQuery = requested.includes(197) && requested.includes(205);
        const items = [];
        for (const key of Object.keys(pool)) {
            const entry = pool[key];
            const body = entry?.body;
            if (!body) {
                continue;
            }
            // content children (no `status`) only belong in the broad cache-pass query
            if (!body.status && !isCrossSubtypeCacheQuery) {
                continue;
            }
            // some pool entries are query-only "phantom" assets that the recorded API surfaced
            // only in specific queries (e.g. the two duplicate `testExisting_htmlblock_matchName`
            // assets that only appear when the message subtype — type 5 — is in the request). An
            // optional `queryOnlyWhenTypes` gate reproduces that: include the entry only when the
            // request asks for at least one of the listed types.
            if (
                Array.isArray(entry.queryOnlyWhenTypes) &&
                !entry.queryOnlyWhenTypes.some((t) => requested.includes(Number(t)))
            ) {
                continue;
            }
            // some pool entries exist ONLY to be resolved by-id / by-key (e.g. an asset referenced
            // by a mobilePush message). They must never surface in an assetType.id-in query, or
            // they would inflate the asset/journey/automation retrieve counts. An optional
            // `queryExclude` gate keeps them out of every query response while leaving the by-id
            // and by-key GET branches (below) free to serve them.
            if (entry.queryExclude) {
                continue;
            }
            // match by the body's OWN assetType.id; M3 fallback: match by the id-key
            const ownTypeId = body.assetType?.id;
            const matches =
                ownTypeId == null
                    ? requested.includes(Number(key))
                    : requested.includes(Number(ownTypeId));
            if (matches) {
                items.push(projectAssetQueryItem(body, entry.queryOverrides));
            }
        }
        const response = { count: items.length, page: 1, pageSize: 50, links: {}, items };
        console.log(`${loadingFile}asset-pool (dynamic: assetType.id in [${requested.join(',')}])`); // eslint-disable-line no-console
        return [200, JSON.stringify(response)];
    }
    // GET by-id — anchored so it never hijacks /assets/<id>/file or /thumbnail
    if (method === 'get') {
        const byIdMatch = urlObj.pathname.match(/\/asset\/v1\/content\/assets\/(\d+)\/?$/);
        if (byIdMatch) {
            const id = byIdMatch[1];
            const pool = await loadAssetPool();
            const body = pool[id]?.body;
            if (!body) {
                return null; // leave existing 404 behavior
            }
            console.log(`${loadingFile}asset-pool (dynamic: GET asset ${id})`); // eslint-disable-line no-console
            return [200, JSON.stringify(body)];
        }
        // by-key GET — $filter=customerKey eq <key>; mirror resolver name-filter + count-recompute
        if (/\/asset\/v1\/content\/assets\/?$/.test(urlObj.pathname)) {
            const rawFilter = urlObj.searchParams.get('$filter');
            if (rawFilter) {
                const [property, , value] = rawFilter.split(' ');
                if (property === 'customerKey' && value) {
                    const pool = await loadAssetPool();
                    const items = [];
                    for (const poolKey of Object.keys(pool)) {
                        const body = pool[poolKey]?.body;
                        if (body && body.customerKey === value) {
                            items.push(body);
                        }
                    }
                    const response = {
                        count: items.length,
                        page: 1,
                        pageSize: 50,
                        links: {},
                        items,
                    };
                    // eslint-disable-next-line no-console
                    console.log(
                        `${loadingFile}asset-pool (dynamic: GET assets customerKey=${value})`
                    );
                    return [200, JSON.stringify(response)];
                }
            }
        }
    }
    // create (bare POST /assets/), update (PATCH), delete (DELETE) are never engine-owned
    return null;
}

/**
 * per-test REST error injections. Each entry forces the mock to answer any REST request whose
 * pathname contains `urlIncludes` with an error status/body instead of the normal fixture, so
 * tests can simulate the SFMC API returning e.g. HTTP 500 for a specific endpoint. Reset between
 * tests via {@link resetRestErrorOverrides} (called from mockSetup).
 *
 * @type {{urlIncludes: string, method?: string, status: number, body: object, bodyFixture?: string, code: string}[]}
 */
let restErrorOverrides = [];

/**
 * registers a REST error override for the current test (see {@link restErrorOverrides})
 *
 * @param {string} urlIncludes substring the request pathname must contain to trigger the error
 * @param {number} status HTTP status code to return (e.g. 500)
 * @param {object} [body] response body to return; when omitted the shared error fixture for the
 * status is served (e.g. `test/resources/rest500-response.json`), unless `bodyFixture` is given
 * @param {string} [method] optional http method filter (lowercase, e.g. 'get')
 * @param {string} [code] axios error code to attach (e.g. 'ERR_BAD_RESPONSE' for 5xx); defaults
 * to the code the real axios client assigns for the status (5xx → ERR_BAD_RESPONSE, else ERR_BAD_REQUEST)
 * @param {string} [bodyFixture] base filename of a fixture in `test/resources` to use as the
 * response body (e.g. `rest400-validationError-response.json`); overrides the `rest<status>-response.json` default
 * @returns {void}
 */
export function addRestErrorOverride(urlIncludes, status, body, method, code, bodyFixture) {
    restErrorOverrides.push({
        urlIncludes,
        method: method ? method.toLowerCase() : undefined,
        status,
        body,
        bodyFixture,
        code: code || (status >= 500 ? 'ERR_BAD_RESPONSE' : 'ERR_BAD_REQUEST'),
    });
}

/**
 * clears all REST error overrides. Called from mockSetup so overrides never leak between tests.
 *
 * @returns {void}
 */
export function resetRestErrorOverrides() {
    restErrorOverrides = [];
}

/**
 * builds an axios-shaped rejection for an error override. Unlike returning a `[status, body]`
 * tuple (which axios-mock-adapter rejects WITHOUT an error `code`), throwing this reproduces what
 * the real axios client does for an error response — it carries `error.code` (e.g.
 * `ERR_BAD_RESPONSE` for a 5xx) and a `response`, which is what sfmc-sdk's RestError reads.
 *
 * @param {object} config mock api request object
 * @param {{status: number, body: object, bodyFixture?: string, code: string}} override matched override
 * @returns {Promise.<never>} always rejects
 */
async function rejectWithAxiosError(config, override) {
    const bodyString =
        override.body === undefined
            ? await fs.readFile(
                  path.join(
                      'test',
                      'resources',
                      override.bodyFixture || `rest${override.status}-response.json`
                  ),
                  { encoding: 'utf8' }
              )
            : JSON.stringify(override.body);
    const response = {
        status: override.status,
        statusText: 'Internal Server Error',
        headers: {},
        config,
        data: JSON.parse(bodyString),
    };
    const error = new Error(`Request failed with status code ${override.status}`);
    // @ts-expect-error mimic axios error shape consumed by sfmc-sdk RestError
    error.isAxiosError = true;
    // @ts-expect-error see above
    error.code = override.code;
    // @ts-expect-error see above
    error.config = config;
    // @ts-expect-error see above
    error.response = response;
    throw error;
}

/**
 * based on request, respond with different soap data
 *
 * @param {object} config mock api request object
 * @returns {Promise.<Array>} status code plus response in string form
 */
export const handleRESTRequest = async (config) => {
    // per-test error injection: if an override matches, reject with an axios-shaped error (carrying
    // error.code, e.g. ERR_BAD_RESPONSE) instead of the normal fixture, so tests can simulate the
    // SFMC API returning e.g. HTTP 500 for a specific endpoint. Kept OUTSIDE the try/catch below so
    // the rejection is not swallowed and re-wrapped as a bare [500, {}].
    {
        const urlObj = new URL(
            config.baseURL + (config.url.startsWith('/') ? config.url.slice(1) : config.url)
        );
        const errorOverride = restErrorOverrides.find(
            (override) =>
                urlObj.pathname.includes(override.urlIncludes) &&
                (!override.method || override.method === config.method)
        );
        if (errorOverride) {
            console.log(`${tWarn}: forcing ${errorOverride.status} for ${urlObj.pathname}`); // eslint-disable-line no-console
            return rejectWithAxiosError(config, errorOverride);
        }
    }
    try {
        // check if filtered
        const urlObj = new URL(
            config.baseURL + (config.url.startsWith('/') ? config.url.slice(1) : config.url)
        );
        let filterName;
        let filterBody;
        if (urlObj.searchParams.get('$filter')) {
            filterName = urlObj.searchParams.get('$filter').split(' eq ')[1];
        } else if (urlObj.searchParams.get('action')) {
            filterName = urlObj.searchParams.get('action');
        } else if (urlObj.searchParams.get('mostRecentVersionOnly')) {
            filterName = 'mostRecentVersionOnly';
        } else if (urlObj.searchParams.get('versionNumber')) {
            filterName = 'versionNumber';
        } else if (urlObj.searchParams.get('status')) {
            filterName = 'status';
        } else if (urlObj.searchParams.get('id')) {
            filterName = 'id';
        }

        const testPath = path
            .join(
                'test',
                'resources',
                config.headers.Authorization.replace('Bearer ', ''),
                urlObj.pathname,
                config.method + '-response'
            )
            .replace(':', '_'); // replace : with _ for Windows
        const testPathFilter = filterName
            ? testPath +
              '-' +
              (urlObj.searchParams.get('$filter') || urlObj.searchParams.get('action') || '')
                  .replaceAll(' eq ', '=')
                  .replaceAll(' ', '') +
              (urlObj.searchParams.get('id') ? 'id=' + urlObj.searchParams.get('id') : '') +
              (urlObj.searchParams.get('versionNumber')
                  ? 'versionNumber=' + urlObj.searchParams.get('versionNumber')
                  : '') +
              (urlObj.searchParams.get('mostRecentVersionOnly')
                  ? 'mostRecentVersionOnly=' + urlObj.searchParams.get('mostRecentVersionOnly')
                  : '') +
              (urlObj.searchParams.get('status')
                  ? 'status=' + urlObj.searchParams.get('status')
                  : '')
            : null;

        if (!testPathFilter && config.method === 'post' && config.data) {
            const simpleOperators = { equal: '=', in: 'IN' };
            const data = JSON.parse(config.data);
            const myObj = data.query?.rightOperand || data.query;
            if (myObj) {
                const op = simpleOperators[myObj.simpleOperator];
                filterBody = `${myObj.property}${op}${op === 'IN' ? myObj.value.join(',') : myObj.value}`;
            } else if (config.url === '/email/v1/category') {
                const data = JSON.parse(config.data);

                filterBody = Object.keys(data)
                    .map((key) => `${key}=${data[key]}`)
                    .join(',');
            } else if (config.url === '/asset/v1/content/assets/') {
                const data = JSON.parse(config.data);

                if (data.customerKey) {
                    filterBody = 'key=' + data.customerKey;
                }
            }
        }
        const testPathFilterBody = filterBody ? testPath + '-' + filterBody : null;
        if (testPathFilter && (await fs.pathExists(testPathFilter + '.json'))) {
            // build filter logic to ensure templating works
            if (filterName) {
                const response = JSON.parse(
                    await fs.readFile(testPathFilter + '.json', {
                        encoding: 'utf8',
                    })
                );
                if (
                    response.items &&
                    filterName !== 'mostRecentVersionOnly' &&
                    filterName !== 'versionNumber' &&
                    filterName !== 'id' &&
                    filterName !== 'status'
                ) {
                    response.items = response.items.filter((def) => def.name == filterName);
                }
                console.log(loadingFile + projectRoot + testPathFilter + '.json'); // eslint-disable-line no-console
                return [200, JSON.stringify(response)];
            } else {
                console.log(loadingFile + projectRoot + testPathFilter + '.json'); // eslint-disable-line no-console
                return [
                    200,
                    await fs.readFile(testPathFilter + '.json', {
                        encoding: 'utf8',
                    }),
                ];
            }
        } else if (testPathFilter && (await fs.pathExists(testPathFilter + '.txt'))) {
            console.log(loadingFile + projectRoot + testPathFilter + '.txt'); // eslint-disable-line no-console
            return [
                200,
                await fs.readFile(testPathFilter + '.txt', {
                    encoding: 'utf8',
                }),
            ];
        } else if (testPathFilterBody && (await fs.pathExists(testPathFilterBody + '.json'))) {
            console.log(loadingFile + projectRoot + testPathFilterBody + '.json'); // eslint-disable-line no-console
            return [
                200,
                await fs.readFile(testPathFilterBody + '.json', {
                    encoding: 'utf8',
                }),
            ];
        } else if (testPathFilterBody && (await fs.pathExists(testPathFilterBody + '.txt'))) {
            console.log(loadingFile + projectRoot + testPathFilterBody + '.txt'); // eslint-disable-line no-console
            return [
                200,
                await fs.readFile(testPathFilterBody + '.txt', {
                    encoding: 'utf8',
                }),
            ];
        } else if (await fs.pathExists(testPath + '.json')) {
            if (testPathFilter) {
                /* eslint-disable no-console */
                console.log(
                    `${tWarn}: You are loading your reponse from ${
                        testPath + '.json'
                    } instead of the more specific ${
                        testPathFilter + '.json'
                    }. Make sure this is intended`
                );
                /* eslint-enable no-console */
            }

            if (testPathFilterBody) {
                /* eslint-disable no-console */
                console.log(
                    `${tWarn}: You are loading your reponse from ${
                        testPath + '.json'
                    } instead of the more specific ${
                        testPathFilterBody + '.json'
                    }. Make sure this is intended`
                );
                /* eslint-enable no-console */
            }

            // build filter logic to ensure templating works
            if (
                filterName &&
                filterName !== 'mostRecentVersionOnly' &&
                filterName !== 'versionNumber' &&
                filterName !== 'id' &&
                filterName !== 'status'
            ) {
                const response = JSON.parse(
                    await fs.readFile(testPath + '.json', {
                        encoding: 'utf8',
                    })
                );
                response.items = response.items.filter((def) => def.name == filterName);
                response.count = response.items.length;
                console.log(loadingFile + projectRoot + testPath + '.json'); // eslint-disable-line no-console
                return [200, JSON.stringify(response)];
            } else {
                console.log(loadingFile + projectRoot + testPath + '.json'); // eslint-disable-line no-console

                return [
                    200,
                    await fs.readFile(testPath + '.json', {
                        encoding: 'utf8',
                    }),
                ];
            }
        } else if (await fs.pathExists(testPath + '.txt')) {
            if (testPathFilter) {
                /* eslint-disable no-console */
                console.log(
                    `${tWarn}: You are loading your reponse from ${
                        testPath + '.txt'
                    } instead of the more specific ${
                        testPathFilter + '.txt'
                    }. Make sure this is intended`
                );
                /* eslint-enable no-console */
            }
            if (testPathFilterBody) {
                /* eslint-disable no-console */
                console.log(
                    `${tWarn}: You are loading your reponse from ${
                        testPath + '.txt'
                    } instead of the more specific ${
                        testPathFilterBody + '.txt'
                    }. Make sure this is intended`
                );
                /* eslint-enable no-console */
            }
            console.log(loadingFile + projectRoot + testPath + '.txt'); // eslint-disable-line no-console
            return [
                200,
                await fs.readFile(testPath + '.txt', {
                    encoding: 'utf8',
                }),
            ];
        } else {
            // ── dynamic asset READ engine (reads only — never create/update/delete) ──
            // Serves asset by-id GET, assetType.id-in query POST, and customerKey by-key GET
            // from a single pool of full bodies. Lives in the 404 else, so any matching file
            // fixture still wins. See asset_fixture_database plan.
            const assetEngineResponse = await handleAssetReadEngine(config, urlObj);
            if (assetEngineResponse) {
                return assetEngineResponse;
            }

            /* eslint-disable no-console */
            console.log(
                `${tError}: Please create file ${testPath}.json/.txt${filterName ? ` or ${testPathFilter}.json/.txt` : testPathFilterBody ? ` or ${testPathFilterBody}.json/.txt` : ''}`
            );
            /* eslint-enable no-console */
            process.exitCode = 404;

            return [
                404,
                await fs.readFile(path.join('test', 'resources', 'rest404-response.json'), {
                    encoding: 'utf8',
                }),
            ];
        }
    } catch (ex) {
        console.log(ex); // eslint-disable-line no-console
        return [500, {}];
    }
};

/**
 * helper to return rest base URL
 *
 * @returns {string} test URL
 */
export const restUrl = 'https://mct0l7nxfq2r988t1kxfy8sc4xxx.rest.marketingcloudapis.com/';
