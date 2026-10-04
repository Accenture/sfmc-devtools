import * as chai from 'chai';
import { isDeepEqual } from '../lib/util/isDeepEqual.js';

/** @type {Chai.AssertStatic} */
const assert = chai.assert;

describe('util: isDeepEqual', () => {
    it('treats nested numeric strings and numbers as equivalent', () => {
        assert.isTrue(isDeepEqual({ nested: [{ value: 1 }] }, { nested: [{ value: '1' }] }));
    });

    it('rejects genuinely different nested values', () => {
        assert.isFalse(isDeepEqual({ nested: [{ value: 1 }] }, { nested: [{ value: '2' }] }));
    });
});
