import * as chai from 'chai';
/** @type {typeof chai.assert} */
const assert = chai.assert;

import chaiFiles from 'chai-files';
import fs from 'fs-extra';
import { axiosInstance } from '../node_modules/sfmc-sdk/lib/util.js';
import cache from '../lib/util/cache.js';
import handler from '../lib/index.js';
import Journey from '../lib/metadataTypes/Journey.js';
import { Util } from '../lib/util/util.js';

const journeyTestAccess =
    /** @type {{_preDeployTasks_activities(metadata: ReturnType<JSON['parse']>): Promise.<void>}} */ (
        /** @type {unknown} */ (Journey)
    );
import * as testUtils from './utils.js';
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
                6,
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
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_journey_updatecontact_sharedDE',
                    'journey'
                ),
                await testUtils.getExpectedJson('9999999', 'journey', 'get-updatecontact-sharedDE'),
                'returned JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                33,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should retrieve journeys with dataExtension type simultaneously (mcdev retrieve cred/bu -m journey dataExtension)', async () => {
            // WHEN - both types at once, no keys: unrelated DEs present alongside UPDATECONTACTDATA DEs
            await handler.retrieve('testInstance/testBU', ['journey', 'dataExtension']);
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.journey ? Object.keys(result.journey).length : 0,
                6,
                'unexpected number of journeys (includes local-DE and shared-DE UPDATECONTACTDATA journeys)'
            );
            // Verify UPDATECONTACTDATA activity with local DE is correctly resolved
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_journey_updatecontact', 'journey'),
                await testUtils.getExpectedJson('9999999', 'journey', 'get-updatecontact'),
                'returned JSON was not equal expected for journey with local DE updatecontact activity'
            );
            // Verify UPDATECONTACTDATA activity with shared DE is correctly resolved
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_journey_updatecontact_sharedDE',
                    'journey'
                ),
                await testUtils.getExpectedJson('9999999', 'journey', 'get-updatecontact-sharedDE'),
                'returned JSON was not equal expected for journey with shared DE updatecontact activity'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                36,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should retrieve only published journeys', async () => {
            handler.setOptions({ onlyPublished: true });
            // WHEN
            await handler.retrieve('testInstance/testBU', ['journey']);
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.journey ? Object.keys(result.journey).length : 0,
                1,
                'unexpected number of journeys'
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
                21,
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
                21,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should retrieve the testExisting_journey_Push journey resolving its mobilePush & mobilePushApp dependencies with key', async () => {
            // WHEN
            await handler.retrieve(
                'testInstance/testBU',
                ['journey'],
                ['testExisting_journey_Push']
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

            const actualJourney = await testUtils.getActualJson(
                'testExisting_journey_Push',
                'journey'
            );
            assert.deepEqual(
                actualJourney,
                await testUtils.getExpectedJson(
                    '9999999',
                    'journey',
                    'get-testExisting_journey_Push'
                ),
                'returned JSON was not equal expected'
            );
            // confirm the mobilePush & mobilePushApp dependencies resolved on the push activity
            const pushActivity = actualJourney.activities.find(
                (activity) => activity.type === 'PUSHNOTIFICATIONACTIVITY'
            );
            assert.equal(
                pushActivity.configurationArguments.r__mobilePush_key,
                'MTk6MTE0OjA',
                'mobilePush dependency should have resolved to r__mobilePush_key'
            );
            assert.equal(
                pushActivity.configurationArguments.r__mobilePushApp_key,
                'YjhMeTFBUWgtRUNIUHNNN3hYbm5SQToxMTc6MA',
                'mobilePushApp dependency should have resolved to r__mobilePushApp_key'
            );
            // cross-BU coverage: retrieve must write BOTH the id-based _key AND the portable _name
            // ref for every resolved mobile dependency
            assert.equal(
                pushActivity.configurationArguments.r__mobilePush_name,
                'testExisting_mobilePush_asset_DEV',
                'mobilePush dependency should ALSO carry the portable r__mobilePush_name'
            );
            assert.equal(
                pushActivity.configurationArguments.r__mobilePushApp_name,
                'Test Push App Two',
                'mobilePushApp dependency should ALSO carry the portable r__mobilePushApp_name'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                21,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should retrieve an SMSSYNC journey and persist portable mobileMessage refs', async () => {
            await handler.retrieve('testInstance/testBU', ['journey'], ['smsParityJourney']);

            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            const actualJourney = await testUtils.getActualJson('smsParityJourney', 'journey');
            assert.deepEqual(
                actualJourney,
                await testUtils.getExpectedJson('9999999', 'journey', 'get-sms-parity'),
                'fixture-backed retrieve should persist the transformed Journey'
            );
            const smsArguments = actualJourney.activities.find(
                (activity) => activity.type === 'SMSSYNC'
            ).configurationArguments;
            assert.equal(smsArguments.r__mobileMessage_key, 'NTIzOjc4OjA');
            assert.equal(smsArguments.r__mobileMessage_name, 'testExisting_mobileMessage');
            assert.notProperty(smsArguments, 'messageId');
        });

        it('Should retrieve a journey containing an UPDATECONTACTDATA activity with key', async () => {
            // WHEN
            await handler.retrieve(
                'testInstance/testBU',
                ['journey'],
                ['testExisting_journey_updatecontact']
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
                await testUtils.getActualJson('testExisting_journey_updatecontact', 'journey'),
                await testUtils.getExpectedJson('9999999', 'journey', 'get-updatecontact'),
                'returned JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                22,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should retrieve a journey containing an UPDATECONTACTDATA activity referencing a shared DE with key', async () => {
            // WHEN
            await handler.retrieve(
                'testInstance/testBU',
                ['journey'],
                ['testExisting_journey_updatecontact_sharedDE']
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
                await testUtils.getActualJson(
                    'testExisting_journey_updatecontact_sharedDE',
                    'journey'
                ),
                await testUtils.getExpectedJson('9999999', 'journey', 'get-updatecontact-sharedDE'),
                'returned JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                22,
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
                25,
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
                21,
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
                22,
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

        it('Should deploy --publish an already published transactional journey by first pausing it', async () => {
            await testUtils.copyFile(
                'interaction/v1/interactions/key_testExisting_temail/put-response-paused.json',
                'interaction/v1/interactions/key_testExisting_temail/put-response.json'
            );
            // WHEN
            handler.setOptions({ skipStatusCheck: true, publish: true });
            const deploy = await handler.deploy(
                'testInstance/testBU',
                ['journey'],
                ['testExisting_temail']
            );

            // THEN
            assert.equal(process.exitCode, 0, 'deploy --publish should not have thrown an error');
            // retrieve result
            assert.deepEqual(
                Object.keys(deploy['testInstance/testBU']?.journey),
                ['testExisting_temail'],
                'should have published the right journey'
            );

            const pauseCallout = testUtils.getRestCallout(
                'post',
                '/interaction/v1/interactions/transactional/pause'
            );
            const resumeCallout = testUtils.getRestCallout(
                'post',
                '/interaction/v1/interactions/transactional/resume'
            );

            // confirm callouts
            assert.deepEqual(
                pauseCallout,
                {
                    definitionId: 'dsfdsafdsa-922c-4568-85a5-e5cc77efc3be',
                },
                'pauseCallout-payload JSON was not equal expected'
            );
            assert.deepEqual(
                resumeCallout,
                {
                    definitionId: 'dsfdsafdsa-922c-4568-85a5-e5cc77efc3be',
                },
                'resumeCallout-payload JSON was not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                64,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should update and publish a transactional journey', async () => {
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
                63,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should create and publish a transactional journey', async () => {
            // WHEN
            handler.setOptions({ skipStatusCheck: true, publish: true });
            const deploy = await handler.deploy(
                'testInstance/testBU',
                ['journey'],
                ['testNew_temail_notPublished']
            );

            // THEN
            assert.equal(process.exitCode, 0, 'deploy --publish should not have thrown an error');
            // retrieve result
            assert.deepEqual(
                Object.keys(deploy['testInstance/testBU']?.journey),
                ['testNew_temail_notPublished'],
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
                    definitionId: '4c39662b-7c47-4df4-8bd6-65f01c313e8c',
                },
                'publish-payload JSON was not equal expected'
            );

            // confirm transactionalEmail was downloaded
            assert.deepEqual(
                await testUtils.getActualJson('testNew_temail_notPublished', 'transactionalEmail'),
                await testUtils.getExpectedJson('9999999', 'transactionalEmail', 'create-publish'),
                'returned JSON was not equal expected'
            );
            // confirm journey was downloaded
            assert.deepEqual(
                await testUtils.getActualJson('testNew_temail_notPublished', 'journey'),
                await testUtils.getExpectedJson(
                    '9999999',
                    'journey',
                    'create-transactionaEmail-publish'
                ),
                'returned JSON was not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                63,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should update & publish a  multi-step journey by key (auto-picks latest version)', async () => {
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
                54,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should update a journey with UPDATECONTACT activity', async () => {
            // WHEN
            await handler.deploy(
                'testInstance/testBU',
                ['journey'],
                ['testExisting_journey_updatecontact']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            // // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_journey_updatecontact', 'journey'),
                await testUtils.getExpectedJson('9999999', 'journey', 'put-updatecontact'),
                'returned metadata was not equal expected for update journey with updatecontact activity'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                24,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should update a journey with UPDATECONTACT activity referencing a shared DE', async () => {
            // WHEN
            await handler.deploy(
                'testInstance/testBU',
                ['journey'],
                ['testExisting_journey_updatecontact_sharedDE']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_journey_updatecontact_sharedDE',
                    'journey'
                ),
                await testUtils.getExpectedJson('9999999', 'journey', 'put-updatecontact-sharedDE'),
                'returned metadata was not equal expected for update journey with shared DE updatecontact activity'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                24,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should resolve mobile journey references key-first/name-fallback with delete parity', async () => {
            cache.initCache({ mid: 9999999, eid: 1111111 });
            cache.setMetadata('mobilePush', {
                pushByKey: { id: 'pushByKey', name: 'Wrong Push Name' },
                pushByName: { id: 'pushByName', name: 'Portable Push' },
            });
            cache.setMetadata('mobilePushApp', {
                appByKey: { id: 'appByKeyId', key: 'appByKey', name: 'Wrong App Name' },
                appByName: { id: 'appByNameId', key: 'appByName', name: 'Portable App' },
            });
            cache.setMetadata('mobileMessage', {
                messageByName: { id: 'messageByName', name: 'Portable Message' },
            });

            const configurationArguments = {
                r__mobilePush_key: 'pushByKey',
                r__mobilePush_name: 'Portable Push',
                r__mobilePushApp_key: 'missingAppKey',
                r__mobilePushApp_name: 'Portable App',
                r__mobileMessage_key: 'missingMessageKey',
                r__mobileMessage_name: 'Portable Message',
            };
            await journeyTestAccess._preDeployTasks_activities({
                activities: [{ type: 'PUSHNOTIFICATIONACTIVITY', configurationArguments }],
            });

            assert.equal(configurationArguments.pushMessageId, 'pushByKey', 'push key should win');
            assert.equal(configurationArguments.application.id, 'appByNameId', 'app name fallback');
            assert.equal(
                configurationArguments.messageId,
                'messageByName',
                'message name fallback'
            );
            assert.property(configurationArguments, 'r__mobilePush_key');
            assert.property(configurationArguments, 'r__mobilePush_name');
            assert.property(configurationArguments, 'r__mobilePushApp_key');
            assert.property(configurationArguments, 'r__mobilePushApp_name');
            assert.notProperty(configurationArguments, 'r__mobileMessage_key');
            assert.notProperty(configurationArguments, 'r__mobileMessage_name');
        });

        it('Should resolve an SMSSYNC mobileMessage key before a different name match', async () => {
            cache.initCache({ mid: 9999999, eid: 1111111 });
            cache.setMetadata('mobileMessage', {
                messageByKey: { id: 'messageByKey', name: 'Key Selected Name' },
                messageByName: { id: 'messageByName', name: 'Portable Message' },
            });
            const configurationArguments = {
                r__mobileMessage_key: 'messageByKey',
                r__mobileMessage_name: 'Portable Message',
            };

            await journeyTestAccess._preDeployTasks_activities({
                activities: [{ type: 'SMSSYNC', configurationArguments }],
            });

            assert.equal(configurationArguments.messageId, 'messageByKey');
            assert.notProperty(configurationArguments, 'r__mobileMessage_key');
            assert.notProperty(configurationArguments, 'r__mobileMessage_name');
        });

        it('Should block Journey writes when an SMSSYNC mobileMessage is missing', async () => {
            cache.initCache({ mid: 9999999, eid: 1111111 });
            cache.setMetadata('mobileMessage', {});
            let missingError;
            try {
                await journeyTestAccess._preDeployTasks_activities({
                    activities: [
                        {
                            type: 'SMSSYNC',
                            configurationArguments: {
                                r__mobileMessage_key: 'missingMessageKey',
                                r__mobileMessage_name: 'Missing SMS',
                            },
                        },
                    ],
                });
            } catch (ex) {
                missingError = ex;
            }

            assert.equal(
                missingError?.message,
                "mobileMessage 'Missing SMS' not found on target BU — must be deployed first"
            );
            const history = testUtils.getAPIHistory();
            assert.lengthOf(
                (history.post || []).filter(
                    (request) => request.url === '/interaction/v1/interactions/'
                ),
                0
            );
            assert.lengthOf(
                (history.put || []).filter((request) =>
                    request.url.startsWith('/interaction/v1/interactions/')
                ),
                0
            );
        });

        it('Should block Journey writes when an SMSSYNC mobileMessage name is ambiguous', async () => {
            cache.initCache({ mid: 9999999, eid: 1111111 });
            cache.setMetadata('mobileMessage', {
                messageOne: { id: 'messageOne', name: 'Duplicate SMS' },
                messageTwo: { id: 'messageTwo', name: 'Duplicate SMS' },
            });
            let duplicateError;
            try {
                await journeyTestAccess._preDeployTasks_activities({
                    activities: [
                        {
                            type: 'SMSSYNC',
                            configurationArguments: {
                                r__mobileMessage_key: 'missingMessageKey',
                                r__mobileMessage_name: 'Duplicate SMS',
                            },
                        },
                    ],
                });
            } catch (ex) {
                duplicateError = ex;
            }

            assert.include(duplicateError?.message, 'Duplicate SMS');
            assert.include(duplicateError?.message, 'messageOne');
            assert.include(duplicateError?.message, 'messageTwo');
            assert.include(duplicateError?.message, 'clean up the duplicates first');
            const history = testUtils.getAPIHistory();
            assert.lengthOf(
                (history.post || []).filter(
                    (request) => request.url === '/interaction/v1/interactions/'
                ),
                0
            );
            assert.lengthOf(
                (history.put || []).filter((request) =>
                    request.url.startsWith('/interaction/v1/interactions/')
                ),
                0
            );
        });

        for (const scenario of [
            {
                action: 'create',
                journeyKey: 'sms_parity_create',
                responseFixture:
                    'test/resources/9999999/interaction/v1/interactions/post-response-sms_parity_create.json',
                responsePath:
                    'test/resources/9999999/interaction/v1/interactions/post-response.json',
                expectedFixture: 'sms-parity-create-deploy',
                expectedIdentity: 'sms-parity-create-id',
                title: 'Should create a Journey after updating its mobileMessage by unique name',
            },
            {
                action: 'update',
                journeyKey: 'testExisting_journey_updatecontact',
                responseFixture:
                    'test/resources/9999999/interaction/v1/interactions/key_testExisting_journey_updatecontact/put-response-sms-parity.json',
                responsePath:
                    'test/resources/9999999/interaction/v1/interactions/key_testExisting_journey_updatecontact/put-response.json',
                expectedFixture: 'sms-parity-update-deploy',
                expectedIdentity: '0175b971-71a3-4d8e-98ac-48121f3fbf4f',
                title: 'Should update a Journey after updating its mobileMessage by unique name',
            },
        ]) {
            // Register each named SMS success scenario as an isolated Mocha test.
            it(scenario.title, async () => {
                if (scenario.action === 'update') {
                    testUtils.copyToDeploy(
                        'journey/sms-parity-update-source.json',
                        `journey/${scenario.journeyKey}.journey-meta.json`
                    );
                }
                const messagePath =
                    'deploy/testInstance/testBU/mobileMessage/new.mobileMessage-meta.json';
                const message = /** @type {ReturnType<JSON['parse']>} */ (
                    await testUtils.getActualDeployJson('new', 'mobileMessage')
                );
                message.name = 'testExisting_mobileMessage';
                await fs.writeJson(messagePath, message);
                await fs.copy(scenario.responseFixture, scenario.responsePath, { overwrite: true });

                const requestOrder = [];
                const interceptorId = axiosInstance.interceptors.request.use((config) => {
                    requestOrder.push(`${config.method.toLowerCase()} ${config.url}`);
                    return config;
                });
                let deploy;
                try {
                    deploy = await handler.deploy('testInstance/testBU', {
                        mobileMessage: ['new'],
                        journey: [scenario.journeyKey],
                    });
                } finally {
                    axiosInstance.interceptors.request.eject(interceptorId);
                }

                assert.equal(process.exitCode, 0, 'combined deploy should succeed');
                assert.deepEqual(
                    Object.keys(deploy['testInstance/testBU']?.mobileMessage || {}),
                    ['NTIzOjc4OjA'],
                    'mobileMessage result should persist the target-BU id'
                );
                assert.deepEqual(
                    Object.keys(deploy['testInstance/testBU']?.journey || {}),
                    [scenario.journeyKey],
                    'handler result should contain the selected Journey key'
                );
                const deployedJourney = deploy['testInstance/testBU'].journey[scenario.journeyKey];
                assert.equal(
                    deployedJourney.id,
                    scenario.expectedIdentity,
                    'handler result should retain the scenario Journey id'
                );
                assert.equal(
                    deployedJourney.definitionId,
                    scenario.expectedIdentity,
                    'handler result should retain the scenario Journey definitionId'
                );
                const history = testUtils.getAPIHistory();
                const messagePosts = (history.post || []).filter((request) =>
                    request.url.startsWith('/legacy/v1/beta/mobile/message/')
                );
                assert.deepEqual(
                    messagePosts.map((request) => request.url),
                    ['/legacy/v1/beta/mobile/message/NTIzOjc4OjA'],
                    'unique name fallback should update the target mobileMessage by item POST'
                );
                assert.lengthOf(
                    messagePosts.filter(
                        (request) => request.url === '/legacy/v1/beta/mobile/message/'
                    ),
                    0,
                    'unique name fallback must not create a duplicate mobileMessage'
                );
                const journeyMethod = scenario.action === 'create' ? 'post' : 'put';
                const journeyUrl =
                    scenario.action === 'create'
                        ? '/interaction/v1/interactions/'
                        : `/interaction/v1/interactions/key:${scenario.journeyKey}`;
                const journeyWrite = (history[journeyMethod] || []).find(
                    (request) => request.url === journeyUrl
                );
                assert.exists(journeyWrite, `${scenario.action} Journey write should occur`);
                const journeyPayload = JSON.parse(journeyWrite.data);
                const smsArguments = journeyPayload.activities.find(
                    (activity) => activity.type === 'SMSSYNC'
                ).configurationArguments;
                assert.equal(smsArguments.messageId, 'NTIzOjc4OjA');
                assert.notProperty(smsArguments, 'r__mobileMessage_key');
                assert.notProperty(smsArguments, 'r__mobileMessage_name');
                const messageIndex = requestOrder.indexOf(
                    'post /legacy/v1/beta/mobile/message/NTIzOjc4OjA'
                );
                const journeyIndex = requestOrder.indexOf(`${journeyMethod} ${journeyUrl}`);
                assert.isAtLeast(messageIndex, 0, 'mobileMessage item POST should be recorded');
                assert.isAbove(
                    journeyIndex,
                    messageIndex,
                    'mobileMessage item POST must occur before the Journey write'
                );
                assert.equal(
                    (await testUtils.getActualJson('NTIzOjc4OjA', 'mobileMessage')).id,
                    'NTIzOjc4OjA'
                );
                const persistedJourney = await testUtils.getActualJson(
                    scenario.journeyKey,
                    'journey'
                );
                assert.deepEqual(
                    persistedJourney,
                    await testUtils.getExpectedJson('9999999', 'journey', scenario.expectedFixture),
                    'persisted Journey should match the scenario response'
                );
                const persistedSmsActivity = persistedJourney.activities.find(
                    (activity) => activity.type === 'SMSSYNC'
                );
                assert.exists(persistedSmsActivity, 'persisted Journey should retain SMSSYNC');
                assert.equal(
                    persistedSmsActivity.configurationArguments.r__mobileMessage_key,
                    'NTIzOjc4OjA'
                );
                assert.equal(
                    persistedSmsActivity.configurationArguments.r__mobileMessage_name,
                    'testExisting_mobileMessage'
                );
                assert.notProperty(
                    persistedSmsActivity.configurationArguments,
                    'messageId',
                    'persisted portable metadata should not retain the target messageId'
                );
            });
        }

        for (const scenario of [
            {
                kind: 'missing',
                journeyKey: 'sms_parity_create',
                messageName: 'Missing SMS',
                candidateIds: [],
                title: 'Should block combined deploy when the mobileMessage reference is missing',
            },
            {
                kind: 'ambiguous',
                journeyKey: 'sms_parity_create',
                messageName: 'Duplicate SMS',
                candidateIds: ['duplicateMessageOne', 'duplicateMessageTwo'],
                title: 'Should block combined deploy when the mobileMessage reference is ambiguous',
            },
        ]) {
            // Register each named SMS failure scenario as an isolated Mocha test.
            it(scenario.title, async () => {
                const journey = /** @type {ReturnType<JSON['parse']>} */ (
                    await testUtils.getActualDeployJson(scenario.journeyKey, 'journey')
                );
                const smsArguments = journey.activities.find(
                    (activity) => activity.type === 'SMSSYNC'
                ).configurationArguments;
                smsArguments.r__mobileMessage_key = 'missingMessageKey';
                smsArguments.r__mobileMessage_name = scenario.messageName;
                await fs.writeJson(
                    `deploy/testInstance/testBU/journey/${scenario.journeyKey}.journey-meta.json`,
                    journey
                );
                if (scenario.kind === 'ambiguous') {
                    const fixturePath =
                        'test/resources/9999999/legacy/v1/beta/mobile/message/get-response.json';
                    const fixture = await fs.readJson(fixturePath);
                    fixture.entry = scenario.candidateIds.map((id) => ({
                        ...fixture.entry[0],
                        id,
                        name: scenario.messageName,
                    }));
                    fixture.totalResults = fixture.entry.length;
                    await fs.writeJson(fixturePath, fixture);
                }

                const errors = [];
                const originalErrorStack = Util.logger.errorStack;
                /**
                 * Captures the real item-level deploy error while preserving logger behavior.
                 *
                 * @param {Error} error deployment error
                 * @param {string} message item-level context
                 * @returns {unknown} original logger result
                 */
                Util.logger.errorStack = function (error, message) {
                    errors.push(`${message}: ${error?.message || error}`);
                    return originalErrorStack.call(this, error, message);
                };
                try {
                    await handler.deploy('testInstance/testBU', {
                        journey: [scenario.journeyKey],
                    });
                } finally {
                    Util.logger.errorStack = originalErrorStack;
                }

                const emittedError = errors.join('\n');
                if (scenario.kind === 'missing') {
                    assert.include(
                        emittedError,
                        "mobileMessage 'Missing SMS' not found on target BU — must be deployed first"
                    );
                } else {
                    assert.include(emittedError, scenario.messageName);
                    assert.include(emittedError, scenario.candidateIds[0]);
                    assert.include(emittedError, scenario.candidateIds[1]);
                    assert.include(emittedError, 'clean up the duplicates first');
                }
                const history = testUtils.getAPIHistory();
                assert.lengthOf(
                    (history.post || []).filter(
                        (request) =>
                            request.url === '/interaction/v1/interactions/' ||
                            request.url.startsWith('/legacy/v1/beta/mobile/message/')
                    ),
                    0,
                    'failure must make no Journey or mobileMessage POST writes'
                );
                assert.lengthOf(
                    (history.put || []).filter((request) =>
                        request.url.startsWith('/interaction/v1/interactions/')
                    ),
                    0,
                    'failure must make no Journey PUT writes'
                );
            });
        }

        /** @type {['create' | 'update', string, string, string, boolean, string][]} */
        const mobilePushScenarios = [
            [
                'create',
                'pre-exists',
                'scenario_create_present',
                'scenario_present_mobilePush',
                true,
                'Should create a journey with its matching mobilePush when mobilePushApp pre-exists',
            ],
            [
                'create',
                'is absent',
                'scenario_create_missing',
                'test_mobilePush_missingApp',
                false,
                'Should create a journey with its matching mobilePush when mobilePushApp is absent',
            ],
            [
                'update',
                'pre-exists',
                'testExisting_journey_updatecontact',
                'scenario_present_mobilePush',
                true,
                'Should update a journey with its matching mobilePush when mobilePushApp pre-exists',
            ],
            [
                'update',
                'is absent',
                'testExisting_journey_updatecontact_sharedDE',
                'test_mobilePush_missingApp',
                false,
                'Should update a journey with its matching mobilePush when mobilePushApp is absent',
            ],
        ];
        for (const [
            action,
            appState,
            journeyKey,
            mobilePushKey,
            succeeds,
            title,
        ] of mobilePushScenarios) {
            // Register each literal scenario as an isolated Mocha test.
            it(title, async () => {
                if (action === 'update') {
                    testUtils.copyToDeploy(
                        `journey/scenario-update-${succeeds ? 'present' : 'missing'}-source.json`,
                        `journey/${journeyKey}.journey-meta.json`
                    );
                }

                cache.initCache({ mid: 9999999, eid: 1111111 });
                cache.setMetadata('mobilePushApp', {
                    targetApp: {
                        id: '7d00d57d-0d94-4a5d-85bd-b51a47ba1b9f',
                        key: 'targetOnlyAppKey',
                        name: 'Test Push App One',
                    },
                });
                assert.notProperty(
                    cache.getCache().mobilePushApp,
                    'sourceOnlyAppKey',
                    `${action}/${appState}: source app key must not exist in the target cache`
                );
                if (!succeeds) {
                    const scenarioMetadata = /** @type {ReturnType<JSON['parse']>} */ (
                        await testUtils.getActualDeployJson(journeyKey, 'journey')
                    );
                    const pushReference = scenarioMetadata.activities.find(
                        (activity) => activity.type === 'PUSHNOTIFICATIONACTIVITY'
                    ).configurationArguments;
                    assert.deepInclude(
                        pushReference,
                        {
                            r__mobilePushApp_key: 'doesNotExist_appKey',
                            r__mobilePushApp_name: 'This App Does Not Exist On Target',
                        },
                        `${action}/${appState}: failing fixture should pair the missing app key and name`
                    );
                    assert.notProperty(
                        cache.getCache().mobilePushApp,
                        pushReference.r__mobilePushApp_key,
                        `${action}/${appState}: referenced app key must not exist in the target cache`
                    );
                }

                const errors = [];
                const originalError = Util.logger.error;
                const originalErrorStack = Util.logger.errorStack;
                /**
                 * Captures deploy errors using the logger contract.
                 *
                 * @param {unknown} message logger message
                 * @returns {import('winston').Logger} logger instance
                 */
                Util.logger.error = function (message) {
                    errors.push(String(message));
                    return this;
                };
                Util.logger.errorStack = (error, message) => {
                    errors.push(`${message}: ${error?.message || error}`);
                    process.exitCode = 1;
                };
                let deploy;
                try {
                    deploy = await handler.deploy('testInstance/testBU', {
                        journey: [journeyKey],
                        mobilePush: [mobilePushKey],
                    });
                } finally {
                    Util.logger.error = originalError;
                    Util.logger.errorStack = originalErrorStack;
                }

                const history = testUtils.getAPIHistory();
                const journeyPosts = (history.post || []).filter(
                    (request) => request.url === '/interaction/v1/interactions/'
                );
                const journeyPuts = (history.put || []).filter((request) =>
                    request.url.startsWith('/interaction/v1/interactions/')
                );
                const mobilePushPosts = (history.post || []).filter(
                    (request) => request.url === '/push/v1/message/'
                );
                const mobilePushPuts = (history.put || []).filter((request) =>
                    request.url.startsWith('/push/v1/message/')
                );

                if (succeeds) {
                    assert.equal(process.exitCode, 0, 'combined deploy should succeed');
                    assert.deepEqual(
                        Object.keys(deploy['testInstance/testBU']?.mobilePush || {}),
                        ['MTk6MTE0OjA'],
                        'the matching mobilePush should resolve by name and update'
                    );
                    assert.deepEqual(
                        Object.keys(deploy['testInstance/testBU']?.journey || {}),
                        [
                            action === 'create'
                                ? 'testNew_temail_notPublished'
                                : 'testExisting_journey_updatecontact',
                        ],
                        `the journey should use the ${action} API path`
                    );
                    assert.deepEqual(
                        mobilePushPuts.map((request) => request.url),
                        ['/push/v1/message/MTk6MTE0OjA'],
                        `${action}/${appState}: matching mobilePush should be updated`
                    );
                    assert.lengthOf(
                        mobilePushPosts,
                        0,
                        `${action}/${appState}: name fallback must not create a duplicate mobilePush`
                    );
                    const expectedJourneyUrl =
                        action === 'create'
                            ? '/interaction/v1/interactions/'
                            : `/interaction/v1/interactions/key:${journeyKey}`;
                    const expectedJourneyWrites = action === 'create' ? journeyPosts : journeyPuts;
                    const oppositeJourneyWrites = action === 'create' ? journeyPuts : journeyPosts;
                    assert.deepEqual(
                        expectedJourneyWrites.map((request) => request.url),
                        [expectedJourneyUrl],
                        `${action}/${appState}: expected Journey write method and path should occur once`
                    );
                    assert.lengthOf(
                        oppositeJourneyWrites,
                        0,
                        `${action}/${appState}: opposite Journey write method must not occur`
                    );
                    const journeyCallout = JSON.parse(expectedJourneyWrites[0].data);
                    const pushActivity = journeyCallout.activities.find(
                        (activity) => activity.type === 'PUSHNOTIFICATIONACTIVITY'
                    );
                    assert.equal(pushActivity.configurationArguments.pushMessageId, 'MTk6MTE0OjA');
                    assert.equal(
                        pushActivity.configurationArguments.application.id,
                        '7d00d57d-0d94-4a5d-85bd-b51a47ba1b9f',
                        'the source app key should miss and the app name fallback should resolve'
                    );
                } else {
                    assert.equal(process.exitCode, 1, 'combined deploy should fail');
                    assert.deepEqual(
                        Object.keys(deploy['testInstance/testBU']?.mobilePush || {}),
                        [],
                        'missing mobilePushApp should prevent mobilePush deployment'
                    );
                    assert.deepEqual(
                        Object.keys(deploy['testInstance/testBU']?.journey || {}),
                        [],
                        'missing mobilePushApp should prevent journey deployment'
                    );
                    const emittedError = errors.join('\n');
                    assert.include(
                        emittedError,
                        'mobilePushApp',
                        `${action}/${appState}: error should identify the missing dependency type`
                    );
                    assert.include(
                        emittedError,
                        'This App Does Not Exist On Target',
                        `${action}/${appState}: error should identify the missing app name after key lookup misses`
                    );
                    assert.lengthOf(
                        journeyPosts,
                        0,
                        `${action}/${appState}: failure must make no Journey POST writes`
                    );
                    assert.lengthOf(
                        journeyPuts,
                        0,
                        `${action}/${appState}: failure must make no Journey PUT writes`
                    );
                    assert.lengthOf(
                        mobilePushPosts,
                        0,
                        `${action}/${appState}: failure must make no mobilePush POST writes`
                    );
                    assert.lengthOf(
                        mobilePushPuts,
                        0,
                        `${action}/${appState}: failure must make no mobilePush PUT writes`
                    );
                }
            });
        }
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
                33,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should create a journey template via buildTemplate with --dependencies', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['journey', 'asset']);
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');

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
                    'asset',
                    'dataExtension',
                    'domainVerification',
                    'event',
                    'journey',
                    'sendClassification',
                    'senderProfile',
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
            // domainVerification
            assert.deepEqual(
                templatedItems.domainVerification.map((item) => item.domain),
                ['joern.berkefeld+test@accenture.com', 'joern.berkefeld@accenture.com'],
                'expected specific domainVerifications to be templated'
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
                39,
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
                39,
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
                39,
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
                40,
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
                38,
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
                33,
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
                33,
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
                33,
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
                34,
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
                34,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Validate ================', () => {
        it('Should not validate a transactional journey by key', async () => {
            handler.setOptions({ skipStatusCheck: true });
            // WHEN
            const validate = await handler.validate(
                'testInstance/testBU',
                ['journey'],
                ['testExisting_temail_notPublished']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'validate should not have thrown an error');
            // retrieve result
            assert.deepEqual(
                validate['testInstance/testBU']?.journey,
                [],
                'should not have validated any journey'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                1,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should validate a multi-step journey but not the transactional journey by key', async () => {
            await testUtils.copyFile(
                'interaction/v1/interactions/validateStatus/45f06c0a-3ed2-48b2-a6a8-b5119253f01c/get-response-success.json',
                'interaction/v1/interactions/validateStatus/45f06c0a-3ed2-48b2-a6a8-b5119253f01c/get-response.json'
            );
            handler.setOptions({ skipStatusCheck: true });
            // WHEN
            const validate = await handler.validate(
                'testInstance/testBU',
                ['journey'],
                ['testExisting_temail_notPublished', 'testExisting_journey_Multistep']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'validate should not have thrown an error');
            // retrieve result
            assert.deepEqual(
                validate['testInstance/testBU']?.journey,
                ['testExisting_journey_Multistep'],
                'should not have validated any journey'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                3,
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
                39,
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
                ['testExisting_temail', 'testExisting_journey_Multistep'],
                'should have found the right journeys that need updating'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                44,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Audit ================', () => {
        it('Should show audit log of a transactional journey and version', async () => {
            const audit = await handler.audit('testInstance/testBU', {
                journey: ['testExisting_temail/2'],
            });
            // THEN
            assert.equal(process.exitCode, 0, 'audit should not have thrown an error');

            assert.deepEqual(
                audit['testInstance/testBU'].journey,
                ['testExisting_temail'],
                'should have returned the right journeys'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                2,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );

            return;
        });

        it('Should show audit log of a transactional journey with all its versions', async () => {
            const audit = await handler.audit('testInstance/testBU', {
                journey: ['testExisting_temail'],
            });
            // THEN
            assert.equal(process.exitCode, 0, 'audit should not have thrown an error');

            assert.deepEqual(
                audit['testInstance/testBU'].journey,
                ['testExisting_temail'],
                'should have returned the right journeys'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                3,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );

            return;
        });

        it('Should not show audit log of a transactional journey with a too high version', async () => {
            const audit = await handler.audit('testInstance/testBU', {
                journey: ['testExisting_temail/99'],
            });
            // THEN
            assert.equal(process.exitCode, 404, 'audit should have thrown an error');

            assert.deepEqual(
                audit['testInstance/testBU'].journey,
                [],
                'should have returned the right journeys'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                2,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );

            return;
        });

        it('Should show audit log of a multi-step journey and version', async () => {
            const audit = await handler.audit('testInstance/testBU', {
                journey: ['testExisting_journey_Multistep/1'],
            });
            // THEN
            assert.equal(process.exitCode, 0, 'audit should not have thrown an error');

            assert.deepEqual(
                audit['testInstance/testBU'].journey,
                ['testExisting_journey_Multistep'],
                'should have returned the right journeys'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                2,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );

            return;
        });

        it('Should show audit log of a multi-step journey with all its versions', async () => {
            const audit = await handler.audit('testInstance/testBU', {
                journey: ['testExisting_journey_Multistep'],
            });
            // THEN
            assert.equal(process.exitCode, 0, 'audit should not have thrown an error');

            assert.deepEqual(
                audit['testInstance/testBU'].journey,
                ['testExisting_journey_Multistep'],
                'should have returned the right journeys'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                4,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );

            return;
        });

        it('Should show audit log of a multi-step journey with all its versions via /*', async () => {
            const audit = await handler.audit('testInstance/testBU', {
                journey: ['testExisting_journey_Multistep'],
            });
            // THEN
            assert.equal(process.exitCode, 0, 'audit should not have thrown an error');

            assert.deepEqual(
                audit['testInstance/testBU'].journey,
                ['testExisting_journey_Multistep'],
                'should have returned the right journeys'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                4,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );

            return;
        });
    });
});
