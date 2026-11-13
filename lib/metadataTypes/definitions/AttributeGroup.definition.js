export default {
    bodyIteratorField: 'attributeGroupDefinitions',
    dependencies: [], // attributeSet depends on attributeGroup; membership (r__attributeSet_key) is read-only here
    dependencyGraph: {},
    deleteSynchronously: true, // deletes cascade to other attributeSets; running them one by one keeps the cache consistent
    hasExtended: false,
    idField: 'definitionID',
    keyIsFixed: true,
    keyField: 'definitionKey',
    nameField: 'definitionName.value',
    restPagination: false, // Hub API does not support pagination and returns everything instead
    type: 'attributeGroup',
    typeDescription: 'Groupings of Attribute Sets (Data Extensions) in Data Designer.',
    typeRetrieveByDefault: true,
    typeCdpByDefault: false,
    typeName: 'Data Designer Attribute Groups',
    fields: {
        applicationID: {
            // used by system generated attribute groups only; contains UUID
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        applicationKey: {
            // used by system generated attribute groups only
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        attributeCount: {
            // auto-populated
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        attributeGroupIconKey: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        attributeGroupType: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        attributeSetIdentifiers: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        'attributeSetIdentifiers[].connectingID.identifierType': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        'attributeSetIdentifiers[].definitionID': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        'attributeSetIdentifiers[].definitionKey': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        'attributeSetIdentifiers[].definitionName.value': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        'attributeSetIdentifiers[].namespace': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        canAddProperties: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        canAddRelationships: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        canChangeProperties: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        canModify: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        canRemove: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        connectingID: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        'connectingID.identifierType': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        containsSchemaAttributes: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        definitionID: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        definitionKey: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        definitionName: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'definitionName.value': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        description: {
            // optional field. not returned by API if empty
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        displayOrder: {
            // auto-set to i+1
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        fullyQualifiedName: {
            // equal to defitionName.value; auto-populated by preDeployTasks
            isCreateable: true,
            isUpdateable: true,
            retrieving: false,
            template: false,
        },
        isHidden: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        isOwner: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        isPrimary: {
            // always false, purpose unknown
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        isSystemDefined: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: false,
        },
        localizedDescription: {
            // always an empty object
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        'localizedDescription.resourceSetKey': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        'localizedDescription.resourceValueKey': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        'localizedDescription.value': {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        mID: {
            // auto-populated in preDeployTask
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        namespace: {
            // always an empty string
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        objectState: {
            // seems to always contain "Created"
            isCreateable: false,
            isUpdateable: false,
            retrieving: false,
            template: false,
        },
        requiredRelationships: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
        r__attributeSet_key: {
            isCreateable: false,
            isUpdateable: false,
            retrieving: true,
            template: true,
        },
    },
};
