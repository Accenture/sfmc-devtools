import * as chai from 'chai';
const assert = chai.assert;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
import File from '../lib/util/file.js';
chai.use(chaiFiles);

/**
 * path of a retrieved file in the mocked file system
 *
 * @param {string} type metadata type
 * @param {string} key metadata key
 * @returns {string} path
 */
function retrievePath(type, key) {
    return `./retrieve/testInstance/testBU/${type}/${key}.${type}-meta.json`;
}

describe('type: attributeGroup', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });

    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a attributeGroup', async () => {
            // WHEN
            const retrieve = await handler.retrieve('testInstance/testBU', ['attributeGroup']);

            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            assert.equal(
                retrieve['testInstance/testBU'].attributeGroup
                    ? Object.keys(retrieve['testInstance/testBU'].attributeGroup).length
                    : 0,
                8,
                'only 8 attributeGroups expected in retrieve response'
            );

            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.attributeGroup ? Object.keys(result.attributeGroup).length : 0,
                8,
                'only 8 attributeGroups expected in cache'
            );
            assert.deepEqual(
                await testUtils.getActualJson('ETMobileConnect', 'attributeGroup'),
                await testUtils.getExpectedJson('9999999', 'attributeGroup', 'retrieve'),

                'returned metadata was not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                2,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Deploy ================', () => {
        beforeEach(() => {
            testUtils.mockSetup(true);
        });

        it('Should create a new attributeGroup', async () => {
            // WHEN
            const result = await handler.deploy(
                'testInstance/testBU',
                ['attributeGroup'],
                ['testNew_attributeGroup']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            assert.deepEqual(
                Object.keys(result['testInstance/testBU'].attributeGroup),
                ['testNew_attributeGroup'],
                'deploy should have returned the created attributeGroup'
            );
            // confirm create payload only contains createable fields
            assert.deepEqual(
                testUtils.getRestCallout('post', '/hub/v1/contacts/schema/attributeGroups'),
                await testUtils.getExpectedJson('9999999', 'attributeGroup', 'post-callout'),
                'create-payload JSON was not equal expected'
            );
            // confirm created item
            assert.deepEqual(
                await testUtils.getActualJson('testNew_attributeGroup', 'attributeGroup'),
                await testUtils.getExpectedJson('9999999', 'attributeGroup', 'post'),
                'returned new-JSON was not equal expected for insert attributeGroup'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                2,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should create a new attributeGroup whose file still carries a definitionID, even at debug log level', async () => {
            // GIVEN debug mode, which routes items with an idField value into the update path
            handler.setOptions({ debug: true });
            // WHEN
            const result = await handler.deploy(
                'testInstance/testBU',
                ['attributeGroup'],
                ['testNew_attributeGroupWithId']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            // the mocked POST response always echoes testNew_attributeGroup, so only the count is meaningful here
            assert.lengthOf(
                Object.keys(result['testInstance/testBU'].attributeGroup || {}),
                1,
                'deploy should have created one attributeGroup'
            );
            const writes = testUtils.getWriteRequests();
            assert.lengthOf(writes, 1, 'expected exactly one create request');
            assert.equal(writes[0].method, 'post', 'expected a POST create request');
            assert.notProperty(
                JSON.parse(writes[0].data),
                'definitionID',
                'the source definitionID must not be sent'
            );
            return;
        });

        it('Should warn and not update an existing attributeGroup with a changed description', async () => {
            // WHEN
            const { messages } = await testUtils.deployCapturing('warn', 'attributeGroup', [
                'testExisting_attributeGroup',
            ]);
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            assert.lengthOf(
                messages.filter(
                    (msg) =>
                        msg.includes('testExisting_attributeGroup') &&
                        msg.includes('cannot be changed via API after creation')
                ),
                1,
                'expected one warning about the non-updateable description'
            );
            assert.lengthOf(
                testUtils.getWriteRequests(),
                0,
                'no update request should have been made'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                1,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should skip a system-defined attributeGroup with an error', async () => {
            // WHEN
            const { result, messages } = await testUtils.deployCapturing(
                'error',
                'attributeGroup',
                ['ETMobileConnect']
            );
            // THEN
            assert.equal(process.exitCode, 1, 'deploy should have thrown an error');
            assert.isTrue(
                messages.some(
                    (msg) =>
                        msg.includes('ETMobileConnect') &&
                        msg.includes('system-defined attributeGroups cannot be deployed')
                ),
                'expected an error about the system-defined attributeGroup'
            );
            assert.deepEqual(
                Object.keys(result['testInstance/testBU'].attributeGroup || {}),
                [],
                'no attributeGroup should have been deployed'
            );
            assert.lengthOf(
                testUtils.getWriteRequests(),
                0,
                'no create/update request should have been made'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                1,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Delete ================', () => {
        const groupKey = 'testExisting_attributeGroup';
        const groupDeleteUrl =
            '/hub/v1/contacts/schema/attributeGroups/79846c6e-5238-ee11-b85a-48df37d1de8a';

        it('Should delete an attributeGroup incl. the local files of all attributeSets deleted with it', async () => {
            // GIVEN retrieved files of the group, its sets and an unrelated set
            for (const [type, key] of [
                ['attributeGroup', groupKey],
                ['attributeSet', 'testExisting_dataExtensionShared'],
                ['attributeSet', 'testExisting_attributeSetLinked'],
                ['attributeSet', 'Contact'],
            ]) {
                await File.outputJson(retrievePath(type, key), { definitionKey: key });
            }
            // WHEN
            const { result, messages } = await testUtils.deleteCapturing(
                'warn',
                'attributeGroup',
                groupKey
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deleteByKey should not have thrown an error');
            assert.isTrue(result, 'deleteByKey should have returned true');
            assert.deepEqual(
                messages.filter((msg) => msg.includes('also deletes')),
                [
                    ` - deleting attributeGroup ${groupKey} also deletes all of its attributeSets: testExisting_dataExtensionShared, testExisting_attributeSetLinked`,
                ],
                'expected one warning listing the cascaded attributeSets'
            );
            assert.deepEqual(
                testUtils.getWriteRequests().map((call) => call.method + ' ' + call.url),
                ['delete ' + groupDeleteUrl],
                'expected exactly one DELETE request'
            );
            for (const [type, key] of [
                ['attributeGroup', groupKey],
                ['attributeSet', 'testExisting_dataExtensionShared'],
                ['attributeSet', 'testExisting_attributeSetLinked'],
            ]) {
                assert.isFalse(
                    await File.pathExists(retrievePath(type, key)),
                    `${type} ${key} should have been removed locally`
                );
            }
            assert.isTrue(
                await File.pathExists(retrievePath('attributeSet', 'Contact')),
                'unrelated attributeSet should have been kept'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                3,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should treat an attributeSet deleted together with its attributeGroup in the same command as deleted', async () => {
            // WHEN
            const { result, messages } = await testUtils.deleteCapturing('info', {
                attributeGroup: [groupKey],
                attributeSet: ['testExisting_attributeSetLinked'],
            });
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
                ['delete ' + groupDeleteUrl],
                'expected only the DELETE request of the attributeGroup'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                3,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should not delete a system-defined attributeGroup', async () => {
            // WHEN
            const { result, messages } = await testUtils.deleteCapturing(
                'error',
                'attributeGroup',
                'ETMobileConnect'
            );
            // THEN
            assert.equal(process.exitCode, 1, 'deleteByKey should have thrown an error');
            assert.isFalse(result, 'deleteByKey should have returned false');
            assert.isTrue(
                messages.some((msg) =>
                    msg.includes(
                        'ETMobileConnect: system-defined attributeGroups cannot be deleted'
                    )
                ),
                'expected an error about the system-defined attributeGroup'
            );
            assert.lengthOf(testUtils.getWriteRequests(), 0, 'no DELETE should have been sent');
            assert.equal(
                testUtils.getAPIHistoryLength(),
                2,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should report an attributeGroup that does not exist', async () => {
            // WHEN
            const { result, messages } = await testUtils.deleteCapturing(
                'error',
                'attributeGroup',
                'testNotExisting_attributeGroup'
            );
            // THEN
            assert.equal(process.exitCode, 1, 'deleteByKey should have thrown an error');
            assert.isFalse(result, 'deleteByKey should have returned false');
            assert.isTrue(
                messages.some((msg) =>
                    msg.includes('testNotExisting_attributeGroup: not found on server')
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
