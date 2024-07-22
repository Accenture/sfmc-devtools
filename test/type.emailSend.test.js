import * as chai from 'chai';
const assert = chai.assert;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);

describe('type: emailSend', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });

    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a emailSend', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['emailSend']);
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.emailSend ? Object.keys(result.emailSend).length : 0,
                1,
                'only 1 emailSend expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_emailSend', 'emailSend'),
                await testUtils.getExpectedJson('9999999', 'emailSend', 'get'),
                'returned JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                14,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Deploy ================', () => {
        beforeEach(() => {
            testUtils.mockSetup(true);
        });

        it('Should create & upsert a emailSend', async () => {
            // WHEN

            await handler.deploy('testInstance/testBU', ['emailSend']);
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.emailSend ? Object.keys(result.emailSend).length : 0,
                2,
                '2 emailSends expected'
            );
            // confirm created item
            assert.deepEqual(
                await testUtils.getActualJson('testNew_emailSend', 'emailSend'),
                await testUtils.getExpectedJson('9999999', 'emailSend', 'post'),
                'returned new-JSON was not equal expected for insert emailSend'
            );
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_emailSend', 'emailSend'),
                await testUtils.getExpectedJson('9999999', 'emailSend', 'patch'),
                'returned existing-JSON was not equal expected for update emailSend'
            );
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                16,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Templating ================', () => {
        it('Should create a emailSend template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['emailSend']);
            // buildTemplate
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'emailSend',
                ['testExisting_emailSend'],
                'testSourceMarket'
            );
            assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');
            assert.equal(
                result.emailSend ? Object.keys(result.emailSend).length : 0,
                1,
                'only one emailSend expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson('testExisting_emailSend', 'emailSend'),
                await testUtils.getExpectedJson('9999999', 'emailSend', 'template'),
                'returned template JSON was not equal expected'
            );
            // buildDefinition
            await handler.buildDefinition(
                'testInstance/testBU',
                'emailSend',
                ['testExisting_emailSend'],
                'testTargetMarket'
            );
            assert.equal(process.exitCode, 0, 'buildDefinition should not have thrown an error');
            assert.deepEqual(
                await testUtils.getActualDeployJson('testTemplated_emailSend', 'emailSend'),
                await testUtils.getExpectedJson('9999999', 'emailSend', 'build'),
                'returned deployment JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                14,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Delete ================', () => {
        it('Should delete the item', async () => {
            // WHEN
            const isDeleted = await handler.deleteByKey(
                'testInstance/testBU',
                'emailSend',
                'testExisting_emailSend'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deleteByKey should not have thrown an error');
            assert.equal(isDeleted, true, 'deleteByKey should have returned true');
            return;
        });
    });
});
