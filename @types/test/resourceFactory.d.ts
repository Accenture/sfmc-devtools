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
export function filterToPath(filter: {
    Property: string;
    SimpleOperator: string;
    Value: string;
    LeftOperand: object;
    LogicalOperator: "AND" | "OR";
    RightOperand: object;
}, shorten?: number): string;
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
export function addRestErrorOverride(urlIncludes: string, status: number, body?: object, method?: string, code?: string, bodyFixture?: string): void;
/**
 * clears all REST error overrides. Called from mockSetup so overrides never leak between tests.
 *
 * @returns {void}
 */
export function resetRestErrorOverrides(): void;
export const tWarn: string;
export const tError: string;
export function handleSOAPRequest(config: object): Promise<any[]>;
/**
 * helper to return soap base URL
 *
 * @returns {string} soap URL
 */
export const soapUrl: "https://mct0l7nxfq2r988t1kxfy8sc4xxx.soap.marketingcloudapis.com/Service.asmx";
export function handleRESTRequest(config: object): Promise<any[]>;
/**
 * helper to return rest base URL
 *
 * @returns {string} test URL
 */
export const restUrl: "https://mct0l7nxfq2r988t1kxfy8sc4xxx.rest.marketingcloudapis.com/";
//# sourceMappingURL=resourceFactory.d.ts.map