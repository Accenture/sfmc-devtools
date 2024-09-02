'use strict';
import path from 'node:path';
import { Util } from './util.js';

let customRules = {};
let customRuleImport;
try {
    customRuleImport = await import('file://' + path.join(process.cwd(), '.mcdev-validations.js'));
} catch {
    Util.logger.debug('.mcdev-validations.js not found');
}
/**
 *
 * @param {any} definition type definition
 * @param {any} item MetadataItem
 * @returns {Promise.<any>} MetadataItem
 * @param {string} targetDir folder in which the MetadataItem is deployed from (deploy/cred/bu)
 */
export default async function validation(definition, item, targetDir) {
    try {
        if (customRuleImport) {
            customRules = customRuleImport
                ? await customRuleImport.validation(definition, item, targetDir, Util)
                : {};
        }
    } catch (ex) {
        Util.logger.error(
            'Could not load custom validation rules from .mcdev-validations.js: ' + ex.message
        );
    }
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
    return Object.assign({}, defaultRules, customRules);
}
