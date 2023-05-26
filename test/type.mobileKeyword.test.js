const chai = require('chai');
const chaiFiles = require('chai-files');
const assert = chai.assert;
chai.use(chaiFiles);
const expect = chai.expect;
const file = chaiFiles.file;
const cache = require('../lib/util/cache');
const testUtils = require('./utils');
const handler = require('../lib/index');

describe('type: mobileKeyword', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });
    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Retrieve ================', () => {
        it('Should retrieve a mobileKeyword', async () => {
            // WHEN
            await handler.retrieve('testInstance/testBU', ['mobileKeyword']);
            // THEN
            assert.equal(process.exitCode, false, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.mobileKeyword ? Object.keys(result.mobileKeyword).length : 0,
                1,
                'only 1 mobileKeywords expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson(
                    'cTVJaG5oSDJPVUNHcUh6Z3pQT2tVdzo4Njow',
                    'mobileKeyword'
                ),
                await testUtils.getExpectedJson('9999999', 'mobileKeyword', 'get'),
                'saved JSON was not equal expected'
            );
            expect(
                file(
                    testUtils.getActualFile(
                        'cTVJaG5oSDJPVUNHcUh6Z3pQT2tVdzo4Njow',
                        'mobileKeyword',
                        'amp'
                    )
                )
            ).to.equal(file(testUtils.getExpectedFile('9999999', 'mobileKeyword', 'get', 'amp')));
            assert.equal(
                testUtils.getAPIHistoryLength(),
                2,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
    describe('Deploy ================', () => {
        beforeEach(() => {
            testUtils.mockSetup(true);
        });
        it('Should create (but not update) a mobileKeyword', async () => {
            // WHEN
            await handler.deploy('testInstance/testBU', ['mobileKeyword'], ['testNew_keyword']); // the key is not actually send to the server because key==id and the id is auto-generated
            // THEN
            assert.equal(process.exitCode, false, 'deploy should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.mobileKeyword ? Object.keys(result.mobileKeyword).length : 0,
                2,
                '2 mobileKeywords expected'
            );
            // confirm created item
            assert.deepEqual(
                await testUtils.getActualJson(
                    'NXV4ZFMwTEFwRVczd3RaLUF5X3p5dzo4Njow',
                    'mobileKeyword'
                ),
                await testUtils.getExpectedJson('9999999', 'mobileKeyword', 'post-create'),
                'returned JSON was not equal expected for insert mobileKeyword'
            );
            expect(
                file(
                    testUtils.getActualFile(
                        'NXV4ZFMwTEFwRVczd3RaLUF5X3p5dzo4Njow',
                        'mobileKeyword',
                        'amp'
                    )
                )
            ).to.equal(
                file(testUtils.getExpectedFile('9999999', 'mobileKeyword', 'post-create', 'amp'))
            );

            // confirm updated item
            // eslint-disable-next-line no-console
            console.log(
                'Not testing UPDATE because the API only responds with an empty body unless there are errors in the request body'
            );

            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                4,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should not create a mobileKeyword with wrong type', async () => {
            // WHEN
            await handler.deploy(
                'testInstance/testBU',
                ['mobileKeyword'],
                ['testNew_keyword_blocked']
            );
            // THEN
            assert.equal(process.exitCode, true, 'deploy should have thrown an error');

            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                2,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
        it('Should change the key during update via --changeKeyValue');
    });
    describe('Templating ================', () => {
        it('Should create a mobileKeyword template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/testBU', ['mobileKeyword']);
            // buildTemplate
            const result = await handler.buildTemplate(
                'testInstance/testBU',
                'mobileKeyword',
                ['cTVJaG5oSDJPVUNHcUh6Z3pQT2tVdzo4Njow'],
                'testSourceMarket'
            );
            assert.equal(process.exitCode, false, 'buildTemplate should not have thrown an error');

            assert.equal(
                result.mobileKeyword ? Object.keys(result.mobileKeyword).length : 0,
                1,
                'only one mobileKeyword expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson(
                    'cTVJaG5oSDJPVUNHcUh6Z3pQT2tVdzo4Njow',
                    'mobileKeyword'
                ),
                await testUtils.getExpectedJson('9999999', 'mobileKeyword', 'template'),
                'returned template JSON was not equal expected'
            );
            expect(
                file(
                    testUtils.getActualTemplateFile(
                        'cTVJaG5oSDJPVUNHcUh6Z3pQT2tVdzo4Njow',
                        'mobileKeyword',
                        'amp'
                    )
                )
            ).to.equal(
                file(testUtils.getExpectedFile('9999999', 'mobileKeyword', 'template', 'amp'))
            );

            // buildDefinition
            await handler.buildDefinition(
                'testInstance/testBU',
                'mobileKeyword',
                'cTVJaG5oSDJPVUNHcUh6Z3pQT2tVdzo4Njow',
                'testTargetMarket'
            );
            assert.equal(
                process.exitCode,
                false,
                'buildDefinition should not have thrown an error'
            );
            assert.deepEqual(
                await testUtils.getActualDeployJson(
                    'cTVJaG5oSDJPVUNHcUh6Z3pQT2tVdzo4Njow',
                    'mobileKeyword'
                ),
                await testUtils.getExpectedJson('9999999', 'mobileKeyword', 'build'),
                'returned deployment JSON was not equal expected'
            );
            expect(
                file(
                    testUtils.getActualDeployFile(
                        'cTVJaG5oSDJPVUNHcUh6Z3pQT2tVdzo4Njow',
                        'mobileKeyword',
                        'amp'
                    )
                )
            ).to.equal(file(testUtils.getExpectedFile('9999999', 'mobileKeyword', 'build', 'amp')));

            assert.equal(
                testUtils.getAPIHistoryLength(),
                2,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
    describe('Delete ================', () => {
        it('Should delete the item', async () => {
            // WHEN
            const result = await handler.deleteByKey('testInstance/testBU', 'mobileKeyword', [
                'cTVJaG5oSDJPVUNHcUh6Z3pQT2tVdzo4Njow',
            ]);
            // THEN
            assert.equal(process.exitCode, false, 'delete should not have thrown an error');

            assert.equal(result, true, 'should have deleted the item');
            return;
        });
    });
    describe('CI/CD ================', () => {
        it('Should return a list of files based on their type and key', async () => {
            // WHEN
            const fileList = await handler.getFilesToCommit(
                'testInstance/testBU',
                'mobileKeyword',
                ['testExisting_keyword']
            );
            // THEN
            assert.equal(
                process.exitCode,
                false,
                'getFilesToCommit should not have thrown an error'
            );
            assert.equal(fileList.length, 2, 'expected only 2 file paths');

            assert.equal(
                fileList[0].split('\\').join('/'),
                'retrieve/testInstance/testBU/mobileKeyword/testExisting_keyword.mobileKeyword-meta.json',
                'wrong JSON path'
            );
            assert.equal(
                fileList[1].split('\\').join('/'),
                'retrieve/testInstance/testBU/mobileKeyword/testExisting_keyword.mobileKeyword-meta.amp',
                'wrong AMP path'
            );
            return;
        });
    });
});
