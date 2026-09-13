import { assert } from 'chai';
import { simpleGit } from 'simple-git';
import DevOps, { filterAssetRegroupingChanges } from '../lib/util/devops.js';
import File from '../lib/util/file.js';
import Cli from '../lib/util/cli.js';
import { Util } from '../lib/util/util.js';
import MetadataType from '../lib/MetadataTypeInfo.js';
import mcdev from '../lib/index.js';

const oldRoot = 'retrieve/cred/bu/asset/message/';
const newRoot = 'retrieve/cred/bu/asset/email/';

/**
 * Creates a normalized delta fixture.
 *
 * @param {string} file current path
 * @param {string} [fromPath] rename source
 * @returns {import('../types/mcdev.d.js').DeltaPkgItem} delta fixture
 */
function change(file, fromPath = '-') {
    return /** @type {import('../types/mcdev.d.js').DeltaPkgItem} */ (
        /** @type {unknown} */ ({ file, fromPath, moved: fromPath !== '-', type: 'asset' })
    );
}

/**
 * Creates Git summary paths for unchanged owner/HTML moves plus removed text.
 *
 * @returns {object[]} Git summary fixtures
 */
function removedTextSummary() {
    return [
        {
            file: 'retrieve/cred/bu/asset/{message/mail/mail.asset-message-meta.json => email/mail/mail.asset-email-meta.json}',
        },
        {
            file: 'retrieve/cred/bu/asset/{message/mail/views.html.content.asset-message-meta.html => email/mail/views.html.content.asset-email-meta.html}',
        },
        { file: oldRoot + 'mail/views.text.content.asset-message-meta.txt' },
    ];
}

describe('v10 asset delta selection', () => {
    const restorers = [];
    let summary;
    let copies;
    let builds;
    let properties;

    /**
     * Replaces one dependency and restores it after the test.
     *
     * @param {object} target mutable dependency
     * @param {string} key method name
     * @param {unknown} replacement test replacement
     * @returns {void} -
     */
    function replace(target, key, replacement) {
        const original = target[key];
        target[key] = replacement;
        restorers.push(() => {
            target[key] = original;
        });
    }

    beforeEach(() => {
        summary = [];
        copies = [];
        builds = [];
        properties = {
            directories: { retrieve: 'retrieve/', deploy: 'deploy/' },
            options: { deployment: { sourceTargetMapping: { source: 'target' } } },
            marketList: { source: { 'cred/bu': 'market' }, target: { 'cred/target': 'market' } },
            metaDataTypes: { createDeltaPkg: ['asset'] },
        };
        const gitPrototype = Object.getPrototypeOf(simpleGit());
        replace(gitPrototype, 'diffSummary', async () => ({ files: structuredClone(summary) }));
        replace(gitPrototype, 'revparse', async () => 'same-blob');
        replace(File, 'pathExists', async (file) => file.startsWith(newRoot));
        replace(File, 'writeJSONToFile', async () => {});
        replace(File, 'remove', async () => {});
        replace(File, 'copyFileSimple', async (from, to) => {
            copies.push({ from, to: to.replaceAll('\\', '/') });
            return { status: from.startsWith(newRoot) ? 'ok' : 'skipped', file: from };
        });
        replace(DevOps, 'document', () => {});
        replace(MetadataType.asset, 'readBUMetadataForType', async (buPath, _, metadata) => {
            metadata.asset = { mail: { name: 'Mail' } };
        });
        replace(MetadataType.asset, 'getFilesToCommit', async (keys) => {
            assert.include(keys, 'mail');
            return [newRoot + 'mail/mail.asset-email-meta.json'];
        });
        replace(Cli, 'getCredentialObject', async () => ({
            credential: 'cred',
            businessUnit: 'bu',
        }));
        replace(Util, 'skipInteraction', true);
        replace(Util, 'verifyMarketList', () => {});
        replace(mcdev, 'build', async (...args) => {
            builds.push(args);
        });
        // The copy flow assigns these properties as well as calling the methods above.
        replace(MetadataType.asset, 'properties', MetadataType.asset.properties);
        replace(MetadataType.asset, 'buObject', MetadataType.asset.buObject);
    });

    afterEach(() => {
        for (const restore of restorers.toReversed()) {
            restore();
        }
        restorers.length = 0;
    });

    it('copies the current owner when only extracted text was removed during regrouping', async () => {
        summary = removedTextSummary();
        const delta = await DevOps.getDeltaList(properties, 'base..target', true, 'cred/bu');
        assert.includeDeepMembers(copies, [
            {
                from: newRoot + 'mail/mail.asset-email-meta.json',
                to: 'deploy/cred/bu/asset/email/mail/mail.asset-email-meta.json',
            },
        ]);
        assert.isTrue(
            delta.some((file) => file.file.endsWith('.txt') && file.gitAction === 'delete')
        );
        assert.isTrue(
            delta.some(
                (file) =>
                    file.file === newRoot + 'mail/mail.asset-email-meta.json' &&
                    file.gitAction === 'move'
            )
        );
    });

    it('selects the current owner for templates when only extracted text was removed', async () => {
        summary = removedTextSummary();
        const delta = await DevOps.getDeltaList(properties, 'base..target', false, 'cred/bu');
        const selected = await DevOps.buildDeltaDefinitions(properties, 'base..target', delta);
        assert.lengthOf(selected, 1);
        assert.equal(selected[0].file, newRoot + 'mail/mail.asset-email-meta.json');
        assert.lengthOf(builds, 1);
        assert.equal(builds[0][0], 'cred/bu');
        assert.deepEqual(builds[0][2], { asset: ['mail'] });
    });

    it('suppresses delete/add regrouping before filtering to asset/email', async () => {
        summary = [
            { file: oldRoot + 'mail.asset-message-meta.json' },
            { file: newRoot + 'mail.asset-email-meta.json' },
        ];
        assert.deepEqual(
            await DevOps.getDeltaList(properties, 'base..target', true, 'cred/bu/asset/email'),
            []
        );
        assert.deepEqual(copies, []);
    });

    it('retains a flat owner for removed companions without selecting another BU or key', async () => {
        const owner = change(
            newRoot + 'mail.asset-email-meta.json',
            oldRoot + 'mail.asset-message-meta.json'
        );
        const other = change(
            owner.file.replace('/bu/', '/other/'),
            owner.fromPath.replace('/bu/', '/other/')
        );
        const neighbor = change(
            newRoot + 'mail2.asset-email-meta.json',
            oldRoot + 'mail2.asset-message-meta.json'
        );
        const deletion = change(oldRoot + 'mail.asset-message-meta.txt');
        const gitClient = /** @type {import('simple-git').SimpleGit} */ (
            /** @type {unknown} */ ({ revparse: async () => 'same-blob' })
        );
        assert.deepEqual(
            await filterAssetRegroupingChanges(
                [owner, other, neighbor, deletion],
                'base..target',
                gitClient
            ),
            [owner, deletion]
        );
    });

    it('distinguishes own and unrelated companions for a flat key matching its group', async () => {
        const owner = change(
            newRoot + 'message.asset-email-meta.json',
            oldRoot + 'message.asset-message-meta.json'
        );
        const ownDeletion = change(oldRoot + 'message.asset-message-meta.txt');
        const unrelatedDeletion = change(oldRoot + 'other.asset-message-meta.txt');
        const gitClient = /** @type {import('simple-git').SimpleGit} */ (
            /** @type {unknown} */ ({ revparse: async () => 'same-blob' })
        );
        assert.deepEqual(
            await filterAssetRegroupingChanges([owner, ownDeletion], 'base..target', gitClient),
            [owner, ownDeletion]
        );
        assert.deepEqual(
            await filterAssetRegroupingChanges(
                [owner, unrelatedDeletion],
                'base..target',
                gitClient
            ),
            [unrelatedDeletion]
        );
    });

    it('keeps the current delete/add owner when the group filter excludes removed text', async () => {
        summary = [
            { file: oldRoot + 'mail/mail.asset-message-meta.json' },
            { file: newRoot + 'mail/mail.asset-email-meta.json' },
            { file: oldRoot + 'mail/views.text.content.asset-message-meta.txt' },
        ];
        const delta = await DevOps.getDeltaList(
            properties,
            'base..target',
            false,
            'cred/bu/asset/email'
        );
        assert.lengthOf(delta, 1);
        assert.equal(delta[0].file, newRoot + 'mail/mail.asset-email-meta.json');
        assert.equal(delta[0].gitAction, 'add/update');
    });

    it('preserves genuine unpaired owner deletions', async () => {
        const deletion = change(oldRoot + 'gone.asset-message-meta.json');
        assert.deepEqual(await filterAssetRegroupingChanges([deletion], 'base..target'), [
            deletion,
        ]);
    });
});
