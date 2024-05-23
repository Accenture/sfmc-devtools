import * as chai from 'chai';
const assert = chai.assert;
// const expect = chai.expect;

import chaiFiles from 'chai-files';
// import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);
// const file = chaiFiles.file;

describe('type: event', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });

    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {});

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

    describe('Delete ================', () => {});

    describe('CI/CD ================', () => {});
});
