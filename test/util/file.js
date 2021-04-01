const assert = require('chai').assert;
const File = require('../../lib/util/file');
const fs = require('fs-extra');
const path = require('path');

const dataDir = 'test_tmp/file/';

describe('File', () => {
    after(() => {
        fs.removeSync(dataDir);
    });
    describe('#writeJSONToFile()', () => {
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
            await File.writeJSONToFile(dataDir, 'test1', jsonContent);
            assert.deepEqual(fs.readJSONSync(dataDir + 'test1.json'), jsonContent);
        });
    });
    describe('#copyFile()', () => {
        it('should copy file from one path to another', async () => {
            const source = path.join(dataDir, 'sourceFile.txt');
            const target = path.join(dataDir, 'targetFile.txt');
            fs.writeFileSync(source, 'filecontent');
            assert.strictEqual(fs.existsSync(source), true);
            await File.copyFile(source, target);
            assert.strictEqual(fs.existsSync(target), true);
            assert.deepEqual(fs.readFileSync(source), fs.readFileSync(target));
        });
        it("should skip copy if source file doesn't exist", async () => {
            const source = path.join(dataDir, 'doesnt_exist_source.txt');
            const target = path.join(dataDir, 'doesnt_exist_target.txt');
            assert.strictEqual(fs.existsSync(source), false);
            const result = await File.copyFile(source, target);
            assert.strictEqual(fs.existsSync(target), false);
            assert.deepEqual(result, {
                status: 'skipped',
                statusMessage: 'deleted from repository',
                file: source,
            });
        });
    });
});
