'use strict';

const MetadataType = require('./MetadataType');
const Util = require('../util/util');

/**
 * MobileKeyword MetadataType
 * @augments MetadataType
 */
class MobileKeyword extends MetadataType {
    /**
     * Retrieves Metadata of Mobile Keywords
     * Endpoint /legacy/v1/beta/mobile/keyword/ return all Mobile Keywords with all details.
     * @param {String} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise<Object>} Promise of metadata
     */
    static retrieve(retrieveDir) {
        return super.retrieveREST(retrieveDir, '/legacy/v1/beta/mobile/keyword/?view=simple', null);
    }

    /**
     * Retrieves event definition metadata for caching
     * @returns {Promise<Object>} Promise of metadata
     */
    static retrieveForCache() {
        return super.retrieveREST(null, '/legacy/v1/beta/mobile/keyword/?view=simple', null);
    }

    /**
     * Retrieve a specific keyword
     * @param {String} templateDir Directory where retrieved metadata directory will be saved
     * @param {String} name name of the metadata file
     * @param {Object} templateVariables variables to be replaced in the metadata
     * @returns {Promise<Object>} Promise of metadata
     */
    static async retrieveAsTemplate(templateDir, name, templateVariables) {
        return super.retrieveREST(
            templateDir,
            `/legacy/v1/beta/mobile/keyword/?view=simple&$where=keyword%20eq%20%27${name}%27%20`,
            null,
            templateVariables
        );
        // TODO: Decide if we want to keep default handling (and move other types) or keep unique parsing?
        // const res = await this.client.rest.get();
        // const keyword = res.entry.filter((item) => item.keyword === name);
        // try {
        //     if (keyword.length === 0) {
        //         throw new Error(`No Keywords Found with name "${name}"`);
        //     } else if (keyword.length > 1) {
        //         throw new Error(
        //             `Multiple Keywords with name "${name}"` +
        //                 `please rename to be unique to avoid issues`
        //         );
        //     } else if (keyword.length === 1) {
        //         const keywordDef = JSON.parse(
        //             Util.replaceByObject(JSON.stringify(keyword[0]), variables)
        //         );
        //         if (!keywordDef.code.id) {
        //             throw new Error(
        //                 `MobileKeyword.parseMetadata:: ` +
        //                     `No Mobile Code was found for ` +
        //                     `event: ${keywordDef.name}. ` +
        //                     `This cannot be templated`
        //             );
        //         }

        //         // remove all fields listed in Definition for templating
        //         this.keepTemplateFields(keywordDef);
        //         File.writeJSONToFile(
        //             [templateDir, this.definition.type].join('/'),
        //             keywordDef.keyword + '.' + this.definition.type + '-meta',
        //             JSON.parse(Util.replaceByObject(JSON.stringify(keywordDef), variables))
        //         );
        //         Util.logger.info(
        //             `MobileKeyword.retrieveAsTemplate:: Written Metadata to filesystem (${name})`
        //         );
        //         return { metadata: keywordDef, type: this.definition.type };
        //     } else {
        //         throw new Error(
        //             `Encountered unknown error when retrieveing ${
        //                 this.definition.typeName
        //             } "${name}": ${JSON.stringify(res.body)}`
        //         );
        //     }
        // } catch (ex) {
        //     Util.logger.error('MobileKeyword.retrieveAsTemplate:: ' + ex);
        //     return null;
        // }
    }

    /**
     * Creates a single Event Definition
     * @param {Object} MobileKeyword a single Event Definition
     * @returns {Promise} Promise
     */
    static create(MobileKeyword) {
        return super.createREST(MobileKeyword, '/legacy/v1/beta/mobile/keyword/');
    }

    /**
     * prepares an event definition for deployment
     * @param {Object} metadata a single MobileKeyword
     * @returns {Promise} Promise
     */
    static async preDeployTasks(metadata) {
        metadata.code.id = Util.getFromCache(
            this.cache,
            'mobileCode',
            metadata.code.code,
            'code',
            'id'
        );
        return metadata;
    }
}

// Assign definition to static attributes
MobileKeyword.definition = require('../MetadataTypeDefinitions').mobileKeyword;
MobileKeyword.cache = {};
MobileKeyword.client = undefined;

module.exports = MobileKeyword;
