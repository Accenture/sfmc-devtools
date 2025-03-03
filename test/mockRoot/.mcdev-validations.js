'use strict';
/**
 * @typedef {Object.<string, any>} MetadataTypeItem generic metadata item
 *
 * @typedef {object} CodeExtract
 * @property {string[]} subFolder mostly set to null, otherwise subfolders path split into elements
 * @property {string} fileName name of file w/o extension
 * @property {string} fileExt file extension
 * @property {string} content file content
 * @property {'base64'} [encoding] optional for binary files
 *
 * @callback validationRuleFix
 * @returns {boolean|null} true = test passed; false = test failed & fixed; null = test failed & item removed to fix
 *
 * @callback validationRuleTest
 * @returns {boolean} true = test passed; false = test failed
 *
 * @typedef {object} validationRule
 * @property {string} failedMsg error message to display in case of a failed test
 * @property {validationRuleTest} passed test to run
 * @property {validationRuleFix} [fix] test to run
 *
 * @typedef {Object.<string, validationRule>} validationRuleList key=rule name
 */

/** @type {Object.<string, string[]>} */
const buPrefixBlacklistMap = {
    testBU: ['testBlacklist_'],
    _ParentBU_: ['testBlacklist_'],
};

/**
 *
 * @param {any} definition type definition
 * @param {MetadataTypeItem} item MetadataItem
 * @param {string} targetDir folder in which the MetadataItem is deployed from (deploy/cred/bu)
 * @param {CodeExtract[]} codeExtractItemArr array of code snippets
 * @param {any} Util utility functions
 * @returns {validationRuleList} MetadataItem
 */
export function validation(definition, item, targetDir, codeExtractItemArr, Util) {
    Util.logger.verbose('just here to not get a warning about the unused property Util');

    const bu =
        (targetDir.includes('/') ? targetDir.split('/').pop() : targetDir.split('\\').pop()) ||
        'not-found';
    const prefixBlacklist = buPrefixBlacklistMap[bu] || [];
    // eslint-disable-next-line no-unused-vars -- codeExtractItemArr is not used in this example
    const temp = codeExtractItemArr;

    return {
        filterPrefixByBu: {
            /**
             * @returns {string} failedMsg
             */
            get failedMsg() {
                return `Prefix not allowed on this BU. Blacklisted prefixes: ${prefixBlacklist.join(', ')}`;
            },
            /** @type {validationRuleFix} */
            fix: function () {
                // to fix we skip the component
                return this.passed() || null;
            },
            /** @type {validationRuleTest} */
            passed: function () {
                // this rule aims to prevent deploying things that dont belong on a BU
                if (prefixBlacklist.length === 0) {
                    // no blacklist defined for current BU
                    return true;
                }
                for (const prefix of prefixBlacklist) {
                    // most components have the brand prefixes in the key
                    if (
                        item[definition.keyField] &&
                        ('' + item[definition.keyField]).startsWith(prefix)
                    ) {
                        // return false to issue an error or null to skip the item entirely (which is the "fix" of this rule)
                        return false;
                    }
                    // some components have unreadable keys and hence only have the brand prefix in the name
                    if (
                        item[definition.nameField] &&
                        ('' + item[definition.nameField]).startsWith(prefix)
                    ) {
                        // return false to issue an error or null to skip the item entirely (which is the "fix" of this rule)
                        return false;
                    }
                }
                // not found
                return true;
            },
        },
    };
}
