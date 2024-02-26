import * as chai from 'chai';
const assert = chai.assert;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);

describe('type: transactionalPush', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });

    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a transactionalPush', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['transactionalPush']);
            // THEN
            assert.equal(process.exitCode, false, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.transactionalPush ? Object.keys(result.transactionalPush).length : 0,
                1,
                'only one transactionalPush expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_tpush', 'transactionalPush'),
                await testUtils.getExpectedJson('9999999', 'transactionalPush', 'get'),
                'returned JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                3,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Deploy ================', () => {
        beforeEach(() => {
            testUtils.mockSetup(true);
        });

        it('Should create & upsert a transactionalPush', async () => {
            // WHEN
            await handler.deploy('testInstance/testBU', ['transactionalPush']);
            // THEN
            assert.equal(process.exitCode, false, 'deploy should not have thrown an error');
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
                testUtils.getAPIHistoryLength(),
                5,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should NOT change the key during update with --changeKeyValue and instead fail due to missing support', async () => {
            // WHEN
            handler.setOptions({ changeKeyValue: 'updatedKey' });
            await handler.deploy(
                'testInstance/testBU',
                ['transactionalPush'],
                ['testExisting_tpush']
            );
            // THEN
            assert.equal(
                process.exitCode,
                1,
                'deploy should have thrown an error due to lack of support'
            );
            return;
        });
    });

    describe('Templating ================', () => {
        // it.skip('Should create a transactionalPush template via retrieveAsTemplate and build it');
        it('Should create a transactionalPush template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['transactionalPush']);
            // buildTemplate
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'transactionalPush',
                ['testExisting_tpush'],
                'testSourceMarket'
            );
            assert.equal(process.exitCode, false, 'buildTemplate should not have thrown an error');
            assert.equal(
                result.transactionalPush ? Object.keys(result.transactionalPush).length : 0,
                1,
                'only one transactionalPush expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson('testExisting_tpush', 'transactionalPush'),
                await testUtils.getExpectedJson('9999999', 'transactionalPush', 'template'),
                'returned template JSON was not equal expected'
            );
            // buildDefinition
            await handler.buildDefinition(
                'testInstance/testBU',
                'transactionalPush',
                'testExisting_tpush',
                'testTargetMarket'
            );
            assert.equal(
                process.exitCode,
                false,
                'buildDefinition should not have thrown an error'
            );

            assert.deepEqual(
                await testUtils.getActualDeployJson('testTemplated_tpush', 'transactionalPush'),
                await testUtils.getExpectedJson('9999999', 'transactionalPush', 'build'),
                'returned deployment JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                3,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Delete ================', () => {
        // TODO: add this test
        it('Should delete the item'); // , async () => {
        //     // WHEN
        //     const isDeleted = await handler.deleteByKey('testInstance/testBU', 'mobileKeyword', 'testExisting_keyword');
        //     // THEN
        //     assert.equal(process.exitCode, false, 'delete should not have thrown an error');

        //     assert.equal(isDeleted, true, 'should have deleted the item');
        //     return;
        // });
    });
});
