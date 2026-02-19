import * as chai from 'chai';
const assert = chai.assert;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);

describe('type: dataFilter', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });

    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a dataFilter', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['dataFilter']);
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.dataFilter ? Object.keys(result.dataFilter).length : 0,
                1,
                'unexpected number of items retrieved'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_dataFilter', 'dataFilter'),
                await testUtils.getExpectedJson('9999999', 'dataFilter', 'get'),
                'returned JSON was not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                6,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should retrieve a dataFilter by key', async () => {
            // WHEN
            await handler.retrieve(
                'testInstance/testBU',
                ['dataFilter'],
                ['testExisting_dataFilter']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.dataFilter ? Object.keys(result.dataFilter).length : 0,
                1,
                'only one dataFilter expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_dataFilter', 'dataFilter'),
                await testUtils.getExpectedJson('9999999', 'dataFilter', 'get'),
                'returned JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                7,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Deploy ================', () => {
        beforeEach(() => {
            testUtils.mockSetup(true);
        });

        it('Should create & upsert a dataFilter', async () => {
            // WHEN

            const deployed = await handler.deploy('testInstance/testBU', ['dataFilter']);
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.dataFilter ? Object.keys(result.dataFilter).length : 0,
                2,
                'unexpected number of dataFilters in cache'
            );
            assert.equal(
                deployed?.['testInstance/testBU']?.dataFilter
                    ? Object.keys(deployed['testInstance/testBU'].dataFilter).length
                    : 0,
                2,
                'unexpected number of dataFilters deployed'
            );

            // confirm created item
            assert.deepEqual(
                await testUtils.getActualJson('testNew_dataFilter', 'dataFilter'),
                await testUtils.getExpectedJson('9999999', 'dataFilter', 'post'),
                'returned new-JSON was not equal expected for insert dataFilter'
            );
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_dataFilter', 'dataFilter'),
                await testUtils.getExpectedJson('9999999', 'dataFilter', 'patch'),
                'returned existing-JSON was not equal expected for update dataFilter'
            );
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                8,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Templating ================', () => {
        it('Should create a dataFilter template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['dataFilter']);
            // buildTemplate
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'dataFilter',
                ['testExisting_dataFilter'],
                ['testSourceMarket']
            );
            assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');
            assert.equal(
                result.dataFilter ? Object.keys(result.dataFilter).length : 0,
                1,
                'only one dataFilter expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson('testExisting_dataFilter', 'dataFilter'),
                await testUtils.getExpectedJson('9999999', 'dataFilter', 'template'),
                'returned template JSON was not equal expected'
            );
            // buildDefinition
            await handler.buildDefinition(
                'testInstance/testBU',
                'dataFilter',
                ['testExisting_dataFilter'],
                ['testTargetMarket']
            );
            assert.equal(process.exitCode, 0, 'buildDefinition should not have thrown an error');
            assert.deepEqual(
                await testUtils.getActualDeployJson('testTemplated_dataFilter', 'dataFilter'),
                await testUtils.getExpectedJson('9999999', 'dataFilter', 'build'),
                'returned deployment JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                6,
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
                'dataFilter',
                'testExisting_dataFilter'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deleteByKey should not have thrown an error');
            assert.equal(isDeleted, true, 'deleteByKey should have returned true');
            return;
        });
    });
});
