import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSpinner, ProgressBar } from '../lib/util/progress.js';

const fixturePath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    'fixtures',
    'progress-visual.json'
);
const originalForceColor = process.env.FORCE_COLOR;
const originalCi = process.env.CI;
const originalTerm = process.env.TERM;

/**
 * Creates a deterministic stream that records terminal writes as bytes.
 *
 * @param {object} options - Stream characteristics.
 * @param {boolean} options.isTTY - Whether the stream behaves as a TTY.
 * @param {number} options.columns - Reported terminal width.
 * @returns {{stream: object, output: () => string}} Fake stream and output reader.
 */
function createStream({ isTTY, columns }) {
    const chunks = [];
    const stream = {
        isTTY,
        columns,
        write: (chunk) => {
            chunks.push(Buffer.from(String(chunk)));
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
 * Installs deterministic clock and timer shims for dependency characterization.
 *
 * @returns {{advance: (milliseconds: number) => void, runIntervals: () => void, restore: () => void, active: () => number}} Clock controls.
 */
function installClock() {
    const originalNow = Date.now;
    const originalSetTimeout = setTimeout;
    const originalClearTimeout = clearTimeout;
    const originalSetInterval = setInterval;
    const originalClearInterval = clearInterval;
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
        clearTimeout: {
            configurable: true,
            value: (id) => timeouts.delete(id),
        },
        setInterval: {
            configurable: true,
            value: (callback, delay) => {
                const id = nextId++;
                intervals.set(id, { callback, delay });
                return id;
            },
        },
        clearInterval: {
            configurable: true,
            value: (id) => intervals.delete(id),
        },
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
            Object.defineProperty(Date, 'now', { configurable: true, value: originalNow });
            Object.defineProperties(globalThis, {
                setTimeout: {
                    configurable: true,
                    value: originalSetTimeout,
                },
                clearTimeout: {
                    configurable: true,
                    value: originalClearTimeout,
                },
                setInterval: {
                    configurable: true,
                    value: originalSetInterval,
                },
                clearInterval: {
                    configurable: true,
                    value: originalClearInterval,
                },
            });
        },
    };
}

/**
 * Captures one dependency-backed progress bar lifecycle.
 *
 * @param {string} format - Configured bar template.
 * @param {number} columns - Terminal width.
 * @returns {{output: string, activeTimers: number}} Captured bytes and cleanup state.
 */
function captureBar(format, columns = 120) {
    const clock = installClock();
    const capture = createStream({ isTTY: true, columns });
    try {
        const bar = new ProgressBar({ format, stream: capture.stream });
        bar.start(4, 0);
        clock.advance(250);
        bar.update(1);
        bar.render();
        clock.advance(250);
        bar.update(2);
        bar.render();
        clock.advance(250);
        bar.update(4);
        bar.stop();
        return { output: capture.output(), activeTimers: clock.active() };
    } finally {
        clock.restore();
    }
}

/**
 * Captures the dependency's non-TTY progress behavior.
 *
 * @returns {{output: string, activeTimers: number}} Captured bytes and cleanup state.
 */
function captureNonTtyBar() {
    const clock = installClock();
    const capture = createStream({ isTTY: false, columns: 100 });
    try {
        const bar = new ProgressBar({
            format: '                 Processing changes [{bar}] {percentage}% | {value}/{total}',
            stream: capture.stream,
        });
        bar.start(2, 0);
        bar.increment();
        bar.stop();
        return { output: capture.output(), activeTimers: clock.active() };
    } finally {
        clock.restore();
    }
}

/**
 * Captures an interactive spinner including frame, hook, wrapping, and cleanup behavior.
 *
 * @returns {{output: string, activeTimers: number}} Captured bytes and cleanup state.
 */
function captureSpinner() {
    const clock = installClock();
    const capture = createStream({ isTTY: true, columns: 16 });
    try {
        const spinner = createSpinner({
            text: 'Publishing multi-step journey…',
            stream: capture.stream,
            spinner: { frames: ['-', '\\', '|'], interval: 80 },
            handleSignals: false,
        });
        spinner.start();
        clock.advance(80);
        clock.runIntervals();
        capture.stream.write('status update\n');
        clock.advance(80);
        clock.runIntervals();
        spinner.stop();
        return { output: capture.output(), activeTimers: clock.active() };
    } finally {
        clock.restore();
    }
}

/**
 * Captures non-interactive spinner rendering and cleanup.
 *
 * @returns {{output: string, activeTimers: number}} Captured bytes and cleanup state.
 */
function captureNonTtySpinner() {
    const clock = installClock();
    const capture = createStream({ isTTY: false, columns: 80 });
    try {
        const spinner = createSpinner({
            text: 'Validating journey…',
            stream: capture.stream,
            spinner: { frames: ['-'], interval: 80 },
            handleSignals: false,
        });
        spinner.start();
        spinner.stop();
        return { output: capture.output(), activeTimers: clock.active() };
    } finally {
        clock.restore();
    }
}

/**
 * Builds all golden visualization scenarios used by current call sites.
 *
 * @returns {object} Scenario results keyed by stable names.
 */
function captureScenarios() {
    return {
        assetDownload: captureBar(
            '                 Downloading [{bar}] {percentage}% | {value}/{total} | asset-email'
        ),
        devopsChanges: captureBar(
            '                 Processing changes [{bar}] {percentage}% | {value}/{total}'
        ),
        assetMigration: captureBar(
            '                 Migrating asset-message [{bar}] {percentage}% | {value}/{total}',
            72
        ),
        nonTtyBar: captureNonTtyBar(),
        journeySpinner: captureSpinner(),
        nonTtySpinner: captureNonTtySpinner(),
    };
}

describe('progress visualization golden parity', () => {
    before(() => {
        process.env.FORCE_COLOR = '1';
        delete process.env.CI;
        process.env.TERM = 'xterm-256color';
    });

    after(() => {
        if (originalForceColor === undefined) {
            delete process.env.FORCE_COLOR;
        } else {
            process.env.FORCE_COLOR = originalForceColor;
        }
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

    it('matches the installed dependencies byte-for-byte', async () => {
        const actual = captureScenarios();
        if (process.env.UPDATE_PROGRESS_FIXTURES === '1') {
            await fs.mkdir(path.dirname(fixturePath), { recursive: true });
            await fs.writeFile(fixturePath, `${JSON.stringify(actual, null, 2)}\n`);
        }
        const expected = JSON.parse(await fs.readFile(fixturePath, 'utf8'));
        assert.deepEqual(actual, expected);
        for (const scenario of Object.values(actual)) {
            assert.equal(scenario.activeTimers, 0);
        }
    });
});
