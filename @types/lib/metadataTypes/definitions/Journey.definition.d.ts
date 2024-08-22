declare namespace _default {
    let folderType: string;
    let bodyIteratorField: string;
    let dependencies: string[];
    namespace dependencyGraph {
        let event: string[];
        let dataExtension: string[];
        let list: string[];
        let senderProfile: string[];
        let sendClassification: string[];
        let asset: string[];
        let mobileMessage: string[];
        let mobileKeyword: string[];
        let mobileCode: string[];
    }
    let folderIdField: string;
    let hasExtended: boolean;
    let idField: string;
    let keyIsFixed: boolean;
    let keyField: string;
    let nameField: string;
    let createdDateField: string;
    let createdNameField: any;
    let lastmodDateField: string;
    let lastmodNameField: any;
    let restPagination: boolean;
    let restPageSize: number;
    let type: string;
    let typeDescription: string;
    let typeRetrieveByDefault: boolean;
    let typeName: string;
    namespace priorityMapping {
        let High: number;
        let Medium: number;
        let Low: number;
    }
    let fields: {
        activities: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].id': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].key': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].name': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].description': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].type': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].outcomes': {
            skipValidation: boolean;
        };
        'activities[].arguments': {
            skipValidation: boolean;
        };
        'activities[].configurationArguments': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.autoAddSubscribers': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.autoUpdateSubscribers': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.bccEmail': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.categoryId': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.ccEmail': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.created': {
            skipValidation: boolean;
        };
        'activities[].configurationArguments.triggeredSend.description': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.domainExclusions': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.dynamicEmailSubject': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.emailSubject': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.exclusionFilter': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.isSalesforceTracking': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.isMultipart': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.isSendLogging': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.isStoppedOnJobError': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.keyword': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.modified': {
            skipValidation: boolean;
        };
        'activities[].configurationArguments.triggeredSend.name': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.preHeader': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.replyToAddress': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.replyToDisplayName': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.suppressTracking': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.triggeredSendStatus': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.version': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.throttleOpens': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.throttleCloses': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.throttleLimit': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.isTrackingClicks': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.emailId': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.r__triggeredSend_key': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.senderProfileId': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.r__senderProfile_key': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        ' activities[].configurationArguments.triggeredSend.sendClassificationId': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.r__sendClassification_key': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.r__list_PathName': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.publicationListId': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.r__list_PathName.publicationList': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.r__list_PathName.suppressionLists': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.r__dataExtension_key': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.r__dataExtension_key.domainExclusions': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.priority': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.c__priority': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.r__asset_name_readOnly': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.triggeredSend.r__asset_key': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.applicationExtensionKey': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.r__transactionalEmail_key': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.applicationExtensionId': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.isModified': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.isSimulation': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.googleAnalyticsCampaignName': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.useLLTS': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.fuelAgentRequested': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.r__triggeredSend_key': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.waitDuration': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.waitUnit': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.specifiedTime': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.timeZone': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.description': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.waitEndDateAttributeExpression': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.specificDate': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.waitForEventKey': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.schemaVersionId': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'activities[].configurationArguments.criteria': {
            skipValidation: boolean;
        };
        'activities[].configurationArguments.eventDataConfig': {
            skipValidation: boolean;
        };
        'activities[].metaData': {
            skipValidation: boolean;
        };
        'activities[].schema': {
            skipValidation: boolean;
        };
        categoryId: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        channel: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        createdDate: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'defaults.email': {
            skipValidation: boolean;
        };
        'defaults.mobileNumber': {
            skipValidation: boolean;
        };
        'defaults.properties.analyticsTracking.enabled': {
            isCreateable: any;
            isUpdateable: any;
            retrieving: any;
            template: any;
        };
        'defaults.properties': {
            skipValidation: boolean;
        };
        'defaults.properties.analyticsTracking.analyticsType': {
            isCreateable: any;
            isUpdateable: any;
            retrieving: any;
            template: any;
        };
        'defaults.properties.analyticsTracking.urlDomainsToTrack': {
            isCreateable: any;
            isUpdateable: any;
            retrieving: any;
            template: any;
        };
        definitionId: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        definitionType: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        description: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        entryMode: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        executionMode: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        exits: {
            skipValidation: boolean;
        };
        goals: {
            skipValidation: boolean;
        };
        healthStats: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        id: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        key: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        lastPublishedDate: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'metaData.templateId': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        modifiedDate: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        name: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        scheduledStatus: {
            isCreateable: any;
            isUpdateable: any;
            retrieving: any;
            template: any;
        };
        stats: {
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
        triggers: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].id': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].key': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].name': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].description': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].type': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].outcomes': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].arguments': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].arguments.startActivityKey': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].arguments.dequeueReason': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].arguments.lastExecutedActivityKey': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].arguments.filterResult': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].arguments.serializedObjectType': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].arguments.eventDefinitionId': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].arguments.eventDefinitionKey': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].arguments.dataExtensionId': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].arguments.automationId': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].arguments.r__event_key': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].arguments.r__dataExtension_key': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].configurationArguments': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].configurationArguments.eventDataConfig': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].configurationArguments.primaryObjectFilterCriteria': {
            skipValidation: boolean;
        };
        'triggers[].configurationArguments.relatedObjectFilterCriteria': {
            skipValidation: boolean;
        };
        'triggers[].configurationArguments.salesforceTriggerCriteria': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].configurationArguments.objectAPIName': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].configurationArguments.version': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].configurationArguments.contactKey': {
            skipValidation: boolean;
        };
        'triggers[].configurationArguments.contactPersonType': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].configurationArguments.primaryObjectFilterSummary': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].configurationArguments.relatedObjectFilterSummary': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].configurationArguments.eventDataSummary': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].configurationArguments.evaluationCriteriaSummary': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].configurationArguments.applicationExtensionKey': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].configurationArguments.passThroughArgument': {
            skipValidation: boolean;
        };
        'triggers[].configurationArguments.filterDefinitionId': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].configurationArguments.criteria': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].configurationArguments.schemaVersionId': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].configurationArguments.whoToInject': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].configurationArguments.objectApiName': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].configurationArguments.additionalObjectFilterCriteria': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].metaData': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].metaData.sourceInteractionId': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].metaData.entrySourceGroupConfigUrl': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].metaData.r__event_key': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].metaData.category': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].metaData.eventDefinitionId': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].metaData.eventDefinitionKey': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].metaData.chainType': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].metaData.configurationRequired': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].metaData.iconUrl': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].metaData.title': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        version: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        workflowApiVersion: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        metaData: {
            skipValidation: boolean;
        };
        notifiers: {
            skipValidation: boolean;
        };
        tags: {
            skipValidation: boolean;
        };
        r__folder_Path: {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
    };
}
export default _default;
//# sourceMappingURL=Journey.definition.d.ts.map