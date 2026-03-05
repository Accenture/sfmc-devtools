import * as chai from 'chai';
const assert = chai.assert;
// const expect = chai.expect;

import chaiFiles from 'chai-files';
import cache from '../lib/util/cache.js';
import * as testUtils from './utils.js';
import handler from '../lib/index.js';
import { Util } from '../lib/util/util.js';
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
                40,
                'unexpected number of folders in cache'
            );

            // check what was deployed
            assert.deepEqual(
                deployed['testInstance/testBU']?.folder
                    ? Object.values(deployed['testInstance/testBU']?.folder).map((f) => f.Path)
                    : null,
                [
                    'Data Extensions/my',
                    'Data Extensions/testExisting_folder',
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
            const updateSoapCallouts = testUtils.getSoapCallouts('Update', 'DataFolder');
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
            // confirm updated item - this should have updated despite the folder name being different (changed case). The server compares folders case insensitively
            assert.deepEqual(
                updateSoapCallouts,
                [
                    '<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><Body><UpdateRequest xmlns="http://exacttarget.com/wsdl/partnerAPI"><Objects xsi:type="DataFolder"><Name>testExisting_folder</Name><IsActive>true</IsActive><IsEditable>true</IsEditable><AllowChildren>true</AllowChildren><ParentFolder><ID>2</ID></ParentFolder><ID>66666</ID></Objects></UpdateRequest></Body><Header><fueloauth xmlns="http://exacttarget.com">9999999</fueloauth></Header></Envelope>',
                ],
                'update-payload XL was not equal expected'
            );

            // check number of API calls
            assert.equal(
                testUtils.getAPIHistoryLength(),
                11,
                'Unexpected number of requests made. Run testUtils.logAPIHistoryDebug() to see the requests'
            );
            return;
        });

        it('Should create folder when same path exists in another Business Unit', async () => {
            // prepare
            // Use folder deploy data with an asset folder path
            testUtils.copyToDeploy('folder-deploy-samepath', 'folder');
            // Use a modified retrieve response that includes 'Content Builder/testFolder_samePath'
            // from a different BU (Client.ID=1111111). ContentType 'asset' is in folderTypesFromParent
            // so it will be cached even though it belongs to another BU - simulating the bug scenario
            await testUtils.copyFile(
                'dataFolder/retrieve-samePathOtherBU-response.xml',
                'dataFolder/retrieve-response.xml'
            );

            const deployed = await handler.deploy('testInstance/testBU', ['folder']);
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');

            // check what was deployed - 'Content Builder/testFolder_samePath' should be created
            // even though it exists in another BU (1111111)
            const deployedFolderPaths = deployed['testInstance/testBU']?.folder
                ? Object.values(deployed['testInstance/testBU']?.folder).map((f) => f.Path)
                : [];
            assert.include(
                deployedFolderPaths,
                'Content Builder/testFolder_samePath',
                "'Content Builder/testFolder_samePath' should have been created in current BU, not skipped because it exists in another BU"
            );

            const createSoapCallouts = testUtils.getSoapCallouts('Create', 'DataFolder');
            // 'Content Builder/testFolder_samePath' must be created in current BU (not skipped due to same path in other BU)
            assert.ok(
                createSoapCallouts.some(
                    (c) =>
                        c.includes('<Name>testFolder_samePath</Name>') &&
                        c.includes('<ContentType>asset</ContentType>') &&
                        c.includes('<ParentFolder><ID>89397</ID></ParentFolder>')
                ),
                "'Content Builder/testFolder_samePath' folder creation callout not found - folder was incorrectly skipped"
            );
            return;
        });

        it('Should create a folder whose name contains a slash character (direct folder deploy)', async () => {
            // GIVEN a folder deploy file named Headers%2FFolders.folder-meta.json with Name "Headers/Folders"
            // (the % encoding represents the actual '/' in the SFMC folder name)
            testUtils.copyToDeploy('folder-deploy-slash', 'folder');

            const deployed = await handler.deploy('testInstance/testBU', ['folder']);
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');

            // Verify the deployed path uses the escape char (∕) not the real slash
            const deployedFolderPaths = deployed['testInstance/testBU']?.folder
                ? Object.values(deployed['testInstance/testBU']?.folder).map((f) => f.Path)
                : [];
            assert.include(
                deployedFolderPaths,
                'Content Builder/Headers' + Util.folderNameSlashEscapeChar + 'Folders',
                'deployed folder path should use escape char for the slash in folder name'
            );

            // Verify that the SOAP Create callout uses the REAL slash character in the Name field
            // (not the escape character), so that SFMC creates a folder named "Headers/Folders"
            const createSoapCallouts = testUtils.getSoapCallouts('Create', 'DataFolder');
            assert.ok(
                createSoapCallouts.some(
                    (c) =>
                        c.includes('<Name>Headers/Folders</Name>') &&
                        c.includes('<ContentType>asset</ContentType>') &&
                        c.includes('<ParentFolder><ID>89397</ID></ParentFolder>')
                ),
                "SOAP create for 'Headers/Folders' should use the real slash in Name, not the escape char"
            );
            // Verify the escape char was NOT sent as the folder name
            assert.ok(
                !createSoapCallouts.some((c) =>
                    c.includes('<Name>Headers' + Util.folderNameSlashEscapeChar + 'Folders</Name>')
                ),
                'SOAP create should NOT use the escape char in the Name field'
            );
            return;
        });

        it('Should create a folder whose name contains a slash when triggered via r__folder_Path from another type (script)', async () => {
            // GIVEN a script deploy with r__folder_Path pointing to a subfolder whose name contains a slash
            // The escape char (∕) in r__folder_Path separates the slash-in-name from path separators
            testUtils.copyToDeploy('script-slashfolder-deploy', 'script');

            const deployed = await handler.deploy('testInstance/testBU', ['script']);
            // THEN
            assert.equal(process.exitCode, 0, 'deploy should not have thrown an error');

            // Verify the script was deployed
            assert.equal(
                deployed['testInstance/testBU']?.script
                    ? Object.keys(deployed['testInstance/testBU']?.script).length
                    : 0,
                1,
                'one script should have been deployed'
            );

            // Verify the auto-generated folder was created with REAL slash in the SOAP Name field
            // (not the escape char), so SFMC creates a folder named "Headers/Folders"
            const createSoapCallouts = testUtils.getSoapCallouts('Create', 'DataFolder');
            assert.ok(
                createSoapCallouts.some(
                    (c) =>
                        c.includes('<Name>Headers/Folders</Name>') &&
                        c.includes('<ContentType>ssjsactivity</ContentType>') &&
                        c.includes('<ParentFolder><ID>304</ID></ParentFolder>')
                ),
                "SOAP create for 'Scripts/Headers∕Folders' should send <Name>Headers/Folders</Name> with real slash"
            );
            // Verify the escape char was NOT sent as the folder name
            assert.ok(
                !createSoapCallouts.some((c) =>
                    c.includes('<Name>Headers' + Util.folderNameSlashEscapeChar + 'Folders</Name>')
                ),
                'SOAP create should NOT use the escape char in the Name field'
            );
            return;
        });
    });
});
