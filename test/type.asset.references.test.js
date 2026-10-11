import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import fixtureFs from 'fs-extra';
import handler from '../lib/index.js';
import Asset from '../lib/metadataTypes/Asset.js';
import cache from '../lib/util/cache.js';
import { mock } from 'node:test';
import TriggeredSend from '../lib/metadataTypes/TriggeredSend.js';
import Folder from '../lib/metadataTypes/Folder.js';
import List from '../lib/metadataTypes/List.js';
import SendClassification from '../lib/metadataTypes/SendClassification.js';
import SenderProfile from '../lib/metadataTypes/SenderProfile.js';
import * as testUtils from './utils.js';
import { Util } from '../lib/util/util.js';
import { handleRESTRequest, restUrl } from './resourceFactory.js';

// Access the private traversal helper directly for focused regression assertions.
const findEmails = Asset['_findEmailsUsingBlock'].bind(Asset);
const asset = Asset;

const references = {
    key: new Set(['target-key']),
    id: new Set(['123']),
    name: new Set([String.raw`Content Builder\Blocks\Target`]),
};

/**
 * Evaluate the complete dependency query, including compound cursor predicates.
 *
 * @param {object} query REST filter
 * @param {object} candidate asset candidate
 * @returns {boolean} Whether the candidate matches
 */
function matchesQuery(query, candidate) {
    if (query.logicalOperator === 'OR') {
        return (
            matchesQuery(query.leftOperand, candidate) ||
            matchesQuery(query.rightOperand, candidate)
        );
    }
    if (query.logicalOperator === 'AND') {
        return (
            matchesQuery(query.leftOperand, candidate) &&
            matchesQuery(query.rightOperand, candidate)
        );
    }
    if (query.property === 'id' && query.simpleOperator === 'greaterThan') {
        return candidate.id > query.value;
    }
    assert.equal(query.property, 'content');
    assert.equal(query.simpleOperator, 'mustContain');
    return candidate.content.includes(query.value);
}

/**
 * Send a predicate directly through the real fixture router.
 *
 * @param {object} query query predicate
 * @returns {Promise.<Array>} HTTP status and fixture response
 */
function request(query) {
    return handleRESTRequest({
        method: 'post',
        baseURL: restUrl,
        url: '/asset/v1/content/assets/query',
        headers: { Authorization: 'Bearer 9999999' },
        data: JSON.stringify({ query }),
    });
}

describe('Asset reverse-reference fixture routing', () => {
    const contentQuery = {
        leftOperand: {
            leftOperand: {
                property: 'content',
                simpleOperator: 'mustContain',
                value: 'ContentBlockByKey',
            },
            logicalOperator: 'OR',
            rightOperand: {
                property: 'content',
                simpleOperator: 'mustContain',
                value: 'ContentBlockById',
            },
        },
        logicalOperator: 'OR',
        rightOperand: {
            property: 'content',
            simpleOperator: 'mustContain',
            value: 'ContentBlockByName',
        },
    };

    it('evaluates all content branches and the optional ID cursor', async () => {
        const query = structuredClone(contentQuery);
        const [status, body] = await request(query);
        assert.equal(status, 200);
        assert.equal(JSON.parse(body).items[0].id, 317008);
        assert.deepEqual(query, contentQuery, 'Routing must not mutate the predicate');
        for (const cursor of [317007, 317008, 317009]) {
            const [cursorStatus, cursorBody] = await request({
                leftOperand: contentQuery,
                logicalOperator: 'AND',
                rightOperand: { property: 'id', simpleOperator: 'greaterThan', value: cursor },
            });
            assert.equal(cursorStatus, 200);
            const response = JSON.parse(cursorBody);
            assert.equal(response.count, cursor < 317008 ? 1 : 0);
            assert.equal(response.items.length, response.count);
        }
    });

    it('filters unrelated fixture content while retaining each supported reference token', async () => {
        const fixtureRead = mock.method(fixtureFs, 'readFile', async () =>
            JSON.stringify({
                items: [
                    { id: 1, content: 'Unrelated content' },
                    { id: 2, views: { html: { content: 'ContentBlockByKey("key")' } } },
                    { id: 3, content: 'ContentBlockById(123)' },
                    { id: 4, slots: { block: { content: 'ContentBlockByName("name")' } } },
                ],
                count: 4,
            })
        );
        try {
            const [status, body] = await request(contentQuery);
            assert.equal(status, 200);
            assert.deepEqual(
                JSON.parse(body).items.map((item) => item.id),
                [2, 3, 4]
            );
            assert.equal(JSON.parse(body).count, 3);
        } finally {
            fixtureRead.mock.restore();
        }
    });

    it('rejects partial and malformed predicates instead of routing the rightmost token', async () => {
        const missingBranch = structuredClone(contentQuery);
        delete missingBranch.leftOperand;
        const wrongContent = structuredClone(contentQuery);
        wrongContent.leftOperand.leftOperand.property = 'name';
        const wrongOperator = structuredClone(contentQuery);
        wrongOperator.leftOperand.logicalOperator = 'AND';
        const duplicateToken = structuredClone(contentQuery);
        duplicateToken.leftOperand.rightOperand.value = 'ContentBlockByKey';
        for (const query of [
            contentQuery.rightOperand,
            { logicalOperator: 'OR', rightOperand: contentQuery.rightOperand },
            missingBranch,
            wrongContent,
            wrongOperator,
            duplicateToken,
            {
                leftOperand: contentQuery,
                logicalOperator: 'XOR',
                rightOperand: contentQuery.rightOperand,
            },
            ...['equal', 'greaterThan'].map((simpleOperator) => ({
                leftOperand: contentQuery,
                logicalOperator: 'AND',
                rightOperand: { property: 'id', simpleOperator, value: '317008' },
            })),
            {
                leftOperand: contentQuery,
                logicalOperator: 'AND',
                rightOperand: { property: 'customerKey', simpleOperator: 'greaterThan', value: 1 },
            },
        ]) {
            const [status, body] = await request(query);
            assert.equal(status, 400, JSON.stringify(query));
            assert.match(JSON.parse(body).message, /Invalid reverse-reference predicate/);
        }
    });

    it('preserves the ordinary assetType selector and cursor fixture routing', async () => {
        const selector = { property: 'assetType.id', simpleOperator: 'in', value: [207, 208] };
        for (const query of [
            selector,
            {
                leftOperand: { property: 'id', simpleOperator: 'greaterThan', value: 1 },
                logicalOperator: 'AND',
                rightOperand: selector,
            },
        ]) {
            const [status, body] = await request(query);
            assert.equal(status, 200);
            assert.ok(JSON.parse(body).items.length > 0);
        }
    });
});

describe('Asset explicit refresh contract', () => {
    beforeEach(() => {
        // Initialize test options before deploy fixtures to keep file logging off in isolated runs.
        testUtils.mockSetup();
        testUtils.mockSetup(true);
        assert.equal(Util.OPTIONS.noLogFile, true);
    });

    afterEach(() => {
        mock.restoreAll();
        testUtils.mockReset();
    });

    it('rejects omitted, null and non-array keys before caching', async () => {
        const caching = mock.method(asset, 'retrieveForCache', async () => {
            assert.fail('Invalid keys must not cache assets');
        });
        // @ts-expect-error Deliberately exercise omitted required keys.
        await assert.rejects(asset.refresh(), /explicit array of keys/);
        await assert.rejects(asset.refresh(null), /explicit array of keys/);
        // @ts-expect-error Deliberately exercise invalid caller input.
        await assert.rejects(asset.refresh('email'), /explicit array of keys/);
        assert.equal(caching.mock.callCount(), 0);
        assert.equal(testUtils.getAPIHistoryLength(), 0);
    });

    it('returns an empty selection without caching or requests', async () => {
        const caching = mock.method(asset, 'retrieveForCache', async () => {
            assert.fail('Empty keys must not cache assets');
        });
        assert.deepEqual(await asset.refresh([]), []);
        assert.equal(caching.mock.callCount(), 0);
        assert.equal(testUtils.getAPIHistoryLength(), 0);
    });

    it('returns no matches after caching local and shared assets with undefined subtypes', async () => {
        const caching = mock.method(asset, 'retrieveForCache', async () => ({
            metadata: {},
            type: 'asset',
        }));
        const refresh = mock.method(TriggeredSend, 'refresh', async () => {
            assert.fail('No matching emails must not refresh any sends');
        });
        cache.initCache({ mid: 9999999, eid: 9999999 });
        assert.deepEqual(await asset.refresh(['missing']), []);
        assert.deepEqual(
            caching.mock.calls.map((call) => call.arguments),
            [
                [undefined, undefined, undefined, false],
                [undefined, undefined, undefined, true],
            ]
        );
        assert.equal(refresh.mock.callCount(), 0);
    });

    it('resolves name-only dependent emails from explicit keys with a cold folder cache', async () => {
        const block = {
            customerKey: 'target-key',
            name: 'Target',
            category: { id: 9 },
            assetType: { name: 'htmlblock' },
        };
        const emails = ['Target', 'Unrelated'].map((name) => ({
            customerKey: `email-${name}`,
            assetType: { name: 'htmlemail' },
            content: `ContentBlockByName("Content Builder\\Blocks\\${name}")`,
        }));
        const originalClient = asset.client;
        const originalBu = asset.buObject;
        asset.buObject = { mid: 9999999, eid: 9999999 };
        cache.initCache(asset.buObject);
        mock.method(asset, 'retrieveForCache', async () => ({
            type: 'asset',
            metadata: { 'target-key': block },
        }));
        const folders = mock.method(Folder, 'retrieveForCache', async () => {
            assert.equal(Folder.client, asset.client);
            assert.equal(Folder.buObject, asset.buObject);
            assert.equal(Folder.properties, asset.properties);
            return {
                type: 'folder',
                metadata: {
                    blocks: { ID: 9, Path: 'Content Builder/Blocks', Client: { ID: 9999999 } },
                },
            };
        });
        // @ts-expect-error Observe selected emails without issuing triggered-send mutations.
        mock.method(asset, '_refreshTriggeredSend', async (items) =>
            items.map((item) => item.customerKey)
        );
        asset.client = {
            // @ts-expect-error Minimal REST transport implements only dependency discovery.
            rest: { post: async () => ({ items: emails }) },
        };
        try {
            assert.equal(cache.getCache().folder, undefined);
            assert.deepEqual(await asset.refresh(['target-key']), ['email-Target']);
            assert.deepEqual(folders.mock.calls[0].arguments, [null, ['asset', 'asset-shared']]);
            assert.deepEqual(block.category, { id: 9 }, 'Name resolution must not mutate targets');
            assert.deepEqual(await asset.refresh(['target-key']), ['email-Target']);
            assert.equal(folders.mock.callCount(), 1, 'A warm folder cache must be reused');
        } finally {
            asset.client = originalClient;
            asset.buObject = originalBu;
        }
    });

    it('returns no legacy email IDs without discovering triggered sends', async () => {
        const discovery = mock.method(TriggeredSend, 'findRefreshableItems', async () => {
            assert.fail('No legacy IDs must not discover sends');
        });
        assert.deepEqual(await asset['_refreshTriggeredSend']({ email: {} }), []);
        assert.equal(discovery.mock.callCount(), 0);
    });

    it('refreshes exactly two JOURNEY sends for two dependent emails, excluding unrelated and inactive sends', async () => {
        const block = { customerKey: 'target-key', assetType: { name: 'htmlblock' } };
        const emails = [101, 102].map((legacyId) => ({
            customerKey: `email-${legacyId}`,
            name: `Email ${legacyId}`,
            assetType: { name: 'htmlemail' },
            legacyData: { legacyId },
            views: { html: { content: 'ContentBlockByKey("target-key")' } },
        }));
        const unrelatedEmail = {
            ...emails[0],
            customerKey: 'unrelated-email',
            legacyData: { legacyId: 103 },
            views: { html: { content: 'ContentBlockByKey("other-key")' } },
        };
        const sends = [
            { CustomerKey: 'JOURNEY-email-101', Email: { ID: 101 }, TriggeredSendStatus: 'Active' },
            { CustomerKey: 'JOURNEY-email-102', Email: { ID: 102 }, TriggeredSendStatus: 'Active' },
            { CustomerKey: 'JOURNEY-unrelated', Email: { ID: 103 }, TriggeredSendStatus: 'Active' },
            {
                CustomerKey: 'JOURNEY-inactive',
                Email: { ID: 101 },
                TriggeredSendStatus: 'Inactive',
            },
        ].map((send) => ({ ...send, Name: send.CustomerKey, CategoryID: 9 }));
        const metadata = Object.fromEntries(
            [block, ...emails, unrelatedEmail].map((item) => [item.customerKey, item])
        );
        cache.initCache({ mid: 9999999, eid: 9999999 });
        mock.method(asset, 'retrieveForCache', async () => ({ type: 'asset', metadata }));
        mock.method(Folder, 'retrieveForCache', async () => ({
            type: 'folder',
            metadata: { journey: { ID: 9, Path: 'Journey Builder Sends/Example' } },
        }));
        for (const dependency of [List, SendClassification, SenderProfile]) {
            mock.method(dependency, 'retrieveForCache', async () => ({
                type: dependency.definition.type,
                metadata: {},
            }));
        }
        const originalClient = asset.client;
        const foundEmails = [];
        const discoveryStatuses = [];
        const checkedKeys = [];
        const updates = [];
        const originalRefreshEmails = asset['_refreshTriggeredSend'];
        // @ts-expect-error Observe the private helper while retaining its real filtering behavior.
        mock.method(asset, '_refreshTriggeredSend', async (items) => {
            foundEmails.push(...items.map((item) => item.customerKey));
            return originalRefreshEmails.call(asset, items);
        });
        asset.client = {
            // @ts-expect-error Minimal REST transport implements only dependency discovery.
            rest: { post: async () => ({ items: [...emails, emails[0], unrelatedEmail] }) },
            // @ts-expect-error Minimal SOAP transport implements only retrieval and refresh.
            soap: {
                retrieveBulk: async (type, fields, params) => {
                    assert.equal(type, 'TriggeredSendDefinition');
                    const filter = params.filter;
                    if (filter.leftOperand === 'TriggeredSendStatus') {
                        assert.equal(filter.operator, 'IN');
                        discoveryStatuses.push([...filter.rightOperand]);
                        // Honor the real discovery predicate rather than preselecting matching IDs.
                        return structuredClone(
                            sends.filter((send) =>
                                filter.rightOperand.includes(send.TriggeredSendStatus)
                            )
                        );
                    }
                    assert.equal(filter.leftOperand, 'CustomerKey');
                    assert.equal(filter.operator, 'equals');
                    checkedKeys.push(filter.rightOperand);
                    return structuredClone(
                        sends.filter((send) => send.CustomerKey === filter.rightOperand)
                    );
                },
                update: async (type, item) => {
                    assert.equal(type, 'TriggeredSendDefinition');
                    updates.push(structuredClone(item));
                    return { OverallStatus: 'OK' };
                },
            },
        };
        try {
            assert.deepEqual((await asset.refresh(['target-key'])).toSorted(), [
                'JOURNEY-email-101',
                'JOURNEY-email-102',
            ]);
            assert.deepEqual(foundEmails, ['email-101', 'email-102']);
            assert.deepEqual(discoveryStatuses, [['dummy', 'Active']]);
            assert.deepEqual(checkedKeys.toSorted(), ['JOURNEY-email-101', 'JOURNEY-email-102']);
            for (const key of checkedKeys) {
                assert.deepEqual(
                    updates.filter((item) => item.CustomerKey === key),
                    [
                        { CustomerKey: key, TriggeredSendStatus: 'Inactive' },
                        { CustomerKey: key, RefreshContent: 'true' },
                        { CustomerKey: key, TriggeredSendStatus: 'Active' },
                    ]
                );
            }
            assert.equal(updates.length, 6);
            assert.equal(process.exitCode, 0);
        } finally {
            asset.client = originalClient;
        }
    });

    it('filters sends by legacy ID and returns successful refresh keys', async () => {
        const discovery = mock.method(TriggeredSend, 'findRefreshableItems', async () => ({
            type: 'triggeredSend',
            metadata: { matching: { Email: { ID: 123 } }, unrelated: { Email: { ID: 456 } } },
        }));
        const validation = mock.method(TriggeredSend, 'getKeysForValidTSDs', async (metadata) =>
            Object.keys(metadata)
        );
        const refresh = mock.method(TriggeredSend, 'refresh', async (keys) => keys);
        assert.deepEqual(
            await asset['_refreshTriggeredSend']({ email: { legacyData: { legacyId: 123 } } }),
            ['matching']
        );
        assert.deepEqual(discovery.mock.calls[0].arguments, [true]);
        assert.deepEqual(Object.keys(validation.mock.calls[0].arguments[0]), ['matching']);
        assert.deepEqual(refresh.mock.calls[0].arguments, [['matching']]);
    });

    it('does not call refresh-all when no matching or valid sends remain', async () => {
        mock.method(TriggeredSend, 'findRefreshableItems', async () => ({
            type: 'triggeredSend',
            metadata: { unrelated: { Email: { ID: 456 } } },
        }));
        const validation = mock.method(TriggeredSend, 'getKeysForValidTSDs', async () => []);
        const refresh = mock.method(TriggeredSend, 'refresh', async () => {
            assert.fail('Empty selection must never reach refresh');
        });
        assert.deepEqual(
            await asset['_refreshTriggeredSend']({ email: { legacyData: { legacyId: 123 } } }),
            []
        );
        assert.deepEqual(validation.mock.calls[0].arguments, [{}]);
        assert.equal(refresh.mock.callCount(), 0);
    });

    it('propagates triggered-send discovery and refresh exceptions', async () => {
        const failure = new Error('Triggered send unavailable');
        const metadata = { email: { legacyData: { legacyId: 123 } } };
        const discovery = mock.method(TriggeredSend, 'findRefreshableItems', async () => {
            throw failure;
        });
        await assert.rejects(
            asset['_refreshTriggeredSend'](metadata),
            (error) => error === failure
        );
        discovery.mock.mockImplementation(async () => ({
            type: 'triggeredSend',
            metadata: { matching: { Email: { ID: 123 } } },
        }));
        mock.method(TriggeredSend, 'getKeysForValidTSDs', async () => ['matching']);
        mock.method(TriggeredSend, 'refresh', async () => {
            throw failure;
        });
        await assert.rejects(
            asset['_refreshTriggeredSend'](metadata),
            (error) => error === failure
        );
    });

    it('returns no valid matching sends without calling refresh', async () => {
        mock.method(TriggeredSend, 'findRefreshableItems', async () => ({
            type: 'triggeredSend',
            metadata: { matching: { Email: { ID: 123 } } },
        }));
        mock.method(TriggeredSend, 'getKeysForValidTSDs', async () => []);
        const refresh = mock.method(TriggeredSend, 'refresh', async () => {
            assert.fail('No valid sends must not refresh');
        });
        assert.deepEqual(
            await asset['_refreshTriggeredSend']({ email: { legacyData: { legacyId: 123 } } }),
            []
        );
        assert.equal(refresh.mock.callCount(), 0);
    });

    it('retains individual send failures and returns only successful refreshes', async () => {
        mock.method(TriggeredSend, 'findRefreshableItems', async () => ({
            type: 'triggeredSend',
            metadata: { good: { Email: { ID: 123 } }, bad: { Email: { ID: 123 } } },
        }));
        mock.method(TriggeredSend, 'getKeysForValidTSDs', async () => ['good', 'bad']);
        mock.method(TriggeredSend, '_refreshItem', async (key) => {
            if (key === 'bad') {
                Util.logger.error('Failed to refresh bad triggered send');
                return false;
            }
            return true;
        });
        assert.deepEqual(
            await asset['_refreshTriggeredSend']({ email: { legacyData: { legacyId: 123 } } }),
            ['good']
        );
        assert.equal(process.exitCode, 1);
    });

    it('propagates asset cache failures before discovering dependencies', async () => {
        const failure = new Error('Asset cache unavailable');
        mock.method(asset, 'retrieveForCache', async () => {
            throw failure;
        });
        await assert.rejects(asset.refresh(['email']), (error) => error === failure);
    });

    it('reports block discovery failures through the refresh handler', async () => {
        // @ts-expect-error Exercise the private discovery helper's failure path.
        mock.method(asset, '_findEmailsUsingBlock', async () => {
            throw new Error('Block discovery unavailable');
        });
        const result = await handler.refresh(
            'testInstance/testBU',
            ['asset'],
            ['testExisting_block_refresh']
        );
        assert.deepEqual(result['testInstance/testBU'].asset, []);
        assert.equal(process.exitCode, 1);
    });

    it('reports refresh discovery failure through the handler failure signal', async () => {
        mock.method(TriggeredSend, 'findRefreshableItems', async () => {
            throw new Error('Discovery unavailable');
        });
        const result = await handler.refresh(
            'testInstance/testBU',
            ['asset'],
            ['testExisting_email_block_refresh']
        );
        assert.deepEqual(result['testInstance/testBU'].asset, []);
        assert.equal(process.exitCode, 1);
    });

    it('reports deploy refresh failure after the asset was updated', async () => {
        handler.setOptions({ refresh: true });
        mock.method(TriggeredSend, 'findRefreshableItems', async () => {
            throw new Error('Discovery unavailable');
        });
        const result = await handler.deploy(
            'testInstance/testBU',
            ['asset'],
            ['testExisting_block_refresh']
        );
        assert.equal(process.exitCode, 1);
        assert.equal(result['testInstance/testBU'], undefined);
        assert.ok(
            testUtils.getRestCallout('patch', '/asset/v1/content/assets/%'),
            'The asset update must have completed before the refresh failure'
        );
    });

    it('skips refresh for create-only deployments and propagates failures for updates', async () => {
        handler.setOptions({ refresh: true });
        const refresh = mock.method(asset, 'refresh', async () => {
            throw new Error('Refresh failed');
        });
        await asset.postDeployTasks({ email: {} }, {}, { created: 1, updated: 0 });
        assert.equal(refresh.mock.callCount(), 0);
        await assert.rejects(
            asset.postDeployTasks({ email: {} }, {}, { created: 0, updated: 1 }),
            /Refresh failed/
        );
        assert.deepEqual(refresh.mock.calls[0].arguments, [['email']]);
        assert.equal(Util.OPTIONS.refresh, true);
    });
});

describe('Asset reverse content block references', () => {
    let originalClient;
    let originalBu;

    beforeEach(() => {
        originalClient = asset.client;
        originalBu = asset.buObject;
    });

    afterEach(() => {
        asset.client = originalClient;
        asset.buObject = originalBu;
    });

    it('matches exact literals with quotes, whitespace and optional arguments', () => {
        for (const content of [
            'ContentBlockByKey("target-key")',
            "contentblockbykey ( 'target-key' , 'region', false)",
            'ContentBlockById(123)',
            'ContentBlockById( "123" , "region")',
            "ContentBlockById( '123' )",
            String.raw`ContentBlockByName("Content Builder\Blocks\Target")`,
            String.raw`ContentBlockByName( 'Content Builder\Blocks\Target' , 'region')`,
            String.raw`Platform.Function.ContentBlockByName("Content Builder\\Blocks\\Target")`,
        ]) {
            assert.equal(asset._hasLiteralBlockReference(content, references), true, content);
        }
    });

    it('rejects prefixes, partial names and dynamic first arguments', () => {
        for (const content of [
            'ContentBlockByKey("target-key-extra")',
            'ContentBlockById(1234)',
            'ContentBlockByName("Target")',
            String.raw`ContentBlockByName("Content Builder\Blocks\TargetExtra")`,
            'OtherContentBlockByKey("target-key")',
            'ContentBlockByKey(@key)',
            'ContentBlockByKey(Concat("target-key", ""))',
            'ContentBlockByKey("target-key" + suffix)',
            'ContentBlockById(123 + 1)',
            'ContentBlockById("123x")',
            'ContentBlockByKey(123)',
        ]) {
            assert.equal(asset._hasLiteralBlockReference(content, references), false, content);
        }
    });

    it('verifies the existing nested refresh fixture without fetching full assets', async () => {
        const response = JSON.parse(
            await fs.readFile(
                new URL(
                    'resources/9999999/asset/v1/content/assets/query/post-response-contentMUSTCONTAINtestExisting_block_refresh.json',
                    import.meta.url
                ),
                'utf8'
            )
        );
        /** @type {import('../types/mcdev.d.js').AssetRequestParams} */
        let payload;
        asset.client = {
            // @ts-expect-error Minimal REST mock implements only exercised operations.
            rest: {
                post: async (uri, body) => {
                    assert.equal(uri, '/asset/v1/content/assets/query');
                    payload = structuredClone(body);
                    return response;
                },
                get: async () => assert.fail('Nested content must not require a full fetch'),
            },
        };
        const found = await findEmails([{ customerKey: 'testExisting_block_refresh' }]);
        assert.deepEqual(Object.keys(found), ['testExisting_email_block_refresh']);
        assert.ok(payload);
        assert.deepEqual(payload.query, {
            leftOperand: {
                leftOperand: {
                    property: 'content',
                    simpleOperator: 'mustContain',
                    value: 'ContentBlockByKey',
                },
                logicalOperator: 'OR',
                rightOperand: {
                    property: 'content',
                    simpleOperator: 'mustContain',
                    value: 'ContentBlockById',
                },
            },
            logicalOperator: 'OR',
            rightOperand: {
                property: 'content',
                simpleOperator: 'mustContain',
                value: 'ContentBlockByName',
            },
        });
    });

    it('collects content from all views and recursively nested slots and blocks', () => {
        assert.deepEqual(
            asset._getReferenceContents({
                content: 'root',
                views: {
                    html: {
                        content: 'html',
                        slots: {
                            main: {
                                blocks: {
                                    one: {
                                        slots: { inner: { blocks: { two: { content: 'deep' } } } },
                                    },
                                    three: { views: { text: { content: 'nested view' } } },
                                },
                            },
                        },
                    },
                    text: { content: 'text' },
                },
            }),
            ['root', 'html', 'deep', 'nested view', 'text']
        );
    });

    it('fetches only candidates without content and rejects unrelated candidates', async () => {
        const fetched = [];
        asset.client = {
            // @ts-expect-error Minimal REST mock implements only exercised operations.
            rest: {
                post: async () => ({
                    items: [
                        { id: 1, customerKey: 'summary', assetType: { name: 'htmlemail' } },
                        {
                            id: 2,
                            customerKey: 'false-positive',
                            assetType: { name: 'htmlemail' },
                            content: 'ContentBlockById(1234)',
                        },
                        {
                            id: 3,
                            customerKey: 'empty',
                            assetType: { name: 'htmlemail' },
                            content: '',
                        },
                    ],
                }),
                get: async (uri) => {
                    fetched.push(uri);
                    return {
                        id: 1,
                        customerKey: 'summary',
                        assetType: { name: 'htmlemail' },
                        views: { html: { content: "ContentBlockById('123', 'region')" } },
                    };
                },
            },
        };
        assert.deepEqual(Object.keys(await findEmails([{ customerKey: 'target-key', id: 123 }])), [
            'summary',
        ]);
        assert.deepEqual(fetched, ['/asset/v1/content/assets/1']);
    });

    it('uses folder cache paths without mutating targets', async () => {
        asset.buObject = { mid: 987654321, eid: 987654321 };
        cache.initCache(asset.buObject);
        cache.setMetadata('folder', {
            folder: { ID: 9, Path: 'Content Builder/Blocks', Client: { ID: 987654321 } },
        });
        const target = { customerKey: 'target-key', name: 'Target', category: { id: 9 } };
        asset.client = {
            // @ts-expect-error Minimal REST mock implements only exercised operations.
            rest: {
                post: async () => ({
                    items: [
                        {
                            customerKey: 'full-path',
                            assetType: { name: 'htmlemail' },
                            content: String.raw`ContentBlockByName("Content Builder\Blocks\Target")`,
                        },
                        {
                            customerKey: 'bare-name',
                            assetType: { name: 'htmlemail' },
                            content: 'ContentBlockByName("Target")',
                        },
                    ],
                }),
            },
        };
        try {
            assert.deepEqual(Object.keys(await findEmails([target])), ['full-path']);
            assert.deepEqual(target.category, { id: 9 });
            assert.equal(target.r__folder_Path, undefined);
        } finally {
            cache.clearCache(987654321);
        }
    });

    it('preserves the dependency predicate and ascending ID cursor after shard failure', async () => {
        const candidates = [
            { id: 30, customerKey: 'later', content: 'ContentBlockByKey("target-key")' },
            { id: 10, customerKey: 'first', content: 'ContentBlockByKey("target-key")' },
            { id: 20, customerKey: 'unrelated', content: 'Unrelated content' },
            { id: 40, customerKey: 'false-positive', content: 'ContentBlockByKey("other-key")' },
        ].map((item) => ({ ...item, assetType: { name: 'htmlemail' } }));
        const requests = [];
        const returnedIds = [];
        asset.client = {
            // @ts-expect-error Minimal REST mock implements only exercised operations.
            rest: {
                post: async (uri, body) => {
                    assert.equal(uri, '/asset/v1/content/assets/query');
                    assert.deepEqual(body.sort, [{ property: 'id', direction: 'ASC' }]);
                    requests.push(structuredClone(body));
                    if (requests.length === 2) {
                        return { message: 'all shards failed' };
                    }
                    const matches = candidates
                        .filter((item) => matchesQuery(body.query, item))
                        .toSorted((a, b) => a.id - b.id);
                    const pageSize = 1;
                    const items = matches.slice(body.page.page - 1, body.page.page);
                    returnedIds.push(...items.map((item) => item.id));
                    return { items, count: matches.length, page: body.page.page, pageSize };
                },
                get: async () => assert.fail('Unrelated candidates must never be fetched'),
            },
        };
        assert.deepEqual(Object.keys(await findEmails([{ customerKey: 'target-key' }])), [
            'first',
            'later',
        ]);
        assert.deepEqual(returnedIds, [10, 30, 40]);
        assert.equal(requests.length, 4);
        assert.deepEqual(
            requests.map((request) => request.page.page),
            [1, 2, 1, 2]
        );
        assert.deepEqual(requests[2].query, {
            leftOperand: requests[0].query,
            logicalOperator: 'AND',
            rightOperand: { property: 'id', simpleOperator: 'greaterThan', value: 10 },
        });
        assert.deepEqual(requests[3].query, requests[2].query);
    });

    it('rejects first-page shard failure without a usable cursor', async () => {
        let calls = 0;
        asset.client = {
            // @ts-expect-error Minimal REST mock implements only exercised operations.
            rest: {
                post: async () => {
                    calls++;
                    return { message: 'all shards failed' };
                },
            },
        };
        await assert.rejects(
            findEmails([{ customerKey: 'target-key' }]),
            /all shards failed without a usable ID cursor/
        );
        assert.equal(calls, 1);
    });

    it('propagates query exceptions instead of returning collected partial results', async () => {
        const failure = new Error('Query unavailable');
        let calls = 0;
        asset.client = {
            // @ts-expect-error Minimal REST mock implements only exercised operations.
            rest: {
                post: async () => {
                    if (++calls === 2) {
                        throw failure;
                    }
                    return {
                        items: [
                            {
                                id: 10,
                                customerKey: 'partial',
                                assetType: { name: 'htmlemail' },
                                content: 'ContentBlockByKey("target-key")',
                            },
                        ],
                        count: 2,
                        page: 1,
                        pageSize: 1,
                    };
                },
            },
        };
        await assert.rejects(
            findEmails([{ customerKey: 'target-key' }]),
            (error) => error === failure
        );
        assert.equal(calls, 2);
    });

    it('follows C to B to A to an email without selecting unrelated branches', async () => {
        const candidates = [
            {
                customerKey: 'B',
                assetType: { name: 'htmlblock' },
                content: 'ContentBlockByKey("C")',
            },
            {
                customerKey: 'A',
                assetType: { name: 'htmlblock' },
                content: 'ContentBlockByKey("B")',
            },
            {
                customerKey: 'email',
                assetType: { name: 'htmlemail' },
                content: 'ContentBlockByKey("A")',
            },
            {
                customerKey: 'unrelated',
                assetType: { name: 'htmlemail' },
                content: 'ContentBlockByKey("other")',
            },
        ];
        let calls = 0;
        asset.client = {
            // @ts-expect-error Minimal REST transport returns the same candidate universe at each depth.
            rest: {
                post: async () => {
                    assert.ok(
                        ++calls <= 3,
                        'Traversal must terminate after the three block levels'
                    );
                    return { items: structuredClone(candidates) };
                },
                get: async () => assert.fail('Complete candidates need no full asset fetch'),
            },
        };
        const searched = new Set();
        const found = await findEmails([{ customerKey: 'C' }], {}, searched);
        assert.deepEqual(Object.keys(found), ['email']);
        assert.deepEqual(found.email, candidates[2]);
        assert.deepEqual([...searched], ['C', 'B', 'A']);
        assert.equal(calls, 3);
    });

    it('terminates a C B A C cycle and deduplicates an email reachable from multiple blocks', async () => {
        const candidates = [
            {
                customerKey: 'C',
                assetType: { name: 'htmlblock' },
                content: 'ContentBlockByKey("A")',
            },
            {
                customerKey: 'B',
                assetType: { name: 'htmlblock' },
                content: 'ContentBlockByKey("C")',
            },
            {
                customerKey: 'A',
                assetType: { name: 'htmlblock' },
                content: 'ContentBlockByKey("B")',
            },
            {
                customerKey: 'email',
                assetType: { name: 'htmlemail' },
                content: 'ContentBlockByKey("B") ContentBlockByKey("A")',
            },
            {
                customerKey: 'unrelated',
                assetType: { name: 'htmlemail' },
                content: 'ContentBlockByKey("other")',
            },
        ];
        let calls = 0;
        asset.client = {
            // @ts-expect-error Minimal REST transport deliberately includes duplicate candidates and a cycle.
            rest: {
                post: async () => {
                    assert.ok(++calls <= 3, 'Cycle must not cause a fourth query');
                    return { items: structuredClone([...candidates, ...candidates]) };
                },
            },
        };
        const searched = new Set();
        const found = await findEmails([{ customerKey: 'C' }], {}, searched);
        assert.deepEqual(Object.keys(found), ['email']);
        assert.deepEqual(found.email, candidates[3]);
        assert.deepEqual([...searched], ['C', 'B', 'A']);
        assert.equal(calls, 3);
    });

    it('retains recursive block traversal and customer-key deduplication', async () => {
        let calls = 0;
        const intermediate = {
            customerKey: 'intermediate',
            assetType: { name: 'htmlblock' },
            content: 'ContentBlockByKey("target-key")',
        };
        const email = {
            customerKey: 'email',
            assetType: { name: 'htmlemail' },
            content: 'ContentBlockByKey("intermediate")',
        };
        asset.client = {
            // @ts-expect-error Minimal REST mock implements only exercised operations.
            rest: {
                post: async () => {
                    calls++;
                    return {
                        items:
                            calls === 1
                                ? [intermediate, intermediate]
                                : [email, email, intermediate],
                    };
                },
            },
        };
        const searched = new Set();
        assert.deepEqual(
            Object.keys(await findEmails([{ customerKey: 'target-key' }], {}, searched)),
            ['email']
        );
        assert.equal(calls, 2);
        assert.deepEqual([...searched], ['target-key', 'intermediate']);
    });
});
