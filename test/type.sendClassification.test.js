import * as chai from 'chai';
const assert = chai.assert;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);

describe('type: sendClassification', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });

    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a sendClassification', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['sendClassification']);
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.sendClassification ? Object.keys(result.sendClassification).length : 0,
                3,
                'only 3 sendClassifications expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_sendClassification',
                    'sendClassification'
                ),
                await testUtils.getExpectedJson('9999999', 'sendClassification', 'get'),
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

        it('Should create & upsert a sendClassification', async () => {
            // WHEN

            await handler.deploy('testInstance/testBU', ['sendClassification']);
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.sendClassification ? Object.keys(result.sendClassification).length : 0,
                4,
                'two sendClassifications expected'
            );
            // confirm created item
            assert.deepEqual(
                await testUtils.getActualJson('testNew_sendClassification', 'sendClassification'),
                await testUtils.getExpectedJson('9999999', 'sendClassification', 'post'),
                'returned new-JSON was not equal expected for insert sendClassification'
            );
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_sendClassification',
                    'sendClassification'
                ),
                await testUtils.getExpectedJson('9999999', 'sendClassification', 'patch'),
                'returned existing-JSON was not equal expected for update sendClassification'
            );
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                5,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Templating ================', () => {
        it('Should create a sendClassification template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['sendClassification']);
            // buildTemplate
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'sendClassification',
                ['testExisting_sendClassification'],
                'testSourceMarket'
            );
            assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');
            assert.equal(
                result.sendClassification ? Object.keys(result.sendClassification).length : 0,
                1,
                'only one sendClassification expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson(
                    'testExisting_sendClassification',
                    'sendClassification'
                ),
                await testUtils.getExpectedJson('9999999', 'sendClassification', 'template'),
                'returned template JSON was not equal expected'
            );
            // buildDefinition
            await handler.buildDefinition(
                'testInstance/testBU',
                'sendClassification',
                ['testExisting_sendClassification'],
                'testTargetMarket'
            );
            assert.equal(process.exitCode, 0, 'buildDefinition should not have thrown an error');
            assert.deepEqual(
                await testUtils.getActualDeployJson(
                    'testTemplated_sendClassification',
                    'sendClassification'
                ),
                await testUtils.getExpectedJson('9999999', 'sendClassification', 'build'),
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
        it('Should delete the item', async () => {
            // WHEN
            const isDeleted = await handler.deleteByKey(
                'testInstance/testBU',
                'sendClassification',
                'testExisting_sendClassification'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deleteByKey should not have thrown an error');
            assert.equal(isDeleted, true, 'deleteByKey should have returned true');
            return;
        });
    });
});
