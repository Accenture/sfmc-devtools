const chai = require('chai');
const chaiFiles = require('chai-files');
const assert = chai.assert;
chai.use(chaiFiles);
const cache = require('../lib/util/cache');
const testUtils = require('./utils');
const handler = require('../lib/index');

describe('transactionalPush', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });
    afterEach(() => {
        testUtils.mockReset();
    });

    // describe('Retrieve ================', () => {
    //     it('Should retrieve a transactionalPush', async () => {
    //         // WHEN
    //         await handler.retrieve('testInstance/testBU', ['transactionalPush']);
    //         // THEN
    //         // get results from cache
    //         const result = cache.getCache();
    //         assert.equal(
    //             result.transactionalPush ? Object.keys(result.transactionalPush).length : 0,
    //             1,
    //             'only one transactionalPush expected'
    //         );
    //         assert.deepEqual(
    //             await testUtils.getActualJson('testExisting_tpush', 'transactionalPush'),
    //             await testUtils.getExpectedJson('9999999', 'transactionalPush', 'get'),
    //             'returned JSON was not equal expected'
    //         );
    //         assert.equal(
    //             Object.values(testUtils.getAPIHistory()).flat().length,
    //             12,
    //             'Unexpected number of requests made'
    //         );
    //         return;
    //     });
    // });
    describe('Deploy ================', () => {
        beforeEach(() => {
            testUtils.mockSetup(true);
        });
        it('Should create & upsert a transactionalPush', async () => {
            // WHEN
            await handler.deploy('testInstance/testBU', ['transactionalPush']);
            // THEN
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.transactionalPush ? Object.keys(result.transactionalPush).length : 0,
                2,
                'two transactionalPushs expected'
            );
            // confirm created item
            assert.deepEqual(
                await testUtils.getActualJson('testNew_tpush', 'transactionalPush'),
                await testUtils.getExpectedJson('9999999', 'transactionalPush', 'post'),
                'returned JSON was not equal expected for insert transactionalPush'
            );
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_tpush', 'transactionalPush'),
                await testUtils.getExpectedJson('9999999', 'transactionalPush', 'patch'),
                'returned JSON was not equal expected for update transactionalPush'
            );
            // check number of API calls
            assert.equal(
                Object.values(testUtils.getAPIHistory()).flat().length,
                4,
                'Unexpected number of requests made'
            );
            return;
        });
    });
    // describe('Templating ================', () => {
    //     // it.skip('Should create a transactionalPush template via retrieveAsTemplate and build it');
    //     it('Should create a transactionalPush template via buildTemplate and build it', async () => {
    //         // download first before we test buildTemplate
    //         await handler.retrieve('testInstance/testBU', ['transactionalPush']);
    //         // buildTemplate
    //         const result = await handler.buildTemplate(
    //             'testInstance/testBU',
    //             'transactionalPush',
    //             ['testExisting_tpush'],
    //             'testSourceMarket'
    //         );
    //         assert.equal(
    //             result.transactionalPush ? Object.keys(result.transactionalPush).length : 0,
    //             1,
    //             'only one transactionalPush expected'
    //         );
    //         assert.deepEqual(
    //             await testUtils.getActualTemplateJson('testExisting_tpush', 'transactionalPush'),
    //             await testUtils.getExpectedJson('9999999', 'transactionalPush', 'template'),
    //             'returned template JSON was not equal expected'
    //         );
    //         // buildDefinition
    //         await handler.buildDefinition(
    //             'testInstance/testBU',
    //             'transactionalPush',
    //             'testExisting_tpush',
    //             'testTargetMarket'
    //         );
    //         assert.deepEqual(
    //             await testUtils.getActualDeployJson('testExisting_tpush', 'transactionalPush'),
    //             await testUtils.getExpectedJson('9999999', 'transactionalPush', 'build'),
    //             'returned deployment JSON was not equal expected'
    //         );
    //         assert.equal(
    //             Object.values(testUtils.getAPIHistory()).flat().length,
    //             12,
    //             'Unexpected number of requests made'
    //         );
    //         return;
    //     });
    // });
});
