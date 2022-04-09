'use strict';

const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const File = require('../util/file');
const bluebird = require('bluebird');
const cliProgress = require('cli-progress');
const Mustache = require('mustache');
const cache = require('../util/cache');

/**
 * @typedef {Object.<string, any>} AssetItem
 *
 * @typedef {Object.<string, AssetItem>} AssetMap
 *
 * @typedef {'archive'|'asset'|'audio'|'block'|'code'|'document'|'image'|'message'|'other'|'rawimage'|'template'|'textfile'|'video'} AssetSubType
 *
 * @typedef {Object} CodeExtractItem
 * @property {AssetItem} json metadata of one item w/o code
 * @property {MetadataType.CodeExtract[]} codeArr list of code snippets in this item
 * @property {string[]} subFolder mostly set to null, otherwise list of subfolders
 */

/**
 * FileTransfer MetadataType
 * @augments MetadataType
 */
class Asset extends MetadataType {
    /**
     * Retrieves Metadata of Asset
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void} _ -
     * @param {void} __ -
     * @param {AssetSubType} [selectedSubType] optionally limit to a single subtype
     * @returns {Promise<{metadata:AssetMap,type:string}>} Promise
     */
    static async retrieve(retrieveDir, _, __, selectedSubType) {
        const items = [];
        const subTypes = selectedSubType ? [selectedSubType] : this._getSubTypes();
        await File.initPrettier();
        // loop through subtypes and return results of each subType for caching (saving is handled per subtype)
        for (const subType of subTypes) {
            // each subtype contains multiple different specific types (images contains jpg and png for example)
            // we use await here to limit the risk of too many concurrent api requests at time
            items.push(
                ...(await this.requestSubType(
                    subType,
                    this.definition.extendedSubTypes[subType],
                    retrieveDir
                ))
            );
        }
        const metadata = this.parseResponseBody({ items: items });
        if (retrieveDir) {
            Util.logger.info(
                `Downloaded: ${this.definition.type} (${Object.keys(metadata).length})`
            );
        }
        return { metadata: metadata, type: this.definition.type };
    }

    /**
     * Retrieves asset metadata for caching
     * @param {void} _ -
     * @param {string} [selectedSubType] optionally limit to a single subtype
     * @returns {Promise<{metadata:AssetMap,type:string}>} Promise
     */
    static retrieveForCache(_, selectedSubType) {
        return this.retrieve(null, null, null, selectedSubType);
    }

    /**
     * Retrieves asset metadata for templating
     * @param {string} templateDir Directory where retrieved metadata directory will be saved
     * @param {string} name name of the metadata file
     * @param {Util.TemplateMap} templateVariables variables to be replaced in the metadata
     * @param {AssetSubType} [selectedSubType] optionally limit to a single subtype
     * @returns {Promise<{metadata:AssetItem,type:string}>} Promise
     */
    static async retrieveAsTemplate(templateDir, name, templateVariables, selectedSubType) {
        const items = [];
        const subTypes = selectedSubType ? [selectedSubType] : this._getSubTypes();
        await File.initPrettier();
        // loop through subtypes and return results of each subType for caching (saving is handled per subtype)
        for (const subType of subTypes) {
            // each subtype contains multiple different specific types (images contains jpg and png for example)
            // we use await here to limit the risk of too many concurrent api requests at time
            items.push(
                ...(await this.requestSubType(
                    subType,
                    this.definition.extendedSubTypes[subType],
                    templateDir,
                    name,
                    templateVariables
                ))
            );
        }
        const metadata = this.parseResponseBody({ items: items });
        if (!Object.keys(metadata).length) {
            Util.logger.error(`${this.definition.type} '${name}' not found on server.`);
        }
        Util.logger.info(`Downloaded: ${this.definition.type} (${Object.keys(metadata).length})`);

        return { metadata: Object.values(metadata)[0], type: this.definition.type };
    }
    /**
     * helper for retrieve + retrieveAsTemplate
     * @private
     * @returns {AssetSubType[]} subtype array
     */
    static _getSubTypes() {
        const selectedSubTypeArr = this.properties.metaDataTypes.retrieve.filter((type) =>
            type.startsWith('asset-')
        );
        if (
            this.properties.metaDataTypes.retrieve.includes('asset') ||
            !selectedSubTypeArr.length
        ) {
            // if "asset" is found in config assume to download the default subtypes only
            return this.definition.typeRetrieveByDefault;
        } else {
            return selectedSubTypeArr.map((type) => type.replace('asset-', ''));
        }
    }

    /**
     * Creates a single asset
     * @param {AssetItem} metadata a single asset
     * @returns {Promise} Promise
     */
    static create(metadata) {
        const uri = '/asset/v1/content/assets/';
        return super.createREST(metadata, uri);
    }

    /**
     * Updates a single asset
     * @param {AssetItem} metadata a single asset
     * @returns {Promise} Promise
     */
    static update(metadata) {
        const uri = '/asset/v1/content/assets/' + metadata.id;
        return super.updateREST(metadata, uri);
    }
    /**
     * Retrieves Metadata of a specific asset type
     * @param {AssetSubType} subType group of similar assets to put in a folder (ie. images)
     * @param {AssetSubType[]} subTypeArray list of all asset types within this subtype
     * @param {string} [retrieveDir] target directory for saving assets
     * @param {string} [templateName] name of the metadata file
     * @param {Util.TemplateMap} [templateVariables] variables to be replaced in the metadata
     * @returns {Promise} Promise
     */
    static async requestSubType(
        subType,
        subTypeArray,
        retrieveDir,
        templateName,
        templateVariables
    ) {
        if (retrieveDir) {
            Util.logger.info(`- Retrieving Subtype: ${subType}`);
        } else {
            Util.logger.info(`- Caching Subtype: ${subType}`);
        }
        const subtypeIds = subTypeArray?.map(
            (subTypeItemName) => Asset.definition.typeMapping[subTypeItemName]
        );
        const uri = 'asset/v1/content/assets/query';
        const payload = {
            page: {
                page: 1,
                pageSize: 50,
            },
            query: null,
            fields: [],
        };

        if (templateName) {
            payload.query = {
                leftOperand: {
                    property: 'assetType.id',
                    simpleOperator: 'in',
                    value: subtypeIds,
                },
                logicalOperator: 'AND',
                rightOperand: {
                    property: 'name',
                    simpleOperator: 'equal',
                    value: templateName,
                },
            };
        } else {
            payload.query = {
                property: 'assetType.id',
                simpleOperator: 'in',
                value: subtypeIds,
            };
            payload.sort = [{ property: 'id', direction: 'ASC' }];
        }
        // for caching we do not need these fields
        if (retrieveDir) {
            payload.fields = [
                'fileProperties',
                'status',
                'category',
                'createdDate',
                'createdBy',
                'modifiedDate',
                'modifiedBy',
                'availableViews',
                'data',
                'tags',
            ];
        }
        let moreResults = false;
        let lastPage = 0;
        let items = [];
        do {
            payload.page.page = lastPage + 1;
            const response = await this.client.rest.post(uri, payload);
            if (response?.items?.length) {
                // sometimes the api will return a payload without items
                // --> ensure we only add proper items-arrays here
                items = items.concat(response.items);
            }
            // check if any more records
            if (response?.message?.includes('all shards failed')) {
                // When running certain filters, there is a limit of 10k on ElastiCache.
                // Since we sort by ID, we can get the last ID then run new requests from there
                payload.query = {
                    leftOperand: {
                        property: 'assetType.id',
                        simpleOperator: 'in',
                        value: subtypeIds,
                    },
                    logicalOperator: 'AND',
                    rightOperand: {
                        property: 'id',
                        simpleOperator: 'greaterThan',
                        value: items[items.length - 1].id,
                    },
                };
                lastPage = 0;
                moreResults = true;
            } else if (response.page * response.pageSize < response.count) {
                moreResults = true;
                lastPage = Number(response.page);
            } else {
                moreResults = false;
            }
        } while (moreResults);

        // only when we save results do we need the complete metadata or files. caching can skip these
        if (retrieveDir && items.length > 0) {
            // disable CLI logs other than error while retrieving subtype
            const loggerLevelBak = Util.logger.level;
            if (loggerLevelBak !== 'error') {
                // disable logging to cli other than Errors
                Util.setLoggingLevel({ silent: true });
            }

            // we have to wait on execution or it potentially causes memory reference issues when changing between BUs
            await this.requestAndSaveExtended(items, subType, retrieveDir, templateVariables);
            Util.logger.debug(`Downloaded asset-${subType}: ${items.length}`);

            // re-enable CLI logs
            if (loggerLevelBak !== 'error') {
                // reset logging level
                let obj;
                switch (loggerLevelBak) {
                    case 'info':
                        obj = {};
                        break;
                    case 'verbose':
                        obj = { verbose: true };
                        break;
                    case 'debug':
                        obj = { debug: true };
                        break;
                    case 'error':
                        obj = { silent: true };
                }
                Util.setLoggingLevel(obj);
            }
        } else if (!items.length) {
            Util.logger.info(`  Downloaded asset-${subType}: ${items.length}`);
        }
        return items;
    }
    /**
     * Retrieves extended metadata (files or extended content) of asset
     * @param {Array} items array of items to retrieve
     * @param {AssetSubType} subType group of similar assets to put in a folder (ie. images)
     * @param {string} retrieveDir target directory for saving assets
     * @param {Util.TemplateMap} [templateVariables] variables to be replaced in the metadata
     * @returns {Promise} Promise
     */
    static async requestAndSaveExtended(items, subType, retrieveDir, templateVariables) {
        const extendedBar = new cliProgress.SingleBar(
            {
                format:
                    '                 Downloaded [{bar}] {percentage}% | {value}/{total} | asset-' +
                    subType,
            },
            cliProgress.Presets.shades_classic
        );

        const completed = [];
        // put in do loop to manage issues with connection timeout
        do {
            // use promise execution limiting to avoid rate limits on api, but speed up execution
            // start the progress bar with a total value of 200 and start value of 0
            extendedBar.start(items.length - completed.length, 0);
            try {
                const promiseMap = await bluebird.map(
                    items,
                    async (item) => {
                        const metadata = {};
                        // this is a file so extended is at another endpoint
                        if (item?.fileProperties?.extension && !completed.includes(item.id)) {
                            metadata[item.customerKey] = item;
                            if (templateVariables) {
                                // do this here already because otherwise the extended file could be saved with wrong fileName
                                const warningMsg =
                                    'Ensure that Code that might be loading this via ContentBlockByKey is updated with the new key before deployment.';
                                this.overrideKeyWithName(item, warningMsg);
                            }
                            // retrieving the extended file does not need to be awaited
                            await this._retrieveExtendedFile(item, subType, retrieveDir);
                        }
                        // this is a complex type which stores data in the asset itself
                        else if (!completed.includes(item.id)) {
                            const extendedItem = await this.client.rest.get(
                                'asset/v1/content/assets/' + item.id
                            );
                            metadata[item.customerKey] = extendedItem;
                        }
                        completed.push(item.id);
                        await this.saveResults(
                            metadata,
                            retrieveDir,
                            'asset-' + subType,
                            templateVariables
                        );
                        // update the current value in your application..
                        extendedBar.increment();
                    },
                    { concurrency: 5 }
                );

                // stop the progress bar
                extendedBar.stop();

                return promiseMap;
            } catch (ex) {
                extendedBar.stop();
                // timeouts should be retried, others can be retried
                if (ex.code !== 'ETIMEDOUT') {
                    throw ex;
                }
            }
        } while (completed.length === items.length);
    }
    /**
     * Some metadata types store their actual content as a separate file, e.g. images
     * This method retrieves these and saves them alongside the metadata json
     * @param {AssetItem} metadata a single asset
     * @param {AssetSubType} subType group of similar assets to put in a folder (ie. images)
     * @param {string} retrieveDir target directory for saving assets
     * @returns {Promise<void>} -
     */
    static async _retrieveExtendedFile(metadata, subType, retrieveDir) {
        const file = await this.client.rest.get('asset/v1/content/assets/' + metadata.id + '/file');

        // to handle uploaded files that bear the same name, SFMC engineers decided to add a number after the fileName
        // however, their solution was not following standards: fileName="header.png (4) " and then extension="png (4) "
        const fileExt = metadata.fileProperties.extension.split(' ')[0];

        File.writeToFile(
            [retrieveDir, this.definition.type, subType],
            metadata.customerKey,
            fileExt,
            file,
            'base64'
        );
    }
    /**
     * helper for this.preDeployTasks()
     * Some metadata types store their actual content as a separate file, e.g. images
     * This method reads these from the local FS stores them in the metadata object allowing to deploy it
     * @param {AssetItem} metadata a single asset
     * @param {AssetSubType} subType group of similar assets to put in a folder (ie. images)
     * @param {string} deployDir directory of deploy files
     * @returns {Promise<void>} -
     */
    static async _readExtendedFileFromFS(metadata, subType, deployDir) {
        if (metadata.fileProperties && metadata.fileProperties.extension) {
            // to handle uploaded files that bear the same name, SFMC engineers decided to add a number after the fileName
            // however, their solution was not following standards: fileName="header.png (4) " and then extension="png (4) "
            const fileExt = metadata.fileProperties.extension.split(' ')[0];

            metadata.file = await File.readFile(
                [deployDir, this.definition.type, subType],
                metadata.customerKey,
                fileExt,
                'base64'
            );
        }
    }
    /**
     * manages post retrieve steps
     * @param {AssetItem} metadata a single asset
     * @param {string} [_] unused
     * @param {Boolean} isTemplating signals that we are retrieving templates
     * @returns {CodeExtractItem} metadata
     */
    static postRetrieveTasks(metadata, _, isTemplating) {
        // if retrieving template, replace the name with customer key if that wasn't already the case
        if (isTemplating) {
            const warningMsg =
                'Ensure that Code that might be loading this via ContentBlockByKey is updated with the new key before deployment.';
            this.overrideKeyWithName(metadata, warningMsg);
        }
        return this.parseMetadata(metadata);
    }

    /**
     * prepares an asset definition for deployment
     * @param {AssetItem} metadata a single asset
     * @param {string} deployDir directory of deploy files
     * @returns {Promise<AssetItem>} Promise
     */
    static async preDeployTasks(metadata, deployDir) {
        // additonalattributes fail where the value is "" so we need to remove them from deploy
        if (metadata?.data?.email?.attributes?.length > 0) {
            metadata.data.email.attributes = metadata.data.email.attributes.filter(
                (attr) => attr.value
            );
        }

        // folder
        metadata.category = {
            id: cache.searchForField('folder', metadata.r__folder_Path, 'Path', 'ID'),
        };
        delete metadata.r__folder_Path;

        // restore asset type id which is needed for deploy
        metadata.assetType.id = this.definition.typeMapping[metadata.assetType.name];

        // define asset's subtype
        const subType = this.getSubtype(metadata);

        // #1 get text extracts back into the JSON
        await this._mergeCode(metadata, deployDir, subType);

        // #2 get file from local disk and insert as base64
        await this._readExtendedFileFromFS(metadata, subType, deployDir);

        return metadata;
    }
    /**
     * determines the subtype of the current asset
     * @param {AssetItem} metadata a single asset
     * @returns {AssetSubType} subtype
     */
    static getSubtype(metadata) {
        for (const sub in this.definition.extendedSubTypes) {
            if (this.definition.extendedSubTypes[sub].includes(metadata.assetType.name)) {
                return sub;
            }
        }
    }

    /**
     * helper for buildDefinition
     * handles extracted code if any are found for complex types
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string} targetDir Directory where built definitions will be saved
     * @param {AssetItem} metadata main JSON file that was read from file system
     * @param {Util.TemplateMap} variables variables to be replaced in the metadata
     * @param {string} templateName name of the template to be built
     * @returns {Promise<void>} Promise
     */
    static async buildDefinitionForExtracts(
        templateDir,
        targetDir,
        metadata,
        variables,
        templateName
    ) {
        // clone metadata to ensure the main file is not modified by what we do in here
        metadata = JSON.parse(JSON.stringify(metadata));

        // #1 text extracts
        // define asset's subtype
        const subType = this.getSubtype(metadata);
        // get HTML from filesystem
        const fileList = await this._mergeCode(metadata, templateDir, subType, templateName);
        // replace template variables with their values
        for (const extractedFile of fileList) {
            try {
                extractedFile.content = Mustache.render(extractedFile.content, variables);
            } catch (ex) {
                throw new Error(
                    `${this.definition.type}:: Error applying template variables on ${
                        metadata[this.definition.keyField]
                    }: ${extractedFile.fileName}.${extractedFile.fileExt}.`
                );
            }
        }

        // #2 binary extracts
        if (metadata?.fileProperties?.extension) {
            // to handle uploaded files that bear the same name, SFMC engineers decided to add a number after the fileName
            // however, their solution was not following standards: fileName="header.png (4) " and then extension="png (4) "
            const fileExt = metadata.fileProperties.extension.split(' ')[0];

            const filecontent = await File.readFile(
                [templateDir, this.definition.type, subType],
                metadata.customerKey,
                fileExt,
                'base64'
            );
            fileList.push({
                subFolder: [this.definition.type, subType],
                fileName: metadata.customerKey,
                fileExt: fileExt,
                content: filecontent,
                encoding: 'base64',
            });
        }

        // write to file (#1 + #2)
        const targetDirArr = Array.isArray(targetDir) ? targetDir : [targetDir];
        for (const targetDir of targetDirArr) {
            for (const extractedFile of fileList) {
                File.writeToFile(
                    [targetDir, ...extractedFile.subFolder],
                    extractedFile.fileName,
                    extractedFile.fileExt,
                    extractedFile.content,
                    extractedFile.encoding || null
                );
            }
        }
    }

    /**
     * parses retrieved Metadata before saving
     * @param {AssetItem} metadata a single asset definition
     * @returns {CodeExtractItem} parsed metadata definition
     */
    static parseMetadata(metadata) {
        // folder
        try {
            metadata.r__folder_Path = cache.searchForField(
                'folder',
                metadata.category.id,
                'ID',
                'Path'
            );
            delete metadata.category;
        } catch (ex) {
            // ! if we don't catch this error here we end up saving the actual asset but not its corresponding JSON
            Util.logger.debug(ex.message);
            Util.logger.warn(
                `Could not find folder with ID ${metadata.category.id} for '${metadata.name}' (${metadata.customerKey})`
            );
        }
        // extract HTML for selected subtypes and convert payload for easier processing in MetadataType.saveResults()
        metadata = this._extractCode(metadata);
        return metadata;
    }
    /**
     * helper for this.preDeployTasks() that loads extracted code content back into JSON
     * @param {AssetItem} metadata a single asset definition
     * @param {string} deployDir directory of deploy files
     * @param {AssetSubType} subType asset-subtype name
     * @param {string} [templateName] name of the template used to built defintion (prior applying templating)
     * @returns {Promise<MetadataType.CodeExtract[]>} fileList for templating (disregarded during deployment)
     */
    static async _mergeCode(metadata, deployDir, subType, templateName) {
        const subtypeExtension = `.${this.definition.type}-${subType}-meta`;
        const fileList = [];
        let subDirArr;
        let readDirArr;

        switch (metadata.assetType.name) {
            case 'templatebasedemail': // message
            case 'htmlemail': // message
                // this complex type always creates its own subdir per asset
                subDirArr = [this.definition.type, subType];
                readDirArr = [
                    deployDir,
                    ...subDirArr,
                    templateName ? templateName : metadata.customerKey,
                ];

                // metadata.views.html.content (mandatory)
                if (
                    File.existsSync(
                        File.normalizePath([...readDirArr, `index${subtypeExtension}.html`])
                    )
                ) {
                    // the main content can be empty (=not set up yet) hence check if we did extract sth or else readFile() will print error msgs
                    if (metadata.views.html) {
                        metadata.views.html.content = await File.readFile(
                            readDirArr,
                            'index' + subtypeExtension,
                            'html'
                        );

                        if (templateName) {
                            // to use this method in templating, store a copy of the info in fileList
                            fileList.push({
                                subFolder: [...subDirArr, metadata.customerKey],
                                fileName: 'index' + subtypeExtension,
                                fileExt: 'html',
                                content: metadata.views.html.content,
                            });
                        }
                    }
                }

                // metadata.views.html.slots.<>.blocks.<>.content (optional)
                if (metadata?.views?.html?.slots) {
                    await this._mergeCode_slots(
                        'views.html.slots',
                        metadata.views.html.slots,
                        readDirArr,
                        subtypeExtension,
                        subDirArr,
                        fileList,
                        metadata.customerKey,
                        templateName
                    );
                }
                break;
            case 'textonlyemail': // message
                // metadata.views.text.content
                subDirArr = [this.definition.type, subType];
                readDirArr = [deployDir, ...subDirArr];
                if (
                    File.existsSync(
                        File.normalizePath([
                            ...readDirArr,
                            `${
                                templateName ? templateName : metadata.customerKey // TODO check why this could be templateName
                            }${subtypeExtension}.html`,
                        ])
                    )
                ) {
                    // the main content can be empty (=not set up yet) hence check if we did extract sth or else readFile() will print error msgs
                    metadata.views.text.content = await File.readFile(
                        readDirArr,
                        (templateName ? templateName : metadata.customerKey) + subtypeExtension,
                        'html'
                    );

                    if (templateName) {
                        // to use this method in templating, store a copy of the info in fileList
                        fileList.push({
                            subFolder: subDirArr,
                            fileName: metadata.customerKey + subtypeExtension,
                            fileExt: 'html',
                            content: metadata.views.text.content,
                        });
                    }
                }
                break;
            case 'webpage': // asset
                // this complex type always creates its own subdir per asset
                subDirArr = [this.definition.type, subType];
                readDirArr = [
                    deployDir,
                    ...subDirArr,
                    templateName ? templateName : metadata.customerKey,
                ];

                // metadata.views.html.slots.<>.blocks.<>.content (optional) (pre & post 20222)
                if (metadata?.views?.html?.slots) {
                    await this._mergeCode_slots(
                        'views.html.slots',
                        metadata.views.html.slots,
                        readDirArr,
                        subtypeExtension,
                        subDirArr,
                        fileList,
                        metadata.customerKey,
                        templateName
                    );
                }

                // +++ old webpages / pre-2022 +++
                // metadata.views.html.content (mandatory)
                if (
                    File.existsSync(
                        File.normalizePath([
                            ...readDirArr,
                            `views.html.content${subtypeExtension}.html`,
                        ])
                    )
                ) {
                    // the main content can be empty (=not set up yet) hence check if we did extract sth or else readFile() will print error msgs
                    if (metadata.views?.html) {
                        metadata.views.html.content = await File.readFile(
                            readDirArr,
                            'index' + subtypeExtension,
                            'html'
                        );

                        if (templateName) {
                            // to use this method in templating, store a copy of the info in fileList
                            fileList.push({
                                subFolder: [...subDirArr, metadata.customerKey],
                                fileName: 'views.html.content' + subtypeExtension,
                                fileExt: 'html',
                                content: metadata.views.html.content,
                            });
                        }
                    }
                }

                // +++ new webpages / 2022+ +++
                // metadata.content
                if (
                    File.existsSync(
                        File.normalizePath([...readDirArr, `content${subtypeExtension}.html`])
                    )
                ) {
                    // the main content can be empty (=not set up yet) hence check if we did extract sth or else readFile() will print error msgs
                    metadata.content = await File.readFile(
                        readDirArr,
                        'content' + subtypeExtension,
                        'html'
                    );

                    if (templateName) {
                        // to use this method in templating, store a copy of the info in fileList
                        fileList.push({
                            subFolder: [...subDirArr, metadata.customerKey],
                            fileName: 'content' + subtypeExtension,
                            fileExt: 'html',
                            content: metadata.views.html.content,
                        });
                    }
                }

                break;
            case 'buttonblock': // block - Button Block
            case 'freeformblock': // block
            case 'htmlblock': // block
            case 'icemailformblock': // block - Interactive Content Email Form
            case 'imageblock': // block - Image Block
            case 'textblock': // block
            case 'smartcaptureblock': // other
            case 'codesnippetblock': // other
                // metadata.content
                subDirArr = [this.definition.type, subType];
                readDirArr = [deployDir, ...subDirArr];
                if (
                    File.existsSync(
                        File.normalizePath([
                            ...readDirArr,
                            `${
                                templateName ? templateName : metadata.customerKey
                            }${subtypeExtension}.html`,
                        ])
                    )
                ) {
                    // the main content can be empty (=not set up yet) hence check if we did extract sth or else readFile() will print error msgs
                    metadata.content = await File.readFile(
                        readDirArr,
                        (templateName ? templateName : metadata.customerKey) + subtypeExtension,
                        'html'
                    );
                    if (templateName) {
                        // to use this method in templating, store a copy of the info in fileList
                        fileList.push({
                            subFolder: subDirArr,
                            fileName: metadata.customerKey + subtypeExtension,
                            fileExt: 'html',
                            content: metadata.content,
                        });
                    }
                }
                break;
        }
        return fileList;
    }
    /**
     * helper for this.preDeployTasks() that loads extracted code content back into JSON
     * @param {string} prefix usually the customerkey
     * @param {Object} metadataSlots metadata.views.html.slots or deeper slots.<>.blocks.<>.slots
     * @param {string[]} readDirArr directory of deploy files
     * @param {string} subtypeExtension asset-subtype name ending on -meta
     * @param {string[]} subDirArr directory of files w/o leading deploy dir
     * @param {Object[]} fileList directory of files w/o leading deploy dir
     * @param {string} customerKey external key of template (could have been changed if used during templating)
     * @param {string} [templateName] name of the template used to built defintion (prior applying templating)
     * @returns {Promise<void>} -
     */
    static async _mergeCode_slots(
        prefix,
        metadataSlots,
        readDirArr,
        subtypeExtension,
        subDirArr,
        fileList,
        customerKey,
        templateName
    ) {
        for (const slot in metadataSlots) {
            if (Object.prototype.hasOwnProperty.call(metadataSlots, slot)) {
                const slotObj = metadataSlots[slot];
                // found slot
                if (slotObj.blocks) {
                    for (const block in slotObj.blocks) {
                        if (Object.prototype.hasOwnProperty.call(slotObj.blocks, block)) {
                            const fileName = `${prefix}.[${slot}-${block}]${subtypeExtension}`;
                            if (
                                File.existsSync(
                                    File.normalizePath([
                                        ...readDirArr,
                                        'blocks',
                                        `${fileName}.html`,
                                    ])
                                )
                            ) {
                                // the main content can be empty (=not set up yet) hence check if we did extract sth or else readFile() will print error msgs
                                // if an extracted block was found, save it back into JSON
                                slotObj.blocks[block].content = await File.readFile(
                                    [...readDirArr, 'blocks'],
                                    fileName,
                                    'html'
                                );
                                if (templateName) {
                                    // to use this method in templating, store a copy of the info in fileList
                                    fileList.push({
                                        subFolder: [...subDirArr, customerKey, 'blocks'],
                                        fileName: fileName,
                                        fileExt: 'html',
                                        content: slotObj.blocks[block].content,
                                    });
                                }
                            }
                            if (slotObj.blocks[block].slots) {
                                // * recursion: each block can have slots of its own
                                await this._mergeCode_slots(
                                    `${prefix}.[${slot}-${block}]`,
                                    slotObj.blocks[block].slots,
                                    readDirArr,
                                    subtypeExtension,
                                    subDirArr,
                                    fileList,
                                    customerKey,
                                    templateName
                                );
                            }
                        }
                    }
                }
            }
        }
    }
    /**
     * helper for this.parseMetadata() that finds code content in JSON and extracts it
     * to allow saving that separately and formatted
     * @param {AssetItem} metadata a single asset definition
     * @returns {CodeExtractItem} { json: metadata, codeArr: object[], subFolder: string[] }
     */
    static _extractCode(metadata) {
        const codeArr = [];
        switch (metadata.assetType.name) {
            case 'templatebasedemail': // message
            case 'htmlemail': // message
                // metadata.views.html.content (mandatory)
                if (metadata.views?.html?.content?.length) {
                    codeArr.push({
                        subFolder: null,
                        fileName: 'index',
                        fileExt: 'html',
                        content: metadata.views.html.content,
                    });
                    delete metadata.views.html.content;
                }

                // metadata.views.html.slots.<>.blocks.<>.content (optional)
                if (metadata.views?.html?.slots) {
                    this._extractCode_slots('views.html.slots', metadata.views.html.slots, codeArr);
                }

                return { json: metadata, codeArr: codeArr, subFolder: [metadata.customerKey] };
            case 'textonlyemail': // message
                // metadata.views.text.content
                if (metadata.views?.text?.content?.length) {
                    codeArr.push({
                        subFolder: null,
                        fileName: metadata.customerKey,
                        fileExt: 'html',
                        content: metadata.views.text.content,
                    });
                    delete metadata.views.text.content;
                }
                return { json: metadata, codeArr: codeArr, subFolder: null };
            case 'webpage': // asset
                // metadata.views.html.content (pre & post 20222)
                if (metadata.views?.html?.content?.length) {
                    codeArr.push({
                        subFolder: null,
                        fileName: 'views.html.content',
                        fileExt: 'html',
                        content: metadata.views.html.content,
                    });
                    delete metadata.views.html.content;
                }

                // +++ old webpages / pre-2022 +++
                // metadata.views.html.slots.<>.blocks.<>.content (optional)
                if (metadata.views?.html?.slots) {
                    this._extractCode_slots('views.html.slots', metadata.views.html.slots, codeArr);
                }

                // +++ new webpages / 2022+ +++
                // metadata.content
                if (metadata?.content?.length) {
                    codeArr.push({
                        subFolder: null,
                        fileName: 'content',
                        fileExt: 'html',
                        content: metadata.content,
                    });
                    delete metadata.content;
                }
                return { json: metadata, codeArr: codeArr, subFolder: [metadata.customerKey] };
            case 'buttonblock': // block - Button Block
            case 'freeformblock': // block
            case 'htmlblock': // block
            case 'icemailformblock': // block - Interactive Content Email Form
            case 'imageblock': // block - Image Block
            case 'textblock': // block
            case 'smartcaptureblock': // other
            case 'codesnippetblock': // other
                // metadata.content
                if (metadata?.content?.length) {
                    codeArr.push({
                        subFolder: null,
                        fileName: metadata.customerKey,
                        fileExt: 'html',
                        content: metadata.content,
                    });
                    delete metadata.content;
                }
                return { json: metadata, codeArr: codeArr, subFolder: null };
            default:
                Util.logger.debug('unknown metadata.assetType.name: ' + metadata.assetType.name);
                return { json: metadata, codeArr: codeArr, subFolder: null };
        }
    }
    /**
     * @param {string} prefix usually the customerkey
     * @param {Object} metadataSlots metadata.views.html.slots or deeper slots.<>.blocks.<>.slots
     * @param {Object[]} codeArr to be extended array for extracted code
     * @returns {void}
     */
    static _extractCode_slots(prefix, metadataSlots, codeArr) {
        for (const slot in metadataSlots) {
            if (Object.prototype.hasOwnProperty.call(metadataSlots, slot)) {
                const slotObj = metadataSlots[slot];
                // found slot
                for (const block in slotObj.blocks) {
                    if (Object.prototype.hasOwnProperty.call(slotObj.blocks, block)) {
                        if (slotObj.blocks[block].content) {
                            // found content block
                            const code = slotObj.blocks[block].content;
                            codeArr.push({
                                subFolder: ['blocks'],
                                fileName: `${prefix}.[${slot}-${block}]`,
                                fileExt: 'html',
                                content: code,
                            });
                            delete slotObj.blocks[block].content;
                        }
                        if (slotObj.blocks[block].slots) {
                            // * recursion: each block can have slots of its own
                            this._extractCode_slots(
                                `${prefix}.[${slot}-${block}]`,
                                slotObj.blocks[block].slots,
                                codeArr
                            );
                        }
                    }
                }
            }
        }
    }
    /**
     * Returns file contents mapped to their fileName without '.json' ending
     * @param {string} dir directory that contains '.json' files to be read
     * @returns {Object} fileName => fileContent map
     */
    static getJsonFromFS(dir) {
        const fileName2FileContent = {};
        try {
            for (const subtype of this.definition.subTypes) {
                const currentdir = File.normalizePath([dir, subtype]);
                if (File.existsSync(currentdir)) {
                    const files = File.readdirSync(currentdir, { withFileTypes: true });

                    files.forEach((dirent) => {
                        try {
                            let thisDir = currentdir;
                            let fileName = dirent.name;
                            if (dirent.isDirectory()) {
                                // complex types with more than one extracted piece of code are saved in their
                                // own subfolder (with folder name = CustomerKey)
                                // this section aims to find that json in the subfolder
                                const subfolderFiles = File.readdirSync(
                                    File.normalizePath([currentdir, dirent.name])
                                );
                                subfolderFiles.forEach((subFileName) => {
                                    if (subFileName.endsWith('-meta.json')) {
                                        fileName = subFileName;
                                        thisDir = File.normalizePath([currentdir, dirent.name]);
                                    }
                                });
                            }
                            if (fileName.endsWith('-meta.json')) {
                                const fileContent = File.readJSONFile(
                                    thisDir,
                                    fileName,
                                    true,
                                    false
                                );
                                // subtype will change the metadata suffix length
                                const fileNameWithoutEnding = fileName.slice(
                                    0,
                                    -17 - subtype.length
                                );
                                fileName2FileContent[fileNameWithoutEnding] = fileContent;
                            }
                        } catch (ex) {
                            // by catching this in the loop we gracefully handle the issue and move on to the next file
                            Util.metadataLogger('debug', this.definition.type, 'getJsonFromFS', ex);
                        }
                    });
                }
            }
        } catch (ex) {
            // this will catch issues with readdirSync
            Util.metadataLogger('debug', this.definition.type, 'getJsonFromFS', ex);
            throw new Error(ex);
        }
        return fileName2FileContent;
    }
    /**
     * check template directory for complex types that open subfolders for their subtypes
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string} templateName name of the metadata file
     * @returns {AssetSubType} subtype name
     */
    static findSubType(templateDir, templateName) {
        const typeDirArr = [this.definition.type];
        let subType;
        for (const st of this.definition.subTypes) {
            const fileNameFull = templateName + '.' + this.definition.type + `-${st}-meta.json`;
            if (
                File.existsSync(
                    File.normalizePath([templateDir, ...typeDirArr, st, fileNameFull])
                ) ||
                File.existsSync(
                    File.normalizePath([templateDir, ...typeDirArr, st, templateName, fileNameFull])
                )
            ) {
                subType = st;
                break;
            }
        }
        if (!subType) {
            throw new Error(
                `Could not find asset with name ${templateName} in ${File.normalizePath([
                    templateDir,
                    ...typeDirArr,
                ])}`
            );
        }
        return subType;
    }
    /**
     * optional method used for some types to try a different folder structure
     * @param {string} templateDir Directory where metadata templates are stored
     * @param {string[]} typeDirArr current subdir for this type
     * @param {string} templateName name of the metadata template
     * @param {string} fileName name of the metadata template file w/o extension
     * @returns {AssetItem} metadata
     */
    static async readSecondaryFolder(templateDir, typeDirArr, templateName, fileName) {
        // handles subtypes that create 1 folder per asset -> currently causes the below File.ReadFile to error out
        typeDirArr.push(templateName);
        return await File.readFile([templateDir, ...typeDirArr], fileName, 'json');
    }
}

// Assign definition to static attributes
Asset.definition = require('../MetadataTypeDefinitions').asset;

module.exports = Asset;
