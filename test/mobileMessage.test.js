const chai = require('chai');
const chaiFiles = require('chai-files');
const assert = chai.assert;
chai.use(chaiFiles);
const expect = chai.expect;
const file = chaiFiles.file;
const cache = require('../lib/util/cache');
const testUtils = require('./utils');
const handler = require('../lib/index');

describe('mobileMessage', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });
    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a mobileMessage', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['mobileMessage']);
            // THEN
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.mobileMessage ? Object.keys(result.mobileMessage).length : 0,
                1,
                'only 1 mobileMessages expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('NTIzOjc4OjA', 'mobileMessage'),
                await testUtils.getExpectedJson('9999999', 'mobileMessage', 'get'),
                'saved JSON was not equal expected'
            );
            expect(file(testUtils.getActualFile('NTIzOjc4OjA', 'mobileMessage', 'amp'))).to.equal(
                file(testUtils.getExpectedFile('9999999', 'mobileMessage', 'get', 'amp'))
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                4,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
    // describe('Deploy ================', () => {
    //     beforeEach(() => {
    //         testUtils.mockSetup(true);
    //     });
    //     it('Should create & upsert a mobileMessage', async () => {
    //         // WHEN
    //         await handler.deploy('testInstance/testBU', ['mobileMessage']);
    //         // THEN
    //         // get results from cache
    //         const result = cache.getCache();
    //         assert.equal(
    //             result.mobileMessage ? Object.keys(result.mobileMessage).length : 0,
    //             3,
    //             '3 mobileMessages expected'
    //         );
    //         // confirm created item
    //         assert.deepEqual(
    //             await testUtils.getActualJson('testNew_mobileMessage', 'mobileMessage'),
    //             await testUtils.getExpectedJson('9999999', 'mobileMessage', 'post'),
    //             'returned JSON was not equal expected for insert mobileMessage'
    //         );

    //         // confirm updated item
    //         assert.deepEqual(
    //             await testUtils.getActualJson('testExisting_mobileMessage', 'mobileMessage'),
    //             await testUtils.getExpectedJson('9999999', 'mobileMessage', 'put'), // watch out - mobileMessage api wants put instead of patch for updates
    //             'returned JSON was not equal expected for update mobileMessage'
    //         );

    //         // check number of API calls
    //         assert.equal(
    //             testUtils.getAPIHistoryLength(),
    //             7,
    //             'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
    //         );
    //         return;
    //     });
    // });
    // describe('Templating ================', () => {
    //     it('Should create a mobileMessage template via buildTemplate and build it', async () => {
    //         // download first before we test buildTemplate
    //         await handler.retrieve('testInstance/testBU', ['mobileMessage']);
    //         // buildTemplate
    //         const result = await handler.buildTemplate(
    //             'testInstance/testBU',
    //             'mobileMessage',
    //             ['testExisting_mobileMessage'],
    //             'testSourceMarket'
    //         );
    //         assert.equal(
    //             result.mobileMessage ? Object.keys(result.mobileMessage).length : 0,
    //             1,
    //             'only one mobileMessage expected'
    //         );
    //         assert.deepEqual(
    //             await testUtils.getActualTemplateJson(
    //                 'testExisting_mobileMessage',
    //                 'mobileMessage'
    //             ),
    //             await testUtils.getExpectedJson('9999999', 'mobileMessage', 'template'),
    //             'returned template JSON was not equal expected'
    //         );

    //         // buildDefinition
    //         await handler.buildDefinition(
    //             'testInstance/testBU',
    //             'mobileMessage',
    //             'testExisting_mobileMessage',
    //             'testTargetMarket'
    //         );
    //         assert.deepEqual(
    //             await testUtils.getActualDeployJson('testExisting_mobileMessage', 'mobileMessage'),
    //             await testUtils.getExpectedJson('9999999', 'mobileMessage', 'build'),
    //             'returned deployment JSON was not equal expected'
    //         );

    //         assert.equal(
    //             testUtils.getAPIHistoryLength(),
    //             9,
    //             'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
    //         );
    //         return;
    //     });
    // });
});
