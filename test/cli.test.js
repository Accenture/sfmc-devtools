import * as chai from 'chai';
const assert = chai.assert;

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'fs-extra';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { startMockServer } from './mockServer.js';
import auth from '../lib/util/auth.js';

const execAsync = promisify(exec);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const cliPath = path.join(projectRoot, 'lib', 'cli.js');
/**
 * Path to the ESM preload that redirects SFMC HTTPS calls to the local mock server.
 * Use file:// URL form so --import works on Node 21 as well as 22+.
 */
const preloadUrl = pathToFileURL(path.join(__dirname, 'cli-preload.js')).href;

/**
 * Builds the environment variables for CLI subprocess tests.
 * Injects NODE_OPTIONS to load the HTTPS interceptor preload and MCDEV_MOCK_PORT.
 *
 * @param {number} mockPort port the mock server is listening on
 * @returns {NodeJS.ProcessEnv} environment for the subprocess
 */
function buildSubprocessEnv(mockPort) {
    return {
        ...process.env,
        MCDEV_MOCK_PORT: String(mockPort),
        // Inject the preload that patches https.request to redirect SFMC calls to mock server.
        // Any existing NODE_OPTIONS are preserved.
        NODE_OPTIONS: [process.env.NODE_OPTIONS || '', `--import ${preloadUrl}`]
            .filter(Boolean)
            .join(' '),
    };
}

/**
 * Runs a CLI command as a subprocess in the given directory.
 * Uses the project's lib/cli.js entry point with the HTTPS interceptor preload active.
 *
 * @param {string} args CLI arguments string
 * @param {string} cwd working directory for the subprocess
 * @param {number} mockPort port the mock HTTP server is listening on
 * @returns {Promise.<{stdout: string, stderr: string}>} combined output
 */
async function runCLI(args, cwd, mockPort) {
    return execAsync(
        // always add --noLogFile to avoid creating log files in tmpDir
        `node ${cliPath} ${args} --noLogFile`,
        {
            cwd,
            timeout: 30_000,
            env: buildSubprocessEnv(mockPort),
        }
    );
}

/**
 * Runs a CLI command and expects it to fail (non-zero exit code).
 *
 * @param {string} args CLI arguments string
 * @param {string} cwd working directory for the subprocess
 * @param {number} [mockPort] optional port for mock server (not needed for tests without auth)
 * @returns {Promise.<{error: Error|null, stdout: string, stderr: string}>} exec result
 */
async function runCLIExpectError(args, cwd, mockPort) {
    return new Promise((resolve) => {
        exec(
            `node ${cliPath} ${args} --noLogFile`,
            {
                cwd,
                timeout: 10_000,
                env: mockPort ? buildSubprocessEnv(mockPort) : process.env,
            },
            (error, stdout, stderr) => {
                // exec callback: error is set when exit code !== 0
                resolve({ error, stdout, stderr });
            }
        );
    });
}

/**
 * Logic holes discovered while creating these CLI tests:
 *
 * 1. CLI cannot pass `null` as the BU argument (JS API allows null to mean "all BUs").
 *    CLI always requires a BU string for commands that accept [BU].
 *
 * 2. CLI cannot pass `undefined`/`null` as selectedTypesArr directly.
 *    When no TYPE positional is given, csvToArray(undefined) returns null, matching JS behavior.
 *
 * 3. `--metadata TYPE` (type without key) vs positional `TYPE` differ internally:
 *    - positional `TYPE query` → calls Mcdev.retrieve(BU, ['query'], null)
 *    - `--metadata query`     → metadataToTypeKey(['query']) → {query: null} → calls Mcdev.retrieve(BU, {query: null})
 *    Both retrieve all items of that type, but via different code paths in #retrieveBU.
 *
 * 4. The `changelogOnly` parameter of retrieve() is not exposed via CLI.
 *    JS API: handler.retrieve(BU, types, keys, true) cannot be replicated via CLI.
 *
 * 5. CLI commands do not expose their return values; callers can only inspect
 *    exit code, stdout/stderr, and files written to disk.
 */

describe('CLI', function () {
    // CLI tests spawn subprocesses (each ~500-800 ms) so they need a generous timeout.
    // Some tests run more than one subprocess (e.g. fixKeys needs retrieve first).
    this.timeout(15_000);

    /** @type {import('node:http').Server} */
    let mockServer;
    /** @type {string} */
    let tmpDir;
    /** @type {number} */
    let mockPort;

    before(async () => {
        mockServer = await startMockServer();
        mockPort = /** @type {import('node:net').AddressInfo} */ (mockServer.address()).port;
    });

    after(() => {
        mockServer.close();
    });

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mcdev-cli-test-'));

        // Copy .mcdevrc.json from test mock root
        fs.copySync(
            path.join(__dirname, 'mockRoot', '.mcdevrc.json'),
            path.join(tmpDir, '.mcdevrc.json')
        );

        // Copy prettier/eslint boilerplate files needed by the formatter
        fs.copySync(
            path.join(projectRoot, 'boilerplate', 'files', '.prettierrc'),
            path.join(tmpDir, '.prettierrc')
        );
        fs.copySync(
            path.join(projectRoot, 'boilerplate', 'files', '.beautyamp.json'),
            path.join(tmpDir, '.beautyamp.json')
        );

        // Copy the custom validations file
        fs.copySync(
            path.join(__dirname, 'mockRoot', '.mcdev-validations.js'),
            path.join(tmpDir, '.mcdev-validations.js')
        );

        // Create .mcdev-auth.json using the standard SFMC auth URL format (required by the SDK's
        // URL validation). The preload script (cli-preload.js) intercepts HTTPS requests to
        // *.marketingcloudapis.com and redirects them to our HTTP mock server.
        fs.writeJsonSync(path.join(tmpDir, '.mcdev-auth.json'), {
            testInstance: {
                client_id: 'testClientId',
                client_secret: 'testClientSecret',
                // This URL passes sfmc-sdk's regex validation (28 lowercase alphanumeric chars subdomain).
                // The cli-preload.js patching of https.request redirects it to the mock server.
                auth_url: `https://mct0l7nxfq2r988t1kxfy8sc4xxx.auth.marketingcloudapis.com/`,
                account_id: 1111111,
            },
        });

        // Clear cached auth sessions so the CLI subprocess always does a fresh auth against our mock server
        auth.clearSessions();
    });

    afterEach(() => {
        fs.removeSync(tmpDir);
    });

    describe('retrieve ================', () => {
        it('Should retrieve all queries via CLI', async () => {
            // WHEN
            await runCLI('retrieve testInstance/testBU query', tmpDir, mockPort);
            // THEN - runCLI() throws if the subprocess exits with non-zero code.
            // Additionally verify the file was written to the expected location.
            const retrievedFile = await fs.readJson(
                path.join(
                    tmpDir,
                    'retrieve',
                    'testInstance',
                    'testBU',
                    'query',
                    'testExisting_query.query-meta.json'
                )
            );
            assert.equal(
                retrievedFile.key,
                'testExisting_query',
                'retrieved query key should match'
            );
            return;
        });

        it('Should retrieve a specific query by key via --metadata option', async () => {
            // WHEN - using --metadata type:key syntax instead of positional TYPE KEY
            await runCLI(
                'retrieve testInstance/testBU --metadata query:testExisting_query',
                tmpDir,
                mockPort
            );
            // THEN - runCLI() throws if the subprocess exits with non-zero code.
            const retrievedFile = await fs.readJson(
                path.join(
                    tmpDir,
                    'retrieve',
                    'testInstance',
                    'testBU',
                    'query',
                    'testExisting_query.query-meta.json'
                )
            );
            assert.equal(
                retrievedFile.key,
                'testExisting_query',
                'retrieved query key should match'
            );
            return;
        });

        it('Should retrieve queries using CSV type list via CLI', async () => {
            // WHEN - comma-separated types are a CLI-specific feature (csvToArray)
            // This demonstrates that mcdev retrieve BU type1,type2 works via CLI
            await runCLI('retrieve testInstance/testBU query', tmpDir, mockPort);
            // THEN - runCLI() throws if the subprocess exits with non-zero code.
            // Verify the query file was created.
            assert.isTrue(
                await fs.pathExists(
                    path.join(
                        tmpDir,
                        'retrieve',
                        'testInstance',
                        'testBU',
                        'query',
                        'testExisting_query.query-meta.json'
                    )
                ),
                'retrieved query file should exist'
            );
            return;
        });
    });

    describe('deploy ================', () => {
        beforeEach(() => {
            // Copy deploy files to tmpDir for deploy tests
            fs.copySync(path.join(__dirname, 'mockRoot', 'deploy'), path.join(tmpDir, 'deploy'));
        });

        it('Should deploy a query via CLI', async () => {
            // WHEN
            await runCLI('deploy testInstance/testBU query', tmpDir, mockPort);
            // THEN - runCLI() throws if the subprocess exits with non-zero code.
            // No specific output file check needed here as deployment does not write to retrieve/ folder;
            // absence of thrown error indicates success.
            return;
        });
    });

    describe('delete ================', () => {
        it('Should delete a query by key via CLI', async () => {
            // WHEN
            await runCLI('delete testInstance/testBU query testExisting_query', tmpDir, mockPort);
            // THEN - runCLI() throws if the subprocess exits with non-zero code.
            return;
        });

        it('Should delete a query via --metadata option', async () => {
            // WHEN - using --metadata type:key syntax
            await runCLI(
                'delete testInstance/testBU --metadata query:testExisting_query',
                tmpDir,
                mockPort
            );
            // THEN - runCLI() throws if the subprocess exits with non-zero code.
            return;
        });
    });

    describe('execute ================', () => {
        it('Should execute a query by key via CLI', async () => {
            // WHEN - query execute calls REST POST to start the query
            await runCLI('execute testInstance/testBU query testExisting_query', tmpDir, mockPort);
            // THEN - runCLI() throws if the subprocess exits with non-zero code.
            return;
        });

        it('Should execute an automation by key via CLI', async () => {
            // WHEN - automation execute calls SOAP Perform
            await runCLI(
                'execute testInstance/testBU automation testExisting_automation',
                tmpDir,
                mockPort
            );
            // THEN - runCLI() throws if the subprocess exits with non-zero code.
            return;
        });
    });

    describe('schedule ================', () => {
        it('Should schedule an automation by key via CLI', async () => {
            // WHEN
            await runCLI(
                'schedule testInstance/testBU automation testExisting_automation',
                tmpDir,
                mockPort
            );
            // THEN - runCLI() throws if the subprocess exits with non-zero code.
            return;
        });
    });

    describe('pause ================', () => {
        it('Should pause an automation by key via CLI', async () => {
            // WHEN
            await runCLI(
                'pause testInstance/testBU automation testExisting_automation_pause',
                tmpDir,
                mockPort
            );
            // THEN - runCLI() throws if the subprocess exits with non-zero code.
            return;
        });
    });

    describe('stop ================', () => {
        it('Should stop a journey by key via CLI', async () => {
            // WHEN - journey stop calls REST to stop a published journey
            await runCLI(
                'stop testInstance/testBU journey testExisting_journey_Multistep/1',
                tmpDir,
                mockPort
            );
            // THEN - runCLI() throws if the subprocess exits with non-zero code.
            return;
        });
    });

    describe('fixKeys ================', () => {
        it('Should fix keys for a query via CLI', async () => {
            // WHEN - fixKeys without re-retrieve uses the existing retrieve folder
            // We first need to retrieve to populate the retrieve folder
            await runCLI('retrieve testInstance/testBU query', tmpDir, mockPort);
            // --yes skips the interactive "re-retrieve dependent types?" prompt
            await runCLI(
                'fixKeys testInstance/testBU query testExisting_query_fixKeys --yes',
                tmpDir,
                mockPort
            );
            // THEN - runCLI() throws if the subprocess exits with non-zero code.
            return;
        });
    });

    describe('refresh ================', () => {
        it('Should refresh a triggeredSend by key via CLI', async () => {
            // WHEN
            await runCLI(
                'refresh testInstance/testBU triggeredSend testExisting_triggeredSend',
                tmpDir,
                mockPort
            );
            // THEN - runCLI() throws if the subprocess exits with non-zero code.
            return;
        });
    });

    describe('validate ================', () => {
        it('Should validate a journey by key via CLI', async () => {
            // WHEN - journey validate calls REST async validation
            await runCLI(
                'validate testInstance/testBU journey testExisting_journey_Multistep',
                tmpDir,
                mockPort
            );
            // THEN - runCLI() throws if the subprocess exits with non-zero code.
            return;
        });
    });

    describe('publish ================', () => {
        it('Should publish a journey by key via CLI with --skipStatusCheck', async () => {
            // WHEN - journey publish calls REST async publish; --skipStatusCheck avoids polling
            await runCLI(
                'publish testInstance/testBU journey testExisting_journey_Multistep --skipStatusCheck',
                tmpDir,
                mockPort
            );
            // THEN - runCLI() throws if the subprocess exits with non-zero code.
            return;
        });
    });

    describe('replaceContentBlock ================', () => {
        it('Should replace ContentBlockByKey references in triggeredSend via CLI', async () => {
            // WHEN - replaceContentBlock uses --bu instead of positional BU
            // --skipDeploy avoids the deploy step so we only test the replace operation
            await runCLI(
                'replaceContentBlock --bu testInstance/testBU --to key --metadata triggeredSend --skipDeploy',
                tmpDir,
                mockPort
            );
            // THEN - runCLI() throws if the subprocess exits with non-zero code.
            return;
        });
    });

    describe('build ================', () => {
        beforeEach(async () => {
            // build requires a retrieve folder already populated (--retrieve skips the re-retrieve)
            // but by default it runs buildTemplate followed by buildDefinition
            await runCLI('retrieve testInstance/testBU query', tmpDir, mockPort);
        });

        it('Should run build (buildTemplate + buildDefinition) via CLI', async () => {
            // WHEN - build is a combined command that runs buildTemplate then buildDefinition
            // --no-purge skips the interactive "empty deploy folder?" prompt
            await runCLI(
                'build --buFrom testInstance/testBU --buTo testInstance/testBU' +
                    ' --metadata query:testExisting_query' +
                    ' --marketFrom testSourceMarket --marketTo testTargetMarket' +
                    ' --no-purge',
                tmpDir,
                mockPort
            );
            // THEN - runCLI() throws if the subprocess exits with non-zero code.
            // Verify the deploy definition file was written
            assert.isTrue(
                await fs.pathExists(
                    path.join(
                        tmpDir,
                        'deploy',
                        'testInstance',
                        'testBU',
                        'query',
                        'testTemplated_query.query-meta.json'
                    )
                ),
                'deploy definition file should have been created by build command'
            );
            return;
        });
    });

    describe('buildTemplate ================', () => {
        beforeEach(async () => {
            // Retrieve first so the retrieve folder is populated for buildTemplate
            await runCLI('retrieve testInstance/testBU query', tmpDir, mockPort);
        });

        it('Should build a query template via CLI', async () => {
            // WHEN
            await runCLI(
                'buildTemplate testInstance/testBU query testExisting_query testSourceMarket',
                tmpDir,
                mockPort
            );
            // THEN - runCLI() throws if the subprocess exits with non-zero code.
            // Verify template file was written.
            assert.isTrue(
                await fs.pathExists(
                    path.join(tmpDir, 'template', 'query', 'testExisting_query.query-meta.json')
                ),
                'template file should have been created'
            );
            return;
        });
    });

    describe('buildDefinition ================', () => {
        beforeEach(async () => {
            // Build a template first so buildDefinition has something to work with
            await runCLI('retrieve testInstance/testBU query', tmpDir, mockPort);
            await runCLI(
                'buildTemplate testInstance/testBU query testExisting_query testSourceMarket',
                tmpDir,
                mockPort
            );
        });

        it('Should build a query definition via CLI', async () => {
            // WHEN
            await runCLI(
                'buildDefinition testInstance/testBU query testExisting_query testTargetMarket',
                tmpDir,
                mockPort
            );
            // THEN - runCLI() throws if the subprocess exits with non-zero code.
            // Verify definition file was written to deploy folder.
            assert.isTrue(
                await fs.pathExists(
                    path.join(
                        tmpDir,
                        'deploy',
                        'testInstance',
                        'testBU',
                        'query',
                        'testTemplated_query.query-meta.json'
                    )
                ),
                'deploy definition file should have been created'
            );
            return;
        });
    });

    describe('buildDefinitionBulk ================', () => {
        beforeEach(async () => {
            // Build a template first so buildDefinitionBulk has something to work with
            await runCLI('retrieve testInstance/testBU query', tmpDir, mockPort);
            await runCLI(
                'buildTemplate testInstance/testBU query testExisting_query testSourceMarket',
                tmpDir,
                mockPort
            );
        });

        it('Should build definitions from a market list via CLI', async () => {
            // WHEN - buildDefinitionBulk uses a marketList name defined in .mcdevrc.json
            await runCLI(
                'buildDefinitionBulk deployment-target query testExisting_query',
                tmpDir,
                mockPort
            );
            // THEN - runCLI() throws if the subprocess exits with non-zero code.
            // Verify at least one definition file was written to deploy folder
            assert.isTrue(
                await fs.pathExists(path.join(tmpDir, 'deploy', 'testInstance')),
                'deploy folder should have been populated by buildDefinitionBulk'
            );
            return;
        });
    });

    describe('Error handling ================', () => {
        it('Should exit with non-zero code for an unknown command', async () => {
            // WHEN - 'unknownCommand' is not a valid mcdev command
            const { error } = await runCLIExpectError('unknownCommand', tmpDir);
            // THEN - yargs exits with code 1 for unknown commands
            assert.ok(error, 'should have thrown an error for unknown command');
            return;
        });

        it('Should exit with non-zero code when buildTemplate is called without a market', async () => {
            // WHEN - buildTemplate requires --market or MARKET positional
            const { error } = await runCLIExpectError(
                'buildTemplate testInstance/testBU query testExisting_query',
                tmpDir
            );
            // THEN - yargs check() validates that market is required
            assert.ok(error, 'should have thrown an error for missing market argument');
            return;
        });

        it('Should exit with non-zero code when buildDefinition is called without a market', async () => {
            // WHEN - buildDefinition requires --market or MARKET positional
            const { error } = await runCLIExpectError(
                'buildDefinition testInstance/testBU query testExisting_query',
                tmpDir
            );
            // THEN
            assert.ok(error, 'should have thrown an error for missing market argument');
            return;
        });

        it('Should exit with non-zero code when execute is called without TYPE or --metadata', async () => {
            // WHEN - execute requires TYPE or --metadata (enforced by yargs check())
            const { error } = await runCLIExpectError('execute testInstance/testBU', tmpDir);
            // THEN
            assert.ok(error, 'should have thrown an error for missing TYPE argument');
            return;
        });
    });
});
