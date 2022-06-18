'use strict';

const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const File = require('../util/file');
const cache = require('../util/cache');

/**
 * ContentArea MetadataType
 *
 * @augments MetadataType
 */
class ContentArea extends MetadataType {
    /**
     * Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of metadata
     */
    static retrieve(retrieveDir) {
        Util.logger.warn(
            'Classic Content Areas are deprecated and will be discontinued by SFMC in the near future. Ensure that you migrate any existing Content Areas to Content Builder as soon as possible.'
        );
        // !dont activate `await File.initPrettier('html');` as we only want to retrieve for migration and formatting might mess with the outcome
        return super.retrieveSOAP(retrieveDir);
    }
    /**
     * manages post retrieve steps
     *
     * @param {TYPE.MetadataTypeItem} metadata a single item
     * @returns {TYPE.MetadataTypeItem} parsed item
     */
    static postRetrieveTasks(metadata) {
        return this.parseMetadata(metadata);
    }
    /**
     * parses retrieved Metadata before saving
     *
     * @param {TYPE.MetadataTypeItem} metadata a single item
     * @returns {TYPE.MetadataTypeItem} parsed item
     */
    static parseMetadata(metadata) {
        // folder
        try {
            metadata.r__folder_Path = cache.searchForField(
                'folder',
                metadata.CategoryID,
                'ID',
                'Path'
            );
        } catch (ex) {
            Util.logger.debug(`Classic Content Area '${metadata.CustomerKey}': ${ex.message}`);
            // classic content blocks that reside in the main folder are
            // saved with CategoryID=0, instead of to the actual ID of
            // their parent root folder.
            metadata.r__folder_Path = 'my contents';
        }
        delete metadata.CategoryID;

        // extract code
        // use 'amp' to avoid weird reformatting by prettier when users make changes
        const codeArr = [
            {
                subFolder: null,
                fileName: metadata.CustomerKey,
                fileExt: 'amp',
                content: metadata.Content,
            },
        ];
        delete metadata.Content;

        return { json: metadata, codeArr: codeArr, subFolder: null };
    }

    /**
     * prepares an email for deployment
     *
     * @param {object} metadata a single script activity definition
     * @param {string} dir directory of deploy files
     * @returns {Promise} Promise
     */
    static async preDeployTasks(metadata, dir) {
        // read code
        const code = await File.readFile(
            dir + '/' + this.definition.type,
            metadata.CustomerKey + '.' + this.definition.type + '-meta',
            'amp'
        );
        metadata.Content = code;
        return metadata;
    }
    /**
     * takes one classic email and converts it into
     * a content builder based email
     *
     * @param {object} classicMetadata classic email
     * @param {object} nameSafe ensure names are only used once (Content Builder requirement)
     * @returns {object} asset-message-htmlemail
     */
    static convert(classicMetadata, nameSafe) {
        if (!classicMetadata.Content) {
            throw new Error(
                `No Code found for Classic Content Area: ${classicMetadata.CustomerKey} - skipping`
            );
        }
        const metadata = {
            customerKey: classicMetadata.ObjectID.toUpperCase(), // some CAs used Key=ID, others Key=uppercased ObjectID
            contentType: 'text/html',
            assetType: {
                // if this needs changes also update overrideType in ClassicMigration
                name: 'codesnippetblock',
                displayName: 'Code Snippet Block',
            },
            name: classicMetadata.Name || classicMetadata.ID,
            // description: '',
            status: {
                name: 'Draft',
            },
            r__folder_Path: 'Content Builder/' + classicMetadata.r__folder_Path, // automatically use /my contents/ subfolder
            modelVersion: 2,
        };
        if (Util.logger.level === 'debug') {
            metadata.r__contentArea_CustomerKey = classicMetadata.CustomerKey;
            metadata.r__contentArea_ID = classicMetadata.ID;
            metadata.r__contentArea_folder_Path = classicMetadata.r__folder_Path;
            metadata.r__contentArea_ObjectID = classicMetadata.ObjectID;
            metadata.r__contentArea_Layout = classicMetadata.Layout; // 'RawText', 'HTMLWrapped', 'SMS'
        }

        // Asset names within a category and asset type must be unique
        if (!nameSafe[metadata.name]) {
            // first time this name was used: dont change it
            nameSafe[metadata.name] = 1;
        } else {
            // we've found this name before: add the index to it
            nameSafe[metadata.name]++;
            metadata.name += '-' + nameSafe[metadata.name];
        }

        // Code
        metadata.content = classicMetadata.Content;

        return {
            metadata,
            key: metadata.customerKey,
            mapping: {
                key: classicMetadata.CustomerKey,
                pathName:
                    classicMetadata.r__folder_Path +
                    '/' +
                    (classicMetadata.Name || classicMetadata.ID), // ensure to use the original here
                id: classicMetadata.ID,
            },
        };
    }
}

// Assign definition to static attributes
ContentArea.definition = require('../MetadataTypeDefinitions').contentArea;

module.exports = ContentArea;
