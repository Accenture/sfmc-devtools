declare namespace _default {
    let folderType: string;
    let bodyIteratorField: string;
    let dependencies: string[];
    namespace dependencyGraph {
        let event: string[];
        let transactionalEmail: string[];
        let dataExtension: string[];
        let triggeredSend: string[];
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
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
        };
        'triggers[].configurationArguments.relatedObjectFilterCriteria': {
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
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
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
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
            isCreateable: boolean;
            isUpdateable: boolean;
            retrieving: boolean;
            template: boolean;
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