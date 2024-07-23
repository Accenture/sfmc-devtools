declare namespace _default {
    let bodyIteratorField: string;
    let dependencies: string[];
    namespace dependencyGraph {
        let mobileCode: string[];
        let mobileKeyword: string[];
    }
    let hasExtended: boolean;
    let idField: string;
    let keepId: boolean;
    let keyIsFixed: boolean;
    let keyField: string;
    let nameField: string;
    let createdDateField: any;
    let createdNameField: any;
    let lastmodDateField: string;
    let lastmodNameField: any;
    let restPagination: boolean;
    let restPageSize: number;
    let type: string;
    let typeDescription: string;
    let typeRetrieveByDefault: boolean;
    let typeName: string;
    let fields: {
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
}
export default _default;
//# sourceMappingURL=MobileMessage.definition.d.ts.map