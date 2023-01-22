'use strict';

const TYPE = require('../types/mcdev.d');
const MetadataTypeInfo = require('./MetadataTypeInfo');
const path = require('node:path');
const Cli = require('./util/cli');
const Util = require('./util/util');
const File = require('./util/file');
const config = require('./util/config');
const cache = require('./util/cache');
const auth = require('./util/auth');

/**
 * Reads metadata from local directory and deploys it to specified target business unit.
 * Source and target business units are also compared before the deployment to apply metadata specific patches.
 */
class Deployer {
    /**
     * Creates a Deployer, uses v2 auth if v2AuthOptions are passed.
     *
     *
     * @param {TYPE.Mcdevrc} properties General configuration to be used in retrieve
     * @param {TYPE.BuObject} buObject properties for auth
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
        MetadataTypeInfo.folder.client = auth.getSDK(buObject);
        MetadataTypeInfo.folder.properties = this.properties;
        // Remove tmp folder of previous deploys
        File.removeSync('tmp');
    }
    /**
     * Deploys all metadata located in the 'deploy' directory to the specified business unit
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {TYPE.SupportedMetadataTypes[]} [selectedTypesArr] limit deployment to given metadata type
     * @param {string[]} [keyArr] limit deployment to given metadata keys
     * @param {boolean} [fromRetrieve] optionally deploy whats defined via selectedTypesArr + keyArr directly from retrieve folder instead of from deploy folder
     * @returns {Promise.<Object.<string,TYPE.MultiMetadataTypeMap>>} deployed metadata per BU (first key: bu name, second key: metadata type)
     */
    static async deploy(businessUnit, selectedTypesArr, keyArr, fromRetrieve) {
        Util.logger.info('mcdev:: Deploy');
        const buMultiMetadataTypeMap = {};
        const properties = await config.getProperties();
        if (!(await config.checkProperties(properties))) {
            return null;
        }
        if (fromRetrieve) {
            properties.directories.deploy = properties.directories.retrieve;
        }
        if (Array.isArray(selectedTypesArr)) {
            // types and keys can be provided but for each type all provided keys are applied as filter
            for (const selectedType of selectedTypesArr) {
                if (!Util._isValidType(selectedType)) {
                    return;
                }
            }
        }
        if (
            fromRetrieve &&
            (!selectedTypesArr ||
                !Array.isArray(selectedTypesArr) ||
                !selectedTypesArr.length ||
                !keyArr ||
                !Array.isArray(keyArr) ||
                !keyArr.length)
        ) {
            Util.logger.error('type & key need to be defined to deploy from retrieve folder');
            return;
        }
        let counter_credBu = 0;
        if (businessUnit === '*') {
            // all credentials and all BUs shall be deployed to
            const deployFolders = await File.readDirectories(
                properties.directories.deploy,
                2,
                false
            );

            for (const buPath of deployFolders.filter((r) => r.includes(path.sep))) {
                const [cred, bu] = buPath.split(path.sep);
                const multiMetadataTypeMap = await this._deployBU(
                    cred,
                    bu,
                    properties,
                    selectedTypesArr,
                    keyArr,
                    fromRetrieve
                );
                buMultiMetadataTypeMap[cred + '/' + bu] = multiMetadataTypeMap;
                counter_credBu++;
                Util.logger.info('');
                Util.restartLogger();
            }
        } else {
            // anything but "*" passed in
            let [cred, bu] = businessUnit ? businessUnit.split('/') : [null, null];

            // to allow all-BU via user selection we need to run this here already
            if (
                properties.credentials &&
                (!properties.credentials[cred] ||
                    (bu !== '*' && properties.credentials[cred].businessUnits[bu]))
            ) {
                const buObject = await Cli.getCredentialObject(
                    properties,
                    cred === null ? null : cred + '/' + bu,
                    null,
                    true
                );
                if (buObject === null) {
                    return;
                } else {
                    cred = buObject.credential;
                    bu = buObject.businessUnit;
                }
            }

            if (bu === '*' && properties.credentials && properties.credentials[cred]) {
                // valid credential given and -all- BUs targeted
                Util.logger.info(`\n               :: Deploying all BUs for ${cred}`);
                let counter_credBu = 0;
                // for (const bu in properties.credentials[cred].businessUnits) {
                const deployFolders = await File.readDirectories(
                    File.normalizePath([properties.directories.deploy, cred]),
                    1,
                    false
                );
                for (const buPath of deployFolders) {
                    const multiMetadataTypeMap = await this._deployBU(
                        cred,
                        buPath,
                        properties,
                        selectedTypesArr,
                        keyArr,
                        fromRetrieve
                    );
                    buMultiMetadataTypeMap[cred + '/' + buPath] = multiMetadataTypeMap;
                    counter_credBu++;
                    Util.logger.info('');
                    Util.restartLogger();
                }
                Util.logger.info(`\n               :: ${counter_credBu} BUs for ${cred}\n`);
            } else {
                // either bad credential or specific BU or no BU given
                const multiMetadataTypeMap = await this._deployBU(
                    cred,
                    bu,
                    properties,
                    selectedTypesArr,
                    keyArr,
                    fromRetrieve
                );
                counter_credBu++;
                buMultiMetadataTypeMap[cred + '/' + bu] = multiMetadataTypeMap;
            }
        }
        if (counter_credBu !== 0) {
            Util.logger.info(`\n               :: Deployed ${counter_credBu} BUs\n`);
        }
        return buMultiMetadataTypeMap;
    }
    /**
     * helper for {@link deploy}
     *
     * @param {string} cred name of Credential
     * @param {string} bu name of BU
     * @param {TYPE.Mcdevrc} properties General configuration to be used in retrieve
     * @param {TYPE.SupportedMetadataTypes[]} [typeArr] limit deployment to given metadata type
     * @param {string[]} [keyArr] limit deployment to given metadata keys
     * @param {boolean} [fromRetrieve] optionally deploy whats defined via selectedTypesArr + keyArr directly from retrieve folder instead of from deploy folder
     * @returns {Promise.<TYPE.MultiMetadataTypeMap>} ensure that BUs are worked on sequentially
     */
    static async _deployBU(cred, bu, properties, typeArr, keyArr, fromRetrieve) {
        const buPath = `${cred}/${bu}`;
        Util.logger.info(`::Deploying ${buPath}`);
        const buObject = await Cli.getCredentialObject(properties, buPath, null, true);
        let multiMetadataTypeMap;

        if (buObject !== null) {
            cache.initCache(buObject);
            const deployer = new Deployer(properties, buObject);
            try {
                // await is required or the calls end up conflicting
                multiMetadataTypeMap = await deployer._deploy(typeArr, keyArr, fromRetrieve);
            } catch (ex) {
                Util.logger.errorStack(ex, 'mcdev.deploy failed');
            }
        }
        return multiMetadataTypeMap;
    }

    /**
     * Deploy all metadata that is located in the deployDir
     *
     * @param {TYPE.SupportedMetadataTypes[]} [typeArr] limit deployment to given metadata type (can include subtype)
     * @param {string[]} [keyArr] limit deployment to given metadata keys
     * @param {boolean} [fromRetrieve] if true, no folders will be updated/created
     * @returns {Promise.<TYPE.MultiMetadataTypeMap>} Promise of all deployed metadata
     */
    async _deploy(typeArr, keyArr, fromRetrieve) {
        if (await File.pathExists(this.deployDir)) {
            /** @type {TYPE.MultiMetadataTypeMap} */
            this.metadata = Deployer.readBUMetadata(this.deployDir, typeArr);
            if (typeArr) {
                for (const selectedType of typeArr) {
                    const type = selectedType.split('-')[0];
                    this.metadata[type] = Util.filterObjByKeys(this.metadata[type], keyArr);
                }
            }
        } else {
            this.metadata = null;
            Util.logger.error(
                'Deployer.constructor:: Please create a directory called deploy and include your metadata in it: ./' +
                    this.deployDir
            );
        }
        if (this.metadata === null || !Object.keys(this.metadata).length) {
            Util.logger.error('No metadata found in deploy folder for selected BU');
            return null;
        }
        if (!fromRetrieve) {
            await Deployer.createFolderDefinitions(
                this.deployDir,
                this.metadata,
                Object.keys(this.metadata)
            );
        }
        const foundDeployTypes = Object.keys(this.metadata)
            .map((type) =>
                type === 'asset' && Util.includesStartsWith(typeArr, type)
                    ? typeArr[Util.includesStartsWithIndex(typeArr, type)]
                    : type
            )
            // remove empty types
            .filter((type) => Object.keys(this.metadata[type]).length);
        if (!foundDeployTypes.length) {
            throw new Error('No metadata found for deployment');
        }
        const deployOrder = Util.getMetadataHierachy(foundDeployTypes);
        // build cache, including all metadata types which will be deployed (Avoids retrieve later)
        for (const metadataType of deployOrder) {
            const [type, subType] = metadataType.split('-');
            // add metadata & client to metadata process class instead of passing cache/mapping every time
            MetadataTypeInfo[type].client = auth.getSDK(this.buObject);
            MetadataTypeInfo[type].properties = this.properties;
            MetadataTypeInfo[type].buObject = this.buObject;
            Util.logger.info('Caching dependent Metadata: ' + metadataType);
            const result = await MetadataTypeInfo[type].retrieveForCache(this.buObject, subType);
            cache.setMetadata(type, result.metadata);
        }
        /** @type {TYPE.MultiMetadataTypeMap} */
        const multiMetadataTypeMap = {};
        // deploy metadata files, extending cache once deploys
        for (const metadataType of deployOrder) {
            // TODO rewrite to allow deploying only a specific sub-type
            // const [type, subType] = metadataType.split('-');
            const type = metadataType.split('-')[0];
            if (this.metadata[type]) {
                Util.logger.info('Deploying: ' + metadataType);

                const result = await MetadataTypeInfo[type].deploy(
                    this.metadata[type],
                    this.deployDir,
                    this.retrieveDir,
                    this.buObject
                );
                multiMetadataTypeMap[type] = result;
                cache.mergeMetadata(type, result);
            }
        }
        return multiMetadataTypeMap;
    }

    /**
     * Returns metadata of a business unit that is saved locally
     *
     * @param {string} deployDir root directory of metadata.
     * @param {string[]} [typeArr] limit deployment to given metadata type
     * @param {boolean} [listBadKeys=false] do not print errors, used for badKeys()
     * @returns {TYPE.MultiMetadataTypeMap} Metadata of BU in local directory
     */
    static readBUMetadata(deployDir, typeArr, listBadKeys) {
        /** @type {TYPE.MultiMetadataTypeMap} */
        const buMetadata = {};
        try {
            File.ensureDirSync(deployDir);
            const metadataTypes = File.readdirSync(deployDir);
            for (const metadataType of metadataTypes) {
                if (
                    MetadataTypeInfo[metadataType] &&
                    (!typeArr || Util.includesStartsWith(typeArr, metadataType))
                ) {
                    // check if folder name is a valid metadataType, then check if the user limited to a certain type in the command params
                    buMetadata[metadataType] = MetadataTypeInfo[metadataType].getJsonFromFS(
                        File.normalizePath([deployDir, metadataType]),
                        listBadKeys,
                        typeArr
                    );
                }
            }
            if (Object.keys(buMetadata).length === 0) {
                throw new Error('No metadata found in deploy folder for selected BU & type');
            }
            return buMetadata;
        } catch (ex) {
            throw new Error(ex.message);
        }
    }

    /**
     * parses asset metadata to auto-create folders in target folder
     *
     * @param {string} deployDir root directory of metadata.
     * @param {TYPE.MultiMetadataTypeMap} metadata list of metadata
     * @param {TYPE.SupportedMetadataTypes[]} metadataTypeArr list of metadata types
     * @returns {void}
     */
    static async createFolderDefinitions(deployDir, metadata, metadataTypeArr) {
        let i = 0;
        const folderMetadata = {};
        const allowedDeFolderContentTypes = ['dataextension', 'shared_dataextension'];
        for (const metadataType of metadataTypeArr) {
            if (!MetadataTypeInfo[metadataType].definition.dependencies.includes('folder')) {
                Util.logger.debug(` ☇ skipping ${metadataType} folders: folder not a dependency`);
                continue;
            }
            if (!MetadataTypeInfo[metadataType].definition.folderType) {
                Util.logger.debug(` ☇ skipping ${metadataType} folders: folderType not set`);
                continue;
            }
            if (
                !MetadataTypeInfo.folder.definition.deployFolderTypes.includes(
                    MetadataTypeInfo[metadataType].definition.folderType
                )
            ) {
                Util.logger.warn(
                    ` ☇ skipping ${metadataType} folders: folderType ${MetadataTypeInfo[metadataType].definition.folderType} not supported for deployment. Please consider creating folders for this type manually as a pre-deployment step, if you see errors about missing dependent folders for this type later in this log.`
                );
                continue;
            }
            Util.logger.debug(
                ` - create ${metadataType} folders: Creating relevant folders in deploy dir`
            );

            const allFolders = Object.keys(metadata[metadataType])
                .filter(
                    // filter out root folders (which would not have a slash in their path)
                    (key) => metadata[metadataType][key].r__folder_Path.includes('/')
                )
                .filter(
                    // filter out dataExtension folders other than standard & shared (--> synchronized / salesforce are not allowed)
                    (key) =>
                        metadataType !== 'dataExtension' ||
                        allowedDeFolderContentTypes.includes(
                            metadata[metadataType][key].r__folder_ContentType
                        )
                )
                .map((key) => metadata[metadataType][key].r__folder_Path);

            // deduplicate
            const folderPathSet = new Set(allFolders);
            for (const item of [...folderPathSet].sort()) {
                let aggregatedPath = '';
                const parts = item.split('/');
                for (const pathElement of parts) {
                    if (aggregatedPath) {
                        aggregatedPath += '/';
                    }
                    aggregatedPath += pathElement;
                    folderPathSet.add(aggregatedPath);
                }
            }
            const folderPathArrExtended = [...folderPathSet]
                // strip root folders
                .filter((folderName) => folderName.includes('/'))
                .sort();

            for (const folder of folderPathArrExtended) {
                i++;
                let contentType = MetadataTypeInfo[metadataType].definition.folderType;
                if (
                    metadataType === 'dataExtension' &&
                    folder.startsWith('Shared Items/Shared Data Extensions')
                ) {
                    contentType = 'shared_dataextension';
                }
                folderMetadata[`on-the-fly-${i}`] = {
                    Path: folder,
                    Name: folder.split('/').pop(),
                    Description: '',
                    ContentType: contentType,
                    IsActive: true,
                    IsEditable: true,
                    AllowChildren: true,
                    _generated: true,
                };
            }
        }

        if (i > 0) {
            MetadataTypeInfo.folder.definition.fields._generated.retrieving = true; // ensure we keep that flag in deploy folder
            // await results to allow us to re-read it right after
            await MetadataTypeInfo.folder.saveResults(folderMetadata, deployDir, null);
            MetadataTypeInfo.folder.definition.fields._generated.retrieving = false; // reset flag
            Util.logger.info(`Created folders in deploy dir: ${i}`);

            // reload from file system to ensure we use the same logic for building the temporary JSON
            metadata.folder = MetadataTypeInfo.folder.getJsonFromFS(
                File.normalizePath([deployDir, 'folder'])
            );
        }
        return folderMetadata;
    }
}

module.exports = Deployer;
