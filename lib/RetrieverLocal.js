'use strict';

const Util = require('./util/util');
const MetadataTypeInfo = require('./MetadataTypeInfo');
const cache = require('./util/cache');

/**
 * Builds metadata from a template using market specific customisation
 */
class RetrieverLocal {
    /**
     *  Creates a retrieves from a local folder, uses v2 auth if v2AuthOptions are passed.
     *
     * @param {Object} properties properties for auth
     * @param {Object} properties.directories list of default directories
     * @param {String} properties.directories.template where templates are saved
     * @param {Object} properties.directories.templateBuilds where template-based deployment definitions are saved
     * @param {Object} buObject properties for auth
     * @param {String} buObject.businessUnit name of Business Unit to authenticate with
     * @param {String} buObject.credential clientId for FuelSDK auth
     */
    constructor(properties, buObject) {
        this.buObject = buObject;
        this.properties = properties;
        this.templateDir = properties.directories.template;
        this.targetDir =
            properties.directories.templateBuilds[0] +
            buObject.credential +
            '/' +
            buObject.businessUnit;
    }

    /**
     * Retrieve the local metadata of specified types into local file system and Retriever.metadata
     * @param {String[]} metadataTypes metadata type to build
     * @param {String} name name of metadata to build
     * @param {Object} [templateVariables] Object of values which can be replaced (in case of templating)

     * @returns {Promise<Util.MultiMetadataTypeList>} Promise of a list of retrieved items grouped by type {automation:[...], query:[...]}
     */
    async retrieve(metadataTypes, name, templateVariables) {
        /**
         * @type {Util.MultiMetadataTypeList}
         */
        const retrieveChangelog = {};
        for (const metadataType of Util.getMetadataHierachy(metadataTypes)) {
            const [type, subType] = metadataType.split('-');
            // add client to metadata process class instead of passing every time
            MetadataTypeInfo[type].buObject = this.buObject;
            try {
                let result;
                if (!metadataTypes.includes(type) && !metadataTypes.includes(metadataType)) {
                    console.log('temp code, skipping cache');
                    continue;
                } else if (templateVariables) {
                    Util.logger.info(`Retrieving as Template: ${metadataType}`);
                    const nameArr = [name.trim()];
                    result = await Promise.all(
                        nameArr.map((name) => {
                            // with npx and powershell spaces are not parsed correctly as part of a string
                            // we hence require users to put %20 in their stead and have to convert that back
                            name = name.split('%20').join(' ');
                            //  console.log('####################subtype', subType);
                            return MetadataTypeInfo[type].buildTemplate(
                                this.templateDir,
                                name,
                                templateVariables,
                                this.targetDir,
                                subType
                            );
                        })
                    );
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

module.exports = RetrieverLocal;
