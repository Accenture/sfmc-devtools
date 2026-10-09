/**
 * helper for validation
 *
 * @param {string} [root] project root containing the custom validation module
 * @returns {Promise.<void>} -
 */
export function loadCustomRules(root?: string): Promise<void>;
/**
 *
 * @param {{type:string, keyField:string, nameField:string}} definition type definition
 * @param {ReturnType<JSON['parse']>} item MetadataItem
 * @param {string} targetDir folder in which the MetadataItem is deployed from (deploy/cred/bu)
 * @param {CodeExtract[]} [codeExtractItemArr] array of code snippets
 * @param {string} [root] project root containing .mcdev-validations.js
 * @returns {Promise.<validationRuleList>} MetadataItem
 */
export default function validation(definition: {
    type: string;
    keyField: string;
    nameField: string;
}, item: ReturnType<JSON["parse"]>, targetDir: string, codeExtractItemArr?: CodeExtract[], root?: string): Promise<validationRuleList>;
export type validationRuleList = import("../../types/mcdev.d.js").validationRuleList;
export type validationRuleFix = import("../../types/mcdev.d.js").validationRuleFix;
export type validationRuleTest = import("../../types/mcdev.d.js").validationRuleTest;
export type CodeExtract = import("../../types/mcdev.d.js").CodeExtract;
//# sourceMappingURL=validations.d.ts.map