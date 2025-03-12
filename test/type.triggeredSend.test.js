import * as chai from 'chai';
const assert = chai.assert;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);

describe('type: triggeredSend', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });

    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a triggeredSend', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['triggeredSend']);
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.triggeredSend ? Object.keys(result.triggeredSend).length : 0,
                2,
                'only 2 triggeredSend expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_triggeredSend', 'triggeredSend'),
                await testUtils.getExpectedJson('9999999', 'triggeredSend', 'get'),
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

        it('Should create & upsert a triggeredSend', async () => {
            // WHEN
            await handler.deploy('testInstance/testBU', ['triggeredSend']);
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.triggeredSend ? Object.keys(result.triggeredSend).length : 0,
                3,
                'two triggeredSends expected'
            );
            // confirm created item
            assert.deepEqual(
                await testUtils.getActualJson('testNew_triggeredSend', 'triggeredSend'),
                await testUtils.getExpectedJson('9999999', 'triggeredSend', 'post'),
                'returned JSON was not equal expected for insert triggeredSend'
            );
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_triggeredSend', 'triggeredSend'),
                await testUtils.getExpectedJson('9999999', 'triggeredSend', 'patch'),
                'returned JSON was not equal expected for update triggeredSend'
            );
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                12,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Templating ================', () => {
        it('Should create a triggeredSend template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['triggeredSend']);
            // buildTemplate
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'triggeredSend',
                ['testExisting_triggeredSend'],
                ['testSourceMarket']
            );
            assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');
            assert.equal(
                result.triggeredSend ? Object.keys(result.triggeredSend).length : 0,
                1,
                'only one triggeredSend expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson(
                    'testExisting_triggeredSend',
                    'triggeredSend'
                ),
                await testUtils.getExpectedJson('9999999', 'triggeredSend', 'template'),
                'returned template JSON was not equal expected'
            );
            // buildDefinition
            await handler.buildDefinition(
                'testInstance/testBU',
                'triggeredSend',
                ['testExisting_triggeredSend'],
                ['testTargetMarket']
            );
            assert.equal(process.exitCode, 0, 'buildDefinition should not have thrown an error');
            assert.deepEqual(
                await testUtils.getActualDeployJson('testTemplated_triggeredSend', 'triggeredSend'),
                await testUtils.getExpectedJson('9999999', 'triggeredSend', 'build'),
                'returned deployment JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                10,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should create a script template via buildTemplate with --dependencies', async () => {
            // download first before we test buildTemplate

            handler.setOptions({ dependencies: true, retrieve: true });

            // GIVEN there is a template
            const templatedItems = await handler.buildTemplate(
                'testInstance/testBU',
                'triggeredSend',
                ['testExisting_triggeredSend', 'testExisting_triggeredSend_rcb'],
                ['testSourceMarket']
            );
            // WHEN
            assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');

            assert.deepEqual(
                Object.keys(templatedItems),
                ['asset', 'sendClassification', 'senderProfile', 'triggeredSend'],
                'expected specific types to be templated'
            );

            // triggeredSend
            assert.deepEqual(
                templatedItems.triggeredSend.map((item) => item.CustomerKey),
                ['{{{prefix}}}triggeredSend', '{{{prefix}}}triggeredSend_rcb'],
                'expected specific triggeredSends to be templated'
            );
            // sendClassification
            assert.deepEqual(
                templatedItems.sendClassification.map((item) => item.CustomerKey),
                ['{{{prefix}}}sendClassification'],
                'expected specific sendClassifications to be templated'
            );
            // senderProfile
            assert.deepEqual(
                templatedItems.senderProfile.map((item) => item.CustomerKey),
                ['{{{prefix}}}senderProfile', '{{{prefix}}}senderProfile_rcb'],
                'expected specific senderProfiles to be templated'
            );
            // asset
            assert.deepEqual(
                templatedItems.asset.map((item) => item.customerKey),
                [
                    '{{{prefix}}}asset_htmlblock',
                    '{{{prefix}}}htmlblock 3 spaces',
                    '{{{prefix}}}htmlblock1',
                    '{{{prefix}}}htmlblock2',
                ],
                'expected specific assets to be templated'
            );
        });
    });

    describe('Delete ================', () => {
        it('Should delete the item', async () => {
            // WHEN
            const isDeleted = await handler.deleteByKey(
                'testInstance/testBU',
                'triggeredSend',
                'testExisting_triggeredSend'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'delete should not have thrown an error');

            assert.equal(isDeleted, true, 'should have deleted the item');
            return;
        });
    });

    describe('Refresh ================', () => {
        it('Should refresh all active triggeredSend', async () => {
            // WHEN
            const replace = await handler.refresh('testInstance/testBU', {
                triggeredSend: null,
            });
            // THEN
            assert.equal(process.exitCode, 0, 'refresh should not have thrown an error');
            // retrieve result

            assert.deepEqual(
                replace['testInstance/testBU'].triggeredSend,
                ['testExisting_triggeredSend', 'testExisting_triggeredSend_rcb'],
                'should have found the right triggeredSends that need updating'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                15,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should refresh a specifc triggeredSend by key', async () => {
            // WHEN
            const replace = await handler.refresh('testInstance/testBU', {
                triggeredSend: ['testExisting_triggeredSend'],
            });
            // THEN
            assert.equal(process.exitCode, 0, 'refresh should not have thrown an error');
            // retrieve result

            assert.deepEqual(
                replace['testInstance/testBU'].triggeredSend,
                ['testExisting_triggeredSend'],
                'should have found the right triggeredSends that need updating'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                4,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should refresh 2 triggeredSend by key', async () => {
            // WHEN
            const replace = await handler.refresh('testInstance/testBU', {
                triggeredSend: ['testExisting_triggeredSend', 'testExisting_triggeredSend_rcb'],
            });
            // THEN
            assert.equal(process.exitCode, 0, 'refresh should not have thrown an error');
            // retrieve result

            assert.deepEqual(
                replace['testInstance/testBU'].triggeredSend,
                ['testExisting_triggeredSend', 'testExisting_triggeredSend_rcb'],
                'should have found the right triggeredSends that need updating'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                8,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Start (Execute) ================', () => {
        it('Should start a triggeredSend by key');
    });

    describe('Pause ================', () => {
        it('Should pause a triggeredSend by key');
    });

    describe('ReplaceContentBlockByX ================', () => {
        it('Should replace references with ContentBlockByName w/o deploy', async () => {
            handler.setOptions({ skipDeploy: true });

            // WHEN
            const replace = await handler.replaceCbReference(
                'testInstance/testBU',
                {
                    triggeredSend: null,
                },
                'name'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // retrieve result
            assert.deepEqual(
                replace['testInstance/testBU'].triggeredSend,
                ['testExisting_triggeredSend_rcb'],
                'should have found the right triggeredSends that need updating'
            );

            // check if conversions happened
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_triggeredSend_rcb', 'triggeredSend'),
                await testUtils.getExpectedJson('9999999', 'triggeredSend', 'get-rcb-name'),
                'returned JSON was not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                16,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should replace references with ContentBlockById w/o deploy', async () => {
            handler.setOptions({ skipDeploy: true });

            // WHEN
            const replace = await handler.replaceCbReference(
                'testInstance/testBU',
                {
                    triggeredSend: null,
                },
                'id'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // retrieve result
            assert.deepEqual(
                replace['testInstance/testBU'].triggeredSend,
                ['testExisting_triggeredSend_rcb'],
                'should have found the right triggeredSends that need updating'
            );

            // check if conversions happened
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_triggeredSend_rcb', 'triggeredSend'),
                await testUtils.getExpectedJson('9999999', 'triggeredSend', 'get-rcb-id'),
                'returned JSON was not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                16,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should replace references with ContentBlockByKey w/o deploy', async () => {
            handler.setOptions({ skipDeploy: true });

            // WHEN
            const replace = await handler.replaceCbReference(
                'testInstance/testBU',
                {
                    triggeredSend: null,
                },
                'key'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // retrieve result
            assert.deepEqual(
                replace['testInstance/testBU'].triggeredSend,
                ['testExisting_triggeredSend_rcb'],
                'should have found the right assets that need updating'
            );

            // check if conversions happened
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_triggeredSend_rcb', 'triggeredSend'),
                await testUtils.getExpectedJson('9999999', 'triggeredSend', 'get-rcb-key'),
                'returned JSON was not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                16,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
});
