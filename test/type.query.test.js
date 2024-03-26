import * as chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);
const file = chaiFiles.file;

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
                3,
                'only three queries expected'
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
                3,
                'three queries in cache expected'
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
                3,
                'three queries in cache expected'
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
            const resultDeploy = await handler.deploy(
                'testInstance/testBU',
                ['query'],
                ['testNew_query', 'testExisting_query']
            );
            // THEN
            assert.equal(process.exitCode, false, 'deploy should not have thrown an error');
            assert.equal(
                resultDeploy['testInstance/testBU']?.query
                    ? Object.keys(resultDeploy['testInstance/testBU']?.query).length
                    : 0,
                2,
                'two queries to be deployed'
            );
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.query ? Object.keys(result.query).length : 0,
                4,
                'four queries expected in cache'
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

        it('Should deploy and execute with --execute', async () => {
            handler.setOptions({ execute: true });
            // WHEN
            await handler.deploy(
                'testInstance/testBU',
                ['query'],
                ['testExisting_query', 'testNew_query']
            );
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

        it('Should change the key during update with --changeKeyValue', async () => {
            // WHEN
            await handler.retrieve(
                'testInstance/testBU',
                ['query'],
                ['testExisting_query_fixKeys']
            );
            handler.setOptions({
                changeKeyValue: 'testExisting_query_fixedKeys',
                fromRetrieve: true,
            });
            const deployed = await handler.deploy(
                'testInstance/testBU',
                ['query'],
                ['testExisting_query_fixKeys']
            );
            // THEN
            assert.equal(
                process.exitCode,
                false,
                'deploy --changeKeyValue should not have thrown an error'
            );
            assert.equal(
                Object.keys(deployed['testInstance/testBU'].query).length,
                1,
                'returned number of keys does not correspond to number of expected fixed keys'
            );
            assert.equal(
                Object.keys(deployed['testInstance/testBU'].query)[0],
                'testExisting_query_fixedKeys',
                'returned keys do not correspond to expected fixed keys'
            );

            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_query_fixedKeys', 'query'),
                await testUtils.getExpectedJson('9999999', 'query', 'patch_fixKeys'),
                'returned metadata was not equal expected for update query'
            );
            expect(
                file(testUtils.getActualFile('testExisting_query_fixedKeys', 'query', 'sql'))
            ).to.equal(file(testUtils.getExpectedFile('9999999', 'query', 'patch_fixKeys', 'sql')));
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                14,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should change the key during update with --changeKeyField', async () => {
            // WHEN
            await handler.retrieve(
                'testInstance/testBU',
                ['query'],
                ['testExisting_query_fixKeys']
            );
            handler.setOptions({ changeKeyField: 'name', fromRetrieve: true });
            const deployed = await handler.deploy(
                'testInstance/testBU',
                ['query'],
                ['testExisting_query_fixKeys']
            );
            // THEN
            assert.equal(
                process.exitCode,
                false,
                'deploy --changeKeyValue should not have thrown an error'
            );
            assert.equal(
                Object.keys(deployed['testInstance/testBU'].query).length,
                1,
                'returned number of keys does not correspond to number of expected fixed keys'
            );
            assert.equal(
                Object.keys(deployed['testInstance/testBU'].query)[0],
                'testExisting_query_fixedKeys',
                'returned keys do not correspond to expected fixed keys'
            );
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_query_fixedKeys', 'query'),
                await testUtils.getExpectedJson('9999999', 'query', 'patch_fixKeys'),
                'returned metadata was not equal expected for update query'
            );
            expect(
                file(testUtils.getActualFile('testExisting_query_fixedKeys', 'query', 'sql'))
            ).to.equal(file(testUtils.getExpectedFile('9999999', 'query', 'patch_fixKeys', 'sql')));
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                14,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should run fixKeys but not find fixable keys and hence stop', async () => {
            // WHEN
            handler.setOptions({ skipInteraction: { fixKeysReretrieve: false } });
            const resultFixKeys = await handler.fixKeys('testInstance/testBU', 'query', [
                'testExisting_query',
            ]);
            // THEN
            assert.equal(process.exitCode, false, 'fixKeys should not have thrown an error');
            // check which keys were fixed
            assert.equal(
                resultFixKeys['testInstance/testBU'].length,
                0,
                'expected to find no keys to be fixed'
            );

            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.query ? Object.keys(result.query).length : 0,
                1,
                'one query expected'
            );
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                7,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should fixKeys by key WITHOUT re-retrieving dependent types', async () => {
            // WHEN
            handler.setOptions({ skipInteraction: { fixKeysReretrieve: false } });
            const resultFixKeys = await handler.fixKeys('testInstance/testBU', 'query', [
                'testExisting_query_fixKeys',
                'testExisting_query',
            ]);
            assert.equal(
                resultFixKeys['testInstance/testBU'].length,
                1,
                'returned number of keys does not correspond to number of expected fixed keys'
            );
            assert.equal(
                resultFixKeys['testInstance/testBU'][0],
                'testExisting_query_fixedKeys',
                'returned keys do not correspond to expected fixed keys'
            );
            // THEN
            assert.equal(process.exitCode, false, 'fixKeys should not have thrown an error');
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_query_fixedKeys', 'query'),
                await testUtils.getExpectedJson('9999999', 'query', 'patch_fixKeys'),
                'returned metadata was not equal expected for update query'
            );
            expect(
                file(testUtils.getActualFile('testExisting_query_fixedKeys', 'query', 'sql'))
            ).to.equal(file(testUtils.getExpectedFile('9999999', 'query', 'patch_fixKeys', 'sql')));
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                16,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should fixKeys by key WITHOUT re-retrieving dependent types and then --execute', async () => {
            // WHEN
            handler.setOptions({ skipInteraction: { fixKeysReretrieve: false }, execute: true });
            const resultFixKeys = await handler.fixKeys('testInstance/testBU', 'query', [
                'testExisting_query_fixKeys',
                'testExisting_query',
            ]);
            assert.equal(
                resultFixKeys['testInstance/testBU'].length,
                1,
                'returned number of keys does not correspond to number of expected fixed keys'
            );
            assert.equal(
                resultFixKeys['testInstance/testBU'][0],
                'testExisting_query_fixedKeys',
                'returned keys do not correspond to expected fixed keys'
            );
            // THEN
            assert.equal(
                process.exitCode,
                false,
                'fixKeys with --execute should not have thrown an error'
            );
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_query_fixedKeys', 'query'),
                await testUtils.getExpectedJson('9999999', 'query', 'patch_fixKeys'),
                'returned metadata was not equal expected for update query'
            );
            expect(
                file(testUtils.getActualFile('testExisting_query_fixedKeys', 'query', 'sql'))
            ).to.equal(file(testUtils.getExpectedFile('9999999', 'query', 'patch_fixKeys', 'sql')));
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                18,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should fixKeys by key AND re-retrieve dependent types', async () => {
            // WHEN
            handler.setOptions({ skipInteraction: { fixKeysReretrieve: true } });
            const resultFixKeys = await handler.fixKeys('testInstance/testBU', 'query', [
                'testExisting_query_fixKeys',
                'testExisting_query',
            ]);
            assert.equal(
                resultFixKeys['testInstance/testBU'].length,
                1,
                'returned number of keys does not correspond to number of expected fixed keys'
            );
            assert.equal(
                resultFixKeys['testInstance/testBU'][0],
                'testExisting_query_fixedKeys',
                'returned keys do not correspond to expected fixed keys'
            );
            // THEN
            assert.equal(process.exitCode, false, 'fixKeys should not have thrown an error');
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_query_fixedKeys', 'query'),
                await testUtils.getExpectedJson('9999999', 'query', 'patch_fixKeys'),
                'returned metadata was not equal expected for update query'
            );
            expect(
                file(testUtils.getActualFile('testExisting_query_fixedKeys', 'query', 'sql'))
            ).to.equal(file(testUtils.getExpectedFile('9999999', 'query', 'patch_fixKeys', 'sql')));
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                69,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should fixKeys by key AND re-retrieve dependent types and then --execute', async () => {
            // WHEN
            handler.setOptions({ skipInteraction: { fixKeysReretrieve: true }, execute: true });
            const resultFixKeys = await handler.fixKeys('testInstance/testBU', 'query', [
                'testExisting_query_fixKeys',
                'testExisting_query',
            ]);
            assert.equal(
                resultFixKeys['testInstance/testBU'].length,
                1,
                'returned number of keys does not correspond to number of expected fixed keys'
            );
            assert.equal(
                resultFixKeys['testInstance/testBU'][0],
                'testExisting_query_fixedKeys',
                'returned keys do not correspond to expected fixed keys'
            );
            // THEN
            assert.equal(
                process.exitCode,
                false,
                'fixKeys with --execute should not have thrown an error'
            );
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_query_fixedKeys', 'query'),
                await testUtils.getExpectedJson('9999999', 'query', 'patch_fixKeys'),
                'returned metadata was not equal expected for update query'
            );
            expect(
                file(testUtils.getActualFile('testExisting_query_fixedKeys', 'query', 'sql'))
            ).to.equal(file(testUtils.getExpectedFile('9999999', 'query', 'patch_fixKeys', 'sql')));
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                71,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should fixKeys via --like WITHOUT re-retrieving dependent types', async () => {
            // WHEN
            handler.setOptions({
                like: { key: 'testExisting_query_f%' },
                skipInteraction: { fixKeysReretrieve: false },
            });
            const resultFixKeys = await handler.fixKeys('testInstance/testBU', 'query');
            assert.equal(
                resultFixKeys['testInstance/testBU'].length,
                1,
                'returned number of keys does not correspond to number of expected fixed keys'
            );
            assert.equal(
                resultFixKeys['testInstance/testBU'][0],
                'testExisting_query_fixedKeys',
                'returned keys do not correspond to expected fixed keys'
            );
            // THEN
            assert.equal(process.exitCode, false, 'fixKeys should not have thrown an error');
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_query_fixedKeys', 'query'),
                await testUtils.getExpectedJson('9999999', 'query', 'patch_fixKeys'),
                'returned metadata was not equal expected for update query'
            );
            expect(
                file(testUtils.getActualFile('testExisting_query_fixedKeys', 'query', 'sql'))
            ).to.equal(file(testUtils.getExpectedFile('9999999', 'query', 'patch_fixKeys', 'sql')));
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                13,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Templating ================', () => {
        it('Should create a query template via retrieveAsTemplate and build it', async () => {
            // GIVEN there is a template
            const result = await handler.retrieveAsTemplate(
                'testInstance/testBU',
                'query',
                ['testExisting_query'],
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
            const isDeleted = await handler.deleteByKey(
                'testInstance/testBU',
                'query',
                'testExisting_query'
            );
            // THEN
            assert.equal(process.exitCode, false, 'delete should not have thrown an error');

            assert.equal(isDeleted, true, 'should have deleted the item');
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
            const executedKeys = await handler.execute('testInstance/testBU', 'query', [
                'testExisting_query',
            ]);
            assert.equal(process.exitCode, false, 'execute should not have thrown an error');
            assert.equal(
                executedKeys['testInstance/testBU']?.length,
                1,
                'returned number of keys does not correspond to number of expected fixed keys'
            );
            assert.equal(
                executedKeys['testInstance/testBU'][0],
                'testExisting_query',
                'returned keys do not correspond to expected fixed keys'
            );
            return;
        });

        it('Should start a query selected via --like', async () => {
            handler.setOptions({ like: { key: 'testExist%query' } });
            const executedKeys = await handler.execute('testInstance/testBU', 'query');
            assert.equal(process.exitCode, false, 'execute should not have thrown an error');
            assert.equal(
                executedKeys['testInstance/testBU']?.length,
                1,
                'returned number of keys does not correspond to number of expected fixed keys'
            );
            assert.equal(
                executedKeys['testInstance/testBU'][0],
                'testExisting_query',
                'returned keys do not correspond to expected fixed keys'
            );
            return;
        });

        it('Should not start executing a query because key and --like was specified', async () => {
            handler.setOptions({ like: { key: 'testExisting%' } });
            const executedKeys = await handler.execute('testInstance/testBU', 'query', [
                'testExisting_query',
            ]);
            assert.equal(process.exitCode, true, 'execute should have thrown an error');
            assert.equal(
                Object.keys(executedKeys).length,
                0,
                'query was not supposed to be executed'
            );
            return;
        });
    });
});
