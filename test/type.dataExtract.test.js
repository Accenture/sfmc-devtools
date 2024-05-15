import * as chai from 'chai';
const assert = chai.assert;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);

describe('type: dataExtract', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });

    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a dataExtract', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['dataExtract']);
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.dataExtract ? Object.keys(result.dataExtract).length : 0,
                1,
                'only one dataExtract expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_dataExtract', 'dataExtract'),
                await testUtils.getExpectedJson('9999999', 'dataExtract', 'get'),
                'returned JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                6,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Deploy ================', () => {
        beforeEach(() => {
            testUtils.mockSetup(true);
        });

        it('Should create & upsert a dataExtract', async () => {
            // WHEN

            await handler.deploy('testInstance/testBU', ['dataExtract']);
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.dataExtract ? Object.keys(result.dataExtract).length : 0,
                2,
                'two dataExtracts expected'
            );
            // confirm created item
            assert.deepEqual(
                await testUtils.getActualJson('testNew_dataExtract', 'dataExtract'),
                await testUtils.getExpectedJson('9999999', 'dataExtract', 'post'),
                'returned new-JSON was not equal expected for insert dataExtract'
            );
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_dataExtract', 'dataExtract'),
                await testUtils.getExpectedJson('9999999', 'dataExtract', 'patch'),
                'returned existing-JSON was not equal expected for update dataExtract'
            );
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                8,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should change the key during update via --changeKeyValue ');
    });

    describe('Templating ================', () => {
        it('Should create a dataExtract template via retrieveAsTemplate and build it', async () => {
            // buildTemplate
            const result = await handler.retrieveAsTemplate(
                'testInstance/testBU',
                'dataExtract',
                ['testExisting_dataExtract'],
                'testSourceMarket'
            );
            assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');
            assert.equal(
                result.dataExtract ? Object.keys(result.dataExtract).length : 0,
                1,
                'only one dataExtract expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson('testExisting_dataExtract', 'dataExtract'),
                await testUtils.getExpectedJson('9999999', 'dataExtract', 'template'),
                'returned template JSON was not equal expected'
            );
            // buildDefinition
            await handler.buildDefinition(
                'testInstance/testBU',
                'dataExtract',
                ['testExisting_dataExtract'],
                'testTargetMarket'
            );
            assert.equal(process.exitCode, 0, 'buildDefinition should not have thrown an error');
            assert.deepEqual(
                await testUtils.getActualDeployJson('testTemplated_dataExtract', 'dataExtract'),
                await testUtils.getExpectedJson('9999999', 'dataExtract', 'build'),
                'returned deployment JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                6,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should create a dataExtract template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['dataExtract']);
            // buildTemplate
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'dataExtract',
                ['testExisting_dataExtract'],
                'testSourceMarket'
            );
            assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');
            assert.equal(
                result.dataExtract ? Object.keys(result.dataExtract).length : 0,
                1,
                'only one dataExtract expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson('testExisting_dataExtract', 'dataExtract'),
                await testUtils.getExpectedJson('9999999', 'dataExtract', 'template'),
                'returned template JSON was not equal expected'
            );
            // buildDefinition
            await handler.buildDefinition(
                'testInstance/testBU',
                'dataExtract',
                ['testExisting_dataExtract'],
                'testTargetMarket'
            );
            assert.equal(process.exitCode, 0, 'buildDefinition should not have thrown an error');
            assert.deepEqual(
                await testUtils.getActualDeployJson('testTemplated_dataExtract', 'dataExtract'),
                await testUtils.getExpectedJson('9999999', 'dataExtract', 'build'),
                'returned deployment JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                6,
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
                'dataExtract',
                'testExisting_dataExtract'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deleteByKey should not have thrown an error');
            assert.equal(isDeleted, true, 'deleteByKey should have returned true');
            return;
        });
    });
});
