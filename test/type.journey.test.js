import * as chai from 'chai';
const assert = chai.assert;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);

describe('type: journey', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });

    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a journey', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['journey']);
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.journey ? Object.keys(result.journey).length : 0,
                2,
                'only 2 journeys expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_interaction', 'journey'),
                await testUtils.getExpectedJson('9999999', 'journey', 'get'),
                'returned JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                13,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Deploy ================', () => {
        beforeEach(() => {
            testUtils.mockSetup(true);
        });

        it('Should create & upsert a journey', async () => {
            // WHEN
            await handler.deploy('testInstance/testBU', ['journey']);
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.journey ? Object.keys(result.journey).length : 0,
                3,
                '3 journeys expected'
            );
            // confirm created item
            assert.deepEqual(
                await testUtils.getActualJson('testNew_interaction', 'journey'),
                await testUtils.getExpectedJson('9999999', 'journey', 'post'),
                'returned JSON was not equal expected for insert journey'
            );

            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_interaction', 'journey'),
                await testUtils.getExpectedJson('9999999', 'journey', 'put'), // watch out - journey api wants put instead of patch for updates
                'returned JSON was not equal expected for update journey'
            );

            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                11,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should NOT change the key during update with --changeKeyValue and instead fail due to missing support', async () => {
            // WHEN
            handler.setOptions({ changeKeyValue: 'updatedKey' });
            await handler.deploy('testInstance/testBU', ['journey'], ['testExisting_interaction']);
            // THEN
            assert.equal(
                process.exitCode,
                1,
                'deploy should have thrown an error due to lack of support'
            );
            return;
        });
    });

    describe('Templating ================', () => {
        it('Should create a journey template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['journey']);
            // buildTemplate
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'journey',
                ['testExisting_interaction'],
                'testSourceMarket'
            );
            assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');
            assert.equal(
                result.journey ? Object.keys(result.journey).length : 0,
                1,
                'only one journey expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson('testExisting_interaction', 'journey'),
                await testUtils.getExpectedJson('9999999', 'journey', 'template'),
                'returned template JSON was not equal expected'
            );

            // buildDefinition
            await handler.buildDefinition(
                'testInstance/testBU',
                'journey',
                'testExisting_interaction',
                'testTargetMarket'
            );
            assert.equal(process.exitCode, 0, 'buildDefinition should not have thrown an error');
            assert.deepEqual(
                await testUtils.getActualDeployJson('testTemplated_interaction', 'journey'),
                await testUtils.getExpectedJson('9999999', 'journey', 'build'),
                'returned deployment JSON was not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                13,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Delete ================', () => {
        it('Should NOT delete the item due to missing version', async () => {
            // WHEN
            const isDeleted = await handler.deleteByKey(
                'testInstance/testBU',
                'journey',
                'testExisting_interaction'
            );
            // THEN
            assert.equal(process.exitCode, true, 'delete should have thrown an error');

            assert.equal(isDeleted, false, 'should not have deleted the item');
            return;
        });

        it('Should NOT delete the item due to unknown version', async () => {
            // WHEN
            const isDeleted = await handler.deleteByKey(
                'testInstance/testBU',
                'journey',
                'testExisting_interaction/2'
            );
            // THEN
            assert.equal(process.exitCode, true, 'delete should have thrown an error');

            assert.equal(isDeleted, false, 'should not have deleted the item');
            return;
        });

        it('Should delete the item with version', async () => {
            // WHEN
            const isDeleted = await handler.deleteByKey(
                'testInstance/testBU',
                'journey',
                'testExisting_interaction/1'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'delete should not have thrown an error');

            assert.equal(isDeleted, true, 'should have deleted the item');
            return;
        });
    });
});
