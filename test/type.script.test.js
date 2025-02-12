import * as chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);

describe('type: script', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });

    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve all scripts', async () => {
            // WHEN
            const retrieve = await handler.retrieve('testInstance/testBU', ['script']);
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // retrieve result
            assert.equal(
                retrieve['testInstance/testBU'].script
                    ? Object.keys(retrieve['testInstance/testBU'].script).length
                    : 0,
                5,
                'only 5 scripts expected in retrieve response'
            );

            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.script ? Object.keys(result.script).length : 0,
                5,
                'only 5 scripts expected'
            );
            // normal test
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_script', 'script'),
                await testUtils.getExpectedJson('9999999', 'script', 'get'),
                'returned metadata with correct key was not equal expected'
            );
            expect(await testUtils.getActualFile('testExisting_script', 'script', 'html')).to.not
                .exist;
            expect(await testUtils.getActualFile('testExisting_script', 'script', 'ssjs')).to.equal(
                await testUtils.getExpectedFile('9999999', 'script', 'get', 'ssjs')
            );

            // test with no script tag
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_script_noScriptTag', 'script'),
                await testUtils.getExpectedJson('9999999', 'script', 'get_noScriptTag'),
                'returned metadata was not equal expected'
            );
            expect(
                await testUtils.getActualFile('testExisting_script_noScriptTag', 'script', 'html')
            ).to.equal(
                await testUtils.getExpectedFile('9999999', 'script', 'get_noScriptTag', 'html')
            );
            expect(
                await testUtils.getActualFile('testExisting_script_noScriptTag', 'script', 'ssjs')
            ).to.not.exist;

            // test with ampscript
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_script_ampscript', 'script'),
                await testUtils.getExpectedJson('9999999', 'script', 'get_ampscript'),
                'returned metadata was not equal expected'
            );
            expect(
                await testUtils.getActualFile('testExisting_script_ampscript', 'script', 'html')
            ).to.equal(
                await testUtils.getExpectedFile('9999999', 'script', 'get_ampscript', 'html')
            );
            expect(await testUtils.getActualFile('testExisting_script_ampscript', 'script', 'ssjs'))
                .to.not.exist;

            // test with mixed code (ampscript inside of ssjs)
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_script_ampincluded', 'script'),
                await testUtils.getExpectedJson('9999999', 'script', 'get_ampincluded'),
                'returned metadata was not equal expected'
            );
            expect(
                await testUtils.getActualFile('testExisting_script_ampincluded', 'script', 'ssjs')
            ).to.not.exist;
            expect(
                await testUtils.getActualFile('testExisting_script_ampincluded', 'script', 'html')
            ).to.equal(
                await testUtils.getExpectedFile('9999999', 'script', 'get_ampincluded', 'html')
            );

            // test with mixed code (ssjs and ampscript side-by-side)
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_script_mixed', 'script'),
                await testUtils.getExpectedJson('9999999', 'script', 'get_mixed'),
                'returned metadata was not equal expected'
            );
            expect(
                await testUtils.getActualFile('testExisting_script_mixed', 'script', 'html')
            ).to.equal(await testUtils.getExpectedFile('9999999', 'script', 'get_mixed', 'html'));
            expect(await testUtils.getActualFile('testExisting_script_mixed', 'script', 'ssjs')).to
                .not.exist;

            assert.equal(
                testUtils.getAPIHistoryLength(),
                2,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should retrieve one specific script by key', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['script'], ['testExisting_script']);
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.script ? Object.keys(result.script).length : 0,
                1,
                'only one script expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_script', 'script'),
                await testUtils.getExpectedJson('9999999', 'script', 'get'),
                'returned metadata was not equal expected'
            );
            expect(await testUtils.getActualFile('testExisting_script', 'script', 'html')).to.not
                .exist;
            expect(await testUtils.getActualFile('testExisting_script', 'script', 'ssjs')).to.equal(
                await testUtils.getExpectedFile('9999999', 'script', 'get', 'ssjs')
            );

            expect(
                await testUtils.getActualFile('testExisting_script_noScriptTag', 'script', 'json')
            ).to.not.exist;
            expect(
                await testUtils.getActualFile('testExisting_script_noScriptTag', 'script', 'ssjs')
            ).to.not.exist;
            expect(
                await testUtils.getActualFile('testExisting_script_noScriptTag', 'script', 'html')
            ).to.not.exist;

            assert.equal(
                testUtils.getAPIHistoryLength(),
                2,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should retrieve one specific script via --like', async () => {
            // WHEN
            handler.setOptions({ like: { key: '%Existing_script' } });
            await handler.retrieve('testInstance/testBU', ['script']);

            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');

            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.script ? Object.keys(result.script).length : 0,
                5,
                '5 scripts in cache expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_script', 'script'),
                await testUtils.getExpectedJson('9999999', 'script', 'get'),
                'returned metadata was not equal expected'
            );
            expect(await testUtils.getActualFile('testExisting_script', 'script', 'ssjs')).to.equal(
                await testUtils.getExpectedFile('9999999', 'script', 'get', 'ssjs')
            );

            expect(
                await testUtils.getActualFile('testExisting_script_noScriptTag', 'script', 'json')
            ).to.not.exist;
            expect(
                await testUtils.getActualFile('testExisting_script_noScriptTag', 'script', 'ssjs')
            ).to.not.exist;
            expect(
                await testUtils.getActualFile('testExisting_script_noScriptTag', 'script', 'html')
            ).to.not.exist;

            assert.equal(
                testUtils.getAPIHistoryLength(),
                2,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should not retrieve any script via --like and key due to a mismatching filter', async () => {
            // WHEN
            handler.setOptions({ like: { key: 'NotExisting_script' } });
            await handler.retrieve('testInstance/testBU', ['script']);
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');

            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.script ? Object.keys(result.script).length : 0,
                5,
                '5 scripts in cache expected'
            );

            expect(await testUtils.getActualFile('testExisting_script', 'script', 'ssjs')).to.not
                .exist;
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

        it('Should create & upsert a script', async () => {
            // WHEN
            await handler.deploy('testInstance/testBU', ['script']);
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.script ? Object.keys(result.script).length : 0,
                6,
                '6 scripts expected'
            );
            // confirm created item
            assert.deepEqual(
                await testUtils.getActualJson('testNew_script', 'script'),
                await testUtils.getExpectedJson('9999999', 'script', 'post'),
                'returned metadata was not equal expected for insert script'
            );
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_script', 'script'),
                await testUtils.getExpectedJson('9999999', 'script', 'patch'),
                'returned metadata was not equal expected for insert script'
            );
            expect(await testUtils.getActualFile('testExisting_script', 'script', 'html')).to.not
                .exist;
            expect(await testUtils.getActualFile('testExisting_script', 'script', 'ssjs')).to.equal(
                await testUtils.getExpectedFile('9999999', 'script', 'patch', 'ssjs')
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

    describe('Templating ================', () => {
        it('Should create a script template via retrieveAsTemplate and build it', async () => {
            // GIVEN there is a template
            const result = await handler.retrieveAsTemplate(
                'testInstance/testBU',
                'script',
                ['testExisting_script'],
                'testSourceMarket'
            );
            // WHEN
            assert.equal(process.exitCode, 0, 'retrieveAsTemplate should not have thrown an error');
            assert.equal(
                result.script ? Object.keys(result.script).length : 0,
                1,
                'only one script expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson('testExisting_script', 'script'),
                await testUtils.getExpectedJson('9999999', 'script', 'template'),
                'returned template JSON of retrieveAsTemplate was not equal expected'
            );
            expect(
                await testUtils.getActualTemplateFile('testExisting_script', 'script', 'ssjs')
            ).to.equal(await testUtils.getExpectedFile('9999999', 'script', 'template', 'ssjs'));
            // THEN
            await handler.buildDefinition(
                'testInstance/testBU',
                'script',
                ['testExisting_script'],
                ['testTargetMarket']
            );
            assert.equal(process.exitCode, 0, 'buildDefinition should not have thrown an error');

            assert.deepEqual(
                await testUtils.getActualDeployJson('testTemplated_script', 'script'),
                await testUtils.getExpectedJson('9999999', 'script', 'build'),
                'returned deployment JSON was not equal expected'
            );
            expect(
                await testUtils.getActualDeployFile('testTemplated_script', 'script', 'ssjs')
            ).to.equal(await testUtils.getExpectedFile('9999999', 'script', 'build', 'ssjs'));

            assert.equal(
                testUtils.getAPIHistoryLength(),
                2,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should create a script template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['script']);
            // GIVEN there is a template
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'script',
                ['testExisting_script'],
                ['testSourceMarket']
            );
            // WHEN
            assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');

            assert.equal(
                result.script ? Object.keys(result.script).length : 0,
                1,
                'only one script expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson('testExisting_script', 'script'),
                await testUtils.getExpectedJson('9999999', 'script', 'template'),
                'returned template JSON of buildTemplate was not equal expected'
            );
            expect(
                await testUtils.getActualTemplateFile('testExisting_script', 'script', 'ssjs')
            ).to.equal(await testUtils.getExpectedFile('9999999', 'script', 'template', 'ssjs'));
            // THEN
            await handler.buildDefinition(
                'testInstance/testBU',
                'script',
                ['testExisting_script'],
                ['testTargetMarket']
            );
            assert.equal(process.exitCode, 0, 'buildDefinition should not have thrown an error');

            assert.deepEqual(
                await testUtils.getActualDeployJson('testTemplated_script', 'script'),
                await testUtils.getExpectedJson('9999999', 'script', 'build'),
                'returned deployment JSON was not equal expected'
            );
            expect(
                await testUtils.getActualDeployFile('testTemplated_script', 'script', 'ssjs')
            ).to.equal(await testUtils.getExpectedFile('9999999', 'script', 'build', 'ssjs'));

            assert.equal(
                testUtils.getAPIHistoryLength(),
                2,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should create a script template via buildTemplate with --dependencies', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['script', 'asset']);

            handler.setOptions({ dependencies: true, skipInteraction: true });

            // GIVEN there is a template
            const templatedItems = await handler.buildTemplate(
                'testInstance/testBU',
                'script',
                ['testExisting_script_ampscript'],
                ['testSourceMarket']
            );
            // WHEN
            assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');

            assert.deepEqual(
                Object.keys(templatedItems),
                ['script', 'asset'],
                'expected specific types to be templated'
            );

            // script
            assert.deepEqual(
                templatedItems.script.map((item) => item.key),
                ['{{{prefix}}}script_ampscript'],
                'expected specific scripts to be templated'
            );
            // asset
            assert.deepEqual(
                templatedItems.asset.map((item) => item.customerKey),
                [
                    '{{{prefix}}}asset_htmlblock',
                    '{{{prefix}}}htmlblock 3 spaces',
                    '{{{prefix}}}htmlblock1',
                    '{{{prefix}}}htmlblock2',
                ],
                'expected specific assets to be templated'
            );
        });
    });

    describe('Delete ================', () => {
        it('Should delete the item', async () => {
            // WHEN
            const isDeleted = await handler.deleteByKey(
                'testInstance/testBU',
                'script',
                'testExisting_script'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deleteByKey should not have thrown an error');
            assert.equal(isDeleted, true, 'deleteByKey should have returned true');
            return;
        });
    });

    describe('CI/CD ================', () => {
        it('Should return a list of files based on their type and key', async () => {
            // WHEN
            const fileList = await handler.getFilesToCommit('testInstance/testBU', 'script', [
                'testExisting_script',
            ]);
            // THEN
            assert.equal(process.exitCode, 0, 'getFilesToCommit should not have thrown an error');
            assert.equal(fileList.length, 3, 'expected only 3 file paths (html, json, ssjs)');

            assert.equal(
                fileList[0].split('\\').join('/'),
                'retrieve/testInstance/testBU/script/testExisting_script.script-meta.json',
                'wrong JSON path'
            );
            assert.equal(
                fileList[1].split('\\').join('/'),
                'retrieve/testInstance/testBU/script/testExisting_script.script-meta.ssjs',
                'wrong SSJS path'
            );
            assert.equal(
                fileList[2].split('\\').join('/'),
                'retrieve/testInstance/testBU/script/testExisting_script.script-meta.html',
                'wrong HTML path'
            );
            return;
        });
    });

    describe('Execute ================', () => {});

    describe('ReplaceContentBlockByX ================', () => {
        it('Should replace references with ContentBlockByName w/o deploy', async () => {
            handler.setOptions({ skipDeploy: true });

            // WHEN
            const replace = await handler.replaceCbReference(
                'testInstance/testBU',
                {
                    script: null,
                },
                'name'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // retrieve result
            assert.deepEqual(
                replace['testInstance/testBU'].script,
                [
                    'testExisting_script_ampscript',
                    'testExisting_script_ampincluded',
                    'testExisting_script_mixed',
                ],
                'should have found the right scripts that need updating'
            );
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.script ? Object.keys(result.script).length : 0,
                5,
                'only 5 scripts expected'
            );
            // check if conversions happened
            expect(
                await testUtils.getActualFile('testExisting_script_ampscript', 'script', 'html')
            ).to.equal(
                await testUtils.getExpectedFile(
                    '9999999',
                    'script',
                    'get_ampscript-rcb-name',
                    'html'
                )
            );
            expect(await testUtils.getActualFile('testExisting_script_ampscript', 'script', 'ssjs'))
                .to.not.exist;

            expect(
                await testUtils.getActualFile('testExisting_script_ampincluded', 'script', 'html')
            ).to.equal(
                await testUtils.getExpectedFile(
                    '9999999',
                    'script',
                    'get_ampincluded-rcb-name',
                    'html'
                )
            );
            expect(
                await testUtils.getActualFile('testExisting_script_ampincluded', 'script', 'ssjs')
            ).to.not.exist;

            expect(
                await testUtils.getActualFile('testExisting_script_mixed', 'script', 'html')
            ).to.equal(
                await testUtils.getExpectedFile('9999999', 'script', 'get_mixed-rcb-name', 'html')
            );
            expect(await testUtils.getActualFile('testExisting_script_mixed', 'script', 'ssjs')).to
                .not.exist;

            assert.equal(
                testUtils.getAPIHistoryLength(),
                8,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should replace references with ContentBlockById w/o deploy', async () => {
            handler.setOptions({ skipDeploy: true });

            // WHEN
            const replace = await handler.replaceCbReference(
                'testInstance/testBU',
                {
                    script: null,
                },
                'id'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // retrieve result
            assert.deepEqual(
                replace['testInstance/testBU'].script,
                ['testExisting_script_ampscript', 'testExisting_script_mixed'],
                'should have found the right scripts that need updating'
            );

            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.script ? Object.keys(result.script).length : 0,
                5,
                'only 5 scripts expected'
            );
            // check if conversions happened
            expect(
                await testUtils.getActualFile('testExisting_script_ampscript', 'script', 'html')
            ).to.equal(
                await testUtils.getExpectedFile('9999999', 'script', 'get_ampscript-rcb-id', 'html')
            );
            expect(await testUtils.getActualFile('testExisting_script_ampscript', 'script', 'ssjs'))
                .to.not.exist;

            expect(
                await testUtils.getActualFile('testExisting_script_ampincluded', 'script', 'html')
            ).to.equal(
                await testUtils.getExpectedFile(
                    '9999999',
                    'script',
                    'get_ampincluded-rcb-id',
                    'html'
                )
            );
            expect(
                await testUtils.getActualFile('testExisting_script_ampincluded', 'script', 'ssjs')
            ).to.not.exist;

            expect(
                await testUtils.getActualFile('testExisting_script_mixed', 'script', 'html')
            ).to.equal(
                await testUtils.getExpectedFile('9999999', 'script', 'get_mixed-rcb-id', 'html')
            );
            expect(await testUtils.getActualFile('testExisting_script_mixed', 'script', 'ssjs')).to
                .not.exist;

            assert.equal(
                testUtils.getAPIHistoryLength(),
                8,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should replace references with ContentBlockByKey w/o deploy', async () => {
            handler.setOptions({ skipDeploy: true });

            // WHEN
            const replace = await handler.replaceCbReference(
                'testInstance/testBU',
                {
                    script: null,
                },
                'key'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // retrieve result
            assert.deepEqual(
                replace['testInstance/testBU'].script,
                ['testExisting_script_ampscript', 'testExisting_script_ampincluded'],
                'should have found the right scripts that need updating'
            );

            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.script ? Object.keys(result.script).length : 0,
                5,
                'only 5 scripts expected'
            );
            // check if conversions happened
            expect(
                await testUtils.getActualFile('testExisting_script_ampscript', 'script', 'html')
            ).to.equal(
                await testUtils.getExpectedFile(
                    '9999999',
                    'script',
                    'get_ampscript-rcb-key',
                    'html'
                )
            );
            expect(await testUtils.getActualFile('testExisting_script_ampscript', 'script', 'ssjs'))
                .to.not.exist;

            expect(
                await testUtils.getActualFile('testExisting_script_ampincluded', 'script', 'html')
            ).to.equal(
                await testUtils.getExpectedFile(
                    '9999999',
                    'script',
                    'get_ampincluded-rcb-key',
                    'html'
                )
            );
            expect(
                await testUtils.getActualFile('testExisting_script_ampincluded', 'script', 'ssjs')
            ).to.not.exist;

            expect(
                await testUtils.getActualFile('testExisting_script_mixed', 'script', 'html')
            ).to.equal(
                await testUtils.getExpectedFile('9999999', 'script', 'get_mixed-rcb-key', 'html')
            );
            expect(await testUtils.getActualFile('testExisting_script_mixed', 'script', 'ssjs')).to
                .not.exist;

            assert.equal(
                testUtils.getAPIHistoryLength(),
                8,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
});
