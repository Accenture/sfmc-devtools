import chai from 'chai';
import chaiFiles from 'chai-files';
const assert = chai.assert;
const expect = chai.expect;
chai.use(chaiFiles);
import * as testUtils from './utils.js';
import handler from '../lib/index.js';

describe('GENERAL', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });
    afterEach(() => {
        testUtils.mockReset();
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
});
