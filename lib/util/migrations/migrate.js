import fs from 'node:fs/promises';
import path from 'node:path';
import semver from 'semver';
import { confirm } from '@inquirer/prompts';
import { migrationRegistry } from './registry.js';
import { establishGitSafety, recheckGitSafety, assertCommittedSources } from './gitSafety.js';

/**
 * Migrate one exact configured retrieve BU using only local, explicitly confirmed moves.
 * Dependencies are injectable for isolated command integration tests.
 *
 * @param {string} businessUnit exact credential/BU selector
 * @param {object} [options] local execution dependencies
 * @returns {Promise.<object>} cancelled, noop or migrated result
 */
export async function migrate(businessUnit, options = {}) {
    const {
        projectRoot = process.cwd(),
        readConfig = async () =>
            JSON.parse(await fs.readFile(path.join(projectRoot, '.mcdevrc.json'), 'utf8')),
        installedVersion = JSON.parse(
            await fs.readFile(new URL('../../../package.json', import.meta.url), 'utf8')
        ).version,
        registry = migrationRegistry,
        establish = establishGitSafety,
        recheck = recheckGitSafety,
        committed = assertCommittedSources,
        prompt = confirm,
        interactive = !!(process.stdin.isTTY && process.stdout.isTTY),
        log = (message) => process.stdout.write(`${message}\n`),
        warn = (message) => process.stderr.write(`${message}\n`),
    } = options;
    const parts = typeof businessUnit === 'string' ? businessUnit.split('/') : [];
    if (
        parts.length !== 2 ||
        parts.some((part) => !part || part === '.' || part === '..' || /[\\:*?\0]/.test(part))
    ) {
        throw new Error('Specify one exact configured credential/BU: mcdev migrate cred/bu.');
    }
    const properties = await readConfig();
    const version = properties?.version;
    if (!semver.valid(version)) {
        throw new Error("Project config version is missing or invalid. Run 'mcdev upgrade' first.");
    }
    if (semver.gt(version, installedVersion)) {
        throw new Error(`Install mcdev@${version} first; this command never updates packages.`);
    }
    if (
        semver.gt(installedVersion, version) &&
        semver.diff(installedVersion, version) !== 'patch'
    ) {
        throw new Error(
            "Project config is outdated. Run 'mcdev upgrade' first and commit its changes."
        );
    }
    const [credential, bu] = parts;
    if (
        !Object.hasOwn(properties.credentials || {}, credential) ||
        !Object.hasOwn(properties.credentials[credential]?.businessUnits || {}, bu)
    ) {
        throw new Error(`Not an exact configured credential/BU: ${businessUnit}`);
    }
    const retrieve = properties.directories?.retrieve;
    if (typeof retrieve !== 'string' || !retrieve.trim()) {
        throw new Error('Configure directories.retrieve before running mcdev migrate.');
    }
    const buPath = path.resolve(projectRoot, retrieve, credential, bu);
    const snapshot = await establish({ projectRoot, buPath });
    const assetRoot = path.join(snapshot.buPath, 'asset');
    const plans = [];
    // There is intentionally only one transformation group; no speculative composition engine.
    for (const group of registry) {
        plans.push({ group, plan: await group.plan(assetRoot) });
    }
    const count = plans.reduce((sum, { plan }) => sum + plan.moves.length, 0);
    log(`Repository: ${snapshot.repoRoot}\nBranch: ${snapshot.branch}\nBU: ${businessUnit}`);
    for (const { group, plan } of plans) {
        log(
            `${group.version}: ${plan.owners.length} asset owners; ${plan.moves.length} file moves`
        );
    }
    if (!count) {
        log(
            plans.some(({ plan }) => plan.assetRootExists)
                ? 'No migration moves needed; selected BU is already current.'
                : 'No asset directory for the selected BU; nothing to migrate.'
        );
        return { status: 'noop', movedFiles: 0 };
    }
    if (!interactive) {
        throw new Error(
            'mcdev migrate requires an interactive terminal; unattended mutation is refused.'
        );
    }
    // Do not consult Util.skipInteraction or global --yes: approval must come from this prompt.
    const approved = await prompt({
        message: `Continue migrating ${businessUnit} on branch ${snapshot.branch}? Confirm you do not need to switch branches first.`,
        default: false,
    });
    if (!approved) {
        log('Migration cancelled; no files changed.');
        return { status: 'cancelled', movedFiles: 0 };
    }
    await recheck(snapshot);
    await committed(
        snapshot,
        plans.flatMap(({ plan }) => plan.moves.map(({ source }) => path.resolve(assetRoot, source)))
    );
    let movedFiles = 0;
    const cleanupErrors = [];
    for (const { group, plan } of plans) {
        if (!plan.moves.length) {
            continue;
        }
        const result = await group.execute(plan);
        movedFiles += result.movedFiles;
        cleanupErrors.push(...result.cleanupErrors);
    }
    for (const error of cleanupErrors) {
        warn(`Migration cleanup warning: ${error}`);
    }
    log(`Migrated ${movedFiles} files in ${businessUnit} on branch ${snapshot.branch}.`);
    log(
        'Review the diff and create a new, separate migration commit before running createDeltaPkg, switching branches, or migrating another BU.'
    );
    return { status: 'migrated', movedFiles, cleanupErrors };
}
