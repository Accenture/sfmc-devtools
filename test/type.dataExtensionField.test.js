import * as chai from 'chai';
const assert = chai.assert;

import chaiFiles from 'chai-files';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);

describe('type: dataExtensionField', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });

    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Delete ================', () => {
        it('Should delete the dataExtensionField', async () => {
            // WHEN
            const isDeleted = await handler.deleteByKey(
                'testInstance/testBU',
                'dataExtensionField',
                'testExisting_dataExtension.LastName'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'delete should not have thrown an error');

            assert.equal(isDeleted, true, 'should have deleted the item');

            assert.equal(
                testUtils.getAPIHistoryLength(),
                2,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should mass-delete the dataExtensionField across all dataExtensions', async () => {
            handler.setOptions({ skipInteraction: true });
            // WHEN
            const isDeleted = await handler.deleteByKey(
                'testInstance/testBU',
                'dataExtensionField',
                '*.LastName'
            );
            // THEN
            assert.equal(process.exitCode, 0, 'delete should not have thrown an error');

            assert.equal(isDeleted, true, 'should have deleted the item');

            assert.equal(
                testUtils.getAPIHistoryLength(),
                4,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should mass-delete multiple dataExtensionFields across all dataExtensions', async () => {
            handler.setOptions({ skipInteraction: true });
            // WHEN
            const isDeleted = await handler.deleteByKey(
                'testInstance/testBU',
                'dataExtensionField',
                ['*.FirstName', '*.LastName']
            );
            // THEN
            assert.equal(process.exitCode, 0, 'delete should not have thrown an error');

            assert.equal(isDeleted, true, 'should have deleted the item');

            assert.equal(
                testUtils.getAPIHistoryLength(),
                8,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
});
