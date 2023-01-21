const chai = require('chai');
const chaiFiles = require('chai-files');
const assert = chai.assert;
chai.use(chaiFiles);
const cache = require('../lib/util/cache');
const testUtils = require('./utils');
const handler = require('../lib/index');

describe('interaction', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });
    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a interaction', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['interaction']);
            // THEN
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.interaction ? Object.keys(result.interaction).length : 0,
                1,
                'only one interaction expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_interaction', 'interaction'),
                await testUtils.getExpectedJson('9999999', 'interaction', 'get'),
                'returned JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                5,
                'Unexpected number of requests made. Run testUtils.getAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
});
