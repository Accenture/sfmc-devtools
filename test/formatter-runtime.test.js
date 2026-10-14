import assert from 'node:assert/strict';
import os from 'node:os';
import { mock } from 'node:test';
import File from '../lib/util/file.js';
import config from '../lib/util/config.js';

describe('bundled formatter plugin resolution', () => {
    let cwd;
    let modules;
    let cache;

    before(async () => {
        modules = await File._loadPrettierModules();
    });

    beforeEach(() => {
        cwd = process.cwd();
        cache = new Map(File.prettierConfigCache);
        mock.method(config, 'getProperties', async () => ({ options: { formatOnSave: true } }));
        mock.method(File, 'initPrettier', async () => true);
        File.prettierConfigCache.clear();
    });

    afterEach(() => {
        process.chdir(cwd);
        mock.restoreAll();
        File.prettierConfigCache.clear();
        for (const [key, value] of cache) {
            File.prettierConfigCache.set(key, value);
        }
    });

    it('formats outside a project dependency tree with the canonical plugin string and project options', async () => {
        process.chdir(os.tmpdir());
        const options = Object.freeze({
            plugins: Object.freeze(['prettier-plugin-sfmc']),
            singleQuote: true,
            tabWidth: 2,
        });
        File.prettierConfigCache.set('ssjs', options);
        assert.equal(
            await File._beautify_prettier('', 'sample', 'ssjs', 'var x={text:"value"};'),
            "var x = { text: 'value' };\n"
        );
        assert.deepEqual(options.plugins, ['prettier-plugin-sfmc']);
    });

    it('preserves other project plugin strings, plugin objects, parser overrides and config', async () => {
        const customPlugin = { parsers: {} };
        const plugins = Object.freeze(['user-plugin', customPlugin, 'prettier-plugin-sfmc']);
        File.prettierConfigCache.set('ssjs', { plugins, parser: 'custom-parser', tabWidth: 7 });
        const prettier = {
            format: async (/** @type {string} */ content, /** @type {object} */ options) => {
                assert.equal(content, 'source');
                assert.equal(options.parser, 'custom-parser');
                return 'formatted';
            },
        };
        const format = mock.method(prettier, 'format');
        mock.method(File, '_loadPrettierModules', async () => ({
            prettier,
            prettierPluginSfmc: modules.prettierPluginSfmc,
        }));
        assert.equal(await File._beautify_prettier('', 'sample', 'ssjs', 'source'), 'formatted');
        const options = format.mock.calls[0].arguments[1];
        assert.deepEqual(options.plugins, [
            'user-plugin',
            customPlugin,
            modules.prettierPluginSfmc,
        ]);
        assert.equal(options.parser, 'custom-parser');
        assert.equal(options.tabWidth, 7);
        assert.deepEqual(plugins, ['user-plugin', customPlugin, 'prettier-plugin-sfmc']);
    });
});
