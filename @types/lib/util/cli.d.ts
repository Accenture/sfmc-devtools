export default Cli;
export type AuthObject = import("../../types/mcdev.d.js").AuthObject;
export type BuObject = import("../../types/mcdev.d.js").BuObject;
export type Cache = import("../../types/mcdev.d.js").Cache;
export type CodeExtract = import("../../types/mcdev.d.js").CodeExtract;
export type CodeExtractItem = import("../../types/mcdev.d.js").CodeExtractItem;
export type DeltaPkgItem = import("../../types/mcdev.d.js").DeltaPkgItem;
export type Mcdevrc = import("../../types/mcdev.d.js").Mcdevrc;
export type MetadataTypeItem = import("../../types/mcdev.d.js").MetadataTypeItem;
export type MetadataTypeItemDiff = import("../../types/mcdev.d.js").MetadataTypeItemDiff;
export type MetadataTypeItemObj = import("../../types/mcdev.d.js").MetadataTypeItemObj;
export type MetadataTypeMap = import("../../types/mcdev.d.js").MetadataTypeMap;
export type MetadataTypeMapObj = import("../../types/mcdev.d.js").MetadataTypeMapObj;
export type MultiMetadataTypeList = import("../../types/mcdev.d.js").MultiMetadataTypeList;
export type MultiMetadataTypeMap = import("../../types/mcdev.d.js").MultiMetadataTypeMap;
export type SoapRequestParams = import("../../types/mcdev.d.js").SoapRequestParams;
export type TemplateMap = import("../../types/mcdev.d.js").TemplateMap;
export type TypeKeyCombo = import("../../types/mcdev.d.js").TypeKeyCombo;
export type ExplainType = import("../../types/mcdev.d.js").ExplainType;
declare namespace Cli {
    /**
     * used when initially setting up a project.
     * loads default config and adds first credential
     *
     * @returns {Promise.<string | boolean>} success of init
     */
    function initMcdevConfig(): Promise<string | boolean>;
    /**
     * Extends template file for properties.json
     *
     * @param {Mcdevrc} properties config file's json
     * @returns {Promise.<boolean | string>} status
     */
    function addExtraCredential(properties: Mcdevrc): Promise<boolean | string>;
    /**
     *
     * @param {string[]} dependentTypes types that depent on type
     * @returns {Promise.<boolean>} true if user wants to continue with retrieve
     */
    function postFixKeysReretrieve(dependentTypes: string[]): Promise<boolean>;
    /**
     * helper that logs to cli which credentials are already existing in our config file
     *
     * @param {Mcdevrc} properties config file's json
     * @returns {void}
     */
    function logExistingCredentials(properties: Mcdevrc): void;
    /**
     * Extends template file for properties.json
     * update credentials
     *
     * @param {Mcdevrc} properties config file's json
     * @param {string} credName name of credential that needs updating
     * @param {boolean} [refreshBUs] if this was triggered by mcdev join, do not refresh BUs
     * @returns {Promise.<string | boolean>} success of update
     */
    function updateCredential(properties: Mcdevrc, credName: string, refreshBUs?: boolean): Promise<string | boolean>;
    /**
     * Returns Object with parameters required for accessing API
     *
     * @param {Mcdevrc} properties object of all configuration including credentials
     * @param {string} target code of BU to use
     * @param {boolean | string} [isCredentialOnly] true:don't ask for BU | string: name of BU
     * @param {boolean} [allowAll] Offer ALL as option in BU selection
     * @returns {Promise.<BuObject>} credential to be used for Business Unit
     */
    function getCredentialObject(properties: Mcdevrc, target: string, isCredentialOnly?: boolean | string, allowAll?: boolean): Promise<BuObject>;
    /**
     * helps select the right credential in case of bad initial input
     *
     * @param {Mcdevrc} properties config file's json
     * @param {string} [credential] name of valid credential
     * @param {boolean} [isCredentialOnly] don't ask for BU if true
     * @param {boolean} [allowAll] Offer ALL as option in BU selection
     * @returns {Promise.<{businessUnit:string, credential:string}>} selected credential/BU combo
     */
    function _selectBU(properties: Mcdevrc, credential?: string, isCredentialOnly?: boolean, allowAll?: boolean): Promise<{
        businessUnit: string;
        credential: string;
    }>;
    /**
     * helper around _askCredentials
     *
     * @param {Mcdevrc} properties from config file
     * @param {string} [credName] name of credential that needs updating
     * @param {boolean} [refreshBUs] if this was triggered by mcdev join, do not refresh BUs
     * @returns {Promise.<boolean | string>} success of refresh or credential name
     */
    function _setCredential(properties: Mcdevrc, credName?: string, refreshBUs?: boolean): Promise<boolean | string>;
    /**
     * helper for {@link Cli.addExtraCredential}
     *
     * @param {Mcdevrc} properties from config file
     * @param {string} [credName] name of credential that needs updating
     * @returns {Promise.<object>} credential info
     */
    function _askCredentials(properties: Mcdevrc, credName?: string): Promise<object>;
    /**
     * allows updating the metadata types that shall be retrieved
     *
     * @param {Mcdevrc} properties config file's json
     * @param {string[]} [setTypesArr] skip user prompt and overwrite with this list if given
     * @returns {Promise.<void>} -
     */
    function selectTypes(properties: Mcdevrc, setTypesArr?: string[]): Promise<void>;
    /**
     * helper for {@link Cli.selectTypes} that converts subtypes back to main type if all and only defaults were selected
     * this keeps the config automatically upgradable when we add new subtypes or change what is selected by default
     *
     * @param {object} responses wrapper object for respones
     * @param {string[]} responses.selectedTypes what types the user selected
     * @param {string} type metadata type
     * @returns {void}
     */
    function _summarizeSubtypes(responses: {
        selectedTypes: string[];
    }, type: string): void;
    /**
     * shows metadata type descriptions
     *
     * @returns {ExplainType[]} list of supported types with their apiNames
     */
    function explainTypes(): ExplainType[];
}
//# sourceMappingURL=cli.d.ts.map