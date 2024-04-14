import * as chai from 'chai';
const assert = chai.assert;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);

describe('type: senderProfile', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });

    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a senderProfile', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['senderProfile']);
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.senderProfile ? Object.keys(result.senderProfile).length : 0,
                1,
                'only one senderProfile expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_senderProfile', 'senderProfile'),
                await testUtils.getExpectedJson('9999999', 'senderProfile', 'get'),
                'returned JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                1,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Deploy ================', () => {
        beforeEach(() => {
            testUtils.mockSetup(true);
        });

        it('Should create & upsert a senderProfile', async () => {
            // WHEN

            await handler.deploy('testInstance/testBU', ['senderProfile']);
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.senderProfile ? Object.keys(result.senderProfile).length : 0,
                2,
                'two senderProfiles expected'
            );
            // confirm created item
            assert.deepEqual(
                await testUtils.getActualJson('testNew_senderProfile', 'senderProfile'),
                await testUtils.getExpectedJson('9999999', 'senderProfile', 'post'),
                'returned new-JSON was not equal expected for insert senderProfile'
            );
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_senderProfile', 'senderProfile'),
                await testUtils.getExpectedJson('9999999', 'senderProfile', 'patch'),
                'returned existing-JSON was not equal expected for update senderProfile'
            );
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                3,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Templating ================', () => {
        it('Should create a senderProfile template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['senderProfile']);
            // buildTemplate
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'senderProfile',
                ['testExisting_senderProfile'],
                'testSourceMarket'
            );
            assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');
            assert.equal(
                result.senderProfile ? Object.keys(result.senderProfile).length : 0,
                1,
                'only one senderProfile expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson(
                    'testExisting_senderProfile',
                    'senderProfile'
                ),
                await testUtils.getExpectedJson('9999999', 'senderProfile', 'template'),
                'returned template JSON was not equal expected'
            );
            // buildDefinition
            await handler.buildDefinition(
                'testInstance/testBU',
                'senderProfile',
                'testExisting_senderProfile',
                'testTargetMarket'
            );
            assert.equal(process.exitCode, 0, 'buildDefinition should not have thrown an error');
            assert.deepEqual(
                await testUtils.getActualDeployJson('testTemplated_senderProfile', 'senderProfile'),
                await testUtils.getExpectedJson('9999999', 'senderProfile', 'build'),
                'returned deployment JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                1,
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
                'senderProfile',
                'testExisting_senderProfile'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deleteByKey should not have thrown an error');
            assert.equal(isDeleted, true, 'deleteByKey should have returned true');
            return;
        });
    });
});