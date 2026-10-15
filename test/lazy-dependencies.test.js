import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const repository = path.resolve(import.meta.dirname, '..');
const loader = path.join(repository, 'test/resources/import-purity-loader.mjs');

/**
 * Run an isolated ESM scenario while rejecting selected package imports.
 *
 * @param {string[]} blocked package specifiers that must remain unevaluated
 * @param {string} source ESM source to execute
 * @returns {void}
 */
function assertImportsRemainUnused(blocked, source) {
    const result = spawnSync(
        process.execPath,
        [
            '--experimental-loader',
            pathToFileURL(loader).href,
            '--input-type=module',
            '--eval',
            source,
        ],
        {
            cwd: repository,
            encoding: 'utf8',
            env: { ...process.env, MCDEV_BLOCKED_IMPORTS: blocked.join(',') },
        }
    );
    assert.equal(result.status, 0, result.stderr || result.stdout);
}

describe('LAZY DEPENDENCIES', () => {
    it('does not evaluate formatting packages when formatting is disabled', () => {
        assertImportsRemainUnused(
            ['prettier', 'prettier-plugin-sfmc'],
            [
                "import config from './lib/util/config.js';",
                "import File from './lib/util/file.js';",
                "import { Util } from './lib/util/util.js';",
                'config.properties = { options: { formatOnSave: false } };',
                'Util.OPTIONS.format = false;',
                "const source = '%%[set @x=1]%%';",
                'if ((await File._formatTransactionalSmsContent(source)) !== source) process.exitCode = 1;',
            ].join('\n')
        );
    });

    it('does not evaluate XML parsing for unrelated metadata definitions', () => {
        assertImportsRemainUnused(
            ['fast-xml-parser'],
            "await import('./lib/MetadataTypeDefinitions.js');"
        );
    });
});
