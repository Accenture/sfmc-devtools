import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { lstat, mkdir, mkdtemp, readFile, rm, rmdir, unlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { build } from 'esbuild';

const repository = path.resolve(import.meta.dirname, '..');
const packageJsonPath = path.join(repository, 'package.json');

/**
 * Return a stable byte total for esbuild output metadata.
 *
 * @param {Record<string, {bytes: number}>} outputs esbuild output records
 * @returns {number} total output bytes
 */
export function sumOutputBytes(outputs) {
    return Object.values(outputs).reduce((total, output) => total + output.bytes, 0);
}

/**
 * Extract installed package names from esbuild input paths.
 *
 * @param {string[]} inputs esbuild input paths
 * @returns {string[]} sorted package names
 */
export function extractBundledPackages(inputs) {
    const packages = new Set();
    for (const input of inputs) {
        const normalized = input.replaceAll('\\', '/');
        const marker = 'node_modules/';
        const markerIndex = normalized.lastIndexOf(marker);
        if (markerIndex === -1) {
            continue;
        }
        const segments = normalized.slice(markerIndex + marker.length).split('/');
        const packageName = segments[0].startsWith('@')
            ? `${segments[0]}/${segments[1]}`
            : segments[0];
        packages.add(packageName);
    }
    return [...packages].toSorted();
}

/**
 * Run a bundled CLI command and capture a concise result.
 *
 * @param {string} cli bundled CLI path
 * @param {string[]} arguments_ CLI arguments
 * @param {string} cwd fixture working directory
 * @returns {{arguments: string[], exitCode: number, stdoutBytes: number, stderrBytes: number}} captured command metrics
 */
function runCli(cli, arguments_, cwd) {
    const result = spawnSync(process.execPath, [cli, ...arguments_], {
        cwd,
        encoding: 'utf8',
        env: {
            ...process.env,
            CI: '1',
            NO_UPDATE_NOTIFIER: '1',
        },
        timeout: 120_000,
    });
    assert.ifError(result.error);
    assert.equal(
        result.status,
        0,
        [result.stderr, result.stdout].filter(Boolean).join('\n') || 'Bundled CLI failed'
    );
    return {
        arguments: arguments_,
        exitCode: result.status,
        stdoutBytes: Buffer.byteLength(result.stdout),
        stderrBytes: Buffer.byteLength(result.stderr),
    };
}

/**
 * Delete only a registered child created beneath this run's owned temp root.
 *
 * @param {string} runRoot owned temporary root
 * @param {string} markerPath ownership marker path
 * @param {Set.<string>} registeredTargets created targets eligible for deletion
 * @param {string} target registered child target
 * @returns {Promise.<void>} resolves after safe deletion
 */
async function removeRegisteredTarget(runRoot, markerPath, registeredTargets, target) {
    const resolvedRoot = path.resolve(runRoot);
    const resolvedTarget = path.resolve(target);
    assert.ok(await readFile(markerPath, 'utf8'), 'Temporary-run ownership marker is missing');
    assert.ok(
        registeredTargets.has(resolvedTarget),
        'Cleanup target was not registered by this run'
    );
    assert.notEqual(resolvedTarget, resolvedRoot, 'Cleanup cannot remove the temporary run root');
    assert.ok(
        resolvedTarget.startsWith(`${resolvedRoot}${path.sep}`),
        'Cleanup target must be a strict descendant of the temporary run root'
    );
    assert.equal(/[*?]/u.test(resolvedTarget), false, 'Cleanup target cannot contain wildcards');
    const stats = await lstat(resolvedTarget);
    assert.equal(stats.isSymbolicLink(), false, 'Cleanup target cannot be a symlink or junction');
    await rm(resolvedTarget, { recursive: true });
}

/**
 * Build and execute the experimental CLI bundle probe.
 *
 * @returns {Promise.<object>} stable measurement report
 */
export async function measureCliBundle() {
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
    const directDependencies = Object.keys(packageJson.dependencies ?? {}).toSorted();
    const runRoot = await mkdtemp(path.join(os.tmpdir(), 'mcdev-esbuild-probe-'));
    const markerPath = path.join(runRoot, `.owner-${crypto.randomUUID()}`);
    const fixture = path.join(runRoot, 'fixture');
    const registeredTargets = new Set([path.resolve(fixture)]);
    await writeFile(markerPath, crypto.randomUUID());
    await mkdir(fixture);

    try {
        const bundlePath = path.join(fixture, 'mcdev.bundle.mjs');
        const metafilePath = path.join(fixture, 'mcdev.bundle.meta.json');
        const result = await build({
            absWorkingDir: repository,
            banner: {
                js: "import { createRequire as __createRequire } from 'node:module'; const require = __createRequire(import.meta.url);",
            },
            bundle: true,
            entryPoints: ['lib/cli.js'],
            format: 'esm',
            metafile: true,
            outfile: bundlePath,
            platform: 'node',
            sourcemap: false,
            target: 'node22',
        });
        await writeFile(metafilePath, `${JSON.stringify(result.metafile, null, 2)}\n`);

        const inputPaths = Object.keys(result.metafile.inputs).toSorted();
        const bundledPackages = extractBundledPackages(inputPaths);
        const directBundledPackages = directDependencies.filter((dependency) =>
            bundledPackages.includes(dependency)
        );
        const transitiveBundledPackages = bundledPackages.filter(
            (dependency) => !directDependencies.includes(dependency)
        );
        const commands = [
            runCli(bundlePath, ['--version'], fixture),
            runCli(bundlePath, ['--help'], fixture),
            runCli(bundlePath, ['explainTypes', '--json'], fixture),
        ];

        return {
            schemaVersion: 1,
            package: {
                name: packageJson.name,
                version: packageJson.version,
            },
            closure: {
                directDeclaredCount: directDependencies.length,
                directBundledCount: directBundledPackages.length,
                directBundledPackages,
                transitiveBundledCount: transitiveBundledPackages.length,
                transitiveBundledPackages,
                totalBundledPackageCount: bundledPackages.length,
            },
            bundle: {
                bytes: sumOutputBytes(result.metafile.outputs),
                inputBytes: Object.values(result.metafile.inputs).reduce(
                    (total, input) => total + input.bytes,
                    0
                ),
                inputFileCount: inputPaths.length,
                outputFileCount: Object.keys(result.metafile.outputs).length,
                metafileGenerated: true,
            },
            commands,
        };
    } finally {
        await removeRegisteredTarget(runRoot, markerPath, registeredTargets, fixture);
        await unlink(markerPath);
        await rmdir(runRoot);
    }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
    const report = await measureCliBundle();
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}
