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
        File.filterIllegalFilenames(`${field.replaceAll(':', '_')}.asset-mobile-meta.amp`),
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
            ['display_title', 'display_message']
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
            mobile('push', { 'display:title': null }),
            mobile('inApp', { 'button1:title': 'Inline only' }),
        ]) {
            const original = structuredClone(item);
            assert.lengthOf(Asset._extractCode(item).codeArr, 0);
            assert.deepEqual(item, original);
        }
    });

    for (const [first, second] of [
        ['push', 'sms'],
        ['push', 'inApp'],
        ['sms', 'inApp'],
    ]) {
        it(`rejects ${first}/${second} extraction before changing source or preview`, () => {
            const item = mobile(first, {
                'display:message': 'Message',
                'display:message:display': 'Message',
            });
            item.views[first].content =
                first === 'sms'
                    ? '<div class="text-bubble"><span>Message</span></div>'
                    : '<div class="message">Message</div>';
            item.views[second] = mobile(second).views[second];
            const original = structuredClone(item);
            assert.throws(() => Asset._extractCode(item), TypeError, 'multiple supported channels');
            assert.deepEqual(item, original);
        });

        for (const fileListOnly of [false, true]) {
            it(`rejects ${first}/${second} merge with discovery=${fileListOnly} before reads or mutation`, async () => {
                const item = mobile(first, {});
                item.views[second] = mobile(second, {}).views[second];
                const original = structuredClone(item);
                const pathExists = File.pathExists;
                const readFilteredFilename = File.readFilteredFilename;
                let reads = 0;
                try {
                    File.pathExists = async () => {
                        reads++;
                        return true;
                    };
                    File.readFilteredFilename = async () => {
                        reads++;
                        return 'Unexpected source';
                    };
                    let rejected = false;
                    try {
                        await Asset._mergeCode(
                            item,
                            root,
                            'mobile',
                            item.customerKey,
                            fileListOnly
                        );
                    } catch (ex) {
                        rejected = true;
                        assert.instanceOf(ex, TypeError);
                        assert.include(ex.message, 'multiple supported channels');
                    }
                    assert.isTrue(rejected);
                    assert.equal(reads, 0);
                    assert.deepEqual(item, original);
                } finally {
                    File.pathExists = pathExists;
                    File.readFilteredFilename = readFilteredFilename;
                }
            });
        }
    }

    it('ignores supported preview-only views when selecting the source channel', async () => {
        const item = mobile('sms', { 'display:message': source });
        item.views.push = { content: '<div class="message">Preview only</div>' };
        item.views.inApp = { content: '<p class="jmb-message">Preview only</p>' };
        const original = structuredClone(item.views);
        assert.deepEqual(
            (await save(item)).codeArr.map((code) => code.fileName),
            ['display_message']
        );
        await Asset._mergeCode(item, root, 'mobile');
        assert.deepEqual(item.views.push, original.push);
        assert.deepEqual(item.views.inApp, original.inApp);
        assert.equal(item.views.sms.meta.options.customBlockData['display:message'], source);
    });

    it('does not invent source or companions when no sidecar exists', async () => {
        const item = mobile();
        Asset._extractCode(item);
        const original = structuredClone(item);
        await Asset._mergeCode(item, root, 'mobile');
        assert.deepEqual(item, original);
        assert.notProperty(item.views.push.meta.options.customBlockData, 'c__codeAliases');
    });

    for (const channel of ['push', 'inApp']) {
        for (const text of ['Edited message', '']) {
            it(`deploys mixed missing ${channel} title and present ${JSON.stringify(text)} message sidecars`, async () => {
                const item = mobile(channel, { 'display:message': 'Message' });
                await save(item);
                const data = item.views[channel].meta.options.customBlockData;
                Object.assign(data, {
                    'display:title': 'Stale title',
                    'display:title:display': 'Stale title companion',
                    'display:message': 'Stale message',
                    'display:message:display': 'Stale message companion',
                });
                const titleOpen =
                    channel === 'push' ? '<div class="title">' : '<header class="jmb-header"><h1>';
                const titleClose = channel === 'push' ? '</div>' : '</h1></header>';
                const messageOpen =
                    channel === 'push' ? '<div class="message">' : '<p class="jmb-message">';
                const messageClose = channel === 'push' ? '</div>' : '</p>';
                item.views[channel].content =
                    titleOpen +
                    '[[[display:title]]]' +
                    titleClose +
                    messageOpen +
                    '[[[display:message]]]' +
                    messageClose;
                await File.writeFile(sidecar('display:message'), text);
                const original = structuredClone(item);
                const files = await Asset._mergeCode(item, root, 'mobile', item.customerKey, true);
                assert.lengthOf(files, 1);
                assert.deepEqual(item, original);
                await deploy(item);
                assert.deepEqual(data, {
                    'display:message': text,
                    'display:message:display': text,
                });
                assert.equal(
                    item.views[channel].content,
                    titleOpen + titleClose + messageOpen + text + messageClose
                );
            });
        }
    }

    it('deploys missing SMS source as absent fields and blank recognized preview text', async () => {
        const item = mobile('sms', {
            'display:message': 'Stale',
            'display:message:display': 'Stale companion',
        });
        item.views.sms.content =
            '<div class="text-bubble"><span>[[[display:message]]]</span></div>';
        const original = structuredClone(item);
        assert.isEmpty(await Asset._mergeCode(item, root, 'mobile', item.customerKey, true));
        assert.deepEqual(item, original);
        await deploy(item);
        assert.isEmpty(item.views.sms.meta.options.customBlockData);
        assert.equal(item.views.sms.content, '<div class="text-bubble"><span></span></div>');
    });

    for (const [field, preview] of [
        [
            'button1:title',
            '<button class="jmb-button-1" title="[[[button1:title]]]">Button</button>',
        ],
        [
            'display:media:url',
            '<style>.jmb-image {background: url([[[display:media:url]]]);}</style>',
        ],
        ['display:subtitle', '<div class="subtitle">[[[display:subtitle]]]</div>'],
    ]) {
        it(`still rejects missing inline ${field} preview source`, () => {
            const item = mobile(field === 'display:subtitle' ? 'push' : 'inApp', {});
            item.views[field === 'display:subtitle' ? 'push' : 'inApp'].content = preview;
            assert.throws(() => Asset._restoreMobilePreview(item), 'Missing mobile preview source');
        });
    }

    it('discovers underscore filenames without mutating metadata', async () => {
        const item = mobile();
        await save(item);
        const original = structuredClone(item);
        const files = await Asset._mergeCode(item, root, 'mobile', item.customerKey, true);
        assert.lengthOf(files, 2);
        assert.deepEqual(
            files.map((file) => file.fileName),
            ['display_title.asset-mobile-meta', 'display_message.asset-mobile-meta']
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
        const file = 'display_message.asset-mobile-meta';
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

    for (const layout of ['fullscreen', 'banner']) {
        it(`roundtrips ${layout} inApp fields and independently restores scoped preview slots`, async () => {
            const data = {
                'display:title': 'Same',
                'display:title:display': 'Same',
                'display:message': 'Same',
                'display:message:display': 'Same',
                'button1:title': 'First',
                'button2:title': 'Second',
                'display:media:url': 'https://example.test/image.jpg',
            };
            const item = mobile('inApp', data);
            const buttons =
                layout === 'fullscreen'
                    ? '<button class="jmb-button-1" title="First">\n  First\n</button>'
                    : '';
            const wrapper =
                '<style>.other {background:url(https://example.test/image.jpg)}\n.jmb-image {background: url(https://example.test/image.jpg);}</style>' +
                '<header class="extra jmb-header">\n<h1>Same</h1>\n</header>' +
                '<p class="jmb-message">Same</p>' +
                buttons +
                '<button class="jmb-button-2" title="Second">\n\tSecond\n</button>';
            item.views.inApp.content = wrapper;
            const original = structuredClone(item);
            const extracted = await save(item);
            assert.deepEqual(
                extracted.codeArr.map((code) => code.fileName),
                ['display_title', 'display_message']
            );
            assert.equal(data['button2:title'], 'Second');
            assert.equal(data['display:media:url'], 'https://example.test/image.jpg');
            assert.include(item.views.inApp.content, '[[[display:title]]]');
            assert.include(item.views.inApp.content, '[[[display:message]]]');
            assert.include(item.views.inApp.content, '[[[button2:title]]]');
            assert.include(item.views.inApp.content, '[[[display:media:url]]]');
            await deploy(item);
            delete item.category;
            delete original.category;
            assert.deepEqual(item.views, original.views);

            await save(item);
            await File.writeFile(sidecar('display:title'), 'Title <&');
            await File.writeFile(sidecar('display:message'), '');
            data['button1:title'] = 'Changed first';
            data['button2:title'] = 'Edited "<&';
            data['display:media:url'] = 'https://example.test/a (b)"\'\\</style>\n';
            await deploy(item);
            assert.include(item.views.inApp.content, '<h1>Title &lt;&amp;</h1>');
            assert.include(item.views.inApp.content, '<p class="jmb-message"></p>');
            assert.include(
                item.views.inApp.content,
                'title="Edited &quot;&lt;&amp;">\n\tEdited &quot;&lt;&amp;\n</button>'
            );
            assert.include(
                item.views.inApp.content,
                String.raw`url(https://example.test/a\20 \28 b\29 \22 \27 \5c \3c /style\3e \a )`
            );
            assert.include(
                item.views.inApp.content,
                '.other {background:url(https://example.test/image.jpg)}'
            );
            assert.equal(data['display:title:display'], 'Title <&');
            assert.equal(data['display:message:display'], '');
        });

        for (const quote of ['"', "'"]) {
            it(`roundtrips and edits ${layout} multiline button titles with ${quote} quotes`, async () => {
                const button = layout === 'fullscreen' ? 'button1' : 'button2';
                const field = `${button}:title`;
                const value = '\t\n spaced \r\n';
                const item = mobile('inApp', { [field]: value });
                const otherQuote = quote === '"' ? "'" : '"';
                const open =
                    `<article class="jmb-inapp-${layout}"><button ` +
                    `data-note=${quote}\n title=${otherQuote}untouched${otherQuote} class=${otherQuote}jmb-button-9${otherQuote}${quote} ` +
                    `class=${quote}jmb-${button.replace('button', 'button-')}${quote} title=${quote}`;
                const close = `${quote}> \n\t`;
                const end = '\t \n</button></article>';
                const preview = open + value + close + value + end;
                item.views.inApp.content = preview;
                await save(item);
                const tokenized = open + `[[[${field}]]]` + close + `[[[${field}]]]` + end;
                assert.equal(item.views.inApp.content, tokenized);
                await deploy(item);
                assert.equal(item.views.inApp.content, preview);
                assert.equal(item.views.inApp.meta.options.customBlockData[field], value);

                await save(item);
                const edited = ' \tEdited &<> \t\n spaced \r\n';
                item.views.inApp.meta.options.customBlockData[field] = edited;
                await deploy(item);
                const escaped = ' \tEdited &amp;&lt;&gt; \t\n spaced \r\n';
                assert.equal(item.views.inApp.content, open + escaped + close + escaped + end);
                assert.equal(item.views.inApp.meta.options.customBlockData[field], edited);
            });
        }
    }

    it('roundtrips and edits padded inApp button source without stripping source whitespace', async () => {
        const item = mobile('inApp', { 'button1:title': ' Padded <& ' });
        const preview =
            '<button class="jmb-button-1" title=" Padded &lt;&amp; ">\n Padded &lt;&amp; \n</button>';
        item.views.inApp.content = preview;
        await save(item);
        const tokenized =
            '<button class="jmb-button-1" title="[[[button1:title]]]">\n[[[button1:title]]]\n</button>';
        assert.equal(item.views.inApp.content, tokenized);
        await deploy(item);
        assert.equal(item.views.inApp.content, preview);
        assert.equal(item.views.inApp.meta.options.customBlockData['button1:title'], ' Padded <& ');

        await save(item);
        item.views.inApp.meta.options.customBlockData['button1:title'] = ' Edited & ';
        await deploy(item);
        assert.equal(
            item.views.inApp.content,
            '<button class="jmb-button-1" title=" Edited &amp; ">\n Edited &amp; \n</button>'
        );
    });

    it('roundtrips and edits terminal CSS escapes without losing their terminator whitespace', async () => {
        const item = mobile('inApp', { 'display:media:url': 'https://example.test/a)' });
        const unpadded = String.raw`<style>.jmb-image {background: url(https://example.test/a\29 );}</style>`;
        item.views.inApp.content = unpadded;
        Asset._tokenizeMobilePreview(item);
        assert.equal(
            item.views.inApp.content,
            '<style>.jmb-image {background: url([[[display:media:url]]]);}</style>'
        );
        Asset._restoreMobilePreview(item);
        assert.equal(item.views.inApp.content, unpadded);
        const preview = String.raw`<style>.jmb-image {background: url(  https://example.test/a\29  );}</style>`;
        item.views.inApp.content = preview;
        await save(item);
        assert.equal(
            item.views.inApp.content,
            '<style>.jmb-image {background: url(  [[[display:media:url]]] );}</style>'
        );
        await deploy(item);
        assert.equal(item.views.inApp.content, preview);
        assert.equal(
            item.views.inApp.meta.options.customBlockData['display:media:url'],
            'https://example.test/a)'
        );

        await save(item);
        item.views.inApp.meta.options.customBlockData['display:media:url'] =
            'https://example.test/b"';
        await deploy(item);
        assert.equal(
            item.views.inApp.content,
            String.raw`<style>.jmb-image {background: url(  https://example.test/b\22  );}</style>`
        );
        await save(item);
        await deploy(item);
        assert.equal(
            item.views.inApp.content,
            String.raw`<style>.jmb-image {background: url(  https://example.test/b\22  );}</style>`
        );
    });

    it('roundtrips and edits media after Image comments with all other CSS bytes intact', async () => {
        const item = mobile('inApp', { 'display:media:url': 'https://example.test/a)' });
        const opaque =
            '/* .jmb-image {background: url(https://example.test/a\\29 );} */\n' +
            '.other {background: url(https://example.test/a\\29 );}\n';
        const image =
            '/* Image */\n\t\t.jmb-image {\n\t\t\tbox-sizing: border-box;\n' +
            '\t'.repeat(3) +
            String.raw`background: url(  https://example.test/a\29  );` +
            '\n\t\t\tbackground-size: cover;\n\t\t}\n';
        const preview = '<style>\n' + opaque + image + '/* End */\n</style>';
        item.views.inApp.content = preview;
        await save(item);
        assert.equal(
            item.views.inApp.content,
            preview.replace(
                String.raw`url(  https://example.test/a\29  )`,
                'url(  [[[display:media:url]]] )'
            )
        );
        await deploy(item);
        assert.equal(item.views.inApp.content, preview);

        await save(item);
        item.views.inApp.meta.options.customBlockData['display:media:url'] =
            'https://example.test/b"';
        await deploy(item);
        assert.equal(
            item.views.inApp.content,
            preview.replace(
                String.raw`url(  https://example.test/a\29  )`,
                String.raw`url(  https://example.test/b\22  )`
            )
        );
    });

    it('maps inApp button text and attributes independently and leaves unknown slots untouched', async () => {
        const item = mobile('inApp', {
            'display:title': 'Same',
            'display:message': 'Same',
            'button1:title': 'Same',
            'button2:title': 'Same',
        });
        const unrelated =
            '<!--<p class="jmb-message">Same</p>-->' +
            '<script>"<p class=\'jmb-message\'>Same</p>"</script>' +
            '<h1>Same</h1><p>[[[display:message]]]</p>' +
            '<button class="unknown" title="Same">Same</button>' +
            '<button class="jmb-button-1 jmb-button-2" title="Same">Same</button>' +
            '<style>.other {background:url(Same)}</style>';
        item.views.inApp.content =
            unrelated +
            '<header class="jmb-header"><h1>Same</h1></header>' +
            '<p class="jmb-message">Same</p>' +
            '<button class="jmb-button-1" title="Stale">\n Same\t</button>' +
            '<button class="jmb-button-2" title="Same"> Stale </button>';
        await save(item);
        assert.include(item.views.inApp.content, 'title="Stale">\n [[[button1:title]]]\t');
        assert.include(item.views.inApp.content, 'title="[[[button2:title]]]"> Stale ');
        await File.writeFile(sidecar('display:title'), '[[[display:message]]]');
        await File.writeFile(sidecar('display:message'), 'Final');
        const data = item.views.inApp.meta.options.customBlockData;
        data['button1:title'] = 'One';
        data['button2:title'] = 'Two';
        await deploy(item);
        assert.equal(
            item.views.inApp.content,
            unrelated +
                '<header class="jmb-header"><h1>[[[display:message]]]</h1></header>' +
                '<p class="jmb-message">Final</p>' +
                '<button class="jmb-button-1" title="Stale">\n One\t</button>' +
                '<button class="jmb-button-2" title="Two"> Stale </button>'
        );
    });

    it('keeps CSS comments and quoted attributes opaque while mapping only exact inApp fields', async () => {
        const item = mobile('inApp', { 'button1:title': 'Same', 'display:media:url': 'image.jpg' });
        const preview =
            '<style>\n .jmb-image { /* background:url(image.jpg) */ background: url(image.jpg);}</style>' +
            '<button data-note=\' title="Same" class="jmb-button-2"\' class="jmb-button-1" title="Same"> Same </button>' +
            '<p data-note=\' class="jmb-message"\'>Same</p>';
        item.views.inApp.content = preview;
        await save(item);
        assert.include(
            item.views.inApp.content,
            '/* background:url(image.jpg) */ background: url([[[display:media:url]]])'
        );
        assert.include(
            item.views.inApp.content,
            'data-note=\' title="Same" class="jmb-button-2"\''
        );
        const data = item.views.inApp.meta.options.customBlockData;
        data['button1:title'] = '[[[display:media:url]]]';
        data['display:media:url'] = '';
        await deploy(item);
        assert.equal(
            item.views.inApp.content,
            preview
                .replace('background: url(image.jpg)', 'background: url()')
                .replace(
                    'class="jmb-button-1" title="Same"> Same ',
                    'class="jmb-button-1" title="[[[display:media:url]]]"> [[[display:media:url]]] '
                )
        );
    });

    it('preserves absent and empty inApp sources, stale media and wrong field tokens', async () => {
        const item = mobile('inApp', { 'display:message': '', 'button2:title': '' });
        const preview =
            '<header class="jmb-header"><h1>Missing</h1></header>' +
            '<p class="jmb-message"></p><button class="jmb-button-1" title="Absent"> Absent </button>' +
            '<button class="jmb-button-2" title=""> </button>' +
            '<style>.jmb-image {background: url(stale);}</style>';
        item.views.inApp.content = preview;
        const extracted = await save(item);
        assert.lengthOf(extracted.codeArr, 1);
        await deploy(item);
        assert.equal(item.views.inApp.content, preview);
        item.views.inApp.content = '<p class="jmb-message">[[[display:title]]]</p>';
        Asset._restoreMobilePreview(item);
        assert.equal(item.views.inApp.content, '<p class="jmb-message">[[[display:title]]]</p>');
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
        await File.writeFile(sidecar('display:message'), edited);
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

    it('blanks recognized placeholders without source but does not invent JSON attributes', async () => {
        const item = mobile();
        item.views.push.content = '<div class="title">Title</div>';
        await save(item);
        Asset._restoreMobilePreview(item);
        assert.equal(item.views.push.content, '<div class="title"></div>');
        assert.isEmpty(item.views.push.meta.options.customBlockData);
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
        await File.writeFile(sidecar('display:message'), 'Edited & safe');
        await deploy(item);
        assert.equal(
            item.views.sms.content,
            unrelated + '<div class="text-bubble"><span>Edited &amp; safe</span></div>'
        );
    });

    for (const channel of ['push', 'inApp']) {
        it(`builds ${channel} Mustache templates, rewrites references then restores final previews`, async () => {
            const item = mobile(channel, {
                'display:title': 'Hello SOURCE',
                'display:message': source,
            });
            item.name = 'Synthetic mobile';
            item.r__folder_Path = 'Mobile';
            const titleOpen =
                channel === 'push' ? '<div class="title">' : '<header class="jmb-header"><h1>';
            const titleClose = channel === 'push' ? '</div>' : '</h1></header>';
            const messageOpen =
                channel === 'push' ? '<div class="message">' : '<p class="jmb-message">';
            const messageClose = channel === 'push' ? '</div>' : '</p>';
            item.views[channel].content =
                titleOpen +
                'Hello SOURCE' +
                titleClose +
                messageOpen +
                Asset._escapeMobilePreview(source) +
                messageClose;
            await save(item);
            await Asset.buildTemplate(root, 'template', item.customerKey, {
                market: 'SOURCE',
                key: item.customerKey,
            });
            const template = await File.readJSON(
                'template/asset/mobile/synthetic-mobile/synthetic-mobile.asset-mobile-meta.json'
            );
            assert.include(template.views[channel].content, '[[[display:title]]]');
            assert.equal(template.customerKey, '{{{key}}}');
            await Asset.buildDefinition('template', 'deploy', item.customerKey, {
                market: 'TARGET & next',
                key: 'renamed-mobile',
            });
            const built = await File.readJSON(
                'deploy/asset/mobile/renamed-mobile/renamed-mobile.asset-mobile-meta.json'
            );
            assert.include(built.views[channel].content, '[[[display:title]]]');
            assert.notProperty(built.views[channel].meta, 'c__previewTokens');
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
                built.views[channel].content,
                titleOpen +
                    'Hello TARGET &amp; next' +
                    titleClose +
                    messageOpen +
                    '%%=ContentBlockById(123)=%%' +
                    messageClose
            );
        });
    }

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
