declare namespace _default {
    let bodyIteratorField: string;
    let dependencies: string[];
    namespace dependencyGraph {
        let mobilePushApp: string[];
    }
    let hasExtended: boolean;
    let idField: string;
    let keepId: boolean;
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
    let typeCdpByDefault: boolean;
    let typeName: string;
    namespace messageTypeMapping {
        let outboundPush: number;
        let locationEntry: number;
        let locationExit: number;
        let beacon: number;
        let inapp: number;
        let inbox: number;
    }
    namespace contentTypeMapping {
        export let alert: number;
        let inbox_1: number;
        export { inbox_1 as inbox };
        export let inboxAndAlert: number;
    }
    namespace tzPastSendActionMapping {
        let sendImmediately: number;
        let sendAtScheduledTimeNextDay: number;
        let neverSend: number;
    }
    namespace statusMapping {
        let draft: number;
        let active: number;
        let inactive: number;
        let deleted: number;
    }
    namespace sendInitiatorMapping {
        let gui: number;
        let api: number;
        let automation: number;
        let journeyBuilder: number;
    }
    namespace fields {
        export namespace id {
            let isCreateable: boolean;
            let isUpdateable: boolean;
            let retrieving: boolean;
            let template: boolean;
        }
        export namespace alert_1 {
            let isCreateable_1: boolean;
            export { isCreateable_1 as isCreateable };
            let isUpdateable_1: boolean;
            export { isUpdateable_1 as isUpdateable };
            let retrieving_1: boolean;
            export { retrieving_1 as retrieving };
            let template_1: boolean;
            export { template_1 as template };
        }
        export { alert_1 as alert };
        export namespace sound {
            let isCreateable_2: boolean;
            export { isCreateable_2 as isCreateable };
            let isUpdateable_2: boolean;
            export { isUpdateable_2 as isUpdateable };
            let retrieving_2: boolean;
            export { retrieving_2 as retrieving };
            let template_2: boolean;
            export { template_2 as template };
        }
        export namespace messageType {
            let isCreateable_3: boolean;
            export { isCreateable_3 as isCreateable };
            let isUpdateable_3: boolean;
            export { isUpdateable_3 as isUpdateable };
            let retrieving_3: boolean;
            export { retrieving_3 as retrieving };
            let template_3: boolean;
            export { template_3 as template };
        }
        export namespace c__messageType {
            let isCreateable_4: boolean;
            export { isCreateable_4 as isCreateable };
            let isUpdateable_4: boolean;
            export { isUpdateable_4 as isUpdateable };
            let retrieving_4: boolean;
            export { retrieving_4 as retrieving };
            let template_4: boolean;
            export { template_4 as template };
        }
        export namespace contentType {
            let isCreateable_5: boolean;
            export { isCreateable_5 as isCreateable };
            let isUpdateable_5: boolean;
            export { isUpdateable_5 as isUpdateable };
            let retrieving_5: boolean;
            export { retrieving_5 as retrieving };
            let template_5: boolean;
            export { template_5 as template };
        }
        export namespace c__contentType {
            let isCreateable_6: boolean;
            export { isCreateable_6 as isCreateable };
            let isUpdateable_6: boolean;
            export { isUpdateable_6 as isUpdateable };
            let retrieving_6: boolean;
            export { retrieving_6 as retrieving };
            let template_6: boolean;
            export { template_6 as template };
        }
        export namespace messageObjectId {
            let isCreateable_7: boolean;
            export { isCreateable_7 as isCreateable };
            let isUpdateable_7: boolean;
            export { isUpdateable_7 as isUpdateable };
            let retrieving_7: boolean;
            export { retrieving_7 as retrieving };
            let template_7: boolean;
            export { template_7 as template };
        }
        export namespace activityInstanceId {
            let isCreateable_8: boolean;
            export { isCreateable_8 as isCreateable };
            let isUpdateable_8: boolean;
            export { isUpdateable_8 as isUpdateable };
            let retrieving_8: boolean;
            export { retrieving_8 as retrieving };
            let template_8: boolean;
            export { template_8 as template };
        }
        export namespace name {
            let isCreateable_9: boolean;
            export { isCreateable_9 as isCreateable };
            let isUpdateable_9: boolean;
            export { isUpdateable_9 as isUpdateable };
            let retrieving_9: boolean;
            export { retrieving_9 as retrieving };
            let template_9: boolean;
            export { template_9 as template };
        }
        export namespace tzPastSendAction {
            let isCreateable_10: boolean;
            export { isCreateable_10 as isCreateable };
            let isUpdateable_10: boolean;
            export { isUpdateable_10 as isUpdateable };
            let retrieving_10: boolean;
            export { retrieving_10 as retrieving };
            let template_10: boolean;
            export { template_10 as template };
        }
        export namespace c__tzPastSendAction {
            let isCreateable_11: boolean;
            export { isCreateable_11 as isCreateable };
            let isUpdateable_11: boolean;
            export { isUpdateable_11 as isUpdateable };
            let retrieving_11: boolean;
            export { retrieving_11 as retrieving };
            let template_11: boolean;
            export { template_11 as template };
        }
        export namespace sendInitiator {
            let isCreateable_12: boolean;
            export { isCreateable_12 as isCreateable };
            let isUpdateable_12: boolean;
            export { isUpdateable_12 as isUpdateable };
            let retrieving_12: boolean;
            export { retrieving_12 as retrieving };
            let template_12: boolean;
            export { template_12 as template };
        }
        export namespace c__sendInitiator {
            let isCreateable_13: boolean;
            export { isCreateable_13 as isCreateable };
            let isUpdateable_13: boolean;
            export { isUpdateable_13 as isUpdateable };
            let retrieving_13: boolean;
            export { retrieving_13 as retrieving };
            let template_13: boolean;
            export { template_13 as template };
        }
        export namespace status {
            let isCreateable_14: boolean;
            export { isCreateable_14 as isCreateable };
            let isUpdateable_14: boolean;
            export { isUpdateable_14 as isUpdateable };
            let retrieving_14: boolean;
            export { retrieving_14 as retrieving };
            let template_14: boolean;
            export { template_14 as template };
        }
        export namespace c__status {
            let isCreateable_15: boolean;
            export { isCreateable_15 as isCreateable };
            let isUpdateable_15: boolean;
            export { isUpdateable_15 as isUpdateable };
            let retrieving_15: boolean;
            export { retrieving_15 as retrieving };
            let template_15: boolean;
            export { template_15 as template };
        }
        export namespace title {
            let isCreateable_16: boolean;
            export { isCreateable_16 as isCreateable };
            let isUpdateable_16: boolean;
            export { isUpdateable_16 as isUpdateable };
            let retrieving_16: boolean;
            export { retrieving_16 as retrieving };
            let template_16: boolean;
            export { template_16 as template };
        }
        export namespace subtitle {
            let isCreateable_17: boolean;
            export { isCreateable_17 as isCreateable };
            let isUpdateable_17: boolean;
            export { isUpdateable_17 as isUpdateable };
            let retrieving_17: boolean;
            export { retrieving_17 as retrieving };
            let template_17: boolean;
            export { template_17 as template };
        }
        export namespace subject {
            let isCreateable_18: boolean;
            export { isCreateable_18 as isCreateable };
            let isUpdateable_18: boolean;
            export { isUpdateable_18 as isUpdateable };
            let retrieving_18: boolean;
            export { retrieving_18 as retrieving };
            let template_18: boolean;
            export { template_18 as template };
        }
        export namespace url {
            let isCreateable_19: boolean;
            export { isCreateable_19 as isCreateable };
            let isUpdateable_19: boolean;
            export { isUpdateable_19 as isUpdateable };
            let retrieving_19: boolean;
            export { retrieving_19 as retrieving };
            let template_19: boolean;
            export { template_19 as template };
        }
        export namespace replaceInboxMessage {
            let isCreateable_20: boolean;
            export { isCreateable_20 as isCreateable };
            let isUpdateable_20: boolean;
            export { isUpdateable_20 as isUpdateable };
            let retrieving_20: boolean;
            export { retrieving_20 as retrieving };
            let template_20: boolean;
            export { template_20 as template };
        }
        export namespace inboxMessage {
            let isCreateable_21: boolean;
            export { isCreateable_21 as isCreateable };
            let isUpdateable_21: boolean;
            export { isUpdateable_21 as isUpdateable };
            let retrieving_21: boolean;
            export { retrieving_21 as retrieving };
            let template_21: boolean;
            export { template_21 as template };
        }
        export namespace inboxSubtitle {
            let isCreateable_22: boolean;
            export { isCreateable_22 as isCreateable };
            let isUpdateable_22: boolean;
            export { isUpdateable_22 as isUpdateable };
            let retrieving_22: boolean;
            export { retrieving_22 as retrieving };
            let template_22: boolean;
            export { template_22 as template };
        }
        export namespace advanceInboxSendType {
            let isCreateable_23: boolean;
            export { isCreateable_23 as isCreateable };
            let isUpdateable_23: boolean;
            export { isUpdateable_23 as isUpdateable };
            let retrieving_23: boolean;
            export { retrieving_23 as retrieving };
            let template_23: boolean;
            export { template_23 as template };
        }
        export namespace isDuplicationAllowed {
            let isCreateable_24: boolean;
            export { isCreateable_24 as isCreateable };
            let isUpdateable_24: boolean;
            export { isUpdateable_24 as isUpdateable };
            let retrieving_24: boolean;
            export { retrieving_24 as retrieving };
            let template_24: boolean;
            export { template_24 as template };
        }
        export namespace currentEditStep {
            let isCreateable_25: boolean;
            export { isCreateable_25 as isCreateable };
            let isUpdateable_25: boolean;
            export { isUpdateable_25 as isUpdateable };
            let retrieving_25: boolean;
            export { retrieving_25 as retrieving };
            let template_25: boolean;
            export { template_25 as template };
        }
        export namespace contentAvailable {
            let isCreateable_26: boolean;
            export { isCreateable_26 as isCreateable };
            let isUpdateable_26: boolean;
            export { isUpdateable_26 as isUpdateable };
            let retrieving_26: boolean;
            export { retrieving_26 as retrieving };
            let template_26: boolean;
            export { template_26 as template };
        }
        export namespace scheduledTimezone {
            let skipValidation: boolean;
        }
        export namespace media {
            let skipValidation_1: boolean;
            export { skipValidation_1 as skipValidation };
        }
        export namespace createdDate {
            let isCreateable_27: boolean;
            export { isCreateable_27 as isCreateable };
            let isUpdateable_27: boolean;
            export { isUpdateable_27 as isUpdateable };
            let retrieving_27: boolean;
            export { retrieving_27 as retrieving };
            let template_27: boolean;
            export { template_27 as template };
        }
        export namespace lastUpdated {
            let isCreateable_28: boolean;
            export { isCreateable_28 as isCreateable };
            let isUpdateable_28: boolean;
            export { isUpdateable_28 as isUpdateable };
            let retrieving_28: boolean;
            export { retrieving_28 as retrieving };
            let template_28: boolean;
            export { template_28 as template };
        }
        export namespace startDateUtc {
            let isCreateable_29: boolean;
            export { isCreateable_29 as isCreateable };
            let isUpdateable_29: boolean;
            export { isUpdateable_29 as isUpdateable };
            let retrieving_29: boolean;
            export { retrieving_29 as retrieving };
            let template_29: boolean;
            export { template_29 as template };
        }
        export namespace startDate {
            let isCreateable_30: boolean;
            export { isCreateable_30 as isCreateable };
            let isUpdateable_30: boolean;
            export { isUpdateable_30 as isUpdateable };
            let retrieving_30: boolean;
            export { retrieving_30 as retrieving };
            let template_30: boolean;
            export { template_30 as template };
        }
        export namespace endDateUtc {
            let isCreateable_31: boolean;
            export { isCreateable_31 as isCreateable };
            let isUpdateable_31: boolean;
            export { isUpdateable_31 as isUpdateable };
            let retrieving_31: boolean;
            export { retrieving_31 as retrieving };
            let template_31: boolean;
            export { template_31 as template };
        }
        export namespace endDate {
            let isCreateable_32: boolean;
            export { isCreateable_32 as isCreateable };
            let isUpdateable_32: boolean;
            export { isUpdateable_32 as isUpdateable };
            let retrieving_32: boolean;
            export { retrieving_32 as retrieving };
            let template_32: boolean;
            export { template_32 as template };
        }
        export namespace application {
            let skipValidation_2: boolean;
            export { skipValidation_2 as skipValidation };
        }
        export namespace r__mobilePushApp_key {
            let isCreateable_33: boolean;
            export { isCreateable_33 as isCreateable };
            let isUpdateable_33: boolean;
            export { isUpdateable_33 as isUpdateable };
            let retrieving_33: boolean;
            export { retrieving_33 as retrieving };
            let template_33: boolean;
            export { template_33 as template };
        }
        export namespace r__mobilePushApp_name {
            let isCreateable_34: boolean;
            export { isCreateable_34 as isCreateable };
            let isUpdateable_34: boolean;
            export { isUpdateable_34 as isUpdateable };
            let retrieving_34: boolean;
            export { retrieving_34 as retrieving };
            let template_34: boolean;
            export { template_34 as template };
        }
        export namespace r__mobilePush_name {
            let isCreateable_35: boolean;
            export { isCreateable_35 as isCreateable };
            let isUpdateable_35: boolean;
            export { isUpdateable_35 as isUpdateable };
            let retrieving_35: boolean;
            export { retrieving_35 as retrieving };
            let template_35: boolean;
            export { template_35 as template };
        }
        export namespace assetId {
            let isCreateable_36: boolean;
            export { isCreateable_36 as isCreateable };
            let isUpdateable_36: boolean;
            export { isUpdateable_36 as isUpdateable };
            let retrieving_36: boolean;
            export { retrieving_36 as retrieving };
            let template_36: boolean;
            export { template_36 as template };
        }
        export namespace r__asset_key {
            let isCreateable_37: boolean;
            export { isCreateable_37 as isCreateable };
            let isUpdateable_37: boolean;
            export { isUpdateable_37 as isUpdateable };
            let retrieving_37: boolean;
            export { retrieving_37 as retrieving };
            let template_37: boolean;
            export { template_37 as template };
        }
        export namespace links {
            let isCreateable_38: boolean;
            export { isCreateable_38 as isCreateable };
            let isUpdateable_38: boolean;
            export { isUpdateable_38 as isUpdateable };
            let retrieving_38: boolean;
            export { retrieving_38 as retrieving };
            let template_38: boolean;
            export { template_38 as template };
        }
        export namespace activeTimes {
            let isCreateable_39: boolean;
            export { isCreateable_39 as isCreateable };
            let isUpdateable_39: boolean;
            export { isUpdateable_39 as isUpdateable };
            let retrieving_39: boolean;
            export { retrieving_39 as retrieving };
            let template_39: boolean;
            export { template_39 as template };
        }
    }
}
export default _default;
//# sourceMappingURL=MobilePush.definition.d.ts.map