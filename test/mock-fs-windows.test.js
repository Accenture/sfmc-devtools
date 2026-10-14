import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Conf from 'conf';
import fsmock from 'mock-fs';

const packagePath = path.resolve('package.json');
const packageContents = fs.readFileSync(packagePath, 'utf8');
const configRoot = path.parse(process.env.APPDATA || os.homedir()).root;
const sessionDirectory = path.join(configRoot, 'mcdev-mock-fs-regression', 'Config');

// Disable default roots so the Windows regression also runs when cwd and home share a drive.
describe('mock-fs Windows session directories', () => {
    it('reproduces recursive mkdir overflow when the session drive is absent', () => {
        if (process.platform !== 'win32') {
            return;
        }
        fsmock({}, { createCwd: false, createTmp: false });
        try {
            assert.equal(fs.existsSync(configRoot), false);
            assert.equal(path.dirname(configRoot), configRoot);
            assert.throws(
                () => new Conf({ cwd: sessionDirectory, configName: 'sessions' }),
                RangeError
            );
        } finally {
            fsmock.restore();
        }
        assert.equal(fs.readFileSync(packagePath, 'utf8'), packageContents);
    });

    it('writes and clears sessions when the session drive root is seeded', () => {
        // Seed the root before relative fixtures, retaining both when they share a drive.
        fsmock(
            { [configRoot]: {}, 'mock-fs-regression-marker.txt': 'mock fixture' },
            { createCwd: false, createTmp: false }
        );
        try {
            const sessions = new Conf({ cwd: sessionDirectory, configName: 'sessions' });
            sessions.set('test-session', { access_token: 'mock-token' });
            assert.deepEqual(JSON.parse(fs.readFileSync(sessions.path, 'utf8')), {
                'test-session': { access_token: 'mock-token' },
            });
            sessions.clear();
            assert.deepEqual(JSON.parse(fs.readFileSync(sessions.path, 'utf8')), {});
            assert.equal(fs.readFileSync('mock-fs-regression-marker.txt', 'utf8'), 'mock fixture');
        } finally {
            fsmock.restore();
        }
        assert.equal(fs.readFileSync(packagePath, 'utf8'), packageContents);
        assert.equal(fs.existsSync('mock-fs-regression-marker.txt'), false);
    });
});
