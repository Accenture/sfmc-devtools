import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';

let sessionsPath;

/**
 * Resolve the conf-compatible session file path only when storage is first used.
 *
 * @returns {string} session file path
 */
function getSessionsPath() {
    if (sessionsPath) {
        return sessionsPath;
    }

    let configRoot;
    if (process.platform === 'win32') {
        configRoot =
            process.env.APPDATA ||
            path.join(process.env.USERPROFILE || os.homedir(), 'AppData', 'Roaming');
        sessionsPath = path.join(configRoot, 'mcdev-nodejs', 'Config', 'sessions.json');
    } else if (process.platform === 'darwin') {
        sessionsPath = path.join(
            os.homedir(),
            'Library',
            'Preferences',
            'mcdev-nodejs',
            'sessions.json'
        );
    } else {
        configRoot = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
        sessionsPath = path.join(configRoot, 'mcdev-nodejs', 'sessions.json');
    }
    return sessionsPath;
}

/**
 * Reject filesystem objects that could redirect or replace the expected store location.
 *
 * @param {string} target path to inspect
 * @param {'directory'|'file'} expectedType expected filesystem object type
 * @returns {void}
 */
function validateExistingPath(target, expectedType) {
    let stats;
    try {
        stats = fs.lstatSync(target);
    } catch (ex) {
        if (/** @type {NodeJS.ErrnoException} */ (ex).code === 'ENOENT') {
            return;
        }
        throw ex;
    }

    if (stats.isSymbolicLink()) {
        throw new Error(`Refusing session store link or reparse point: ${target}`);
    }
    if (expectedType === 'directory' ? !stats.isDirectory() : !stats.isFile()) {
        throw new Error(`Unexpected session store ${expectedType} path: ${target}`);
    }
}

/**
 * Reject links and non-directories in every existing parent component.
 *
 * @param {string} directory directory path
 * @returns {void}
 */
function validateDirectoryChain(directory) {
    const resolved = path.resolve(directory);
    const root = path.parse(resolved).root;
    let current = root;
    for (const segment of path.relative(root, resolved).split(path.sep).filter(Boolean)) {
        current = path.join(current, segment);
        validateExistingPath(current, 'directory');
    }
}

/**
 * Create and validate the destination directory without traversing a link at the managed levels.
 *
 * @param {string} filePath session file path
 * @returns {void}
 */
function ensureStoreDirectory(filePath) {
    const projectDirectory = path.dirname(filePath);
    const configDirectory = path.dirname(projectDirectory);
    validateDirectoryChain(configDirectory);
    fs.mkdirSync(configDirectory, { recursive: true, mode: 0o700 });
    validateDirectoryChain(configDirectory);

    const relativeProject = path.relative(configDirectory, projectDirectory);
    if (!relativeProject || relativeProject.startsWith('..') || path.isAbsolute(relativeProject)) {
        throw new Error(`Refusing session store parent traversal: ${projectDirectory}`);
    }
    validateExistingPath(projectDirectory, 'directory');
    try {
        fs.mkdirSync(projectDirectory, { mode: 0o700 });
    } catch (ex) {
        if (/** @type {NodeJS.ErrnoException} */ (ex).code !== 'EEXIST') {
            throw ex;
        }
    }
    validateExistingPath(projectDirectory, 'directory');
    if (process.platform !== 'win32') {
        fs.chmodSync(projectDirectory, 0o700);
    }
}

/**
 * Read the complete top-level session object, recovering invalid content as empty state.
 *
 * @returns {Record<string, unknown>} stored sessions
 */
function readSessions() {
    const filePath = getSessionsPath();
    validateExistingPath(filePath, 'file');
    try {
        const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch (ex) {
        if (['ENOENT', 'EISDIR'].includes(/** @type {NodeJS.ErrnoException} */ (ex).code || '')) {
            return {};
        }
        if (ex instanceof SyntaxError) {
            return {};
        }
        throw ex;
    }
}

/**
 * Atomically replace the session file with a fully synchronized JSON object.
 *
 * @param {Record<string, unknown>} sessions complete session object
 * @returns {void}
 */
function writeSessions(sessions) {
    const filePath = getSessionsPath();
    ensureStoreDirectory(filePath);
    validateExistingPath(filePath, 'file');
    const directory = path.dirname(filePath);
    const temporaryPath = path.join(
        directory,
        `.sessions.json.${process.pid}.${crypto.randomBytes(12).toString('hex')}.tmp`
    );
    let descriptor;
    try {
        descriptor = fs.openSync(temporaryPath, 'wx', 0o600);
        fs.writeFileSync(descriptor, `${JSON.stringify(sessions, null, 2)}\n`, 'utf8');
        fs.fsyncSync(descriptor);
        fs.closeSync(descriptor);
        descriptor = undefined;
        if (process.platform !== 'win32') {
            fs.chmodSync(temporaryPath, 0o600);
        }
        fs.renameSync(temporaryPath, filePath);
        if (process.platform !== 'win32') {
            const directoryDescriptor = fs.openSync(directory, 'r');
            try {
                fs.fsyncSync(directoryDescriptor);
            } finally {
                fs.closeSync(directoryDescriptor);
            }
        }
    } catch (ex) {
        if (descriptor !== undefined) {
            fs.closeSync(descriptor);
        }
        try {
            fs.unlinkSync(temporaryPath);
        } catch (ex_) {
            if (/** @type {NodeJS.ErrnoException} */ (ex_).code !== 'ENOENT') {
                throw new AggregateError([ex_, ex], 'Session write and cleanup failed', {
                    cause: ex_,
                });
            }
        }
        throw ex;
    }
}

const sessionStore = {
    /**
     * Read one session value.
     *
     * @param {string} key session key
     * @returns {unknown} stored value
     */
    get(key) {
        return readSessions()[key];
    },

    /**
     * Persist one session value while preserving unrelated keys.
     *
     * @param {string} key session key
     * @param {unknown} value session value
     * @returns {void}
     */
    set(key, value) {
        const sessions = readSessions();
        sessions[key] = value;
        writeSessions(sessions);
    },

    /**
     * Remove all stored sessions.
     *
     * @returns {void}
     */
    clear() {
        writeSessions({});
    },
};

export default sessionStore;
