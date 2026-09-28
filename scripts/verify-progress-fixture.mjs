import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { lstat, mkdir, mkdtemp, readFile, rm, rmdir, unlink, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { getSpinnerScenarios } from '../test/helpers/progress-scenarios.js';

const repository = path.resolve(import.meta.dirname, '..');
const fixturePath = path.join(repository, 'test', 'fixtures', 'progress-visual.json');
const npmCli = process.env.npm_execpath;
const dependencies = {
    'cli-progress': '3.12.0',
    'yocto-spinner': '1.2.2',
};
assert.ok(npmCli, 'Run this verifier through npm run verify:progress-fixture');

const runRoot = await mkdtemp(path.join(os.tmpdir(), 'mcdev-progress-provenance-'));
const ownershipToken = randomUUID();
const ownershipMarker = path.join(runRoot, `.owner-${ownershipToken}`);
const installRoot = path.join(runRoot, 'dependencies');
const registeredTargets = new Set();

/** @param {string} target run-owned path */
function register(target) {
    registeredTargets.add(path.resolve(target));
}

/**
 * Validates a registered strict descendant before cleanup.
 *
 * @param {string} target registered descendant to validate
 * @returns {Promise.<string>} validated absolute target
 */
async function validateRegisteredDescendant(target) {
    assert.ok(target, 'Cleanup target must not be empty');
    const resolvedRoot = path.resolve(runRoot);
    const resolvedTarget = path.resolve(target);
    const relative = path.relative(resolvedRoot, resolvedTarget);
    assert.notEqual(resolvedTarget, resolvedRoot, 'Cleanup target must not be the run root');
    assert.ok(relative && !relative.startsWith('..') && !path.isAbsolute(relative));
    assert.ok(!/[*?]/u.test(target), 'Cleanup target must not contain wildcards');
    assert.ok(registeredTargets.has(resolvedTarget), 'Cleanup target must be registered');
    const stats = await lstat(resolvedTarget);
    assert.equal(stats.isSymbolicLink(), false, 'Cleanup target must not be a symlink or junction');
    return resolvedTarget;
}

/** @param {string} target registered directory to remove recursively */
async function removeRegisteredDirectory(target) {
    const validated = await validateRegisteredDescendant(target);
    await rm(validated, { recursive: true, force: false });
    registeredTargets.delete(validated);
}

/** @param {string} target registered file to remove */
async function removeRegisteredFile(target) {
    const validated = await validateRegisteredDescendant(target);
    await unlink(validated);
    registeredTargets.delete(validated);
}

/**
 * Runs npm in the isolated run directory.
 *
 * @param {string[]} arguments_ npm arguments
 * @returns {void}
 */
function runNpm(arguments_) {
    const result = spawnSync(process.execPath, [npmCli, ...arguments_], {
        cwd: installRoot,
        encoding: 'utf8',
        timeout: 180_000,
    });
    assert.ifError(result.error);
    assert.equal(
        result.status,
        0,
        [result.stderr, result.stdout].filter(Boolean).join('\n') || 'npm install failed'
    );
}

/**
 * Creates a deterministic terminal stream and records every emitted byte.
 *
 * @param {object} options stream characteristics
 * @param {boolean} options.isTTY terminal status
 * @param {number} options.columns terminal width
 * @param {boolean} [options.hasColors] color support
 * @returns {{stream: object, output: () => string}} fake stream and captured output
 */
function createStream({ isTTY, columns, hasColors = true }) {
    const chunks = [];
    const stream = {
        isTTY,
        columns,
        hasColors: () => hasColors,
        write: (chunk, encoding, callback) => {
            chunks.push(Buffer.from(String(chunk)));
            if (typeof encoding === 'function') {
                encoding();
            }
            if (typeof callback === 'function') {
                callback();
            }
            return true;
        },
        cursorTo: (x) => {
            chunks.push(Buffer.from(`\u001B[${x + 1}G`));
        },
        moveCursor: (x, y) => {
            if (x) {
                chunks.push(Buffer.from(`\u001B[${Math.abs(x)}${x < 0 ? 'D' : 'C'}`));
            }
            if (y) {
                chunks.push(Buffer.from(`\u001B[${Math.abs(y)}${y < 0 ? 'A' : 'B'}`));
            }
        },
        clearLine: (direction) => {
            chunks.push(Buffer.from(direction === 1 ? '\u001B[0K' : '\u001B[2K'));
        },
    };
    return { stream, output: () => Buffer.concat(chunks).toString('base64') };
}

/** @returns {{advance: (milliseconds: number) => void, runIntervals: () => void, restore: () => void, active: () => number}} deterministic clock controls */
function installClock() {
    const originals = { now: Date.now, setTimeout, clearTimeout, setInterval, clearInterval };
    let now = 1_000;
    let nextId = 1;
    const timeouts = new Map();
    const intervals = new Map();
    Object.defineProperty(Date, 'now', { configurable: true, value: () => now });
    Object.defineProperties(globalThis, {
        setTimeout: {
            configurable: true,
            value: (callback, delay) => {
                const id = nextId++;
                timeouts.set(id, { callback, delay });
                return id;
            },
        },
        clearTimeout: { configurable: true, value: (id) => timeouts.delete(id) },
        setInterval: {
            configurable: true,
            value: (callback, delay) => {
                const id = nextId++;
                intervals.set(id, { callback, delay });
                return id;
            },
        },
        clearInterval: { configurable: true, value: (id) => intervals.delete(id) },
    });
    return {
        advance: (milliseconds) => {
            now += milliseconds;
        },
        runIntervals: () => {
            for (const { callback } of intervals.values()) {
                callback();
            }
        },
        active: () => timeouts.size + intervals.size,
        restore: () => {
            Object.defineProperty(Date, 'now', { configurable: true, value: originals.now });
            Object.defineProperties(globalThis, {
                setTimeout: { configurable: true, value: originals.setTimeout },
                clearTimeout: { configurable: true, value: originals.clearTimeout },
                setInterval: { configurable: true, value: originals.setInterval },
                clearInterval: { configurable: true, value: originals.clearInterval },
            });
        },
    };
}

/**
 * Captures the complete committed oracle from the exact dependencies.
 *
 * @param {typeof import('cli-progress')} cliProgress exact progress dependency
 * @param {(options: object) => object} createSpinner exact spinner factory
 * @returns {object} captured scenarios and cleanup metadata
 */
function createCaptures(cliProgress, createSpinner) {
    /**
     * Captures one progress bar lifecycle.
     *
     * @param {string} format configured bar template
     * @returns {{output: string, activeTimers: number}} captured output
     */
    function captureBar(format) {
        const clock = installClock();
        const capture = createStream({ isTTY: true, columns: 120 });
        try {
            const bar = new cliProgress.SingleBar(
                { format, stream: capture.stream },
                cliProgress.Presets.shades_classic
            );
            bar.start(4, 0);
            clock.advance(250);
            bar.update(1);
            clock.advance(250);
            bar.update(2);
            clock.advance(250);
            bar.update(4);
            bar.stop();
            return { output: capture.output(), activeTimers: clock.active() };
        } finally {
            clock.restore();
        }
    }

    /**
     * Captures one spinner lifecycle.
     *
     * @param {object} [options] scenario controls
     * @returns {{output: string, activeTimers: number, writeRestored: boolean}} captured output
     */
    function captureSpinner(options = {}) {
        const clock = installClock();
        const capture = createStream({
            isTTY: options.tty ?? true,
            columns: options.columns ?? 16,
            hasColors: true,
        });
        const originalWrite = capture.stream.write;
        try {
            const spinner = createSpinner({
                text: 'Publishing multi-step journey…',
                stream: capture.stream,
                spinner: options.spinner,
                handleSignals: false,
                color: options.color,
            });
            spinner.start();
            clock.advance(80);
            clock.runIntervals();
            if (options.partial) {
                capture.stream.write('partial');
                clock.advance(80);
                clock.runIntervals();
                capture.stream.write(' complete\n');
            } else {
                capture.stream.write('status update\n');
            }
            clock.advance(80);
            clock.runIntervals();
            if (options.finish === 'success') {
                spinner.success('Done');
            } else if (options.finish === 'error') {
                spinner.error('Failed');
            } else {
                spinner.stop();
            }
            return {
                output: capture.output(),
                activeTimers: clock.active(),
                writeRestored: capture.stream.write === originalWrite,
            };
        } finally {
            clock.restore();
        }
    }

    return {
        assetDownload: captureBar(
            '                 Downloading [{bar}] {percentage}% | {value}/{total} | asset-email'
        ),
        devopsChanges: captureBar(
            '                 Processing changes [{bar}] {percentage}% | {value}/{total}'
        ),
        assetMigration: captureBar(
            '                 Migrating asset-message [{bar}] {percentage}% | {value}/{total}'
        ),
        ...Object.fromEntries(
            Object.entries(getSpinnerScenarios()).map(([name, options]) => [
                name,
                captureSpinner(options),
            ])
        ),
    };
}

const originalCi = process.env.CI;
const originalForceColor = process.env.FORCE_COLOR;
const originalTerm = process.env.TERM;
try {
    register(ownershipMarker);
    await writeFile(ownershipMarker, ownershipToken, { flag: 'wx' });
    register(installRoot);
    await mkdir(installRoot);
    await writeFile(
        path.join(installRoot, 'package.json'),
        `${JSON.stringify({ private: true, type: 'module' }, null, 2)}\n`
    );
    runNpm([
        'install',
        '--ignore-scripts',
        '--no-audit',
        '--no-fund',
        '--package-lock=false',
        '--workspaces=false',
        ...Object.entries(dependencies).map(([name, version]) => `${name}@${version}`),
    ]);

    process.env.FORCE_COLOR = '1';
    const require = createRequire(path.join(installRoot, 'package.json'));
    for (const [name, version] of Object.entries(dependencies)) {
        const installed = JSON.parse(
            await readFile(path.join(installRoot, 'node_modules', name, 'package.json'), 'utf8')
        );
        assert.equal(installed.name, name);
        assert.equal(installed.version, version);
    }
    const cliProgress = require('cli-progress');
    const spinnerModule = await import(
        pathToFileURL(path.join(installRoot, 'node_modules', 'yocto-spinner', 'index.js')).href
    );

    delete process.env.CI;
    process.env.TERM = 'xterm-256color';
    const expected = JSON.parse(await readFile(fixturePath, 'utf8'));
    const actual = createCaptures(cliProgress, spinnerModule.default);
    assert.deepEqual(Object.keys(actual), Object.keys(expected), 'Fixture scenario set differs');
    assert.deepEqual(actual, expected, 'Exact dependency output differs from committed fixture');
    process.stdout.write(
        `Verified ${path.relative(repository, fixturePath)} from cli-progress@${dependencies['cli-progress']} and yocto-spinner@${dependencies['yocto-spinner']}.\n`
    );
} finally {
    if (originalCi === undefined) {
        delete process.env.CI;
    } else {
        process.env.CI = originalCi;
    }
    if (originalForceColor === undefined) {
        delete process.env.FORCE_COLOR;
    } else {
        process.env.FORCE_COLOR = originalForceColor;
    }
    if (originalTerm === undefined) {
        delete process.env.TERM;
    } else {
        process.env.TERM = originalTerm;
    }
    let markerContents;
    try {
        markerContents = await readFile(ownershipMarker, 'utf8');
    } catch {
        markerContents = undefined;
    }
    assert.equal(markerContents, ownershipToken, 'Run ownership marker changed or disappeared');
    await removeRegisteredDirectory(installRoot);
    await removeRegisteredFile(ownershipMarker);
    await rmdir(runRoot);
}
