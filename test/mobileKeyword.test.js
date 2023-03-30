const chai = require('chai');
const chaiFiles = require('chai-files');
const assert = chai.assert;
chai.use(chaiFiles);
const expect = chai.expect;
const file = chaiFiles.file;
const cache = require('../lib/util/cache');
const testUtils = require('./utils');
const handler = require('../lib/index');

describe('mobileKeyword', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });
    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a mobileKeyword', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['mobileKeyword']);
            // THEN
            assert.equal(!!process.exitCode, false, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.mobileKeyword ? Object.keys(result.mobileKeyword).length : 0,
                1,
                'only 1 mobileKeywords expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_keyword', 'mobileKeyword'),
                await testUtils.getExpectedJson('9999999', 'mobileKeyword', 'get'),
                'saved JSON was not equal expected'
            );
            expect(
                file(testUtils.getActualFile('testExisting_keyword', 'mobileKeyword', 'amp'))
            ).to.equal(file(testUtils.getExpectedFile('9999999', 'mobileKeyword', 'get', 'amp')));
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
        it('Should create (but not update) a mobileKeyword', async () => {
            // WHEN
            await handler.deploy('testInstance/testBU', ['mobileKeyword']);
            // THEN
            assert.equal(!!process.exitCode, false, 'deploy should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.mobileKeyword ? Object.keys(result.mobileKeyword).length : 0,
                2,
                '2 mobileKeywords expected'
            );
            // confirm created item
            assert.deepEqual(
                await testUtils.getActualJson('testNew_keyword', 'mobileKeyword'),
                await testUtils.getExpectedJson('9999999', 'mobileKeyword', 'post-create'),
                'returned JSON was not equal expected for insert mobileKeyword'
            );
            expect(
                file(testUtils.getActualFile('testNew_keyword', 'mobileKeyword', 'amp'))
            ).to.equal(
                file(testUtils.getExpectedFile('9999999', 'mobileKeyword', 'post-create', 'amp'))
            );

            // confirm updated item
            // eslint-disable-next-line no-console
            console.log(
                'Not testing UPDATE because the API only responds with an empty body unless there are errors in the request body'
            );

            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                4,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
    // describe('Templating ================', () => {
    //     it('Should create a mobileKeyword template via buildTemplate and build it', async () => {
    //         // download first before we test buildTemplate
    //         await handler.retrieve('testInstance/testBU', ['mobileKeyword']);
    //         // buildTemplate
    //         const result = await handler.buildTemplate(
    //             'testInstance/testBU',
    //             'mobileKeyword',
    //             ['NTIzOjc4OjA'],
    //             'testSourceMarket'
    //         );
    //         assert.equal(
    //             !!process.exitCode,
    //             false,
    //             'buildTemplate should not have thrown an error'
    //         );

    //         assert.equal(
    //             result.mobileKeyword ? Object.keys(result.mobileKeyword).length : 0,
    //             1,
    //             'only one mobileKeyword expected'
    //         );
    //         assert.deepEqual(
    //             await testUtils.getActualTemplateJson('NTIzOjc4OjA', 'mobileKeyword'),
    //             await testUtils.getExpectedJson('9999999', 'mobileKeyword', 'template'),
    //             'returned template JSON was not equal expected'
    //         );
    //         expect(
    //             file(testUtils.getActualTemplateFile('NTIzOjc4OjA', 'mobileKeyword', 'amp'))
    //         ).to.equal(
    //             file(testUtils.getExpectedFile('9999999', 'mobileKeyword', 'template', 'amp'))
    //         );

    //         // buildDefinition
    //         await handler.buildDefinition(
    //             'testInstance/testBU',
    //             'mobileKeyword',
    //             'NTIzOjc4OjA',
    //             'testTargetMarket'
    //         );
    //         assert.equal(
    //             !!process.exitCode,
    //             false,
    //             'buildDefinition should not have thrown an error'
    //         );
    //         assert.deepEqual(
    //             await testUtils.getActualDeployJson('NTIzOjc4OjA', 'mobileKeyword'),
    //             await testUtils.getExpectedJson('9999999', 'mobileKeyword', 'build'),
    //             'returned deployment JSON was not equal expected'
    //         );
    //         expect(
    //             file(testUtils.getActualDeployFile('NTIzOjc4OjA', 'mobileKeyword', 'amp'))
    //         ).to.equal(file(testUtils.getExpectedFile('9999999', 'mobileKeyword', 'build', 'amp')));

    //         assert.equal(
    //             testUtils.getAPIHistoryLength(),
    //             4,
    //             'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
    //         );
    //         return;
    //     });
    // });
});
