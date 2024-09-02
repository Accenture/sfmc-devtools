/**
 *
 * @param {any} definition
 * @param {any} item
 * @param {string} targetDir
 */
export default function validation(definition: any, item: any, targetDir: string): Promise<{
    noGuidKeys: {
        failedMsg: string;
        /**
         * @returns {boolean} true=test passed
         */
        passed: () => boolean;
    };
    noRootFolder: {
        failedMsg: string;
        /**
         * @returns {boolean} true=test passed
         */
        passed: () => boolean;
    };
}>;
//# sourceMappingURL=validations.d.ts.map