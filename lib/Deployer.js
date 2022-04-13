'use strict';

const MetadataTypeInfo = require('./MetadataTypeInfo');
const MetadataTypeDefinitions = require('./MetadataTypeDefinitions');
const path = require('path');
const Util = require('./util/util');
const File = require('./util/file');
const cache = require('./util/cache');

/**
 * Reads metadata from local directory and deploys it to specified target business unit.
 * Source and target business units are also compared before the deployment to apply metadata specific patches.
 */
class Deployer {
    /**
     * Creates a Deployer, uses v2 auth if v2AuthOptions are passed.
     *
     *
     * @param {Object} properties General configuration to be used in retrieve
     * @param {Object} properties.directories Directories to be used when interacting with FS
     * @param {auth.BuObject} buObject details of business unit in processing

     */
    constructor(properties, buObject) {
        this.buObject = buObject;
        this.properties = properties;
        this.deployDir = File.normalizePath([
            properties.directories.deploy,
            buObject.credential,
            buObject.businessUnit,
        ]);
        this.retrieveDir = File.normalizePath([
            properties.directories.retrieve,
            buObject.credential,
            buObject.businessUnit,
        ]);
        // prep folders for auto-creation
        // TODO consider if this is needed
        // const FolderClass = require('./metadataTypes/Folder');
        // const folderInstance = new FolderClass(this.properties, buObject);
        // Remove tmp folder of previous deploys
        // TODO load deployable here
    }
    /**
     * Deploy all metadata that is located in the deployDir
     * @param {String} [type] limit deployment to given metadata type
     * @returns {Promise} Promise
     */
    async deploy(type) {
        // TODO confirm deployable can be done here
        let deployableMetadata;
        File.removeSync('tmp');
        if (File.existsSync(this.deployDir)) {
            deployableMetadata = Deployer.readBUMetadata(this.deployDir, type);
        } else {
            deployableMetadata = null;
            Util.logger.warn(
                'Deployer.constructor:: Please create a directory called deploy and include your metadata in it: ./' +
                    this.deployDir
            );
        }
        // TODO ensure metadata is null if empty
        if (deployableMetadata === null || !Object.keys(deployableMetadata).length) {
            Util.logger.warn('No metadata found in deploy folder for selected BU');
            return null;
        }
        const folderInstance = require(`./metadataTypes/Folder`);
        await Deployer.createFolderDefinitions(
            this.deployDir,
            deployableMetadata,
            Object.keys(deployableMetadata),
            folderInstance
        );

        const deployOrder = Util.getMetadataHierachy(Object.keys(deployableMetadata));
        const instanceMap = { folder: folderInstance };
        // build cache, including all metadata types which will be deployed (Avoids retrieve later)
        for (const metadataType of deployOrder) {
            const [type, subType] = metadataType.split('-');
            // skip folder type which is already instantiated
            if (!instanceMap[type]) {
                // add metadata & client to metadata process class instead of passing cache/mapping every time
                const MetadataClass = require(`./metadataTypes/${
                    type.charAt(0).toUpperCase() + type.slice(1)
                }`);
                instanceMap[type] = new MetadataClass(this.properties, this.buObject);
            }

            Util.logger.info('Caching dependent Metadata: ' + metadataType);
            const result = await instanceMap[type].retrieveForCache(subType);
            cache.setMetadata(type, result.metadata);
        }
        // deploy metadata files, extending cache once deploys
        // TODO confirm if this needs to be in a different group after changes to caching
        for (const metadataType of deployOrder) {
            // TODO rewrite to allow deploying only a specific sub-type
            // const [type, subType] = metadataType.split('-');
            const type = metadataType.split('-')[0];
            if (deployableMetadata[type]) {
                Util.logger.info('Deploying: ' + metadataType);
                const result = await instanceMap[type].deploy(
                    deployableMetadata[type],
                    this.deployDir,
                    this.retrieveDir
                );
                cache.mergeMetadata(type, result);
                this.deployCallback(result, type);
            }
        }
    }

    /**
     * Gets called for every deployed metadata entry
     * @param {Object} result Deployment result
     * @param {String} metadataType Name of metadata type
     * @returns {void}
     */
    deployCallback(result, metadataType) {
        if (result) {
            File.writeJSONToFile('logs/', 'deployResult_' + metadataType, result);
            Util.logger.verbose(
                'Deployer.deployCallback:: Results written to: ' +
                    path.normalize(process.cwd() + '/logs/deployResult_' + metadataType + '.json')
            );
        }
    }

    /**
     * Returns metadata of a business unit that is saved locally
     * @param {String} deployDir root directory of metadata.
     * @param {String} [type] limit deployment to given metadata type
     * @param {boolean} [listBadKeys=false] do not print errors, used for badKeys()
     * @returns {Object} Metadata of BU in local directory
     */
    static readBUMetadata(deployDir, type, listBadKeys) {
        const buMetadata = {};
        try {
            if (File.existsSync(deployDir)) {
                const metadataTypes = File.readdirSync(deployDir);
                metadataTypes.forEach((metadataType) => {
                    if (MetadataTypeInfo[metadataType] && (!type || type === metadataType)) {
                        const MetadataClass = require(`./metadataTypes/${
                            type.charAt(0).toUpperCase() + type.slice(1)
                        }`);
                        const metadataInstance = new MetadataClass(this.properties, this.buObject);
                        // check if folder name is a valid metadataType, then check if the user limited to a certain type in the command params
                        buMetadata[metadataType] = metadataInstance.getJsonFromFS(
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
    }

    /**
     * parses asset metadata to auto-create folders in target folder
     * @param {String} deployDir root directory of metadata.
     * @param {Object} metadata list of metadata
     * @param {String} metadataTypeArr list of metadata types
     * @param {Folder} folderInstance instance of Folder metadata class
     * @returns {void}
     */
    static async createFolderDefinitions(deployDir, metadata, metadataTypeArr, folderInstance) {
        let i = 0;
        const folderMetadata = {};
        metadataTypeArr.forEach((metadataType) => {
            if (!MetadataTypeDefinitions[metadataType].dependencies.includes('folder')) {
                Util.logger.debug(
                    `_createFolderDefinitions(${metadataType}) - folder not a dependency`
                );
                return;
            }
            if (!MetadataTypeDefinitions[metadataType].folderType) {
                Util.logger.debug(`_createFolderDefinitions(${metadataType}) - folderType not set`);
                return;
            }
            if (
                !MetadataTypeDefinitions.folder.deployFolderTypes.includes(
                    MetadataTypeDefinitions[metadataType].folderType
                )
            ) {
                Util.logger.warn(
                    `_createFolderDefinitions(${metadataType}: ${MetadataTypeDefinitions[metadataType].folderType}) - folderType not supported for deployment`
                );
                return;
            }
            Util.logger.debug(`Creating relevant folders for ${metadataType} in deploy dir`);

            let allFolders = Object.keys(metadata[metadataType]).filter(
                // filter out root folders (which would not have a slash in their path)
                (key) => metadata[metadataType][key].r__folder_Path.includes('/')
            );
            if (metadataType === 'dataExtension') {
                allFolders = allFolders
                    .filter(
                        // filter out any shared / synchronized / salesforce folders
                        (key) =>
                            metadata[metadataType][key].r__folder_ContentType === 'dataextension'
                    )
                    .map((key) => metadata[metadataType][key].r__folder_Path);
            } else {
                allFolders = allFolders.map((key) => metadata[metadataType][key].r__folder_Path);
            }
            // deduplicate
            const folderPathSet = new Set(allFolders);
            [...folderPathSet].sort().forEach((item) => {
                let aggregatedPath = '';
                const parts = item.split('/');
                parts.forEach((pathElement) => {
                    if (aggregatedPath) {
                        aggregatedPath += '/';
                    }
                    aggregatedPath += pathElement;
                    folderPathSet.add(aggregatedPath);
                });
            });
            const folderPathArrExtended = [...folderPathSet]
                // strip root folders
                .filter((folderName) => folderName.includes('/'))
                .sort();

            folderPathArrExtended.forEach((folder) => {
                i++;
                folderMetadata[`on-the-fly-${i}`] = {
                    Path: folder,
                    Name: folder.split('/').pop(),
                    Description: '',
                    ContentType: MetadataTypeInfo[metadataType].definition.folderType,
                    IsActive: 'true',
                    IsEditable: 'true',
                    AllowChildren: 'true',
                };
            });
        });

        if (i > 0) {
            Util.logger.info(`Saving folders to deploy dir (${i}) - please wait`);

            // await results to allow us to re-read it right after
            await folderInstance.saveResults(folderMetadata, deployDir, null);
            Util.logger.info(`Saved: folders in deploy dir`);

            // reload from file system to ensure we use the same logic for building the temporary JSON
            metadata.folder = folderInstance.getJsonFromFS(
                File.normalizePath([deployDir, 'folder'])
            );
        }
        return folderMetadata;
    }
}

module.exports = Deployer;
