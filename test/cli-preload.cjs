'use strict';
/**
 * CLI subprocess test preload script.
 * Patches Node.js https module to redirect SFMC API requests
 * to the local HTTP mock server used for CLI subprocess testing.
 *
 * Usage: NODE_OPTIONS='--require /abs/path/to/cli-preload.cjs'
 * Requires: MCDEV_MOCK_PORT env var set to the mock server's port
 */
const https = require('node:https');
const http = require('node:http');

const mockPort = Number(process.env.MCDEV_MOCK_PORT);
if (!mockPort) {
    throw new Error('cli-preload.cjs: MCDEV_MOCK_PORT env var not set');
}

const originalRequest = https.request.bind(https);

/**
 * Extracts hostname from options (string, URL, or object)
 *
 * @param {string | URL | object} options request options
 * @returns {string} hostname
 */
function getHost(options) {
    if (typeof options === 'string') {
        try {
            return new URL(options).hostname;
        } catch {
            return '';
        }
    }
    if (options instanceof URL) {
        return options.hostname;
    }
    return options?.hostname || options?.host || '';
}

/**
 * Builds HTTP-compatible options from the original HTTPS options.
 * Only includes fields that http.request accepts; overrides host/port/protocol.
 *
 * @param {object} options original https request options object
 * @returns {object} http.request-compatible options pointing to the mock server
 */
function buildHttpOptions(options) {
    return {
        hostname: '127.0.0.1',
        host: '127.0.0.1',
        port: mockPort,
        protocol: 'http:',
        path: options.path || '/',
        method: options.method || 'GET',
        headers: options.headers,
        timeout: options.timeout,
        localAddress: options.localAddress,
        auth: options.auth,
    };
}

/**
 * Patched https.request that redirects SFMC API calls to the local HTTP mock server.
 * All other HTTPS requests are forwarded to the original https.request.
 *
 * @param {string | URL | object} options request options or URL
 * @param {function} [callback] response callback
 * @returns {http.ClientRequest} the request object
 */
https.request = function patchedHttpsRequest(options, callback) {
    const host = getHost(options);
    if (host.includes('marketingcloudapis.com')) {
        let httpOptions;
        if (typeof options === 'string' || options instanceof URL) {
            const url = options instanceof URL ? options : new URL(options);
            httpOptions = {
                hostname: '127.0.0.1',
                host: '127.0.0.1',
                port: mockPort,
                path: url.pathname + url.search,
                method: 'GET',
                protocol: 'http:',
            };
        } else {
            httpOptions = buildHttpOptions(options);
        }
        return http.request(httpOptions, callback);
    }
    return originalRequest(options, callback);
};

const originalGet = https.get.bind(https);

/**
 * Patched https.get that redirects SFMC API calls to the local HTTP mock server.
 *
 * @param {string | URL | object} options request options or URL
 * @param {function} [callback] response callback
 * @returns {http.ClientRequest} the request object
 */
https.get = function patchedHttpsGet(options, callback) {
    const host = getHost(options);
    if (host.includes('marketingcloudapis.com')) {
        const req = https.request(options, callback);
        req.end();
        return req;
    }
    return originalGet(options, callback);
};
