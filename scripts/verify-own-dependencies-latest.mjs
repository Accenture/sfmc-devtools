/**
 * Generated copy - source of truth: repo-root scripts/verify-own-dependencies-latest.mjs
 * Do not hand-edit; update the canonical script, run `node scripts/sync-own-deps-check.mjs`
 * at the workspace root, then `npm run lint:fix` here.
 *
 * Release-time check: every one of our own packages in package-lock.json (top-level or nested
 * below another package) must be the newest version published on npm. A package fixed upstream
 * but stale here would otherwise ship stale (bundled extensions) or never reach users because a
 * pinned or narrow range excludes it (npm packages).
 *
 * `npm ci` already requires package-lock.json to satisfy package.json, so "locked == latest" also
 * proves the declared range admits the newest version.
 *
 * Run from the package root: npm run verify:own-dependencies-latest  (asks the npm registry)
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

/**
 * Packages maintained in this workspace (or contributed to and released alongside it).
 */
export const OWNED_PACKAGES = [
    '@joern.berkefeld/csv-parser',
    'ampscript-data',
    'ampscript-parser',
    'eslint-plugin-mcdev',
    'eslint-plugin-mso-email',
    'eslint-plugin-sfmc',
    'handlebars-data',
    'mcdev',
    'mso-conditional-parser',
    'prettier-plugin-sfmc',
    'salesforce-data360-rules',
    'sf-plugin-cms',
    'sf-plugin-data',
    'sfmc-dataloader',
    'sfmc-handlebars-parser',
    'sfmc-language-lsp',
    'sfmc-sdk',
    'ssjs-data',
    'waba-devtools',
];

/**
 * Lists every installed copy of an owned package in a lockfile, including nested copies.
 *
 * @param {object} lock - parsed package-lock.json
 * @returns {{name: string, version: string, location: string}[]} installed copies
 */
export function lockedVersions(lock) {
    const found = [];
    const installed = Object.entries(lock.packages ?? {});
    for (const [location, entry] of installed) {
        if (entry.link) {
            continue;
        }
        const name = OWNED_PACKAGES.find(
            (owned) =>
                location === `node_modules/${owned}` || location.endsWith(`/node_modules/${owned}`)
        );
        if (name) {
            found.push({ name, version: entry.version, location });
        }
    }
    return found;
}

/**
 * Compares the locked owned packages with the newest published versions.
 *
 * @param {object} lock - parsed package-lock.json
 * @param {Record<string, string>} latestByName - newest published version by package name
 * @returns {string[]} one message per stale copy
 */
export function findOutdated(lock, latestByName) {
    const outdated = [];
    const copies = lockedVersions(lock);
    for (const { name, version, location } of copies) {
        const latest = latestByName[name];
        assert.ok(latest, `No published version known for ${name}`);
        if (version !== latest) {
            outdated.push(`${location}: ${name} is locked at ${version}, npm has ${latest}`);
        }
    }
    return outdated;
}

/**
 * Asks the public npm registry for the newest version of a package.
 *
 * @param {string} name - package name
 * @returns {Promise.<string>} version
 */
async function latestVersion(name) {
    const response = await fetch(`https://registry.npmjs.org/${name.replace('/', '%2F')}/latest`);
    assert.ok(response.ok, `npm registry answered ${response.status} for ${name}`);
    const { version } = await response.json();
    assert.equal(typeof version, 'string', `npm registry returned no version for ${name}`);
    return version;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
    const root = fileURLToPath(new URL('..', import.meta.url));
    const lock = JSON.parse(readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
    const names = [...new Set(lockedVersions(lock).map((entry) => entry.name))];
    const latestByName = Object.fromEntries(
        await Promise.all(names.map(async (name) => [name, await latestVersion(name)]))
    );
    assert.deepEqual(
        findOutdated(lock, latestByName),
        [],
        'Own packages are behind npm. Update them (and package-lock.json) before releasing.'
    );
    process.stdout.write(`Own packages are current: ${JSON.stringify(latestByName)}\n`);
}
