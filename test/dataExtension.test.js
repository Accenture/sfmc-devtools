import { assert } from 'chai';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';

describe('dataExtension', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });
    afterEach(() => {
        testUtils.mockReset();
    });
    describe('Retrieve ================', () => {
        it('Should retrieve a data extension', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['dataExtension']);
            // THEN
            assert.equal(!!process.exitCode, false, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.dataExtension ? Object.keys(result.dataExtension).length : 0,
                1,
                'only one dataExtension expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('childBU_dataextension_test', 'dataExtension'),
                await testUtils.getExpectedJson('9999999', 'dataExtension', 'retrieve'),

                'returned metadata was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                5,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
    describe('Deploy ================', () => {
        beforeEach(() => {
            testUtils.mockSetup(true);
        });
        it('Should create & upsert a data extension', async () => {
            // WHEN
            await handler.deploy('testInstance/testBU', ['dataExtension']);
            // THEN
            assert.equal(!!process.exitCode, false, 'deploy should not have thrown an error');

            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.dataExtension ? Object.keys(result.dataExtension).length : 0,
                2,
                'two data extensions expected'
            );
            // insert
            assert.deepEqual(
                await testUtils.getActualJson('testDataExtension', 'dataExtension'),
                await testUtils.getExpectedJson('9999999', 'dataExtension', 'create'),
                'returned metadata was not equal expected for create'
            );
            // update
            assert.deepEqual(
                await testUtils.getActualJson('childBU_dataextension_test', 'dataExtension'),
                await testUtils.getExpectedJson('9999999', 'dataExtension', 'update'),
                'returned metadata was not equal expected for update'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                11,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
    describe('Templating ================', () => {
        it('Should create a dataExtension template via retrieveAsTemplate and build it', async () => {
            // GIVEN there is a template
            const result = await handler.retrieveAsTemplate(
                'testInstance/testBU',
                'dataExtension',
                ['childBU_dataextension_test'],
                'testSourceMarket'
            );
            assert.equal(
                !!process.exitCode,
                false,
                'retrieveAsTemplate should not have thrown an error'
            );

            // WHEN
            assert.equal(
                result.dataExtension ? Object.keys(result.dataExtension).length : 0,
                1,
                'only one dataExtension expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson(
                    'childBU_dataextension_test',
                    'dataExtension'
                ),
                await testUtils.getExpectedJson('9999999', 'dataExtension', 'template'),
                'returned template was not equal expected'
            );
            // THEN
            await handler.buildDefinition(
                'testInstance/testBU',
                'dataExtension',
                'childBU_dataextension_test',
                'testTargetMarket'
            );
            assert.equal(
                !!process.exitCode,
                false,
                'buildDefinition should not have thrown an error'
            );
            assert.deepEqual(
                await testUtils.getActualDeployJson(
                    'childBU_dataextension_testTarget',
                    'dataExtension'
                ),
                await testUtils.getExpectedJson('9999999', 'dataExtension', 'build'),
                'returned deployment file was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                5,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should create a dataExtension template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['dataExtension']);
            // GIVEN there is a template
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'dataExtension',
                ['childBU_dataextension_test'],
                'testSourceMarket'
            );
            assert.equal(
                !!process.exitCode,
                false,
                'buildTemplate should not have thrown an error'
            );
            // WHEN
            assert.equal(
                result.dataExtension ? Object.keys(result.dataExtension).length : 0,
                1,
                'only one dataExtension expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson(
                    'childBU_dataextension_test',
                    'dataExtension'
                ),
                await testUtils.getExpectedJson('9999999', 'dataExtension', 'template'),
                'returned template was not equal expected'
            );
            // THEN
            await handler.buildDefinition(
                'testInstance/testBU',
                'dataExtension',
                'childBU_dataextension_test',
                'testTargetMarket'
            );
            assert.equal(
                !!process.exitCode,
                false,
                'buildDefinition should not have thrown an error'
            );

            assert.deepEqual(
                await testUtils.getActualDeployJson(
                    'childBU_dataextension_testTarget',
                    'dataExtension'
                ),
                await testUtils.getExpectedJson('9999999', 'dataExtension', 'build'),
                'returned deployment file was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                5,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
});
