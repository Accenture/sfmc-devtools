/**
 * Selects the exact platform-dependent default frames used by `yocto-spinner` 1.2.2.
 *
 * @param {NodeJS.Platform} [platform] runtime platform
 * @param {NodeJS.ProcessEnv} [environment] runtime environment
 * @returns {string[]} default spinner frames
 */
export function getDefaultSpinnerFrames(platform?: NodeJS.Platform, environment?: NodeJS.ProcessEnv): string[];
/**
 * Creates a Journey spinner with the supported lifecycle.
 *
 * @param {ConstructorParameters<typeof Spinner>[0]} [options] spinner options
 * @returns {Spinner} new spinner
 */
export function createSpinner(options?: ConstructorParameters<typeof Spinner>[0]): Spinner;
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
    lastRedraw: number;
    /**
     * Starts rendering, saves the cursor, and disables line wrapping until `stop()`.
     *
     * @param {number} total maximum progress value
     * @param {number} startValue initial progress value
     * @returns {void}
     */
    start(total: number, startValue: number): void;
    /**
     * Advances the current value using the dependency's synchronous-update throttle.
     *
     * @param {number} [delta] amount to add
     * @returns {void}
     */
    increment(delta?: number): void;
    /**
     * Updates the current value and redraws once more than two throttle windows elapsed.
     *
     * @param {number} value new progress value
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
     * Performs a final render, cancels timers, restores wrapping/cursor position, and writes a newline.
     *
     * @returns {void}
     */
    stop(): void;
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
    constructor({ text, stream, spinner, handleSignals, color, }?: {
        text?: string;
        stream?: TerminalStream;
        spinner?: {
            frames: string[];
            interval?: number;
        };
        handleSignals?: boolean;
        color?: string;
    });
    _text: string;
    stream: TerminalStream;
    frames: string[];
    interval: number;
    handleSignals: boolean;
    _color: string;
    frame: number;
    lastFrameTime: number;
    lines: number;
    spinning: boolean;
    internalWrite: boolean;
    deferringRender: boolean;
    timer: NodeJS.Timeout;
    hookedStreams: Map<any, any>;
    exitHandler: (signal: any) => void;
    interactive: boolean;
    /** @returns {boolean} whether the spinner is active */
    get isSpinning(): boolean;
    /** @param {string} value replacement label */
    set text(value: string);
    /** @returns {string} current spinner label */
    get text(): string;
    /** @param {string} value replacement color */
    set color(value: string);
    /** @returns {string} current frame color */
    get color(): string;
    /**
     * Starts animation, hooks both process terminal streams when applicable, and installs signals.
     *
     * @param {string} [text] optional replacement label
     * @returns {Spinner} this spinner
     */
    start(text?: string): Spinner;
    /**
     * Stops animation, optionally writes final text, and restores all owned resources.
     *
     * @param {string} [finalText] final unprefixed text
     * @returns {Spinner} this spinner
     */
    stop(finalText?: string): Spinner;
    /**
     * Stops with a success status.
     *
     * @param {string} [text] success label
     * @returns {Spinner} this spinner
     */
    success(text?: string): Spinner;
    /**
     * Stops with an error status.
     *
     * @param {string} [text] error label
     * @returns {Spinner} this spinner
     */
    error(text?: string): Spinner;
    /**
     * Stops with a warning status.
     *
     * @param {string} [text] warning label
     * @returns {Spinner} this spinner
     */
    warning(text?: string): Spinner;
    /**
     * Stops with an information status.
     *
     * @param {string} [text] information label
     * @returns {Spinner} this spinner
     */
    info(text?: string): Spinner;
    /**
     * Stops with a status symbol.
     *
     * @param {string} symbol status symbol
     * @param {string} [text] replacement label
     * @returns {Spinner} this spinner
     */
    symbolStop(symbol: string, text?: string): Spinner;
    /**
     * Hooks the spinner stream and interactive stdout/stderr companion stream.
     *
     * @returns {void}
     */
    installHooks(): void;
    /**
     * Installs one write hook without replacing another active spinner's hook.
     *
     * @param {TerminalStream} stream stream to hook
     * @returns {void}
     */
    hookStream(stream: TerminalStream): void;
    /**
     * Restores every exact stream write function owned by this spinner.
     *
     * @returns {void}
     */
    uninstallHooks(): void;
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
    hookedWrite(stream: TerminalStream, originalWrite: NodeJS.WritableStream["write"], chunk: unknown, encoding?: BufferEncoding | ((error?: Error | null) => void), callback?: (error?: Error | null) => void): boolean;
    /**
     * Converts writable chunks using Node's encoding conventions.
     *
     * @param {unknown} chunk chunk to normalize
     * @param {BufferEncoding | ((error?: Error | null) => void)} [encoding] requested encoding
     * @returns {string} chunk text
     */
    stringifyChunk(chunk: unknown, encoding?: BufferEncoding | ((error?: Error | null) => void)): string;
    /**
     * Clears every terminal row occupied by the spinner.
     *
     * @returns {Spinner} this spinner
     */
    clear(): Spinner;
    /**
     * Draws one frame with synchronized-output control sequences on interactive terminals.
     *
     * @returns {void}
     */
    render(): void;
    /**
     * Writes without triggering spinner hooks and always resets the internal-write guard.
     *
     * @param {string} text bytes to emit
     * @returns {void}
     */
    write(text: string): void;
    /**
     * Restores terminal state before exiting with the dependency-compatible signal code.
     *
     * @param {NodeJS.Signals} signal received signal
     * @returns {void}
     */
    handleExit(signal: NodeJS.Signals): void;
}
/**
 * Terminal-capable writable stream subset used by the visual utility.
 */
export type TerminalStream = NodeJS.WritableStream & {
    isTTY?: boolean;
    columns?: number;
    hasColors?: () => boolean;
    cursorTo?: (x: number) => void;
    moveCursor?: (x: number, y: number) => void;
    clearLine?: (direction: number) => void;
};
//# sourceMappingURL=progress.d.ts.map