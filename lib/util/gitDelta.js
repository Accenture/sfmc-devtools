/**
 * Read committed Git changes without consulting working-tree file contents.
 * Git rename/copy configuration is inherited from the injected repository client.
 * Paths are literal Git paths, never platform-normalized or display-name parsed.
 *
 * @param {{raw: (commands: string[]) => PromiseLike<string>}} git repository-scoped client
 * @param {string} range bare base, base..target, or base...target; omitted endpoints mean HEAD
 * @returns {Promise.<{comparison: {base: string, target: string}, changes: object[]}>} resolved commits and structured changes
 */
export async function readGitDelta(git, range) {
    if (typeof range !== 'string' || !range.length || range.startsWith('-')) {
        throw new Error('Expected a Git revision or comparison range.');
    }
    const match = /^(.*?)\.{2}(\.?)(.*?)$/.exec(range);
    const baseRef = match ? match[1] || 'HEAD' : range;
    const targetRef = match ? match[3] || 'HEAD' : 'HEAD';
    const [left, target] = await Promise.all(
        [baseRef, targetRef].map(async (ref) =>
            (await git.raw(['rev-parse', '--verify', '--end-of-options', ref + '^{commit}'])).trim()
        )
    );
    let base = left;
    if (match?.[2]) {
        const bases = (await git.raw(['merge-base', '--all', left, target])).trim().split('\n');
        if (bases.length !== 1 || !bases[0]) {
            throw new Error('Git comparison requires a unique merge base.');
        }
        base = bases[0];
    }
    // Both views use identical committed endpoints and diff configuration.
    const options = ['-z', '--no-ext-diff', '--no-textconv', '--ignore-submodules=none'];
    const raw = await git.raw(['diff', '--raw', '--abbrev=64', ...options, base, target, '--']);
    const numstat = await git.raw(['diff', '--numstat', ...options, base, target, '--']);
    const changes = parseRaw(raw);
    const stats = parseNumstat(numstat);
    const sizes = new Map();
    for (const change of changes) {
        const key = pathKey(change.oldPath ?? change.newPath, change.newPath ?? change.oldPath);
        const counts = stats.get(key);
        if (!counts) {
            throw new Error('Git raw and numstat paths do not agree.');
        }
        stats.delete(key);
        if (counts.binary) {
            change.stats = {
                binary: true,
                before: await blobSize(git, change.oldOid, sizes),
                after: await blobSize(git, change.newOid, sizes),
            };
        } else {
            change.stats = counts;
        }
    }
    if (stats.size) {
        throw new Error('Git numstat contains unmatched paths.');
    }
    return { comparison: { base, target }, changes };
}

/**
 * Encode an exact path tuple without delimiter ambiguity.
 *
 * @param {string} oldPath source path
 * @param {string} newPath destination path
 * @returns {string} tuple key
 */
function pathKey(oldPath, newPath) {
    return JSON.stringify([oldPath, newPath]);
}

/**
 * Parse Git's raw -z grammar (header, path, optional second path).
 *
 * @param {string} output raw diff
 * @returns {object[]} changes
 */
function parseRaw(output) {
    const fields = output.split('\0');
    const changes = [];
    for (let i = 0; i < fields.length - 1; ) {
        const header = /^:(\d{6}) (\d{6}) ([\da-f]+) ([\da-f]+) ([A-Z])(\d+)?$/.exec(fields[i++]);
        if (!header) {
            throw new Error('Invalid Git raw diff header.');
        }
        const [, oldMode, newMode, oldOid, newOid, status, score] = header;
        const first = fields[i++];
        const second = status === 'R' || status === 'C' ? fields[i++] : first;
        if (!first || !second) {
            throw new Error('Invalid Git raw diff path.');
        }
        changes.push({
            status,
            ...(score !== undefined && { similarity: Number(score) }),
            oldPath: status === 'A' ? null : first,
            newPath: status === 'D' ? null : second,
            oldMode,
            newMode,
            oldOid,
            newOid,
        });
    }
    return changes;
}

/**
 * Parse only the two count separators; tabs and newlines inside names are data.
 *
 * @param {string} output numstat -z diff
 * @returns {Map.<string, object>} statistics keyed by exact old/new path tuple
 */
function parseNumstat(output) {
    const fields = output.split('\0');
    const result = new Map();
    for (let i = 0; i < fields.length - 1; ) {
        const match = /^(\d+|-)\t(\d+|-)\t([\s\S]*)$/.exec(fields[i++]);
        if (!match) {
            throw new Error('Invalid Git numstat record.');
        }
        const oldPath = match[3] || fields[i++];
        const newPath = match[3] || fields[i++];
        const key = pathKey(oldPath, newPath);
        if (!oldPath || !newPath || result.has(key)) {
            throw new Error('Invalid or duplicate Git numstat path tuple.');
        }
        const binary = match[1] === '-' && match[2] === '-';
        if (!binary && (match[1] === '-' || match[2] === '-')) {
            throw new Error('Invalid Git numstat counts.');
        }
        result.set(
            key,
            binary
                ? { binary: true }
                : {
                      binary: false,
                      insertions: Number(match[1]),
                      deletions: Number(match[2]),
                      changes: Number(match[1]) + Number(match[2]),
                  }
        );
    }
    return result;
}

/**
 * Resolve committed object sizes once per OID, treating absent sides as empty.
 *
 * @param {{raw: (commands: string[]) => PromiseLike<string>}} git repository client
 * @param {string} oid committed object ID (zero for absent sides)
 * @param {Map.<string, number>} cache per-invocation cache
 * @returns {Promise.<number>} bytes
 */
async function blobSize(git, oid, cache) {
    if (/^0+$/.test(oid)) {
        return 0;
    }
    if (!cache.has(oid)) {
        const size = Number((await git.raw(['cat-file', '-s', oid])).trim());
        if (!Number.isSafeInteger(size) || size < 0) {
            throw new Error('Invalid committed Git object size.');
        }
        cache.set(oid, size);
    }
    return cache.get(oid);
}
