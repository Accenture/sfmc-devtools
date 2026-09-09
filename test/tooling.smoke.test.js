import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Util } from '../lib/util/util.js';

// Set MCDEV_TOOLING_SMOKE_DIR to a generated project with registry-installed dependencies.
// Run: npx mocha --no-config test/tooling.smoke.test.js
const repository = path.resolve(import.meta.dirname, '..');
const project = path.resolve(process.env.MCDEV_TOOLING_SMOKE_DIR || repository);
const external = Boolean(process.env.MCDEV_TOOLING_SMOKE_DIR);
const configDirectory = external ? project : path.join(repository, 'boilerplate/files');
const projectRequire = createRequire(path.join(project, 'package.json'));

/**
 * Load tooling from the generated project rather than the test runner's dependencies.
 *
 * @param {string} name package name
 * @returns {Promise.<object>} imported package
 */
async function loadTool(name) {
    return import(pathToFileURL(projectRequire.resolve(name)).href);
}

/**
 * Read a JSON configuration file without relying on import caches.
 *
 * @param {string} filename absolute filename
 * @returns {Promise.<object>} parsed configuration
 */
async function readJson(filename) {
    return JSON.parse(await readFile(filename, 'utf8'));
}

describe('GENERATED TOOLING SMOKE', function () {
    this.timeout(120_000);
    let eslint;
    let prettier;
    let formatterPlugin;
    let sfmc;
    let generatedConfig;

    before(async () => {
        const eslintModule = await loadTool('eslint');
        prettier = (await loadTool('prettier')).default;
        formatterPlugin = await loadTool('prettier-plugin-sfmc');
        sfmc = (await loadTool('eslint-plugin-sfmc')).default;
        generatedConfig = (
            await import(pathToFileURL(path.join(configDirectory, 'eslint.config.js')).href)
        ).default;
        eslint = new eslintModule.ESLint({
            cwd: project,
            overrideConfigFile: path.join(configDirectory, 'eslint.config.js'),
        });
    });

    it('initializes the real CLI and prints its version', () => {
        const result = spawnSync(
            process.execPath,
            [path.join(repository, 'lib/cli.js'), '--version'],
            {
                encoding: 'utf8',
                timeout: 120_000,
            }
        );
        assert.ifError(result.error);
        assert.equal(result.status, 0, result.stderr);
        assert.equal(result.stdout.trim(), Util.packageJsonMcdev.version);
    }).timeout(150_000);

    it('keeps an array manifest whose selected versions come from mcdev', async () => {
        const dependencies = await readJson(
            path.join(repository, 'boilerplate/npm-dependencies.json')
        );
        assert.ok(Array.isArray(dependencies));
        assert.ok(dependencies.includes('eslint-plugin-sfmc'));
        assert.ok(dependencies.includes('eslint-config-prettier'));
        assert.ok(!dependencies.includes('eslint-plugin-prettier'));
        assert.ok(!dependencies.includes('eslint-config-ssjs'));
        for (const name of dependencies) {
            assert.equal(typeof name, 'string');
            if (name !== 'sfmc-boilerplate') {
                assert.ok(
                    Util.packageJsonMcdev.dependencies?.[name] ||
                        Util.packageJsonMcdev.devDependencies?.[name],
                    name
                );
            }
        }
        const manifest = await readJson(path.join(repository, 'package.json'));
        const expectedUnicorn = manifest.devDependencies['eslint-plugin-unicorn'];
        assert.match(expectedUnicorn, /^\d+\.\d+\.\d+$/);
        const unicorn = await readJson(
            path.join(project, 'node_modules/eslint-plugin-unicorn/package.json')
        );
        assert.equal(unicorn.version, expectedUnicorn);
        const plugin = await readJson(
            path.join(project, 'node_modules/eslint-plugin-sfmc/package.json')
        );
        assert.equal(plugin.version, '5.0.0');
    });

    it('preserves complete SFMC array entries and compatibility objects', async () => {
        for (const entry of [...sfmc.configs.recommended, ...sfmc.configs.embedded]) {
            assert.ok(generatedConfig.includes(entry));
        }
        assert.ok(generatedConfig.includes(sfmc.configs['unicorn-ssjs']));
        assert.ok(generatedConfig.includes(sfmc.configs['unicorn-ssjs-embedded']));
        assert.equal(generatedConfig.at(-1), (await loadTool('eslint-config-prettier')).default);
    });

    it('keeps standalone and extracted SSJS on the SFMC runtime policy', async () => {
        for (const filename of [
            'retrieve/check.ssjs',
            'deploy/check.ssjs',
            'retrieve/page.html/0.js',
            'deploy/page.html/0.js',
        ]) {
            const config = await eslint.calculateConfigForFile(filename);
            assert.equal(config.languageOptions.ecmaVersion, 5, filename);
            assert.equal(config.languageOptions.sourceType, 'script', filename);
            assert.ok(Object.hasOwn(config.languageOptions.globals, 'Platform'), filename);
            assert.ok(!Object.hasOwn(config.languageOptions.globals, 'window'), filename);
            assert.ok(!Object.hasOwn(config.languageOptions.globals, 'process'), filename);
            assert.ok(!Object.hasOwn(config.languageOptions.globals, 'Set'), filename);
            assert.ok(!config.rules['no-var']?.[0], filename);
            assert.ok(!config.rules['no-undef']?.[0], filename);
            assert.ok(!config.rules['jsdoc/require-jsdoc']?.[0], filename);
            assert.notEqual(config.settings?.jsdoc?.mode, 'typescript', filename);
            assert.equal(config.rules['sfmc/ssjs-no-unsupported-syntax'][0], 2, filename);
            assert.equal(config.rules['unicorn/prefer-includes'][0], 0, filename);
            assert.ok(!config.plugins.prettier, filename);
        }
    });

    it('lints valid standalone SSJS and rejects unsupported syntax', async () => {
        const [valid] = await eslint.lintText(
            'Platform.Load("Core", "1.1.5");\nWrite("ready");\n',
            { filePath: 'retrieve/check.ssjs' }
        );
        assert.deepEqual(valid.messages, []);
        const [invalid] = await eslint.lintText('const value = 1;', {
            filePath: 'deploy/check.ssjs',
        });
        assert.ok(invalid.errorCount > 0);
    });

    it('reports unknown SSJS functions with the released SFMC rule in both contexts', async () => {
        for (const filename of ['retrieve/check.ssjs', 'deploy/page.html']) {
            const code = 'Platform.Function.NotARealFunction();';
            const source = filename.endsWith('.html')
                ? `<script runat="server">${code}</script>`
                : code;
            const [result] = await eslint.lintText(source, { filePath: filename });
            assert.equal(result.fatalErrorCount, 0, filename);
            assert.deepEqual(
                result.messages.map(({ ruleId, messageId }) => ({ ruleId, messageId })),
                [{ ruleId: 'sfmc/ssjs-no-unknown-function', messageId: 'unknownPlatformMethod' }],
                filename
            );
        }
    });

    it('keeps actual array fixes and suggestions compatible with standalone and embedded SSJS', async () => {
        const { ESLint } = await loadTool('eslint');
        const fixing = new ESLint({
            cwd: project,
            overrideConfigFile: path.join(configDirectory, 'eslint.config.js'),
            fix: true,
        });
        const code = [
            'var values = [3, 1, 2];',
            'values.sort();',
            'values.sort(function (left, right) { return left - right; });',
            'var removed = values.splice(0, 1);',
            'Write(removed);',
        ].join('\n');
        for (const filename of ['retrieve/check.ssjs', 'deploy/page.html']) {
            const embedded = filename.endsWith('.html');
            const source = embedded ? `<script runat="server">\n${code}\n</script>` : code;
            const [result] = await eslint.lintText(source, { filePath: filename });
            assert.equal(result.fatalErrorCount, 0, filename);
            assert.ok(
                result.messages.some(({ ruleId }) => ruleId === 'sfmc/ssjs-no-unavailable-method'),
                filename
            );
            assert.ok(result.messages.every(({ ruleId }) => !ruleId?.startsWith('unicorn/')));
            const fixes = result.messages.flatMap((message) => (message.fix ? [message.fix] : []));
            const suggestions = result.messages.flatMap((message) => message.suggestions || []);
            // SFMC 5's HTML processor suppresses edits instead of returning unsafe virtual ranges.
            assert.equal(fixes.length, embedded ? 0 : 1, filename);
            assert.equal(suggestions.length, embedded ? 0 : 1, filename);
            for (const fix of [...fixes, ...suggestions.map((suggestion) => suggestion.fix)]) {
                const edited =
                    source.slice(0, fix.range[0]) + fix.text + source.slice(fix.range[1]);
                assert.doesNotMatch(edited, /\b(?:toSorted|toSpliced)\b|=>/, filename);
                const [checked] = await eslint.lintText(edited, { filePath: filename });
                assert.equal(checked.fatalErrorCount, 0, filename);
                assert.ok(
                    checked.messages.every(
                        ({ ruleId }) => ruleId !== 'sfmc/ssjs-no-unsupported-syntax'
                    ),
                    filename
                );
            }
            const [fixed] = await fixing.lintText(source, { filePath: filename });
            const output = fixed.output || source;
            assert.doesNotMatch(output, /\b(?:toSorted|toSpliced)\b|=>/, filename);
            assert.ok(output.includes('values.sort(function (left, right)'), filename);
            assert.ok(output.includes('values.splice(0, 1)'), filename);
            if (embedded) {
                assert.equal(output, source);
            } else {
                assert.notEqual(output, source);
                assert.ok(output.includes('Platform.Load('));
                assert.equal(suggestions[0].messageId, 'addPolyfill');
                assert.ok(suggestions[0].fix.text.includes('Array.prototype.splice = function'));
            }
        }
    });

    it('runs the HTML processor and AMPscript parser without JavaScript AST leakage', async () => {
        for (const filename of ['retrieve/page.html', 'deploy/page.html']) {
            const [valid] = await eslint.lintText(
                '<script runat="server">Platform.Load("Core", "1.1.5"); Write("ready");</script>',
                { filePath: filename }
            );
            assert.deepEqual(valid.messages, []);
            const [invalid] = await eslint.lintText(
                '<script runat="server">const value = 1;</script>',
                { filePath: filename }
            );
            assert.ok(invalid.errorCount > 0, filename);
        }
        for (const filename of [
            'retrieve/check.amp',
            'deploy/check.amp',
            'retrieve/check.ampscript',
            'deploy/check.ampscript',
            'retrieve/amp.html',
        ]) {
            const [valid] = await eslint.lintText('%%[ SET @value = 1 ]%%', { filePath: filename });
            assert.deepEqual(valid.messages, [], filename);
            const [invalid] = await eslint.lintText('%%[ SET @value = NotARealFunction() ]%%', {
                filePath: filename,
            });
            assert.ok(
                invalid.messages.some(
                    (message) => message.ruleId === 'sfmc/amp-no-unknown-function'
                ),
                filename
            );
        }
    });

    it('scopes browser globals to retrieve and deploy JavaScript only', async () => {
        for (const filename of ['retrieve/browser.js', 'deploy/nested/browser.js']) {
            const config = await eslint.calculateConfigForFile(filename);
            assert.ok(Object.hasOwn(config.languageOptions.globals, 'window'), filename);
            assert.ok(!Object.hasOwn(config.languageOptions.globals, 'process'), filename);
            assert.equal(config.rules['no-var'][0], 2, filename);
            assert.equal(config.rules['unicorn/prefer-includes'][0], 2, filename);
            const [result] = await eslint.lintText(
                'document.title = window.location.hostname;\nprocess.cwd();\n',
                { filePath: filename }
            );
            assert.deepEqual(
                result.messages
                    .filter((message) => message.ruleId === 'no-undef')
                    .map((message) => message.message),
                ["'process' is not defined."]
            );
        }
        const unrelated = await eslint.calculateConfigForFile('other/browser.js');
        assert.ok(!Object.hasOwn(unrelated.languageOptions.globals, 'window'));
    });

    it('uses ESM Node globals for hooks, recursive helpers and the config', async () => {
        for (const filename of [
            '.mcdev-validations.js',
            'lib/nested/helper.js',
            'eslint.config.js',
        ]) {
            const config = await eslint.calculateConfigForFile(filename);
            assert.equal(config.languageOptions.sourceType, 'module', filename);
            assert.equal(config.languageOptions.ecmaVersion, 2024, filename);
            assert.equal(config.settings.jsdoc.mode, 'typescript', filename);
            assert.ok(Object.hasOwn(config.languageOptions.globals, 'process'), filename);
            assert.ok(!Object.hasOwn(config.languageOptions.globals, 'window'), filename);
            assert.ok(!Object.hasOwn(config.languageOptions.globals, 'require'), filename);
            assert.equal(config.rules['no-var'][0], 2, filename);
            const [result] = await eslint.lintText(
                'process.cwd();\nwindow.alert("wrong runtime");\n',
                { filePath: filename }
            );
            assert.ok(
                result.messages.some(
                    (message) => message.ruleId === 'no-undef' && message.message.includes('window')
                ),
                filename
            );
        }
    });

    it('ignores backup files and directories without ignoring deploy', async () => {
        for (const filename of [
            'eslint.config.js.BAK',
            'archived.BAK/check.js',
            'deploy/check.ssjs.BAK',
        ]) {
            assert.equal(await eslint.isPathIgnored(filename), true, filename);
        }
        assert.equal(await eslint.isPathIgnored('deploy/check.ssjs'), false);
        const ignorePath = path.join(configDirectory, '.prettierignore');
        assert.equal(
            (
                await prettier.getFileInfo(path.join(project, 'archived.BAK/check.js'), {
                    ignorePath,
                })
            ).ignored,
            true
        );
    });

    it('formats SFMC sources separately and preserves asset comments', async () => {
        const options = await readJson(path.join(configDirectory, '.prettierrc'));
        assert.deepEqual(options.plugins, ['prettier-plugin-sfmc']);
        options.plugins = [formatterPlugin];
        const source = '<!-- keep asset comment -->\n<div>%%[set @value=1]%%</div>\n';
        const formatted = await prettier.format(source, {
            ...options,
            filepath: 'retrieve/page.html',
        });
        assert.ok(formatted.includes('<!-- keep asset comment -->'));
        assert.ok(formatted.includes('@value = 1'));
        assert.equal(
            await prettier.format(formatted, { ...options, filepath: 'retrieve/page.html' }),
            formatted
        );
        const ssjs = await prettier.format('var value={nested:true};', {
            ...options,
            filepath: 'deploy/check.ssjs',
        });
        assert.ok(ssjs.includes('var value ='));
        const sql = await prettier.format('select value from source', {
            ...options,
            filepath: 'retrieve/check.sql',
        });
        assert.ok(sql.includes('SELECT'));
    });

    it('routes editor formatting and linting independently with the actual language ID', async () => {
        const settings = await readJson(path.join(configDirectory, '.vscode/settings.json'));
        for (const language of ['ampscript', 'javascript', 'html', 'ssjs', 'sfmc']) {
            assert.equal(
                settings[`[${language}]`]['editor.defaultFormatter'],
                'esbenp.prettier-vscode',
                language
            );
        }
        assert.ok(!settings['[AMPscript]']);
        assert.deepEqual(settings['files.associations'], {});
        assert.ok(!Object.hasOwn(settings, 'eslint.validate'));
        assert.equal(settings['editor.codeActionsOnSave']['source.fixAll.eslint'], 'explicit');
        assert.equal(settings['prettier.requireConfig'], true);
    });
});
