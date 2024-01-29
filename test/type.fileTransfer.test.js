import chai, { assert } from 'chai';
import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);

describe('type: fileTransfer', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });
    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a fileTransfer', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['fileTransfer']);
            // THEN
            assert.equal(process.exitCode, false, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.fileTransfer ? Object.keys(result.fileTransfer).length : 0,
                1,
                'only one fileTransfer expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_fileTransfer', 'fileTransfer'),
                await testUtils.getExpectedJson('9999999', 'fileTransfer', 'get'),
                'returned JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                3,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
    describe('Deploy ================', () => {
        beforeEach(() => {
            testUtils.mockSetup(true);
        });
        it('Should create & upsert a fileTransfer', async () => {
            // WHEN
            await handler.deploy('testInstance/testBU', ['fileTransfer']);
            // THEN
            assert.equal(process.exitCode, false, 'deploy should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.fileTransfer ? Object.keys(result.fileTransfer).length : 0,
                2,
                'two fileTransfers expected'
            );
            // confirm created item
            assert.deepEqual(
                await testUtils.getActualJson('testNew_fileTransfer', 'fileTransfer'),
                await testUtils.getExpectedJson('9999999', 'fileTransfer', 'post'),
                'returned JSON was not equal expected for insert fileTransfer'
            );
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_fileTransfer', 'fileTransfer'),
                await testUtils.getExpectedJson('9999999', 'fileTransfer', 'patch'),
                'returned JSON was not equal expected for update fileTransfer'
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
        it('Should create a fileTransfer template via retrieveAsTemplate and build it', async () => {
            // buildTemplate
            const result = await handler.retrieveAsTemplate(
                'testInstance/testBU',
                'fileTransfer',
                ['testExisting_fileTransfer'],
                'testSourceMarket'
            );
            assert.equal(process.exitCode, false, 'buildTemplate should not have thrown an error');
            assert.equal(
                result.fileTransfer ? Object.keys(result.fileTransfer).length : 0,
                1,
                'only one fileTransfer expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson('testExisting_fileTransfer', 'fileTransfer'),
                await testUtils.getExpectedJson('9999999', 'fileTransfer', 'template'),
                'returned template JSON was not equal expected'
            );
            // buildDefinition
            await handler.buildDefinition(
                'testInstance/testBU',
                'fileTransfer',
                'testExisting_fileTransfer',
                'testTargetMarket'
            );
            assert.equal(
                process.exitCode,
                false,
                'buildDefinition should not have thrown an error'
            );
            assert.deepEqual(
                await testUtils.getActualDeployJson('testTemplated_fileTransfer', 'fileTransfer'),
                await testUtils.getExpectedJson('9999999', 'fileTransfer', 'build'),
                'returned deployment JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                3,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should create a fileTransfer template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['fileTransfer']);
            // buildTemplate
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'fileTransfer',
                ['testExisting_fileTransfer'],
                'testSourceMarket'
            );
            assert.equal(process.exitCode, false, 'buildTemplate should not have thrown an error');
            assert.equal(
                result.fileTransfer ? Object.keys(result.fileTransfer).length : 0,
                1,
                'only one fileTransfer expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson('testExisting_fileTransfer', 'fileTransfer'),
                await testUtils.getExpectedJson('9999999', 'fileTransfer', 'template'),
                'returned template JSON was not equal expected'
            );
            // buildDefinition
            await handler.buildDefinition(
                'testInstance/testBU',
                'fileTransfer',
                'testExisting_fileTransfer',
                'testTargetMarket'
            );
            assert.equal(
                process.exitCode,
                false,
                'buildDefinition should not have thrown an error'
            );
            assert.deepEqual(
                await testUtils.getActualDeployJson('testTemplated_fileTransfer', 'fileTransfer'),
                await testUtils.getExpectedJson('9999999', 'fileTransfer', 'build'),
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
                'fileTransfer',
                'testExisting_fileTransfer'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deleteByKey should not have thrown an error');
            assert.equal(isDeleted, true, 'deleteByKey should have returned true');
            return;
        });
    });
});
