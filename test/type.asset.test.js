import File from '../lib/util/file.js';

import * as chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);

/**
 * gets file from Retrieve folder
 *
 * @param {string} customerKey of metadata
 * @param {string} type of metadata
 * @param {string} subtype of metadata
 * @param {string} [buName] used when we need to test on ParentBU
 * @returns {Promise.<string>} file in string form
 */
async function getActualJson(customerKey, type, subtype, buName = 'testBU') {
    try {
        return await File.readJSON(
            `./retrieve/testInstance/${buName}/${type}/${subtype}/${customerKey}.${type}-${subtype}-meta.json`
        );
    } catch {
        return await File.readJSON(
            `./retrieve/testInstance/${buName}/${type}/${subtype}/${customerKey}/${customerKey}.${type}-${subtype}-meta.json`
        );
    }
}
/**
 * gets file from Retrieve folder
 *
 * @param {string} customerKey of metadata
 * @param {string} type of metadata
 * @param {string} subtype of metadata
 * @param {string} ext file extension
 * @param {string} [filename] optional fileprefix that differs from customerKey
 * @param {string} [buName] used when we need to test on ParentBU
 * @returns {Promise.<string | null>} file path
 */
async function getActualFile(customerKey, type, subtype, ext, filename, buName = 'testBU') {
    const path = `./retrieve/testInstance/${buName}/${type}/${subtype}/${customerKey}.${type}-${subtype}-meta.${ext}`;
    const pathSub = `./retrieve/testInstance/${buName}/${type}/${subtype}/${customerKey}/${filename}.${type}-${subtype}-meta.${ext}`;

    try {
        return await File.readFile(filename ? pathSub : path, 'utf8');
    } catch {
        console.log(`File not found: ${filename ? pathSub : path}`); // eslint-disable-line no-console
        return null;
    }
}
/**
 * gets file from Template folder
 *
 * @param {string} customerKey of metadata
 * @param {string} type of metadata
 * @param {string} subtype of metadata
 * @returns {Promise.<string>} file in string form
 */
async function getActualTemplateJson(customerKey, type, subtype) {
    try {
        return await File.readJSON(
            `./template/${type}/${subtype}/${customerKey}.${type}-${subtype}-meta.json`
        );
    } catch {
        return await File.readJSON(
            `./template/${type}/${subtype}/${customerKey}/${customerKey}.${type}-${subtype}-meta.json`
        );
    }
}
/**
 * gets file from Template folder
 *
 * @param {string} customerKey of metadata
 * @param {string} type of metadata
 * @param {string} subtype of metadata
 * @param {string} ext file extension
 * @param {string} [filename] optional fileprefix that differs from customerKey
 * @returns {Promise.<string | undefined>} file
 */
async function getActualTemplateFile(customerKey, type, subtype, ext, filename) {
    const path = `./template/${type}/${subtype}/${customerKey}.${type}-${subtype}-meta.${ext}`;
    const pathSub = `./template/${type}/${subtype}/${customerKey}/${filename}.${type}-${subtype}-meta.${ext}`;

    try {
        return File.readFile(filename ? pathSub : path, 'utf8');
    } catch {
        console.log(`File not found: ${filename ? pathSub : path}`); // eslint-disable-line no-console
        return;
    }
}

/**
 * gets file from Deploy folder
 *
 * @param {string} customerKey of metadata
 * @param {string} type of metadata
 * @param {string} subtype of metadata
 * @param {string} [buName] used when we need to test on ParentBU
 * @returns {Promise.<string>} file in string form
 */
async function getActualDeployJson(customerKey, type, subtype, buName = 'testBU') {
    try {
        return await File.readJSON(
            `./deploy/testInstance/${buName}/${type}/${subtype}/${customerKey}.${type}-${subtype}-meta.json`
        );
    } catch {
        return await File.readJSON(
            `./deploy/testInstance/${buName}/${type}/${subtype}/${customerKey}/${customerKey}.${type}-${subtype}-meta.json`
        );
    }
}
/**
 * gets file from Deploy folder
 *
 * @param {string} customerKey of metadata
 * @param {string} type of metadata
 * @param {string} subtype of metadata
 * @param {string} ext file extension
 * @param {string} [filename] optional fileprefix that differs from customerKey
 * @param {string} [buName] used when we need to test on ParentBU
 * @returns {Promise.<string | undefined>} file content
 */
async function getActualDeployFile(customerKey, type, subtype, ext, filename, buName = 'testBU') {
    const path = `./deploy/testInstance/${buName}/${type}/${subtype}/${customerKey}.${type}-${subtype}-meta.${ext}`;
    const pathSub = `./deploy/testInstance/${buName}/${type}/${subtype}/${customerKey}/${filename}.${type}-${subtype}-meta.${ext}`;

    try {
        return File.readFile(filename ? pathSub : path, 'utf8');
    } catch {
        console.log(`File not found: ${filename ? pathSub : path}`); // eslint-disable-line no-console
        return;
    }
}

describe('type: asset', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });

    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a asset & ensure non-ssjs code is not removed', async () => {
            // WHEN
            const retrieve = await handler.retrieve('testInstance/testBU', ['asset']);

            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            assert.equal(
                retrieve['testInstance/testBU'].asset
                    ? Object.keys(retrieve['testInstance/testBU'].asset).length
                    : 0,
                9,
                'Unexpected number of assets in retrieve response'
            );
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.asset ? Object.keys(result.asset).length : 0,
                9,
                'Unexpected number of assets in cache'
            );

            assert.deepEqual(
                await getActualJson('testExisting_asset_htmlblock', 'asset', 'block'),
                await testUtils.getExpectedJson(
                    '9999999',
                    'asset',
                    'testExisting_asset_htmlblock-retrieve'
                ),
                'returned metadata was not equal expected'
            );
            expect(
                await getActualFile('testExisting_asset_htmlblock', 'asset', 'block', 'html')
            ).to.equal(
                await testUtils.getExpectedFile(
                    '9999999',
                    'asset',
                    'testExisting_asset_htmlblock-retrieve',
                    'html'
                )
            );

            assert.deepEqual(
                await getActualJson('testExisting_asset_templatebasedemail', 'asset', 'message'),
                await testUtils.getExpectedJson('9999999', 'asset', 'retrieve-templatebasedemail'),
                'returned metadata was not equal expected'
            );
            expect(
                await getActualFile(
                    'testExisting_asset_templatebasedemail',
                    'asset',
                    'message',
                    'html',
                    'views.html.content'
                )
            ).to.equal(
                await testUtils.getExpectedFile(
                    '9999999',
                    'asset',
                    'retrieve-templatebasedemail-html',
                    'html'
                )
            );
            expect(
                await getActualFile(
                    'testExisting_asset_templatebasedemail',
                    'asset',
                    'message',
                    'amp',
                    'views.preheader.content'
                )
            ).to.equal(
                await testUtils.getExpectedFile(
                    '9999999',
                    'asset',
                    'retrieve-templatebasedemail-preheader',
                    'amp'
                )
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                22,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should retrieve a asset by key', async () => {
            // WHEN
            const retrieve = await handler.retrieve(
                'testInstance/testBU',
                ['asset'],
                ['testExisting_asset_htmlblock']
            );

            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            assert.equal(
                retrieve['testInstance/testBU'].asset
                    ? Object.keys(retrieve['testInstance/testBU'].asset).length
                    : 0,
                1,
                'Unexpected number of assets in retrieve response'
            );
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.asset ? Object.keys(result.asset).length : 0,
                7,
                'Unexpected number of assets in cache'
            );

            assert.deepEqual(
                await getActualJson('testExisting_asset_htmlblock', 'asset', 'block'),
                await testUtils.getExpectedJson(
                    '9999999',
                    'asset',
                    'testExisting_asset_htmlblock-retrieve'
                ),
                'returned metadata was not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                8,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Deploy ================', () => {
        beforeEach(() => {
            testUtils.mockSetup(true);
        });

        it('Should create an asset with mis-matching memberId, automatically adding the MID suffix', async () => {
            handler.setOptions({ autoMidSuffix: true });
            // WHEN
            const deployResult = await handler.deploy(
                'testInstance/testBU',
                ['asset'],
                ['testNew_asset']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');

            // check how many items were deployed
            assert.equal(
                deployResult['testInstance/testBU']?.asset
                    ? Object.keys(deployResult['testInstance/testBU']?.asset).length
                    : 0,
                1,
                '1 assets to be deployed'
            );
            const upsertCallout = testUtils.getRestCallout('post', '/asset/v1/content/assets/');
            assert.equal(
                upsertCallout?.customerKey,
                'testNew_asset-9999999',
                'customerKey should be testNew_asset-9999999 due to --autoMidSuffix'
            );

            // insert
            assert.deepEqual(
                await getActualJson('testNew_asset-9999999', 'asset', 'block'),
                await testUtils.getExpectedJson('9999999', 'asset', 'create'),
                'returned metadata was not equal expected for create'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                5,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should update an asset with --matchName', async () => {
            handler.setOptions({ matchName: true });
            // WHEN
            const deployResult = await handler.deploy(
                'testInstance/testBU',
                ['asset'],
                ['testExisting_asset_htmlblock-matchName']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');

            // check how many items were deployed
            assert.equal(
                deployResult['testInstance/testBU']?.asset
                    ? Object.keys(deployResult['testInstance/testBU']?.asset).length
                    : 0,
                1,
                '1 assets to be deployed'
            );
            const currentCache = cache.getCache();

            const upsertCallout = testUtils.getRestCallout(
                'patch',
                '/asset/v1/content/assets/1295064'
            );
            assert.equal(
                upsertCallout?.customerKey,
                'testExisting_asset_htmlblock-matchName',
                'customerKey should be testExisting_asset_htmlblock-matchName'
            );
            assert.equal(
                upsertCallout?.id,
                currentCache.asset['testExisting_asset_htmlblock'].id,
                'id should be that of the existing testExisting_asset_htmlblock'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                5,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should not update an asset with --matchName due to multiple potential matches', async () => {
            handler.setOptions({ matchName: true });
            // WHEN
            const deployResult = await handler.deploy(
                'testInstance/testBU',
                ['asset'],
                ['testExisting_asset_htmlblock-matchName-fail']
            );
            // THEN
            assert.equal(process.exitCode, 1, 'deploy should have thrown an error');

            // check how many items were deployed
            assert.equal(
                deployResult['testInstance/testBU']?.asset
                    ? Object.keys(deployResult['testInstance/testBU']?.asset).length
                    : 0,
                0,
                '0 assets to be deployed'
            );

            const upsertCallout = testUtils.getRestCallout('patch', '/asset/v1/content/assets/%');
            assert.equal(upsertCallout, null, 'there should have been no patch');

            assert.equal(
                testUtils.getAPIHistoryLength(),
                4,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should create an asset with --matchName because it found no match', async () => {
            handler.setOptions({ matchName: true });
            // WHEN
            const deployResult = await handler.deploy(
                'testInstance/testBU',
                ['asset'],
                ['testExisting_asset_htmlblock-matchName-create']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');

            // check how many items were deployed
            assert.equal(
                deployResult['testInstance/testBU']?.asset
                    ? Object.keys(deployResult['testInstance/testBU']?.asset).length
                    : 0,
                1,
                '1 assets to be deployed'
            );

            const upsertCallout = testUtils.getRestCallout('post', '/asset/v1/content/assets/');
            assert.equal(
                upsertCallout?.customerKey,
                'testExisting_asset_htmlblock-matchName-create',
                'asset.customerKey should be testExisting_asset_htmlblock-matchName-create'
            );
            assert.equal(
                upsertCallout?.id,
                undefined,
                'asset.id should not be set as we are in a create call'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                5,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should create an asset with mis-matching memberId and --keySuffix', async () => {
            handler.setOptions({ keySuffix: '_DEV' });
            // WHEN
            const deployResult = await handler.deploy(
                'testInstance/testBU',
                ['asset'],
                ['testNew_asset']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');

            // check how many items were deployed
            assert.equal(
                deployResult['testInstance/testBU']?.asset
                    ? Object.keys(deployResult['testInstance/testBU']?.asset).length
                    : 0,
                1,
                '1 assets to be deployed'
            );
            const upsertCallout = testUtils.getRestCallout('post', '/asset/v1/content/assets/');
            assert.equal(
                upsertCallout?.customerKey,
                'testNew_asset_DEV',
                'customerKey should be testNew_asset_DEV due to --keySuffix'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                5,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should create an asset with mis-matching memberId', async () => {
            // WHEN
            const deployResult = await handler.deploy(
                'testInstance/testBU',
                ['asset'],
                ['testNew_asset']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');

            // check how many items were deployed
            assert.equal(
                deployResult['testInstance/testBU']?.asset
                    ? Object.keys(deployResult['testInstance/testBU']?.asset).length
                    : 0,
                1,
                '1 assets to be deployed'
            );
            const upsertCallout = testUtils.getRestCallout('post', '/asset/v1/content/assets/');
            assert.equal(
                upsertCallout?.customerKey,
                'testNew_asset',
                'customerKey should be testNew_asset'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                5,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Templating ================', () => {
        it('Should create a asset template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['asset']);

            const expectedApiCallsRetrieve = 22;
            assert.equal(
                testUtils.getAPIHistoryLength(),
                expectedApiCallsRetrieve,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );

            // GIVEN there is a template
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'asset',
                ['testExisting_asset_templatebasedemail', 'testExisting_asset_htmlblock'],
                'testSourceMarket'
            );
            // WHEN
            assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');
            assert.equal(
                result.asset ? Object.keys(result.asset).length : 0,
                2,
                'unexpected number of assets templated'
            );

            // testExisting_asset_templatebasedemail
            assert.deepEqual(
                await getActualTemplateJson(
                    'testExisting_asset_templatebasedemail',
                    'asset',
                    'message'
                ),
                await testUtils.getExpectedJson('9999999', 'asset', 'template-templatebasedemail'),
                'returned template JSON of buildTemplate was not equal expected'
            );
            expect(
                await getActualTemplateFile(
                    'testExisting_asset_templatebasedemail',
                    'asset',
                    'message',
                    'html',
                    'views.html.content'
                )
            ).to.equal(
                await testUtils.getExpectedFile(
                    '9999999',
                    'asset',
                    'template-templatebasedemail-html',
                    'html'
                )
            );
            expect(
                await getActualTemplateFile(
                    'testExisting_asset_templatebasedemail',
                    'asset',
                    'message',
                    'amp',
                    'views.preheader.content'
                )
            ).to.equal(
                await testUtils.getExpectedFile(
                    '9999999',
                    'asset',
                    'template-templatebasedemail-preheader',
                    'amp'
                )
            );

            const definitions = await handler.buildDefinition(
                'testInstance/testBU',
                'asset',
                ['testExisting_asset_templatebasedemail', 'testExisting_asset_htmlblock'],
                'testTargetMarket'
            );
            assert.equal(process.exitCode, 0, 'buildDefinition should not have thrown an error');
            assert.equal(
                definitions.asset ? Object.keys(definitions.asset).length : 0,
                2,
                'unexpected number of assets templated'
            );

            // testTemplated_asset_templatebasedemail
            assert.deepEqual(
                await getActualDeployJson(
                    'testTemplated_asset_templatebasedemail',
                    'asset',
                    'message'
                ),
                await testUtils.getExpectedJson('9999999', 'asset', 'build-templatebasedemail'),
                'returned deployment JSON was not equal expected'
            );
            expect(
                await getActualDeployFile(
                    'testTemplated_asset_templatebasedemail',
                    'asset',
                    'message',
                    'html',
                    'views.html.content'
                )
            ).to.equal(
                await testUtils.getExpectedFile(
                    '9999999',
                    'asset',
                    'build-templatebasedemail-html',
                    'html'
                )
            );
            expect(
                await getActualDeployFile(
                    'testTemplated_asset_templatebasedemail',
                    'asset',
                    'message',
                    'amp',
                    'views.preheader.content'
                )
            ).to.equal(
                await testUtils.getExpectedFile(
                    '9999999',
                    'asset',
                    'build-templatebasedemail-preheader',
                    'amp'
                )
            );

            // testTemplated_asset_htmlblock
            assert.deepEqual(
                await getActualDeployJson('testTemplated_asset_htmlblock', 'asset', 'block'),
                await testUtils.getExpectedJson('9999999', 'asset', 'build-asset_htmlblock'),
                'returned deployment JSON was not equal expected'
            );
            expect(
                await getActualDeployFile('testTemplated_asset_htmlblock', 'asset', 'block', 'html')
            ).to.equal(
                await testUtils.getExpectedFile('9999999', 'asset', 'build-asset_htmlblock', 'html')
            );

            assert.equal(
                testUtils.getAPIHistoryLength() - expectedApiCallsRetrieve,
                0,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should create a asset template via buildTemplate with --dependencies', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['asset']);

            const expectedApiCallsRetrieve = 22;
            assert.equal(
                testUtils.getAPIHistoryLength(),
                expectedApiCallsRetrieve,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            handler.setOptions({ dependencies: true, skipInteraction: true });

            // GIVEN there is a template
            const templatedItems = await handler.buildTemplate(
                'testInstance/testBU',
                'asset',
                ['testExisting_asset_templatebasedemail'],
                'testSourceMarket'
            );
            // WHEN
            assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');
            assert.equal(
                templatedItems.asset ? templatedItems.asset.length : 0,
                6,
                'Unexpted number of assets templated'
            );
            assert.deepEqual(
                templatedItems.asset.map((item) => item.customerKey),
                [
                    '{{{prefix}}}asset_templatebasedemail',
                    '{{{prefix}}}asset_template',
                    '{{{prefix}}}asset_htmlblock',
                    '{{{prefix}}}htmlblock1',
                    '{{{prefix}}}htmlblock 3 spaces',
                    '{{{prefix}}}htmlblock2',
                ],
                'expected specific assets to be templated'
            );

            // testExisting_asset_templatebasedemail
            assert.deepEqual(
                await getActualTemplateJson(
                    'testExisting_asset_templatebasedemail',
                    'asset',
                    'message'
                ),
                await testUtils.getExpectedJson('9999999', 'asset', 'template-templatebasedemail'),
                'returned template JSON of buildTemplate was not equal expected'
            );

            expect(
                await getActualTemplateFile(
                    'testExisting_asset_templatebasedemail',
                    'asset',
                    'message',
                    'html',
                    'views.html.content'
                )
            ).to.equal(
                await testUtils.getExpectedFile(
                    '9999999',
                    'asset',
                    'template-templatebasedemail-html',
                    'html'
                )
            );
            expect(
                await getActualTemplateFile(
                    'testExisting_asset_templatebasedemail',
                    'asset',
                    'message',
                    'amp',
                    'views.preheader.content'
                )
            ).to.equal(
                await testUtils.getExpectedFile(
                    '9999999',
                    'asset',
                    'template-templatebasedemail-preheader',
                    'amp'
                )
            );

            // testExisting_asset_template
            assert.deepEqual(
                await getActualTemplateJson('testExisting_asset_template', 'asset', 'template'),
                await testUtils.getExpectedJson('9999999', 'asset', 'template-emailTemplate'),
                'returned template JSON of buildTemplate was not equal expected'
            );

            // testExisting_asset_htmlblock
            assert.deepEqual(
                await getActualTemplateJson('testExisting_asset_htmlblock', 'asset', 'block'),
                await testUtils.getExpectedJson(
                    '9999999',
                    'asset',
                    'template-testExisting_asset_htmlblock'
                ),
                'returned template JSON of buildTemplate was not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength() - expectedApiCallsRetrieve,
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
                'asset',
                'testExisting_asset'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deleteByKey should not have thrown an error');
            assert.equal(isDeleted, true, 'deleteByKey should have returned true');
            return;
        });
    });

    describe('ResolveID ================', () => {
        it('Should resolve the id of the item but NOT find the asset locally', async () => {
            // WHEN
            const resolveIdJson = await handler.resolveId(
                'testInstance/testBU',
                'asset',
                '1295064'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'resolveId should not have thrown an error');
            assert.deepEqual(
                resolveIdJson,
                await testUtils.getExpectedJson('9999999', 'asset', 'resolveId-1295064-noPath'),
                'returned response was not equal expected'
            );
            return;
        });

        it('Should resolve the id with --json option enabled', async () => {
            handler.setOptions({ json: true });
            // WHEN
            await handler.resolveId('testInstance/testBU', 'asset', '1295064');
            // THEN
            assert.equal(process.exitCode, 0, 'resolveId should not have thrown an error');
            return;
        });

        it('Should resolve the id of the item AND find the asset locally', async () => {
            // prep test by retrieving the file
            await handler.retrieve(
                'testInstance/testBU',
                ['asset-block'],
                ['testExisting_asset_htmlblock']
            );
            // WHEN
            const resolveIdJson = await handler.resolveId(
                'testInstance/testBU',
                'asset',
                '1295064'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'resolveId should not have thrown an error');
            assert.deepEqual(
                resolveIdJson,
                await testUtils.getExpectedJson('9999999', 'asset', 'resolveId-1295064-withPath'),
                'returned response was not equal expected'
            );
            return;
        });

        it('Should NOT resolve the id of the item', async () => {
            // WHEN
            const resolveIdJson = await handler.resolveId('testInstance/testBU', 'asset', '-1234');
            // THEN
            assert.equal(process.exitCode, 404, 'resolveId should have thrown an error');
            // IMPORTANT: this will throw a false "TEST-ERROR" but our testing framework currently needs to not find the file to throw a 404
            assert.deepEqual(
                resolveIdJson,
                await testUtils.getExpectedJson('9999999', 'asset', 'resolveId-1234-notFound'),
                'returned response was not equal expected'
            );
            return;
        });
    });

    describe('ReplaceContentBlockByX ================', () => {
        it('Should replace references with ContentBlockByName w/o deploy', async () => {
            handler.setOptions({ skipDeploy: true });

            // WHEN
            const replace = await handler.replaceCbReference(
                'testInstance/testBU',
                {
                    asset: null,
                },
                'name'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // retrieve result
            assert.deepEqual(
                replace['testInstance/testBU'].asset,
                [
                    'testExisting_asset_htmlblock',
                    'testExisting_htmlblock1',
                    'testExisting_htmlblock 3 spaces',
                    'testExisting_asset_message',
                ],
                'should have found the right assets that need updating'
            );
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.asset ? Object.keys(result.asset).length : 0,
                9,
                'Unexpected number of assets in cache'
            );
            // check if conversions happened
            expect(
                await getActualFile(
                    'testExisting_asset_message',
                    'asset',
                    'message',
                    'html',
                    'views.html.content'
                )
            ).to.equal(
                await testUtils.getExpectedFile(
                    '9999999',
                    'asset',
                    'testExisting_asset_message-html-rcb-name',
                    'html'
                )
            );
            expect(
                await getActualFile(
                    'testExisting_asset_message',
                    'asset',
                    'message',
                    'amp',
                    'views.preheader.content'
                )
            ).to.equal(
                await testUtils.getExpectedFile(
                    '9999999',
                    'asset',
                    'testExisting_asset_message-preheader-rcb-name',
                    'amp'
                )
            );
            expect(
                await getActualFile(
                    'testExisting_asset_message',
                    'asset',
                    'message',
                    'amp',
                    'views.text.content'
                )
            ).to.equal(
                await testUtils.getExpectedFile(
                    '9999999',
                    'asset',
                    'testExisting_asset_message-text-rcb-name',
                    'amp'
                )
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                24,
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
                    asset: null,
                },
                'id'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // retrieve result
            assert.deepEqual(
                replace['testInstance/testBU'].asset,
                [
                    'testExisting_htmlblock1',
                    'testExisting_htmlblock 3 spaces',
                    'testExisting_asset_message',
                ],
                'should have found the right assets that need updating'
            );
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.asset ? Object.keys(result.asset).length : 0,
                9,
                'Unexpected number of assets in cache'
            );
            // check if conversions happened
            expect(
                await getActualFile(
                    'testExisting_asset_message',
                    'asset',
                    'message',
                    'html',
                    'views.html.content'
                )
            ).to.equal(
                await testUtils.getExpectedFile(
                    '9999999',
                    'asset',
                    'testExisting_asset_message-html-rcb-id',
                    'html'
                )
            );
            expect(
                await getActualFile(
                    'testExisting_asset_message',
                    'asset',
                    'message',
                    'amp',
                    'views.preheader.content'
                )
            ).to.equal(
                await testUtils.getExpectedFile(
                    '9999999',
                    'asset',
                    'testExisting_asset_message-preheader-rcb-id',
                    'amp'
                )
            );
            expect(
                await getActualFile(
                    'testExisting_asset_message',
                    'asset',
                    'message',
                    'amp',
                    'views.text.content'
                )
            ).to.equal(
                await testUtils.getExpectedFile(
                    '9999999',
                    'asset',
                    'testExisting_asset_message-text-rcb-id',
                    'amp'
                )
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                24,
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
                    asset: null,
                },
                'key'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // retrieve result
            assert.deepEqual(
                replace['testInstance/testBU'].asset,
                [
                    'testExisting_asset_htmlblock',
                    'testExisting_htmlblock1',
                    'testExisting_asset_message',
                ],
                'should have found the right assets that need updating'
            );
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.asset ? Object.keys(result.asset).length : 0,
                9,
                'Unexpected number of assets in cache'
            );
            // check if conversions happened
            expect(
                await getActualFile(
                    'testExisting_asset_message',
                    'asset',
                    'message',
                    'html',
                    'views.html.content'
                )
            ).to.equal(
                await testUtils.getExpectedFile(
                    '9999999',
                    'asset',
                    'testExisting_asset_message-html-rcb-key',
                    'html'
                )
            );
            expect(
                await getActualFile(
                    'testExisting_asset_message',
                    'asset',
                    'message',
                    'amp',
                    'views.preheader.content'
                )
            ).to.equal(
                await testUtils.getExpectedFile(
                    '9999999',
                    'asset',
                    'testExisting_asset_message-preheader-rcb-key',
                    'amp'
                )
            );
            expect(
                await getActualFile(
                    'testExisting_asset_message',
                    'asset',
                    'message',
                    'amp',
                    'views.text.content'
                )
            ).to.equal(
                await testUtils.getExpectedFile(
                    '9999999',
                    'asset',
                    'testExisting_asset_message-text-rcb-key',
                    'amp'
                )
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                24,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
});
