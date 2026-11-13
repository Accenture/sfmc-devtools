import * as chai from 'chai';
/** @type {typeof chai.assert} */
const assert = chai.assert;
const expect = chai.expect;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import File from '../lib/util/file.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
import Query from '../lib/metadataTypes/Query.js';
import { Util } from '../lib/util/util.js';
chai.use(chaiFiles);

/**
 * collects warnings while still printing them
 *
 * @returns {{list: string[], restore: () => void}} collected messages and a function to stop collecting
 */
function captureWarnings() {
    const list = [];
    const originalWarn = Util.logger.warn;
    Util.logger.warn = (message) => {
        list.push(message);
        return originalWarn.call(Util.logger, message);
    };
    return {
        list,
        restore: () => {
            Util.logger.warn = originalWarn;
        },
    };
}

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
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.query ? Object.keys(result.query).length : 0,
                5,
                'only 5 queries expected'
            );
            // normal test
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_query', 'query'),
                await testUtils.getExpectedJson('9999999', 'query', 'get'),
                'returned metadata with correct key was not equal expected'
            );
            expect(await testUtils.getActualFile('testExisting_query', 'query', 'sql')).to.equal(
                await testUtils.getExpectedFile('9999999', 'query', 'get', 'sql')
            );
            // check if r__dataExtension_key was overwritten
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_query2', 'query'),
                await testUtils.getExpectedJson('9999999', 'query', 'get2'),
                'returned metadata with wrong key was not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                5,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should resolve shared dataExtensions in query when retrieved together with dataExtension', async () => {
            // WHEN
            // this test verifies the fix for: shared DEs not resolved if query+dataExtension is retrieved together
            await handler.retrieve('testInstance/testBU', ['dataExtension', 'query']);
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.query ? Object.keys(result.query).length : 0,
                5,
                'only 5 queries expected'
            );
            // verify that shared DE was resolved correctly in query (this is the key bug fix check)
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_query_SharedDE', 'query'),
                await testUtils.getExpectedJson('9999999', 'query', 'get_sharedDE'),
                'returned metadata was not equal expected - shared DE should be resolved even when dataExtension is retrieved together with query'
            );
            expect(
                await testUtils.getActualFile('testExisting_query_SharedDE', 'query', 'sql')
            ).to.equal(await testUtils.getExpectedFile('9999999', 'query', 'get_sharedDE', 'sql'));

            assert.equal(
                testUtils.getAPIHistoryLength(),
                8,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should retrieve one specific query by key and overwrite conflict-marked JSON', async () => {
            const basePath = './retrieve/testInstance/testBU/query';
            await File.writeToFile(
                basePath,
                'testExisting_query.query-meta',
                'json',
                '<<<<<<< HEAD\n{}\n=======\n{}\n>>>>>>> incoming\n'
            );
            await File.writeToFile(basePath, 'sentinel', 'txt', 'preserve unrelated file');
            // WHEN
            await handler.retrieve('testInstance/testBU', ['query'], ['testExisting_query']);
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
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
            expect(await testUtils.getActualFile('testExisting_query', 'query', 'sql')).to.equal(
                await testUtils.getExpectedFile('9999999', 'query', 'get', 'sql')
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                6,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            assert.equal(
                await File.readFile(`${basePath}/sentinel.txt`, 'utf8'),
                'preserve unrelated file'
            );
            return;
        });

        it('Should retrieve one specific query via --like', async () => {
            // WHEN
            handler.setOptions({ like: { key: '%Existing_query' } });
            await handler.retrieve('testInstance/testBU', ['query']);
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.query ? Object.keys(result.query).length : 0,
                5,
                '5 queries in cache expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_query', 'query'),
                await testUtils.getExpectedJson('9999999', 'query', 'get'),
                'returned metadata was not equal expected'
            );
            expect(await testUtils.getActualFile('testExisting_query', 'query', 'sql')).to.equal(
                await testUtils.getExpectedFile('9999999', 'query', 'get', 'sql')
            );
            expect(await testUtils.getActualFile('testExisting_query2', 'query', 'sql')).to.not
                .exist;
            assert.equal(
                testUtils.getAPIHistoryLength(),
                5,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should not retrieve any query via --like and key due to a mismatching filter', async () => {
            // WHEN
            handler.setOptions({ like: { key: 'NotExisting_query' } });
            await handler.retrieve('testInstance/testBU', ['query']);
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.query ? Object.keys(result.query).length : 0,
                5,
                '5 queries in cache expected'
            );

            expect(await testUtils.getActualFile('testExisting_query', 'query', 'sql')).to.not
                .exist;
            expect(await testUtils.getActualFile('testExisting_query2', 'query', 'sql')).to.not
                .exist;
            assert.equal(
                testUtils.getAPIHistoryLength(),
                5,
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
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
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
                6,
                '6 queries expected in cache'
            );
            // confirm created item
            assert.deepEqual(
                await testUtils.getActualJson('testNew_query', 'query'),
                await testUtils.getExpectedJson('9999999', 'query', 'post'),
                'returned metadata was not equal expected for insert query'
            );
            expect(await testUtils.getActualFile('testNew_query', 'query', 'sql')).to.equal(
                await testUtils.getExpectedFile('9999999', 'query', 'post', 'sql')
            );
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_query', 'query'),
                await testUtils.getExpectedJson('9999999', 'query', 'patch'),
                'returned metadata was not equal expected for insert query'
            );
            expect(await testUtils.getActualFile('testExisting_query', 'query', 'sql')).to.equal(
                await testUtils.getExpectedFile('9999999', 'query', 'patch', 'sql')
            );
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                7,
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
                0,
                'deploy with --execute should not have thrown an error'
            );
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_query', 'query'),
                await testUtils.getExpectedJson('9999999', 'query', 'patch'),
                'returned metadata was not equal expected for insert query'
            );
            expect(await testUtils.getActualFile('testExisting_query', 'query', 'sql')).to.equal(
                await testUtils.getExpectedFile('9999999', 'query', 'patch', 'sql')
            );
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                11,
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
                0,
                'deploy --changeKeyValue should not have thrown an error'
            );
            const upsertCallout = testUtils.getRestCallout('patch', '/automation/v1/queries/%');
            assert.equal(
                upsertCallout?.key,
                'testExisting_query_fixedKeys',
                'key in create callout was not as expected'
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
                await testUtils.getActualFile('testExisting_query_fixedKeys', 'query', 'sql')
            ).to.equal(await testUtils.getExpectedFile('9999999', 'query', 'patch_fixKeys', 'sql'));
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                12,
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
                0,
                'deploy --changeKeyValue should not have thrown an error'
            );
            const upsertCallout = testUtils.getRestCallout('patch', '/automation/v1/queries/%');
            assert.equal(
                upsertCallout?.key,
                'testExisting_query_fixedKeys',
                'key in create callout was not as expected'
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
                await testUtils.getActualFile('testExisting_query_fixedKeys', 'query', 'sql')
            ).to.equal(await testUtils.getExpectedFile('9999999', 'query', 'patch_fixKeys', 'sql'));
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                12,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should change the key during update with --changeKeyField and --keySuffix', async () => {
            // WHEN
            await handler.retrieve(
                'testInstance/testBU',
                ['query'],
                ['testExisting_query_fixKeysSuffix']
            );
            handler.setOptions({ changeKeyField: 'name', keySuffix: '_DEV', fromRetrieve: true });
            const deployed = await handler.deploy(
                'testInstance/testBU',
                ['query'],
                ['testExisting_query_fixKeysSuffix']
            );
            // THEN
            assert.equal(
                process.exitCode,
                0,
                'deploy --changeKeyValue --keySuffix should not have thrown an error'
            );
            assert.equal(
                Object.keys(deployed['testInstance/testBU'].query).length,
                1,
                'returned number of keys does not correspond to number of expected fixed keys'
            );
            const upsertCallout = testUtils.getRestCallout('patch', '/automation/v1/queries/%');

            assert.equal(
                upsertCallout?.key,
                'testExisting_query_fixedKeysSuff_DEV',
                'key in create callout was not as expected'
            );
            assert.equal(
                Object.keys(deployed['testInstance/testBU'].query)[0],
                'testExisting_query_fixedKeysSuff_DEV',
                'returned keys do not correspond to expected fixed keys'
            );
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_query_fixedKeysSuff_DEV', 'query'),
                await testUtils.getExpectedJson('9999999', 'query', 'patch_fixKeysSuffix'),
                'returned metadata was not equal expected for update query'
            );
            expect(
                await testUtils.getActualFile(
                    'testExisting_query_fixedKeysSuff_DEV',
                    'query',
                    'sql'
                )
            ).to.equal(
                await testUtils.getExpectedFile('9999999', 'query', 'patch_fixKeysSuffix', 'sql')
            );
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                12,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should change the key during create with and --keySuffix', async () => {
            handler.setOptions({ keySuffix: '_DEV' });
            const deployed = await handler.deploy(
                'testInstance/_ParentBU_',
                ['query'],
                ['testNew_query']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deploy --keySuffix should not have thrown an error');
            assert.equal(
                Object.keys(deployed['testInstance/_ParentBU_'].query).length,
                1,
                'returned number of keys does not correspond to number of expected fixed keys'
            );
            assert.equal(
                Object.keys(deployed['testInstance/_ParentBU_'].query)[0],
                'testNew_query_DEV',
                'returned keys do not correspond to expected fixed keys'
            );

            const createCallout = testUtils.getRestCallout('post', '/automation/v1/queries/');
            assert.equal(
                createCallout?.key,
                'testNew_query_DEV',
                'key in create callout was not as expected'
            );

            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testNew_query_DEV', 'query', '_ParentBU_'),
                await testUtils.getExpectedJson('1111111', 'query', 'patch_keySuffix'),
                'returned metadata was not equal expected for update query'
            );

            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                4,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should run fixKeys but not find fixable keys and hence stop', async () => {
            // WHEN
            handler.setOptions({ skipInteraction: { fixKeysReretrieve: false } });
            const resultFixKeys = await handler.fixKeys(
                'testInstance/testBU',
                ['query'],
                ['testExisting_query']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'fixKeys should not have thrown an error');
            // check which keys were fixed
            assert.equal(
                resultFixKeys['testInstance/testBU']['query'].length,
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
                6,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should fixKeys by key WITHOUT re-retrieving dependent types', async () => {
            // WHEN
            handler.setOptions({ skipInteraction: { fixKeysReretrieve: false } });
            const resultFixKeys = await handler.fixKeys(
                'testInstance/testBU',
                ['query'],
                ['testExisting_query_fixKeys', 'testExisting_query']
            );
            assert.equal(
                resultFixKeys['testInstance/testBU']['query'].length,
                1,
                'returned number of keys does not correspond to number of expected fixed keys'
            );
            assert.equal(
                resultFixKeys['testInstance/testBU']['query'][0],
                'testExisting_query_fixedKeys',
                'returned keys do not correspond to expected fixed keys'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'fixKeys should not have thrown an error');
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_query_fixedKeys', 'query'),
                await testUtils.getExpectedJson('9999999', 'query', 'patch_fixKeys'),
                'returned metadata was not equal expected for update query'
            );
            expect(
                await testUtils.getActualFile('testExisting_query_fixedKeys', 'query', 'sql')
            ).to.equal(await testUtils.getExpectedFile('9999999', 'query', 'patch_fixKeys', 'sql'));
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                14,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should fixKeys by key with --keySuffix WITHOUT re-retrieving dependent types', async () => {
            // WHEN
            handler.setOptions({
                keySuffix: '_DEV',
                skipInteraction: { fixKeysReretrieve: false },
            });
            const resultFixKeys = await handler.fixKeys(
                'testInstance/testBU',
                ['query'],
                ['testExisting_query_fixKeysSuffix', 'testExisting_query']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'fixKeys should not have thrown an error');

            const upsertCallout = testUtils.getRestCallout('patch', '/automation/v1/queries/%');
            assert.equal(
                upsertCallout?.key,
                'testExisting_query_fixedKeysSuff_DEV',
                'key in create callout was not as expected'
            );

            assert.equal(
                resultFixKeys['testInstance/testBU']['query'].length,
                1,
                'returned number of keys does not correspond to number of expected fixed keys'
            );
            assert.equal(
                resultFixKeys['testInstance/testBU']['query'][0],
                'testExisting_query_fixedKeysSuff_DEV',
                'returned keys do not correspond to expected fixed keys'
            );
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_query_fixedKeysSuff_DEV', 'query'),
                await testUtils.getExpectedJson('9999999', 'query', 'patch_fixKeysSuffix'),
                'returned metadata was not equal expected for update query'
            );
            expect(
                await testUtils.getActualFile(
                    'testExisting_query_fixedKeysSuff_DEV',
                    'query',
                    'sql'
                )
            ).to.equal(
                await testUtils.getExpectedFile('9999999', 'query', 'patch_fixKeysSuffix', 'sql')
            );
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                14,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should fixKeys by key WITHOUT re-retrieving dependent types and then --execute', async () => {
            // WHEN
            handler.setOptions({ skipInteraction: { fixKeysReretrieve: false }, execute: true });
            const resultFixKeys = await handler.fixKeys(
                'testInstance/testBU',
                ['query'],
                ['testExisting_query_fixKeys', 'testExisting_query']
            );
            assert.equal(
                resultFixKeys['testInstance/testBU']['query'].length,
                1,
                'returned number of keys does not correspond to number of expected fixed keys'
            );
            assert.equal(
                resultFixKeys['testInstance/testBU']['query'][0],
                'testExisting_query_fixedKeys',
                'returned keys do not correspond to expected fixed keys'
            );
            // THEN
            assert.equal(
                process.exitCode,
                0,
                'fixKeys with --execute should not have thrown an error'
            );
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_query_fixedKeys', 'query'),
                await testUtils.getExpectedJson('9999999', 'query', 'patch_fixKeys'),
                'returned metadata was not equal expected for update query'
            );
            expect(
                await testUtils.getActualFile('testExisting_query_fixedKeys', 'query', 'sql')
            ).to.equal(await testUtils.getExpectedFile('9999999', 'query', 'patch_fixKeys', 'sql'));
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                16,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should fixKeys by key AND re-retrieve dependent types', async () => {
            // WHEN
            handler.setOptions({ skipInteraction: { fixKeysReretrieve: true } });
            const resultFixKeys = await handler.fixKeys(
                'testInstance/testBU',
                ['query'],
                ['testExisting_query_fixKeys', 'testExisting_query']
            );
            assert.equal(
                resultFixKeys['testInstance/testBU']['query'].length,
                1,
                'returned number of keys does not correspond to number of expected fixed keys'
            );
            assert.equal(
                resultFixKeys['testInstance/testBU']['query'][0],
                'testExisting_query_fixedKeys',
                'returned keys do not correspond to expected fixed keys'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'fixKeys should not have thrown an error');
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_query_fixedKeys', 'query'),
                await testUtils.getExpectedJson('9999999', 'query', 'patch_fixKeys'),
                'returned metadata was not equal expected for update query'
            );
            expect(
                await testUtils.getActualFile('testExisting_query_fixedKeys', 'query', 'sql')
            ).to.equal(await testUtils.getExpectedFile('9999999', 'query', 'patch_fixKeys', 'sql'));
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                48,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should fixKeys by key AND re-retrieve dependent types and then --execute', async () => {
            // WHEN
            handler.setOptions({ skipInteraction: { fixKeysReretrieve: true }, execute: true });
            const resultFixKeys = await handler.fixKeys(
                'testInstance/testBU',
                ['query'],
                ['testExisting_query_fixKeys', 'testExisting_query']
            );
            assert.equal(
                resultFixKeys['testInstance/testBU']['query'].length,
                1,
                'returned number of keys does not correspond to number of expected fixed keys'
            );
            assert.equal(
                resultFixKeys['testInstance/testBU']['query'][0],
                'testExisting_query_fixedKeys',
                'returned keys do not correspond to expected fixed keys'
            );
            // THEN
            assert.equal(
                process.exitCode,
                0,
                'fixKeys with --execute should not have thrown an error'
            );
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_query_fixedKeys', 'query'),
                await testUtils.getExpectedJson('9999999', 'query', 'patch_fixKeys'),
                'returned metadata was not equal expected for update query'
            );
            expect(
                await testUtils.getActualFile('testExisting_query_fixedKeys', 'query', 'sql')
            ).to.equal(await testUtils.getExpectedFile('9999999', 'query', 'patch_fixKeys', 'sql'));
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                50,
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
            const resultFixKeys = await handler.fixKeys('testInstance/testBU', ['query']);
            assert.equal(
                resultFixKeys['testInstance/testBU']['query'].length,
                2,
                'returned number of keys does not correspond to number of expected fixed keys'
            );
            assert.equal(
                resultFixKeys['testInstance/testBU']['query'][0],
                'testExisting_query_fixedKeys',
                'returned keys do not correspond to expected fixed keys'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'fixKeys should not have thrown an error');
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_query_fixedKeys', 'query'),
                await testUtils.getExpectedJson('9999999', 'query', 'patch_fixKeys'),
                'returned metadata was not equal expected for update query'
            );
            expect(
                await testUtils.getActualFile('testExisting_query_fixedKeys', 'query', 'sql')
            ).to.equal(await testUtils.getExpectedFile('9999999', 'query', 'patch_fixKeys', 'sql'));
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                12,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Templating ================', () => {
        it('Should warn about shared dataExtension in _ParentBU_ when running buildTemplate with --dependencies on child BU', async () => {
            // Retrieve shared DEs from _ParentBU_ to disk first
            await handler.retrieve('testInstance/_ParentBU_', ['dataExtension']);
            assert.equal(
                process.exitCode,
                0,
                '_ParentBU_ retrieve should not have thrown an error'
            );
            const expectedApiCallsParentBURetrieve = 4;
            assert.equal(
                testUtils.getAPIHistoryLength(),
                expectedApiCallsParentBURetrieve,
                'Unexpected number of requests for _ParentBU_ dataExtension retrieve'
            );

            // Retrieve query from child BU (testBU)
            await handler.retrieve('testInstance/testBU', ['query']);
            assert.equal(
                process.exitCode,
                0,
                'testBU query retrieve should not have thrown an error'
            );
            const expectedApiCallsTestBURetrieve = 5;
            assert.equal(
                testUtils.getAPIHistoryLength() - expectedApiCallsParentBURetrieve,
                expectedApiCallsTestBURetrieve,
                'Unexpected number of requests for testBU query retrieve'
            );

            // Run buildTemplate with --dependencies: shared DE must show a warning, not be included in result
            handler.setOptions({ dependencies: true, skipInteraction: true });
            const templateResult = await handler.buildTemplate(
                'testInstance/testBU',
                'query',
                ['testExisting_query_SharedDE'],
                ['testSourceMarket']
            );
            assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');

            // Verify query was templated
            assert.equal(
                templateResult.query ? templateResult.query.length : 0,
                1,
                'expected one query to be templated'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson('testExisting_query_SharedDE', 'query'),
                await testUtils.getExpectedJson('9999999', 'query', 'template_sharedDE'),
                'returned query template JSON was not equal expected'
            );
            expect(
                await testUtils.getActualTemplateFile('testExisting_query_SharedDE', 'query', 'sql')
            ).to.equal(
                await testUtils.getExpectedFile('9999999', 'query', 'template_sharedDE', 'sql')
            );

            // Verify shared DE was NOT included in template result (only a warning should be shown)
            assert.equal(
                templateResult.dataExtension ? templateResult.dataExtension.length : 0,
                0,
                'shared DE should not be included in the child BU template result - only a warning should be shown'
            );
            // 4 requests for the ContentBlockByX search plus 3 for caching dataExtension names
            // (testBU, _ParentBU_ and shared folders) because the SQL selects from the shared DE
            assert.equal(
                testUtils.getAPIHistoryLength() -
                    expectedApiCallsParentBURetrieve -
                    expectedApiCallsTestBURetrieve,
                7,
                'Unexpected number of requests for buildTemplate. Run testUtils.logAPIHistoryDebug() to see the requests'
            );

            return;
        });

        it('Should add dataExtensions used in the SQL when running buildTemplate with --dependencies', async () => {
            // GIVEN dataExtensions of _ParentBU_ and testBU as well as queries of testBU are on disk
            await handler.retrieve('testInstance/_ParentBU_', ['dataExtension']);
            await handler.retrieve('testInstance/testBU', ['dataExtension', 'query']);
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            const apiCallsRetrieve = testUtils.getAPIHistoryLength();
            // AND a query that selects from local, shared and missing tables as well as a data view
            await File.copy(
                'test/mockRoot/retrieve/testInstance/testBU/query',
                'retrieve/testInstance/testBU/query'
            );

            // WHEN
            const warnings = captureWarnings();
            handler.setOptions({ dependencies: true, skipInteraction: true });
            let templateResult;
            try {
                templateResult = await handler.buildTemplate(
                    'testInstance/testBU',
                    'query',
                    ['testExisting_query_sqlDependencies', 'testExisting_query_SharedDE'],
                    ['testSourceMarket']
                );
            } finally {
                warnings.restore();
            }

            // THEN
            assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');
            assert.deepEqual(
                templateResult.query.map((item) => item.key).toSorted(),
                ['{{{prefix}}}query_SharedDE', '{{{prefix}}}query_sqlDependencies'],
                'expected both queries to be templated'
            );
            // target DE plus the DE from the JOIN, found by name regardless of case
            assert.deepEqual(
                templateResult.dataExtension.map((item) => item.CustomerKey).toSorted(),
                ['{{{prefix}}}dataExtension', '{{{prefix}}}dataExtension_exclusion'],
                'expected target (testExisting_dataExtension) and source (testExisting_dataExtension_exclusion) dataExtensions in the template result'
            );
            // shared DE from ENT. prefix keeps the existing warning and is not packaged;
            // it is also the target of the other query and must not be reported twice
            assert.equal(
                warnings.list.filter((msg) =>
                    msg.includes(
                        `dataExtension 'testExisting_dataExtensionShared' is a shared dataExtension stored in _ParentBU_`
                    )
                ).length,
                1,
                'expected one warning about the shared dataExtension'
            );
            // missing table is a visible warning with a summary; data view, comment and string are ignored
            const missingWarnings = warnings.list.filter((msg) =>
                msg.includes('testMissing_dataExtension')
            );
            assert.equal(missingWarnings.length, 1, 'expected one warning for the missing table');
            assert.include(
                missingWarnings[0],
                'query testExisting_query_sqlDependencies (testExisting_query_sqlDependencies): Table testMissing_dataExtension used in the SQL was not found as dataExtension on testInstance/testBU'
            );
            assert.isTrue(
                warnings.list.some((msg) =>
                    msg.startsWith(
                        '1 table used in the SQL of 1 query could not be resolved to a dataExtension'
                    )
                ),
                'expected summary warning for unresolved tables'
            );
            for (const ignored of ['_Subscribers', 'testCommented_', 'testString_']) {
                assert.isFalse(
                    warnings.list.some((msg) => msg.includes(ignored)),
                    `did not expect a warning about ${ignored}`
                );
            }
            // 4 requests for the ContentBlockByX search plus 3 for caching dataExtension names once for both queries
            assert.equal(
                testUtils.getAPIHistoryLength() - apiCallsRetrieve,
                7,
                'Unexpected number of requests for buildTemplate. Run testUtils.logAPIHistoryDebug() to see the requests'
            );

            // WHEN running again in the same process (e.g. VS Code extension), names are loaded again to see new dataExtensions
            await handler.buildTemplate(
                'testInstance/testBU',
                'query',
                ['testExisting_query_sqlDependencies'],
                ['testSourceMarket']
            );
            assert.equal(
                process.exitCode,
                0,
                'second buildTemplate should not have thrown an error'
            );
            assert.equal(
                testUtils.getAPIHistoryLength() - apiCallsRetrieve,
                14,
                'expected the dataExtension name cache to be rebuilt for the second run'
            );
            return;
        });

        it('Should warn when a table name in the SQL cannot be read', async () => {
            // GIVEN a query whose SQL contains template syntax broken by a formatter
            await handler.retrieve('testInstance/testBU', ['query']);
            await File.copy(
                'test/mockRoot/retrieve/testInstance/testBU/query',
                'retrieve/testInstance/testBU/query'
            );
            await File.writeFile(
                'retrieve/testInstance/testBU/query/testExisting_query_sqlDependencies.query-meta.sql',
                'SELECT a.ContactKey FROM { { { prefix } } }_Orders a'
            );

            // WHEN
            const warnings = captureWarnings();
            handler.setOptions({ dependencies: true, skipInteraction: true });
            try {
                await handler.buildTemplate(
                    'testInstance/testBU',
                    'query',
                    ['testExisting_query_sqlDependencies'],
                    ['testSourceMarket']
                );
            } finally {
                warnings.restore();
            }

            // THEN
            assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');
            assert.isTrue(
                warnings.list.some((msg) =>
                    msg.includes(
                        'query testExisting_query_sqlDependencies (testExisting_query_sqlDependencies): Could not read the table name in SQL near "FROM { { {"'
                    )
                ),
                'expected a warning about the unreadable table name'
            );
            return;
        });

        it('Should not cache dataExtension names when the SQL only uses data views', async () => {
            // GIVEN
            await handler.retrieve('testInstance/testBU', ['query']);
            const apiCallsRetrieve = testUtils.getAPIHistoryLength();

            // WHEN
            const warnings = captureWarnings();
            handler.setOptions({ dependencies: true, skipInteraction: true });
            let templateResult;
            try {
                templateResult = await handler.buildTemplate(
                    'testInstance/testBU',
                    'query',
                    ['testExisting_query'],
                    ['testSourceMarket']
                );
            } finally {
                warnings.restore();
            }

            // THEN
            assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');
            assert.equal(templateResult.query.length, 1, 'expected one query to be templated');
            assert.isFalse(
                warnings.list.some((msg) => msg.includes('used in the SQL')),
                'did not expect warnings about tables used in the SQL'
            );
            // only the 4 requests for the ContentBlockByX search that were made before this change
            assert.equal(
                testUtils.getAPIHistoryLength() - apiCallsRetrieve,
                4,
                'Unexpected number of requests for buildTemplate. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should resolve table names to dataExtension keys, preferring shared ones for ENT.', () => {
            const nameMap = {
                local: { 'customer data': 'local-key', orders: 'orders-key' },
                shared: { 'customer data': 'shared-key', products: 'products-key' },
            };
            assert.equal(
                Query._resolveTableName({ name: 'Customer Data', isEnt: false }, nameMap),
                'local-key'
            );
            assert.equal(
                Query._resolveTableName({ name: 'Customer Data', isEnt: true }, nameMap),
                'shared-key'
            );
            // fall back to the other list instead of reporting a false warning
            assert.equal(
                Query._resolveTableName({ name: 'ORDERS', isEnt: true }, nameMap),
                'orders-key'
            );
            assert.equal(
                Query._resolveTableName({ name: 'products', isEnt: false }, nameMap),
                'products-key'
            );
            assert.isUndefined(Query._resolveTableName({ name: 'missing', isEnt: false }, nameMap));
        });

        it('Should create a query template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['query']);
            // GIVEN there is a template
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'query',
                ['testExisting_query'],
                ['testSourceMarket']
            );
            // WHEN
            assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');

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
                await testUtils.getActualTemplateFile('testExisting_query', 'query', 'sql')
            ).to.equal(await testUtils.getExpectedFile('9999999', 'query', 'template', 'sql'));
            // THEN
            await handler.buildDefinition(
                'testInstance/testBU',
                'query',
                ['testExisting_query'],
                ['testTargetMarket']
            );
            assert.equal(process.exitCode, 0, 'buildDefinition should not have thrown an error');

            assert.deepEqual(
                await testUtils.getActualDeployJson('testTemplated_query', 'query'),
                await testUtils.getExpectedJson('9999999', 'query', 'build'),
                'returned deployment JSON was not equal expected'
            );
            expect(
                await testUtils.getActualDeployFile('testTemplated_query', 'query', 'sql')
            ).to.equal(await testUtils.getExpectedFile('9999999', 'query', 'build', 'sql'));

            assert.equal(
                testUtils.getAPIHistoryLength(),
                5,
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
            assert.equal(process.exitCode, 0, 'delete should not have thrown an error');

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
            assert.equal(process.exitCode, 0, 'getFilesToCommit should not have thrown an error');
            assert.equal(fileList.length, 2, 'expected only 2 file paths');

            assert.equal(
                fileList[0].replaceAll('\\', '/'),
                'retrieve/testInstance/testBU/query/testExisting_query.query-meta.json',
                'wrong JSON path'
            );
            assert.equal(
                fileList[1].replaceAll('\\', '/'),
                'retrieve/testInstance/testBU/query/testExisting_query.query-meta.sql',
                'wrong JSON path'
            );
            return;
        });
    });

    describe('Execute ================', () => {
        it('Should start a query by key', async () => {
            const executedKeys = await handler.execute(
                'testInstance/testBU',
                ['query'],
                ['testExisting_query']
            );
            assert.equal(process.exitCode, 0, 'execute should not have thrown an error');
            assert.equal(
                executedKeys['testInstance/testBU']?.query?.length,
                1,
                'returned number of keys does not correspond to number of expected fixed keys'
            );
            assert.equal(
                executedKeys['testInstance/testBU']?.query[0],
                'testExisting_query',
                'returned keys do not correspond to expected fixed keys'
            );
            return;
        });

        it('Should start a query selected via --like', async () => {
            handler.setOptions({ like: { key: 'testExist%query' } });
            const executedKeys = await handler.execute('testInstance/testBU', ['query']);
            assert.equal(process.exitCode, 0, 'execute should not have thrown an error');
            assert.equal(
                executedKeys['testInstance/testBU']?.query?.length,
                1,
                'returned number of keys does not correspond to number of expected fixed keys'
            );
            assert.equal(
                executedKeys['testInstance/testBU']?.query[0],
                'testExisting_query',
                'returned keys do not correspond to expected fixed keys'
            );
            return;
        });

        it('Should not start executing a query because key and --like was specified', async () => {
            handler.setOptions({ like: { key: 'testExisting%' } });
            const executedKeys = await handler.execute(
                'testInstance/testBU',
                ['query'],
                ['testExisting_query']
            );
            assert.equal(process.exitCode, 1, 'execute should have thrown an error');
            assert.equal(
                Object.keys(executedKeys).length,
                0,
                'query was not supposed to be executed'
            );
            return;
        });
    });
});
