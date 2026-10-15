import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const moduleUrl = pathToFileURL(path.resolve('lib/util/sessionStore.js')).href;

/**
 * Import a fresh lazy store instance.
 *
 * @returns {Promise.<{get: (key: string) => unknown, set: (key: string, value: unknown) => void, clear: () => void}>} session store
 */
async function freshStore() {
    return (await import(`${moduleUrl}?test=${crypto.randomUUID()}`)).default;
}

describe('sessionStore', function () {
    this.timeout(20_000);
    let runRoot;
    let registered;
    let originalEnvironment;

    /**
     * Register a path created inside this test run.
     *
     * @param {string} target created path
     * @returns {string} unchanged target
     */
    function register(target) {
        const resolvedRoot = path.resolve(runRoot);
        const resolvedTarget = path.resolve(target);
        const relative = path.relative(resolvedRoot, resolvedTarget);
        assert.ok(relative && !relative.startsWith('..') && !path.isAbsolute(relative));
        registered.add(resolvedTarget);
        return target;
    }

    beforeEach(() => {
        runRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'mcdev-session-store-'));
        registered = new Set();
        originalEnvironment = {
            APPDATA: process.env.APPDATA,
            USERPROFILE: process.env.USERPROFILE,
            XDG_CONFIG_HOME: process.env.XDG_CONFIG_HOME,
            HOME: process.env.HOME,
        };
    });

    afterEach(() => {
        for (const key of Object.keys(originalEnvironment)) {
            const value = originalEnvironment[key];
            if (value === undefined) {
                delete process.env[key];
            } else {
                process.env[key] = value;
            }
        }
        for (const target of [...registered].toSorted(
            (left, right) => right.length - left.length
        )) {
            const relative = path.relative(path.resolve(runRoot), target);
            if (relative && !relative.startsWith('..') && !path.isAbsolute(relative)) {
                fs.rmSync(target, { recursive: true, force: true });
            }
        }
        fs.rmdirSync(runRoot);
    });

    it('derives the conf 15 path contract on each supported platform', () => {
        const source = fs.readFileSync(path.resolve('lib/util/sessionStore.js'), 'utf8');

        assert.ok(source.includes('process.env.APPDATA'));
        assert.ok(source.includes('process.env.USERPROFILE'));
        assert.ok(source.includes("'AppData', 'Roaming'"));
        assert.ok(source.includes("'mcdev-nodejs', 'Config', 'sessions.json'"));
        assert.ok(source.includes('process.env.XDG_CONFIG_HOME'));
        assert.ok(source.includes("os.homedir(), '.config'"));
        assert.ok(source.includes("'mcdev-nodejs', 'sessions.json'"));
        for (const segment of ['Library', 'Preferences', 'mcdev-nodejs', 'sessions.json']) {
            assert.ok(source.includes(`'${segment}'`));
        }
    });

    it('is genuinely lazy and exports exactly get, set, and clear', async () => {
        const configRoot = register(path.join(runRoot, 'lazy-config'));
        process.env.XDG_CONFIG_HOME = configRoot;
        process.env.APPDATA = configRoot;
        const store = await freshStore();

        assert.deepEqual(Object.keys(store).toSorted(), ['clear', 'get', 'set']);
        assert.equal(fs.existsSync(configRoot), false);
    });

    it('round trips values, preserves unknown top-level keys, and clears', async function () {
        const configRoot = register(path.join(runRoot, 'round-trip'));
        process.env.XDG_CONFIG_HOME = configRoot;
        process.env.APPDATA = configRoot;
        const filePath =
            process.platform === 'win32'
                ? path.join(configRoot, 'mcdev-nodejs', 'Config', 'sessions.json')
                : process.platform === 'darwin'
                  ? path.join(
                        os.homedir(),
                        'Library',
                        'Preferences',
                        'mcdev-nodejs',
                        'sessions.json'
                    )
                  : path.join(configRoot, 'mcdev-nodejs', 'sessions.json');
        if (process.platform === 'darwin') {
            this.skip();
        }
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, JSON.stringify({ unknown: { keep: true } }));
        const store = await freshStore();

        store.set('client|mid', { token: 'value' });
        assert.deepEqual(store.get('client|mid'), { token: 'value' });
        assert.deepEqual(JSON.parse(fs.readFileSync(filePath, 'utf8')), {
            unknown: { keep: true },
            'client|mid': { token: 'value' },
        });
        store.clear();
        assert.deepEqual(JSON.parse(fs.readFileSync(filePath, 'utf8')), {});
    });

    it('recovers corrupt and non-object JSON as empty and repairs it on mutation', async function () {
        const configRoot = register(path.join(runRoot, 'recovery'));
        process.env.XDG_CONFIG_HOME = configRoot;
        process.env.APPDATA = configRoot;
        if (process.platform === 'darwin') {
            this.skip();
        }
        const filePath = path.join(
            configRoot,
            'mcdev-nodejs',
            ...(process.platform === 'win32' ? ['Config'] : []),
            'sessions.json'
        );
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        const store = await freshStore();

        fs.writeFileSync(filePath, '{broken');
        assert.equal(store.get('missing'), undefined);
        store.set('repaired', true);
        assert.deepEqual(JSON.parse(fs.readFileSync(filePath, 'utf8')), { repaired: true });

        fs.writeFileSync(filePath, '[]');
        store.set('object', true);
        assert.deepEqual(JSON.parse(fs.readFileSync(filePath, 'utf8')), { object: true });
    });

    it('preserves old bytes and removes the exclusive temp file when rename fails', async function () {
        const configRoot = register(path.join(runRoot, 'rename-failure'));
        process.env.XDG_CONFIG_HOME = configRoot;
        process.env.APPDATA = configRoot;
        if (process.platform === 'darwin') {
            this.skip();
        }
        const directory = path.join(
            configRoot,
            'mcdev-nodejs',
            ...(process.platform === 'win32' ? ['Config'] : [])
        );
        const filePath = path.join(directory, 'sessions.json');
        fs.mkdirSync(directory, { recursive: true });
        const oldBytes = '{"old":true}\n';
        fs.writeFileSync(filePath, oldBytes);
        const store = await freshStore();
        const originalRename = fs.renameSync;
        fs.renameSync = () => {
            throw new Error('rename failed');
        };
        try {
            assert.throws(() => store.set('new', true), /rename failed/);
        } finally {
            fs.renameSync = originalRename;
        }

        assert.equal(fs.readFileSync(filePath, 'utf8'), oldBytes);
        assert.deepEqual(fs.readdirSync(directory), ['sessions.json']);
    });

    it('uses private POSIX directory and file modes', async function () {
        if (process.platform === 'win32' || process.platform === 'darwin') {
            this.skip();
        }
        const configRoot = register(path.join(runRoot, 'modes'));
        process.env.XDG_CONFIG_HOME = configRoot;
        const store = await freshStore();

        store.set('key', 'value');
        const directory = path.join(configRoot, 'mcdev-nodejs');
        const filePath = path.join(directory, 'sessions.json');
        assert.equal(fs.statSync(directory).mode & 0o777, 0o700);
        assert.equal(fs.statSync(filePath).mode & 0o777, 0o600);
    });

    it('rejects link and unexpected non-file destinations', async function () {
        if (process.platform === 'darwin') {
            this.skip();
        }
        const configRoot = register(path.join(runRoot, 'rejection'));
        const outside = register(path.join(runRoot, 'outside'));
        process.env.XDG_CONFIG_HOME = configRoot;
        process.env.APPDATA = configRoot;
        fs.mkdirSync(outside);
        const directory = path.join(
            configRoot,
            'mcdev-nodejs',
            ...(process.platform === 'win32' ? ['Config'] : [])
        );
        fs.mkdirSync(directory, { recursive: true });
        const filePath = path.join(directory, 'sessions.json');
        const store = await freshStore();

        fs.mkdirSync(filePath);
        assert.throws(() => store.set('key', 'value'), /Unexpected session store file path/);
        fs.rmdirSync(filePath);

        try {
            fs.symlinkSync(
                path.join(outside, 'sessions.json'),
                filePath,
                process.platform === 'win32' ? 'file' : undefined
            );
        } catch (ex) {
            if (
                ['EPERM', 'EACCES'].includes(/** @type {NodeJS.ErrnoException} */ (ex).code || '')
            ) {
                this.skip();
            }
            throw ex;
        }
        assert.throws(() => store.set('key', 'value'), /link or reparse point/);
    });
});
