import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { migrate } from '../lib/util/migrations/migrate.js';

const run = promisify(execFile);

describe('local migration orchestration', () => {
    let calls;
    let config;
    let plan;
    let options;

    beforeEach(() => {
        calls = [];
        config = {
            version: '10.0.0',
            credentials: { cred: { businessUnits: { bu: '123' } } },
            directories: { retrieve: 'nested/retrieve' },
        };
        plan = {
            assetRootExists: true,
            owners: [{}],
            moves: [{ source: 'message/key/key.asset-message-meta.json' }],
        };
        options = {
            installedVersion: '10.0.0',
            projectRoot: path.resolve('fixture'),
            readConfig: async () => config,
            establish: async ({ buPath }) => {
                calls.push('establish');
                return { repoRoot: 'repo', branch: 'feature', buPath };
            },
            recheck: async () => {
                calls.push('recheck');
            },
            committed: async (snapshot, sources) => {
                calls.push(sources);
            },
            prompt: async (question) => {
                calls.push(question);
                return true;
            },
            interactive: true,
            log: (message) => {
                calls.push(message);
            },
            warn: (message) => {
                calls.push(message);
            },
            registry: [
                {
                    version: 'v10',
                    plan: async () => {
                        calls.push('plan');
                        return plan;
                    },
                    execute: async () => {
                        calls.push('execute');
                        return { movedFiles: 1, cleanupErrors: [] };
                    },
                },
            ],
        };
    });

    it('wires safety, preview, default-No confirmation, committed sources and execution', async () => {
        assert.equal((await migrate('cred/bu', options)).status, 'migrated');
        assert.ok(calls.indexOf('establish') < calls.indexOf('plan'));
        const question = calls.find((item) => item?.message);
        assert.equal(question.default, false);
        assert.match(question.message, /cred\/bu on branch feature/);
        assert.ok(calls.indexOf('recheck') < calls.indexOf('execute'));
        assert.deepEqual(calls.find(Array.isArray), [
            path.resolve(
                'fixture/nested/retrieve/cred/bu/asset/message/key/key.asset-message-meta.json'
            ),
        ]);
        assert.match(
            calls.at(-1),
            /new, separate migration commit.*createDeltaPkg.*switching branches.*another BU/
        );
    });

    for (const selector of ['cred', '*/*', 'cred/*', '../bu', 'cred/bu/extra', 'cred/other']) {
        // Parameterized regression case.
        it(`rejects nonexact selector ${selector}`, async () => {
            await assert.rejects(migrate(selector, options), /exact configured/);
            assert.deepEqual(calls, []);
        });
    }

    it('requires upgrade for an old minor config without planning or mutation', async () => {
        config.version = '9.0.3';
        await assert.rejects(migrate('cred/bu', options), /mcdev upgrade/);
        assert.deepEqual(calls, []);
    });

    it('preserves the existing patch-version exception', async () => {
        options.installedVersion = '10.0.2';
        assert.equal((await migrate('cred/bu', options)).status, 'migrated');
    });

    it('refuses a newer config without updating packages', async () => {
        config.version = '10.1.0';
        await assert.rejects(migrate('cred/bu', options), /Install mcdev@10.1.0/);
        assert.deepEqual(calls, []);
    });

    for (const failure of [
        'Commit your work before running mcdev migrate.',
        'named branch required',
    ]) {
        // Parameterized regression case.
        it(`blocks planning when safety fails: ${failure}`, async () => {
            options.establish = async () => {
                throw new Error(failure);
            };
            await assert.rejects(migrate('cred/bu', options), { message: failure });
            assert.deepEqual(calls, []);
        });
    }

    it('does not let global yes or skipInteraction bypass explicit refusal', async () => {
        options.yes = true;
        options.skipInteraction = true;
        options.prompt = async () => false;
        assert.equal((await migrate('cred/bu', options)).status, 'cancelled');
        assert.ok(!calls.includes('recheck') && !calls.includes('execute'));
    });

    it('refuses noninteractive mutation even with global yes', async () => {
        options.interactive = false;
        options.yes = true;
        await assert.rejects(migrate('cred/bu', options), /interactive terminal/);
        assert.ok(!calls.includes('execute'));
    });

    it('blocks execution after a branch or HEAD change during confirmation', async () => {
        options.recheck = async () => {
            throw new Error('Branch changed');
        };
        await assert.rejects(migrate('cred/bu', options), /Branch changed/);
        assert.ok(!calls.includes('execute'));
    });

    it('blocks ignored or uncommitted move sources before executing', async () => {
        options.committed = async () => {
            throw new Error('Source not committed');
        };
        await assert.rejects(migrate('cred/bu', options), /Source not committed/);
        assert.ok(!calls.includes('execute'));
    });

    for (const exists of [false, true]) {
        // Parameterized regression case.
        it(`reports no-op without confirmation (asset root exists: ${exists})`, async () => {
            plan.assetRootExists = exists;
            plan.moves = [];
            assert.equal((await migrate('cred/bu', options)).status, 'noop');
            assert.match(calls.at(-1), exists ? /already current/ : /No asset directory/);
            assert.ok(!calls.includes('execute'));
        });
    }

    it('surfaces cleanup warnings and still advises a separate commit', async () => {
        options.registry[0].execute = async () => ({ movedFiles: 1, cleanupErrors: ['not empty'] });
        assert.deepEqual((await migrate('cred/bu', options)).cleanupErrors, ['not empty']);
        assert.ok(calls.includes('Migration cleanup warning: not empty'));
        assert.match(calls.at(-1), /separate migration commit/);
    });

    it('preserves rollback diagnostics for the CLI instead of claiming success', async () => {
        options.registry[0].execute = async () => {
            throw new Error('Rollback incomplete: source collision');
        };
        await assert.rejects(migrate('cred/bu', options), /Rollback incomplete: source collision/);
        assert.ok(
            calls.every((item) => !(typeof item === 'string' && item.includes('Migrated 1')))
        );
    });

    it('rejects an old local config without auth, config writes or notifier startup', async function () {
        // Exercise actual CLI startup without relaxing the orchestration unit-test budget.
        this.timeout(30_000);
        const root = await fs.mkdtemp(path.join(os.tmpdir(), 'mcdev-migrate-cli-'));
        const filename = path.join(root, '.mcdevrc.json');
        const content = JSON.stringify({ version: '1.0.0' });
        try {
            await fs.writeFile(filename, content);
            const cli = path.resolve('lib/cli.js');
            // Fail on network or notifier subprocess startup, even outside Mocha's test environment.
            const preload = `
                import child from 'node:child_process';
                import net from 'node:net';
                import { syncBuiltinESMExports } from 'node:module';
                delete process.env.NODE_ENV;
                delete process.env.NO_UPDATE_NOTIFIER;
                child.spawn = () => { throw new Error('Unexpected subprocess'); };
                net.Socket.prototype.connect = () => { throw new Error('Unexpected network'); };
                syncBuiltinESMExports();
            `;
            await assert.rejects(
                run(
                    process.execPath,
                    [
                        '--import',
                        `data:text/javascript,${encodeURIComponent(preload)}`,
                        cli,
                        'migrate',
                        'cred/bu',
                        '--yes',
                    ],
                    { cwd: root }
                ),
                (error) =>
                    error instanceof Error &&
                    'code' in error &&
                    'stderr' in error &&
                    typeof error.stderr === 'string' &&
                    error.code === 1 &&
                    /mcdev upgrade/.test(error.stderr) &&
                    !/auth/i.test(error.stderr)
            );
            assert.equal(await fs.readFile(filename, 'utf8'), content);
            assert.deepEqual(await fs.readdir(root), ['.mcdevrc.json']);
        } finally {
            await fs.rm(root, { recursive: true, force: true });
        }
    });
});
