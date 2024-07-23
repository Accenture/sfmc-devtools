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
        transactionalEmail: ['activities.configurationArguments.r__transactionalEmail_key'],
        dataExtension: [
            'activities.metaData.highThroughput.r__dataExtension_key',
            'activities.configurationArguments.triggeredSend.r__dataExtension_key.domainExclusions',
        ],
        triggeredSend: ['activities.configurationArguments.r__triggeredSend_key'],
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
            template: false,
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
        'triggers[].configurationArguments': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].configurationArguments.eventDataConfig': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].configurationArguments.primaryObjectFilterCriteria': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].configurationArguments.relatedObjectFilterCriteria': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
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
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
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
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
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
        'triggers[].metaData': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'triggers[].metaData.sourceInteractionId': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        'triggers[].metaData.eventDefinitionId': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
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
