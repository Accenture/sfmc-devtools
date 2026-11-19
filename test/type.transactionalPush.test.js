import * as chai from 'chai';
const assert = chai.assert;

import chaiFiles from 'chai-files';
import fs from 'fs-extra';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
import TransactionalPush from '../lib/metadataTypes/TransactionalPush.js';
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
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
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
            const actual = await testUtils.getActualJson('testExisting_tpush', 'transactionalPush');
            assert.equal(
                actual.r__mobilePushApp_key,
                'ZmRVQWZaUU5YVXFGdmJVYVI3b2JudzoxMTc6MA',
                'applicationId should have been resolved to the key of the mobilePushApp'
            );
            assert.equal(
                actual.r__mobilePushApp_name,
                'Test Push App One',
                'applicationId should have been resolved to the name of the mobilePushApp'
            );
            assert.notProperty(
                actual,
                'applicationId',
                'applicationId should be removed once it was resolved'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                4,
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
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
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
            // created item: plain applicationId without r__mobilePushApp_* is sent unchanged
            const createCallout = testUtils.getRestCallout(
                'post',
                '/messaging/v1/push/definitions%'
            );
            assert.equal(
                createCallout.applicationId,
                'ffbab4c9-fbf6-4b87-9c9a-10c6ce86e81d',
                'a plain applicationId should be sent to the API unchanged'
            );
            // ... and stays in the saved file because no mobilePushApp with that id exists
            const created = await testUtils.getActualJson('testNew_tpush', 'transactionalPush');
            assert.equal(
                created.applicationId,
                'ffbab4c9-fbf6-4b87-9c9a-10c6ce86e81d',
                'an unresolvable applicationId should be kept'
            );
            assert.notProperty(created, 'r__mobilePushApp_key');
            assert.notProperty(created, 'r__mobilePushApp_name');
            // updated item: r__mobilePushApp_key is resolved to the id of the mobilePushApp
            const updateCallout = testUtils.getRestCallout(
                'patch',
                '/messaging/v1/push/definitions/testExisting_tpush'
            );
            assert.equal(
                updateCallout.applicationId,
                '7d00d57d-0d94-4a5d-85bd-b51a47ba1b9f',
                'r__mobilePushApp_key should have been resolved to the id of the mobilePushApp'
            );
            assert.notProperty(updateCallout, 'r__mobilePushApp_key');
            assert.notProperty(updateCallout, 'r__mobilePushApp_name');
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                6,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should resolve the mobilePushApp by NAME when its key does not exist on the target BU', async () => {
            // GIVEN a key from another BU and the name of "Test Push App Two"
            const deployPath =
                './deploy/testInstance/testBU/transactionalPush/testExisting_tpush.transactionalPush-meta.json';
            const item = await fs.readJson(deployPath);
            item.r__mobilePushApp_key = 'keyFromAnotherBU';
            item.r__mobilePushApp_name = 'Test Push App Two';
            await fs.writeJson(deployPath, item);
            // WHEN
            await handler.deploy(
                'testInstance/testBU',
                ['transactionalPush'],
                ['testExisting_tpush']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            const updateCallout = testUtils.getRestCallout(
                'patch',
                '/messaging/v1/push/definitions/testExisting_tpush'
            );
            assert.equal(
                updateCallout.applicationId,
                'd4f2c26f-2104-40f8-873e-c33bc579e744',
                'the name should have been resolved to the id of the mobilePushApp'
            );
            assert.notProperty(updateCallout, 'r__mobilePushApp_key');
            assert.notProperty(updateCallout, 'r__mobilePushApp_name');
            return;
        });

        it('Should NOT deploy a transactionalPush whose mobilePushApp is missing on the target BU', async () => {
            // GIVEN key and name that do not exist on the BU
            const deployPath =
                './deploy/testInstance/testBU/transactionalPush/testExisting_tpush.transactionalPush-meta.json';
            const item = await fs.readJson(deployPath);
            item.r__mobilePushApp_key = 'keyFromAnotherBU';
            item.r__mobilePushApp_name = 'This App Does Not Exist On Target';
            await fs.writeJson(deployPath, item);
            // WHEN
            await handler.deploy(
                'testInstance/testBU',
                ['transactionalPush'],
                ['testExisting_tpush']
            );
            // THEN
            assert.equal(process.exitCode, 1, 'deploy should have set an error exit code');
            assert.equal(
                testUtils.getRestCallout(
                    'patch',
                    '/messaging/v1/push/definitions/testExisting_tpush',
                    false,
                    true
                ),
                null,
                'the item must not be sent to the API'
            );
            return;
        });

        it('Should NOT deploy a transactionalPush whose mobilePushApp name matches more than one app on the target BU', async () => {
            // GIVEN two apps on the BU that share the name "Test Push App Two"
            const appsPath = './test/resources/9999999/push/v1/application/get-response.json';
            const apps = await fs.readJson(appsPath);
            apps[0].name = 'Test Push App Two';
            await fs.writeJson(appsPath, apps);
            // ... and a key from another BU, so that the name has to decide
            const deployPath =
                './deploy/testInstance/testBU/transactionalPush/testExisting_tpush.transactionalPush-meta.json';
            const item = await fs.readJson(deployPath);
            item.r__mobilePushApp_key = 'keyFromAnotherBU';
            item.r__mobilePushApp_name = 'Test Push App Two';
            await fs.writeJson(deployPath, item);
            // WHEN
            await handler.deploy(
                'testInstance/testBU',
                ['transactionalPush'],
                ['testExisting_tpush']
            );
            // THEN
            assert.equal(process.exitCode, 1, 'deploy should have set an error exit code');
            assert.equal(
                testUtils.getRestCallout(
                    'patch',
                    '/messaging/v1/push/definitions/testExisting_tpush',
                    false,
                    true
                ),
                null,
                'the item must not be sent to the API'
            );
            return;
        });

        it('Should resolve the mobilePushApp by KEY on the same BU even if its name matches more than one app', async () => {
            // GIVEN two apps on the BU that share the name "Test Push App Two"
            const appsPath = './test/resources/9999999/push/v1/application/get-response.json';
            const apps = await fs.readJson(appsPath);
            apps[0].name = 'Test Push App Two';
            await fs.writeJson(appsPath, apps);
            // ... and the key of the second of them
            const deployPath =
                './deploy/testInstance/testBU/transactionalPush/testExisting_tpush.transactionalPush-meta.json';
            const item = await fs.readJson(deployPath);
            item.r__mobilePushApp_key = apps[1].key;
            item.r__mobilePushApp_name = 'Test Push App Two';
            await fs.writeJson(deployPath, item);
            // WHEN
            await handler.deploy(
                'testInstance/testBU',
                ['transactionalPush'],
                ['testExisting_tpush']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            const updateCallout = testUtils.getRestCallout(
                'patch',
                '/messaging/v1/push/definitions/testExisting_tpush'
            );
            assert.equal(
                updateCallout.applicationId,
                apps[1].id,
                'the key should have been resolved without looking at the ambiguous name'
            );
            return;
        });

        it('Should resolve mobilePushApp references key-first, then by one unique name', async () => {
            cache.initCache({ mid: 9999999, eid: 1111111 });
            cache.setMetadata('mobilePushApp', {
                keyedApp: { id: 'keyedId', key: 'keyedApp', name: 'Shared App' },
                namedApp: { id: 'namedId', key: 'namedApp', name: 'Portable App' },
            });

            const keyFirst = await TransactionalPush.preDeployTasks({
                r__mobilePushApp_key: 'keyedApp',
                r__mobilePushApp_name: 'Portable App',
            });
            assert.deepEqual(keyFirst, { applicationId: 'keyedId' }, 'the matching key should win');

            const nameFallback = await TransactionalPush.preDeployTasks({
                r__mobilePushApp_key: 'missingKey',
                r__mobilePushApp_name: 'Portable App',
            });
            assert.deepEqual(
                nameFallback,
                { applicationId: 'namedId' },
                'one name match should resolve'
            );

            const nameOnly = await TransactionalPush.preDeployTasks({
                r__mobilePushApp_name: 'Shared App',
            });
            assert.deepEqual(
                nameOnly,
                { applicationId: 'keyedId' },
                'a name without key should resolve'
            );

            const plainId = await TransactionalPush.preDeployTasks({ applicationId: 'unknownId' });
            assert.deepEqual(
                plainId,
                { applicationId: 'unknownId' },
                'a plain applicationId should not be touched'
            );

            let missingError;
            try {
                await TransactionalPush.preDeployTasks({
                    r__mobilePushApp_key: 'missingKey',
                    r__mobilePushApp_name: 'Missing App',
                });
            } catch (ex) {
                missingError = ex;
            }
            assert.include(
                missingError?.message,
                "mobilePushApp 'Missing App' not found on target BU",
                'zero matches should hard-error with GUI creation guidance'
            );

            cache.setMetadata('mobilePushApp', {
                appOne: { id: 'appOne', key: 'appOne', name: 'Duplicate App' },
                appTwo: { id: 'appTwo', key: 'appTwo', name: 'Duplicate App' },
            });
            let duplicateError;
            try {
                await TransactionalPush.preDeployTasks({
                    r__mobilePushApp_key: 'missingKey',
                    r__mobilePushApp_name: 'Duplicate App',
                });
            } catch (ex) {
                duplicateError = ex;
            }
            assert.include(duplicateError?.message, 'appOne');
            assert.include(duplicateError?.message, 'appTwo');
            assert.include(
                duplicateError?.message,
                'Names must be unique within a BU',
                'more than one name match should hard-error and say why'
            );

            const keyDespiteDuplicates = await TransactionalPush.preDeployTasks({
                r__mobilePushApp_key: 'appTwo',
                r__mobilePushApp_name: 'Duplicate App',
            });
            assert.deepEqual(
                keyDespiteDuplicates,
                { applicationId: 'appTwo' },
                'a matching key should win even if the name is ambiguous'
            );
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
        it('Should create a transactionalPush template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['transactionalPush']);
            // buildTemplate
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'transactionalPush',
                ['testExisting_tpush'],
                ['testSourceMarket']
            );
            assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');
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
                ['testExisting_tpush'],
                ['testTargetMarket']
            );
            assert.equal(process.exitCode, 0, 'buildDefinition should not have thrown an error');

            assert.deepEqual(
                await testUtils.getActualDeployJson('testTemplated_tpush', 'transactionalPush'),
                await testUtils.getExpectedJson('9999999', 'transactionalPush', 'build'),
                'returned deployment JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                4,
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
        //     assert.equal(process.exitCode, 0, 'delete should not have thrown an error');

        //     assert.equal(isDeleted, true, 'should have deleted the item');
        //     return;
        // });
    });
});
