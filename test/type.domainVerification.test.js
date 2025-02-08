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
                4,
                'Unexpected number of assets in retrieve response'
            );
            const typeCache = cache.getCache()?.domainVerification;
            assert.equal(
                typeCache ? Object.keys(typeCache).length : 0,
                4,
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
            return;
        });

    });
});
