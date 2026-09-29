import { assert } from 'chai';
import * as testUtils from './utils.js';
import Asset from '../lib/metadataTypes/Asset.js';
import MetadataType from '../lib/metadataTypes/MetadataType.js';
import cache from '../lib/util/cache.js';
import References from '../lib/util/replaceContentBlockReference.js';

/**
 * Initializes an empty target BU with a shared folder.
 *
 * @param {number} mid target Business Unit ID
 */
function initBu(mid) {
    Asset.buObject = { mid, eid: 1111111 };
    cache.initCache(Asset.buObject);
    cache.setMetadata('asset', {});
    cache.setMetadata('folder', {
        shared: { ID: 77, Client: { ID: 1111111 }, Path: 'Content Builder' },
    });
}

describe('Asset shared deployment references', () => {
    let originals;
    let sharedItems;
    let code;
    const shared = {
        id: 7001,
        customerKey: 'shared-key',
        name: 'SameName',
        memberId: 1111111,
        category: { id: 77 },
        assetType: { id: 197, name: 'htmlblock' },
    };
    const consumer = {
        customerKey: 'consumer',
        name: 'Consumer',
        assetType: { id: 197, name: 'htmlblock' },
    };

    beforeEach(() => {
        testUtils.mockSetup();
        originals = {
            client: Asset.client,
            buObject: Asset.buObject,
            mergeCode: Asset._mergeCode,
            upsert: MetadataType.upsert,
        };
        sharedItems = [shared];
        code = '';
        initBu(9999999);
        Asset.client = {
            // @ts-expect-error Only shared-asset queries are needed by this test client.
            rest: {
                post: async (url) => {
                    assert.equal(url, '/asset/v1/content/assets/query?scope=shared');
                    return {
                        items: structuredClone(sharedItems),
                        count: sharedItems.length,
                        page: 1,
                        pageSize: 50,
                    };
                },
            },
        };
        // Keep reference parsing and ordering real; replace file reads and final writes only.
        Asset._mergeCode = async (item) => [
            {
                content: item.customerKey === 'consumer' ? code : '',
                subFolder: [],
                fileName: item.customerKey,
                fileExt: 'html',
            },
        ];
        MetadataType.upsert = async (metadataMap) => metadataMap;
    });

    afterEach(() => {
        Asset.client = originals.client;
        Asset.buObject = originals.buObject;
        Asset._mergeCode = originals.mergeCode;
        MetadataType.upsert = originals.upsert;
        testUtils.mockReset();
    });

    for (const reference of [
        'ContentBlockByKey("shared-key")',
        String.raw`ContentBlockByName("Content Builder\SameName")`,
        'ContentBlockById(7001)',
    ]) {
        it(`resolves shared ${reference}`, async () => {
            code = reference;
            const result = await Asset.upsert({ consumer }, '/unused');
            assert.deepEqual(Object.keys(result), ['consumer']);
            assert.deepEqual(cache.getCache().asset, {});
        });

        it(`rejects stale ${reference} in the next BU`, async () => {
            code = reference;
            assert.deepEqual(Object.keys(await Asset.upsert({ consumer }, '/unused')), [
                'consumer',
            ]);
            initBu(2222222);
            sharedItems = [];
            assert.deepEqual(await Asset.upsert({ consumer }, '/unused'), {});
        });
    }

    it('orders a package dependency before its consumer when a shared asset has the same full name', async () => {
        code = String.raw`ContentBlockByName("Content Builder\SameName")`;
        const packageAsset = {
            customerKey: 'package-key',
            name: 'SameName',
            r__folder_Path: 'Content Builder',
            assetType: { id: 197, name: 'htmlblock' },
        };
        const result = await Asset.upsert({ 'package-key': packageAsset, consumer }, '/unused');
        const dependencies = new Set();
        References.replaceReference(code, 'consumer', dependencies);
        assert.deepEqual([...dependencies], ['package-key']);
        assert.deepEqual(Object.keys(result), ['package-key', 'consumer']);
    });
});
