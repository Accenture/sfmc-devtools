export default {
    bodyIteratorField: 'attributeGroupDefinitions',
    dependencies: ['attributeSet'], // future may have dependency on Data Extensions
    hasExtended: false,
    idField: 'definitionID',
    keyIsFixed: true,
    keyField: 'definitionKey',
    nameField: 'definitionName.value',
    restPagination: false, // Hub API does not support pagination and returns everything instead
    type: 'attributeGroup',
    typeDescription: 'Groupings of Attribute Sets (Data Extensions) in Data Designer.',
    typeRetrieveByDefault: true,
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
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        attributeSetIdentifiers: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'attributeSetIdentifiers[].connectingID.identifierType': {
            isCreateable: null,
            isUpdateable: null,
            retrieving: true,
            template: false,
        },
        'attributeSetIdentifiers[].definitionID': {
            isCreateable: null,
            isUpdateable: null,
            retrieving: true,
            template: false,
        },
        'attributeSetIdentifiers[].definitionKey': {
            isCreateable: null,
            isUpdateable: null,
            retrieving: true,
            template: true,
        },
        'attributeSetIdentifiers[].definitionName.value': {
            isCreateable: null,
            isUpdateable: null,
            retrieving: true,
            template: false,
        },
        'attributeSetIdentifiers[].namespace': {
            isCreateable: null,
            isUpdateable: null,
            retrieving: false,
            template: false,
        },
        canAddProperties: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        canAddRelationships: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        canChangeProperties: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        canModify: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        canRemove: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        connectingID: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        'connectingID.identifierType': {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        containsSchemaAttributes: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        definitionID: {
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: false,
        },
        definitionKey: {
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
            isCreateable: true,
            isUpdateable: true,
            retrieving: true,
            template: true,
        },
        isOwner: {
            isCreateable: true,
            isUpdateable: true,
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
            isCreateable: null,
            isUpdateable: null,
            retrieving: true,
            template: true,
        },
        'localizedDescription.resourceValueKey': {
            isCreateable: null,
            isUpdateable: null,
            retrieving: true,
            template: true,
        },
        'localizedDescription.value': {
            isCreateable: null,
            isUpdateable: null,
            retrieving: true,
            template: true,
        },
        mID: {
            // auto-populated in preDeployTask
            isCreateable: true,
            isUpdateable: true,
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
            isCreateable: true,
            isUpdateable: true,
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
