import * as chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);

describe('type: mobileKeyword', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });

    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a mobileKeyword', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['mobileKeyword']);
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.mobileKeyword ? Object.keys(result.mobileKeyword).length : 0,
                1,
                'only 1 mobileKeywords expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson(
                    '4912312345678.TESTEXISTING_KEYWORD',
                    'mobileKeyword'
                ),
                await testUtils.getExpectedJson('9999999', 'mobileKeyword', 'get'),
                'saved JSON was not equal expected'
            );
            expect(
                await testUtils.getActualFile(
                    '4912312345678.TESTEXISTING_KEYWORD',
                    'mobileKeyword',
                    'amp'
                )
            ).to.equal(await testUtils.getExpectedFile('9999999', 'mobileKeyword', 'get', 'amp'));
            assert.equal(
                testUtils.getAPIHistoryLength(),
                2,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should gracefully handle retrieving a non-existent mobileKeyword by key (API returns 400) and download 0 instead of hard-failing', async () => {
            // GIVEN a key that does not exist, GET /legacy/v1/beta/mobile/keyword/<id> returns HTTP
            // 400 with a plain (errorcode-less) body; sfmc-sdk's RestError then falls back to the
            // axios error code, which is 'ERR_BAD_REQUEST' for a <500 status — exactly what
            // MobileKeyword.retrieve's catch guard checks. (The legacy mobile/keyword API differs from
            // the mobilePush REST API, whose 400 body carries errorcode 10006.)
            testUtils.mockRESTError(
                '/legacy/v1/beta/mobile/keyword/doesNotExist',
                400,
                undefined,
                'get'
            );
            // WHEN (id:-prefixed key routes to the by-key GET pathname .../keyword/doesNotExist)
            await handler.retrieve('testInstance/testBU', ['mobileKeyword'], ['id:doesNotExist']);
            // THEN
            assert.equal(
                process.exitCode,
                0,
                'retrieve should not have thrown an error despite the 400 on the by-key endpoint'
            );
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.mobileKeyword ? Object.keys(result.mobileKeyword).length : 0,
                0,
                'no mobileKeyword expected because the requested key does not exist'
            );
            // 1 dependency-cache GET (mobileCode) + 1 failing by-key GET
            assert.equal(
                testUtils.getAPIHistoryLength(),
                2,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Deploy ================', () => {
        beforeEach(() => {
            testUtils.mockSetup(true);
        });

        it('Should create (but not update) a mobileKeyword', async () => {
            // WHEN
            await handler.deploy(
                'testInstance/testBU',
                ['mobileKeyword'],
                ['4912312345678.TESTNEW_KEYWORD']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.mobileKeyword ? Object.keys(result.mobileKeyword).length : 0,
                2,
                '2 mobileKeywords expected'
            );
            // confirm created item
            assert.deepEqual(
                await testUtils.getActualJson('4912312345678.TESTNEW_KEYWORD', 'mobileKeyword'),
                await testUtils.getExpectedJson('9999999', 'mobileKeyword', 'post-create'),
                'returned JSON was not equal expected for insert mobileKeyword'
            );
            expect(
                await testUtils.getActualFile(
                    '4912312345678.TESTNEW_KEYWORD',
                    'mobileKeyword',
                    'amp'
                )
            ).to.equal(
                await testUtils.getExpectedFile('9999999', 'mobileKeyword', 'post-create', 'amp')
            );

            // confirm updated item
            // eslint-disable-next-line no-console
            console.log(
                'Not testing UPDATE because the API only responds with an empty body unless there are errors in the request body'
            );

            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                4,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should not create a mobileKeyword with wrong type', async () => {
            // WHEN
            await handler.deploy(
                'testInstance/testBU',
                ['mobileKeyword'],
                ['4912312345678.TESTNEW_KEYWORD_BLOCKED']
            );
            // THEN
            assert.equal(process.exitCode, 1, 'deploy should have thrown an error');

            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                2,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Templating ================', () => {
        it('Should create a mobileKeyword template via retrieveAsTemplate and build it', async () => {
            // GIVEN there is a template
            const result = await handler.retrieveAsTemplate(
                'testInstance/testBU',
                'mobileKeyword',
                ['4912312345678.TESTEXISTING_KEYWORD'],
                'testSourceMarket'
            );
            // WHEN
            assert.equal(process.exitCode, 0, 'retrieveAsTemplate should not have thrown an error');
            assert.equal(
                result.mobileKeyword ? Object.keys(result.mobileKeyword).length : 0,
                1,
                'only one item expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson(
                    '4912312345678.TESTEXISTING_KEYWORD',
                    'mobileKeyword'
                ),
                await testUtils.getExpectedJson('9999999', 'mobileKeyword', 'template'),
                'returned template JSON was not equal expected'
            );
            expect(
                await testUtils.getActualTemplateFile(
                    '4912312345678.TESTEXISTING_KEYWORD',
                    'mobileKeyword',
                    'amp'
                )
            ).to.equal(
                await testUtils.getExpectedFile('9999999', 'mobileKeyword', 'template', 'amp')
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                2,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should create a mobileKeyword template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['mobileKeyword']);
            // buildTemplate
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'mobileKeyword',
                ['4912312345678.TESTEXISTING_KEYWORD'],
                ['testSourceMarket']
            );
            assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');

            assert.equal(
                result.mobileKeyword ? Object.keys(result.mobileKeyword).length : 0,
                1,
                'only one mobileKeyword expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson(
                    '4912312345678.TESTEXISTING_KEYWORD',
                    'mobileKeyword'
                ),
                await testUtils.getExpectedJson('9999999', 'mobileKeyword', 'template'),
                'returned template JSON was not equal expected'
            );
            expect(
                await testUtils.getActualTemplateFile(
                    '4912312345678.TESTEXISTING_KEYWORD',
                    'mobileKeyword',
                    'amp'
                )
            ).to.equal(
                await testUtils.getExpectedFile('9999999', 'mobileKeyword', 'template', 'amp')
            );

            // buildDefinition
            await handler.buildDefinition(
                'testInstance/testBU',
                'mobileKeyword',
                ['4912312345678.TESTEXISTING_KEYWORD'],
                ['testTargetMarket']
            );
            assert.equal(process.exitCode, 0, 'buildDefinition should not have thrown an error');
            assert.deepEqual(
                await testUtils.getActualDeployJson(
                    '4912312345678.TESTTEMPLATED_KEYWORD',
                    'mobileKeyword'
                ),
                await testUtils.getExpectedJson('9999999', 'mobileKeyword', 'build'),
                'returned deployment JSON was not equal expected'
            );
            expect(
                await testUtils.getActualDeployFile(
                    '4912312345678.TESTTEMPLATED_KEYWORD',
                    'mobileKeyword',
                    'amp'
                )
            ).to.equal(await testUtils.getExpectedFile('9999999', 'mobileKeyword', 'build', 'amp'));

            assert.equal(
                testUtils.getAPIHistoryLength(),
                2,
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
                'mobileKeyword',
                '4912312345678.TESTEXISTING_KEYWORD'
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
                'mobileKeyword',
                ['4912312345678.TESTEXISTING_KEYWORD']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'getFilesToCommit should not have thrown an error');
            assert.equal(fileList.length, 2, 'expected only 2 file paths');

            assert.equal(
                fileList[0].split('\\').join('/'),
                'retrieve/testInstance/testBU/mobileKeyword/4912312345678.TESTEXISTING_KEYWORD.mobileKeyword-meta.json',
                'wrong JSON path'
            );
            assert.equal(
                fileList[1].split('\\').join('/'),
                'retrieve/testInstance/testBU/mobileKeyword/4912312345678.TESTEXISTING_KEYWORD.mobileKeyword-meta.amp',
                'wrong AMP path'
            );
            return;
        });
    });
});
