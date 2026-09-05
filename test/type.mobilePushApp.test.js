import * as chai from 'chai';
const assert = chai.assert;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);

describe('type: mobilePushApp', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });

    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve all mobilePushApps', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['mobilePushApp']);
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.mobilePushApp ? Object.keys(result.mobilePushApp).length : 0,
                3,
                'three mobilePushApps expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson(
                    'ZmRVQWZaUU5YVXFGdmJVYVI3b2JudzoxMTc6MA',
                    'mobilePushApp'
                ),
                await testUtils.getExpectedJson('9999999', 'mobilePushApp', 'get'),
                'returned JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                1,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should retrieve one mobilePushApp by key', async () => {
            // WHEN
            await handler.retrieve(
                'testInstance/testBU',
                ['mobilePushApp'],
                ['ZmRVQWZaUU5YVXFGdmJVYVI3b2JudzoxMTc6MA']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            assert.deepEqual(
                await testUtils.getActualJson(
                    'ZmRVQWZaUU5YVXFGdmJVYVI3b2JudzoxMTc6MA',
                    'mobilePushApp'
                ),
                await testUtils.getExpectedJson('9999999', 'mobilePushApp', 'get'),
                'returned JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                1,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should gracefully handle retrieving a non-existent mobilePushApp by key (API returns 400 Validation Error 10006) and download 0 instead of hard-failing', async () => {
            // GIVEN a key that does not exist, GET /push/v1/application/<key> returns HTTP 400 with body
            // { message: "Validation Error", errorcode: 10006 }; sfmc-sdk's RestError maps that to
            // code === 10006 (number). The bodyFixture faithfully reproduces the real API body so the
            // real RestError mapping is exercised (not a hand-set code bypass).
            testUtils.mockRESTError(
                '/push/v1/application/doesNotExist',
                400,
                undefined,
                'get',
                undefined,
                'rest400-validationError-response.json'
            );
            // WHEN
            await handler.retrieve('testInstance/testBU', ['mobilePushApp'], ['doesNotExist']);
            // THEN
            assert.equal(
                process.exitCode,
                0,
                'retrieve should not have thrown an error despite the 400 on the by-key endpoint'
            );
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.mobilePushApp ? Object.keys(result.mobilePushApp).length : 0,
                0,
                'no mobilePushApp expected because the requested key does not exist'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                1,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('CI/CD ================', () => {
        it('Should return a list of files based on their type and key', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['mobilePushApp']);
            const fileList = await handler.getFilesToCommit(
                'testInstance/testBU',
                'mobilePushApp',
                ['ZmRVQWZaUU5YVXFGdmJVYVI3b2JudzoxMTc6MA']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'getFilesToCommit should not have thrown an error');
            assert.equal(fileList.length, 1, 'expected only 1 file to be returned');
            assert.equal(
                fileList[0].split('\\').join('/'),
                'retrieve/testInstance/testBU/mobilePushApp/ZmRVQWZaUU5YVXFGdmJVYVI3b2JudzoxMTc6MA.mobilePushApp-meta.json',
                'wrong file path returned'
            );
            return;
        });
    });
});
