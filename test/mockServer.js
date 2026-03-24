'use strict';
import http from 'node:http';
import { handleSOAPRequest, handleRESTRequest } from './resourceFactory.js';

/**
 * Fixed port for the mock HTTP server used in CLI subprocess tests.
 * Must match the hardcoded port in test/cli-preload.mjs.
 *
 * @type {number}
 */
export const MOCK_PORT = 19999;

/**
 * Starts a mock HTTP server that simulates the SFMC API for subprocess CLI testing.
 * Adapts raw HTTP requests to the format expected by resourceFactory handlers and
 * serves responses from the test/resources/ directory.
 *
 * @returns {Promise.<http.Server>} the running HTTP server instance
 */
export async function startMockServer() {
    return new Promise((resolve) => {
        const server = http.createServer(async (req, res) => {
            // Collect request body chunks
            const chunks = [];
            for await (const chunk of req) {
                chunks.push(chunk);
            }
            const body = Buffer.concat(chunks).toString();
            // Cache port for use in auth response and REST baseURL construction
            const port = /** @type {import('node:net').AddressInfo} */ (server.address()).port;

            // Handle authentication endpoint
            if (req.url === '/v2/token') {
                let accountId = '0';
                try {
                    accountId = String(JSON.parse(body).account_id || '0');
                } catch {
                    // ignore JSON parse errors, fall back to '0'
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(
                    JSON.stringify({
                        // access_token is set to account_id so resourceFactory can route by MID
                        access_token: accountId,
                        token_type: 'Bearer',
                        expires_in: 1079,
                        scope: '',
                        // Point instance URLs back to this mock server
                        soap_instance_url: `http://127.0.0.1:${port}/`,
                        rest_instance_url: `http://127.0.0.1:${port}/`,
                    })
                );
                return;
            }

            // Build config object compatible with resourceFactory handlers
            const config = {
                data: body,
                headers: {
                    // Ensure capital-A Authorization as expected by handleRESTRequest
                    Authorization: req.headers['authorization'] || '',
                    // Strip quotes from SOAPAction (SOAP 1.1 adds quotes; handleSOAPRequest expects no quotes)
                    SOAPAction: (req.headers['soapaction'] || '').replaceAll(/^"|"$/g, ''),
                },
                method: req.method.toLowerCase(),
                url: req.url,
                baseURL: `http://127.0.0.1:${port}/`,
            };

            try {
                let status, responseBody;
                if (req.url.includes('Service.asmx')) {
                    // SOAP request
                    [status, responseBody] = await handleSOAPRequest(config);
                    res.writeHead(status, { 'Content-Type': 'text/xml; charset=utf-8' });
                } else {
                    // REST request
                    [status, responseBody] = await handleRESTRequest(config);
                    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
                }
                res.end(
                    typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody)
                );
            } catch (ex) {
                console.error('Mock server error:', ex.message); // eslint-disable-line no-console
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: ex.message }));
            }
        });

        server.listen(MOCK_PORT, '127.0.0.1', () => {
            resolve(server);
        });
    });
}
