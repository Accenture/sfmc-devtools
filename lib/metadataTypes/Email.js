'use strict';

const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const File = require('../util/file');

/**
 * Email MetadataType
 * @augments MetadataType
 */
class Email extends MetadataType {
    /**
     * Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     * @param {String} retrieveDir Directory where retrieved metadata directory will be saved
     * @returns {Promise<Object>} Promise of metadata
     */
    static retrieve(retrieveDir) {
        Util.logger.warn(
            'Classic E-Mails are deprecated and will be discontinued by SFMC in the near future. Ensure that you migrate any existing E-Mails to Content Builder as soon as possible.'
        );
        // !dont activate `await File.initPrettier('html');` as we only want to retrieve for migration and formatting might mess with the outcome
        return super.retrieveSOAPgeneric(retrieveDir, null);
    }
    /**
     * manages post retrieve steps
     * @param {Object} metadata a single query
     * @returns {Object[]} Array with one metadata object and one query string
     */
    static postRetrieveTasks(metadata) {
        return this.parseMetadata(metadata);
    }
    /**
     * parses retrieved Metadata before saving
     * @param {Object} metadata a single query activity definition
     * @returns {Array} Array with one metadata object and one sql string
     */
    static parseMetadata(metadata) {
        // folder
        try {
            metadata.r__folder_Path = Util.getFromCache(
                this.cache,
                'folder',
                metadata.CategoryID,
                'ID',
                'Path'
            );
            delete metadata.CategoryID;
        } catch (ex) {
            Util.logger.warn(
                `Classic E-Mail '${metadata.Name}'/'${metadata.CustomerKey}': ${ex.message}`
            );
        }

        // extract code
        // use 'amp' to avoid weird reformatting by prettier when users make changes
        const codeArr = [
            {
                subFolder: null,
                fileName: metadata.CustomerKey,
                fileExt: 'amp',
                content: metadata.HTMLBody,
            },
        ];
        delete metadata.HTMLBody;

        return { json: metadata, codeArr: codeArr, subFolder: null };
    }

    /**
     * prepares an email for deployment
     * @param {Object} metadata a single script activity definition
     * @param {String} dir directory of deploy files
     * @returns {Promise} Promise
     */
    static async preDeployTasks(metadata, dir) {
        // read code
        const code = await File.readFile(
            dir + '/' + this.definition.type,
            metadata.CustomerKey + '.' + this.definition.type + '-meta',
            'amp'
        );
        metadata.HTMLBody = code;
        return metadata;
    }

    /**
     * takes one classic email and converts it into
     * a content builder based email
     * @param {Object} classicMetadata classic email
     * @param {Object} nameSafe ensure names are only used once (Content Builder requirement)
     * @returns {Object} asset-message-htmlemail
     */
    static convert(classicMetadata, nameSafe) {
        if (!classicMetadata.HTMLBody) {
            throw new Error(
                `No Code found for Classic E-Mail: ${classicMetadata.CustomerKey} - skipping`
            );
        }
        let availableViews;
        let assetType;
        if (classicMetadata.IsHTMLPaste === 'true') {
            // assetType.name: htmlemail
            availableViews = [
                'subjectline',
                'preheader',
                'html',
                'text',
                'viewAsAWebPage',
                'subscriptioncenter',
                'forwardHTML',
                'forwardText',
            ];
            assetType = {
                // if this needs changes also update overrideType in ClassicMigration
                name: 'htmlemail',
                displayName: 'HTML Email',
            };
        } else if (classicMetadata.IsHTMLPaste === 'false') {
            // assetType.name: textonlyemail
            availableViews = [
                'subjectline',
                'preheader',
                'text',
                'subscriptioncenter',
                'forwardText',
            ];
            assetType = {
                name: 'textonlyemail',
                displayName: 'Text Only Email',
            };
        }
        const metadata = {
            customerKey: classicMetadata.ID.toUpperCase(), // it seems the create-API throws errors if we re-use the classic CustomerKey
            contentType: 'application/vnd.etmc.email.Message; kind=paste',
            assetType,
            name: classicMetadata.Name || classicMetadata.ID,
            // description: '',
            status: {
                name: 'Draft',
            },
            r__folder_Path: 'Content Builder/' + classicMetadata.r__folder_Path, // automatically use /my emails/ subfolder
            views: {},
            availableViews,
            data: {
                email: {
                    options: {
                        characterEncoding: classicMetadata.CharacterSet,
                    },
                },
            },
            modelVersion: 2,
        };
        if (Util.logger.level === 'debug') {
            metadata.r__email_CustomerKey = classicMetadata.CustomerKey;
            metadata.r__email_ID = classicMetadata.ID;
            metadata.r__email_folder_Path = classicMetadata.r__folder_Path;
            metadata.r__email_ContentCheckStatus = classicMetadata.ContentCheckStatus; // 'Not Checked', 'Passed', 'Problems Detected'
        }
        const viewTemplate = {
            thumbnail: {},
            availableViews: [],
            data: {
                email: {
                    options: {
                        generateFrom: '',
                    },
                },
            },
            modelVersion: 2,
        };
        // create relevant views
        availableViews.forEach((element) => {
            metadata.views[element] = JSON.parse(JSON.stringify(viewTemplate));
        });

        // Subject
        if (availableViews.includes('subjectline')) {
            metadata.views.subjectline.contentType =
                'application/vnd.etmc.email.View; kind=subjectline';
            metadata.views.subjectline.content = classicMetadata.Subject || '';
        }

        // Preheader
        if (availableViews.includes('preheader')) {
            metadata.views.preheader.contentType =
                'application/vnd.etmc.email.View; kind=preheader';
            metadata.views.preheader.content = classicMetadata.PreHeader;
        }
        // Code
        if (availableViews.includes('html')) {
            metadata.views.html.content = classicMetadata.HTMLBody;
        }
        // Text (htmlemail only)
        if (availableViews.includes('text')) {
            if (classicMetadata.IsHTMLPaste === 'true') {
                metadata.views.text.content = classicMetadata.TextBody;
                if (!classicMetadata.TextBody) {
                    // ensure text version is auto-generated if not set in classic
                    metadata.views.text.data.email.options.generateFrom = 'html';
                    metadata.views.text.generateFrom = 'html';
                }
            } else if (classicMetadata.IsHTMLPaste === 'false') {
                metadata.views.text.content = classicMetadata.HTMLBody;
            }
        }

        // Asset names within a category and asset type must be unique
        if (!nameSafe[metadata.name]) {
            // first time this name was used: dont change it
            nameSafe[metadata.name] = 1;
        } else {
            // we've found this name before: add the index to it
            nameSafe[metadata.name]++;
            metadata.name += '-' + nameSafe[metadata.name];
            Util.logger.debug(
                'Email Conversion: added index to make name unique: ' + metadata.name
            );
        }

        return {
            metadata,
            key: metadata.customerKey,
            mapping: null,
        };
    }
}

// Assign definition to static attributes
Email.definition = require('../MetadataTypeDefinitions').email;

module.exports = Email;
