'use strict';

/** @type {Object.<string, string[]>} */
const buPrefixBlacklistMap = {
    testBU: ['testBlacklist_'],
    _ParentBU_: ['testBlacklist_'],
};

/**
 *
 * @param {any} definition - type defintiion
 * @param {any} item - metadata json
 * @param {string} targetDir - where the metadata is stored ("deploy/cred/bu")
 * @param {any} Util - helper methods
 * @param {{subFolder: string[],fileName: string,fileExt: string,content: string,encoding?: "base64"}[]} [codeExtractItemArr] - actual code blocks
 * @returns {any} validation rule
 */
export function validation(definition, item, targetDir, Util, codeExtractItemArr) {
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
            /**
             * @returns {boolean|null} true=test passed, false=issue error, null=skip item for current activity due to --fix (build/deploy)
             */
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
                        return Util.OPTIONS.fix ? null : false;
                    }
                    // some components have unreadable keys and hence only have the brand prefix in the name
                    if (
                        item[definition.nameField] &&
                        ('' + item[definition.nameField]).startsWith(prefix)
                    ) {
                        // return false to issue an error or null to skip the item entirely (which is the "fix" of this rule)
                        return Util.OPTIONS.fix ? null : false;
                    }
                }
                // not found
                return true;
            },
        },
    };
}
