import fs from 'fs-extra';
import path from 'node:path';
import { XMLParser } from 'fast-xml-parser';
import { Util } from '../lib/util/util.js';
const parser = new XMLParser();
const attributeParser = new XMLParser({ ignoreAttributes: false });
/** @type {typeof Util.color} */
let color;

/* eslint-disable unicorn/prefer-ternary */
if (Util.isRunViaVSCodeExtension) {
    // when we execute the test in a VSCode extension host, we don't want CLI color codes.
    // @ts-expect-error hacky way to get rid of colors - ts doesn't appreciate the hack
    color = new Proxy(
        {},
        {
            /**
             * catch-all for color
             *
             * @returns {string} empty string
             */
            get() {
                return '';
            },
        }
    );
} else {
    // test is executed directly in a command prompt. Use colors.
    color = Util.color;
}
/* eslint-enable unicorn/prefer-ternary */

export const TWarn = `${color.bgYellow}${color.fgBlack}TEST-WARNING${color.reset}`;
export const TError = `${color.bgRed}${color.fgBlack}TEST-ERROR${color.reset}`;
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
        return fs.readFile(testPath + filterPath + '-response.xml', {
            encoding: 'utf8',
        });
    } else if (await fs.pathExists(testPath + '-response.xml')) {
        if (filterPath) {
            /* eslint-disable no-console */
            console.log(
                `${TWarn}: You are loading your reponse from ${
                    testPath + '-response.xml'
                } instead of the more specific ${
                    testPath + filterPath + '-response.xml'
                }. Make sure this is intended`
            );
            /* eslint-enable no-console */
        }
        return fs.readFile(testPath + '-response.xml', {
            encoding: 'utf8',
        });
    }
    /* eslint-disable no-console */
    console.log(
        `${TError}: Please create file ${
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
        return getFilterPath(filter, QueryAllAccounts, --shorten);
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
            responseXML = await loadSOAPRecords(
                config.headers.SOAPAction.toLocaleLowerCase(),
                fullObj.Envelope.Body.CreateRequest.Objects['@_xsi:type'],
                jObj.Envelope.Header.fueloauth,
                null
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
 * based on request, respond with different soap data
 *
 * @param {object} config mock api request object
 * @returns {Promise.<Array>} status code plus response in string form
 */
export const handleRESTRequest = async (config) => {
    try {
        // check if filtered
        const urlObj = new URL(
            config.baseURL + (config.url.startsWith('/') ? config.url.slice(1) : config.url)
        );
        let filterName;
        let filterBody;
        if (urlObj.searchParams.get('$filter')) {
            filterName = urlObj.searchParams.get('$filter').split(' eq ')[1];
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
              urlObj.searchParams.get('$filter').replaceAll(' eq ', '=').replaceAll(' ', '')
            : null;

        if (!testPathFilter && config.method === 'post' && config.data) {
            const simpleOperators = { equal: '=', in: 'IN' };
            const data = JSON.parse(config.data);
            const myObj = data.query?.rightOperand || data.query;
            if (myObj) {
                const op = simpleOperators[myObj.simpleOperator];
                filterBody = `${myObj.property}${op}${op === 'IN' ? myObj.value.join(',') : myObj.value}`;
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
                response.items = response.items.filter((def) => def.name == filterName);
                response.count = response.items.length;
                return [200, JSON.stringify(response)];
            } else {
                console.log('loading ' + testPathFilter + '.json'); // eslint-disable-line no-console
                return [
                    200,
                    await fs.readFile(testPathFilter + '.json', {
                        encoding: 'utf8',
                    }),
                ];
            }
        } else if (testPathFilter && (await fs.pathExists(testPathFilter + '.txt'))) {
            return [
                200,
                await fs.readFile(testPathFilter + '.txt', {
                    encoding: 'utf8',
                }),
            ];
        } else if (testPathFilterBody && (await fs.pathExists(testPathFilterBody + '.json'))) {
            console.log('loading ' + testPathFilterBody + '.json'); // eslint-disable-line no-console
            return [
                200,
                await fs.readFile(testPathFilterBody + '.json', {
                    encoding: 'utf8',
                }),
            ];
        } else if (testPathFilterBody && (await fs.pathExists(testPathFilterBody + '.txt'))) {
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
                    `${TWarn}: You are loading your reponse from ${
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
                    `${TWarn}: You are loading your reponse from ${
                        testPath + '.json'
                    } instead of the more specific ${
                        testPathFilterBody + '.json'
                    }. Make sure this is intended`
                );
                /* eslint-enable no-console */
            }

            // build filter logic to ensure templating works
            if (filterName) {
                const response = JSON.parse(
                    await fs.readFile(testPath + '.json', {
                        encoding: 'utf8',
                    })
                );
                response.items = response.items.filter((def) => def.name == filterName);
                response.count = response.items.length;
                return [200, JSON.stringify(response)];
            } else {
                console.log('loading ' + testPath + '.json'); // eslint-disable-line no-console

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
                    `${TWarn}: You are loading your reponse from ${
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
                    `${TWarn}: You are loading your reponse from ${
                        testPath + '.txt'
                    } instead of the more specific ${
                        testPathFilterBody + '.txt'
                    }. Make sure this is intended`
                );
                /* eslint-enable no-console */
            }

            return [
                200,
                await fs.readFile(testPath + '.txt', {
                    encoding: 'utf8',
                }),
            ];
        } else {
            /* eslint-disable no-console */
            console.log(
                `${TError}: Please create file ${testPath}.json/.txt${filterName ? ` or ${testPathFilter}.json/.txt` : testPathFilterBody ? ` or ${testPathFilterBody}.json/.txt` : ''}`
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
    } catch {
        return [500, {}];
    }
};

/**
 * helper to return rest base URL
 *
 * @returns {string} test URL
 */
export const restUrl = 'https://mct0l7nxfq2r988t1kxfy8sc4xxx.rest.marketingcloudapis.com/';
