import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSpinner, getDefaultSpinnerFrames, ProgressBar } from '../lib/util/progress.js';
import { getSpinnerScenarios } from './helpers/progress-scenarios.js';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.join(testDirectory, 'fixtures', 'progress-visual.json');
const signalChildPath = path.join(testDirectory, 'fixtures', 'progress-signal-child.js');
const originalCi = process.env.CI;
const originalTerm = process.env.TERM;

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

/**
 * Installs deterministic clock and timer shims.
 *
 * @returns {{advance: (milliseconds: number) => void, runIntervals: () => void, restore: () => void, active: () => number}} clock controls
 */
function installClock() {
    const originals = {
        now: Date.now,
        setTimeout,
        clearTimeout,
        setInterval,
        clearInterval,
    };
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
 * Captures one dependency-compatible progress bar lifecycle.
 *
 * @param {string} format configured bar template
 * @returns {{output: string, activeTimers: number}} captured bytes and timer state
 */
function captureBar(format) {
    const clock = installClock();
    const capture = createStream({ isTTY: true, columns: 120 });
    try {
        const bar = new ProgressBar({ format, stream: capture.stream });
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
 * Captures a spinner scenario matching the clean dependency-baseline harness.
 *
 * @param {object} [options] scenario controls
 * @returns {{output: string, activeTimers: number, writeRestored: boolean}} captured bytes and cleanup state
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

/** @returns {object} all immutable dependency-backed golden scenarios */
function captureScenarios() {
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

describe('progress visualization dependency parity', () => {
    before(() => {
        delete process.env.CI;
        process.env.TERM = 'xterm-256color';
    });

    after(() => {
        if (originalCi === undefined) {
            delete process.env.CI;
        } else {
            process.env.CI = originalCi;
        }
        if (originalTerm === undefined) {
            delete process.env.TERM;
        } else {
            process.env.TERM = originalTerm;
        }
    });

    it('matches unchanged cli-progress 3.12.0 and yocto-spinner 1.2.2 captures byte-for-byte', async () => {
        const expected = JSON.parse(await fs.readFile(fixturePath, 'utf8'));
        const actual = captureScenarios();
        assert.deepEqual(actual, expected);
        for (const scenario of Object.values(actual)) {
            assert.equal(scenario.activeTimers, 0);
        }
    });

    it('selects Unicode and legacy Windows ASCII default frame sets', () => {
        assert.deepEqual(getDefaultSpinnerFrames('linux', {}), [
            '⠋',
            '⠙',
            '⠹',
            '⠸',
            '⠼',
            '⠴',
            '⠦',
            '⠧',
            '⠇',
            '⠏',
        ]);
        assert.deepEqual(getDefaultSpinnerFrames('win32', {}), ['-', '\\', '|', '/']);
        assert.equal(getDefaultSpinnerFrames('win32', { WT_SESSION: '1' })[0], '⠋');
        assert.equal(getDefaultSpinnerFrames('win32', { TERM_PROGRAM: 'vscode' })[0], '⠋');
    });

    for (const [signal, exitCode] of [
        ['SIGINT', 130],
        ['SIGTERM', 143],
    ]) {
        it(`cleans up and exits ${exitCode} when receiving ${signal}`, () => {
            const child = spawnSync(process.execPath, [signalChildPath, String(signal)], {
                encoding: 'utf8',
            });
            assert.equal(child.status, exitCode, child.stderr);
            assert.equal(child.signal, null);
            const evidence = JSON.parse(child.stdout.trim());
            assert.equal(evidence.signal, signal);
            assert.equal(evidence.code, exitCode);
            assert.equal(evidence.timerStopped, true);
            assert.equal(evidence.listenersRestored, true);
            assert.equal(evidence.writeRestored, true);
            assert.equal(evidence.output.includes('\u001B[?25h'), true);
            assert.match(evidence.output, /<cursorTo><clearLine>/);
        });
    }

    it('restores both companion process stream hooks after interleaved writes', () => {
        const clock = installClock();
        const originals = {
            stdoutWrite: process.stdout.write,
            stderrWrite: process.stderr.write,
            stdoutTty: process.stdout.isTTY,
            stderrTty: process.stderr.isTTY,
        };
        const writes = [];
        try {
            Object.defineProperty(process.stdout, 'isTTY', { configurable: true, value: true });
            Object.defineProperty(process.stderr, 'isTTY', { configurable: true, value: true });
            process.stdout.write = (chunk) => {
                writes.push(`out:${String(chunk)}`);
                return true;
            };
            process.stderr.write = (chunk) => {
                writes.push(`err:${String(chunk)}`);
                return true;
            };
            const baseOut = process.stdout.write;
            const baseErr = process.stderr.write;
            const spinner = createSpinner({
                text: 'working',
                stream: process.stderr,
                spinner: { frames: ['-'], interval: 80 },
                handleSignals: false,
            }).start();
            process.stdout.write('stdout line\n');
            process.stderr.write('stderr partial');
            process.stderr.write(' end\n');
            spinner.stop();
            assert.equal(process.stdout.write, baseOut);
            assert.equal(process.stderr.write, baseErr);
            assert.match(writes.join(''), /stdout line\n/);
            assert.match(writes.join(''), /stderr partial/);
            assert.match(writes.join(''), / end\n/);
            assert.equal(clock.active(), 0);
        } finally {
            process.stdout.write = originals.stdoutWrite;
            process.stderr.write = originals.stderrWrite;
            Object.defineProperty(process.stdout, 'isTTY', {
                configurable: true,
                value: originals.stdoutTty,
            });
            Object.defineProperty(process.stderr, 'isTTY', {
                configurable: true,
                value: originals.stderrTty,
            });
            clock.restore();
        }
    });
});
