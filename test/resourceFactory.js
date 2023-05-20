import fs from 'fs-extra';
import path from 'node:path';
import { XMLParser } from 'fast-xml-parser';
import { Util } from '../lib/util/util.js';
const parser = new XMLParser();
const attributeParser = new XMLParser({ ignoreAttributes: false });
const color = Util.color;
/**
 * gets mock SOAP metadata for responding
 * @param {string} mcdevAction SOAP action
 * @param {string} type metadata Type
 * @param {string} mid of Business Unit
 * @returns {string} relevant metadata stringified
 */
async function loadSOAPRecords(mcdevAction, type, mid) {
    type = type[0].toLowerCase() + type.slice(1);
    const testPath = path.join(
        'test',
        'resources',
        mid.toString(),
        type,
        mcdevAction + '-response.xml'
    );
    if (await fs.pathExists(testPath)) {
        return fs.readFile(testPath, {
            encoding: 'utf8',
        });
    }
    /* eslint-disable no-console */
    console.log(
        `${color.bgRed}${color.fgBlack}test-error${color.reset}: Please create file ${testPath}`
    );
    /* eslint-enable no-console */

    return fs.readFile(path.join('test', 'resources', mcdevAction + '-response.xml'), {
        encoding: 'utf8',
    });
}

/**
 * based on request, respond with different soap data
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
                jObj.Envelope.Header.fueloauth
            );

            break;
        }
        case 'Create': {
            responseXML = await loadSOAPRecords(
                config.headers.SOAPAction.toLocaleLowerCase(),
                fullObj.Envelope.Body.CreateRequest.Objects['@_xsi:type'],
                jObj.Envelope.Header.fueloauth
            );

            break;
        }
        case 'Update': {
            responseXML = await loadSOAPRecords(
                config.headers.SOAPAction.toLocaleLowerCase(),
                fullObj.Envelope.Body.UpdateRequest.Objects['@_xsi:type'],
                jObj.Envelope.Header.fueloauth
            );

            break;
        }
        case 'Configure': {
            responseXML = await loadSOAPRecords(
                config.headers.SOAPAction.toLocaleLowerCase(),
                fullObj.Envelope.Body.ConfigureRequestMsg.Configurations.Configuration[0][
                    '@_xsi:type'
                ],
                jObj.Envelope.Header.fueloauth
            );

            break;
        }
        default: {
            throw new Error('This SOAP Action is not supported by test handler');
        }
    }

    return [200, responseXML];
};

/**
 * helper to return soap base URL
 * @returns {string} soap URL
 */
export const soapUrl =
    'https://mct0l7nxfq2r988t1kxfy8sc4xxx.soap.marketingcloudapis.com/Service.asmx';

/**
 * based on request, respond with different soap data
 * @param {object} config mock api request object
 * @returns {Promise.<Array>} status code plus response in string form
 */
export const handleRESTRequest = async (config) => {
    try {
        // check if filtered
        const urlObj = new URL(config.baseURL + config.url.slice(1));
        let filterName;
        if (urlObj.searchParams.get('$filter')) {
            filterName = urlObj.searchParams.get('$filter').split(' eq ')[1];
        }
        const testPath = path
            .join(
                'test',
                'resources',
                config.headers.Authorization.replace('Bearer ', ''),
                urlObj.pathname,
                config.method + '-response.json'
            )
            .replace(':', '_'); // replace : with _ for Windows

        if (await fs.pathExists(testPath)) {
            // build filter logic to ensure templating works
            if (filterName) {
                const response = JSON.parse(
                    await fs.readFile(testPath, {
                        encoding: 'utf8',
                    })
                );
                response.items = response.items.filter((def) => def.name == filterName);
                response.count = response.items.length;
                return [200, JSON.stringify(response)];
            } else {
                return [
                    200,
                    await fs.readFile(testPath, {
                        encoding: 'utf8',
                    }),
                ];
            }
        } else {
            /* eslint-disable no-console */
            console.log(
                `${color.bgRed}${color.fgBlack}test-error${color.reset}: Please create file ${testPath}`
            );
            /* eslint-enable no-console */

            return [
                404,
                fs.readFile(path.join('test', 'resources', 'rest404-response.json'), {
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
 * @returns {string} test URL
 */
export const restUrl = 'https://mct0l7nxfq2r988t1kxfy8sc4xxx.rest.marketingcloudapis.com/';
