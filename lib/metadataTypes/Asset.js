'use strict';

const MetadataType = require('./MetadataType');
const Util = require('../util/util');
const File = require('../util/file');
const bluebird = require('bluebird');
const cliProgress = require('cli-progress');
const Mustache = require('mustache');

/**
 * FileTransfer MetadataType
 * @augments MetadataType
 */
class Asset extends MetadataType {
    /**
     * Retrieves Metadata of Asset
     * @param {String} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void} _ -
     * @param {void} __ -
     * @param {String} [selectedSubType] optionally limit to a single subtype
     * @returns {Promise} Promise
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
     * @param {String} [selectedSubType] optionally limit to a single subtype
     * @returns {Promise} Promise
     */
    static retrieveForCache(_, selectedSubType) {
        return this.retrieve(null, null, null, selectedSubType);
    }

    /**
     * Retrieves asset metadata for caching
     * @param {String} templateDir Directory where retrieved metadata directory will be saved
     * @param {String} templateName name of the metadata file
     * @param {Object} templateVariables variables to be replaced in the metadata
     * @param {String} [selectedSubType] optionally limit to a single subtype
     * @returns {Promise} Promise
     */
    static async retrieveAsTemplate(templateDir, templateName, templateVariables, selectedSubType) {
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
                    templateName,
                    templateVariables
                ))
            );
        }
        const metadata = this.parseResponseBody({ items: items });
        Util.logger.info(`Downloaded: ${this.definition.type} (${Object.keys(metadata).length})`);

        return { metadata: metadata, type: this.definition.type };
    }
    /**
     * helper for retrieve + retrieveAsTemplate
     * @private
     * @returns {String[]} subtype array
     */
    static _getSubTypes() {
        if (this.properties.metaDataTypes.retrieve.includes('asset')) {
            // if "asset" is found in config assume to download the default subtypes only
            return this.definition.typeRetrieveByDefault;
        } else {
            return this.properties.metaDataTypes.retrieve
                .filter((type) => type.startsWith('asset-'))
                .map((type) => type.replace('asset-', ''));
        }
    }

    /**
     * Creates a single asset
     * @param {Object} metadata a single asset
     * @returns {Promise} Promise
     */
    static create(metadata) {
        const uri = '/asset/v1/content/assets/';
        return super.createREST(metadata, uri);
    }

    /**
     * Updates a single asset
     * @param {Object} metadata a single asset
     * @returns {Promise} Promise
     */
    static update(metadata) {
        const uri = '/asset/v1/content/assets/' + metadata.id;
        return super.updateREST(metadata, uri);
    }
    /**
     * Retrieves Metadata of a specific asset type
     * @param {String} subType group of similar assets to put in a folder (ie. images)
     * @param {Array} subTypeArray list of all asset types within this subtype
     * @param {String} [retrieveDir] target directory for saving assets
     * @param {String} [templateName] name of the metadata file
     * @param {Object} [templateVariables] variables to be replaced in the metadata
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
        const uri = 'asset/v1/content/assets/';
        const options = {
            data: {
                page: {
                    page: 1,
                    pageSize: 50,
                },
                query: null,
                fields: [],
            },
        };
        if (templateName) {
            options.data.query = {
                leftOperand: {
                    property: 'assetType.name',
                    simpleOperator: 'in',
                    value: subTypeArray,
                },
                logicalOperator: 'AND',
                rightOperand: {
                    property: 'name',
                    simpleOperator: 'equal',
                    value: templateName,
                },
            };
        } else {
            options.data.query = {
                property: 'assetType.name',
                simpleOperator: 'in',
                value: subTypeArray,
            };
            options.data.sort = [{ property: 'id', direction: 'ASC' }];
        }
        // for caching we do not need these fields
        if (retrieveDir) {
            options.data.fields = [
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
            options.data.page.page = lastPage + 1;
            const response = await this.client.rest.post(uri + 'query', options.data);
            if (response && response.body && response.items && response.items.length) {
                // sometimes the api will return a payload without items
                // --> ensure we only add proper items-arrays here
                items = items.concat(response.items);
            }
            // check if any more records
            if (response.message && response.message.includes('all shards failed')) {
                // When running certain filters, there is a limit of 10k on ElastiCache.
                // Since we sort by ID, we can get the last ID then run new requests from there
                options.data.query = {
                    leftOperand: {
                        property: 'assetType.name',
                        simpleOperator: 'in',
                        value: subTypeArray,
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
            // we have to wait on execution or it potentially causes memory reference issues when changing between BUs
            await this.requestAndSaveExtended(items, subType, retrieveDir, templateVariables);
        }
        return items;
    }
    /**
     * Retrieves extended metadata (files or extended content) of asset
     * @param {Array} items array of items to retrieve
     * @param {String} subType group of similar assets to put in a folder (ie. images)
     * @param {String} retrieveDir target directory for saving assets
     * @param {Object} [templateVariables] variables to be replaced in the metadata
     * @returns {Promise} Promise
     */
    static async requestAndSaveExtended(items, subType, retrieveDir, templateVariables) {
        const extendedBar = new cliProgress.SingleBar(
            { format: 'Processing [{bar}] {percentage}% | {value}/{total}' },
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
                        await Util.retryOnError(
                            `Retrying asset-${subType} ${item[this.definition.nameField]} (${
                                item[this.definition.keyField]
                            })`,
                            async () => {
                                const metadata = {};
                                // this is a file so extended is at another endpoint
                                if (
                                    item.fileProperties &&
                                    item.fileProperties.extension &&
                                    !completed.includes(item.id)
                                ) {
                                    metadata[item.customerKey] = item;
                                    if (templateVariables) {
                                        // do this here already because otherwise the extended file could be saved with wrong filename
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
                            true
                        );
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
     * @param {Object} metadata a single asset
     * @param {String} subType group of similar assets to put in a folder (ie. images)
     * @param {String} retrieveDir target directory for saving assets
     * @returns {Promise<void>} -
     */
    static async _retrieveExtendedFile(metadata, subType, retrieveDir) {
        const file = await this.client.rest.get('asset/v1/content/assets/' + metadata.id + '/file');

        // to handle uploaded files that bear the same name, SFMC engineers decided to add a number after the filename
        // however, their solution was not following standards: fileName="header.png (4) " and then extension="png (4) "
        const fileext = metadata.fileProperties.extension.split(' ')[0];

        File.writeToFile(
            [retrieveDir, this.definition.type, subType],
            metadata.customerKey,
            fileext,
            file,
            'base64'
        );
    }
    /**
     * helper for this.preDeployTasks()
     * Some metadata types store their actual content as a separate file, e.g. images
     * This method reads these from the local FS stores them in the metadata object allowing to deploy it
     * @param {Object} metadata a single asset
     * @param {String} subType group of similar assets to put in a folder (ie. images)
     * @param {String} deployDir directory of deploy files
     * @returns {Promise<void>} -
     */
    static async _readExtendedFileFromFS(metadata, subType, deployDir) {
        if (metadata.fileProperties && metadata.fileProperties.extension) {
            // to handle uploaded files that bear the same name, SFMC engineers decided to add a number after the filename
            // however, their solution was not following standards: fileName="header.png (4) " and then extension="png (4) "
            const fileext = metadata.fileProperties.extension.split(' ')[0];

            metadata.file = await File.readFile(
                [deployDir, this.definition.type, subType],
                metadata.customerKey,
                fileext,
                'base64'
            );
        }
    }
    /**
     * manages post retrieve steps
     * @param {Object} metadata a single asset
     * @param {String} [_] unused
     * @param {Boolean} isTemplating signals that we are retrieving templates
     * @returns {Object[]} metadata
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
     * @param {Object} metadata a single asset
     * @param {String} deployDir directory of deploy files
     * @returns {Promise} Promise
     */
    static async preDeployTasks(metadata, deployDir) {
        // additonalattributes fail where the value is "" so we need to remove them from deploy
        if (
            metadata.data &&
            metadata.data.email &&
            metadata.data.email &&
            metadata.data.email.attributes &&
            metadata.data.email.attributes.length > 0
        ) {
            metadata.data.email.attributes = metadata.data.email.attributes.filter(
                (attr) => attr.value
            );
        }

        // folder
        metadata.category = {
            id: Util.getFromCache(this.cache, 'folder', metadata.r__folder_Path, 'Path', 'ID'),
        };
        delete metadata.r__folder_Path;

        // restore asset type id which is needed for deploy
        metadata.assetType.id = this.definition.typeMapping[metadata.assetType.name];

        // define asset's subtype
        const subType = this.getSubtype(metadata);

        // #1 get text extracts back into the JSON
        await this._mergeCode(metadata, deployDir, subType);

        // #2 get file from local disk and insert as base64
        await this._readExtendedFileFromFS(metadata, deployDir, subType);

        return metadata;
    }
    /**
     * determines the subtype of the current asset
     * @param {Object} metadata a single asset
     * @returns {String} subtype
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
     * @param {String} templateDir Directory where metadata templates are stored
     * @param {String} targetDir Directory where built definitions will be saved
     * @param {Object} metadata main JSON file that was read from file system
     * @param {Object} variables variables to be replaced in the metadata
     * @param {String} templateName name of the template to be built
     * @returns {Promise} Promise
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
                    }: ${extractedFile.filename}.${extractedFile.fileext}.`
                );
            }
        }

        // #2 binary extracts
        if (metadata.fileProperties && metadata.fileProperties.extension) {
            // to handle uploaded files that bear the same name, SFMC engineers decided to add a number after the filename
            // however, their solution was not following standards: fileName="header.png (4) " and then extension="png (4) "
            const fileext = metadata.fileProperties.extension.split(' ')[0];

            const filecontent = await File.readFile(
                [templateDir, this.definition.type, subType],
                metadata.customerKey,
                fileext,
                'base64'
            );
            fileList.push({
                pathArr: [this.definition.type, subType],
                filename: metadata.customerKey,
                fileext: fileext,
                content: filecontent,
                encoding: 'base64',
            });
        }

        // write to file (#1 + #2)
        const targetDirArr = Array.isArray(targetDir) ? targetDir : [targetDir];
        for (const targetDir of targetDirArr) {
            for (const extractedFile of fileList) {
                File.writeToFile(
                    [targetDir, ...extractedFile.pathArr],
                    extractedFile.filename,
                    extractedFile.fileext,
                    extractedFile.content,
                    extractedFile.encoding || null
                );
            }
        }
    }

    /**
     * parses retrieved Metadata before saving
     * @param {Object} metadata a single asset definition
     * @returns {Object} parsed metadata definition
     */
    static parseMetadata(metadata) {
        // folder
        try {
            metadata.r__folder_Path = Util.getFromCache(
                this.cache,
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
     * @param {Object} metadata a single asset definition
     * @param {String} deployDir directory of deploy files
     * @param {String} subType asset-subtype name
     * @param {String} [templateName] name of the template used to built defintion (prior applying templating)
     * @returns {Promise<Object[]>} fileList for templating (disregarded during deployment)
     */
    static async _mergeCode(metadata, deployDir, subType, templateName) {
        const subtypeExtension = `.${this.definition.type}-${subType}-meta`;
        const fileList = [];
        let subDirArr;
        let readDirArr;

        switch (metadata.assetType.name) {
            case 'webpage': // asset
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
                    metadata.views.html.content = await File.readFile(
                        readDirArr,
                        'index' + subtypeExtension,
                        'html'
                    );

                    if (templateName) {
                        // to use this method in templating, store a copy of the info in fileList
                        fileList.push({
                            pathArr: [...subDirArr, metadata.customerKey],
                            filename: 'index' + subtypeExtension,
                            fileext: 'html',
                            content: metadata.views.html.content,
                        });
                    }
                }

                // metadata.views.html.slots.<>.blocks.<>.content (optional)
                if (metadata.views && metadata.views.html && metadata.views.html.slots) {
                    await this._mergeCode_slots(
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
                                templateName ? templateName : metadata.customerKey
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
                            pathArr: subDirArr,
                            filename: metadata.customerKey + subtypeExtension,
                            fileext: 'html',
                            content: metadata.views.text.content,
                        });
                    }
                }
                break;
            case 'freeformblock': // block
            case 'htmlblock': // block
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
                            pathArr: subDirArr,
                            filename: metadata.customerKey + subtypeExtension,
                            fileext: 'html',
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
     * @param {Object} metadataSlots metadata.views.html.slots or deeper slots.<>.blocks.<>.slots
     * @param {String[]} readDirArr directory of deploy files
     * @param {String} subtypeExtension asset-subtype name ending on -meta
     * @param {String[]} subDirArr directory of files w/o leading deploy dir
     * @param {Object[]} fileList directory of files w/o leading deploy dir
     * @param {String} customerKey external key of template (could have been changed if used during templating)
     * @param {String} [templateName] name of the template used to built defintion (prior applying templating)
     * @returns {Promise<void>} -
     */
    static async _mergeCode_slots(
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
                            const filename = `${slot}-${block}${subtypeExtension}`;
                            if (
                                File.existsSync(
                                    File.normalizePath([
                                        ...readDirArr,
                                        'blocks',
                                        `${filename}.html`,
                                    ])
                                )
                            ) {
                                // the main content can be empty (=not set up yet) hence check if we did extract sth or else readFile() will print error msgs
                                // if an extracted block was found, save it back into JSON
                                slotObj.blocks[block].content = await File.readFile(
                                    [...readDirArr, 'blocks'],
                                    filename,
                                    'html'
                                );
                                if (templateName) {
                                    // to use this method in templating, store a copy of the info in fileList
                                    fileList.push({
                                        pathArr: [...subDirArr, customerKey, 'blocks'],
                                        filename: filename,
                                        fileext: 'html',
                                        content: slotObj.blocks[block].content,
                                    });
                                }
                            }
                            if (slotObj.blocks[block].slots) {
                                // * recursion: each block can have slots of its own
                                await this._mergeCode_slots(
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
     * @param {Object} metadata a single asset definition
     * @returns {Object} { json: metadata, codeArr: object[], subFolder: string[] }
     */
    static _extractCode(metadata) {
        const codeArr = [];
        switch (metadata.assetType.name) {
            case 'webpage': // asset
            case 'templatebasedemail': // message
            case 'htmlemail': // message
                // metadata.views.html.content (mandatory)
                if (metadata.views.html.content && metadata.views.html.content.length) {
                    codeArr.push({
                        subFolder: null,
                        fileName: 'index',
                        fileExt: 'html',
                        content: metadata.views.html.content,
                    });
                    delete metadata.views.html.content;
                }

                // metadata.views.html.slots.<>.blocks.<>.content (optional)
                if (metadata.views && metadata.views.html && metadata.views.html.slots) {
                    this._extractCode_slots(metadata.views.html.slots, codeArr);
                }

                return { json: metadata, codeArr: codeArr, subFolder: [metadata.customerKey] };
            case 'textonlyemail': // message
                // metadata.views.text.content
                if (metadata.views.text.content && metadata.views.text.content.length) {
                    codeArr.push({
                        subFolder: null,
                        fileName: metadata.customerKey,
                        fileExt: 'html',
                        content: metadata.views.text.content,
                    });
                    delete metadata.views.text.content;
                }
                return { json: metadata, codeArr: codeArr, subFolder: null };
            case 'freeformblock': // block
            case 'htmlblock': // block
            case 'textblock': // block
            case 'smartcaptureblock': // other
            case 'codesnippetblock': // other
                // metadata.content
                if (metadata.content && metadata.content.length) {
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
                return { json: metadata, codeArr: codeArr, subFolder: null };
        }
    }
    /**
     * @param {Object} metadataSlots metadata.views.html.slots or deeper slots.<>.blocks.<>.slots
     * @param {Object[]} codeArr to be extended array for extracted code
     * @returns {void}
     */
    static _extractCode_slots(metadataSlots, codeArr) {
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
                                fileName: `${slot}-${block}`,
                                fileExt: 'html',
                                content: code,
                            });
                            delete slotObj.blocks[block].content;
                        }
                        if (slotObj.blocks[block].slots) {
                            // * recursion: each block can have slots of its own
                            this._extractCode_slots(slotObj.blocks[block].slots, codeArr);
                        }
                    }
                }
            }
        }
    }
    /**
     * Returns file contents mapped to their filename without '.json' ending
     * @param {String} dir directory that contains '.json' files to be read
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
                            let filename = dirent.name;
                            if (dirent.isDirectory()) {
                                // complex types with more than one extracted piece of code are saved in their
                                // own subfolder (with folder name = CustomerKey)
                                // this section aims to find that json in the subfolder
                                const subfolderFiles = File.readdirSync(
                                    File.normalizePath([currentdir, dirent.name])
                                );
                                subfolderFiles.forEach((subFileName) => {
                                    if (subFileName.endsWith('-meta.json')) {
                                        filename = subFileName;
                                        thisDir = File.normalizePath([currentdir, dirent.name]);
                                    }
                                });
                            }
                            if (filename.endsWith('-meta.json')) {
                                const fileContent = File.readJSONFile(
                                    thisDir,
                                    filename,
                                    true,
                                    false
                                );
                                // subtype will change the metadata suffix length
                                const fileNameWithoutEnding = filename.slice(
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
     * @param {String} templateDir Directory where metadata templates are stored
     * @param {String} templateName name of the metadata file
     * @returns {string} subtype name
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
     * @param {String} templateDir Directory where metadata templates are stored
     * @param {String[]} typeDirArr current subdir for this type
     * @param {String} templateName name of the metadata template
     * @param {String} fileName name of the metadata template file w/o extension
     * @returns {Object} metadata
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
