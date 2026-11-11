import * as chai from 'chai';
const assert = chai.assert;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
import AttributeSet from '../lib/metadataTypes/AttributeSet.js';
import File from '../lib/util/file.js';
chai.use(chaiFiles);

const groupId = '79846c6e-5238-ee11-b85a-48df37d1de8a';
const createUrl = '/hub/v1/contacts/schema/setDefinitions?attributeGroupID=' + groupId;

/**
 * path of a retrieved attributeSet file in the mocked file system
 *
 * @param {string} key attributeSet key
 * @returns {string} path
 */
function retrievePath(key) {
    return `./retrieve/testInstance/testBU/attributeSet/${key}.attributeSet-meta.json`;
}

/**
 * overwrites testExisting_attributeSetLinked in the deploy folder with a modified copy of its retrieved version
 *
 * @param {function(object): void} modify changes applied to the retrieved json
 * @returns {Promise.<void>} -
 */
async function writeLinkedSetForDeploy(modify) {
    const item = await testUtils.getExpectedJson('9999999', 'attributeSet', 'retrieve-linked');
    modify(item);
    await File.outputJson(
        './deploy/testInstance/testBU/attributeSet/testExisting_attributeSetLinked.attributeSet-meta.json',
        item
    );
}

/**
 * minimal deploy item for {@link AttributeSet._sortForDeploy}
 *
 * @param {string} parentKey key of the parent; keys starting with 'group' are treated as attributeGroup
 * @returns {object} attributeSet with one incoming relationship
 */
function setLinkedTo(parentKey) {
    return {
        relationships: [
            {
                leftItem: parentKey.startsWith('group')
                    ? { r__attributeGroup_key: parentKey }
                    : { r__attributeSet_key: parentKey },
            },
        ],
    };
}

/**
 * resolves the keys listed in AttributeSet.definition.dependencyGraph the same way MetadataType.getDependentFiles does
 *
 * @param {object} metadataItem retrieved attributeSet json
 * @returns {Object.<string, string[]>} sorted dependent keys per type
 */
function getDependencies(metadataItem) {
    const result = {};
    for (const depType in AttributeSet.definition.dependencyGraph) {
        result[depType] = AttributeSet.definition.dependencyGraph[depType]
            .flatMap(
                (fieldReference) =>
                    AttributeSet.getNestedValue(metadataItem, fieldReference, depType) || []
            )
            .toSorted();
    }
    return result;
}

describe('type: attributeSet', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });

    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a attributeSet', async () => {
            // WHEN
            const retrieve = await handler.retrieve('testInstance/testBU', ['attributeSet']);

            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            assert.equal(
                retrieve['testInstance/testBU'].attributeSet
                    ? Object.keys(retrieve['testInstance/testBU'].attributeSet).length
                    : 0,
                29,
                'only 29 attributeSets expected in retrieve response'
            );
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.attributeSet ? Object.keys(result.attributeSet).length : 0,
                29,
                'only 29 attributeSets expected in cache'
            );

            assert.deepEqual(
                await testUtils.getActualJson('testExisting_dataExtensionShared', 'attributeSet'),
                await testUtils.getExpectedJson('9999999', 'attributeSet', 'retrieve'),

                'returned metadata was not equal expected'
            );
            // set-to-set relationship is returned by the API on the left set only; mcdev stores it in the file of the set it links in
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_attributeSetLinked', 'attributeSet'),
                await testUtils.getExpectedJson('9999999', 'attributeSet', 'retrieve-linked'),
                'returned metadata of linked set was not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                7,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should resolve shared dataExtensions in attributeSet when retrieved together with dataExtension', async () => {
            // WHEN
            // this test verifies the fix for: shared DEs not resolved if attributeSet+dataExtension is retrieved together
            const retrieve = await handler.retrieve('testInstance/testBU', [
                'dataExtension',
                'attributeSet',
            ]);

            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            assert.equal(
                retrieve['testInstance/testBU'].attributeSet
                    ? Object.keys(retrieve['testInstance/testBU'].attributeSet).length
                    : 0,
                29,
                'only 29 attributeSets expected in retrieve response'
            );
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.attributeSet ? Object.keys(result.attributeSet).length : 0,
                29,
                'only 29 attributeSets expected in cache'
            );

            // verify that shared DE was resolved correctly in attributeSet (this is the key bug fix check)
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_dataExtensionShared', 'attributeSet'),
                await testUtils.getExpectedJson('9999999', 'attributeSet', 'retrieve'),

                'returned metadata was not equal expected - shared DE should be resolved even when dataExtension is retrieved together with attributeSet'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                9,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should retrieve a single attributeSet incl. the relationship stored on its parent set', async () => {
            // WHEN
            const retrieve = await handler.retrieve(
                'testInstance/testBU',
                ['attributeSet'],
                ['testExisting_attributeSetLinked']
            );

            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            assert.deepEqual(
                Object.keys(retrieve['testInstance/testBU'].attributeSet || {}),
                ['testExisting_attributeSetLinked'],
                'only the requested attributeSet expected in retrieve response'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_attributeSetLinked', 'attributeSet'),
                await testUtils.getExpectedJson('9999999', 'attributeSet', 'retrieve-linked'),
                'returned metadata of linked set was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                7,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should find the parent attributeSet and attributeGroup of a linked attributeSet via dependencyGraph', async () => {
            // GIVEN
            await handler.retrieve('testInstance/testBU', ['attributeSet']);
            const linkedSet = await testUtils.getActualJson(
                'testExisting_attributeSetLinked',
                'attributeSet'
            );
            const parentSet = await testUtils.getActualJson(
                'testExisting_dataExtensionShared',
                'attributeSet'
            );

            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            assert.deepEqual(
                getDependencies(linkedSet),
                {
                    dataExtension: ['testExisting_dataExtension'],
                    attributeSet: ['testExisting_dataExtensionShared'],
                    attributeGroup: [],
                },
                'linked set should depend on its parent set'
            );
            assert.deepEqual(
                getDependencies(parentSet),
                {
                    dataExtension: ['testExisting_dataExtensionShared'],
                    attributeSet: [],
                    attributeGroup: ['testExisting_attributeGroup'],
                },
                'parent set should depend on its attributeGroup only'
            );
            return;
        });
    });
    describe('Deploy ================', () => {
        beforeEach(() => {
            testUtils.mockSetup(true);
        });

        it('Should create a new attributeSet linked to an attributeGroup', async () => {
            // WHEN
            const result = await handler.deploy(
                'testInstance/testBU',
                ['attributeSet'],
                ['testNew_attributeSetParent']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            assert.deepEqual(
                Object.keys(result['testInstance/testBU'].attributeSet),
                ['testNew_attributeSetParent'],
                'deploy should have returned the created attributeSet'
            );
            assert.deepEqual(
                testUtils.getRestCallout('post', createUrl),
                await testUtils.getExpectedJson('9999999', 'attributeSet', 'post-callout'),
                'create-payload JSON was not equal expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testNew_attributeSetParent', 'attributeSet'),
                await testUtils.getExpectedJson('9999999', 'attributeSet', 'post'),
                'returned new-JSON was not equal expected for insert attributeSet'
            );
            assert.lengthOf(testUtils.getWriteRequests(), 1, 'expected exactly one create request');
            assert.equal(
                testUtils.getAPIHistoryLength(),
                10,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should keep the previously cached attributeSets after creating a new one', async () => {
            // WHEN
            await handler.deploy(
                'testInstance/testBU',
                ['attributeSet'],
                ['testNew_attributeSetParent']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            const cachedKeys = Object.keys(cache.getCache().attributeSet);
            for (const key of [
                'testNew_attributeSetParent',
                'Contact',
                'testExisting_dataExtensionShared',
                'testExisting_attributeSetLinked',
            ]) {
                assert.include(cachedKeys, key, `attributeSet cache should contain ${key}`);
            }
            return;
        });

        it('Should create an attributeSet linked to another attributeSet created in the same deploy', async () => {
            // WHEN
            // child is listed first to ensure deploy sorts the parent set before it
            const result = await handler.deploy(
                'testInstance/testBU',
                ['attributeSet'],
                ['testNew_attributeSetChild', 'testNew_attributeSetParent']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            assert.deepEqual(
                Object.keys(result['testInstance/testBU'].attributeSet).toSorted(),
                ['testNew_attributeSetChild', 'testNew_attributeSetParent'],
                'deploy should have returned both created attributeSets'
            );
            const creates = testUtils.getRestCallout('post', createUrl, true);
            assert.deepEqual(
                creates.map((body) => body.definitionKey),
                ['testNew_attributeSetParent', 'testNew_attributeSetChild'],
                'parent set should have been created before the child set'
            );
            assert.deepEqual(
                creates[1],
                await testUtils.getExpectedJson('9999999', 'attributeSet', 'post-child-callout'),
                'create-payload JSON of the child set was not equal expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testNew_attributeSetChild', 'attributeSet'),
                await testUtils.getExpectedJson('9999999', 'attributeSet', 'post-child'),
                'returned new-JSON was not equal expected for the child attributeSet'
            );
            assert.lengthOf(
                testUtils.getWriteRequests(),
                2,
                'expected exactly two create requests'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                12,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should skip attributeSets that cannot be deployed with an error', async () => {
            // WHEN
            const { result, messages } = await testUtils.deployCapturing('error', 'attributeSet', [
                'testBlocked_attributeSet_missingDE',
                'testBlocked_attributeSet_missingGroup',
                'testBlocked_attributeSet_system',
                'testBlocked_attributeSet_linkedDE',
                'testBlocked_attributeSet_twoRelationships',
            ]);
            // THEN
            assert.equal(process.exitCode, 1, 'deploy should have thrown an error');
            const expectedErrors = {
                testBlocked_attributeSet_missingDE:
                    "Dependent dataExtension with CustomerKey='testMissing_dataExtension' was not found",
                testBlocked_attributeSet_missingGroup:
                    'attributeGroup testMissing_attributeGroup was not found',
                testBlocked_attributeSet_system: 'system-defined attributeSets cannot be deployed',
                testBlocked_attributeSet_linkedDE:
                    'dataExtension testExisting_dataExtension is already linked by attributeSet testExisting_attributeSetLinked',
                testBlocked_attributeSet_twoRelationships:
                    'exactly one relationship linking this set to an attributeGroup or another attributeSet is required, found 2',
            };
            for (const [key, error] of Object.entries(expectedErrors)) {
                assert.isTrue(
                    messages.some((msg) => msg.includes(key) && msg.includes(error)),
                    `expected error for ${key}: ${error}`
                );
            }
            assert.deepEqual(
                Object.keys(result['testInstance/testBU'].attributeSet || {}),
                [],
                'no attributeSet should have been deployed'
            );
            assert.lengthOf(
                testUtils.getWriteRequests(),
                0,
                'no create/update request should have been made'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                7,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should rename an existing attributeSet', async () => {
            // GIVEN
            await writeLinkedSetForDeploy((item) => {
                item.name = 'testExisting_attributeSetLinked renamed';
            });
            // WHEN
            const result = await handler.deploy(
                'testInstance/testBU',
                ['attributeSet'],
                ['testExisting_attributeSetLinked']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            assert.deepEqual(
                Object.keys(result['testInstance/testBU'].attributeSet),
                ['testExisting_attributeSetLinked'],
                'deploy should have returned the updated attributeSet'
            );
            assert.deepEqual(
                testUtils.getRestCallout(
                    'post',
                    '/hub/v1/contacts/schema/setDefinitions/a1b2c3d4-0000-4000-8000-000000000101/definitionName'
                ),
                { value: 'testExisting_attributeSetLinked renamed' },
                'rename-payload JSON was not equal expected'
            );
            assert.lengthOf(testUtils.getWriteRequests(), 1, 'expected exactly one update request');
            assert.equal(
                testUtils.getAPIHistoryLength(),
                9,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should change the relationship cardinality of an existing attributeSet via its parent set', async () => {
            // GIVEN
            await writeLinkedSetForDeploy((item) => {
                item.relationships[0].rightItem.cardinality = 'One';
            });
            // WHEN
            const result = await handler.deploy(
                'testInstance/testBU',
                ['attributeSet'],
                ['testExisting_attributeSetLinked']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            assert.deepEqual(
                Object.keys(result['testInstance/testBU'].attributeSet),
                ['testExisting_attributeSetLinked'],
                'deploy should have returned the updated attributeSet'
            );
            // set-to-set relationships are stored on the left set
            assert.deepEqual(
                testUtils.getRestCallout(
                    'post',
                    '/hub/v1/contacts/schema/setDefinitions/528b787a-5238-ee11-b85a-48df37d1de8a/relationships/a1b2c3d4-0000-4000-8000-000000000105/items'
                ),
                { leftItem: { cardinality: 'One' }, rightItem: { cardinality: 'One' } },
                'cardinality-payload JSON was not equal expected'
            );
            assert.lengthOf(testUtils.getWriteRequests(), 1, 'expected exactly one update request');
            assert.equal(
                testUtils.getAPIHistoryLength(),
                9,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should warn and not update an existing attributeSet with a changed dataExtension', async () => {
            // GIVEN
            await writeLinkedSetForDeploy((item) => {
                item.r__dataExtension_key = 'testExisting_dataExtension_exclusion';
            });
            // WHEN
            const { messages } = await testUtils.deployCapturing('warn', 'attributeSet', [
                'testExisting_attributeSetLinked',
            ]);
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            assert.lengthOf(
                messages.filter(
                    (msg) =>
                        msg.includes('testExisting_attributeSetLinked') &&
                        msg.includes('linked dataExtension cannot be changed via API')
                ),
                1,
                'expected one warning about the non-updateable dataExtension'
            );
            assert.lengthOf(
                testUtils.getWriteRequests(),
                0,
                'no update request should have been made'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                7,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should skip an unchanged attributeSet without warning', async () => {
            // WHEN
            const { messages } = await testUtils.deployCapturing('warn', 'attributeSet', [
                'testExisting_attributeSetLinked',
            ]);
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            assert.lengthOf(
                messages.filter((msg) => msg.includes('testExisting_attributeSetLinked')),
                0,
                'no warning expected for an unchanged attributeSet'
            );
            assert.lengthOf(
                testUtils.getWriteRequests(),
                0,
                'no update request should have been made'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                7,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should sort attributeSets after their parent set and skip circular relationships', () => {
            // GIVEN
            const metadataMap = {
                cycleA: setLinkedTo('cycleB'),
                cycleB: setLinkedTo('cycleA'),
                child: setLinkedTo('parent'),
                parent: setLinkedTo('group'),
            };
            // WHEN
            const sorted = AttributeSet._sortForDeploy(metadataMap);
            // THEN
            assert.deepEqual(
                Object.keys(sorted),
                ['parent', 'child'],
                'parent set should come first and circular sets should be skipped'
            );
            assert.equal(process.exitCode, 1, 'circular relationships should signal an error');
            return;
        });
    });

    describe('Delete ================', () => {
        const setUrl = '/hub/v1/contacts/schema/setDefinitions/';

        it('Should delete an attributeSet incl. the local file of the attributeSet linked in only through it', async () => {
            // GIVEN
            for (const key of [
                'testExisting_dataExtensionShared',
                'testExisting_attributeSetLinked',
                'Contact',
            ]) {
                await File.outputJson(retrievePath(key), { definitionKey: key });
            }
            // WHEN
            const { result, messages } = await testUtils.deleteCapturing(
                'warn',
                'attributeSet',
                'testExisting_dataExtensionShared'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deleteByKey should not have thrown an error');
            assert.isTrue(result, 'deleteByKey should have returned true');
            assert.deepEqual(
                messages,
                [
                    ' - deleting attributeSet testExisting_dataExtensionShared also deletes the following attributeSets that are only linked in through it: testExisting_attributeSetLinked',
                    ' - the retrieved attributeGroup that held attributeSet testExisting_dataExtensionShared is now outdated; re-retrieve attributeGroup',
                ],
                'expected the cascade and the stale-group warnings'
            );
            assert.deepEqual(
                testUtils.getWriteRequests().map((call) => call.method + ' ' + call.url),
                [
                    'delete ' +
                        setUrl +
                        '528b787a-5238-ee11-b85a-48df37d1de8a?attributeGroupID=' +
                        groupId,
                ],
                'expected exactly one DELETE request incl. the owning attributeGroup'
            );
            for (const key of [
                'testExisting_dataExtensionShared',
                'testExisting_attributeSetLinked',
            ]) {
                assert.isFalse(
                    await File.pathExists(retrievePath(key)),
                    `attributeSet ${key} should have been removed locally`
                );
            }
            assert.isTrue(
                await File.pathExists(retrievePath('Contact')),
                'unrelated attributeSet should have been kept'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                3,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should treat an attributeSet deleted together with its parent set in the same command as deleted', async () => {
            // WHEN
            const { result, messages } = await testUtils.deleteCapturing('info', 'attributeSet', [
                'testExisting_dataExtensionShared',
                'testExisting_attributeSetLinked',
            ]);
            // THEN
            assert.equal(process.exitCode, 0, 'deleteByKey should not have thrown an error');
            assert.isTrue(result, 'deleteByKey should have returned true');
            assert.isTrue(
                messages.includes(
                    ' - attributeSet testExisting_attributeSetLinked was already deleted together with its parent'
                ),
                'expected an info message about the cascade-deleted attributeSet'
            );
            assert.deepEqual(
                testUtils.getWriteRequests().map((call) => call.method + ' ' + call.url),
                [
                    'delete ' +
                        setUrl +
                        '528b787a-5238-ee11-b85a-48df37d1de8a?attributeGroupID=' +
                        groupId,
                ],
                'expected only the DELETE request of the parent set'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                3,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should delete an attributeSet linked to another attributeSet using the attributeGroup of its parent', async () => {
            // WHEN
            const { result, messages } = await testUtils.deleteCapturing(
                'warn',
                'attributeSet',
                'testExisting_attributeSetLinked'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deleteByKey should not have thrown an error');
            assert.isTrue(result, 'deleteByKey should have returned true');
            assert.isFalse(
                messages.some((msg) => msg.includes('also deletes')),
                'no other attributeSet should be deleted with it'
            );
            assert.deepEqual(
                testUtils.getWriteRequests().map((call) => call.method + ' ' + call.url),
                [
                    'delete ' +
                        setUrl +
                        'a1b2c3d4-0000-4000-8000-000000000101?attributeGroupID=' +
                        groupId,
                ],
                'expected exactly one DELETE request incl. the owning attributeGroup'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                3,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should not delete a system-defined attributeSet', async () => {
            // WHEN
            const { result, messages } = await testUtils.deleteCapturing(
                'error',
                'attributeSet',
                'Contact'
            );
            // THEN
            assert.equal(process.exitCode, 1, 'deleteByKey should have thrown an error');
            assert.isFalse(result, 'deleteByKey should have returned false');
            assert.isTrue(
                messages.some((msg) =>
                    msg.includes('Contact: system-defined attributeSets cannot be deleted')
                ),
                'expected an error about the system-defined attributeSet'
            );
            assert.lengthOf(testUtils.getWriteRequests(), 0, 'no DELETE should have been sent');
            assert.equal(
                testUtils.getAPIHistoryLength(),
                2,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should report an attributeSet that does not exist', async () => {
            // WHEN
            const { result, messages } = await testUtils.deleteCapturing(
                'error',
                'attributeSet',
                'testNotExisting_attributeSet'
            );
            // THEN
            assert.equal(process.exitCode, 1, 'deleteByKey should have thrown an error');
            assert.isFalse(result, 'deleteByKey should have returned false');
            assert.isTrue(
                messages.some((msg) =>
                    msg.includes('testNotExisting_attributeSet: not found on server')
                ),
                'expected a not-found error'
            );
            assert.lengthOf(testUtils.getWriteRequests(), 0, 'no DELETE should have been sent');
            assert.equal(
                testUtils.getAPIHistoryLength(),
                2,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
});
