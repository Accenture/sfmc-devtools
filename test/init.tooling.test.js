import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import os from 'node:os';
import path from 'node:path';
import File from '../lib/util/file.js';
import config from '../lib/util/config.js';
import Init from '../lib/util/init.js';
import InitConfig from '../lib/util/init.config.js';
import InitNpm from '../lib/util/init.npm.js';
import { Util } from '../lib/util/util.js';

const originalCwd = process.cwd();
const originalConfirm = InitConfig.confirmToolingReplacement;
const originalPrompt = InitConfig.promptConfirmation;
const originalExec = Util.execSync;
const originalWrite = File.writeToFile;
const originalReadJSON = File.readJSON;
const originalCloud = Init._checkPathForCloud;
const originalFix = InitConfig.fixMcdevConfig;
const originalAuth = InitConfig.upgradeAuthFile;
const originalSave = File.saveConfigFile;
const originalSkip = Util.skipInteraction;
const originalOptions = Util.OPTIONS;
const manifestPath = path.resolve(originalCwd, 'boilerplate/npm-dependencies.json');
const unicornVersion = File.readJsonSync(path.resolve(import.meta.dirname, '../package.json'))
    .devDependencies['eslint-plugin-unicorn'];
assert.match(unicornVersion, /^\d+\.\d+\.\d+$/);
const unicornMajor = Number(unicornVersion.split('.', 1)[0]);
assert.ok(unicornMajor > 0);
const olderUnicorn = `${unicornMajor - 1}.0.0`;
const newerUnicorn = `${unicornMajor + 1}.0.0`;
const unicornCases = [
    ...['', '^', '~'].flatMap((prefix) => [
        [`${prefix}${olderUnicorn}`, unicornVersion],
        [`${prefix}${unicornVersion}`, `${prefix}${unicornVersion}`],
        [`${prefix}${newerUnicorn}`, `${prefix}${newerUnicorn}`],
    ]),
    ...[
        'file:../custom',
        'git+https://example.com/tool.git#main',
        'npm:custom-unicorn@1.0.0',
        'next',
        `>=${unicornMajor - 1} <${unicornMajor + 2}`,
        `${unicornMajor - 1} || ${unicornMajor}`,
        '*',
    ].map((spec) => [spec, spec]),
];
let temporary;
let approvals;
let commands;
let originalExitCode;

describe('INIT TOOLING', function () {
    // A Mocha timeout does not cancel async work; teardown would restore the real cwd/npm.
    // Bound this suite with an external process deadline instead.
    this.timeout(0);

    beforeEach(async () => {
        originalExitCode = process.exitCode;
        process.exitCode = undefined;
        temporary = await File.mkdtemp(path.join(os.tmpdir(), 'mcdev-init-tooling-'));
        process.chdir(temporary);
        approvals = [];
        commands = [];
        Util.skipInteraction = {};
        Init._checkPathForCloud = async () => true;
        InitConfig.confirmToolingReplacement = async (message) => {
            approvals.push(message);
            return true;
        };
        Util.execSync = (command, args) => {
            const relative = path.relative(temporary, process.cwd());
            assert.ok(
                relative !== '..' &&
                    !relative.startsWith('..' + path.sep) &&
                    !path.isAbsolute(relative),
                'npm stub must remain inside its temporary fixture'
            );
            assert.equal(command, 'npm');
            commands.push([command, ...args]);
            if (args[0] === 'init') {
                const seed = File.existsSync('package.json')
                    ? File.readJsonSync('package.json')
                    : { name: path.basename(process.cwd()).toLowerCase() };
                if (!/^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/.test(seed.name)) {
                    return null;
                }
                File.writeJsonSync('package.json', {
                    ...seed,
                    version: '1.0.0',
                    description: 'npm description',
                    main: 'index.js',
                    scripts: { test: 'npm default test' },
                });
                return '';
            }
            assert.deepEqual(args, ['install']);
            return '';
        };
    });

    afterEach(async () => {
        process.exitCode = originalExitCode;
        process.chdir(originalCwd);
        InitConfig.confirmToolingReplacement = originalConfirm;
        InitConfig.promptConfirmation = originalPrompt;
        Util.execSync = originalExec;
        File.writeToFile = originalWrite;
        Object.defineProperty(File, 'readJSON', { value: originalReadJSON });
        Init._checkPathForCloud = originalCloud;
        InitConfig.fixMcdevConfig = originalFix;
        InitConfig.upgradeAuthFile = originalAuth;
        File.saveConfigFile = originalSave;
        Util.skipInteraction = originalSkip;
        Util.OPTIONS = originalOptions;
        await File.remove(temporary);
    });

    it('rejects npm stub execution outside its temporary fixture', () => {
        try {
            process.chdir(originalCwd);
            assert.throws(() => Util.execSync('npm', ['init', '--yes']), /temporary fixture/);
            assert.deepEqual(commands, []);
        } finally {
            process.chdir(temporary);
        }
    });

    it('installs package-derived array defaults including Unicorn and repeats without prompts', async () => {
        assert.equal(await Init.upgradeProject(null, true), true);
        const manifest = await File.readJSON(manifestPath);
        assert.ok(Array.isArray(manifest));
        const pkg = await File.readJSON('package.json');
        for (const name of manifest) {
            assert.equal(
                pkg.devDependencies[name],
                Util.packageJsonMcdev.dependencies?.[name] ||
                    Util.packageJsonMcdev.devDependencies?.[name] ||
                    'latest'
            );
        }
        assert.equal(pkg.devDependencies['eslint-plugin-unicorn'], unicornVersion);
        assert.equal(pkg.scripts.lint, 'eslint .');
        assert.equal(pkg.scripts['lint:fix'], 'eslint . --fix');
        assert.equal(pkg.scripts.format, 'prettier . --write');
        assert.equal(pkg.scripts['format:check'], 'prettier . --check');
        assert.equal(pkg.version, '1.0.0');
        assert.equal(pkg.description, 'npm description');
        assert.equal(pkg.main, 'index.js');
        assert.equal(pkg.scripts.test, 'npm default test');
        assert.equal(await Init.upgradeProject(null, true), true);
        assert.equal(approvals.length, 0);
        assert.deepEqual(commands, [
            ['npm', 'init', '--yes'],
            ['npm', 'install'],
            ['npm', 'install'],
        ]);
        assert.equal(Util.packageJsonMcdev.engines.node, '^22.22.2 || >=24.15.0');
        assert.equal(pkg.engines.node, Util.packageJsonMcdev.engines.node);
        assert.equal(await File.pathExists('.prettierrc'), true);
    });

    it('declines a differing Node engine before writing any project files', async () => {
        const original = { engines: { node: '>=18', npm: '>=10' } };
        await File.writeJSON('package.json', original);
        const before = await File.readFile('package.json', 'utf8');
        InitConfig.confirmToolingReplacement = async (message) => {
            assert.ok(
                message.includes(`engines.node: >=18 -> ${Util.packageJsonMcdev.engines.node}`)
            );
            return false;
        };
        assert.equal(await Init.upgradeProject(null, true), false);
        assert.equal(await File.readFile('package.json', 'utf8'), before);
        assert.equal(await File.pathExists('eslint.config.js'), false);
        assert.equal(commands.length, 0);
    });

    it('updates an approved Node engine while preserving unrelated engines', async () => {
        await File.writeJSON('package.json', { engines: { node: '>=18', npm: '>=10' } });
        assert.equal(await InitNpm.installDependencies(), true);
        assert.deepEqual((await File.readJSON('package.json')).engines, {
            node: Util.packageJsonMcdev.engines.node,
            npm: '>=10',
        });
        assert.equal(approvals.length, 1);
    });

    it('preserves stricter compatible engines but approves broader, invalid or incompatible replacements', async () => {
        for (const [range, preserve] of [
            ['>=24.20.0', true],
            ['^22.23.0', true],
            ['24.20.0', true],
            ['>=22', false],
            ['invalid', false],
            ['^23.0.0', false],
        ]) {
            approvals.length = 0;
            await File.writeJSON('package.json', { engines: { node: range, npm: '>=10' } });
            assert.equal(await InitNpm.installDependencies(), true);
            assert.deepEqual((await File.readJSON('package.json')).engines, {
                node: preserve ? range : Util.packageJsonMcdev.engines.node,
                npm: '>=10',
            });
            assert.equal(approvals.length, preserve ? 0 : 1);
        }
    });

    it('gates legacy dependency retirement by original migration version', async () => {
        for (const version of ['9.0.3', 'invalid', undefined, '10.0.0', '11.0.0']) {
            commands.length = 0;
            const legacy = {
                'eslint-config-ssjs': '2.0.0',
                'eslint-plugin-prettier': '5.0.0',
                'prettier-plugin-sql': '0.1.0',
            };
            await File.writeJSON('package.json', { dependencies: legacy, devDependencies: legacy });
            assert.equal(await InitNpm.installDependencies(undefined, version), true);
            const pkg = await File.readJSON('package.json');
            const retain = version === '10.0.0' || version === '11.0.0';
            for (const section of ['dependencies', 'devDependencies']) {
                for (const [name, spec] of Object.entries(legacy)) {
                    assert.equal(pkg[section][name], retain ? spec : undefined);
                }
            }
            assert.deepEqual(commands, [['npm', 'install']]);
        }
    });

    it('passes the original current version into orchestrated retirement preflight', async () => {
        const properties = await config.getDefaultProperties();
        properties.version = '10.0.0';
        InitConfig.fixMcdevConfig = async () => true;
        InitConfig.upgradeAuthFile = async () => true;
        File.saveConfigFile = async () => true;
        await File.writeJSON('package.json', { dependencies: { 'eslint-config-ssjs': '2.0.0' } });
        assert.equal(await Init.upgradeProject(properties, false), true);
        assert.equal(
            (await File.readJSON('package.json')).dependencies['eslint-config-ssjs'],
            '2.0.0'
        );
        assert.deepEqual(commands, [['npm', 'install']]);
    });

    it('retries failed init leaving a manifest without reinitializing or losing generated fields', async () => {
        const successfulExec = Util.execSync;
        Util.execSync = (command, args) => {
            successfulExec(command, args);
            return null;
        };
        assert.equal(await InitNpm.installDependencies('approved-name'), false);
        assert.deepEqual(commands, [['npm', 'init', '--yes']]);
        const generated = await File.readJSON('package.json');
        assert.equal(generated.name, 'approved-name');
        assert.equal(generated.description, 'npm description');
        Util.execSync = successfulExec;
        assert.equal(await InitNpm.installDependencies('do-not-rename'), true);
        const retried = await File.readJSON('package.json');
        assert.equal(retried.name, generated.name);
        assert.equal(retried.version, generated.version);
        assert.deepEqual(commands, [
            ['npm', 'init', '--yes'],
            ['npm', 'install'],
        ]);
    });

    it('rejects successful init without a manifest and retries a fresh initialization', async () => {
        const successfulExec = Util.execSync;
        Util.execSync = () => {
            File.removeSync('package.json');
            return '';
        };
        assert.equal(await InitNpm.installDependencies(), false);
        assert.equal(await File.pathExists('package.json'), false);
        Util.execSync = successfulExec;
        assert.equal(await InitNpm.installDependencies('approved-name'), true);
        assert.equal((await File.readJSON('package.json')).name, 'approved-name');
    });

    it('keeps the prior project version and seed when init fails before generating defaults', async () => {
        const properties = await config.getDefaultProperties();
        properties.version = '8.0.0';
        InitConfig.fixMcdevConfig = async () => true;
        InitConfig.upgradeAuthFile = async () => true;
        File.saveConfigFile = async () => {
            assert.fail('must not advance version');
        };
        const successfulExec = Util.execSync;
        Util.execSync = (command, args) => {
            assert.deepEqual([command, ...args], ['npm', 'init', '--yes']);
            return null;
        };
        assert.equal(await Init.upgradeProject(properties, false), false);
        assert.equal(properties.version, '8.0.0');
        const seed = await File.readJSON('package.json');
        assert.deepEqual(seed, {
            name: path
                .basename(temporary)
                .toLowerCase()
                .replaceAll(/[^a-z0-9]/g, ''),
        });
        Util.execSync = successfulExec;
        assert.equal(await InitNpm.installDependencies('do-not-rename'), true);
        assert.equal((await File.readJSON('package.json')).name, seed.name);
        assert.equal((await File.readJSON('package.json')).version, undefined);
        assert.deepEqual(commands, [['npm', 'install']]);
    });

    it('retries installation after retirement with the original version retained', async () => {
        const properties = await config.getDefaultProperties();
        properties.version = '9.0.3';
        InitConfig.fixMcdevConfig = async () => true;
        InitConfig.upgradeAuthFile = async () => true;
        File.saveConfigFile = async () => true;
        await File.writeJSON('package.json', { dependencies: { 'eslint-config-ssjs': '2.0.0' } });
        const successfulExec = Util.execSync;
        Util.execSync = (command, args) =>
            args[0] === 'install' ? null : successfulExec(command, args);
        assert.equal(await Init.upgradeProject(properties, false), false);
        assert.equal(properties.version, '9.0.3');
        assert.equal(
            (await File.readJSON('package.json')).dependencies['eslint-config-ssjs'],
            undefined
        );
        Util.execSync = successfulExec;
        commands.length = 0;
        assert.equal(await Init.upgradeProject(properties, false), true);
        assert.deepEqual(commands, [['npm', 'install']]);
    });

    it('preflights an existing invalid-version project and retries without advancing its saved version on failure', async () => {
        const properties = await config.getDefaultProperties();
        properties.version = 'invalid';
        await File.writeJSON(Util.configFileName, properties);
        await File.writeJSON('package.json', {
            dependencies: { 'eslint-config-ssjs': '2.0.0' },
        });
        await File.outputFile('eslint.config.js', 'old lint');
        await File.outputFile('.vscode/settings.json', 'old editor');
        const successfulExec = Util.execSync;
        Util.execSync = (command, args) => {
            assert.ok(approvals.includes('eslint.config.js'));
            assert.ok(approvals.includes(path.normalize('.vscode/settings.json')));
            assert.ok(
                approvals.some((message) =>
                    message.includes('remove dependency eslint-config-ssjs')
                )
            );
            successfulExec(command, args);
            return args[0] === 'install' ? null : '';
        };
        assert.equal(await Init.upgradeProject(properties, false), false);
        assert.equal(properties.version, 'invalid');
        assert.equal((await File.readJSON(Util.configFileName)).version, 'invalid');
        assert.equal(
            (await File.readJSON('package.json')).dependencies['eslint-config-ssjs'],
            undefined
        );
        assert.equal(await File.readFile('eslint.config.js.BAK', 'utf8'), 'old lint');
        const approvalCount = approvals.length;
        commands.length = 0;
        Util.execSync = successfulExec;
        assert.equal(await Init.upgradeProject(properties, false), true);
        assert.equal(properties.version, Util.packageJsonMcdev.version);
        assert.equal(
            (await File.readJSON(Util.configFileName)).version,
            Util.packageJsonMcdev.version
        );
        assert.equal(approvals.length, approvalCount);
        assert.deepEqual(commands, [['npm', 'install']]);
    });

    it('reconciles matching declarations in a checkout without installation artifacts', async () => {
        assert.equal(await InitNpm.installDependencies(), true);
        commands.length = 0;
        assert.equal(await File.pathExists('node_modules'), false);
        assert.equal(await File.pathExists('package-lock.json'), false);
        assert.equal(await InitNpm.installDependencies(), true);
        assert.deepEqual(commands, [['npm', 'install']]);
        assert.equal(approvals.length, 0);
    });

    it('retries npm failure after declarations changed without advancing the project version', async () => {
        InitConfig.fixMcdevConfig = async () => true;
        InitConfig.upgradeAuthFile = async () => true;
        let saves = 0;
        File.saveConfigFile = async (properties) => {
            saves++;
            properties.version = Util.packageJsonMcdev.version;
            return true;
        };
        const properties = await config.getDefaultProperties();
        properties.version = '8.0.0';
        const successfulExec = Util.execSync;
        Util.execSync = (command, args) => {
            successfulExec(command, args);
            return null;
        };
        assert.equal(await Init.upgradeProject(properties, false), false);
        assert.equal(properties.version, '8.0.0');
        assert.equal(saves, 0);
        commands.length = 0;
        assert.equal(await Init.upgradeProject(properties, false), false);
        assert.deepEqual(commands, [['npm', 'install']]);
        assert.equal(properties.version, '8.0.0');
        assert.equal(saves, 0);
        Util.execSync = successfulExec;
        assert.equal(await Init.upgradeProject(properties, false), true);
        assert.equal(properties.version, Util.packageJsonMcdev.version);
        assert.equal(saves, 1);
        assert.equal(approvals.length, 0);
    });

    it('evaluates differing duplicate dependency declarations independently without relocation', async () => {
        for (const [production, development, expectedProduction, expectedDevelopment] of [
            [`^${olderUnicorn}`, 'file:../custom', unicornVersion, 'file:../custom'],
            [`^${newerUnicorn}`, `~${olderUnicorn}`, `^${newerUnicorn}`, unicornVersion],
            ['file:../production', 'next', 'file:../production', 'next'],
        ]) {
            await File.writeJSON('package.json', {
                dependencies: { 'eslint-plugin-unicorn': production },
                devDependencies: { 'eslint-plugin-unicorn': development },
            });
            assert.equal(await InitNpm.installDependencies(), true);
            const pkg = await File.readJSON('package.json');
            assert.equal(pkg.dependencies['eslint-plugin-unicorn'], expectedProduction);
            assert.equal(pkg.devDependencies['eslint-plugin-unicorn'], expectedDevelopment);
        }
    });

    it('preflights editor settings and package overrides before any coupled mutation', async () => {
        await File.outputFile('eslint.config.js', 'old lint');
        await File.outputFile('.vscode/settings.json', 'old editor');
        await File.writeJSON('package.json', { scripts: { lint: 'custom' } });
        InitConfig.confirmToolingReplacement = async (message) => !message.includes('package.json');
        assert.equal(await Init.upgradeProject(null, true), false);
        assert.equal(await File.readFile('eslint.config.js', 'utf8'), 'old lint');
        assert.equal(await File.pathExists('eslint.config.js.BAK'), false);
        assert.equal(await File.pathExists('.prettierrc'), false);
        assert.equal(commands.length, 0);
    });

    it('declines differing required editor content even with skipInteraction', async () => {
        await File.outputFile('.vscode/settings.json', 'custom');
        InitConfig.confirmToolingReplacement = async () => false;
        assert.equal(await Init.upgradeProject(null, true), false);
        assert.equal(await File.pathExists('package.json'), false);
    });

    it('fails closed with real non-TTY subprocess streams regardless of automation flags', async () => {
        await File.outputFile('.vscode/settings.json', 'custom');
        const initUrl = pathToFileURL(path.join(originalCwd, 'lib/util/init.js')).href;
        const utilUrl = pathToFileURL(path.join(originalCwd, 'lib/util/util.js')).href;
        const result = spawnSync(
            process.execPath,
            [
                '--input-type=module',
                '--eval',
                `
            import assert from 'node:assert/strict';
            import Init from ${JSON.stringify(initUrl)};
            import { Util } from ${JSON.stringify(utilUrl)};
            assert.ok(!process.stdin.isTTY && !process.stdout.isTTY);
            Init._checkPathForCloud = async () => true;
            Util.execSync = () => assert.fail('Subprocess must never invoke npm');
            for (const flags of [null, {}]) {
                Util.skipInteraction = flags;
                Util.OPTIONS = { yes: true };
                assert.equal(await Init.upgradeProject(null, true), false);
                assert.equal(process.exitCode, 1);
                process.exitCode = 0;
            }
        `,
            ],
            { cwd: temporary, encoding: 'utf8', timeout: 30_000 }
        );
        assert.ifError(result.error);
        assert.equal(result.status, 0, result.stderr);
        assert.equal(await File.pathExists('.vscode/settings.json.BAK'), false);
        assert.equal(await File.pathExists('package.json'), false);
        assert.equal(await File.pathExists('eslint.config.js'), false);
    }).timeout(45_000);

    it('blocks existing backups before changing any replacement or retiring files', async () => {
        await File.writeJSON(Util.configFileName, { version: '9.0.3' });
        await File.outputFile('eslint.config.js', 'old');
        await File.outputFile('.beautyamp.json', 'old');
        await File.outputFile('.beautyamp.json.BAK', 'keep');
        assert.equal(await Init.upgradeProject(null, true), false);
        assert.equal(await File.readFile('eslint.config.js', 'utf8'), 'old');
        assert.equal(await File.readFile('.beautyamp.json.BAK', 'utf8'), 'keep');
    });

    it('retries a failed replacement write without overwriting its backup', async () => {
        await File.outputFile('eslint.config.js', 'old');
        File.writeToFile = async (directory, name, extension, content) => {
            if (name === 'eslint.config') {
                return false;
            }
            return originalWrite.call(File, directory, name, extension, content);
        };
        assert.equal(await Init.upgradeProject(null, true), false);
        assert.equal(await File.pathExists('eslint.config.js'), false);
        assert.equal(await File.readFile('eslint.config.js.BAK', 'utf8'), 'old');
        File.writeToFile = originalWrite;
        assert.equal(await Init.upgradeProject(null, true), true);
        assert.equal(await File.readFile('eslint.config.js.BAK', 'utf8'), 'old');
    });

    it('retries npm failure with identical replacements and existing backups', async () => {
        await File.outputFile('eslint.config.js', 'old');
        const successfulExec = Util.execSync;
        Util.execSync = () => null;
        assert.equal(await Init.upgradeProject(null, true), false);
        const count = approvals.length;
        Util.execSync = successfulExec;
        assert.equal(await Init.upgradeProject(null, true), true);
        assert.equal(approvals.length, count);
        assert.equal(await File.readFile('eslint.config.js.BAK', 'utf8'), 'old');
    });

    it('removes obsolete dependencies from both sections for pre10 migrations', async () => {
        const obsolete = {
            'eslint-config-ssjs': '2.0.0',
            'eslint-plugin-prettier': '5.0.0',
            'prettier-plugin-sql': '0.1.0',
        };
        await File.writeJSON('package.json', {
            dependencies: obsolete,
            devDependencies: obsolete,
            scripts: { build: 'custom-build', test: 'keep', lint: 'custom-lint' },
        });
        assert.equal(await InitNpm.installDependencies(undefined, '9.0.3'), true);
        const pkg = await File.readJSON('package.json');
        for (const name of Object.keys(obsolete)) {
            assert.equal(pkg.dependencies[name], undefined);
            assert.equal(pkg.devDependencies[name], undefined);
        }
        assert.equal(pkg.scripts.test, 'keep');
        assert.equal(pkg.scripts.build, 'custom-build');
        assert.ok(!approvals[0].includes('custom-build'));
        assert.ok(approvals[0].includes('custom-lint'));
    });

    it('persists final approved declarations before install and retries failure without more approval', async () => {
        await File.writeJSON('package.json', {
            dependencies: { 'eslint-config-ssjs': '2.0.0' },
            devDependencies: { 'eslint-config-ssjs': '2.0.0' },
        });
        const successfulExec = Util.execSync;
        const before = await File.readFile('package.json', 'utf8');
        const plan = await InitNpm.preflightDependencies();
        assert.equal(await File.readFile('package.json', 'utf8'), before);
        assert.equal(commands.length, 0);
        for (const section of ['dependencies', 'devDependencies']) {
            assert.equal(plan.project[section]['eslint-config-ssjs'], undefined);
        }
        Util.execSync = (command, args) => {
            successfulExec(command, args);
            assert.deepEqual(File.readJsonSync('package.json'), plan.project);
            return null;
        };
        assert.equal(await InitNpm.installDependencies(undefined, undefined, plan), false);
        assert.deepEqual(await File.readJSON('package.json'), plan.project);
        Util.execSync = successfulExec;
        assert.equal(await InitNpm.installDependencies(), true);
        assert.equal(approvals.length, 1);
        assert.deepEqual(commands, [
            ['npm', 'install'],
            ['npm', 'install'],
        ]);
    });

    it('rejects obstructed required destination parents before creating other files', async () => {
        await File.outputFile('.vscode', 'not a directory');
        await assert.rejects(Init.upgradeProject(null, true), /ENOTDIR|not a directory/);
        assert.equal(await File.pathExists('eslint.config.js'), false);
        assert.equal(commands.length, 0);
    });

    for (const section of ['dependencies', 'devDependencies']) {
        for (const [spec, expected] of unicornCases) {
            // Exercise each declaration independently, including its second installation.

            it(`preserves chosen ${section} spec ${spec} unless demonstrably older`, async () => {
                await File.writeJSON('package.json', {
                    [section]: { 'eslint-plugin-unicorn': spec },
                });
                assert.equal(await InitNpm.installDependencies(), true);
                const pkg = await File.readJSON('package.json');
                assert.equal(pkg[section]['eslint-plugin-unicorn'], expected);
                const other = section === 'dependencies' ? 'devDependencies' : 'dependencies';
                assert.equal(pkg[other]?.['eslint-plugin-unicorn'], undefined);
                assert.equal(approvals.length, expected === spec ? 0 : 1);
                assert.equal(await InitNpm.installDependencies(), true);
                assert.deepEqual(commands, [
                    ['npm', 'install'],
                    ['npm', 'install'],
                ]);
            });
        }
    }

    it('preserves existing fallback-latest custom declarations in both dependency sections', async () => {
        for (const section of ['dependencies', 'devDependencies']) {
            await File.writeJSON('package.json', {
                [section]: { 'sfmc-boilerplate': 'file:../custom' },
            });
            assert.equal(await InitNpm.installDependencies(), true);
            assert.equal(
                (await File.readJSON('package.json'))[section]['sfmc-boilerplate'],
                'file:../custom'
            );
        }
    });

    it('retires only exact baseline scripts and retains chained or arbitrary scripts', async () => {
        const baseline = {
            build: 'sfmc-build all',
            'build-cp': 'sfmc-build cloudPages',
            'build-email': 'sfmc-build emails',
            'eslint-check': 'eslint',
        };
        for (const suffix of ['', ' && custom', ' --custom']) {
            await File.writeJSON('package.json', {
                scripts: Object.fromEntries(
                    Object.entries(baseline).map(([name, command]) => [name, command + suffix])
                ),
            });
            assert.equal(await InitNpm.installDependencies(), true);
            const pkg = await File.readJSON('package.json');
            for (const [name, command] of Object.entries(baseline)) {
                assert.equal(pkg.scripts[name], suffix ? command + suffix : undefined);
            }
        }
    });

    it('assigns a sanitized folder name only when creating a new package', async () => {
        const folder = path.join(temporary, 'My_Project.! Name-Here');
        await File.ensureDir(folder);
        process.chdir(folder);
        assert.equal(await InitNpm.installDependencies(), true);
        assert.equal((await File.readJSON('package.json')).name, 'myproject-namehere');
        await File.writeJSON('package.json', {});
        assert.equal(await InitNpm.installDependencies('do-not-add'), true);
        assert.equal((await File.readJSON('package.json')).name, undefined);
    });

    for (const [folderName, selected, expected] of [
        ['Invalid! Directory', ' Selected-Name ', 'selected-name'],
        ['!!!', undefined, 'mcdev-project'],
        ['Invalid! Directory', 'invalid name!', 'invalid-directory'],
    ]) {
        // Exercise the real initializer while intercepting dependency installation.

        it(`runs production npm initialization safely in ${folderName} with ${selected}`, async () => {
            const folder = path.join(temporary, folderName);
            await File.ensureDir(folder);
            process.chdir(folder);
            const stub = Util.execSync;
            Util.execSync = (command, args) => {
                if (args[0] === 'install') {
                    return stub(command, args);
                }
                assert.equal(process.cwd(), folder);
                assert.deepEqual([command, ...args], ['npm', 'init', '--yes']);
                commands.push([command, ...args]);
                return originalExec(command, args, true);
            };
            assert.equal(await Init.upgradeProject(null, true, selected), true);
            const pkg = await File.readJSON('package.json');
            assert.equal(pkg.name, expected);
            assert.equal(pkg.version, '1.0.0');
            assert.equal(pkg.scripts.lint, 'eslint .');
            assert.deepEqual(commands, [
                ['npm', 'init', '--yes'],
                ['npm', 'install'],
            ]);
        });
    }

    for (const scenario of [
        'identical',
        'declined',
        'approved',
        'required',
        'backup',
        'retirement',
        'dangling',
        'directory',
    ]) {
        // File links require actual symlink capability, never a junction substitute.

        it(`handles ${scenario} symbolic links without changing their targets`, async function () {
            const required = scenario === 'required';
            const destination = required ? 'eslint.config.js' : '.gitignore';
            const target = path.join(temporary, 'link-target');
            const content =
                scenario === 'identical'
                    ? await File.readFile(
                          path.join(originalCwd, 'boilerplate/gitignore-template'),
                          'utf8'
                      )
                    : 'custom target';
            if (scenario === 'directory') {
                await File.ensureDir(target);
            } else if (scenario !== 'dangling') {
                await File.outputFile(target, content);
            }
            try {
                await File.symlink(target, destination, scenario === 'directory' ? 'dir' : 'file');
                if (['backup', 'retirement'].includes(scenario)) {
                    await File.symlink(
                        path.join(temporary, 'missing-backup-target'),
                        destination + '.BAK',
                        'file'
                    );
                }
            } catch (ex) {
                if (
                    process.platform === 'win32' &&
                    ['EPERM', 'EACCES', 'ENOTSUP'].includes(ex.code)
                ) {
                    this.skip();
                }
                throw ex;
            }
            if (['identical', 'declined'].includes(scenario)) {
                await File.outputFile(destination + '.BAK', 'keep backup');
            }
            Util.skipInteraction = null;
            InitConfig.promptConfirmation = async () => scenario !== 'declined';
            if (required) {
                InitConfig.confirmToolingReplacement = originalConfirm;
                InitConfig.promptConfirmation = async () => false;
                for (const exists of [false, true]) {
                    if (exists) {
                        await File.writeJSON(Util.configFileName, { version: '10.0.0' });
                    }
                    for (let attempt = 0; attempt < 2; attempt++) {
                        assert.equal(await InitConfig.createIdeConfigFiles('10.0.0'), false);
                    }
                }
            } else if (['dangling', 'directory'].includes(scenario)) {
                await assert.rejects(InitConfig.preflightIdeConfigFiles('10.0.0'));
            } else if (scenario === 'backup') {
                assert.equal(await InitConfig.createIdeConfigFiles('10.0.0'), false);
                assert.equal((await File.lstat(destination + '.BAK')).isSymbolicLink(), true);
            } else if (scenario === 'retirement') {
                assert.equal(
                    await InitConfig._removeIdeConfigFiles({ updates: [], deletes: [destination] }),
                    false
                );
                assert.equal((await File.lstat(destination + '.BAK')).isSymbolicLink(), true);
            } else {
                assert.equal(await InitConfig.createIdeConfigFiles('10.0.0'), true);
            }
            if (scenario === 'approved') {
                assert.equal((await File.lstat(destination)).isFile(), true);
                assert.equal((await File.lstat(destination + '.BAK')).isSymbolicLink(), true);
            } else {
                assert.equal((await File.lstat(destination)).isSymbolicLink(), true);
            }
            if (['identical', 'declined'].includes(scenario)) {
                assert.equal(await File.readFile(destination + '.BAK', 'utf8'), 'keep backup');
            }
            if (!['dangling', 'directory'].includes(scenario)) {
                assert.equal(await File.readFile(target, 'utf8'), content);
            }
        });
    }

    it('declines a late package approval before config, auth, file, npm or version changes', async () => {
        const properties = await config.getDefaultProperties();
        properties.version = '8.0.0';
        const beforeProperties = structuredClone(properties);
        await File.writeJSON(Util.configFileName, properties);
        await File.writeJSON(Util.authFileName, { credentials: { legacy: { clientId: 'keep' } } });
        await File.outputFile('eslint.config.js', 'old lint');
        await File.outputFile('.vscode/settings.json', 'old editor');
        await File.writeJSON('package.json', { scripts: { lint: 'custom' } });
        const names = [
            Util.configFileName,
            Util.authFileName,
            'eslint.config.js',
            '.vscode/settings.json',
            'package.json',
        ];
        const before = await Promise.all(names.map((name) => File.readFile(name, 'utf8')));
        InitConfig.fixMcdevConfig = async () => {
            assert.fail('config mutation before approval');
        };
        InitConfig.upgradeAuthFile = async () => {
            assert.fail('auth mutation before approval');
        };
        File.saveConfigFile = async () => {
            assert.fail('version mutation before approval');
        };
        InitConfig.confirmToolingReplacement = async (message) => !message.includes('package.json');
        assert.equal(await Init.upgradeProject(properties, false), false);
        assert.deepEqual(properties, beforeProperties);
        assert.deepEqual(
            await Promise.all(names.map((name) => File.readFile(name, 'utf8'))),
            before
        );
        assert.equal(await File.pathExists('eslint.config.js.BAK'), false);
        assert.equal(await File.pathExists('.prettierrc'), false);
        assert.equal(commands.length, 0);
    });

    for (const exists of [false, true]) {
        for (const { version, expected } of [
            { version: '7.0.2', expected: ['.beautyamp.json', '.eslintignore', '.eslintrc'] },
            { version: '7.0.3', expected: ['.beautyamp.json'] },
            { version: '9.9.9', expected: ['.beautyamp.json'] },
            { version: '10.0.0', expected: [] },
            { version: 'invalid', expected: ['.beautyamp.json', '.eslintignore', '.eslintrc'] },
        ]) {
            // Verify each version boundary independently.

            it(`retires metadata-selected legacy files at ${version} with config ${exists}`, async () => {
                if (exists) {
                    await File.writeJSON(Util.configFileName, { version });
                }
                const legacy = ['.beautyamp.json', '.eslintignore', '.eslintrc'];
                for (const name of legacy) {
                    await File.outputFile(name, 'legacy');
                }
                const plan = await InitConfig.preflightIdeConfigFiles(version);
                assert.deepEqual(plan.deletes, exists ? expected : []);
                for (const name of legacy) {
                    assert.equal(await File.readFile(name, 'utf8'), 'legacy');
                    assert.equal(await File.pathExists(name + '.BAK'), false);
                }
                assert.equal(commands.length, 0);
                assert.equal(await InitConfig.createIdeConfigFiles(version, plan), true);
                for (const name of legacy) {
                    const retired = exists && expected.includes(name);
                    assert.equal(await File.pathExists(name), !retired);
                    assert.equal(await File.pathExists(name + '.BAK'), retired);
                }
            });
        }
    }

    it('declines dependency retirement without changing disk or running npm', async () => {
        await File.writeJSON('package.json', {
            dependencies: { 'eslint-config-ssjs': '2.0.0' },
            devDependencies: { 'eslint-config-ssjs': '2.0.0' },
        });
        const before = await File.readFile('package.json', 'utf8');
        InitConfig.confirmToolingReplacement = async () => false;
        assert.equal(await InitNpm.preflightDependencies(), false);
        assert.equal(await File.readFile('package.json', 'utf8'), before);
        assert.deepEqual(await File.readdir('.'), ['package.json']);
        assert.equal(commands.length, 0);
    });

    for (const exists of [false, true]) {
        // Mutate returned metadata, never the real boilerplate or project manifest.

        it(`derives required consent from migration metadata with config ${exists}`, async () => {
            const metadataPath = path.join(originalCwd, 'boilerplate/forcedUpdates.json');
            const before = await File.readFile(metadataPath, 'utf8');
            let metadataReads = 0;
            Object.defineProperty(File, 'readJSON', {
                value: async (...args) => {
                    const result = await originalReadJSON.apply(File, args);
                    if (path.resolve(args[0]) === metadataPath) {
                        metadataReads++;
                        result.push({
                            version: '11.0.0',
                            requiresExplicitApproval: true,
                            files: ['.gitattributes'],
                        });
                    }
                    return result;
                },
            });
            if (exists) {
                await File.writeJSON(Util.configFileName, { version: '10.0.0' });
            }
            await File.outputFile('.gitattributes', 'custom');
            InitConfig.confirmToolingReplacement = async (message) => {
                approvals.push(message);
                return false;
            };
            for (let attempt = 0; attempt < 2; attempt++) {
                assert.equal(await InitConfig.preflightIdeConfigFiles('10.0.0'), false);
            }
            assert.equal(metadataReads, 2);
            assert.deepEqual(approvals, ['.gitattributes', '.gitattributes']);
            assert.equal(await File.readFile('.gitattributes', 'utf8'), 'custom');
            assert.equal(await File.pathExists('.gitattributes.BAK'), false);
            assert.equal(await File.readFile(metadataPath, 'utf8'), before);
            assert.equal(commands.length, 0);
        });
    }

    for (const name of [
        'eslint.config.js',
        '.prettierrc',
        '.prettierignore',
        '.vscode/settings.json',
    ]) {
        // Exercise every required tooling destination.

        it(`requires explicit approval of ${name} under automation flags`, async () => {
            await File.outputFile(name, 'custom');
            Util.OPTIONS = { yes: true };
            InitConfig.confirmToolingReplacement = async (message) => {
                assert.equal(message, path.normalize(name));
                return false;
            };
            await File.writeJSON(Util.configFileName, { version: '10.0.0' });
            for (let attempt = 0; attempt < 2; attempt++) {
                assert.equal(await InitConfig.preflightIdeConfigFiles('10.0.0'), false);
            }
            assert.equal(await File.readFile(name, 'utf8'), 'custom');
            assert.equal(await File.pathExists(name + '.BAK'), false);
            assert.equal(commands.length, 0);
        });
    }

    it('rejects all current-version required replacements unattended on repeated attempts', async () => {
        const stdin = Object.getOwnPropertyDescriptor(process.stdin, 'isTTY');
        const stdout = Object.getOwnPropertyDescriptor(process.stdout, 'isTTY');
        try {
            Object.defineProperty(process.stdin, 'isTTY', { configurable: true, value: false });
            Object.defineProperty(process.stdout, 'isTTY', { configurable: true, value: false });
            InitConfig.confirmToolingReplacement = originalConfirm;
            InitConfig.promptConfirmation = async () => assert.fail('unattended prompt');
            Util.OPTIONS = { yes: true };
            await File.writeJSON(Util.configFileName, { version: '10.0.0' });
            const migrations = await File.readJSON(
                path.join(originalCwd, 'boilerplate/forcedUpdates.json')
            );
            for (const name of migrations.find((entry) => entry.version === '10.0.0').files) {
                await File.outputFile(name, 'custom');
                for (const flags of [null, {}]) {
                    Util.skipInteraction = flags;
                    assert.equal(await InitConfig.createIdeConfigFiles('10.0.0'), false);
                    assert.equal(await File.readFile(name, 'utf8'), 'custom');
                    assert.equal(await File.pathExists(name + '.BAK'), false);
                }
                await File.remove(name);
            }
            assert.equal(await File.pathExists('package.json'), false);
            assert.equal(commands.length, 0);
        } finally {
            if (stdin) {
                Object.defineProperty(process.stdin, 'isTTY', stdin);
            } else {
                delete process.stdin.isTTY;
            }
            if (stdout) {
                Object.defineProperty(process.stdout, 'isTTY', stdout);
            } else {
                delete process.stdout.isTTY;
            }
        }
    });

    it('selects historical forced gitignore without optional or required prompts', async () => {
        await File.writeJSON(Util.configFileName, { version: '7.0.2' });
        await File.outputFile('.gitignore', 'custom');
        Util.skipInteraction = null;
        InitConfig.promptConfirmation = async () => assert.fail('forced optional prompt');
        InitConfig.confirmToolingReplacement = async () => assert.fail('forced required prompt');
        const plan = await InitConfig.preflightIdeConfigFiles('7.0.2');
        assert.ok(plan.writes.some((write) => write.fileName === '.gitignore'));
        assert.equal(await File.readFile('.gitignore', 'utf8'), 'custom');
    });

    for (const forced of [false, true]) {
        // Both selection paths must protect existing backups.

        it(`blocks selected gitignore backup before mutation with forced ${forced}`, async () => {
            const version = forced ? '7.0.2' : '10.0.0';
            await File.writeJSON(Util.configFileName, { version });
            await File.outputFile('.gitignore', 'custom');
            await File.outputFile('.gitignore.BAK', 'keep');
            Util.skipInteraction = null;
            InitConfig.promptConfirmation = async (message, defaultValue) => {
                assert.equal(forced, false);
                assert.equal(defaultValue, true);
                return true;
            };
            assert.equal(await InitConfig.preflightIdeConfigFiles(version), false);
            assert.equal(await File.pathExists('eslint.config.js'), false);
            assert.equal(await File.readFile('.gitignore', 'utf8'), 'custom');
            assert.equal(await File.readFile('.gitignore.BAK', 'utf8'), 'keep');
            assert.equal(commands.length, 0);
        });
    }

    it('allows declining optional gitignore despite its existing backup', async () => {
        await File.writeJSON(Util.configFileName, { version: Util.packageJsonMcdev.version });
        await File.outputFile('.gitignore', 'custom');
        await File.outputFile('.gitignore.BAK', 'keep');
        Util.skipInteraction = null;
        InitConfig.promptConfirmation = async (message, defaultValue) => {
            assert.equal(defaultValue, true);
            assert.equal(message, 'Update .gitignore?');
            return false;
        };
        assert.equal(await InitConfig.createIdeConfigFiles(Util.packageJsonMcdev.version), true);
        assert.equal(await File.readFile('.gitignore', 'utf8'), 'custom');
        assert.equal(await File.readFile('.gitignore.BAK', 'utf8'), 'keep');
        assert.equal(await File.pathExists('eslint.config.js'), true);
    });

    it('blocks selected required replacements with backups before any mutation', async () => {
        await File.outputFile('.vscode/settings.json', 'custom');
        await File.outputFile('.vscode/settings.json.BAK', 'keep');
        assert.equal(await Init.upgradeProject(null, true), false);
        assert.equal(await File.pathExists('eslint.config.js'), false);
        assert.equal(commands.length, 0);
    });

    it('requires real prompt consent in interactive mode regardless of automation flags', async () => {
        const stdin = Object.getOwnPropertyDescriptor(process.stdin, 'isTTY');
        const stdout = Object.getOwnPropertyDescriptor(process.stdout, 'isTTY');
        try {
            Object.defineProperty(process.stdin, 'isTTY', { configurable: true, value: true });
            Object.defineProperty(process.stdout, 'isTTY', { configurable: true, value: true });
            InitConfig.confirmToolingReplacement = originalConfirm;
            for (const flags of [null, {}]) {
                Util.skipInteraction = flags;
                Util.OPTIONS = { yes: true };
                let prompts = 0;
                InitConfig.promptConfirmation = async (message, defaultValue) => {
                    assert.equal(defaultValue, false);
                    prompts++;
                    return false;
                };
                await File.outputFile('.vscode/settings.json', 'custom');
                assert.equal(await Init.upgradeProject(null, true), false);
                assert.equal(prompts, 1);
                assert.equal(await File.pathExists('package.json'), false);
            }
        } finally {
            if (stdin) {
                Object.defineProperty(process.stdin, 'isTTY', stdin);
            } else {
                delete process.stdin.isTTY;
            }
            if (stdout) {
                Object.defineProperty(process.stdout, 'isTTY', stdout);
            } else {
                delete process.stdout.isTTY;
            }
        }
    });

    it('propagates filesystem errors and never persists a completed project version', async () => {
        InitConfig.fixMcdevConfig = async () => true;
        InitConfig.upgradeAuthFile = async () => true;
        File.saveConfigFile = async () => {
            throw new Error('save denied');
        };
        const properties = await config.getDefaultProperties();
        properties.version = '9.0.3';
        await assert.rejects(Init.upgradeProject(properties, false), /save denied/);
        assert.equal(properties.version, '9.0.3');
    });

    it('returns failure when final version persistence fails', async () => {
        InitConfig.fixMcdevConfig = async () => true;
        InitConfig.upgradeAuthFile = async () => true;
        File.saveConfigFile = async () => false;
        const properties = await config.getDefaultProperties();
        properties.version = '9.0.3';
        assert.equal(await Init.upgradeProject(properties, false), false);
        assert.equal(properties.version, '9.0.3');
    });
});
