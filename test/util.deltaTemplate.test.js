import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { mock } from 'node:test';
import { simpleGit } from 'simple-git';
import DevOps from '../lib/util/devops.js';
import mcdev from '../lib/index.js';
import config from '../lib/util/config.js';
import Cli from '../lib/util/cli.js';
import auth from '../lib/util/auth.js';
import Asset from '../lib/metadataTypes/Asset.js';
import { Util } from '../lib/util/util.js';
import File from '../lib/util/file.js';

describe('delta template builds', () => {
    describe('build temporary template lifecycle', () => {
        let properties;
        let options;

        beforeEach(() => {
            properties = { directories: { template: 'original-template', deploy: 'deploy' } };
            options = Util.OPTIONS;
            Util.OPTIONS = { purge: false };
            mock.method(config, 'getProperties', async () => properties);
            mock.method(Util.logger, 'info', () => {});
            mock.method(Util.logger, 'error', () => {});
        });

        afterEach(() => {
            mock.restoreAll();
            Util.OPTIONS = options;
        });

        for (const stage of ['success', 'empty', 'template', 'definition', 'bulk definition']) {
            for (const cleanupFails of [false, true]) {
                // Each stage must restore shared configuration even if both removal attempts fail.
                it(`restores configuration after ${stage}${cleanupFails ? ' with cleanup failure' : ''}`, async () => {
                    const primaryError = new Error(`${stage} failed`);
                    const cleanupError = new Error('cleanup failed');
                    const response = { asset: [{ customerKey: 'key' }] };
                    mock.method(mcdev, 'buildTemplate', async () => {
                        assert.equal(properties.directories.template, '.mcdev/template/');
                        if (stage === 'template') {
                            throw primaryError;
                        }
                        return stage === 'empty' ? {} : response;
                    });
                    const definition = mock.method(mcdev, 'buildDefinition', async () => {
                        if (stage === 'definition') {
                            throw primaryError;
                        }
                        return response;
                    });
                    const bulkDefinition = mock.method(mcdev, 'buildDefinitionBulk', async () => {
                        throw primaryError;
                    });
                    const cleanup = mock.method(File, 'remove', async (directory) => {
                        assert.equal(directory, '.mcdev/template/');
                        if (cleanupFails) {
                            throw cleanupError;
                        }
                    });
                    const operation = mcdev.build(
                        'cred/source',
                        'cred/target',
                        { asset: ['key'] },
                        ['source'],
                        ['target'],
                        stage === 'bulk definition'
                    );
                    if (['template', 'definition', 'bulk definition'].includes(stage)) {
                        await assert.rejects(operation, (error) => error === primaryError);
                    } else if (cleanupFails) {
                        await assert.rejects(operation, (error) => error === cleanupError);
                    } else {
                        assert.equal(await operation, stage === 'empty' ? undefined : response);
                    }
                    assert.equal(properties.directories.template, 'original-template');
                    assert.equal(cleanup.mock.callCount(), cleanupFails ? 2 : 1);
                    assert.equal(
                        definition.mock.callCount(),
                        ['success', 'definition'].includes(stage) ? 1 : 0
                    );
                    assert.equal(
                        bulkDefinition.mock.callCount(),
                        stage === 'bulk definition' ? 1 : 0
                    );
                });
            }
        }

        it('retries transient cleanup failures without changing the successful result', async () => {
            const response = { asset: [{ customerKey: 'key' }] };
            mock.method(mcdev, 'buildTemplate', async () => response);
            mock.method(mcdev, 'buildDefinition', async () => response);
            let attempts = 0;
            mock.method(File, 'remove', async () => {
                if (++attempts === 1) {
                    throw new Error('transient cleanup failure');
                }
            });
            assert.equal(
                await mcdev.build(
                    'cred/source',
                    'cred/target',
                    { asset: ['key'] },
                    ['source'],
                    ['target']
                ),
                response
            );
            assert.equal(attempts, 2);
            assert.equal(properties.directories.template, 'original-template');
        });
    });

    describe('verified delta template consumers', function () {
        // Real Git subprocesses need a bounded integration budget on Windows and CI.
        this.timeout(30_000);
        let root;
        let cwd;
        let git;
        let base;
        let properties;
        let options;
        let skipInteraction;
        let assetProperties;
        let assetBu;
        const directory = 'retrieve/cred/uat/asset/email/key';
        const owner = `${directory}/key.asset-email-meta.json`;
        const body = `${directory}/views.html.content.asset-email-meta.html`;

        beforeEach(async () => {
            cwd = process.cwd();
            options = Util.OPTIONS;
            skipInteraction = Util.skipInteraction;
            assetProperties = Asset.properties;
            assetBu = Asset.buObject;
            root = await fs.realpath(
                await fs.mkdtemp(path.join(os.tmpdir(), 'mcdev-template-test-'))
            );
            process.chdir(root);
            git = simpleGit({
                baseDir: root,
                config: ['core.autocrlf=false', 'commit.gpgsign=false'],
                unsafe: { allowUnsafeHooksPath: true },
            });
            await git.init();
            await git.addConfig('user.name', 'Jörn Berkefeld', false, 'local');
            await git.addConfig('user.email', 'joern.berkefeld@gmail.com', false, 'local');
            await git.addConfig('core.hooksPath', path.join(root, 'no-hooks'), false, 'local');
            await fs.writeFile('baseline', 'baseline');
            base = await commit();
            await fs.mkdir(directory, { recursive: true });
            await fs.writeFile(
                owner,
                JSON.stringify({
                    customerKey: 'key',
                    name: 'Source Email',
                    assetType: { name: 'htmlemail', id: 208 },
                    views: { html: {} },
                })
            );
            await fs.writeFile(body, '<p>Source content</p>');
            await commit();
            properties = {
                directories: {
                    retrieve: 'retrieve',
                    deploy: 'deploy',
                    template: 'template',
                    templateBuilds: ['deploy'],
                },
                credentials: { cred: { businessUnits: { uat: '1', prod: '2' } } },
                options: { deployment: { sourceTargetMapping: { source: 'target' } } },
                marketList: { source: { 'cred/uat': 'source' }, target: { 'cred/prod': 'target' } },
                markets: { source: { label: 'Source' }, target: { label: 'Target' } },
                metaDataTypes: {},
            };
            Util.OPTIONS = { purge: false };
            Util.skipInteraction = {};
            mock.method(config, 'getProperties', async () => properties);
            mock.method(Cli, 'getCredentialObject', async (_properties, bu) => {
                const [credential, businessUnit] = bu.split('/', 2);
                return {
                    credential,
                    businessUnit,
                    mid: properties.credentials[credential].businessUnits[businessUnit],
                };
            });
            mock.method(auth, 'getSDK', () => ({}));
            mock.method(Util, 'startLogger', () => {});
            mock.method(Util.logger, 'debug', () => {});
            mock.method(Util.logger, 'verbose', () => {});
        });

        afterEach(async () => {
            // Restore cwd before any cleanup, including after partial fixture setup.
            process.chdir(cwd);
            mock.restoreAll();
            Util.OPTIONS = options;
            Util.skipInteraction = skipInteraction;
            Asset.properties = assetProperties;
            Asset.buObject = assetBu;
            await fs.rm(root, { recursive: true, force: true });
        });

        /**
         * Commit the fixture snapshot.
         *
         * @returns {Promise.<string>} revision
         */
        async function commit() {
            await git.add(['--all']);
            await git.commit('fixture');
            return (await git.revparse(['HEAD'])).trim();
        }

        it('runs real build/template/definition consumers and localizes output content', async () => {
            const delta = await DevOps.buildDeltaDefinitions(properties, base);
            assert.ok(delta.length);
            const result = await fs.readFile(
                'deploy/cred/prod/asset/email/key/views.html.content.asset-email-meta.html',
                'utf8'
            );
            assert.match(result, /Target content/);
            const metadata = JSON.parse(
                await fs.readFile(
                    'deploy/cred/prod/asset/email/key/key.asset-email-meta.json',
                    'utf8'
                )
            );
            assert.equal(metadata.name, 'Target Email');
            assert.equal(properties.directories.template, 'template');
        });

        for (const mode of ['copy', 'template']) {
            // Independent dotted owners must remain unselected through real consumers.
            it(`preserves a dirty dotted sibling through actual ${mode} output`, async () => {
                await fs.rm(directory, { recursive: true });
                const folder = 'retrieve/cred/uat/asset/email';
                for (const key of ['key', 'key.fr']) {
                    await fs.writeFile(
                        `${folder}/${key}.asset-email-meta.json`,
                        JSON.stringify({
                            customerKey: key,
                            name: 'Source Email',
                            assetType: { name: 'textonlyemail' },
                            views: { text: {} },
                        })
                    );
                    await fs.writeFile(`${folder}/${key}.asset-email-meta.amp`, 'Source original');
                }
                const before = await commit();
                await fs.writeFile(`${folder}/key.asset-email-meta.amp`, 'Source selected');
                await commit();
                const sibling = `${folder}/key.fr.asset-email-meta.amp`;
                const siblingOwner = `${folder}/key.fr.asset-email-meta.json`;
                const siblingMetadata = await fs.readFile(siblingOwner, 'utf8');
                await fs.writeFile(sibling, 'dirty sibling content');
                const delta =
                    mode === 'copy'
                        ? await DevOps.getDeltaList(properties, before, true, 'cred/uat')
                        : await DevOps.buildDeltaDefinitions(properties, before);
                assert.ok(delta.length);
                assert.deepEqual(
                    [...new Set(delta.map((item) => item.externalKey).filter(Boolean))],
                    ['key']
                );
                assert.ok(delta.every((item) => !item.file.includes('key.fr')));
                const output = `deploy/cred/${mode === 'copy' ? 'uat' : 'prod'}/asset/email`;
                assert.deepEqual((await fs.readdir(output)).toSorted(), [
                    'key.asset-email-meta.amp',
                    'key.asset-email-meta.json',
                ]);
                assert.equal(
                    await fs.readFile(`${output}/key.asset-email-meta.amp`, 'utf8'),
                    mode === 'copy' ? 'Source selected' : 'Target selected'
                );
                assert.equal(await fs.readFile(sibling, 'utf8'), 'dirty sibling content');
                assert.equal(await fs.readFile(siblingOwner, 'utf8'), siblingMetadata);
            });
        }

        for (const nested of [false, true]) {
            // Exercise each on-disk owner layout through the complete build chain.
            it(`builds encoded ${nested ? 'nested HTML' : 'flat AMP'} through real delta consumers`, async () => {
                const key = 'slash/key%ü';
                const token = 'slash%2Fkey%25%C3%BC';
                const folder = `retrieve/cred/uat/asset/email${nested ? '/' + token : ''}`;
                await fs.mkdir(folder, { recursive: true });
                await fs.writeFile(
                    `${folder}/${token}.asset-email-meta.json`,
                    JSON.stringify({
                        customerKey: key,
                        name: 'Source Email',
                        assetType: { name: nested ? 'htmlemail' : 'textonlyemail' },
                        views: nested ? { html: {} } : { text: {} },
                    })
                );
                const companion = nested
                    ? 'views.html.content.asset-email-meta.html'
                    : `${token}.asset-email-meta.amp`;
                await fs.writeFile(
                    `${folder}/${companion}`,
                    nested ? '<p>Source content</p>' : 'Source content'
                );
                await commit();
                const delta = await DevOps.buildDeltaDefinitions(properties, base);
                assert.ok(delta.length);
                const deploy = `deploy/cred/prod/asset/email${nested ? '/' + token : ''}`;
                const metadata = JSON.parse(
                    await fs.readFile(`${deploy}/${token}.asset-email-meta.json`, 'utf8')
                );
                assert.equal(metadata.customerKey, key);
                assert.equal(metadata.name, 'Target Email');
                assert.match(await fs.readFile(`${deploy}/${companion}`, 'utf8'), /Target content/);
                const entries = await fs.readdir('deploy/cred/prod/asset/email', {
                    recursive: true,
                });
                assert.ok(
                    entries.every((entry) => !entry.includes('%252F') && !entry.includes('%2525'))
                );
                assert.ok(!entries.includes('slash'));
            });
        }

        it('encodes a localized target key once and preserves its logical JSON value', async () => {
            properties.markets.source.assetKey = 'key';
            properties.markets.target.assetKey = 'slash/key%ü';
            await DevOps.buildDeltaDefinitions(properties, base);
            const token = 'slash%2Fkey%25%C3%BC';
            const folder = `deploy/cred/prod/asset/email/${token}`;
            const metadata = JSON.parse(
                await fs.readFile(`${folder}/${token}.asset-email-meta.json`, 'utf8')
            );
            assert.equal(metadata.customerKey, 'slash/key%ü');
            assert.match(
                await fs.readFile(`${folder}/views.html.content.asset-email-meta.html`, 'utf8'),
                /Target content/
            );
            const entries = await fs.readdir('deploy/cred/prod/asset/email');
            assert.deepEqual(entries, [token]);
        });

        for (const key of ['views', 'email', 'blocks']) {
            // Structural names can also be logical customer keys.
            it(`localizes nested ${key} without renaming structural paths and merges companions`, async () => {
                await fs.rm(directory, { recursive: true });
                const folder = `retrieve/cred/uat/asset/email/${key}`;
                await fs.mkdir(`${folder}/blocks`, { recursive: true });
                await fs.writeFile(
                    `${folder}/${key}.asset-email-meta.json`,
                    JSON.stringify({
                        customerKey: key,
                        name: 'Source Email',
                        assetType: { name: 'htmlemail' },
                        views: { html: { slots: { main: { blocks: { first: {} } } } } },
                    })
                );
                const companion = 'views.html.content.asset-email-meta.html';
                const block = 'blocks/views.html.slots.[main-first].asset-email-meta.html';
                await fs.writeFile(`${folder}/${companion}`, '<p>Source content</p>');
                await fs.writeFile(`${folder}/${block}`, '<p>Source block</p>');
                Asset.properties = properties;
                Asset.buObject = { credential: 'cred', businessUnit: 'uat' };
                const template = await Asset.buildTemplate(
                    'retrieve/cred/uat',
                    'template',
                    key,
                    { label: 'Source' },
                    [
                        path.resolve(`${folder}/${key}.asset-email-meta.json`),
                        path.resolve(`${folder}/${companion}`),
                        path.resolve(`${folder}/${block}`),
                    ]
                );
                // Author the key placeholder explicitly: replacing a bare structural word globally
                // would also replace JSON property/type names, an unrelated templating behavior.
                const binding = /** @type {Awaited<ReturnType<typeof Asset.buildBoundAsset>>} */ (
                    template
                ).binding;
                const templateMetadata = JSON.parse(await fs.readFile(binding.ownerPath, 'utf8'));
                templateMetadata.customerKey = '{{{assetKey}}}';
                binding.customerKey = templateMetadata.customerKey;
                await fs.writeFile(binding.ownerPath, JSON.stringify(templateMetadata));
                await Asset.buildBoundAsset(
                    'template',
                    'deploy/cred/prod',
                    key,
                    { label: 'Target', assetKey: 'localized' },
                    binding,
                    true
                );
                const deploy = 'deploy/cred/prod/asset/email/localized';
                assert.deepEqual(await fs.readdir('deploy/cred/prod/asset'), ['email']);
                assert.deepEqual(await fs.readdir('deploy/cred/prod/asset/email'), ['localized']);
                assert.deepEqual((await fs.readdir(deploy)).toSorted(), [
                    'blocks',
                    'localized.asset-email-meta.json',
                    companion,
                ]);
                assert.deepEqual(await fs.readdir(`${deploy}/blocks`), [path.basename(block)]);
                const metadata = JSON.parse(
                    await fs.readFile(`${deploy}/localized.asset-email-meta.json`, 'utf8')
                );
                assert.equal(metadata.customerKey, 'localized');
                await Asset._mergeCode(metadata, 'deploy/cred/prod', 'email');
                assert.equal(metadata.views.html.content, '<p>Target content</p>');
                assert.equal(
                    metadata.views.html.slots.main.blocks.first.content,
                    '<p>Target block</p>'
                );
            });
        }

        it('rejects ambiguous verified owners before output', async () => {
            const duplicate = 'retrieve/cred/uat/asset/block/key.asset-block-meta.json';
            await fs.mkdir(path.dirname(duplicate), { recursive: true });
            await fs.writeFile(
                duplicate,
                JSON.stringify({ customerKey: 'key', assetType: { name: 'htmlblock' } })
            );
            await assert.rejects(
                Asset.buildTemplate('retrieve/cred/uat', 'ambiguous-owner', 'key', {}, [
                    path.resolve(owner),
                    path.resolve(duplicate),
                ]),
                /unique verified owner/
            );
            await assert.rejects(fs.access('ambiguous-owner'));
        });

        it('rejects a verified companion set without an owner before output', async () => {
            await assert.rejects(
                Asset.buildTemplate('retrieve/cred/uat', 'missing-owner', 'key', {}, [
                    path.resolve(body),
                ]),
                /unique verified owner/
            );
            await assert.rejects(fs.access('missing-owner'));
        });

        it('templates the surviving owner when an extracted child was removed', async () => {
            const removed = `${directory}/obsolete.asset-email-meta.html`;
            await fs.writeFile(removed, 'obsolete');
            const before = await commit();
            await fs.rm(removed);
            await commit();
            const delta = await DevOps.buildDeltaDefinitions(properties, before);
            assert.ok(delta.every((item) => item.gitAction !== 'delete'));
            assert.match(
                await fs.readFile(
                    'deploy/cred/prod/asset/email/key/views.html.content.asset-email-meta.html',
                    'utf8'
                ),
                /Target content/
            );
            await assert.rejects(
                fs.access('deploy/cred/prod/asset/email/key/obsolete.asset-email-meta.html')
            );
        });

        it('rejects missing, dirty and extra inputs before any output', async () => {
            for (const condition of ['missing', 'dirty', 'extra']) {
                await fs.writeFile(body, '<p>Source content</p>');
                if (condition === 'missing') {
                    await fs.rm(body);
                } else if (condition === 'dirty') {
                    await fs.writeFile(body, 'dirty');
                } else {
                    await fs.writeFile(`${directory}/extra.asset-email-meta.html`, 'extra');
                }
                await assert.rejects(
                    DevOps.buildDeltaDefinitions(properties, base),
                    /preflight failed/
                );
                for (const output of ['logs', '.mcdev', 'deploy']) {
                    await assert.rejects(fs.access(output));
                }
            }
        });

        it('rejects missing manifest entries instead of falling back to discovery', async () => {
            await assert.rejects(
                mcdev.build(
                    'cred/uat',
                    undefined,
                    { asset: ['key'] },
                    ['source'],
                    ['target'],
                    true,
                    undefined,
                    new Map([['key', undefined]])
                ),
                /no verified template inputs/
            );
            assert.equal(properties.directories.template, 'template');
            await assert.rejects(fs.access('deploy'));
        });

        it('preserves ordinary asset template callers without a verified selection', async () => {
            Asset.properties = properties;
            Asset.buObject = { credential: 'cred', businessUnit: 'uat' };
            await Asset.buildTemplate('retrieve/cred/uat', 'ordinary-output', 'key', {
                label: 'Source',
            });
            assert.match(
                await fs.readFile(
                    'ordinary-output/asset/email/key/views.html.content.asset-email-meta.html',
                    'utf8'
                ),
                /\{\{\{label\}\}\} content/
            );
        });

        it('does not rediscover an unselected duplicate owner in another subtype', async () => {
            const prepared = await DevOps._prepareDelta(properties, base, 'cred/uat', 10);
            await fs.mkdir('retrieve/cred/uat/asset/block', { recursive: true });
            await fs.writeFile(
                'retrieve/cred/uat/asset/block/key.asset-block-meta.json',
                JSON.stringify({
                    customerKey: 'key',
                    name: 'Wrong owner',
                    assetType: { name: 'htmlblock' },
                })
            );
            Asset.properties = properties;
            Asset.buObject = { credential: 'cred', businessUnit: 'uat' };
            await Asset.buildTemplate(
                'retrieve/cred/uat',
                'isolated-output',
                'key',
                { label: 'Source' },
                prepared.manifest.get(owner)
            );
            const metadata = JSON.parse(
                await fs.readFile(
                    'isolated-output/asset/email/key/key.asset-email-meta.json',
                    'utf8'
                )
            );
            assert.equal(metadata.name, '{{{label}}} Email');
            assert.match(
                await fs.readFile(
                    'isolated-output/asset/email/key/views.html.content.asset-email-meta.html',
                    'utf8'
                ),
                /\{\{\{label\}\}\} content/
            );
        });
    });
});
