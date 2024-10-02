'use strict';
import path from 'node:path';
import { Util } from './util.js';

/**
 * @typedef {import('../../types/mcdev.d.js').validationRuleList} validationRuleList
 * @typedef {import('../../types/mcdev.d.js').validationRuleTest} validationRuleTest
 * @typedef {import('../../types/mcdev.d.js').CodeExtract} CodeExtract
 */

/** @type {validationRuleList} */
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
 * @param {string} targetDir folder in which the MetadataItem is deployed from (deploy/cred/bu)
 * @param {CodeExtract[]} [codeExtractItemArr] array of code snippets
 * @returns {Promise.<any>} MetadataItem
 */
export default async function validation(definition, item, targetDir, codeExtractItemArr) {
    try {
        if (customRuleImport) {
            customRules = customRuleImport
                ? await customRuleImport.validation(definition, item, targetDir, Util)
                : {};
        }
    } catch (ex) {
        Util.logger.errorStack(
            ex,
            'Could not load custom validation rules from .mcdev-validations.js'
        );
    }
    /** @type {validationRuleList} */
    const defaultRules = {
        noGuidKeys: {
            failedMsg: 'Please update the key to a readable value. Currently still in GUID format.',
            /**
             * @type {validationRuleTest}
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
             * @type {validationRuleTest}
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
        noAmpscriptHtmlTag: {
            failedMsg:
                'Please use %%[]%% instead of <script runat="server" language="ampscript"></script> for AMPscript',
            /**
             * @type {validationRuleTest}
             */
            passed: function () {
                if (definition.type === 'asset' && Array.isArray(codeExtractItemArr)) {
                    for (const codeExtractItem of codeExtractItemArr) {
                        if (
                            codeExtractItem.content.includes(
                                '<script runat="server" language="ampscript'
                            )
                        ) {
                            return false;
                        }
                    }
                    return true;
                } else {
                    return true; // test case should pass since non-asset metadatatypes get a pass
                }
            },
        },
    };
    return Object.assign({}, defaultRules, customRules);
}
