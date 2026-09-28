/**
 * Narrow terminal visualization replacement for the currently used `cli-progress` and
 * `yocto-spinner` behavior. It supports one classic-shaded progress bar and the Journey
 * spinner lifecycle only. Rendering, cursor control, stream-write interleaving, timer
 * ownership, and cleanup intentionally match the captured dependency baselines. Multi-bars,
 * custom formatters, spinner status symbols, and arbitrary progress presets are unsupported.
 */

import process from 'node:process';
import readline from 'node:readline';
import { stripVTControlCharacters } from 'node:util';

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const SYNC_ENABLE = '\u001B[?2026h';
const SYNC_DISABLE = '\u001B[?2026l';
const activeHooks = new Set();

/**
 * Terminal-capable writable stream subset used by the visual utility.
 *
 * @typedef {NodeJS.WritableStream & {isTTY?: boolean, columns?: number, cursorTo?: (x: number) => void, moveCursor?: (x: number, y: number) => void, clearLine?: (direction: number) => void}} TerminalStream
 */

/**
 * Reports whether terminal animation is safe for a stream.
 *
 * @param {TerminalStream} stream - Destination stream.
 * @returns {boolean} Whether cursor-oriented output is enabled.
 */
function isInteractive(stream) {
    return Boolean(stream.isTTY && process.env.TERM !== 'dumb' && !('CI' in process.env));
}

/**
 * Produces the classic 40-cell progress bar used by all current call sites.
 *
 * @param {number} progress - Normalized progress from zero through one.
 * @returns {string} Classic shaded bar glyphs.
 */
function formatClassicBar(progress) {
    const complete = Math.round(progress * 40);
    return '█'.repeat(complete) + '░'.repeat(40 - complete);
}

/**
 * Minimal single progress bar with deterministic terminal cleanup.
 *
 * The class writes to stderr by default, owns one redraw timeout while active, saves and
 * restores the TTY cursor, disables line wrapping, and appends one newline on stop. Non-TTY
 * streams receive no output, matching the removed dependency's default behavior.
 */
export class ProgressBar {
    /**
     * Creates a progress bar for one of mcdev's existing format strings.
     *
     * @param {object} options - Bar configuration.
     * @param {string} options.format - Template containing bar/value tokens.
     * @param {TerminalStream} [options.stream] - Output stream.
     */
    constructor({ format, stream = process.stderr }) {
        this.format = format;
        this.stream = stream;
        this.total = 100;
        this.value = 0;
        this.timer = undefined;
        this.lastDrawn = '';
    }

    /**
     * Starts rendering and takes ownership of the terminal cursor until `stop()`.
     *
     * @param {number} total - Maximum progress value.
     * @param {number} startValue - Initial progress value.
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
     * Advances the current value without forcing an immediate extra redraw.
     *
     * @param {number} [delta] - Amount to add.
     * @returns {void}
     */
    increment(delta = 1) {
        this.update(this.value + delta);
    }

    /**
     * Updates the current value; active bars redraw synchronously after the throttle window.
     *
     * @param {number} value - New progress value.
     * @returns {void}
     */
    update(value) {
        if (!this.timer) {
            return;
        }
        this.value = value;
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
        const progress = this.total === 0 ? 1 : Math.min(Math.max(this.value / this.total, 0), 1);
        const text = this.format.replaceAll(/\{(\w+)\}/g, (token, key) => {
            const values = {
                bar: formatClassicBar(progress),
                percentage: String(Math.floor(progress * 100)),
                value: String(this.value),
                total: String(this.total),
            };
            return values[key] ?? token;
        });
        if (text !== this.lastDrawn) {
            readline.cursorTo(this.stream, 0);
            this.stream.write(text);
            readline.clearLine(this.stream, 1);
            this.lastDrawn = text;
        }
        this.timer = setTimeout(() => this.render(), 100);
    }

    /**
     * Performs a final render, cancels timers, restores wrapping/cursor position, and writes
     * the terminating newline. Calling it while inactive is a no-op.
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
 * Minimal Journey polling spinner that preserves writes made while animation is active.
 */
export class Spinner {
    /**
     * Creates a spinner. It owns an interval only for interactive streams and restores any
     * stream write hook, cursor visibility, and timer on `stop()`.
     *
     * @param {object} options - Spinner configuration.
     * @param {string} [options.text] - Visible label.
     * @param {TerminalStream} [options.stream] - Output stream.
     * @param {{frames: string[], interval: number}} [options.spinner] - Deterministic frames.
     * @param {boolean} [options.handleSignals] - Retained API option; signal handling is unused by mcdev.
     */
    constructor({
        text = '',
        stream = process.stderr,
        spinner = { frames: SPINNER_FRAMES, interval: 80 },
        handleSignals = true,
    } = {}) {
        this.text = text;
        this.stream = stream;
        this.frames = spinner.frames;
        this.interval = spinner.interval;
        this.handleSignals = handleSignals;
        this.frame = -1;
        this.lastFrameTime = 0;
        this.lines = 0;
        this.spinning = false;
        this.internalWrite = false;
        this.timer = undefined;
        this.originalWrite = undefined;
    }

    /**
     * Starts animation, hides the cursor, and hooks stream writes so log lines do not overwrite it.
     *
     * @param {string} [text] - Optional replacement label.
     * @returns {Spinner} This spinner.
     */
    start(text) {
        if (text) {
            this.text = text;
        }
        if (this.spinning) {
            return this;
        }
        this.spinning = true;
        if (isInteractive(this.stream)) {
            this.write('\u001B[?25l');
            this.installHook();
        }
        this.render();
        if (isInteractive(this.stream)) {
            this.timer = setInterval(() => this.render(), this.interval);
        }
        return this;
    }

    /**
     * Stops animation and restores the stream, cursor, and terminal line state.
     *
     * @returns {Spinner} This spinner.
     */
    stop() {
        if (!this.spinning) {
            return this;
        }
        this.spinning = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
        this.uninstallHook();
        if (isInteractive(this.stream)) {
            this.write('\u001B[?25h');
        }
        this.clear();
        return this;
    }

    /**
     * Installs the single active hook allowed per stream.
     *
     * @returns {void}
     */
    installHook() {
        if (activeHooks.has(this.stream)) {
            return;
        }
        this.originalWrite = this.stream.write;
        activeHooks.add(this.stream);
        this.stream.write = /** @type {NodeJS.WritableStream['write']} */ (
            (chunk, encoding, callback) => {
                if (this.internalWrite || !this.spinning) {
                    return this.originalWrite.call(this.stream, chunk, encoding, callback);
                }
                this.clear();
                const result = this.originalWrite.call(this.stream, chunk, encoding, callback);
                if (String(chunk).endsWith('\n') && this.spinning) {
                    this.render();
                }
                return result;
            }
        );
    }

    /**
     * Restores the exact write function replaced by this spinner.
     *
     * @returns {void}
     */
    uninstallHook() {
        if (this.originalWrite && this.stream.write !== this.originalWrite) {
            this.stream.write = this.originalWrite;
        }
        activeHooks.delete(this.stream);
        this.originalWrite = undefined;
    }

    /**
     * Clears every terminal row occupied by the spinner.
     *
     * @returns {Spinner} This spinner.
     */
    clear() {
        if (!isInteractive(this.stream) || this.lines === 0) {
            return this;
        }
        this.internalWrite = true;
        this.stream.cursorTo?.(0);
        for (let index = 0; index < this.lines; index++) {
            if (index > 0) {
                this.stream.moveCursor?.(0, -1);
            }
            this.stream.clearLine?.(1);
        }
        this.internalWrite = false;
        this.lines = 0;
        return this;
    }

    /**
     * Draws a frame with synchronized-output control sequences on interactive terminals.
     *
     * @returns {void}
     */
    render() {
        const now = Date.now();
        if (this.frame === -1 || now - this.lastFrameTime >= this.interval) {
            this.frame = (this.frame + 1) % this.frames.length;
            this.lastFrameTime = now;
        }
        let output = `${this.frames[this.frame]} ${this.text}`;
        if (!isInteractive(this.stream)) {
            output += '\n';
            this.write(output);
            return;
        }
        this.write(SYNC_ENABLE);
        this.clear();
        this.write(output);
        this.write(SYNC_DISABLE);
        const width = this.stream.columns || 80;
        this.lines = stripVTControlCharacters(output)
            .split('\n')
            .reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / width)), 0);
    }

    /**
     * Writes without triggering this spinner's stream hook.
     *
     * @param {string} text - Bytes to emit.
     * @returns {void}
     */
    write(text) {
        this.internalWrite = true;
        this.stream.write(text);
        this.internalWrite = false;
    }
}

/**
 * Creates a Journey spinner with the supported lifecycle.
 *
 * @param {ConstructorParameters<typeof Spinner>[0]} [options] - Spinner options.
 * @returns {Spinner} New spinner.
 */
export function createSpinner(options) {
    return new Spinner(options);
}
