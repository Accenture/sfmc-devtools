import * as chai from 'chai';
const assert = chai.assert;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);

describe('type: event', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });

    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a event', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['event']);
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.event ? Object.keys(result.event).length : 0,
                4,
                'only 4 event expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExising_event', 'event'),
                await testUtils.getExpectedJson('9999999', 'event', 'get'),
                'returned JSON was not equal expected'
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
    });

    describe('FixKeys ================', () => {
        beforeEach(() => {
            testUtils.mockSetup(true);
        });

        it('Should exit fixKeys because event is not supported intentionally', async () => {
            // WHEN
            handler.setOptions({ skipInteraction: { fixKeysReretrieve: false } });
            const resultFixKeys = await handler.fixKeys('testInstance/testBU', ['event']);
            // THEN
            assert.equal(process.exitCode, 0, 'fixKeys should not have thrown an error');
            // check which keys were fixed
            assert.equal(
                resultFixKeys['testInstance/testBU'],
                undefined,
                'expected to find no keys to be fixed'
            );

            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                0,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Templating ================', () => {});

    describe('Delete ================', () => {
        it('Should delete the item', async () => {
            // WHEN
            const isDeleted = await handler.deleteByKey(
                'testInstance/testBU',
                'event',
                'testExising_event'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'deleteByKey should not have thrown an error');
            assert.equal(isDeleted, true, 'deleteByKey should have returned true');
            return;
        });
    });

    describe('CI/CD ================', () => {});
});
