import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mock } from 'node:test';
import '../lib/index.js';
import DataExtension from '../lib/metadataTypes/DataExtension.js';
import AttributeSet from '../lib/metadataTypes/AttributeSet.js';
import auth from '../lib/util/auth.js';
import { Util } from '../lib/util/util.js';

/**
 * Parse the real CLI with command handlers replaced before import to prevent live operations.
 *
 * @param {string[]} args command-line arguments
 * @returns {object} options forwarded to Mcdev
 */
function parseOptions(args) {
    const script = `
        import Mcdev from './lib/index.js';
        Mcdev.setOptions = (options) => process.stdout.write(JSON.stringify(options));
        Mcdev.deploy = Mcdev.build = Mcdev.clone = () => {};
        process.argv = [process.execPath, 'mcdev', ...${JSON.stringify(args)}];
        await import('./lib/cli.js');
    `;
    return JSON.parse(
        execFileSync(process.execPath, ['--input-type=module', '-e', script], {
            encoding: 'utf8',
            timeout: 20000,
        })
    );
}

describe('noninteractive CLI options', () => {
    /** @type {[string[], string | boolean][]} */
    const fixSharedCases = [
        [['--fixShared'], true],
        [['--fixShared', 'childA'], 'childA'],
        [['--fixShared=childA,childB'], 'childA,childB'],
        [['--fixShared=*'], '*'],
        [['--fixShared='], true],
        [['--no-fixShared'], false],
    ];
    for (const [args, expected] of fixSharedCases) {
        it(`preserves deploy ${args.join(' ')}`, () => {
            assert.equal(parseOptions(['deploy', 'cred/_ParentBU_', ...args]).fixShared, expected);
        });
    }

    /** @type {[string[], boolean | undefined][]} */
    const purgeCases = [
        [[], undefined],
        [['--purge'], true],
        [['--no-purge'], false],
        [['--purge=false'], false],
    ];
    for (const command of ['build', 'clone']) {
        for (const [args, expected] of purgeCases) {
            it(`parses ${command} ${args.join(' ')} as a boolean cleanup choice`, () => {
                const required = ['--buFrom', 'cred/source', '--metadata', 'query:key'];
                if (command === 'build') {
                    required.push('--marketFrom', 'source', '--marketTo', 'target');
                }
                assert.equal(parseOptions([command, ...required, ...args]).purge, expected);
            });
        }
    }
});

describe('noninteractive shared Data Extension BU selection', () => {
    let original;
    let selected;

    beforeEach(() => {
        original = {
            options: Util.OPTIONS,
            skipInteraction: Util.skipInteraction,
            properties: DataExtension.properties,
            buObject: DataExtension.buObject,
            client: DataExtension.client,
            deployedSharedKeys: DataExtension.deployedSharedKeys,
            attributeProperties: AttributeSet.properties,
            attributeBuObject: AttributeSet.buObject,
            attributeClient: AttributeSet.client,
        };
        Util.skipInteraction = {};
        DataExtension.properties = /** @type {import('../types/mcdev.d.js').Mcdevrc} */ ({
            credentials: {
                cred: {
                    eid: '1',
                    businessUnits: { [Util.parentBuName]: '1', childA: '2', childB: '3' },
                },
            },
        });
        DataExtension.buObject = {
            credential: 'cred',
            businessUnit: Util.parentBuName,
            eid: 1,
            mid: 1,
        };
        DataExtension.deployedSharedKeys = ['shared'];
        selected = [];
        mock.method(auth, 'getSDK', (bu) => {
            selected.push(bu.businessUnit);
            return {};
        });
        mock.method(AttributeSet, 'fixShared_retrieve', async () => []);
        mock.method(Util.logger, 'info', () => Util.logger);
    });

    afterEach(() => {
        mock.restoreAll();
        Util.OPTIONS = original.options;
        Util.skipInteraction = original.skipInteraction;
        DataExtension.properties = original.properties;
        DataExtension.buObject = original.buObject;
        DataExtension.client = original.client;
        DataExtension.deployedSharedKeys = original.deployedSharedKeys;
        AttributeSet.properties = original.attributeProperties;
        AttributeSet.buObject = original.attributeBuObject;
        AttributeSet.client = original.attributeClient;
    });

    for (const selection of [
        true,
        '',
        ' ',
        ',',
        'missing',
        'childA,missing',
        'childA,',
        '_ParentBU_',
    ]) {
        it(`rejects selection ${JSON.stringify(selection)} before child BU access`, async () => {
            Util.OPTIONS = { fixShared: selection };
            await assert.rejects(
                DataExtension.postDeployTasks({}, {}, { created: 0, updated: 1 }),
                /--fixShared requires .*child BU names.*--skipInteraction/
            );
            assert.deepEqual(selected, []);
        });
    }

    for (const [selection, expected] of [
        ['childA', ['childA']],
        [' childB, childA ', ['childB', 'childA']],
        ['*', ['childA', 'childB']],
    ]) {
        it(`uses exactly the requested child BUs for ${selection}`, async () => {
            Util.OPTIONS = { fixShared: selection };
            await DataExtension.postDeployTasks({}, {}, { created: 0, updated: 1 });
            assert.deepEqual(selected, expected);
        });
    }

    it('rejects wildcard selection when no child BU exists', async () => {
        DataExtension.properties.credentials.cred.businessUnits = { [Util.parentBuName]: '1' };
        Util.OPTIONS = { fixShared: '*' };
        await assert.rejects(
            DataExtension.postDeployTasks({}, {}, { created: 0, updated: 1 }),
            /--fixShared requires explicit child BU names/
        );
        assert.deepEqual(selected, []);
    });
});
