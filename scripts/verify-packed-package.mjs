import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const repository = path.resolve(import.meta.dirname, '..');
const npmCli = process.env.npm_execpath;
assert.ok(npmCli, 'Run this verifier through npm run verify:packed');
const packageJson = JSON.parse(await readFile(path.join(repository, 'package.json'), 'utf8'));
let temporaryProject;
let tarball;

/**
 * Run a command and fail with its captured output.
 *
 * @param {string} command executable name or path
 * @param {string[]} arguments command arguments
 * @param {object} [options] spawn options
 * @returns {import('node:child_process').SpawnSyncReturns<string>} command result
 */
function run(command, arguments_, options = {}) {
    const result = spawnSync(command, arguments_, {
        cwd: repository,
        encoding: 'utf8',
        timeout: 180_000,
        ...options,
    });
    assert.ifError(result.error);
    assert.equal(
        result.status,
        0,
        [result.stderr, result.stdout].filter(Boolean).join('\n') || `${command} failed`
    );
    return result;
}

try {
    const packResult = run(process.execPath, [npmCli, 'pack', '--json', '--ignore-scripts']);
    const packOutput = JSON.parse(packResult.stdout);
    assert.equal(packOutput.length, 1);
    tarball = path.join(repository, packOutput[0].filename);

    temporaryProject = await mkdtemp(path.join(os.tmpdir(), 'mcdev-packed-'));
    await writeFile(
        path.join(temporaryProject, 'package.json'),
        JSON.stringify({ name: 'mcdev-packed-verification', private: true, type: 'module' })
    );
    run(
        process.execPath,
        [
            npmCli,
            'install',
            tarball,
            '--omit=dev',
            '--ignore-scripts',
            '--no-audit',
            '--no-fund',
            '--package-lock=false',
            '--workspaces=false',
        ],
        { cwd: temporaryProject }
    );

    const cli = path.join(temporaryProject, 'node_modules', 'mcdev', 'lib', 'cli.js');
    const versionResult = run(process.execPath, [cli, '--version'], {
        cwd: temporaryProject,
    });
    assert.equal(versionResult.stdout.trim(), packageJson.version);

    const importCheck = path.join(temporaryProject, 'verify-imports.mjs');
    await writeFile(
        importCheck,
        [
            "import mcdev from 'mcdev';",
            "import MetadataTypeDefinitions from 'mcdev/MetadataTypeDefinitions';",
            "import { Util } from 'mcdev/util/util';",
            "if (!mcdev || !MetadataTypeDefinitions || !Util) throw new Error('Public import missing');",
            '',
        ].join('\n')
    );
    run(process.execPath, [importCheck], { cwd: temporaryProject });

    console.log(`Packed mcdev ${packageJson.version} verified successfully.`);
} finally {
    await Promise.all([
        temporaryProject ? rm(temporaryProject, { recursive: true, force: true }) : undefined,
        tarball ? rm(tarball, { force: true }) : undefined,
    ]);
}
