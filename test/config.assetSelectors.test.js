import assert from 'node:assert/strict';
import { mock } from 'node:test';
import Mcdev from '../lib/index.js';
import config from '../lib/util/config.js';
import File from '../lib/util/file.js';
import Cli from '../lib/util/cli.js';
import InitConfig from '../lib/util/init.config.js';
import InitGit from '../lib/util/init.git.js';
import InitNpm from '../lib/util/init.npm.js';
import Init from '../lib/util/init.js';
import Retriever from '../lib/Retriever.js';
import { Util } from '../lib/util/util.js';

const legacy = ['asset-message', 'asset-cloudpage', 'asset-coderesource'];
let properties;
let originalProperties;
let originalOptions;
let originalExitCode;
let cleanup;
let retrieve;
let credentials;
let errors;

describe('CONFIG ASSET SELECTORS', () => {
    beforeEach(async () => {
        originalProperties = config.properties;
        originalOptions = Util.OPTIONS;
        originalExitCode = process.exitCode;
        properties = await config.getDefaultProperties();
        properties.version = Util.packageJsonMcdev.version;
        properties.credentials = { cred: { eid: 1, businessUnits: { bu: 2 } } };
        config.properties = properties;
        Util.OPTIONS = { _welcomeMessageShown: true };
        errors = [];
        mock.method(Util, 'startLogger', () => {});
        mock.method(Util.logger, 'error', (message) => {
            errors.push(message);
        });
        mock.method(Util.logger, 'info', () => {});
        mock.method(Util.logger, 'warn', () => {});
        mock.method(console, 'time', () => {});
        mock.method(console, 'timeEnd', () => {});
        mock.method(Util, 'execSync', () => assert.fail('No shell/npm execution allowed'));
        cleanup = mock.method(File, 'remove', async () => {});
        retrieve = mock.method(Retriever.prototype, 'retrieve', async () => ({}));
        credentials = mock.method(Cli, 'getCredentialObject', async () => ({
            credential: 'cred',
            businessUnit: 'bu',
            mid: 2,
            eid: 1,
        }));
    });

    afterEach(() => {
        mock.restoreAll();
        config.properties = originalProperties;
        Util.OPTIONS = originalOptions;
        process.exitCode = originalExitCode;
    });

    it('rejects each legacy configured selector before BU selection, cleanup and retrieval', async () => {
        for (const selector of legacy) {
            properties.metaDataTypes.retrieve = [selector];
            assert.equal(await Mcdev.retrieve('cred/bu'), undefined);
            assert.equal(credentials.mock.callCount(), 0);
            assert.equal(cleanup.mock.callCount(), 0);
            assert.equal(retrieve.mock.callCount(), 0);
            assert.ok(errors.some((message) => message.includes('v10 asset subtype migration')));
            assert.ok(errors.some((message) => message.includes('metaDataTypes.retrieve')));
            assert.deepEqual(properties.metaDataTypes.retrieve, [selector]);
        }
    });

    it('validates a freshly read config before reaching auth or BU cleanup', async () => {
        config.properties = null;
        properties.metaDataTypes.retrieve = ['asset-message'];
        mock.method(File, 'pathExists', async () => true);
        mock.method(File, 'readJSON', async () => properties);
        mock.method(config, 'checkProperties', async () => true);
        assert.equal(await Mcdev.retrieve('cred/bu'), undefined);
        assert.equal(credentials.mock.callCount(), 0);
        assert.equal(cleanup.mock.callCount(), 0);
        assert.equal(retrieve.mock.callCount(), 0);
        assert.equal(
            await config.getProperties(),
            undefined,
            'cached invalid config stays rejected'
        );
    });

    it('keeps the normal project-version check ahead of operational validation', async () => {
        config.properties = null;
        mock.method(File, 'pathExists', async () => true);
        mock.method(File, 'readJSON', async () => properties);
        const versionGuard = mock.method(config, 'checkProperties', async () => false);
        assert.equal(await config.getProperties(), undefined);
        assert.equal(versionGuard.mock.callCount(), 1);
        assert.equal(cleanup.mock.callCount(), 0);
    });

    it('accepts explicit email and broad asset selectors and preserves custom configured scope', async () => {
        properties.metaDataTypes.retrieve = ['asset-email', 'asset-asset', 'query'];
        properties.metaDataTypes.createDeltaPkg = ['asset-asset'];
        const before = structuredClone(properties);
        for (const selector of ['asset-email', 'asset-asset']) {
            assert.deepEqual(await Mcdev.retrieve('cred/bu', [selector]), { 'cred/bu': {} });
            assert.deepEqual(retrieve.mock.calls.at(-1).arguments[0], [selector]);
        }
        assert.deepEqual(properties, before);
    });

    it('rejects explicit legacy selectors before cleanup with migration guidance', async () => {
        for (const selector of legacy) {
            assert.equal(await Mcdev.retrieve('cred/bu', [selector]), undefined);
        }
        assert.equal(credentials.mock.callCount(), 0);
        assert.equal(cleanup.mock.callCount(), 0);
        assert.equal(retrieve.mock.callCount(), 0);
        assert.ok(errors.some((message) => message.includes('v10 asset subtype migration')));
    });

    it('allows default retrieval with a valid custom selector list without rewriting it', async () => {
        properties.metaDataTypes.retrieve = ['asset-email', 'asset-asset', 'query'];
        const before = structuredClone(properties);
        assert.deepEqual(await Mcdev.retrieve('cred/bu'), { 'cred/bu': {} });
        assert.deepEqual(retrieve.mock.calls[0].arguments[0], ['asset', 'query']);
        assert.equal(cleanup.mock.callCount(), 1);
        assert.deepEqual(properties, before);
    });

    it('checks selector fields but not key patterns, API names or market values', () => {
        properties.options.include = { asset: { name: 'asset-message', assetType: 'message' } };
        properties.markets.custom = { label: 'asset-cloudpage' };
        properties.marketList.custom = {
            filter: {
                include: { key: { '*': ['asset-message'], 'asset-email': ['asset-coderesource'] } },
            },
        };
        assert.equal(config.checkOperationalSelectors(properties), true);
        for (const field of ['retrieve', 'createDeltaPkg', 'documentOnRetrieve']) {
            const original = properties.metaDataTypes[field];
            properties.metaDataTypes[field] = ['asset-message'];
            assert.equal(config.checkOperationalSelectors(properties), false);
            properties.metaDataTypes[field] = original;
        }
        for (const field of ['include', 'exclude']) {
            properties.marketList.custom.filter[field] = { key: { 'asset-cloudpage': ['key'] } };
            assert.equal(config.checkOperationalSelectors(properties), false);
            delete properties.marketList.custom.filter[field];
            properties.options[field] = { 'asset-coderesource': {} };
            assert.equal(config.checkOperationalSelectors(properties), false);
            properties.options[field] = {};
        }
    });

    it('lets upgrade load legacy selectors and save current defaults without selector approval', async () => {
        config.properties = null;
        properties.metaDataTypes.retrieve = [...legacy];
        properties.metaDataTypes.createDeltaPkg = [...legacy];
        const pathExists = File.pathExists;
        const readJSON = File.readJSON;
        mock.method(File, 'pathExists', async (name) => {
            if (name === Util.configFileName) {
                return true;
            }
            return name === Util.authFileName ? false : pathExists(name);
        });
        mock.method(File, 'readJSON', async (name) =>
            name === Util.configFileName ? properties : readJSON(name)
        );
        // Supply config existence without depending on a real project or auth file.
        mock.method(config, 'checkProperties', async () => []);
        mock.method(InitGit, 'initGitRepo', async () => ({ status: 'ok' }));
        mock.method(Init, '_checkPathForCloud', async () => true);
        mock.method(InitConfig, 'preflightIdeConfigFiles', async () => ({}));
        mock.method(InitNpm, 'preflightDependencies', async () => ({}));
        mock.method(InitConfig, 'upgradeAuthFile', async () => true);
        mock.method(InitConfig, 'createIdeConfigFiles', async () => true);
        mock.method(InitNpm, 'installDependencies', async () => true);
        const saved = [];
        mock.method(File, 'saveConfigFile', async (value) => {
            saved.push(structuredClone(value));
            return true;
        });
        assert.equal(await Mcdev.upgrade(), true);
        assert.ok(saved.length > 0);
        for (const field of ['retrieve', 'createDeltaPkg']) {
            assert.deepEqual(
                saved.at(-1).metaDataTypes[field],
                Util.summarizeSubtypes(
                    field === 'retrieve' ? 'typeRetrieveByDefault' : 'typeCdpByDefault',
                    Util.getTypeChoices(
                        field === 'retrieve' ? 'typeRetrieveByDefault' : 'typeCdpByDefault'
                    )
                )
            );
            assert.ok(
                saved.at(-1).metaDataTypes[field].every((selector) => !legacy.includes(selector))
            );
        }
        assert.equal(config.checkOperationalSelectors(saved.at(-1)), true);
        assert.equal(cleanup.mock.callCount(), 0);
        assert.equal(retrieve.mock.callCount(), 0);
    });
});
