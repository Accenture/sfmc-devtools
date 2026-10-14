import { assert } from 'chai';
import { getTestEnvironment } from './run.js';
import {
    mockSetup,
    mockReset,
    getExpectedJson,
    getExpectedFile,
    copyToDeploy,
    getActualFile,
    getRestCallout,
    logAPIHistoryDebug,
} from './utils.js';
import fs from 'fs-extra';
import { handleRESTRequest, restUrl } from './resourceFactory.js';
import handler from '../lib/index.js';
import { Util } from '../lib/util/util.js';

describe('npm test logging boundary', () => {
    it('opts in only when npm test forwards no arguments', () => {
        const env = { OTHER: 'preserved' };
        assert.deepEqual(getTestEnvironment([], env), {
            OTHER: 'preserved',
            MCDEV_FULL_TEST_SUITE: '1',
        });
        assert.deepEqual(env, { OTHER: 'preserved' });
    });

    it('clears inherited opt-in for grep, file, and other focused invocations', () => {
        for (const args of [
            ['--grep', 'UTIL'],
            ['-g', 'UTIL'],
            ['--grep=UTIL'],
            ['test/util.test.js'],
            ['--fgrep', 'UTIL'],
            ['--invert'],
            ['--exclude', 'test/util.test.js'],
        ]) {
            const env = { MCDEV_FULL_TEST_SUITE: '1', OTHER: 'preserved' };
            assert.deepEqual(getTestEnvironment(args, env), { OTHER: 'preserved' });
            assert.equal(env.MCDEV_FULL_TEST_SUITE, '1');
        }
    });

    describe('fixture console diagnostics', () => {
        for (const marker of [undefined, '0', '1']) {
            it(`gates helper logs only for the exact full-suite marker (${marker})`, async () => {
                const markerBackup = process.env.MCDEV_FULL_TEST_SUITE;
                // eslint-disable-next-line no-console -- Preserve the fixture diagnostic methods for restoration.
                const logBackup = console.log;
                // eslint-disable-next-line no-console -- Preserve the fixture diagnostic methods for restoration.
                const errorBackup = console.error;
                const exitCodeBackup = process.exitCode;
                const logs = [];
                const errors = [];
                let setup = false;
                try {
                    if (marker === undefined) {
                        delete process.env.MCDEV_FULL_TEST_SUITE;
                    } else {
                        process.env.MCDEV_FULL_TEST_SUITE = marker;
                    }
                    Util.startLogger(false, true);
                    mockSetup();
                    setup = true;
                    // Capture diagnostics locally; production console methods are never replaced.
                    // eslint-disable-next-line no-console -- Capture and restore fixture diagnostics for boundary assertions.
                    console.log = (...args) => {
                        logs.push(args);
                    };
                    // eslint-disable-next-line no-console -- Capture and restore fixture diagnostics for boundary assertions.
                    console.error = (...args) => {
                        errors.push(args);
                    };
                    await fs.outputJson('test/resources/9999999/logging/sample-expected.json', {
                        value: 'unchanged',
                    });
                    await fs.outputFile(
                        'test/resources/9999999/logging/sample-expected.txt',
                        'fixture'
                    );
                    assert.deepEqual(await getExpectedJson('9999999', 'logging', 'sample'), {
                        value: 'unchanged',
                    });
                    assert.equal(
                        await getExpectedFile('9999999', 'logging', 'sample', 'txt'),
                        'fixture'
                    );
                    copyToDeploy('logging/sample-expected.txt', 'logging/copied.txt');
                    assert.equal(await getActualFile('missing', 'logging', 'txt'), null);
                    assert.isNull(getRestCallout('get', '/missing'));
                    logAPIHistoryDebug();

                    const config = {
                        baseURL: restUrl,
                        method: 'get',
                        headers: { Authorization: 'Bearer 9999999' },
                        url: '/push/v1/application',
                    };
                    const response = await handleRESTRequest(config);
                    assert.equal(response[0], 200);
                    assert.lengthOf(JSON.parse(response[1]), 3);
                    const asset = await handleRESTRequest({
                        ...config,
                        url: '/asset/v1/content/assets/5286',
                    });
                    assert.equal(asset[0], 200);
                    assert.equal(JSON.parse(asset[1]).id, 5286);
                    const missing = await handleRESTRequest({ ...config, url: '/logging/missing' });
                    assert.equal(missing[0], 404);
                    assert.equal(process.exitCode, 404);
                    const caught = await handleRESTRequest({ ...config, headers: {} });
                    assert.deepEqual(caught, [500, {}]);
                    assert.equal(process.exitCode, 404);
                    assert.deepEqual(errors, [['Available methods: ']]);
                    if (marker === '1') {
                        assert.isEmpty(logs);
                    } else {
                        assert.lengthOf(logs, 10);
                        assert.include(logs[0][0], '/logging/sample-expected.json');
                        assert.include(logs[1][0], '/logging/sample-expected.txt');
                        assert.equal(
                            logs[2][0],
                            'Copying logging/sample-expected.txt to deploy folder'
                        );
                        assert.include(logs[4][0], 'No history for method get.');
                        assert.deepEqual(logs[5], [[]]);
                        assert.match(logs[6][0], /push[/\\]v1[/\\]application/);
                        assert.include(logs[7][0], 'asset-pool (dynamic: GET asset 5286)');
                        assert.include(logs[8][0], 'TEST-ERROR');
                        assert.instanceOf(logs[9][0], Error);
                    }
                } finally {
                    // eslint-disable-next-line no-console -- Capture and restore fixture diagnostics for boundary assertions.
                    console.log = logBackup;
                    // eslint-disable-next-line no-console -- Capture and restore fixture diagnostics for boundary assertions.
                    console.error = errorBackup;
                    if (setup) {
                        mockReset();
                    }
                    if (markerBackup === undefined) {
                        delete process.env.MCDEV_FULL_TEST_SUITE;
                    } else {
                        process.env.MCDEV_FULL_TEST_SUITE = markerBackup;
                    }
                    process.exitCode = exitCodeBackup;
                }
            });
        }
    });

    describe('fixture option defaults', () => {
        let markerBackup;
        let optionsBackup;
        let levelBackup;
        let transportLevelBackup;

        beforeEach(() => {
            Util.startLogger(false, true);
            markerBackup = process.env.MCDEV_FULL_TEST_SUITE;
            optionsBackup = Util.OPTIONS;
            levelBackup = Util.logger.level;
            transportLevelBackup = Util.loggerTransports.console.level;
            Util.OPTIONS = {};
        });

        afterEach(() => {
            mockReset();
            if (markerBackup === undefined) {
                delete process.env.MCDEV_FULL_TEST_SUITE;
            } else {
                process.env.MCDEV_FULL_TEST_SUITE = markerBackup;
            }
            Util.OPTIONS = optionsBackup;
            Util.logger.level = levelBackup;
            Util.loggerTransports.console.level = transportLevelBackup;
        });

        it('sets full-suite silent with debug false and leaves errors enabled', () => {
            process.env.MCDEV_FULL_TEST_SUITE = '1';
            mockSetup();
            assert.equal(Util.OPTIONS.loggerLevel, 'error');
            assert.isTrue(Util.OPTIONS.noLogFile);
            assert.equal(Util.logger.level, 'error');
            assert.equal(Util.loggerTransports.console.level, 'error');
            assert.isTrue(Util.logger.isErrorEnabled());
            assert.isFalse(Util.logger.isInfoEnabled());
        });

        it('keeps direct Mocha and editor-adapter logging without the marker', () => {
            delete process.env.MCDEV_FULL_TEST_SUITE;
            mockSetup();
            assert.equal(Util.OPTIONS.loggerLevel, 'info');
            assert.isTrue(Util.OPTIONS.noLogFile);
            assert.equal(Util.logger.level, 'info');
            assert.isTrue(Util.logger.isInfoEnabled());
        });

        it('allows explicit debug to override full-suite silent', () => {
            process.env.MCDEV_FULL_TEST_SUITE = '1';
            mockSetup();
            handler.setOptions({ silent: true, debug: true });
            assert.equal(Util.logger.level, 'debug');
            assert.isTrue(Util.logger.isDebugEnabled());
        });

        it('preserves logger method interception in full-suite mode', () => {
            process.env.MCDEV_FULL_TEST_SUITE = '1';
            mockSetup();
            const originalInfo = Util.logger.info;
            const messages = [];
            try {
                Util.logger.info = (message) => {
                    messages.push(message);
                    return Util.logger;
                };
                Util.logger.info('intercepted despite console level');
                assert.deepEqual(messages, ['intercepted despite console level']);
            } finally {
                Util.logger.info = originalInfo;
            }
        });
    });
});
