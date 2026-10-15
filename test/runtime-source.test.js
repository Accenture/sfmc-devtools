import assert from 'node:assert/strict';
import childProcess from 'node:child_process';
import path from 'node:path';
import { mock } from 'node:test';
import { Util } from '../lib/util/util.js';
import config from '../lib/util/config.js';
import File from '../lib/util/file.js';

describe('active mcdev runtime', () => {
    let source;
    let skip;
    let exitCode;
    let errors;
    const newerProperties = /** @type {import('../types/mcdev.d.js').Mcdevrc} */ ({
        version: '999.0.0',
    });

    beforeEach(() => {
        source = process.env.MCDEV_RUNTIME_SOURCE;
        skip = Util.skipInteraction;
        exitCode = process.exitCode;
        mock.method(Util.logger, 'info', () => Util.logger);
        errors = mock.method(Util.logger, 'error', () => Util.logger);
    });

    afterEach(() => {
        mock.restoreAll();
        if (source === undefined) {
            delete process.env.MCDEV_RUNTIME_SOURCE;
        } else {
            process.env.MCDEV_RUNTIME_SOURCE = source;
        }
        Util.skipInteraction = skip;
        process.exitCode = exitCode;
    });

    it('runs this package CLI shell-free with current Node, inherited stdio and literal arguments', () => {
        const execute = mock.method(childProcess, 'execFileSync', () => '');
        Util.execMcdev(['retrieve', 'credential/BU with spaces', '*']);
        assert.deepEqual(execute.mock.calls[0].arguments, [
            process.execPath,
            [
                path.resolve(import.meta.dirname, '../lib/cli.js'),
                'retrieve',
                'credential/BU with spaces',
                '*',
            ],
            { stdio: 'inherit' },
        ]);
    });

    it('retains the existing recursive command error handling', () => {
        mock.method(childProcess, 'execFileSync', () => {
            throw new Error('child failed');
        });
        assert.doesNotThrow(() => Util.execMcdev(['upgrade']));
    });

    for (const interactive of [true, false]) {
        it(`does not offer global installation for bundled runtime (${interactive ? 'interactive' : 'noninteractive'})`, async () => {
            process.env.MCDEV_RUNTIME_SOURCE = 'bundled';
            Util.skipInteraction = !interactive && { downloadBUs: 'false' };
            mock.method(File, 'pathExists', async () => true);
            mock.method(Util, 'execSync', () => assert.fail('unexpected npm installation'));
            assert.equal(await config.checkProperties(newerProperties), false);
            const messages = errors.mock.calls.map((call) => call.arguments[0]);
            assert.match(
                messages.join('\n'),
                /Update the extension.*global npm install does not update/
            );
        });
    }

    it('retains standalone noninteractive global installation guidance', async () => {
        delete process.env.MCDEV_RUNTIME_SOURCE;
        Util.skipInteraction = { downloadBUs: 'false' };
        mock.method(File, 'pathExists', async () => true);
        assert.equal(await config.checkProperties(newerProperties), false);
        assert.match(errors.mock.calls[1].arguments[0], /npm install -g mcdev@999.0.0/);
    });
});
