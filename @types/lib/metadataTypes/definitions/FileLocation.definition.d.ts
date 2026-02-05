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
    let locationTypeMappingDeployable: {
        'External SFTP Site': string;
        'Amazon Simple Storage Service': string;
        'Azure Blob Storage': string;
        'Google Cloud Storage': string;
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
        namespace locationType {
            let isCreateable_2: boolean;
            export { isCreateable_2 as isCreateable };
            let isUpdateable_2: boolean;
            export { isUpdateable_2 as isUpdateable };
            let retrieving_2: boolean;
            export { retrieving_2 as retrieving };
            let template_2: boolean;
            export { template_2 as template };
        }
        namespace locationUrl {
            let isCreateable_3: boolean;
            export { isCreateable_3 as isCreateable };
            let isUpdateable_3: boolean;
            export { isUpdateable_3 as isUpdateable };
            let retrieving_3: boolean;
            export { retrieving_3 as retrieving };
            let template_3: boolean;
            export { template_3 as template };
        }
        namespace name {
            let isCreateable_4: boolean;
            export { isCreateable_4 as isCreateable };
            let isUpdateable_4: boolean;
            export { isUpdateable_4 as isUpdateable };
            let retrieving_4: boolean;
            export { retrieving_4 as retrieving };
            let template_4: boolean;
            export { template_4 as template };
        }
        namespace customerKey {
            let isCreateable_5: boolean;
            export { isCreateable_5 as isCreateable };
            let isUpdateable_5: boolean;
            export { isUpdateable_5 as isUpdateable };
            let retrieving_5: boolean;
            export { retrieving_5 as retrieving };
            let template_5: boolean;
            export { template_5 as template };
        }
        namespace description {
            let isCreateable_6: boolean;
            export { isCreateable_6 as isCreateable };
            let isUpdateable_6: boolean;
            export { isUpdateable_6 as isUpdateable };
            let retrieving_6: boolean;
            export { retrieving_6 as retrieving };
            let template_6: boolean;
            export { template_6 as template };
        }
        namespace relPath {
            let isCreateable_7: boolean;
            export { isCreateable_7 as isCreateable };
            let isUpdateable_7: boolean;
            export { isUpdateable_7 as isUpdateable };
            let retrieving_7: boolean;
            export { retrieving_7 as retrieving };
            let template_7: boolean;
            export { template_7 as template };
        }
        namespace awsFileTransferLocation {
            let skipValidation: boolean;
        }
        namespace azureFileTransferLocation {
            let skipValidation_1: boolean;
            export { skipValidation_1 as skipValidation };
        }
        namespace gcpFileTransferLocation {
            let skipValidation_2: boolean;
            export { skipValidation_2 as skipValidation };
        }
        namespace sFtpFileTransferLocation {
            let skipValidation_3: boolean;
            export { skipValidation_3 as skipValidation };
        }
        namespace c__locationType {
            let isCreateable_8: boolean;
            export { isCreateable_8 as isCreateable };
            let isUpdateable_8: boolean;
            export { isUpdateable_8 as isUpdateable };
            let retrieving_8: boolean;
            export { retrieving_8 as retrieving };
            let template_8: boolean;
            export { template_8 as template };
        }
    }
}
export default _default;
//# sourceMappingURL=FileLocation.definition.d.ts.map