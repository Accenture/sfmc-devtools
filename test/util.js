const assert = require('chai').assert;
const fs = require('fs-extra');
const Util = require('../lib/util');
const dataDir = 'test_tmp/util/';

describe('Util', () => {
    after(() => {
        fs.removeSync(dataDir);
    });
    describe('#writeJSONToFile', () => {
        it('should create json file and directory', async () => {
            assert.strictEqual(fs.existsSync(dataDir + 'test1.json'), false);
            const jsonContent = {
                string: 'abc',
                boolean: true,
                number: 5,
                array: ['asd', 4, 'asdf'],
                obj: {
                    name: 'object',
                },
            };
            await Util.writeJSONToFile(dataDir, 'test1', jsonContent);
            assert.deepEqual(fs.readJSONSync(dataDir + 'test1.json'), jsonContent);
        });
    });
});
