/**
 * Creates a Git adapter rooted at the supplied directory.
 *
 * @param {{cwd?: string, gitBinary?: string, run?: typeof execFileAsync}} [options] client options
 * @returns {GitAdapter} shell-free Git client
 */
export function createGit(options?: {
    cwd?: string;
    gitBinary?: string;
    run?: typeof execFileAsync;
}): GitAdapter;
/**
 * Error raised when Git cannot start or returns a non-zero status.
 */
export class GitCommandError extends Error {
    /**
     * Creates an actionable Git command failure.
     *
     * @param {string} message human-readable failure summary
     * @param {{args: string[], cwd: string, cause: Error & {code?: string | number}, stderr: string}} details command context
     */
    constructor(message: string, details: {
        args: string[];
        cwd: string;
        cause: Error & {
            code?: string | number;
        };
        stderr: string;
    });
    args: string[];
    cwd: string;
    code: string | number;
    stderr: string;
}
/**
 * Narrow asynchronous Git client with return shapes compatible with mcdev's former call sites.
 */
export class GitAdapter {
    /**
     * Creates a client. The executable override exists for deterministic missing-Git tests.
     *
     * @param {{cwd?: string, gitBinary?: string, run?: typeof execFileAsync}} [options] process options
     */
    constructor(options?: {
        cwd?: string;
        gitBinary?: string;
        run?: typeof execFileAsync;
    });
    cwd: string;
    gitBinary: string;
    run: typeof execFile.__promisify__;
    /**
     * Executes Git directly and returns decoded stdout.
     *
     * @param {string[]} args exact Git arguments; shell syntax is never accepted or evaluated
     * @returns {Promise.<string>} UTF-8 stdout with its trailing newline preserved
     * @throws {GitCommandError} when Git is unavailable or the command fails
     */
    execute(args: string[]): Promise<string>;
    /**
     * Reads commit history using caller-provided Git log options.
     *
     * @param {string[]} [args] supported `git log` selection arguments
     * @returns {Promise.<{all: {hash: string, date: string, message: string, author_name: string}[]}>} commits in Git order
     */
    log(args?: string[]): Promise<{
        all: {
            hash: string;
            date: string;
            message: string;
            author_name: string;
        }[];
    }>;
    /**
     * Returns name/status changes for a revision range using NUL delimiters for filename safety.
     *
     * @param {string[]} args revision/path arguments passed after the fixed diff options
     * @returns {Promise.<({file: string, status: string, from?: string, changes: number, insertions: number, deletions: number, binary: false})[]>} changes in Git order
     */
    diffNameStatus(args: string[]): Promise<({
        file: string;
        status: string;
        from?: string;
        changes: number;
        insertions: number;
        deletions: number;
        binary: false;
    })[]>;
    /**
     * Returns the file-list subset of the former `simple-git` diff summary shape.
     *
     * @param {string[]} args revision/path arguments
     * @returns {Promise.<{files: ({file: string, status: string, from?: string, changes: number, insertions: number, deletions: number, binary: false})[]}>} summary consumed by mcdev
     */
    diffSummary(args: string[]): Promise<{
        files: ({
            file: string;
            status: string;
            from?: string;
            changes: number;
            insertions: number;
            deletions: number;
            binary: false;
        })[];
    }>;
    /**
     * Resolves a revision, object, or `<revision>:<path>` specification.
     *
     * @param {string[]} args revision arguments
     * @returns {Promise.<string>} resolved value without trailing whitespace
     */
    revparse(args: string[]): Promise<string>;
    /**
     * Lists remotes and their fetch/push URLs, preserving first-seen remote order.
     *
     * @param {boolean} [verbose] retained for call-site parity; URLs are always returned
     * @returns {Promise.<{name: string, refs: {fetch?: string, push?: string}}[]>} remotes
     */
    getRemotes(verbose?: boolean): Promise<{
        name: string;
        refs: {
            fetch?: string;
            push?: string;
        };
    }[]>;
    /**
     * Fetches configured remotes without a shell or interactive stdin.
     *
     * @param {string[]} [args] optional fetch arguments
     * @returns {Promise.<string>} Git fetch stdout
     */
    fetch(args?: string[]): Promise<string>;
    /**
     * Lists remote-tracking branches in Git order.
     *
     * @param {string[]} [args] branch options; only `-r` is used by mcdev
     * @returns {Promise.<{all: string[]}>} branch names
     */
    branch(args?: string[]): Promise<{
        all: string[];
    }>;
    /**
     * Reads the effective Git configuration value visible from the working directory.
     *
     * @param {string} key Git config key
     * @returns {Promise.<{value: string | null}>} value, or null when the key is unset
     */
    getConfig(key: string): Promise<{
        value: string | null;
    }>;
}
declare const execFileAsync: typeof execFile.__promisify__;
import { execFile } from 'node:child_process';
export {};
//# sourceMappingURL=git.d.ts.map