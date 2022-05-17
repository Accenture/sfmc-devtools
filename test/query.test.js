const assert = require('chai').assert;
const cache = require('../lib/util/cache');
const testUtils = require('./utils');
const handler = require('../lib/index');

describe('query', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });
    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a query', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['query']);
            // THEN
            // get results from cache
            const result = cache.getCache();
            assert.equal(Object.keys(result.query).length, 1, 'only one query expected');
            assert.deepEqual(
                await testUtils.getActualFile('testExistingQuery', 'query'),
                await testUtils.getExpectedFile('9999999', 'query', 'get'),
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
        it('Should create & upsert a query', async () => {
            // WHEN
            await handler.deploy('testInstance/testBU', ['query']);
            // THEN
            // get results from cache
            const result = cache.getCache();
            assert.equal(Object.keys(result.query).length, 2, 'two querys expected');
            assert.deepEqual(
                await testUtils.getActualFile('testQuery', 'query'),
                await testUtils.getExpectedFile('9999999', 'query', 'post'),
                'returned metadata was not equal expected for insert query'
            );
            assert.deepEqual(
                await testUtils.getActualFile('testExistingQuery', 'query'),
                await testUtils.getExpectedFile('9999999', 'query', 'patch'),
                'returned metadata was not equal expected for insert query'
            );
            assert.equal(
                Object.values(testUtils.getAPIHistory()).flat().length,
                8,
                'Unexpected number of requests made'
            );
            return;
        });
    });
    describe('Templating ================', () => {
        it('Should create a query template via retrieveAsTemplate and build it', async () => {
            // GIVEN there is a template
            const result = await handler.retrieveAsTemplate(
                'testInstance/testBU',
                'query',
                'testExistingQuery',
                'testMarket'
            );
            // WHEN
            assert.equal(Object.keys(result.query).length, 1, 'only one query expected');
            assert.deepEqual(
                await testUtils.getActualTemplate('testExistingQuery', 'query'),
                await testUtils.getExpectedFile('9999999', 'query', 'template'),
                'returned template was not equal expected'
            );
            // THEN
            await handler.buildDefinition(
                'testInstance/testBU',
                'query',
                'testExistingQuery',
                'testMarket'
            );
            assert.deepEqual(
                await testUtils.getActualDeployFile('testExistingQuery', 'query'),
                await testUtils.getExpectedFile('9999999', 'query', 'build'),
                'returned deployment file was not equal expected'
            );
            assert.equal(
                Object.values(testUtils.getAPIHistory()).flat().length,
                6,
                'Unexpected number of requests made'
            );
            return;
        });
        it('Should create a query template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['query']);
            // GIVEN there is a template
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'query',
                ['testExistingQuery'],
                'testMarket'
            );
            // WHEN
            assert.equal(Object.keys(result.query).length, 1, 'only one query expected');
            assert.deepEqual(
                await testUtils.getActualTemplate('testExistingQuery', 'query'),
                await testUtils.getExpectedFile('9999999', 'query', 'template'),
                'returned template was not equal expected'
            );
            // THEN
            await handler.buildDefinition(
                'testInstance/testBU',
                'query',
                'testExistingQuery',
                'testMarket'
            );
            assert.deepEqual(
                await testUtils.getActualDeployFile('testExistingQuery', 'query'),
                await testUtils.getExpectedFile('9999999', 'query', 'build'),
                'returned deployment file was not equal expected'
            );
            assert.equal(
                Object.values(testUtils.getAPIHistory()).flat().length,
                6,
                'Unexpected number of requests made'
            );
            return;
        });
    });
});
