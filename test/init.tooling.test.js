import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import File from '../lib/util/file.js';
import config from '../lib/util/config.js';
import Init from '../lib/util/init.js';
import InitConfig from '../lib/util/init.config.js';
import InitNpm from '../lib/util/init.npm.js';
import { Util } from '../lib/util/util.js';

const originalCwd = process.cwd();
const originals = {
    prompt: InitConfig.promptConfirmation,
    exec: Util.execSync,
    write: File.writeToFile,
    cloud: Init._checkPathForCloud,
    fix: InitConfig.fixMcdevConfig,
    auth: InitConfig.upgradeAuthFile,
    save: File.saveConfigFile,
    skip: Util.skipInteraction,
    info: Util.logger.info,
    warn: Util.logger.warn,
};
let temporary;
let commands;
let prompts;
let logs;
let warnings;
let originalExitCode;
const unicornVersion = Util.packageJsonMcdev.devDependencies['eslint-plugin-unicorn'];
const major = Number(unicornVersion.split('.', 1)[0]);
const unicornCases = [
    ...['', '^', '~'].flatMap((prefix) => [
        [`${prefix}${major - 1}.0.0`, unicornVersion],
        [`${prefix}${unicornVersion}`, `${prefix}${unicornVersion}`],
        [`${prefix}${major + 1}.0.0`, `${prefix}${major + 1}.0.0`],
    ]),
    ...[
        'file:../custom',
        'git+https://example.com/tool.git#main',
        'npm:custom-unicorn@1.0.0',
        'next',
        `>=${major - 1} <${major + 2}`,
        '*',
    ].map((spec) => [spec, spec]),
];

describe('INIT TOOLING', function () {
    // Async filesystem operations must finish before restoring the real cwd/npm.
    this.timeout(0);

    beforeEach(async () => {
        originalExitCode = process.exitCode;
        process.exitCode = undefined;
        temporary = await File.mkdtemp(path.join(os.tmpdir(), 'mcdev-init-tooling-'));
        process.chdir(temporary);
        commands = [];
        prompts = [];
        logs = [];
        warnings = [];
        Util.logger.warn = (message) => {
            warnings.push(message);
            return Util.logger;
        };
        Util.skipInteraction = {};
        Init._checkPathForCloud = async () => true;
        InitConfig.promptConfirmation = async (message, defaultValue) => {
            prompts.push([message, defaultValue]);
            return defaultValue;
        };
        Util.logger.info = (message) => {
            logs.push(message);
            return Util.logger;
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
                const seed = File.readJsonSync('package.json');
                File.writeJsonSync('package.json', {
                    ...seed,
                    version: '1.0.0',
                    description: 'npm description',
                    scripts: { test: 'npm default test' },
                });
            } else {
                assert.deepEqual(args, ['install']);
            }
            return '';
        };
    });

    afterEach(async () => {
        process.exitCode = originalExitCode;
        process.chdir(originalCwd);
        InitConfig.promptConfirmation = originals.prompt;
        Util.execSync = originals.exec;
        File.writeToFile = originals.write;
        Init._checkPathForCloud = originals.cloud;
        InitConfig.fixMcdevConfig = originals.fix;
        InitConfig.upgradeAuthFile = originals.auth;
        File.saveConfigFile = originals.save;
        Util.skipInteraction = originals.skip;
        Util.logger.info = originals.info;
        Util.logger.warn = originals.warn;
        await File.remove(temporary);
    });

    it('guards the npm stub from the real repository', () => {
        try {
            process.chdir(originalCwd);
            assert.throws(() => Util.execSync('npm', ['install']), /temporary fixture/);
        } finally {
            process.chdir(temporary);
        }
    });

    it('installs modern package-derived defaults and reports identical files on repeat', async () => {
        assert.equal(await Init.upgradeProject(null, true), true);
        const manifest = await File.readJSON(
            path.join(originalCwd, 'boilerplate/npm-dependencies.json')
        );
        const pkg = await File.readJSON('package.json');
        for (const name of manifest) {
            assert.equal(
                pkg.devDependencies[name],
                Util.packageJsonMcdev.dependencies?.[name] ||
                    Util.packageJsonMcdev.devDependencies?.[name] ||
                    'latest'
            );
        }
        assert.equal(pkg.scripts.lint, 'eslint .');
        assert.equal(pkg.scripts['lint:fix'], 'eslint . --fix');
        assert.equal(pkg.scripts.format, 'prettier . --write');
        assert.equal(pkg.scripts['format:check'], 'prettier . --check');
        assert.equal(pkg.scripts.test, 'npm default test');
        assert.equal(pkg.version, '1.0.0');
        assert.equal(pkg.description, 'npm description');
        assert.equal(pkg.engines.node, Util.packageJsonMcdev.engines.node);
        assert.equal(pkg.type, 'module');
        logs.length = 0;
        assert.equal(await Init.upgradeProject(null, true), true);
        assert.ok(logs.includes('- ✔️  .gitignore found. No update needed'));
        assert.ok(logs.includes('- ✔️  eslint.config.js found. No update needed'));
        assert.deepEqual(prompts, []);
        assert.deepEqual(commands, [
            ['npm', 'init', '--yes'],
            ['npm', 'install'],
            ['npm', 'install'],
        ]);
    });

    it('defaults overrides to Yes and writes each accepted file before the next prompt', async () => {
        await File.outputFile('.gitignore', 'old ignore');
        await File.outputFile('eslint.config.js', 'old lint');
        Util.skipInteraction = null;
        InitConfig.promptConfirmation = async (message, defaultValue) => {
            assert.equal(defaultValue, true);
            if (message === 'Update eslint.config.js?') {
                assert.equal(await File.readFile('.gitignore.BAK', 'utf8'), 'old ignore');
                assert.notEqual(await File.readFile('.gitignore', 'utf8'), 'old ignore');
            }
            prompts.push(message);
            return defaultValue;
        };
        assert.equal(await Init.upgradeProject(null, true), true);
        assert.deepEqual(prompts, ['Update .gitignore?', 'Update eslint.config.js?']);
        assert.equal(await File.readFile('eslint.config.js.BAK', 'utf8'), 'old lint');
    });

    it('declines one override with a backup and continues subsequent prompts, writes and npm', async () => {
        await File.outputFile('.gitignore', 'keep ignore');
        await File.outputFile('.gitignore.BAK', 'keep backup');
        await File.outputFile('eslint.config.js', 'old lint');
        await File.writeJSON('package.json', {
            scripts: { lint: 'custom' },
            engines: { node: '>=18' },
        });
        Util.skipInteraction = null;
        InitConfig.promptConfirmation = async (message, defaultValue) => {
            assert.equal(defaultValue, true);
            prompts.push(message);
            return message !== 'Update .gitignore?';
        };
        assert.equal(await Init.upgradeProject(null, true), true);
        assert.deepEqual(prompts, ['Update .gitignore?', 'Update eslint.config.js?']);
        assert.equal(await File.readFile('.gitignore', 'utf8'), 'keep ignore');
        assert.equal(await File.readFile('.gitignore.BAK', 'utf8'), 'keep backup');
        assert.equal(await File.readFile('eslint.config.js.BAK', 'utf8'), 'old lint');
        assert.equal((await File.readJSON('package.json')).scripts.lint, 'eslint .');
        assert.ok(logs.includes('✔️  Configuration files done.'));
        assert.ok(!logs.includes('Configuration files are up to date.'));
        assert.deepEqual(commands, [['npm', 'install']]);
    });

    for (const version of ['7.0.2', '9.0.3', 'invalid', '10.0.0']) {
        // Exercise each migration case independently.

        it(`uses version-gated forced replacements at ${version}`, async () => {
            await File.writeJSON(Util.configFileName, { version });
            await File.outputFile('eslint.config.js', 'old lint');
            Util.skipInteraction = null;
            InitConfig.promptConfirmation = async (message, defaultValue) => {
                prompts.push([message, defaultValue]);
                return false;
            };
            assert.equal(await InitConfig.createIdeConfigFiles(version), true);
            if (version === '10.0.0') {
                assert.deepEqual(prompts, [['Update eslint.config.js?', true]]);
                assert.equal(await File.readFile('eslint.config.js', 'utf8'), 'old lint');
            } else {
                assert.deepEqual(prompts, []);
                assert.equal(await File.readFile('eslint.config.js.BAK', 'utf8'), 'old lint');
            }
        });
    }

    it('keeps new project overrides optional and honors skipInteraction', async () => {
        await File.outputFile('eslint.config.js', 'old lint');
        InitConfig.promptConfirmation = async () => assert.fail('automation must bypass prompts');
        assert.equal(await Init.upgradeProject(null, true), true);
        assert.equal(await File.readFile('eslint.config.js.BAK', 'utf8'), 'old lint');
    });

    for (const { label, segments, version } of [
        { label: '.gitignore', segments: ['.gitignore'], version: '7.0.2' },
        {
            label: '.vscode/extensions.json',
            segments: ['.vscode', 'extensions.json'],
            version: '7.6.1',
        },
    ]) {
        // Repeat upgrades overwrite the prior backup with the latest pre-upgrade file.

        it(`overwrites an existing backup when updating ${label}`, async () => {
            const fileName = path.join(...segments);
            await File.writeJSON(Util.configFileName, { version });
            await File.outputFile(fileName, 'current custom file');
            await File.outputFile(fileName + '.BAK', 'older backup');
            assert.equal(
                await Init.upgradeProject(
                    { ...(await config.getDefaultProperties()), version },
                    true
                ),
                true
            );
            assert.notEqual(await File.readFile(fileName, 'utf8'), 'current custom file');
            assert.equal(await File.readFile(fileName + '.BAK', 'utf8'), 'current custom file');
            assert.ok(logs.includes('✔️  Configuration files done.'));
            assert.deepEqual(commands, [
                ['npm', 'init', '--yes'],
                ['npm', 'install'],
            ]);
        });
    }

    it('overwrites an existing backup when retiring a legacy file', async () => {
        await File.writeJSON(Util.configFileName, { version: '9.0.3' });
        await File.outputFile('.beautyamp.json', 'current legacy file');
        await File.outputFile('.beautyamp.json.BAK', 'older backup');
        assert.equal(await Init.upgradeProject(null, true), true);
        assert.equal(await File.pathExists('.beautyamp.json'), false);
        assert.equal(await File.readFile('.beautyamp.json.BAK', 'utf8'), 'current legacy file');
    });

    it('retries a failed file write and refreshes its backup', async () => {
        await File.outputFile('eslint.config.js', 'first version');
        File.writeToFile = async (directory, name, extension, content) =>
            name !== 'eslint.config' &&
            originals.write.call(File, directory, name, extension, content);
        assert.equal(await Init.upgradeProject(null, true), false);
        assert.equal(await File.readFile('eslint.config.js.BAK', 'utf8'), 'first version');
        await File.outputFile('eslint.config.js', 'retry version');
        File.writeToFile = originals.write;
        assert.equal(await Init.upgradeProject(null, true), true);
        assert.equal(await File.readFile('eslint.config.js.BAK', 'utf8'), 'retry version');
    });

    for (const version of ['7.0.2', '7.0.3', '9.0.3', 'invalid', '10.0.0']) {
        // Exercise each migration case independently.

        it(`retires legacy files and dependencies only for applicable versions at ${version}`, async () => {
            await File.writeJSON(Util.configFileName, { version });
            for (const name of ['.beautyamp.json', '.eslintignore', '.eslintrc']) {
                await File.outputFile(name, 'legacy');
            }
            const legacy = {
                'eslint-config-ssjs': '2.0.0',
                'eslint-plugin-prettier': '5.0.0',
                'prettier-plugin-sql': '0.1.0',
            };
            await File.writeJSON('package.json', { dependencies: legacy, devDependencies: legacy });
            assert.equal(
                await Init.upgradeProject(
                    { ...(await config.getDefaultProperties()), version },
                    true
                ),
                true
            );
            const pkg = await File.readJSON('package.json');
            for (const section of ['dependencies', 'devDependencies']) {
                for (const [name, spec] of Object.entries(legacy)) {
                    assert.equal(pkg[section][name], version === '10.0.0' ? spec : undefined);
                }
            }
            assert.equal(await File.pathExists('.beautyamp.json.BAK'), version !== '10.0.0');
            assert.equal(
                await File.pathExists('.eslintignore.BAK'),
                ['7.0.2', 'invalid'].includes(version)
            );
            assert.equal(
                await File.pathExists('.eslintrc.BAK'),
                ['7.0.2', 'invalid'].includes(version)
            );
        });
    }

    it('retains the saved version across npm failure and retries with identical backed-up files', async () => {
        const properties = await config.getDefaultProperties();
        properties.version = 'invalid';
        await File.writeJSON(Util.configFileName, properties);
        await File.outputFile('eslint.config.js', 'old');
        const successfulExec = Util.execSync;
        Util.execSync = (command, args) => {
            successfulExec(command, args);
            return args[0] === 'install' ? null : '';
        };
        assert.equal(await Init.upgradeProject(properties, false), false);
        assert.equal((await File.readJSON(Util.configFileName)).version, 'invalid');
        Util.execSync = successfulExec;
        assert.equal(await Init.upgradeProject(properties, false), true);
        assert.equal(
            (await File.readJSON(Util.configFileName)).version,
            Util.packageJsonMcdev.version
        );
        assert.equal(await File.readFile('eslint.config.js.BAK', 'utf8'), 'old');
    });

    for (const [range, preserve] of [
        ['>=24.20.0', true],
        ['^22.23.0', true],
        ['24.20.0', true],
        ['>=22', false],
        ['invalid', false],
        ['^23.0.0', false],
    ]) {
        // Exercise each migration case independently.

        it(`preserves compatible Node engine constraints for ${range}`, async () => {
            await File.writeJSON('package.json', { engines: { node: range, npm: '>=10' } });
            assert.equal(await InitNpm.installDependencies(), true);
            assert.deepEqual((await File.readJSON('package.json')).engines, {
                node: preserve ? range : Util.packageJsonMcdev.engines.node,
                npm: '>=10',
            });
            assert.deepEqual(prompts, []);
        });
    }

    for (const section of ['dependencies', 'devDependencies']) {
        for (const [spec, expected] of unicornCases) {
            // Exercise each declaration independently.

            it(`preserves ${section} spec ${spec} unless demonstrably older`, async () => {
                await File.writeJSON('package.json', {
                    [section]: { 'eslint-plugin-unicorn': spec },
                });
                assert.equal(await InitNpm.installDependencies(), true);
                assert.equal(
                    (await File.readJSON('package.json'))[section]['eslint-plugin-unicorn'],
                    expected
                );
                assert.equal(await InitNpm.installDependencies(), true);
                assert.deepEqual(prompts, []);
            });
        }
    }

    it('preserves unrelated scripts, engines and dependency sections', async () => {
        await File.writeJSON('package.json', {
            scripts: {
                build: 'custom-build',
                'build-cp': 'sfmc-build cloudPages',
                'build-email': 'sfmc-build emails && custom',
                test: 'keep',
                lint: 'custom',
            },
            dependencies: { 'eslint-plugin-unicorn': `^${major + 1}.0.0` },
            devDependencies: { 'eslint-plugin-unicorn': `~${major - 1}.0.0` },
        });
        assert.equal(await InitNpm.installDependencies(), true);
        const pkg = await File.readJSON('package.json');
        assert.equal(pkg.scripts.build, 'custom-build');
        assert.equal(pkg.scripts['build-cp'], undefined);
        assert.equal(pkg.scripts['build-email'], 'sfmc-build emails && custom');
        assert.equal(pkg.scripts.test, 'keep');
        assert.equal(pkg.dependencies['eslint-plugin-unicorn'], `^${major + 1}.0.0`);
        assert.equal(pkg.devDependencies['eslint-plugin-unicorn'], unicornVersion);
    });

    for (const [folderName, selected, expected] of [
        ['Invalid! Directory', ' Selected-Name ', 'selected-name'],
        ['!!!', undefined, 'mcdev-project'],
        ['Invalid! Directory', 'invalid name!', 'invalid-directory'],
    ]) {
        // Exercise each migration case independently.

        it(`initializes npm safely in ${folderName} with ${selected}`, async () => {
            const folder = path.join(temporary, folderName);
            await File.ensureDir(folder);
            process.chdir(folder);
            const stub = Util.execSync;
            Util.execSync = (command, args) =>
                args[0] === 'install' ? stub(command, args) : originals.exec(command, args, true);
            assert.equal(await Init.upgradeProject(null, true, selected), true);
            assert.equal((await File.readJSON('package.json')).name, expected);
        });
    }

    it('retries failed npm initialization without losing generated fields', async () => {
        const successfulExec = Util.execSync;
        Util.execSync = (command, args) => {
            successfulExec(command, args);
            return null;
        };
        assert.equal(await InitNpm.installDependencies('chosen-name'), false);
        Util.execSync = successfulExec;
        assert.equal(await InitNpm.installDependencies('do-not-rename'), true);
        const pkg = await File.readJSON('package.json');
        assert.equal(pkg.name, 'chosen-name');
        assert.equal(pkg.description, 'npm description');
    });

    for (const scenario of [
        'identical',
        'declined',
        'approved',
        'backup',
        'retirement',
        'dangling',
        'directory',
    ]) {
        // Exercise each migration case independently.

        it(`protects symbolic link targets for ${scenario}`, async function () {
            const destination = '.gitignore';
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
                        path.join(temporary, 'missing'),
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
            Util.skipInteraction = null;
            InitConfig.promptConfirmation = async () => scenario !== 'declined';
            if (['dangling', 'directory'].includes(scenario)) {
                await assert.rejects(InitConfig.createIdeConfigFiles('10.0.0'));
            } else if (scenario === 'retirement') {
                assert.equal(
                    await InitConfig._removeIdeConfigFiles({ updates: [], deletes: [destination] }),
                    true
                );
            } else {
                assert.equal(await InitConfig.createIdeConfigFiles('10.0.0'), true);
            }
            assert.equal(
                (
                    await File.lstat(
                        ['approved', 'backup', 'retirement'].includes(scenario)
                            ? destination + '.BAK'
                            : destination
                    )
                ).isSymbolicLink(),
                true
            );
            if (!['dangling', 'directory'].includes(scenario)) {
                assert.equal(await File.readFile(target, 'utf8'), content);
            }
        });
    }
});
