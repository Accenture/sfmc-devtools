'use strict';

import TransactionalMessage from './TransactionalMessage.js';
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
 * TransactionalPush TransactionalMessage
 *
 * @augments TransactionalMessage
 */
class TransactionalPush extends TransactionalMessage {
    static subType = 'push';

    /**
     * prepares for deployment
     *
     * @param {MetadataTypeItem} metadata a single item
     * @returns {Promise.<MetadataTypeItem>} -
     */
    static async preDeployTasks(metadata) {
        // asset
        if (metadata.r__asset_key) {
            // we merely want to be able to show an error if it does not exist
            metadata.content ||= {};
            metadata.content.customerKey = cache.searchForField(
                'asset',
                metadata.r__asset_key,
                'customerKey',
                'customerKey'
            );
            delete metadata.r__asset_key;
        }
        // mobilePushApp REFERENCE resolution: key-first, name-fallback to a target-BU app.
        // ! mobilePushApp is retrieve-only/GUI-created, so 0 matches is a hard error.
        // ! files that only carry a plain applicationId (no r__ refs) are deployed unchanged.
        if (metadata.r__mobilePushApp_key || metadata.r__mobilePushApp_name) {
            // try the key first (works for same-BU deploys); references written before key==id still hold the encoded key
            let mobilePushApp = metadata.r__mobilePushApp_key
                ? cache.getByKey(
                      'mobilePushApp',
                      Util.mobilePushAppLegacyKeyToId(metadata.r__mobilePushApp_key)
                  )
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
            // the API only accepts the app's id
            metadata.applicationId = mobilePushApp.id;
            delete metadata.r__mobilePushApp_key;
            delete metadata.r__mobilePushApp_name;
        }
        if (metadata.options?.badge && typeof metadata.options?.badge !== 'string') {
            // ensure it's a string, or else the API will return an error. Our SDK turns numbers in strings into actual numbers
            metadata.options.badge += '';
        }

        return metadata;
    }

    /**
     * manages post retrieve steps
     *
     * @param {MetadataTypeItem} metadata a single item
     * @returns {MetadataTypeItem} a single item
     */
    static postRetrieveTasks(metadata) {
        // asset
        if (metadata.content?.customerKey) {
            try {
                // we merely want to be able to show an error if it does not exist
                metadata.r__asset_key = cache.searchForField(
                    'asset',
                    metadata.content.customerKey,
                    'customerKey',
                    'customerKey'
                );
                delete metadata.content;
            } catch (ex) {
                Util.logger.warn(
                    ` - ${this.definition.type} ${metadata[this.definition.nameField]} (${
                        metadata[this.definition.keyField]
                    }): ${ex.message}.`
                );
            }
        }
        // mobile application
        if (metadata.applicationId) {
            try {
                // key==id for mobilePushApp; the lookup merely confirms that the app exists
                const appKey = cache.searchForField(
                    'mobilePushApp',
                    metadata.applicationId,
                    'id',
                    'id'
                );
                // additionally write the portable name ref for cross-BU deploys
                const appName = cache.searchForField(
                    'mobilePushApp',
                    metadata.applicationId,
                    'id',
                    'name'
                );
                metadata.r__mobilePushApp_key = appKey;
                metadata.r__mobilePushApp_name = appName;
                delete metadata.applicationId;
            } catch {
                // keep applicationId so that the item stays deployable to the same BU
                Util.logger.warn(
                    ` - ${this.definition.type} ${metadata[this.definition.nameField]} (${
                        metadata[this.definition.keyField]
                    }): Could not find mobilePushApp with id ${metadata.applicationId}.`
                );
            }
        }
        if (metadata.options?.badge && typeof metadata.options?.badge !== 'string') {
            // ensure it's a string, or else the API will return an error. Our SDK turns numbers in strings into actual numbers
            metadata.options.badge += '';
        }

        return metadata;
    }
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
TransactionalPush.definition = MetadataTypeDefinitions.transactionalPush;

export default TransactionalPush;
