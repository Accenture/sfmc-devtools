import * as chai from 'chai';
const assert = chai.assert;

import { Util } from '../lib/util/util.js';
import MetadataType from '../lib/metadataTypes/MetadataType.js';

describe('UTIL', () => {
    describe('getGrayMsg ================', () => {
        let optionsBackup;

        beforeEach(() => {
            // snapshot the shared OPTIONS singleton so we can restore it afterwards
            optionsBackup = Util.OPTIONS;
            Util.OPTIONS = { ...Util.OPTIONS };
        });

        afterEach(() => {
            // restore the shared OPTIONS singleton
            Util.OPTIONS = optionsBackup;
        });

        it('should return the raw message without ANSI codes when noLogColors is true', () => {
            // GIVEN
            Util.OPTIONS.noLogColors = true;
            // WHEN
            const result = Util.getGrayMsg('x');
            // THEN
            assert.equal(result, 'x', 'should return the unmodified message');
            assert.isFalse(result.includes('\u001B'), 'should not contain any ANSI escape codes');
        });

        it('should wrap the message in dim/reset ANSI codes when noLogColors is false', () => {
            // GIVEN
            Util.OPTIONS.noLogColors = false;
            // WHEN
            const result = Util.getGrayMsg('x');
            // THEN
            assert.include(result, '\u001B[2m', 'should contain the dim ANSI code');
            assert.include(result, '\u001B[0m', 'should contain the reset ANSI code');
            assert.include(result, 'x', 'should still contain the original message');
        });
    });

    describe('Metadata and REST contracts ================', () => {
        it('should find nested string leaf values without filtering or duplication', () => {
            const metadata = {
                r__asset_key: 'root',
                nested: [{ r__asset_key: 'child' }, { r__asset_key: 'root' }],
            };

            assert.deepEqual(Util.findLeafVals(metadata, 'r__asset_key'), ['child', 'root']);
        });

        it('should parse concrete REST envelopes and singular responses', () => {
            const definitionBackup = MetadataType.definition;
            MetadataType.definition = {
                ...definitionBackup,
                type: 'test',
                keyField: 'key',
                bodyIteratorField: 'items',
            };

            assert.deepEqual(MetadataType.parseResponseBody({ items: [{ key: 'one' }] }), {
                one: { key: 'one' },
            });
            assert.deepEqual(MetadataType.parseResponseBody({ key: 'two' }, 'two'), {
                two: { key: 'two' },
            });

            MetadataType.definition = definitionBackup;
        });

        it('should exclude null REST error results before key processing', async () => {
            const definitionBackup = MetadataType.definition;
            const clientBackup = MetadataType.client;
            MetadataType.definition = {
                ...definitionBackup,
                type: 'test',
                keyField: 'key',
            };
            MetadataType.client = {
                rest: {
                    get: async (uri) => {
                        if (uri === '/missing') {
                            throw Object.assign(new Error('missing'), { code: '404' });
                        }
                        return { key: 'found' };
                    },
                },
            };

            const result = await MetadataType.retrieveRESTcollection(
                [
                    { id: 'found', uri: '/found' },
                    { id: 'missing', uri: '/missing' },
                ],
                1,
                false
            );

            assert.deepEqual(result.metadata, { found: { key: 'found' } });
            MetadataType.definition = definitionBackup;
            MetadataType.client = clientBackup;
        });
    });
});
