import * as chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;

import chaiFiles from 'chai-files';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);

describe('GENERAL', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });

    afterEach(() => {
        testUtils.mockReset();
    });

    describe('ReplaceContentBlockByX ================', () => {
        describe('with types specified ================', () => {
            it('Should replace references with ContentBlockByName w/o deploy', async () => {
                handler.setOptions({ skipDeploy: true });

                // WHEN
                const replace = await handler.replaceCbReference(
                    'testInstance/testBU',
                    {
                        journey: null,
                        senderProfile: null,
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
                assert.deepEqual(
                    replace['testInstance/testBU'].senderProfile,
                    ['testExisting_senderProfile_rcb'],
                    'should have found the right senderProfiles that need updating'
                );

                // check if conversions happened
                assert.deepEqual(
                    await testUtils.getActualJson('testExisting_journey_Quicksend', 'journey'),
                    await testUtils.getExpectedJson('9999999', 'journey', 'get-quicksend-rcb-name'),
                    'returned JSON was not equal expected'
                );
                assert.deepEqual(
                    await testUtils.getActualJson(
                        'testExisting_senderProfile_rcb',
                        'senderProfile'
                    ),
                    await testUtils.getExpectedJson('9999999', 'senderProfile', 'get-rcb-name'),
                    'returned JSON was not equal expected'
                );

                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    44,
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
                        senderProfile: null,
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
                assert.deepEqual(
                    replace['testInstance/testBU'].senderProfile,
                    ['testExisting_senderProfile_rcb'],
                    'should have found the right senderProfiles that need updating'
                );

                // check if conversions happened
                assert.deepEqual(
                    await testUtils.getActualJson('testExisting_journey_Quicksend', 'journey'),
                    await testUtils.getExpectedJson('9999999', 'journey', 'get-quicksend-rcb-id'),
                    'returned JSON was not equal expected'
                );
                assert.deepEqual(
                    await testUtils.getActualJson(
                        'testExisting_senderProfile_rcb',
                        'senderProfile'
                    ),
                    await testUtils.getExpectedJson('9999999', 'senderProfile', 'get-rcb-id'),
                    'returned JSON was not equal expected'
                );

                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    44,
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
                        senderProfile: null,
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
                assert.deepEqual(
                    replace['testInstance/testBU'].senderProfile,
                    ['testExisting_senderProfile_rcb'],
                    'should have found the right senderProfiles that need updating'
                );

                // check if conversions happened
                assert.deepEqual(
                    await testUtils.getActualJson('testExisting_journey_Quicksend', 'journey'),
                    await testUtils.getExpectedJson('9999999', 'journey', 'get-quicksend-rcb-key'),
                    'returned JSON was not equal expected'
                );
                assert.deepEqual(
                    await testUtils.getActualJson(
                        'testExisting_senderProfile_rcb',
                        'senderProfile'
                    ),
                    await testUtils.getExpectedJson('9999999', 'senderProfile', 'get-rcb-key'),
                    'returned JSON was not equal expected'
                );

                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    44,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
                return;
            });
        });

        describe('without types specified ================', () => {
            it('Should replace references with ContentBlockByName w/o deploy', async () => {
                handler.setOptions({ skipDeploy: true });

                // WHEN
                const replace = await handler.replaceCbReference(
                    'testInstance/testBU',
                    undefined,
                    'name'
                );
                // THEN
                assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
                // retrieve result
                assert.deepEqual(
                    replace['testInstance/testBU'].asset,
                    [
                        'testExisting_asset_htmlblock',
                        'testExisting_htmlblock1',
                        'testExisting_htmlblock 3 spaces',
                        'testExisting_asset_message',
                    ],
                    'should have found the right assets that need updating'
                );
                assert.deepEqual(
                    replace['testInstance/testBU'].journey,
                    ['testExisting_journey_Quicksend'],
                    'should have found the right assets that need updating'
                );
                assert.deepEqual(
                    replace['testInstance/testBU'].script,
                    [
                        'testExisting_script_ampscript',
                        'testExisting_script_ampincluded',
                        'testExisting_script_mixed',
                    ],
                    'should have found the right scripts that need updating'
                );
                assert.deepEqual(
                    replace['testInstance/testBU'].senderProfile,
                    ['testExisting_senderProfile_rcb'],
                    'should have found the right senderProfiles that need updating'
                );

                // check if conversions happened
                assert.deepEqual(
                    await testUtils.getActualJson('testExisting_journey_Quicksend', 'journey'),
                    await testUtils.getExpectedJson('9999999', 'journey', 'get-quicksend-rcb-name'),
                    'returned JSON was not equal expected'
                );
                assert.deepEqual(
                    await testUtils.getActualJson(
                        'testExisting_senderProfile_rcb',
                        'senderProfile'
                    ),
                    await testUtils.getExpectedJson('9999999', 'senderProfile', 'get-rcb-name'),
                    'returned JSON was not equal expected'
                );

                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    76,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
                return;
            });

            it('Should replace references with ContentBlockById w/o deploy', async () => {
                handler.setOptions({ skipDeploy: true });

                // WHEN
                const replace = await handler.replaceCbReference(
                    'testInstance/testBU',
                    undefined,
                    'id'
                );
                // THEN
                assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
                // retrieve result
                assert.deepEqual(
                    replace['testInstance/testBU'].asset,
                    [
                        'testExisting_htmlblock1',
                        'testExisting_htmlblock 3 spaces',
                        'testExisting_asset_message',
                    ],
                    'should have found the right assets that need updating'
                );
                assert.deepEqual(
                    replace['testInstance/testBU'].journey,
                    ['testExisting_journey_Quicksend'],
                    'should have found the right assets that need updating'
                );
                assert.deepEqual(
                    replace['testInstance/testBU'].script,
                    ['testExisting_script_ampscript', 'testExisting_script_mixed'],
                    'should have found the right scripts that need updating'
                );
                assert.deepEqual(
                    replace['testInstance/testBU'].senderProfile,
                    ['testExisting_senderProfile_rcb'],
                    'should have found the right senderProfiles that need updating'
                );

                // check if conversions happened
                assert.deepEqual(
                    await testUtils.getActualJson('testExisting_journey_Quicksend', 'journey'),
                    await testUtils.getExpectedJson('9999999', 'journey', 'get-quicksend-rcb-id'),
                    'returned JSON was not equal expected'
                );
                assert.deepEqual(
                    await testUtils.getActualJson(
                        'testExisting_senderProfile_rcb',
                        'senderProfile'
                    ),
                    await testUtils.getExpectedJson('9999999', 'senderProfile', 'get-rcb-id'),
                    'returned JSON was not equal expected'
                );

                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    76,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
                return;
            });

            it('Should replace references with ContentBlockByKey w/o deploy', async () => {
                handler.setOptions({ skipDeploy: true });

                // WHEN
                const replace = await handler.replaceCbReference(
                    'testInstance/testBU',
                    undefined,
                    'key'
                );
                // THEN
                assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
                // retrieve result
                assert.deepEqual(
                    replace['testInstance/testBU'].asset,
                    [
                        'testExisting_asset_htmlblock',
                        'testExisting_htmlblock1',
                        'testExisting_asset_message',
                    ],
                    'should have found the right assets that need updating'
                );
                assert.deepEqual(
                    replace['testInstance/testBU'].journey,
                    ['testExisting_journey_Quicksend'],
                    'should have found the right assets that need updating'
                );
                assert.deepEqual(
                    replace['testInstance/testBU'].script,
                    ['testExisting_script_ampscript', 'testExisting_script_ampincluded'],
                    'should have found the right scripts that need updating'
                );
                assert.deepEqual(
                    replace['testInstance/testBU'].senderProfile,
                    ['testExisting_senderProfile_rcb'],
                    'should have found the right senderProfiles that need updating'
                );

                // check if conversions happened
                assert.deepEqual(
                    await testUtils.getActualJson('testExisting_journey_Quicksend', 'journey'),
                    await testUtils.getExpectedJson('9999999', 'journey', 'get-quicksend-rcb-key'),
                    'returned JSON was not equal expected'
                );
                assert.deepEqual(
                    await testUtils.getActualJson(
                        'testExisting_senderProfile_rcb',
                        'senderProfile'
                    ),
                    await testUtils.getExpectedJson('9999999', 'senderProfile', 'get-rcb-key'),
                    'returned JSON was not equal expected'
                );

                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    76,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
                return;
            });
        });
    });

    describe('with --metadata ================', () => {
        describe('retrieve --metadata ~~~', () => {
            it('retrieve single type without keys', async () => {
                const argvMetadata = ['dataExtract'];
                const typeKeyCombo = handler.metadataToTypeKey(argvMetadata);
                assert.notEqual(
                    typeof typeKeyCombo,
                    'undefined',
                    'typeKeyCombo should not be undefined'
                );
                const buName = 'testInstance/testBU';
                const result = await handler.retrieve(buName, typeKeyCombo);
                // THEN
                assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');

                const retrievedTypes = Object.keys(result[buName]);
                assert.equal(retrievedTypes.length, 1, 'retrieve should have returned 1 type');
                assert.equal(
                    retrievedTypes[0],
                    'dataExtract',
                    'retrieve should have returned 1 type'
                );
                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    9,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });

            it('retrieve multiple type without keys', async () => {
                const argvMetadata = ['dataExtension', 'senderProfile'];
                const typeKeyCombo = handler.metadataToTypeKey(argvMetadata);
                assert.notEqual(
                    typeof typeKeyCombo,
                    'undefined',
                    'typeKeyCombo should not be undefined'
                );
                const buName = 'testInstance/testBU';
                const result = await handler.retrieve(buName, typeKeyCombo);
                // THEN
                assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');

                const retrievedTypes = Object.keys(result[buName]);
                assert.equal(retrievedTypes.length, 2, 'retrieve should have returned 2 types');
                assert.equal(
                    retrievedTypes[0],
                    'dataExtension',
                    'retrieve should have returned dataExtension'
                );
                assert.equal(
                    retrievedTypes[1],
                    'senderProfile',
                    'retrieve should have returned senderProfile'
                );
                assert.equal(
                    Object.keys(result[buName]['senderProfile']).length,
                    3,
                    'retrieve should have returned 3 senderProfile'
                );
                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    10,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });

            it('retrieve multiple type with keys', async () => {
                const argvMetadata = [
                    'dataExtension',
                    'dataExtract:wrong-key',
                    'senderProfile:Default',
                    'query:testExisting_query',
                    'query:key:testExisting_query2',
                ];
                const typeKeyCombo = handler.metadataToTypeKey(argvMetadata);
                assert.notEqual(
                    typeof typeKeyCombo,
                    'undefined',
                    'typeKeyCombo should not be undefined'
                );
                const buName = 'testInstance/testBU';
                const result = await handler.retrieve(buName, typeKeyCombo);
                // THEN
                assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');

                const retrievedTypes = Object.keys(result[buName]);
                assert.equal(retrievedTypes.length, 4, 'retrieve should have returned 4 types');
                assert.equal(
                    retrievedTypes.includes('dataExtension'),
                    true,
                    'retrieve should have returned dataExtension'
                );
                assert.equal(
                    retrievedTypes.includes('dataExtract'),
                    true,
                    'retrieve should have returned dataExtract'
                );
                assert.equal(
                    retrievedTypes.includes('senderProfile'),
                    true,
                    'retrieve should have returned senderProfile'
                );
                assert.equal(
                    retrievedTypes.includes('query'),
                    true,
                    'retrieve should have returned query'
                );
                assert.equal(
                    Object.keys(result[buName]['dataExtension']).length,
                    8,
                    'retrieve should have returned 7 dataExtension'
                );
                assert.equal(
                    Object.keys(result[buName]['dataExtract']).length,
                    0,
                    'retrieve should have returned 0 dataExtracts'
                );
                assert.equal(
                    Object.keys(result[buName]['senderProfile']).length,
                    1,
                    'retrieve should have returned 1 senderProfile'
                );
                assert.equal(
                    Object.keys(result[buName]['query']).length,
                    2,
                    'retrieve should have returned 2 query'
                );
                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    18,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });
        });

        describe('deploy --metadata ~~~', () => {
            beforeEach(() => {
                testUtils.mockSetup(true);
            });

            it('deploy single type without keys', async () => {
                const argvMetadata = ['dataExtract'];
                const typeKeyCombo = handler.metadataToTypeKey(argvMetadata);
                assert.notEqual(
                    typeof typeKeyCombo,
                    'undefined',
                    'typeKeyCombo should not be undefined'
                );
                const buName = 'testInstance/testBU';
                const result = await handler.deploy(buName, typeKeyCombo);
                // THEN
                assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');

                const deployedTypes = Object.keys(result[buName]);
                assert.equal(deployedTypes.length, 1, 'deploy should have returned 1 type');
                assert.equal(deployedTypes[0], 'dataExtract', 'deploy should have returned 1 type');
                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    13,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });

            it('deploy multiple type without keys', async () => {
                const argvMetadata = ['dataExtension', 'senderProfile'];
                const typeKeyCombo = handler.metadataToTypeKey(argvMetadata);
                assert.notEqual(
                    typeof typeKeyCombo,
                    'undefined',
                    'typeKeyCombo should not be undefined'
                );
                const buName = 'testInstance/testBU';
                const result = await handler.deploy(buName, typeKeyCombo);
                // THEN
                assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');

                const deployedTypes = Object.keys(result[buName]);
                assert.equal(deployedTypes.length, 2, 'deploy should have returned 2 types');
                assert.equal(
                    deployedTypes[0],
                    'dataExtension',
                    'deploy should have returned dataExtension'
                );
                assert.equal(
                    deployedTypes[1],
                    'senderProfile',
                    'deploy should have returned senderProfile'
                );
                assert.equal(
                    Object.keys(result[buName]['dataExtension']).length,
                    2,
                    'deploy should have returned 2 dataExtension'
                );
                assert.equal(
                    Object.keys(result[buName]['senderProfile']).length,
                    2,
                    'deploy should have returned 2 senderProfile'
                );
                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    20,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });

            it('deploy multiple type with keys', async () => {
                const argvMetadata = [
                    'dataExtension',
                    'dataExtract:wrong-key',
                    'senderProfile:testExisting_senderProfile',
                    'query:testExisting_query',
                    'query:key:wrong-key2',
                ];
                const typeKeyCombo = handler.metadataToTypeKey(argvMetadata);
                assert.notEqual(
                    typeof typeKeyCombo,
                    'undefined',
                    'typeKeyCombo should not be undefined'
                );
                const buName = 'testInstance/testBU';
                const result = await handler.deploy(buName, typeKeyCombo);
                // THEN
                assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');

                const deployedTypes = Object.keys(result[buName]);
                assert.equal(deployedTypes.length, 3, 'deploy should have returned 3 types');
                assert.equal(
                    deployedTypes.includes('dataExtension'),
                    true,
                    'deploy should have returned dataExtension'
                );
                assert.equal(
                    deployedTypes.includes('dataExtract'),
                    false,
                    'deploy should have returned dataExtract'
                );
                assert.equal(
                    deployedTypes.includes('senderProfile'),
                    true,
                    'deploy should have returned senderProfile'
                );
                assert.equal(
                    deployedTypes.includes('query'),
                    true,
                    'deploy should have returned query'
                );
                assert.equal(
                    Object.keys(result[buName]['dataExtension']).length,
                    2,
                    'deploy should have returned 2 dataExtension'
                );
                assert.equal(
                    Object.keys(result[buName]['senderProfile']).length,
                    1,
                    'deploy should have returned 1 senderProfile'
                );
                assert.equal(
                    Object.keys(result[buName]['query']).length,
                    1,
                    'deploy should have returned 1 query'
                );
                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    19,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });

            it('deploy multiple type with keys and --noUpdate', async () => {
                handler.setOptions({ noUpdate: true });

                const argvMetadata = [
                    'dataExtension',
                    'dataExtract:wrong-key',
                    'senderProfile:testExisting_senderProfile',
                    'query:testExisting_query',
                    'query:key:wrong-key2',
                ];
                const typeKeyCombo = handler.metadataToTypeKey(argvMetadata);
                assert.notEqual(
                    typeof typeKeyCombo,
                    'undefined',
                    'typeKeyCombo should not be undefined'
                );
                const buName = 'testInstance/testBU';
                const result = await handler.deploy(buName, typeKeyCombo);
                // THEN
                assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');

                const deployedTypes = Object.keys(result[buName]);
                assert.equal(deployedTypes.length, 3, 'deploy should have returned 3 types');
                assert.equal(
                    deployedTypes.includes('dataExtension'),
                    true,
                    'deploy should have returned dataExtension'
                );
                assert.equal(
                    deployedTypes.includes('dataExtract'),
                    false,
                    'deploy should have returned dataExtract'
                );
                assert.equal(
                    deployedTypes.includes('senderProfile'),
                    true,
                    'deploy should have returned senderProfile'
                );
                assert.equal(
                    deployedTypes.includes('query'),
                    true,
                    'deploy should have returned query'
                );
                assert.equal(
                    Object.keys(result[buName]['dataExtension']).length,
                    1,
                    'deploy should have returned 1 dataExtension'
                );
                assert.equal(
                    Object.keys(result[buName]['senderProfile']).length,
                    0,
                    'deploy should have returned 0 senderProfile'
                );
                assert.equal(
                    Object.keys(result[buName]['query']).length,
                    0,
                    'deploy should have returned 0 query'
                );
                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    16,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });

            it('skip deploy event with bad filename or bad extension', async () => {
                testUtils.copyToDeploy('event-deploy', 'event');

                const argvMetadata = [
                    'event:testNew_event_badExtension',
                    'event:testNew_event_badName',
                ];
                const typeKeyCombo = handler.metadataToTypeKey(argvMetadata);
                const buName = 'testInstance/testBU';
                await handler.deploy(buName, typeKeyCombo);
                // THEN
                assert.equal(process.exitCode, 1, 'deploy should not have thrown an error');

                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    0,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });

            it('skip deploy asset with bad filename or bad extension', async () => {
                testUtils.copyToDeploy('asset-deploy', 'asset');
                const argvMetadata = [
                    'asset:testNew_asset_badExtension',
                    'asset:testNew_asset_badName',
                ];
                const typeKeyCombo = handler.metadataToTypeKey(argvMetadata);
                const buName = 'testInstance/testBU';
                await handler.deploy(buName, typeKeyCombo);

                // THEN
                assert.equal(process.exitCode, 1, 'deploy should have thrown an error');

                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    0,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });

            it('skip deploy based on validation rule "filterPrefixByBu" with --fix without error', async () => {
                testUtils.copyToDeploy('asset-deploy2', 'asset');
                testUtils.copyToDeploy('dataExtension-deploy', 'dataExtension');

                const buName = 'testInstance/testBU';

                handler.setOptions({ fix: true });

                await handler.deploy(buName, {
                    asset: ['testBlacklist_asset_htmlblock'],
                    dataExtension: ['testBlacklist_dataExtension'],
                });

                // THEN
                assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');

                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    8,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });

            it('skip deploy based on validation rule "filterPrefixByBu" without --fix but with error', async () => {
                testUtils.copyToDeploy('asset-deploy2', 'asset');
                testUtils.copyToDeploy('dataExtension-deploy', 'dataExtension');

                const buName = 'testInstance/testBU';

                await handler.deploy(buName, {
                    asset: ['testBlacklist_asset_htmlblock'],
                    dataExtension: ['testBlacklist_dataExtension'],
                });

                // THEN
                assert.equal(process.exitCode, 1, 'deploy should have thrown an error');

                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    8,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });
        });

        describe('template --metadata ~~~', () => {
            it('buildTemplate + buildDefinition for multiple types with keys', async () => {
                // download first before we test buildTemplate
                await handler.retrieve('testInstance/testBU', ['automation', 'query']);

                const expectedApiCallsRetrieve = 31;
                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    expectedApiCallsRetrieve,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );

                // preparation
                const argvMetadata = [
                    'automation:testExisting_automation',
                    'query:testExisting_query',
                    'query:bad',
                ];
                const typeKeyCombo = handler.metadataToTypeKey(argvMetadata);
                assert.notEqual(
                    typeof typeKeyCombo,
                    'undefined',
                    'typeKeyCombo should not be undefined'
                );
                const buName = 'testInstance/testBU';

                // *** buildTemplate ***
                const templateResult = await handler.buildTemplate(
                    buName,
                    typeKeyCombo,
                    undefined,
                    ['testSourceMarket']
                );
                assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');
                // check automation
                assert.equal(
                    templateResult.automation ? Object.keys(templateResult.automation).length : 0,
                    1,
                    'only one automation expected'
                );
                assert.deepEqual(
                    await testUtils.getActualTemplateJson('testExisting_automation', 'automation'),
                    await testUtils.getExpectedJson('9999999', 'automation', 'template'),
                    'returned template was not equal expected'
                );
                // check query
                assert.equal(
                    templateResult.query ? Object.keys(templateResult.query).length : 0,
                    1,
                    'only one query expected'
                );
                assert.deepEqual(
                    await testUtils.getActualTemplateJson('testExisting_query', 'query'),
                    await testUtils.getExpectedJson('9999999', 'query', 'template'),
                    'returned template JSON of retrieveAsTemplate was not equal expected'
                );
                expect(
                    await testUtils.getActualTemplateFile('testExisting_query', 'query', 'sql')
                ).to.equal(await testUtils.getExpectedFile('9999999', 'query', 'template', 'sql'));

                // *** buildDefinition ***
                const definitionResult = await handler.buildDefinition(
                    buName,
                    typeKeyCombo,
                    undefined,
                    ['testTargetMarket']
                );
                assert.equal(
                    process.exitCode,
                    0,
                    'buildDefinition should not have thrown an error'
                );

                // check automation
                assert.equal(
                    definitionResult.automation
                        ? Object.keys(definitionResult.automation).length
                        : 0,
                    1,
                    'only one automation expected'
                );
                assert.deepEqual(
                    await testUtils.getActualDeployJson('testTemplated_automation', 'automation'),
                    await testUtils.getExpectedJson('9999999', 'automation', 'build'),
                    'returned deployment file was not equal expected'
                );

                // check query
                assert.equal(
                    definitionResult.query ? Object.keys(definitionResult.query).length : 0,
                    1,
                    'only one query expected'
                );
                assert.deepEqual(
                    await testUtils.getActualDeployJson('testTemplated_query', 'query'),
                    await testUtils.getExpectedJson('9999999', 'query', 'build'),
                    'returned deployment JSON was not equal expected'
                );
                expect(
                    await testUtils.getActualDeployFile('testTemplated_query', 'query', 'sql')
                ).to.equal(await testUtils.getExpectedFile('9999999', 'query', 'build', 'sql'));

                assert.equal(
                    testUtils.getAPIHistoryLength() - expectedApiCallsRetrieve,
                    0,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });

            it('buildTemplate + buildDefinition for multiple types with keys and --retrieve', async () => {
                const expectedApiCallsRetrieve = 31;

                // preparation
                const argvMetadata = [
                    'automation:testExisting_automation',
                    'query:testExisting_query',
                    'query:bad',
                ];
                const typeKeyCombo = handler.metadataToTypeKey(argvMetadata);
                assert.notEqual(
                    typeof typeKeyCombo,
                    'undefined',
                    'typeKeyCombo should not be undefined'
                );
                const buName = 'testInstance/testBU';

                handler.setOptions({ retrieve: true });

                // *** buildTemplate ***
                const templateResult = await handler.buildTemplate(
                    buName,
                    typeKeyCombo,
                    undefined,
                    ['testSourceMarket']
                );
                assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');
                // check automation
                assert.equal(
                    templateResult.automation ? Object.keys(templateResult.automation).length : 0,
                    1,
                    'only one automation expected'
                );
                assert.deepEqual(
                    await testUtils.getActualTemplateJson('testExisting_automation', 'automation'),
                    await testUtils.getExpectedJson('9999999', 'automation', 'template'),
                    'returned template was not equal expected'
                );
                // check query
                assert.equal(
                    templateResult.query ? Object.keys(templateResult.query).length : 0,
                    1,
                    'only one query expected'
                );
                assert.deepEqual(
                    await testUtils.getActualTemplateJson('testExisting_query', 'query'),
                    await testUtils.getExpectedJson('9999999', 'query', 'template'),
                    'returned template JSON of retrieveAsTemplate was not equal expected'
                );
                expect(
                    await testUtils.getActualTemplateFile('testExisting_query', 'query', 'sql')
                ).to.equal(await testUtils.getExpectedFile('9999999', 'query', 'template', 'sql'));

                // *** buildDefinition ***
                const definitionResult = await handler.buildDefinition(
                    buName,
                    typeKeyCombo,
                    undefined,
                    ['testTargetMarket']
                );
                assert.equal(
                    process.exitCode,
                    0,
                    'buildDefinition should not have thrown an error'
                );

                // check automation
                assert.equal(
                    definitionResult.automation
                        ? Object.keys(definitionResult.automation).length
                        : 0,
                    1,
                    'only one automation expected'
                );
                assert.deepEqual(
                    await testUtils.getActualDeployJson('testTemplated_automation', 'automation'),
                    await testUtils.getExpectedJson('9999999', 'automation', 'build'),
                    'returned deployment file was not equal expected'
                );

                // check query
                assert.equal(
                    definitionResult.query ? Object.keys(definitionResult.query).length : 0,
                    1,
                    'only one query expected'
                );
                assert.deepEqual(
                    await testUtils.getActualDeployJson('testTemplated_query', 'query'),
                    await testUtils.getExpectedJson('9999999', 'query', 'build'),
                    'returned deployment JSON was not equal expected'
                );
                expect(
                    await testUtils.getActualDeployFile('testTemplated_query', 'query', 'sql')
                ).to.equal(await testUtils.getExpectedFile('9999999', 'query', 'build', 'sql'));

                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    expectedApiCallsRetrieve,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });

            it('buildTemplate + buildDefinition for multiple types with keys and --dependencies', async () => {
                // download first before we test buildTemplate
                await handler.retrieve('testInstance/testBU');

                const expectedApiCallsRetrieve = 93;
                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    expectedApiCallsRetrieve,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );

                // preparation
                const argvMetadata = [
                    'automation:testExisting_automation',
                    'query:testExisting_query',
                    'query:bad',
                ];
                const typeKeyCombo = handler.metadataToTypeKey(argvMetadata);
                assert.notEqual(
                    typeof typeKeyCombo,
                    'undefined',
                    'typeKeyCombo should not be undefined'
                );
                const buName = 'testInstance/testBU';

                // set skipInteraction to true to skip re-retrieving question
                handler.setOptions({ dependencies: true, skipInteraction: true });

                // *** buildTemplate ***
                const templateResult = await handler.buildTemplate(
                    buName,
                    typeKeyCombo,
                    undefined,
                    ['testSourceMarket']
                );
                assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');

                // check type list
                assert.deepEqual(
                    Object.keys(templateResult),
                    [
                        'automation',
                        'query',
                        'dataExtract',
                        'dataExtension',
                        'emailSend',
                        'sendClassification',
                        'senderProfile',
                        'fileTransfer',
                        'importFile',
                        'script',
                        'verification',
                    ],
                    'did not create deployment packages for all relevant types'
                );

                // check automation
                assert.equal(
                    templateResult.automation ? Object.keys(templateResult.automation).length : 0,
                    1,
                    'only one automation expected'
                );
                assert.deepEqual(
                    await testUtils.getActualTemplateJson('testExisting_automation', 'automation'),
                    await testUtils.getExpectedJson('9999999', 'automation', 'template'),
                    'returned template was not equal expected'
                );
                // check query
                assert.equal(
                    templateResult.query ? Object.keys(templateResult.query).length : 0,
                    1,
                    'only one query expected'
                );
                assert.deepEqual(
                    await testUtils.getActualTemplateJson('testExisting_query', 'query'),
                    await testUtils.getExpectedJson('9999999', 'query', 'template'),
                    'returned template JSON of retrieveAsTemplate was not equal expected'
                );
                expect(
                    await testUtils.getActualTemplateFile('testExisting_query', 'query', 'sql')
                ).to.equal(await testUtils.getExpectedFile('9999999', 'query', 'template', 'sql'));

                // *** buildDefinition ***
                const definitionResult = await handler.buildDefinition(
                    buName,
                    typeKeyCombo,
                    undefined,
                    ['testTargetMarket']
                );
                assert.equal(
                    process.exitCode,
                    0,
                    'buildDefinition should not have thrown an error'
                );

                // check automation
                assert.equal(
                    definitionResult.automation
                        ? Object.keys(definitionResult.automation).length
                        : 0,
                    1,
                    'only one automation expected'
                );
                assert.deepEqual(
                    await testUtils.getActualDeployJson('testTemplated_automation', 'automation'),
                    await testUtils.getExpectedJson('9999999', 'automation', 'build'),
                    'returned deployment file was not equal expected'
                );

                // check query
                assert.equal(
                    definitionResult.query ? Object.keys(definitionResult.query).length : 0,
                    1,
                    'only one query expected'
                );
                assert.deepEqual(
                    await testUtils.getActualDeployJson('testTemplated_query', 'query'),
                    await testUtils.getExpectedJson('9999999', 'query', 'build'),
                    'returned deployment JSON was not equal expected'
                );
                expect(
                    await testUtils.getActualDeployFile('testTemplated_query', 'query', 'sql')
                ).to.equal(await testUtils.getExpectedFile('9999999', 'query', 'build', 'sql'));

                assert.equal(
                    testUtils.getAPIHistoryLength() - expectedApiCallsRetrieve,
                    4,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });

            it('buildTemplate + buildDefinition for multiple types with keys and --dependencies and --retrieve', async () => {
                // preparation
                const argvMetadata = [
                    'automation:testExisting_automation',
                    'query:testExisting_query',
                    'query:bad',
                ];
                const typeKeyCombo = handler.metadataToTypeKey(argvMetadata);
                assert.notEqual(
                    typeof typeKeyCombo,
                    'undefined',
                    'typeKeyCombo should not be undefined'
                );
                const buName = 'testInstance/testBU';

                handler.setOptions({ dependencies: true, retrieve: true });

                // *** buildTemplate ***
                const templateResult = await handler.buildTemplate(
                    buName,
                    typeKeyCombo,
                    undefined,
                    ['testSourceMarket']
                );
                assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');

                // check type list
                assert.deepEqual(
                    Object.keys(templateResult),
                    [
                        'automation',
                        'query',
                        'dataExtract',
                        'dataExtension',
                        'emailSend',
                        'sendClassification',
                        'senderProfile',
                        'fileTransfer',
                        'importFile',
                        'script',
                        'verification',
                    ],
                    'did not create deployment packages for all relevant types'
                );

                // check automation
                assert.equal(
                    templateResult.automation ? Object.keys(templateResult.automation).length : 0,
                    1,
                    'only one automation expected'
                );
                assert.deepEqual(
                    await testUtils.getActualTemplateJson('testExisting_automation', 'automation'),
                    await testUtils.getExpectedJson('9999999', 'automation', 'template'),
                    'returned template was not equal expected'
                );
                // check query
                assert.equal(
                    templateResult.query ? Object.keys(templateResult.query).length : 0,
                    1,
                    'only one query expected'
                );
                assert.deepEqual(
                    await testUtils.getActualTemplateJson('testExisting_query', 'query'),
                    await testUtils.getExpectedJson('9999999', 'query', 'template'),
                    'returned template JSON of retrieveAsTemplate was not equal expected'
                );
                expect(
                    await testUtils.getActualTemplateFile('testExisting_query', 'query', 'sql')
                ).to.equal(await testUtils.getExpectedFile('9999999', 'query', 'template', 'sql'));

                // *** buildDefinition ***
                const definitionResult = await handler.buildDefinition(
                    buName,
                    typeKeyCombo,
                    undefined,
                    ['testTargetMarket']
                );
                assert.equal(
                    process.exitCode,
                    0,
                    'buildDefinition should not have thrown an error'
                );

                // check automation
                assert.equal(
                    definitionResult.automation
                        ? Object.keys(definitionResult.automation).length
                        : 0,
                    1,
                    'only one automation expected'
                );
                assert.deepEqual(
                    await testUtils.getActualDeployJson('testTemplated_automation', 'automation'),
                    await testUtils.getExpectedJson('9999999', 'automation', 'build'),
                    'returned deployment file was not equal expected'
                );

                // check query
                assert.equal(
                    definitionResult.query ? Object.keys(definitionResult.query).length : 0,
                    1,
                    'only one query expected'
                );
                assert.deepEqual(
                    await testUtils.getActualDeployJson('testTemplated_query', 'query'),
                    await testUtils.getExpectedJson('9999999', 'query', 'build'),
                    'returned deployment JSON was not equal expected'
                );
                expect(
                    await testUtils.getActualDeployFile('testTemplated_query', 'query', 'sql')
                ).to.equal(await testUtils.getExpectedFile('9999999', 'query', 'build', 'sql'));

                const expectedApiCallsRetrieve = 97;
                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    expectedApiCallsRetrieve,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });

            it('buildTemplate + buildDefinitionBulk multiple type with keys', async () => {
                // download first before we test buildTemplate
                await handler.retrieve('testInstance/testBU', ['automation', 'query']);

                const expectedApiCallsRetrieve = 31;
                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    expectedApiCallsRetrieve,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );

                // preparation
                const argvMetadata = [
                    'automation:testExisting_automation',
                    'query:testExisting_query',
                    'query:bad',
                ];
                const typeKeyCombo = handler.metadataToTypeKey(argvMetadata);
                assert.notEqual(
                    typeof typeKeyCombo,
                    'undefined',
                    'typeKeyCombo should not be undefined'
                );
                const buName = 'testInstance/testBU';

                // *** buildTemplate ***
                const templateResult = await handler.buildTemplate(
                    buName,
                    typeKeyCombo,
                    undefined,
                    ['testSourceMarket']
                );
                assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');
                // check automation
                assert.equal(
                    templateResult.automation ? Object.keys(templateResult.automation).length : 0,
                    1,
                    'only one automation expected'
                );
                assert.deepEqual(
                    await testUtils.getActualTemplateJson('testExisting_automation', 'automation'),
                    await testUtils.getExpectedJson('9999999', 'automation', 'template'),
                    'returned template was not equal expected'
                );
                // check query
                assert.equal(
                    templateResult.query ? Object.keys(templateResult.query).length : 0,
                    1,
                    'only one query expected'
                );
                assert.deepEqual(
                    await testUtils.getActualTemplateJson('testExisting_query', 'query'),
                    await testUtils.getExpectedJson('9999999', 'query', 'template'),
                    'returned template JSON of retrieveAsTemplate was not equal expected'
                );
                expect(
                    await testUtils.getActualTemplateFile('testExisting_query', 'query', 'sql')
                ).to.equal(await testUtils.getExpectedFile('9999999', 'query', 'template', 'sql'));

                // *** buildDefinitionBulk chained ***
                const definitionResult = await handler.buildDefinitionBulk(
                    'deployment-target',
                    typeKeyCombo
                );
                assert.equal(
                    process.exitCode,
                    0,
                    'buildDefinitionBulk should not have thrown an error'
                );

                // check automation
                assert.equal(
                    definitionResult.automation?.['testInstance/testBU']?.testSourceMarket
                        ? Object.keys(
                              definitionResult.automation?.['testInstance/testBU']?.testSourceMarket
                          ).length
                        : 0,
                    1,
                    'only one automation expected'
                );
                assert.equal(
                    definitionResult.automation?.['testInstance/testBU']?.testTargetMarket
                        ? Object.keys(
                              definitionResult.automation?.['testInstance/testBU']?.testTargetMarket
                          ).length
                        : 0,
                    1,
                    'only one automation expected'
                );
                assert.equal(
                    definitionResult.automation?.['testInstance/_ParentBU_']?.testTargetMarket
                        ? Object.keys(
                              definitionResult.automation?.['testInstance/_ParentBU_']
                                  ?.testTargetMarket
                          ).length
                        : 0,
                    1,
                    'only one automation expected'
                );
                assert.deepEqual(
                    await testUtils.getActualDeployJson('testTemplated_automation', 'automation'),
                    await testUtils.getExpectedJson('9999999', 'automation', 'build'),
                    'returned deployment file was not equal expected'
                );

                // check if files were also created for other BU-market combos
                // testBU: testSourceMarket
                expect(
                    await testUtils.getActualDeployFile(
                        'testExisting_automation',
                        'automation',
                        'json'
                    )
                ).to.exist;
                // _ParentBU_: testTargetMarket
                expect(
                    await testUtils.getActualDeployFile(
                        'testTemplated_automation',
                        'automation',
                        'json',
                        '_ParentBU_'
                    )
                ).to.exist;

                // check query
                assert.equal(
                    definitionResult.query?.['testInstance/testBU']?.testSourceMarket
                        ? Object.keys(
                              definitionResult.query?.['testInstance/testBU']?.testSourceMarket
                          ).length
                        : 0,
                    1,
                    'only one query expected'
                );
                assert.equal(
                    definitionResult.query?.['testInstance/testBU']?.testTargetMarket
                        ? Object.keys(
                              definitionResult.query?.['testInstance/testBU']?.testTargetMarket
                          ).length
                        : 0,
                    1,
                    'only one query expected'
                );
                assert.equal(
                    definitionResult.query?.['testInstance/_ParentBU_']?.testTargetMarket
                        ? Object.keys(
                              definitionResult.query?.['testInstance/_ParentBU_']?.testTargetMarket
                          ).length
                        : 0,
                    1,
                    'only one query expected'
                );
                assert.deepEqual(
                    await testUtils.getActualDeployJson('testTemplated_query', 'query'),
                    await testUtils.getExpectedJson('9999999', 'query', 'build'),
                    'returned deployment JSON was not equal expected'
                );
                expect(
                    await testUtils.getActualDeployFile('testTemplated_query', 'query', 'sql')
                ).to.equal(await testUtils.getExpectedFile('9999999', 'query', 'build', 'sql'));

                // check if files were also created for other BU-market combos
                // testBU: testSourceMarket
                expect(await testUtils.getActualDeployFile('testExisting_query', 'query', 'json'))
                    .to.exist;
                expect(await testUtils.getActualDeployFile('testExisting_query', 'query', 'sql')).to
                    .exist;
                // _ParentBU_: testTargetMarket
                expect(
                    await testUtils.getActualDeployFile(
                        'testTemplated_query',
                        'query',
                        'json',
                        '_ParentBU_'
                    )
                ).to.exist;
                expect(
                    await testUtils.getActualDeployFile(
                        'testTemplated_query',
                        'query',
                        'sql',
                        '_ParentBU_'
                    )
                ).to.exist;

                assert.equal(
                    testUtils.getAPIHistoryLength() - expectedApiCallsRetrieve,
                    0,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });

            it('clone multiple type with keys', async () => {
                // download first before we test buildTemplate
                await handler.retrieve('testInstance/testBU', ['automation', 'query']);

                const expectedApiCallsRetrieve = 31;
                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    expectedApiCallsRetrieve,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );

                // preparation
                const argvMetadata = [
                    'automation:testExisting_automation',
                    'query:testExisting_query',
                    'query:bad',
                ];
                const typeKeyCombo = handler.metadataToTypeKey(argvMetadata);
                assert.notEqual(
                    typeof typeKeyCombo,
                    'undefined',
                    'typeKeyCombo should not be undefined'
                );
                const buName = 'testInstance/testBU';

                handler.setOptions({ skipInteraction: true, purge: false });
                // *** build: buildTemplate and buildDefinition chained ***
                const definitionResult = await handler.clone(buName, buName, typeKeyCombo);
                assert.equal(process.exitCode, 0, 'build should not have thrown an error');

                // *** buildTemplate ***
                // cannot be checked in build anymore because it writes templates into a temporary folder and deletes them afterwards

                // *** buildDefinition ***

                // check automation
                assert.equal(
                    definitionResult.automation
                        ? Object.keys(definitionResult.automation).length
                        : 0,
                    1,
                    'only one automation expected'
                );
                assert.deepEqual(
                    await testUtils.getActualDeployJson('testExisting_automation', 'automation'),
                    await testUtils.getExpectedJson('9999999', 'automation', 'clone'),
                    'returned deployment file was not equal expected'
                );

                // check query
                assert.equal(
                    definitionResult.query ? Object.keys(definitionResult.query).length : 0,
                    1,
                    'only one query expected'
                );
                assert.deepEqual(
                    await testUtils.getActualDeployJson('testExisting_query', 'query'),
                    await testUtils.getExpectedJson('9999999', 'query', 'clone'),
                    'returned deployment JSON was not equal expected'
                );
                expect(
                    await testUtils.getActualDeployFile('testExisting_query', 'query', 'sql')
                ).to.equal(await testUtils.getExpectedFile('9999999', 'query', 'clone', 'sql'));

                assert.equal(
                    testUtils.getAPIHistoryLength() - expectedApiCallsRetrieve,
                    0,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });

            it('build multiple type with keys', async () => {
                // download first before we test buildTemplate
                await handler.retrieve('testInstance/testBU', ['automation', 'query']);

                const expectedApiCallsRetrieve = 31;
                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    expectedApiCallsRetrieve,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );

                // preparation
                const argvMetadata = [
                    'automation:testExisting_automation',
                    'query:testExisting_query',
                    'query:bad',
                ];
                const typeKeyCombo = handler.metadataToTypeKey(argvMetadata);
                assert.notEqual(
                    typeof typeKeyCombo,
                    'undefined',
                    'typeKeyCombo should not be undefined'
                );
                const buName = 'testInstance/testBU';

                handler.setOptions({ skipInteraction: true, purge: false });
                // *** build: buildTemplate and buildDefinition chained ***
                const definitionResult = await handler.build(
                    buName,
                    buName,
                    typeKeyCombo,
                    ['testSourceMarket'],
                    ['testTargetMarket']
                );
                assert.equal(process.exitCode, 0, 'build should not have thrown an error');

                // *** buildTemplate ***

                // check automation
                // assert.deepEqual(
                //     await testUtils.getActualTemporaryTemplateJson(
                //         'testExisting_automation',
                //         'automation'
                //     ),
                //     await testUtils.getExpectedJson('9999999', 'automation', 'template'),
                //     'returned template was not equal expected'
                // );
                // // check query
                // assert.deepEqual(
                //     await testUtils.getActualTemporaryTemplateJson('testExisting_query', 'query'),
                //     await testUtils.getExpectedJson('9999999', 'query', 'template'),
                //     'returned template JSON of retrieveAsTemplate was not equal expected'
                // );
                // expect(
                //     await testUtils.getActualTemporaryTemplateFile(
                //         'testExisting_query',
                //         'query',
                //         'sql'
                //     )
                // ).to.equal(await testUtils.getExpectedFile('9999999', 'query', 'template', 'sql'));

                // *** buildDefinition ***

                // check automation
                assert.equal(
                    definitionResult.automation
                        ? Object.keys(definitionResult.automation).length
                        : 0,
                    1,
                    'only one automation expected'
                );
                assert.deepEqual(
                    await testUtils.getActualDeployJson('testTemplated_automation', 'automation'),
                    await testUtils.getExpectedJson('9999999', 'automation', 'build'),
                    'returned deployment file was not equal expected'
                );

                // check query
                assert.equal(
                    definitionResult.query ? Object.keys(definitionResult.query).length : 0,
                    1,
                    'only one query expected'
                );
                assert.deepEqual(
                    await testUtils.getActualDeployJson('testTemplated_query', 'query'),
                    await testUtils.getExpectedJson('9999999', 'query', 'build'),
                    'returned deployment JSON was not equal expected'
                );
                expect(
                    await testUtils.getActualDeployFile('testTemplated_query', 'query', 'sql')
                ).to.equal(await testUtils.getExpectedFile('9999999', 'query', 'build', 'sql'));

                assert.equal(
                    testUtils.getAPIHistoryLength() - expectedApiCallsRetrieve,
                    0,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });

            it('build multiple type with keys and --dependencies', async () => {
                // download everything before we test buildTemplate
                await handler.retrieve('testInstance/testBU');

                const expectedApiCallsRetrieve = 93;
                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    expectedApiCallsRetrieve,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );

                // preparation
                const argvMetadata = [
                    'automation:testExisting_automation',
                    'query:testExisting_query',
                    'query:bad',
                ];
                const typeKeyCombo = handler.metadataToTypeKey(argvMetadata);
                assert.notEqual(
                    typeof typeKeyCombo,
                    'undefined',
                    'typeKeyCombo should not be undefined'
                );
                const buName = 'testInstance/testBU';

                // set skipInteraction to true to skip re-retrieving question
                handler.setOptions({ dependencies: true, skipInteraction: true, purge: true });

                // *** build: buildTemplate and buildDefinition chained ***
                const definitionResult = await handler.build(
                    buName,
                    buName,
                    typeKeyCombo,
                    ['testSourceMarket'],
                    ['testTargetMarket']
                );
                assert.equal(process.exitCode, 0, 'build should not have thrown an error');

                // *** buildTemplate ***

                // // check automation
                // assert.deepEqual(
                //     await testUtils.getActualTemplateJson('testExisting_automation', 'automation'),
                //     await testUtils.getExpectedJson('9999999', 'automation', 'template'),
                //     'returned template was not equal expected'
                // );
                // // check query
                // assert.deepEqual(
                //     await testUtils.getActualTemplateJson('testExisting_query', 'query'),
                //     await testUtils.getExpectedJson('9999999', 'query', 'template'),
                //     'returned template JSON of retrieveAsTemplate was not equal expected'
                // );
                // expect(
                //     await testUtils.getActualTemplateFile('testExisting_query', 'query', 'sql')
                // ).to.equal(await testUtils.getExpectedFile('9999999', 'query', 'template', 'sql'));

                // *** buildDefinition ***

                // check type list
                assert.deepEqual(
                    Object.keys(definitionResult),
                    [
                        'automation',
                        'query',
                        'dataExtract',
                        'dataExtension',
                        'emailSend',
                        'sendClassification',
                        'senderProfile',
                        'fileTransfer',
                        'importFile',
                        'script',
                        'verification',
                    ],
                    'did not create deployment packages for all relevant types'
                );

                // check automation
                assert.equal(
                    definitionResult.automation
                        ? Object.keys(definitionResult.automation).length
                        : 0,
                    1,
                    'only one automation expected'
                );
                assert.deepEqual(
                    await testUtils.getActualDeployJson('testTemplated_automation', 'automation'),
                    await testUtils.getExpectedJson('9999999', 'automation', 'build'),
                    'returned deployment file was not equal expected'
                );

                // check query
                assert.equal(
                    definitionResult.query ? Object.keys(definitionResult.query).length : 0,
                    1,
                    'only one query expected'
                );
                assert.deepEqual(
                    await testUtils.getActualDeployJson('testTemplated_query', 'query'),
                    await testUtils.getExpectedJson('9999999', 'query', 'build'),
                    'returned deployment JSON was not equal expected'
                );
                expect(
                    await testUtils.getActualDeployFile('testTemplated_query', 'query', 'sql')
                ).to.equal(await testUtils.getExpectedFile('9999999', 'query', 'build', 'sql'));

                assert.equal(
                    testUtils.getAPIHistoryLength() - expectedApiCallsRetrieve,
                    4,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });

            it('build multiple type with keys and --dependencies and --retrieve', async () => {
                // preparation
                const argvMetadata = [
                    'automation:testExisting_automation',
                    'query:testExisting_query',
                    'query:bad',
                ];
                const typeKeyCombo = handler.metadataToTypeKey(argvMetadata);
                assert.notEqual(
                    typeof typeKeyCombo,
                    'undefined',
                    'typeKeyCombo should not be undefined'
                );
                const buName = 'testInstance/testBU';

                handler.setOptions({
                    dependencies: true,
                    retrieve: true,
                    skipInteraction: true,
                    purge: true,
                });

                // *** build: buildTemplate and buildDefinition chained ***
                const definitionResult = await handler.build(
                    buName,
                    buName,
                    typeKeyCombo,
                    ['testSourceMarket'],
                    ['testTargetMarket']
                );
                assert.equal(process.exitCode, 0, 'build should not have thrown an error');

                // *** buildTemplate ***

                // check automation
                // assert.deepEqual(
                //     await testUtils.getActualTemplateJson('testExisting_automation', 'automation'),
                //     await testUtils.getExpectedJson('9999999', 'automation', 'template'),
                //     'returned template was not equal expected'
                // );
                // // check query
                // assert.deepEqual(
                //     await testUtils.getActualTemplateJson('testExisting_query', 'query'),
                //     await testUtils.getExpectedJson('9999999', 'query', 'template'),
                //     'returned template JSON of retrieveAsTemplate was not equal expected'
                // );
                // expect(
                //     await testUtils.getActualTemplateFile('testExisting_query', 'query', 'sql')
                // ).to.equal(await testUtils.getExpectedFile('9999999', 'query', 'template', 'sql'));

                // *** buildDefinition ***

                // check type list
                assert.deepEqual(
                    Object.keys(definitionResult),
                    [
                        'automation',
                        'query',
                        'dataExtract',
                        'dataExtension',
                        'emailSend',
                        'sendClassification',
                        'senderProfile',
                        'fileTransfer',
                        'importFile',
                        'script',
                        'verification',
                    ],
                    'did not create deployment packages for all relevant types'
                );

                // check automation
                assert.equal(
                    definitionResult.automation
                        ? Object.keys(definitionResult.automation).length
                        : 0,
                    1,
                    'only one automation expected'
                );
                assert.deepEqual(
                    await testUtils.getActualDeployJson('testTemplated_automation', 'automation'),
                    await testUtils.getExpectedJson('9999999', 'automation', 'build'),
                    'returned deployment file was not equal expected'
                );

                // check query
                assert.equal(
                    definitionResult.query ? Object.keys(definitionResult.query).length : 0,
                    1,
                    'only one query expected'
                );
                assert.deepEqual(
                    await testUtils.getActualDeployJson('testTemplated_query', 'query'),
                    await testUtils.getExpectedJson('9999999', 'query', 'build'),
                    'returned deployment JSON was not equal expected'
                );
                expect(
                    await testUtils.getActualDeployFile('testTemplated_query', 'query', 'sql')
                ).to.equal(await testUtils.getExpectedFile('9999999', 'query', 'build', 'sql'));

                const expectedApiCallsRetrieve = 97;
                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    expectedApiCallsRetrieve,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });

            it('build multiple type with keys and --bulk', async () => {
                // download first before we test buildTemplate
                await handler.retrieve('testInstance/testBU', ['automation', 'query']);

                const expectedApiCallsRetrieve = 31;
                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    expectedApiCallsRetrieve,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );

                // preparation
                const argvMetadata = [
                    'automation:testExisting_automation',
                    'query:testExisting_query',
                    'query:bad',
                ];
                const typeKeyCombo = handler.metadataToTypeKey(argvMetadata);
                assert.notEqual(
                    typeof typeKeyCombo,
                    'undefined',
                    'typeKeyCombo should not be undefined'
                );
                const buName = 'testInstance/testBU';
                handler.setOptions({ skipInteraction: true, purge: false });

                // *** build: buildTemplate and buildDefinition chained ***
                const definitionResult = await handler.build(
                    buName,
                    'ignored',
                    typeKeyCombo,
                    ['testSourceMarket'],
                    ['deployment-target'],
                    true
                );
                assert.equal(process.exitCode, 0, 'build should not have thrown an error');

                // *** buildTemplate ***

                // // check automation
                // assert.deepEqual(
                //     await testUtils.getActualTemplateJson('testExisting_automation', 'automation'),
                //     await testUtils.getExpectedJson('9999999', 'automation', 'template'),
                //     'returned template was not equal expected'
                // );
                // // check query
                // assert.deepEqual(
                //     await testUtils.getActualTemplateJson('testExisting_query', 'query'),
                //     await testUtils.getExpectedJson('9999999', 'query', 'template'),
                //     'returned template JSON of retrieveAsTemplate was not equal expected'
                // );
                // expect(
                //     await testUtils.getActualTemplateFile('testExisting_query', 'query', 'sql')
                // ).to.equal(await testUtils.getExpectedFile('9999999', 'query', 'template', 'sql'));

                // *** buildDefinitionBulk ***

                // check automation
                assert.equal(
                    definitionResult.automation?.['testInstance/testBU']?.testSourceMarket
                        ? Object.keys(
                              definitionResult.automation?.['testInstance/testBU']?.testSourceMarket
                          ).length
                        : 0,
                    1,
                    'only one automation expected'
                );
                assert.equal(
                    definitionResult.automation?.['testInstance/testBU']?.testTargetMarket
                        ? Object.keys(
                              definitionResult.automation?.['testInstance/testBU']?.testTargetMarket
                          ).length
                        : 0,
                    1,
                    'only one automation expected'
                );
                assert.equal(
                    definitionResult.automation?.['testInstance/_ParentBU_']?.testTargetMarket
                        ? Object.keys(
                              definitionResult.automation?.['testInstance/_ParentBU_']
                                  ?.testTargetMarket
                          ).length
                        : 0,
                    1,
                    'only one automation expected'
                );
                assert.deepEqual(
                    await testUtils.getActualDeployJson('testTemplated_automation', 'automation'),
                    await testUtils.getExpectedJson('9999999', 'automation', 'build'),
                    'returned deployment file was not equal expected'
                );

                // check if files were also created for other BU-market combos
                // testBU: testSourceMarket
                expect(
                    await testUtils.getActualDeployFile(
                        'testExisting_automation',
                        'automation',
                        'json'
                    )
                ).to.exist;
                // _ParentBU_: testTargetMarket
                expect(
                    await testUtils.getActualDeployFile(
                        'testTemplated_automation',
                        'automation',
                        'json',
                        '_ParentBU_'
                    )
                ).to.exist;

                // check query
                assert.equal(
                    definitionResult.query?.['testInstance/testBU']?.testSourceMarket
                        ? Object.keys(
                              definitionResult.query?.['testInstance/testBU']?.testSourceMarket
                          ).length
                        : 0,
                    1,
                    'only one query expected'
                );
                assert.equal(
                    definitionResult.query?.['testInstance/testBU']?.testTargetMarket
                        ? Object.keys(
                              definitionResult.query?.['testInstance/testBU']?.testTargetMarket
                          ).length
                        : 0,
                    1,
                    'only one query expected'
                );
                assert.equal(
                    definitionResult.query?.['testInstance/_ParentBU_']?.testTargetMarket
                        ? Object.keys(
                              definitionResult.query?.['testInstance/_ParentBU_']?.testTargetMarket
                          ).length
                        : 0,
                    1,
                    'only one query expected'
                );
                assert.deepEqual(
                    await testUtils.getActualDeployJson('testTemplated_query', 'query'),
                    await testUtils.getExpectedJson('9999999', 'query', 'build'),
                    'returned deployment JSON was not equal expected'
                );
                expect(
                    await testUtils.getActualDeployFile('testTemplated_query', 'query', 'sql')
                ).to.equal(await testUtils.getExpectedFile('9999999', 'query', 'build', 'sql'));

                // check if files were also created for other BU-market combos
                // testBU: testSourceMarket
                expect(await testUtils.getActualDeployFile('testExisting_query', 'query', 'json'))
                    .to.exist;
                expect(await testUtils.getActualDeployFile('testExisting_query', 'query', 'sql')).to
                    .exist;
                // _ParentBU_: testTargetMarket
                expect(
                    await testUtils.getActualDeployFile(
                        'testTemplated_query',
                        'query',
                        'json',
                        '_ParentBU_'
                    )
                ).to.exist;
                expect(
                    await testUtils.getActualDeployFile(
                        'testTemplated_query',
                        'query',
                        'sql',
                        '_ParentBU_'
                    )
                ).to.exist;

                assert.equal(
                    testUtils.getAPIHistoryLength() - expectedApiCallsRetrieve,
                    0,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });

            it('build multiple type with keys and --bulk and --dependencies', async () => {
                // download first before we test buildTemplate
                await handler.retrieve('testInstance/testBU');

                const expectedApiCallsRetrieve = 93;
                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    expectedApiCallsRetrieve,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );

                // preparation
                const argvMetadata = [
                    'automation:testExisting_automation',
                    'query:testExisting_query',
                    'query:bad',
                ];
                const typeKeyCombo = handler.metadataToTypeKey(argvMetadata);
                assert.notEqual(
                    typeof typeKeyCombo,
                    'undefined',
                    'typeKeyCombo should not be undefined'
                );
                const buName = 'testInstance/testBU';

                // set skipInteraction to true to skip re-retrieving question
                handler.setOptions({ dependencies: true, skipInteraction: true, purge: true });

                // *** build: buildTemplate and buildDefinition chained ***
                const definitionResult = await handler.build(
                    buName,
                    'ignored',
                    typeKeyCombo,
                    ['testSourceMarket'],
                    ['deployment-target'],
                    true
                );
                assert.equal(process.exitCode, 0, 'build should not have thrown an error');

                // *** buildTemplate ***

                // // check automation
                // assert.deepEqual(
                //     await testUtils.getActualTemplateJson('testExisting_automation', 'automation'),
                //     await testUtils.getExpectedJson('9999999', 'automation', 'template'),
                //     'returned template was not equal expected'
                // );
                // // check query
                // assert.deepEqual(
                //     await testUtils.getActualTemplateJson('testExisting_query', 'query'),
                //     await testUtils.getExpectedJson('9999999', 'query', 'template'),
                //     'returned template JSON of retrieveAsTemplate was not equal expected'
                // );
                // expect(
                //     await testUtils.getActualTemplateFile('testExisting_query', 'query', 'sql')
                // ).to.equal(await testUtils.getExpectedFile('9999999', 'query', 'template', 'sql'));

                // *** buildDefinitionBulk ***

                // check type list
                assert.deepEqual(
                    Object.keys(definitionResult),
                    [
                        'automation',
                        'query',
                        'dataExtract',
                        'dataExtension',
                        'emailSend',
                        'sendClassification',
                        'senderProfile',
                        'fileTransfer',
                        'importFile',
                        'script',
                        'verification',
                    ],
                    'did not create deployment packages for all relevant types'
                );

                // check automation
                assert.equal(
                    definitionResult.automation?.['testInstance/testBU']?.testSourceMarket
                        ? Object.keys(
                              definitionResult.automation?.['testInstance/testBU']?.testSourceMarket
                          ).length
                        : 0,
                    1,
                    'only one automation expected'
                );
                assert.equal(
                    definitionResult.automation?.['testInstance/testBU']?.testTargetMarket
                        ? Object.keys(
                              definitionResult.automation?.['testInstance/testBU']?.testTargetMarket
                          ).length
                        : 0,
                    1,
                    'only one automation expected'
                );
                assert.equal(
                    definitionResult.automation?.['testInstance/_ParentBU_']?.testTargetMarket
                        ? Object.keys(
                              definitionResult.automation?.['testInstance/_ParentBU_']
                                  ?.testTargetMarket
                          ).length
                        : 0,
                    1,
                    'only one automation expected'
                );
                assert.deepEqual(
                    await testUtils.getActualDeployJson('testTemplated_automation', 'automation'),
                    await testUtils.getExpectedJson('9999999', 'automation', 'build'),
                    'returned deployment file was not equal expected'
                );

                // check if files were also created for other BU-market combos
                // testBU: testSourceMarket
                expect(
                    await testUtils.getActualDeployFile(
                        'testExisting_automation',
                        'automation',
                        'json'
                    )
                ).to.exist;
                // _ParentBU_: testTargetMarket
                expect(
                    await testUtils.getActualDeployFile(
                        'testTemplated_automation',
                        'automation',
                        'json',
                        '_ParentBU_'
                    )
                ).to.exist;

                // check query
                assert.equal(
                    definitionResult.query?.['testInstance/testBU']?.testSourceMarket
                        ? Object.keys(
                              definitionResult.query?.['testInstance/testBU']?.testSourceMarket
                          ).length
                        : 0,
                    1,
                    'only one query expected'
                );
                assert.equal(
                    definitionResult.query?.['testInstance/testBU']?.testTargetMarket
                        ? Object.keys(
                              definitionResult.query?.['testInstance/testBU']?.testTargetMarket
                          ).length
                        : 0,
                    1,
                    'only one query expected'
                );
                assert.equal(
                    definitionResult.query?.['testInstance/_ParentBU_']?.testTargetMarket
                        ? Object.keys(
                              definitionResult.query?.['testInstance/_ParentBU_']?.testTargetMarket
                          ).length
                        : 0,
                    1,
                    'only one query expected'
                );
                assert.deepEqual(
                    await testUtils.getActualDeployJson('testTemplated_query', 'query'),
                    await testUtils.getExpectedJson('9999999', 'query', 'build'),
                    'returned deployment JSON was not equal expected'
                );
                expect(
                    await testUtils.getActualDeployFile('testTemplated_query', 'query', 'sql')
                ).to.equal(await testUtils.getExpectedFile('9999999', 'query', 'build', 'sql'));

                // check if files were also created for other BU-market combos
                // testBU: testSourceMarket
                expect(await testUtils.getActualDeployFile('testExisting_query', 'query', 'json'))
                    .to.exist;
                expect(await testUtils.getActualDeployFile('testExisting_query', 'query', 'sql')).to
                    .exist;
                // _ParentBU_: testTargetMarket
                expect(
                    await testUtils.getActualDeployFile(
                        'testTemplated_query',
                        'query',
                        'json',
                        '_ParentBU_'
                    )
                ).to.exist;
                expect(
                    await testUtils.getActualDeployFile(
                        'testTemplated_query',
                        'query',
                        'sql',
                        '_ParentBU_'
                    )
                ).to.exist;

                assert.equal(
                    testUtils.getAPIHistoryLength() - expectedApiCallsRetrieve,
                    4,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });

            it('build but error after buildTemplate step because keys were not found', async () => {
                const buName = 'testInstance/testBU';
                const typeKeyCombo = {
                    asset: ['404'],
                    dataExtension: ['404'],
                };

                // handler.setOptions({ skipInteraction: true, purge: false, fix: true });

                await handler.build(
                    buName,
                    'ignored',
                    typeKeyCombo,
                    ['testSourceMarket'],
                    ['parent'],
                    true
                );

                // THEN
                assert.equal(process.exitCode, 1, 'build should not have thrown an error');

                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    0,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });

            it('skip build based on validation rule "filterPrefixByBu" with --fix without error', async () => {
                const buName = 'testInstance/testBU';
                const typeKeyCombo = {
                    asset: ['testExisting_asset_htmlblock'],
                    dataExtension: ['testExisting_dataExtension'],
                };
                await handler.retrieve(buName, typeKeyCombo);

                const expectedApiCallsRetrieve = 11;
                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    expectedApiCallsRetrieve,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );

                handler.setOptions({ skipInteraction: true, purge: false, fix: true });

                const definitionResult = await handler.build(
                    buName,
                    'ignored',
                    typeKeyCombo,
                    ['testSourceMarket'],
                    ['parent'],
                    true
                );

                // THEN
                assert.equal(process.exitCode, 0, 'build should not have thrown an error');

                // confirm that no deployment package was created
                assert.equal(
                    definitionResult.asset?.['testInstance/_ParentBU_']?.testTargetMarket
                        ? Object.keys(
                              definitionResult.asset?.['testInstance/_ParentBU_']?.testTargetMarket
                          ).length
                        : 0,
                    0,
                    '0 asset expected'
                );
                assert.equal(
                    definitionResult.dataExtension?.['testInstance/_ParentBU_']?.testTargetMarket
                        ? Object.keys(
                              definitionResult.dataExtension?.['testInstance/_ParentBU_']
                                  ?.testTargetMarket
                          ).length
                        : 0,
                    0,
                    '0 dataExtension expected'
                );

                assert.equal(
                    testUtils.getAPIHistoryLength() - expectedApiCallsRetrieve,
                    0,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });

            it('skip deploy based on validation rule "filterPrefixByBu" without --fix but with error', async () => {
                const buName = 'testInstance/testBU';
                const typeKeyCombo = {
                    asset: ['testExisting_asset_htmlblock'],
                    dataExtension: ['testExisting_dataExtension'],
                };
                await handler.retrieve(buName, typeKeyCombo);

                const expectedApiCallsRetrieve = 11;
                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    expectedApiCallsRetrieve,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );

                handler.setOptions({ skipInteraction: true, purge: false });

                const definitionResult = await handler.build(
                    buName,
                    'ignored',
                    typeKeyCombo,
                    ['testSourceMarket'],
                    ['parent'],
                    true
                );

                // THEN
                assert.equal(process.exitCode, 1, 'build should have thrown an error');

                // confirm that no deployment package was created
                assert.equal(
                    definitionResult.asset?.['testInstance/_ParentBU_']?.testTargetMarket
                        ? Object.keys(
                              definitionResult.asset?.['testInstance/_ParentBU_']?.testTargetMarket
                          ).length
                        : 0,
                    0,
                    '0 asset expected'
                );
                assert.equal(
                    definitionResult.dataExtension?.['testInstance/_ParentBU_']?.testTargetMarket
                        ? Object.keys(
                              definitionResult.dataExtension?.['testInstance/_ParentBU_']
                                  ?.testTargetMarket
                          ).length
                        : 0,
                    0,
                    '0 dataExtension expected'
                );

                assert.equal(
                    testUtils.getAPIHistoryLength() - expectedApiCallsRetrieve,
                    0,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });
        });

        describe('Delete --metadata ~~~', () => {
            it('Should delete the items', async () => {
                const argvMetadata = [
                    'asset:testExisting_asset',
                    'automation:testExisting_automation',
                    'journey:testExisting_journey_Quicksend/1',
                    'journey:testExisting_journey_Multistep/1',
                ];
                const typeKeyCombo = handler.metadataToTypeKey(argvMetadata);
                // WHEN
                const isDeleted = await handler.deleteByKey('testInstance/testBU', typeKeyCombo);
                // THEN
                assert.equal(process.exitCode, 0, 'deleteByKey should not have thrown an error');
                assert.equal(isDeleted, true, 'deleteByKey should have returned true');
                return;
            });
        });

        describe('Publish --metadata ~~~', () => {
            it('Should publish the journey', async () => {
                handler.setOptions({ skipStatusCheck: true });
                const argvMetadata = [
                    'journey:testExisting_journey_Multistep',
                    'journey:testExisting_temail_notPublished',
                ];
                const typeKeyCombo = handler.metadataToTypeKey(argvMetadata);
                // WHEN
                const publish = await handler.publish('testInstance/testBU', typeKeyCombo);
                // THEN
                assert.equal(process.exitCode, 0, 'publish should not have thrown an error');
                assert.deepEqual(
                    publish['testInstance/testBU']?.journey,
                    ['testExisting_journey_Multistep', 'testExisting_temail_notPublished'],
                    'should have published the right journey'
                );
                return;
            });
        });

        describe('Execute/Start --metadata ~~~', () => {
            it('Should execute the item', async () => {
                const argvMetadata = [
                    'query:testExisting_query',
                    'automation:testExisting_automation',
                ];
                const typeKeyCombo = handler.metadataToTypeKey(argvMetadata);
                // WHEN
                const executedKeys = await handler.execute('testInstance/testBU', typeKeyCombo);
                assert.equal(process.exitCode, 0, 'execute should not have thrown an error');

                // query
                assert.equal(
                    executedKeys['testInstance/testBU']?.query?.length,
                    1,
                    'returned number of keys does not correspond to number of expected fixed keys'
                );
                assert.equal(
                    executedKeys['testInstance/testBU']?.query[0],
                    'testExisting_query',
                    'returned keys do not correspond to expected fixed keys'
                );

                // automation
                assert.equal(
                    executedKeys['testInstance/testBU']?.automation?.length,
                    1,
                    'automation was supposed to be executed'
                );
                assert.equal(
                    executedKeys['testInstance/testBU']?.automation[0],
                    'testExisting_automation',
                    'returned keys do not correspond to expected fixed keys'
                );

                return;
            });
        });

        describe('Pause --metadata ~~~', () => {
            it('Should pause the item', async () => {
                const argvMetadata = ['automation:testExisting_automation_pause'];
                const typeKeyCombo = handler.metadataToTypeKey(argvMetadata);
                // WHEN
                const pausedKeys = await handler.pause('testInstance/testBU', typeKeyCombo);
                assert.equal(process.exitCode, 0, 'pause should not have thrown an error');

                // automation
                assert.equal(
                    pausedKeys['testInstance/testBU']?.automation?.length,
                    1,
                    'returned number of keys does not correspond to number of expected fixed keys'
                );
                assert.equal(
                    pausedKeys['testInstance/testBU']?.automation[0],
                    'testExisting_automation_pause',
                    'returned keys do not correspond to expected fixed keys'
                );

                return;
            });
        });

        describe('Schedule --metadata ~~~', () => {
            it('Should schedule the item', async () => {
                const argvMetadata = ['automation:testExisting_automation'];
                const typeKeyCombo = handler.metadataToTypeKey(argvMetadata);
                // WHEN
                const scheduled = await handler.schedule('testInstance/testBU', typeKeyCombo);
                assert.equal(process.exitCode, 0, 'execute should not have thrown an error');

                // automation
                assert.equal(
                    scheduled['testInstance/testBU']?.automation?.length,
                    1,
                    'returned number of keys does not correspond to number of expected fixed keys'
                );
                assert.equal(
                    scheduled['testInstance/testBU']?.automation[0],
                    'testExisting_automation',
                    'returned keys do not correspond to expected fixed keys'
                );

                return;
            });
        });
    });

    describe('without --metadata ================', () => {
        describe('retrieve without --metadata ~~~', () => {
            it('retrieve multiple type with keys', async () => {
                const buName = 'testInstance/testBU';
                const result = await handler.retrieve(
                    buName,
                    ['dataExtract', 'senderProfile'],
                    ['wrong-key', 'Default']
                );
                // THEN
                assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');

                const retrievedTypes = Object.keys(result[buName]);
                assert.equal(retrievedTypes.length, 2, 'retrieve should have returned 2 types');
                assert.equal(
                    retrievedTypes.includes('dataExtract'),
                    true,
                    'retrieve should have returned dataExtract'
                );
                assert.equal(
                    retrievedTypes.includes('senderProfile'),
                    true,
                    'retrieve should have returned senderProfile'
                );
                assert.equal(
                    Object.keys(result[buName]['dataExtract']).length,
                    0,
                    'retrieve should have returned 0 dataExtracts'
                );
                assert.equal(
                    Object.keys(result[buName]['senderProfile']).length,
                    1,
                    'retrieve should have returned 1 senderProfile'
                );
                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    12,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });
        });

        describe('deploy without --metadata ~~~', () => {
            beforeEach(() => {
                testUtils.mockSetup(true);
            });

            it('deploy multiple type without keys', async () => {
                const argvMetadata = ['dataExtension', 'senderProfile'];
                const buName = 'testInstance/testBU';
                const result = await handler.deploy(buName, argvMetadata);
                // THEN
                assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');

                const deployedTypes = Object.keys(result[buName]);
                assert.equal(deployedTypes.length, 2, 'deploy should have returned 2 types');
                assert.equal(
                    deployedTypes[0],
                    'dataExtension',
                    'deploy should have returned dataExtension'
                );
                assert.equal(
                    deployedTypes[1],
                    'senderProfile',
                    'deploy should have returned senderProfile'
                );
                assert.equal(
                    Object.keys(result[buName]['dataExtension']).length,
                    2,
                    'deploy should have returned 2 dataExtension'
                );
                assert.equal(
                    Object.keys(result[buName]['senderProfile']).length,
                    2,
                    'deploy should have returned 2 senderProfile'
                );
                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    20,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });

            it('deploy multiple type with keys', async () => {
                const buName = 'testInstance/testBU';
                const result = await handler.deploy(
                    buName,
                    ['dataExtension', 'dataExtract', 'senderProfile', 'query'],
                    ['wrong-key', 'wrong-key2', 'testExisting_senderProfile', 'testExisting_query']
                );
                // THEN
                assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');

                const deployedTypes = Object.keys(result[buName]);
                assert.equal(deployedTypes.length, 2, 'deploy should have returned 2 types');
                assert.equal(
                    deployedTypes.includes('dataExtension'),
                    false,
                    'deploy should have returned dataExtension'
                );
                assert.equal(
                    deployedTypes.includes('dataExtract'),
                    false,
                    'deploy should have returned dataExtract'
                );
                assert.equal(
                    deployedTypes.includes('senderProfile'),
                    true,
                    'deploy should have returned senderProfile'
                );
                assert.equal(
                    deployedTypes.includes('query'),
                    true,
                    'deploy should have returned query'
                );
                assert.equal(
                    Object.keys(result[buName]['senderProfile']).length,
                    1,
                    'deploy should have returned 1 senderProfile'
                );
                assert.equal(
                    Object.keys(result[buName]['query']).length,
                    1,
                    'deploy should have returned 1 query'
                );
                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    13,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });
        });

        describe('Refresh ================', () => {
            it('Should not refresh anything due to missing type', async () => {
                // WHEN
                const replace = await handler.refresh('testInstance/testBU', null);
                // THEN
                assert.equal(process.exitCode, 1, 'refresh should have thrown an error');
                // retrieve result

                assert.deepEqual(
                    Object.keys(replace).length,
                    0,
                    'should not have replaced anything'
                );

                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    0,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
                return;
            });
        });
    });

    describe('init ================', () => {
        it('should init a local project without downloading BUs');

        it('should init a local project and download all BUs');
    });

    describe('join ================', () => {
        it('should clone a project from git');
    });

    describe('upgrade ================', () => {
        it('should upgrade a project to the latest version');
    });

    describe('reloadBUs ================', () => {
        it('should load all BUs from the server and refresh the config');
    });

    describe('selectTypes ================', () => {
        it('should change which types are selected for default retrieval');
    });

    describe('explainTypes ================', () => {
        it('without options', () => {
            handler.explainTypes();
            assert.equal(process.exitCode, 0, 'explainTypes should not have thrown an error');

            return;
        });

        it('with --json set', () => {
            handler.setOptions({ json: true });
            const typeArr = handler.explainTypes();

            assert.equal(
                process.exitCode,
                0,
                'explainTypes --json should not have thrown an error'
            );

            // check if properties are all there
            expect(typeArr[0]).to.have.all.keys(
                'name',
                'apiName',
                'retrieveByDefault',
                'description',
                'supports'
            );
            expect(typeArr[0].supports).to.have.all.keys(
                'retrieve',
                'create',
                'update',
                'delete',
                'changeKey',
                'buildTemplate',
                'retrieveAsTemplate'
            );

            // check if certain types were returned
            assert.equal(
                typeArr.find((type) => type.apiName === 'dataExtension')?.apiName,
                'dataExtension',
                'Expected to find dataExtension type'
            );

            return;
        });
    });

    describe('createDeltaPkg ================', () => {
        it('should show diff to master branch');
        // mcdev createDeltaPkg master # resolves to master..HEAD
        it('should show diff between master and develop branch');
        // mcdev createDeltaPkg master..develop
        it(
            'should show diff between master and develop branch and filter the results to only show MyProject/BU1'
        );
        // mcdev createDeltaPkg master..develop --filter 'MyProject/BU1'
    });
});
