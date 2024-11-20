// overview: https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/jb-api-specification.html
// obj definition: https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/getting-started-spec.html
// insert: https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/postCreateInteraction.html
// update: https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/putUpdateInteraction.html
export default {
    folderType: 'journey',
    bodyIteratorField: 'items',
    dependencies: [
        'folder-journey',
        'triggeredSend', // for EMAILV2-activity
        'dataExtension', // for transactionalEmails: EMAILV2-activity
        'deliveryProfile',
        'event', // for Multistep and Quicksend journeys
        'mobileMessage', // for SMSSYNC-activity
        'mobileCode', // for SMSSYNC-activity
        'mobileKeyword', // for SMSSYNC-activity
        'asset-asset', // for SMSSYNC-activity (sub-subtype jsonmessage)
        'list', // for EMAILV2-activity
        'email', // for EMAILV2-activity
        'asset-message', // for EMAILV2-activity
        'sendClassification', // for EMAILV2-activity
        'senderProfile', // for EMAILV2-activity
    ], // ! interaction and transactionalEmail both link to each other. caching transactionalEmail here "manually" instead of via dependencies array, assuming that it is quicker than the other way round
    dependencyGraph: {
        // classic email cannot be deployed anymore
        event: ['triggers.metaData.r__event_key'],
        dataExtension: [
            'activities.metaData.highThroughput.r__dataExtension_key',
            'activities.configurationArguments.triggeredSend.r__dataExtension_key.domainExclusions',
        ],
        deliveryProfile: ['activities.configurationArguments.triggeredSend.r__deliveryProfile_key'],
        list: [
            'activities.configurationArguments.triggeredSend.r__list_PathName.publicationList',
            'activities.configurationArguments.triggeredSend.r__list_PathName.suppressionLists',
        ],
        senderProfile: ['activities.configurationArguments.triggeredSend.r__senderProfile_key'],
        sendClassification: [
            'activities.configurationArguments.triggeredSend.r__sendClassification_key',
        ],
        asset: [
            'activities.configurationArguments.triggeredSend.r__asset_key',
            'activities.configurationArguments.r__asset_key',
        ],
        mobileMessage: ['activities.configurationArguments.r__mobileMessage_key'],
        mobileKeyword: [
            'activities.configurationArguments.r__mobileKeyword_key.current',
            'activities.configurationArguments.r__mobileKeyword_key.next',
        ],
        mobileCode: ['activities.configurationArguments.r__mobileCode_key'],
    },
    folderIdField: 'categoryId',
    hasExtended: false,
    idField: 'id',
    keyIsFixed: true,
    keyField: 'key',
    nameField: 'name',
    createdDateField: 'createdDate',
    createdNameField: null,
    lastmodDateField: 'modifiedDate',
    lastmodNameField: null,
    restPagination: true,
    restPageSize: 500,
    maxKeyLength: 200, // confirmed max length
    type: 'journey',
    typeDescription: 'Journey (internally called "Interaction").',
    typeRetrieveByDefault: true,
    typeName: 'Journey',
    priorityMapping: {
        High: 3,
        Medium: 4, // not inherited on Asset Types
        Low: 5,
    },
    fields: {
        activities: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].id': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].key': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].name': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].description': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].type': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].outcomes': {
            skipValidation: true,
        },
        'activities[].arguments': {
            skipValidation: true,
        },
        'activities[].configurationArguments': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSendKey': {
            // if used during create then we are stuck with old data
            isCreateable: false,
            isUpdateable: true,
            retrieving: true,
            template: false,
        },
        'activities[].configurationArguments.triggeredSendId': {
            // if used during create then we are stuck with old data
            isCreateable: false,
            isUpdateable: true,
            retrieving: true,
            template: false,
        },
        'activities[].configurationArguments.triggeredSend': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.id': {
            // if used during create then we are stuck with old data
            isCreateable: false,
            isUpdateable: true,
            retrieving: true,
            template: false,
        },
        'activities[].configurationArguments.triggeredSend.key': {
            // if used during create then we are stuck with old data
            isCreateable: false,
            isUpdateable: true,
            retrieving: true,
            template: false,
        },
        'activities[].configurationArguments.triggeredSend.campaigns': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.suppressionLists': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.autoAddSubscribers': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.autoUpdateSubscribers': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.bccEmail': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.categoryId': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.ccEmail': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.created': {
            skipValidation: true,
        },
        'activities[].configurationArguments.triggeredSend.description': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.domainExclusions': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.dynamicEmailSubject': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.emailSubject': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.exclusionFilter': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.isSalesforceTracking': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.isMultipart': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.isSendLogging': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.isStoppedOnJobError': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.keyword': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.modified': {
            skipValidation: true,
        },
        'activities[].configurationArguments.triggeredSend.name': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: false,
        },
        'activities[].configurationArguments.triggeredSend.preHeader': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.replyToAddress': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.replyToDisplayName': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.suppressTracking': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.triggeredSendStatus': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.version': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.throttleOpens': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.throttleCloses': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.throttleLimit': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.isTrackingClicks': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.emailId': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.r__triggeredSend_key': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            /* dont include in templates, we rather want this to be re-created from the journey */
            template: false,
        },
        'activities[].configurationArguments.triggeredSend.senderProfileId': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.deliveryProfileId': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.r__senderProfile_key': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        ' activities[].configurationArguments.triggeredSend.sendClassificationId': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.r__deliveryProfile_key': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.r__sendClassification_key': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.r__list_PathName': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.publicationListId': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.r__list_PathName.publicationList': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.r__list_PathName.suppressionLists': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.r__dataExtension_key': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.r__dataExtension_key.domainExclusions': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.priority': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.c__priority': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.triggeredSend.r__asset_name_readOnly': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        'activities[].configurationArguments.triggeredSend.r__asset_key': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.applicationExtensionKey': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.r__transactionalEmail_key': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.applicationExtensionId': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.isModified': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.isSimulation': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.googleAnalyticsCampaignName': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.useLLTS': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.fuelAgentRequested': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.r__triggeredSend_key': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        'activities[].configurationArguments.waitDuration': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.waitUnit': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.specifiedTime': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.timeZone': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.description': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.waitEndDateAttributeExpression': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.specificDate': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.waitForEventKey': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.schemaVersionId': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'activities[].configurationArguments.criteria': {
            skipValidation: true,
        },
        'activities[].configurationArguments.eventDataConfig': {
            skipValidation: true,
        },
        'activities[].metaData': {
            skipValidation: true,
        },
        'activities[].schema': {
            skipValidation: true,
        },
        categoryId: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        channel: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        createdDate: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        'defaults.email': {
            skipValidation: true,
        },
        'defaults.mobileNumber': {
            skipValidation: true,
        },
        'defaults.properties.analyticsTracking.enabled': {
            isCreateable: null,
            isUpdateable: null,
            retrieving: null,
            template: null,
        },
        'defaults.properties': {
            skipValidation: true,
        },
        'defaults.properties.analyticsTracking.analyticsType': {
            isCreateable: null,
            isUpdateable: null,
            retrieving: null,
            template: null,
        },
        'defaults.properties.analyticsTracking.urlDomainsToTrack': {
            isCreateable: null,
            isUpdateable: null,
            retrieving: null,
            template: null,
        },
        definitionId: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        definitionType: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        description: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        entryMode: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        executionMode: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        exits: {
            skipValidation: true,
        },
        goals: {
            skipValidation: true,
        },
        healthStats: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        id: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        key: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        lastPublishedDate: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        'metaData.templateId': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        modifiedDate: {
            isCreateable: false,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        name: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        scheduledStatus: {
            isCreateable: null,
            isUpdateable: null,
            retrieving: null,
            template: null,
        },
        stats: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        status: {
            isCreateable: false,
            isUpdateable: true,
            retrieving: true,
            template: false,
        },
        triggers: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].id': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        'triggers[].key': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].name': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].description': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].type': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].outcomes': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].arguments': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].arguments.startActivityKey': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },

        'triggers[].arguments.dequeueReason': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].arguments.lastExecutedActivityKey': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].arguments.filterResult': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].arguments.serializedObjectType': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].arguments.eventDefinitionId': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].arguments.eventDefinitionKey': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].arguments.dataExtensionId': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].arguments.automationId': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].arguments.r__event_key': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        'triggers[].arguments.r__dataExtension_key': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        'triggers[].configurationArguments': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].configurationArguments.eventDataConfig': {
            skipValidation: true,
        },
        'triggers[].configurationArguments.primaryObjectFilterCriteria': {
            skipValidation: true,
        },
        'triggers[].configurationArguments.relatedObjectFilterCriteria': {
            skipValidation: true,
        },
        'triggers[].configurationArguments.salesforceTriggerCriteria': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].configurationArguments.objectAPIName': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].configurationArguments.version': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].configurationArguments.contactKey': {
            skipValidation: true,
        },
        'triggers[].configurationArguments.contactPersonType': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].configurationArguments.primaryObjectFilterSummary': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].configurationArguments.relatedObjectFilterSummary': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },

        'triggers[].configurationArguments.eventDataSummary': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].configurationArguments.evaluationCriteriaSummary': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].configurationArguments.applicationExtensionKey': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].configurationArguments.passThroughArgument': {
            skipValidation: true,
        },
        'triggers[].configurationArguments.filterDefinitionId': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        'triggers[].configurationArguments.criteria': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].configurationArguments.schemaVersionId': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].configurationArguments.whoToInject': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].configurationArguments.objectApiName': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].configurationArguments.additionalObjectFilterCriteria': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].metaData': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].metaData.sourceInteractionId': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].metaData.entrySourceGroupConfigUrl': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].metaData.r__event_key': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        'triggers[].metaData.category': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].metaData.eventDefinitionId': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].metaData.eventDefinitionKey': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].metaData.chainType': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].metaData.configurationRequired': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].metaData.iconUrl': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].metaData.title': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        version: {
            isCreateable: false,
            isUpdateable: true,
            retrieving: true,
            template: false,
        },
        workflowApiVersion: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        metaData: {
            skipValidation: true,
        },
        notifiers: {
            skipValidation: true,
        },
        tags: {
            skipValidation: true,
        },
        r__folder_Path: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
    },
};
