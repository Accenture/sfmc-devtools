import * as chai from 'chai';
const assert = chai.assert;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);

describe('type: triggeredSendSummary', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });

    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a triggeredSendSummary', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['triggeredSendSummary']);
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.triggeredSendSummary ? Object.keys(result.triggeredSendSummary).length : 0,
                1,
                'only 1 triggeredSendSummary expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_triggeredSend', 'triggeredSendSummary'),
                await testUtils.getExpectedJson('9999999', 'triggeredSendSummary', 'get'),
                'returned JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                2,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
});
