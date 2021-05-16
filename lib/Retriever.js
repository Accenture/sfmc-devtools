'use strict';

const MetadataTypeInfo = require('./MetadataTypeInfo');
const Util = require('./util/util');
const File = require('./util/file');
/**
 * Retrieves metadata from a business unit and saves it to the local filesystem.
 */
class Retriever {
    /**
     * Creates a Retriever, uses v2 auth if v2AuthOptions are passed.
     *
     * @param {Object} properties General configuration to be used in retrieve
     * @param {Object} properties.directories Directories to be used when interacting with FS
     * @param {Object} buObject properties for auth
     * @param {String} buObject.clientId clientId for FuelSDK auth
     * @param {String} buObject.clientSecret clientSecret for FuelSDK auth
     * @param {Object} buObject.credential clientId for FuelSDK auth
     * @param {String} buObject.tenant v2 Auth Tenant Information
     * @param {String} [buObject.mid] ID of Business Unit to authenticate with
     * @param {String} [buObject.businessUnit] name of Business Unit to authenticate with
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

        this.metadata = {};
    }

    /**
     * Retrieve metadata of specified types into local file system and Retriever.metadata
     * @param {String[]} metadataTypes String list of metadata types to retrieve
     * @param {String} [name] name of Metadata to retrieve (in case of templating)
     * @param {Object} [templateVariables] Object of values which can be replaced (in case of templating)
     * @returns {Promise} Promise
     */
    async retrieve(metadataTypes, name, templateVariables) {
        for (const metadataType of Util.getMetadataHierachy(metadataTypes)) {
            let result;
            const [type, subType] = metadataType.split('-');
            // add metadata & client to metadata process class instead of passing cache/mapping every time
            MetadataTypeInfo[type].cache = this.metadata;
            MetadataTypeInfo[type].properties = this.properties;

            try {
                if (!metadataTypes.includes(type)) {
                    Util.logger.info(`Caching dependent Metadata: ${metadataType}`);
                    await Util.retryOnError(
                        `Retrying to cache ${metadataType}`,
                        async () => {
                            result = await MetadataTypeInfo[type].retrieveForCache(
                                this.buObject,
                                subType
                            );
                            if (type == 'list') {
                                Util.logger.debug('==list==');
                                Util.logger.debug(JSON.stringify(result));
                            }
                        },
                        true
                    );
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
                    await Util.retryOnError(`Retrying ${metadataType}`, async () => {
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
                    });
                } else {
                    Util.logger.info('Retrieving: ' + metadataType);
                    await Util.retryOnError(`Retrying ${metadataType}`, async () => {
                        result = await MetadataTypeInfo[type].retrieve(
                            this.savePath,
                            null,
                            this.buObject,
                            subType
                        );
                    });
                }
                if (result) {
                    if (templateVariables && Array.isArray(result)) {
                        // so far we are only doing this for templates, hence the above if-check
                        this.metadata[type] = result.map((element) => element.metadata);
                    } else {
                        this.metadata[type] = result.metadata;
                    }
                }
            } catch (ex) {
                Util.logger.error(`Retriever.retrieve:: Retrieving ${metadataType} failed`);
                Util.logger.debug(ex.stack);
                if (Util.logger.level === 'debug') {
                    console.log(ex.stack);
                }
            }
        }
    }
}

module.exports = Retriever;
