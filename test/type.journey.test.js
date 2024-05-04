import * as chai from 'chai';
const assert = chai.assert;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);

describe('type: journey', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });

    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a Quicksend journey with key', async () => {
            // WHEN
            await handler.retrieve(
                'testInstance/testBU',
                ['journey'],
                ['testExisting_journey_Quicksend']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.journey ? Object.keys(result.journey).length : 0,
                1,
                'only 1 journeys expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_journey_Quicksend', 'journey'),
                await testUtils.getExpectedJson('9999999', 'journey', 'get-quicksend'),
                'returned JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                21,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Delete ================', () => {
        it('Should NOT delete the item due to missing version', async () => {
            // WHEN
            const isDeleted = await handler.deleteByKey(
                'testInstance/testBU',
                'journey',
                'testExisting_interaction'
            );
            // THEN
            assert.equal(process.exitCode, 1, 'delete should have thrown an error');

            assert.equal(isDeleted, false, 'should not have deleted the item');
            return;
        });

        it('Should NOT delete the item due to unknown version', async () => {
            // WHEN
            const isDeleted = await handler.deleteByKey(
                'testInstance/testBU',
                'journey',
                'testExisting_interaction/2'
            );
            // THEN
            assert.equal(process.exitCode, 1, 'delete should have thrown an error');

            assert.equal(isDeleted, false, 'should not have deleted the item');
            return;
        });

        it('Should delete the item with version', async () => {
            // WHEN
            const isDeleted = await handler.deleteByKey(
                'testInstance/testBU',
                'journey',
                'testExisting_interaction/1'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'delete should not have thrown an error');

            assert.equal(isDeleted, true, 'should have deleted the item');
            return;
        });
    });
});
