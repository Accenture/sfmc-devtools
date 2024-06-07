import * as chai from 'chai';
const assert = chai.assert;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);

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
                28,
                'only 28 attributeSets expected in retrieve response'
            );
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.attributeSet ? Object.keys(result.attributeSet).length : 0,
                28,
                'only 28 attributeSets expected in cache'
            );

            assert.deepEqual(
                await testUtils.getActualJson('testExisting_dataExtensionShared', 'attributeSet'),
                await testUtils.getExpectedJson('9999999', 'attributeSet', 'retrieve'),

                'returned metadata was not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                7,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
});
