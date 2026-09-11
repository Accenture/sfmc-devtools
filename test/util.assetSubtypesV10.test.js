import { assert } from 'chai';
import AssetDefinition from '../lib/metadataTypes/definitions/Asset.definition.js';
import {
    getAssetSubtypeMigration,
    transformAssetSubtypePath,
} from '../lib/util/migrations/v10/assetSubtypes.js';

const families = [
    {
        names: ['templatebasedemail', 'htmlemail', 'textonlyemail', 'message'],
        oldSubtypes: ['message'],
        newSubtype: 'email',
    },
    { names: ['jsonmessage'], oldSubtypes: ['message', 'asset'], newSubtype: 'mobile' },
    { names: ['webpage', 'webtemplate'], oldSubtypes: ['asset'], newSubtype: 'webstudio' },
    {
        names: ['cloudpages', 'landingpage', 'microsite', 'interactivecontent'],
        oldSubtypes: ['cloudpage'],
        newSubtype: 'webstudio',
    },
    {
        names: [
            'jscoderesource',
            'csscoderesource',
            'jsoncoderesource',
            'rsscoderesource',
            'textcoderesource',
            'xmlcoderesource',
        ],
        oldSubtypes: ['coderesource'],
        newSubtype: 'webstudio',
    },
];

describe('v10 shared asset subtype migration', () => {
    it('covers every historical family using canonical current membership', () => {
        for (const { names, oldSubtypes, newSubtype } of families) {
            for (const name of names) {
                assert.deepEqual(getAssetSubtypeMigration(name), { oldSubtypes, newSubtype });
                const canonical = Object.entries(AssetDefinition.extendedSubTypes).find(
                    ([, members]) => members.includes(name)
                )?.[0];
                assert.equal(canonical === 'message' ? 'email' : canonical, newSubtype);
                for (const oldSubtype of oldSubtypes) {
                    for (const extension of ['json', 'html', 'ssjs', 'amp', 'css', 'xml', 'bin']) {
                        const before = `${oldSubtype}/key/child.asset-${oldSubtype}-meta.${extension}`;
                        const after = `${newSubtype}/key/child.asset-${newSubtype}-meta.${extension}`;
                        assert.equal(transformAssetSubtypePath(name, before), after);
                        assert.equal(transformAssetSubtypePath(name, after), after);
                    }
                }
            }
        }
    });

    it('does not migrate nonmembers, API templates, unknown names, or selectors', () => {
        const mappedNames = new Set(families.flatMap(({ names }) => names));
        const otherNames = Object.values(AssetDefinition.extendedSubTypes)
            .flat()
            .filter((name) => !mappedNames.has(name));
        for (const name of [...otherNames, 'unknown', 'asset-message', 'HTMLEMAIL', 'toString']) {
            assert.isNull(getAssetSubtypeMigration(name), name);
            const path = 'message/key.asset-message-meta.json';
            assert.equal(transformAssetSubtypePath(name, path), path);
        }
    });

    it('returns independent mapping values', () => {
        getAssetSubtypeMigration('htmlemail').oldSubtypes.push('other');
        assert.deepEqual(getAssetSubtypeMigration('htmlemail'), {
            oldSubtypes: ['message'],
            newSubtype: 'email',
        });
    });

    it('preserves observed encoded spellings without using JSON customerKey as a path token', () => {
        for (const key of ['a%2fb', 'a%2Fb', '%252F', 'a.b', '%25', 'ümlaut', ' key ', '%ZZ']) {
            const path = `message/${key}/nested/message/${key}.asset-message-meta.html`;
            const expected = `email/${key}/nested/message/${key}.asset-email-meta.html`;
            assert.equal(transformAssetSubtypePath('htmlemail', path), expected);
        }
    });

    it('supports both partial transitions and unchanged extracted component names', () => {
        assert.equal(
            transformAssetSubtypePath('htmlemail', 'message/key.asset-email-meta.json'),
            'email/key.asset-email-meta.json'
        );
        assert.equal(
            transformAssetSubtypePath('htmlemail', 'email/key.asset-message-meta.json'),
            'email/key.asset-email-meta.json'
        );
        for (const child of ['image.png', 'blocks/child.json', 'body.html', 'message/file.bin']) {
            assert.equal(
                transformAssetSubtypePath('htmlemail', `message/key/${child}`),
                `email/key/${child}`
            );
        }
    });

    it('changes only exact suffixes, never key substrings or backup extensions', () => {
        for (const filename of [
            'key.asset-message-meta.json.bak',
            'key.asset-message-meta.',
            'key.asset-message-meta',
            'key.asset-other-meta.json',
        ]) {
            assert.equal(
                transformAssetSubtypePath('htmlemail', `message/${filename}`),
                `email/${filename}`
            );
        }
        assert.equal(
            transformAssetSubtypePath(
                'htmlemail',
                'message/key.asset-message-meta.json.asset-message-meta.json'
            ),
            'email/key.asset-message-meta.json.asset-email-meta.json'
        );
    });

    it('leaves wrong subtypes, non-asset paths, and non-POSIX or unsafe shapes untouched', () => {
        for (const path of [
            'mobile/key.asset-message-meta.json',
            'asset/key.asset-message-meta.json',
            'retrieve/cred/bu/asset/message/key.asset-message-meta.json',
            'message',
            '/message/key.json',
            'message//key.json',
            'message/../key.json',
            'message/./key.json',
            String.raw`message\key.asset-message-meta.json`,
        ]) {
            assert.equal(transformAssetSubtypePath('htmlemail', path), path);
        }
    });
});
