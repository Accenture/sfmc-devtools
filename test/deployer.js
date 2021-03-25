const assert = require('chai').assert;
const Deployer = require('../lib/Deployer');
const testDataDir = 'test/data/deployer/';

describe('Deployer', () => {
    describe('#readBUMetadata', () => {
        it('should read metadata from local filesystem', async () => {
            const metadata = Deployer.readBUMetadata(testDataDir);
            // Check that metadata was successfully read
            assert.exists(metadata.dataExtension);
            assert.exists(metadata.dataExtension.Test);
            assert.exists(metadata.dataExtension.Test.columns.idField);
            assert.exists(metadata.folder);
        });
    });
});
