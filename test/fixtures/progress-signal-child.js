import fs from 'node:fs';
import process from 'node:process';
import { createSpinner } from '../../lib/util/progress.js';

const signal = process.argv[2];
const output = [];
const originalExit = process.exit;
const stream =
    /** @type {NodeJS.WritableStream & {isTTY: boolean, columns: number, hasColors: () => boolean, cursorTo: () => void, moveCursor: () => void, clearLine: () => void}} */ ({
        isTTY: true,
        columns: 80,
        hasColors: () => false,
        /**
         * Records spinner output.
         *
         * @param {unknown} chunk emitted output chunk
         * @returns {boolean} successful write result
         */
        write(chunk) {
            output.push(String(chunk));
            return true;
        },
        /** @returns {void} */
        cursorTo() {
            output.push('<cursorTo>');
        },
        /** @returns {void} */
        moveCursor() {
            output.push('<moveCursor>');
        },
        /** @returns {void} */
        clearLine() {
            output.push('<clearLine>');
        },
    });
const originalWrite = stream.write;
const beforeListeners = {
    SIGINT: process.listenerCount('SIGINT'),
    SIGTERM: process.listenerCount('SIGTERM'),
};
const spinner = createSpinner({
    text: 'signal cleanup',
    stream,
    spinner: { frames: ['-'], interval: 80 },
    handleSignals: true,
});

process.exit = (code) => {
    const evidence = {
        signal,
        code,
        output: output.join(''),
        timerStopped: spinner.timer === undefined,
        listenersRestored:
            process.listenerCount('SIGINT') === beforeListeners.SIGINT &&
            process.listenerCount('SIGTERM') === beforeListeners.SIGTERM,
        writeRestored: stream.write === originalWrite,
    };
    fs.writeSync(process.stdout.fd, `${JSON.stringify(evidence)}\n`);
    return originalExit(code);
};

spinner.start();
process.emit(signal, signal);
