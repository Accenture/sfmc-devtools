/**
 * Narrow terminal visualization replacement for the `cli-progress` 3.12.0 single-bar usage and
 * `yocto-spinner` 1.2.2 spinner lifecycle used by mcdev. Progress bars support only the classic
 * shaded preset and string formats used by Asset/DevOps migrations. Spinners support start/stop,
 * status stops, text/color changes, companion stdout/stderr write preservation, and signal cleanup.
 * Both implementations own their timers and terminal hooks and restore every owned resource when
 * stopped. Multi-bars, arbitrary progress presets, custom formatters, and spinner subclasses are
 * intentionally unsupported.
 */

import process from 'node:process';
import readline from 'node:readline';
import tty from 'node:tty';
import { stripVTControlCharacters } from 'node:util';

const UNICODE_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const ASCII_FRAMES = ['-', '\\', '|', '/'];
const SYNC_ENABLE = '\u001B[?2026h';
const SYNC_DISABLE = '\u001B[?2026l';
const COLORS = { blue: 34, cyan: 36, green: 32, red: 31, yellow: 33 };
const activeHooks = new Set();

/** @returns {boolean} whether the runtime supports Unicode terminal symbols */
function supportsUnicode() {
    return (
        process.platform !== 'win32' ||
        Boolean(process.env.WT_SESSION) ||
        process.env.TERM_PROGRAM === 'vscode'
    );
}

/**
 * Terminal-capable writable stream subset used by the visual utility.
 *
 * @typedef {NodeJS.WritableStream & {isTTY?: boolean, columns?: number, hasColors?: () => boolean, cursorTo?: (x: number) => void, moveCursor?: (x: number, y: number) => void, clearLine?: (direction: number) => void}} TerminalStream
 */

/**
 * Reports whether terminal animation is safe for a stream.
 *
 * @param {TerminalStream} stream destination stream
 * @returns {boolean} whether cursor-oriented output is enabled
 */
function isInteractive(stream) {
    return Boolean(stream.isTTY && process.env.TERM !== 'dumb' && !('CI' in process.env));
}

/**
 * Selects the exact platform-dependent default frames used by `yocto-spinner` 1.2.2.
 *
 * @param {NodeJS.Platform} [platform] runtime platform
 * @param {NodeJS.ProcessEnv} [environment] runtime environment
 * @returns {string[]} default spinner frames
 */
export function getDefaultSpinnerFrames(platform = process.platform, environment = process.env) {
    return platform !== 'win32' || environment.WT_SESSION || environment.TERM_PROGRAM === 'vscode'
        ? [...UNICODE_FRAMES]
        : [...ASCII_FRAMES];
}

/**
 * Applies an ANSI color only when the destination terminal reports color support.
 *
 * @param {string} text text to color
 * @param {string} color supported color name
 * @param {TerminalStream} stream destination stream
 * @returns {string} colored or plain text
 */
function colorize(text, color, stream) {
    const supportsColor =
        stream.hasColors?.() ?? tty.WriteStream?.prototype?.hasColors?.() ?? false;
    const code = COLORS[color] ?? COLORS.cyan;
    return supportsColor ? `\u001B[${code}m${text}\u001B[39m` : text;
}

/**
 * Produces the classic 40-cell progress bar used by all current call sites.
 *
 * @param {number} progress normalized progress from zero through one
 * @returns {string} classic shaded bar glyphs
 */
function formatClassicBar(progress) {
    const complete = Math.round(progress * 40);
    return '█'.repeat(complete) + '░'.repeat(40 - complete);
}

/**
 * Minimal single progress bar with `cli-progress` 3.12.0 lifecycle and terminal side effects.
 */
export class ProgressBar {
    /**
     * Creates a progress bar for one of mcdev's existing format strings.
     *
     * @param {object} options bar configuration
     * @param {string} options.format template containing bar/value tokens
     * @param {TerminalStream} [options.stream] output stream
     */
    constructor({ format, stream = process.stderr }) {
        this.format = format;
        this.stream = stream;
        this.total = 100;
        this.value = 0;
        this.timer = undefined;
        this.lastDrawn = '';
        this.lastRedraw = Date.now();
    }

    /**
     * Starts rendering, saves the cursor, and disables line wrapping until `stop()`.
     *
     * @param {number} total maximum progress value
     * @param {number} startValue initial progress value
     * @returns {void}
     */
    start(total, startValue) {
        if (!this.stream.isTTY) {
            return;
        }
        this.total = total >= 0 ? total : 100;
        this.value = startValue || 0;
        this.lastDrawn = '';
        this.stream.write('\u001B7');
        this.stream.write('\u001B[?7l');
        this.render();
    }

    /**
     * Advances the current value using the dependency's synchronous-update throttle.
     *
     * @param {number} [delta] amount to add
     * @returns {void}
     */
    increment(delta = 1) {
        this.update(this.value + delta);
    }

    /**
     * Updates the current value and redraws once more than two throttle windows elapsed.
     *
     * @param {number} value new progress value
     * @returns {void}
     */
    update(value) {
        if (!this.timer) {
            return;
        }
        this.value = value;
        if (this.lastRedraw + 200 < Date.now()) {
            this.render();
        }
    }

    /**
     * Renders the current state and schedules the next dependency-compatible redraw timer.
     *
     * @returns {void}
     */
    render() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        const rawProgress = this.value / this.total;
        const progress = Number.isNaN(rawProgress) ? 1 : Math.min(Math.max(rawProgress, 0), 1);
        const values = {
            bar: formatClassicBar(progress),
            percentage: String(Math.floor(progress * 100)),
            value: String(this.value),
            total: String(this.total),
        };
        const text = this.format.replaceAll(/\{(\w+)\}/g, (token, key) => values[key] ?? token);
        if (text !== this.lastDrawn) {
            readline.cursorTo(this.stream, 0);
            this.stream.write(text);
            readline.clearLine(this.stream, 1);
            this.lastDrawn = text;
            this.lastRedraw = Date.now();
        }
        this.timer = setTimeout(() => this.render(), 100);
    }

    /**
     * Performs a final render, cancels timers, restores wrapping/cursor position, and writes a newline.
     *
     * @returns {void}
     */
    stop() {
        if (!this.timer) {
            return;
        }
        this.render();
        clearTimeout(this.timer);
        this.timer = undefined;
        this.stream.write('\u001B[?7h');
        this.stream.write('\u001B8');
        this.stream.write('\n');
    }
}

/**
 * Minimal Journey polling spinner preserving `yocto-spinner` 1.2.2 output and cleanup behavior.
 */
export class Spinner {
    /**
     * Creates a spinner with validated frames and interval.
     *
     * @param {object} [options] spinner configuration
     * @param {string} [options.text] visible label
     * @param {TerminalStream} [options.stream] output stream
     * @param {{frames: string[], interval?: number}} [options.spinner] deterministic frames
     * @param {boolean} [options.handleSignals] subscribe to SIGINT and SIGTERM while active
     * @param {string} [options.color] supported frame color
     */
    constructor({
        text = '',
        stream = process.stderr,
        spinner = { frames: getDefaultSpinnerFrames(), interval: 80 },
        handleSignals = true,
        color = 'cyan',
    } = {}) {
        if (
            !Array.isArray(spinner.frames) ||
            spinner.frames.length === 0 ||
            spinner.frames.some((frame) => typeof frame !== 'string')
        ) {
            throw new Error('The `spinner.frames` option must be a non-empty array of strings');
        }
        if (
            spinner.interval !== undefined &&
            !(Number.isInteger(spinner.interval) && spinner.interval > 0)
        ) {
            throw new Error('The `spinner.interval` option must be a positive integer');
        }
        this._text = text;
        this.stream = stream;
        this.frames = [...spinner.frames];
        this.interval = spinner.interval ?? 80;
        this.handleSignals = handleSignals;
        this._color = color;
        this.frame = -1;
        this.lastFrameTime = 0;
        this.lines = 0;
        this.spinning = false;
        this.internalWrite = false;
        this.deferringRender = false;
        this.timer = undefined;
        this.hookedStreams = new Map();
        this.exitHandler = (signal) => this.handleExit(signal);
        this.interactive = isInteractive(stream);
    }

    /** @returns {boolean} whether the spinner is active */
    get isSpinning() {
        return this.spinning;
    }

    /** @returns {string} current spinner label */
    get text() {
        return this._text;
    }

    /** @param {string} value replacement label */
    set text(value) {
        this._text = value ?? '';
        this.render();
    }

    /** @returns {string} current frame color */
    get color() {
        return this._color;
    }

    /** @param {string} value replacement color */
    set color(value) {
        this._color = value;
        this.render();
    }

    /**
     * Starts animation, hooks both process terminal streams when applicable, and installs signals.
     *
     * @param {string} [text] optional replacement label
     * @returns {Spinner} this spinner
     */
    start(text) {
        if (text) {
            this._text = text;
        }
        if (this.spinning) {
            return this;
        }
        this.spinning = true;
        if (this.interactive) {
            this.write('\u001B[?25l');
            this.installHooks();
        }
        this.render();
        if (this.handleSignals) {
            process.once('SIGINT', this.exitHandler);
            process.once('SIGTERM', this.exitHandler);
        }
        if (this.interactive) {
            this.timer = setInterval(() => this.render(), this.interval);
        }
        return this;
    }

    /**
     * Stops animation, optionally writes final text, and restores all owned resources.
     *
     * @param {string} [finalText] final unprefixed text
     * @returns {Spinner} this spinner
     */
    stop(finalText) {
        if (!this.spinning) {
            return this;
        }
        const shouldWriteNewline = this.deferringRender;
        this.spinning = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
        this.deferringRender = false;
        this.uninstallHooks();
        if (this.interactive) {
            this.write('\u001B[?25h');
        }
        this.clear();
        if (this.handleSignals) {
            process.off('SIGINT', this.exitHandler);
            process.off('SIGTERM', this.exitHandler);
        }
        if (finalText) {
            this.stream.write(`${shouldWriteNewline ? '\n' : ''}${finalText}\n`);
        }
        return this;
    }

    /**
     * Stops with a success status.
     *
     * @param {string} [text] success label
     * @returns {Spinner} this spinner
     */
    success(text) {
        return this.symbolStop(colorize(supportsUnicode() ? '✔' : '√', 'green', this.stream), text);
    }

    /**
     * Stops with an error status.
     *
     * @param {string} [text] error label
     * @returns {Spinner} this spinner
     */
    error(text) {
        return this.symbolStop(colorize(supportsUnicode() ? '✖' : '×', 'red', this.stream), text);
    }

    /**
     * Stops with a warning status.
     *
     * @param {string} [text] warning label
     * @returns {Spinner} this spinner
     */
    warning(text) {
        return this.symbolStop(
            colorize(supportsUnicode() ? '⚠' : '‼', 'yellow', this.stream),
            text
        );
    }

    /**
     * Stops with an information status.
     *
     * @param {string} [text] information label
     * @returns {Spinner} this spinner
     */
    info(text) {
        return this.symbolStop(colorize(supportsUnicode() ? 'ℹ' : 'i', 'blue', this.stream), text);
    }

    /**
     * Stops with a status symbol.
     *
     * @param {string} symbol status symbol
     * @param {string} [text] replacement label
     * @returns {Spinner} this spinner
     */
    symbolStop(symbol, text) {
        return this.stop(`${symbol} ${text ?? this._text}`);
    }

    /**
     * Hooks the spinner stream and interactive stdout/stderr companion stream.
     *
     * @returns {void}
     */
    installHooks() {
        const streams = new Set([this.stream]);
        if (this.stream === process.stdout || this.stream === process.stderr) {
            if (isInteractive(process.stdout)) {
                streams.add(process.stdout);
            }
            if (isInteractive(process.stderr)) {
                streams.add(process.stderr);
            }
        }
        for (const stream of streams) {
            this.hookStream(stream);
        }
    }

    /**
     * Installs one write hook without replacing another active spinner's hook.
     *
     * @param {TerminalStream} stream stream to hook
     * @returns {void}
     */
    hookStream(stream) {
        if (!stream || this.hookedStreams.has(stream) || activeHooks.has(stream)) {
            return;
        }
        const originalWrite = stream.write;
        const hookedWrite = (chunk, encoding, callback) =>
            this.hookedWrite(stream, originalWrite, chunk, encoding, callback);
        this.hookedStreams.set(stream, { originalWrite, hookedWrite });
        activeHooks.add(stream);
        stream.write = /** @type {NodeJS.WritableStream['write']} */ (hookedWrite);
    }

    /**
     * Restores every exact stream write function owned by this spinner.
     *
     * @returns {void}
     */
    uninstallHooks() {
        for (const [stream, hook] of this.hookedStreams) {
            if (stream.write === hook.hookedWrite) {
                stream.write = hook.originalWrite;
            }
            activeHooks.delete(stream);
        }
        this.hookedStreams.clear();
    }

    /**
     * Preserves external writes, including partial chunks, without drawing through unfinished lines.
     *
     * @param {TerminalStream} stream written stream
     * @param {NodeJS.WritableStream['write']} originalWrite original writer
     * @param {unknown} chunk write chunk
     * @param {BufferEncoding | ((error?: Error | null) => void)} [encoding] encoding or callback
     * @param {(error?: Error | null) => void} [callback] callback
     * @returns {boolean} stream backpressure result
     */
    hookedWrite(stream, originalWrite, chunk, encoding, callback) {
        let resolvedEncoding = encoding;
        let resolvedCallback = callback;
        if (typeof resolvedEncoding === 'function') {
            resolvedCallback = resolvedEncoding;
            resolvedEncoding = undefined;
        }
        if (this.internalWrite || !this.spinning) {
            return originalWrite.call(stream, chunk, resolvedEncoding, resolvedCallback);
        }
        if (this.lines > 0) {
            this.clear();
        }
        const chunkText = this.stringifyChunk(chunk, resolvedEncoding);
        const result = originalWrite.call(stream, chunk, resolvedEncoding, resolvedCallback);
        if (chunkText.endsWith('\n')) {
            this.deferringRender = false;
        } else if (chunkText !== '') {
            this.deferringRender = true;
        }
        if (this.spinning && !this.deferringRender) {
            this.render();
        }
        return result;
    }

    /**
     * Converts writable chunks using Node's encoding conventions.
     *
     * @param {unknown} chunk chunk to normalize
     * @param {BufferEncoding | ((error?: Error | null) => void)} [encoding] requested encoding
     * @returns {string} chunk text
     */
    stringifyChunk(chunk, encoding) {
        if (chunk === undefined || chunk === null) {
            return '';
        }
        if (typeof chunk === 'string') {
            return chunk;
        }
        if (Buffer.isBuffer(chunk)) {
            const normalized = typeof encoding === 'string' && encoding ? encoding : 'utf8';
            return chunk.toString(normalized);
        }
        if (ArrayBuffer.isView(chunk)) {
            const normalized = typeof encoding === 'string' && encoding ? encoding : 'utf8';
            return Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength).toString(
                normalized
            );
        }
        return String(chunk);
    }

    /**
     * Clears every terminal row occupied by the spinner.
     *
     * @returns {Spinner} this spinner
     */
    clear() {
        if (!this.interactive || this.lines === 0) {
            return this;
        }
        this.internalWrite = true;
        try {
            this.stream.cursorTo?.(0);
            for (let index = 0; index < this.lines; index++) {
                if (index > 0) {
                    this.stream.moveCursor?.(0, -1);
                }
                this.stream.clearLine?.(1);
            }
        } finally {
            this.internalWrite = false;
        }
        this.lines = 0;
        return this;
    }

    /**
     * Draws one frame with synchronized-output control sequences on interactive terminals.
     *
     * @returns {void}
     */
    render() {
        if (this.deferringRender) {
            return;
        }
        const now = Date.now();
        if (this.frame === -1 || now - this.lastFrameTime >= this.interval) {
            this.frame = (this.frame + 1) % this.frames.length;
            this.lastFrameTime = now;
        }
        let output = `${colorize(this.frames[this.frame], this._color, this.stream)} ${this._text}`;
        if (!this.interactive) {
            output += '\n';
        }
        if (this.interactive) {
            this.write(SYNC_ENABLE);
        }
        try {
            this.clear();
            this.write(output);
        } finally {
            if (this.interactive) {
                this.write(SYNC_DISABLE);
            }
        }
        if (this.interactive) {
            const width = this.stream.columns || 80;
            this.lines = stripVTControlCharacters(output)
                .split('\n')
                .reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / width)), 0);
        }
    }

    /**
     * Writes without triggering spinner hooks and always resets the internal-write guard.
     *
     * @param {string} text bytes to emit
     * @returns {void}
     */
    write(text) {
        this.internalWrite = true;
        try {
            this.stream.write(text);
        } finally {
            this.internalWrite = false;
        }
    }

    /**
     * Restores terminal state before exiting with the dependency-compatible signal code.
     *
     * @param {NodeJS.Signals} signal received signal
     * @returns {void}
     */
    handleExit(signal) {
        if (this.spinning) {
            this.stop();
        }
        process.exitCode = signal === 'SIGINT' ? 130 : signal === 'SIGTERM' ? 143 : 1;
        process.kill(process.pid, signal);
    }
}

/**
 * Creates a Journey spinner with the supported lifecycle.
 *
 * @param {ConstructorParameters<typeof Spinner>[0]} [options] spinner options
 * @returns {Spinner} new spinner
 */
export function createSpinner(options) {
    return new Spinner(options);
}
