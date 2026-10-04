import * as chai from 'chai';
import { topologicalSort } from '../lib/util/topological-sort.js';

/** @type {typeof chai.assert} */
const assert = chai.assert;

describe('topological sort replacement', () => {
    it('preserves edge direction and stable unrelated-node order', () => {
        assert.deepEqual(
            topologicalSort([
                ['dependency', 'dependent'],
                ['unrelated-a', 'unrelated-b'],
            ]),
            ['dependency', 'dependent', 'unrelated-a', 'unrelated-b']
        );
    });

    it('deduplicates repeated edges without changing output', () => {
        assert.deepEqual(
            topologicalSort([
                ['a', 'b'],
                ['c', 'd'],
                ['a', 'b'],
            ]),
            ['a', 'b', 'c', 'd']
        );
    });

    it('retains sentinels for call sites to filter', () => {
        const sorted = topologicalSort([
            [undefined, 'independent'],
            ['dependency', 'dependent'],
        ]);

        assert.deepEqual(sorted, [undefined, 'independent', 'dependency', 'dependent']);
        assert.deepEqual(
            sorted.filter((node) => !!node),
            ['independent', 'dependency', 'dependent']
        );
    });

    it('matches the former cycle error contract', () => {
        assert.throws(
            () =>
                topologicalSort([
                    ['a', 'b'],
                    ['b', 'a'],
                ]),
            /^Cyclic dependency, node was:"b"$/u
        );
    });
});
