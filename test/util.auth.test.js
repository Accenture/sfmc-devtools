import assert from 'node:assert/strict';
import MockAdapter from 'axios-mock-adapter';
import SDK from 'sfmc-sdk';
import { axiosInstance } from 'sfmc-sdk/util';
import { createAuth } from '../lib/util/auth.js';
import File from '../lib/util/file.js';

const authUrl = 'https://mct0l7nxfq2r988t1kxfy8sc4xxx.auth.marketingcloudapis.com/';

/**
 * Create a synchronous in-memory session store for isolated auth tests.
 *
 * @param {Record<string, unknown>} [initial] initial values
 * @returns {{store: {get: (key: string) => unknown, set: (key: string, value: unknown) => void, clear: () => void}, values: Record<string, unknown>, calls: {get: string[], set: string[], clear: number}}} fake store state
 */
function createFakeStore(initial = {}) {
    const values = { ...initial };
    const calls = { get: [], set: [], clear: 0 };
    return {
        values,
        calls,
        store: {
            /**
             * Read a fake session value.
             *
             * @param {string} key session key
             * @returns {unknown} stored value
             */
            get(key) {
                calls.get.push(key);
                return values[key];
            },
            /**
             * Write a fake session value.
             *
             * @param {string} key session key
             * @param {unknown} value stored value
             * @returns {void}
             */
            set(key, value) {
                calls.set.push(key);
                values[key] = value;
            },
            /**
             * Clear fake session values.
             *
             * @returns {void}
             */
            clear() {
                calls.clear += 1;
                for (const key of Object.keys(values)) {
                    delete values[key];
                }
            },
        },
    };
}

describe('AUTH SDK V4 BOUNDARY', () => {
    let apiMock;
    let originalPathExists;
    let originalReadJsonSync;
    let originalWriteJSONToFile;

    beforeEach(() => {
        apiMock = new MockAdapter(
            /** @type {ConstructorParameters<typeof MockAdapter>[0]} */ (
                /** @type {unknown} */ (axiosInstance)
            ),
            { onNoMatch: 'throwException' }
        );
        originalPathExists = File.pathExists;
        originalReadJsonSync = File.readJsonSync;
        originalWriteJSONToFile = File.writeJSONToFile;
    });

    afterEach(() => {
        Object.defineProperties(File, {
            pathExists: { value: originalPathExists, writable: true },
            readJsonSync: { value: originalReadJsonSync, writable: true },
            writeJSONToFile: { value: originalWriteJSONToFile, writable: true },
        });
        apiMock.restore();
    });

    it('accepts fresh credentials without an access token and persists normalized scope', async () => {
        const credential = 'sdk-v4-fresh';
        const credentials = {
            client_id: 'client-id',
            client_secret: 'client-secret',
            account_id: 123456,
            auth_url: authUrl,
            scope: ['email_read', 'email_send'],
        };
        const fake = createFakeStore();
        const auth = createAuth({ sessionStore: fake.store, SDKConstructor: SDK });
        Object.defineProperties(File, {
            pathExists: { value: async () => false, writable: true },
            writeJSONToFile: { value: async () => {}, writable: true },
        });
        apiMock.onPost('/v2/token').reply((request) => {
            assert.deepEqual(JSON.parse(request.data), {
                grant_type: 'client_credentials',
                client_id: credentials.client_id,
                client_secret: credentials.client_secret,
                account_id: credentials.account_id,
                scope: 'email_read email_send',
            });
            return [
                200,
                {
                    access_token: 'fresh-token',
                    expires_in: 1200,
                    scope: 'email_read email_send',
                },
            ];
        });

        await auth.saveCredential(credentials, credential);

        const stored = /** @type {{access_token:string, scope:string[]}} */ (
            fake.values[credential]
        );
        assert.equal(stored.access_token, 'fresh-token');
        assert.deepEqual(stored.scope, ['email_read', 'email_send']);
        assert.deepEqual(fake.calls.set, [credential]);
        assert.equal(apiMock.history.post.length, 1);
    });

    it('accepts a cached token with array scope without refreshing it', async () => {
        const credential = 'sdk-v4-cached';
        const cachedSession = {
            client_id: 'cached-client-id',
            client_secret: 'client-secret',
            account_id: 123456,
            auth_url: authUrl,
            access_token: 'cached-token',
            expiration: process.hrtime()[0] + 1200,
            scope: ['email_read', 'email_send'],
        };
        const fake = createFakeStore();
        const auth = createAuth({ sessionStore: fake.store, SDKConstructor: SDK });
        Object.defineProperties(File, {
            pathExists: { value: async () => false, writable: true },
            writeJSONToFile: { value: async () => {}, writable: true },
        });

        await auth.saveCredential(cachedSession, credential);

        assert.equal(cachedSession.access_token, 'cached-token');
        assert.deepEqual(cachedSession.scope, ['email_read', 'email_send']);
        assert.equal(apiMock.history.post.length, 0);
        assert.deepEqual(fake.calls.set, []);
    });

    it('looks up client_id|mid sessions and writes refreshes synchronously to that key', () => {
        const session = { access_token: 'cached-token', scope: ['email_read'] };
        const fake = createFakeStore({ 'client-id|123456': session });
        const constructed = [];
        /**
         *
         */
        class FakeSDK {
            /**
             * Capture SDK construction inputs.
             *
             * @param {unknown} authObject authentication object
             * @param {object} options SDK options
             */
            constructor(authObject, options) {
                constructed.push({ authObject, options });
            }
        }
        const auth = createAuth({
            sessionStore: fake.store,
            SDKConstructor: /** @type {typeof SDK} */ (/** @type {unknown} */ (FakeSDK)),
        });
        Object.defineProperty(File, 'readJsonSync', {
            value: () => ({
                credential: { client_id: 'client-id', client_secret: 'secret', auth_url: authUrl },
            }),
            writable: true,
        });

        auth.getSDK({ credential: 'credential', businessUnit: 'unit', mid: '123456' });
        const refreshed = { scope: 'email_read email_send', access_token: 'new-token' };
        constructed[0].options.eventHandlers.onRefresh(refreshed);

        assert.deepEqual(fake.calls.get, ['client-id|123456']);
        assert.deepEqual(fake.calls.set, ['client-id|123456']);
        assert.deepEqual(fake.values['client-id|123456'], {
            scope: ['email_read', 'email_send'],
            access_token: 'new-token',
        });
    });

    it('clears stored sessions without discarding initialized SDK instances', () => {
        const fake = createFakeStore();
        let constructions = 0;
        /**
         *
         */
        class FakeSDK {
            /**
             *
             */
            constructor() {
                constructions += 1;
            }
        }
        const auth = createAuth({
            sessionStore: fake.store,
            SDKConstructor: /** @type {typeof SDK} */ (/** @type {unknown} */ (FakeSDK)),
        });
        Object.defineProperty(File, 'readJsonSync', {
            value: () => ({
                credential: { client_id: 'client-id', client_secret: 'secret', auth_url: authUrl },
            }),
            writable: true,
        });
        const context = { credential: 'credential', businessUnit: 'unit', mid: '123456' };

        const first = auth.getSDK(context);
        auth.clearSessions();
        const second = auth.getSDK(context);

        assert.equal(fake.calls.clear, 1);
        assert.equal(constructions, 1);
        assert.equal(first, second);
        assert.deepEqual(fake.calls.get, ['client-id|123456']);
    });

    it('does not touch session storage until an auth method needs it', () => {
        const fake = createFakeStore();

        createAuth({ sessionStore: fake.store, SDKConstructor: SDK });

        assert.deepEqual(fake.calls, { get: [], set: [], clear: 0 });
    });
});
