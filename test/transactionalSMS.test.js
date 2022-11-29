const assert = require('chai').assert;
const cache = require('../lib/util/cache');
const testUtils = require('./utils');
const handler = require('../lib/index');

describe('transactionalSMS', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });
    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a transactionalSMS', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['transactionalSMS']);
            // THEN
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.transactionalSMS ? Object.keys(result.transactionalSMS).length : 0,
                1,
                'only one transactionalSMS expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_tsms', 'transactionalSMS'),
                await testUtils.getExpectedJson('9999999', 'transactionalSMS', 'get'),
                'returned metadata was not equal expected'
            );
            assert.equal(
                Object.values(testUtils.getAPIHistory()).flat().length,
                4,
                'Unexpected number of requests made'
            );
            return;
        });
    });
    describe('Deploy ================', () => {
        it('Should create & upsert a transactionalSMS', async () => {
            // WHEN
            await handler.deploy('testInstance/testBU', ['transactionalSMS']);
            // THEN
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.transactionalSMS ? Object.keys(result.transactionalSMS).length : 0,
                2,
                'two transactionalSMSs expected'
            );
            // confirm created item
            assert.deepEqual(
                await testUtils.getActualJson('testNew_tsms', 'transactionalSMS'),
                await testUtils.getExpectedJson('9999999', 'transactionalSMS', 'post'),
                'returned metadata was not equal expected for insert transactionalSMS'
            );
            assert.deepEqual(
                await testUtils.getActualFile('testNew_tsms', 'transactionalSMS', 'amp'),
                await testUtils.getExpectedFile('9999999', 'transactionalSMS', 'post', 'amp'),
                'returned AMPscript was not equal expected for insert transactionalSMS'
            );
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_tsms', 'transactionalSMS'),
                await testUtils.getExpectedJson('9999999', 'transactionalSMS', 'patch'),
                'returned metadata was not equal expected for update transactionalSMS'
            );
            assert.deepEqual(
                await testUtils.getActualFile('testExisting_tsms', 'transactionalSMS', 'amp'),
                await testUtils.getExpectedFile('9999999', 'transactionalSMS', 'patch', 'amp'),
                'returned AMPscript was not equal expected for update transactionalSMS'
            );
            // check number of API calls
            assert.equal(
                Object.values(testUtils.getAPIHistory()).flat().length,
                5,
                'Unexpected number of requests made'
            );
            return;
        });
    });
    // describe('Templating ================', () => {
    //     it('Should create a transactionalSMS template via retrieveAsTemplate and build it', async () => {
    //         // GIVEN there is a template
    //         const result = await handler.retrieveAsTemplate(
    //             'testInstance/testBU',
    //             'transactionalSMS',
    //             ['testExisting_tsms'],
    //             'testMarket'
    //         );
    //         // WHEN
    //         assert.equal(
    //             result.transactionalSMS ? Object.keys(result.transactionalSMS).length : 0,
    //             1,
    //             'only one transactionalSMS expected'
    //         );
    //         assert.deepEqual(
    //             await testUtils.getActualTemplate('testExisting_tsms', 'transactionalSMS'),
    //             await testUtils.getExpectedFile('9999999', 'transactionalSMS', 'template'),
    //             'returned template was not equal expected'
    //         );
    //         // THEN
    //         await handler.buildDefinition(
    //             'testInstance/testBU',
    //             'transactionalSMS',
    //             'testExisting_tsms',
    //             'testMarket'
    //         );
    //         assert.deepEqual(
    //             await testUtils.getActualDeployFile('testExisting_tsms', 'transactionalSMS'),
    //             await testUtils.getExpectedFile('9999999', 'transactionalSMS', 'build'),
    //             'returned deployment file was not equal expected'
    //         );
    //         assert.equal(
    //             Object.values(testUtils.getAPIHistory()).flat().length,
    //             6,
    //             'Unexpected number of requests made'
    //         );
    //         return;
    //     });
    //     it('Should create a transactionalSMS template via buildTemplate and build it', async () => {
    //         // download first before we test buildTemplate
    //         await handler.retrieve('testInstance/testBU', ['transactionalSMS']);
    //         // GIVEN there is a template
    //         const result = await handler.buildTemplate(
    //             'testInstance/testBU',
    //             'transactionalSMS',
    //             ['testExisting_tsms'],
    //             'testMarket'
    //         );
    //         // WHEN
    //         assert.equal(
    //             result.transactionalSMS ? Object.keys(result.transactionalSMS).length : 0,
    //             1,
    //             'only one transactionalSMS expected'
    //         );
    //         assert.deepEqual(
    //             await testUtils.getActualTemplate('testExisting_tsms', 'transactionalSMS'),
    //             await testUtils.getExpectedFile('9999999', 'transactionalSMS', 'template'),
    //             'returned template was not equal expected'
    //         );
    //         // THEN
    //         await handler.buildDefinition(
    //             'testInstance/testBU',
    //             'transactionalSMS',
    //             'testExisting_tsms',
    //             'testMarket'
    //         );
    //         assert.deepEqual(
    //             await testUtils.getActualDeployFile('testExisting_tsms', 'transactionalSMS'),
    //             await testUtils.getExpectedFile('9999999', 'transactionalSMS', 'build'),
    //             'returned deployment file was not equal expected'
    //         );
    //         assert.equal(
    //             Object.values(testUtils.getAPIHistory()).flat().length,
    //             6,
    //             'Unexpected number of requests made'
    //         );
    //         return;
    //     });
    // });
});
