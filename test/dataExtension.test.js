const assert = require('chai').assert;
const cache = require('../lib/util/cache');
const testUtils = require('./utils');
const handler = require('../lib/index');

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
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.dataExtension ? Object.keys(result.dataExtension).length : 0,
                1,
                'only one dataExtension expected'
            );
            assert.deepEqual(
                await testUtils.getActualFile('childBU_dataextension_test', 'dataExtension'),
                await testUtils.getExpectedFile('9999999', 'dataExtension', 'retrieve'),

                'returned metadata was not equal expected'
            );
            assert.equal(
                Object.values(testUtils.getAPIHistory()).flat().length,
                6,
                'Unexpected number of requests made'
            );
            return;
        });
    });
    describe('Deploy ================', () => {
        it('Should create & upsert a data extension', async () => {
            // WHEN
            await handler.deploy('testInstance/testBU', ['dataExtension']);
            // THEN

            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.dataExtension ? Object.keys(result.dataExtension).length : 0,
                2,
                'two data extensions expected'
            );
            assert.deepEqual(
                await testUtils.getActualFile('testDataExtension', 'dataExtension'),
                await testUtils.getExpectedFile('9999999', 'dataExtension', 'create'),
                'returned metadata was not equal expected for create'
            );
            assert.deepEqual(
                await testUtils.getActualFile('childBU_dataextension_test', 'dataExtension'),
                await testUtils.getExpectedFile('9999999', 'dataExtension', 'update'),
                'returned metadata was not equal expected for update'
            );
            assert.equal(
                Object.values(testUtils.getAPIHistory()).flat().length,
                14,
                'Unexpected number of requests made'
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
                'testMarket'
            );

            // WHEN
            assert.equal(
                result.dataExtension ? Object.keys(result.dataExtension).length : 0,
                1,
                'only one dataExtension expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplate('childBU_dataextension_test', 'dataExtension'),
                await testUtils.getExpectedFile('9999999', 'dataExtension', 'template'),
                'returned template was not equal expected'
            );
            // THEN
            await handler.buildDefinition(
                'testInstance/testBU',
                'dataExtension',
                'childBU_dataextension_test',
                'testMarket'
            );
            assert.deepEqual(
                await testUtils.getActualDeployFile('childBU_dataextension_test', 'dataExtension'),
                await testUtils.getExpectedFile('9999999', 'dataExtension', 'build'),
                'returned deployment file was not equal expected'
            );
            assert.equal(
                Object.values(testUtils.getAPIHistory()).flat().length,
                5,
                'Unexpected number of requests made'
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
                'testMarket'
            );
            // WHEN
            assert.equal(
                result.dataExtension ? Object.keys(result.dataExtension).length : 0,
                1,
                'only one dataExtension expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplate('childBU_dataextension_test', 'dataExtension'),
                await testUtils.getExpectedFile('9999999', 'dataExtension', 'template'),
                'returned template was not equal expected'
            );
            // THEN
            await handler.buildDefinition(
                'testInstance/testBU',
                'dataExtension',
                'childBU_dataextension_test',
                'testMarket'
            );

            assert.deepEqual(
                await testUtils.getActualDeployFile('childBU_dataextension_test', 'dataExtension'),
                await testUtils.getExpectedFile('9999999', 'dataExtension', 'build'),
                'returned deployment file was not equal expected'
            );
            assert.equal(
                Object.values(testUtils.getAPIHistory()).flat().length,
                5,
                'Unexpected number of requests made'
            );
            return;
        });
    });
});
