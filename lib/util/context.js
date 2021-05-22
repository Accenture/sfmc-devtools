const { loadConfigFile } = require('./file');
const context = {};

exports.context = context;
exports.initContext = async (buObject) => {
    // todo preparing ot move loadConfig to async
    // one time initialization
    if (!context || !context.options) {
        context.package = require('../../package.json');
        const config = await loadConfigFile();
        // log config into context
        for (const key in config) {
            context[key] = config[key];
        }
        // build Business Unit Map for caching retrieval
        context.businessUnits = {};
        for (const cred in context.credentials) {
            for (const mid in context.credentials[cred].businessUnits) {
                context.businessUnits[context.credentials[cred].businessUnits[mid]] =
                    context.credentials[cred].eid;
            }
        }
    }

    // if buObject provided then set specific context (potentially multiple times)
    if (buObject) {
        this.context.local = {};
        for (const key in buObject) {
            this.context.local[key] = buObject[key];
        }
    }

    return this.context;
};
