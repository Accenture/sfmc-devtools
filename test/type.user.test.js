import * as chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);
const file = chaiFiles.file;
import File from '../lib/util/file.js';

describe('type: user', () => {
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
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');
            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.user ? Object.keys(result.user).length : 0,
                3,
                'only three users expected'
            );
            assert.deepEqual(
                await testUtils.getActualJson('testExisting_user', 'user', '_ParentBU_'),
                await testUtils.getExpectedJson('1111111', 'user', 'retrieve'),

                'returned metadata was not equal expected'
            );
            // check if MD file was created and equals expectations
            // ! this test needs to update the lastLoginDate counter because it changes with every passing day
            const expectedFile = await testUtils.getExpectedFile(
                '1111111',
                'user',
                'retrieve',
                'md'
            );
            const regexFindDaysSinceLogin =
                /\| (\d*) (seconds|minutes|days|weeks|months|years){1} \|/g;
            // fetch expected time since last login
            const expectedDaysSinceLogin = expectedFile.match(regexFindDaysSinceLogin);
            // load actual file and replace days since last login with expected value
            const actualFile = (
                await File.readFile(`./docs/user/testInstance.users.md`, {
                    encoding: 'utf8',
                })
            ).replaceAll(regexFindDaysSinceLogin, expectedDaysSinceLogin[0]);
            expect(actualFile).to.equal(expectedFile);

            assert.equal(
                testUtils.getAPIHistoryLength(),
                6,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should retrieve a specific user but not run document', async () => {
            // WHEN
            await handler.retrieve('testInstance/_ParentBU_', ['user'], ['testExisting_user']);
            // THEN
            assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');

            // because user is single-document-type we would not want to find an md file when we retrieve specific keys. only the generic retrieve updates it
            expect(file(`./docs/user/testInstance.users.md`)).to.not.exist;

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
            const expectedCache = [
                'testExisting_user',
                'testExisting_user_inactive',
                '45372cbb-06e0-438e-88d8-008981f7a18b',
                'testNew_user',
            ];
            await handler.deploy('testInstance/_ParentBU_', ['user'], expectedCache);
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');

            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.user ? Object.keys(result.user).length : 0,
                4,
                'four users expected'
            );
            // confirm if result.user only includes values from expectedCache
            assert.deepEqual(
                Object.keys(result.user),
                expectedCache,
                'returned user keys were not equal expected'
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
            // because user is single-document-type we would not want to find an md file getting created by deploy. only retrieve updates it
            expect(file(`./docs/user/testInstance.users.md`)).to.not.exist;

            assert.equal(
                testUtils.getAPIHistoryLength(),
                8,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should not deploy user with Marketing Cloud role', async () => {
            // WHEN
            const expectedCache = [
                'testExisting_user',
                'testExisting_user_inactive',
                '45372cbb-06e0-438e-88d8-008981f7a18b',
            ];
            await handler.deploy('testInstance/_ParentBU_', ['user'], ['testBlocked_user']);
            // THEN
            assert.equal(process.exitCode, 1, 'Deployment should have thrown an error');

            // get results from cache
            const result = cache.getCache();
            assert.equal(
                result.user ? Object.keys(result.user).length : 0,
                3,
                'three users expected'
            );
            // confirm if result.user only includes values from expectedCache
            assert.deepEqual(
                Object.keys(result.user),
                expectedCache,
                'returned user keys were not equal expected'
            );

            assert.equal(
                testUtils.getAPIHistoryLength(),
                5,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });

    describe('Templating ================', () => {
        // it('Should create a user template via retrieveAsTemplate and build it', async () => {});
        it('Should create a user template via buildTemplate and build it', async () => {
            // download first before we test buildTemplate
            await handler.retrieve('testInstance/_ParentBU_', ['user']);
            // GIVEN there is a template
            const result = await handler.buildTemplate(
                'testInstance/_ParentBU_',
                'user',
                ['testExisting_user'],
                ['testSourceMarket']
            );
            assert.equal(process.exitCode, 0, 'buildTemplate should not have thrown an error');
            // WHEN
            assert.equal(
                result.user ? Object.keys(result.user).length : 0,
                1,
                'only one user expected'
            );
            assert.deepEqual(
                await testUtils.getActualTemplateJson('testExisting_user', 'user'),
                await testUtils.getExpectedJson('1111111', 'user', 'template'),
                'returned template was not equal expected'
            );
            // THEN
            await handler.buildDefinition(
                'testInstance/_ParentBU_',
                'user',
                ['testExisting_user'],
                ['testTargetMarket']
            );
            assert.equal(process.exitCode, 0, 'buildDefinition should not have thrown an error');

            assert.deepEqual(
                await testUtils.getActualDeployJson('testTemplated_user', 'user', '_ParentBU_'),
                await testUtils.getExpectedJson('1111111', 'user', 'build'),
                'returned deployment file was not equal expected'
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
