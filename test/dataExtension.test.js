const assert = require('chai').assert;
const cache = require('../lib/util/cache');
const testUtils = require('./utils');
const handler = require('../lib/index');

describe('retrieve', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });
    afterEach(() => {
        testUtils.mockReset();
    });

    it('Should retrieve a data extension', async () => {
        // WHEN
        await handler.retrieve('testInstance/testBU', ['dataExtension']);
        // THEN
        // get results from cache
        const result = cache.getCache();
        assert.equal(
            Object.keys(result.dataExtension).length,
            1,
            'only one data extension expected'
        );
        assert.deepEqual(
            await testUtils.getExpectedFile('9999999', 'dataExtension', 'retrieve'),
            await testUtils.getActualFile('childBU_dataextension_test', 'dataExtension'),
            'returned metadata was not equal expected'
        );
        assert.equal(
            Object.values(testUtils.getAPIHistory()).flat().length,
            6,
            'Unexpected number of requests made'
        );
        return;
    });
    it('Should create & upsert a data extension', async () => {
        // WHEN
        await handler.deploy('testInstance/testBU', ['dataExtension']);
        // THEN

        // get results from cache
        const result = cache.getCache();
        assert.equal(Object.keys(result.dataExtension).length, 2, 'two data extensions expected');
        assert.deepEqual(
            await testUtils.getExpectedFile('9999999', 'dataExtension', 'create'),
            await testUtils.getActualFile('testDataExtension', 'dataExtension'),
            'returned metadata was not equal expected for create'
        );
        assert.deepEqual(
            await testUtils.getExpectedFile('9999999', 'dataExtension', 'update'),
            await testUtils.getActualFile('childBU_dataextension_test', 'dataExtension'),
            'returned metadata was not equal expected for update'
        );
        assert.equal(
            Object.values(testUtils.getAPIHistory()).flat().length,
            15,
            'Unexpected number of requests made'
        );
        return;
    });
    it('Should create a dataExtension template and build it', async () => {
        // GIVEN there is a template
        const result = await handler.retrieveAsTemplate(
            'testInstance/testBU',
            'dataExtension',
            'childBU_dataextension_test',
            'testMarket'
        );
        // WHEN
        assert.equal(
            Object.keys(result.dataExtension).length,
            1,
            'only one dataExtension expected'
        );
        assert.deepEqual(
            await testUtils.getExpectedFile('9999999', 'dataExtension', 'template'),
            await testUtils.getActualTemplate('childBU_dataextension_test', 'dataExtension'),
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
            await testUtils.getExpectedFile('9999999', 'dataExtension', 'build'),
            await testUtils.getActualDeployFile('childBU_dataextension_test', 'dataExtension'),
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
