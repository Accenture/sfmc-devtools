import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const repository = path.resolve(import.meta.dirname, '..');

describe('import purity', () => {
    it('imports file utilities without starting Winston logging', () => {
        const script = [
            "await import('./lib/util/file.js');",
            "const { Util } = await import('./lib/util/util.js');",
            'if (Util.loggerTransports !== null) process.exit(2);',
            "if (Util.logger.constructor?.name === 'Logger') process.exit(3);",
        ].join('');
        const result = spawnSync(process.execPath, ['--input-type=module', '--eval', script], {
            cwd: repository,
            encoding: 'utf8',
        });

        assert.equal(result.status, 0, result.stderr || result.stdout);
        assert.equal(result.stdout, '');
        assert.equal(result.stderr, '');
    });

    it('runs the CLI without loading or invoking an update notifier', () => {
        const script = [
            "import Module from 'node:module';",
            'const originalLoad = Module._load;',
            "Module._load = function(request, parent, isMain) { if (request === 'update-notifier') process.exit(7); return originalLoad.call(this, request, parent, isMain); };",
            "process.argv = [process.execPath, './lib/cli.js', '--version'];",
            "await import('./lib/cli.js');",
        ].join('');
        const result = spawnSync(process.execPath, ['--input-type=module', '--eval', script], {
            cwd: repository,
            encoding: 'utf8',
        });

        assert.equal(result.status, 0, result.stderr || result.stdout);
        assert.match(result.stdout, /^\d+\.\d+\.\d+\s*$/u);
        assert.equal(result.stderr, '');
    });

    it('exposes package version without runtime filesystem discovery', async () => {
        const { Util } = await import('../lib/util/util.js');
        assert.match(Util.packageJsonMcdev.version, /^\d+\.\d+\.\d+$/u);
        assert.equal(Util.packageJsonMcdev.name, 'mcdev');
    });
});
