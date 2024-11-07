import * as chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);

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
                4,
                'only 4 queries expected'
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

        it('Should retrieve one specific query by key', async () => {
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
                4,
                '4 queries in cache expected'
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
                4,
                '4 queries in cache expected'
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
                5,
                '5 queries expected in cache'
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
                39,
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
                41,
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
        it('Should create a query template via retrieveAsTemplate and build it', async () => {
            // GIVEN there is a template
            const result = await handler.retrieveAsTemplate(
                'testInstance/testBU',
                'query',
                ['testExisting_query'],
                'testSourceMarket'
            );
            // WHEN
            assert.equal(process.exitCode, 0, 'retrieveAsTemplate should not have thrown an error');
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
