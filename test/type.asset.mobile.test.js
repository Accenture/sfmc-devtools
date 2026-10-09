import { assert } from 'chai';
import * as testUtils from './utils.js';
import Asset from '../lib/metadataTypes/Asset.js';
import File from '../lib/util/file.js';
import { Util } from '../lib/util/util.js';
import ReplaceCbReference from '../lib/util/replaceContentBlockReference.js';
import cache from '../lib/util/cache.js';

const root = 'retrieve/testInstance/testBU';
const source = '%%=ContentBlockByKey("synthetic-block")=%%';

/**
 * Create a synthetic mobile asset without customer data.
 *
 * @param {string} [channel] view name
 * @param {object} [data] editable fields
 * @returns {object} synthetic asset
 */
function mobile(channel = 'push', data) {
    data ||= { 'display:title': 'Title', 'display:message': source };
    return {
        customerKey: 'synthetic-mobile',
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
 * Persist extracts using the production filename convention.
 *
 * @param {object} item synthetic asset
 * @returns {Promise.<object>} extracted item
 */
async function save(item) {
    const extracted = Asset._extractCode(item);
    const dir = [root, 'asset', 'mobile', ...(extracted.subFolder || [])];
    for (const code of extracted.codeArr) {
        assert.isTrue(
            await File.writeToFile(dir, `${code.fileName}.asset-mobile-meta`, 'amp', code.content)
        );
    }
    await File.writeJSONToFile(dir, `${item.customerKey.trim()}.asset-mobile-meta`, extracted.json);
    return extracted;
}

/**
 * Return a physical sidecar path.
 *
 * @param {string} field source field
 * @returns {string} path
 */
function sidecar(field) {
    return File.normalizePath([
        root,
        'asset',
        'mobile',
        'synthetic-mobile',
        File.filterIllegalFilenames(
            `views.push.meta.options.customBlockData.${field.replaceAll(':', '_')}.asset-mobile-meta.amp`
        ),
    ]);
}

/**
 * Deploy through the real source-merge and folder/cache harness.
 *
 * @param {object} item extracted asset
 * @param {string} [directory] sidecar root
 * @returns {Promise.<object>} deployed asset
 */
async function deploy(item, directory = root) {
    cache.initCache({ mid: 9999999, eid: 9999999 });
    cache.setMetadata('folder', { mobile: { ID: 42, Path: 'Mobile' } });
    cache.setMetadata('asset', {});
    Asset.buObject = { mid: 9999999 };
    Util.OPTIONS.matchName = true;
    item.r__folder_Path = 'Mobile';
    return Asset.preDeployTasks(item, directory);
}

describe('type: asset-mobile source extraction', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });
    afterEach(() => {
        testUtils.mockReset();
    });

    it('roundtrips push source, equal aliases and untouched preview HTML', async () => {
        const original = mobile('push', {
            'display:title': 'Title',
            'display:title:display': 'Title',
            'display:message': source,
            'display:message:display': source,
        });
        const item = structuredClone(original);
        item.customerKey = ' synthetic-mobile ';
        const extracted = await save(item);
        assert.deepEqual(extracted.subFolder, ['synthetic-mobile']);
        assert.lengthOf(extracted.codeArr, 2);
        assert.deepEqual(
            extracted.codeArr.map((code) => code.fileName),
            [
                'views.push.meta.options.customBlockData.display_title',
                'views.push.meta.options.customBlockData.display_message',
            ]
        );
        assert.isUndefined(item.views.push.meta.options.customBlockData['display:message:display']);
        assert.isTrue(await File.pathExists(sidecar('display:message')));
        await Asset._mergeCode(item, root, 'mobile');
        item.customerKey = original.customerKey;
        assert.deepEqual(item, original);
    });

    it('normalizes divergent companions to edited and empty canonical source', async () => {
        const item = mobile('push', {
            'display:title': 'Title',
            'display:title:display': 'Different',
            'display:message': source,
            'display:message:display': source,
        });
        await save(item);
        await File.writeFile(sidecar('display:message'), '');
        await File.writeFile(sidecar('display:title'), 'Edited');
        await Asset._mergeCode(item, root, 'mobile');
        assert.deepEqual(item.views.push.meta.options.customBlockData, {
            'display:title': 'Edited',
            'display:title:display': 'Edited',
            'display:message': '',
            'display:message:display': '',
        });
    });

    it('normalizes absent SMS companions from plain and empty sidecars', async () => {
        for (const text of ['Plain text', '']) {
            const original = mobile('sms', { 'display:message': text });
            const item = structuredClone(original);
            assert.lengthOf((await save(item)).codeArr, 1);
            await Asset._mergeCode(item, root, 'mobile');
            original.views.sms.meta.options.customBlockData['display:message:display'] = text;
            assert.deepEqual(item, original);
        }
    });

    it('does not process WhatsApp, missing views or non-string fields', () => {
        for (const item of [
            mobile('whatsapp'),
            { customerKey: 'synthetic-mobile', assetType: { name: 'jsonmessage' } },
            mobile('sms', { 'display:message': null }),
        ]) {
            const original = structuredClone(item);
            assert.lengthOf(Asset._extractCode(item).codeArr, 0);
            assert.deepEqual(item, original);
        }
    });

    it('does not invent source or companions when no sidecar exists', async () => {
        const item = mobile();
        Asset._extractCode(item);
        const original = structuredClone(item);
        await Asset._mergeCode(item, root, 'mobile');
        assert.deepEqual(item, original);
        assert.notProperty(item.views.push.meta.options.customBlockData, 'c__codeAliases');
    });

    it('discovers underscore filenames without mutating metadata', async () => {
        const item = mobile();
        await save(item);
        const original = structuredClone(item);
        const files = await Asset._mergeCode(item, root, 'mobile', item.customerKey, true);
        assert.lengthOf(files, 2);
        assert.deepEqual(
            files.map((file) => file.fileName),
            [
                'views.push.meta.options.customBlockData.display_title.asset-mobile-meta',
                'views.push.meta.options.customBlockData.display_message.asset-mobile-meta',
            ]
        );
        assert.deepEqual(item, original);
        Asset.properties = {
            ...Asset.properties,
            directories: {
                businessUnits: 'businessUnits',
                deploy: 'deploy',
                docs: 'docs',
                template: 'template',
                templateBuilds: 'templateBuilds',
                retrieve: 'retrieve',
            },
        };
        Asset.buObject = { credential: 'testInstance', businessUnit: 'testBU' };
        assert.include(
            await Asset.getFilesToCommit([item.customerKey]),
            sidecar('display:message')
        );
    });

    it('templates and builds extracted source through the nested build pipeline', async () => {
        const item = mobile('push', { 'display:message': 'Hello SOURCE' });
        await save(item);
        await Asset._buildForNested(
            root,
            'template',
            item,
            { market: 'SOURCE' },
            item.customerKey,
            'template'
        );
        const file = 'views.push.meta.options.customBlockData.display_message.asset-mobile-meta';
        assert.equal(
            await File.readFilteredFilename(
                ['template', 'asset', 'mobile', item.customerKey],
                file,
                'amp'
            ),
            'Hello {{{market}}}'
        );
        await Asset._buildForNested(
            'template',
            'deploy',
            item,
            { market: 'TARGET' },
            item.customerKey,
            'definition'
        );
        assert.equal(
            await File.readFilteredFilename(
                ['deploy', 'asset', 'mobile', item.customerKey],
                file,
                'amp'
            ),
            'Hello TARGET'
        );
    });

    it('restores equal push slots independently after edited sidecars, retaining subtitle inline', async () => {
        const item = mobile('push', {
            'display:title': 'Same',
            'display:message': 'Same',
            'display:subtitle': 'Subtitle',
        });
        const wrapper =
            '<style>.title {color:red}</style><div class="extra title">Same</div><div class="subtitle extra">Subtitle</div><div class="message">Same</div>';
        item.views.push.content = wrapper;
        await save(item);
        assert.equal(
            item.views.push.content,
            wrapper
                .replace('>Same<', '>[[[display:title]]]<')
                .replace('>Same<', '>[[[display:message]]]<')
                .replace('>Subtitle<', '>[[[display:subtitle]]]<')
        );
        assert.notProperty(item.views.push.meta, 'c__previewTokens');
        assert.equal(item.views.push.meta.options.customBlockData['display:subtitle'], 'Subtitle');
        await File.writeFile(sidecar('display:title'), 'Edited title');
        await File.writeFile(sidecar('display:message'), 'Edited message');
        await Asset._mergeCode(item, root, 'mobile');
        assert.include(item.views.push.content, '[[[display:title]]]');
        await deploy(item);
        assert.equal(
            item.views.push.content,
            wrapper.replace('>Same<', '>Edited title<').replace('>Same<', '>Edited message<')
        );
        assert.notProperty(item.views.push.meta, 'c__previewTokens');
    });

    it('updates only the known SMS span and preserves escaped LF Unicode AMPscript literally', async () => {
        const item = mobile('sms', { 'display:message': 'SMS' });
        item.views.sms.content = '<div class="text-bubble extra"><span data-x="1">SMS</span></div>';
        await save(item);
        const edited = `&<>"'\nGrüße ${source}`;
        await File.writeFile(
            sidecar('display:message').replace('views.push.', 'views.sms.'),
            edited
        );
        await deploy(item);
        assert.equal(item.views.sms.meta.options.customBlockData['display:message'], edited);
        assert.equal(
            item.views.sms.content,
            '<div class="text-bubble extra"><span data-x="1">' +
                Asset._escapeMobilePreview(edited) +
                '</span></div>'
        );
    });

    it('leaves stale, unknown, empty, absent and WhatsApp previews unchanged', async () => {
        for (const preview of [
            '<div class="message">Stale</div>',
            '<p>Title</p>',
            '<div data-class="message">Title</div>',
            '<div class="message"><b>Title</b></div>',
            '<div class="message"></div>',
            undefined,
        ]) {
            const item = mobile('push', { 'display:message': 'Title' });
            item.views.push.content = preview;
            await save(item);
            await File.writeFile(sidecar('display:message'), 'Edited');
            await deploy(item);
            assert.equal(item.views.push.content, preview);
            assert.notProperty(item.views.push.meta, 'c__previewTokens');
        }
        const item = mobile('whatsapp');
        item.views.whatsapp.content = '<div class="message">Title</div>';
        const original = structuredClone(item.views);
        await save(item);
        await deploy(item);
        assert.deepEqual(item.views, original);
    });

    it('restores only exact corresponding push slots without rescanning inserted source', async () => {
        const item = mobile('push', { 'display:title': 'Title', 'display:message': 'Message' });
        const unrelated =
            '<!--<div class="title">[[[display:title]]]</div>-->' +
            '<script>const preview = \'<div class="title">[[[display:title]]]</div>\';</script>' +
            '<style>/* <div class="title">[[[display:title]]]</div> */</style>' +
            '<p data-token="[[[display:title]]]">[[[display:title]]]</p>' +
            '<div data-x=\'<div class="title">[[[display:title]]]</div>\'>Other</div>' +
            '<div class="title">[[[display:message]]]</div>' +
            '<div class="message">prefix [[[display:message]]]</div>';
        item.views.push.content =
            unrelated + '<div class="title">Title</div><div class="message">Message</div>';
        await save(item);
        await File.writeFile(sidecar('display:title'), '[[[display:message]]]');
        await File.writeFile(sidecar('display:message'), 'Final');
        await deploy(item);
        assert.equal(
            item.views.push.content,
            unrelated +
                '<div class="title">[[[display:message]]]</div><div class="message">Final</div>'
        );
    });

    it('rejects recognized placeholders without source and ignores absent preview slots', async () => {
        const item = mobile();
        item.views.push.content = '<div class="title">Title</div>';
        await save(item);
        const preview = item.views.push.content;
        assert.throws(() => Asset._restoreMobilePreview(item), 'Missing mobile preview source');
        assert.equal(item.views.push.content, preview);
        item.views.push.content = 'missing';
        await deploy(item);
        assert.equal(item.views.push.content, 'missing');
    });

    it('restores only recognized SMS message spans, not unrelated placeholder text', async () => {
        const item = mobile('sms', { 'display:message': 'SMS' });
        const unrelated =
            '<!--<div class="text-bubble"><span>[[[display:message]]]</span></div>-->' +
            '<span data-token="[[[display:message]]]">[[[display:message]]]</span>' +
            '<div class="text-bubble"><span>[[[display:title]]]</span></div>';
        item.views.sms.content = unrelated + '<div class="text-bubble"><span>SMS</span></div>';
        await save(item);
        await File.writeFile(
            sidecar('display:message').replace('views.push.', 'views.sms.'),
            'Edited & safe'
        );
        await deploy(item);
        assert.equal(
            item.views.sms.content,
            unrelated + '<div class="text-bubble"><span>Edited &amp; safe</span></div>'
        );
    });

    it('builds real Mustache templates with renamed keys, rewrites references then restores final previews', async () => {
        const item = mobile('push', { 'display:title': 'Hello SOURCE', 'display:message': source });
        item.name = 'Synthetic mobile';
        item.r__folder_Path = 'Mobile';
        item.views.push.content =
            '<div class="title">Hello SOURCE</div><div class="message">' +
            Asset._escapeMobilePreview(source) +
            '</div>';
        await save(item);
        await Asset.buildTemplate(root, 'template', item.customerKey, {
            market: 'SOURCE',
            key: item.customerKey,
        });
        const template = await File.readJSON(
            'template/asset/mobile/synthetic-mobile/synthetic-mobile.asset-mobile-meta.json'
        );
        assert.include(template.views.push.content, '[[[display:title]]]');
        assert.equal(template.customerKey, '{{{key}}}');
        await Asset.buildDefinition('template', 'deploy', item.customerKey, {
            market: 'TARGET & next',
            key: 'renamed-mobile',
        });
        const built = await File.readJSON(
            'deploy/asset/mobile/renamed-mobile/renamed-mobile.asset-mobile-meta.json'
        );
        assert.include(built.views.push.content, '[[[display:title]]]');
        assert.notProperty(built.views.push.meta, 'c__previewTokens');
        Util.OPTIONS.referenceFrom = ['key'];
        Util.OPTIONS.referenceTo = 'id';
        ReplaceCbReference.assetCacheMap.key['synthetic-block'] = {
            id: 123,
            key: 'synthetic-block',
            name: 'Synthetic block',
        };
        await Asset.replaceCbReference(built, 'deploy');
        await deploy(built, 'deploy');
        assert.equal(built.customerKey, 'renamed-mobile');
        assert.equal(
            built.views.push.content,
            '<div class="title">Hello TARGET &amp; next</div><div class="message">%%=ContentBlockById(123)=%%</div>'
        );
    });

    it('finds ContentBlock references in mobile source, not generated previews', async () => {
        const item = mobile();
        await save(item);
        Util.OPTIONS.referenceFrom = ['key'];
        Util.OPTIONS.referenceTo = 'id';
        ReplaceCbReference.assetCacheMap.key['synthetic-block'] = {
            id: 123,
            key: 'synthetic-block',
            name: 'Synthetic block',
        };
        const keys = new Set();
        await Asset.replaceCbReference(item, root, keys);
        assert.deepEqual([...keys], ['synthetic-block']);
        assert.equal(await File.readFile(sidecar('display:message'), 'utf8'), source);
        await Asset.replaceCbReference(item, root);
        assert.equal(
            await File.readFile(sidecar('display:message'), 'utf8'),
            '%%=ContentBlockById(123)=%%'
        );
        await Asset._mergeCode(item, root, 'mobile');
        assert.equal(
            item.views.push.meta.options.customBlockData['display:message'],
            '%%=ContentBlockById(123)=%%'
        );
        assert.equal(item.views.push.content, '<html>generated preview %%ContactKey%%</html>');
    });
});
