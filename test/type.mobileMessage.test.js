import * as chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);

describe('type: mobileMessage', () => {
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
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
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
            expect(await testUtils.getActualFile('NTIzOjc4OjA', 'mobileMessage', 'amp')).to.equal(
                await testUtils.getExpectedFile('9999999', 'mobileMessage', 'get', 'amp')
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

        it('Should create & update items', async () => {
            // WHEN
            await handler.deploy('testInstance/testBU', ['mobileMessage']);
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
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
            expect(await testUtils.getActualFile('NTQ3Ojc4OjA', 'mobileMessage', 'amp')).to.equal(
                await testUtils.getExpectedFile('9999999', 'mobileMessage', 'post-create', 'amp')
            );

            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('NTIzOjc4OjA', 'mobileMessage'),
                await testUtils.getExpectedJson('9999999', 'mobileMessage', 'post-update'), // watch out - mobileMessage api wants put instead of patch for updates
                'returned JSON was not equal expected for update mobileMessage'
            );
            expect(await testUtils.getActualFile('NTIzOjc4OjA', 'mobileMessage', 'amp')).to.equal(
                await testUtils.getExpectedFile('9999999', 'mobileMessage', 'post-update', 'amp')
            );

            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                8,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should NOT change the key during update with --changeKeyValue and instead fail due to missing support', async () => {
            // WHEN
            handler.setOptions({ changeKeyValue: 'updatedKey' });
            await handler.deploy('testInstance/testBU', ['mobileMessage'], ['NTIzOjc4OjA']);
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
        it('Should create a mobileMessage template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['mobileMessage']);
            // buildTemplate
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'mobileMessage',
                ['NTIzOjc4OjA'],
                ['testSourceMarket']
            );
            assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');

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
                await testUtils.getActualTemplateFile('NTIzOjc4OjA', 'mobileMessage', 'amp')
            ).to.equal(
                await testUtils.getExpectedFile('9999999', 'mobileMessage', 'template', 'amp')
            );

            // buildDefinition
            await handler.buildDefinition(
                'testInstance/testBU',
                'mobileMessage',
                ['NTIzOjc4OjA'],
                ['testTargetMarket']
            );
            assert.equal(process.exitCode, 0, 'buildDefinition should not have thrown an error');
            assert.deepEqual(
                await testUtils.getActualDeployJson('NTIzOjc4OjA', 'mobileMessage'),
                await testUtils.getExpectedJson('9999999', 'mobileMessage', 'build'),
                'returned deployment JSON was not equal expected'
            );
            expect(
                await testUtils.getActualDeployFile('NTIzOjc4OjA', 'mobileMessage', 'amp')
            ).to.equal(await testUtils.getExpectedFile('9999999', 'mobileMessage', 'build', 'amp'));

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
            const isDeleted = await handler.deleteByKey(
                'testInstance/testBU',
                'mobileMessage',
                'NTIzOjc4OjA'
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
                'mobileMessage',
                ['NTIzOjc4OjA']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'getFilesToCommit should not have thrown an error');
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
