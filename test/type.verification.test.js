import chai, { assert } from 'chai';
import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);

describe('type: verification', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });
    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a verification', async () => {
            // WHEN
            const retrieved = await handler.retrieve('testInstance/testBU', ['verification']);
            // THEN
            assert.equal(process.exitCode, false, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.verification ? Object.keys(result.verification).length : 0,
                6,
                'only 6 verifications expected'
            );
            assert.equal(
                retrieved['testInstance/testBU']?.verification
                    ? Object.keys(retrieved['testInstance/testBU']?.verification).length
                    : 0,
                6,
                '6 verifications to be retrieved'
            );

            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_39f6a488-20eb-4ba0-b0b9',
                    'verification'
                ),
                await testUtils.getExpectedJson('9999999', 'verification', 'get'),
                'returned JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                29,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
    describe('Deploy ================', () => {
        beforeEach(() => {
            testUtils.mockSetup(true);
        });
        it('Should create & upsert a verification', async () => {
            // WHEN

            const deployed = await handler.deploy('testInstance/testBU', ['verification']);
            // THEN
            assert.equal(process.exitCode, false, 'deploy should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.verification ? Object.keys(result.verification).length : 0,
                7,
                '7 verifications expected'
            );
            assert.equal(
                deployed['testInstance/testBU']?.verification
                    ? Object.keys(deployed['testInstance/testBU']?.verification).length
                    : 0,
                2,
                '2 verifications to be deployed'
            );
            // confirm created item
            assert.deepEqual(
                await testUtils.getActualJson('testNew_RANDOM_NEW_GUID', 'verification'),
                await testUtils.getExpectedJson('9999999', 'verification', 'post'),
                'returned new-JSON was not equal expected for insert verification'
            );
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_39f6a488-20eb-4ba0-b0b9',
                    'verification'
                ),
                await testUtils.getExpectedJson('9999999', 'verification', 'patch'),
                'returned existing-JSON was not equal expected for update verification'
            );
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                31,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
    describe('Templating ================', () => {
        it('Should create a verification template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['verification']);
            // buildTemplate
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'verification',
                ['testExisting_39f6a488-20eb-4ba0-b0b9'],
                'testSourceMarket'
            );
            assert.equal(process.exitCode, false, 'buildTemplate should not have thrown an error');
            assert.equal(
                result.verification ? Object.keys(result.verification).length : 0,
                1,
                'only one verification expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson(
                    'testExisting_39f6a488-20eb-4ba0-b0b9',
                    'verification'
                ),
                await testUtils.getExpectedJson('9999999', 'verification', 'template'),
                'returned template JSON was not equal expected'
            );
            // buildDefinition
            await handler.buildDefinition(
                'testInstance/testBU',
                'verification',
                'testExisting_39f6a488-20eb-4ba0-b0b9',
                'testTargetMarket'
            );
            assert.equal(
                process.exitCode,
                false,
                'buildDefinition should not have thrown an error'
            );
            assert.deepEqual(
                await testUtils.getActualDeployJson(
                    'testTemplated_39f6a488-20eb-4ba0-b0b9',
                    'verification'
                ),
                await testUtils.getExpectedJson('9999999', 'verification', 'build'),
                'returned deployment JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                29,
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
                'verification',
                'testExisting_39f6a488-20eb-4ba0-b0b9'
            );
            // THEN
            assert.equal(
                process.exitCode,
                0,
                'deleteByKey should have thrown an error due to lack of support'
            );
            assert.equal(isDeleted, true, 'deleteByKey should have returned true for success');
            return;
        });
    });
    describe('UpdateNotifications ================', () => {
        beforeEach(() => {
            testUtils.mockSetup(true);
        });
        it('Should update notification email', async () => {
            handler.setOptions({ completionEmail: 'test@test.com' });
            // WHEN
            const updatedNotifications = await handler.updateNotifications(
                'testInstance/testBU',
                'verification',
                ['testExisting_verification_updateNotificationsEmail']
            );
            // THEN
            assert.equal(process.exitCode, false, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.verification ? Object.keys(result.verification).length : 0,
                6,
                'only 6 verification expected'
            );
            assert.equal(
                updatedNotifications['testInstance/testBU'].length,
                1,
                'one automation key expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_verification_updateNotificationsEmail',
                    'verification'
                ),
                await testUtils.getExpectedJson(
                    '9999999',
                    'verification',
                    'updateNotificationsEmail'
                ),
                'returned metadata was not equal expected for update query'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                34,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should update notification note', async () => {
            handler.setOptions({ completionNote: 'test' });
            // WHEN
            const updatedNotifications = await handler.updateNotifications(
                'testInstance/testBU',
                'verification',
                ['testExisting_verification_updateNotificationsNote']
            );
            // THEN
            assert.equal(process.exitCode, false, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.verification ? Object.keys(result.verification).length : 0,
                6,
                'only 6 verifications expected'
            );
            assert.equal(
                updatedNotifications['testInstance/testBU'].length,
                1,
                'one automation key expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_verification_updateNotificationsNote',
                    'verification'
                ),
                await testUtils.getExpectedJson(
                    '9999999',
                    'verification',
                    'updateNotificationsNote'
                ),
                'returned JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                34,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should NOT update notification email', async () => {
            handler.setOptions({ completionEmail: 'notAnEmail' });
            // WHEN
            const updatedNotifications = await handler.updateNotifications(
                'testInstance/testBU',
                'verification',
                ['testExisting_verification_NOTupdateNotificationsEmail']
            );
            // THEN
            assert.equal(process.exitCode, false, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.verification ? Object.keys(result.verification).length : 0,
                6,
                'only 6 verification expected'
            );
            assert.equal(
                updatedNotifications['testInstance/testBU'].length,
                1,
                'one automation key expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_verification_NOTupdateNotificationsEmail',
                    'verification'
                ),
                await testUtils.getExpectedJson(
                    '9999999',
                    'verification',
                    'NOTupdateNotificationsEmail'
                ),
                'returned metadata was not equal expected for update query'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                34,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should NOT update notification note', async () => {
            handler.setOptions({ completionNote: 'test' });
            // WHEN
            const updatedNotifications = await handler.updateNotifications(
                'testInstance/testBU',
                'verification',
                ['testExisting_verification_NOTupdateNotificationsNote']
            );
            // THEN
            assert.equal(process.exitCode, false, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.verification ? Object.keys(result.verification).length : 0,
                1,
                'only 1 verifications expected'
            );
            assert.equal(
                updatedNotifications['testInstance/testBU'].length,
                0,
                '0 automation key expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                4,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should clear notifications', async () => {
            handler.setOptions({ clear: 'true' });
            // WHEN
            const updatedNotifications = await handler.updateNotifications(
                'testInstance/testBU',
                'verification',
                ['testExisting_verification_clear']
            );
            // THEN
            assert.equal(process.exitCode, false, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.verification ? Object.keys(result.verification).length : 0,
                6,
                'only 6 verifications expected'
            );
            assert.equal(
                updatedNotifications['testInstance/testBU'].length,
                1,
                '1 automation key expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_verification_clear', 'verification'),
                await testUtils.getExpectedJson('9999999', 'verification', 'clear'),
                'returned metadata was not equal expected for update query'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                34,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
});
