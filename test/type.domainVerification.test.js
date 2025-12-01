import * as chai from 'chai';
const assert = chai.assert;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);

describe('type: domainVerification', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });

    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a domainVerification', async () => {
            // WHEN
            const retrieve = await handler.retrieve('testInstance/testBU', {
                domainVerification: null,
            });
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            assert.equal(
                retrieve['testInstance/testBU'].domainVerification
                    ? Object.keys(retrieve['testInstance/testBU'].domainVerification).length
                    : 0,
                5,
                'Unexpected number of assets in retrieve response'
            );
            const typeCache = cache.getCache()?.domainVerification;
            assert.equal(
                typeCache ? Object.keys(typeCache).length : 0,
                5,
                'unexpected number of domainVerifications'
            );
            assert.deepEqual(
                await testUtils.getActualJson('mcdev.accenture.com', 'domainVerification'),
                await testUtils.getExpectedJson('9999999', 'domainVerification', 'get-sap'),
                'returned JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                1,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Deploy ================', () => {
        beforeEach(() => {
            testUtils.mockSetup(true);
        });

        it('Should create & upsert domainVerifications', async () => {
            // WHEN

            const deployed = await handler.deploy('testInstance/testBU', {
                domainVerification: [
                    'joern.berkefeld@accenture.com',
                    'joern.berkefeld.New@accenture.com',
                ],
            });
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            // get results from cache
            const cached = cache.getCache();
            assert.equal(
                cached.domainVerification ? Object.keys(cached.domainVerification).length : 0,
                6,
                'unexpected number of domainVerifications in cache'
            );
            assert.deepEqual(
                Object.keys(deployed['testInstance/testBU']?.domainVerification),
                ['joern.berkefeld.New@accenture.com', 'joern.berkefeld@accenture.com'],
                'unexpected domainVerifications deployed'
            );

            // check callouts
            const createCallout = testUtils.getRestCallout(
                'post',
                '/messaging/v1/domainverification/'
            );
            assert.deepEqual(
                createCallout,
                { domain: 'joern.berkefeld.New@accenture.com' },
                'unexecpted payload for create callout'
            );
            const updateCallout = testUtils.getRestCallout(
                'post',
                '/messaging/v1/domainverification/update'
            );
            assert.deepEqual(
                updateCallout,
                [{ emailAddress: 'joern.berkefeld@accenture.com', isSendable: true }],
                'unexecpted payload for update callout'
            );

            // confirm created item
            assert.deepEqual(
                await testUtils.getActualJson(
                    'joern.berkefeld.New@accenture.com',
                    'domainVerification'
                ),
                await testUtils.getExpectedJson('9999999', 'domainVerification', 'create'),
                'returned new-JSON was not equal expected for insert domainVerification'
            );
            // confirm updated item
            assert.deepEqual(
                await testUtils.getActualJson(
                    'joern.berkefeld@accenture.com',
                    'domainVerification'
                ),
                await testUtils.getExpectedJson('9999999', 'domainVerification', 'update'),
                'returned existing-JSON was not equal expected for update domainVerification'
            );
            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                4,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Delete ================', () => {
        it('Should delete the item', async () => {
            // WHEN
            const isDeleted = await handler.deleteByKey('testInstance/testBU', {
                domainVerification: ['joern.berkefeld@accenture.com'],
            });
            // THEN
            assert.equal(process.exitCode, 0, 'deleteByKey should not have thrown an error');
            assert.equal(isDeleted, true, 'deleteByKey should have returned true');
            assert.equal(
                testUtils.getAPIHistoryLength(),
                2,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should not delete the items with wrong domainType', async () => {
            // WHEN
            const isDeleted = await handler.deleteByKey('testInstance/testBU', {
                domainVerification: [
                    'mcdev.accenture.com',
                    'adhoc.accenture.com',
                    'mcdev-transferrable.accenture.com',
                ],
            });
            // THEN
            assert.equal(process.exitCode, 1, 'deleteByKey should have thrown an error');
            assert.equal(isDeleted, false, 'deleteByKey should have returned false');
            assert.equal(
                testUtils.getAPIHistoryLength(),
                1,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
});
