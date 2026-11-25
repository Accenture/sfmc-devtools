import * as chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import File from '../lib/util/file.js';
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
                5,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should warn about a transactionalSMS that is listed but cannot be read', async () => {
            // WHEN
            const { messages } = await testUtils.retrieveCapturing('warn', 'transactionalSMS');
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            assert.deepEqual(
                Object.keys(cache.getCache().transactionalSMS),
                ['testExisting_tsms'],
                'only the readable transactionalSMS expected'
            );
            assert.include(
                messages,
                ' - transactionalSMS testUnreadable_tsms (name: testUnreadable_tsms, status: Active) is listed on the server but could not be read: Definition not found (30003)',
                'expected a warning for the unreadable transactionalSMS'
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
                7,
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
        it('Should create a transactionalSMS template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['transactionalSMS']);
            // buildTemplate
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'transactionalSMS',
                ['testExisting_tsms'],
                ['testSourceMarket']
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
                ['testTargetMarket']
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
                5,
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

        it('Should NOT delete a transactionalSMS that is listed but cannot be read and keep its local files', async () => {
            // GIVEN
            const localFile =
                'retrieve/testInstance/testBU/transactionalSMS/testUnreadable_tsms.transactionalSMS-meta.json';
            await File.outputFile(localFile, '{}');
            // WHEN
            const { result, messages } = await testUtils.deleteCapturing(
                'error',
                'transactionalSMS',
                'testUnreadable_tsms'
            );
            // THEN
            assert.equal(result, false, 'should not have deleted the item');
            assert.include(
                messages,
                ' ☇ skipping deletion of transactionalSMS testUnreadable_tsms: still listed on server (name: testUnreadable_tsms, status: Active) but cannot be read or deleted',
                'expected an error that the transactionalSMS is still listed'
            );
            assert.isTrue(await File.pathExists(localFile), 'local files should have been kept');
            return;
        });
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
