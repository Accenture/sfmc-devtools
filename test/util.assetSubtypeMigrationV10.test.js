import assert from 'node:assert/strict';
import { normalizeAssetSubtypeMigrationV10 as normalize } from '../lib/util/assetSubtypeMigrationV10.js';
import { transformAssetSubtypePath } from '../lib/util/migrations/v10/assetSubtypes.js';

const root = 'nested/retrieve/cred/BU/asset';
const comparison = { base: 'base', target: 'target' };

/**
 * Build a scoped accessor-contract fixture with JSON-derived owner identity.
 *
 * @param {string} subtype observed grouping
 * @param {string} name API name
 * @param {string} key logical key
 * @param {string} assetRoot scoped directory
 * @returns {object} endpoint inventory
 */
function inventory(subtype = 'message', name = 'htmlemail', key = 'key', assetRoot = root) {
    const relativePath = `${subtype}/${key}/${key}.asset-${subtype}-meta.json`;
    const owner = {
        path: `${assetRoot}/${relativePath}`,
        relativePath,
        mode: '100644',
        type: 'blob',
        oid: `owner-${key}`,
        customerKey: key,
        assetTypeName: name,
        observedSubtype: subtype,
        metadataSuffixSubtype: subtype,
    };
    const childRelative = `${subtype}/${key}/nested/body.asset-${subtype}-meta.html`;
    const child = {
        path: `${assetRoot}/${childRelative}`,
        relativePath: childRelative,
        mode: '100644',
        type: 'blob',
        oid: 'same-child',
    };
    return {
        entries: [owner, child],
        owners: [owner],
        diagnostics: [],
        associations: {
            [owner.path]: {
                status: 'resolved',
                candidates: [owner],
                owner,
                relativeComponent: null,
            },
            [child.path]: {
                status: 'resolved',
                candidates: [owner],
                owner,
                relativeComponent: `nested/body.asset-${subtype}-meta.html`,
            },
        },
    };
}

/**
 * Represent the same migration with or without rename detection.
 *
 * @param {object} base source tree
 * @param {object} target destination tree
 * @param {boolean} renames Git rename representation
 * @returns {object[]} structured changes
 */
function changesFor(base, target, renames) {
    return base.entries.flatMap((entry, index) => {
        const next = target.entries[index];
        const common = {
            oldOid: entry.oid,
            newOid: next.oid,
            oldMode: entry.mode,
            newMode: next.mode,
            stats: { binary: false, insertions: 1, deletions: 1, changes: 2 },
        };
        return renames
            ? [{ ...common, status: 'R', similarity: 100, oldPath: entry.path, newPath: next.path }]
            : [
                  {
                      ...common,
                      status: 'D',
                      oldPath: entry.path,
                      newPath: null,
                      newOid: '0',
                      newMode: '000000',
                  },
                  {
                      ...common,
                      status: 'A',
                      oldPath: null,
                      newPath: next.path,
                      oldOid: '0',
                      oldMode: '000000',
                  },
              ];
    });
}

/**
 * Run the adapter with no disk/Git side effects and record scope reads.
 *
 * @param {object} base source inventory
 * @param {object} target destination inventory
 * @param {object[]} changes input records
 * @param {string[]} assetRoots allowed roots
 * @returns {Promise.<object>} normalized result
 */
async function run(base, target, changes, assetRoots = [root]) {
    const calls = [];
    const result = await normalize({
        comparison,
        changes,
        assetRoots,
        access: {
            /**
             * Return the requested fixture snapshot.
             *
             * @param {string} commit endpoint name
             * @param {string} scopedRoot requested asset directory
             * @returns {Promise.<object>} inventory fixture
             */
            async inventory(commit, scopedRoot) {
                calls.push([commit, scopedRoot]);
                assert.equal(scopedRoot, root);
                return commit === comparison.base ? base : target;
            },
        },
    });
    assert.ok(calls.length <= 2);
    return result;
}

const mappingCases = [
    ...['htmlemail', 'templatebasedemail', 'textonlyemail', 'message'].map((name) => [
        name,
        'message',
        'email',
    ]),
    ['jsonmessage', 'message', 'mobile'],
    ['jsonmessage', 'asset', 'mobile'],
    ...['webpage', 'webtemplate'].map((name) => [name, 'asset', 'webstudio']),
    ...['cloudpages', 'landingpage', 'microsite', 'interactivecontent'].map((name) => [
        name,
        'cloudpage',
        'webstudio',
    ]),
    ...[
        'jscoderesource',
        'csscoderesource',
        'jsoncoderesource',
        'rsscoderesource',
        'textcoderesource',
        'xmlcoderesource',
    ].map((name) => [name, 'coderesource', 'webstudio']),
];

describe('v10 committed asset subtype adapter', () => {
    for (const [name, oldSubtype, newSubtype] of mappingCases) {
        it(`normalizes rename and D+A equivalently for ${name} from ${oldSubtype}`, async () => {
            const base = inventory(oldSubtype, name);
            const target = inventory(newSubtype, name);
            for (const renames of [true, false]) {
                const result = await run(base, target, changesFor(base, target, renames));
                assert.deepEqual(result.diagnostics, []);
                assert.deepEqual(result.changes, []);
                assert.equal(result.skipped.length, 2);
                assert.equal(
                    result.associations.survivingOwners[base.owners[0].path],
                    target.owners[0]
                );
            }
        });
    }

    it('retains edited and mode-changed components only at destination', async () => {
        for (const field of ['oid', 'mode']) {
            const base = inventory();
            const target = inventory('email');
            target.entries[1][field] = field === 'oid' ? 'edited' : '100755';
            const outputs = [];
            for (const renames of [true, false]) {
                const result = await run(base, target, changesFor(base, target, renames));
                assert.deepEqual(result.diagnostics, []);
                assert.equal(result.skipped.length, 1);
                assert.equal(result.changes[0].oldPath, target.entries[1].path);
                assert.equal(result.changes[0].status, 'M');
                outputs.push(result.changes);
            }
            assert.deepEqual(outputs[0], outputs[1]);
        }
    });

    it('keeps deleted and added nested child owner evidence after suppressing metadata', async () => {
        const base = inventory();
        const target = inventory('email');
        const changes = changesFor(base, target, false);
        const removed = target.entries.pop();
        delete target.associations[removed.path];
        const added = {
            ...removed,
            path: removed.path.replace('body.', 'new.'),
            relativePath: removed.relativePath.replace('body.', 'new.'),
        };
        target.entries.push(added);
        target.associations[added.path] = {
            status: 'resolved',
            owner: target.owners[0],
            candidates: target.owners,
            relativeComponent: 'nested/new.asset-email-meta.html',
        };
        changes.at(-1).newPath = added.path;
        const result = await run(base, target, changes);
        assert.equal(result.skipped.length, 1);
        assert.deepEqual(
            result.changes.map((change) => change.status),
            ['D', 'A']
        );
        assert.equal(result.associations.base[base.entries[1].path].owner, base.owners[0]);
        assert.equal(result.associations.target[added.path].owner, target.owners[0]);
        assert.equal(result.associations.survivingOwners[base.owners[0].path], target.owners[0]);
    });

    it('blocks duplicate owners without partially suppressing the input', async () => {
        const base = inventory();
        const target = inventory('email');
        target.owners.push({ ...target.owners[0], path: 'duplicate' });
        const changes = changesFor(base, target, false);
        const result = await run(base, target, changes);
        assert.ok(result.diagnostics.some((item) => item.code === 'ambiguous-migration-owner'));
        assert.equal(result.changes, changes);
        assert.deepEqual(result.skipped, []);
    });

    it('repairs Git cross-owner blob pairing by JSON identity before comparing bytes', async () => {
        const base = inventory();
        const target = inventory('email');
        const secondBase = inventory('message', 'htmlemail', 'other');
        const secondTarget = inventory('email', 'htmlemail', 'other');
        for (const [first, second] of [
            [base, secondBase],
            [target, secondTarget],
        ]) {
            first.entries.push(...second.entries);
            first.owners.push(...second.owners);
            Object.assign(first.associations, second.associations);
        }
        target.entries[1].oid = 'edited';
        const renames = changesFor(base, target, true);
        const original = renames[1].newPath;
        renames[1].newPath = renames[3].newPath;
        renames[3].newPath = original;
        const result = await run(base, target, renames);
        assert.deepEqual(result.diagnostics, []);
        assert.equal(result.skipped.length, 3);
        assert.equal(result.changes.length, 1);
        assert.equal(result.changes[0].newPath, target.entries[1].path);
    });

    it('does not pair across BU boundaries', async () => {
        const base = inventory();
        const target = inventory('email', 'htmlemail', 'key', 'nested/retrieve/cred/OTHER/asset');
        const changes = changesFor(base, target, true);
        const result = await run(
            base,
            { entries: [], owners: [], diagnostics: [], associations: {} },
            changes
        );
        assert.deepEqual(result.skipped, []);
        assert.deepEqual(result.changes, changes);
    });

    it('returns nonasset records unchanged without reading inventories', async () => {
        const change = {
            status: 'R',
            oldPath: 'other/old',
            newPath: 'other/new',
            stats: { binary: true, before: 2, after: 2 },
        };
        const result = await normalize({
            comparison,
            changes: [change],
            assetRoots: [root],
            access: {
                /**
                 *
                 */
                inventory() {
                    assert.fail('unexpected inventory');
                },
            },
        });
        assert.equal(result.changes[0], change);
    });

    it('blocks unresolved historical owners and leaves genuine deletions alone', async () => {
        const base = inventory();
        const target = { entries: [], owners: [], diagnostics: [], associations: {} };
        const changes = changesFor(base, inventory('email'), false).filter(
            (item) => item.status === 'D'
        );
        const deletion = await run(base, target, changes);
        assert.deepEqual(deletion.diagnostics, []);
        assert.deepEqual(deletion.changes, changes);
        base.associations[base.entries[1].path].status = 'unresolved';
        const blocked = await run(base, target, changes);
        assert.ok(blocked.diagnostics.length);
        assert.equal(blocked.changes, changes);
    });

    it('blocks a migrated child whose destination metadata is missing', async () => {
        const base = inventory();
        const target = inventory('email');
        const changes = changesFor(base, target, false).filter(
            (change) => change.newPath !== target.owners[0].path
        );
        delete target.associations[target.owners[0].path];
        target.entries.shift();
        target.owners = [];
        target.associations[target.entries[0].path] = { status: 'unresolved', candidates: [] };
        const result = await run(base, target, changes);
        assert.ok(result.diagnostics.some((item) => item.code === 'unresolved-migration-owner'));
        assert.equal(result.changes, changes);
    });

    it('suppresses identical binary moves using endpoint object IDs', async () => {
        const base = inventory();
        const target = inventory('email');
        const changes = changesFor(base, target, true);
        changes[1].stats = { binary: true, before: 256, after: 256 };
        const result = await run(base, target, changes);
        assert.deepEqual(result.changes, []);
        assert.equal(result.skipped.length, 2);
    });

    it('preserves an unconsumed side of a wrongly matched rename', async () => {
        const base = inventory();
        const target = inventory('email');
        const changes = changesFor(base, target, true);
        const destination = changes[1].newPath;
        changes[1].newPath = 'unrelated/new-file';
        changes.push({ ...changes[1], status: 'A', oldPath: null, newPath: destination });
        const result = await run(base, target, changes);
        assert.deepEqual(result.diagnostics, []);
        assert.equal(result.skipped.length, 2);
        assert.equal(result.changes.length, 1);
        assert.equal(result.changes[0].status, 'A');
        assert.equal(result.changes[0].newPath, 'unrelated/new-file');
        assert.equal(result.changes[0].oldPath, null);
    });

    it('does not infer identity from identical bytes with different JSON keys', async () => {
        const base = inventory();
        const target = inventory('email', 'htmlemail', 'different');
        target.entries[0].oid = base.entries[0].oid;
        const changes = changesFor(base, target, true);
        const result = await run(base, target, changes);
        assert.deepEqual(result.skipped, []);
        assert.deepEqual(result.changes, changes);
        assert.equal(
            transformAssetSubtypePath('jsonmessagetemplate', 'template/x.asset-template-meta.json'),
            'template/x.asset-template-meta.json'
        );
    });
});
