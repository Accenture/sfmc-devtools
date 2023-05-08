import chai from 'chai';
import chaiFiles from 'chai-files';
const assert = chai.assert;
chai.use(chaiFiles);
const expect = chai.expect;
const file = chaiFiles.file;
import cache from '../lib/util/cache';
import testUtils from './utils';
import handler from '../lib/index';

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
            assert.equal(!!process.exitCode, false, 'retrieve should not have thrown an error');
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
    describe('Deploy ================', () => {
        beforeEach(() => {
            testUtils.mockSetup(true);
        });
        it('Should create & upsert a mobileMessage', async () => {
            // WHEN
            await handler.deploy('testInstance/testBU', ['mobileMessage']);
            // THEN
            assert.equal(!!process.exitCode, false, 'deploy should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.mobileMessage ? Object.keys(result.mobileMessage).length : 0,
                2,
                '2 mobileMessages expected'
            );
            // confirm created item
            assert.deepEqual(
                await testUtils.getActualJson('NTQ3Ojc4OjA', 'mobileMessage'),
                await testUtils.getExpectedJson('9999999', 'mobileMessage', 'post-create'),
                'returned JSON was not equal expected for insert mobileMessage'
            );
            expect(file(testUtils.getActualFile('NTQ3Ojc4OjA', 'mobileMessage', 'amp'))).to.equal(
                file(testUtils.getExpectedFile('9999999', 'mobileMessage', 'post-create', 'amp'))
            );

            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('NTIzOjc4OjA', 'mobileMessage'),
                await testUtils.getExpectedJson('9999999', 'mobileMessage', 'post-update'), // watch out - mobileMessage api wants put instead of patch for updates
                'returned JSON was not equal expected for update mobileMessage'
            );
            expect(file(testUtils.getActualFile('NTIzOjc4OjA', 'mobileMessage', 'amp'))).to.equal(
                file(testUtils.getExpectedFile('9999999', 'mobileMessage', 'post-update', 'amp'))
            );

            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                7,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
    describe('Templating ================', () => {
        it('Should create a mobileMessage template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['mobileMessage']);
            // buildTemplate
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'mobileMessage',
                ['NTIzOjc4OjA'],
                'testSourceMarket'
            );
            assert.equal(
                !!process.exitCode,
                false,
                'buildTemplate should not have thrown an error'
            );

            assert.equal(
                result.mobileMessage ? Object.keys(result.mobileMessage).length : 0,
                1,
                'only one mobileMessage expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson('NTIzOjc4OjA', 'mobileMessage'),
                await testUtils.getExpectedJson('9999999', 'mobileMessage', 'template'),
                'returned template JSON was not equal expected'
            );
            expect(
                file(testUtils.getActualTemplateFile('NTIzOjc4OjA', 'mobileMessage', 'amp'))
            ).to.equal(
                file(testUtils.getExpectedFile('9999999', 'mobileMessage', 'template', 'amp'))
            );

            // buildDefinition
            await handler.buildDefinition(
                'testInstance/testBU',
                'mobileMessage',
                'NTIzOjc4OjA',
                'testTargetMarket'
            );
            assert.equal(
                !!process.exitCode,
                false,
                'buildDefinition should not have thrown an error'
            );
            assert.deepEqual(
                await testUtils.getActualDeployJson('NTIzOjc4OjA', 'mobileMessage'),
                await testUtils.getExpectedJson('9999999', 'mobileMessage', 'build'),
                'returned deployment JSON was not equal expected'
            );
            expect(
                file(testUtils.getActualDeployFile('NTIzOjc4OjA', 'mobileMessage', 'amp'))
            ).to.equal(file(testUtils.getExpectedFile('9999999', 'mobileMessage', 'build', 'amp')));

            assert.equal(
                testUtils.getAPIHistoryLength(),
                4,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
    describe('Delete ================', () => {
        it('Should delete the item', async () => {
            // WHEN
            const result = await handler.deleteByKey('testInstance/testBU', 'mobileMessage', [
                'NTIzOjc4OjA',
            ]);
            // THEN
            assert.equal(!!process.exitCode, false, 'delete should not have thrown an error');

            assert.equal(result, true, 'should have deleted the item');
            return;
        });
    });
    describe('CI/CD ================', () => {
        it('Should return a list of files based on their type and key', async () => {
            // WHEN
            const fileList = await handler.getFilesToCommit(
                'testInstance/testBU',
                'mobileMessage',
                ['NTIzOjc4OjA']
            );
            // THEN
            assert.equal(
                !!process.exitCode,
                false,
                'getFilesToCommit should not have thrown an error'
            );
            assert.equal(fileList.length, 2, 'expected only 2 file paths');

            assert.equal(
                fileList[0].split('\\').join('/'),
                'retrieve/testInstance/testBU/mobileMessage/NTIzOjc4OjA.mobileMessage-meta.json',
                'wrong JSON path'
            );
            assert.equal(
                fileList[1].split('\\').join('/'),
                'retrieve/testInstance/testBU/mobileMessage/NTIzOjc4OjA.mobileMessage-meta.amp',
                'wrong AMP path'
            );
            return;
        });
    });
});
