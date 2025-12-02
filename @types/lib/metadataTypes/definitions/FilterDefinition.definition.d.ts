declare namespace _default {
    let bodyIteratorField: string;
    let dependencies: string[];
    let filter: {};
    let hasExtended: boolean;
    let idField: string;
    let keyField: string;
    let nameField: string;
    let folderType: string;
    let folderIdField: string;
    let createdDateField: string;
    let createdNameField: string;
    let lastmodDateField: string;
    let lastmodNameField: string;
    let restPagination: boolean;
    let restPageSize: number;
    let type: string;
    let typeDescription: string;
    let typeRetrieveByDefault: boolean;
    let typeName: string;
    namespace fields {
        namespace id {
            let isCreateable: boolean;
            let isUpdateable: boolean;
            let retrieving: boolean;
            let template: boolean;
        }
        namespace key {
            let isCreateable_1: boolean;
            export { isCreateable_1 as isCreateable };
            let isUpdateable_1: boolean;
            export { isUpdateable_1 as isUpdateable };
            let retrieving_1: boolean;
            export { retrieving_1 as retrieving };
            let template_1: boolean;
            export { template_1 as template };
        }
        namespace createdDate {
            let isCreateable_2: boolean;
            export { isCreateable_2 as isCreateable };
            let isUpdateable_2: boolean;
            export { isUpdateable_2 as isUpdateable };
            let retrieving_2: boolean;
            export { retrieving_2 as retrieving };
            let template_2: boolean;
            export { template_2 as template };
        }
        namespace createdBy {
            let isCreateable_3: boolean;
            export { isCreateable_3 as isCreateable };
            let isUpdateable_3: boolean;
            export { isUpdateable_3 as isUpdateable };
            let retrieving_3: boolean;
            export { retrieving_3 as retrieving };
            let template_3: boolean;
            export { template_3 as template };
        }
        namespace createdByName {
            let isCreateable_4: boolean;
            export { isCreateable_4 as isCreateable };
            let isUpdateable_4: boolean;
            export { isUpdateable_4 as isUpdateable };
            let retrieving_4: boolean;
            export { retrieving_4 as retrieving };
            let template_4: boolean;
            export { template_4 as template };
        }
        namespace lastUpdated {
            let isCreateable_5: boolean;
            export { isCreateable_5 as isCreateable };
            let isUpdateable_5: boolean;
            export { isUpdateable_5 as isUpdateable };
            let retrieving_5: boolean;
            export { retrieving_5 as retrieving };
            let template_5: boolean;
            export { template_5 as template };
        }
        namespace lastUpdatedBy {
            let isCreateable_6: boolean;
            export { isCreateable_6 as isCreateable };
            let isUpdateable_6: boolean;
            export { isUpdateable_6 as isUpdateable };
            let retrieving_6: boolean;
            export { retrieving_6 as retrieving };
            let template_6: boolean;
            export { template_6 as template };
        }
        namespace lastUpdatedByName {
            let isCreateable_7: boolean;
            export { isCreateable_7 as isCreateable };
            let isUpdateable_7: boolean;
            export { isUpdateable_7 as isUpdateable };
            let retrieving_7: boolean;
            export { retrieving_7 as retrieving };
            let template_7: boolean;
            export { template_7 as template };
        }
        namespace name {
            let isCreateable_8: boolean;
            export { isCreateable_8 as isCreateable };
            let isUpdateable_8: boolean;
            export { isUpdateable_8 as isUpdateable };
            let retrieving_8: boolean;
            export { retrieving_8 as retrieving };
            let template_8: boolean;
            export { template_8 as template };
        }
        namespace categoryId {
            let isCreateable_9: boolean;
            export { isCreateable_9 as isCreateable };
            let isUpdateable_9: boolean;
            export { isUpdateable_9 as isUpdateable };
            let retrieving_9: boolean;
            export { retrieving_9 as retrieving };
            let template_9: boolean;
            export { template_9 as template };
        }
        namespace description {
            let isCreateable_10: boolean;
            export { isCreateable_10 as isCreateable };
            let isUpdateable_10: boolean;
            export { isUpdateable_10 as isUpdateable };
            let retrieving_10: boolean;
            export { retrieving_10 as retrieving };
            let template_10: boolean;
            export { template_10 as template };
        }
        namespace filterDefinitionXml {
            let isCreateable_11: boolean;
            export { isCreateable_11 as isCreateable };
            let isUpdateable_11: boolean;
            export { isUpdateable_11 as isUpdateable };
            let retrieving_11: boolean;
            export { retrieving_11 as retrieving };
            let template_11: boolean;
            export { template_11 as template };
        }
        namespace derivedFromType {
            let isCreateable_12: boolean;
            export { isCreateable_12 as isCreateable };
            let isUpdateable_12: boolean;
            export { isUpdateable_12 as isUpdateable };
            let retrieving_12: boolean;
            export { retrieving_12 as retrieving };
            let template_12: boolean;
            export { template_12 as template };
        }
        namespace derivedFromObjectId {
            let isCreateable_13: boolean;
            export { isCreateable_13 as isCreateable };
            let isUpdateable_13: boolean;
            export { isUpdateable_13 as isUpdateable };
            let retrieving_13: boolean;
            export { retrieving_13 as retrieving };
            let template_13: boolean;
            export { template_13 as template };
        }
        namespace derivedFromObjectTypeName {
            let isCreateable_14: boolean;
            export { isCreateable_14 as isCreateable };
            let isUpdateable_14: boolean;
            export { isUpdateable_14 as isUpdateable };
            let retrieving_14: boolean;
            export { retrieving_14 as retrieving };
            let template_14: boolean;
            export { template_14 as template };
        }
        namespace derivedFromObjectName {
            let isCreateable_15: boolean;
            export { isCreateable_15 as isCreateable };
            let isUpdateable_15: boolean;
            export { isUpdateable_15 as isUpdateable };
            let retrieving_15: boolean;
            export { retrieving_15 as retrieving };
            let template_15: boolean;
            export { template_15 as template };
        }
        namespace isSendable {
            let isCreateable_16: boolean;
            export { isCreateable_16 as isCreateable };
            let isUpdateable_16: boolean;
            export { isUpdateable_16 as isUpdateable };
            let retrieving_16: boolean;
            export { retrieving_16 as retrieving };
            let template_16: boolean;
            export { template_16 as template };
        }
        namespace r__source_dataExtension_CustomerKey {
            let isCreateable_17: boolean;
            export { isCreateable_17 as isCreateable };
            let isUpdateable_17: boolean;
            export { isUpdateable_17 as isUpdateable };
            let retrieving_17: boolean;
            export { retrieving_17 as retrieving };
            let template_17: boolean;
            export { template_17 as template };
        }
        namespace c__filterDefinition {
            let skipValidation: boolean;
        }
        namespace r__folder_Path {
            let isCreateable_18: boolean;
            export { isCreateable_18 as isCreateable };
            let isUpdateable_18: boolean;
            export { isUpdateable_18 as isUpdateable };
            let retrieving_18: boolean;
            export { retrieving_18 as retrieving };
            let template_18: boolean;
            export { template_18 as template };
        }
    }
}
export default _default;
//# sourceMappingURL=FilterDefinition.definition.d.ts.map