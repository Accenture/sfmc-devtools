const chai = require('chai');
const chaiFiles = require('chai-files');

chai.use(chaiFiles);

const assert = chai.assert;
const expect = chai.expect;
const file = chaiFiles.file;
const cache = require('../lib/util/cache');
const testUtils = require('./utils');
const handler = require('../lib/index');

describe('type: automation', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });
    afterEach(() => {
        testUtils.mockReset();
    });
    describe('Retrieve ================', () => {
        it('Should retrieve a automation', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['automation']);
            // THEN
            assert.equal(process.exitCode, false, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.automation ? Object.keys(result.automation).length : 0,
                1,
                'only one automation expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_automation', 'automation'),
                await testUtils.getExpectedJson('9999999', 'automation', 'retrieve'),

                'returned metadata was not equal expected'
            );
            // check if MD file was created and equals expectations
            expect(file(testUtils.getActualDoc('testExisting_automation', 'automation'))).to.equal(
                file(testUtils.getExpectedFile('9999999', 'automation', 'retrieve', 'md'))
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                12,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
    describe('Deploy ================', () => {
        beforeEach(() => {
            testUtils.mockSetup(true);
        });
        it('Should create & update a automation'); // , async () => {
        //     // WHEN
        //     await handler.deploy('testInstance/testBU', ['automation']);
        //     // THEN
        //     assert.equal(process.exitCode, false, 'deploy should not have thrown an error');

        //     // get results from cache
        //     const result = cache.getCache();
        //     assert.equal(
        //         result.automation ? Object.keys(result.automation).length : 0,
        //         2,
        //         'two automations expected'
        //     );
        //     // insert
        //     assert.deepEqual(
        //         await testUtils.getActualJson('testNew_automation', 'automation'),
        //         await testUtils.getExpectedJson('9999999', 'automation', 'create'),
        //         'returned metadata was not equal expected for create'
        //     );
        //     // update
        //     assert.deepEqual(
        //         await testUtils.getActualJson('testExisting_automation', 'automation'),
        //         await testUtils.getExpectedJson('9999999', 'automation', 'update'),
        //         'returned metadata was not equal expected for update'
        //     );
        //     assert.equal(
        //         testUtils.getAPIHistoryLength(),
        //         11,
        //         'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
        //     );
        //     return;
        // });
        it('Should change the key during update via --changeKeyValue');
    });
    describe('Templating ================', () => {
        it('Should create a automation template via retrieveAsTemplate and build it'); // , async () => {
        //     // GIVEN there is a template
        //     const result = await handler.retrieveAsTemplate(
        //         'testInstance/testBU',
        //         'automation',
        //         ['testExisting_automation'],
        //         'testSourceMarket'
        //     );
        //     assert.equal(
        //         process.exitCode,
        //         false,
        //         'retrieveAsTemplate should not have thrown an error'
        //     );

        //     // WHEN
        //     assert.equal(
        //         result.automation ? Object.keys(result.automation).length : 0,
        //         1,
        //         'only one automation expected'
        //     );
        //     assert.deepEqual(
        //         await testUtils.getActualTemplateJson('testExisting_automation', 'automation'),
        //         await testUtils.getExpectedJson('9999999', 'automation', 'template'),
        //         'returned template was not equal expected'
        //     );
        //     // THEN
        //     await handler.buildDefinition(
        //         'testInstance/testBU',
        //         'automation',
        //         'testExisting_automation',
        //         'testTargetMarket'
        //     );
        //     assert.equal(
        //         process.exitCode,
        //         false,
        //         'buildDefinition should not have thrown an error'
        //     );
        //     assert.deepEqual(
        //         await testUtils.getActualDeployJson('testTemplated_automation', 'automation'),
        //         await testUtils.getExpectedJson('9999999', 'automation', 'build'),
        //         'returned deployment file was not equal expected'
        //     );
        //     assert.equal(
        //         testUtils.getAPIHistoryLength(),
        //         5,
        //         'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
        //     );
        //     return;
        // });
        it('Should create a automation template via buildTemplate and build it'); // , async () => {
        //     // download first before we test buildTemplate
        //     await handler.retrieve('testInstance/testBU', ['automation']);
        //     // GIVEN there is a template
        //     const result = await handler.buildTemplate(
        //         'testInstance/testBU',
        //         'automation',
        //         ['testExisting_automation'],
        //         'testSourceMarket'
        //     );
        //     assert.equal(process.exitCode, false, 'buildTemplate should not have thrown an error');
        //     // WHEN
        //     assert.equal(
        //         result.automation ? Object.keys(result.automation).length : 0,
        //         1,
        //         'only one automation expected'
        //     );
        //     assert.deepEqual(
        //         await testUtils.getActualTemplateJson('testExisting_automation', 'automation'),
        //         await testUtils.getExpectedJson('9999999', 'automation', 'template'),
        //         'returned template was not equal expected'
        //     );
        //     // THEN
        //     await handler.buildDefinition(
        //         'testInstance/testBU',
        //         'automation',
        //         'testExisting_automation',
        //         'testTargetMarket'
        //     );
        //     assert.equal(
        //         process.exitCode,
        //         false,
        //         'buildDefinition should not have thrown an error'
        //     );

        //     assert.deepEqual(
        //         await testUtils.getActualDeployJson('testTemplated_automation', 'automation'),
        //         await testUtils.getExpectedJson('9999999', 'automation', 'build'),
        //         'returned deployment file was not equal expected'
        //     );
        //     assert.equal(
        //         testUtils.getAPIHistoryLength(),
        //         5,
        //         'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
        //     );
        //     return;
        // });
    });
    describe('Delete ================', () => {
        // TODO: add this test
        it('Should delete the item'); // , async () => {
        //     // WHEN
        //     const result = await handler.deleteByKey('testInstance/testBU', 'mobileKeyword', [
        //         'testExisting_keyword',
        //     ]);
        //     // THEN
        //     assert.equal(process.exitCode, false, 'delete should not have thrown an error');

        //     assert.equal(result, true, 'should have deleted the item');
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