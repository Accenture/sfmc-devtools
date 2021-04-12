'use strict';

const Util = require('./util/util');
const File = require('./util/file');
const Deployer = require('./Deployer');
const MetadataDefinitions = require('./MetadataTypeDefinitions');

/**
 * @ignore @typedef {import('sfmc-fuelsdk-node')} ET_Client
 */

const MetadataTypeInfo = require('./MetadataTypeInfo');
// @ts-ignore

/**
 * Builds metadata from a template using market specific customisation
 */
class ClassicMigration {
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
     * @param {ET_Client} client fuel client
     */
    constructor(properties, buObject, client) {
        this.buObject = buObject;
        this.client = client;
        this.properties = properties;
        this.dependentMetadata = ['folder', 'asset'];
        this.classicTypes = {
            email: { newType: 'asset', overrideType: 'asset-message', needsMapping: false },
            contentArea: { newType: 'asset', overrideType: 'asset-other', needsMapping: true },
        };
        this.newTypes = ['asset'];
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
        if (File.existsSync(this.retrieveDir)) {
            Util.logger.info(
                `Searching for classic content (${Object.keys(this.classicTypes).join(', ')}) in ${
                    this.retrieveDir
                } - please wait`
            );

            this.metadata = {};
            Object.keys(this.classicTypes).forEach((type) => {
                const temp = Deployer.readBUMetadata(this.retrieveDir, type);
                this.metadata[type] = temp[type];
                Util.logger.info(
                    `Found ${
                        this.metadata[type] ? Object.keys(temp[type]).length : 0
                    } Classic ${type}s`
                );
            });
            Util.logEvent(
                'migrate',
                buObject.credential + '/' + buObject.businessUnit,
                properties,
                Object.keys(this.metadata)
            );
        } else {
            this.metadata = null;
            Util.logger.warn(
                'Please create a retrieve directory and make sure to retrieve your BU first: ./' +
                    this.retrieveDir
            );
        }
        this.cache = {};
    }
    /**
     * convert all classic metadata that is located in the retrieveDir
     * FIXED: Error 'Asset names within a category and asset type must be unique.'
     * TODO: Error 'Customer Key must be unique, Customer key already exist with same name'
     * ! We have to map old names (which are unique per folder) to content builder where names on top are also unique per type. means, you could have teh same name twice, if the type is different AND if they are saved in 2 different folders... confusing.
     * ! Also, customer keys have to be unique ACROSS business units - but we can only retrieve those visible to the current BU...
     * @returns {Promise} Promise
     */
    async convert() {
        if (this.metadata === null || !Object.keys(this.metadata).length) {
            Util.logger.warn('No metadata found in deploy folder for selected BU');
            return null;
        }
        // because we want to cache only specific asset subtypes, lets ensure we truncate our config temporarily here
        this.properties.metaDataTypes.retrieve.length = 0;
        // make sure that the new type is listed as dependency to check if there are any updates to be expected
        Object.keys(this.metadata).forEach((type) => {
            MetadataDefinitions[type].dependencies.push(this.classicTypes[type].newType);
            if (this.classicTypes[type].overrideType) {
                this.properties.metaDataTypes.retrieve.push(this.classicTypes[type].overrideType);
            }
        });

        const deployOrder = Util.getMetadataHierachy([...Object.keys(this.metadata)]);
        // build cache, including all metadata types which will be deployed (Avoids retrieve later)
        for (const metadataType of this.dependentMetadata) {
            // add metadata & client to metadata process class instead of passing cache/mapping every time
            MetadataTypeInfo[metadataType].cache = this.cache;
            MetadataTypeInfo[metadataType].client = this.client;
            MetadataTypeInfo[metadataType].properties = this.properties;
            if (!this.classicTypes[metadataType]) {
                // only execute for non-classic types
                Util.logger.info('Caching dependent Metadata: ' + metadataType);
                const result = await MetadataTypeInfo[metadataType].retrieveForCache(this.buObject);
                this.cache[metadataType] = result.metadata;
            }
        }
        const mapping = {};
        const convertedMetadata = {};

        // deploy metadata files, extending cache once deploys
        for (const metadataType of deployOrder) {
            // let result;
            if (this.metadata[metadataType]) {
                const nameSafe = {};
                convertedMetadata[metadataType] = {};
                if (this.classicTypes[metadataType].needsMapping) {
                    mapping[metadataType] = { key: {}, pathName: {}, id: {} };
                }
                MetadataTypeInfo[metadataType].cache = this.cache;
                Util.logger.info(
                    `Converting: ${metadataType} (${
                        Object.keys(this.metadata[metadataType]).length
                    })`
                );
                let convertedCounter = 0;
                for (const key in this.metadata[metadataType]) {
                    const element = this.metadata[metadataType][key];
                    try {
                        await MetadataTypeInfo[metadataType].preDeployTasks(
                            element,
                            this.retrieveDir
                        );
                        const convertedItem = MetadataTypeInfo[metadataType].convert(
                            element,
                            nameSafe
                        );
                        convertedMetadata[metadataType][convertedItem.key] = convertedItem.metadata;
                        // save mappings
                        if (convertedItem.mapping !== null) {
                            mapping[metadataType].key[convertedItem.mapping.key] =
                                convertedItem.key;
                            mapping[metadataType].pathName[convertedItem.mapping.pathName] =
                                convertedItem.key;
                            mapping[metadataType].id[convertedItem.mapping.id] = convertedItem.key;
                        }
                        convertedCounter++;
                    } catch (ex) {
                        Util.logger.error(ex.message);
                    }
                }
                Util.logger.info(
                    `Saving: ${metadataType} as ${
                        this.classicTypes[metadataType].overrideType ||
                        this.classicTypes[metadataType].newType
                    } (${convertedCounter}) - please wait`
                );
                try {
                    // wait for results to improve log output
                    // !dont activate `await File.initPrettier('html');` formatting is done if needed by user in VSCode
                    await MetadataTypeInfo[this.classicTypes[metadataType].newType].saveResults(
                        convertedMetadata[metadataType],
                        this.deployDir,
                        this.classicTypes[metadataType].overrideType
                    );
                    Util.logger.info(
                        `Saved: ${metadataType} as ${
                            this.classicTypes[metadataType].overrideType ||
                            this.classicTypes[metadataType].newType
                        } to ${
                            Array.isArray(this.properties.directories.templateBuilds)
                                ? this.properties.directories.templateBuilds.join(' & ')
                                : this.properties.directories.templateBuilds
                        }`
                    );
                } catch (ex) {
                    Util.logger.error(ex.message);
                }
            }
        }
        if (Object.keys(mapping).length) {
            try {
                File.writeJSONToFile(this.deployDir, 'convertClassic.mapping-table', mapping);
                Util.logger.info(
                    `Saved ID/Key/Name Mapping for reference: ${File.normalizePath([
                        this.deployDir,
                        'convertClassic.mapping-table.json',
                    ])}`
                );
            } catch (ex) {
                Util.logger.error(ex.message);
            }
        }
    }
}

module.exports = ClassicMigration;
