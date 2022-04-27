const assert = require('chai').assert;

const cache = require('../lib/util/cache');

// test specific
const testUtils = require('./utils');
//
const handler = require('../lib/index');
//

describe('retrieve', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });
    afterEach(() => {
        testUtils.mockReset();
    });

    it('Should retrieve a query', async () => {
        // WHEN
        await handler.retrieve('testInstance/testBU', 'query');
        // THEN
        // get results from cache
        const result = cache.getCache();
        assert.equal(Object.keys(result.query).length, 1, 'only one query expected');
        assert.deepEqual(
            await testUtils.getExpectedFile('9999999', 'query', 'get'),
            await testUtils.getActualFile('testExistingQuery', 'query'),
            'returned metadata was not equal expected'
        );
        assert.equal(
            Object.values(testUtils.getAPIHistory()).flat().length,
            8,
            'Unexpected number of requests made'
        );
        return;
    });
    it('Should create & upsert a query', async () => {
        // WHEN
        await handler.deploy('testInstance/testBU', 'query');
        // THEN
        // get results from cache
        const result = cache.getCache();
        assert.equal(Object.keys(result.query).length, 2, 'two querys expected');
        assert.deepEqual(
            await testUtils.getExpectedFile('9999999', 'query', 'post'),
            await testUtils.getActualFile('testQuery', 'query'),
            'returned metadata was not equal expected for insert query'
        );
        assert.deepEqual(
            await testUtils.getExpectedFile('9999999', 'query', 'patch'),
            await testUtils.getActualFile('testExistingQuery', 'query'),
            'returned metadata was not equal expected for insert query'
        );
        assert.equal(
            Object.values(testUtils.getAPIHistory()).flat().length,
            10,
            'Unexpected number of requests made'
        );
        return;
    });
    it('Should build a query template and build it', async () => {
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
            await testUtils.getExpectedFile('9999999', 'query', 'template'),
            await testUtils.getActualTemplate('testExistingQuery', 'query'),
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
            await testUtils.getExpectedFile('9999999', 'query', 'build'),
            await testUtils.getActualDeployFile('testExistingQuery', 'query'),
            'returned deployment file was not equal expected'
        );
        assert.equal(
            Object.values(testUtils.getAPIHistory()).flat().length,
            8,
            'Unexpected number of requests made'
        );
        return;
    });
});
