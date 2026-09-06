import * as chai from 'chai';
/** @type {typeof chai.assert} */
const assert = chai.assert;
const expect = chai.expect;

import chaiFiles from 'chai-files';
import fs from 'fs-extra';
import cache from '../lib/util/cache.js';
import handler from '../lib/index.js';
import MobileMessage from '../lib/metadataTypes/MobileMessage.js';
import { Util } from '../lib/util/util.js';
import * as testUtils from './utils.js';
chai.use(chaiFiles);

describe('type: mobileMessage', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });

    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a mobileMessage', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['mobileMessage']);
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.mobileMessage ? Object.keys(result.mobileMessage).length : 0,
                1,
                'only 1 mobileMessages expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('NTIzOjc4OjA', 'mobileMessage'),
                await testUtils.getExpectedJson('9999999', 'mobileMessage', 'get'),
                'saved JSON was not equal expected'
            );
            expect(await testUtils.getActualFile('NTIzOjc4OjA', 'mobileMessage', 'amp')).to.equal(
                await testUtils.getExpectedFile('9999999', 'mobileMessage', 'get', 'amp')
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                4,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should warn during mobileMessage retrieve and persist every duplicate record', async () => {
            const fixturePath =
                'test/resources/9999999/legacy/v1/beta/mobile/message/get-response.json';
            const fixture = await fs.readJson(fixturePath);
            const duplicateOne = {
                ...fixture.entry[0],
                id: 'duplicateMessageOne',
                name: 'Duplicate SMS',
                createdDate: '2026-02-01T00:00:00Z',
            };
            const duplicateTwo = {
                ...fixture.entry[0],
                id: 'duplicateMessageTwo',
                name: 'Duplicate SMS',
            };
            const unique = {
                ...fixture.entry[0],
                id: 'uniqueMessage',
                name: 'Unique SMS',
            };
            fixture.entry = [duplicateOne, duplicateTwo, unique];
            fixture.totalResults = fixture.entry.length;
            await fs.writeJson(fixturePath, fixture);

            const warnings = [];
            const originalWarn = Util.logger.warn;
            Util.logger.warn = (message) => {
                warnings.push(message);
                return originalWarn.call(Util.logger, message);
            };
            try {
                await handler.retrieve('testInstance/testBU', ['mobileMessage']);
            } finally {
                Util.logger.warn = originalWarn;
            }

            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            const duplicateWarnings = warnings.filter((message) =>
                message.includes('name "Duplicate SMS" is used by')
            );
            assert.equal(
                duplicateWarnings.length,
                1,
                'real retrieve should warn once for the one duplicated name'
            );
            assert.include(duplicateWarnings[0], 'mobileMessage');
            assert.include(duplicateWarnings[0], 'duplicateMessageOne');
            assert.include(duplicateWarnings[0], '2026-02-01T00:00:00Z');
            assert.include(duplicateWarnings[0], 'duplicateMessageTwo');
            assert.include(duplicateWarnings[0], 'n/a');
            assert.include(duplicateWarnings[0], 'Names must be unique within a BU');
            assert.include(duplicateWarnings[0], 'clean these up');

            const retrieved = cache.getCache().mobileMessage;
            assert.sameMembers(Object.keys(retrieved), [
                'duplicateMessageOne',
                'duplicateMessageTwo',
                'uniqueMessage',
            ]);
            for (const id of Object.keys(retrieved)) {
                assert.equal(
                    (await testUtils.getActualJson(id, 'mobileMessage')).id,
                    id,
                    `retrieve should persist ${id}`
                );
                assert.isString(
                    await testUtils.getActualFile(id, 'mobileMessage', 'amp'),
                    `retrieve should persist extracted AMP for ${id}`
                );
            }
        });

        it('Should warn for duplicate mobileMessage names during changelog-only retrieve without writing files', async () => {
            const fixturePath =
                'test/resources/9999999/legacy/v1/beta/mobile/message/get-response.json';
            const fixture = await fs.readJson(fixturePath);
            fixture.entry = [
                { ...fixture.entry[0], id: 'changelogMessageOne', name: 'Changelog SMS' },
                { ...fixture.entry[0], id: 'changelogMessageTwo', name: 'Changelog SMS' },
            ];
            fixture.totalResults = fixture.entry.length;
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
                    ['mobileMessage'],
                    undefined,
                    true
                );
            } finally {
                Util.logger.warn = originalWarn;
            }

            assert.sameMembers(Object.keys(result.mobileMessage), [
                'changelogMessageOne',
                'changelogMessageTwo',
            ]);
            assert.lengthOf(
                warnings.filter((message) => message.includes('name "Changelog SMS" is used by')),
                1,
                'explicit changelog-only retrieve should emit the duplicate-name warning'
            );
            assert.isFalse(
                await fs.pathExists('retrieve/testInstance/testBU/mobileMessage'),
                'changelog-only retrieve must not write normal retrieve files'
            );
        });

        it('Should gracefully handle retrieving a non-existent mobileMessage by key (API returns 400) and download 0 instead of hard-failing', async () => {
            // GIVEN a key that does not exist, GET /legacy/v1/beta/mobile/message/<key> returns HTTP
            // 400 with a plain (errorcode-less) body; sfmc-sdk's RestError then falls back to the
            // axios error code, which is 'ERR_BAD_REQUEST' for a <500 status — exactly what
            // MobileMessage.retrieve's catch guard checks. (The legacy mobile/message API differs from
            // the mobilePush REST API, whose 400 body carries errorcode 10006.)
            testUtils.mockRESTError(
                '/legacy/v1/beta/mobile/message/doesNotExist',
                400,
                undefined,
                'get'
            );
            // WHEN
            await handler.retrieve('testInstance/testBU', ['mobileMessage'], ['doesNotExist']);
            // THEN
            assert.equal(
                process.exitCode,
                0,
                'retrieve should not have thrown an error despite the 400 on the by-key endpoint'
            );
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.mobileMessage ? Object.keys(result.mobileMessage).length : 0,
                0,
                'no mobileMessage expected because the requested key does not exist'
            );
            // 3 dependency-cache GETs (mobileCode, mobileKeyword, campaign) + 1 failing by-key GET
            assert.equal(
                testUtils.getAPIHistoryLength(),
                4,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Deploy ================', () => {
        beforeEach(() => {
            testUtils.mockSetup(true);
        });

        it('Should create & update items', async () => {
            // WHEN
            await handler.deploy('testInstance/testBU', ['mobileMessage']);
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.mobileMessage ? Object.keys(result.mobileMessage).length : 0,
                2,
                '2 mobileMessages expected'
            );
            // confirm created item
            assert.deepEqual(
                await testUtils.getActualJson('NTQ3Ojc4OjA', 'mobileMessage'),
                await testUtils.getExpectedJson('9999999', 'mobileMessage', 'post-create'),
                'returned JSON was not equal expected for insert mobileMessage'
            );
            expect(await testUtils.getActualFile('NTQ3Ojc4OjA', 'mobileMessage', 'amp')).to.equal(
                await testUtils.getExpectedFile('9999999', 'mobileMessage', 'post-create', 'amp')
            );
            let staleSourceFileExists = true;
            try {
                await testUtils.getActualJson('new', 'mobileMessage');
            } catch {
                staleSourceFileExists = false;
            }
            assert.equal(
                staleSourceFileExists,
                false,
                'the stale source-id file must not remain after the server returns the target-BU id'
            );

            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('NTIzOjc4OjA', 'mobileMessage'),
                await testUtils.getExpectedJson('9999999', 'mobileMessage', 'post-update'), // watch out - mobileMessage api wants put instead of patch for updates
                'returned JSON was not equal expected for update mobileMessage'
            );
            expect(await testUtils.getActualFile('NTIzOjc4OjA', 'mobileMessage', 'amp')).to.equal(
                await testUtils.getExpectedFile('9999999', 'mobileMessage', 'post-update', 'amp')
            );

            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                8,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should NOT change the key during update with --changeKeyValue and instead fail due to missing support', async () => {
            // WHEN
            handler.setOptions({ changeKeyValue: 'updatedKey' });
            await handler.deploy('testInstance/testBU', ['mobileMessage'], ['NTIzOjc4OjA']);
            // THEN
            assert.equal(
                process.exitCode,
                1,
                'deploy should have thrown an error due to lack of support'
            );
            return;
        });

        it('Should deploy a key miss with one name match as an item POST update', async () => {
            const sourcePath =
                'deploy/testInstance/testBU/mobileMessage/new.mobileMessage-meta.json';
            const source = await fs.readJson(sourcePath);
            source.name = 'testExisting_mobileMessage';
            await fs.writeJson(sourcePath, source);

            const deploy = await handler.deploy('testInstance/testBU', ['mobileMessage'], ['new']);

            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            assert.deepEqual(
                Object.keys(deploy['testInstance/testBU']?.mobileMessage || {}),
                ['NTIzOjc4OjA'],
                'real handler result should use the target-BU id'
            );
            const history = testUtils.getAPIHistory();
            const messagePosts = (history.post || []).filter((request) =>
                request.url.startsWith('/legacy/v1/beta/mobile/message/')
            );
            assert.deepEqual(
                messagePosts.map((request) => request.url),
                ['/legacy/v1/beta/mobile/message/NTIzOjc4OjA'],
                'unique name fallback should issue one item POST update'
            );
            assert.lengthOf(
                messagePosts.filter((request) => request.url === '/legacy/v1/beta/mobile/message/'),
                0,
                'unique name fallback must not issue a collection POST create'
            );
            assert.equal(
                (await testUtils.getActualJson('NTIzOjc4OjA', 'mobileMessage')).id,
                'NTIzOjc4OjA',
                'persisted metadata should retain the target-BU id'
            );
            let staleSourceFileExists = true;
            try {
                await testUtils.getActualJson('new', 'mobileMessage');
            } catch {
                staleSourceFileExists = false;
            }
            assert.isFalse(staleSourceFileExists, 'stale source-id metadata must be removed');
        });

        it('Should prefer an existing key over a different target name match', async () => {
            const fixturePath =
                'test/resources/9999999/legacy/v1/beta/mobile/message/get-response.json';
            const fixture = await fs.readJson(fixturePath);
            fixture.entry.push({
                ...fixture.entry[0],
                id: 'nameSelectedMessageId',
                name: 'Portable SMS Name',
            });
            fixture.totalResults = fixture.entry.length;
            await fs.writeJson(fixturePath, fixture);

            const sourcePath =
                'deploy/testInstance/testBU/mobileMessage/NTIzOjc4OjA.mobileMessage-meta.json';
            const source = await fs.readJson(sourcePath);
            source.name = 'Portable SMS Name';
            await fs.writeJson(sourcePath, source);

            const deploy = await handler.deploy(
                'testInstance/testBU',
                ['mobileMessage'],
                ['NTIzOjc4OjA']
            );

            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            assert.deepEqual(
                Object.keys(deploy['testInstance/testBU']?.mobileMessage || {}),
                ['NTIzOjc4OjA'],
                'real handler result should retain the key-selected target id'
            );
            const messagePosts = (testUtils.getAPIHistory().post || []).filter((request) =>
                request.url.startsWith('/legacy/v1/beta/mobile/message/')
            );
            assert.deepEqual(
                messagePosts.map((request) => request.url),
                ['/legacy/v1/beta/mobile/message/NTIzOjc4OjA'],
                'item POST must target the key-selected record only'
            );
            assert.notInclude(
                messagePosts.map((request) => request.url),
                '/legacy/v1/beta/mobile/message/nameSelectedMessageId',
                'name-selected record must not receive an update'
            );
            assert.lengthOf(
                messagePosts.filter((request) => request.url === '/legacy/v1/beta/mobile/message/'),
                0,
                'key-first update must not issue a collection POST create'
            );
        });

        it('Should emit the standard skipping error for ambiguous standalone mobileMessage deploys', async () => {
            const fixturePath =
                'test/resources/9999999/legacy/v1/beta/mobile/message/get-response.json';
            const fixture = await fs.readJson(fixturePath);
            fixture.entry = [
                { ...fixture.entry[0], id: 'duplicateMessageOne', name: 'Duplicate SMS' },
                { ...fixture.entry[0], id: 'duplicateMessageTwo', name: 'Duplicate SMS' },
            ];
            fixture.totalResults = fixture.entry.length;
            await fs.writeJson(fixturePath, fixture);

            const sourcePath =
                'deploy/testInstance/testBU/mobileMessage/new.mobileMessage-meta.json';
            const source = await fs.readJson(sourcePath);
            source.name = 'Duplicate SMS';
            await fs.writeJson(sourcePath, source);

            const errors = [];
            const warnings = [];
            const originalError = Util.logger.error;
            const originalWarn = Util.logger.warn;
            /**
             * Captures upsert errors while preserving the configured logger behavior.
             *
             * @param {unknown} message logger message
             * @returns {import('winston').Logger} logger instance
             */
            Util.logger.error = function (message) {
                errors.push(String(message));
                return originalError.call(this, message);
            };
            /**
             * Captures retrieve warnings while preserving the configured logger behavior.
             *
             * @param {unknown} message logger message
             * @returns {import('winston').Logger} logger instance
             */
            Util.logger.warn = function (message) {
                warnings.push(String(message));
                return originalWarn.call(this, message);
            };
            try {
                await handler.deploy('testInstance/testBU', ['mobileMessage'], ['new']);
            } finally {
                Util.logger.error = originalError;
                Util.logger.warn = originalWarn;
            }
            assert.equal(process.exitCode, 1, 'deploy should have set an error exit code');
            assert.lengthOf(
                warnings.filter((message) => message.includes('name "Duplicate SMS" is used by')),
                0,
                'deploy cache retrieval must not emit the explicit-retrieve duplicate-name warning'
            );

            const emittedError = errors.join('\n');
            assert.include(
                emittedError,
                'skipping mobileMessage new / Duplicate SMS:',
                'error should use the standard item-level skipping message'
            );
            assert.include(
                emittedError,
                'name "Duplicate SMS" matches multiple target-BU mobileMessage items',
                'reason should identify the target-BU name ambiguity'
            );
            assert.include(emittedError, 'duplicateMessageOne');
            assert.include(emittedError, 'duplicateMessageTwo');
            assert.include(
                emittedError,
                'Clean up the duplicate names on the target BU before deploying'
            );
            const history = testUtils.getAPIHistory();
            assert.lengthOf(
                (history.post || []).filter((request) =>
                    request.url.startsWith('/legacy/v1/beta/mobile/message/')
                ),
                0,
                'ambiguity must prevent every mobileMessage create write'
            );
            assert.lengthOf(
                (history.put || []).filter((request) =>
                    request.url.startsWith('/legacy/v1/beta/mobile/message/')
                ),
                0,
                'ambiguity must prevent every mobileMessage update write'
            );
        });

        it('Should hard-error ambiguous MobileMessage names before create or update orchestration', async () => {
            cache.initCache({ mid: 9999999, eid: 1111111 });
            cache.setMetadata('mobileMessage', {
                targetOne: { id: 'targetOne', name: 'Duplicate SMS' },
                targetTwo: { id: 'targetTwo', name: 'Duplicate SMS' },
            });
            const metadataMap = {
                sourceMessage: { id: 'sourceMessage', name: 'Duplicate SMS' },
            };
            const creates = [];
            const updates = [];

            let duplicateError;
            try {
                await MobileMessage.createOrUpdate(
                    metadataMap,
                    'sourceMessage',
                    false,
                    updates,
                    creates
                );
            } catch (ex) {
                duplicateError = ex;
            }

            assert.include(duplicateError?.message, 'targetOne');
            assert.include(duplicateError?.message, 'targetTwo');
            assert.equal(creates.length, 0, 'ambiguity must stop before any create is queued');
            assert.equal(updates.length, 0, 'ambiguity must stop before any update is queued');
        });

        it('Should orchestrate a MobileMessage key and name miss as a create', async () => {
            cache.initCache({ mid: 9999999, eid: 1111111 });
            cache.setMetadata('mobileMessage', {});
            const metadataMap = {
                sourceMessage: { id: 'sourceMessage', name: 'New Portable SMS' },
            };
            const creates = [];
            const updates = [];

            const action = await MobileMessage.createOrUpdate(
                metadataMap,
                'sourceMessage',
                false,
                updates,
                creates
            );

            assert.equal(action, 'create');
            assert.equal(creates.length, 1, 'zero matches must queue one create');
            assert.equal(updates.length, 0, 'zero matches must queue zero updates');
            assert.equal(creates[0].id, 'sourceMessage');
        });

        it('Should match top-level mobileMessage names only when exactly one target item exists', () => {
            cache.initCache({ mid: 9999999, eid: 1111111 });
            cache.setMetadata('mobileMessage', {
                targetOne: { id: 'targetOne', name: 'portableName' },
            });
            assert.equal(
                MobileMessage.getCacheMatchedByName({ id: 'sourceId', name: 'portableName' }).id,
                'targetOne',
                'one name match should return the target-BU item'
            );
            assert.equal(
                MobileMessage.getCacheMatchedByName({ id: 'sourceId', name: 'missingName' }),
                null,
                'zero name matches should return null so createOrUpdate can create'
            );

            cache.setMetadata('mobileMessage', {
                targetOne: { id: 'targetOne', name: 'portableName' },
                targetTwo: { id: 'targetTwo', name: 'portableName' },
            });
            let duplicateError;
            try {
                MobileMessage.getCacheMatchedByName({
                    id: 'sourceId',
                    name: 'portableName',
                });
            } catch (ex) {
                duplicateError = ex;
            }
            assert.include(duplicateError?.message, 'targetOne');
            assert.include(duplicateError?.message, 'targetTwo');
        });

        it('Should not name-match unnamed top-level mobileMessage items', () => {
            const unnamedValues = [undefined, null, ''];
            for (const deployedName of unnamedValues) {
                for (const cachedCount of [1, 2]) {
                    cache.initCache({ mid: 9999999, eid: 1111111 });
                    cache.setMetadata('mobileMessage', {
                        cachedOne: { id: 'cachedOne', name: deployedName },
                        ...(cachedCount === 2
                            ? { cachedTwo: { id: 'cachedTwo', name: deployedName } }
                            : {}),
                    });
                    assert.equal(
                        MobileMessage.getCacheMatchedByName({
                            id: 'sourceId',
                            name: deployedName,
                        }),
                        null,
                        `${cachedCount} cached item(s) with unnamed value ${String(deployedName)} should use base zero-match behavior`
                    );
                }
            }
        });
    });

    describe('Templating ================', () => {
        it('Should create a mobileMessage template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['mobileMessage']);
            // buildTemplate
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'mobileMessage',
                ['NTIzOjc4OjA'],
                ['testSourceMarket']
            );
            assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');

            assert.equal(
                result.mobileMessage ? Object.keys(result.mobileMessage).length : 0,
                1,
                'only one mobileMessage expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson('NTIzOjc4OjA', 'mobileMessage'),
                await testUtils.getExpectedJson('9999999', 'mobileMessage', 'template'),
                'returned template JSON was not equal expected'
            );
            expect(
                await testUtils.getActualTemplateFile('NTIzOjc4OjA', 'mobileMessage', 'amp')
            ).to.equal(
                await testUtils.getExpectedFile('9999999', 'mobileMessage', 'template', 'amp')
            );

            // buildDefinition
            await handler.buildDefinition(
                'testInstance/testBU',
                'mobileMessage',
                ['NTIzOjc4OjA'],
                ['testTargetMarket']
            );
            assert.equal(process.exitCode, 0, 'buildDefinition should not have thrown an error');
            assert.deepEqual(
                await testUtils.getActualDeployJson('NTIzOjc4OjA', 'mobileMessage'),
                await testUtils.getExpectedJson('9999999', 'mobileMessage', 'build'),
                'returned deployment JSON was not equal expected'
            );
            expect(
                await testUtils.getActualDeployFile('NTIzOjc4OjA', 'mobileMessage', 'amp')
            ).to.equal(await testUtils.getExpectedFile('9999999', 'mobileMessage', 'build', 'amp'));

            assert.equal(
                testUtils.getAPIHistoryLength(),
                4,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Delete ================', () => {
        it('Should delete the item', async () => {
            // WHEN
            const isDeleted = await handler.deleteByKey(
                'testInstance/testBU',
                'mobileMessage',
                'NTIzOjc4OjA'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'delete should not have thrown an error');

            assert.equal(isDeleted, true, 'should have deleted the item');
            return;
        });
    });

    describe('CI/CD ================', () => {
        it('Should return a list of files based on their type and key', async () => {
            // WHEN
            const fileList = await handler.getFilesToCommit(
                'testInstance/testBU',
                'mobileMessage',
                ['NTIzOjc4OjA']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'getFilesToCommit should not have thrown an error');
            assert.equal(fileList.length, 2, 'expected only 2 file paths');

            assert.equal(
                fileList[0].split('\\').join('/'),
                'retrieve/testInstance/testBU/mobileMessage/NTIzOjc4OjA.mobileMessage-meta.json',
                'wrong JSON path'
            );
            assert.equal(
                fileList[1].split('\\').join('/'),
                'retrieve/testInstance/testBU/mobileMessage/NTIzOjc4OjA.mobileMessage-meta.amp',
                'wrong AMP path'
            );
            return;
        });
    });
});
