const chai = require('chai');
const chaiFiles = require('chai-files');
const assert = chai.assert;
chai.use(chaiFiles);
const expect = chai.expect;
const file = chaiFiles.file;
// const dir = chaiFiles.dir;
const cache = require('../lib/util/cache');
const testUtils = require('./utils');
const handler = require('../lib/index');

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
                Object.values(testUtils.getAPIHistory()).flat().length,
                4,
                'Unexpected number of requests made'
            );
            return;
        });
    });
    describe('Deploy ================', () => {
        beforeEach(() => {
            testUtils.mockSetupDeploy();
        });
        it('Should create & upsert a transactionalSMS', async () => {
            // WHEN
            await handler.deploy('testInstance/testBU', ['transactionalSMS']);
            // THEN
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
                Object.values(testUtils.getAPIHistory()).flat().length,
                5,
                'Unexpected number of requests made'
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
                Object.values(testUtils.getAPIHistory()).flat().length,
                4,
                'Unexpected number of requests made'
            );
            return;
        });
    });
});
