const chai = require('chai');
const chaiFiles = require('chai-files');
const assert = chai.assert;
chai.use(chaiFiles);
const cache = require('../lib/util/cache');
const testUtils = require('./utils');
const handler = require('../lib/index');

describe('type: transactionalEmail', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });
    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a transactionalEmail', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['transactionalEmail']);
            // THEN
            assert.equal(process.exitCode, false, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.transactionalEmail ? Object.keys(result.transactionalEmail).length : 0,
                1,
                'only one transactionalEmail expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_temail', 'transactionalEmail'),
                await testUtils.getExpectedJson('9999999', 'transactionalEmail', 'get'),
                'returned JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                12,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
    describe('Deploy ================', () => {
        beforeEach(() => {
            testUtils.mockSetup(true);
        });
        it('Should create & upsert a transactionalEmail', async () => {
            // WHEN
            await handler.deploy('testInstance/testBU', ['transactionalEmail']);
            // THEN
            assert.equal(process.exitCode, false, 'deploy should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.transactionalEmail ? Object.keys(result.transactionalEmail).length : 0,
                2,
                'two transactionalEmails expected'
            );
            // confirm created item
            assert.deepEqual(
                await testUtils.getActualJson('testNew_temail', 'transactionalEmail'),
                await testUtils.getExpectedJson('9999999', 'transactionalEmail', 'post'),
                'returned JSON was not equal expected for insert transactionalEmail'
            );
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_temail', 'transactionalEmail'),
                await testUtils.getExpectedJson('9999999', 'transactionalEmail', 'patch'),
                'returned JSON was not equal expected for update transactionalEmail'
            );
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                14,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
    describe('Templating ================', () => {
        // it.skip('Should create a transactionalEmail template via retrieveAsTemplate and build it');
        it('Should create a transactionalEmail template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['transactionalEmail']);
            // buildTemplate
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'transactionalEmail',
                ['testExisting_temail'],
                'testSourceMarket'
            );
            assert.equal(process.exitCode, false, 'buildTemplate should not have thrown an error');
            assert.equal(
                result.transactionalEmail ? Object.keys(result.transactionalEmail).length : 0,
                1,
                'only one transactionalEmail expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson('testExisting_temail', 'transactionalEmail'),
                await testUtils.getExpectedJson('9999999', 'transactionalEmail', 'template'),
                'returned template JSON was not equal expected'
            );
            // buildDefinition
            await handler.buildDefinition(
                'testInstance/testBU',
                'transactionalEmail',
                'testExisting_temail',
                'testTargetMarket'
            );
            assert.equal(
                process.exitCode,
                false,
                'buildDefinition should not have thrown an error'
            );
            assert.deepEqual(
                await testUtils.getActualDeployJson('testTemplated_temail', 'transactionalEmail'),
                await testUtils.getExpectedJson('9999999', 'transactionalEmail', 'build'),
                'returned deployment JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                12,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
    describe('Delete ================', () => {
        // TODO: add this test
        it('Should delete the item'); // , async () => {
        //     // WHEN
        //     const result = await handler.deleteByKey('testInstance/testBU', 'mobileKeyword', [
        //         'testExisting_keyword',
        //     ]);
        //     // THEN
        //     assert.equal(process.exitCode, false, 'delete should not have thrown an error');

        //     assert.equal(result, true, 'should have deleted the item');
        //     return;
        // });
    });
});
