/**
 * Creates a Journey spinner with the supported lifecycle.
 *
 * @param {ConstructorParameters<typeof Spinner>[0]} [options] - Spinner options.
 * @returns {Spinner} New spinner.
 */
export function createSpinner(options?: ConstructorParameters<typeof Spinner>[0]): Spinner;
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
    constructor({ format, stream }: {
        format: string;
        stream?: TerminalStream;
    });
    format: string;
    stream: TerminalStream;
    total: number;
    value: number;
    timer: NodeJS.Timeout;
    lastDrawn: string;
    /**
     * Starts rendering and takes ownership of the terminal cursor until `stop()`.
     *
     * @param {number} total - Maximum progress value.
     * @param {number} startValue - Initial progress value.
     * @returns {void}
     */
    start(total: number, startValue: number): void;
    /**
     * Advances the current value without forcing an immediate extra redraw.
     *
     * @param {number} [delta] - Amount to add.
     * @returns {void}
     */
    increment(delta?: number): void;
    /**
     * Updates the current value; active bars redraw synchronously after the throttle window.
     *
     * @param {number} value - New progress value.
     * @returns {void}
     */
    update(value: number): void;
    /**
     * Renders the current state and schedules the next dependency-compatible redraw timer.
     *
     * @returns {void}
     */
    render(): void;
    /**
     * Performs a final render, cancels timers, restores wrapping/cursor position, and writes
     * the terminating newline. Calling it while inactive is a no-op.
     *
     * @returns {void}
     */
    stop(): void;
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
    constructor({ text, stream, spinner, handleSignals, }?: {
        text?: string;
        stream?: TerminalStream;
        spinner?: {
            frames: string[];
            interval: number;
        };
        handleSignals?: boolean;
    });
    text: string;
    stream: TerminalStream;
    frames: string[];
    interval: number;
    handleSignals: boolean;
    frame: number;
    lastFrameTime: number;
    lines: number;
    spinning: boolean;
    internalWrite: boolean;
    timer: NodeJS.Timeout;
    originalWrite: {
        (buffer: Uint8Array | string, cb?: (err?: Error | null) => void): boolean;
        (str: string, encoding?: BufferEncoding, cb?: (err?: Error | null) => void): boolean;
    };
    /**
     * Starts animation, hides the cursor, and hooks stream writes so log lines do not overwrite it.
     *
     * @param {string} [text] - Optional replacement label.
     * @returns {Spinner} This spinner.
     */
    start(text?: string): Spinner;
    /**
     * Stops animation and restores the stream, cursor, and terminal line state.
     *
     * @returns {Spinner} This spinner.
     */
    stop(): Spinner;
    /**
     * Installs the single active hook allowed per stream.
     *
     * @returns {void}
     */
    installHook(): void;
    /**
     * Restores the exact write function replaced by this spinner.
     *
     * @returns {void}
     */
    uninstallHook(): void;
    /**
     * Clears every terminal row occupied by the spinner.
     *
     * @returns {Spinner} This spinner.
     */
    clear(): Spinner;
    /**
     * Draws a frame with synchronized-output control sequences on interactive terminals.
     *
     * @returns {void}
     */
    render(): void;
    /**
     * Writes without triggering this spinner's stream hook.
     *
     * @param {string} text - Bytes to emit.
     * @returns {void}
     */
    write(text: string): void;
}
/**
 * Terminal-capable writable stream subset used by the visual utility.
 */
export type TerminalStream = NodeJS.WritableStream & {
    isTTY?: boolean;
    columns?: number;
    cursorTo?: (x: number) => void;
    moveCursor?: (x: number, y: number) => void;
    clearLine?: (direction: number) => void;
};
//# sourceMappingURL=progress.d.ts.map