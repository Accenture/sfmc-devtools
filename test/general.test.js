import * as chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;

import chaiFiles from 'chai-files';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);

describe('GENERAL', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });

    afterEach(() => {
        testUtils.mockReset();
    });

    describe('with --metadata ================', () => {
        describe('retrieve --metadata ~~~', () => {
            it('retrieve single type without keys', async () => {
                const argvMetadata = ['dataExtract'];
                const typeKeyCombo = handler.metadataToTypeKey(argvMetadata);
                assert.notEqual(
                    typeof typeKeyCombo,
                    'undefined',
                    'typeKeyCombo should not be undefined'
                );
                const buName = 'testInstance/testBU';
                const result = await handler.retrieve(buName, typeKeyCombo);
                // THEN
                assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');

                const retrievedTypes = Object.keys(result[buName]);
                assert.equal(retrievedTypes.length, 1, 'retrieve should have returned 1 type');
                assert.equal(
                    retrievedTypes[0],
                    'dataExtract',
                    'retrieve should have returned 1 type'
                );
                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    6,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });

            it('retrieve multiple type without keys', async () => {
                const argvMetadata = ['dataExtension', 'senderProfile'];
                const typeKeyCombo = handler.metadataToTypeKey(argvMetadata);
                assert.notEqual(
                    typeof typeKeyCombo,
                    'undefined',
                    'typeKeyCombo should not be undefined'
                );
                const buName = 'testInstance/testBU';
                const result = await handler.retrieve(buName, typeKeyCombo);
                // THEN
                assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');

                const retrievedTypes = Object.keys(result[buName]);
                assert.equal(retrievedTypes.length, 2, 'retrieve should have returned 2 types');
                assert.equal(
                    retrievedTypes[0],
                    'dataExtension',
                    'retrieve should have returned dataExtension'
                );
                assert.equal(
                    retrievedTypes[1],
                    'senderProfile',
                    'retrieve should have returned senderProfile'
                );
                assert.equal(
                    Object.keys(result[buName]['senderProfile']).length,
                    2,
                    'retrieve should have returned 2 senderProfile'
                );
                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    6,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });

            it('retrieve multiple type with keys', async () => {
                const argvMetadata = [
                    'dataExtension',
                    'dataExtract:wrong-key',
                    'senderProfile:Default',
                    'query:testExisting_query',
                    'query:key:testExisting_query2',
                ];
                const typeKeyCombo = handler.metadataToTypeKey(argvMetadata);
                assert.notEqual(
                    typeof typeKeyCombo,
                    'undefined',
                    'typeKeyCombo should not be undefined'
                );
                const buName = 'testInstance/testBU';
                const result = await handler.retrieve(buName, typeKeyCombo);
                // THEN
                assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');

                const retrievedTypes = Object.keys(result[buName]);
                assert.equal(retrievedTypes.length, 4, 'retrieve should have returned 4 types');
                assert.equal(
                    retrievedTypes.includes('dataExtension'),
                    true,
                    'retrieve should have returned dataExtension'
                );
                assert.equal(
                    retrievedTypes.includes('dataExtract'),
                    true,
                    'retrieve should have returned dataExtract'
                );
                assert.equal(
                    retrievedTypes.includes('senderProfile'),
                    true,
                    'retrieve should have returned senderProfile'
                );
                assert.equal(
                    retrievedTypes.includes('query'),
                    true,
                    'retrieve should have returned query'
                );
                assert.equal(
                    Object.keys(result[buName]['dataExtension']).length,
                    5,
                    'retrieve should have returned 5 dataExtension'
                );
                assert.equal(
                    Object.keys(result[buName]['dataExtract']).length,
                    0,
                    'retrieve should have returned 0 dataExtracts'
                );
                assert.equal(
                    Object.keys(result[buName]['senderProfile']).length,
                    1,
                    'retrieve should have returned 1 senderProfile'
                );
                assert.equal(
                    Object.keys(result[buName]['query']).length,
                    2,
                    'retrieve should have returned 2 query'
                );
                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    12,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });
        });

        describe('deploy --metadata ~~~', () => {
            beforeEach(() => {
                testUtils.mockSetup(true);
            });

            it('deploy single type without keys', async () => {
                const argvMetadata = ['dataExtract'];
                const typeKeyCombo = handler.metadataToTypeKey(argvMetadata);
                assert.notEqual(
                    typeof typeKeyCombo,
                    'undefined',
                    'typeKeyCombo should not be undefined'
                );
                const buName = 'testInstance/testBU';
                const result = await handler.deploy(buName, typeKeyCombo);
                // THEN
                assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');

                const deployedTypes = Object.keys(result[buName]);
                assert.equal(deployedTypes.length, 1, 'deploy should have returned 1 type');
                assert.equal(deployedTypes[0], 'dataExtract', 'deploy should have returned 1 type');
                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    8,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });

            it('deploy multiple type without keys', async () => {
                const argvMetadata = ['dataExtension', 'senderProfile'];
                const typeKeyCombo = handler.metadataToTypeKey(argvMetadata);
                assert.notEqual(
                    typeof typeKeyCombo,
                    'undefined',
                    'typeKeyCombo should not be undefined'
                );
                const buName = 'testInstance/testBU';
                const result = await handler.deploy(buName, typeKeyCombo);
                // THEN
                assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');

                const deployedTypes = Object.keys(result[buName]);
                assert.equal(deployedTypes.length, 2, 'deploy should have returned 2 types');
                assert.equal(
                    deployedTypes[0],
                    'dataExtension',
                    'deploy should have returned dataExtension'
                );
                assert.equal(
                    deployedTypes[1],
                    'senderProfile',
                    'deploy should have returned senderProfile'
                );
                assert.equal(
                    Object.keys(result[buName]['dataExtension']).length,
                    2,
                    'deploy should have returned 2 dataExtension'
                );
                assert.equal(
                    Object.keys(result[buName]['senderProfile']).length,
                    2,
                    'deploy should have returned 2 senderProfile'
                );
                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    14,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });

            it('deploy multiple type with keys', async () => {
                const argvMetadata = [
                    'dataExtension',
                    'dataExtract:wrong-key',
                    'senderProfile:testExisting_senderProfile',
                    'query:testExisting_query',
                    'query:key:wrong-key2',
                ];
                const typeKeyCombo = handler.metadataToTypeKey(argvMetadata);
                assert.notEqual(
                    typeof typeKeyCombo,
                    'undefined',
                    'typeKeyCombo should not be undefined'
                );
                const buName = 'testInstance/testBU';
                const result = await handler.deploy(buName, typeKeyCombo);
                // THEN
                assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');

                const deployedTypes = Object.keys(result[buName]);
                assert.equal(deployedTypes.length, 3, 'deploy should have returned 3 types');
                assert.equal(
                    deployedTypes.includes('dataExtension'),
                    true,
                    'deploy should have returned dataExtension'
                );
                assert.equal(
                    deployedTypes.includes('dataExtract'),
                    false,
                    'deploy should have returned dataExtract'
                );
                assert.equal(
                    deployedTypes.includes('senderProfile'),
                    true,
                    'deploy should have returned senderProfile'
                );
                assert.equal(
                    deployedTypes.includes('query'),
                    true,
                    'deploy should have returned query'
                );
                assert.equal(
                    Object.keys(result[buName]['dataExtension']).length,
                    2,
                    'deploy should have returned 2 dataExtension'
                );
                assert.equal(
                    Object.keys(result[buName]['senderProfile']).length,
                    1,
                    'deploy should have returned 1 senderProfile'
                );
                assert.equal(
                    Object.keys(result[buName]['query']).length,
                    1,
                    'deploy should have returned 1 query'
                );
                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    15,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });
        });
    });

    describe('without --metadata ================', () => {
        describe('retrieve without --metadata ~~~', () => {
            it('retrieve multiple type with keys', async () => {
                const buName = 'testInstance/testBU';
                const result = await handler.retrieve(
                    buName,
                    ['dataExtract', 'senderProfile'],
                    ['wrong-key', 'Default']
                );
                // THEN
                assert.equal(process.exitCode, 0, 'retrieve should not have thrown an error');

                const retrievedTypes = Object.keys(result[buName]);
                assert.equal(retrievedTypes.length, 2, 'retrieve should have returned 2 types');
                assert.equal(
                    retrievedTypes.includes('dataExtract'),
                    true,
                    'retrieve should have returned dataExtract'
                );
                assert.equal(
                    retrievedTypes.includes('senderProfile'),
                    true,
                    'retrieve should have returned senderProfile'
                );
                assert.equal(
                    Object.keys(result[buName]['dataExtract']).length,
                    0,
                    'retrieve should have returned 0 dataExtracts'
                );
                assert.equal(
                    Object.keys(result[buName]['senderProfile']).length,
                    1,
                    'retrieve should have returned 1 senderProfile'
                );
                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    8,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });
        });

        describe('deploy without --metadata ~~~', () => {
            beforeEach(() => {
                testUtils.mockSetup(true);
            });

            it('deploy multiple type without keys', async () => {
                const argvMetadata = ['dataExtension', 'senderProfile'];
                const buName = 'testInstance/testBU';
                const result = await handler.deploy(buName, argvMetadata);
                // THEN
                assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');

                const deployedTypes = Object.keys(result[buName]);
                assert.equal(deployedTypes.length, 2, 'deploy should have returned 2 types');
                assert.equal(
                    deployedTypes[0],
                    'dataExtension',
                    'deploy should have returned dataExtension'
                );
                assert.equal(
                    deployedTypes[1],
                    'senderProfile',
                    'deploy should have returned senderProfile'
                );
                assert.equal(
                    Object.keys(result[buName]['dataExtension']).length,
                    2,
                    'deploy should have returned 2 dataExtension'
                );
                assert.equal(
                    Object.keys(result[buName]['senderProfile']).length,
                    2,
                    'deploy should have returned 2 senderProfile'
                );
                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    14,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });

            it('deploy multiple type with keys', async () => {
                const buName = 'testInstance/testBU';
                const result = await handler.deploy(
                    buName,
                    ['dataExtension', 'dataExtract', 'senderProfile', 'query'],
                    ['wrong-key', 'wrong-key2', 'testExisting_senderProfile', 'testExisting_query']
                );
                // THEN
                assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');

                const deployedTypes = Object.keys(result[buName]);
                assert.equal(deployedTypes.length, 2, 'deploy should have returned 2 types');
                assert.equal(
                    deployedTypes.includes('dataExtension'),
                    false,
                    'deploy should have returned dataExtension'
                );
                assert.equal(
                    deployedTypes.includes('dataExtract'),
                    false,
                    'deploy should have returned dataExtract'
                );
                assert.equal(
                    deployedTypes.includes('senderProfile'),
                    true,
                    'deploy should have returned senderProfile'
                );
                assert.equal(
                    deployedTypes.includes('query'),
                    true,
                    'deploy should have returned query'
                );
                assert.equal(
                    Object.keys(result[buName]['senderProfile']).length,
                    1,
                    'deploy should have returned 1 senderProfile'
                );
                assert.equal(
                    Object.keys(result[buName]['query']).length,
                    1,
                    'deploy should have returned 1 query'
                );
                assert.equal(
                    testUtils.getAPIHistoryLength(),
                    9,
                    'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
                );
            });
        });
    });

    describe('init ================', () => {
        it('should init a local project without downloading BUs');

        it('should init a local project and download all BUs');
    });

    describe('join ================', () => {
        it('should clone a project from git');
    });

    describe('upgrade ================', () => {
        it('should upgrade a project to the latest version');
    });

    describe('reloadBUs ================', () => {
        it('should load all BUs from the server and refresh the config');
    });

    describe('selectTypes ================', () => {
        it('should change which types are selected for default retrieval');
    });

    describe('explainTypes ================', () => {
        it('without options', () => {
            handler.explainTypes();
            assert.equal(process.exitCode, 0, 'explainTypes should not have thrown an error');

            return;
        });

        it('with --json set', () => {
            handler.setOptions({ json: true });
            const typeArr = handler.explainTypes();

            assert.equal(
                process.exitCode,
                0,
                'explainTypes --json should not have thrown an error'
            );

            // check if properties are all there
            expect(typeArr[0]).to.have.all.keys(
                'name',
                'apiName',
                'retrieveByDefault',
                'description',
                'supports'
            );
            expect(typeArr[0].supports).to.have.all.keys(
                'retrieve',
                'create',
                'update',
                'delete',
                'changeKey',
                'buildTemplate',
                'retrieveAsTemplate'
            );

            // check if certain types were returned
            assert.equal(
                typeArr.find((type) => type.apiName === 'dataExtension').apiName,
                'dataExtension',
                'Expected to find dataExtension type'
            );

            return;
        });
    });

    describe('createDeltaPkg ================', () => {
        it('should show diff to master branch');
        // mcdev createDeltaPkg master # resolves to master..HEAD
        it('should show diff between master and develop branch');
        // mcdev createDeltaPkg master..develop
        it(
            'should show diff between master and develop branch and filter the results to only show MyProject/BU1'
        );
        // mcdev createDeltaPkg master..develop --filter 'MyProject/BU1'
    });
});
