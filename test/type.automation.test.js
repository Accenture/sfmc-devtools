const chai = require('chai');
const chaiFiles = require('chai-files');

chai.use(chaiFiles);

const assert = chai.assert;
const expect = chai.expect;
const file = chaiFiles.file;
const cache = require('../lib/util/cache');
const testUtils = require('./utils');
const handler = require('../lib/index');

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
                4,
                'only four automations expected'
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
                17,
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
            const deployResult = await handler.deploy('testInstance/testBU', ['automation']);
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
                5,
                'three automations expected'
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
                16,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should update & schedule an automation with --schedule option', async () => {
            // WHEN
            handler.setOptions({ schedule: true });
            const deployed = await handler.deploy(
                'testInstance/testBU',
                ['automation'],
                ['testExisting_automation', 'testNew_automation']
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
                5,
                'five cached automation expected'
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
                24,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should update & runOnce an automation with --execute option', async () => {
            // WHEN
            handler.setOptions({ execute: true });
            const deployed = await handler.deploy(
                'testInstance/testBU',
                ['automation'],
                ['testExisting_automation', 'testNew_automation']
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
                5,
                'five cached automation expected'
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
                20,
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
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                14,
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
                29,
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
                31,
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
                32,
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
                26,
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
                30,
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
                32,
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
                14,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should create a automation template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['automation']);
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
                17,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
    describe('Delete ================', () => {
        it('Should delete the item', async () => {
            // WHEN
            const result = await handler.deleteByKey(
                'testInstance/testBU',
                'automation',
                'testExisting_automation'
            );
            // THEN
            assert.equal(process.exitCode, false, 'delete should not have thrown an error');

            assert.equal(result, true, 'should have deleted the item');
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
});
