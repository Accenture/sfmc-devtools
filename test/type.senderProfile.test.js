import * as chai from 'chai';
const assert = chai.assert;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);

describe('type: senderProfile', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });

    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a senderProfile', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['senderProfile']);
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.senderProfile ? Object.keys(result.senderProfile).length : 0,
                3,
                '3 senderProfiles expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_senderProfile', 'senderProfile'),
                await testUtils.getExpectedJson('9999999', 'senderProfile', 'get'),
                'returned JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                5,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Deploy ================', () => {
        beforeEach(() => {
            testUtils.mockSetup(true);
        });

        it('Should create & upsert a senderProfile', async () => {
            // WHEN

            await handler.deploy('testInstance/testBU', ['senderProfile']);
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.senderProfile ? Object.keys(result.senderProfile).length : 0,
                4,
                '4 senderProfiles expected'
            );
            // check callouts
            const createCallout = testUtils.getRestCallout(
                'post',
                '/messaging/v1/domainverification/'
            );
            assert.deepEqual(
                createCallout,
                { domain: 'joern.berkefeld.New@accenture.com' },
                'unexecpted payload for create callout'
            );
            // confirm created domainVerification item
            assert.deepEqual(
                await testUtils.getActualJson(
                    'joern.berkefeld.New@accenture.com',
                    'domainVerification'
                ),
                await testUtils.getExpectedJson('9999999', 'domainVerification', 'create'),
                'returned new-JSON was not equal expected for insert domainVerification'
            );

            // confirm created item
            assert.deepEqual(
                await testUtils.getActualJson('testNew_senderProfile', 'senderProfile'),
                await testUtils.getExpectedJson('9999999', 'senderProfile', 'post'),
                'returned new-JSON was not equal expected for insert senderProfile'
            );
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_senderProfile', 'senderProfile'),
                await testUtils.getExpectedJson('9999999', 'senderProfile', 'patch'),
                'returned existing-JSON was not equal expected for update senderProfile'
            );
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                10,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Templating ================', () => {
        it('Should create a senderProfile template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['senderProfile']);
            // buildTemplate
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'senderProfile',
                ['testExisting_senderProfile'],
                ['testSourceMarket']
            );
            assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');
            assert.equal(
                result.senderProfile ? Object.keys(result.senderProfile).length : 0,
                1,
                'only one senderProfile expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson(
                    'testExisting_senderProfile',
                    'senderProfile'
                ),
                await testUtils.getExpectedJson('9999999', 'senderProfile', 'template'),
                'returned template JSON was not equal expected'
            );
            // buildDefinition
            await handler.buildDefinition(
                'testInstance/testBU',
                'senderProfile',
                ['testExisting_senderProfile'],
                ['testTargetMarket']
            );
            assert.equal(process.exitCode, 0, 'buildDefinition should not have thrown an error');
            assert.deepEqual(
                await testUtils.getActualDeployJson('testTemplated_senderProfile', 'senderProfile'),
                await testUtils.getExpectedJson('9999999', 'senderProfile', 'build'),
                'returned deployment JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                5,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should create a senderProfile template via buildTemplate with --dependencies', async () => {
            // download first before we test buildTemplate
            handler.setOptions({ dependencies: true, retrieve: true });

            // GIVEN there is a template
            const templatedItems = await handler.buildTemplate(
                'testInstance/testBU',
                'senderProfile',
                ['testExisting_senderProfile'],
                ['testSourceMarket']
            );
            // WHEN
            assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');

            assert.deepEqual(
                Object.keys(templatedItems),
                ['senderProfile'],
                'expected specific types to be templated'
            );

            // senderProfile
            assert.deepEqual(
                templatedItems.senderProfile.map((item) => item.CustomerKey),
                ['{{{prefix}}}senderProfile'],
                'expected specific senderProfiles to be templated'
            );
        });
    });

    describe('Delete ================', () => {
        it('Should delete the item', async () => {
            // WHEN
            const isDeleted = await handler.deleteByKey(
                'testInstance/testBU',
                'senderProfile',
                'testExisting_senderProfile'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deleteByKey should not have thrown an error');
            assert.equal(isDeleted, true, 'deleteByKey should have returned true');
            return;
        });
    });

    describe('ReplaceContentBlockByX ================', () => {
        it('Should replace references with ContentBlockByName w/o deploy', async () => {
            handler.setOptions({ skipDeploy: true });

            // WHEN
            const replace = await handler.replaceCbReference(
                'testInstance/testBU',
                {
                    senderProfile: null,
                },
                'name'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // retrieve result
            assert.deepEqual(
                replace['testInstance/testBU'].senderProfile,
                ['testExisting_senderProfile_rcb'],
                'should have found the right senderProfiles that need updating'
            );

            // check if conversions happened
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_senderProfile_rcb', 'senderProfile'),
                await testUtils.getExpectedJson('9999999', 'senderProfile', 'get-rcb-name'),
                'returned JSON was not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                11,
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
                    senderProfile: null,
                },
                'id'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // retrieve result
            assert.deepEqual(
                replace['testInstance/testBU'].senderProfile,
                ['testExisting_senderProfile_rcb'],
                'should have found the right senderProfiles that need updating'
            );

            // check if conversions happened
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_senderProfile_rcb', 'senderProfile'),
                await testUtils.getExpectedJson('9999999', 'senderProfile', 'get-rcb-id'),
                'returned JSON was not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                11,
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
                    senderProfile: null,
                },
                'key'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // retrieve result
            assert.deepEqual(
                replace['testInstance/testBU'].senderProfile,
                ['testExisting_senderProfile_rcb'],
                'should have found the right assets that need updating'
            );

            // check if conversions happened
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_senderProfile_rcb', 'senderProfile'),
                await testUtils.getExpectedJson('9999999', 'senderProfile', 'get-rcb-key'),
                'returned JSON was not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                11,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
});
