import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rmdir, unlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
let validation;

describe('custom validation module URLs', () => {
    const roots = [];

    before(async () => {
        ({ default: validation } = await import('../lib/util/validations.js'));
    });

    afterEach(async () => {
        for (const root of roots.splice(0)) {
            await unlink(path.join(root, '.mcdev-validations.js'));
            await unlink(path.join(root, 'package.json'));
            await rmdir(path.join(root, 'node_modules'));
            await rmdir(root);
        }
    });

    it('loads file URLs from explicit roots and refreshes when the root changes', async () => {
        for (const marker of ['first', 'second']) {
            const root = await mkdtemp(path.join(os.tmpdir(), `mcdev validation ${marker} `));
            roots.push(root);
            await mkdir(path.join(root, 'node_modules'));
            await writeFile(path.join(root, 'package.json'), '{"type":"module"}\n');
            await writeFile(
                path.join(root, '.mcdev-validations.js'),
                `export async function validation() { return { ${marker}: { passed: () => true } }; }\n`
            );
        }
        const definition = { type: 'asset', keyField: 'key', nameField: 'name' };
        const first = await validation(definition, { key: 'x' }, '', [], roots[0]);
        const second = await validation(definition, { key: 'x' }, '', [], roots[1]);

        assert.ok(Object.hasOwn(first, 'first'));
        assert.ok(!Object.hasOwn(first, 'second'));
        assert.ok(Object.hasOwn(second, 'second'));
        assert.ok(!Object.hasOwn(second, 'first'));
    });
});
