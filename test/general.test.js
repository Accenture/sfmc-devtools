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
            assert.equal(process.exitCode, false, 'explainTypes should not have thrown an error');

            return;
        });
        it('with --json set', () => {
            handler.setOptions({ json: true });
            const typeArr = handler.explainTypes();

            assert.equal(
                process.exitCode,
                false,
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
