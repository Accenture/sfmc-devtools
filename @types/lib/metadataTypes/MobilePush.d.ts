export default MobilePush;
export type BuObject = import("../../types/mcdev.d.js").BuObject;
export type CodeExtract = import("../../types/mcdev.d.js").CodeExtract;
export type CodeExtractItem = import("../../types/mcdev.d.js").CodeExtractItem;
export type MetadataTypeItem = import("../../types/mcdev.d.js").MetadataTypeItem;
export type MetadataTypeItemDiff = import("../../types/mcdev.d.js").MetadataTypeItemDiff;
export type MetadataTypeItemObj = import("../../types/mcdev.d.js").MetadataTypeItemObj;
export type MetadataTypeMap = import("../../types/mcdev.d.js").MetadataTypeMap;
export type MetadataTypeMapObj = import("../../types/mcdev.d.js").MetadataTypeMapObj;
export type SoapRequestParams = import("../../types/mcdev.d.js").SoapRequestParams;
export type TemplateMap = import("../../types/mcdev.d.js").TemplateMap;
/**
 * @typedef {import('../../types/mcdev.d.js').BuObject} BuObject
 * @typedef {import('../../types/mcdev.d.js').CodeExtract} CodeExtract
 * @typedef {import('../../types/mcdev.d.js').CodeExtractItem} CodeExtractItem
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItem} MetadataTypeItem
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItemDiff} MetadataTypeItemDiff
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItemObj} MetadataTypeItemObj
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMap} MetadataTypeMap
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMapObj} MetadataTypeMapObj
 * @typedef {import('../../types/mcdev.d.js').SoapRequestParams} SoapRequestParams
 * @typedef {import('../../types/mcdev.d.js').TemplateMap} TemplateMap
 */
/**
 * MobilePush MetadataType
 *
 * @augments MetadataType
 */
declare class MobilePush extends MetadataType {
    /**
     * Retrieves Metadata of Mobile Keywords
     * get all: https://developer.salesforce.com/docs/marketing/marketing-cloud/references/mc_rest_push?meta=Get%2BPush%2BMessages
     * get one: https://developer.salesforce.com/docs/marketing/marketing-cloud/references/mc_rest_push?meta=Get%2Ba%2BPush%2BMessage%2Bby%2BID
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static retrieve(retrieveDir: string, _?: void | string[], __?: void | string[], key?: string): Promise<MetadataTypeMapObj>;
    /**
     * Retrieves event definition metadata for caching
     *
     * @param {void | string[]} [_] parameter not used
     * @param {void | string[]} [__] parameter not used
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static retrieveForCache(_?: void | string[], __?: void | string[], key?: string): Promise<MetadataTypeMapObj>;
    /**
     * Updates a single item
     * docs: https://developer.salesforce.com/docs/marketing/marketing-cloud/references/mc_rest_push?meta=Update%2Ba%2BPush%2BMessage
     *
     * @param {MetadataTypeItem} metadata a single item
     * @returns {Promise} Promise
     */
    static update(metadata: MetadataTypeItem): Promise<any>;
    /**
     * Creates a single item
     * docs: https://developer.salesforce.com/docs/marketing/marketing-cloud/references/mc_rest_push?meta=Create%2Ba%2BPush%2BMessage
     *
     * @param {MetadataTypeItem} metadata a single item
     * @returns {Promise} Promise
     */
    static create(metadata: MetadataTypeItem): Promise<any>;
    /**
     * manages post retrieve steps
     * field definitions: https://developer.salesforce.com/docs/marketing/marketing-cloud/references/mc_rest_push?meta=Get%2Ba%2BPush%2BMessage%2Bby%2BID
     *
     * @param {MetadataTypeItem} metadata a single query
     * @returns {MetadataTypeItem} Array with one metadata object and one query string
     */
    static postRetrieveTasks(metadata: MetadataTypeItem): MetadataTypeItem;
    /**
     * prepares an event definition for deployment
     *
     * @param {MetadataTypeItem} metadata a single MobilePush
     * @returns {Promise.<MetadataTypeItem>} Promise
     */
    static preDeployTasks(metadata: MetadataTypeItem): Promise<MetadataTypeItem>;
}
declare namespace MobilePush {
    let definition: {
        bodyIteratorField: string;
        dependencies: string[];
        dependencyGraph: {
            mobileApplication: string[];
        };
        hasExtended: boolean;
        idField: string;
        keepId: boolean;
        keyIsFixed: boolean;
        keyField: string;
        nameField: string;
        createdDateField: any;
        createdNameField: any;
        lastmodDateField: string;
        lastmodNameField: any;
        restPagination: boolean;
        restPageSize: number;
        type: string;
        typeDescription: string;
        typeRetrieveByDefault: boolean;
        typeCdpByDefault: boolean;
        typeName: string;
        fields: {
            allowSingleOptin: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            audience: {
                skipValidation: boolean;
            };
            'audience[]': {
                skipValidation: boolean;
            };
            campaigns: {
                skipValidation: boolean;
            };
            'campaigns[]': {
                skipValidation: boolean;
            };
            r__mobileCode_key: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'code.code': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'code.codeType': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'code.countryCode': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'code.createdDate': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'code.dipSwitches': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'code.endDate': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'code.id': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'code.isClientOwned': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'code.isGsmCharacterSetOnly': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'code.isMms': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'code.isOwner': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'code.isShortCode': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'code.isStackIndependant': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'code.keywordLimit': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'code.keywordsUsed': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'code.keywordsUsedOther': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'code.lastUpdated': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'code.moEngineVersion': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'code.sendableCountries': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'code.sendableCountries[]': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'code.sendableCountries[].countryCode': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'code.sendableCountries[].vendor': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'code.sendableCountries[].fromNameSupported': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'code.startDate': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'code.supportsConcatenation': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            concatenateMessage: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            currentEditStep: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            doubleOptinConfirmMessage: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            doubleOptinInitialMessage: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            doubleOptinValidResponses: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            duplicateOptInResponseMessage: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            expireHours: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            fromName: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            id: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            invalidMessage: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            isCertified: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            isDuplicationAllowed: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            isExpireSet: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            isFromNameCertificationAccepted: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            isSentImmediately: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            isSubscriberResponseToAnySubscriptionForShortCode: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            isSuppressMt: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            isTest: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            isTimeZoneBased: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'keyword.id': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'keyword.isInherited': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'keyword.keyword': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'keyword.r__mobileKeyword_key': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'keyword.keywordType': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'keyword.restriction': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            lastUpdated: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            messageObjectId: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            messagesPerPeriod: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            minutesPerPeriod: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            moStartDate: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            moEndDate: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'moTimezone.name': {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'moTimezone.offset': {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'mtRecurrence.id': {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'mtRecurrence.key': {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'mtRecurrence.createdDate': {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'mtRecurrence.createdBy': {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'mtRecurrence.lastUpdated': {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'mtRecurrence.lastUpdatedBy': {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'mtRecurrence.name': {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'mtRecurrence.description': {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'mtRecurrence.startDate': {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'mtRecurrence.iCalRecur': {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'mtRecurrence.timeZone': {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'mtRecurrence.timeZoneId': {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            mtSendDate: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            name: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            nextJob: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            nextKeyword: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            numberMessagesPerPeriod: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            optinErrorMessage: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            optinInvalidAgeMessage: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            optinMinimumAge: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            optinType: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            origin: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            outboundSendBehaviorFlag: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            outboundSendTypeFlag: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            periodType: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            programId: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            publishedMessage: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            responseMessage: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            sendMethod: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            smsTriggeredSendDefinitionId: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            statistics: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'statistics.outbound': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'statistics.outbound.sent': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'statistics.outbound.delivered': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'statistics.outbound.undelivered': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'statistics.outbound.unknown': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            status: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            statusId: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'subscriptionKeyword.id': {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'subscriptionKeyword.keyword': {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'subscriptionKeyword.r__mobileKeyword_key': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'subscriptionKeyword.restriction': {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'subscriptionKeyword.isInherited': {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'nextKeyword.id': {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'nextKeyword.keyword': {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'nextKeyword.r__mobileKeyword_key': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'nextKeyword.restriction': {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'nextKeyword.isInherited': {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            subscriberResponseMessage: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            surveyCorrectResponseMessage: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            surveyIncorrectResponseMessage: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            surveyResponsesAllowed: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            surveyTooManyEntriesMessage: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            surveyType: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'template.description': {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'template.icon': {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'template.id': {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'template.lastUpdated': {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'template.name': {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            text: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            triggeredSendId: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            triggeredSendName: {
                isCreatable: boolean;
                isUpdatable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            type: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            r__campaign_key: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'r__campaign_key[]': {
                skipValidation: boolean;
            };
        };
    };
}
import MetadataType from './MetadataType.js';
//# sourceMappingURL=MobilePush.d.ts.map