import * as chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);

describe('type: dataExtension', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });

    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a dataExtension', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['dataExtension']);
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.dataExtension ? Object.keys(result.dataExtension).length : 0,
                6,
                'only 6 dataExtension expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_dataExtension', 'dataExtension'),
                await testUtils.getExpectedJson('9999999', 'dataExtension', 'retrieve'),

                'returned metadata was not equal expected'
            );
            // check if MD file was created and equals expectations
            expect(
                await testUtils.getActualDoc('testExisting_dataExtension', 'dataExtension')
            ).to.equal(
                await testUtils.getExpectedFile('9999999', 'dataExtension', 'retrieve', 'md')
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                5,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should retrieve a shared dataExtension', async () => {
            // WHEN
            await handler.retrieve('testInstance/_ParentBU_', ['dataExtension']);
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.dataExtension ? Object.keys(result.dataExtension).length : 0,
                1,
                'only one dataExtension expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_dataExtensionShared',
                    'dataExtension',
                    '_ParentBU_'
                ),
                await testUtils.getExpectedJson('1111111', 'dataExtension', 'retrieve'),

                'returned metadata was not equal expected'
            );
            // check if MD file was created and equals expectations
            expect(
                await testUtils.getActualDoc(
                    'testExisting_dataExtensionShared',
                    'dataExtension',
                    '_ParentBU_'
                )
            ).to.equal(
                await testUtils.getExpectedFile('1111111', 'dataExtension', 'retrieve', 'md')
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

        it('Should create & update a dataExtension including a field rename', async () => {
            // WHEN
            const deployResult = await handler.deploy('testInstance/testBU', ['dataExtension']);
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');

            assert.equal(
                deployResult['testInstance/testBU']?.dataExtension
                    ? Object.keys(deployResult['testInstance/testBU']?.dataExtension).length
                    : 0,
                2,
                'two dataExtensions to be deployed'
            );

            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.dataExtension ? Object.keys(result.dataExtension).length : 0,
                8,
                '8 dataExtensions expected'
            );
            // insert
            assert.deepEqual(
                await testUtils.getActualJson('testNew_dataExtension', 'dataExtension'),
                await testUtils.getExpectedJson('9999999', 'dataExtension', 'create'),
                'returned metadata was not equal expected for create'
            );
            // update
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_dataExtension', 'dataExtension'),
                await testUtils.getExpectedJson('9999999', 'dataExtension', 'update'),
                'returned metadata was not equal expected for update'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                11,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should create & update a shared dataExtension', async () => {
            // WHEN
            const deployResult = await handler.deploy('testInstance/_ParentBU_', ['dataExtension']);
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');

            assert.equal(
                deployResult['testInstance/_ParentBU_']?.dataExtension
                    ? Object.keys(deployResult['testInstance/_ParentBU_']?.dataExtension).length
                    : 0,
                2,
                'two dataExtensions to be deployed'
            );

            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.dataExtension ? Object.keys(result.dataExtension).length : 0,
                2,
                'two dataExtensions expected'
            );
            // insert
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testNew_dataExtensionShared',
                    'dataExtension',
                    '_ParentBU_'
                ),
                await testUtils.getExpectedJson('1111111', 'dataExtension', 'create'),
                'returned metadata was not equal expected for create'
            );
            // update
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_dataExtensionShared',
                    'dataExtension',
                    '_ParentBU_'
                ),
                await testUtils.getExpectedJson('1111111', 'dataExtension', 'update'),
                'returned metadata was not equal expected for update'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                8,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should create & update a shared dataExtension with --fixShared & --skipInteraction', async () => {
            // WHEN
            handler.setOptions({ fixShared: 'testBU', skipInteraction: true, _runningTest: true });

            const deployResult = await handler.deploy('testInstance/_ParentBU_', ['dataExtension']);
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');

            assert.equal(
                deployResult['testInstance/_ParentBU_']?.dataExtension
                    ? Object.keys(deployResult['testInstance/_ParentBU_']?.dataExtension).length
                    : 0,
                2,
                'two dataExtensions to be deployed'
            );

            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.dataExtension ? Object.keys(result.dataExtension).length : 0,
                2,
                'two dataExtensions expected'
            );
            // insert
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testNew_dataExtensionShared',
                    'dataExtension',
                    '_ParentBU_'
                ),
                await testUtils.getExpectedJson('1111111', 'dataExtension', 'create'),
                'returned metadata was not equal expected for create'
            );
            // update
            assert.deepEqual(
                await testUtils.getActualJson(
                    'testExisting_dataExtensionShared',
                    'dataExtension',
                    '_ParentBU_'
                ),
                await testUtils.getExpectedJson('1111111', 'dataExtension', 'update'),
                'returned metadata was not equal expected for update'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                12,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Templating ================', () => {
        it('Should create a dataExtension template via retrieveAsTemplate and build it', async () => {
            // GIVEN there is a template
            const result = await handler.retrieveAsTemplate(
                'testInstance/testBU',
                'dataExtension',
                ['testExisting_dataExtension'],
                'testSourceMarket'
            );
            assert.equal(process.exitCode, 0, 'retrieveAsTemplate should not have thrown an error');

            // WHEN
            assert.equal(
                result.dataExtension ? Object.keys(result.dataExtension).length : 0,
                1,
                'only one dataExtension expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson(
                    'testExisting_dataExtension',
                    'dataExtension'
                ),
                await testUtils.getExpectedJson('9999999', 'dataExtension', 'template'),
                'returned template was not equal expected'
            );
            // THEN
            await handler.buildDefinition(
                'testInstance/testBU',
                'dataExtension',
                ['testExisting_dataExtension'],
                'testTargetMarket'
            );
            assert.equal(process.exitCode, 0, 'buildDefinition should not have thrown an error');
            assert.deepEqual(
                await testUtils.getActualDeployJson('testTemplated_dataExtension', 'dataExtension'),
                await testUtils.getExpectedJson('9999999', 'dataExtension', 'build'),
                'returned deployment file was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                5,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should create a dataExtension template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['dataExtension']);
            // GIVEN there is a template
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'dataExtension',
                ['testExisting_dataExtension'],
                'testSourceMarket'
            );
            assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');
            // WHEN
            assert.equal(
                result.dataExtension ? Object.keys(result.dataExtension).length : 0,
                1,
                'only one dataExtension expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson(
                    'testExisting_dataExtension',
                    'dataExtension'
                ),
                await testUtils.getExpectedJson('9999999', 'dataExtension', 'template'),
                'returned template was not equal expected'
            );
            // THEN
            await handler.buildDefinition(
                'testInstance/testBU',
                'dataExtension',
                ['testExisting_dataExtension'],
                'testTargetMarket'
            );
            assert.equal(process.exitCode, 0, 'buildDefinition should not have thrown an error');

            assert.deepEqual(
                await testUtils.getActualDeployJson('testTemplated_dataExtension', 'dataExtension'),
                await testUtils.getExpectedJson('9999999', 'dataExtension', 'build'),
                'returned deployment file was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                5,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Delete ================', () => {
        it('Should delete the dataExtension', async () => {
            // WHEN
            const isDeleted = await handler.deleteByKey(
                'testInstance/testBU',
                'dataExtension',
                'testExisting_dataExtension'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'delete should not have thrown an error');

            assert.equal(isDeleted, true, 'should have deleted the item');
            return;
        });

        it('Should delete the dataExtensionField', async () => {
            // WHEN
            const isDeleted = await handler.deleteByKey(
                'testInstance/testBU',
                'dataExtensionField',
                'testExisting_dataExtension.LastName'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'delete should not have thrown an error');

            assert.equal(isDeleted, true, 'should have deleted the item');
            return;
        });
    });

    describe('CI/CD ================', () => {
        it('Should return a list of files based on their type and key', async () => {
            // WHEN
            const fileList = await handler.getFilesToCommit(
                'testInstance/testBU',
                'dataExtension',
                ['testExisting_dataExtension']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'getFilesToCommit should not have thrown an error');
            assert.equal(fileList.length, 2, 'expected only 2 file paths (json, md)');

            assert.equal(
                fileList[0].split('\\').join('/'),
                'retrieve/testInstance/testBU/dataExtension/testExisting_dataExtension.dataExtension-meta.json',
                'wrong JSON path'
            );
            assert.equal(
                fileList[1].split('\\').join('/'),
                'retrieve/testInstance/testBU/dataExtension/testExisting_dataExtension.dataExtension-doc.md',
                'wrong MD path'
            );
            return;
        });
    });
});
