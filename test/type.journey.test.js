import * as chai from 'chai';
const assert = chai.assert;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);

describe('type: journey', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });

    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a journey w/o keys', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['journey']);
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.journey ? Object.keys(result.journey).length : 0,
                4,
                'unexpected number of journeys'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_journey_Quicksend', 'journey'),
                await testUtils.getExpectedJson('9999999', 'journey', 'get-quicksend'),
                'returned JSON was not equal expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_journey_Multistep', 'journey'),
                await testUtils.getExpectedJson('9999999', 'journey', 'get-multistep'),
                'returned JSON was not equal expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_temail', 'journey'),
                await testUtils.getExpectedJson('9999999', 'journey', 'get-transactionalEmail'),
                'returned JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                26,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should retrieve a Quicksend journey with key', async () => {
            // WHEN
            await handler.retrieve(
                'testInstance/testBU',
                ['journey'],
                ['testExisting_journey_Quicksend']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.journey ? Object.keys(result.journey).length : 0,
                1,
                'only 1 journeys expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_journey_Quicksend', 'journey'),
                await testUtils.getExpectedJson('9999999', 'journey', 'get-quicksend'),
                'returned JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                19,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should retrieve a Multistep journey with key', async () => {
            // WHEN
            await handler.retrieve(
                'testInstance/testBU',
                ['journey'],
                ['testExisting_journey_Multistep']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.journey ? Object.keys(result.journey).length : 0,
                1,
                'only 1 journeys expected'
            );

            assert.deepEqual(
                await testUtils.getActualJson('testExisting_journey_Multistep', 'journey'),
                await testUtils.getExpectedJson('9999999', 'journey', 'get-multistep'),
                'returned JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                19,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should retrieve a Transactional Email journey with key', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['journey'], ['testExisting_temail']);
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.journey ? Object.keys(result.journey).length : 0,
                1,
                'only 1 journeys expected'
            );

            assert.deepEqual(
                await testUtils.getActualJson('testExisting_temail', 'journey'),
                await testUtils.getExpectedJson('9999999', 'journey', 'get-transactionalEmail'),
                'returned JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                22,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should retrieve a journey with id', async () => {
            // WHEN
            await handler.retrieve(
                'testInstance/testBU',
                ['journey'],
                ['id:3c3f4112-9b43-43ca-8a89-aa0375b2c1a2']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.journey ? Object.keys(result.journey).length : 0,
                1,
                'only 1 journeys expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_journey_Quicksend', 'journey'),
                await testUtils.getExpectedJson('9999999', 'journey', 'get-quicksend'),
                'returned JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                19,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should retrieve a journey with name', async () => {
            // WHEN
            await handler.retrieve(
                'testInstance/testBU',
                ['journey'],
                ['name:testExisting_journey_Quicksend']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.journey ? Object.keys(result.journey).length : 0,
                1,
                'only 1 journeys expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_journey_Quicksend', 'journey'),
                await testUtils.getExpectedJson('9999999', 'journey', 'get-quicksend'),
                'returned JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                20,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Deploy ================', () => {
        beforeEach(() => {
            testUtils.mockSetup(true);
        });

        it('Should NOT change the key during update with --changeKeyValue and instead fail due to missing support', async () => {
            // WHEN
            handler.setOptions({ changeKeyValue: 'updatedKey' });
            await handler.deploy(
                'testInstance/testBU',
                ['journey'],
                ['testExisting_journey_Quicksend']
            );
            // THEN
            assert.equal(
                process.exitCode,
                1,
                'deploy should have thrown an error due to lack of support'
            );
            return;
        });

        it('Should not deploy --publish an already published transactional journey', async () => {
            // WHEN
            handler.setOptions({ skipStatusCheck: true, publish: true });
            const deploy = await handler.deploy(
                'testInstance/testBU',
                ['journey'],
                ['testExisting_temail']
            );

            // THEN
            assert.equal(process.exitCode, 1, 'deploy --publish should have thrown an error');
            // retrieve result
            assert.deepEqual(
                Object.keys(deploy['testInstance/testBU']?.journey),
                [],
                'should have published the right journey'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                22,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should deploy --publish a transactional journey', async () => {
            // WHEN
            handler.setOptions({ skipStatusCheck: true, publish: true });
            const deploy = await handler.deploy(
                'testInstance/testBU',
                ['journey'],
                ['testExisting_temail_notPublished']
            );

            // THEN
            assert.equal(process.exitCode, 0, 'deploy --publish should not have thrown an error');
            // retrieve result
            assert.deepEqual(
                Object.keys(deploy['testInstance/testBU']?.journey),
                ['testExisting_temail_notPublished'],
                'should have published the right journey'
            );

            // get callouts
            const publishCallout = testUtils.getRestCallout(
                'post',
                '/interaction/v1/interactions/transactional/create'
            );
            // confirm callouts
            assert.deepEqual(
                publishCallout,
                {
                    definitionId: 'd4a900fe-3a8f-4cc5-9a49-81286e3e2cd2',
                },
                'publish-payload JSON was not equal expected'
            );

            // confirm transactionalEmail was downloaded
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_temail_notPublished',
                    'transactionalEmail'
                ),
                await testUtils.getExpectedJson('9999999', 'transactionalEmail', 'get-published'),
                'returned JSON was not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                57,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should deploy --publish a journey by key (auto-picks latest version)', async () => {
            handler.setOptions({ skipStatusCheck: true, publish: true });
            // WHEN
            const deploy = await handler.deploy(
                'testInstance/testBU',
                ['journey'],
                ['testExisting_journey_Multistep']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'publish should not have thrown an error');
            // retrieve result
            assert.deepEqual(
                Object.keys(deploy['testInstance/testBU']?.journey),
                ['testExisting_journey_Multistep'],
                'should have published the right journey'
            );

            // get callouts
            const publishCallout = testUtils.getRestCallout(
                'post',
                '/interaction/v1/interactions/publishAsync/%'
            );
            // confirm created item
            assert.deepEqual(
                publishCallout,
                await testUtils.getExpectedJson('9999999', 'journey', 'publish-callout'),
                'publish-payload JSON was not equal expected'
            );
            // confirm event was downloaded
            assert.deepEqual(
                await testUtils.getActualJson(
                    'DEAudience-2e3c73b6-48cc-2ec0-5522-48636e1a236e',
                    'event'
                ),
                await testUtils.getExpectedJson('9999999', 'event', 'get-published'),
                'returned JSON was not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                50,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Templating ================', () => {
        it('Should create a journey template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['journey']);
            // buildTemplate
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'journey',
                ['testExisting_journey_Quicksend'],
                ['testSourceMarket']
            );
            assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');
            assert.equal(
                result.journey ? Object.keys(result.journey).length : 0,
                1,
                'only one journey expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson('testExisting_journey_Quicksend', 'journey'),
                await testUtils.getExpectedJson('9999999', 'journey', 'template'),
                'returned template JSON was not equal expected'
            );

            // buildDefinition
            await handler.buildDefinition(
                'testInstance/testBU',
                'journey',
                ['testExisting_journey_Quicksend'],
                ['testTargetMarket']
            );
            assert.equal(process.exitCode, 0, 'buildDefinition should not have thrown an error');
            assert.deepEqual(
                await testUtils.getActualDeployJson('testTemplated_journey_Quicksend', 'journey'),
                await testUtils.getExpectedJson('9999999', 'journey', 'build'),
                'returned deployment JSON was not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                26,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should create a journey template via buildTemplate with --dependencies', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['journey', 'asset']);

            handler.setOptions({ dependencies: true, retrieve: true });

            // GIVEN there is a template
            const templatedItems = await handler.buildTemplate(
                'testInstance/testBU',
                'journey',
                ['testExisting_journey_Quicksend', 'testExisting_journey_Multistep'],
                ['testSourceMarket']
            );
            // WHEN
            assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');

            assert.deepEqual(
                Object.keys(templatedItems),
                [
                    'journey',
                    'event',
                    'dataExtension',
                    'senderProfile',
                    'sendClassification',
                    'asset',
                ],
                'expected specific types to be templated'
            );

            // journey
            assert.deepEqual(
                templatedItems.journey.map((item) => item.key),
                ['{{{prefix}}}journey_Multistep', '{{{prefix}}}journey_Quicksend'],
                'expected specific journeys to be templated'
            );
            // event
            assert.deepEqual(
                templatedItems.event.map((item) => item.eventDefinitionKey),
                [
                    'DEAudience-11be962d-064c-83d9-2804-7d1befc10325',
                    'DEAudience-2e3c73b6-48cc-2ec0-5522-48636e1a236e',
                ],
                'expected specific events to be templated'
            );
            // dataExtension
            assert.deepEqual(
                templatedItems.dataExtension.map((item) => item.CustomerKey),
                [
                    '{{{prefix}}}DomainExclusion',
                    '{{{prefix}}}journey_Multistep',
                    '{{{prefix}}}journey_Quicksend',
                ],
                'expected specific dataExtensions to be templated'
            );
            // senderProfile
            assert.deepEqual(
                templatedItems.senderProfile.map((item) => item.CustomerKey),
                ['{{{prefix}}}senderProfile'],
                'expected specific assets to be templated'
            );
            // sendClassification
            assert.deepEqual(
                templatedItems.sendClassification.map((item) => item.CustomerKey),
                ['{{{prefix}}}sendClassification'],
                'expected specific sendClassifications to be templated'
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
        it('Should NOT delete the item due to missing version', async () => {
            // WHEN
            const isDeleted = await handler.deleteByKey(
                'testInstance/testBU',
                'journey',
                'testExisting_journey_Multistep'
            );
            // THEN
            assert.equal(process.exitCode, 1, 'delete should have thrown an error');

            assert.equal(isDeleted, false, 'should not have deleted the item');
            return;
        });

        it('Should NOT delete the item due to unknown version', async () => {
            // WHEN
            const isDeleted = await handler.deleteByKey(
                'testInstance/testBU',
                'journey',
                'testExisting_journey_Multistep/2'
            );
            // THEN
            assert.equal(process.exitCode, 1, 'delete should have thrown an error');

            assert.equal(isDeleted, false, 'should not have deleted the item');
            return;
        });

        it('Should delete the item with exact version', async () => {
            // WHEN
            const isDeleted = await handler.deleteByKey(
                'testInstance/testBU',
                'journey',
                'testExisting_journey_Multistep/1'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'delete should not have thrown an error');

            assert.equal(isDeleted, true, 'should have deleted the item');
            return;
        });

        it('Should delete the item with all versions', async () => {
            // WHEN
            const isDeleted = await handler.deleteByKey(
                'testInstance/testBU',
                'journey',
                'testExisting_journey_Multistep/*'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'delete should not have thrown an error');

            assert.equal(isDeleted, true, 'should have deleted the item');
            return;
        });

        it('Should delete 2 items with exact version', async () => {
            // WHEN
            const isDeleted = await handler.deleteByKey('testInstance/testBU', 'journey', [
                'testExisting_journey_Quicksend',
                'testExisting_temail',
                'testExisting_journey_Multistep/1',
            ]);
            // THEN
            assert.equal(process.exitCode, 0, 'delete should not have thrown an error');

            assert.equal(isDeleted, true, 'should have deleted the item');
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
                    journey: null,
                },
                'name'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // retrieve result
            assert.deepEqual(
                replace['testInstance/testBU'].journey,
                ['testExisting_journey_Quicksend'],
                'should have found the right journeys that need updating'
            );

            // check if conversions happened
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_journey_Quicksend', 'journey'),
                await testUtils.getExpectedJson('9999999', 'journey', 'get-quicksend-rcb-name'),
                'returned JSON was not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                32,
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
                    journey: null,
                },
                'id'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // retrieve result
            assert.deepEqual(
                replace['testInstance/testBU'].journey,
                ['testExisting_journey_Quicksend'],
                'should have found the right journeys that need updating'
            );

            // check if conversions happened
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_journey_Quicksend', 'journey'),
                await testUtils.getExpectedJson('9999999', 'journey', 'get-quicksend-rcb-id'),
                'returned JSON was not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                32,
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
                    journey: null,
                },
                'key'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // retrieve result
            assert.deepEqual(
                replace['testInstance/testBU'].journey,
                ['testExisting_journey_Quicksend'],
                'should have found the right assets that need updating'
            );

            // check if conversions happened
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_journey_Quicksend', 'journey'),
                await testUtils.getExpectedJson('9999999', 'journey', 'get-quicksend-rcb-key'),
                'returned JSON was not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                32,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Publish ================', () => {
        it(`Should not publish a transactional journey by key that is already published but instead trigger a refresh`, async () => {
            handler.setOptions({ skipStatusCheck: true });
            // WHEN
            const publish = await handler.publish(
                'testInstance/testBU',
                ['journey'],
                ['testExisting_temail']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'publish should not have thrown an error');

            assert.deepEqual(
                publish['testInstance/testBU']?.journey,
                ['testExisting_temail'],
                'should not have published any journey but instead triggered a refresh'
            );

            // get callouts
            const pauseCallout = testUtils.getRestCallout(
                'post',
                '/interaction/v1/interactions/transactional/pause'
            );
            const resumeCallout = testUtils.getRestCallout(
                'post',
                '/interaction/v1/interactions/transactional/resume'
            );
            const pauseResumeResponse = {
                definitionId: 'dsfdsafdsa-922c-4568-85a5-e5cc77efc3be',
            };
            // confirm responses
            assert.deepEqual(
                pauseCallout,
                pauseResumeResponse,
                'pause-payload JSON was not equal expected'
            );
            assert.deepEqual(
                resumeCallout,
                pauseResumeResponse,
                'resume-payload JSON was not equal expected'
            );

            // confirm transactionalEmail was downloaded
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_temail', 'journey'),
                await testUtils.getExpectedJson('9999999', 'journey', 'get-transactionalEmail'),
                'returned JSON was not equal expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_temail', 'transactionalEmail'),
                await testUtils.getExpectedJson('9999999', 'transactionalEmail', 'get'),
                'returned JSON was not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                37,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should publish a transactional journey by key', async () => {
            handler.setOptions({ skipStatusCheck: true });
            // WHEN
            const publish = await handler.publish(
                'testInstance/testBU',
                ['journey'],
                ['testExisting_temail_notPublished']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'publish should not have thrown an error');
            // retrieve result
            assert.deepEqual(
                publish['testInstance/testBU']?.journey,
                ['testExisting_temail_notPublished'],
                'should have published the right journey'
            );

            // get callouts
            const publishCallout = testUtils.getRestCallout(
                'post',
                '/interaction/v1/interactions/transactional/create'
            );
            // confirm callouts
            assert.deepEqual(
                publishCallout,
                {
                    definitionId: 'd4a900fe-3a8f-4cc5-9a49-81286e3e2cd2',
                },
                'publish-payload JSON was not equal expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_temail_notPublished', 'journey'),
                await testUtils.getExpectedJson('9999999', 'journey', 'get-published'),
                'returned JSON was not equal expected'
            );

            // confirm transactionalEmail was downloaded
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_temail_notPublished',
                    'transactionalEmail'
                ),
                await testUtils.getExpectedJson('9999999', 'transactionalEmail', 'get-published'),
                'returned JSON was not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                35,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should publish a journey by key (auto-picks latest version)', async () => {
            handler.setOptions({ skipStatusCheck: true });
            // WHEN
            const publish = await handler.publish(
                'testInstance/testBU',
                ['journey'],
                ['testExisting_journey_Multistep']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'publish should not have thrown an error');
            // retrieve result
            assert.deepEqual(
                publish['testInstance/testBU']?.journey,
                ['testExisting_journey_Multistep'],
                'should have published the right journey'
            );

            // get callouts
            const publishCallout = testUtils.getRestCallout(
                'post',
                '/interaction/v1/interactions/publishAsync/%'
            );
            // confirm created item
            assert.deepEqual(
                publishCallout,
                await testUtils.getExpectedJson('9999999', 'journey', 'publish-callout'),
                'publish-payload JSON was not equal expected'
            );
            // confirm event was downloaded
            assert.deepEqual(
                await testUtils.getActualJson(
                    'DEAudience-2e3c73b6-48cc-2ec0-5522-48636e1a236e',
                    'event'
                ),
                await testUtils.getExpectedJson('9999999', 'event', 'get-published'),
                'returned JSON was not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                31,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should publish a journey by id w/ version', async () => {
            handler.setOptions({ skipStatusCheck: true });
            // WHEN
            const publish = await handler.publish(
                'testInstance/testBU',
                ['journey'],
                ['id:0175b971-71a3-4d8e-98ac-48121f3fbf4f/1']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'publish should not have thrown an error');
            // retrieve result
            assert.deepEqual(
                publish['testInstance/testBU']?.journey,
                ['id:0175b971-71a3-4d8e-98ac-48121f3fbf4f/1'],
                'should have published the right journey'
            );

            // get callouts
            const publishCallout = testUtils.getRestCallout(
                'post',
                '/interaction/v1/interactions/publishAsync/%'
            );
            // confirm created item
            assert.deepEqual(
                publishCallout,
                await testUtils.getExpectedJson('9999999', 'journey', 'publish-callout'),
                'publish-payload JSON was not equal expected'
            );
            // confirm event was downloaded
            assert.deepEqual(
                await testUtils.getActualJson(
                    'DEAudience-2e3c73b6-48cc-2ec0-5522-48636e1a236e',
                    'event'
                ),
                await testUtils.getExpectedJson('9999999', 'event', 'get-published'),
                'returned JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                31,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should publish a journey by id but w/o version (auto-picks latest version)', async () => {
            handler.setOptions({ skipStatusCheck: true });
            // WHEN
            const publish = await handler.publish(
                'testInstance/testBU',
                ['journey'],
                ['id:0175b971-71a3-4d8e-98ac-48121f3fbf4f']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'publish should not have thrown an error');
            // retrieve result
            assert.deepEqual(
                publish['testInstance/testBU']?.journey,
                ['id:0175b971-71a3-4d8e-98ac-48121f3fbf4f'],
                'should have published the right journey'
            );

            // get callouts
            const publishCallout = testUtils.getRestCallout(
                'post',
                '/interaction/v1/interactions/publishAsync/%'
            );
            // confirm created item
            assert.deepEqual(
                publishCallout,
                await testUtils.getExpectedJson('9999999', 'journey', 'publish-callout'),
                'publish-payload JSON was not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                31,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should publish a journey by id w/ version with failing status check', async () => {
            await testUtils.copyFile(
                'interaction/v1/interactions/publishStatus/45f06c0a-3ed2-48b2-a6a8-b5119253f01c/get-response-failed.json',
                'interaction/v1/interactions/publishStatus/45f06c0a-3ed2-48b2-a6a8-b5119253f01c/get-response.json'
            );

            handler.setOptions({ skipStatusCheck: false, _runningTest: true });
            // WHEN
            const publish = await handler.publish(
                'testInstance/testBU',
                ['journey'],
                ['id:0175b971-71a3-4d8e-98ac-48121f3fbf4f/1']
            );
            // THEN
            assert.equal(process.exitCode, 1, 'publish should have thrown an error');
            // retrieve result
            assert.equal(
                publish['testInstance/testBU']?.journey.length,
                0,
                'should have not published the journey'
            );

            // get callouts
            const publishCallout = testUtils.getRestCallout(
                'post',
                '/interaction/v1/interactions/publishAsync/%'
            );
            // confirm created item
            assert.deepEqual(
                publishCallout,
                await testUtils.getExpectedJson('9999999', 'journey', 'publish-callout'),
                'publish-payload JSON was not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                3,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should publish a journey by id w/ version with successful status check but with warnings', async () => {
            await testUtils.copyFile(
                'interaction/v1/interactions/publishStatus/45f06c0a-3ed2-48b2-a6a8-b5119253f01c/get-response-successWarnings.json',
                'interaction/v1/interactions/publishStatus/45f06c0a-3ed2-48b2-a6a8-b5119253f01c/get-response.json'
            );

            handler.setOptions({ skipStatusCheck: false, _runningTest: true });
            // WHEN
            const publish = await handler.publish(
                'testInstance/testBU',
                ['journey'],
                ['id:0175b971-71a3-4d8e-98ac-48121f3fbf4f/1']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'publish should not have thrown an error');
            // retrieve result
            assert.deepEqual(
                publish['testInstance/testBU']?.journey,
                ['testExisting_journey_Multistep'],
                'should have published the journey'
            );

            // get callouts
            const publishCallout = testUtils.getRestCallout(
                'post',
                '/interaction/v1/interactions/publishAsync/%'
            );
            // confirm created item
            assert.deepEqual(
                publishCallout,
                await testUtils.getExpectedJson('9999999', 'journey', 'publish-callout'),
                'publish-payload JSON was not equal expected'
            );
            // confirm event was downloaded
            assert.deepEqual(
                await testUtils.getActualJson(
                    'DEAudience-2e3c73b6-48cc-2ec0-5522-48636e1a236e',
                    'event'
                ),
                await testUtils.getExpectedJson('9999999', 'event', 'get-published'),
                'returned JSON was not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                32,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should publish a journey by id w/ version with successful status check', async () => {
            await testUtils.copyFile(
                'interaction/v1/interactions/publishStatus/45f06c0a-3ed2-48b2-a6a8-b5119253f01c/get-response-success.json',
                'interaction/v1/interactions/publishStatus/45f06c0a-3ed2-48b2-a6a8-b5119253f01c/get-response.json'
            );

            handler.setOptions({ skipStatusCheck: false, _runningTest: true });
            // WHEN
            const publish = await handler.publish(
                'testInstance/testBU',
                ['journey'],
                ['id:0175b971-71a3-4d8e-98ac-48121f3fbf4f/1']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'publish should not have thrown an error');
            // retrieve result
            assert.deepEqual(
                publish['testInstance/testBU']?.journey,
                ['testExisting_journey_Multistep'],
                'should have published the journey'
            );

            // get callouts
            const publishCallout = testUtils.getRestCallout(
                'post',
                '/interaction/v1/interactions/publishAsync/%'
            );
            // confirm created item
            assert.deepEqual(
                publishCallout,
                await testUtils.getExpectedJson('9999999', 'journey', 'publish-callout'),
                'publish-payload JSON was not equal expected'
            );
            // confirm event was downloaded
            assert.deepEqual(
                await testUtils.getActualJson(
                    'DEAudience-2e3c73b6-48cc-2ec0-5522-48636e1a236e',
                    'event'
                ),
                await testUtils.getExpectedJson('9999999', 'event', 'get-published'),
                'returned JSON was not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                32,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Validate ================', () => {
        it('Should not validate a transactional journey by key', async () => {
            handler.setOptions({ skipStatusCheck: true });
            // WHEN
            await handler.validate(
                'testInstance/testBU',
                ['journey'],
                ['testExisting_temail_notPublished']
            );
            // THEN
            assert.equal(process.exitCode, 1, 'validate should not have thrown an error');

            assert.equal(
                testUtils.getAPIHistoryLength(),
                1,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should validate a journey by id but w/o version (auto-picks latest version)', async () => {
            await testUtils.copyFile(
                'interaction/v1/interactions/validateStatus/45f06c0a-3ed2-48b2-a6a8-b5119253f01c/get-response-success.json',
                'interaction/v1/interactions/validateStatus/45f06c0a-3ed2-48b2-a6a8-b5119253f01c/get-response.json'
            );
            // WHEN
            const validate = await handler.validate(
                'testInstance/testBU',
                ['journey'],
                ['id:0175b971-71a3-4d8e-98ac-48121f3fbf4f']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'validate should not have thrown an error');
            // retrieve result
            assert.deepEqual(
                validate['testInstance/testBU']?.journey,
                ['testExisting_journey_Multistep'],
                'should have validateed the right journey'
            );

            // get callouts
            const validateCallout = testUtils.getRestCallout(
                'post',
                '/interaction/v1/interactions/validateAsync/%'
            );
            // confirm created item
            assert.deepEqual(
                validateCallout,
                await testUtils.getExpectedJson('9999999', 'journey', 'validate-callout'),
                'validate-payload JSON was not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                3,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should validate a journey by id w/ version with failing status check', async () => {
            await testUtils.copyFile(
                'interaction/v1/interactions/publishStatus/45f06c0a-3ed2-48b2-a6a8-b5119253f01c/get-response-failed.json',
                'interaction/v1/interactions/validateStatus/45f06c0a-3ed2-48b2-a6a8-b5119253f01c/get-response.json'
            );

            handler.setOptions({ _runningTest: true });
            // WHEN
            const validate = await handler.validate(
                'testInstance/testBU',
                ['journey'],
                ['id:0175b971-71a3-4d8e-98ac-48121f3fbf4f/1']
            );
            // THEN
            assert.equal(process.exitCode, 1, 'validate should have thrown an error');
            // retrieve result
            assert.equal(
                validate['testInstance/testBU']?.journey.length,
                0,
                'should have not validated the journey'
            );

            // get callouts
            const validateCallout = testUtils.getRestCallout(
                'post',
                '/interaction/v1/interactions/validateAsync/%'
            );
            // confirm created item
            assert.deepEqual(
                validateCallout,
                await testUtils.getExpectedJson('9999999', 'journey', 'validate-callout'),
                'validate-payload JSON was not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                3,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Refresh ================', () => {
        it('Should refresh all active journeys');

        it('Should refresh a specifc multi-step journey by key', async () => {
            // WHEN
            const replace = await handler.refresh('testInstance/testBU', {
                journey: ['testExisting_journey_Multistep'],
            });
            // THEN
            assert.equal(process.exitCode, 0, 'refresh should not have thrown an error');
            // retrieve result

            assert.deepEqual(
                replace['testInstance/testBU'].journey,
                ['testExisting_journey_Multistep'],
                'should have found the right journeys that need updating'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                6,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should refresh a specifc transactional send journey by key', async () => {
            // WHEN
            const replace = await handler.refresh('testInstance/testBU', {
                journey: ['testExisting_temail'],
            });
            // THEN
            assert.equal(process.exitCode, 0, 'refresh should not have thrown an error');
            // retrieve result

            assert.deepEqual(
                replace['testInstance/testBU'].journey,
                ['testExisting_temail'],
                'should have found the right journeys that need updating'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                36,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should refresh a specifc cross type journeys by key', async () => {
            // WHEN
            const replace = await handler.refresh('testInstance/testBU', {
                journey: ['testExisting_temail', 'testExisting_journey_Multistep'],
            });
            // THEN
            assert.equal(process.exitCode, 0, 'refresh should not have thrown an error');
            // retrieve result

            assert.deepEqual(
                replace['testInstance/testBU'].journey,
                ['testExisting_journey_Multistep', 'testExisting_temail'],
                'should have found the right journeys that need updating'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                41,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
});
