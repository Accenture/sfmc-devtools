import chai, { assert } from 'chai';
import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);

describe('type: triggeredSend', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });
    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a triggeredSend', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['triggeredSend']);
            // THEN
            assert.equal(process.exitCode, false, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.triggeredSend ? Object.keys(result.triggeredSend).length : 0,
                1,
                'only one triggeredSend expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_triggeredSend', 'triggeredSend'),
                await testUtils.getExpectedJson('9999999', 'triggeredSend', 'get'),
                'returned JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                10,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
    describe('Deploy ================', () => {
        beforeEach(() => {
            testUtils.mockSetup(true);
        });
        it('Should create & upsert a triggeredSend', async () => {
            // WHEN
            await handler.deploy('testInstance/testBU', ['triggeredSend']);
            // THEN
            assert.equal(process.exitCode, false, 'deploy should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.triggeredSend ? Object.keys(result.triggeredSend).length : 0,
                2,
                'two triggeredSends expected'
            );
            // confirm created item
            assert.deepEqual(
                await testUtils.getActualJson('testNew_triggeredSend', 'triggeredSend'),
                await testUtils.getExpectedJson('9999999', 'triggeredSend', 'post'),
                'returned JSON was not equal expected for insert triggeredSend'
            );
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_triggeredSend', 'triggeredSend'),
                await testUtils.getExpectedJson('9999999', 'triggeredSend', 'patch'),
                'returned JSON was not equal expected for update triggeredSend'
            );
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                12,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
    describe('Templating ================', () => {
        it('Should create a triggeredSend template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['triggeredSend']);
            // buildTemplate
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'triggeredSend',
                ['testExisting_triggeredSend'],
                'testSourceMarket'
            );
            assert.equal(process.exitCode, false, 'buildTemplate should not have thrown an error');
            assert.equal(
                result.triggeredSend ? Object.keys(result.triggeredSend).length : 0,
                1,
                'only one triggeredSend expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson(
                    'testExisting_triggeredSend',
                    'triggeredSend'
                ),
                await testUtils.getExpectedJson('9999999', 'triggeredSend', 'template'),
                'returned template JSON was not equal expected'
            );
            // buildDefinition
            await handler.buildDefinition(
                'testInstance/testBU',
                'triggeredSend',
                'testExisting_triggeredSend',
                'testTargetMarket'
            );
            assert.equal(
                process.exitCode,
                false,
                'buildDefinition should not have thrown an error'
            );
            assert.deepEqual(
                await testUtils.getActualDeployJson('testTemplated_triggeredSend', 'triggeredSend'),
                await testUtils.getExpectedJson('9999999', 'triggeredSend', 'build'),
                'returned deployment JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                10,
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
                'triggeredSend',
                'testExisting_triggeredSend'
            );
            // THEN
            assert.equal(process.exitCode, false, 'delete should not have thrown an error');

            assert.equal(isDeleted, true, 'should have deleted the item');
            return;
        });
    });
    describe('Refresh ================', () => {
        it('Should refresh a triggeredSend by key');
    });
    describe('Start (Execute) ================', () => {
        it('Should start a triggeredSend by key');
    });
    describe('Pause ================', () => {
        it('Should pause a triggeredSend by key');
    });
});
