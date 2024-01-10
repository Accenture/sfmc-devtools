import File from '../lib/util/file.js';

import chai, { assert, expect } from 'chai';
import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);
const file = chaiFiles.file;

/**
 * gets file from Retrieve folder
 *
 * @param {string} customerKey of metadata
 * @param {string} type of metadata
 * @param {string} subtype of metadata
 * @param {string} [buName] used when we need to test on ParentBU
 * @returns {Promise.<string>} file in string form
 */
function getActualJson(customerKey, type, subtype, buName = 'testBU') {
    return File.readJSON(
        `./retrieve/testInstance/${buName}/${type}/${subtype}/${customerKey}.${type}-${subtype}-meta.json`
    );
}
/**
 * gets file from Retrieve folder
 *
 * @param {string} customerKey of metadata
 * @param {string} type of metadata
 * @param {string} subtype of metadata
 * @param {string} ext file extension
 * @returns {string} file path
 */
function getActualFile(customerKey, type, subtype, ext) {
    return `./retrieve/testInstance/testBU/${type}/${subtype}/${customerKey}.${type}-${subtype}-meta.${ext}`;
}

describe('type: asset', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });
    afterEach(() => {
        testUtils.mockReset();
    });
    describe('Retrieve ================', () => {
        it('Should retrieve a asset & ensure non-ssjs code is not removed', async () => {
            // WHEN
            const retrieve = await handler.retrieve('testInstance/testBU', ['asset']);

            // THEN
            assert.equal(process.exitCode, false, 'retrieve should not have thrown an error');
            assert.equal(
                retrieve['testInstance/testBU'].asset
                    ? Object.keys(retrieve['testInstance/testBU'].asset).length
                    : 0,
                3,
                'only 3 assets expected in retrieve response'
            );
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.asset ? Object.keys(result.asset).length : 0,
                3,
                'only 3 assets expected in cache'
            );

            assert.deepEqual(
                await getActualJson('mcdev-issue-1157', 'asset', 'block'),
                await testUtils.getExpectedJson('9999999', 'asset', 'block-1157-retrieve'),
                'returned metadata was not equal expected'
            );
            expect(file(getActualFile('mcdev-issue-1157', 'asset', 'block', 'html'))).to.equal(
                file(testUtils.getExpectedFile('9999999', 'asset', 'block-1157-retrieve', 'html'))
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                30,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
});
