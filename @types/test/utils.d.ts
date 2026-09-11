/**
 * gets file from Retrieve folder
 *
 * @param {string} from source path (starting in bu folder)
 * @param {string} to target path (starting in bu folder)
 * @param {string} [mid] used when we need to test on ParentBU
 * @returns {Promise.<{status:'ok'|'skipped'|'failed', statusMessage:string, file:string}>} -
 */
export function copyFile(from: string, to: string, mid?: string): Promise<{
    status: "ok" | "skipped" | "failed";
    statusMessage: string;
    file: string;
}>;
/**
 * gets file from Retrieve folder
 *
 * @param {string} from source path (starting in bu folder)
 * @param {string} to target path (starting in bu folder)
 * @param {string} [mid] used when we need to test on ParentBU
 * @param {string} [buName] used when we need to test on ParentBU
 * @returns {void} -
 */
export function copyToDeploy(from: string, to: string, mid?: string, buName?: string): void;
/**
 * gets file from Retrieve folder
 *
 * @param {string} customerKey of metadata
 * @param {string} type of metadata
 * @param {string} [buName] used when we need to test on ParentBU
 * @returns {Promise.<ReturnType<JSON['parse']>>} parsed metadata file
 */
export function getActualJson(customerKey: string, type: string, buName?: string): Promise<ReturnType<JSON["parse"]>>;
/**
 * gets file from Retrieve folder
 *
 * @param {string} customerKey of metadata
 * @param {string} type of metadata
 * @param {string} [buName] used when we need to test on ParentBU
 * @returns {Promise.<string>} file path
 */
export function getActualDoc(customerKey: string, type: string, buName?: string): Promise<string>;
/**
 * gets file from Retrieve folder
 *
 * @param {string} customerKey of metadata
 * @param {string} type of metadata
 * @param {string} ext file extension
 * @param {string} [buName] used when we need to test on ParentBU
 * @returns {Promise.<string | null>} file in string form, null if not found
 */
export function getActualFile(customerKey: string, type: string, ext: string, buName?: string): Promise<string | null>;
/**
 * gets file from Deploy folder
 *
 * @param {string} customerKey of metadata
 * @param {string} type of metadata
 * @param {string} [buName] used when we need to test on ParentBU
 * @returns {Promise.<string>} file in JSON form
 */
export function getActualDeployJson(customerKey: string, type: string, buName?: string): Promise<string>;
/**
 * gets file from Deploy folder
 *
 * @param {string} customerKey of metadata
 * @param {string} type of metadata
 * @param {string} ext file extension
 * @param {string} [buName] used when we need to test on ParentBU
 * @returns {Promise.<string>} file in string form
 */
export function getActualDeployFile(customerKey: string, type: string, ext: string, buName?: string): Promise<string>;
/**
 * gets file from Template folder
 *
 * @param {string} customerKey of metadata
 * @param {string} type of metadata
 * @returns {Promise.<string>} file in JSON form
 */
export function getActualTemplateJson(customerKey: string, type: string): Promise<string>;
/**
 * gets file from Template folder
 *
 * @param {string} customerKey of metadata
 * @param {string} type of metadata
 * @param {string} ext file extension
 * @returns {Promise.<string>} file in string form
 */
export function getActualTemplateFile(customerKey: string, type: string, ext: string): Promise<string>;
/**
 * gets file from resources folder which should be used for comparison
 *
 * @param {string} mid of Business Unit
 * @param {string} type of metadata
 * @param {string} action of SOAP request
 * @returns {Promise.<string>} file in JSON form
 */
export function getExpectedJson(mid: string, type: string, action: string): Promise<string>;
/**
 * gets file from resources folder which should be used for comparison
 *
 * @param {string} mid of Business Unit
 * @param {string} type of metadata
 * @param {string} action of SOAP request
 * @param {string} ext file extension
 * @returns {Promise.<string>} file in string form
 */
export function getExpectedFile(mid: string, type: string, action: string, ext: string): Promise<string>;
/**
 * setup mocks for API and FS
 *
 * @param {boolean} [isDeploy] if true, will mock deploy folder
 * @returns {void}
 */
export function mockSetup(isDeploy?: boolean): void;
/**
 * resets mocks for API and FS
 *
 * @returns {void}
 */
export function mockReset(): void;
/**
 * registers a REST error override for the current test, forcing the mock to answer any REST
 * request whose pathname contains `urlIncludes` with the given error status/body instead of the
 * normal fixture (used to simulate the SFMC API returning e.g. HTTP 500 for an endpoint). The
 * override is cleared automatically on the next mockSetup.
 *
 * @param {string} urlIncludes substring the request pathname must contain to trigger the error
 * @param {number} status HTTP status code to return (e.g. 500)
 * @param {object} [body] response body to return; when omitted the shared error fixture for the
 * status is served (e.g. `test/resources/rest500-response.json`)
 * @param {string} [method] optional http method filter (lowercase, e.g. 'get')
 * @param {string} [code] axios error code to attach (defaults based on status, e.g. 5xx → ERR_BAD_RESPONSE)
 * @param {string} [bodyFixture] base filename of a fixture in `test/resources` to use as the
 * response body (e.g. `rest400-validationError-response.json`); overrides the `rest<status>-response.json` default
 * @returns {void}
 */
export function mockRESTError(urlIncludes: string, status: number, body?: object, method?: string, code?: string, bodyFixture?: string): void;
/**
 * helper to return amount of api callouts
 *
 * @param {boolean} [includeToken] if true, will include token calls in count
 * @returns {number} of API history
 */
export function getAPIHistoryLength(includeToken?: boolean): number;
/**
 * helper to return api history
 *
 * @returns {object} of API history
 */
export function getAPIHistory(): object;
/**
 *
 * @param {'patch'|'delete'|'post'|'get'|'put'} method http method
 * @param {string} url url without domain, end on % if you want to search with startsWith()
 * @param {boolean} returnAll useful for post requests that often have multiple callouts with the same url
 * @param {boolean} expectNone if true, will not log an error if no callout is found
 * @returns {object | null} json payload of the request
 */
export function getRestCallout(method: "patch" | "delete" | "post" | "get" | "put", url: string, returnAll?: boolean, expectNone?: boolean): object | null;
/**
 *
 * @param {'Schedule'|'Retrieve'|'Create'|'Update'|'Delete'|'Describe'|'Execute'} requestAction soap request types
 * @param {string} [objectType] optionall filter requests by object
 * @param {boolean} expectNone if true, will not log an error if no callout is found
 * @returns {object[] | null} json payload of the requests
 */
export function getSoapCallouts(requestAction: "Schedule" | "Retrieve" | "Create" | "Update" | "Delete" | "Describe" | "Execute", objectType?: string, expectNone?: boolean): object[] | null;
/**
 * helper to return most important fields for each api call
 *
 * @returns {object} of API history
 */
export function getAPIHistoryDebug(): object;
/**
 * helper to return most important fields for each api call
 *
 * @returns {void} of API history
 */
export function logAPIHistoryDebug(): void;
//# sourceMappingURL=utils.d.ts.map