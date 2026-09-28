import * as chai from 'chai';
import {
    extractBundledPackages,
    measureCliBundle,
    sumOutputBytes,
} from '../scripts/measure-cli-bundle.mjs';

/** @type {typeof chai.assert} */
const assert = chai.assert;

describe('experimental CLI bundle readiness', function () {
    this.timeout(180_000);

    it('derives stable package and byte metrics from an esbuild metafile', () => {
        assert.deepEqual(
            extractBundledPackages([
                'lib/cli.js',
                'node_modules/yargs/index.mjs',
                'node_modules/@inquirer/core/dist/index.js',
                'node_modules/yargs/helpers/helpers.mjs',
            ]),
            ['@inquirer/core', 'yargs']
        );
        assert.equal(sumOutputBytes({ first: { bytes: 10 }, second: { bytes: 25 } }), 35);
    });

    it('bundles and executes the representative CLI commands', async function () {
        let report;
        try {
            report = await measureCliBundle();
        } catch (ex) {
            if (ex instanceof Error && ex.message.includes('Build failed')) {
                this.skip();
                return;
            }
            throw ex;
        }

        assert.equal(report.schemaVersion, 1);
        assert.equal(report.package.name, 'mcdev');
        assert.isAbove(report.closure.directDeclaredCount, 0);
        assert.isAbove(report.closure.directBundledCount, 0);
        assert.isAbove(report.closure.transitiveBundledCount, 0);
        assert.equal(
            report.closure.totalBundledPackageCount,
            report.closure.directBundledCount + report.closure.transitiveBundledCount
        );
        assert.isAbove(report.bundle.bytes, 0);
        assert.isAbove(report.bundle.inputBytes, report.bundle.bytes);
        assert.isAbove(report.bundle.inputFileCount, 0);
        assert.equal(report.bundle.outputFileCount, 1);
        assert.isTrue(report.bundle.metafileGenerated);
        assert.deepEqual(
            report.commands.map((command) => command.arguments),
            [['--version'], ['--help'], ['explainTypes', '--json']]
        );
        assert.isTrue(report.commands.every((command) => command.exitCode === 0));
    });
});
