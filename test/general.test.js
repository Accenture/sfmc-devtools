import chai from 'chai';
import chaiFiles from 'chai-files';
const assert = chai.assert;
const expect = chai.expect;
chai.use(chaiFiles);
import testUtils from './utils';
import handler from '../lib/index';

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
            assert.equal(!!process.exitCode, false, 'explainTypes should not have thrown an error');

            return;
        });
        it('with --json set', () => {
            handler.setOptions({ json: true });
            const typeArr = handler.explainTypes();

            assert.equal(
                !!process.exitCode,
                false,
                'explainTypes --json should not have thrown an error'
            );

            // check if properties are all there
            expect(typeArr[0]).to.have.all.keys(
                'name',
                'apiName',
                'default',
                'description',
                'supports'
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
