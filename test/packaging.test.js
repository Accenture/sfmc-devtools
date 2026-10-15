import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import mock from 'mock-fs';
import File from '../lib/util/file.js';
import InitConfig from '../lib/util/init.config.js';
import { Util } from '../lib/util/util.js';

const repository = path.resolve(import.meta.dirname, '..');
const boilerplatePrefix = 'boilerplate/files/';

/**
 * Enumerate the actual boilerplate files, including hidden directories and files.
 *
 * @param {string} directory absolute directory to enumerate
 * @returns {Promise.<string[]>} package-relative file paths
 */
async function listFiles(directory) {
    const files = [];
    for (const entry of await readdir(directory, { withFileTypes: true })) {
        const filename = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            files.push(...(await listFiles(filename)));
        } else if (entry.isFile()) {
            files.push(path.relative(repository, filename).split(path.sep).join('/'));
        }
    }
    return files;
}

describe('npm package boilerplate', () => {
    it('includes every boilerplate file, including dotfiles and nested editor settings', async () => {
        const expected = [
            ...(await listFiles(path.join(repository, 'boilerplate/files'))),
            'boilerplate/npmrc-template',
        ].toSorted();
        assert.ok(expected.length > 0);
        const args = ['pack', '--dry-run', '--json', '--ignore-scripts', '--no-workspaces'];
        const isWindows = process.platform === 'win32';
        const result = spawnSync(
            isWindows ? process.env.ComSpec || 'cmd.exe' : 'npm',
            isWindows ? ['/d', '/s', '/c', `npm ${args.join(' ')}`] : args,
            {
                cwd: repository,
                encoding: 'utf8',
                timeout: 120_000,
                maxBuffer: 10 * 1024 * 1024,
            }
        );
        assert.ifError(result.error);
        assert.equal(result.status, 0, result.stderr);
        const [packed] = JSON.parse(result.stdout);
        const actual = packed.files
            .map(({ path: filename }) => filename)
            .filter(
                (filename) =>
                    filename.startsWith(boilerplatePrefix) ||
                    filename === 'boilerplate/npmrc-template'
            )
            .toSorted();
        assert.deepEqual(actual, expected);
    }).timeout(150_000);

    it('creates .npmrc from the bundled template and preserves its update behavior', async () => {
        const content = await File.readFile(Util.getBoilerplatePath('npmrc-template'), 'utf8');
        assert.equal(content, "save-prefix='~'\n");
        const originalSkip = Util.skipInteraction;
        mock({
            boilerplate: mock.load(path.join(repository, 'boilerplate')),
        });
        Util.skipInteraction = {};
        try {
            assert.equal(await InitConfig.createIdeConfigFiles('9.0.3'), true);
            assert.equal(await File.readFile('.npmrc', 'utf8'), content);
            assert.equal(await InitConfig.createIdeConfigFiles('9.0.3'), true);
            assert.equal(await File.pathExists('.npmrc.BAK'), false);
            await File.writeFile('.npmrc', 'save-prefix=^\n');
            assert.equal(await InitConfig.createIdeConfigFiles('9.0.3'), true);
            assert.equal(await File.readFile('.npmrc', 'utf8'), content);
            assert.equal(await File.readFile('.npmrc.BAK', 'utf8'), 'save-prefix=^\n');
        } finally {
            mock.restore();
            Util.skipInteraction = originalSkip;
        }
    });
});
