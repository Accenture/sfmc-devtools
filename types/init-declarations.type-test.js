import InitConfig from '../@types/lib/util/init.config.js';
import InitNpm from '../@types/lib/util/init.npm.js';

const properties = /** @type {import('./mcdev.d.js').Mcdevrc} */ ({});

/** @type {Promise.<boolean>} */
export const fixMcdevConfigResult = InitConfig.fixMcdevConfig(properties, '10.0.0');

/** @type {Promise.<boolean>} */
export const installDependenciesResult = InitNpm.installDependencies('repository', '10.0.0');
