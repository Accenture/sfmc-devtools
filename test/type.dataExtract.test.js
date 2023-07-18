const chai = require('chai');
const chaiFiles = require('chai-files');
const assert = chai.assert;
chai.use(chaiFiles);
const cache = require('../lib/util/cache');
const testUtils = require('./utils');
const handler = require('../lib/index');

describe('type: dataExtract', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });
    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a dataExtract', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['dataExtract']);
            // THEN
            assert.equal(process.exitCode, false, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.dataExtract ? Object.keys(result.dataExtract).length : 0,
                1,
                'only one dataExtract expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_dataExtract', 'dataExtract'),
                await testUtils.getExpectedJson('9999999', 'dataExtract', 'get'),
                'returned JSON was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                6,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
});
