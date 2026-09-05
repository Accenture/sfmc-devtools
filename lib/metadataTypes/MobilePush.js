'use strict';

import MetadataType from './MetadataType.js';
import { Util } from '../util/util.js';
import cache from '../util/cache.js';

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
class MobilePush extends MetadataType {
    /**
     * Retrieves Metadata of Mobile Keywords
     * get all: https://developer.salesforce.com/docs/marketing/marketing-cloud/references/mc_rest_push?meta=Get%2BPush%2BMessages
     * get one: https://developer.salesforce.com/docs/marketing/marketing-cloud/references/mc_rest_push?meta=Get%2Ba%2BPush%2BMessage%2Bby%2BID
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void | string[]} [_] unused parameter
     * @param {void | string[]} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @param {boolean} [warnOnDuplicateNames] enable duplicate-name diagnostics for non-file retrieval contexts
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static async retrieve(retrieveDir, _, __, key, warnOnDuplicateNames = Boolean(retrieveDir)) {
        if (key && key.startsWith('id:')) {
            // if key starts with id: remove it to be compatible with other legacy API types (MetadataType.postCreateTasks_legacyApi)
            key = key.slice(3);
        }
        try {
            // ! the endpoint expects the ID and not a key but for mcdev in this case key==id
            // ! retrieveREST is async; we have to await it here so a rejected Promise is actually caught below
            const result = await super.retrieveREST(
                retrieveDir,
                '/push/v1/message/' + (key || ''),
                null,
                key
            );
            // Warn only for explicit retrieves. Cache-only retrieval during deploy must stay quiet;
            // the deploy path emits the blocking item-level ambiguity error instead.
            if (warnOnDuplicateNames) {
                this._warnOnDuplicateNames(result?.metadata);
            }
            return result;
        } catch (ex) {
            // if the mobilePush key does not exist, the API returns HTTP 400 with body { message: "Validation Error", errorcode: 10006 }; sfmc-sdk surfaces that as RestError.code === 10006. Handle it gracefully instead of aborting the whole retrieve.
            if (key && ex.code === 10006) {
                Util.logger.info(
                    `Downloaded: ${this.definition.type} (0)${Util.getKeysString(key)}`
                );
                this.postDeleteTasks(key);
            } else if (!key && ex.code === 'ERR_BAD_RESPONSE') {
                // ! on a BU with 0 push messages the list endpoint /push/v1/message/ returns HTTP 500 (ERR_BAD_RESPONSE) instead of an empty array; degrade gracefully to "0 downloaded" like other types do
                Util.logger.info(`Downloaded: ${this.definition.type} (0)`);
                return { metadata: {}, type: this.definition.type };
            } else {
                throw ex;
            }
        }
        return;
    }

    /**
     * Retrieves event definition metadata for caching
     *
     * @param {void | string[]} [_] parameter not used
     * @param {void | string[]} [__] parameter not used
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static retrieveForCache(_, __, key) {
        return this.retrieve(null, null, null, key);
    }

    /**
     * Retrieves metadata without saving for an explicit changelog request.
     *
     * @returns {Promise.<MetadataTypeMapObj>} Promise of metadata
     */
    static retrieveChangelog() {
        return this.retrieve(null, null, null, null, true);
    }

    /**
     * warns (loudly, without dropping any item) when a retrieved metadata map contains multiple
     * items that share the same name. Duplicate names make cross-BU name-fallback deploys ambiguous.
     * Synchronous post-await group-by; a harmless no-op on single-key retrieve.
     *
     * @param {MetadataTypeMap} [metadata] the retrieved metadata map (id-keyed)
     * @returns {void}
     */
    static _warnOnDuplicateNames(metadata) {
        if (!metadata) {
            return;
        }
        // group ids + createdDates by name
        const byName = {};
        for (const item of Object.values(metadata)) {
            const name = item[this.definition.nameField];
            byName[name] ||= [];
            byName[name].push(item);
        }
        // emit a loud warn for any name used by >1 item
        for (const name in byName) {
            if (byName[name].length > 1) {
                const details = byName[name]
                    .map(
                        (item) =>
                            `${item[this.definition.keyField]} (createdDate: ${item[this.definition.createdDateField] || 'n/a'})`
                    )
                    .join(', ');
                Util.logger.warn(
                    ` - ${this.definition.type}: name "${name}" is used by ${byName[name].length} items: ${details}. Names must be unique within a BU for cross-BU deploys — clean these up.`
                );
            }
        }
    }

    /**
     * Updates a single item
     * docs: https://developer.salesforce.com/docs/marketing/marketing-cloud/references/mc_rest_push?meta=Update%2Ba%2BPush%2BMessage
     *
     * @param {MetadataTypeItem} metadata a single item
     * @returns {Promise} Promise
     */
    static update(metadata) {
        // ! the endpoint expects the ID and not a key but for mcdev in this case key==id
        return super.updateREST(
            metadata,
            '/push/v1/message/' + metadata[this.definition.idField],
            'put' // upsert API, put for insert and update!
        );
    }

    /**
     * Creates a single item
     * docs: https://developer.salesforce.com/docs/marketing/marketing-cloud/references/mc_rest_push?meta=Create%2Ba%2BPush%2BMessage
     *
     * @param {MetadataTypeItem} metadata a single item
     * @returns {Promise} Promise
     */
    static create(metadata) {
        return super.createREST(metadata, '/push/v1/message/');
    }

    /**
     * manages post retrieve steps
     * field definitions: https://developer.salesforce.com/docs/marketing/marketing-cloud/references/mc_rest_push?meta=Get%2Ba%2BPush%2BMessage%2Bby%2BID
     *
     * @param {MetadataTypeItem} metadata a single query
     * @returns {MetadataTypeItem} Array with one metadata object and one query string
     */
    static postRetrieveTasks(metadata) {
        // mobile application
        if (metadata.application?.id) {
            const appId = metadata.application.id;
            try {
                // faithful id-based ref (primary/unchanged)
                metadata.r__mobilePushApp_key = cache.searchForField(
                    'mobilePushApp',
                    appId,
                    'id',
                    'key'
                );
                // additionally write the portable name ref for cross-BU deploys
                metadata.r__mobilePushApp_name = cache.searchForField(
                    'mobilePushApp',
                    appId,
                    'id',
                    'name'
                );
                delete metadata.application;
            } catch {
                Util.logger.warn(
                    `Could not find mobilePushApp with id ${appId} for mobilePush ${metadata.name} (${metadata.id}).`
                );
            }
        }
        // asset
        if (metadata.assetId) {
            try {
                metadata.r__asset_key = cache.searchForField(
                    'asset',
                    metadata.assetId,
                    'id',
                    'customerKey'
                );
                delete metadata.assetId;
            } catch {
                Util.logger.warn(
                    `Could not find asset with id ${metadata.assetId} for mobilePush ${metadata.name} (${metadata.id}).`
                );
            }
        }

        // messageType
        // 1 (outbound=push), 3 (location entry), 4 (location exit), 5 (beacon), 7 (inapp) or 8 (inbox)
        try {
            metadata.c__messageType = Util.inverseGet(
                this.definition.messageTypeMapping,
                metadata.messageType
            );
            delete metadata.messageType;
        } catch {
            Util.logger.warn(
                `Could not find messageType ${metadata.messageType} for mobilePush ${metadata.name} (${metadata.id}).`
            );
        }

        // contentType
        // 1 (alert), 2 (inbox), and 3 (inbox and alert)
        try {
            metadata.c__contentType = Util.inverseGet(
                this.definition.contentTypeMapping,
                metadata.contentType
            );
            delete metadata.contentType;
        } catch {
            if (metadata.contentType !== 0 && metadata.contentType !== 5) {
                // ! weirdly, we saw contentType 0 and 5 in the wild, which is not documented in the API docs.  log a warning.
                Util.logger.warn(
                    `Could not find contentType ${metadata.contentType} for mobilePush ${metadata.name} (${metadata.id}).`
                );
            }
        }

        // tzPastSendAction
        // 0=send immediately, 1 (send immediately), 2 (send at scheduled time on the next day), or 3 (never send)
        try {
            metadata.c__tzPastSendAction = Util.inverseGet(
                this.definition.tzPastSendActionMapping,
                metadata.tzPastSendAction
            );
            delete metadata.tzPastSendAction;
        } catch {
            Util.logger.warn(
                `Could not find tzPastSendAction ${metadata.tzPastSendAction} for mobilePush ${metadata.name} (${metadata.id}).`
            );
        }

        // sendInitiator
        // Possible values: 0 (UI-based send), 1 (API), 2 (automation), or 3 (Journey Builder)
        try {
            metadata.c__sendInitiator = Util.inverseGet(
                this.definition.sendInitiatorMapping,
                metadata.sendInitiator
            );
            delete metadata.sendInitiator;
        } catch {
            Util.logger.warn(
                `Could not find sendInitiator ${metadata.sendInitiator} for mobilePush ${metadata.name} (${metadata.id}).`
            );
        }

        // status
        //  Possible values: 1 (draft), 2 (active), 3 (inactive), or 4 (deleted).
        try {
            metadata.c__status = Util.inverseGet(this.definition.statusMapping, metadata.status);
            delete metadata.status;
        } catch {
            Util.logger.warn(
                `Could not find status ${metadata.status} for mobilePush ${metadata.name} (${metadata.id}).`
            );
        }

        // TODO: advanceInboxSendType

        return metadata;
    }

    /**
     * helper for {@link MetadataType.createOrUpdate}: resolves a to-be-deployed mobilePush to an
     * existing target-BU item by NAME when the id/key does not match (cross-BU deploy).
     * mobilePush uses the server-generated id as its key, so the key differs per BU; matching by
     * the portable name lets createOrUpdate pick update-vs-create correctly across BUs.
     * ! Intentionally runs UNCONDITIONALLY — NOT gated on Util.OPTIONS.matchName (deliberate
     * ! divergence from the Asset precedent, per the approved plan). Do NOT re-add a flag gate:
     * ! the always-on name-fallback works around SFMC not allowing custom keys for this type.
     *
     * @param {MetadataTypeItem} metadataItem to be deployed item
     * @returns {MetadataTypeItem} cached item or undefined
     */
    static getCacheMatchedByName(metadataItem) {
        const deployedName = metadataItem[this.definition.nameField];
        if (deployedName === undefined || deployedName === null || deployedName === '') {
            return super.getCacheMatchedByName(metadataItem);
        }
        // scan the target cache for items whose name equals the deployed item's name
        const typeCache = cache.getCache()?.[this.definition.type];
        const potentials = [];
        for (const key in typeCache) {
            if (
                typeCache[key][this.definition.nameField] ===
                metadataItem[this.definition.nameField]
            ) {
                potentials.push(typeCache[key]);
            }
        }
        // >1 matches: throw so the standard upsert handler logs an item-level skipping error
        if (potentials.length > 1) {
            throw new Error(
                `name "${deployedName}" matches multiple target-BU ${this.definition.type} items. Matching IDs: ${potentials
                    .map((item) => item[this.definition.keyField])
                    .join(', ')}. Clean up the duplicate names on the target BU before deploying.`
            );
        } else if (potentials.length === 1) {
            // exactly 1 match: return it so createOrUpdate updates it
            Util.logger.info(
                Util.getGrayMsg(
                    ` - found ${this.definition.type} in cache by name "${metadataItem[this.definition.nameField]}": ${potentials[0][this.definition.keyField]}`
                )
            );
            return potentials[0];
        }
        // 0 matches: return the base-class default (null) so createOrUpdate CREATEs a new item
        return super.getCacheMatchedByName(metadataItem);
    }

    /**
     * prepares an event definition for deployment
     *
     * @param {MetadataTypeItem} metadata a single MobilePush
     * @returns {Promise.<MetadataTypeItem>} Promise
     */
    static async preDeployTasks(metadata) {
        // mobilePushApp REFERENCE resolution: key-first, name-fallback to a target-BU app.
        // ! this is a REFERENCE site — mobilePushApp is retrieve-only/GUI-created, so 0 matches is
        // ! a hard error (never a create, unlike the top-level item deploy path).
        if (metadata.r__mobilePushApp_key || metadata.r__mobilePushApp_name) {
            // try the id-based key first (works for same-BU deploys)
            let mobilePushApp = metadata.r__mobilePushApp_key
                ? cache.getByKey('mobilePushApp', metadata.r__mobilePushApp_key)
                : undefined;
            // key miss (e.g. cross-BU): fall back to resolving by the portable name
            if (!mobilePushApp && metadata.r__mobilePushApp_name) {
                const appCache = cache.getCache()?.mobilePushApp;
                const potentials = [];
                for (const key in appCache) {
                    if (appCache[key].name === metadata.r__mobilePushApp_name) {
                        potentials.push(appCache[key]);
                    }
                }
                if (potentials.length > 1) {
                    // ambiguous app name → hard-error listing all matching ids
                    throw new Error(
                        `found multiple mobilePushApp name matches in cache for name "${metadata.r__mobilePushApp_name}". Identified ids: ${potentials
                            .map((p) => p.id)
                            .join(
                                ', '
                            )}. Names must be unique within a BU — clean up the duplicates first.`
                    );
                } else if (potentials.length === 1) {
                    mobilePushApp = potentials[0];
                }
            }
            // 0 matches on key AND name → the referenced app is missing on the target BU
            if (!mobilePushApp) {
                throw new Error(
                    `mobilePushApp '${metadata.r__mobilePushApp_name || metadata.r__mobilePushApp_key}' not found on target BU — must be created via GUI first`
                );
            }
            // preserve the existing shape at this site: the whole cached app object
            metadata.application = mobilePushApp;

            // delete-parity: retain the mobilePush/mobilePushApp refs (only mobileMessage deletes its refs)
            delete metadata.r__mobilePushApp_key;
        }

        if (metadata.r__asset_key) {
            metadata.assetId = cache.searchForField(
                'asset',
                metadata.r__asset_key,
                'customerKey',
                'id'
            );
            delete metadata.r__asset_key;
        }
        if (metadata.c__messageType) {
            metadata.messageType = this.definition.messageTypeMapping[metadata.c__messageType];
        }
        if (metadata.c__contentType) {
            metadata.contentType = this.definition.contentTypeMapping[metadata.c__contentType];
        }
        if (metadata.c__tzPastSendAction) {
            metadata.tzPastSendAction =
                this.definition.tzPastSendActionMapping[metadata.c__tzPastSendAction];
        }
        if (metadata.c__sendInitiator) {
            metadata.sendInitiator =
                this.definition.sendInitiatorMapping[metadata.c__sendInitiator];
        }
        if (metadata.c__status) {
            metadata.status = this.definition.statusMapping[metadata.c__status];
        }
        return metadata;
    }

    /**
     * helper for {@link MetadataType.createREST}
     *
     * @param {MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {object} apiResponse varies depending on the API call
     * @returns {Promise.<object>} apiResponse
     */
    // static async postCreateTasks(metadataEntry, apiResponse) {
    //     await super.postDeployTasks_legacyApi(metadataEntry, apiResponse);

    //     return apiResponse;
    // }

    /**
     * helper for {@link MetadataType.updateREST}
     *
     * @param {MetadataTypeItem} metadataEntry a single metadata Entry
     * @param {object} apiResponse varies depending on the API call
     * @returns {Promise.<object>} apiResponse, potentially modified
     */
    // static async postUpdateTasks(metadataEntry, apiResponse) {
    //     await super.postDeployTasks_legacyApi(metadataEntry, apiResponse);
    //     return apiResponse;
    // }

    /**
     * Delete a metadata item from the specified business unit
     * ! the endpoint expects the ID and not a key but for mcdev in this case key==id
     *
     * @param {string} id Identifier of item
     * @returns {Promise.<boolean>} deletion success status
     */
    static deleteByKey(id) {
        Util.logger.info(
            Util.getGrayMsg(
                ' - Note: As long as the provided API key once existed, you will not see an error even if the mobilePush is already deleted.'
            )
        );
        return super.deleteByKeyREST('/push/v1/message/' + id, id, 400);
    }
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
MobilePush.definition = MetadataTypeDefinitions.mobilePush;

export default MobilePush;
