declare namespace _default {
    let bodyIteratorField: string;
    let dependencies: any[];
    let dependencyGraph: any;
    let hasExtended: boolean;
    let idField: string;
    let keyIsFixed: boolean;
    let keyField: string;
    let nameField: string;
    let createdDateField: any;
    let createdNameField: any;
    let lastmodDateField: any;
    let lastmodNameField: any;
    let restPagination: boolean;
    let type: string;
    let typeDescription: string;
    let typeRetrieveByDefault: boolean;
    let typeCdpByDefault: boolean;
    let typeName: string;
    let locationTypeMapping: {
        'Enhanced FTP Site Import Directory': number;
        'External FTP Site': number;
        'External SFTP Site': number;
        'External FTPS Site': number;
        'Salesforce Objects and Reports': number;
        Safehouse: number;
        'Enhanced FTP Site Export Directory': number;
        'Legacy Import Directory': number;
        'Relative location under FTP Site': number;
        'Amazon Simple Storage Service': number;
        'Azure Blob Storage': number;
        'Google Cloud Storage': number;
    };
    namespace fields {
        namespace id {
            let isCreateable: boolean;
            let isUpdateable: boolean;
            let retrieving: boolean;
            let template: boolean;
        }
        namespace locationTypeId {
            let isCreateable_1: boolean;
            export { isCreateable_1 as isCreateable };
            let isUpdateable_1: boolean;
            export { isUpdateable_1 as isUpdateable };
            let retrieving_1: boolean;
            export { retrieving_1 as retrieving };
            let template_1: boolean;
            export { template_1 as template };
        }
        namespace locationUrl {
            let isCreateable_2: boolean;
            export { isCreateable_2 as isCreateable };
            let isUpdateable_2: boolean;
            export { isUpdateable_2 as isUpdateable };
            let retrieving_2: boolean;
            export { retrieving_2 as retrieving };
            let template_2: boolean;
            export { template_2 as template };
        }
        namespace name {
            let isCreateable_3: boolean;
            export { isCreateable_3 as isCreateable };
            let isUpdateable_3: boolean;
            export { isUpdateable_3 as isUpdateable };
            let retrieving_3: boolean;
            export { retrieving_3 as retrieving };
            let template_3: boolean;
            export { template_3 as template };
        }
        namespace relPath {
            let isCreateable_4: boolean;
            export { isCreateable_4 as isCreateable };
            let isUpdateable_4: boolean;
            export { isUpdateable_4 as isUpdateable };
            let retrieving_4: boolean;
            export { retrieving_4 as retrieving };
            let template_4: boolean;
            export { template_4 as template };
        }
        namespace c__locationType {
            let isCreateable_5: boolean;
            export { isCreateable_5 as isCreateable };
            let isUpdateable_5: boolean;
            export { isUpdateable_5 as isUpdateable };
            let retrieving_5: boolean;
            export { retrieving_5 as retrieving };
            let template_5: boolean;
            export { template_5 as template };
        }
    }
}
export default _default;
//# sourceMappingURL=FileLocation.definition.d.ts.map