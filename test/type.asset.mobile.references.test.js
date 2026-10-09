import { assert } from 'chai';
import * as testUtils from './utils.js';
import Asset from '../lib/metadataTypes/Asset.js';
import File from '../lib/util/file.js';
import { Util } from '../lib/util/util.js';
import ReplaceCbReference from '../lib/util/replaceContentBlockReference.js';

const root = 'retrieve/testInstance/testBU';
const key = 'synthetic-mobile-reference';
const source = '%%=ContentBlockByKey("synthetic-block")=%%';
const converted = '%%=ContentBlockById(123)=%%';

/**
 * Create synthetic mobile metadata.
 *
 * @param {string} channel mobile channel
 * @param {object} data editable fields
 * @returns {object} asset
 */
function mobile(channel, data) {
    return {
        customerKey: key,
        assetType: { name: 'jsonmessage' },
        views: {
            [channel]: {
                content: '<html>generated preview %%ContactKey%%</html>',
                meta: { options: { customBlockData: data } },
            },
        },
    };
}

/**
 * Save synthetic extracted source without external fixtures.
 *
 * @param {object} item asset
 * @returns {Promise.<string[]>} JSON directory
 */
async function save(item) {
    const extracted = Asset._extractCode(item);
    const dir = [root, 'asset', 'mobile', ...(extracted.subFolder || [])];
    for (const code of extracted.codeArr) {
        await File.writeToFile(dir, `${code.fileName}.asset-mobile-meta`, 'amp', code.content);
    }
    await File.writeJSONToFile(dir, `${key}.asset-mobile-meta`, extracted.json);
    return dir;
}

/**
 * Return the synthetic message sidecar path.
 *
 * @returns {string} path
 */
function messagePath() {
    return File.normalizePath([
        root,
        'asset',
        'mobile',
        key,
        File.filterIllegalFilenames(
            'views.push.meta.options.customBlockData.display_message.asset-mobile-meta.amp'
        ),
    ]);
}

describe('type: asset-mobile reference replacement', () => {
    beforeEach(() => {
        testUtils.mockSetup();
        Asset.properties = {
            ...Asset.properties,
            options: { ...Asset.properties?.options, include: {}, exclude: {} },
        };
        Util.OPTIONS.referenceFrom = ['key'];
        Util.OPTIONS.referenceTo = 'id';
        ReplaceCbReference.assetCacheMap.key['synthetic-block'] = {
            id: 123,
            key: 'synthetic-block',
            name: 'Synthetic block',
        };
    });
    afterEach(() => {
        testUtils.mockReset();
    });

    it('preserves extraction metadata during discovery and merges edited source into equal aliases', async () => {
        const item = mobile('push', {
            'display:message': source,
            'display:message:display': source,
        });
        await save(item);
        const original = structuredClone(item);
        const keys = new Set();
        const response = await Asset.replaceCbReference(item, root, keys);
        assert.deepEqual([...keys], ['synthetic-block']);
        assert.deepEqual(item, original);
        assert.deepEqual(response, original);
        assert.equal(await File.readFile(messagePath(), 'utf8'), source);
        await File.writeFile(messagePath(), 'Edited source');
        await Asset._mergeCode(item, root, 'mobile');
        const data = item.views.push.meta.options.customBlockData;
        assert.equal(data['display:message'], 'Edited source');
        assert.equal(data['display:message:display'], 'Edited source');
        assert.deepEqual(Object.keys(data).toSorted(), [
            'display:message',
            'display:message:display',
        ]);
        assert.isUndefined(data.c__codeAliases);
    });

    it('does not invent duplicate source when sidecars are absent after discovery', async () => {
        const item = mobile('push', {
            'display:message': source,
            'display:message:display': source,
        });
        await save(item);
        await Asset.replaceCbReference(item, root, new Set());
        const original = structuredClone(item);
        await Asset._mergeCode(item, 'deploy/missing-source', 'mobile');
        assert.deepEqual(item, original);
    });

    it('converts sidecars without consuming aliases before final merge', async () => {
        const item = mobile('push', {
            'display:message': source,
            'display:message:display': source,
        });
        await save(item);
        const original = structuredClone(item);
        const response = await Asset.replaceCbReference(item, root);
        assert.deepEqual(item, original);
        assert.deepEqual(response, original);
        await Asset._mergeCode(response, root, 'mobile');
        const data = response.views.push.meta.options.customBlockData;
        assert.equal(data['display:message'], converted);
        assert.equal(data['display:message:display'], converted);
    });

    for (const [channel, field] of [
        ['push', 'display:title'],
        ['push', 'display:message'],
        ['sms', 'display:message'],
    ]) {
        it(`normalizes divergent ${channel} ${field} companions and replaces canonical references`, async () => {
            const item = mobile(channel, {
                [field]: source,
                [`${field}:display`]: 'Discarded divergent source',
            });
            const dir = await save(item);
            assert.isTrue(
                await File.pathExists(
                    File.normalizePath([
                        ...dir,
                        `views.${channel}.meta.options.customBlockData.${field.replaceAll(':', '_')}.asset-mobile-meta.amp`,
                    ])
                )
            );
            const original = structuredClone(item);
            const jsonBefore = await File.readJSONFile(
                dir.join('/'),
                `${key}.asset-mobile-meta`,
                false
            );
            const keys = new Set();
            await Asset.replaceCbReferenceLoop({ [key]: item }, root, keys);
            assert.deepEqual([...keys], ['synthetic-block']);
            assert.deepEqual(item, original);
            assert.deepEqual(
                await File.readJSONFile(dir.join('/'), `${key}.asset-mobile-meta`, false),
                jsonBefore
            );
            assert.deepEqual(await Asset.replaceCbReferenceLoop({ [key]: item }, root), [key]);
            const persisted = await File.readJSONFile(
                dir.join('/'),
                `${key}.asset-mobile-meta`,
                false
            );
            const data = persisted.views[channel].meta.options.customBlockData;
            assert.notProperty(data, `${field}:display`);
            assert.notProperty(data, 'c__codeAliases');
            assert.equal(persisted.views[channel].content, original.views[channel].content);
            await Asset._mergeCode(persisted, root, 'mobile');
            assert.equal(data[field], converted);
            assert.equal(data[`${field}:display`], converted);
        });
    }

    it('persists alias-only metadata in its existing flat JSON location', async () => {
        const item = mobile('sms', { 'display:message:display': source });
        const dir = await save(item);
        assert.deepEqual(dir, [root, 'asset', 'mobile']);
        await Asset.replaceCbReference(item, root);
        const persisted = await File.readJSONFile(dir.join('/'), `${key}.asset-mobile-meta`, false);
        assert.equal(
            persisted.views.sms.meta.options.customBlockData['display:message:display'],
            converted
        );
    });

    it('does not discover WhatsApp aliases or generated preview references', async () => {
        const item = mobile('whatsapp', { 'display:message:display': source });
        item.views.whatsapp.content = source;
        await save(item);
        const original = structuredClone(item);
        const keys = new Set();
        await Asset.replaceCbReferenceLoop({ [key]: item }, root, keys);
        assert.isEmpty([...keys]);
        assert.deepEqual(item, original);
    });
});
