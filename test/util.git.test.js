import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import fs from 'fs-extra';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { assert } from 'chai';
import DevOps from '../lib/util/devops.js';
import { createGit, GitCommandError } from '../lib/util/git.js';

const execFileAsync = promisify(execFile);

/**
 * Runs a Git command in a fixture repository.
 *
 * @param {string} cwd repository directory
 * @param {string[]} args Git arguments
 * @returns {Promise.<string>} stdout
 */
async function git(cwd, ...args) {
    return createGit({ cwd }).execute(args);
}

/**
 * Creates and owns registered temporary Git repositories, then removes only validated descendants.
 */
class GitFixtureRegistry {
    /**
     * Creates an isolated run root and unguessable ownership marker.
     *
     * @returns {Promise.<GitFixtureRegistry>} initialized registry
     */
    static async create() {
        const root = await fs.mkdtemp(path.join(os.tmpdir(), 'mcdev-git-adapter-'));
        const marker = randomUUID();
        await fs.writeFile(path.join(root, marker), marker, 'utf8');
        return new GitFixtureRegistry(root, marker);
    }

    /**
     * Stores run ownership state.
     *
     * @param {string} root newly created OS-temp run root
     * @param {string} marker ownership marker filename and content
     */
    constructor(root, marker) {
        this.root = path.resolve(root);
        this.marker = marker;
        this.registered = new Set();
    }

    /**
     * Creates and registers a repository fixture below this run's root.
     *
     * @param {string} name fixture directory name
     * @returns {Promise.<string>} absolute repository path
     */
    async createRepository(name) {
        const repository = path.join(this.root, name);
        await fs.mkdir(repository);
        this.registered.add(path.resolve(repository));
        await git(repository, 'init', '--initial-branch=main');
        await git(repository, 'config', 'user.name', 'Fixture Author');
        await git(repository, 'config', 'user.email', 'fixture@example.com');
        return repository;
    }

    /**
     * Removes registered fixtures after ownership, containment, and reparse-point validation.
     *
     * @returns {Promise.<void>} resolves after registered descendants and the empty run root are gone
     * @throws {Error} when ownership or target validation fails
     */
    async cleanup() {
        const markerPath = path.join(this.root, this.marker);
        assert.equal(
            await fs.readFile(markerPath, 'utf8'),
            this.marker,
            'fixture ownership mismatch'
        );
        for (const target of [...this.registered].toSorted((a, b) => b.length - a.length)) {
            const relative = path.relative(this.root, target);
            assert.isNotEmpty(relative, 'run root cannot be a cleanup target');
            assert.isFalse(relative.startsWith('..'), 'cleanup target escaped run root');
            assert.isFalse(path.isAbsolute(relative), 'cleanup target must remain relative');
            assert.notMatch(relative, /[*?]/, 'cleanup target cannot contain wildcards');
            const stats = await fs.lstat(target);
            assert.isFalse(stats.isSymbolicLink(), 'cleanup target cannot be a symlink');
            await fs.rm(target, { recursive: true, force: false });
        }
        await fs.unlink(markerPath);
        await fs.rmdir(this.root);
    }
}

/**
 * Writes and commits one file.
 *
 * @param {string} repository fixture repository
 * @param {string} relativePath repository-relative filename
 * @param {string} content UTF-8 file content
 * @param {string} message commit message
 * @returns {Promise.<string>} commit hash
 */
async function commitFile(repository, relativePath, content, message) {
    await fs.outputFile(path.join(repository, relativePath), content, 'utf8');
    await git(repository, 'add', '--', relativePath);
    await git(repository, 'commit', '-m', message);
    return (await git(repository, 'rev-parse', 'HEAD')).trim();
}

describe('native Git adapter', () => {
    /** @type {GitFixtureRegistry} */
    let fixtures;

    beforeEach(async () => {
        fixtures = await GitFixtureRegistry.create();
    });

    afterEach(async () => {
        await fixtures.cleanup();
    });

    it('preserves UTF-8 log fields and resolves revisions', async () => {
        const repository = await fixtures.createRepository('repo with spaces');
        const hash = await commitFile(repository, 'üñí code.json', 'Grüße\n', 'café ✓');
        const client = createGit({ cwd: repository });

        const history = await client.log(['-1']);
        assert.equal(history.all[0].hash, hash);
        assert.equal(history.all[0].message, 'café ✓');
        assert.equal(history.all[0].author_name, 'Fixture Author');
        assert.equal(await client.revparse(['HEAD']), hash);
    });

    it('reports unusual names and compact rename output without shell interpretation', async () => {
        const repository = await fixtures.createRepository('rename repo');
        const original = 'retrieve/cred/bu/asset/message/a [x] $file.json';
        const renamed = 'retrieve/cred/bu/asset/email/a {y} & file.json';
        const base = await commitFile(repository, original, 'same bytes\n', 'base');
        await fs.move(path.join(repository, original), path.join(repository, renamed));
        await git(repository, 'add', '-A');
        await git(repository, 'commit', '-m', 'rename');

        const summary = await createGit({ cwd: repository }).diffSummary([`${base}..HEAD`]);
        assert.lengthOf(summary.files, 1);
        assert.match(summary.files[0].status, /^R/);
        assert.equal(
            summary.files[0].file,
            'retrieve/cred/bu/asset/{message/a [x] $file.json => email/a {y} & file.json}'
        );
    });

    it('supports remotes, fetch, remote branches, and effective config', async () => {
        const remote = await fixtures.createRepository('remote source');
        await commitFile(remote, 'seed.txt', 'seed\n', 'seed');
        const clone = path.join(fixtures.root, 'clone target');
        fixtures.registered.add(path.resolve(clone));
        await git(fixtures.root, 'clone', remote, clone);
        await git(clone, 'config', 'user.name', 'Fixture Author');
        const client = createGit({ cwd: clone });

        const remotes = await client.getRemotes(true);
        assert.equal(remotes[0].name, 'origin');
        assert.equal(remotes[0].refs.fetch, remote);
        assert.equal(remotes[0].refs.push, remote);
        await client.fetch();
        assert.include((await client.branch(['-r'])).all, 'origin/main');
        assert.equal((await client.getConfig('user.name')).value, 'Fixture Author');
        assert.isNull((await client.getConfig('mcdev.missing')).value);
    });

    it('maps a missing Git executable to an actionable command error', async () => {
        const repository = await fixtures.createRepository('missing git');
        const client = createGit({ cwd: repository, gitBinary: `missing-git-${randomUUID()}` });

        try {
            await client.revparse(['HEAD']);
            assert.fail('expected missing Git to fail');
        } catch (ex) {
            assert.include(ex.message, repository);
            assert.deepEqual(ex.args, ['rev-parse', 'HEAD']);
            assert.match(String(ex.code), /ENOENT/);
        }
    });

    it('rejects non-repositories and includes Git remediation details', async () => {
        const directory = path.join(fixtures.root, 'not a repository');
        await fs.mkdir(directory);
        fixtures.registered.add(path.resolve(directory));

        try {
            await createGit({ cwd: directory }).revparse(['HEAD']);
            assert.fail('expected rev-parse to fail');
        } catch (ex) {
            assert.instanceOf(ex, GitCommandError);
            assert.include(ex.message, 'rev-parse HEAD');
            assert.match(ex.stderr, /not a git repository/i);
        }
    });

    it('retains actionable stderr for invalid revisions', async () => {
        const repository = await fixtures.createRepository('failure repo');
        await commitFile(repository, 'file.txt', 'content\n', 'initial');

        try {
            await createGit({ cwd: repository }).diffSummary(['missing-ref..HEAD']);
            assert.fail('expected diff to fail');
        } catch (ex) {
            assert.instanceOf(ex, GitCommandError);
            assert.include(ex.message, 'diff --name-status -z -M missing-ref..HEAD');
            assert.match(ex.stderr, /ambiguous argument|unknown revision/i);
        }
    });

    it('maps an invalid DevOps revision range to the established checkout guidance', async () => {
        const repository = await fixtures.createRepository('devops invalid range');
        await commitFile(repository, 'file.txt', 'content\n', 'initial');
        const runner = path.join(fixtures.root, 'devops-range-runner.mjs');
        fixtures.registered.add(path.resolve(runner));
        await fs.writeFile(
            runner,
            `import DevOps from ${JSON.stringify(new URL('../lib/util/devops.js', import.meta.url).href)};\n` +
                `process.chdir(${JSON.stringify(repository)});\n` +
                `const properties = { directories: { retrieve: 'retrieve/' }, options: { deployment: { commitHistory: 10 } } };\n` +
                `try { await DevOps.getDeltaList(properties, 'missing-branch..HEAD', false, 'cred/bu'); } catch (error) { console.error(error.message); process.exit(23); }\n`,
            'utf8'
        );

        try {
            await execFileAsync(process.execPath, [runner], { cwd: repository, encoding: 'utf8' });
            assert.fail('expected DevOps range to fail');
        } catch (ex) {
            assert.equal(ex.code, 23);
            assert.include(
                ex.stderr,
                'Make sure you checked out the branches mentioned in your git range (missing-branch..HEAD)'
            );
            assert.notInclude(ex.stderr, 'Git command failed in');
        }
        assert.isObject(DevOps);
    });
});
