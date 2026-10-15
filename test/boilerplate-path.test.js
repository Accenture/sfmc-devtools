import assert from 'node:assert/strict';
import { mkdtemp, rmdir, unlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import config from '../lib/util/config.js';
import { Util } from '../lib/util/util.js';

describe('boilerplate path resolution', () => {
    let root;

    afterEach(async () => {
        Util.resetBoilerplateRoot();
        config.properties = null;
        if (root) {
            await unlink(path.join(root, 'config.json'));
            await rmdir(root);
            root = undefined;
        }
    });

    it('loads defaults from an explicitly configured boilerplate root', async () => {
        root = await mkdtemp(path.join(os.tmpdir(), 'mcdev boilerplate override-'));
        const fixture = {
            credentials: { default: { businessUnits: {} } },
            metaDataTypes: { retrieve: [], createDeltaPkg: [] },
        };
        await writeFile(path.join(root, 'config.json'), `${JSON.stringify(fixture)}\n`);

        assert.equal(Util.setBoilerplateRoot(root), path.resolve(root));
        assert.equal(Util.getBoilerplatePath('config.json'), path.join(root, 'config.json'));
        const defaults = await config.getDefaultProperties();
        assert.equal(defaults.credentials.default.businessUnits[Util.parentBuName], 0);
    });
});
