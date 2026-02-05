import * as chai from 'chai';
const assert = chai.assert;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);

describe('type: fileLocation', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });

    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a fileLocation', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['fileLocation']);
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.fileLocation ? Object.keys(result.fileLocation).length : 0,
                6,
                'unexpected number of fileLocations'
            );
            assert.deepEqual(
                await testUtils.getActualJson('Salesforce Objects %26 Reports', 'fileLocation'),
                await testUtils.getExpectedJson('9999999', 'fileLocation', 'get-sor'),
                'returned JSON was not equal expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('ExactTarget Enhanced FTP', 'fileLocation'),
                await testUtils.getExpectedJson('9999999', 'fileLocation', 'get-eftp'),
                'returned JSON was not equal expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_fileLocation_gcp', 'fileLocation'),
                await testUtils.getExpectedJson('9999999', 'fileLocation', 'get-gcp'),
                'returned JSON was not equal expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_fileLocation_gcp', 'fileLocation'),
                await testUtils.getExpectedJson('9999999', 'fileLocation', 'get-gcp'),
                'returned JSON was not equal expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_fileLocation_aws', 'fileLocation'),
                await testUtils.getExpectedJson('9999999', 'fileLocation', 'get-aws'),
                'returned JSON was not equal expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_fileLocation_azure', 'fileLocation'),
                await testUtils.getExpectedJson('9999999', 'fileLocation', 'get-azure'),
                'returned JSON was not equal expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_fileLocation_exsftp', 'fileLocation'),
                await testUtils.getExpectedJson('9999999', 'fileLocation', 'get-exsftp'),
                'returned JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                2,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should retrieve an old fileLocation by key', async () => {
            // WHEN
            await handler.retrieve(
                'testInstance/testBU',
                ['fileLocation'],
                ['Salesforce Objects & Reports']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.fileLocation ? Object.keys(result.fileLocation).length : 0,
                1,
                'unexpected number of fileLocations'
            );
            assert.deepEqual(
                await testUtils.getActualJson('Salesforce Objects %26 Reports', 'fileLocation'),
                await testUtils.getExpectedJson('9999999', 'fileLocation', 'get-sor'),
                'returned JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                2,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should retrieve a new fileLocation by key', async () => {
            // WHEN
            await handler.retrieve(
                'testInstance/testBU',
                ['fileLocation'],
                ['testExisting_fileLocation_azure']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.fileLocation ? Object.keys(result.fileLocation).length : 0,
                1,
                'unexpected number of fileLocations'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_fileLocation_azure', 'fileLocation'),
                await testUtils.getExpectedJson('9999999', 'fileLocation', 'get-azure'),
                'returned JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                2,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Deploy ================', () => {
        beforeEach(() => {
            testUtils.mockSetup(true);
        });

        it('Should create & upsert a fileLocation', async () => {
            // WHEN
            await handler.deploy('testInstance/testBU', ['fileLocation']);
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.fileLocation ? Object.keys(result.fileLocation).length : 0,
                2,
                'two fileLocations expected'
            );
            // confirm created item
            assert.deepEqual(
                await testUtils.getActualJson('testNew_fileLocation', 'fileLocation'),
                await testUtils.getExpectedJson('9999999', 'fileLocation', 'post'),
                'returned JSON was not equal expected for insert fileLocation'
            );
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_fileLocation', 'fileLocation'),
                await testUtils.getExpectedJson('9999999', 'fileLocation', 'patch'),
                'returned JSON was not equal expected for update fileLocation'
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
        it('Should create a fileLocation template via retrieveAsTemplate and build it', async () => {
            // buildTemplate
            const result = await handler.retrieveAsTemplate(
                'testInstance/testBU',
                'fileLocation',
                ['testExisting_fileLocation'],
                'testSourceMarket'
            );
            assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');
            assert.equal(
                result.fileLocation ? Object.keys(result.fileLocation).length : 0,
                1,
                'only one fileLocation expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson('testExisting_fileLocation', 'fileLocation'),
                await testUtils.getExpectedJson('9999999', 'fileLocation', 'template'),
                'returned template JSON was not equal expected'
            );
            // buildDefinition
            await handler.buildDefinition(
                'testInstance/testBU',
                'fileLocation',
                ['testExisting_fileLocation'],
                ['testTargetMarket']
            );
            assert.equal(process.exitCode, 0, 'buildDefinition should not have thrown an error');
            assert.deepEqual(
                await testUtils.getActualDeployJson('testTemplated_fileLocation', 'fileLocation'),
                await testUtils.getExpectedJson('9999999', 'fileLocation', 'build'),
                'returned deployment JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                3,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should create a fileLocation template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['fileLocation']);
            // buildTemplate
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'fileLocation',
                ['testExisting_fileLocation'],
                ['testSourceMarket']
            );
            assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');
            assert.equal(
                result.fileLocation ? Object.keys(result.fileLocation).length : 0,
                1,
                'only one fileLocation expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson('testExisting_fileLocation', 'fileLocation'),
                await testUtils.getExpectedJson('9999999', 'fileLocation', 'template'),
                'returned template JSON was not equal expected'
            );
            // buildDefinition
            await handler.buildDefinition(
                'testInstance/testBU',
                'fileLocation',
                ['testExisting_fileLocation'],
                ['testTargetMarket']
            );
            assert.equal(process.exitCode, 0, 'buildDefinition should not have thrown an error');
            assert.deepEqual(
                await testUtils.getActualDeployJson('testTemplated_fileLocation', 'fileLocation'),
                await testUtils.getExpectedJson('9999999', 'fileLocation', 'build'),
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
                'fileLocation',
                'testExisting_fileLocation_azure'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deleteByKey should not have thrown an error');
            assert.equal(isDeleted, true, 'deleteByKey should have returned true');
            return;
        });
    });
});
