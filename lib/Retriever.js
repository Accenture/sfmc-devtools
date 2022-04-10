'use strict';

const MetadataTypeInfo = require('./MetadataTypeInfo');
const Util = require('./util/util');
const File = require('./util/file');
const cache = require('./util/cache');
const auth = require('./util/auth');
/**
 * Retrieves metadata from a business unit and saves it to the local filesystem.
 */
class Retriever {
    /**
     * Creates a Retriever, uses v2 auth if v2AuthOptions are passed.
     *
     * @param {Object} properties General configuration to be used in retrieve
     * @param {Object} properties.directories Directories to be used when interacting with FS
     * @param {auth.BuObject} buObject details of business unit in processing
     */
    constructor(properties, buObject) {
        this.buObject = buObject;
        this.properties = properties;
        this.retrieveDir = properties.directories.retrieve;
        this.templateDir = properties.directories.template;
        this.savePath = File.normalizePath([
            properties.directories.retrieve,
            buObject.credential,
            buObject.businessUnit,
        ]);
    }

    /**
     * Retrieve metadata of specified types into local file system and Retriever.metadata
     * @param {String[]} metadataTypes String list of metadata types to retrieve
     * @param {String} [name] name of Metadata to retrieve (in case of templating)
     * @param {Object} [templateVariables] Object of values which can be replaced (in case of templating)
     * @param {boolean} [changelogOnly] skip saving, only create json in memory
     * @returns {Promise<Util.MultiMetadataTypeList>} Promise of a list of retrieved items grouped by type {automation:[...], query:[...]}
     */
    async retrieve(metadataTypes, name, templateVariables, changelogOnly) {
        /**
         * @type {Util.MultiMetadataTypeList}
         */
        const retrieveChangelog = {};
        for (const metadataType of Util.getMetadataHierachy(metadataTypes)) {
            const [type, subType] = metadataType.split('-');
            MetadataTypeInfo[type].client = auth.getSDK(this.buObject);
            MetadataTypeInfo[type].properties = this.properties;
            MetadataTypeInfo[type].buObject = this.buObject;

            try {
                let result;
                if (!metadataTypes.includes(type) && !metadataTypes.includes(metadataType)) {
                    if (changelogOnly) {
                        // no extra caching needed for list view
                        continue;
                    }
                    Util.logger.info(`Caching dependent Metadata: ${metadataType}`);
                    result = await MetadataTypeInfo[type].retrieveForCache(subType);
                } else if (templateVariables) {
                    Util.logger.info(`Retrieving as Template: ${metadataType}`);
                    let nameArr;
                    if (name.includes(',')) {
                        nameArr = name.split(',').map((item) =>
                            // allow whitespace in comma-separated lists
                            item.trim()
                        );
                    } else {
                        nameArr = [name.trim()];
                    }

                    result = await Promise.all(
                        nameArr.map((name) => {
                            // with npx and powershell spaces are not parsed correctly as part of a string
                            // we hence require users to put %20 in their stead and have to convert that back
                            name = name.split('%20').join(' ');

                            return MetadataTypeInfo[type].retrieveAsTemplate(
                                this.templateDir,
                                name,
                                templateVariables,
                                subType
                            );
                        })
                    );
                } else {
                    Util.logger.info('Retrieving: ' + metadataType);
                    if (changelogOnly) {
                        result = await MetadataTypeInfo[type].retrieveChangelog(null, subType);
                    } else {
                        result = await MetadataTypeInfo[type].retrieve(
                            this.savePath,
                            null,
                            subType
                        );
                    }
                }
                if (result) {
                    if (templateVariables && Array.isArray(result)) {
                        // so far we are only doing this for templates, hence the above if-check
                        cache.setMetadata(
                            this.buObject.mid,
                            type,
                            result.map((element) => element.metadata)
                        );
                        if (metadataTypes.includes(type) || metadataTypes.includes(metadataType)) {
                            retrieveChangelog[type] = result.map((element) => element.metadata);
                        }
                    } else {
                        cache.setMetadata(type, result.metadata);
                        if (metadataTypes.includes(type) || metadataTypes.includes(metadataType)) {
                            retrieveChangelog[type] = result.metadata;
                        }
                    }
                }
            } catch (ex) {
                Util.logger.errorStack(ex, `Retrieving ${metadataType} failed`);
                // do not continue retrieving if one type failed. simply skip processing the rest of the for-loop
                break;
            }
        }
        return retrieveChangelog;
    }
}

module.exports = Retriever;
