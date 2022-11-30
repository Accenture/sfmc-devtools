const chai = require('chai');
const chaiFiles = require('chai-files');
const assert = chai.assert;
chai.use(chaiFiles);
const cache = require('../lib/util/cache');
const testUtils = require('./utils');
const handler = require('../lib/index');

describe('transactionalEmail', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });
    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a transactionalEmail', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['transactionalEmail']);
            // THEN
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.transactionalEmail ? Object.keys(result.transactionalEmail).length : 0,
                1,
                'only one transactionalEmail expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_temail', 'transactionalEmail'),
                await testUtils.getExpectedJson('9999999', 'transactionalEmail', 'get'),
                'returned JSON was not equal expected'
            );
            assert.equal(
                Object.values(testUtils.getAPIHistory()).flat().length,
                12,
                'Unexpected number of requests made'
            );
            return;
        });
    });
});
