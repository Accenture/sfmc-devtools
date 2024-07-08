export default Auth;
export type AuthObject = import("../../types/mcdev.d.js").AuthObject;
export type BuObject = import("../../types/mcdev.d.js").BuObject;
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
declare namespace Auth {
    /**
     * For each business unit, set up base credentials to be used.
     *
     * @param {AuthObject} authObject details for
     * @param {string} credential of the instance
     * @returns {Promise.<void>} -
     */
    function saveCredential(authObject: AuthObject, credential: string): Promise<void>;
    /**
     * Returns an SDK instance to be used for API calls
     *
     * @param {BuObject} buObject information about current context
     * @returns {SDK} auth object
     */
    function getSDK(buObject: BuObject): SDK;
    /**
     * helper to clear all auth sessions
     *
     * @returns {void}
     */
    function clearSessions(): void;
}
import SDK from 'sfmc-sdk';
//# sourceMappingURL=auth.d.ts.map