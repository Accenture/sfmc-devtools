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

    it('GET Bulk: should return 6 journey items', async () => {
        // const factoryResult = await resourceFactory.loadType('create', 'dataExtension', 'create');
        // console.log(factoryResult);
        apimock.onPost(resourceFactory.soapUrl).reply(resourceFactory.handleSOAPRequest);
        try {
            const properties = await File.loadConfigFile();
            const buObject = {
                clientId: '71fzp43cyb1aksgflc159xxx',
                clientSecret: 'oDZE354QsMXzcFqKQlGgDxxx',
                credential: 'testInstance',
                tenant: 'mct0l7nxfq2r988t1kxfy8sc4xxx',
                mid: '9999999',
                businessUnit: 'testBU',
            };
            console.log('FUNCTION', resourceFactory.handleSOAPRequest);
            cache.initCache(buObject);
            const client = await Util.getETClient(buObject);

            const r = new Retriever(properties, buObject, client);
            const result = await r.retrieve(['dataExtension']);
            console.log('RESULT', result);
        } catch (ex) {
            console.log(ex);
        }

        // given
        // const { journeysPage1, journeysPage2 } = resources;
        // mock.onGet(journeysPage1.url).reply(journeysPage1.status, journeysPage1.response);
        // mock.onGet(journeysPage2.url).reply(journeysPage2.status, journeysPage2.response);
        // // when
        // const payload = await defaultSdk().rest.getBulk('interaction/v1/interactions', 5);
        // // then
        // assert.lengthOf(payload.items, 6);
        // assert.lengthOf(mock.history.post, 1);
        // assert.lengthOf(mock.history.get, 2);
        return;
    });
});
