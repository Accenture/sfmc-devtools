import { assert } from 'chai';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
import File from '../lib/util/file.js';
import cache from '../lib/util/cache.js';
import config from '../lib/util/config.js';

describe('Deploy assets with shared dependencies', () => {
    const consumerKey = 'testNew_asset_withCBBK_preexisting';
    const poolPath = 'test/resources/9999999/asset/v1/content/assets/assets-pool.json';
    const contentPath = `deploy/testInstance/testBU/asset/block/${consumerKey}.asset-block-meta.html`;

    beforeEach(async () => {
        testUtils.mockSetup();
        testUtils.mockSetup(true);
        // This block is available only through the shared-assets query.
        const pool = await File.readJSON(poolPath);
        for (const entry of Object.values(pool)) {
            entry.queryScope = 'local';
        }
        pool['7001'] = {
            queryScope: 'shared',
            body: {
                id: 7001,
                customerKey: 'shared-key',
                name: 'Shared block',
                memberId: 1111111,
                category: { id: 4707 },
                assetType: { id: 197, name: 'htmlblock' },
                status: { id: 1, name: 'Draft' },
            },
        };
        await File.writeJSON(poolPath, pool);
    });

    afterEach(() => {
        config.properties = null;
        testUtils.mockReset();
    });

    for (const reference of [
        'ContentBlockByKey("shared-key")',
        String.raw`ContentBlockByName("Content Builder\Shared block")`,
        'ContentBlockById(7001)',
    ]) {
        for (const isShared of [true, false]) {
            it(`${isShared ? 'deploys' : 'rejects'} ${reference} when the dependency is ${isShared ? 'shared' : 'not shared'}`, async () => {
                if (!isShared) {
                    const pool = await File.readJSON(poolPath);
                    delete pool['7001'];
                    await File.writeJSON(poolPath, pool);
                }
                await File.writeFile(contentPath, `%%= ${reference} =%%`);

                const result = await handler.deploy('testInstance/testBU', {
                    asset: [consumerKey],
                });

                assert.equal(process.exitCode, isShared ? 0 : 1);
                assert.deepEqual(
                    Object.keys(result['testInstance/testBU']?.asset || {}),
                    isShared ? [consumerKey] : []
                );
                const creates =
                    testUtils.getRestCallout('post', '/asset/v1/content/assets/', true, true) || [];
                assert.deepEqual(
                    creates.map((item) => item.customerKey),
                    isShared ? [consumerKey] : []
                );
                assert.lengthOf(testUtils.getAPIHistory().patch, 0);
                assert.isUndefined(cache.getByKey('asset', 'shared-key'));
            });
        }

        it(`rejects stale ${reference} after switching to a BU without sharing`, async () => {
            const properties = await File.readJSON('.mcdevrc.json');
            properties.credentials.testInstance.businessUnits.secondBU = 2222222;
            await File.writeJSON('.mcdevrc.json', properties);
            config.properties = null;
            await File.writeFile(contentPath, `%%= ${reference} =%%`);
            const secondFolder = 'deploy/testInstance/secondBU/asset/block';
            await File.ensureDir(secondFolder);
            const consumerMetadata = await File.readJSON(contentPath.replace('.html', '.json'));
            consumerMetadata.memberId = 2222222;
            await File.writeJSON(
                `${secondFolder}/${consumerKey}.asset-block-meta.json`,
                consumerMetadata
            );
            await File.writeFile(
                `${secondFolder}/${consumerKey}.asset-block-meta.html`,
                `%%= ${reference} =%%`
            );
            await File.ensureDir('test/resources/2222222/dataFolder');
            for (const filename of await File.readdir('test/resources/9999999/dataFolder')) {
                const content = await File.readFile(
                    `test/resources/9999999/dataFolder/${filename}`,
                    'utf8'
                );
                await File.writeFile(
                    `test/resources/2222222/dataFolder/${filename}`,
                    content.replaceAll('9999999', '2222222')
                );
            }

            const first = await handler.deploy('testInstance/testBU', { asset: [consumerKey] });
            assert.equal(process.exitCode, 0);
            assert.deepEqual(Object.keys(first['testInstance/testBU'].asset), [consumerKey]);
            const createsBefore = testUtils.getRestCallout(
                'post',
                '/asset/v1/content/assets/',
                true
            );
            assert.lengthOf(createsBefore, 1);

            const pool = await File.readJSON(poolPath);
            delete pool['7001'];
            await File.writeJSON(poolPath, pool);
            const second = await handler.deploy('testInstance/secondBU', { asset: [consumerKey] });

            assert.equal(process.exitCode, 1);
            assert.deepEqual(Object.keys(second['testInstance/secondBU']?.asset || {}), []);
            assert.lengthOf(testUtils.getRestCallout('post', '/asset/v1/content/assets/', true), 1);
            assert.lengthOf(testUtils.getAPIHistory().patch, 0);
        });
    }

    it('resolves ContentBlockByName to the package block instead of the shared block with the same full name', async () => {
        const packageKey = 'zz_package_block';
        const originalKey = 'testNew_asset_htmlblock';
        const folder = 'deploy/testInstance/testBU/asset/block';
        const metadata = await File.readJSON(`${folder}/${originalKey}.asset-block-meta.json`);
        metadata.customerKey = packageKey;
        metadata.name = 'Shared block';
        await File.writeJSON(`${folder}/${packageKey}.asset-block-meta.json`, metadata);
        await File.writeFile(
            `${folder}/${packageKey}.asset-block-meta.html`,
            '<p>Package block</p>'
        );
        await File.writeFile(
            contentPath,
            String.raw`%%= ContentBlockByName("Content Builder\Shared block") =%%`
        );
        const responseFolder = 'test/resources/9999999/asset/v1/content/assets';
        const response = await File.readJSON(
            `${responseFolder}/post-response-key=${originalKey}.json`
        );
        response.customerKey = packageKey;
        response.name = 'Shared block';
        await File.writeJSON(`${responseFolder}/post-response-key=${packageKey}.json`, response);

        const result = await handler.deploy('testInstance/testBU', {
            asset: [consumerKey, packageKey],
        });

        assert.equal(process.exitCode, 0);
        assert.deepEqual(Object.keys(result['testInstance/testBU'].asset), [
            packageKey,
            consumerKey,
        ]);
        const creates = testUtils.getRestCallout('post', '/asset/v1/content/assets/', true);
        assert.deepEqual(
            creates.map((item) => item.customerKey),
            [packageKey, consumerKey]
        );
        assert.lengthOf(testUtils.getAPIHistory().patch, 0);
    });
});
