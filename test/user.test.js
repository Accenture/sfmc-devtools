const assert = require('chai').assert;
const cache = require('../lib/util/cache');
const testUtils = require('./utils');
const handler = require('../lib/index');

describe('user', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });
    afterEach(() => {
        testUtils.mockReset();
    });
    describe('Retrieve ================', () => {
        it('Should retrieve a user', async () => {
            // WHEN
            await handler.retrieve('testInstance/_ParentBU_', ['user']);
            // THEN
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.user ? Object.keys(result.user).length : 0,
                1,
                'only one user expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_user', 'user', '_ParentBU_'),
                await testUtils.getExpectedJson('1111111', 'user', 'retrieve'),

                'returned metadata was not equal expected'
            );
            assert.equal(
                testUtils.getAPIHistoryLength(),
                4,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
    describe('Deploy ================', () => {
        beforeEach(() => {
            testUtils.mockSetup(true);
        });
        it('Should create & upsert a user', async () => {
            // WHEN
            await handler.deploy('testInstance/_ParentBU_', ['user']);
            // THEN

            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.user ? Object.keys(result.user).length : 0,
                2,
                'two users expected'
            );
            // insert
            assert.deepEqual(
                await testUtils.getActualJson('testNew_user', 'user', '_ParentBU_'),
                await testUtils.getExpectedJson('1111111', 'user', 'create'),
                'returned metadata was not equal expected for create'
            );
            // update
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_user', 'user', '_ParentBU_'),
                await testUtils.getExpectedJson('1111111', 'user', 'update'),
                'returned metadata was not equal expected for update'
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
