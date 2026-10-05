import assert from 'node:assert/strict';
import jsonToTable from '../lib/util/jsonToTable.js';

describe('jsonToTable utility', () => {
    it('flattens object input and preserves leaf values', () => {
        const input = {
            name: 'first',
            nested: { enabled: false, count: 0, optional: null },
        };
        const snapshot = structuredClone(input);

        assert.deepEqual(jsonToTable(input), [
            ['name', 'nested.enabled', 'nested.count', 'nested.optional'],
            ['first', false, 0, null],
        ]);
        assert.deepEqual(input, snapshot);
    });

    it('unions array leaf paths in first-seen order and fills missing values', () => {
        const input = [
            { first: 1, nested: { shared: 'a' } },
            { nested: { later: 'b', shared: 'c' }, last: 2 },
        ];
        const snapshot = structuredClone(input);

        assert.deepEqual(jsonToTable(input), [
            ['first', 'nested.shared', 'nested.later', 'last'],
            [1, 'a', '', ''],
            ['', 'c', 'b', 2],
        ]);
        assert.deepEqual(input, snapshot);
    });

    it('returns one empty header row for empty input', () => {
        assert.deepEqual(jsonToTable([]), [[]]);
        assert.deepEqual(jsonToTable({}), [[]]);
    });
});
