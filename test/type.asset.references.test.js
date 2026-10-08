import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import Asset from '../lib/metadataTypes/Asset.js';
import cache from '../lib/util/cache.js';

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
