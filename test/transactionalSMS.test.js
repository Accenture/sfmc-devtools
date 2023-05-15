import chai from 'chai';
import chaiFiles from 'chai-files';
const assert = chai.assert;
chai.use(chaiFiles);
const expect = chai.expect;
const file = chaiFiles.file;
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';

describe('transactionalSMS', () => {
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
            assert.equal(!!process.exitCode, false, 'retrieve should not have thrown an error');
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
                file(testUtils.getActualFile('testExisting_tsms', 'transactionalSMS', 'amp'))
            ).to.equal(
                file(testUtils.getExpectedFile('9999999', 'transactionalSMS', 'get', 'amp'))
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
            assert.equal(!!process.exitCode, false, 'deploy should not have thrown an error');
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
                file(testUtils.getActualFile('testNew_tsms', 'transactionalSMS', 'amp'))
            ).to.equal(
                file(testUtils.getExpectedFile('9999999', 'transactionalSMS', 'post', 'amp'))
            );
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_tsms', 'transactionalSMS'),
                await testUtils.getExpectedJson('9999999', 'transactionalSMS', 'patch'),
                'returned JSON was not equal expected for update transactionalSMS'
            );
            expect(
                file(testUtils.getActualFile('testExisting_tsms', 'transactionalSMS', 'amp'))
            ).to.equal(
                file(testUtils.getExpectedFile('9999999', 'transactionalSMS', 'patch', 'amp'))
            );
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                6,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
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
            assert.equal(
                !!process.exitCode,
                false,
                'buildTemplate should not have thrown an error'
            );

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
                file(
                    testUtils.getActualTemplateFile('testExisting_tsms', 'transactionalSMS', 'amp')
                )
            ).to.equal(
                file(testUtils.getExpectedFile('9999999', 'transactionalSMS', 'template', 'amp'))
            );
            // buildDefinition
            await handler.buildDefinition(
                'testInstance/testBU',
                'transactionalSMS',
                'testExisting_tsms',
                'testTargetMarket'
            );
            assert.equal(
                !!process.exitCode,
                false,
                'buildDefinition should not have thrown an error'
            );

            assert.deepEqual(
                await testUtils.getActualDeployJson('testExisting_tsms', 'transactionalSMS'),
                await testUtils.getExpectedJson('9999999', 'transactionalSMS', 'build'),
                'returned deployment JSON was not equal expected'
            );
            expect(
                file(testUtils.getActualDeployFile('testExisting_tsms', 'transactionalSMS', 'amp'))
            ).to.equal(
                file(testUtils.getExpectedFile('9999999', 'transactionalSMS', 'build', 'amp'))
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                4,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
});
