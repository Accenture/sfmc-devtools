'use strict';

const MetadataTypeInfo = require('./MetadataTypeInfo');
const path = require('path');
const Util = require('./util/util');
const File = require('./util/file');

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
     * @param {Object} buObject properties for auth
     * @param {String} buObject.clientId clientId for FuelSDK auth
     * @param {String} buObject.clientSecret clientSecret for FuelSDK auth
     * @param {Object} buObject.credential clientId for FuelSDK auth
     * @param {String} buObject.tenant v2 Auth Tenant Information
     * @param {String} buObject.mid ID of Business Unit to authenticate with
     * @param {String} buObject.businessUnit name of Business Unit to authenticate with
     * @param {Util.SDK} client fuel client
     * @param {String} [type] limit deployment to given metadata type
     */
    constructor(properties, buObject, client, type) {
        this.buObject = buObject;
        this.client = client;
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
        MetadataTypeInfo.folder.cache = this.cache;
        MetadataTypeInfo.folder.client = this.client;
        MetadataTypeInfo.folder.properties = this.properties;
        // Remove tmp folder of previous deploys
        File.removeSync('tmp');
        if (File.existsSync(this.deployDir)) {
            this.metadata = Deployer.readBUMetadata(this.deployDir, type);
        } else {
            this.metadata = null;
            Util.logger.warn(
                'Deployer.constructor:: Please create a directory called deploy and include your metadata in it: ./' +
                    this.deployDir
            );
        }
        this.cache = {};
    }
    /**
     * Deploy all metadata that is located in the deployDir
     * @returns {Promise} Promise
     */
    async deploy() {
        if (this.metadata === null || !Object.keys(this.metadata).length) {
            Util.logger.warn('No metadata found in deploy folder for selected BU');
            return null;
        }
        await Deployer.createFolderDefinitions(
            this.deployDir,
            this.metadata,
            Object.keys(this.metadata)
        );

        const deployOrder = Util.getMetadataHierachy(Object.keys(this.metadata));
        // build cache, including all metadata types which will be deployed (Avoids retrieve later)
        for (const metadataType of deployOrder) {
            const [type, subType] = metadataType.split('-');
            // add metadata & client to metadata process class instead of passing cache/mapping every time
            MetadataTypeInfo[type].cache = this.cache;
            MetadataTypeInfo[type].client = this.client;
            MetadataTypeInfo[type].properties = this.properties;
            Util.logger.info('Caching dependent Metadata: ' + metadataType);
            const result = await MetadataTypeInfo[type].retrieveForCache(this.buObject, subType);
            this.cache[type] = result.metadata;
        }
        // deploy metadata files, extending cache once deploys
        for (const metadataType of deployOrder) {
            // TODO rewrite to allow deploying only a specific sub-type
            // const [type, subType] = metadataType.split('-');
            const type = metadataType.split('-')[0];
            if (this.metadata[type]) {
                MetadataTypeInfo[type].cache = this.cache;
                Util.logger.info('Deploying: ' + metadataType);
                const result = await MetadataTypeInfo[type].deploy(
                    this.metadata[type],
                    this.deployDir,
                    this.retrieveDir,
                    this.buObject
                );
                this.cache[type] = Object.assign(this.cache[type], result);
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
                        // check if folder name is a valid metadataType, then check if the user limited to a certain type in the command params
                        buMetadata[metadataType] = MetadataTypeInfo[metadataType].getJsonFromFS(
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
     * @returns {void}
     */
    static async createFolderDefinitions(deployDir, metadata, metadataTypeArr) {
        let i = 0;
        const folderMetadata = {};
        metadataTypeArr.forEach((metadataType) => {
            if (!MetadataTypeInfo[metadataType].definition.dependencies.includes('folder')) {
                Util.logger.debug(
                    `_createFolderDefinitions(${metadataType}) - folder not a dependency`
                );
                return;
            }
            if (!MetadataTypeInfo[metadataType].definition.folderType) {
                Util.logger.debug(`_createFolderDefinitions(${metadataType}) - folderType not set`);
                return;
            }
            if (
                !MetadataTypeInfo.folder.definition.deployFolderTypes.includes(
                    MetadataTypeInfo[metadataType].definition.folderType
                )
            ) {
                Util.logger.warn(
                    `_createFolderDefinitions(${metadataType}: ${MetadataTypeInfo[metadataType].definition.folderType}) - folderType not supported for deployment`
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
            await MetadataTypeInfo.folder.saveResults(folderMetadata, deployDir, null);
            Util.logger.info(`Saved: folders in deploy dir`);

            // reload from file system to ensure we use the same logic for building the temporary JSON
            metadata.folder = MetadataTypeInfo.folder.getJsonFromFS(
                File.normalizePath([deployDir, 'folder'])
            );
        }
        return folderMetadata;
    }
}

module.exports = Deployer;
