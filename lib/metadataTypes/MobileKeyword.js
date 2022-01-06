'use strict';

const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const File = require('../util/file');

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
        return super.retrieveREST(retrieveDir, '/legacy/v1/beta/mobile/keyword/', null);
    }

    /**
     * Retrieves event definition metadata for caching
     * @returns {Promise<Object>} Promise of metadata
     */
    static retrieveForCache() {
        return super.retrieveREST(null, '/legacy/v1/beta/mobile/keyword/', null);
    }

    // TODO template is not currently supported
    /**
     * Retrieve a specific Event Definition by Name
     * @param {String} templateDir Directory where retrieved metadata directory will be saved
     * @param {String} name name of the metadata file
     * @param {Object} variables variables to be replaced in the metadata
     * @returns {Promise<Object>} Promise of metadata
     */
    // static async retrieveAsTemplate(templateDir, name, variables) {
    //     // todo template based on name
    //     const options = {
    //         uri: '/interaction/v1/MobileKeywords?name=' + encodeURIComponent(name),
    //     };
    //     const res = await this.client.rest.get(options);
    //     const event = res.items.filter((item) => item.name === name);
    //     try {
    //         if (!event || event.length === 0) {
    //             throw new Error(`No Event Definitions Found with name "${name}"`);
    //         } else if (event.length > 1) {
    //             throw new Error(
    //                 `Multiple Event Definitions with name "${name}"` +
    //                     `please rename to be unique to avoid issues`
    //             );
    //         } else if (event && event.length === 1) {
    //             const eventDef = JSON.parse(
    //                 Util.replaceByObject(JSON.stringify(this.parseMetadata(event[0])), variables)
    //             );
    //             if (!eventDef.dataExtensionId) {
    //                 throw new Error(
    //                     `MobileKeyword.parseMetadata:: ` +
    //                         `No Data Extension found for ` +
    //                         `event: ${eventDef.name}. ` +
    //                         `This cannot be templated`
    //                 );
    //             }

    //             // remove all fields listed in Definition for templating
    //             this.keepTemplateFields(eventDef);
    //             File.writeJSONToFile(
    //                 [templateDir, this.definition.type].join('/'),
    //                 eventDef.customerKey + '.' + this.definition.type + '-meta',
    //                 JSON.parse(Util.replaceByObject(JSON.stringify(eventDef), variables))
    //             );
    //             Util.logger.info(
    //                 `MobileKeyword.retrieveAsTemplate:: Written Metadata to filesystem (${name})`
    //             );
    //             return { metadata: eventDef, type: this.definition.type };
    //         } else {
    //             throw new Error(
    //                 `Encountered unknown error when retrieveing ${
    //                     this.definition.typeName
    //                 } "${name}": ${JSON.stringify(res.body)}`
    //             );
    //         }
    //     } catch (ex) {
    //         Util.logger.error('MobileKeyword.retrieveAsTemplate:: ' + ex);
    //         return null;
    //     }
    // }

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
