import * as chai from 'chai';
const assert = chai.assert;

import chaiFiles from 'chai-files';
import fs from 'fs-extra';
import cache from '../lib/util/cache.js';
import handler from '../lib/index.js';
import MobilePush from '../lib/metadataTypes/MobilePush.js';
import { Util } from '../lib/util/util.js';
import * as testUtils from './utils.js';
chai.use(chaiFiles);

describe('type: mobilePush', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });

    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve all mobilePushs', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['mobilePush']);
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.mobilePush ? Object.keys(result.mobilePush).length : 0,
                1,
                'only one mobilePush expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('MTk6MTE0OjA', 'mobilePush'),
                await testUtils.getExpectedJson('9999999', 'mobilePush', 'get'),
                'returned JSON was not equal expected'
            );
            // cross-BU coverage: retrieve must write BOTH the id-based _key AND the portable _name
            // ref for the resolved mobilePushApp dependency
            const retrieved = await testUtils.getActualJson('MTk6MTE0OjA', 'mobilePush');
            assert.equal(
                retrieved.r__mobilePushApp_key,
                'ZmRVQWZaUU5YVXFGdmJVYVI3b2JudzoxMTc6MA',
                'mobilePushApp dependency should have resolved to r__mobilePushApp_key'
            );
            assert.equal(
                retrieved.r__mobilePushApp_name,
                'Test Push App One',
                'mobilePushApp dependency should ALSO carry the portable r__mobilePushApp_name'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                3,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should warn during mobilePush retrieve and persist every duplicate record', async () => {
            const fixturePath = 'test/resources/9999999/push/v1/message/get-response.json';
            const fixture = await fs.readJson(fixturePath);
            const duplicateOne = {
                ...fixture.items[0],
                id: 'duplicatePushOne',
                name: 'Duplicate Push',
                createdDate: '2026-01-01T00:00:00Z',
            };
            const duplicateTwo = {
                ...fixture.items[0],
                id: 'duplicatePushTwo',
                name: 'Duplicate Push',
            };
            delete duplicateTwo.createdDate;
            const unique = {
                ...fixture.items[0],
                id: 'uniquePush',
                name: 'Unique Push',
            };
            fixture.items = [duplicateOne, duplicateTwo, unique];
            fixture.count = fixture.items.length;
            await fs.writeJson(fixturePath, fixture);

            const warnings = [];
            const originalWarn = Util.logger.warn;
            Util.logger.warn = (message) => {
                warnings.push(message);
                originalWarn(message);
            };
            try {
                await handler.retrieve('testInstance/testBU', ['mobilePush']);
            } finally {
                Util.logger.warn = originalWarn;
            }

            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            const duplicateWarnings = warnings.filter((message) =>
                message.includes('name "Duplicate Push" is used by')
            );
            assert.equal(
                duplicateWarnings.length,
                1,
                'real retrieve should warn once for the one duplicated name'
            );
            assert.include(duplicateWarnings[0], 'mobilePush');
            assert.include(duplicateWarnings[0], 'duplicatePushOne');
            assert.include(duplicateWarnings[0], '2026-01-01T00:00:00Z');
            assert.include(duplicateWarnings[0], 'duplicatePushTwo');
            assert.include(duplicateWarnings[0], 'n/a');
            assert.include(duplicateWarnings[0], 'Names must be unique within a BU');
            assert.include(duplicateWarnings[0], 'clean these up');

            const retrieved = cache.getCache().mobilePush;
            assert.sameMembers(Object.keys(retrieved), [
                'duplicatePushOne',
                'duplicatePushTwo',
                'uniquePush',
            ]);
            for (const id of Object.keys(retrieved)) {
                assert.equal(
                    (await testUtils.getActualJson(id, 'mobilePush')).id,
                    id,
                    `retrieve should persist ${id}`
                );
            }
        });

        it('Should warn for duplicate mobilePush names during changelog-only retrieve without writing files', async () => {
            const fixturePath = 'test/resources/9999999/push/v1/message/get-response.json';
            const fixture = await fs.readJson(fixturePath);
            fixture.items = [
                { ...fixture.items[0], id: 'changelogPushOne', name: 'Changelog Push' },
                { ...fixture.items[0], id: 'changelogPushTwo', name: 'Changelog Push' },
            ];
            fixture.count = fixture.items.length;
            await fs.writeJson(fixturePath, fixture);

            const warnings = [];
            const originalWarn = Util.logger.warn;
            Util.logger.warn = (message) => {
                warnings.push(String(message));
                return originalWarn.call(Util.logger, message);
            };
            let result;
            try {
                result = await handler.retrieve(
                    'testInstance/testBU',
                    ['mobilePush'],
                    undefined,
                    true
                );
            } finally {
                Util.logger.warn = originalWarn;
            }

            assert.sameMembers(Object.keys(result.mobilePush), [
                'changelogPushOne',
                'changelogPushTwo',
            ]);
            assert.lengthOf(
                warnings.filter((message) => message.includes('name "Changelog Push" is used by')),
                1,
                'explicit changelog-only retrieve should emit the duplicate-name warning'
            );
            assert.isFalse(
                await fs.pathExists('retrieve/testInstance/testBU/mobilePush'),
                'changelog-only retrieve must not write normal retrieve files'
            );
        });

        it('Should gracefully handle retrieving mobilePush on a BU with 0 messages (API returns 500) and download 0 instead of hard-failing', async () => {
            // GIVEN a BU with 0 push messages, the list endpoint /push/v1/message/ returns HTTP 500
            // (ERR_BAD_RESPONSE) instead of an empty array
            testUtils.mockRESTError('/push/v1/message/', 500, undefined, 'get');
            // WHEN
            await handler.retrieve('testInstance/testBU', ['mobilePush']);
            // THEN
            assert.equal(
                process.exitCode,
                0,
                'retrieve should not have thrown an error despite the 500 on the list endpoint'
            );
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.mobilePush ? Object.keys(result.mobilePush).length : 0,
                0,
                'no mobilePush expected because the list endpoint returned an error'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                3,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should gracefully handle retrieving a non-existent mobilePush by key (API returns 400 Validation Error 10006) and download 0 instead of hard-failing', async () => {
            // GIVEN a key that does not exist, GET /push/v1/message/<key> returns HTTP 400 with body
            // { message: "Validation Error", errorcode: 10006 }; sfmc-sdk's RestError maps that to
            // code === 10006 (number). The bodyFixture faithfully reproduces the real API body so the
            // real RestError mapping is exercised (not a hand-set code bypass).
            testUtils.mockRESTError(
                '/push/v1/message/doesNotExist',
                400,
                undefined,
                'get',
                undefined,
                'rest400-validationError-response.json'
            );
            // WHEN
            await handler.retrieve('testInstance/testBU', ['mobilePush'], ['doesNotExist']);
            // THEN
            assert.equal(
                process.exitCode,
                0,
                'retrieve should not have thrown an error despite the 400 on the by-key endpoint'
            );
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.mobilePush ? Object.keys(result.mobilePush).length : 0,
                0,
                'no mobilePush expected because the requested key does not exist'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                3,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should retrieve one mobilePush by key', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['mobilePush'], ['MTk6MTE0OjA']);
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            assert.deepEqual(
                await testUtils.getActualJson('MTk6MTE0OjA', 'mobilePush'),
                await testUtils.getExpectedJson('9999999', 'mobilePush', 'get'),
                'returned JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                3,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Deploy ================', () => {
        beforeEach(() => {
            testUtils.mockSetup(true);
        });

        it('Should create a mobilePush', async () => {
            // WHEN
            // GIVEN test_mobilePush_DEV whose source key/id AND name ("test_mobilePush_DEV") are both
            // absent from the target cache (which only holds MTk6MTE0OjA / testExisting_...): key-first
            // misses, name-fallback misses too -> getCacheMatchedByName returns null -> CREATE (this is
            // the 0-match -> CREATE case for a deployable type, NOT a thrown not-found).
            await handler.deploy('testInstance/testBU', ['mobilePush'], ['test_mobilePush_DEV']);
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            // confirm created item (the API assigns a new id which becomes the key)
            assert.deepEqual(
                await testUtils.getActualJson('MTY2OjExNDow', 'mobilePush'),
                await testUtils.getExpectedJson('9999999', 'mobilePush', 'post'),
                'returned JSON was not equal expected for insert mobilePush'
            );
            // post-create key reconciliation: the persisted on-disk key must be the NEW target-BU id
            // returned by the server (MTY2OjExNDow, asserted above), never the stale source id
            // (test_mobilePush_DEV). Reading the stale-key file must therefore fail.
            let staleKeyFileExists = true;
            try {
                await testUtils.getActualJson('test_mobilePush_DEV', 'mobilePush');
            } catch {
                staleKeyFileExists = false;
            }
            assert.equal(
                staleKeyFileExists,
                false,
                'stale source key must NOT remain on disk after post-create key reconciliation'
            );
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                4,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should update a mobilePush', async () => {
            // WHEN
            await handler.deploy('testInstance/testBU', ['mobilePush'], ['MTk6MTE0OjA']);
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            // confirm updated item (upsert API: PUT /push/v1/message/<id>)
            assert.deepEqual(
                await testUtils.getActualJson('MTk6MTE0OjA', 'mobilePush'),
                await testUtils.getExpectedJson('9999999', 'mobilePush', 'put'),
                'returned JSON was not equal expected for update mobilePush'
            );
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                4,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should resolve a mobilePush by NAME when the source key misses the target cache (cross-BU name-fallback → update)', async () => {
            // GIVEN srcOnlyKey_mobilePush whose source key (srcOnlyKey_mobilePush) is NOT in the
            // target cache, but whose name ("testExisting_mobilePush_asset_DEV") matches EXACTLY ONE
            // cached item (MTk6MTE0OjA). getCacheMatchedByName finds that single item -> createOrUpdate
            // picks UPDATE and PUTs to the cached target id, NOT a create.
            // WHEN
            await handler.deploy('testInstance/testBU', ['mobilePush'], ['srcOnlyKey_mobilePush']);
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            // it resolved by name to the cached id and UPDATED it (PUT to that id)
            assert.notEqual(
                testUtils.getRestCallout('put', '/push/v1/message/MTk6MTE0OjA'),
                null,
                'name-fallback should have resolved to the cached id and issued a PUT (update)'
            );
            // and it did NOT create a new item (no POST to the collection endpoint)
            assert.equal(
                testUtils.getRestCallout('post', '/push/v1/message/', false, true),
                null,
                'name-fallback must UPDATE the matched item, never CREATE a new one'
            );
            return;
        });

        it('Should resolve a mobilePush by KEY first even when a portable name ref is also present (same-BU key-first)', async () => {
            // GIVEN MTk6MTE0OjA whose source key matches the target cache directly: createOrUpdate
            // resolves via cache.getByKey BEFORE getCacheMatchedByName is even consulted, so the key
            // wins and the item is UPDATED (key-first override).
            // WHEN
            await handler.deploy('testInstance/testBU', ['mobilePush'], ['MTk6MTE0OjA']);
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            // key-first: PUT to the key-matched id, and no create
            assert.notEqual(
                testUtils.getRestCallout('put', '/push/v1/message/MTk6MTE0OjA'),
                null,
                'key-first resolution should issue a PUT (update) to the key-matched id'
            );
            assert.equal(
                testUtils.getRestCallout('post', '/push/v1/message/', false, true),
                null,
                'key-first resolution must UPDATE, never CREATE'
            );
            return;
        });

        it('Should HARD-ERROR when a referenced mobilePushApp is missing on the target BU (0-match on key AND name) instead of creating it', async () => {
            // GIVEN test_mobilePush_missingApp references an app by key ("doesNotExist_appKey") and
            // name ("This App Does Not Exist On Target") that are BOTH absent from the target cache.
            // mobilePushApp is retrieve-only / GUI-created, so preDeployTasks must throw
            // "mobilePushApp '...' not found on target BU — must be created via GUI first"
            // (create-on-zero must NOT fire); the deploy skips the item and sets exitCode 1.
            // WHEN
            await handler.deploy(
                'testInstance/testBU',
                ['mobilePush'],
                ['test_mobilePush_missingApp']
            );
            // THEN
            assert.equal(
                process.exitCode,
                1,
                'deploy should have set an error exit code because the referenced mobilePushApp is missing'
            );
            // create-on-zero must NOT fire for a missing app reference
            assert.equal(
                testUtils.getRestCallout('post', '/push/v1/message/', false, true),
                null,
                'a missing mobilePushApp reference must not trigger a mobilePush create'
            );
            return;
        });

        it('Should hard-error before standalone mobilePush update when key misses and multiple target names match', async () => {
            const fixturePath = 'test/resources/9999999/push/v1/message/get-response.json';
            const fixture = await fs.readJson(fixturePath);
            const targetOne = {
                ...fixture.items[0],
                id: 'duplicateTargetOne',
                name: 'testExisting_mobilePush_asset_DEV',
            };
            const targetTwo = {
                ...fixture.items[0],
                id: 'duplicateTargetTwo',
                name: 'testExisting_mobilePush_asset_DEV',
            };
            const originalFixture = await fs.readJson(fixturePath);
            fixture.items = [targetOne, targetTwo];
            fixture.count = fixture.items.length;

            const errors = [];
            const warnings = [];
            const originalError = Util.logger.error;
            const originalWarn = Util.logger.warn;
            Util.logger.error = (message) => {
                errors.push(String(message));
                return originalError.call(Util.logger, message);
            };
            Util.logger.warn = (message) => {
                warnings.push(String(message));
                return originalWarn.call(Util.logger, message);
            };
            try {
                await fs.writeJson(fixturePath, fixture);
                await handler.deploy(
                    'testInstance/testBU',
                    ['mobilePush'],
                    ['srcOnlyKey_mobilePush']
                );
            } finally {
                Util.logger.error = originalError;
                Util.logger.warn = originalWarn;
                await fs.writeJson(fixturePath, originalFixture);
            }
            assert.equal(process.exitCode, 1, 'deploy should have set an error exit code');
            assert.lengthOf(
                warnings.filter((message) =>
                    message.includes('name "testExisting_mobilePush_asset_DEV" is used by')
                ),
                0,
                'deploy cache retrieval must not emit the explicit-retrieve duplicate-name warning'
            );
            assert.notProperty(
                cache.getCache().mobilePush,
                'srcOnlyKey_mobilePush',
                'the source key must not accidentally match the target cache'
            );
            assert.equal(
                Object.values(cache.getCache().mobilePush).filter(
                    (item) => item.name === 'testExisting_mobilePush_asset_DEV'
                ).length,
                2,
                'the target cache must contain multiple matching names'
            );
            const emittedError = errors.join('\n');
            assert.include(
                emittedError,
                'skipping mobilePush srcOnlyKey_mobilePush / testExisting_mobilePush_asset_DEV',
                'error should use the standard item-level skipping message'
            );
            assert.include(
                emittedError,
                'name "testExisting_mobilePush_asset_DEV" matches multiple target-BU mobilePush items',
                'reason should identify the target-BU name ambiguity'
            );
            assert.include(
                emittedError,
                'duplicateTargetOne',
                'error should identify first candidate'
            );
            assert.include(
                emittedError,
                'duplicateTargetTwo',
                'error should identify second candidate'
            );
            assert.include(
                emittedError,
                'Clean up the duplicate names on the target BU before deploying',
                'error should tell the user how to resolve the ambiguity'
            );
            const history = testUtils.getAPIHistory();
            assert.lengthOf(
                (history.put || []).filter((request) =>
                    request.url.startsWith('/push/v1/message/')
                ),
                0,
                'ambiguity must prevent every mobilePush PUT write'
            );
            assert.lengthOf(
                (history.post || []).filter((request) => request.url === '/push/v1/message/'),
                0,
                'ambiguity must not fall through to create'
            );
        });

        it('Should match top-level mobilePush names only when exactly one target item exists', () => {
            cache.initCache({ mid: 9999999, eid: 1111111 });
            cache.setMetadata('mobilePush', {
                targetOne: { id: 'targetOne', name: 'portableName' },
            });
            assert.equal(
                MobilePush.getCacheMatchedByName({ id: 'sourceId', name: 'portableName' }).id,
                'targetOne',
                'one name match should return the target-BU item'
            );
            assert.equal(
                MobilePush.getCacheMatchedByName({ id: 'sourceId', name: 'missingName' }),
                null,
                'zero name matches should return null so createOrUpdate can create'
            );

            cache.setMetadata('mobilePush', {
                targetOne: { id: 'targetOne', name: 'portableName' },
                targetTwo: { id: 'targetTwo', name: 'portableName' },
            });
            let duplicateError;
            try {
                MobilePush.getCacheMatchedByName({
                    id: 'sourceId',
                    name: 'portableName',
                });
            } catch (ex) {
                duplicateError = ex;
            }
            assert.include(duplicateError?.message, 'targetOne');
            assert.include(duplicateError?.message, 'targetTwo');
        });

        it('Should not name-match unnamed top-level mobilePush items', () => {
            const unnamedValues = [undefined, null, ''];
            for (const deployedName of unnamedValues) {
                for (const cachedCount of [1, 2]) {
                    cache.initCache({ mid: 9999999, eid: 1111111 });
                    cache.setMetadata('mobilePush', {
                        cachedOne: { id: 'cachedOne', name: deployedName },
                        ...(cachedCount === 2
                            ? { cachedTwo: { id: 'cachedTwo', name: deployedName } }
                            : {}),
                    });
                    assert.equal(
                        MobilePush.getCacheMatchedByName({ id: 'sourceId', name: deployedName }),
                        null,
                        `${cachedCount} cached item(s) with unnamed value ${String(deployedName)} should use base zero-match behavior`
                    );
                }
            }
        });

        it('Should resolve mobilePushApp references key-first, then by one unique name', async () => {
            cache.initCache({ mid: 9999999, eid: 1111111 });
            cache.setMetadata('mobilePushApp', {
                keyedApp: { id: 'keyedId', key: 'keyedApp', name: 'Shared App' },
                namedApp: { id: 'namedId', key: 'namedApp', name: 'Portable App' },
            });

            const keyFirst = {
                r__mobilePushApp_key: 'keyedApp',
                r__mobilePushApp_name: 'Portable App',
            };
            await MobilePush.preDeployTasks(keyFirst);
            assert.equal(keyFirst.application.id, 'keyedId', 'the matching key should win');

            const nameFallback = {
                r__mobilePushApp_key: 'missingKey',
                r__mobilePushApp_name: 'Portable App',
            };
            await MobilePush.preDeployTasks(nameFallback);
            assert.equal(nameFallback.application.id, 'namedId', 'one name match should resolve');

            let missingError;
            try {
                await MobilePush.preDeployTasks({
                    r__mobilePushApp_key: 'missingKey',
                    r__mobilePushApp_name: 'Missing App',
                });
            } catch (ex) {
                missingError = ex;
            }
            assert.include(
                missingError?.message,
                "mobilePushApp 'Missing App' not found on target BU",
                'zero matches should hard-error with GUI creation guidance'
            );

            cache.setMetadata('mobilePushApp', {
                appOne: { id: 'appOne', key: 'appOne', name: 'Duplicate App' },
                appTwo: { id: 'appTwo', key: 'appTwo', name: 'Duplicate App' },
            });
            let duplicateError;
            try {
                await MobilePush.preDeployTasks({
                    r__mobilePushApp_key: 'missingKey',
                    r__mobilePushApp_name: 'Duplicate App',
                });
            } catch (ex) {
                duplicateError = ex;
            }
            assert.include(duplicateError?.message, 'appOne');
            assert.include(duplicateError?.message, 'appTwo');
        });
    });

    describe('Templating ================', () => {
        it('Should create a mobilePush template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['mobilePush']);
            // buildTemplate
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'mobilePush',
                ['MTk6MTE0OjA'],
                ['testSourceMarket']
            );
            assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');
            assert.equal(
                result.mobilePush ? Object.keys(result.mobilePush).length : 0,
                1,
                'only one mobilePush expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson('MTk6MTE0OjA', 'mobilePush'),
                await testUtils.getExpectedJson('9999999', 'mobilePush', 'template'),
                'returned template JSON was not equal expected'
            );
            // buildDefinition
            await handler.buildDefinition(
                'testInstance/testBU',
                'mobilePush',
                ['MTk6MTE0OjA'],
                ['testTargetMarket']
            );
            assert.equal(process.exitCode, 0, 'buildDefinition should not have thrown an error');
            assert.deepEqual(
                await testUtils.getActualDeployJson('MTk6MTE0OjA', 'mobilePush'),
                await testUtils.getExpectedJson('9999999', 'mobilePush', 'build'),
                'returned deployment JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                3,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('CI/CD ================', () => {
        it('Should return a list of files based on their type and key', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['mobilePush']);
            const fileList = await handler.getFilesToCommit('testInstance/testBU', 'mobilePush', [
                'MTk6MTE0OjA',
            ]);
            // THEN
            assert.equal(process.exitCode, 0, 'getFilesToCommit should not have thrown an error');
            assert.equal(fileList.length, 1, 'expected only 1 file to be returned');
            assert.equal(
                fileList[0].split('\\').join('/'),
                'retrieve/testInstance/testBU/mobilePush/MTk6MTE0OjA.mobilePush-meta.json',
                'wrong file path returned'
            );
            return;
        });
    });

    describe('Delete ================', () => {
        it('Should delete the item', async () => {
            // WHEN
            const isDeleted = await handler.deleteByKey(
                'testInstance/testBU',
                'mobilePush',
                'MTY2OjExNDow'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'delete should not have thrown an error');
            assert.equal(isDeleted, true, 'should have deleted the item');
            return;
        });
    });
});
