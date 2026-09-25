import assert from 'node:assert/strict';
import Conf from 'conf';
import MockAdapter from 'axios-mock-adapter';
import { axiosInstance } from 'sfmc-sdk/util';
import Auth from '../lib/util/auth.js';
import File from '../lib/util/file.js';

const authUrl = 'https://mct0l7nxfq2r988t1kxfy8sc4xxx.auth.marketingcloudapis.com/';
const sessionStore = new Conf({
    projectName: 'mcdev',
    configName: 'sessions',
    clearInvalidConfig: true,
});

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
        Auth.clearSessions();
    });

    afterEach(() => {
        Object.defineProperties(File, {
            pathExists: { value: originalPathExists, writable: true },
            readJsonSync: { value: originalReadJsonSync, writable: true },
            writeJSONToFile: { value: originalWriteJSONToFile, writable: true },
        });
        apiMock.restore();
        Auth.clearSessions();
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

        await Auth.saveCredential(credentials, credential);

        const stored = /** @type {{access_token:string, scope:string[]}} */ (
            sessionStore.get(credential)
        );
        assert.equal(stored.access_token, 'fresh-token');
        assert.deepEqual(stored.scope, ['email_read', 'email_send']);
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
        Object.defineProperties(File, {
            pathExists: { value: async () => false, writable: true },
            writeJSONToFile: { value: async () => {}, writable: true },
        });

        await Auth.saveCredential(cachedSession, credential);

        assert.equal(cachedSession.access_token, 'cached-token');
        assert.deepEqual(cachedSession.scope, ['email_read', 'email_send']);
        assert.equal(apiMock.history.post.length, 0);
    });
});
