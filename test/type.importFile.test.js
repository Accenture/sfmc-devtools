const chai = require('chai');
const chaiFiles = require('chai-files');
const assert = chai.assert;
chai.use(chaiFiles);
const cache = require('../lib/util/cache');
const testUtils = require('./utils');
const handler = require('../lib/index');

describe('type: importFile', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });
    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a importFile', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['importFile']);
            // THEN
            assert.equal(process.exitCode, false, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.importFile ? Object.keys(result.importFile).length : 0,
                1,
                'only one importFile expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_importFile', 'importFile'),
                await testUtils.getExpectedJson('9999999', 'importFile', 'get'),
                'returned JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                10,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
    describe('Deploy ================', () => {
        beforeEach(() => {
            testUtils.mockSetup(true);
        });
        it('Should create & upsert a importFile', async () => {
            // WHEN

            await handler.deploy('testInstance/testBU', ['importFile']);
            // THEN
            assert.equal(process.exitCode, false, 'deploy should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.importFile ? Object.keys(result.importFile).length : 0,
                2,
                'two importFiles expected'
            );
            // confirm created item
            assert.deepEqual(
                await testUtils.getActualJson('testNew_importFile', 'importFile'),
                await testUtils.getExpectedJson('9999999', 'importFile', 'post'),
                'returned new-JSON was not equal expected for insert importFile'
            );
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_importFile', 'importFile'),
                await testUtils.getExpectedJson('9999999', 'importFile', 'patch'),
                'returned existing-JSON was not equal expected for update importFile'
            );
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                12,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
    describe('Templating ================', () => {
        it('Should create a importFile template via retrieveAsTemplate and build it', async () => {
            // buildTemplate
            const result = await handler.retrieveAsTemplate(
                'testInstance/testBU',
                'importFile',
                ['testExisting_importFile'],
                'testSourceMarket'
            );
            assert.equal(process.exitCode, false, 'buildTemplate should not have thrown an error');
            assert.equal(
                result.importFile ? Object.keys(result.importFile).length : 0,
                1,
                'only one importFile expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson('testExisting_importFile', 'importFile'),
                await testUtils.getExpectedJson('9999999', 'importFile', 'template'),
                'returned template JSON was not equal expected'
            );
            // buildDefinition
            await handler.buildDefinition(
                'testInstance/testBU',
                'importFile',
                'testExisting_importFile',
                'testTargetMarket'
            );
            assert.equal(
                process.exitCode,
                false,
                'buildDefinition should not have thrown an error'
            );
            assert.deepEqual(
                await testUtils.getActualDeployJson('testTemplated_importFile', 'importFile'),
                await testUtils.getExpectedJson('9999999', 'importFile', 'build'),
                'returned deployment JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                10,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should create a importFile template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['importFile']);
            // buildTemplate
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'importFile',
                ['testExisting_importFile'],
                'testSourceMarket'
            );
            assert.equal(process.exitCode, false, 'buildTemplate should not have thrown an error');
            assert.equal(
                result.importFile ? Object.keys(result.importFile).length : 0,
                1,
                'only one importFile expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson('testExisting_importFile', 'importFile'),
                await testUtils.getExpectedJson('9999999', 'importFile', 'template'),
                'returned template JSON was not equal expected'
            );
            // buildDefinition
            await handler.buildDefinition(
                'testInstance/testBU',
                'importFile',
                'testExisting_importFile',
                'testTargetMarket'
            );
            assert.equal(
                process.exitCode,
                false,
                'buildDefinition should not have thrown an error'
            );
            assert.deepEqual(
                await testUtils.getActualDeployJson('testTemplated_importFile', 'importFile'),
                await testUtils.getExpectedJson('9999999', 'importFile', 'build'),
                'returned deployment JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                10,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
    describe('Delete ================', () => {
        it('Should NOT delete the item', async () => {
            // WHEN
            const isDeleted = await handler.deleteByKey(
                'testInstance/testBU',
                'importFile',
                'testExisting_fileTranfer'
            );
            // THEN
            assert.equal(
                process.exitCode,
                1,
                'deleteByKey should have thrown an error due to lack of support'
            );
            assert.equal(
                isDeleted,
                false,
                'deleteByKey should have returned false due to lack of support'
            );
            return;
        });
    });
});
