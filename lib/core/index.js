const Util = require('../util/util');
const File = require('../util/file');
const { initSDK } = require('../util/auth');
const { initContext, context } = require('../util/context');

const MetadataRef = require('../metadataTypes');
const Retriever = require('./Retriever');
const Builder = require('./Builder');
const Deployer = require('./Deployer');

exports.retrieve = async (buObject, selectedType) => {
    // init context for global
    await initContext(buObject);
    const cred = buObject.credential;
    const bu = buObject.businessUnit;
    Util.logger.info(`\n:: Retrieving ${cred}/${bu}\n`);
    let retrieveTypesArr;
    const [type, subType] = selectedType ? selectedType.split('-') : [];
    if (
        type &&
        subType &&
        MetadataRef.getInfo(type) &&
        MetadataRef.getDefinition(type).subTypes.includes(subType)
    ) {
        // Clear output folder structure for selected sub-type
        File.removeSync(
            File.normalizePath([context.directories.retrieve, cred, bu, type, subType])
        );
        retrieveTypesArr = [selectedType];
    } else if (type && MetadataRef.getInfo(type)) {
        // Clear output folder structure for selected type
        File.removeSync(File.normalizePath([context.directories.retrieve, cred, bu, type]));
        retrieveTypesArr = [type];
    } else {
        // Clear output folder structure
        File.removeSync(File.normalizePath([context.directories.retrieve, cred, bu]));
        // assume no type was given and config settings are used instead:
        // removes subtypes and removes duplicates
        retrieveTypesArr = [
            ...new Set(context.metaDataTypes.retrieve.map((type) => type.split('-')[0])),
        ];
    }

    await initSDK(buObject.mid);

    const retriever = new Retriever(context, buObject);

    try {
        // await is required or the calls end up conflicting
        await retriever.retrieve(retrieveTypesArr, null, null);
        // todo rebuild document features
        // if (context.options.documentOnRetrieve) {
        //     // todo: find the underlying async issue that makes this wait necessary
        //     await new Promise((resolve) => {
        //         setTimeout(() => resolve('done!'), 1000);
        //     });
        //     await badKeys(`${cred}/${bu}`);
        // }
    } catch (ex) {
        Util.logger.error('mcdev.retrieve failed: ' + ex.message);
        Util.logger.debug(ex.stack);
        if (Util.logger.level === 'debug') {
            console.log(ex.stack);
        }
    }
};
/**
 * Retrieve a specific metadata file and templatise.
 * @param {Object} buObject properties for auth
 * @param {String} [buObject.mid] ID of Business Unit to authenticate with
 * @param {String} selectedType supported metadata type
 * @param {String} name name of the metadata
 * @param {String} market market which should be used to revert template
 * @returns {Promise<void>} -
 */
exports.retrieveAsTemplate = async (buObject, selectedType, name, market) => {
    Util.logger.info('mcdev:: Retrieve as Template');
    // init context for global
    await initContext(buObject);
    const [type, subType] = selectedType ? selectedType.split('-') : [];
    if (type && !MetadataRef.getInfo(type)) {
        Util.logger.error(`:: '${type}' is not a valid metadata type`);
        return;
    } else if (
        type &&
        subType &&
        (!MetadataRef.getInfo(type) || !MetadataRef.getDefinition(type).subTypes.includes(subType))
    ) {
        Util.logger.error(`:: '${selectedType}' is not a valid metadata type`);
        return;
    }

    let retrieveTypesArr;
    if (
        type &&
        subType &&
        MetadataRef.getInfo(type) &&
        MetadataRef.getDefinition(type).subTypes.includes(subType)
    ) {
        retrieveTypesArr = [selectedType];
    } else if (type && MetadataRef.getInfo(type)) {
        retrieveTypesArr = [type];
    }

    if (buObject !== null) {
        // init sdk
        await initSDK(buObject.mid);
        const retriever = new Retriever(global, buObject);
        if (Util.checkMarket(market)) {
            return retriever.retrieve(retrieveTypesArr, name, context.markets[market]);
        }
    }
};

/**
 * helper for deploy()
 * @param {Object} buObject properties for auth
 * @param {String} [buObject.mid] ID of Business Unit to authenticate with
 * @param {String} [type] limit deployment to given metadata type
 * @returns {Promise} ensure that BUs are worked on sequentially
 */
exports.deploy = async (buObject, type) => {
    // init context for global
    await initContext(buObject);
    if (buObject !== null) {
        // init sdk
        await initSDK(buObject.mid);
        const deployer = new Deployer(global, buObject, type);
        try {
            // await is required or the calls end up conflicting
            await deployer.deploy();
        } catch (ex) {
            Util.logger.error('mcdev.deploy failed: ' + ex.message);
            Util.logger.debug(ex.stack);
            if (Util.logger.level === 'debug') {
                console.log(ex.stack);
            }
        }
    }
};

/**
 * Creates docs for supported metadata types in Markdown and/or HTML format
 *
 * @param {String} businessUnit references credentials from properties.json
 * @param {String} type metadata type
 * @returns {Promise<void>} -
 */

exports.document = async (buObject, type) => {
    // init context for global
    await initContext(buObject);
    if (buObject !== null) {
        MetadataRef.getInfo(type).properties = global;
        MetadataRef.getInfo(type).document(buObject);
    }
};

/**
 * Build a specific metadata file based on a template.
 * @param {Object} buObject properties for auth
 * @param {String} [buObject.mid] ID of Business Unit to authenticate with
 * @param {String} type supported metadata type
 * @param {String} name name of the metadata
 * @param {String} market market localizations
 * @returns {Promise<void>} -
 */
exports.buildDefinition = async (buObject, type, name, market) => {
    // init context for global
    await initContext(buObject);
    if (buObject !== null) {
        const builder = new Builder(global, buObject, null);
        if (market === '*') {
            for (const oneMarket in context.markets) {
                builder.buildDefinition(type, name, context.markets[oneMarket]);
            }
        } else {
            if (Util.checkMarket(market)) {
                builder.buildDefinition(type, name, context.markets[market]);
            }
        }
    }
};

/**
 * Returns metadata of a business unit that is saved locally
 * @param {String} deployDir root directory of metadata.
 * @param {String} [type] limit deployment to given metadata type
 * @param {boolean} [listBadKeys=false] do not print errors, used for badKeys()
 * @returns {Object} Metadata of BU in local directory
 */
exports.readBUMetadata = (deployDir, type, listBadKeys) => {
    const buMetadata = {};
    try {
        if (File.existsSync(deployDir)) {
            const metadataTypes = File.readdirSync(deployDir);
            metadataTypes.forEach((metadataType) => {
                if (MetadataRef.getInfo(type) && (!type || type === metadataType)) {
                    // check if folder name is a valid metadataType, then check if the user limited to a certain type in the command params
                    buMetadata[metadataType] = MetadataRef.getInfo(type).getJsonFromFS(
                        File.normalizePath([deployDir, metadataType]),
                        listBadKeys
                    );
                }
            });

            return buMetadata;
        } else {
            throw new Error(`Directory '${deployDir}' does not exist.`);
        }
    } catch (ex) {
        throw new Error(ex.message);
    }
};
