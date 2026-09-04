import * as chai from 'chai';
const assert = chai.assert;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
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
            assert.equal(
                testUtils.getAPIHistoryLength(),
                3,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
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
            await handler.deploy('testInstance/testBU', ['mobilePush'], ['test_mobilePush_DEV']);
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            // confirm created item (the API assigns a new id which becomes the key)
            assert.deepEqual(
                await testUtils.getActualJson('MTY2OjExNDow', 'mobilePush'),
                await testUtils.getExpectedJson('9999999', 'mobilePush', 'post'),
                'returned JSON was not equal expected for insert mobilePush'
            );
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                4,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
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
