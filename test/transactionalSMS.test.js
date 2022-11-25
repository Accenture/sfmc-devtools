const assert = require('chai').assert;
const cache = require('../lib/util/cache');
const testUtils = require('./utils');
const handler = require('../lib/index');

describe('transactionalSMS', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });
    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a transactionalSMS', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['transactionalSMS']);
            // THEN
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.transactionalSMS ? Object.keys(result.transactionalSMS).length : 0,
                1,
                'only one transactionalSMS expected'
            );
            assert.deepEqual(
                await testUtils.getActualFile('testExisting_tsms', 'transactionalSMS'),
                await testUtils.getExpectedFile('9999999', 'transactionalSMS', 'get'),
                'returned metadata was not equal expected'
            );
            assert.equal(
                Object.values(testUtils.getAPIHistory()).flat().length,
                4,
                'Unexpected number of requests made'
            );
            return;
        });
    });
});
