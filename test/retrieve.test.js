const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

const fsmock = require('mock-fs');

const assert = require('chai').assert;
const path = require('path');
const cache = require('../lib/util/cache');

const authResources = require('./resources/auth.json');
const resourceFactory = require('./resourceFactory');

// test specific
const Retriever = require('../lib/Retriever');
const File = require('../lib/util/file');
const Util = require('../lib/util/util');
const testUtil = require('./utils');
let apimock;
describe('retrieve', () => {
    beforeEach(() => {
        apimock = new MockAdapter(axios, { onNoMatch: 'throwException' });
        apimock
            .onPost(authResources.success.url)
            .reply(authResources.success.status, authResources.success.response);
        fsmock({
            '.mcdevrc.json': fsmock.load(path.resolve(__dirname, 'workingDir/.mcdevrc.json')),
            '.mcdev-auth.json': fsmock.load(path.resolve(__dirname, 'workingDir/.mcdev-auth.json')),
            test: fsmock.load(path.resolve(__dirname)),
        });
    });
    afterEach(() => {
        // mock.reset();
        apimock.restore();
    });

    it('Should retrieve a data extension', async () => {
        // GIVEN
        const properties = await File.loadConfigFile();
        const buObject = {
            clientId: '71fzp43cyb1aksgflc159xxx',
            clientSecret: 'oDZE354QsMXzcFqKQlGgDxxx',
            credential: 'testInstance',
            tenant: 'mct0l7nxfq2r988t1kxfy8sc4xxx',
            mid: '9999999',
            businessUnit: 'testBU',
        };
        apimock
            .onPost(resourceFactory.soapUrl)
            .reply((config) => resourceFactory.handleSOAPRequest(config, buObject));

        cache.initCache(buObject);
        const client = await Util.getETClient(buObject);
        // WHEN
        const r = new Retriever(properties, buObject, client);
        const result = await r.retrieve(['dataExtension']);
        // THEN
        assert.equal(
            Object.keys(result.dataExtension).length,
            1,
            'only one data extension expected'
        );
        assert.deepEqual(
            await testUtil.getExpectedSoap(buObject.businessUnit, 'dataExtension', 'retrieve'),
            await testUtil.getActualSoap(result, 'dataExtension'),
            'returned metadata was not equal expected'
        );

        return;
    });
});
