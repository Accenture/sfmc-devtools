import * as chai from 'chai';
const assert = chai.assert;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);

describe('type: deliveryProfile', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });

    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a deliveryProfile', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['deliveryProfile']);
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.deliveryProfile ? Object.keys(result.deliveryProfile).length : 0,
                1,
                'only one deliveryProfile expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('Default', 'deliveryProfile'),
                await testUtils.getExpectedJson('9999999', 'deliveryProfile', 'get'),
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
});
