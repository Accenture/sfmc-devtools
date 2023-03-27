const chai = require('chai');
const chaiFiles = require('chai-files');
const assert = chai.assert;
chai.use(chaiFiles);
const cache = require('../lib/util/cache');
const testUtils = require('./utils');
const handler = require('../lib/index');

describe('interaction', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });
    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a interaction', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['interaction']);
            // THEN
            assert.equal(!!process.exitCode, false, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.interaction ? Object.keys(result.interaction).length : 0,
                2,
                'only 2 interactions expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_interaction', 'interaction'),
                await testUtils.getExpectedJson('9999999', 'interaction', 'get'),
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
        it('Should create & upsert a interaction', async () => {
            // WHEN
            await handler.deploy('testInstance/testBU', ['interaction']);
            // THEN
            assert.equal(!!process.exitCode, false, 'deploy should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.interaction ? Object.keys(result.interaction).length : 0,
                3,
                '3 interactions expected'
            );
            // confirm created item
            assert.deepEqual(
                await testUtils.getActualJson('testNew_interaction', 'interaction'),
                await testUtils.getExpectedJson('9999999', 'interaction', 'post'),
                'returned JSON was not equal expected for insert interaction'
            );

            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_interaction', 'interaction'),
                await testUtils.getExpectedJson('9999999', 'interaction', 'put'), // watch out - interaction api wants put instead of patch for updates
                'returned JSON was not equal expected for update interaction'
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
        it('Should create a interaction template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['interaction']);
            // buildTemplate
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'interaction',
                ['testExisting_interaction'],
                'testSourceMarket'
            );
            assert.equal(
                !!process.exitCode,
                false,
                'buildTemplate should not have thrown an error'
            );
            assert.equal(
                result.interaction ? Object.keys(result.interaction).length : 0,
                1,
                'only one interaction expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson('testExisting_interaction', 'interaction'),
                await testUtils.getExpectedJson('9999999', 'interaction', 'template'),
                'returned template JSON was not equal expected'
            );

            // buildDefinition
            await handler.buildDefinition(
                'testInstance/testBU',
                'interaction',
                'testExisting_interaction',
                'testTargetMarket'
            );
            assert.equal(
                !!process.exitCode,
                false,
                'buildDefinition should not have thrown an error'
            );
            assert.deepEqual(
                await testUtils.getActualDeployJson('testExisting_interaction', 'interaction'),
                await testUtils.getExpectedJson('9999999', 'interaction', 'build'),
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
});
