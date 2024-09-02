'use strict';
import { Util } from './util.js';

/**
 *
 * @param {any} definition type definition
 * @param {any} item MetadataItem
 * @returns {Promise.<any>} MetadataItem
 */
export default async function validation(definition, item) {
    const defaultRules = {
        noGuidKeys: {
            failedMsg: 'Please update the key to a readable value. Currently still in GUID format.',
            /**
             * @returns {boolean} true=test passed
             */
            passed: function () {
                const key = item[definition.keyField];
                if (key) {
                    const regex = /^[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}$/i;
                    return !regex.test(String(key).toLowerCase());
                } else {
                    Util.logger.debug('validation-noGuidKeys: key not found');
                    return true;
                }
            },
        },
        noRootFolder: {
            failedMsg: 'Root folder not allowed. Current folder: ' + item.r__folder_Path,
            /**
             * @returns {boolean} true=test passed
             */
            passed: function () {
                /** @type {string} */
                const folderPath = item.r__folder_Path;
                if (!folderPath) {
                    // some types do not support folders
                    return true;
                }

                return folderPath.includes('/');
            },
        },
    };
    return defaultRules;
}
