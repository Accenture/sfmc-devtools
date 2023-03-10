const testUtils = require('./utils');

describe('mobileMessage', () => {
    beforeEach(() => {
        testUtils.mockSetup();
    });
    afterEach(() => {
        testUtils.mockReset();
    });
});
