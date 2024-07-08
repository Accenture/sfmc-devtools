import * as chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);

describe('type: event', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });

    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a event', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['event']);
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.event ? Object.keys(result.event).length : 0,
                4,
                'only 4 event expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_event', 'event'),
                await testUtils.getExpectedJson('9999999', 'event', 'get'),
                'returned JSON was not equal expected'
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

        it('Should create an event & dataExtension via schema', async () => {
            // prepare
            await testUtils.copyFile(
                'interaction/v1/eventDefinitions/post_withSchema-response.json',
                'interaction/v1/eventDefinitions/post-response.json'
            );
            await testUtils.copyFile(
                'dataExtension/retrieve-createdViaEvent-response.xml',
                'dataExtension/retrieve-response.xml'
            );
            await testUtils.copyFile(
                'dataExtension/update-afterCreatedViaEvent-response.xml',
                'dataExtension/update-response.xml'
            );

            await handler.deploy('testInstance/testBU', ['event'], ['testNew_event_withSchema']);
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.event ? Object.keys(result.event).length : 0,
                5,
                '5 events expected'
            );
            // get callouts
            const createCallout = testUtils.getRestCallout(
                'post',
                '/interaction/v1/eventDefinitions/'
            );
            // confirm created item
            assert.deepEqual(
                createCallout,
                await testUtils.getExpectedJson('9999999', 'event', 'post_withSchema-callout'),
                'create-payload JSON was not equal expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testNew_event_withSchema', 'event'),
                await testUtils.getExpectedJson('9999999', 'event', 'post_withSchema'),
                'returned new-JSON was not equal expected for insert event'
            );
            // confirm we changed the dataExtension key correctly
            const updateCalloutDE = testUtils.getSoapCallouts('Update', 'DataExtension');
            expect(updateCalloutDE[0]).to.equal(
                await testUtils.getExpectedFile(
                    '9999999',
                    'dataExtension',
                    'update-callout-afterCreatedViaEvent',
                    'xml'
                )
            );

            // confirm created dataExtension
            assert.deepEqual(
                await testUtils.getActualJson('testNew_event_withSchema', 'dataExtension'),
                await testUtils.getExpectedJson(
                    '9999999',
                    'dataExtension',
                    'retrieve_event_withSchema'
                ),

                'returned metadata was not equal expected'
            );

            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                14,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should create an event with pre-Existing dataExtension', async () => {
            // prepare
            await testUtils.copyFile(
                'interaction/v1/eventDefinitions/post_withExistingDE-response.json',
                'interaction/v1/eventDefinitions/post-response.json'
            );

            await handler.deploy(
                'testInstance/testBU',
                ['event'],
                ['testNew_event_withExistingDE']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.event ? Object.keys(result.event).length : 0,
                5,
                '5 events expected'
            );
            // get callouts
            const createCallout = testUtils.getRestCallout(
                'post',
                '/interaction/v1/eventDefinitions/'
            );
            // confirm created item
            assert.deepEqual(
                createCallout,
                await testUtils.getExpectedJson('9999999', 'event', 'post_withExistingDE-callout'),
                'create-payload JSON was not equal expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testNew_event_withExistingDE', 'event'),
                await testUtils.getExpectedJson('9999999', 'event', 'post_withExistingDE'),
                'returned new-JSON was not equal expected for insert event'
            );
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                5,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should update an event', async () => {
            await handler.deploy('testInstance/testBU', ['event'], ['testExisting_event']);
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.event ? Object.keys(result.event).length : 0,
                4,
                '4 events expected'
            );
            // get callouts
            const updateCallout = testUtils.getRestCallout(
                'put',
                '/interaction/v1/eventDefinitions/%'
            );
            // confirm updated item
            assert.deepEqual(
                updateCallout,
                await testUtils.getExpectedJson('9999999', 'event', 'put-callout'),
                'update-payload JSON was not equal expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_event', 'event'),
                await testUtils.getExpectedJson('9999999', 'event', 'put'),
                'returned existing-JSON was not equal expected for update event'
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

    describe('FixKeys ================', () => {
        beforeEach(() => {
            testUtils.mockSetup(true);
        });

        it('Should exit fixKeys because event is not supported intentionally', async () => {
            // WHEN
            handler.setOptions({ skipInteraction: { fixKeysReretrieve: false } });
            const resultFixKeys = await handler.fixKeys('testInstance/testBU', ['event']);
            // THEN
            assert.equal(process.exitCode, 0, 'fixKeys should not have thrown an error');
            // check which keys were fixed
            assert.equal(
                resultFixKeys['testInstance/testBU'],
                undefined,
                'expected to find no keys to be fixed'
            );

            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                0,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Templating ================', () => {
        it('Should create a event template via retrieveAsTemplate and build it', async () => {
            // GIVEN there is a template
            const result = await handler.retrieveAsTemplate(
                'testInstance/testBU',
                'event',
                ['testExisting_event'],
                'testSourceMarket'
            );
            // WHEN
            assert.equal(process.exitCode, 0, 'retrieveAsTemplate should not have thrown an error');
            assert.equal(
                result.event ? Object.keys(result.event).length : 0,
                1,
                'only one event expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson('testExisting_event', 'event'),
                await testUtils.getExpectedJson('9999999', 'event', 'template'),
                'returned template JSON of retrieveAsTemplate was not equal expected'
            );
            // THEN
            await handler.buildDefinition(
                'testInstance/testBU',
                'event',
                ['testExisting_event'],
                'testTargetMarket'
            );
            assert.equal(process.exitCode, 0, 'buildDefinition should not have thrown an error');

            assert.deepEqual(
                await testUtils.getActualDeployJson('testTemplated_event', 'event'),
                await testUtils.getExpectedJson('9999999', 'event', 'build'),
                'returned deployment JSON was not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                4,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should create a event template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['event']);
            // GIVEN there is a template
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'event',
                ['testExisting_event'],
                'testSourceMarket'
            );
            // WHEN
            assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');

            assert.equal(
                result.event ? Object.keys(result.event).length : 0,
                1,
                'only one event expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson('testExisting_event', 'event'),
                await testUtils.getExpectedJson('9999999', 'event', 'template'),
                'returned template JSON of buildTemplate was not equal expected'
            );
            // THEN
            await handler.buildDefinition(
                'testInstance/testBU',
                'event',
                ['testExisting_event'],
                'testTargetMarket'
            );
            assert.equal(process.exitCode, 0, 'buildDefinition should not have thrown an error');

            assert.deepEqual(
                await testUtils.getActualDeployJson('testTemplated_event', 'event'),
                await testUtils.getExpectedJson('9999999', 'event', 'build'),
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
        it('Should delete the item', async () => {
            // WHEN
            const isDeleted = await handler.deleteByKey(
                'testInstance/testBU',
                'event',
                'testExisting_event'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deleteByKey should not have thrown an error');
            assert.equal(isDeleted, true, 'deleteByKey should have returned true');
            return;
        });
    });

    describe('CI/CD ================', () => {});
});
