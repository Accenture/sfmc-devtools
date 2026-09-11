import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import MetadataTypeInfo from '../lib/MetadataTypeInfo.js';
const Asset = MetadataTypeInfo.asset;
import File from '../lib/util/file.js';
import { resolveAssetMigrationFiles } from '../lib/util/migrations/v10/assetFiles.js';

describe('v10 isolated Asset companion wrapper', () => {
    let root;
    let assetRoot;
    let shared;

    beforeEach(async () => {
        root = await fs.mkdtemp(path.join(os.tmpdir(), 'mcdev-wrapper-'));
        assetRoot = path.join(root, 'asset');
        shared = [Asset.definition, Asset.properties, Asset.buObject];
    });

    afterEach(async () => {
        assert.deepEqual([Asset.definition, Asset.properties, Asset.buObject], shared);
        await fs.rm(root, { recursive: true, force: true });
    });

    /**
     * Create a local fixture without shared test state.
     *
     * @param {string} relative fixture path
     * @param {object|string|Buffer} content fixture content
     * @returns {Promise.<void>} completion
     */
    async function write(relative, content) {
        const filename = path.join(assetRoot, relative);
        await fs.mkdir(path.dirname(filename), { recursive: true });
        await fs.writeFile(
            filename,
            typeof content === 'object' && !Buffer.isBuffer(content)
                ? JSON.stringify(content)
                : content
        );
    }

    it('classifies by name without IDs and keeps logical keys separate from observed tokens', async () => {
        for (const key of [
            'simple',
            'dot.key',
            'with%percent',
            'ümlaut',
            ' leading ',
            'slash/key',
        ]) {
            const token = File.filterIllegalFilenames(key);
            const owner = `message/${token}.asset-message-meta.json`;
            await write(owner, {
                customerKey: key,
                assetType: { name: 'textonlyemail' },
                views: { text: {} },
            });
            await write(`message/${token}.asset-message-meta.amp`, 'text');
            const result = await resolveAssetMigrationFiles(assetRoot, owner);
            assert.equal(result.customerKey, key);
            assert.equal(result.files.length, 2);
            assert.ok(result.files.every(({ destination }) => destination.startsWith('email/')));
        }
    });

    it('reuses nested email slot discovery and filters nonexistent alternative extensions', async () => {
        const slots = { main: { blocks: {} } };
        const token = File.filterIllegalFilenames('email%ü');
        const directory = `message/${token}`;
        const owner = `${directory}/${token}.asset-message-meta.json`;
        for (let index = 0; index < 60; index++) {
            slots.main.blocks[index] = {};
            await write(
                `${directory}/blocks/views.html.slots.[main-${index}].asset-message-meta.html`,
                'block'
            );
        }
        slots.main.blocks[0].slots = { inner: { blocks: { one: {} } } };
        await write(
            `${directory}/blocks/views.html.slots.[main-0].[inner-one].asset-message-meta.html`,
            'nested'
        );
        await write(`${directory}/views.html.content.asset-message-meta.html`, 'html');
        await write(`${directory}/views.html.content.asset-message-meta.ssjs`, 'alternate');
        await write(owner, {
            customerKey: 'email%ü',
            assetType: { name: 'htmlemail' },
            views: { html: { slots } },
        });
        const result = await resolveAssetMigrationFiles(assetRoot, owner);
        assert.equal(result.files.length, 64);
        assert.equal(new Set(result.files.map(({ source }) => source)).size, 64);
    });

    it('supports a flat name-only owner and binary lookup without reading its content', async () => {
        const owner = 'message/binary.asset-message-meta.json';
        await write(owner, {
            customerKey: 'binary',
            assetType: { name: 'message' },
            fileProperties: { extension: 'png' },
        });
        await write('message/binary.png', Buffer.from([0, 255, 1]));
        assert.equal((await resolveAssetMigrationFiles(assetRoot, owner)).files.length, 2);
    });

    it('restricts lookup to the observed source subtype', async () => {
        const item = { customerKey: 'key', assetType: { name: 'jsonmessage' } };
        await write('asset/key.asset-asset-meta.json', item);
        await write('message/key.asset-message-meta.json', item);
        const result = await resolveAssetMigrationFiles(
            assetRoot,
            'message/key.asset-message-meta.json'
        );
        assert.equal(result.files[0].source, 'message/key.asset-message-meta.json');
    });

    it('reuses every coderesource extension recognized by the inherited resolver', async () => {
        for (const extension of [
            'html',
            'ssjs',
            'amp',
            'js',
            'css',
            'rss',
            'txt',
            'xml',
            'jsonc',
        ]) {
            const owner = `coderesource/${extension}.asset-coderesource-meta.json`;
            await write(owner, { customerKey: extension, assetType: { name: 'jscoderesource' } });
            await write(`coderesource/${extension}.asset-coderesource-meta.${extension}`, 'body');
            assert.equal((await resolveAssetMigrationFiles(assetRoot, owner)).files.length, 2);
        }
    });

    it('opt-in resolves unchanged canonical owners through inherited enumeration only', async () => {
        const owner = 'asset/live.asset-asset-meta.json';
        await write(owner, {
            customerKey: 'live',
            assetType: { name: 'asset' },
            fileProperties: { extension: 'bin' },
        });
        await write('asset/live.bin', Buffer.from([0, 255]));
        assert.equal(await resolveAssetMigrationFiles(assetRoot, owner), null);
        const resolved = await resolveAssetMigrationFiles(assetRoot, owner, true);
        assert.equal(resolved.files.length, 2);
        assert.ok(resolved.files.every(({ source, destination }) => source === destination));
        await write(owner, { customerKey: 'live', assetType: { name: 'png' } });
        assert.equal(await resolveAssetMigrationFiles(assetRoot, owner, true), null);
    });

    for (const nested of [false, true]) {
        // Exercise both supported owner layouts independently.
        it(`keeps dotted sibling owners independent in ${nested ? 'nested' : 'flat'} layouts`, async () => {
            const sources = new Map();
            for (const key of ['newsletter', 'newsletter.fr']) {
                const directory = `message/${nested ? key + '/' : ''}`;
                const owner = `${directory}${key}.asset-message-meta.json`;
                const child = nested
                    ? `${directory}views.html.content.asset-message-meta.html`
                    : `${directory}${key}.asset-message-meta.amp`;
                await write(owner, {
                    customerKey: key,
                    assetType: { name: nested ? 'htmlemail' : 'textonlyemail' },
                    views: nested ? { html: {} } : { text: {} },
                });
                await write(child, key);
                sources.set(owner, [owner, child].toSorted());
            }
            for (const [owner, files] of sources) {
                const resolved = await resolveAssetMigrationFiles(assetRoot, owner);
                assert.deepEqual(resolved.files.map(({ source }) => source).toSorted(), files);
                for (const { source, destination } of resolved.files) {
                    const target = path.join(assetRoot, destination);
                    await fs.mkdir(path.dirname(target), { recursive: true });
                    await fs.rename(path.join(assetRoot, source), target);
                }
            }
            for (const files of sources.values()) {
                assert.equal(
                    await fs.readFile(
                        path.join(
                            assetRoot,
                            files
                                .find((file) => !file.endsWith('.json'))
                                .replaceAll('message', 'email')
                        ),
                        'utf8'
                    ),
                    files[0].includes('newsletter.fr') ? 'newsletter.fr' : 'newsletter'
                );
            }
        });
    }

    it('still rejects a dotted orphan without an independent owner', async () => {
        const owner = 'message/newsletter.asset-message-meta.json';
        await write(owner, { customerKey: 'newsletter', assetType: { name: 'message' } });
        await write('message/newsletter.fr.unresolved', 'orphan');
        await assert.rejects(resolveAssetMigrationFiles(assetRoot, owner), /orphan/);
    });

    it('returns null for unknown API names', async () => {
        await write('message/x.asset-message-meta.json', {
            customerKey: 'x',
            assetType: { name: 'unknown' },
        });
        assert.equal(
            await resolveAssetMigrationFiles(assetRoot, 'message/x.asset-message-meta.json'),
            null
        );
    });

    it('blocks orphan companions, ambiguous owners, encodings and destinations without shared mutation', async () => {
        const owner = 'message/key.asset-message-meta.json';
        const item = { customerKey: 'key', assetType: { name: 'message' } };
        await write(owner, item);
        await write('message/key/unresolved.txt', 'orphan');
        await assert.rejects(resolveAssetMigrationFiles(assetRoot, owner), /orphan/);
        await fs.rm(path.join(assetRoot, 'message/key'), { recursive: true });
        await write('message/key/key.asset-message-meta.json', item);
        await assert.rejects(resolveAssetMigrationFiles(assetRoot, owner), /Multiple owner/);
        await fs.rm(path.join(assetRoot, 'message/key'), { recursive: true });
        await write('email/KEY.asset-email-meta.json', item);
        await assert.rejects(resolveAssetMigrationFiles(assetRoot, owner), /destination/);
        await assert.rejects(resolveAssetMigrationFiles(assetRoot, '../escape'), /Unsafe/);
        await write(owner, { ...item, customerKey: 'different' });
        await assert.rejects(resolveAssetMigrationFiles(assetRoot, owner), /encoding/);
    });
});
