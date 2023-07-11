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

describe('type: query', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });
    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve all queries', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['query']);
            // THEN
            assert.equal(process.exitCode, false, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.query ? Object.keys(result.query).length : 0,
                2,
                'only two queries expected'
            );
            // normal test
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_query', 'query'),
                await testUtils.getExpectedJson('9999999', 'query', 'get'),
                'returned metadata with correct key was not equal expected'
            );
            expect(file(testUtils.getActualFile('testExisting_query', 'query', 'sql'))).to.equal(
                file(testUtils.getExpectedFile('9999999', 'query', 'get', 'sql'))
            );
            // check if targetKey was overwritten
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_query2', 'query'),
                await testUtils.getExpectedJson('9999999', 'query', 'get2'),
                'returned metadata with wrong key was not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                6,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should retrieve one specific query by key', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['query'], ['testExisting_query']);
            // THEN
            assert.equal(process.exitCode, false, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.query ? Object.keys(result.query).length : 0,
                1,
                'only one query expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_query', 'query'),
                await testUtils.getExpectedJson('9999999', 'query', 'get'),
                'returned metadata was not equal expected'
            );
            expect(file(testUtils.getActualFile('testExisting_query', 'query', 'sql'))).to.equal(
                file(testUtils.getExpectedFile('9999999', 'query', 'get', 'sql'))
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                7,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should retrieve one specific query via --like', async () => {
            // WHEN
            handler.setOptions({ like: { key: '%Existing_query' } });
            await handler.retrieve('testInstance/testBU', ['query']);
            // THEN
            assert.equal(process.exitCode, false, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.query ? Object.keys(result.query).length : 0,
                2,
                'two queries in cache expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_query', 'query'),
                await testUtils.getExpectedJson('9999999', 'query', 'get'),
                'returned metadata was not equal expected'
            );
            expect(file(testUtils.getActualFile('testExisting_query', 'query', 'sql'))).to.equal(
                file(testUtils.getExpectedFile('9999999', 'query', 'get', 'sql'))
            );
            expect(file(testUtils.getActualFile('testExisting_query2', 'query', 'sql'))).to.not
                .exist;
            assert.equal(
                testUtils.getAPIHistoryLength(),
                6,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should not retrieve any query via --like and key due to a mismatching filter', async () => {
            // WHEN
            handler.setOptions({ like: { key: 'NotExisting_query' } });
            await handler.retrieve('testInstance/testBU', ['query']);
            // THEN
            assert.equal(process.exitCode, false, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.query ? Object.keys(result.query).length : 0,
                2,
                'two queries in cache expected'
            );

            expect(file(testUtils.getActualFile('testExisting_query', 'query', 'sql'))).to.not
                .exist;
            expect(file(testUtils.getActualFile('testExisting_query2', 'query', 'sql'))).to.not
                .exist;
            assert.equal(
                testUtils.getAPIHistoryLength(),
                6,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
    describe('Deploy ================', () => {
        beforeEach(() => {
            testUtils.mockSetup(true);
        });
        it('Should create & upsert a query', async () => {
            // WHEN
            await handler.deploy('testInstance/testBU', ['query']);
            // THEN
            assert.equal(process.exitCode, false, 'deploy should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.query ? Object.keys(result.query).length : 0,
                3,
                'three queries expected'
            );
            // confirm created item
            assert.deepEqual(
                await testUtils.getActualJson('testNew_query', 'query'),
                await testUtils.getExpectedJson('9999999', 'query', 'post'),
                'returned metadata was not equal expected for insert query'
            );
            expect(file(testUtils.getActualFile('testNew_query', 'query', 'sql'))).to.equal(
                file(testUtils.getExpectedFile('9999999', 'query', 'post', 'sql'))
            );
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_query', 'query'),
                await testUtils.getExpectedJson('9999999', 'query', 'patch'),
                'returned metadata was not equal expected for insert query'
            );
            expect(file(testUtils.getActualFile('testExisting_query', 'query', 'sql'))).to.equal(
                file(testUtils.getExpectedFile('9999999', 'query', 'patch', 'sql'))
            );
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                8,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should change the key during update with --changeKeyValue');
        it('Should deploy and execute with --execute', async () => {
            handler.setOptions({ execute: true });
            // WHEN
            await handler.deploy('testInstance/testBU', ['query']);
            // THEN
            assert.equal(
                process.exitCode,
                false,
                'deploy with --execute should not have thrown an error'
            );
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_query', 'query'),
                await testUtils.getExpectedJson('9999999', 'query', 'patch'),
                'returned metadata was not equal expected for insert query'
            );
            expect(file(testUtils.getActualFile('testExisting_query', 'query', 'sql'))).to.equal(
                file(testUtils.getExpectedFile('9999999', 'query', 'patch', 'sql'))
            );
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                12,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
    describe('FixKeys ================', () => {
        beforeEach(() => {
            testUtils.mockSetup(true);
        });
        it('Should update the key and re-deploy', async () => {
            // WHEN
            await handler.fixKeys('testInstance/testBU', ['query']);
            // THEN
            assert.equal(process.exitCode, false, 'fixKeys should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.query ? Object.keys(result.query).length : 0,
                2,
                'two queries expected'
            );
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_query', 'query'),
                await testUtils.getExpectedJson('9999999', 'query', 'patch1'),
                'returned metadata was not equal expected for insert query'
            );
            expect(file(testUtils.getActualFile('testExisting_query', 'query', 'sql'))).to.equal(
                file(testUtils.getExpectedFile('9999999', 'query', 'patch1', 'sql'))
            );
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                27,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should change the key during update with --changeKeyValue');
    });
    describe('Templating ================', () => {
        it('Should create a query template via retrieveAsTemplate and build it', async () => {
            // GIVEN there is a template
            const result = await handler.retrieveAsTemplate(
                'testInstance/testBU',
                'query',
                ['testExisting_query1'],
                'testSourceMarket'
            );
            // WHEN
            assert.equal(
                process.exitCode,
                false,
                'retrieveAsTemplate should not have thrown an error'
            );
            assert.equal(
                result.query ? Object.keys(result.query).length : 0,
                1,
                'only one query expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson('testExisting_query', 'query'),
                await testUtils.getExpectedJson('9999999', 'query', 'template'),
                'returned template JSON of retrieveAsTemplate was not equal expected'
            );
            expect(
                file(testUtils.getActualTemplateFile('testExisting_query', 'query', 'sql'))
            ).to.equal(file(testUtils.getExpectedFile('9999999', 'query', 'template', 'sql')));
            // THEN
            await handler.buildDefinition(
                'testInstance/testBU',
                'query',
                'testExisting_query',
                'testTargetMarket'
            );
            assert.equal(
                process.exitCode,
                false,
                'buildDefinition should not have thrown an error'
            );

            assert.deepEqual(
                await testUtils.getActualDeployJson('testTemplated_query', 'query'),
                await testUtils.getExpectedJson('9999999', 'query', 'build'),
                'returned deployment JSON was not equal expected'
            );
            expect(
                file(testUtils.getActualDeployFile('testTemplated_query', 'query', 'sql'))
            ).to.equal(file(testUtils.getExpectedFile('9999999', 'query', 'build', 'sql')));

            assert.equal(
                testUtils.getAPIHistoryLength(),
                6,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should create a query template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['query']);
            // GIVEN there is a template
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'query',
                ['testExisting_query'],
                'testSourceMarket'
            );
            // WHEN
            assert.equal(process.exitCode, false, 'buildTemplate should not have thrown an error');

            assert.equal(
                result.query ? Object.keys(result.query).length : 0,
                1,
                'only one query expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson('testExisting_query', 'query'),
                await testUtils.getExpectedJson('9999999', 'query', 'template'),
                'returned template JSON of buildTemplate was not equal expected'
            );
            expect(
                file(testUtils.getActualTemplateFile('testExisting_query', 'query', 'sql'))
            ).to.equal(file(testUtils.getExpectedFile('9999999', 'query', 'template', 'sql')));
            // THEN
            await handler.buildDefinition(
                'testInstance/testBU',
                'query',
                'testExisting_query',
                'testTargetMarket'
            );
            assert.equal(
                process.exitCode,
                false,
                'buildDefinition should not have thrown an error'
            );

            assert.deepEqual(
                await testUtils.getActualDeployJson('testTemplated_query', 'query'),
                await testUtils.getExpectedJson('9999999', 'query', 'build'),
                'returned deployment JSON was not equal expected'
            );
            expect(
                file(testUtils.getActualDeployFile('testTemplated_query', 'query', 'sql'))
            ).to.equal(file(testUtils.getExpectedFile('9999999', 'query', 'build', 'sql')));

            assert.equal(
                testUtils.getAPIHistoryLength(),
                6,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
    describe('Delete ================', () => {
        it('Should delete the item', async () => {
            // WHEN
            const result = await handler.deleteByKey('testInstance/testBU', 'query', [
                'testExisting_query',
            ]);
            // THEN
            assert.equal(process.exitCode, false, 'delete should not have thrown an error');

            assert.equal(result, true, 'should have deleted the item');
            return;
        });
    });
    describe('CI/CD ================', () => {
        it('Should return a list of files based on their type and key', async () => {
            // WHEN
            const fileList = await handler.getFilesToCommit('testInstance/testBU', 'query', [
                'testExisting_query',
            ]);
            // THEN
            assert.equal(
                process.exitCode,
                false,
                'getFilesToCommit should not have thrown an error'
            );
            assert.equal(fileList.length, 2, 'expected only 2 file paths');

            assert.equal(
                fileList[0].split('\\').join('/'),
                'retrieve/testInstance/testBU/query/testExisting_query.query-meta.json',
                'wrong JSON path'
            );
            assert.equal(
                fileList[1].split('\\').join('/'),
                'retrieve/testInstance/testBU/query/testExisting_query.query-meta.sql',
                'wrong JSON path'
            );
            return;
        });
    });
    describe('Execute ================', () => {
        it('Should start a query by key', async () => {
            const execute = await handler.execute('testInstance/testBU', 'query', [
                'testExisting_query',
            ]);
            assert.equal(process.exitCode, false, 'execute should not have thrown an error');
            assert.equal(execute, true, 'query was supposed to be executed');
            return;
        });
        it('Should start a query selected via --like', async () => {
            handler.setOptions({ like: { key: 'testExist%query' } });
            const execute = await handler.execute('testInstance/testBU', 'query');
            assert.equal(process.exitCode, false, 'execute should not have thrown an error');
            assert.equal(execute, true, 'query was supposed to be executed');
            return;
        });
        it('Should not start executing a query because key and --like was specified', async () => {
            handler.setOptions({ like: { key: 'testExisting%' } });
            const execute = await handler.execute('testInstance/testBU', 'query', [
                'testExisting_query',
            ]);
            assert.equal(process.exitCode, true, 'execute should not have thrown an error');
            assert.equal(execute, false, 'query was not supposed to be executed');
            return;
        });
    });
});
