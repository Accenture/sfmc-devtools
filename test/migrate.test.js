import fs from 'fs-extra';
import os from 'node:os';
import path from 'node:path';
import { assert } from 'chai';
import handler from '../lib/index.js';
import config from '../lib/util/config.js';
import { Util } from '../lib/util/util.js';

/**
 * @typedef {import('../lib/util/migrations/assetV10.js').AssetV10MigrationReport} AssetV10MigrationReport
 * @typedef {import('../types/mcdev.d.js').Mcdevrc} Mcdevrc
 */

// keep the real credential/BU resolution, only replace the config file access
const originalGetProperties = config.getProperties;
const originalCheckProperties = config.checkProperties;
const originalSkipInteraction = Util.skipInteraction;
const originalNoLogFile = Util.OPTIONS.noLogFile;

/**
 * Seeds a mappable historical asset (message -> email) below one BU's retrieve asset root.
 *
 * @param {string} root temporary project root
 * @param {string} buName name of the BU
 * @returns {Promise.<void>} -
 */
async function seedMappableAsset(root, buName) {
    const assetRoot = path.join(root, 'retrieve', 'testInstance', buName, 'asset');
    await fs.outputJson(path.join(assetRoot, 'message', 'mail', 'mail.asset-message-meta.json'), {
        assetType: { name: 'htmlemail' },
    });
    await fs.outputFile(
        path.join(assetRoot, 'message', 'mail', 'views.html.content.asset-message-meta.html'),
        '<p>hello</p>'
    );
}

/**
 * Seeds a historical asset whose destination already exists, forcing a migration conflict.
 *
 * @param {string} root temporary project root
 * @param {string} buName name of the BU
 * @returns {Promise.<void>} -
 */
async function seedConflictingAsset(root, buName) {
    const assetRoot = path.join(root, 'retrieve', 'testInstance', buName, 'asset');
    await fs.outputJson(path.join(assetRoot, 'asset', 'page.asset-asset-meta.json'), {
        assetType: { name: 'webpage' },
    });
    await fs.outputFile(path.join(assetRoot, 'asset', 'page.asset-asset-meta.html'), 'old');
    await fs.outputFile(
        path.join(assetRoot, 'webstudio', 'page.asset-webstudio-meta.html'),
        'conflict'
    );
}

describe('migrate command', function () {
    // file-system heavy suite: keep it green on slow/loaded machines
    this.timeout(30_000);
    let temporary;
    let retrieveRoot;

    beforeEach(async () => {
        temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'mcdev-migrate-'));
        retrieveRoot = path.join(temporary, 'retrieve');
        const rawProperties = {
            credentials: {
                testInstance: {
                    eid: 1111111,
                    businessUnits: { testBU: 9999999, _ParentBU_: 1111111 },
                },
            },
            directories: { retrieve: retrieveRoot },
        };
        const properties = /** @type {Mcdevrc} */ (/** @type {unknown} */ (rawProperties));
        config.getProperties = async () => properties;
        // the real getCredentialObject validates the project config first
        config.checkProperties = async () => true;
        Util.skipInteraction = {};
        Util.OPTIONS.noLogFile = true;
    });

    afterEach(async () => {
        config.getProperties = originalGetProperties;
        config.checkProperties = originalCheckProperties;
        Util.skipInteraction = originalSkipInteraction;
        Util.OPTIONS.noLogFile = originalNoLogFile;
        await fs.remove(temporary);
    });

    it('cred/* migrates every BU of that credential and returns per-BU results', async () => {
        await seedMappableAsset(temporary, 'testBU');
        await seedMappableAsset(temporary, '_ParentBU_');

        const reports = /** @type {Object.<string, AssetV10MigrationReport>} */ (
            await handler.migrate('testInstance/*')
        );

        assert.deepEqual(Object.keys(reports).toSorted(), [
            'testInstance/_ParentBU_',
            'testInstance/testBU',
        ]);
        for (const buName of ['testBU', '_ParentBU_']) {
            const report = reports[`testInstance/${buName}`];
            assert.lengthOf(report.conflicts, 0);
            assert.isAbove(report.moved.length, 0);
            assert.isFalse(
                await fs.pathExists(
                    path.join(
                        retrieveRoot,
                        'testInstance',
                        buName,
                        'asset',
                        'message',
                        'mail',
                        'mail.asset-message-meta.json'
                    )
                )
            );
            assert.isTrue(
                await fs.pathExists(
                    path.join(
                        retrieveRoot,
                        'testInstance',
                        buName,
                        'asset',
                        'email',
                        'mail',
                        'mail.asset-email-meta.json'
                    )
                )
            );
        }
    });

    it('keeps migrating the remaining BUs when one BU has a conflict', async () => {
        await seedConflictingAsset(temporary, 'testBU');
        await seedMappableAsset(temporary, '_ParentBU_');

        const reports = /** @type {Object.<string, AssetV10MigrationReport>} */ (
            await handler.migrate('testInstance/*')
        );

        assert.lengthOf(reports['testInstance/testBU'].conflicts, 1);
        assert.isTrue(
            await fs.pathExists(
                path.join(
                    retrieveRoot,
                    'testInstance',
                    'testBU',
                    'asset',
                    'asset',
                    'page.asset-asset-meta.json'
                )
            )
        );
        assert.lengthOf(reports['testInstance/_ParentBU_'].conflicts, 0);
        assert.isTrue(
            await fs.pathExists(
                path.join(
                    retrieveRoot,
                    'testInstance',
                    '_ParentBU_',
                    'asset',
                    'email',
                    'mail',
                    'mail.asset-email-meta.json'
                )
            )
        );
    });

    it('keeps migrating the remaining BUs when one BU migration rejects', async () => {
        await seedMappableAsset(temporary, 'testBU');
        await seedMappableAsset(temporary, '_ParentBU_');

        // force the real migration engine to reject while it processes the first BU
        const failingAssetRoot = path.join(retrieveRoot, 'testInstance', 'testBU', 'asset');
        const mutableFs =
            /** @type {{move: (from: string, to: string, options?: object) => Promise.<void>}} */ (
                /** @type {unknown} */ (fs)
            );
        const originalMove = mutableFs.move;
        mutableFs.move = async (from, to, options) => {
            if (path.resolve(from).startsWith(path.resolve(failingAssetRoot) + path.sep)) {
                throw new Error('simulated migration failure');
            }
            return originalMove.call(fs, from, to, options);
        };
        const mutableLogger = /** @type {{error: (message: string) => void}} */ (
            /** @type {unknown} */ (Util.logger)
        );
        const originalLoggerError = mutableLogger.error;
        const errors = [];
        mutableLogger.error = (message) => {
            errors.push(message);
        };

        let reports;
        try {
            reports = /** @type {Object.<string, AssetV10MigrationReport>} */ (
                await handler.migrate('testInstance/*')
            );
        } finally {
            mutableFs.move = originalMove;
            mutableLogger.error = originalLoggerError;
        }

        // the rejecting BU has no report, but the accumulated per-BU reports survive the throw
        assert.deepEqual(Object.keys(reports), ['testInstance/_ParentBU_']);
        const surviving = reports['testInstance/_ParentBU_'];
        assert.lengthOf(surviving.conflicts, 0);
        assert.isAbove(surviving.moved.length, 0);
        assert.isTrue(
            await fs.pathExists(
                path.join(
                    retrieveRoot,
                    'testInstance',
                    '_ParentBU_',
                    'asset',
                    'email',
                    'mail',
                    'mail.asset-email-meta.json'
                )
            )
        );
        // the rejecting BU's asset is left untouched instead of being reported as migrated
        assert.isTrue(
            await fs.pathExists(
                path.join(
                    retrieveRoot,
                    'testInstance',
                    'testBU',
                    'asset',
                    'message',
                    'mail',
                    'mail.asset-message-meta.json'
                )
            )
        );
        // the rejection is surfaced to the user and attributed to its credential/BU
        assert.include(
            errors,
            'testInstance/testBU: Asset v10 migration failed: simulated migration failure'
        );
    });

    it('leaves the single-BU behaviour unchanged', async () => {
        await seedMappableAsset(temporary, 'testBU');
        await seedMappableAsset(temporary, '_ParentBU_');

        const report = /** @type {AssetV10MigrationReport} */ (
            await handler.migrate('testInstance/testBU')
        );

        assert.isArray(report.moved);
        assert.lengthOf(report.conflicts, 0);
        assert.isAbove(report.moved.length, 0);
        // the other BU of the same credential is not touched
        assert.isTrue(
            await fs.pathExists(
                path.join(
                    retrieveRoot,
                    'testInstance',
                    '_ParentBU_',
                    'asset',
                    'message',
                    'mail',
                    'mail.asset-message-meta.json'
                )
            )
        );
    });

    it('never touches deploy or template trees', async () => {
        await seedMappableAsset(temporary, 'testBU');
        const deployFile = path.join(
            temporary,
            'deploy',
            'testInstance',
            'testBU',
            'asset',
            'message',
            'mail',
            'mail.asset-message-meta.json'
        );
        const templateFile = path.join(
            temporary,
            'template',
            'asset',
            'message',
            'mail',
            'mail.asset-message-meta.json'
        );
        await fs.outputJson(deployFile, { assetType: { name: 'htmlemail' } });
        await fs.outputJson(templateFile, { assetType: { name: 'htmlemail' } });

        await handler.migrate('testInstance/testBU');

        assert.isTrue(await fs.pathExists(deployFile));
        assert.isFalse(
            await fs.pathExists(
                path.join(
                    temporary,
                    'deploy',
                    'testInstance',
                    'testBU',
                    'asset',
                    'email',
                    'mail',
                    'mail.asset-email-meta.json'
                )
            )
        );
        assert.isTrue(await fs.pathExists(templateFile));
        assert.isFalse(
            await fs.pathExists(
                path.join(
                    temporary,
                    'template',
                    'asset',
                    'email',
                    'mail',
                    'mail.asset-email-meta.json'
                )
            )
        );
    });

    it('errors on an unresolvable credential without migrating anything', async () => {
        const untouched = path.join(
            retrieveRoot,
            'testInstance',
            'testBU',
            'asset',
            'message',
            'mail',
            'mail.asset-message-meta.json'
        );
        await seedMappableAsset(temporary, 'testBU');

        const result = await handler.migrate('doesNotExist/*');

        assert.isUndefined(result);
        assert.isTrue(await fs.pathExists(untouched));
    });
});
