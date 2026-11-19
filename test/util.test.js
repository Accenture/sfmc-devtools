import * as chai from 'chai';
/** @type {typeof chai.assert} */
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
            assert.isFalse(result.includes('\u{1B}'), 'should not contain any ANSI escape codes');
        });

        it('should wrap the message in dim/reset ANSI codes when noLogColors is false', () => {
            // GIVEN
            Util.OPTIONS.noLogColors = false;
            // WHEN
            const result = Util.getGrayMsg('x');
            // THEN
            assert.include(result, '\u{1B}[2m', 'should contain the dim ANSI code');
            assert.include(result, '\u{1B}[0m', 'should contain the reset ANSI code');
            assert.include(result, 'x', 'should still contain the original message');
        });
    });

    describe('mobilePushAppLegacyKeyToId ================', () => {
        it('should translate the legacy key of a mobilePushApp into its id', () => {
            // real key/id pairs, see test/resources/9999999/push/v1/application/get-response.json
            const pairs = {
                ZmRVQWZaUU5YVXFGdmJVYVI3b2JudzoxMTc6MA: '7d00d57d-0d94-4a5d-85bd-b51a47ba1b9f',
                YjhMeTFBUWgtRUNIUHNNN3hYbm5SQToxMTc6MA: 'd4f2c26f-2104-40f8-873e-c33bc579e744',
                WHNyV0ZwSjVzMC1XZkNhUkdmakZOdzoxMTc6MA: '16d6ca5e-7992-4fb3-967c-269119f8c537',
            };
            for (const [legacyKey, id] of Object.entries(pairs)) {
                assert.equal(Util.mobilePushAppLegacyKeyToId(legacyKey), id);
            }
        });

        it('should return an id unchanged', () => {
            assert.equal(
                Util.mobilePushAppLegacyKeyToId('7d00d57d-0d94-4a5d-85bd-b51a47ba1b9f'),
                '7d00d57d-0d94-4a5d-85bd-b51a47ba1b9f'
            );
        });

        it('should return everything that is not a legacy key unchanged', () => {
            const others = [
                'doesNotExist',
                'key with spaces',
                '',
                // mobilePush id: decodes to 19:114:0
                'MTk6MTE0OjA',
                // decodes to <21 chars>:117:0
                Buffer.from('fdUAfZQNXUqFvbUaR7obn:117:0').toString('base64url'),
                // decodes to <22 chars>:118:0
                Buffer.from('fdUAfZQNXUqFvbUaR7obnw:118:0').toString('base64url'),
                // a legacy key with characters that base64url decoding would silently skip
                'ZmRVQWZaUU5YVXFGdmJVYVI3b2JudzoxMTc6MA==',
                ' ZmRVQWZaUU5YVXFGdmJVYVI3b2JudzoxMTc6MA',
            ];
            for (const value of others) {
                assert.equal(Util.mobilePushAppLegacyKeyToId(value), value);
            }
            assert.isNull(Util.mobilePushAppLegacyKeyToId(null));
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

        it('should treat equal complex metadata values as unchanged', () => {
            const definitionBackup = MetadataType.definition;
            MetadataType.definition = {
                ...definitionBackup,
                type: 'test',
                keyField: 'key',
                nameField: 'name',
                fields: {
                    key: { isUpdateable: true },
                    name: { isUpdateable: true },
                    complex: { isUpdateable: true },
                },
            };

            assert.isFalse(
                MetadataType.hasChangedGeneric(
                    { key: 'one', name: 'One', complex: { nested: [1, { value: true }] } },
                    { key: 'one', name: 'One', complex: { nested: [1, { value: true }] } },
                    undefined,
                    true
                )
            );

            MetadataType.definition = definitionBackup;
        });

        it('should treat unequal complex metadata values as changed', () => {
            const definitionBackup = MetadataType.definition;
            MetadataType.definition = {
                ...definitionBackup,
                type: 'test',
                keyField: 'key',
                nameField: 'name',
                fields: {
                    key: { isUpdateable: true },
                    name: { isUpdateable: true },
                    complex: { isUpdateable: true },
                },
            };

            assert.isTrue(
                MetadataType.hasChangedGeneric(
                    { key: 'one', name: 'One', complex: { nested: [1, { value: true }] } },
                    { key: 'one', name: 'One', complex: { nested: [1, { value: false }] } },
                    undefined,
                    true
                )
            );

            MetadataType.definition = definitionBackup;
        });
    });
});
