import assert from 'node:assert/strict';
import childProcess from 'node:child_process';
import { mock } from 'node:test';
import { syncBuiltinESMExports } from 'node:module';
import Init from '../lib/util/init.js';
import InitGit from '../lib/util/init.git.js';
import Cli from '../lib/util/cli.js';
import File from '../lib/util/file.js';
import config from '../lib/util/config.js';
import DevOps from '../lib/util/devops.js';
import Builder from '../lib/Builder.js';
import Mcdev from '../lib/index.js';
import { Util } from '../lib/util/util.js';

const properties = /** @type {import('../types/mcdev.d.js').Mcdevrc} */ (
    /** @type {unknown} */ ({
        credentials: {
            cred: { businessUnits: { source1: 1, source2: 2, target1: 3, target2: 4 } },
        },
        markets: { market1: {}, market2: {} },
        options: {
            deployment: { sourceTargetMapping: { source1: 'target1', source2: 'target2' } },
        },
        marketList: {
            source1: { 'cred/source1': 'market1', description: 'keep this' },
            source2: { 'cred/source2': 'market2' },
            target1: { 'cred/target1': 'market1' },
            target2: { 'cred/target2': 'market2' },
        },
    })
);

describe('optional Git workflows', () => {
    let exitCode;
    let options;
    let warning;

    beforeEach(() => {
        exitCode = process.exitCode;
        options = Util.OPTIONS;
        process.exitCode = undefined;
        Util.OPTIONS = { purge: true };
        mock.method(childProcess, 'spawnSync', () => ({
            error: new Error('ENOENT'),
            status: null,
        }));
        syncBuiltinESMExports();
        warning = mock.method(Util.logger, 'warn', () => Util.logger);
        mock.method(Util.logger, 'info', () => Util.logger);
        mock.method(Util, 'execSync', () => assert.fail('unexpected subprocess'));
        mock.method(InitGit, 'gitPush', async () => assert.fail('unexpected push'));
        mock.method(InitGit, '_updateGitConfigUser', async () => assert.fail('unexpected config'));
        mock.method(InitGit, '_addGitRemote', async () => assert.fail('unexpected remote'));
    });

    afterEach(() => {
        mock.restoreAll();
        syncBuiltinESMExports();
        Util.OPTIONS = options;
        process.exitCode = exitCode;
    });

    it('warns and returns an explicit unavailable status without Git setup', async () => {
        assert.deepEqual(await InitGit.initGitRepo(), { status: 'unavailable', repoName: null });
        assert.equal(process.exitCode, undefined);
        assert.match(warning.mock.calls[0].arguments[0], /Continuing without Git/);
    });

    it('retains actual initialization failures when Git is available', async () => {
        mock.method(childProcess, 'spawnSync', () => ({ status: 0 }));
        syncBuiltinESMExports();
        mock.method(File, 'pathExists', async () => false);
        mock.method(Util, 'execSync', () => {
            throw new Error('git init failed');
        });
        await assert.rejects(InitGit.initGitRepo(), /git init failed/);
    });

    it('continues tooling, credentials, markets and optional retrieval without commits or push', async () => {
        const calls = [];
        mock.method(Init, '_checkPathForCloud', async () => true);
        mock.method(File, 'pathExists', async () => false);
        mock.method(Init, 'upgradeProject', async (_properties, initial, repoName) => {
            assert.equal(initial, true);
            assert.equal(repoName, null);
            calls.push('tooling');
            return true;
        });
        mock.method(Cli, 'initMcdevConfig', async () => {
            calls.push('credentials');
            return true;
        });
        mock.method(Init, '_initMarkets', async () => {
            calls.push('markets');
        });
        mock.method(Init, '_downloadAllBUs', async (bu, status) => {
            assert.equal(bu, '"*"');
            assert.equal(status, 'unavailable');
            calls.push('retrieval');
        });
        await Init.initProject(null);
        assert.deepEqual(calls, ['tooling', 'credentials', 'markets', 'retrieval']);
        assert.equal(process.exitCode, undefined);
    });

    it('retrieves without backing up when initialization was skipped', async () => {
        mock.method(Util, 'execSync', (command, args) => {
            assert.equal(command, 'mcdev');
            assert.deepEqual(args, ['retrieve', '"*"']);
        });
        const skip = Util.skipInteraction;
        Util.skipInteraction = { downloadBUs: 'true' };
        try {
            await Init._downloadAllBUs('"*"', 'unavailable');
        } finally {
            Util.skipInteraction = skip;
        }
    });

    it('lets upgrade perform non-Git work while retaining actual initialization errors', async () => {
        mock.method(Util, 'startLogger', () => {});
        mock.method(config, 'getProperties', async () => properties);
        let upgrades = 0;
        mock.method(Init, 'upgradeProject', async () => {
            upgrades++;
            return true;
        });
        assert.equal(await Mcdev.upgrade(), true);
        assert.equal(upgrades, 1);
        mock.method(InitGit, 'initGitRepo', async () => ({ status: 'error', repoName: null }));
        assert.equal(await Mcdev.upgrade(), false);
        assert.equal(upgrades, 1);
    });

    it('fails direct deltas before examining config or selecting revisions', async () => {
        await assert.rejects(DevOps.getDeltaList(null), /requires Git.*PATH/);
    });

    it('preflights all mappings before purge or config mutation', async () => {
        const before = structuredClone(properties);
        mock.method(Builder, 'purgeDeployFolderList', async () => assert.fail('unexpected purge'));
        await assert.rejects(
            DevOps.buildDeltaDefinitions(properties, 'main'),
            /requires Git.*PATH/
        );
        assert.deepEqual(properties, before);
        assert.equal(Util.OPTIONS.purge, true);
    });

    it('keeps supplied diffArr Git-free', async () => {
        const localProperties = structuredClone(properties);
        Util.OPTIONS.purge = false;
        mock.method(DevOps, 'getDeltaList', async () => assert.fail('unexpected Git delta'));
        const diff = /** @type {import('../types/mcdev.d.js').DeltaPkgItem[]} */ ([
            {
                _credential: 'cred',
                _businessUnit: 'source1',
                type: 'query',
                name: 'Example',
                externalKey: 'example',
                gitAction: 'add/update',
            },
        ]);
        localProperties.metaDataTypes = {
            retrieve: [],
            documentOnRetrieve: [],
            createDeltaPkg: ['query'],
        };
        const build = mock.method(Mcdev, 'build', async () => ({}));
        mock.method(DevOps, '_generateDeleteInstructions', () => {});
        assert.deepEqual(await DevOps.buildDeltaDefinitions(localProperties, 'main', diff), [
            ...diff,
            ...diff,
        ]);
        assert.equal(build.mock.callCount(), 2);
    });

    it('fails join before cloud checks or prompts', async () => {
        mock.method(Init, '_checkPathForCloud', async () => assert.fail('unexpected cloud prompt'));
        await assert.rejects(Init.joinProject(), /mcdev join requires Git.*PATH/);
    });

    for (const command of ['join', 'createDeltaPkg']) {
        it(`exits nonzero from the CLI for missing-Git ${command}`, () => {
            const script = `
                import childProcess from 'node:child_process';
                import { syncBuiltinESMExports } from 'node:module';
                childProcess.spawnSync = () => ({ error: new Error('ENOENT'), status: null });
                syncBuiltinESMExports();
                const { default: config } = await import('./lib/util/config.js');
                config.getProperties = async () => (${JSON.stringify(properties)});
                process.argv = [process.execPath, 'mcdev', '${command}', '--noLogFile'];
                await import('./lib/cli.js');
            `;
            try {
                childProcess.execFileSync(process.execPath, ['--input-type=module', '-e', script], {
                    encoding: 'utf8',
                    stdio: 'pipe',
                    timeout: 20000,
                });
                assert.fail('expected nonzero CLI exit');
            } catch (ex) {
                assert.equal(ex.status, 1);
                assert.match(ex.stdout + ex.stderr, /requires Git.*PATH/);
            }
        });
    }

    it('uses the established fatal exit contract for delta and join entrypoints', async () => {
        mock.method(Util, 'startLogger', () => {});
        mock.method(config, 'getProperties', async () => properties);
        await Mcdev.createDeltaPkg({});
        assert.equal(process.exitCode, 1);
        process.exitCode = undefined;
        await Mcdev.joinProject();
        assert.equal(process.exitCode, 1);
    });
});
