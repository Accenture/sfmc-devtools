import { assert } from 'chai';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import SDK from 'sfmc-sdk';
import MockAdapter from 'axios-mock-adapter';
import { axiosInstance } from '../node_modules/sfmc-sdk/lib/util.js';

const workflow = fs.readFileSync('.github/workflows/npm-publish.yml', 'utf8');
const releaseScript = workflow
    .split("node --input-type=module <<'NODE'\n")[1]
    .split('\n                  NODE')[0];

// Evaluate the workflow guard without publishing or writing to GitHub.
describe('V9 HOTFIX RELEASE', () => {
    it('Checks out the release tag in both jobs and only publishes to literal v9', () => {
        assert.equal(workflow.split('ref: ${{ github.event.release.tag_name }}').length - 1, 2);
        const commands = workflow.split('\n').filter((line) => line.includes('npm publish'));
        assert.deepEqual(
            commands.map((line) => line.trim()),
            ['- run: npm publish --tag v9']
        );
    });

    const releases = [
        ['9.0.4', 'v9.0.4', null],
        ['10.1.0', 'v10.1.0', 'only publishes v9'],
        ['8.4.0', 'v8.4.0', 'only publishes v9'],
        ['9.0.4', 'v9.0.3', 'Release tag must match'],
    ];

    it('Accepts only matching v9 releases and rejects other majors or mismatches', () => {
        for (const [version, tag, error] of releases) {
            const script = releaseScript.replace(
                "JSON.parse(fs.readFileSync('package.json', 'utf8'))",
                JSON.stringify({ version })
            );
            const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
                env: { ...process.env, RELEASE_TAG: tag },
                encoding: 'utf8',
            });
            if (error) {
                assert.notEqual(result.status, 0);
                assert.include(result.stderr, error);
            } else {
                assert.equal(result.status, 0, result.stderr);
                assert.equal(result.stdout, '');
            }
        }
    });

    // Exercise the SDK's scope fix with a cold refresh and an array-scoped cached session.
    it('Refreshes and reuses sessions containing newly introduced scopes', async () => {
        const credentials = {
            access_token: '',
            client_id: 'hotfix-test-client',
            client_secret: 'hotfix-test-secret',
            account_id: 1234567,
            auth_url: 'https://mct0l7nxfq2r988t1kxfy8sc4xxx.auth.marketingcloudapis.com/',
        };
        const scopes = ['data_extensions_read', 'future_scope_unknown_to_sdk'];
        const mock = new MockAdapter(axiosInstance);
        try {
            mock.onPost('/v2/token').reply(200, {
                access_token: 'hotfix-test-token',
                expires_in: 1080,
                scope: scopes.join(' '),
                rest_instance_url: credentials.auth_url.replace('.auth.', '.rest.'),
                soap_instance_url: credentials.auth_url.replace('.auth.', '.soap.'),
            });
            const sdk = new SDK(
                /** @type {ConstructorParameters<typeof SDK>[0]} */ (
                    /** @type {unknown} */ (credentials)
                ),
                {
                    eventHandlers: {
                        onRefresh: (session) => {
                            session.scope = session.scope.split(' ');
                        },
                    },
                }
            );
            const session = await sdk.auth.getAccessToken();
            assert.deepEqual(session.scope, scopes);
            const cached = new SDK(session);
            const reused = await cached.auth.getAccessToken();
            assert.deepEqual(reused.scope, scopes);
            assert.equal(reused.access_token, 'hotfix-test-token');
            assert.equal(mock.history.post.length, 1);
        } finally {
            mock.restore();
        }
    });
});
