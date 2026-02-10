import * as chai from 'chai';
const assert = chai.assert;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);

describe('type: filter', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });

    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a filter', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['filter']);
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.filter ? Object.keys(result.filter).length : 0,
                1,
                'unexpected number of items retrieved'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_filter', 'filter'),
                await testUtils.getExpectedJson('9999999', 'filter', 'get'),
                'returned JSON was not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                14,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should retrieve a filter by key', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['filter'], ['testExisting_filter']);
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.filter ? Object.keys(result.filter).length : 0,
                1,
                'only one filter expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_filter', 'filter'),
                await testUtils.getExpectedJson('9999999', 'filter', 'get'),
                'returned JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                15,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Deploy ================', () => {
        beforeEach(() => {
            testUtils.mockSetup(true);
        });

        it('Should create & upsert a filter', async () => {
            // WHEN

            const deployed = await handler.deploy('testInstance/testBU', ['filter']);
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.filter ? Object.keys(result.filter).length : 0,
                2,
                'unexpected number of filters in cache'
            );
            assert.equal(
                deployed?.['testInstance/testBU']?.filter
                    ? Object.keys(deployed['testInstance/testBU'].filter).length
                    : 0,
                2,
                'unexpected number of filters deployed'
            );
            // confirm created item
            assert.deepEqual(
                await testUtils.getActualJson('testNew_filter', 'filter'),
                await testUtils.getExpectedJson('9999999', 'filter', 'post'),
                'returned new-JSON was not equal expected for insert filter'
            );
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_filter', 'filter'),
                await testUtils.getExpectedJson('9999999', 'filter', 'patch'),
                'returned existing-JSON was not equal expected for update filter'
            );
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                17,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Templating ================', () => {
        it('Should create a filter template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['filter']);
            // buildTemplate
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'filter',
                ['testExisting_filter'],
                ['testSourceMarket']
            );
            assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');
            assert.equal(
                result.filter ? Object.keys(result.filter).length : 0,
                1,
                'only one filter expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson('testExisting_filter', 'filter'),
                await testUtils.getExpectedJson('9999999', 'filter', 'template'),
                'returned template JSON was not equal expected'
            );
            // buildDefinition
            await handler.buildDefinition(
                'testInstance/testBU',
                'filter',
                ['testExisting_filter'],
                ['testTargetMarket']
            );
            assert.equal(process.exitCode, 0, 'buildDefinition should not have thrown an error');
            assert.deepEqual(
                await testUtils.getActualDeployJson('testTemplated_filter', 'filter'),
                await testUtils.getExpectedJson('9999999', 'filter', 'build'),
                'returned deployment JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                14,
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
                'filter',
                'testExisting_filter'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deleteByKey should not have thrown an error');
            assert.equal(isDeleted, true, 'deleteByKey should have returned true');
            return;
        });
    });
});
