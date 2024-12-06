/**
 *
 * @param {any} definition type definition
 * @param {any} item MetadataItem
 * @param {string} targetDir folder in which the MetadataItem is deployed from (deploy/cred/bu)
 * @param {CodeExtract[]} [codeExtractItemArr] array of code snippets
 * @returns {Promise.<any>} MetadataItem
 */
export default function validation(definition: any, item: any, targetDir: string, codeExtractItemArr?: CodeExtract[]): Promise<any>;
export type validationRuleList = import("../../types/mcdev.d.js").validationRuleList;
export type validationRuleTest = import("../../types/mcdev.d.js").validationRuleTest;
export type CodeExtract = import("../../types/mcdev.d.js").CodeExtract;
//# sourceMappingURL=validations.d.ts.map