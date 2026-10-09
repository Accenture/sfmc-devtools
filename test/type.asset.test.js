import File from '../lib/util/file.js';

import * as chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import config from '../lib/util/config.js';
import Cli from '../lib/util/cli.js';
import Asset from '../lib/metadataTypes/Asset.js';
import Folder from '../lib/metadataTypes/Folder.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);

/**
 * adds the given entries of assets-pool-shared.json to the asset pool (removing the others);
 * all other pool entries become local-only so that the shared-assets query returns only these
 *
 * @param {...number} ids ids of entries in assets-pool-shared.json
 * @returns {Promise.<void>} -
 */
async function shareAssets(...ids) {
    const folder = 'test/resources/9999999/asset/v1/content/assets/';
    const pool = await File.readJSON(folder + 'assets-pool.json');
    const shared = await File.readJSON(folder + 'assets-pool-shared.json');
    for (const entry of Object.values(pool)) {
        entry.queryScope ||= 'local';
    }
    for (const id of Object.keys(shared)) {
        if (ids.includes(Number(id))) {
            pool[id] = shared[id];
        } else {
            delete pool[id];
        }
    }
    await File.writeJSON(folder + 'assets-pool.json', pool);
}

/**
 * gets file from Retrieve folder
 *
 * @param {string} customerKey of metadata
 * @param {string} type of metadata
 * @param {string} subtype of metadata
 * @param {string} [buName] used when we need to test on ParentBU
 * @returns {Promise.<ReturnType<JSON['parse']>>} file in string form
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
 * @returns {Promise.<object>} parsed template JSON
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
                16,
                'Unexpected number of assets in retrieve response'
            );
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.asset ? Object.keys(result.asset).length : 0,
                19,
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
                await getActualJson('testExisting_asset_templatebasedemail', 'asset', 'email'),
                await testUtils.getExpectedJson('9999999', 'asset', 'retrieve-templatebasedemail'),
                'returned metadata was not equal expected'
            );
            expect(
                await getActualFile(
                    'testExisting_asset_templatebasedemail',
                    'asset',
                    'email',
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
                    'email',
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

            assert.deepEqual(
                await getActualJson('test_coderesource_js', 'asset', 'webstudio'),
                await testUtils.getExpectedJson(
                    '9999999',
                    'asset',
                    'test_coderesource_js-retrieve'
                ),
                'returned metadata was not equal expected'
            );
            expect(
                await getActualFile('test_coderesource_js', 'asset', 'webstudio', 'js')
            ).to.equal(
                await testUtils.getExpectedFile(
                    '9999999',
                    'asset',
                    'test_coderesource_js-retrieve',
                    'js'
                )
            );

            assert.deepEqual(
                await getActualJson('test_coderesource_json', 'asset', 'webstudio'),
                await testUtils.getExpectedJson(
                    '9999999',
                    'asset',
                    'test_coderesource_json-retrieve'
                ),
                'returned metadata was not equal expected'
            );
            expect(
                await getActualFile('test_coderesource_json', 'asset', 'webstudio', 'jsonc')
            ).to.equal(
                await testUtils.getExpectedFile(
                    '9999999',
                    'asset',
                    'test_coderesource_json-retrieve',
                    'jsonc'
                )
            );

            assert.deepEqual(
                await getActualJson('test_coderesource_xml', 'asset', 'webstudio'),
                await testUtils.getExpectedJson(
                    '9999999',
                    'asset',
                    'test_coderesource_xml-retrieve'
                ),
                'returned metadata was not equal expected'
            );
            expect(
                await getActualFile('test_coderesource_xml', 'asset', 'webstudio', 'xml')
            ).to.equal(
                await testUtils.getExpectedFile(
                    '9999999',
                    'asset',
                    'test_coderesource_xml-retrieve',
                    'xml'
                )
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                31,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should retrieve asset-webstudio', async () => {
            // WHEN
            const retrieve = await handler.retrieve('testInstance/testBU', ['asset-webstudio']);

            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            assert.equal(
                retrieve['testInstance/testBU'].asset
                    ? Object.keys(retrieve['testInstance/testBU'].asset).length
                    : 0,
                7,
                'Unexpected number of assets in retrieve response'
            );
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.asset ? Object.keys(result.asset).length : 0,
                15,
                'Unexpected number of assets in cache'
            );

            assert.deepEqual(
                await getActualJson('test_landingpage', 'asset', 'webstudio'),
                await testUtils.getExpectedJson('9999999', 'asset', 'test_landingpage-retrieve'),
                'returned metadata was not equal expected'
            );

            assert.deepEqual(
                await getActualJson('test_microsite', 'asset', 'webstudio'),
                await testUtils.getExpectedJson('9999999', 'asset', 'test_microsite-retrieve'),
                'returned metadata was not equal expected'
            );

            assert.deepEqual(
                await getActualJson('test_interactivecontent', 'asset', 'webstudio'),
                await testUtils.getExpectedJson(
                    '9999999',
                    'asset',
                    'test_interactivecontent-retrieve'
                ),
                'returned metadata was not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                14,
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
                15,
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

        it('Should load the asset cache once when retrieving 2 keys in parallel', async () => {
            // WHEN
            const retrieve = await handler.retrieve(
                'testInstance/testBU',
                ['asset'],
                ['testExisting_asset_htmlblock', 'testExisting_htmlblock1']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            assert.sameMembers(
                Object.keys(retrieve['testInstance/testBU'].asset),
                ['testExisting_asset_htmlblock', 'testExisting_htmlblock1'],
                'Unexpected assets in retrieve response'
            );
            assert.lengthOf(
                testUtils.getRestCallout(
                    'post',
                    '/asset/v1/content/assets/query?scope=shared',
                    true
                ),
                2,
                'shared assets should be queried by one cache load (= 2 subtype chunks)'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                10,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should cache the folders of sibling BUs', async () => {
            await shareAssets(8801);
            // WHEN
            await handler.retrieve(
                'testInstance/testBU',
                ['asset'],
                ['testExisting_asset_htmlblock']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            assert.equal(
                cache.getCache().folder['1111111-88002']?.Path,
                'Content Builder/Sibling Folder',
                'sibling folder should be cached'
            );
            assert.include(
                testUtils.getRestCallout('post', '/asset/v1/content/assets/query?scope=shared')
                    .fields,
                'memberId',
                'shared assets query should request memberId'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                10,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should not retrieve extra folders for shared assets of the current or parent BU', async () => {
            await shareAssets(7001, 7002);
            // WHEN
            await handler.retrieve(
                'testInstance/testBU',
                ['asset'],
                ['testExisting_asset_htmlblock']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            assert.equal(
                testUtils.getAPIHistoryLength(),
                8,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should not fail the retrieve when the sibling folder retrieve fails', async () => {
            await shareAssets(8801);
            await testUtils.copyFile(
                'dataFolder/+retrieve-ContentTypeINasset,asset-shared-error-response.xml',
                'dataFolder/retrieve-ContentTypeINasset,asset-shared-response.xml',
                '8888888'
            );
            // WHEN
            await handler.retrieve(
                'testInstance/testBU',
                ['asset'],
                ['testExisting_asset_htmlblock']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            assert.isUndefined(
                cache.getCache().folder['1111111-88002'],
                'sibling folder should not be cached'
            );
            return;
        });

        it('Should restore the Folder context after a failing BU in retrieveForCacheFromOtherBUs', async () => {
            // checked directly: a leaked BU context is not visible in retrieve or deploy results
            await testUtils.copyFile(
                'dataFolder/+retrieve-ContentTypeINasset,asset-shared-error-response.xml',
                'dataFolder/retrieve-ContentTypeINasset,asset-shared-response.xml',
                '8888888'
            );
            const properties = await config.getProperties();
            const buObject = await Cli.getCredentialObject(properties, 'testInstance/testBU');
            const contextBefore = [Folder.buObject, Folder.client, Folder.properties];
            // WHEN
            const folders = await Folder.retrieveForCacheFromOtherBUs(
                buObject,
                properties,
                [8888888],
                ['asset', 'asset-shared']
            );
            // THEN
            assert.isEmpty(folders, 'no folders expected from the failing BU');
            assert.sameOrderedMembers(
                [Folder.buObject, Folder.client, Folder.properties],
                contextBefore,
                'Folder context should be restored'
            );
            return;
        });

        it('Should reset Asset._assetCachePromise after a parallel and a failed retrieve', async () => {
            // checked directly: a leftover promise would make the next BU reuse this cache load
            const keys = ['testExisting_asset_htmlblock', 'testExisting_htmlblock1'];
            await handler.retrieve('testInstance/testBU', ['asset'], keys);
            assert.isNull(Asset._assetCachePromise, 'promise should be reset after success');
            testUtils.mockRESTError('/asset/v1/content/assets/query', 500);
            // WHEN
            await handler.retrieve('testInstance/testBU', ['asset'], keys);
            // THEN
            assert.equal(process.exitCode, 1, 'retrieve should have thrown an error');
            assert.isNull(Asset._assetCachePromise, 'promise should be reset after failure');
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
                'Unexpected number of assets deployed'
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
                7,
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
                ['testExisting_asset_html-matchName']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');

            // check how many items were deployed
            assert.equal(
                deployResult['testInstance/testBU']?.asset
                    ? Object.keys(deployResult['testInstance/testBU']?.asset).length
                    : 0,
                1,
                'Unexpected number of assets deployed'
            );
            const currentCache = cache.getCache();

            const upsertCallout = testUtils.getRestCallout(
                'patch',
                '/asset/v1/content/assets/1295064'
            );
            assert.equal(
                upsertCallout?.customerKey,
                'testExisting_asset_html-matchName',
                'customerKey should be testExisting_asset_html-matchName'
            );
            assert.equal(
                upsertCallout?.id,
                currentCache.asset['testExisting_asset_htmlblock'].id,
                'id should be that of the existing testExisting_asset_htmlblock'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                7,
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
                ['testExisting_asset_html-matchNamFail']
            );
            // THEN
            assert.equal(process.exitCode, 1, 'deploy should have thrown an error');

            // check how many items were deployed
            assert.equal(
                deployResult['testInstance/testBU']?.asset
                    ? Object.keys(deployResult['testInstance/testBU']?.asset).length
                    : 0,
                0,
                'Unexpected number of assets deployed'
            );

            const upsertCallout = testUtils.getRestCallout('patch', '/asset/v1/content/assets/%');
            assert.equal(upsertCallout, null, 'there should have been no patch');

            assert.equal(
                testUtils.getAPIHistoryLength(),
                6,
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
                ['testExisting_asset_html-matchNameAdd']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');

            // check how many items were deployed
            assert.equal(
                deployResult['testInstance/testBU']?.asset
                    ? Object.keys(deployResult['testInstance/testBU']?.asset).length
                    : 0,
                1,
                'Unexpected number of assets deployed'
            );

            const upsertCallout = testUtils.getRestCallout('post', '/asset/v1/content/assets/');
            assert.equal(
                upsertCallout?.customerKey,
                'testExisting_asset_html-matchNameAdd',
                'asset.customerKey should be testExisting_asset_html-matchNameAdd'
            );
            assert.equal(
                upsertCallout?.id,
                undefined,
                'asset.id should not be set as we are in a create call'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                7,
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
                'Unexpected number of assets deployed'
            );
            const upsertCallout = testUtils.getRestCallout('post', '/asset/v1/content/assets/');
            assert.equal(
                upsertCallout?.customerKey,
                'testNew_asset_DEV',
                'customerKey should be testNew_asset_DEV due to --keySuffix'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                7,
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
                'Unexpected number of assets deployed'
            );
            const upsertCallout = testUtils.getRestCallout('post', '/asset/v1/content/assets/');
            assert.equal(
                upsertCallout?.customerKey,
                'testNew_asset',
                'customerKey should be testNew_asset'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                7,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should create an asset that loads a pre-existing content block via CBBK', async () => {
            // WHEN
            const deployResult = await handler.deploy('testInstance/testBU', {
                asset: ['testNew_asset_withCBBK_preexisting'],
            });
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');

            // check how many items were deployed
            assert.equal(
                deployResult['testInstance/testBU']?.asset
                    ? Object.keys(deployResult['testInstance/testBU']?.asset).length
                    : 0,
                1,
                'Unexpected number of assets deployed'
            );
            const upsertCallout = testUtils.getRestCallout('post', '/asset/v1/content/assets/');
            assert.equal(
                upsertCallout?.customerKey,
                'testNew_asset_withCBBK_preexisting',
                'customerKey should be testNew_asset'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                7,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should not create an asset that attempts to load a non-existent content block via CBBK', async () => {
            // WHEN
            const deployResult = await handler.deploy('testInstance/testBU', {
                asset: ['testNew_asset_withCBBK_notexisting'],
            });
            // THEN
            assert.equal(process.exitCode, 1, 'deploy should have thrown an error');

            // check how many items were deployed
            assert.equal(
                deployResult['testInstance/testBU']?.asset
                    ? Object.keys(deployResult['testInstance/testBU']?.asset).length
                    : 0,
                0,
                'Unexpected number of assets deployed'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                6,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should create an asset that loads a content block via CBBK that is also created in the same package', async () => {
            // WHEN
            const deployResult = await handler.deploy('testInstance/testBU', {
                asset: ['testNew_asset_withCBBK_notexisting', 'testNew_asset_htmlblock'],
            });
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');

            // check how many items were deployed
            assert.deepEqual(
                deployResult['testInstance/testBU']?.asset
                    ? Object.keys(deployResult['testInstance/testBU']?.asset)
                    : [],
                ['testNew_asset_htmlblock', 'testNew_asset_withCBBK_notexisting'],
                'unexpected assets deployed'
            );

            // check if we really issued callouts for those 2 blocks AND if they were run in the right order despite the key list for deploy() getting it in the wrong order
            const upsertCallouts = testUtils.getRestCallout(
                'post',
                '/asset/v1/content/assets/',
                true
            );
            assert.equal(
                upsertCallouts[0]?.customerKey,
                'testNew_asset_htmlblock',
                'first create callout not for expected asset'
            );
            assert.equal(
                upsertCallouts[1]?.customerKey,
                'testNew_asset_withCBBK_notexisting',
                'second create callout not for expected asset'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                8,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should not create an asset that attempts to load a non-existent content block via r__asset_key', async () => {
            // WHEN
            const deployResult = await handler.deploy('testInstance/testBU', {
                asset: ['testNew_assetMessage'],
            });
            // THEN
            assert.equal(process.exitCode, 1, 'deploy should have thrown an error');

            // check how many items were deployed
            assert.equal(
                deployResult['testInstance/testBU']?.asset
                    ? Object.keys(deployResult['testInstance/testBU']?.asset).length
                    : 0,
                0,
                'Unexpected number of assets deployed'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                6,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should create an asset that loads a content block via r__asset_key that is also created in the same package', async () => {
            // WHEN
            const deployResult = await handler.deploy('testInstance/testBU', {
                asset: ['testNew_assetMessage', 'testNew_asset_htmlblock'],
            });
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');

            // check how many items were deployed
            assert.deepEqual(
                deployResult['testInstance/testBU']?.asset
                    ? Object.keys(deployResult['testInstance/testBU']?.asset)
                    : [],
                ['testNew_asset_htmlblock', 'testNew_assetMessage'],
                'unexpected assets deployed'
            );

            // check if we really issued callouts for those 2 blocks AND if they were run in the right order despite the key list for deploy() getting it in the wrong order
            const upsertCallouts = testUtils.getRestCallout(
                'post',
                '/asset/v1/content/assets/',
                true
            );
            assert.equal(
                upsertCallouts[0]?.customerKey,
                'testNew_asset_htmlblock',
                'first create callout not for expected asset'
            );
            assert.equal(
                upsertCallouts[1]?.customerKey,
                'testNew_assetMessage',
                'second create callout not for expected asset'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                8,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should create a templatebased email and its template connected via r__asset_key', async () => {
            // WHEN
            const deployResult = await handler.deploy('testInstance/testBU', {
                asset: ['testNew_asset_templatebasedemail', 'testNew_asset_template'],
            });
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');

            // check how many items were deployed
            assert.deepEqual(
                deployResult['testInstance/testBU']?.asset
                    ? Object.keys(deployResult['testInstance/testBU']?.asset)
                    : [],
                ['testNew_asset_template', 'testNew_asset_templatebasedemail'],
                'unexpected assets deployed'
            );

            // check if we really issued callouts for those 2 blocks AND if they were run in the right order despite the key list for deploy() getting it in the wrong order
            const upsertCallouts = testUtils.getRestCallout(
                'post',
                '/asset/v1/content/assets/',
                true
            );
            assert.equal(
                upsertCallouts[0]?.customerKey,
                'testNew_asset_template',
                'first create callout not for expected asset'
            );
            assert.equal(
                upsertCallouts[1]?.customerKey,
                'testNew_asset_templatebasedemail',
                'second create callout not for expected asset'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                8,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        // the consumer references a block that is only visible via the shared-assets query:
        // 7001 is owned by the parent BU, 8801 by sibling BU 8888888
        for (const [reference, id] of [
            ['ContentBlockByKey("shared-key")', 7001],
            [String.raw`ContentBlockByName("Content Builder\Shared block")`, 7001],
            ['ContentBlockById(7001)', 7001],
            [String.raw`ContentBlockByName("Content Builder\Sibling Folder\Sibling block")`, 8801],
        ]) {
            it(`Should deploy ${reference} when the block is shared`, async () => {
                await shareAssets(id);
                await File.writeFile(
                    'deploy/testInstance/testBU/asset/block/testNew_asset_withCBBK_preexisting.asset-block-meta.html',
                    `%%= ${reference} =%%`
                );
                // WHEN
                const deployResult = await handler.deploy('testInstance/testBU', {
                    asset: ['testNew_asset_withCBBK_preexisting'],
                });
                // THEN
                assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
                assert.deepEqual(
                    Object.keys(deployResult['testInstance/testBU']?.asset || {}),
                    ['testNew_asset_withCBBK_preexisting'],
                    'Unexpected assets deployed'
                );
                return;
            });
        }

        it('Should reject a stale ContentBlockByKey after switching to a BU without sharing', async () => {
            // 8801 is owned by sibling BU 8888888, i.e. neither testBU nor _ParentBU_
            await shareAssets(8801);
            await File.writeFile(
                'deploy/testInstance/testBU/asset/block/testNew_asset_withCBBK_preexisting.asset-block-meta.html',
                '%%= ContentBlockByKey("sibling-shared-key") =%%'
            );
            File.copySync(
                'deploy/testInstance/testBU/asset/block/testNew_asset_withCBBK_preexisting.asset-block-meta.json',
                'deploy/testInstance/_ParentBU_/asset/block/testNew_asset_withCBBK_preexisting.asset-block-meta.json'
            );
            await File.writeFile(
                'deploy/testInstance/_ParentBU_/asset/block/testNew_asset_withCBBK_preexisting.asset-block-meta.html',
                '%%= ContentBlockByKey("sibling-shared-key") =%%'
            );
            await handler.deploy('testInstance/testBU', {
                asset: ['testNew_asset_withCBBK_preexisting'],
            });
            assert.equal(process.exitCode, 0, 'first deploy should not have thrown an error');
            await shareAssets();
            // WHEN
            const deployResult = await handler.deploy('testInstance/_ParentBU_', {
                asset: ['testNew_asset_withCBBK_preexisting'],
            });
            // THEN
            assert.equal(process.exitCode, 1, 'deploy should have thrown an error');
            assert.isEmpty(
                Object.keys(deployResult['testInstance/_ParentBU_']?.asset || {}),
                'Unexpected assets deployed'
            );
            return;
        });

        it('Should prefer a package block over a shared block with the same name', async () => {
            await shareAssets(7001);
            testUtils.copyToDeploy('asset-sharedDependency-deploy', 'asset');
            await File.writeFile(
                'deploy/testInstance/testBU/asset/block/testNew_asset_withCBBK_preexisting.asset-block-meta.html',
                String.raw`%%= ContentBlockByName("Content Builder\Shared block") =%%`
            );
            // WHEN
            await handler.deploy('testInstance/testBU', {
                asset: ['testNew_asset_withCBBK_preexisting', 'zz_package_block'],
            });
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            // the package block has to be created before the consumer that references it
            assert.deepEqual(
                testUtils
                    .getRestCallout('post', '/asset/v1/content/assets/', true)
                    .map((item) => item.customerKey),
                ['zz_package_block', 'testNew_asset_withCBBK_preexisting'],
                'Unexpected create callouts'
            );
            return;
        });
    });

    describe('Templating ================', () => {
        it('Should create a asset template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['asset']);

            const expectedApiCallsRetrieve = 31;
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
                ['testSourceMarket']
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
                    'email'
                ),
                await testUtils.getExpectedJson('9999999', 'asset', 'template-templatebasedemail'),
                'returned template JSON of buildTemplate was not equal expected'
            );
            expect(
                await getActualTemplateFile(
                    'testExisting_asset_templatebasedemail',
                    'asset',
                    'email',
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
                    'email',
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
                ['testTargetMarket']
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
                    'email'
                ),
                await testUtils.getExpectedJson('9999999', 'asset', 'build-templatebasedemail'),
                'returned deployment JSON was not equal expected'
            );
            expect(
                await getActualDeployFile(
                    'testTemplated_asset_templatebasedemail',
                    'asset',
                    'email',
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
                    'email',
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

            const expectedApiCallsRetrieve = 31;
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
                ['testSourceMarket']
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
                    '{{{prefix}}}asset_htmlblock',
                    '{{{prefix}}}asset_template',
                    '{{{prefix}}}asset_templatebasedemail',
                    '{{{prefix}}}htmlblock 3 spaces',
                    '{{{prefix}}}htmlblock1',
                    '{{{prefix}}}htmlblock2',
                ],
                'expected specific assets to be templated'
            );

            // testExisting_asset_templatebasedemail
            assert.deepEqual(
                await getActualTemplateJson(
                    'testExisting_asset_templatebasedemail',
                    'asset',
                    'email'
                ),
                await testUtils.getExpectedJson('9999999', 'asset', 'template-templatebasedemail'),
                'returned template JSON of buildTemplate was not equal expected'
            );

            expect(
                await getActualTemplateFile(
                    'testExisting_asset_templatebasedemail',
                    'asset',
                    'email',
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
                    'email',
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

        it('Should stringify shareAsset numeric paths during buildTemplate', async () => {
            await handler.retrieve('testInstance/testBU', ['asset']);

            const expectedApiCallsRetrieve = 31;
            assert.equal(
                testUtils.getAPIHistoryLength(),
                expectedApiCallsRetrieve,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );

            const sourceKey = 'testExisting_asset_htmlblock';
            const templatingKey = 'testExisting_asset_htmlblock_shareAsset';
            const source = await getActualJson(sourceKey, 'asset', 'block');
            source.customerKey = templatingKey;
            source.name = templatingKey;
            source.fileProperties.fileName = templatingKey;
            source.businessUnitAvailability = [
                {
                    view: true,
                    update: true,
                    delete: false,
                    memberId: 9999999,
                    transferOwnership: false,
                },
            ];
            source.sharingProperties = {
                sharedWith: [9999999],
                sharingType: 'view',
            };
            const sourceHtml = await getActualFile(sourceKey, 'asset', 'block', 'html');
            await File.writeJSONToFile(
                './retrieve/testInstance/testBU/asset/block',
                `${templatingKey}.asset-block-meta`,
                source
            );
            await File.writeToFile(
                './retrieve/testInstance/testBU/asset/block',
                `${templatingKey}.asset-block-meta`,
                'html',
                sourceHtml
            );

            handler.setOptions({ shareAsset: true });
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'asset',
                [templatingKey],
                ['testSourceMarket']
            );

            assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');
            assert.equal(
                result.asset ? Object.keys(result.asset).length : 0,
                1,
                'unexpected number of assets templated'
            );
            assert.equal(
                testUtils.getAPIHistoryLength() - expectedApiCallsRetrieve,
                0,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );

            const expectedTemplateJson = {
                assetType: {
                    displayName: 'HTML Block',
                    name: 'htmlblock',
                },
                availableViews: [],
                businessUnitAvailability: [
                    {
                        delete: false,
                        memberId: '{{{mid}}}',
                        transferOwnership: false,
                        update: true,
                        view: true,
                    },
                ],
                createdBy: {},
                customerKey: '{{{prefix}}}asset_htmlblock_shareAsset',
                design: '',
                fileProperties: {
                    fileName: '{{{prefix}}}asset_htmlblock_shareAsset',
                },
                memberId: '{{{mid}}}',
                meta: {
                    wrapperStyles: {
                        mobile: {
                            visible: true,
                        },
                        styling: {},
                    },
                },
                modelVersion: 2,
                modifiedBy: {},
                name: '{{{prefix}}}asset_htmlblock_shareAsset',
                r__folder_Path: 'Content Builder',
                sharingProperties: {
                    sharedWith: ['{{{mid}}}'],
                    sharingType: 'view',
                },
                status: {
                    name: 'Draft',
                },
            };
            assert.deepEqual(
                await getActualTemplateJson(templatingKey, 'asset', 'block'),
                expectedTemplateJson
            );
            return;
        });

        it('Should find a sibling block referenced via ContentBlockByName with --dependencies', async () => {
            await shareAssets(8801);
            File.copySync(
                'test/mockRoot/deploy/testInstance/testBU/asset/block/testNew_asset_withCBBK_preexisting.asset-block-meta.json',
                'retrieve/testInstance/testBU/asset/block/testNew_asset_withCBBK_preexisting.asset-block-meta.json'
            );
            await File.writeFile(
                'retrieve/testInstance/testBU/asset/block/testNew_asset_withCBBK_preexisting.asset-block-meta.html',
                String.raw`%%= ContentBlockByName("Content Builder\Sibling Folder\Sibling block") =%%`
            );
            handler.setOptions({ dependencies: true });
            // WHEN
            // called directly: it is the ContentBlockByX step of buildTemplate --dependencies
            const typeKeyList = await handler.addDependentCbReferences('testInstance/testBU', {
                asset: ['testNew_asset_withCBBK_preexisting'],
            });
            // THEN
            assert.equal(process.exitCode, 0, 'dependency search should not have thrown an error');
            assert.sameMembers(
                typeKeyList.asset,
                ['testNew_asset_withCBBK_preexisting', 'sibling-shared-key'],
                'sibling block should be found as dependency'
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
                /** @type {{key:string, name:string, path:string}} */ (
                    /** @type {unknown} */ (
                        await testUtils.getExpectedJson(
                            '9999999',
                            'asset',
                            'resolveId-1295064-noPath'
                        )
                    )
                ),
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
                /** @type {{key:string, name:string, path:string}} */ (
                    /** @type {unknown} */ (
                        await testUtils.getExpectedJson(
                            '9999999',
                            'asset',
                            'resolveId-1295064-withPath'
                        )
                    )
                ),
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
                /** @type {{key:string, name:string, path:string}} */ (
                    /** @type {unknown} */ (
                        await testUtils.getExpectedJson(
                            '9999999',
                            'asset',
                            'resolveId-1234-notFound'
                        )
                    )
                ),
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
                16,
                'Unexpected number of assets in cache'
            );
            // check if conversions happened
            expect(
                await getActualFile(
                    'testExisting_asset_message',
                    'asset',
                    'email',
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
                    'email',
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
                    'email',
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
                33,
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
                16,
                'Unexpected number of assets in cache'
            );
            // check if conversions happened
            expect(
                await getActualFile(
                    'testExisting_asset_message',
                    'asset',
                    'email',
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
                    'email',
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
                    'email',
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
                33,
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
                16,
                'Unexpected number of assets in cache'
            );
            // check if conversions happened
            expect(
                await getActualFile(
                    'testExisting_asset_message',
                    'asset',
                    'email',
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
                    'email',
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
                    'email',
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
                33,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
});
