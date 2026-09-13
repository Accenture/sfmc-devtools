import fs from 'fs-extra';
import os from 'node:os';
import path from 'node:path';
import { assert } from 'chai';
import {
    getCurrentAssetGroup,
    isAssetRegroupingPair,
    mapAssetPath,
    migrateAssetV10Tree,
} from '../lib/util/migrations/assetV10.js';
import AssetDefinition from '../lib/metadataTypes/definitions/Asset.definition.js';
import { filterAssetRegroupingChanges } from '../lib/util/devops.js';

describe('v10 asset migration', () => {
    let temporary;

    beforeEach(async () => {
        temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'mcdev-asset-v10-'));
    });

    afterEach(async () => {
        await fs.remove(temporary);
    });

    it('maps every historical grouping family without moving jsonmessagetemplate', () => {
        assert.equal(getCurrentAssetGroup('htmlemail', 'message'), 'email');
        assert.equal(getCurrentAssetGroup('jsonmessage', 'message'), 'mobile');
        assert.equal(getCurrentAssetGroup('jsonmessage', 'asset'), 'mobile');
        assert.equal(getCurrentAssetGroup('webpage', 'asset'), 'webstudio');
        assert.equal(getCurrentAssetGroup('cloudpages', 'cloudpage'), 'webstudio');
        assert.equal(getCurrentAssetGroup('jscoderesource', 'coderesource'), 'webstudio');
        assert.isNull(getCurrentAssetGroup('jsonmessagetemplate', 'message'));
        assert.equal(
            mapAssetPath(
                'retrieve/cred/bu/asset/message/key/key.asset-message-meta.html',
                'message',
                'email'
            ),
            'retrieve/cred/bu/asset/email/key/key.asset-email-meta.html'
        );
        assert.isTrue(
            isAssetRegroupingPair(
                'retrieve/cred/bu/asset/cloudpage/key.asset-cloudpage-meta.json',
                'retrieve/cred/bu/asset/webstudio/key.asset-webstudio-meta.json'
            )
        );
    });

    it('no longer ships the legacy message grouping in the asset definition', () => {
        const groups = [
            ...AssetDefinition.subTypes,
            ...Object.keys(AssetDefinition.extendedSubTypes),
        ];
        const metadataSuffixes = groups.map((group) => `asset-${group}-meta`);
        assert.notInclude(groups, 'message');
        assert.notInclude(AssetDefinition.typeRetrieveByDefault, 'message');
        assert.notInclude(metadataSuffixes, 'asset-message-meta');
        assert.include(AssetDefinition.subTypes, 'email');
        assert.include(metadataSuffixes, 'asset-email-meta');
    });

    it('moves owner and companions only inside the selected asset root', async () => {
        const selectedRoot = path.join(temporary, 'retrieve', 'cred', 'selected', 'asset');
        const otherRoot = path.join(temporary, 'retrieve', 'cred', 'other', 'asset');
        const deployRoot = path.join(temporary, 'deploy', 'cred', 'selected', 'asset');
        const owner = path.join(selectedRoot, 'message', 'mail', 'mail.asset-message-meta.json');
        const companion = path.join(
            selectedRoot,
            'message',
            'mail',
            'views.html.content.asset-message-meta.html'
        );
        for (const root of [selectedRoot, otherRoot, deployRoot]) {
            await fs.outputJson(path.join(root, 'message', 'mail.asset-message-meta.json'), {
                assetType: { name: 'htmlemail' },
            });
        }
        await fs.outputJson(owner, { assetType: { name: 'htmlemail' } });
        await fs.outputFile(companion, '<p>hello</p>');

        const report = await migrateAssetV10Tree(selectedRoot);

        assert.lengthOf(report.conflicts, 0);
        assert.isFalse(await fs.pathExists(owner));
        assert.isTrue(
            await fs.pathExists(
                path.join(selectedRoot, 'email', 'mail', 'mail.asset-email-meta.json')
            )
        );
        assert.isTrue(
            await fs.pathExists(
                path.join(selectedRoot, 'email', 'mail', 'views.html.content.asset-email-meta.html')
            )
        );
        assert.isTrue(
            await fs.pathExists(path.join(otherRoot, 'message', 'mail.asset-message-meta.json'))
        );
        assert.isTrue(
            await fs.pathExists(path.join(deployRoot, 'message', 'mail.asset-message-meta.json'))
        );
        assert.deepEqual(await migrateAssetV10Tree(selectedRoot), {
            moved: [],
            conflicts: [],
            skipped: [],
        });
    });

    it('prunes empty directories from a nested owner layout but keeps the asset root', async () => {
        const root = path.join(temporary, 'asset');
        await fs.outputJson(path.join(root, 'message', 'mail', 'mail.asset-message-meta.json'), {
            assetType: { name: 'htmlemail' },
        });
        await fs.outputFile(
            path.join(root, 'message', 'mail', 'views.html.content.asset-message-meta.html'),
            '<p>hello</p>'
        );
        // unmatched asset keeps its own folder and therefore the historical group root alive
        const unmatched = path.join(root, 'message', 'keep', 'keep.asset-message-meta.json');
        await fs.outputJson(unmatched, { assetType: { name: 'unknownassettype' } });

        const report = await migrateAssetV10Tree(root);

        assert.lengthOf(report.conflicts, 0);
        assert.isTrue(
            await fs.pathExists(path.join(root, 'email', 'mail', 'mail.asset-email-meta.json'))
        );
        assert.isFalse(await fs.pathExists(path.join(root, 'message', 'mail')));
        assert.isTrue(await fs.pathExists(root));
        assert.isTrue(await fs.pathExists(unmatched));
    });

    it('preflights the full move set and leaves an owner unchanged on conflict', async () => {
        const root = path.join(temporary, 'asset');
        const owner = path.join(root, 'asset', 'page.asset-asset-meta.json');
        const companion = path.join(root, 'asset', 'page.asset-asset-meta.html');
        await fs.outputJson(owner, { assetType: { name: 'webpage' } });
        await fs.outputFile(companion, 'old');
        await fs.outputFile(
            path.join(root, 'webstudio', 'page.asset-webstudio-meta.html'),
            'conflict'
        );

        const report = await migrateAssetV10Tree(root);

        assert.deepEqual(report.conflicts, [owner]);
        assert.isTrue(await fs.pathExists(owner));
        assert.equal(await fs.readFile(companion, 'utf8'), 'old');
    });

    it('suppresses identical regrouping but retains edited destinations without old deletion', async () => {
        // fixtures only carry the fields filterAssetRegroupingChanges reads
        const rawOldFile = {
            file: 'retrieve/cred/bu/asset/message/key.asset-message-meta.json',
            fromPath: '-',
            moved: false,
        };
        const oldFile = /** @type {import('../types/mcdev.d.js').DeltaPkgItem} */ (
            /** @type {unknown} */ (rawOldFile)
        );
        const rawNewFile = {
            file: 'retrieve/cred/bu/asset/email/key.asset-email-meta.json',
            fromPath: '-',
            moved: false,
        };
        const newFile = /** @type {import('../types/mcdev.d.js').DeltaPkgItem} */ (
            /** @type {unknown} */ (rawNewFile)
        );
        const gitDiff = [oldFile, newFile];
        const rawIdenticalGit = {
            revparse: async () => 'same-blob',
        };
        const identicalGit = /** @type {import('simple-git').SimpleGit} */ (
            /** @type {unknown} */ (rawIdenticalGit)
        );
        assert.deepEqual(
            await filterAssetRegroupingChanges(gitDiff, 'base..target', identicalGit),
            []
        );

        const rawEditedGit = {
            revparse: async ([spec]) => (spec.startsWith('base:') ? 'old-blob' : 'new-blob'),
        };
        const editedGit = /** @type {import('simple-git').SimpleGit} */ (
            /** @type {unknown} */ (rawEditedGit)
        );
        assert.deepEqual(await filterAssetRegroupingChanges(gitDiff, 'base..target', editedGit), [
            newFile,
        ]);
    });

    it('suppresses identical git renames but keeps moved-and-edited files', async () => {
        // git rename detection reports one entry that carries both the old and the new path
        const rawMovedFile = {
            file: 'retrieve/cred/bu/asset/email/key.asset-email-meta.json',
            fromPath: 'retrieve/cred/bu/asset/message/key.asset-message-meta.json',
            moved: true,
        };
        const movedFile = /** @type {import('../types/mcdev.d.js').DeltaPkgItem} */ (
            /** @type {unknown} */ (rawMovedFile)
        );
        const rawIdenticalGit = {
            revparse: async () => 'same-blob',
        };
        const identicalGit = /** @type {import('simple-git').SimpleGit} */ (
            /** @type {unknown} */ (rawIdenticalGit)
        );
        assert.deepEqual(
            await filterAssetRegroupingChanges([movedFile], 'base..target', identicalGit),
            []
        );

        const rawEditedGit = {
            revparse: async ([spec]) => (spec.startsWith('base:') ? 'old-blob' : 'new-blob'),
        };
        const editedGit = /** @type {import('simple-git').SimpleGit} */ (
            /** @type {unknown} */ (rawEditedGit)
        );
        assert.deepEqual(
            await filterAssetRegroupingChanges([movedFile], 'base..target', editedGit),
            [movedFile]
        );
    });
});
