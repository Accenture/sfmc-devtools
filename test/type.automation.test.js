import chai, { assert, expect } from 'chai';
import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);
const file = chaiFiles.file;

describe('type: automation', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });
    afterEach(() => {
        testUtils.mockReset();
    });
    describe('Retrieve ================', () => {
        it('Should retrieve a automation', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['automation']);
            // THEN
            assert.equal(process.exitCode, false, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.automation ? Object.keys(result.automation).length : 0,
                19,
                'only 19 automations expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_automation', 'automation'),
                await testUtils.getExpectedJson('9999999', 'automation', 'retrieve'),

                'returned metadata was not equal expected'
            );
            // check if MD file was created and equals expectations
            expect(file(testUtils.getActualDoc('testExisting_automation', 'automation'))).to.equal(
                file(
                    testUtils.getExpectedFile(
                        '9999999',
                        'automation',
                        'retrieve-testExisting_automation',
                        'md'
                    )
                )
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                48,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
    describe('Deploy ================', () => {
        beforeEach(() => {
            testUtils.mockSetup(true);
        });
        it('Should create & update a automation', async () => {
            // WHEN
            const deployResult = await handler.deploy(
                'testInstance/testBU',
                ['automation', 'verification'],
                ['testExisting_automation', 'testNew_automation', 'testNew_39f6a488-20eb-4ba0-b0b9']
            );
            // THEN
            assert.equal(process.exitCode, false, 'deploy should not have thrown an error');

            // check how many items were deployed
            assert.equal(
                deployResult['testInstance/testBU']?.automation
                    ? Object.keys(deployResult['testInstance/testBU']?.automation).length
                    : 0,
                2,
                'two automations to be deployed'
            );

            // get results from cache
            const cacheResult = cache.getCache();
            assert.equal(
                cacheResult.automation ? Object.keys(cacheResult.automation).length : 0,
                20,
                '20 automations expected'
            );
            // insert
            assert.deepEqual(
                await testUtils.getActualJson('testNew_automation', 'automation'),
                await testUtils.getExpectedJson('9999999', 'automation', 'create'),
                'returned metadata was not equal expected for create'
            );
            // update
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_automation', 'automation'),
                await testUtils.getExpectedJson('9999999', 'automation', 'update'),
                'returned metadata was not equal expected for update'
            );
            // check if MD file was created and equals expectations
            expect(file(testUtils.getActualDoc('testExisting_automation', 'automation'))).to.equal(
                file(
                    testUtils.getExpectedFile(
                        '9999999',
                        'automation',
                        'update-testExisting_automation',
                        'md'
                    )
                )
            );

            // check if MD file was created and equals expectations
            expect(file(testUtils.getActualDoc('testNew_automation', 'automation'))).to.equal(
                file(
                    testUtils.getExpectedFile(
                        '9999999',
                        'automation',
                        'create-testNew_automation',
                        'md'
                    )
                )
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                40,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should update & schedule an automation with --schedule option', async () => {
            // WHEN
            handler.setOptions({ schedule: true });
            const deployed = await handler.deploy(
                'testInstance/testBU',
                ['automation', 'verification'],
                ['testExisting_automation', 'testNew_automation', 'testNew_39f6a488-20eb-4ba0-b0b9']
            );
            // THEN
            assert.equal(
                process.exitCode,
                false,
                'deploy with --execute should not have thrown an error'
            );

            // get results from cache
            const cached = cache.getCache();
            assert.equal(
                cached.automation ? Object.keys(cached.automation).length : 0,
                20,
                '20 cached automation expected'
            );
            assert.equal(
                deployed['testInstance/testBU'].automation
                    ? Object.keys(deployed['testInstance/testBU'].automation).length
                    : 0,
                2,
                'two deployed automation expected'
            );
            assert.equal(
                deployed['testInstance/testBU'].automation
                    ? Object.keys(deployed['testInstance/testBU'].automation)[0]
                    : null,
                'testNew_automation',
                'expected specific automation to have been deployed'
            );
            assert.equal(
                deployed['testInstance/testBU'].automation
                    ? Object.keys(deployed['testInstance/testBU'].automation)[1]
                    : null,
                'testExisting_automation',
                'expected specific automation to have been deployed'
            );

            // update
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_automation', 'automation'),
                await testUtils.getExpectedJson('9999999', 'automation', 'update'),
                'returned metadata was not equal expected for update'
            );
            // check if MD file was created and equals expectations
            expect(file(testUtils.getActualDoc('testExisting_automation', 'automation'))).to.equal(
                file(
                    testUtils.getExpectedFile(
                        '9999999',
                        'automation',
                        'update-testExisting_automation',
                        'md'
                    )
                )
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                48,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should update & runOnce an automation with --execute option', async () => {
            // WHEN
            handler.setOptions({ execute: true });
            const deployed = await handler.deploy(
                'testInstance/testBU',
                ['automation', 'verification'],
                ['testExisting_automation', 'testNew_automation', 'testNew_39f6a488-20eb-4ba0-b0b9']
            );
            // THEN
            assert.equal(
                process.exitCode,
                false,
                'deploy with --execute should not have thrown an error'
            );

            // get results from cache
            const cached = cache.getCache();
            assert.equal(
                cached.automation ? Object.keys(cached.automation).length : 0,
                20,
                '20 cached automation expected'
            );
            assert.equal(
                deployed['testInstance/testBU'].automation
                    ? Object.keys(deployed['testInstance/testBU'].automation).length
                    : 0,
                2,
                'two deployed automation expected'
            );
            assert.equal(
                deployed['testInstance/testBU'].automation
                    ? Object.keys(deployed['testInstance/testBU'].automation)[0]
                    : null,
                'testNew_automation',
                'expected specific automation to have been deployed'
            );
            assert.equal(
                deployed['testInstance/testBU'].automation
                    ? Object.keys(deployed['testInstance/testBU'].automation)[1]
                    : null,
                'testExisting_automation',
                'expected specific automation to have been deployed'
            );
            // update
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_automation', 'automation'),
                await testUtils.getExpectedJson('9999999', 'automation', 'update'),
                'returned metadata was not equal expected for update'
            );
            // check if MD file was created and equals expectations
            expect(file(testUtils.getActualDoc('testExisting_automation', 'automation'))).to.equal(
                file(
                    testUtils.getExpectedFile(
                        '9999999',
                        'automation',
                        'update-testExisting_automation',
                        'md'
                    )
                )
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                44,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
    describe('FixKeys ================', () => {
        beforeEach(() => {
            testUtils.mockSetup(true);
        });
        it('Should run fixKeys but not find fixable keys and hence stop', async () => {
            // WHEN
            handler.setOptions({ skipInteraction: { fixKeysReretrieve: false } });
            const resultFixKeys = await handler.fixKeys('testInstance/testBU', 'automation', [
                'testExisting_automation',
            ]);
            // THEN
            assert.equal(process.exitCode, false, 'fixKeys should not have thrown an error');
            // check which keys were fixed
            assert.equal(
                resultFixKeys['testInstance/testBU'].length,
                0,
                'expected to find no keys to be fixed'
            );

            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.automation ? Object.keys(result.automation).length : 0,
                1,
                'one automation expected'
            );
            testUtils.logAPIHistoryDebug();
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                33,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should fixKeys by key w/o re-retrieving, auto-schedule', async () => {
            // WHEN
            handler.setOptions({ skipInteraction: { fixKeysReretrieve: false } });
            const resultFixKeys = await handler.fixKeys('testInstance/testBU', 'automation', [
                'testExisting_automation_fixKey_schedule',
                'testExisting_automation',
            ]);
            assert.equal(
                resultFixKeys['testInstance/testBU'].length,
                1,
                'returned number of keys does not correspond to number of expected fixed keys'
            );
            assert.equal(
                resultFixKeys['testInstance/testBU'][0],
                'testExisting_automation_fixedKey_scheduled',
                'returned keys do not correspond to expected fixed keys'
            );
            // THEN
            assert.equal(process.exitCode, false, 'fixKeys should not have thrown an error');
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_automation_fixedKey_scheduled',
                    'automation'
                ),
                await testUtils.getExpectedJson('9999999', 'automation', 'patch_fixKeys-schedule'),
                'returned metadata was not equal expected for update automation'
            );
            expect(
                file(
                    testUtils.getActualDoc(
                        'testExisting_automation_fixedKey_scheduled',
                        'automation'
                    )
                )
            ).to.exist;
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                70,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should fixKeys by key w/o re-retrieving, auto-schedule and then --execute', async () => {
            // WHEN
            handler.setOptions({ skipInteraction: { fixKeysReretrieve: false }, execute: true });
            const resultFixKeys = await handler.fixKeys('testInstance/testBU', 'automation', [
                'testExisting_automation_fixKey_schedule',
                'testExisting_automation',
            ]);
            assert.equal(
                resultFixKeys['testInstance/testBU'].length,
                1,
                'returned number of keys does not correspond to number of expected fixed keys'
            );
            assert.equal(
                resultFixKeys['testInstance/testBU'][0],
                'testExisting_automation_fixedKey_scheduled',
                'returned keys do not correspond to expected fixed keys'
            );
            // THEN
            assert.equal(process.exitCode, false, 'fixKeys should not have thrown an error');
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_automation_fixedKey_scheduled',
                    'automation'
                ),
                await testUtils.getExpectedJson('9999999', 'automation', 'patch_fixKeys-schedule'),
                'returned metadata was not equal expected for update automation'
            );
            expect(
                file(
                    testUtils.getActualDoc(
                        'testExisting_automation_fixedKey_scheduled',
                        'automation'
                    )
                )
            ).to.exist;
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                72,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should fixKeys by key w/o re-retrieving, auto-schedule and then --schedule', async () => {
            // WHEN
            handler.setOptions({ skipInteraction: { fixKeysReretrieve: false }, schedule: true });
            const resultFixKeys = await handler.fixKeys('testInstance/testBU', 'automation', [
                'testExisting_automation_fixKey_schedule',
                'testExisting_automation',
            ]);
            assert.equal(
                resultFixKeys['testInstance/testBU'].length,
                1,
                'returned number of keys does not correspond to number of expected fixed keys'
            );
            assert.equal(
                resultFixKeys['testInstance/testBU'][0],
                'testExisting_automation_fixedKey_scheduled',
                'returned keys do not correspond to expected fixed keys'
            );
            // THEN
            assert.equal(process.exitCode, false, 'fixKeys should not have thrown an error');
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_automation_fixedKey_scheduled',
                    'automation'
                ),
                await testUtils.getExpectedJson('9999999', 'automation', 'patch_fixKeys-schedule'),
                'returned metadata was not equal expected for update automation'
            );
            expect(
                file(
                    testUtils.getActualDoc(
                        'testExisting_automation_fixedKey_scheduled',
                        'automation'
                    )
                )
            ).to.exist;
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                73,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should fixKeys by key w/o re-retrieving, deploy paused', async () => {
            // WHEN
            handler.setOptions({ skipInteraction: { fixKeysReretrieve: false } });
            const resultFixKeys = await handler.fixKeys('testInstance/testBU', 'automation', [
                'testExisting_automation_fixKey_pause',
            ]);
            assert.equal(
                resultFixKeys['testInstance/testBU'].length,
                1,
                'returned number of keys does not correspond to number of expected fixed keys'
            );
            assert.equal(
                resultFixKeys['testInstance/testBU'][0],
                'testExisting_automation_fixedKey_paused',
                'returned keys do not correspond to expected fixed keys'
            );
            // THEN
            assert.equal(process.exitCode, false, 'fixKeys should not have thrown an error');
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_automation_fixedKey_paused',
                    'automation'
                ),
                await testUtils.getExpectedJson('9999999', 'automation', 'patch_fixKeys-pause'),
                'returned metadata was not equal expected for update automation'
            );
            expect(
                file(
                    testUtils.getActualDoc('testExisting_automation_fixedKey_paused', 'automation')
                )
            ).to.exist;
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                65,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should fixKeys by key w/o re-retrieving, deploy paused and then --execute', async () => {
            // WHEN
            handler.setOptions({ skipInteraction: { fixKeysReretrieve: false }, execute: true });
            const resultFixKeys = await handler.fixKeys('testInstance/testBU', 'automation', [
                'testExisting_automation_fixKey_pause',
                'testExisting_automation',
            ]);
            assert.equal(
                resultFixKeys['testInstance/testBU'].length,
                1,
                'returned number of keys does not correspond to number of expected fixed keys'
            );
            assert.equal(
                resultFixKeys['testInstance/testBU'][0],
                'testExisting_automation_fixedKey_paused',
                'returned keys do not correspond to expected fixed keys'
            );
            // THEN
            assert.equal(process.exitCode, false, 'fixKeys should not have thrown an error');
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_automation_fixedKey_paused',
                    'automation'
                ),
                await testUtils.getExpectedJson('9999999', 'automation', 'patch_fixKeys-pause'),
                'returned metadata was not equal expected for update automation'
            );
            expect(
                file(
                    testUtils.getActualDoc('testExisting_automation_fixedKey_paused', 'automation')
                )
            ).to.exist;
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                71,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should fixKeys by key w/o re-retrieving, deploy paused and then --schedule', async () => {
            // WHEN
            handler.setOptions({ skipInteraction: { fixKeysReretrieve: false }, schedule: true });
            const resultFixKeys = await handler.fixKeys('testInstance/testBU', 'automation', [
                'testExisting_automation_fixKey_pause',
                'testExisting_automation',
            ]);
            assert.equal(
                resultFixKeys['testInstance/testBU'].length,
                1,
                'returned number of keys does not correspond to number of expected fixed keys'
            );
            assert.equal(
                resultFixKeys['testInstance/testBU'][0],
                'testExisting_automation_fixedKey_paused',
                'returned keys do not correspond to expected fixed keys'
            );
            // THEN
            assert.equal(process.exitCode, false, 'fixKeys should not have thrown an error');
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_automation_fixedKey_paused',
                    'automation'
                ),
                await testUtils.getExpectedJson('9999999', 'automation', 'patch_fixKeys-pause'),
                'returned metadata was not equal expected for update automation'
            );
            expect(
                file(
                    testUtils.getActualDoc('testExisting_automation_fixedKey_paused', 'automation')
                )
            ).to.exist;
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                73,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
    describe('Templating ================', () => {
        it('Should create a automation template via retrieveAsTemplate and build it', async () => {
            // GIVEN there is a template
            const result = await handler.retrieveAsTemplate(
                'testInstance/testBU',
                'automation',
                ['testExisting_automation'],
                'testSourceMarket'
            );
            assert.equal(
                process.exitCode,
                false,
                'retrieveAsTemplate should not have thrown an error'
            );

            // WHEN
            assert.equal(
                result.automation ? Object.keys(result.automation).length : 0,
                1,
                'only one automation expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson('testExisting_automation', 'automation'),
                await testUtils.getExpectedJson('9999999', 'automation', 'template'),
                'returned template was not equal expected'
            );
            // THEN
            await handler.buildDefinition(
                'testInstance/testBU',
                'automation',
                'testExisting_automation',
                'testTargetMarket'
            );
            assert.equal(
                process.exitCode,
                false,
                'buildDefinition should not have thrown an error'
            );
            assert.deepEqual(
                await testUtils.getActualDeployJson('testTemplated_automation', 'automation'),
                await testUtils.getExpectedJson('9999999', 'automation', 'build'),
                'returned deployment file was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                35,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should create a automation template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve(
                'testInstance/testBU',
                ['automation'],
                ['testExisting_automation']
            );
            // GIVEN there is a template
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'automation',
                ['testExisting_automation'],
                'testSourceMarket'
            );
            assert.equal(process.exitCode, false, 'buildTemplate should not have thrown an error');
            // WHEN
            assert.equal(
                result.automation ? Object.keys(result.automation).length : 0,
                1,
                'only one automation expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson('testExisting_automation', 'automation'),
                await testUtils.getExpectedJson('9999999', 'automation', 'template'),
                'returned template was not equal expected'
            );
            // THEN
            await handler.buildDefinition(
                'testInstance/testBU',
                'automation',
                'testExisting_automation',
                'testTargetMarket'
            );
            assert.equal(
                process.exitCode,
                false,
                'buildDefinition should not have thrown an error'
            );

            assert.deepEqual(
                await testUtils.getActualDeployJson('testTemplated_automation', 'automation'),
                await testUtils.getExpectedJson('9999999', 'automation', 'build'),
                'returned deployment file was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                33,
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
                'automation',
                'testExisting_automation'
            );
            // THEN
            assert.equal(process.exitCode, false, 'delete should not have thrown an error');

            assert.equal(isDeleted, true, 'should have deleted the item');
            return;
        });
    });
    describe('CI/CD ================', () => {
        it('Should return a list of files based on their type and key', async () => {
            // WHEN
            const fileList = await handler.getFilesToCommit('testInstance/testBU', 'automation', [
                'testExisting_automation',
            ]);
            // THEN
            assert.equal(
                process.exitCode,
                false,
                'getFilesToCommit should not have thrown an error'
            );
            assert.equal(fileList.length, 2, 'expected only 2 file paths');

            assert.equal(
                fileList[0].split('\\').join('/'),
                'retrieve/testInstance/testBU/automation/testExisting_automation.automation-meta.json',
                'wrong JSON path'
            );
            assert.equal(
                fileList[1].split('\\').join('/'),
                'retrieve/testInstance/testBU/automation/testExisting_automation.automation-doc.md',
                'wrong MD path'
            );
            return;
        });
    });
    describe('Schedule ================', () => {
        it('Should schedule an automation by key', async () => {
            const executedKeys = await handler.schedule('testInstance/testBU', 'automation', [
                'testExisting_automation',
            ]);
            assert.equal(process.exitCode, false, 'execute should not have thrown an error');
            assert.equal(
                executedKeys['testInstance/testBU']?.length,
                1,
                'returned number of keys does not correspond to number of expected fixed keys'
            );
            assert.equal(
                executedKeys['testInstance/testBU'][0],
                'testExisting_automation',
                'returned keys do not correspond to expected fixed keys'
            );
            return;
        });
        it('Should schedule an automation selected via --like', async () => {
            handler.setOptions({ like: { key: 'testExist%automation' } });
            const executedKeys = await handler.schedule('testInstance/testBU', 'automation');
            assert.equal(process.exitCode, false, 'execute should not have thrown an error');
            assert.equal(
                executedKeys['testInstance/testBU']?.length,
                1,
                'returned number of keys does not correspond to number of expected fixed keys'
            );
            assert.equal(
                executedKeys['testInstance/testBU'][0],
                'testExisting_automation',
                'returned keys do not correspond to expected fixed keys'
            );
            return;
        });
        it('Should not schedule executing an automation because key and --like was specified', async () => {
            handler.setOptions({ like: { key: 'testExisting%' } });
            const executedKeys = await handler.schedule('testInstance/testBU', 'automation', [
                'testExisting_automation',
            ]);
            assert.equal(process.exitCode, true, 'execute should have thrown an error');
            assert.equal(
                Object.keys(executedKeys).length,
                0,
                'automation was not supposed to be executed'
            );
            return;
        });
    });
    describe('Execute ================', () => {
        it('Should execute --schedule an automation by key', async () => {
            handler.setOptions({ schedule: true });
            const executedKeys = await handler.execute('testInstance/testBU', 'automation', [
                'testExisting_automation',
            ]);
            assert.equal(process.exitCode, false, 'execute should not have thrown an error');
            assert.equal(
                executedKeys['testInstance/testBU']?.length,
                1,
                'returned number of keys does not correspond to number of expected fixed keys'
            );
            assert.equal(
                executedKeys['testInstance/testBU'][0],
                'testExisting_automation',
                'returned keys do not correspond to expected fixed keys'
            );
            return;
        });
        it('Should execute --schedule an automation selected via --like', async () => {
            handler.setOptions({ like: { key: 'testExist%automation' }, schedule: true });
            const executedKeys = await handler.execute('testInstance/testBU', 'automation');
            assert.equal(process.exitCode, false, 'execute should not have thrown an error');
            assert.equal(
                executedKeys['testInstance/testBU']?.length,
                1,
                'returned number of keys does not correspond to number of expected fixed keys'
            );
            assert.equal(
                executedKeys['testInstance/testBU'][0],
                'testExisting_automation',
                'returned keys do not correspond to expected fixed keys'
            );
            return;
        });
        it('Should not execute --schedule executing an automation because key and --like was specified', async () => {
            handler.setOptions({ like: { key: 'testExisting%' }, schedule: true });
            const executedKeys = await handler.execute('testInstance/testBU', 'automation', [
                'testExisting_automation',
            ]);
            assert.equal(process.exitCode, true, 'execute should have thrown an error');
            assert.equal(
                Object.keys(executedKeys).length,
                0,
                'automation was not supposed to be executed'
            );
            return;
        });
        it('Should runOnce an automation by key', async () => {
            const executedKeys = await handler.execute('testInstance/testBU', 'automation', [
                'testExisting_automation',
            ]);
            assert.equal(process.exitCode, false, 'execute should not have thrown an error');
            assert.equal(
                executedKeys['testInstance/testBU']?.length,
                1,
                'automation was supposed to be executed'
            );
            assert.equal(
                executedKeys['testInstance/testBU'][0],
                'testExisting_automation',
                'returned keys do not correspond to expected fixed keys'
            );
            return;
        });
        it('Should runOnce an automation selected via --like', async () => {
            handler.setOptions({ like: { key: 'testExist%automation' } });
            const executedKeys = await handler.execute('testInstance/testBU', 'automation');
            assert.equal(process.exitCode, false, 'execute should not have thrown an error');
            assert.equal(
                executedKeys['testInstance/testBU']?.length,
                1,
                'automation was supposed to be executed'
            );
            assert.equal(
                executedKeys['testInstance/testBU'][0],
                'testExisting_automation',
                'returned keys do not correspond to expected fixed keys'
            );

            return;
        });
        it('Should not runOnce executing an automation because key and --like was specified', async () => {
            handler.setOptions({ like: { key: 'testExisting%' } });
            const executedKeys = await handler.execute('testInstance/testBU', 'automation', [
                'testExisting_automation',
            ]);
            assert.equal(process.exitCode, true, 'execute should have thrown an error');
            assert.equal(
                Object.keys(executedKeys).length,
                0,
                'automation was not supposed to be executed'
            );

            return;
        });
    });
    describe('Pause ================', () => {
        it('Should pause a automation by key', async () => {
            const pausedKeys = await handler.pause('testInstance/testBU', 'automation', [
                'testExisting_automation_pause',
            ]);
            assert.equal(process.exitCode, false, 'pause should not have thrown an error');
            assert.equal(
                pausedKeys['testInstance/testBU']?.length,
                1,
                'returned number of keys does not correspond to number of expected fixed keys'
            );
            assert.equal(
                pausedKeys['testInstance/testBU'][0],
                'testExisting_automation_pause',
                'returned keys do not correspond to expected fixed keys'
            );
            return;
        });
        it('Should pause a automation selected via --like', async () => {
            handler.setOptions({ like: { key: 'testExisting_a%n_pause' } });
            const pausedKeys = await handler.pause('testInstance/testBU', 'automation');
            assert.equal(process.exitCode, false, 'pause should not have thrown an error');
            assert.equal(
                pausedKeys['testInstance/testBU']?.length,
                1,
                'returned number of keys does not correspond to number of expected fixed keys'
            );
            assert.equal(
                pausedKeys['testInstance/testBU'][0],
                'testExisting_automation_pause',
                'returned keys do not correspond to expected fixed keys'
            );
            return;
        });
        it('Should not pause automation because key and --like was specified', async () => {
            handler.setOptions({ like: { key: 'testExisting_a%n_pause' } });
            const pausedKeys = await handler.pause('testInstance/testBU', 'automation', [
                'testExisting_automation_pause',
            ]);
            assert.equal(process.exitCode, true, 'pause should have thrown an error');
            assert.equal(
                Object.keys(pausedKeys).length,
                0,
                'returned number of keys does not correspond to number of expected fixed keys'
            );
            return;
        });
    });
    describe('Update notifications ================', () => {
        it('Should update ERROR EMAIL address and COMPLETION EMAIL address', async () => {
            handler.setOptions({ errorEmail: 'test@test.com', completionEmail: 'test@test.com' });
            const updatedNotifications = await handler.updateNotifications(
                'testInstance/testBU',
                'automation',
                ['testExisting_automation_updateNotifications_errorEmailCompletionEmail']
            );
            assert.equal(
                process.exitCode,
                false,
                'update notifications should not have thrown an error'
            );
            assert.equal(
                updatedNotifications['testInstance/testBU'].length,
                1,
                'one automation expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_automation_updateNotifications_errorEmailCompletionEmail',
                    'automation'
                ),
                await testUtils.getExpectedJson(
                    '9999999',
                    'automation',
                    'updateNotifications_errorEmailCompletionEmail'
                ),
                'returned metadata was not equal expected for update'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                36,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should update ERROR NOTE and ERROR EMAIL address', async () => {
            handler.setOptions({ errorEmail: 'test@test.com', errorNote: 'test' });
            const updatedNotifications = await handler.updateNotifications(
                'testInstance/testBU',
                'automation',
                ['testExisting_automation_updateNotifications_errorEmailErrorNote']
            );
            assert.equal(
                process.exitCode,
                false,
                'update notifications should not have thrown an error'
            );
            assert.equal(
                updatedNotifications['testInstance/testBU'].length,
                1,
                'one automation expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_automation_updateNotifications_errorEmailErrorNote',
                    'automation'
                ),
                await testUtils.getExpectedJson(
                    '9999999',
                    'automation',
                    'updateNotifications_errorEmailErrorNote'
                ),
                'returned metadata was not equal expected for update'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                36,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should update COMPLETION NOTE and COMPLETION EMAIL address', async () => {
            handler.setOptions({ completionEmail: 'test@test.com', completionNote: 'test' });
            const updatedNotifications = await handler.updateNotifications(
                'testInstance/testBU',
                'automation',
                ['testExisting_automation_updateNotifications_completionEmailCompletionNote']
            );
            assert.equal(
                process.exitCode,
                false,
                'update notifications should not have thrown an error'
            );
            assert.equal(
                updatedNotifications['testInstance/testBU'].length,
                1,
                'one automation expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_automation_updateNotifications_completionEmailCompletionNote',
                    'automation'
                ),
                await testUtils.getExpectedJson(
                    '9999999',
                    'automation',
                    'updateNotifications_completionEmailCompletionNote'
                ),
                'returned metadata was not equal expected for update'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                36,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should update COMPLETION EMAIL and ERROR NOTE', async () => {
            handler.setOptions({ completionEmail: 'test@test.com', errorNote: 'test' });
            const updatedNotifications = await handler.updateNotifications(
                'testInstance/testBU',
                'automation',
                ['testExisting_automation_updateNotifications_completionEmailErrorNote']
            );
            assert.equal(
                process.exitCode,
                false,
                'update notifications should not have thrown an error'
            );
            assert.equal(
                updatedNotifications['testInstance/testBU'].length,
                1,
                'one automation expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_automation_updateNotifications_completionEmailErrorNote',
                    'automation'
                ),
                await testUtils.getExpectedJson(
                    '9999999',
                    'automation',
                    'updateNotifications_completionEmailErrorNote'
                ),
                'returned metadata was not equal expected for update'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                36,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should update ERROR EMAIL and COMPLETION NOTE', async () => {
            handler.setOptions({ errorEmail: 'test@test.com', completionNote: 'test' });
            const updatedNotifications = await handler.updateNotifications(
                'testInstance/testBU',
                'automation',
                ['testExisting_automation_updateNotifications_errorEmailCompletionNote']
            );
            assert.equal(
                process.exitCode,
                false,
                'update notifications should not have thrown an error'
            );
            assert.equal(
                updatedNotifications['testInstance/testBU'].length,
                1,
                'one automation expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_automation_updateNotifications_errorEmailCompletionNote',
                    'automation'
                ),
                await testUtils.getExpectedJson(
                    '9999999',
                    'automation',
                    'updateNotifications_errorEmailCompletionNote'
                ),
                'returned metadata was not equal expected for update'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                36,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should update ERROR EMAIL, COMPLETION EMAIL and COMPLETION NOTE', async () => {
            handler.setOptions({
                errorEmail: 'test@test.com',
                completionEmail: 'test@test.com',
                completionNote: 'test',
            });
            const updatedNotifications = await handler.updateNotifications(
                'testInstance/testBU',
                'automation',
                [
                    'testExisting_automation_updateNotifications_errorEmailCompletionNoteCompletionEmail',
                ]
            );
            assert.equal(
                process.exitCode,
                false,
                'update notifications should not have thrown an error'
            );
            assert.equal(
                updatedNotifications['testInstance/testBU'].length,
                1,
                'one automation expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_automation_updateNotifications_errorEmailCompletionNoteCompletionEmail',
                    'automation'
                ),
                await testUtils.getExpectedJson(
                    '9999999',
                    'automation',
                    'updateNotifications_errorEmailCompletionNoteCompletionEmail'
                ),
                'returned metadata was not equal expected for update'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                36,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should update ERROR EMAIL, COMPLETION EMAIL and ERROR NOTE', async () => {
            handler.setOptions({
                errorEmail: 'test@test.com',
                errorNote: 'test',
                completionEmail: 'test@test.com',
            });
            const updatedNotifications = await handler.updateNotifications(
                'testInstance/testBU',
                'automation',
                ['testExisting_automation_updateNotifications_errorEmailErrorNoteCompletionEmail']
            );
            assert.equal(
                process.exitCode,
                false,
                'update notifications should not have thrown an error'
            );
            assert.equal(
                updatedNotifications['testInstance/testBU'].length,
                1,
                'one automation expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_automation_updateNotifications_errorEmailErrorNoteCompletionEmail',
                    'automation'
                ),
                await testUtils.getExpectedJson(
                    '9999999',
                    'automation',
                    'updateNotifications_errorEmailErrorNoteCompletionEmail'
                ),
                'returned metadata was not equal expected for update'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                36,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should update ERROR EMAIL, COMPLETION NOTE and ERROR NOTE', async () => {
            handler.setOptions({
                errorEmail: 'test@test.com',
                errorNote: 'test',
                completionNote: 'test',
            });
            const updatedNotifications = await handler.updateNotifications(
                'testInstance/testBU',
                'automation',
                ['testExisting_automation_updateNotifications_errorEmailCompletionNoteErrorNote']
            );
            assert.equal(
                process.exitCode,
                false,
                'update notifications should not have thrown an error'
            );
            assert.equal(
                updatedNotifications['testInstance/testBU'].length,
                1,
                'one automation expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_automation_updateNotifications_errorEmailCompletionNoteErrorNote',
                    'automation'
                ),
                await testUtils.getExpectedJson(
                    '9999999',
                    'automation',
                    'updateNotifications_errorEmailCompletionNoteErrorNote'
                ),
                'returned metadata was not equal expected for update'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                36,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should update COMPLETION EMAIL, COMPLETION NOTE and ERROR NOTE', async () => {
            handler.setOptions({
                errorEmail: 'test@test.com',
                errorNote: 'test',
                completionNote: 'test@test.com',
            });
            const updatedNotifications = await handler.updateNotifications(
                'testInstance/testBU',
                'automation',
                [
                    'testExisting_automation_updateNotifications_completionEmailCompletionNoteErrorNote',
                ]
            );
            assert.equal(
                process.exitCode,
                false,
                'update notifications should not have thrown an error'
            );
            assert.equal(
                updatedNotifications['testInstance/testBU'].length,
                1,
                'one automation expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_automation_updateNotifications_completionEmailCompletionNoteErrorNote',
                    'automation'
                ),
                await testUtils.getExpectedJson(
                    '9999999',
                    'automation',
                    'updateNotifications_completionEmailCompletionNoteErrorNote'
                ),
                'returned metadata was not equal expected for update'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                36,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should update COMPLETION NOTE', async () => {
            handler.setOptions({
                completionNote: 'test',
            });
            const updatedNotifications = await handler.updateNotifications(
                'testInstance/testBU',
                'automation',
                ['testExisting_automation_updateNotifications_completionNote']
            );
            assert.equal(
                process.exitCode,
                false,
                'update notifications should not have thrown an error'
            );
            assert.equal(
                updatedNotifications['testInstance/testBU'].length,
                1,
                'one automation expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_automation_updateNotifications_completionNote',
                    'automation'
                ),
                await testUtils.getExpectedJson(
                    '9999999',
                    'automation',
                    'updateNotifications_completionNote'
                ),
                'returned metadata was not equal expected for update'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                36,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should update all NOTES and both ERROR EMAIL and COMPLETION EMAIL', async () => {
            handler.setOptions({ errorEmail: 'test@test.com', errorNote: 'test' });
            const updatedNotifications = await handler.updateNotifications(
                'testInstance/testBU',
                'automation',
                ['testExisting_automation_updateNotifications_completionEmailNoteErrorEmailNote']
            );
            assert.equal(
                process.exitCode,
                false,
                'update notifications should not have thrown an error'
            );
            assert.equal(
                updatedNotifications['testInstance/testBU'].length,
                1,
                'one automation expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_automation_updateNotifications_completionEmailNoteErrorEmailNote',
                    'automation'
                ),
                await testUtils.getExpectedJson(
                    '9999999',
                    'automation',
                    'updateNotifications_completionEmailNoteErrorEmailNote'
                ),
                'returned metadata was not equal expected for update'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                36,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should NOT update an already existing error email address', async () => {
            handler.setOptions({ errorEmail: 'error@test.accenture.com' });
            const updatedNotificationsError = await handler.updateNotifications(
                'testInstance/testBU',
                'automation',
                ['testExisting_automation']
            );
            assert.equal(
                process.exitCode,
                false,
                'update error notifications should not have thrown an error'
            );
            assert.equal(
                updatedNotificationsError['testInstance/testBU'].length,
                0,
                'zero automation keys expected'
            );
            return;
        });
        it('Should NOT update an already existing completion email address', async () => {
            handler.setOptions({ completionEmail: 'complete@test.accenture.com' });
            const updatedNotificationsComplete = await handler.updateNotifications(
                'testInstance/testBU',
                'automation',
                ['testExisting_automation']
            );
            assert.equal(
                process.exitCode,
                false,
                'update completion notifications should not have thrown an error'
            );
            assert.equal(
                updatedNotificationsComplete['testInstance/testBU'].length,
                0,
                'zero automation keys expected'
            );
            return;
        });
        it('Should NOT update an already existing error note', async () => {
            handler.setOptions({ errorNote: 'test' });
            const updatedNotificationsNote = await handler.updateNotifications(
                'testInstance/testBU',
                'automation',
                ['testExisting_automation']
            );
            assert.equal(
                process.exitCode,
                false,
                'update error notifications should not have thrown an error'
            );
            assert.equal(
                updatedNotificationsNote['testInstance/testBU'].length,
                0,
                'zero automation keys expected'
            );
            return;
        });
        it('Should clear all notes and all notification email addresses', async () => {
            handler.setOptions({ clear: 'all' });
            const updatedNotifications = await handler.updateNotifications(
                'testInstance/testBU',
                'automation',
                ['testExisting_automation_clearNotificationsAll']
            );
            assert.equal(
                process.exitCode,
                false,
                'updateNotifications --clear should not have thrown an error'
            );
            assert.equal(
                updatedNotifications['testInstance/testBU'].length,
                1,
                'one automation key expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_automation_clearNotificationsAll',
                    'automation'
                ),
                await testUtils.getExpectedJson('9999999', 'automation', 'clearNotificationsAll'),
                'returned metadata was not equal expected for update'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                36,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should clear all eror email addresses', async () => {
            handler.setOptions({ clear: 'errorEmail' });
            const updatedNotifications = await handler.updateNotifications(
                'testInstance/testBU',
                'automation',
                ['testExisting_automation_clearNotificationsErrorEmail']
            );
            assert.equal(
                process.exitCode,
                false,
                'updateNotifications --clear should not have thrown an error'
            );
            assert.equal(
                updatedNotifications['testInstance/testBU'].length,
                1,
                'one automation key expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_automation_clearNotificationsErrorEmail',
                    'automation'
                ),
                await testUtils.getExpectedJson(
                    '9999999',
                    'automation',
                    'clearNotificationsErrorEmail'
                ),
                'returned metadata was not equal expected for update'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                36,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should clear all completion emails', async () => {
            handler.setOptions({ clear: 'completionEmail' });
            const updatedNotifications = await handler.updateNotifications(
                'testInstance/testBU',
                'automation',
                ['testExisting_automation_clearNotificationsCompletionEmail']
            );
            assert.equal(
                process.exitCode,
                false,
                'updateNotifications --clear should not have thrown an error'
            );
            assert.equal(
                updatedNotifications['testInstance/testBU'].length,
                1,
                'one automation key expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_automation_clearNotificationsCompletionEmail',
                    'automation'
                ),
                await testUtils.getExpectedJson(
                    '9999999',
                    'automation',
                    'clearNotificationsCompletionEmail'
                ),
                'returned metadata was not equal expected for update'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                36,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should clear all notes', async () => {
            handler.setOptions({ clear: 'notes' });
            const updatedNotifications = await handler.updateNotifications(
                'testInstance/testBU',
                'automation',
                ['testExisting_automation_clearNotificationsNotes']
            );
            assert.equal(
                process.exitCode,
                false,
                'updateNotifications --clear should not have thrown an error'
            );
            assert.equal(
                updatedNotifications['testInstance/testBU'].length,
                1,
                'one automation key expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_automation_clearNotificationsNotes',
                    'automation'
                ),
                await testUtils.getExpectedJson('9999999', 'automation', 'clearNotificationsNotes'),
                'returned metadata was not equal expected for update'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                36,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should NOT update email addresses. Invalid email address', async () => {
            handler.setOptions({ errorEmail: 'test', completionEmail: 'test' });
            const updatedNotifications = await handler.updateNotifications(
                'testInstance/testBU',
                'automation',
                ['testExisting_automation_NOTupdateNotifications_InvalidEmails']
            );
            assert.equal(
                process.exitCode,
                false,
                'update notifications should not have thrown an error'
            );
            assert.equal(
                updatedNotifications['testInstance/testBU'].length,
                0,
                'zero automations expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                2,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
});
