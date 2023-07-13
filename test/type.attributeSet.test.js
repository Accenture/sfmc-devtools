const chai = require('chai');
const chaiFiles = require('chai-files');

chai.use(chaiFiles);

const assert = chai.assert;
const cache = require('../lib/util/cache');
const testUtils = require('./utils');
const handler = require('../lib/index');

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
            assert.equal(process.exitCode, false, 'retrieve should not have thrown an error');
            assert.equal(
                retrieve['testInstance/testBU'].attributeSet
                    ? Object.keys(retrieve['testInstance/testBU'].attributeSet).length
                    : 0,
                27,
                'only 27 attributeSets expected in retrieve response'
            );
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.attributeSet ? Object.keys(result.attributeSet).length : 0,
                27,
                'only 27 attributeSets expected in cache'
            );
            assert.deepEqual(
                await testUtils.getActualJson('Contact', 'attributeSet'),
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
