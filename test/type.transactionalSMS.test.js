import * as chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);

describe('type: transactionalSMS', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });

    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a transactionalSMS', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['transactionalSMS']);
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.transactionalSMS ? Object.keys(result.transactionalSMS).length : 0,
                1,
                'only one transactionalSMS expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_tsms', 'transactionalSMS'),
                await testUtils.getExpectedJson('9999999', 'transactionalSMS', 'get'),
                'returned JSON was not equal expected'
            );
            expect(
                await testUtils.getActualFile('testExisting_tsms', 'transactionalSMS', 'amp')
            ).to.equal(
                await testUtils.getExpectedFile('9999999', 'transactionalSMS', 'get', 'amp')
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

        it('Should create & upsert a transactionalSMS', async () => {
            // WHEN
            await handler.deploy('testInstance/testBU', ['transactionalSMS']);
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.transactionalSMS ? Object.keys(result.transactionalSMS).length : 0,
                2,
                'two transactionalSMSs expected'
            );
            // confirm created item
            assert.deepEqual(
                await testUtils.getActualJson('testNew_tsms', 'transactionalSMS'),
                await testUtils.getExpectedJson('9999999', 'transactionalSMS', 'post'),
                'returned JSON was not equal expected for insert transactionalSMS'
            );
            expect(
                await testUtils.getActualFile('testNew_tsms', 'transactionalSMS', 'amp')
            ).to.equal(
                await testUtils.getExpectedFile('9999999', 'transactionalSMS', 'post', 'amp')
            );
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_tsms', 'transactionalSMS'),
                await testUtils.getExpectedJson('9999999', 'transactionalSMS', 'patch'),
                'returned JSON was not equal expected for update transactionalSMS'
            );
            expect(
                await testUtils.getActualFile('testExisting_tsms', 'transactionalSMS', 'amp')
            ).to.equal(
                await testUtils.getExpectedFile('9999999', 'transactionalSMS', 'patch', 'amp')
            );
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                6,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should NOT change the key during update with --changeKeyValue and instead fail due to missing support', async () => {
            // WHEN
            handler.setOptions({ changeKeyValue: 'updatedKey' });
            await handler.deploy(
                'testInstance/testBU',
                ['transactionalSMS'],
                ['testExisting_tsms']
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
        // it.skip('Should create a transactionalSMS template via retrieveAsTemplate and build it');
        it('Should create a transactionalSMS template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['transactionalSMS']);
            // buildTemplate
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'transactionalSMS',
                ['testExisting_tsms'],
                'testSourceMarket'
            );
            assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');

            assert.equal(
                result.transactionalSMS ? Object.keys(result.transactionalSMS).length : 0,
                1,
                'only one transactionalSMS expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson('testExisting_tsms', 'transactionalSMS'),
                await testUtils.getExpectedJson('9999999', 'transactionalSMS', 'template'),
                'returned template JSON was not equal expected'
            );
            expect(
                await testUtils.getActualTemplateFile(
                    'testExisting_tsms',
                    'transactionalSMS',
                    'amp'
                )
            ).to.equal(
                await testUtils.getExpectedFile('9999999', 'transactionalSMS', 'template', 'amp')
            );
            // buildDefinition
            await handler.buildDefinition(
                'testInstance/testBU',
                'transactionalSMS',
                ['testExisting_tsms'],
                'testTargetMarket'
            );
            assert.equal(process.exitCode, 0, 'buildDefinition should not have thrown an error');

            assert.deepEqual(
                await testUtils.getActualDeployJson('testTemplated_tsms', 'transactionalSMS'),
                await testUtils.getExpectedJson('9999999', 'transactionalSMS', 'build'),
                'returned deployment JSON was not equal expected'
            );
            expect(
                await testUtils.getActualDeployFile('testTemplated_tsms', 'transactionalSMS', 'amp')
            ).to.equal(
                await testUtils.getExpectedFile('9999999', 'transactionalSMS', 'build', 'amp')
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

    describe('CI/CD ================', () => {
        // TODO: add this test
        it('Should return a list of files based on their type and key'); // , async () => {
        //     // WHEN
        //     const fileList = await handler.getFilesToCommit(
        //         'testInstance/testBU',
        //         'mobileKeyword',
        //         ['testExisting_keyword']
        //     );
        //     // THEN
        //     assert.equal(
        //         process.exitCode,
        //         false,
        //         'getFilesToCommit should not have thrown an error'
        //     );
        //     assert.equal(fileList.length, 2, 'expected only 2 file paths');

        //     assert.equal(
        //         fileList[0].split('\\').join('/'),
        //         'retrieve/testInstance/testBU/mobileKeyword/testExisting_keyword.mobileKeyword-meta.json',
        //         'wrong JSON path'
        //     );
        //     assert.equal(
        //         fileList[1].split('\\').join('/'),
        //         'retrieve/testInstance/testBU/mobileKeyword/testExisting_keyword.mobileKeyword-meta.amp',
        //         'wrong AMP path'
        //     );
        //     return;
        // });
    });
});
