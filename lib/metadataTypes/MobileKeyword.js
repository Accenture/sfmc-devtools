'use strict';

const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const File = require('../util/file');
const cache = require('../util/cache');

/**
 * MobileKeyword MetadataType
 *
 * @augments MetadataType
 */
class MobileKeyword extends MetadataType {
    /**
     * Retrieves Metadata of Mobile Keywords
     * Endpoint /legacy/v1/beta/mobile/keyword/ return all Mobile Keywords with all details.
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise<{metadata:Util.MetadataTypeMap,type:string}>} Promise of metadata
     */
    static retrieve(retrieveDir) {
        return super.retrieveREST(retrieveDir, '/legacy/v1/beta/mobile/keyword/?view=simple', null);
    }

    /**
     * Retrieves event definition metadata for caching
     *
     * @returns {Promise<{metadata:Util.MetadataTypeMap,type:string}>} Promise of metadata
     */
    static retrieveForCache() {
        return super.retrieveREST(null, '/legacy/v1/beta/mobile/keyword/?view=simple', null);
    }

    /**
     * Retrieve a specific keyword
     *
     * @param {string} templateDir Directory where retrieved metadata directory will be saved
     * @param {string} name name of the metadata file
     * @param {Util.TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {Promise<{metadata:Util.MetadataTypeItem,type:string}>} Promise of metadata
     */
    static async retrieveAsTemplate(templateDir, name, templateVariables) {
        // TODO: Decide if we want to keep default handling (and move other types) or keep unique parsing?
        try {
            const res = await this.client.rest.get(
                `/legacy/v1/beta/mobile/keyword/?view=simple&$where=keyword%20eq%20%27${name}%27%20`
            );
            const metadata = JSON.parse(
                Util.replaceByObject(
                    JSON.stringify(Util.templateSearchResult(res.entry, 'keyword', name)),
                    templateVariables
                )
            );
            if (!metadata.code.id) {
                throw new Error(
                    `MobileKeyword.parseMetadata:: ` +
                        `No Mobile Code was found for ` +
                        `event: ${metadata.name}. ` +
                        `This cannot be templated`
                );
            }
            // remove all fields listed in Definition for templating
            this.keepTemplateFields(metadata);
            File.writeJSONToFile(
                [templateDir, this.definition.type].join('/'),
                metadata.keyword + '.' + this.definition.type + '-meta',
                metadata
            );
            Util.logger.info(`- templated ${this.definition.type}: ${name}`);
            return { metadata: metadata, type: this.definition.type };
        } catch (ex) {
            Util.logger.error('MobileKeyword.retrieveAsTemplate:: ' + ex);
            return null;
        }
    }

    /**
     * Creates a single Event Definition
     *
     * @param {object} MobileKeyword a single Event Definition
     * @returns {Promise} Promise
     */
    static create(MobileKeyword) {
        return super.createREST(MobileKeyword, '/legacy/v1/beta/mobile/keyword/');
    }

    /**
     * prepares an event definition for deployment
     *
     * @param {object} metadata a single MobileKeyword
     * @returns {Promise} Promise
     */
    static async preDeployTasks(metadata) {
        metadata.code.id = cache.searchForField('mobileCode', metadata.code.code, 'code', 'id');
        return metadata;
    }
}

// Assign definition to static attributes
MobileKeyword.definition = require('../MetadataTypeDefinitions').mobileKeyword;

module.exports = MobileKeyword;
