import * as chai from 'chai';
const assert = chai.assert;
// const expect = chai.expect;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
chai.use(chaiFiles);

describe('type: folder', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });

    afterEach(() => {
        testUtils.mockReset();
    });

    describe('Deploy ================', () => {
        it('Should create automation & dataExtension folders', async () => {
            // prepare
            testUtils.copyToDeploy('folder-deploy', 'folder');
            await testUtils.copyFile(
                'dataFolder/+retrieve-response.xml',
                'dataFolder/retrieve-response.xml'
            );
            await testUtils.copyFile(
                'dataFolder/+retrieve-QAA-response.xml',
                'dataFolder/retrieve-QAA-response.xml'
            );

            const deployed = await handler.deploy('testInstance/testBU', ['folder']);
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');
            // get results from cache
            const cached = cache.getCache();
            assert.equal(
                cached.folder ? Object.keys(cached.folder).length : 0,
                38,
                'unexpected number of folders in cache'
            );

            // check what was deployed
            assert.deepEqual(
                deployed['testInstance/testBU']?.folder
                    ? Object.values(deployed['testInstance/testBU']?.folder).map((f) => f.Path)
                    : null,
                [
                    'Data Extensions/my',
                    'Data Extensions/my/sub',
                    'Data Extensions/my/sub/path',
                    'Data Extensions/my/sub/path/subpath',
                    'my automations/my',
                    'my automations/my/sub',
                    'my automations/my/sub/path',
                    'my automations/my/sub/path/subpath',
                ],
                'unexpected deployed folders'
            );
            // get callouts
            const createRestCallouts = testUtils.getRestCallout('post', '/email/v1/category', true);
            // confirm created item
            assert.deepEqual(
                createRestCallouts,
                [
                    { parentCatId: 290937, name: 'my', catType: 'automations' },
                    { parentCatId: 862100, name: 'sub', catType: 'automations' },
                    { parentCatId: 862101, name: 'path', catType: 'automations' },
                    { parentCatId: 862102, name: 'subpath', catType: 'automations' },
                ],
                'create-payload JSON was not equal expected'
            );

            const createSoapCallouts = testUtils.getSoapCallouts('Create', 'DataFolder');
            // confirm created item
            assert.deepEqual(
                createSoapCallouts,
                [
                    '<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><Body><CreateRequest xmlns="http://exacttarget.com/wsdl/partnerAPI"><Objects xsi:type="DataFolder"><Name>my</Name><Description></Description><ContentType>dataextension</ContentType><IsActive>true</IsActive><IsEditable>true</IsEditable><AllowChildren>true</AllowChildren><ParentFolder><ID>2</ID></ParentFolder></Objects></CreateRequest></Body><Header><fueloauth xmlns="http://exacttarget.com">9999999</fueloauth></Header></Envelope>',
                    '<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><Body><CreateRequest xmlns="http://exacttarget.com/wsdl/partnerAPI"><Objects xsi:type="DataFolder"><Name>sub</Name><Description></Description><ContentType>dataextension</ContentType><IsActive>true</IsActive><IsEditable>true</IsEditable><AllowChildren>true</AllowChildren><ParentFolder><ID>862001</ID></ParentFolder></Objects></CreateRequest></Body><Header><fueloauth xmlns="http://exacttarget.com">9999999</fueloauth></Header></Envelope>',
                    '<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><Body><CreateRequest xmlns="http://exacttarget.com/wsdl/partnerAPI"><Objects xsi:type="DataFolder"><Name>path</Name><Description></Description><ContentType>dataextension</ContentType><IsActive>true</IsActive><IsEditable>true</IsEditable><AllowChildren>true</AllowChildren><ParentFolder><ID>862002</ID></ParentFolder></Objects></CreateRequest></Body><Header><fueloauth xmlns="http://exacttarget.com">9999999</fueloauth></Header></Envelope>',
                    '<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><Body><CreateRequest xmlns="http://exacttarget.com/wsdl/partnerAPI"><Objects xsi:type="DataFolder"><Name>subpath</Name><Description></Description><ContentType>dataextension</ContentType><IsActive>true</IsActive><IsEditable>true</IsEditable><AllowChildren>true</AllowChildren><ParentFolder><ID>862003</ID></ParentFolder></Objects></CreateRequest></Body><Header><fueloauth xmlns="http://exacttarget.com">9999999</fueloauth></Header></Envelope>',
                ],
                'create-payload XL was not equal expected'
            );

            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                10,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });
    });
});
