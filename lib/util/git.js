/**
 * Shell-free replacement for the subset of `simple-git` used by mcdev.
 *
 * Every command is executed directly through `node:child_process.execFile` with an argument array;
 * no command text is interpreted by a shell. The adapter supports log records, name/status and
 * summary diffs, revision/blob lookup, remotes, fetch, remote branches, and config reads. Commands
 * run in the configured working directory and decode Git output as UTF-8. Failures retain the Git
 * exit code and stderr while adding the command and working directory needed for remediation.
 * Interactive commands, mutation beyond fetch, arbitrary command strings, streaming, and the rest
 * of the `simple-git` API are intentionally unsupported.
 */

import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

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
    constructor(message, details) {
        super(message, { cause: details.cause });
        this.name = 'GitCommandError';
        this.args = details.args;
        this.cwd = details.cwd;
        this.code = details.cause.code;
        this.stderr = details.stderr;
    }
}

/**
 * Formats a renamed path using Git's compact brace notation expected by mcdev's delta parser.
 *
 * @param {string} fromPath original repository-relative path
 * @param {string} toPath destination repository-relative path
 * @returns {string} compact rename path, or an explicit old/new pair when no common segment exists
 */
function formatRename(fromPath, toPath) {
    const fromParts = fromPath.split('/');
    const toParts = toPath.split('/');
    let prefixLength = 0;
    while (
        prefixLength < fromParts.length &&
        prefixLength < toParts.length &&
        fromParts[prefixLength] === toParts[prefixLength]
    ) {
        prefixLength++;
    }
    let suffixLength = 0;
    while (
        suffixLength < fromParts.length - prefixLength &&
        suffixLength < toParts.length - prefixLength &&
        fromParts[fromParts.length - 1 - suffixLength] ===
            toParts[toParts.length - 1 - suffixLength]
    ) {
        suffixLength++;
    }
    const prefix = prefixLength ? fromParts.slice(0, prefixLength).join('/') + '/' : '';
    const suffix = suffixLength ? '/' + fromParts.slice(-suffixLength).join('/') : '';
    const before = fromParts.slice(prefixLength, fromParts.length - suffixLength).join('/');
    const after = toParts.slice(prefixLength, toParts.length - suffixLength).join('/');
    return `${prefix}{${before} => ${after}}${suffix}`;
}

/**
 * Parses NUL-delimited `git diff --name-status` output without losing unusual filenames.
 *
 * @param {string} output raw Git output
 * @returns {{file: string, status: string, from?: string}[]} changes in Git's emitted order
 */
function parseNameStatus(output) {
    const fields = output.split('\0');
    if (fields.at(-1) === '') {
        fields.pop();
    }
    const files = [];
    for (let index = 0; index < fields.length;) {
        const status = fields[index++];
        if (status.startsWith('R') || status.startsWith('C')) {
            const from = fields[index++];
            const to = fields[index++];
            files.push({ file: formatRename(from, to), status, from });
        } else {
            files.push({ file: fields[index++], status });
        }
    }
    return files;
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
    constructor(options = {}) {
        this.cwd = path.resolve(options.cwd || process.cwd());
        this.gitBinary = options.gitBinary || 'git';
        this.run = options.run || execFileAsync;
    }

    /**
     * Executes Git directly and returns decoded stdout.
     *
     * @param {string[]} args exact Git arguments; shell syntax is never accepted or evaluated
     * @returns {Promise.<string>} UTF-8 stdout with its trailing newline preserved
     * @throws {GitCommandError} when Git is unavailable or the command fails
     */
    async execute(args) {
        try {
            const result = await this.run(this.gitBinary, args, {
                cwd: this.cwd,
                encoding: 'utf8',
                maxBuffer: 20 * 1024 * 1024,
                shell: false,
                windowsHide: true,
            });
            return result.stdout;
        } catch (ex) {
            const stderr = typeof ex.stderr === 'string' ? ex.stderr.trim() : '';
            const reason = stderr || ex.message;
            throw new GitCommandError(
                `Git command failed in "${this.cwd}": git ${args.join(' ')}${reason ? `\n${reason}` : ''}`,
                {
                    args: [...args],
                    cwd: this.cwd,
                    cause: /** @type {Error & {code?: string | number}} */ (ex),
                    stderr,
                }
            );
        }
    }

    /**
     * Reads commit history using caller-provided Git log options.
     *
     * @param {string[]} [args] supported `git log` selection arguments
     * @returns {Promise.<{all: {hash: string, date: string, message: string, author_name: string}[]}>} commits in Git order
     */
    async log(args = []) {
        const separator = '%x00';
        const output = await this.execute([
            'log',
            `--format=%H${separator}%aI${separator}%s${separator}%an${separator}`,
            ...args,
        ]);
        const fields = output.split('\0');
        const all = [];
        for (let index = 0; index + 3 < fields.length; index += 4) {
            all.push({
                hash: fields[index].replace(/^\r?\n/, ''),
                date: fields[index + 1],
                message: fields[index + 2],
                author_name: fields[index + 3].replace(/\r?\n$/, ''),
            });
        }
        return { all };
    }

    /**
     * Returns name/status changes for a revision range using NUL delimiters for filename safety.
     *
     * @param {string[]} args revision/path arguments passed after the fixed diff options
     * @returns {Promise.<({file: string, status: string, from?: string, changes: number, insertions: number, deletions: number, binary: false})[]>} changes in Git order
     */
    async diffNameStatus(args) {
        return parseNameStatus(
            await this.execute(['diff', '--name-status', '-z', '-M', ...args])
        ).map((file) => ({
            ...file,
            changes: 0,
            insertions: 0,
            deletions: 0,
            binary: false,
        }));
    }

    /**
     * Returns the file-list subset of the former `simple-git` diff summary shape.
     *
     * @param {string[]} args revision/path arguments
     * @returns {Promise.<{files: ({file: string, status: string, from?: string, changes: number, insertions: number, deletions: number, binary: false})[]}>} summary consumed by mcdev
     */
    async diffSummary(args) {
        return { files: await this.diffNameStatus(args) };
    }

    /**
     * Resolves a revision, object, or `<revision>:<path>` specification.
     *
     * @param {string[]} args revision arguments
     * @returns {Promise.<string>} resolved value without trailing whitespace
     */
    async revparse(args) {
        return (await this.execute(['rev-parse', ...args])).trim();
    }

    /**
     * Lists remotes and their fetch/push URLs, preserving first-seen remote order.
     *
     * @param {boolean} [verbose] retained for call-site parity; URLs are always returned
     * @returns {Promise.<{name: string, refs: {fetch?: string, push?: string}}[]>} remotes
     */
    async getRemotes(verbose = false) {
        void verbose;
        const output = await this.execute(['remote', '-v']);
        const remotes = new Map();
        for (const line of output.trim().split(/\r?\n/).filter(Boolean)) {
            const match = /^(\S+)\s+(.+)\s+\((fetch|push)\)$/.exec(line);
            if (!match) {
                continue;
            }
            const remote = remotes.get(match[1]) || { name: match[1], refs: {} };
            remote.refs[match[3]] = match[2];
            remotes.set(match[1], remote);
        }
        return [...remotes.values()];
    }

    /**
     * Fetches configured remotes without a shell or interactive stdin.
     *
     * @param {string[]} [args] optional fetch arguments
     * @returns {Promise.<string>} Git fetch stdout
     */
    fetch(args = []) {
        return this.execute(['fetch', ...args]);
    }

    /**
     * Lists remote-tracking branches in Git order.
     *
     * @param {string[]} [args] branch options; only `-r` is used by mcdev
     * @returns {Promise.<{all: string[]}>} branch names
     */
    async branch(args = []) {
        const output = await this.execute(['branch', ...args, '--format=%(refname:short)']);
        return { all: output.split(/\r?\n/).filter(Boolean) };
    }

    /**
     * Reads the effective Git configuration value visible from the working directory.
     *
     * @param {string} key Git config key
     * @returns {Promise.<{value: string | null}>} value, or null when the key is unset
     */
    async getConfig(key) {
        try {
            return { value: (await this.execute(['config', '--get', key])).trim() || null };
        } catch (ex) {
            if (ex.code === 1 && !ex.stderr) {
                return { value: null };
            }
            throw ex;
        }
    }
}

/**
 * Creates a Git adapter rooted at the supplied directory.
 *
 * @param {{cwd?: string, gitBinary?: string, run?: typeof execFileAsync}} [options] client options
 * @returns {GitAdapter} shell-free Git client
 */
export function createGit(options) {
    return new GitAdapter(options);
}
