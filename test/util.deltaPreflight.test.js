import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { simpleGit } from 'simple-git';
import { analyzeDelta } from '../lib/util/deltaAnalysis.js';
import { preflightDelta } from '../lib/util/deltaPreflight.js';
import MetadataTypeInfo from '../lib/MetadataTypeInfo.js';
import File from '../lib/util/file.js';

const assetRoot = 'nested/retrieve/cred/uat/asset';
const owner = `${assetRoot}/email/key/key.asset-email-meta.json`;
const child = `${assetRoot}/email/key/views.html.content.asset-email-meta.html`;
const identity = async ({ changes }) => ({ changes, diagnostics: [] });

describe('selected destination asset preflight', function () {
    // Real Git subprocesses need a bounded integration budget on Windows and CI.
    this.timeout(30_000);
    let root;
    let git;
    let analysis;
    let shared;

    beforeEach(async () => {
        root = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'mcdev-preflight-')));
        git = simpleGit({
            baseDir: root,
            config: ['core.autocrlf=false', 'commit.gpgsign=false'],
            unsafe: { allowUnsafeHooksPath: true },
        });
        await git.init();
        await git.addConfig('user.name', 'Jörn Berkefeld', false, 'local');
        await git.addConfig('user.email', 'joern.berkefeld@gmail.com', false, 'local');
        await git.addConfig('core.hooksPath', path.join(root, 'no-hooks'), false, 'local');
        shared = [
            MetadataTypeInfo.asset.definition,
            MetadataTypeInfo.asset.properties,
            MetadataTypeInfo.asset.buObject,
        ];
        await write('baseline', 'baseline\n');
        const base = await commit();
        await write(
            owner,
            JSON.stringify({
                customerKey: 'key',
                assetType: { name: 'htmlemail' },
                views: { html: {} },
            })
        );
        await write(child, 'body\n');
        await commit();
        analysis = await analyze(base);
    });

    afterEach(async () => {
        try {
            assert.deepEqual(
                [
                    MetadataTypeInfo.asset.definition,
                    MetadataTypeInfo.asset.properties,
                    MetadataTypeInfo.asset.buObject,
                ],
                shared
            );
        } finally {
            await fs.rm(root, { recursive: true, force: true });
        }
    });

    /**
     * Write only a temporary fixture with literal LF bytes.
     *
     * @param {string} file Git-relative filename
     * @param {string} bytes contents
     * @returns {Promise.<void>} completion
     */
    async function write(file, bytes) {
        const filename = path.join(root, file);
        await fs.mkdir(path.dirname(filename), { recursive: true });
        await fs.writeFile(filename, bytes);
    }

    /**
     * Commit only the isolated test repository.
     *
     * @returns {Promise.<string>} commit ID
     */
    async function commit() {
        await git.add(['--all']);
        await git.commit('fixture');
        return (await git.revparse(['HEAD'])).trim();
    }

    /**
     * Analyze the identical source BU path at both committed endpoints.
     *
     * @param {string} range Git comparison range
     * @returns {Promise.<object>} analysis
     */
    function analyze(range) {
        return analyzeDelta({
            git,
            range,
            retrieveRoot: 'nested/retrieve',
            sourceBUs: ['cred/uat'],
            normalize: identity,
        });
    }

    /**
     * Verify selected source inputs, without generating output.
     *
     * @returns {Promise.<Map<string, string[]>>} manifest
     */
    function verify() {
        return preflightDelta({ git, repositoryRoot: root, analysis });
    }

    it('returns the complete clean source manifest without changing Git status', async () => {
        const before = await git.raw(['status', '--porcelain']);
        assert.deepEqual(
            await verify(),
            new Map([[owner, [path.join(root, owner), path.join(root, child)].toSorted()]])
        );
        assert.equal(await git.raw(['status', '--porcelain']), before);
    });

    for (const file of [owner, child]) {
        // Verify both the owning metadata and its extracted body.
        it(`rejects changed selected bytes: ${file}`, async () => {
            await fs.appendFile(path.join(root, file), ' ');
            await assert.rejects(verify, /bytes differ/);
        });

        it(`rejects missing selected input: ${file}`, async () => {
            await fs.rm(path.join(root, file));
            await assert.rejects(verify, /missing|Missing/);
        });
    }

    it('rejects checkout CRLF rather than normalizing literal Git blob bytes', async () => {
        await write(child, 'body\r\n');
        await assert.rejects(verify, /bytes differ/);
    });

    it('rejects ignored extra selected companions', async () => {
        await write('.gitignore', '*.ignored\n');
        await write(`${assetRoot}/email/key/extra.ignored`, 'extra');
        await assert.rejects(verify, /Extra/);
    });

    it('allows unrelated dirty assets and another BU with the same key', async () => {
        await write(`${assetRoot}/email/unrelated/file`, 'dirty');
        await write(child.replace('/uat/', '/prod/'), 'different target BU');
        await write('baseline', 'dirty');
        assert.equal((await verify()).size, 1);
    });

    it('allows a target other than HEAD when selected inputs match target', async () => {
        const target = analysis.comparison.target;
        await write(child, 'new HEAD body\n');
        await commit();
        await write(child, 'body\n');
        assert.notEqual((await git.revparse(['HEAD'])).trim(), target);
        assert.equal((await verify()).size, 1);
    });

    it('rejects flat/nested owner collisions and alternate subtype copies', async () => {
        await write(
            `${assetRoot}/email/key.asset-email-meta.json`,
            await fs.readFile(path.join(root, owner), 'utf8')
        );
        await assert.rejects(verify, /Extra/);
    });

    it('rejects a symlink or junction in the selected owner boundary', async () => {
        const selectedDirectory = path.dirname(path.join(root, owner));
        const saved = path.join(root, 'saved-owner');
        await fs.rename(selectedDirectory, saved);
        await fs.symlink(saved, selectedDirectory, 'junction');
        await assert.rejects(verify, /Unsafe file type/);
    });

    it('packages the remainder after a selected child deletion, not a deletion instruction', async () => {
        const base = analysis.comparison.target;
        await fs.rm(path.join(root, child));
        await commit();
        analysis = await analyze(base);
        assert.deepEqual(analysis.deletions, []);
        assert.deepEqual((await verify()).get(owner), [path.join(root, owner)]);
    });

    it('requires no packaging inputs for a deleted owner', async () => {
        const base = analysis.comparison.target;
        await fs.rm(path.dirname(path.join(root, owner)), { recursive: true });
        await commit();
        analysis = await analyze(base);
        assert.equal(analysis.deletions.length, 1);
        assert.equal((await verify()).size, 0);
    });

    it('rejects current-layout companions the inherited resolver cannot associate', async () => {
        const base = analysis.comparison.base;
        await write(`${assetRoot}/email/key/orphan.txt`, 'orphan');
        await commit();
        analysis = await analyze(base);
        await assert.rejects(verify, /resolver cannot read/);
    });

    it('rejects committed executable mode when the working mode differs or is unverifiable', async () => {
        const base = analysis.comparison.base;
        await git.raw(['update-index', '--chmod=+x', child]);
        await git.commit('executable fixture');
        analysis = await analyze(base);
        await assert.rejects(verify, /mode mismatch|unverifiable mode/);
    });

    it('rejects a second selected owner instead of returning a partial manifest', async () => {
        const base = analysis.comparison.base;
        const second = `${assetRoot}/email/second.asset-email-meta.json`;
        await write(
            second,
            JSON.stringify({
                customerKey: 'second',
                assetType: { name: 'textonlyemail' },
                views: { text: {} },
            })
        );
        await commit();
        analysis = await analyze(base);
        assert.equal(analysis.selectedOwners.length, 2);
        await fs.appendFile(path.join(root, second), ' ');
        await assert.rejects(verify, /bytes differ/);
    });

    it('rejects legacy or incomplete destination layouts without normalization', async () => {
        const base = analysis.comparison.target;
        const legacy = `${assetRoot}/message/old.asset-message-meta.json`;
        await write(
            legacy,
            JSON.stringify({
                customerKey: 'old',
                assetType: { name: 'textonlyemail' },
                views: { text: {} },
            })
        );
        await commit();
        analysis = await analyze(base);
        await assert.rejects(verify, /not a current asset layout/);
    });

    for (const nested of [false, true]) {
        // Exercise both supported owner layouts independently.
        it(`selects complete key owners without claiming key.fr in ${nested ? 'nested' : 'flat'} layouts`, async () => {
            await fs.rm(path.join(root, assetRoot), { recursive: true });
            const sources = new Map();
            for (const key of ['key', 'key.fr']) {
                const directory = `${assetRoot}/email/${nested ? key + '/' : ''}`;
                const metadata = `${directory}${key}.asset-email-meta.json`;
                const body = nested
                    ? `${directory}views.html.content.asset-email-meta.html`
                    : `${directory}${key}.asset-email-meta.amp`;
                await write(
                    metadata,
                    JSON.stringify({
                        customerKey: key,
                        assetType: { name: nested ? 'htmlemail' : 'textonlyemail' },
                        views: nested ? { html: {} } : { text: {} },
                    })
                );
                await write(body, key);
                sources.set(metadata, body);
            }
            const base = await commit();
            const [[selected, selectedBody], [sibling, siblingBody]] = sources;
            await write(selectedBody, 'changed selected body');
            await commit();
            analysis = await analyze(base);
            assert.equal(analysis.selectedOwners.length, 1);
            assert.deepEqual(
                (await verify()).get(selected),
                [selected, selectedBody].map((file) => path.join(root, file)).toSorted()
            );
            await write(siblingBody, 'unrelated dirty dotted sibling');
            const status = await git.raw(['status', '--porcelain']);
            const manifest = await verify();
            assert.equal(manifest.has(sibling), false);
            assert.equal(manifest.get(selected).length, 2);
            assert.equal(
                await fs.readFile(path.join(root, siblingBody), 'utf8'),
                'unrelated dirty dotted sibling'
            );
            assert.equal(await git.raw(['status', '--porcelain']), status);
        });
    }

    it('still rejects a dotted orphan without an independent owner', async () => {
        await write(`${assetRoot}/email/key.fr.unresolved`, 'orphan');
        await assert.rejects(verify, /Extra/);
    });

    it('packages cleaned binary extensions without claiming independently owned dotted siblings', async () => {
        const base = analysis.comparison.target;
        const binaryOwner = `${assetRoot}/image/picture.asset-image-meta.json`;
        const binary = `${assetRoot}/image/picture.png`;
        const sibling = `${assetRoot}/image/picture.fr.asset-image-meta.json`;
        await write(
            binaryOwner,
            JSON.stringify({
                customerKey: 'picture',
                assetType: { name: 'png' },
                fileProperties: { extension: 'png (4) ' },
            })
        );
        await write(binary, 'binary bytes');
        await write(
            sibling,
            JSON.stringify({
                customerKey: 'picture.fr',
                assetType: { name: 'png' },
                fileProperties: { extension: 'png' },
            })
        );
        await write(`${assetRoot}/image/picture.fr.png`, 'sibling bytes');
        const target = await commit();
        analysis = await analyze(base);
        analysis.selectedOwners = analysis.selectedOwners.filter(
            (item) => item.owner.path === binaryOwner
        );
        await write(`${assetRoot}/image/picture.fr.png`, 'dirty sibling');
        assert.deepEqual(
            (await verify()).get(binaryOwner),
            [binaryOwner, binary].map((file) => path.join(root, file)).toSorted()
        );
        // A dotted owner named exactly like the cleaned binary must not hide a collision.
        await write(
            `${assetRoot}/documents/picture.png/picture.png.asset-documents-meta.json`,
            JSON.stringify({
                customerKey: 'picture.png',
                assetType: { name: 'png' },
                fileProperties: { extension: 'png' },
            })
        );
        await assert.rejects(verify, /Extra|colliding/);
        assert.equal(analysis.comparison.target, target);
    });

    for (const extension of [' png', '../png (4)', 'png/evil (4)', 'png.evil (4)', 'png\t(4)']) {
        // Invalid metadata must fail before any filesystem binary lookup.
        it(`rejects unsafe cleaned binary extension ${extension}`, async () => {
            const base = analysis.comparison.target;
            await write(
                `${assetRoot}/image/invalid.asset-image-meta.json`,
                JSON.stringify({
                    customerKey: 'invalid',
                    assetType: { name: 'png' },
                    fileProperties: { extension },
                })
            );
            await commit();
            analysis = await analyze(base);
            await assert.rejects(verify, /Unsafe binary extension/);
        });
    }

    it('keeps encoded filename tokens distinct from JSON identity', async () => {
        const base = analysis.comparison.target;
        const key = 'slash/key%ü';
        const token = File.filterIllegalFilenames(key);
        const encodedOwner = `${assetRoot}/email/${token}.asset-email-meta.json`;
        await write(
            encodedOwner,
            JSON.stringify({
                customerKey: key,
                assetType: { name: 'textonlyemail' },
                views: { text: {} },
            })
        );
        await write(`${assetRoot}/email/${token}.asset-email-meta.amp`, 'text');
        await commit();
        analysis = await analyze(base);
        assert.equal((await verify()).get(encodedOwner).length, 2);
    });
});
