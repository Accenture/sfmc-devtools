export default MobilePush;
export type BuObject = import("../../types/mcdev.d.js").BuObject;
export type CodeExtract = import("../../types/mcdev.d.js").CodeExtract;
export type CodeExtractItem = import("../../types/mcdev.d.js").CodeExtractItem;
export type MetadataTypeItem = import("../../types/mcdev.d.js").MetadataTypeItem;
export type MetadataTypeItemDiff = import("../../types/mcdev.d.js").MetadataTypeItemDiff;
export type MetadataTypeItemObj = import("../../types/mcdev.d.js").MetadataTypeItemObj;
export type MetadataTypeMap = import("../../types/mcdev.d.js").MetadataTypeMap;
export type MetadataTypeMapObj = import("../../types/mcdev.d.js").MetadataTypeMapObj;
export type SoapRequestParams = import("../../types/mcdev.d.js").SoapRequestParams;
export type TemplateMap = import("../../types/mcdev.d.js").TemplateMap;
/**
 * @typedef {import('../../types/mcdev.d.js').BuObject} BuObject
 * @typedef {import('../../types/mcdev.d.js').CodeExtract} CodeExtract
 * @typedef {import('../../types/mcdev.d.js').CodeExtractItem} CodeExtractItem
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItem} MetadataTypeItem
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItemDiff} MetadataTypeItemDiff
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeItemObj} MetadataTypeItemObj
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMap} MetadataTypeMap
 * @typedef {import('../../types/mcdev.d.js').MetadataTypeMapObj} MetadataTypeMapObj
 * @typedef {import('../../types/mcdev.d.js').SoapRequestParams} SoapRequestParams
 * @typedef {import('../../types/mcdev.d.js').TemplateMap} TemplateMap
 */
/**
 * MobilePush MetadataType
 *
 * @augments MetadataType
 */
declare class MobilePush extends MetadataType {
    /**
     * Retrieves Metadata of Mobile Keywords
     * get all: https://developer.salesforce.com/docs/marketing/marketing-cloud/references/mc_rest_push?meta=Get%2BPush%2BMessages
     * get one: https://developer.salesforce.com/docs/marketing/marketing-cloud/references/mc_rest_push?meta=Get%2Ba%2BPush%2BMessage%2Bby%2BID
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static retrieve(retrieveDir: string, _?: void | string[], __?: void | string[], key?: string): Promise<MetadataTypeMapObj>;
    /**
     * Retrieves event definition metadata for caching
     *
     * @param {void | string[]} [_] parameter not used
     * @param {void | string[]} [__] parameter not used
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static retrieveForCache(_?: void | string[], __?: void | string[], key?: string): Promise<MetadataTypeMapObj>;
    /**
     * Updates a single item
     * docs: https://developer.salesforce.com/docs/marketing/marketing-cloud/references/mc_rest_push?meta=Update%2Ba%2BPush%2BMessage
     *
     * @param {MetadataTypeItem} metadata a single item
     * @returns {Promise} Promise
     */
    static update(metadata: MetadataTypeItem): Promise<any>;
    /**
     * Creates a single item
     * docs: https://developer.salesforce.com/docs/marketing/marketing-cloud/references/mc_rest_push?meta=Create%2Ba%2BPush%2BMessage
     *
     * @param {MetadataTypeItem} metadata a single item
     * @returns {Promise} Promise
     */
    static create(metadata: MetadataTypeItem): Promise<any>;
    /**
     * manages post retrieve steps
     * field definitions: https://developer.salesforce.com/docs/marketing/marketing-cloud/references/mc_rest_push?meta=Get%2Ba%2BPush%2BMessage%2Bby%2BID
     *
     * @param {MetadataTypeItem} metadata a single query
     * @returns {MetadataTypeItem} Array with one metadata object and one query string
     */
    static postRetrieveTasks(metadata: MetadataTypeItem): MetadataTypeItem;
    /**
     * prepares an event definition for deployment
     *
     * @param {MetadataTypeItem} metadata a single MobilePush
     * @returns {Promise.<MetadataTypeItem>} Promise
     */
    static preDeployTasks(metadata: MetadataTypeItem): Promise<MetadataTypeItem>;
}
declare namespace MobilePush {
    let definition: {
        bodyIteratorField: string;
        dependencies: string[];
        dependencyGraph: {
            mobilePushApp: string[];
        };
        hasExtended: boolean;
        idField: string;
        keepId: boolean;
        keyIsFixed: boolean;
        keyField: string;
        nameField: string;
        createdDateField: string;
        createdNameField: any;
        lastmodDateField: string;
        lastmodNameField: any;
        restPagination: boolean;
        restPageSize: number;
        type: string;
        typeDescription: string;
        typeRetrieveByDefault: boolean;
        typeCdpByDefault: boolean;
        typeName: string;
        messageTypeMapping: {
            outboundPush: number;
            locationEntry: number;
            locationExit: number;
            beacon: number;
            inapp: number;
            inbox: number;
        };
        contentTypeMapping: {
            alert: number;
            inbox: number;
            inboxAndAlert: number;
        };
        tzPastSendActionMapping: {
            sendImmediately: number;
            sendAtScheduledTimeNextDay: number;
            neverSend: number;
        };
        statusMapping: {
            draft: number;
            active: number;
            inactive: number;
            deleted: number;
        };
        sendInitiatorMapping: {
            gui: number;
            api: number;
            automation: number;
            journeyBuilder: number;
        };
        fields: {
            id: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            alert: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            sound: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            messageType: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            c__messageType: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            contentType: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            c__contentType: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            messageObjectId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            activityInstanceId: {
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
            tzPastSendAction: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            c__tzPastSendAction: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            sendInitiator: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            c__sendInitiator: {
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
            c__status: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            title: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            subtitle: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            subject: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            url: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            replaceInboxMessage: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            inboxMessage: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            inboxSubtitle: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            advanceInboxSendType: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            isDuplicationAllowed: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            currentEditStep: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            contentAvailable: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            scheduledTimezone: {
                skipValidation: boolean;
            };
            media: {
                skipValidation: boolean;
            };
            createdDate: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            lastUpdated: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            startDateUtc: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            startDate: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            endDateUtc: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            endDate: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            'application.id': {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            r__mobilePushApp_key: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            assetId: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            r__asset_key: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            links: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
            activeTimes: {
                isCreateable: boolean;
                isUpdateable: boolean;
                retrieving: boolean;
                template: boolean;
            };
        };
    };
}
import MetadataType from './MetadataType.js';
//# sourceMappingURL=MobilePush.d.ts.map