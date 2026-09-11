import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { mock } from 'node:test';
import { simpleGit } from 'simple-git';
import DevOps from '../lib/util/devops.js';
import Builder from '../lib/Builder.js';
import mcdev from '../lib/index.js';
import File from '../lib/util/file.js';
import Cli from '../lib/util/cli.js';
import { Util } from '../lib/util/util.js';
import config from '../lib/util/config.js';
import childProcess from 'node:child_process';
import MetadataType from '../lib/MetadataTypeInfo.js';

describe('delta caller output barrier', function () {
    // Real Git subprocesses need a bounded integration budget on Windows and CI.
    this.timeout(30_000);
    let root;
    let cwd;
    let git;
    let base;
    let properties;
    let sandbox;
    let output;
    let document;
    let warn;
    let error;
    let purge;
    let build;
    let skipInteraction;
    let options;

    beforeEach(async () => {
        cwd = process.cwd();
        options = Util.OPTIONS;
        skipInteraction = Util.skipInteraction;
        root = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'mcdev-caller-')));
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
        await fs.writeFile(path.join(root, 'baseline'), 'baseline\n');
        base = await commit();
        for (const bu of ['uat', 'qa']) {
            await writeAsset(bu);
        }
        await commit();
        properties = {
            directories: { retrieve: 'nested/retrieve', deploy: 'deploy' },
            credentials: { cred: { businessUnits: { uat: '1', qa: '2' } } },
            options: {
                deployment: { sourceTargetMapping: { sourceUat: 'target', sourceQa: 'target' } },
            },
            marketList: {
                sourceUat: { 'cred/uat': 'market' },
                sourceQa: { 'cred/qa': 'market' },
                target: { 'cred/prod': 'market' },
            },
            markets: { market: {} },
            metaDataTypes: {},
        };
        sandbox = {
            /**
             * Track a replaceable output boundary.
             *
             * @param {object} object method owner
             * @param {string} method method name
             * @returns {object} call assertions and async response setter
             */
            stub(object, method) {
                const fn = mock.method(object, method, () => {});
                const result = {
                    /**
                     * Read recorded invocation evidence.
                     *
                     * @returns {unknown} recorded calls
                     */
                    get callCount() {
                        return fn.mock.callCount();
                    },
                    /**
                     * Read recorded invocation evidence.
                     *
                     * @returns {unknown} recorded calls
                     */
                    get firstCall() {
                        return { args: fn.mock.calls[0].arguments };
                    },
                    /**
                     * Read recorded invocation evidence.
                     *
                     * @returns {unknown} recorded calls
                     */
                    getCalls() {
                        return fn.mock.calls.map((call) => ({ args: call.arguments }));
                    },
                    /**
                     * Supply an asynchronous output result.
                     *
                     * @param {unknown} value mock response
                     * @returns {object} assertion handle
                     */
                    resolves(value) {
                        fn.mock.mockImplementation(async () => value);
                        return result;
                    },
                };
                return result;
            },
            /**
             *
             */
            restore() {
                mock.restoreAll();
            },
        };
        sandbox.stub(Util, 'verifyMarketList');
        sandbox.stub(Util.logger, 'info');
        warn = sandbox.stub(Util.logger, 'warn');
        error = sandbox.stub(Util.logger, 'error');
        output = sandbox.stub(File, 'writeJSONToFile').resolves();
        document = sandbox.stub(DevOps, 'document');
        purge = sandbox.stub(Builder, 'purgeDeployFolderList').resolves();
        build = sandbox.stub(mcdev, 'build').resolves();
        Util.OPTIONS = { purge: true };
        Util.skipInteraction = {};
    });

    afterEach(async () => {
        // Restore cwd even when setup fails before installing the mock sandbox.
        process.chdir(cwd);
        mock.restoreAll();
        Util.OPTIONS = options;
        Util.skipInteraction = skipInteraction;
        await fs.rm(root, { recursive: true, force: true });
    });

    /**
     * Commit an isolated fixture snapshot.
     *
     * @returns {Promise.<string>} revision
     */
    async function commit() {
        await git.add(['--all']);
        await git.commit('fixture');
        return (await git.revparse(['HEAD'])).trim();
    }

    /**
     * Write one current-layout asset with an extracted component.
     *
     * @param {string} bu source BU
     * @returns {Promise.<void>} completion
     */
    async function writeAsset(bu) {
        const directory = path.join(root, `nested/retrieve/cred/${bu}/asset/email/key`);
        await fs.mkdir(directory, { recursive: true });
        await fs.writeFile(
            path.join(directory, 'key.asset-email-meta.json'),
            JSON.stringify({
                customerKey: 'key',
                name: 'Email',
                assetType: { name: 'htmlemail' },
                views: { html: {} },
            })
        );
        await fs.writeFile(
            path.join(directory, 'views.html.content.asset-email-meta.html'),
            'body\n'
        );
    }

    it('preserves deploy sentinels and purge for two purely structural migration mappings', async () => {
        for (const bu of ['uat', 'qa']) {
            const assetRoot = `nested/retrieve/cred/${bu}/asset`;
            await fs.rename(`${assetRoot}/email`, `${assetRoot}/message`);
            for (const name of await fs.readdir(`${assetRoot}/message/key`)) {
                await fs.rename(
                    `${assetRoot}/message/key/${name}`,
                    `${assetRoot}/message/key/${name.replace('asset-email-meta', 'asset-message-meta')}`
                );
            }
        }
        const before = await commit();
        for (const bu of ['uat', 'qa']) {
            const assetRoot = `nested/retrieve/cred/${bu}/asset`;
            await fs.rename(`${assetRoot}/message`, `${assetRoot}/email`);
            for (const name of await fs.readdir(`${assetRoot}/email/key`)) {
                await fs.rename(
                    `${assetRoot}/email/key/${name}`,
                    `${assetRoot}/email/key/${name.replace('asset-message-meta', 'asset-email-meta')}`
                );
            }
        }
        await commit();
        properties.options.deployment.sourceTargetMapping.sourceQa = 'targetQa';
        properties.marketList.targetQa = { 'cred/sit': 'market' };
        for (const bu of ['prod', 'sit']) {
            await fs.mkdir(`deploy/cred/${bu}`, { recursive: true });
            await fs.writeFile(`deploy/cred/${bu}/sentinel`, bu);
        }
        mock.method(Builder, 'purgeDeployFolderList', async (target) => {
            const bu = Object.keys(properties.marketList[target])[0];
            await fs.rm(`deploy/${bu}`, { recursive: true, force: true });
        });
        assert.deepEqual(await DevOps.buildDeltaDefinitions(properties, before), []);
        assert.equal(Util.OPTIONS.purge, true);
        assert.equal(output.callCount + build.callCount + document.callCount, 0);
        for (const bu of ['prod', 'sit']) {
            assert.equal(await fs.readFile(`deploy/cred/${bu}/sentinel`, 'utf8'), bu);
        }
    });

    it('purges only a mapping with applicable Git build output', async () => {
        properties.options.deployment.sourceTargetMapping.sourceQa = 'targetQa';
        properties.marketList.targetQa = { 'cred/sit': 'market' };
        const before = (await git.revparse(['HEAD'])).trim();
        await fs.writeFile(
            'nested/retrieve/cred/uat/asset/email/key/views.html.content.asset-email-meta.html',
            'changed\n'
        );
        await commit();
        const delta = await DevOps.buildDeltaDefinitions(properties, before);
        assert.ok(delta.length);
        assert.equal(purge.callCount, 1);
        assert.deepEqual(purge.firstCall.args, ['target']);
        assert.equal(build.callCount, 1);
    });

    it('preserves excluded mapping output while purging only effective market keys', async () => {
        properties.options.deployment.sourceTargetMapping.sourceQa = 'targetQa';
        properties.marketList.targetQa = { 'cred/sit': 'market' };
        properties.marketList.sourceQa.filter = { exclude: { key: { '*': ['k*'] } } };
        await fs.mkdir('deploy/cred/sit', { recursive: true });
        await fs.writeFile('deploy/cred/sit/sentinel', 'retained');
        const purged = [];
        mock.method(Builder, 'purgeDeployFolderList', async (target) => {
            purged.push(target);
            const bu = Object.keys(properties.marketList[target])[0];
            await fs.rm(`deploy/${bu}`, { recursive: true, force: true });
        });
        await DevOps.buildDeltaDefinitions(properties, base);
        assert.deepEqual(purged, ['target']);
        assert.equal(await fs.readFile('deploy/cred/sit/sentinel', 'utf8'), 'retained');
        assert.equal(build.callCount, 1);
        assert.deepEqual(build.firstCall.args[2], { asset: ['key'] });
    });

    it('leaves purge unconsumed when both mapping key selections are empty', async () => {
        properties.marketList.sourceUat.filter = { exclude: { key: { asset: ['key'] } } };
        properties.marketList.sourceQa.filter = { include: { key: { '*': ['other*'] } } };
        await DevOps.buildDeltaDefinitions(properties, base);
        assert.equal(purge.callCount + build.callCount, 0);
        assert.equal(Util.OPTIONS.purge, true);
    });

    it('ignores empty filter arrays and purges overlapping targets before building', async () => {
        properties.marketList.sourceUat.filter = {
            include: { key: { '*': [], asset: ['k*'] } },
            exclude: { key: { asset: [] } },
        };
        properties.marketList.sourceQa.filter = { exclude: { key: { asset: ['k*'] } } };
        await DevOps.buildDeltaDefinitions(properties, base);
        assert.equal(purge.callCount, 1);
        assert.equal(build.callCount, 1);
        assert.deepEqual(build.firstCall.args[2], { asset: ['key'] });
        assert.equal(Util.OPTIONS.purge, false);
    });

    it('preflights assets even when their market keys are excluded', async () => {
        properties.marketList.sourceQa.filter = { exclude: { key: { asset: ['key'] } } };
        await fs.writeFile(
            'nested/retrieve/cred/qa/asset/email/key/views.html.content.asset-email-meta.html',
            'dirty\n'
        );
        await assert.rejects(DevOps.buildDeltaDefinitions(properties, base), /preflight failed/);
        assert.equal(output.callCount + purge.callCount + build.callCount, 0);
    });

    it('does not purge mappings whose Git build types are excluded', async () => {
        properties.metaDataTypes.createDeltaPkg = ['query'];
        assert.ok((await DevOps.buildDeltaDefinitions(properties, base)).length);
        assert.equal(build.callCount, 0);
        assert.equal(purge.callCount, 0);
        assert.equal(Util.OPTIONS.purge, true);
    });

    it('emits no report, purge, template or deletes when a later mapping fails preflight', async () => {
        await fs.writeFile(
            path.join(
                root,
                'nested/retrieve/cred/qa/asset/email/key/views.html.content.asset-email-meta.html'
            ),
            'dirty\n'
        );
        const deletes = sandbox.stub(DevOps, '_generateDeleteInstructions');
        await assert.rejects(DevOps.buildDeltaDefinitions(properties, base), /preflight failed/);
        assert.equal(output.callCount, 0);
        assert.equal(purge.callCount, 0);
        assert.equal(build.callCount, 0);
        assert.equal(deletes.callCount, 0);
        assert.equal(document.callCount, 0);
        assert.equal(Util.OPTIONS.purge, true);
    });

    it('emits no outputs when a later mapping has ambiguous committed ownership', async () => {
        const directory = path.join(root, 'nested/retrieve/cred/qa/asset/email/duplicate');
        await fs.mkdir(directory, { recursive: true });
        await fs.writeFile(
            path.join(directory, 'duplicate.asset-email-meta.json'),
            JSON.stringify({
                customerKey: 'key',
                name: 'Duplicate',
                assetType: { name: 'htmlemail' },
            })
        );
        await commit();
        await assert.rejects(DevOps.buildDeltaDefinitions(properties, base));
        assert.equal(output.callCount + purge.callCount + build.callCount, 0);
        assert.equal(document.callCount, 0);
    });

    it('blocks direct-filter copying before reports and cleanup for dirty selected inputs', async () => {
        await fs.writeFile(
            path.join(
                root,
                'nested/retrieve/cred/uat/asset/email/key/views.html.content.asset-email-meta.html'
            ),
            'dirty\n'
        );
        const copy = sandbox.stub(File, 'copyFileSimple');
        const remove = sandbox.stub(File, 'remove');
        await assert.rejects(
            DevOps.getDeltaList(properties, base, true, 'cred/uat'),
            /preflight failed/
        );
        assert.equal(output.callCount + copy.callCount + remove.callCount, 0);
    });

    it('uses exact supplied range mapping and only its source BU', async () => {
        properties.options.deployment.branchSourceTargetMapping = {
            [base]: { sourceUat: 'target' },
        };
        await fs.writeFile(
            path.join(
                root,
                'nested/retrieve/cred/qa/asset/email/key/views.html.content.asset-email-meta.html'
            ),
            'unrelated dirty input\n'
        );
        const delta = await DevOps.buildDeltaDefinitions(properties, base);
        assert.ok(delta.length);
        assert.ok(delta.every((file) => file._businessUnit === 'uat'));
        assert.equal(build.callCount, 1);
        assert.equal(build.firstCall.args[0], 'cred/uat');
        assert.deepEqual(build.firstCall.args[2], { asset: ['key'] });
    });

    it('preserves arbitrary public explicit lists without Git or a trusted manifest', async () => {
        const range = 'not-a-git-ref..also-not-a-ref';
        properties.options.deployment.branchSourceTargetMapping = {
            [range]: { sourceUat: 'target' },
        };
        properties.marketList.sourceUat.filter = { asset: ['custom'] };
        /** @type {(import('../types/mcdev.d.js').DeltaPkgItem & { custom: string })[]} */
        const records = [
            {
                changes: 0,
                insertions: 0,
                deletions: 0,
                binary: false,
                moved: true,
                file: 'caller-managed/legacy.asset-message-meta.json',
                type: 'asset',
                externalKey: 'caller-key',
                name: 'Caller asset',
                gitAction: 'move',
                _credential: 'external',
                _businessUnit: 'source',
                custom: 'unchanged',
            },
        ];
        const original = structuredClone(records);
        sandbox.stub(config, 'getProperties').resolves(properties);
        sandbox.stub(Util, 'startLogger');
        const prepare = sandbox.stub(DevOps, '_prepareDelta');
        const publish = sandbox.stub(DevOps, '_publishDelta');
        const spawn = sandbox.stub(childProcess, 'spawn');
        const delta = await mcdev.createDeltaPkg({ commitrange: range, diffArr: records });
        assert.deepEqual(delta, original);
        assert.equal(delta[0], records[0]);
        assert.deepEqual(records, original);
        assert.equal(prepare.callCount + publish.callCount + spawn.callCount, 0);
        assert.equal(output.callCount + purge.callCount, 0);
        assert.equal(build.callCount, 1);
        assert.deepEqual(build.firstCall.args, [
            'external/source',
            undefined,
            { asset: ['caller-key'] },
            ['market'],
            ['target'],
            true,
            properties.marketList.sourceUat.filter,
            undefined,
        ]);
    });

    it('treats an empty public explicit list as no selection without cleanup', async () => {
        sandbox.stub(config, 'getProperties').resolves(properties);
        sandbox.stub(Util, 'startLogger');
        const prepare = sandbox.stub(DevOps, '_prepareDelta');
        const publish = sandbox.stub(DevOps, '_publishDelta');
        const spawn = sandbox.stub(childProcess, 'spawn');
        const deletes = sandbox.stub(DevOps, '_generateDeleteInstructions');
        assert.deepEqual(await mcdev.createDeltaPkg({ diffArr: [] }), []);
        assert.equal(prepare.callCount + publish.callCount + spawn.callCount, 0);
        assert.equal(output.callCount + purge.callCount + build.callCount + deletes.callCount, 0);
        assert.equal(document.callCount, 0);
        assert.equal(Util.OPTIONS.purge, true);
    });

    it('reuses supplied records across generic mappings with legacy explicit deletions', async () => {
        /** @type {Omit<import('../types/mcdev.d.js').DeltaPkgItem, 'file' | 'externalKey' | 'gitAction'>} */
        const common = {
            _credential: 'cred',
            _businessUnit: 'uat',
            type: 'asset',
            name: '',
            changes: 0,
            insertions: 0,
            deletions: 0,
            binary: false,
            moved: false,
        };
        /** @type {import('../types/mcdev.d.js').DeltaPkgItem[]} */
        const records = [
            {
                ...common,
                file: 'build.json',
                name: 'Named',
                externalKey: 'build',
                gitAction: 'add/update',
            },
            {
                ...common,
                file: 'unnamed.json',
                name: '',
                externalKey: 'unnamed',
                gitAction: 'add/update',
            },
            { ...common, externalKey: 'owner', gitAction: 'delete', file: 'owner.json' },
            { ...common, externalKey: 'child', gitAction: 'delete', file: 'child.html' },
            {
                ...common,
                type: 'query',
                externalKey: 'query',
                gitAction: 'delete',
                file: 'query.sql',
            },
        ];
        properties.markets.market = { token: 'owner' };
        const spawn = sandbox.stub(childProcess, 'spawn');
        assert.deepEqual(await DevOps.buildDeltaDefinitions(properties, undefined, records), [
            records[0],
            records[0],
        ]);
        assert.equal(spawn.callCount, 0);
        assert.equal(build.callCount, 2);
        assert.equal(purge.callCount, 2);
        assert.equal(Util.OPTIONS.purge, false);
        assert.ok(build.getCalls().every((call) => call.args[7] === undefined));
        const instructions = warn
            .getCalls()
            .map((call) => call.args[0])
            .filter((message) => message.startsWith('mcdev delete'));
        assert.equal(instructions.length, 2);
        assert.ok(instructions.every((message) => message.includes('asset:"owner"')));
        assert.ok(instructions.every((message) => message.includes('query:"query"')));
        assert.ok(instructions.every((message) => !message.includes('child')));
    });

    it('retains public error handling for explicit-list build failures', async () => {
        sandbox.stub(config, 'getProperties').resolves(properties);
        sandbox.stub(Util, 'startLogger');
        mock.method(mcdev, 'build', async () => {
            throw new Error('caller build failed');
        });
        assert.equal(
            await mcdev.createDeltaPkg({
                diffArr: [
                    {
                        name: 'Named',
                        type: 'asset',
                        externalKey: 'key',
                        file: 'key.json',
                        changes: 0,
                        insertions: 0,
                        deletions: 0,
                        binary: false,
                        moved: false,
                        gitAction: 'add/update',
                        _credential: 'cred',
                        _businessUnit: 'uat',
                    },
                ],
            }),
            undefined
        );
        assert.ok(error.getCalls().some((call) => call.args[0] === 'caller build failed'));
    });

    it('ignores explicit lists in direct-filter mode and retains Git preflight', async () => {
        sandbox.stub(config, 'getProperties').resolves(properties);
        sandbox.stub(Util, 'startLogger');
        await fs.writeFile(
            path.join(
                root,
                'nested/retrieve/cred/uat/asset/email/key/views.html.content.asset-email-meta.html'
            ),
            'dirty\n'
        );
        const copy = sandbox.stub(File, 'copyFileSimple');
        const remove = sandbox.stub(File, 'remove');
        assert.equal(
            await mcdev.createDeltaPkg({ commitrange: base, filter: 'cred/uat', diffArr: [] }),
            undefined
        );
        assert.ok(error.getCalls().some((call) => call.args[0].includes('preflight failed')));
        assert.equal(output.callCount + copy.callCount + remove.callCount, 0);
    });

    it('copies actual assets and nonasset companions from a nested project with custom directories', async () => {
        const project = path.join(root, 'project');
        await fs.mkdir(project);
        await fs.rename(path.join(root, 'nested/retrieve'), path.join(project, 'custom-input'));
        const queryDirectory = path.join(project, 'custom-input/cred/uat/query');
        await fs.mkdir(queryDirectory, { recursive: true });
        await fs.writeFile(
            path.join(queryDirectory, 'query.query-meta.json'),
            JSON.stringify({
                customerKey: 'query',
                name: 'Query',
            })
        );
        await fs.writeFile(path.join(queryDirectory, 'query.query-meta.sql'), 'SELECT 1');
        base = await commit();
        await fs.writeFile(
            path.join(queryDirectory, 'query.query-meta.json'),
            JSON.stringify({
                customerKey: 'query',
                name: 'Changed query',
            })
        );
        await fs.writeFile(
            path.join(
                project,
                'custom-input/cred/uat/asset/email/key/views.html.content.asset-email-meta.html'
            ),
            'changed body\n'
        );
        await commit();
        process.chdir(project);
        properties.directories = { retrieve: 'custom-input', deploy: 'custom-output' };
        sandbox
            .stub(Cli, 'getCredentialObject')
            .resolves({ credential: 'cred', businessUnit: 'uat' });
        sandbox
            .stub(MetadataType.query, 'getFilesToCommit')
            .resolves(['custom-input/cred/uat/query/query.query-meta.sql']);
        await DevOps.getDeltaList(properties, base, true, 'cred/uat');
        for (const relative of [
            'asset/email/key/key.asset-email-meta.json',
            'asset/email/key/views.html.content.asset-email-meta.html',
            'query/query.query-meta.json',
            'query/query.query-meta.sql',
        ]) {
            assert.equal(
                await fs.readFile(path.join(project, 'custom-output/cred/uat', relative), 'utf8'),
                await fs.readFile(path.join(project, 'custom-input/cred/uat', relative), 'utf8')
            );
        }
    });

    it('rejects companion paths outside configured retrieve before cleanup', async () => {
        const queryDirectory = 'nested/retrieve/cred/uat/query';
        await fs.mkdir(queryDirectory, { recursive: true });
        await fs.writeFile(
            `${queryDirectory}/query.query-meta.json`,
            JSON.stringify({
                customerKey: 'query',
                name: 'Query',
            })
        );
        await commit();
        sandbox
            .stub(Cli, 'getCredentialObject')
            .resolves({ credential: 'cred', businessUnit: 'uat' });
        sandbox.stub(MetadataType.query, 'getFilesToCommit').resolves(['outside.sql']);
        const remove = sandbox.stub(File, 'remove');
        const copy = sandbox.stub(File, 'copyFileSimple');
        await assert.rejects(
            DevOps.getDeltaList(properties, base, true, 'cred/uat'),
            /outside.*retrieve/i
        );
        assert.equal(remove.callCount + copy.callCount, 0);
    });

    it('copies the verified owner and companions for a child-only removal', async () => {
        const directory = 'nested/retrieve/cred/uat/asset/email/key/';
        const removed = directory + 'obsolete.asset-email-meta.html';
        await fs.writeFile(path.join(root, removed), 'old\n');
        const before = await commit();
        await fs.rm(path.join(root, removed));
        await commit();
        const copy = sandbox.stub(File, 'copyFileSimple').resolves({ status: 'ok' });
        const remove = sandbox.stub(File, 'remove').resolves();
        sandbox
            .stub(Cli, 'getCredentialObject')
            .resolves({ credential: 'cred', businessUnit: 'uat' });
        const delta = await DevOps.getDeltaList(properties, before, true, 'cred/uat');
        assert.ok(delta.length);
        assert.ok(delta.every((file) => file.gitAction !== 'delete'));
        assert.deepEqual(
            copy
                .getCalls()
                .map((call) => call.args[0])
                .toSorted(),
            [
                path.resolve(directory, 'key.asset-email-meta.json'),
                path.resolve(directory, 'views.html.content.asset-email-meta.html'),
            ].toSorted()
        );
        assert.equal(remove.callCount, 1);
        assert.ok(
            copy
                .getCalls()
                .every((call) =>
                    call.args[1].startsWith(path.resolve('deploy/cred/uat') + path.sep)
                )
        );
    });
});
