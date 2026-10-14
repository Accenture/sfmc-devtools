import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Opt into errors-only mcdev logging only for the argument-free npm test invocation.
 *
 * @param {string[]} args forwarded Mocha arguments
 * @param {NodeJS.ProcessEnv} env parent environment
 * @returns {NodeJS.ProcessEnv} isolated child environment
 */
export function getTestEnvironment(args, env) {
    const childEnv = { ...env };
    delete childEnv.MCDEV_FULL_TEST_SUITE;
    if (args.length === 0) {
        childEnv.MCDEV_FULL_TEST_SUITE = '1';
    }
    return childEnv;
}

// Importing this file through Mocha (including editor adapters) must not launch a suite.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const args = process.argv.slice(2);
    const result = spawnSync(
        process.execPath,
        [
            fileURLToPath(new URL('../node_modules/mocha/bin/mocha.js', import.meta.url)),
            '--reporter-option',
            'maxDiffSize=25000',
            ...args,
        ],
        { stdio: 'inherit', env: getTestEnvironment(args, process.env) }
    );
    process.exitCode = result.status ?? 1;
}
